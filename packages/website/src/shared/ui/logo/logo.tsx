export default function Logo() {
  return (
    <div className="flex space-x-2.5">
      {/* Brand Mark */}
      <p className="w-[38px] h-[38px] p-2 rounded bg-blue-600 font-semibold text-white-100 text-center">
        PI
      </p>

      {/* Name */}
      <div className="text-blue-600 font-semibold text-base tracking-wider leading-5 uppercase">
        <p>Parking</p>
        <p>Insights</p>
      </div>
    </div>
  );
}
