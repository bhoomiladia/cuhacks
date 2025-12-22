"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Aurora from '@/components/Aurora'
import { CheckCircle2, XCircle, Loader2, Search, RefreshCcw } from "lucide-react"

interface User {
  _id: string
  name: string
  email: string
  isVerified: boolean
  role: string
  createdAt: string
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const fetchUsers = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      } else {
        const data = await res.json()
        setError(data.message || 'Failed to fetch users')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="relative min-h-screen bg-[#050010] text-white overflow-hidden p-8">
      <Aurora colorStops={["#FC90AF", "#8F61DB", "#2E36AA"]} blend={0.4} amplitude={2.5} speed={0.4} />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FC90AF] to-[#8F61DB]">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Manage registered users</p>
          </div>
          <button 
            onClick={fetchUsers}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
          >
            <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
            {error}
          </div>
        )}

        <div className="bg-[#23232f]/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#FC90AF]/50 transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-gray-400 text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">
                      <Loader2 className="animate-spin mx-auto mb-2" />
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-white">{user.name}</div>
                      </td>
                      <td className="p-4 text-gray-300">{user.email}</td>
                      <td className="p-4">
                        {user.isVerified ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                            <CheckCircle2 size={12} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                            <Loader2 size={12} /> Pending
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded border ${
                          user.role === 'admin' 
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
