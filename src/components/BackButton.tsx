"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";

function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    router.back(); // Navigates to the previous page
  };

  return (
    <Button
      variant={"ghost"}
      className="rounded-full"
      onClick={handleBack} // Attach the back functionality to onClick
    >
      <ArrowLeft />
    </Button>
  );
}

export default BackButton;
