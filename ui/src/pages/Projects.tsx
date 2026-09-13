import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Project } from "@paperclipai/shared";
import { projectsApi } from "../api/projects";
import { useCompany } from "../context/CompanyContext";
import { useDialogActions } from "../context/DialogContext";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { queryKeys } from "../lib/queryKeys";
import { Link } from "@/lib/router";
import { EntityRow } from "../components/EntityRow";
import { ProjectTile } from "../components/ProjectTile";
import { StatusBadge } from "../components/StatusBadge";
import { MembershipAction } from "../components/MembershipAction";
import { StarToggle } from "../components/StarToggle";
import { EmptyState } from "../components/EmptyState";
import { PageSkeleton } from "../components/PageSkeleton";
import { formatDate, formatNumber, formatProjectBudget, projectUrl } from "../lib/utils";
import {
  isStarred,
  resourceMembershipState,
  useResourceMembershipMutation,
  useResourceMemberships,
} from "../hooks/useResourceMemberships";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowUpDown, Check, Hexagon, Plus, LayoutGrid, List } from "lucide-react";
import { Card } from "@/components/ui/card";

type ProjectSortField = "name" | "updated" | "created" | "targetDate";
type ProjectSortDir = "asc" | "desc";

const PROJECT_SORT_OPTIONS: Array<{ field: ProjectSortField; label: string }> = [
  { field: "name", label: "Name" },
  { field: "updated", label: "Updated" },
  { field: "created", label: "Created" },
  { field: "targetDate", label: "Target date" },
];

function compareProjectNames(left: Project, right: Project) {
  const nameDiff = left.name.localeCompare(right.name, undefined, { sensitivity: "base" });
  return nameDiff !== 0 ? nameDiff : left.id.localeCompare(right.id);
}

function projectTime(value: Date | string | null | undefined): number | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}

function compareOptionalTime(
  left: Date | string | null | undefined,
  right: Date | string | null | undefined,
  sortDir: ProjectSortDir,
) {
  const leftTime = projectTime(left);
  const rightTime = projectTime(right);
  if (leftTime === null && rightTime === null) return 0;
  if (leftTime === null) return 1;
  if (rightTime === null) return -1;
  return sortDir === "asc" ? leftTime - rightTime : rightTime - leftTime;
}

function sortProjects(projects: Project[], sortField: ProjectSortField, sortDir: ProjectSortDir) {
  return [...projects].sort((left, right) => {
    let comparison = 0;
    if (sortField === "name") {
      comparison = compareProjectNames(left, right);
      return sortDir === "asc" ? comparison : -comparison;
    }

    if (sortField === "updated") comparison = compareOptionalTime(left.updatedAt, right.updatedAt, sortDir);
    else if (sortField === "created") comparison = compareOptionalTime(left.createdAt, right.createdAt, sortDir);
    else comparison = compareOptionalTime(left.targetDate, right.targetDate, sortDir);

    if (comparison === 0) comparison = compareProjectNames(left, right);
    return comparison;
  });
}

export function Projects() {
  const { selectedCompanyId } = useCompany();
  const { openNewProject } = useDialogActions();
  const { setBreadcrumbs } = useBreadcrumbs();
  const [view, setView] = useState<"cards" | "list">("cards");
  const [sortField, setSortField] = useState<ProjectSortField>("name");
  const [sortDir, setSortDir] = useState<ProjectSortDir>("asc");

  useEffect(() => {
    setBreadcrumbs([{ label: "Projects" }]);
  }, [setBreadcrumbs]);

  const { data: allProjects, isLoading, error } = useQuery({
    queryKey: queryKeys.projects.list(selectedCompanyId!),
    queryFn: () => projectsApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });
  const membershipsQuery = useResourceMemberships(selectedCompanyId);
  const membershipMutation = useResourceMembershipMutation(selectedCompanyId);
  const projects = useMemo(
    () => allProjects ?? [],
    [allProjects],
  );
  const sortedProjects = useMemo(
    () => sortProjects(projects, sortField, sortDir),
    [projects, sortDir, sortField],
  );
  const groupedProjects = useMemo(() => {
    const groups = {
      mine: [] as typeof sortedProjects,
      other: [] as typeof sortedProjects,
    };

    for (const project of sortedProjects) {
      const state = resourceMembershipState(membershipsQuery.data, "project", project.id);
      if (state === "left") groups.other.push(project);
      else groups.mine.push(project);
    }

    return groups;
  }, [membershipsQuery.data, sortedProjects]);
  const sortLabel = PROJECT_SORT_OPTIONS.find((option) => option.field === sortField)?.label ?? "Name";

  if (!selectedCompanyId) {
    return <EmptyState icon={Hexagon} message="Select an organization to view projects." />;
  }

  if (isLoading) {
    return <PageSkeleton variant="list" />;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">PORTFOLIO</p>
          <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">Group work by outcome and review the task load, budget, and ownership in one place.</p>
        </div>
        <Button size="sm" onClick={openNewProject}>
          <Plus className="mr-1 h-4 w-4" />
          Add Project
        </Button>
      </header>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1" role="group" aria-label="Project view">
          <Button size="sm" variant={view === "cards" ? "secondary" : "ghost"} aria-pressed={view === "cards"} onClick={() => setView("cards")}><LayoutGrid className="mr-2 h-4 w-4" />Cards</Button>
          <Button size="sm" variant={view === "list" ? "secondary" : "ghost"} aria-pressed={view === "list"} onClick={() => setView("list")}><List className="mr-2 h-4 w-4" />List</Button>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="w-fit text-xs" title="Sort">
              <ArrowUpDown className="h-3.5 w-3.5 sm:h-3 sm:w-3 sm:mr-1" />
              <span>Sort: {sortLabel}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-44 p-0">
            <div className="p-2 space-y-0.5">
              {PROJECT_SORT_OPTIONS.map((option) => (
                <button
                  key={option.field}
                  type="button"
                  className={`flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm ${
                    sortField === option.field
                      ? "bg-accent/50 text-foreground"
                      : "text-muted-foreground hover:bg-accent/50"
                  }`}
                  onClick={() => {
                    if (sortField === option.field) {
                      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
                      return;
                    }
                    setSortField(option.field);
                    setSortDir(option.field === "name" || option.field === "targetDate" ? "asc" : "desc");
                  }}
                >
                  <span>{option.label}</span>
                  {sortField === option.field ? (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Check className="h-3 w-3" />
                      {sortDir === "asc" ? "Asc" : "Desc"}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {error && <p className="text-sm text-destructive">{error.message}</p>}

      {!isLoading && projects.length === 0 && (
        <EmptyState
          icon={Hexagon}
          message="No projects yet."
          action="Add Project"
          onAction={openNewProject}
        />
      )}

      {projects.length > 0 && (
        <div className="space-y-6">
          {([
            ["My Projects", groupedProjects.mine],
            ["Other Projects", groupedProjects.other],
          ] as const).map(([label, sectionProjects]) => {
            if (sectionProjects.length === 0) return null;

            return (
              <section key={label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium">{label}</h2>
                  <span className="text-xs text-muted-foreground">
                    {sectionProjects.length} project{sectionProjects.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className={view === "cards" ? "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" : "overflow-hidden rounded-lg border border-border bg-card"}>
                  {sectionProjects.map((project) => {
                    const state = resourceMembershipState(membershipsQuery.data, "project", project.id);
                    const pending = membershipMutation.isPending &&
                      membershipMutation.variables?.resourceType === "project" &&
                      membershipMutation.variables.resourceId === project.id;
                    const starPending = pending && membershipMutation.variables?.starred !== undefined;
                    const joinLeavePending = pending && membershipMutation.variables?.starred === undefined;
                    const starred = isStarred(membershipsQuery.data, "project", project.id);
                    const actions = (
                      <div className="flex flex-wrap items-center gap-3">
                            <MembershipAction
                              compact={view === "cards"}
                              state={state}
                              pending={joinLeavePending}
                              pendingState={joinLeavePending ? membershipMutation.variables?.state : null}
                              resourceName={project.name}
                              onJoin={() => membershipMutation.mutate({
                                resourceType: "project",
                                resourceId: project.id,
                                resourceName: project.name,
                                state: "joined",
                              })}
                              onLeave={() => membershipMutation.mutate({
                                resourceType: "project",
                                resourceId: project.id,
                                resourceName: project.name,
                                state: "left",
                              })}
                            />
                            <span className={view === "list" ? "hidden sm:inline-flex" : "inline-flex"}><StarToggle
                              size={view === "cards" ? "button" : "row"}
                              starred={starred}
                              pending={starPending}
                              resourceName={project.name}
                              onToggle={(next) => membershipMutation.mutate({
                                resourceType: "project",
                                resourceId: project.id,
                                resourceName: project.name,
                                starred: next,
                              })}
                            /></span>
                          </div>
                    );
                    if (view === "cards") return (
                      <Card key={project.id} className="min-w-0 gap-4 rounded-xl p-6 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <Link to={projectUrl(project)} className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <ProjectTile color={project.color} icon={project.icon} size="lg" />
                            <h3 className="truncate text-base font-semibold">{project.name}</h3>
                          </Link>
                          <StatusBadge status={project.status} />
                        </div>
                        <p className="line-clamp-3 min-h-16 text-sm text-muted-foreground">{project.description || "No project description yet."}</p>
                        {project.goals?.length > 0 && <div className="space-y-1"><p className="text-xs font-medium text-muted-foreground">Goals</p><p className="line-clamp-2 text-sm">{project.goals.map((goal) => goal.title).join(" · ")}</p></div>}
                        <dl className="mt-auto grid grid-cols-2 gap-3 text-sm">
                          <div><dt className="text-xs text-muted-foreground">Tasks</dt><dd className="font-mono">{project.taskCount === undefined ? "Unavailable" : formatNumber(project.taskCount)}</dd></div>
                          <div><dt className="text-xs text-muted-foreground">Target date</dt><dd>{project.targetDate ? formatDate(project.targetDate) : "Not set"}</dd></div>
                          <div className="col-span-2"><dt className="text-xs text-muted-foreground">Budget</dt><dd className="font-mono">{project.budget === undefined ? "Unavailable" : project.budget ? formatProjectBudget(project.budget) : "Not set"}</dd></div>
                        </dl>
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"><Link to={projectUrl(project)} className="text-sm font-medium underline-offset-4 hover:underline">Open project</Link>{actions}</div>
                      </Card>
                    );
                    return (
                      <EntityRow
                        key={project.id}
                        leading={<ProjectTile color={project.color ?? null} icon={project.icon ?? null} size="sm" />}
                        title={project.name}
                        subtitle={project.description ?? undefined}
                        reserveSubtitleSpace
                        titlePriority
                        to={projectUrl(project)}
                        className={state === "left" ? "group text-foreground/55" : "group"}
                        trailing={<div className="flex flex-wrap items-center gap-3"><span className="hidden text-xs font-mono text-muted-foreground sm:inline">{project.taskCount === undefined ? "Task count unavailable" : `${formatNumber(project.taskCount)} tasks`}</span>{project.budget && <span className="hidden text-xs text-muted-foreground sm:inline">{formatProjectBudget(project.budget)}</span>}{project.targetDate && <span className="hidden text-xs text-muted-foreground md:inline">{formatDate(project.targetDate)}</span>}<StatusBadge status={project.status} />{actions}</div>}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
