import { GeocodeResult } from "@/shared/lib/types";
import { DrawFeature } from "@mapbox/mapbox-gl-draw";
import { createSlice } from "@reduxjs/toolkit";
import { StoreRootState } from "./store";

interface SliceState {
  currentMap: string | null;
  drawing: DrawFeature | null;
  selectedFeature: GeocodeResult | null;
  isMapInstructionsVisible: boolean;
}

const initialState: SliceState = {
  currentMap: null,
  drawing: null,
  selectedFeature: null,
  isMapInstructionsVisible: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setCurrentMap(state, action) {
      state.currentMap = action.payload;
    },
    setMapDrawing(state, action) {
      state.drawing = action.payload;
    },
    setMapFocusedFeature(state, action) {
      state.selectedFeature = action.payload;
    },
    setMapInstructionsVisible(state, action) {
      state.isMapInstructionsVisible = action.payload;
    },
  },
});

export const selectors = {
  selectUi: (state: StoreRootState) => state.ui,
};

export const { actions } = uiSlice;

export default uiSlice;
