document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const coinId = urlParams.get('id');

    const coinContainer = document.getElementById('coin-container');


    const coinImage = document.getElementById('coin-image');
    const coinName = document.getElementById('coin-name');
    const coinDescription = document.getElementById('coin-description');
    const coinRank = document.getElementById('coin-rank');
    const coinPrice = document.getElementById('coin-price');
    const coinMarketCap = document.getElementById('coin-market-cap');
    const addToFavBtn = document.getElementById('add-to-fav-btn');

    const showShimmer = () => {
        document.querySelector('.coin-shimmer').style.display = 'block';
        document.querySelector('#coin-container').style.display = 'none';
    };

    const hideShimmer = () => {
        document.querySelector('.coin-shimmer').style.display = 'none';
        document.querySelector('#coin-container').style.display = 'flex';
    };

    async function fetchCoinData() {
        
        try {
            showShimmer();
            const data = await window.cryptoAPI.getCoinDetails(coinId);
            displayCoinData(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            hideShimmer();
        }
    }

    function displayCoinData(coin) {
        if (!coin || !coin.market_data || !coin.image) {
            coinContainer.innerHTML = '<p style="color: red;">Invalid coin data received.</p>';
            return;
        }

        coinImage.src = coin.image.large;
        coinImage.alt = coin.name;
        coinName.textContent = coin.name;
        coinDescription.innerHTML = coin.description.en ? coin.description.en.split(". ")[0] + '.' : 'No description available.';
        coinRank.textContent = coin.market_cap_rank || 'N/A';
        coinPrice.textContent = coin.market_data.current_price.usd ? `$${coin.market_data.current_price.usd.toLocaleString()}` : 'N/A';
        coinMarketCap.textContent = coin.market_data.market_cap.usd ? `$${coin.market_data.market_cap.usd.toLocaleString()}` : 'N/A';

        updateFavoriteButton();
    }

    // Favorites Functions
    addToFavBtn.addEventListener('click', () => {
    toggleFavorite(coinId);
    updateFavoriteButton();
});

    await fetchCoinData();

    // Chart.js Integration

let coinChart = null;

const canvas = document.getElementById('coinChart');

if (canvas) {

    const ctx = canvas.getContext('2d');

    coinChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Price (USD)',
                data: [],
                borderColor: '#EEBC1D',
                backgroundColor: 'rgba(238, 188, 29, 0.2)',
                fill: true,
                borderWidth: 2,
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: { display: false },
                    title: { display: true, text: 'Date' }
                },
                y: {
                    beginAtZero: false,
                    title: { display: true, text: 'Price (USD)' },
                    ticks: {
                        callback: function(value) {
                            return `$${value}`;
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `$${context.parsed.y}`;
                        }
                    }
                }
            }
        }
    });

}


    async function fetchChartData(days) {
        try {
            const data = await window.cryptoAPI.getMarketChart(coinId, days);
            updateChart(data.prices);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    function updateChart(prices) {

         if (!coinChart) return; // prevent crash
         
        const labels = prices.map(price => {
            let date = new Date(price[0]);
            return date.toLocaleDateString();
        });
        const data = prices.map(price => price[1]);

        coinChart.data.labels = labels;
        coinChart.data.datasets[0].data = data;
        coinChart.update();
    }


    const buttons = document.querySelectorAll('.button-container button');

buttons.forEach(button => {
    button.addEventListener('click', (event) => {

        buttons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        const days = event.target.dataset.days;

        fetchChartData(days);
    });
});

   document.querySelector('[data-days="1"]').click();
});