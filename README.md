# Mailman

A CLI alternative of Postman for managing HTTP requests.

## Features

- JSON-based request files with `{{variable}}` interpolation
- Multiple environment support (dev, prod, etc.)
- Bearer token authentication via headers
- Interactive request selection

## Installation

```bash
yarn install
yarn build
yarn link
```

## Usage

### Initialize a project

```bash
mailman init
```

Creates `config.json` and sample request files in `requests/`.

### List available requests

```bash
mailman list
```

### View a request

```bash
mailman view requests/get-users.json
mailman view requests/get-users.json -e prod
```

### Run a request

```bash
mailman run requests/get-users.json
mailman run requests/get-users.json -e prod
mailman run  # prompts for selection
```

## Configuration

### config.json

```json
{
  "defaultEnvironment": "dev",
  "environments": {
    "dev": {
      "baseUrl": "http://localhost:3000",
      "apiKey": "dev-api-key"
    },
    "prod": {
      "baseUrl": "https://api.example.com",
      "apiKey": "prod-api-key"
    }
  }
}
```

### Request files

```json
{
  "name": "Get Users",
  "method": "GET",
  "url": "{{baseUrl}}/users",
  "headers": {
    "Authorization": "Bearer {{apiKey}}"
  },
  "body": null
}
```

Supported methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
