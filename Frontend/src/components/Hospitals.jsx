import { useEffect, useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";
import { hospitals } from "../data/hospitalData.js";
import {
  Search,
  MapPin,
  Building2,
  SlidersHorizontal,
  RotateCcw,
  ArrowUpRight,
  Hospital,
  SearchX,
} from "lucide-react";
import { translations } from "../data/translations.js";

export default function Hospitals({ language, home = false, user }) {
  const t = translations[language];
  const [onlineHospitals,setOnlineHospitals] = useState([]);
  useEffect(()=>{api(`/hospitals?lang=${language === "Persian" ? "fa" : language === "Pashto" ? "ps" : "en"}`).then(setOnlineHospitals).catch(()=>{});},[]);
  const allHospitals = onlineHospitals;;

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const [type, setType] = useState("all");

  const filteredHospitals = allHospitals.filter((hospital) => {
    const keyword = search.toLowerCase().trim();

    const hospitalName = (t[hospital.name] || hospital.name || "").toLowerCase();
    const hospitalCity = (t[hospital.city] || hospital.city || "").toLowerCase();
    const hospitalLocation = (t[hospital.location] || hospital.location || "").toLowerCase();

    const matchSearch =
      hospitalName.includes(keyword) ||
      hospitalCity.includes(keyword) ||
      hospitalLocation.includes(keyword);

    const matchCity = city === "all" || hospital.cityValue === city;

    const matchType = type === "all" || hospital.typeValue === type;

    return matchSearch && matchCity && matchType;
  });

  const displayedHospitals = home ? allHospitals.slice(0, 3) : filteredHospitals;

  const resetFilters = () => {
    setSearch("");
    setCity("all");
    setType("all");
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
                {t.healthcareCenters}
              </p>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2">
                {t.hospitalsClinics}
              </h2>

              <p className="text-gray-600 dark:text-gray-300 mt-3">
                {t.hospitalsDescription}
              </p>
            </div>

            <Link
              to="/hospitals"
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-xl whitespace-nowrap transition"
            >
              {t.viewAll}
              <ArrowUpRight size={19} />
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-4 py-2 rounded-full text-sm font-medium mb-5">
                <Hospital size={17} />
                {t.healthcareCenters}
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">
                {t.hospitalsClinics}
              </h1>

              <p className="text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
                {t.hospitalsDescription}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 md:p-7 mb-10">
              <div className="flex items-center gap-2 mb-5">
                <SlidersHorizontal
                  size={21}
                  className="text-teal-600 dark:text-teal-400"
                />

                <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                  {t.filterHospitals}
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
                    placeholder={t.searchHospitals}
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
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl outline-none focus:border-teal-500 text-gray-900 dark:text-white cursor-pointer"
                >
                  <option value="all">{t.allHospitalTypes}</option>
                  <option value="government">{t.governmentHospital}</option>
                  <option value="private">{t.privateHospital}</option>
                  <option value="clinics">{t.clinics}</option>
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
                {t.availableHospitals}
              </h2>

              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredHospitals.length} {t.hospitalsCount}
              </span>
            </div>
          </>
        )}

        {displayedHospitals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedHospitals.map((hospital) => (
              <div
                key={hospital.id}
                className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {user?.role === "admin" && <div className="flex gap-2 p-2 bg-teal-50 dark:bg-slate-700">
                  <Link to={`/admin?tab=hospitals&edit=${hospital.id}`} className="flex-1 bg-teal-600 text-white rounded-lg text-center py-2">Edit</Link>
                  <button onClick={async()=>{
                    if (!window.confirm("Delete this hospital?")) return;
                    try { await api(`/admin/hospitals/${hospital.id}`, {method:"DELETE"}); setOnlineHospitals(items=>items.filter(item=>item.id!==hospital.id)); }
                    catch(error) {alert(error.message);}
                  }} className="flex-1 bg-red-600 text-white rounded-lg py-2">Delete</button>
                </div>}
                <div className="relative overflow-hidden">
                  <img
                    src={hospital.image}
                    alt={t[hospital.name] || hospital.name}
                    className="w-full h-56 object-cover hover:scale-105 transition-transform duration-500"
                  />

                  <span className="absolute top-4 start-4 bg-white/95 dark:bg-slate-800/95 text-teal-700 dark:text-teal-400 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm">
                    {t[hospital.type] || hospital.type}
                  </span>
                </div>

                <div className="flex flex-col flex-1 p-6">
                  <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-sm mb-3">
                    <Building2 size={17} />
                    {t.healthcareCenters}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {t[hospital.name] || hospital.name}
                  </h3>

                  <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300 mb-6">
                    <MapPin size={18} className="shrink-0 mt-1 text-teal-600" />

                    <span className="text-sm leading-6">
                      {t[hospital.city] || hospital.city}, {t[hospital.location] || hospital.location}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <Link
                      to={`/hospitals/${hospital.id}`}
                      className="flex items-center justify-center text-center border border-teal-600 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-700 px-2 py-3 rounded-xl text-sm font-medium transition"
                    >
                      {t.viewDetails}
                    </Link>

                    <Link
                      to={`/hospitals/${hospital.id}/doctors`}
                      className="flex items-center justify-center text-center bg-teal-600 hover:bg-teal-700 text-white px-2 py-3 rounded-xl text-sm font-medium transition"
                    >
                      {t.viewDoctors}
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
              {t.noHospitalsFound}
            </h3>

            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {t.tryDifferentFilters}
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
