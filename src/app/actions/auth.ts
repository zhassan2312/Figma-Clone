"use server";

import { isValid, ZodError } from "zod";
import { signUpSchema } from "@/schemas";
import { db } from "@/server/db";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/server/auth";
import { AuthError } from "next-auth";
import otp from "otp-generator";
import { sendVerificationEmail } from "@/server/email";

export async function signout() {
  await signOut();
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials";
        default:
          return "Something went wrong";
      }
    }
    throw error;
  }
}

export async function register(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const { email, password } = await signUpSchema.parseAsync({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const user = await db.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user) {
      return "User already exists";
    }

    const hash = await bcrypt.hash(password, 10);

    const verificationCode = otp.generate(6, {
      specialChars: false,
      digits: true,
    });

    await db.user.create({
      data: {
        email: email,
        password: hash,
        isEmailVerified: false,
        verificationCode: verificationCode,
      },
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationCode);
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // Note: We don't return an error here because the user was created successfully
      // The verification email failure is logged but doesn't block the registration
    }

  } catch (error) {
    if (error instanceof ZodError) {
      return error.errors.map((error) => error.message).join(", ");
    }
  }

  redirect("/verification/" + encodeURIComponent(formData.get("email") as string));
}

export async function verifyEmail(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const email = formData.get("email") as string;
    const verificationCode = formData.get("verificationCode") as string;

    if (!email || !verificationCode) {
      return "Email and verification code are required";
    }

    if (verificationCode.length !== 6) {
      return "Verification code must be 6 digits";
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return "User not found";
    }

    if(user?.verificationCode !== verificationCode) {
      return "Invalid verification code";
    }

    await db.user.update({
      where: { email },
      data: { emailVerified: new Date(), isEmailVerified: true, verificationCode: null },
    });
  } catch (error) {
    return "An error occurred during verification";
  }

  redirect("/signin");
}

export async function resendVerificationCode(email: string) {
  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return "User not found";
    }

    const newVerificationCode = otp.generate(6, {
      specialChars: false,
      digits: true,
    });
    
    await db.user.update({
      where: { email },
      data: { verificationCode: newVerificationCode },
    });
    
    // Send verification email
    const emailResult = await sendVerificationEmail(email, newVerificationCode);
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      return "Failed to send verification email";
    }

   return "success";
  } catch (error) {
    return "Failed to resend verification code";
  }
}