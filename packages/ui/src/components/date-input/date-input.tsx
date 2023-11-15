import clsx from "clsx";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import Calendar from "../calendar";
import { formatToMiddleEndian } from "./utils/date";

export default function DateInput({ children }: PropsWithChildren) {
  const calendarRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState<string | null>();
  const [isCalendarVisible, setCalendarVisible] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!calendarRef || calendarRef.current === null) return;
      if (calendarRef && calendarRef.current.contains(event.target as Node)) return;
      setCalendarVisible(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [calendarRef, setValue]);

  return (
    <div className="relative flex-auto">
      <div
        data-testid="date-input-trigger"
        className={clsx(
          "flex h-[48px] flex-auto flex-col items-start justify-center ",
          "px-4 text-base leading-[22.4px]",
          "bg-white-100 select-none  rounded-sm outline outline-1",
          isCalendarVisible ? "text-blue-500" : "text-black-500",
        )}
        onClick={() => setCalendarVisible((prevState) => !prevState)}>
        <div className={clsx("paragraph-1", isCalendarVisible ? "text-blue-500" : "text-black-300")}> {children}</div>
        <div
          className={clsx(
            "text-[15.88px] font-medium leading-[18.63px]",
            isCalendarVisible ? "text-blue-500" : "text-black-300",
          )}>
          {value || "mm/dd/yy"}
        </div>
      </div>
      {isCalendarVisible && (
        <div className="absolute z-50 mt-2 drop-shadow" ref={calendarRef}>
          <Calendar onSelectValueChange={(newValue: Date) => setValue(formatToMiddleEndian(newValue))} />
        </div>
      )}
    </div>
  );
}
