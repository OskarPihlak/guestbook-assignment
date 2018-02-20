# Guestbook API

### Description
A guestbook API for creating, viewing, and deleting guest book entries.

### Setup
After downloading this project, run `npm install` to install dependencies.
Run `npm start` to start the API in watch mode (restart API on change)
Run `npm test` to start Jest in watch mode (for running the tests on save)

### Assumptions and requirements:
- The API should run on `http://localhost:3000`
- Endpoints are not blocked by authorization
- Endpoints do not validate payload
- The data from and to the API has to be in JSON
- All tests must pass in their original form
- All code must be written using ES6
- All timestampts must be in `ISO 8601` format

### API Response Namespace
All endpoints output data under a common `data` object.
Example for endpoint returning a single record
```json
{
    "data": {
        "id": "number",
        "first_name": "string",
        "last_name": "string",
        "message": "string",
        "created_at": "string"
    }
}
```
Example for endpoint returning multiple records
```json
{
    "data": [
        {
            "id": "number",
            "first_name": "string",
            "last_name": "string",
            "message": "string",
            "created_at": "string"
        }
    ]
}
```

### Data percistance
All data should be in-memory, but this is not required. `lokijs` was pre-packaged with this project for in-memory data storage, but it is not required that you use that.
When storing the guest book entries, **no record should be completely deleted from the dataset**, since in our actual system, that would cause data to get missing and break stuff. That's why the entry model has a field `deleted_at`. This field **should not be sent out from the API**, and should only be used to check whether or not a record has been _"deleted"_, and when said deletion occurred. A row with `deleted_at` being a non-`null` value represents a row that cannot be read from the API.

### Entry model
```
id:         The guest's unique integer ID
first_name: The guest's first name
last_name:  The guest's last name
message:    The message left by the guest
created_at: The record's creation time
deleted_at: The record's deletion time
```

### API Spec:

##### GET /guestbook
Lists all guest book entries.
##### Responses
`200 OK`
```json
{
    "data": [
        {
            "id": 1,
            "first_name": "John",
            "last_name": "Doe",
            "message": "Loved it here!",
            "created_at": "2018-02-20T13:32:19+00:00"
        },
        {
            "id": 2,
            "first_name": "Jane",
            "last_name": "Doe",
            "message": "It was amazing!",
            "created_at": "2018-02-20T13:32:19+00:00"
        }
    ]
}
```

##### GET /guestbook/:id
Get the single guestbook entry
Params:
```
id: The entry's unique ID
```
##### Respones
`200 OK`
```json
{
    "data": {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "message": "Loved it here!",
        "created_at": "2018-02-20T13:32:19+00:00"
    }
}
```
`404 Not Found`
```json
{
    "message": "Not Found"
}
```

##### POST /guestbook
Create a new entry
Request payload:
```json
{
    "first_name": "John",
    "last_name": "Doe",
    "message": "I loved it here!"
}
```
##### Responses
`201 Created`
```json
{
    "id": 1,
    "created_at": "2018-02-20T13:32:19+00:00"
}
```

##### DELETE /guestbook/:id
Delete the single guestbook entry
Params:
```
id: The entry's unique ID
```
##### Respones
`200 OK`
```json
{
    "data": {
        "id": 1,
        "deleted_at": "2018-02-20T13:32:19+00:00"
    }
}
```
`404 Not Found`
```json
{
    "message": "Not Found"
}
```

### Submitting
After completing this assignment, push it to a Git repository (eg. GitHub) and
send a link to the repository to `ragnar.laud@hotmail.com`.
