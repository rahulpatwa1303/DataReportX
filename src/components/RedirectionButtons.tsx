"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

function RedirectionButtons({
  title,
  icon,
  path,
}: {
  title: string;
  icon: React.ReactNode;
  path: string;
}) {
  const router = useRouter();

  return (
    <Button onClick={() => router.push(path)}>
      {icon}
      {title}
    </Button>
  );
}

export default RedirectionButtons;
