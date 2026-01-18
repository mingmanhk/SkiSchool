
export default function WhoItIsFor() {
  const useCases = [
    {
      title: "Ski Schools",
      description: "Manage hundreds of instructors and thousands of lessons efficiently.",
      features: ["Instructor scheduling", "Lesson assignment", "Payroll management"],
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: "bg-primary-500" // using primary instead of blue-500
    },
    {
      title: "Race Teams",
      description: "Track athlete progress, competition results, and training schedules.",
      features: ["Performance tracking", "Event registration", "Team communication"],
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: "bg-accent-500" // using accent instead of orange-500
    },
    {
      title: "Clubs & Camps",
      description: "Handle seasonal enrollments, memberships, and multi-day programs.",
      features: ["Membership management", "Seasonal programs", "Group communication"],
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "bg-green-500"
    }
  ]

  return (
    <section className="bg-white dark:bg-gray-800 py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Tailored for Your Organization</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Whether you're running a massive ski school or a specialized race team, we have the tools you need.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <div key={index} className="relative group overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-8 hover:shadow-2xl transition-all duration-300">
              <div className={`absolute top-0 right-0 w-32 h-32 ${useCase.color} opacity-10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500`}></div>
              
              <div className={`w-16 h-16 ${useCase.color} rounded-2xl flex items-center justify-center shadow-lg mb-6 transform group-hover:rotate-6 transition-transform duration-300`}>
                {useCase.icon}
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{useCase.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 min-h-[3rem]">
                {useCase.description}
              </p>
              
              <ul className="space-y-3">
                {useCase.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-gray-700 dark:text-gray-300">
                    <svg className={`w-5 h-5 mr-3 ${useCase.color.replace('bg-', 'text-')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                <a href="#" className={`text-sm font-bold ${useCase.color.replace('bg-', 'text-')} flex items-center group-hover:translate-x-2 transition-transform`}>
                  Learn more <span className="ml-2">→</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
