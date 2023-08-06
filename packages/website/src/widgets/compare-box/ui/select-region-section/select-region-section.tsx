import CompareBoxSection from "src/widgets/compare-box/ui/compare-box-section";
import NextButton from "./next-button";
import RegionList from "./region-list";
import Geocoder from "@/shared/ui/geocoder/geocoder";
import SeeDataButton from "./see-data-button";
import { useState } from "react";

export default function CompareSection() {
  const [firstRegion, setFirstRegion] = useState("");
  const [showFirstSeeDataButton, setShowFirstSeeDataButton] = useState(false);

  const [secondRegion, setSecondRegion] = useState("");
  const [showSecondSeeDataButton, setShowSecondSeeDataButton] = useState(false);

  const handleFirstGeocoderSelect = (result: string) => {
    setFirstRegion(result);
    setShowFirstSeeDataButton(true);
  };

  const handleSecondGeocoderSelect = (result: string) => {
    setSecondRegion(result);
    setShowSecondSeeDataButton(true);
  };

  return (
    <CompareBoxSection>
      <p className="heading-5 text-black-500 uppercase">
        Select One Region Type To Compare
      </p>

      <RegionList />

      <div className="flex">
        <p className="heading-5 text-black-500 uppercase">First Region</p>
        <div>
          {showFirstSeeDataButton && (
            <SeeDataButton buttonText="See Data 1" regionNumber={1} />
          )}
        </div>
      </div>

      <div className="z-10">
        <Geocoder onSelect={handleFirstGeocoderSelect} />
      </div>

      <div className="flex pt-[6px]">
        <p className="heading-5 text-black-500 uppercase">Second Region</p>
        <div>
          {showSecondSeeDataButton && (
            <SeeDataButton buttonText="See Data 2" regionNumber={2} />
          )}
        </div>
      </div>

      <div className="z-5">
        <Geocoder onSelect={handleSecondGeocoderSelect} />
      </div>

      <div className="flex w-full flex-col pt-2">
        <NextButton />
      </div>
    </CompareBoxSection>
  );
}
