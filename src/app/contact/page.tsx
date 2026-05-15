import { Clock3, Mail, MessageSquareText, ShieldCheck } from 'lucide-react';
import { Building2, FileText, Image as ImageIcon, Mail, MapPin, Phone, Sparkles, Bookmark } from 'lucide-react'
import { NavbarShell } from '@/components/shared/navbar-shell'
import { Footer } from '@/components/shared/footer'
import { SITE_CONFIG } from '@/lib/site-config'
import { getFactoryState } from '@/design/factory/get-factory-state'
import { getProductKind } from '@/design/factory/get-product-kind'
import { CONTACT_PAGE_OVERRIDE_ENABLED, ContactPageOverride } from '@/overrides/contact-page'
import { ContactLeadForm } from "@/components/shared/contact-lead-form";

function getTone(kind: ReturnType<typeof getProductKind>) {
  if (kind === 'directory') {
    return {
      shell: 'bg-[#f4faf7] text-[#051B15]',
      panel: 'border border-emerald-900/10 bg-white shadow-[0_24px_64px_rgba(5,27,21,0.08)]',
      soft: 'border border-emerald-900/10 bg-[#ecf6f1]',
      muted: 'text-[#3d5c52]',
      action: 'bg-[#00A86B] text-white hover:bg-[#009060]',
    }
  }
  if (kind === 'editorial') {
    return {
      shell: 'bg-[#fbf6ee] text-[#241711]',
      panel: 'border border-[#dcc8b7] bg-[#fffdfa]',
      soft: 'border border-[#e6d6c8] bg-[#fff4e8]',
      muted: 'text-[#6e5547]',
      action: 'bg-[#241711] text-[#fff1e2] hover:bg-[#3a241b]',
    }
  }
  if (kind === 'visual') {
    return {
      shell: 'bg-[#07101f] text-white',
      panel: 'border border-white/10 bg-white/6',
      soft: 'border border-white/10 bg-white/5',
      muted: 'text-slate-300',
      action: 'bg-[#8df0c8] text-[#07111f] hover:bg-[#77dfb8]',
    }
  }
  return {
    shell: 'bg-[#f7f1ea] text-[#261811]',
    panel: 'border border-[#ddcdbd] bg-[#fffaf4]',
    soft: 'border border-[#e8dbce] bg-[#f3e8db]',
    muted: 'text-[#71574a]',
    action: 'bg-[#5b2b3b] text-[#fff0f5] hover:bg-[#74364b]',
  }
}

export default function ContactPage() {
  if (CONTACT_PAGE_OVERRIDE_ENABLED) {
    return <ContactPageOverride />
  }

const contactHighlights = [
  { icon: Mail, title: 'Direct response', copy: 'Your message is securely routed to the right team.' },
  { icon: MessageSquareText, title: 'Clear details', copy: 'Share your requirement, issue, or collaboration idea in one place.' },
  { icon: ShieldCheck, title: 'Reliable follow-up', copy: 'Every request is tracked so conversations never get lost.' },
];

const contactMeta = [
  { icon: Clock3, label: 'Response window', value: 'Within 24 hours' },
  { icon: ShieldCheck, label: 'Support scope', value: 'General, technical, business' },
];
  const { recipe } = getFactoryState()
  const productKind = getProductKind(recipe)
  const tone = getTone(productKind)
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "support@example.com"
  const lanes =
    productKind === 'directory'
      ? [
          { icon: Building2, title: 'Business onboarding', body: 'Add listings, verify operational details, and bring your business surface live quickly.' },
          { icon: Phone, title: 'Partnership support', body: 'Talk through bulk publishing, local growth, and operational setup questions.' },
          { icon: MapPin, title: 'Coverage requests', body: 'Need a new geography or category lane? We can shape the directory around it.' },
        ]
      : productKind === 'editorial'
        ? [
            { icon: FileText, title: 'Editorial submissions', body: 'Pitch essays, columns, and long-form ideas that fit the publication.' },
            { icon: Mail, title: 'Newsletter partnerships', body: 'Coordinate sponsorships, collaborations, and issue-level campaigns.' },
            { icon: Sparkles, title: 'Contributor support', body: 'Get help with voice, formatting, and publication workflow questions.' },
          ]
        : productKind === 'visual'
          ? [
              { icon: ImageIcon, title: 'Creator collaborations', body: 'Discuss gallery launches, creator features, and visual campaigns.' },
              { icon: Sparkles, title: 'Licensing and use', body: 'Reach out about usage rights, commercial requests, and visual partnerships.' },
              { icon: Mail, title: 'Media kits', body: 'Request creator decks, editorial support, or visual feature placement.' },
            ]
          : [
              { icon: Bookmark, title: 'Collection submissions', body: 'Suggest resources, boards, and links that deserve a place in the library.' },
              { icon: Mail, title: 'Resource partnerships', body: 'Coordinate curation projects, reference pages, and link programs.' },
              { icon: Sparkles, title: 'Curator support', body: 'Need help organizing shelves, collections, or profile-connected boards?' },
            ]

  return (
    <div className="min-h-screen bg-[#f6faf7] text-[#0f2b22]">
      <NavbarShell />
      <main>
        <section className="relative overflow-hidden px-6 py-16 md:px-10 lg:px-16 lg:py-20">
          <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-teal-200/40 blur-3xl" />

          <div className="relative mx-auto max-w-6xl">
            <div className="mb-10 rounded-[2rem] border border-emerald-900/10 bg-[linear-gradient(120deg,#042b22_0%,#0a5a46_100%)] p-8 text-emerald-50 shadow-[0_28px_80px_rgba(4,43,34,0.22)] md:p-10">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-200">Contact</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] text-white md:text-6xl">
                Let&apos;s talk about your next move.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-emerald-100/90 md:text-lg">
                Reach {siteName} for support, partnerships, or product questions. We&apos;ll route your request to the right team fast.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {contactMeta.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <item.icon className="h-4 w-4 text-emerald-200" />
                      {item.label}
                    </div>
                    <p className="mt-1 text-sm text-emerald-100/90">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
              <div className="space-y-4">
                {contactHighlights.map((item) => (
                  <div key={item.title} className="flex gap-4 rounded-3xl border border-emerald-900/10 bg-white p-5 shadow-sm">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0a5a46] text-white">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-[#0f2b22]">{item.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-[#466358]">{item.copy}</p>
                    </div>
                  </div>
                ))}

                <div className="rounded-3xl border border-dashed border-emerald-900/25 bg-emerald-50/60 p-5">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0a5a46]">Need faster routing?</p>
                  <p className="mt-2 text-sm leading-7 text-[#315347]">
                    Include your preferred contact channel and timeline in your message so the team can prioritize correctly.
                  </p>
                </div>
              </div>

              <ContactLeadForm />
            </div>
    <div className={`min-h-screen ${tone.shell}`}>
      <NavbarShell />
      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] opacity-70">Contact {SITE_CONFIG.name}</p>
            <h1 className="mt-4 text-5xl font-semibold tracking-[-0.05em]">A support page that matches the product, not a generic contact form.</h1>
            <p className={`mt-5 max-w-2xl text-sm leading-8 ${tone.muted}`}>Tell us what you are trying to publish, fix, or launch. We will route it through the right lane instead of forcing every request into the same support bucket.</p>
            <div className="mt-8 space-y-4">
              {lanes.map((lane) => (
                <div key={lane.title} className={`rounded-[1.6rem] p-5 ${tone.soft}`}>
                  <lane.icon className="h-5 w-5" />
                  <h2 className="mt-3 text-xl font-semibold">{lane.title}</h2>
                  <p className={`mt-2 text-sm leading-7 ${tone.muted}`}>{lane.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-[2rem] p-7 ${tone.panel}`}>
            <h2 className="text-2xl font-semibold">Send a message</h2>
            <a
              href={`mailto:${contactEmail}`}
              className={`mt-4 inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold ${tone.action}`}
            >
              Email us at {contactEmail}
            </a>
            <ContactLeadForm />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
