import Link from "next/link";
import { PageShell } from "@/app/components/page-shell";
import { getSubjects } from "@/app/lib/public-data";

export default async function SubjectsPage() {
  const subjects = await getSubjects();

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl">
        <p className="animated-gradient-label mb-3 inline-flex text-sm font-black uppercase">
          Предметы
        </p>
        <h1 className="max-w-4xl text-5xl font-black uppercase text-white md:text-7xl">
          Тренируйте вторую часть по нужному предмету
        </h1>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {subjects.map((subject) => (
            <article key={subject.id} className="glass-card p-6">
              <h2 className="text-3xl font-black uppercase text-white">
                {subject.title}
              </h2>
              <p className="mt-4 text-base font-medium leading-7 text-white/70">
                {subject.description}
              </p>
              <Link
                href="/dashboard/new"
                className="mt-6 inline-flex rounded-md border border-white/15 px-4 py-3 text-sm font-black uppercase text-white hover:bg-white/10"
              >
                Проверить работу
              </Link>
            </article>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
