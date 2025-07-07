"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register } from "../actions/auth";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function Page() {
  const [errorMessage, formAction, isPending] = useActionState(
    register,
    undefined,
  );
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-center text-2xl font-semibold text-gray-900">
          Sign up
        </h1>
        
        {/* Google Sign In Button */}
        <GoogleSignInButton text="Continue with Google" />
        
        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Or continue with email</span>
          </div>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="relative h-fit">
            <input
              className="w-full text-gray-800 rounded-md border border-gray-300 px-3 pb-1 pt-7 text-sm focus:border-black focus:outline-none"
              type="email"
              name="email"
              required
            />
            <label className="absolute text-gray-400 left-3 top-2 text-[12px]">EMAIL</label>
          </div>

          <div className="relative h-fit">
            <input
              className="w-full text-gray-800 rounded-md border border-gray-300 px-3 pb-1 pt-7 text-sm focus:border-black focus:outline-none"
              type="password"
              name="password"
              required
              minLength={8}
            />
            <label className="absolute text-gray-400 left-3 top-2 text-[12px]">
              PASSWORD
            </label>
          </div>

          <button
            disabled={isPending}
            className="w-full rounded-md bg-black py-2 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isPending ? "Registering..." : "Register"}
          </button>

          <p className="text-center text-xs text-gray-600">
            Have an account?{" "}
            <Link className="text-blue-400 hover:text-blue-600" href="/signin">
              Sign in
            </Link>
          </p>

          {errorMessage && (
            <p className="text-center text-sm text-red-500">{errorMessage}</p>
          )}
        </form>
      </div>
    </div>
  );
}