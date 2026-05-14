import { Clock3, Mail, MessageSquareText, ShieldCheck } from 'lucide-react';

import { ContactLeadForm } from '@/components/shared/contact-lead-form';
import { Footer } from '@/components/shared/footer';
import { NavbarShell } from '@/components/shared/navbar-shell';

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Bokuno Trends';

const contactHighlights = [
  { icon: Mail, title: 'Direct response', copy: 'Your message is securely routed to the right team.' },
  { icon: MessageSquareText, title: 'Clear details', copy: 'Share your requirement, issue, or collaboration idea in one place.' },
  { icon: ShieldCheck, title: 'Reliable follow-up', copy: 'Every request is tracked so conversations never get lost.' },
];

const contactMeta = [
  { icon: Clock3, label: 'Response window', value: 'Within 24 hours' },
  { icon: ShieldCheck, label: 'Support scope', value: 'General, technical, business' },
];

export default function ContactPage() {
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
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
