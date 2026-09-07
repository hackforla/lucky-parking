import * as schemas from "./schemas";
import { z } from "zod";

export type CitationFilters = z.infer<typeof schemas.CitationFiltersSchema>;
