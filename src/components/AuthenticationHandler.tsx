"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resendVerificationCode } from "@/app/actions/auth";

interface AuthenticationHandlerProps {
  userEmail: string;
}

export default function AuthenticationHandler({ userEmail }: AuthenticationHandlerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleResendVerification = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const result = await resendVerificationCode(userEmail);
      if (result === "success") {
        setMessage("Verification email sent successfully!");
        // Navigate to verification page after a brief delay
        setTimeout(() => {
          router.push(`/verification/${encodeURIComponent(userEmail)}`);
        }, 1500);
      } else {
        setMessage(result || "Failed to send verification email");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToVerification = () => {
    router.push(`/verification/${encodeURIComponent(userEmail)}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">
            Email Verification Required
          </h1>
          <p className="text-gray-600">
            Please verify your email address to continue using Figma Clone.
          </p>
          <p className="text-sm text-gray-500">
            We sent a verification code to: <strong>{userEmail}</strong>
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoToVerification}
            className="w-full rounded-md bg-black py-2 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none"
          >
            Enter Verification Code
          </button>

          <button
            onClick={handleResendVerification}
            disabled={isLoading}
            className="w-full rounded-md border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            {isLoading ? "Sending..." : "Resend Verification Email"}
          </button>
        </div>

        {message && (
          <div className={`rounded-md p-3 text-sm ${
            message.includes("success") 
              ? "bg-green-50 text-green-800" 
              : "bg-red-50 text-red-800"
          }`}>
            {message}
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => router.push("/signin")}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Sign in with a different account
          </button>
        </div>
      </div>
    </div>
  );
}
