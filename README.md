# common-template [![CircleCI](https://circleci.com/gh/Rise-Vision/common-template/tree/master.svg?style=svg)](https://circleci.com/gh/Rise-Vision/workflows/common-template/tree/master) [![Coverage Status](https://coveralls.io/repos/github/Rise-Vision/common-template/badge.svg?branch=master)](https://coveralls.io/github/Rise-Vision/common-template?branch=master)
Common scripts for Rise Templates

## Build

```
npm install -g gulp
npm install
gulp build
```

Output scripts will be placed in dist/ directory

## Test

`
gulp test
`

## Errors and Warnings

common-template can directly send the following errors and warnings to the [common application events table](https://help.risevision.com/hc/en-us/articles/360020076252-Structure-of-Client-Side-Applications-Table) on BQ.

### Logger BQ entries

The following BQ entries are sent as source *RisePlayerConfiguration* and component id *Logger*:

- SEVERE **invalid component data**: A rise component requested logging but sent an invalid component data structure. The component data structure must be corrected.

- SEVERE **invalid additional fields value**: Additional values were sent for logging, but the value was not an object reference. Either *undefined* or a valid object value must be sent.

### PUD BQ entries

The following BQ entries are sent as source *RisePlayerConfiguration* and component id *Watch*:

- ERROR **not connected to Local Messaging, cannot send PUD template-done event**

### Watch BQ entries

The following BQ entries are sent as source *RisePlayerConfiguration* and component id *PlayUntilDone*:

- ERROR **no presentation id**: A presentation id was not provided to the template page. So attribute data file watch request cannot be sent.

- ERROR **data file RLS error**: A local storage error occurred when waiting file update for a data file. The detail will contain the message sent by local storage module.

- ERROR **file-insufficient-disk-space-error**: A local storage error occurred when waiting file update for a data file, and it was because there was insufficient disk space for the file in the local disk.

- ERROR **data file read error**: An error occurred when the file URL for a file was read, or when its content was parsed as JSON. The detail will contain more specific information about the root cause.

- ERROR **write component property error**: A property could not be set. The detail contains the error stack, the component id and property, and the value that couldn't be set.

- WARNING **component not found for id in attribute data**: A component was customized in an attribute data file, but could not be found in the template page. The id of the component is sent as detail.

## Events

RisePlayerConfiguration sends the following events:

- **rise-components-ready**: Sent once to the window object when Local Messaging connection has been accomplished for the first time, and instructs all components in the page that they can begin doing requests like watch, licensing and logging. Preview mode also sends this event even if there is no Local Messaging connection, so components can start working in this environment.
- **rise-local-messaging-connection**: Sent to the window object when Local Messaging connection status has changed. It provides an argument with a nested property *detail.isConnected* that indicates if connection to Local Messaging was successful or not. This event may be sent multiple times depending on the status of the connection.
- **rise-presentation-play**: Sent to the window object and each Rise Vision HTML component when running on Viewer and presentation starts. It is useful to start animations, timers and reset the state of the template.
- **rise-presentation-stop**: Sent to the window object and each Rise Vision HTML component when running on Viewer and presentation stops. It determines that the template is no longer showing and can be used to stop timers, animations or other behavior that is not desired when the presentation is not playing.

### Template Uptime
RisePlayerConfiguration.ContentUptime reports Template Uptime errors in case of any of the following conditions:

 - When one or more Components are not responding to uptime requests;
 - When one or more Components are reporting uptime error;
 - When RisePlayerConfiguration.ContentUptime.setUptimeError() is set to true by the Template designer;
