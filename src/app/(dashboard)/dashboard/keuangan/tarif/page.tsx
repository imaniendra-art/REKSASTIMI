import { getFinanceSettings } from "@/lib/finance-settings";
import { TarifClient } from "./TarifClient";

export default async function TarifKeuanganPage() {
  const settings = await getFinanceSettings();

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      <TarifClient initialSettings={settings} />
    </div>
  );
}
