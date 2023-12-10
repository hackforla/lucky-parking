import type { onEvent } from "@lucky-parking/typings";

interface RadioOptionProp {
  children: string;
  isChecked?: boolean;
  name: string;
  onChange: onEvent;
}

export default function RadioOption({ children, ...props }: RadioOptionProp) {
  const { isChecked = false, name, onChange } = props;

  return (
    <div className="flex items-center">
      <label className="relative mr-[8px] flex cursor-pointer items-center rounded-full py-[8px]">
        <input
          type="radio"
          id={children}
          name={name}
          value={children}
          className="peer h-[20px] w-[20px] cursor-pointer appearance-none rounded-full border"
          onChange={(event) => onChange(event.target.value)}
          checked={isChecked}
        />
        <span className="pointer-events-none absolute left-2/4 top-2/4 -translate-x-2/4 -translate-y-2/4 opacity-0 peer-checked:opacity-100">
          <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="8" r="8"></circle>
          </svg>
        </span>
      </label>
      <label className="cursor-pointer" htmlFor={children}>
        {children}
      </label>
    </div>
  );
}
