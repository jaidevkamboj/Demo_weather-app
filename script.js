// API configuration
        const apiKey = 'eef656ef6c99203ddd9c01af34813e84';
        const baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

        // DOM elements
        const cityInput = document.getElementById('city-input');
        const searchBtn = document.getElementById('search-btn');
        const locationBtn = document.getElementById('location-btn');
        const cityName = document.getElementById('city-name');
        const dateTime = document.getElementById('date-time');
        const temp = document.getElementById('temp');
        const humidity = document.getElementById('humidity');
        const wind = document.getElementById('wind');
        const condition = document.getElementById('condition');
        const weatherIcon = document.getElementById('weather-icon');
        const weatherDisplay = document.getElementById('weather-display');
        const errorMessage = document.getElementById('error-message');
        const themeToggle = document.getElementById('theme-toggle');
        const refreshBtn = document.getElementById('refresh-btn');
        const loading = document.getElementById('loading');

        // Store current weather data
        let currentData = null;

        // Event listeners
        searchBtn.addEventListener('click', fetchWeather);
        locationBtn.addEventListener('click', getLocationWeather);
        refreshBtn.addEventListener('click', refreshWeather);
        cityInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') fetchWeather();
        });
        
        themeToggle.addEventListener('click', toggleTheme);

        // Set default city on load
        window.addEventListener('load', () => {
            fetchWeatherByCity('Delhi');
            updateDateTime();
            setInterval(updateDateTime, 60000);
        });

        // Fetch weather by city name
        function fetchWeather() {
            const city = cityInput.value.trim();
            if (city === '') {
                showError('Please enter a city name');
                return;
            }
            
            fetchWeatherByCity(city);
        }

        function fetchWeatherByCity(city) {
            showLoading();
            const url = `${baseUrl}?q=${city}&units=metric&appid=${apiKey}`;
            
            fetch(url)
                .then(response => {
                    if (!response.ok) throw new Error('City not found');
                    return response.json();
                })
                .then(data => {
                    displayWeather(data);
                    hideError();
                    hideLoading();
                })
                .catch(error => {
                    showError('City not found. Please enter a valid city name.');
                    console.error('Error:', error);
                    hideLoading();
                });
        }

        // Get weather by current location
        function getLocationWeather() {
            if (navigator.geolocation) {
                showLoading();
                navigator.geolocation.getCurrentPosition(
                    position => {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;
                        fetchWeatherByCoords(lat, lon);
                    },
                    error => {
                        showError('Geolocation failed: ' + error.message);
                        hideLoading();
                    }
                );
            } else {
                showError('Geolocation is not supported by your browser');
            }
        }

        function fetchWeatherByCoords(lat, lon) {
            const url = `${baseUrl}?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
            
            fetch(url)
                .then(response => {
                    if (!response.ok) throw new Error('Location not found');
                    return response.json();
                })
                .then(data => {
                    displayWeather(data);
                    hideError();
                    hideLoading();
                    cityInput.value = data.name;
                })
                .catch(error => {
                    showError('Unable to get weather for your location.');
                    console.error('Error:', error);
                    hideLoading();
                });
        }

        function refreshWeather() {
            if (currentData) {
                showLoading();
                fetchWeatherByCity(currentData.name);
            }
        }

        // Display weather data
        function displayWeather(data) {
            currentData = data;
            
            // Update location
            cityName.textContent = `${data.name}, ${data.sys.country}`;
            
            // Update temperature
            temp.textContent = Math.round(data.main.temp);
            document.getElementById('feels-like').textContent = `${Math.round(data.main.feels_like)}°C`;
            
            // Update other weather info
            humidity.textContent = `${data.main.humidity}%`;
            document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
            
            // Update wind (convert m/s to km/h)
            wind.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
            
            // Update visibility (convert meters to km)
            document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
            
            // Update clouds
            document.getElementById('clouds').textContent = `${data.clouds.all}%`;
            
            // Update condition
            condition.textContent = data.weather[0].description;
            
            // Update weather icon
            const iconCode = data.weather[0].icon;
            weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
            weatherIcon.alt = data.weather[0].description;
            
            // Show weather display
            weatherDisplay.style.display = 'block';
        }

        // Update date and time display
        function updateDateTime() {
            const now = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            dateTime.textContent = now.toLocaleDateString('en-IN', options);
        }

        // Toggle dark/light theme
        function toggleTheme() {
            document.body.classList.toggle('dark-theme');
            const icon = themeToggle.querySelector('i');
            if (document.body.classList.contains('dark-theme')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }

        // Loading state
        function showLoading() {
            loading.style.display = 'flex';
            weatherDisplay.style.display = 'none';
            hideError();
        }

        function hideLoading() {
            loading.style.display = 'none';
        }

        // Error handling
        function showError(message) {
            errorMessage.querySelector('span').textContent = message;
            errorMessage.style.display = 'flex';
            weatherDisplay.style.display = 'none';
            hideLoading();
        }

        function hideError() {
            errorMessage.style.display = 'none';
        }