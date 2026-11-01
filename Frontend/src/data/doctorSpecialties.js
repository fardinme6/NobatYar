// Titles come from the approved specialty translations returned by the API.
export function doctorSpecialties(doctor, language) {
  const names = doctor.specialtyNames || [];
  const fallback = doctor.specialty || doctor.specialtyValue || "";
  const list = names.length ? names : [fallback];
  return [...new Set(list.filter(Boolean))].map((name) => {
    if (language === "English") return `Specialist in ${name}`;
    if (language === "Pashto") return `د ${name} متخصص`;
    return `متخصص ${name}`;
  });
}

export function normalizePhone(value) {
  return String(value || "")
    .replace(/[۰-۹]/g, digit => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, digit => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

export function displayPhone(value, language) {
  const phone = normalizePhone(value);
  if (language === "English") return phone;
  const digits = language === "Pashto" ? "٠١٢٣٤٥٦٧٨٩" : "۰۱۲۳۴۵۶۷۸۹";
  return phone.replace(/[0-9]/g, digit => digits[Number(digit)]);
}
