"use server";

import { auth } from "@/server/auth";
import { signout } from "../actions/auth";
import { db } from "@/server/db";
import UserMenu from "@/components/dashboard/UserMenu";
import CreateRoom from "@/components/dashboard/CreateRoom";
import RoomsView from "@/components/dashboard/RoomsView";
import { LoadingWrapper, InlineLoader } from "@/components/common";
import { Suspense } from "react";

function DashboardLoading() {
  return (
    <div className="flex h-screen w-full">
      <div className="flex h-screen min-w-[264px] flex-col border-r border-gray-200 bg-white p-2">
        <div className="h-12 bg-gray-100 rounded mb-4 animate-pulse" />
      </div>
      <div className="flex h-screen w-full flex-col">
        <div className="flex min-h-[50px] items-center border-b border-gray-200 bg-white pl-8">
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex h-full flex-col gap-10 p-8">
          <div className="h-20 bg-gray-100 rounded animate-pulse" />
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-auto-fill gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 w-96 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function Page() {
  const session = await auth();

  const user = await db.user.findUniqueOrThrow({
    where: {
      id: session?.user.id,
    },
    include: {
      ownedRooms: true,
      roomInvites: {
        include: {
          room: true,
        },
      },
    },
  });

  return (
    <Suspense fallback={<DashboardLoading />}>
      <div className="flex h-screen w-full">
        <div className="flex h-screen min-w-[264px] flex-col border-r border-gray-200 bg-white p-2">
          <UserMenu email={user.email} />
        </div>
        <div className="flex h-screen w-full flex-col">
          <div className="flex min-h-[50px] items-center border-b border-gray-200 bg-white pl-8">
            <h2 className="text-[13px]">Recents</h2>
          </div>
          <div className="flex h-full flex-col gap-10 p-8">
            <CreateRoom />
            <RoomsView
              ownedRooms={user.ownedRooms}
              roomInvites={user.roomInvites.map((x) => x.room)}
            />
          </div>
        </div>
      </div>
    </Suspense>
  );
}