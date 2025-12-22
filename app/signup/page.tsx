"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Aurora from '@/components/Aurora';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, CheckCircle2, Circle } from "lucide-react"

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const rules = {
    length: password.length >= 8,
    capital: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  const validationConditions = {
    fullName: fullName.trim().length > 0,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    password: Object.values(rules).every(Boolean),
    confirmPassword: password === confirmPassword && confirmPassword.length > 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setHasSubmitted(true)
    if (Object.values(validationConditions).every(Boolean)) {
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
        router.push("/dashboard")
      }, 1500)
    }
  }

  const getError = (field: keyof typeof validationConditions, message: string) => {
    return hasSubmitted && !validationConditions[field] ? message : ""
  }

  const Rule = ({ label, met }: { label: string, met: boolean }) => (
    <div className={`flex items-center gap-1.5 text-[10px] transition-colors ${met ? 'text-[#FC90AF]' : 'text-gray-500'}`}>
      {met ? <CheckCircle2 size={10} /> : <Circle size={10} />}
      <span>{label}</span>
    </div>
  )

  return (
    <div className="relative min-h-screen bg-[#050010] overflow-hidden">
      <Aurora colorStops={["#FC90AF", "#8F61DB", "#2E36AA"]} blend={0.4} amplitude={2.5} speed={0.4} />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <motion.div initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ duration: 0.6 }}
          className="relative w-full max-w-[750px] bg-opacity-0 rounded-2xl p-6 sm:p-10">
          <div className="text-center text-[#8943ea] jersey-10-regular text-[4rem] sm:text-[5rem] leading-none mb-8">Join Us</div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-300 uppercase tracking-widest ml-1 mb-1">Full Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className={`w-full h-11 px-4 rounded-lg border ${getError('fullName', 'x') ? 'border-red-500' : 'border-white/10'} focus:border-[#8943ea] focus:ring-0 outline-none bg-white/5 text-white transition-all`} placeholder="John Doe" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-300 uppercase tracking-widest ml-1 mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className={`w-full h-11 px-4 rounded-lg border ${getError('email', 'x') ? 'border-red-500' : 'border-white/10'} focus:border-[#8943ea] focus:ring-0 outline-none bg-white/5 text-white transition-all`} placeholder="email@example.com" />
              </div>
              <div className="flex flex-col relative">
                <label className="text-xs font-medium text-gray-300 uppercase tracking-widest ml-1 mb-1">Password</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    className={`w-full h-11 px-4 pr-10 rounded-lg border ${getError('password', 'x') ? 'border-red-500' : 'border-white/10'} focus:border-[#8943ea] focus:ring-0 outline-none bg-white/5 text-white transition-all`} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col relative">
                <label className="text-xs font-medium text-gray-300 uppercase tracking-widest ml-1 mb-1">Confirm Password</label>
                <div className="relative">
                  <input type={showConfirmPass ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full h-11 px-4 pr-10 rounded-lg border ${getError('confirmPassword', 'x') ? 'border-red-500' : 'border-white/10'} focus:border-[#8943ea] focus:ring-0 outline-none bg-white/5 text-white transition-all`} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 px-1">
              <Rule label="8+ Characters" met={rules.length} />
              <Rule label="One Capital" met={rules.capital} />
              <Rule label="One Number" met={rules.number} />
              <Rule label="Special Char" met={rules.special} />
            </div>

            <button type="submit" className="w-full h-12 bg-[#8943ea] text-white font-bold rounded-lg hover:bg-[#FC90AF] mt-2 transition-all shadow-lg shadow-[#8943ea]/20" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
            <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-transparent px-2 text-gray-500 font-bold tracking-tighter">Sign up with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 h-10 rounded-lg border border-white/10 bg-white/5 text-white text-xs hover:bg-white/10 transition-all"> <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
         Google</button>
            <button className="flex items-center justify-center gap-2 h-10 rounded-lg border border-white/10 bg-white/5 text-white text-xs hover:bg-white/10 transition-all">   <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.75 1.18-.15 2.31-.93 3.81-.84 1.53.09 2.69.67 3.34 1.55-3.19 1.92-2.63 6.17.51 7.42-.5 1.35-1.15 2.63-2.69 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>Apple</button>
          </div>

          <div className="flex flex-col items-center justify-center mt-6 gap-2">
            <p className="text-gray-400 text-xs">Already have an account?</p>
            <Link href="/login" className="text-[#8943ea] hover:text-[#FC90AF] transition-colors text-sm font-semibold underline underline-offset-4">Back to Login</Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}