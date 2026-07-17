export type BenchmarkStatus = "active" | "in-development" | "planned";

/** Matches `fill="white"` on public/opensre-logo-white.svg */
export const OPENSRE_BRAND_COLOR = "#ffffff";

export type BenchmarkSuite = {
  id: string;
  name: string;
  status: BenchmarkStatus;
  summary: string;
  caseCount?: number;
  href: string;
  highlights: string[];
};

export type BenchmarkMetricFamily = {
  id: string;
  name: string;
  description: string;
  metrics: string[];
};

export const BENCHMARK_STATUS_LABELS: Record<BenchmarkStatus, string> = {
  active: "Active workstream",
  "in-development": "In development",
  planned: "Planned",
};

export const BENCHMARK_STATUS_SHORT_LABELS: Record<BenchmarkStatus, string> = {
  active: "Active",
  "in-development": "Building",
  planned: "Planned",
};

export const BENCHMARK_SUITES: BenchmarkSuite[] = [
  {
    id: "cloudopsbench",
    name: "CloudOpsBench",
    status: "active",
    summary:
      "Reproducible evaluation of OpenSRE+LLM against LLM-alone on a corpus of real fault scenarios. The harness runs cases in parallel and reports outcome, process, efficiency, robustness, and validity metrics.",
    caseCount: 452,
    href: "https://github.com/Tracer-Cloud/opensre/issues/2074",
    highlights: [
      "452 fault cases across multiple models and repeated runs",
      "Containerized AWS dispatcher triggered from GitHub Actions",
      "Primary comparison: OpenSRE+LLM vs same-model LLM-alone control",
      "Scenario-clustered means with 95% bootstrap confidence intervals",
    ],
  },
  {
    id: "research-benchmark",
    name: "OpenSRE Research Benchmark",
    status: "in-development",
    summary:
      "A curated, reproducible evaluation suite for AI agents diagnosing incidents across multi-service architectures — positioned as a SWE-bench-style benchmark for distributed systems and SRE workflows.",
    href: "https://github.com/Tracer-Cloud/opensre/issues/575",
    highlights: [
      "Failure taxonomy across network, config, and data-pipeline faults",
      "Ground-truth root cause and remediation verification",
      "Synthetic fault injection with deterministic scoring rubrics",
      "Target: 25 high-quality tasks before expanding to 100+",
    ],
  },
];

export const BENCHMARK_METRIC_FAMILIES: BenchmarkMetricFamily[] = [
  {
    id: "outcome",
    name: "Outcome",
    description: "Did the agent identify the right root cause and remediation?",
    metrics: ["A@1", "A@3", "Partial A@1", "Partial A@3", "TCR"],
  },
  {
    id: "process",
    name: "Process",
    description: "How closely did investigation steps match the reference path?",
    metrics: ["Exact", "In order", "Any order", "Coverage", "Relevance"],
  },
  {
    id: "efficiency",
    name: "Efficiency",
    description: "How much time and effort did the run consume?",
    metrics: ["Steps", "MTTI"],
  },
  {
    id: "robustness",
    name: "Robustness",
    description: "How stable is the agent under imperfect telemetry and retries?",
    metrics: ["IAC", "RAR", "ZTDR"],
  },
  {
    id: "validity",
    name: "Validity",
    description: "Are citations grounded in real evidence and actionable commands?",
    metrics: [
      "Citation grounding rate",
      "Entity existence rate",
      "kubectl actionability rate",
    ],
  },
];

export const BENCHMARK_PRINCIPLES = [
  "Verifiable ground truth — scoring checks whether the agent found the correct root cause, not just plausible prose.",
  "Reproducible harnesses — benchmarks run in isolated environments with deterministic fault injection where possible.",
  "Agent + tooling comparisons — OpenSRE+LLM is measured against LLM-alone controls on the same tasks.",
  "Transparent reporting — headline metrics use scenario clustering and confidence intervals, not single lucky runs.",
] as const;

export const BENCHMARK_LINKS = [
  {
    label: "CloudOpsBench tracking issue",
    href: "https://github.com/Tracer-Cloud/opensre/issues/2074",
  },
  {
    label: "Research benchmark RFC",
    href: "https://github.com/Tracer-Cloud/opensre/issues/575",
  },
  {
    label: "OpenSRE repository",
    href: "https://github.com/Tracer-Cloud/opensre",
  },
  {
    label: "OpenSRE docs",
    href: "https://www.opensre.com/docs",
  },
] as const;

export type BenchmarkPreviewArm = {
  id: string;
  label: string;
  shortLabel: string;
  value: number;
  color?: string;
};

export const BENCHMARK_PREVIEW_COMPARISON = {
  caption: "Illustrative preview — not published benchmark results",
  metric: "A@1",
  arms: [
    {
      id: "opensre",
      label: "OpenSRE + LLM",
      shortLabel: "OpenSRE",
      value: 68,
      color: OPENSRE_BRAND_COLOR,
    },
    {
      id: "llm-alone",
      label: "LLM alone",
      shortLabel: "LLM",
      value: 39,
    },
  ] satisfies BenchmarkPreviewArm[],
};

export const BENCHMARK_METRIC_WEIGHTS = [
  { id: "outcome", label: "Outcome", value: 28, color: "#ffffff" },
  { id: "process", label: "Process", value: 22, color: "#d4d4d4" },
  { id: "efficiency", label: "Efficiency", value: 14, color: "#a3a3a3" },
  { id: "robustness", label: "Robustness", value: 18, color: "#8a8a8a" },
  { id: "validity", label: "Validity", value: 18, color: "#666666" },
] as const;

export const BENCHMARK_PIPELINE_STEPS = [
  { id: "inject", label: "Fault injection", detail: "452 curated scenarios" },
  { id: "observe", label: "Telemetry push", detail: "Mock observability APIs" },
  { id: "investigate", label: "Agent run", detail: "OpenSRE + LLM or control" },
  { id: "score", label: "Scoring harness", detail: "18 metrics, 5 families" },
] as const;

export type BenchmarkRadarAxis = {
  id: string;
  label: string;
  shortLabel: string;
  category: string;
};

export type BenchmarkRadarSeries = {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  primary?: boolean;
  values: number[];
};

export const BENCHMARK_RADAR_AXES: BenchmarkRadarAxis[] = [
  { id: "a1", label: "A@1", shortLabel: "A@1", category: "Outcome" },
  { id: "a3", label: "A@3", shortLabel: "A@3", category: "Outcome" },
  { id: "tcr", label: "TCR", shortLabel: "TCR", category: "Outcome" },
  { id: "process", label: "Process coverage", shortLabel: "Process", category: "Process" },
  { id: "exact", label: "Exact match", shortLabel: "Exact", category: "Process" },
  { id: "steps", label: "Step efficiency", shortLabel: "Steps", category: "Efficiency" },
  { id: "mtti", label: "MTTI", shortLabel: "MTTI", category: "Efficiency" },
  { id: "iac", label: "IAC", shortLabel: "IAC", category: "Robustness" },
  { id: "citations", label: "Citation grounding", shortLabel: "Citations", category: "Validity" },
  { id: "kubectl", label: "kubectl actionability", shortLabel: "kubectl", category: "Validity" },
];

export const BENCHMARK_RADAR_SERIES: BenchmarkRadarSeries[] = [
  {
    id: "opensre",
    label: "OpenSRE + LLM",
    shortLabel: "OpenSRE",
    color: OPENSRE_BRAND_COLOR,
    primary: true,
    values: [68, 74, 71, 79, 66, 72, 69, 76, 81, 77],
  },
  {
    id: "llm-alone",
    label: "LLM alone",
    shortLabel: "LLM",
    color: "#fb923c",
    values: [39, 44, 36, 41, 33, 48, 42, 38, 35, 40],
  },
  {
    id: "tool-only",
    label: "Tool-only agent",
    shortLabel: "Tools",
    color: "#4ade80",
    values: [52, 49, 55, 58, 51, 61, 54, 47, 56, 53],
  },
  {
    id: "heuristic",
    label: "Heuristic baseline",
    shortLabel: "Heuristic",
    color: "#f87171",
    values: [28, 31, 25, 34, 29, 37, 33, 27, 30, 26],
  },
];

export const BENCHMARK_RADAR_CAPTION =
  "Illustrative preview profile — not published benchmark results";
