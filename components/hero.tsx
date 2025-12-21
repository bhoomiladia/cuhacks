"use client"

import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/40 px-4 py-24 md:py-32">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px] animate-pulse-glow" />
        <div
          className="absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-secondary/20 blur-[120px] animate-pulse-glow"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="container mx-auto flex flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm animate-slide-up">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">{"Powered by Multi-Agent AI"}</span>
        </div>

        <h1 className="mb-6 max-w-4xl text-balance text-5xl font-bold leading-tight tracking-tight md:text-7xl animate-slide-up">
          From Intent to Action with{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Multi-Agent AI
          </span>
        </h1>

        <p
          className="mb-10 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          Transform your thoughts into real-world actions. Our intelligent multi-agent system interprets, plans,
          executes, and verifies every task with precision and reliability.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <Button size="lg" className="gap-2">
            Start Building
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline">
            Watch Demo
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 border-t border-border/40 pt-8 text-left md:gap-16">
          <div>
            <div className="text-3xl font-bold text-primary">99.9%</div>
            <div className="text-sm text-muted-foreground">Task Success Rate</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">4</div>
            <div className="text-sm text-muted-foreground">Specialized Agents</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">{"<2s"}</div>
            <div className="text-sm text-muted-foreground">Avg Response Time</div>
          </div>
        </div>
      </div>
    </section>
  )
}
