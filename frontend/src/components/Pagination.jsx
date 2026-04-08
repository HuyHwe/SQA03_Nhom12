import React from 'react'

function getPageItems(current, total) {
    const pages = []
    if (total <= 5) {
        for (let i = 1; i <= total; i++) pages.push(i)
        return pages
    }

    // total > 5
    if (current <= 3) {
        pages.push(1, 2, 3, 4, '...', total)
        return pages
    }

    if (current >= total - 2) {
        pages.push(1, '...', total - 3, total - 2, total - 1, total)
        return pages
    }

    // mid
    pages.push(1, '...', current - 1, current, current + 1, '...', total)
    return pages
}

function Pagination({ currentPage = 1, totalPages = 1, onPageChange = () => {} }) {
    const total = Math.max(1, parseInt(totalPages || 1, 10))
    const current = Math.min(Math.max(1, parseInt(currentPage || 1, 10)), total)

    const items = getPageItems(current, total)

    const handleClick = (page) => {
        if (page === '...' || page === current) return
        onPageChange(page)
    }

    return (
        <nav aria-label="Pagination" className="flex items-center gap-2 justify-center my-6">
            <button
                onClick={() => current > 1 && onPageChange(current - 1)}
                disabled={current === 1}
                className={`px-3 py-1 border rounded ${current === 1 ? 'bg-gray-200 text-gray-300 cursor-not-allowed' : 'bg-white hover:bg-gray-100'}`}>
                Prev
            </button>

            <ul className="flex items-center gap-1 list-none p-0 m-0">
                {items.map((it, idx) => (
                    <li key={`${it}-${idx}`}>
                        {it === '...' ? (
                            <span className="px-3 py-1">...</span>
                        ) : (
                            <button
                                onClick={() => handleClick(it)}
                                className={`px-3 py-1 border rounded ${it === current ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}`}>
                                {it}
                            </button>
                        )}
                    </li>
                ))}
            </ul>

            <button
                onClick={() => current < total && onPageChange(current + 1)}
                disabled={current === total}
                className={`px-3 py-1 border rounded ${current === total ? 'bg-gray-200 text-gray-300 cursor-not-allowed' : 'bg-white hover:bg-gray-100'}`}>
                Next
            </button>
        </nav>
    )
}

export default Pagination;