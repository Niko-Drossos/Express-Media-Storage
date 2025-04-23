# Express Media Storage API Documentation

## Authentication

All API endpoints (except auth endpoints) require authentication via JWT token in the `media_authentication` cookie.

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
    "username": "string (unique)",
    "password": "string",
    "email": "string (unique)"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Successfully registered user",
    "data": {
        "JWT": "jwt_token"
    }
}
```

### POST /auth/login
Login to an existing account.

**Request Body:**
```json
{
    "username": "string",
    "password": "string"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Successfully logged in",
    "data": {
        "JWT": "jwt_token"
    }
}
```

## Media Management

### File Upload
Files are uploaded in chunks. First initialize the upload, then send chunks.

#### POST /file/start-chunk-upload
Initialize a file upload.

**Request Body:**
```json
{
    "metadata": {
        "title": "string",
        "description": "string",
        "date": "date",
        "privacy": "Public|Private|Unlisted",
        "fileName": "string",
        "tags": ["string"],
        "mediaType": "image|video|audio"
    }
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "ext": "file_extension",
        "fileId": "file_id"
    }
}
```

#### POST /file/chunked-upload
Upload a file chunk.

**Form Data:**
- chunk: File chunk
- chunkIndex: Number
- totalChunks: Number
- fileExt: String
- fileId: String

### Media Streaming

#### GET /stream/video/:fileId
Stream a video file.

**Query Parameters:**
- thumbnail: boolean (optional)

#### GET /stream/image/:fileId
Stream an image file.

**Query Parameters:**
- thumbnail: boolean (optional)

#### GET /stream/audio/:fileId
Stream an audio file.

## Search

### GET /search/uploads
Search for uploaded media.

**Query Parameters:**
- userId: string (optional)
- title: string (optional)
- startDate: date (optional)
- endDate: date (optional)
- tags: string (comma-separated, optional)
- ids: string (comma-separated, optional)
- mediaType: "any"|"image"|"video"|"audio" (optional)
- comments: boolean (optional)
- page: number (optional, default: 1)
- limit: number (optional, default: 12)

**Response:**
```json
{
    "success": true,
    "data": {
        "documents": {
            "start": number,
            "end": number,
            "count": number
        },
        "page": number,
        "pageCount": number,
        "limit": number,
        "query": object,
        "searchResults": array
    }
}
```

### GET /search/users
Search for users.

**Query Parameters:**
- username: string (optional)
- tags: string (comma-separated, optional)
- id: string (optional)
- comments: boolean (optional)
- page: number (optional, default: 1)
- limit: number (optional, default: 12)

## User Interactions

### POST /user/follow/:userId
Follow a user.

**Response:**
```json
{
    "success": true,
    "data": {
        "user": {
            "username": "string",
            "id": "string"
        },
        "followed": {
            "username": "string",
            "id": "string"
        }
    }
}
```

### POST /user/unfollow/:userId
Unfollow a user.

### POST /favorite/:mediaType/:mediaId
Favorite/unfavorite media.

**mediaType:** "image"|"video"|"audio"|"pool"

### POST /vote/:mediaType/:mediaId
Vote on media or comments.

**Request Body:**
```json
{
    "vote": "up"|"down"
}
```

## Transcription

### POST /transcription/generate/:mimetype/:documentId
Generate transcription for audio/video.

**mimetype:** "video"|"audio"

### GET /transcription/:transcriptionId
Get transcription details.

### GET /transcription/:transcriptionId/subtitles
Get transcription in VTT format for subtitles.

## Error Responses

All endpoints may return the following error responses:

**401 Unauthorized:**
```json
{
    "success": false,
    "message": "No token provided, please log in"
}
```

**403 Forbidden:**
```json
{
    "success": false,
    "message": "Failed to validate user",
    "errorMessage": "error message"
}
```

**500 Server Error:**
```json
{
    "success": false,
    "message": "Error message",
    "errorMessage": "Detailed error message"
}
```

# Middleware
This is a list of all the middlewares used in the server. <br>
- [authenticateUserJWT](#authenticateUserJWT)

## authenticateUserJWT
<p>This middleware is used to validate that a JWT token stored in the cookie <code>media_authentication</code> is valid.</p>
<p>all routes <b>besides</b> the auth routes use the <code>authenticateUserJWT</code> to verify login status.</p>
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

<!-- ---------------------------- Actual routes ---------------------------- -->
# Routes
<p>This is a comprehensive list of API routes that are on the backend server.</p>
<!-- TODO: Add a separate section that is just for the frontend routes -->
<p>Some routes will only be used on the frontend to render pages, this will be in a separate location. </p>

# Auth
Auth routes are used to create and login users, this is the only route that <b>DOESN'T</b> use the `authenticateUserJWT` middleware, as you don't have a JWT yet.
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
<p>To login to need to provide a <code>username</code> and <code>password</code>.  Then the <code>jwtToken</code> will contain your, <code>username</code>, <code>email</code>, and <code>doc_id</code> as the payload.</p>

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

# Pool
<p>This is the routes for interacting with pools created by users</p>

## GET: /pool/:poolId
<p><code>poolId</code> is the <code>doc id</code> of the pool you are fetching.</p>
<p><code>foundPool</code> is the MongoDB pool document.</p>
<p>This should never throw an error, if it does then somethings wrong.</p>

### RESPONSE
**Success:** `200`
```javascript
{
    success: true,
    message: "Successfully fetched pool",
    data: {
        pool: foundPool
    }
}
```

**Error:** `500`
```javascript
{
    success: false,
    message: "Failed to get pool",
    errorMessage: error.message,
    error
}
```

## POST: /pool/create
<p>This route is used for creating pools.</p>  
<p>A pool is just a collection of pre uploaded media that is grouped together as one event.</p>

```javascript
{
    title: String,
    description: String,
    privacy: enum("Public", "Private", "Unlisted"), 
    images: Array[doc._id], 
    videos: Array[doc._id], 
    audios: Array[doc._id],
    tags: Array[String]
}

```


### RESPONSE
**Success:** `201`
```javascript
{
    success: true,
    message: "Successfully created pool",
    data: {
        pool: createdPool
    }
}
```

**Error:** `500`
```javascript
{
    success: false,
    message: "Failed to create pool",
    errorMessage: error.message,
    error
}
```

## PUT: /pool/edit/:poolId
<p><code>poolId</code> is the <code>doc id</code> of the pool to be edited.</p>
<p>Because all of the <code>pool</code> routes are passed through the <code>authenticateUserJWT</code> you inherently need to be signed in.</p>
<p>Only the creator of a pool can edit it.</p>

```javascript
{
    title: String,
    description: String,
    privacy: enum("Public", "Private", "Unlisted"), 
    images: Array[doc._id], 
    videos: Array[doc._id], 
    audios: Array[doc._id],
    tags: Array[String]
}

```


### RESPONSE
**Success:** `200`
```javascript
{
    success: true,
    message: "Successfully edited pool",
    data: {
        newPool: updatedPool
    }
}
```

**Error:** `500`
```javascript
{
    success: false,
    message: "Failed to update pool",
    errorMessage: error.message,
    error
}
```

## DELETE: /pool/delete/:poolId
<p><code>poolId</code> is the <code>doc id</code> of the pool.</p>
<p>To delete a pool you need to be the original pooler.</p>
<p>It also returns back the deleted document.</p>

### RESPONSE
**Success:** `200`
```javascript
{
    success: true,
    message: "Successfully deleted pool",
    data: {
        deletedPool: deletedPool
    }
}
```

**Error:** `500`
```javascript
{
    success: false,
    message: "Failed to delete pool",
    errorMessage: error.message,
    error
}
```

# Comment
This is all the comment routes.  Comments can be placed on <code>pools</code>, <code>comments</code>, <code>users</code>, <code>videos</code>, <code>images</code>, and <code>audios</code>.
<p>There is a separate route for creating each different type of comment, for simplicity, im not writing all of them separately.</p>  
<p>Each of the routes are basically identical but they store the <code>originType</code> differently for each route depending on where the comment is going.</p>

## GET: /comment/:commentId
<p><code>commentId</code> is the <code>doc id</code> of the comment.  This routes only purpose is meant to populate the <code>comment</code> with any children <code>comments</code></p>

### RESPONSE
**Success:** `200`
```javascript
{
    success: true,
    message: "Fetched comments",
    data: {
        comments: comments
    }
}
```

**Error:** `500`
```javascript
{
    success: false,
    message: "Failed to fetch comments",
    errorMessage: error.message,
    error
}
```

## POST: /comment/create/:ORIGIN-TYPE/:ORIGIN-ID
<p>This is the route I was referring to earlier.</p>
<p>Each of the 6 create routes is the same except for the last word, Which is just name of the schema</p>
<p>For example, to create a comment on a pool you would write, <code>/comment/create/pool/mypoolId3824</code>.</p>
<p>To comment on a <code>comment</code> you would write, <code>comment/create/comment/myCommentId2479</code> ect.</p>
<p>Each of these routes differs because they each update the parent document with their own <code>doc id</code>, So they need different routes.</p>

```javascript
{
    content: String
}

```

### RESPONSE
**Success:** `200`
```javascript
{
    success: true,
    message: "Commented on ORIGIN-TYPE",
    data: {
        comment: pooledComment
    }
}
```

**Error:** `500`
```javascript
{
    success: false,
    message: "Failed to comment on ORIGIN-TYPE",
    errorMessage: error.message,
    error
}
```

## PUT: /comment/edit/:commentId
<p>This route doesn't need to change based on the location as it only needs to update the comment document.</p> 
<p>This updates the comment and sets the <code>edited</code> value on the comment to,</p>

```javascript
{
    isEdited: true,
    date: Date.now()
}
```
<p>There is no way to revert <code>isEdited</code> on a comment once its done.</p>

```javascript
{
    content: String
}

```

### RESPONSE
**Success:** `200`
```javascript
{
    success: true,
    message: "Updated comment",
    data: {
        comment: updatedComment
    }
}
```

**Error:** `500`
```javascript
{
    success: false,
    message: "Failed to update comment",
    errorMessage: error.message,
    error
}
```

## DELETE: /comment/delete/:commentId
<p>Only the owner of a comment can delete it.</p>
<p>Deleting a comment doesn't remove the document itself as that would mess with any other documents attached to it.</p>
<p>For this reason all comments are <i><b>soft deleted</b></i> meaning that all the text is replaced but the document itself is still alive.</p>
<p>These are the values replaced on the comment document after deletion, </p>

```javascript
    content: `[This comment was deleted on 5/6/2024, 10:29:37 PM]`,
    deleted: {
      isDeleted: true,
      date: Date.now()
    }
```

<p>The time values are of course the time that the comment was deleted.</p>
<p>It will only throw an error if the comment is not found or already deleted.</p>


### RESPONSE
**Success:** `200`
```javascript
{
    success: true,
    message: "Deleted comment",
    data: {
        comment: deletedComment
    }
}
```

**Error:** `500`
```javascript
{
    success: false,
    message: "Failed to delete comment",
    errorMessage: error.message,
    error
}
```

# Search
<p>These are the <code>search</code> routes used for making complex query's to the database.</p>
<p>Most of the input query's use url <code>query's</code> </p>

## GET: /search/users
<p>This will search all the users in the database.</p>

## Query's
- username: String

### RESPONSE
**Success:** `200`
```javascript
{
    success: true,
    message: "Successfully searched for users",
    data: {
      userCount: searchResults.length,
      query,
      searchResults
    }
}
```

**Error:** `500`
```javascript
{
    success: false,
    message: "Failed to search for users",
    errorMessage: error.message,
    error
}
```

## GET: /search/pools
<p>Searching for pools has a lot more versatility as there is more information to search.</p>


## Query's
- title: String (uses regex expression),
- user: Doc id of pooler, 
- tags: String with "," to separate tags, 
- startDate: Date with format "5-6-2024". returns pools <b>AFTER</b> this date, 
- endDate: Date with format "5-7-2024". returns pools <b>BEFORE</b> this date. Date is <b>inclusive</b>. 

### RESPONSE
**Success:** `200`
```javascript
{
    success: true,
    message: "Successfully searched for pools",
    data: {
      poolCount: searchResults.length,
      query,
      searchResults
    }
}
```

**Error:** `500`
```javascript
{
    success: false,
    message: "Failed to search for pools",
    errorMessage: error.message,
    error
}
```


## GET: /search/comments
<p>Im not sure when you really want to search for comments, but if you do you can use this.</p>

## Query's
- content: String (uses regex expression),
- user: Doc id of pooler, 
- originId: Doc id document that the comment was attached to, 
- startDate: Date with format "5-6-2024". returns pools <b>AFTER</b> this date, 
- endDate: Date with format "5-7-2024". returns pools <b>BEFORE</b> this date. Date is <b>inclusive</b>. 

### RESPONSE
**Success:** `200`
```javascript
{
    success: true,
    message: "Successfully searched for comments",
    data: {
      commentCount: searchResults.length,
      query,
      searchResults
    }
}
```

**Error:** `500`
```javascript
{
    success: false,
    message: "Failed to search for comments",
    errorMessage: error.message,
    error
}
```

## GET: /search/videos
<p>This route searches the list of videos in the <code>Videos</code> collection, not the <code>GridFs</code> bucket.</p>  

## Query's
- user: Doc id of the user,
- title: String (uses regex expression), 
- startDate: Date with format "5-6-2024". returns pools <b>AFTER</b> this date, 
- endDate: Date with format "5-7-2024". returns pools <b>BEFORE</b> this date. Date is <b>inclusive</b>. 

### RESPONSE
**Success:** `200`
```javascript
{
    success: true,
    message: "Successfully searched for videos",
    data: {
      videoCount: searchResults.length,
      query,
      searchResults
    }
}
```

**Error:** `500`
```javascript
{
    success: false,
    message: "Failed to search for videos",
    errorMessage: error.message,
    error
}
```

## GET: /search/images
<p>This route searches the list of images in the <code>Images</code> collection, not the <code>GridFs</code> bucket.</p> 

## Query's
- user: Doc id of the user,
- title: String (uses regex expression), 
- startDate: Date with format "5-6-2024". returns pools <b>AFTER</b> this date, 
- endDate: Date with format "5-7-2024". returns pools <b>BEFORE</b> this date. Date is <b>inclusive</b>. 

### RESPONSE
**Success:** `200`
```javascript
{
    success: true,
    message: "Successfully searched for images",
    data: {
      imageCount: searchResults.length,
      query,
      searchResults
    }
}
```

**Error:** `500`
```javascript
{
    success: false,
    message: "Failed to search for images",
    errorMessage: error.message,
    error
}
```

## GET: /search/images
<p>This route searches the list of audios in the <code>Audios</code> collection, not the <code>GridFs</code> bucket.</p> 

## Query's
- user: Doc id of the user,
- title: String (uses regex expression), 
- startDate: Date with format "5-6-2024". returns pools <b>AFTER</b> this date, 
- endDate: Date with format "5-7-2024". returns pools <b>BEFORE</b> this date. Date is <b>inclusive</b>. 

### RESPONSE
**Success:** `200`
```javascript
{
    success: true,
    message: "Successfully searched for audios",
    data: {
      audioCount: searchResults.length,
      query,
      searchResults
    }
}
```

**Error:** `500`
```javascript
{
    success: false,
    message: "Failed to search for audios",
    errorMessage: error.message,
    error
}
```

## Error Handling

All API endpoints follow a consistent error response format. Here are the possible error scenarios and their meanings:

### Authentication Errors (401)
These errors occur when there are issues with authentication.

```json
{
    "success": false,
    "message": "No token provided, please log in"
}
```
- **401 Unauthorized**: The request is missing the authentication token or the token is invalid
- **401 Token Expired**: The authentication token has expired, user needs to log in again

### Permission Errors (403)
These errors occur when a user tries to access something they don't have permission for.

```json
{
    "success": false,
    "message": "Access denied",
    "errorMessage": "Detailed error message"
}
```
- **403 Forbidden**: User doesn't have permission to access the resource
- **403 Private Content**: Trying to access private content without permission
- **403 Admin Only**: Attempting to perform an admin-only action
- **403 Not Owner**: Trying to modify content you don't own

### Not Found Errors (404)
These errors occur when the requested resource doesn't exist.

```json
{
    "success": false,
    "message": "Resource not found",
    "errorMessage": "Detailed error message"
}
```
- **404 User Not Found**: The requested user doesn't exist
- **404 Media Not Found**: The requested media file doesn't exist
- **404 Comment Not Found**: The requested comment doesn't exist
- **404 Transcription Not Found**: The requested transcription doesn't exist

### Validation Errors (400)
These errors occur when the request data is invalid.

```json
{
    "success": false,
    "message": "Invalid request",
    "errorMessage": "Detailed error message"
}
```
- **400 Invalid File Type**: Uploaded file type is not supported
- **400 File Too Large**: Uploaded file exceeds size limits
- **400 Invalid Date Format**: Date format in request is incorrect
- **400 Missing Required Fields**: Required fields are missing from the request
- **400 Invalid Privacy Setting**: Privacy setting is not one of: Public, Private, Unlisted
- **400 Already Favorited**: Trying to favorite content that's already favorited
- **400 Already Voted**: Trying to vote on content you've already voted on

### Server Errors (500)
These errors occur when something goes wrong on the server side.

```json
{
    "success": false,
    "message": "Server error",
    "errorMessage": "Detailed error message"
}
```
- **500 Database Error**: Error accessing or modifying the database
- **500 File System Error**: Error accessing or modifying files
- **500 Upload Error**: Error during file upload process
- **500 Transcription Error**: Error during transcription generation
- **500 Streaming Error**: Error during media streaming

### Rate Limiting (429)
These errors occur when too many requests are made in a short time.

```json
{
    "success": false,
    "message": "Too many requests",
    "errorMessage": "Please try again later"
}
```
- **429 Too Many Requests**: Rate limit exceeded, try again later

### Common Error Scenarios by Endpoint

#### Authentication Endpoints
- **/auth/register**
  - 400: Username or email already exists
  - 400: Password doesn't meet requirements
  - 400: Missing required fields
- **/auth/login**
  - 401: Invalid credentials
  - 400: Missing username or password

#### Media Management
- **/file/start-chunk-upload**
  - 400: Invalid file type
  - 400: File too large
  - 403: Uploads are currently disabled
  - 500: Error initializing upload
- **/file/chunked-upload**
  - 400: Invalid chunk data
  - 404: Upload session not found
  - 500: Error processing chunk

#### Search
- **/search/uploads**
  - 400: Invalid date format
  - 400: Invalid media type
  - 500: Search query failed

#### User Interactions
- **/user/follow/:userId**
  - 404: User not found
  - 400: Already following
- **/favorite/:mediaType/:mediaId**
  - 404: Media not found
  - 403: Private content
  - 400: Already favorited
- **/vote/:mediaType/:mediaId**
  - 404: Media not found
  - 403: Private content
  - 400: Already voted

#### Transcription
- **/transcription/generate/:mimetype/:documentId**
  - 404: Media not found
  - 400: Already transcribed
  - 500: Transcription generation failed
- **/transcription/:transcriptionId**
  - 404: Transcription not found
  - 500: Error retrieving transcription

### Error Response Format
All error responses follow this format:
```json
{
    "success": false,
    "message": "Human-readable error message",
    "errorMessage": "Detailed technical error message",
    "error": "Original error object (in development mode)"
}
```

### Best Practices for Error Handling
1. Always check the `success` field first
2. Use the `message` field to display user-friendly error messages
3. Use the `errorMessage` field for debugging
4. Implement proper retry logic for 429 and 500 errors
5. Handle authentication errors by redirecting to login
6. Validate all user input to prevent 400 errors
7. Implement proper error boundaries in your application




