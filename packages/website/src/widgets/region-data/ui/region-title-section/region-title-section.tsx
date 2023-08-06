import RegionSection from "../region-section/region-section";
import CloseIcon from "@mui/icons-material/Close";

interface RegionTitleSectionProps {
  onClose: () => void;
  regionNumber: number;
}

export default function RegionTitleSection({
  onClose,
  regionNumber,
}: RegionTitleSectionProps) {
  const handleClick = () => {
    onClose();
  };

  return (
    <RegionSection>
      <div className="flex justify-center">
        <p className="heading-4 uppercase text-[#505050]">
          Region {regionNumber} Data
        </p>
        <p
          className="absolute left-5 hover:cursor-pointer"
          onClick={handleClick}>
          <CloseIcon />
        </p>
      </div>
    </RegionSection>
  );
}
