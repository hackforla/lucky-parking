import CompareBoxSection from "src/widgets/compare-box/ui/compare-box-section";
import NextButton from "./next-button";
import RegionInput from "./region-input";
import RegionList from "./region-list";
import Geocoder from "@/shared/ui/geocoder/geocoder";
import SeeDataButton from "./see-data-button";
import { useState } from "react";

export default function CompareSection() {
  const [regionNumber, setRegionNumber] = useState('');

  return (
    <CompareBoxSection>
      <p className="heading-5 text-black-500 uppercase">
        Select One Region Type To Compare
      </p>
      
      <RegionList />

      <div className="flex">
        <p className="heading-5 text-black-500 uppercase">First Region</p> 
        <SeeDataButton />
      </div>

      <Geocoder />

      <div className="flex">
        <p className="heading-5 text-black-500 uppercase pt-[6px]">Second Region</p>
        <SeeDataButton />
      </div>

      <Geocoder />

      <div className="flex flex-col w-full pt-2">
        <NextButton />
      </div>
    </CompareBoxSection>
  );
}
