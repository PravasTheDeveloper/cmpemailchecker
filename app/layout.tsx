import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: "CMP EMAIL CHEKCER",
  description: "CodeMyPixel's new email verification app - Verify email addresses with our powerful tool. Check email format, domain status, professional status, and mailbox validity instantly.",
    keywords: "email verifier, email checker, email validation, verify email address, mailmeteor",
  authors: [{ name: "mailmeteor" }],
  openGraph: {
    title: "Free Email Checker - Verify Email Address",
    description: "Verify email address thanks to our free email verifier tool.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
