import React, { useEffect, useMemo, useState } from "react";
import CorrelationAlerts from "../../components/new/CorrelationAlerts";
import EndpointStatus from "../../components/new/EndpointStatus";
import RemediationPanel from "../../components/new/RemediationPanel";
import RiskScore from "../../components/new/RiskScore";

/**
 * Unified dashboard page for network + endpoint security.
 */
export default function UnifiedDashboard() {
  const [risk, setRisk] = useState({ score: 0 });
  const [findings, setFindings] = useState([]);
  const [correlations, setCorrelations] = useState([]);

  const selectedFinding = useMemo(() => findings[0] ?? null, [findings]);

  useEffect(() => {
    const load = async () => {
      const [riskRes, findingsRes, corrRes] = await Promise.all([
        fetch("/api/v2/risk-score").then((res) => res.json()).catch(() => ({ risk: { score: 0 } })),
        fetch("/api/v2/findings").then((res) => res.json()).catch(() => ({ items: [] })),
        fetch("/api/v2/correlations").then((res) => res.json()).catch(() => ({ items: [] })),
      ]);

      setRisk(riskRes.risk ?? { score: 0 });
      setFindings(findingsRes.items ?? []);
      setCorrelations(corrRes.items ?? []);
    };

    load();
  }, []);

  const handlePreview = async (finding) => {
    await fetch(`/api/v2/remediation/preview/${finding.id}`).catch(() => null);
  };

  const handleExecute = async (finding) => {
    await fetch(`/api/v2/remediate/${finding.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ os_name: "linux", force: false }),
    }).catch(() => null);
  };

  return (
    <main className="container mx-auto grid gap-4 p-4 lg:grid-cols-2">
      <RiskScore score={risk.score ?? 0} />
      <EndpointStatus endpoint={risk.endpoint_features ?? {}} />
      <CorrelationAlerts alerts={correlations} />
      <RemediationPanel finding={selectedFinding} onPreview={handlePreview} onExecute={handleExecute} />
    </main>
  );
}
