
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Stethoscope,
  CalendarDays,
  UserRound,
  SearchX,
} from "lucide-react";
import { hospitals } from "../data/hospitalData.js";
import { api } from "../api";
import { useEffect, useState } from "react";
import { doctors } from "../data/doctorsData.js";
import { translations } from "../data/translations.js";

export default function HospitalDoctors({ language }) {
  const t = translations[language];
  const { id } = useParams();

  const [onlineHospital, setOnlineHospital] = useState(null);
  const [onlineDoctors, setOnlineDoctors] = useState([]);
  useEffect(() => { api("/doctors").then(setOnlineDoctors).catch(() => {}); }, []);
  const [hospitalLoading, setHospitalLoading] = useState(true);
  useEffect(() => { setHospitalLoading(true); api(`/hospitals/${id}`).then(setOnlineHospital).catch(()=>setOnlineHospital(null)).finally(()=>setHospitalLoading(false)); }, [id]);
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

  const hospitalDoctors = onlineDoctors.filter(
    (doctor) => doctor.hospital === hospital.name
  );

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-slate-900 px-5 md:px-10 lg:px-20 py-12">
      <div className="max-w-7xl mx-auto">
        <Link
          to={`/hospitals/${hospital.id}`}
          className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 font-medium mb-8 hover:text-teal-700 transition"
        >
          <BackIcon size={19} />
          {t.viewDetails}
        </Link>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 md:p-8 mb-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <img
              src={hospital.image}
              alt={label(hospital.name)}
              className="w-full sm:w-48 h-44 object-cover rounded-xl"
            />

            <div className="text-center sm:text-start">
              <p className="text-teal-600 dark:text-teal-400 font-medium mb-2">
                {t.healthcareCenters}
              </p>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {label(hospital.name)}
              </h1>

              <p className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 dark:text-gray-300 mt-4">
                <MapPin size={18} className="text-teal-600 shrink-0" />
                {label(hospital.city)}, {label(hospital.location)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 flex items-center justify-center bg-teal-100 dark:bg-teal-900/30 rounded-xl">
            <Stethoscope
              size={25}
              className="text-teal-600 dark:text-teal-400"
            />
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {t.hospitalDoctors}
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {hospitalDoctors.length} {t.doctorsCount}
            </p>
          </div>
        </div>

        {hospitalDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitalDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="overflow-hidden">
                  <img
                    src={doctor.image}
                    alt={t[doctor.name]}
                    className="w-full h-100 object-cover object-top hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="flex flex-col flex-1 p-6">
                  <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-sm mb-3">
                    <UserRound size={17} />
                    {t[doctor.specialty]}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {t[doctor.name]}
                  </h3>

                  <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm mb-6">
                    <MapPin size={17} className="text-teal-600 shrink-0" />
                    {t[doctor.city]}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <Link
                      to={`/doctors/${doctor.id}`}
                      className="flex items-center justify-center gap-2 text-center border border-teal-600 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-700 py-3 rounded-xl text-sm font-medium transition"
                    >
                      <UserRound size={17} />
                      {t.viewProfile}
                    </Link>

                    <Link
                      to={`/book-appointment/${doctor.id}`}
                      className="flex items-center justify-center gap-2 text-center bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl text-sm font-medium transition"
                    >
                      <CalendarDays size={17} />
                      {t.bookAppointment}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl px-5 py-16 text-center">
            <Stethoscope size={48} className="mx-auto text-gray-400 mb-5" />

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {t.noHospitalDoctors}
            </h3>

            <Link
              to="/doctors"
              className="inline-block mt-4 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-medium transition"
            >
              {t.findDoctors}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
