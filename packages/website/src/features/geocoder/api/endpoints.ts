import _ from "lodash";
import { losAngelesFeatures } from "@/shared/data";

const MAPBOX_BASE_URL = "https://api.mapbox.com";
const MAPBOX_GEOCODING_API_VERSION = "v5";

const BUILDER_PATTERN_QUERY = "<%= query %>";
const BUILDER_PATTERN_SEARCH_PARAMS = "<%= search-params %>";

const ENDPOINT_SEARCH_PARAMS = {
  access_token: process.env["VITE_MAPBOX_TOKEN"] || "",
  address_accuracy: "address",
  // @ts-ignore
  bbox: _.first(losAngelesFeatures?.features).bbox.toString(),
  country: "US",
  fuzzyMatch: "true",
  language: "en",
  routing: "false",
  worldview: "us",
  types: "address,poi,postcode,neighborhood",
};

const ENDPOINTS = {
  FORWARD_GEOCODING: `${MAPBOX_BASE_URL}/geocoding/${MAPBOX_GEOCODING_API_VERSION}/mapbox.places/${BUILDER_PATTERN_QUERY}.json?${BUILDER_PATTERN_SEARCH_PARAMS}`,
};

export const buildEndpointUrl = (url: string, value: string) =>
  _.chain(url)
    .replace(BUILDER_PATTERN_QUERY, value)
    .replace(BUILDER_PATTERN_SEARCH_PARAMS, new URLSearchParams(ENDPOINT_SEARCH_PARAMS).toString())
    .value();

export default ENDPOINTS;
