import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import AuthenticationHandler from '@/components/AuthenticationHandler';

export default async function HomePage() {
  const session = await auth();

  // If not authenticated, redirect to signin
  if (!session?.user) {
    redirect("/signin");
  }

  // If authenticated, check if email is verified
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isEmailVerified: true, email: true },
  });

  // If user not found (shouldn't happen but safety check)
  if (!user) {
    redirect("/signin");
  }

  // If email not verified, show verification prompt
  if (!user.isEmailVerified) {
    return <AuthenticationHandler userEmail={user.email} />;
  }

  // If everything is good, redirect to dashboard
  redirect("/dashboard");
}
