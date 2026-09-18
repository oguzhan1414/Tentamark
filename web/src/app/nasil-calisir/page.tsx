import type { Metadata } from "next";
import HowItWorksContent from "./HowItWorksContent";

export const metadata: Metadata = {
  title: "Nasıl Çalışır? | Tentamark",
  description:
    "Markanızı tanıtın, platformlara uygun içerikler hazırlayın, gönderileri gözden geçirip takvimde planlayın. Tentamark'ın çalışma akışını keşfedin.",
  alternates: { canonical: "https://tentamark.com/nasil-calisir" },
};

export default function HowItWorksPage() {
  return <HowItWorksContent />;
}
