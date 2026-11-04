import Loading from "./components/Loading.jsx";
const AccountRecovery = lazy(() => import("./pages/AccountRecovery.jsx"));
import { api } from "./api";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
const SignUp = lazy(() => import("./pages/SignUp.jsx"));
const VerifyPhone = lazy(() => import("./pages/VerifyPhone.jsx"));
const CheckEmail = lazy(() => import("./pages/CheckEmail.jsx"));
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Specialties from "./components/Specialties.jsx";
import Hospitals from "./components/Hospitals.jsx";
import Doctors from "./components/Doctors.jsx";
const DoctorDetails = lazy(() => import("./pages/DoctorDetails.jsx"));
import HowItWorks from "./components/HowItWorks.jsx";
import Footer from "./components/Footer.jsx";
const ProviderRegistration = lazy(() => import("./pages/ProviderRegistration.jsx"));
const BookAppointment = lazy(() => import("./pages/BookAppointment.jsx"));
const MyAppointments = lazy(() => import("./pages/MyAppointments.jsx"));
const HospitalDetails = lazy(() => import("./pages/hospitalDetails.jsx"));
const HospitalDoctors = lazy(() => import("./pages/HospitalDoctors.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const SpecialtiesPage = lazy(() => import("./pages/SpecialtiesPage.jsx"));
const UserProfile = lazy(() => import("./pages/UserProfile.jsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));
const ProviderDashboard = lazy(() => import("./pages/ProviderDashboard.jsx"));
const HospitalDashboard = lazy(() => import("./pages/HospitalDashboard.jsx"));

export default function App() {
  const location = useLocation();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "Persian";
  });

  useEffect(() => {
    localStorage.setItem("language", language);

    document.documentElement.dir = language === "English" ? "ltr" : "rtl";

    document.documentElement.lang =
      language === "English" ? "en" : language === "Persian" ? "fa-AF" : "ps";
  }, [language]);


  // Update the page title and description when the route or language changes.
  useEffect(() => {
    const pages = {
      "/home": ["خانه", "کور", "Home"],
      "/hospitals": ["شفاخانه‌ها و کلینیک‌ها", "روغتونونه او کلینیکونه", "Hospitals and Clinics"],
      "/doctors": ["داکتران", "ډاکټران", "Doctors"],
      "/specialties": ["تخصص‌های طبی", "طبي تخصصونه", "Medical Specialties"],
      "/about": ["درباره ما", "زموږ په اړه", "About Us"],
      "/contact": ["تماس با ما", "اړیکه ونیسئ", "Contact Us"],
      "/login": ["ورود", "ننوتل", "Log In"],
      "/signup": ["ثبت‌نام", "نوم‌لیکنه", "Sign Up"],
      "/verify-phone": ["تأیید شماره تلفن", "د ټیلیفون تایید", "Verify Phone"],
      "/check-email": ["بررسی ایمیل", "برېښنالیک وګورئ", "Check Email"],
      "/verify-email": ["تأیید ایمیل", "د برېښنالیک تایید", "Verify Email"],
      "/forgot-password": ["فراموشی رمز عبور", "پټ نوم هېر شوی", "Forgot Password"],
      "/reset-password": ["تغییر رمز عبور", "د پټ نوم بدلول", "Reset Password"],
      "/register-provider": ["پیوستن به نوبت‌یار", "نوبت‌یار سره یوځای شئ", "Join NobatYar"],
      "/activate-provider": ["فعال‌سازی حساب", "حساب فعالول", "Activate Account"],
      "/my-appointments": ["نوبت‌های من", "زما نوبتونه", "My Appointments"],
      "/how-it-works": ["طرز کار نوبت‌یار", "نوبت‌یار څنګه کار کوي", "How It Works"],
      "/profile": ["پروفایل من", "زما پروفایل", "My Profile"],
      "/admin": ["پنل مدیریتی ادمین", "د اډمین مدیریت", "Admin Dashboard"],
      "/provider-dashboard": ["پنل داکتر", "د ډاکټر پنل", "Doctor Dashboard"],
      "/hospital-dashboard": ["پنل شفاخانه", "د روغتون پنل", "Hospital Dashboard"],
    };
    const langIndex = language === "English" ? 2 : language === "Pashto" ? 1 : 0;
    const path = location.pathname;
    let names = pages[path] || pages["/home"];
    if (path.startsWith("/hospitals/") && path.endsWith("/doctors")) names = ["داکتران شفاخانه", "د روغتون ډاکټران", "Hospital Doctors"];
    else if (path.startsWith("/hospitals/")) names = ["جزئیات شفاخانه", "د روغتون معلومات", "Hospital Details"];
    else if (path.startsWith("/doctors/")) names = ["پروفایل داکتر", "د ډاکټر پېژندنه", "Doctor Profile"];
    else if (path.startsWith("/book-appointment/")) names = ["گرفتن نوبت", "نوبت اخیستل", "Book Appointment"];
    const descriptions = {
      Persian: "نوبت‌یار؛ یک انتخاب هوشمند برای سلامتی شما! داکتران، شفاخانه‌ها و کلینیک‌های افغانستان را پیدا کنید و نوبت خود را آنلاین رزرو کنید.",
      Pashto: "نوبت‌یار؛ په افغانستان کې ډاکټران، روغتونونه او کلینیکونه ومومئ او خپله نوبت آنلاین واخلئ.",
      English: "NobatYar helps you find doctors, hospitals and clinics in Afghanistan and book medical appointments online.",
    };
    document.title = `${names[langIndex]} | ${language === "English" ? "NobatYar" : "نوبت‌یار"}`;
    document.querySelector('meta[name="description"]')?.setAttribute("content", descriptions[language]);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", document.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", descriptions[language]);
    // Private account pages should not appear in Google search results.
    const privatePage = ["/login", "/signup", "/profile", "/admin", "/my-appointments", "/provider-dashboard", "/hospital-dashboard", "/verify-phone", "/check-email", "/verify-email", "/forgot-password", "/reset-password", "/activate-provider"].includes(path) || path.startsWith("/book-appointment/");
    document.querySelector('meta[name="robots"]')?.setAttribute("content", privatePage ? "noindex, nofollow" : "index, follow");
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", `https://nobat-yar.vercel.app${path === "/" ? "/home" : path}`);
  }, [language, location.pathname]);

  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const update = (e) => setBusy(e.detail);
    window.addEventListener("ny-loading", update);
    return () => window.removeEventListener("ny-loading", update);
  }, []);

  useEffect(() => {
    const refreshUser = () =>
      api("/auth/me")
        .then((data) => setUser(data.user))
        .catch(() => setUser(null));
    window.addEventListener("focus", refreshUser);
    return () => window.removeEventListener("focus", refreshUser);
  }, []);

  useEffect(() => {
    api("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  const logout = async () => {
    try {
      await api("/auth/logout", { method: "POST" });
      setUser(null);
    } catch (error) {
      alert(error.message);
    }
  };

  if (checking) return <Loading language={language} />;

  return (
    <>
      {busy && <Loading language={language} />}
      <Header
        imageURL="/logo.png"
        title="NobatYar Logo"
        language={language}
        setLanguage={setLanguage}
        isLoggedIn={!!user}
        user={user}
        onLogout={logout}
      />

      <Suspense fallback={<Loading language={language} />}>
      <Routes>
        <Route
          path="/forgot-password"
          element={<AccountRecovery language={language} mode="forgot" />}
        />
        <Route
          path="/reset-password"
          element={<AccountRecovery language={language} mode="reset" />}
        />
        <Route
          path="/verify-email"
          element={<AccountRecovery language={language} mode="verify" />}
        />
        <Route path="/verify-phone" element={<VerifyPhone />} />
        <Route
          path="/check-email"
          element={<CheckEmail language={language} />}
        />
        <Route path="/" element={<Navigate to="/home" replace />} />

        <Route
          path="/home"
          element={
            <>
              <Hero language={language} />
              <Specialties language={language} />
              <Hospitals language={language} home={true} user={user} />
              <Doctors language={language} home={true} user={user} />
              <HowItWorks language={language} home={true} />
            </>
          }
        />

        <Route
          path="/hospitals"
          element={<Hospitals language={language} user={user} />}
        />

        <Route
          path="/doctors"
          element={<Doctors language={language} user={user} />}
        />

        <Route
          path="/doctors/:id"
          element={<DoctorDetails language={language} />}
        />

        <Route
          path="/register-provider"
          element={<ProviderRegistration language={language} user={user} />}
        />
        <Route
          path="/book-appointment/:id"
          element={
            user ? (
              <BookAppointment language={language} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/my-appointments"
          element={
            user ? (
              <MyAppointments language={language} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/hospitals/:id"
          element={<HospitalDetails language={language} />}
        />

        <Route
          path="/hospitals/:id/doctors"
          element={<HospitalDoctors language={language} />}
        />
        <Route
          path="/how-it-works"
          element={<HowItWorks language={language} />}
        />
        <Route
          path="/login"
          element={<Login language={language} onLogin={setUser} />}
        />
        <Route
          path="/activate-provider"
          element={<AccountRecovery language={language} mode="activate" />}
        />
        <Route
          path="/signup"
          element={<SignUp language={language} onLogin={setUser} />}
        />
        <Route
          path="/admin"
          element={
            user?.role === "admin" ? (
              <AdminDashboard language={language} />
            ) : (
              <Navigate to="/home" replace />
            )
          }
        />
        <Route
          path="/provider-dashboard"
          element={
            user && ["provider", "admin"].includes(user.role) ? (
              user.providerType === "hospital" ||
              user.providerType === "clinic" ? (
                <HospitalDashboard language={language} />
              ) : (
                <ProviderDashboard language={language} />
              )
            ) : (
              <Navigate to="/home" replace />
            )
          }
        />
        <Route
          path="/hospital-dashboard"
          element={
            user &&
            ["provider", "admin"].includes(user.role) &&
            ["hospital", "clinic"].includes(user.providerType) ? (
              <HospitalDashboard language={language} />
            ) : (
              <Navigate to="/home" replace />
            )
          }
        />
        <Route path="/about" element={<About language={language} />} />
        <Route path="/contact" element={<Contact language={language} />} />
        <Route
          path="/specialties"
          element={<SpecialtiesPage language={language} user={user} />}
        />
        <Route
          path="/profile"
          element={
            user ? (
              <UserProfile language={language} user={user} setUser={setUser} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
      </Suspense>

      <Footer language={language} />
    </>
  );
}
