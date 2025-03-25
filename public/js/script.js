// Debugging flag
const DEBUG = true;

// Ensure garagesData and csrfToken are available
const garagesData = window.garagesData || [];
if (DEBUG && !window.garagesData) console.warn('garagesData not found, using empty array');

const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY'; // Replace with your actual key
const csrfToken = window.csrfToken || "{{ csrf_token() }}"; // Fallback for Blade injection
if (DEBUG && !csrfToken) console.warn('CSRF token not found');

// Map initialization
let map;
function initializeMap() {
    try {
        map = L.map('map', {
            zoomControl: false,
            attributionControl: false,
            minZoom: 4,
            maxZoom: 20
        }).setView([12.5657, 104.9910], 6);

        const googleHybrid = L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}&key=' + GOOGLE_API_KEY, {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: '© <a href="https://maps.google.com">Google</a>'
        }).addTo(map);

        const googleStreets = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=' + GOOGLE_API_KEY, {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: '© <a href="https://maps.google.com">Google</a>'
        });

        const baseLayers = {
            "Hybrid View": googleHybrid,
            "Street View": googleStreets
        };
        L.control.layers(baseLayers).addTo(map);
    } catch (error) {
        console.error('Map initialization failed:', error);
    }
}

// Icon definitions
const mouIcons = {
    '-10': L.icon({ iconUrl: './assets/images/blacklist.png', iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40] }),
    '-2': L.icon({ iconUrl: './assets/images/orange.png', iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40] }),
    '-1': L.icon({ iconUrl: './assets/images/orange.png', iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40] }),
    '0': L.icon({ iconUrl: './assets/images/red.png', iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40] }),
    '1': L.icon({ iconUrl: './assets/images/red.png', iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40] }),
    '10': L.icon({ iconUrl: './assets/images/orange.png', iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40] }),
    '50': L.icon({ iconUrl: './assets/images/orange.png', iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40] }),
    '100': L.icon({ iconUrl: './assets/images/green.png', iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40] })
};

const specialIcons = {
    'SRE': L.icon({ iconUrl: './assets/images/blue.png', iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40] }),
    'SREKP': L.icon({ iconUrl: './assets/images/yellow.png', iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40] }),
    'SREKP1': L.icon({ iconUrl: './assets/images/green.png', iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40] })
};

const defaultIcon = L.icon({ iconUrl: './assets/images/red.png', iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40] });
const normalIcon = new L.Icon.Default();

const defaultMarkerData = {
    id: null,
    name: "",
    org: "", phone: "", visitDate: "", fc: "",
    team: "", totalVehicle: "", status: "", remark: "",
    iconUrl: null,
    originalIcon: normalIcon
};

const markerMap = new Map();
const currentLocationIcon = L.divIcon({
    className: 'current-location-dot',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -6]
});

let currentLocationMarker = null;

function showCurrentLocation() {
    if (!navigator.geolocation) {
        console.error("Geolocation not supported");
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            if (currentLocationMarker) map.removeLayer(currentLocationMarker);
            currentLocationMarker = L.marker([lat, lon], { icon: currentLocationIcon }).addTo(map);
            map.setView([lat, lon], 13);
        },
        (error) => {
            console.error(`Unable to get location: ${error.message}`);
            if (DEBUG) console.error('Geolocation error:', error);
        }
    );
}

function addMarkersFromDB() {
    if (!garagesData.length) {
        if (DEBUG) console.warn('No garage data available');
        return;
    }

    const uniqueGarages = [];
    const seenIds = new Set();
    garagesData.forEach(garage => {
        if (!seenIds.has(garage.id)) {
            seenIds.add(garage.id);
            uniqueGarages.push(garage);
        }
    });

    uniqueGarages.forEach(garage => {
        if (!garage.lat || !garage.lon || isNaN(parseFloat(garage.lat)) || isNaN(parseFloat(garage.lon))) {
            if (DEBUG) console.warn(`Invalid coordinates for garage ${garage.id}:`, garage);
            return;
        }

        const latlng = { lat: parseFloat(garage.lat), lng: parseFloat(garage.lon) };
        let icon = garage.state ? mouIcons[garage.state] || normalIcon : normalIcon;
        let iconUrl = garage.state ? mouIcons[garage.state]?.options.iconUrl : null;
        if (garage.state === '100' && specialIcons[garage.org]) {
            icon = specialIcons[garage.org];
            iconUrl = icon.options.iconUrl;
        }

        try {
            const marker = L.marker(latlng, { icon });
            const markerData = {
                id: garage.id,
                name: garage.name || "",
                org: garage.org || "",
                phone: garage.phone || "",
                visitDate: garage.visitDate || "",
                fc: garage.fc || "",
                team: garage.team || "",
                totalVehicle: garage.totalVehicle || "",
                status: garage.state || "",
                remark: garage.remark || "",
                iconUrl: iconUrl,
                originalIcon: icon
            };
            bindPopupEvents(marker, latlng, markerData);
            marker.addTo(map);
            marker._garageId = garage.id;
            markerMap.set(garage.id, marker);
        } catch (error) {
            if (DEBUG) console.error(`Failed to add marker for garage ${garage.id}:`, error);
        }
    });

    const validMarkers = uniqueGarages.filter(g => g.lat && g.lon && !isNaN(g.lat) && !isNaN(g.lon));
    if (validMarkers.length) {
        try {
            const group = new L.featureGroup(validMarkers.map(g => L.marker([g.lat, g.lon])));
            if (group.getBounds().isValid()) {
                map.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 10 });
            }
        } catch (error) {
            if (DEBUG) console.error('Bounds fitting failed:', error);
        }
    }
}

function searchGarages(query) {
    const searchDropdown = document.getElementById('searchDropdown');
    if (!searchDropdown) {
        if (DEBUG) console.error('Search dropdown not found');
        return;
    }
    if (!query) {
        searchDropdown.style.display = 'none';
        searchDropdown.innerHTML = '';
        return;
    }

    const matches = garagesData.filter(garage => {
        return (
            (garage.id && String(garage.id).toLowerCase().includes(query)) ||
            (garage.name && garage.name.toLowerCase().includes(query)) ||
            (garage.phone && garage.phone.toLowerCase().includes(query)) ||
            (garage.org && garage.org.toLowerCase().includes(query)) ||
            (garage.visitDate && garage.visitDate.toLowerCase().includes(query)) ||
            (garage.fc && garage.fc.toLowerCase().includes(query)) ||
            (garage.team && garage.team.toLowerCase().includes(query)) ||
            (garage.totalVehicle && String(garage.totalVehicle).toLowerCase().includes(query)) ||
            (garage.state && String(garage.state).toLowerCase().includes(query)) ||
            (garage.remark && garage.remark.toLowerCase().includes(query))
        );
    });

    searchDropdown.innerHTML = '';
    if (matches.length === 0) {
        searchDropdown.style.display = 'none';
        return;
    }

    const uniqueMatches = [];
    const seenIds = new Set();
    matches.forEach(garage => {
        if (!seenIds.has(garage.id)) {
            seenIds.add(garage.id);
            uniqueMatches.push(garage);
        }
    });

    uniqueMatches.forEach(garage => {
        let iconUrl;
        if (garage.state && mouIcons[garage.state]) {
            // Use the state-specific icon if a condition is set
            iconUrl = mouIcons[garage.state].options.iconUrl;
            // Override with special icon if state is '100' and org matches
            if (garage.state === '100' && specialIcons[garage.org]) {
                iconUrl = specialIcons[garage.org].options.iconUrl;
            }
        } else {
            // Use the Leaflet default marker for unconditioned markers
            iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png';
        }

        const option = document.createElement('div');
        option.innerHTML = `
            <img src="${iconUrl}" alt="Garage Icon" style="width: 20px; height: 20px; margin-right: 5px;">
            <span>${garage.name || 'Unnamed Garage'}</span>
        `;
        option.addEventListener('click', () => {
            const marker = markerMap.get(garage.id);
            if (marker) {
                map.setView([garage.lat, garage.lon], 16);
                marker.openPopup();
                searchDropdown.style.display = 'none';
                searchDropdown.innerHTML = '';
            }
        });
        searchDropdown.appendChild(option);
    });
    searchDropdown.style.display = 'block';
}

function createPopupContent(latlng, data) {
    const mouStateNames = {
        '-10': 'Blacklist', '-2': 'Terminated', '-1': 'Discontinued',
        '0': 'Not MOU', '1': 'In Talking', '10': 'MOU No Loan Yet',
        '50': 'MOU Paid Off', '100': 'MOU Active'
    };
    const statusText = mouStateNames[data.status] || (data.status === '' ? 'Unconditioned' : 'Unknown');
    const iconUrlToShow = data.iconUrl || 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png';
    return `
        <div style="min-width: 200px;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td><strong>Name:</strong></td><td>${data.name || ''}</td></tr>
                <tr><td><strong>Org:</strong></td><td>${data.org || ''}</td></tr>
                <tr><td><strong>Phone:</strong></td><td>${data.phone || ''}</td></tr>
                <tr><td><strong>Visit Date:</strong></td><td>${data.visitDate || ''}</td></tr>
                <tr><td><strong>FC:</strong></td><td>${data.fc || ''}</td></tr>
                <tr><td><strong>Team:</strong></td><td>${data.team || ''}</td></tr>
                <tr><td><strong>Total Vehicle:</strong></td><td>${data.totalVehicle || ''}</td></tr>
                <tr><td><strong>Status:</strong></td><td>${statusText}</td></tr>
                <tr><td><strong>Remark:</strong></td><td>${data.remark || ''}</td></tr>
            </table>
            <div class="marker-coordinates" style="margin-top: 10px; display: flex; align-items: center;">
                <img src="${iconUrlToShow}" alt="Location Pin" style="height: 32px; width: auto; max-width: 32px; margin-right: 8px;">
                <span>${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}</span>
            </div>
            <div style="margin-top: 10px; text-align: right;">
                <button id="editBtn" style="padding: 5px 10px; border: 1px solid #dadce0; border-radius: 4px; background-color: #f1f3f4; color: #000; cursor: pointer; font-size: 14px;">Edit</button>
            </div>
        </div>
    `;
}

let currentMarker = null;
let currentMarkerData = null;
let currentLatLng = null;

function bindPopupEvents(marker, latlng, markerSpecificData) {
    marker.bindPopup(createPopupContent(latlng, markerSpecificData));
    marker.on('popupopen', function() {
        const editBtn = document.getElementById('editBtn');
        if (editBtn) {
            editBtn.addEventListener('click', function() {
                currentMarker = marker;
                currentMarkerData = { ...markerSpecificData };
                currentLatLng = latlng;
                const editForm = document.getElementById('editForm');
                if (editForm) {
                    document.getElementById('edit-id').value = markerSpecificData.id || '';
                    document.getElementById('edit-name').value = markerSpecificData.name || '';
                    document.getElementById('edit-org').value = markerSpecificData.org || '';
                    document.getElementById('edit-phone').value = markerSpecificData.phone || '';
                    document.getElementById('edit-visitDate').value = markerSpecificData.visitDate || '';
                    document.getElementById('edit-fc').value = markerSpecificData.fc || '';
                    document.getElementById('edit-team').value = markerSpecificData.team || '';
                    document.getElementById('edit-totalVehicle').value = markerSpecificData.totalVehicle || '';
                    document.getElementById('edit-status').value = markerSpecificData.status || '';
                    document.getElementById('edit-remark').value = markerSpecificData.remark || '';
                    editForm.style.display = 'block';
                    marker.closePopup();
                    const searchDropdown = document.getElementById('searchDropdown');
                    if (searchDropdown) {
                        searchDropdown.style.display = 'none';
                        searchDropdown.innerHTML = '';
                    }
                } else {
                    if (DEBUG) console.error('Edit form not found');
                }
            });
        }
    });
}

function showNotification(message, type = 'success') {
    const container = document.getElementById('notificationContainer');
    if (!container) {
        if (DEBUG) console.error('Notification container not found');
        console.log(`Notification (${type}): ${message}`);
        return;
    }
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        padding: 10px 20px;
        margin-bottom: 10px;
        border-radius: 4px;
        background-color: ${type === 'success' ? '#d4edda' : '#f8d7da'};
        color: ${type === 'success' ? '#155724' : '#721c24'};
        opacity: 1;
        transition: opacity 0.3s ease;
    `;
    notification.textContent = message;
    container.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => container.removeChild(notification), 300);
    }, 3000);
}

async function saveMarkerData(markerData, lat, lng, isNew = false) {
    console.log('Saving marker data:', { markerData, lat, lng, csrfToken });
    
    if (!csrfToken) {
        console.error('CSRF token not found');
        return false;
    }

    const payload = { ...markerData, lat, lng, _token: csrfToken };
    console.log('Request payload:', payload);

    try {
        const response = await fetch('/save-marker', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Server response:', result);

        if (response.ok && result.success) {
            if (!isNew) {
                showNotification('Updated Successfully', 'success');
            }
            return result;
        } else {
            console.error('Failed to save:', result.message || 'Unknown error');
            return false;
        }
    } catch (error) {
        console.error('Save error:', error);
        return false;
    }
}

function closeEditModal() {
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.style.display = 'none';
        currentMarker = null;
        currentMarkerData = null;
        currentLatLng = null;
        const searchDropdown = document.getElementById('searchDropdown');
        if (searchDropdown) {
            searchDropdown.style.display = 'none';
            searchDropdown.innerHTML = '';
        }
    }
}

// Wait for DOM to load before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    addMarkersFromDB();

    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    if (searchInput && searchBtn) {
        searchInput.addEventListener('input', (e) => searchGarages(e.target.value.trim().toLowerCase()));
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim().toLowerCase();
            searchGarages(query);
        });
    } else {
        if (DEBUG) console.error('Search input or button not found');
    }

    document.addEventListener('click', (e) => {
        const searchContainer = document.querySelector('.search-container');
        const searchDropdown = document.getElementById('searchDropdown');
        if (searchContainer && !searchContainer.contains(e.target) && searchDropdown?.style.display === 'block') {
            searchDropdown.style.display = 'none';
            searchDropdown.innerHTML = '';
        }
    });

    const addMarkerBtn = document.getElementById('addMarkerBtn');
    let isAddingMarker = false;
    if (addMarkerBtn) {
        addMarkerBtn.addEventListener('click', function() {
            isAddingMarker = !isAddingMarker;
            addMarkerBtn.classList.toggle('active');
            map.getContainer().style.cursor = isAddingMarker ? 'crosshair' : 'grab';
            const searchDropdown = document.getElementById('searchDropdown');
            if (searchDropdown) {
                searchDropdown.style.display = 'none';
                searchDropdown.innerHTML = '';
            }
        });
    }

    const currentLocationBtn = document.getElementById('currentLocationBtn');
    if (currentLocationBtn) {
        currentLocationBtn.addEventListener('click', showCurrentLocation);
    }

    const saveEditBtn = document.getElementById('saveEditBtn');
    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', async function() {
            if (!currentMarker || !currentMarkerData) {
                console.error('No marker selected for editing');
                return;
            }

            currentMarkerData.id = document.getElementById('edit-id').value || null;
            currentMarkerData.name = document.getElementById('edit-name').value || '';
            currentMarkerData.org = document.getElementById('edit-org').value || '';
            currentMarkerData.phone = document.getElementById('edit-phone').value || '';
            currentMarkerData.visitDate = document.getElementById('edit-visitDate').value || '';
            currentMarkerData.fc = document.getElementById('edit-fc').value || '';
            currentMarkerData.team = document.getElementById('edit-team').value || '';
            currentMarkerData.totalVehicle = document.getElementById('edit-totalVehicle').value || '';
            currentMarkerData.status = document.getElementById('edit-status').value || '';
            currentMarkerData.remark = document.getElementById('edit-remark').value || '';

            const result = await saveMarkerData(currentMarkerData, currentLatLng.lat, currentLatLng.lng);

            if (result && result.id) {
                const existingIndex = garagesData.findIndex(g => g.id === result.id);
                if (!currentMarkerData.id) {
                    if (existingIndex === -1 && !markerMap.has(result.id)) {
                        currentMarkerData.id = result.id;
                        markerMap.set(result.id, currentMarker);
                        garagesData.push({
                            id: result.id,
                            name: currentMarkerData.name,
                            phone: currentMarkerData.phone,
                            org: currentMarkerData.org,
                            visitDate: currentMarkerData.visitDate,
                            fc: currentMarkerData.fc,
                            team: currentMarkerData.team,
                            totalVehicle: currentMarkerData.totalVehicle,
                            state: currentMarkerData.status,
                            remark: currentMarkerData.remark,
                            lat: currentLatLng.lat,
                            lon: currentLatLng.lng
                        });
                    }
                } else {
                    if (existingIndex !== -1) {
                        garagesData[existingIndex] = {
                            id: currentMarkerData.id,
                            name: currentMarkerData.name,
                            phone: currentMarkerData.phone,
                            org: currentMarkerData.org,
                            visitDate: currentMarkerData.visitDate,
                            fc: currentMarkerData.fc,
                            team: currentMarkerData.team,
                            totalVehicle: currentMarkerData.totalVehicle,
                            state: currentMarkerData.status,
                            remark: currentMarkerData.remark,
                            lat: currentLatLng.lat,
                            lon: currentLatLng.lng
                        };
                    }
                }

                let newIcon = currentMarkerData.status ? mouIcons[currentMarkerData.status] || normalIcon : normalIcon;
                let newIconUrl = currentMarkerData.status ? mouIcons[currentMarkerData.status]?.options.iconUrl : null;
                if (currentMarkerData.status === '100' && specialIcons[currentMarkerData.org]) {
                    newIcon = specialIcons[currentMarkerData.org];
                    newIconUrl = newIcon.options.iconUrl;
                }
                currentMarker.setIcon(newIcon);
                currentMarkerData.iconUrl = newIconUrl;
                currentMarkerData.originalIcon = newIcon;
                currentMarker._garageId = currentMarkerData.id;
                currentMarker.setPopupContent(createPopupContent(currentLatLng, currentMarkerData));

                const query = searchInput?.value.trim().toLowerCase();
                if (query) searchGarages(query);

                closeEditModal();
            }
        });
    }

    const closeEditBtn = document.getElementById('closeEditBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    if (closeEditBtn) closeEditBtn.addEventListener('click', closeEditModal);
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);

    map.on('click', async function(e) {
        if (isAddingMarker) {
            const latlng = e.latlng;
            const icon = normalIcon;
            const marker = L.marker(latlng, { icon });
            const markerSpecificData = { ...defaultMarkerData, status: '', iconUrl: null, originalIcon: icon };

            const result = await saveMarkerData(markerSpecificData, latlng.lat, latlng.lng, true);
            if (result && result.id) {
                const existingIndex = garagesData.findIndex(g => g.id === result.id);
                if (existingIndex === -1 && !markerMap.has(result.id)) {
                    markerSpecificData.id = result.id;
                    marker._garageId = result.id;
                    markerMap.set(result.id, marker);
                    garagesData.push({
                        id: result.id,
                        name: markerSpecificData.name,
                        phone: markerSpecificData.phone,
                        org: markerSpecificData.org,
                        visitDate: markerSpecificData.visitDate,
                        fc: markerSpecificData.fc,
                        team: markerSpecificData.team,
                        totalVehicle: markerSpecificData.totalVehicle,
                        state: markerSpecificData.status,
                        remark: markerSpecificData.remark,
                        lat: latlng.lat,
                        lon: latlng.lng
                    });
                    bindPopupEvents(marker, latlng, markerSpecificData);
                    marker.addTo(map);
                } else {
                    map.removeLayer(marker);
                }

                const query = searchInput?.value.trim().toLowerCase();
                if (query) searchGarages(query);
            } else {
                map.removeLayer(marker);
            }

            isAddingMarker = false;
            addMarkerBtn?.classList.remove('active');
            map.getContainer().style.cursor = 'grab';
        }
    });

    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    if (zoomInBtn) zoomInBtn.addEventListener('click', () => map.zoomIn());
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => map.zoomOut());
});