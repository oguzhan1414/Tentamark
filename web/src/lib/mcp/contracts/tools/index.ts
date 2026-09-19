import { READ_TOOLS } from "./readTools";
import { WRITE_TOOLS } from "./writeTools";
import type { ToolContract } from "../types";

export { READ_TOOLS, type ReadToolName } from "./readTools";
export { WRITE_TOOLS, type WriteToolName } from "./writeTools";

export const ALL_TOOLS: readonly ToolContract[] = [...READ_TOOLS, ...WRITE_TOOLS];

export type ToolName = (typeof ALL_TOOLS)[number]["name"];

const TOOLS_BY_NAME = new Map(ALL_TOOLS.map((tool) => [tool.name, tool]));

export function getToolContract(name: string): ToolContract | undefined {
  return TOOLS_BY_NAME.get(name);
}
