import { getFinanceDashboardData } from "./data";
import { KeuanganDashboardClient } from "./KeuanganDashboardClient";

export default async function KeuanganDashboardPage() {
  const { payments, analytics } = await getFinanceDashboardData();

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      <KeuanganDashboardClient payments={payments} analytics={analytics} />
    </div>
  );
}
