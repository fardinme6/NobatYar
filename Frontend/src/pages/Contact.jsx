
import { useState } from "react";
import { api } from "../api";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock3,
  ExternalLink,
} from "lucide-react";
import { FaGithub, FaInstagram, FaFacebook } from "react-icons/fa";
import { translations } from "../data/translations";

export default function Contact({ language }) {
  const t = translations[language];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    try { await api("/contact", { method: "POST", body: JSON.stringify({ name, email, message: `${subject}\n\n${message}` }) }); setSubmitted(true); }
    catch (err) { setError(err.message); }
  };

  const inputStyle =
    "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition";

  const labelStyle =
    "block text-sm font-semibold px-3 text-gray-700 dark:text-gray-200 mb-2";

  const cardStyle =
    "bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm";

  const iconStyle =
    "w-12 h-12 shrink-0 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center";

  return (
    <main className="bg-gray-50 dark:bg-slate-900">
      <section className="bg-teal-600 text-white px-5 py-14 md:py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="w-20 h-20 mx-auto mb-5 bg-white rounded-2xl p-2 shadow-md">
            <img
              src="/logo.png"
              alt="NobatYar Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {t.contactPageTitle}
          </h1>

          <p className="text-teal-50 leading-8">
            {t.contactPageSubtitle}
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="mb-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {t.contactInfoTitle}
              </h2>

              <p className="text-gray-500 dark:text-gray-400 leading-7">
                {t.contactInfoDescription}
              </p>
            </div>

            <div className={`${cardStyle} p-5 flex items-center gap-4 hover:shadow-md transition`}>
              <a href="mailto:fardinmehry7@gmail.com" target="_blank" className={iconStyle}>
                <Mail size={22} />
              </a>

              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t.contactEmailLabel}
                </h3>

                <a
                  href="mailto:fardinmehry7@gmail.com"
                  dir="ltr"
                  className="block text-gray-500 dark:text-gray-400 text-sm hover:text-teal-600 dark:hover:text-teal-400 transition break-all"
                >
                  fardinmehry7@gmail.com
                </a>
              </div>
            </div>

            <div className={`${cardStyle} p-5 flex items-center gap-4 hover:shadow-md transition`}>
              <a href="tel:+93797952149" className={iconStyle}>
                <Phone size={22} />
              </a>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t.contactPhoneLabel}
                </h3>

                <a
                  href="tel:+93797952149"
                  target="_blank"
                  dir="ltr"
                  className="block text-gray-500 dark:text-gray-400 text-sm hover:text-teal-600 dark:hover:text-teal-400 transition"
                >
                  +93 797 952 149
                </a>
              </div>
            </div>

            <div className={`${cardStyle} p-5 flex-1 flex flex-col gap-4`}>
              <div className="flex items-center gap-4">
                <a href="https://www.google.com/maps/search/?api=1&query=Herat%2C%20Afghanistan" target="_blank" className={iconStyle}>
                  <MapPin size={22} />
                </a>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t.contactLocationLabel}
                  </h3>

                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Herat%2C%20Afghanistan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    {t.contactLocationValue}
                  </a>
                </div>
              </div>

              <div className="w-full flex-1 min-h-64 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700">
                <iframe
                  title="Herat, Afghanistan Map"
                  src="https://www.google.com/maps?q=Herat,Afghanistan&z=13&output=embed"
                  className="w-full h-full min-h-64 border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                ></iframe>
              </div>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Herat%2C%20Afghanistan"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition py-1"
              >
                <MapPin size={17} />
                {t.viewOnGoogleMaps}
                <ExternalLink size={15} />
              </a>
            </div>

            <div className={`${cardStyle} p-5`}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                {t.contactSocialTitle}
              </h3>

              <div className="flex flex-wrap gap-3">
                <a
                  href="https://github.com/fardinme6"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white hover:bg-teal-600 hover:text-white transition"
                >
                  <FaGithub size={21} />
                </a>

                <a
                  href="https://instagram.com/fardinmehry10"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white hover:bg-teal-600 hover:text-white transition"
                >
                  <FaInstagram size={21} />
                </a>

                <a
                  href="https://facebook.com/fardinmehry10"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white hover:bg-teal-600 hover:text-white transition"
                >
                  <FaFacebook size={21} />
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 flex">
            <div className={`${cardStyle} w-full h-full p-6 md:p-8 flex flex-col`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={iconStyle}>
                  <MessageSquare size={24} />
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {t.contactFormTitle}
                </h2>
              </div>

              <p className="text-gray-500 dark:text-gray-400 text-sm mb-7 leading-7">
                {t.contactFormDescription}
              </p>

              {error && <p role="alert" className="text-red-600">{error}</p>}
              <form
                onSubmit={handleSubmit}
                className="flex flex-col flex-1 gap-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="contact-name" className={labelStyle}>
                      {t.fullName}
                    </label>

                    <input
                      id="contact-name"
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setSubmitted(false);
                      }}
                      placeholder={t.enterFullName}
                      required
                      className={inputStyle}
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className={labelStyle}>
                      {t.emailAddress}
                    </label>

                    <input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setSubmitted(false);
                      }}
                      placeholder="example@gmail.com"
                      required
                      dir="ltr"
                      className={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-subject" className={labelStyle}>
                    {t.contactSubject}
                  </label>

                  <input
                    id="contact-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setSubmitted(false);
                    }}
                    placeholder={t.contactSubjectPlaceholder}
                    required
                    className={inputStyle}
                  />
                </div>

                <div className="flex flex-col flex-1">
                  <label htmlFor="contact-message" className={labelStyle}>
                    {t.contactMessage}
                  </label>

                  <textarea
                    id="contact-message"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      setSubmitted(false);
                    }}
                    placeholder={t.contactMessagePlaceholder}
                    required
                    className={`${inputStyle} resize-none flex-1 min-h-48`}
                  />
                </div>

                {submitted && (
                  <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-xl p-4 text-sm leading-7">
                    <Clock3 size={20} className="shrink-0 mt-1" />
                    <span>{t.contactNotConnected}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 rounded-xl transition cursor-pointer"
                >
                  <Send size={18} />
                  {t.contactSendMessage}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
