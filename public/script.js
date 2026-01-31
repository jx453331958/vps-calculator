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
    
    const purchaseDateInput = document.getElementById('purchaseDate');
    const expiryDateInput = document.getElementById('expiryDate');
    
    if (!purchaseDateInput.value) {
        purchaseDateInput.value = todayStr;
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
    const purchaseDateStr = document.getElementById('purchaseDate').value;
    const expiryDateStr = document.getElementById('expiryDate').value;
    
    // Validation
    if (!price || price <= 0) {
        alert('请输入有效的购买金额');
        return;
    }
    
    if (!purchaseDateStr) {
        alert('请选择购买日期');
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
    const purchaseDate = new Date(purchaseDateStr);
    const expiryDate = new Date(expiryDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate day calculation
    
    // Validation: expiry date should be after purchase date
    if (expiryDate <= purchaseDate) {
        alert('到期时间必须晚于购买日期');
        return;
    }
    
    // Calculate days
    const totalDays = daysBetween(purchaseDate, expiryDate);
    const usedDays = Math.max(0, daysBetween(purchaseDate, today));
    const remainingDays = Math.max(0, daysBetween(today, expiryDate));
    
    // If today is after expiry, show warning
    if (today > expiryDate) {
        if (!confirm('VPS 已过期！是否继续计算？')) {
            return;
        }
    }
    
    // Calculate values (based on actual days)
    const dailyCostActual = price / totalDays;
    const usedValue = dailyCostActual * usedDays;
    const remainingValue = Math.max(0, price - usedValue);
    const progressPercent = Math.min(100, (usedDays / totalDays) * 100);
    
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
