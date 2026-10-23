import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../api";
import { translations } from "../data/translations";

export default function AccountRecovery({ language, mode }) {
  const t = translations[language];
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const token = params.get("token") || "";
  const verify = mode === "verify";
  const reset = mode === "reset";
  const title = verify
    ? t.verifyEmailTitle
    : reset
      ? t.resetPasswordTitle
      : t.forgotPasswordTitle;
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const path = verify
        ? "/auth/verify-email"
        : reset
          ? "/auth/reset-password"
          : "/auth/forgot-password";
      const body = verify ? { token } : reset ? { token, password } : { email };
      const data = await api(path, {
        method: "POST",
        body: JSON.stringify(body),
      });
      setMessage(data.message);
    } catch (error) {
      setMessage(error.message);
    }
    setBusy(false);
  };
  return (
    <main className="min-h-[70vh] bg-gray-50 dark:bg-slate-900 px-4 py-16">
      <form
        onSubmit={submit}
        className="max-w-md mx-auto rounded-2xl bg-white dark:bg-slate-800 p-8 shadow-lg space-y-5"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        {!verify && !reset && (
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailAddress}
            className="w-full rounded-lg border p-3"
          />
        )}
        {reset && (
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.password}
            className="w-full rounded-lg border p-3"
          />
        )}
        {message && (
          <p className="text-teal-700 dark:text-teal-300">{message}</p>
        )}
        <button
          disabled={busy || ((verify || reset) && !token)}
          className="w-full bg-teal-600 text-white rounded-lg p-3 disabled:opacity-50"
        >
          {busy ? "..." : t.submitRequest}
        </button>
        <Link to="/login" className="block text-center text-teal-600">
          {t.backToLogin}
        </Link>
      </form>
    </main>
  );
}
