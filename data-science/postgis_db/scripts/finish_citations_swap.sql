-- Resume after load_contract_citations.py staged rows but failed on index rename.
-- Requires public.citations_staging to still exist.

DROP TABLE IF EXISTS citations_new;
CREATE TABLE citations_new (
    ticket_number         TEXT PRIMARY KEY,
    issue_datetime        TIMESTAMPTZ NOT NULL,
    violation_code        TEXT,
    violation_description TEXT,
    fine_amount           DOUBLE PRECISION,
    geom                  geometry(Point, 4326)
);

INSERT INTO citations_new (
    ticket_number,
    issue_datetime,
    violation_code,
    violation_description,
    fine_amount,
    geom
)
SELECT DISTINCT ON (ticket_number)
    ticket_number,
    issue_datetime,
    NULLIF(BTRIM(violation_code), ''),
    NULLIF(BTRIM(violation_description), ''),
    fine_amount,
    ST_SetSRID(ST_MakePoint(loc_long, loc_lat), 4326)
FROM citations_staging
WHERE ticket_number IS NOT NULL
  AND issue_datetime IS NOT NULL
  AND loc_lat IS NOT NULL
  AND loc_long IS NOT NULL
  AND loc_lat BETWEEN -90 AND 90
  AND loc_long BETWEEN -180 AND 180
ORDER BY ticket_number;

DROP TABLE IF EXISTS citations;
ALTER TABLE citations_new RENAME TO citations;

CREATE INDEX idx_citations_issue_datetime ON citations (issue_datetime);
CREATE INDEX idx_citations_violation_code ON citations (violation_code);
CREATE INDEX idx_citations_geom ON citations USING GIST (geom);

DROP TABLE IF EXISTS citations_staging;

ANALYZE citations;

SELECT
    count(*) AS total_rows,
    count(geom) AS with_geom,
    min(issue_datetime) AS min_dt,
    max(issue_datetime) AS max_dt
FROM citations;
