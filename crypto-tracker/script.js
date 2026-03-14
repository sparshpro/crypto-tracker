const nextBtn = document.querySelector('#next-button');
const prevBtn =document.querySelector('#prev-button');

const showShimmer = () => {
    const shimmer = document.querySelector('.shimmer-container');
    const table = document.querySelector('#crypto-table');

    if (shimmer) shimmer.style.display = 'block';
    if (table) table.style.display = 'none';
    if(nextBtn) nextBtn.style.display ='none';
    if(prevBtn) prevBtn.style.display ='none';
};

const hideShimmer = () => {
    const shimmer = document.querySelector('.shimmer-container');
    const table = document.querySelector('#crypto-table');

    if (shimmer) shimmer.style.display = 'none';
    if (table) table.style.display = 'table';
    if(nextBtn) nextBtn.style.display ='block'
      if(prevBtn) prevBtn.style.display ='block';
};

// State variables
let coins = []; // Store coin data
let currentPage = 1; // Page tracking
const itemsPerPage = 25; // Number of items per page


// Fetch coins from API

const fetchCoins = async (page = 1) => {
    try {
        showShimmer();
        coins = await window.cryptoAPI.getCoins(page, itemsPerPage);
    } catch (err) {
        console.error("Error fetching data:", err);
    } finally {
        hideShimmer();
    }
    

    return coins;
}; 

// Handle favorite icon click
const handleFavoriteClick = (coinId, iconElement) => {
    const favorites = toggleFavorite(coinId);
    iconElement.classList.toggle('favorite', favorites.includes(coinId));
};

// Render a single coin row (entire row is clickable)
const renderCoinRow = (coin, index, start, favorites) => {
    const isFavorite = favorites.includes(coin.id);
    const row = document.createElement('tr');

    row.setAttribute('data-id', coin.id);
    row.classList.add('coin-row');
    row.innerHTML = `
        <td>${start + index}</td>
        <td><img src="${coin.image}" alt="${coin.name}" width="24" height="24" /></td>
        <td>${coin.name}</td>
        <td>$${coin.current_price.toLocaleString()}</td>
        <td>$${coin.total_volume.toLocaleString()}</td>
        <td>$${coin.market_cap.toLocaleString()}</td>
        <td>
            <i class="fas fa-star favorite-icon ${isFavorite ? 'favorite' : ''}" data-id="${coin.id}"></i>
        </td>
    `;

    return row;
};

// Render coins
const renderCoins = (coinsToDisplay, page, itemsPerPage) => {

    if (!Array.isArray(coinsToDisplay)) {
        console.error("Invalid coins data:", coinsToDisplay);
        return;
    }
    const start = (page - 1) * itemsPerPage + 1;
    const favorites = getFavorites();
    const tableBody = document.querySelector('#crypto-table tbody');
    
    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = ''; // Clear existing rows before rendering new data

    coinsToDisplay.forEach((coin, index) => {
        const row = renderCoinRow(coin, index, start, favorites);
        tableBody.appendChild(row);
    });
};

// Initialize the page
const initializePage = async () => {
    coins = await fetchCoins(currentPage);
    
    if (coins.length === 0) {
        console.error("No coins data fetched!");
        return;
    }
    renderCoins(coins, currentPage, 25);
};
// pagination controls
const updatePaginationControls = () => {
    prevBtn.disabled = currentPage === 1;
    nextBtn.querySelector('#next-button').disabled = coins.length < itemsPerPage;
};

// handle pagination button clicks
const handlePrevButtonClick = async () => {
    if (currentPage > 1) {
        currentPage--;
        coins = await fetchCoins(currentPage);
        renderCoins(coins, currentPage, itemsPerPage);
    }
};

const handleNextButtonClick = async () => {
    currentPage++;
    coins = await fetchCoins(currentPage);
    renderCoins(coins, currentPage, itemsPerPage);
};
if(document.querySelector('#prev-button') && document.querySelector('#next-button')){
    document.querySelector('#prev-button').addEventListener('click', handlePrevButtonClick);
    document.querySelector('#next-button').addEventListener('click', handleNextButtonClick);
}
// document.querySelector('#prev-button').addEventListener('click', handlePrevButtonClick);
// document.querySelector('#next-button').addEventListener('click', handleNextButtonClick);


// Event delegation for dynamic elements
document.addEventListener('click', (event) => {
    // Handle favorite icon click
    if (event.target.classList.contains('favorite-icon')) {
        event.stopPropagation(); // Prevent row click
        const coinId = event.target.dataset.id;
        handleFavoriteClick(coinId, event.target);
    }
    
    // Handle row click (Navigate to details page)
    const row = event.target.closest('.coin-row');
    if (row && !event.target.classList.contains('favorite-icon')) {
        const coinId = row.getAttribute('data-id');
        window.location.href = `coin.html?id=${coinId}`;
    }
});

// Debounce function
let debounceTimeout;
const debounce = (func, delay) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(func, delay);
};

// Fetch search results from API
const fetchSearchResults = async (query) => {
    try {
        const data = await window.cryptoAPI.getSearchResults(query);
        return data.coins;
    } catch (err) {
        console.error('Error fetching search results:', err);
        return [];
    }
};

// Show search results in the dialog
const showSearchResults = (results) => {
    const searchDialog = document.querySelector('#search-dialog');
    const resultsList = document.querySelector('#search-results');
    resultsList.innerHTML = '';

    if (results.length !== 0) {
        results.slice(0, 10).forEach(result => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <img src="${result.thumb}" alt="${result.name}" width="24" height="24" />
                <span>${result.name}</span>
            `;
            listItem.dataset.id = result.id;
            resultsList.appendChild(listItem);
        });
    } else {
        resultsList.innerHTML = '<li>No coin found.</li>';
    }

    resultsList.querySelectorAll('li').forEach(item => {
        item.addEventListener('click', (event) => {
            const coinId = event.currentTarget.dataset.id;
            window.location.href = `coin.html?id=${coinId}`;
        });
    });

    searchDialog.style.display = 'block';
};

// Close search dialog
const closeSearchDialog = () => {
    document.querySelector('#search-dialog').style.display = 'none';
};

// Handle search input with debounce
const handleSearchInput = () => {
    debounce(async () => {
        const searchTerm = document.querySelector('#search-box').value.trim();
        if (searchTerm) {
            const results = await fetchSearchResults(searchTerm);
            showSearchResults(results);
        } else {
            closeSearchDialog();
        }
    }, 300);
};

// Attach event listeners
document.addEventListener('DOMContentLoaded', initializePage);

const searchBox = document.querySelector('#search-box');
if (searchBox) {
    searchBox.addEventListener("input", handleSearchInput);
}

document.querySelector('#search-icon').addEventListener('click', handleSearchInput);
document.querySelector('#close-dialog').addEventListener('click', closeSearchDialog);



// Sorting functions
const sortCoinsByPrice = (order) => {
    coins.sort((a, b) => order === 'asc' ? a.current_price - b.current_price : b.current_price - a.current_price);
    renderCoins(coins, currentPage, 25);
};

const sortCoinsByVolume = (order) => {
    coins.sort((a, b) => order === 'asc' ? a.total_volume - b.total_volume : b.total_volume - a.total_volume);
    renderCoins(coins, currentPage, 25);
};

const sortCoinsByMarketCap = (order) => {
    coins.sort((a, b) => order === 'asc' ? a.market_cap - b.market_cap : b.market_cap - a.market_cap);
    renderCoins(coins, currentPage, 25);
};

// Event listeners for sorting
const sortPriceAsc = document.querySelector('#sort-price-asc');
if(sortPriceAsc){
    sortPriceAsc.addEventListener('click', () => sortCoinsByPrice('asc'));
}

const sortPriceDesc = document.querySelector('#sort-price-desc');
if(sortPriceDesc){
    sortPriceDesc.addEventListener('click', () => sortCoinsByPrice('desc'));
}

const sortVolumeAsc = document.querySelector('#sort-volume-asc');
if(sortVolumeAsc){
    sortVolumeAsc.addEventListener('click', () => sortCoinsByVolume('asc'));
}

const sortVolumeDesc = document.querySelector('#sort-volume-desc');
if(sortVolumeDesc){
    sortVolumeDesc.addEventListener('click', () => sortCoinsByVolume('desc'));
}

const sortMarketAsc = document.querySelector('#sort-market-asc');
if(sortMarketAsc){
    sortMarketAsc.addEventListener('click', () => sortCoinsByMarketCap('asc'));
}


const sortMarketDesc = document.querySelector('#sort-market-desc');
if(sortMarketDesc){
    sortMarketDesc.addEventListener('click', () => sortCoinsByMarketCap('desc'));
}

