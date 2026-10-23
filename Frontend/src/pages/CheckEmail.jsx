import { useState } from "react";
import { api } from "../api";
import { Link, useLocation } from "react-router-dom";
import { MailCheck } from "lucide-react";
export default function CheckEmail({ language }) {
  const { state } = useLocation();
  const [email, setEmail] = useState(state?.email || "");
  const [notice, setNotice] = useState("");
  const resend = async () => {try {const result = await api("/auth/resend-verification-email",{method:"POST",body:JSON.stringify({email})});setNotice(result.message);}catch(e){setNotice(e.message);}};
  return <main className="min-h-[65vh] bg-teal-50 dark:bg-slate-900 flex items-center justify-center px-4 py-16"><div className="max-w-lg w-full bg-white dark:bg-slate-800 dark:text-white rounded-3xl shadow-xl p-9 text-center border border-teal-100"><MailCheck size={54} className="mx-auto text-teal-600"/><h1 className="text-2xl font-bold mt-5">{language === "Persian" ? "ایمیل خود را بررسی کنید" : "Check your email"}</h1><p className="text-gray-600 dark:text-gray-300 mt-4 leading-8">{language === "Persian" ? "لینک فعال‌سازی حساب برای شما ارسال شد. قبل از ورود به NobatYar، لینک را در ایمیل خود باز کنید." : "We sent you an activation link. Open the link in your email before signing in."}</p><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" className="block w-full mt-4 border rounded-xl p-3 dark:bg-slate-700"/><p className="text-sm text-gray-500 mt-4">{language === "Persian" ? "پوشه Spam را نیز بررسی کنید." : "Also check your spam folder."}</p>{notice && <p className="mt-3 text-teal-600">{notice}</p>}<button type="button" onClick={resend} disabled={!email} className="block mx-auto mt-4 text-teal-700 underline disabled:opacity-40">{language === "Persian" ? "ارسال دوباره ایمیل فعال‌سازی" : "Resend verification email"}</button><Link to="/login" className="inline-block bg-teal-600 text-white rounded-xl px-6 py-3 mt-6">{language === "Persian" ? "ورود بعد از فعال‌سازی" : "Sign in after verification"}</Link></div></main>;
}
