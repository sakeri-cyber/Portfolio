import { notFound } from "next/navigation";
import Link from "next/link";
import { PROJECTS, getProject } from "@/lib/projects";
import ProjectDetail from "./ProjectDetail";

export function generateStaticParams() {
  return PROJECTS.map(p => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = getProject(id);
  return { title: project ? `${project.title} — Rohan Sakeri` : "Project Not Found" };
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}
