import { useState } from 'react';
import clsx from 'clsx';
import { clamp, isEmpty } from 'lodash';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import Select from './calendar-select';
import { YEAR_RANGE, Year } from './options_data/years';
import { MONTHS_RANGE, Month } from './options_data/months';
import { T_Calendar, CalendarDate, createCalendar } from './utils/createCalender';
import { isEqual } from './utils/isEqual';
import { getMinMaxYear } from './utils/getMinMaxYear';

interface CalendarProps { 
  initDate?: Date
}

const [minYear, maxYear] = getMinMaxYear(YEAR_RANGE)

export default function Calendar({ initDate = new Date() }: CalendarProps) {
  const [date, setDate] = useState(initDate)
  const [month, setMonth] = useState(initDate.getMonth() as Month)
  const [year, setYear]   = useState(clamp(initDate.getFullYear(), minYear, maxYear))
  const calendar = createCalendar(year as Year, month)

  function handleUpdateMonth(type: 'prev' | 'next') {
    const modify = type === 'prev' ? -1 : 1
    const min = new Date(minYear, 0, 1)
    const max = new Date(maxYear, 11, 31)
    const newDate = new Date(date)
    newDate.setMonth(date.getMonth() + modify)
  
    if (newDate <= min) {
      setMonth(0)
      setYear(minYear as Year)
      setDate(min)
    }
    else if (newDate >= max) {
      setMonth(11)
      setYear(maxYear as Year)
      setDate(max)
    }
    else {
      setMonth(newDate.getMonth() as Month)
      setYear(newDate.getFullYear() as Year)
      setDate(newDate)
    }  
   }

  const handleSetYear = (value: string) => { 
    const val = parseInt(value) as Year
    setYear(val)

    setDate(prev => {
      const newDate = new Date(prev)
      newDate.setFullYear(val)
      return newDate
    })
  }

  const handleSetMonth = (value: string) => { 
    const val = parseInt(value) as Month
    setMonth(val)
    setDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(val)
      return newDate
    })
  }

  const handleSelected = (value: string) => { }

  return (
    <div className="w-64">
      <div className="flex px-6 h-[52px]">
        <div className="flex flex-1 items-center space-x-2">
          <Select
            id='Year'
            value={month}
            options={MONTHS_RANGE}
            onChange={handleSetMonth}
            optionWidth={100}
          />
          <Select
            id='Year'
            center={true}
            value={year}
            options={YEAR_RANGE}
            onChange={handleSetYear}
            optionWidth={58}
          />
        </div>
        <div className="flex justify-center space-x-7">
          <button className="px-2" onClick={() => handleUpdateMonth('prev')}> <ArrowBackIosNewIcon sx={{ fontSize: 8, color: '#7A7A7B' }} /></button>
          <button className="px-2" onClick={() => handleUpdateMonth('next')}> <ArrowForwardIosIcon sx={{ fontSize: 8, color: '#7A7A7B' }} /></button>
        </div>
      </div>
      <div className="px-4 pb-2 flex justify-center">
        <table className="border-collaspse">
          <thead>
            <tr>
              {["M", "T", "W", "T", "F", "S", "S"].map((ele: string) => <td className='h-8 w-8 p-px font-normal leading-[16.8px] text-xs text-black-400 text-center'>{ele}</td>)}
            </tr>
          </thead>
          <tbody>
          {calendar.map((week: any, weekIdx: number) => (
              <tr key={'month' + weekIdx}>
                {week.map((ele: T_Calendar, colIdx: any) => {
                  if (isEmpty(ele)) {
                    return <td key={'empty' + colIdx} className='h-8 w-8'/>
                  }
                  const { day, month, year } = ele as CalendarDate
                  const key = `${month}/${day}/${year}`
                  const isCurrDate = isEqual(ele as CalendarDate, initDate)
                  const isCurrMonth = month === date.getMonth()
                  return (
                    <td
                      key={key}
                      onClick={() => handleSelected(key)}
                      className={clsx(
                        "h-8 w-8 font-normal leading-[18.8px] text-xs text-center",
                        isCurrMonth ? 'text-black-500' : 'text-black-200',
                        isCurrDate && 'inline-flex justify-center items-center rounded-full border-[1px]'
                      )}
                    >
                      {day}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
