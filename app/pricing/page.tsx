import { Card } from "@/components/ui/card"
import { Header } from "@/components/header-in"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, Sparkles, Crown } from "lucide-react"

const plans = [
  {
    name: "Starter",
    icon: Zap,
    price: "29",
    description: "Perfect for individuals getting started with AI automation",
    features: [
      "1,000 tasks per month",
      "4 specialized agents",
      "Basic integrations",
      "Email support",
      "7-day activity history",
      "Community access",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    icon: Sparkles,
    price: "99",
    description: "For professionals who need advanced automation capabilities",
    features: [
      "10,000 tasks per month",
      "4 specialized agents",
      "Advanced integrations",
      "Priority support",
      "90-day activity history",
      "Custom workflows",
      "API access",
      "Team collaboration",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Enterprise",
    icon: Crown,
    price: "Custom",
    description: "For organizations requiring maximum scale and customization",
    features: [
      "Unlimited tasks",
      "Custom agent development",
      "Enterprise integrations",
      "24/7 dedicated support",
      "Unlimited history",
      "Custom workflows",
      "API access",
      "Team collaboration",
      "SLA guarantee",
      "On-premise deployment",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

const faqs = [
  {
    question: "How do agent tasks work?",
    answer:
      "Each task represents a complete workflow processed by our multi-agent system. For example, scheduling a meeting would count as one task, even though multiple agents work together to complete it.",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer:
      "Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades apply at the start of your next billing cycle.",
  },
  {
    question: "What integrations are available?",
    answer:
      "We support popular tools like Gmail, Google Calendar, Slack, Notion, Trello, and many more. Enterprise plans can request custom integrations.",
  },
  {
    question: "Is there a free trial?",
    answer: "Yes! All new users get a 14-day free trial of the Professional plan with no credit card required.",
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-16 text-center">
          <Badge className="mb-4" variant="outline">
            Pricing
          </Badge>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Simple, Transparent Pricing</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Choose the perfect plan for your productivity needs. All plans include our full multi-agent system.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mb-24 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative border-2 bg-card p-8 ${
                plan.popular ? "border-primary shadow-xl shadow-primary/20" : "border-border"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">Most Popular</Badge>
              )}

              <div className="mb-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <plan.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-2xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  {plan.price !== "Custom" && <span className="text-3xl font-bold">$</span>}
                  <span className="text-5xl font-bold">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
                </div>
              </div>

              <Button className="mb-6 w-full" variant={plan.popular ? "default" : "outline"} size="lg">
                {plan.cta}
              </Button>

              <div className="space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* FAQs */}
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-3xl font-bold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.question} className="border-2 border-border bg-card p-6">
                <h3 className="mb-2 text-lg font-semibold">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="mt-16 border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-secondary/10 p-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Transform Your Productivity?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Start your 14-day free trial today. No credit card required.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="gap-2">
              Start Free Trial
              <Zap className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Schedule a Demo
            </Button>
          </div>
        </Card>
      </main>
    </div>
  )
}
