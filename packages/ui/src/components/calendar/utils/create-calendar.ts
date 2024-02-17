import { EmptyObject } from "@reduxjs/toolkit";
import { Month } from "../option-data/months";
import { Year } from "../option-data/years";
import { isThisAndNextMonth } from "./is-this-month-and-next";

type Day =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31;

export interface CalendarDate {
  day: Day;
  month: Month;
  year: Year;
}

export type T_Calendar = CalendarDate | EmptyObject;

export function createCalendar(year: Year, month: Month): T_Calendar[] {
  const startDay = 1; // Monday: 0 (Sunday) to 6 (Saturday)
  const currentDate = new Date(year, month, 1);

  // Set the day of the week for the start day
  currentDate.setDate(currentDate.getDate() - ((currentDate.getDay() - startDay + 7) % 7));

  // Initialize a two-dimensional array to hold the calendar
  const calendar: any = [];
  // Populate the calendar with dates
  for (let row = 0; row < 5; row++) {
    calendar[row] = [];
    for (let col = 0; col < 7; col++) {
      //append days for current month and next month
      calendar[row][col] = isThisAndNextMonth(currentDate, month)
        ? {
            day: currentDate.getDate(),
            month: currentDate.getMonth(),
            year: currentDate.getFullYear(),
          }
        : {};

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
  return calendar;
}
