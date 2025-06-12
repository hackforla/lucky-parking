import { createBrowserRouter } from "react-router-dom";
import { ScreenLayout } from "@/app/ui/layouts";
import { PATHS } from "@/entities/navigation";
import { ParkingInsightsPage } from "@/pages";

const router = createBrowserRouter([
  {
    path: PATHS.HOME,
    element: <ScreenLayout />,
    children: [{ index: true, element: <ParkingInsightsPage /> }],
  },
]);

export default router;
