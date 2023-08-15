import { useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import {
  Content,
  Group,
  Icon,
  Item,
  ItemText,
  Portal,
  Root,
  Trigger,
  Value,
  Viewport,
} from "@radix-ui/react-select";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

interface PickListProps<T> {
  id: string;
  className?: string;
  options: T[];
  onChange: (args0: string) => void; //radix's select onValueChange only returns a string
  placeholder?: string;
  value?: number | "string";
}

export default function PickList<T>({
  id,
  className,
  options,
  onChange,
  placeholder,
  value,
}: PickListProps<T>) {
  const eleRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Root
      name={id}
      value={value as string}
      onOpenChange={setIsOpen}
      onValueChange={onChange}>
      <Trigger aria-label={id} asChild>
        <button
          ref={eleRef}
          className={twMerge(
            "flex items-center justify-between py-[13px] pl-4 pr-2",
            "bg-white-100 h-12 w-full items-center rounded-sm outline outline-1",
            "text-base font-normal text-blue-500",
            className,
          )}>
          <Value placeholder={placeholder} />
          <Icon>
            {isOpen ? (
              <ArrowDropUpIcon sx={{ fontSize: 24, color: "#205CA2" }} />
            ) : (
              <ArrowDropDownIcon sx={{ fontSize: 24, color: "#205CA2" }} />
            )}
          </Icon>
        </button>
      </Trigger>
      <Portal>
        <Content
          position="popper"
          sideOffset={4}
          className="bg-white-100 drop-shadow-md"
          style={{
            //tailwind does not allow dynamic styling :(
            width: eleRef.current?.offsetWidth,
          }}>
          <Viewport>
            <Group>
              {options.map(({ text, value }: any) => (
                <Item
                  key={text}
                  value={value}
                  className={twMerge(
                    "flex h-8 w-full select-none items-center space-y-1.5 px-3 drop-shadow-md",
                    "text-black-500 text-sm leading-[19.6px]",
                    "data-[highlighted]:text-white-100 data-[highlighted]:bg-blue-500 data-[highlighted]:outline-none",
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
