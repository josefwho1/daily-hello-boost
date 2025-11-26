import { useNavigate } from "react-router-dom";
import { packs, getPackById } from "@/data/packs";
import { PackSelector } from "@/components/PackSelector";
import { useUserProgress } from "@/hooks/useUserProgress";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Packs = () => {
  const navigate = useNavigate();
  const { progress, updateProgress } = useUserProgress();

  const selectedPackId = progress?.selected_pack_id || 'starter-pack';

  const handleSelectPack = async (packId: string) => {
    await updateProgress({ selected_pack_id: packId });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Challenge Packs</h1>
        </div>

        <PackSelector
          packs={packs}
          selectedPackId={selectedPackId}
          onSelectPack={handleSelectPack}
        />
      </div>
    </div>
  );
};

export default Packs;
