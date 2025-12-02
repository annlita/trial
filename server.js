const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

function loadUsers() {
    const filePath = path.join(__dirname, "users.json");
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
}

const users = loadUsers();

// Ensure the log file exists
const logFile = path.join(__dirname, "login_logs.txt");
if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, "");
}

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const validUser = users.find(
        (u) => u.username === username && u.password === password
    );

    if (validUser) {

        // If ADMIN → go to admin page
        if (username === "admin" && password === "1234") {
            return res.redirect("/admin.html");
        }

        // normal user
        return res.redirect("/success.html");
    }

    // Log failed login
    const entry = `FAILED LOGIN | User: ${username} | Time: ${new Date().toISOString()}\n`;
    fs.appendFileSync(logFile, entry);

    // Return index.html with error message
    const loginPage = fs.readFileSync("./public/index.html", "utf8");
    const errorInjected = loginPage.replace(
        "<div class=\"login-box\">",
        `<div class="login-box">
            <p class="error">❌ Incorrect username or password</p>`
    );
    res.send(errorInjected);
});


// ⭐ FIX: Add GET route for logs
app.get("/logs", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "logs.html"));
});

app.get("/get-logs", (req, res) => {
    const logPath = path.join(__dirname, "failed_logs.txt");
    if (!fs.existsSync(logPath)) return res.send("No logs yet.");
    
    const logs = fs.readFileSync(logPath, "utf8");
    res.send(logs);
});



app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
