const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const socketio = require("socket.io");

const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

const clients = {}; // To store connected clients' data

io.on("connection", (socket) => {
    console.log("New client connected");

    // Prompt for device name
    socket.emit("request_name");

    socket.on("set_name", (name) => {
        clients[socket.id] = { name, lat: 0, lon: 0 };
        io.emit("update_clients", clients);
    });

    socket.on("send_location", (data) => {
        if (clients[socket.id]) {
            clients[socket.id].lat = data.latitude;
            clients[socket.id].lon = data.longitude;
            io.emit("update_clients", clients);
        }
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected");
        delete clients[socket.id];
        io.emit("update_clients", clients);
    });
});

app.get("/", (req, res) => {
    res.render("index");
});

server.listen(3000, () => {
    console.log("Backend server started on port 3000");
});


//npx nodemon app.js