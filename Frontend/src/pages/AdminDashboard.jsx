import { useEffect, useState } from "react";
import { api, API_URL } from "../api";
import { translations } from "../data/translations";
import { ShieldCheck, Mail, CalendarDays, ClipboardCheck, RefreshCw, Building2 } from "lucide-react";

export default function AdminDashboard({ language }) {
  const t = translations[language];
  const [tab, setTab] = useState("requests");
  const [requests, setRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState(1);
  const [weekday, setWeekday] = useState(0);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [slotMinutes, setSlotMinutes] = useState(30);
  const [notes, setNotes] = useState({});
  const [replies, setReplies] = useState({});
  const [documents, setDocuments] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setError(""); setLoading(true);
    try {
      const [r, a, c, p, d] = await Promise.all([api("/admin/provider-requests"), api("/admin/appointments"), api("/admin/contacts"), api("/admin/providers"), api("/admin/doctors")]);
      setRequests(r); setAppointments(a); setContacts(c); setProviders(p); setDoctors(d);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const decide = async (r, status) => {
    const note = notes[r.id] || "";
    if (status === "rejected" && !note.trim()) { setError(t.adminReasonRequired); return; }
    try { await api(`/admin/provider-requests/${r.id}`, { method: "PATCH", body: JSON.stringify({ status, note }) }); await load(); }
    catch (e) { setError(e.message); }
  };
  const showDocuments = async id => {
    try { const result = await api(`/admin/provider-requests/${id}/documents`); setDocuments({...documents,[id]:result}); }
    catch(e){setError(e.message);}
  };
  const downloadDocument = async d => {
    try {
      const response=await fetch(`${API_URL}/api/admin/documents/${d.id}`,{credentials:"include"});
      if(!response.ok)throw new Error("Download failed");
      const url=URL.createObjectURL(await response.blob());
      const a=document.createElement("a");a.href=url;a.download="provider-document.pdf";a.click();URL.revokeObjectURL(url);
    } catch(e){setError(e.message);}
  };
  const changeAppointment = async (id, status) => {
    try { await api(`/admin/appointments/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }); await load(); }
    catch (e) { setError(e.message); }
  };
  const changeContact = async (c, status) => {
    try { await api(`/admin/contacts/${c.id}`, { method: "PATCH", body: JSON.stringify({ status, reply: replies[c.id] ?? c.admin_reply ?? "" }) }); await load(); }
    catch (e) { setError(e.message); }
  };
  const saveSchedule = async e => {
    e.preventDefault();
    try { await api(`/admin/doctors/${doctorId}/schedule`,{method:"PUT",body:JSON.stringify({weekday:Number(weekday),startTime,endTime,slotMinutes:Number(slotMinutes),enabled:true})});setError("");alert(t.adminScheduleSaved); }
    catch(e){setError(e.message);}
  };
  const addDayOff = async e => {
    e.preventDefault();
    const date=e.currentTarget.elements.dayOff.value.replaceAll("-","/");
    try {await api(`/admin/doctors/${doctorId}/days-off`,{method:"POST",body:JSON.stringify({date})});alert(t.adminScheduleSaved);}
    catch(e){setError(e.message);}
  };
  const toggleProvider = async p => {
    try { await api(`/admin/providers/${p.id}`, { method: "PATCH", body: JSON.stringify({ active: !p.active }) }); await load(); }
    catch (e) { setError(e.message); }
  };
  const title = r => {
    let d = {}; try { d = JSON.parse(r.details); } catch {}
    return `${r.provider_type === "clinic" || d.type === "clinic" ? t.registerClinic : r.provider_type === "hospital" || d.type === "hospital" ? t.registerHospital : t.registerDoctor} ${r.name}`;
  };
  const tabs = [{ id: "requests", name: t.adminRequests, icon: ClipboardCheck, count: requests.filter(r=>r.status==="pending").length }, { id: "contacts", name: t.adminMessages, icon: Mail, count: contacts.filter(c=>c.status==="unread").length }, { id: "appointments", name: t.adminAppointments, icon: CalendarDays, count: appointments.length }, { id: "providers", name: t.adminProviders, icon: Building2, count: providers.length }, { id: "schedule", name: t.adminSchedule, icon: CalendarDays, count: doctors.length }];
  return <main className="min-h-screen bg-teal-50/60 dark:bg-slate-900 px-4 py-12">
    <div className="max-w-6xl mx-auto">
      <div className="rounded-3xl bg-gradient-to-r from-teal-700 to-cyan-600 text-white p-8 shadow-lg flex flex-wrap justify-between gap-4 items-center">
        <div><ShieldCheck size={36}/><h1 className="text-3xl font-bold mt-3">{t.adminTitle}</h1><p className="text-teal-50 mt-2">{t.adminSubtitle}</p></div>
        <button onClick={load} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-xl px-5 py-3 transition cursor-pointer"><RefreshCw size={18}/>{t.adminRefresh}</button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
        {tabs.map(item => <button key={item.id} onClick={()=>setTab(item.id)} className={`rounded-2xl p-4 text-start shadow-sm border transition hover:-translate-y-1 cursor-pointer ${tab===item.id?"bg-teal-600 text-white border-teal-600":"bg-white dark:bg-slate-800 dark:text-white border-gray-100 dark:border-slate-700"}`}><item.icon size={24}/><p className="font-semibold mt-3">{item.name}</p><p className="text-2xl font-bold mt-1">{item.count}</p></button>)}
      </div>
      {error && <p role="alert" className="bg-red-50 text-red-700 rounded-xl p-4 mt-5">{error}</p>}
      {loading ? <p className="p-6 dark:text-white">{t.loadingText}</p> : <div className="mt-7 space-y-4">
        {tab === "requests" && (requests.length ? requests.map(r=><article key={r.id} className="bg-white dark:bg-slate-800 dark:text-white rounded-2xl shadow-sm p-6 transition hover:shadow-lg">
          <div className="flex justify-between flex-wrap gap-3"><div><h3 className="font-bold text-lg">{title(r)}</h3><p className="text-sm text-gray-500 dark:text-gray-300 mt-1">{r.email} · {r.phone}</p></div><span className={`rounded-full px-4 py-2 h-fit text-sm ${r.status==="approved"?"bg-green-100 text-green-700":r.status==="rejected"?"bg-red-100 text-red-700":"bg-amber-100 text-amber-700"}`}>{r.status==="approved"?t.requestApproved:r.status==="rejected"?t.requestRejected:t.requestPending}</span></div>
          <p className="text-sm mt-4 text-gray-600 dark:text-gray-300 whitespace-pre-wrap break-words">{r.details}</p>
          <button onClick={()=>showDocuments(r.id)} className="mt-4 text-teal-600 underline cursor-pointer">{t.adminDocuments}</button>
          {documents[r.id]?.map(d=><button key={d.id} onClick={()=>downloadDocument(d)} className="block text-sm mt-2 text-teal-600 underline cursor-pointer">{d.original_name} — {t.adminDownloadHint} #{d.id}</button>)}
          <label className="block mt-5 mb-2 text-sm font-semibold">{t.adminReviewNote}</label><textarea value={notes[r.id] ?? r.review_note ?? ""} onChange={e=>setNotes({...notes,[r.id]:e.target.value})} rows={2} className="w-full rounded-xl border p-3 dark:bg-slate-700 dark:border-slate-600" placeholder={t.adminReviewPlaceholder}/>
          <div className="flex gap-3 mt-3"><button onClick={()=>decide(r,"approved")} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-5 py-2 transition cursor-pointer">{t.adminApprove}</button><button onClick={()=>decide(r,"rejected")} className="bg-red-100 hover:bg-red-200 text-red-700 rounded-xl px-5 py-2 transition cursor-pointer">{t.adminReject}</button></div>
        </article>) : <p className="dark:text-white">{t.adminEmpty}</p>)}
        {tab === "contacts" && (contacts.length ? contacts.map(c=><article key={c.id} className="bg-white dark:bg-slate-800 dark:text-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between gap-3"><div><h3 className="font-bold">{c.name}</h3><p className="text-sm text-teal-600">{c.email}</p></div><span className="text-sm text-gray-500">{c.status}</span></div>
          <p className="whitespace-pre-wrap mt-4">{c.message}</p><textarea value={replies[c.id] ?? c.admin_reply ?? ""} onChange={e=>setReplies({...replies,[c.id]:e.target.value})} className="mt-4 w-full border rounded-xl p-3 dark:bg-slate-700 dark:border-slate-600" rows={3} placeholder={t.adminReplyPlaceholder}/>
          <div className="flex gap-3 mt-3"><button onClick={()=>changeContact(c,"read")} className="border border-teal-600 text-teal-700 dark:text-teal-300 rounded-xl px-4 py-2 cursor-pointer">{t.adminMarkRead}</button><button onClick={()=>changeContact(c,"replied")} className="bg-teal-600 text-white rounded-xl px-4 py-2 cursor-pointer">{t.adminSaveReply}</button></div>
        </article>) : <p className="dark:text-white">{t.adminEmpty}</p>)}
        {tab === "appointments" && (appointments.length ? appointments.map(a=><article key={a.id} className="bg-white dark:bg-slate-800 dark:text-white rounded-2xl p-5 shadow-sm flex flex-wrap justify-between gap-4 items-center"><div><h3 className="font-bold">{a.patient_name}</h3><p className="text-sm text-gray-500 dark:text-gray-300">#{a.doctor_id} · {a.date} · {a.time} · {a.status}</p></div><div className="flex gap-2"><button onClick={()=>changeAppointment(a.id,"confirmed")} className="bg-teal-600 text-white px-4 py-2 rounded-lg cursor-pointer">{t.adminConfirm}</button><button onClick={()=>changeAppointment(a.id,"cancelled")} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg cursor-pointer">{t.adminCancel}</button></div></article>) : <p className="dark:text-white">{t.adminEmpty}</p>)}
        {tab === "schedule" && <div className="bg-white dark:bg-slate-800 dark:text-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-xl mb-5">{t.adminSchedule}</h2>
          <label className="block mb-4">{t.registerDoctor}<select value={doctorId} onChange={e=>setDoctorId(Number(e.target.value))} className="block w-full mt-2 border rounded-xl p-3 dark:bg-slate-700 dark:border-slate-600">{doctors.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
          <form onSubmit={saveSchedule} className="grid sm:grid-cols-2 gap-4">
            <label>{t.adminWeekday}<select value={weekday} onChange={e=>setWeekday(Number(e.target.value))} className="block w-full border rounded-xl p-3 mt-2 dark:bg-slate-700 dark:border-slate-600">{t.adminDays.map((day,i)=><option key={day} value={i}>{day}</option>)}</select></label>
            <label>{t.adminSlotMinutes}<input type="number" min="10" max="120" value={slotMinutes} onChange={e=>setSlotMinutes(e.target.value)} className="block w-full border rounded-xl p-3 mt-2 dark:bg-slate-700 dark:border-slate-600"/></label>
            <label>{t.adminStartTime}<input type="time" value={startTime} onChange={e=>setStartTime(e.target.value)} className="block w-full border rounded-xl p-3 mt-2 dark:bg-slate-700 dark:border-slate-600"/></label>
            <label>{t.adminEndTime}<input type="time" value={endTime} onChange={e=>setEndTime(e.target.value)} className="block w-full border rounded-xl p-3 mt-2 dark:bg-slate-700 dark:border-slate-600"/></label>
            <button className="sm:col-span-2 bg-teal-600 text-white rounded-xl p-3 cursor-pointer">{t.profileSave}</button>
          </form>
          <form onSubmit={addDayOff} className="mt-6 border-t dark:border-slate-700 pt-6 flex flex-wrap gap-3 items-end"><label>{t.adminDayOff}<input type="date" name="dayOff" required className="block border rounded-xl p-3 mt-2 dark:bg-slate-700 dark:border-slate-600"/></label><button className="bg-amber-100 text-amber-800 rounded-xl px-5 py-3 cursor-pointer">{t.adminAddDayOff}</button></form>
        </div>}
        {tab === "providers" && (providers.length ? providers.map(p=><article key={p.id} className="bg-white dark:bg-slate-800 dark:text-white rounded-2xl p-5 shadow-sm flex flex-wrap justify-between gap-4 items-center"><div><h3 className="font-bold">{p.provider_type==="doctor"?t.registerDoctor:p.provider_type==="clinic"?t.registerClinic:t.registerHospital} {p.name}</h3><p className="text-sm text-gray-500 dark:text-gray-300">{p.city} · {p.phone}</p></div><button onClick={()=>toggleProvider(p)} className={`px-4 py-2 rounded-xl cursor-pointer ${p.active?"bg-red-100 text-red-700":"bg-green-100 text-green-700"}`}>{p.active?t.adminDeactivate:t.adminActivate}</button></article>) : <p className="dark:text-white">{t.adminEmpty}</p>)}
      </div>}
    </div>
  </main>;
}
