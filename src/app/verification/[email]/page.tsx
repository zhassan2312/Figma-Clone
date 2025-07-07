"use client";

import Link from "next/link";
import { useActionState, useState, useRef, use } from "react";
import { verifyEmail, resendVerificationCode } from "../../actions/auth";

export default function VerificationPage({ 
  params 
}: { 
  params: Promise<{ email: string }> 
}) {
  const resolvedParams = use(params);
  const email = decodeURIComponent(resolvedParams.email);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Create a wrapper function to handle the typing correctly
  const verifyEmailAction = async (prevState: string | null, formData: FormData) => {
    const result = await verifyEmail(prevState || undefined, formData);
    return result || null;
  };

  const [errorMessage, formAction, isPending] = useActionState(
    verifyEmailAction,
    null,
  );
  const [resendMessage, setResendMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    e.target.value = value;
    
    // Auto-submit when 6 digits are entered
    if (value.length === 6) {
      setTimeout(() => {
        if (inputRef.current?.form) {
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          inputRef.current.form.dispatchEvent(submitEvent);
        }
      }, 100);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setResendMessage("");
    try {
      const result = await resendVerificationCode(email);
      if (result === "success") {
        setResendMessage("Verification code sent successfully!");
      } else {
        setResendMessage(result || "Failed to resend verification code. Please try again.");
      }
    } catch (error) {
      setResendMessage("Failed to resend verification code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">
            Verify your email
          </h1>
          <p className="text-sm text-gray-600">
            We sent a verification code to{" "}
            <span className="font-medium text-gray-900">{email}</span>
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="email" value={email} />

          <div className="relative h-fit">
            <input
              ref={inputRef}
              className="w-full text-gray-800 rounded-md border border-gray-300 px-3 pb-1 pt-7 text-lg focus:border-black focus:outline-none text-center tracking-wider font-mono"
              type="text"
              name="verificationCode"
              required
              maxLength={6}
              minLength={6}
              pattern="[0-9]{6}"
              placeholder="000000"
              autoComplete="one-time-code"
              onChange={handleInputChange}
              autoFocus
            />
            <label className="absolute text-gray-400 left-3 top-2 text-[12px]">
              VERIFICATION CODE
            </label>
          </div>

          <button
            disabled={isPending}
            className="w-full rounded-md bg-black py-2 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isPending ? "Verifying..." : "Verify Email"}
          </button>

          {errorMessage && (
            <p className="text-center text-sm text-red-500">{errorMessage}</p>
          )}
        </form>

        <div className="space-y-3">
          <div className="text-center">
            <button
              onClick={handleResendCode}
              disabled={isResending}
              className="text-sm text-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              {isResending ? "Sending..." : "Didn't receive the code? Resend"}
            </button>
          </div>

          {resendMessage && (
            <p className={`text-center text-sm ${
              resendMessage.includes("success") ? "text-green-600" : "text-red-500"
            }`}>
              {resendMessage}
            </p>
          )}

          <p className="text-center text-xs text-gray-600">
            Wrong email?{" "}
            <Link className="text-blue-400 hover:text-blue-600" href="/signup">
              Go back to sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
