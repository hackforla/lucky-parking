import BrandMark from "./brandmark.svg";
import { Link } from "react-router-dom";
import type { onEvent } from "@lucky-parking/typings";

type LogoProps = {
  onClick?: onEvent;
};

export default function Logo(props: LogoProps) {
  const { onClick } = props;

  return (
    <div className="flex items-center space-x-2" onClick={onClick}>
      /**
       * reloadDocument - A property used in the Link component from React Router to skip client side routing and let the browser handle the transition normally (as if it were an <a href>).
       * @typedef {boolean} reloadDocument
       */
      <Link to="/" reloadDocument={true} className="flex items-center space-x-2">
        <img src={BrandMark} alt="Parking Insights brand mark" />

        <div className="select-none -space-y-1 font-semibold uppercase text-blue-600">
          <p>Parking</p>
          <p>Insights</p>
        </div>
      </Link>
    </div>
  );
}
