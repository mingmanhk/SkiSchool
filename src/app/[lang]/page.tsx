
import Navbar from './components/Navbar'
import Hero from './components/landing/Hero'
import CoreFeatures from './components/landing/CoreFeatures'
import WhoItIsFor from './components/landing/WhoItIsFor'
import Integrations from './components/landing/Integrations'
import Testimonials from './components/landing/Testimonials'
import Pricing from './components/landing/Pricing'
import FAQ from './components/landing/FAQ'
import Footer from '@/components/Footer'

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
      <Navbar lang={lang} />
      
      <main className="overflow-hidden">
        <Hero lang={lang} />
        <CoreFeatures />
        <Testimonials />
        <WhoItIsFor />
        <Integrations />
        <Pricing lang={lang} />
        <FAQ />
      </main>

      <Footer />
    </div>
  )
}
