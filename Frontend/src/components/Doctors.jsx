import { useEffect, useState } from "react";
import { api } from "../api";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  MapPin,
  Hospital,
  SlidersHorizontal,
  RotateCcw,
  ArrowUpRight,
  Users,
  SearchX,
} from "lucide-react";
import { translations } from "../data/translations.js";
import { doctors } from "../data/doctorsData.js";
import { specialties } from "../data/specialties.js";

export default function Doctors({ language, home = false }) {
  const t = translations[language];
  const [onlineDoctors, setOnlineDoctors] = useState([]);
  useEffect(() => { api("/doctors").then(setOnlineDoctors).catch(()=>{}); }, []);
  const allDoctors = [...doctors.filter(d=>!onlineDoctors.some(o=>o.id===d.id)), ...onlineDoctors];
  const label = value => t[value] || value || "";

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const [searchParams, setSearchParams] = useSearchParams();

  const specialty = searchParams.get("specialty") || "all";
  const filteredDoctors = allDoctors.filter((doctor) => {
    const keyword = search.toLowerCase().trim();

    const matchSearch =
      label(doctor.name).toLowerCase().includes(keyword) ||
      label(doctor.specialty).toLowerCase().includes(keyword) ||
      label(doctor.city).toLowerCase().includes(keyword);

    const matchCity = city === "all" || doctor.cityValue === city;

    const matchSpecialty =
      specialty === "all" || doctor.specialtyValue === specialty;

    return matchSearch && matchCity && matchSpecialty;
  });

  const displayedDoctors = home ? allDoctors.slice(-3) : filteredDoctors;

  const resetFilters = () => {
    setSearch("");
    setCity("all");
    setSearchParams({});
  };

  const changeSpecialty = (value) => {
    setSearchParams(value === "all" ? {} : { specialty: value });
  };

  return (
    <section
      className={`${home ? "" : "min-h-screen"} bg-gray-50 dark:bg-slate-900 py-16 px-5 md:px-10 lg:px-20`}
    >
      <div className="max-w-7xl mx-auto">
        {home ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 mb-10">
            <div className="text-center sm:text-start">
              <p className="text-teal-600 dark:text-teal-400 font-semibold">
                {t.medicalTeam}
              </p>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2">
                {t.Doctors}
              </h2>

              <p className="text-gray-600 dark:text-gray-300 mt-3">
                {t.doctorsDescription}
              </p>
            </div>

            <Link
              to="/doctors"
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-xl whitespace-nowrap transition"
            >
              {t.viewAllDoctors}
              <ArrowUpRight size={19} />
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-4 py-2 rounded-full text-sm font-medium mb-5">
                <Users size={17} />
                {t.medicalTeam}
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">
                {t.Doctors}
              </h1>

              <p className="text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
                {t.doctorsDescription}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 md:p-7 mb-10">
              <div className="flex items-center gap-2 mb-5">
                <SlidersHorizontal
                  size={21}
                  className="text-teal-600 dark:text-teal-400"
                />

                <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                  {t.filterDoctors}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="relative">
                  <Search
                    size={20}
                    className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t.searchDoctors}
                    className="w-full ps-12 pe-4 py-3.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 text-gray-900 dark:text-white placeholder:text-gray-400 transition"
                  />
                </div>

                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl outline-none focus:border-teal-500 text-gray-900 dark:text-white cursor-pointer"
                >
                  <option value="all">{t.allLocations}</option>
                  <option value="herat">{t.herat}</option>
                  <option value="kabul">{t.kabul}</option>
                  <option value="mazar">{t.mazar}</option>
                </select>

                <select
                  value={specialty}
                  onChange={(e) => changeSpecialty(e.target.value)}
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl outline-none focus:border-teal-500 text-gray-900 dark:text-white cursor-pointer"
                >
                  <option value="all">{t.allSpecialties}</option>

                  {specialties.map((item) => (
                    <option key={item.id} value={item.value}>
                      {t[item.name]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end mt-5">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer transition"
                >
                  <RotateCcw size={16} />
                  {t.resetFilters}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {t.availableDoctors}
              </h2>

              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredDoctors.length} {t.doctorsCount}
              </span>
            </div>
          </>
        )}

        {displayedDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative overflow-hidden bg-gray-100 dark:bg-slate-700">
                  <img
                    src={doctor.image}
                    alt={label(doctor.name)}
                    className="w-full h-85 object-cover object-top hover:scale-105 transition-transform duration-500"
                  />

                  <span className="absolute top-4 start-4 bg-white/95 dark:bg-slate-800/95 text-teal-700 dark:text-teal-400 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm">
                    {label(doctor.specialty)}
                  </span>
                </div>

                <div className="flex flex-col flex-1 p-6">
                  <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-sm mb-3">
                    <Hospital size={17} />
                    {label(doctor.hospital)}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {label(doctor.name)}
                  </h3>

                  <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300 mb-6">
                    <MapPin size={18} className="shrink-0 mt-1 text-teal-600" />
                    <span className="text-sm leading-6">{label(doctor.city)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <Link
                      to={`/doctors/${doctor.id}`}
                      className="flex items-center justify-center text-center border border-teal-600 text-teal-600 dark:text-teal-400 font-medium py-3 px-2 rounded-xl hover:bg-teal-50 dark:hover:bg-slate-700 transition"
                    >
                      {t.viewProfile}
                    </Link>

                    <Link
                      to={`/book-appointment/${doctor.id}`}
                      className="flex items-center justify-center text-center bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-2 rounded-xl transition"
                    >
                      {t.bookAppointment}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl py-16 px-5 text-center">
            <SearchX size={48} className="mx-auto text-gray-400 mb-5" />

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {t.noDoctorsFound}
            </h3>

            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {t.tryDifferentDoctorFilters}
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl cursor-pointer transition"
            >
              {t.resetFilters}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
