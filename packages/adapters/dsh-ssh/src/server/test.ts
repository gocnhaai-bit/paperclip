import type {
  AdapterEnvironmentCheck,
  AdapterEnvironmentTestContext,
  AdapterEnvironmentTestResult,
} from "@paperclipai/adapter-utils";
import { resolveConfig } from "./execute.js";

function status(checks: AdapterEnvironmentCheck[]): AdapterEnvironmentTestResult["status"] {
  return checks.some((check) => check.level === "error") ? "fail" : checks.some((check) => check.level === "warn") ? "warn" : "pass";
}

export async function testEnvironment(ctx: AdapterEnvironmentTestContext): Promise<AdapterEnvironmentTestResult> {
  const checks: AdapterEnvironmentCheck[] = [];
  const resolved = resolveConfig(ctx.config);
  if (typeof resolved === "string") {
    checks.push({ code: "dsh_ssh_config_invalid", level: "error", message: resolved });
  }
  checks.push({ code: "dsh_ssh_same_uid_boundary", level: "warn", message: "The lab uses same-UID process isolation, not a security sandbox; real provider and production use remain approval-gated." });
  checks.push({ code: "dsh_ssh_static_check_only", level: "info", message: "Configuration was validated without connecting to or starting the lab runner." });
  return { adapterType: ctx.adapterType, status: status(checks), checks, testedAt: new Date().toISOString() };
}
