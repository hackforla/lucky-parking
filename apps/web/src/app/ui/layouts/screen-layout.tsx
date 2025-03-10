import { Outlet } from "react-router-dom";
import { ScreenContainer } from "@lucky-parking/ui/containers";

export default function ScreenLayout() {
  return (
    <ScreenContainer>
      <Outlet />
    </ScreenContainer>
  );
}
