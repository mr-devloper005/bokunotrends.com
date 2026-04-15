import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/shared/footer";
import { NavbarShell } from "@/components/shared/navbar-shell";
import { ContentImage } from "@/components/shared/content-image";
import { TaskPostCard } from "@/components/shared/task-post-card";
import { Button } from "@/components/ui/button";
import { SchemaJsonLd } from "@/components/seo/schema-jsonld";
import { buildPostMetadata, buildTaskMetadata } from "@/lib/seo";
import { buildPostUrl, fetchTaskPostBySlug, fetchTaskPosts } from "@/lib/task-data";
import { Filter } from "lucide-react";
import { SITE_CONFIG } from "@/lib/site-config";

export const revalidate = 3;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const sanitizeRichHtml = (html: string) =>
  html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\shref\s*=\s*(['"])javascript:.*?\1/gi, ' href="#"');

const formatRichHtml = (raw?: string | null, fallback = "Profile details will appear here once available.") => {
  const source = typeof raw === "string" ? raw.trim() : "";
  if (!source) return `<p>${escapeHtml(fallback)}</p>`;
  if (/<[a-z][\s\S]*>/i.test(source)) return sanitizeRichHtml(source);
  return source
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph.replace(/\n/g, " ").trim())}</p>`)
    .join("");
};

export async function generateStaticParams() {
  const posts = await fetchTaskPosts("profile", 50);
  if (!posts.length) {
    return [{ username: "placeholder" }];
  }
  return posts.map((post) => ({ username: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = await params;
  try {
    const post = await fetchTaskPostBySlug("profile", resolvedParams.username);
    return post ? await buildPostMetadata("profile", post) : await buildTaskMetadata("profile");
  } catch (error) {
    console.warn("Profile metadata lookup failed", error);
    return await buildTaskMetadata("profile");
  }
}

export default async function ProfileDetailPage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = await params;
  const post = await fetchTaskPostBySlug("profile", resolvedParams.username);
  if (!post) {
    notFound();
  }
  const content = (post.content || {}) as Record<string, any>;
  const logoUrl = typeof content.logo === "string" ? content.logo : undefined;
  const brandName =
    (content.brandName as string | undefined) ||
    (content.companyName as string | undefined) ||
    (content.name as string | undefined) ||
    post.title;
  const website = content.website as string | undefined;
  const domain = website ? website.replace(/^https?:\/\//, "").replace(/\/.*$/, "") : undefined;
  const description =
    (content.description as string | undefined) ||
    post.summary ||
    "Profile details will appear here once available.";
  const descriptionHtml = formatRichHtml(description);
  const suggestedArticles = await fetchTaskPosts("article", 6);
  const classifiedAds = (await fetchTaskPosts("classified", 9)).slice(0, 6);
  const baseUrl = SITE_CONFIG.baseUrl.replace(/\/$/, "");
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Profiles",
        item: `${baseUrl}/profile`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: brandName,
        item: `${baseUrl}/profile/${post.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#f4faf7] text-[#051B15]">
      <NavbarShell />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <SchemaJsonLd data={breadcrumbData} />

        <section className="overflow-hidden rounded-[2rem] bg-[#051B15] text-white shadow-[0_28px_80px_rgba(5,27,21,0.3)]">
          <div className="relative px-6 py-10 sm:px-10 sm:py-12">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#051B15] to-[#0a3d2e]/95" />
            <div className="relative grid gap-8 md:grid-cols-[140px_1fr_auto] md:items-center">
              <div className="flex justify-center md:justify-start">
                <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white/15 bg-white/10 shadow-lg">
                  {logoUrl ? (
                    <ContentImage src={logoUrl} alt={post.title} fill className="object-cover" sizes="128px" intrinsicWidth={128} intrinsicHeight={128} />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-white/90">
                      {post.title.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-emerald-100/90">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">Active member</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#00A86B]" />
                    Online
                  </span>
                </div>
                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{brandName}</h1>
                {domain ? <p className="mt-1 text-emerald-100/85">{domain}</p> : null}
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild className="rounded-full bg-[#00A86B] px-6 text-white hover:bg-[#009060]">
                    <Link href={website || "#"}>Message</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/15">
                    <Link href={website || "#"}>WhatsApp</Link>
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center md:text-left">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-2xl font-bold">260</p>
                  <p className="text-xs text-emerald-100/80">Sold</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-2xl font-bold">324</p>
                  <p className="text-xs text-emerald-100/80">Listings</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-emerald-900/10 bg-white p-6 shadow-sm sm:p-8">
          <article
            className="article-content prose prose-slate max-w-3xl text-[#1a3d34] prose-p:my-4 prose-a:text-[#00A86B] prose-strong:font-semibold"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
          {website ? (
            <div className="mt-6">
              <Button asChild className="rounded-full bg-[#051B15] px-6 text-white hover:bg-[#0a2e24]">
                <Link href={website} target="_blank" rel="noopener noreferrer">
                  Visit website
                </Link>
              </Button>
            </div>
          ) : null}
        </section>

        <section className="mt-8 overflow-hidden rounded-[2rem] bg-[#051B15] p-6 text-white sm:flex sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="text-2xl font-semibold">Post your ad now</h2>
            <p className="mt-2 max-w-xl text-sm text-emerald-100/85">Reach buyers faster with photos, price, and instant chat.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 sm:mt-0">
            <Button asChild className="rounded-full bg-[#00A86B] text-white hover:bg-[#009060]">
              <Link href="/create/classified">+ Post Ad</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10">
              <Link href="/classifieds">Browse ads</Link>
            </Button>
          </div>
        </section>

        {classifiedAds.length ? (
          <section className="mt-12">
            <div className="flex flex-col gap-3 border-b border-emerald-900/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-semibold text-[#051B15]">All listings</h2>
              <Link href="/classifieds" className="inline-flex items-center gap-2 text-sm font-semibold text-[#00A86B] hover:underline">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-900/10 bg-white text-[#051B15]">
                  <Filter className="h-4 w-4" aria-hidden />
                  <span className="sr-only">Filters</span>
                </span>
                View marketplace
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {classifiedAds.map((ad) => (
                <TaskPostCard key={ad.id} post={ad} href={buildPostUrl("classified", ad.slug)} taskKey="classified" />
              ))}
            </div>
          </section>
        ) : null}

        {suggestedArticles.length ? (
          <section className="mt-12">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#051B15]">Stories & guides</h2>
              <Link href="/articles" className="text-sm font-semibold text-[#00A86B] hover:underline">
                View all
              </Link>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {suggestedArticles.slice(0, 3).map((article) => (
                <TaskPostCard
                  key={article.id}
                  post={article}
                  href={buildPostUrl("article", article.slug)}
                  compact
                />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
