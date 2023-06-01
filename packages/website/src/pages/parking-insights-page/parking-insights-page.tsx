import Header from "@/widgets/header";
import Page from "@/shared/ui/page";
import ActionBox from "@/widgets/action-box";
import ParkingInsightsMap from "@/widgets/parking-insights-map";

function ParkingInsightsPage() {
  return (
    <Page>
      <Header />

      <div className="absolute z-40 top-20 left-4">
        <ActionBox />
      </div>

      <ParkingInsightsMap />
    </Page>
  );
}

export default ParkingInsightsPage;
