'use client'

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ContentImage } from '@/components/shared/content-image'
import { TaskPostCard } from '@/components/shared/task-post-card'
import { buildPostUrl } from '@/lib/task-data'
import { CATEGORY_OPTIONS, isValidCategory, normalizeCategory } from '@/lib/categories'
import { loadFromStorage, saveToStorage, storageKeys } from '@/lib/local-storage'
import { getLocalPostsForTask } from '@/lib/local-posts'
import { CLASSIFIED_REGIONS } from '@/lib/classifieds-regions'
import { cn } from '@/lib/utils'
import type { SitePost } from '@/lib/site-connector'
import type { TaskKey } from '@/lib/site-config'
import { MapPin, Search } from 'lucide-react'

const CONDITIONS = [
  { value: '', label: 'Any condition' },
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
  { value: 'refurbished', label: 'Refurbished' },
] as const

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: Low to high' },
  { value: 'price-desc', label: 'Price: High to low' },
] as const

function mergePosts(initialPosts: SitePost[], category: string): SitePost[] {
  const task: TaskKey = 'classified'
  const localPosts = getLocalPostsForTask(task)
  const bySlug = new Set<string>()
  const combined: SitePost[] = []

  localPosts.forEach((post) => {
    if (post.slug) bySlug.add(post.slug)
    combined.push(post)
  })
  initialPosts.forEach((post) => {
    if (post.slug && bySlug.has(post.slug)) return
    combined.push(post)
  })

  const normalizedCategory = category ? normalizeCategory(category) : 'all'
  if (normalizedCategory === 'all') {
    return combined.filter((post) => {
      const content = post.content && typeof post.content === 'object' ? post.content : {}
      const value = typeof (content as { category?: string }).category === 'string' ? (content as { category: string }).category : ''
      return !value || isValidCategory(value)
    })
  }
  return combined.filter((post) => {
    const content = post.content && typeof post.content === 'object' ? post.content : {}
    const value =
      typeof (content as { category?: string }).category === 'string'
        ? normalizeCategory((content as { category: string }).category)
        : ''
    return value === normalizedCategory
  })
}

function getContentRecord(post: SitePost): Record<string, unknown> {
  return post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
}

function getPostImage(post: SitePost): string {
  const c = getContentRecord(post)
  const media = Array.isArray(post.media) ? post.media : []
  const u = media[0]?.url
  if (u) return u
  if (typeof c.image === 'string') return c.image
  const imgs = Array.isArray(c.images) ? c.images : []
  const first = imgs.find((x): x is string => typeof x === 'string')
  if (first) return first
  if (typeof c.logo === 'string') return c.logo
  return '/placeholder.svg?height=640&width=960'
}

function getPostLocationText(post: SitePost): string {
  const c = getContentRecord(post)
  const a = typeof c.address === 'string' ? c.address : ''
  const l = typeof c.location === 'string' ? c.location : ''
  return `${a} ${l}`.trim()
}

function getPostCondition(post: SitePost): string {
  const c = getContentRecord(post)
  const v = c.condition
  return typeof v === 'string' ? v.toLowerCase() : ''
}

function getNumericPrice(post: SitePost): number | null {
  const c = getContentRecord(post)
  const p = c.price
  if (typeof p === 'number' && Number.isFinite(p)) return p
  if (typeof p === 'string') {
    const n = Number(p.replace(/[^0-9.]/g, ''))
    return Number.isFinite(n) ? n : null
  }
  return null
}

function postMatchesKeyword(post: SitePost, q: string): boolean {
  if (!q.trim()) return true
  const needle = q.toLowerCase()
  const c = getContentRecord(post)
  const desc = typeof c.description === 'string' ? c.description : ''
  const hay = `${post.title} ${post.summary || ''} ${desc}`.toLowerCase()
  return hay.includes(needle)
}

function postMatchesCondition(post: SitePost, cond: string): boolean {
  if (!cond) return true
  const raw = getPostCondition(post)
  if (!raw) return false
  if (cond === 'new') return /\bnew\b/i.test(raw) || raw === 'new'
  if (cond === 'used') return raw.includes('used') || raw.includes('second')
  if (cond === 'refurbished') return raw.includes('refurb')
  return raw.includes(cond)
}

function postMatchesRegion(post: SitePost, region: string): boolean {
  if (!region.trim()) return true
  const loc = getPostLocationText(post).toLowerCase()
  const r = region.toLowerCase()
  if (r === 'chattogram' || r === 'chittagong') {
    return loc.includes('chattogram') || loc.includes('chittagong')
  }
  return loc.includes(r)
}

function sortPosts(posts: SitePost[], sort: string): SitePost[] {
  const copy = [...posts]
  if (sort === 'price-asc') {
    copy.sort((a, b) => (getNumericPrice(a) ?? Infinity) - (getNumericPrice(b) ?? Infinity))
  } else if (sort === 'price-desc') {
    copy.sort((a, b) => (getNumericPrice(b) ?? -1) - (getNumericPrice(a) ?? -1))
  } else {
    copy.sort((a, b) => {
      const da = a.publishedAt || a.createdAt || ''
      const db = b.publishedAt || b.createdAt || ''
      return db.localeCompare(da)
    })
  }
  return copy
}

function ClassifiedListRow({ post, href }: { post: SitePost; href: string }) {
  const c = getContentRecord(post)
  const loc = getPostLocationText(post)
  const price = getNumericPrice(post)
  const priceLabel = price != null && price > 0 ? `$${price.toLocaleString()}` : null
  const cat = typeof c.category === 'string' ? c.category : 'Ad'

  return (
    <Link
      href={href}
      className="group flex gap-4 rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-sm transition hover:border-[#00A86B]/35 hover:shadow-md sm:gap-5"
    >
      <div className="relative h-28 w-36 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-32 sm:w-44">
        <ContentImage src={getPostImage(post)} alt={post.title} fill className="object-cover transition duration-300 group-hover:scale-[1.03]" />
        <span className="absolute left-2 top-2 rounded-full bg-[#00A86B] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
          Featured
        </span>
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#3d5c52]">{cat}</p>
        <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-[#051B15] group-hover:text-[#00A86B]">{post.title}</h3>
        {loc ? (
          <p className="mt-2 flex items-center gap-1 text-sm text-[#3d5c52]">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#00A86B]" />
            <span className="line-clamp-1">{loc}</span>
          </p>
        ) : null}
      </div>
      {priceLabel ? <div className="shrink-0 self-center text-lg font-bold tabular-nums text-[#051B15]">{priceLabel}</div> : null}
    </Link>
  )
}

type UiPanel = { panel: string; soft: string; input: string; button: string; muted: string }

export function ClassifiedsBrowseClient({
  initialPosts,
  normalizedCategory,
  taskRoute,
  initialLocation,
  ui,
}: {
  initialPosts: SitePost[]
  normalizedCategory: string
  taskRoute: string
  initialLocation?: string
  ui: UiPanel
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const categoryFromUrl = searchParams.get('category')
  const effectiveCategory = categoryFromUrl ? normalizeCategory(categoryFromUrl) : normalizedCategory

  const [region, setRegion] = useState(initialLocation || '')
  const didHydrateRegion = useRef(false)

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [keyword, setKeyword] = useState('')
  const deferredKeyword = useDeferredValue(keyword)
  const [condition, setCondition] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [sort, setSort] = useState('newest')

  useEffect(() => {
    const urlLoc = searchParams.get('location') || ''
    if (urlLoc) {
      setRegion(urlLoc)
      saveToStorage(storageKeys.classifiedRegion, urlLoc)
      didHydrateRegion.current = true
      return
    }
    if (!didHydrateRegion.current) {
      if (initialLocation) {
        didHydrateRegion.current = true
      } else {
        const stored = loadFromStorage<string>(storageKeys.classifiedRegion, '')
        if (stored) setRegion(stored)
        didHydrateRegion.current = true
      }
    }
  }, [searchParams, initialLocation])

  const onRegionNavChange = (value: string) => {
    setRegion(value)
    saveToStorage(storageKeys.classifiedRegion, value)
    const params = new URLSearchParams()
    if (effectiveCategory && effectiveCategory !== 'all') params.set('category', effectiveCategory)
    if (value) params.set('location', value)
    const qs = params.toString()
    router.push(qs ? `${taskRoute}?${qs}` : taskRoute, { scroll: false })
  }

  const merged = useMemo(() => mergePosts(initialPosts, effectiveCategory), [initialPosts, effectiveCategory])

  const filtered = useMemo(() => {
    let list = merged.filter((p) => postMatchesKeyword(p, deferredKeyword))
    list = list.filter((p) => postMatchesCondition(p, condition))
    if (region) list = list.filter((p) => postMatchesRegion(p, region))
    list = list.filter((p) => postMatchesRegion(p, locationFilter))
    return sortPosts(list, sort)
  }, [merged, deferredKeyword, condition, locationFilter, sort, region])

  const categoryHref = (slug: string | null) => {
    const params = new URLSearchParams()
    if (slug) params.set('category', slug)
    if (region) params.set('location', region)
    const qs = params.toString()
    return qs ? `${taskRoute}?${qs}` : taskRoute
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:items-start">
      <aside className="space-y-4 lg:sticky lg:top-24">
        <div className={cn('rounded-2xl p-5', ui.panel)}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3d5c52]">Categories</p>
          <nav className="mt-4 max-h-[420px] space-y-1 overflow-y-auto pr-1">
            <Link
              href={region ? `${taskRoute}?location=${encodeURIComponent(region)}` : taskRoute}
              className={cn(
                'flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                effectiveCategory === 'all' ? 'bg-[#00A86B] text-white' : 'text-[#051B15] hover:bg-[#ecf6f1]',
              )}
            >
              All ads
            </Link>
            {CATEGORY_OPTIONS.slice(0, 14).map((item) => {
              const active = effectiveCategory === item.slug
              return (
                <Link
                  key={item.slug}
                  href={categoryHref(item.slug)}
                  className={cn(
                    'flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    active ? 'bg-[#00A86B] text-white' : 'text-[#051B15] hover:bg-[#ecf6f1]',
                  )}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className={cn('rounded-2xl p-5', ui.soft)}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3d5c52]">Price range</p>
          <p className="mt-2 text-sm text-[#3d5c52]/85">Use filters on each ad or save searches from your account.</p>
        </div>
      </aside>

      <div className="min-w-0 space-y-6">
        <div className={cn('flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between', ui.panel)}>
          <form action="/search" method="get" className="flex w-full max-w-xl flex-1 items-center gap-2 rounded-full border border-emerald-900/10 bg-[#f8fcfa] px-3 py-1.5">
            <Search className="h-4 w-4 shrink-0 text-[#051B15]/35" />
            <input name="q" className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm outline-none placeholder:text-[#051B15]/40" placeholder="Search to buy" />
            <button type="submit" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00A86B] text-white hover:bg-[#009060]" aria-label="Search">
              <Search className="h-4 w-4" />
            </button>
          </form>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-semibold uppercase tracking-wider text-[#3d5c52] sm:inline">Ads view</span>
            <div className="inline-flex rounded-full border border-emerald-900/10 bg-[#f8fcfa] p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                  viewMode === 'grid' ? 'bg-[#00A86B] text-white' : 'font-medium text-[#3d5c52] opacity-80 hover:opacity-100',
                )}
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                  viewMode === 'list' ? 'bg-[#00A86B] text-white' : 'font-medium text-[#3d5c52] opacity-80 hover:opacity-100',
                )}
              >
                List
              </button>
            </div>
          </div>
        </div>

        <div className={cn('grid gap-4 rounded-2xl p-4 sm:grid-cols-2 lg:grid-cols-4', ui.soft)}>
          <div>
            <label className={cn('mb-1.5 block text-[10px] font-semibold uppercase tracking-wider', ui.muted)}>Keyword</label>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. phone, car…"
              className={cn('h-10 w-full rounded-full border border-emerald-900/10 bg-white px-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#00A86B]/30', ui.input)}
            />
          </div>
          <div>
            <label className={cn('mb-1.5 block text-[10px] font-semibold uppercase tracking-wider', ui.muted)}>Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className={cn('h-10 w-full rounded-full border border-emerald-900/10 bg-white px-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#00A86B]/30', ui.input)}
            >
              {CONDITIONS.map((o) => (
                <option key={o.value || 'any'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={cn('mb-1.5 block text-[10px] font-semibold uppercase tracking-wider', ui.muted)}>Location</label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className={cn('h-10 w-full rounded-full border border-emerald-900/10 bg-white px-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#00A86B]/30', ui.input)}
            >
              <option value="">Any</option>
              {CLASSIFIED_REGIONS.filter((r) => r.value).map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={cn('mb-1.5 block text-[10px] font-semibold uppercase tracking-wider', ui.muted)}>Sort</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className={cn('h-10 w-full rounded-full border border-emerald-900/10 bg-white px-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#00A86B]/30', ui.input)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <form
          className={cn('flex flex-wrap items-center gap-3 rounded-2xl p-4', ui.panel)}
          action={taskRoute}
          onSubmit={(e) => e.preventDefault()}
        >
          <span className={cn('text-xs font-semibold uppercase tracking-wider', ui.muted)}>Category</span>
          <select
            name="category"
            value={effectiveCategory === 'all' ? 'all' : effectiveCategory}
            onChange={(e) => {
              const v = e.target.value
              const params = new URLSearchParams()
              if (v && v !== 'all') params.set('category', v)
              if (region) params.set('location', region)
              const qs = params.toString()
              router.push(qs ? `${taskRoute}?${qs}` : taskRoute)
            }}
            className={cn('h-10 max-w-xs flex-1 rounded-xl px-3 text-sm', ui.input)}
          >
            <option value="all">All categories</option>
            {CATEGORY_OPTIONS.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </form>

        {!filtered.length ? (
          <div className="rounded-2xl border border-dashed border-emerald-900/20 p-10 text-center text-[#3d5c52]">No ads match these filters.</div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => {
              const localOnly = (post as SitePost & { localOnly?: boolean }).localOnly
              const href = localOnly ? `/local/classified/${post.slug}` : buildPostUrl('classified', post.slug)
              return <TaskPostCard key={post.id} post={post} href={href} taskKey="classified" />
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((post) => {
              const localOnly = (post as SitePost & { localOnly?: boolean }).localOnly
              const href = localOnly ? `/local/classified/${post.slug}` : buildPostUrl('classified', post.slug)
              return <ClassifiedListRow key={post.id} post={post} href={href} />
            })}
          </div>
        )}
      </div>
    </div>
  )
}
