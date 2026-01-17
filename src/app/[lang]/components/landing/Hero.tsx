
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function Hero({ lang }: { lang: string }) {
  return (
    <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=2070&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-black/50 bg-gradient-to-t from-gray-900 via-transparent"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center text-white">
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 drop-shadow-2xl tracking-tight">
          Ski School OS
        </h1>
        <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto drop-shadow-lg font-light">
          The ultimate all-in-one platform to manage your ski school, club, or race team.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/signup">
            <Button size="lg">
              Get Started for Free
            </Button>
          </Link>
          <Link href={`/${lang}/contact`}>
            <Button size="lg" variant="outline" className="bg-transparent text-white hover:bg-white/10 border-white">
              Request a Demo
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="absolute bottom-10 left-0 right-0 flex justify-center animate-bounce">
        <svg className="w-8 h-8 text-white opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}
