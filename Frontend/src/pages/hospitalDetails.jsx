import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  MapPin,
  Phone,
  Mail,
  Users,
  SearchX,
  Info,
} from "lucide-react";
import { api } from "../api";
import { useEffect, useState } from "react";
import { translations } from "../data/translations.js";
import { hospitalTypeLabel } from "../data/hospitalType.js";
import { doctorSpecialties } from "../data/doctorSpecialties.js";
import Loading from "../components/Loading.jsx";

export default function HospitalDetails({ language }) {
  const t = translations[language];
  const { id } = useParams();

  const [onlineHospital, setOnlineHospital] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  useEffect(() => {
    api(
      `/doctors?lang=${language === "Persian" ? "fa" : language === "Pashto" ? "ps" : "en"}`,
    )
      .then(setDoctors)
      .catch(() => setDoctors([]));
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
  useEffect(() => {
    api(
      `/hospitals/${id}/specialties?lang=${language === "Persian" ? "fa" : language === "Pashto" ? "ps" : "en"}`,
    )
      .then(setDepartments)
      .catch(() => setDepartments([]));
  }, [id, language]);
  const hospital = onlineHospital;
  const hospitalDoctors = doctors
    .filter(
      (doctor) =>
        (doctor.hospitalIds?.length > 0 &&
          doctor.hospitalIds.includes(Number(id))) ||
        (!doctor.hospitalIds?.length &&
          (doctor.hospital === hospital?.name ||
            doctor.hospital === hospital?.originalName)),
    )
    .slice(0, 3);
  const label = (value) => t[value] || value || "";
  const contactLabels = {
    Persian: { phone: "شماره تماس شفاخانه", email: "ایمیل شفاخانه" },
    Pashto: { phone: "د روغتون د اړیکې شمېره", email: "د روغتون برېښنالیک" },
    English: { phone: "Hospital Phone", email: "Hospital Email" },
  }[language];

  const BackIcon = language === "English" ? ArrowLeft : ArrowRight;

  if (hospitalLoading) return <Loading language={language} />;

  if (!hospital) {
    return (
      <section className="min-h-screen bg-gray-50 dark:bg-[#061b19] flex flex-col items-center justify-center px-5 text-center">
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
  const formatPhone = (phone) => {
    if (language === "English") return phone;

    const numbers = language === "Pashto" ? "۰۱۲۳۴۵۶۷۸۹" : "۰۱۲۳۴۵۶۷۸۹";

    return phone.replace(/[0-9]/g, (num) => numbers[Number(num)]);
  };

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-[#061b19] px-5 md:px-10 lg:px-20 py-12">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/hospitals"
          className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 font-medium mb-8 hover:text-teal-700 transition"
        >
          <BackIcon size={19} />
          {t.backToHospitals}
        </Link>

        <div className="bg-white dark:bg-[#102d29] rounded-2xl overflow-hidden border border-gray-100 dark:border-[#28534d] shadow-sm">
          <div className="relative">
            <img
              src={hospital.image}
              alt={label(hospital.name)}
              className="w-full h-64 md:h-96 object-cover"
            />

            <span className="absolute top-5 start-5 bg-white/95 dark:bg-[#102d29]/95 text-teal-700 dark:text-teal-400 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm">
              {hospitalTypeLabel(hospital.typeValue || hospital.type, t)}
            </span>
          </div>

          {hospital.logo && (
            <div className="flex justify-end px-6 md:px-9 -mt-14 md:-mt-16 relative z-10 h-14 md:h-16">
              <img
                src={hospital.logo}
                alt={`${label(hospital.name)} logo`}
                className="w-28 h-28 md:w-36 md:h-36 rounded-full object-contain bg-white border-4 border-white shadow-md"
              />
            </div>
          )}
          <div className="p-6 md:p-9">
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-sm font-medium mb-3">
              <Building2 size={18} />
              {t.healthcareCenters}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {label(hospital.name)}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
              <div className="bg-gray-50 dark:bg-[#173b35] rounded-xl p-5">
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
                  {hospitalTypeLabel(hospital.typeValue || hospital.type, t)}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-[#173b35] rounded-xl p-5">
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
                  {label(hospital.location)}
                </p>
              </div>
              {hospital.phone && (
                <div className="bg-gray-50 dark:bg-[#173b35] rounded-xl p-5">
                  <h3 className="flex items-center gap-3 font-semibold dark:text-white mb-3">
                    <Phone size={22} className="text-teal-600" />
                    {contactLabels.phone}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2" dir="ltr">
                    {hospital.phone.split("/").map((phone, index) => (
                      <span key={index} className="flex items-center gap-2">
                        {index > 0 && <span className="text-gray-400">/</span>}

                        <a
                          href={`tel:${phone.trim().replace(/\s/g, "")}`}
                          className="text-teal-700 dark:text-teal-300 hover:underline"
                        >
                          {formatPhone(phone.trim())}
                        </a>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {hospital.email && (
                <div className="bg-gray-50 dark:bg-[#173b35] rounded-xl p-5">
                  <h3 className="flex items-center gap-3 font-semibold dark:text-white mb-3">
                    <Mail size={22} className="text-teal-600" />
                    {contactLabels.email}
                  </h3>
                  <a
                    dir="ltr"
                    className="text-teal-700 dark:text-teal-300 break-all"
                    href={`mailto:${hospital.email}`}
                  >
                    {hospital.email}
                  </a>
                </div>
              )}
            </div>

            <div className="mt-8 border-t border-gray-100 dark:border-[#28534d] pt-8">
              <div className="flex items-center gap-3 mb-4">
                <Info size={23} className="text-teal-600 dark:text-teal-400" />

                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t.aboutHospital}
                </h2>
              </div>

              <p className="text-gray-600 dark:text-gray-300 leading-8 whitespace-pre-line text-justify">
                {label(hospital.description) || t.hospitalInformationPending}
              </p>
            </div>

            <div className="mt-8 border-t border-gray-100 dark:border-[#28534d] pt-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
                {t.hospitalServices}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((item) => (
                  <div
                    key={item.id}
                    className="group overflow-hidden rounded-2xl bg-white dark:bg-[#102d29] border border-gray-100 dark:border-[#28534d] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/25 to-transparent" />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        {label(item.name)}
                      </h3>
                      <Link
                        to={`/hospitals/${id}/doctors?specialty=${encodeURIComponent(item.value)}`}
                        className="flex items-center justify-center w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-xl font-medium transition-colors"
                      >
                        {t.viewDoctors}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 border-t border-gray-100 dark:border-[#28534d] pt-8">
              <div className="flex items-center gap-3 mb-6">
                <Users size={23} className="text-teal-600 dark:text-teal-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t.hospitalDoctors}
                </h2>
              </div>

              {hospitalDoctors.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {hospitalDoctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className="bg-white dark:bg-[#102d29] border border-teal-100 dark:border-[#28534d] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row items-stretch gap-4 p-4 min-h-[250px]">
                        <img
                          src={doctor.image}
                          alt={label(doctor.name)}
                          loading="lazy"
                          decoding="async"
                          width="200"
                          height="250"
                          className="w-full sm:w-44 h-100 sm:h-auto sm:min-h-[220px] object-cover object-top rounded-xl bg-gray-100 dark:bg-[#173b35] shrink-0"
                        />
                        <div className="flex flex-col flex-1 min-w-0 py-1">
                          <span className="self-start rounded-full bg-teal-100 dark:bg-[#173b35] text-teal-700 dark:text-teal-300 px-3 py-1 text-xs font-semibold leading-5">
                            {label(hospital.name)}
                          </span>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-3 mb-3">
                            {label(doctor.name)}
                          </h3>
                          <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            {doctorSpecialties(doctor, language).join(" · ")}
                          </p>
                          <p className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-3">
                            <MapPin size={15} />
                            {label(doctor.city)}
                          </p>
                          <div className="grid grid-cols-2 gap-3 mt-auto pt-5">
                            <Link
                              to={`/doctors/${doctor.id}`}
                              className="flex items-center justify-center text-center border border-teal-600 text-teal-600 dark:text-teal-300 text-sm font-medium py-3 px-2 rounded-xl hover:bg-teal-50 dark:hover:bg-[#173b35] transition"
                            >
                              {t.viewProfile}
                            </Link>
                            <Link
                              to={`/book-appointment/${doctor.id}`}
                              className="flex items-center justify-center text-center bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-3 px-2 rounded-xl transition"
                            >
                              {t.bookAppointment}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  {t.noHospitalDoctors}
                </p>
              )}
            </div>

            <div className="flex justify-center mt-10">
              <Link
                to={`/hospitals/${hospital.id}/doctors`}
                className="inline-flex min-w-72 items-center justify-center gap-3 bg-teal-600 hover:bg-teal-700 text-white px-9 py-4 rounded-xl font-semibold shadow-sm hover:shadow-md transition"
              >
                <Users size={20} />
                {language === "English"
                  ? "View All Hospital Doctors"
                  : language === "Pashto"
                    ? "د روغتون ټول ډاکټران وګورئ"
                    : "مشاهده تمام داکتران شفاخانه"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
