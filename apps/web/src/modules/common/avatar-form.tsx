"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useMutationState } from "@tanstack/react-query";
import { createContext, useContext, useMemo, useState } from "react";
import {
  FormProvider,
  useForm,
  useFormContext,
  useFormState,
} from "react-hook-form";
import * as z from "zod";

import {
  getAvatarPath,
  MAX_AVATAR_SIZE,
  MAX_AVATAR_SIZE_MB,
} from "@workspace/api/lib/avatar";
import { handle } from "@workspace/api/utils";
import { useTranslation } from "@workspace/i18n";
import { ImageContentType } from "@workspace/shared/constants";
import { cn } from "@workspace/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui-web/avatar";
import { Button } from "@workspace/ui-web/button";
import { Icons } from "@workspace/ui-web/icons";
import { Spinner } from "@workspace/ui-web/spinner";
import { toast } from "@workspace/ui-web/toast";

import { api } from "~/lib/api/client";

type AvatarFormScope = "user" | "organization";

interface AvatarFormProps {
  readonly id: string;
  readonly scope: AvatarFormScope;
  readonly image?: string | null;
  readonly update: (image: string | null) => Promise<unknown>;
}

const isImageContentType = (
  contentType?: unknown,
): contentType is ImageContentType =>
  z.enum(ImageContentType).safeParse(contentType).success;

const deleteAvatar = async ({
  scope,
  id,
  image,
}: {
  scope: AvatarFormScope;
  id: string;
  image: string | null | undefined;
}) => {
  const path = getAvatarPath({ avatar: image, ownerId: id });

  if (!path) {
    return;
  }

  try {
    const { url } = await (scope === "user"
      ? handle(api.user.avatar.$delete)({ query: { path } })
      : handle(api.organizations[":id"].logo.$delete)({
          param: { id },
          query: { path },
        }));
    void fetch(url, { method: "DELETE" });
  } catch {}
};

const mutations = {
  upload: {
    mutationKey: ["avatar", "upload"],
    mutationFn: async ({
      avatar,
      id,
      scope,
      image,
      update,
    }: AvatarFormProps & { avatar?: File }) => {
      if (!avatar) {
        throw new Error("No file selected");
      }

      const contentType = avatar.type;

      if (!isImageContentType(contentType)) {
        throw new Error("Unsupported file type");
      }

      const { uploadUrl, publicUrl } = await (scope === "user"
        ? handle(api.user.avatar.$post)({
            json: { contentType, contentLength: avatar.size },
          })
        : handle(api.organizations[":id"].logo.$post)({
            param: { id },
            json: { contentType, contentLength: avatar.size },
          }));

      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: avatar,
        headers: {
          "Content-Type": contentType,
        },
      });

      if (!response.ok) {
        throw new Error();
      }

      try {
        await update(publicUrl);
        return { publicUrl, oldImage: image };
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : "Something went wrong",
          {
            cause: error,
          },
        );
      }
    },
  },
  remove: {
    mutationKey: ["avatar", "remove"],
    mutationFn: async ({ id, scope, image, update }: AvatarFormProps) => {
      if (!image) {
        return;
      }

      try {
        await update(null);
        void deleteAvatar({ scope, id, image });
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : "Something went wrong",
          { cause: error },
        );
      }
    },
  },
};

const useAvatarFormSchema = () => {
  const { t, i18n } = useTranslation("common");
  const types = new Intl.ListFormat(i18n.language, {
    style: "long",
    type: "conjunction",
  }).format(
    Object.values(ImageContentType).map((type) => type.replace("image/", ".")),
  );

  return z.object({
    avatar: z
      .custom<FileList>()
      .refine((files) => files.length === 1, t("error.file.image"))
      .transform((files) => files[0])
      .refine(
        (file) => (file?.size ?? 0) <= MAX_AVATAR_SIZE,
        t("error.file.size", { size: `${MAX_AVATAR_SIZE_MB} MB` }),
      )
      .refine(
        (file) => isImageContentType(file?.type),
        t("error.file.type", { types }),
      ),
  });
};

interface AvatarFormContextValue extends AvatarFormProps {
  previewUrl: string | null;
  setPreviewUrl: (previewUrl: string | null) => void;
}

const AvatarFormContext = createContext<AvatarFormContextValue | null>(null);

const useAvatarFormContext = () => {
  const context = useContext(AvatarFormContext);
  if (!context) {
    throw new Error("useAvatarFormContext must be used within a AvatarForm!");
  }
  return context;
};

const AvatarForm = ({
  id,
  scope,
  image,
  update,
  children,
}: AvatarFormProps & {
  children: React.ReactNode;
}) => {
  const [previewUrl, setPreviewUrl] = useState(image ?? null);
  const avatarSchema = useAvatarFormSchema();

  const form = useForm({
    resolver: standardSchemaResolver(avatarSchema),
  });

  const value = useMemo(
    () => ({ id, scope, image, update, previewUrl, setPreviewUrl }),
    [id, scope, image, update, previewUrl, setPreviewUrl],
  );

  return (
    <AvatarFormContext.Provider value={value}>
      <FormProvider {...form}>{children}</FormProvider>
    </AvatarFormContext.Provider>
  );
};

const AvatarFormInput = ({
  className,
  children,
  onUpload,
  disabled,
  ...props
}: React.ComponentProps<"input"> & { onUpload?: () => void }) => {
  const { t } = useTranslation("common");
  const { image, setPreviewUrl, id, scope, update } = useAvatarFormContext();
  const avatarSchema = useAvatarFormSchema();

  const { register, handleSubmit, reset, setError } =
    useFormContext<z.infer<typeof avatarSchema>>();

  const upload = useMutation({
    ...mutations.upload,
    onError: (error) => {
      setPreviewUrl(image ?? null);
      toast.add({ title: error.message || t("error.general"), type: "error" });
    },
    onSuccess: async ({ publicUrl, oldImage }) => {
      await new Promise((resolve) => {
        const img = new Image();
        img.src = publicUrl;
        img.addEventListener("load", resolve);
      });

      if (oldImage) {
        await deleteAvatar({ scope, id, image: oldImage });
      }

      onUpload?.();
    },
  });

  const [removeStatus] = useMutationState({
    filters: { mutationKey: mutations.remove.mutationKey },
    select: (mutation) => mutation.state.status,
  });

  const onSubmit = (data: z.infer<typeof avatarSchema>) => {
    upload.mutate({
      ...data,
      id,
      scope,
      image,
      update,
    });
    reset();
  };

  return (
    <label
      className={cn(
        "group",
        {
          "cursor-pointer": !disabled,
          "cursor-not-allowed opacity-50": disabled,
        },
        className,
      )}
    >
      {children}
      <input
        {...register("avatar", {
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];

            if (!file) {
              return;
            }

            const result = avatarSchema.safeParse({
              avatar: e.target.files,
            });

            if (!result.success) {
              setError("avatar", {
                message: result.error.issues[0]?.message ?? t("error.general"),
              });
              return;
            }

            setPreviewUrl(URL.createObjectURL(file));
            void handleSubmit(onSubmit)();
          },
        })}
        type="file"
        accept={Object.values(ImageContentType).join(",")}
        className="sr-only"
        aria-label={t("update")}
        onClick={(e) => "value" in e.target && (e.target.value = "")}
        disabled={disabled ?? (upload.isPending || removeStatus === "pending")}
        {...props}
      />
    </label>
  );
};

const AvatarFormPreview = ({
  className,
  fallback,
  ...props
}: React.ComponentProps<typeof Avatar> & { fallback?: React.ReactNode }) => {
  const { previewUrl } = useAvatarFormContext();
  const { errors } = useFormState({ name: "avatar" });

  const mutationStatues = useMutationState({
    filters: {
      predicate: (mutation) =>
        [mutations.upload.mutationKey, mutations.remove.mutationKey].includes(
          mutation.options.mutationKey as string[],
        ),
    },
    select: (mutation) => mutation.state.status,
  });

  const hasError =
    Boolean(errors.avatar) ||
    mutationStatues.some((status) => status === "error");

  return (
    <Avatar
      className={cn(
        `relative size-20 transition-all ${
          hasError
            ? "ring-destructive ring-offset-background ring-2 ring-offset-2"
            : "group-focus-within:ring-primary group-focus-within:ring-offset-background group-focus-within:ring-2 group-focus-within:ring-offset-2"
        }`,
        className,
      )}
      {...props}
    >
      {previewUrl && <AvatarImage src={previewUrl} />}
      {mutationStatues.some((status) => status === "pending") && (
        <div className="bg-background/60 absolute inset-0 flex items-center justify-center rounded-full backdrop-blur-sm">
          <Spinner className="text-muted-foreground size-7" />
        </div>
      )}
      <AvatarFallback>
        {fallback ?? <Icons.UserRound className="size-10" />}
      </AvatarFallback>
    </Avatar>
  );
};

const AvatarFormRemoveButton = ({
  className,
  onRemove,
  ...props
}: React.ComponentProps<typeof Button> & { onRemove?: () => void }) => {
  const { t } = useTranslation("common");
  const { image, update, previewUrl, setPreviewUrl, id, scope } =
    useAvatarFormContext();

  const { clearErrors } = useFormContext();
  const [uploadStatus] = useMutationState({
    filters: { mutationKey: mutations.upload.mutationKey },
    select: (mutation) => mutation.state.status,
  });

  const remove = useMutation({
    ...mutations.remove,
    onMutate: () => {
      setPreviewUrl(null);
    },
    onSuccess: () => {
      setPreviewUrl(null);
      onRemove?.();
    },
  });

  return (
    previewUrl &&
    uploadStatus !== "pending" && (
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "bg-background dark:bg-background hover:bg-muted dark:hover:bg-muted absolute -top-1 -right-1 size-6 rounded-full",
          className,
        )}
        disabled={remove.isPending}
        onClick={() => {
          clearErrors();
          remove.mutate({
            id,
            scope,
            image,
            update,
          });
        }}
        {...props}
      >
        <Icons.X className="size-3.5" />
        <span className="sr-only">{t("remove")}</span>
      </Button>
    )
  );
};

const AvatarFormErrorMessage = ({
  className,
  ...props
}: React.ComponentProps<"span">) => {
  const _avatarSchema = useAvatarFormSchema();
  const { errors } = useFormState<z.infer<typeof _avatarSchema>>({
    name: "avatar",
  });

  if (!errors.avatar) {
    return null;
  }

  return (
    <span className={cn("text-destructive text-sm", className)} {...props}>
      {errors.avatar.message}
    </span>
  );
};

export {
  AvatarForm,
  AvatarFormInput,
  AvatarFormPreview,
  AvatarFormRemoveButton,
  AvatarFormErrorMessage,
};
