import { PrismaClient } from "../app/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
const { Pool } = pkg;

const connectionString =
  process.env.DATABASE_URL ??
  process.env.DATABASE1_DATABASE_URL ??
  process.env.DATABASE1_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.POSTGRES_URL ??
  "";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

const subjects = [
  {
    slug: "russian",
    title: "Русский язык",
    description: "Сочинения, аргументация, речевые ошибки и критерии ЕГЭ.",
  },
  {
    slug: "biology",
    title: "Биология",
    description: "Развёрнутые ответы, схемы, термины и логика объяснений.",
  },
  {
    slug: "social-science",
    title: "Обществознание",
    description: "Планы, мини-сочинения, примеры и точность понятий.",
  },
  {
    slug: "math-profile",
    title: "Профильная математика",
    description: "Решение задач, доказательства и развёрнутые объяснения.",
  },
  {
    slug: "history",
    title: "История",
    description: "Анализ событий, аргументация и историческое эссе.",
  },
  {
    slug: "physics",
    title: "Физика",
    description: "Развёрнутые решения задач, объяснения явлений и формулы.",
  },
  {
    slug: "chemistry",
    title: "Химия",
    description: "Уравнения реакций, объяснения и развёрнутые ответы.",
  },
  {
    slug: "computer-science",
    title: "Информатика",
    description: "Алгоритмы, программирование и логические задачи.",
  },
  {
    slug: "english",
    title: "Английский язык",
    description: "Письмо, эссе, аргументация и грамматика.",
  },
];

const reviews = [
  {
    name: "Алина, 11 класс",
    rating: 5,
    text: "После каждой проверки стало понятно, что именно исправлять в ответах.",
  },
  {
    name: "Марк, выпускник",
    rating: 5,
    text: "Сервис помог увидеть слабые места без постоянных занятий с репетитором.",
  },
  {
    name: "Екатерина, родитель",
    rating: 5,
    text: "Удобно отслеживать прогресс и получать понятные рекомендации.",
  },
];

const posts = [
  {
    slug: "how-to-read-ege-criteria",
    title: "Как читать критерии ЕГЭ без паники",
    excerpt: "Как превратить формулировки критериев в понятный план ответа.",
    content:
      "Критерии ЕГЭ проще воспринимать как чеклист. Сначала проверьте тезис, затем аргументы, пояснения и связность текста.",
  },
  {
    slug: "second-part-practice-plan",
    title: "План тренировки второй части на 2 недели",
    excerpt: "Как распределить практику, чтобы быстрее увидеть рост результата.",
    content:
      "Выберите один тип задания, сделайте стартовую работу, разберите ошибки и повторяйте только слабые критерии.",
  },
];

async function main() {
  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { slug: subject.slug },
      update: subject,
      create: subject,
    });
  }

  for (const review of reviews) {
    const existing = await prisma.review.findFirst({
      where: { name: review.name },
    });

    if (!existing) {
      await prisma.review.create({ data: review });
    }
  }

  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
