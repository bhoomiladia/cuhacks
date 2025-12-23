"use client";

import ShaderCanvas from "@/components/dynamic-waveform";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeroContent } from "@/components/Hero";
import { Header } from "@/components/Header"; 
import { Footer } from "@/components/Footer"; 
import { AgentFlow } from "@/components/AgentFlow"; 
import { FinalCTA } from "@/components/CTA";
const DEFAULT_PROPS = {
  color2: "#E0B1CB",
  color1: "#231942",
  speed: 0.6,
  complexity: 4.0,
  amplitude: 2.0,
  frequency: 25.0,
  mouseDistortion: 0.1,
};

export default function DemoOne() {
  const [isStarted, setIsStarted] = useState(false);
  const [showWebsite, setShowWebsite] = useState(false);

  const handleStart = () => {
    setIsStarted(true);
    setTimeout(() => {
      setShowWebsite(true);
    }, 3200); 
  };

  const handleReset = () => {
    // 1. Scroll to top first
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // 2. Small timeout to allow the scroll to finish before resetting states
    setTimeout(() => {
      setShowWebsite(false);
      setIsStarted(false);
    }, 500); // Adjust based on scroll distance/speed
  };
  const DURATION = 2.5; 
  const DELAY = 0.1;

  // Handles the logic to show the website after animation finishes
 

  const textContent = (isReflected = false) => (
    <motion.div 
      className={`relative flex items-center justify-center text-white text-[clamp(150px,25vw,300px)] tracking-tighter uppercase imbue-bold pointer-events-none ${isReflected ? 'opacity-20' : ''}`}
      style={isReflected ? { 
        transform: 'scaleY(-1)', 
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 40%, black 100%)',
        maskImage: 'linear-gradient(to bottom, transparent 40%, black 100%)'
      } : {}}
    >
      <motion.span 
        initial={{ x: -30, opacity: 1 }}
        animate={isStarted ? { opacity: 0, x: -600 } : {}}
        transition={{ duration: 1.2, delay: DELAY, ease: "easeOut" }}
      >K</motion.span>
      
      <motion.span 
        initial={{ x: 0 }}
        animate={isStarted ? { x: [0, -250, -250, 100 - 45 + 20] } : {}} 
        transition={{ duration: DURATION, delay: DELAY, times: [0, 0.4, 0.65, 0.9], ease: "easeInOut" }}
      >A</motion.span>
      
      <motion.span 
        initial={{ x: 20 }}
        animate={isStarted ? { x: [20, 250, 250, 100 + 45 - 20 - 20] } : {}}
        transition={{ duration: DURATION, delay: DELAY, times: [0, 0.4, 0.65, 0.9], ease: "easeInOut" }}
      >I</motion.span>
      
      <motion.span 
        initial={{ x: 35, opacity: 1 }}
        animate={isStarted ? { opacity: 0, x: 400 } : {}}
        transition={{ duration: 1.2, delay: DELAY, ease: "easeOut" }}
      >R</motion.span>
      
      <motion.span 
        initial={{ x: 15, opacity: 1 }}
        animate={isStarted ? { opacity: 0, x: 800 } : {}}
        transition={{ duration: 1.2, delay: DELAY, ease: "easeOut" }}
      >O</motion.span>

      {!isReflected && (
        <motion.div 
          initial={{ opacity: 0, letterSpacing: "0.2em" }}
          animate={isStarted ? { opacity: [0, 1, 1, 0], letterSpacing: "1.2em" } : { opacity: 0 }}
          transition={{ 
            delay: 2.2, 
            duration: 1.5, 
            times: [0, 0.1, 0.8, 1], // Fades in, stays, then fades out
            ease: "easeOut" 
          }}
          className="absolute top-[75%] ml-8 text-xl md:text-2xl font-light text-purple-200"
        >
          POWERED
        </motion.div>
      )}
    </motion.div>
  );

  return (
    <div className={`relative w-screen ${showWebsite ? "min-h-screen overflow-y-auto" : "h-screen overflow-hidden"} bg-black font-sans`}>
      {/* Background stays fixed */}
      <div className="fixed inset-0 w-full h-full">
        <ShaderCanvas {...DEFAULT_PROPS} />
      </div>

      <Header onReset={handleReset} />

      <main className="relative z-20">
        <AnimatePresence>
          {!showWebsite && (
            <motion.div 
              key="intro"
              exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              transition={{ duration: 0.8 }}
              className="h-screen flex flex-col items-center justify-center pt-20"
            >
              <div className="relative flex flex-col items-center">
                {textContent(false)}
                <div className="absolute top-full -mt-60 pointer-events-none">
                  {textContent(true)}
                </div>
              </div>

              <div className="h-20 flex items-center justify-center mt-24">
                {!isStarted && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onClick={handleStart}
                    className="px-10 py-3 bg-white text-black rounded-full font-bold tracking-[0.2em] hover:bg-purple-200 transition-colors pointer-events-auto z-30"
                  >
                    GET STARTED
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Website Content - Only shows after animation finishes */}
        <AnimatePresence>
          {showWebsite && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative w-full"
            >
              <HeroContent />
              <AgentFlow />
              <FinalCTA />
              <Footer/>
              {/* You can add AgentFlow and Features here later */}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}