
export default function HowItWorks() {
  const steps = [
    { title: "Create Your Account", desc: "Sign up in minutes and tell us about your organization." },
    { title: "Set Up Your Programs", desc: "Define your seasons, programs, schedules, and pricing with our flexible setup tools." },
    { title: "Customize Your Website", desc: "Add your logo, brand colors, and content to create a professional online presence." },
    { title: "Connect Payments", desc: "Link your Stripe account to securely accept online payments." },
    { title: "Launch Registration", desc: "Share your new site and start accepting registrations from families." },
    { title: "Communicate with Ease", desc: "Keep everyone informed with our integrated SMS and email communication center." },
  ]

  return (
    <section className="bg-white dark:bg-gray-900 py-20">
      <div className="container mx-auto px-6">
         <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Get Started in Minutes
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Our intuitive platform makes it easy to get up and running.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-8 mb-10 relative">
               {/* Line connector */}
               {index !== steps.length - 1 && (
                  <div className="absolute left-6 top-12 bottom-[-2.5rem] w-0.5 bg-gray-200 dark:bg-gray-700"></div>
               )}
              
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-xl z-10 shadow-lg">
                {index + 1}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
