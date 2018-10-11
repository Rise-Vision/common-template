/* eslint-disable no-console, one-var */

RisePlayerConfiguration.Logger = (() => {

  let commonEntryValues = null,
    debug = false, // eslint-disable-line no-unused-vars
    logToBq = true; // eslint-disable-line no-unused-vars

  function configure() {
    const playerInfo = RisePlayerConfiguration.getPlayerInfo();
    const rolloutStage = playerInfo.playerType;

    if ( playerInfo.playerType !== "beta" && playerInfo.playerType !== "stable" ) {
      logToBq = false;
      return;
    }

    const playerIp = playerInfo.ip || null;
    const playerVersion = playerInfo.version;
    const playerOs = playerInfo.os;
    const chromeVersion = playerInfo.chromeVersion || null;

    if ( !playerVersion ) {
      throw new Error( "No player version was provided" );
    }
    if ( !playerOs ) {
      throw new Error( "No operating system was provided" );
    }

    commonEntryValues = {
      "platform": "content",
      "display_id": "",
      "company_id": "",
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
    commonEntryValues = null;
    debug = false;
  }

  const exposedFunctions = {
    configure: configure
  };

  if ( RisePlayerConfiguration.Helpers.isTestEnvironment()) {
    exposedFunctions.getCommonEntryValues = () => commonEntryValues,
    exposedFunctions.logsToBq = () => logToBq,
    exposedFunctions.reset = reset;
  }

  return exposedFunctions;

})();
