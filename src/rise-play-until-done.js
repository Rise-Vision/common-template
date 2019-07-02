/* eslint-disable no-console, one-var */

RisePlayerConfiguration.PlayUntilDone = (() => {

  function reportDone() {

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
    reportDone
  };

  return exposedFunctions;

})();
