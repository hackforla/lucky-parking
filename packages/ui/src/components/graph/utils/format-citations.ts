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
  violation_description: string;
  count: number;
}

export function formatCitations(payload: Citation[]): CitationBarDatum[] {
  interface Recorder {
    [key: string]: CitationBarDatum;
  }

  const recorder: Recorder = {};
  return payload.reduce((acc: CitationBarDatum[], payload) => {
    if (recorder[payload.violation_description]) {
      recorder[payload.violation_description]["count"]++;
    } else {
      const newRecord = { violation_description: payload.violation_description, count: 1 };
      recorder[payload.violation_description] = newRecord;
      acc.push(recorder[payload.violation_description]);
    }
    return acc;
  }, []);
}
