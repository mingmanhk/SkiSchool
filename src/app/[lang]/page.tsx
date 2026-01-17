import Navbar from './components/Navbar'
import Hero from './components/landing/Hero'
import WhoItIsFor from './components/landing/WhoItIsFor'
import CoreFeatures from './components/landing/CoreFeatures'
import WhySkiSchoolOS from './components/landing/WhySkiSchoolOS'
import Pricing from './components/landing/Pricing'
import HowItWorks from './components/landing/HowItWorks'
import Testimonials from './components/landing/Testimonials'
import Footer from '@/components/Footer'

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar lang={lang} />
      
      <main>
        <Hero lang={lang} />
        <WhoItIsFor />
        <CoreFeatures />
        <WhySkiSchoolOS />
        <Pricing lang={lang} />
        <HowItWorks />
        <Testimonials />
      </main>

      <Footer />
    </div>
  )
}
