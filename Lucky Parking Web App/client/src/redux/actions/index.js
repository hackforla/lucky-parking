import { CITATION_DATA, MAP, HANDLE_SIDEBAR } from "../constants/action-types";

export function getCitationData(payload) {
  return { type: CITATION_DATA, payload };
}

export function getMap(payload) {
  return { type: MAP, payload };
}

export function handleSidebar(payload) {
  return { type: HANDLE_SIDEBAR, payload };
}
