import { useState } from "react";
import ActionBox from "./action-box/ui/action-box";
import CompareBox from "./compare-box/ui/compare-box";
import RegionData from "./region-data/ui/region-data";

const WidgetContainer = () => {
  const [currentWidget, setCurrentWidget] = useState("ActionBox");

  const handleWidgetChange = (widgetName: string) => {
    setCurrentWidget(widgetName);
  };

  return (
    <div>
      {currentWidget === "ActionBox" && (
        <ActionBox onClose={() => handleWidgetChange("CompareBox")} />
      )}
      {currentWidget === "CompareBox" && (
        <CompareBox onClose={() => handleWidgetChange("ActionBox")} />
      )}
    </div>
  );
};

export default WidgetContainer;
