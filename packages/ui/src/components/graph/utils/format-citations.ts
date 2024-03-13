import {ViolationTypeCategories, violationTypeBarData, dayOfWeekBarData} from "../lib"


interface Citation {
  _id: string;
  agency: string;
  agency_desc: string;
  body_style: string;
  body_style_desc: string;
  color: string;
  color_desc: string;
  fine_amount: string;
  issue_date: string;
  issue_time: string;
  latitude: string;
  location: string;
  longitude: string;
  make: string;
  marked_time: string;
  plate_expiry_date: string;
  rp_state_plate: string;
  ticket_number: string;
  violation_code: string;
  violation_description: string;
  route: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
}

interface CitationBarDatum {
  [key: string]: string | number;
  index_key: string;
  count: number;
}

export function formatCitations(category: string, citations: Citation[]): CitationBarDatum[] {
  interface Recorder {
    [key: string]: CitationBarDatum;
  }

  const recorder: Recorder = {};

  if (category === "Violation Type") {
    for (let i = 0; i < violationTypeBarData.length; i++ ) {
      const violation = violationTypeBarData[i].index_key
      recorder[violation] = violationTypeBarData[i];
    }
    for (let i = 0; i < citations.length; i++) {
      const violation_description = citations[i].violation_description as keyof typeof ViolationTypeCategories;
      recorder[ViolationTypeCategories[violation_description]].count++;
    }
    return violationTypeBarData;
  } else if (category === "Day of the Week") {
    for (let i = 0; i < dayOfWeekBarData.length; i++) {
      const dayOfWeek = dayOfWeekBarData[i].index_key
      recorder[dayOfWeek] = dayOfWeekBarData[i]
    }
    for (let i = 0; i < citations.length; i++) {
      const day = new Date(citations[i].issue_date).toLocaleDateString('en-US', { weekday: 'long' });
      recorder[day].count++
    }
    return dayOfWeekBarData;
  }

  return [];
}
