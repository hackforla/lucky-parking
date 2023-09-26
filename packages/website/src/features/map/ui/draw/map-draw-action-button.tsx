import Button, { ButtonProps } from "@lucky-parking/ui/src/components/button";

export default function MapDrawActionButton(props: ButtonProps) {
  const { children, isDisabled, onClick, variant } = props;

  return (
    <Button isDisabled={isDisabled} onClick={onClick} variant={variant}>
      {children}
    </Button>
  );
}
