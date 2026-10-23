import { useEffect, useState } from "react";
import { api, API_URL } from "../api";
import { translations } from "../data/translations";
import { ShieldCheck, Mail, CalendarDays, ClipboardCheck, RefreshCw, Building2, Stethoscope, Tags, Pencil, Trash2, Save, X } from "lucide-react";

export default function AdminDashboard({ language }) {
  const t = translations[language];
  const [tab, setTab] = useState(new URLSearchParams(window.location.search).get("tab") || "requests");
  const [requests, setRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [specialtiesList, setSpecialtiesList] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [notes, setNotes] = useState({});
  const [replies, setReplies] = useState({});
  const [openReplyId, setOpenReplyId] = useState(null);
  const [contactBusyId, setContactBusyId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);
  const [catalogAccounts, setCatalogAccounts] = useState({doctors:[],hospitals:[]});
  const [assigning, setAssigning] = useState(null);
  const [assignEmail, setAssignEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [translationEditor,setTranslationEditor] = useState(null);
  const [translationBusy,setTranslationBusy] = useState(false);
  const [sourceLanguage,setSourceLanguage] = useState("fa");
  const openTranslation = async (kind,item) => {
    try {const result=await api(`/admin/profile-translations/${kind}/${item.id}`);setTranslationEditor({kind,id:item.id,name:item.name,translations:result.translations||{},approved:result.approved});setSourceLanguage("fa");setError("");}
    catch(e){setError(e.message);}
  };
  const generateTranslation = async () => {
    setError("");
    setTranslationBusy(true);
    try {const result=await api('/admin/profile-translations/suggest',{method:'POST',body:JSON.stringify({kind:translationEditor.kind,id:translationEditor.id,sourceLanguage,sourceFields:translationEditor.translations?.[sourceLanguage]||{}})});setTranslationEditor(prev=>({...prev,translations:Object.fromEntries(["fa","ps","en"].map(lang=>[lang,{...result.translations?.[lang],...Object.fromEntries(Object.entries(prev.translations?.[lang]||{}).filter(([,value])=>String(value||"").trim()))}])),approved:false}));}
    catch(e){setError(e.message);}finally{setTranslationBusy(false);}
  };
  const saveTranslation = async approved => {
    setTranslationBusy(true);
    try {await api(`/admin/profile-translations/${translationEditor.kind}/${translationEditor.id}`,{method:'PUT',body:JSON.stringify({translations:translationEditor.translations,approved})});setTranslationEditor(null);setEmailMessage(approved?'Translations approved and published.':'Translation draft saved.');}
    catch(e){setError(e.message);}finally{setTranslationBusy(false);}
  };
  const load = async () => {
    setError(""); setLoading(true);
    try {
      const [r, a, c, p, d, h, sp] = await Promise.all([api("/admin/provider-requests"), api("/admin/appointments"), api("/admin/contacts"), api("/admin/providers"), api("/admin/doctors"), api("/admin/hospitals"), api("/specialties")]);
      setRequests(r); setAppointments(a); setContacts(c); setProviders(p); setDoctors(d); setHospitals(h); setSpecialtiesList(sp);
      const accounts = await api("/admin/catalog-accounts");
      setCatalogAccounts(accounts);
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
  const changeProviderEmail = async p => {
    const newEmail = window.prompt(`New email for ${p.name}:`, p.email || "");
    if (!newEmail || newEmail.trim().toLowerCase() === (p.email || "").toLowerCase()) return;
    if (!window.confirm(`Send a verification link to ${newEmail.trim()}? The existing email remains active until verified.`)) return;
    try {
      const result = await api(`/admin/providers/${p.id}/change-email`, {method:"POST",body:JSON.stringify({email:newEmail.trim()})});
      setEmailMessage(result.message); setError("");
    } catch (e) {setError(e.message);}
  };
  const assignAccount = async () => {
    setError(""); setEmailMessage("");
    if (!assigning || !assignEmail.trim()) return;
    setSendingId(assigning.id);
    try {
      const result = await api("/admin/assign-account", {method:"POST",body:JSON.stringify({type:assigning.type,id:assigning.id,email:assignEmail.trim()})});
      setAssigning(null); setAssignEmail("");
      await load(); setEmailMessage(result.message);
    } catch(e) {setError(e.message);await load();}
    finally {setSendingId(null);}
  };
  const resendActivation = async (id) => {
    setError("");
    setEmailMessage("");
    setSendingId(id);
    try {
      await api(`/admin/providers/${id}/resend-activation`, { method: "POST" });
      setEmailMessage("Activation email sent successfully.");
    } catch (e) {
      setError(e.message);
    } finally {
      setSendingId(null);
    }
  };
  useEffect(()=>{
    const editId=Number(new URLSearchParams(window.location.search).get("edit"));
    if(!editId || loading || editing) return;
    const kind=tab === "doctors" ? "doctor" : tab === "hospitals" ? "hospital" : tab === "specialties" ? "specialty" : "";
    const item=(kind === "doctor" ? doctors : kind === "hospital" ? hospitals : specialtiesList).find(x=>x.id===editId);
    if(item && kind) startEdit(kind,item);
  },[loading,tab,doctors,hospitals,specialtiesList]);
  const changeAppointment = async (id, status) => {
    try { await api(`/admin/appointments/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }); await load(); }
    catch (e) { setError(e.message); }
  };
  const deleteContact = async c => {
    if (!window.confirm(t.adminDeleteContactConfirm || 'Delete this message permanently?')) return;
    setError(''); setContactBusyId(c.id);
    try {
      await api(`/admin/contacts/${c.id}`, {method:'DELETE'});
      setContacts(previous => previous.filter(item => item.id !== c.id));
    } catch(e) { setError(e.message); }
    finally { setContactBusyId(null); }
  };
  const sendContactReply = async c => {
    const reply = (replies[c.id] ?? '').trim();
    if (!reply) { setError(t.adminReplyRequired || 'Write your reply first.'); return; }
    setError(''); setEmailMessage(''); setContactBusyId(c.id);
    try {
      await api(`/admin/contacts/${c.id}/reply`, {method:'POST',body:JSON.stringify({reply})});
      setEmailMessage(t.adminReplySent || 'Reply email sent successfully.');
      setOpenReplyId(null);
      setReplies(previous => ({...previous,[c.id]:''}));
      await load();
    } catch(e) { setError(e.message); }
    finally { setContactBusyId(null); }
  };
  const toggleProvider = async p => {
    try { await api(`/admin/providers/${p.id}`, { method: "PATCH", body: JSON.stringify({ active: !p.active }) }); await load(); }
    catch (e) { setError(e.message); }
  };
  const deleteProvider = async p => {
    if (!window.confirm(`Delete provider "${p.name}"? This action cannot be undone. The user login will remain.`)) return;
    try { await api(`/admin/providers/${p.id}`, { method: "DELETE" }); await load(); }
    catch (e) { setError(e.message); }
  };
  const startEdit = (kind, item) => {
    setEditing(`${kind}-${item.id}`);
    setForm(kind === "doctor" ? {name:item.name,email:item.email || "",specialty:item.specialty_value,hospitalId:hospitals.find(h=>h.name===item.hospital)?.id || "",city:item.city,about:item.about || "",experience:item.experience || "",education:item.education || "",image:item.image || ""} : kind === "hospital" ? {name:item.name,city:item.city,location:item.location,type:item.type_value || "private",phone:item.phone || "",license:item.license_number || "",services:item.services || "",description:item.description || "",image:item.image || ""} : {name:item.name,value:item.value,department:item.department || "",image:item.image || ""});
  };
  const saveItem = async (kind, id) => {
    if(kind === "hospital" && (!form.name || !form.city || !form.location || !form.phone || !form.license)){setError("Complete the hospital name, city, address, phone and license number");return;}
    if(kind === "specialty" && (!form.image || !form.department || !form.name || !form.value)){setError("Name, code, department and image are required");return;}
    try { await api(`/admin/${kind === "doctor" ? "doctors" : kind === "hospital" ? "hospitals" : "specialties"}/${id}`, {method:"PATCH",body:JSON.stringify(form)});setEditing(null);await load(); }
    catch(e){setError(e.message);}
  };
  const deleteItem = async (kind, id) => {
    if (!window.confirm("Delete this item? This action cannot be undone.")) return;
    try {await api(`/admin/${kind === "doctor" ? "doctors" : kind === "hospital" ? "hospitals" : "specialties"}/${id}`,{method:"DELETE"});await load();}
    catch(e){setError(e.message);}
  };
  const uploadSpecialtyPhoto = async file => {
    if (!file) return;
    setUploadingImage(true);setError("");
    try {
      const body=new FormData();body.append("photo",file);
      const response=await fetch(`${API_URL}/api/admin/specialties/photo`,{method:"POST",credentials:"include",body});
      const result=await response.json();
      if(!response.ok)throw new Error(result.message || "Upload failed");
      setForm(previous=>({...previous,image:result.image}));
    }catch(e){setError(e.message);}finally{setUploadingImage(false);}
  };
  const uploadCatalogPhoto = async file => {
    if (!file) return;
    setUploadingImage(true);setError("");
    try {
      const body = new FormData();body.append("photo",file);
      const response = await fetch(`${API_URL}/api/admin/catalog/photo`, {method:"POST",credentials:"include",body});
      const result = await response.json();
      if(!response.ok) throw new Error(result.message || "Upload failed");
      setForm(previous=>({...previous,image:result.image}));
    } catch(e) {setError(e.message);} finally {setUploadingImage(false);}
  };
  const catalogImageField = () => <label className="block sm:col-span-2">Change photo (JPG, PNG, WebP)
    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>uploadCatalogPhoto(e.target.files[0])} className="block w-full mt-2 border rounded-xl p-3" />
    {form.image && <img src={form.image} alt="Preview" className="w-24 h-24 rounded-xl object-cover mt-2" />}
  </label>;
  const specialtyImageField = () => <div className="sm:col-span-2 space-y-2">
    <label className="block text-sm font-medium">Specialty image * (JPG, PNG, WebP, max 3MB)
      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>uploadSpecialtyPhoto(e.target.files[0])} className="block mt-2 w-full border rounded-xl p-3" />
    </label>
    {uploadingImage && <p>Uploading image...</p>}
    {form.image && <img src={form.image} alt="Specialty" className="w-28 h-28 object-cover rounded-xl" />}
  </div>;
  const addSpecialty = async () => {
    if (!form.image || !form.department || !form.name || !form.value) {setError("Name, code, department and image are required");return;}
    try {await api("/admin/specialties",{method:"POST",body:JSON.stringify(form)});setEditing(null);setForm({});await load();}
    catch(e){setError(e.message);}
  };
  const addCatalog = async kind => {
    if (!form.name || !form.city || (kind === "doctor" && !form.email) || (kind === "hospital" && (!form.location || !form.phone || !form.license || !form.image)) || (kind === "doctor" && (!form.specialty || !form.hospitalId))) {
      setError("Complete all required fields"); return;
    }
    try {
      await api(`/admin/${kind === "doctor" ? "doctors" : "hospitals"}`, {method:"POST",body:JSON.stringify(form)});
      setEditing(null); setForm({}); await load();
    } catch (e) {setError(e.message);}
  };
  const field = (name, label, type="text", options=[]) => <label key={name} className="block text-sm font-medium">{label}
    {type === "select" ? <select value={form[name] ?? ""} onChange={e=>setForm({...form,[name]:e.target.value})} className="mt-1 w-full p-3 rounded-xl border text-gray-900"><option value="">Select</option>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>
      : <input value={form[name] ?? ""} onChange={e=>setForm({...form,[name]:e.target.value})} className="mt-1 w-full p-3 rounded-xl border text-gray-900" />}
  </label>;
  const detailsOf = r => { try { return JSON.parse(r.details) || {}; } catch { return {}; } };
  const title = r => {
    let d = {}; try { d = JSON.parse(r.details); } catch {}
    return `${r.provider_type === "clinic" || d.type === "clinic" ? t.registerClinic : r.provider_type === "hospital" || d.type === "hospital" ? t.registerHospital : t.registerDoctor} ${r.name}`;
  };
  const tabs = [
    {id:"requests",name:t.adminRequests,icon:ClipboardCheck,count:requests.filter(r=>r.status==="pending").length},
    {id:"doctors",name:language==="Persian"?"مدیریت داکتران":"Manage Doctors",icon:Stethoscope,count:doctors.length},
    {id:"hospitals",name:language==="Persian"?"مدیریت شفاخانه‌ها":"Manage Hospitals",icon:Building2,count:hospitals.length},
    {id:"specialties",name:language==="Persian"?"تخصص‌ها":"Specialties",icon:Tags,count:specialtiesList.length},
    {id:"contacts",name:t.adminMessages,icon:Mail,count:contacts.filter(c=>c.status==="unread").length},
    {id:"appointments",name:t.adminAppointments,icon:CalendarDays,count:appointments.length},
    {id:"providers",name:t.adminProviders,icon:Building2,count:providers.length}
  ];
  return <main className="min-h-screen bg-teal-50/60 dark:bg-slate-900 px-4 py-12">
    <div className="max-w-6xl mx-auto">
      <div className="rounded-3xl bg-gradient-to-r from-teal-700 to-cyan-600 text-white p-8 shadow-lg flex flex-wrap justify-between gap-4 items-center">
        <div><ShieldCheck size={36}/><h1 className="text-3xl font-bold mt-3">{t.adminTitle}</h1><p className="text-teal-50 mt-2">{t.adminSubtitle}</p></div>
        <button onClick={load} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-xl px-5 py-3 transition cursor-pointer"><RefreshCw size={18}/>{t.adminRefresh}</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-6">
        {tabs.map(item => <button key={item.id} onClick={()=>setTab(item.id)} className={`rounded-2xl p-4 text-start shadow-sm border transition hover:-translate-y-1 cursor-pointer ${tab===item.id?"bg-teal-600 text-white border-teal-600":"bg-white dark:bg-slate-800 dark:text-white border-gray-100 dark:border-slate-700"}`}><item.icon size={24}/><p className="font-semibold mt-3">{item.name}</p><p className="text-2xl font-bold mt-1">{item.count}</p></button>)}
      </div>
      {emailMessage && <p role="status" className="bg-green-50 text-green-700 rounded-xl p-4 mt-5">{emailMessage}</p>}
      {error && <p role="alert" className="bg-red-50 text-red-700 rounded-xl p-4 mt-5">{error}</p>}
      {loading ? <p className="p-6 dark:text-white">{t.loadingText}</p> : <div className="mt-7 space-y-4">
        
        {tab === "requests" && (requests.length ? requests.map(r=><article key={r.id} className="bg-white dark:bg-slate-800 dark:text-white rounded-2xl shadow-sm p-6 transition hover:shadow-lg">
          <div className="flex justify-between flex-wrap gap-3"><div><h3 className="font-bold text-lg">{title(r)}</h3><p className="text-sm text-gray-500 dark:text-gray-300 mt-1">{r.email} · {r.phone}</p></div><span className={`rounded-full px-4 py-2 h-fit text-sm ${r.status==="approved"?"bg-green-100 text-green-700":r.status==="rejected"?"bg-red-100 text-red-700":"bg-amber-100 text-amber-700"}`}>{r.status==="approved"?t.requestApproved:r.status==="rejected"?t.requestRejected:t.requestPending}</span></div>
          {detailsOf(r).photoUrl && <img src={detailsOf(r).photoUrl} alt={r.name} className="mt-4 w-32 h-32 rounded-xl object-cover" />}
          <div className="grid sm:grid-cols-2 gap-3 mt-4 text-sm text-gray-600 dark:text-gray-300">
            {Object.entries(detailsOf(r)).filter(([key,value])=>key!=="photoUrl" && key!=="type" && value).map(([key,value])=><p key={key} className="rounded-lg bg-gray-50 dark:bg-slate-700 p-3"><strong className="capitalize">{key.replace(/([A-Z])/g," $1")}: </strong>{String(value)}</p>)}
          </div>
          {r.status === "pending" && <><label className="block mt-5 mb-2 text-sm font-semibold">{t.adminReviewNote}</label><textarea value={notes[r.id] ?? r.review_note ?? ""} onChange={e=>setNotes({...notes,[r.id]:e.target.value})} rows={2} className="w-full rounded-xl border p-3 dark:bg-slate-700 dark:border-slate-600" placeholder={t.adminReviewPlaceholder}/>
          <div className="flex gap-3 mt-3"><button onClick={()=>decide(r,"approved")} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-5 py-2 transition cursor-pointer">{t.adminApprove}</button><button onClick={()=>decide(r,"rejected")} className="bg-red-100 hover:bg-red-200 text-red-700 rounded-xl px-5 py-2 transition cursor-pointer">{t.adminReject}</button></div></>}
        </article>) : <p className="dark:text-white">{t.adminEmpty}</p>)}
        {tab === "contacts" && (contacts.length ? contacts.map(c=><article key={c.id} className="bg-white dark:bg-slate-800 dark:text-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between gap-3"><div><h3 className="font-bold">{c.name}</h3><p className="text-sm text-teal-600">{c.email}</p></div><span className="text-sm text-gray-500">{c.status || 'unread'}</span></div>
          <p className="whitespace-pre-wrap mt-4">{c.message}</p>
          {c.admin_reply && <div className="mt-4 rounded-xl bg-teal-50 dark:bg-slate-700 p-3"><strong>{t.adminPreviousReply || 'Sent reply'}:</strong><p className="whitespace-pre-wrap">{c.admin_reply}</p></div>}
          <div className="flex flex-wrap gap-3 mt-4">
            <button disabled={contactBusyId===c.id} onClick={()=>{setOpenReplyId(openReplyId===c.id?null:c.id);setError('');}} className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50 text-white rounded-xl px-4 py-2 transition-colors cursor-pointer">{t.adminReplyEmail || 'Reply'}</button>
            <button disabled={contactBusyId===c.id} onClick={()=>deleteContact(c)} className="bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-700 rounded-xl px-4 py-2 transition-colors cursor-pointer disabled:opacity-50">{t.adminDeleteMessage || 'Delete'}</button>
          </div>
          {openReplyId===c.id && <div className="mt-4"><textarea value={replies[c.id] ?? ''} onChange={e=>setReplies({...replies,[c.id]:e.target.value})} className="w-full border rounded-xl p-3 dark:bg-slate-700 dark:border-slate-600" rows={4} maxLength={3000} placeholder={t.adminReplyPlaceholder}/>
            <button disabled={contactBusyId===c.id || !(replies[c.id]||'').trim()} onClick={()=>sendContactReply(c)} className="mt-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50 text-white rounded-xl px-5 py-2 cursor-pointer transition-colors">{contactBusyId===c.id ? (t.loadingText || 'Sending...') : (t.adminSendReply || 'Send email')}</button>
          </div>}
        </article>) : <p className="dark:text-white">{t.adminEmpty}</p>)}
        {tab === "appointments" && (appointments.length ? appointments.map(a=><article key={a.id} className="bg-white dark:bg-slate-800 dark:text-white rounded-2xl p-5 shadow-sm flex flex-wrap justify-between gap-4 items-center"><div><h3 className="font-bold">{a.patient_name}</h3><p className="text-sm text-gray-500 dark:text-gray-300">#{a.doctor_id} · {a.date} · {a.time} · {a.status}</p></div><div className="flex gap-2"><button onClick={()=>changeAppointment(a.id,"confirmed")} className="bg-teal-600 text-white px-4 py-2 rounded-lg cursor-pointer">{t.adminConfirm}</button><button onClick={()=>changeAppointment(a.id,"cancelled")} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg cursor-pointer">{t.adminCancel}</button></div></article>) : <p className="dark:text-white">{t.adminEmpty}</p>)}

        {(["doctors","hospitals","specialties"].includes(tab)) && <>
          {(tab === "doctors" || tab === "hospitals") && <button onClick={()=>{setEditing(`new-${tab}`);setForm(tab === "doctors" ? {name:"",email:"",specialty:"",hospitalId:"",city:"",about:"",image:""} : {name:"",type:"private",city:"",location:"",phone:"",license:"",services:"",description:"",image:""});}} className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 cursor-pointer transition-colors text-white rounded-xl px-4 py-2">+ Add {tab === "doctors" ? "Doctor" : "Hospital / Clinic"}</button>}
          {(editing === "new-doctors" || editing === "new-hospitals") && <div className="bg-white rounded-xl p-5 grid sm:grid-cols-2 gap-3">
            {field("name","Name *")}
            {editing === "new-doctors" ? <>{field("email","Email *")}{field("specialty","Specialty *","select",specialtiesList.map(x=>({value:x.value,label:x.name})))}{field("hospitalId","Hospital *","select",hospitals.map(x=>({value:x.id,label:x.name})))}{field("city","City *")}{field("experience","Experience")}{field("education","Education")}{field("about","About")}</> : <>{field("type","Hospital / Clinic type *","select",[{value:"private",label:"Private Hospital"},{value:"government",label:"Government Hospital"},{value:"clinic",label:"Clinic"}])}{field("city","City *")}{field("location","Full address *")}{field("phone","Contact phone *")}{field("license","License number *")}{field("services","Medical services")}{field("description","About the hospital / clinic")}</>}
            {catalogImageField()}
            <button disabled={uploadingImage} onClick={()=>addCatalog(editing === "new-doctors" ? "doctor" : "hospital")} className="bg-teal-600 text-white rounded-xl px-4 py-2">Save</button>
            <button onClick={()=>setEditing(null)} className="border rounded-xl px-4 py-2">Cancel</button>
          </div>}
          {tab === "specialties" && <button onClick={()=>{setEditing("new-specialty");setForm({name:"",value:"",department:"",image:""});}} className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 cursor-pointer transition-colors text-white rounded-xl px-4 py-2">+ Add Specialty</button>}
          {editing === "new-specialty" && <div className="bg-white rounded-xl p-5 grid gap-3">{field("name","Specialty name")}{field("value","Code (e.g. cardiology)")}{field("department","Specialty department")}{specialtyImageField()}<button disabled={uploadingImage} onClick={addSpecialty} className="cursor-pointer hover:brightness-90 active:brightness-75 transition-colors bg-teal-600 text-white rounded-xl p-2">Save</button></div>}
          {(tab === "doctors" ? doctors : tab === "hospitals" ? hospitals : specialtiesList).map(item => {
            const kind = tab === "doctors" ? "doctor" : tab === "hospitals" ? "hospital" : "specialty";
            const active = editing === `${kind}-${item.id}`;
            return <article key={item.id} className="bg-white dark:bg-slate-800 dark:text-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-4 flex-wrap">
                {item.image && <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />}
                <div className="flex-1"><h3 className="font-bold">{item.name}</h3><p className="text-sm text-gray-500">{kind === "doctor" ? `${item.specialty} · ${item.hospital} · ${item.city} · ${item.email || ""}` : kind === "hospital" ? `${item.city} · ${item.location}` : `${item.value} · ${item.department || "No department"}`}</p></div>
                {(kind === "doctor" || kind === "hospital") && (() => {
                  const account=(kind === "doctor" ? catalogAccounts.doctors : catalogAccounts.hospitals).find(x=>Number(x.id)===Number(item.id));
                  return account?.email ? <span className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">Assigned: {account.email}</span> : <button onClick={()=>{setAssigning({type:kind,id:item.id,name:item.name});setAssignEmail(item.email||"");}} className="bg-teal-600 text-white px-3 py-2 rounded-lg">Assign Account</button>;
                })()}
                {(kind === "doctor" || kind === "hospital") && <button onClick={()=>openTranslation(kind,item)} className="rounded-lg border border-teal-500 text-teal-700 px-3 py-2">🌐 Translations</button>}
                <button onClick={()=>active?setEditing(null):startEdit(kind,item)} className="flex gap-1 items-center border rounded-lg px-3 py-2"><Pencil size={16}/> {active?"Cancel":"Edit"}</button>
                <button onClick={()=>deleteItem(kind,item.id)} className="flex gap-1 items-center bg-red-100 text-red-700 rounded-lg px-3 py-2"><Trash2 size={16}/> Delete</button>
              </div>
              {active && <div className="grid sm:grid-cols-2 gap-3 mt-5">
                {field("name","Name")}
                {kind === "doctor" && <>{field("email","Email *")}{field("specialty","Specialty","select",specialtiesList.map(x=>({value:x.value,label:x.name})))}{field("hospitalId","Hospital","select",hospitals.map(x=>({value:x.id,label:x.name})))}{field("city","City")}{field("experience","Experience")}{field("education","Education")}{field("about","About")}{catalogImageField()}</>}
                {kind === "hospital" && <>{field("type","Hospital / Clinic type","select",[{value:"private",label:"Private Hospital"},{value:"government",label:"Government Hospital"},{value:"clinic",label:"Clinic"}])}{field("city","City")}{field("location","Full address *")}{field("phone","Contact phone *")}{field("license","License number *")}{field("services","Medical services")}{field("description","About the hospital / clinic")}{catalogImageField()}</>}
                {kind === "specialty" && <>{field("value","Code")}{field("department","Specialty department")}{specialtyImageField()}</>}
                <button disabled={uploadingImage} onClick={()=>saveItem(kind,item.id)} className="bg-teal-600 text-white rounded-xl px-4 py-2 flex items-center justify-center gap-2"><Save size={17}/> Save changes</button>
              </div>}
            </article>;
          })}
        </>}
        {tab === "providers" && (providers.length ? providers.map(p=><article key={p.id} className="bg-white dark:bg-slate-800 dark:text-white rounded-2xl p-5 shadow-sm flex flex-wrap justify-between gap-4 items-center"><div><h3 className="font-bold">{p.provider_type==="doctor"?t.registerDoctor:p.provider_type==="clinic"?t.registerClinic:t.registerHospital} {p.name}</h3><p className="text-sm text-gray-500 dark:text-gray-300">{p.city} · {p.phone} · {p.email || ""}</p></div><div className="flex gap-2 flex-wrap"><button onClick={()=>changeProviderEmail(p)} className="px-4 py-2 rounded-xl border border-teal-500 text-teal-700 dark:text-teal-200">Edit Email</button>{p.email_verified === false && <button disabled={sendingId !== null} onClick={()=>resendActivation(p.id)} className="px-4 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-50">{sendingId === p.id ? "Sending..." : "Resend Activation Email"}</button>}<button onClick={()=>toggleProvider(p)} className={`px-4 py-2 rounded-xl cursor-pointer ${p.active?"bg-red-100 text-red-700":"bg-green-100 text-green-700"}`}>{p.active?t.adminDeactivate:t.adminActivate}</button><button onClick={()=>deleteProvider(p)} className="px-4 py-2 rounded-xl bg-red-600 text-white cursor-pointer">Delete</button></div></article>) : <p className="dark:text-white">{t.adminEmpty}</p>)}
      </div>}
      {translationEditor && <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 dark:text-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-3"><h2 className="text-xl font-bold">🌐 Translate: {translationEditor.name}</h2><button onClick={()=>setTranslationEditor(null)} className="cursor-pointer hover:text-red-600 transition-colors">✕</button></div>
          <p className="text-sm text-slate-500 mb-4">AI translations are drafts. Review names, medical claims and addresses before approving.</p>
          <label className="block text-sm mb-2">Source language: <select value={sourceLanguage} onChange={e=>setSourceLanguage(e.target.value)} className="border rounded-lg p-2 dark:bg-slate-800 cursor-pointer"><option value="fa">دری</option><option value="ps">پښتو</option><option value="en">English</option></select></label>
          {error && <p role="alert" className="text-red-600 mb-3">{error}</p>}
          <button disabled={translationBusy} onClick={generateTranslation} className="bg-cyan-700 hover:bg-cyan-800 active:bg-cyan-900 text-white px-4 py-2 rounded-xl mb-4 cursor-pointer disabled:opacity-50 disabled:cursor-wait transition-colors">{translationBusy ? "Generating..." : "Generate with AI"}</button>
          <div className="grid md:grid-cols-3 gap-4">{[["fa","دری"],["ps","پښتو"],["en","English"]].map(([lang,label])=><section key={lang} className="border rounded-xl p-3"><h3 className="font-bold mb-3">{label}</h3>{(translationEditor.kind==='doctor'?['name','about','education','experience']:['name','description','services','location']).map(field=><label key={field} className="block mb-3 text-xs">{field}<textarea rows={field==='name'?2:3} dir={lang==='en'?'ltr':'rtl'} value={translationEditor.translations?.[lang]?.[field]||''} onChange={e=>setTranslationEditor(prev=>({...prev,translations:{...prev.translations,[lang]:{...prev.translations?.[lang],[field]:e.target.value}}}))} className="block mt-1 w-full border rounded-lg p-2 text-sm text-slate-900" /></label>)}</section>)}</div>
          <div className="flex gap-3 mt-4 flex-wrap"><button disabled={translationBusy} onClick={()=>saveTranslation(false)} className="bg-slate-200 hover:bg-slate-300 active:bg-slate-400 cursor-pointer transition-colors text-slate-900 px-4 py-2 rounded-lg">Save draft</button><button disabled={translationBusy} onClick={()=>saveTranslation(true)} className="bg-green-600 hover:bg-green-700 active:bg-green-800 cursor-pointer transition-colors text-white px-4 py-2 rounded-lg">Approve & Publish</button></div>
        </div>
      </div>}
      {assigning && <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 dark:text-white p-6 rounded-2xl w-full max-w-md shadow-xl">
          <h3 className="font-bold text-xl mb-2">Assign Account</h3>
          <p className="text-sm mb-4">{assigning.name} — existing profile #{assigning.id}</p>
          <label className="block mb-2">Provider email (required)</label>
          <input type="email" required value={assignEmail} onChange={e=>setAssignEmail(e.target.value)} className="border rounded-xl p-3 w-full text-black" placeholder="doctor@example.com" />
          <p className="text-xs text-gray-500 mt-2">An activation link will be emailed. The existing profile will not be duplicated.</p>
          <div className="flex gap-2 mt-5"><button disabled={sendingId!==null || !assignEmail.trim()} onClick={assignAccount} className="cursor-pointer hover:brightness-90 active:brightness-75 transition-colors bg-teal-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">{sendingId!==null?"Sending...":"Send activation"}</button><button onClick={()=>setAssigning(null)} className="border px-4 py-2 rounded-lg">Cancel</button></div>
        </div>
      </div>}
    </div>
  </main>;
}
