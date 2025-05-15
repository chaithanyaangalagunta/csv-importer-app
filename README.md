# RLI Framework Schema Documentation

This document outlines the schema required by the RLI framework for building applications within its ecosystem.

## Main Schema Structure

The RLI framework expects an exported object with the following key components:

```javascript
module.exports = {
  widgets,                // Array of widget configurations
  serverActions,          // Array of server-side actions
  version,                // Version string of the app
  installationFields,     // Function returning installation configuration fields
  clientEvents,           // Path to client events file
  eventHandlers,          // Object defining event handler functions
  scheduledActions,       // Array of scheduled actions
  events,                 // Array of events the app subscribes to
};
```

## Core Components

### 1. Widgets

Widgets define UI components that can be displayed in various locations in the ecosystem.

```javascript
widgets: [
  {
    location: ["project_tab"],         // Array of locations where widget appears
    name: "Projects Tab Sample",       // Display name
    description: "Description text",   // Brief description
    icon: "widgets/public/icon.svg",   // Path to widget icon
    entrypoint: {                      // Entry point configuration
      html: "dist/index.html",         // Path to HTML file
    },
    identifier: "unique-widget-id",    // Unique identifier
    inputFields: () => { ... }         // Optional function returning configuration fields
  }
]
```

#### Widget Locations
Widgets can be placed in multiple locations:
- `project_tab`
- `customer_portal_widget`
- `accounts_tab`

### 2. Server Actions

Server actions define backend functionality that can be triggered through various means.

```javascript
serverActions: [
  {
    name: "actionName",                // Unique action name
    description: "Description text",   // Brief description
    run: functionReference,            // Function to execute
    inputFields: () => { ... },        // Optional function returning input fields
    triggers: ["CRON", "FE"],          // Optional trigger methods
    scope: ["PROJECTS", "TASKS"]       // Optional scopes where action is available
  }
]
```

#### Server Action Function Example

Here's an example of a server action function implementation:
```
javascript
const getMyIp = async (r, args) => {
  const { payload } = args;
  const type = payload?.type;
  const api = type === "v4" ? "api" : "api6";
  
  // Log the type parameter
  r.logger.log("Type is: ", type);

  // Make API request to get IP
  const response = await axios.get(`https://${api}.ipify.org?format=json`);
  return response.data;
};
```



### 3. Installation Fields

Defines fields shown during app installation process.

```javascript
installationFields: () => {
  return [
    {
      name: "fieldName",               // Field identifier
      label: "Display Label",          // User-friendly label
      type: "TEXT",                    // Field type
      required: true,                  // Whether field is required
      rerenderAllFields: false,        // Whether changing this field rerenders others
      defaultValue: "default",         // Optional default value
      hidden: false,                   // Whether field is hidden
      secure: false,                   // Whether field value should be secured
      metaData: { ... }                // Additional field metadata
    }
  ];
}
```

#### Supported Field Types
- `TEXT` - Text input field
- `NUMBER` - Numeric input field
- `BOOLEAN` - Boolean input field
- `DATE` - Date input field
- `DATE_TIME` - Date and time input field
- `SINGLE_SELECT` - Dropdown selection field
- `MULTI_SELECT` - Multiple selection dropdown field
- `AUTH_API_KEY` - Secure API key field
- `AUTH_BASIC` - Basic authentication field
- `AUTH_BEARER` - Bearer token authentication field

#### Metadata Examples
- Text fields: `{ textFieldMeta: { prefix: "Prefix", suffix: "Suffix" } }`
- Number fields: `{ range: { min: 0, max: 100 } }`
- Select fields: `{ options: [ { label: "Option Label", value: "option_value" } ] }` or `{ options: () => [ { label: "Option Label", value: "option_value" } ] }` or `{ options: async () => [ { label: "Option Label", value: "option_value" } ] }`

### 4. Event Handlers

Functions that respond to system events.

```javascript
eventHandlers: {
  onAppInstall: {
    run: async (r, args) => { ... }  // Function executed on app installation
  },
  onAppUninstall: {
    run: (r, args) => { ... }        // Function executed on app uninstallation
  },
  onCustomEvent: {
    run: async (r, args) => { ... }  // Function executed on custom events
  }
}
```

The first parameter `r` provides context and utilities, while `args` contains event-specific data.

### 5. Scheduled Actions

Tasks that run on a schedule.

```javascript
scheduledActions: [
  {
    name: "actionName",              // Unique action name
    run: async (r, args) => { ... }, // Function to execute
    interval: 43200,                 // Interval in seconds (12 hours in this example)
  }
]
```

### 6. Events

Events the app subscribes to from the ecosystem.

```javascript
events: [
  {
    eventName: "ticketCreated"       // Name of event to subscribe to
  }
]
```

### 7. Other Properties

- `version`: String specifying the app version
- `clientEvents`: Path to a JavaScript file that defines client-side events

## Utilities Available in Handlers

Based on the sample code, various utilities are available in handler contexts:

```javascript
// Available in event handlers and scheduled actions
r.scheduler.scheduleAppJobs({ ... })  // Schedule jobs
r.logger.log(message, data)           // Log information
```

This schema provides the foundation for building applications within the RLI ecosystem by defining UI components, server functionality, installation requirements, and event handling.
