export function isProjectCompleted(project: {
  status: string;
  completionPercentage?: number;
}): boolean {
  return project.status === 'completed' || (project.completionPercentage ?? 0) >= 100;
}

export function projectDisplayStatus(project: {
  status: string;
  completionPercentage?: number;
}): string {
  return isProjectCompleted(project) ? 'completed' : project.status;
}
