import React from "react";
import { SertifikatClient } from "./SertifikatClient";

import { getSession } from "@/lib/session";

export async function generateMetadata() {
  const session = await getSession();
  const nama = session?.name || "Mahasiswa";
  return {
    title: `Sertifikat - ${nama}`,
  };
}

export default async function SertifikatPage({ params }: { params: Promise<{ klasterId: string }> }) {
  const resolvedParams = await params;
  return <SertifikatClient klasterId={resolvedParams.klasterId} />;
}
