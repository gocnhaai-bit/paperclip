// @vitest-environment jsdom

import type { ReactNode } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type {
  CompanySkillDetail,
  CompanySkillLastEditor,
  CompanySkillListItem,
} from "@paperclipai/shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/client";
import { SkillStudio } from "./SkillStudio";

const routeState = vi.hoisted(() => ({
  pathname: "/skills/studio/new",
  search: "",
  skillId: "new" as string | undefined,
}));

const mockNavigate = vi.hoisted(() => vi.fn());
const mockSetBreadcrumbs = vi.hoisted(() => vi.fn());
const mockPushToast = vi.hoisted(() => vi.fn());
vi.mock("@/context/ToastContext", () => ({
  useOptionalToastActions: () => ({ pushToast: mockPushToast }),
}));

const mockCompanySkillsApi = vi.hoisted(() => ({
  list: vi.fn(),
  detail: vi.fn(),
  create: vi.fn(),
  file: vi.fn(),
  updateFile: vi.fn(),
  deleteFile: vi.fn(),
  testInputs: vi.fn(),
  updateTestInput: vi.fn(),
  deleteTestInput: vi.fn(),
  createTestInput: vi.fn(),
  testRunTemplates: vi.fn(),
  testRuns: vi.fn(),
  createTestRunTemplate: vi.fn(),
  updateTestRunTemplate: vi.fn(),
  deleteTestRunTemplate: vi.fn(),
  createTestRun: vi.fn(),
  testRunDetail: vi.fn(),
  cancelTestRun: vi.fn(),
  deleteTestRun: vi.fn(),
  versions: vi.fn(),
  createVersion: vi.fn(),
}));
const mockAgentsApi = vi.hoisted(() => ({
  list: vi.fn(),
}));
const mockIssuesApi = vi.hoisted(() => ({
  listInteractions: vi.fn(),
  acceptInteraction: vi.fn(),
  respondToInteraction: vi.fn(),
  rejectInteraction: vi.fn(),
}));

vi.mock("@/lib/router", () => ({
  Link: ({ children, to, ...props }: { children: ReactNode; to: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
  useLocation: () => ({ pathname: routeState.pathname, search: routeState.search, hash: "" }),
  useNavigate: () => mockNavigate,
  useParams: () => ({ skillId: routeState.skillId }),
  useSearchParams: () => [new URLSearchParams(routeState.search), vi.fn()],
}));

vi.mock("@/context/BreadcrumbContext", () => ({
  useBreadcrumbs: () => ({ setBreadcrumbs: mockSetBreadcrumbs }),
}));

vi.mock("../context/CompanyContext", () => ({
  useCompany: () => ({ selectedCompanyId: "company-1" }),
}));

vi.mock("@/api/companySkills", () => ({
  companySkillsApi: mockCompanySkillsApi,
}));

vi.mock("@/api/agents", () => ({
  agentsApi: mockAgentsApi,
}));

vi.mock("@/api/issues", () => ({
  issuesApi: mockIssuesApi,
}));

vi.mock("@/components/SearchableSelect", () => ({
  SearchableSelect: ({
    placeholder,
    renderValue,
  }: {
    placeholder: string;
    renderValue?: (option: null) => ReactNode;
  }) => <button type="button">{renderValue ? renderValue(null) : placeholder}</button>,
}));

vi.mock("@/components/MarkdownEditor", () => ({
  MarkdownEditor: ({
    value,
    onChange,
    readOnly,
  }: {
    value: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
  }) => (
    <textarea
      data-testid="markdown-editor"
      readOnly={readOnly}
      value={value}
      onChange={(event) => {
        if (!readOnly) onChange(event.target.value);
      }}
      onKeyDown={(event) => {
        if (!readOnly && event.key === "E") {
          onChange(`${value}\n\nEdited body\n`);
        }
      }}
    />
  ),
}));

vi.mock("@/components/MarkdownBody", () => ({
  MarkdownBody: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/resizable-panels", () => ({
  ResizablePanelGroup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  ResizablePanel: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  ResizableHandle: () => <div />,
}));

vi.mock("./CompanySkills", () => ({
  SkillCardIcon: ({ card }: { card: { name: string } }) => (
    <div data-testid="skill-card-icon">{card.name}</div>
  ),
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let container: HTMLDivElement | null = null;

async function act(callback: () => void | Promise<void>) {
  let result: void | Promise<void> = undefined;
  flushSync(() => {
    result = callback();
  });
  await result;
}

/**
 * Waits on the condition, not on a fixed number of turns. A hand-rolled retry
 * loop is ample on an idle machine and not when the suite runs many workers in
 * parallel: it gives up after N turns and reports a failure on behaviour that
 * works. `vi.waitFor` retries against a time budget, so a loaded worker gets
 * more turns instead.
 *
 * Same replacement as #11499 and #11521, which fixed the shorter-budget
 * instances of this in the routing tests.
 *
 * This was a reimplementation of `vi.waitFor` down to rethrowing the last
 * error, differing only in bounding on turns rather than on time.
 */
async function waitFor(assertion: () => void) {
  await vi.waitFor(assertion);
}

async function renderStudio(queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
})) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);

  await act(async () => {
    root?.render(
      <QueryClientProvider client={queryClient}>
        <SkillStudio />
      </QueryClientProvider>,
    );
  });

  return container;
}

async function inputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  await act(async () => {
    const proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    setter?.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

async function click(button: HTMLButtonElement) {
  await act(async () => {
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

async function keyDown(element: HTMLElement, key: string) {
  await act(async () => {
    element.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key }));
  });
}

function makeSkill(overrides: Partial<CompanySkillDetail> = {}): CompanySkillDetail {
  return {
    id: "source-skill",
    companyId: "company-1",
    key: "paperclip/demo-skill",
    slug: "demo-skill",
    name: "Demo Skill",
    description: "A demo skill.",
    markdown: "---\nname: Demo Skill\ndescription: Existing\n---\n\n# Demo Skill\n",
    sourceType: "local_path",
    sourceLocator: null,
    sourceRef: null,
    trustLevel: "markdown_only",
    compatibility: "compatible",
    fileInventory: [{ path: "SKILL.md", kind: "skill" }],
    iconUrl: null,
    color: null,
    tagline: "Existing tagline",
    authorName: null,
    homepageUrl: null,
    categories: ["engineering"],
    sharingScope: "company",
    publicShareToken: null,
    forkedFromSkillId: null,
    forkedFromCompanyId: null,
    starCount: 0,
    installCount: 0,
    forkCount: 0,
    currentVersionId: null,
    metadata: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-02T00:00:00Z"),
    attachedAgentCount: 0,
    usedByAgents: [],
    editable: true,
    editableReason: null,
    sourceLabel: "Local",
    sourceBadge: "local",
    sourcePath: null,
    currentVersion: null,
    starredByCurrentActor: false,
    existingForks: [],
    ...overrides,
  };
}

function buttonsNamed(node: ParentNode, name: string) {
  return Array.from(node.querySelectorAll("button")).filter((button) =>
    button.textContent?.trim() === name,
  );
}

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(() => window.innerWidth);
  vi.stubGlobal("ResizeObserver", class {
    observe() {}
    disconnect() {}
  });
  routeState.pathname = "/skills/studio/new";
  routeState.search = "";
  routeState.skillId = "new";
  mockNavigate.mockReset();
  mockSetBreadcrumbs.mockReset();
  mockCompanySkillsApi.list.mockResolvedValue([]);
  mockCompanySkillsApi.detail.mockResolvedValue(makeSkill());
  mockCompanySkillsApi.create.mockResolvedValue({
    id: "created-skill",
    name: "Code Review",
    forkedFromSkillId: null,
  });
  mockCompanySkillsApi.file.mockResolvedValue({
    path: "SKILL.md",
    content: "---\nname: Demo Skill\ndescription: Existing\n---\n\n# Demo Skill\n",
    markdown: true,
    editable: true,
    editableReason: null,
  });
  mockCompanySkillsApi.updateFile.mockResolvedValue({
    path: "SKILL.md",
    content: "---\nname: Demo Skill\ndescription: Existing\n---\n\n# Demo Skill\n",
    markdown: true,
    editable: true,
    editableReason: null,
  });
  mockCompanySkillsApi.deleteFile.mockResolvedValue({ deletedPaths: [] });
  mockCompanySkillsApi.testInputs.mockResolvedValue([]);
  mockCompanySkillsApi.updateTestInput.mockResolvedValue({ id: "input-1", name: "input.md", content: "" });
  mockCompanySkillsApi.deleteTestInput.mockResolvedValue({ id: "input-1" });
  mockCompanySkillsApi.createTestInput.mockResolvedValue({ id: "input-1", name: "input.md", content: "" });
  mockCompanySkillsApi.testRunTemplates.mockResolvedValue([]);
  mockCompanySkillsApi.testRuns.mockResolvedValue([]);
  mockCompanySkillsApi.createTestRunTemplate.mockResolvedValue({ id: "template-1", name: "Template" });
  mockCompanySkillsApi.updateTestRunTemplate.mockResolvedValue({ id: "template-1", name: "Template" });
  mockCompanySkillsApi.deleteTestRunTemplate.mockResolvedValue({ id: "template-1", name: "Template" });
  mockCompanySkillsApi.createTestRun.mockResolvedValue({ id: "run-1", status: "queued" });
  mockCompanySkillsApi.testRunDetail.mockResolvedValue(null);
  mockCompanySkillsApi.cancelTestRun.mockResolvedValue({ id: "run-1", status: "cancelled" });
  mockCompanySkillsApi.deleteTestRun.mockResolvedValue({ id: "run-1" });
  mockCompanySkillsApi.versions.mockResolvedValue([]);
  mockCompanySkillsApi.createVersion.mockResolvedValue({ id: "version-1" });
  mockAgentsApi.list.mockResolvedValue([]);
  mockIssuesApi.listInteractions.mockResolvedValue([]);
  mockIssuesApi.acceptInteraction.mockResolvedValue({});
  mockIssuesApi.respondToInteraction.mockResolvedValue({});
  mockIssuesApi.rejectInteraction.mockResolvedValue({});
});

afterEach(() => {
  root?.unmount();
  root = null;
  container?.remove();
  container = null;
  document.body.innerHTML = "";
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("SkillStudio create mode", () => {
  it("renders /skills/studio/new as create mode instead of loading skill id new", async () => {
    const node = await renderStudio();

    await waitFor(() => expect(node.textContent).toContain("Create a new skill"));

    expect(node.textContent).not.toContain("Skill not found.");
    expect(mockCompanySkillsApi.detail).not.toHaveBeenCalledWith("company-1", "new");
    expect(mockSetBreadcrumbs).toHaveBeenCalledWith([
      { label: "Skills", href: "/skills" },
      { label: "Studio", href: "/skills/studio" },
      { label: "New skill" },
    ]);
  });

  it("prefills fork drafts from the forkFrom query param", async () => {
    routeState.search = "?forkFrom=source-skill";

    const node = await renderStudio();

    await waitFor(() => expect(node.textContent).toContain("Forking Demo Skill"));

    expect(mockCompanySkillsApi.detail).toHaveBeenCalledWith("company-1", "source-skill");
    expect((node.querySelector("#skill-name") as HTMLInputElement).value).toBe("Demo Skill Fork");
    expect((node.querySelector("#skill-slug") as HTMLInputElement).value).toBe("demo-skill-fork");
  });

  it("creates a skill and navigates to the Studio editor for the new id", async () => {
    const node = await renderStudio();

    await waitFor(() => expect(node.querySelector("#skill-name")).toBeTruthy());
    await inputValue(node.querySelector("#skill-name") as HTMLInputElement, "Code Review");
    await click(buttonsNamed(node, "Create skill")[0] as HTMLButtonElement);

    await waitFor(() => expect(mockCompanySkillsApi.create).toHaveBeenCalled());

    expect(mockCompanySkillsApi.create).toHaveBeenCalledWith(
      "company-1",
      expect.objectContaining({
        name: "Code Review",
        slug: "code-review",
        sharingScope: "company",
        forkedFromSkillId: null,
      }),
    );
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/skills/studio/created-skill"));
  });

  it("forwards the folderId query param so the new skill is filed there (PAP-14086)", async () => {
    routeState.search = "?folderId=folder-my-skills";

    const node = await renderStudio();

    await waitFor(() => expect(node.querySelector("#skill-name")).toBeTruthy());
    await inputValue(node.querySelector("#skill-name") as HTMLInputElement, "Code Review");
    await click(buttonsNamed(node, "Create skill")[0] as HTMLButtonElement);

    await waitFor(() => expect(mockCompanySkillsApi.create).toHaveBeenCalled());

    expect(mockCompanySkillsApi.create).toHaveBeenCalledWith(
      "company-1",
      expect.objectContaining({
        name: "Code Review",
        folderId: "folder-my-skills",
      }),
    );
  });

  it("keeps category commas and spaces editable while creating a skill", async () => {
    const node = await renderStudio();

    await waitFor(() => expect(node.querySelector("#skill-categories")).toBeTruthy());
    await inputValue(node.querySelector("#skill-name") as HTMLInputElement, "Code Review");
    await inputValue(node.querySelector("#skill-categories") as HTMLInputElement, "AI Tools, Developer Experience, ");

    expect((node.querySelector("#skill-categories") as HTMLInputElement).value).toBe("AI Tools, Developer Experience, ");

    await click(buttonsNamed(node, "Create skill")[0] as HTMLButtonElement);
    await waitFor(() => expect(mockCompanySkillsApi.create).toHaveBeenCalled());

    expect(mockCompanySkillsApi.create).toHaveBeenCalledWith(
      "company-1",
      expect.objectContaining({
        categories: ["AI Tools", "Developer Experience"],
      }),
    );
  });
});

function makeListItem(
  overrides: Partial<CompanySkillListItem> & { id: string },
): CompanySkillListItem {
  return {
    companyId: "company-1",
    key: overrides.id,
    slug: overrides.id,
    name: overrides.id,
    description: null,
    sourceType: "local_path",
    sourceLocator: null,
    sourceRef: null,
    trustLevel: "markdown_only",
    compatibility: "compatible",
    fileInventory: [],
    iconUrl: null,
    color: null,
    tagline: null,
    authorName: null,
    homepageUrl: null,
    categories: [],
    sharingScope: "private",
    publicShareToken: null,
    forkedFromSkillId: null,
    forkedFromCompanyId: null,
    starCount: 0,
    installCount: 0,
    forkCount: 0,
    currentVersionId: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    attachedAgentCount: 0,
    editable: true,
    editableReason: null,
    sourceLabel: null,
    sourceBadge: "local",
    sourcePath: null,
    catalogKind: null,
    originHash: null,
    packageName: null,
    packageVersion: null,
    ...overrides,
  };
}

const userEditor = (name: string): CompanySkillLastEditor => ({
  kind: "user",
  id: `user-${name}`,
  name,
  imageUrl: null,
});
const agentEditor: CompanySkillLastEditor = {
  kind: "agent",
  id: "agent-1",
  name: "Bot",
  imageUrl: null,
};

function findRowButton(node: ParentNode, name: string): HTMLButtonElement | undefined {
  return Array.from(node.querySelectorAll("button")).find((button) =>
    button.textContent?.includes(name),
  ) as HTMLButtonElement | undefined;
}

describe("SkillStudio landing", () => {
  beforeEach(() => {
    routeState.pathname = "/skills/studio";
    routeState.search = "";
    routeState.skillId = undefined;
    localStorage.clear();
  });

  it("renders recently-visited and recently-updated sections, gating avatars to humans", async () => {
    localStorage.setItem("paperclip:recent-studio-skills", JSON.stringify(["visited-1"]));
    mockCompanySkillsApi.list.mockResolvedValue([
      makeListItem({
        id: "visited-1",
        name: "Visited One",
        updatedAt: new Date("2026-01-01T00:00:00Z"),
        lastEditor: userEditor("Ada Lovelace"),
      }),
      makeListItem({
        id: "agent-updated",
        name: "Agent Updated",
        updatedAt: new Date("2026-03-01T00:00:00Z"),
        lastEditor: agentEditor,
      }),
      makeListItem({
        id: "user-updated",
        name: "User Updated",
        updatedAt: new Date("2026-02-01T00:00:00Z"),
        lastEditor: userEditor("Grace Hopper"),
      }),
    ]);

    const node = await renderStudio();

    await waitFor(() => expect(node.textContent).toContain("Recently visited"));
    expect(node.textContent).toContain("Recently updated");

    // Visited section surfaces the visited skill; updated section excludes it.
    const visitedSection = Array.from(node.querySelectorAll("section")).find((s) =>
      s.querySelector("h2")?.textContent === "Recently visited",
    )!;
    const updatedSection = Array.from(node.querySelectorAll("section")).find((s) =>
      s.querySelector("h2")?.textContent === "Recently updated",
    )!;
    expect(visitedSection.textContent).toContain("Visited One");
    expect(updatedSection.textContent).not.toContain("Visited One");
    expect(updatedSection.textContent).toContain("Agent Updated");
    expect(updatedSection.textContent).toContain("User Updated");

    // Only the two human-edited rows render an avatar (initials fallback); the
    // agent-edited row renders none.
    const initials = Array.from(node.querySelectorAll('[data-slot="avatar-fallback"]')).map(
      (el) => el.textContent,
    );
    expect(initials).toEqual(["AL", "GH"]);
  });

  it("opens the clicked skill in Studio", async () => {
    mockCompanySkillsApi.list.mockResolvedValue([
      makeListItem({ id: "user-updated", name: "User Updated", lastEditor: userEditor("Grace Hopper") }),
    ]);

    const node = await renderStudio();

    await waitFor(() => expect(node.textContent).toContain("User Updated"));
    const row = findRowButton(node, "User Updated")!;
    await click(row);

    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining("user-updated"));
  });

  it("falls back to the empty state when there are no skills", async () => {
    mockCompanySkillsApi.list.mockResolvedValue([]);

    const node = await renderStudio();

    await waitFor(() => expect(node.textContent).toContain("Select a skill to open Studio."));
    expect(node.textContent).toContain("Create a new skill");
    expect(node.textContent).not.toContain("Recently updated");
  });

  it("shows the loading fallback while skills load", async () => {
    mockCompanySkillsApi.list.mockReturnValue(new Promise(() => {}));

    const node = await renderStudio();

    await waitFor(() => expect(node.textContent).toContain("Loading skills..."));
  });
});

describe("SkillStudio editor frontmatter", () => {
  beforeEach(() => {
    routeState.pathname = "/skills/studio/source-skill";
    routeState.search = "";
    routeState.skillId = "source-skill";
  });

  it("reports a rejected version restore without creating a version", async () => {
    mockCompanySkillsApi.versions.mockResolvedValue([{
      id: "version-restore", revisionNumber: 1, label: "Restore candidate", createdAt: new Date("2026-09-14"),
      fileInventory: [{ path: "SKILL.md", kind: "skill", content: "# Previous skill\n" }],
    }]);
    mockCompanySkillsApi.updateFile.mockRejectedValue(new ApiError("Restore denied", 403, { code: "skill_policy_denied" }));
    const node = await renderStudio();
    await waitFor(() => expect(buttonsNamed(node, "Version history")[0]).toBeTruthy());
    await click(buttonsNamed(node, "Version history")[0]);
    await waitFor(() => expect(buttonsNamed(document, "Restore as v2")[0]).toBeTruthy());
    await click(buttonsNamed(document, "Restore as v2")[0]);
    await waitFor(() => expect(mockPushToast).toHaveBeenCalledWith(expect.objectContaining({
      tone: "warn", title: "This action is restricted by your organization policy.",
    })));
    expect(mockCompanySkillsApi.createVersion).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain("Restore candidate");
  });

  it("updates the file cache after a successful save", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    mockCompanySkillsApi.updateFile.mockImplementation((_companyId, _skillId, path, content) => {
      const updated = { skillId: "source-skill", path, content, markdown: true, editable: true, kind: "skill", language: "markdown" };
      mockCompanySkillsApi.file.mockResolvedValue(updated);
      return Promise.resolve(updated);
    });
    const node = await renderStudio(client);
    await waitFor(() => expect(node.querySelector<HTMLTextAreaElement>('[data-testid="markdown-editor"]')?.value).toContain("# Demo Skill"));
    await keyDown(node.querySelector('[data-testid="markdown-editor"]')!, "E");
    await waitFor(() => expect(buttonsNamed(node, "Save").some((button) => !button.disabled)).toBe(true));
    await click(buttonsNamed(node, "Save").find((button) => !button.disabled)!);
    await waitFor(() => expect(client.getQueryData<{ content: string }>(["company-skills", "company-1", "source-skill", "file", "SKILL.md"])?.content).toContain("Edited body"));
    expect(node.textContent).not.toContain("Unsaved edits");
  });

  it("clears editor state when opening a different skill", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const node = await renderStudio(client);
    await waitFor(() => expect(node.querySelector<HTMLTextAreaElement>('[data-testid="markdown-editor"]')?.value).toContain("# Demo Skill"));
    await keyDown(node.querySelector('[data-testid="markdown-editor"]')!, "E");
    await waitFor(() => expect(node.textContent).toContain("Unsaved edits"));
    routeState.skillId = "other-skill";
    routeState.pathname = "/skills/studio/other-skill";
    mockCompanySkillsApi.detail.mockResolvedValue(makeSkill({ id: "other-skill", name: "Other skill" }));
    mockCompanySkillsApi.file.mockResolvedValue({ path: "SKILL.md", content: "# Other skill\n", markdown: true, editable: true });
    await act(() => {
      root!.render(<QueryClientProvider client={client}><SkillStudio /></QueryClientProvider>);
    });
    await waitFor(() => expect(node.querySelector<HTMLTextAreaElement>('[data-testid="markdown-editor"]')?.value).toContain("# Other skill"));
    expect(node.textContent).not.toContain("Unsaved edits");
    expect(node.querySelector<HTMLTextAreaElement>('[data-testid="markdown-editor"]')?.value).not.toContain("Edited body");
    expect(mockCompanySkillsApi.updateFile).not.toHaveBeenCalled();
  });

  it("uses tabs when sidebars leave insufficient width for three panes", async () => {
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(737);
    const node = await renderStudio();
    await waitFor(() => expect(node.querySelector('[role="tab"]')?.textContent).toBe("Skill"));
    expect(Array.from(node.querySelector('[role="tablist"]')!.querySelectorAll('[role="tab"]')).map((tab) => tab.textContent)).toEqual(["Skill", "Input", "Runs"]);
  });

  it("retains the file draft and explains an explicit policy denial", async () => {
    mockCompanySkillsApi.updateFile.mockRejectedValue(new ApiError("Denied", 403, {
      code: "skill_policy_denied", reason: "explicit_rule",
    }));
    const node = await renderStudio();
    await waitFor(() => expect(node.querySelector<HTMLTextAreaElement>('[data-testid="markdown-editor"]')?.value).toContain("# Demo Skill"));
    await keyDown(node.querySelector('[data-testid="markdown-editor"]')!, "E");
    await waitFor(() => expect(buttonsNamed(node, "Save").some((button) => !button.disabled)).toBe(true));
    await click(buttonsNamed(node, "Save").find((button) => !button.disabled)!);
    await waitFor(() => expect(mockPushToast).toHaveBeenCalledWith(expect.objectContaining({
      tone: "warn", title: "This action is restricted by your organization policy.",
      body: "An organization administrator can change the skill policy to allow this.",
    })));
    expect(node.querySelector<HTMLTextAreaElement>('[data-testid="markdown-editor"]')?.value).toContain("Edited body");
    expect(node.textContent).toContain("Unsaved edits");
  });

  it("announces saved input read failures", async () => {
    mockCompanySkillsApi.testInputs.mockRejectedValue(new Error("Saved inputs unavailable."));
    const node = await renderStudio();
    await waitFor(() => expect(node.querySelector('[role="alert"]')?.textContent).toContain("Saved inputs unavailable."));
    expect(mockCompanySkillsApi.createTestRun).not.toHaveBeenCalled();
  });

  it("does not claim empty run history when the request fails", async () => {
    mockCompanySkillsApi.testRuns.mockRejectedValue(new Error("Run history unavailable."));
    const node = await renderStudio();
    await waitFor(() => expect(node.querySelector('[role="alert"]')?.textContent).toContain("Run history unavailable."));
    expect(node.textContent).not.toContain("No test runs yet.");
  });

  it("announces a test run detail read failure instead of claiming it is missing", async () => {
    routeState.search = "?run=run-1";
    mockCompanySkillsApi.testRunDetail.mockRejectedValue(new Error("Run details unavailable."));
    const node = await renderStudio();
    await waitFor(() => expect(node.querySelector('[role="alert"]')?.textContent).toContain("Run details unavailable."));
    expect(node.textContent).not.toContain("Run not found.");
  });

  it("does not claim empty version history when the request fails", async () => {
    mockCompanySkillsApi.versions.mockRejectedValue(new Error("Version history unavailable."));
    const node = await renderStudio();
    await waitFor(() => expect(buttonsNamed(node, "Version history")[0]).toBeTruthy());
    await click(buttonsNamed(node, "Version history")[0]);
    await waitFor(() => expect(document.querySelector('[role="alert"]')?.textContent).toContain("Version history unavailable."));
    expect(document.body.textContent).not.toContain("No versions yet.");
  });

  it("keeps cached version rows after a failed refresh", async () => {
    mockCompanySkillsApi.versions.mockResolvedValue([{
      id: "version-cached", revisionNumber: 1, label: "Saved review", createdAt: new Date("2026-09-14"), fileInventory: [],
    }]);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const node = await renderStudio(client);
    await waitFor(() => expect(buttonsNamed(node, "Version history")[0]).toBeTruthy());
    await click(buttonsNamed(node, "Version history")[0]);
    await waitFor(() => expect(document.body.textContent).toContain("Saved review"));
    mockCompanySkillsApi.versions.mockRejectedValue(new Error("Versions refresh unavailable."));
    await act(async () => { await client.refetchQueries({ queryKey: ["company-skills", "company-1", "source-skill", "versions"], exact: true }); });
    await waitFor(() => expect(document.querySelector('[role="alert"]')?.textContent).toContain("Versions refresh unavailable."));
    expect(document.body.textContent).toContain("Saved review");
    expect(document.body.textContent).not.toContain("No versions yet.");
  });

  it("clears discarded edits when the next file fails to load", async () => {
    mockCompanySkillsApi.detail.mockResolvedValue(makeSkill({
      fileInventory: [{ path: "SKILL.md", kind: "skill" }, { path: "notes.txt", kind: "other" }],
    }));
    mockCompanySkillsApi.file.mockImplementation((_companyId, _skillId, path) => path === "notes.txt"
      ? Promise.reject(new Error("Notes unavailable."))
      : Promise.resolve({ path, content: "# Demo Skill\n", markdown: true, editable: true }));
    const node = await renderStudio();
    await waitFor(() => expect(node.querySelector<HTMLTextAreaElement>('[data-testid="markdown-editor"]')?.value).toContain("# Demo Skill"));
    await keyDown(node.querySelector('[data-testid="markdown-editor"]')!, "E");
    await waitFor(() => expect(node.textContent).toContain("Unsaved edits"));
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    try {
      const file = Array.from(node.querySelectorAll<HTMLElement>('[role="treeitem"]')).find((entry) => entry.textContent?.includes("notes.txt"))!;
      await act(() => { file.click(); });
      await waitFor(() => expect(node.textContent).toContain("Notes unavailable."));
      expect(node.textContent).not.toContain("Unsaved edits");
      expect(mockCompanySkillsApi.updateFile).not.toHaveBeenCalled();
    } finally { confirm.mockRestore(); }
  });

  it("announces a file read failure without presenting an editable blank file", async () => {
    mockCompanySkillsApi.file.mockRejectedValue(new Error("File could not be loaded."));
    const node = await renderStudio();
    await waitFor(() => expect(node.querySelector('[role="alert"]')?.textContent).toContain("File could not be loaded."));
    expect(node.querySelector('[data-testid="markdown-editor"]')).toBeNull();
    expect(buttonsNamed(node, "Save")[0]?.disabled).toBe(true);
  });

  it("retains an edited file after detail and file refresh failures", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
    const node = await renderStudio(client);
    let editor: HTMLTextAreaElement | null = null;
    await waitFor(() => {
      editor = node.querySelector('[data-testid="markdown-editor"]');
      expect(editor?.value).toContain("# Demo Skill");
    });
    await keyDown(editor!, "E");
    mockCompanySkillsApi.detail.mockRejectedValue(new Error("Skill refresh unavailable."));
    mockCompanySkillsApi.file.mockRejectedValue(new Error("File refresh unavailable."));
    await act(async () => { await client.refetchQueries({ queryKey: ["company-skills", "company-1", "source-skill"] }); });
    await waitFor(() => expect(node.querySelector('[role="alert"]')?.textContent).toContain("Skill refresh unavailable."));
    expect(node.querySelector('[data-testid="markdown-editor"]')).toBe(editor);
    expect(node.querySelector<HTMLTextAreaElement>('[data-testid="markdown-editor"]')?.value).toContain("Edited body");
    expect(node.textContent).toContain("Unsaved edits");
    expect(mockCompanySkillsApi.updateFile).not.toHaveBeenCalled();
  });

  it("keeps the skill draft when switching mobile panes", async () => {
    const previousWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
    try {
      const node = await renderStudio();
      let editor: HTMLTextAreaElement | null = null;
      await waitFor(() => {
        editor = node.querySelector('[data-testid="markdown-editor"]');
        expect(editor?.value).toContain("# Demo Skill");
      });
      await keyDown(editor!, "E");
      await waitFor(() => expect(editor?.value).toContain("Edited body"));
      const tabs = Array.from(node.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
      await act(() => { tabs.find((tab) => tab.textContent === "Input")!.focus(); });
      await waitFor(() => expect(node.querySelector('[data-state="active"][role="tab"]')?.textContent).toBe("Input"));
      await act(() => { tabs.find((tab) => tab.textContent === "Skill")!.focus(); });
      await waitFor(() => {
        expect(node.querySelector<HTMLTextAreaElement>('[data-testid="markdown-editor"]')?.value).toContain("Edited body");
      });
      expect(mockCompanySkillsApi.updateFile).not.toHaveBeenCalled();
    } finally {
      Object.defineProperty(window, "innerWidth", { configurable: true, value: previousWidth });
    }
  });

  it("does not show the frontmatter section when the selected markdown file has no frontmatter", async () => {
    mockCompanySkillsApi.file.mockResolvedValueOnce({
      path: "SKILL.md",
      content: "# Demo Skill\n\nNo YAML block here.\n",
      markdown: true,
      editable: true,
      editableReason: null,
    });

    const node = await renderStudio();

    await waitFor(() => {
      expect(mockCompanySkillsApi.file).toHaveBeenCalledWith("company-1", "source-skill", "SKILL.md");
    });
    await waitFor(() => {
      const textareas = Array.from(node.querySelectorAll("textarea"));
      expect(textareas.some((textarea) => textarea.value.includes("No YAML block here."))).toBe(true);
    });

    expect(node.querySelector('[data-testid="frontmatter-panel"]')).toBeNull();
    expect(node.textContent).not.toContain("Add frontmatter");
  });

  it("shows existing frontmatter collapsed by default", async () => {
    const node = await renderStudio();

    await waitFor(() => {
      expect(node.querySelector('[data-testid="frontmatter-panel"]')).toBeTruthy();
    });

    const toggle = node.querySelector<HTMLButtonElement>('button[aria-controls="frontmatter-panel-body"]');
    expect(toggle?.getAttribute("aria-expanded")).toBe("false");
    expect(node.querySelector("#fm-name")).toBeNull();
  });

  it("marks rich markdown body edits dirty and saves the edited markdown", async () => {
    mockCompanySkillsApi.updateFile.mockImplementationOnce((
      _companyId: string,
      _skillId: string,
      path: string,
      content: string,
    ) => Promise.resolve({
      path,
      content,
      markdown: true,
      editable: true,
      editableReason: null,
    }));

    const node = await renderStudio();

    let bodyEditor: HTMLTextAreaElement | undefined;
    await waitFor(() => {
      bodyEditor = Array.from(node.querySelectorAll<HTMLTextAreaElement>('[data-testid="markdown-editor"]')).find(
        (editor) => editor.value.includes("# Demo Skill"),
      );
      expect(bodyEditor).toBeTruthy();
    });

    await keyDown(bodyEditor as HTMLElement, "E");

    await waitFor(() => expect(node.textContent).toContain("Unsaved"));

    const saveButton = buttonsNamed(node, "Save").find((button) => !button.disabled);
    expect(saveButton).toBeTruthy();
    await click(saveButton as HTMLButtonElement);

    await waitFor(() => {
      expect(mockCompanySkillsApi.updateFile).toHaveBeenCalledWith(
        "company-1",
        "source-skill",
        "SKILL.md",
        expect.stringContaining("Edited body"),
      );
    });
    expect(mockCompanySkillsApi.updateFile).toHaveBeenCalledWith(
      "company-1",
      "source-skill",
      "SKILL.md",
      expect.stringContaining("---\nname: Demo Skill"),
    );
  });

  it("offers an 'Edit a copy' CTA on the read-only banner (PAP-13112)", async () => {
    mockCompanySkillsApi.detail.mockResolvedValueOnce(makeSkill({
      editable: false,
      editableReason: "Bundled skill.",
    }));

    const node = await renderStudio();

    await waitFor(() => expect(node.textContent).toContain("Bundled skill."));

    // The dead-end "Fork" text link is replaced by a primary "Edit a copy"
    // button that opens the fork-confirm dialog (agent-switch flow).
    const editCopy = Array.from(node.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Edit a copy",
    );
    expect(editCopy).toBeTruthy();
    const staleForkLink = Array.from(node.querySelectorAll("a")).find((link) =>
      link.getAttribute("href")?.includes("/skills/studio/new?forkFrom"),
    );
    expect(staleForkLink).toBeUndefined();
  });
});
