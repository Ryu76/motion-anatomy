export type StructureType = "bone" | "muscle" | "tendon" | "ligament" | "fascia" | "vessel";
export type StructureSide = "left" | "right" | "midline";
export type ReviewStatus = "draft" | "editor_review" | "expert_review" | "approved" | "deprecated";

export type AnatomySource = {
  title: string;
  organization: string;
  publication_year: number;
  url: string;
  license: string;
  citation_text: string;
};

export type AnatomyStructure = {
  code: string;
  name_ko: string;
  name_en: string;
  name_latin: string | null;
  structure_type: StructureType;
  body_region: string;
  side: StructureSide;
  depth: string;
  description: string;
  origin_text: string | null;
  insertion_text: string | null;
  function_text: string;
  medical_disclaimer: string;
  model_node_name: string;
  review_status: ReviewStatus;
  source: AnatomySource;
};
