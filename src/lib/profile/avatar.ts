"use client";

export const DEFAULT_PROFILE_AVATAR = "/images/user/owner.jpg";

const PROFILE_AVATAR_PREFIX = "oceanquiet.profile.avatar.v1";
const PROFILE_AVATAR_EVENT = "oceanquiet:profile-avatar-change";
const MAX_SOURCE_FILE_SIZE = 8 * 1024 * 1024;
const AVATAR_OUTPUT_SIZE = 512;

type AvatarChangeDetail = { userId: string };

function storageKey(userId?: string) {
  return userId ? `${PROFILE_AVATAR_PREFIX}:${userId}` : PROFILE_AVATAR_PREFIX;
}

export function getProfileAvatar(userId?: string) {
  if (typeof window === "undefined") return DEFAULT_PROFILE_AVATAR;

  try {
    return window.localStorage.getItem(storageKey(userId)) || DEFAULT_PROFILE_AVATAR;
  } catch {
    return DEFAULT_PROFILE_AVATAR;
  }
}

export function hasCustomProfileAvatar(userId?: string) {
  return getProfileAvatar(userId) !== DEFAULT_PROFILE_AVATAR;
}

function notifyAvatarChange(userId?: string) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<AvatarChangeDetail>(PROFILE_AVATAR_EVENT, {
      detail: { userId: userId || "" },
    }),
  );
}

export function subscribeToProfileAvatar(
  userId: string | undefined,
  listener: () => void,
) {
  if (typeof window === "undefined") return () => undefined;

  const key = storageKey(userId);
  const onStorage = (event: StorageEvent) => {
    if (event.key === key) listener();
  };
  const onAvatarChange = (event: Event) => {
    const detail = (event as CustomEvent<AvatarChangeDetail>).detail;
    if (detail.userId === (userId || "")) listener();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(PROFILE_AVATAR_EVENT, onAvatarChange);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(PROFILE_AVATAR_EVENT, onAvatarChange);
  };
}

export function saveProfileAvatar(userId: string | undefined, dataUrl: string) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(storageKey(userId), dataUrl);
  notifyAvatarChange(userId);
}

export function removeProfileAvatar(userId?: string) {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(storageKey(userId));
  notifyAvatarChange(userId);
}

export type AvatarPreparationError = "invalid-type" | "too-large" | "processing";

export async function prepareProfileAvatar(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("invalid-type" satisfies AvatarPreparationError);
  }

  if (file.size > MAX_SOURCE_FILE_SIZE) {
    throw new Error("too-large" satisfies AvatarPreparationError);
  }

  const sourceUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const source = new Image();
      source.onload = () => resolve(source);
      source.onerror = () => reject(new Error("processing"));
      source.src = sourceUrl;
    });

    const cropSize = Math.min(image.naturalWidth, image.naturalHeight);
    const sourceX = Math.max(0, (image.naturalWidth - cropSize) / 2);
    const sourceY = Math.max(0, (image.naturalHeight - cropSize) / 2);
    const canvas = document.createElement("canvas");
    canvas.width = AVATAR_OUTPUT_SIZE;
    canvas.height = AVATAR_OUTPUT_SIZE;
    const context = canvas.getContext("2d");

    if (!context) throw new Error("processing" satisfies AvatarPreparationError);

    context.drawImage(
      image,
      sourceX,
      sourceY,
      cropSize,
      cropSize,
      0,
      0,
      AVATAR_OUTPUT_SIZE,
      AVATAR_OUTPUT_SIZE,
    );

    return canvas.toDataURL("image/webp", 0.86);
  } catch (error) {
    if (error instanceof Error && ["invalid-type", "too-large"].includes(error.message)) {
      throw error;
    }
    throw new Error("processing" satisfies AvatarPreparationError);
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}
