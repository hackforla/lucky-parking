import AreaSearch from "@/features/area-search/area-search";
import DrawBoundaryButton from "@/widgets/action-box/ui/single-search-section/draw-boundary-button";
import ActionBoxSection from "src/widgets/action-box/ui/action-box-section";

export default function SingleSearchSection() {
  return (
    <ActionBoxSection>
      <p className="heading-5 text-black-500 uppercase">
        Get Citation Data for One Area
      </p>

      <AreaSearch />

      <div className="w-1/2">
        <DrawBoundaryButton />
      </div>
    </ActionBoxSection>
  );
}
