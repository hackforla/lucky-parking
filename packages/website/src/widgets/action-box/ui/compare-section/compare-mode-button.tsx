import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import { Button, ButtonVariant } from "@lucky-parking/ui";

export default function CompareModeButton() {
  return (
    <Button variant={ButtonVariant.secondary}>
      <CompareArrowsIcon />
      <p>Compare Mode</p>
    </Button>
  );
}
