import { ratingBadge } from './assetManagementConfig';
import type { PerformanceEvaluationDto } from '../../lib/performance';

type AdminEvaluationTableProps = {
    evaluations: PerformanceEvaluationDto[];
};

const AdminEvaluationTable = ({ evaluations }: AdminEvaluationTableProps) => {
    return (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="pro-table">
                <thead><tr>{['Employee', 'Review Period', 'Reviewer', 'Score', 'Rating'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                    {evaluations.map(e => (
                        <tr key={e.id}>
                            <td className="!font-medium !text-gray-800">{e.employeeName}</td>
                            <td>{e.reviewPeriod}</td>
                            <td>{e.reviewerName ?? 'Not assigned'}</td>
                            <td className="!font-bold">{e.score}/5.0</td>
                            <td><span className={`badge ${ratingBadge[e.rating] ?? 'badge-neutral'}`}><span className="badge-dot" />{e.rating}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminEvaluationTable;
