
export default function FAQ() {
  const faqs = [
    {
      question: "Can I try Ski School OS for free?",
      answer: "Yes! We offer a completely free plan for small programs, and a 14-day free trial for our Pro plan so you can test all the advanced features."
    },
    {
      question: "Do I need technical skills to set it up?",
      answer: "Not at all. Our platform is designed to be user-friendly. We also provide a dedicated onboarding specialist for Pro and Enterprise plans to help you get started."
    },
    {
      question: "Does it work for snowboard schools too?",
      answer: "Absolutely! Ski School OS is built for all snow sports schools, including skiing, snowboarding, cross-country, and adaptive programs."
    },
    {
      question: "Can I migrate my data from another system?",
      answer: "Yes, we offer data migration services. Our team can help you import your students, instructors, and past records securely."
    },
    {
      question: "Is my data secure?",
      answer: "Security is our top priority. We use industry-standard encryption, secure payments via Stripe, and regular backups to ensure your data is always safe."
    },
    {
        question: "What hardware do I need?",
        answer: "Ski School OS is cloud-based, so it works on any device with a web browser—laptops, tablets, and smartphones. No special servers required."
    }
  ]

  return (
    <section className="bg-white dark:bg-gray-900 py-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Have questions? We're here to help.
          </p>
        </div>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 hover:bg-white hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{faq.question}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
            <p className="text-gray-600 dark:text-gray-400">
                Still have questions? <a href="/contact" className="text-primary-600 font-semibold hover:underline">Contact our support team</a>
            </p>
        </div>
      </div>
    </section>
  )
}
