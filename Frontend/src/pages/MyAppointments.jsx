import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, MapPin, Hospital, Trash2, CalendarX } from "lucide-react";

import { translations } from "../data/translations.js";
import { api } from "../api";

export default function MyAppointments({ language }) {
  const t = translations[language];
  const [filter, setFilter] = useState("all");
  const [appointments, setAppointments] = useState([]);
  const [doctorDetails, setDoctorDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true); setError("");
    try {
      const items = await api("/appointments");
      setAppointments(items);
      const ids = [...new Set(items.map(item => item.doctorId))];
      const results = await Promise.all(ids.map(async id => {
        try { return [id, await api(`/doctors/${id}`)]; }
        catch { return [id, null]; }
      }));
      setDoctorDetails(Object.fromEntries(results));
    }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { localStorage.removeItem("appointments"); load(); }, []);
  const cancelAppointment = async (id) => {
    if (!window.confirm(t.cancelConfirmation)) return;
    try {
      await api(`/appointments/${id}/cancel`, { method: "PATCH" });
      setAppointments(appointments.map(item => item.id === id ? { ...item, status: "cancelled" } : item));
    } catch (err) { setError(err.message); }
  };
  const filtered = appointments.filter(a => filter === "all" || a.status === filter);
  return (
    <section className="min-h-screen bg-gray-50 dark:bg-slate-900 px-5 md:px-12 lg:px-20 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10"><CalendarDays size={36} className="text-teal-600 mx-auto mb-4"/><h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">{t.myAppointments}</h1><p className="text-gray-600 dark:text-gray-300 mt-4">{t.myAppointmentsDescription}</p></div>
        <div className="flex flex-wrap justify-center gap-3 mb-10">{[["all",t.allAppointments],["confirmed",t.confirmed],["pending",t.pending],["cancelled",t.cancelled]].map(([value,label])=><button key={value} onClick={()=>setFilter(value)} className={`px-5 py-3 rounded-xl cursor-pointer transition ${filter===value ? "bg-teal-600 text-white" : "bg-white dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-700"}`}>{label}</button>)}</div>
        {loading ? <p className="text-center text-gray-600 dark:text-gray-300">{t.loadingText}</p> : error ? <div className="text-center text-red-600">{error}<button onClick={load} className="block mx-auto mt-4 underline">{t.tryAgain}</button></div> : filtered.length===0 ? <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 text-center"><CalendarX size={55} className="text-teal-600 mx-auto mb-5"/><h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t.noAppointments}</h2><p className="text-gray-600 dark:text-gray-300 mb-6">{t.noAppointmentsDescription}</p><Link to="/doctors" className="inline-block bg-teal-600 text-white px-6 py-3 rounded-xl">{t.findDoctors}</Link></div> :
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{filtered.map(a=>{
          const doctor=doctorDetails[a.doctorId];
          return <div key={a.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-5">{doctor && <img src={doctor.image} alt="" className="w-20 h-20 rounded-xl object-cover object-top"/>}<div><h2 className="text-lg font-bold text-gray-900 dark:text-white">{doctor ? t[doctor.name] || doctor.name : `Doctor #${a.doctorId}`}</h2><span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full ${a.status==="cancelled" ? "bg-red-100 text-red-700" : a.status==="confirmed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{t[a.status] || a.status}</span></div></div>
            <div className="border-t dark:border-slate-700 pt-5 space-y-3 text-gray-600 dark:text-gray-300 text-sm"><p className="flex items-center gap-2"><CalendarDays size={18} className="text-teal-600"/>{a.date}</p><p className="flex items-center gap-2"><Clock size={18} className="text-teal-600"/>{a.time}</p>{doctor && <p className="flex items-center gap-2"><Hospital size={18} className="text-teal-600"/>{t[doctor.hospital] || doctor.hospital}</p>}<p><b>{t.patientFullName}:</b> {a.patientName}</p><p><b>{t.phoneNumber}:</b> {a.phone}</p><p><b>{t.appointmentNotes}:</b> {a.notes || t.notProvided}</p></div>
            {a.status==="pending" && <button onClick={()=>cancelAppointment(a.id)} className="w-full flex justify-center items-center gap-2 mt-6 border border-red-200 text-red-600 rounded-xl py-3 cursor-pointer hover:bg-red-50 transition"><Trash2 size={18}/>{t.cancelAppointment}</button>}
          </div>;
        })}</div>}
      </div>
    </section>
  );
}
