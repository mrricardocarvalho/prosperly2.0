
const SETTINGS_KEY = 'prosperly_settings';

// Conversion: 1 USD = 0.85 EUR
const RATES = {
  USD: { EUR: 0.85, USD: 1 },
  EUR: { USD: 1 / 0.85, EUR: 1 },
};

export function convertAmount(amount, fromCurrency, toCurrency) {
  if (!RATES[fromCurrency] || !RATES[fromCurrency][toCurrency]) {
    throw new Error('Unsupported currency');
  }
  return Number((Number(amount) * RATES[fromCurrency][toCurrency]).toFixed(2));
}

export function getSettings() {
  const data = localStorage.getItem(SETTINGS_KEY);
  return data
    ? JSON.parse(data)
    : { currency: 'USD', theme: 'auto' };
}

export function setSettings(settings) {
  if (!settings || !['USD', 'EUR'].includes(settings.currency) || !['auto', 'light', 'dark'].includes(settings.theme)) {
    throw new Error('Invalid settings');
  }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
