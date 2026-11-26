package com.premium.app;

import android.Manifest;
import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Environment;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

/**
 * BackgroundDownload — APK download Android ke system DownloadManager se.
 *
 * Kyun DownloadManager (Filesystem.downloadFile ki jagah)?
 * - Download app ke process se bahar, system service me chalta hai — user
 *   app band kar de ya Home dabaye, download rukta nahi.
 * - Notification shade me system ki apni notification dikhti hai — live %
 *   ke saath, bilkul Play Store jaisi. Download pura hote hi notification
 *   par tap karte hi installer khul jata hai.
 * - File public Downloads folder me jati hai, user ko Files app me bhi milti hai.
 *
 * Register: MainActivity.onCreate() me super.onCreate() SE PEHLE
 * registerPlugin(BackgroundDownloadPlugin.class) — bridge banne ke baad
 * register karne par plugin WebView ko dikhta hi nahi.
 * File repo me native/BackgroundDownloadPlugin.java me hai; workflow
 * (build-apk.yml, "Add background download plugin" step) ise android/
 * project me copy karta hai. android/ CI me generate hota hai, isliye
 * plugin ka source yahin repo me rehta hai.
 */
@CapacitorPlugin(
    name = "BackgroundDownload",
    permissions = @Permission(
        alias = "notifications",
        strings = { Manifest.permission.POST_NOTIFICATIONS }
    )
)
public class BackgroundDownloadPlugin extends Plugin {

    private static final String APK_MIME = "application/vnd.android.package-archive";

    private DownloadManager downloadManager() {
        return (DownloadManager) getContext().getSystemService(Context.DOWNLOAD_SERVICE);
    }

    private static String statusName(int status) {
        switch (status) {
            case DownloadManager.STATUS_PENDING: return "pending";
            case DownloadManager.STATUS_RUNNING: return "running";
            case DownloadManager.STATUS_PAUSED: return "paused";
            case DownloadManager.STATUS_SUCCESSFUL: return "successful";
            case DownloadManager.STATUS_FAILED: return "failed";
            default: return "unknown";
        }
    }

    /** Notification permission mili hui hai ya nahi — Android 13 se neeche hamesha true. */
    @PluginMethod
    public void isNotificationPermissionGranted(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("granted", isNotifGranted());
        call.resolve(ret);
    }

    /**
     * Notification permission maango (system dialog). Pehle ek baar mana
     * karne par bhi dobara poochta hai — lekin Android do baar mana karne
     * ke baad dialog dikhana band kar deta hai, tab user ko Settings se
     * on karna padta hai. Download bina permission ke bhi chalta hai,
     * sirf % wali notification nahi dikhti.
     */
    @PluginMethod
    public void requestNotificationPermission(PluginCall call) {
        if (isNotifGranted()) {
            JSObject ret = new JSObject();
            ret.put("granted", true);
            call.resolve(ret);
            return;
        }
        requestPermissionForAlias("notifications", call, "notifPermCallback");
    }

    @PermissionCallback
    private void notifPermCallback(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("granted", isNotifGranted());
        call.resolve(ret);
    }

    private boolean isNotifGranted() {
        if (android.os.Build.VERSION.SDK_INT < 33) return true;
        return hasPermission("notifications");
    }

    /** Download shuru karo — turant downloadId milta hai, download background me chalta hai. */
    @PluginMethod
    public void download(PluginCall call) {
        String url = call.getString("url");
        String fileName = call.getString("fileName");
        String title = call.getString("title", fileName);
        String description = call.getString("description", "Apna Jugaad se download ho raha hai");
        if (url == null || url.isEmpty() || fileName == null || fileName.isEmpty()) {
            call.reject("url aur fileName chahiye");
            return;
        }
        try {
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
            request.setTitle(title);
            request.setDescription(description);
            request.setAllowedOverMetered(true);
            request.setAllowedOverRoaming(true);
            // VISIBILITY_VISIBLE = download chalte hue shade me live % dikhe,
            // pura hote hi "download complete" notification bhi aaye.
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE);
            request.setVisibleInDownloadsUi(true);
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName);
            request.setMimeType(APK_MIME);

            long id = downloadManager().enqueue(request);
            JSObject ret = new JSObject();
            ret.put("downloadId", id);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Download start nahi hua: " + e.getMessage());
        }
    }

    /** Ek download ki halat — bytes, total, status, fail hone par reason code. */
    @PluginMethod
    public void getStatus(PluginCall call) {
        long id = call.getData().optLong("downloadId", -1);
        if (id < 0) {
            call.reject("downloadId chahiye");
            return;
        }
        try {
            DownloadManager.Query query = new DownloadManager.Query();
            query.setFilterById(id);
            Cursor cursor = downloadManager().query(query);
            if (cursor == null || !cursor.moveToFirst()) {
                if (cursor != null) cursor.close();
                call.reject("download nahi mila");
                return;
            }
            JSObject ret = readStatusRow(cursor);
            cursor.close();
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Status nahi mil paya: " + e.getMessage());
        }
    }

    /**
     * File naam se download dhoondo — app dobara khule to pata chale ki ye
     * file pehle se download ho rahi hai ya ho chuki hai (dobara download nahi).
     */
    @PluginMethod
    public void findByFileName(PluginCall call) {
        String fileName = call.getString("fileName");
        if (fileName == null || fileName.isEmpty()) {
            call.reject("fileName chahiye");
            return;
        }
        JSObject ret = new JSObject();
        ret.put("found", false);
        try {
            Cursor cursor = downloadManager().query(new DownloadManager.Query());
            if (cursor == null) {
                call.resolve(ret);
                return;
            }
            // Sabse naya (sabse bada id) match lo — purana failed entry nahi.
            long bestId = -1;
            JSObject best = null;
            while (cursor.moveToNext()) {
                String localUri = stringCol(cursor, DownloadManager.COLUMN_LOCAL_URI);
                String title = stringCol(cursor, DownloadManager.COLUMN_TITLE);
                boolean match = (localUri != null && localUri.endsWith("/" + fileName))
                        || fileName.equals(title);
                if (!match) continue;
                long id = cursor.getLong(cursor.getColumnIndex(DownloadManager.COLUMN_ID));
                if (id > bestId) {
                    bestId = id;
                    best = readStatusRow(cursor);
                }
            }
            cursor.close();
            if (best != null) {
                ret.put("found", true);
                ret.put("downloadId", bestId);
                ret.put("status", best.getString("status"));
                ret.put("downloadedBytes", best.getInteger("downloadedBytes"));
                ret.put("totalBytes", best.getInteger("totalBytes"));
            }
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Download dhoond nahi paye: " + e.getMessage());
        }
    }

    /** Download pura hone par system installer kholo (DownloadManager ki file URI se). */
    @PluginMethod
    public void openFile(PluginCall call) {
        long id = call.getData().optLong("downloadId", -1);
        if (id < 0) {
            call.reject("downloadId chahiye");
            return;
        }
        try {
            Uri uri = downloadManager().getUriForDownloadedFile(id);
            if (uri == null) {
                call.reject("File abhi ready nahi hai");
                return;
            }
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(uri, APK_MIME);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Installer nahi khul paya: " + e.getMessage());
        }
    }

    /** Chal raha download roko + uski entry/file hatao (retry se pehle kaam aata hai). */
    @PluginMethod
    public void cancel(PluginCall call) {
        long id = call.getData().optLong("downloadId", -1);
        if (id < 0) {
            call.reject("downloadId chahiye");
            return;
        }
        try {
            downloadManager().remove(id);
            call.resolve();
        } catch (Exception e) {
            call.reject("Cancel nahi hua: " + e.getMessage());
        }
    }

    private static String stringCol(Cursor cursor, String name) {
        int idx = cursor.getColumnIndex(name);
        return idx < 0 ? null : cursor.getString(idx);
    }

    private static JSObject readStatusRow(Cursor cursor) {
        JSObject ret = new JSObject();
        int statusIdx = cursor.getColumnIndex(DownloadManager.COLUMN_STATUS);
        int downloadedIdx = cursor.getColumnIndex(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR);
        int totalIdx = cursor.getColumnIndex(DownloadManager.COLUMN_TOTAL_SIZE_BYTES);
        int reasonIdx = cursor.getColumnIndex(DownloadManager.COLUMN_REASON);
        int uriIdx = cursor.getColumnIndex(DownloadManager.COLUMN_LOCAL_URI);
        int status = statusIdx >= 0 ? cursor.getInt(statusIdx) : -1;
        ret.put("status", statusName(status));
        ret.put("downloadedBytes", downloadedIdx >= 0 ? cursor.getLong(downloadedIdx) : 0);
        ret.put("totalBytes", totalIdx >= 0 ? cursor.getLong(totalIdx) : -1);
        ret.put("reason", reasonIdx >= 0 ? cursor.getInt(reasonIdx) : 0);
        if (uriIdx >= 0 && cursor.getString(uriIdx) != null) {
            ret.put("localUri", cursor.getString(uriIdx));
        }
        return ret;
    }
}
