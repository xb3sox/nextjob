import { mutationOptions, queryOptions } from "@tanstack/react-query";
import * as Linking from "expo-linking";

import { handle } from "@workspace/api/utils";

import { pathsConfig } from "~/config/paths";
import { api } from "~/lib/api";
import { authClient } from "~/lib/auth";

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
        authClient.deleteUser(params, {
          headers: {
            "x-url": Linking.createURL(
              pathsConfig.dashboard.user.settings.index,
            ),
          },
        }),
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
