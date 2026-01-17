
export default function WhySkiSchoolOS() {
  const benefits = [
    { title: "Reduce Admin Workload", desc: "Automate repetitive tasks and save hours every week." },
    { title: "Improve Parent Experience", desc: "Offer a seamless, mobile-friendly registration experience." },
    { title: "Increase Registrations", desc: "Our streamlined flows are designed to reduce drop-offs and boost completion rates." },
    { title: "Centralize Communications", desc: "Keep everyone in the loop with powerful SMS and email tools." },
    { title: "Elevate Your Brand", desc: "Stand out with a modern, professional, and custom-branded website." },
  ]

  return (
    <section className="bg-gray-50 dark:bg-gray-800 py-24">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
             <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
              A Modern Platform Built for the Slopes
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
              Stop fighting with spreadsheets and disjointed tools. Ski School OS brings everything together in a beautifully designed, easy-to-use interface, so you can focus on creating amazing experiences.
            </p>
            <ul className="space-y-6">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center mt-1 mr-4">
                    <span className="text-green-500 text-sm">✓</span>
                  </div>
                  <div>
                    <strong className="text-gray-900 dark:text-white block text-lg">{benefit.title}</strong>
                    <span className="text-gray-600 dark:text-gray-400">{benefit.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:w-1/2">
             <div className="relative bg-white dark:bg-gray-700 rounded-2xl shadow-2xl p-2 aspect-video overflow-hidden border border-gray-200 dark:border-gray-600">
                 {/* Placeholder for Dashboard UI */}
                 <div className="w-full h-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400 font-mono">Dashboard Preview</p>
                 </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  )
}
