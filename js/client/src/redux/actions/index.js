import { CITATION_DATA, MAP, HANDLE_SIDEBAR, START_DATE, END_DATE, ACTIVE_RANGE } from "../constants/action-types";

export function getCitationData(payload) {
  return { type: CITATION_DATA, payload };
}

export function getMap(payload) {
  return { type: MAP, payload };
}

export function handleSidebar(payload) {
  return { type: HANDLE_SIDEBAR, payload };
}

export function getStartDate(payload) {
  return { type: START_DATE, payload };
}

export function getEndDate(payload) {
  return { type: END_DATE, payload };
}

export function getRangeActive(payload) {
  return { type: ACTIVE_RANGE, payload };
}