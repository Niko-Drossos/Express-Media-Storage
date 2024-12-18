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
app.use(express.json({ limit: '50mb' })) // This is to allow for large file uploads
app.use(expressLayouts)
app.set("view engine", "ejs")
app.set("views", "src/view")
app.set("layout", "./layouts/main")
app.use(express.static('src/view'))
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' })) // This is to allow for large file uploads
app.use(cookieParser())

/* ------------------------------- App router ------------------------------- */

app.use("/auth", require("./routes/auth.routes"))
app.use("/user", require("./routes/user.routes"))
app.use("/file", require("./routes/file.routes"))
app.use("/search", require("./routes/search.routes"))
app.use("/pool", require("./routes/pool.routes"))
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
  // Allow for a redirect url after login
  const redirectURL = req.query.redirect || req.headers.referer

  res.render("auth.ejs", {
    register: false,
    redirectURL
  })
})

/* --------------------------- Register an account -------------------------- */

app.get("/auth/register", (req, res) => {
  // Allow for a redirect url after registration
  const redirectURL = req.query.redirect || req.headers.referer

  res.render("auth.ejs", {
    register: true,
    redirectURL
  })
})

/* -------------------------- Form to upload files -------------------------- */

app.get("/upload", authenticateUserJWT, async (req, res) => {
  res.render("upload.ejs")
})

/* ----------------------- Navigate to the search page ---------------------- */

app.get("/search", async (req, res) => {
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

    res.render("search.ejs", {
      searchType: "media",
      query,
      response: response.data || []
    })
  } else { 
    // Render the page without searching for anything
    res.render("search.ejs", {
      searchType: "media",
      query,
      response: []
    })
  }
})

// TODO: Add support for these routes later
/* app.get("/search-users", (req, res) => {
  res.render("404.ejs", {
    searchType: "users"
  })
})
*/

app.get("/search-pools", async (req, res) => {
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

    res.render("search.ejs", {
      searchType: "media",
      query,
      response: response.data.searchResults || []
    })
  } else { 
    // Render the page without searching for anything
    res.render("search.ejs", {
      searchType: "pools",
      query,
      response: []
    })
  }
}) 

/* ---------------------- View a file with document id ---------------------- */

app.get("/media/:mediaType", async (req, res) => {
  const { mediaType } = req.params
  const { id } = req.query

  /* if (mediaType !== ("image" || "video" || "audio")) {
    const redirectUrl = req.headers.referer || `http://${req.headers.host}`
    res.redirect(301, redirectUrl)
    return
  } */

  const request = await fetch(`${API_URL}/search/${mediaType}s?id=${id}&comments=true`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": getCookies(req, "media_authentication")
    },
    credentials: "include"
  })

  const response = await request.json()

  res.render("media.ejs", {
    // Send information for the file request on the client side
    mediaType,
    media: response.data.searchResults[0],
    uploader: response.data.searchResults[0].user
  })
})

/* ------------------------ Get the users own profile ----------------------- */

app.get("/profile", authenticateUserJWT, async (req, res) => {
  const request = await fetch(`${API_URL}/user/${req.userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": getCookies(req, "media_authentication")
    },
    credentials: "include"
  })

  const response = await request.json()
  console.log(response)
  if (response.error) {
    res.redirect(301, `/auth/login?redirect=${new URLSearchParams({ referer: req.headers.referer })}`)
    console.log(response.error)
    return
  }

  res.render("profile.ejs", response.data.user)
})

/* -------------------- Get a profile with a specific id -------------------- */
app.get("/profile/:id", authenticateUserJWT, async (req, res) => {
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
    return
  }

  res.render("profile.ejs", response.data.user)
})

/* -------------------------------------------------------------------------- */

app.listen(port, host, () => console.log(`server started at http://localhost:${port}`))