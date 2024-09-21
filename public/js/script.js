const socket = io();
console.log("Socket.IO connected");

const map = L.map("map").setView([0, 0], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let deviceName = '';

socket.on("request_name", () => {
    deviceName = prompt("Enter your device name:");
    socket.emit("set_name", deviceName);
});

socket.on("update_clients", (clients) => {
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    Object.keys(clients).forEach((id) => {
        const { name, lat, lon } = clients[id];
        if (lat && lon) {
            L.marker([lat, lon]).addTo(map)
                .bindPopup(`<div class="popup-content">${name}</div>`)
                .openPopup();
        }
    });
});

if (navigator.geolocation) {
    console.log("Geolocation is supported");

    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            console.log(`Position: ${latitude}, ${longitude}`);
            socket.emit("send_location", { latitude, longitude });

            map.setView([latitude, longitude], 13);
        },
        (error) => {
            console.log("Geolocation error:", error);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        }
    );
} else {
    console.log("Geolocation is not supported by this browser.");
}
