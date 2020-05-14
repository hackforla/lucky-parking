import { CITATION_DATA, MAP } from "../constants/action-types";

export function getCitationData(payload) {
  return { type: CITATION_DATA, payload };
}

export function getMap(payload) {
  return { type: MAP, payload };
}
