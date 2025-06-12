import { useState } from "react";
import { Modal, ModalContent, ModalTrigger } from "../modal";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DateRangeIcon from "@mui/icons-material/DateRange";
import { addMonths, addYears, startOfYear } from "date-fns";
import { twMerge } from "tailwind-merge";

import { Button, ButtonVariant } from "../button";
import DatePickerSuggestions, { RelativeDatePresets } from "./date-picker-suggestions";
import DatePickerCalendar from "./date-picker-calendar";
import { Input } from "../input";
import { formatToMiddleEndian } from "@lucky-parking/utilities/date";

interface DatePickerProps {
  onDateRangeValueChange?: (arg0: { [key: string]: Date }) => void | null;
}

type selectedCalendar = "exact" | "suggestions";

export const DatePicker = (props: DatePickerProps) => {
  const { onDateRangeValueChange = null } = props;

  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [selected, setSelected] = useState<selectedCalendar>("exact");
  const [selectedDates, setSelectedDates] = useState<{ [key: string]: Date | null }>({
    start: null,
    end: null,
  });
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleApply = () => {
    if (startDate && endDate) {
      const payload = {
        start: startDate,
        end: endDate,
      };
      setSelectedDates(payload);
      onDateRangeValueChange && onDateRangeValueChange(payload);
    }

    setCalendarVisible(false);
  };

  const handleSuggestionChange = (value: string) => {
    const today = new Date();

    switch (value) {
      case RelativeDatePresets.YEARS_1: {
        const oneYearAgo = addYears(today, -1);
        setStartDate(oneYearAgo);
        setEndDate(today);
        break;
      }

      case RelativeDatePresets.MONTHS_3: {
        const threeMonthAgo = addMonths(today, -3);
        setStartDate(threeMonthAgo);
        setEndDate(today);
        break;
      }

      case RelativeDatePresets.MONTHS_1: {
        const oneMonthAgo = addMonths(today, -1);
        setStartDate(oneMonthAgo);
        setEndDate(today);
        break;
      }

      case RelativeDatePresets.YTD: {
        const firstDateOfTheYear = startOfYear(today);
        setStartDate(firstDateOfTheYear);
        setEndDate(today);
        break;
      }

      default:
        console.log("oopies mom's spaghetti o something went wrong!");
    }
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <div className="flex space-x-1">
      <Modal open={isCalendarVisible}>
        <ModalTrigger asChild aria-label="open-date-range-modal">
          <div
            className={twMerge(
              "flex h-[48px] w-[420px] flex-auto flex-row items-center justify-start space-x-2 px-2",
              "bg-white-100 select-none rounded-sm outline outline-1",
              isCalendarVisible ? "text-blue-500" : "text-black-500",
            )}
            onClick={() => setCalendarVisible((prevState) => !prevState)}>
            <div className="flex flex-1 items-center justify-start space-x-1">
              <DateRangeIcon sx={{ width: 24, height: 24 }} />
              <div
                className={twMerge(
                  "text-[15.88px] font-medium leading-[18.63px]",
                  isCalendarVisible ? "text-blue-500" : "text-black-300",
                )}>
                {(selectedDates.start && formatToMiddleEndian(selectedDates.start)) || "start date"}
              </div>
            </div>

            <div className="flex flex-1 items-center justify-start space-x-1">
              <ChevronRightIcon sx={{ width: 24, height: 24 }} />
              <div
                className={twMerge(
                  "text-[15.88px] font-medium leading-[18.63px]",
                  isCalendarVisible ? "text-blue-500" : "text-black-300",
                )}>
                {(selectedDates.end && formatToMiddleEndian(selectedDates.end)) || "end date"}
              </div>
            </div>
          </div>
        </ModalTrigger>
        <ModalContent>
          <div className="flex justify-start space-x-3">
            <Button
              className={selected !== "exact" ? "text-white-500" : ""}
              variant={ButtonVariant.text}
              onClick={() => setSelected("exact")}>
              {" "}
              Exact{" "}
            </Button>
            <Button
              className={selected !== "suggestions" ? "text-white-500" : ""}
              variant={ButtonVariant.text}
              onClick={() => setSelected("suggestions")}>
              {" "}
              Suggestions{" "}
            </Button>
          </div>

          <div id="border" className="border-white-400 mt-6 rounded-md border-b-2" />

          <div className="h-[256px] w-[512px]">
            {selected === "exact" ? (
              <DatePickerCalendar
                key="date-picker-calendar"
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                handleReset={handleReset}
              />
            ) : (
              <DatePickerSuggestions onSuggestionChange={handleSuggestionChange} />
            )}
          </div>

          <div className="flex space-x-6">
            <div>
              <span>Start Date</span>
              <Input
                id="start date"
                className="h-8"
                value={startDate ? formatToMiddleEndian(startDate) : "mm/dd/yyyy"}
              />
            </div>

            <div>
              <span>End Date</span>
              <Input id="end date" className="h-8" value={endDate ? formatToMiddleEndian(endDate) : "mm/dd/yyyy"} />
            </div>
          </div>

          <div id="border" className="border-white-400 mt-6 rounded-md border-b-2" />

          {/** Call to Action */}
          <div className="mt-6 flex justify-between">
            <Button variant={ButtonVariant.text} onClick={handleReset}>
              <p>reset</p>
            </Button>

            <div className="space-between flex space-x-3">
              <Button variant={ButtonVariant.outline} onClick={() => setCalendarVisible(false)}>
                <p>cancel</p>
              </Button>
              <Button variant={ButtonVariant.primary} onClick={handleApply}>
                <p>apply</p>
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
