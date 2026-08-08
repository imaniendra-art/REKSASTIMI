import { ApplicantDetailPage } from "../_components/ApplicantDetailPage";

export default async function AdminMahasiswaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <ApplicantDetailPage id={id} />;
}
