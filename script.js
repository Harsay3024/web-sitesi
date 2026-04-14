const searchBtn = document.getElementById('headerSearchBtn');
const locationBtn = document.getElementById('locationBtn');
const cityInput = document.getElementById('headerCityInput');
const weatherResult = document.getElementById('weatherResult');
let currentWeatherParams = null; // Son aranan konumu hafızada tutmak için eklendi
let isUpdating = false; // Sonsuz döngüleri engellemek için flag (bayrak)

// --- Dil ve Birim (Ayarlar) Altyapısı ---
const uiPrefs = {
    lang: localStorage.getItem('lang') || 'tr',
    units: localStorage.getItem('units') || 'metric',
    mapLayer: localStorage.getItem('mapLayer') || 'street'
};

const t = {
    tr: {
        today: "BUGÜN", hourly: "SAAT BAŞI", daily: "5 GÜNLÜK", aqi: "HAVA KALİTESİ",
        about: "HAKKIMIZDA", contact: "İLETİŞİM", settings: "AYARLAR", pref: "TERCİHLER",
        navigation: "MENÜ", popCities: "Popüler Şehirler", lang: "Dil", unitSys: "Birim",
        mapLayer: "Harita Tipi", mapStreet: "Sokak (OSM)", mapSat: "Uydu (Esri)", mapDark: "Karanlık (Carto)",
        mapTemp: "Sıcaklık", mapRain: "Yağış Radarı", mapCloud: "Bulutlar",
        humidity: "Nem", wind: "Rüzgar", feelsLike: "Hissedilen", pressure: "Basınç",
        visibility: "Görüş M.", activities: "Açık Hava Aktiviteleri",
        run: "Koşu", cycle: "Bisiklet", picnic: "Piknik", kite: "Uçurtma",
        suggestion: "Tavsiye", noData: "Veri Sağlanamıyor", errFetch: "Hata Oluştu",
        hourlyTitle: "Saatlik Tahmin", dailyTitle: "5 Günlük Hava Tahmini",
        tempTrend: "Sıcaklık Eğilimi", aqiTitle: "Hava Kalitesi İndeksi (AQI)",
        pollutants: "Hava Kirletici Değerleri", precipProb: "Yağış Olas.",
        healthAdvice: "Sağlık Tavsiyesi",
        sunrise: "Gün Doğumu", sunset: "Gün Batımı", feelsLike: "Hiss.", // "Hissedilen" kısaltıldı
        cloudiness: "Bulutluluk", moonPhase: "Ay Evresi",
        newMoon: "Yeni Ay", waxingCrescent: "Hilal", firstQuarter: "İlk Dördün",
        waxingGibbous: "Şişkin Ay", fullMoon: "Dolunay", waningGibbous: "Küçülen Şişkin",
        lastQuarter: "Son Dördün", waningCrescent: "Küçülen Hilal",
        pm25Desc: "İnce partikül madde. Solunum yollarına derinden nüfuz ederek kana karışabilir.",
        pm10Desc: "Solunabilir partikül madde. Öksürük, hırıltı ve astım krizlerini tetikleyebilir.",
        no2Desc: "Azot Dioksit. Genellikle araç egzozlarından kaynaklanır, akciğerleri tahriş eder.",
        o3Desc: "Yüzey Ozonu. Güneşli günlerde yoğunlaşır, nefes darlığına yol açabilir.",
        coDesc: "Karbon Monoksit. Kana oksijen taşınmasını engeller, baş ağrısı ve yorgunluk yapar.",
        so2Desc: "Kükürt Dioksit. Gözleri ve solunum yollarını tahriş eden keskin kokulu gazdır.",
        home: "ANA SAYFA", aboutDesc1: "ATMOS, en güncel ve doğru hava durumu verilerini modern bir arayüzle sunan profesyonel bir portaldır. Amacımız günlük planlarınızı en iyi şekilde yapmanıza yardımcı olmaktır.",
        features: "Özelliklerimiz", fastDataTitle: "Hızlı Veri", fastDataDesc: "Anlık güncellenen API altyapımızla verileri anında öğrenin.",
        highAccTitle: "Yüksek Doğruluk", highAccDesc: "En güvenilir meteorolojik kaynaklardan kesin tahminler alın.",
        userFriendlyTitle: "Kullanıcı Dostu", userFriendlyDesc: "Her cihazda kusursuz çalışan şık ve sade tasarımın keyfini çıkarın.",
        vision: "Vizyonumuz", visionDesc: "Amacımız, karmaşık hava durumu verilerini herkesin kolayca anlayabileceği, modern ve erişilebilir bir platformda sunarak günlük hayatınızı planlamanızı kolaylaştırmaktır.",
        mission: "Misyonumuz", missionDesc: "Kullanıcılarımıza en doğru ve güncel hava durumu bilgilerini, yenilikçi teknolojilerle desteklenmiş, sezgisel bir arayüz üzerinden sunarak günlük yaşamlarını kolaylaştırmak.",
        technology: "Teknolojimiz", technologyDesc: "En son API entegrasyonları ve bulut tabanlı altyapımız sayesinde, verileri anlık olarak işleyip yüksek performans ve güvenilirlik ile sunuyoruz.",

        contactDesc: "Görüş, öneri ve destek talepleriniz için aşağıdaki bilgilerden veya yandaki form aracılığıyla bizimle iletişime geçebilirsiniz.",
        namePlaceholder: "Adınız Soyadınız", emailPlaceholder: "E-posta Adresiniz", messagePlaceholder: "Mesajınız...", sendBtn: "Gönder",
        terms: "Kullanım Koşulları", privacy: "Gizlilik Politikası", allRights: "Tüm hakları saklıdır.",
        providedBy: "Veriler <strong>OpenWeatherMap</strong> tarafından sağlanmaktadır.",
        alertSuccess: "Mesajınız başarıyla gönderildi!",
        alertHeat: "Aşırı Sıcaklık Uyarısı!", alertCold: "Dondurucu Soğuk Uyarısı!",
        alertWind: "Şiddetli Rüzgar Uyarısı!", alertStorm: "Fırtına Uyarısı!",
        share: "Paylaş", shareText: "Şu an {city} için hava {temp}, {desc}. Detaylar:", copied: "Bağlantı kopyalandı!",
        suggWind: "Ayrıca şiddetli rüzgar var, dışarıda dikkatli olun! 🌬️",
        suggHighPress: "Yüksek hava basıncı hassas kişilerde baş ağrısı yapabilir. 🤕",
        suggLowPress: "Düşük hava basıncı yorgunluk veya eklem ağrısı yapabilir. 🥱",
        updateApp: "Yeni bir güncelleme mevcut! Uygulamayı yenilemek ister misiniz?", updateBtn: "Güncelle"
    },
    en: {
        today: "TODAY", hourly: "HOURLY", daily: "5 DAYS", aqi: "AIR QUALITY",
        about: "ABOUT US", contact: "CONTACT", settings: "SETTINGS", pref: "PREFERENCES",
        navigation: "MENU", popCities: "Popular Cities", lang: "Language", unitSys: "Units",
        mapLayer: "Map Layer", mapStreet: "Street (OSM)", mapSat: "Satellite (Esri)", mapDark: "Dark (Carto)",
        mapTemp: "Temperature", mapRain: "Rain Radar", mapCloud: "Clouds",
        humidity: "Humidity", wind: "Wind", feelsLike: "Feels Like", pressure: "Pressure",
        visibility: "Visibility", activities: "Outdoor Activities",
        run: "Running", cycle: "Cycling", picnic: "Picnic", kite: "Kite",
        suggestion: "Suggestion", noData: "Data Unavailable", errFetch: "Error Occurred",
        hourlyTitle: "Hourly Forecast", dailyTitle: "5-Day Forecast",
        tempTrend: "Temperature Trend", aqiTitle: "Air Quality Index (AQI)",
        pollutants: "Air Pollutants", precipProb: "Precip. Prob.",
        healthAdvice: "Health Advice",
        sunrise: "Sunrise", sunset: "Sunset", feelsLike: "Feels Like", // İngilizce için orijinal hali korundu
        cloudiness: "Cloudiness", moonPhase: "Moon Phase",
        newMoon: "New Moon", waxingCrescent: "Waxing Crescent", firstQuarter: "First Quarter",
        waxingGibbous: "Waxing Gibbous", fullMoon: "Full Moon", waningGibbous: "Waning Gibbous",
        lastQuarter: "Last Quarter", waningCrescent: "Waning Crescent",
        pm25Desc: "Fine particulate matter. Can penetrate deeply into the respiratory tract and enter the bloodstream.",
        pm10Desc: "Inhalable particulate matter. Can trigger coughing, wheezing, and asthma attacks.",
        no2Desc: "Nitrogen Dioxide. Usually comes from vehicle exhaust, irritates the lungs.",
        o3Desc: "Surface Ozone. Concentrates on sunny days, can cause shortness of breath.",
        coDesc: "Carbon Monoxide. Prevents oxygen transport in the blood, causes headaches and fatigue.",
        so2Desc: "Sulfur Dioxide. A pungent gas that irritates the eyes and respiratory tract.",
        home: "HOME", aboutDesc1: "Sky Guide is a professional portal that presents the most up-to-date and accurate weather data with a modern interface. Our goal is to help you plan your day in the best possible way.",
        features: "Our Features", fastDataTitle: "Fast Data", fastDataDesc: "Get data instantly with our real-time updated API infrastructure.",
        highAccTitle: "High Accuracy", highAccDesc: "Get precise forecasts from the most reliable meteorological sources.",
        userFriendlyTitle: "User Friendly", userFriendlyDesc: "Enjoy a sleek and simple design that works flawlessly on any device.",
        vision: "Our Vision", visionDesc: "Our goal is to make complex weather data easily understandable by presenting it on a modern and accessible platform to help you plan your daily life.",
        mission: "Our Mission", missionDesc: "To provide our users with the most accurate and up-to-date weather information through an intuitive interface, supported by innovative technologies, making their daily lives easier.",
        technology: "Our Technology", technologyDesc: "Thanks to our latest API integrations and cloud-based infrastructure, we process and deliver data instantly with high performance and reliability.",

        contactDesc: "For your feedback, suggestions, and support requests, you can contact us using the information below or via the form.",
        namePlaceholder: "Full Name", emailPlaceholder: "Email Address", messagePlaceholder: "Your Message...", sendBtn: "Send",
        terms: "Terms of Use", privacy: "Privacy Policy", allRights: "All rights reserved.",
        providedBy: "Data provided by <strong>OpenWeatherMap</strong>.",
        alertSuccess: "Your message has been sent successfully!",
        alertHeat: "Extreme Heat Warning!", alertCold: "Freezing Cold Warning!",
        alertWind: "Strong Wind Warning!", alertStorm: "Thunderstorm Warning!",
        share: "Share", shareText: "Current weather in {city} is {temp}, {desc}. Details:", copied: "Link copied!",
        suggWind: "Also, there are strong winds, be careful outside! 🌬️",
        suggHighPress: "High atmospheric pressure might cause headaches in sensitive individuals. 🤕",
        suggLowPress: "Low atmospheric pressure may cause fatigue or joint pain. 🥱",
        updateApp: "A new update is available! Do you want to refresh the app?", updateBtn: "Update"
    }
};

function getT(key) { return t[uiPrefs.lang][key] || key; }
function formatTemp(c) { return uiPrefs.units === 'imperial' ? Math.round((c * 9/5) + 32) : Math.round(c); }
function formatWind(ms) { return uiPrefs.units === 'imperial' ? Math.round(ms * 2.23694) : Math.round(ms * 3.6); } // metric = km/h, imperial = mph
function getTempUnit() { return uiPrefs.units === 'imperial' ? '°F' : '°C'; }
function getWindUnit() { return uiPrefs.units === 'imperial' ? 'mph' : 'km/h'; }

// --- Rüzgar Yönü Metni ve Pusula Hesaplaması ---
function getWindDirectionText(deg) {
    const dirs = ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB'];
    const dirsEn = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(deg / 45) % 8;
    return uiPrefs.lang === 'en' ? dirsEn[index] : dirs[index];
}

// Bölgenin kendi saat dilimine göre zaman formatlayıcı
function formatTime(unixTime, timezoneOffset) {
    if (!unixTime) return '--:--';
    const d = new Date((unixTime + timezoneOffset) * 1000);
    return d.getUTCHours().toString().padStart(2, '0') + ':' + d.getUTCMinutes().toString().padStart(2, '0');
}

// Astronomik Ay Evresi Hesaplama (Julian Date Algoritması)
function getMoonPhaseInfo(date) {
    let year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate();
    if (month < 3) { year--; month += 12; }
    let jd = 365.25 * year + 30.6 * (month + 1) + day - 694039.09;
    jd /= 29.5305882; // Ayın evre döngüsü (~29.53 gün)
    let phaseInt = Math.round((jd - parseInt(jd)) * 8);
    if (phaseInt >= 8) phaseInt = 0;

    // 0'dan 8'e kadar ay evreleri ve FontAwesome ikon eşleşmeleri
    const phases = [
        { key: 'newMoon', icon: 'fa-circle', style: 'color: #374151;' }, // Karanlık Daire
        { key: 'waxingCrescent', icon: 'fa-moon', style: 'color: #fcd34d;' }, // Normal Hilal
        { key: 'firstQuarter', icon: 'fa-circle-half-stroke', style: 'color: #fcd34d;' }, // Yarım Ay
        { key: 'waxingGibbous', icon: 'fa-circle', style: 'color: #fcd34d; opacity: 0.8;' }, // Şişkin
        { key: 'fullMoon', icon: 'fa-circle', style: 'color: #fcd34d; text-shadow: 0 0 10px rgba(252,211,77,0.8);' }, // Parlak Dolunay
        { key: 'waningGibbous', icon: 'fa-circle', style: 'color: #fcd34d; opacity: 0.8;' }, // Küçülen Şişkin
        { key: 'lastQuarter', icon: 'fa-circle-half-stroke', style: 'color: #fcd34d; transform: scaleX(-1);' }, // Ters Yarım Ay
        { key: 'waningCrescent', icon: 'fa-moon', style: 'color: #fcd34d; transform: scaleX(-1);' } // Ters Hilal
    ];
    
    return phases[phaseInt];
}

function translateUI() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[uiPrefs.lang][key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = t[uiPrefs.lang][key];
            } else {
                el.innerHTML = t[uiPrefs.lang][key];
            }
        }
    });
    if (cityInput) cityInput.placeholder = uiPrefs.lang === 'en' ? 'Search...' : 'Arama...';
    const tempTitle = document.getElementById('tempTrendTitle');
    if (tempTitle) tempTitle.innerText = `${getT('tempTrend')} (${getTempUnit()})`;
}

// --- Toast Bildirim Sistemi (Hava Durumu Uyarıları İçin) ---
function showToast(message, icon = 'fa-triangle-exclamation') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = 'weather-toast';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 400); // Animasyon bitince DOM'dan sil
    }, 6000); // 6 saniye ekranda kalır
} 

// --- PWA Güncelleme Bildirimi ---
function showUpdateToast(registration) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = 'weather-toast';
    toast.style.borderLeftColor = '#3b82f6'; // Güncelleme için mavi renk
    toast.innerHTML = `
        <i class="fa-solid fa-arrows-rotate anim-spin" style="color: #3b82f6;"></i> 
        <span style="flex-grow: 1;">${getT('updateApp')}</span>
        <button id="updateAppBtn" class="submit-btn" style="padding: 8px 15px; width: auto; font-size: 0.9rem; margin-left: 10px;">${getT('updateBtn')}</button>
    `;
    container.appendChild(toast);

    document.getElementById('updateAppBtn').addEventListener('click', () => { if (registration.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' }); });
}

// --- Karanlık Mod (Dark Mode) Kontrolü ---
const themeToggleBtn = document.getElementById('themeToggleBtn');
const currentTheme = localStorage.getItem('theme') || 'light';

// Chart.js Grafikleri İçin Tema Güncelleme Fonksiyonu
function updateChartTheme(theme) {
    if (typeof Chart === 'undefined') return;
    
    const textColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    const tooltipBg = theme === 'dark' ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.95)';
    const tooltipText = theme === 'dark' ? '#f9fafb' : '#1f2937';
    
    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = gridColor;

    const charts = [window.weatherChart, window.tempChartInstance, window.rainChartInstance];
    charts.forEach(chart => {
        if (chart) {
            if (chart.options.scales.x) {
                if (chart.options.scales.x.ticks) chart.options.scales.x.ticks.color = textColor;
                if (chart.options.scales.x.grid) chart.options.scales.x.grid.color = gridColor;
            }
            if (chart.options.scales.y) {
                if (chart.options.scales.y.ticks) chart.options.scales.y.ticks.color = textColor;
                if (chart.options.scales.y.grid) chart.options.scales.y.grid.color = gridColor;
            }
            if (chart.options.plugins && chart.options.plugins.tooltip) {
                chart.options.plugins.tooltip.backgroundColor = tooltipBg;
                chart.options.plugins.tooltip.titleColor = tooltipText;
                chart.options.plugins.tooltip.bodyColor = tooltipText;
            }
            chart.update();
        }
    });
}

if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
}
updateChartTheme(currentTheme); // Sayfa ilk yüklendiğinde grafikleri temaya uydur

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggleBtn.innerHTML = newTheme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        updateChartTheme(newTheme); // Butona tıklandığında anında güncelle
    });
}

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData({ city });
    } else {
        alert('Lütfen bir şehir adı girin.');
    }
});

// Kullanıcı enter tuşuna bastığında da arama çalışsın
cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        if (!autocompleteDropdown.classList.contains('hidden') && currentFocus > -1) {
            return; // Açılır menü aktifken ok tuşlarıyla seçilen "Enter" işlemi aşağıda ele alınacak, çakışmayı engelle
        }
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData({ city });
            if (autocompleteDropdown) autocompleteDropdown.classList.add('hidden'); // Arama başlayınca menüyü kapat
        }
    }
});

// --- Konum Bulma (GPS) Butonu ---
if (locationBtn) {
    locationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            locationBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            locationBtn.style.opacity = '0.7';
            locationBtn.disabled = true;

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    getWeatherData({ lat, lon });
                    
                    locationBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
                    locationBtn.style.opacity = '1';
                    locationBtn.disabled = false;
                },
                (error) => {
                    console.error("Konum hatası:", error);
                    alert("Konumunuz alınamadı. Tarayıcı ayarlarından konum izni verdiğinizden emin olun.");
                    locationBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
                    locationBtn.style.opacity = '1';
                    locationBtn.disabled = false;
                }
            );
        } else {
            alert("Tarayıcınız konum bulma özelliğini desteklemiyor.");
        }
    });
}

// --- Otomatik Tamamlama (Autocomplete) ---
const searchBox = document.querySelector('.header-search-box');
let autocompleteDropdown = document.getElementById('autocompleteResults');
if (searchBox && !autocompleteDropdown) {
    autocompleteDropdown = document.createElement('div');
    autocompleteDropdown.id = 'autocompleteResults';
    autocompleteDropdown.className = 'autocomplete-dropdown hidden';
    searchBox.appendChild(autocompleteDropdown);
}

let currentFocus = -1; // Klavye ok tuşları için aktif öğe indeksi

// Akıllı Arama Önerileri (Focus)
const popularCities = [
    { name: 'İstanbul', country: 'TR' },
    { name: 'Ankara', country: 'TR' },
    { name: 'Londra', country: 'GB' },
    { name: 'New York', country: 'US' },
    { name: 'Tokyo', country: 'JP' }
];
cityInput.addEventListener('focus', () => {
    if (cityInput.value.trim() === '') {
        autocompleteDropdown.innerHTML = `<div style="padding:10px 15px; font-size:0.8rem; color:var(--text-muted); font-weight:bold;">${getT('popCities')}</div>`;
        popularCities.forEach(city => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.innerHTML = `<i class="fa-solid fa-star" style="color:#f59e0b;"></i> <span><strong>${city.name}</strong> <small style="color:#9ca3af;">(${city.country})</small></span>`;
            item.addEventListener('click', () => {
                cityInput.value = city.name;
                autocompleteDropdown.classList.add('hidden');
                getWeatherData({ city: city.name });
            });
            autocompleteDropdown.appendChild(item);
        });
        autocompleteDropdown.classList.remove('hidden');
        currentFocus = -1;
    }
});

let debounceTimer;
cityInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    const val = e.target.value.trim();
    
    if (val.length < 3) {
        if(autocompleteDropdown) autocompleteDropdown.classList.add('hidden');
        return;
    }

    currentFocus = -1; // Kullanıcı yeni bir harf girdiğinde odağı sıfırla

    // Kullanıcı yazmayı bitirene kadar bekleyip, API'yi yormamak için 400ms Debounce
    debounceTimer = setTimeout(async () => {
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(val)}`);
            const data = await res.json();
            
            if (data && data.length > 0) {
                autocompleteDropdown.innerHTML = '';
                const seen = new Set(); // Aynı şehir ve ülkenin tekrarlanmasını engeller
                data.forEach(place => {
                    const uniqueKey = `${place.name}, ${place.country}`;
                    if (!seen.has(uniqueKey)) {
                        seen.add(uniqueKey);
                        const stateStr = place.state ? `${place.state}, ` : '';
                        const item = document.createElement('div');
                        item.className = 'autocomplete-item';
                        item.innerHTML = `<i class="fa-solid fa-location-dot"></i> <span><strong>${place.name}</strong> <small style="color:#9ca3af;">(${stateStr}${place.country})</small></span>`;
                        
                        item.addEventListener('click', () => {
                            cityInput.value = place.name;
                            autocompleteDropdown.classList.add('hidden');
                            // Sadece şehir ismiyle değil, daha isabetli sonuç için koordinatlarıyla arama yapıyoruz
                            getWeatherData({ lat: place.lat, lon: place.lon, city: place.name });
                        });
                        autocompleteDropdown.appendChild(item);
                    }
                });
                autocompleteDropdown.classList.remove('hidden');
            } else {
                autocompleteDropdown.classList.add('hidden');
            }
        } catch (err) {
            console.error('Autocomplete hatası:', err);
        }
    }, 400); 
});

// --- Klavye Ok Tuşları ile Navigasyon (Aşağı/Yukarı/Enter) ---
cityInput.addEventListener('keydown', (e) => {
    let items = autocompleteDropdown.querySelectorAll('.autocomplete-item');
    if (items.length === 0 || autocompleteDropdown.classList.contains('hidden')) return;

    if (e.key === 'ArrowDown') {
        e.preventDefault(); // İmlecin yazının sağına soluna atlamasını engeller
        currentFocus++;
        addActive(items);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        currentFocus--;
        addActive(items);
    } else if (e.key === 'Enter') {
        if (currentFocus > -1) {
            e.preventDefault();
            items[currentFocus].click(); // Seçilen satıra otomatik tıkla
        }
    }
});

function addActive(items) {
    if (!items) return false;
    // Önce tüm aktif/vurgulu sınıfları temizle
    items.forEach(item => item.classList.remove('autocomplete-active'));
    
    if (currentFocus >= items.length) currentFocus = 0; // Sona gelince başa dön
    if (currentFocus < 0) currentFocus = items.length - 1; // Baştayken yukarı basılırsa sona git
    
    items[currentFocus].classList.add('autocomplete-active');
    items[currentFocus].scrollIntoView({ block: 'nearest' }); // Liste uzunsa kaydırma çubuğunu otomatik aşağı/yukarı kaydır
}

// Açılır menü dışına tıklandığında menüyü gizle
document.addEventListener('click', (e) => {
    if (autocompleteDropdown && !searchBox.contains(e.target)) {
        autocompleteDropdown.classList.add('hidden');
    }
});

async function getWeatherData(params, pushHistory = true) {
    if (isUpdating) return; // Zaten bir güncelleme yapılıyorsa işlemi durdur
    
    if (!params.city && (params.lat == null || params.lon == null)) {
        return; // Geçersiz parametreyle gelirse işlemi iptal et
    }

    isUpdating = true; // İşlem başladı flag'ini kilitle
    currentWeatherParams = params; // Başarılı veya başarısız her aramada son parametreyi kaydet
    if (params.fromMapClick) pushHistory = false; // Harita tıklamaları URL'yi değiştirmesin

    // API İsteği atılmadan önce Yükleniyor durumunu aktif et
    searchBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    searchBtn.style.opacity = '0.7';
    searchBtn.disabled = true;
    if (locationBtn) locationBtn.disabled = true;

    // Arama tetiklendiğinde hangi sekmede olursak olalım hemen BUGÜN sekmesini aktifleştir
    if(window.activateTab) window.activateTab('weatherResult');

    try {
        let url = '/api/weather?';
        if (params.lat != null && params.lon != null) {
            url += `lat=${params.lat}&lon=${params.lon}`;
        } else if (params.city) {
            url += `city=${encodeURIComponent(params.city)}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || 'Hava durumu verisi alınamadı.');
        }
        const data = await response.json();
        
        let resolvedCityName = data.current.name || params.city || 'Bilinmeyen Konum';

        // URL ve Arama Çubuğu Senkronizasyonu
        if (pushHistory && resolvedCityName !== 'Bilinmeyen Konum') {
            const urlObj = new URL(window.location);
            urlObj.searchParams.set('city', resolvedCityName);
            window.history.pushState({ city: resolvedCityName }, '', urlObj);
        }
        if (cityInput) cityInput.value = resolvedCityName;

        // Harita Senkronizasyonu (Arama yapıldığında veya haritaya tıklandığında aynı noktaya odaklan)
        if (window.weatherMapInstance && data.current.coord) {
            const { lat, lon } = data.current.coord;
            if(window.mapMarker) { window.weatherMapInstance.removeLayer(window.mapMarker); }
            window.mapMarker = L.marker([lat, lon]).addTo(window.weatherMapInstance)
                .bindTooltip(`<div style="text-align: center;"><strong style="color: #333;">${resolvedCityName}</strong><br><span class="popup-temp" style="font-size:1.1em;">${formatTemp(data.current.main.temp)}${getTempUnit()}</span><br><span style="font-size:0.85em; color:#6b7280;">💧 %${data.current.main.humidity} &nbsp;|&nbsp; 🌬️ ${formatWind(data.current.wind.speed)} ${getWindUnit()}</span></div>`, { direction: 'top', offset: [0, -35] });
        }

        // ADIM 2: TAM EKRAN GÜNCELLEMESİ - Tüm panelleri sırayla tek tek güncelle
        // Başlık, Nem, Rüzgar, 5 Günlük Liste ve Grafikler aynı anda güncellenir
        
        try { displayWeatherData(data.current, data.airQuality, resolvedCityName); } catch (e) { console.error("Bugün render hatası:", e); }
        try { displayForecastData(data.forecast); } catch (e) { console.error("Tahmin render hatası:", e); }
        try { displayAqiData(data.airQuality); } catch (e) { console.error("AQI render hatası:", e); }
        try { updateChartTheme(document.documentElement.getAttribute('data-theme') || 'light'); } catch (e) { console.error("Tema/Grafik hatası:", e); }
        
    } catch (error) {
        const weatherResultContent = document.getElementById('weatherResultContent');
        if (weatherResultContent) {
            weatherResultContent.innerHTML = `
                    <div style="text-align: center; padding: 40px; background: var(--bg-card-hover); border-radius: 12px; border: 1px dashed #fca5a5; color: #ef4444; margin-bottom: 20px;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 3rem; margin-bottom: 15px;"></i>
                    <h4 style="font-size: 1.2rem; margin-bottom: 5px;">${getT('errFetch')}</h4>
                    <p>${error.message}</p>
                </div>
            `;
        }
    } finally {
        isUpdating = false; // İşlem (başarılı veya hatalı) bitti, flag'i serbest bırak
        // İşlem (başarılı veya hatalı) bittikten sonra butonları eski haline döndür
        searchBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
        searchBtn.style.opacity = '1';
        searchBtn.disabled = false;
        if (locationBtn) locationBtn.disabled = false;
    }
}

function changeBackground(weatherMain) {
    const topBar = document.querySelector('.top-bar'); // Sadece üst barı hedefle
    
    if (!topBar) return;
    
    switch (weatherMain) {
        case 'Clear':
            topBar.style.background = 'linear-gradient(135deg, #2563eb, #3b82f6)'; // Güneşli Mavi
            break;
        case 'Clouds':
            topBar.style.background = 'linear-gradient(135deg, #4b5563, #6b7280)'; // Bulutlu Gri
            break;
        case 'Rain':
        case 'Drizzle':
            topBar.style.background = 'linear-gradient(135deg, #374151, #4b5563)'; // Yağmurlu Koyu Gri
            break;
        case 'Snow':
            topBar.style.background = 'linear-gradient(135deg, #6b7280, #9ca3af)'; // Karlı Açık Gri
            break;
        case 'Thunderstorm':
            topBar.style.background = 'linear-gradient(135deg, #1f2937, #374151)'; // Fırtına Siyah
            break;
        default:
            topBar.style.background = 'linear-gradient(135deg, #1e3a8a, #3b82f6)'; // Varsayılan
    }
}

function getIconAnimClass(iconCode) {
    if (iconCode.includes('01')) return 'anim-spin'; // Güneş için yavaş dönüş
    if (iconCode.includes('02') || iconCode.includes('03') || iconCode.includes('04')) return 'anim-float'; // Bulut için havada süzülme
    if (iconCode.includes('09') || iconCode.includes('10') || iconCode.includes('11')) return 'anim-pulse'; // Yağmur/Fırtına için yanıp sönme
    return '';
}

function getClothingSuggestion(temp, weatherMain, aqiLevel, windSpeed, pressure) {
    let suggestion = '';
    if (uiPrefs.lang === 'en') {
        if (weatherMain === 'Rain' || weatherMain === 'Drizzle') suggestion = 'Do not forget your umbrella! ☔';
        else if (weatherMain === 'Snow') suggestion = 'Dress warmly, it is freezing cold! ❄️';
        else if (temp < 10) suggestion = 'It is quite cold outside, you should wear a thick coat. 🧥';
        else if (temp >= 10 && temp < 20) suggestion = 'The weather is cool, you can take a light jacket. 🧥';
        else if (temp >= 20 && temp < 28) suggestion = 'The weather is very nice! T-shirts and comfortable clothes are ideal. 👕';
        else suggestion = 'The weather is quite hot! Do not forget to apply sunscreen. 🕶️☀️';
        if (aqiLevel === 4) suggestion += ' Also, the air quality is poor, consider wearing a mask. 😷';
        else if (aqiLevel === 5) suggestion += ' Attention! Hazardous air pollution, do not go outside unless necessary! 🚨😷';
    } else {
        if (weatherMain === 'Rain' || weatherMain === 'Drizzle') suggestion = 'Şemsiyeni sakın unutma! ☔';
        else if (weatherMain === 'Snow') suggestion = 'Sıkı giyin, dondurucu bir soğuk var! ❄️';
        else if (temp < 10) suggestion = 'Dışarısı oldukça soğuk, kalın bir mont giymelisin. 🧥';
        else if (temp >= 10 && temp < 20) suggestion = 'Hava serin, üzerine ince bir ceket alabilirsin. 🧥';
        else if (temp >= 20 && temp < 28) suggestion = 'Hava çok güzel! Tişört ve rahat kıyafetler ideal. 👕';
        else suggestion = 'Hava oldukça sıcak! Güneş kremini sürmeyi unutma. 🕶️☀️';
        if (aqiLevel === 4) suggestion += ' Ayrıca hava kalitesi kötü, maske takmayı düşünebilirsin. 😷';
        else if (aqiLevel === 5) suggestion += ' Dikkat! Tehlikeli hava kirliliği var, mecbur kalmadıkça dışarı çıkmayın! 🚨😷';
    }

    if (windSpeed > 10) suggestion += ' ' + getT('suggWind');
    if (pressure > 1022) suggestion += ' ' + getT('suggHighPress');
    else if (pressure < 1000) suggestion += ' ' + getT('suggLowPress');

    return suggestion;
}

function getAqiText(aqi) {
    switch(aqi) {
        case 1: return 'İyi 🟢';
        case 2: return 'Orta 🟡';
        case 3: return 'Hassas 🟠';
        case 4: return 'Kötü 🔴';
        case 5: return 'Tehlikeli 🟣';
        default: return 'Bilinmiyor';
    }
}

function calculateActivities(temp, wind, weatherMain, aqi) {
    let isRaining = (weatherMain === 'Rain' || weatherMain === 'Drizzle' || weatherMain === 'Thunderstorm');
    let isSnowing = (weatherMain === 'Snow');

    let runScore = 10;
    if (isRaining) runScore -= 5;
    if (isSnowing) runScore -= 4;
    if (aqi >= 3) runScore -= (aqi-2)*2;
    if (temp > 30) runScore -= 3;
    if (temp < 5) runScore -= 2;
    
    let cycleScore = 10;
    if (isRaining) cycleScore -= 6;
    if (isSnowing) cycleScore -= 5;
    if (wind > 5) cycleScore -= (wind - 5) * 0.8;
    if (aqi >= 4) cycleScore -= 3;
    if (temp < 10) cycleScore -= 2;

    let picnicScore = 10;
    if (isRaining || isSnowing) picnicScore -= 9;
    if (temp < 15) picnicScore -= (15 - temp) * 0.8;
    if (wind > 6) picnicScore -= (wind - 6) * 0.8;
    if (aqi >= 4) picnicScore -= 4;

    let kiteScore = 5;
    if (wind > 3 && wind <= 8) kiteScore = 9;
    else if (wind > 8 && wind <= 12) kiteScore = 10;
    else if (wind > 12) kiteScore = Math.max(0, 10 - (wind - 12));
    else if (wind < 3) kiteScore = Math.max(0, 5 - (3 - wind)*1.5);
    if (isRaining || isSnowing) kiteScore -= 6;

    return {
        run: Math.max(0, Math.min(10, Math.round(runScore))),
        cycle: Math.max(0, Math.min(10, Math.round(cycleScore))),
        picnic: Math.max(0, Math.min(10, Math.round(picnicScore))),
        kite: Math.max(0, Math.min(10, Math.round(kiteScore)))
    };
}

function getActivityColor(score) {
    if (score >= 7) return '#10b981'; // İyi (Yeşil)
    if (score >= 4) return '#f59e0b'; // Orta (Turuncu)
    return '#ef4444'; // Kötü (Kırmızı)
}

function displayWeatherData(data, aqiData, resolvedCityName) {
    // Eksik Veri Fix: Haritadan gelen değer (deniz/kırsal) boş ise 'Bilinmeyen Konum' basılır.
    const cityName = resolvedCityName || data.name || getT('unknown');
    const temperature = formatTemp(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const feelsLike = formatTemp(data.main.feels_like);
    const pressure = data.main.pressure;
    const weatherMain = data.weather[0].main;
    const visibility = (data.visibility / 1000).toFixed(1); // Metreyi KM'ye çeviriyoruz
    const sunriseTime = formatTime(data.sys.sunrise, data.timezone);
    const sunsetTime = formatTime(data.sys.sunset, data.timezone);
    const clouds = data.clouds ? data.clouds.all : 0;
    const moonInfo = getMoonPhaseInfo(new Date());
    const windDeg = data.wind.deg || 0;
    const windDirText = getWindDirectionText(windDeg);
    let aqiLevel = 1;
    if (aqiData && aqiData.list && aqiData.list.length > 0) {
        aqiLevel = aqiData.list[0].main.aqi;
    }
    const animClass = getIconAnimClass(icon);
    
    changeBackground(weatherMain);
    // Mantıksal algoritmalar Imperial (°F) dönüşümünden etkilenmesin diye API'nin ham (Celsius) verisi iletiliyor
    const suggestion = getClothingSuggestion(data.main.temp, weatherMain, aqiLevel, data.wind.speed, pressure);
    const scores = calculateActivities(data.main.temp, data.wind.speed, weatherMain, aqiLevel);

    // Header'daki anlık hava durumu bilgisini güncelle
    const headerWeatherInfo = document.getElementById('header-weather-info');
    headerWeatherInfo.innerHTML = `
        <span class="header-city">${cityName}</span>
        <span class="header-temp">${temperature}${getTempUnit()}</span>
        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="icon" class="header-icon">
    `;
    headerWeatherInfo.classList.remove('hidden');
    
    // --- Olağanüstü Hava Koşulları Kontrolü (Toast Bildirimi) ---
    const existingContainer = document.getElementById('toast-container');
    if (existingContainer) existingContainer.innerHTML = ''; // Eski bildirimleri temizle

    if (weatherMain === 'Thunderstorm' || weatherMain === 'Tornado' || weatherMain === 'Squall') { showToast(getT('alertStorm'), 'fa-bolt'); }
    else if (data.wind.speed > 15) { showToast(getT('alertWind'), 'fa-wind'); }
    else if (data.main.temp > 35) { showToast(getT('alertHeat'), 'fa-temperature-arrow-up'); }
    else if (data.main.temp < 0) { showToast(getT('alertCold'), 'fa-temperature-arrow-down'); }

    const weatherResultContent = document.getElementById('weatherResultContent');
    if (!weatherResultContent) return;

    // AccuWeather tarzı geniş ve profesyonel HTML yapısı
    weatherResultContent.innerHTML = `
        <div class="current-weather-banner">
            <div class="current-info">
                <h2 class="city-name">${cityName}</h2>
                <p class="weather-desc">${description}</p>
                <button id="shareWeatherBtn" class="share-btn"><i class="fa-solid fa-share-nodes"></i> <span data-i18n="share">${getT('share')}</span></button>
            </div>
            <div class="current-temp-block">
                <img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="Hava Durumu İkonu" class="weather-icon ${animClass}">
                <h1 class="temp">${temperature}${getTempUnit()}</h1>
            </div>
        </div>
        <div class="weather-details">
            <div class="detail-card">
                <span class="detail-title"><i class="fa-solid fa-droplet" style="color:#3b82f6;"></i> ${getT('humidity')}</span>
                <span class="detail-value">%${data.main.humidity}</span>
            </div>
            <div class="detail-card">
                <span class="detail-title"><i class="fa-solid fa-wind" style="color:#6b7280;"></i> ${getT('wind')}</span>
                <span class="detail-value" style="display:flex; align-items:center; gap:8px;">
                    ${formatWind(data.wind.speed)} <span style="font-size:0.9rem;">${getWindUnit()}</span>
                    <span style="display:flex; align-items:center; gap:4px; font-size:0.85rem; color:var(--text-muted); background:var(--bg-body); padding:3px 8px; border-radius:12px; border:1px solid var(--border-color);" title="Rüzgar Yönü">
                        <i class="fa-solid fa-location-arrow" id="windDirectionIcon" style="color:#3b82f6; transform: rotate(${windDeg + 135}deg);"></i> ${windDirText}
                    </span>
                </span>
            </div>
            <div class="detail-card">
                <span class="detail-title"><i class="fa-solid fa-temperature-half" style="color:#ef4444;"></i> ${getT('feelsLike')}</span>
                <span class="detail-value">${feelsLike}${getTempUnit()}</span>
            </div>
            <div class="detail-card">
                <span class="detail-title"><i class="fa-solid fa-gauge-high" style="color:#8b5cf6;"></i> ${getT('pressure')}</span>
                <span class="detail-value">${pressure} hPa</span>
            </div>
            <div class="detail-card">
                <span class="detail-title"><i class="fa-solid fa-eye" style="color:#10b981;"></i> ${getT('visibility')}</span>
                <span class="detail-value">${visibility} km</span>
            </div>
            <div class="detail-card">
                <span class="detail-title"><i class="fa-solid fa-leaf" style="color:#10b981;"></i> AQI</span>
                <span class="detail-value">${getAqiText(aqiLevel)}</span>
            </div>
            <div class="detail-card">
                <span class="detail-title"><i class="fa-solid fa-sun anim-spin" style="color:#f59e0b; display:inline-block;"></i> ${getT('sunrise')}</span>
                <span class="detail-value">${sunriseTime}</span>
            </div>
            <div class="detail-card">
                <span class="detail-title"><i class="fa-solid fa-moon anim-float" style="color:#8b5cf6; display:inline-block;"></i> ${getT('sunset')}</span>
                <span class="detail-value">${sunsetTime}</span>
            </div>
            <div class="detail-card">
                <span class="detail-title"><i class="fa-solid fa-cloud" style="color:#9ca3af;"></i> ${getT('cloudiness')}</span>
                <span class="detail-value">%${clouds}</span>
            </div>
            <div class="detail-card">
                <span class="detail-title"><i class="fa-solid fa-star-and-crescent" style="color:#6366f1;"></i> ${getT('moonPhase')}</span>
                <span class="detail-value" style="font-size:1.05rem; margin-top:3px;"><i class="fa-solid ${moonInfo.icon}" style="${moonInfo.style} display:inline-block; margin-right:4px;"></i> ${getT(moonInfo.key)}</span>
            </div>
        </div>
        
        <div class="activity-panel">
            <h3 data-i18n="activities">${getT('activities')}</h3>
            <div class="activity-grid">
                <div class="activity-card">
                    <div class="activity-header">
                        <div style="display:flex; align-items:center; gap:10px;"><i class="fa-solid fa-person-running"></i><span data-i18n="run">${getT('run')}</span></div>
                        <span class="activity-score" style="color: ${getActivityColor(scores.run)}">${scores.run}/10</span>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" style="width: ${scores.run * 10}%; background-color: ${getActivityColor(scores.run)}"></div></div>
                </div>
                <div class="activity-card">
                    <div class="activity-header">
                        <div style="display:flex; align-items:center; gap:10px;"><i class="fa-solid fa-bicycle"></i><span data-i18n="cycle">${getT('cycle')}</span></div>
                        <span class="activity-score" style="color: ${getActivityColor(scores.cycle)}">${scores.cycle}/10</span>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" style="width: ${scores.cycle * 10}%; background-color: ${getActivityColor(scores.cycle)}"></div></div>
                </div>
                <div class="activity-card">
                    <div class="activity-header">
                        <div style="display:flex; align-items:center; gap:10px;"><i class="fa-solid fa-basket-shopping"></i><span data-i18n="picnic">${getT('picnic')}</span></div>
                        <span class="activity-score" style="color: ${getActivityColor(scores.picnic)}">${scores.picnic}/10</span>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" style="width: ${scores.picnic * 10}%; background-color: ${getActivityColor(scores.picnic)}"></div></div>
                </div>
                <div class="activity-card">
                    <div class="activity-header">
                        <div style="display:flex; align-items:center; gap:10px;"><i class="fa-brands fa-fly"></i><span data-i18n="kite">${getT('kite')}</span></div>
                        <span class="activity-score" style="color: ${getActivityColor(scores.kite)}">${scores.kite}/10</span>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" style="width: ${scores.kite * 10}%; background-color: ${getActivityColor(scores.kite)}"></div></div>
                </div>
            </div>
        </div>

        <div class="suggestion-card">
            <span class="suggestion-icon">💡</span>
            <div class="suggestion-text">
                <strong><span data-i18n="suggestion">${getT('suggestion')}</span>:</strong> ${suggestion}
            </div>
        </div>
    `;

    // Apply dynamic wind animation
    setTimeout(() => {
        const windIcon = document.getElementById('windDirectionIcon');
        if (windIcon) {
            const windSpeed = data.wind.speed; // m/s
            let animationDuration = '15s'; // Default slow spin
            if (windSpeed > 15) animationDuration = '2s'; // e.g., > 54 km/h
            else if (windSpeed > 10) animationDuration = '5s'; // e.g., > 36 km/h
            else if (windSpeed > 5) animationDuration = '10s'; // e.g., > 18 km/h
            windIcon.style.animation = `dynamic-spin ${animationDuration} linear infinite`;
        }
    }, 0); // Use setTimeout to ensure element is in DOM

    // --- Paylaş Butonu Olay Dinleyicisi ---
    const shareBtn = document.getElementById('shareWeatherBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const shareText = getT('shareText').replace('{city}', cityName).replace('{temp}', `${temperature}${getTempUnit()}`).replace('{desc}', description);
            if (navigator.share) {
                navigator.share({
                    title: 'ATMOS',
                    text: shareText,
                    url: window.location.href
                }).catch((err) => console.log('Paylaşım iptal edildi.'));
            } else {
                // Masaüstü veya Desteklenmeyen Tarayıcılar İçin (Panoya Kopyala)
                navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
                showToast(getT('copied'), 'fa-clipboard-check');
            }
        });
    }
}

function displayForecastData(forecastData) {
    const forecastResult = document.getElementById('forecastResult');
    const forecastContainer = document.getElementById('forecastContainer');
    if (forecastContainer) forecastContainer.innerHTML = ''; // Önceki verileri temizle

    // Önümüzdeki 24 saati alıyoruz (3 saatlik aralıklarla 8 veri)
    const next24Hours = forecastData.list.slice(0, 8);

    if (forecastContainer) {
        next24Hours.forEach(item => {
            const date = new Date(item.dt * 1000);
            const hours = date.getHours().toString().padStart(2, '0');
            const temp = formatTemp(item.main.temp);
            const icon = item.weather[0].icon;
            const animClass = getIconAnimClass(icon);
            const humidity = item.main.humidity;
            const windSpeed = item.wind.speed;

            const card = document.createElement('div');
            card.className = 'forecast-card';
            card.innerHTML = `
                <span class="forecast-time">${hours}:00</span>
                <img src="https://openweathermap.org/img/wn/${icon}.png" alt="icon" class="forecast-icon ${animClass}">
                <span class="forecast-temp">${temp}${getTempUnit()}</span>
                <div class="forecast-details">
                    <span class="detail-item"><i class="fas fa-tint"></i> ${humidity}%</span>
                    <span class="detail-item"><i class="fas fa-wind"></i> ${windSpeed} km/s</span>
                </div>
            `;
            forecastContainer.appendChild(card);
        });
    }

    // Akıllı Tavsiye Modülü
    const smartAdvice = generateSmartAdvice(next24Hours);
    if (smartAdvice) {
        const adviceContainer = document.createElement('div');
        adviceContainer.className = 'smart-advice-card';
        adviceContainer.innerHTML = `
            <div class="advice-icon"><i class="fas fa-lightbulb"></i></div>
            <div class="advice-text">${smartAdvice}</div>
        `;
        forecastResult.appendChild(adviceContainer);
    }

    // --- Chart.js Isıya Duyarlı Çizgi Grafiği Oluşturma ---
    const canvas = document.getElementById('forecastChart');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        
        if (window.weatherChart) { window.weatherChart.destroy(); }

        // Renk geçişi (Gradient) - Dikey eksende soğuktan sıcağa
        const gradientLine = ctx.createLinearGradient(0, 250, 0, 0);
        gradientLine.addColorStop(0, '#3b82f6'); // Soğuk: Mavi (Alt kısım)
        gradientLine.addColorStop(0.5, '#f59e0b'); // Ilık: Turuncu (Orta kısım)
        gradientLine.addColorStop(1, '#ef4444'); // Sıcak: Kırmızı (Üst kısım)

        const gradientFill = ctx.createLinearGradient(0, 250, 0, 0);
        gradientFill.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
        gradientFill.addColorStop(0.5, 'rgba(245, 158, 11, 0.1)');
        gradientFill.addColorStop(1, 'rgba(239, 68, 68, 0.2)');

        window.weatherChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: next24Hours.map(i => new Date(i.dt * 1000).getHours().toString().padStart(2, '0') + ':00'),
                datasets: [{
                    label: 'Sıcaklık',
                    data: next24Hours.map(i => formatTemp(i.main.temp)),
                    borderColor: gradientLine,
                    backgroundColor: gradientFill,
                    borderWidth: 4,
                    tension: 0.4, // Çizgileri yumuşak kıvrımlı yapar
                    fill: true,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: gradientLine,
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 10,
                    pointHoverBorderWidth: 3,
                    pointHitRadius: 15
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const item = next24Hours[context.dataIndex];
                                return [
                                    `${getT('tempTrend').split(' ')[0]}: ${context.parsed.y}${getTempUnit()}`,
                                    `🌬️ ${getT('wind')}: ${formatWind(item.wind)} ${getWindUnit()}`,
                                    `${getT('precipProb')}: %${Math.round((item.pop || 0) * 100)}`
                                ];
                            }
                        }
                    }
                },
                scales: { y: { ticks: { callback: function(value) { return value + getTempUnit(); } } } }
            }
        });
    }

    // --- 5 Günlük Liste (AccuWeather Stili) Oluşturma ---
    const dailyListContainer = document.getElementById('dailyForecastList');
    if (dailyListContainer) {
        dailyListContainer.innerHTML = '';

        // 3'er saatlik verileri gün bazında grupluyoruz
        const dailyData = {};
        forecastData.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dateString = date.toISOString().split('T')[0];

            if (!dailyData[dateString]) {
                dailyData[dateString] = {
                    dt: item.dt,
                    temp_max: item.main.temp_max,
                    temp_min: item.main.temp_min,
                    icon: item.weather[0].icon.replace('n', 'd'), // Listede gece de olsa gündüz ikonu kullanmak daha şık durur
                    desc: item.weather[0].description,
                    feels_like: item.main.feels_like,
                    windSum: item.wind.speed,
                    windCount: 1,
                    popSum: item.pop || 0,
                    popCount: 1,
                    feelsLikeSum: item.main.feels_like, // Hissedilen sıcaklık toplamı
                    feelsLikeCount: 1 // Hissedilen sıcaklık veri sayısı
                };
            } else {
                dailyData[dateString].temp_max = Math.max(dailyData[dateString].temp_max, item.main.temp_max);
                dailyData[dateString].temp_min = Math.min(dailyData[dateString].temp_min, item.main.temp_min);
                // Günün en çok temsil eden durumu için öğlen saatlerindeki veriyi (11-15 arası) tercih ediyoruz
                if (date.getHours() >= 11 && date.getHours() <= 15) {
                    dailyData[dateString].icon = item.weather[0].icon.replace('n', 'd');
                    dailyData[dateString].desc = item.weather[0].description;
                    dailyData[dateString].feels_like = item.main.feels_like;
                }
                // Yağış ihtimali ve rüzgarın günün ortalamasını almak için değerleri topluyoruz
                dailyData[dateString].popSum += item.pop || 0;
                dailyData[dateString].popCount += 1;
                dailyData[dateString].windSum += item.wind.speed;
                dailyData[dateString].windCount += 1;
            }
        });

        // Günlük ortalama yağış olasılığını ve rüzgar hızını hesapla
        Object.values(dailyData).forEach(day => {
            day.pop = day.popSum / day.popCount;
            day.wind = day.windSum / day.windCount;
        });

        const daysArr = ['PAZ', 'PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT'];
        const monthsArr = ['OCA', 'ŞUB', 'MAR', 'NİS', 'MAY', 'HAZ', 'TEM', 'AĞU', 'EYL', 'EKİ', 'KAS', 'ARA'];

        Object.values(dailyData).forEach(day => {
            const d = new Date(day.dt * 1000);
            const card = document.createElement('div');
            card.className = 'daily-weather-card';
            card.innerHTML = `
                <div class="daily-left">
                    <div class="daily-date-block">
                        <div class="daily-day">${daysArr[d.getDay()]}</div>
                        <div class="daily-date">${d.getDate()} ${monthsArr[d.getMonth()]}</div>
                    </div>
                    <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="icon" class="daily-icon">
                </div>
                <div class="daily-center">
                    <div class="daily-temp"><span class="temp-high">${formatTemp(day.temp_max)}°</span> <span class="temp-low">/ ${formatTemp(day.temp_min)}°</span></div>
                    <div class="daily-desc">${day.desc}</div>
                </div>
                <div class="daily-right">
                    <div class="daily-detail-item"><i class="fa-solid fa-temperature-half"></i> ${getT('feelsLike')}: <strong>${formatTemp(day.feels_like)}${getTempUnit()}</strong></div>
                    <div class="daily-detail-item"><i class="fa-solid fa-wind"></i> ${getT('wind')}: <strong>${formatWind(day.wind)} ${getWindUnit()}</strong></div>
                    <div class="daily-detail-item" style="grid-column: span 2;"><i class="fa-solid fa-umbrella"></i> ${getT('precipProb')}: <strong>%${Math.round(day.pop * 100)}</strong></div>
                </div>
            `;
            dailyListContainer.appendChild(card);
        });
    }

}

function displayAqiData(aqiData) {
    const aqiContent = document.getElementById('aqiContent');

    // Hata Kontrolü: Eğer API'den veri dönmezse veya boş dönerse şık bir uyarı göster
    if (!aqiData || !aqiData.list || aqiData.list.length === 0) {
        aqiContent.innerHTML = `
                <div style="text-align: center; padding: 40px; background: var(--bg-card-hover); border-radius: 12px; border: 1px dashed var(--border-color); color: var(--text-muted); margin-bottom: 20px;">
                <i class="fa-solid fa-wind" style="font-size: 3rem; margin-bottom: 15px; color: #9ca3af;"></i>
                    <h4 style="font-size: 1.2rem; color: var(--text-main); margin-bottom: 5px;">${getT('noData')}</h4>
                <p>Seçilen bölge (koordinat) için detaylı hava kalitesi (AQI) istasyonu verisi bulunmamaktadır.</p>
            </div>
        `;
        const aqiSec = document.getElementById('aqiSection');
        if (aqiSec) aqiSec.classList.remove('hidden');
        return; // Veri yoksa fonksiyonun devam edip çökmesini engelle
    }

    const aqi = aqiData.list[0].main.aqi;
    const comps = aqiData.list[0].components;

    let aqiColor, aqiLabel, aqiAdvice;
    const isEn = uiPrefs.lang === 'en';
    // OpenWeather AQI Değerleri: 1 (Good) to 5 (Very Poor)
    switch(aqi) {
        case 1: aqiColor = '#10b981'; aqiLabel = isEn ? 'Good' : 'İyi'; aqiAdvice = isEn ? 'Air quality is ideal. Great day for outdoor activities.' : 'Hava kalitesi ideal. Dışarıda vakit geçirmek için harika bir gün.'; break;
        case 2: aqiColor = '#f59e0b'; aqiLabel = isEn ? 'Fair' : 'Orta'; aqiAdvice = isEn ? 'Air quality is acceptable. Sensitive individuals may experience minor symptoms.' : 'Hava kalitesi kabul edilebilir düzeyde. Hassas kişilerde hafif solunum şikayetleri görülebilir.'; break;
        case 3: aqiColor = '#f97316'; aqiLabel = isEn ? 'Moderate' : 'Hassas'; aqiAdvice = isEn ? 'Health effects may occur for sensitive groups. Avoid intense outdoor exertion.' : 'Hassas gruplar için sağlık etkileri oluşabilir. Efor sarf etmekten kaçının.'; break;
        case 4: aqiColor = '#ef4444'; aqiLabel = isEn ? 'Poor' : 'Kötü'; aqiAdvice = isEn ? 'Everyone may begin to experience health effects. Close windows.' : 'Herkes sağlık etkileri hissetmeye başlayabilir. Pencereleri kapatın.'; break;
        case 5: aqiColor = '#8b5cf6'; aqiLabel = isEn ? 'Hazardous' : 'Tehlikeli'; aqiAdvice = isEn ? 'Health alert! Strictly avoid going outside and use a mask.' : 'Sağlık alarmı! Dışarı çıkmaktan kesinlikle kaçının ve koruyucu maske kullanın.'; break;
        default: aqiColor = '#9ca3af'; aqiLabel = isEn ? 'Unknown' : 'Bilinmiyor'; aqiAdvice = isEn ? 'Air quality data unavailable.' : 'Hava kalitesi verisi alınamadı.';
    }

    // Dairesel progress bar için yüzde hesaplama (1-5 arası değeri %20-100 arasına çekiyoruz)
    const gaugePercent = (aqi / 5) * 100;
    
    aqiContent.innerHTML = `
        <div class="aqi-gauge-card">
            <div class="aqi-gauge-circle" style="background: conic-gradient(${aqiColor} ${gaugePercent}%, #e5e7eb ${gaugePercent}% 100%);">
                <div class="aqi-gauge-inner">
                    <span class="aqi-score" style="color: ${aqiColor}">${aqi}</span>
                    <span class="aqi-label">${aqiLabel}</span>
                </div>
            </div>
        </div>
        
        <div class="suggestion-card aqi-suggestion" style="border-color: ${aqiColor}40; background: ${aqiColor}10; margin-bottom: 30px;">
            <span class="suggestion-icon" style="color: ${aqiColor}"><i class="fa-solid fa-heart-pulse"></i></span>
            <div class="suggestion-text">
                <strong style="color: ${aqiColor}"><span data-i18n="healthAdvice">${getT('healthAdvice')}</span>:</strong> ${aqiAdvice}
            </div>
        </div>

        <h4 class="pollutant-title"><span data-i18n="pollutants">${getT('pollutants')}</span> (μg/m³)</h4>
        <div class="pollutants-grid">
            <div class="pollutant-card">
                <div class="pollutant-header"><span class="pollutant-name">PM2.5</span><span class="pollutant-value">${comps.pm2_5}</span></div>
                <p class="pollutant-desc">${getT('pm25Desc')}</p>
            </div>
            <div class="pollutant-card">
                <div class="pollutant-header"><span class="pollutant-name">PM10</span><span class="pollutant-value">${comps.pm10}</span></div>
                <p class="pollutant-desc">${getT('pm10Desc')}</p>
            </div>
            <div class="pollutant-card">
                <div class="pollutant-header"><span class="pollutant-name">NO2</span><span class="pollutant-value">${comps.no2}</span></div>
                <p class="pollutant-desc">${getT('no2Desc')}</p>
            </div>
            <div class="pollutant-card">
                <div class="pollutant-header"><span class="pollutant-name">O3</span><span class="pollutant-value">${comps.o3}</span></div>
                <p class="pollutant-desc">${getT('o3Desc')}</p>
            </div>
            <div class="pollutant-card">
                <div class="pollutant-header"><span class="pollutant-name">CO</span><span class="pollutant-value">${comps.co}</span></div>
                <p class="pollutant-desc">${getT('coDesc')}</p>
            </div>
            <div class="pollutant-card">
                <div class="pollutant-header"><span class="pollutant-name">SO2</span><span class="pollutant-value">${comps.so2}</span></div>
                <p class="pollutant-desc">${getT('so2Desc')}</p>
            </div>
        </div>
    `;

    const aqiSec = document.getElementById('aqiSection');
    if (aqiSec) aqiSec.classList.remove('hidden');
}

function displayForecastData(forecastData) {
    // --- 1. Saatlik Tahmin (SAAT BAŞI sekmesi) ---
    try {
        const forecastContainer = document.getElementById('forecastContainer');
        if (forecastContainer) {
            forecastContainer.innerHTML = '';
            const next24Hours = forecastData.list.slice(0, 8);
            next24Hours.forEach(item => {
                const date = new Date(item.dt * 1000);
                const hours = date.getHours().toString().padStart(2, '0');
                const temp = Math.round(item.main.temp);
                const icon = item.weather[0].icon;
                const animClass = getIconAnimClass(icon);

                const card = document.createElement('div');
                card.className = 'forecast-card';
                card.innerHTML = `
                    <span class="forecast-time">${hours}:00</span>
                    <img src="https://openweathermap.org/img/wn/${icon}.png" alt="icon" class="forecast-icon ${animClass}"> <!-- Animasyon sınıfı burada kullanılıyor -->
                    <span class="forecast-temp">${temp}°</span>
                `;
                forecastContainer.appendChild(card);
            });
        }
    } catch(e) {
        console.error("Saatlik tahmin render hatası:", e);
    }

    // --- 5 Günlük Ortak Veri Hazırlığı (Liste ve Grafik İçin) ---
    const dailyData = {};
    const today = new Date();
    const todayString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        // Yerel saate göre tarihi grupluyoruz (UTC kaymasından dolayı 2 aynı gün çıkmasını engeller)
        const dateString = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

        // Bugüne ait verileri atla (Tahmini yarından başlat)
        if (dateString === todayString) return;

        if (!dailyData[dateString]) {
            dailyData[dateString] = {
                dt: item.dt,
                temp_max: item.main.temp_max,
                temp_min: item.main.temp_min,
                icon: item.weather[0].icon.replace('n', 'd'), // Gündüz ikonu
                desc: item.weather[0].description,
                feels_like: item.main.feels_like,
                feelsLikeSum: item.main.feels_like, // Hissedilen sıcaklık toplamı
                feelsLikeCount: 1, // Hissedilen sıcaklık veri sayısı
                windSum: item.wind.speed,
                windCount: 1,
                popSum: item.pop || 0,
                popCount: 1,
                humiditySum: item.main.humidity, // Nem oranı toplamı
                humidityCount: 1, // Nem oranı veri sayısı
                hourlyData: [item]
            };
        } else {
            dailyData[dateString].temp_max = Math.max(dailyData[dateString].temp_max, item.main.temp_max);
            dailyData[dateString].temp_min = Math.min(dailyData[dateString].temp_min, item.main.temp_min);
            // Günün ortasını temsil eden veriyi (11-15 arası) tercih ediyoruz
            if (date.getHours() >= 11 && date.getHours() <= 15) { // Bu blok daha önce feels_like'ı doğrudan atıyordu
                dailyData[dateString].icon = item.weather[0].icon.replace('n', 'd');
                dailyData[dateString].desc = item.weather[0].description;
                // Artık feels_like ortalamasını alıyoruz, bu yüzden doğrudan atama yapmıyoruz
            }
            dailyData[dateString].feelsLikeSum += item.main.feels_like; // Hissedilen sıcaklık toplamına ekle
            dailyData[dateString].feelsLikeCount += 1; // Hissedilen sıcaklık veri sayısını artır
            dailyData[dateString].popSum += item.pop || 0;
            dailyData[dateString].popCount += 1;
                dailyData[dateString].windSum += item.wind.speed;
                dailyData[dateString].windCount += 1;
            dailyData[dateString].hourlyData.push(item);
        }
    });

        // Günlük ortalama yağış olasılığını ve rüzgar hızını hesapla
        // Ayrıca ortalama nem ve hissedilen sıcaklığı da hesapla
        Object.values(dailyData).forEach(day => {
            day.pop = day.popSum / day.popCount;
            day.wind = day.windSum / day.windCount;
            day.humidity = day.humiditySum / day.humidityCount;
        });

    // Sadece ilk 5 günü alıyoruz
    const dailyArray = Object.values(dailyData).slice(0, 5);
    const daysArr = ['PAZ', 'PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT'];
    const monthsArr = ['OCA', 'ŞUB', 'MAR', 'NİS', 'MAY', 'HAZ', 'TEM', 'AĞU', 'EYL', 'EKİ', 'KAS', 'ARA'];

    // --- 2. 5 Günlük Tahmin Listesi Rendering ---
    try {
        const dailyListContainer = document.getElementById('dailyForecastList');
        if (dailyListContainer) {
            dailyListContainer.innerHTML = '';

            dailyArray.forEach(day => {
                const d = new Date(day.dt * 1000);
                const cardWrapper = document.createElement('div');
                cardWrapper.className = 'daily-weather-wrapper';

                const card = document.createElement('div');
                card.className = 'daily-weather-card';
                card.innerHTML = `
                    <div class="daily-left" style="gap: 10px;">
                        <div class="daily-date-block">
                            <div class="daily-day" style="font-size: 1.1rem;">${daysArr[d.getDay()]}</div>
                        </div>
                        <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="icon" class="daily-icon" style="width: 55px;">
                    </div>
                    <div class="daily-center">
                        <div class="daily-temp" style="font-size: 1.5rem;"><span class="temp-high">${Math.round(day.temp_max)}°</span> <span class="temp-low" style="font-size: 1.1rem;">/ ${Math.round(day.temp_min)}°</span></div>
                        <div class="daily-desc" style="font-size: 0.9rem;">${day.desc}</div>
                    </div>
                    <div class="daily-right">
                        <div class="daily-detail-item"><i class="fa-solid fa-temperature-half"></i> <span>${getT('feelsLike')}</span>: <strong>${formatTemp(day.feels_like)}${getTempUnit()}</strong></div>
                        <div class="daily-detail-item"><i class="fa-solid fa-wind"></i> <span>${getT('wind')}</span>: <strong>${formatWind(day.wind)} ${getWindUnit()}</strong></div>
                        <div class="daily-detail-item"><i class="fa-solid fa-droplet"></i> <span>${getT('humidity')}</span>: <strong>%${Math.round(day.humidity)}</strong></div>
                        <div class="daily-detail-item"><i class="fa-solid fa-umbrella"></i> <span>${getT('precipProb')}</span>: <strong>%${Math.round(day.pop * 100)}</strong></div>
                    </div>
                `;

                // Tıklama ile Accordion'u (Paneli) Aç/Kapa
                card.addEventListener('click', () => {
                    const details = cardWrapper.querySelector('.daily-details-panel');
                    const isExpanded = details.classList.contains('expanded');
                    
                    // Açık olan diğer tüm panelleri kapat (Daha temiz görünüm için)
                    document.querySelectorAll('.daily-details-panel').forEach(p => p.classList.remove('expanded'));
                    
                    if (!isExpanded) details.classList.add('expanded');
                });

                const detailsPanel = document.createElement('div');
                detailsPanel.className = 'daily-details-panel';
                
                let hourlyHTML = '<div class="hourly-details-scroll">';
                day.hourlyData.forEach(h => {
                    const hDate = new Date(h.dt * 1000);
                    const hTime = hDate.getHours().toString().padStart(2, '0') + ':00';
                    
                    // Dinamik ve Gerçekçi Yağış Olasılığı Hesaplama
                    let hPop = Math.round((h.pop || 0) * 100);
                    const clouds = h.clouds ? h.clouds.all : 0;
                    const humidity = h.main ? h.main.humidity : 0;
                    const isRaining = h.weather && h.weather[0].main === 'Rain';
                    
                    if (hPop > 0 || isRaining) {
                        // Gerçekten yağış varsa %70-100 arası (bulutluluk oranına göre) dinamikleşir
                        hPop = 70 + Math.round((clouds / 100) * 30);
                    } else if (clouds > 60) {
                        // Yağış yok ama hava kapalıysa %5-%15 arası hafif bir ihtimal oluşturur
                        hPop = Math.round((clouds - 60) / 3);
                    } else if (humidity > 80) {
                        hPop = Math.round((humidity - 80) / 4);
                    } else {
                        hPop = 0;
                    }
                    
                    const hTemp = Math.round(h.main.temp);
                    const hWind = Math.round(h.wind.speed);
                    const hDeg = h.wind.deg; // Rüzgar derecesi
                    
                    hourlyHTML += `
                        <div class="hourly-detail-card">
                            <div class="h-time">${hTime}</div>
                            <img src="https://openweathermap.org/img/wn/${h.weather[0].icon}.png" alt="icon" class="h-icon">
                            <div class="h-temp">${hTemp}${getTempUnit()}</div>
                            <div class="h-wind" title="Rüzgar Yönü">
                                    <i class="fa-solid fa-arrow-up" style="transform: rotate(${hDeg + 180}deg)"></i> ${hWind} ${getWindUnit()}
                            </div>
                            <div class="h-pop" title="${getT('precipProb')}">
                                <div class="pop-bar-bg"><div class="pop-bar-fill" style="height: ${hPop}%"></div></div>
                                <span>%${hPop}</span>
                            </div>
                        </div>
                    `;
                });
                hourlyHTML += '</div>';
                detailsPanel.innerHTML = hourlyHTML;

                cardWrapper.appendChild(card);
                cardWrapper.appendChild(detailsPanel);
                dailyListContainer.appendChild(cardWrapper);
            });
        }
    } catch(e) {
        console.error("5 Günlük liste render hatası:", e);
    }

    // --- 3. Chart.js Grafiği (5 Günlük Sıcaklık) ---
    try {
        const canvas = document.getElementById('forecastChart');
        if (canvas && typeof Chart !== 'undefined') {
            const ctx = canvas.getContext('2d');
            if (window.weatherChart) { window.weatherChart.destroy(); }

            const gradientLine = ctx.createLinearGradient(0, 250, 0, 0);
            gradientLine.addColorStop(0, '#3b82f6');
            gradientLine.addColorStop(0.5, '#f59e0b');
            gradientLine.addColorStop(1, '#ef4444');

            const gradientFill = ctx.createLinearGradient(0, 250, 0, 0);
            gradientFill.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
            gradientFill.addColorStop(0.5, 'rgba(245, 158, 11, 0.1)');
            gradientFill.addColorStop(1, 'rgba(239, 68, 68, 0.2)');

            window.weatherChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dailyArray.map(i => {
                        const d = new Date(i.dt * 1000);
                        return daysArr[d.getDay()];
                    }),
                    datasets: [{
                        label: 'En Yüksek Sıcaklık (°C)',
                        data: dailyArray.map(i => Math.round(i.temp_max)),
                        borderColor: gradientLine,
                        backgroundColor: gradientFill,
                        borderWidth: 4,
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: gradientLine,
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    }]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const item = dailyArray[context.dataIndex];
                                    const tempMax = Math.round(item.temp_max);
                                    const tempMin = Math.round(item.temp_min);
                                    const wind = item.wind.speed;
                                    const pop = Math.round((item.pop || 0) * 100);
                                    return [
                                        `En Yüksek: ${tempMax}°C / En Düşük: ${tempMin}°C`,
                                        `Rüzgar: ${wind} m/s`,
                                        `Yağış İhtimali: %${pop}`
                                    ];
                                }
                            }
                        }
                    },
                    scales: { y: { ticks: { callback: function(value) { return value + '°'; } } } }
                }
            });
        }
    } catch(e) {
        console.error("Grafik çizim hatası:", e);
    }

    // --- 3. Chart.js Grafikleri (Sıcaklık ve Yağış) ---
    try {
        // Sıcaklık Eğilimi Grafiği (Line Chart)
        const tempCanvas = document.getElementById('tempChart');
        if (tempCanvas && typeof Chart !== 'undefined') {
            const ctxTemp = tempCanvas.getContext('2d');
            if (window.tempChartInstance) { window.tempChartInstance.destroy(); }

            const gradientFill = ctxTemp.createLinearGradient(0, 0, 0, 250);
            gradientFill.addColorStop(0, 'rgba(37, 99, 235, 0.4)');
            gradientFill.addColorStop(1, 'rgba(37, 99, 235, 0.05)');

            const minTemp = Math.min(...dailyArray.map(i => formatTemp(i.temp_max))) - 5;

            window.tempChartInstance = new Chart(ctxTemp, {
                type: 'line',
                data: {
                    labels: dailyArray.map(i => {
                        const d = new Date(i.dt * 1000);
                        return `${daysArr[d.getDay()]} ${d.getDate()}`;
                    }),
                    datasets: [{
                        label: getT('tempTrend'),
                        data: dailyArray.map(i => formatTemp(i.temp_max)),
                        borderColor: '#2563eb',
                        backgroundColor: gradientFill,
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#ffffff',
                        pointBorderColor: '#2563eb',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 9,
                        pointHoverBorderWidth: 3,
                        pointHitRadius: 15
                    }]
                },
                options: { 
                    responsive: true, 
                maintainAspectRatio: false,
                layout: { padding: 10 },
                    animation: { duration: 800, easing: 'easeInOutQuart' },
                    plugins: { 
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(17, 24, 39, 0.9)',
                            titleFont: { size: 13 },
                            bodyFont: { size: 13, weight: 'bold' },
                            padding: 10,
                            cornerRadius: 8,
                            displayColors: false,
                            callbacks: {
                                label: function(context) {
                                const item = dailyArray[context.dataIndex];
                                return [
                                    `${getT('feelsLike')}: ${formatTemp(item.feels_like)}${getTempUnit()}`,
                                    `${getT('humidity')}: %${Math.round(item.humidity)}`,
                                    `Max/Min: ${formatTemp(item.temp_max)}${getTempUnit()} / ${formatTemp(item.temp_min)}${getTempUnit()}`,
                                    `🌬️ ${getT('wind')}: ${formatWind(item.wind)} ${getWindUnit()}`
                                ];
                                }
                            }
                        }
                    },
                    scales: { 
                        x: { grid: { display: false } },
                        y: { 
                            min: minTemp,
                            grid: { color: 'rgba(0,0,0,0.05)' },
                            ticks: { callback: function(value) { return value + getTempUnit(); } } 
                        } 
                    }
                }
            });
        }

        // Yağış Olasılığı Grafiği (Bar Chart)
        const rainCanvas = document.getElementById('rainChart');
        if (rainCanvas && typeof Chart !== 'undefined') {
            const ctxRain = rainCanvas.getContext('2d');
            if (window.rainChartInstance) { window.rainChartInstance.destroy(); }

            window.rainChartInstance = new Chart(ctxRain, {
                type: 'bar',
                data: {
                    labels: dailyArray.map(i => {
                        const d = new Date(i.dt * 1000);
                        return `${daysArr[d.getDay()]} ${d.getDate()}`;
                    }),
                    datasets: [{
                        label: getT('precipProb'),
                        data: dailyArray.map(i => Math.round(i.pop * 100)),
                        backgroundColor: 'rgba(96, 165, 250, 0.7)',
                        hoverBackgroundColor: '#3b82f6',
                        borderColor: 'transparent',
                        borderWidth: 0,
                        borderRadius: 6,
                        barPercentage: 0.6
                    }]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    animation: { duration: 800, easing: 'easeInOutQuart' },
                    plugins: { 
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(17, 24, 39, 0.9)',
                            padding: 10,
                            cornerRadius: 8,
                            displayColors: false,
                            callbacks: {
                                label: function(context) {
                                const item = dailyArray[context.dataIndex];
                                return [
                                    `${getT('precipProb')}: %${Math.round(item.pop * 100)}`,
                                    `${getT('humidity')}: %${Math.round(item.humidity)}`,
                                    `${getT('feelsLike')}: ${formatTemp(item.feels_like)}${getTempUnit()}`,
                                    `🌬️ ${getT('wind')}: ${formatWind(item.wind)} ${getWindUnit()}`
                                ];
                                }
                            }
                        }
                    },
                    scales: { 
                        x: { grid: { display: false } },
                        y: { 
                            beginAtZero: true, 
                            max: 100, 
                            grid: { color: 'rgba(0,0,0,0.05)', borderDash: [5, 5] },
                            ticks: { stepSize: 25, callback: function(value) { return value + '%'; } } 
                        } 
                    }
                }
            });
        }
    } catch(e) {
        console.error("Grafik çizim hatası:", e);
    }
}

// --- Tarayıcı İleri/Geri Butonlarını ve SEO Linklerini Yönetme ---
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.city) {
        getWeatherData({ city: event.state.city }, false);
        cityInput.value = event.state.city;
    } else {
        const urlParams = new URLSearchParams(window.location.search);
        const cityParam = urlParams.get('city');
        if (cityParam) {
            getWeatherData({ city: cityParam }, false);
            cityInput.value = cityParam;
        } else {
            // Parametre yoksa sayfayı temizle
            weatherResult.classList.add('hidden');
            document.getElementById('forecastResult').classList.add('hidden');
            document.getElementById('chartContainer').classList.add('hidden');
            cityInput.value = '';
        }
    }
});

let currentBaseLayer = null;
function updateBaseMapLayer() {
    if (!window.weatherMapInstance) return;
    if (currentBaseLayer) window.weatherMapInstance.removeLayer(currentBaseLayer);
    
    let url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attr = '&copy; OpenStreetMap';
    
    if (uiPrefs.mapLayer === 'satellite') {
        url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        attr = '&copy; Esri';
    } else if (uiPrefs.mapLayer === 'dark') {
        url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
        attr = '&copy; CARTO';
    }
    
    currentBaseLayer = L.tileLayer(url, { maxZoom: 19, attribution: attr }).addTo(window.weatherMapInstance);
    currentBaseLayer.bringToBack();
}

// Sayfa ilk yüklendiğinde URL'de parametre varsa veriyi çek
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Sekme (Tab) ve Menü Mantığını EN ÜSTE Alıyoruz (Zamanlama/Race Condition Önlemi) ---
    const navLinks = document.querySelectorAll('.sub-nav-link');
    const tabSections = document.querySelectorAll('.tab-section');

    if (tabSections.length > 0) {
        window.activateTab = function(targetId) {
            navLinks.forEach(l => {
                l.classList.remove('active');
                if (l.getAttribute('data-target') === targetId) l.classList.add('active');
            });
            tabSections.forEach(sec => sec.classList.remove('active-tab'));
            
            const targetSec = document.getElementById(targetId);
            if (targetSec) {
                targetSec.classList.add('active-tab');
                // Harita sekmesi açıldığında Leaflet'in render düzeltmesi için:
                if (targetId === 'weatherResult' && window.weatherMapInstance) {
                    setTimeout(() => { window.weatherMapInstance.invalidateSize(); }, 100);
                }
                // YENİ EKLENEN: Grafik sekmesi açıldığında Chart.js'in render (0px height) düzeltmesi için:
                if (targetId === 'chartContainer' && window.weatherChart) {
                    setTimeout(() => { window.weatherChart.resize(); }, 100);
                }
                // Chart.js render (0px height) hatasını çözmek için resize tetikleyici
                if (targetId === 'chartContainer') {
                    if (window.tempChartInstance) { setTimeout(() => { window.tempChartInstance.resize(); }, 100); }
                    if (window.rainChartInstance) { setTimeout(() => { window.rainChartInstance.resize(); }, 100); }
                }
            }
        };

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                activateTab(link.getAttribute('data-target'));
            });
        });
    }

    // Hamburger Menü
    const hamburgerBtn = document.querySelector('.hamburger-menu');
    const sideDrawer = document.getElementById('sideDrawer');
    const closeDrawerBtn = document.getElementById('closeDrawerBtn');
    const drawerOverlay = document.getElementById('drawerOverlay');

    window.toggleDrawer = () => {
        if (sideDrawer && drawerOverlay) {
            sideDrawer.classList.toggle('open');
            drawerOverlay.classList.toggle('show');
        }
    };

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', window.toggleDrawer);
    if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', window.toggleDrawer);
    if (drawerOverlay) drawerOverlay.addEventListener('click', window.toggleDrawer);

    // --- Ayarlar Paneli Tetikleyicileri ---
    const langSelect = document.getElementById('langSelect');
    const unitSelect = document.getElementById('unitSelect');
    const mapSelect = document.getElementById('mapSelect');
    
    if (langSelect) {
        langSelect.value = uiPrefs.lang;
        langSelect.addEventListener('change', (e) => {
            uiPrefs.lang = e.target.value; localStorage.setItem('lang', uiPrefs.lang);
            translateUI(); if(currentWeatherParams) getWeatherData(currentWeatherParams, false);
        });
    }
    if (unitSelect) {
        unitSelect.value = uiPrefs.units;
        unitSelect.addEventListener('change', (e) => {
            uiPrefs.units = e.target.value; localStorage.setItem('units', uiPrefs.units);
            translateUI(); if(currentWeatherParams) getWeatherData(currentWeatherParams, false);
        });
    }
    if (mapSelect) {
        mapSelect.value = uiPrefs.mapLayer;
        mapSelect.addEventListener('change', (e) => {
            uiPrefs.mapLayer = e.target.value; localStorage.setItem('mapLayer', uiPrefs.mapLayer);
            updateBaseMapLayer();
        });
    }
    translateUI(); // Arayüzü hafızadaki dile göre çevir

    // --- 2. URL veya Konumdan Hava Durumunu Çekme ---
    const urlParams = new URLSearchParams(window.location.search);
    const cityParam = urlParams.get('city');
    
    if (cityParam) { 
        getWeatherData({ city: cityParam }, false); 
        if (cityInput) cityInput.value = cityParam; 
    } else {
        // URL'de şehir yoksa kullanıcının anlık konumunu almayı dene
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    getWeatherData({ lat, lon }, false);
                },
                (error) => {
                    console.log("Konum izni verilmedi veya alınamadı:", error.message);
                }
            );
        }
    }

    // --- 3. İnteraktif Harita Güvenli Başlatma ---
    try {
        const mapContainer = document.getElementById('weatherMap');
        // Kütüphane (L) yüklenmemişse kodun çökmesini engelle
        if (mapContainer && typeof L !== 'undefined') {
            // Hot-reload yapıldığında haritanın tekrar başlatılıp çökmesini engelle
            if (!window.weatherMapInstance) {
                const tempLayer = L.tileLayer(`/api/tiles/temp_new/{z}/{x}/{y}`, {
                    maxZoom: 19, opacity: 0.6, attribution: '&copy; OpenWeatherMap'
                });

                const rainLayer = L.tileLayer(`/api/tiles/precipitation_new/{z}/{x}/{y}`, {
                    maxZoom: 19, opacity: 0.8, attribution: '&copy; OpenWeatherMap'
                });

                const cloudLayer = L.tileLayer(`/api/tiles/clouds_new/{z}/{x}/{y}`, {
                    maxZoom: 19, opacity: 0.7, attribution: '&copy; OpenWeatherMap'
                });

                const map = window.weatherMapInstance = L.map('weatherMap', {
                    center: [39.0, 35.0],
                    zoom: 5.5,
                    minZoom: 5,
                    maxZoom: 19,
                    zoomSnap: 0.5,
                    wheelPxPerZoomLevel: 100,
                    layers: [tempLayer] // Base map fonksiyonla dinamik eklenir
                });
                updateBaseMapLayer();

                // Katman Kontrol Paneli
                const overlayMaps = {
                    [`🌡️ <span data-i18n="mapTemp">${getT('mapTemp')}</span>`]: tempLayer,
                    [`☔ <span data-i18n="mapRain">${getT('mapRain')}</span>`]: rainLayer,
                    [`☁️ <span data-i18n="mapCloud">${getT('mapCloud')}</span>`]: cloudLayer
                };
                L.control.layers(null, overlayMaps, { collapsed: false, position: 'topright' }).addTo(map);

                // --- Harita Renk Lejantı (Legend) ---
                const legendControl = L.control({position: 'bottomleft'});
                legendControl.onAdd = function (map) {
                    const div = L.DomUtil.create('div', 'leaflet-control map-legend');
                    div.innerHTML = `
                        <div class="legend-section temp-legend">
                            <div class="legend-title"><span data-i18n="mapTemp">${getT('mapTemp')}</span> (°C)</div>
                            <div class="legend-bar temp-bar"></div>
                            <div class="legend-labels"><span>-40</span><span>0</span><span>40</span></div>
                        </div>
                        <div class="legend-section rain-legend hidden">
                            <div class="legend-title"><span data-i18n="mapRain">${getT('mapRain')}</span> (mm)</div>
                            <div class="legend-bar rain-bar"></div>
                            <div class="legend-labels"><span>0</span><span>10</span><span>50</span></div>
                        </div>
                        <div class="legend-section cloud-legend hidden">
                            <div class="legend-title"><span data-i18n="mapCloud">${getT('mapCloud')}</span> (%)</div>
                            <div class="legend-bar cloud-bar"></div>
                            <div class="legend-labels"><span>0</span><span>50</span><span>100</span></div>
                        </div>
                    `;
                    L.DomEvent.disableClickPropagation(div); // Tıklamaların haritaya geçmesini engeller
                    return div;
                };
                legendControl.addTo(map);

                // Katmanlar açılıp kapandığında lejantı akıllıca güncelle
                map.on('overlayadd', function(e) {
                    if (e.name.includes('mapTemp')) { const el = document.querySelector('.temp-legend'); if(el) el.classList.remove('hidden'); }
                    if (e.name.includes('mapRain')) { const el = document.querySelector('.rain-legend'); if(el) el.classList.remove('hidden'); }
                    if (e.name.includes('mapCloud')) { const el = document.querySelector('.cloud-legend'); if(el) el.classList.remove('hidden'); }
                });
                map.on('overlayremove', function(e) {
                    if (e.name.includes('mapTemp')) { const el = document.querySelector('.temp-legend'); if(el) el.classList.add('hidden'); }
                    if (e.name.includes('mapRain')) { const el = document.querySelector('.rain-legend'); if(el) el.classList.add('hidden'); }
                    if (e.name.includes('mapCloud')) { const el = document.querySelector('.cloud-legend'); if(el) el.classList.add('hidden'); }
                });

                // --- Harita İçi GPS Konum Butonu ---
                const locateControl = L.control({position: 'bottomright'});
                locateControl.onAdd = function(map) {
                    const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
                    div.innerHTML = `<button id="mapLocateBtn" title="Konumumu Bul" style="background:var(--bg-card); color:var(--text-main); border:none; width:34px; height:34px; cursor:pointer; font-size:1.2rem; display:flex; align-items:center; justify-content:center;"><i class="fa-solid fa-location-crosshairs"></i></button>`;
                    div.onclick = function(e) {
                        e.stopPropagation();
                        const btn = document.getElementById('mapLocateBtn');
                        if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                                (position) => {
                                    const lat = position.coords.latitude;
                                    const lon = position.coords.longitude;
                                    getWeatherData({ lat, lon, fromMapClick: true });
                                    map.flyTo([lat, lon], 12, { animate: true, duration: 1.5 }); // Butona basılınca haritayı da oraya kaydır
                                    if (btn) btn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
                                },
                                (error) => { alert(getT('errFetch')); if (btn) btn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>'; }
                            );
                        }
                    };
                    return div;
                };
                locateControl.addTo(map);

                // DÖNGÜ KAYNAĞINI SİL: Harita otomatik hareket ettiğinde hiçbir şey tetiklenmesin
                map.off('moveend'); 
                map.off('centerchange');
                
                map.on('click', function(e) {
                    if (isUpdating) return; // Kilitliyse (isFetching) işlemi reddet
                    const lat = e.latlng.lat;
                    const lon = e.latlng.lng;
                    
                    getWeatherData({ lat: lat, lon: lon, fromMapClick: true });
                });
            }
        }
    } catch (e) {
        console.error("Harita yüklenirken hata oluştu:", e);
    }
});

// --- İletişim Formu Gönderme ve Yüklenme Animasyonu ---
document.addEventListener('DOMContentLoaded', () => {
    const atmosForm = document.getElementById('contactForm');

    if (atmosForm) {
        atmosForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Sayfanın yenilenmesini engeller

            const submitBtn = this.querySelector('.submit-btn');
            const originalBtnText = submitBtn.innerHTML;

            // Butonu yükleniyor moduna sokalım
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ' + (typeof uiPrefs !== 'undefined' && uiPrefs.lang === 'tr' ? 'Gönderiliyor...' : 'Sending...');
            submitBtn.disabled = true;

            // EmailJS Gönderim İşlemi
            emailjs.sendForm('service_hfc9naw', 'template_yttij4h', this)
                .then(function() {
                    // BAŞARILI DURUM: Şık toast mesajını gösterir
                    if (typeof showToast === 'function') {
                        showToast(typeof getT === 'function' ? getT('alertSuccess') : 'Mesajınız başarıyla iletildi!', 'fa-circle-check');
                    } else {
                        alert('Mesajınız başarıyla iletildi!');
                    }
                    
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                    atmosForm.reset(); // Formu temizle
                }, function(error) {
                    // HATA DURUMU
                    console.error('EmailJS Hatası:', error);
                    if (typeof showToast === 'function') {
                        showToast('Hata oluştu, tekrar deneyin.', 'fa-circle-xmark');
                    } else {
                        alert('Hata oluştu, tekrar deneyin.');
                    }
                    
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    }
});

// --- Verileri Otomatik Yenileme (30 Dakikada Bir) ---
setInterval(() => {
    if (currentWeatherParams) {
        getWeatherData(currentWeatherParams, false); // false: URL geçmişini (history) kirletmemek için
    }
}, 30 * 60 * 1000); // 30 dakika = 1.800.000 milisaniye

// --- Service Worker Kaydı (PWA Çevrimdışı Destek İçin) ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('Service Worker başarıyla kaydedildi, kapsam (scope):', registration.scope);
                
                // Yeni bir güncelleme bulunduğunda
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showUpdateToast(registration); // Güncelleme bildirimini göster
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('Service Worker kaydı başarısız oldu:', error);
            });
            
        // Service worker başarıyla güncellendiğinde sayfayı otomatik yenile
        let refreshing;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (refreshing) return; window.location.reload(); refreshing = true;
        });
    });
}

// --- Akıllı Tavsiye Modülü ---
function generateSmartAdvice(hourlyData) {
    // Önümüzdeki 3-6 saatlik veriyi analiz et (3 saatlik aralıklarla yaklaşık 2-3 veri noktası)
    const nextHours = hourlyData.slice(1, 4); // İlk saati atla, sonraki 3-9 saat

    let hasRain = false;
    let highWind = false;
    let coldTemp = false;
    let niceWeather = false;

    nextHours.forEach(hour => {
        const pop = hour.pop * 100; // Yağış olasılığı %
        const windSpeed = hour.wind.speed; // Rüzgar hızı (km/s veya m/s, API'ye göre)
        const temp = hour.main.temp; // Sıcaklık
        const weatherId = hour.weather[0].id;

        if (pop > 30) hasRain = true;
        if (windSpeed > 20) highWind = true; // 20 km/s yaklaşık 72 km/h
        if (temp < 15) coldTemp = true;
        if (weatherId >= 800 && weatherId <= 804 && temp > 20) niceWeather = true; // Açık veya az bulutlu ve sıcak
    });

    if (hasRain) {
        return "Önümüzdeki saatlerde yağış bekleniyor, şemsiyeni yanına almayı unutma! ☂️";
    } else if (highWind) {
        return "Rüzgar sert esiyor, dışarıda dikkatli ol! 💨";
    } else if (coldTemp) {
        return "Hava serinliyor, üzerine ince bir ceket alabilirsin. 🧥";
    } else if (niceWeather) {
        return "Hava tam yürüyüşlük, güneşin tadını çıkar! ☀️";
    }

    return null; // Tavsiye yoksa null döndür
}