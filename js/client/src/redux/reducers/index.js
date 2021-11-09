import {
  CITATION_DATA,
  MAP,
  HANDLE_SIDEBAR,
  START_DATE,
  END_DATE,
  ACTIVE_RANGE,
  DRAWING_PRESENT,
  POLYGON_DATA,
  ACTIVE_DARK,
  IS_SEARCH_DATE_CLICKED,
} from "../constants/action-types";

const INITIAL_STATE = {
  citation: null,
  mapRef: null,
  isSidebarOpen: false,
  startDate: null,
  // Ensure that the end date does not exceed the max date of the current citation data
  endDate: new Date("04/01/2021"),
  activateDateRange: false,
  drawingPresent: false,
  polygonData: null,
  darkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
  isSearchDateClicked: false,
};

function rootReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case CITATION_DATA:
      return {
        ...state,
        citation: action.payload,
      };
    case MAP:
      return {
        ...state,
        mapRef: action.payload,
      };
    case HANDLE_SIDEBAR:
      return {
        ...state,
        isSidebarOpen: action.payload,
      };
    case START_DATE:
      return {
        ...state,
        startDate: action.payload,
      };
    case END_DATE:
      return {
        ...state,
        endDate: action.payload,
      };
    case ACTIVE_RANGE:
      return {
        ...state,
        activateDateRange: action.payload,
      };
    case DRAWING_PRESENT:
      return {
        ...state,
        drawingPresent: action.payload,
      };
    case POLYGON_DATA:
      return {
        ...state,
        polygonData: action.payload,
      };
    case ACTIVE_DARK:
      return {
        ...state,
        darkMode: action.payload,
      };
    case IS_SEARCH_DATE_CLICKED:
        return {
          ...state,
          isSearchDateClicked: action.payload,
        }
    default:
      return state;
  }
}

export default rootReducer;
