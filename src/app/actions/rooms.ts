"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

export async function createRoom() {
  const session = await auth();

  if (!session?.user.id) throw new Error("No user id found.");

  const room = await db.room.create({
    data: {
      owner: {
        connect: {
          id: session.user.id,
        },
      },
    },
    select: {
      id: true,
    },
  });

  redirect("/dashboard/" + room.id);
}

export async function updateRoomTitle(title: string, id: string) {
  const session = await auth();

  if (!session?.user.id) throw new Error("No user id found.");

  await db.room.findUniqueOrThrow({
    where: {
      id: id,
      ownerId: session.user.id,
    },
  });

  await db.room.update({
    where: {
      id: id,
    },
    data: {
      title: title,
    },
  });

  revalidatePath("dashboard");
}

export async function deleteRoom(id: string) {
  const session = await auth();

  if (!session?.user.id) throw new Error("No user id found.");

  await db.room.findUniqueOrThrow({
    where: {
      id: id,
      ownerId: session.user.id,
    },
  });

  await db.room.delete({
    where: {
      id: id,
    },
  });

  revalidatePath("dashboard");
}

export async function shareRoom(id: string, inviteEmail: string) {
  const session = await auth();

  if (!session?.user.id) throw new Error("No user id found.");

  await db.room.findUniqueOrThrow({
    where: {
      id: id,
      ownerId: session.user.id,
    },
  });

  const invitedUser = await db.user.findUnique({
    where: { email: inviteEmail },
    select: { id: true },
  });

  if (!invitedUser) return "User not found.";

  await db.roomInvite.create({
    data: {
      roomId: id,
      userId: invitedUser.id,
    },
  });

  revalidatePath("dashboard");
}

export async function deleteInvitation(id: string, inviteEmail: string) {
  const session = await auth();

  if (!session?.user.id) throw new Error("No user id found.");

  await db.room.findUniqueOrThrow({
    where: {
      id: id,
      ownerId: session.user.id,
    },
  });

  await db.roomInvite.deleteMany({
    where: {
      roomId: id,
      user: {
        email: inviteEmail,
      },
    },
  });

  revalidatePath("dashboard");
}