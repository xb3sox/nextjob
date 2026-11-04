import { Suspense as ReactSuspense } from "react";

import { Spinner } from "@workspace/ui-web/spinner";

import type { ReactNode } from "react";

const Loading = () => {
  return (
    <div className="flex w-full min-w-64 items-center justify-center py-16">
      <Spinner />
    </div>
  );
};

export const Suspense = ({
  children,
  fallback = <Loading />,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) => {
  return <ReactSuspense fallback={fallback}>{children}</ReactSuspense>;
};
