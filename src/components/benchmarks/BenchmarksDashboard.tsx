import Link from "next/link";
import { AnimatedStat } from "@/components/benchmarks/AnimatedStat";
import { BenchmarkRadarChart } from "@/components/benchmarks/BenchmarkRadarChart";
import { BenchmarkCompareChart } from "@/components/benchmarks/BenchmarkCompareChart";
import { BenchmarkFlowViz } from "@/components/benchmarks/BenchmarkFlowViz";
import { BenchmarkMetricCards } from "@/components/benchmarks/BenchmarkMetricCards";
import { BenchmarkMetricDonut } from "@/components/benchmarks/BenchmarkMetricDonut";
import {
  BENCHMARK_LINKS,
  BENCHMARK_METRIC_FAMILIES,
  BENCHMARK_PRINCIPLES,
  BENCHMARK_STATUS_LABELS,
  BENCHMARK_STATUS_SHORT_LABELS,
  BENCHMARK_SUITES,
} from "@/lib/benchmarks/content";

const STAGGER_CLASSES = [
  "anim-stagger-1",
  "anim-stagger-2",
  "anim-stagger-3",
  "anim-stagger-4",
  "anim-stagger-5",
] as const;

function statusClassName(status: keyof typeof BENCHMARK_STATUS_LABELS): string {
  switch (status) {
    case "active":
      return "benchmark-status-active";
    case "in-development":
      return "benchmark-status-development";
    default:
      return "benchmark-status-planned";
  }
}

export function BenchmarksDashboard() {
  return (
    <div className="benchmarks-dashboard anim-fade-in space-y-6 sm:space-y-8 md:space-y-10">
      <section className="benchmark-hero doc-card doc-card-interactive overflow-hidden p-3 sm:p-6">
        <div className="benchmark-hero-glow" aria-hidden="true" />
        <div className="benchmark-hero-grid" aria-hidden="true" />
        <div className="relative z-[1]">
          <p className="doc-kicker">Evaluation vision</p>
          <h2 className="doc-section-title mt-3">Why benchmarks matter</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#d4d4d4] sm:text-base">
            OpenSRE is building reproducible ways to measure how well AI SRE agents
            investigate incidents, find root causes, and propose valid remediation.
            These benchmarks are separate from the contributor leaderboard — they track
            agent quality on curated fault scenarios, not GitHub activity.
          </p>

          <dl className="interaction-group mt-5 grid grid-cols-2 gap-2 sm:mt-6 sm:grid-cols-4 sm:gap-3">
            <div className="contributor-stat benchmark-hero-stat">
              <dt className="doc-meta">Fault cases</dt>
              <dd className="mt-2 text-xl text-white sm:text-2xl">
                <AnimatedStat value={452} />
              </dd>
            </div>
            <div className="contributor-stat benchmark-hero-stat">
              <dt className="doc-meta">Metric families</dt>
              <dd className="mt-2 text-xl text-white sm:text-2xl">
                <AnimatedStat value={5} />
              </dd>
            </div>
            <div className="contributor-stat benchmark-hero-stat">
              <dt className="doc-meta">Tracked metrics</dt>
              <dd className="mt-2 text-xl text-white sm:text-2xl">
                <AnimatedStat value={18} />
              </dd>
            </div>
            <div className="contributor-stat benchmark-hero-stat">
              <dt className="doc-meta">Comparison arms</dt>
              <dd className="mt-2 text-xl text-white sm:text-2xl">
                <AnimatedStat value={2} />
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <BenchmarkRadarChart />

      <div className="benchmark-visual-grid grid gap-4 lg:grid-cols-2">
        <BenchmarkFlowViz />
        <BenchmarkCompareChart />
      </div>

      <section aria-labelledby="benchmark-suites-heading" className="space-y-4">
        <div>
          <p className="doc-kicker">Benchmark suites</p>
          <h2 id="benchmark-suites-heading" className="doc-section-title mt-2">
            Active and upcoming evaluations
          </h2>
        </div>

        <div className="interaction-group grid gap-4 lg:grid-cols-2">
          {BENCHMARK_SUITES.map((suite, index) => (
            <article
              key={suite.id}
              className={`doc-card doc-card-interactive p-3 sm:p-6 anim-fade-in-up ${STAGGER_CLASSES[Math.min(index, STAGGER_CLASSES.length - 1)]}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="min-w-0 text-base font-medium text-white sm:text-lg">
                  {suite.name}
                </h3>
                <span
                  className={`contributor-badge shrink-0 ${statusClassName(suite.status)}`}
                >
                  <span className="hidden sm:inline">
                    {BENCHMARK_STATUS_LABELS[suite.status]}
                  </span>
                  <span className="sm:hidden">
                    {BENCHMARK_STATUS_SHORT_LABELS[suite.status]}
                  </span>
                </span>
                {suite.caseCount ? (
                  <span className="contributor-badge">
                    <AnimatedStat value={suite.caseCount} durationMs={700} /> cases
                  </span>
                ) : null}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-[#d4d4d4]">
                {suite.summary}
              </p>

              <ul className="mt-4 space-y-2 text-sm text-[#d4d4d4]">
                {suite.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-2">
                    <span className="text-[#737373]" aria-hidden="true">
                      —
                    </span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={suite.href}
                className="doc-link mt-5 inline-block text-sm"
                target="_blank"
                rel="noreferrer"
              >
                View tracking issue →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="benchmark-metrics-heading" className="space-y-4">
        <div>
          <p className="doc-kicker">CloudOpsBench metrics</p>
          <h2 id="benchmark-metrics-heading" className="doc-section-title mt-2">
            What gets measured
          </h2>
          <p className="doc-meta mt-2 max-w-3xl">
            Published runs report scenario-clustered means with bootstrap
            confidence intervals across five metric families.
          </p>
        </div>

        <div className="benchmark-metrics-grid grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <BenchmarkMetricDonut />
          <BenchmarkMetricCards families={BENCHMARK_METRIC_FAMILIES} />
        </div>
      </section>

      <section
        aria-labelledby="benchmark-results-heading"
        className="doc-card p-3 sm:p-6"
      >
        <p className="doc-kicker">Results</p>
        <h2 id="benchmark-results-heading" className="doc-section-title mt-3">
          Publication status
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#d4d4d4] sm:text-base">
          The CloudOpsBench harness, adapter, and dispatcher are active in the
          OpenSRE repository. Full grid results and automated reporting are still
          being wired up — this page will surface headline numbers once published
          runs land in the repo.
        </p>

        <dl className="interaction-group mt-6 grid gap-3 sm:grid-cols-3">
          <div className="contributor-stat">
            <dt className="doc-meta">Primary arm</dt>
            <dd className="mt-2 text-lg text-white">OpenSRE + LLM</dd>
          </div>
          <div className="contributor-stat">
            <dt className="doc-meta">Control arm</dt>
            <dd className="mt-2 text-lg text-white">LLM alone</dd>
          </div>
          <div className="contributor-stat">
            <dt className="doc-meta">Headline metric</dt>
            <dd className="mt-2 text-lg text-white">A@1</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="benchmark-principles-heading" className="space-y-4">
        <div>
          <p className="doc-kicker">Principles</p>
          <h2 id="benchmark-principles-heading" className="doc-section-title mt-2">
            How scores are interpreted
          </h2>
        </div>

        <ul className="interaction-group grid gap-3 sm:grid-cols-2">
          {BENCHMARK_PRINCIPLES.map((principle, index) => (
            <li
              key={principle}
              className={`doc-note-card benchmark-principle-card rounded-sm border border-[#262626] bg-[#0a0a0a] p-4 text-sm text-[#d4d4d4] anim-fade-in-up ${STAGGER_CLASSES[Math.min(index, STAGGER_CLASSES.length - 1)]}`}
            >
              {principle}
            </li>
          ))}
        </ul>
      </section>

      <section className="doc-card p-3 sm:p-6">
        <p className="doc-kicker">Get involved</p>
        <h2 className="doc-section-title mt-3">Follow benchmark work</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {BENCHMARK_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="doc-link"
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
