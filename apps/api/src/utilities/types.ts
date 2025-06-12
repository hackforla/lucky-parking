import { z } from "zod";
import * as schemas from "./schemas";

export type CitationFilters = z.infer<typeof schemas.CitationFiltersSchema>;
