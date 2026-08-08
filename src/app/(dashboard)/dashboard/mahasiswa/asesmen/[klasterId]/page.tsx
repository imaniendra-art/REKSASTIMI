import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { MateriClient } from "./MateriClient";

export default async function MahasiswaMateriPage({ params }: { params: Promise<{ klasterId: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const resolvedParams = await params;

  return <MateriClient klasterId={resolvedParams.klasterId} />;
}
