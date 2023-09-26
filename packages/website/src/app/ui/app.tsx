import { Provider as StoreProvider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { store } from "@/shared/data";
import router from "./routing";

export function App() {
  return (
    <StoreProvider store={store}>
      <RouterProvider router={router} />
    </StoreProvider>
  );
}

export default App;
