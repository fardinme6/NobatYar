
import { Search, CalendarCheck, CheckCircle2, ArrowUpRight } from "lucide-react";
import { translations } from "../data/translations";
import { Link } from "react-router-dom";

export default function HowItWorks({ language }) {
  const t = translations[language];

  const steps = [
    {
      number: "01",
      title: t.findDoctor,
      description: t.findDoctorDescription,
      icon: Search,
    },
    {
      number: "02",
      title: t.chooseTime,
      description: t.chooseTimeDescription,
      icon: CalendarCheck,
    },
    {
      number: "03",
      title: t.getConfirmed,
      description: t.getConfirmedDescription,
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="bg-teal-50 dark:bg-slate-900 px-6 py-20 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-teal-600 dark:text-teal-400 font-semibold">
            {t.simpleEasy}
          </span>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-3">
            {t.howItWorks}
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mt-4">
            {t.howDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 p-8 rounded-2xl text-center shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-20 h-20 bg-teal-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon
                    size={36}
                    className="text-teal-600 dark:text-teal-400"
                  />
                </div>

                <span className="text-teal-600 dark:text-teal-400 font-bold">
                  {t.step} {step.number}
                </span>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-3">
                  {step.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center mt-10">
          <Link
            to="/doctors"
            className="group flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 hover:shadow-lg text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300"
          >
            {t.findDoctor}
            <ArrowUpRight
              size={20}
              className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
