import LogoPlusText from "../../../../public/logoVariants/logoPlusText.tsx";
import LogoSolidBlue from "../../../../public/logoVariants/logoSolidBlue.tsx";

export default function Logo() {
  return (
    <div className="flex space-x-2.5">
      {/* For Larger Screens */}
      <LogoPlusText />
  
      {/* For Smaller Screens */}
      {/* <LogoSolidBlue /> */}
    </div>
  );
}
