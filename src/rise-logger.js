/* global TEMPLATE_COMMON_CONFIG */
/* eslint-disable no-console, one-var */

RisePlayerConfiguration.Logger = (() => {

  const LOGGED_ENTRIES_STORAGE_KEY = "RISE_VISION_LOGGED_ENTRIES";

  const GOOGLE_APIS_BASE = "https://www.googleapis.com";
  const REFRESH_URL = GOOGLE_APIS_BASE + "/oauth2/v3/token" +
    "?client_id=" + TEMPLATE_COMMON_CONFIG.LOGGER_CLIENT_ID +
    "&client_secret=" + TEMPLATE_COMMON_CONFIG.LOGGER_CLIENT_SECRET +
    "&refresh_token=" + TEMPLATE_COMMON_CONFIG.LOGGER_REFRESH_TOKEN +
    "&grant_type=refresh_token";
  const SERVICE_URL = GOOGLE_APIS_BASE + "/bigquery/v2" +
    "/projects/" + TEMPLATE_COMMON_CONFIG.LOGGER_PROJECT +
    "/datasets/" + TEMPLATE_COMMON_CONFIG.LOGGER_DATASET +
    "/tables/" + TEMPLATE_COMMON_CONFIG.LOGGER_TABLE +
    "/insertAll";

  const BASE_INSERT_SCHEMA = {
    kind: "bigquery#tableDataInsertAllRequest",
    skipInvalidRows: false,
    ignoreUnknownValues: false,
    rows: [ { insertId: "" } ]
  };
  const LOGGER_COMPONENT_DATA = {
    name: "RisePlayerConfiguration",
    id: "Logger",
    version: "N/A"
  };
  const THROTTLE_DELAY = 1000;

  let _bigQueryLoggingEnabled = true,
    _commonEntryValues = null,
    _debugEnabled = false,
    _lastEvent = "",
    _refreshDate = 0,
    _throttle = false,
    _token = "";

  function configure() {
    const playerInfo = RisePlayerConfiguration.getPlayerInfo();
    const rolloutStage = playerInfo && playerInfo.playerType;

    if ( RisePlayerConfiguration.isPreview() ||
      ( rolloutStage !== "beta" && rolloutStage !== "stable" )) {
      _bigQueryLoggingEnabled = false;
      return;
    }

    const displayId = RisePlayerConfiguration.getDisplayId();
    const companyId = RisePlayerConfiguration.getCompanyId();
    const playerIp = playerInfo.ip || null;
    const playerVersion = playerInfo.playerVersion;
    const playerOs = playerInfo.os;
    const chromeVersion = RisePlayerConfiguration.getChromeVersion();

    if ( !playerVersion ) {
      throw new Error( "No player version was provided" );
    }
    if ( !playerOs ) {
      throw new Error( "No operating system was provided" );
    }
    if ( !companyId ) {
      throw new Error( "No company id was provided" );
    }

    _debugEnabled = typeof playerInfo.debug === "undefined" ? false : !!playerInfo.debug;
    _commonEntryValues = {
      "platform": "content",
      "display_id": displayId,
      "company_id": companyId,
      "rollout_stage": rolloutStage,
      "player": {
        "ip": playerIp,
        "version": playerVersion,
        "os": playerOs,
        "chrome_version": chromeVersion
      },
      "template": _getTemplateData()
    };
  }

  function reset() {
    _commonEntryValues = null;
    _debugEnabled = false;
    _lastEvent = "";
    _bigQueryLoggingEnabled = true;
    _refreshDate = 0;
    _throttle = false;
    _token = "";
  }

  function _copyOf( data ) {
    return JSON.parse( JSON.stringify( data ));
  }

  function _getInsertData( params ) {
    const data = _copyOf( BASE_INSERT_SCHEMA );
    const insertId = Math.random().toString( 36 ).substr( 2 ).toUpperCase();

    data.rows[ 0 ].insertId = insertId;
    data.rows[ 0 ].json = _copyOf( params );

    return data;
  }

  function _isThrottled( event ) {
    return _throttle && ( _lastEvent === event );
  }

  function _refreshToken( callback ) {
    var xhr = new XMLHttpRequest();

    if ( new Date() - _refreshDate < 3580000 ) {
      return callback({});
    }

    xhr.open( "POST", REFRESH_URL, true );
    xhr.onloadend = function() {
      let response = {};

      try {
        response = JSON.parse( xhr.response );
      } catch ( e ) {
        console.warn( "Can't refresh logger token - ", e.message );
      }

      callback({ token: response.access_token, refreshedAt: new Date() });
    };

    xhr.send();
  }

  function _insertWithToken( refreshData, params ) {
    const xhr = new XMLHttpRequest();

    _refreshDate = refreshData.refreshedAt || _refreshDate;
    _token = refreshData.token || _token;

    const insertData = _getInsertData( params );
    const insertText = JSON.stringify( insertData );

    if ( !_token ) {
      console.log( `No token, not sending: ${ insertText }` );

      RisePlayerConfiguration.Viewer.sendEndpointLog({
        severity: "DEBUG",
        eventDetails: `No token, not sending: ${ insertText }`
      });

      return;
    }

    // Insert the data.
    xhr.open( "POST", SERVICE_URL, true );
    xhr.setRequestHeader( "Content-Type", "application/json" );
    xhr.setRequestHeader( "Authorization", `Bearer ${ _token }` );

    if ( params.cb && typeof params.cb === "function" ) {
      xhr.onloadend = () => params.cb( xhr.response );
    }

    xhr.send( insertText );
  }

  function _logToBigQuery( params ) {
    if ( !params || !params.event || _isThrottled( params.event )) {
      return;
    }

    _throttle = true;
    _lastEvent = params.event;

    setTimeout(() => {
      _throttle = false;
    }, THROTTLE_DELAY );

    return _refreshToken( refreshData => _insertWithToken( refreshData, params ));
  }

  function _createLogEntryFor( componentData, params ) {
    const entry = _copyOf( params );

    if ( entry.hasOwnProperty( "event_details" ) && entry.event_details !== null && typeof entry.event_details !== "string" ) {
      entry.event_details = JSON.stringify( entry.event_details );
    }

    // Since Logger is configured prior to LocalMessaging, player type is not available when common entry values are initially defined
    if ( _commonEntryValues && _commonEntryValues.player && !_commonEntryValues.player.type ) {
      _commonEntryValues.player.type = RisePlayerConfiguration.LocalMessaging.getPlayerType() || "";
    }

    return Object.assign( entry, {
      "ts": new Date().toISOString(),
      "source": componentData.name,
      "version": componentData.version,
      "component": {
        "id": componentData.id
      }
    }, _commonEntryValues );
  }

  function _log( componentData, params ) {
    if ( !componentData || !componentData.name || !componentData.id || !componentData.version ) {
      return severe( LOGGER_COMPONENT_DATA, "invalid component data", {
        componentData: componentData,
        params: params
      });
    }
    if ( !params || !params.event || !params.level ) {
      return severe( componentData, "incomplete log parameters", params );
    }

    if ( !_debugEnabled && params.level === "debug" ) {
      return;
    }

    const entry = _createLogEntryFor( componentData, params );

    if ( !_bigQueryLoggingEnabled && params.level !== "info" ) {
      console.log( JSON.stringify( entry ));

      RisePlayerConfiguration.Viewer.sendEndpointLog({
        severity: "DEBUG",
        eventDetails: JSON.stringify( entry )
      });

      return;
    }

    _logToBigQuery( entry );
  }

  function _logWithLevel( level, componentData, event, eventDetails, additionalFields ) {
    const templateData = _getTemplateData();

    if ( typeof additionalFields !== "undefined" && typeof additionalFields !== "object" ) {
      return severe( LOGGER_COMPONENT_DATA, "invalid additional fields value", {
        componentData: componentData,
        level: level,
        event: event,
        eventDetails: eventDetails,
        additionalFields: additionalFields
      });
    }

    // Some templates are logging errors as components. componentData.name
    // contains the template name.
    const isTemplateLog = componentData.name === templateData.name ||
      !componentData.name || componentData.name === "RisePlayerConfiguration";
    const eventApp = isTemplateLog ?
      `HTML Template: ${templateData.name}` :
      componentData.name;

    RisePlayerConfiguration.Viewer.sendEndpointLog({
      severity: level,
      eventErrorCode: ( eventDetails && eventDetails.errorCode ) || ( level === "error" ? "X" : null ),
      eventApp,
      componentId: componentData.id || null,
      eventAppVersion: isTemplateLog ? templateData.version : componentData.version,
      eventDetails: JSON.stringify({ event, eventDetails }),
      debugInfo: JSON.stringify( Object.assign({}, additionalFields, { template: templateData }))
    });

    if ( _shouldNotLog( componentData, event, additionalFields )) {
      return;
    }

    const params = _getLogParams( level, event, eventDetails, additionalFields );

    _log( componentData, params );
  }

  function _shouldNotLog( componentData, event, additionalFields ) {
    if ( !additionalFields || !additionalFields._logAtMostOncePerDay ) {
      return false;
    }

    try {
      const entries = _loadLoggedEntries();
      const entryKey = _entryKeyFor( componentData, event );
      const alreadyLogged = entries.alreadyLogged.indexOf( entryKey ) >= 0;

      if ( !alreadyLogged ) {
        entries.alreadyLogged.push( entryKey );

        _saveLoggedEntries( entries );
      }

      return alreadyLogged;
    } catch ( error ) {
      console.error( error );

      return false;
    }
  }

  function _loadLoggedEntries() {
    const value = window.sessionStorage.getItem( LOGGED_ENTRIES_STORAGE_KEY );
    const data = value ? JSON.parse( value ) : {};
    const currentDate = _currentDate();

    if ( !data.date || data.date !== currentDate ) {
      data.date = currentDate;
      data.alreadyLogged = [];

      _saveLoggedEntries( data );
    }

    return data;
  }

  function _saveLoggedEntries( entries ) {
    const text = JSON.stringify( entries );

    window.sessionStorage.setItem( LOGGED_ENTRIES_STORAGE_KEY, text );
  }

  function _entryKeyFor( componentData, event ) {
    return `${
      RisePlayerConfiguration.getPresentationId()
    }:${
      RisePlayerConfiguration.getTemplateVersion()
    }:${
      componentData.id
    }:${
      event
    }`;
  }

  function _currentDate() {
    const today = new Date();

    return `${
      today.getFullYear()
    }-${
      today.getMonth() + 1
    }-${
      today.getDate()
    }`;
  }

  function _getTemplateData() {
    return {
      "product_code": RisePlayerConfiguration.getTemplateProductCode(),
      "version": RisePlayerConfiguration.getTemplateVersion(),
      "name": RisePlayerConfiguration.getTemplateName(),
      "presentation_id": RisePlayerConfiguration.getPresentationId()
    }
  }

  function _getLogParams( level, event, eventDetails, additionalFields ) {
    const details = eventDetails ? ( typeof eventDetails !== "object" ? { details: eventDetails } : eventDetails ) : {},
      additional = additionalFields ? ( typeof additionalFields !== "object" ? { debugInfo: additionalFields } : additionalFields ) : {},
      debugDetails = Object.keys( additional )
        .filter( key => key && key.charAt( 0 ) != "_" && key !== "storage" )
        .reduce(( struct, field ) => {
          struct[ field ] = additional[ field ];
          return struct;
        }, {}),
      detailsCombined = Object.assign({}, details, debugDetails );

    return {
      "level": level,
      "event": event,
      "event_details": Object.keys( detailsCombined ).length === 0 ? "" : detailsCombined,
      "storage": additionalFields && additionalFields.storage || null
    };
  }

  function severe( componentData, event, eventDetails, additionalFields ) {
    _logWithLevel( "severe", componentData, event, eventDetails, additionalFields );
  }

  function error( componentData, event, eventDetails, additionalFields ) {
    _logWithLevel( "error", componentData, event, eventDetails, additionalFields );
  }

  function warning( componentData, event, eventDetails, additionalFields ) {
    _logWithLevel( "warning", componentData, event, eventDetails, additionalFields );
  }

  function info( componentData, event, eventDetails, additionalFields ) {
    _logWithLevel( "info", componentData, event, eventDetails, additionalFields );
  }

  function debug( componentData, event, eventDetails, additionalFields ) {
    _logWithLevel( "debug", componentData, event, eventDetails, additionalFields );
  }

  const exposedFunctions = {
    configure: configure,
    severe: severe,
    error: error,
    warning: warning,
    info: info,
    debug: debug
  };

  if ( RisePlayerConfiguration.Helpers.isTestEnvironment()) {
    Object.assign( exposedFunctions, {
      createLogEntryFor: _createLogEntryFor,
      currentDate: _currentDate,
      entryKeyFor: _entryKeyFor,
      getCommonEntryValues: () => _commonEntryValues,
      getInsertData: _getInsertData,
      isDebugEnabled: () => _debugEnabled,
      isBigQueryLoggingEnabled: () => _bigQueryLoggingEnabled,
      logToBigQuery: _logToBigQuery,
      log: _log,
      reset: reset
    });
  }

  return exposedFunctions;

})();
