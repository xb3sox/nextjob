import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsStringEnum,
} from "nuqs/server";

import { getUsersResponseSchema } from "@workspace/api/schema";
import { handle } from "@workspace/api/utils";
import { UserRole } from "@workspace/auth";
import { pickBy } from "@workspace/shared/utils";

import { api } from "~/lib/api/server";
import { getMetadata } from "~/lib/metadata";
import { UsersDataTable } from "~/modules/admin/users/data-table/users-data-table";
import { getSortingStateParser } from "~/modules/common/hooks/use-data-table/common";

const searchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser().withDefault([{ id: "name", desc: false }]),
  q: parseAsString,
  role: parseAsArrayOf(parseAsStringEnum<UserRole>(Object.values(UserRole))),
  twoFactorEnabled: parseAsArrayOf(parseAsBoolean),
  banned: parseAsArrayOf(parseAsBoolean),
  createdAt: parseAsArrayOf(parseAsInteger),
});

export const generateMetadata = getMetadata({
  title: "admin:users.header.title",
  description: "admin:users.header.description",
});

export default async function UsersPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const { page, perPage, sort, ...rest } =
    searchParamsCache.parse(searchParams);

  const filters = pickBy(rest, Boolean);

  const promise = handle(api.admin.users.$get, {
    schema: getUsersResponseSchema,
  })({
    query: {
      ...filters,
      page: page.toString(),
      perPage: perPage.toString(),
      sort: JSON.stringify(sort),
    },
  });

  return <UsersDataTable promise={promise} perPage={perPage} />;
}
