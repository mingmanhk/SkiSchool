
export default function CoreFeatures() {
  const features = [
    {
      title: "Online Registration",
      desc: "Streamline your sign-up process with our intuitive registration flows for new and returning families.",
      icon: "📝"
    },
    {
      title: "Integrated Payments",
      desc: "Securely process payments with Stripe, manage refunds, and automate invoicing.",
      icon: "💳"
    },
    {
      title: "Program Management",
      desc: "Easily create and manage your programs, set capacities, and define schedules.",
      icon: "📅"
    },
    {
      title: "Communication Center",
      desc: "Keep everyone informed with targeted announcements via SMS and email.",
      icon: "💬"
    },
    {
      title: "Custom-Branded Website",
      desc: "Showcase your brand with a customizable website that reflects your identity.",
      icon: "🎨"
    },
    {
      title: "QuickBooks Integration",
      desc: "Sync your financial data automatically to save time and reduce errors.",
      icon: "📊"
    },
    {
      title: "AI-Assisted Tools",
      desc: "Leverage AI to help you write program descriptions, draft messages, and more.",
      icon: "🤖"
    },
    {
      title: "Advanced Admin Portal",
      desc: "Manage your operations with powerful tools, roles, and permissions.",
      icon: "🔐"
    }
  ]

  return (
    <section className="bg-white dark:bg-gray-900 py-20" id="features">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            A Powerful All-in-One Platform
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-3xl mx-auto">
            Ski School OS provides all the tools you need to manage your program efficiently, so you can focus on what you do best.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-8 bg-gray-50 dark:bg-gray-800 rounded-xl transition-all duration-300 hover:bg-white hover:dark:bg-gray-700 hover:shadow-2xl">
              <div className="text-5xl mb-5 text-primary-500">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
