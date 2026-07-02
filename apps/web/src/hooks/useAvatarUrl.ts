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
  const [updatedAvatar, setUpdatedAvatar] = useState<{
    userIdKey: string;
    avatarUrl: string | null;
  } | null>(null);

  const avatarUrl =
    userIdKey && updatedAvatar?.userIdKey === userIdKey
      ? updatedAvatar.avatarUrl
      : getStoredAvatarUrl(userId);

  useEffect(() => {
    if (userId === null || userId === undefined) {
      return;
    }

    const storageKey = getAvatarStorageKey(userId);

    const handleStorage = (event: StorageEvent) => {
      if (event.key === storageKey) {
        setUpdatedAvatar({
          userIdKey: String(userId),
          avatarUrl: event.newValue,
        });
      }
    };

    const handleAvatarUpdated = (event: Event) => {
      const detail = (event as CustomEvent<AvatarUpdatedDetail>).detail;

      if (
        detail?.userId === undefined ||
        String(detail.userId) !== String(userId)
      ) {
        return;
      }

      setUpdatedAvatar({
        userIdKey: String(userId),
        avatarUrl: detail.avatarUrl ?? getStoredAvatarUrl(userId),
      });
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(AVATAR_UPDATED_EVENT, handleAvatarUpdated);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(AVATAR_UPDATED_EVENT, handleAvatarUpdated);
    };
  }, [userId]);

  return avatarUrl;
}
