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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() =>
    getStoredAvatarUrl(userId)
  );

  useEffect(() => {
    if (userId === null || userId === undefined) {
      setAvatarUrl(null);
      return;
    }

    const storageKey = getAvatarStorageKey(userId);
    setAvatarUrl(getStoredAvatarUrl(userId));

    const handleStorage = (event: StorageEvent) => {
      if (event.key === storageKey) {
        setAvatarUrl(event.newValue);
      }
    };

    const handleAvatarUpdated = (event: Event) => {
      const detail = (event as CustomEvent<AvatarUpdatedDetail>).detail;

      if (
        detail?.userId !== undefined &&
        String(detail.userId) !== String(userId)
      ) {
        return;
      }

      setAvatarUrl(detail?.avatarUrl ?? getStoredAvatarUrl(userId));
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
