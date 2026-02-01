const translations = {
    'zh-CN': {
        // Header
        'title': 'VPS 剩余价值计算器',
        'subtitle': '实时汇率 · 精准计算',

        // Input card
        'vps-info': 'VPS 信息',
        'purchase-amount': '购买金额',
        'currency-type': '货币种类',
        'payment-cycle': '付款周期',
        'today-rate': '今日汇率',
        'rate-api-source': 'API: ExchangeRate-API',
        'current-date': '当前日期',
        'expiry-date': '到期时间',
        'calculate-btn': '计算剩余价值',
        'input-placeholder': '输入金额',
        'rate-loading': '加载中...',
        'refresh-rate-title': '刷新汇率',
        'select-date': '选择日期',

        // Currency names
        'USD': 'USD - 美元',
        'EUR': 'EUR - 欧元',
        'GBP': 'GBP - 英镑',
        'CNY': 'CNY - 人民币',
        'JPY': 'JPY - 日元',
        'HKD': 'HKD - 港币',
        'SGD': 'SGD - 新加坡元',
        'AUD': 'AUD - 澳元',
        'CAD': 'CAD - 加元',

        // Payment cycles
        'monthly': '月付',
        'quarterly': '季付',
        'semi-annually': '半年付',
        'annually': '年付',

        // Result card
        'result-title': '计算结果',
        'copy-screenshot': '📋 复制截图',
        'download-screenshot': '💾 下载',
        'daily-cost': '每日成本',
        'remaining-value': '剩余价值',
        'remaining-days': '剩余天数',
        'multi-currency-value': '剩余价值（多币种）',
        'formula-title': '计算公式',

        // Formula
        'formula-remaining-days': '剩余天数',
        'formula-daily-cost': '每日成本',
        'formula-remaining-value': '剩余价值',
        'days-unit': '天',
        'per-day': '/天',

        // Cycle names in formula
        'cycle-monthly': '月付(30天)',
        'cycle-quarterly': '季付(90天)',
        'cycle-semi-annually': '半年付(180天)',
        'cycle-annually': '年付(365天)',

        // Messages
        'msg-invalid-price': '请输入有效的购买金额',
        'msg-select-current-date': '请选择当前日期',
        'msg-select-expiry-date': '请选择到期时间',
        'msg-no-exchange-rate': '无法获取汇率数据，请检查网络连接后重试',
        'msg-expiry-after-current': '到期时间必须晚于当前日期',
        'msg-calculate-first': '请先计算结果',
        'msg-screenshot-copied': '✅ 截图已复制到剪贴板',
        'msg-clipboard-fallback': '⚠️ 当前浏览器不支持复制图片到剪贴板，已自动下载',
        'msg-screenshot-failed': '⚠️ 截图失败: ',
        'msg-screenshot-downloaded': '✅ 截图已下载',
        'msg-rate-retry': '重试中',
        'msg-rate-failed': '加载失败，点击刷新',
        'updated-at': '更新于',

        // Footer
        'footer-text': '💡 使用实时汇率 API 提供准确换算',

        // SEO
        'seo-title': 'VPS 剩余价值计算器',
        'seo-description': 'VPS 剩余价值计算器 - 实时汇率换算，精准计算 VPS 剩余天数与价值，支持多币种显示',
        'seo-keywords': 'VPS,计算器,剩余价值,汇率,服务器,主机',

        // Language button
        'lang-toggle': '🌐 EN',
    },
    'en': {
        'title': 'VPS Remaining Value Calculator',
        'subtitle': 'Real-time Rates · Precise Calculation',

        'vps-info': 'VPS Information',
        'purchase-amount': 'Purchase Amount',
        'currency-type': 'Currency',
        'payment-cycle': 'Payment Cycle',
        'today-rate': 'Today\'s Rate',
        'rate-api-source': 'API: ExchangeRate-API',
        'current-date': 'Current Date',
        'expiry-date': 'Expiry Date',
        'calculate-btn': 'Calculate Remaining Value',
        'input-placeholder': 'Enter amount',
        'rate-loading': 'Loading...',
        'refresh-rate-title': 'Refresh rate',
        'select-date': 'Select date',

        'USD': 'USD - US Dollar',
        'EUR': 'EUR - Euro',
        'GBP': 'GBP - British Pound',
        'CNY': 'CNY - Chinese Yuan',
        'JPY': 'JPY - Japanese Yen',
        'HKD': 'HKD - Hong Kong Dollar',
        'SGD': 'SGD - Singapore Dollar',
        'AUD': 'AUD - Australian Dollar',
        'CAD': 'CAD - Canadian Dollar',

        'monthly': 'Monthly',
        'quarterly': 'Quarterly',
        'semi-annually': 'Semi-Annually',
        'annually': 'Annually',

        'result-title': 'Results',
        'copy-screenshot': '📋 Copy Screenshot',
        'download-screenshot': '💾 Download',
        'daily-cost': 'Daily Cost',
        'remaining-value': 'Remaining Value',
        'remaining-days': 'Remaining Days',
        'multi-currency-value': 'Remaining Value (Multi-Currency)',
        'formula-title': 'Formula',

        'formula-remaining-days': 'Remaining Days',
        'formula-daily-cost': 'Daily Cost',
        'formula-remaining-value': 'Remaining Value',
        'days-unit': 'days',
        'per-day': '/day',

        'cycle-monthly': 'Monthly (30 days)',
        'cycle-quarterly': 'Quarterly (90 days)',
        'cycle-semi-annually': 'Semi-Annual (180 days)',
        'cycle-annually': 'Annual (365 days)',

        'msg-invalid-price': 'Please enter a valid purchase amount',
        'msg-select-current-date': 'Please select the current date',
        'msg-select-expiry-date': 'Please select an expiry date',
        'msg-no-exchange-rate': 'Unable to fetch exchange rates. Please check your network and try again.',
        'msg-expiry-after-current': 'Expiry date must be after the current date',
        'msg-calculate-first': 'Please calculate first',
        'msg-screenshot-copied': '✅ Screenshot copied to clipboard',
        'msg-clipboard-fallback': '⚠️ Your browser does not support copying images. Downloaded instead.',
        'msg-screenshot-failed': '⚠️ Screenshot failed: ',
        'msg-screenshot-downloaded': '✅ Screenshot downloaded',
        'msg-rate-retry': 'Retrying',
        'msg-rate-failed': 'Failed to load. Click to refresh.',
        'updated-at': 'Updated at',

        'footer-text': '💡 Powered by real-time exchange rate API',

        'seo-title': 'VPS Remaining Value Calculator',
        'seo-description': 'VPS Remaining Value Calculator - Real-time exchange rates, accurately calculate remaining days and value of your VPS, multi-currency support',
        'seo-keywords': 'VPS,calculator,remaining value,exchange rate,server,hosting',

        'lang-toggle': '🌐 中文',
    }
};

let currentLang = 'zh-CN';

function detectLang() {
    const stored = localStorage.getItem('lang');
    if (stored && translations[stored]) return stored;
    const nav = navigator.language || navigator.userLanguage || '';
    return nav.startsWith('zh') ? 'zh-CN' : 'en';
}

function getLang() {
    return currentLang;
}

function setLang(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
}

function t(key) {
    const pack = translations[currentLang] || translations['zh-CN'];
    return pack[key] !== undefined ? pack[key] : key;
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const target = el.getAttribute('data-i18n-target');
        if (target === 'placeholder') {
            el.placeholder = t(key);
        } else if (target === 'title') {
            el.title = t(key);
        } else {
            el.textContent = t(key);
        }
    });

    // Update select options that have data-i18n-option
    document.querySelectorAll('option[data-i18n]').forEach(opt => {
        opt.textContent = t(opt.getAttribute('data-i18n'));
    });

    // Update lang toggle button text
    const langBtn = document.getElementById('langToggleBtn');
    if (langBtn) langBtn.textContent = t('lang-toggle');

    // Update SEO meta tags
    document.title = t('seo-title');
    const setMeta = (sel, val) => { const el = document.querySelector(sel); if (el) el.setAttribute('content', val); };
    setMeta('meta[name="description"]', t('seo-description'));
    setMeta('meta[name="keywords"]', t('seo-keywords'));
    setMeta('meta[property="og:title"]', t('seo-title'));
    setMeta('meta[property="og:description"]', t('seo-description'));
    setMeta('meta[name="twitter:title"]', t('seo-title'));
    setMeta('meta[name="twitter:description"]', t('seo-description'));

    // Update JSON-LD structured data
    const jsonLd = document.querySelector('script[type="application/ld+json"]');
    if (jsonLd) {
        try {
            const data = JSON.parse(jsonLd.textContent);
            data.name = t('seo-title');
            data.description = t('seo-description');
            jsonLd.textContent = JSON.stringify(data, null, 4);
        } catch (e) {}
    }
}

// Initialize language on load
currentLang = detectLang();
