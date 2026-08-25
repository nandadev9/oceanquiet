"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  DEFAULT_PROFILE_AVATAR,
  getProfileAvatar,
  subscribeToProfileAvatar,
} from "@/lib/profile/avatar";

export function useProfileAvatar(userId?: string) {
  const subscribe = useCallback(
    (listener: () => void) => subscribeToProfileAvatar(userId, listener),
    [userId],
  );
  const getSnapshot = useCallback(() => getProfileAvatar(userId), [userId]);

  return useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_PROFILE_AVATAR);
}
