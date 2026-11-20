import { UserRoundPlus, Search, CalendarDays, BadgeCheck, ArrowUpRight, ArrowLeft } from "lucide-react";
import { translations } from "../data/translations";
import { Link } from "react-router-dom";

export default function HowItWorks({ language, home = false }) {
  const t = translations[language] || translations.English;
  const isEnglish = language === "English";

  const steps = [
    { title: t.howStep1Title, description: t.howStep1Description, icon: UserRoundPlus },
    { title: t.howStep2Title, description: t.howStep2Description, icon: Search },
    { title: t.howStep3Title, description: t.howStep3Description, icon: CalendarDays },
    { title: t.howStep4Title, description: t.howStep4Description, icon: BadgeCheck },
  ];

  return (
    <section className={`bg-teal-50 dark:bg-[#061b19] px-5 sm:px-8 lg:px-16 ${home ? "py-16 md:py-20" : "py-20 md:py-28"}`}>
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <span className="text-sm font-semibold text-teal-600 dark:text-teal-400">
            {t.simpleEasy}
          </span>
          <h2 className="mt-5 text-3xl font-bold leading-tight text-slate-900 dark:text-white md:text-4xl">
            {t.howItWorks}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
            {t.howDescription}
          </p>
        </div>

        <div className="relative">
          {/* The line connects all four steps on larger screens. */}
          <div className="absolute left-[12.5%] right-[12.5%] top-7 hidden border-t-2 border-dashed border-teal-200 dark:border-teal-800 lg:block" />

          <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-4 lg:gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative flex gap-4 pb-9 last:pb-0 sm:block sm:pb-0 sm:text-center">
                  {/* Vertical connector on mobile. */}
                  {index !== steps.length - 1 && (
                    <div className={`absolute top-14 bottom-0 border-s-2 border-dashed border-teal-200 dark:border-teal-800 sm:hidden ${isEnglish ? "left-7" : "right-7"}`} />
                  )}

                  <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-teal-200 bg-white text-teal-600 shadow-sm dark:border-teal-800 dark:bg-[#102d29] dark:text-teal-400 sm:mx-auto sm:mb-7">
                    <Icon size={25} strokeWidth={1.9} />
                    <span className={`absolute -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-teal-600 px-1 text-xs font-bold text-white ring-4 ring-teal-50 dark:ring-[#061b19] ${isEnglish ? "-right-2" : "-left-2"}`}>
                      {index + 1}
                    </span>
                  </div>

                  <div className="min-w-0 pt-1 sm:pt-0">
                    <h3 className="text-base font-bold leading-7 text-slate-900 dark:text-white md:text-lg">
                      {step.title}
                    </h3>
                    <p className={`mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300 ${home ? "sm:line-clamp-3" : ""}`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-12 flex justify-center md:mt-14">
          <Link
            to="/doctors"
            className="group inline-flex items-center justify-center gap-3 rounded-xl bg-teal-600 px-7 py-3.5 font-semibold text-white shadow-sm transition-all duration-200 hover:bg-teal-700 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
          >
            {t.findDoctors}
            {isEnglish ? (
              <ArrowUpRight size={19} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            ) : (
              <ArrowLeft size={19} className="transition-transform group-hover:-translate-x-1" />
            )}
          </Link>
        </div>
      </div>
    </section>
  );
}
