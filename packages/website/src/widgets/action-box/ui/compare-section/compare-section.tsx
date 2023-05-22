import CompareModeButton from "@/widgets/action-box/ui/compare-section/compare-mode-button";
import ActionBoxSection from "src/widgets/action-box/ui/action-box-section";

export default function CompareSection() {
  return (
    <ActionBoxSection>
      <p className="heading-5 text-black-500 uppercase">
        Compare Data for Two Areas
      </p>

      <CompareModeButton />
    </ActionBoxSection>
  );
}
