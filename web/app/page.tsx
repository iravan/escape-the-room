import { SceneLoader } from "@/components/room/SceneLoader";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
  return (
    <main className="fixed inset-0 h-dvh w-full overflow-hidden bg-background">
      <SceneLoader />
      <Toaster position="top-center" />
    </main>
  );
}
