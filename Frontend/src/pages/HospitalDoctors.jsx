import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Stethoscope,
  CalendarDays,
  UserRound,
  SearchX,
} from "lucide-react";
import { api } from "../api";
import { useEffect, useState } from "react";
import { translations } from "../data/translations.js";
import { doctorSpecialties } from "../data/doctorSpecialties.js";
import Loading from "../components/Loading.jsx";

export default function HospitalDoctors({ language }) {
  const t = translations[language];
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const selectedSpecialty = searchParams.get("specialty");

  const [onlineHospital, setOnlineHospital] = useState(null);
  const [onlineDoctors, setOnlineDoctors] = useState([]);
  useEffect(() => {
    api(
      `/doctors?lang=${language === "Persian" ? "fa" : language === "Pashto" ? "ps" : "en"}`,
    )
      .then(setOnlineDoctors)
      .catch(() => setOnlineDoctors([]));
  }, [language]);
  const [hospitalLoading, setHospitalLoading] = useState(true);
  useEffect(() => {
    setHospitalLoading(true);
    api(
      `/hospitals/${id}?lang=${language === "Persian" ? "fa" : language === "Pashto" ? "ps" : "en"}`,
    )
      .then(setOnlineHospital)
      .catch(() => setOnlineHospital(null))
      .finally(() => setHospitalLoading(false));
  }, [id, language]);
  const hospital = onlineHospital;
  const label = (value) => t[value] || value || "";
  const contactLabels = {
    Persian: { phone: "شماره تماس شفاخانه", email: "ایمیل شفاخانه" },
    Pashto: { phone: "د روغتون د اړیکې شمېره", email: "د روغتون برېښنالیک" },
    English: { phone: "Hospital Phone", email: "Hospital Email" },
  }[language];
  const formatPhone = (phone) => {
    if (language === "English") return phone;

    const numbers = language === "Pashto" ? "۰۱۲۳۴۵۶۷۸۹" : "۰۱۲۳۴۵۶۷۸۹";

    return phone.replace(/[0-9]/g, (num) => numbers[Number(num)]);
  };

  const BackIcon = language === "English" ? ArrowLeft : ArrowRight;

  if (hospitalLoading) return <Loading language={language} />;

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
    (doctor) =>
      ((doctor.hospitalIds?.length > 0 &&
        doctor.hospitalIds.includes(Number(hospital.id))) ||
        (!doctor.hospitalIds?.length &&
          (doctor.hospital === hospital.name ||
            doctor.hospital === hospital.originalName))) &&
      (!selectedSpecialty ||
        (doctor.specialtyValues || [doctor.specialtyValue]).includes(
          selectedSpecialty,
        )),
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
                {label(hospital.location)}
              </p>
              {hospital.phone && (
                <div className="flex flex-wrap items-center gap-2 mt-3 text-sm text-gray-600 dark:text-gray-300">
                  <Phone size={17} className="text-teal-600" />
                  <span>{contactLabels.phone}:</span>

                  <div className="flex flex-wrap items-center gap-2" dir="ltr">
                    {hospital.phone.split("/").map((phone, index) => (
                      <span key={index} className="flex items-center gap-2">
                        {index > 0 && <span className="text-gray-400">/</span>}

                        <a
                          href={`tel:${phone.trim().replace(/\s/g, "")}`}
                          className="text-teal-600 hover:underline"
                        >
                          {formatPhone(phone.trim())}
                        </a>
                      </span>
                    ))}
                  </div>
                </div>
              )}{" "}
              {hospital.email && (
                <p className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-300">
                  <Mail size={17} className="text-teal-600" />
                  {contactLabels.email}:{" "}
                  <a
                    dir="ltr"
                    href={`mailto:${hospital.email}`}
                    className="text-teal-600 hover:underline break-all"
                  >
                    {hospital.email}
                  </a>
                </p>
              )}
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
                <div className="relative overflow-hidden">
                  <span className="absolute top-4 start-4 z-10 bg-white/95 dark:bg-slate-800/95 text-teal-700 dark:text-teal-400 px-3 py-1.5 rounded-lg text-xs font-semibold"><MapPin size={14} className="inline me-1" />{label(doctor.city)}</span>
                  <img
                    src={doctor.image}
                    alt={label(doctor.name)}
                    className="w-full h-100 object-cover object-top hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="flex flex-col flex-1 p-6">
                  <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-sm mb-3">
                    <UserRound size={17} />
                    {doctorSpecialties(doctor, language).join(" · ")}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {label(doctor.name)}
                  </h3>

                  <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm mb-6">
                    {doctorSpecialties(doctor, language).join(" · ")}
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
