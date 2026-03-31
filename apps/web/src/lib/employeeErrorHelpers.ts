export type EmployeeFieldErrorKey =
  | "userId"
  | "employeeId"
  | "name"
  | "position"
  | "department"
  | "status"
  | "employmentType"
  | "contact"
  | "email"
  | "hireDate"
  | "addressLine1"
  | "addressLine2"
  | "city"
  | "province"
  | "zipCode"
  | "sssNumber"
  | "philHealthNumber"
  | "pagIbigNumber"
  | "tinNumber";

export type EmployeeFieldErrors = Partial<
  Record<EmployeeFieldErrorKey, string>
>;

export function normalizeBackendMessage(message: string): string {
  return message.trim().toLowerCase();
}

export function mapEmployeeMutationErrorToUiMessage(
  rawMessage: string,
  mode: "add" | "edit"
): {
  formMessage: string;
  fieldErrors?: EmployeeFieldErrors;
} {
  const normalized = normalizeBackendMessage(rawMessage);

  if (
    normalized.includes("linked user") &&
    (normalized.includes("already") || normalized.includes("exists"))
  ) {
    return {
      formMessage: "Selected user is already linked to an employee.",
      fieldErrors:
        mode === "add" ? { userId: "This user is already linked." } : undefined,
    };
  }

  if (normalized.includes("user") && normalized.includes("already assigned")) {
    return {
      formMessage: "Selected user is already linked to an employee.",
      fieldErrors:
        mode === "add" ? { userId: "This user is already linked." } : undefined,
    };
  }

  if (
    (normalized.includes("employee id") ||
      normalized.includes("employee number")) &&
    (normalized.includes("duplicate") ||
      normalized.includes("already exists") ||
      normalized.includes("already used") ||
      normalized.includes("unique"))
  ) {
    return {
      formMessage: "Employee ID already exists.",
      fieldErrors: { employeeId: "Employee ID already exists." },
    };
  }

  if (
    normalized === "duplicate_sss" ||
    (normalized.includes("sss") &&
      (normalized.includes("duplicate") ||
        normalized.includes("already exists") ||
        normalized.includes("already used") ||
        normalized.includes("unique")))
  ) {
    return {
      formMessage: "SSS number already exists.",
      fieldErrors: { sssNumber: "SSS number already exists." },
    };
  }

  if (
    normalized === "duplicate_philhealth" ||
    (normalized.includes("philhealth") &&
      (normalized.includes("duplicate") ||
        normalized.includes("already exists") ||
        normalized.includes("already used") ||
        normalized.includes("unique")))
  ) {
    return {
      formMessage: "PhilHealth number already exists.",
      fieldErrors: { philHealthNumber: "PhilHealth number already exists." },
    };
  }

  if (
    normalized === "duplicate_pagibig" ||
    ((normalized.includes("pag-ibig") || normalized.includes("pagibig")) &&
      (normalized.includes("duplicate") ||
        normalized.includes("already exists") ||
        normalized.includes("already used") ||
        normalized.includes("unique")))
  ) {
    return {
      formMessage: "Pag-IBIG number already exists.",
      fieldErrors: { pagIbigNumber: "Pag-IBIG number already exists." },
    };
  }

  if (
    normalized === "duplicate_tin" ||
    (normalized.includes("tin") &&
      (normalized.includes("duplicate") ||
        normalized.includes("already exists") ||
        normalized.includes("already used") ||
        normalized.includes("unique")))
  ) {
    return {
      formMessage: "TIN already exists.",
      fieldErrors: { tinNumber: "TIN already exists." },
    };
  }

  if (
    normalized.includes("email") &&
    (normalized.includes("duplicate") ||
      normalized.includes("already exists") ||
      normalized.includes("already used") ||
      normalized.includes("unique"))
  ) {
    return {
      formMessage: "Email is already used by another employee.",
      fieldErrors: { email: "Email already exists." },
    };
  }

  if (
    normalized.includes("contact") &&
    normalized.includes("number") &&
    (normalized.includes("duplicate") ||
      normalized.includes("already exists") ||
      normalized.includes("already used") ||
      normalized.includes("unique"))
  ) {
    return {
      formMessage: "Contact number is already used by another employee.",
      fieldErrors: { contact: "Contact number already exists." },
    };
  }

  if (
    normalized.includes("status") &&
    (normalized.includes("invalid") ||
      normalized.includes("not allowed") ||
      normalized.includes("conflict"))
  ) {
    return {
      formMessage:
        "Employee status update is not allowed for the current record.",
      fieldErrors: { status: "Invalid status update." },
    };
  }

  if (normalized.includes("not found") && normalized.includes("user")) {
    return {
      formMessage: "Selected user no longer exists.",
      fieldErrors:
        mode === "add" ? { userId: "Selected user is invalid." } : undefined,
    };
  }

  if (
    normalized.includes("validation failed") ||
    normalized.includes("validation error") ||
    normalized.includes("one or more validation errors occurred")
  ) {
    return {
      formMessage: "Please review the employee details and try again.",
    };
  }

  if (normalized.includes("conflict") && normalized.includes("employee")) {
    return {
      formMessage:
        mode === "add"
          ? "Employee record could not be created due to a duplicate or conflict."
          : "Employee record could not be updated due to a duplicate or conflict.",
    };
  }

  return {
    formMessage:
      mode === "add"
        ? rawMessage || "Failed to create employee."
        : rawMessage || "Failed to update employee.",
  };
}

export function normalizeDocumentError(
  rawMessage: string,
  action: "upload" | "download" | "delete" | "list"
): string {
  const message = rawMessage.trim().toLowerCase();

  if (!message) {
    switch (action) {
      case "upload":
        return "Failed to upload document.";
      case "download":
        return "Failed to download document.";
      case "delete":
        return "Failed to delete document.";
      default:
        return "Failed to load documents.";
    }
  }

  if (
    message.includes("file size") ||
    message.includes("too large") ||
    message.includes("exceeds")
  ) {
    return "File size must be less than 5MB.";
  }

  if (
    message.includes("file type") ||
    message.includes("content type") ||
    message.includes("invalid file") ||
    message.includes("not supported")
  ) {
    return "Only PDF, PNG, and JPG files are allowed.";
  }

  if (
    message.includes("already exists") ||
    message.includes("duplicate") ||
    message.includes("conflict")
  ) {
    return "A document with the same file already exists for this employee.";
  }

  if (
    message.includes("not found") ||
    message.includes("no such file") ||
    message.includes("missing")
  ) {
    return action === "list"
      ? "Some documents are no longer available."
      : "Document was not found or may have already been removed.";
  }

  if (
    message.includes("unauthorized") ||
    message.includes("forbidden") ||
    message.includes("permission")
  ) {
    return "You do not have permission to access this document.";
  }

  if (message.includes("employee") && message.includes("not found")) {
    return "Employee record was not found.";
  }

  switch (action) {
    case "upload":
      return rawMessage || "Failed to upload document.";
    case "download":
      return rawMessage || "Failed to download document.";
    case "delete":
      return rawMessage || "Failed to delete document.";
    default:
      return rawMessage || "Failed to load documents.";
  }
}