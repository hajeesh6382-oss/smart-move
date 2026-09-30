// SMARTMOVE Multilingual i18n Configuration
// Supports 10 Indian Regional Languages with seamless fallback

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
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', bcp47: 'hi-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', bcp47: 'ta-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', bcp47: 'te-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', bcp47: 'kn-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', bcp47: 'ml-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', bcp47: 'bn-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', bcp47: 'mr-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', bcp47: 'gu-IN' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', bcp47: 'pa-IN' },
];

// Helper to fallback unknown Indic keys to Hindi/English translations
const resources = {
  en: { translation: en },
  hi: { translation: hi },
  ta: { translation: ta },
  te: {
    translation: {
      ...en,
      app_name: 'స్మార్ట్‌మూవ్',
      tagline: 'తెలివిగా ప్రయాణించండి. మెరుగ్గా జీవించండి.',
      subtitle: 'ట్రాఫిక్ జామ్‌లుగా మారకముందే సమస్యలను అంచనా వేయండి.',
      buttons: { ...en.buttons, run_demo: '🎬 AI డెమో ప్రారంభించండి', simulate_solution: '🧠 పరిష్కారాన్ని అనుకరించండి' },
      nav: { ...en.nav, dashboard: 'డాష్‌బోర్డ్', live_map: 'లైవ్ మ్యాప్', routes: 'మార్గ ప్రణాళిక' }
    }
  },
  kn: {
    translation: {
      ...en,
      app_name: 'ಸ್ಮಾರ್ಟ್‌ಮೂವ್',
      tagline: 'ಬುದ್ಧಿವಂತಿಕೆಯಿಂದ ಚಲಿಸಿ. ಉತ್ತಮವಾಗಿ ಜೀವಿಸಿ.',
      subtitle: 'ಸಂಚಾರ ದಟ್ಟಣೆಯಾಗುವ ಮುನ್ನವೇ ಸಮಸ್ಯೆಗಳನ್ನು ಊಹಿಸಿ.',
      buttons: { ...en.buttons, run_demo: '🎬 AI ಡೆಮೊ ಚಾಲನೆ ಮಾಡಿ', simulate_solution: '🧠 ಪರಿಹಾರ ಅನುಕರಿಸಿ' },
      nav: { ...en.nav, dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', live_map: 'ಲೈವ್ ನಕ್ಷೆ', routes: 'ಮಾರ್ಗ ಯೋಜನೆ' }
    }
  },
  ml: {
    translation: {
      ...en,
      app_name: 'സ്മാർട്ട്മൂവ്',
      tagline: 'മികച്ച രീതിയിൽ യാത്ര ചെയ്യൂ. നന്നായി ജീവിക്കൂ.',
      subtitle: 'ഗതാഗതക്കുരുക്കാകുന്നതിന് മുമ്പ് പ്രശ്നങ്ങൾ പ്രവചിക്കുക.',
      buttons: { ...en.buttons, run_demo: '🎬 AI ഡെമോ ആരംഭിക്കുക', simulate_solution: '🧠 പരിഹാരം സിമുലേറ്റ് ചെയ്യുക' },
      nav: { ...en.nav, dashboard: 'ഡാഷ്‌ബോർഡ്', live_map: 'തത്സമയ മാപ്പ്', routes: 'റൂട്ട് പ്ലാനർ' }
    }
  },
  bn: {
    translation: {
      ...en,
      app_name: 'স্মার্টমুভ',
      tagline: 'স্মার্ট চলুন। সুন্দর বাঁচুন।',
      subtitle: 'যানজট হওয়ার আগেই সমস্যা অনুমান করুন।',
      buttons: { ...en.buttons, run_demo: '🎬 এআই ডেমো চালান', simulate_solution: '🧠 সমাধান সিমুলেট করুন' },
      nav: { ...en.nav, dashboard: 'ড্যাশবোর্ড', live_map: 'লাইভ ম্যাপ', routes: 'রুট প্ল্যানার' }
    }
  },
  mr: {
    translation: {
      ...en,
      app_name: 'स्मार्टमूव्ह',
      tagline: 'स्मार्ट प्रवास करा. चांगले जगा.',
      subtitle: 'रहदारीची कोंडी होण्यापूर्वी समस्यांचा अंदाज लावा.',
      buttons: { ...en.buttons, run_demo: '🎬 AI डेमो चालवा', simulate_solution: '🧠 उपाय सिम्युलेट करा' },
      nav: { ...en.nav, dashboard: 'डॅशबोर्ड', live_map: 'थेट नकाशा', routes: 'मार्ग नियोजन' }
    }
  },
  gu: {
    translation: {
      ...en,
      app_name: 'સ્માર્ટમૂવ',
      tagline: 'સ્માર્ટ મુસાફરી કરો. શ્રેષ્ઠ જીવો.',
      subtitle: 'ટ્રાફિક જામ થાય તે પહેલાં સમસ્યાઓનું અનુમાન કરો.',
      buttons: { ...en.buttons, run_demo: '🎬 AI ડેમો ચલાવો', simulate_solution: '🧠 સિમ્યુલેશન ઉકેલ' },
      nav: { ...en.nav, dashboard: 'ડેશબોર્ડ', live_map: 'લાઇવ નકશો', routes: 'રૂટ પ્લાનર' }
    }
  },
  pa: {
    translation: {
      ...en,
      app_name: 'ਸਮਾਰਟਮੂਵ',
      tagline: 'ਸਮਝਦਾਰੀ ਨਾਲ ਚੱਲੋ। ਬਿਹਤਰ ਜੀਓ।',
      subtitle: 'ਜਾਮ ਬਣਨ ਤੋਂ ਪਹਿਲਾਂ ਟ੍ਰੈਫਿਕ ਸਮੱਸਿਆਵਾਂ ਦਾ ਅੰਦਾਜ਼ਾ ਲਗਾਓ।',
      buttons: { ...en.buttons, run_demo: '🎬 AI ਡੈਮੋ ਚਲਾਓ', simulate_solution: '🧠 ਹੱਲ ਸਿਮੂਲੇਟ ਕਰੋ' },
      nav: { ...en.nav, dashboard: 'ਡੈਸ਼ਬੋਰਡ', live_map: 'ਲਾਈਵ ਨਕਸ਼ਾ', routes: 'ਰੂਟ ਯੋਜਨਾ' }
    }
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
