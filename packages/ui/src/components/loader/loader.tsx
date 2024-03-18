interface LoaderProps {
  height?: string;
  width?: string;
  textColor?: string;
  spinnerColor?: string;
  spinnerSize?: string;
  backgroundColor?: string;
}

const Loader: React.FC<LoaderProps> = ({
  /**
   * The height and width of the loader, using Tailwind CSS sizing classes.
   * @default 'h-16' height: 4rem; (64px)
   * @default 'w-16' width: 4rem; (64px)
   */
  height = "16",
  width = "16",
  /**
   * The color of the text within the loader, using a Tailwind CSS color class.
   * @default 'text-blue-500' color: rgb(59 130 246);
   */
  textColor = "blue-500",
  /**
   * The color of the spinner within the loader.
   * @default '#1d4ed8' branding color
   */
  spinnerColor = "#1d4ed8",
  /**
   * The size of the spinner, using Tailwind CSS sizing classes.
   * @default 'h-12 w-12' height: 3rem; width: 3rem; (48px)
   */
  spinnerSize = "12",
  /**
   * The background color of the loader, using a Tailwind CSS color class.
   * @default 'bg-gray-100' background-color: rgb(243 244 246);
   */
  backgroundColor = "gray-100",
}) => {
  return (
    <div
      data-testid="loader"
      className={`bg-${backgroundColor} h-${height} w-${width} flex flex-col items-center justify-center`}>
      <svg
        className={`-ml-1 mb-2 mr-3 h-${spinnerSize} w-${spinnerSize} animate-spin text-white`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path
          className="opacity-75"
          fill={spinnerColor}
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>

      <p className={`text-${textColor} font-medium`}>Loading...</p>
    </div>
  );
};

export default Loader;
