import { prisma } from "./prisma";

export async function getSubjects() {
  return prisma.subject.findMany({ orderBy: { title: "asc" } });
}

export async function getReviews() {
  return prisma.review.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getBlogPosts() {
  return prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getBlogPost(slug: string) {
  return prisma.blogPost.findUnique({ where: { slug } });
}
