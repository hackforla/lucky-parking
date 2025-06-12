export enum PlaceType {
  "ADDRESS" = "address",
  "NEIGHBORHOOD" = "neighborhood",
  "NEIGHBORHOOD_COUNCIL" = "neighborhood council",
  "POINT_OF_INTEREST" = "poi",
  "POST_CODE" = "postcode",
}

export enum RegionType {
  "NEIGHBORHOOD_COUNCIL" = "Neighborhood Council",
  "ZIP_CODE" = "Zip Code",
  "PLACE" = "Place (Radius)",
  "DRAWING" = "Custom Drawing",
}

export const PLACE_TYPE_BY_REGION_TYPE = {
  [RegionType.DRAWING]: null,
  [RegionType.NEIGHBORHOOD_COUNCIL]: [PlaceType.NEIGHBORHOOD_COUNCIL],
  [RegionType.PLACE]: [PlaceType.ADDRESS, PlaceType.POINT_OF_INTEREST, PlaceType.NEIGHBORHOOD],
  [RegionType.ZIP_CODE]: [PlaceType.POST_CODE],
};

export const REGION_TYPE_BY_PLACE_TYPE = {
  [PlaceType.ADDRESS]: RegionType.PLACE,
  [PlaceType.NEIGHBORHOOD]: RegionType.PLACE,
  [PlaceType.NEIGHBORHOOD_COUNCIL]: RegionType.NEIGHBORHOOD_COUNCIL,
  [PlaceType.POINT_OF_INTEREST]: RegionType.PLACE,
  [PlaceType.POST_CODE]: RegionType.ZIP_CODE,
};
