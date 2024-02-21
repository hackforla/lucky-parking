import { ResponsiveBar } from "@nivo/bar";
import { formatCitations } from "./utils/format-citations";
import { payload } from "./data/citations";

interface HorizontalBarGraph {
  //category of organizing the citations
  //payload
}

const HorizontalBarGraph = () => {
  const data = formatCitations(payload.data);
  return (
    <div className="bg-white-100 flex h-80 w-96 flex-col items-start justify-start">
      <div className="flex w-full flex-row justify-between">
        <h2 className="font-semibold">Echo Park NC</h2>
        <div>INSERT IMAGE</div>
      </div>
      <h3>Citaitons per Sq. Mile</h3>
      <ResponsiveBar
        data={data}
        keys={["count"]}
        indexBy="violation_description"
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
        ariaLabel="Horrizontal bar chart"
        barAriaLabel={(e) => e.formattedValue + e.indexValue}
      />
      <div className="mx-auto">INSERT DATE</div>
    </div>
  );
};

export default HorizontalBarGraph;
