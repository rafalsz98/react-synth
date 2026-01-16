import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { Provider } from "@/components/provider";
import "./global.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "react-synth | Code music with React",
    template: "%s | react-synth",
  },
  description: "A React library for building musical applications with React",
  icons: {
    icon: "/react-synth.png",
    apple: "/react-synth.png",
  },
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
