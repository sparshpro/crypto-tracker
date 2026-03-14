// Retrieves the list of favorite coins from localStorage
const getFavorites = () => JSON.parse(localStorage.getItem('favorites')) || [];

// Saves the updated favorites list to localStorage
const saveFavorites = (favorites) => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
};

// Adds or removes a coin from favorites
const toggleFavorite = (coinId) => {
    let favorites = getFavorites();

    if (favorites.includes(coinId)) {
        favorites = favorites.filter(id => id !== coinId);

        const row = document.querySelector(`tr[data-coin-id="${coinId}"]`);
        if (row) row.remove();

        if (favorites.length === 0) {
            document.querySelector('#favorite-table tbody').innerHTML = '';
            document.getElementById('no-favorites').style.display = 'block';
        }

    } else {
        favorites.push(coinId);
    }

    saveFavorites(favorites);
     return favorites;
};

// favoriteStorage.js

function updateFavoriteButton() {
    const btn = document.getElementById("add-to-fav-btn");
    if (!btn) return;

    const urlParams = new URLSearchParams(window.location.search);
    const coinId = urlParams.get("id");

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (favorites.includes(coinId)) {
        btn.textContent = "Remove from Favorites";
    } else {
        btn.textContent = "Add to Favorites";
    }
}