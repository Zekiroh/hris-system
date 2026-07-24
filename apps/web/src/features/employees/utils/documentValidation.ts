export function validateDocumentFile(file: File): string | null {
  const maxSize = 5 * 1024 * 1024;

  if (file.size > maxSize) {
    return "File size must be less than 5MB.";
  }

  const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];

  if (!allowedTypes.includes(file.type)) {
    return "Only PDF, PNG, and JPG files are allowed.";
  }

  return null;
}