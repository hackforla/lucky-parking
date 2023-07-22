import _ from "lodash";
import losAngelesFeature from "@/shared/data/geo/los-angeles.json";

export const fetchGeocodingData = async (value: string) => {
  const params = new URLSearchParams({
    access_token: import.meta.env["VITE_MAPBOX_TOKEN"],
    address_accuracy: "address",
    // @ts-ignore
    bbox: _.first(losAngelesFeature?.features).bbox.toString(),
    country: "US",
    fuzzyMatch: "true",
    language: "en",
    routing: "false",
    types: "address,poi,postcode,neighborhood",
    worldview: "us",
  });
  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${value}.json?${params}`
  );

  return res.ok ? res.json() : undefined;
};

export default {
  fetchGeocodingData,
};
