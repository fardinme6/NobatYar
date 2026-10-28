
import { useEffect, useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";
import {
  Search,
  Stethoscope,
  ArrowUpRight,
  SearchX,
  RotateCcw,
  Users,
} from "lucide-react";
import { translations } from "../data/translations";

export default function SpecialtiesPage({ language, user }) {
  const t = translations[language];
  const [onlineSpecialties,setOnlineSpecialties] = useState([]);
  useEffect(()=>{api("/specialties").then(setOnlineSpecialties).catch(()=>{});},[]);
  const allSpecialties = onlineSpecialties;
  const [onlineDoctors, setOnlineDoctors] = useState([]);
  useEffect(() => { api("/doctors").then(setOnlineDoctors).catch(() => {}); }, []);
  const [search, setSearch] = useState("");

  const filteredSpecialties = allSpecialties.filter((specialty) =>
    (t[specialty.name] || specialty.name || "").toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <section className="bg-teal-600 px-5 py-14 md:py-20 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full text-sm font-medium mb-5">
            <Stethoscope size={18} />
            {t.specialtiesBadge}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold">
            {t.specialtiesPageTitle}
          </h1>

          <p className="text-teal-50 mt-5 max-w-2xl mx-auto leading-7">
            {t.specialtiesPageDescription}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 md:px-10 lg:px-16 py-12 md:py-16">
        <div className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <Search
              size={20}
              className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchSpecialties}
              className="w-full ps-12 pe-4 py-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 text-gray-900 dark:text-white placeholder:text-gray-400 transition"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 mb-7">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            {t.allSpecialties}
          </h2>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredSpecialties.length} {t.specialtiesCount}
          </span>
        </div>

        {filteredSpecialties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredSpecialties.map((specialty) => {
              const doctorCount = onlineDoctors.filter(
                (doctor) => doctor.specialtyValue === specialty.value
              ).length;

              return (
                <div
                  key={specialty.id}
                  className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {user?.role === "admin" && onlineSpecialties.some(s=>s.id===specialty.id) && <Link to={`/admin?tab=specialties&edit=${specialty.id}`} className="block bg-teal-600 text-white text-center py-2">✎ Edit / Delete Specialty</Link>}
                  <div className="overflow-hidden bg-gray-100 dark:bg-slate-700">
                    <img
                      src={specialty.image}
                      alt={t[specialty.name] || specialty.name}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="flex flex-col flex-1 p-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                      {t[specialty.name] || specialty.name}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                      <Users size={17} className="text-teal-600 dark:text-teal-400" />
                      <span>
                        {doctorCount} {t.doctorsCount}
                      </span>
                    </div>

                    <Link
                      to={`/doctors?specialty=${specialty.value}`}
                      className="mt-auto flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-xl transition"
                    >
                      {t.viewDoctorsBySpecialty}
                      <ArrowUpRight size={18} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl py-16 px-5 text-center">
            <SearchX size={48} className="mx-auto text-gray-400 mb-5" />

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {t.noSpecialtiesFound}
            </h3>

            <button
              type="button"
              onClick={() => setSearch("")}
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl cursor-pointer transition"
            >
              <RotateCcw size={17} />
              {t.resetFilters}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
