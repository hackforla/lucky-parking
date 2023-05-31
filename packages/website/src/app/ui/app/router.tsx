import { createBrowserRouter } from "react-router-dom";
import { ScreenLayout } from "@/shared/layouts";
import { ParkingInsightsPage } from "@/pages";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ScreenLayout />,
    children: [{ index: true, element: <ParkingInsightsPage /> }],
  },
]);

export default router;
