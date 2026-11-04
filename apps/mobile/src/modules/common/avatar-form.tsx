import { useMutation, useMutationState } from "@tanstack/react-query";
import { createContext, useContext, useMemo, useState } from "react";
import {
  FormProvider,
  useForm,
  useFormContext,
  useFormState,
} from "react-hook-form";
import { Alert, Text, View } from "react-native";
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui-mobile/avatar";
import { Button } from "@workspace/ui-mobile/button";
import { Icons } from "@workspace/ui-mobile/icons";
import { Spinner } from "@workspace/ui-mobile/spinner";

import { api } from "~/lib/api";
import { useImagePicker } from "~/modules/common/hooks/use-image-picker";

import type { ImagePickerAsset } from "expo-image-picker";

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
    mutationKey: ["avatar", "upload"] as const,
    mutationFn: async ({
      avatar,
      id,
      scope,
      image,
      update,
    }: AvatarFormProps & { avatar?: ImagePickerAsset }) => {
      if (!avatar?.base64) throw new Error("No file selected");

      const contentType = isImageContentType(avatar.mimeType)
        ? avatar.mimeType
        : ImageContentType.JPEG;
      const body = Uint8Array.from(atob(avatar.base64), (c) => c.charCodeAt(0));

      const { uploadUrl, publicUrl } = await (scope === "user"
        ? handle(api.user.avatar.$post)({
            json: { contentType, contentLength: body.byteLength },
          })
        : handle(api.organizations[":id"].logo.$post)({
            param: { id },
            json: { contentType, contentLength: body.byteLength },
          }));

      const response = await fetch(uploadUrl, {
        method: "PUT",
        body,
        headers: { "Content-Type": contentType },
      });

      if (!response.ok) {
        throw new Error();
      }

      await update(publicUrl);

      return { publicUrl, oldImage: image };
    },
  },
  remove: {
    mutationKey: ["avatar", "remove"] as const,
    mutationFn: async ({ id, scope, image, update }: AvatarFormProps) => {
      if (!image) return;

      await update(null);
      void deleteAvatar({ scope, id, image });
    },
  },
} as const;

const useAvatarFormSchema = () => {
  const { t } = useTranslation("common");
  const types = Object.values(ImageContentType)
    .map((type) => type.replace("image/", "."))
    .join(", ");

  const assetSchema = z.object({
    uri: z.string().min(1),
    mimeType: z.string().optional(),
    fileSize: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  });

  return z.object({
    avatar: assetSchema
      .refine((file) => (file.fileSize ?? MAX_AVATAR_SIZE) <= MAX_AVATAR_SIZE, {
        message: t("error.file.size", { size: `${MAX_AVATAR_SIZE_MB} MB` }),
        path: ["avatar"],
      })
      .refine((file) => !file.mimeType || isImageContentType(file.mimeType), {
        message: t("error.file.type", { types }),
        path: ["avatar"],
      }),
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
}: AvatarFormProps & { children: React.ReactNode }) => {
  const [previewUrl, setPreviewUrl] = useState(image ?? null);
  const _avatarSchema = useAvatarFormSchema();
  const form = useForm<z.infer<typeof _avatarSchema>>();

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

const AvatarFormUploadButton = ({
  className,
  onUpload,
  disabled,
  ...props
}: React.ComponentProps<typeof Button> & { onUpload?: () => void }) => {
  const { t } = useTranslation("common");
  const { pick } = useImagePicker();
  const { image, setPreviewUrl, id, scope, update } = useAvatarFormContext();
  const avatarSchema = useAvatarFormSchema();

  const { setError, clearErrors } =
    useFormContext<z.infer<typeof avatarSchema>>();

  const upload = useMutation({
    ...mutations.upload,
    onError: (error) => {
      setPreviewUrl(image ?? null);
      Alert.alert(t("error.title"), error.message || t("error.general"));
    },
    onSuccess: async ({ publicUrl, oldImage }) => {
      clearErrors();
      setPreviewUrl(publicUrl);

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

  const handlePick = async () => {
    const asset = await pick();
    if (!asset) {
      return;
    }

    const result = avatarSchema.safeParse({ avatar: asset });
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? t("error.general");
      setError("avatar", { message });
      Alert.alert(t("error.title"), message);
      return;
    }

    setPreviewUrl(asset.uri);
    upload.mutate({
      avatar: asset,
      id,
      scope,
      image,
      update,
    });
  };

  return (
    <Button
      hitSlop={4}
      variant="outline"
      size="icon"
      className={cn(
        "dark:bg-background active:bg-muted absolute -right-2 -bottom-2.5 rounded-full",
        className,
      )}
      onPress={handlePick}
      disabled={disabled ?? (upload.isPending || removeStatus === "pending")}
      {...props}
    >
      <Icons.Pencil size={14} className="text-foreground" />
    </Button>
  );
};

const AvatarFormPreview = ({
  className,
  fallback,
  ...props
}: React.ComponentProps<typeof Avatar> & { fallback?: React.ReactNode }) => {
  const { previewUrl } = useAvatarFormContext();
  const { errors } = useFormState({ name: "avatar" });

  const mutationStatuses = useMutationState({
    filters: {
      predicate: (mutation) =>
        mutation.options.mutationKey === mutations.upload.mutationKey ||
        mutation.options.mutationKey === mutations.remove.mutationKey,
    },
    select: (mutation) => mutation.state.status,
  });

  const hasError =
    Boolean(errors.avatar) || mutationStatuses.some((s) => s === "error");

  return (
    <View className="relative">
      <Avatar
        className={cn(
          "size-26",
          hasError ? "ring-destructive ring-2 ring-offset-2" : "",
          className,
        )}
        {...props}
      >
        {previewUrl && <AvatarImage source={{ uri: previewUrl }} />}
        {mutationStatuses.some((status) => status === "pending") && (
          <>
            <View className="bg-background absolute inset-0 rounded-full opacity-50" />
            <View className="absolute inset-0 items-center justify-center rounded-full">
              <Spinner className="text-muted-foreground" size={28} />
            </View>
          </>
        )}
        <AvatarFallback>
          {fallback ?? (
            <Icons.UserRound
              width={50}
              height={50}
              className="text-foreground"
            />
          )}
        </AvatarFallback>
      </Avatar>
    </View>
  );
};

const AvatarFormRemoveButton = ({
  className,
  onRemove,
  ...props
}: React.ComponentProps<typeof Button> & { onRemove?: () => void }) => {
  const { image, update, previewUrl, setPreviewUrl, id, scope } =
    useAvatarFormContext();
  const { clearErrors } = useFormContext();

  const [uploadStatus] = useMutationState({
    filters: {
      mutationKey: mutations.upload.mutationKey,
    },
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

  if (!previewUrl || uploadStatus === "pending") {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "dark:bg-background active:bg-muted absolute -top-2 -right-2 rounded-full",
        className,
      )}
      disabled={remove.isPending}
      onPress={() => {
        clearErrors();
        remove.mutate({ id, scope, image, update });
      }}
      {...props}
    >
      <Icons.X size={16} strokeWidth={2} className="text-foreground" />
    </Button>
  );
};

const AvatarFormErrorMessage = ({
  className,
  ...props
}: React.ComponentProps<typeof Text>) => {
  const _avatarSchema = useAvatarFormSchema();
  const { errors } = useFormState<z.infer<typeof _avatarSchema>>({
    name: "avatar",
  });

  if (!errors.avatar) {
    return null;
  }

  return (
    <Text className={cn("text-destructive text-xs", className)} {...props}>
      {errors.avatar.message}
    </Text>
  );
};

export {
  AvatarForm,
  AvatarFormPreview,
  AvatarFormRemoveButton,
  AvatarFormUploadButton,
  AvatarFormErrorMessage,
};
