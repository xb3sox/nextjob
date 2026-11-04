import { DatabaseHooks } from "../types";
import { create } from "./create";
import { deleteUser } from "./delete";

export const user = {
  create,
  delete: deleteUser,
} satisfies NonNullable<DatabaseHooks["user"]>;
