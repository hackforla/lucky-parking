import { CITATION_DATA, MAP } from "../constants/action-types";

const INITIAL_STATE = {
  citation: "",
  mapRef: null,
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
    default:
      return state;
  }
}

export default rootReducer;
