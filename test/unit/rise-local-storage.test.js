/* global describe, it, expect, afterEach, beforeEach, sinon */

"use strict";

describe( "watchSingleFile", function() {

  var DELETED_MESSAGE = {
      "from": "local-storage",
      "topic": "FILE-UPDATE",
      "filePath": "bucket/file.txt",
      "status": "DELETED",
      "through": "ws"
    },
    STALE_MESSAGE = {
      "from": "local-storage",
      "topic": "FILE-UPDATE",
      "filePath": "bucket/file.txt",
      "status": "STALE",
      "through": "ws"
    },
    CURRENT_MESSAGE = {
      "from": "local-storage",
      "topic": "FILE-UPDATE",
      "filePath": "bucket/file.txt",
      "status": "CURRENT",
      "version": "1453152401356000",
      "ospath": "/home/rise/rvplayer/modules/local-storage/cache/dd6be87ae13b9d0a4c35420d1dfa1e37",
      "osurl": "file:///home/rise/bucket/file.txt",
      "through": "ws"
    },
    ERROR_MESSAGE = {
      "from": "local-storage",
      "topic": "FILE-ERROR",
      "filePath": "bucket/file.txt",
      "msg": "file transfer error",
      "detail": "network failed"
    },
    _helpers,
    _localMessaging,
    _messageHandler;

  beforeEach( function() {
    _helpers = RisePlayerConfiguration.Helpers;
    _localMessaging = RisePlayerConfiguration.LocalMessaging;

    sinon.stub( RisePlayerConfiguration.Viewer, "sendEndpointLog" );

    RisePlayerConfiguration.Helpers = {
      onceClientsAreAvailable: function( modules, action ) {
        action();
      }
    };

    RisePlayerConfiguration.LocalMessaging = {
      broadcastMessage: sinon.spy(),
      isConnected: function() {
        return true;
      },
      receiveMessages: function( handler ) {
        _messageHandler = handler;
      }
    };
  });

  afterEach( function() {
    RisePlayerConfiguration.Helpers = _helpers;
    RisePlayerConfiguration.LocalMessaging = _localMessaging;
    RisePlayerConfiguration.Viewer.sendEndpointLog.restore();
  });

  it( "should not broadcast a watch message if connection was lost", function() {
    RisePlayerConfiguration.LocalMessaging.isConnected = function() {
      return false;
    };

    RisePlayerConfiguration.LocalStorage.watchSingleFile( "bucket/file.txt", function() {});

    expect( RisePlayerConfiguration.LocalMessaging.broadcastMessage ).to.not.have.been.called;
  });

  it( "should broadcast a watch message for a single file", function() {
    RisePlayerConfiguration.LocalStorage.watchSingleFile( "bucket/file.txt", function() {});

    expect( RisePlayerConfiguration.LocalMessaging.broadcastMessage ).to.have.been.calledWith({
      topic: "watch", filePath: "bucket/file.txt"
    });
  });

  it( "should detect that a file is still not available", function( done ) {
    RisePlayerConfiguration.LocalStorage.watchSingleFile( "bucket/file.txt", function( data ) {
      expect( data.status ).to.equal( "STALE" );

      done();
    });

    expect( _messageHandler ).to.not.be.null;

    _messageHandler( STALE_MESSAGE );
  });

  it( "should detect when a watched file is available", function( done ) {
    RisePlayerConfiguration.LocalStorage.watchSingleFile( "bucket/file.txt", function( data ) {
      if ( !data.fileUrl ) {
        return;
      }

      expect( data ).to.deep.equal({
        status: "CURRENT",
        filePath: "bucket/file.txt",
        fileUrl: "file:///home/rise/bucket/file.txt"
      });

      done();
    });

    expect( _messageHandler ).to.not.be.null;

    _messageHandler( STALE_MESSAGE );
    _messageHandler( CURRENT_MESSAGE );
  });

  it( "should detect when a watched file is deleted", function( done ) {
    var count = 0;

    RisePlayerConfiguration.LocalStorage.watchSingleFile( "bucket/file.txt", function( data ) {
      expect( data.status ).to.equal( count ? "DELETED" : "CURRENT" );

      if ( !data.fileUrl ) {
        done();
      }

      count++;
    });

    expect( _messageHandler ).to.not.be.null;

    _messageHandler( CURRENT_MESSAGE );
    _messageHandler( DELETED_MESSAGE );
  });

  it( "should detect a file error", function( done ) {
    RisePlayerConfiguration.LocalStorage.watchSingleFile( "bucket/file.txt", function( data ) {
      expect( data ).to.deep.equal({
        fileUrl: null,
        filePath: "bucket/file.txt",
        status: "FILE-ERROR",
        errorMessage: "file transfer error",
        errorDetail: "network failed"
      });

      done();
    });

    expect( _messageHandler ).to.not.be.null;

    _messageHandler( ERROR_MESSAGE );
  });

});
