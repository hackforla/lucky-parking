import { useState } from "react";
import type { onEvent } from "@lucky-parking/types";
import RadioOption from "./radio-option";

interface RadioGroupProps {
  name: string;
  onChange: onEvent;
  options: string[];
  savedSelection?: string;
}

export const RadioGroup = (props: RadioGroupProps) => {
  const { name, onChange, options, savedSelection } = props;

  const [value, setValue] = useState(savedSelection);

  return (
    <fieldset onChange={(event) => onChange((event.target as HTMLInputElement).value)}>
      {options.map((option) => (
        <RadioOption name={name} onChange={setValue} isChecked={value === option} key={option}>
          {option}
        </RadioOption>
      ))}
    </fieldset>
  );
}
