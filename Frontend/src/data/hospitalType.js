export function hospitalTypeLabel(value, t) {
  const key = String(value || "").toLowerCase();
  if (["private", "private_hospital", "privatehospital"].includes(key)) return t.privateHospital;
  if (["government", "governmental", "government_hospital", "governmenthospital", "govermentalhospital"].includes(key)) return t.governmentHospital;
  if (["clinic", "clinics"].includes(key)) return t.clinic || t.clinics;
  return value || "";
}
