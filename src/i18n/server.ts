import { createInstance } from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { initReactI18next } from 'react-i18next/initReactI18next'
import { getOptions, defaultLanguage, languages } from './settings'

const initI18next = async (lang: string) => {
  const i18nInstance = createInstance()
  await i18nInstance
    .use(initReactI18next)
    .use(resourcesToBackend((language: string, namespace: string) => import(`../locales/${language}/${namespace}.json`)))
    .init({
      lng: lang,
      fallbackLng: defaultLanguage,
      supportedLngs: languages,
      defaultNS: 'translation',
      fallbackNS: 'translation',
    })
  return i18nInstance
}

export async function useTranslation(lang: string, ns: string = 'translation') {
  const i18nextInstance = await initI18next(lang)
  return {
    t: i18nextInstance.getFixedT(lang, ns),
    i18n: i18nextInstance
  }
}

const dictionaries = {
  en: () => import('../locales/en.json').then((module) => module.default),
  zh: () => import('../locales/zh.json').then((module) => module.default),
}

export const getDictionary = async (locale: string) => {
    // default to en if locale not found
    const fn = dictionaries[locale as keyof typeof dictionaries] || dictionaries['en'];
    return fn();
}
