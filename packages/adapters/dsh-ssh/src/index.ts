import type { ServerAdapterModule } from "@paperclipai/adapter-utils";
import { getConfigSchema } from "./server/config-schema.js";
import { execute } from "./server/execute.js";
import { testEnvironment } from "./server/test.js";

export const type = "dsh_ssh";
export const label = "DSH SSH (draft-2 lab)";
export const models = [{ id: "gpt-5.6-luna", label: "GPT-5.6 Luna (router-smit)" }];

export const agentConfigurationDoc = `# dsh_ssh agent configuration

Experimental external lab adapter for dsh-paperclip-runner/draft-2 over SSH.

It is disabled unless \`labOnly: true\` is configured. The VPS runner fixes the router-smit/gpt-5.6-luna profile, Paperclip API authority, and executable, and accepts a run-scoped Paperclip JWT only through the start request. Configure an SSH host, trusted runner command, private lab state root, and fixed principal. Resolved \`privateKey\` and \`knownHosts\` values are secrets and must never be included in task text or logs.
`;

export function createServerAdapter(): ServerAdapterModule {
  return {
    type,
    execute,
    testEnvironment,
    models,
    supportsLocalAgentJwt: true,
    supportsInstructionsBundle: false,
    requiresMaterializedRuntimeSkills: false,
    agentConfigurationDoc,
    getConfigSchema,
  };
}
