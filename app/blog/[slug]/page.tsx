import { notFound } from "next/navigation";
import { PageShell } from "@/app/components/page-shell";
import { getBlogPost } from "@/app/lib/public-data";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <PageShell>
      <article className="glass-card mx-auto max-w-3xl p-6">
        <p className="animated-gradient-label mb-3 inline-flex text-sm font-black uppercase">
          Блог
        </p>
        <h1 className="text-4xl font-black uppercase text-white md:text-6xl">
          {post.title}
        </h1>
        <p className="mt-6 text-lg font-medium leading-8 text-white/76">
          {post.content}
        </p>
      </article>
    </PageShell>
  );
}
