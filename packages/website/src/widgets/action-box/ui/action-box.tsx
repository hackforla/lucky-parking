import SingleSearchSection from "@/widgets/action-box/ui/single-search-section";
import CompareSection from "@/widgets/action-box/ui/compare-section";

interface ActionBoxProps {
  onClose: () => void;
}

export default function ActionBox({ onClose }: ActionBoxProps) {
  return (
    <div className="flex flex-col w-[500px] bg-white-200 space-y-2">
      <SingleSearchSection />

      <CompareSection onClose={onClose} />
    </div>
  );
}