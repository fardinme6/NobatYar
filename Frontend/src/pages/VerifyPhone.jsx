import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { api } from "../api";
export default function VerifyPhone() {
 const { state } = useLocation();
 const navigate = useNavigate();
 const [code, setCode] = useState("");
 const [message, setMessage] = useState("");
 const [loading, setLoading] = useState(false);
 const verify = async (e) => {
  e.preventDefault(); setLoading(true); setMessage("");
  try { await api("/auth/phone-verify", {method:"POST",body:JSON.stringify({phone:state?.phone,code})}); navigate("/login"); }
  catch(err) {setMessage(err.message);} finally {setLoading(false);}
 };
 return <main className="min-h-[65vh] bg-gray-50 dark:bg-slate-900 px-4 py-16">
  <form onSubmit={verify} className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 space-y-5">
   <h1 className="text-2xl font-bold dark:text-white">Verify your phone</h1>
   <p className="text-gray-600 dark:text-gray-300">Enter the code sent to your mobile number.</p>
   <input className="w-full border rounded-xl p-3" inputMode="numeric" pattern="[0-9]{4,8}" maxLength={8} required value={code} onChange={e=>setCode(e.target.value)} placeholder="Verification code" />
   {message && <p role="alert" className="text-red-600">{message}</p>}
   <button disabled={loading || !state?.phone} className="w-full bg-teal-600 text-white rounded-xl p-3">{loading ? "Verifying..." : "Verify and activate"}</button>
   <Link to="/signup" className="block text-center text-teal-600">Back to signup</Link>
  </form>
 </main>;
}
