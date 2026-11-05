import { Skeleton } from "@workspace/ui-web/skeleton";

export function DashboardSidebarSkeleton() {
  return (
    <aside className="bg-sidebar text-sidebar-foreground hidden w-(--sidebar-width) flex-col border-e md:flex">
      <div className="flex h-14 items-center gap-3 px-4">
        <Skeleton className="size-8 rounded-md" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="mt-4 h-4 w-24" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="p-4">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </aside>
  );
}
