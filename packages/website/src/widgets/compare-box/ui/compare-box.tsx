import CompareTitleSection from "./compare-title-section/compare-title-section";
import SelectRegionSection from "./select-region-section/select-region-section";

interface CompareBoxProps {
  onClose: () => void;
}

export default function CompareBox({ onClose }: CompareBoxProps) {
  return (
    <div className="flex w-[500px] flex-col space-y-[1px] bg-[#CFCFD1]">
      <CompareTitleSection onClose={onClose} />

      <SelectRegionSection />
    </div>
  );
}
