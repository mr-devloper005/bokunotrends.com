'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

export function NavbarAuthControls({ variant = 'default' }: { variant?: 'default' | 'classified' }) {
  const { user } = useAuth()
  const isClassifiedShell = variant === 'classified'

  return (
    <div
      className={cn(
        'pointer-events-none flex select-none items-center gap-2',
        isClassifiedShell
          ? 'h-10 rounded-full border border-white/15 bg-white/10 px-2 pr-3 text-white'
          : 'rounded-full border border-[rgba(110,26,55,0.12)] bg-transparent px-1 py-1 pr-2',
      )}
      role="group"
      aria-label={user?.name ? `Account: ${user.name}` : 'Signed in'}
    >
      <Avatar className={cn(isClassifiedShell ? 'h-8 w-8 border border-white/20' : 'h-9 w-9 border border-[rgba(110,26,55,0.12)]')}>
        <AvatarImage src={user?.avatar} alt="" />
        <AvatarFallback className={isClassifiedShell ? 'bg-[#00A86B] text-white' : ''}>
          {user?.name?.charAt(0) ?? '?'}
        </AvatarFallback>
      </Avatar>
      {isClassifiedShell ? (
        <span className="hidden max-w-[140px] truncate text-sm font-medium sm:inline">{user?.name}</span>
      ) : null}
    </div>
  )
}
