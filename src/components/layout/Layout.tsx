
import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <SidebarInset>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-grow container py-6">
              {children}
            </main>
            <Footer />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
