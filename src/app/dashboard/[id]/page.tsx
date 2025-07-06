import { redirect } from "next/navigation";
// import Canvas from "@/components/canvas/Canvas";
// import { Room } from "@/components/liveblocks/Room";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

type ParamsType = Promise<{ id: string }>;

export default async function Page({ params }: { params: ParamsType }) {
  const { id } = await params;

  const session = await auth();

  
  return (
    <></>
    //   <Room>
    //     <Canvas>

    //     </Canvas>
    //   </Room>
  );
}