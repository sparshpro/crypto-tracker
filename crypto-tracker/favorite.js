

// Fetches and displays favorite coins
const fetchFavoriteCoins = async () => {
    const favorites = getFavorites();
    const tableBody = document.querySelector('#favorite-table tbody');
    const noFavoritesMessage = document.getElementById('no-favorites');

    if (favorites.length === 0) {
        tableBody.innerHTML = '';
        noFavoritesMessage.style.display = 'block';
        return;
    }

    noFavoritesMessage.style.display = 'none';

    try {

        const data = await window.cryptoAPI.getCoins(1, 250);

    

        if (!Array.isArray(data)) {
            console.error("Invalid API response:", data);
            tableBody.innerHTML = '<tr><td colspan="7">API error. Try again later.</td></tr>';
            return;
        }

        const favoriteCoins = data.filter(coin =>
            favorites.includes(coin.id)
        );

        if (!favoriteCoins.length) {
            tableBody.innerHTML = '<tr><td colspan="7">No data available.</td></tr>';
            return;
        }

        renderFavorites(favoriteCoins);

    } catch (err) {
        console.error('Error fetching favorite coins:', err);
        tableBody.innerHTML = '<tr><td colspan="7">Failed to load data.</td></tr>';
    }
};

// Renders favorite coins in the table
const renderFavorites = (coins) => {
    const tableBody = document.querySelector('#favorite-table tbody');
    tableBody.innerHTML = '';

    coins.forEach((coin, index) => {
        const row = document.createElement('tr');
        row.classList.add("coin-row");
        row.dataset.coinId = coin.id;

        row.innerHTML = `
            <td>${index + 1}</td>
            <td><img src="${coin.image}" alt="${coin.name}" width="24" height="24" /></td>
            <td>${coin.name} (${coin.symbol.toUpperCase()})</td>
            <td>$${coin.current_price.toLocaleString()}</td>
            <td>$${coin.total_volume.toLocaleString()}</td>
            <td>$${coin.market_cap.toLocaleString()}</td>
            <td>
                <i class="fas fa-trash remove-icon" data-id="${coin.id}" style="cursor: pointer; color: red;"></i>
            </td>
        `;

        tableBody.appendChild(row);
    });

    
};

document.addEventListener('click', (event) => {

    const removeBtn = event.target.closest('.remove-icon');

    // If trash icon clicked → remove coin
    if (removeBtn) {
        event.preventDefault();
        event.stopImmediatePropagation();

        const coinId = removeBtn.dataset.id;
        toggleFavorite(coinId);

        return;
    }

    // If row clicked → open chart
    const row = event.target.closest('.coin-row');
    if (row) {
        const coinId = row.dataset.coinId;
        window.location.href = `coin.html?id=${coinId}`;
    }

});

// Load favorites on page load
document.addEventListener('DOMContentLoaded', fetchFavoriteCoins);