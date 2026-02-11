import "./globals.css";
import { Toaster } from "sonner";

export const metadata = {
  title: "GhostSwap | Anonymous Money Transfer",
  description: "Anonymize your money securely and privately.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans text-foreground bg-background">
        {children}
        <Toaster position="top-center" theme="dark" />
      </body>
    </html>
  );
}
