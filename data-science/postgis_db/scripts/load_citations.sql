-- Load raw parking citations CSV into public.citations.
-- Expects the file mounted at /raw_data/Parking_Citations_20260720.csv

CREATE EXTENSION IF NOT EXISTS postgis;

DROP TABLE IF EXISTS citations;

CREATE UNLOGGED TABLE citations (
    ticket_number         TEXT,
    issue_date            TEXT,
    issue_time            TEXT,
    meter_id              TEXT,
    marked_time           TEXT,
    rp_state_plate        TEXT,
    plate_expiry_date     TEXT,
    vin                   TEXT,
    make                  TEXT,
    body_style            TEXT,
    color                 TEXT,
    location              TEXT,
    route                 TEXT,
    agency                TEXT,
    violation_code        TEXT,
    violation_description TEXT,
    fine_amount           TEXT,
    agency_desc           TEXT,
    color_desc            TEXT,
    body_style_desc       TEXT,
    loc_lat               TEXT,
    loc_long              TEXT,
    geocodelocation       TEXT
);

\echo Loading CSV (this can take a while on ~6 GB / ~25M rows)...
COPY citations FROM '/raw_data/Parking_Citations_20260720.csv'
WITH (FORMAT csv, HEADER true, FORCE_NULL (
    ticket_number, issue_date, issue_time, meter_id, marked_time,
    rp_state_plate, plate_expiry_date, vin, make, body_style, color,
    location, route, agency, violation_code, violation_description,
    fine_amount, agency_desc, color_desc, body_style_desc,
    loc_lat, loc_long, geocodelocation
));

\echo Coercing numeric columns...
ALTER TABLE citations
    ALTER COLUMN agency TYPE INTEGER USING NULLIF(agency, '')::INTEGER,
    ALTER COLUMN fine_amount TYPE DOUBLE PRECISION
        USING NULLIF(regexp_replace(fine_amount, ',', '', 'g'), '')::DOUBLE PRECISION,
    ALTER COLUMN loc_lat TYPE DOUBLE PRECISION
        USING NULLIF(loc_lat, '')::DOUBLE PRECISION,
    ALTER COLUMN loc_long TYPE DOUBLE PRECISION
        USING NULLIF(loc_long, '')::DOUBLE PRECISION;

\echo Building point geometries from lat/long...
ALTER TABLE citations
    ADD COLUMN geom geometry(Point, 4326);

UPDATE citations
SET geom = ST_SetSRID(ST_MakePoint(loc_long, loc_lat), 4326)
WHERE loc_lat IS NOT NULL
  AND loc_long IS NOT NULL
  AND loc_lat BETWEEN -90 AND 90
  AND loc_long BETWEEN -180 AND 180;

\echo Deduplicating ticket_number (keep first row)...
CREATE TABLE citations_dedup AS
SELECT DISTINCT ON (ticket_number) *
FROM citations
WHERE ticket_number IS NOT NULL
ORDER BY ticket_number;

DROP TABLE citations;
ALTER TABLE citations_dedup RENAME TO citations;

\echo Adding primary key and indexes...
ALTER TABLE citations ADD PRIMARY KEY (ticket_number);
CREATE INDEX idx_citations_issue_date ON citations (issue_date);
CREATE INDEX idx_citations_violation_code ON citations (violation_code);
CREATE INDEX idx_citations_make ON citations (make);
CREATE INDEX idx_citations_geom ON citations USING GIST (geom);

ALTER TABLE citations SET LOGGED;
ANALYZE citations;

\echo Done.
SELECT
    count(*) AS total_rows,
    count(geom) AS with_geom,
    count(*) FILTER (WHERE geom IS NULL) AS missing_geom
FROM citations;
