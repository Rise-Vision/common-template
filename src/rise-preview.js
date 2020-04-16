/* eslint-disable one-var */
/* eslint-disable no-console */

RisePlayerConfiguration.Preview = (() => {

  let divHighlight = null;

  function _receiveData( event ) {
    if ( event.origin.indexOf( "risevision.com" ) === -1 ) {
      return;
    }

    const data = _parseEventData( event );

    if ( !data ) {
      return;
    }

    switch ( data.type ) {
    case "attributeData":
      RisePlayerConfiguration.AttributeData.update( data.value );
      break;
    case "displayData":
      RisePlayerConfiguration.DisplayData.update( data.value );
      break;
    case "sendStartEvent":
      RisePlayerConfiguration.AttributeData.sendStartEvent();
      RisePlayerConfiguration.PlayUntilDone.start();
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

  function _parseEventData( event ) {
    try {
      return JSON.parse( event.data );
    // eslint-disable-next-line no-empty
    } catch ( error ) { }
    return null;
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

      const minRight = Math.min( rect.right, bodyRect.right );
      const highlightWidth = minRight - rect.left;

      const minBottom = Math.min( rect.bottom, bodyRect.bottom );
      const highlightHeight = minBottom - rect.top;

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
    if ( !RisePlayerConfiguration.Helpers.isDisplay()) {
      window.document.documentElement.style.cursor = "auto";
    }
    if ( RisePlayerConfiguration.Helpers.isEditorPreview()) {
      window.document.documentElement.style.cursor = "pointer";
      _initHighlight();
      _makeComponentsSelectable();
    }
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
