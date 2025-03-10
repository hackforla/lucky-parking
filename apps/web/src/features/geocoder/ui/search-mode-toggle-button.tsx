import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import { Button, type ButtonProps, ButtonVariant } from "@lucky-parking/ui/button";

export default function SearchModeToggleButton(props: ButtonProps) {
  const { onClick } = props;

  return (
    <Button variant={ButtonVariant.secondary} onClick={onClick}>
      <CompareArrowsIcon />
      <p>Compare Mode</p>
    </Button>
  );
}
