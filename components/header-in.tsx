"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export const Header = () => (
  <motion.header 
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="fixed top-0 w-full z-60 flex justify-between items-center px-8 py-6 pointer-events-auto"
  >
    {/* Brand Logo */}
    <Link 
      href="/" 
      className="text-2xl font-bold tracking-tighter text-white uppercase imbue-bold hover:opacity-70 transition-opacity"
    >
      KAIRO
    </Link>

    {/* Auth Navigation */}
    <div className="flex gap-8 items-center">
      <Link 
        href="/login" 
        className="text-lg font-medium text-white hover:text-purple-300 transition-colors"
      >
        Login
      </Link>
      
      <Link 
        href="/signup"
        className="bg-white text-black hover:bg-purple-200 transition-all rounded-full px-7 py-2.5 text-sm font-bold tracking-widest uppercase shadow-xl shadow-white/5 active:scale-95"
      >
        Sign Up
      </Link>
    </div>
  </motion.header>
);