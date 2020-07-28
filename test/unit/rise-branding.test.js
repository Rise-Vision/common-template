"use strict";

describe( "Branding", function() {
  var sandbox,
    watchHandler,
    displayData,
    styleSheet;

  beforeEach( function() {
    sandbox = sinon.sandbox.create();

    displayData = {};
    sandbox.stub( RisePlayerConfiguration.Watch, "watchDataFile", function( url, handler ) {
      watchHandler = handler;

      handler( displayData );
    });

    sandbox.stub( RisePlayerConfiguration, "getDisplayId", function() {
      return "displayId"
    });

    sandbox.stub( RisePlayerConfiguration.Logger, "info" );

    sandbox.stub( document, "createElement" ).returns({
      sheet: styleSheet = {
        cssRules: [],
        insertRule: function( rule, index ) {
          styleSheet.cssRules.splice( index, 0, rule );
        }
      }
    });
    sandbox.stub( document.head, "appendChild" );
    sandbox.stub( document.head, "removeChild" );
    sandbox.stub( document.body.style, "setProperty" );
  });

  afterEach( function() {
    sandbox.restore();
    RisePlayerConfiguration.Branding.reset();
  });

  describe( "start:", function() {
    it( "should register watcher", function() {
      // Implicit watcher registration from start()
      RisePlayerConfiguration.DisplayData.connectionHandler({ detail: { isConnected: true } });

      RisePlayerConfiguration.Watch.watchDataFile.should.have.been.called;
    });

    it( "should register watcher once", function() {
      // Implicit watcher registration from start()
      RisePlayerConfiguration.Branding.watchLogoFile( function() {});

      RisePlayerConfiguration.DisplayData.connectionHandler({ detail: { isConnected: true } });

      RisePlayerConfiguration.Watch.watchDataFile.should.have.been.calledOnce;
    });

    it( "should call back watcher when connection is available", function() {
      var handler = sandbox.spy();

      RisePlayerConfiguration.Branding.watchLogoFile( handler );

      RisePlayerConfiguration.DisplayData.connectionHandler({ detail: { isConnected: true } });

      handler.should.have.been.called;
    });

    describe( "watchBrandColors:", function() {
      beforeEach( function() {
        displayData = {
          companyBranding: {
            baseColor: "blue",
            accentColor: "red"
          }
        };
      });

      it( "should not create style sheet if branding is not present", function() {
        displayData = {};

        RisePlayerConfiguration.DisplayData.connectionHandler({ detail: { isConnected: true } });

        document.createElement.should.not.have.been.called;
        document.head.appendChild.should.not.have.been.called;
      });

      it( "should create new stylesheet and append style object", function() {
        RisePlayerConfiguration.DisplayData.connectionHandler({ detail: { isConnected: true } });

        document.createElement.should.have.been.calledWith( "style" );
        document.head.appendChild.should.have.been.calledWith( sinon.match.object );
      });

      it( "should append css rules to the style element", function() {
        RisePlayerConfiguration.DisplayData.connectionHandler({ detail: { isConnected: true } });

        expect( styleSheet.cssRules ).to.deep.equal([
          ".branding-color-base { color: blue !important; }",
          ".branding-color-base-bg { background-color: blue !important; }",
          ":root { --branding-color-base: blue; }",
          ".branding-color-accent { color: red !important; }",
          ".branding-color-accent-bg { background-color: red !important; }",
          ":root { --branding-color-accent: red; }"
        ]);
      });

      it( "should update style", function() {
        RisePlayerConfiguration.DisplayData.connectionHandler({ detail: { isConnected: true } });

        // reset styleSheet.cssRules array
        styleSheet.cssRules = [];

        displayData.companyBranding = {
          baseColor: "red",
          accentColor: "blue"
        };

        watchHandler( displayData );

        document.createElement.should.have.been.calledTwice;
        document.head.appendChild.should.have.been.calledTwice;

        expect( styleSheet.cssRules ).to.deep.equal([
          ".branding-color-base { color: red !important; }",
          ".branding-color-base-bg { background-color: red !important; }",
          ":root { --branding-color-base: red; }",
          ".branding-color-accent { color: blue !important; }",
          ".branding-color-accent-bg { background-color: blue !important; }",
          ":root { --branding-color-accent: blue; }"
        ]);
      });

      it( "should remove previous style element", function() {
        RisePlayerConfiguration.DisplayData.connectionHandler({ detail: { isConnected: true } });

        watchHandler( displayData );

        document.createElement.should.have.been.calledTwice;
        document.head.appendChild.should.have.been.calledTwice;

        document.head.removeChild.should.have.been.calledWith( sinon.match.object );
      });

    });
  });

  describe( "watchLogoFile:", function() {
    it( "should return unregister function", function() {
      expect( RisePlayerConfiguration.Branding.watchLogoFile( function() {})).to.be.a( "function" );
    });

    it( "should wait for logo file to be available", function() {
      var result = null;

      RisePlayerConfiguration.Branding.watchLogoFile( function( logoFile ) {
        result = logoFile;
      });

      RisePlayerConfiguration.DisplayData.connectionHandler({ detail: { isConnected: true } });

      expect( result ).to.be.undefined;

      watchHandler({ companyBranding: { logoFile: "somefile.jpg" } });

      expect( result ).to.equal( "somefile.jpg" );
    });

    it( "should return logo file right away if already available", function() {
      var result = null;

      displayData = { companyBranding: { logoFile: "somefile.jpg" } };

      RisePlayerConfiguration.Branding.watchLogoFile( function( logoFile ) {
        result = logoFile;
      });

      RisePlayerConfiguration.DisplayData.connectionHandler({ detail: { isConnected: true } });

      expect( result ).to.equal( "somefile.jpg" );
    });

    it( "should return logo file to multiple handlers", function() {
      var result1,
        result2;

      displayData = { companyBranding: { logoFile: "somefile.jpg" } };

      RisePlayerConfiguration.Branding.watchLogoFile( function( logoFile ) {
        result1 = logoFile;
      });
      RisePlayerConfiguration.Branding.watchLogoFile( function( logoFile ) {
        result2 = logoFile;
      });

      RisePlayerConfiguration.DisplayData.connectionHandler({ detail: { isConnected: true } });

      expect( result1 ).to.equal( "somefile.jpg" );
      expect( result2 ).to.equal( "somefile.jpg" );
    });

    it( "should handle logo file updates", function() {
      var result;

      displayData = { companyBranding: { logoFile: "somefile.jpg" } };

      RisePlayerConfiguration.Branding.watchLogoFile( function( logoFile ) {
        result = logoFile;
      });

      RisePlayerConfiguration.DisplayData.connectionHandler({ detail: { isConnected: true } });

      expect( result ).to.equal( "somefile.jpg" );

      watchHandler({ companyBranding: { logoFile: "anotherfile.gif" } });

      expect( result ).to.equal( "anotherfile.gif" );
    });

    it( "should unregister logo file handers", function() {
      var result1,
        result2,
        watchLogoFileHandler;

      displayData = { companyBranding: { logoFile: "somefile.jpg" } };

      RisePlayerConfiguration.Branding.watchLogoFile( function( logoFile ) {
        result1 = logoFile;
      });
      watchLogoFileHandler = RisePlayerConfiguration.Branding.watchLogoFile( function( logoFile ) {
        result2 = logoFile;
      });

      RisePlayerConfiguration.DisplayData.connectionHandler({ detail: { isConnected: true } });

      expect( result1 ).to.equal( "somefile.jpg" );
      expect( result2 ).to.equal( "somefile.jpg" );

      // unregister handler
      watchLogoFileHandler();

      watchHandler({ companyBranding: { logoFile: "anotherfile.gif" } });

      expect( result1 ).to.equal( "anotherfile.gif" );
      expect( result2 ).to.equal( "somefile.jpg" );
    });

  });

  describe( "watch branding override", function() {
    afterEach( function() {
      RisePlayerConfiguration.AttributeData.reset();
    });

    it( "should return branding override", function( done ) {
      RisePlayerConfiguration.AttributeData.update({
        "brandingOverride": {
          "baseColor": "blue",
          "accentColor": "red"
        }
      });

      RisePlayerConfiguration.Branding.watchBrandingOverride( function( brandingOverride ) {
        expect( brandingOverride ).to.deep.equal({
          "baseColor": "blue",
          "accentColor": "red"
        });

        done();
      });
    });

    it( "should return null if branding override does not exist", function( done ) {
      RisePlayerConfiguration.AttributeData.update({ "test": "test" });

      RisePlayerConfiguration.Branding.watchBrandingOverride( function( brandingOverride ) {
        expect( brandingOverride ).to.be.null;

        done();
      });
    });

    it( "should return null if branding override is set to null", function( done ) {
      RisePlayerConfiguration.AttributeData.update({ "brandingOverride": null });

      RisePlayerConfiguration.Branding.watchBrandingOverride( function( brandingOverride ) {
        expect( brandingOverride ).to.be.null;

        done();
      });
    });

  });

  describe( "update branding override", function() {
    it( "should correctly toggle updating branding colors with override or company settings", function() {
      displayData = {
        companyBranding: {
          baseColor: "blue",
          accentColor: "red"
        }
      };

      RisePlayerConfiguration.DisplayData.connectionHandler({ detail: { isConnected: true } });

      RisePlayerConfiguration.Branding.updateBrandingOverride( null );

      // should do nothing if branding override is null and already using company override
      // expect the styling to be company branding
      expect( styleSheet.cssRules ).to.deep.equal([
        ".branding-color-base { color: blue !important; }",
        ".branding-color-base-bg { background-color: blue !important; }",
        ":root { --branding-color-base: blue; }",
        ".branding-color-accent { color: red !important; }",
        ".branding-color-accent-bg { background-color: red !important; }",
        ":root { --branding-color-accent: red; }"
      ]);

      // reset styleSheet.cssRules array
      styleSheet.cssRules = [];

      RisePlayerConfiguration.Branding.updateBrandingOverride({
        baseColor: "orange",
        accentColor: "green"
      });

      // should update with override colors
      expect( styleSheet.cssRules ).to.deep.equal([
        ".branding-color-base { color: orange !important; }",
        ".branding-color-base-bg { background-color: orange !important; }",
        ":root { --branding-color-base: orange; }",
        ".branding-color-accent { color: green !important; }",
        ".branding-color-accent-bg { background-color: green !important; }",
        ":root { --branding-color-accent: green; }"
      ]);

      RisePlayerConfiguration.Logger.info.should.have.been.calledWith({
        name: "RisePlayerConfiguration",
        id: "Branding",
        version: "N/A"
      }, "brand colors", { override: true });

      // reset styleSheet.cssRules array
      styleSheet.cssRules = [];

      RisePlayerConfiguration.Branding.updateBrandingOverride( null );

      // should update with company colors
      expect( styleSheet.cssRules ).to.deep.equal([
        ".branding-color-base { color: blue !important; }",
        ".branding-color-base-bg { background-color: blue !important; }",
        ":root { --branding-color-base: blue; }",
        ".branding-color-accent { color: red !important; }",
        ".branding-color-accent-bg { background-color: red !important; }",
        ":root { --branding-color-accent: red; }"
      ]);

      RisePlayerConfiguration.Logger.info.should.have.been.calledWith({
        name: "RisePlayerConfiguration",
        id: "Branding",
        version: "N/A"
      }, "brand colors", { override: false });
    });

    it( "should not update with new company colors if override colors being used", function() {
      // reset styleSheet.cssRules array
      styleSheet.cssRules = [];

      displayData = {
        companyBranding: {
          baseColor: "blue",
          accentColor: "red"
        }
      };

      RisePlayerConfiguration.DisplayData.connectionHandler({ detail: { isConnected: true } });

      // reset styleSheet.cssRules array
      styleSheet.cssRules = [];

      RisePlayerConfiguration.Branding.updateBrandingOverride({
        baseColor: "orange",
        accentColor: "green"
      });

      // should update with override colors
      expect( styleSheet.cssRules ).to.deep.equal([
        ".branding-color-base { color: orange !important; }",
        ".branding-color-base-bg { background-color: orange !important; }",
        ":root { --branding-color-base: orange; }",
        ".branding-color-accent { color: green !important; }",
        ".branding-color-accent-bg { background-color: green !important; }",
        ":root { --branding-color-accent: green; }"
      ]);

      displayData = {
        companyBranding: {
          baseColor: "black",
          accentColor: "purple"
        }
      };

      RisePlayerConfiguration.DisplayData.connectionHandler({ detail: { isConnected: true } });

      // should still maintain override colors
      expect( styleSheet.cssRules ).to.deep.equal([
        ".branding-color-base { color: orange !important; }",
        ".branding-color-base-bg { background-color: orange !important; }",
        ":root { --branding-color-base: orange; }",
        ".branding-color-accent { color: green !important; }",
        ".branding-color-accent-bg { background-color: green !important; }",
        ":root { --branding-color-accent: green; }"
      ]);
    });
  });
});
