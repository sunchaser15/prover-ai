import { PageShell } from "@/app/components/page-shell";

const steps = [
  "Выберите предмет и вставьте развёрнутый ответ.",
  "Сервис проверит работу по критериям ЕГЭ.",
  "Получите балл, сильные стороны и рекомендации для роста.",
];

export default function HowItWorksPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-7xl">
        <p className="animated-gradient-label mb-3 inline-flex text-sm font-black uppercase">
          Как это работает
        </p>
        <h1 className="max-w-4xl text-5xl font-black uppercase text-white md:text-7xl">
          Проверка без лишних шагов
        </h1>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <article key={step} className="glass-card p-6">
              <span className="animated-gradient-label text-5xl font-black">
                0{index + 1}
              </span>
              <p className="mt-6 text-xl font-bold leading-8 text-white">{step}</p>
            </article>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
