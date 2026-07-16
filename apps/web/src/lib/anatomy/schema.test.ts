import { describe, expect, it } from "vitest";
import { anatomyStructureListSchema } from "@motion-anatomy/anatomy-schema";

const validStructure = {
  code: "MUSCLE_SAMPLE_L",
  name_ko: "샘플 근육",
  name_en: "Sample muscle",
  name_latin: null,
  structure_type: "muscle",
  body_region: "lower_limb",
  side: "left",
  depth: "superficial",
  description: "교육용 샘플",
  origin_text: null,
  insertion_text: null,
  function_text: "샘플 기능",
  medical_disclaimer: "의료 진단을 대체하지 않습니다.",
  model_node_name: "sample_muscle_l",
  review_status: "draft",
  source: { title: "Sample", organization: "Motion Anatomy", publication_year: 2026, url: "", license: "Internal sample only", citation_text: "Motion Anatomy sample citation" },
};

describe("anatomyStructureListSchema", () => {
  it("accepts a valid structure list and preserves citation metadata", () => {
    const parsed = anatomyStructureListSchema.parse([validStructure]);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].source.citation_text).toBe("Motion Anatomy sample citation");
  });

  it("rejects an unsupported structure type", () => {
    expect(() => anatomyStructureListSchema.parse([{ ...validStructure, structure_type: "skin" }])).toThrow();
  });
});
