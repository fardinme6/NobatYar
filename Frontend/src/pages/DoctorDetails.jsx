import { useEffect, useState } from "react";
import { api } from "../api";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Hospital,
  MapPin,
  Stethoscope,
  CalendarDays,
  Clock,
  GraduationCap,
  BriefcaseMedical,
} from "lucide-react";
import { translations } from "../data/translations";
import { doctors } from "../data/doctorsData";

export default function DoctorDetails({ language }) {
  const t = translations[language];
  const { id } = useParams();

  const [onlineDoctor, setOnlineDoctor] = useState(null);
  useEffect(() => { api(`/doctors/${id}`).then(setOnlineDoctor).catch(()=>{}); }, [id]);
  const doctor = onlineDoctor || doctors.find((item) => item.id === Number(id));
  const label = value => t[value] || value || "";

  if (!doctor) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 bg-gray-50 dark:bg-slate-900">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t.noDoctorsFound}
        </h1>

        <Link
          to="/doctors"
          className="bg-teal-600 text-white px-6 py-3 rounded-xl"
        >
          {t.doctors}
        </Link>
      </div>
    );
  }

  const BackIcon = language === "English" ? ArrowLeft : ArrowRight;

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-slate-900 px-5 md:px-12 lg:px-20 py-12">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/doctors"
          className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 font-medium mb-8 hover:underline"
        >
          <BackIcon size={19} />
          {t.backToDoctors}
        </Link>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="flex flex-col md:flex-row gap-8 p-6 md:p-9">
            <div className="w-full md:w-72 shrink-0 bg-gray-100 dark:bg-slate-700 rounded-2xl overflow-hidden">
              <img
                src={doctor.image}
                alt={label(doctor.name)}
                className="w-full h-90 object-cover object-top"
              />
            </div>

            <div className="flex-1">
              <span className="inline-block bg-teal-50 dark:bg-slate-700 text-teal-700 dark:text-teal-400 px-4 py-2 rounded-full text-sm font-semibold">
                {label(doctor.specialty)}
              </span>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-5">
                {label(doctor.name)}
              </h1>

              <div className="space-y-4 mt-7 text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-3">
                  <Hospital size={20} className="text-teal-600 shrink-0" />
                  <span>{label(doctor.hospital)}</span>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin size={20} className="text-teal-600 shrink-0" />
                  <span>{label(doctor.city)}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Stethoscope size={20} className="text-teal-600 shrink-0" />
                  <span>{label(doctor.specialty)}</span>
                </div>
              </div>

              <Link
                to={`/book-appointment/${doctor.id}`}
                className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-xl mt-8 font-semibold transition"
              >
                <CalendarDays size={20} />
                {t.bookAppointment}
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-7 border border-gray-100 dark:border-slate-700 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {t.aboutDoctor}
              </h2>

              <p className="text-gray-600 dark:text-gray-300 leading-8">
                {doctor.about || t.doctorInformationPending}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-7 border border-gray-100 dark:border-slate-700 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {t.professionalInformation}
              </h2>

              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <GraduationCap size={23} className="text-teal-600 shrink-0" />

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t.education}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {doctor.education || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <BriefcaseMedical
                    size={23}
                    className="text-teal-600 shrink-0"
                  />

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t.experience}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {doctor.experience || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-7 border border-gray-100 dark:border-slate-700 shadow-sm h-fit">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
              {t.workingHours}
            </h2>

            <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300 mb-6">
              <Clock size={21} className="text-teal-600 shrink-0" />
              <p>{t.scheduleNotAvailable}</p>
            </div>

            <Link
              to={`/book-appointment/${doctor.id}`}
              className="flex items-center justify-center gap-2 w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-semibold transition"
            >
              <CalendarDays size={19} />
              {t.bookAppointment}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
