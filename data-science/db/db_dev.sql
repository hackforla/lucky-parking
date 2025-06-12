--
-- PostgreSQL database cluster dump
--

-- Started on 2022-02-17 13:55:46 PST

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

-- CREATE ROLE postgres;
DO
$$
BEGIN
  IF NOT EXISTS (SELECT * FROM pg_user WHERE usename = 'postgres') THEN 
     CREATE ROLE postgres;
  END IF;
END
$$
;
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'md5c6aab06dd9a6810796520644208b3f7c';






--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

-- Dumped from database version 12.9 (Ubuntu 12.9-0ubuntu0.20.04.1)
-- Dumped by pg_dump version 12.9 (Ubuntu 12.9-0ubuntu0.20.04.1)

-- Started on 2022-02-17 13:55:47 PST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Completed on 2022-02-17 13:55:52 PST

--
-- PostgreSQL database dump complete
--

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

-- Dumped from database version 12.9 (Ubuntu 12.9-0ubuntu0.20.04.1)
-- Dumped by pg_dump version 12.9 (Ubuntu 12.9-0ubuntu0.20.04.1)

-- Started on 2022-02-17 13:55:52 PST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 1 (class 3079 OID 16384)
-- Name: adminpack; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS adminpack WITH SCHEMA pg_catalog;


--
-- TOC entry 3809 (class 0 OID 0)
-- Dependencies: 1
-- Name: EXTENSION adminpack; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION adminpack IS 'administrative functions for PostgreSQL';


--
-- TOC entry 3 (class 3079 OID 16393)
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- TOC entry 3810 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry, geography, and raster spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 210 (class 1259 OID 17676)
-- Name: neighborhood_councils; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.neighborhood_councils (
    "FID" bigint,
    "Name" text,
    "FolderPath" text,
    "SymbolID" bigint,
    "AltMode" bigint,
    "Base" bigint,
    "Clamped" bigint,
    "Extruded" bigint,
    "Snippet" text,
    "PopupInfo" text,
    "Shape_Leng" double precision,
    "Shape_Area" double precision,
    "Shape__Area" double precision,
    "Shape__Length" double precision,
    "GlobalID" text,
    geometry public.geometry(GeometryZ,4326)
);


ALTER TABLE public.neighborhood_councils OWNER TO postgres;

--
-- TOC entry 211 (class 1259 OID 17817)
-- Name: test1; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test1 (
    index bigint,
    state_plate character varying,
    make character varying,
    body_style character varying,
    color character varying,
    location character varying,
    violation_code character varying,
    violation_description character varying,
    fine_amount integer,
    datetime timestamp without time zone,
    make_ind integer,
    latitude double precision,
    longitude double precision,
    weekday character varying,
    geometry public.geometry(Point,4326)
);


ALTER TABLE public.test1 OWNER TO postgres;

--
-- TOC entry 212 (class 1259 OID 17828)
-- Name: zip_4326; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.zip_4326 (
    zip numeric,
    geo_4326 public.geometry
);


ALTER TABLE public.zip_4326 OWNER TO postgres;

--
-- TOC entry 209 (class 1259 OID 17402)
-- Name: zipcodes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.zipcodes (
    object_id bigint,
    shape_area numeric,
    shape_len numeric,
    zip numeric,
    the_geom public.geometry(MultiPolygon,4326)
);


ALTER TABLE public.zipcodes OWNER TO postgres;

CREATE TABLE public.make (
    make_id         bigint PRIMARY KEY, -- index
    make_name       varchar(50)
);


ALTER TABLE public.make OWNER TO postgres;

CREATE TABLE public.codes (
    vio_code_id     bigint          PRIMARY KEY,
    vio_description varchar (200)
);

CREATE TABLE public.vehicle(
    vehicle_id      bigserial          PRIMARY KEY, -- index
    state_plate     varchar(2),
    make_id         bigint,
    body_style      varchar(2),
    color           varchar(2),
    CONSTRAINT fk_make FOREIGN KEY (make_id) REFERENCES public.make (make_id)
);


ALTER TABLE public.vehicle OWNER TO postgres;

CREATE TABLE public.citation (
    citation_id     bigint          PRIMARY KEY, -- index
    vio_code_id     bigint,
    vehicle_id      bigint,
    location        text                    NOT NULL,
    weekday         varchar(10)             NOT NULL,
    datetime        timestamp               NOT NULL,
    fine_amount     integer                 NOT NULL,
    latitude        double precision        NOT NULL,       
    longitude       double precision        NOT NULL,
    geometry        public.geometry(Point,4326)
    CONSTRAINT fk_vio_code_id FOREIGN KEY (vio_code_id) REFERENCES public.codes (vio_code_id),
    CONSTRAINT fk_vehicle_id FOREIGN KEY (vehicle_id) REFERENCES public.vehicle (vehicle_id)
);


ALTER TABLE public.citation OWNER TO postgres;

