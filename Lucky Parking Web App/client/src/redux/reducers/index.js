import { CITATION_DATA } from "../constants/action-types";

const INITIAL_STATE = {
  citation: "",
};

function rootReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case CITATION_DATA:
      return {
        ...state,
        citation: action.payload,
      };
    default:
      return state;
  }
}

export default rootReducer;
