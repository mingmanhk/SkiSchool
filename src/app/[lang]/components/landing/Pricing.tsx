
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function Pricing({ lang }: { lang: string }) {
  const plans = [
    {
      name: "Starter",
      description: "Perfect for new and small programs.",
      price: "Free",
      features: [
        "Public website",
        "Program listings",
        "Basic registration",
        "Email support"
      ],
      cta: "Get Started",
      highlight: false
    },
    {
      name: "Pro",
      description: "For growing schools that need more power.",
      price: "$299",
      priceUnit: "/mo",
      features: [
        "Everything in Starter",
        "Full registration system",
        "Online payments",
        "Communication Center",
        "Custom domain & branding",
        "QuickBooks integration",
        "AI-powered tools",
        "Priority support"
      ],
      cta: "Start 14-day Free Trial",
      highlight: true
    },
    {
      name: "Enterprise",
      description: "For multi-location organizations.",
      price: "Custom",
      features: [
        "Everything in Pro",
        "Multi-location support",
        "Dedicated onboarding",
        "Custom integrations & APIs",
        "SLA & premium support"
      ],
      cta: "Contact Sales",
      highlight: false
    }
  ]

  return (
    <section className="bg-gray-50 dark:bg-gray-800 py-20" id="pricing">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose the plan that's right for your program. No hidden fees, ever.
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
          {plans.map((plan, index) => (
            <div key={index} className={`flex flex-col p-8 rounded-2xl border ${plan.highlight ? 'border-primary-500 shadow-2xl scale-105' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-900 transition-all`}>
              <div className="flex-grow">
                {plan.highlight && <div className="text-primary-500 text-sm font-bold uppercase tracking-wide mb-2">Most Popular</div>}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{plan.description}</p>
                <div className="text-5xl font-extrabold text-gray-900 dark:text-white mb-1">
                  {plan.price}
                  {plan.priceUnit && <span className="text-lg font-medium text-gray-500 dark:text-gray-400 ml-1">{plan.priceUnit}</span>}
                </div>
                
                <ul className="my-8 space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center mr-3">
                        <span className="text-green-500 text-xs">✓</span>
                      </div>
                       <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Link href="/signup">
                <Button size="lg" variant={plan.highlight ? 'default' : 'secondary'} className="w-full">
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
