/* eslint-disable no-console */

RisePlayerConfiguration.PlayUntilDone = (() => {

  function reportDone() {
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

  const exposedFunctions = {
    reportDone
  };

  return exposedFunctions;

})();
