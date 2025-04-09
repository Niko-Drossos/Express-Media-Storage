const express = require('express')
const dotenv = require('dotenv')
const { connectDB } = require('./models/connection')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const expressLayouts = require('express-ejs-layouts')
const path = require('path')
/* ------------------------------- Middlewares ------------------------------- */
const userLoggedIn = require("./models/middleware/userLoggedIn")
const getCookies = require('./models/middleware/getCookies')
const logError = require('./models/middleware/logging/logError')
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
app.use("/stream", require("./routes/stream.routes"))
app.use("/vote", require("./routes/vote.routes"))
app.use("/daat", require("./routes/daat.routes"))
app.use("/favorite", require("./routes/favorite.routes"))
app.use("/suggest", require("./routes/suggest.routes"))
app.use("/transcription", require("./routes/transcription.routes"))
app.use("/manage", require("./routes/manage.routes"))
app.use("/system", require("./routes/system.routes"))
app.use("/role", require("./routes/role.routes"))

/* -------------------------------- Homepage -------------------------------- */

app.get("/", (req, res) => {
  res.locals.user = { 
    username: req.username,
    userId: req.userId,
    email: req.email
  }
  
  res.render("index.ejs")
})

/* ------------------------------ About us page ----------------------------- */

app.get("/about-us", async (req, res) => {
  res.locals.user = { 
    username: req.username,
    userId: req.userId,
    email: req.email
  }

  res.render("about-us.ejs")
})

/* ---------------------------- Instructions page --------------------------- */

app.get("/instructions", async (req, res) => {
  res.locals.user = { 
    username: req.username,
    userId: req.userId,
    email: req.email
  }
  
  res.render("instructions.ejs")
})

/* ------- Middleware to check if user is logged in and adds user data ------ */

// This is defined after the routes that are publicly accessible
// Everything below this middleware will check if the user is logged in
app.use(userLoggedIn, (req, res, next) => {
  if (req.path.startsWith("/auth")) {
    res.locals.user = { username: "Not Logged In", userId: "", email: "no-email@example.com" }
    return next(); // Skip setting res.locals.user for /auth
  } else if (req.userId === "") {
    return res.redirect(307, `/auth/login?redirect=${new URLSearchParams({ referer: req.headers.referer })}`)
  }
  
  // This will be available in all EJS templates
  res.locals.user = { 
    username: req.username,
    userId: req.userId,
    email: req.email
  }
  
  next()
})

/* ---------------------------- Login to an account ------------------------- */

app.get("/auth/login", (req, res) => {
  // Allow for a redirect url after login
  const redirectURL = req.query.redirect || "/"

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

app.get("/upload", async (req, res) => {
  res.render("upload.ejs")
})

/* -------------------------- Form to upload files -------------------------- */

app.get("/journal", async (req, res) => {
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

app.get("/create-pool", async (req, res) => {
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

app.get("/search-media", async (req, res) => {
  try {

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
        await logError(req, response.error)

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
          documents: {
            start: 0,
            end: 0,
            count: 0
          },
          page: 1,
          pageCount: 1,
          limit: 12,
          query: {},
          searchResults: []
        },
        searchResults: []
      })
    }
  } catch (error) {
   await logError(req, error)
   res.render("error.ejs", {
    status: 500,
    message: "Something went wrong",
    action: {
      name: "Home",
      url: "/"
    }
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

app.get("/search-pools", async (req, res) => {
  try {
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
        status: request.status,
        query,
        message: response.errorMessage,
        action: { 
          name: "Home",
          url: "/"
        }
      })
      return
    }

    res.render("search-pools.ejs", {
      query,
      response: response.data,
      searchResults: response.data.searchResults || []
    })
  } catch (error) {
    await logError(req, error)
    res.render("error.ejs", {
    status: 500,
    message: "Something went wrong",
    action: {
      name: "Home",
      url: "/"
    }
    })
  }
}) 

/* -------------------------------------------------------------------------- */
/*                               Viewing routes                               */
/* -------------------------------------------------------------------------- */

/* ---------------------- View a file with document id ---------------------- */

app.get("/media/:mediaType", async (req, res) => {
  try {
    const { mediaType } = req.params
    const { id } = req.query

    /* if (mediaType !== ("image" || "video" || "audio")) {
      const redirectUrl = req.headers.referer || `http://${req.headers.host}`
      res.redirect(307, redirectUrl)
      return
    } */

    const request = await fetch(`${API_URL}/search/${mediaType}s?ids=${id}&comments=true`, {
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
    await logError(req, error)
    res.render('error.ejs', { status: 500, message: "Something went wrong", action: { name: "Home", url: "/" } })
  }
})

/* ------------------------------- View a pool ------------------------------ */

app.get("/pools/:id", async (req, res) => {
  try {
    const { id } = req.params

    const request = await fetch(`${API_URL}/pool/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": getCookies(req, "media_authentication")
      },
      credentials: "include"
    })

    const response = await request.json()

    if (response.error) {
      res.render('error.ejs', { 
        status: request.status,
        message: response.errorMessage,
        action: {
          name: "Home",
          url: "/"
        }
      })
      console.log(response.error)
      return
    }

    res.render("pool.ejs", {
      pool: response.data.pool
    })
  } catch (error) {
    await logError(req, error)
    res.render('error.ejs', {
      status: 500,
      message: "Something went wrong",
      action: {
        name: "Home",
        url: "/"
      } 
    })
  }
})

/* ------------------------ Get the users own profile ----------------------- */

app.get("/profile", async (req, res) => {
  try {  
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
  } catch (error) {
    await logError(req, error)
    res.render('error.ejs', {
      status: 500,
      message: "Something went wrong",
      action: {
        name: "Home",
        url: "/"
      } 
    })
  }
})

/* -------------------- Get a profile with a specific id -------------------- */
app.get("/profile/:id", async (req, res) => {
  try {
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
  } catch (error) {
    await logError(req, error)
    res.render('error.ejs', {
      status: 500,
      message: "Something went wrong",
      action: {
        name: "Home",
        url: "/"
      } 
    })
  }
})

/* ---------------------------- Manage user media --------------------------- */
// TODO: Implement managing page
app.get("/manage?", async (req, res) => {
  try {

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
  } catch (error) {
    await logError(req, error)
    res.render('error.ejs', {
      status: 500,
      message: "Something went wrong",
      action: {
        name: "Home",
        url: "/"
      } 
    })
  }
})

/* ------- Catch every request that doesn't get handled by the router ------- */

app.use((req, res) => {
  res.status(404).render("error.ejs", {
    status: 404,
    title: "Page not found",
    message: "We're sorry we couldn't find the page you requested, please check the URL and try again.",
    action: {
      name: "Go back home",
      url: "/"
    }
  });
});

/* -------------------------------------------------------------------------- */
/*                              Server functions                              */
/* -------------------------------------------------------------------------- */

const Role = require('./models/schemas/Role')

async function ensureAdminRoleExists() {
  const existingAdmin = await Role.findOne({ name: 'Admin' })

  if (!existingAdmin) {
    await Role.create({
      name: 'Admin',
      description: 'Administrator role with full access'
    })
    console.log('Admin role created')
    console.log('Please manually add the "Admin" role document _id to the user you want to make an admin')
  }
}

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
  
  // Ensure the admin role exists in the database
  await ensureAdminRoleExists()
})