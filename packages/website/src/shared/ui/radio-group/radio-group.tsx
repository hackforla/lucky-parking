import { useState } from "react";
import type { onEvent } from "@/shared/lib/types";
import RadioOption from "./radio-option";

interface RadioGroupProps {
  name: string;
  onChange: onEvent;
  options: string[];
}

export default function RadioGroup(props: RadioGroupProps) {
  const { name, onChange, options } = props;

  const [value, setValue] = useState(null);

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
