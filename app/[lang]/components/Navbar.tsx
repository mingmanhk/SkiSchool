
import { getDictionary } from '@/src/i18n/server'
import Link from 'next/link'

export default async function Navbar({ lang }: { lang: string }) {
  const dict = await getDictionary(lang)

  return (
    <nav className="bg-white shadow dark:bg-gray-800">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href={`/${lang}`} className="text-xl font-bold text-gray-800 dark:text-white">
          Ski School OS
        </Link>
        <div className="flex items-center space-x-4">
            <Link href={`/${lang}/programs`} className="text-gray-800 dark:text-gray-200 hover:text-blue-500">
                {dict.nav.programs}
            </Link>
            <Link href={`/${lang}/dashboard`} className="text-gray-800 dark:text-gray-200 hover:text-blue-500">
                {dict.nav.dashboard}
            </Link>
            <div className="flex space-x-2 text-sm">
                <Link href="/en" className={lang === 'en' ? 'font-bold' : ''}>EN</Link>
                <span>|</span>
                <Link href="/zh" className={lang === 'zh' ? 'font-bold' : ''}>中文</Link>
            </div>
        </div>
      </div>
    </nav>
  )
}
