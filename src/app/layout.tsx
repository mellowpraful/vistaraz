import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CrisisOS — Emergency Response Platform",
    template: "%s | CrisisOS",
  },
  description:
    "CrisisOS — Intelligent Emergency Response & Resource Coordination Platform. Real-time incident management, AI-assisted dispatch, and digital twin simulation for emergency operations.",
  keywords: ["emergency response", "incident management", "resource dispatch", "crisis management"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
