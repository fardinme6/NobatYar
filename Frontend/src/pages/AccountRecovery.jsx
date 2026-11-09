import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { api } from "../api";
import { translations } from "../data/translations";

const activationText = {
  Persian: {
    title: "فعال‌سازی حساب",
    successTitle: "حساب شما موفقانه فعال شد!",
    successDescription: "حساب کاربری شما تأیید و فعال گردید. اکنون می‌توانید با ایمیل و رمز عبور خود وارد نوبت‌یار شوید.",
    login: "ورود به حساب کاربری",
    error: "فعال‌سازی حساب موفق نشد. لطفاً دوباره تلاش کنید.",
  },
  Pashto: {
    title: "د حساب فعالول",
    successTitle: "ستاسو حساب په بریالیتوب فعال شو!",
    successDescription: "ستاسو حساب تایید او فعال شو. اوس کولای شئ د خپل برېښنالیک او پټنوم په کارولو نوبت‌یار ته ننوځئ.",
    login: "خپل حساب ته ننوتل",
    error: "حساب فعال نه شو. مهرباني وکړئ بیا هڅه وکړئ.",
  },
  English: {
    title: "Activate provider account",
    successTitle: "Your account has been activated!",
    successDescription: "Your account is now verified and active. You can sign in to NobatYar using your email and password.",
    login: "Sign in to your account",
    error: "Account activation failed. Please try again.",
  },
};

export default function AccountRecovery({ language, mode }) {
  const t = translations[language] || translations.English;
  const a = activationText[language] || activationText.English;
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const token = params.get("token") || "";
  const verify = mode === "verify";
  const reset = mode === "reset";
  const activate = mode === "activate";
  const title = activate ? a.title : verify
    ? t.verifyEmailTitle
    : reset ? t.resetPasswordTitle : t.forgotPasswordTitle;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const path = verify ? "/auth/verify-email" : (reset || activate)
        ? (activate ? "/auth/activate-provider" : "/auth/reset-password")
        : "/auth/forgot-password";
      const body = verify ? { token } : (reset || activate) ? { token, password } : { email };
      const data = await api(path, { method: "POST", body: JSON.stringify(body) });
      if (activate) setSuccess(true);
      else setMessage(data.message);
    } catch (error) {
      setMessage(activate ? a.error : error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-[70vh] bg-gray-50 dark:bg-[#061b19] px-4 py-16">
      {activate && success ? (
        <section role="status" aria-live="polite" className="max-w-md mx-auto rounded-2xl bg-white dark:bg-[#102d29] p-8 shadow-lg text-center space-y-5" dir={language === "English" ? "ltr" : "rtl"}>
          <CheckCircle2 size={76} className="mx-auto text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{a.successTitle}</h1>
          <p className="text-gray-600 dark:text-gray-300 leading-8">{a.successDescription}</p>
          <Link to="/login" className="block w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-5 py-3 font-semibold">{a.login}</Link>
        </section>
      ) : (
        <form onSubmit={submit} className="max-w-md mx-auto rounded-2xl bg-white dark:bg-[#102d29] p-8 shadow-lg space-y-5" dir={language === "English" ? "ltr" : "rtl"}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {!verify && !reset && !activate && (
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.emailAddress} aria-label={t.emailAddress} className="w-full rounded-lg border p-3" />
          )}
          {(reset || activate) && (
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.password} aria-label={t.password} className="w-full rounded-lg border p-3" />
          )}
          {message && <p role="alert" className="text-red-600 dark:text-red-400">{message}</p>}
          <button disabled={busy || ((verify || reset || activate) && !token)} className="w-full bg-teal-600 text-white rounded-lg p-3 disabled:opacity-50">
            {busy ? "..." : t.submitRequest}
          </button>
          <Link to="/login" className="block text-center text-teal-600">{t.backToLogin}</Link>
        </form>
      )}
    </main>
  );
}
