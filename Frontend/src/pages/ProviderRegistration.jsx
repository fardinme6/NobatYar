import { useEffect, useState } from "react";
import { api } from "../api";
import { UserRound, Hospital, ClipboardList, CheckCircle2 } from "lucide-react";
import { translations } from "../data/translations";
import { Link } from "react-router-dom";

function SearchMultiSelect({ options, selected, setSelected, language, placeholder, name }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = options.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="relative">
      {selected.map((value) => <input key={value} type="hidden" name={name} value={value} />)}
      <div className="min-h-14 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 p-2 flex flex-wrap items-center gap-2">
        {selected.map((value) => {
          const item = options.find((option) => String(option.value) === String(value));
          return <span key={value} className="inline-flex items-center gap-2 bg-teal-50 dark:bg-slate-600 text-teal-800 dark:text-white px-3 py-1.5 rounded-lg text-sm">
            {item?.label || value}
            <button type="button" aria-label="Remove" onClick={() => setSelected(selected.filter((v) => v !== value))} className="hover:text-red-600">×</button>
          </span>;
        })}
        <button type="button" onClick={() => setOpen(!open)} className="flex-1 min-w-32 text-start text-gray-500 dark:text-gray-200 p-2">
          {placeholder} ▾
        </button>
      </div>
      {open && <div className="mt-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 p-3 shadow-lg">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={language === "English" ? "Search..." : language === "Pashto" ? "لټون وکړئ..." : "جستجو کنید..."} className="w-full border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white p-3 mb-2 outline-none focus:border-teal-500" />
        <div className="max-h-44 overflow-y-auto">
          {filtered.map((item) => <button key={item.value} type="button" onClick={() => setSelected(selected.includes(item.value) ? selected.filter((v) => v !== item.value) : [...selected, item.value])} className="w-full text-start px-3 py-2 rounded-lg hover:bg-teal-50 dark:hover:bg-slate-600 dark:text-white flex justify-between gap-2">
            <span>{item.label}</span><span className="text-teal-600">{selected.includes(item.value) ? "✓" : "+"}</span>
          </button>)}
          {!filtered.length && <p className="p-3 text-gray-500">{language === "English" ? "No results" : language === "Pashto" ? "پایلې نشته" : "نتیجه‌ای یافت نشد"}</p>}
        </div>
        <button type="button" onClick={() => setOpen(false)} className="mt-2 w-full bg-teal-600 text-white py-2 rounded-lg">{language === "English" ? "Done" : language === "Pashto" ? "تایید" : "تأیید انتخاب"}</button>
      </div>}
    </div>
  );
}

// نام تخصص را برای ثبت نام داکتر به شکل عنوان داکتر نمایش می دهد.
function specialistLabel(name, language) {
  const value = String(name || "").trim();
  const prefix = language === "English" ? "Specialist in " : language === "Pashto" ? "د " : "متخصص ";
  if (!value) return "";
  if (language === "English") return /^(specialist|surgeon|cardiologist|urologist)\b/i.test(value) ? value : prefix + value;
  if (language === "Pashto") return value.startsWith("متخصص") || value.startsWith("د ") ? value : `د ${value} متخصص`;
  return value.startsWith("متخصص") ? value : prefix + value;
}

export default function ProviderRegistration({ language, user }) {
  const t = translations[language];

  const [providerType, setProviderType] = useState(
    () => sessionStorage.getItem("nobatyarApplicationType") || "doctor",
  );
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [requests, setRequests] = useState([]);
  const [doctorPhoto, setDoctorPhoto] = useState(null);
  const [hospitalLogo, setHospitalLogo] = useState(null);
  const [hospitalOptions, setHospitalOptions] = useState([]);
  const [specialtyOptions, setSpecialtyOptions] = useState([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [selectedHospitals, setSelectedHospitals] = useState([]);
  useEffect(() => {
    const lang = language === "Persian" ? "fa" : language === "Pashto" ? "ps" : "en";
    api(`/hospitals?lang=${lang}`).then(setHospitalOptions).catch(() => {});
    api(`/specialties?lang=${lang}`).then(setSpecialtyOptions).catch(() => {});
  }, [language]);
  useEffect(() => {
    if (user)
      api("/provider-requests/mine")
        .then((data) => setRequests(data.filter((r) => r.status === "pending")))
        .catch(() => {});
  }, [user]);

  const inputStyle =
    "w-full p-3.5 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:border-teal-500";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());
    const specialtyValues = form.getAll("specialtyValues");
    const hospitalIds = form.getAll("hospitalIds").map(Number);
    if (providerType === "doctor" && (!specialtyValues.length || !hospitalIds.length)) {
      setError(language === "English" ? "Select at least one specialty and one hospital." : language === "Pashto" ? "لږ تر لږه یوه تخصص او یو روغتون وټاکئ." : "حداقل یک تخصص و یک شفاخانه انتخاب کنید.");
      setSaving(false);
      return;
    }
    if (!doctorPhoto || (providerType !== "doctor" && !hospitalLogo)) {
      setError("Photo is required / عکس ضروری است");
      setSaving(false);
      return;
    }
    let photoUrl = "";
    let logoUrl = "";
    try {
      if (doctorPhoto) {
        const photoBody = new FormData();
        photoBody.append("photo", doctorPhoto);
        const uploaded = await api("/provider-requests/photo", {
          method: "POST",
          body: photoBody,
        });
        photoUrl = uploaded.photoUrl;
      }
      if (providerType !== "doctor" && hospitalLogo) {
        const body = new FormData();
        body.append("photo", hospitalLogo);
        const uploaded = await api("/provider-requests/photo", { method: "POST", body });
        logoUrl = uploaded.photoUrl;
      }
    } catch (err) {
      setError(err.message);
      setSaving(false);
      return;
    }
    const details = JSON.stringify({
      photoUrl,
      logoUrl,
      type: providerType,
      city: data.city,
      specialty: specialtyValues[0] || "",
      specialtyValues,
      hospitalId: hospitalIds[0] || null,
      hospitalIds,
      hospitalType: providerType === "doctor" ? "" : providerType,
      license: data.license || "",
      address: data.address || "",
      information: data.information || "",
    });
    try {
      const created = await api("/provider-requests", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          providerType,
          details,
        }),
      });

      setSubmitted(true);
      sessionStorage.removeItem("nobatyarApplicationType");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
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

        {requests.length > 0 && (
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 p-4">
            {language === "English"
              ? "Pending: your provider application is awaiting admin approval. You cannot access the provider dashboard yet."
              : language === "Persian"
                ? "در انتظار تأیید: درخواست شما ثبت شده و منتظر بررسی ادمین است. تا زمان تأیید، پنل داکتر یا شفاخانه فعال نمی‌شود."
                : "ستاسو غوښتنلیک د اډمین تایید ته منتظر دی. تر تایید مخکې د خدمت ورکوونکي پینل نه فعالېږي."}
          </div>
        )}
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
            <label
              className={`flex items-center gap-3 p-5 border-2 rounded-2xl cursor-pointer transition ${providerType === "clinic" ? "border-teal-500 bg-teal-50 dark:bg-slate-700" : "border-gray-200 dark:border-slate-600"}`}
            >
              <input
                type="radio"
                name="providerType"
                value="clinic"
                checked={providerType === "clinic"}
                onChange={() => {
                  setProviderType("clinic");
                  setSubmitted(false);
                }}
                className="accent-teal-600"
              />
              <Hospital className="text-teal-600" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {t.registerClinic}
              </span>
            </label>
          </div>

          {error && (
            <p role="alert" className="text-red-600 mb-5">
              {error}
            </p>
          )}
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
                      ? t.profileFullName
                      : providerType === "hospital"
                        ? t.hospitalName
                        : t.clinicName}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="name"
                    required
                    placeholder={
                      providerType === "doctor"
                        ? t.enterFullName
                        : providerType === "hospital"
                          ? t.enterHospitalName
                          : t.enterClinicName
                    }
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                    {t.phoneNumber} <span className="text-red-500">*</span>
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
                    {t.emailAddress} <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="email"
                    name="email"
                    required
                    placeholder={t.enterEmailAddress}
                    dir={language === "English" ? "ltr" : "rtl"}
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
                  <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                    {t.photoLabel} <span className="text-red-500">*</span>
                  </label>

                  <label className={`${inputStyle} block cursor-pointer`}>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      required
                      onChange={(e) =>
                        setDoctorPhoto(e.target.files[0] || null)
                      }
                      className="hidden"
                    />

                    {doctorPhoto ? doctorPhoto.name : t.noFileChosen}
                  </label>
                </div>
                {providerType !== "doctor" && (
                  <div className="md:col-span-2">
                    <label className="block mb-2 font-medium dark:text-white cursor-pointer">
                      {language === "English" ? "Hospital / Clinic Logo" : language === "Pashto" ? "د روغتون / کلینیک لوګو" : "لوگوی شفاخانه / کلینیک"}
                      <span className="text-red-500 ms-1">*</span>
                      <input type="file" accept="image/jpeg,image/png,image/webp" required
                        onChange={(e) => setHospitalLogo(e.target.files[0] || null)}
                        className="sr-only" />
                      <span className={`${inputStyle} block cursor-pointer hover:border-teal-500 transition-colors`}>
                        {hospitalLogo ? hospitalLogo.name : t.noFileChosen}
                      </span>
                    </label>
                  </div>
                )}
                {providerType === "doctor" && (
                  <>
                    <div>
                      <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                        {t.medicalSpecialty}{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <SearchMultiSelect name="specialtyValues" language={language} options={specialtyOptions
                        .filter((s, index, list) => list.findIndex((x) => String(x.name).trim() === String(s.name).trim()) === index)
                        .map((s) => ({ value: s.value, label: specialistLabel(t[s.name] || s.name, language) }))} selected={selectedSpecialties} setSelected={setSelectedSpecialties} placeholder={language === "English" ? "Select specialties" : language === "Pashto" ? "تخصصونه وټاکئ" : "انتخاب تخصص‌ها"} />
                      <p className="text-xs text-gray-500 mt-1">{language === "English" ? "Choose one or more specialties" : language === "Pashto" ? "یو یا څو تخصصونه وټاکئ" : "یک یا چند تخصص انتخاب کنید"}</p>
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                        {t.hospital || "Hospital"} <span className="text-red-500">*</span>
                      </label>
                      <SearchMultiSelect name="hospitalIds" language={language} options={hospitalOptions.map((h) => ({ value: String(h.id), label: `${h.name} — ${t[h.city] || h.city}` }))} selected={selectedHospitals} setSelected={setSelectedHospitals} placeholder={language === "English" ? "Select hospitals" : language === "Pashto" ? "روغتونونه وټاکئ" : "انتخاب شفاخانه‌ها"} />
                      <p className="text-xs text-gray-500 mt-1">{language === "English" ? "Choose one or more hospitals" : language === "Pashto" ? "یو یا څو روغتونونه وټاکئ" : "یک یا چند شفاخانه انتخاب کنید"}</p>
                      {!hospitalOptions.length && (
                        <p className="text-sm text-amber-600 mt-2">{language === "English" ? "No hospitals available." : language === "Pashto" ? "هیڅ روغتون نشته." : "هیچ شفاخانه‌ای موجود نیست."}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                        {t.licenseNumber}{" "}
                        <span className="text-red-500">*</span>
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
                    <div className="md:col-span-2">
                      <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                        {t.licenseNumber}{" "}
                        <span className="text-red-500">*</span>
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
                    {t.fullAddress} <span className="text-red-500">*</span>
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
                disabled={saving}
                type="submit"
                className="w-full mt-8 bg-teal-600 text-white font-semibold py-4 rounded-xl hover:bg-teal-700 transition-colors cursor-pointer"
              >
                {user?.role === "admin"
                  ? "Publish directly / ثبت مستقیم"
                  : t.submitRegistration}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
                {t.registrationNote}
              </p>
            </>
          )}
        </form>
        {user && requests.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t.requestHistory}
            </h2>
            {requests.map((r) => {
              let details = {};
              try {
                details = JSON.parse(r.details);
              } catch {}
              const type = r.providerType || details.type || "doctor";
              const prefix =
                type === "doctor"
                  ? t.registerDoctor
                  : type === "clinic"
                    ? t.registerClinic
                    : t.registerHospital;
              return (
                <article
                  key={r.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-teal-100 dark:border-slate-700 p-6 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex flex-wrap justify-between gap-3 items-center">
                    <div>
                      <p className="text-xs text-gray-500">
                        #{r.id} · {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                      <h3 className="text-lg font-bold dark:text-white mt-1">
                        {prefix} {r.name}
                      </h3>
                    </div>
                    <span
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${r.status === "approved" ? "bg-green-100 text-green-700" : r.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}
                    >
                      {r.status === "approved"
                        ? t.requestApproved
                        : r.status === "rejected"
                          ? t.requestRejected
                          : t.requestPending}
                    </span>
                  </div>
                  <div className="flex gap-2 items-center mt-5 text-xs text-gray-500 dark:text-gray-300">
                    <span className="w-3 h-3 bg-teal-500 rounded-full" />
                    <span className="flex-1 h-1 bg-teal-200 rounded-full" />
                    <span
                      className={`w-3 h-3 rounded-full ${r.status === "pending" ? "bg-amber-400" : "bg-teal-500"}`}
                    />
                    <span className="flex-1 h-1 bg-teal-200 rounded-full" />
                    <span
                      className={`w-3 h-3 rounded-full ${r.status === "pending" ? "bg-gray-300" : r.status === "approved" ? "bg-green-500" : "bg-red-500"}`}
                    />
                  </div>
                  {r.reviewNote && (
                    <p className="mt-4 rounded-xl bg-gray-50 dark:bg-slate-700 p-4 text-sm dark:text-white">
                      <strong>{t.reviewReason}: </strong>
                      {r.reviewNote}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
