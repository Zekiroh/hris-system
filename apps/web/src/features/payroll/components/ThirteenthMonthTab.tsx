import { DollarSign } from 'lucide-react';

type ThirteenthMonthTabProps = {
    onCompute: () => void;
};

const ThirteenthMonthTab = ({ onCompute }: ThirteenthMonthTabProps) => (
    <div className="space-y-5">
        <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-gray-800">13th Month Pay Computation</h3>
            <button onClick={onCompute} className="btn btn-primary">Compute All</button>
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <DollarSign className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gray-800">13th month computation is not yet configured</h4>
            <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
                Payroll currently supports compensation-based salary computation, overtime inclusion, deductions, payroll records, and payslip generation. 13th month computation will be enabled once its backend service is available.
            </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
            <h4 className="text-sm font-bold text-gray-700 mb-3">Computation Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
                <div><p className="text-xl font-bold text-gray-900">—</p><p className="text-xs text-gray-500">Total Employees</p></div>
                <div><p className="text-xl font-bold text-gray-900">—</p><p className="text-xs text-gray-500">Total Basic Salary Annual</p></div>
                <div><p className="text-xl font-bold text-emerald-600">—</p><p className="text-xs text-gray-500">Total 13th Month</p></div>
            </div>
        </div>
    </div>
);

export default ThirteenthMonthTab;
