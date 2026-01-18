import { Badge } from "@lucky-parking/design/components";
import _ from "lodash";

type GeocoderResultProps = {
	name: string;
	address: string;
	type: string;
};

export const PlaceItem = ({ name, address, type }: GeocoderResultProps) => {
	return (
		<div className="flex items-center justify-between space-x-2 px-4 py-3">
			<div>
				<p className="truncate font-semibold">{name}</p>
				{address ? <p className="truncate text-xs">{address}</p> : null}
			</div>

			<div className="flex items-center gap-2">
				<Badge>{_.startCase(type)}</Badge>
			</div>
		</div>
	);
};
