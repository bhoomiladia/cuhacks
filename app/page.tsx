import { Hero } from "@/components/hero"
import { CommandInput } from "@/components/command-input"
import { AgentFlow } from "@/components/agent-flow"
import { Features } from "@/components/features"
import { Header } from "@/components/header"

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="flex flex-col">
        <Hero />
        <CommandInput />
        <AgentFlow />
        <Features />
      </main>
    </div>
  )
}
