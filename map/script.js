async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  const { Geocoder } = await google.maps.importLibrary("geocoding");

  const map = new Map(document.getElementById("map"), {
    center: { lat: 40.9, lng: -74.1 }, // Centered on NJ
    zoom: 8,
    gestureHandling: "greedy",
    mapId: "DEMO_MAP_ID",
  });

  //caching geocoding results to avoid hitting API limits
  function getCachedCoords(address) {
    const cache = JSON.parse(localStorage.getItem("geocodeCache") || "{}");
    return cache[address] || null;
  }

  function setCachedCoords(address, coords) {
    const cache = JSON.parse(localStorage.getItem("geocodeCache") || "{}");
    cache[address] = coords;
    localStorage.setItem("geocodeCache", JSON.stringify(cache));
  }

  // initiate geocoder
  const geocoder = new Geocoder();

  // JSON READ
  const response = await fetch("data/tournaments.json");
  const tournaments = await response.json();

  function geocodeAddress(address) {
    return new Promise((resolve, reject) => {
      // Check cache first
      const cached = getCachedCoords(address);
      if (cached) {
        console.log("Using cached coords for:", address);
        resolve(cached);
        return;
      }
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK") {
          resolve({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          });
          // Save to cache
          setCachedCoords(address, {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          });

          console.log("Geocoded + cached:", address);
          resolve(coords);
        } else {
          reject(`Geocode failed: ${status}`);
        }
      });
    });
  }

  // TEST HARDCODED
  //const tournaments = [
  //  {
  //    name: "Koopa Cup Lite 15",
  //    location: { lat: 0, lng: 0 },
  //    address:
  //      "Billy's Midway Arcade 312 Lafayette Ave, Hawthorne, New Jersey 07506",
  //    date: "04/06/2026",
  //    url: "https://worldbeyblade.org/Thread-Koopa-Cup-Lite-15--124588",
  //  },
  //  {
  //    name: "Metal Fight Revival",
  //    location: { lat: 45.764, lng: 4.8357 },
  //    address: "Lyon, France",
  //    date: "2024-10-20",
  //    url: "https://worldbeyblade.org/",
  //  },
  //  {
  //    name: "Zero-G Challenge",
  //    location: { lat: 43.2965, lng: 5.3698 },
  //    address: "Marseille, France",
  //    date: "2024-11-05",
  //    url: "https://worldbeyblade.org/",
  //  },
  //  {
  //    name: "WBO Open",
  //    location: { lat: 43.6532, lng: -79.3832 },
  //    address: "Toronto, ON, Canada",
  //    date: "2024-09-28",
  //    url: "https://worldbeyblade.org/",
  //  },
  //  {
  //    name: "East Coast Major",
  //    location: { lat: 40.7128, lng: -74.006 },
  //    address: "New York, NY, USA",
  //    date: "2024-12-01",
  //    url: "https://worldbeyblade.org/",
  //  },
  //];

  for (let tournament of tournaments) {
    if (tournament.location.lat === 0 && tournament.location.lng === 0) {
      try {
        const coords = await geocodeAddress(tournament.address, geocoder);
        tournament.location = coords;
      } catch (error) {
        console.error(`Geocoding error for ${tournament.name}:`, error);
      }
    }
  }

  const tournamentList = document.getElementById("tournament-list");

  tournaments.forEach((tournament) => {
    addTournamentToListAndMap(
      tournament,
      map,
      AdvancedMarkerElement,
      tournamentList,
    );
  });

  const modal = document.getElementById("event-modal");
  const modalClose = document.querySelector(".modal-close");
  modalClose.addEventListener("click", () => {
    modal.classList.add("modal-hidden");
  });
  window.addEventListener("click", (event) => {
    if (event.target == modal) {
      modal.classList.add("modal-hidden");
    }
  });
}

function addTournamentToListAndMap(
  tournament,
  map,
  AdvancedMarkerElement,
  tournamentList,
) {
  const marker = new AdvancedMarkerElement({
    map: map,
    position: tournament.location,
    title: tournament.name,
  });

  const listItem = document.createElement("li");
  const nameElement = document.createElement("div");
  nameElement.classList.add("tournament-name");
  nameElement.textContent = tournament.name;
  const addressElement = document.createElement("div");
  addressElement.classList.add("tournament-address");
  addressElement.textContent = tournament.address;
  listItem.appendChild(nameElement);
  listItem.appendChild(addressElement);
  tournamentList.appendChild(listItem);

  listItem.addEventListener("click", () => {
    map.panTo(tournament.location);
    map.setZoom(12);
  });

  marker.addListener("gmp-click", () => {
    openModal(tournament);
  });
}

// Search functionality
const searchBar = document.getElementById("search-bar");
searchBar.addEventListener("input", () => {
  const query = searchBar.value.toLowerCase();
  const tournamentItems = document.querySelectorAll("#tournament-list li");
  tournamentItems.forEach((item) => {
    const name = item
      .querySelector(".tournament-name")
      .textContent.toLowerCase();
    const address = item
      .querySelector(".tournament-address")
      .textContent.toLowerCase();
    if (name.includes(query) || address.includes(query)) {
      item.style.display = "";
    } else {
      item.style.display = "none";
    }
  });
});

//navbar
document.addEventListener("DOMContentLoaded", function () {
  const navbarToggle = document.getElementById("navbarToggle");
  const navbarMenu = document.getElementById("navbarMenu");
  if (navbarToggle && navbarMenu) {
    navbarToggle.addEventListener("click", function () {
      navbarToggle.classList.toggle("is-active");
      navbarMenu.classList.toggle("is-active");
      const isExpanded = navbarToggle.getAttribute("aria-expanded") === "true";
      navbarToggle.setAttribute("aria-expanded", !isExpanded);
    });
  }
});

function openModal(tournament) {
  const modal = document.getElementById("event-modal");
  document.getElementById("modal-title").textContent = tournament.name;
  document.getElementById("modal-date").textContent =
    `Date: ${tournament.date}`;
  document.getElementById("modal-link").src = tournament.url;
  modal.classList.remove("modal-hidden");
}

initMap();
