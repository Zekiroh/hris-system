import AdminEvaluationTable from '../AdminEvaluationTable';
import type { AdminEvaluationRecord } from '../assetManagementTypes';

type AdminEvaluationTabProps = {
    evaluations: AdminEvaluationRecord[];
};

const AdminEvaluationTab = ({ evaluations }: AdminEvaluationTabProps) => {
    return (
        <div className="space-y-5">
            <h3 className="text-base font-bold text-gray-800">Performance Evaluation Results</h3>
            <AdminEvaluationTable evaluations={evaluations} />
        </div>
    );
};

export default AdminEvaluationTab;
