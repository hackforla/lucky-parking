import RegionDateSection from "./region-date-section/region-date-section";
import RegionTitleSection from "./region-title-section/region-title-section";
import ChartSection from "./chart-section/chart-section";
import { useState } from "react";

interface RegionDataProps {
  regionNumber: number;
}

export default function RegionData({ regionNumber }: RegionDataProps) {
  const [showData, setShowData] = useState(true);

  const handleClose = () => {
    setShowData(false);
  };

  return (
    <div className="bg-white-200 flex w-[500px] flex-col space-y-2">
      {showData && (
        <>
          <RegionTitleSection
            onClose={handleClose}
            regionNumber={regionNumber}
          />

          <RegionDateSection />

          <ChartSection />
        </>
      )}
    </div>
  );
}
