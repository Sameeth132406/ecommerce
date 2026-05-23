import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SmartCart – Premium E-Commerce Platform",
    template: "%s | SmartCart",
  },
  description: "Discover thousands of products at unbeatable prices. Shop electronics, fashion, home goods and more with fast delivery and secure checkout.",
  keywords: ["ecommerce", "shopping", "online store", "SmartCart", "buy online"],
  openGraph: {
    title: "SmartCart – Premium E-Commerce Platform",
    description: "Your one-stop shop for everything",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${syne.variable} font-sans antialiased bg-white dark:bg-surface-dark text-slate-900 dark:text-slate-100`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "var(--toast-bg, #1e293b)",
                color: "#f1f5f9",
                border: "1px solid #334155",
                borderRadius: "12px",
                fontSize: "14px",
              },
              success: { iconTheme: { primary: "#3b82f6", secondary: "#fff" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
