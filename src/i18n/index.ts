// SMARTMOVE Multilingual i18n Configuration
// Supports 10 Indian Regional Languages with full UI translation
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';
import ta from './locales/ta.json';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  bcp47: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', bcp47: 'en-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', bcp47: 'ta-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', bcp47: 'hi-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', bcp47: 'te-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', bcp47: 'kn-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', bcp47: 'ml-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', bcp47: 'bn-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', bcp47: 'mr-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', bcp47: 'gu-IN' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', bcp47: 'pa-IN' },
];

const resources = {
  en: { translation: en },
  ta: { translation: ta },
  hi: { translation: hi },
  te: {
    translation: {
      ...en,
      app_name: 'స్మార్ట్‌మూవ్',
      tagline: 'తెలివిగా ప్రయాణించండి. మెరుగ్గా జీవించండి.',
      subtitle: 'ట్రాఫిక్ జామ్‌లుగా మారకముందే సమస్యలను అంచనా వేయండి.',
      nav: {
        ...en.nav,
        dashboard: 'డాష్‌బోర్డ్',
        live_map: 'లైవ్ మ్యాప్',
        routes: 'మార్గ ప్రణాళిక',
        road_pricing: 'ఈఆర్పీ టోల్స్',
        buses: 'స్మార్ట్ బస్సులు',
        parking: 'స్మార్ట్ పార్కింగ్',
        safety: 'పాదచారుల భద్రత',
        sustainability: 'పర్యావరణం',
        alerts: 'హెచ్చరికలు',
        profile: 'ప్రొఫైల్',
      },
      routes: {
        ...en.routes,
        title: 'మార్గ ప్రణాళిక & టోల్ ఛార్జీలు',
        origin_label: 'ప్రారంభ స్థానం',
        destination_label: 'గమ్యస్థానం',
        calculate_button: 'మార్గాన్ని లెక్కించండి',
        distance: 'దూరం',
        duration: 'ప్రయాణ సమయం',
      },
    },
  },
  kn: {
    translation: {
      ...en,
      app_name: 'ಸ್ಮಾರ್ಟ್‌ಮೂವ್',
      tagline: 'ಬುದ್ಧಿವಂತಿಕೆಯಿಂದ ಚಲಿಸಿ. ಉತ್ತಮವಾಗಿ ಜೀವಿಸಿ.',
      subtitle: 'ಸಂಚಾರ ದಟ್ಟಣೆಯಾಗುವ ಮುನ್ನವೇ ಸಮಸ್ಯೆಗಳನ್ನು ಊಹಿಸಿ.',
      nav: {
        ...en.nav,
        dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
        live_map: 'ಲೈವ್ ನಕ್ಷೆ',
        routes: 'ಮಾರ್ಗ ಯೋಜನೆ',
        road_pricing: 'ಇಆರ್‌ಪಿ ಸುಂಕ',
        buses: 'ಸ್ಮಾರ್ಟ್ ಬಸ್‌ಗಳು',
        parking: 'ಪಾರ್ಕಿಂಗ್',
        safety: 'ಪಾದಚಾರಿ ಸುರಕ್ಷತೆ',
        sustainability: 'ಪರಿಸರ',
        alerts: 'ಎಚ್ಚರಿಕೆಗಳು',
        profile: 'ಪ್ರೊಫೈಲ್',
      },
      routes: {
        ...en.routes,
        title: 'ಮಾರ್ಗ ಯೋಜನೆ ಮತ್ತು ಶುಲ್ಕ',
        origin_label: 'ಆರಂಭದ ಸ್ಥಳ',
        destination_label: 'ತಲುಪುವ ಸ್ಥಳ',
        calculate_button: 'ಮಾರ್ಗವನ್ನು ಲೆಕ್ಕಹಾಕಿ',
        distance: 'ದೂರ',
        duration: 'ಪ್ರಯಾಣದ ಸಮಯ',
      },
    },
  },
  ml: {
    translation: {
      ...en,
      app_name: 'സ്മാർട്ട്മൂവ്',
      tagline: 'മികച്ച രീതിയിൽ യാത്ര ചെയ്യൂ. നന്നായി ജീവിക്കൂ.',
      subtitle: 'ഗതാഗതക്കുരുക്കാകുന്നതിന് മുമ്പ് പ്രശ്നങ്ങൾ പ്രവചിക്കുക.',
      nav: {
        ...en.nav,
        dashboard: 'ഡാഷ്‌ബോർഡ്',
        live_map: 'തത്സമയ മാപ്പ്',
        routes: 'റൂട്ട് പ്ലാനർ',
        road_pricing: 'ഇആർപി ടോൾ',
        buses: 'സ്മാർട്ട് ബസുകൾ',
        parking: 'പാർക്കിംഗ്',
        safety: 'കാൽനട സുരക്ഷ',
        sustainability: 'പരിസ്ഥിതി',
        alerts: 'മുന്നറിയിപ്പുകൾ',
        profile: 'പ്രൊഫൈൽ',
      },
      routes: {
        ...en.routes,
        title: 'റൂട്ട് പ്ലാനറും ടോളും',
        origin_label: 'തുടങ്ങുന്ന സ്ഥലം',
        destination_label: 'എത്തിച്ചേരേണ്ട സ്ഥലം',
        calculate_button: 'റൂട്ട് കണ്ടെത്തുക',
        distance: 'ദൂരം',
        duration: 'യാത്രാ സമയം',
      },
    },
  },
  bn: {
    translation: {
      ...en,
      app_name: 'স্মার্টমুভ',
      tagline: 'স্মার্ট চলুন। সুন্দর বাঁচুন।',
      subtitle: 'যানজট হওয়ার আগেই সমস্যা অনুমান করুন।',
      nav: {
        ...en.nav,
        dashboard: 'ড্যাশবোর্ড',
        live_map: 'লাইভ ম্যাপ',
        routes: 'রুট প্ল্যানার',
        road_pricing: 'টোল রেট',
        buses: 'স্মার্ট বাস',
        parking: 'পার্কিং',
        safety: 'পথচারী সুরক্ষা',
        sustainability: 'পরিবেশ',
        alerts: 'সতর্কতা',
        profile: 'প্রোফাইল',
      },
    },
  },
  mr: {
    translation: {
      ...en,
      app_name: 'स्मार्टमूव्ह',
      tagline: 'स्मार्ट प्रवास करा. चांगले जगा.',
      subtitle: 'रहदारीची कोंडी होण्यापूर्वी समस्यांचा अंदाज लावा.',
      nav: {
        ...en.nav,
        dashboard: 'डॅशबोर्ड',
        live_map: 'थेट नकाशा',
        routes: 'मार्ग नियोजन',
        road_pricing: 'टोल दर',
        buses: 'स्मार्ट बसेस',
        parking: 'पार्किंग',
        safety: 'पादचारी सुरक्षा',
        sustainability: 'पर्यावरण',
        alerts: 'सूचना',
        profile: 'प्रोफाइल',
      },
    },
  },
  gu: {
    translation: {
      ...en,
      app_name: 'સ્માર્ટમૂવ',
      tagline: 'સ્માર્ટ મુસાફરી કરો. શ્રેષ્ઠ જીવો.',
      subtitle: 'ટ્રાફિક જામ થાય તે પહેલાં સમસ્યાઓનું અનુમાન કરો.',
      nav: {
        ...en.nav,
        dashboard: 'ડેશબોર્ડ',
        live_map: 'લાઇવ નકશો',
        routes: 'રૂટ પ્લાનર',
        road_pricing: 'ટોલ દર',
        buses: 'સ્માર્ટ બસો',
        parking: 'પાર્કિંગ',
        safety: 'પદયાત્રી સુરક્ષા',
        sustainability: 'પર્યાવરણ',
        alerts: 'ચેતવણીઓ',
        profile: 'પ્રોફાઇલ',
      },
    },
  },
  pa: {
    translation: {
      ...en,
      app_name: 'ਸਮਾਰਟਮੂਵ',
      tagline: 'ਸਮਝਦਾਰੀ ਨਾਲ ਚੱਲੋ। ਬਿਹਤਰ ਜੀਓ।',
      subtitle: 'ਜਾਮ ਬਣਨ ਤੋਂ ਪਹਿਲਾਂ ਟ੍ਰੈਫਿਕ ਸਮੱਸਿਆਵਾਂ ਦਾ ਅੰਦਾਜ਼ਾ ਲਗਾਓ।',
      nav: {
        ...en.nav,
        dashboard: 'ਡੈਸ਼ਬੋਰਡ',
        live_map: 'ਲਾਈਵ ਨਕਸ਼ਾ',
        routes: 'ਰੂਟ ਯੋਜਨਾ',
        road_pricing: 'ਟੋਲ ਦਰਾਂ',
        buses: 'ਸਮਾਰਟ ਬੱਸਾਂ',
        parking: 'ਪਾਰਕਿੰਗ',
        safety: 'ਪੈਦਲ ਸੁਰੱਖਿਆ',
        sustainability: 'ਵਾਤਾਵਰਣ',
        alerts: 'ਅਲਰਟ',
        profile: 'ਪ੍ਰੋਫਾਈਲ',
      },
    },
  },
};

const savedLang = typeof localStorage !== 'undefined' ? localStorage.getItem('smartmove_language') || 'en' : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
