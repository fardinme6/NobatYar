import { Link } from "react-router-dom";
import { FaGithub, FaInstagram, FaFacebook, FaLinkedin } from "react-icons/fa";
import {
  CalendarCheck,
  Stethoscope,
  Hospital,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Globe,
  ExternalLink,
  Code2,
} from "lucide-react";
import { translations } from "../data/translations";

export default function About({ language }) {
  const t = translations[language];
  const ArrowIcon = language === "English" ? ArrowRight : ArrowLeft;

  const socialLinks = [
    {
      name: "Portfolio",
      icon: Globe,
      url: "https://fardinmehry.vercel.app",
    },
    {
      name: "GitHub",
      icon: FaGithub,
      url: "https://github.com/fardinme6",
    },
    {
      name: "Instagram",
      icon: FaInstagram,
      url: "https://www.instagram.com/fardinmehry10/",
    },
    {
      name: "Facebook",
      icon: FaFacebook,
      url: "https://facebook.com/fardinmehry10",
    },
    {
      name: "LinkedIn",
      icon: FaLinkedin,
      url: "https://www.linkedin.com/in/fardin-mehry-93900214b",
    },
  ];

  return (
    <main className="bg-gray-50 dark:bg-slate-900">
      <section className="bg-teal-600 text-white px-5 py-14 md:py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="w-20 h-20 mx-auto mb-5 bg-white rounded-2xl flex items-center justify-center p-2 shadow-md">
            <img
              src="/logo.png"
              alt="NobatYar Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {t.aboutUsTitle}
          </h1>

          <p className="text-teal-50 leading-8 text-base md:text-lg">
            {t.aboutUsSubtitle}
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-teal-600 dark:text-teal-400 font-semibold text-sm">
              {t.aboutNobatYar}
            </span>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-3 mb-5">
              {t.aboutMainHeading}
            </h2>

            <p className="text-gray-600 dark:text-gray-300 leading-8 text-justify">
              {t.aboutMainDescription}
            </p>

            <Link
              to="/doctors"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-xl font-medium mt-6 transition"
            >
              {t.findDoctors}
              <ArrowIcon size={18} />
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-7 md:p-10 shadow-sm">
            <img
              src="/logo.png"
              alt="NobatYar"
              className="w-36 h-36 object-contain mx-auto mb-6"
            />

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">
              NobatYar
            </h3>

            <p className="text-gray-500 dark:text-gray-400 text-center leading-7">
              {t.aboutBrandDescription}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-800 py-12 md:py-16 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {t.aboutFeaturesTitle}
            </h2>

            <p className="text-gray-500 dark:text-gray-400">
              {t.aboutFeaturesSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Stethoscope,
                title: t.aboutFeatureOne,
                description: t.aboutFeatureOneText,
              },
              {
                icon: Hospital,
                title: t.aboutFeatureTwo,
                description: t.aboutFeatureTwoText,
              },
              {
                icon: CalendarCheck,
                title: t.aboutFeatureThree,
                description: t.aboutFeatureThreeText,
              },
              {
                icon: ShieldCheck,
                title: t.aboutFeatureFour,
                description: t.aboutFeatureFourText,
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-xl mb-5">
                  <feature.icon size={25} />
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400 leading-7">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-12 md:py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {t.meetDeveloper}
          </h2>

          <p className="text-gray-500 dark:text-gray-400">
            {t.developerSubtitle}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-5 items-center">
            <div className="md:col-span-2 bg-teal-50 dark:bg-slate-700 p-5 md:p-7 flex items-center justify-center">
              <div className="w-full bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-xl">
                <img
                  src="/fardin.JPG"
                  alt="Fardin Mehry"
                  className="w-full h-auto rounded-xl"
                />
              </div>
            </div>

            <div className="md:col-span-3 p-6 md:p-10">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Fardin Mehry
              </h3>
              <div className="inline-flex items-center gap-2 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-3 py-1.5 rounded-full text-sm font-medium mb-4">
                <Code2 size={16} />
                {t.developerRole}
              </div>

              <p className="text-gray-600 dark:text-gray-300 leading-8 text-justify mb-6">
                {t.developerDescription}
              </p>

              <div className="flex flex-wrap gap-2 mb-7">
                {[
                  "HTML",
                  "CSS",
                  "JavaScript",
                  "React",
                  "Tailwind CSS",
                  "Dart",
                  "Flutter",
                  "Accounting",
                ].map((skill) => (
                  <span
                    key={skill}
                    className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                {socialLinks
                  .filter((social) => social.url)
                  .map((social) => {
                    const Icon = social.icon;

                    return (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        className="flex items-center gap-2 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:border-teal-600 hover:text-teal-600 dark:hover:text-teal-400 px-4 py-2.5 rounded-xl text-sm font-medium transition"
                      >
                        <Icon size={18} />
                        {social.name}
                        <ExternalLink size={13} />
                      </a>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-14">
        <div className="max-w-6xl mx-auto bg-teal-600 rounded-2xl px-6 py-10 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {t.aboutCtaTitle}
          </h2>

          <p className="text-teal-50 mb-7 leading-7">{t.aboutCtaDescription}</p>

          <Link
            to="/hospitals"
            className="inline-flex items-center gap-2 bg-white text-teal-700 hover:bg-teal-50 px-6 py-3 rounded-xl font-semibold transition"
          >
            {t.hospitals}
            <ArrowIcon size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
