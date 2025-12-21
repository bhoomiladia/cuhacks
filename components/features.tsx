import { ListTodo, Mail, Brain, History } from "lucide-react"
import { Card } from "@/components/ui/card"

const features = [
  {
    icon: ListTodo,
    title: "Smart Task Creation",
    description:
      "Automatically break down complex goals into actionable tasks with intelligent prioritization and scheduling.",
  },
  {
    icon: Mail,
    title: "Email Automation",
    description:
      "Compose, send, and manage emails based on context. Smart follow-ups and response suggestions included.",
  },
  {
    icon: Brain,
    title: "Context Awareness",
    description:
      "Learns from your patterns, preferences, and previous interactions to provide personalized assistance.",
  },
  {
    icon: History,
    title: "Activity Logs",
    description: "Complete transparency with detailed logs of every action taken, decision made, and result achieved.",
  },
]

export function Features() {
  return (
    <section id="features" className="border-b border-border/40 px-4 py-16 md:py-24">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold md:text-4xl">Powerful Features</h2>
          <p className="text-muted-foreground">Everything you need to automate your workflow and boost productivity</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group border-2 border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
