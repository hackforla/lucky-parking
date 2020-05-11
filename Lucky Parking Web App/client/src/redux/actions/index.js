import { CITATION_DATA } from "../constants/action-types";

export function getCitationData(payload) {
  return { type: CITATION_DATA, payload };
}
