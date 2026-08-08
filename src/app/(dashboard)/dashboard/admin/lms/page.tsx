import { LmsClient } from "./LmsClient";

export const metadata = {
  title: "Manajemen Asesmen (LMS) | REKSA",
};

export default function LmsPage() {
  return (
    <div className="flex flex-col gap-6 w-full mx-auto">
      <LmsClient />
    </div>
  );
}
