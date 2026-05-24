export const exchangeRates = {
    NGN: 1,
    USD: 1550,
    EUR: 1700,
    GBP: 2000
};

export const convertCurrency = (
    amount,
    from = 'NGN',
    to = 'NGN'
) => {
    
    if (!amount) return 0;

    // Convert to NGN first
    const amountInNGN =
    from === 'NGN'
    ? amount
    : amount * exchangeRates[from];

    // Convert from NGN to target currency
    return amountInNGN / exchangeRates[to];
};

export const formatCurrency = (
    amount,
    currency = 'NGN'
) => {
    const locales = {
        NGN: 'en-NG',
        USD: 'en-US',
        EUR: 'de-DE',
        GBP: 'en-GB'
    };

    return new Intl.NumberFormat(
        locales[currency],
        {
            style: 'currency',
            currency,
            minimumFractionDigits: 0
        }
    ).format(amount || 0);
};