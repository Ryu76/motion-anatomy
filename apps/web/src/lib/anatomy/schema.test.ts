import { describe, expect, it } from "vitest";
import { anatomyStructureListSchema, anatomyStructureSchema } from "@motion-anatomy/anatomy-schema";

const validStructure = {
  code: "MUSCLE_SAMPLE_L",
  name_ko: "샘플 근육",
  name_en: "Sample muscle",
  name_latin: null,
  search_terms: [],
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

  it("accepts detailed vessel structures", () => {
    const vessel = anatomyStructureSchema.parse({
      ...validStructure,
      code: "VESSEL_AORTA",
      name_ko: "대동맥",
      name_en: "Aorta",
      structure_type: "vessel",
      model_node_name: "Aorta",
    });
    expect(vessel.structure_type).toBe("vessel");
  });

  it("preserves group aliases as search terms instead of display names", () => {
    const component = anatomyStructureSchema.parse({ ...validStructure, search_terms: ["장요근"] });
    expect(component.name_ko).toBe("샘플 근육");
    expect(component.search_terms).toEqual(["장요근"]);
  });
});
