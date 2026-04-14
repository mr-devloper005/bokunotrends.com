'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export function LoginForm({
  actionClass,
  mutedClass,
}: {
  actionClass: string
  mutedClass: string
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading } = useAuth()
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    await login(email, password)
    router.push('/classifieds')
    router.refresh()
  }

  return (
    <>
      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
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
          autoComplete="current-password"
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
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <div className={`mt-6 flex items-center justify-between text-sm ${mutedClass}`}>
        <Link href="/forgot-password" className="hover:underline">
          Forgot password?
        </Link>
        <Link href="/register" className="inline-flex items-center gap-2 font-semibold hover:underline">
          <Sparkles className="h-4 w-4" />
          Create account
        </Link>
      </div>
    </>
  )
}
