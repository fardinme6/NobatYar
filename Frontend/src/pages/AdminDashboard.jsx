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
  const [documents, setDocuments] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setError(""); setLoading(true);
    try {
      const [r, a, c, p, d, h, sp] = await Promise.all([api("/admin/provider-requests"), api("/admin/appointments"), api("/admin/contacts"), api("/admin/providers"), api("/admin/doctors"), api("/admin/hospitals"), api("/specialties")]);
      setRequests(r); setAppointments(a); setContacts(c); setProviders(p); setDoctors(d); setHospitals(h); setSpecialtiesList(sp);
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
  useEffect(()=>{
    const editId=Number(new URLSearchParams(window.location.search).get("edit"));
    if(!editId || loading || editing) return;
    const kind=tab === "doctors" ? "doctor" : tab === "hospitals" ? "hospital" : tab === "specialties" ? "specialty" : "";
    const item=(kind === "doctor" ? doctors : kind === "hospital" ? hospitals : specialtiesList).find(x=>x.id===editId);
    if(item && kind) startEdit(kind,item);
  },[loading,tab,doctors,hospitals,specialtiesList]);
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
    setForm(kind === "doctor" ? {name:item.name,specialty:item.specialty_value,hospitalId:hospitals.find(h=>h.name===item.hospital)?.id || "",city:item.city,about:item.about || "",experience:item.experience || "",education:item.education || "",image:item.image || ""} : kind === "hospital" ? {name:item.name,city:item.city,location:item.location,type:item.type_value || "private",description:item.description || "",image:item.image || ""} : {name:item.name,value:item.value,department:item.department || "",image:item.image || ""});
  };
  const saveItem = async (kind, id) => {
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
      const result = await api("/admin/catalog/photo",{method:"POST",body});
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
    if (!form.name || !form.city || (kind === "doctor" && (!form.specialty || !form.hospitalId))) {
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
    {id:"requests",name:t.adminRequests,icon:ClipboardCheck,count:requests.length},
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
      {error && <p role="alert" className="bg-red-50 text-red-700 rounded-xl p-4 mt-5">{error}</p>}
      {loading ? <p className="p-6 dark:text-white">{t.loadingText}</p> : <div className="mt-7 space-y-4">
        {tab === "requests" && (requests.length ? requests.map(r=><article key={r.id} className="bg-white dark:bg-slate-800 dark:text-white rounded-2xl shadow-sm p-6 transition hover:shadow-lg">
          <div className="flex justify-between flex-wrap gap-3"><div><h3 className="font-bold text-lg">{title(r)}</h3><p className="text-sm text-gray-500 dark:text-gray-300 mt-1">{r.email} · {r.phone}</p></div><span className={`rounded-full px-4 py-2 h-fit text-sm ${r.status==="approved"?"bg-green-100 text-green-700":r.status==="rejected"?"bg-red-100 text-red-700":"bg-amber-100 text-amber-700"}`}>{r.status==="approved"?t.requestApproved:r.status==="rejected"?t.requestRejected:t.requestPending}</span></div>
          {detailsOf(r).photoUrl && <img src={detailsOf(r).photoUrl} alt={r.name} className="mt-4 w-32 h-32 rounded-xl object-cover" />}
          <div className="grid sm:grid-cols-2 gap-3 mt-4 text-sm text-gray-600 dark:text-gray-300">
            {Object.entries(detailsOf(r)).filter(([key,value])=>key!=="photoUrl" && key!=="type" && value).map(([key,value])=><p key={key} className="rounded-lg bg-gray-50 dark:bg-slate-700 p-3"><strong className="capitalize">{key.replace(/([A-Z])/g," $1")}: </strong>{String(value)}</p>)}
          </div>
          <button onClick={()=>showDocuments(r.id)} className="mt-4 text-teal-600 underline cursor-pointer">{t.adminDocuments}</button>
          {documents[r.id]?.map(d=><button key={d.id} onClick={()=>downloadDocument(d)} className="block text-sm mt-2 text-teal-600 underline cursor-pointer">{d.original_name} — {t.adminDownloadHint} #{d.id}</button>)}
          {<><label className="block mt-5 mb-2 text-sm font-semibold">{t.adminReviewNote}</label><textarea value={notes[r.id] ?? r.review_note ?? ""} onChange={e=>setNotes({...notes,[r.id]:e.target.value})} rows={2} className="w-full rounded-xl border p-3 dark:bg-slate-700 dark:border-slate-600" placeholder={t.adminReviewPlaceholder}/>
          <div className="flex gap-3 mt-3"><button onClick={()=>decide(r,"approved")} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-5 py-2 transition cursor-pointer">{t.adminApprove}</button><button onClick={()=>decide(r,"rejected")} className="bg-red-100 hover:bg-red-200 text-red-700 rounded-xl px-5 py-2 transition cursor-pointer">{t.adminReject}</button></div></>}
        </article>) : <p className="dark:text-white">{t.adminEmpty}</p>)}
        {tab === "contacts" && (contacts.length ? contacts.map(c=><article key={c.id} className="bg-white dark:bg-slate-800 dark:text-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between gap-3"><div><h3 className="font-bold">{c.name}</h3><p className="text-sm text-teal-600">{c.email}</p></div><span className="text-sm text-gray-500">{c.status}</span></div>
          <p className="whitespace-pre-wrap mt-4">{c.message}</p><textarea value={replies[c.id] ?? c.admin_reply ?? ""} onChange={e=>setReplies({...replies,[c.id]:e.target.value})} className="mt-4 w-full border rounded-xl p-3 dark:bg-slate-700 dark:border-slate-600" rows={3} placeholder={t.adminReplyPlaceholder}/>
          <div className="flex gap-3 mt-3"><button onClick={()=>changeContact(c,"read")} className="border border-teal-600 text-teal-700 dark:text-teal-300 rounded-xl px-4 py-2 cursor-pointer">{t.adminMarkRead}</button><button onClick={()=>changeContact(c,"replied")} className="bg-teal-600 text-white rounded-xl px-4 py-2 cursor-pointer">{t.adminSaveReply}</button></div>
        </article>) : <p className="dark:text-white">{t.adminEmpty}</p>)}
        {tab === "appointments" && (appointments.length ? appointments.map(a=><article key={a.id} className="bg-white dark:bg-slate-800 dark:text-white rounded-2xl p-5 shadow-sm flex flex-wrap justify-between gap-4 items-center"><div><h3 className="font-bold">{a.patient_name}</h3><p className="text-sm text-gray-500 dark:text-gray-300">#{a.doctor_id} · {a.date} · {a.time} · {a.status}</p></div><div className="flex gap-2"><button onClick={()=>changeAppointment(a.id,"confirmed")} className="bg-teal-600 text-white px-4 py-2 rounded-lg cursor-pointer">{t.adminConfirm}</button><button onClick={()=>changeAppointment(a.id,"cancelled")} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg cursor-pointer">{t.adminCancel}</button></div></article>) : <p className="dark:text-white">{t.adminEmpty}</p>)}

        {(["doctors","hospitals","specialties"].includes(tab)) && <>
          {(tab === "doctors" || tab === "hospitals") && <button onClick={()=>{setEditing(`new-${tab}`);setForm(tab === "doctors" ? {name:"",specialty:"",hospitalId:"",city:"",about:"",image:""} : {name:"",type:"private",city:"",location:"",description:"",image:""});}} className="bg-teal-600 text-white rounded-xl px-4 py-2">+ Add {tab === "doctors" ? "Doctor" : "Hospital / Clinic"}</button>}
          {(editing === "new-doctors" || editing === "new-hospitals") && <div className="bg-white rounded-xl p-5 grid sm:grid-cols-2 gap-3">
            {field("name","Name *")}
            {editing === "new-doctors" ? <>{field("specialty","Specialty *","select",specialtiesList.map(x=>({value:x.value,label:x.name})))}{field("hospitalId","Hospital *","select",hospitals.map(x=>({value:x.id,label:x.name})))}{field("city","City *")}{field("experience","Experience")}{field("education","Education")}{field("about","About")}</> : <>{field("type","Type *","select",[{value:"private",label:"Private Hospital"},{value:"government",label:"Government Hospital"},{value:"clinic",label:"Clinic"}])}{field("city","City *")}{field("location","Address *")}{field("description","Description")}</>}
            {catalogImageField()}
            <button disabled={uploadingImage} onClick={()=>addCatalog(editing === "new-doctors" ? "doctor" : "hospital")} className="bg-teal-600 text-white rounded-xl px-4 py-2">Save</button>
            <button onClick={()=>setEditing(null)} className="border rounded-xl px-4 py-2">Cancel</button>
          </div>}
          {tab === "specialties" && <button onClick={()=>{setEditing("new-specialty");setForm({name:"",value:"",department:"",image:""});}} className="bg-teal-600 text-white rounded-xl px-4 py-2">+ Add Specialty</button>}
          {editing === "new-specialty" && <div className="bg-white rounded-xl p-5 grid gap-3">{field("name","Specialty name")}{field("value","Code (e.g. cardiology)")}{field("department","Specialty department")}{specialtyImageField()}<button disabled={uploadingImage} onClick={addSpecialty} className="bg-teal-600 text-white rounded-xl p-2">Save</button></div>}
          {(tab === "doctors" ? doctors : tab === "hospitals" ? hospitals : specialtiesList).map(item => {
            const kind = tab === "doctors" ? "doctor" : tab === "hospitals" ? "hospital" : "specialty";
            const active = editing === `${kind}-${item.id}`;
            return <article key={item.id} className="bg-white dark:bg-slate-800 dark:text-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-4 flex-wrap">
                {item.image && <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />}
                <div className="flex-1"><h3 className="font-bold">{item.name}</h3><p className="text-sm text-gray-500">{kind === "doctor" ? `${item.specialty} · ${item.hospital} · ${item.city}` : kind === "hospital" ? `${item.city} · ${item.location}` : `${item.value} · ${item.department || "No department"}`}</p></div>
                <button onClick={()=>active?setEditing(null):startEdit(kind,item)} className="flex gap-1 items-center border rounded-lg px-3 py-2"><Pencil size={16}/> {active?"Cancel":"Edit"}</button>
                <button onClick={()=>deleteItem(kind,item.id)} className="flex gap-1 items-center bg-red-100 text-red-700 rounded-lg px-3 py-2"><Trash2 size={16}/> Delete</button>
              </div>
              {active && <div className="grid sm:grid-cols-2 gap-3 mt-5">
                {field("name","Name")}
                {kind === "doctor" && <>{field("specialty","Specialty","select",specialtiesList.map(x=>({value:x.value,label:x.name})))}{field("hospitalId","Hospital","select",hospitals.map(x=>({value:x.id,label:x.name})))}{field("city","City")}{field("experience","Experience")}{field("education","Education")}{field("about","About")}{catalogImageField()}</>}
                {kind === "hospital" && <>{field("type","Type","select",[{value:"private",label:"Private"},{value:"government",label:"Government"},{value:"clinic",label:"Clinic"}])}{field("city","City")}{field("location","Address")}{field("description","Description")}{catalogImageField()}</>}
                {kind === "specialty" && <>{field("value","Code")}{field("department","Specialty department")}{specialtyImageField()}</>}
                <button disabled={uploadingImage} onClick={()=>saveItem(kind,item.id)} className="bg-teal-600 text-white rounded-xl px-4 py-2 flex items-center justify-center gap-2"><Save size={17}/> Save changes</button>
              </div>}
            </article>;
          })}
        </>}
        {tab === "providers" && (providers.length ? providers.map(p=><article key={p.id} className="bg-white dark:bg-slate-800 dark:text-white rounded-2xl p-5 shadow-sm flex flex-wrap justify-between gap-4 items-center"><div><h3 className="font-bold">{p.provider_type==="doctor"?t.registerDoctor:p.provider_type==="clinic"?t.registerClinic:t.registerHospital} {p.name}</h3><p className="text-sm text-gray-500 dark:text-gray-300">{p.city} · {p.phone}</p></div><div className="flex gap-2"><button onClick={()=>toggleProvider(p)} className={`px-4 py-2 rounded-xl cursor-pointer ${p.active?"bg-red-100 text-red-700":"bg-green-100 text-green-700"}`}>{p.active?t.adminDeactivate:t.adminActivate}</button><button onClick={()=>deleteProvider(p)} className="px-4 py-2 rounded-xl bg-red-600 text-white cursor-pointer">Delete</button></div></article>) : <p className="dark:text-white">{t.adminEmpty}</p>)}
      </div>}
    </div>
  </main>;
}
