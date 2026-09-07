import { createContext, useCallback, useContext, useEffect, useState } from 'react';

// Lightweight dashboard-only i18n. The language is chosen from the top-bar
// switcher and stored so it survives a reload.

const STORAGE_KEY = 'vedikshaya_dash_lang';
export const LANGS = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
];

const STRINGS = {
  // phases
  'phase.soaking': { en: 'Soaking', hi: 'भिगोना', ta: 'ஊறவைத்தல்' },
  'phase.boil': { en: 'Boiling', hi: 'उबालना', ta: 'கொதிநிலை' },
  'phase.stirring': { en: 'Stirring', hi: 'मथना', ta: 'கிளறுதல்' },
  'phase.dispense': { en: 'Dispensing', hi: 'वितरण', ta: 'வழங்குதல்' },

  // hero
  'timer.remaining': { en: 'time remaining', hi: 'शेष समय', ta: 'மீதமுள்ள நேரம்' },
  'timer.pressStart': { en: 'press start', hi: 'शुरू करें', ta: 'தொடங்கவும்' },
  'timer.complete': { en: 'complete', hi: 'पूर्ण', ta: 'முடிந்தது' },
  'btn.start': { en: 'Start Brew', hi: 'काढ़ा शुरू करें', ta: 'காய்ச்சலைத் தொடங்கு' },
  'btn.reset': { en: 'Reset', hi: 'रीसेट करें', ta: 'மீட்டமை' },
  'hero.subIdle': {
    en: 'Ready to begin — press Start Brew',
    hi: 'शुरू करने के लिए तैयार — “काढ़ा शुरू करें” दबाएँ',
    ta: 'தொடங்கத் தயார் — “காய்ச்சலைத் தொடங்கு” அழுத்தவும்',
  },
  'hero.subSoak': {
    en: 'Soaking the roots — drawing out the actives',
    hi: 'जड़ें भिगो रहे हैं — सक्रिय तत्व निकल रहे हैं',
    ta: 'வேர்களை ஊறவைக்கிறது — சத்துக்கள் வெளியேறுகின்றன',
  },
  'hero.subBoil': {
    en: 'Rolling simmer — holding {t}°C',
    hi: 'मंद उबाल — {t}°C पर स्थिर',
    ta: 'மெதுவான கொதிநிலை — {t}°C இல் நிலைத்து',
  },
  'hero.subStir': {
    en: 'Stirring phase — temperature holding at {t}°C',
    hi: 'मथने का चरण — तापमान {t}°C पर स्थिर',
    ta: 'கிளறும் நிலை — வெப்பநிலை {t}°C இல் நிலையாக',
  },
  'hero.subDispense': {
    en: 'Reducing to final volume — almost ready',
    hi: 'अंतिम मात्रा तक घटा रहे हैं — लगभग तैयार',
    ta: 'இறுதி அளவுக்குச் சுருக்குகிறது — கிட்டத்தட்ட தயார்',
  },
  'hero.subDone': {
    en: 'Brew complete — {ml} mL decoction ready',
    hi: 'काढ़ा तैयार — {ml} mL काढ़ा तैयार है',
    ta: 'காய்ச்சல் முடிந்தது — {ml} mL கஷாயம் தயார்',
  },

  // top stats
  'stats.brewPhase': { en: 'Brew Phase', hi: 'काढ़ा चरण', ta: 'காய்ச்சல் நிலை' },
  'stats.stirIntensity': { en: 'Stir Intensity', hi: 'मथन तीव्रता', ta: 'கிளறல் தீவிரம்' },
  'stats.elapsed': { en: 'Elapsed', hi: 'बीता समय', ta: 'கடந்த நேரம்' },
  'stats.active': { en: 'Active · running', hi: 'सक्रिय · चालू', ta: 'செயலில் · இயங்குகிறது' },
  'stats.idleState': { en: 'Idle · not started', hi: 'निष्क्रिय · शुरू नहीं', ta: 'செயலற்ற · தொடங்கவில்லை' },
  'stats.doneState': { en: 'Done · dispensed', hi: 'पूर्ण · वितरित', ta: 'முடிந்தது · வழங்கப்பட்டது' },
  'stats.speed': { en: 'speed', hi: 'गति', ta: 'வேகம்' },
  'stats.of': { en: 'of', hi: 'में से', ta: 'இல்' },
  'stats.notStarted': { en: 'Not started', hi: 'शुरू नहीं हुआ', ta: 'தொடங்கவில்லை' },

  // cards
  'card.temperature': { en: 'Temperature', hi: 'तापमान', ta: 'வெப்பநிலை' },
  'card.waterLevel': { en: 'Water Level', hi: 'जल स्तर', ta: 'நீர் மட்டம்' },
  'card.consistency': { en: 'Brew Consistency Score', hi: 'काढ़ा संगति स्कोर', ta: 'காய்ச்சல் நிலைத்தன்மை மதிப்பெண்' },
  'temp.optimal': { en: 'Optimal', hi: 'उपयुक्त', ta: 'உகந்தது' },
  'temp.low': { en: 'Low', hi: 'कम', ta: 'குறைவு' },
  'temp.high': { en: 'High', hi: 'अधिक', ta: 'அதிகம்' },
  'temp.holding': { en: 'holding', hi: 'स्थिर', ta: 'நிலையாக' },
  'temp.targetRange': { en: 'Target range', hi: 'लक्ष्य सीमा', ta: 'இலக்கு வரம்பு' },
  'water.evap': { en: 'Reducing', hi: 'घट रहा है', ta: 'சுருங்குகிறது' },
  'water.ready': { en: 'Ready', hi: 'तैयार', ta: 'தயார்' },
  'water.done': { en: 'Reduced 4:1', hi: 'घटाव 4:1', ta: 'சுருக்கம் 4:1' },
  'water.remaining': { en: 'remaining', hi: 'शेष', ta: 'மீதம்' },
  'ring.afi': { en: 'Matching AFI Specification', hi: 'AFI विनिर्देश के अनुरूप', ta: 'AFI விவரக்குறிப்புடன் பொருந்துகிறது' },
  'ring.cap': { en: 'Consistency Score', hi: 'संगति स्कोर', ta: 'நிலைத்தன்மை மதிப்பெண்' },
  'ring.building': { en: 'Extract building…', hi: 'सत्व बन रहा है…', ta: 'சாறு உருவாகிறது…' },

  // sidebar — current pod
  'pod.current': { en: 'Current Pod', hi: 'वर्तमान पॉड', ta: 'தற்போதைய பாட்' },
  'pod.afiCertified': { en: 'AFI Certified', hi: 'AFI प्रमाणित', ta: 'AFI சான்றளிக்கப்பட்டது' },
  'pod.ingredients': { en: 'Ingredients', hi: 'सामग्री', ta: 'பொருட்கள்' },
  'pod.roots': { en: 'roots', hi: 'जड़ें', ta: 'வேர்கள்' },
  'pod.drMode': { en: 'Dr. Mode', hi: 'डॉक्टर मोड', ta: 'மருத்துவர் பயன்முறை' },
  'pod.logout': { en: 'Log Out', hi: 'लॉग आउट', ta: 'வெளியேறு' },

  // sensors page
  'sensor.pageTitle': { en: 'Sensors', hi: 'सेंसर', ta: 'உணரிகள்' },
  'sensor.pageSub': {
    en: 'Live readings, updating with the brew.',
    hi: 'लाइव रीडिंग, काढ़े के साथ अपडेट होती हुई।',
    ta: 'நேரடி அளவீடுகள், காய்ச்சலுடன் புதுப்பிக்கப்படுகிறது.',
  },
  'sensor.humidity': { en: 'Ambient Humidity', hi: 'परिवेश आर्द्रता', ta: 'சுற்றுப்புற ஈரப்பதம்' },
  'sensor.pressure': { en: 'Vessel Pressure', hi: 'पात्र दाब', ta: 'பாத்திர அழுத்தம்' },
  'sensor.rpm': { en: 'Stirrer Speed', hi: 'मथनी गति', ta: 'கிளறி வேகம்' },
  'sensor.flow': { en: 'Flow Rate', hi: 'प्रवाह दर', ta: 'ஓட்ட விகிதம்' },

  // portal (doctor / patient)
  'pt.available': { en: 'Available', hi: 'उपलब्ध', ta: 'கிடைக்கிறது' },
  'pt.busy': { en: 'Busy', hi: 'व्यस्त', ta: 'பிஸியாக' },
  'pnav.patients': { en: 'Patients', hi: 'मरीज़', ta: 'நோயாளிகள்' },
  'pnav.brewMonitor': { en: 'Brew Monitor', hi: 'काढ़ा मॉनिटर', ta: 'காய்ச்சல் கண்காணிப்பு' },
  'pnav.chat': { en: 'Chat', hi: 'चैट', ta: 'அரட்டை' },
  'pnav.today': { en: 'Today', hi: 'आज', ta: 'இன்று' },
  'pnav.compliance': { en: 'Compliance', hi: 'अनुपालन', ta: 'இணக்கம்' },
  'pnav.prescription': { en: 'Prescription', hi: 'नुस्खा', ta: 'மருந்துச்சீட்டு' },
  'pnav.symptoms': { en: 'Symptoms', hi: 'लक्षण', ta: 'அறிகுறிகள்' },

  // sidebar — nav
  'nav.brewStatus': { en: 'Brew Status', hi: 'काढ़ा स्थिति', ta: 'காய்ச்சல் நிலை' },
  'nav.sensors': { en: 'Sensors', hi: 'सेंसर', ta: 'உணரிகள்' },
  'nav.assistant': { en: 'AI Assistant', hi: 'एआई सहायक', ta: 'AI உதவியாளர்' },
  'nav.history': { en: 'Brew History', hi: 'काढ़ा इतिहास', ta: 'காய்ச்சல் வரலாறு' },
};

const DashLangContext = createContext(null);

export function DashLangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const s = localStorage.getItem(STORAGE_KEY);
    return LANGS.some((l) => l.code === s) ? s : 'en';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const t = useCallback(
    (key, vars) => {
      const entry = STRINGS[key];
      let str = (entry && (entry[lang] ?? entry.en)) ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) str = str.replaceAll(`{${k}}`, String(v));
      }
      return str;
    },
    [lang],
  );

  return (
    <DashLangContext.Provider value={{ lang, setLang: setLangState, t }}>
      {children}
    </DashLangContext.Provider>
  );
}

export function useDashLang() {
  const ctx = useContext(DashLangContext);
  if (!ctx) throw new Error('useDashLang must be used within a DashLangProvider');
  return ctx;
}
