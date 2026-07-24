import AdminPayroll from './admin/AdminPayroll';
import UserPayroll from './user/UserPayroll';

type PayrollMode = 'admin' | 'user';

type PayrollProps = {
    mode: PayrollMode;
};

const Payroll = ({ mode }: PayrollProps) => {
    return mode === 'admin' ? <AdminPayroll /> : <UserPayroll />;
};

export default Payroll;
