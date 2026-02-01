import { domToBlob, domToCanvas } from 'https://cdn.jsdelivr.net/npm/modern-screenshot@4.6.8/+esm';

let exchangeRates = null;

// Supported currencies
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'HKD', 'SGD', 'AUD', 'CAD'];

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
            rateDisplay.placeholder = attempt > 1 ? `重试中(${attempt}/${retries})...` : '加载中...';
            if (refreshBtn) refreshBtn.classList.add('spinning');

            // 直接从前端请求汇率 API
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
                rateDisplay.placeholder = '加载失败，点击刷新';
                if (refreshBtn) refreshBtn.classList.remove('spinning');
                return false;
            }
            // Wait before retry (1s, 2s)
            await new Promise(r => setTimeout(r, attempt * 1000));
        }
    }
    return false;
}

// Update exchange rate display
function updateExchangeRateDisplay() {
    const currency = document.getElementById('currency').value;
    const rateDisplay = document.getElementById('exchangeRate');
    const priceCurrencyLabel = document.getElementById('priceCurrency');
    const rateCurrencyLabel = document.getElementById('rateCurrency');

    // Update currency labels
    if (priceCurrencyLabel) {
        priceCurrencyLabel.textContent = `(${currency})`;
    }
    if (rateCurrencyLabel) {
        rateCurrencyLabel.textContent = `(${currency})`;
    }

    if (!exchangeRates) {
        rateDisplay.value = '';
        rateDisplay.placeholder = '加载中...';
        return;
    }

    if (currency === 'CNY') {
        rateDisplay.value = '1.0000';
    } else {
        const rate = exchangeRates[currency];
        if (rate) {
            const cnyRate = rate / exchangeRates['CNY'];
            rateDisplay.value = (1 / cnyRate).toFixed(4);
        }
    }
}

// Convert amount from one currency to another
function convertCurrency(amount, fromCurrency, toCurrency) {
    if (!exchangeRates) return null;

    // Convert to USD first, then to target currency
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
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
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

// Initialize flatpickr for expiry date only
function initDatePickers() {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    flatpickr('#expiryDate', {
        locale: 'zh',
        dateFormat: 'Y-m-d',
        disableMobile: true,
        defaultDate: nextMonth,
        onChange(selectedDates, dateStr) {
            if (dateStr) setTimeout(autoRecalculate, 0);
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

    // Validation
    if (!price || price <= 0) {
        if (!silent) showToast('请输入有效的购买金额', 'error');
        return false;
    }
    if (!currentDateStr) {
        if (!silent) showToast('请选择当前日期', 'error');
        return false;
    }
    if (!expiryDateStr) {
        if (!silent) showToast('请选择到期时间', 'error');
        return false;
    }

    if (!exchangeRates) {
        const success = await fetchExchangeRates();
        if (!success) {
            if (!silent) showToast('无法获取汇率数据，请检查网络连接后重试', 'error');
            return false;
        }
    }

    const currentDate = new Date(currentDateStr);
    const expiryDate = new Date(expiryDateStr);
    currentDate.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);

    if (expiryDate <= currentDate) {
        if (!silent) showToast('到期时间必须晚于当前日期', 'error');
        return false;
    }

    const cycleDays = CYCLE_DAYS[paymentCycle];
    const remainingDays = daysBetween(currentDate, expiryDate);
    const usedDays = Math.max(0, cycleDays - remainingDays);
    const dailyCostActual = price / cycleDays;
    const remainingValue = dailyCostActual * remainingDays;

    document.getElementById('dailyCost').textContent = formatCurrency(dailyCostActual, currency) + ' ' + currency;
    document.getElementById('remainingValue').textContent = formatCurrency(remainingValue, currency) + ' ' + currency;
    document.getElementById('remainingDays').textContent = remainingDays + ' 天';

    updateCurrencyDisplay(remainingValue, currency);

    const cycleNames = { 'monthly': '月付(30天)', 'quarterly': '季付(90天)', 'semi-annually': '半年付(180天)', 'annually': '年付(365天)' };
    document.getElementById('formulaBox').innerHTML = `
        <div class="formula-line"><strong>剩余天数</strong> = ${expiryDateStr} − ${currentDateStr} = <em>${remainingDays} 天</em></div>
        <div class="formula-line"><strong>每日成本</strong> = ${price} ${currency} ÷ ${cycleDays}天（${cycleNames[paymentCycle]}） = <em>${formatCurrency(dailyCostActual, currency)} ${currency}/天</em></div>
        <div class="formula-line"><strong>剩余价值</strong> = ${formatCurrency(dailyCostActual, currency)} × ${remainingDays} = <em>${formatCurrency(remainingValue, currency)} ${currency}</em></div>
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

    // Sort: CNY first, then rest
    const sortedCurrencies = [...CURRENCIES].sort((a, b) => {
        if (a === 'CNY') return -1;
        if (b === 'CNY') return 1;
        return 0;
    });

    sortedCurrencies.forEach(currency => {
        if (currency === fromCurrency) return; // Skip the original currency

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

    // Update time
    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('updateTime').textContent = `更新于 ${timeStr}`;
}

// Capture a single element as canvas
function captureElement(el, opts = {}) {
    const padding = 24;
    return domToCanvas(el, {
        scale: 2,
        backgroundColor: '#1a1740',
        width: el.scrollWidth + padding * 2,
        height: el.scrollHeight + padding * 2,
        style: {
            padding: padding + 'px',
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
    if (!resultCard) throw new Error('请先计算结果');

    const filterScreenshotBtns = (node) => {
        if (node instanceof Element && node.classList.contains('screenshot-actions')) return false;
        return true;
    };

    const [inputCanvas, resultCanvas] = await Promise.all([
        captureElement(inputCard, { filter: filterScreenshotBtns }),
        captureElement(resultCard, { filter: filterScreenshotBtns }),
    ]);

    // Stitch two canvases vertically with a gap
    const gap = 40;
    const padding = 48;
    const width = Math.max(inputCanvas.width, resultCanvas.width) + padding * 2;
    const height = inputCanvas.height + resultCanvas.height + gap + padding * 2;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a1740';
    ctx.fillRect(0, 0, width, height);

    const inputX = padding;
    const resultX = padding;
    ctx.drawImage(inputCanvas, inputX, padding);
    ctx.drawImage(resultCanvas, resultX, padding + inputCanvas.height + gap);

    return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

// Screenshot to clipboard
async function screenshotToClipboard() {
    try {
        const blob = await captureResultCard();

        // Try clipboard API directly
        try {
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            showToast('✅ 截图已复制到剪贴板');
            return;
        } catch (clipErr) {
            // clipboard.write not supported or permission denied, fall through
        }

        // Fallback: download
        downloadBlob(blob);
        showToast('⚠️ 当前浏览器不支持复制图片到剪贴板，已自动下载');
    } catch (e) {
        showToast('⚠️ 截图失败: ' + e.message);
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
        showToast('✅ 截图已下载');
    } catch (e) {
        showToast('⚠️ 截图失败: ' + e.message);
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

// Allow Enter key to trigger calculation
document.addEventListener('DOMContentLoaded', () => {
    // Initialize dates
    initCurrentDate();
    initDatePickers();

    // Pre-fetch exchange rates
    fetchExchangeRates();

    // Listen for currency change to update exchange rate display
    document.getElementById('currency').addEventListener('change', updateExchangeRateDisplay);

    // Refresh rate button
    const refreshBtn = document.getElementById('refreshRateBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => fetchExchangeRates(2));
    }

    // Allow Enter key to calculate, and auto-recalculate on input change
    // Exclude flatpickr-managed date inputs — their changes are handled by flatpickr onChange
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
