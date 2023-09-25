import { Outlet } from "react-router-dom";
import { ScreenContainer } from "@lucky-parking/ui/src/components/containers";

export default function ScreenLayout() {
  return (
    <ScreenContainer>
      <Outlet />
    </ScreenContainer>
  );
}
