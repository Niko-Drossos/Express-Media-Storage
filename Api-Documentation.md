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
all routes besides the auth routes use the authenticateUserJWT to verify login status

# Auth
Auth routes are used to create and login users, this is the only route that DOESN'T use the `authenticateUserJWT` middleware
## POST: /auth/register
<p>The body must contain a <code>username</code>, <code>password</code> and <code>email</code> to register a user.  Email is not currently being used for user validation but in the future will be used for password resetting</p>

```javascript
{
    username: String,
    password: String,
    email: String
}
```

### RESPONSE
<p>There are 2 possible responses, <code>success</code> and <code>error</code>.</p>
<p>An error is only thrown when any of the required body values are missing or the password does not match the requirements.</p>

**Success:**
```javascript
{
    success: true,
    message: "Successfully registered user",
    data: {
      JWT: jwtToken
    } 
}
```
**Error:**
```javascript
{
    success: false,
    message: "Failed to register user",
    errorMessage: error.message,
    error
}
```

## POST: /auth/login
**Body:** 
```javascript
{
    username: String,
    password: String
}
```

### RESPONSE
**Success:**
```javascript
{
    success: true,
    message: "Successfully logged in",
    data: {
      JWT: jwtToken
    } 
}
```
**Error:**
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