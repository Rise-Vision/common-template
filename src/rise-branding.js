/* eslint-disable no-console, vars-on-top */

RisePlayerConfiguration.Branding = (() => {
  var companyBranding = null,
    brandingStyleElement = null,
    logoFileHandlers = [];

  function update( message ) {
    companyBranding = message && message.companyBranding;
    const logoFile = companyBranding && companyBranding.logoFile;

    logoFileHandlers.forEach( handler => {
      handler( logoFile );
    });

    updateBrandingColors( companyBranding );
  }

  function registerWatcher() {
    RisePlayerConfiguration.DisplayData.onDisplayData( update );
  }

  function watchLogoFile( handler ) {
    logoFileHandlers.push( handler );
    companyBranding && companyBranding.logoFile !== null && handler( companyBranding.logoFile );

    // return unregister function
    return function() {
      var index = logoFileHandlers.indexOf( handler );

      if ( index > -1 ) {
        logoFileHandlers.splice( index, 1 );
      }
    };
  }

  function createStyleElement() {
    const styleElement = document.createElement( "style" );

    document.head.appendChild( styleElement );

    return styleElement;
  }

  function removeStyleElement( styleElement ) {
    styleElement && document.head.removeChild( styleElement );
  }

  function updateBrandingColors( branding ) {
    if ( !branding ) {
      return;
    }

    // https://davidwalsh.name/add-rules-stylesheets
    // Code:
    // https://medium.com/@tkh44/writing-a-css-in-js-library-from-scratch-96cd23a017b4
    var styleElement = createStyleElement(),
      styleSheet = styleElement.sheet,
      css = function( selector, styleString, important ) {
        const rule = `${selector} { ${styleString}${important ? " !important" : ""}; }`,
          index = styleSheet.cssRules.length;

        // Note: Rules are added to the bottom of the list
        // As per spec, the higher index rules override the previous ones
        styleSheet.insertRule( rule, index );
      };

    if ( branding.baseColor ) {
      css( ".branding-color-base", "color: " + branding.baseColor, true );
      css( ".branding-color-base-bg", "background-color: " + branding.baseColor, true );

      css( ":root", "--branding-color-base: " + branding.baseColor );
    }

    if ( branding.accentColor ) {
      css( ".branding-color-accent", "color: " + branding.accentColor, true );
      css( ".branding-color-accent-bg", "background-color: " + branding.accentColor, true );

      css( ":root", "--branding-color-accent: " + branding.accentColor );
    }

    removeStyleElement( brandingStyleElement );

    brandingStyleElement = styleElement;
  }

  function start() {
    registerWatcher();
  }

  const exposedFunctions = {
    watchLogoFile
  };

  start();

  return exposedFunctions;

})();
