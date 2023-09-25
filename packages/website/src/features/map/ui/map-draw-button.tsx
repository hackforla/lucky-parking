import CreateIcon from "@mui/icons-material/Create";
import Button, { ButtonVariant } from "@lucky-parking/ui/src/components/button";
import type { ButtonProps } from "@lucky-parking/ui/src/components/button";

export default function MapDrawButton(props: ButtonProps) {
  const { onClick } = props;

  return (
    <Button variant={ButtonVariant.outline} onClick={onClick}>
      <CreateIcon />
      <p>Draw Boundary</p>
    </Button>
  );
}
