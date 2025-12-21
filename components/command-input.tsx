"use client"

import type React from "react"

import { useState } from "react"
import { Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function CommandInput() {
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    setIsProcessing(true)
    // Simulate processing
    setTimeout(() => setIsProcessing(false), 2000)
  }

  const suggestions = [
    "Schedule a meeting with the team for next Monday",
    "Send a follow-up email to all clients from last week",
    "Create a task list for Q1 product launch",
    "Analyze my productivity patterns this month",
  ]

  return (
    <section className="border-b border-border/40 px-4 py-16 md:py-24">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h2 className="mb-3 text-3xl font-bold md:text-4xl">What do you want to accomplish?</h2>
          <p className="text-muted-foreground">
            Type your intent in natural language and let our agents handle the rest
          </p>
        </div>

        <Card className="relative overflow-hidden border-2 border-primary/20 bg-card p-6 shadow-2xl shadow-primary/10">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g., Schedule a team meeting for next Monday at 2pm..."
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {isProcessing && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Sparkles className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
            </div>
            <Button type="submit" size="lg" disabled={isProcessing} className="gap-2">
              <Send className="h-4 w-4" />
              Execute
            </Button>
          </form>

          <div className="mt-6">
            <p className="mb-3 text-sm font-medium text-muted-foreground">Suggested commands:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setInput(suggestion)}
                  className="rounded-md border border-border bg-muted/50 px-3 py-1.5 text-xs transition-colors hover:bg-muted hover:border-primary/50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
