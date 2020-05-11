import { ADD_ARTICLE, TEST_REDUX } from "../constants/action-types";

export function addArticle(payload) {
  return { type: ADD_ARTICLE, payload };
}

export function testRedux(payload) {
  return { type: TEST_REDUX, payload };
}
