import React from "react";

/**
 * Endpoint telemetry summary card.
 */
export default function EndpointStatus({ endpoint = {} }) {
  return (
    <section className="card card-bordered p-4">
      <header className="mb-3">
        <h3 className="text-sm font-semibold">Endpoint Status</h3>
      </header>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="opacity-70">Files Modified/s</dt>
          <dd className="font-medium">{endpoint.files_modified_per_second ?? 0}</dd>
        </div>
        <div>
          <dt className="opacity-70">Entropy Avg</dt>
          <dd className="font-medium">{endpoint.entropy_avg_modified_files ?? 0}</dd>
        </div>
        <div>
          <dt className="opacity-70">Honeypot Touched</dt>
          <dd className="font-medium">{String(Boolean(endpoint.honeypot_touched))}</dd>
        </div>
        <div>
          <dt className="opacity-70">VSS Delete Attempt</dt>
          <dd className="font-medium">{String(Boolean(endpoint.vss_delete_attempt))}</dd>
        </div>
      </dl>
    </section>
  );
}
