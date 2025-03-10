import _ from "lodash";
import { isSubstring } from "@lucky-parking/utilities/string";
import type { Bbox } from "@mapbox/mapbox-gl-geocoder";
import { AllGeoJSON, bbox, center } from "@turf/turf";
import neighborhoodCouncils from "@/shared/data/feature-collections/los-angeles-neighborhood-councils.json";
import { GeocodeResult } from "@/shared/lib/types";
import { PlaceType } from "../lib/constants";

export const forwardGeocodeNeighborhoodCouncil = (query: string) => {
  return _.reduce(
    neighborhoodCouncils.features,
    (result: GeocodeResult[], feature) => {
      const { NAME } = feature.properties;

      if (isSubstring(NAME, query, false)) {
        const newFeature = {
          ...feature,
          bbox: bbox(feature.geometry as AllGeoJSON) as Bbox,
          center: center(feature.geometry as AllGeoJSON),
          place_name: NAME,
          place_type: [PlaceType.NEIGHBORHOOD_COUNCIL],
          text: NAME,
        };

        result.push(newFeature as GeocodeResult);
      }

      return result;
    },
    [],
  );
};
