import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  LogIn,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { translations } from "../data/translations";

export default function Login({ language, onLogin }) {
  const t = translations[language];
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");

  const ArrowIcon = language === "English" ? ArrowRight : ArrowLeft;

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const account = await api("/auth/me");
      onLogin(account.user);
      let destination = "/profile";
      if (account.user.role === "admin") destination = "/admin";
      if (account.user.role === "provider") destination = ["hospital", "clinic"].includes(account.user.providerType) ? "/hospital-dashboard" : "/provider-dashboard";
      if (account.user.role === "patient") {
        const requests = await api("/provider-requests/mine").catch(() => []);
        if (requests.length) destination = "/register-provider";
      }
      navigate(destination);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-slate-900 px-5 py-5 lg:py-7">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-4">
          <Link to="/home" className="flex justify-center mb-2">
            <img
              src="/logo.png"
              alt="NobatYar Logo"
              className="w-20 h-20 object-contain hover:scale-105 transition-transform duration-300"
            />
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {t.loginTitle}
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400 leading-6">
            {t.loginDescription}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700 p-5 md:p-6">
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                {language === "Persian" ? "ایمیل یا شماره موبایل" : "Email or Phone Number"}
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email or 07XXXXXXXX"
                  required
                  dir="ltr"
                  className="w-full border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white rounded-xl py-3 pl-12 pr-4 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {t.password}
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
                >
                  {t.forgotPassword}
                </Link>
              </div>

              <div className="relative">
                <LockKeyhole
                  size={19}
                  className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.enterPassword}
                  required
                  className="w-full border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white rounded-xl py-3.5 ps-12 pe-12 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer group w-fit">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="peer sr-only"
              />

              <span className="w-5 h-5 flex items-center justify-center rounded-md border-2 border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-700 peer-checked:bg-teal-600 peer-checked:border-teal-600 peer-focus-visible:ring-4 peer-focus-visible:ring-teal-500/20 transition-all duration-200">
                {rememberMe && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-4 h-4 text-white"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12l4 4L19 6" />
                  </svg>
                )}
              </span>

              <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {t.rememberMe}
              </span>
            </label>

            {message && (
              <p
                role="status"
                className="bg-teal-50 dark:bg-slate-700 text-teal-700 dark:text-teal-300 p-3 rounded-xl text-sm leading-6"
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-teal-600 hover:bg-teal-700 text-white py-3.5 rounded-xl font-semibold cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-teal-600/20"
            >
              <LogIn size={20} />
              {t.login}
              <ArrowIcon size={18} />
            </button>
          </form>

          <div className="flex items-center gap-4 my-4">
            <div className="h-px flex-1 bg-gray-200 dark:bg-slate-600"></div>
            <span className="text-sm text-gray-400">{t.or}</span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-slate-600"></div>
          </div>

          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
            {t.noAccount}{" "}
            <Link
              to="/signup"
              className="text-teal-600 dark:text-teal-400 font-semibold hover:underline"
            >
              {t.signup}
            </Link>
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-7">
          {t.providerQuestion}{" "}
          <Link
            to="/register-provider"
            className="text-teal-600 dark:text-teal-400 font-semibold hover:underline"
          >
            {t.joinAsProvider}
          </Link>
        </p>
      </div>
    </section>
  );
}
