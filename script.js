async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  const { Geocoder } = await google.maps.importLibrary("geocoding");

  const map = new Map(document.getElementById("map"), {
    center: { lat: 46.603354, lng: 1.888334 }, // Centered on France
    zoom: 5,
    gestureHandling: "greedy",
    mapId: "DEMO_MAP_ID",
  });

  const geocoder = new Geocoder();

  const tournaments = [
    {
      name: "Beyblade Burst Tournament",
      location: { lat: 48.8566, lng: 2.3522 },
      address: "Paris, France",
      date: "2024-09-15",
      url: "https://worldbeyblade.org/",
    },
    {
      name: "Metal Fight Revival",
      location: { lat: 45.764, lng: 4.8357 },
      address: "Lyon, France",
      date: "2024-10-20",
      url: "https://worldbeyblade.org/",
    },
    {
      name: "Zero-G Challenge",
      location: { lat: 43.2965, lng: 5.3698 },
      address: "Marseille, France",
      date: "2024-11-05",
      url: "https://worldbeyblade.org/",
    },
    {
      name: "WBO Open",
      location: { lat: 43.6532, lng: -79.3832 },
      address: "Toronto, ON, Canada",
      date: "2024-09-28",
      url: "https://worldbeyblade.org/",
    },
    {
      name: "East Coast Major",
      location: { lat: 40.7128, lng: -74.006 },
      address: "New York, NY, USA",
      date: "2024-12-01",
      url: "https://worldbeyblade.org/",
    },
  ];

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

function openModal(tournament) {
  const modal = document.getElementById("event-modal");
  document.getElementById("modal-title").textContent = tournament.name;
  document.getElementById("modal-date").textContent =
    `Date: ${tournament.date}`;
  document.getElementById("modal-link").href = tournament.url;
  modal.classList.remove("modal-hidden");
}

initMap();
