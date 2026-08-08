import { Metadata } from "next";
import F03Client from "./F03Client";

export const metadata: Metadata = {
  title: "Form F03 - REKSA STIMI",
};

export default async function F03KlasterPage({ params }: { params: Promise<{ klasterId: string }> }) {
  const resolvedParams = await params;
  return <F03Client klasterId={resolvedParams.klasterId} />;
}
