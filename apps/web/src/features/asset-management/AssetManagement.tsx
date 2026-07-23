import AdminAssetManagement from "./admin/AdminAssetManagement";
import UserAssetManagement from "./user/UserAssetManagement";

type AssetManagementProps = {
  mode: "admin" | "user";
};

const AssetManagement = ({ mode }: AssetManagementProps) => {
  if (mode === "admin") {
    return <AdminAssetManagement />;
  }

  return <UserAssetManagement />;
};

export default AssetManagement;
