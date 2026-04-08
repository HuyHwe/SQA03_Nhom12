import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DataTable from './DataTable';

const mockData = [
    { id: 1, name: 'John Doe', role: 'Admin' },
    { id: 2, name: 'Jane Smith', role: 'User' },
    { id: 3, name: 'Bob Johnson', role: 'User' },
];

const mockColumns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'role', label: 'Role', sortable: false },
];

describe('DataTable Component', () => {
    it('renders table with data', () => {
        render(<DataTable data={mockData} columns={mockColumns} />);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('renders empty state when no data provided', () => {
        render(<DataTable data={[]} columns={mockColumns} />);
        expect(screen.getByText('Không có dữ liệu')).toBeInTheDocument();
    });

    it('filters data based on search query', () => {
        render(<DataTable data={mockData} columns={mockColumns} searchable={true} />);

        const searchInput = screen.getByPlaceholderText('Tìm kiếm...');
        fireEvent.change(searchInput, { target: { value: 'Jane' } });

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('sorts data when header is clicked', () => {
        render(<DataTable data={mockData} columns={mockColumns} />);

        const nameHeader = screen.getByText('Name');

        // Click to sort ASC
        fireEvent.click(nameHeader);
        const rowsAsc = screen.getAllByRole('row');
        // Row 0 is header, Row 1 is Bob, Row 2 is Jane, Row 3 is John (Alphabetical)
        expect(rowsAsc[1]).toHaveTextContent('Bob Johnson');

        // Click to sort DESC
        fireEvent.click(nameHeader);
        const rowsDesc = screen.getAllByRole('row');
        // Row 1 is John, Row 2 is Jane, Row 3 is Bob
        expect(rowsDesc[1]).toHaveTextContent('John Doe');
    });

    it('paginates data correctly', () => {
        const largeData = Array.from({ length: 15 }, (_, i) => ({ id: i + 1, name: `User ${i + 1}` }));
        render(<DataTable data={largeData} columns={[{ key: 'name', label: 'Name' }]} pageSize={10} />);

        expect(screen.getByText('User 1')).toBeInTheDocument();
        expect(screen.queryByText('User 11')).not.toBeInTheDocument();

        const nextButton = screen.getByText('Sau');
        fireEvent.click(nextButton);

        expect(screen.queryByText('User 1')).not.toBeInTheDocument();
        expect(screen.getByText('User 11')).toBeInTheDocument();
    });
});
