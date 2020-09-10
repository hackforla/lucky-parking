import { CITATION_DATA, MAP, HANDLE_SIDEBAR } from "../constants/action-types";

const INITIAL_STATE = {
  citation: null,
  mapRef: null,
  isSidebarOpen: false,
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
    default:
      return state;
  }
}

export default rootReducer;
