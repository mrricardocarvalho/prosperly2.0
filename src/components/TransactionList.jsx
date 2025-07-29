
import React, { useState, useMemo } from 'react';
import DOMPurify from 'dompurify';
import moment from 'moment';
import { getTransactions } from '../data/transactions';
import { convertAmount } from '../utils/currency';

const PAGE_SIZE = 10;

const incomeCategories = ['salary', 'freelance', 'crypto', 'other'];
const expenseCategories = ['groceries', 'rent', 'utilities', 'other'];
const allCategories = [...incomeCategories, ...expenseCategories];

function truncate(str, n) {
  return str.length > n ? str.slice(0, n) + '…' : str;
}

export default function TransactionList() {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    currency: '',
  });
  const [page, setPage] = useState(1);

  // Fetch and filter transactions
  const filtered = useMemo(() => {
    return getTransactions({
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      category: filters.category || undefined,
      currency: filters.currency || undefined,
    });
  }, [filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleFilterChange(e) {
    const { name, value } = e.target;
    setFilters(f => ({ ...f, [name]: value }));
    setPage(1);
  }

  function handlePrev() {
    setPage(p => Math.max(1, p - 1));
  }
  function handleNext() {
    setPage(p => Math.min(totalPages, p + 1));
  }

  // Accessibility: role, aria-label, etc.
  return (
    <section className="mt-8 max-w-4xl mx-auto">
      <form className="flex flex-wrap gap-4 mb-4" aria-label="Transaction filters">
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
          className="rounded border-gray-300 px-2 py-1"
          aria-label="Start date"
        />
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
          className="rounded border-gray-300 px-2 py-1"
          aria-label="End date"
        />
        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="rounded border-gray-300 px-2 py-1"
          aria-label="Category"
        >
          <option value="">All Categories</option>
          {allCategories.map(cat => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>
        <select
          name="currency"
          value={filters.currency}
          onChange={handleFilterChange}
          className="rounded border-gray-300 px-2 py-1"
          aria-label="Currency"
        >
          <option value="">All Currencies</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
      </form>

      {/* Desktop Table */}
      <div className="hidden sm:block" aria-label="Transaction list" role="table">
        <table className="w-full bg-white rounded-lg shadow-md overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Currency</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6">No transactions</td>
              </tr>
            ) : (
              paged.map(tx => (
                <tr key={tx.id} className="border-t">
                  <td className="px-4 py-2">{moment.utc(tx.date).utcOffset(60).format('YYYY-MM-DD HH:mm')}</td>
                  <td className="px-4 py-2">{Number(tx.amount).toFixed(2)}</td>
                  <td className="px-4 py-2">{tx.category.charAt(0).toUpperCase() + tx.category.slice(1)}</td>
                  <td className="px-4 py-2" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(truncate(tx.description, 50)) }} />
                  <td className="px-4 py-2">{tx.currency}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden flex flex-col gap-4" aria-label="Transaction list" role="list">
        {paged.length === 0 ? (
          <div className="text-center py-6 bg-white rounded-lg shadow-md">No transactions</div>
        ) : (
          paged.map(tx => (
            <div key={tx.id} className="bg-white rounded-lg shadow-md p-4" role="listitem">
              <div className="font-semibold mb-1">{moment.utc(tx.date).utcOffset(60).format('YYYY-MM-DD HH:mm')}</div>
              <div className="text-primary font-bold">{Number(tx.amount).toFixed(2)} {tx.currency}</div>
              <div className="text-sm">{tx.category.charAt(0).toUpperCase() + tx.category.slice(1)}</div>
              <div className="text-gray-700 text-sm" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(truncate(tx.description, 50)) }} />
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={handlePrev}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            aria-label="Previous page"
          >Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button
            onClick={handleNext}
            disabled={page === totalPages}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            aria-label="Next page"
          >Next</button>
        </div>
      )}
    </section>
  );
}
