import KeuanganDashboardPage from "../page";

export default async function KeuanganSubPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  await params;
  return <KeuanganDashboardPage />;
}
