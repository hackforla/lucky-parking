import RegionSection from "../region-section/region-section"
import CloseIcon from '@mui/icons-material/Close';
import { useState } from "react";

export default function RegionTitleSection({ onClose }) {
    const handleClick = () => {
      onClose();
    };
  
    return (
      <RegionSection>
        <div className="flex justify-center">
          <p className="heading-4 text-[#505050]">REGION 1 DATA</p>
          <p className="absolute left-5 hover:cursor-pointer" onClick={handleClick}>
            <CloseIcon />
          </p>
        </div>
      </RegionSection>
    );
  }


//   export default function RegionTitleSection({ onClose }) {
//     const handleClick = () => {
//       onClose();
//     };
  
//     return (
//       <RegionSection>
//         <div className="flex justify-center">
//           <p className="heading-4 text-[#505050]">REGION 1 DATA</p>
//           <p className="absolute left-5 hover:cursor-pointer" onClick={handleClick}>
//             <CloseIcon />
//           </p>
//         </div>
//       </RegionSection>
//     );
//   }
  
  




// import RegionSection from "../region-section/region-section";
// import CloseIcon from "@mui/icons-material/Close";

// interface RegionTitleSectionProps {
//   onClose: () => void;
// }

// export default function RegionTitleSection({ onClose }: RegionTitleSectionProps) {
//   const handleIconClick = () => {
//     onClose();
//   };

//   return (
//     <RegionSection>
//       <div className="flex justify-center">
//         <p className="heading-4 text-[#505050]">REGION 1 DATA</p>
//         <p className="absolute left-5 hover:cursor-pointer" onClick={handleIconClick}>
//           <CloseIcon />
//         </p>
//       </div>
//     </RegionSection>
//   );
// }


// import React from "react";
// import RegionSection from "../region-section/region-section";
// import CloseIcon from "@mui/icons-material/Close";

// interface RegionTitleSectionProps {
//   onClose: () => void;
// }

// export default function RegionTitleSection({ onClose }: RegionTitleSectionProps) {
//   const handleClick = () => {
//     onClose();
//   };

//   return (
//     <RegionSection>
//       <div className="flex justify-center">
//         <p className="heading-4 text-[#505050]">REGION 1 DATA</p>
//         <p className="absolute left-5 hover:cursor-pointer" onClick={handleClick}>
//           <CloseIcon />
//         </p>
//       </div>
//     </RegionSection>
//   );
// }

