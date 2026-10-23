import { useEffect, useState } from "react";
import { api } from "../api";
import { translations } from "../data/translations";
import { Stethoscope, Save, CalendarDays, Building2 } from "lucide-react";
import MultiDatePicker from "react-multi-date-picker";
const DatePicker = MultiDatePicker.default || MultiDatePicker;
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import gregorian from "react-date-object/calendars/gregorian";
import persian_fa from "react-date-object/locales/persian_fa";

export default function ProviderDashboard({ language, facility = false }) {
  const t = translations[language];
  const [profiles, setProfiles] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [editingDate, setEditingDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [slotMinutes, setSlotMinutes] = useState(30);
  const [daysOff, setDaysOff] = useState([]);
  const [dayOffDate, setDayOffDate] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [message, setMessage] = useState("");
  const load = async () => {
    try { const [p,a,d]=await Promise.all([api("/provider/dashboard"),api("/provider/appointments"),api("/provider/doctors")]);setProfiles(p.filter(x => facility ? x.provider_type !== "doctor" : x.provider_type === "doctor"));setAppointments(a);setDoctors(d);if(d.length)setDoctorId(old=>old||String(d[0].id)); }
    catch(e){setMessage(e.message);}
  };
  useEffect(()=>{load();},[]);
  const refreshDates = async () => {
    const [available, scheduleData] = await Promise.all([
      api(`/provider/doctors/${doctorId}/available-dates`),
      api(`/provider/doctors/${doctorId}/schedule`)
    ]);
    setAvailableDates(available);
    setDaysOff(scheduleData.daysOff);
  };
  useEffect(()=>{if(doctorId)refreshDates().catch(e=>setMessage(e.message));},[doctorId]);
  // Convert the selected Jalali date to an ordinary JavaScript Date, then
  // format using ASCII digits so the backend date validator accepts it.
  const toGregorian = value => {
    const date = value.toDate();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };
  const toJalali = value => new DateObject({date:value,format:"YYYY/MM/DD",calendar:gregorian}).convert(persian).format("YYYY/MM/DD");
  const saveSchedule = async e => {
    e.preventDefault();
    const dates = selectedDates.map(toGregorian);
    if(!dates.length) {setMessage("Select at least one date.");return;}
    try {
      await api(`/provider/doctors/${doctorId}/available-dates`,{method:"PUT",body:JSON.stringify({dates,startTime,endTime,slotMinutes:Number(slotMinutes)})});
      await refreshDates();
      setSelectedDates([]);setEditingDate("");setMessage(t.adminScheduleSaved);
    } catch(e){setMessage(e.message);}
  };
  const editSchedule = item => {
    setSelectedDates([new DateObject({date:item.date,format:"YYYY/MM/DD",calendar:gregorian}).convert(persian)]);
    setEditingDate(item.date);
    setStartTime(item.start_time);setEndTime(item.end_time);setSlotMinutes(item.slot_minutes);
  };
  const removeSchedule = async date => {
    if(!window.confirm("Remove this available date?"))return;
    try {await api(`/provider/doctors/${doctorId}/available-dates/${date.replaceAll("/","-")}`,{method:"DELETE"});await refreshDates();setMessage("");}
    catch(e){setMessage(e.message);}
  };
  const addDayOff = async e => {e.preventDefault();const date=dayOffDate ? toGregorian(dayOffDate) : "";if(!date)return;try{await api(`/provider/doctors/${doctorId}/days-off`,{method:"POST",body:JSON.stringify({date})});await refreshDates();setDayOffDate(null);setMessage(t.adminScheduleSaved);}catch(e){setMessage(e.message);}};
  const removeDayOff = async date => {try{await api(`/provider/doctors/${doctorId}/days-off/${date.replaceAll("/","-")}`,{method:"DELETE"});await refreshDates();}catch(e){setMessage(e.message);}};
  const edit = (id,key,value) => setProfiles(profiles.map(p=>p.id===id?{...p,[key]:value}:p));
  const save = async p => {
    try { await api(`/provider/dashboard/${p.id}`,{method:"PATCH",body:JSON.stringify({name:p.name,phone:p.phone,address:p.address,city:p.city,specialty:p.specialty,description:p.description,services:p.services,active:p.active})});setMessage(t.providerSaved); }
    catch(e){setMessage(e.message);}
  };
  const status = async (a,s) => {
    try {await api(`/provider/appointments/${a.id}`,{method:"PATCH",body:JSON.stringify({status:s})});await load();}
    catch(e){setMessage(e.message);}
  };
  const fields = [["name",facility ? (language === "Persian" ? "نام شفاخانه / کلینیک" : language === "English" ? "Hospital / Clinic name" : "د روغتون / کلینیک نوم") : t.fullName],["phone",t.phoneNumber],["city",t.profileCity],["address",t.profileAddress],["specialty",t.providerSpecialty],["services",t.providerServices],["description",t.profileBio]];
  return <main className="min-h-screen bg-teal-50 dark:bg-slate-900 px-4 py-12"><div className="max-w-5xl mx-auto">
    <header className="bg-gradient-to-r from-teal-700 to-cyan-600 rounded-3xl p-8 text-white shadow-lg">
      {profiles[0]?.provider_type === "doctor" ? <Stethoscope size={38}/> : <Building2 size={38}/>}
      <h1 className="text-3xl font-bold mt-3">{language === "English" ? `Hello, ${profiles[0]?.name || ""}! Welcome` : language === "Persian" ? `سلام ${profiles[0]?.name || ""}، خوش آمدید!` : `سلام ${profiles[0]?.name || ""}، ښه راغلاست!`}</h1>
      <p className="mt-2 text-teal-50">{profiles[0]?.provider_type === "doctor" ? t.registerDoctor : profiles[0]?.provider_type === "clinic" ? t.registerClinic : t.registerHospital} — {t.providerDashboard}</p>
    </header>
    {facility && <p className="mt-4 text-teal-800 dark:text-teal-200">{language === "English" ? "Hospital / Clinic management" : language === "Persian" ? "مدیریت شفاخانه و کلینیک" : "د روغتون او کلینیک مدیریت"}</p>}
    {message && <p className="mt-5 p-4 rounded-xl bg-white dark:bg-slate-800 text-teal-700">{message}</p>}
    {!profiles.length && <p className="mt-6 text-amber-700">{language === "Persian" ? "حساب تأییدشده‌ای برای این پنل پیدا نشد." : "No approved profile was found for this dashboard."}</p>}
    {profiles.map(p=><section key={p.id} className="bg-white dark:bg-slate-800 dark:text-white rounded-2xl shadow-md p-6 mt-6">
      <h2 className="text-xl font-bold mb-5">{p.provider_type==="doctor"?t.registerDoctor:p.provider_type==="clinic"?t.registerClinic:t.registerHospital} {p.name}</h2>
      <div className="grid md:grid-cols-2 gap-4">{fields.filter(([key]) => p.provider_type === "doctor" || key !== "specialty").map(([key,label])=><label key={key} className="block text-sm font-medium">{label}{key==="services"||key==="description"?<textarea rows={3} value={p[key]||""} onChange={e=>edit(p.id,key,e.target.value)} className="mt-2 block w-full rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-700 p-3"/>:<input value={p[key]||""} onChange={e=>edit(p.id,key,e.target.value)} className="mt-2 block w-full rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-700 p-3"/>}</label>)}</div>
      <label className="flex gap-2 items-center mt-5"><input type="checkbox" checked={p.active} onChange={e=>edit(p.id,"active",e.target.checked)}/>{t.providerActive}</label>
      <button onClick={()=>save(p)} className="flex items-center gap-2 mt-5 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition cursor-pointer"><Save size={18}/>{t.profileSave}</button>
    </section>)}
    <section className="bg-white dark:bg-slate-800 dark:text-white rounded-2xl shadow-md p-6 mt-6">
      <h2 className="text-xl font-bold mb-5">{t.adminSchedule}</h2>
      {!doctors.length ? <p className="text-gray-500">{t.providerNoLinkedDoctors}</p> : <>
        {doctors.length > 1 && <label className="block mb-4">{t.registerDoctor}<select value={doctorId} onChange={e=>setDoctorId(e.target.value)} className="block w-full mt-2 border rounded-xl p-3 dark:bg-slate-700 dark:border-slate-600">{doctors.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label>}
        <form onSubmit={saveSchedule} className="grid sm:grid-cols-2 gap-4">
          <label className="sm:col-span-2">{language === "Persian" ? "تاریخ‌های کاری را انتخاب کنید (شمسی)" : language === "English" ? "Choose available dates (Jalali)" : "د کار نېټې وټاکئ (هجري لمریز)"}
            <div className="mt-2"><DatePicker multiple value={selectedDates} onChange={setSelectedDates} calendar={persian} locale={persian_fa} minDate={new Date()} format="YYYY/MM/DD" inputClass="w-full border rounded-xl p-3 dark:bg-slate-700 dark:border-slate-600"/></div>
          </label>
          <label>{t.adminStartTime}<input type="time" value={startTime} onChange={e=>setStartTime(e.target.value)} className="block w-full border rounded-xl p-3 mt-2 dark:bg-slate-700 dark:border-slate-600"/></label>
          <label>{t.adminEndTime}<input type="time" value={endTime} onChange={e=>setEndTime(e.target.value)} className="block w-full border rounded-xl p-3 mt-2 dark:bg-slate-700 dark:border-slate-600"/></label>
          <label>{t.adminSlotMinutes}<input type="number" min="10" max="120" value={slotMinutes} onChange={e=>setSlotMinutes(e.target.value)} className="block w-full border rounded-xl p-3 mt-2 dark:bg-slate-700 dark:border-slate-600"/></label>
          <button className="sm:col-span-2 bg-teal-600 text-white rounded-xl p-3 cursor-pointer">{editingDate ? "Save Changes" : t.profileSave}</button>
        </form>
        <h3 className="font-semibold mt-7">{language === "Persian" ? "تاریخ‌های ثبت‌شده" : "Available dates"}</h3>
        <div className="mt-3 space-y-3">
          {availableDates.map(item=><div key={item.date} className="border-l-4 border-green-500 bg-green-50 dark:bg-slate-700 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div><p className="font-semibold text-green-800 dark:text-green-300">{toJalali(item.date)}</p><p className="text-sm text-gray-600 dark:text-gray-200">{item.start_time} - {item.end_time} · {item.slot_minutes} min</p></div>
            <div className="flex gap-2"><button type="button" onClick={()=>editSchedule(item)} className="px-4 py-2 border border-teal-500 text-teal-700 dark:text-teal-300 rounded-lg">Edit</button><button type="button" onClick={()=>removeSchedule(item.date)} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg">Delete</button></div>
          </div>)}
          {!availableDates.length && <p className="text-sm text-gray-500">No available dates selected yet.</p>}
        </div>
        <div className="mt-7 border-t dark:border-slate-700 pt-6">
          <h3 className="font-semibold mb-3">{t.adminDayOff}</h3>
          <form onSubmit={addDayOff} className="flex flex-wrap gap-3 items-end bg-amber-50 dark:bg-slate-700 rounded-xl p-4"><label>{t.adminDayOff}<DatePicker value={dayOffDate} onChange={setDayOffDate} calendar={persian} locale={persian_fa} minDate={new Date()} format="YYYY/MM/DD" inputClass="block border rounded-xl p-3 mt-2 dark:bg-slate-600 dark:border-slate-500"/></label><button className="bg-amber-500 text-white rounded-xl px-5 py-3 cursor-pointer">{t.adminAddDayOff}</button></form>
          <div className="mt-3 space-y-2">{daysOff.map(date=><div key={date} className="flex items-center justify-between gap-3 rounded-xl bg-amber-50 dark:bg-slate-700 border-l-4 border-amber-400 p-3"><span>{toJalali(date)}</span><button type="button" onClick={()=>removeDayOff(date)} className="text-red-600 border border-red-300 px-3 py-2 rounded-lg">{t.providerRemoveDayOff}</button></div>)}</div>
        </div>
      </>}
    </section>
    <section className="bg-white dark:bg-slate-800 dark:text-white rounded-2xl shadow-md p-6 mt-6"><h2 className="text-xl font-bold flex items-center gap-2"><CalendarDays className="text-teal-600"/>{t.adminAppointments}</h2>
      {!appointments.length && <p className="text-gray-500 mt-5">{t.adminEmpty}</p>}
      {appointments.map(a=><div key={a.id} className="flex flex-wrap items-center justify-between gap-3 border-b dark:border-slate-700 py-4"><div><p className="font-bold">{a.patient_name}</p><p className="text-sm text-gray-500">{a.date} · {a.time} · {a.status}</p></div><div className="flex gap-2"><button onClick={()=>status(a,"confirmed")} className="bg-teal-600 text-white rounded-lg px-3 py-2 cursor-pointer">{t.adminConfirm}</button><button onClick={()=>status(a,"cancelled")} className="bg-red-100 text-red-700 rounded-lg px-3 py-2 cursor-pointer">{t.adminCancel}</button><button onClick={async()=>{if(!window.confirm("Cancel this appointment?"))return;try{await api(`/provider/appointments/${a.id}`,{method:"DELETE"});await load();}catch(e){setMessage(e.message);}}} className="border border-red-500 text-red-600 rounded-lg px-3 py-2 cursor-pointer">Remove</button></div></div>)}
    </section>
  </div></main>;
}
