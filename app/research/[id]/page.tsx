import { notFound } from "next/navigation";
import { PAPERS, getPaper } from "@/lib/research";
import PaperDetail from "./PaperDetail";

export function generateStaticParams() {
  return PAPERS.map(p => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const paper = getPaper(id);
  return { title: paper ? `${paper.title} — Rohan Sakeri` : "Paper Not Found" };
}

export default async function PaperPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const paper = getPaper(id);
  if (!paper) notFound();
  return <PaperDetail paper={paper} />;
}
