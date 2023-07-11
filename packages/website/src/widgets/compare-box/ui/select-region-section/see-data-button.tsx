import { useState } from "react";
import RegionData from "@/widgets/region-data/ui/region-data";

export default function SeeDataButton() {
  const [showData, setShowData] = useState(false);
  const [key, setKey] = useState(0);

  const handleClick = () => {
    setShowData(true);
    setKey((prevKey) => prevKey + 1);
  };

  return (
    <div>
      <div
        className="absolute right-5 uppercase text-[#154782] heading-5 cursor-pointer"
        onClick={handleClick}
      >
        See Data 1
      </div>
      <div className="absolute right-0 top-0 z-20">
        {showData && <RegionData key={key} />}
      </div>
    </div>
  );
}
