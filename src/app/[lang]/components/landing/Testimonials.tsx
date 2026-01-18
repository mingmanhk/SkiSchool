
export default function Testimonials() {
  const testimonials = [
    {
      quote: "Ski School OS transformed how we manage our race team. Registration is a breeze, and the communication tools are a lifesaver.",
      name: "Sarah Jenkins",
      role: "Program Director",
      school: "Alpine Racing Club",
    },
    {
      quote: "This platform is a game-changer. We've seen a 40% increase in registration completion since switching from paper forms.",
      name: "Mike Thompson",
      role: "Head Coach",
      school: "Summit Ski School",
    },
     {
      quote: "Parents love the easy-to-use portal, and our admin staff has saved countless hours. I can't recommend it enough!",
      name: "Emily Chen",
      role: "Operations Manager",
      school: "Valley Winter Sports",
    }
  ]

  return (
    <section className="bg-white dark:bg-gray-900 py-24 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-10 right-10 w-64 h-64 bg-accent-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
            Trusted by the Best
          </h2>
           <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join hundreds of programs that have modernized their operations with Ski School OS.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <div key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col hover:transform hover:scale-105 transition-all duration-300">
              <div className="flex-grow">
                 <div className="text-primary-500 mb-4 flex gap-1">
                     {[1,2,3,4,5].map(star => (
                         <span key={star} className="text-xl">★</span>
                     ))}
                 </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg italic">"{item.quote}"</p>
              </div>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden relative flex-shrink-0">
                    {/* Placeholder Avatar */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary-400 to-accent-400 opacity-80"></div>
                     <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
                        {item.name.charAt(0)}
                     </span>
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{item.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{item.role}</div>
                  <div className="text-xs text-primary-600 dark:text-primary-400 font-semibold">{item.school}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
