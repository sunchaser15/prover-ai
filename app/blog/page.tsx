import Link from "next/link";
import { PageShell } from "@/app/components/page-shell";
import { getBlogPosts } from "@/app/lib/public-data";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl">
        <p className="animated-gradient-label mb-3 inline-flex text-sm font-black uppercase">
          Блог
        </p>
        <h1 className="max-w-4xl text-5xl font-black uppercase text-white md:text-7xl">
          Разборы, критерии и план подготовки
        </h1>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="glass-card block p-6 transition-transform hover:-translate-y-1"
            >
              <h2 className="text-3xl font-black uppercase text-white">{post.title}</h2>
              <p className="mt-4 text-base font-medium leading-7 text-white/70">
                {post.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
