 'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Calendar, Globe, Mail, MapPin, Phone, Tag } from 'lucide-react'
import { ContentImage } from '@/components/shared/content-image'
import { SchemaJsonLd } from '@/components/seo/schema-jsonld'
import { TaskPostCard } from '@/components/shared/task-post-card'
import { RichContent, formatRichHtml } from '@/components/shared/rich-content'
import type { SitePost } from '@/lib/site-connector'
import type { TaskKey } from '@/lib/site-config'

function formatPrice(content: Record<string, unknown>) {
  const raw = content.price
  if (typeof raw === 'number') return `$${raw.toLocaleString()}`
  if (typeof raw === 'string' && raw.trim()) {
    const t = raw.trim()
    return t.startsWith('$') ? t : `$${t}`
  }
  return null
}

export function DirectoryTaskDetailPage({
  task,
  taskLabel,
  taskRoute,
  post,
  description,
  category,
  images,
  mapEmbedUrl,
  related,
}: {
  task: TaskKey
  taskLabel: string
  taskRoute: string
  post: SitePost
  description: string
  category: string
  images: string[]
  mapEmbedUrl: string | null
  related: SitePost[]
}) {
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const content = post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const location = typeof content.address === 'string' ? content.address : typeof content.location === 'string' ? content.location : ''
  const website = typeof content.website === 'string' ? content.website : ''
  const phone = typeof content.phone === 'string' ? content.phone : ''
  const email = typeof content.email === 'string' ? content.email : ''
  const highlights = Array.isArray(content.highlights) ? content.highlights.filter((item): item is string => typeof item === 'string') : []
  const priceLabel = formatPrice(content)
  const sellerName = (typeof post.authorName === 'string' && post.authorName.trim()) || 'Seller'
  const postedAt = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : null
  const descriptionHtml = formatRichHtml(description, 'Details coming soon.')

  useEffect(() => {
    if (!activeImage) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveImage(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeImage])

  const schemaPayload = {
    '@context': 'https://schema.org',
    '@type': task === 'profile' ? 'Organization' : 'LocalBusiness',
    name: post.title,
    description,
    image: images[0],
    url: `${taskRoute}/${post.slug}`,
    address: location || undefined,
    telephone: phone || undefined,
    email: email || undefined,
  }

  return (
    <div className="min-h-screen bg-[#f4faf7] text-[#051B15]">
      <SchemaJsonLd data={schemaPayload} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <nav className="mb-6 text-sm text-[#3d5c52]">
          <Link href="/" className="hover:text-[#00A86B]">Home</Link>
          <span className="mx-2 opacity-50">/</span>
          <Link href={taskRoute} className="hover:text-[#00A86B]">{taskLabel}</Link>
          <span className="mx-2 opacity-50">/</span>
          <span className="font-medium text-[#051B15] line-clamp-1">{post.title}</span>
        </nav>

        <section className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{post.title}</h1>
              {priceLabel ? (
                <div className="shrink-0 text-right">
                  <p className="text-xs font-medium uppercase tracking-wider text-[#3d5c52]">Price</p>
                  <p className="text-3xl font-bold tabular-nums text-[#051B15]">{priceLabel}</p>
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#3d5c52]">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-900/10 bg-white px-3 py-1.5">
                <Tag className="h-3.5 w-3.5 text-[#00A86B]" />
                {category || taskLabel}
              </span>
              {postedAt ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-900/10 bg-white px-3 py-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#00A86B]" />
                  Posted {postedAt}
                </span>
              ) : null}
              {location ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-900/10 bg-white px-3 py-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#00A86B]" />
                  {location}
                </span>
              ) : null}
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-emerald-900/10 bg-white shadow-[0_24px_70px_rgba(5,27,21,0.08)]">
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 sm:aspect-[16/9]">
                <button
                  type="button"
                  onClick={() => setActiveImage(images[0])}
                  className="h-full w-full cursor-zoom-in"
                  aria-label="Open main photo"
                >
                  <ContentImage src={images[0]} alt={post.title} fill className="object-cover" />
                </button>
              </div>
              {images.length > 1 ? (
                <div className="grid grid-cols-5 gap-2 p-3 sm:p-4">
                  {images.slice(0, 5).map((image) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setActiveImage(image)}
                      className="relative aspect-square overflow-hidden rounded-xl border border-emerald-900/10 bg-slate-50 cursor-zoom-in"
                      aria-label="Open photo"
                    >
                      <ContentImage src={image} alt={post.title} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-8 rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3d5c52]">Description</p>
              <RichContent html={descriptionHtml} className="mt-4 text-sm leading-8 text-[#1a3d34]" />
              {highlights.length ? (
                <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                  {highlights.slice(0, 6).map((item) => (
                    <li key={item} className="rounded-xl border border-emerald-900/10 bg-[#ecf6f1] px-4 py-3 text-sm text-[#051B15]">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {mapEmbedUrl ? (
              <div className="mt-8 overflow-hidden rounded-2xl border border-emerald-900/10 bg-white shadow-sm">
                <div className="border-b border-emerald-900/10 px-5 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3d5c52]">Location</p>
                </div>
                <iframe src={mapEmbedUrl} title={`${post.title} map`} className="h-[280px] w-full border-0 sm:h-[320px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            ) : null}
          </div>

	          <aside className="space-y-6">
	            <div className="rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-[0_20px_50px_rgba(5,27,21,0.07)]">
	              <div className="flex items-center justify-between gap-2">
	                <span className="text-xs font-semibold uppercase tracking-wider text-[#00A86B]">Active member</span>
	              </div>
	              <div className="mt-5 flex items-center gap-3">
	                <div className="relative h-14 w-14 overflow-hidden rounded-full border border-emerald-900/10 bg-[#ecf6f1]">
	                  <ContentImage src={images[0]} alt={sellerName} fill className="object-cover" />
	                </div>
                <div>
                  <p className="font-semibold text-[#051B15]">{sellerName}</p>
                  <Link href={taskRoute} className="text-sm font-medium text-[#00A86B] hover:underline">
                    View all ads
	                  </Link>
	                </div>
	              </div>
	              <div className="mt-5 space-y-2 border-t border-emerald-900/10 pt-5 text-sm text-[#3d5c52]">
	                {phone ? (
	                  <div className="flex items-center gap-2">
	                    <Phone className="h-4 w-4 shrink-0 text-[#00A86B]" />
                    {phone}
                  </div>
                ) : null}
                {email ? (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-[#00A86B]" />
                    {email}
                  </div>
                ) : null}
                {website ? (
                  <a href={website} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-medium text-[#00A86B] hover:underline">
                    <Globe className="h-4 w-4 shrink-0" />
                    Website
                  </a>
                ) : null}
              </div>
            </div>

            {related.length ? (
              <div>
                <p className="text-sm font-semibold text-[#051B15]">More from this seller</p>
                <ul className="mt-4 space-y-3">
                  {related.slice(0, 4).map((item) => (
                    <li key={item.id}>
                      <Link href={`${taskRoute}/${item.slug}`} className="group flex gap-3 rounded-xl border border-emerald-900/10 bg-[#f8fcfa] p-3 transition hover:border-[#00A86B]/40">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          <ContentImage src={typeof item.media?.[0]?.url === 'string' ? item.media[0].url : images[0]} alt={item.title} fill className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-semibold text-[#051B15] group-hover:text-[#00A86B]">{item.title}</p>
                          <p className="text-xs text-[#3d5c52]">View ad</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="rounded-2xl border border-dashed border-emerald-900/20 bg-[#ecf6f1]/50 p-5 text-center text-sm text-[#3d5c52]">
              Featured placement — boost your ad to the top of search.
            </div>
          </aside>
        </section>

        {related.length > 4 ? (
          <section className="mt-14">
            <div className="flex items-end justify-between gap-4 border-b border-emerald-900/10 pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3d5c52]">You may also like</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Similar listings</h2>
              </div>
              <Link href={taskRoute} className="text-sm font-semibold text-[#00A86B] hover:underline">
                View all
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.slice(4, 10).map((item) => (
                <TaskPostCard key={item.id} post={item} href={`${taskRoute}/${item.slug}`} taskKey={task} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      {activeImage ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setActiveImage(null)}
        >
          <div className="relative w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setActiveImage(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-white/95 px-3 py-1 text-lg font-semibold leading-none text-[#051B15] shadow-sm hover:bg-white"
              aria-label="Close preview"
            >
              ×
            </button>
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-black">
              <ContentImage src={activeImage} alt={`${post.title} preview`} fill className="object-contain" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
