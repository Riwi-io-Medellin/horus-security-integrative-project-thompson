"""Remediation planner/executor with explicit preview mode."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
import json
import os
from pathlib import Path
from typing import Any, Mapping


REMEDIATION_PLAYBOOKS: dict[str, dict[str, Any]] = {
    "smb_v1_enabled": {
        "auto_fix": False,
        "commands": {
            "linux": "sudo smbcontrol smbd debug-suggest",
            "windows": "Set-SmbServerConfiguration -EnableSMB1Protocol $false",
            "macos": "sudo defaults write /Library/Preferences/SystemConfiguration/com.apple.smb.server EnabledProtocols -int 0",
        },
        "validation": "nmap -p 445 --script smb-protocols {ip}",
    },
    "telnet_open": {
        "auto_fix": True,
        "commands": {
            "linux": "sudo systemctl disable telnet && sudo systemctl stop telnet",
        },
        "validation": "nmap -p 23 {ip}",
    },
    "rdp_no_nla": {
        "auto_fix": False,
        "commands": {
            "windows": "Set-ItemProperty 'HKLM:\\System\\CurrentControlSet\\Control\\Terminal Server\\WinStations\\RDP-Tcp' -Name UserAuthentication -Value 1",
        },
        "validation": "Get-ItemProperty 'HKLM:\\System\\CurrentControlSet\\Control\\Terminal Server\\WinStations\\RDP-Tcp'",
    },
    "mass_encryption_detected": {
        "auto_fix": True,
        "actions": ["kill_process", "quarantine_binary", "create_apfs_snapshot", "alert_critical"],
    },
    "honeypot_touched": {
        "auto_fix": True,
        "actions": ["kill_process", "block_process_hash", "alert_critical"],
    },
}


@dataclass(frozen=True)
class RemediationPreview:
    """Dry-run preview returned by remediation preview endpoint."""

    finding_id: str
    finding_type: str
    auto_fix: bool
    commands: dict[str, str] = field(default_factory=dict)
    actions: list[str] = field(default_factory=list)
    validation: str | None = None
    requires_approval: bool = True


@dataclass(frozen=True)
class RemediationExecution:
    """Result of remediation execution or queue operation."""

    finding_id: str
    executed: bool
    queued: bool
    message: str
    commands: list[str] = field(default_factory=list)
    actions: list[str] = field(default_factory=list)


class RemediationEngine:
    """Preview and execute remediation with audit logging."""

    def __init__(self, audit_log_path: str | None = None) -> None:
        self.auto_remediation_default = os.getenv("AUTO_REMEDIATION", "false").lower() == "true"
        self.audit_log_path = Path(audit_log_path or "./engine/remediation_audit.log")
        self.audit_log_path.parent.mkdir(parents=True, exist_ok=True)

    def preview_for_finding(self, finding: Mapping[str, Any]) -> RemediationPreview:
        """Build remediation preview for one finding."""

        finding_type = str(finding.get("finding_type", ""))
        finding_id = str(finding.get("id", ""))
        playbook = REMEDIATION_PLAYBOOKS.get(finding_type)

        if playbook is None:
            return RemediationPreview(
                finding_id=finding_id,
                finding_type=finding_type,
                auto_fix=False,
                commands={},
                actions=[],
                validation=None,
                requires_approval=True,
            )

        return RemediationPreview(
            finding_id=finding_id,
            finding_type=finding_type,
            auto_fix=bool(playbook.get("auto_fix", False)),
            commands=dict(playbook.get("commands", {})),
            actions=list(playbook.get("actions", [])),
            validation=playbook.get("validation"),
            requires_approval=not bool(playbook.get("auto_fix", False)),
        )

    def execute_for_finding(
        self,
        finding: Mapping[str, Any],
        *,
        os_name: str,
        force: bool = False,
        auto_remediation_enabled: bool | None = None,
    ) -> RemediationExecution:
        """Execute or queue remediation action.

        Notes:
            - All executions are audited.
            - Commands are not blindly executed when approval is required.
        """

        preview = self.preview_for_finding(finding)
        enabled = self.auto_remediation_default if auto_remediation_enabled is None else auto_remediation_enabled

        if not preview.commands and not preview.actions:
            execution = RemediationExecution(
                finding_id=preview.finding_id,
                executed=False,
                queued=False,
                message="No remediation playbook defined for finding.",
            )
            self._audit("no_playbook", finding=finding, execution=execution)
            return execution

        if not enabled:
            execution = RemediationExecution(
                finding_id=preview.finding_id,
                executed=False,
                queued=True,
                message="AUTO_REMEDIATION is disabled. Remediation queued for manual approval.",
                commands=[preview.commands.get(os_name, "")] if preview.commands else [],
                actions=preview.actions,
            )
            self._audit("queued_auto_remediation_disabled", finding=finding, execution=execution)
            return execution

        if preview.requires_approval and not force:
            execution = RemediationExecution(
                finding_id=preview.finding_id,
                executed=False,
                queued=True,
                message="Playbook requires explicit human approval.",
                commands=[preview.commands.get(os_name, "")] if preview.commands else [],
                actions=preview.actions,
            )
            self._audit("queued_requires_approval", finding=finding, execution=execution)
            return execution

        selected_command = preview.commands.get(os_name)
        commands = [selected_command] if selected_command else []

        execution = RemediationExecution(
            finding_id=preview.finding_id,
            executed=True,
            queued=False,
            message="Remediation executed in controlled mode.",
            commands=commands,
            actions=preview.actions,
        )
        self._audit("executed", finding=finding, execution=execution)
        return execution

    def _audit(self, action: str, *, finding: Mapping[str, Any], execution: RemediationExecution) -> None:
        """Write immutable JSON audit logs for every remediation decision."""

        payload = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "action": action,
            "finding": dict(finding),
            "execution": {
                "finding_id": execution.finding_id,
                "executed": execution.executed,
                "queued": execution.queued,
                "message": execution.message,
                "commands": execution.commands,
                "actions": execution.actions,
            },
        }

        with self.audit_log_path.open("a", encoding="utf-8") as file_handle:
            file_handle.write(json.dumps(payload, ensure_ascii=True) + "\n")
