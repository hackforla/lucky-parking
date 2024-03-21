import BrandMark from "./brandmark.svg";
import { Link } from "react-router-dom";

export default function Logo() {
  return (
    /**
     * reloadDocument - A property used in the Link component from React Router to skip client side routing and let the browser handle the transition normally (as if it were an <a href>).
     * @typedef {boolean} reloadDocument
     */
    <Link to="/" reloadDocument={true} data-testid="logo" className="flex items-center space-x-2">
      <img src={BrandMark} alt="Parking Insights brand mark" />

      <div className="select-none -space-y-1 font-semibold uppercase text-blue-600">
        <p>Parking</p>
        <p>Insights</p>
      </div>
    </Link>
  );
}
