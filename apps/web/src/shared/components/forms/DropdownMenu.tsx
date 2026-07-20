import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type SelectOption = {
  label: string;
  value: string;
};

function getFieldClass(baseClass: string, hasError?: boolean) {
  return hasError
    ? `${baseClass} border-red-500 focus:border-red-500`
    : baseClass;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

export function DropdownMenu({
  value,
  options,
  placeholder,
  error,
  disabled,
  loading = false,
  onSelect,
  open,
  onToggle,
  onClose,
}: {
  value: string;
  options: SelectOption[];
  placeholder: string;
  error?: string;
  disabled?: boolean;
  loading?: boolean;
  onSelect: (value: string) => void;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const selectedOption = options.find((option) => option.value === value);
  const isInactive = disabled || loading;

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;

      if (
        rootRef.current &&
        dropdownRef.current &&
        !rootRef.current.contains(target) &&
        !dropdownRef.current.contains(target)
      ) {
        onClose();
      }
    }

    if (open) {
      document.addEventListener("click", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [open, onClose]);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;

    const updatePosition = () => {
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();

      setMenuStyle({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  const buttonLabel = loading
    ? "Loading..."
    : selectedOption?.label ?? placeholder;

  return (
    <div className="relative" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (!isInactive) {
            onToggle();
          }
        }}
        className={`${getFieldClass(
          "pro-input flex w-full items-center justify-between text-left",
          Boolean(error)
        )} ${isInactive ? "cursor-not-allowed text-gray-400" : ""}`}
        disabled={isInactive}
      >
        <span
          className={
            selectedOption
              ? isInactive
                ? "text-gray-400"
                : "text-gray-700"
              : "text-gray-500"
          }
        >
          {buttonLabel}
        </span>

        {!isInactive && <span className="ml-3 shrink-0 text-gray-400">▾</span>}
      </button>

      {open &&
        !isInactive &&
        menuStyle &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[9999] max-h-48 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-1 shadow-xl"
            style={{
              top: menuStyle.top,
              left: menuStyle.left,
              width: menuStyle.width,
            }}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`block w-full rounded-xl px-4 py-2.5 text-left text-sm transition ${
                  option.value === value
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => {
                  onSelect(option.value);
                  onClose();
                }}
              >
                {option.label}
              </button>
            ))}
          </div>,
          document.body
        )}

      <FieldError message={error} />
    </div>
  );
}
