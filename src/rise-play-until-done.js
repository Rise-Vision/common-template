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
          this.reportTemplateDone();
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

  function reportTemplateDone() {
    _reset();

    if ( RisePlayerConfiguration.Helpers.isInViewer()) {

      let message = {
        topic: "template-done",
        frameElementId: window.frameElement ? window.frameElement.id : ""
      }

      window.parent.postMessage( message, "*" );

    } else {

      if ( !RisePlayerConfiguration.LocalMessaging.isConnected()) {
        RisePlayerConfiguration.Logger.error( LOGGER_DATA, "not connectted to Local Messaging, cannot send PUD template-done event" );
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

  const exposedFunctions = {
    reportTemplateDone,
    start
  };

  return exposedFunctions;

})();

if ( !RisePlayerConfiguration.Helpers.isTestEnvironment()) {
  const handler = ( event ) => {
    if ( event.detail.isConnected ) {
      window.removeEventListener( "rise-local-messaging-connection", handler );

      RisePlayerConfiguration.PlayUntilDone.start();
    }
  };

  window.addEventListener( "rise-local-messaging-connection", handler );
}
