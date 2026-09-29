import { renderHtmlToImage } from "../renderHtmlToImage";
import { problemSolutionCardDimensions, type ProblemSolutionCardProps } from "./types";
import { pickProblemSolutionVariant } from "./registry";

export async function renderProblemSolutionCard(props: ProblemSolutionCardProps, options?: { variantKey?: string }): Promise<Buffer> {
  const dimensions = problemSolutionCardDimensions(props.format);
  const buildHtml = pickProblemSolutionVariant(options?.variantKey);
  return renderHtmlToImage(buildHtml(props), dimensions);
}
