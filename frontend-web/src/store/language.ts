import { create } from "zustand";
import { persist } from "zustand/middleware";
import { offlineWords } from "./offlineTranslations";

export type AppLanguage = "en" | "hi" | "mr";

interface LanguageState {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
}
export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (language) => set({ language }),
    }),
    { name: "panchayat-language" },
  ),
);

export const words: Record<string, Record<AppLanguage, string>> = {
  Home: { en: "Home", hi: "होम", mr: "मुख्यपृष्ठ" },
  Assistant: { en: "Assistant", hi: "सहायक", mr: "सहाय्यक" },
  Help: { en: "Help", hi: "शिकायतें", mr: "तक्रारी" },
  Dues: { en: "Dues", hi: "बकाया", mr: "देयके" },
  Notices: { en: "Notices", hi: "सूचनाएं", mr: "सूचना" },
  Gate: { en: "Gate", hi: "गेट", mr: "प्रवेशद्वार" },
  People: { en: "People", hi: "लोग", mr: "लोक" },
  Admin: { en: "Admin", hi: "प्रशासन", mr: "प्रशासन" },
  Connected: { en: "Connected", hi: "कनेक्टेड", mr: "जोडलेले" },
  "Ask Panchayat": {
    en: "Ask Panchayat",
    hi: "पंचायत से पूछें",
    mr: "पंचायतीला विचारा",
  },
  "Speak or type. Panchayat can check records and complete approved tasks for you.":
    {
      en: "Speak or type. Panchayat can check records and complete approved tasks for you.",
      hi: "बोलें या लिखें। पंचायत रिकॉर्ड देखकर आपके लिए स्वीकृत काम पूरा कर सकती है।",
      mr: "बोला किंवा लिहा. पंचायत नोंदी तपासून तुमच्यासाठी मंजूर कामे पूर्ण करू शकते.",
    },
  "Your society dues": {
    en: "Your society dues",
    hi: "आपका सोसायटी बकाया",
    mr: "तुमची सोसायटी देयके",
  },
  "Monthly billing": {
    en: "Monthly billing",
    hi: "मासिक बिलिंग",
    mr: "मासिक बिलिंग",
  },
  "Notice Board": { en: "Notice Board", hi: "सूचना पट्ट", mr: "सूचना फलक" },
  "Admin Console": {
    en: "Admin Console",
    hi: "प्रशासन केंद्र",
    mr: "प्रशासन केंद्र",
  },
  "Pay all dues": {
    en: "Pay all dues",
    hi: "सभी बकाया भरें",
    mr: "सर्व देयके भरा",
  },
  "Demo payment": { en: "Demo payment", hi: "डेमो भुगतान", mr: "डेमो पेमेंट" },
  "Create monthly maintenance": {
    en: "Create monthly maintenance",
    hi: "मासिक रखरखाव बनाएं",
    mr: "मासिक देखभाल तयार करा",
  },
  "New notice": { en: "New notice", hi: "नई सूचना", mr: "नवीन सूचना" },
  "Sign out": { en: "Sign out", hi: "साइन आउट", mr: "साइन आउट" },
  "Say it. We’ll help get it done.": {
    en: "Say it. We’ll help get it done.",
    hi: "बस बताइए। हम काम पूरा करने में मदद करेंगे।",
    mr: "फक्त सांगा. आम्ही काम पूर्ण करण्यात मदत करू.",
  },
  "What would you like the Panchayat to do?": {
    en: "What would you like the Panchayat to do?",
    hi: "आप पंचायत से क्या करवाना चाहते हैं?",
    mr: "पंचायतीने तुमच्यासाठी काय करावे?",
  },
  "I prefer typing": {
    en: "I prefer typing",
    hi: "मैं लिखना चाहता हूँ",
    mr: "मी लिहिणे पसंत करतो",
  },
  "Active complaints": {
    en: "Active complaints",
    hi: "सक्रिय शिकायतें",
    mr: "सक्रिय तक्रारी",
  },
  "Maintenance due": {
    en: "Maintenance due",
    hi: "रखरखाव बकाया",
    mr: "देखभाल देय",
  },
  "Visitors inside": {
    en: "Visitors inside",
    hi: "अंदर आए मेहमान",
    mr: "आतील पाहुणे",
  },
  "Prefer doing it yourself?": {
    en: "Prefer doing it yourself?",
    hi: "खुद करना चाहते हैं?",
    mr: "स्वतः करायचे आहे?",
  },
  "Report a problem": {
    en: "Report a problem",
    hi: "समस्या दर्ज करें",
    mr: "समस्या नोंदवा",
  },
  "Check bills": { en: "Check bills", hi: "बकाया देखें", mr: "देयके पहा" },
  "Allow a visitor": {
    en: "Allow a visitor",
    hi: "मेहमान को अनुमति दें",
    mr: "पाहुण्याला परवानगी द्या",
  },
  "Read notices": { en: "Read notices", hi: "सूचनाएं पढ़ें", mr: "सूचना वाचा" },
  "Total to pay": { en: "Total to pay", hi: "कुल भुगतान", mr: "एकूण देय" },
  "Unpaid months": { en: "Unpaid months", hi: "बकाया महीने", mr: "थकीत महिने" },
  "Paid bills": { en: "Paid bills", hi: "भुगतान किए बिल", mr: "भरलेली देयके" },
  "Combined outstanding": {
    en: "Combined outstanding",
    hi: "कुल बकाया",
    mr: "एकत्रित थकबाकी",
  },
  "Months included": {
    en: "Months included",
    hi: "शामिल महीने",
    mr: "समाविष्ट महिने",
  },
  "Payment history": {
    en: "Payment history",
    hi: "भुगतान इतिहास",
    mr: "पेमेंट इतिहास",
  },
  "Know who is at the gate": {
    en: "Know who is at the gate",
    hi: "जानें गेट पर कौन है",
    mr: "प्रवेशद्वारावर कोण आहे ते पहा",
  },
  "Create gate pass": {
    en: "Create gate pass",
    hi: "गेट पास बनाएं",
    mr: "गेट पास तयार करा",
  },
  "Inside now": { en: "Inside now", hi: "अभी अंदर", mr: "सध्या आत" },
  "Awaiting approval": {
    en: "Awaiting approval",
    hi: "स्वीकृति की प्रतीक्षा",
    mr: "मंजुरीची प्रतीक्षा",
  },
  "Your community, clearly organized": {
    en: "Your community, clearly organized",
    hi: "आपका समुदाय, स्पष्ट रूप से व्यवस्थित",
    mr: "तुमचा समुदाय, स्पष्टपणे आयोजित",
  },
  Residents: { en: "Residents", hi: "निवासी", mr: "रहिवासी" },
  Committee: { en: "Committee", hi: "समिति", mr: "समिती" },
  Security: { en: "Security", hi: "सुरक्षा", mr: "सुरक्षा" },
  Administrators: { en: "Administrators", hi: "प्रशासक", mr: "प्रशासक" },
  "Complaint control room": {
    en: "Complaint control room",
    hi: "शिकायत नियंत्रण कक्ष",
    mr: "तक्रार नियंत्रण कक्ष",
  },
  "Problems, clearly tracked": {
    en: "Problems, clearly tracked",
    hi: "समस्याओं की स्पष्ट जानकारी",
    mr: "समस्यांचा स्पष्ट मागोवा",
  },
  "Tell the assistant": {
    en: "Tell the assistant",
    hi: "सहायक को बताएं",
    mr: "सहाय्यकाला सांगा",
  },
  Active: { en: "Active", hi: "सक्रिय", mr: "सक्रिय" },
  History: { en: "History", hi: "इतिहास", mr: "इतिहास" },
  "Request to join": {
    en: "Request to join",
    hi: "जुड़ने का अनुरोध",
    mr: "सामील होण्याची विनंती",
  },
  "Full name": { en: "Full name", hi: "पूरा नाम", mr: "पूर्ण नाव" },
  "Date of birth": { en: "Date of birth", hi: "जन्म तिथि", mr: "जन्मतारीख" },
  Society: { en: "Society", hi: "सोसायटी", mr: "सोसायटी" },
  Building: { en: "Building", hi: "इमारत", mr: "इमारत" },
  "Flat number": { en: "Flat number", hi: "फ्लैट नंबर", mr: "फ्लॅट क्रमांक" },
  Email: { en: "Email", hi: "ईमेल", mr: "ईमेल" },
  "Phone number": { en: "Phone number", hi: "फोन नंबर", mr: "फोन नंबर" },
  "COMMUNITY DESK": {
    en: "COMMUNITY DESK",
    hi: "सामुदायिक सेवा",
    mr: "समुदाय सेवा",
  },
  "IMPORTANT NOTICE": {
    en: "IMPORTANT NOTICE",
    hi: "महत्वपूर्ण सूचना",
    mr: "महत्त्वाची सूचना",
  },
  "View notice": { en: "View notice", hi: "सूचना देखें", mr: "सूचना पहा" },
  "Read important notice aloud": {
    en: "Read important notice aloud",
    hi: "महत्वपूर्ण सूचना सुनें",
    mr: "महत्त्वाची सूचना ऐका",
  },
  "Private • Permission checked": {
    en: "Private • Permission checked",
    hi: "निजी • अनुमति जांची गई",
    mr: "खाजगी • परवानगी तपासली",
  },
  "No forms. No department names. Explain the problem in Hindi, Marathi, Gujarati, or English.":
    {
      en: "No forms. No department names. Explain the problem in Hindi, Marathi, Gujarati, or English.",
      hi: "कोई फॉर्म नहीं। बस हिंदी, मराठी, गुजराती या अंग्रेजी में समस्या बताएं।",
      mr: "फॉर्मची गरज नाही. हिंदी, मराठी, गुजराती किंवा इंग्रजीत समस्या सांगा.",
    },
  "Start talking to Panchayat": {
    en: "Start talking to Panchayat",
    hi: "पंचायत से बोलें",
    mr: "पंचायतीशी बोला",
  },
  Speak: { en: "Speak", hi: "बोलें", mr: "बोला" },
  "Talk to a person": {
    en: "Talk to a person",
    hi: "किसी व्यक्ति से बात करें",
    mr: "व्यक्तीशी बोला",
  },
  "STAY INFORMED": {
    en: "STAY INFORMED",
    hi: "जानकारी रखें",
    mr: "माहिती मिळवा",
  },
  "All official updates in one place": {
    en: "All official updates in one place",
    hi: "सभी आधिकारिक सूचनाएं एक जगह",
    mr: "सर्व अधिकृत सूचना एकाच ठिकाणी",
  },
  "See all notices": {
    en: "See all notices",
    hi: "सभी सूचनाएं देखें",
    mr: "सर्व सूचना पहा",
  },
  "MANUAL SERVICES": {
    en: "MANUAL SERVICES",
    hi: "मैनुअल सेवाएं",
    mr: "मॅन्युअल सेवा",
  },
  "Every AI action has a manual fallback.": {
    en: "Every AI action has a manual fallback.",
    hi: "हर AI काम का मैनुअल विकल्प उपलब्ध है।",
    mr: "प्रत्येक AI कामासाठी मॅन्युअल पर्याय उपलब्ध आहे.",
  },
  "Water, road, light, waste, or safety": {
    en: "Water, road, light, waste, or safety",
    hi: "पानी, सड़क, बिजली, कचरा या सुरक्षा",
    mr: "पाणी, रस्ता, वीज, कचरा किंवा सुरक्षा",
  },
  "See dues, dates, and receipts": {
    en: "See dues, dates, and receipts",
    hi: "बकाया, तारीख और रसीद देखें",
    mr: "देयके, तारखा आणि पावत्या पहा",
  },
  "Create or cancel gate access": {
    en: "Create or cancel gate access",
    hi: "गेट अनुमति बनाएं या रद्द करें",
    mr: "गेट परवानगी तयार करा किंवा रद्द करा",
  },
  "Official source and simple explanation": {
    en: "Official source and simple explanation",
    hi: "आधिकारिक सूचना और सरल जानकारी",
    mr: "अधिकृत सूचना आणि सोपे स्पष्टीकरण",
  },
};

Object.assign(words, offlineWords);

export function useI18n() {
  const language = useLanguageStore((state) => state.language);
  return { language, t: (text: string) => words[text]?.[language] ?? text };
}
