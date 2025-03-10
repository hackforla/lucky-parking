import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import DatePickerCalendar from "./date-picker-calendar";
import { MONTH_NAMES } from "../calendar/option-data/months";
import userEvent from "@testing-library/user-event";

describe("Date Range 2 month Calendar", () => {
  const todayDate = new Date();

  beforeEach(async () => {
    render(
      <DatePickerCalendar
        key="date-range-calendar-test"
        initDate={todayDate}
        startDate={null}
        endDate={null}
        setStartDate={() => {}}
        setEndDate={() => {}}
        handleReset={() => {}}
      />,
    );
  });

  test("renders Back Arrow Icon", () => {
    expect(screen.getByTestId("ArrowBackIosNewIcon")).toBeInTheDocument();
  });

  test("renders Forward Arrow Icon", () => {
    expect(screen.getByTestId("ArrowForwardIosIcon")).toBeInTheDocument();
  });

  test("renders current month and next month", () => {
    const currMonthIdx = todayDate.getMonth();
    const nextMonthIdx = (currMonthIdx + 1) % 12;
		const month = MONTH_NAMES[currMonthIdx] ?? 'Unknown Month';

    expect(screen.getByText(month)).toBeInTheDocument();
    expect(screen.getByText(month)).toBeInTheDocument();
  });

  test("render current month's year and next month's year", () => {
    const currMonthIdx = todayDate.getMonth();
    const nextMonthIdx = (currMonthIdx + 1) % 12;
		const month = MONTH_NAMES[currMonthIdx] ?? 'Unknown Month';

    expect(screen.getByText(month)).toBeInTheDocument();
    expect(screen.getByText(month)).toBeInTheDocument();
  });
});

describe("Date Range Call to Action ", () => {
  const date = new Date("11-25-2024");
  const user = userEvent.setup();
  beforeEach(async () => {
    render(
      <DatePickerCalendar
        key="date-range-calendar-test"
        initDate={date}
        startDate={null}
        endDate={null}
        setStartDate={() => {}}
        setEndDate={() => {}}
        handleReset={() => {}}
      />,
    );
  });

  test("renders current month and next month", () => {
    expect(screen.getByText("November")).toBeInTheDocument();
    expect(screen.getByText("December")).toBeInTheDocument();
    expect(screen.getByText((_, ele) => ele?.textContent === "2024")).toBeInTheDocument();
  });

  test("render December 2024 and January 2025 when Forward Arrow is pressed", async () => {
    const nextMonthButton = screen.getByRole("button", { name: /next-months/i });
    await user.click(nextMonthButton);

    expect(screen.getByText("December")).toBeInTheDocument();
    expect(screen.getByText("2024")).toBeInTheDocument();

    expect(screen.getByText("January")).toBeInTheDocument();
    expect(screen.getByText("2025")).toBeInTheDocument();
  });

  test("render October 2024 and November 2024 when Forward Arrow is pressed", async () => {
    const nextMonthButton = screen.getByRole("button", { name: /prev-months/i });
    await user.click(nextMonthButton);

    expect(screen.getByText("October")).toBeInTheDocument();
    expect(screen.getByText("November")).toBeInTheDocument();
    expect(screen.getByText((_, ele) => ele?.textContent === "2024")).toBeInTheDocument();
  });
});
