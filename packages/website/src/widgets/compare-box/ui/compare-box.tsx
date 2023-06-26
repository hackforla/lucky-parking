import CompareTitleSection from "./compare-title-section/compare-title-section";
import SelectRegionSection from "./select-region-section/select-region-section";

interface CompareBoxProps {
  onClose: () => void;
}

export default function CompareBox({ onClose }: CompareBoxProps) {
  return (
    <div className="flex flex-col w-[500px] bg-[#CFCFD1] space-y-[1px]">
      <CompareTitleSection onClose={onClose} />

      <SelectRegionSection />
    </div>
  );
}