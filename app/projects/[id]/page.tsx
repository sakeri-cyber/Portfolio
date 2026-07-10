import { notFound } from "next/navigation";
import { PROJECTS, getProject } from "@/lib/projects";
import ProjectDetail from "./ProjectDetail";
import AnswerEngineDetail from "./AnswerEngineDetail";
import BidOMaticDetail from "./BidOMaticDetail";
import NautilusDetail from "./NautilusDetail";

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
  if (id === "answer-engine") return <AnswerEngineDetail project={project} />;
  if (id === "bid-o-matic") return <BidOMaticDetail project={project} />;
  if (id === "nautilus") return <NautilusDetail project={project} />;
  return <ProjectDetail project={project} />;
}
