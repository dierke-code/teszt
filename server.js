require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const REDIRECT_URI = "https://sajatoldalad.com/auth/twitch/callback";

// Statikus fájlok kiszolgálása
app.use(express.static("public"));

app.get("/auth/twitch/callback", async (req, res) => {
    const code = req.query.code;

    try {
        // 1️⃣ Kérjünk egy access tokent a Twitch-től
        const tokenResponse = await axios.post("https://id.twitch.tv/oauth2/token", null, {
            params: {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code: code,
                grant_type: "authorization_code",
                redirect_uri: REDIRECT_URI
            }
        });

        const accessToken = tokenResponse.data.access_token;

        // 2️⃣ Lekérjük a felhasználói adatokat a Twitch API-ból
        const userResponse = await axios.get("https://api.twitch.tv/helix/users", {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Client-Id": CLIENT_ID
            }
        });

        const userData = userResponse.data.data[0];

        res.send(`
            <h1>Sikeres bejelentkezés!</h1>
            <p>Felhasználónév: ${userData.display_name}</p>
            <p>E-mail: ${userData.email}</p>
            <img src="${userData.profile_image_url}" alt="Profilkép">
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send("Hiba történt a bejelentkezés során.");
    }
});

app.listen(PORT, () => console.log(`Szerver fut a http://localhost:${PORT} címen`));