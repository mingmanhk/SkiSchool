import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function Hero({ lang = "en" }: { lang?: string }) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white dark:bg-gray-900">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/95 via-primary-800/80 to-primary-900/40 z-10"></div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
            src="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=2070&auto=format&fit=crop"
            alt="Skiing background"
            className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-6 relative z-20 flex flex-col md:flex-row items-center gap-12 pt-20">
        <div className="md:w-1/2 text-white space-y-8 text-center md:text-left">
            <div className="inline-block px-4 py-1.5 rounded-full bg-accent-500/20 border border-accent-500/30 text-accent-100 text-sm font-semibold backdrop-blur-sm">
                ✨ The Modern OS for Ski Schools
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
                Manage Your <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-primary-200">Snow Sports</span> Business
            </h1>
            <p className="text-xl text-primary-50 max-w-2xl font-light leading-relaxed mx-auto md:mx-0">
                Streamline operations, boost bookings, and delight customers with the all-in-one platform built for ski schools, clubs, and race teams.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
                <Link href="/signup">
                    <Button size="lg" className="w-full sm:w-auto bg-accent-500 hover:bg-accent-600 text-white font-bold shadow-lg shadow-accent-500/30 text-lg h-14 px-8">
                        Get Started for Free
                    </Button>
                </Link>
                <Link href={`/${lang}/contact`}>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm text-lg h-14 px-8">
                        Book a Demo
                    </Button>
                </Link>
            </div>

            <div className="pt-8 flex items-center gap-4 text-sm text-primary-200 justify-center md:justify-start">
                <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-primary-900 flex items-center justify-center text-xs text-black font-bold">JD</div>
                    <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-primary-900 flex items-center justify-center text-xs text-black font-bold">AS</div>
                    <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-primary-900 flex items-center justify-center text-xs text-black font-bold">MK</div>
                    <div className="w-10 h-10 rounded-full bg-primary-600 border-2 border-primary-900 flex items-center justify-center text-xs text-white font-bold">+500</div>
                </div>
                <p>Trusted by instructors worldwide</p>
            </div>
        </div>

        {/* Visual/UI Mockup */}
        <div className="md:w-1/2 relative hidden md:block perspective-1000">
             <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 shadow-2xl hero-card-transform transition-transform duration-700 ease-out">
                <div className="bg-white rounded-lg shadow-inner overflow-hidden aspect-[16/10] relative">
                    <div className="absolute inset-0 bg-gray-100 flex flex-col">
                        {/* Mock UI Header */}
                        <div className="h-12 border-b flex items-center px-4 gap-2 bg-white">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        {/* Mock UI Body */}
                        <div className="flex-1 p-6 flex gap-4">
                            <div className="w-1/4 h-full bg-gray-200 rounded animate-pulse"></div>
                            <div className="flex-1 space-y-4">
                                <div className="h-32 bg-primary-100 rounded border border-primary-200 p-4">
                                    <div className="h-4 w-1/3 bg-primary-300 rounded mb-2"></div>
                                    <div className="h-8 w-1/2 bg-primary-500 rounded"></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="h-24 bg-gray-200 rounded"></div>
                                     <div className="h-24 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
             {/* Decor elements */}
             <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent-500/20 rounded-full blur-3xl mix-blend-screen animate-pulse"></div>
             <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl mix-blend-screen"></div>
        </div>
      </div>
    </section>
  )
}
