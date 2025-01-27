"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, signup } from "@/app/login/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (
    event: React.FormEvent,
    type: "login" | "signup"
  ) => {
    event.preventDefault();
    setLoading(true);

    const form =
      event.currentTarget instanceof HTMLFormElement
        ? event.currentTarget
        : (event.currentTarget.closest("form") as HTMLFormElement);

    if (!form) {
      toast({ title: "Form element not found.", variant: "destructive" });
      return;
    }
    const formData = new FormData(form);
    
    let errorMessage: string | null = null;
    if (type === "login") {
      errorMessage = await login(formData);
    } else {
      errorMessage = await signup(formData);
    }

    if (errorMessage) {
      toast({ title: errorMessage, variant: "destructive" });
    } else {
      toast({
        title: `${type === "login" ? "Logged in" : "Signed up"} successfully!`,
      });
      router.push("/"); // Redirect on success
    }

    setLoading(false);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => handleSubmit(e, "login")}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a
                onClick={(e) => handleSubmit(e, "signup")}
                className="underline underline-offset-4 cursor-pointer"
              >
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
