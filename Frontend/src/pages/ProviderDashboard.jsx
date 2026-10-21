import { useEffect, useState } from "react";
import { api } from "../api";
import { translations } from "../data/translations";
import { Stethoscope, Save, CalendarDays } from "lucide-react";

export default function ProviderDashboard({ language }) {
  const t = translations[language];
  const [profiles, setProfiles] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");
  const load = async () => {
    try { const [p,a]=await Promise.all([api("/provider/dashboard"),api("/provider/appointments")]);setProfiles(p);setAppointments(a); }
    catch(e){setMessage(e.message);}
  };
  useEffect(()=>{load();},[]);
  const edit = (id,key,value) => setProfiles(profiles.map(p=>p.id===id?{...p,[key]:value}:p));
  const save = async p => {
    try { await api(`/provider/dashboard/${p.id}`,{method:"PATCH",body:JSON.stringify({name:p.name,phone:p.phone,address:p.address,city:p.city,specialty:p.specialty,description:p.description,services:p.services,active:p.active})});setMessage(t.providerSaved); }
    catch(e){setMessage(e.message);}
  };
  const status = async (a,s) => {
    try {await api(`/provider/appointments/${a.id}`,{method:"PATCH",body:JSON.stringify({status:s})});await load();}
    catch(e){setMessage(e.message);}
  };
  const fields = [["name",t.fullName],["phone",t.phoneNumber],["city",t.profileCity],["address",t.profileAddress],["specialty",t.providerSpecialty],["services",t.providerServices],["description",t.profileBio]];
  return <main className="min-h-screen bg-teal-50 dark:bg-slate-900 px-4 py-12"><div className="max-w-5xl mx-auto">
    <header className="bg-gradient-to-r from-teal-700 to-cyan-600 rounded-3xl p-8 text-white shadow-lg"><Stethoscope size={38}/><h1 className="text-3xl font-bold mt-3">{t.providerDashboard}</h1><p className="mt-2 text-teal-50">{t.providerDashboardHelp}</p></header>
    {message && <p className="mt-5 p-4 rounded-xl bg-white dark:bg-slate-800 text-teal-700">{message}</p>}
    {profiles.map(p=><section key={p.id} className="bg-white dark:bg-slate-800 dark:text-white rounded-2xl shadow-md p-6 mt-6">
      <h2 className="text-xl font-bold mb-5">{p.provider_type==="doctor"?t.registerDoctor:p.provider_type==="clinic"?t.registerClinic:t.registerHospital} {p.name}</h2>
      <div className="grid md:grid-cols-2 gap-4">{fields.map(([key,label])=><label key={key} className="block text-sm font-medium">{label}{key==="services"||key==="description"?<textarea rows={3} value={p[key]||""} onChange={e=>edit(p.id,key,e.target.value)} className="mt-2 block w-full rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-700 p-3"/>:<input value={p[key]||""} onChange={e=>edit(p.id,key,e.target.value)} className="mt-2 block w-full rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-700 p-3"/>}</label>)}</div>
      <label className="flex gap-2 items-center mt-5"><input type="checkbox" checked={p.active} onChange={e=>edit(p.id,"active",e.target.checked)}/>{t.providerActive}</label>
      <button onClick={()=>save(p)} className="flex items-center gap-2 mt-5 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition cursor-pointer"><Save size={18}/>{t.profileSave}</button>
    </section>)}
    <section className="bg-white dark:bg-slate-800 dark:text-white rounded-2xl shadow-md p-6 mt-6"><h2 className="text-xl font-bold flex items-center gap-2"><CalendarDays className="text-teal-600"/>{t.adminAppointments}</h2>
      {!appointments.length && <p className="text-gray-500 mt-5">{t.adminEmpty}</p>}
      {appointments.map(a=><div key={a.id} className="flex flex-wrap items-center justify-between gap-3 border-b dark:border-slate-700 py-4"><div><p className="font-bold">{a.patient_name}</p><p className="text-sm text-gray-500">{a.date} · {a.time} · {a.status}</p></div><div className="flex gap-2"><button onClick={()=>status(a,"confirmed")} className="bg-teal-600 text-white rounded-lg px-3 py-2 cursor-pointer">{t.adminConfirm}</button><button onClick={()=>status(a,"cancelled")} className="bg-red-100 text-red-700 rounded-lg px-3 py-2 cursor-pointer">{t.adminCancel}</button></div></div>)}
    </section>
  </div></main>;
}
