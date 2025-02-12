"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Router } from "next/router";
// import { supabase } from "../../../utils/supabase/client";
import { createClient } from "../../../utils/supabase/server";

export async function login(formData: FormData) {
  // const supabases = supabase;
  const supabases = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const userData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data, error } = await supabases.auth.signInWithPassword(userData);

  if (error) {
    return error?.message;
  }

  redirect("/dashboard/chart");
}

export async function signup(formData: FormData) {
  // const supabases = supabase;
  const supabases = await createClient();
  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  if (!data.email.endsWith("@automationedge.com")) {
    return "Email must be from the domain @automationedge.com.";
  }

  const { error } = await supabases.auth.signUp(data);

  if (error) {
    return error?.message;
  }

  revalidatePath("/", "layout");
  redirect(`/verify-email?email=${encodeURIComponent(data.email)}`);
}

export const signOut = async () => {
  // const supabases = supabase;
  const supabases = await createClient();
  await supabases.auth.signOut();
  redirect("/login");
};
