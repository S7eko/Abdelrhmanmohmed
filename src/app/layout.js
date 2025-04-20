import { Geist, Geist_Mono } from "next/font/google";
import "./style/globals.css";
import Navigation from "./components/navbar";
import Footer from "./components/footer";
import Chatbot from "./components/chatGpt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SkillVerse",
  description:
    "SkillVerse is your gateway to high-quality online courses in programming, design, business, and more. Upgrade your skills and advance your career with expert-led content.",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.png", // نستخدم PNG هنا لأجهزة Apple
  },
  openGraph: {
    title: "SkillVerse",
    description: "Upgrade your skills with top online courses.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "SkillVerse - Online Learning Platform",
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* أيقونات المتصفح */}
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="icon" href="/logo.png" sizes="any" type="image/png" />
        <link rel="shortcut icon" href="/logo.svg" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Navigation />
        {children}
        <Chatbot />
        <Footer />
      </body>
    </html>
  );
}
