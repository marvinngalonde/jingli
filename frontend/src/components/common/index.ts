/**
 * Chief Components — Barrel Export
 *
 * Import all reusable components from this single entry point:
 *   import { AppButton, AppModal, DataTable, PageHeader } from '@/components/common';
 */

// Chief components (new)
export { AppButton } from './AppButton';
export { AppModal } from './AppModal';
export { AppCard } from './AppCard';
export { StatCard } from './StatCard';
export { EmptyState } from './EmptyState';
export { SearchInput } from './SearchInput';

// Existing components (enhanced)
export { DataTable, type Column } from './DataTable';
export { PageHeader } from './PageHeader';
export { StatusBadge } from './StatusBadge';
export { ActionMenu } from './ActionMenu';
export { ConfirmModal } from './ConfirmModal';
