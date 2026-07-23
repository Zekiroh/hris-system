export const AVATAR_UPDATED_EVENT = "settings-avatar-updated";
export const MAX_AVATAR_FILE_SIZE_BYTES = 2 * 1024 * 1024;

const ALLOWED_AVATAR_MIME_TYPES = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export type AvatarUpdatedDetail = {
  userId: string | number;
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

  try {
    if (avatarUrl) {
      localStorage.setItem(key, avatarUrl);
    } else {
      localStorage.removeItem(key);
    }
  } catch (error) {
    if (isQuotaExceededError(error)) {
      throw new Error("Avatar is too large to save. Please choose a smaller image.");
    }

    throw new Error("Failed to save profile photo.");
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

function isQuotaExceededError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" ||
      error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
      error.code === 22 ||
      error.code === 1014)
  );
}

function validateAvatarFile(file: File) {
  if (file.size > MAX_AVATAR_FILE_SIZE_BYTES) {
    throw new Error("Image must be smaller than 2MB.");
  }

  if (!ALLOWED_AVATAR_MIME_TYPES.has(file.type)) {
    throw new Error("Please choose a JPEG, PNG, WebP, or GIF image.");
  }
}

export function readAvatarFileAsDataUrl(file: File): Promise<string> {
  validateAvatarFile(file);

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
