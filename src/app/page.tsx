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

  // If authenticated, check if user exists and email verification status
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { 
      isEmailVerified: true, 
      email: true,
      emailVerified: true // This is set by NextAuth for OAuth providers
    },
  });

  // If user not found (shouldn't happen but safety check)
  if (!user) {
    redirect("/signin");
  }

  // If email not verified (for credential users) and not OAuth verified, show verification prompt
  if (!user.isEmailVerified && !user.emailVerified) {
    return <AuthenticationHandler userEmail={user.email} />;
  }

  // If everything is good, redirect to dashboard
  redirect("/dashboard");
}
