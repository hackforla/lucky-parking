import { Button, ButtonVariant } from "@lucky-parking/ui";
import Logo from "../../shared/ui/logo";

export default function Header() {
  return (
    <div className="flex flex-1 h-[60px] px-5 py-2 justify-between items-center">
      {/* Branding */}
      <div className="flex flex-1 items-center space-x-6">
        <Logo />
          
        {/* Description */}
        <div>
          <p className="heading-4">Los Angeles Parking Citation Data</p>
          <p className="paragraph-2 font-medium">
            Helping L.A. make informed decisions about parking policies
          </p>
        </div>
      </div>

      {/* Actions */}
      <div>
        <Button variant={ButtonVariant.secondary}>HOW IT WORKS</Button>
      </div>
    </div>
  );
}
