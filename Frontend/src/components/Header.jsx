import { API_URL } from "../api";
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  ChevronDown,
  Globe,
  Moon,
  Sun,
  Menu,
  X,
  UserRound,
  LogIn,
  UserRoundPlus,
  LogOut,
  CalendarDays,
  LayoutDashboard,
  Stethoscope,
} from "lucide-react";
import { translations } from "../data/translations";

export default function Header({
  imageURL,
  title,
  language,
  setLanguage,
  isLoggedIn,
  user,
  onLogout,
}) {
  const [menu, setMenu] = useState(false);
  const [dark, setDark] = useState(false);
  const [languageMenu, setLanguageMenu] = useState(false);

  const t = translations[language];

  const languageCode =
    language === "English" ? "EN" : language === "Persian" ? "FA" : "PA";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const linkStyle = ({ isActive }) =>
    `pb-2 border-b-2 transition-all duration-300 ${
      isActive
        ? "text-teal-600 dark:text-teal-400 border-teal-600"
        : "text-gray-700 dark:text-gray-200 border-transparent hover:text-teal-600 dark:hover:text-teal-400"
    }`;

  const changeLanguage = (value) => {
    setLanguage(value);
    setLanguageMenu(false);
  };

  return (
    <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <NavLink to="/home" className="flex items-center gap-3 shrink-0">
          <img
            src={imageURL}
            alt={title}
            className="w-20 h-14 object-contain"
          />

          <div className="font-['Trebuchet_MS']">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t.brandFirst}
              <span className="text-teal-600 dark:text-teal-400">
                {t.brandSecond}
              </span>
            </h2>

            <p className="text-xs text-gray-500 dark:text-gray-300">
              {t.motto}
            </p>
          </div>
        </NavLink>

        <nav className="hidden xl:flex items-center gap-5 font-['Tahoma'] text-md mt-3">
          <NavLink to="/home" end className={linkStyle}>
            {t.home}
          </NavLink>

          <NavLink to="/hospitals" className={linkStyle}>
            {t.hospitals}
          </NavLink>

          <NavLink to="/doctors" className={linkStyle}>
            {t.doctors}
          </NavLink>
          <NavLink to="/specialties" className={linkStyle}>
            {t.Specialties}
          </NavLink>

          {isLoggedIn && (
            <NavLink to="/my-appointments" className={linkStyle}>
              {t.myAppointments}
            </NavLink>
          )}

          <NavLink to="/about" className={linkStyle}>
            {t.about}
          </NavLink>

          <NavLink to="/contact" className={linkStyle}>
            {t.contact}
          </NavLink>
        </nav>

        <div className="hidden xl:flex items-center gap-2">
          <NavLink
            to="/register-provider"
            className="bg-teal-600 text-white px-4 py-3 rounded-lg hover:bg-teal-700 text-sm whitespace-nowrap"
          >
            {t.joinAsProvider}
          </NavLink>

          {!isLoggedIn ? (
            <>
              <NavLink
                to="/login"
                className="flex items-center justify-center gap-2 border-2 border-teal-600 text-teal-600 dark:text-teal-400 px-4 py-2.5 rounded-xl hover:bg-teal-600 hover:text-white dark:hover:text-white font-semibold text-sm whitespace-nowrap transition-all duration-300"
              >
                <LogIn size={18} />
                {t.login}
              </NavLink>

              <NavLink
                to="/signup"
                className="flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-3 rounded-xl hover:bg-teal-700 hover:shadow-lg font-semibold text-sm whitespace-nowrap transition-all duration-300"
              >
                <UserRoundPlus size={18} />
                {t.signup}
              </NavLink>
            </>
          ) : (
            <div className="relative group">
              <NavLink to="/profile" className="flex items-center justify-center w-10 h-10 bg-teal-50 dark:bg-slate-700 text-teal-600 dark:text-teal-400 rounded-full overflow-hidden">
                {user?.avatar ? <img src={(user.avatar.startsWith("https://") ? user.avatar : `${API_URL}${user.avatar}`)} alt="Profile" className="w-full h-full object-cover" /> : <UserRound size={21} />}
              </NavLink>
              <div className="absolute end-0 top-full pt-2 hidden group-hover:block group-focus-within:block z-50">
                <div className="w-52 bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-xl rounded-xl p-2">
                  <p className="px-3 py-2 text-sm font-semibold text-gray-700 dark:text-white truncate">{user?.name}</p>
                  <NavLink to="/profile" className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-white"><UserRound size={18} />{t.myProfile}</NavLink>
                  {user?.role !== "admin" && user?.role !== "provider" && <NavLink to="/my-appointments" className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-white"><CalendarDays size={18} />{t.myAppointments}</NavLink>}
                  {user?.role === "admin" && <NavLink to="/admin" className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-white"><LayoutDashboard size={18} />{t.adminTitle}</NavLink>}
                  {user?.role === "provider" && <NavLink to="/provider-dashboard" className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-white"><Stethoscope size={18} />{t.providerDashboard}</NavLink>}
                  <button onClick={onLogout} className="w-full flex items-center gap-2 p-3 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"><LogOut size={18} />{t.logout}</button>
                </div>
              </div>
            </div>
          )}

          <div
            className="relative"
            onMouseEnter={() => setLanguageMenu(true)}
            onMouseLeave={() => setLanguageMenu(false)}
          >
            <button
              onClick={() => setLanguageMenu(!languageMenu)}
              className="flex items-center gap-2 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-white px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition"
            >
              <Globe size={18} className="text-teal-600 dark:text-teal-400" />
              <span className="text-sm font-semibold">{languageCode}</span>
              <ChevronDown size={14} />
            </button>

            {languageMenu && (
              <div className="absolute top-full end-0 pt-2 w-40">
                <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-xl rounded-xl overflow-hidden p-1">
                  <button
                    onClick={() => changeLanguage("English")}
                    className={`w-full text-start px-4 py-3 rounded-lg text-sm cursor-pointer transition ${
                      language === "English"
                        ? "bg-teal-50 dark:bg-slate-700 text-teal-600 dark:text-teal-400 font-semibold"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    English
                  </button>

                  <button
                    onClick={() => changeLanguage("Persian")}
                    className={`w-full text-start px-4 py-3 rounded-lg text-sm cursor-pointer transition ${
                      language === "Persian"
                        ? "bg-teal-50 dark:bg-slate-700 text-teal-600 dark:text-teal-400 font-semibold"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    دری
                  </button>

                  <button
                    onClick={() => changeLanguage("Pashto")}
                    className={`w-full text-start px-4 py-3 rounded-lg text-sm cursor-pointer transition ${
                      language === "Pashto"
                        ? "bg-teal-50 dark:bg-slate-700 text-teal-600 dark:text-teal-400 font-semibold"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    پښتو
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setDark(!dark)}
            className={`p-2.5 rounded-xl cursor-pointer transition-colors duration-300 ${
              dark
                ? "bg-slate-700 text-yellow-400 hover:bg-slate-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <button
          className="xl:hidden text-teal-700 dark:text-teal-400 cursor-pointer"
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {menu && (
        <nav className="xl:hidden flex flex-col items-start gap-4 p-5 border-t border-gray-100 dark:border-slate-700 font-['Tahoma'] bg-white dark:bg-slate-800 max-h-[calc(100dvh-90px)] overflow-y-auto overscroll-contain">
          <NavLink
            to="/home"
            end
            className={linkStyle}
            onClick={() => setMenu(false)}
          >
            {t.home}
          </NavLink>

          <NavLink
            to="/hospitals"
            className={linkStyle}
            onClick={() => setMenu(false)}
          >
            {t.hospitals}
          </NavLink>

          <NavLink
            to="/doctors"
            className={linkStyle}
            onClick={() => setMenu(false)}
          >
            {t.doctors}
          </NavLink>
          <NavLink
            to="/specialties"
            className={linkStyle}
            onClick={() => setMenu(false)}
          >
            {t.Specialties}
          </NavLink>

          {isLoggedIn && user?.role !== "admin" && user?.role !== "provider" && (
            <NavLink
              to="/my-appointments"
              className={linkStyle}
              onClick={() => setMenu(false)}
            >
              {t.myAppointments}
            </NavLink>
          )}

          <NavLink
            to="/about"
            className={linkStyle}
            onClick={() => setMenu(false)}
          >
            {t.about}
          </NavLink>

          <NavLink
            to="/contact"
            className={linkStyle}
            onClick={() => setMenu(false)}
          >
            {t.contact}
          </NavLink>

          <NavLink
            to="/register-provider"
            onClick={() => setMenu(false)}
            className="bg-teal-600 text-white text-center p-3 rounded-lg w-full font-semibold hover:bg-teal-700"
          >
            {t.joinAsProvider}
          </NavLink>

          {!isLoggedIn ? (
            <div className="grid grid-cols-2 gap-3 w-full">
              <NavLink
                to="/login"
                onClick={() => setMenu(false)}
                className="flex items-center justify-center gap-2 border-2 border-teal-600 text-teal-600 dark:text-teal-400 text-center p-3 rounded-xl font-semibold hover:bg-teal-600 hover:text-white dark:hover:text-white transition"
              >
                <LogIn size={18} />
                {t.login}
              </NavLink>

              <NavLink
                to="/signup"
                onClick={() => setMenu(false)}
                className="flex items-center justify-center gap-2 bg-teal-600 text-white text-center p-3 rounded-xl font-semibold hover:bg-teal-700 transition"
              >
                <UserRoundPlus size={18} />
                {t.signup}
              </NavLink>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-3">
              <NavLink to="/profile" onClick={() => setMenu(false)} className="flex items-center gap-2 text-teal-600 dark:text-teal-400"><UserRound size={20} />{t.myProfile}</NavLink>
              {user?.role === "admin" && <NavLink to="/admin" onClick={() => setMenu(false)} className="text-teal-600 dark:text-teal-400"><LayoutDashboard size={18} />{t.adminTitle}</NavLink>}
              {user?.role === "provider" && <NavLink to="/provider-dashboard" onClick={() => setMenu(false)} className="flex items-center gap-2 text-teal-600 dark:text-teal-400"><Stethoscope size={20} />{t.providerDashboard}</NavLink>}
              <button onClick={() => { onLogout(); setMenu(false); }} className="flex items-center gap-2 text-red-600 cursor-pointer"><LogOut size={20} />{t.logout}</button>
            </div>
          )}

          <div className="w-full border-t border-gray-200 dark:border-slate-600 pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {t.selectLanguage}
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  (changeLanguage("English"), setMenu(false));
                }}
                className={`p-3 rounded-lg text-sm cursor-pointer ${
                  language === "English"
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white"
                }`}
              >
                <span className="flex justify-center gap-2">
                  <Globe size={20} />
                  English
                </span>
              </button>

              <button
                onClick={() => {
                  (changeLanguage("Persian"), setMenu(false));
                }}
                className={`p-3 rounded-lg text-sm cursor-pointer ${
                  language === "Persian"
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white"
                }`}
              >
                <span className="flex justify-center gap-2">
                  <Globe size={20} />
                  Persian
                </span>
              </button>

              <button
                onClick={() => {
                  (changeLanguage("Pashto"), setMenu(false));
                }}
                className={`p-3 rounded-lg text-sm cursor-pointer ${
                  language === "Pashto"
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white"
                }`}
              >
                <span className="flex justify-center gap-2">
                  <Globe size={20} />
                  Pashto
                </span>
              </button>
            </div>
          </div>

          <div className="w-full flex items-center justify-between bg-gray-100 dark:bg-slate-700 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-gray-800 dark:text-white">
              {dark ? <Moon size={20} /> : <Sun size={20} />}
              <span className="font-medium">{t.darkMode}</span>
            </div>

            <button
              onClick={() => setDark(!dark)}
              className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                dark ? "bg-teal-600" : "bg-gray-400"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                  dark
                    ? language === "English"
                      ? "translate-x-7"
                      : "-translate-x-7"
                    : "translate-x-0"
                }`}
              ></div>
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
