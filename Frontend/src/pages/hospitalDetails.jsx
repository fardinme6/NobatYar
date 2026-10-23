import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  MapPin,
  Users,
  SearchX,
  Info,
} from "lucide-react";
import { hospitals } from "../data/hospitalData.js";
import { api } from "../api";
import { useEffect, useState } from "react";
import { translations } from "../data/translations.js";

export default function HospitalDetails({ language }) {
  const t = translations[language];
  const { id } = useParams();

  const [onlineHospital, setOnlineHospital] = useState(null);
  const [hospitalLoading, setHospitalLoading] = useState(true);
  useEffect(() => { setHospitalLoading(true); api(`/hospitals/${id}?lang=${language === "Persian" ? "fa" : language === "Pashto" ? "ps" : "en"}`).then(setOnlineHospital).catch(()=>setOnlineHospital(null)).finally(()=>setHospitalLoading(false)); }, [id, language]);
  const hospital = onlineHospital;
  const label = value => t[value] || value || "";

  const BackIcon = language === "English" ? ArrowLeft : ArrowRight;

  if (hospitalLoading) return <p className="text-center p-10 dark:text-white">Loading...</p>;

  if (!hospital) {
    return (
      <section className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col items-center justify-center px-5 text-center">
        <SearchX size={50} className="text-gray-400 mb-5" />

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {t.hospitalNotFound}
        </h1>

        <Link
          to="/hospitals"
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl transition"
        >
          {t.backToHospitals}
        </Link>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-slate-900 px-5 md:px-10 lg:px-20 py-12">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/hospitals"
          className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 font-medium mb-8 hover:text-teal-700 transition"
        >
          <BackIcon size={19} />
          {t.backToHospitals}
        </Link>

        <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="relative">
            <img
              src={hospital.image}
              alt={label(hospital.name)}
              className="w-full h-64 md:h-96 object-cover"
            />

            <span className="absolute top-5 start-5 bg-white/95 dark:bg-slate-800/95 text-teal-700 dark:text-teal-400 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm">
              {label(hospital.type)}
            </span>
          </div>

          <div className="p-6 md:p-9">
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-sm font-medium mb-3">
              <Building2 size={18} />
              {t.healthcareCenters}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {label(hospital.name)}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
              <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Building2
                    size={23}
                    className="text-teal-600 dark:text-teal-400"
                  />

                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t.hospitalType}
                  </h3>
                </div>

                <p className="text-gray-600 dark:text-gray-300 leading-7">
                  {label(hospital.type)}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <MapPin
                    size={23}
                    className="text-teal-600 dark:text-teal-400"
                  />

                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t.hospitalAddress}
                  </h3>
                </div>

                <p className="text-gray-600 dark:text-gray-300 leading-7">
                  {label(hospital.city)}, {label(hospital.location)}
                </p>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-100 dark:border-slate-700 pt-8">
              <div className="flex items-center gap-3 mb-4">
                <Info size={23} className="text-teal-600 dark:text-teal-400" />

                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t.aboutHospital}
                </h2>
              </div>

              <p className="text-gray-600 dark:text-gray-300 leading-8 text-justify">
                {label(hospital.description) || t.hospitalInformationPending}
              </p>
            </div>

            <Link
              to={`/hospitals/${hospital.id}/doctors`}
              className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-7 py-3.5 rounded-xl font-medium mt-8 transition"
            >
              <Users size={19} />
              {t.viewDoctors}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
