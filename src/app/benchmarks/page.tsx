import { BenchmarksDashboard } from "@/components/benchmarks/BenchmarksDashboard";
import { BenchmarksHeader } from "@/components/benchmarks/BenchmarksHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Benchmarks | OpenSRE",
  description:
    "OpenSRE benchmark suites and evaluation metrics for AI SRE incident investigation agents.",
};

export default function BenchmarksPage() {
  return (
    <div className="doc-shell benchmarks-page">
      <BenchmarksHeader />
      <main className="page-main benchmarks-page-main mx-auto max-w-5xl space-y-6 py-6 sm:space-y-8 sm:py-8 md:space-y-10 md:py-10">
        <BenchmarksDashboard />
      </main>
    </div>
  );
}
