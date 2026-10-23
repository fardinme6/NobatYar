import "./Loading.css";

export default function Loading({ language = "Persian" }) {
  const label = language === "English" ? "Please wait..." : language === "Pashto" ? "مهرباني وکړئ انتظار وکړئ..." : "لطفاً منتظر بمانید...";
  return (
    <div className="ny-loading" role="status" aria-live="polite" aria-label={label}>
      <div className="ny-loading-ring">
        <img src="/nobatyar-loading-logo.png" alt="NobatYar" />
      </div>
      <strong>{language === "English" ? "NobatYar" : language === "Pashto" ? "نوبت یار" : "نوبت یار"}</strong>
      <p>{label}</p>
    </div>
  );
}
