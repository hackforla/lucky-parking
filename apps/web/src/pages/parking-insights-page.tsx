import { useSelector } from "react-redux";
import { MapDrawControl, useMapDraw } from "@/entities/map/lib/controls";
import Map, { MapDrawInstructions } from "@/features/map";
import Page from "@/pages/page";
import { selectors } from "@/shared/data/store/ui-slice";
import { CitationExplorer } from "@/widgets/citation";
import Header from "@/widgets/header";
import { RadiusTool } from "@/widgets/radius-tool";

const MAP_NAME = "parking-insights";

export default function ParkingInsightsPage() {
  const { drawRef } = useMapDraw();

  const ui = useSelector(selectors.selectUi);

  return (
    <Page>
      <Header />

      <div className="absolute top-20 z-40 w-full">
        <div className="bg-white-100 absolute left-4 w-[500px]">
          <CitationExplorer />
        </div>

        {ui.isMapInstructionsVisible && (
          <div className="absolute left-[540px] right-5 ">
            <MapDrawInstructions />
          </div>
        )}

        {/* TODO: Implement actual behavior */}
        {!ui.isMapInstructionsVisible && (
          <div className="absolute left-1/2">
            <RadiusTool isSubmitDisabled={false} onSubmit={(value) => console.log(value)} />
          </div>
        )}
      </div>

      <Map name={MAP_NAME}>
        <MapDrawControl ref={drawRef} mapId={MAP_NAME} />
      </Map>
    </Page>
  );
}
