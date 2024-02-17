import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { VisualizationStub } from "@/shared/ui/visualization";

interface CitationDataset {
  name?: string;
  data: object[];
}

interface CitationDataInsightsProps {
  category: string;
  datasets: CitationDataset[];
  dates?: string;
  onClick: () => void;
  stat?: string;
  title: string;
}

export default function CitationDataInsights(props: CitationDataInsightsProps) {
  const { category, datasets, dates, onClick, stat, title } = props;

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="paragraph-3 font-semibold uppercase">{title}</p>
          <p className="paragraph-2 font-medium">{category}</p>
        </div>

        <div className="cursor-pointer rounded-full border p-2">
          {/* TODO: What is the user behavior for this? */}
          <OpenInNewIcon onClick={onClick} />
        </div>
      </div>

      {datasets.map(({ name, data }, index) => (
        <div className="flex flex-col" key={name || `${title}-${index}`}>
          {name && <p className="paragraph-3 text-center font-semibold">{name}</p>}
          {/*// @ts-ignore*/}
          <VisualizationStub data={data} />
        </div>
      ))}

      <div className="paragraph-2 text-center">
        {stat && (
          <p>
            {category}: <span className="font-medium">{stat}</span>
          </p>
        )}

        {dates && <p>{dates}</p>}
      </div>
    </>
  );
}
