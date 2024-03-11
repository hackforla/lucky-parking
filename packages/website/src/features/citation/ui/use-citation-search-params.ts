import { useSearchParams } from "react-router-dom";
import { RelativeDatePresets } from "@/shared/lib/constants/date";
import { formatToMiddleEndian } from "@lucky-parking/utilities/dist/date";
import { calculateDateRange } from "@/shared/lib/utilities/date";


export default function useCitationSearchParams() {
    const [searchParams, setSearchParams] = useSearchParams();

    const getCategory = () => searchParams.get("category");
    const setCategory = (value: string) => setSearchParams((prevParams) => {
        prevParams.set("category", value);
        return prevParams;
    });

    const getDatePreset = () => searchParams.get("date_preset");
    const setDatePreset = (value: RelativeDatePresets) => setSearchParams((prevParams) => {
        prevParams.set("date_preset", value);
        return prevParams;
    });

    const getDateRange = () => {
        if (searchParams.get("date_from") && searchParams.get("date_to")) {
            const dateFrom = new Date(searchParams.get("date_from"));
            const dateTo = new Date(searchParams.get("date_to"));
            return [dateFrom, dateTo];
        }
        else {
            return null;
        }
    };
    const setDateRange = (value: RelativeDatePresets | Date[] ) => setSearchParams((prevParams) => {
        let dateRange: Date[] = [];
        if (Array.isArray(value)) {
            dateRange = value;
        }
        else {
            dateRange = calculateDateRange(value);
        }
        prevParams.set("date_from", formatToMiddleEndian(dateRange[0]));
        prevParams.set("date_to", formatToMiddleEndian(dateRange[1]));
        return prevParams;
    });

    const getPlaceName = () => searchParams.get("place_name");
    const setPlaceName = (value: string) => setSearchParams((prevParams) => {
        prevParams.set("place_name", value);
        return prevParams;
    });

    const getPlaceType = () => searchParams.get("place_type");
    const setPlaceType = (value: string) => setSearchParams((prevParams) => {
        prevParams.set("place_type", value);
        return prevParams;
    });

    const getRegion1 = () => searchParams.get("region1");
    const setRegion1 = (value: string) => setSearchParams((prevParams) => {
        prevParams.set("region1", value);
        return prevParams;
    });

    const getRegion2 = () => searchParams.get("region2");
    const setRegion2 = (value: string) => setSearchParams((prevParams) => {
        prevParams.set("region2", value);
        return prevParams;
    });

    const getCompareMode = () => searchParams.get("compare_mode");
    const setCompareMode = () => setSearchParams((prevParams) => {
        prevParams.set("compare_mode", "true");
        return prevParams;
    })

    const clearSearchParams = () => setSearchParams({});

    return {
        category: {
            get: getCategory,
            set: setCategory,
        },
        datePreset: {
            get: getDatePreset,
            set: setDatePreset,
        },
        dateRange: {
            get: getDateRange,
            set: setDateRange,
        },
        placeName: {
            get: getPlaceName,
            set: setPlaceName,
        },
        placeType: {
            get: getPlaceType,
            set: setPlaceType,
        },
        region1: {
            get: getRegion1,
            set: setRegion1,
        },
        region2: {
            get: getRegion2,
            set: setRegion2,
        },
        compareMode: {
            get: getCompareMode,
            set: setCompareMode,
        },
        clearSearchParams: clearSearchParams,
        searchParams: searchParams,
    }

}