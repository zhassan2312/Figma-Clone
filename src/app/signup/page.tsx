"use client";
import Link from "next/link";
import { useActionState } from "react";
import { register } from "@/app/actions/auth";

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
        <form action={formAction} className="space-y-4">
          <div className="relative h-fit">
            <input
              className="w-full text-gray-800  rounded-md border border-gray-300 px-3 pb-1 pt-7 text-sm focus:border-black focus:outline-none"
              type="email"
              name="email"
              required
            />
            <label className="absolute left-3 text-gray-400 top-2 text-[12px]">EMAIL</label>
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
            className="w-full rounded-md bg-black py-2 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Sign up
          </button>

          <p className="text-center text-xs text-gray-600">
            Have an account?{" "}
            <Link className="text-blue-400 hover:text-blue-600" href="/signin">
              Sign in
            </Link>
          </p>

            {errorMessage && (
            <p className="text-center text-red-500 text-sm">
                {errorMessage}
                </p>
            )}

          
        </form>
      </div>
    </div>
  );
}