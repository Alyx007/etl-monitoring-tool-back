const COIN_ICONS = {
    bitcoin: '\u20BF',
    ethereum: '\u039E',
    solana: 'S',
    cardano: 'A',
    dogecoin: 'D',
};

const COIN_COLORS = {
    bitcoin: '#f7931a',
    ethereum: '#627eea',
    solana: '#9945ff',
    cardano: '#0033ad',
    dogecoin: '#c2a633',
};

export function getCoinIcon(coinId) {
    return COIN_ICONS[coinId] || coinId.charAt(0).toUpperCase();
}

export function getCoinColor(coinId) {
    return COIN_COLORS[coinId] || '#a855f7';
}
