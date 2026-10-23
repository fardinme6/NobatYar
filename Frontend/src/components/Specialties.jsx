import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { translations } from "../data/translations";
import { specialties } from "../data/specialties";

export default function Specialties({ language }) {
  const t = translations[language];

  return (
    <section className="bg-white dark:bg-slate-800 px-6 py-20 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 mb-10">
          <div className="text-center sm:text-start">
            <span className="text-teal-600 dark:text-teal-400 font-semibold">
              {t.specialtiesLabel}
            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-3">
              {t.importantSpecialties}
            </h2>

            <p className="text-gray-600 dark:text-gray-300 mt-4">
              {t.specialtiesDescription}
            </p>
          </div>

          <Link
            to="/specialties"
            className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-xl whitespace-nowrap transition"
          >
            {t.viewAllSpecialties}
            <ArrowUpRight size={19} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {specialties.slice(0, 6).map((specialty) => (
            <Link
              key={specialty.id}
              to={`/doctors?specialty=${specialty.value}`}
              className="group bg-teal-50 dark:bg-slate-700 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="overflow-hidden">
                <img
                  src={specialty.image}
                  alt={t[specialty.name]}
                  className="w-full h-40 sm:h-45 md:h-50 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-4 text-center">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t[specialty.name]}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
