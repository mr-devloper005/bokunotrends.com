'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, MapPin } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { saveToStorage, loadFromStorage, storageKeys } from '@/lib/local-storage'
import { CLASSIFIED_REGIONS } from '@/lib/classifieds-regions'
import { cn } from '@/lib/utils'

export function HeroLocationPicker({ className }: { className?: string }) {
  const router = useRouter()
  const [label, setLabel] = useState('Bangladesh')

  useEffect(() => {
    const stored = loadFromStorage<string>(storageKeys.classifiedRegion, '')
    const match = CLASSIFIED_REGIONS.find((r) => r.value === stored)
    setLabel(match?.label ?? 'Bangladesh')
  }, [])

  const onSelect = (value: string, displayLabel: string) => {
    setLabel(displayLabel)
    saveToStorage(storageKeys.classifiedRegion, value)
    const params = new URLSearchParams()
    if (value) params.set('location', value)
    const qs = params.toString()
    router.push(qs ? `/classifieds?${qs}` : '/classifieds')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-emerald-50/95 backdrop-blur-sm outline-none transition hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/40',
            className,
          )}
        >
          <MapPin className="h-4 w-4" />
          {label}
          <ChevronDown className="h-4 w-4 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="min-w-[200px] border-emerald-900/15 bg-[#0a1f19] p-1 text-white shadow-xl">
        {CLASSIFIED_REGIONS.map((r) => (
          <DropdownMenuItem
            key={r.value || 'bd-all'}
            className="cursor-pointer rounded-lg text-emerald-50 focus:bg-white/10 focus:text-white"
            onSelect={() => onSelect(r.value, r.label)}
          >
            {r.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
