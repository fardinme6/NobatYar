
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaGithub, FaInstagram, FaFacebook } from "react-icons/fa";
import { translations } from "../data/translations";

export default function Footer({ language }) {
  const t = translations[language];

  return (
    <footer className="bg-gray-900 dark:bg-slate-950 text-white px-6 pt-16 pb-6 md:px-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <h2 className="text-3xl font-bold mb-4">
            {t.brandFirst}
            {language !== "English" && " "}
            <span className="text-teal-400">{t.brandSecond}</span>
          </h2>

          <p className="text-gray-400 leading-relaxed">
            {t.motto}
          </p>

          <div className="flex items-center gap-4 mt-6">
            <a
              href="https://github.com/fardinme6"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-gray-400 hover:text-teal-400 transition-colors"
            >
              <FaGithub size={21} />
            </a>

            <a
              href="https://instagram.com/fardinmehry10"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-gray-400 hover:text-teal-400 transition-colors"
            >
              <FaInstagram size={21} />
            </a>

            <a
              href="https://facebook.com/fardinmehry10"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-gray-400 hover:text-teal-400 transition-colors"
            >
              <FaFacebook size={21} />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-5">{t.quickLinks}</h3>

          <div className="flex flex-col gap-3 text-gray-400">
            <Link to="/home" className="hover:text-teal-400 transition-colors">
              {t.home}
            </Link>

            <Link
              to="/specialties"
              className="hover:text-teal-400 transition-colors"
            >
              {t.Specialties}
            </Link>

            <Link
              to="/hospitals"
              className="hover:text-teal-400 transition-colors"
            >
              {t.hospitalsClinics}
            </Link>

            <Link
              to="/doctors"
              className="hover:text-teal-400 transition-colors"
            >
              {t.Doctors}
            </Link>

            <Link
              to="/register-provider"
              className="hover:text-teal-400 transition-colors"
            >
              {t.joinAsProvider}
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-5">
            {t.supportInformation}
          </h3>

          <div className="flex flex-col gap-3 text-gray-400">
            <Link
              to="/about"
              className="hover:text-teal-400 transition-colors"
            >
              {t.aboutUs}
            </Link>

            <Link
              to="/contact"
              className="hover:text-teal-400 transition-colors"
            >
              {t.contactUs}
            </Link>

            <Link
              to="/my-appointments"
              className="hover:text-teal-400 transition-colors"
            >
              {t.myAppointments}
            </Link>

            <Link
              to="/how-it-works"
              className="hover:text-teal-400 transition-colors"
            >
              {t.howItWorks}
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-5">{t.getInTouch}</h3>

          <div className="flex flex-col gap-4 text-gray-400">
            <a
              href="mailto:fardinmehry7@gmail.com"
              className="flex items-center gap-3 hover:text-teal-400 transition-colors"
            >
              <Mail className="w-5 h-5 text-teal-400 shrink-0" />
              <span dir="ltr" className="break-all">
                fardinmehry7@gmail.com
              </span>
            </a>

            <a
              href="tel:+93797952149"
              className="flex items-center gap-3 hover:text-teal-400 transition-colors"
            >
              <Phone className="w-5 h-5 text-teal-400 shrink-0" />
              <span dir="ltr">+93 797 952 149</span>
            </a>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Herat%2C%20Afghanistan"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:text-teal-400 transition-colors"
            >
              <MapPin className="w-5 h-5 text-teal-400 shrink-0" />
              {t.address}
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-gray-700 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-gray-400 text-sm">
        <p className="text-center sm:text-start">
          © {new Date().getFullYear()} {t.brandFirst}
          {language !== "English" && " "}
          {t.brandSecond}. {t.rights}
        </p>
      </div>
    </footer>
  );
}
