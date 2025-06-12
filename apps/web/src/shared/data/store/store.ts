import { configureStore } from "@reduxjs/toolkit";
import uiSlice from "./ui-slice";

const store = configureStore({
  reducer: {
    [uiSlice.name]: uiSlice.reducer,
  },
});

export type StoreDispatch = typeof store.dispatch;

export type StoreRootState = ReturnType<typeof store.getState>;

export default store;
