import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  X,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Lock,
  Wand2,
  Save,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Power
} from 'lucide-react';
import { AppItem, StoreStatus } from '../types';
import {
  saveAppStrict,
  deleteAppFromStore,
  getAdminPinHash,
  setAdminPinHash,
  sha256Hex,
  getAppKey,
  setStoreStatus
} from '../services/firebase';
import { fetchReleaseAssetInfo } from '../services/githubApps';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  apps: AppItem[];
  releaseIds: string[];
  hiddenApps: AppItem[];
  onHideRelease: (app: AppItem) => void;
  onUnhideRelease: (app: AppItem) => void;
  storeStatus: StoreStatus;
  theme: 'dark' | 'light';
}

type Stage = 'checking' | 'setup' | 'locked' | 'unlocked';
type Toast = { kind: 'ok' | 'warn' | 'err'; text: string } | null;

const EMPTY_FORM = {
  name: '',
  cat: 'Apps',
  ver: '',
  mb: '',
  link: '',
  icon: '',
  desc: '',
  screenshotsText: '',
  isFeatured: false,
  isHot: false
};

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  apps,
  releaseIds,
  hiddenApps,
  onHideRelease,
  onUnhideRelease,
  storeStatus,
  theme
}) => {
  const dark = theme === 'dark';
  const [stage, setStage] = useState<Stage>('checking');
  const [view, setView] = useState<'list' | 'form'>('list');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinNote, setPinNote] = useState('');
  const storedHash = useRef<string | null>(null);

  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<AppItem | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [toast, setToast] = useState<Toast>(null);
  const [saving, setSaving] = useState(false);
  const [autofilling, setAutofilling] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Kill switch / announcement (Store Control)
  const [statusForm, setStatusForm] = useState<StoreStatus>({ active: true, msg: '', link: '' });
  const [statusSaving, setStatusSaving] = useState(false);
  const [confirmKill, setConfirmKill] = useState(false);

  // Modal khulte hi PIN ki sthiti check karo (server par hai ya pehli baar banana hai)
  useEffect(() => {
    if (!isOpen) return;
    setStage('checking');
    setView('list');
    setToast(null);
    setPin('');
    setPinConfirm('');
    setPinError('');
    setPinNote('');
    setSearch('');
    setConfirmDeleteId(null);
    setStatusForm({
      active: storeStatus?.active !== false,
      msg: storeStatus?.msg || '',
      link: storeStatus?.link || ''
    });
    setConfirmKill(false);
    (async () => {
      const cloud = await getAdminPinHash().catch(() => null);
      let local: string | null = null;
      try {
        local = localStorage.getItem('premium_store_admin_pin');
      } catch (e) {}
      storedHash.current = cloud || local;
      setStage(storedHash.current ? 'locked' : 'setup');
    })();
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (kind: 'ok' | 'warn' | 'err', text: string) => {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 4200);
  };

  const handleSetupPin = async () => {
    if (pin.length < 4) {
      setPinError('PIN kam se kam 4 number ka rakho.');
      return;
    }
    if (pin !== pinConfirm) {
      setPinError('Dono PIN ek jaise nahi hain.');
      return;
    }
    const hash = await sha256Hex(pin);
    const savedCloud = await setAdminPinHash(hash).catch(() => false);
    if (savedCloud) {
      storedHash.current = hash;
      setPinNote('PIN server par save ho gaya — kisi bhi phone se chalega.');
    } else {
      try {
        localStorage.setItem('premium_store_admin_pin', hash);
      } catch (e) {}
      storedHash.current = hash;
      setPinNote('PIN sirf is phone par save hua hai.');
    }
    setPinError('');
    setStage('unlocked');
  };

  const handleUnlock = async () => {
    const hash = await sha256Hex(pin);
    if (hash === storedHash.current) {
      setPinError('');
      setStage('unlocked');
    } else {
      setPinError('Galat PIN. Dobara try karo.');
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setView('form');
  };

  const openEdit = (app: AppItem) => {
    setEditing(app);
    setForm({
      name: app.name || '',
      cat: app.cat || 'Apps',
      ver: app.ver || '',
      mb: String(app.mb ?? ''),
      link: app.link || '',
      icon: app.icon || '',
      desc: app.desc || '',
      screenshotsText: Array.isArray(app.screenshots)
        ? app.screenshots.join('\n')
        : typeof app.screenshots === 'string'
          ? app.screenshots
          : '',
      isFeatured: !!app.isFeatured,
      isHot: !!app.isHot
    });
    setView('form');
  };

  const handleAutofill = async () => {
    if (!form.link.includes('github.com')) return;
    setAutofilling(true);
    try {
      const info = await fetchReleaseAssetInfo(form.link.trim());
      if (info) {
        setForm((f) => ({
          ...f,
          name: info.name || f.name,
          ver: info.ver || f.ver,
          mb: info.mb ? String(info.mb) : f.mb
        }));
        showToast('ok', 'GitHub se naam, version aur size bhar diya ✓');
      } else {
        showToast('err', 'Is link ki jaankari GitHub se nahi mili. Naam/size haath se bhar do.');
      }
    } catch (e) {
      showToast('err', 'Auto-fill fail ho gaya. Internet check karo.');
    } finally {
      setAutofilling(false);
    }
  };

  const handleSave = async () => {
    const name = form.name.trim();
    const link = form.link.trim();
    if (!name) {
      showToast('err', 'App ka naam zaroori hai.');
      return;
    }
    if (!link.startsWith('http')) {
      showToast('err', 'APK ka sahi download link (http se shuru) daalo.');
      return;
    }
    const appToSave: AppItem = {
      id: editing?.id || getAppKey(name) || `app_${Date.now()}`,
      name,
      cat: form.cat.trim() || 'Apps',
      ver: form.ver.trim(),
      mb: parseFloat(form.mb) || 0,
      link,
      icon: form.icon.trim(),
      desc: form.desc.trim(),
      screenshots: form.screenshotsText
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean),
      isFeatured: form.isFeatured,
      isHot: form.isHot,
      downloads: editing?.downloads || 0,
      rating: editing?.rating || 4.8
    };

    setSaving(true);
    const result = await saveAppStrict(appToSave);
    setSaving(false);

    if (result === 'firebase') {
      showToast('ok', 'Server par save ho gaya — ab sabko dikhega ✓');
      setTimeout(() => setView('list'), 900);
    } else if (result === 'local') {
      showToast(
        'warn',
        'Server par save NAHI hua (permission band hai) — sirf is phone par save hai. Mujhe batao, mai iska pakka fix bhej dunga.'
      );
    } else {
      showToast('err', 'Save fail ho gaya. Internet check karke dobara try karo.');
    }
  };

  const handleDelete = async (app: AppItem) => {
    if (releaseIds.includes(app.id)) {
      // Release wala app GitHub par hai — yahan se sirf hide hoga (is phone par)
      onHideRelease(app);
      setConfirmDeleteId(null);
      showToast('ok', 'Release app hide ho gaya. Neeche Hidden section se wapas la sakte ho.');
      return;
    }
    if (confirmDeleteId !== app.id) {
      setConfirmDeleteId(app.id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
      return;
    }
    setConfirmDeleteId(null);
    const ok = await deleteAppFromStore(app.id);
    showToast(ok ? 'ok' : 'err', ok ? 'App delete ho gaya.' : 'Delete fail ho gaya, dobara try karo.');
  };

  const handleStatusSave = async (next?: Partial<StoreStatus>) => {
    const payload: StoreStatus = { ...statusForm, ...(next || {}) };
    setStatusSaving(true);
    const ok = await setStoreStatus(payload);
    setStatusSaving(false);
    setConfirmKill(false);
    if (ok) {
      setStatusForm(payload);
      showToast('ok', payload.active ? 'Store chalu hai ✓' : 'Store BAND kar diya gaya hai 🔴');
    } else {
      showToast('err', 'Store status save nahi hua. Ek baar phir try karo, nahi ho to mujhe batao.');
    }
  };

  const filtered = apps.filter(
    (a) => a && (!search.trim() || (a.name || '').toLowerCase().includes(search.trim().toLowerCase()))
  );

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl text-sm font-medium border focus:outline-none focus:border-fuchsia-500 ${
    dark
      ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500'
      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
  }`;
  const labelCls = 'block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1';

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-[2rem] sm:rounded-[2rem] border shadow-2xl ${
          dark ? 'bg-slate-950 text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b backdrop-blur-xl ${
            dark ? 'bg-slate-950/90 border-white/10' : 'bg-white/90 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {view === 'form' && stage === 'unlocked' ? (
              <button
                onClick={() => setView('list')}
                className="p-2 rounded-xl bg-slate-800/70 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-600/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="font-display font-black text-base leading-none">Admin Panel</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                {stage === 'unlocked'
                  ? view === 'form'
                    ? editing
                      ? 'App Edit Karo'
                      : 'Naya App Jodo'
                    : `${apps.length} apps — edit / add / delete`
                  : 'Sirf owner ke liye'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {toast && (
            <div
              className={`mb-4 flex items-start gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border ${
                toast.kind === 'ok'
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : toast.kind === 'warn'
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
              }`}
            >
              {toast.kind === 'ok' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-px" />
              ) : (
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-px" />
              )}
              <span>{toast.text}</span>
            </div>
          )}

          {stage === 'checking' && (
            <div className="py-14 flex flex-col items-center gap-3 text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin" />
              <p className="text-xs font-semibold">Check ho raha hai…</p>
            </div>
          )}

          {(stage === 'setup' || stage === 'locked') && (
            <div className="py-6 space-y-4 max-w-xs mx-auto text-center">
              <div className="w-14 h-14 rounded-3xl mx-auto flex items-center justify-center bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-600/30">
                <Lock className="w-7 h-7" />
              </div>
              <h4 className="font-black text-sm">
                {stage === 'setup' ? 'Pehli Baar — Apna Admin PIN Banao' : 'Admin PIN Daalo'}
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {stage === 'setup'
                  ? 'Ye PIN sirf tumhe yaad rakhna hai — Admin Panel isi se khulega.'
                  : 'Panel kholne ke liye apna PIN daalo.'}
              </p>
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="PIN (kam se kam 4 number)"
                className={`${inputCls} text-center tracking-[0.4em]`}
              />
              {stage === 'setup' && (
                <input
                  type="password"
                  inputMode="numeric"
                  value={pinConfirm}
                  onChange={(e) => setPinConfirm(e.target.value)}
                  placeholder="PIN dobara daalo"
                  className={`${inputCls} text-center tracking-[0.4em]`}
                />
              )}
              {pinError && <p className="text-[11px] font-semibold text-rose-400">{pinError}</p>}
              <button
                onClick={stage === 'setup' ? handleSetupPin : handleUnlock}
                className="btn-live w-full py-3 px-4 rounded-xl font-black text-sm uppercase tracking-wider text-white shadow-lg active:scale-95 transition cursor-pointer"
              >
                <span>{stage === 'setup' ? 'PIN Set Karo' : 'Panel Kholo'}</span>
              </button>
            </div>
          )}

          {stage === 'unlocked' && view === 'list' && (
            <div className="space-y-3">
              {pinNote && (
                <p className="text-[11px] font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/30 rounded-xl px-3 py-2">
                  {pinNote}
                </p>
              )}
              {/* Store Control — kill switch + announcement */}
              <div
                className={`p-3.5 rounded-2xl border space-y-2.5 ${
                  dark ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        statusForm.active ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                      }`}
                    />
                    <p className="text-xs font-black uppercase tracking-wider">
                      Store {statusForm.active ? 'Chalu Hai' : 'Band Hai'}
                    </p>
                  </div>
                  {statusForm.active ? (
                    <button
                      onClick={() => {
                        if (!confirmKill) {
                          setConfirmKill(true);
                          setTimeout(() => setConfirmKill(false), 3000);
                          return;
                        }
                        handleStatusSave({ active: false });
                      }}
                      disabled={statusSaving}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition active:scale-95 cursor-pointer disabled:opacity-50 ${
                        confirmKill
                          ? 'bg-rose-600 text-white'
                          : 'bg-rose-500/15 border border-rose-500/40 text-rose-400 hover:bg-rose-500/25'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{confirmKill ? 'Pakka Band Karo?' : 'Store Band Karo'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusSave({ active: true })}
                      disabled={statusSaving}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25 transition active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>Store Chalu Karo</span>
                    </button>
                  )}
                </div>
                <input
                  value={statusForm.msg}
                  onChange={(e) => setStatusForm({ ...statusForm, msg: e.target.value })}
                  placeholder="Announcement message (jaise: Naya update aaya hai!) — khali = koi banner nahi"
                  className={inputCls}
                />
                <div className="flex items-center gap-2">
                  <input
                    value={statusForm.link}
                    onChange={(e) => setStatusForm({ ...statusForm, link: e.target.value })}
                    placeholder="Announcement ka link (optional)"
                    className={inputCls}
                  />
                  <button
                    onClick={() => handleStatusSave()}
                    disabled={statusSaving}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-100 text-[11px] font-black uppercase tracking-wider transition active:scale-95 cursor-pointer disabled:opacity-50 whitespace-nowrap"
                  >
                    {statusSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>Save</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Band karte hi sabke liye store band ho jayega aur upar wala message dikhega. Store band ho to
                  message hi sabko nazar aayega.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="App dhundo…"
                    className={`${inputCls} pl-9`}
                  />
                </div>
                <button
                  onClick={openAdd}
                  className="btn-live flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-wider shadow-lg active:scale-95 transition cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Naya App</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                GitHub Release par upload kiye apps <span className="text-sky-400 font-bold">Release</span> tag ke
                saath apne aap aate hain — unhe Edit karke naam/icon sahi kar do, edit save hote hi wo pakke ho
                jayenge.
              </p>

              {filtered.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-10 font-semibold">
                  Koi app nahi mila.
                </p>
              ) : (
                filtered.map((app) => {
                  const isRelease = releaseIds.includes(app.id);
                  return (
                    <div
                      key={app.id}
                      className={`p-3 rounded-2xl border flex items-center gap-3 ${
                        dark ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      {app.icon ? (
                        <img
                          src={app.icon}
                          alt={app.name}
                          className="w-11 h-11 rounded-xl object-cover border border-white/10 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white flex items-center justify-center font-black text-base flex-shrink-0">
                          {(app.name || 'A').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs truncate">{app.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          v{app.ver || '—'} • {app.mb || 0} MB • {app.cat}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <span
                            className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                              isRelease
                                ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {isRelease ? 'Release' : 'Firebase'}
                          </span>
                          {app.isFeatured && (
                            <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/30">
                              Featured
                            </span>
                          )}
                          {app.isHot && (
                            <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
                              Hot
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => openEdit(app)}
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(app)}
                        className={`p-2 rounded-xl transition cursor-pointer ${
                          confirmDeleteId === app.id
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400'
                        }`}
                        title={isRelease ? 'Hide (is phone par)' : 'Delete'}
                      >
                        {isRelease ? <EyeOff className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                      {confirmDeleteId === app.id && !isRelease && (
                        <span className="text-[9px] font-bold text-rose-400 w-12 leading-tight">
                          Pakka delete? Ek baar aur dabao
                        </span>
                      )}
                    </div>
                  );
                })
              )}

              {hiddenApps.length > 0 && (
                <div className="pt-3 mt-2 border-t border-dashed border-slate-700/60 space-y-2">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Hidden Release Apps ({hiddenApps.length})
                  </p>
                  {hiddenApps.map((app) => (
                    <div
                      key={app.id}
                      className={`p-3 rounded-2xl border flex items-center gap-3 opacity-70 ${
                        dark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs truncate">{app.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono truncate">{app.link}</p>
                      </div>
                      <button
                        onClick={() => onUnhideRelease(app)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Wapas Dikhao</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {stage === 'unlocked' && view === 'form' && (
            <div className="space-y-3.5">
              <div>
                <label className={labelCls}>App ka Naam *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. KineMaster Pro"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>APK Download Link *</label>
                <input
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="https://github.com/.../releases/download/..."
                  className={inputCls}
                />
                {form.link.includes('github.com') && form.link.includes('/releases/download/') && (
                  <button
                    onClick={handleAutofill}
                    disabled={autofilling}
                    className="mt-2 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/15 border border-sky-500/40 text-sky-300 hover:bg-sky-500/25 text-[11px] font-black uppercase tracking-wider transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {autofilling ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Wand2 className="w-3.5 h-3.5" />
                    )}
                    <span>Naam / Size GitHub Se Bharo</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className={labelCls}>Category</label>
                  <input
                    value={form.cat}
                    onChange={(e) => setForm({ ...form, cat: e.target.value })}
                    placeholder="Apps"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Version</label>
                  <input
                    value={form.ver}
                    onChange={(e) => setForm({ ...form, ver: e.target.value })}
                    placeholder="1.0"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Size (MB)</label>
                  <input
                    value={form.mb}
                    onChange={(e) => setForm({ ...form, mb: e.target.value })}
                    placeholder="50"
                    inputMode="decimal"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Icon Image Link (URL)</label>
                <input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="https://.../icon.png"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  value={form.desc}
                  onChange={(e) => setForm({ ...form, desc: e.target.value })}
                  placeholder="App ke baare me 1-2 line…"
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div>
                <label className={labelCls}>Screenshots (har line me ek image link)</label>
                <textarea
                  value={form.screenshotsText}
                  onChange={(e) => setForm({ ...form, screenshotsText: e.target.value })}
                  placeholder={'https://.../shot1.jpg\nhttps://.../shot2.jpg'}
                  rows={2}
                  className={`${inputCls} resize-none font-mono text-xs`}
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="w-4 h-4 accent-fuchsia-500"
                  />
                  Featured (bade banner me)
                </label>
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isHot}
                    onChange={(e) => setForm({ ...form, isHot: e.target.checked })}
                    className="w-4 h-4 accent-orange-500"
                  />
                  HOT
                </label>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-live w-full py-3.5 px-4 rounded-xl font-black text-sm uppercase tracking-wider text-white shadow-lg active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? 'Save Ho Raha Hai…' : 'Save Karo'}</span>
              </button>
              <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                Save server (Firebase) par hota hai — save hote hi app sabke store me dikhne lagega, bina kuch
                aur kiye.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
