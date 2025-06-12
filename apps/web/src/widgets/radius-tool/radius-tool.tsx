import { useState } from "react";
import type { onEvent } from "@lucky-parking/types";
import { Button } from "@lucky-parking/ui/button";
import { Input } from "@lucky-parking/ui/input";
import { PickList } from "@lucky-parking/ui/pick-list";
import { formatDecimals } from "./utils/formatDecimals";
import { UnitConvertor, Units } from "./utils/unit-convertor";

interface RadiusToolProps {
  isSubmitDisabled?: boolean;
  onSubmit: onEvent;
}

const RadiusOptions = [
  { value: "miles", text: "Miles" },
  { value: "feet", text: "Feet" },
  { value: "kilometer", text: "KM" },
  { value: "meter", text: "M" },
];

export default function RadiusTool(props: RadiusToolProps) {
  const { isSubmitDisabled = true, onSubmit } = props;
  const [distance, setDistance] = useState<string>("1");
  const [unit, setUnit] = useState<Units>("miles");

  const handleInputChange = (val: string) => {
    const [whole, decimal = null] = val.split(".");
    const stringVal = !!decimal ? [whole, decimal[0]].join(".") : whole;
    const res = formatDecimals(Number(stringVal));

    setDistance(res.toString());
  };

  const handleInputOnBlur = () => {
    if (Number(distance) <= 0) setDistance("1");
  };

  const handlePickListChange = (target: string) => {
    if (target === unit) return;

    setDistance((prevUnits: string) => {
      if (target === unit) return prevUnits;

      const convertor = new UnitConvertor(unit);
      const newUnits = convertor.transformTo(target as Units, Number(prevUnits));
      const res = newUnits <= 0 ? 1 : newUnits;

      return res.toString();
    });
    setUnit(target as Units);
  };

  const handleOnSubmit = () => {
    onSubmit({ distance, unit });
  };

  return (
    <div className="bg-red flex space-x-2">
      <div className="flex">
        <PickList
          id="radius-unit"
          className="w-[120px] rounded-br-[0px] rounded-tr-[0px]"
          onChange={handlePickListChange}
          options={RadiusOptions}
          value={unit}
        />
        <Input
          id="distance"
          type="number"
          className="w-[160px] rounded-bl-[0px] rounded-tl-[0px] [&::-webkit-inner-spin-button]:appearance-none"
          onBlur={handleInputOnBlur}
          onChange={handleInputChange}
          value={distance}
        />
      </div>
      <Button isDisabled={isSubmitDisabled} onClick={handleOnSubmit}>
        <p>Apply</p>
      </Button>
    </div>
  );
}
