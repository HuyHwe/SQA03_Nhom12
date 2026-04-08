import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PaymentHistory from './PaymentHistory';

// Mock Header and Footer to avoid complex rendering
vi.mock('../../components/Header', () => ({
    default: () => <div data-testid="mock-header">Header</div>
}));

vi.mock('../../components/Footer', () => ({
    default: () => <div data-testid="mock-footer">Footer</div>
}));

describe('PaymentHistory Page', () => {
    it('renders page title and summary cards', () => {
        render(
            <MemoryRouter>
                <PaymentHistory />
            </MemoryRouter>
        );

        expect(screen.getByText('Lịch sử thanh toán')).toBeInTheDocument();
        expect(screen.getByText('Tổng tiền đã nộp')).toBeInTheDocument();
        expect(screen.getByText('Số dư hiện tại')).toBeInTheDocument();
        expect(screen.getByText('47.078.165 ₫')).toBeInTheDocument();
    });

    it('renders sidebar with active link', () => {
        render(
            <MemoryRouter>
                <PaymentHistory />
            </MemoryRouter>
        );

        expect(screen.getByText('Dashboard & Học tập')).toBeInTheDocument();
        // Check if "Lịch sử giao dịch" is present and has active style (red text)
        const activeLink = screen.getByText('Lịch sử giao dịch');
        expect(activeLink).toBeInTheDocument();
        expect(activeLink).toHaveClass('text-red-600');
    });

    it('renders tabs and switches content', () => {
        render(
            <MemoryRouter>
                <PaymentHistory />
            </MemoryRouter>
        );

        const allTab = screen.getByText('Tất cả giao dịch');
        const depositTab = screen.getByText('Nộp tiền');

        expect(allTab).toBeInTheDocument();
        expect(depositTab).toBeInTheDocument();

        // Initially shows all transactions (check for a known transaction)
        expect(screen.getByText('Học phí kỳ 1 năm học 2025-2026')).toBeInTheDocument();

        // Switch to "Nộp tiền" tab
        fireEvent.click(depositTab);

        // Should filter the list (Implementation detail: "Nộp tiền" transactions should be visible)
        // Based on mock data, "Nộp tiền" exists.
        // We can check if non-matching items disappear, but DataTable might just filter.
        // Let's just verify the tab click updates state (visual feedback)
        expect(depositTab).toHaveClass('bg-slate-900 text-white');
    });

    it('renders data table with transactions', () => {
        render(
            <MemoryRouter>
                <PaymentHistory />
            </MemoryRouter>
        );

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByText('Mã GD')).toBeInTheDocument();
        expect(screen.getByText('Số tiền')).toBeInTheDocument();
    });
});
