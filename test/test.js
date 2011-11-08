var timeout = 5000;

function bind(prefix, hash, origin) {
  prefix = prefix || "";

  pm.bind(prefix + "test.success", function() {
    return;
  }, null, hash);

  pm.bind(prefix + "test.success with data", function(data) {
    return data;
  }, null, hash);

  pm.bind(prefix + "test.error", function() {
    throw("error");
  }, null, hash);

  pm.bind(prefix + "test.origin success", function(data) {
    return data;
  }, origin, hash);

  pm.bind(prefix + "test.origin error", function(data) {
    return data;
  }, "http://www.xyz.com", hash);

  pm.bind(prefix + "test.origin *", function(data) {
    return data;
  }, "*", hash);


  function fn1() {return "fn1";};
  function fn2() {return "fn2";};
  pm.bind(prefix + "test.bind/unbind", fn1, null, hash);
  pm.bind(prefix + "test.bind/unbind", fn2, null, hash);
  pm.unbind(prefix + "test.bind/unbind", fn1);

  pm.bind(prefix + "test.bind/unbind2", fn1, null, hash);
  pm.bind(prefix + "test.bind/unbind2", fn2, null, hash);
  pm.unbind(prefix + "test.bind/unbind2");
};

function send(w, prefix, hash, target_url) {
  prefix = prefix || "";

  test(prefix + "success", function() {
    expect(1);
    stop();
    var timer = setTimeout(function() {
      ok(false);
      start();
    }, timeout);
    pm({
      target: w,
      type: prefix + "test.success",
      success: function() {
        clearTimeout(timer);
        ok(true);
        start();
      },
      hash: hash,
      url: target_url
    });
  });

  test(prefix + "success with data", function() {
    expect(2);
    stop();
    var timer = setTimeout(function() {
      ok(false);
      start();
    }, timeout);
    pm({
      target: w,
      type: prefix + "test.success with data",
      data: {foo:"bar"},
      success: function(data) {
        clearTimeout(timer);
        ok(data);
        equals(data.foo, "bar");
        start();
      },
      hash: hash,
      url: target_url
    });
  });

  test(prefix + "error", function() {
    expect(2);
    stop();
    var timer = setTimeout(function() {
      ok(false);
      start();
    }, timeout);
    pm({
      target: w,
      type: prefix + "test.error",
      data: null,
      error: function(e) {
        clearTimeout(timer);
        ok(true);
        equals(e, "error");
        start();
      },
      hash: hash,
      url: target_url
    });
  });

  test(prefix + "origin success", function() {
    expect(2);
    stop();
    var timer = setTimeout(function() {
      ok(false);
      start();
    }, timeout);
    pm({
      target: w,
      type: prefix + "test.origin success",
      data: {foo:"bar"},
      success: function(data) {
        clearTimeout(timer);
        ok(data);
        equals(data.foo, "bar");
        start();
      },
      hash: hash,
      url: target_url
    });
  });

  test(prefix + "origin error", function() {
    expect(1);
    stop();
    var timer = setTimeout(function() {
      ok(false);
      start();
    }, timeout);
    pm({
      target: w,
      type: prefix + "test.origin error",
      data: {foo:"bar"},
      error: function(e) {
        clearTimeout(timer);
        ok(true);
        start();
      },
      hash: hash,
      url: target_url
    });
  });

  test(prefix + "origin *", function() {
    expect(2);
    stop();
    var timer = setTimeout(function() {
      ok(false);
      start();
    }, timeout);
    pm({
      target: w,
      type: prefix + "test.origin *",
      data: {foo:"bar"},
      success: function(data) {
        clearTimeout(timer);
        ok(data);
        equals(data.foo, "bar");
        start();
      },
      hash: hash,
      url: target_url
    });
  });

  test(prefix + "bind/unbind", function() {
    expect(2);
    stop();
    var timer = setTimeout(function() {
      ok(false);
      start();
    }, timeout);
    pm({
      target: w,
      type: prefix + "test.bind/unbind",
      data: {foo:"bar"},
      success: function(data) {
        clearTimeout(timer);
        ok(data);
        equals(data, "fn2");
        start();
      },
      hash: hash,
      url: target_url
    });
  });


  test(prefix + "bind/unbind2", function() {
    expect(1);
    stop();
    var timer = setTimeout(function() {
      ok(true);
      start();
    }, 13);
    var counter = 0;
    pm({
      target: w,
      type: prefix + "test.bind/unbind2",
      data: {foo:"bar"},
      success: function() {
        ok(false);
        start();
      },
      hash: hash,
      url: target_url
    });
  });
};
