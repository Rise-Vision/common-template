/* eslint-disable no-console */

RisePlayerConfiguration.LocalMessaging = (() => {

  const DEFAULT_CLIENT_NAME = "ws-client",
    INITIAL_WEBSOCKET_CONNECTION_TIMEOUT = 20 * 1000;

  let _connected = false,
    _clientName,
    _connection,
    _connectionType,
    _playerType,
    _initialWebsocketConnectionTimer = null,
    _messageHandlers = [];

  function _addWebsocketConnectionHandlers() {
    _connection.on( "open", () => {
      clearTimeout( _initialWebsocketConnectionTimer );

      console.log( "local messaging connected" );

      _connected = true;
      _sendConnectionEvent();
    });

    _connection.on( "close", () => {
      console.log( "local messaging connection closed" );
    });

    _connection.on( "end", () => {
      console.log( "local messaging disconnected" );

      _connected = false;
      _sendConnectionEvent();
    });

    _connection.on( "error", ( error ) => {
      console.log( "local messaging error", error.message );
    });

    _connection.on( "data", ( data ) => {
      _messageHandlers.forEach(( action ) => {
        action( data );
      });
    });
  }

  function _broadcastWebsocketMessage( msg ) {
    _connection.write( Object.assign({}, { from: _clientName }, msg ));
  }

  function _broadcastWindowMessage( msg ) {
    top.postToPlayer( Object.assign({}, { from: _clientName }, msg ));
  }

  function _disconnectViewerConnection() {
    try {
      if ( top.RiseVision && top.RiseVision.Viewer && top.RiseVision.Viewer.LocalMessaging ) {
        top.RiseVision.Viewer.LocalMessaging.disconnect();
      }
    } catch ( err ) {
      console.log( "window.top reference error", err );
    }
  }

  function _isWindowConnectionAvailable() {
    // Need to reference window.top to account for running in a Rise Player that is still using Viewer
    try {
      if ( top.postToPlayer && typeof top.postToPlayer === "function" && top.receiveFromPlayer && typeof top.receiveFromPlayer === "function" ) {
        return true;
      }
    } catch ( err ) {
      console.log( "window.top reference error", err );
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
    }

    return false;
  }

  function _initWebsocketConnection( detail ) {
    // TODO: dynamically load the primus client side library

    if ( !_isWebsocketConnectionAvailable()) {
      console.log( "primus client side library was not loaded" );
      return;
    }

    if ( !detail || !detail.serverUrl ) {
      console.log( "websocket server url not provided" );
      return;
    }

    const { serverUrl } = detail;

    // Account for a connection already made in Viewer, disconnect it
    _disconnectViewerConnection();

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

  function _initWindowConnection() {
    _connected = _isWindowConnectionAvailable();
    _sendConnectionEvent();
  }

  function _receiveWebsocketMessages( handler ) {
    _messageHandlers.push(( data ) => {
      handler( data );
    });
  }

  function _receiveWindowMessages( handler ) {
    top.receiveFromPlayer( "local-messaging", handler );
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
    window.dispatchEvent( new CustomEvent( "rise-local-messaging-connection", { detail: { isConnected: _connected } }));
  }

  function _validatePlayer( name ) {
    const players = [ "electron", "chromeos" ];

    if ( !name || typeof name !== "string" ) {
      return false;
    }

    return players.indexOf( name ) !== -1;
  }

  function broadcastMessage( message ) {
    if ( !message || !_connected ) {
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
      return;
    }

    if ( !_validatePlayer( player )) {
      console.log( "player not supported", player );
      return;
    }

    if ( !connectionType || typeof connectionType !== "string" ) {
      console.log( "connection type not provided" );
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
    return _connected;
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
