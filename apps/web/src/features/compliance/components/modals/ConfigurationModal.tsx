import { X } from "lucide-react";

import {
  configurationFormFields,
  sectionLabels,
} from "../../config/configuration";
import type { ConfigurationModalState } from "../../config/types";

type ConfigurationModalProps = {
  configurationModal: NonNullable<ConfigurationModalState>;
  configurationSaveError: string | null;
  isSavingConfiguration: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: (key: string, value: string | boolean) => void;
};

export const ConfigurationModal = ({
  configurationModal,
  configurationSaveError,
  isSavingConfiguration,
  onClose,
  onSave,
  onChange,
}: ConfigurationModalProps) => (
  <div className="pro-modal-overlay">
    <div className="pro-modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
      <div className="pro-modal-header">
        <h3>
          {configurationModal.mode === "create" ? "Add" : "Edit"} {" "}
          {sectionLabels[configurationModal.section]}
        </h3>
        <button
          onClick={onClose}
          className="btn-ghost btn-icon"
          disabled={isSavingConfiguration}
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      <div className="pro-modal-body space-y-4">
        {configurationSaveError && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {configurationSaveError}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {configurationFormFields[configurationModal.section].map((field) => (
            <div key={field.key} className={field.type === "checkbox" ? "sm:col-span-2" : ""}>
              {field.type === "checkbox" ? (
                <label className="flex items-center gap-2 text-sm cursor-pointer mt-2">
                  <input
                    type="checkbox"
                    checked={Boolean(configurationModal.values[field.key])}
                    onChange={(e) =>
                      onChange(field.key, e.target.checked)
                    }
                    className="accent-emerald-600"
                  />
                  {field.label}
                </label>
              ) : (
                <>
                  <label className="pro-label">{field.label}</label>
                  <input
                    className="pro-input"
                    type={field.type ?? "text"}
                    step={field.type === "number" ? "0.01" : undefined}
                    value={String(configurationModal.values[field.key] ?? "")}
                    onChange={(e) =>
                      onChange(field.key, e.target.value)
                    }
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="pro-modal-footer">
        <button
          onClick={onClose}
          className="btn btn-secondary"
          disabled={isSavingConfiguration}
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="btn btn-primary"
          disabled={isSavingConfiguration}
        >
          {isSavingConfiguration ? "Saving..." : "Save Configuration"}
        </button>
      </div>
    </div>
  </div>
);
