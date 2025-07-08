"use client";

import { useState, useTransition } from "react";
import { SlPencil } from "react-icons/sl";
import { createRoom } from "~/app/actions/rooms";
import { useLoading } from "../LoadingProvider";
import { LoadingSpinner } from "../common";

export default function CreateRoom() {
  const [hover, setHover] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { showGlobalLoading, hideGlobalLoading, showToast } = useLoading();

  const handleCreateRoom = async () => {
    startTransition(async () => {
      try {
        showGlobalLoading("Creating new design file...");
        await createRoom();
        showToast("Design file created successfully!", "success");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create design file";
        showToast(message, "error");
      } finally {
        hideGlobalLoading();
      }
    });
  };

  return (
    <div
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={handleCreateRoom}
      className={`flex h-fit w-fit cursor-pointer select-none items-center gap-3 rounded-xl bg-gray-100 px-6 py-5 transition-all hover:bg-blue-500 ${
        isPending ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <div className="flex h-fit w-fit items-center justify-center rounded-full bg-blue-600 p-2">
        {isPending ? (
          <LoadingSpinner size="small" className="text-white" />
        ) : (
          <SlPencil className="h-4 w-4 text-white" />
        )}
      </div>
      <div className="flex flex-col gap-0.5 text-[11px]">
        <p className={`font-semibold ${hover ? "text-white" : "text-black"}`}>
          {isPending ? "Creating..." : "New design file"}
        </p>
        <p className={`${hover ? "text-white" : "text-black"}`}>
          {isPending ? "Please wait..." : "Create a new design"}
        </p>
      </div>
    </div>
  );
}
