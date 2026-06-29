import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type LanguageState = {
  language: 'en' | 'vi';
  setLanguage: (lang: 'en' | 'vi') => void;
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'app-language',
    }
  )
);
