"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname, useRouter } from "next/navigation";

export const DynamicBreadcrumb = () => {
  const router = usePathname();

  // Split the pathname to create the breadcrumb items dynamically
  const pathSegments = router.split("/").filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathSegments.length > 0 ? (
          pathSegments.map((segment, index) => {
            // Create a URL from the segments up to the current index
            const url = "/" + pathSegments.slice(0, index + 1).join("/");

            return (
              <div key={`${segment}-${index}`} className="flex items-center gap-2">
                <BreadcrumbItem key={`${segment}-${index}`}>
                  {index === pathSegments.length - 1 ? (
                    // For the last breadcrumb item, use BreadcrumbPage for the current page
                    <BreadcrumbPage>{segment}</BreadcrumbPage>
                  ) : (
                    // For the other breadcrumb items, use BreadcrumbLink
                    <BreadcrumbLink href={url}>{segment}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < pathSegments.length - 1 && <BreadcrumbSeparator />}
              </div>
            );
          })
        ) : (
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
