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

  // ---- portal: shared ----
  'p.exportPdf': { en: 'Export PDF', hi: 'PDF निर्यात', ta: 'PDF ஏற்றுமதி' },
  'p.excel': { en: 'Excel', hi: 'एक्सेल', ta: 'எக்செல்' },
  'p.message': { en: 'Message', hi: 'संदेश', ta: 'செய்தி' },
  'p.editRx': { en: 'Edit prescription', hi: 'नुस्खा संपादित करें', ta: 'மருந்துச்சீட்டைத் திருத்து' },
  'p.endTreatment': { en: 'End treatment', hi: 'उपचार समाप्त करें', ta: 'சிகிச்சையை முடி' },
  'p.cancel': { en: 'Cancel', hi: 'रद्द करें', ta: 'ரத்து' },
  'p.confirm': { en: 'Confirm', hi: 'पुष्टि करें', ta: 'உறுதி செய்' },
  'p.done': { en: 'Done', hi: 'हो गया', ta: 'முடிந்தது' },
  'p.save': { en: 'Save', hi: 'सहेजें', ta: 'சேமி' },
  'p.remove': { en: 'Remove', hi: 'हटाएँ', ta: 'நீக்கு' },
  'p.view': { en: 'View', hi: 'देखें', ta: 'பார்' },
  'p.send': { en: 'Send', hi: 'भेजें', ta: 'அனுப்பு' },
  'p.back': { en: 'Back', hi: 'वापस', ta: 'பின்' },
  'p.typeMessage': { en: 'Type a message…', hi: 'संदेश लिखें…', ta: 'செய்தியை உள்ளிடு…' },
  'p.sent': { en: 'Sent', hi: 'भेजा गया', ta: 'அனுப்பப்பட்டது' },
  'p.read': { en: 'Read', hi: 'पढ़ा गया', ta: 'படிக்கப்பட்டது' },
  'p.online': { en: 'Online', hi: 'ऑनलाइन', ta: 'ஆன்லைன்' },
  'p.offline': { en: 'Offline', hi: 'ऑफलाइन', ta: 'ஆஃப்லைன்' },
  'p.notifications': { en: 'Notifications', hi: 'सूचनाएँ', ta: 'அறிவிப்புகள்' },
  'p.caughtUp': { en: "You're all caught up.", hi: 'कोई नई सूचना नहीं।', ta: 'புதிய அறிவிப்பு இல்லை.' },
  'p.language': { en: 'Language', hi: 'भाषा', ta: 'மொழி' },

  // slots
  'slot.morning': { en: 'Morning', hi: 'सुबह', ta: 'காலை' },
  'slot.afternoon': { en: 'Afternoon', hi: 'दोपहर', ta: 'மதியம்' },
  'slot.night': { en: 'Night', hi: 'रात', ta: 'இரவு' },
  'slot.beforeFood': { en: 'before food', hi: 'भोजन से पहले', ta: 'உணவுக்கு முன்' },
  'slot.afterFood': { en: 'after food', hi: 'भोजन के बाद', ta: 'உணவுக்குப் பின்' },

  // ---- doctor dashboard ----
  'dd.autorefresh': { en: 'Auto-refreshing every 30s · {n} active', hi: 'हर 30 सेकंड में ताज़ा · {n} सक्रिय', ta: '30 வி.நொடிக்கு புதுப்பிப்பு · {n} செயலில்' },
  'dd.addPatient': { en: '+ Add patient', hi: '+ मरीज़ जोड़ें', ta: '+ நோயாளியைச் சேர்' },
  'dd.activeCaseload': { en: 'Active caseload', hi: 'सक्रिय मरीज़', ta: 'செயலில் உள்ள நோயாளிகள்' },
  'dd.history': { en: 'History', hi: 'इतिहास', ta: 'வரலாறு' },
  'dd.activePatients': { en: 'Active patients', hi: 'सक्रिय मरीज़', ta: 'செயல் நோயாளிகள்' },
  'dd.compliantToday': { en: 'Compliant today', hi: 'आज अनुपालित', ta: 'இன்று இணக்கம்' },
  'dd.missedToday': { en: 'Missed doses today', hi: 'आज छूटी खुराक', ta: 'இன்று தவறிய அளவுகள்' },
  'dd.pending': { en: 'Pending (not yet due)', hi: 'लंबित (अभी समय नहीं)', ta: 'நிலுவையில் (நேரம் இல்லை)' },
  'dd.colPatient': { en: 'Patient', hi: 'मरीज़', ta: 'நோயாளி' },
  'dd.colKashaya': { en: 'Kashaya', hi: 'काढ़ा', ta: 'கஷாயம்' },
  'dd.colCondition': { en: 'Condition', hi: 'स्थिति', ta: 'நிலை' },
  'dd.colEnded': { en: 'Ended', hi: 'समाप्त', ta: 'முடிந்தது' },
  'dd.addNewPatient': { en: 'Add new patient', hi: 'नया मरीज़ जोड़ें', ta: 'புதிய நோயாளியைச் சேர்' },
  'dd.credsSub': { en: 'Credentials are generated automatically on save.', hi: 'सहेजने पर लॉगिन विवरण स्वतः बनेंगे।', ta: 'சேமிக்கும்போது உள்நுழைவு விவரங்கள் தானாக உருவாகும்.' },
  'dd.credsTitle': { en: 'Patient Added Successfully', hi: 'मरीज़ सफलतापूर्वक जोड़ा गया', ta: 'நோயாளி வெற்றிகரமாகச் சேர்க்கப்பட்டார்' },
  'dd.credsShare': { en: 'Share these credentials with the patient — the password is shown once.', hi: 'ये लॉगिन विवरण मरीज़ को दें — पासवर्ड एक बार दिखता है।', ta: 'இந்த விவரங்களை நோயாளியிடம் பகிரவும் — கடவுச்சொல் ஒரு முறை மட்டுமே காட்டப்படும்.' },
  'dd.username': { en: 'Username', hi: 'यूज़रनेम', ta: 'பயனர்பெயர்' },
  'dd.password': { en: 'Password', hi: 'पासवर्ड', ta: 'கடவுச்சொல்' },
  'dd.copy': { en: 'Copy', hi: 'कॉपी', ta: 'நகலெடு' },

  // ---- patient detail (doctor view) ----
  'pd.allPatients': { en: '← All patients', hi: '← सभी मरीज़', ta: '← அனைத்து நோயாளிகள்' },
  'pd.weeklyCompliance': { en: 'Weekly compliance', hi: 'साप्ताहिक अनुपालन', ta: 'வாராந்திர இணக்கம்' },
  'pd.currentStreak': { en: 'Current streak', hi: 'वर्तमान श्रृंखला', ta: 'தற்போதைய தொடர்' },
  'pd.dosesTaken': { en: 'Doses taken / scheduled', hi: 'ली गई / निर्धारित खुराक', ta: 'எடுத்த / திட்டமிட்ட அளவுகள்' },
  'pd.mostMissed': { en: 'Most missed slot', hi: 'सबसे अधिक छूटा समय', ta: 'அதிகம் தவறிய நேரம்' },
  'pd.compliance7': { en: 'Compliance — last 7 days', hi: 'अनुपालन — पिछले 7 दिन', ta: 'இணக்கம் — கடந்த 7 நாட்கள்' },
  'pd.currentRx': { en: 'Current prescription', hi: 'वर्तमान नुस्खा', ta: 'தற்போதைய மருந்துச்சீட்டு' },
  'pd.recentBrews': { en: 'Recent brew sessions', hi: 'हाल के काढ़ा सत्र', ta: 'சமீபத்திய காய்ச்சல் அமர்வுகள்' },
  'pd.schedule': { en: 'Schedule', hi: 'समय-सारणी', ta: 'அட்டவணை' },
  'pd.duration': { en: 'Duration', hi: 'अवधि', ta: 'கால அளவு' },
  'pd.notes': { en: 'Notes', hi: 'टिप्पणियाँ', ta: 'குறிப்புகள்' },
  'pd.lastUpdated': { en: 'Last updated', hi: 'अंतिम अद्यतन', ta: 'கடைசி புதுப்பிப்பு' },
  'pd.week': { en: 'Week {a} of {b}', hi: 'सप्ताह {a} / {b}', ta: 'வாரம் {a} / {b}' },
  'pd.colDate': { en: 'Date', hi: 'तारीख़', ta: 'தேதி' },
  'pd.colConsistency': { en: 'Consistency', hi: 'संगति', ta: 'நிலைத்தன்மை' },
  'pd.colDuration': { en: 'Duration', hi: 'अवधि', ta: 'கால அளவு' },
  'pd.noBrews': { en: 'No brew sessions recorded yet.', hi: 'अभी कोई काढ़ा सत्र दर्ज नहीं।', ta: 'இதுவரை காய்ச்சல் அமர்வுகள் இல்லை.' },
  'pd.endTitle': { en: 'End treatment for {name}?', hi: '{name} का उपचार समाप्त करें?', ta: '{name} இன் சிகிச்சையை முடிக்கவா?' },
  'pd.endSub': {
    en: "The patient moves to History and is removed from your active caseload. They'll be asked to book a review.",
    hi: 'मरीज़ इतिहास में चला जाएगा और सक्रिय सूची से हट जाएगा। उन्हें समीक्षा बुक करने को कहा जाएगा।',
    ta: 'நோயாளி வரலாற்றுக்குச் சென்று செயல் பட்டியலில் இருந்து நீக்கப்படுவார். மறு பரிசோதனையைப் பதிவு செய்யக் கேட்கப்படுவார்.',
  },
  'pd.patientNotFound': { en: 'Patient not found.', hi: 'मरीज़ नहीं मिला।', ta: 'நோயாளி கிடைக்கவில்லை.' },
  'pd.treatmentCompleted': { en: 'treatment completed', hi: 'उपचार पूर्ण', ta: 'சிகிச்சை முடிந்தது' },
  'pd.backToPatients': { en: 'Back to patients', hi: 'मरीज़ों पर वापस', ta: 'நோயாளிகளுக்குத் திரும்பு' },

  // ---- brew monitor ----
  'bm.title': { en: 'Brew Monitor', hi: 'काढ़ा मॉनिटर', ta: 'காய்ச்சல் கண்காணிப்பு' },
  'bm.sub': { en: 'Live decoction sessions across your caseload · {n} brewing now', hi: 'आपके मरीज़ों के लाइव काढ़ा सत्र · {n} अभी बन रहे', ta: 'உங்கள் நோயாளிகளின் நேரடி காய்ச்சல் அமர்வுகள் · {n} இப்போது' },
  'bm.alertLog': { en: 'Alert log', hi: 'अलर्ट लॉग', ta: 'எச்சரிக்கை பதிவு' },
  'bm.noBrewing': { en: 'No patients are brewing right now.', hi: 'अभी कोई मरीज़ काढ़ा नहीं बना रहा।', ta: 'இப்போது யாரும் காய்ச்சவில்லை.' },
  'bm.openPatient': { en: 'Open patient', hi: 'मरीज़ खोलें', ta: 'நோயாளியைத் திற' },
  'bm.logAlert': { en: 'Log alert', hi: 'अलर्ट दर्ज करें', ta: 'எச்சரிக்கையைப் பதி' },
  'bm.dismiss': { en: 'Dismiss', hi: 'खारिज करें', ta: 'நிராகரி' },
  'bm.temp': { en: 'Temp', hi: 'तापमान', ta: 'வெப்பம்' },
  'bm.phase': { en: 'Phase', hi: 'चरण', ta: 'நிலை' },
  'bm.remaining': { en: 'Remaining', hi: 'शेष', ta: 'மீதம்' },
  'bm.consistency': { en: 'Consistency', hi: 'संगति', ta: 'நிலைத்தன்மை' },
  'bm.noAlerts': { en: 'No alerts logged.', hi: 'कोई अलर्ट दर्ज नहीं।', ta: 'எச்சரிக்கைகள் இல்லை.' },
  'bm.colError': { en: 'Error', hi: 'त्रुटि', ta: 'பிழை' },
  'bm.colTime': { en: 'Time', hi: 'समय', ta: 'நேரம்' },
  'bm.colStatus': { en: 'Status', hi: 'स्थिति', ta: 'நிலை' },
  'bm.open': { en: 'Open', hi: 'खुला', ta: 'திறந்தது' },
  'bm.dismissed': { en: 'Dismissed', hi: 'खारिज', ta: 'நிராகரிக்கப்பட்டது' },

  // ---- doctor chat ----
  'dc.youAre': { en: 'You are {s} — patients see this in real time.', hi: 'आप {s} हैं — मरीज़ इसे तुरंत देखते हैं।', ta: 'நீங்கள் {s} — நோயாளிகள் இதை உடனடியாகக் காண்பர்.' },
  'dc.noConv': { en: 'No conversations yet.', hi: 'अभी कोई बातचीत नहीं।', ta: 'இதுவரை உரையாடல் இல்லை.' },
  'dc.selectPatient': { en: 'Select a patient to start chatting.', hi: 'चैट शुरू करने के लिए मरीज़ चुनें।', ta: 'அரட்டையைத் தொடங்க நோயாளியைத் தேர்ந்தெடு.' },
  'dc.noMsgs': { en: 'No messages yet — say hello.', hi: 'अभी कोई संदेश नहीं — नमस्ते कहें।', ta: 'இதுவரை செய்தி இல்லை — வணக்கம் சொல்லு.' },
  'dc.noMsgsPatient': { en: 'No messages yet. Use a template below or type your question.', hi: 'अभी कोई संदेश नहीं। नीचे टेम्पलेट चुनें या प्रश्न लिखें।', ta: 'இதுவரை செய்தி இல்லை. கீழே உள்ள வார்ப்புருவைப் பயன்படுத்து அல்லது கேள்வியை எழுது.' },
  'dc.noMsgsShort': { en: 'No messages yet', hi: 'अभी कोई संदेश नहीं', ta: 'இதுவரை செய்தி இல்லை' },

  // ---- patient dashboard ----
  'ppd.todayDoses': { en: "Today's doses", hi: 'आज की खुराक', ta: 'இன்றைய அளவுகள்' },
  'ppd.overdueBy': { en: 'Overdue by {t}', hi: '{t} देर', ta: '{t} தாமதம்' },
  'ppd.markLate': { en: 'Mark as Taken (Late)', hi: 'ली गई चिह्नित करें (देर से)', ta: 'எடுத்ததாகக் குறி (தாமதம்)' },
  'ppd.startBrew': { en: 'Start Brew', hi: 'काढ़ा शुरू करें', ta: 'காய்ச்சலைத் தொடங்கு' },
  'ppd.startBrewLocked': { en: 'Start Brew (opens 30 min before)', hi: 'काढ़ा शुरू करें (30 मिनट पहले खुलेगा)', ta: 'காய்ச்சலைத் தொடங்கு (30 நிமிடம் முன் திறக்கும்)' },
  'ppd.in': { en: 'in {t}', hi: '{t} में', ta: '{t} இல்' },
  'ppd.takenAt': { en: '✓ Taken at {t}', hi: '✓ {t} पर ली गई', ta: '✓ {t} இல் எடுக்கப்பட்டது' },
  'ppd.taken': { en: '✓ Taken', hi: '✓ ली गई', ta: '✓ எடுக்கப்பட்டது' },
  'ppd.missed': { en: 'Missed', hi: 'छूट गई', ta: 'தவறியது' },
  'ppd.brewedThis': { en: 'Brewed this session', hi: 'इस सत्र में बनाया', ta: 'இந்த அமர்வில் காய்ச்சப்பட்டது' },
  'ppd.yourStreak': { en: 'Your streak', hi: 'आपकी श्रृंखला', ta: 'உங்கள் தொடர்' },
  'ppd.personalBest': { en: 'Personal best', hi: 'व्यक्तिगत सर्वश्रेष्ठ', ta: 'சொந்த சிறந்தது' },
  'ppd.thisWeek': { en: 'This week', hi: 'इस सप्ताह', ta: 'இந்த வாரம்' },
  'ppd.badges': { en: 'Badges', hi: 'बैज', ta: 'பதக்கங்கள்' },
  'ppd.toNext': { en: 'to {icon} {title}', hi: '{icon} {title} तक', ta: '{icon} {title} வரை' },
  'ppd.allBadges': { en: 'all badges earned', hi: 'सभी बैज अर्जित', ta: 'அனைத்து பதக்கங்களும்' },
  'ppd.maxed': { en: 'Maxed', hi: 'पूर्ण', ta: 'முழுமை' },
  'badge.3': { en: 'Getting Started', hi: 'शुरुआत', ta: 'தொடக்கம்' },
  'badge.7': { en: 'One Week Strong', hi: 'एक सप्ताह मज़बूत', ta: 'ஒரு வாரம் உறுதி' },
  'badge.14': { en: 'Committed', hi: 'प्रतिबद्ध', ta: 'உறுதிபூண்டவர்' },
  'badge.30': { en: 'Champion', hi: 'चैंपियन', ta: 'சாம்பியன்' },
  'badge.streakDays': { en: '{n}-day streak', hi: '{n} दिन की श्रृंखला', ta: '{n} நாள் தொடர்' },
  'ppd.markTitle': { en: 'Mark {slot} dose as taken?', hi: '{slot} की खुराक ली गई चिह्नित करें?', ta: '{slot} அளவை எடுத்ததாகக் குறிக்கவா?' },
  'ppd.scheduled': { en: 'Scheduled', hi: 'निर्धारित', ta: 'திட்டமிட்டது' },
  'ppd.currentTime': { en: 'Current', hi: 'अभी', ta: 'இப்போது' },
  'ppd.dayShort': { en: 'd', hi: 'दि', ta: 'நா' },
  'ppd.startYourBrew': { en: 'Start your brew', hi: 'अपना काढ़ा शुरू करें', ta: 'உங்கள் காய்ச்சலைத் தொடங்கு' },
  'ppd.prescribedPreselect': { en: 'Your prescribed kashaya is pre-selected.', hi: 'आपका निर्धारित काढ़ा पहले से चुना है।', ta: 'உங்கள் மருந்துச்சீட்டு கஷாயம் முன்பே தேர்ந்தெடுக்கப்பட்டது.' },
  'ppd.confirmOpen': { en: 'Confirm & open brew console', hi: 'पुष्टि करें और काढ़ा कंसोल खोलें', ta: 'உறுதி செய்து காய்ச்சல் பலகத்தைத் திற' },

  // ---- patient compliance ----
  'pc.thisWeek': { en: 'This week', hi: 'इस सप्ताह', ta: 'இந்த வாரம்' },
  'pc.sub': { en: 'Every scheduled dose taken keeps your streak alive.', hi: 'हर निर्धारित खुराक लेने से श्रृंखला बनी रहती है।', ta: 'ஒவ்வொரு அளவையும் எடுத்தால் தொடர் தொடரும்.' },
  'pc.weeklyCompliance': { en: 'Weekly compliance', hi: 'साप्ताहिक अनुपालन', ta: 'வாராந்திர இணக்கம்' },
  'pc.currentStreak': { en: 'Current streak', hi: 'वर्तमान श्रृंखला', ta: 'தற்போதைய தொடர்' },
  'pc.personalBest': { en: 'Personal best', hi: 'व्यक्तिगत सर्वश्रेष्ठ', ta: 'சொந்த சிறந்தது' },
  'pc.perfectWeek': { en: 'Perfect Week', hi: 'संपूर्ण सप्ताह', ta: 'சரியான வாரம்' },
  'pc.keepGoing': { en: 'Keep going', hi: 'जारी रखें', ta: 'தொடர்' },
  'pc.legend': { en: '✓ taken · ✗ missed · ● upcoming · ! overdue', hi: '✓ ली गई · ✗ छूटी · ● आगामी · ! देर', ta: '✓ எடுத்தது · ✗ தவறியது · ● வரவிருக்கிறது · ! தாமதம்' },
  'pc.mostMissed': { en: 'most missed slot: {slot}', hi: 'सबसे अधिक छूटा: {slot}', ta: 'அதிகம் தவறியது: {slot}' },

  // ---- patient prescription ----
  'pp.prescribedBy': { en: 'prescribed by {name}', hi: '{name} द्वारा निर्धारित', ta: '{name} பரிந்துரைத்தார்' },
  'pp.whatItDoes': { en: 'What it does for your body', hi: 'यह आपके शरीर के लिए क्या करता है', ta: 'இது உங்கள் உடலுக்கு என்ன செய்கிறது' },
  'pp.howToTake': { en: 'How to take it', hi: 'इसे कैसे लें', ta: 'இதை எப்படி எடுப்பது' },
  'pp.doctorNotes': { en: "Doctor's notes", hi: 'डॉक्टर की टिप्पणियाँ', ta: 'மருத்துவரின் குறிப்புகள்' },
  'pp.ingredients': { en: 'Ingredients', hi: 'सामग्री', ta: 'பொருட்கள்' },
  'pp.contra': { en: 'Contraindications', hi: 'प्रतिनिषेध', ta: 'முரண்பாடுகள்' },
  'pp.afiSpec': { en: 'AFI specification', hi: 'AFI विनिर्देश', ta: 'AFI விவரக்குறிப்பு' },
  'pp.weekN': { en: 'Week {n}', hi: 'सप्ताह {n}', ta: 'வாரம் {n}' },
  'pp.of': { en: 'of {n}', hi: '{n} में से', ta: '{n} இல்' },
  'pp.remaining': { en: 'remaining', hi: 'शेष', ta: 'மீதம்' },
  'pp.colDose': { en: 'Dose', hi: 'खुराक', ta: 'அளவு' },
  'pp.colTime': { en: 'Time', hi: 'समय', ta: 'நேரம்' },
  'pp.colFood': { en: 'Food', hi: 'भोजन', ta: 'உணவு' },

  // ---- patient symptoms ----
  'ps.title': { en: 'How are you feeling today?', hi: 'आज आप कैसा महसूस कर रहे हैं?', ta: 'இன்று எப்படி உணர்கிறீர்கள்?' },
  'ps.sub': { en: 'One check-in per day — your doctor sees the trend.', hi: 'दिन में एक बार — डॉक्टर रुझान देखते हैं।', ta: 'நாளுக்கு ஒரு முறை — மருத்துவர் போக்கைப் பார்ப்பார்.' },
  'ps.optionalNote': { en: 'Optional note', hi: 'वैकल्पिक टिप्पणी', ta: 'விருப்பக் குறிப்பு' },
  'ps.notePlaceholder': { en: 'Anything you want your doctor to know…', hi: 'जो भी आप डॉक्टर को बताना चाहें…', ta: 'மருத்துவரிடம் சொல்ல விரும்புவது…' },
  'ps.submit': { en: 'Submit check-in', hi: 'चेक-इन सबमिट करें', ta: 'செக்-இன் சமர்ப்பி' },
  'ps.recent': { en: 'Recent check-ins', hi: 'हाल के चेक-इन', ta: 'சமீபத்திய செக்-இன்கள்' },
  'ps.loggedAgo': { en: 'Logged {t} · come back tomorrow.', hi: '{t} दर्ज · कल फिर आएँ।', ta: '{t} பதிவு · நாளை மீண்டும் வா.' },
  'ps.noCheckins': { en: 'No check-ins yet.', hi: 'अभी कोई चेक-इन नहीं।', ta: 'இதுவரை செக்-இன் இல்லை.' },
  'ps.colDate': { en: 'Date', hi: 'तारीख़', ta: 'தேதி' },
  'ps.colFeeling': { en: 'Feeling', hi: 'भाव', ta: 'உணர்வு' },
  'ps.colNote': { en: 'Note', hi: 'टिप्पणी', ta: 'குறிப்பு' },
  'sym.much_better': { en: 'Much Better', hi: 'बहुत बेहतर', ta: 'மிகவும் நன்று' },
  'sym.better': { en: 'Better', hi: 'बेहतर', ta: 'நன்று' },
  'sym.same': { en: 'Same', hi: 'वही', ta: 'அதே' },
  'sym.worse': { en: 'Worse', hi: 'बदतर', ta: 'மோசம்' },
  'sym.much_worse': { en: 'Much Worse', hi: 'बहुत बदतर', ta: 'மிக மோசம்' },

  // ---- patient chat ----
  'pch.title': { en: 'Chat with your doctor', hi: 'अपने डॉक्टर से चैट करें', ta: 'உங்கள் மருத்துவருடன் அரட்டை' },
  'pch.attachSymptom': { en: "📎 Attach today's symptom", hi: '📎 आज का लक्षण जोड़ें', ta: '📎 இன்றைய அறிகுறியை இணை' },
  'pch.feeling': { en: 'Feeling: {label} today', hi: 'आज का भाव: {label}', ta: 'இன்றைய உணர்வு: {label}' },
  'pch.noSymptomYet': { en: 'I have not logged my symptom check-in yet today.', hi: 'मैंने आज अभी लक्षण चेक-इन दर्ज नहीं किया है।', ta: 'இன்று இன்னும் அறிகுறி செக்-இன் பதிவு செய்யவில்லை.' },

  // query templates / quick replies
  'qr.continueRx': { en: 'Continue with current prescription', hi: 'वर्तमान नुस्खा जारी रखें', ta: 'தற்போதைய மருந்துச்சீட்டைத் தொடரவும்' },
  'qr.dontMiss': { en: 'Please do not miss your doses', hi: 'कृपया अपनी खुराक न भूलें', ta: 'உங்கள் அளவுகளைத் தவறவிடாதீர்கள்' },
  'qr.followUp': { en: 'Book a follow-up appointment', hi: 'फॉलो-अप अपॉइंटमेंट बुक करें', ta: 'பின்தொடர் சந்திப்பை பதிவு செய்யுங்கள்' },
  'qr.improving': { en: 'Your compliance is improving, well done', hi: 'आपका अनुपालन सुधर रहा है, शाबाश', ta: 'உங்கள் இணக்கம் மேம்படுகிறது, நன்று' },
  'qt.missedDose': { en: 'I missed my dose, what should I do?', hi: 'मेरी खुराक छूट गई, मुझे क्या करना चाहिए?', ta: 'என் அளவு தவறிவிட்டது, நான் என்ன செய்ய வேண்டும்?' },
  'qt.withFood': { en: 'Can I take this with food or milk?', hi: 'क्या मैं इसे भोजन या दूध के साथ ले सकता हूँ?', ta: 'இதை உணவு அல்லது பாலுடன் எடுக்கலாமா?' },
  'qt.sideEffects': { en: 'I am experiencing side effects', hi: 'मुझे दुष्प्रभाव हो रहे हैं', ta: 'எனக்கு பக்க விளைவுகள் ஏற்படுகின்றன' },
  'qt.appointment': { en: 'I would like to book an appointment', hi: 'मैं अपॉइंटमेंट बुक करना चाहता हूँ', ta: 'நான் ஒரு சந்திப்பை பதிவு செய்ய விரும்புகிறேன்' },
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
