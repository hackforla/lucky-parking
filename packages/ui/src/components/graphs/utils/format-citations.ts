import { ViolationTypeCategories, violationTypeBarData, dayOfWeekBarData } from "../lib";

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

export function formatBarGraphCitations(category: string, citations: Citation[]): CitationBarDatum[] {
  // Ensure categoryMap only contains CitationBarDatum
  const categoryMap: Record<string, CitationBarDatum> = {};

  if (category === "Violation Type") {
    // Initialize categoryMap with existing data
    for (const data of violationTypeBarData) {
      const violationKey = data.index_key; // Ensure this is always a string
      categoryMap[violationKey] = data;
    }

    // Process citations and update counts
    for (const citation of citations) {
      const violationDescription = citation.violation_description as keyof typeof ViolationTypeCategories;
      const key = ViolationTypeCategories[violationDescription];

      // Ensure categoryMap[key] is initialized
      if (!categoryMap[key]) {
        categoryMap[key] = { index_key: key, count: 0 };
      }

      categoryMap[key].count++;
    }

    return Object.values(categoryMap);
  }

  if (category === "Day of the Week") {
    // Initialize categoryMap with existing dayOfWeek data
    for (const data of dayOfWeekBarData) {
      const dayKey = data.index_key; // Ensure this is a string
      categoryMap[dayKey] = data;
    }

    // Process citations and update counts
    for (const citation of citations) {
      const day = new Date(citation.issue_date).toLocaleDateString("en-US", { weekday: "long" });

      // Ensure categoryMap[day] exists
      if (!categoryMap[day]) {
        categoryMap[day] = { index_key: day, count: 0 };
      }

      categoryMap[day].count++;
    }

    return Object.values(categoryMap);
  }

  return [];
}
