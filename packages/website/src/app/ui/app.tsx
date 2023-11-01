import { Provider as StoreProvider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import MapProvider from "@/entities/map/lib/provider/map-provider";
import { store } from "@/shared/data";
import router from "./routing";

export function App() {
  return (
    <StoreProvider store={store}>
      <MapProvider>
        <RouterProvider router={router} />
      </MapProvider>
    </StoreProvider>
  );
}

export default App;
