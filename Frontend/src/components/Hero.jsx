import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Stethoscope, Hospital } from "lucide-react";
import { translations } from "../data/translations";

export default function Hero({ language }) {
  const images = ["/doctor.jpg", "/doctor1.jpg", "/doctor2.jpg"];

  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  const t = translations[language];

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);

      setTimeout(() => {
        setCurrent((current) => (current === 2 ? 0 : current + 1));
        setFade(true);
      }, 300);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-teal-50 dark:bg-slate-900 px-6 py-12 md:px-12 lg:px-20 transition-colors duration-300">
      <div className="flex flex-col-reverse lg:flex-row items-center gap-10">
        <div
          className={`w-full lg:w-1/2 text-center ${language === "English" ? "lg:text-left" : "lg:text-right"}`}
        >
          <span className="inline-block bg-teal-600 text-white text-sm font-bold px-5 py-2 rounded-full shadow-md">
            {t.motto}
          </span>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mt-6">
            {t.heroTitle}
            <span className="block text-teal-600 dark:text-teal-400">
              {t.heroHighlight}
            </span>
          </h1>

          <p className="text-gray-600 dark:text-gray-300 text-lg mt-5 mb-8">
            {t.heroDescription}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/doctors"
              className="flex items-center justify-center gap-3 bg-teal-600 text-white px-7 py-4 rounded-xl hover:bg-teal-700 transition"
            >
              <Stethoscope size={22} />
              {t.findDoctor}
            </Link>

            <Link
              to="/hospitals"
              className="flex items-center justify-center gap-3 bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 border border-teal-600 px-7 py-4 rounded-xl hover:bg-teal-50 dark:hover:bg-slate-700 transition"
            >
              <Hospital size={22} />
              {t.findHospitals}
            </Link>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col items-center">
          <img
            src={images[current]}
            alt="Doctor"
            className={`w-full max-w-lg h-[610px] object-cover rounded-3xl transition-opacity duration-500 ${
              fade ? "opacity-100" : "opacity-0"
            }`}
          />

          <div className="flex gap-2 mt-4">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-3 h-3 rounded-full cursor-pointer ${
                  current === index
                    ? "bg-teal-600"
                    : "bg-gray-300 dark:bg-slate-600"
                }`}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
