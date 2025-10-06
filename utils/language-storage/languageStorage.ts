import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = '@app_language';

export type Language = 'en' | 'ar';

/**
 * Service to manage language persistence using AsyncStorage
 */
export const LanguageStorage = {
  /**
   * Save language preference to AsyncStorage
   */
  async saveLanguage(language: Language): Promise<void> {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
      console.log(`Language saved: ${language}`);
    } catch (error) {
      console.error('Error saving language:', error);
      throw error;
    }
  },

  /**
   * Get saved language preference from AsyncStorage
   * Returns 'en' as default if no language is saved, and saves it
   */
  async getLanguage(): Promise<Language> {
    try {
      const language = await AsyncStorage.getItem(LANGUAGE_KEY);
      
      if (!language) {
        // No language saved yet, save default 'en'
        await this.saveLanguage('en');
        console.log('No language found, defaulting to English and saving');
        return 'en';
      }
      
      return language as Language;
    } catch (error) {
      console.error('Error getting language:', error);
      return 'en'; // Default fallback
    }
  },

  /**
   * Clear saved language preference
   */
  async clearLanguage(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LANGUAGE_KEY);
      console.log('Language preference cleared');
    } catch (error) {
      console.error('Error clearing language:', error);
      throw error;
    }
  },
};