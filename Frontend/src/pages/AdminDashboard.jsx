import { useEffect, useState } from "react";
import MultiDatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import gregorian from "react-date-object/calendars/gregorian";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian_en from "react-date-object/locales/gregorian_en";

const DatePicker = MultiDatePicker.default || MultiDatePicker;
const cityNames = [
  ["herat", "هرات", "هرات", "Herat"],
  ["kabul", "کابل", "کابل", "Kabul"],
  ["mazar", "مزارشریف", "مزار شریف", "Mazar-e-Sharif", "مزار شریف", "Mazar i Sharif", "Mazar Sharif"],
];
const normalizeCity = value => String(value || "").trim().toLowerCase().replace(/[يى]/g, "ی").replace(/ك/g, "ک").replace(/[\s\u200c\u200d-]/g, "");
const cityKey = value => cityNames.find(row => row.some(name => normalizeCity(name) === normalizeCity(value)))?.[0] || normalizeCity(value);
const cityLabel = (value, language) => cityNames.find(row => row[0] === cityKey(value))?.[language === "English" ? 3 : language === "Pashto" ? 2 : 1] || value;

import { api, API_URL } from "../api";
import { translations } from "../data/translations";
import { doctorTitle } from "../data/doctorTitle";
import Loading from "../components/Loading.jsx";
import {
  ShieldCheck,
  Mail,
  Users,
  ClipboardCheck,
  BarChart3,
  CalendarCheck,
  RefreshCw,
  Building2,
  Stethoscope,
  Tags,
  Pencil,
  Trash2,
  Save,
  X,
} from "lucide-react";

export default function AdminDashboard({ language }) {
  const t = translations[language];
  const months = (language === "English" ? ["Hamal", "Sawr", "Jawza", "Saratan", "Asad", "Sunbula", "Mizan", "Aqrab", "Qaws", "Jadi", "Dalw", "Hut"] : language === "Pashto" ? ["وری", "غویی", "غبرګولی", "چنګاښ", "زمری", "وږی", "تله", "لړم", "لیندۍ", "مرغومی", "سلواغه", "کب"] : ["حمل", "ثور", "جوزا", "سرطان", "اسد", "سنبله", "میزان", "عقرب", "قوس", "جدی", "دلو", "حوت"]).map(name => [name, name]);
  const afghanCalendar = { ...persian, months };
  const afghanLocale = { ...(language === "English" ? gregorian_en : persian_fa), months, digits: gregorian_en.digits, ...(language === "Pashto" ? { weekDays: [["شنبه", "ش"], ["یکشنبه", "ی"], ["دوشنبه", "د"], ["سه شنبه", "س"], ["چهارشنبه", "چ"], ["پنجشنبه", "پ"], ["جمعه", "ج"]] } : {}) };
  const dateKey = value => String(value || "").slice(0, 10).replaceAll("/", "-");
  const solarDate = value => {
    if (!value) return "";
    const date = dateKey(value);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return String(value);
    if (Number(date.slice(0, 4)) < 1700) return date.replaceAll("-", "/");
    return new DateObject({ date, format: "YYYY-MM-DD", calendar: gregorian, locale: gregorian_en }).convert(persian).format("YYYY/MM/DD");
  };
  const requestLabels = {
    city: t.cityLabel, logoUrl: language === "English" ? "Logo URL" : language === "Pashto" ? "د لوګو لینک" : "لینک لوگو",
    hospitalIds: language === "English" ? "Hospital IDs" : language === "Pashto" ? "د روغتونونو پېژندشمېرې" : "شناسه‌های شفاخانه‌ها",
    hospitalId: language === "English" ? "Hospital ID" : language === "Pashto" ? "د روغتون پېژندشمېره" : "شناسه شفاخانه",
    specialtyValues: language === "English" ? "Medical specialties" : language === "Pashto" ? "طبي تخصصونه" : "تخصص‌های طبی",
    specialty: t.medicalSpecialty, license: t.licenseNumber,
    hospitalType: language === "English" ? "Hospital / clinic type" : language === "Pashto" ? "د روغتون / کلینیک ډول" : "نوع شفاخانه / کلینیک",
    address: t.fullAddress, information: language === "English" ? "About doctor / hospital / clinic" : language === "Pashto" ? "د ډاکټر / روغتون / کلینیک په اړه" : "درباره داکتر / شفاخانه / کلینیک",
  };
  const modalText =
    {
      English: {
        enterSource:
          "Enter the fields to translate in the selected source language.",
        name: "Name",
        about: "About doctor",
        education: "Education",
        experience: "Work experience",
        description: "About hospital / clinic",
        services: "Medical services",
        location: "Full address",
        source: "Source language",
        generate: "Generate with AI",
        generating: "Generating...",
        draft: "Save draft",
        approve: "Approve & Publish",
        note: "AI translations are drafts. Review all information before publishing.",
        translate: "Translate",
        department: "Specialty department",
        success: "Translations approved and published.",
        saved: "Translation draft saved.",
      },
      Persian: {
        enterSource:
          "بخش‌هایی را که می‌خواهید ترجمه شوند در ستون زبان اصلی وارد کنید.",
        name: "نام",
        about: "درباره داکتر",
        education: "تحصیلات",
        experience: "تجربه کاری",
        description: "درباره شفاخانه / کلینیک",
        services: "خدمات طبی",
        location: "آدرس مکمل",
        source: "زبان اصلی",
        generate: "ترجمه با هوش مصنوعی",
        generating: "در حال ترجمه...",
        draft: "ذخیره پیش‌نویس",
        approve: "تأیید و نشر",
        note: "ترجمه‌های هوش مصنوعی پیش‌نویس هستند. پیش از نشر، معلومات را بررسی کنید.",
        translate: "ترجمه",
        department: "بخش تخصص",
        success: "ترجمه‌ها تأیید و نشر شدند.",
        saved: "پیش‌نویس ترجمه ذخیره شد.",
      },
      Pashto: {
        enterSource: "هغه برخې چې ژباړل غواړئ د اصلي ژبې په ستون کې ولیکئ.",
        name: "نوم",
        about: "د ډاکټر په اړه",
        education: "زده کړې",
        experience: "کاري تجربه",
        description: "د روغتون / کلینیک په اړه",
        services: "روغتیايي خدمتونه",
        location: "بشپړه پته",
        source: "اصلي ژبه",
        generate: "د مصنوعي ځیرکتیا له لارې ژباړه",
        generating: "ژباړل کېږي...",
        draft: "مسوده خوندي کړئ",
        approve: "تایید او خپرول",
        note: "د مصنوعي ځیرکتیا ژباړې مسودې دي. تر خپرولو مخکې معلومات وګورئ.",
        translate: "ژباړه",
        department: "د تخصص څانګه",
        success: "ژباړې تایید او خپرې شوې.",
        saved: "د ژباړې مسوده خوندي شوه.",
      },
    }[language] || {};

  const [tab, setTab] = useState(
    new URLSearchParams(window.location.search).get("tab") || "requests",
  );
  const [requestOpen, setRequestOpen] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [requests, setRequests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [city, setCity] = useState("");
  const [hospital, setHospital] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [report, setReport] = useState(null);
  const [days, setDays] = useState(30);
  const [patientBusy, setPatientBusy] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [specialtiesList, setSpecialtiesList] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [catalogFileName, setCatalogFileName] = useState("");
  const [logoFileName, setLogoFileName] = useState("");
  const [notes, setNotes] = useState({});
  const [replies, setReplies] = useState({});
  const [openReplyId, setOpenReplyId] = useState(null);
  const [contactBusyId, setContactBusyId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);
  const [catalogAccounts, setCatalogAccounts] = useState({
    doctors: [],
    hospitals: [],
  });
  const [assigning, setAssigning] = useState(null);
  const [assignEmail, setAssignEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [translationEditor, setTranslationEditor] = useState(null);
  const [translationChanged, setTranslationChanged] = useState([]);
  const translationErrors = {
    "The AI did not return valid JSON. Please try again or enter translations manually.":
      {
        Persian:
          "هوش مصنوعی پاسخ معتبر نداد. دوباره تلاش کنید یا ترجمه‌ها را دستی وارد کنید.",
        Pashto:
          "مصنوعي ځیرکتیا سم ځواب ورنه کړ. بیا هڅه وکړئ یا ژباړې په لاس ولیکئ.",
        English:
          "The AI did not return valid JSON. Please try again or enter translations manually.",
      },
    "Fill translations for all non-empty fields before approving.": {
      Persian:
        "لطفاً ترجمه بخش‌های جدید یا ویرایش‌شده را در هر سه زبان تکمیل کنید.",
      Pashto:
        "مهرباني وکړئ د نویو یا بدل شوو برخو ژباړې په درې واړو ژبو بشپړې کړئ.",
      English:
        "Complete translations of new or edited fields in all three languages.",
    },
  };
  // Translate known messages returned by the backend without changing the API.
  const adminServerMessages = {
    "Account assigned. Activation email sent.": t.adminAccountAssignedMessage,
    "Activation email sent": t.adminActivationSentMessage,
    "Activation email sent successfully.": t.adminActivationSentMessage,
    "Verification link sent to the new email. The old email stays active until confirmation.": t.adminEmailChangeSentMessage,
    "Account linked, but email failed. Go to Manage Providers and resend activation.": t.adminAccountLinkedEmailFailed,
    "Verification email could not be sent. The original email remains active.": t.adminEmailDeliveryFailed,
    "Provider not found": t.adminProviderNotFound,
    "This email is already in use": t.adminEmailInUse,
    "This is already the current email": t.adminCurrentEmail,
  };
  const translateError = (message) => {
    if (message === "Something went wrong") {
      return {
        Persian: "هنگام ارتباط با سرور مشکلی رخ داد. دوباره تلاش کنید.",
        Pashto: "له سرور سره د اړیکې پر مهال ستونزه رامنځته شوه. بیا هڅه وکړئ.",
        English: "Something went wrong. Please try again.",
      }[language];
    }
    return adminServerMessages[message] || translationErrors[message]?.[language] || message;
  };

  // Keep message codes instead of translated text, so switching language updates alerts.
  const displayMessage = (message) => {
    if (!message) return "";
    if (t[message]) return t[message];
    if (message === "translationPublished") return modalText.success;
    if (message === "translationDraftSaved") return modalText.saved;
    return translateError(message);
  };

  const [translationBusy, setTranslationBusy] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState("fa");
  const openTranslation = async (kind, item) => {
    try {
      const result = await api(
        `/admin/profile-translations/${kind}/${item.id}`,
      );
      setTranslationEditor({
        kind,
        id: item.id,
        name: item.name,
        translations: { fa: {}, ps: {}, en: {} },
        approved: result.approved,
        sourceSnapshot: result.source_snapshot || {},
      });
      setTranslationChanged([]);
      setSourceLanguage("fa");
      setError("");
    } catch (e) {
      setError(e.message);
    }
  };
  const generateTranslation = async () => {
    setError("");
    const sourceFields = translationEditor.translations?.[sourceLanguage] || {};
    const fields = Object.keys(sourceFields).filter((field) =>
      String(sourceFields[field] || "").trim(),
    );
    if (!fields.length) {
      setError(modalText.enterSource);
      return;
    }
    setTranslationBusy(true);
    try {
      const result = await api("/admin/profile-translations/suggest", {
        method: "POST",
        body: JSON.stringify({
          kind: translationEditor.kind,
          id: translationEditor.id,
          sourceLanguage,
          sourceFields,
          fields,
        }),
      });
      setTranslationEditor((prev) => ({
        ...prev,
        translations: Object.fromEntries(
          ["fa", "ps", "en"].map((lang) => [
            lang,
            {
              ...prev.translations?.[lang],
              ...Object.fromEntries(
                fields.map((field) => [
                  field,
                  lang === sourceLanguage
                    ? sourceFields[field]
                    : result.translations?.[lang]?.[field] ||
                      prev.translations?.[lang]?.[field] ||
                      "",
                ]),
              ),
            },
          ]),
        ),
      }));
      setTranslationChanged((prev) => [...new Set([...prev, ...fields])]);
    } catch (e) {
      setError(e.message);
    } finally {
      setTranslationBusy(false);
    }
  };
  const saveTranslation = async (approved) => {
    setTranslationBusy(true);
    try {
      await api(
        `/admin/profile-translations/${translationEditor.kind}/${translationEditor.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            translations: translationEditor.translations,
            approved,
            changedFields: [
              ...new Set([
                ...translationChanged,
                ...["fa", "ps", "en"].flatMap((lang) =>
                  Object.keys(
                    translationEditor.translations?.[lang] || {},
                  ).filter((field) =>
                    String(
                      translationEditor.translations?.[lang]?.[field] || "",
                    ).trim(),
                  ),
                ),
              ]),
            ],
          }),
        },
      );
      setTranslationEditor(null);
      setEmailMessage(approved ? "translationPublished" : "translationDraftSaved");
    } catch (e) {
      setError(e.message);
    } finally {
      setTranslationBusy(false);
    }
  };
  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const [r, patientsData, c, p, d, h, sp, stats, ap] = await Promise.all([
        api("/admin/provider-requests?all=1"),
        api("/admin/patients"),
        api("/admin/contacts?all=1"),
        api(`/admin/providers?lang=${language === "English" ? "en" : language === "Pashto" ? "ps" : "fa"}`),
        api("/admin/doctors"),
        api("/admin/hospitals"),
        api(
          `/specialties?lang=${language === "English" ? "en" : language === "Pashto" ? "ps" : "fa"}`,
        ),
        api("/admin/statistics"),
        api("/admin/appointments"),
      ]);
      setReport(stats);
      setAppointments(ap);
      setRequests(r);
      setPatients(patientsData);
      setContacts(c);
      setProviders(p);
      setDoctors(d);
      setHospitals(h);
      setSpecialtiesList(sp);
      const accounts = await api("/admin/catalog-accounts");
      setCatalogAccounts(accounts);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [language]);
  const decide = async (r, status) => {
    const note = notes[r.id] || "";
    if (status === "rejected" && !note.trim()) {
      setError(t.adminReasonRequired);
      return;
    }
    try {
      await api(`/admin/provider-requests/${r.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, note }),
      });
      setRequestOpen(null);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };
  const changeProviderEmail = async (p) => {
    const newEmail = window.prompt(`${t.adminChangeEmailPrompt} ${p.name}:`, p.email || "");
    if (
      !newEmail ||
      newEmail.trim().toLowerCase() === (p.email || "").toLowerCase()
    )
      return;
    if (
      !window.confirm(
        `${t.adminChangeEmailConfirmStart} ${newEmail.trim()}${t.adminChangeEmailConfirmEnd}`,
      )
    )
      return;
    try {
      const result = await api(`/admin/providers/${p.id}/change-email`, {
        method: "POST",
        body: JSON.stringify({ email: newEmail.trim() }),
      });
      setEmailMessage(result.message);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  };
  const assignAccount = async () => {
    setError("");
    setEmailMessage("");
    if (!assigning || !assignEmail.trim()) return;
    setSendingId(assigning.id);
    try {
      const result = await api("/admin/assign-account", {
        method: "POST",
        body: JSON.stringify({
          type: assigning.type,
          id: assigning.id,
          email: assignEmail.trim(),
        }),
      });
      setAssigning(null);
      setAssignEmail("");
      await load();
      setEmailMessage(result.message);
    } catch (e) {
      setError(e.message);
      await load();
    } finally {
      setSendingId(null);
    }
  };
  const resendActivation = async (id) => {
    setError("");
    setEmailMessage("");
    setSendingId(id);
    try {
      await api(`/admin/providers/${id}/resend-activation`, { method: "POST" });
      setEmailMessage("adminActivationSentMessage");
    } catch (e) {
      setError(e.message);
    } finally {
      setSendingId(null);
    }
  };
  useEffect(() => {
    const editId = Number(
      new URLSearchParams(window.location.search).get("edit"),
    );
    if (!editId || loading || editing) return;
    const kind =
      tab === "doctors"
        ? "doctor"
        : tab === "hospitals"
          ? "hospital"
          : tab === "specialties"
            ? "specialty"
            : "";
    const item = (
      kind === "doctor"
        ? doctors
        : kind === "hospital"
          ? hospitals
          : specialtiesList
    ).find((x) => x.id === editId);
    if (item && kind) startEdit(kind, item);
  }, [loading, tab, doctors, hospitals, specialtiesList]);
  const patientLabels = {
    Persian: { title:"مدیریت مریضان", search:"جستجو با نام، ایمیل یا شماره تماس", verify:"تأیید حساب", verified:"تأیید شده", pending:"تأیید نشده", delete:"حذف دائمی", disable:"غیرفعال‌سازی", enable:"فعال‌سازی", active:"فعال", inactive:"غیرفعال", status:"وضعیت حساب", details:"مشخصات مریض", name:"نام مکمل", email:"ایمیل", phone:"شماره تماس", city:"شهر", address:"آدرس", bio:"درباره", birth:"تاریخ تولد", registered:"تاریخ ثبت‌نام", history:"تعداد نوبت‌ها", noHistory:"این حساب سابقه نوبت ندارد. آیا برای همیشه حذف شود؟", hasHistory:"این مریض {count} نوبت ثبت‌شده دارد. با حذف حساب، تمام سوابق نوبت‌ها نیز برای همیشه حذف می‌شوند. ادامه می‌دهید؟", empty:"مریضی یافت نشد", unknown:"ثبت نشده" },
    Pashto: { title:"د ناروغانو مدیریت", search:"په نوم، برېښنالیک یا شمېره لټون", verify:"حساب تایید کړئ", verified:"تایید شوی", pending:"نه دی تایید شوی", delete:"د تل لپاره ړنګول", disable:"غیرفعالول", enable:"فعالول", active:"فعال", inactive:"غیرفعال", status:"د حساب حالت", details:"د ناروغ معلومات", name:"بشپړ نوم", email:"برېښنالیک", phone:"د اړیکې شمېره", city:"ښار", address:"پته", bio:"په اړه", birth:"د زېږېدو نېټه", registered:"د نوملیکنې نېټه", history:"د نوبتونو شمېر", noHistory:"دا حساب د نوبت سابقه نه لري. د تل لپاره یې ړنګوئ؟", hasHistory:"دا ناروغ {count} نوبتونه لري. د حساب په ړنګولو سره ټول نوبتونه هم د تل لپاره ړنګېږي. دوام ورکوئ؟", empty:"ناروغ ونه موندل شو", unknown:"نه دی ثبت شوی" },
    English: { title:"Manage Patients", search:"Search name, email or phone", verify:"Verify Account", verified:"Verified", pending:"Unverified", delete:"Delete Permanently", disable:"Deactivate", enable:"Activate", active:"Active", inactive:"Inactive", status:"Account Status", details:"Patient Details", name:"Full Name", email:"Email", phone:"Phone", city:"City", address:"Address", bio:"About", birth:"Date of Birth", registered:"Registration Date", history:"Appointments", noHistory:"This account has no appointments. Permanently delete it?", hasHistory:"This patient has {count} appointments. Deleting the account will permanently delete all appointment history too. Continue?", empty:"No patients found", unknown:"Not provided" },
  }[language];
  const updatePatient = async (patient, action) => {
    if (action === "delete") {
      const warning = patient.appointmentCount > 0
        ? patientLabels.hasHistory.replace("{count}", patient.appointmentCount)
        : patientLabels.noHistory;
      if (!window.confirm(warning)) return;
    }
    setPatientBusy(patient.id);
    setError("");
    try {
      if (action === "delete") {
        await api(`/admin/patients/${patient.id}?confirmHistory=true`, { method: "DELETE" });
      } else if (action === "verify") {
        await api(`/admin/patients/${patient.id}/verify`, { method: "PATCH" });
      } else {
        await api(`/admin/patients/${patient.id}/status`, { method: "PATCH", body: JSON.stringify({ disabled: action === "disable" }) });
      }
      await load();
    } catch (e) { setError(e.message); }
    finally { setPatientBusy(null); }
  };
  const deleteContact = async (c) => {
    if (
      !window.confirm(
        t.adminDeleteContactConfirm || "Delete this message permanently?",
      )
    )
      return;
    setError("");
    setContactBusyId(c.id);
    try {
      await api(`/admin/contacts/${c.id}`, { method: "DELETE" });
      setContacts((previous) => previous.filter((item) => item.id !== c.id));
    } catch (e) {
      setError(e.message);
    } finally {
      setContactBusyId(null);
    }
  };
  const sendContactReply = async (c) => {
    const reply = (replies[c.id] ?? "").trim();
    if (!reply) {
      setError(t.adminReplyRequired || "Write your reply first.");
      return;
    }
    setError("");
    setEmailMessage("");
    setContactBusyId(c.id);
    try {
      await api(`/admin/contacts/${c.id}/reply`, {
        method: "POST",
        body: JSON.stringify({ reply }),
      });
      setEmailMessage("adminReplySent");
      setOpenReplyId(null);
      setReplies((previous) => ({ ...previous, [c.id]: "" }));
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setContactBusyId(null);
    }
  };
  const toggleProvider = async (p) => {
    try {
      await api(`/admin/providers/${p.id}`, {
        method: "PATCH",
        body: JSON.stringify({ active: !p.active }),
      });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };
  const deleteProvider = async (p) => {
    if (
      !window.confirm(
        language === "English"
          ? `Remove the provider account for "${p.name}"? Doctor/hospital cards will remain.`
          : language === "Pashto"
            ? `د «${p.name}» حساب حذف شي؟ د ډاکټر/روغتون کارت به پاتې شي.`
            : `حساب «${p.name}» حذف شود؟ کارت و مشخصات داکتر/شفاخانه باقی می‌ماند.`,
      )
    )
      return;
    try {
      await api(`/admin/providers/${p.id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };
  const startEdit = (kind, item) => {
    setCatalogFileName("");
    setLogoFileName("");
    setEditing(`${kind}-${item.id}`);
    setForm(
      kind === "doctor"
        ? {
            name: item.name,
            email: item.email || "",
            phone: item.phone || "",
            specialty: item.specialty_value,
            specialtyValues: item.specialty_values?.length
              ? item.specialty_values
              : [item.specialty_value],
            hospitalId:
              hospitals.find((h) => h.name === item.hospital)?.id || "",
            city: item.city,
            about: item.about || "",
            experience: item.experience || "",
            education: item.education || "",
            image: item.image || "",
          }
        : kind === "hospital"
          ? {
              name: item.name,
              city: item.city,
              location: item.location,
              type: item.type_value || "private",
              phone: item.phone || "",
              email: item.email || "",
              license: item.license_number || "",
              services: item.services || "",
              specialtyValues: item.specialty_values || [],
              description: item.description || "",
              image: item.image || "",
              logo: item.logo || "",
            }
          : {
              name: item.name,
              value: item.value,
              department: item.department || "",
              image: item.image || "",
            },
    );
  };
  const saveItem = async (kind, id) => {
    if (kind === "doctor" && !form.phone?.trim()) {
      setError(t.adminRequiredFields);
      return;
    }
    if (
      kind === "hospital" &&
      (!form.name ||
        !form.city ||
        !form.location ||
        !form.phone ||
        !form.email ||
        !form.license)
    ) {
      setError(t.adminHospitalRequired);
      return;
    }
    if (
      kind === "specialty" &&
      (!form.image || !form.department || !form.name || !form.value)
    ) {
      setError(t.adminSpecialtyRequired);
      return;
    }
    try {
      await api(
        `/admin/${kind === "doctor" ? "doctors" : kind === "hospital" ? "hospitals" : "specialties"}/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            ...form,
            ...(kind === "doctor"
              ? { specialty: form.specialtyValues?.[0] || form.specialty }
              : {}),
          }),
        },
      );
      setEditing(null);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };
  const deleteItem = async (kind, id) => {
    if (!window.confirm(t.adminCatalogDeleteConfirm)) return;
    try {
      await api(
        `/admin/${kind === "doctor" ? "doctors" : kind === "hospital" ? "hospitals" : "specialties"}/${id}`,
        { method: "DELETE" },
      );
      await load();
    } catch (e) {
      setError(e.message);
    }
  };
  const uploadSpecialtyPhoto = async (file) => {
    if (!file) return;
    setUploadingImage(true);
    setError("");
    try {
      const body = new FormData();
      body.append("photo", file);
      const response = await fetch(`${API_URL}/api/admin/specialties/photo`, {
        method: "POST",
        credentials: "include",
        body,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || t.adminUploadFailed);
      setForm((previous) => ({ ...previous, image: result.image }));
    } catch (e) {
      setError(e.message);
    } finally {
      setUploadingImage(false);
    }
  };
  const uploadCatalogPhoto = async (file) => {
    if (!file) return;
    setCatalogFileName(file.name);
    setUploadingImage(true);
    setError("");
    try {
      const body = new FormData();
      body.append("photo", file);
      const response = await fetch(`${API_URL}/api/admin/catalog/photo`, {
        method: "POST",
        credentials: "include",
        body,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || t.adminUploadFailed);
      setForm((previous) => ({ ...previous, image: result.image }));
    } catch (e) {
      setError(e.message);
    } finally {
      setUploadingImage(false);
    }
  };
  const hospitalLogoField = () => (
    <div className="sm:col-span-2">
      <label className="block font-medium dark:text-white mb-2 cursor-pointer">
        {language === "English" ? "Hospital / Clinic Logo" : language === "Pashto" ? "د روغتون / کلینیک لوګو" : "لوگوی شفاخانه / کلینیک"}
        <span className="text-red-500 ms-1">*</span>
        <input type="file" accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            setLogoFileName(file.name);
            setUploadingImage(true);
            try {
              const body = new FormData();
              body.append("photo", file);
              const response = await fetch(`${API_URL}/api/admin/catalog/photo`, {
                method: "POST", credentials: "include", body,
              });
              const result = await response.json();
              if (!response.ok) throw new Error(result.message || t.adminUploadFailed);
              setForm((old) => ({ ...old, logo: result.image }));
            } catch (error) { setError(error.message); }
            finally { setUploadingImage(false); }
          }} />
        <span className="block w-full mt-2 border rounded-xl p-3 text-sm text-gray-700 dark:text-gray-200 dark:border-[#528077] hover:border-teal-500 transition-colors">
          {logoFileName || t.noFileChosen}
        </span>
      </label>
      {form.logo && <img src={form.logo} alt="Logo" className="w-28 h-28 rounded-full object-contain bg-white border mt-3" />}
    </div>
  );
  const catalogImageField = () => (
    <div className="block sm:col-span-2">
      <label className="block cursor-pointer">
        {t.adminCatalogPhoto}{editing === "new-hospitals" && <span className="text-red-500 ms-1">*</span>}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => uploadCatalogPhoto(e.target.files[0])}
          className="sr-only"
        />
        <span className="block w-full mt-2 border rounded-xl p-3 text-gray-700 dark:text-gray-200 dark:border-[#528077] text-sm">
          {catalogFileName || t.noFileChosen}
        </span>
      </label>
      {form.image && (
        <img
          src={form.image}
          alt={t.photoLabel}
          className="w-24 h-24 rounded-xl object-cover mt-2"
        />
      )}
    </div>
  );
  const specialtyImageField = () => (
    <div className="sm:col-span-2 space-y-2">
      <label className="block cursor-pointer text-sm font-medium">
        {t.adminSpecialtyImage.includes("*") ? t.adminSpecialtyImage.replace("*", "") : t.adminSpecialtyImage}<span className="text-red-500 ms-1">*</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            setCatalogFileName(e.target.files[0]?.name || "");
            uploadSpecialtyPhoto(e.target.files[0]);
          }}
          className="sr-only"
        />
        <span className="block mt-2 w-full border rounded-xl p-3 text-gray-700 dark:text-gray-200 dark:border-[#528077]">
          {catalogFileName || t.noFileChosen}
        </span>
      </label>
      {uploadingImage && <p>{t.adminUploadingImage}</p>}
      {form.image && (
        <img
          src={form.image}
          alt={t.adminSpecialtyName}
          className="w-28 h-28 object-cover rounded-xl"
        />
      )}
    </div>
  );

  const addSpecialty = async () => {
    if (!form.image || !form.department || !form.name || !form.value) {
      setError(t.adminSpecialtyRequired);
      return;
    }

    try {
      await api("/admin/specialties", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setEditing(null);
      setForm({});
      setError("");
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const addCatalog = async (kind) => {
    if (
      !form.name ||
      !form.city ||
      (kind === "doctor" && (!form.email || !form.phone)) ||
      (kind === "hospital" &&
        (!form.location ||
          !form.phone ||
          !form.email ||
          !form.license ||
          !form.image ||
          !form.logo)) ||
      (kind === "doctor" &&
        (!(form.specialtyValues?.length || form.specialty) || !form.hospitalId))
    ) {
      setError(t.adminRequiredFields);
      return;
    }
    try {
      await api(`/admin/${kind === "doctor" ? "doctors" : "hospitals"}`, {
        method: "POST",
        body: JSON.stringify({
          ...form,
          ...(kind === "doctor"
            ? { specialty: form.specialtyValues?.[0] || form.specialty }
            : {}),
        }),
      });
      setEditing(null);
      setForm({});
      await load();
    } catch (e) {
      setError(e.message);
    }
  };
  const specialtyPicker = () => (
    <div className="sm:col-span-2 border rounded-xl p-4">
      <p className="font-medium mb-3">
        {language === "English"
          ? "Medical specialties (choose one or more)"
          : language === "Pashto"
            ? "طبي تخصصونه (یو یا څو وټاکئ)"
            : "تخصص‌های طبی (یک یا چند مورد انتخاب کنید)"}
        <span className="text-red-500 ms-1">*</span>
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {specialtiesList.map((item) => (
          <label
            key={item.value}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={(form.specialtyValues || []).includes(item.value)}
              onChange={(e) =>
                setForm({
                  ...form,
                  specialtyValues: e.target.checked
                    ? [...(form.specialtyValues || []), item.value]
                    : (form.specialtyValues || []).filter(
                        (v) => v !== item.value,
                      ),
                })
              }
            />
            <span>{item.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
  const field = (name, label, type = "text", options = []) => (
    <label key={name} className="block text-sm font-medium">
      {String(label).replace(/\s*\*/g, "")}
      {String(label).includes("*") && <span className="text-red-500 ms-1">*</span>}
      {type === "select" ? (
        <select
          value={form[name] ?? ""}
          onChange={(e) => setForm({ ...form, [name]: e.target.value })}
          className="mt-1 w-full p-3 rounded-xl border text-gray-900"
        >
          <option value="">{t.adminSelectOption}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : [
          "about",
          "education",
          "experience",
          "description",
          "services",
          "location",
        ].includes(name) ? (
        <textarea
          rows={name === "location" ? 3 : 7}
          value={form[name] ?? ""}
          onChange={(e) => setForm({ ...form, [name]: e.target.value })}
          className="mt-1 w-full p-3 rounded-xl border text-gray-900 resize-y"
        />
      ) : (
        <input
          value={form[name] ?? ""}
          onChange={(e) => setForm({ ...form, [name]: e.target.value })}
          className="mt-1 w-full p-3 rounded-xl border text-gray-900"
        />
      )}
    </label>
  );
  const detailsOf = (r) => {
    try {
      return typeof r.details === "string" ? JSON.parse(r.details) || {} : r.details || {};
    } catch {
      return {};
    }
  };
  const tr = (en, fa, ps) => language === "English" ? en : language === "Pashto" ? ps : fa;
  const [requestType, setRequestType] = useState("");
  const [requestSource, setRequestSource] = useState("");
  const facilityType = item => /clinic|کلینیک|کلينيک/i.test(String(item.type_value || item.type || "")) ? "clinic" : "hospital";
  const catalogDetails = (item, kind) => kind === "doctor" ? {
    city: item.city, specialty: item.specialty, hospital: item.hospital,
    education: item.education, experience: item.experience, information: item.about,
    photoUrl: item.image
  } : { city: item.city, hospitalType: facilityType(item), address: item.location,
    license: item.license_number, information: item.description, services: item.services,
    specialtyValues: item.specialty_values, logoUrl: item.logo || item.image, photoUrl: item.image };
  const registrationRows = [];
  for (const [kind, items] of [["doctor", doctors], ["hospital", hospitals]]) {
    for (const item of items) {
      const linked = requests.find(r => r.status === "approved" && (kind === "doctor" ? r.doctor_ids : r.hospital_ids)?.some(id => String(id) === String(item.id)));
      // Historical entries were self-registered, as confirmed by the administrator.
      const original = linked ? detailsOf(linked) : {};
      const source = linked ? (original.assignedByAdmin ? "admin" : "application") : "application";
      registrationRows.push({ ...linked, id: `${kind}-${item.id}`, name: item.name,
        email: item.email || linked?.email, phone: item.phone || linked?.phone,
        provider_type: kind === "doctor" ? kind : facilityType(item), status: "approved", source,
        details: { ...catalogDetails(item, kind) }, originalDetails: linked ? original : null,
        originalName: linked?.name, originalRequestId: linked?.id });
    }
  }
  for (const r of requests) {
    if (r.status !== "approved") registrationRows.push({ ...r, source: "application", provider_type: r.provider_type === "doctor" ? "doctor" : facilityType({type: detailsOf(r).type || r.provider_type}) });
  }
  for (const p of patients) registrationRows.push({ id: `patient-${p.id}`, name: p.name, email: p.email, phone: p.phone,
    provider_type: "patient", source: "patient", status: "approved", details: { city: p.city, address: p.address, birthDate: p.birthDate, information: p.bio, photoUrl: p.avatar, createdAt: p.created_at } });
  const sourceLabel = source => source === "admin" ? tr("Registered by admin", "ثبت‌شده توسط ادمین", "د اډمین له خوا ثبت شوی") : tr("Registered by the person", "ثبت‌شده توسط خود شخص", "د شخص له خوا ثبت شوی");
  const requestPhoto = r => detailsOf(r).logoUrl || detailsOf(r).photoUrl;
  const title = r => r.name;
  const accountTypes = {
    doctor: [Stethoscope, tr("Doctor", "داکتر", "ډاکټر"), "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200"],
    hospital: [Building2, tr("Hospital", "شفاخانه", "روغتون"), "bg-teal-50 text-teal-700 dark:bg-[#173b35] dark:text-teal-200"],
    clinic: [Building2, tr("Clinic", "کلینیک", "کلینیک"), "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-200"],
    patient: [Users, tr("Patient", "مریض", "ناروغ"), "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200"]
  };
  const accountBadge = kind => {
    const [Icon, label, color] = accountTypes[kind] || accountTypes.hospital;
    return <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${color}`}><Icon size={14}/>{label}</span>;
  };
  const lists = { appointments, requests: registrationRows, contacts, patients, providers, doctors, hospitals, specialties: specialtiesList };
  const rows = lists[tab] || [];
  const appointmentStatuses = [["pending", t.requestPending], ["confirmed", tr("Confirmed", "تأییدشده", "تایید شوي")], ["cancelled", tr("Cancelled", "لغوشده", "لغوه شوي")]];
  const statuses = tab === "appointments" ? appointmentStatuses : tab === "requests" ? [["pending", t.requestPending], ["approved", t.requestApproved], ["rejected", t.requestRejected]] : tab === "contacts" ? [["replied", tr("Replied", "پاسخ داده‌شده", "ځواب شوي")], ["unanswered", tr("Unanswered", "بدون پاسخ", "بې ځوابه")]] : ["patients", "providers"].includes(tab) ? [["active", tr("Active", "فعال", "فعال")], ["inactive", tr("Inactive", "غیرفعال", "غیرفعال")]] : [];
  const matchesStatus = (item, value) => value === "all" || (tab === "patients" ? (item.account_disabled ? "inactive" : "active") === value : tab === "providers" ? (item.active ? "active" : "inactive") === value : value === "unanswered" ? item.status !== "replied" : item.status === value);
  const filtered = rows.filter(item => {
    const fields = [tab === "requests" ? JSON.stringify(detailsOf(item)) : "", item.patient_name, item.doctor_name, item.hospital_name, item.date, solarDate(item.date), cityLabel(item.city, language), item.name, item.displayName, item.email, item.phone, item.city, item.hospital, item.specialty, item.subject, item.message, item.type, item.department, item.value];
    return (tab !== "requests" || ((!requestType || item.provider_type === requestType) && (!requestSource || (requestSource === "self" ? ["application", "patient"].includes(item.source) : item.source === requestSource)))) && (tab !== "appointments" || !appointmentDate || dateKey(item.date) === appointmentDate) && fields.some(v => String(v || "").toLowerCase().includes(search.trim().toLowerCase())) && matchesStatus(item, status) && (!city || cityKey(item.city) === city) && (!hospital || (item.hospital_ids || []).some(id => String(id) === hospital) || hospitals.some(h => String(h.id) === hospital && h.name === item.hospital)) && (!specialty || (item.specialty_values || []).includes(specialty) || item.specialty_value === specialty) && (!type || item.type === type);
  });
  const pages = Math.max(1, Math.ceil(filtered.length / limit));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * limit, currentPage * limit);
  const resetFilters = () => { setRequestType(""); setRequestSource(""); setAppointmentDate(""); setSearch(""); setStatus("all"); setCity(""); setHospital(""); setSpecialty(""); setType(""); setPage(1); };
  const filterClass = "border border-gray-200 dark:border-[#38665d] rounded-xl p-3 bg-white dark:bg-[#102d29] dark:text-white min-w-0";
  const filterSelect = (value, setter, label, options) => (
    <select aria-label={label} className={filterClass} value={value} onChange={e => { setter(e.target.value); setPage(1); }}>
      <option value="">{label}</option>
      {options.map(([v, name]) => <option key={v} value={v}>{name}</option>)}
    </select>
  );
  const uniqueOptions = (key) => [...new Set(rows.map(item => item[key]).filter(Boolean))].sort().map(v => [v, v]);
  const reportTitle = tr("Statistics and reports", "آمار و گزارشات", "احصایې او راپورونه");
  const tabs = [
    { id: "reports", name: reportTitle, icon: BarChart3 },
    { id: "appointments", name: tr("Manage appointments", "مدیریت نوبت‌ها", "د نوبتونو مدیریت"), icon: CalendarCheck, count: appointments.length },
    {
      id: "requests",
      name: t.adminRequests,
      icon: ClipboardCheck,
      count: registrationRows.length,
    },
    {
      id: "doctors",
      name: t.manageDoctors,
      icon: Stethoscope,
      count: doctors.length,
    },
    {
      id: "hospitals",
      name: t.manageHospitals,
      icon: Building2,
      count: hospitals.length,
    },
    {
      id: "specialties",
      name: t.manageSpecialties,
      icon: Tags,
      count: specialtiesList.length,
    },
    {
      id: "contacts",
      name: t.adminMessages,
      icon: Mail,
      count: contacts.length,
    },
    {
      id: "patients",
      name: patientLabels.title,
      icon: Users,
      count: patients.length,
    },
    {
      id: "providers",
      name: t.adminProviders,
      icon: ShieldCheck,
      count: providers.length,
    },
  ];
  const EmptyIcon = tabs.find(item => item.id === tab)?.icon || ClipboardCheck;
  const emptyState = (
    <div className="relative overflow-hidden rounded-3xl border border-teal-100 dark:border-[#28534d] bg-white dark:bg-[#102d29] px-5 py-12 sm:py-16 text-center shadow-sm">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent" />
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-teal-50 dark:bg-[#173b35] text-teal-600 dark:text-teal-300 ring-8 ring-teal-50/50 dark:ring-[#173b35]/50"><EmptyIcon size={34} strokeWidth={1.6}/></div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{tr("No records found", "موردی وجود ندارد", "هیڅ مورد نشته")}</h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">{rows.length ? tr("Try changing your filters.", "فیلترها یا عبارت جستجو را تغییر دهید.", "فلټرونه یا د لټون عبارت بدل کړئ.") : tr("No records have been added to this section yet.", "هنوز اطلاعاتی در این بخش ثبت نشده است.", "په دې برخه کې لا معلومات نه دي ثبت شوي.")}</p>
      {rows.length > 0 && <button onClick={resetFilters} className="mt-5 rounded-xl border border-teal-500 px-4 py-2 text-sm font-medium text-teal-700 dark:text-teal-300">{tr("Clear filters", "پاک کردن فیلترها", "فلټرونه پاک کړئ")}</button>}
    </div>
  );
  return (
    <main className="min-h-screen bg-teal-50/60 dark:bg-[#061b19] px-4 py-12">
      <style>{`main button:not(:disabled) { cursor: pointer; transition: filter 0.2s, transform 0.2s, background-color 0.2s; }
        main button:not(:disabled):hover { filter: brightness(0.93); }
        main button:not(:disabled):active { transform: scale(0.98); }
        main button:disabled { cursor: not-allowed; }`}</style>
      <div className="max-w-6xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-r from-teal-700 to-cyan-600 text-white p-8 shadow-lg flex flex-wrap justify-between gap-4 items-center">
          <div>
            <ShieldCheck size={36} />
            <h1 className="text-3xl font-bold mt-3">{t.adminTitle}</h1>
            <p className="text-teal-50 mt-2">{t.adminSubtitle}</p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-xl px-5 py-3 transition cursor-pointer"
          >
            <RefreshCw size={18} />
            {t.adminRefresh}
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mt-6">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setTab(item.id);
                resetFilters();
                setEditing(null);
                setForm({});
                setCatalogFileName("");
              }}
              className={`rounded-2xl p-4 text-start flex flex-col items-start shadow-sm border transition hover:-translate-y-1 hover:shadow-md cursor-pointer ${tab === item.id ? "bg-gradient-to-br from-teal-600 to-teal-800 text-white border-teal-600" : "bg-white dark:bg-[#102d29] dark:text-white border-gray-100 dark:border-[#28534d]"}`}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tab === item.id ? "bg-white/20" : "bg-teal-50 text-teal-700 dark:bg-[#173b35] dark:text-teal-300"}`}><item.icon size={24} strokeWidth={1.8}/></span>
                {item.count !== undefined && <span className={`text-3xl font-bold tabular-nums ${tab === item.id ? "text-white" : "text-teal-700 dark:text-teal-300"}`}>{item.count}</span>}
              </div>
              <p className="font-semibold mt-4">{item.name}</p>
            </button>
          ))}
        </div>
        {emailMessage && (
          <p
            role="status"
            className="bg-green-50 text-green-700 rounded-xl p-4 mt-5"
          >
            {displayMessage(emailMessage)}
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="bg-red-50 text-red-700 rounded-xl p-4 mt-5"
          >
            {displayMessage(error)}
          </p>
        )}
        {loading ? (
          <Loading language={language} />
        ) : (
          <div className="mt-7 space-y-4">
            {tab !== "reports" && (
              <div className="bg-white dark:bg-[#102d29] dark:text-white rounded-2xl p-4 space-y-3">
                {statuses.length > 0 && <div className="flex flex-wrap gap-2">{[["all", tr("All", "همه", "ټول")], ...statuses].map(([v, label]) => <button key={v} onClick={() => { setStatus(v); setPage(1); }} className={`rounded-xl px-3 py-2 flex items-center gap-2 border ${status === v ? "bg-teal-600 text-white border-teal-600" : "bg-gray-50 dark:bg-[#173b35] border-gray-100 dark:border-[#28534d]"}`}>{label}<span className={`min-w-7 rounded-lg px-2 py-1 text-xs font-bold tabular-nums ${status === v ? "bg-white/20" : "bg-teal-100 text-teal-800 dark:bg-[#28534d] dark:text-teal-200"}`}>{rows.filter(item => matchesStatus(item, v)).length}</span></button>)}</div>}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <input type="search" aria-label={tr("Search", "جستجو", "لټون")} placeholder={tr("Search all records...", "جستجو در تمام معلومات...", "په ټولو معلوماتو کې لټون...")} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className={filterClass} />
                  {["doctors", "hospitals"].includes(tab) && filterSelect(city, setCity, tr("All cities", "تمام شهرها", "ټول ښارونه"), [...new Map(rows.filter(item => item.city).map(item => [cityKey(item.city), cityLabel(item.city, language)])).entries()].sort((a,b) => a[1].localeCompare(b[1])))}
                  {tab === "doctors" && filterSelect(hospital, setHospital, tr("All hospitals", "تمام شفاخانه‌ها", "ټول روغتونونه"), hospitals.map(h => [String(h.id), h.name]))}
                  {tab === "doctors" && filterSelect(specialty, setSpecialty, tr("All specialties", "تمام تخصص‌ها", "ټول تخصصونه"), specialtiesList.map(sp => [sp.value, sp.name]))}
                  {tab === "appointments" && <div className="min-w-0 flex items-center gap-2 [&_.rmdp-container]:flex-1 [&_.rmdp-container]:min-w-0"><DatePicker value={appointmentDate ? new Date(appointmentDate + "T12:00:00") : ""} calendar={afghanCalendar} locale={afghanLocale} format="YYYY/MM/DD" editable={false} placeholder={tr("Solar Hijri date", "تاریخ شمسی", "لمریز هجري نېټه")} onChange={value => { setAppointmentDate(value ? new DateObject(value).convert(gregorian, gregorian_en).format("YYYY-MM-DD") : ""); setPage(1); }} inputClass={filterClass + " w-full"} />{appointmentDate && <button type="button" aria-label={tr("Clear date", "پاک کردن تاریخ", "نېټه پاک کړئ")} onClick={() => {setAppointmentDate(""); setPage(1);}}><X size={18}/></button>}</div>}
                  {tab === "requests" && filterSelect(requestType, setRequestType, tr("All account types", "تمام انواع حساب", "ټول حسابونه"), [["doctor", tr("Doctors", "داکتران", "ډاکټران")], ["hospital", tr("Hospitals", "شفاخانه‌ها", "روغتونونه")], ["clinic", tr("Clinics", "کلینیک‌ها", "کلینیکونه")], ["patient", tr("Patients", "مریضان", "ناروغان")]])}
                  {tab === "requests" && filterSelect(requestSource, setRequestSource, tr("All registration sources", "تمام روش‌های ثبت", "ټولې سرچینې"), [["admin", sourceLabel("admin")], ["self", tr("Registered by the person", "ثبت‌شده توسط خود شخص", "د شخص له خوا ثبت شوی")]])}
                  {tab === "hospitals" && filterSelect(type, setType, tr("All types", "تمام انواع", "ټول ډولونه"), uniqueOptions("type"))}
                  <select aria-label={tr("Page size", "تعداد نمایش", "د ښودلو شمېر")} className={filterClass} value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}>{[5,10,25,50].map(n => <option key={n} value={n}>{n} {tr("per page", "در هر صفحه", "په هره پاڼه کې")}</option>)}</select>
                  <button onClick={resetFilters} className="text-teal-700 dark:text-teal-300">{tr("Clear filters", "پاک کردن فیلترها", "فلټرونه پاک کړئ")}</button>
                </div>
              </div>
            )}
            {tab === "reports" && report && (
              <section className="bg-white dark:bg-[#102d29] dark:text-white rounded-2xl p-5 space-y-5">
                <h2 className="text-xl font-bold">{reportTitle}</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[[Users,tr("Patients","مریضان","ناروغان"),patients.length], [Stethoscope,tr("Doctors","داکتران","ډاکټران"),doctors.length], [Building2,tr("Hospitals","شفاخانه‌ها","روغتونونه"),hospitals.filter(h=>facilityType(h)==="hospital").length], [Building2,tr("Clinics","کلینیک‌ها","کلینیکونه"),hospitals.filter(h=>facilityType(h)==="clinic").length], [Tags,tr("Specialties","تخصص‌ها","تخصصونه"),specialtiesList.length], [ShieldCheck,t.adminProviders,providers.length], [ClipboardCheck,t.adminRequests,registrationRows.length], [Mail,t.adminMessages,contacts.length], [CalendarCheck,tr("Appointments","نوبت‌ها","نوبتونه"),report.total]].map(([Icon,label,count]) => <div key={label} className="rounded-2xl border border-teal-100 dark:border-[#28534d] bg-teal-50/60 dark:bg-[#173b35] p-4"><div className="flex items-center justify-between gap-2"><span className="text-sm">{label}</span><span className="p-2 rounded-xl bg-white dark:bg-[#102d29] text-teal-600 dark:text-teal-300"><Icon size={19}/></span></div><p className="text-3xl font-bold mt-3 tabular-nums">{count}</p></div>)}
                </div>
                <div className="rounded-2xl border border-gray-100 dark:border-[#28534d] p-4 space-y-4">
                  <h3 className="font-bold">{tr("Performance indicators","شاخص‌های عملکرد","د فعالیت شاخصونه")}</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[[tr("Confirmation rate","نرخ تأیید نوبت‌ها","د تایید کچه"),report.total ? Math.round(report.confirmed/report.total*100)+"%" : "—"], [tr("Active patients","مریضان فعال","فعال ناروغان"),patients.filter(p=>!p.account_disabled).length], [tr("Pending requests","درخواست‌های در انتظار","منتظر غوښتنې"),registrationRows.filter(r=>r.status==="pending").length], [tr("Unanswered messages","پیام‌های بدون پاسخ","بې ځوابه پیغامونه"),contacts.filter(c=>c.status!=="replied").length], [tr("Active providers","ارائه‌دهندگان فعال","فعال خدمت وړاندې کوونکي"),providers.filter(p=>p.active).length], [tr("Self registrations","ثبت توسط خود شخص","د شخص له خوا ثبت"),registrationRows.filter(r=>r.source!=="admin").length], [tr("Admin registrations","ثبت توسط ادمین","د اډمین له خوا ثبت"),registrationRows.filter(r=>r.source==="admin").length], [tr("Bookings in selected period","نوبت‌ها در دوره انتخابی","په ټاکلې موده کې نوبتونه"),report.daily.slice(-days).reduce((sum,d)=>sum+Number(d.count),0)]].map(([label,count])=><div key={label} className="rounded-xl bg-gray-50 dark:bg-[#173b35] p-4"><p className="text-xs text-gray-500 dark:text-gray-300">{label}</p><p className="text-2xl font-bold mt-2 text-teal-700 dark:text-teal-300">{count}</p></div>)}
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-100 dark:border-[#28534d] p-4 space-y-4">
                  <h3 className="font-bold">{tr("Appointment status","وضعیت نوبت‌ها","د نوبتونو حالت")}</h3>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[["pending",tr("Pending","منتظر تأیید","تایید ته منتظر"),"bg-amber-500","text-amber-600"],["confirmed",tr("Confirmed","تأییدشده","تایید شوي"),"bg-teal-500","text-teal-600"],["cancelled",tr("Cancelled","لغوشده","لغوه شوي"),"bg-rose-500","text-rose-600"]].map(([key,label,color,ink])=> <div key={key} className="rounded-2xl bg-gray-50 dark:bg-[#173b35] p-4"><div className="flex items-center gap-2 text-sm"><span className={`w-2.5 h-2.5 rounded-full ${color}`}/>{label}</div><div className="flex items-end justify-between mt-3"><strong className={`text-3xl ${ink} dark:text-white`}>{report[key]}</strong><span className="text-xs text-gray-500 dark:text-gray-300">{report.total ? Math.round(report[key]/report.total*100) : 0}%</span></div><div className="mt-3 h-2 rounded-full bg-gray-200 dark:bg-[#28534d] overflow-hidden"><div className={`h-full rounded-full ${color}`} style={{width:`${report.total ? report[key]/report.total*100 : 0}%`}}/></div></div>)}
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-100 dark:border-[#28534d] p-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-bold">{tr("Appointments created by day","نوبت‌های ثبت‌شده به تفکیک روز","هره ورځ ثبت شوي نوبتونه")}</h3><select className={filterClass} value={days} onChange={e=>setDays(Number(e.target.value))}>{[7,30,90].map(n=><option key={n} value={n}>{n} {tr("days","روز","ورځې")}</option>)}</select></div>
                  <div className="overflow-x-auto pb-2" dir="ltr"><div className="flex gap-3 items-end" style={{minWidth: Math.max(280,report.daily.slice(-days).length*62)}}>
                    {report.daily.slice(-days).map(item=><div key={item.day} className="flex-1 min-w-[50px] flex flex-col items-center gap-2"><span className="text-xs font-bold bg-teal-50 dark:bg-[#173b35] text-teal-700 dark:text-teal-200 rounded-lg px-2 py-1">{item.count}</span><div className="h-36 w-full flex items-end justify-center border-b border-gray-200 dark:border-[#28534d] bg-gray-50/60 dark:bg-[#173b35]/50 rounded-t-xl"><div className="w-7 max-w-full bg-teal-500 rounded-t-lg" style={{height:`${item.count/Math.max(1,...report.daily.slice(-days).map(d=>Number(d.count)))*100}%`}}/></div><span className="text-[10px] text-gray-500 dark:text-gray-300 whitespace-nowrap">{solarDate(item.day)}</span></div>)}
                  </div></div>
                  {!report.daily.slice(-days).some(d=>Number(d.count)>0) && <p className="text-center text-sm text-gray-500 dark:text-gray-300">{tr("No bookings in this period","در این دوره نوبتی ثبت نشده است","په دې موده کې نوبت نه دی ثبت شوی")}</p>}
                </div>
              </section>
            )}

            {tab === "requests" && (visible.length ? visible.map(r => (
              <article key={r.id} className="bg-white dark:bg-[#102d29] dark:text-white rounded-2xl border border-gray-100 dark:border-[#28534d] p-4 flex flex-wrap items-center gap-4">
                <div className="relative w-12 h-12 shrink-0 overflow-hidden bg-teal-50 dark:bg-[#173b35] text-teal-600 rounded-xl flex items-center justify-center">{r.provider_type === "doctor" ? <Stethoscope size={24}/> : r.provider_type === "patient" ? <Users size={24}/> : <Building2 size={24}/>} {requestPhoto(r) && <img src={requestPhoto(r)} alt={r.name} className="absolute inset-0 w-full h-full object-cover" onError={e => {e.currentTarget.style.display = "none";}} />}</div>
                <div className="flex-1 min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{title(r)}</h3>{accountBadge(r.provider_type)}</div><p className="text-sm text-gray-500 dark:text-gray-300 break-all">{r.email} · {r.phone}</p></div>
                <span className="text-sm font-medium">{r.status === "approved" ? t.requestApproved : r.status === "rejected" ? t.requestRejected : r.status === "registered" ? tr("Registered", "ثبت‌شده", "ثبت شوي") : t.requestPending}</span>
                <button className="border border-teal-600 text-teal-600 dark:text-teal-300 rounded-xl px-4 py-2" onClick={() => setRequestOpen(r.id)}>{tr("View details", "مشاهده جزئیات", "جزئیات وګورئ")}</button>
              </article>
            )) : emptyState)}
            {tab === "requests" && registrationRows.filter(r => r.id === requestOpen).map(r => (
              <div key={r.id} className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                <section role="dialog" aria-modal="true" className="bg-white dark:bg-[#102d29] dark:text-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between gap-3"><h2 className="font-bold text-xl">{title(r)}</h2><button aria-label={tr("Close", "بستن", "تړل")} onClick={() => setRequestOpen(null)}><X/></button></div>
                  <p className="text-sm break-all mt-2">{r.email} · {r.phone}</p><p className="mt-2 text-sm font-semibold text-teal-600 dark:text-teal-300">{sourceLabel(r.source)}</p>
                    {requestPhoto(r) && (
                      <img
                        src={requestPhoto(r)}
                        alt={r.name}
                        className="mt-4 w-32 h-32 rounded-xl object-cover"
                      />
                    )}
                    <div className="grid sm:grid-cols-2 gap-3 mt-4 text-sm text-gray-600 dark:text-gray-300">
                      {Object.entries(detailsOf(r))
                        .filter(
                          ([key, value]) =>
                            !["photoUrl", "type", "logoUrl", "catalogId", "assignedByAdmin"].includes(key) && value && (!Array.isArray(value) || value.length > 0),
                        )
                        .map(([key, value]) => (
                          <p
                            key={key}
                            className="rounded-lg bg-gray-50 dark:bg-[#173b35] p-3 break-all"
                          >
                            <strong className="capitalize">
                              {requestLabels[key] || key.replace(/([A-Z])/g, " $1")}:{" "}
                            </strong>
                            {key === "city" ? cityLabel(value, language) : /date|createdAt/i.test(key) ? solarDate(value) : Array.isArray(value) ? value.join("، ") : String(value)}
                          </p>
                        ))}
                    </div>
                    {r.originalDetails && r.originalName === r.name && <details className="mt-4 text-sm"><summary className="cursor-pointer font-semibold">{tr("Original application", "معلومات درخواست اصلی", "اصلي غوښتنه")}</summary><div className="grid sm:grid-cols-2 gap-3 mt-3">{Object.entries(r.originalDetails).filter(([k,v]) => !["photoUrl", "logoUrl", "catalogId", "assignedByAdmin"].includes(k) && v && typeof v !== "object").map(([k,v]) => <p key={k} className="break-all">{requestLabels[k] || k}: {String(v)}</p>)}</div></details>}
                    {r.status === "pending" && (
                      <>
                        <label className="block mt-5 mb-2 text-sm font-semibold">
                          {t.adminReviewNote}
                        </label>
                        <textarea
                          value={notes[r.id] ?? r.review_note ?? ""}
                          onChange={(e) =>
                            setNotes({ ...notes, [r.id]: e.target.value })
                          }
                          rows={2}
                          className="w-full rounded-xl border p-3 dark:bg-[#173b35] dark:border-[#38665d]"
                          placeholder={t.adminReviewPlaceholder}
                        />
                        <div className="flex gap-3 mt-3">
                          <button
                            onClick={() => decide(r, "approved")}
                            className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-5 py-2 transition cursor-pointer"
                          >
                            {t.adminApprove}
                          </button>
                          <button
                            onClick={() => decide(r, "rejected")}
                            className="bg-red-100 hover:bg-red-200 text-red-700 rounded-xl px-5 py-2 transition cursor-pointer"
                          >
                            {t.adminReject}
                          </button>
                        </div>
                      </>
                    )}
                </section>
              </div>
            ))}
            {tab === "appointments" && (visible.length ? visible.map(a => (
              <article key={a.id} className="bg-white dark:bg-[#102d29] dark:text-white rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex flex-wrap justify-between gap-3"><h3 className="font-bold">{a.patient_name}</h3><span className="text-teal-600 dark:text-teal-300">{appointmentStatuses.find(([v]) => v === a.status)?.[1] || a.status}</span></div>
                <div className="grid sm:grid-cols-2 gap-2 text-sm"><p>{tr("Doctor", "داکتر", "ډاکټر")}: {a.doctor_name || a.doctor_id}</p><p>{tr("Hospital", "شفاخانه", "روغتون")}: {a.hospital_name || "—"}</p><p>{tr("Date", "تاریخ", "نېټه")}: {solarDate(a.date)}</p><p>{tr("Time", "زمان", "وخت")}: {a.time}</p><p>{tr("Phone", "شماره تماس", "د اړیکې شمېره")}: {a.phone}</p></div>
                <div className="flex flex-wrap gap-2">{appointmentStatuses.filter(([v]) => v !== a.status).map(([v,label]) => <button key={v} className="border border-teal-600 rounded-xl px-4 py-2 text-teal-600 dark:text-teal-300" onClick={async () => {if (!window.confirm(label + "?")) return; try { await api(`/admin/appointments/${a.id}/status`, {method:"PATCH", body:JSON.stringify({status:v})}); await load(); } catch(e) {setError(e.message);}}}>{label}</button>)}</div>
              </article>
            )) : emptyState)}
            {tab === "contacts" &&
              (visible.length ? (
                visible.map((c) => (
                  <article
                    key={c.id}
                    className="bg-white dark:bg-[#102d29] dark:text-white rounded-2xl shadow-sm p-6"
                  >
                    <div className="flex justify-between gap-3">
                      <div>
                        <h3 className="font-bold">{c.name}</h3>
                        <p className="text-sm text-teal-600">{c.email}</p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {c.status || "unread"}
                      </span>
                    </div>
                    <div className="mt-4 space-y-3">
                      <p className="font-semibold">
                        {language === "English" ? "Subject:" : language === "Pashto" ? "موضوع:" : "موضوع:"}{" "}
                        {(c.subject || c.message?.split(/\n\s*\n/)[0] || "").trim()}
                      </p>
                      <p className="whitespace-pre-wrap text-gray-600 dark:text-gray-300">
                        {c.subject ? c.message : (c.message || "").split(/\n\s*\n/).slice(1).join("\n\n") || c.message}
                      </p>
                    </div>
                    {c.admin_reply && (
                      <div className="mt-4 rounded-xl bg-teal-50 dark:bg-[#173b35] p-3">
                        <strong>{t.adminPreviousReply || "Sent reply"}:</strong>
                        <p className="whitespace-pre-wrap">{c.admin_reply}</p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 mt-4">
                      <button
                        disabled={contactBusyId === c.id}
                        onClick={() => {
                          setOpenReplyId(openReplyId === c.id ? null : c.id);
                          setError("");
                        }}
                        className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50 text-white rounded-xl px-4 py-2 transition-colors cursor-pointer"
                      >
                        {t.adminReplyEmail || "Reply"}
                      </button>
                      <button
                        disabled={contactBusyId === c.id}
                        onClick={() => deleteContact(c)}
                        className="bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-700 rounded-xl px-4 py-2 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {t.adminDeleteMessage}
                      </button>
                    </div>
                    {openReplyId === c.id && (
                      <div className="mt-4">
                        <textarea
                          value={replies[c.id] ?? ""}
                          onChange={(e) =>
                            setReplies({ ...replies, [c.id]: e.target.value })
                          }
                          className="w-full border rounded-xl p-3 dark:bg-[#173b35] dark:border-[#38665d]"
                          rows={4}
                          maxLength={3000}
                          placeholder={t.adminReplyPlaceholder}
                        />
                        <button
                          disabled={
                            contactBusyId === c.id ||
                            !(replies[c.id] || "").trim()
                          }
                          onClick={() => sendContactReply(c)}
                          className="mt-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50 text-white rounded-xl px-5 py-2 cursor-pointer transition-colors"
                        >
                          {contactBusyId === c.id
                            ? t.loadingText || t.adminSending
                            : t.adminSendReply || "Send email"}
                        </button>
                      </div>
                    )}
                  </article>
                ))
              ) : (
                emptyState
              ))}
            {tab === "patients" && (
              <div className="space-y-4">
                {visible.map((patient) => (
                  <article key={patient.id} className="bg-white dark:bg-[#102d29] dark:text-white rounded-2xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        {patient.avatar && <img src={patient.avatar} alt="" className="w-14 h-14 rounded-full object-cover" />}
                        <div>
                          <h3 className="font-bold">{patient.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-300">{patientLabels.status}: <strong>{patient.account_disabled ? patientLabels.inactive : patientLabels.active}</strong></p>
                          <p className="text-sm text-gray-500 dark:text-gray-300">{patient.email_verified || patient.phone_verified ? patientLabels.verified : patientLabels.pending}</p>
                        </div>
                      </div>
                      <p className="text-sm">{patientLabels.history}: {patient.appointmentCount}</p>
                      <div className="flex flex-wrap gap-2">
                        {!patient.email_verified && <button disabled={patientBusy === patient.id} onClick={() => updatePatient(patient, "verify")}
                          className="bg-teal-600 text-white rounded-lg px-4 py-2 disabled:opacity-50">{patientLabels.verify}</button>}
                        <button disabled={patientBusy === patient.id} onClick={() => updatePatient(patient, patient.account_disabled ? "enable" : "disable")}
                          className="bg-amber-100 text-amber-800 rounded-lg px-4 py-2 disabled:opacity-50">{patient.account_disabled ? patientLabels.enable : patientLabels.disable}</button>
                        <button disabled={patientBusy === patient.id} onClick={() => updatePatient(patient, "delete")}
                          className="bg-red-100 text-red-700 rounded-lg px-4 py-2 disabled:opacity-50">{patientLabels.delete}</button>
                      </div>
                    </div>
                    <div className="rounded-xl bg-gray-50 dark:bg-[#173b35] p-4 space-y-2 text-sm min-w-0">
                      <h4 className="font-bold mb-3">{patientLabels.details}</h4>
                      {[
                        [patientLabels.name, patient.name], [patientLabels.email, patient.email],
                        [patientLabels.phone, patient.phone], [patientLabels.city, cityLabel(patient.city, language)],
                        [patientLabels.address, patient.address], [patientLabels.bio, patient.bio],
                        [patientLabels.birth, solarDate(patient.birthDate)],
                        [patientLabels.registered, solarDate(patient.created_at)]
                      ].map(([key, value]) => <p key={key} className="break-words"><strong>{key}:</strong> {value || patientLabels.unknown}</p>)}
                    </div>
                  </article>
                ))}
                {!visible.length && emptyState}
              </div>
            )}

            {["doctors", "hospitals", "specialties"].includes(tab) && (
              <>
                {(tab === "doctors" || tab === "hospitals") && (
                  <button
                    onClick={() => {
                      setEditing(`new-${tab}`);
                      setCatalogFileName("");
                      setLogoFileName("");
                      setForm(
                        tab === "doctors"
                          ? {
                              name: "",
                              email: "",
                              phone: "",
                              specialty: "",
                              specialtyValues: [],
                              hospitalId: "",
                              city: "",
                              about: "",
                              image: "",
                            }
                          : {
                              name: "",
                              type: "private",
                              city: "",
                              location: "",
                              phone: "",
                              email: "",
                              license: "",
                              services: "",
                              specialtyValues: [],
                              description: "",
                              image: "",
                              logo: "",
                            },
                      );
                    }}
                    className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 cursor-pointer transition-colors text-white rounded-xl px-4 py-2"
                  >
                    +{" "}
                    {tab === "doctors" ? t.adminAddDoctor : t.adminAddHospital}
                  </button>
                )}
                {(editing === "new-doctors" || editing === "new-hospitals") && (
                  <div className="bg-white rounded-xl p-5 grid sm:grid-cols-2 gap-3">
                    {field(
                      "name",
                      editing === "new-doctors"
                        ? `${t.adminDoctorName} *`
                        : `${t.adminName} *`,
                    )}
                    {editing === "new-doctors" ? (
                      <>
                        {field("email", `${t.profileEmail} *`)}
                        {field("phone", `${t.adminContactPhone} *`)}
                        {specialtyPicker()}
                        {field(
                          "hospitalId",
                          `${t.hospital} *`,
                          "select",
                          hospitals.map((x) => ({
                            value: x.id,
                            label: x.name,
                          })),
                        )}
                        {field("city", `${t.cityLabel} *`)}
                        {field("experience", t.experience)}
                        {field("education", t.education)}
                        {field("about", t.aboutDoctor)}
                      </>
                    ) : (
                      <>
                        {field("type", `${t.adminHospitalType} *`, "select", [
                          { value: "private", label: t.privateHospital },
                          { value: "government", label: t.governmentHospital },
                          { value: "clinic", label: t.clinic },
                        ])}
                        {field("city", `${t.cityLabel} *`)}
                        {field("location", `${t.fullAddress} *`)}
                        {field("phone", `${t.adminContactPhone} *`)}
                        {field("email", `${t.profileEmail} *`)}
                        {field("license", `${t.licenseNumber} *`)}
                        {specialtyPicker()}
                        {field("description", t.adminAboutHospital)}
                      </>
                    )}
                    {catalogImageField()}
                    {editing === "new-hospitals" && hospitalLogoField()}
                    <button
                      disabled={uploadingImage}
                      onClick={() =>
                        addCatalog(
                          editing === "new-doctors" ? "doctor" : "hospital",
                        )
                      }
                      className="bg-teal-600 text-white rounded-xl px-4 py-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="border rounded-xl px-4 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                {tab === "specialties" && (
                  <button
                    onClick={() => {
                      setEditing("new-specialty");
                      setCatalogFileName("");
                      setForm({
                        name: "",
                        value: "",
                        department: "",
                        image: "",
                      });
                    }}
                    className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 cursor-pointer transition-colors text-white rounded-xl px-4 py-2"
                  >
                    + {t.adminAddSpecialty}
                  </button>
                )}
                {editing === "new-specialty" && (
                  <div className="bg-white rounded-xl p-5 grid gap-3">
                    {field("name", `${t.adminSpecialtyName} *`)}
                    {field("value", `${t.adminSpecialtyCodeExample} *`)}
                    {field("department", `${t.adminSpecialtyDepartment} *`)}
                    {specialtyImageField()}
                    <button
                      disabled={uploadingImage}
                      onClick={addSpecialty}
                      className="cursor-pointer hover:brightness-90 active:brightness-75 transition-colors bg-teal-600 text-white rounded-xl p-2"
                    >
                      Save
                    </button>
                  </div>
                )}
                {visible.map((item) => {
                  const kind =
                    tab === "doctors"
                      ? "doctor"
                      : tab === "hospitals"
                        ? "hospital"
                        : "specialty";
                  const active = editing === `${kind}-${item.id}`;
                  return (
                    <article
                      key={item.id}
                      className="bg-white dark:bg-[#102d29] dark:text-white rounded-2xl p-5 shadow-sm"
                    >
                      <div className="flex items-center gap-4 flex-wrap">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-xl"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold">{item.name}</h3>
                          <p className="text-sm text-gray-500">
                            {kind === "doctor"
                              ? `${doctorTitle(item.specialty, t)} · ${item.hospital} · ${cityLabel(item.city, language)} · ${item.email || ""}`
                              : kind === "hospital"
                                ? `${cityLabel(item.city, language)} · ${item.location}`
                                : `${item.value} · ${item.department || t.adminNoDepartment}`}
                          </p>
                        </div>
                        {(kind === "doctor" || kind === "hospital") &&
                          (() => {
                            const account = (
                              kind === "doctor"
                                ? catalogAccounts.doctors
                                : catalogAccounts.hospitals
                            ).find((x) => Number(x.id) === Number(item.id));
                            return account?.email ? (
                              <span className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                                {t.adminAssigned}: {account.email}
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  setAssigning({
                                    type: kind,
                                    id: item.id,
                                    name: item.name,
                                  });
                                  setAssignEmail(item.email || "");
                                }}
                                className="bg-teal-600 text-white px-3 py-2 rounded-lg"
                              >
                                {t.adminAssignAccount}
                              </button>
                            );
                          })()}
                        {(kind === "doctor" ||
                          kind === "hospital" ||
                          kind === "specialty") && (
                          <button
                            onClick={() => openTranslation(kind, item)}
                            className="rounded-lg border border-teal-500 text-teal-700 px-3 py-2"
                          >
                            🌐 {t.adminTranslations}
                          </button>
                        )}
                        <button
                          onClick={() =>
                            active ? setEditing(null) : startEdit(kind, item)
                          }
                          className="flex gap-1 items-center border rounded-lg px-3 py-2"
                        >
                          <Pencil size={16} />{" "}
                          {active ? t.adminCancel : t.adminEdit}
                        </button>
                        <button
                          onClick={() => deleteItem(kind, item.id)}
                          className="flex gap-1 items-center bg-red-100 text-red-700 rounded-lg px-3 py-2"
                        >
                          <Trash2 size={16} /> {t.adminDeleteMessage}
                        </button>
                      </div>
                      {active && (
                        <div className="grid sm:grid-cols-2 gap-3 mt-5">
                          {field(
                            "name",
                            kind === "doctor" ? `${t.adminDoctorName} *` : `${t.adminName} *`,
                          )}
                          {kind === "doctor" && (
                            <>
                              {field("email", `${t.profileEmail} *`)}
                              {field("phone", `${t.adminContactPhone} *`)}
                              {specialtyPicker()}
                              {field(
                                "hospitalId",
                                t.hospital,
                                "select",
                                hospitals.map((x) => ({
                                  value: x.id,
                                  label: x.name,
                                })),
                              )}
                              {field("city", `${t.cityLabel} *`)}
                              {field("experience", t.experience)}
                              {field("education", t.education)}
                              {field("about", t.aboutDoctor)}
                              {catalogImageField()}
                            </>
                          )}
                          {kind === "hospital" && (
                            <>
                              {field("type", `${t.adminHospitalType} *`, "select", [
                                {
                                  value: "private",
                                  label: t.privateHospital,
                                },
                                {
                                  value: "government",
                                  label: t.governmentHospital,
                                },
                                { value: "clinic", label: t.clinic },
                              ])}
                              {field("city", `${t.cityLabel} *`)}
                              {field("location", `${t.fullAddress} *`)}
                              {field("phone", `${t.adminContactPhone} *`)}
                              {field("email", `${t.profileEmail} *`)}
                              {field("license", `${t.licenseNumber} *`)}
                              {specialtyPicker()}
                              {field("description", t.adminAboutHospital)}
                              {catalogImageField()}
                              {hospitalLogoField()}
                            </>
                          )}
                          {kind === "specialty" && (
                            <>
                              {field("value", `${t.adminSpecialtyCode} *`)}
                              {field("department", `${t.adminSpecialtyDepartment} *`)}
                              {specialtyImageField()}
                            </>
                          )}
                          <button
                            disabled={uploadingImage}
                            onClick={() => saveItem(kind, item.id)}
                            className="bg-teal-600 text-white rounded-xl px-4 py-2 flex items-center justify-center gap-2"
                          >
                            <Save size={17} /> {t.adminSaveChanges}
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </>
            )}
            {tab === "providers" &&
              (visible.length ? (
                visible.map((p) => (
                  <article
                    key={p.id}
                    className="bg-white dark:bg-[#102d29] dark:text-white rounded-2xl p-5 shadow-sm flex flex-wrap justify-between gap-4 items-center"
                  >
                    <div>
                      <h3 className="font-bold">
                        {p.provider_type === "doctor"
                          ? t.registerDoctor
                          : p.provider_type === "clinic"
                            ? t.registerClinic
                            : t.registerHospital}{" "}
                        {(p.displayName || p.name).replace(/^(?:(?:داکتر|دکتر|ډاکټر|doctor|dr\.?)\s+)+/i, "")}
                      </h3>
                      <p className={`text-sm font-medium ${p.active ? "text-green-600" : "text-red-600"}`}>
                        {p.active
                          ? (language === "English" ? "Active — visible publicly" : language === "Pashto" ? "فعال — په عامه پاڼه کې ښکاري" : "فعال — در صفحه عمومی نمایش داده می‌شود")
                          : (language === "English" ? "Inactive — hidden from public listings" : language === "Pashto" ? "غیرفعال — له عامه لېست څخه پټ دی" : "غیرفعال — از فهرست عمومی پنهان است")}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-300">
                        {cityLabel(p.city, language)} · {p.phone} · {p.email || ""}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => changeProviderEmail(p)}
                        className="px-4 py-2 rounded-xl border border-teal-500 text-teal-700 dark:text-teal-200"
                      >
                        Edit Email
                      </button>
                      {p.email_verified === false && (
                        <button
                          disabled={sendingId !== null}
                          onClick={() => resendActivation(p.id)}
                          className="px-4 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-50"
                        >
                          {sendingId === p.id
                            ? t.adminSending
                            : "Resend Activation Email"}
                        </button>
                      )}
                      <button
                        onClick={() => toggleProvider(p)}
                        className={`px-4 py-2 rounded-xl cursor-pointer ${p.active ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                      >
                        {p.active ? t.adminDeactivate : t.adminActivate}
                      </button>
                      <button
                        onClick={() => deleteProvider(p)}
                        className="px-4 py-2 rounded-xl bg-red-600 text-white cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                emptyState
              ))}
            {["doctors", "hospitals", "specialties"].includes(tab) && !visible.length && emptyState}
            {tab !== "reports" && filtered.length > 0 && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white dark:bg-[#102d29] dark:text-white p-4">
              <span>{tr("Results", "نتایج", "پایلې")}: {filtered.length ? (currentPage - 1) * limit + 1 : 0}–{Math.min(currentPage * limit, filtered.length)} / {filtered.length}</span>
              <div className="flex items-center gap-2">
                <button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="border rounded-lg px-3 py-2 disabled:opacity-40">{tr("Previous", "قبلی", "مخکینۍ")}</button>
                <span>{currentPage} / {pages}</span>
                <button disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)} className="border rounded-lg px-3 py-2 disabled:opacity-40">{tr("Next", "بعدی", "بلې")}</button>
              </div>
            </div>}
          </div>
        )}
        {translationEditor && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#102d29] dark:text-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold">
                  🌐 {modalText.translate}: {translationEditor.name}
                </h2>
                <button
                  onClick={() => setTranslationEditor(null)}
                  className="cursor-pointer hover:text-red-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-slate-500 mb-4">{modalText.note}</p>
              <label className="block text-sm mb-2">
                {modalText.source}:{" "}
                <select
                  value={sourceLanguage}
                  onChange={(e) => setSourceLanguage(e.target.value)}
                  className="border rounded-lg p-2 dark:bg-[#102d29] cursor-pointer"
                >
                  <option value="fa">دری</option>
                  <option value="ps">پښتو</option>
                  <option value="en">English</option>
                </select>
              </label>
              {error && (
                <p role="alert" className="text-red-600 mb-3">
                  {displayMessage(error)}
                </p>
              )}
              <button
                disabled={translationBusy}
                onClick={generateTranslation}
                className="bg-cyan-700 hover:bg-cyan-800 active:bg-cyan-900 text-white px-4 py-2 rounded-xl mb-4 cursor-pointer disabled:opacity-50 disabled:cursor-wait transition-colors"
              >
                {translationBusy ? modalText.generating : modalText.generate}
              </button>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  ["fa", "دری"],
                  ["ps", "پښتو"],
                  ["en", "English"],
                ].map(([lang, label]) => (
                  <section key={lang} className="border rounded-xl p-3">
                    <h3 className="font-bold mb-3">{label}</h3>
                    {(translationEditor.kind === "doctor"
                      ? ["name", "about", "education", "experience"]
                      : translationEditor.kind === "specialty"
                        ? ["name", "department"]
                        : ["name", "description", "services", "location"]
                    ).map((field) => (
                      <label key={field} className="block mb-3 text-xs">
                        {modalText[field] || field}
                        <textarea
                          rows={field === "name" ? 2 : 8}
                          dir={lang === "en" ? "ltr" : "rtl"}
                          value={
                            translationEditor.translations?.[lang]?.[field] ||
                            ""
                          }
                          onChange={(e) => {
                            setTranslationChanged((prev) => [
                              ...new Set([...prev, field]),
                            ]);
                            setTranslationEditor((prev) => ({
                              ...prev,
                              translations: {
                                ...prev.translations,
                                [lang]: {
                                  ...prev.translations?.[lang],
                                  [field]: e.target.value,
                                },
                              },
                            }));
                          }}
                          className="block mt-1 w-full border rounded-lg p-2 text-sm text-slate-900"
                        />
                      </label>
                    ))}
                  </section>
                ))}
              </div>
              <div className="flex gap-3 mt-4 flex-wrap">
                <button
                  disabled={translationBusy}
                  onClick={() => saveTranslation(false)}
                  className="bg-slate-200 hover:bg-slate-300 active:bg-slate-400 cursor-pointer transition-colors text-slate-900 px-4 py-2 rounded-lg"
                >
                  {modalText.draft}
                </button>
                <button
                  disabled={translationBusy}
                  onClick={() => saveTranslation(true)}
                  className="bg-green-600 hover:bg-green-700 active:bg-green-800 cursor-pointer transition-colors text-white px-4 py-2 rounded-lg"
                >
                  {modalText.approve}
                </button>
              </div>
            </div>
          </div>
        )}
        {assigning && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#102d29] dark:text-white p-6 rounded-2xl w-full max-w-md shadow-xl">
              <h3 className="font-bold text-xl mb-2">{t.adminAssignAccount}</h3>
              <p className="text-sm mb-4">
                {assigning.name} — {t.adminExistingProfile} #{assigning.id}
              </p>
              <label className="block mb-2">
                {t.adminProviderEmailRequired}
              </label>
              <input
                type="email"
                required
                value={assignEmail}
                onChange={(e) => setAssignEmail(e.target.value)}
                className="border rounded-xl p-3 w-full text-black"
                placeholder="doctor@example.com"
              />
              <p className="text-xs text-gray-500 mt-2">
                {t.adminActivationHint}
              </p>
              <div className="flex gap-2 mt-5">
                <button
                  disabled={sendingId !== null || !assignEmail.trim()}
                  onClick={assignAccount}
                  className="cursor-pointer hover:brightness-90 active:brightness-75 transition-colors bg-teal-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {sendingId !== null ? t.adminSending : t.adminSendActivation}
                </button>
                <button
                  onClick={() => setAssigning(null)}
                  className="border px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
