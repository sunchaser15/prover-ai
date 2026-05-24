import { PageShell } from "@/app/components/page-shell";
import { getReviews } from "@/app/lib/public-data";

export default async function ReviewsPage() {
  const reviews = await getReviews();

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl">
        <p className="animated-gradient-label mb-3 inline-flex text-sm font-black uppercase">
          Отзывы
        </p>
        <h1 className="max-w-4xl text-5xl font-black uppercase text-white md:text-7xl">
          Ученики видят прогресс быстрее
        </h1>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.id} className="glass-card p-6">
              <strong className="text-3xl font-black text-[#7CFF8A]">
                {review.rating}/5
              </strong>
              <p className="mt-4 text-base font-medium leading-7 text-white/74">
                {review.text}
              </p>
              <p className="mt-5 text-sm font-black uppercase text-white">
                {review.name}
              </p>
            </article>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
