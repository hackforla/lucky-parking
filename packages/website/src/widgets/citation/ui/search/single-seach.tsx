import Geocoder, { SearchModeToggleButton } from "@/features/geocoder";
import { DrawButton } from "@/features/map";
import type { onEvent } from "@/shared/lib/types";
import CitationExplorerDivider from "../explorer/citation-explorer-divider";
import CitationExplorerSection from "../explorer/citation-explorer-section";
import CitationExplorerSectionTitle from "../explorer/citation-explorer-section-title";

interface SingleSearchProps {
  onSelect: onEvent;
  onToggle: onEvent;
}

export default function SingleSearch(props: SingleSearchProps) {
  const { onSelect, onToggle } = props;

  return (
    <>
      <CitationExplorerSection>
        <CitationExplorerSectionTitle>Get Citation Data for One Area</CitationExplorerSectionTitle>

        <Geocoder onSelect={onSelect} />

        <div className="w-1/2">
          <DrawButton />
        </div>
      </CitationExplorerSection>

      <CitationExplorerDivider />

      <CitationExplorerSection>
        <CitationExplorerSectionTitle>Compare Data for Two Areas</CitationExplorerSectionTitle>

        <SearchModeToggleButton onClick={onToggle} />
      </CitationExplorerSection>
    </>
  );
}
