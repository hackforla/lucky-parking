import { createBrowserRouter } from "react-router-dom";
import { ScreenLayout } from "@/shared/layouts";
import { MainPage } from "@/pages";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ScreenLayout />,
    children: [{ index: true, element: <MainPage /> }],
  },
]);

export default router;
