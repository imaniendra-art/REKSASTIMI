import { redirect } from "next/navigation";
import { dashboardByRole } from "@/lib/roles";
import { getSession } from "@/lib/session";

export default async function DashboardIndexPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  redirect(dashboardByRole[session.role]);
}
