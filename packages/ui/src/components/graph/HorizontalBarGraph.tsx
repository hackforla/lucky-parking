import { ResponsiveBar } from "@nivo/bar";
import { formatCitations } from "./utils/format-citations";

interface Citation {
  _id: string;
  agency: string;
  agency_desc: string;
  body_style: string;
  body_style_desc: string;
  color: string;
  color_desc: string;
  fine_amount: string;
  issue_date: string;
  issue_time: string;
  latitude: string;
  location: string;
  longitude: string;
  make: string;
  marked_time: string;
  plate_expiry_date: string;
  rp_state_plate: string;
  ticket_number: string;
  violation_code: string;
  violation_description: string;
  route: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
}

interface HorizontalBarGraph {
  category: string;
  payload: { data: Citation[] };
}

const HorizontalBarGraph = ({ category, payload }: HorizontalBarGraph) => {
  const data = formatCitations(category, payload.data);
  return (
    <div className="bg-white-100 flex h-80 w-96 flex-col items-start justify-start">
      <ResponsiveBar
        data={data}
        keys={["count"]}
        indexBy="index_key"
        layout="horizontal"
        margin={{ top: 10, right: 40, bottom: 55, left: 150 }}
        padding={0.5}
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        valueFormat={">-x"}
        colors="#205CA2"
        axisRight={null}
        axisLeft={{
          tickSize: 0,
        }}
        axisBottom={{
          tickSize: 5,
          tickValues: 7,
          tickPadding: 5,
          tickRotation: 0,
          legend: `Total # Citations ${payload.data.length}`,
          legendOffset: 32,
          legendPosition: "start",
          truncateTickAt: 0,
        }}
        enableGridX={true}
        enableGridY={false}
        gridXValues={7}
        enableLabel={false}
        tooltip={(bar) => {
          return (
            <div className="bg-white-100 px-2 py-1 text-sm shadow-inner">
              <div className="flex flex-row">
                {bar.indexValue}:<p className="ml-2 font-semibold">{bar.formattedValue} </p>
              </div>
            </div>
          );
        }}
        isFocusable={true}
        role="list"
        ariaLabel="Horizontal bar chart"
        barAriaLabel={(e) => e.formattedValue + e.indexValue}
      />
    </div>
  );
};

export default HorizontalBarGraph;
