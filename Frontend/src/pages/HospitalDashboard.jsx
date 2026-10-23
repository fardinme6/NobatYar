import { useEffect, useState } from "react";
import { api } from "../api";
import { Building2, Save, RefreshCw } from "lucide-react";

export default function HospitalDashboard({ language }) {
  const [hospitals, setHospitals] = useState([]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const load = async () => {
    try {setHospitals(await api("/provider/my-hospitals"));setMessage("");}
    catch(e){setMessage(e.message);}
  };
  useEffect(()=>{load();},[]);
  const edit = (id,key,value) => setHospitals(hospitals.map(h=>h.id===id?{...h,[key]:value}:h));
  const save = async h => {
    setSaving(true);
    try {
      await api(`/provider/hospitals/${h.id}`, {method:"PATCH",body:JSON.stringify({
        name:h.name,type:h.type,city:h.city,location:h.location,description:h.description||"",
        phone:h.phone||"",services:h.services||"",license_number:h.license_number||""
      })});
      setMessage("Hospital information saved successfully.");
      await load();setMessage("Hospital information saved successfully.");
    }catch(e){setMessage(e.message);}finally{setSaving(false);}
  };
  return <main className="min-h-screen bg-teal-50 dark:bg-slate-900 px-4 py-12">
    <div className="max-w-5xl mx-auto">
      <header className="bg-gradient-to-r from-teal-700 to-cyan-600 text-white p-8 rounded-3xl shadow-lg">
        <Building2 size={40}/><h1 className="text-3xl font-bold mt-3">Hospital / Clinic Dashboard</h1>
        <p className="mt-2 text-teal-50">Manage your assigned hospital information</p>
      </header>
      {message && <p role="status" className="mt-5 bg-white dark:bg-slate-800 dark:text-white rounded-xl p-4">{message}</p>}
      <div className="flex justify-end mt-5"><button onClick={load} className="flex gap-2 items-center text-teal-700 dark:text-teal-200"><RefreshCw size={18}/> Refresh</button></div>
      {!hospitals.length && <div className="bg-white dark:bg-slate-800 dark:text-white rounded-2xl p-6 mt-4">No hospital assigned to this account yet. Ask the administrator to use Assign Account.</div>}
      {hospitals.map(h=><section key={h.id} className="bg-white dark:bg-slate-800 dark:text-white rounded-2xl shadow-md p-6 mt-5">
        <div className="flex gap-4 items-center mb-6">{h.image && <img src={h.image} alt={h.name} className="w-20 h-20 rounded-xl object-cover"/>}<div><h2 className="font-bold text-xl">{h.name}</h2><p className="text-gray-500">Hospital #{h.id}</p></div></div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[["name","Hospital / Clinic Name"],["city","City"],["location","Address"],["phone","Contact Phone"],["license_number","License Number"]].map(([key,label])=><label key={key} className="text-sm font-medium">{label}<input value={h[key]||""} onChange={e=>edit(h.id,key,e.target.value)} className="block w-full mt-2 p-3 rounded-xl border dark:bg-slate-700 dark:border-slate-600"/></label>)}
          <label className="text-sm font-medium">Type<select value={h.type||"private"} onChange={e=>edit(h.id,"type",e.target.value)} className="block w-full mt-2 p-3 rounded-xl border dark:bg-slate-700 dark:border-slate-600">{["private","government","clinic","hospital"].map(x=><option key={x} value={x}>{x}</option>)}</select></label>
          {[["description","Description"],["services","Services"]].map(([key,label])=><label key={key} className="sm:col-span-2 text-sm font-medium">{label}<textarea rows={3} value={h[key]||""} onChange={e=>edit(h.id,key,e.target.value)} className="block w-full mt-2 p-3 rounded-xl border dark:bg-slate-700 dark:border-slate-600"/></label>)}
        </div>
        <button disabled={saving} onClick={()=>save(h)} className="flex items-center gap-2 bg-teal-600 text-white rounded-xl px-6 py-3 mt-6 disabled:opacity-50"><Save size={18}/> Save Changes</button>
        <p className="mt-4 text-sm text-gray-500">Your account profile and hospital public listing are separate. Changes here update this hospital's public details.</p>
      </section>)}
    </div>
  </main>;
}
