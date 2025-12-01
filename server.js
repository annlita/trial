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

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const validUser = users.find(
        (u) => u.username === username && u.password === password
    );

    if (validUser) {
        // ⭐ CHECK IF ADMIN
        if (username === "admin" && password === "1234") {
            return res.redirect("/admin.html");
        }
        // ⭐ NORMAL USER
        return res.redirect("/success.html");
    }

    // Invalid login → show error
    const loginPage = fs.readFileSync("./public/index.html", "utf8");
    const errorInjected = loginPage.replace(
        '<div class="login-box">',
        `<div class="login-box">
            <p class="error">❌ Incorrect username or password</p>`
    );

    res.send(errorInjected);
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
