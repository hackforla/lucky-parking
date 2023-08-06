import { useState } from "react";
import RegionData from "@/widgets/region-data/ui/region-data";

interface SeeDataButtonProps {
  buttonText: string;
  regionNumber: number;
}

export default function SeeDataButton({
  buttonText,
  regionNumber,
}: SeeDataButtonProps) {
  const [showData, setShowData] = useState(false);
  const [key, setKey] = useState(0);

  const handleClick = () => {
    setShowData(true);
    setKey((prevKey) => prevKey + 1);
  };

  return (
    <div>
      <div
        className="heading-5 absolute right-5 cursor-pointer uppercase text-[#154782]"
        onClick={handleClick}>
        {buttonText}
      </div>
      <div className="absolute right-0 top-0 z-20">
        {showData && <RegionData key={key} regionNumber={regionNumber} />}
      </div>
    </div>
  );
}
