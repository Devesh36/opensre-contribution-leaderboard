import { BENCHMARK_PIPELINE_STEPS } from "@/lib/benchmarks/content";

export function BenchmarkFlowViz() {
  return (
    <section
      aria-label="Benchmark evaluation pipeline"
      className="benchmark-flow graph-panel doc-card p-3 sm:p-5 md:p-6"
    >
      <div className="chart-card-header">
        <h3 className="chart-card-title">Evaluation pipeline</h3>
        <p className="chart-card-subtitle">
          From injected faults to scored agent runs
        </p>
      </div>

      <ol className="benchmark-flow-track mt-6">
        {BENCHMARK_PIPELINE_STEPS.map((step, index) => (
          <li
            key={step.id}
            className="benchmark-flow-step"
            style={{ animationDelay: `${0.06 + index * 0.05}s` }}
          >
            <span className="benchmark-flow-node" aria-hidden="true">
              <span className="benchmark-flow-node-core" />
              <span className="benchmark-flow-node-ring" />
            </span>
            <div className="benchmark-flow-copy">
              <p className="benchmark-flow-label">{step.label}</p>
              <p className="doc-meta">{step.detail}</p>
            </div>
            {index < BENCHMARK_PIPELINE_STEPS.length - 1 ? (
              <span className="benchmark-flow-connector" aria-hidden="true">
                <span className="benchmark-flow-pulse" />
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
