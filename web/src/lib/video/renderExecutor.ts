import type { VideoInputProps } from "./types";

export type RenderExecutorResult = {
  filePath: string;
  width: number;
  height: number;
  durationInFrames: number;
  fps: number;
};

/*
  The one seam between "render a video" and "how/where that actually runs".
  localRenderer.ts implements this today via @remotion/renderer, running on
  whatever machine the Next.js server is on (the founder's own machine for
  now — no AWS yet, by design, see the plan doc). Swapping to Remotion Lambda
  later means writing a lambdaRenderer.ts implementing this same type and
  changing the one import in renderVideoJob.ts — nothing else in the job
  table, API route, or UI needs to change.
*/
export type RenderExecutor = (inputProps: VideoInputProps) => Promise<RenderExecutorResult>;
