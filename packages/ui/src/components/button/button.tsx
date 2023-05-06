import { PropsWithChildren } from "react";
import clsx from "clsx";

export enum ButtonSize {
  small = "small",
  large = "large",
}

export enum ButtonVariant {
  primary = "primary",
  secondary = "secondary",
  outline = "outline",
}

const BUTTON_SIZE_STYLES: Record<ButtonSize, string> = {
  [ButtonSize.small]: "px-6 py-2",
  [ButtonSize.large]: "px-6 py-3",
};

const BUTTON_VARIANT_STYLES: Record<ButtonVariant, string> = {
  [ButtonVariant.primary]: "bg-lp-blue-500 text-light-100 hover:bg-lp-blue-400",
  [ButtonVariant.secondary]: "bg-lp-blue-200 text-lp-blue-700 hover:bg-lp-blue-300",
  [ButtonVariant.outline]:
      "bg-lp-light-100 border border-lp-blue-500 text-lp-blue-500 hover:bg-lp-blue-100",
};

const BUTTON_DISABLED_VARIANT_STYLES: Record<ButtonVariant, string> = {
  [ButtonVariant.primary]: "bg-dark-200 text-light-200",
  [ButtonVariant.secondary]: "bg-light-500 text-dark-200",
  [ButtonVariant.outline]: "bg-light-400 border border-dark-200 text-dark-200",
};

interface ButtonProps extends PropsWithChildren {
  isDisabled?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export default function Button(props: ButtonProps) {
  const {
    children,
    isDisabled = false,
    size = ButtonSize.small,
    variant = ButtonVariant.primary,
  } = props;

  return (
    <button
      className={
        clsx(
          "rounded font-bold text-sm leading-5 tracking-wide",
          BUTTON_SIZE_STYLES[size],
          isDisabled
            ? BUTTON_DISABLED_VARIANT_STYLES[variant]
            : BUTTON_VARIANT_STYLES[variant]
        )
      }
    >
      {children}
    </button>
  );
}
