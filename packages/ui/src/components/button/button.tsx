import _ from "lodash";
import { PropsWithChildren, forwardRef, MouseEvent } from "react";
import clsx from "clsx";

export enum ButtonSize {
  small = "small",
  large = "large",
}

export enum ButtonVariant {
  primary = "primary",
  secondary = "secondary",
  outline = "outline",
  text = "text",
}

const BUTTON_SIZE_STYLES: Record<ButtonSize, string> = {
  [ButtonSize.small]: "px-6 py-2",
  [ButtonSize.large]: "px-6 py-3",
};

const BUTTON_VARIANT_STYLES: Record<ButtonVariant, string> = {
  [ButtonVariant.primary]: "bg-blue-500 text-white-100 hover:bg-blue-400",
  [ButtonVariant.secondary]: "bg-blue-200 text-blue-700 hover:bg-blue-300",
  [ButtonVariant.outline]: "bg-white-100 border border-blue-500 text-blue-500 hover:bg-blue-100",
  [ButtonVariant.text]: "text-blue-600",
};

const BUTTON_DISABLED_VARIANT_STYLES: Record<ButtonVariant, string> = {
  [ButtonVariant.primary]: "bg-black-200 text-white-200",
  [ButtonVariant.secondary]: "bg-white-500 text-black-200",
  [ButtonVariant.outline]: "bg-white-400 border border-black-200 text-black-200",
  [ButtonVariant.text]: "text-black-200",
};

export interface ButtonProps extends PropsWithChildren {
  className?: string;
  isDisabled?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
  onClick?: (event: MouseEvent) => void;
}

export default forwardRef<HTMLButtonElement, ButtonProps>(function Button(props: ButtonProps, ref) {
  const {
    children,
    className = "",
    isDisabled = false,
    size = ButtonSize.small,
    variant = ButtonVariant.primary,
    onClick = _.noop,
    ...rest
  } = props;

  if (!children) return null;

  return (
    <button
      ref={ref}
      className={clsx(
        "rounded",
        variant !== ButtonVariant.text && BUTTON_SIZE_STYLES[size],
        isDisabled ? BUTTON_DISABLED_VARIANT_STYLES[variant] : BUTTON_VARIANT_STYLES[variant],
        className,
      )}
      onClick={onClick}
      disabled={isDisabled}
      {...rest}>
      <span className="flex w-full items-center justify-center space-x-2.5 text-sm font-bold uppercase leading-5 tracking-wide">
        {children}
      </span>
    </button>
  );
});
