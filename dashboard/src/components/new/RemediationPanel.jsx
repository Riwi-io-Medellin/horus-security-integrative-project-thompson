import React from "react";

/**
 * Remediation action panel.
 */
export default function RemediationPanel({ finding, onPreview, onExecute }) {
  if (!finding) {
    return (
      <section className="card card-bordered p-4">
        <h3 className="text-sm font-semibold">Remediation</h3>
        <p className="mt-2 text-sm opacity-70">Select a finding to preview remediation actions.</p>
      </section>
    );
  }

  return (
    <section className="card card-bordered p-4">
      <header className="mb-3">
        <h3 className="text-sm font-semibold">Remediation Panel</h3>
      </header>

      <p className="text-sm">Finding: <strong>{finding.finding_type}</strong></p>
      <div className="mt-3 flex gap-2">
        <button type="button" className="btn btn-secondary" onClick={() => onPreview?.(finding)}>
          Preview
        </button>
        <button type="button" className="btn btn-primary" onClick={() => onExecute?.(finding)}>
          Execute
        </button>
      </div>
    </section>
  );
}
