
import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { toast } from 'react-toastify';
import moment from 'moment';
import { addTransaction } from '../data/transactions';

const incomeCategories = ['salary', 'freelance', 'crypto', 'other'];
const expenseCategories = ['groceries', 'rent', 'utilities', 'other'];

const defaultDate = moment.utc().format('YYYY-MM-DD');

const initialState = {
  type: 'expense',
  amount: '',
  date: defaultDate,
  category: '',
  description: '',
  currency: 'USD',
};

export default function TransactionForm() {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const categories = form.type === 'income' ? incomeCategories : expenseCategories;

  function validate() {
    const errs = {};
    if (!form.type) errs.type = 'Type is required.';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) errs.amount = 'Amount must be positive.';
    if (!form.date || !moment(form.date, 'YYYY-MM-DD', true).isValid()) errs.date = 'Date is required.';
    if (!form.category) errs.category = 'Category is required.';
    if (!form.description || form.description.length > 100) errs.description = 'Description required (max 100 chars).';
    if (!form.currency) errs.currency = 'Currency is required.';
    return errs;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleTypeChange(e) {
    setForm(f => ({ ...f, type: e.target.value, category: '' }));
  }

  async function handleSubmit(e, addAnother = false) {
    e.preventDefault();
    setErrors({});
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error('Please fix errors before saving.');
      return;
    }
    setSaving(true);
    try {
      const sanitized = {
        ...form,
        description: DOMPurify.sanitize(form.description),
        amount: Number(Number(form.amount).toFixed(2)),
        date: moment.utc(form.date).format('YYYY-MM-DD'),
      };
      addTransaction(sanitized);
      toast.success('Transaction saved!');
      if (addAnother) {
        setForm(f => ({ ...initialState, type: f.type, currency: f.currency }));
      } else {
        setForm(initialState);
      }
    } catch (err) {
      toast.error(err.message || 'Error saving transaction.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      aria-label="Add transaction form"
      className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto mt-6"
      onSubmit={e => handleSubmit(e, false)}
    >
      <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 sm:gap-6">
        {/* Type */}
        <div>
          <label htmlFor="type" className="block font-medium">Type</label>
          <select
            id="type"
            name="type"
            value={form.type}
            onChange={handleTypeChange}
            aria-required="true"
            tabIndex={1}
            className="mt-1 w-full rounded border-gray-300 focus:ring-2 focus:ring-primary"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          {errors.type && <div className="text-red-500 text-sm">{errors.type}</div>}
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block font-medium">Amount</label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={handleChange}
            aria-required="true"
            tabIndex={2}
            className="mt-1 w-full rounded border-gray-300 focus:ring-2 focus:ring-primary"
          />
          {errors.amount && <div className="text-red-500 text-sm">{errors.amount}</div>}
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block font-medium">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            aria-required="true"
            tabIndex={3}
            className="mt-1 w-full rounded border-gray-300 focus:ring-2 focus:ring-primary"
          />
          {errors.date && <div className="text-red-500 text-sm">{errors.date}</div>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block font-medium">Category</label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            aria-required="true"
            tabIndex={4}
            className="mt-1 w-full rounded border-gray-300 focus:ring-2 focus:ring-primary"
          >
            <option value="">Select...</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
          {errors.category && <div className="text-red-500 text-sm">{errors.category}</div>}
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label htmlFor="description" className="block font-medium">Description</label>
          <input
            id="description"
            name="description"
            type="text"
            maxLength={100}
            value={form.description}
            onChange={handleChange}
            aria-required="true"
            tabIndex={5}
            className="mt-1 w-full rounded border-gray-300 focus:ring-2 focus:ring-primary"
          />
          {errors.description && <div className="text-red-500 text-sm">{errors.description}</div>}
        </div>

        {/* Currency */}
        <div>
          <label htmlFor="currency" className="block font-medium">Currency</label>
          <select
            id="currency"
            name="currency"
            value={form.currency}
            onChange={handleChange}
            aria-required="true"
            tabIndex={6}
            className="mt-1 w-full rounded border-gray-300 focus:ring-2 focus:ring-primary"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
          {errors.currency && <div className="text-red-500 text-sm">{errors.currency}</div>}
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={saving}
          tabIndex={7}
        >
          Save
        </button>
        <button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={e => handleSubmit(e, true)}
          disabled={saving}
          tabIndex={8}
        >
          Save & Add Another
        </button>
      </div>
    </form>
  );
}
