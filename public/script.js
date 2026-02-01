import { domToBlob, domToCanvas } from 'https://cdn.jsdelivr.net/npm/modern-screenshot@4.6.8/+esm';

let exchangeRates = null;

// Supported currencies
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'HKD', 'SGD', 'AUD', 'CAD'];

// Save user preferences to localStorage
function savePreference(key, value) {
    try { localStorage.setItem('pref_' + key, value); } catch (e) {}
}

function loadPreference(key) {
    try { return localStorage.getItem('pref_' + key); } catch (e) { return null; }
}

// Payment cycle to days mapping
const CYCLE_DAYS = {
    'monthly': 30,
    'quarterly': 90,
    'semi-annually': 180,
    'annually': 365
};

// Fetch exchange rates with retry logic
async function fetchExchangeRates(retries = 3) {
    const rateDisplay = document.getElementById('exchangeRate');
    const refreshBtn = document.getElementById('refreshRateBtn');

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            rateDisplay.value = '';
            rateDisplay.placeholder = attempt > 1 ? `${t('msg-rate-retry')}(${attempt}/${retries})...` : t('rate-loading');
            if (refreshBtn) refreshBtn.classList.add('spinning');

            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }
            const data = await response.json();
            exchangeRates = data.rates;
            updateExchangeRateDisplay();
            if (refreshBtn) refreshBtn.classList.remove('spinning');
            return true;
        } catch (error) {
            console.error(`Exchange rate fetch attempt ${attempt} failed:`, error);
            if (attempt === retries) {
                rateDisplay.value = '';
                rateDisplay.placeholder = t('msg-rate-failed');
                if (refreshBtn) refreshBtn.classList.remove('spinning');
                return false;
            }
            await new Promise(r => setTimeout(r, attempt * 1000));
        }
    }
    return false;
}

// Update exchange rate display
function updateExchangeRateDisplay() {
    const currency = document.getElementById('currency').value;
    const targetCurrency = document.getElementById('targetCurrency').value;
    const rateDisplay = document.getElementById('exchangeRate');
    const priceCurrencyLabel = document.getElementById('priceCurrency');
    const rateCurrencyLabel = document.getElementById('rateCurrency');

    if (priceCurrencyLabel) {
        priceCurrencyLabel.textContent = `(${currency})`;
    }
    if (rateCurrencyLabel) {
        rateCurrencyLabel.textContent = `(${currency} → ${targetCurrency})`;
    }

    if (!exchangeRates) {
        rateDisplay.value = '';
        rateDisplay.placeholder = t('rate-loading');
        return;
    }

    if (currency === targetCurrency) {
        rateDisplay.value = '1.0000';
    } else {
        const fromRate = exchangeRates[currency];
        const toRate = exchangeRates[targetCurrency];
        if (fromRate && toRate) {
            rateDisplay.value = (toRate / fromRate).toFixed(4);
        }
    }
}

// Convert amount from one currency to another
function convertCurrency(amount, fromCurrency, toCurrency) {
    if (!exchangeRates) return null;
    const amountInUSD = amount / exchangeRates[fromCurrency];
    const convertedAmount = amountInUSD * exchangeRates[toCurrency];
    return convertedAmount;
}

// Format currency value
function formatCurrency(amount, currency) {
    const decimals = currency === 'JPY' ? 0 : 2;
    return amount.toFixed(decimals);
}

// Calculate days between two dates
function daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    const diffTime = Math.abs(date2 - date1);
    return Math.ceil(diffTime / oneDay);
}

// Set today's date as static display
function initCurrentDate() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const el = document.getElementById('currentDate');
    el.textContent = todayStr;
    el.dataset.value = todayStr;
}

let flatpickrInstance = null;

// Initialize flatpickr for expiry date only
function initDatePickers() {
    const today = new Date();
    const savedExpiry = loadPreference('expiryDate');
    let defaultExpiry;
    if (savedExpiry) {
        const saved = new Date(savedExpiry);
        defaultExpiry = saved > today ? saved : null;
    }
    if (!defaultExpiry) {
        defaultExpiry = new Date(today);
        defaultExpiry.setMonth(defaultExpiry.getMonth() + 1);
    }

    flatpickrInstance = flatpickr('#expiryDate', {
        locale: getLang().startsWith('zh') ? 'zh' : 'default',
        dateFormat: 'Y-m-d',
        disableMobile: true,
        defaultDate: defaultExpiry,
        onChange(selectedDates, dateStr) {
            if (dateStr) {
                savePreference('expiryDate', dateStr);
                setTimeout(autoRecalculate, 0);
            }
        },
    });
}

// Core calculation logic, silent=true skips alerts and scroll
async function doCalculate(silent = false) {
    const price = parseFloat(document.getElementById('price').value);
    const currency = document.getElementById('currency').value;
    const paymentCycle = document.getElementById('paymentCycle').value;
    const currentDateStr = document.getElementById('currentDate').dataset.value;
    const expiryDateStr = document.getElementById('expiryDate').value;

    if (!price || price <= 0) {
        if (!silent) showToast(t('msg-invalid-price'), 'error');
        return false;
    }
    if (!currentDateStr) {
        if (!silent) showToast(t('msg-select-current-date'), 'error');
        return false;
    }
    if (!expiryDateStr) {
        if (!silent) showToast(t('msg-select-expiry-date'), 'error');
        return false;
    }

    if (!exchangeRates) {
        const success = await fetchExchangeRates();
        if (!success) {
            if (!silent) showToast(t('msg-no-exchange-rate'), 'error');
            return false;
        }
    }

    const currentDate = new Date(currentDateStr);
    const expiryDate = new Date(expiryDateStr);
    currentDate.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);

    if (expiryDate <= currentDate) {
        if (!silent) showToast(t('msg-expiry-after-current'), 'error');
        return false;
    }

    const cycleDays = CYCLE_DAYS[paymentCycle];
    const remainingDays = daysBetween(currentDate, expiryDate);
    const usedDays = Math.max(0, cycleDays - remainingDays);
    const dailyCostActual = price / cycleDays;
    const remainingValue = dailyCostActual * remainingDays;

    document.getElementById('dailyCost').textContent = formatCurrency(dailyCostActual, currency) + ' ' + currency;
    document.getElementById('remainingValue').textContent = formatCurrency(remainingValue, currency) + ' ' + currency;
    document.getElementById('remainingDays').textContent = remainingDays + ' ' + t('days-unit');

    updateCurrencyDisplay(remainingValue, currency);

    const cycleKey = 'cycle-' + paymentCycle;
    document.getElementById('formulaBox').innerHTML = `
        <div class="formula-line"><strong>${t('formula-remaining-days')}</strong> = ${expiryDateStr} − ${currentDateStr} = <em>${remainingDays} ${t('days-unit')}</em></div>
        <div class="formula-line"><strong>${t('formula-daily-cost')}</strong> = ${price} ${currency} ÷ ${cycleDays}${t('days-unit')}（${t(cycleKey)}） = <em>${formatCurrency(dailyCostActual, currency)} ${currency}${t('per-day')}</em></div>
        <div class="formula-line"><strong>${t('formula-remaining-value')}</strong> = ${formatCurrency(dailyCostActual, currency)} × ${remainingDays} = <em>${formatCurrency(remainingValue, currency)} ${currency}</em></div>
    `;

    document.getElementById('results').style.display = 'block';
    return true;
}

// Button click: validate with alerts + scroll to results
async function calculate() {
    const ok = await doCalculate(false);
    if (ok) {
        setTimeout(() => {
            document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}

// Auto-recalculate silently when inputs change (only if results already shown)
function autoRecalculate() {
    if (document.getElementById('results').style.display === 'none') return;
    doCalculate(true);
}

// Update currency display
function updateCurrencyDisplay(amount, fromCurrency) {
    const currencyGrid = document.getElementById('currencyGrid');
    currencyGrid.innerHTML = '';

    const targetCurrency = document.getElementById('targetCurrency').value;
    const sortedCurrencies = [...CURRENCIES].sort((a, b) => {
        if (a === targetCurrency) return -1;
        if (b === targetCurrency) return 1;
        return 0;
    });

    sortedCurrencies.forEach(currency => {
        if (currency === fromCurrency) return;

        const converted = convertCurrency(amount, fromCurrency, currency);
        if (converted === null) return;

        const currencyItem = document.createElement('div');
        currencyItem.className = 'currency-item';
        currencyItem.innerHTML = `
            <div class="currency-code">${currency}</div>
            <div class="currency-value">${formatCurrency(converted, currency)}</div>
        `;
        currencyGrid.appendChild(currencyItem);
    });

    const locale = getLang().startsWith('zh') ? 'zh-CN' : 'en-US';
    const now = new Date();
    const timeStr = now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    document.getElementById('updateTime').textContent = `${t('updated-at')} ${timeStr}`;
}

// Capture a single element as canvas (no extra padding, raw capture)
function captureElement(el, opts = {}) {
    return domToCanvas(el, {
        scale: 2,
        backgroundColor: '#1a1740',
        style: {
            borderRadius: '0',
            margin: '0',
            overflow: 'visible',
        },
        ...opts,
    });
}

// Capture VPS info + result cards, stitch into one blob
async function captureResultCard() {
    const inputCard = document.querySelector('.input-card');
    const resultCard = document.getElementById('resultCard');
    if (!resultCard) throw new Error(t('msg-calculate-first'));

    const filterScreenshotBtns = (node) => {
        if (node instanceof Element && node.classList.contains('screenshot-actions')) return false;
        return true;
    };

    const [inputCanvas, resultCanvas] = await Promise.all([
        captureElement(inputCard, { filter: filterScreenshotBtns }),
        captureElement(resultCard, { filter: filterScreenshotBtns }),
    ]);

    const scale = 2;
    const padding = 24 * scale;
    const gap = 40 * scale;
    const contentWidth = Math.max(inputCanvas.width, resultCanvas.width);
    const width = contentWidth + padding * 2;
    const height = inputCanvas.height + resultCanvas.height + gap + padding * 2;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a1740';
    ctx.fillRect(0, 0, width, height);

    ctx.drawImage(inputCanvas, padding, padding);
    ctx.drawImage(resultCanvas, padding, padding + inputCanvas.height + gap);

    return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

// Screenshot to clipboard
async function screenshotToClipboard() {
    try {
        const blob = await captureResultCard();

        try {
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            showToast(t('msg-screenshot-copied'));
            return;
        } catch (clipErr) {
            // clipboard.write not supported or permission denied, fall through
        }

        downloadBlob(blob);
        showToast(t('msg-clipboard-fallback'));
    } catch (e) {
        showToast(t('msg-screenshot-failed') + e.message);
    }
}

function downloadBlob(blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `vps-value-${new Date().toISOString().slice(0,10)}.png`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
}

// Screenshot download
async function screenshotDownload() {
    try {
        const blob = await captureResultCard();
        downloadBlob(blob);
        showToast(t('msg-screenshot-downloaded'));
    } catch (e) {
        showToast(t('msg-screenshot-failed') + e.message);
    }
}

// Toast notification
function showToast(msg, type) {
    const toast = document.createElement('div');
    toast.className = 'toast' + (type === 'error' ? ' toast-error' : '');
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 2500);
}

// Language toggle
function toggleLang() {
    const newLang = getLang() === 'zh-CN' ? 'en' : 'zh-CN';
    setLang(newLang);
    applyTranslations();

    // Update flatpickr locale
    if (flatpickrInstance) {
        flatpickrInstance.set('locale', newLang.startsWith('zh') ? 'zh' : 'default');
    }

    // Re-calculate if results are shown
    if (document.getElementById('results').style.display !== 'none') {
        doCalculate(true);
    }
}

// Allow Enter key to trigger calculation
document.addEventListener('DOMContentLoaded', () => {
    // Apply initial language
    setLang(getLang());
    applyTranslations();

    // Initialize dates
    initCurrentDate();
    initDatePickers();

    // Restore saved preferences
    const savedCurrency = loadPreference('currency');
    if (savedCurrency) document.getElementById('currency').value = savedCurrency;
    const savedTarget = loadPreference('targetCurrency');
    if (savedTarget) document.getElementById('targetCurrency').value = savedTarget;

    // Pre-fetch exchange rates
    fetchExchangeRates();

    // Listen for currency change to update exchange rate display and save preference
    document.getElementById('currency').addEventListener('change', (e) => {
        savePreference('currency', e.target.value);
        updateExchangeRateDisplay();
    });
    document.getElementById('targetCurrency').addEventListener('change', (e) => {
        savePreference('targetCurrency', e.target.value);
        updateExchangeRateDisplay();
    });

    // Refresh rate button
    const refreshBtn = document.getElementById('refreshRateBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => fetchExchangeRates(2));
    }

    // Allow Enter key to calculate, and auto-recalculate on input change
    const inputs = document.querySelectorAll('.input-card input:not([id="currentDate"]):not([id="expiryDate"]), .input-card select');
    inputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                calculate();
            }
        });
        input.addEventListener('input', autoRecalculate);
        input.addEventListener('change', autoRecalculate);
    });
});

// Expose functions used in onclick attributes to global scope (ES module)
window.calculate = calculate;
window.screenshotToClipboard = screenshotToClipboard;
window.screenshotDownload = screenshotDownload;
window.toggleLang = toggleLang;
