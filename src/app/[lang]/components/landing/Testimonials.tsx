
export default function Testimonials() {
  const testimonials = [
    {
      quote: "Ski School OS transformed how we manage our race team. Registration is a breeze, and the communication tools are a lifesaver.",
      name: "Sarah Jenkins",
      role: "Program Director",
      school: "Alpine Racing Club"
    },
    {
      quote: "This platform is a game-changer. We've seen a 40% increase in registration completion since switching.",
      name: "Mike Thompson",
      role: "Head Coach",
      school: "Summit Ski School"
    },
     {
      quote: "Parents love the easy-to-use portal, and our admin staff has saved countless hours. I can't recommend it enough!",
      name: "Emily Chen",
      role: "Operations Manager",
      school: "Valley Winter Sports"
    }
  ]

  return (
    <section className="bg-gray-50 dark:bg-gray-800 py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Trusted by Leading Programs
          </h2>
           <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            See what our customers are saying about Ski School OS.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <div key={index} className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg flex flex-col">
              <div className="flex-grow">
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">"{item.quote}"</p>
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-white">{item.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{item.role}, {item.school}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
