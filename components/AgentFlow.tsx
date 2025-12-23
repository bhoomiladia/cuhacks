"use client";
import { motion } from "framer-motion";
import { Brain, ListChecks, Zap, CheckCircle2, ArrowRight } from "lucide-react";

const agents = [
  {
    name: "Interpreter",
    icon: Brain,
    description: "Translates voice & raw intent into structured logic.",
    color: "text-blue-400",
    glow: "group-hover:shadow-blue-500/20",
  },
  {
    name: "Planner",
    icon: ListChecks,
    description: "Architects a prioritized sequence of milestones.",
    color: "text-purple-400",
    glow: "group-hover:shadow-purple-500/20",
  },
  {
    name: "Executor",
    icon: Zap,
    description: "Integrates with tools to perform the autonomous work.",
    color: "text-cyan-400",
    glow: "group-hover:shadow-cyan-500/20",
  },
  {
    name: "Verifier",
    icon: CheckCircle2,
    description: "Validates every result to ensure absolute quality.",
    color: "text-green-400",
    glow: "group-hover:shadow-green-500/20",
  },
];

export const AgentFlow = () => {
  return (
    <section className="container mx-auto px-4 py-32 relative">
      {/* Section Header */}
      <div className="text-center mb-20">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold imbue-bold tracking-tight text-white"
        >
          AGENTIC <span className="text-purple-300">ARCHITECTURE</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/40 text-sm mt-4 tracking-widest uppercase"
        >
          Four specialized minds, one unified execution.
        </motion.p>
      </div>

      {/* Agents Grid */}
      <div className="grid gap-6 md:grid-cols-4 relative">
        {agents.map((agent, index) => (
          <div key={agent.name} className="relative flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              viewport={{ once: true }}
              className={`group relative w-full overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 transition-all duration-500 hover:bg-white/[0.08] hover:border-white/20 hover:shadow-2xl ${agent.glow}`}
            >
              {/* Subtle light sweep on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform duration-500">
                  <agent.icon className={`h-7 w-7 ${agent.color}`} />
                </div>

                <h3 className="mb-3 text-xl font-bold text-white tracking-tight">{agent.name}</h3>
                <p className="text-sm text-white/40 leading-relaxed mb-6">
                  {agent.description}
                </p>

                {/* Status Indicator */}
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-primary uppercase">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                  <span className="text-purple-300/80">Active Neural Node</span>
                </div>
              </div>
            </motion.div>

            {/* Connecting Arrow (Only visible on Desktop between cards) */}
            {index < agents.length - 1 && (
              <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 md:block z-20">
                <motion.div
                  initial={{ opacity: 0, x: 0 }}
                  whileInView={{ opacity: 1, x: 10 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <ArrowRight className="h-5 w-5  text-white" />
                </motion.div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};