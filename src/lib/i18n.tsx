import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "hi";

const STORAGE_KEY = "pineev-lang";

const DICT = {
  en: {
    "nav.home": "Home",
    "nav.discover": "Discover",
    "nav.host": "Host",
    "nav.account": "Account",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.cta": "Find a charger",
    "nav.signin": "Sign in",
    "nav.signout": "Sign out",

    "hero.badge": "Plug. Infrastructure. Network. Energy.",
    "hero.title": "Charge anywhere, with a Sathi nearby",
    "hero.sub":
      "PineEV connects EV drivers with verified homes, hotels and businesses hosting chargers across India. Find it. Reserve it. Charge it.",
    "hero.primary": "Find a charger",
    "hero.secondary": "Become a host",

    "how.title": "How PineEV works",
    "how.sub": "Four steps from search to a full battery.",
    "how.1.title": "Discover nearby",
    "how.1.body": "See live chargers around you with real availability.",
    "how.2.title": "Reserve a slot",
    "how.2.body": "Pick a date and time window that fits your trip.",
    "how.3.title": "Plug in",
    "how.3.body": "Start the session and watch energy flow live.",
    "how.4.title": "Pay simply",
    "how.4.body": "Transparent per-kWh pricing with instant receipts.",

    "preview.title": "Chargers near you",
    "preview.sub": "A glimpse of the PineEV network.",
    "preview.all": "View all chargers",

    "host.title": "Turn your parking into income",
    "host.body":
      "List your driveway, hotel bay or office parking. Set your price, keep control of your hours, and get paid for every kWh.",
    "host.cta": "Start hosting",
    "host.earnings": "This month",
    "host.sessions": "Sessions",
    "host.energy": "Energy delivered",

    "trust.title": "Built for Indian roads",
    "trust.1.title": "Every connector",
    "trust.1.body": "CCS2, Type 2, Bharat AC and DC — filtered to your car.",
    "trust.2.title": "Safe payments",
    "trust.2.body": "UPI and cards with itemised receipts on every session.",
    "trust.3.title": "Your language",
    "trust.3.body": "Full Hindi and English interface, switch any time.",

    "discover.title": "Discover chargers",
    "discover.search": "Search area, city or host",
    "discover.results": "chargers found",
    "discover.empty": "No chargers match these filters.",
    "discover.map": "Live network",

    "status.available": "Available",
    "status.charging": "Charging",
    "status.busy": "Busy",
    "status.offline": "Offline",

    "detail.book": "Book a slot",
    "detail.chargers": "Chargers",
    "detail.amenities": "Amenities",
    "detail.reviews": "Reviews",
    "detail.host": "Host",
    "detail.about": "About this place",
    "detail.directions": "Directions",

    "book.title": "Book a slot",
    "book.vehicle": "Your vehicle",
    "book.connector": "Connector",
    "book.date": "Date",
    "book.slot": "Time slot",
    "book.estimate": "Estimate",
    "book.energy": "Energy cap",
    "book.cost": "Energy cost",
    "book.fee": "Platform fee",
    "book.total": "Total",
    "book.confirm": "Confirm booking",
    "book.confirmed": "Booking confirmed",
    "book.start": "Start charging",
    "book.signin": "Sign in to book",

    "session.title": "Live session",
    "session.delivered": "Delivered",
    "session.elapsed": "Elapsed",
    "session.cost": "Running cost",
    "session.stop": "Stop charging",
    "session.done": "Session complete",
    "session.receipt": "Receipt",
    "session.home": "Back home",

    "account.title": "My account",
    "account.vehicles": "My vehicles",
    "account.history": "Booking history",
    "account.payments": "Payments",
    "account.reviews": "Reviews",
    "account.empty": "No bookings yet.",

    "hostpage.title": "Host dashboard",
    "hostpage.earnings": "Earnings",
    "hostpage.sessions": "Sessions",
    "hostpage.energy": "Energy",
    "hostpage.properties": "My properties",
    "hostpage.upcoming": "Upcoming reservations",
    "hostpage.empty": "No properties listed yet.",

    "common.perKwh": "per kWh",
    "common.away": "away",
    "common.back": "Back",
    "common.loading": "Loading…",
  },
  hi: {
    "nav.home": "होम",
    "nav.discover": "खोजें",
    "nav.host": "होस्ट",
    "nav.account": "खाता",
    "nav.about": "हमारे बारे में",
    "nav.contact": "संपर्क",
    "nav.cta": "चार्जर खोजें",
    "nav.signin": "साइन इन",
    "nav.signout": "साइन आउट",

    "hero.badge": "प्लग. इंफ्रास्ट्रक्चर. नेटवर्क. एनर्जी.",
    "hero.title": "कहीं भी चार्ज करें, आपका साथी पास है",
    "hero.sub":
      "PineEV भारत भर के सत्यापित घरों, होटलों और व्यवसायों के चार्जर को EV चालकों से जोड़ता है। खोजें. बुक करें. चार्ज करें.",
    "hero.primary": "चार्जर खोजें",
    "hero.secondary": "होस्ट बनें",

    "how.title": "PineEV कैसे काम करता है",
    "how.sub": "खोज से फुल बैटरी तक चार कदम।",
    "how.1.title": "आस-पास खोजें",
    "how.1.body": "अपने आस-पास लाइव चार्जर और उपलब्धता देखें।",
    "how.2.title": "स्लॉट बुक करें",
    "how.2.body": "अपनी यात्रा के अनुसार तारीख और समय चुनें।",
    "how.3.title": "प्लग इन करें",
    "how.3.body": "सेशन शुरू करें और ऊर्जा प्रवाह लाइव देखें।",
    "how.4.title": "आसान भुगतान",
    "how.4.body": "पारदर्शी प्रति-kWh दर और तुरंत रसीद।",

    "preview.title": "आपके पास के चार्जर",
    "preview.sub": "PineEV नेटवर्क की एक झलक।",
    "preview.all": "सभी चार्जर देखें",

    "host.title": "अपनी पार्किंग से कमाई करें",
    "host.body":
      "अपना ड्राइववे, होटल बे या ऑफिस पार्किंग लिस्ट करें। अपनी दर तय करें, समय पर नियंत्रण रखें और हर kWh पर कमाएँ।",
    "host.cta": "होस्टिंग शुरू करें",
    "host.earnings": "इस महीने",
    "host.sessions": "सेशन",
    "host.energy": "दी गई ऊर्जा",

    "trust.title": "भारतीय सड़कों के लिए बना",
    "trust.1.title": "हर कनेक्टर",
    "trust.1.body": "CCS2, Type 2, भारत AC और DC — आपकी कार के अनुसार।",
    "trust.2.title": "सुरक्षित भुगतान",
    "trust.2.body": "UPI और कार्ड, हर सेशन की पूरी रसीद।",
    "trust.3.title": "आपकी भाषा",
    "trust.3.body": "पूरा हिंदी और अंग्रेज़ी इंटरफ़ेस, कभी भी बदलें।",

    "discover.title": "चार्जर खोजें",
    "discover.search": "क्षेत्र, शहर या होस्ट खोजें",
    "discover.results": "चार्जर मिले",
    "discover.empty": "इन फ़िल्टर से कोई चार्जर नहीं मिला।",
    "discover.map": "लाइव नेटवर्क",

    "status.available": "उपलब्ध",
    "status.charging": "चार्जिंग",
    "status.busy": "व्यस्त",
    "status.offline": "ऑफ़लाइन",

    "detail.book": "स्लॉट बुक करें",
    "detail.chargers": "चार्जर",
    "detail.amenities": "सुविधाएँ",
    "detail.reviews": "समीक्षाएँ",
    "detail.host": "होस्ट",
    "detail.about": "इस जगह के बारे में",
    "detail.directions": "रास्ता",

    "book.title": "स्लॉट बुक करें",
    "book.vehicle": "आपकी गाड़ी",
    "book.connector": "कनेक्टर",
    "book.date": "तारीख",
    "book.slot": "समय स्लॉट",
    "book.estimate": "अनुमान",
    "book.energy": "ऊर्जा सीमा",
    "book.cost": "ऊर्जा शुल्क",
    "book.fee": "प्लेटफ़ॉर्म शुल्क",
    "book.total": "कुल",
    "book.confirm": "बुकिंग पक्की करें",
    "book.confirmed": "बुकिंग पक्की हो गई",
    "book.start": "चार्जिंग शुरू करें",
    "book.signin": "बुक करने के लिए साइन इन करें",

    "session.title": "लाइव सेशन",
    "session.delivered": "दी गई ऊर्जा",
    "session.elapsed": "बीता समय",
    "session.cost": "चालू खर्च",
    "session.stop": "चार्जिंग रोकें",
    "session.done": "सेशन पूरा",
    "session.receipt": "रसीद",
    "session.home": "होम पर जाएँ",

    "account.title": "मेरा खाता",
    "account.vehicles": "मेरी गाड़ियाँ",
    "account.history": "बुकिंग इतिहास",
    "account.payments": "भुगतान",
    "account.reviews": "समीक्षाएँ",
    "account.empty": "अभी कोई बुकिंग नहीं।",

    "hostpage.title": "होस्ट डैशबोर्ड",
    "hostpage.earnings": "कमाई",
    "hostpage.sessions": "सेशन",
    "hostpage.energy": "ऊर्जा",
    "hostpage.properties": "मेरी प्रॉपर्टी",
    "hostpage.upcoming": "आने वाली बुकिंग",
    "hostpage.empty": "अभी कोई प्रॉपर्टी नहीं।",

    "common.perKwh": "प्रति kWh",
    "common.away": "दूर",
    "common.back": "वापस",
    "common.loading": "लोड हो रहा है…",
  },
} as const;

export type TranslationKey = keyof (typeof DICT)["en"];

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "hi" || stored === "en") setLangState(stored);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang,
      toggleLang: () => setLang(lang === "en" ? "hi" : "en"),
      t: (key) => DICT[lang][key] ?? DICT.en[key] ?? key,
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
