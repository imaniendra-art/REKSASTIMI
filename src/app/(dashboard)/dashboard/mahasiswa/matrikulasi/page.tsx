import { redirect } from "next/navigation";

export default function MahasiswaMatrikulasiRedirectPage() {
  redirect("/dashboard/mahasiswa/asesmen");
}
