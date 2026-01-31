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
    
    // Update formula with real values
    const cycleNames = { 'monthly': '月付(30天)', 'quarterly': '季付(90天)', 'semi-annually': '半年付(180天)', 'annually': '年付(365天)' };
    document.getElementById('formulaBox').innerHTML = `
        <div class="formula-line"><strong>剩余天数</strong> = ${expiryDateStr} − ${currentDateStr} = <em>${remainingDays} 天</em></div>
        <div class="formula-line"><strong>每日成本</strong> = ${price} ${currency} ÷ ${cycleDays}天（${cycleNames[paymentCycle]}） = <em>${formatCurrency(dailyCostActual, currency)} ${currency}/天</em></div>
        <div class="formula-line"><strong>剩余价值</strong> = ${formatCurrency(dailyCostActual, currency)} × ${remainingDays} = <em>${formatCurrency(remainingValue, currency)} ${currency}</em></div>
    `;
    
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

// Capture the full page (input + result) as canvas
async function captureFullPage() {
    const container = document.querySelector('.container');
    return await html2canvas(container, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (doc) => {
            const c = doc.querySelector('.container');
            c.style.background = '#ffffff';
            c.style.padding = '32px';
            c.style.maxWidth = '800px';
            // Hide background animation
            const bg = doc.querySelector('.background-animation');
            if (bg) bg.style.display = 'none';
            // Force body bg white
            doc.body.style.background = '#ffffff';
            // Hide screenshot buttons in the capture
            doc.querySelectorAll('.screenshot-actions').forEach(el => el.style.display = 'none');
            // Fix all text to dark colors for readability
            const fixes = [
                ['.title', { color: '#1a1a2e' }],
                ['.subtitle', { color: '#555' }],
                ['.card', { background: '#f8f9fa', color: '#333', border: '1px solid #e0e0e0' }],
                ['.card-title', { color: '#333' }],
                ['label', { color: '#555' }],
                ['input, select', { color: '#333', background: '#fff', border: '1px solid #ccc' }],
                ['.calculate-btn', { background: '#4361ee', color: '#fff' }],
                ['.section-subtitle', { color: '#333' }],
                ['.update-time', { color: '#888' }],
                ['.currency-item', { background: '#f0f2f5', color: '#333' }],
                ['.currency-code', { color: '#555' }],
                ['.currency-value', { color: '#333' }],
                ['.stat-item', { background: '#f0f2f5', color: '#333' }],
                ['.stat-label', { color: '#888' }],
                ['.stat-value', { color: '#333' }],
                ['.progress-info span', { color: '#666' }],
                ['.progress-label span', { color: '#333' }],
                ['.formula-box', { background: '#f5f5f5', color: '#333' }],
                ['.footer', { color: '#888' }],
                ['.api-source', { color: '#999' }],
                ['.result-card', { background: '#ffffff' }],
                ['.input-card', { background: '#ffffff' }],
                ['.header', { color: '#333' }],
            ];
            fixes.forEach(([sel, styles]) => {
                c.querySelectorAll(sel).forEach(el => Object.assign(el.style, styles));
            });
            // Ensure results visible
            const results = doc.getElementById('results');
            if (results) results.style.display = 'block';
        }
    });
}

// Screenshot to clipboard (with HTTP fallback)
async function screenshotToClipboard() {
    try {
        const canvas = await captureFullPage();
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        // Try modern clipboard API first
        if (navigator.clipboard && navigator.clipboard.write) {
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            showToast('✅ 截图已复制到剪贴板');
        } else {
            // Fallback: auto-download instead
            const link = document.createElement('a');
            link.download = `vps-value-${new Date().toISOString().slice(0,10)}.png`;
            link.href = canvas.toDataURL();
            link.click();
            showToast('⚠️ HTTP 环境不支持复制到剪贴板，已自动下载');
        }
    } catch (e) {
        // Final fallback: try download
        try {
            const canvas = await captureFullPage();
            const link = document.createElement('a');
            link.download = `vps-value-${new Date().toISOString().slice(0,10)}.png`;
            link.href = canvas.toDataURL();
            link.click();
            showToast('⚠️ 复制失败，已自动下载截图');
        } catch (e2) {
            showToast('⚠️ 截图失败: ' + e.message);
        }
    }
}

// Screenshot download
async function screenshotDownload() {
    try {
        const canvas = await captureFullPage();
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
