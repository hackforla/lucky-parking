import { Outlet } from "react-router-dom";
import { FullContainer, ScreenContainer } from "@lucky-parking/ui";

export default function ScreenLayout() {
  return (
    <ScreenContainer>
      <FullContainer as="main">
        <Outlet />
      </FullContainer>
    </ScreenContainer>
  );
}
