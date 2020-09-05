import circle from "../../../assets/images/icons/circle-15.svg";

export const places = {
  id: "places",
  type: "circle",
  source: "places",
  paint: {
    "circle-radius": 4,
    "circle-color": "#fddb3a",
    'circle-stroke-width': 1,
    "circle-opacity": 0.5,
  },
};
export const meters = {
  id: "meters",
  source: "meters",
  type: "line",
  "source-layer": "meter_lines-1l60am",
  paint: {
    "line-color": "#e50cff",
    "line-width": 2,
  },
};
