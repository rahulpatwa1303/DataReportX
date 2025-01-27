"use client";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import React from "react";

function VerifyEmail() {
  const searchParams = useSearchParams();

  const email = searchParams.get("email");

  return (
    <div className="h-screen flex items-center justify-center">
      <Card className="flex flex-col p-8 rounded-xl drop-shadow-md items-center justify-center bg-white gap-4">
        <Image src={'/email.png'} alt="email image" width={100} height={100}/>
        <div className="text-xl">Verify your email address to process</div>
        <p>We have sent an email to address : <b>{email}</b> </p>
        <p>
          Please check your email and click on the link provided to verify your
          address
        </p>
      </Card>
    </div>
  );
}

export default VerifyEmail;
