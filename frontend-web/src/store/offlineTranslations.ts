export type OfflineEntry = { en: string; hi: string; mr: string };

const entry = (en: string, hi: string, mr: string): OfflineEntry => ({
  en,
  hi,
  mr,
});

// Reviewed, bundled interface copy. This file is shipped with the app and
// never calls a translation API, so changing language is immediate.
export const offlineWords: Record<string, OfflineEntry> = {
  Cancel: entry("Cancel", "रद्द करें", "रद्द करा"),
  Close: entry("Close", "बंद करें", "बंद करा"),
  Confirm: entry("Confirm", "पुष्टि करें", "पुष्टी करा"),
  Continue: entry("Continue", "आगे बढ़ें", "पुढे जा"),
  Save: entry("Save", "सहेजें", "जतन करा"),
  Search: entry("Search", "खोजें", "शोधा"),
  Loading: entry("Loading", "लोड हो रहा है", "लोड होत आहे"),
  Important: entry("Important", "महत्वपूर्ण", "महत्त्वाचे"),
  Listen: entry("Listen", "सुनें", "ऐका"),
  "View progress": entry("View progress", "प्रगति देखें", "प्रगती पहा"),
  "Report manually": entry(
    "Report manually",
    "खुद शिकायत करें",
    "स्वतः तक्रार नोंदवा",
  ),
  "Nothing here right now": entry(
    "Nothing here right now",
    "अभी यहाँ कुछ नहीं है",
    "सध्या येथे काही नाही",
  ),
  "Complaints and their progress will appear here.": entry(
    "Complaints and their progress will appear here.",
    "शिकायतें और उनकी प्रगति यहाँ दिखाई देंगी।",
    "तक्रारी आणि त्यांची प्रगती येथे दिसेल.",
  ),
  "See who reported every issue, make a clear decision, and leave a complete progress trail.":
    entry(
      "See who reported every issue, make a clear decision, and leave a complete progress trail.",
      "हर समस्या किसने बताई यह देखें, निर्णय लें और पूरी प्रगति दर्ज रखें।",
      "प्रत्येक समस्या कोणी नोंदवली ते पहा, निर्णय घ्या आणि संपूर्ण प्रगती नोंदवा.",
    ),
  "Report a problem in simple words, then follow every update until it is resolved.":
    entry(
      "Report a problem in simple words, then follow every update until it is resolved.",
      "सरल शब्दों में समस्या बताएं और समाधान तक हर अपडेट देखें।",
      "सोप्या शब्दांत समस्या सांगा आणि निराकरण होईपर्यंत प्रत्येक अपडेट पहा.",
    ),
  Progress: entry("Progress", "प्रगति", "प्रगती"),
  Decision: entry("Decision", "निर्णय", "निर्णय"),
  "In progress": entry("In progress", "काम जारी", "काम सुरू"),
  Resolve: entry("Resolve", "समाधान करें", "निराकरण करा"),
  Reject: entry("Reject", "अस्वीकार करें", "नाकारा"),
  "Withdraw complaint": entry(
    "Withdraw complaint",
    "शिकायत वापस लें",
    "तक्रार मागे घ्या",
  ),
  "Reason or work note": entry(
    "Reason or work note",
    "कारण या काम की जानकारी",
    "कारण किंवा कामाची नोंद",
  ),
  Title: entry("Title", "शीर्षक", "शीर्षक"),
  Description: entry("Description", "विवरण", "वर्णन"),
  Priority: entry("Priority", "प्राथमिकता", "प्राधान्य"),
  "Submit complaint": entry(
    "Submit complaint",
    "शिकायत जमा करें",
    "तक्रार नोंदवा",
  ),
  "Set one maintenance amount once and bill every verified resident automatically.":
    entry(
      "Set one maintenance amount once and bill every verified resident automatically.",
      "एक बार रखरखाव राशि तय करें और हर सत्यापित निवासी को अपने आप बिल भेजें।",
      "देखभाल रक्कम एकदा ठरवा आणि प्रत्येक सत्यापित रहिवाशाला आपोआप बिल पाठवा.",
    ),
  "Older unpaid months are combined so you can clear everything in one payment.":
    entry(
      "Older unpaid months are combined so you can clear everything in one payment.",
      "पुराने बकाया महीनों को जोड़कर एक भुगतान में चुकाएं।",
      "मागील थकीत महिने एकत्र करून एकाच पेमेंटमध्ये भरा.",
    ),
  "Society outstanding": entry(
    "Society outstanding",
    "सोसायटी का कुल बकाया",
    "सोसायटीची एकूण थकबाकी",
  ),
  "Unpaid resident bills": entry(
    "Unpaid resident bills",
    "निवासियों के बकाया बिल",
    "रहिवाशांची थकीत देयके",
  ),
  "Resident collection status": entry(
    "Resident collection status",
    "निवासी भुगतान स्थिति",
    "रहिवासी वसुली स्थिती",
  ),
  "Pay with demo checkout": entry(
    "Pay with demo checkout",
    "डेमो से भुगतान करें",
    "डेमोने पेमेंट करा",
  ),
  "Pay all securely": entry(
    "Pay all securely",
    "सभी सुरक्षित रूप से भरें",
    "सर्व सुरक्षितपणे भरा",
  ),
  "Nothing is due": entry(
    "Nothing is due",
    "कोई बकाया नहीं",
    "काहीही थकीत नाही",
  ),
  "Your maintenance account is fully paid.": entry(
    "Your maintenance account is fully paid.",
    "आपका रखरखाव खाता पूरी तरह चुका दिया गया है।",
    "तुमचे देखभाल खाते पूर्ण भरले आहे.",
  ),
  "No maintenance records yet": entry(
    "No maintenance records yet",
    "अभी कोई रखरखाव रिकॉर्ड नहीं",
    "अद्याप देखभाल नोंदी नाहीत",
  ),
  "The monthly maintenance charge will appear here after an administrator publishes it.":
    entry(
      "The monthly maintenance charge will appear here after an administrator publishes it.",
      "प्रशासक द्वारा जारी करने के बाद मासिक रखरखाव यहाँ दिखेगा।",
      "प्रशासकाने जारी केल्यानंतर मासिक देखभाल येथे दिसेल.",
    ),
  "Create maintenance for everyone": entry(
    "Create maintenance for everyone",
    "सभी के लिए रखरखाव बिल बनाएं",
    "सर्वांसाठी देखभाल देयक तयार करा",
  ),
  "One amount is sent to every approved resident with a linked flat. A month can only be billed once.":
    entry(
      "One amount is sent to every approved resident with a linked flat. A month can only be billed once.",
      "एक राशि हर स्वीकृत और फ्लैट से जुड़े निवासी को भेजी जाती है। एक महीने का बिल केवल एक बार बन सकता है।",
      "एक रक्कम प्रत्येक मंजूर आणि फ्लॅटशी जोडलेल्या रहिवाशाला पाठवली जाते. एका महिन्याचे देयक फक्त एकदाच बनू शकते.",
    ),
  Year: entry("Year", "वर्ष", "वर्ष"),
  Month: entry("Month", "महीना", "महिना"),
  "Maintenance amount per resident": entry(
    "Maintenance amount per resident",
    "प्रति निवासी रखरखाव राशि",
    "प्रति रहिवासी देखभाल रक्कम",
  ),
  "Due date": entry("Due date", "अंतिम तारीख", "देय तारीख"),
  "Bill every resident": entry(
    "Bill every resident",
    "हर निवासी को बिल भेजें",
    "प्रत्येक रहिवाशाला बिल पाठवा",
  ),
  "This month has already been billed. Choose another month.": entry(
    "This month has already been billed. Choose another month.",
    "इस महीने का बिल पहले ही बनाया जा चुका है। दूसरा महीना चुनें।",
    "या महिन्याचे देयक आधीच तयार झाले आहे. दुसरा महिना निवडा.",
  ),
  "Payment history": entry("Payment history", "भुगतान इतिहास", "पेमेंट इतिहास"),
  Receipt: entry("Receipt", "रसीद", "पावती"),
  "Panchayat Agent": entry("Panchayat Agent", "पंचायत सहायक", "पंचायत सहाय्यक"),
  "Can read records and complete confirmed tasks": entry(
    "Can read records and complete confirmed tasks",
    "रिकॉर्ड पढ़कर पुष्टि किए काम पूरे कर सकता है",
    "नोंदी वाचून पुष्टी केलेली कामे पूर्ण करू शकतो",
  ),
  "Working on your request…": entry(
    "Working on your request…",
    "आपके अनुरोध पर काम हो रहा है…",
    "तुमच्या विनंतीवर काम सुरू आहे…",
  ),
  "Tell Panchayat what you need…": entry(
    "Tell Panchayat what you need…",
    "पंचायत को अपना काम बताएं…",
    "पंचायतीला तुमचे काम सांगा…",
  ),
  "Moving bars mean your voice is being heard. Tap stop when finished.": entry(
    "Moving bars mean your voice is being heard. Tap stop when finished.",
    "चलती तरंगें बताती हैं कि आपकी आवाज सुनाई दे रही है। बोलने के बाद रोकें।",
    "हलणाऱ्या लहरी तुमचा आवाज ऐकू येत असल्याचे दाखवतात. बोलून झाल्यावर थांबवा.",
  ),
  Listening: entry("Listening", "सुन रहा है", "ऐकत आहे"),
  "Tap when finished": entry(
    "Tap when finished",
    "बोलने के बाद दबाएं",
    "बोलून झाल्यावर दाबा",
  ),
  "New notice": entry("New notice", "नई सूचना", "नवीन सूचना"),
  "Publish notice": entry(
    "Publish notice",
    "सूचना प्रकाशित करें",
    "सूचना प्रसिद्ध करा",
  ),
  "No notices match this view.": entry(
    "No notices match this view.",
    "इस दृश्य में कोई सूचना नहीं मिली।",
    "या दृश्यात कोणतीही सूचना नाही.",
  ),
  "All notices": entry("All notices", "सभी सूचनाएं", "सर्व सूचना"),
  Pinned: entry("Pinned", "महत्वपूर्ण", "महत्त्वाच्या"),
  Audience: entry("Audience", "किसके लिए", "कोणासाठी"),
  "Expiry date": entry("Expiry date", "समाप्ति तारीख", "समाप्ती तारीख"),
  "Visitor name": entry("Visitor name", "आगंतुक का नाम", "पाहुण्याचे नाव"),
  Purpose: entry("Purpose", "आने का कारण", "येण्याचे कारण"),
  "Vehicle number": entry("Vehicle number", "वाहन नंबर", "वाहन क्रमांक"),
  "Check in": entry("Check in", "प्रवेश दर्ज करें", "प्रवेश नोंदवा"),
  "Check out": entry("Check out", "बाहर जाना दर्ज करें", "बाहेर जाणे नोंदवा"),
  "Pending approval": entry("Pending approval", "स्वीकृति बाकी", "मंजुरी बाकी"),
  "Resident directory": entry(
    "Resident directory",
    "निवासी सूची",
    "रहिवासी सूची",
  ),
  "Manage roles": entry("Manage roles", "भूमिकाएं बदलें", "भूमिका बदला"),
  "Role management": entry(
    "Role management",
    "भूमिका प्रबंधन",
    "भूमिका व्यवस्थापन",
  ),
  "Add role": entry("Add role", "भूमिका जोड़ें", "भूमिका जोडा"),
  "Remove role": entry("Remove role", "भूमिका हटाएं", "भूमिका काढा"),
  "Request sent": entry("Request sent", "अनुरोध भेजा गया", "विनंती पाठवली"),
  "We’ll check your membership.": entry(
    "We’ll check your membership.",
    "हम आपकी सदस्यता की जाँच करेंगे।",
    "आम्ही तुमचे सदस्यत्व तपासू.",
  ),
  "Back to sign in": entry(
    "Back to sign in",
    "साइन इन पर वापस जाएं",
    "साइन इनवर परत जा",
  ),
  "Create password": entry(
    "Create password",
    "पासवर्ड बनाएं",
    "पासवर्ड तयार करा",
  ),
  "Already approved? Sign in": entry(
    "Already approved? Sign in",
    "पहले से स्वीकृत हैं? साइन इन करें",
    "आधीच मंजूर आहात? साइन इन करा",
  ),
  "Sign in": entry("Sign in", "साइन इन करें", "साइन इन करा"),
  Password: entry("Password", "पासवर्ड", "पासवर्ड"),
  "Email or registered ID": entry(
    "Email or registered ID",
    "ईमेल या पंजीकृत आईडी",
    "ईमेल किंवा नोंदणीकृत आयडी",
  ),
  "Open menu": entry("Open menu", "मेनू खोलें", "मेनू उघडा"),
  "Switch theme": entry("Switch theme", "रंग रूप बदलें", "रंगरूप बदला"),
  January: entry("January", "जनवरी", "जानेवारी"),
  February: entry("February", "फरवरी", "फेब्रुवारी"),
  March: entry("March", "मार्च", "मार्च"),
  April: entry("April", "अप्रैल", "एप्रिल"),
  May: entry("May", "मई", "मे"),
  June: entry("June", "जून", "जून"),
  July: entry("July", "जुलाई", "जुलै"),
  August: entry("August", "अगस्त", "ऑगस्ट"),
  September: entry("September", "सितंबर", "सप्टेंबर"),
  October: entry("October", "अक्टूबर", "ऑक्टोबर"),
  November: entry("November", "नवंबर", "नोव्हेंबर"),
  December: entry("December", "दिसंबर", "डिसेंबर"),
  Clear: entry("Clear", "कोई बकाया नहीं", "थकबाकी नाही"),
  "Show password": entry("Show password", "पासवर्ड दिखाएं", "पासवर्ड दाखवा"),
  "Change theme": entry("Change theme", "रंग रूप बदलें", "रंगरूप बदला"),
  "Made for every resident": entry(
    "Made for every resident",
    "हर निवासी के लिए",
    "प्रत्येक रहिवाशासाठी",
  ),
  "Voice first": entry("Voice first", "आवाज से आसान", "आवाजाने सोपे"),
  "4 languages": entry("4 languages", "4 भाषाएं", "4 भाषा"),
  "Human fallback": entry("Human fallback", "मानवीय सहायता", "मानवी मदत"),
  "WELCOME BACK": entry(
    "WELCOME BACK",
    "फिर से स्वागत है",
    "पुन्हा स्वागत आहे",
  ),
  "Enter your community": entry(
    "Enter your community",
    "अपनी सोसायटी में प्रवेश करें",
    "तुमच्या सोसायटीत प्रवेश करा",
  ),
  "Use your approved society account to sign in.": entry(
    "Use your approved society account to sign in.",
    "अपने स्वीकृत सोसायटी खाते से साइन इन करें।",
    "तुमच्या मंजूर सोसायटी खात्याने साइन इन करा.",
  ),
  "Your registered mobile login will be supported when OTP is configured.":
    entry(
      "Your registered mobile login will be supported when OTP is configured.",
      "OTP शुरू होने पर पंजीकृत मोबाइल से लॉगिन उपलब्ध होगा।",
      "OTP सुरू झाल्यावर नोंदणीकृत मोबाइलने लॉगिन उपलब्ध होईल.",
    ),
  "Read response aloud": entry(
    "Read response aloud",
    "जवाब सुनें",
    "उत्तर ऐका",
  ),
  "Start voice request": entry(
    "Start voice request",
    "बोलना शुरू करें",
    "बोलणे सुरू करा",
  ),
  "Stop recording": entry(
    "Stop recording",
    "रिकॉर्डिंग रोकें",
    "रेकॉर्डिंग थांबवा",
  ),
  "Send message": entry("Send message", "संदेश भेजें", "संदेश पाठवा"),
  "Water supply shutdown — Sunday": entry(
    "Water supply shutdown — Sunday",
    "पानी की आपूर्ति बंद — रविवार",
    "पाणीपुरवठा बंद — रविवार",
  ),
  "Water supply will be unavailable 9 AM to 1 PM this Sunday for tank cleaning.":
    entry(
      "Water supply will be unavailable 9 AM to 1 PM this Sunday for tank cleaning.",
      "टंकी की सफाई के लिए इस रविवार सुबह 9 से दोपहर 1 बजे तक पानी बंद रहेगा।",
      "टाकी साफ करण्यासाठी या रविवारी सकाळी 9 ते दुपारी 1 पर्यंत पाणी बंद राहील.",
    ),
  "Annual general meeting": entry(
    "Annual general meeting",
    "वार्षिक आम बैठक",
    "वार्षिक सर्वसाधारण सभा",
  ),
  "AGM scheduled for 25th at the clubhouse. Attendance is appreciated.": entry(
    "AGM scheduled for 25th at the clubhouse. Attendance is appreciated.",
    "AGM 25 तारीख को क्लब हाउस में होगी। कृपया उपस्थित रहें।",
    "AGM 25 तारखेला क्लब हाऊसमध्ये होईल. कृपया उपस्थित रहा.",
  ),
};
