import CompareBoxSection from "src/widgets/compare-box/ui/compare-box-section";
import NextButton from "./next-button";
import RegionInput from "./region-input";
import RegionList from "./region-list";

export default function CompareSection() {
  return (
    <CompareBoxSection>
      <p className="heading-5 text-black-500 uppercase">
        Select One Region Type To Compare
      </p>
      
      <RegionList />

      <p className="heading-5 text-black-500 uppercase">
        First Region
      </p>

      <RegionInput />

      <p className="heading-5 text-black-500 uppercase pt-[6px]">
        Second Region
      </p>

      <RegionInput />

      <div className="flex flex-col w-full pt-2">
        <NextButton />
      </div>
    </CompareBoxSection>
  );
}
