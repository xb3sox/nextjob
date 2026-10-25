import type { TranslationDictionary } from '@nextjob/shared';

export const enUS: TranslationDictionary = {
  common: {
    appName: 'NextJob',
    welcome: 'Welcome back',
    language: 'Language',
    selectLanguage: 'Select Language',
    save: 'Save',
    cancel: 'Cancel',
    loading: 'Loading...',
  },
  navigation: {
    dashboard: 'Dashboard',
    jobs: 'Jobs',
    profile: 'Profile',
    tailor: 'Tailor Resume',
    settings: 'Settings',
  },
  jobs: {
    jobTitle: 'Job Title',
    company: 'Company',
    location: 'Location',
    salary: 'Salary',
    postedDate: 'Posted Date',
    eligible: 'Eligible',
    matchScore: 'Match Score',
  },
};

export const arSA: TranslationDictionary = {
  common: {
    appName: 'نِكست جوب',
    welcome: 'مرحباً بعودتك',
    language: 'اللغة',
    selectLanguage: 'اختر اللغة',
    save: 'حفظ',
    cancel: 'إلغاء',
    loading: 'جاري التحميل...',
  },
  navigation: {
    dashboard: 'لوحة التحكم',
    jobs: 'الوظائف',
    profile: 'الملف الشخصي',
    tailor: 'تحسين السيرة الذاتية',
    settings: 'الإعدادات',
  },
  jobs: {
    jobTitle: 'المسمى الوظيفي',
    company: 'الشركة',
    location: 'الموقع',
    salary: 'الراتب',
    postedDate: 'تاريخ النشر',
    eligible: 'مؤهل',
    matchScore: 'نسبة التطابق',
  },
};

export const esES: TranslationDictionary = {
  common: {
    appName: 'NextJob',
    welcome: 'Bienvenido de nuevo',
    language: 'Idioma',
    selectLanguage: 'Seleccionar idioma',
    save: 'Guardar',
    cancel: 'Cancelar',
    loading: 'Cargando...',
  },
  navigation: {
    dashboard: 'Panel principal',
    jobs: 'Empleos',
    profile: 'Perfil',
    tailor: 'Adaptar CV',
    settings: 'Configuración',
  },
  jobs: {
    jobTitle: 'Título del puesto',
    company: 'Empresa',
    location: 'Ubicación',
    salary: 'Salario',
    postedDate: 'Fecha de publicación',
    eligible: 'Elegible',
    matchScore: 'Puntuación de coincidencia',
  },
};

export const heIL: TranslationDictionary = {
  common: {
    appName: 'נקסטג׳וב',
    welcome: 'ברוך שובך',
    language: 'שפה',
    selectLanguage: 'בחר שפה',
    save: 'שמור',
    cancel: 'ביטול',
    loading: 'טוען...',
  },
  navigation: {
    dashboard: 'לוח בקרה',
    jobs: 'משרות',
    profile: 'פרופיל',
    tailor: 'התאמת קורות חיים',
    settings: 'הגדרות',
  },
  jobs: {
    jobTitle: 'תיאור תפקיד',
    company: 'חברה',
    location: 'מיקום',
    salary: 'שכר',
    postedDate: 'תאריך פרסום',
    eligible: 'מתאים',
    matchScore: 'ציון התאמה',
  },
};

export const translations: Record<string, TranslationDictionary> = {
  'en-US': enUS,
  'ar-SA': arSA,
  'es-ES': esES,
  'he-IL': heIL,
};
