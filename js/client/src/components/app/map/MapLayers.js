export const places = {
  id: "places",
  type: "circle",
  source: "places",
  paint: {
    "circle-radius": 4,
    "circle-color": "#fddb3a",
    "circle-stroke-width": 0,
    "circle-opacity": {
      stops: [
        [0, 0],
        [14, 0.0],
        [18, 0.01],
        [20, 1],
      ],
    },
  },
};

export const heatMap = {
  id: "heatmap",
  type: "heatmap",
  source: "places",
  paint: {
    "heatmap-radius": {
      stops: [
        [0, 100],
        [8, 10],
        [10, 10],
        [15, 30],
      ],
    },

    "heatmap-intensity": {
      stops: [
        [0, 0.001],
        [8, 0.001],
        [13, 0.005],
        [14, 0.01],
        [15, 0.01],
      ],
    },

    "heatmap-opacity": {
      stops: [
        [0, 1],
        [10, 1],
        [14, 1],
        [15, 0.9],
      ],
    },

    "heatmap-color": [
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0,
      "rgba(3, 252, 90, 0)",
      0.00999,
      "rgba(3, 252, 90, 0)",
      0.01,
      "rgba(252, 219, 3, 0.05)",
      0.09999,
      "rgba(252, 219, 3, 0.05)",
      0.1,
      "rgba(255, 102, 0, 0.35)",
      0.9,
      "rgba(255, 102, 0, 0.35)",
      1,
      "rgba(178,24,43, 0.75)",
    ],
  },
};
