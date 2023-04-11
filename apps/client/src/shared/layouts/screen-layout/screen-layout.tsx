import { Outlet } from "react-router-dom";
import { FullContainer, ScreenContainer } from "ui/src/components";

export default function ScreenLayout() {
  return (
    <ScreenContainer>
      <FullContainer as="main">
        <Outlet />
      </FullContainer>
    </ScreenContainer>
  );
}
