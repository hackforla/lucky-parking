export const places = {
  id: "places",
  type: "circle",
  source: "places",
  layout: {
    'visibility': 'visible',
  },
  paint: {
    "circle-radius": 4,
    "circle-color": "#fddb3a",
    "circle-stroke-width": 0,
    "circle-opacity": {
      stops: [
        [0, 0],
        [10, 0.0],
        [14, 0.01],
        [18, 1],
      ],
    },
  },
};

export const zipcodes = {
  id: "zipcodes",
  type: "fill",
  source: "zipcodes",
  //"source-layer": "ZIP_Codes-7ssji7",
  paint: {
    "fill-color": "#088",
    "fill-opacity": .1,
  } ,
  layout: {
    'visibility': 'none',
  }
};

export const zipCodeLines = {
  id: "zipcodeLines",
  type: "line",
  source: "zipcodes",
  //"source-layer": "ZIP_Codes-7ssji7",
  paint: {
    "line-color": "white",
  } ,
  layout: {
    'visibility': 'none',
  }
};

export const heatMap = {
  id: "heatmap",
  type: "heatmap",
  source: "places",
  layout: {
    'visibility': 'visible',
  },
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
        [0, 0.006],
        [8, 0.01],
        [13, 0.01],
        [15, 0.02],
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
