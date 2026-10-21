import { useState, useEffect } from "react";
import { api } from "../api";
import MultiDatePicker from "react-multi-date-picker";
const DatePicker = MultiDatePicker.default || MultiDatePicker;
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  Hospital,
  MapPin,
  UserRound,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { doctors } from "../data/doctorsData.js";
import { translations } from "../data/translations.js";

export default function BookAppointment({ language }) {
  const t = translations[language];
  const { id } = useParams();
  const navigate = useNavigate();

  const doctor = doctors.find((item) => item.id === Number(id));

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!date) { setBookedSlots([]); return; }
    api(`/doctors/${id}/booked-slots?date=${encodeURIComponent(date)}`)
      .then(setBookedSlots).catch(() => setBookedSlots([]));
  }, [date, id]);

  const afghanCalendar = {
    ...persian,
    months: [
      ["حمل", "حمل"],
      ["ثور", "ثور"],
      ["جوزا", "جوزا"],
      ["سرطان", "سرطان"],
      ["اسد", "اسد"],
      ["سنبله", "سنبله"],
      ["میزان", "میزان"],
      ["عقرب", "عقرب"],
      ["قوس", "قوس"],
      ["جدی", "جدی"],
      ["دلو", "دلو"],
      ["حوت", "حوت"],
    ],
  };
  const afghanLocale = {
  ...persian_fa,
  months: afghanCalendar.months,
};

  const times = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "01:00",
    "01:30",
    "02:00",
    "02:30",
    "03:00",
    "03:30",
    "04:00",
    "04:30",
    "05:00",
  ];

  const BackIcon = language === "English" ? ArrowLeft : ArrowRight;

  if (!doctor) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 bg-gray-50 dark:bg-slate-900">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t.noDoctorsFound}
        </h1>

        <Link
          to="/doctors"
          className="bg-teal-600 text-white px-6 py-3 rounded-xl"
        >
          {t.backToDoctors}
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      await api("/appointments", { method: "POST", body: JSON.stringify({ doctorId: doctor.id, date, time, patientName: fullName.trim(), phone: phone.trim(), notes: notes.trim() }) });
      navigate("/my-appointments");
    } catch (err) {
      setError(err.message);
      if (err.message.toLowerCase().includes("booked")) setBookedSlots([...bookedSlots, time]);
    } finally { setSaving(false); }
  };

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-slate-900 px-5 md:px-12 lg:px-20 py-12">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/doctors"
          className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 font-medium mb-8 hover:underline"
        >
          <BackIcon size={19} />
          {t.backToDoctors}
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-4 py-2 rounded-full text-sm font-medium mb-5">
            <CalendarDays size={17} />
            {t.bookAppointment}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">
            {t.bookYourAppointment}
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mt-4">
            {t.bookingDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 md:p-8 space-y-8"
            >
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                  <CalendarDays size={22} className="text-teal-600" />
                  {t.selectAppointmentDate}
                </h2>

                <div className="w-full [&_.rmdp-container]:!w-full">
                  <DatePicker
                    value={date}
                    onChange={(value) => {
                      setDate(value ? value.format("YYYY/MM/DD") : "");
                      setTime("");
                    }}
                    calendar={afghanCalendar}
                    locale={afghanLocale}
                    minDate={new Date()}
                    format="YYYY/MM/DD"
                    containerClassName="w-full"
                    inputClass="!w-full px-4 py-3.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl outline-none focus:border-teal-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                  <Clock size={22} className="text-teal-600" />
                  {t.selectAppointmentTime}
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {times.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setTime(item)}
                      disabled={bookedSlots.includes(item)}
                      className={`py-3 rounded-xl border font-medium cursor-pointer transition ${
                        bookedSlots.includes(item)
                          ? "opacity-40 cursor-not-allowed line-through"
                          : time === item
                          ? "bg-teal-600 text-white border-teal-600"
                          : "bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-slate-600 hover:border-teal-500"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                  <UserRound size={22} className="text-teal-600" />
                  {t.patientInformation}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.patientFullName}
                    </label>

                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t.enterPatientName}
                      className="w-full px-4 py-3.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl outline-none focus:border-teal-500 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.phoneNumber}
                    </label>

                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="07XXXXXXXX"
                      className="w-full px-4 py-3.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl outline-none focus:border-teal-500 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.appointmentNotes}
                  </label>

                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t.enterAppointmentNotes}
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl outline-none focus:border-teal-500 text-gray-900 dark:text-white resize-none"
                  />
                </div>
              </div>

              {error && <p role="alert" className="text-red-600 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={saving || !date || !time || !fullName.trim() || !phone.trim()}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition cursor-pointer"
              >
                <CheckCircle2 size={20} />
                {t.confirmAppointment}
              </button>
            </form>
          </div>

          <div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 lg:sticky lg:top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {t.appointmentSummary}
              </h2>

              <div className="flex items-center gap-4 mb-6">
                <img
                  src={doctor.image}
                  alt={t[doctor.name]}
                  className="w-20 h-20 rounded-xl object-cover object-top bg-gray-100"
                />

                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {t[doctor.name]}
                  </h3>

                  <p className="text-sm text-teal-600 dark:text-teal-400 mt-1">
                    {t[doctor.specialty]}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-slate-700 pt-5 space-y-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-3">
                  <Hospital size={19} className="text-teal-600 shrink-0" />
                  <span>{t[doctor.hospital]}</span>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin size={19} className="text-teal-600 shrink-0" />
                  <span>{t[doctor.city]}</span>
                </div>

                <div className="flex items-center gap-3">
                  <CalendarDays size={19} className="text-teal-600 shrink-0" />
                  <span>{date || "—"}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Clock size={19} className="text-teal-600 shrink-0" />
                  <span>{time || "—"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
