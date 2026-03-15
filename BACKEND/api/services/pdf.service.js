/**
 * PDF Service
 * 
 * Responsible for generating PDF reports based on simulation
 * results and findings.
 */
async function getPdfKit() {
    const pdfModule = await import("pdfkit");
    return pdfModule.default || pdfModule;
}

export async function generatePDFReport(aiReport, simulationMeta) {
    try {
        if (!aiReport || typeof aiReport !== "object") {
            throw new Error("AI analysis is invalid or does not exist");
        }

        const PDFDocument = await getPdfKit();

        const target = simulationMeta?.target || "Target not specified";
        const scanDate = simulationMeta?.scan_date
            ? new Date(simulationMeta.scan_date).toLocaleDateString("en-US")
            : new Date().toLocaleDateString("en-US");
        const projectName = simulationMeta?.project_name || "Security Assessment";

        const riskScore = Number.isFinite(Number(aiReport.risk_score)) ? Number(aiReport.risk_score) : 0;
        const riskCategory = getRiskCategory(riskScore);
        const riskColor = getSeverityColor(riskCategory.toLowerCase());

        const doc = new PDFDocument({
            size: "A4",
            margin: 50
        });

        const chunks = [];

        return await new Promise((resolve, reject) => {
            doc.on("data", (chunk) => chunks.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(chunks)));
            doc.on("error", (err) => reject(err));

            // Portada
            doc
                .fillColor("#0f172a")
                .fontSize(24)
                .font("Helvetica-Bold")
                .text("HORUS SECURITY", { align: "center" });

            doc.moveDown(0.5);

            doc
                .fontSize(14)
                .font("Helvetica")
                .fillColor("#6b7280")
                .text("Cybersecurity Report", { align: "center" });

            doc.moveDown(2);

            doc
                .fontSize(11)
                .fillColor("#374151")
                .text(`Project: ${projectName}`)
                .moveDown(0.5)
                .text(`Analyzed target: ${target}`)
                .moveDown(0.5)
                .text(`Scan date: ${scanDate}`);

            doc.moveDown(2);

            // Resumen ejecutivo
            doc
                .fontSize(18)
                .fillColor("#0f172a")
                .font("Helvetica-Bold")
                .text("Executive Summary");

            doc.moveDown(0.5);

            doc
                .fontSize(11)
                .font("Helvetica")
                .fillColor("#374151")
                .text(String(aiReport.executive_summary || "No summary available."), {
                    align: "justify"
                });

            doc.moveDown(1);

            // Risk indicator
            const startY = doc.y + 10;
            doc
                .roundedRect(doc.x, startY, 260, 30, 6)
                .fillAndStroke(riskColor || "#3b82f6", "#e5e7eb");

            doc
                .fillColor("#ffffff")
                .fontSize(12)
                .font("Helvetica-Bold")
                .text(`Overall risk: ${riskCategory.toUpperCase()} (${riskScore}/100)`, doc.x + 10, startY + 8);

            doc.moveDown(3);

            // Vulnerabilidades principales
            const vulnerabilities = Array.isArray(aiReport.vulnerabilities) ? aiReport.vulnerabilities : [];

            doc
                .fillColor("#0f172a")
                .fontSize(16)
                .font("Helvetica-Bold")
                .text("Detected Vulnerabilities");

            doc.moveDown(0.3);

            doc
                .fontSize(9)
                .font("Helvetica")
                .fillColor("#6b7280")
                .text(
                    "A vulnerability is a weakness in a system that could be exploited by " +
                    "an attacker to gain unauthorized access, steal information, or cause damage. " +
                    "Below are the findings with clear explanations of what they mean, " +
                    "their impact, and what actions you should take.",
                    { align: "justify" }
                );

            doc.moveDown(0.5);

            if (vulnerabilities.length === 0) {
                doc
                    .fontSize(11)
                    .font("Helvetica")
                    .fillColor("#374151")
                    .text("No vulnerabilities were detected during the analysis.");
            } else {
                vulnerabilities.slice(0, 10).forEach((vuln, index) => {
                    const severity = String(vuln.severity || "medium").toLowerCase();
                    const color = getSeverityColor(severity);
                    const title = vuln.title || `Vulnerability ${index + 1}`;
                    const component = vuln.affected_component || "Unspecified component";

                    if (doc.y > 650) doc.addPage();

                    doc.moveDown(0.8);

                    doc
                        .fontSize(12)
                        .font("Helvetica-Bold")
                        .fillColor("#0f172a")
                        .text(`${index + 1}. ${title}`, { continued: true })
                        .fillColor(color)
                        .text(`  [${severity.toUpperCase()}]`);

                    doc
                        .fontSize(9)
                        .font("Helvetica")
                        .fillColor("#4b5563")
                        .text(`Affected component: ${component}`);

                    doc.moveDown(0.3);

                    if (vuln.plain_description) {
                        doc
                            .fontSize(9)
                            .font("Helvetica-Bold")
                            .fillColor("#1e3a5f")
                            .text("What does this mean?");

                        doc
                            .font("Helvetica")
                            .fontSize(9)
                            .fillColor("#374151")
                            .text(String(vuln.plain_description), { align: "justify" });

                        doc.moveDown(0.2);
                    }

                    if (vuln.business_impact) {
                        doc
                            .fontSize(9)
                            .font("Helvetica-Bold")
                            .fillColor("#7f1d1d")
                            .text("Impact on your organization:");

                        doc
                            .font("Helvetica")
                            .fontSize(9)
                            .fillColor("#991b1b")
                            .text(String(vuln.business_impact), { align: "justify" });

                        doc.moveDown(0.2);
                    }

                    if (vuln.what_to_do) {
                        doc
                            .fontSize(9)
                            .font("Helvetica-Bold")
                            .fillColor("#166534")
                            .text("What you should do:");

                        doc
                            .font("Helvetica")
                            .fontSize(9)
                            .fillColor("#15803d")
                            .text(String(vuln.what_to_do), { align: "justify" });
                    }

                    if (vuln.description && !vuln.plain_description) {
                        doc
                            .moveDown(0.1)
                            .fontSize(9)
                            .font("Helvetica")
                            .fillColor("#374151")
                            .text(String(vuln.description), { align: "justify" });
                    }
                });
            }

            const recommendations = Array.isArray(aiReport.recommendations) ? aiReport.recommendations : [];
            const remediationActivity = Array.isArray(aiReport.remediation_activity) ? aiReport.remediation_activity : [];
            const remediationExecuted = remediationActivity.some((item) => Boolean(item?.executed));
            const remediationBlindajeExplanation = String(aiReport.remediation_blindaje_explanation || "").trim();

            if (remediationExecuted) {
                doc.addPage();

                doc
                    .fillColor("#0f172a")
                    .fontSize(16)
                    .font("Helvetica-Bold")
                    .text("Protection Applied by HORUS");

                doc.moveDown(0.4);

                doc
                    .fontSize(9)
                    .font("Helvetica")
                    .fillColor("#374151")
                    .text(
                        remediationBlindajeExplanation ||
                        "The tool executed remediations to contain and close the detected breach, reducing the active attack surface.",
                        { align: "justify" }
                    );
            } else {
                doc.addPage();

                // Recomendaciones
                doc
                    .fillColor("#0f172a")
                    .fontSize(16)
                    .font("Helvetica-Bold")
                    .text("Mitigation Recommendations");

                doc.moveDown(0.5);

                if (recommendations.length === 0) {
                    doc
                        .fontSize(11)
                        .font("Helvetica")
                        .fillColor("#374151")
                        .text("No specific recommendations were recorded in the analysis.");
                } else {
                    recommendations.forEach((rec, index) => {
                        const title = rec.title || rec.action || `Recommendation ${index + 1}`;
                        const description = rec.description || rec.details || "No details available.";

                        doc
                            .moveDown(0.8)
                            .fontSize(11)
                            .font("Helvetica-Bold")
                            .fillColor("#166534")
                            .text(`${index + 1}. ${title}`);

                        doc
                            .moveDown(0.1)
                            .fontSize(9)
                            .font("Helvetica")
                            .fillColor("#15803d")
                            .text(String(description), { align: "justify" });
                    });
                }
            }

            if (remediationActivity.length > 0) {
                doc.addPage();

                doc
                    .fillColor("#0f172a")
                    .fontSize(16)
                    .font("Helvetica-Bold")
                    .text("Remediation Actions Executed by HORUS");

                doc.moveDown(0.4);

                doc
                    .fontSize(9)
                    .font("Helvetica")
                    .fillColor("#374151")
                    .text(
                        "This section summarizes the remediation actions recorded by the tool. " +
                        "It explains what HORUS did to correct or contain the detected problem.",
                        { align: "justify" }
                    );

                remediationActivity.slice(0, 12).forEach((item, index) => {
                    if (doc.y > 690) {
                        doc.addPage();
                    }

                    const statusLabel = item.executed
                        ? "EXECUTED"
                        : item.queued
                            ? "QUEUED"
                            : "REGISTERED";

                    const statusColor = item.executed
                        ? "#166534"
                        : item.queued
                            ? "#92400e"
                            : "#1f2937";

                    const title = item.finding_type || "finding";
                    const timestamp = item.timestamp
                        ? new Date(item.timestamp).toLocaleString("en-US")
                        : "--";
                    const explanation = item.explanation || item.message || "No detail.";
                    const commands = Array.isArray(item.commands) ? item.commands.filter(Boolean) : [];
                    const actions = Array.isArray(item.actions) ? item.actions.filter(Boolean) : [];

                    doc
                        .moveDown(0.8)
                        .fontSize(11)
                        .font("Helvetica-Bold")
                        .fillColor(statusColor)
                        .text(String(index + 1) + ". " + title + " [" + statusLabel + "]");

                    doc
                        .moveDown(0.1)
                        .fontSize(9)
                        .font("Helvetica")
                        .fillColor("#374151")
                        .text("Date: " + timestamp)
                        .text("Detail: " + String(explanation), { align: "justify" });

                    if (commands.length > 0) {
                        doc
                            .moveDown(0.1)
                            .fontSize(9)
                            .font("Helvetica")
                            .fillColor("#1f2937")
                            .text("Commands: " + commands.join(" | "), { align: "justify" });
                    }

                    if (actions.length > 0) {
                        doc
                            .moveDown(0.1)
                            .fontSize(9)
                            .font("Helvetica")
                            .fillColor("#1f2937")
                            .text("Actions: " + actions.join(", "), { align: "justify" });
                    }
                });
            }

            doc.addPage();

            // Disclaimer
            doc
                .fontSize(13)
                .font("Helvetica-Bold")
                .fillColor("#78350f")
                .text("Legal Notice and Disclaimer");

            doc.moveDown(0.5);

            const disclaimerText = [
                "This report has been generated through an automated security analysis performed by HORUS SECURITY.",
                "The use of this tool should only be carried out on systems over which explicit authorization is held.",
                "Misuse of this software may violate cybersecurity and privacy laws.",
                "While the analysis uses artificial intelligence and specialized tools, it does not guarantee the detection of all existing vulnerabilities.",
                "It is recommended to supplement this report with manual audits performed by certified professionals.",
                "This document contains sensitive information about the security of the analyzed system and should be treated confidentially."
            ];

            doc
                .fontSize(9)
                .font("Helvetica")
                .fillColor("#92400e")
                .list(disclaimerText, { bulletRadius: 2 });

            doc.end();
        });
    } catch (error) {
        throw new Error(`Failed to generate PDF report: ${error.message}`);
    }
}

export function validateReportData(aiReport) {
    if (!aiReport.analysis_metadata) {
        return { valid: false, error: "Missing analysis_metadata" };
    }

    if (!aiReport.executive_summary) {
        return { valid: false, error: "Missing executive_summary" };
    }

    if (!Array.isArray(aiReport.vulnerabilities)) {
        return { valid: false, error: "Missing vulnerabilities array" };
    }

    if (!Array.isArray(aiReport.recommendations)) {
        return { valid: false, error: "Missing recommendations array" };
    }

    if (typeof aiReport.risk_score !== "number") {
        return { valid: false, error: "Missing or invalid risk_score" };
    }

    return { valid: true };
}

export function getRiskCategory(score) {
    if (score >= 80) return "Critical";
    if (score >= 60) return "High";
    if (score >= 40) return "Medium";
    return "Low";
}

export function getSeverityColor(severity) {
    const colors = {
        low: "#22c55e",
        medium: "#f59e0b",
        high: "#ef4444",
        critical: "#991b1b"
    };

    return colors[String(severity || "").toLowerCase()] || "#6b7280";
}
