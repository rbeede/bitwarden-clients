import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, createUrlTreeFromSnapshot } from "@angular/router";

import { ProjectService } from "../project.service";

/**
 * Redirects to service accounts page if the user doesn't have access to service account.
 */
export const projectAccessGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const projectService = inject(ProjectService);

  try {
    const project = await projectService.getByProjectId(route.params.projectId);
    if (project) {
      return true;
    }
  } catch {
    return createUrlTreeFromSnapshot(route, ["/sm", route.params.organizationId, "projects"]);
  }
  return createUrlTreeFromSnapshot(route, ["/sm", route.params.organizationId, "projects"]);
};
