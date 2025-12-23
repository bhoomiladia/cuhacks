"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import Aurora from '@/components/Aurora';
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"

// 1. Move the verification logic into a sub-component
function VerifyContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided.')
      return
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await res.json()

        if (res.ok) {
          setStatus('success')
          setMessage(data.message)
        } else {
          setStatus('error')
          setMessage(data.message)
        }
      } catch (error) {
        setStatus('error')
        setMessage('Something went wrong. Please try again.')
      }
    }

    verifyEmail()
  }, [token])

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center"
    >
      <div className="flex justify-center mb-6">
        {status === 'loading' && <Loader2 size={48} className="text-[#FC90AF] animate-spin" />}
        {status === 'success' && <CheckCircle2 size={48} className="text-green-400" />}
        {status === 'error' && <XCircle size={48} className="text-red-400" />}
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">
        {status === 'loading' && 'Verifying...'}
        {status === 'success' && 'Email Verified!'}
        {status === 'error' && 'Verification Failed'}
      </h1>

      <p className="text-gray-300 mb-8">
        {status === 'loading' && 'Please wait while we verify your email address.'}
        {message}
      </p>

      {status !== 'loading' && (
        <Link 
          href="/login" 
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#FC90AF] text-white font-semibold hover:bg-[#8F61DB] transition-all"
        >
          Go to Login
        </Link>
      )}
    </motion.div>
  )
}

// 2. The main export just provides the layout and the Suspense wrapper
export default function VerifyPage() {
  return (
    <div className="relative min-h-screen bg-[#050010] overflow-hidden flex items-center justify-center">
      <Aurora colorStops={["#FC90AF", "#8F61DB", "#2E36AA"]} blend={0.4} amplitude={2.5} speed={0.4} />
      
      <Suspense fallback={
        <div className="z-10 text-white/50 animate-pulse uppercase tracking-widest text-xs">
          Initializing Verification...
        </div>
      }>
        <VerifyContent />
      </Suspense>
    </div>
  )
}