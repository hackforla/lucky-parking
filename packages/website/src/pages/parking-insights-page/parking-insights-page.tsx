import Header from "@/widgets/header";
import Page from "@/shared/ui/page";
import ParkingInsightsMap from "@/widgets/parking-insights-map";
import WidgetContainer from "@/widgets/widget-container";

import RegionData from "@/widgets/region-data/ui/region-data";

function ParkingInsightsPage() {
  return (
    <Page>
      <Header />

      <div className="absolute left-4 top-20 z-40">
        <WidgetContainer />
      </div>

      <ParkingInsightsMap />
    </Page>
  );
}

export default ParkingInsightsPage;
