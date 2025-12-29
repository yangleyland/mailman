# Mailman

A CLI alternative to Postman for managing and executing HTTP requests from the terminal.

## Features

- JSON-based request files with `{{variable}}` interpolation
- Multiple environment support (dev, prod, etc.)
- Environment file support (`.env` and `.env.<environment>`)
- Runtime variable overrides via `-v` flag
- Interactive request selection and creation
- Request previewing before execution
- Bearer token authentication via headers
- Editor support for request body input

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

Preview the fully resolved request before execution:

```bash
mailman view requests/get-users.json
mailman view requests/get-users.json -e prod
```

### Run a request

```bash
mailman run requests/get-users.json
mailman run requests/get-users.json -e prod
mailman run requests/get-users.json -v id=my-id -v userId=123
mailman run  # interactive selection with option to create new request
```

Options:

- `-e, --environment <env>` - specify environment (uses defaultEnvironment if not set)
- `-v, --variable <key=value>` - override variables at runtime (can be used multiple times)

## Configuration

### config.json

```json
{
  "defaultEnvironment": "dev",
  "environments": {
    "dev": {
      "baseUrl": "http://localhost:3000"
    },
    "prod": {
      "baseUrl": "https://api.example.com"
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
    "Authorization": "Bearer {{API_KEY}}"
  },
  "defaultValues": {
    "limit": "10"
  },
  "body": null
}
```

Supported methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`

### Environment files

Create `.env` for shared variables or `.env.<environment>` for environment-specific variables:

```
API_KEY=my-secret-key
DEBUG=true
```

## Variable Resolution

Variables are resolved in the following order (highest priority first):

1. Runtime `-v` arguments
2. `.env.<environment>` file
3. `.env` file
4. Request `defaultValues`
5. Environment variables from `config.json`

Unfilled variables will prompt for input before execution.
