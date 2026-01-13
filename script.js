// 1) CPR YouTube Loop
let player;
let loopCount = 0;
let selectedAED = null; // user selected destination
const START_TIME = 42;   // 0:42
const END_TIME = 108;    // 1:48
const MAX_LOOPS = 2;

function onYouTubeIframeAPIReady() {
  player = new YT.Player("cpr-video", {
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}

function onPlayerReady(event) {
  event.target.seekTo(START_TIME);
  event.target.playVideo();
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    checkTime();
  }
}

function checkTime() {
  if (!player || loopCount >= MAX_LOOPS) return;

  const currentTime = player.getCurrentTime();
  if (currentTime >= END_TIME) {
    loopCount++;
    player.seekTo(START_TIME);
  }
  requestAnimationFrame(checkTime);
}


// 2) Emergency Timer
let seconds = 0;
setInterval(() => {
  seconds++;
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  const timerEl = document.getElementById("timer");
  if (timerEl) {
    timerEl.innerText = `${min}:${sec.toString().padStart(2, "0")}`;
  }
}, 1000);


// 3) Google Map + AED Markers (📍) + Nearest 3 Cards
let map;
let markers = [];
let infoWindow;

const API_BASE = "http://127.0.0.1:8000"; // change if needed

// Remove old markers to avoid duplicate rendering
function clearMarkers() {
  markers.forEach(m => m.setMap(null));
  markers = [];
}

// Add one AED marker using an emoji label
function addAEDMarker(aed) {
  const marker = new google.maps.Marker({
    position: { lat: aed.latitude, lng: aed.longitude },
    map,
    title: aed.name,

    // Hide default marker icon so only emoji label is visible
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 0,
    },

    // Use emoji as the visible marker
    label: {
      text: "📍",
      fontSize: "28px",
    },
  });

  marker.addListener("click", () => {
    const html = `
      <div style="min-width:220px">
        <div style="font-weight:700; margin-bottom:6px;">${aed.name}</div>
        <div><strong>Building:</strong> ${aed.building_name || ""}</div>
        <div><strong>Location:</strong> ${aed.location_description || ""}</div>
        ${aed.distance_meters !== undefined ? `<div><strong>Distance:</strong> ${aed.distance_meters} m</div>` : ""}
      </div>
    `;
    infoWindow.setContent(html);
    infoWindow.open(map, marker);
  });

  markers.push(marker);
  return marker;
}

function metersToNice(m) {
  if (m >= 1000) return `${(m / 1000).toFixed(2)} km`;
  return `${Math.round(m)} m`;
}

function estimateWalkMinutes(meters) {
  // Rough walking speed ~ 80 meters/minute
  return Math.max(1, Math.round(meters / 80));
}

// Render the nearest AEDs as "cards" under the map
function renderAEDCards(aeds) {
  const wrap = document.getElementById("aed-cards");
  if (!wrap) return;

  wrap.innerHTML = "";
  selectedAED = aeds[0] || null; // default: nearest one

  aeds.forEach((aed) => {
    const dist = aed.distance_meters ?? 0;
    const mins = estimateWalkMinutes(dist);

    const card = document.createElement("div");
    card.className = "aed-card-item";
    card.innerHTML = `
      <div class="aed-left">
        <div class="aed-name">${aed.building_name || aed.name}</div>
        <div class="aed-desc">${aed.location_description || ""}</div>
      </div>
      <div class="aed-right">
        <div class="aed-dist">${metersToNice(dist)}</div>
        <div class="aed-walk">est. ${mins} min walk</div>
      </div>
    `;

    // Click a card => center map and open info window
    card.addEventListener("click", () => {
      const pos = { lat: aed.latitude, lng: aed.longitude };
      map.panTo(pos);
      map.setZoom(17);
      selectedAED = aed;
      infoWindow.setContent(`
        <div style="min-width:220px">
          <div style="font-weight:700; margin-bottom:6px;">${aed.name}</div>
          <div><strong>Building:</strong> ${aed.building_name || ""}</div>
          <div><strong>Location:</strong> ${aed.location_description || ""}</div>
          ${aed.distance_meters !== undefined ? `<div><strong>Distance:</strong> ${aed.distance_meters} m</div>` : ""}
        </div>
      `);

      // find the marker for this AED and open it (best-effort)
      const marker = markers.find(m => {
        const p = m.getPosition();
        return p && Math.abs(p.lat() - aed.latitude) < 1e-6 && Math.abs(p.lng() - aed.longitude) < 1e-6;
      });
      if (marker) infoWindow.open(map, marker);
    });

    wrap.appendChild(card);
  });
}

// Fetch nearby AEDs from your FastAPI backend
async function fetchNearbyAEDs(userLat, userLng, limit = 3) {
  const url = `${API_BASE}/api/aeds/nearby?lat=${userLat}&lng=${userLng}&limit=${limit}`;
  const res = await fetch(url);
  return await res.json();
}

// initMap will be called by Google Maps callback
async function initMap() {
  const ucsdCenter = { lat: 32.8801, lng: -117.2340 };

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 16,
    center: ucsdCenter,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  });

  infoWindow = new google.maps.InfoWindow();

  // Use geolocation if available; fallback to UCSD center
  const useLocationAndLoad = async (lat, lng) => {
    try {
      // 1) Fetch nearest AEDs (3)
      const nearest3 = await fetchNearbyAEDs(lat, lng, 3);
      console.log("Nearest AEDs:", nearest3);

      // 2) Render markers (only these 3)
      clearMarkers();
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat, lng });

      nearest3.forEach((aed) => {
        const marker = addAEDMarker(aed);
        bounds.extend(marker.getPosition());
      });

      // 3) Fit bounds so all 3 markers are visible
      if (markers.length > 0) {
        map.fitBounds(bounds);
      }

      // 4) Render the AED cards list below map
      renderAEDCards(nearest3);

    } catch (err) {
      console.error("Failed to load AEDs from backend:", err);
    }
  };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => useLocationAndLoad(pos.coords.latitude, pos.coords.longitude),
      () => useLocationAndLoad(ucsdCenter.lat, ucsdCenter.lng),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  } else {
    useLocationAndLoad(ucsdCenter.lat, ucsdCenter.lng);
  }
}
function openGoogleMapsNavigation(destLat, destLng) {
  // If you have user location, use it; otherwise Google will ask.
  const url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=walking`;
  window.open(url, "_blank");
}

function setupStartNavigationButton() {
  const btn = document.getElementById("start-nav-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (!selectedAED) {
      alert("Please select an AED destination first.");
      return;
    }
    openGoogleMapsNavigation(selectedAED.latitude, selectedAED.longitude);
  });
}
setupStartNavigationButton();
