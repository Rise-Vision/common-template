/* eslint-disable no-console, one-var */

RisePlayerConfiguration.PlayUntilDone = (() => {

  const LOGGER_DATA = {
    name: "RisePlayerConfiguration",
    id: "PlayUntilDone",
    version: "N/A"
  };

  const LOG_INTERVAL = 60000;
  const doneElements = [];

  function _reset() {
    doneElements.splice( 0 );
  }

  function start() {
    const riseElements = RisePlayerConfiguration.Helpers.getRiseElements();
    const playUntilDoneElements = riseElements.filter( element => element.hasAttribute( "play-until-done" ));

    console.log( `Start listening PUD events of ${playUntilDoneElements.length} elements` );
    RisePlayerConfiguration.Logger.info( LOGGER_DATA, "start listening PUD events", { playUntilDoneElements: playUntilDoneElements.length });

    playUntilDoneElements.forEach( element => {
      element.addEventListener( "report-done", event => {
        if ( event.detail && event.detail.done && doneElements.indexOf( element ) < 0 ) {
          doneElements.push( element );
        }

        if ( doneElements.length === playUntilDoneElements.length ) {
          reportDone();
        }
      });
    });

    function logPlayingElements() {
      const playingElements = playUntilDoneElements.filter( el => doneElements.indexOf( el ) < 0 );
      const printElement = el => `${el.tagName}#${el.id}`;

      RisePlayerConfiguration.Logger.info( LOGGER_DATA, "PUD state", {
        playingElements: playingElements.map( printElement ),
        doneElements: doneElements.map( printElement )
      });
    }

    setInterval( logPlayingElements, LOG_INTERVAL );
  }

  function reportDone() {
    _reset();

    if ( _isInViewer()) {

      let message = {
        topic: "template-done",
        frameElementId: window.frameElement ? window.frameElement.id : ""
      }

      window.parent.postMessage( message, "*" );

    } else {

      if ( !RisePlayerConfiguration.LocalMessaging.isConnected()) {
        console.log( "Not connected to Local Messaging, cannot report done" );
        return;
      }

      RisePlayerConfiguration.Logger.info( LOGGER_DATA, "sending PUD template-done event" );

      RisePlayerConfiguration.Helpers.onceClientsAreAvailable( "local-messaging", () => {
        RisePlayerConfiguration.LocalMessaging.broadcastMessage({
          topic: "template-done"
        });
      });
    }
  }

  const _isInViewer = () => {
    return window.self !== window.top;
  };

  const exposedFunctions = {
    reportDone,
    start
  };

  return exposedFunctions;

})();
