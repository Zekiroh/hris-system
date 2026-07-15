import { DollarSign, Download } from 'lucide-react';

type GovernmentDeduction = {
    name: string;
    status: string;
    desc: string;
    color: string;
};

type DeductionsTabProps = {
    govDeductions: GovernmentDeduction[];
    onGenerateRemittance: () => void;
};

const DeductionsTab = ({ govDeductions, onGenerateRemittance }: DeductionsTabProps) => (
    <div className="space-y-6">
        <h3 className="text-base font-bold text-gray-800">Government Deductions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {govDeductions.map(d => (
                <div key={d.name} className="p-5 border border-gray-100 rounded-xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: `${d.color}15`, color: d.color }}>
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800">{d.name}</h4>
                        <p className="text-lg font-bold" style={{ color: d.color }}>{d.status}</p>
                        <p className="text-xs text-gray-400">{d.desc}</p>
                    </div>
                </div>
            ))}
        </div>
        <div className="p-5 border border-gray-100 rounded-xl">
            <h4 className="text-sm font-bold text-gray-700 mb-2">Deductions Tracking — Monthly Breakdown</h4>
            <p className="text-sm text-gray-500">
                Government contribution and withholding tax tracking will be available once the Government Compliance module is configured.
            </p>
        </div>
        <div className="flex gap-3">
            <button onClick={onGenerateRemittance} className="btn btn-primary">Generate Remittance Report</button>
            <button className="btn btn-secondary"><Download className="w-4 h-4" /> Export to Excel</button>
        </div>
    </div>
);

export default DeductionsTab;
