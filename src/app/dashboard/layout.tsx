import { AppSidebar } from "@/components/app-sidebar";
import { DynamicBreadcrumb } from "@/components/DynamicBreadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";

export const metadata = {
  title: "Dashboard - DataReportX",
  description: "Manage and track your reports in the dashboard of DataReportX.",
  keywords: "dashboard, reports, client reports, DataReportX",
  authors: [{ name: "Rahul Patwa" }],
  openGraph: {
    title: "Dashboard - DataReportX",
    description:
      "Track your data, generate reports, and manage your clients from the dashboard of DataReportX.",
    url: "https://www.datreportx.com/dashboard",
    site_name: "DataReportX Dashboard",
    images: [
      {
        url: "https://www.datreportx.com/dashboard-og-image.jpg", // Replace with your image URL
        width: 1200,
        height: 630,
        alt: "DataReportX Dashboard",
      },
    ],
    type: "website",
  },
  robots: "index, follow", // Adjust depending on whether you want to index the page
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col h-screen">
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <DynamicBreadcrumb />
            </div>
          </header>
          <main className="flex flex-grow">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
