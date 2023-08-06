import CompareModeButton from "@/widgets/action-box/ui/compare-section/compare-mode-button";
import ActionBoxSection from "src/widgets/action-box/ui/action-box-section";

interface CompareSectionProps {
  onClose: () => void;
}

export default function CompareSection({ onClose }: CompareSectionProps) {
  return (
    <ActionBoxSection>
      <p className="heading-5 text-black-500 uppercase">
        Compare Data for Two Areas
      </p>

      <div onClick={onClose} className="flex w-full flex-col">
        <CompareModeButton />
      </div>
    </ActionBoxSection>
  );
}
