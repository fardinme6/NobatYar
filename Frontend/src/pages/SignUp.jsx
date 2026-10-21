
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import {
  UserRound,
  Mail,
  Phone,
  LockKeyhole,
  Eye,
  EyeOff,
  UserRoundPlus,
  Check,
  ShieldCheck,
} from "lucide-react";
import { translations } from "../data/translations";

export default function SignUp({ language, onLogin }) {
  const t = translations[language];
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      setMessage(t.passwordTooShort);
      setError(true);
      return;
    }

    if (password !== confirmPassword) {
      setMessage(t.passwordsDoNotMatch);
      setError(true);
      return;
    }

    if (!agree) {
      setMessage(t.agreeRequired);
      setError(true);
      return;
    }

    setError(false);
    setMessage("");
    try {
      const data = await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name: fullName, email, phone, password }),
      });
      onLogin(data.user);
      navigate("/profile");
    } catch (error) {
      setError(true);
      setMessage(error.message);
    }
  };

  const inputStyle =
    "w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl py-3 ps-11 pe-4 text-gray-900 dark:text-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition";

  const iconStyle =
    "absolute start-3.5 top-1/2 -translate-y-1/2 text-gray-400";

  return (
    <section className="bg-gray-50 dark:bg-slate-900 px-4 py-6 md:py-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/home" className="flex justify-center mb-3">
          <img
            src="/logo.png"
            alt="NobatYar Logo"
            className="w-20 h-20 object-contain hover:scale-105 transition"
          />
        </Link>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-lg shadow-gray-200/40 dark:shadow-none overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-700 px-5 md:px-7 py-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {t.signupTitle}
              </h1>

              <p className="text-sm text-gray-500 dark:text-gray-400 leading-6">
                {t.signupDescription}
              </p>
            </div>

            <div className="hidden sm:flex w-12 h-12 shrink-0 items-center justify-center bg-teal-50 dark:bg-teal-900/30 rounded-xl text-teal-600 dark:text-teal-400">
              <UserRoundPlus size={25} />
            </div>
          </div>

          <div className="p-5 md:p-7">
            <form
              onSubmit={handleSignUp}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {t.fullName}
                </label>

                <div className="relative">
                  <UserRound size={18} className={iconStyle} />

                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.enterFullName}
                    required
                    className={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {t.phoneNumber}
                </label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07XXXXXXXX"
                    required
                    dir="ltr"
                    className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl py-3 pl-11 pr-4 text-gray-900 dark:text-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {t.emailAddress}
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    required
                    dir="ltr"
                    className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl py-3 pl-11 pr-4 text-gray-900 dark:text-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {t.password}
                </label>

                <div className="relative">
                  <LockKeyhole size={18} className={iconStyle} />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.createPassword}
                    required
                    minLength={8}
                    className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl py-3 ps-11 pe-11 text-gray-900 dark:text-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {t.confirmPassword}
                </label>

                <div className="relative">
                  <ShieldCheck size={18} className={iconStyle} />

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t.enterConfirmPassword}
                    required
                    className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl py-3 ps-11 pe-11 text-gray-900 dark:text-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute end-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 cursor-pointer"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <p className="sm:col-span-2 text-xs text-gray-400 -mt-2">
                {t.passwordHint}
              </p>

              <label className="sm:col-span-2 flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="peer sr-only"
                />

                <span className="w-5 h-5 mt-0.5 shrink-0 flex items-center justify-center rounded-md border-2 border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-700 peer-checked:bg-teal-600 peer-checked:border-teal-600 peer-focus-visible:ring-4 peer-focus-visible:ring-teal-500/20 transition">
                  {agree && <Check size={15} className="text-white" strokeWidth={3} />}
                </span>

                <span className="text-sm text-gray-600 dark:text-gray-300 leading-6 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                  {t.agreeToTerms}
                </span>
              </label>

              {message && (
                <p
                  role="status"
                  className={`sm:col-span-2 p-3 rounded-xl text-sm ${
                    error
                      ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                      : "bg-teal-50 dark:bg-slate-700 text-teal-700 dark:text-teal-300"
                  }`}
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="sm:col-span-2 w-full flex items-center justify-center gap-3 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-semibold cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-teal-600/20"
              >
                <UserRoundPlus size={20} />
                {t.createAccount}
              </button>
            </form>

            <div className="flex items-center gap-4 my-5">
              <div className="h-px flex-1 bg-gray-200 dark:bg-slate-600"></div>
              <span className="text-sm text-gray-400">{t.or}</span>
              <div className="h-px flex-1 bg-gray-200 dark:bg-slate-600"></div>
            </div>

            <p className="text-center text-sm text-gray-600 dark:text-gray-300">
              {t.alreadyHaveAccount}{" "}
              <Link
                to="/login"
                className="text-teal-600 dark:text-teal-400 font-semibold hover:underline"
              >
                {t.login}
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
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
