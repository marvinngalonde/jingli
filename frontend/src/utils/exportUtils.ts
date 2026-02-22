import Papa from 'papaparse';
import { api } from '../services/api';

/**
 * Download in-browser CSV from in-memory data via papaparse.
 */
export function exportToCsv<T>(data: T[], filename: string) {
    if (!data || !data.length) return;
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Stream a PDF from a backend endpoint and trigger a browser download.
 * @param endpoint  e.g. '/students/export/pdf'
 * @param filename  Base filename (no .pdf extension)
 */
export async function exportToPdf(endpoint: string, filename: string) {
    const response = await api.get(endpoint, { responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.pdf`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
