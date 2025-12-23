"use client";

import { motion, Variants } from "framer-motion";
import { ArrowRight, Mic, Play } from "lucide-react";

export const FinalCTA = () => {
  // Explicitly typing the variants to fix the TS error
  const waveVariants: Variants = {
    animate: (i: number) => ({
      scaleY: [1, 1.5, 2.2, 1.2, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        delay: i * 0.1,
        ease: "easeInOut",
      },
    }),
  };

  return (
    <section className="container mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        // Updated to Tailwind v4 canonical classes per your error log
        className="relative overflow-hidden rounded-[48px] border border-white/10 bg-linear-to-b from-white/5 to-transparent backdrop-blur-sm p-12 md:p-24 text-center"
      >
        {/* The Soundwave Visualizer */}
        <div className="flex items-center justify-center gap-1.5 mb-10 h-12">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={waveVariants}
              animate="animate"
              // Updated to bg-linear-to-t
              className="w-1 md:w-1.5 bg-linear-to-t from-purple-500 to-rose-300 rounded-full h-full"
            />
          ))}
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mb-6 inline-flex items-center gap-2 text-purple-300 font-black tracking-[0.4em] uppercase text-[10px]"
          >
            <Mic className="h-3 w-3" />
            Listening for intent
          </motion.div>

          <h2 className="text-5xl md:text-7xl font-bold imbue-bold text-white mb-8 tracking-tighter leading-[0.9]">
            READY TO <br /> 
            <span className="text-purple-300 italic underline decoration-white/10 decoration-2 underline-offset-8">COMMENCE?</span>
          </h2>

          <p className="text-white/50 text-lg mb-12 max-w-xl mx-auto font-light leading-relaxed">
            Experience the full power of Multi-Agent AI. Transform your voice notes into executed emails and verified summaries instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="group relative px-10 py-5 bg-white text-black rounded-full font-bold tracking-widest uppercase text-xs flex items-center gap-2 transition-all hover:pr-12 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Launch Workspace
              <ArrowRight className="h-4 w-4 absolute right-6 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
            </button>
            
            <button className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-full font-bold tracking-widest uppercase text-xs flex items-center gap-3 backdrop-blur-md hover:bg-white/10 transition-all group">
              <Play className="h-3 w-3 fill-white group-hover:scale-110 transition-transform" />
              Watch Demo
            </button>
          </div>
        </div>

        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-600/10 blur-[100px] rounded-full pointer-events-none" />
      </motion.div>
    </section>
  );
};