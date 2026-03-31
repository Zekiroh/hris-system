export function getEmployeeApiErrorMessage(error: unknown): string {
  const fallback = "Something went wrong. Please try again.";

  if (!error || typeof error !== "object") return fallback;

  const maybeError = error as {
    response?: {
      data?: unknown;
      status?: number;
    };
    message?: string;
  };

  const data = maybeError.response?.data;

  if (typeof data === "string" && data.trim()) {
    return normalizeEmployeeMessage(data);
  }

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;

    if (typeof obj.message === "string" && obj.message.trim()) {
      return normalizeEmployeeMessage(obj.message);
    }

    if (typeof obj.error === "string" && obj.error.trim()) {
      return normalizeEmployeeMessage(obj.error);
    }

    if (Array.isArray(obj.errors) && obj.errors.length > 0) {
      const first = obj.errors.find(
        (item) => typeof item === "string" && item.trim()
      );
      if (typeof first === "string") {
        return normalizeEmployeeMessage(first);
      }
    }

    if (obj.errors && typeof obj.errors === "object") {
      const validationErrors = Object.values(
        obj.errors as Record<string, unknown>
      ).flatMap((value) => (Array.isArray(value) ? value : []));

      const firstValidationMessage = validationErrors.find(
        (item) => typeof item === "string" && item.trim()
      );

      if (typeof firstValidationMessage === "string") {
        return normalizeEmployeeMessage(firstValidationMessage);
      }
    }

    if (typeof obj.title === "string" && obj.title.trim()) {
      return normalizeEmployeeMessage(obj.title);
    }
  }

  if (typeof maybeError.message === "string" && maybeError.message.trim()) {
    return normalizeEmployeeMessage(maybeError.message);
  }

  return fallback;
}

function normalizeEmployeeMessage(message: string): string {
  const raw = message.trim();

  const lower = raw.toLowerCase();

  if (
    lower.includes("linked user") &&
    (lower.includes("already assigned") || lower.includes("already linked"))
  ) {
    return "This user is already linked to another employee.";
  }

  if (lower.includes("employee number") && lower.includes("already")) {
    return "Employee ID already exists.";
  }

  if (lower.includes("sss") && lower.includes("already")) {
    return "SSS number already exists.";
  }

  if (lower.includes("philhealth") && lower.includes("already")) {
    return "PhilHealth number already exists.";
  }

  if (
    (lower.includes("pag-ibig") || lower.includes("pagibig")) &&
    lower.includes("already")
  ) {
    return "Pag-IBIG number already exists.";
  }

  if (lower.includes("tin") && lower.includes("already")) {
    return "TIN number already exists.";
  }

  if (lower.includes("conflict")) {
    return "This record could not be saved because it conflicts with existing employee data.";
  }

  if (lower.includes("validation failed")) {
    return "Please review the employee details and try again.";
  }

  return raw;
}