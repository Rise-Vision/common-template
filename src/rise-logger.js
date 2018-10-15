/* global TEMPLATE_COMMON_CONFIG */
/* eslint-disable no-console, one-var */

RisePlayerConfiguration.Logger = (() => {

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
  const THROTTLE_DELAY = 1000;

  let _commonEntryValues = null,
    _debug = false, // eslint-disable-line no-unused-vars,
    _lastEvent = "",
    _logToBq = true, // eslint-disable-line no-unused-vars
    _refreshDate = 0,
    _throttle = false,
    _token = "";

  function configure() {
    const playerInfo = RisePlayerConfiguration.getPlayerInfo();
    const rolloutStage = playerInfo.playerType;

    if ( playerInfo.playerType !== "beta" && playerInfo.playerType !== "stable" ) {
      _logToBq = false;
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
    if ( !displayId ) {
      throw new Error( "No display id was provided" );
    }
    if ( !companyId ) {
      throw new Error( "No company id was provided" );
    }

    _debug = typeof playerInfo.debug === "undefined" ? false : !!playerInfo.debug;
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
      }
    };
  }

  function reset() {
    _commonEntryValues = null;
    _debug = false;
    _lastEvent = "";
    _logToBq = true;
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
      return console.log( `No token, not sending: ${ insertText }` );
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

  const exposedFunctions = {
    configure: configure
  };

  if ( RisePlayerConfiguration.Helpers.isTestEnvironment()) {
    Object.assign( exposedFunctions, {
      getCommonEntryValues: () => _commonEntryValues,
      getInsertData: _getInsertData,
      isDebugEnabled: () => _debug,
      logsToBq: () => _logToBq,
      logToBigQuery: _logToBigQuery,
      reset: reset
    });
  }

  return exposedFunctions;

})();
