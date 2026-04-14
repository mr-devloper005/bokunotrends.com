'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export function RegisterForm({
  actionClass,
  mutedClass,
}: {
  actionClass: string
  mutedClass: string
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signup, isLoading } = useAuth()
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    await signup(name, email, password)
    router.push('/classifieds')
    router.refresh()
  }

  return (
    <>
      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <input
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 rounded-xl border border-current/10 bg-transparent px-4 text-sm"
          placeholder="Full name"
        />
        <input
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 rounded-xl border border-current/10 bg-transparent px-4 text-sm"
          placeholder="Email address"
        />
        <input
          required
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 rounded-xl border border-current/10 bg-transparent px-4 text-sm"
          placeholder="Password"
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold disabled:opacity-60 ${actionClass}`}
        >
          {isLoading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <div className={`mt-6 flex items-center justify-between text-sm ${mutedClass}`}>
        <span>Already have an account?</span>
        <Link href="/login" className="inline-flex items-center gap-2 font-semibold hover:underline">
          <Sparkles className="h-4 w-4" />
          Sign in
        </Link>
      </div>
    </>
  )
}
