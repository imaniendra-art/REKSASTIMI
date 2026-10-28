import { ensureRegistrationPayment } from "@/lib/payment-guard";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { TesClient } from "../TesClient";

export default async function MahasiswaUjianPage({ params }: { params: Promise<{ klasterId: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  await ensureRegistrationPayment(session.id);

  const resolvedParams = await params;

  return <TesClient klasterId={resolvedParams.klasterId} />;
}
