import Map from "@/features/map";
import Page from "@/pages/page";
import Header from "@/widgets/header";
import { CitationExplorer } from "@/widgets/citation";

const MAP_NAME = "parking-insights";

export default function ParkingInsightsPage() {
  return (
    <Page>
      <Header />
      <div className="bg-white-100 absolute left-4 top-20 z-40 flex w-[500px] flex-col">
        <CitationExplorer />
      </div>
      <Map name={MAP_NAME} />;
    </Page>
  );
}
