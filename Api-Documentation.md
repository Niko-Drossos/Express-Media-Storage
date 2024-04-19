# Routes

## Auth
### POST: /auth/register
BODY: 
```json
{
  username<String>,
  password<String>,
  email<String>
}
```

### POST: /auth/login
BODY: 
```json
{
  username<String>,
  password<String>
}
```

### RESPONSE
SUCCESS:
```json
{
    success: true,
    message: "Successfully logged in",
    data: {
      JWT: jwtToken
    } 
}
```
ERROR:
```json
{
    success: false,
    message: "Failed to login",
    errorMessage: error.message,
    error
}
```

## User
### POST: /user/create

BODY: 
```json
{
  username<String>
}
```

### RESPONSE
SUCCESS:
```json
{
  success: true,
  message: "Successfully created user folder!",
  data: {
    folder: absolute path to folder
  }
}
```
ERROR:
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
SUCCESS:
```json
{
  success: true,
  message: "Uploaded files to folder",
  data: {
    folder: absolute path to folder
  }
}
```
ERROR:
```json
{
  success: false,
  message: "Failed to fetch folder",
  errorMessage: error.message,
  error
}
```