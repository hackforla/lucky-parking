import CreateIcon from "@mui/icons-material/Create";
import { Button, ButtonVariant } from "@lucky-parking/ui";

export default function DrawBoundaryButton() {
  return (
    <Button variant={ButtonVariant.outline}>
      <CreateIcon />
      <p className="uppercase">Draw Boundary</p>
    </Button>
  );
}
