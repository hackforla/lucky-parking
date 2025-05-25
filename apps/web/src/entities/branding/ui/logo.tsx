import type { onEvent } from "@lucky-parking/types";
import brandmark from "./brandmark.svg";

type LogoProps = {
  onClick?: onEvent;
};

export default function Logo(props: LogoProps) {
  const { onClick } = props;

  return (
    <div className="flex items-center space-x-2" onClick={onClick}>
			<img src={brandmark} alt="Parking Insights brand mark" />

			<div className="select-none -space-y-1 font-semibold uppercase text-blue-600">
				<p>Parking</p>
				<p>Insights</p>
			</div>
    </div>
  );
}
