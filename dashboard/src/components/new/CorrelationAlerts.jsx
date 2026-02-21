import React from "react";

/**
 * Renders correlation alerts list.
 */
export default function CorrelationAlerts({ alerts = [] }) {
  return (
    <section className="card card-bordered p-4">
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Correlation Alerts</h3>
        <span className="badge">{alerts.length}</span>
      </header>

      {alerts.length === 0 ? (
        <p className="text-sm opacity-70">No active correlation alerts.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {alerts.map((alert) => (
            <li key={alert.id} className="rounded border p-2">
              <div className="flex items-center justify-between">
                <strong>{alert.id}</strong>
                <span className={`badge badge-${String(alert.severity || "medium").toLowerCase()}`}>
                  {alert.severity}
                </span>
              </div>
              <p className="mt-1 opacity-80">Action: {alert.action}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
