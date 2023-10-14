import BrandMark from "./brandmark.svg";

export default function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <img src={BrandMark} alt="Parking Insights brand mark" />

      <div className="select-none -space-y-1 font-semibold uppercase text-blue-600">
        <p>Parking</p>
        <p>Insights</p>
      </div>
    </div>
  );
}
