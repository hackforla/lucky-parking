import { ChangeEvent, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps {
  className?: string;
  id: string;
  type?: string;
  value?: string | null;
  onClick?: () => void;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

export default forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  const {
    id,
    className = "",
    onBlur = () => null,
    onClick = () => null,
    onChange = () => null,
    type = "text",
    value = "",
  } = props;

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    onChange && onChange(e.target.value);
  };

  const handleOnClick = () => {
    onClick && onClick();
  };

  const handleOnWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    //prevents input from scrolling
    e.currentTarget.blur();
  };

  return (
    <input
      id={id}
      ref={ref}
      className={twMerge(
        "bg-white-100 flex h-12 w-full items-center justify-center ",
        "px-4 text-base leading-[22.4px] text-blue-500",
        "rounded-sm outline outline-1",
        className,
      )}
      type={type}
      onBlur={onBlur}
      onClick={handleOnClick}
      onChange={handleOnChange}
      onWheel={handleOnWheel}
      value={value}
    />
  );
});
