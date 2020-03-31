/* global TEMPLATE_COMMON_CONFIG */
/* eslint-disable one-var */
/* eslint-disable no-console */

RisePlayerConfiguration.Preview = (() => {

  let divHighlight = null;

  function _receiveData( event ) {
    console.log( "receiveData", event );
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
    const companyIdParam = RisePlayerConfiguration.Helpers.getHttpParameter( "cid" );
    const presentationIdParam = RisePlayerConfiguration.Helpers.getHttpParameter( "presentationId" );
    const isTemplateEditorParam = RisePlayerConfiguration.Helpers.getHttpParameter( "isTemplateEditor" );

    if ( companyIdParam && presentationIdParam && !isTemplateEditorParam ) {
      const filePath = `https://storage.googleapis.com/${
        TEMPLATE_COMMON_CONFIG.GCS_COMPANY_BUCKET
      }/${
        companyIdParam
      }/template-data/${
        presentationIdParam
      }/published/${
        TEMPLATE_COMMON_CONFIG.GCS_ATTRIBUTE_DATA_FILE
      }`;

      window.fetch( filePath )
        .then( function( response ) {
          return response.text();
        }).then( function( data ) {
          var e = new Event( "message" );

          e.data = data;
          e.origin = "risevision.com";
          _receiveData( e );
        });
    }
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
