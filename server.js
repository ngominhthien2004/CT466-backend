require('dotenv').config();

const app = require("./app");
const config = require("./app/config");
const MongoDB = require("./app/utils/mongodb.util");

async function startServer() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || config.db.uri;
        await MongoDB.connect(MONGODB_URI);
        console.log("Connected to the database");

        const PORT = process.env.PORT || config.app.port;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}.`);
        });
    } catch (error) {
        console.error("Error starting server:", error);
        process.exit();
    }
}

startServer();
