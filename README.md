# common-template
Common scripts for Rise Templates

## Build

`
npm install -g gulp
npm install
gulp build
`

Output scripts will be placed in dist/ directory

## Test

`
gulp test
`

## Errors and Warnings

common-template can directly send the following errors and warnings to the [common application events table](https://help.risevision.com/hc/en-us/articles/360020076252-Structure-of-Client-Side-Applications-Table) on BQ.

### Logger

The following BQ entries are sent as source *Logger* and component id *Logger*:

- SEVERE **invalid component data**: A rise component requested logging but sent an invalid component data structure. The component data structure must be corrected.

- SEVERE **invalid additional fields value**: Additional values were sent for logging, but the value was not an object reference. Either *undefined* or a valid object value must be sent.

### Logger

The following BQ entries are sent as source *Watch* and component id *Watch*:

- ERROR **no presentation id**: A presentation id was not provided to the template page. So attribute data file watch request cannot be sent.

- ERROR **attribute data file RLS error**: A local storage error occurred when waiting file update for the attribute data file. The detail will contain the message sent by local storage module.

- ERROR **attribute data file read error**: An error occurred when the file URL for a file was read, or when its content was parsed as JSON. The detail will contain more specific information about the root cause.

- ERROR **write component property error**: A property could not be set. The detail contains the error stack, the component id and property, and the value that couldn't be set.

- WARNING **component not found for id in attribute data**: A component was customized in an attribute data file, but could not be found in the template page. The id of the component is sent as detail.
