import "@testing-library/jest-dom";
import ENDPOINTS, { buildEndpointUrl } from "@/features/geocoder/api/endpoints";

describe("Endpoint Testing", () => {
  it("should outline forward geocoding endpoint", () => {
    expect(ENDPOINTS.FORWARD_GEOCODING).toBe(
      "https://api.mapbox.com/geocoding/v5/mapbox.places/<%= query %>.json?<%= search-params %>",
    );
  });

  it("should correctly build a forward geocoding endpoint url with params", () => {
    const query = "los";
    const FORWARD_GEOCODING_PATH =
      "https://api.mapbox.com/geocoding/v5/mapbox.places/<%= query %>.json?<%= search-params %>";
    const endpoint = buildEndpointUrl(FORWARD_GEOCODING_PATH, query);
    expect(endpoint).toBe(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/los.json?access_token=${
        process.env["VITE_MAPBOX_TOKEN"] || ""
      }&address_accuracy=address&bbox=-118.521447%2C33.899991%2C-118.126728%2C34.161439&country=US&fuzzyMatch=true&language=en&routing=false&worldview=us&types=address%2Cpoi%2Cpostcode%2Cneighborhood`,
    );
  });
});
