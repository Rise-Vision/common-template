/* eslint-disable no-console */

RisePlayerConfiguration.LocalMessaging = (() => {

  const DEFAULT_CLIENT_NAME = "ws-client",
    INITIAL_WEBSOCKET_CONNECTION_TIMEOUT = 20 * 1000;

  let _connected = false,
    _clientName,
    _connection,
    _connectionType,
    _initialWindowConnectionTimer,
    _playerType,
    _initialWebsocketConnectionTimer = null,
    _messageHandlers = [],
    _useViewerWebsocketConnection = false;

  function _addWebsocketConnectionHandlers() {
    _connection.on( "open", () => {
      clearTimeout( _initialWebsocketConnectionTimer );

      console.log( "local messaging connected" );

      RisePlayerConfiguration.Viewer.sendEndpointLog({
        severity: "DEBUG",
        eventDetails: "local messaging connected"
      });

      _connected = true;
      _sendConnectionEvent();
    });

    _connection.on( "close", () => {
      console.log( "local messaging connection closed" );

      RisePlayerConfiguration.Viewer.sendEndpointLog({
        severity: "DEBUG",
        eventDetails: "local messaging connection closed"
      });
    });

    _connection.on( "end", () => {
      console.log( "local messaging disconnected" );

      RisePlayerConfiguration.Viewer.sendEndpointLog({
        severity: "DEBUG",
        eventDetails: "local messaging disconnected"
      });

      _connected = false;
      _sendConnectionEvent();
    });

    _connection.on( "error", ( error ) => {
      console.log( "local messaging error", error.message );

      RisePlayerConfiguration.Viewer.sendEndpointLog({
        severity: "DEBUG",
        eventDetails: `local messaging error ${error.message}`
      });
    });

    _connection.on( "data", ( data ) => {
      _messageHandlers.forEach(( action ) => {
        action( data );
      });
    });
  }

  function _broadcastWebsocketMessage( msg ) {
    if ( _useViewerWebsocketConnection ) {
      top.RiseVision.Viewer.LocalMessaging.write( msg );
      return;
    }

    _connection.write( Object.assign({}, { from: _clientName }, msg ));
  }

  function _broadcastWindowMessage( msg ) {
    top.postToPlayer( Object.assign({}, { from: _clientName }, msg ));
  }

  function _isWindowConnectionAvailable() {
    // Need to reference window.top to account for running in a Rise Player that is still using Viewer
    try {
      if ( top.postToPlayer && typeof top.postToPlayer === "function" && top.receiveFromPlayer && typeof top.receiveFromPlayer === "function" ) {
        return true;
      }
    } catch ( err ) {
      console.log( "window.top reference error", err );

      RisePlayerConfiguration.Viewer.sendEndpointLog({
        severity: "DEBUG",
        eventDetails: "window.top reference error",
        debugInfo: err && err.message
      });
    }

    return false;
  }

  function _isWebsocketConnectionAvailable() {
    // Need to reference window.top to account for running in a Rise Player that is still using Viewer
    try {
      if ( top.PrimusLMS ) {
        return true;
      }
    } catch ( err ) {
      console.log( "window.top reference error", err );

      RisePlayerConfiguration.Viewer.sendEndpointLog({
        severity: "DEBUG",
        eventDetails: "window.top reference error",
        debugInfo: err && err.message
      });
    }

    return false;
  }

  function _isWebsocketOpenByViewer() {
    try {
      if ( top.RiseVision && top.RiseVision.Viewer && top.RiseVision.Viewer.LocalMessaging ) {
        return true;
      }
    } catch ( err ) {
      console.log( "window.top reference error", err );

      RisePlayerConfiguration.Viewer.sendEndpointLog({
        severity: "DEBUG",
        eventDetails: "window.top reference error",
        debugInfo: err && err.message
      });
    }

    return false;
  }

  function _openWebsocketConnection( detail ) {
    const { serverUrl } = detail;

    _connection = top.PrimusLMS.connect( serverUrl, {
      reconnect: {
        max: 1800000,
        min: 2000,
        retries: Infinity
      },
      manual: true
    });

    _addWebsocketConnectionHandlers();

    _initialWebsocketConnectionTimer = setTimeout(() => {
      _sendConnectionEvent();
    }, INITIAL_WEBSOCKET_CONNECTION_TIMEOUT );

    _connection.open();
  }

  function _initWebsocketConnection( detail ) {
    // TODO: dynamically load the primus client side library

    if ( !_isWebsocketConnectionAvailable()) {
      console.log( "primus client side library was not loaded" );

      RisePlayerConfiguration.Viewer.sendEndpointLog({
        severity: "DEBUG",
        eventDetails: "primus client side library was not loaded"
      });

      return;
    }

    if ( !detail || !detail.serverUrl ) {
      console.log( "websocket server url not provided" );

      RisePlayerConfiguration.Viewer.sendEndpointLog({
        severity: "DEBUG",
        eventDetails: "websocket server url not provided"
      });

      return;
    }

    if ( _isWebsocketOpenByViewer()) {
      _useViewerWebsocketConnection = true;

      console.log( "local messaging connected via Viewer" );

      RisePlayerConfiguration.Viewer.sendEndpointLog({
        severity: "DEBUG",
        eventDetails: "local messaging connected via Viewer"
      });

      _sendConnectionEvent();
      return;
    }

    _openWebsocketConnection( detail );
  }

  function _initWindowConnection() {
    if ( _isWindowConnectionAvailable()) {
      _receiveWindowMessages( message => {
        if ( _connected ) {
          return;
        }

        _connected = message.topic.toUpperCase() === "CLIENT-LIST";
        _sendConnectionEvent();

        clearTimeout( _initialWindowConnectionTimer );
      });

      _broadcastWindowMessage({ topic: "client-list-request" });
    }
    _initialWindowConnectionTimer = setTimeout( _initWindowConnection, 100 );
  }

  function _receiveWebsocketMessages( handler ) {
    if ( _useViewerWebsocketConnection ) {
      top.RiseVision.Viewer.LocalMessaging.receiveMessages( handler );
      return;
    }

    _messageHandlers.push(( data ) => {
      data.topic && typeof data.topic === "string" && handler( data );
    });
  }

  function _receiveWindowMessages( handler ) {
    top.receiveFromPlayer( "local-messaging", data => {
      data.topic && typeof data.topic === "string" && handler( data );
    });
  }

  function _resetForAutomatedTests() {
    if ( !RisePlayerConfiguration.Helpers.isTestEnvironment()) {
      return;
    }

    clearTimeout( _initialWebsocketConnectionTimer );

    if ( _connection ) {
      _connection.end();
    }

    _clientName = undefined;
    _connected = false;
    _connection = undefined;
    _connectionType = undefined;
    _playerType = undefined;
    _messageHandlers = [];
  }

  function _sendConnectionEvent() {
    window.dispatchEvent( new CustomEvent( "rise-local-messaging-connection", { detail: { isConnected: isConnected() } }));
  }

  function _validatePlayer( name ) {
    const players = [ "electron", "chromeos" ];

    if ( !name || typeof name !== "string" ) {
      return false;
    }

    return players.indexOf( name ) !== -1;
  }

  function broadcastMessage( message ) {
    if ( !message || !isConnected()) {
      return;
    }

    const msg = typeof message === "string" ? { msg: message } : message;

    switch ( _connectionType ) {
    case "websocket":
      _broadcastWebsocketMessage( msg );
      break;
    case "window":
      _broadcastWindowMessage( msg );
      break;
    }
  }

  function configure( data ) {
    const { player, connectionType, detail = {} } = data;

    // automated testing purposes
    _resetForAutomatedTests();

    if ( _connectionType ) {
      console.log( "connection already configured" );

      RisePlayerConfiguration.Viewer.sendEndpointLog({
        severity: "DEBUG",
        eventDetails: "connection already configured"
      });

      return;
    }

    if ( !_validatePlayer( player )) {
      console.log( "player not supported", player );

      RisePlayerConfiguration.Viewer.sendEndpointLog({
        severity: "DEBUG",
        eventDetails: "player not supported"
      });

      return;
    }

    if ( !connectionType || typeof connectionType !== "string" ) {
      console.log( "connection type not provided" );

      RisePlayerConfiguration.Viewer.sendEndpointLog({
        severity: "DEBUG",
        eventDetails: "connection type not provided"
      });

      return;
    }

    let details = Object.assign({}, { clientName: DEFAULT_CLIENT_NAME }, detail );

    _clientName = details.clientName;
    _playerType = player;

    switch ( connectionType ) {
    case "websocket":
      _connectionType = "websocket";
      _initWebsocketConnection( detail );
      break;
    case "window":
      _connectionType = "window";
      _initWindowConnection();
      break;
    default:
      console.log( "connection type not supported", connectionType );

      RisePlayerConfiguration.Viewer.sendEndpointLog({
        severity: "DEBUG",
        eventDetails: `connection type ${connectionType} not supported`
      });

      break;
    }

  }

  // automated testing purposes
  function getConnectionType() {
    return _connectionType;
  }

  function getPlayerType() {
    return _playerType;
  }

  function isConnected() {
    return ( getConnectionType() === "websocket" && _useViewerWebsocketConnection ) ? top.RiseVision.Viewer.LocalMessaging.canConnect() : _connected;
  }

  function receiveMessages( handler ) {
    if ( !handler || typeof handler !== "function" ) {
      return;
    }

    switch ( _connectionType ) {
    case "websocket":
      _receiveWebsocketMessages( handler );
      break;
    case "window":
      _receiveWindowMessages( handler );
      break;
    }

  }

  return {
    broadcastMessage: broadcastMessage,
    configure: configure,
    isConnected: isConnected,
    getConnectionType: getConnectionType,
    getPlayerType: getPlayerType,
    receiveMessages: receiveMessages
  }

})();
