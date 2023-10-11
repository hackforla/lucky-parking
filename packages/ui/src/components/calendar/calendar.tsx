import { useState } from "react";
import clsx from "clsx";
import { clamp, isEmpty } from "lodash";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import Select from "./calendar-select";
import { YEAR_RANGE, Year } from "./option-data/years";
import { MONTHS_RANGE, Month } from "./option-data/months";
import { T_Calendar, CalendarDate, createCalendar } from "./utils/create-calendar";
import { isEqual } from "./utils/is-equal";
import { getMinMaxYear } from "./utils/get-minmax-year";

interface CalendarProps {
  addMultiRef: (args0: HTMLDivElement) => void;
  initDate?: Date;
  onSelectValueChange: (arg0: Date) => void;
}

const [minYear, maxYear] = getMinMaxYear(YEAR_RANGE);
const minDate = new Date(minYear, 0, 1);
const maxDate = new Date(maxYear, 11, 31);

export default function Calendar({ initDate = new Date(), onSelectValueChange, addMultiRef }: CalendarProps) {
  const [selected, setSelected] = useState<Date | null>(null);
  const [date, setDate] = useState(initDate);
  const [month, setMonth] = useState(initDate.getMonth() as Month);
  const [year, setYear] = useState(clamp(initDate.getFullYear(), minYear, maxYear));
  const calendar = createCalendar(year as Year, month);

  function handleUpdateMonth(type: "prev" | "next") {
    const modify = type === "prev" ? -1 : 1;
    const newDate = new Date(date);
    newDate.setMonth(date.getMonth() + modify);

    if (newDate <= minDate) {
      setMonth(0);
      setYear(minYear as Year);
      setDate(minDate);
    } else if (newDate >= maxDate) {
      setMonth(11);
      setYear(maxYear as Year);
      setDate(maxDate);
    } else {
      setMonth(newDate.getMonth() as Month);
      setYear(newDate.getFullYear() as Year);
      setDate(newDate);
    }
  }

  const handleSetYear = (value: string) => {
    const val = parseInt(value) as Year;
    setYear(val);

    setDate((prev) => {
      const newDate = new Date(prev);
      newDate.setFullYear(val);
      return newDate;
    });
  };

  const handleSetMonth = (value: string) => {
    const val = parseInt(value) as Month;
    setMonth(val);

    setDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(val);
      return newDate;
    });
  };

  const handleSelected = ({ day, month, year }: CalendarDate) => {
    const newDate = new Date(year, month, day);
    if (newDate > maxDate || newDate < minDate) return;

    setSelected(newDate);
    onSelectValueChange(newDate);
  };

  return (
    <div className="bg-white-100 w-64" ref={addMultiRef}>
      <div className="flex h-[52px] px-6">
        <div className="flex flex-1 items-center space-x-2">
          <Select
            id="Month"
            key="Month"
            addMultiRef={addMultiRef}
            value={month}
            options={MONTHS_RANGE}
            onChange={handleSetMonth}
            optionWidth={100}
          />
          <Select
            id="Year"
            addMultiRef={addMultiRef}
            key="Year"
            center={true}
            value={year}
            options={YEAR_RANGE}
            onChange={handleSetYear}
            optionWidth={58}
          />
        </div>
        <div className="flex justify-center space-x-7">
          <button className="px-2" onClick={() => handleUpdateMonth("prev")}>
            {" "}
            <ArrowBackIosNewIcon sx={{ fontSize: 8, color: "#7A7A7B" }} />
          </button>
          <button className="px-2" onClick={() => handleUpdateMonth("next")}>
            {" "}
            <ArrowForwardIosIcon sx={{ fontSize: 8, color: "#7A7A7B" }} />
          </button>
        </div>
      </div>
      <div className="flex justify-center px-4 pb-2">
        <table className="border-collaspse">
          <thead>
            <tr>
              {["M", "T", "W", "T", "F", "S", "S"].map((ele: string) => (
                <td className="text-black-400 h-8 w-8 p-px text-center text-xs font-normal leading-[16.8px]">{ele}</td>
              ))}
            </tr>
          </thead>
          <tbody>
            {calendar.map((week: any, weekIdx: number) => (
              <tr key={"month" + weekIdx}>
                {week.map((ele: T_Calendar, colIdx: any) => {
                  if (isEmpty(ele)) {
                    return <td key={"empty" + colIdx} className="h-8 w-8" />;
                  }
                  const { day, month, year } = ele as CalendarDate;
                  const key = `${month}/${day}/${year}`;
                  const isSelected = isEqual(ele as CalendarDate, selected);
                  const isCurrDate = isEqual(ele as CalendarDate, initDate);
                  const isCurrMonth = month === date.getMonth();

                  return (
                    <td
                      key={key}
                      onClick={() => handleSelected(ele as CalendarDate)}
                      className={clsx(
                        "h-8 w-8 text-center text-xs font-normal leading-[18.8px]",
                        isCurrDate && "inline-flex items-center justify-center rounded-full border-[1px]",
                        !isCurrMonth && "text-black-200",
                        !isSelected && "rounded-full hover:bg-blue-200",
                        isSelected && "text-white-100 rounded-full bg-blue-500",
                      )}>
                      {day}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
