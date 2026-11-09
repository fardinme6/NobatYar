import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaGithub, FaInstagram, FaFacebook } from "react-icons/fa";
import { translations } from "../data/translations";

export default function Footer({ language }) {
  const t = translations[language] || translations.English;
  const isEnglish = language === "English";
  const linkStyle = "block w-fit max-w-full text-slate-300 hover:text-emerald-300 transition-colors duration-200";

  return (
    <footer dir={isEnglish ? "ltr" : "rtl"} className="relative overflow-hidden bg-[#083b38] dark:bg-[#102d29] text-white transition-colors duration-300">
      {/* خط ضربان قلب */}
      <div className="relative h-20 md:h-24 overflow-hidden border-b border-white/10" aria-hidden="true">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(90deg, transparent 49.8%, #7ce8ca 50%, transparent 50.2%)", backgroundSize: "65px 100%" }} />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 100" preserveAspectRatio="none">
          <path d="M0 50 H1200" stroke="#6edbc3" strokeWidth="1.5" opacity=".25" fill="none" />
          <path className="nobatyar-ecg" d="M0 50 H420 L455 50 L475 35 L497 68 L522 12 L551 88 L577 50 H1200" stroke="#80f5cc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 md:px-12 lg:px-16 pt-12 pb-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* لوگو و شعار: در RTL سمت راست و در انگلیسی سمت چپ */}
          <div className="space-y-5">
            <Link to="/home" className="inline-flex items-center gap-3 group" aria-label={t.brandFirst + " " + t.brandSecond}>
              <img src="/logo.png" alt="NobatYar" width="74" height="74" loading="lazy" className="h-[74px] w-[74px] object-contain shrink-0 transition-transform duration-300 group-hover:scale-105" />
              <span className="text-3xl font-bold tracking-tight">
                {t.brandFirst}{language !== "English" && " "}<span className="text-emerald-300">{t.brandSecond}</span>
              </span>
            </Link>
            <p className="max-w-xs text-slate-200 leading-8 text-base">{t.motto}</p>
            <div className="flex items-center gap-3" aria-label="Social media">
              <a href="https://github.com/fardinme6" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/5 text-slate-200 hover:bg-teal-600 hover:text-white transition-colors"><FaGithub size={19} /></a>
              <a href="https://instagram.com/nobatyar.af" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/5 text-slate-200 hover:bg-teal-600 hover:text-white transition-colors"><FaInstagram size={19} /></a>
              <a href="https://www.facebook.com/share/1LZxpATa5E/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/5 text-slate-200 hover:bg-teal-600 hover:text-white transition-colors"><FaFacebook size={19} /></a>
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-lg font-bold text-emerald-200">{t.quickLinks}</h3>
            <nav className="flex flex-col gap-3" aria-label={t.quickLinks}>
              <Link to="/home" className={linkStyle}>{t.home}</Link>
              <Link to="/specialties" className={linkStyle}>{t.Specialties}</Link>
              <Link to="/hospitals" className={linkStyle}>{t.hospitalsClinics}</Link>
              <Link to="/doctors" className={linkStyle}>{t.Doctors}</Link>
              <Link to="/register-provider" className={linkStyle}>{t.joinAsProvider}</Link>
            </nav>
          </div>

          <div>
            <h3 className="mb-5 text-lg font-bold text-emerald-200">{t.supportInformation}</h3>
            <nav className="flex flex-col gap-3" aria-label={t.supportInformation}>
              <Link to="/about" className={linkStyle}>{t.aboutUs}</Link>
              <Link to="/contact" className={linkStyle}>{t.contactUs}</Link>
              <Link to="/my-appointments" className={linkStyle}>{t.myAppointments}</Link>
              <Link to="/how-it-works" className={linkStyle}>{t.howItWorks}</Link>
            </nav>
          </div>

          <div>
            <h3 className="mb-5 text-lg font-bold text-emerald-200">{t.getInTouch}</h3>
            <div className="flex flex-col gap-5 text-slate-300">
              <a href="mailto:nobatyaraf@gmail.com" className="flex items-center gap-3 hover:text-emerald-300 transition-colors">
                <Mail className="h-5 w-5 shrink-0 text-emerald-300" />
                <span dir="ltr" className="break-all">nobatyaraf@gmail.com</span>
              </a>
              <a href="tel:+93797952149" className="flex items-center gap-3 hover:text-emerald-300 transition-colors">
                <Phone className="h-5 w-5 shrink-0 text-emerald-300" />
                <span dir="ltr">+93 797 952 149</span>
              </a>
              <a href="https://www.google.com/maps/search/?api=1&query=Herat%2C%20Afghanistan" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-emerald-300 transition-colors">
                <MapPin className="h-5 w-5 shrink-0 text-emerald-300" />
                <span>{t.address}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/15 pt-6 text-center text-sm text-slate-300">
          © {new Date().getFullYear()} {t.brandFirst}{language !== "English" && " "}{t.brandSecond}. {t.rights}
        </div>
      </div>

      <style>{`
        .nobatyar-ecg {
          stroke-dasharray: 1600;
          stroke-dashoffset: 1600;
          animation: nobatyar-heartbeat 4s linear infinite;
          filter: drop-shadow(0 0 5px rgba(128, 245, 204, .65));
        }
        @keyframes nobatyar-heartbeat {
          0% { stroke-dashoffset: 1600; opacity: 0; }
          8% { opacity: 1; }
          88% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .nobatyar-ecg { animation: none; stroke-dashoffset: 0; }
        }
      `}</style>
    </footer>
  );
}
