import RegionDateSection from "./region-date-section/region-date-section";
import RegionTitleSection from "./region-title-section/region-title-section";
import ChartSection from "./chart-section/chart-section";
import { useState } from "react";

export default function RegionData() {
    const [showData, setShowData] = useState(true);
  
    const handleClose = () => {
      setShowData(false);
    };
  
    return (
      <div className="flex flex-col w-[500px] bg-white-200 space-y-2">
        {showData && (
          <>
            <RegionTitleSection onClose={handleClose} />

            <RegionDateSection />
            
            <ChartSection />
          </>
        )}
      </div>
    );
  }