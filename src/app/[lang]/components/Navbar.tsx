import Link from 'next/link'

export default function Navbar({ lang }: { lang: string }) {
  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm dark:bg-gray-900/80 sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href={`/${lang}`} className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Ski School OS
        </Link>
        <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
                Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
                Pricing
            </Link>
            <Link href={`/${lang}/contact`} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
                Demo
            </Link>
             <Link href="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
                Tenant Login
            </Link>
            <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 px-6 rounded-full transition duration-300 shadow-lg shadow-blue-600/20">
                Get Started
            </Link>
            
            <div className="flex space-x-3 text-xs text-gray-500 border-l pl-6 border-gray-200 dark:border-gray-700">
                <Link href="/en" className={lang === 'en' ? 'font-bold text-gray-900 dark:text-white' : 'hover:text-gray-900 dark:hover:text-white transition'}>EN</Link>
                <Link href="/zh" className={lang === 'zh' ? 'font-bold text-gray-900 dark:text-white' : 'hover:text-gray-900 dark:hover:text-white transition'}>中文</Link>
            </div>
        </div>
      </div>
    </nav>
  )
}
