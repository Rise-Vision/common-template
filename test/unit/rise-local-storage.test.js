/* global describe, it, expect, afterEach, beforeEach, sinon */

"use strict";

describe( "watchSingleFile", function() {

  var DELETED_MESSAGE = {
    "from":"local-storage",
    "topic":"FILE-UPDATE",
    "filePath":"bucket/file.txt",
    "status":"DELETED",
    "through":"ws"
  };

  var STALE_MESSAGE = {
    "from":"local-storage",
    "topic":"FILE-UPDATE",
    "filePath":"bucket/file.txt",
    "status":"STALE",
    "through":"ws"
  };

  var CURRENT_MESSAGE = {
    "from":"local-storage",
    "topic":"FILE-UPDATE",
    "filePath":"bucket/file.txt",
    "status":"CURRENT",
    "version":"1453152401356000",
    "ospath":"/home/rise/rvplayer/modules/local-storage/cache/dd6be87ae13b9d0a4c35420d1dfa1e37",
    "osurl":"file:///home/rise/bucket/file.txt",
    "through":"ws"
  }

  var ERROR_MESSAGE = {
    "from":"local-storage",
    "topic":"FILE-ERROR",
    "filePath":"bucket/file.txt",
    "msg":"file transfer error",
    "detail":"network failed"
  };

  var _localMessaging, _messageHandler;

  beforeEach( function() {
    _localMessaging = RisePlayerConfiguration.LocalMessaging;

    RisePlayerConfiguration.LocalMessaging = {
      broadcastMessage: sinon.spy(),
      onceClientsAreAvailable: function(modules, action) {
        action();
      },
      receiveMessages: function(handler) {
        _messageHandler = handler;
      }
    };
  });

  afterEach( function() {
    RisePlayerConfiguration.LocalMessaging = _localMessaging;
  });

  it( "should broadcast a watch message for a single file", function() {
    RisePlayerConfiguration.LocalStorage.watchSingleFile('bucket/file.txt', function() {});

    expect( RisePlayerConfiguration.LocalMessaging.broadcastMessage ).to.have.been.calledWith({
      topic: "watch", filePath: "bucket/file.txt"
    });
  });

  it( "should detect when a watched file is available", function(done) {
    RisePlayerConfiguration.LocalStorage.watchSingleFile('bucket/file.txt', function(data) {
      expect(data).to.deep.equal({
        available: true, fileUrl: "file:///home/rise/bucket/file.txt"
      });

      done();
    });

    expect( _messageHandler ).to.not.be.null;

    _messageHandler(STALE_MESSAGE);
    _messageHandler(CURRENT_MESSAGE);
  });

  it( "should detect when a watched file is deleted", function(done) {
    var count = 0;
    RisePlayerConfiguration.LocalStorage.watchSingleFile('bucket/file.txt', function(data) {
      var available = count == 0;
      expect(data.available).to.equal(available);

      if( ! available ) {
        done();
      }

      count++;
    });

    expect( _messageHandler ).to.not.be.null;

    _messageHandler(CURRENT_MESSAGE);
    _messageHandler(DELETED_MESSAGE);
  });

  it( "should detect a file error", function(done) {
    RisePlayerConfiguration.LocalStorage.watchSingleFile('bucket/file.txt', function(data) {
      expect(data).to.deep.equal({
        available: false,
        error: true,
        errorMessage: "file transfer error",
        errorDetail: "network failed"
      });

      done();
    });

    expect( _messageHandler ).to.not.be.null;

    _messageHandler(ERROR_MESSAGE);
  });

});
