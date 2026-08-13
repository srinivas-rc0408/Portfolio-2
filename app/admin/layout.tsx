import type { Metadata } from "next";
import MotionProvider from "@/components/MotionProvider";

// The admin CMS must never be indexed — page.tsx is a client component and
// can't export metadata, so this server layout owns the robots directive.
export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Admin sits outside the (shell) route group, so it never inherited
  // AppShell's MotionConfig — its panel and login animations were ignoring the
  // user's reduce-motion preference.
  return <MotionProvider>{children}</MotionProvider>;
}
