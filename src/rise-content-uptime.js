/* eslint-disable no-console, one-var */

RisePlayerConfiguration.ContentUptime = (() => {

  const COMPONENTS_RESULT_TIMEOUT = 3000;
  let expectedComponents = {};
  let receivedResults = {};
  let resultsTimeout;
  let hasUptimeError = false;

  function start() {
    window.addEventListener( "component-uptime-result", _handleComponentResult );
    RisePlayerConfiguration.LocalMessaging.receiveMessages( _handleMessage );
  }

  function _handleMessage( message ) {
    if ( !message || !message.topic ) {
      return;
    }
    if ( message.topic === "content-uptime" && message.forPresentationId === RisePlayerConfiguration.getPresentationId()) {
      console.log( "content-uptime event received", JSON.stringify( message ));

      _setExpectedComponents();
      resultsTimeout = setTimeout( _handleNoResponse, COMPONENTS_RESULT_TIMEOUT );

      window.dispatchEvent( new CustomEvent( "component-uptime-request" ));
    }
  }

  function _handleComponentResult( event ) {
    const expectedComponentsIds = Object.keys( expectedComponents );

    if ( !event || !event.detail || expectedComponentsIds.indexOf( event.detail.component_id ) === -1 ) {
      return;
    }

    const result = event.detail;

    result.responding = true;
    receivedResults[ result.component_id ] = result;

    if ( Object.keys( receivedResults ).length === expectedComponentsIds.length ) {
      clearTimeout( resultsTimeout );
      _sendUptimeResult( _shouldReportUptimeError(), Object.values( receivedResults ));
    }
  }

  function _handleNoResponse() {
    const componentsResult = [];
    const expectedComponentsIds = Object.keys( expectedComponents );

    expectedComponentsIds.forEach( id => {
      const component = expectedComponents[ id ];
      let result = receivedResults[ id ];

      if ( !result ) {
        result = {
          component_id: component.id,
          component_type: component.tagName.toLowerCase(),
          responding: false
        }
      }
      componentsResult.push( result );
    });

    _sendUptimeResult( true, componentsResult );
  }

  function _sendUptimeResult( error, components = []) {
    components.forEach( component => {
      component.presentation_id = RisePlayerConfiguration.getPresentationId();
      component.template_product_code = RisePlayerConfiguration.getTemplateProductCode();
      component.template_version = RisePlayerConfiguration.getTemplateVersion();
    });

    RisePlayerConfiguration.LocalMessaging.broadcastMessage({
      topic: "content-uptime-result",
      template: {
        presentation_id: RisePlayerConfiguration.getPresentationId(),
        template_product_code: RisePlayerConfiguration.getTemplateProductCode(),
        template_version: RisePlayerConfiguration.getTemplateVersion(),
        error: error
      },
      components
    });

    expectedComponents = {};
    receivedResults = {};
  }

  function _setExpectedComponents() {
    const riseElements = RisePlayerConfiguration.Helpers.getRiseElements();

    riseElements.forEach( el => {
      expectedComponents[ el.id ] = el;
    });
  }

  function setUptimeError( error ) {
    hasUptimeError = error;
  }

  function _shouldReportUptimeError() {
    const hasComponentError = Object.values( receivedResults ).some( result => {
      return result.error === true || result.error === "true";
    });

    return hasUptimeError || hasComponentError;
  }

  const exposedFunctions = {
    start: start,
    setUptimeError: setUptimeError
  };

  if ( RisePlayerConfiguration.Helpers.isTestEnvironment()) {
    Object.assign( exposedFunctions, {
      _handleMessage: _handleMessage,
      _handleComponentResult: _handleComponentResult,
      _handleNoResponse: _handleNoResponse,
      _shouldReportUptimeError: _shouldReportUptimeError,
      _getExpectedComponents: () => expectedComponents,
      _getReceivedResults: () => receivedResults
    });
  }

  return exposedFunctions;

})();

if ( !RisePlayerConfiguration.Helpers.isTestEnvironment()) {
  const handler = ( event ) => {
    if ( event.detail.isConnected ) {
      window.removeEventListener( "rise-local-messaging-connection", handler );

      RisePlayerConfiguration.ContentUptime.start();
    }
  };

  window.addEventListener( "rise-local-messaging-connection", handler );
}
