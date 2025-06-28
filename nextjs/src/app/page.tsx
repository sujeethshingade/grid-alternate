import { AppSidebar } from "@/components/AppSidebar";
import { AppTable } from "@/components/AppTable";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Home() {
  return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppTable />
        </SidebarInset>
      </SidebarProvider>
  );
}