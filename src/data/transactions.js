
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

// Transaction schema reference:
// { id: string (UUID), type: 'income' | 'expense', amount: number (2 decimals), date: string (YYYY-MM-DD, UTC), category: string, description: string, currency: 'USD' | 'EUR' }

const STORAGE_KEY = 'prosperly_transactions';

function getAllTransactions() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveAllTransactions(transactions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

export function checkDuplicate(newTx) {
  const transactions = getAllTransactions();
  return transactions.some(tx =>
    tx.type === newTx.type &&
    Number(tx.amount).toFixed(2) === Number(newTx.amount).toFixed(2) &&
    tx.category === newTx.category &&
    tx.currency === newTx.currency &&
    Math.abs(moment.utc(tx.date).diff(moment.utc(newTx.date), 'minutes')) < 1
  );
}

export function addTransaction(tx) {
  if (!tx || !tx.type || !tx.amount || !tx.date || !tx.category || !tx.currency) {
    throw new Error('Missing required transaction fields');
  }
  if (checkDuplicate(tx)) {
    throw new Error('Duplicate transaction');
  }
  const transaction = {
    ...tx,
    id: uuidv4(),
    amount: Number(Number(tx.amount).toFixed(2)),
    date: moment.utc(tx.date).format('YYYY-MM-DD'),
  };
  const transactions = getAllTransactions();
  transactions.push(transaction);
  saveAllTransactions(transactions);
  return transaction;
}

/**
 * getTransactions({ startDate, endDate, category, currency })
 * All params optional. Dates in YYYY-MM-DD (UTC).
 */
export function getTransactions({ startDate, endDate, category, currency } = {}) {
  let txs = getAllTransactions();
  if (startDate) {
    txs = txs.filter(tx => moment.utc(tx.date).isSameOrAfter(moment.utc(startDate), 'day'));
  }
  if (endDate) {
    txs = txs.filter(tx => moment.utc(tx.date).isSameOrBefore(moment.utc(endDate), 'day'));
  }
  if (category) {
    txs = txs.filter(tx => tx.category === category);
  }
  if (currency) {
    txs = txs.filter(tx => tx.currency === currency);
  }
  return txs;
}
