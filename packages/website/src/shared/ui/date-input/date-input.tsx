import clsx from "clsx";
import { PropsWithChildren, useEffect, useState } from "react";
import Calendar from "@lucky-parking/ui/src/components/calendar";
import { formatToMiddleEndian } from "@/shared/lib/utilities/date";
import { useMultiRefs } from "@/shared/lib/utilities/use-multi-refs";

export default function DateInput({ children }: PropsWithChildren) {
  const [multiRefs, addMultiRef] = useMultiRefs();
  const [value, setValue] = useState<string | null>();
  const [isCalendarVisible, setCalendarVisible] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const arr = multiRefs() as HTMLElement[];
      if (!arr.length) return;

      //check if click event is within any of our refs
      const isInsideClick = arr.some((element: HTMLElement) => element.contains(event.target as Node));
      if (!isInsideClick) setCalendarVisible(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [multiRefs, value]);

  return (
    <div className="relative flex-auto">
      <div
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
        <div className="z-100 absolute mt-2 drop-shadow">
          <Calendar
            addMultiRef={addMultiRef}
            onSelectValueChange={(newValue: Date) => setValue(formatToMiddleEndian(newValue))}
          />
        </div>
      )}
    </div>
  );
}
