"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Aurora from '@/components/Aurora';
import { Eye, EyeOff, AlertCircle, CheckCircle2, Circle } from "lucide-react"

export default function SetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [serverError, setServerError] = useState("")

  const rules = {
    length: password.length >= 8,
    capital: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  const validationConditions = {
    password: Object.values(rules).every(Boolean),
    confirmPassword: password === confirmPassword && confirmPassword.length > 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setHasSubmitted(true)
    setServerError("")
    
    if (Object.values(validationConditions).every(Boolean)) {
      setIsLoading(true)
      try {
        const res = await fetch('/api/auth/set-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        });

        const data = await res.json();

        if (res.ok) {
          router.push("/dashboard")
        } else {
          setServerError(data.message || "Failed to set password");
        }
      } catch (error) {
        setServerError("Failed to connect to server");
      } finally {
        setIsLoading(false)
      }
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
          className="relative w-full max-w-[450px] bg-opacity-0 rounded-2xl p-6 sm:p-10">
          <div className="text-center text-[#8943ea] jersey-10-regular text-[4rem] leading-none mb-4">Set Password</div>
          <p className="text-gray-400 text-xs text-center mb-8">
            Create a password to enable email login for your account.
          </p>

          {serverError && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
              {serverError}
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
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

            <div className="grid grid-cols-2 gap-2 mt-2 px-1">
              <Rule label="8+ Characters" met={rules.length} />
              <Rule label="One Capital" met={rules.capital} />
              <Rule label="One Number" met={rules.number} />
              <Rule label="Special Char" met={rules.special} />
            </div>

            <button type="submit" className="w-full h-12 bg-[#8943ea] text-white font-bold rounded-lg hover:bg-[#FC90AF] mt-2 transition-all shadow-lg shadow-[#8943ea]/20" disabled={isLoading}>
              {isLoading ? "Save Password" : "Set Password"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
