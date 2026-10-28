import { ensureRegistrationPayment } from "@/lib/payment-guard";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { AsesmenListClient } from "./AsesmenListClient";

export default async function MahasiswaAsesmenPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  await ensureRegistrationPayment(session.id);

  return <AsesmenListClient />;
}
