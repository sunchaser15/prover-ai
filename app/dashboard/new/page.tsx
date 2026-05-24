import { redirect } from "next/navigation";
import { PageShell } from "@/app/components/page-shell";
import { SubmissionForm } from "@/app/components/submission-form";
import { getCurrentUser } from "@/app/lib/auth";
import { getSubjects } from "@/app/lib/public-data";

export default async function NewSubmissionPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const subjects = await getSubjects();

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <p className="animated-gradient-label mb-3 inline-flex text-sm font-black uppercase">
          Новая проверка
        </p>
        <h1 className="mb-8 text-5xl font-black uppercase text-white md:text-7xl">
          Загрузите работу
        </h1>
        <SubmissionForm subjects={subjects} />
      </div>
    </PageShell>
  );
}
