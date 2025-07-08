import { redirect } from "next/navigation";
import Canvas from "@/components/canvas/Canvas";
import { Room } from "@/components/liveblocks/Room";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { LoadingWrapper } from "@/components/common";
import { Suspense } from "react";

type ParamsType = Promise<{ id: string }>;

function CanvasLoading() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading canvas...</p>
      </div>
    </div>
  );
}

export default async function Page({ params }: { params: ParamsType }) {
  const { id } = await params;

  const session = await auth();

  const room = await db.room.findUnique({
    where: { id: id },
    select: {
      title: true,
      ownerId: true,
      roomInvites: {
        select: {
          user: true,
        },
      },
    },
  });

  if (!room) redirect("/404");

  const inviteeUserIds = room.roomInvites.map((invite) => invite.user.id);
  if (
    !inviteeUserIds.includes(session?.user.id ?? "") &&
    session?.user.id !== room.ownerId
  ) {
    redirect("/404");
  }

  return (
    <Suspense fallback={<CanvasLoading />}>
      <Room key={id} roomId={"room:" + id}>
        <Canvas
          key={id}
          roomName={room.title}
          roomId={id}
          othersWithAccessToRoom={room.roomInvites.map((x) => x.user)}
        />
      </Room>
    </Suspense>
  );
}