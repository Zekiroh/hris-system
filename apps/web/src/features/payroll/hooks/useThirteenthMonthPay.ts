import { useCallback, useMemo, useState } from 'react';
import {
    getThirteenthMonthPay,
    type ThirteenthMonthPayDto,
} from '../../../services/api/payroll/payroll';

export const useThirteenthMonthPay = () => {
    const [year, setYear] = useState(String(new Date().getFullYear()));
    const [records, setRecords] = useState<ThirteenthMonthPayDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        const parsedYear = Number(year);
        setError('');

        if (!Number.isInteger(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
            setError('Enter a valid payroll year.');
            return;
        }

        setLoading(true);

        try {
            const result = await getThirteenthMonthPay(parsedYear);
            setRecords(result);
            setLoaded(true);
        } catch (requestError) {
            const message = requestError instanceof Error
                ? requestError.message
                : 'Unable to load 13th month pay computation.';
            setRecords([]);
            setLoaded(true);
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [year]);

    const summary = useMemo(() => ({
        totalEmployees: records.length,
        totalBasicSalaryEarned: records.reduce((sum, record) => sum + record.basicSalaryEarned, 0),
        totalThirteenthMonthPay: records.reduce((sum, record) => sum + record.thirteenthMonthPay, 0),
    }), [records]);

    return {
        year,
        setYear,
        records,
        loading,
        loaded,
        error,
        summary,
        load,
    };
};
