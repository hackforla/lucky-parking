import { ADD_ARTICLE, TEST_REDUX } from "../constants/action-types";

const INITIAL_STATE = {
  articles: [],
  testRedux: "Not changed yet!",
};

function rootReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case ADD_ARTICLE:
      return {
        ...state,
        articles: action.payload,
      };
    case TEST_REDUX:
      return {
        ...state,
        testRedux: action.payload,
      };
    default:
      return state;
  }
}

export default rootReducer;
