# Routes
auth
/login   (Both return the JWT, both POST)
/register

view
(all routes return a populated document to be rendered , all GET requests)
/post/:postId
/comment/:commentId
/video/:videoId
/image/:imageId
/audio/:audioId
(Maybe use users in view, probably in the user routes though)
/user/:userId

user
(Im not sure what im going to add yet)

file
GET
/get/:username      (Gets and returns the folder data)
/get/:username/:date
POST
/upload/folder/:username/:date  (Uploads a group of files)

post
POST
/create

PUT
/edit/:postId

DELETE
/delete/:postId

comment
POST
/create/post/:postId
/create/user/:userId
/create/comment/:commentId
/create/video/:videoId
/create/image/:imageId
/create/audio/:audioId

search
GET
/posts query's: tags, posterId, startDate, endDate

(not added yet)
/videos
/images
/audios

vote (future plan)



# Middleware
This is a list of all the middlewares used in the server. <br>
[authenticateUserJWT](#authenticateUserJWT)
## authenticateUserJWT
<p>This middleware is used to validate that a JWT token send the the header <code>authorization</code> is valid.</p>
<p>all routes besides the auth routes use the <code>authenticateUserJWT</code> to verify login status.</p>
<p>The <code>authenticateUserJWT</code> middleware only returns error responses if there are problems with JWT, like <code>expired</code>, <code>invalid</code> or <code>not provided</code></p>

**returns** <br>
`req.userId`: document _id of user <br>
`req.username`: username <br>
`req.email`: email

**Error** `401`
```javascript
{
  success: false,
  message: "No token provided, please log in",
}
```

**Error** `403`
```javascript
{
  success: false,
  message: "Failed to validate user",
  errorMessage: error.message,
  error
}
```
<!-- ! HOLD OFF ON THIS ONE, MIGHT BE DUMB -->
## createPathWithUsername
<p>This middleware is used to create the absolute path of a folder using someones <code>username</code>.</p>

# Auth
Auth routes are used to create and login users, this is the only route that <b>DOESN'T</b> use the `authenticateUserJWT` middleware
## POST: /auth/register
<p>The body must contain a <code>username</code>, <code>password</code> and <code>email</code> to register a user.  Email is not currently being used for user validation but in the future will be used for password resetting.</p>

```javascript
{
    username: String unique,
    password: String,
    email: String unique
}
```

### RESPONSE
<p>There are 2 possible responses, <code>success</code> and <code>error</code>.</p>
<p>An error is only thrown when any of the required body values are missing or the password does not match the requirements.</p>

**Success:** `201`
```javascript
{
    success: true,
    message: "Successfully registered user",
    data: {
      JWT: jwtToken
    } 
}
```
**Error:** `500`
```javascript
{
    success: false,
    message: "Failed to register user",
    errorMessage: error.message,
    error
}
```

## POST: /auth/login
<p>To login to need to provide a <code>username</code> and <code>password</code>.  Then the <code>jwtToken</code> will contain your, <code>username</code>, <code>email</code>, and <code>doc_id</code>.</p>

```javascript
{
    username: String,
    password: String
}
```

### RESPONSE
**Success:** `200`
```javascript
{
    success: true,
    message: "Successfully logged in",
    data: {
      JWT: jwtToken
    } 
}
```
**Error:** `500`
```javascript
{
    success: false,
    message: "Failed to login",
    errorMessage: error.message,
    error
}
```
<!-- 
## User
### POST: /user/create

BODY: 
```javascript
{
  username<String>
}
```

### RESPONSE
**Success:**
```json
{
  success: true,
  message: "Successfully created user folder!",
  data: {
    folder: absolute path to folder
  }
}
```
**Error:**
```json
{
  success: false,
  message: "Failed to create user folder",
  errorMessage: error.message,
  error
}
```

### POST: /:folder


### POST: /:folder/upload/:date
PARAMS:
```
folder - username
date - current day in MM-DD-YYYY format
```

### RESPONSE
**Success:**
```json
{
  success: true,
  message: "Uploaded files to folder",
  data: {
    folder: absolute path to folder
  }
}
```
**Error:**
```json
{
  success: false,
  message: "Failed to fetch folder",
  errorMessage: error.message,
  error
}
``` -->