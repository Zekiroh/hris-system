import { useEffect, useState } from "react";
import {
  AVATAR_UPDATED_EVENT,
  getAvatarStorageKey,
  getStoredAvatarUrl,
  type AvatarUpdatedDetail,
} from "../lib/avatar";

export function useAvatarUrl(
  userId: string | number | null | undefined
): string | null {
  const userIdKey = userId === null || userId === undefined ? null : String(userId);
  const [, refreshAvatarUrl] = useState(0);
  const avatarUrl = getStoredAvatarUrl(userIdKey);

  useEffect(() => {
    if (userIdKey === null) {
      return;
    }

    const storageKey = getAvatarStorageKey(userIdKey);
    const refreshCurrentAvatar = () => {
      refreshAvatarUrl((version) => version + 1);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === storageKey) {
        refreshCurrentAvatar();
      }
    };

    const handleAvatarUpdated = (event: Event) => {
      const detail = (event as CustomEvent<AvatarUpdatedDetail>).detail;

      if (
        detail?.userId === undefined ||
        String(detail.userId) !== userIdKey
      ) {
        return;
      }

      refreshCurrentAvatar();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(AVATAR_UPDATED_EVENT, handleAvatarUpdated);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(AVATAR_UPDATED_EVENT, handleAvatarUpdated);
    };
  }, [userIdKey]);

  return avatarUrl;
}
