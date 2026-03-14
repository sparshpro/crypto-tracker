// api.js

const API_BASE = "https://api.coingecko.com/api/v3";

const OPTIONS = {
    method: "GET",
    headers: {
        accept: "application/json",
        "x-cg-demo-api-key": "CG-mDVVqLm5xBDjvcVq523LnAmB"
    }
};

const REQUEST_LIMIT = 6;
const WINDOW_TIME = 60000;
const CACHE_TTL = 60000;

let requestCount = 0;
let queue = [];
const cache = new Map();

setInterval(() => {
    requestCount = 0;
    processQueue();
}, WINDOW_TIME);

function processQueue() {
    while (queue.length && requestCount < REQUEST_LIMIT) {
        const { fn, resolve, reject } = queue.shift();
        requestCount++;

        fn()
            .then(resolve)
            .catch(reject);
    }
}

function enqueue(fn) {
    return new Promise((resolve, reject) => {
        queue.push({ fn, resolve, reject });
        processQueue();
    });
}

function getCache(key) {
    const item = cache.get(key);
    if (!item) return null;

    if (Date.now() - item.time > CACHE_TTL) {
        cache.delete(key);
        return null;
    }

    return item.data;
}

function setCache(key, data) {
    cache.set(key, {
        data,
        time: Date.now()
    });
}

async function apiFetch(endpoint) {

    const cached = getCache(endpoint);
    if (cached) return cached;

    try {
        const data = await enqueue(async () => {

            const res = await fetch(`${API_BASE}${endpoint}`, OPTIONS);

            if (!res.ok) {
                throw new Error(`API error: ${res.status}`);
            }

            return res.json();
        });

        setCache(endpoint, data);

        return data;

    } catch (err) {
        console.error("API fetch failed:", err);
        throw err;
    }
}

window.cryptoAPI = {

    async getCoins(page = 1, perPage = 25) {
        return apiFetch(
            `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}`
        );
    },

    async getCoinDetails(id) {
        return apiFetch(`/coins/${id}`);
    },

    async getMarketChart(id, days = 7) {
        return apiFetch(`/coins/${id}/market_chart?vs_currency=usd&days=${days}`);
    },

    async getSearchResults(query) {
        return apiFetch(`/search?query=${query}`);
    }

};