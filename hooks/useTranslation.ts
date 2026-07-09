import { useAppSelector } from './useReduxHooks';
import { selectLanguage } from '../screens/home-screen/homeScreenSlice';
import enTranslations from '../translations/en.json';
import arTranslations from '../translations/ar.json';

export const useTranslation = () => {
  const language = useAppSelector(selectLanguage);
  
  const translations = language === 'en' ? enTranslations : arTranslations;
  
  const t = (key: string): string => {
    const keys = key.split('.');
    let result: any = translations;
    
    for (const k of keys) {
      result = result[k];
      if (result === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    return result;
  };
  
  return { t, language, isRTL: language === 'ar' };
};