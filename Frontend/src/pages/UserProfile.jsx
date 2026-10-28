import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserRound,
  Camera,
  Trash2,
  Save,
  Pencil,
  X,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  FileText,
  Home,
  ShieldCheck,
} from "lucide-react";
import { translations } from "../data/translations";
import { api, API_URL } from "../api";
import PhotoCropper from "../components/PhotoCropper";

export default function UserProfile({ language, user, setUser }) {
  const t = translations[language];
  const navigate = useNavigate();
  const [deletePassword, setDeletePassword] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [city, setCity] = useState(user.city || "");
  const [address, setAddress] = useState(user.address || "");
  const [bio, setBio] = useState(user.bio || "");
  const [birthDate, setBirthDate] = useState(user.birthDate || "");
  const [newEmail, setNewEmail] = useState(user.email || "");
  const [password, setPassword] = useState("");
  const [emailEditing, setEmailEditing] = useState(false);
  const [cropFile, setCropFile] = useState(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fieldClass =
    "w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200";
  const cardClass =
    "bg-gray-50 dark:bg-slate-700/70 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md";

  const startEdit = () => {
    setName(user.name || "");
    setPhone(user.phone || "");
    setCity(user.city || "");
    setAddress(user.address || "");
    setBio(user.bio || "");
    setBirthDate(user.birthDate || "");
    setMessage("");
    setEditing(true);
  };
  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const data = await api("/profile", {
        method: "PATCH",
        body: JSON.stringify({ name, phone, city, address, bio, birthDate }),
      });
      setUser(data.user);
      setEditing(false);
      setMessage(t.profileSaved);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };
  const changeEmail = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const data = await api("/profile/email", {
        method: "PATCH",
        body: JSON.stringify({ email: newEmail, password }),
      });
      setUser(data.user);
      setEmailEditing(false);
      setPassword("");
      setMessage(t.emailChanged);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };
  const uploadImage = async (blob) => {
    const form = new FormData();
    form.append("avatar", blob, "avatar.jpg");
    try {
      const data = await api("/profile/avatar", { method: "POST", body: form });
      setUser({ ...user, avatar: data.avatar });
      setImageError(false);
      setCropFile(null);
      setMessage(t.profileSaved);
    } catch (error) {
      setMessage(error.message);
    }
  };
  const removeImage = async () => {
    try {
      await api("/profile/avatar", { method: "DELETE" });
      setUser({ ...user, avatar: "" });
      setImageError(false);
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    }
  };
  const deleteAccount = async (e) => {
    e.preventDefault();
    if (
      !window.confirm("Permanently delete your account and its appointments?")
    )
      return;
    setSaving(true);
    setMessage("");
    try {
      await api("/profile", {
        method: "DELETE",
        body: JSON.stringify({ password: deletePassword }),
      });
      setUser(null);
      navigate("/home");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };
  const details = [
    [UserRound, t.profileFullName, user.name],
    [Mail, t.profileEmail, user.email],
    [Phone, t.profilePhone, user.phone],
    [MapPin, t.profileCity, user.city],
    [Home, t.profileAddress, user.address],
    [CalendarDays, t.profileBirthDate, user.birthDate],
    [FileText, t.profileBio, user.bio],
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-gray-50 to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          {t.profileTitle}
        </h1>
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden transition-all duration-300">
          <div className="h-36 bg-gradient-to-r from-teal-600 via-emerald-500 to-cyan-500" />
          <div className="px-6 md:px-10 pb-10">
            <div className="flex flex-col items-center -mt-16 relative">
              <div className="w-36 h-36 rounded-full bg-teal-100 dark:bg-slate-700 border-4 border-white dark:border-slate-800 overflow-hidden flex items-center justify-center shadow-xl transition-transform duration-300 hover:scale-105">
                {user.avatar && !imageError ? (
                  <img
                    src={
                      user.avatar.startsWith("https://")
                        ? user.avatar
                        : `${API_URL}${user.avatar}`
                    }
                    alt="Profile"
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserRound size={65} className="text-teal-600" />
                )}
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                {user.name}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {user.email}
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-5">
                <label
                  htmlFor="profilePhoto"
                  className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-xl cursor-pointer hover:bg-teal-700 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Camera size={18} />
                  {t.profileChangePhoto}
                </label>
                <input
                  id="profilePhoto"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setCropFile(file);
                    e.target.value = "";
                  }}
                  className="hidden"
                />
                {user.avatar && (
                  <button
                    onClick={removeImage}
                    className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl hover:bg-red-100 cursor-pointer transition"
                  >
                    <Trash2 size={18} />
                    {t.profileRemovePhoto}
                  </button>
                )}
              </div>
            </div>
            {message && (
              <p
                role="status"
                className="text-center text-teal-600 dark:text-teal-400 mt-6"
              >
                {message}
              </p>
            )}
            {!editing ? (
              <div className="mt-10 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {details.map(([Icon, label, value], index) => (
                    <div
                      key={index}
                      className={
                        cardClass + (index === 6 ? " md:col-span-2" : "")
                      }
                    >
                      <p className="text-sm text-gray-500 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Icon size={17} className="text-teal-600" />
                        {label}
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white break-words whitespace-pre-wrap">
                        {value || "—"}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-8">
                  <button
                    onClick={startEdit}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-6 py-3 cursor-pointer transition hover:-translate-y-0.5"
                  >
                    <Pencil size={18} />
                    {t.profileEdit}
                  </button>
                  <button
                    onClick={() => {
                      setNewEmail(user.email);
                      setEmailEditing(!emailEditing);
                      setMessage("");
                    }}
                    className="flex items-center gap-2 border border-teal-600 text-teal-700 dark:text-teal-400 rounded-xl px-6 py-3 cursor-pointer hover:bg-teal-50 dark:hover:bg-slate-700 transition"
                  >
                    <ShieldCheck size={18} />
                    {t.changeEmail}
                  </button>
                  {user.role === "provider" && (
                    <Link
                      to="/provider-dashboard"
                      className="border border-teal-600 text-teal-700 dark:text-teal-400 rounded-xl px-6 py-3"
                    >
                      {t.providerDashboard}
                    </Link>
                  )}
                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      className="border border-teal-600 text-teal-700 dark:text-teal-400 rounded-xl px-6 py-3"
                    >
                      {t.adminDashboard}
                    </Link>
                  )}
                  {user.role !== "admin" && user.role !== "provider" && (
                    <Link
                      to="/my-appointments"
                      className="border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white rounded-xl px-6 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                    >
                      {t.myAppointments}
                    </Link>
                  )}
                </div>
                {emailEditing && (
                  <form
                    onSubmit={changeEmail}
                    className="mt-7 p-5 border border-teal-100 dark:border-slate-600 rounded-2xl space-y-4 animate-fade-in"
                  >
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {t.changeEmail}
                    </h3>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className={fieldClass}
                      placeholder={t.profileEmail}
                    />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={fieldClass}
                      placeholder={t.currentPassword}
                    />
                    <div className="flex gap-3">
                      <button
                        disabled={saving}
                        className="bg-teal-600 text-white px-5 py-2 rounded-xl disabled:opacity-50"
                      >
                        {t.profileSave}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEmailEditing(false);
                          setPassword("");
                        }}
                        className="text-gray-600 dark:text-gray-300 px-4"
                      >
                        {t.profileCancel}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <form onSubmit={saveProfile} className="mt-10 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    [t.profileFullName, name, setName, "text", 120],
                    [t.profilePhone, phone, setPhone, "tel", 40],
                    [t.profileCity, city, setCity, "text", 100],
                    [t.profileAddress, address, setAddress, "text", 240],
                    [t.profileBirthDate, birthDate, setBirthDate, "date", 10],
                  ].map(([label, value, setValue, type, max]) => (
                    <div key={label}>
                      <label className="block mb-2 text-gray-700 dark:text-gray-200">
                        {label}
                      </label>
                      <input
                        type={type}
                        maxLength={max}
                        required={label === t.profileFullName}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className={fieldClass}
                      />
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label className="block mb-2 text-gray-700 dark:text-gray-200">
                      {t.profileBio}
                    </label>
                    <textarea
                      rows={3}
                      maxLength={500}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-8">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-6 py-3 cursor-pointer disabled:opacity-60 transition"
                  >
                    <Save size={18} />
                    {t.profileSave}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setMessage("");
                    }}
                    className="flex items-center gap-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white rounded-xl px-6 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                  >
                    <X size={18} />
                    {t.profileCancel}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      {user.role !== "admin" && (
        <div className="max-w-4xl mx-auto mt-6 p-5 rounded-2xl border border-red-200 dark:border-red-900">
          <button
            onClick={() => setShowDelete(!showDelete)}
            className="text-red-600 font-semibold"
          >
            {language === "English"
              ? "Delete my account"
              : language === "Persian"
                ? "حذف حساب کاربری"
                : "زما حساب ړنګول"}
          </button>
          {showDelete && (
            <form onSubmit={deleteAccount} className="mt-4 space-y-3">
              <p className="text-sm text-red-600">
                {language === "English"
                  ? "This permanently removes your account and appointments. Enter your password to confirm."
                  : language === "Persian"
                    ? "حساب و نوبت‌های شما برای همیشه حذف می‌شوند. برای تأیید رمز عبور را وارد کنید."
                    : "ستاسو حساب او نوبتونه د تل لپاره ړنګېږي. خپل پټنوم ولیکئ."}
              </p>
              <input
                type="password"
                required
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className={fieldClass}
                placeholder={t.currentPassword}
              />
              <button
                disabled={saving}
                className="bg-red-600 text-white rounded-xl px-5 py-3 disabled:opacity-50"
              >
                {language === "English"
                  ? "Permanently delete account"
                  : language === "Persian"
                    ? "حذف دایمی حساب"
                    : "حساب د تل لپاره ړنګول"}
              </button>
            </form>
          )}
        </div>
      )}
      {cropFile && (
        <PhotoCropper
          file={cropFile}
          t={t}
          onClose={() => setCropFile(null)}
          onSave={uploadImage}
        />
      )}
    </div>
  );
}
