
import { getDictionary } from '@/i18n/server'
import Link from 'next/link'

export default async function Footer({ lang }: { lang: string }) {
  const dict = await getDictionary(lang)
  
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 mt-12 py-8 border-t dark:border-gray-800">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0 text-sm text-gray-500">
          © {new Date().getFullYear()} Ski School OS. All rights reserved.
        </div>
        <div className="flex space-x-6 text-sm">
          <Link href={`/${lang}/terms`} className="text-gray-600 hover:text-blue-600 dark:text-gray-400">
            {lang === 'zh' ? '服务条款' : 'Terms & Conditions'}
          </Link>
          <Link href={`/${lang}/privacy`} className="text-gray-600 hover:text-blue-600 dark:text-gray-400">
             {lang === 'zh' ? '隐私政策' : 'Privacy Policy'}
          </Link>
        </div>
      </div>
    </footer>
  )
}
