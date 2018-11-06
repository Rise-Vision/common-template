/* eslint-disable no-inline-comments */

RisePlayerConfiguration.Heartbeat = (() => {

  var MINUTES = 60000,
    HEARTBEAT_TIMEOUT = 4 * MINUTES, // https://github.com/Rise-Vision/common-display-module/blob/master/heartbeat.js
    _interval = null;

  function _startHeartbeatInterval() {
    reset();

    _interval = setInterval( _sendHeartbeat, HEARTBEAT_TIMEOUT );
  }

  function _sendHeartbeat() {
    // send heartbeat
  }

  function connectionHandler( event ) {
    if ( event.detail.isConnected ) {
      window.removeEventListener( "rise-local-messaging-connection", connectionHandler );

      const playerType = RisePlayerConfiguration.LocalMessaging.getPlayerType();

      // ChromeOS player has its own heartbeat mechanism
      playerType === "electron" && _startHeartbeatInterval();
    }
  }

  function reset() {
    clearTimeout( _interval );
  }

  const exposedFunctions = {
    connectionHandler: connectionHandler
  };

  if ( RisePlayerConfiguration.Helpers.isTestEnvironment()) {
    exposedFunctions.reset = reset;
  }

  return exposedFunctions;

})();

if ( !RisePlayerConfiguration.Helpers.isTestEnvironment()) {
  const handler = RisePlayerConfiguration.Heartbeat.connectionHandler;

  window.addEventListener( "rise-local-messaging-connection", handler );
}
