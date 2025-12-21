"use client"

import { Brain, ListChecks, Zap, CheckCircle2, ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"

const agents = [
  {
    name: "Interpreter",
    icon: Brain,
    description: "Understands your intent and context",
    color: "text-blue-400",
  },
  {
    name: "Planner",
    icon: ListChecks,
    description: "Creates actionable step-by-step plans",
    color: "text-purple-400",
  },
  {
    name: "Executor",
    icon: Zap,
    description: "Performs tasks across integrations",
    color: "text-cyan-400",
  },
  {
    name: "Verifier",
    icon: CheckCircle2,
    description: "Validates results and ensures quality",
    color: "text-green-400",
  },
]

export function AgentFlow() {
  return (
    <section id="how-it-works" className="border-b border-border/40 px-4 py-16 md:py-24">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold md:text-4xl">Multi-Agent System Architecture</h2>
          <p className="text-muted-foreground">
            Four specialized agents working in perfect harmony to execute your tasks
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {agents.map((agent, index) => (
            <div key={agent.name} className="relative flex flex-col items-center">
              <Card className="group relative w-full overflow-hidden border-2 border-border bg-card p-6 text-center transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="relative">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
                    <agent.icon className={`h-7 w-7 ${agent.color}`} />
                  </div>

                  <h3 className="mb-2 text-lg font-semibold">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground">{agent.description}</p>

                  <div className="mt-4 flex items-center justify-center gap-1 text-xs text-primary">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    <span>Active</span>
                  </div>
                </div>
              </Card>

              {index < agents.length - 1 && (
                <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 md:block">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
