let player;
let loopCount = 0;
const START_TIME = 42;   // 0:42
const END_TIME = 108;    // 1:48
const MAX_LOOPS = 2;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('cpr-video', {
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
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

/* Emergency timer (keep your existing logic) */
let seconds = 0;
setInterval(() => {
  seconds++;
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  document.getElementById("timer").innerText =
  `Time Elapsed ${min}:${sec.toString().padStart(2, "0")}`;


}, 1000);

let map;
function initMap() {
  const ucsdCenter = { lat: 32.8801, lng: -117.2340 };

  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 16,
    center: ucsdCenter,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false
  });
  // ✅ 临时 AED 测试点（假数据）
  const testAED = {
    lat: 32.8810,
    lng: -117.2376,
    name: "Geisel Library AED",
  };

  const marker = new google.maps.Marker({
  position: { lat: testAED.lat, lng: testAED.lng },
  map: map,
  title: testAED.name,
  icon: {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 0,   // ← 完全不可见
  },
  label: {
    text: "📍",
    fontSize: "33px",
  },
  });

  const infoWindow = new google.maps.InfoWindow({
    content: `<strong>${testAED.name}</strong><br/>Near main entrance`,
  });

  marker.addListener("click", () => {
    infoWindow.open(map, marker);
  });
}
