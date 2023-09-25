import { PropsWithChildren, useState } from "react";
import Calendar from "@lucky-parking/ui/src/components/calendar";
import { formatToMiddleEndian } from "@/shared/lib/utilities/date";

export default function DateInput({ children }: PropsWithChildren) {
  const [value, setValue] = useState<string | null>();
  const [isCalendarVisible, setCalendarVisible] = useState(false);

  return (
    <div className="relative w-full">
      <div
        className="ring-black-200 flex h-[48px] w-full select-none flex-col rounded border-0 bg-white py-1.5 pl-3 pr-3 ring-1 ring-inset"
        onClick={() => setCalendarVisible((prevState) => !prevState)}>
        <p className="text-black-300 paragraph-1">{children}</p>
        <p className="text-black-300">{value || "mm/dd/yy"}</p>
      </div>
      {isCalendarVisible && (
        <div className="z-100 absolute drop-shadow">
          <Calendar onSelectValueChange={(newValue) => setValue(formatToMiddleEndian(newValue))} />
        </div>
      )}
    </div>
  );
}
