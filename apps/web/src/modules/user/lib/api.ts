import { mutationOptions, queryOptions } from "@tanstack/react-query";

import { handle } from "@workspace/api/utils";

import { api } from "~/lib/api/client";
import { authClient } from "~/lib/auth/client";

const KEY = "user";

const queries = {
  sessions: {
    getAll: (userId: string | undefined) =>
      queryOptions({
        queryKey: [KEY, "sessions", userId],
        queryFn: () => handle(api.user.sessions.$get)(),
      }),
  },
  invitations: {
    getAll: (userId: string | undefined) =>
      queryOptions({
        queryKey: [KEY, "invitations", userId],
        queryFn: () =>
          authClient.organization.listUserInvitations({
            fetchOptions: { throw: true },
          }),
      }),
  },
};

const mutations = {
  sessions: {
    revoke: mutationOptions({
      mutationKey: [KEY, "sessions", "revoke"],
      mutationFn: (id: string) =>
        handle(api.user.sessions[":id"].revoke.$post)({ param: { id } }),
    }),
  },
  delete: {
    user: mutationOptions({
      mutationKey: [KEY, "delete"],
      mutationFn: (params: Parameters<typeof authClient.deleteUser>[0]) =>
        authClient.deleteUser(params),
    }),
    anonymous: mutationOptions({
      mutationKey: [KEY, "delete", "anonymous"],
      mutationFn: (
        params?: Parameters<typeof authClient.deleteAnonymousUser>[0],
      ) => authClient.deleteAnonymousUser(params),
    }),
  },
  update: mutationOptions({
    mutationKey: [KEY, "update"],
    mutationFn: (params: Parameters<typeof authClient.updateUser>[0]) =>
      authClient.updateUser(params),
  }),
};

export const user = {
  queries,
  mutations,
} as const;
