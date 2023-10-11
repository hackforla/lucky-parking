import { useState } from "react";
import clsx from "clsx";
import { Content, Group, Icon, Item, ItemText, Portal, Root, Trigger, Value, Viewport } from "@radix-ui/react-select";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
interface SelectProps<T> {
  id: string;
  addMultiRef?: (arg0: any) => void;
  center?: boolean;
  options: T[];
  onChange: (args0: string) => void; //radix's select onValueChange only returns a string
  placeholder?: string;
  value: number | "string";
  optionWidth?: number;
}

export default function Select<T>({
  id,
  addMultiRef = () => null,
  center,
  options = [],
  onChange,
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
    <Root name={id} value={value as string} onOpenChange={setIsOpen} onValueChange={onChange}>
      <Trigger
        ref={addMultiRef}
        aria-label={id}
        className={clsx("flex h-[17px] items-center", "text-black-300 text-xs font-normal outline-none")}>
        <Value placeholder={placeholder} />
        <Icon>{renderIcon}</Icon>
      </Trigger>
      <Portal>
        <Content
          ref={addMultiRef}
          position="popper"
          className={clsx("bg-white-100 z-40 py-1 drop-shadow-md", optionWidth && `w-[${optionWidth}px]`)}>
          <Viewport>
            <Group>
              {options.map(({ text, value }: any) => (
                <Item
                  key={text}
                  value={value}
                  className={clsx(
                    "flex select-none items-center px-3 py-1.5 drop-shadow-md",
                    "text-black-500 text-sm leading-[19.6px]",
                    "data-[highlighted]:text-white-100 data-[highlighted]:bg-blue-500 data-[highlighted]:outline-none",
                    center && "justify-center px-1",
                  )}>
                  <ItemText>{text}</ItemText>
                </Item>
              ))}
            </Group>
          </Viewport>
        </Content>
      </Portal>
    </Root>
  );
}
