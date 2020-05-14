import { CITATION_DATA, MAP } from "../constants/action-types";

const INITIAL_STATE = {
  citation: "",
  map: null,
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
        map: action.payload,
      };
    default:
      return state;
  }
}

export default rootReducer;
