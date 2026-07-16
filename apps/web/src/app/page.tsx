import { readFile } from "node:fs/promises";
import path from "node:path";
import { AnatomyWorkspace } from "@/components/anatomy/AnatomyWorkspace";
import { anatomyStructureListSchema } from "@motion-anatomy/anatomy-schema";
import type { AnatomyStructure } from "@motion-anatomy/shared-types";

async function loadStructures(): Promise<AnatomyStructure[]> {
  const seedPath = path.resolve(process.cwd(), "../../data/seed/anatomy_structures.json");
  return anatomyStructureListSchema.parse(JSON.parse(await readFile(seedPath, "utf-8")));
}
export default async function Home() { return <AnatomyWorkspace structures={await loadStructures()} />; }
