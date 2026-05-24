import Link from "next/link";
import { PageShell } from "@/app/components/page-shell";

const plans = [
  {
    title: "Старт",
    price: "0 ₽",
    text: "7 дней бесплатно, без привязки карты.",
  },
  {
    title: "Практика",
    price: "990 ₽",
    text: "Проверки, история работ и персональные рекомендации.",
  },
  {
    title: "Интенсив",
    price: "1990 ₽",
    text: "Больше проверок и приоритетный разбор сложных ответов.",
  },
];

export default function PricingPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-7xl">
        <p className="animated-gradient-label mb-3 inline-flex text-sm font-black uppercase">
          Тарифы
        </p>
        <h1 className="max-w-4xl text-5xl font-black uppercase text-white md:text-7xl">
          Начните бесплатно, масштабируйте практику позже
        </h1>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.title} className="glass-card p-6">
              <h2 className="text-3xl font-black uppercase text-white">{plan.title}</h2>
              <strong className="mt-5 block text-5xl font-black text-[#7CFF8A]">
                {plan.price}
              </strong>
              <p className="mt-4 text-base font-medium leading-7 text-white/70">
                {plan.text}
              </p>
            </article>
          ))}
        </div>
        <Link
          href="/register"
          className="animated-gradient-button mt-8 inline-flex rounded-md px-6 py-4 text-sm font-black uppercase text-white"
        >
          Попробовать бесплатно
        </Link>
      </div>
    </PageShell>
  );
}
