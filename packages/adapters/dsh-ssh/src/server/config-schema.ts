import type { AdapterConfigSchema } from "@paperclipai/adapter-utils";

export function getConfigSchema(): AdapterConfigSchema {
  return {
    fields: [
      {
        key: "labOnly",
        label: "Enable lab-only adapter",
        type: "toggle",
        required: true,
        hint: "This experimental adapter is disabled unless explicitly enabled.",
      },
      { key: "host", label: "SSH host", type: "text", required: true },
      { key: "port", label: "SSH port", type: "number", default: 22, required: true },
      { key: "username", label: "SSH username", type: "text", required: true },
      {
        key: "privateKey",
        label: "SSH private key",
        type: "textarea",
        hint: "Optional resolved secret value. Omit to use the Paperclip host SSH agent.",
        meta: { secret: true },
      },
      {
        key: "knownHosts",
        label: "Known hosts",
        type: "textarea",
        required: true,
        hint: "Resolved known_hosts value.",
        meta: { secret: true },
      },
      { key: "strictHostKeyChecking", label: "Strict host-key checking", type: "toggle", default: true },
      { key: "labStateRoot", label: "Lab state root", type: "text", required: true },
      { key: "principal", label: "Trusted principal", type: "text", required: true },
      { key: "dshLabRoot", label: "DSH lab root", type: "text" },
      { key: "timeoutMs", label: "Run timeout (ms)", type: "number", default: 3_600_000, required: true, hint: "Allowed range: 100–3,600,000 ms." },
      {
        key: "synthetic",
        label: "Synthetic lab profile",
        type: "toggle",
        default: false,
        hint: "Required before selecting a synthetic runner mode.",
      },
      {
        key: "mode",
        label: "Synthetic mode",
        type: "select",
        options: [
          { value: "finish", label: "Finish" },
          { value: "hang", label: "Hang" },
        ],
        hint: "Only for an explicit synthetic lab configuration.",
      },
    ],
  };
}
