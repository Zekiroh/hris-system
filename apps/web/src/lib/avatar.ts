export const AVATAR_UPDATED_EVENT = "settings-avatar-updated";

export type AvatarUpdatedDetail = {
  userId?: string | number;
  avatarUrl?: string | null;
};

export function getAvatarStorageKey(userId: string | number): string {
  return `settings.avatar.${userId}`;
}

export function getStoredAvatarUrl(
  userId: string | number | null | undefined
): string | null {
  if (userId === null || userId === undefined) return null;
  return localStorage.getItem(getAvatarStorageKey(userId));
}

export function setStoredAvatarUrl(
  userId: string | number,
  avatarUrl: string | null
) {
  const key = getAvatarStorageKey(userId);

  if (avatarUrl) {
    localStorage.setItem(key, avatarUrl);
  } else {
    localStorage.removeItem(key);
  }

  window.dispatchEvent(
    new StorageEvent("storage", {
      key,
      newValue: avatarUrl,
    })
  );

  window.dispatchEvent(
    new CustomEvent<AvatarUpdatedDetail>(AVATAR_UPDATED_EVENT, {
      detail: {
        userId,
        avatarUrl,
      },
    })
  );
}

export function readAvatarFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        resolve(result);
        return;
      }

      reject(new Error("Failed to read image file."));
    };

    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}
