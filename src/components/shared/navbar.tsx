'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Menu, X, User, FileText, Building2, LayoutGrid, Tag, Image as ImageIcon, ChevronRight, MapPin, Plus, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { cn } from '@/lib/utils'
import { siteContent } from '@/config/site.content'
import { getFactoryState } from '@/design/factory/get-factory-state'
import { NAVBAR_OVERRIDE_ENABLED, NavbarOverride } from '@/overrides/navbar'

const NavbarAuthControls = dynamic(() => import('@/components/shared/navbar-auth-controls').then((mod) => mod.NavbarAuthControls), {
  ssr: false,
  loading: () => null,
})

const taskIcons: Record<TaskKey, any> = {
  article: FileText,
  listing: Building2,
  sbm: LayoutGrid,
  classified: Tag,
  image: ImageIcon,
  profile: User,
  social: LayoutGrid,
  pdf: FileText,
  org: Building2,
  comment: FileText,
}

const variantClasses = {
  'compact-bar': {
    shell: 'border-b border-slate-200/80 bg-white/88 text-slate-950 backdrop-blur-xl',
    logo: 'rounded-2xl border border-slate-200 bg-white shadow-sm',
    active: 'bg-slate-950 text-white',
    idle: 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
    cta: 'rounded-full bg-slate-950 text-white hover:bg-slate-800',
    mobile: 'border-t border-slate-200/70 bg-white/95',
  },
  'editorial-bar': {
    shell: 'border-b border-[#d7c4b3] bg-[#fff7ee]/90 text-[#2f1d16] backdrop-blur-xl',
    logo: 'rounded-full border border-[#dbc6b6] bg-white shadow-sm',
    active: 'bg-[#2f1d16] text-[#fff4e4]',
    idle: 'text-[#72594a] hover:bg-[#f2e5d4] hover:text-[#2f1d16]',
    cta: 'rounded-full bg-[#2f1d16] text-[#fff4e4] hover:bg-[#452920]',
    mobile: 'border-t border-[#dbc6b6] bg-[#fff7ee]',
  },
  'floating-bar': {
    shell: 'border-b border-transparent bg-transparent text-white',
    logo: 'rounded-[1.35rem] border border-white/12 bg-white/8 shadow-[0_16px_48px_rgba(15,23,42,0.22)] backdrop-blur',
    active: 'bg-[#8df0c8] text-[#07111f]',
    idle: 'text-slate-200 hover:bg-white/10 hover:text-white',
    cta: 'rounded-full bg-[#8df0c8] text-[#07111f] hover:bg-[#77dfb8]',
    mobile: 'border-t border-white/10 bg-[#09101d]/96',
  },
  'utility-bar': {
    shell: 'border-b border-[#d7deca] bg-[#f4f6ef]/94 text-[#1f2617] backdrop-blur-xl',
    logo: 'rounded-xl border border-[#d7deca] bg-white shadow-sm',
    active: 'bg-[#1f2617] text-[#edf5dc]',
    idle: 'text-[#56604b] hover:bg-[#e7edd9] hover:text-[#1f2617]',
    cta: 'rounded-lg bg-[#1f2617] text-[#edf5dc] hover:bg-[#2f3a24]',
    mobile: 'border-t border-[#d7deca] bg-[#f4f6ef]',
  },
} as const

const directoryPalette = {
  'directory-clean': {
    shell: 'border-b border-white/10 bg-[#051B15] text-white shadow-[0_1px_0_rgba(0,0,0,0.2)] backdrop-blur-xl xl:border-r',
    logo: 'rounded-xl border border-white/15 bg-white/10',
    nav: 'text-emerald-100/90 hover:text-white',
    search: 'border border-white/12 bg-white/10 text-emerald-50',
    cta: 'bg-[#00A86B] text-white hover:bg-[#009060]',
    post: 'border border-white/12 bg-white/8 text-white hover:bg-white/14',
    mobile: 'border-t border-white/10 bg-[#051B15]',
    navActive: 'bg-[#00A86B] text-white',
  },
  'market-utility': {
    shell: 'border-b border-white/10 bg-[#051B15] text-white shadow-[0_1px_0_rgba(0,0,0,0.2)] backdrop-blur-xl xl:border-r',
    logo: 'rounded-xl border border-white/15 bg-white/10',
    nav: 'text-emerald-100/90 hover:text-white',
    search: 'border border-white/12 bg-white/10 text-emerald-50',
    cta: 'bg-[#00A86B] text-white hover:bg-[#009060]',
    post: 'border border-white/12 bg-white/8 text-white hover:bg-white/14',
    mobile: 'border-t border-white/10 bg-[#051B15]',
    navActive: 'bg-[#00A86B] text-white',
  },
} as const

export function Navbar() {
  if (NAVBAR_OVERRIDE_ENABLED) {
    return <NavbarOverride />
  }

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { isAuthenticated, hasHydrated, logout } = useAuth()
  const { recipe } = getFactoryState()

  const navigation = useMemo(() => SITE_CONFIG.tasks.filter((task) => task.enabled && task.key !== 'profile'), [])
  const primaryNavigation = navigation.slice(0, 5)
  const mobileNavigation = navigation.map((task) => ({
    name: task.label,
    href: task.route,
    icon: taskIcons[task.key] || LayoutGrid,
  }))
  const isDirectoryProduct = recipe.homeLayout === 'listing-home' || recipe.homeLayout === 'classified-home'

  if (isDirectoryProduct) {
    const palette = directoryPalette[(recipe.brandPack === 'market-utility' ? 'market-utility' : 'directory-clean') as keyof typeof directoryPalette]

    return (
      <>
        <header className={cn('sticky top-0 z-50 w-full xl:hidden', palette.shell)}>
          <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <Link href="/" className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden">
                  <img src="/favicon.png?v=20260401" alt={`${SITE_CONFIG.name} logo`} width="44" height="44" className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0">
                  <span className="block truncate text-lg font-semibold">{SITE_CONFIG.name}</span>
                  <span className="block truncate text-[10px] uppercase tracking-[0.22em] opacity-60">{siteContent.navbar.tagline}</span>
                </div>
              </Link>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {!hasHydrated ? (
                <div className="h-9 w-28 animate-pulse rounded-full bg-white/10" aria-hidden />
              ) : !isAuthenticated ? (
                <Button size="sm" variant="ghost" asChild className="rounded-full text-white hover:bg-white/10">
                  <Link href="/login">Get Started</Link>
                </Button>
              ) : (
                <NavbarAuthControls variant="classified" />
              )}
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </nav>

          {isMobileMenuOpen && (
            <div className={palette.mobile}>
              <div className="space-y-2 px-4 py-4">
                <div className={cn('mb-3 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium', palette.search)}>
                  <Search className="h-4 w-4" />
                  Find businesses, spaces, and services
                </div>
                {mobileNavigation.map((item) => {
                  const isActive = pathname.startsWith(item.href)
                  return (
                    <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={cn('flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors', isActive ? palette.navActive : palette.post)}>
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  )
                })}
                {isAuthenticated ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="mt-2 w-full justify-center rounded-full border border-white/15 text-white hover:bg-white/10"
                    onClick={() => {
                      logout()
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                ) : null}
              </div>
            </div>
          )}
        </header>

        <aside className={cn('hidden xl:fixed xl:inset-y-0 xl:left-0 xl:z-40 xl:flex xl:w-80 xl:flex-col xl:border-r xl:px-6 xl:py-7', palette.shell)}>
          <div className="flex h-full flex-col">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden">
                <img src="/favicon.png?v=20260401" alt={`${SITE_CONFIG.name} logo`} width="48" height="48" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0">
                <span className="block truncate text-xl font-semibold">{SITE_CONFIG.name}</span>
                <span className="block truncate text-[10px] uppercase tracking-[0.24em] opacity-60">{siteContent.navbar.tagline}</span>
              </div>
            </Link>

            <Link href="/search" className={cn('mt-7 flex items-center gap-3 rounded-[1.4rem] px-4 py-3 text-sm transition hover:opacity-95', palette.search)}>
              <Search className="h-4 w-4 shrink-0" />
              <div className="min-w-0">
                <div className="truncate font-medium">Search to buy</div>
                <div className="truncate text-xs opacity-70">Find ads, categories, and locations</div>
              </div>
            </Link>

            <nav className="mt-8 space-y-2">
              {primaryNavigation.map((task) => {
                const isActive = pathname.startsWith(task.route)
                const Icon = taskIcons[task.key] || LayoutGrid
                return (
                  <Link
                    key={task.key}
                    href={task.route}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors',
                      isActive ? palette.navActive : palette.post,
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{task.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="mt-8 grid gap-3">
              <div className={cn('rounded-[1.6rem] px-4 py-4 text-sm', palette.post)}>
                <div className="flex items-center gap-2 font-semibold">
                  <MapPin className="h-4 w-4" />
                  Popular near you
                </div>
                <p className="mt-2 text-xs leading-6 opacity-75">Browse verified-style ads and message sellers safely from your dashboard.</p>
              </div>
            </div>

            <div className="mt-auto space-y-3 pt-8">
              {!hasHydrated ? (
                <div className="h-20 w-full animate-pulse rounded-2xl bg-white/10" aria-hidden />
              ) : isAuthenticated ? (
                <div className="space-y-3">
                  <NavbarAuthControls variant="classified" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center rounded-full border border-white/15 bg-white/5 px-4 text-white hover:bg-white/10"
                    onClick={() => logout()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" asChild className="w-full justify-center rounded-full border border-white/15 bg-white/5 px-4 text-white hover:bg-white/10">
                  <Link href="/login">Sign in</Link>
                </Button>
              )}
            </div>
          </div>
        </aside>
      </>
    )
  }

  const style = variantClasses[recipe.navbar]
  const isFloating = recipe.navbar === 'floating-bar'
  const isEditorial = recipe.navbar === 'editorial-bar'
  const isUtility = recipe.navbar === 'utility-bar'

  return (
    <>
      <header data-mobile-nav="true" className={cn('sticky top-0 z-50 w-full xl:hidden', style.shell)}>
        <nav className={cn('mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8', isFloating ? 'h-24 pt-4' : 'h-20')}>
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden">
                <img src="/favicon.png?v=20260401" alt={`${SITE_CONFIG.name} logo`} width="48" height="48" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0">
                <span className="block truncate text-lg font-semibold">{SITE_CONFIG.name}</span>
                <span className="block truncate text-[10px] uppercase tracking-[0.22em] opacity-70">{siteContent.navbar.tagline}</span>
              </div>
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {!hasHydrated ? (
              <div className="h-9 w-28 animate-pulse rounded-full bg-black/10 dark:bg-white/10" aria-hidden />
            ) : !isAuthenticated ? (
              <Button size="sm" asChild className={cn('rounded-full', style.cta)}>
                <Link href="/register">
                  <Plus className="mr-1 h-4 w-4" />
                  Get Started
                </Link>
              </Button>
            ) : (
              <NavbarAuthControls />
            )}
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </nav>

        {isMobileMenuOpen && (
          <div className={style.mobile}>
            <div className="space-y-2 px-4 py-4">
              {mobileNavigation.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={cn('flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors', isActive ? style.active : style.idle)}>
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
              {isAuthenticated ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-2 w-full justify-center rounded-2xl"
                  onClick={() => {
                    logout()
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </header>

      <aside className={cn('hidden xl:fixed xl:inset-y-0 xl:left-0 xl:z-40 xl:flex xl:w-80 xl:flex-col xl:overflow-y-auto xl:border-r xl:px-6 xl:py-7', style.shell)}>
        <div className="flex h-full flex-col">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden">
              <img src="/favicon.png?v=20260401" alt={`${SITE_CONFIG.name} logo`} width="48" height="48" className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-xl font-semibold">{SITE_CONFIG.name}</span>
              <span className="block truncate text-[10px] uppercase tracking-[0.24em] opacity-70">{siteContent.navbar.tagline}</span>
            </div>
          </Link>

          <div className={cn('mt-7 rounded-[1.35rem] border border-current/10 px-4 py-4', isFloating ? 'bg-white/6 backdrop-blur' : isEditorial ? 'bg-white/70' : isUtility ? 'bg-white/80' : 'bg-slate-50')}>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
              <Search className="h-3.5 w-3.5" />
              Quick Find
            </div>
            <p className="mt-2 text-sm leading-6 opacity-80">Browse by task, lane, or content type without cramped top navigation.</p>
          </div>

          <nav className="mt-8 space-y-2">
            {primaryNavigation.map((task) => {
              const Icon = taskIcons[task.key] || LayoutGrid
              const isActive = pathname.startsWith(task.route)
              return (
                <Link key={task.key} href={task.route} className={cn('flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors', isActive ? style.active : style.idle)}>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{task.label}</span>
                  <ChevronRight className="ml-auto h-4 w-4 opacity-45" />
                </Link>
              )
            })}
          </nav>

          <div className="mt-8 space-y-3">
            <div className={cn('rounded-[1.6rem] border border-current/10 px-4 py-4 text-sm', isFloating ? 'bg-white/6 text-slate-200' : 'bg-white/75')}>
              <div className="font-semibold">Navigation Note</div>
              <p className="mt-2 text-xs leading-6 opacity-75">Desktop navigation now sits on the left so long task labels do not collide with actions or utility controls.</p>
            </div>
          </div>

          <div className="mt-auto space-y-3 pt-8">
            {!hasHydrated ? (
              <div className="h-20 w-full animate-pulse rounded-2xl bg-black/5" aria-hidden />
            ) : isAuthenticated ? (
              <div className="space-y-3">
                <NavbarAuthControls />
                <Button type="button" variant="outline" size="sm" className="w-full justify-center rounded-full" onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button variant="ghost" size="sm" asChild className="w-full justify-center rounded-full px-4">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild className={cn('w-full justify-center rounded-full', style.cta)}>
                  <Link href="/register">
                    <Plus className="mr-1 h-4 w-4" />
                    Get Started
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )

}
