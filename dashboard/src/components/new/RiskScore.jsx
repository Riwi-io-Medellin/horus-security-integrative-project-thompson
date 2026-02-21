import React from "react";

/**
 * Displays unified risk score card.
 * Integrators should map class names to the existing design system tokens.
 */
export default function RiskScore({ score = 0, threshold = 75 }) {
  const level = score >= threshold ? "critical" : score >= 50 ? "high" : score >= 25 ? "medium" : "low";

  return (
    <section className="card card-bordered p-4">
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Unified Risk Score</h3>
        <span className={`badge badge-${level}`}>{level.toUpperCase()}</span>
      </header>

      <div className="flex items-end gap-2">
        <strong className="text-3xl font-bold">{score}</strong>
        <span className="text-sm opacity-70">/100</span>
      </div>

      <p className="mt-2 text-xs opacity-80">Alert threshold: {threshold}</p>
    </section>
  );
}
