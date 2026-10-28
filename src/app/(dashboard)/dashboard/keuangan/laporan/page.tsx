import { getFinanceDashboardData } from "../data";
import { LaporanClient } from "./LaporanClient";

export default async function LaporanKeuanganPage() {
  const { payments, analytics } = await getFinanceDashboardData();

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      <LaporanClient payments={payments} analytics={analytics} />
    </div>
  );
}
