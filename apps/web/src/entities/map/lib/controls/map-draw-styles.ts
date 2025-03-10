import colors from "@lucky-parking/ui/tokens/colors";

const activeStyles = [
  // Line stroke
  {
    id: "gl-draw-line",
    type: "line",
    filter: ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": colors.blue["500"],
      "line-width": 3,
    },
  },

  // Polygon fill
  {
    id: "gl-draw-polygon-fill",
    type: "fill",
    filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
    paint: {
      "fill-color": colors.blue["300"],
      "fill-opacity": 0.5,
    },
  },

  // Polygon midpoints
  {
    id: "gl-draw-polygon-midpoint",
    type: "circle",
    filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
    paint: {
      "circle-radius": 3,
      "circle-color": "#fbb03b",
    },
  },

  // Polygon outline
  // The first edge of the polygon does not use this style and instead uses the line stroke styling
  {
    id: "gl-draw-polygon-stroke-active",
    type: "line",
    filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": colors.blue["500"],
      "line-width": 3,
    },
  },

  // Vertex point halos
  {
    id: "gl-draw-polygon-and-line-vertex-halo-active",
    type: "circle",
    filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
    paint: {
      "circle-radius": 5,
      "circle-color": "#FFF",
    },
  },

  // Vertex points
  {
    id: "gl-draw-polygon-and-line-vertex-active",
    type: "circle",
    filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
    paint: {
      "circle-radius": 3,
      "circle-color": colors.blue["500"],
    },
  },
];

const inactiveStyles = [
  // Line stroke
  {
    id: "gl-draw-line-static",
    type: "line",
    filter: ["all", ["==", "$type", "LineString"], ["==", "mode", "static"]],
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": "#000",
      "line-width": 3,
    },
  },

  // Polygon fill
  {
    id: "gl-draw-polygon-fill-static",
    type: "fill",
    filter: ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
    paint: {
      "fill-color": "#000",
      "fill-outline-color": "#000",
      "fill-opacity": 0.1,
    },
  },

  // Polygon outline
  {
    id: "gl-draw-polygon-stroke-static",
    type: "line",
    filter: ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": "#000",
      "line-width": 3,
    },
  },
];

const styles = [...activeStyles, ...inactiveStyles];

export default styles;
