import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getSession } from "@/lib/session";
import { connectMongoDB } from "@/lib/mongodb";
import { Payment } from "@/models/Payment";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  let isPaymentLocked = false;
  if (session.role === "mahasiswa") {
    await connectMongoDB();
    const acceptedPayment = await Payment.exists({
      userId: session.id,
      statusVerifikasi: "Diterima",
      jenisPembayaran: /^Biaya Pendaftaran RPL$/i,
    });
    isPaymentLocked = !acceptedPayment;
  }

  return (
    <DashboardShell
      user={{
        name: session.name,
        role: session.role,
        isPaymentLocked,
      }}
    >
      {children}
    </DashboardShell>
  );
}
