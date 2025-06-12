import _ from "lodash";
import { Tag, TagColor } from "@lucky-parking/ui/tag";
import Geocoder from "@/features/geocoder";
import CitationExplorerSection from "../explorer/citation-explorer-section";
import CitationExplorerSectionTitle from "../explorer/citation-explorer-section-title";

const PLACEHOLDER = "Draw or search location to focus the map.";

export default function DrawSearch() {
  return (
    <>
      <CitationExplorerSection>
        <CitationExplorerSectionTitle>
          <div className="-mb-[8.75px] flex items-center space-x-3">
            <p>Region Type</p>
            <Tag color={TagColor.blue}>Custom Drawing</Tag>
          </div>
        </CitationExplorerSectionTitle>

        <Geocoder onSelect={_.noop} placeholder={PLACEHOLDER}></Geocoder>
      </CitationExplorerSection>
    </>
  );
}
