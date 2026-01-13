
export const languages = ['en', 'zh'];
export const defaultLanguage = 'en';

export function getOptions(lang = defaultLanguage) {
  return {
    headers: {
      'Accept-Language': lang
    }
  };
}
