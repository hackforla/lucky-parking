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
} from "../constants/action-types";

const INITIAL_STATE = {
  citation: null,
  mapRef: null,
  isSidebarOpen: false,
  startDate: null,
  endDate: null,
  activateDateRange: false,
  drawingPresent: false,
  polygonData: null,
  darkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
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
    default:
      return state;
  }
}

export default rootReducer;
