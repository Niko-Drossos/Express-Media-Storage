const express = require('express')
const dotenv = require('dotenv')
const { connectDB } = require('./models/connection')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const expressLayouts = require('express-ejs-layouts')
const readline = require('readline')
const path = require('path')
/* --------------------------------- Helpers -------------------------------- */
const { uploadStreams } = require('./helpers/gridFsMethods')
/* ------------------------------- Middlewares ------------------------------- */
const userLoggedIn = require("./models/middleware/userLoggedIn")
const getCookies = require('./models/middleware/getCookies')
const { acceptUploads } = require('./models/middleware/allowUploads')
/* -------------------------------------------------------------------------- */
dotenv.config()

const { PORT, frontendUrl, API_URL } = process.env

const app = express()
const port = PORT || 3000 // Default port of 3000
const host = '0.0.0.0' // This makes the server listen on all available interfaces

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
app.set("views", path.join(__dirname, "/view"))
app.set("layout", "./layouts/main")
app.use(express.static(path.join(__dirname, "/view")))
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
app.use("/favorite", require("./routes/favorite.routes"))
app.use("/suggest", require("./routes/suggest.routes"))
app.use("/transcription", require("./routes/transcription.routes"))
app.use("/manage", require("./routes/manage.routes"))

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

app.get("/upload", userLoggedIn, async (req, res) => {
  res.render("upload.ejs")
})

/* -------------------------- Form to upload files -------------------------- */

app.get("/journal", userLoggedIn, async (req, res) => {
  const date = new Date()
  const options = { year: '2-digit', month: '2-digit', day: '2-digit' };
  const today = date.toLocaleDateString('en-US', options).replace(/\//g, '-');

  const request = await fetch(`${API_URL}/search/pools?startDate=${today}&endDate=${today}&userId=${req.userId}&limit=1`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'x-access-token': getCookies(req, "media_authentication"),
      'Content-Type': 'application/json'
    },
  })

  const response = await request.json()
  
  // Send the entries to the frontend to render for the user
  let entries = response.data?.searchResults[0]?.journal || []

  const poolId = response.data?.searchResults[0]?._id || ""

  res.render("journal.ejs", { entries, poolId })
})

/* ------------------------------- Create pool ------------------------------ */

app.get("/create-pool", userLoggedIn, async (req, res) => {
  const query = req.query

  const request = await fetch(`${API_URL}/user/my-files?${new URLSearchParams(query)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": getCookies(req, "media_authentication")
    },
    credentials: "include"
  })

  const response = await request.json()

  // Don't let the user access the page is there is an error.
  // This only throws an error if the user is not logged in, or login has expired
  if (response.error) {
    res.redirect(307, `/auth/login?redirect=${new URLSearchParams({ referer: req.headers.referer })}`)
    console.log(response.error)
    return
  }

  const { images, videos, audios } = response.data

  res.render("create-pool.ejs", {
    query,
    response: response.data,
    results: {
      images,
      videos,
      audios
    }
  })
})


/* -------------------------------------------------------------------------- */
/*                              Searching routes                              */
/* -------------------------------------------------------------------------- */

/* ----------------------- Navigate to the search page ---------------------- */

app.get("/search-media", userLoggedIn, async (req, res) => {
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

    // Handle error cases
    if (!response.success) {
      let action = {
        name: "Home",
        url: "/"
      }
      
      if (request.status === 401) {
        action = {
          name: "Login",
          url: `/auth/login?redirect=${req.headers.referer}`
        }
      }

      return res.render("error.ejs", {
        status: request.status,
        message: response.message,
        action: action
      })
    }

    res.render("search-media.ejs", {
      searchType: "media",
      query,
      response: response.data,
      searchResults: response.data.searchResults
    })
  } else { 
    // Render the page without searching for anything
    res.render("search-media.ejs", {
      searchType: "media",
      query,
      // Default response to prevent throwing "undefined" errors
      response: {
        resultCount: 0,
        totalDocuments: 0,
        page: 1,
        pageCount: 1,
        limit: 12,
        query: {},
        searchResults: []
      },
      searchResults: []
    })
  }
})

/* ---------------------------- Search for users ---------------------------- */

// TODO: Add support for these routes later
/* app.get("/search-users", (req, res) => {
  res.render("404.ejs", {
    searchType: "users"
  })
})
*/

/* ---------------------------- Search pools form --------------------------- */

app.get("/search-pools", userLoggedIn, async (req, res) => {
  const query = req.query
  
  // Construct the search URL
  const searchURL = `${API_URL}/search/pools?${new URLSearchParams(query)}`

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
    res.render("error.ejs", {
      query,
      response: {},
      error: response.error
    })
    return
  }

  res.render("search-pools.ejs", {
    query,
    response: response.data,
    searchResults: response.data.searchResults || []
  })
}) 

/* -------------------------------------------------------------------------- */
/*                               Viewing routes                               */
/* -------------------------------------------------------------------------- */

/* ---------------------- View a file with document id ---------------------- */

app.get("/media/:mediaType", userLoggedIn, async (req, res) => {
  try {

    const { mediaType } = req.params
    const { id } = req.query

    /* if (mediaType !== ("image" || "video" || "audio")) {
      const redirectUrl = req.headers.referer || `http://${req.headers.host}`
      res.redirect(307, redirectUrl)
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
  } catch (error) {
    console.log(error)
    res.render('error.ejs', { status: 500, message: "Something went wrong", action: { name: "Home", url: "/" } })
  }
})

/* ------------------------------- View a pool ------------------------------ */

app.get("/pools/:id", userLoggedIn, async (req, res) => {
  const { id } = req.params

  const request = await fetch(`${API_URL}/search/pools?id=${id}&limit=1&comments=true&populate=true`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": getCookies(req, "media_authentication")
    },
    credentials: "include"
  })

  const response = await request.json()

  if (response.error) {
    res.render('error.ejs', { status: request.status, message: response.message, action: { name: "Home", url: "/" } })
    console.log(response.error)
    return
  }

  res.render("pool.ejs", {
    pool: response.data.searchResults[0]
  })
})

/* ------------------------ Get the users own profile ----------------------- */

app.get("/profile", userLoggedIn, async (req, res) => {
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
    res.redirect(307, `/auth/login?redirect=${new URLSearchParams({ referer: req.headers.referer })}`)
    console.log(response.error)
    return
  }

  res.render("profile.ejs", response.data.user)
})

/* -------------------- Get a profile with a specific id -------------------- */
app.get("/profile/:id", userLoggedIn, async (req, res) => {
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
    res.redirect(307, req.headers.referer)
    return
  }

  res.render("profile.ejs", response.data.user)
})

/* ---------------------------- Manage user media --------------------------- */
// TODO: Implement managing page
app.get("/manage?", userLoggedIn, async (req, res) => {
  // const id = req.params.id

  /* const request = await fetch(`${API_URL}/user/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": getCookies(req, "media_authentication")
    },
    credentials: "include"
  }) */

  // const response = await request.json()

  // if (response.error) {
  //   res.redirect(307, req.headers.referer)
  //   return
  // }

  res.render("manage.ejs", response.data.user)
})


/* -------------------------------------------------------------------------- */
/*                              Server functions                              */
/* -------------------------------------------------------------------------- */

/* --------------------- Temporary global error handler --------------------- */

// Global uncaught exception handler
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1); // Optionally restart the process
});

// Global unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1); // Optionally restart the process
});

/* ---------------------------- Start the server ---------------------------- */

const server = app.listen(port, host, async () => { 
  console.log(`server started at http://localhost:${port}`)
  await connectDB() // Connect to MongoDB
  rl.prompt();
})

/* ----------------------- Allow for graceful shutdown ---------------------- */

// Graceful shutdown mechanism
const shutdownServer = async (reason) => {
  console.log('Stopping new file uploads...');
  
  acceptUploads.allow = false; // Stop accepting new requests
  acceptUploads.reason = reason; // Set the reason for the shutdown

  // Wait for ongoing uploads to complete
  while (uploadStreams.size > 0) {
    console.log(`Waiting for ${uploadStreams.size} ongoing uploads to finish...`);
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before checking again
  }

  console.log('All uploads completed. Shutting down server...');

  server.close(() => {
    console.log('Server shut down successfully.');
    process.exit(0); // Exit the process
  });
};

// Command input handling
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'COMMAND> '
});

// Listen for commands
rl.on('line', (line) => {
  const [command, reason] = line.trim().split(' ')
  if (command === 'shutdown') {
    shutdownServer(reason);
  } else {
    console.log(`Unknown command: ${line.trim()}`);
  }
  rl.prompt();
});