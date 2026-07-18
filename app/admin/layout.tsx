import type { Metadata } from "next";

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
  return children;
}
