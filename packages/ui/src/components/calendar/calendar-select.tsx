import { useState } from "react";
import clsx from "clsx";
import { Select as RadixSelect } from "radix-ui";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
interface SelectProps<T> {
  id: string;
  center?: boolean;
  options: T[];
  onChange: (args0: string) => void; //radix's select onValueChange only returns a string
  parentContainer: HTMLDivElement | null;
  placeholder?: string;
  value: number | "string";
  optionWidth?: number;
}

export default function Select<T>({
  id,
  center,
  options = [],
  onChange,
  parentContainer,
  placeholder,
  value,
  optionWidth,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const renderIcon = isOpen ? (
    <ArrowDropUpIcon sx={{ fontSize: 16, color: "#7A7A7B" }} />
  ) : (
    <ArrowDropDownIcon sx={{ fontSize: 16, color: "#7A7A7B" }} />
  );

  return (
    <RadixSelect.Root name={id} value={value as string} onOpenChange={setIsOpen} onValueChange={onChange}>
      <RadixSelect.Trigger
        aria-label={id}
        className={clsx("flex h-[17px] items-center", "text-black-300 z-50 text-xs font-normal outline-none")}>
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>{renderIcon}</RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal container={parentContainer}>
        <RadixSelect.Content
          position="popper"
          className={clsx("bg-white-100 z-40 z-40 py-1 drop-shadow-md", optionWidth && `w-[${optionWidth}px]`)}>
          <RadixSelect.Viewport>
            <RadixSelect.Group>
              {options.map(({ text, value }: any) => (
                <RadixSelect.Item
                  key={text}
                  value={value}
                  className={clsx(
                    "flex select-none items-center px-3 py-1.5 drop-shadow-md",
                    "text-black-500 text-sm leading-[19.6px]",
                    "data-[highlighted]:text-white-100 data-[highlighted]:bg-blue-500 data-[highlighted]:outline-none",
                    center && "justify-center px-1",
                  )}>
                  <RadixSelect.ItemText>{text}</RadixSelect.ItemText>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Group>
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
