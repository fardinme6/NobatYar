import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaGithub, FaInstagram, FaFacebook } from "react-icons/fa";
import { translations } from "../data/translations";

export default function Footer({ language }) {
  const t = translations[language] || translations.Farsi;
  const rtl = language !== "English";
  const links = [
    ["/home", t.home],
    ["/specialties", t.Specialties],
    ["/hospitals", t.hospitalsClinics],
    ["/doctors", t.Doctors],
    ["/register-provider", t.joinAsProvider],
  ];
  const help = [
    ["/about", t.aboutUs],
    ["/contact", t.contactUs],
    ["/my-appointments", t.myAppointments],
    ["/how-it-works", t.howItWorks],
  ];

  return (
    <footer dir={rtl ? "rtl" : "ltr"} className="relative overflow-hidden bg-[#073c38] text-white dark:bg-[#052b2a]">
      <style>{`
        @keyframes ny-ecg { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .ny-ecg-track { display:flex; width:200%; height:100%; animation:ny-ecg 12s linear infinite; }
        .ny-ecg-track svg { width:50%; height:100%; flex:none; }
        @media (prefers-reduced-motion: reduce) { .ny-ecg-track { animation:none; } }
      `}</style>

      <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden="true"
        style={{ backgroundImage: "radial-gradient(circle at 20% 25%, #21c4ae 0, transparent 34%), radial-gradient(circle at 90% 80%, #22b8a6 0, transparent 35%)" }} />

      <div className="relative border-b border-white/10 py-5 overflow-hidden" aria-hidden="true" dir="ltr">
        <div className="ny-ecg-track text-[#74f4cf] opacity-90">
          {[0, 1].map((i) => (
            <svg key={i} viewBox="0 0 1000 70" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 35 H1000" stroke="currentColor" strokeWidth="1" opacity=".22" />
              <path d="M0 35 H125 L140 35 L153 26 L167 44 L185 8 L207 63 L225 35 H420 L435 35 L448 26 L462 44 L480 8 L502 63 L520 35 H715 L730 35 L743 26 L757 44 L775 8 L797 63 L815 35 H1000" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pt-12 pb-10 md:px-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link to="/home" className="inline-flex items-center gap-3" aria-label={t.brandFirst + " " + t.brandSecond}>
              <img src="/logo.png" alt="NobatYar" width="76" height="76" loading="lazy" className="h-[76px] w-[76px] object-contain" />
              <span className="text-2xl font-bold">{t.brandFirst} <span className="text-[#5ce1c1]">{t.brandSecond}</span></span>
            </Link>
            <p className="max-w-xs leading-8 text-[#d1e7e2]">{t.motto}</p>
            <div className="flex items-center gap-3">
              {[
                ["GitHub", "https://github.com/fardinme6", <FaGithub size={19} />],
                ["Instagram", "https://instagram.com/nobatyar.af", <FaInstagram size={19} />],
                ["Facebook", "https://www.facebook.com/share/1LZxpATa5E/?mibextid=wwXIfr", <FaFacebook size={19} />],
              ].map(([name, url, icon]) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={name}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:border-[#5ce1c1] hover:bg-[#0e8f85]">
                  {icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-lg font-bold text-[#83ebce]">{t.quickLinks}</h3>
            <nav className="flex flex-col gap-3" aria-label={t.quickLinks}>
              {links.map(([url, label]) => <Link key={url} to={url} className="w-fit text-[#d1e7e2] transition hover:text-white hover:underline">{label}</Link>)}
            </nav>
          </div>

          <div>
            <h3 className="mb-5 text-lg font-bold text-[#83ebce]">{t.supportInformation}</h3>
            <nav className="flex flex-col gap-3" aria-label={t.supportInformation}>
              {help.map(([url, label]) => <Link key={url} to={url} className="w-fit text-[#d1e7e2] transition hover:text-white hover:underline">{label}</Link>)}
            </nav>
          </div>

          <div>
            <h3 className="mb-5 text-lg font-bold text-[#83ebce]">{t.getInTouch}</h3>
            <div className="flex flex-col gap-5 text-[#d1e7e2]">
              <a href="mailto:nobatyaraf@gmail.com" className="flex items-center gap-3 hover:text-white">
                <Mail className="h-5 w-5 shrink-0 text-[#83ebce]" /><span dir="ltr" className="break-all">nobatyaraf@gmail.com</span>
              </a>
              <a href="tel:+93797952149" className="flex items-center gap-3 hover:text-white">
                <Phone className="h-5 w-5 shrink-0 text-[#83ebce]" /><span dir="ltr">+93 797 952 149</span>
              </a>
              <a href="https://www.google.com/maps/search/?api=1&query=Herat%2C%20Afghanistan" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-white">
                <MapPin className="h-5 w-5 shrink-0 text-[#83ebce]" /><span>{t.address}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/15 pt-6 text-center text-sm text-[#b6d2cc] sm:text-start">
          © {new Date().getFullYear()} {t.brandFirst} {t.brandSecond}. {t.rights}
        </div>
      </div>
    </footer>
  );
}
