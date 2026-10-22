
import { useEffect, useState } from "react";
import { api } from "../api";
import { UserRound, Hospital, ClipboardList, CheckCircle2 } from "lucide-react";
import { translations } from "../data/translations";
import { specialties } from "../data/specialties";
import { Link } from "react-router-dom";

export default function ProviderRegistration({ language, user }) {
  const t = translations[language];

  const [providerType, setProviderType] = useState("doctor");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [requests, setRequests] = useState([]);
  const [doctorPhoto, setDoctorPhoto] = useState(null);
  const [hospitalOptions, setHospitalOptions] = useState([]);
  const [specialtyOptions, setSpecialtyOptions] = useState(specialties);
  useEffect(() => {
    api("/hospitals").then(setHospitalOptions).catch(() => {});
    api("/specialties").then(setSpecialtyOptions).catch(() => {});
  }, []);
  useEffect(() => { if (user) api("/provider-requests/mine").then(data => setRequests(data.filter(r => r.status === "pending"))).catch(()=>{}); }, [user]);

  const inputStyle =
    "w-full p-3.5 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:border-teal-500";

  async function handleSubmit(e) {
    e.preventDefault(); setError("");
    if (!user) { setError(t.loginToContinue); return; }
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());
    if (!doctorPhoto) { setError("Doctor photo is required / عکس داکتر ضروری است"); setSaving(false); return; }
    let photoUrl = "";
    try {
      if (doctorPhoto) {
        const photoBody = new FormData(); photoBody.append("photo", doctorPhoto);
        const uploaded = await api("/provider-requests/photo", { method: "POST", body: photoBody });
        photoUrl = uploaded.photoUrl;
      }
    } catch (err) { setError(err.message); setSaving(false); return; }
    const details = JSON.stringify({ photoUrl, type: providerType, city: data.city, specialty: data.specialty || "", hospitalId: data.hospitalId || null, hospitalType: data.hospitalType || "", license: data.license || "", address: data.address || "", information: data.information || "" });
    try {
      const created = await api("/provider-requests", { method: "POST", body: JSON.stringify({ name: data.name, email: data.email, phone: data.phone, providerType, details }) });

      setSubmitted(true);
      api("/provider-requests/mine").then(data => setRequests(data.filter(r => r.status === "pending"))).catch(()=>{});
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  return (
    <section className="min-h-screen bg-teal-50 dark:bg-slate-900 px-5 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-teal-100 dark:bg-slate-700 flex items-center justify-center">
            <ClipboardList
              size={32}
              className="text-teal-600 dark:text-teal-400"
            />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {t.providerRegistration}
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mt-4">
            {t.registrationDescription}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-6 md:p-10"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
            {t.registerAs}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <label
              className={`flex items-center gap-3 p-5 border-2 rounded-2xl cursor-pointer transition ${
                providerType === "doctor"
                  ? "border-teal-500 bg-teal-50 dark:bg-slate-700"
                  : "border-gray-200 dark:border-slate-600"
              }`}
            >
              <input
                type="radio"
                name="providerType"
                value="doctor"
                checked={providerType === "doctor"}
                onChange={() => {
                  setProviderType("doctor");
                  setSubmitted(false);
                }}
                className="accent-teal-600"
              />

              <UserRound className="text-teal-600 dark:text-teal-400" />

              <span className="font-semibold text-gray-900 dark:text-white">
                {t.registerDoctor}
              </span>
            </label>

            <label
              className={`flex items-center gap-3 p-5 border-2 rounded-2xl cursor-pointer transition ${
                providerType === "hospital"
                  ? "border-teal-500 bg-teal-50 dark:bg-slate-700"
                  : "border-gray-200 dark:border-slate-600"
              }`}
            >
              <input
                type="radio"
                name="providerType"
                value="hospital"
                checked={providerType === "hospital"}
                onChange={() => {
                  setProviderType("hospital");
                  setSubmitted(false);
                }}
                className="accent-teal-600"
              />

              <Hospital className="text-teal-600 dark:text-teal-400" />

              <span className="font-semibold text-gray-900 dark:text-white">
                {t.registerHospital}
              </span>
            </label>
            <label className={`flex items-center gap-3 p-5 border-2 rounded-2xl cursor-pointer transition ${providerType === "clinic" ? "border-teal-500 bg-teal-50 dark:bg-slate-700" : "border-gray-200 dark:border-slate-600"}`}>
              <input type="radio" name="providerType" value="clinic" checked={providerType === "clinic"} onChange={() => {setProviderType("clinic");setSubmitted(false);}} className="accent-teal-600" />
              <Hospital className="text-teal-600" />
              <span className="font-semibold text-gray-900 dark:text-white">{t.registerClinic}</span>
            </label>
          </div>

          {error && <p role="alert" className="text-red-600 mb-5">{error}</p>}
          {!user && <div className="flex gap-5 mb-5 text-teal-600"><Link to="/login" className="underline">Login / ورود</Link><Link to="/signup" className="underline">Sign Up / ثبت‌نام</Link></div>}
          {submitted ? (
            <div className="text-center py-12">
              <CheckCircle2
                size={60}
                className="text-teal-600 dark:text-teal-400 mx-auto mb-5"
              />

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {t.registrationFormCompleted}
              </h2>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t.requestSent}
              </p>

              <Link
                to="/home"
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl cursor-pointer transition"
              >
                {t.backToHome}
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                    {providerType === "doctor"
                      ? t.fullName
                      : t.hospitalName}
                  </label>

                  <input
                    type="text"
                    name="name"
                    required
                    placeholder={
                      providerType === "doctor"
                        ? t.enterFullName
                        : t.enterHospitalName
                    }
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                    {t.phoneNumber}
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="07xxxxxxxx"
                    dir="ltr"
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                    {t.emailAddress}
                  </label>

                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="example@gmail.com"
                    dir="ltr"
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                    {t.cityLabel}
                  </label>

                  <select
                    name="city"
                    defaultValue=""
                    required
                    className={inputStyle}
                  >
                    <option value="" disabled>
                      {t.selectCity}
                    </option>
                    <option value="herat">{t.herat}</option>
                    <option value="kabul">{t.kabul}</option>
                    <option value="mazar">{t.mazar}</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">Photo / عکس (required)</label>
                    <input type="file" accept="image/jpeg,image/png,image/webp" required onChange={e=>setDoctorPhoto(e.target.files[0] || null)} className={inputStyle} />
                    {doctorPhoto && <p className="text-sm text-teal-600 mt-2">{doctorPhoto.name}</p>}
                  </div>
                {providerType === "doctor" && (
                  <>
                    <div>
                      <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                        {t.medicalSpecialty}
                      </label>

                      <select
                        name="specialty"
                        defaultValue=""
                        required
                        className={inputStyle}
                      >
                        <option value="" disabled>
                          {t.selectSpecialty}
                        </option>

                        {specialtyOptions.map((specialty) => (
                          <option
                            key={specialty.id}
                            value={specialty.value}
                          >
                            {t[specialty.name] || specialty.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">{t.hospital || "Hospital"} *</label>
                      <select name="hospitalId" required defaultValue="" className={inputStyle}>
                        <option value="" disabled>Select a hospital / انتخاب شفاخانه</option>
                        {hospitalOptions.map(h => <option key={h.id} value={h.id}>{h.name} — {h.city}</option>)}
                      </select>
                      {!hospitalOptions.length && <p className="text-sm text-amber-600 mt-2">No hospitals available. An admin must add a hospital first.</p>}
                    </div>
                    <div>
                      <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                        {t.licenseNumber}
                      </label>

                      <input
                        type="text"
                        name="license"
                        required
                        placeholder={t.enterLicense}
                        className={inputStyle}
                      />
                    </div>
                  </>
                )}

                {(providerType === "hospital" || providerType === "clinic") && (
                  <>
                    <div>
                      <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                        {t.hospitalType}
                      </label>

                      <select
                        name="hospitalType"
                        defaultValue=""
                        required
                        className={inputStyle}
                      >
                        <option value="" disabled>
                          {t.selectHospitalType}
                        </option>
                        <option value="hospital">{t.hospital}</option>
                        <option value="clinic">{t.clinic}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                        {t.licenseNumber}
                      </label>

                      <input
                        type="text"
                        name="license"
                        required
                        placeholder={t.enterLicense}
                        className={inputStyle}
                      />
                    </div>
                  </>
                )}

                <div className="md:col-span-2">
                  <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                    {t.fullAddress}
                  </label>

                  <textarea
                    name="address"
                    rows="3"
                    required
                    placeholder={t.enterAddress}
                    className={`${inputStyle} resize-none`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                    {t.additionalInformation}
                  </label>

                  <textarea
                    name="information"
                    rows="4"
                    placeholder={t.enterInformation}
                    className={`${inputStyle} resize-none`}
                  />
                </div>
              </div>

              <button
                disabled={saving || !user}
                type="submit"
                className="w-full mt-8 bg-teal-600 text-white font-semibold py-4 rounded-xl hover:bg-teal-700 transition-colors cursor-pointer"
              >
                {user?.role === "admin" ? "Publish directly / ثبت مستقیم" : t.submitRegistration}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
                {t.registrationNote}
              </p>
            </>
          )}
        </form>
        {user && requests.length > 0 && <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.requestHistory}</h2>
          {requests.map(r => {
            let details = {}; try { details = JSON.parse(r.details); } catch {}
            const type = r.providerType || details.type || "doctor";
            const prefix = type === "doctor" ? t.registerDoctor : type === "clinic" ? t.registerClinic : t.registerHospital;
            return <article key={r.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-teal-100 dark:border-slate-700 p-6 transition hover:-translate-y-1 hover:shadow-xl">
              <div className="flex flex-wrap justify-between gap-3 items-center">
                <div><p className="text-xs text-gray-500">#{r.id} · {new Date(r.createdAt).toLocaleDateString()}</p><h3 className="text-lg font-bold dark:text-white mt-1">{prefix} {r.name}</h3></div>
                <span className={`rounded-full px-4 py-2 text-sm font-semibold ${r.status === "approved" ? "bg-green-100 text-green-700" : r.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                  {r.status === "approved" ? t.requestApproved : r.status === "rejected" ? t.requestRejected : t.requestPending}
                </span>
              </div>
              <div className="flex gap-2 items-center mt-5 text-xs text-gray-500 dark:text-gray-300"><span className="w-3 h-3 bg-teal-500 rounded-full"/><span className="flex-1 h-1 bg-teal-200 rounded-full"/><span className={`w-3 h-3 rounded-full ${r.status === "pending" ? "bg-amber-400" : "bg-teal-500"}`}/><span className="flex-1 h-1 bg-teal-200 rounded-full"/><span className={`w-3 h-3 rounded-full ${r.status === "pending" ? "bg-gray-300" : r.status === "approved" ? "bg-green-500" : "bg-red-500"}`}/></div>
              {r.reviewNote && <p className="mt-4 rounded-xl bg-gray-50 dark:bg-slate-700 p-4 text-sm dark:text-white"><strong>{t.reviewReason}: </strong>{r.reviewNote}</p>}
            </article>;
          })}
        </div>}
      </div>
    </section>
  );
}
