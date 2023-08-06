import SingleSearchSection from "@/widgets/action-box/ui/single-search-section";
import CompareSection from "@/widgets/action-box/ui/compare-section";

interface ActionBoxProps {
  onClose: () => void;
}

export default function ActionBox({ onClose }: ActionBoxProps) {
  return (
    <div className="bg-white-200 flex w-[500px] flex-col space-y-2">
      <SingleSearchSection />

      <CompareSection onClose={onClose} />
    </div>
  );
}
