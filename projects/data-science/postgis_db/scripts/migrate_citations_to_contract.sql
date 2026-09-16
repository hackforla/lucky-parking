-- Migrate wide citations → contract schema (issue_datetime, slim columns).
-- Run against an existing load from scripts/load_citations.sql.

BEGIN;

DROP TABLE IF EXISTS citations_contract;

CREATE TABLE citations_contract (
    ticket_number         TEXT PRIMARY KEY,
    issue_datetime        TIMESTAMPTZ NOT NULL,
    violation_code        TEXT,
    violation_description TEXT,
    fine_amount           DOUBLE PRECISION,
    geom                  geometry(Point, 4326)
);

INSERT INTO citations_contract (
    ticket_number,
    issue_datetime,
    violation_code,
    violation_description,
    fine_amount,
    geom
)
SELECT DISTINCT ON (ticket_number)
    ticket_number,
    (
        date_trunc(
            'day',
            to_timestamp(BTRIM(issue_date), 'YYYY Mon DD HH12:MI:SS AM')
        )
        + CASE
            WHEN issue_time IS NOT NULL
                 AND regexp_replace(BTRIM(issue_time), '[^0-9]', '', 'g') ~ '^\d{1,4}$'
            THEN make_interval(
                hours => CAST(
                    substring(
                        lpad(regexp_replace(BTRIM(issue_time), '[^0-9]', '', 'g'), 4, '0')
                        from 1 for 2
                    ) AS integer
                ),
                mins => CAST(
                    substring(
                        lpad(regexp_replace(BTRIM(issue_time), '[^0-9]', '', 'g'), 4, '0')
                        from 3 for 2
                    ) AS integer
                )
            )
            ELSE interval '0'
        END
    ) AT TIME ZONE 'UTC' AS issue_datetime,
    NULLIF(BTRIM(violation_code), ''),
    NULLIF(BTRIM(violation_description), ''),
    fine_amount,
    geom
FROM citations
WHERE ticket_number IS NOT NULL
  AND issue_date IS NOT NULL
  AND BTRIM(issue_date) <> ''
  AND geom IS NOT NULL
  AND to_timestamp(BTRIM(issue_date), 'YYYY Mon DD HH12:MI:SS AM') IS NOT NULL
ORDER BY ticket_number;

DROP TABLE citations;
ALTER TABLE citations_contract RENAME TO citations;

CREATE INDEX idx_citations_issue_datetime ON citations (issue_datetime);
CREATE INDEX idx_citations_violation_code ON citations (violation_code);
CREATE INDEX idx_citations_geom ON citations USING GIST (geom);

ANALYZE citations;

SELECT
    count(*) AS total_rows,
    min(issue_datetime) AS min_dt,
    max(issue_datetime) AS max_dt
FROM citations;

COMMIT;
