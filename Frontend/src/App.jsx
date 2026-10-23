import Loading from "./components/Loading.jsx";
import AccountRecovery from "./pages/AccountRecovery.jsx";
import { api } from "./api";
import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import SignUp from "./pages/SignUp.jsx";
import VerifyPhone from "./pages/VerifyPhone.jsx";
import CheckEmail from "./pages/CheckEmail.jsx";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Specialties from "./components/Specialties.jsx";
import Hospitals from "./components/Hospitals.jsx";
import Doctors from "./components/Doctors.jsx";
import DoctorDetails from "./pages/DoctorDetails.jsx";
import HowItWorks from "./components/HowItWorks.jsx";
import Footer from "./components/Footer.jsx";
import ProviderRegistration from "./pages/ProviderRegistration.jsx";
import BookAppointment from "./pages/BookAppointment.jsx";
import MyAppointments from "./pages/MyAppointments.jsx";
import HospitalDetails from "./pages/hospitalDetails.jsx";
import HospitalDoctors from "./pages/HospitalDoctors.jsx";
import Login from "./pages/Login.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import SpecialtiesPage from "./pages/SpecialtiesPage.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ProviderDashboard from "./pages/ProviderDashboard.jsx";
import HospitalDashboard from "./pages/HospitalDashboard.jsx";

export default function App() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "Persian";
  });

  useEffect(() => {
    localStorage.setItem("language", language);

    document.documentElement.dir = language === "English" ? "ltr" : "rtl";

    document.documentElement.lang =
      language === "English" ? "en" : language === "Persian" ? "fa-AF" : "ps";
  }, [language]);

  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const update = (e) => setBusy(e.detail);
    window.addEventListener("ny-loading", update);
    return () => window.removeEventListener("ny-loading", update);
  }, []);

  useEffect(() => {
    const refreshUser = () => api("/auth/me")
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

      <Routes>
          <Route path="/forgot-password" element={<AccountRecovery language={language} mode="forgot" />} />
          <Route path="/reset-password" element={<AccountRecovery language={language} mode="reset" />} />
          <Route path="/verify-email" element={<AccountRecovery language={language} mode="verify" />} />
          <Route path="/verify-phone" element={<VerifyPhone />} />
          <Route path="/check-email" element={<CheckEmail language={language} />} />
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

        <Route path="/hospitals" element={<Hospitals language={language} user={user} />} />

        <Route path="/doctors" element={<Doctors language={language} user={user} />} />

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
          element={user ? <BookAppointment language={language} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/my-appointments"
          element={user ? <MyAppointments language={language} /> : <Navigate to="/login" replace />}
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
        <Route path="/login" element={<Login language={language} onLogin={setUser} />} />
        <Route path="/activate-provider" element={<AccountRecovery language={language} mode="activate" />} />
        <Route path="/signup" element={<SignUp language={language} onLogin={setUser} />} />
        <Route path="/admin" element={user?.role === "admin" ? <AdminDashboard language={language} /> : <Navigate to="/home" replace />} />
        <Route path="/provider-dashboard" element={user && ["provider","admin"].includes(user.role) ? (user.providerType === "hospital" || user.providerType === "clinic" ? <HospitalDashboard language={language} /> : <ProviderDashboard language={language} />) : <Navigate to="/home" replace />} />
        <Route path="/hospital-dashboard" element={user && ["provider","admin"].includes(user.role) && ["hospital","clinic"].includes(user.providerType) ? <HospitalDashboard language={language} /> : <Navigate to="/home" replace />} />
        <Route path="/about" element={<About language={language} />} />
        <Route path="/contact" element={<Contact language={language} />} />
        <Route
          path="/specialties"
          element={<SpecialtiesPage language={language} user={user} />}
        />
        <Route
  path="/profile"
  element={user ? <UserProfile language={language} user={user} setUser={setUser} /> : <Navigate to="/login" replace />}
/>
      </Routes>

      <Footer language={language} />
    </>
  );
}
