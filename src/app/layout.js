import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import TopNavbar from "@/components/ui/custom/TopNavbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SolXplore",
  description: "Explore your Solana onchain activities",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Providers>

      <body className={inter.className}>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <TopNavbar>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">

        {children}
        </main>
          </TopNavbar>
      </div>
        </body>
      </Providers>
    </html>
  );
}
