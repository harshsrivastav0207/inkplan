import type { ReactNode } from "react";

import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({
  children,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ServiceWorkerRegistration />

      <Sidebar />

      <main className="min-h-screen pb-20 md:ml-60 md:pb-0">
        {children}
      </main>

      <MobileNav />
    </div>
  );
}