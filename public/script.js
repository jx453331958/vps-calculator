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

// Fetch exchange rates on page load
async function fetchExchangeRates() {
    try {
        const response = await fetch('/api/rates');
        if (!response.ok) {
            throw new Error('Failed to fetch exchange rates');
        }
        const data = await response.json();
        exchangeRates = data.rates;
        updateExchangeRateDisplay();
        return true;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        document.getElementById('exchangeRate').placeholder = '汇率加载失败';
        return false;
    }
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

// Set default dates
function setDefaultDates() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const currentDateInput = document.getElementById('currentDate');
    const expiryDateInput = document.getElementById('expiryDate');
    
    if (!currentDateInput.value) {
        currentDateInput.value = todayStr;
    }
    
    // Set default expiry to 1 month from today if not set
    if (!expiryDateInput.value) {
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        expiryDateInput.value = nextMonth.toISOString().split('T')[0];
    }
}

// Calculate remaining value
async function calculate() {
    // Get input values
    const price = parseFloat(document.getElementById('price').value);
    const currency = document.getElementById('currency').value;
    const paymentCycle = document.getElementById('paymentCycle').value;
    const currentDateStr = document.getElementById('currentDate').value;
    const expiryDateStr = document.getElementById('expiryDate').value;
    
    // Validation
    if (!price || price <= 0) {
        alert('请输入有效的购买金额');
        return;
    }
    
    if (!currentDateStr) {
        alert('请选择当前日期');
        return;
    }
    
    if (!expiryDateStr) {
        alert('请选择到期时间');
        return;
    }
    
    // Fetch exchange rates if not already loaded
    if (!exchangeRates) {
        const success = await fetchExchangeRates();
        if (!success) {
            alert('无法获取汇率数据，请检查网络连接后重试');
            return;
        }
    }
    
    // Parse dates
    const currentDate = new Date(currentDateStr);
    const expiryDate = new Date(expiryDateStr);
    currentDate.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    
    // Validation: expiry date should be after current date
    if (expiryDate <= currentDate) {
        alert('到期时间必须晚于当前日期');
        return;
    }
    
    // Calculate days
    const cycleDays = CYCLE_DAYS[paymentCycle];
    const remainingDays = daysBetween(currentDate, expiryDate);
    const usedDays = Math.max(0, cycleDays - remainingDays);
    
    // Calculate values
    const dailyCostActual = price / cycleDays;
    const usedValue = dailyCostActual * usedDays;
    const remainingValue = dailyCostActual * remainingDays;
    const progressPercent = Math.min(100, (usedDays / cycleDays) * 100);
    // Update progress bar
    document.getElementById('progressBar').style.width = progressPercent + '%';
    document.getElementById('progressPercent').textContent = progressPercent.toFixed(1) + '%';
    document.getElementById('usedInfo').textContent = `已使用 ${usedDays} 天`;
    document.getElementById('remainingInfo').textContent = `剩余 ${remainingDays} 天`;
    
    // Update stats
    document.getElementById('dailyCost').textContent = formatCurrency(dailyCostActual, currency) + ' ' + currency;
    document.getElementById('usedValue').textContent = formatCurrency(usedValue, currency) + ' ' + currency;
    document.getElementById('remainingValue').textContent = formatCurrency(remainingValue, currency) + ' ' + currency;
    document.getElementById('remainingDays').textContent = remainingDays + ' 天';
    
    // Update multi-currency display
    updateCurrencyDisplay(remainingValue, currency);
    
    // Show results
    document.getElementById('results').style.display = 'block';
    
    // Smooth scroll to results
    setTimeout(() => {
        document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// Update currency display
function updateCurrencyDisplay(amount, fromCurrency) {
    const currencyGrid = document.getElementById('currencyGrid');
    currencyGrid.innerHTML = '';
    
    CURRENCIES.forEach(currency => {
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

// Screenshot to clipboard
async function screenshotToClipboard() {
    const card = document.getElementById('resultCard');
    try {
        const canvas = await html2canvas(card, { backgroundColor: '#ffffff', scale: 2 });
        canvas.toBlob(async (blob) => {
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                showToast('✅ 截图已复制到剪贴板');
            } catch (e) {
                // Fallback: download
                screenshotDownload();
                showToast('⚠️ 剪贴板不可用，已下载截图');
            }
        });
    } catch (e) {
        alert('截图失败: ' + e.message);
    }
}

// Screenshot download
async function screenshotDownload() {
    const card = document.getElementById('resultCard');
    try {
        const canvas = await html2canvas(card, { backgroundColor: '#ffffff', scale: 2 });
        const link = document.createElement('a');
        link.download = `vps-value-${new Date().toISOString().slice(0,10)}.png`;
        link.href = canvas.toDataURL();
        link.click();
        showToast('✅ 截图已下载');
    } catch (e) {
        alert('截图失败: ' + e.message);
    }
}

// Toast notification
function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 2000);
}

// Allow Enter key to trigger calculation
document.addEventListener('DOMContentLoaded', () => {
    // Set default dates
    setDefaultDates();
    
    // Pre-fetch exchange rates
    fetchExchangeRates();
    
    // Listen for currency change to update exchange rate display
    document.getElementById('currency').addEventListener('change', updateExchangeRateDisplay);
    
    // Allow Enter key to calculate
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                calculate();
            }
        });
    });
});
