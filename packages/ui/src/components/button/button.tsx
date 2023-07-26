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
  [ButtonVariant.primary]: "bg-blue-500 text-white-100 hover:bg-blue-400",
  [ButtonVariant.secondary]: "bg-blue-200 text-blue-700 hover:bg-blue-300",
  [ButtonVariant.outline]:
    "bg-white-100 border border-blue-500 text-blue-500 hover:bg-blue-100",
};

const BUTTON_DISABLED_VARIANT_STYLES: Record<ButtonVariant, string> = {
  [ButtonVariant.primary]: "bg-black-200 text-white-200",
  [ButtonVariant.secondary]: "bg-white-500 text-black-200",
  [ButtonVariant.outline]:
    "bg-white-400 border border-black-200 text-black-200",
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
    ...rest
  } = props;

  if (!children) return null;

  return (
    <button
      className={clsx(
        "rounded",
        BUTTON_SIZE_STYLES[size],
        isDisabled
          ? BUTTON_DISABLED_VARIANT_STYLES[variant]
          : BUTTON_VARIANT_STYLES[variant]
      )}
      {...rest}
    >
      <span className="flex w-full justify-center items-center space-x-2.5 uppercase font-bold text-sm leading-5 tracking-wide">
        {children}
      </span>
    </button>
  );
}
