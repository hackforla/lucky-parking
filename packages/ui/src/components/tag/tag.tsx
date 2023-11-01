import { PropsWithChildren } from "react";
import clsx from "clsx";

export enum TagColor {
  black = "black",
  blue = "blue",
  cyan = "cyan",
  red = "red",
  violet = "violet",
  white = "white",
}

const TagBackgroundColor: Record<TagColor, string> = {
  [TagColor.black]: "bg-black-200",
  [TagColor.blue]: "bg-blue-200",
  [TagColor.cyan]: "bg-cyan-200",
  [TagColor.red]: "bg-red-200",
  [TagColor.violet]: "bg-violet-200",
  [TagColor.white]: "bg-white-200",
};

interface TagProps extends PropsWithChildren {
  color?: TagColor;
}

export default function Tag(props: TagProps) {
  const { children, color = "black" } = props;

  if (!children) return null;

  return (
    <span
      className={clsx(
        "text-dark-500 paragraph-1 inline-flex items-center whitespace-nowrap rounded-full px-4 py-2 normal-case leading-none",
        TagBackgroundColor[color],
      )}>
      <p>{children}</p>
    </span>
  );
}
