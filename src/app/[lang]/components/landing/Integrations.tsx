
export default function Integrations() {
  return (
      <section className="py-20 bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 text-center">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">
                Seamlessly Integrates With Your Favorite Tools
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 hover:opacity-100 transition-opacity duration-300">
                {/* Stripe */}
                <div className="flex items-center gap-2 text-3xl font-bold text-gray-400 hover:text-[#635BFF] transition-colors">
                    <span>stripe</span>
                </div>
                {/* Supabase */}
                <div className="flex items-center gap-2 text-3xl font-bold text-gray-400 hover:text-[#3ECF8E] transition-colors">
                    <span>Supabase</span>
                </div>
                 {/* Vercel */}
                <div className="flex items-center gap-2 text-3xl font-bold text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                    <span>▲ Vercel</span>
                </div>
                 {/* SendGrid */}
                <div className="flex items-center gap-2 text-3xl font-bold text-gray-400 hover:text-[#1A82E2] transition-colors">
                    <span>Twilio SendGrid</span>
                </div>
            </div>
        </div>
      </section>
  )
}
