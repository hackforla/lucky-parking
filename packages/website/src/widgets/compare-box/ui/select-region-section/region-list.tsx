import { useState } from "react";

export default function RegionList() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value);
  };

  const optionData = [
    { id: "neighborhoodCouncil", label: "Neighborhood Council" },
    { id: "zipCode", label: "Zip Code" },
    { id: "place", label: "Place (Radius)" },
    { id: "customDrawing", label: "Custom Drawing" },
  ];

  return (
    <div>
      {optionData.map((option) => (
        <div className="flex items-center" key={option.id}>
          <label className="relative mr-[8px] flex cursor-pointer items-center rounded-full py-[8px]">
            <input
              type="radio"
              id={option.id}
              name="regionType"
              value={option.id}
              className="peer h-[20px] w-[20px] cursor-pointer appearance-none rounded-full border"
              onChange={handleRadioChange}
              checked={selectedOption === option.id}
            />
            <div className="pointer-events-none absolute left-2/4 top-2/4 -translate-x-2/4 -translate-y-2/4 opacity-0 peer-checked:opacity-100">
              <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="8" r="8"></circle>
              </svg>
            </div>
          </label>
          <label className="cursor-pointer" htmlFor={option.id}>
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );
}
