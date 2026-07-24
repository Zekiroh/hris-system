type ConfigurationStatusBadgeProps = {
  isActive: boolean;
};

export const ConfigurationStatusBadge = ({
  isActive,
}: ConfigurationStatusBadgeProps) => (
  <span className={`badge ${isActive ? "badge-success" : "badge-warning"}`}>
    <span className="badge-dot" />
    {isActive ? "Active" : "Inactive"}
  </span>
);
