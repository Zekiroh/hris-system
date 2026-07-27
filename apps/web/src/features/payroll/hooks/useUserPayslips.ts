import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    downloadPayslipPdf,
    getMyPayslips,
    type PayrollRecordDto,
} from '../../../services/api/payroll/payroll';
import { isReleased } from '../config/helpers';

export const useUserPayslips = () => {
    const [records, setRecords] = useState<PayrollRecordDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [downloadError, setDownloadError] = useState('');
    const [downloadingRecordId, setDownloadingRecordId] = useState<number | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const result = await getMyPayslips();
            const releasedRecords = result
                .filter((record) => isReleased(record.status))
                .sort((a, b) => b.payrollPeriodEndDate.localeCompare(a.payrollPeriodEndDate));
            setRecords(releasedRecords);
        } catch (requestError) {
            const message = requestError instanceof Error ? requestError.message : 'Unable to load payslips.';
            setRecords([]);
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const download = useCallback(async (recordId: number) => {
        setDownloadError('');
        setDownloadingRecordId(recordId);

        try {
            await downloadPayslipPdf(recordId);
        } catch (requestError) {
            const message = requestError instanceof Error ? requestError.message : 'Unable to download payslip PDF.';
            setDownloadError(message);
        } finally {
            setDownloadingRecordId(null);
        }
    }, []);

    const years = useMemo(
        () => Array.from(new Set(records.map((record) => new Date(record.payrollPeriodEndDate).getFullYear()).filter((year) => Number.isFinite(year)))).sort((a, b) => b - a),
        [records]
    );

    return {
        records,
        years,
        loading,
        error,
        downloadError,
        downloadingRecordId,
        refresh: load,
        download,
    };
};
