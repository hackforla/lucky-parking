import { useState } from "react";
import { MapDrawApplyButton, MapDrawClearButton } from "@/features/map";

const INSTRUCTIONS = "Draw a shape around the area you want data on.";

export default function MapDrawInstructions() {
  const [isDrawingExist, setDrawingExist] = useState(false);

  const onDrawApplyClick = () => {
    setDrawingExist(true);
  };

  const onDrawClearClick = () => {
    setDrawingExist(false);
  };

  return (
    <div className="bg-black-300 flex items-center justify-between px-5 py-3">
      <p className="heading-4 text-white-100">{INSTRUCTIONS}</p>

      <div className="space-x-4">
        <MapDrawApplyButton isDisabled={isDrawingExist} onClick={onDrawApplyClick} />
        <MapDrawClearButton isDisabled={!isDrawingExist} onClick={onDrawClearClick} />
      </div>
    </div>
  );
}
