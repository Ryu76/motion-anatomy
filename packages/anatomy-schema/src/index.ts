import { z } from "zod";

export const anatomySourceSchema = z.object({
  title: z.string().min(1),
  organization: z.string().min(1),
  publication_year: z.number().int().min(1900),
  url: z.string(),
  license: z.string().min(1),
  citation_text: z.string().min(1),
});

export const anatomyStructureSchema = z.object({
  code: z.string().regex(/^(BONE|MUSCLE|TENDON|LIGAMENT|FASCIA|VESSEL)_[A-Z0-9_]+$/),
  name_ko: z.string().min(1),
  name_en: z.string().min(1),
  name_latin: z.string().nullable(),
  search_terms: z.array(z.string().min(1)).default([]),
  structure_type: z.enum(["bone", "muscle", "tendon", "ligament", "fascia", "vessel"]),
  body_region: z.string().min(1),
  side: z.enum(["left", "right", "midline"]),
  depth: z.string().min(1),
  description: z.string().min(1),
  origin_text: z.string().nullable(),
  insertion_text: z.string().nullable(),
  function_text: z.string().min(1),
  medical_disclaimer: z.string().min(1),
  model_node_name: z.string().min(1),
  review_status: z.enum(["draft", "editor_review", "expert_review", "approved", "deprecated"]),
  source: anatomySourceSchema,
});

export const anatomyStructureListSchema = z.array(anatomyStructureSchema);
export type AnatomyStructureInput = z.infer<typeof anatomyStructureSchema>;
