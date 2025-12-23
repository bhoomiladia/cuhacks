"use client";
import { motion } from "framer-motion";
import Link from "next/link";
interface HeaderProps {
  onReset: () => void;
}

export const Header = ({ onReset }: HeaderProps) => (
  <motion.header 
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="fixed top-0 w-full z-[60] flex justify-between items-center px-48 scale-110 py-8 pointer-events-auto"
  >
    {/* Clickable Logo */}
    <button 
      onClick={onReset}
      className="text-4xl font-bold tracking-tighter text-white uppercase imbue-bold hover:opacity-70 scale-125 transition-opacity cursor-pointer"
    >
      KAIRO
    </button>

    <div className="flex gap-6 items-center">
    <Link 
        href="/login" 
        className="text-xl font-medium text-white hover:text-purple-300 transition-colors"
      >
        Login
      </Link>
      
      <Link 
        href="/signup"
        className="bg-white text-black hover:bg-purple-200 transition-all rounded-full px-6 py-2 text-md font-bold tracking-widest uppercase shadow-lg shadow-white/5 active:scale-95"
      >
        Sign Up
      </Link>
    </div>
  </motion.header>
);
