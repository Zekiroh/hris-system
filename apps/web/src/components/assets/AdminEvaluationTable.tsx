import { ratingBadge } from './assetManagementConfig';
import type { AdminEvaluationRecord } from './assetManagementTypes';

type AdminEvaluationTableProps = {
    evaluations: AdminEvaluationRecord[];
};

const AdminEvaluationTable = ({ evaluations }: AdminEvaluationTableProps) => {
    return (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="pro-table">
                <thead><tr>{['Employee', 'Review Period', 'Reviewer', 'Score', 'Rating'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                    {evaluations.map((e, i) => (
                        <tr key={i}>
                            <td className="!font-medium !text-gray-800">{e.employee}</td>
                            <td>{e.period}</td>
                            <td>{e.reviewer}</td>
                            <td className="!font-bold">{e.score}</td>
                            <td><span className={`badge ${ratingBadge[e.status]}`}><span className="badge-dot" />{e.rating}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminEvaluationTable;
