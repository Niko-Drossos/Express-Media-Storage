const express = require('express')
const dotenv = require('dotenv')
const { connectDB } = require('./models/connection')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const expressLayouts = require('express-ejs-layouts')
/* ------------------------------- Middlewares ------------------------------- */
const authenticateUserJWT = require("./models/middleware/authenticateUserJWT")
const getCookies = require('./models/middleware/getCookies')
/* -------------------------------------------------------------------------- */
dotenv.config()

const { PORT, frontendUrl, API_URL } = process.env

const app = express()
const port = PORT || 3000
const host = '0.0.0.0' // This makes the server listen on all available interfaces

connectDB()

const corsOptions = {
  origin: frontendUrl,
  methods: 'POST, GET, OPTIONS',
  credentials: true,
}

/* ------------------------------ App settings ------------------------------ */

app.use(cors(corsOptions))
app.use(express.json())
app.use(expressLayouts)
app.set("view engine", "ejs")
app.set("views", "src/view")
app.set("layout", "./layouts/main")
app.use(express.static('src/view'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

/* ------------------------------- App router ------------------------------- */

app.use("/auth", require("./routes/auth.routes"))
app.use("/user", require("./routes/user.routes"))
app.use("/file", require("./routes/file.routes"))
app.use("/search", require("./routes/search.routes"))
app.use("/post", require("./routes/post.routes"))
app.use("/comment", require("./routes/comment.routes"))
app.use("/view", require("./routes/view.routes"))
app.use("/vote", require("./routes/vote.routes"))
app.use("/daat", require("./routes/daat.routes"))

/* -------------------------------- Homepage -------------------------------- */

app.get("/", (req, res) => {
  res.render("index.ejs")
})

/* ---------------------------- Login to an account ------------------------- */

app.get("/auth/login", (req, res) => {
  res.render("auth.ejs", {
    register: false
  })
})

/* --------------------------- Register an account -------------------------- */

app.get("/auth/register", (req, res) => {
  res.render("auth.ejs", {
    register: true
  })
})

/* -------------------------- Form to upload files -------------------------- */

app.get("/upload", (req, res) => {
  res.render("upload.ejs")
})

/* ----------------------- Navigate to the search page ---------------------- */

app.get("/search-media", async (req, res) => {
  const query = req.query

  if (query.mediaType) {   
    // Construct the search URL
    const searchURL = `${API_URL}/search/${query.mediaType}?${new URLSearchParams(query)}`

    const request = await fetch(searchURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": getCookies(req, "media_authentication")
      },
      credentials: "include"
    })

    const response = await request.json()
    
    if (response.error) {
      res.render("search.ejs", {
        searchType: "media",
        query,
        response: [],
        error: response.error
      })
      return
    }

    console.log(response.data.searchResults)
    
    res.render("search.ejs", {
      searchType: "media",
      query,
      response: response.data.searchResults || []
    })
  } else { 
    res.render("search.ejs", {
      searchType: "media",
      query,
      response: []
    })
  }
})

app.get("/search-users", (req, res) => {
  res.render("search.ejs", {
    searchType: "users"
  })
})

app.get("/search-pools", (req, res) => {
  res.render("search.ejs", {
    searchType: "pools"
  })
})

app.get("/media", (req, res) => {
  res.render("media.ejs")
})

/* ------------------------ Get the users own profile ----------------------- */

app.get("/profile", async (req, res) => {
  const request = await fetch(`${API_URL}/user/${req.userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": getCookies(req, "media_authentication")
    },
    credentials: "include"
  })

  const response = await request.json()

  if (response.error) {
    res.redirect(301, "/auth/login")
    return
  }

  res.render("profile.ejs", response.data.user)
})

/* -------------------- Get a profile with a specific id -------------------- */
app.get("/profile/:id", async (req, res) => {
  const id = req.params.id

  const request = await fetch(`${API_URL}/user/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": getCookies(req, "media_authentication")
    },
    credentials: "include"
  })

  const response = await request.json()

  if (response.error) {
    res.redirect(301, req.headers.referer)
    alert(response.error)
    return
  }

  res.render("profile.ejs", response.data.user)
})

// Get all the users
/* app.get("/users", (req, res) => {
  res.render("users.ejs", {})
})
 */
/*
app.get("/documents", (req, res) => {
  res.render("documents.ejs")
})

app.get("/upload", (req, res) => {
  res.render("upload.ejs")
})

app.get("/login", (req, res) => {
  res.render("login.ejs")
})

app.get("/account", (req, res) => {
  res.render("account.ejs")
})

app.get("/daat-chat", (req, res) => {
  res.render("chat.ejs")
}) */
/* -------------------------------------------------------------------------- */

app.listen(port, host, () => console.log(`server started at http://localhost:${port}`))