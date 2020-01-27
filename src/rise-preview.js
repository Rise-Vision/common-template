/* eslint-disable one-var */
/* eslint-disable no-console */

RisePlayerConfiguration.Preview = (() => {

  let divHighlight = null;

  function _receiveData( event ) {
    if ( event.origin.indexOf( "risevision.com" ) === -1 ) {
      return;
    }

    const data = JSON.parse( event.data );

    switch ( data.type ) {
    case "attributeData":
      RisePlayerConfiguration.AttributeData.update( data.value );
      break;
    case "displayData":
      RisePlayerConfiguration.DisplayData.update( data.value );
      break;
    case "sendStartEvent":
      RisePlayerConfiguration.AttributeData.sendStartEvent();
      break;
    case "highlightComponent":
      _highlightComponent( data.value );
      break;
    //defaults to attributData for backwards compatibility
    default:
      RisePlayerConfiguration.AttributeData.update( data );
      break;
    }
  }

  function _postMessageToEditor( type, value ) {
    const message = {
      type: type,
      value: value
    };

    window.parent.postMessage( JSON.stringify( message ), "*" );
  }

  function _makeComponentsSelectable() {
    RisePlayerConfiguration.Helpers.getRiseEditableElements()
      .forEach( element => {
        element.onclick = ( el ) => {
          _highlightComponent( el.srcElement.id );
          _postMessageToEditor( "editComponent", el.srcElement.id );
        };
      });
  }

  function _highlightComponent( id ) {
    if ( !divHighlight ) {
      return
    }

    const el = RisePlayerConfiguration.Helpers.getComponent( id );

    if ( el ) {
      const rect = el.getBoundingClientRect();
      const bodyRect = document.body.getBoundingClientRect();

      const elementWidth = rect.right - rect.left;
      const bodyWidth = bodyRect.right - bodyRect.left;
      const highlightWidth = elementWidth > bodyWidth ? bodyWidth : elementWidth;

      const elementHeight = rect.bottom - rect.top;
      const bodyHeight = bodyRect.bottom - bodyRect.top;
      const highlightHeight = elementHeight > bodyHeight ? bodyHeight : elementHeight;

      divHighlight.style.left = rect.left + "px";
      divHighlight.style.top = rect.top + "px";
      divHighlight.style.width = highlightWidth + "px";
      divHighlight.style.height = highlightHeight + "px";
      divHighlight.style.display = "block";
    } else {
      divHighlight.style.display = "none";
    }
  }

  function _initHighlight() {
    if ( !divHighlight ) {
      divHighlight = document.createElement( "div" );
      divHighlight.style.border = "thick dashed #CCCCCC";
      divHighlight.id = "divHighlight";
      divHighlight.style.position = "absolute";
      divHighlight.style.backgroundColor = "rgba(192,192,192,0.3)";
      divHighlight.style.zIndex = "1000";
      divHighlight.style.display = "none";
      divHighlight.addEventListener( "click", () => divHighlight.style.display = "none" );
      document.body.appendChild( divHighlight );
    }
  }

  function startListeningForData() {
    window.addEventListener( "message", _receiveData );
    window.document.documentElement.style.cursor = "pointer";
    _initHighlight();
    _makeComponentsSelectable();
  }

  const exposedFunctions = {
    startListeningForData: startListeningForData
  };

  if ( RisePlayerConfiguration.Helpers.isTestEnvironment()) {
    Object.assign( exposedFunctions, {
      receiveData: _receiveData
    });
  }

  return exposedFunctions;

})();
