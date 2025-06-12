import ENDPOINTS, { buildEndpointUrl } from "@/features/geocoder/api/endpoints";

export const fetchForwardGeocodingData = async (value: string) => {
  const endpoint = buildEndpointUrl(ENDPOINTS.FORWARD_GEOCODING, value);
  const res = await fetch(endpoint);

  return res.ok ? res.json() : null;
};
