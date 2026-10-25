import type { Metadata } from "next";
import type { ReactNode } from "react";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "REKSA STIMI | Platform Rekognisi Pembelajaran Lampau STIMI YAPMI Makassar",
  description: "Ubah pengalaman kerja, pelatihan, dan keahlian Anda menjadi SKS sah untuk meraih gelar Sarjana Manajemen (S.M.) di STIMI YAPMI Makassar melalui program RPL Tipe A resmi.",
  icons: {
    icon: "/icon-logo-reksa.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" data-theme="teal" data-mode="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Anti-flash theme inline script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedColor = localStorage.getItem('reksa_color_theme') || 'teal';
                  var savedMode = localStorage.getItem('reksa_mode_theme') || 'light';
                  document.documentElement.setAttribute('data-theme', savedColor);
                  document.documentElement.setAttribute('data-mode', savedMode);
                  if (savedMode === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <QueryProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
