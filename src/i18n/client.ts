
'use client'

import { useEffect, useState } from 'react'
import { getDictionary } from '@/src/i18n/server'
import { useParams } from 'next/navigation'

// Simple hook for client components until fully integrated with react-i18next or similar
// This uses the same dictionary structure as server components for consistency
export function useTranslation() {
  const params = useParams()
  const lang = (params.lang as string) || 'en'
  const [dict, setDict] = useState<any>({})

  useEffect(() => {
    // We can fetch the dictionary from an API or import it dynamically
    // For simplicity in this demo, we'll assume a way to load it or just import locally if possible
    // In a real app, you might pass the dictionary from the server component as props
    // or use a provider.
    // For this strict environment, let's fetch a small subset or use a lightweight approach
    import(`@/locales/${lang}.json`).then(m => setDict(m.default))
  }, [lang])

  return { t: (key: string) => {
      const keys = key.split('.')
      let value = dict
      for (const k of keys) {
          value = value?.[k]
      }
      return value || key
  }, lang }
}
