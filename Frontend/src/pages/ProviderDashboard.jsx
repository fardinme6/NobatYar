import { useEffect, useState } from "react";
import { api } from "../api";
import { translations } from "../data/translations";
import { Stethoscope, Save, CalendarDays } from "lucide-react";

export default function ProviderDashboard({ language }) {
  const t = translations[language];
  const [profiles, setProfiles] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [weekday, setWeekday] = useState(0);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [slotMinutes, setSlotMinutes] = useState(30);
  const [enabled, setEnabled] = useState(true);
  const [daysOff, setDaysOff] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [message, setMessage] = useState("");
  const load = async () => {
    try { const [p,a,d]=await Promise.all([api("/provider/dashboard"),api("/provider/appointments"),api("/provider/doctors")]);setProfiles(p);setAppointments(a);setDoctors(d);if(d.length)setDoctorId(old=>old||String(d[0].id)); }
    catch(e){setMessage(e.message);}
  };
  useEffect(()=>{load();},[]);
  useEffect(()=>{if(!doctorId)return;api(`/provider/doctors/${doctorId}/schedule`).then(data=>{setSchedule(data.schedule);setDaysOff(data.daysOff);}).catch(e=>setMessage(e.message));},[doctorId]);
  const saveSchedule = async e => {e.preventDefault();try {await api(`/provider/doctors/${doctorId}/schedule`,{method:"PUT",body:JSON.stringify({weekday:Number(weekday),startTime,endTime,slotMinutes:Number(slotMinutes),enabled})});const data=await api(`/provider/doctors/${doctorId}/schedule`);setSchedule(data.schedule);setMessage(t.adminScheduleSaved);}catch(e){setMessage(e.message);}};
  const addDayOff = async e => {e.preventDefault();const date=e.currentTarget.elements.dayOff.value.replaceAll("-","/");try{await api(`/provider/doctors/${doctorId}/days-off`,{method:"POST",body:JSON.stringify({date})});setDaysOff(old=>old.includes(date)?old:[...old,date]);e.target.reset();setMessage(t.adminScheduleSaved);}catch(e){setMessage(e.message);}};
  const removeDayOff = async date => {try{await api(`/provider/doctors/${doctorId}/days-off/${date.replaceAll("/","-")}`,{method:"DELETE"});setDaysOff(old=>old.filter(x=>x!==date));}catch(e){setMessage(e.message);}};
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
    <section className="bg-white dark:bg-slate-800 dark:text-white rounded-2xl shadow-md p-6 mt-6">
      <h2 className="text-xl font-bold mb-5">{t.adminSchedule}</h2>
      {!doctors.length ? <p className="text-gray-500">{t.providerNoLinkedDoctors}</p> : <>
        <label className="block mb-4">{t.registerDoctor}<select value={doctorId} onChange={e=>setDoctorId(e.target.value)} className="block w-full mt-2 border rounded-xl p-3 dark:bg-slate-700 dark:border-slate-600">{doctors.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
        <form onSubmit={saveSchedule} className="grid sm:grid-cols-2 gap-4">
          <label>{t.adminWeekday}<select value={weekday} onChange={e=>setWeekday(Number(e.target.value))} className="block w-full border rounded-xl p-3 mt-2 dark:bg-slate-700 dark:border-slate-600">{t.adminDays.map((day,i)=><option key={i} value={i}>{day}</option>)}</select></label>
          <label>{t.adminSlotMinutes}<input type="number" min="10" max="120" value={slotMinutes} onChange={e=>setSlotMinutes(e.target.value)} className="block w-full border rounded-xl p-3 mt-2 dark:bg-slate-700 dark:border-slate-600"/></label>
          <label>{t.adminStartTime}<input type="time" value={startTime} onChange={e=>setStartTime(e.target.value)} className="block w-full border rounded-xl p-3 mt-2 dark:bg-slate-700 dark:border-slate-600"/></label>
          <label>{t.adminEndTime}<input type="time" value={endTime} onChange={e=>setEndTime(e.target.value)} className="block w-full border rounded-xl p-3 mt-2 dark:bg-slate-700 dark:border-slate-600"/></label>
          <label className="flex gap-2 items-center"><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/> Available on this weekday</label>
          <button className="sm:col-span-2 bg-teal-600 text-white rounded-xl p-3 cursor-pointer">{t.profileSave}</button>
        </form>
        <h3 className="font-semibold mt-5">{t.providerWeeklySchedule}</h3>
        {schedule.map(d=><p key={d.weekday} className="text-sm mt-2">{t.adminDays[d.weekday]}: {d.start_time} - {d.end_time} ({d.slot_minutes} {t.adminSlotMinutes}) {d.enabled ? "✓" : "— Unavailable"}</p>)}
        <form onSubmit={addDayOff} className="mt-6 border-t dark:border-slate-700 pt-6 flex flex-wrap gap-3 items-end"><label>{t.adminDayOff}<input type="date" name="dayOff" required className="block border rounded-xl p-3 mt-2 dark:bg-slate-700 dark:border-slate-600"/></label><button className="bg-amber-100 text-amber-800 rounded-xl px-5 py-3 cursor-pointer">{t.adminAddDayOff}</button></form>
        {daysOff.map(date=><div key={date} className="flex items-center gap-3 mt-2"><span>{date}</span><button type="button" onClick={()=>removeDayOff(date)} className="text-red-600 underline cursor-pointer">{t.providerRemoveDayOff}</button></div>)}
      </>}
    </section>
    <section className="bg-white dark:bg-slate-800 dark:text-white rounded-2xl shadow-md p-6 mt-6"><h2 className="text-xl font-bold flex items-center gap-2"><CalendarDays className="text-teal-600"/>{t.adminAppointments}</h2>
      {!appointments.length && <p className="text-gray-500 mt-5">{t.adminEmpty}</p>}
      {appointments.map(a=><div key={a.id} className="flex flex-wrap items-center justify-between gap-3 border-b dark:border-slate-700 py-4"><div><p className="font-bold">{a.patient_name}</p><p className="text-sm text-gray-500">{a.date} · {a.time} · {a.status}</p></div><div className="flex gap-2"><button onClick={()=>status(a,"confirmed")} className="bg-teal-600 text-white rounded-lg px-3 py-2 cursor-pointer">{t.adminConfirm}</button><button onClick={()=>status(a,"cancelled")} className="bg-red-100 text-red-700 rounded-lg px-3 py-2 cursor-pointer">{t.adminCancel}</button><button onClick={async()=>{if(!window.confirm("Cancel this appointment?"))return;try{await api(`/provider/appointments/${a.id}`,{method:"DELETE"});await load();}catch(e){setMessage(e.message);}}} className="border border-red-500 text-red-600 rounded-lg px-3 py-2 cursor-pointer">Remove</button></div></div>)}
    </section>
  </div></main>;
}
