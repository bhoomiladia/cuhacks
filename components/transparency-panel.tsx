"use client"

import { useState } from "react"
import { Activity, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"

const activityLog = [
  {
    agent: "Interpreter",
    action: 'Analyzed user intent: "Schedule meeting"',
    status: "completed",
    timestamp: "2 seconds ago",
  },
  {
    agent: "Planner",
    action: "Created 3-step execution plan",
    status: "completed",
    timestamp: "3 seconds ago",
  },
  {
    agent: "Executor",
    action: "Checked calendar availability",
    status: "completed",
    timestamp: "4 seconds ago",
  },
  {
    agent: "Executor",
    action: "Sent calendar invites to 5 participants",
    status: "in-progress",
    timestamp: "5 seconds ago",
  },
  {
    agent: "Verifier",
    action: "Awaiting confirmation responses",
    status: "pending",
    timestamp: "5 seconds ago",
  },
]

export function TransparencyPanel() {
  const [selectedLog, setSelectedLog] = useState(0)

  return (
    <section className="border-b border-border/40 px-4 py-16 md:py-24">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold md:text-4xl">Complete Transparency</h2>
          <p className="text-muted-foreground">See exactly what each agent is doing in real-time</p>
        </div>

        <Card className="border-2 border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Live Activity Log</h3>
          </div>

          <div className="space-y-3">
            {activityLog.map((log, index) => (
              <button
                key={index}
                onClick={() => setSelectedLog(index)}
                className={`w-full rounded-lg border p-4 text-left transition-all ${
                  selectedLog === index
                    ? "border-primary/50 bg-primary/5"
                    : "border-border bg-muted/30 hover:border-border/80"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {log.status === "completed" && <CheckCircle2 className="h-5 w-5 text-green-400" />}
                    {log.status === "in-progress" && <Clock className="h-5 w-5 animate-spin text-primary" />}
                    {log.status === "pending" && <AlertCircle className="h-5 w-5 text-yellow-400" />}
                  </div>

                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-sm font-medium text-primary">{log.agent}</span>
                      <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                    </div>
                    <p className="text-sm text-foreground">{log.action}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </section>
  )
}
