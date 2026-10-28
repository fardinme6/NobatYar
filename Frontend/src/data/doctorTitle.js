// عنوان داکتر را از نام رشته طبی جدا نمایش می‌دهد.
// مقدار اصلی تخصص در دیتابیس تغییر نمی‌کند.
const doctorTitleKeys = {
  cardiology: "cardiologist",
  neurology: "neurologist",
  pediatrics: "pediatrician",
  ophthalmology: "ophthalmologist",
  dermatology: "dermatologist",
  dentistry: "dentistrist",
  orthopedics: "orthopedist",
  gastroenterology: "gastroenterologist",
  gynecology: "gynecologist",
  ent: "entSpecialist",
  urology: "urologist",
  pulmonology: "pulmonologist",
  nephrology: "nephrologist",
  endocrinology: "endocrinologist",
  generalSurgery: "generalSurgeon",
  psychiatry: "psychiatrist",
  oncology: "oncologist",
  hematology: "hematologist",
  rheumatology: "rheumatologist",
};

export function doctorTitle(specialty, t) {
  const key = doctorTitleKeys[specialty];
  return (key && t[key]) || t[specialty] || specialty || "";
}
