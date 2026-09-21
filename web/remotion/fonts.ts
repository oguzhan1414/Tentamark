import { loadFont as loadDisplayFont } from "@remotion/google-fonts/Baloo2";
import { loadFont as loadBodyFont } from "@remotion/google-fonts/IBMPlexSans";

export const { fontFamily: displayFont } = loadDisplayFont("normal", {
  weights: ["600", "700", "800"],
  subsets: ["latin", "latin-ext"],
});

export const { fontFamily: bodyFont } = loadBodyFont("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
});
