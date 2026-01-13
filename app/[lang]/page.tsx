
import { getDictionary } from '@/src/i18n/server'
import Navbar from './components/Navbar'

export default async function Page({ params }: { params: { lang: string } }) {
  const dict = await getDictionary(params.lang)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar lang={params.lang} />
      
      <main className="container mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {dict.nav.home}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
           Welcome to the Multi-Language Ski School Platform.
        </p>
        
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto dark:bg-gray-800">
            <h2 className="text-2xl font-semibold mb-4">{dict.cart.title}</h2>
            <p className="text-gray-500">{dict.cart.empty}</p>
        </div>
      </main>
    </div>
  )
}
