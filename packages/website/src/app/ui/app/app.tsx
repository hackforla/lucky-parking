import { RouterProvider } from "react-router-dom";
import router from "./router";

export function App() {
  // return <p>App.tsx</p>

  return <RouterProvider router={router} />;
}

export default App;
