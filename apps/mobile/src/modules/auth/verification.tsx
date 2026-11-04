import { useMutation } from "@tanstack/react-query";
import { router, useGlobalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import * as z from "zod";

import { VerificationType } from "@workspace/auth";

import { useSetupSteps } from "~/app/(setup)/steps/_layout";
import { pathsConfig, toAllowedPath } from "~/config/paths";
import { Spinner } from "~/modules/common/spinner";
import { user } from "~/modules/user/lib/api";

import { auth } from "./lib/api";

import type { Href } from "expo-router";

const verificationTypeSchema = z.enum([
  VerificationType.MAGIC_LINK,
  VerificationType.CONFIRM_EMAIL,
  VerificationType.DELETE_ACCOUNT,
]);

const verificationParamsSchema = z.object({
  token: z.string().min(1),
  type: verificationTypeSchema,
});

const useVerificationMutations = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const { reset } = useSetupSteps();
  const signOut = useMutation({
    ...auth.mutations.signOut,
    onSuccess: () => {
      reset();
    },
  });

  return {
    [VerificationType.MAGIC_LINK]: useMutation({
      ...auth.mutations.magicLink.verify,
      onSuccess,
      onError,
    }),
    [VerificationType.CONFIRM_EMAIL]: useMutation({
      ...auth.mutations.email.verify,
      onSuccess,
      onError,
    }),
    [VerificationType.DELETE_ACCOUNT]: useMutation({
      ...user.mutations.delete.user,
      onSuccess: async () => {
        await signOut.mutateAsync(undefined);
        onSuccess?.();
      },
      onError,
    }),
  };
};

const resetParams = () => {
  router.setParams({
    token: undefined,
    type: undefined,
    redirectTo: undefined,
    callbackURL: undefined,
    errorCallbackURL: undefined,
  });
};

const VerificationController = ({
  token,
  type,
  redirectTo,
  errorCallbackURL,
}: {
  token: string;
  type: z.infer<typeof verificationTypeSchema>;
  redirectTo: Href;
  errorCallbackURL: Href;
}) => {
  const attemptedToken = useRef<string | null>(null);

  const mutations = useVerificationMutations({
    onSuccess: () => {
      router.navigate(redirectTo);
      resetParams();
    },
    onError: () => {
      router.navigate(errorCallbackURL);
      resetParams();
    },
  });

  const { mutate, isPending } = mutations[type];

  useEffect(() => {
    if (!token || attemptedToken.current === token) {
      return;
    }

    attemptedToken.current = token;
    mutate({ token });
  }, [token, mutate]);

  if (isPending) {
    return <Spinner />;
  }

  return null;
};

export const Verification = () => {
  const {
    token,
    type,
    callbackURL = pathsConfig.index,
    redirectTo,
    errorCallbackURL,
  } = useGlobalSearchParams<{
    token?: string;
    type?: VerificationType;
    callbackURL?: string;
    redirectTo?: string;
    errorCallbackURL?: string;
  }>();

  const parsed = verificationParamsSchema.safeParse({
    token,
    type,
  });

  if (!parsed.success) {
    return null;
  }

  return (
    <VerificationController
      token={parsed.data.token}
      type={parsed.data.type}
      redirectTo={
        toAllowedPath(redirectTo) ??
        toAllowedPath(callbackURL) ??
        pathsConfig.index
      }
      errorCallbackURL={
        toAllowedPath(errorCallbackURL) ?? pathsConfig.setup.auth.error
      }
    />
  );
};
