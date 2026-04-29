import { CalendarClock } from 'lucide-react';
import UserOtTable from './UserOtTable.tsx';

interface UserOtTabProps {
    loadingOt: boolean;
    myOvertime: Array<{
        id: number;
        date: string;
        duration: string;
        reason: string;
        status: string;
    }>;
    setIsOvertimeModalOpen: (value: boolean) => void;
}

const UserOtTab = ({ loadingOt, myOvertime, setIsOvertimeModalOpen }: UserOtTabProps) => {
    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-800">My Overtime Requests</h3>
                <button onClick={() => setIsOvertimeModalOpen(true)} className="btn btn-primary">
                    <CalendarClock className="h-4 w-4" /> Request OT
                </button>
            </div>

            <UserOtTable loadingOt={loadingOt} myOvertime={myOvertime} />
        </div>
    );
};

export default UserOtTab;
