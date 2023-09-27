import Map from "@/features/map";
import Page from "@/pages/page";
import Header from "@/widgets/header";
import { CitationExplorer } from "@/widgets/citation";
import { RadiusTool } from "@/widgets/radius-tool";

const MAP_NAME = "parking-insights";

export default function ParkingInsightsPage() {
  return (
    <Page>
      <Header />
      <div className="bg-white-100 absolute left-4 top-20 z-40 flex w-[500px] flex-col">
        <CitationExplorer />
      </div>
      <div className="absolute left-1/2 top-20 z-40">
        <RadiusTool isSubmitDisabled={false} onSubmit={(value) => console.log(value)} />
      </div>
      <Map name={MAP_NAME} />;
    </Page>
  );
}
