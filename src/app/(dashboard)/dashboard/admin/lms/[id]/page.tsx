import { LmsDetailClient } from "./LmsDetailClient";

export const metadata = {
  title: "Detail Modul Asesmen | REKSA",
};

export default async function LmsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return (
    <div className="flex flex-col gap-6 w-full mx-auto">
      <LmsDetailClient moduleId={resolvedParams.id} />
    </div>
  );
}
