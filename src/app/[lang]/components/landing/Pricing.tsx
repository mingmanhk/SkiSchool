
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function Pricing({ lang }: { lang: string }) {
  const plans = [
    {
      name: "Starter",
      description: "Perfect for new and small programs just getting started.",
      price: "Free",
      features: [
        "Public website builder",
        "Basic program listings",
        "Online registration forms",
        "Email support"
      ],
      cta: "Get Started Free",
      highlight: false
    },
    {
      name: "Pro",
      description: "Everything you need to grow and manage your school.",
      price: "$299",
      priceUnit: "/mo",
      features: [
        "Everything in Starter",
        "Integrated payments & refunds",
        "Instructor scheduling app",
        "Parent portal & messaging",
        "Custom domain & branding",
        "Financial reporting",
        "AI-powered tools"
      ],
      cta: "Start 14-Day Free Trial",
      highlight: true
    },
    {
      name: "Enterprise",
      description: "Advanced control for multi-location organizations.",
      price: "Custom",
      features: [
        "Everything in Pro",
        "Multi-location management",
        "Custom API integrations",
        "Dedicated success manager",
        "SLA & priority support",
        "Custom training & onboarding"
      ],
      cta: "Contact Sales",
      highlight: false
    }
  ]

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-24" id="pricing">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-primary-600 font-semibold tracking-wide uppercase text-sm mb-3">
             Pricing Plans
          </h2>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
            Simple Pricing that Scales
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Start for free, upgrade when you need more power. No hidden fees.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {plans.map((plan, index) => (
            <div key={index} className={`flex flex-col p-8 rounded-3xl bg-white dark:bg-gray-800 transition-all duration-300 ${plan.highlight ? 'border-2 border-primary-500 shadow-2xl scale-105 z-10' : 'border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl'}`}>
              <div className="flex-grow">
                {plan.highlight && (
                    <div className="inline-block px-3 py-1 rounded-full bg-primary-100 text-primary-600 text-xs font-bold uppercase tracking-wide mb-4">
                        Most Popular
                    </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 min-h-[3rem]">{plan.description}</p>
                
                <div className="flex items-baseline mb-8">
                  <span className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">{plan.price}</span>
                  {plan.priceUnit && <span className="text-xl font-medium text-gray-500 dark:text-gray-400 ml-1">{plan.priceUnit}</span>}
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <svg className={`flex-shrink-0 w-5 h-5 mt-1 mr-3 ${plan.highlight ? 'text-primary-500' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                       <span className="text-gray-600 dark:text-gray-300 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Link href={plan.name === 'Enterprise' ? `/${lang}/contact` : '/signup'} className="mt-auto">
                <Button 
                    size="lg" 
                    variant={plan.highlight ? 'default' : 'outline'} 
                    className={`w-full text-lg font-bold h-14 ${!plan.highlight ? 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900' : 'bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/30'}`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
                Prices in USD. Need a custom setup? <Link href={`/${lang}/contact`} className="text-primary-600 font-semibold hover:underline">Contact us</Link>
            </p>
        </div>
      </div>
    </section>
  )
}
