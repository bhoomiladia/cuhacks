"use client";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Play } from "lucide-react";
import Link from "next/link";
export const HeroContent = () => (
  <section className="container mx-auto px-4 text-center mt-48 mb-32 scale-110">
    {/* Badge */}
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-4 py-1.5 text-xs text-purple-200"
    >
      <Sparkles className="h-3 w-3" />
      <span className="tracking-widest uppercase font-light">Powered by Multi-Agent AI</span>
    </motion.div>

    {/* Title */}
    <h1 className="mb-6 max-w-5xl text-white mx-auto text-6xl md:text-8xl font-bold tracking-tighter leading-[0.85] imbue-bold">
      INTENT TO <span className="text-purple-300 italic">ACTION</span>
    </h1>

    {/* Description */}
    <p className="mb-10 max-w-xl mx-auto text-lg text-white/50 leading-relaxed font-light">
      Stop managing tasks. Start leading agents. Kairo interprets your voice, plans your workflow, and executes your emails.
    </p>

    {/* Buttons Section */}
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
    >
      <Link href='/signup' className="group relative px-8 py-4 bg-white text-black rounded-full font-bold tracking-widest uppercase text-xs flex items-center gap-2 overflow-hidden transition-all hover:pr-10 active:scale-95">
        <span className="relative z-10">Start Building</span>
        <ArrowRight className="h-4 w-4 transition-all group-hover:translate-x-1" />
        <div className="absolute inset-0 bg-purple-200 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      </Link >

      <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-bold tracking-widest uppercase text-xs flex items-center gap-2 backdrop-blur-md transition-all hover:bg-white/10 active:scale-95">
        <Play className="h-3 w-3 fill-current" />
        Watch Demo
      </button>
    </motion.div>

    {/* Stats Grid */}
    <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto border-t border-white/10 pt-12">
      {[
        { label: "Success Rate", value: "99.9%" },
        { label: "Specialized Agents", value: "4" },
        { label: "Response Time", value: "<2s" },
      ].map((stat, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + (i * 0.1) }}
          className="relative group p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md transition-all hover:bg-white/[0.06] hover:border-white/20 shadow-xl shadow-purple-500/5"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-1">
            {stat.value}
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">
            {stat.label}
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);