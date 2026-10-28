import { getFinanceDashboardData } from "../data";
import { getFinanceSettings } from "@/lib/finance-settings";
import { KuitansiClient } from "./KuitansiClient";

export default async function KuitansiKeuanganPage() {
  const [{ payments }, settings] = await Promise.all([
    getFinanceDashboardData(),
    getFinanceSettings(),
  ]);

  const acceptedPayments = payments.filter((p) => p.statusVerifikasi === "Diterima");

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      <KuitansiClient payments={acceptedPayments} settings={settings} />
    </div>
  );
}
