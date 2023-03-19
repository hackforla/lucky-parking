import { createBrowserRouter } from 'react-router-dom';
import { ScreenLayout } from './layouts';
import { ParkingInsightsPage } from './pages';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ScreenLayout>
        <ParkingInsightsPage />
      </ScreenLayout>
    ),
  },
]);

export default router;
