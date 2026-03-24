"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence }      from "framer-motion";
import { useSession }                   from "next-auth/react";
import axios                            from "axios";
import {
  User, Phone, Mail, Calendar, MapPin,
  Edit3, Save, X, Plus, Trash2,
  CheckCircle, Loader2, Camera, Star,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────── */
interface Address {
  _id?:      string;
  label:     string;
  fullName:  string;
  phone:     string;
  address:   string;
  area:      string;
  city:      string;
  district:  string;
  zip:       string;
  isDefault: boolean;
}

interface UserProfile {
  _id:         string;
  name:        string;
  email:       string;
  phone:       string;
  avatar:      string;
  gender:      string;
  dateOfBirth: string;
  role:        string;
  addresses:   Address[];
  preferences: {
    newsletter:  boolean;
    smsAlerts:   boolean;
    emailAlerts: boolean;
  };
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const DISTRICTS = [
  "ঢাকা","চট্টগ্রাম","সিলেট","রাজশাহী","খুলনা","বরিশাল",
  "ময়মনসিংহ","রংপুর","কুমিল্লা","নারায়ণগঞ্জ","গাজীপুর",
];

/* ── Main Component ─────────────────────────────────── */
export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [profile,    setProfile]    = useState<UserProfile | null>(null);
  const [isLoading,  setIsLoading]  = useState(true);
  const [activeTab,  setActiveTab]  = useState<"info" | "addresses" | "preferences">("info");
  const [editMode,   setEditMode]   = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [success,    setSuccess]    = useState("");
  const [error,      setError]      = useState("");

  const [form, setForm] = useState({
    name: "", phone: "", gender: "", dateOfBirth: "",
  });

  const [addrModal, setAddrModal] = useState(false);
  const [editAddr,  setEditAddr]  = useState<Address | null>(null);

  /* Fetch profile */
  useEffect(() => {
    axios.get<{ user: UserProfile }>("/api/profile")
      .then(({ data }) => {
        setProfile(data.user);
        setForm({
          name:        data.user.name        ?? "",
          phone:       data.user.phone       ?? "",
          gender:      data.user.gender      ?? "",
          dateOfBirth: data.user.dateOfBirth
            ? new Date(data.user.dateOfBirth).toISOString().slice(0, 10)
            : "",
        });
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setIsLoading(false));
  }, []);

  /* Save profile */
  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await axios.patch<{ user: UserProfile; message: string }>("/api/profile", form);
      setProfile(data.user);
      setEditMode(false);
      setSuccess(data.message);
      /* Update session name */
      await update({ name: form.name });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      setError(axios.isAxiosError(err) ? err.response?.data?.message ?? "Update failed" : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* Save preferences */
  const handlePrefSave = async (prefs: UserProfile["preferences"]) => {
    try {
      await axios.patch("/api/profile", { preferences: prefs });
      setProfile((prev) => prev ? { ...prev, preferences: prefs } : prev);
      setSuccess("Preferences saved");
      setTimeout(() => setSuccess(""), 2500);
    } catch { /* ignore */ }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <Loader2 size={32} className="animate-spin text-green-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <p className="text-stone-500">Profile not found</p>
      </div>
    );
  }

  const initials = profile.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Profile header card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm p-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-stone-200 dark:border-stone-700" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-700 dark:text-green-400 text-2xl font-bold">
                  {initials}
                </div>
              )}
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-700 text-white flex items-center justify-center shadow-md hover:bg-green-800 transition-colors">
                <Camera size={13} />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-stone-900 dark:text-white">{profile.name}</h1>
                {profile.role === "admin" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">Admin</span>
                )}
              </div>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">{profile.email}</p>
              {profile.phone && (
                <p className="text-sm text-stone-500 dark:text-stone-400">{profile.phone}</p>
              )}
            </div>

            {/* Edit button */}
            <button
              onClick={() => { setEditMode(!editMode); setError(""); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                editMode
                  ? "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                  : "bg-green-700 hover:bg-green-800 text-white"
              }`}
            >
              {editMode ? <><X size={15} /> বাতিল</> : <><Edit3 size={15} /> সম্পাদনা</>}
            </button>
          </div>
        </motion.div>

        {/* Success / Error */}
        <AnimatePresence>
          {(success || error) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1,  y: 0  }}
              exit={{    opacity: 0          }}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${
                success
                  ? "bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400"
                  : "bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400"
              }`}
            >
              {success ? <CheckCircle size={15} /> : <X size={15} />}
              {success || error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-2 bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-1.5">
          {(["info","addresses","preferences"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? "bg-green-700 text-white shadow-sm"
                  : "text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800"
              }`}
            >
              {tab === "info" ? "ব্যক্তিগত তথ্য" : tab === "addresses" ? "ঠিকানা" : "সেটিংস"}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === "info" && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0  }}
              exit={{    opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm p-6 space-y-5"
            >
              <h2 className="text-base font-bold text-stone-900 dark:text-white">ব্যক্তিগত তথ্য</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="পূর্ণ নাম" icon={<User size={15} />}
                  value={form.name} disabled={!editMode}
                  onChange={(v) => setForm((p) => ({ ...p, name: v }))} />

                <Field label="ইমেইল" icon={<Mail size={15} />}
                  value={profile.email} disabled type="email"
                  hint="ইমেইল পরিবর্তন করা যাবে না" />

                <Field label="ফোন নম্বর" icon={<Phone size={15} />}
                  value={form.phone} disabled={!editMode} type="tel"
                  onChange={(v) => setForm((p) => ({ ...p, phone: v }))} />

                <Field label="জন্ম তারিখ" icon={<Calendar size={15} />}
                  value={form.dateOfBirth} disabled={!editMode} type="date"
                  onChange={(v) => setForm((p) => ({ ...p, dateOfBirth: v }))} />

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700 dark:text-stone-300">লিঙ্গ</label>
                  <select
                    value={form.gender}
                    disabled={!editMode}
                    onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
                    className="w-full px-3 py-3 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15 disabled:opacity-60 transition-all"
                  >
                    <option value="">নির্বাচন করুন</option>
                    <option value="male">পুরুষ</option>
                    <option value="female">মহিলা</option>
                    <option value="other">অন্যান্য</option>
                  </select>
                </div>
              </div>

              {editMode && (
                <motion.button
                  onClick={handleSave}
                  disabled={saving}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-semibold disabled:opacity-60 transition-colors"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                </motion.button>
              )}
            </motion.div>
          )}

          {activeTab === "addresses" && (
            <motion.div
              key="addresses"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0  }}
              exit={{    opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-stone-900 dark:text-white">আমার ঠিকানা</h2>
                <button
                  onClick={() => { setEditAddr(null); setAddrModal(true); }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-medium transition-colors"
                >
                  <Plus size={15} /> নতুন ঠিকানা
                </button>
              </div>

              {profile.addresses?.length === 0 ? (
                <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-8 text-center">
                  <MapPin size={32} className="text-stone-300 dark:text-stone-600 mx-auto mb-3" />
                  <p className="text-sm text-stone-500 dark:text-stone-400">কোনো ঠিকানা সংরক্ষিত নেই</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profile.addresses?.map((addr) => (
                    <AddressCard
                      key={addr._id}
                      addr={addr}
                      onEdit={() => { setEditAddr(addr); setAddrModal(true); }}
                      onDelete={async () => {
                        await axios.delete(`/api/profile/addresses?id=${addr._id}`);
                        setProfile((p) => p ? { ...p, addresses: p.addresses.filter((a) => a._id !== addr._id) } : p);
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "preferences" && (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0  }}
              exit={{    opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm p-6 space-y-5"
            >
              <h2 className="text-base font-bold text-stone-900 dark:text-white">নোটিফিকেশন সেটিংস</h2>

              {profile.preferences && Object.entries({
                newsletter:  "নিউজলেটার ইমেইল",
                smsAlerts:   "SMS নোটিফিকেশন",
                emailAlerts: "ইমেইল নোটিফিকেশন",
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-stone-100 dark:border-stone-800 last:border-0">
                  <span className="text-sm text-stone-700 dark:text-stone-300">{label}</span>
                  <button
                    onClick={() => {
                      const updated = {
                        ...profile.preferences,
                        [key]: !profile.preferences[key as keyof typeof profile.preferences],
                      };
                      handlePrefSave(updated);
                    }}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      profile.preferences[key as keyof typeof profile.preferences]
                        ? "bg-green-600"
                        : "bg-stone-300 dark:bg-stone-600"
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      profile.preferences[key as keyof typeof profile.preferences]
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`} />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Address Modal */}
      <AddressModal
        open={addrModal}
        initial={editAddr}
        onClose={() => setAddrModal(false)}
        onSave={async (data) => {
          if (editAddr?._id) {
            const res = await axios.patch<{ addresses: Address[] }>(
              `/api/profile/addresses?id=${editAddr._id}`, data,
            );
            setProfile((p) => p ? { ...p, addresses: res.data.addresses } : p);
          } else {
            const res = await axios.post<{ addresses: Address[] }>("/api/profile/addresses", data);
            setProfile((p) => p ? { ...p, addresses: res.data.addresses } : p);
          }
          setAddrModal(false);
        }}
      />
    </main>
  );
}

/* ── Field ─────────────────────────────────────────── */
function Field({
  label, icon, value, onChange, disabled, type = "text", hint,
}: {
  label: string; icon?: React.ReactNode; value: string;
  onChange?: (v: string) => void; disabled?: boolean;
  type?: string; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-stone-700 dark:text-stone-300">{label}</label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">{icon}</span>
        )}
        <input
          type={type}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full ${icon ? "pl-9" : "pl-3"} pr-3 py-3 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15 disabled:opacity-60 disabled:cursor-not-allowed transition-all`}
        />
      </div>
      {hint && <p className="text-[11px] text-stone-400">{hint}</p>}
    </div>
  );
}

/* ── Address Card ───────────────────────────────────── */
function AddressCard({
  addr, onEdit, onDelete,
}: {
  addr: Address; onEdit: () => void; onDelete: () => void;
}) {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
            {addr.label}
          </span>
          {addr.isDefault && (
            <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400">
              <Star size={10} className="fill-current" /> ডিফল্ট
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="p-1.5 rounded-lg text-stone-400 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors">
            <Edit3 size={14} />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <p className="text-sm font-semibold text-stone-900 dark:text-white">{addr.fullName}</p>
      <p className="text-xs text-stone-500 dark:text-stone-400">{addr.phone}</p>
      <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
        {addr.address}, {addr.area}, {addr.city}, {addr.district}
        {addr.zip && ` - ${addr.zip}`}
      </p>
    </div>
  );
}

/* ── Address Modal ──────────────────────────────────── */
function AddressModal({
  open, initial, onClose, onSave,
}: {
  open:     boolean;
  initial:  Address | null;
  onClose:  () => void;
  onSave:   (data: Omit<Address, "_id">) => Promise<void>;
}) {
  const blank: Omit<Address, "_id"> = {
    label: "Home", fullName: "", phone: "", address: "",
    area: "", city: "ঢাকা", district: "ঢাকা", zip: "", isDefault: false,
  };

  const [form,    setForm]    = useState<Omit<Address, "_id">>(blank);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    setForm(initial ? { ...initial } : blank);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial, open]);

  const set = (key: keyof Omit<Address, "_id">, val: string | boolean) =>
    setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-100 dark:border-stone-800 overflow-hidden max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-stone-800">
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  {initial ? "ঠিকানা সম্পাদনা" : "নতুন ঠিকানা"}
                </h3>
                <button onClick={onClose} className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                {/* Label */}
                <div className="flex gap-2">
                  {["Home","Office","Other"].map((l) => (
                    <button key={l} type="button"
                      onClick={() => set("label", l)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                        form.label === l
                          ? "bg-green-700 text-white border-green-700"
                          : "border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-green-600"
                      }`}
                    >
                      {l === "Home" ? "বাড়ি" : l === "Office" ? "অফিস" : "অন্যান্য"}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AddrInput label="পূর্ণ নাম" value={form.fullName} required onChange={(v) => set("fullName", v)} />
                  <AddrInput label="ফোন নম্বর" value={form.phone} required type="tel" onChange={(v) => set("phone", v)} />
                  <div className="sm:col-span-2">
                    <AddrInput label="বিস্তারিত ঠিকানা" value={form.address} required onChange={(v) => set("address", v)} />
                  </div>
                  <AddrInput label="এলাকা" value={form.area} required onChange={(v) => set("area", v)} />
                  <AddrInput label="শহর" value={form.city} required onChange={(v) => set("city", v)} />

                  {/* District select */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-stone-700 dark:text-stone-300">জেলা</label>
                    <select
                      value={form.district}
                      onChange={(e) => set("district", e.target.value)}
                      className="w-full px-3 py-3 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15 transition-all"
                    >
                      {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>

                  <AddrInput label="পোস্ট কোড" value={form.zip} onChange={(v) => set("zip", v)} />
                </div>

                {/* Default toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={form.isDefault}
                    onChange={(e) => set("isDefault", e.target.checked)}
                    className="w-4 h-4 accent-green-700"
                  />
                  <label htmlFor="isDefault" className="text-sm text-stone-700 dark:text-stone-300">
                    ডিফল্ট ঠিকানা হিসেবে সেট করুন
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-semibold disabled:opacity-60 transition-colors"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function AddrInput({
  label, value, onChange, required, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void;
  required?: boolean; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-stone-700 dark:text-stone-300">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-3 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15 transition-all"
      />
    </div>
  );
}