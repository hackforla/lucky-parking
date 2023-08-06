import CompareBoxSection from "src/widgets/compare-box/ui/compare-box-section";
import CloseIcon from "@mui/icons-material/Close";

interface CompareTitleSectionProps {
  onClose: () => void;
}

export default function CompareTitleSection({
  onClose,
}: CompareTitleSectionProps) {
  return (
    <CompareBoxSection>
      <div className="flex justify-center">
        <p className="heading-4 text-black-500">Compare Mode</p>
        <p className="absolute right-5 hover:cursor-pointer" onClick={onClose}>
          <CloseIcon />
        </p>
      </div>
    </CompareBoxSection>
  );
}
