import { useState } from "react";
import clsx from "clsx";
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
} from '@radix-ui/react-select';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
interface SelectProps<T> {
  id: string;
  center?: boolean;
  options: T[];
  onChange: (args0: string) => void, //radix's select onValueChange only returns a string
  placeholder?: string,
  value: number | 'string',
  optionWidth?: number
}

export default function Select<T>({
  id,
  center,
  options = [],
  onChange,
  placeholder,
  value,
  optionWidth,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const renderIcon = isOpen
    ? <ArrowDropUpIcon sx={{ fontSize: 16, color: '#7A7A7B' }} />
    : <ArrowDropDownIcon sx={{ fontSize: 16, color: '#7A7A7B' }} />

  return (
    <Root
      name={id}
      value={value as string}
      onOpenChange={setIsOpen}
      onValueChange={onChange}
    >
      <Trigger
        aria-label={id}
        className={clsx(
          "flex h-[17px] items-center",
          "font-normal text-xs text-black-300 outline-none",
        )}
      >
        <Value placeholder={placeholder} />
        <Icon>{renderIcon}</Icon>
      </Trigger>
      <Portal>
        <Content
          position="popper"
          className={clsx(
            "py-1 bg-white-100 drop-shadow-md",
            optionWidth && `w-[${optionWidth}px]`
          )}
        >
          <Viewport>
            <Group>
              {options.map(({ text, value }: any) => (
                <Item
                  value={value}
                  className={clsx(
                    'flex items-center py-1.5 px-3 select-none drop-shadow-md',
                    'leading-[19.6px] text-sm text-black-500',
                    'data-[highlighted]:outline-none data-[highlighted]:bg-blue-500 data-[highlighted]:text-white-100',
                    center && 'px-1 justify-center'
                  )}
                >
                  <ItemText>{text}</ItemText>
                </Item>
              ))}
            </Group>
          </Viewport>
        </Content>
      </Portal>
    </Root>
  )
}
