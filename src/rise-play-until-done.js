/* eslint-disable one-var */
/* eslint-disable no-console */

RisePlayerConfiguration.PlayUntilDone = (() => {

  const LOGGER_DATA = {
    name: "RisePlayerConfiguration",
    id: "PlayUntilDone",
    version: "N/A"
  };

  const SAFE_GUARD_INTERVAL = 60000,
    MAX_SAFE_GUARD_ATTEMPTS = 4,
    doneElements = [],
    respondingElements = new Set();
  let safeGuardAttempts = 0;

  function reset() {
    doneElements.splice( 0, doneElements.length );
    respondingElements.clear();
    safeGuardAttempts = 0;
  }

  function start() {
    const riseElements = RisePlayerConfiguration.Helpers.getRiseElements(),
      playUntilDoneElements = riseElements.filter( element => element.hasAttribute( "play-until-done" ));

    console.log( `Start listening PUD events of ${playUntilDoneElements.length} elements` );
    RisePlayerConfiguration.Logger.info( LOGGER_DATA, "start listening PUD events", { playUntilDoneElements: playUntilDoneElements.length });

    playUntilDoneElements.forEach( element => {
      element.addEventListener( "report-done", event => {
        respondingElements.add( element );

        if ( event.detail && event.detail.done && doneElements.indexOf( element ) < 0 ) {
          doneElements.push( element );
        }

        if ( doneElements.length === playUntilDoneElements.length ) {
          reportDone();
        }
      });
    });

    function safeGuardCheck() {
      safeGuardAttempts += 1;
      const playingElements = playUntilDoneElements.filter( el => doneElements.indexOf( el ) < 0 );
      const notRespondingElements = playingElements.filter( el => !respondingElements.has( el ));

      if ( notRespondingElements.length > 0 && safeGuardAttempts > MAX_SAFE_GUARD_ATTEMPTS ) {
        console.log( `Force done event because there is ${notRespondingElements.length} not responding elements` );
        RisePlayerConfiguration.Logger.info( LOGGER_DATA, "force template-done event", { notRespondingElements: notRespondingElements.length });
        reportDone();
      } else {
        playingElements.forEach( el => el.dispatchEvent( new Event( "check-done" )));
      }
    }

    setInterval( safeGuardCheck, SAFE_GUARD_INTERVAL );
  }

  function reportDone() {
    reset();

    if ( !RisePlayerConfiguration.LocalMessaging.isConnected()) {
      console.log( "Not connected to Local Messaging, cannot report done" );

      return;
    }

    RisePlayerConfiguration.Logger.info( LOGGER_DATA, "sending template-done event" );

    RisePlayerConfiguration.Helpers.onceClientsAreAvailable( "local-messaging", () => {
      RisePlayerConfiguration.LocalMessaging.broadcastMessage({
        topic: "template-done"
      });
    });

  }

  const exposedFunctions = {
    reportDone,
    start
  };

  return exposedFunctions;

})();
