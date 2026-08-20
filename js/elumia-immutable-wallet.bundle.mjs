var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __require = /* @__PURE__ */ ((x4) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x4, {
  get: (a3, b4) => (typeof require !== "undefined" ? require : a3)[b4]
}) : x4)(function(x4) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x4 + '" is not supported');
});
var __esm = (fn2, res) => function __init() {
  return fn2 && (res = (0, fn2[__getOwnPropNames(fn2)[0]])(fn2 = 0)), res;
};
var __commonJS = (cb, mod2) => function __require2() {
  return mod2 || (0, cb[__getOwnPropNames(cb)[0]])((mod2 = { exports: {} }).exports, mod2), mod2.exports;
};
var __export = (target, all3) => {
  for (var name in all3)
    __defProp(target, name, { get: all3[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod2, isNodeMode, target) => (target = mod2 != null ? __create(__getProtoOf(mod2)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod2 || !mod2.__esModule ? __defProp(target, "default", { value: mod2, enumerable: true }) : target,
  mod2
));
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

// node_modules/localforage/dist/localforage.js
var require_localforage = __commonJS({
  "node_modules/localforage/dist/localforage.js"(exports, module) {
    (function(f3) {
      if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = f3();
      } else if (typeof define === "function" && define.amd) {
        define([], f3);
      } else {
        var g4;
        if (typeof window !== "undefined") {
          g4 = window;
        } else if (typeof global !== "undefined") {
          g4 = global;
        } else if (typeof self !== "undefined") {
          g4 = self;
        } else {
          g4 = this;
        }
        g4.localforage = f3();
      }
    })(function() {
      var define2, module2, exports2;
      return function e3(t3, n3, r3) {
        function s3(o5, u3) {
          if (!n3[o5]) {
            if (!t3[o5]) {
              var a3 = typeof __require == "function" && __require;
              if (!u3 && a3) return a3(o5, true);
              if (i3) return i3(o5, true);
              var f3 = new Error("Cannot find module '" + o5 + "'");
              throw f3.code = "MODULE_NOT_FOUND", f3;
            }
            var l3 = n3[o5] = { exports: {} };
            t3[o5][0].call(l3.exports, function(e4) {
              var n4 = t3[o5][1][e4];
              return s3(n4 ? n4 : e4);
            }, l3, l3.exports, e3, t3, n3, r3);
          }
          return n3[o5].exports;
        }
        var i3 = typeof __require == "function" && __require;
        for (var o4 = 0; o4 < r3.length; o4++) s3(r3[o4]);
        return s3;
      }({ 1: [function(_dereq_, module3, exports3) {
        (function(global2) {
          "use strict";
          var Mutation = global2.MutationObserver || global2.WebKitMutationObserver;
          var scheduleDrain;
          {
            if (Mutation) {
              var called = 0;
              var observer = new Mutation(nextTick);
              var element = global2.document.createTextNode("");
              observer.observe(element, {
                characterData: true
              });
              scheduleDrain = function() {
                element.data = called = ++called % 2;
              };
            } else if (!global2.setImmediate && typeof global2.MessageChannel !== "undefined") {
              var channel = new global2.MessageChannel();
              channel.port1.onmessage = nextTick;
              scheduleDrain = function() {
                channel.port2.postMessage(0);
              };
            } else if ("document" in global2 && "onreadystatechange" in global2.document.createElement("script")) {
              scheduleDrain = function() {
                var scriptEl = global2.document.createElement("script");
                scriptEl.onreadystatechange = function() {
                  nextTick();
                  scriptEl.onreadystatechange = null;
                  scriptEl.parentNode.removeChild(scriptEl);
                  scriptEl = null;
                };
                global2.document.documentElement.appendChild(scriptEl);
              };
            } else {
              scheduleDrain = function() {
                setTimeout(nextTick, 0);
              };
            }
          }
          var draining;
          var queue = [];
          function nextTick() {
            draining = true;
            var i3, oldQueue;
            var len = queue.length;
            while (len) {
              oldQueue = queue;
              queue = [];
              i3 = -1;
              while (++i3 < len) {
                oldQueue[i3]();
              }
              len = queue.length;
            }
            draining = false;
          }
          module3.exports = immediate;
          function immediate(task) {
            if (queue.push(task) === 1 && !draining) {
              scheduleDrain();
            }
          }
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
      }, {}], 2: [function(_dereq_, module3, exports3) {
        "use strict";
        var immediate = _dereq_(1);
        function INTERNAL() {
        }
        var handlers = {};
        var REJECTED = ["REJECTED"];
        var FULFILLED = ["FULFILLED"];
        var PENDING = ["PENDING"];
        module3.exports = Promise2;
        function Promise2(resolver) {
          if (typeof resolver !== "function") {
            throw new TypeError("resolver must be a function");
          }
          this.state = PENDING;
          this.queue = [];
          this.outcome = void 0;
          if (resolver !== INTERNAL) {
            safelyResolveThenable(this, resolver);
          }
        }
        Promise2.prototype["catch"] = function(onRejected) {
          return this.then(null, onRejected);
        };
        Promise2.prototype.then = function(onFulfilled, onRejected) {
          if (typeof onFulfilled !== "function" && this.state === FULFILLED || typeof onRejected !== "function" && this.state === REJECTED) {
            return this;
          }
          var promise = new this.constructor(INTERNAL);
          if (this.state !== PENDING) {
            var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
            unwrap(promise, resolver, this.outcome);
          } else {
            this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
          }
          return promise;
        };
        function QueueItem(promise, onFulfilled, onRejected) {
          this.promise = promise;
          if (typeof onFulfilled === "function") {
            this.onFulfilled = onFulfilled;
            this.callFulfilled = this.otherCallFulfilled;
          }
          if (typeof onRejected === "function") {
            this.onRejected = onRejected;
            this.callRejected = this.otherCallRejected;
          }
        }
        QueueItem.prototype.callFulfilled = function(value) {
          handlers.resolve(this.promise, value);
        };
        QueueItem.prototype.otherCallFulfilled = function(value) {
          unwrap(this.promise, this.onFulfilled, value);
        };
        QueueItem.prototype.callRejected = function(value) {
          handlers.reject(this.promise, value);
        };
        QueueItem.prototype.otherCallRejected = function(value) {
          unwrap(this.promise, this.onRejected, value);
        };
        function unwrap(promise, func, value) {
          immediate(function() {
            var returnValue;
            try {
              returnValue = func(value);
            } catch (e3) {
              return handlers.reject(promise, e3);
            }
            if (returnValue === promise) {
              handlers.reject(promise, new TypeError("Cannot resolve promise with itself"));
            } else {
              handlers.resolve(promise, returnValue);
            }
          });
        }
        handlers.resolve = function(self2, value) {
          var result = tryCatch(getThen, value);
          if (result.status === "error") {
            return handlers.reject(self2, result.value);
          }
          var thenable = result.value;
          if (thenable) {
            safelyResolveThenable(self2, thenable);
          } else {
            self2.state = FULFILLED;
            self2.outcome = value;
            var i3 = -1;
            var len = self2.queue.length;
            while (++i3 < len) {
              self2.queue[i3].callFulfilled(value);
            }
          }
          return self2;
        };
        handlers.reject = function(self2, error) {
          self2.state = REJECTED;
          self2.outcome = error;
          var i3 = -1;
          var len = self2.queue.length;
          while (++i3 < len) {
            self2.queue[i3].callRejected(error);
          }
          return self2;
        };
        function getThen(obj) {
          var then = obj && obj.then;
          if (obj && (typeof obj === "object" || typeof obj === "function") && typeof then === "function") {
            return function appyThen() {
              then.apply(obj, arguments);
            };
          }
        }
        function safelyResolveThenable(self2, thenable) {
          var called = false;
          function onError(value) {
            if (called) {
              return;
            }
            called = true;
            handlers.reject(self2, value);
          }
          function onSuccess(value) {
            if (called) {
              return;
            }
            called = true;
            handlers.resolve(self2, value);
          }
          function tryToUnwrap() {
            thenable(onSuccess, onError);
          }
          var result = tryCatch(tryToUnwrap);
          if (result.status === "error") {
            onError(result.value);
          }
        }
        function tryCatch(func, value) {
          var out = {};
          try {
            out.value = func(value);
            out.status = "success";
          } catch (e3) {
            out.status = "error";
            out.value = e3;
          }
          return out;
        }
        Promise2.resolve = resolve;
        function resolve(value) {
          if (value instanceof this) {
            return value;
          }
          return handlers.resolve(new this(INTERNAL), value);
        }
        Promise2.reject = reject;
        function reject(reason) {
          var promise = new this(INTERNAL);
          return handlers.reject(promise, reason);
        }
        Promise2.all = all3;
        function all3(iterable) {
          var self2 = this;
          if (Object.prototype.toString.call(iterable) !== "[object Array]") {
            return this.reject(new TypeError("must be an array"));
          }
          var len = iterable.length;
          var called = false;
          if (!len) {
            return this.resolve([]);
          }
          var values = new Array(len);
          var resolved = 0;
          var i3 = -1;
          var promise = new this(INTERNAL);
          while (++i3 < len) {
            allResolver(iterable[i3], i3);
          }
          return promise;
          function allResolver(value, i4) {
            self2.resolve(value).then(resolveFromAll, function(error) {
              if (!called) {
                called = true;
                handlers.reject(promise, error);
              }
            });
            function resolveFromAll(outValue) {
              values[i4] = outValue;
              if (++resolved === len && !called) {
                called = true;
                handlers.resolve(promise, values);
              }
            }
          }
        }
        Promise2.race = race;
        function race(iterable) {
          var self2 = this;
          if (Object.prototype.toString.call(iterable) !== "[object Array]") {
            return this.reject(new TypeError("must be an array"));
          }
          var len = iterable.length;
          var called = false;
          if (!len) {
            return this.resolve([]);
          }
          var i3 = -1;
          var promise = new this(INTERNAL);
          while (++i3 < len) {
            resolver(iterable[i3]);
          }
          return promise;
          function resolver(value) {
            self2.resolve(value).then(function(response) {
              if (!called) {
                called = true;
                handlers.resolve(promise, response);
              }
            }, function(error) {
              if (!called) {
                called = true;
                handlers.reject(promise, error);
              }
            });
          }
        }
      }, { "1": 1 }], 3: [function(_dereq_, module3, exports3) {
        (function(global2) {
          "use strict";
          if (typeof global2.Promise !== "function") {
            global2.Promise = _dereq_(2);
          }
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
      }, { "2": 2 }], 4: [function(_dereq_, module3, exports3) {
        "use strict";
        var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
          return typeof obj;
        } : function(obj) {
          return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
        function _classCallCheck(instance, Constructor) {
          if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
          }
        }
        function getIDB() {
          try {
            if (typeof indexedDB !== "undefined") {
              return indexedDB;
            }
            if (typeof webkitIndexedDB !== "undefined") {
              return webkitIndexedDB;
            }
            if (typeof mozIndexedDB !== "undefined") {
              return mozIndexedDB;
            }
            if (typeof OIndexedDB !== "undefined") {
              return OIndexedDB;
            }
            if (typeof msIndexedDB !== "undefined") {
              return msIndexedDB;
            }
          } catch (e3) {
            return;
          }
        }
        var idb = getIDB();
        function isIndexedDBValid() {
          try {
            if (!idb || !idb.open) {
              return false;
            }
            var isSafari = typeof openDatabase !== "undefined" && /(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) && !/BlackBerry/.test(navigator.platform);
            var hasFetch = typeof fetch === "function" && fetch.toString().indexOf("[native code") !== -1;
            return (!isSafari || hasFetch) && typeof indexedDB !== "undefined" && // some outdated implementations of IDB that appear on Samsung
            // and HTC Android devices <4.4 are missing IDBKeyRange
            // See: https://github.com/mozilla/localForage/issues/128
            // See: https://github.com/mozilla/localForage/issues/272
            typeof IDBKeyRange !== "undefined";
          } catch (e3) {
            return false;
          }
        }
        function createBlob(parts, properties) {
          parts = parts || [];
          properties = properties || {};
          try {
            return new Blob(parts, properties);
          } catch (e3) {
            if (e3.name !== "TypeError") {
              throw e3;
            }
            var Builder = typeof BlobBuilder !== "undefined" ? BlobBuilder : typeof MSBlobBuilder !== "undefined" ? MSBlobBuilder : typeof MozBlobBuilder !== "undefined" ? MozBlobBuilder : WebKitBlobBuilder;
            var builder = new Builder();
            for (var i3 = 0; i3 < parts.length; i3 += 1) {
              builder.append(parts[i3]);
            }
            return builder.getBlob(properties.type);
          }
        }
        if (typeof Promise === "undefined") {
          _dereq_(3);
        }
        var Promise$1 = Promise;
        function executeCallback(promise, callback) {
          if (callback) {
            promise.then(function(result) {
              callback(null, result);
            }, function(error) {
              callback(error);
            });
          }
        }
        function executeTwoCallbacks(promise, callback, errorCallback) {
          if (typeof callback === "function") {
            promise.then(callback);
          }
          if (typeof errorCallback === "function") {
            promise["catch"](errorCallback);
          }
        }
        function normalizeKey(key2) {
          if (typeof key2 !== "string") {
            console.warn(key2 + " used as a key, but it is not a string.");
            key2 = String(key2);
          }
          return key2;
        }
        function getCallback() {
          if (arguments.length && typeof arguments[arguments.length - 1] === "function") {
            return arguments[arguments.length - 1];
          }
        }
        var DETECT_BLOB_SUPPORT_STORE = "local-forage-detect-blob-support";
        var supportsBlobs = void 0;
        var dbContexts = {};
        var toString3 = Object.prototype.toString;
        var READ_ONLY = "readonly";
        var READ_WRITE = "readwrite";
        function _binStringToArrayBuffer(bin) {
          var length2 = bin.length;
          var buf = new ArrayBuffer(length2);
          var arr = new Uint8Array(buf);
          for (var i3 = 0; i3 < length2; i3++) {
            arr[i3] = bin.charCodeAt(i3);
          }
          return buf;
        }
        function _checkBlobSupportWithoutCaching(idb2) {
          return new Promise$1(function(resolve) {
            var txn = idb2.transaction(DETECT_BLOB_SUPPORT_STORE, READ_WRITE);
            var blob = createBlob([""]);
            txn.objectStore(DETECT_BLOB_SUPPORT_STORE).put(blob, "key");
            txn.onabort = function(e3) {
              e3.preventDefault();
              e3.stopPropagation();
              resolve(false);
            };
            txn.oncomplete = function() {
              var matchedChrome = navigator.userAgent.match(/Chrome\/(\d+)/);
              var matchedEdge = navigator.userAgent.match(/Edge\//);
              resolve(matchedEdge || !matchedChrome || parseInt(matchedChrome[1], 10) >= 43);
            };
          })["catch"](function() {
            return false;
          });
        }
        function _checkBlobSupport(idb2) {
          if (typeof supportsBlobs === "boolean") {
            return Promise$1.resolve(supportsBlobs);
          }
          return _checkBlobSupportWithoutCaching(idb2).then(function(value) {
            supportsBlobs = value;
            return supportsBlobs;
          });
        }
        function _deferReadiness(dbInfo) {
          var dbContext = dbContexts[dbInfo.name];
          var deferredOperation = {};
          deferredOperation.promise = new Promise$1(function(resolve, reject) {
            deferredOperation.resolve = resolve;
            deferredOperation.reject = reject;
          });
          dbContext.deferredOperations.push(deferredOperation);
          if (!dbContext.dbReady) {
            dbContext.dbReady = deferredOperation.promise;
          } else {
            dbContext.dbReady = dbContext.dbReady.then(function() {
              return deferredOperation.promise;
            });
          }
        }
        function _advanceReadiness(dbInfo) {
          var dbContext = dbContexts[dbInfo.name];
          var deferredOperation = dbContext.deferredOperations.pop();
          if (deferredOperation) {
            deferredOperation.resolve();
            return deferredOperation.promise;
          }
        }
        function _rejectReadiness(dbInfo, err) {
          var dbContext = dbContexts[dbInfo.name];
          var deferredOperation = dbContext.deferredOperations.pop();
          if (deferredOperation) {
            deferredOperation.reject(err);
            return deferredOperation.promise;
          }
        }
        function _getConnection(dbInfo, upgradeNeeded) {
          return new Promise$1(function(resolve, reject) {
            dbContexts[dbInfo.name] = dbContexts[dbInfo.name] || createDbContext();
            if (dbInfo.db) {
              if (upgradeNeeded) {
                _deferReadiness(dbInfo);
                dbInfo.db.close();
              } else {
                return resolve(dbInfo.db);
              }
            }
            var dbArgs = [dbInfo.name];
            if (upgradeNeeded) {
              dbArgs.push(dbInfo.version);
            }
            var openreq = idb.open.apply(idb, dbArgs);
            if (upgradeNeeded) {
              openreq.onupgradeneeded = function(e3) {
                var db = openreq.result;
                try {
                  db.createObjectStore(dbInfo.storeName);
                  if (e3.oldVersion <= 1) {
                    db.createObjectStore(DETECT_BLOB_SUPPORT_STORE);
                  }
                } catch (ex) {
                  if (ex.name === "ConstraintError") {
                    console.warn('The database "' + dbInfo.name + '" has been upgraded from version ' + e3.oldVersion + " to version " + e3.newVersion + ', but the storage "' + dbInfo.storeName + '" already exists.');
                  } else {
                    throw ex;
                  }
                }
              };
            }
            openreq.onerror = function(e3) {
              e3.preventDefault();
              reject(openreq.error);
            };
            openreq.onsuccess = function() {
              var db = openreq.result;
              db.onversionchange = function(e3) {
                e3.target.close();
              };
              resolve(db);
              _advanceReadiness(dbInfo);
            };
          });
        }
        function _getOriginalConnection(dbInfo) {
          return _getConnection(dbInfo, false);
        }
        function _getUpgradedConnection(dbInfo) {
          return _getConnection(dbInfo, true);
        }
        function _isUpgradeNeeded(dbInfo, defaultVersion) {
          if (!dbInfo.db) {
            return true;
          }
          var isNewStore = !dbInfo.db.objectStoreNames.contains(dbInfo.storeName);
          var isDowngrade = dbInfo.version < dbInfo.db.version;
          var isUpgrade = dbInfo.version > dbInfo.db.version;
          if (isDowngrade) {
            if (dbInfo.version !== defaultVersion) {
              console.warn('The database "' + dbInfo.name + `" can't be downgraded from version ` + dbInfo.db.version + " to version " + dbInfo.version + ".");
            }
            dbInfo.version = dbInfo.db.version;
          }
          if (isUpgrade || isNewStore) {
            if (isNewStore) {
              var incVersion = dbInfo.db.version + 1;
              if (incVersion > dbInfo.version) {
                dbInfo.version = incVersion;
              }
            }
            return true;
          }
          return false;
        }
        function _encodeBlob(blob) {
          return new Promise$1(function(resolve, reject) {
            var reader = new FileReader();
            reader.onerror = reject;
            reader.onloadend = function(e3) {
              var base64 = btoa(e3.target.result || "");
              resolve({
                __local_forage_encoded_blob: true,
                data: base64,
                type: blob.type
              });
            };
            reader.readAsBinaryString(blob);
          });
        }
        function _decodeBlob(encodedBlob) {
          var arrayBuff = _binStringToArrayBuffer(atob(encodedBlob.data));
          return createBlob([arrayBuff], { type: encodedBlob.type });
        }
        function _isEncodedBlob(value) {
          return value && value.__local_forage_encoded_blob;
        }
        function _fullyReady(callback) {
          var self2 = this;
          var promise = self2._initReady().then(function() {
            var dbContext = dbContexts[self2._dbInfo.name];
            if (dbContext && dbContext.dbReady) {
              return dbContext.dbReady;
            }
          });
          executeTwoCallbacks(promise, callback, callback);
          return promise;
        }
        function _tryReconnect(dbInfo) {
          _deferReadiness(dbInfo);
          var dbContext = dbContexts[dbInfo.name];
          var forages = dbContext.forages;
          for (var i3 = 0; i3 < forages.length; i3++) {
            var forage = forages[i3];
            if (forage._dbInfo.db) {
              forage._dbInfo.db.close();
              forage._dbInfo.db = null;
            }
          }
          dbInfo.db = null;
          return _getOriginalConnection(dbInfo).then(function(db) {
            dbInfo.db = db;
            if (_isUpgradeNeeded(dbInfo)) {
              return _getUpgradedConnection(dbInfo);
            }
            return db;
          }).then(function(db) {
            dbInfo.db = dbContext.db = db;
            for (var i4 = 0; i4 < forages.length; i4++) {
              forages[i4]._dbInfo.db = db;
            }
          })["catch"](function(err) {
            _rejectReadiness(dbInfo, err);
            throw err;
          });
        }
        function createTransaction(dbInfo, mode, callback, retries) {
          if (retries === void 0) {
            retries = 1;
          }
          try {
            var tx = dbInfo.db.transaction(dbInfo.storeName, mode);
            callback(null, tx);
          } catch (err) {
            if (retries > 0 && (!dbInfo.db || err.name === "InvalidStateError" || err.name === "NotFoundError")) {
              return Promise$1.resolve().then(function() {
                if (!dbInfo.db || err.name === "NotFoundError" && !dbInfo.db.objectStoreNames.contains(dbInfo.storeName) && dbInfo.version <= dbInfo.db.version) {
                  if (dbInfo.db) {
                    dbInfo.version = dbInfo.db.version + 1;
                  }
                  return _getUpgradedConnection(dbInfo);
                }
              }).then(function() {
                return _tryReconnect(dbInfo).then(function() {
                  createTransaction(dbInfo, mode, callback, retries - 1);
                });
              })["catch"](callback);
            }
            callback(err);
          }
        }
        function createDbContext() {
          return {
            // Running localForages sharing a database.
            forages: [],
            // Shared database.
            db: null,
            // Database readiness (promise).
            dbReady: null,
            // Deferred operations on the database.
            deferredOperations: []
          };
        }
        function _initStorage(options) {
          var self2 = this;
          var dbInfo = {
            db: null
          };
          if (options) {
            for (var i3 in options) {
              dbInfo[i3] = options[i3];
            }
          }
          var dbContext = dbContexts[dbInfo.name];
          if (!dbContext) {
            dbContext = createDbContext();
            dbContexts[dbInfo.name] = dbContext;
          }
          dbContext.forages.push(self2);
          if (!self2._initReady) {
            self2._initReady = self2.ready;
            self2.ready = _fullyReady;
          }
          var initPromises = [];
          function ignoreErrors() {
            return Promise$1.resolve();
          }
          for (var j5 = 0; j5 < dbContext.forages.length; j5++) {
            var forage = dbContext.forages[j5];
            if (forage !== self2) {
              initPromises.push(forage._initReady()["catch"](ignoreErrors));
            }
          }
          var forages = dbContext.forages.slice(0);
          return Promise$1.all(initPromises).then(function() {
            dbInfo.db = dbContext.db;
            return _getOriginalConnection(dbInfo);
          }).then(function(db) {
            dbInfo.db = db;
            if (_isUpgradeNeeded(dbInfo, self2._defaultConfig.version)) {
              return _getUpgradedConnection(dbInfo);
            }
            return db;
          }).then(function(db) {
            dbInfo.db = dbContext.db = db;
            self2._dbInfo = dbInfo;
            for (var k5 = 0; k5 < forages.length; k5++) {
              var forage2 = forages[k5];
              if (forage2 !== self2) {
                forage2._dbInfo.db = dbInfo.db;
                forage2._dbInfo.version = dbInfo.version;
              }
            }
          });
        }
        function getItem(key2, callback) {
          var self2 = this;
          key2 = normalizeKey(key2);
          var promise = new Promise$1(function(resolve, reject) {
            self2.ready().then(function() {
              createTransaction(self2._dbInfo, READ_ONLY, function(err, transaction) {
                if (err) {
                  return reject(err);
                }
                try {
                  var store = transaction.objectStore(self2._dbInfo.storeName);
                  var req = store.get(key2);
                  req.onsuccess = function() {
                    var value = req.result;
                    if (value === void 0) {
                      value = null;
                    }
                    if (_isEncodedBlob(value)) {
                      value = _decodeBlob(value);
                    }
                    resolve(value);
                  };
                  req.onerror = function() {
                    reject(req.error);
                  };
                } catch (e3) {
                  reject(e3);
                }
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        }
        function iterate(iterator2, callback) {
          var self2 = this;
          var promise = new Promise$1(function(resolve, reject) {
            self2.ready().then(function() {
              createTransaction(self2._dbInfo, READ_ONLY, function(err, transaction) {
                if (err) {
                  return reject(err);
                }
                try {
                  var store = transaction.objectStore(self2._dbInfo.storeName);
                  var req = store.openCursor();
                  var iterationNumber = 1;
                  req.onsuccess = function() {
                    var cursor = req.result;
                    if (cursor) {
                      var value = cursor.value;
                      if (_isEncodedBlob(value)) {
                        value = _decodeBlob(value);
                      }
                      var result = iterator2(value, cursor.key, iterationNumber++);
                      if (result !== void 0) {
                        resolve(result);
                      } else {
                        cursor["continue"]();
                      }
                    } else {
                      resolve();
                    }
                  };
                  req.onerror = function() {
                    reject(req.error);
                  };
                } catch (e3) {
                  reject(e3);
                }
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        }
        function setItem(key2, value, callback) {
          var self2 = this;
          key2 = normalizeKey(key2);
          var promise = new Promise$1(function(resolve, reject) {
            var dbInfo;
            self2.ready().then(function() {
              dbInfo = self2._dbInfo;
              if (toString3.call(value) === "[object Blob]") {
                return _checkBlobSupport(dbInfo.db).then(function(blobSupport) {
                  if (blobSupport) {
                    return value;
                  }
                  return _encodeBlob(value);
                });
              }
              return value;
            }).then(function(value2) {
              createTransaction(self2._dbInfo, READ_WRITE, function(err, transaction) {
                if (err) {
                  return reject(err);
                }
                try {
                  var store = transaction.objectStore(self2._dbInfo.storeName);
                  if (value2 === null) {
                    value2 = void 0;
                  }
                  var req = store.put(value2, key2);
                  transaction.oncomplete = function() {
                    if (value2 === void 0) {
                      value2 = null;
                    }
                    resolve(value2);
                  };
                  transaction.onabort = transaction.onerror = function() {
                    var err2 = req.error ? req.error : req.transaction.error;
                    reject(err2);
                  };
                } catch (e3) {
                  reject(e3);
                }
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        }
        function removeItem(key2, callback) {
          var self2 = this;
          key2 = normalizeKey(key2);
          var promise = new Promise$1(function(resolve, reject) {
            self2.ready().then(function() {
              createTransaction(self2._dbInfo, READ_WRITE, function(err, transaction) {
                if (err) {
                  return reject(err);
                }
                try {
                  var store = transaction.objectStore(self2._dbInfo.storeName);
                  var req = store["delete"](key2);
                  transaction.oncomplete = function() {
                    resolve();
                  };
                  transaction.onerror = function() {
                    reject(req.error);
                  };
                  transaction.onabort = function() {
                    var err2 = req.error ? req.error : req.transaction.error;
                    reject(err2);
                  };
                } catch (e3) {
                  reject(e3);
                }
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        }
        function clear(callback) {
          var self2 = this;
          var promise = new Promise$1(function(resolve, reject) {
            self2.ready().then(function() {
              createTransaction(self2._dbInfo, READ_WRITE, function(err, transaction) {
                if (err) {
                  return reject(err);
                }
                try {
                  var store = transaction.objectStore(self2._dbInfo.storeName);
                  var req = store.clear();
                  transaction.oncomplete = function() {
                    resolve();
                  };
                  transaction.onabort = transaction.onerror = function() {
                    var err2 = req.error ? req.error : req.transaction.error;
                    reject(err2);
                  };
                } catch (e3) {
                  reject(e3);
                }
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        }
        function length(callback) {
          var self2 = this;
          var promise = new Promise$1(function(resolve, reject) {
            self2.ready().then(function() {
              createTransaction(self2._dbInfo, READ_ONLY, function(err, transaction) {
                if (err) {
                  return reject(err);
                }
                try {
                  var store = transaction.objectStore(self2._dbInfo.storeName);
                  var req = store.count();
                  req.onsuccess = function() {
                    resolve(req.result);
                  };
                  req.onerror = function() {
                    reject(req.error);
                  };
                } catch (e3) {
                  reject(e3);
                }
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        }
        function key(n3, callback) {
          var self2 = this;
          var promise = new Promise$1(function(resolve, reject) {
            if (n3 < 0) {
              resolve(null);
              return;
            }
            self2.ready().then(function() {
              createTransaction(self2._dbInfo, READ_ONLY, function(err, transaction) {
                if (err) {
                  return reject(err);
                }
                try {
                  var store = transaction.objectStore(self2._dbInfo.storeName);
                  var advanced = false;
                  var req = store.openKeyCursor();
                  req.onsuccess = function() {
                    var cursor = req.result;
                    if (!cursor) {
                      resolve(null);
                      return;
                    }
                    if (n3 === 0) {
                      resolve(cursor.key);
                    } else {
                      if (!advanced) {
                        advanced = true;
                        cursor.advance(n3);
                      } else {
                        resolve(cursor.key);
                      }
                    }
                  };
                  req.onerror = function() {
                    reject(req.error);
                  };
                } catch (e3) {
                  reject(e3);
                }
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        }
        function keys(callback) {
          var self2 = this;
          var promise = new Promise$1(function(resolve, reject) {
            self2.ready().then(function() {
              createTransaction(self2._dbInfo, READ_ONLY, function(err, transaction) {
                if (err) {
                  return reject(err);
                }
                try {
                  var store = transaction.objectStore(self2._dbInfo.storeName);
                  var req = store.openKeyCursor();
                  var keys2 = [];
                  req.onsuccess = function() {
                    var cursor = req.result;
                    if (!cursor) {
                      resolve(keys2);
                      return;
                    }
                    keys2.push(cursor.key);
                    cursor["continue"]();
                  };
                  req.onerror = function() {
                    reject(req.error);
                  };
                } catch (e3) {
                  reject(e3);
                }
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        }
        function dropInstance(options, callback) {
          callback = getCallback.apply(this, arguments);
          var currentConfig = this.config();
          options = typeof options !== "function" && options || {};
          if (!options.name) {
            options.name = options.name || currentConfig.name;
            options.storeName = options.storeName || currentConfig.storeName;
          }
          var self2 = this;
          var promise;
          if (!options.name) {
            promise = Promise$1.reject("Invalid arguments");
          } else {
            var isCurrentDb = options.name === currentConfig.name && self2._dbInfo.db;
            var dbPromise = isCurrentDb ? Promise$1.resolve(self2._dbInfo.db) : _getOriginalConnection(options).then(function(db) {
              var dbContext = dbContexts[options.name];
              var forages = dbContext.forages;
              dbContext.db = db;
              for (var i3 = 0; i3 < forages.length; i3++) {
                forages[i3]._dbInfo.db = db;
              }
              return db;
            });
            if (!options.storeName) {
              promise = dbPromise.then(function(db) {
                _deferReadiness(options);
                var dbContext = dbContexts[options.name];
                var forages = dbContext.forages;
                db.close();
                for (var i3 = 0; i3 < forages.length; i3++) {
                  var forage = forages[i3];
                  forage._dbInfo.db = null;
                }
                var dropDBPromise = new Promise$1(function(resolve, reject) {
                  var req = idb.deleteDatabase(options.name);
                  req.onerror = function() {
                    var db2 = req.result;
                    if (db2) {
                      db2.close();
                    }
                    reject(req.error);
                  };
                  req.onblocked = function() {
                    console.warn('dropInstance blocked for database "' + options.name + '" until all open connections are closed');
                  };
                  req.onsuccess = function() {
                    var db2 = req.result;
                    if (db2) {
                      db2.close();
                    }
                    resolve(db2);
                  };
                });
                return dropDBPromise.then(function(db2) {
                  dbContext.db = db2;
                  for (var i4 = 0; i4 < forages.length; i4++) {
                    var _forage = forages[i4];
                    _advanceReadiness(_forage._dbInfo);
                  }
                })["catch"](function(err) {
                  (_rejectReadiness(options, err) || Promise$1.resolve())["catch"](function() {
                  });
                  throw err;
                });
              });
            } else {
              promise = dbPromise.then(function(db) {
                if (!db.objectStoreNames.contains(options.storeName)) {
                  return;
                }
                var newVersion = db.version + 1;
                _deferReadiness(options);
                var dbContext = dbContexts[options.name];
                var forages = dbContext.forages;
                db.close();
                for (var i3 = 0; i3 < forages.length; i3++) {
                  var forage = forages[i3];
                  forage._dbInfo.db = null;
                  forage._dbInfo.version = newVersion;
                }
                var dropObjectPromise = new Promise$1(function(resolve, reject) {
                  var req = idb.open(options.name, newVersion);
                  req.onerror = function(err) {
                    var db2 = req.result;
                    db2.close();
                    reject(err);
                  };
                  req.onupgradeneeded = function() {
                    var db2 = req.result;
                    db2.deleteObjectStore(options.storeName);
                  };
                  req.onsuccess = function() {
                    var db2 = req.result;
                    db2.close();
                    resolve(db2);
                  };
                });
                return dropObjectPromise.then(function(db2) {
                  dbContext.db = db2;
                  for (var j5 = 0; j5 < forages.length; j5++) {
                    var _forage2 = forages[j5];
                    _forage2._dbInfo.db = db2;
                    _advanceReadiness(_forage2._dbInfo);
                  }
                })["catch"](function(err) {
                  (_rejectReadiness(options, err) || Promise$1.resolve())["catch"](function() {
                  });
                  throw err;
                });
              });
            }
          }
          executeCallback(promise, callback);
          return promise;
        }
        var asyncStorage = {
          _driver: "asyncStorage",
          _initStorage,
          _support: isIndexedDBValid(),
          iterate,
          getItem,
          setItem,
          removeItem,
          clear,
          length,
          key,
          keys,
          dropInstance
        };
        function isWebSQLValid() {
          return typeof openDatabase === "function";
        }
        var BASE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var BLOB_TYPE_PREFIX = "~~local_forage_type~";
        var BLOB_TYPE_PREFIX_REGEX = /^~~local_forage_type~([^~]+)~/;
        var SERIALIZED_MARKER = "__lfsc__:";
        var SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER.length;
        var TYPE_ARRAYBUFFER = "arbf";
        var TYPE_BLOB = "blob";
        var TYPE_INT8ARRAY = "si08";
        var TYPE_UINT8ARRAY = "ui08";
        var TYPE_UINT8CLAMPEDARRAY = "uic8";
        var TYPE_INT16ARRAY = "si16";
        var TYPE_INT32ARRAY = "si32";
        var TYPE_UINT16ARRAY = "ur16";
        var TYPE_UINT32ARRAY = "ui32";
        var TYPE_FLOAT32ARRAY = "fl32";
        var TYPE_FLOAT64ARRAY = "fl64";
        var TYPE_SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER_LENGTH + TYPE_ARRAYBUFFER.length;
        var toString$1 = Object.prototype.toString;
        function stringToBuffer(serializedString) {
          var bufferLength = serializedString.length * 0.75;
          var len = serializedString.length;
          var i3;
          var p4 = 0;
          var encoded1, encoded2, encoded3, encoded4;
          if (serializedString[serializedString.length - 1] === "=") {
            bufferLength--;
            if (serializedString[serializedString.length - 2] === "=") {
              bufferLength--;
            }
          }
          var buffer2 = new ArrayBuffer(bufferLength);
          var bytes2 = new Uint8Array(buffer2);
          for (i3 = 0; i3 < len; i3 += 4) {
            encoded1 = BASE_CHARS.indexOf(serializedString[i3]);
            encoded2 = BASE_CHARS.indexOf(serializedString[i3 + 1]);
            encoded3 = BASE_CHARS.indexOf(serializedString[i3 + 2]);
            encoded4 = BASE_CHARS.indexOf(serializedString[i3 + 3]);
            bytes2[p4++] = encoded1 << 2 | encoded2 >> 4;
            bytes2[p4++] = (encoded2 & 15) << 4 | encoded3 >> 2;
            bytes2[p4++] = (encoded3 & 3) << 6 | encoded4 & 63;
          }
          return buffer2;
        }
        function bufferToString(buffer2) {
          var bytes2 = new Uint8Array(buffer2);
          var base64String = "";
          var i3;
          for (i3 = 0; i3 < bytes2.length; i3 += 3) {
            base64String += BASE_CHARS[bytes2[i3] >> 2];
            base64String += BASE_CHARS[(bytes2[i3] & 3) << 4 | bytes2[i3 + 1] >> 4];
            base64String += BASE_CHARS[(bytes2[i3 + 1] & 15) << 2 | bytes2[i3 + 2] >> 6];
            base64String += BASE_CHARS[bytes2[i3 + 2] & 63];
          }
          if (bytes2.length % 3 === 2) {
            base64String = base64String.substring(0, base64String.length - 1) + "=";
          } else if (bytes2.length % 3 === 1) {
            base64String = base64String.substring(0, base64String.length - 2) + "==";
          }
          return base64String;
        }
        function serialize(value, callback) {
          var valueType = "";
          if (value) {
            valueType = toString$1.call(value);
          }
          if (value && (valueType === "[object ArrayBuffer]" || value.buffer && toString$1.call(value.buffer) === "[object ArrayBuffer]")) {
            var buffer2;
            var marker = SERIALIZED_MARKER;
            if (value instanceof ArrayBuffer) {
              buffer2 = value;
              marker += TYPE_ARRAYBUFFER;
            } else {
              buffer2 = value.buffer;
              if (valueType === "[object Int8Array]") {
                marker += TYPE_INT8ARRAY;
              } else if (valueType === "[object Uint8Array]") {
                marker += TYPE_UINT8ARRAY;
              } else if (valueType === "[object Uint8ClampedArray]") {
                marker += TYPE_UINT8CLAMPEDARRAY;
              } else if (valueType === "[object Int16Array]") {
                marker += TYPE_INT16ARRAY;
              } else if (valueType === "[object Uint16Array]") {
                marker += TYPE_UINT16ARRAY;
              } else if (valueType === "[object Int32Array]") {
                marker += TYPE_INT32ARRAY;
              } else if (valueType === "[object Uint32Array]") {
                marker += TYPE_UINT32ARRAY;
              } else if (valueType === "[object Float32Array]") {
                marker += TYPE_FLOAT32ARRAY;
              } else if (valueType === "[object Float64Array]") {
                marker += TYPE_FLOAT64ARRAY;
              } else {
                callback(new Error("Failed to get type for BinaryArray"));
              }
            }
            callback(marker + bufferToString(buffer2));
          } else if (valueType === "[object Blob]") {
            var fileReader = new FileReader();
            fileReader.onload = function() {
              var str = BLOB_TYPE_PREFIX + value.type + "~" + bufferToString(this.result);
              callback(SERIALIZED_MARKER + TYPE_BLOB + str);
            };
            fileReader.readAsArrayBuffer(value);
          } else {
            try {
              callback(JSON.stringify(value));
            } catch (e3) {
              console.error("Couldn't convert value into a JSON string: ", value);
              callback(null, e3);
            }
          }
        }
        function deserialize(value) {
          if (value.substring(0, SERIALIZED_MARKER_LENGTH) !== SERIALIZED_MARKER) {
            return JSON.parse(value);
          }
          var serializedString = value.substring(TYPE_SERIALIZED_MARKER_LENGTH);
          var type = value.substring(SERIALIZED_MARKER_LENGTH, TYPE_SERIALIZED_MARKER_LENGTH);
          var blobType;
          if (type === TYPE_BLOB && BLOB_TYPE_PREFIX_REGEX.test(serializedString)) {
            var matcher = serializedString.match(BLOB_TYPE_PREFIX_REGEX);
            blobType = matcher[1];
            serializedString = serializedString.substring(matcher[0].length);
          }
          var buffer2 = stringToBuffer(serializedString);
          switch (type) {
            case TYPE_ARRAYBUFFER:
              return buffer2;
            case TYPE_BLOB:
              return createBlob([buffer2], { type: blobType });
            case TYPE_INT8ARRAY:
              return new Int8Array(buffer2);
            case TYPE_UINT8ARRAY:
              return new Uint8Array(buffer2);
            case TYPE_UINT8CLAMPEDARRAY:
              return new Uint8ClampedArray(buffer2);
            case TYPE_INT16ARRAY:
              return new Int16Array(buffer2);
            case TYPE_UINT16ARRAY:
              return new Uint16Array(buffer2);
            case TYPE_INT32ARRAY:
              return new Int32Array(buffer2);
            case TYPE_UINT32ARRAY:
              return new Uint32Array(buffer2);
            case TYPE_FLOAT32ARRAY:
              return new Float32Array(buffer2);
            case TYPE_FLOAT64ARRAY:
              return new Float64Array(buffer2);
            default:
              throw new Error("Unkown type: " + type);
          }
        }
        var localforageSerializer = {
          serialize,
          deserialize,
          stringToBuffer,
          bufferToString
        };
        function createDbTable(t3, dbInfo, callback, errorCallback) {
          t3.executeSql("CREATE TABLE IF NOT EXISTS " + dbInfo.storeName + " (id INTEGER PRIMARY KEY, key unique, value)", [], callback, errorCallback);
        }
        function _initStorage$1(options) {
          var self2 = this;
          var dbInfo = {
            db: null
          };
          if (options) {
            for (var i3 in options) {
              dbInfo[i3] = typeof options[i3] !== "string" ? options[i3].toString() : options[i3];
            }
          }
          var dbInfoPromise = new Promise$1(function(resolve, reject) {
            try {
              dbInfo.db = openDatabase(dbInfo.name, String(dbInfo.version), dbInfo.description, dbInfo.size);
            } catch (e3) {
              return reject(e3);
            }
            dbInfo.db.transaction(function(t3) {
              createDbTable(t3, dbInfo, function() {
                self2._dbInfo = dbInfo;
                resolve();
              }, function(t4, error) {
                reject(error);
              });
            }, reject);
          });
          dbInfo.serializer = localforageSerializer;
          return dbInfoPromise;
        }
        function tryExecuteSql(t3, dbInfo, sqlStatement, args, callback, errorCallback) {
          t3.executeSql(sqlStatement, args, callback, function(t4, error) {
            if (error.code === error.SYNTAX_ERR) {
              t4.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name = ?", [dbInfo.storeName], function(t5, results) {
                if (!results.rows.length) {
                  createDbTable(t5, dbInfo, function() {
                    t5.executeSql(sqlStatement, args, callback, errorCallback);
                  }, errorCallback);
                } else {
                  errorCallback(t5, error);
                }
              }, errorCallback);
            } else {
              errorCallback(t4, error);
            }
          }, errorCallback);
        }
        function getItem$1(key2, callback) {
          var self2 = this;
          key2 = normalizeKey(key2);
          var promise = new Promise$1(function(resolve, reject) {
            self2.ready().then(function() {
              var dbInfo = self2._dbInfo;
              dbInfo.db.transaction(function(t3) {
                tryExecuteSql(t3, dbInfo, "SELECT * FROM " + dbInfo.storeName + " WHERE key = ? LIMIT 1", [key2], function(t4, results) {
                  var result = results.rows.length ? results.rows.item(0).value : null;
                  if (result) {
                    result = dbInfo.serializer.deserialize(result);
                  }
                  resolve(result);
                }, function(t4, error) {
                  reject(error);
                });
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        }
        function iterate$1(iterator2, callback) {
          var self2 = this;
          var promise = new Promise$1(function(resolve, reject) {
            self2.ready().then(function() {
              var dbInfo = self2._dbInfo;
              dbInfo.db.transaction(function(t3) {
                tryExecuteSql(t3, dbInfo, "SELECT * FROM " + dbInfo.storeName, [], function(t4, results) {
                  var rows = results.rows;
                  var length2 = rows.length;
                  for (var i3 = 0; i3 < length2; i3++) {
                    var item = rows.item(i3);
                    var result = item.value;
                    if (result) {
                      result = dbInfo.serializer.deserialize(result);
                    }
                    result = iterator2(result, item.key, i3 + 1);
                    if (result !== void 0) {
                      resolve(result);
                      return;
                    }
                  }
                  resolve();
                }, function(t4, error) {
                  reject(error);
                });
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        }
        function _setItem(key2, value, callback, retriesLeft) {
          var self2 = this;
          key2 = normalizeKey(key2);
          var promise = new Promise$1(function(resolve, reject) {
            self2.ready().then(function() {
              if (value === void 0) {
                value = null;
              }
              var originalValue = value;
              var dbInfo = self2._dbInfo;
              dbInfo.serializer.serialize(value, function(value2, error) {
                if (error) {
                  reject(error);
                } else {
                  dbInfo.db.transaction(function(t3) {
                    tryExecuteSql(t3, dbInfo, "INSERT OR REPLACE INTO " + dbInfo.storeName + " (key, value) VALUES (?, ?)", [key2, value2], function() {
                      resolve(originalValue);
                    }, function(t4, error2) {
                      reject(error2);
                    });
                  }, function(sqlError) {
                    if (sqlError.code === sqlError.QUOTA_ERR) {
                      if (retriesLeft > 0) {
                        resolve(_setItem.apply(self2, [key2, originalValue, callback, retriesLeft - 1]));
                        return;
                      }
                      reject(sqlError);
                    }
                  });
                }
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        }
        function setItem$1(key2, value, callback) {
          return _setItem.apply(this, [key2, value, callback, 1]);
        }
        function removeItem$1(key2, callback) {
          var self2 = this;
          key2 = normalizeKey(key2);
          var promise = new Promise$1(function(resolve, reject) {
            self2.ready().then(function() {
              var dbInfo = self2._dbInfo;
              dbInfo.db.transaction(function(t3) {
                tryExecuteSql(t3, dbInfo, "DELETE FROM " + dbInfo.storeName + " WHERE key = ?", [key2], function() {
                  resolve();
                }, function(t4, error) {
                  reject(error);
                });
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        }
        function clear$1(callback) {
          var self2 = this;
          var promise = new Promise$1(function(resolve, reject) {
            self2.ready().then(function() {
              var dbInfo = self2._dbInfo;
              dbInfo.db.transaction(function(t3) {
                tryExecuteSql(t3, dbInfo, "DELETE FROM " + dbInfo.storeName, [], function() {
                  resolve();
                }, function(t4, error) {
                  reject(error);
                });
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        }
        function length$1(callback) {
          var self2 = this;
          var promise = new Promise$1(function(resolve, reject) {
            self2.ready().then(function() {
              var dbInfo = self2._dbInfo;
              dbInfo.db.transaction(function(t3) {
                tryExecuteSql(t3, dbInfo, "SELECT COUNT(key) as c FROM " + dbInfo.storeName, [], function(t4, results) {
                  var result = results.rows.item(0).c;
                  resolve(result);
                }, function(t4, error) {
                  reject(error);
                });
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        }
        function key$1(n3, callback) {
          var self2 = this;
          var promise = new Promise$1(function(resolve, reject) {
            self2.ready().then(function() {
              var dbInfo = self2._dbInfo;
              dbInfo.db.transaction(function(t3) {
                tryExecuteSql(t3, dbInfo, "SELECT key FROM " + dbInfo.storeName + " WHERE id = ? LIMIT 1", [n3 + 1], function(t4, results) {
                  var result = results.rows.length ? results.rows.item(0).key : null;
                  resolve(result);
                }, function(t4, error) {
                  reject(error);
                });
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        }
        function keys$1(callback) {
          var self2 = this;
          var promise = new Promise$1(function(resolve, reject) {
            self2.ready().then(function() {
              var dbInfo = self2._dbInfo;
              dbInfo.db.transaction(function(t3) {
                tryExecuteSql(t3, dbInfo, "SELECT key FROM " + dbInfo.storeName, [], function(t4, results) {
                  var keys2 = [];
                  for (var i3 = 0; i3 < results.rows.length; i3++) {
                    keys2.push(results.rows.item(i3).key);
                  }
                  resolve(keys2);
                }, function(t4, error) {
                  reject(error);
                });
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        }
        function getAllStoreNames(db) {
          return new Promise$1(function(resolve, reject) {
            db.transaction(function(t3) {
              t3.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'", [], function(t4, results) {
                var storeNames = [];
                for (var i3 = 0; i3 < results.rows.length; i3++) {
                  storeNames.push(results.rows.item(i3).name);
                }
                resolve({
                  db,
                  storeNames
                });
              }, function(t4, error) {
                reject(error);
              });
            }, function(sqlError) {
              reject(sqlError);
            });
          });
        }
        function dropInstance$1(options, callback) {
          callback = getCallback.apply(this, arguments);
          var currentConfig = this.config();
          options = typeof options !== "function" && options || {};
          if (!options.name) {
            options.name = options.name || currentConfig.name;
            options.storeName = options.storeName || currentConfig.storeName;
          }
          var self2 = this;
          var promise;
          if (!options.name) {
            promise = Promise$1.reject("Invalid arguments");
          } else {
            promise = new Promise$1(function(resolve) {
              var db;
              if (options.name === currentConfig.name) {
                db = self2._dbInfo.db;
              } else {
                db = openDatabase(options.name, "", "", 0);
              }
              if (!options.storeName) {
                resolve(getAllStoreNames(db));
              } else {
                resolve({
                  db,
                  storeNames: [options.storeName]
                });
              }
            }).then(function(operationInfo) {
              return new Promise$1(function(resolve, reject) {
                operationInfo.db.transaction(function(t3) {
                  function dropTable(storeName) {
                    return new Promise$1(function(resolve2, reject2) {
                      t3.executeSql("DROP TABLE IF EXISTS " + storeName, [], function() {
                        resolve2();
                      }, function(t4, error) {
                        reject2(error);
                      });
                    });
                  }
                  var operations = [];
                  for (var i3 = 0, len = operationInfo.storeNames.length; i3 < len; i3++) {
                    operations.push(dropTable(operationInfo.storeNames[i3]));
                  }
                  Promise$1.all(operations).then(function() {
                    resolve();
                  })["catch"](function(e3) {
                    reject(e3);
                  });
                }, function(sqlError) {
                  reject(sqlError);
                });
              });
            });
          }
          executeCallback(promise, callback);
          return promise;
        }
        var webSQLStorage = {
          _driver: "webSQLStorage",
          _initStorage: _initStorage$1,
          _support: isWebSQLValid(),
          iterate: iterate$1,
          getItem: getItem$1,
          setItem: setItem$1,
          removeItem: removeItem$1,
          clear: clear$1,
          length: length$1,
          key: key$1,
          keys: keys$1,
          dropInstance: dropInstance$1
        };
        function isLocalStorageValid() {
          try {
            return typeof localStorage !== "undefined" && "setItem" in localStorage && // in IE8 typeof localStorage.setItem === 'object'
            !!localStorage.setItem;
          } catch (e3) {
            return false;
          }
        }
        function _getKeyPrefix(options, defaultConfig) {
          var keyPrefix = options.name + "/";
          if (options.storeName !== defaultConfig.storeName) {
            keyPrefix += options.storeName + "/";
          }
          return keyPrefix;
        }
        function checkIfLocalStorageThrows() {
          var localStorageTestKey = "_localforage_support_test";
          try {
            localStorage.setItem(localStorageTestKey, true);
            localStorage.removeItem(localStorageTestKey);
            return false;
          } catch (e3) {
            return true;
          }
        }
        function _isLocalStorageUsable() {
          return !checkIfLocalStorageThrows() || localStorage.length > 0;
        }
        function _initStorage$2(options) {
          var self2 = this;
          var dbInfo = {};
          if (options) {
            for (var i3 in options) {
              dbInfo[i3] = options[i3];
            }
          }
          dbInfo.keyPrefix = _getKeyPrefix(options, self2._defaultConfig);
          if (!_isLocalStorageUsable()) {
            return Promise$1.reject();
          }
          self2._dbInfo = dbInfo;
          dbInfo.serializer = localforageSerializer;
          return Promise$1.resolve();
        }
        function clear$2(callback) {
          var self2 = this;
          var promise = self2.ready().then(function() {
            var keyPrefix = self2._dbInfo.keyPrefix;
            for (var i3 = localStorage.length - 1; i3 >= 0; i3--) {
              var key2 = localStorage.key(i3);
              if (key2.indexOf(keyPrefix) === 0) {
                localStorage.removeItem(key2);
              }
            }
          });
          executeCallback(promise, callback);
          return promise;
        }
        function getItem$2(key2, callback) {
          var self2 = this;
          key2 = normalizeKey(key2);
          var promise = self2.ready().then(function() {
            var dbInfo = self2._dbInfo;
            var result = localStorage.getItem(dbInfo.keyPrefix + key2);
            if (result) {
              result = dbInfo.serializer.deserialize(result);
            }
            return result;
          });
          executeCallback(promise, callback);
          return promise;
        }
        function iterate$2(iterator2, callback) {
          var self2 = this;
          var promise = self2.ready().then(function() {
            var dbInfo = self2._dbInfo;
            var keyPrefix = dbInfo.keyPrefix;
            var keyPrefixLength = keyPrefix.length;
            var length2 = localStorage.length;
            var iterationNumber = 1;
            for (var i3 = 0; i3 < length2; i3++) {
              var key2 = localStorage.key(i3);
              if (key2.indexOf(keyPrefix) !== 0) {
                continue;
              }
              var value = localStorage.getItem(key2);
              if (value) {
                value = dbInfo.serializer.deserialize(value);
              }
              value = iterator2(value, key2.substring(keyPrefixLength), iterationNumber++);
              if (value !== void 0) {
                return value;
              }
            }
          });
          executeCallback(promise, callback);
          return promise;
        }
        function key$2(n3, callback) {
          var self2 = this;
          var promise = self2.ready().then(function() {
            var dbInfo = self2._dbInfo;
            var result;
            try {
              result = localStorage.key(n3);
            } catch (error) {
              result = null;
            }
            if (result) {
              result = result.substring(dbInfo.keyPrefix.length);
            }
            return result;
          });
          executeCallback(promise, callback);
          return promise;
        }
        function keys$2(callback) {
          var self2 = this;
          var promise = self2.ready().then(function() {
            var dbInfo = self2._dbInfo;
            var length2 = localStorage.length;
            var keys2 = [];
            for (var i3 = 0; i3 < length2; i3++) {
              var itemKey = localStorage.key(i3);
              if (itemKey.indexOf(dbInfo.keyPrefix) === 0) {
                keys2.push(itemKey.substring(dbInfo.keyPrefix.length));
              }
            }
            return keys2;
          });
          executeCallback(promise, callback);
          return promise;
        }
        function length$2(callback) {
          var self2 = this;
          var promise = self2.keys().then(function(keys2) {
            return keys2.length;
          });
          executeCallback(promise, callback);
          return promise;
        }
        function removeItem$2(key2, callback) {
          var self2 = this;
          key2 = normalizeKey(key2);
          var promise = self2.ready().then(function() {
            var dbInfo = self2._dbInfo;
            localStorage.removeItem(dbInfo.keyPrefix + key2);
          });
          executeCallback(promise, callback);
          return promise;
        }
        function setItem$2(key2, value, callback) {
          var self2 = this;
          key2 = normalizeKey(key2);
          var promise = self2.ready().then(function() {
            if (value === void 0) {
              value = null;
            }
            var originalValue = value;
            return new Promise$1(function(resolve, reject) {
              var dbInfo = self2._dbInfo;
              dbInfo.serializer.serialize(value, function(value2, error) {
                if (error) {
                  reject(error);
                } else {
                  try {
                    localStorage.setItem(dbInfo.keyPrefix + key2, value2);
                    resolve(originalValue);
                  } catch (e3) {
                    if (e3.name === "QuotaExceededError" || e3.name === "NS_ERROR_DOM_QUOTA_REACHED") {
                      reject(e3);
                    }
                    reject(e3);
                  }
                }
              });
            });
          });
          executeCallback(promise, callback);
          return promise;
        }
        function dropInstance$2(options, callback) {
          callback = getCallback.apply(this, arguments);
          options = typeof options !== "function" && options || {};
          if (!options.name) {
            var currentConfig = this.config();
            options.name = options.name || currentConfig.name;
            options.storeName = options.storeName || currentConfig.storeName;
          }
          var self2 = this;
          var promise;
          if (!options.name) {
            promise = Promise$1.reject("Invalid arguments");
          } else {
            promise = new Promise$1(function(resolve) {
              if (!options.storeName) {
                resolve(options.name + "/");
              } else {
                resolve(_getKeyPrefix(options, self2._defaultConfig));
              }
            }).then(function(keyPrefix) {
              for (var i3 = localStorage.length - 1; i3 >= 0; i3--) {
                var key2 = localStorage.key(i3);
                if (key2.indexOf(keyPrefix) === 0) {
                  localStorage.removeItem(key2);
                }
              }
            });
          }
          executeCallback(promise, callback);
          return promise;
        }
        var localStorageWrapper = {
          _driver: "localStorageWrapper",
          _initStorage: _initStorage$2,
          _support: isLocalStorageValid(),
          iterate: iterate$2,
          getItem: getItem$2,
          setItem: setItem$2,
          removeItem: removeItem$2,
          clear: clear$2,
          length: length$2,
          key: key$2,
          keys: keys$2,
          dropInstance: dropInstance$2
        };
        var sameValue = function sameValue2(x4, y4) {
          return x4 === y4 || typeof x4 === "number" && typeof y4 === "number" && isNaN(x4) && isNaN(y4);
        };
        var includes = function includes2(array, searchElement) {
          var len = array.length;
          var i3 = 0;
          while (i3 < len) {
            if (sameValue(array[i3], searchElement)) {
              return true;
            }
            i3++;
          }
          return false;
        };
        var isArray2 = Array.isArray || function(arg) {
          return Object.prototype.toString.call(arg) === "[object Array]";
        };
        var DefinedDrivers = {};
        var DriverSupport = {};
        var DefaultDrivers = {
          INDEXEDDB: asyncStorage,
          WEBSQL: webSQLStorage,
          LOCALSTORAGE: localStorageWrapper
        };
        var DefaultDriverOrder = [DefaultDrivers.INDEXEDDB._driver, DefaultDrivers.WEBSQL._driver, DefaultDrivers.LOCALSTORAGE._driver];
        var OptionalDriverMethods = ["dropInstance"];
        var LibraryMethods = ["clear", "getItem", "iterate", "key", "keys", "length", "removeItem", "setItem"].concat(OptionalDriverMethods);
        var DefaultConfig = {
          description: "",
          driver: DefaultDriverOrder.slice(),
          name: "localforage",
          // Default DB size is _JUST UNDER_ 5MB, as it's the highest size
          // we can use without a prompt.
          size: 4980736,
          storeName: "keyvaluepairs",
          version: 1
        };
        function callWhenReady(localForageInstance, libraryMethod) {
          localForageInstance[libraryMethod] = function() {
            var _args = arguments;
            return localForageInstance.ready().then(function() {
              return localForageInstance[libraryMethod].apply(localForageInstance, _args);
            });
          };
        }
        function extend2() {
          for (var i3 = 1; i3 < arguments.length; i3++) {
            var arg = arguments[i3];
            if (arg) {
              for (var _key in arg) {
                if (arg.hasOwnProperty(_key)) {
                  if (isArray2(arg[_key])) {
                    arguments[0][_key] = arg[_key].slice();
                  } else {
                    arguments[0][_key] = arg[_key];
                  }
                }
              }
            }
          }
          return arguments[0];
        }
        var LocalForage = function() {
          function LocalForage2(options) {
            _classCallCheck(this, LocalForage2);
            for (var driverTypeKey in DefaultDrivers) {
              if (DefaultDrivers.hasOwnProperty(driverTypeKey)) {
                var driver = DefaultDrivers[driverTypeKey];
                var driverName = driver._driver;
                this[driverTypeKey] = driverName;
                if (!DefinedDrivers[driverName]) {
                  this.defineDriver(driver);
                }
              }
            }
            this._defaultConfig = extend2({}, DefaultConfig);
            this._config = extend2({}, this._defaultConfig, options);
            this._driverSet = null;
            this._initDriver = null;
            this._ready = false;
            this._dbInfo = null;
            this._wrapLibraryMethodsWithReady();
            this.setDriver(this._config.driver)["catch"](function() {
            });
          }
          LocalForage2.prototype.config = function config(options) {
            if ((typeof options === "undefined" ? "undefined" : _typeof(options)) === "object") {
              if (this._ready) {
                return new Error("Can't call config() after localforage has been used.");
              }
              for (var i3 in options) {
                if (i3 === "storeName") {
                  options[i3] = options[i3].replace(/\W/g, "_");
                }
                if (i3 === "version" && typeof options[i3] !== "number") {
                  return new Error("Database version must be a number.");
                }
                this._config[i3] = options[i3];
              }
              if ("driver" in options && options.driver) {
                return this.setDriver(this._config.driver);
              }
              return true;
            } else if (typeof options === "string") {
              return this._config[options];
            } else {
              return this._config;
            }
          };
          LocalForage2.prototype.defineDriver = function defineDriver(driverObject, callback, errorCallback) {
            var promise = new Promise$1(function(resolve, reject) {
              try {
                var driverName = driverObject._driver;
                var complianceError = new Error("Custom driver not compliant; see https://mozilla.github.io/localForage/#definedriver");
                if (!driverObject._driver) {
                  reject(complianceError);
                  return;
                }
                var driverMethods = LibraryMethods.concat("_initStorage");
                for (var i3 = 0, len = driverMethods.length; i3 < len; i3++) {
                  var driverMethodName = driverMethods[i3];
                  var isRequired = !includes(OptionalDriverMethods, driverMethodName);
                  if ((isRequired || driverObject[driverMethodName]) && typeof driverObject[driverMethodName] !== "function") {
                    reject(complianceError);
                    return;
                  }
                }
                var configureMissingMethods = function configureMissingMethods2() {
                  var methodNotImplementedFactory = function methodNotImplementedFactory2(methodName) {
                    return function() {
                      var error = new Error("Method " + methodName + " is not implemented by the current driver");
                      var promise2 = Promise$1.reject(error);
                      executeCallback(promise2, arguments[arguments.length - 1]);
                      return promise2;
                    };
                  };
                  for (var _i2 = 0, _len = OptionalDriverMethods.length; _i2 < _len; _i2++) {
                    var optionalDriverMethod = OptionalDriverMethods[_i2];
                    if (!driverObject[optionalDriverMethod]) {
                      driverObject[optionalDriverMethod] = methodNotImplementedFactory(optionalDriverMethod);
                    }
                  }
                };
                configureMissingMethods();
                var setDriverSupport = function setDriverSupport2(support) {
                  if (DefinedDrivers[driverName]) {
                    console.info("Redefining LocalForage driver: " + driverName);
                  }
                  DefinedDrivers[driverName] = driverObject;
                  DriverSupport[driverName] = support;
                  resolve();
                };
                if ("_support" in driverObject) {
                  if (driverObject._support && typeof driverObject._support === "function") {
                    driverObject._support().then(setDriverSupport, reject);
                  } else {
                    setDriverSupport(!!driverObject._support);
                  }
                } else {
                  setDriverSupport(true);
                }
              } catch (e3) {
                reject(e3);
              }
            });
            executeTwoCallbacks(promise, callback, errorCallback);
            return promise;
          };
          LocalForage2.prototype.driver = function driver() {
            return this._driver || null;
          };
          LocalForage2.prototype.getDriver = function getDriver(driverName, callback, errorCallback) {
            var getDriverPromise = DefinedDrivers[driverName] ? Promise$1.resolve(DefinedDrivers[driverName]) : Promise$1.reject(new Error("Driver not found."));
            executeTwoCallbacks(getDriverPromise, callback, errorCallback);
            return getDriverPromise;
          };
          LocalForage2.prototype.getSerializer = function getSerializer(callback) {
            var serializerPromise = Promise$1.resolve(localforageSerializer);
            executeTwoCallbacks(serializerPromise, callback);
            return serializerPromise;
          };
          LocalForage2.prototype.ready = function ready(callback) {
            var self2 = this;
            var promise = self2._driverSet.then(function() {
              if (self2._ready === null) {
                self2._ready = self2._initDriver();
              }
              return self2._ready;
            });
            executeTwoCallbacks(promise, callback, callback);
            return promise;
          };
          LocalForage2.prototype.setDriver = function setDriver(drivers, callback, errorCallback) {
            var self2 = this;
            if (!isArray2(drivers)) {
              drivers = [drivers];
            }
            var supportedDrivers = this._getSupportedDrivers(drivers);
            function setDriverToConfig() {
              self2._config.driver = self2.driver();
            }
            function extendSelfWithDriver(driver) {
              self2._extend(driver);
              setDriverToConfig();
              self2._ready = self2._initStorage(self2._config);
              return self2._ready;
            }
            function initDriver(supportedDrivers2) {
              return function() {
                var currentDriverIndex = 0;
                function driverPromiseLoop() {
                  while (currentDriverIndex < supportedDrivers2.length) {
                    var driverName = supportedDrivers2[currentDriverIndex];
                    currentDriverIndex++;
                    self2._dbInfo = null;
                    self2._ready = null;
                    return self2.getDriver(driverName).then(extendSelfWithDriver)["catch"](driverPromiseLoop);
                  }
                  setDriverToConfig();
                  var error = new Error("No available storage method found.");
                  self2._driverSet = Promise$1.reject(error);
                  return self2._driverSet;
                }
                return driverPromiseLoop();
              };
            }
            var oldDriverSetDone = this._driverSet !== null ? this._driverSet["catch"](function() {
              return Promise$1.resolve();
            }) : Promise$1.resolve();
            this._driverSet = oldDriverSetDone.then(function() {
              var driverName = supportedDrivers[0];
              self2._dbInfo = null;
              self2._ready = null;
              return self2.getDriver(driverName).then(function(driver) {
                self2._driver = driver._driver;
                setDriverToConfig();
                self2._wrapLibraryMethodsWithReady();
                self2._initDriver = initDriver(supportedDrivers);
              });
            })["catch"](function() {
              setDriverToConfig();
              var error = new Error("No available storage method found.");
              self2._driverSet = Promise$1.reject(error);
              return self2._driverSet;
            });
            executeTwoCallbacks(this._driverSet, callback, errorCallback);
            return this._driverSet;
          };
          LocalForage2.prototype.supports = function supports(driverName) {
            return !!DriverSupport[driverName];
          };
          LocalForage2.prototype._extend = function _extend(libraryMethodsAndProperties) {
            extend2(this, libraryMethodsAndProperties);
          };
          LocalForage2.prototype._getSupportedDrivers = function _getSupportedDrivers(drivers) {
            var supportedDrivers = [];
            for (var i3 = 0, len = drivers.length; i3 < len; i3++) {
              var driverName = drivers[i3];
              if (this.supports(driverName)) {
                supportedDrivers.push(driverName);
              }
            }
            return supportedDrivers;
          };
          LocalForage2.prototype._wrapLibraryMethodsWithReady = function _wrapLibraryMethodsWithReady() {
            for (var i3 = 0, len = LibraryMethods.length; i3 < len; i3++) {
              callWhenReady(this, LibraryMethods[i3]);
            }
          };
          LocalForage2.prototype.createInstance = function createInstance2(options) {
            return new LocalForage2(options);
          };
          return LocalForage2;
        }();
        var localforage_js = new LocalForage();
        module3.exports = localforage_js;
      }, { "3": 3 }] }, {}, [4])(4);
    });
  }
});

// node_modules/global-const/dist/lib.js
var require_lib = __commonJS({
  "node_modules/global-const/dist/lib.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.clearGlobalNamespace = exports.getGlobalisedValue = void 0;
    var GLOBALISE_KEY_PREFIX = "globalise__singleton__";
    var fallbackGlobal = {};
    var getGlobalObject = () => {
      if (typeof window !== "undefined") {
        return window;
      }
      if (typeof globalThis !== "undefined") {
        return globalThis;
      }
      return fallbackGlobal;
    };
    var validateInputs = (namespace, key) => {
      if (typeof namespace !== "string") {
        throw "Invalid namespace key";
      }
      if (typeof key !== "string") {
        throw "Invalid item key";
      }
    };
    var createGlobalisedKey = (namespace) => {
      return `${GLOBALISE_KEY_PREFIX}${namespace}`;
    };
    var getGlobalScopedObject = (namespace) => {
      const globalObject = getGlobalObject();
      const GLOBALISE_KEY = createGlobalisedKey(namespace);
      if (!globalObject[GLOBALISE_KEY]) {
        globalObject[GLOBALISE_KEY] = {};
      }
      return globalObject[GLOBALISE_KEY];
    };
    var getSingleton = (namespace, key) => {
      const scopedObject = getGlobalScopedObject(namespace);
      return scopedObject[key] || void 0;
    };
    var setSingleton = (namespace, key, value) => {
      const scopedObject = getGlobalScopedObject(namespace);
      scopedObject[key] = value;
    };
    var getGlobalisedValue = (namespace, key, value) => {
      validateInputs(namespace, key);
      const existing = getSingleton(namespace, key);
      if (existing !== void 0) {
        return existing;
      }
      setSingleton(namespace, key, value);
      return value;
    };
    exports.getGlobalisedValue = getGlobalisedValue;
    var clearGlobalNamespace = (namespace) => {
      const globalObject = getGlobalObject();
      const globalisedKey = createGlobalisedKey(namespace);
      if (globalObject[globalisedKey] !== void 0) {
        delete globalObject[globalisedKey];
      }
    };
    exports.clearGlobalNamespace = clearGlobalNamespace;
  }
});

// node_modules/abitype/dist/esm/version.js
var version;
var init_version = __esm({
  "node_modules/abitype/dist/esm/version.js"() {
    version = "1.0.5";
  }
});

// node_modules/abitype/dist/esm/errors.js
var BaseError;
var init_errors = __esm({
  "node_modules/abitype/dist/esm/errors.js"() {
    init_version();
    BaseError = class _BaseError extends Error {
      constructor(shortMessage, args = {}) {
        const details = args.cause instanceof _BaseError ? args.cause.details : args.cause?.message ? args.cause.message : args.details;
        const docsPath6 = args.cause instanceof _BaseError ? args.cause.docsPath || args.docsPath : args.docsPath;
        const message = [
          shortMessage || "An error occurred.",
          "",
          ...args.metaMessages ? [...args.metaMessages, ""] : [],
          ...docsPath6 ? [`Docs: https://abitype.dev${docsPath6}`] : [],
          ...details ? [`Details: ${details}`] : [],
          `Version: abitype@${version}`
        ].join("\n");
        super(message);
        Object.defineProperty(this, "details", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "docsPath", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "metaMessages", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "shortMessage", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "AbiTypeError"
        });
        if (args.cause)
          this.cause = args.cause;
        this.details = details;
        this.docsPath = docsPath6;
        this.metaMessages = args.metaMessages;
        this.shortMessage = shortMessage;
      }
    };
  }
});

// node_modules/abitype/dist/esm/regex.js
function execTyped(regex, string) {
  const match = regex.exec(string);
  return match?.groups;
}
var bytesRegex, integerRegex, isTupleRegex;
var init_regex = __esm({
  "node_modules/abitype/dist/esm/regex.js"() {
    bytesRegex = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/;
    integerRegex = /^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/;
    isTupleRegex = /^\(.+?\).*?$/;
  }
});

// node_modules/abitype/dist/esm/human-readable/formatAbiParameter.js
function formatAbiParameter(abiParameter) {
  let type = abiParameter.type;
  if (tupleRegex.test(abiParameter.type) && "components" in abiParameter) {
    type = "(";
    const length = abiParameter.components.length;
    for (let i3 = 0; i3 < length; i3++) {
      const component = abiParameter.components[i3];
      type += formatAbiParameter(component);
      if (i3 < length - 1)
        type += ", ";
    }
    const result = execTyped(tupleRegex, abiParameter.type);
    type += `)${result?.array ?? ""}`;
    return formatAbiParameter({
      ...abiParameter,
      type
    });
  }
  if ("indexed" in abiParameter && abiParameter.indexed)
    type = `${type} indexed`;
  if (abiParameter.name)
    return `${type} ${abiParameter.name}`;
  return type;
}
var tupleRegex;
var init_formatAbiParameter = __esm({
  "node_modules/abitype/dist/esm/human-readable/formatAbiParameter.js"() {
    init_regex();
    tupleRegex = /^tuple(?<array>(\[(\d*)\])*)$/;
  }
});

// node_modules/abitype/dist/esm/human-readable/formatAbiParameters.js
function formatAbiParameters(abiParameters) {
  let params = "";
  const length = abiParameters.length;
  for (let i3 = 0; i3 < length; i3++) {
    const abiParameter = abiParameters[i3];
    params += formatAbiParameter(abiParameter);
    if (i3 !== length - 1)
      params += ", ";
  }
  return params;
}
var init_formatAbiParameters = __esm({
  "node_modules/abitype/dist/esm/human-readable/formatAbiParameters.js"() {
    init_formatAbiParameter();
  }
});

// node_modules/abitype/dist/esm/human-readable/formatAbiItem.js
function formatAbiItem(abiItem) {
  if (abiItem.type === "function")
    return `function ${abiItem.name}(${formatAbiParameters(abiItem.inputs)})${abiItem.stateMutability && abiItem.stateMutability !== "nonpayable" ? ` ${abiItem.stateMutability}` : ""}${abiItem.outputs.length ? ` returns (${formatAbiParameters(abiItem.outputs)})` : ""}`;
  if (abiItem.type === "event")
    return `event ${abiItem.name}(${formatAbiParameters(abiItem.inputs)})`;
  if (abiItem.type === "error")
    return `error ${abiItem.name}(${formatAbiParameters(abiItem.inputs)})`;
  if (abiItem.type === "constructor")
    return `constructor(${formatAbiParameters(abiItem.inputs)})${abiItem.stateMutability === "payable" ? " payable" : ""}`;
  if (abiItem.type === "fallback")
    return "fallback()";
  return "receive() external payable";
}
var init_formatAbiItem = __esm({
  "node_modules/abitype/dist/esm/human-readable/formatAbiItem.js"() {
    init_formatAbiParameters();
  }
});

// node_modules/abitype/dist/esm/human-readable/runtime/signatures.js
function isErrorSignature(signature) {
  return errorSignatureRegex.test(signature);
}
function execErrorSignature(signature) {
  return execTyped(errorSignatureRegex, signature);
}
function isEventSignature(signature) {
  return eventSignatureRegex.test(signature);
}
function execEventSignature(signature) {
  return execTyped(eventSignatureRegex, signature);
}
function isFunctionSignature(signature) {
  return functionSignatureRegex.test(signature);
}
function execFunctionSignature(signature) {
  return execTyped(functionSignatureRegex, signature);
}
function isStructSignature(signature) {
  return structSignatureRegex.test(signature);
}
function execStructSignature(signature) {
  return execTyped(structSignatureRegex, signature);
}
function isConstructorSignature(signature) {
  return constructorSignatureRegex.test(signature);
}
function execConstructorSignature(signature) {
  return execTyped(constructorSignatureRegex, signature);
}
function isFallbackSignature(signature) {
  return fallbackSignatureRegex.test(signature);
}
function isReceiveSignature(signature) {
  return receiveSignatureRegex.test(signature);
}
var errorSignatureRegex, eventSignatureRegex, functionSignatureRegex, structSignatureRegex, constructorSignatureRegex, fallbackSignatureRegex, receiveSignatureRegex, modifiers, eventModifiers, functionModifiers;
var init_signatures = __esm({
  "node_modules/abitype/dist/esm/human-readable/runtime/signatures.js"() {
    init_regex();
    errorSignatureRegex = /^error (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)$/;
    eventSignatureRegex = /^event (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)$/;
    functionSignatureRegex = /^function (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)(?: (?<scope>external|public{1}))?(?: (?<stateMutability>pure|view|nonpayable|payable{1}))?(?: returns\s?\((?<returns>.*?)\))?$/;
    structSignatureRegex = /^struct (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*) \{(?<properties>.*?)\}$/;
    constructorSignatureRegex = /^constructor\((?<parameters>.*?)\)(?:\s(?<stateMutability>payable{1}))?$/;
    fallbackSignatureRegex = /^fallback\(\) external(?:\s(?<stateMutability>payable{1}))?$/;
    receiveSignatureRegex = /^receive\(\) external payable$/;
    modifiers = /* @__PURE__ */ new Set([
      "memory",
      "indexed",
      "storage",
      "calldata"
    ]);
    eventModifiers = /* @__PURE__ */ new Set(["indexed"]);
    functionModifiers = /* @__PURE__ */ new Set([
      "calldata",
      "memory",
      "storage"
    ]);
  }
});

// node_modules/abitype/dist/esm/human-readable/errors/abiItem.js
var UnknownTypeError, UnknownSolidityTypeError;
var init_abiItem = __esm({
  "node_modules/abitype/dist/esm/human-readable/errors/abiItem.js"() {
    init_errors();
    UnknownTypeError = class extends BaseError {
      constructor({ type }) {
        super("Unknown type.", {
          metaMessages: [
            `Type "${type}" is not a valid ABI type. Perhaps you forgot to include a struct signature?`
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "UnknownTypeError"
        });
      }
    };
    UnknownSolidityTypeError = class extends BaseError {
      constructor({ type }) {
        super("Unknown type.", {
          metaMessages: [`Type "${type}" is not a valid ABI type.`]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "UnknownSolidityTypeError"
        });
      }
    };
  }
});

// node_modules/abitype/dist/esm/human-readable/errors/abiParameter.js
var InvalidAbiParametersError, InvalidParameterError, SolidityProtectedKeywordError, InvalidModifierError, InvalidFunctionModifierError, InvalidAbiTypeParameterError;
var init_abiParameter = __esm({
  "node_modules/abitype/dist/esm/human-readable/errors/abiParameter.js"() {
    init_errors();
    InvalidAbiParametersError = class extends BaseError {
      constructor({ params }) {
        super("Failed to parse ABI parameters.", {
          details: `parseAbiParameters(${JSON.stringify(params, null, 2)})`,
          docsPath: "/api/human#parseabiparameters-1"
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidAbiParametersError"
        });
      }
    };
    InvalidParameterError = class extends BaseError {
      constructor({ param }) {
        super("Invalid ABI parameter.", {
          details: param
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidParameterError"
        });
      }
    };
    SolidityProtectedKeywordError = class extends BaseError {
      constructor({ param, name }) {
        super("Invalid ABI parameter.", {
          details: param,
          metaMessages: [
            `"${name}" is a protected Solidity keyword. More info: https://docs.soliditylang.org/en/latest/cheatsheet.html`
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "SolidityProtectedKeywordError"
        });
      }
    };
    InvalidModifierError = class extends BaseError {
      constructor({ param, type, modifier }) {
        super("Invalid ABI parameter.", {
          details: param,
          metaMessages: [
            `Modifier "${modifier}" not allowed${type ? ` in "${type}" type` : ""}.`
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidModifierError"
        });
      }
    };
    InvalidFunctionModifierError = class extends BaseError {
      constructor({ param, type, modifier }) {
        super("Invalid ABI parameter.", {
          details: param,
          metaMessages: [
            `Modifier "${modifier}" not allowed${type ? ` in "${type}" type` : ""}.`,
            `Data location can only be specified for array, struct, or mapping types, but "${modifier}" was given.`
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidFunctionModifierError"
        });
      }
    };
    InvalidAbiTypeParameterError = class extends BaseError {
      constructor({ abiParameter }) {
        super("Invalid ABI parameter.", {
          details: JSON.stringify(abiParameter, null, 2),
          metaMessages: ["ABI parameter type is invalid."]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidAbiTypeParameterError"
        });
      }
    };
  }
});

// node_modules/abitype/dist/esm/human-readable/errors/signature.js
var InvalidSignatureError, UnknownSignatureError, InvalidStructSignatureError;
var init_signature = __esm({
  "node_modules/abitype/dist/esm/human-readable/errors/signature.js"() {
    init_errors();
    InvalidSignatureError = class extends BaseError {
      constructor({ signature, type }) {
        super(`Invalid ${type} signature.`, {
          details: signature
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidSignatureError"
        });
      }
    };
    UnknownSignatureError = class extends BaseError {
      constructor({ signature }) {
        super("Unknown signature.", {
          details: signature
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "UnknownSignatureError"
        });
      }
    };
    InvalidStructSignatureError = class extends BaseError {
      constructor({ signature }) {
        super("Invalid struct signature.", {
          details: signature,
          metaMessages: ["No properties exist."]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidStructSignatureError"
        });
      }
    };
  }
});

// node_modules/abitype/dist/esm/human-readable/errors/struct.js
var CircularReferenceError;
var init_struct = __esm({
  "node_modules/abitype/dist/esm/human-readable/errors/struct.js"() {
    init_errors();
    CircularReferenceError = class extends BaseError {
      constructor({ type }) {
        super("Circular reference detected.", {
          metaMessages: [`Struct "${type}" is a circular reference.`]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "CircularReferenceError"
        });
      }
    };
  }
});

// node_modules/abitype/dist/esm/human-readable/errors/splitParameters.js
var InvalidParenthesisError;
var init_splitParameters = __esm({
  "node_modules/abitype/dist/esm/human-readable/errors/splitParameters.js"() {
    init_errors();
    InvalidParenthesisError = class extends BaseError {
      constructor({ current, depth }) {
        super("Unbalanced parentheses.", {
          metaMessages: [
            `"${current.trim()}" has too many ${depth > 0 ? "opening" : "closing"} parentheses.`
          ],
          details: `Depth "${depth}"`
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidParenthesisError"
        });
      }
    };
  }
});

// node_modules/abitype/dist/esm/human-readable/runtime/cache.js
function getParameterCacheKey(param, type) {
  if (type)
    return `${type}:${param}`;
  return param;
}
var parameterCache;
var init_cache = __esm({
  "node_modules/abitype/dist/esm/human-readable/runtime/cache.js"() {
    parameterCache = /* @__PURE__ */ new Map([
      // Unnamed
      ["address", { type: "address" }],
      ["bool", { type: "bool" }],
      ["bytes", { type: "bytes" }],
      ["bytes32", { type: "bytes32" }],
      ["int", { type: "int256" }],
      ["int256", { type: "int256" }],
      ["string", { type: "string" }],
      ["uint", { type: "uint256" }],
      ["uint8", { type: "uint8" }],
      ["uint16", { type: "uint16" }],
      ["uint24", { type: "uint24" }],
      ["uint32", { type: "uint32" }],
      ["uint64", { type: "uint64" }],
      ["uint96", { type: "uint96" }],
      ["uint112", { type: "uint112" }],
      ["uint160", { type: "uint160" }],
      ["uint192", { type: "uint192" }],
      ["uint256", { type: "uint256" }],
      // Named
      ["address owner", { type: "address", name: "owner" }],
      ["address to", { type: "address", name: "to" }],
      ["bool approved", { type: "bool", name: "approved" }],
      ["bytes _data", { type: "bytes", name: "_data" }],
      ["bytes data", { type: "bytes", name: "data" }],
      ["bytes signature", { type: "bytes", name: "signature" }],
      ["bytes32 hash", { type: "bytes32", name: "hash" }],
      ["bytes32 r", { type: "bytes32", name: "r" }],
      ["bytes32 root", { type: "bytes32", name: "root" }],
      ["bytes32 s", { type: "bytes32", name: "s" }],
      ["string name", { type: "string", name: "name" }],
      ["string symbol", { type: "string", name: "symbol" }],
      ["string tokenURI", { type: "string", name: "tokenURI" }],
      ["uint tokenId", { type: "uint256", name: "tokenId" }],
      ["uint8 v", { type: "uint8", name: "v" }],
      ["uint256 balance", { type: "uint256", name: "balance" }],
      ["uint256 tokenId", { type: "uint256", name: "tokenId" }],
      ["uint256 value", { type: "uint256", name: "value" }],
      // Indexed
      [
        "event:address indexed from",
        { type: "address", name: "from", indexed: true }
      ],
      ["event:address indexed to", { type: "address", name: "to", indexed: true }],
      [
        "event:uint indexed tokenId",
        { type: "uint256", name: "tokenId", indexed: true }
      ],
      [
        "event:uint256 indexed tokenId",
        { type: "uint256", name: "tokenId", indexed: true }
      ]
    ]);
  }
});

// node_modules/abitype/dist/esm/human-readable/runtime/utils.js
function parseSignature(signature, structs = {}) {
  if (isFunctionSignature(signature)) {
    const match = execFunctionSignature(signature);
    if (!match)
      throw new InvalidSignatureError({ signature, type: "function" });
    const inputParams = splitParameters(match.parameters);
    const inputs = [];
    const inputLength = inputParams.length;
    for (let i3 = 0; i3 < inputLength; i3++) {
      inputs.push(parseAbiParameter(inputParams[i3], {
        modifiers: functionModifiers,
        structs,
        type: "function"
      }));
    }
    const outputs = [];
    if (match.returns) {
      const outputParams = splitParameters(match.returns);
      const outputLength = outputParams.length;
      for (let i3 = 0; i3 < outputLength; i3++) {
        outputs.push(parseAbiParameter(outputParams[i3], {
          modifiers: functionModifiers,
          structs,
          type: "function"
        }));
      }
    }
    return {
      name: match.name,
      type: "function",
      stateMutability: match.stateMutability ?? "nonpayable",
      inputs,
      outputs
    };
  }
  if (isEventSignature(signature)) {
    const match = execEventSignature(signature);
    if (!match)
      throw new InvalidSignatureError({ signature, type: "event" });
    const params = splitParameters(match.parameters);
    const abiParameters = [];
    const length = params.length;
    for (let i3 = 0; i3 < length; i3++) {
      abiParameters.push(parseAbiParameter(params[i3], {
        modifiers: eventModifiers,
        structs,
        type: "event"
      }));
    }
    return { name: match.name, type: "event", inputs: abiParameters };
  }
  if (isErrorSignature(signature)) {
    const match = execErrorSignature(signature);
    if (!match)
      throw new InvalidSignatureError({ signature, type: "error" });
    const params = splitParameters(match.parameters);
    const abiParameters = [];
    const length = params.length;
    for (let i3 = 0; i3 < length; i3++) {
      abiParameters.push(parseAbiParameter(params[i3], { structs, type: "error" }));
    }
    return { name: match.name, type: "error", inputs: abiParameters };
  }
  if (isConstructorSignature(signature)) {
    const match = execConstructorSignature(signature);
    if (!match)
      throw new InvalidSignatureError({ signature, type: "constructor" });
    const params = splitParameters(match.parameters);
    const abiParameters = [];
    const length = params.length;
    for (let i3 = 0; i3 < length; i3++) {
      abiParameters.push(parseAbiParameter(params[i3], { structs, type: "constructor" }));
    }
    return {
      type: "constructor",
      stateMutability: match.stateMutability ?? "nonpayable",
      inputs: abiParameters
    };
  }
  if (isFallbackSignature(signature))
    return { type: "fallback" };
  if (isReceiveSignature(signature))
    return {
      type: "receive",
      stateMutability: "payable"
    };
  throw new UnknownSignatureError({ signature });
}
function parseAbiParameter(param, options) {
  const parameterCacheKey = getParameterCacheKey(param, options?.type);
  if (parameterCache.has(parameterCacheKey))
    return parameterCache.get(parameterCacheKey);
  const isTuple = isTupleRegex.test(param);
  const match = execTyped(isTuple ? abiParameterWithTupleRegex : abiParameterWithoutTupleRegex, param);
  if (!match)
    throw new InvalidParameterError({ param });
  if (match.name && isSolidityKeyword(match.name))
    throw new SolidityProtectedKeywordError({ param, name: match.name });
  const name = match.name ? { name: match.name } : {};
  const indexed = match.modifier === "indexed" ? { indexed: true } : {};
  const structs = options?.structs ?? {};
  let type;
  let components = {};
  if (isTuple) {
    type = "tuple";
    const params = splitParameters(match.type);
    const components_ = [];
    const length = params.length;
    for (let i3 = 0; i3 < length; i3++) {
      components_.push(parseAbiParameter(params[i3], { structs }));
    }
    components = { components: components_ };
  } else if (match.type in structs) {
    type = "tuple";
    components = { components: structs[match.type] };
  } else if (dynamicIntegerRegex.test(match.type)) {
    type = `${match.type}256`;
  } else {
    type = match.type;
    if (!(options?.type === "struct") && !isSolidityType(type))
      throw new UnknownSolidityTypeError({ type });
  }
  if (match.modifier) {
    if (!options?.modifiers?.has?.(match.modifier))
      throw new InvalidModifierError({
        param,
        type: options?.type,
        modifier: match.modifier
      });
    if (functionModifiers.has(match.modifier) && !isValidDataLocation(type, !!match.array))
      throw new InvalidFunctionModifierError({
        param,
        type: options?.type,
        modifier: match.modifier
      });
  }
  const abiParameter = {
    type: `${type}${match.array ?? ""}`,
    ...name,
    ...indexed,
    ...components
  };
  parameterCache.set(parameterCacheKey, abiParameter);
  return abiParameter;
}
function splitParameters(params, result = [], current = "", depth = 0) {
  const length = params.trim().length;
  for (let i3 = 0; i3 < length; i3++) {
    const char = params[i3];
    const tail = params.slice(i3 + 1);
    switch (char) {
      case ",":
        return depth === 0 ? splitParameters(tail, [...result, current.trim()]) : splitParameters(tail, result, `${current}${char}`, depth);
      case "(":
        return splitParameters(tail, result, `${current}${char}`, depth + 1);
      case ")":
        return splitParameters(tail, result, `${current}${char}`, depth - 1);
      default:
        return splitParameters(tail, result, `${current}${char}`, depth);
    }
  }
  if (current === "")
    return result;
  if (depth !== 0)
    throw new InvalidParenthesisError({ current, depth });
  result.push(current.trim());
  return result;
}
function isSolidityType(type) {
  return type === "address" || type === "bool" || type === "function" || type === "string" || bytesRegex.test(type) || integerRegex.test(type);
}
function isSolidityKeyword(name) {
  return name === "address" || name === "bool" || name === "function" || name === "string" || name === "tuple" || bytesRegex.test(name) || integerRegex.test(name) || protectedKeywordsRegex.test(name);
}
function isValidDataLocation(type, isArray2) {
  return isArray2 || type === "bytes" || type === "string" || type === "tuple";
}
var abiParameterWithoutTupleRegex, abiParameterWithTupleRegex, dynamicIntegerRegex, protectedKeywordsRegex;
var init_utils = __esm({
  "node_modules/abitype/dist/esm/human-readable/runtime/utils.js"() {
    init_regex();
    init_abiItem();
    init_abiParameter();
    init_signature();
    init_splitParameters();
    init_cache();
    init_signatures();
    abiParameterWithoutTupleRegex = /^(?<type>[a-zA-Z$_][a-zA-Z0-9$_]*)(?<array>(?:\[\d*?\])+?)?(?:\s(?<modifier>calldata|indexed|memory|storage{1}))?(?:\s(?<name>[a-zA-Z$_][a-zA-Z0-9$_]*))?$/;
    abiParameterWithTupleRegex = /^\((?<type>.+?)\)(?<array>(?:\[\d*?\])+?)?(?:\s(?<modifier>calldata|indexed|memory|storage{1}))?(?:\s(?<name>[a-zA-Z$_][a-zA-Z0-9$_]*))?$/;
    dynamicIntegerRegex = /^u?int$/;
    protectedKeywordsRegex = /^(?:after|alias|anonymous|apply|auto|byte|calldata|case|catch|constant|copyof|default|defined|error|event|external|false|final|function|immutable|implements|in|indexed|inline|internal|let|mapping|match|memory|mutable|null|of|override|partial|private|promise|public|pure|reference|relocatable|return|returns|sizeof|static|storage|struct|super|supports|switch|this|true|try|typedef|typeof|var|view|virtual)$/;
  }
});

// node_modules/abitype/dist/esm/human-readable/runtime/structs.js
function parseStructs(signatures) {
  const shallowStructs = {};
  const signaturesLength = signatures.length;
  for (let i3 = 0; i3 < signaturesLength; i3++) {
    const signature = signatures[i3];
    if (!isStructSignature(signature))
      continue;
    const match = execStructSignature(signature);
    if (!match)
      throw new InvalidSignatureError({ signature, type: "struct" });
    const properties = match.properties.split(";");
    const components = [];
    const propertiesLength = properties.length;
    for (let k5 = 0; k5 < propertiesLength; k5++) {
      const property = properties[k5];
      const trimmed = property.trim();
      if (!trimmed)
        continue;
      const abiParameter = parseAbiParameter(trimmed, {
        type: "struct"
      });
      components.push(abiParameter);
    }
    if (!components.length)
      throw new InvalidStructSignatureError({ signature });
    shallowStructs[match.name] = components;
  }
  const resolvedStructs = {};
  const entries = Object.entries(shallowStructs);
  const entriesLength = entries.length;
  for (let i3 = 0; i3 < entriesLength; i3++) {
    const [name, parameters] = entries[i3];
    resolvedStructs[name] = resolveStructs(parameters, shallowStructs);
  }
  return resolvedStructs;
}
function resolveStructs(abiParameters, structs, ancestors = /* @__PURE__ */ new Set()) {
  const components = [];
  const length = abiParameters.length;
  for (let i3 = 0; i3 < length; i3++) {
    const abiParameter = abiParameters[i3];
    const isTuple = isTupleRegex.test(abiParameter.type);
    if (isTuple)
      components.push(abiParameter);
    else {
      const match = execTyped(typeWithoutTupleRegex, abiParameter.type);
      if (!match?.type)
        throw new InvalidAbiTypeParameterError({ abiParameter });
      const { array, type } = match;
      if (type in structs) {
        if (ancestors.has(type))
          throw new CircularReferenceError({ type });
        components.push({
          ...abiParameter,
          type: `tuple${array ?? ""}`,
          components: resolveStructs(structs[type] ?? [], structs, /* @__PURE__ */ new Set([...ancestors, type]))
        });
      } else {
        if (isSolidityType(type))
          components.push(abiParameter);
        else
          throw new UnknownTypeError({ type });
      }
    }
  }
  return components;
}
var typeWithoutTupleRegex;
var init_structs = __esm({
  "node_modules/abitype/dist/esm/human-readable/runtime/structs.js"() {
    init_regex();
    init_abiItem();
    init_abiParameter();
    init_signature();
    init_struct();
    init_signatures();
    init_utils();
    typeWithoutTupleRegex = /^(?<type>[a-zA-Z$_][a-zA-Z0-9$_]*)(?<array>(?:\[\d*?\])+?)?$/;
  }
});

// node_modules/abitype/dist/esm/human-readable/parseAbi.js
function parseAbi(signatures) {
  const structs = parseStructs(signatures);
  const abi2 = [];
  const length = signatures.length;
  for (let i3 = 0; i3 < length; i3++) {
    const signature = signatures[i3];
    if (isStructSignature(signature))
      continue;
    abi2.push(parseSignature(signature, structs));
  }
  return abi2;
}
var init_parseAbi = __esm({
  "node_modules/abitype/dist/esm/human-readable/parseAbi.js"() {
    init_signatures();
    init_structs();
    init_utils();
  }
});

// node_modules/abitype/dist/esm/human-readable/parseAbiParameters.js
function parseAbiParameters(params) {
  const abiParameters = [];
  if (typeof params === "string") {
    const parameters = splitParameters(params);
    const length = parameters.length;
    for (let i3 = 0; i3 < length; i3++) {
      abiParameters.push(parseAbiParameter(parameters[i3], { modifiers }));
    }
  } else {
    const structs = parseStructs(params);
    const length = params.length;
    for (let i3 = 0; i3 < length; i3++) {
      const signature = params[i3];
      if (isStructSignature(signature))
        continue;
      const parameters = splitParameters(signature);
      const length2 = parameters.length;
      for (let k5 = 0; k5 < length2; k5++) {
        abiParameters.push(parseAbiParameter(parameters[k5], { modifiers, structs }));
      }
    }
  }
  if (abiParameters.length === 0)
    throw new InvalidAbiParametersError({ params });
  return abiParameters;
}
var init_parseAbiParameters = __esm({
  "node_modules/abitype/dist/esm/human-readable/parseAbiParameters.js"() {
    init_abiParameter();
    init_signatures();
    init_structs();
    init_utils();
    init_utils();
  }
});

// node_modules/abitype/dist/esm/exports/index.js
var init_exports = __esm({
  "node_modules/abitype/dist/esm/exports/index.js"() {
    init_formatAbiItem();
    init_parseAbi();
    init_parseAbiParameters();
  }
});

// node_modules/viem/_esm/utils/abi/formatAbiItem.js
function formatAbiItem2(abiItem, { includeName = false } = {}) {
  if (abiItem.type !== "function" && abiItem.type !== "event" && abiItem.type !== "error")
    throw new InvalidDefinitionTypeError(abiItem.type);
  return `${abiItem.name}(${formatAbiParams(abiItem.inputs, { includeName })})`;
}
function formatAbiParams(params, { includeName = false } = {}) {
  if (!params)
    return "";
  return params.map((param) => formatAbiParam(param, { includeName })).join(includeName ? ", " : ",");
}
function formatAbiParam(param, { includeName }) {
  if (param.type.startsWith("tuple")) {
    return `(${formatAbiParams(param.components, { includeName })})${param.type.slice("tuple".length)}`;
  }
  return param.type + (includeName && param.name ? ` ${param.name}` : "");
}
var init_formatAbiItem2 = __esm({
  "node_modules/viem/_esm/utils/abi/formatAbiItem.js"() {
    init_abi();
  }
});

// node_modules/viem/_esm/utils/data/isHex.js
function isHex(value, { strict = true } = {}) {
  if (!value)
    return false;
  if (typeof value !== "string")
    return false;
  return strict ? /^0x[0-9a-fA-F]*$/.test(value) : value.startsWith("0x");
}
var init_isHex = __esm({
  "node_modules/viem/_esm/utils/data/isHex.js"() {
  }
});

// node_modules/viem/_esm/utils/data/size.js
function size(value) {
  if (isHex(value, { strict: false }))
    return Math.ceil((value.length - 2) / 2);
  return value.length;
}
var init_size = __esm({
  "node_modules/viem/_esm/utils/data/size.js"() {
    init_isHex();
  }
});

// node_modules/viem/_esm/errors/version.js
var version2;
var init_version2 = __esm({
  "node_modules/viem/_esm/errors/version.js"() {
    version2 = "2.18.8";
  }
});

// node_modules/viem/_esm/errors/utils.js
var getContractAddress, getUrl, getVersion;
var init_utils2 = __esm({
  "node_modules/viem/_esm/errors/utils.js"() {
    init_version2();
    getContractAddress = (address) => address;
    getUrl = (url) => url;
    getVersion = () => `viem@${version2}`;
  }
});

// node_modules/viem/_esm/errors/base.js
function walk(err, fn2) {
  if (fn2?.(err))
    return err;
  if (err && typeof err === "object" && "cause" in err)
    return walk(err.cause, fn2);
  return fn2 ? null : err;
}
var BaseError2;
var init_base = __esm({
  "node_modules/viem/_esm/errors/base.js"() {
    init_utils2();
    BaseError2 = class _BaseError extends Error {
      constructor(shortMessage, args = {}) {
        const details = args.cause instanceof _BaseError ? args.cause.details : args.cause?.message ? args.cause.message : args.details;
        const docsPath6 = args.cause instanceof _BaseError ? args.cause.docsPath || args.docsPath : args.docsPath;
        const version3 = getVersion();
        const message = [
          shortMessage || "An error occurred.",
          "",
          ...args.metaMessages ? [...args.metaMessages, ""] : [],
          ...docsPath6 ? [
            `Docs: ${args.docsBaseUrl ?? "https://viem.sh"}${docsPath6}${args.docsSlug ? `#${args.docsSlug}` : ""}`
          ] : [],
          ...details ? [`Details: ${details}`] : [],
          `Version: ${version3}`
        ].join("\n");
        super(message, args.cause ? { cause: args.cause } : void 0);
        Object.defineProperty(this, "details", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "docsPath", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "metaMessages", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "shortMessage", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "version", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "ViemError"
        });
        this.details = details;
        this.docsPath = docsPath6;
        this.metaMessages = args.metaMessages;
        this.shortMessage = shortMessage;
        this.version = version3;
      }
      walk(fn2) {
        return walk(this, fn2);
      }
    };
  }
});

// node_modules/viem/_esm/errors/abi.js
var AbiConstructorNotFoundError, AbiConstructorParamsNotFoundError, AbiDecodingDataSizeTooSmallError, AbiDecodingZeroDataError, AbiEncodingArrayLengthMismatchError, AbiEncodingBytesSizeMismatchError, AbiEncodingLengthMismatchError, AbiErrorSignatureNotFoundError, AbiEventSignatureEmptyTopicsError, AbiEventSignatureNotFoundError, AbiEventNotFoundError, AbiFunctionNotFoundError, AbiFunctionOutputsNotFoundError, AbiItemAmbiguityError, BytesSizeMismatchError, DecodeLogDataMismatch, DecodeLogTopicsMismatch, InvalidAbiEncodingTypeError, InvalidAbiDecodingTypeError, InvalidArrayError, InvalidDefinitionTypeError, UnsupportedPackedAbiType;
var init_abi = __esm({
  "node_modules/viem/_esm/errors/abi.js"() {
    init_formatAbiItem2();
    init_size();
    init_base();
    AbiConstructorNotFoundError = class extends BaseError2 {
      constructor({ docsPath: docsPath6 }) {
        super([
          "A constructor was not found on the ABI.",
          "Make sure you are using the correct ABI and that the constructor exists on it."
        ].join("\n"), {
          docsPath: docsPath6
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "AbiConstructorNotFoundError"
        });
      }
    };
    AbiConstructorParamsNotFoundError = class extends BaseError2 {
      constructor({ docsPath: docsPath6 }) {
        super([
          "Constructor arguments were provided (`args`), but a constructor parameters (`inputs`) were not found on the ABI.",
          "Make sure you are using the correct ABI, and that the `inputs` attribute on the constructor exists."
        ].join("\n"), {
          docsPath: docsPath6
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "AbiConstructorParamsNotFoundError"
        });
      }
    };
    AbiDecodingDataSizeTooSmallError = class extends BaseError2 {
      constructor({ data, params, size: size3 }) {
        super([`Data size of ${size3} bytes is too small for given parameters.`].join("\n"), {
          metaMessages: [
            `Params: (${formatAbiParams(params, { includeName: true })})`,
            `Data:   ${data} (${size3} bytes)`
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "AbiDecodingDataSizeTooSmallError"
        });
        Object.defineProperty(this, "data", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "params", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "size", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.data = data;
        this.params = params;
        this.size = size3;
      }
    };
    AbiDecodingZeroDataError = class extends BaseError2 {
      constructor() {
        super('Cannot decode zero data ("0x") with ABI parameters.');
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "AbiDecodingZeroDataError"
        });
      }
    };
    AbiEncodingArrayLengthMismatchError = class extends BaseError2 {
      constructor({ expectedLength, givenLength, type }) {
        super([
          `ABI encoding array length mismatch for type ${type}.`,
          `Expected length: ${expectedLength}`,
          `Given length: ${givenLength}`
        ].join("\n"));
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "AbiEncodingArrayLengthMismatchError"
        });
      }
    };
    AbiEncodingBytesSizeMismatchError = class extends BaseError2 {
      constructor({ expectedSize, value }) {
        super(`Size of bytes "${value}" (bytes${size(value)}) does not match expected size (bytes${expectedSize}).`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "AbiEncodingBytesSizeMismatchError"
        });
      }
    };
    AbiEncodingLengthMismatchError = class extends BaseError2 {
      constructor({ expectedLength, givenLength }) {
        super([
          "ABI encoding params/values length mismatch.",
          `Expected length (params): ${expectedLength}`,
          `Given length (values): ${givenLength}`
        ].join("\n"));
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "AbiEncodingLengthMismatchError"
        });
      }
    };
    AbiErrorSignatureNotFoundError = class extends BaseError2 {
      constructor(signature, { docsPath: docsPath6 }) {
        super([
          `Encoded error signature "${signature}" not found on ABI.`,
          "Make sure you are using the correct ABI and that the error exists on it.",
          `You can look up the decoded signature here: https://openchain.xyz/signatures?query=${signature}.`
        ].join("\n"), {
          docsPath: docsPath6
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "AbiErrorSignatureNotFoundError"
        });
        Object.defineProperty(this, "signature", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.signature = signature;
      }
    };
    AbiEventSignatureEmptyTopicsError = class extends BaseError2 {
      constructor({ docsPath: docsPath6 }) {
        super("Cannot extract event signature from empty topics.", {
          docsPath: docsPath6
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "AbiEventSignatureEmptyTopicsError"
        });
      }
    };
    AbiEventSignatureNotFoundError = class extends BaseError2 {
      constructor(signature, { docsPath: docsPath6 }) {
        super([
          `Encoded event signature "${signature}" not found on ABI.`,
          "Make sure you are using the correct ABI and that the event exists on it.",
          `You can look up the signature here: https://openchain.xyz/signatures?query=${signature}.`
        ].join("\n"), {
          docsPath: docsPath6
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "AbiEventSignatureNotFoundError"
        });
      }
    };
    AbiEventNotFoundError = class extends BaseError2 {
      constructor(eventName, { docsPath: docsPath6 } = {}) {
        super([
          `Event ${eventName ? `"${eventName}" ` : ""}not found on ABI.`,
          "Make sure you are using the correct ABI and that the event exists on it."
        ].join("\n"), {
          docsPath: docsPath6
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "AbiEventNotFoundError"
        });
      }
    };
    AbiFunctionNotFoundError = class extends BaseError2 {
      constructor(functionName, { docsPath: docsPath6 } = {}) {
        super([
          `Function ${functionName ? `"${functionName}" ` : ""}not found on ABI.`,
          "Make sure you are using the correct ABI and that the function exists on it."
        ].join("\n"), {
          docsPath: docsPath6
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "AbiFunctionNotFoundError"
        });
      }
    };
    AbiFunctionOutputsNotFoundError = class extends BaseError2 {
      constructor(functionName, { docsPath: docsPath6 }) {
        super([
          `Function "${functionName}" does not contain any \`outputs\` on ABI.`,
          "Cannot decode function result without knowing what the parameter types are.",
          "Make sure you are using the correct ABI and that the function exists on it."
        ].join("\n"), {
          docsPath: docsPath6
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "AbiFunctionOutputsNotFoundError"
        });
      }
    };
    AbiItemAmbiguityError = class extends BaseError2 {
      constructor(x4, y4) {
        super("Found ambiguous types in overloaded ABI items.", {
          metaMessages: [
            `\`${x4.type}\` in \`${formatAbiItem2(x4.abiItem)}\`, and`,
            `\`${y4.type}\` in \`${formatAbiItem2(y4.abiItem)}\``,
            "",
            "These types encode differently and cannot be distinguished at runtime.",
            "Remove one of the ambiguous items in the ABI."
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "AbiItemAmbiguityError"
        });
      }
    };
    BytesSizeMismatchError = class extends BaseError2 {
      constructor({ expectedSize, givenSize }) {
        super(`Expected bytes${expectedSize}, got bytes${givenSize}.`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "BytesSizeMismatchError"
        });
      }
    };
    DecodeLogDataMismatch = class extends BaseError2 {
      constructor({ abiItem, data, params, size: size3 }) {
        super([
          `Data size of ${size3} bytes is too small for non-indexed event parameters.`
        ].join("\n"), {
          metaMessages: [
            `Params: (${formatAbiParams(params, { includeName: true })})`,
            `Data:   ${data} (${size3} bytes)`
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "DecodeLogDataMismatch"
        });
        Object.defineProperty(this, "abiItem", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "data", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "params", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "size", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.abiItem = abiItem;
        this.data = data;
        this.params = params;
        this.size = size3;
      }
    };
    DecodeLogTopicsMismatch = class extends BaseError2 {
      constructor({ abiItem, param }) {
        super([
          `Expected a topic for indexed event parameter${param.name ? ` "${param.name}"` : ""} on event "${formatAbiItem2(abiItem, { includeName: true })}".`
        ].join("\n"));
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "DecodeLogTopicsMismatch"
        });
        Object.defineProperty(this, "abiItem", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.abiItem = abiItem;
      }
    };
    InvalidAbiEncodingTypeError = class extends BaseError2 {
      constructor(type, { docsPath: docsPath6 }) {
        super([
          `Type "${type}" is not a valid encoding type.`,
          "Please provide a valid ABI type."
        ].join("\n"), { docsPath: docsPath6 });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidAbiEncodingType"
        });
      }
    };
    InvalidAbiDecodingTypeError = class extends BaseError2 {
      constructor(type, { docsPath: docsPath6 }) {
        super([
          `Type "${type}" is not a valid decoding type.`,
          "Please provide a valid ABI type."
        ].join("\n"), { docsPath: docsPath6 });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidAbiDecodingType"
        });
      }
    };
    InvalidArrayError = class extends BaseError2 {
      constructor(value) {
        super([`Value "${value}" is not a valid array.`].join("\n"));
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidArrayError"
        });
      }
    };
    InvalidDefinitionTypeError = class extends BaseError2 {
      constructor(type) {
        super([
          `"${type}" is not a valid definition type.`,
          'Valid types: "function", "event", "error"'
        ].join("\n"));
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidDefinitionTypeError"
        });
      }
    };
    UnsupportedPackedAbiType = class extends BaseError2 {
      constructor(type) {
        super(`Type "${type}" is not supported for packed encoding.`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "UnsupportedPackedAbiType"
        });
      }
    };
  }
});

// node_modules/viem/_esm/errors/data.js
var SliceOffsetOutOfBoundsError, SizeExceedsPaddingSizeError, InvalidBytesLengthError;
var init_data = __esm({
  "node_modules/viem/_esm/errors/data.js"() {
    init_base();
    SliceOffsetOutOfBoundsError = class extends BaseError2 {
      constructor({ offset, position, size: size3 }) {
        super(`Slice ${position === "start" ? "starting" : "ending"} at offset "${offset}" is out-of-bounds (size: ${size3}).`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "SliceOffsetOutOfBoundsError"
        });
      }
    };
    SizeExceedsPaddingSizeError = class extends BaseError2 {
      constructor({ size: size3, targetSize, type }) {
        super(`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} size (${size3}) exceeds padding size (${targetSize}).`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "SizeExceedsPaddingSizeError"
        });
      }
    };
    InvalidBytesLengthError = class extends BaseError2 {
      constructor({ size: size3, targetSize, type }) {
        super(`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} is expected to be ${targetSize} ${type} long, but is ${size3} ${type} long.`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidBytesLengthError"
        });
      }
    };
  }
});

// node_modules/viem/_esm/utils/data/pad.js
function pad(hexOrBytes, { dir, size: size3 = 32 } = {}) {
  if (typeof hexOrBytes === "string")
    return padHex(hexOrBytes, { dir, size: size3 });
  return padBytes(hexOrBytes, { dir, size: size3 });
}
function padHex(hex_, { dir, size: size3 = 32 } = {}) {
  if (size3 === null)
    return hex_;
  const hex = hex_.replace("0x", "");
  if (hex.length > size3 * 2)
    throw new SizeExceedsPaddingSizeError({
      size: Math.ceil(hex.length / 2),
      targetSize: size3,
      type: "hex"
    });
  return `0x${hex[dir === "right" ? "padEnd" : "padStart"](size3 * 2, "0")}`;
}
function padBytes(bytes2, { dir, size: size3 = 32 } = {}) {
  if (size3 === null)
    return bytes2;
  if (bytes2.length > size3)
    throw new SizeExceedsPaddingSizeError({
      size: bytes2.length,
      targetSize: size3,
      type: "bytes"
    });
  const paddedBytes = new Uint8Array(size3);
  for (let i3 = 0; i3 < size3; i3++) {
    const padEnd = dir === "right";
    paddedBytes[padEnd ? i3 : size3 - i3 - 1] = bytes2[padEnd ? i3 : bytes2.length - i3 - 1];
  }
  return paddedBytes;
}
var init_pad = __esm({
  "node_modules/viem/_esm/utils/data/pad.js"() {
    init_data();
  }
});

// node_modules/viem/_esm/errors/encoding.js
var IntegerOutOfRangeError, InvalidBytesBooleanError, SizeOverflowError;
var init_encoding = __esm({
  "node_modules/viem/_esm/errors/encoding.js"() {
    init_base();
    IntegerOutOfRangeError = class extends BaseError2 {
      constructor({ max, min, signed, size: size3, value }) {
        super(`Number "${value}" is not in safe ${size3 ? `${size3 * 8}-bit ${signed ? "signed" : "unsigned"} ` : ""}integer range ${max ? `(${min} to ${max})` : `(above ${min})`}`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "IntegerOutOfRangeError"
        });
      }
    };
    InvalidBytesBooleanError = class extends BaseError2 {
      constructor(bytes2) {
        super(`Bytes value "${bytes2}" is not a valid boolean. The bytes array must contain a single byte of either a 0 or 1 value.`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidBytesBooleanError"
        });
      }
    };
    SizeOverflowError = class extends BaseError2 {
      constructor({ givenSize, maxSize }) {
        super(`Size cannot exceed ${maxSize} bytes. Given size: ${givenSize} bytes.`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "SizeOverflowError"
        });
      }
    };
  }
});

// node_modules/viem/_esm/utils/data/trim.js
function trim2(hexOrBytes, { dir = "left" } = {}) {
  let data = typeof hexOrBytes === "string" ? hexOrBytes.replace("0x", "") : hexOrBytes;
  let sliceLength = 0;
  for (let i3 = 0; i3 < data.length - 1; i3++) {
    if (data[dir === "left" ? i3 : data.length - i3 - 1].toString() === "0")
      sliceLength++;
    else
      break;
  }
  data = dir === "left" ? data.slice(sliceLength) : data.slice(0, data.length - sliceLength);
  if (typeof hexOrBytes === "string") {
    if (data.length === 1 && dir === "right")
      data = `${data}0`;
    return `0x${data.length % 2 === 1 ? `0${data}` : data}`;
  }
  return data;
}
var init_trim = __esm({
  "node_modules/viem/_esm/utils/data/trim.js"() {
  }
});

// node_modules/viem/_esm/utils/encoding/fromHex.js
function assertSize(hexOrBytes, { size: size3 }) {
  if (size(hexOrBytes) > size3)
    throw new SizeOverflowError({
      givenSize: size(hexOrBytes),
      maxSize: size3
    });
}
function hexToBigInt(hex, opts = {}) {
  const { signed } = opts;
  if (opts.size)
    assertSize(hex, { size: opts.size });
  const value = BigInt(hex);
  if (!signed)
    return value;
  const size3 = (hex.length - 2) / 2;
  const max = (1n << BigInt(size3) * 8n - 1n) - 1n;
  if (value <= max)
    return value;
  return value - BigInt(`0x${"f".padStart(size3 * 2, "f")}`) - 1n;
}
function hexToNumber(hex, opts = {}) {
  return Number(hexToBigInt(hex, opts));
}
var init_fromHex = __esm({
  "node_modules/viem/_esm/utils/encoding/fromHex.js"() {
    init_encoding();
    init_size();
  }
});

// node_modules/viem/_esm/utils/encoding/toHex.js
function toHex(value, opts = {}) {
  if (typeof value === "number" || typeof value === "bigint")
    return numberToHex(value, opts);
  if (typeof value === "string") {
    return stringToHex(value, opts);
  }
  if (typeof value === "boolean")
    return boolToHex(value, opts);
  return bytesToHex(value, opts);
}
function boolToHex(value, opts = {}) {
  const hex = `0x${Number(value)}`;
  if (typeof opts.size === "number") {
    assertSize(hex, { size: opts.size });
    return pad(hex, { size: opts.size });
  }
  return hex;
}
function bytesToHex(value, opts = {}) {
  let string = "";
  for (let i3 = 0; i3 < value.length; i3++) {
    string += hexes[value[i3]];
  }
  const hex = `0x${string}`;
  if (typeof opts.size === "number") {
    assertSize(hex, { size: opts.size });
    return pad(hex, { dir: "right", size: opts.size });
  }
  return hex;
}
function numberToHex(value_, opts = {}) {
  const { signed, size: size3 } = opts;
  const value = BigInt(value_);
  let maxValue;
  if (size3) {
    if (signed)
      maxValue = (1n << BigInt(size3) * 8n - 1n) - 1n;
    else
      maxValue = 2n ** (BigInt(size3) * 8n) - 1n;
  } else if (typeof value_ === "number") {
    maxValue = BigInt(Number.MAX_SAFE_INTEGER);
  }
  const minValue = typeof maxValue === "bigint" && signed ? -maxValue - 1n : 0;
  if (maxValue && value > maxValue || value < minValue) {
    const suffix = typeof value_ === "bigint" ? "n" : "";
    throw new IntegerOutOfRangeError({
      max: maxValue ? `${maxValue}${suffix}` : void 0,
      min: `${minValue}${suffix}`,
      signed,
      size: size3,
      value: `${value_}${suffix}`
    });
  }
  const hex = `0x${(signed && value < 0 ? (1n << BigInt(size3 * 8)) + BigInt(value) : value).toString(16)}`;
  if (size3)
    return pad(hex, { size: size3 });
  return hex;
}
function stringToHex(value_, opts = {}) {
  const value = encoder.encode(value_);
  return bytesToHex(value, opts);
}
var hexes, encoder;
var init_toHex = __esm({
  "node_modules/viem/_esm/utils/encoding/toHex.js"() {
    init_encoding();
    init_pad();
    init_fromHex();
    hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_v, i3) => i3.toString(16).padStart(2, "0"));
    encoder = /* @__PURE__ */ new TextEncoder();
  }
});

// node_modules/viem/_esm/utils/encoding/toBytes.js
function toBytes(value, opts = {}) {
  if (typeof value === "number" || typeof value === "bigint")
    return numberToBytes(value, opts);
  if (typeof value === "boolean")
    return boolToBytes(value, opts);
  if (isHex(value))
    return hexToBytes(value, opts);
  return stringToBytes(value, opts);
}
function boolToBytes(value, opts = {}) {
  const bytes2 = new Uint8Array(1);
  bytes2[0] = Number(value);
  if (typeof opts.size === "number") {
    assertSize(bytes2, { size: opts.size });
    return pad(bytes2, { size: opts.size });
  }
  return bytes2;
}
function charCodeToBase16(char) {
  if (char >= charCodeMap.zero && char <= charCodeMap.nine)
    return char - charCodeMap.zero;
  if (char >= charCodeMap.A && char <= charCodeMap.F)
    return char - (charCodeMap.A - 10);
  if (char >= charCodeMap.a && char <= charCodeMap.f)
    return char - (charCodeMap.a - 10);
  return void 0;
}
function hexToBytes(hex_, opts = {}) {
  let hex = hex_;
  if (opts.size) {
    assertSize(hex, { size: opts.size });
    hex = pad(hex, { dir: "right", size: opts.size });
  }
  let hexString = hex.slice(2);
  if (hexString.length % 2)
    hexString = `0${hexString}`;
  const length = hexString.length / 2;
  const bytes2 = new Uint8Array(length);
  for (let index2 = 0, j5 = 0; index2 < length; index2++) {
    const nibbleLeft = charCodeToBase16(hexString.charCodeAt(j5++));
    const nibbleRight = charCodeToBase16(hexString.charCodeAt(j5++));
    if (nibbleLeft === void 0 || nibbleRight === void 0) {
      throw new BaseError2(`Invalid byte sequence ("${hexString[j5 - 2]}${hexString[j5 - 1]}" in "${hexString}").`);
    }
    bytes2[index2] = nibbleLeft * 16 + nibbleRight;
  }
  return bytes2;
}
function numberToBytes(value, opts) {
  const hex = numberToHex(value, opts);
  return hexToBytes(hex);
}
function stringToBytes(value, opts = {}) {
  const bytes2 = encoder2.encode(value);
  if (typeof opts.size === "number") {
    assertSize(bytes2, { size: opts.size });
    return pad(bytes2, { dir: "right", size: opts.size });
  }
  return bytes2;
}
var encoder2, charCodeMap;
var init_toBytes = __esm({
  "node_modules/viem/_esm/utils/encoding/toBytes.js"() {
    init_base();
    init_isHex();
    init_pad();
    init_fromHex();
    init_toHex();
    encoder2 = /* @__PURE__ */ new TextEncoder();
    charCodeMap = {
      zero: 48,
      nine: 57,
      A: 65,
      F: 70,
      a: 97,
      f: 102
    };
  }
});

// node_modules/@noble/hashes/esm/_assert.js
function number(n3) {
  if (!Number.isSafeInteger(n3) || n3 < 0)
    throw new Error(`positive integer expected, not ${n3}`);
}
function isBytes(a3) {
  return a3 instanceof Uint8Array || a3 != null && typeof a3 === "object" && a3.constructor.name === "Uint8Array";
}
function bytes(b4, ...lengths) {
  if (!isBytes(b4))
    throw new Error("Uint8Array expected");
  if (lengths.length > 0 && !lengths.includes(b4.length))
    throw new Error(`Uint8Array expected of length ${lengths}, not of length=${b4.length}`);
}
function hash(h4) {
  if (typeof h4 !== "function" || typeof h4.create !== "function")
    throw new Error("Hash should be wrapped by utils.wrapConstructor");
  number(h4.outputLen);
  number(h4.blockLen);
}
function exists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function output(out, instance) {
  bytes(out);
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error(`digestInto() expects output buffer of length at least ${min}`);
  }
}
var init_assert = __esm({
  "node_modules/@noble/hashes/esm/_assert.js"() {
  }
});

// node_modules/@noble/hashes/esm/_u64.js
function fromBig(n3, le4 = false) {
  if (le4)
    return { h: Number(n3 & U32_MASK64), l: Number(n3 >> _32n & U32_MASK64) };
  return { h: Number(n3 >> _32n & U32_MASK64) | 0, l: Number(n3 & U32_MASK64) | 0 };
}
function split(lst, le4 = false) {
  let Ah = new Uint32Array(lst.length);
  let Al = new Uint32Array(lst.length);
  for (let i3 = 0; i3 < lst.length; i3++) {
    const { h: h4, l: l3 } = fromBig(lst[i3], le4);
    [Ah[i3], Al[i3]] = [h4, l3];
  }
  return [Ah, Al];
}
var U32_MASK64, _32n, rotlSH, rotlSL, rotlBH, rotlBL;
var init_u64 = __esm({
  "node_modules/@noble/hashes/esm/_u64.js"() {
    U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
    _32n = /* @__PURE__ */ BigInt(32);
    rotlSH = (h4, l3, s3) => h4 << s3 | l3 >>> 32 - s3;
    rotlSL = (h4, l3, s3) => l3 << s3 | h4 >>> 32 - s3;
    rotlBH = (h4, l3, s3) => l3 << s3 - 32 | h4 >>> 64 - s3;
    rotlBL = (h4, l3, s3) => h4 << s3 - 32 | l3 >>> 64 - s3;
  }
});

// node_modules/@noble/hashes/esm/crypto.js
var crypto2;
var init_crypto = __esm({
  "node_modules/@noble/hashes/esm/crypto.js"() {
    crypto2 = typeof globalThis === "object" && "crypto" in globalThis ? globalThis.crypto : void 0;
  }
});

// node_modules/@noble/hashes/esm/utils.js
function byteSwap32(arr) {
  for (let i3 = 0; i3 < arr.length; i3++) {
    arr[i3] = byteSwap(arr[i3]);
  }
}
function utf8ToBytes(str) {
  if (typeof str !== "string")
    throw new Error(`utf8ToBytes expected string, got ${typeof str}`);
  return new Uint8Array(new TextEncoder().encode(str));
}
function toBytes2(data) {
  if (typeof data === "string")
    data = utf8ToBytes(data);
  bytes(data);
  return data;
}
function concatBytes(...arrays) {
  let sum = 0;
  for (let i3 = 0; i3 < arrays.length; i3++) {
    const a3 = arrays[i3];
    bytes(a3);
    sum += a3.length;
  }
  const res = new Uint8Array(sum);
  for (let i3 = 0, pad2 = 0; i3 < arrays.length; i3++) {
    const a3 = arrays[i3];
    res.set(a3, pad2);
    pad2 += a3.length;
  }
  return res;
}
function wrapConstructor(hashCons) {
  const hashC = (msg) => hashCons().update(toBytes2(msg)).digest();
  const tmp = hashCons();
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = () => hashCons();
  return hashC;
}
function wrapXOFConstructorWithOpts(hashCons) {
  const hashC = (msg, opts) => hashCons(opts).update(toBytes2(msg)).digest();
  const tmp = hashCons({});
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = (opts) => hashCons(opts);
  return hashC;
}
function randomBytes(bytesLength = 32) {
  if (crypto2 && typeof crypto2.getRandomValues === "function") {
    return crypto2.getRandomValues(new Uint8Array(bytesLength));
  }
  throw new Error("crypto.getRandomValues must be defined");
}
var u32, createView, rotr, isLE, byteSwap, Hash, toStr;
var init_utils3 = __esm({
  "node_modules/@noble/hashes/esm/utils.js"() {
    init_crypto();
    init_assert();
    u32 = (arr) => new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
    createView = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
    rotr = (word, shift) => word << 32 - shift | word >>> shift;
    isLE = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
    byteSwap = (word) => word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
    Hash = class {
      // Safe version that clones internal state
      clone() {
        return this._cloneInto();
      }
    };
    toStr = {}.toString;
  }
});

// node_modules/@noble/hashes/esm/sha3.js
function keccakP(s3, rounds = 24) {
  const B5 = new Uint32Array(5 * 2);
  for (let round = 24 - rounds; round < 24; round++) {
    for (let x4 = 0; x4 < 10; x4++)
      B5[x4] = s3[x4] ^ s3[x4 + 10] ^ s3[x4 + 20] ^ s3[x4 + 30] ^ s3[x4 + 40];
    for (let x4 = 0; x4 < 10; x4 += 2) {
      const idx1 = (x4 + 8) % 10;
      const idx0 = (x4 + 2) % 10;
      const B0 = B5[idx0];
      const B1 = B5[idx0 + 1];
      const Th = rotlH(B0, B1, 1) ^ B5[idx1];
      const Tl = rotlL(B0, B1, 1) ^ B5[idx1 + 1];
      for (let y4 = 0; y4 < 50; y4 += 10) {
        s3[x4 + y4] ^= Th;
        s3[x4 + y4 + 1] ^= Tl;
      }
    }
    let curH = s3[2];
    let curL = s3[3];
    for (let t3 = 0; t3 < 24; t3++) {
      const shift = SHA3_ROTL[t3];
      const Th = rotlH(curH, curL, shift);
      const Tl = rotlL(curH, curL, shift);
      const PI = SHA3_PI[t3];
      curH = s3[PI];
      curL = s3[PI + 1];
      s3[PI] = Th;
      s3[PI + 1] = Tl;
    }
    for (let y4 = 0; y4 < 50; y4 += 10) {
      for (let x4 = 0; x4 < 10; x4++)
        B5[x4] = s3[y4 + x4];
      for (let x4 = 0; x4 < 10; x4++)
        s3[y4 + x4] ^= ~B5[(x4 + 2) % 10] & B5[(x4 + 4) % 10];
    }
    s3[0] ^= SHA3_IOTA_H[round];
    s3[1] ^= SHA3_IOTA_L[round];
  }
  B5.fill(0);
}
var SHA3_PI, SHA3_ROTL, _SHA3_IOTA, _0n, _1n, _2n, _7n, _256n, _0x71n, SHA3_IOTA_H, SHA3_IOTA_L, rotlH, rotlL, Keccak, gen, sha3_224, sha3_256, sha3_384, sha3_512, keccak_224, keccak_256, keccak_384, keccak_512, genShake, shake128, shake256;
var init_sha3 = __esm({
  "node_modules/@noble/hashes/esm/sha3.js"() {
    init_assert();
    init_u64();
    init_utils3();
    SHA3_PI = [];
    SHA3_ROTL = [];
    _SHA3_IOTA = [];
    _0n = /* @__PURE__ */ BigInt(0);
    _1n = /* @__PURE__ */ BigInt(1);
    _2n = /* @__PURE__ */ BigInt(2);
    _7n = /* @__PURE__ */ BigInt(7);
    _256n = /* @__PURE__ */ BigInt(256);
    _0x71n = /* @__PURE__ */ BigInt(113);
    for (let round = 0, R5 = _1n, x4 = 1, y4 = 0; round < 24; round++) {
      [x4, y4] = [y4, (2 * x4 + 3 * y4) % 5];
      SHA3_PI.push(2 * (5 * y4 + x4));
      SHA3_ROTL.push((round + 1) * (round + 2) / 2 % 64);
      let t3 = _0n;
      for (let j5 = 0; j5 < 7; j5++) {
        R5 = (R5 << _1n ^ (R5 >> _7n) * _0x71n) % _256n;
        if (R5 & _2n)
          t3 ^= _1n << (_1n << /* @__PURE__ */ BigInt(j5)) - _1n;
      }
      _SHA3_IOTA.push(t3);
    }
    [SHA3_IOTA_H, SHA3_IOTA_L] = /* @__PURE__ */ split(_SHA3_IOTA, true);
    rotlH = (h4, l3, s3) => s3 > 32 ? rotlBH(h4, l3, s3) : rotlSH(h4, l3, s3);
    rotlL = (h4, l3, s3) => s3 > 32 ? rotlBL(h4, l3, s3) : rotlSL(h4, l3, s3);
    Keccak = class _Keccak extends Hash {
      // NOTE: we accept arguments in bytes instead of bits here.
      constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
        super();
        this.blockLen = blockLen;
        this.suffix = suffix;
        this.outputLen = outputLen;
        this.enableXOF = enableXOF;
        this.rounds = rounds;
        this.pos = 0;
        this.posOut = 0;
        this.finished = false;
        this.destroyed = false;
        number(outputLen);
        if (0 >= this.blockLen || this.blockLen >= 200)
          throw new Error("Sha3 supports only keccak-f1600 function");
        this.state = new Uint8Array(200);
        this.state32 = u32(this.state);
      }
      keccak() {
        if (!isLE)
          byteSwap32(this.state32);
        keccakP(this.state32, this.rounds);
        if (!isLE)
          byteSwap32(this.state32);
        this.posOut = 0;
        this.pos = 0;
      }
      update(data) {
        exists(this);
        const { blockLen, state } = this;
        data = toBytes2(data);
        const len = data.length;
        for (let pos = 0; pos < len; ) {
          const take = Math.min(blockLen - this.pos, len - pos);
          for (let i3 = 0; i3 < take; i3++)
            state[this.pos++] ^= data[pos++];
          if (this.pos === blockLen)
            this.keccak();
        }
        return this;
      }
      finish() {
        if (this.finished)
          return;
        this.finished = true;
        const { state, suffix, pos, blockLen } = this;
        state[pos] ^= suffix;
        if ((suffix & 128) !== 0 && pos === blockLen - 1)
          this.keccak();
        state[blockLen - 1] ^= 128;
        this.keccak();
      }
      writeInto(out) {
        exists(this, false);
        bytes(out);
        this.finish();
        const bufferOut = this.state;
        const { blockLen } = this;
        for (let pos = 0, len = out.length; pos < len; ) {
          if (this.posOut >= blockLen)
            this.keccak();
          const take = Math.min(blockLen - this.posOut, len - pos);
          out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
          this.posOut += take;
          pos += take;
        }
        return out;
      }
      xofInto(out) {
        if (!this.enableXOF)
          throw new Error("XOF is not possible for this instance");
        return this.writeInto(out);
      }
      xof(bytes2) {
        number(bytes2);
        return this.xofInto(new Uint8Array(bytes2));
      }
      digestInto(out) {
        output(out, this);
        if (this.finished)
          throw new Error("digest() was already called");
        this.writeInto(out);
        this.destroy();
        return out;
      }
      digest() {
        return this.digestInto(new Uint8Array(this.outputLen));
      }
      destroy() {
        this.destroyed = true;
        this.state.fill(0);
      }
      _cloneInto(to) {
        const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
        to || (to = new _Keccak(blockLen, suffix, outputLen, enableXOF, rounds));
        to.state32.set(this.state32);
        to.pos = this.pos;
        to.posOut = this.posOut;
        to.finished = this.finished;
        to.rounds = rounds;
        to.suffix = suffix;
        to.outputLen = outputLen;
        to.enableXOF = enableXOF;
        to.destroyed = this.destroyed;
        return to;
      }
    };
    gen = (suffix, blockLen, outputLen) => wrapConstructor(() => new Keccak(blockLen, suffix, outputLen));
    sha3_224 = /* @__PURE__ */ gen(6, 144, 224 / 8);
    sha3_256 = /* @__PURE__ */ gen(6, 136, 256 / 8);
    sha3_384 = /* @__PURE__ */ gen(6, 104, 384 / 8);
    sha3_512 = /* @__PURE__ */ gen(6, 72, 512 / 8);
    keccak_224 = /* @__PURE__ */ gen(1, 144, 224 / 8);
    keccak_256 = /* @__PURE__ */ gen(1, 136, 256 / 8);
    keccak_384 = /* @__PURE__ */ gen(1, 104, 384 / 8);
    keccak_512 = /* @__PURE__ */ gen(1, 72, 512 / 8);
    genShake = (suffix, blockLen, outputLen) => wrapXOFConstructorWithOpts((opts = {}) => new Keccak(blockLen, suffix, opts.dkLen === void 0 ? outputLen : opts.dkLen, true));
    shake128 = /* @__PURE__ */ genShake(31, 168, 128 / 8);
    shake256 = /* @__PURE__ */ genShake(31, 136, 256 / 8);
  }
});

// node_modules/viem/_esm/utils/hash/keccak256.js
function keccak256(value, to_) {
  const to = to_ || "hex";
  const bytes2 = keccak_256(isHex(value, { strict: false }) ? toBytes(value) : value);
  if (to === "bytes")
    return bytes2;
  return toHex(bytes2);
}
var init_keccak256 = __esm({
  "node_modules/viem/_esm/utils/hash/keccak256.js"() {
    init_sha3();
    init_isHex();
    init_toBytes();
    init_toHex();
  }
});

// node_modules/viem/_esm/utils/hash/hashSignature.js
function hashSignature(sig) {
  return hash2(sig);
}
var hash2;
var init_hashSignature = __esm({
  "node_modules/viem/_esm/utils/hash/hashSignature.js"() {
    init_toBytes();
    init_keccak256();
    hash2 = (value) => keccak256(toBytes(value));
  }
});

// node_modules/viem/_esm/utils/hash/normalizeSignature.js
function normalizeSignature(signature) {
  let active = true;
  let current = "";
  let level2 = 0;
  let result = "";
  let valid = false;
  for (let i3 = 0; i3 < signature.length; i3++) {
    const char = signature[i3];
    if (["(", ")", ","].includes(char))
      active = true;
    if (char === "(")
      level2++;
    if (char === ")")
      level2--;
    if (!active)
      continue;
    if (level2 === 0) {
      if (char === " " && ["event", "function", ""].includes(result))
        result = "";
      else {
        result += char;
        if (char === ")") {
          valid = true;
          break;
        }
      }
      continue;
    }
    if (char === " ") {
      if (signature[i3 - 1] !== "," && current !== "," && current !== ",(") {
        current = "";
        active = false;
      }
      continue;
    }
    result += char;
    current += char;
  }
  if (!valid)
    throw new BaseError2("Unable to normalize signature.");
  return result;
}
var init_normalizeSignature = __esm({
  "node_modules/viem/_esm/utils/hash/normalizeSignature.js"() {
    init_base();
  }
});

// node_modules/viem/_esm/utils/hash/toSignature.js
var toSignature;
var init_toSignature = __esm({
  "node_modules/viem/_esm/utils/hash/toSignature.js"() {
    init_exports();
    init_normalizeSignature();
    toSignature = (def) => {
      const def_ = (() => {
        if (typeof def === "string")
          return def;
        return formatAbiItem(def);
      })();
      return normalizeSignature(def_);
    };
  }
});

// node_modules/viem/_esm/utils/hash/toSignatureHash.js
function toSignatureHash(fn2) {
  return hashSignature(toSignature(fn2));
}
var init_toSignatureHash = __esm({
  "node_modules/viem/_esm/utils/hash/toSignatureHash.js"() {
    init_hashSignature();
    init_toSignature();
  }
});

// node_modules/viem/_esm/utils/hash/toEventSelector.js
var toEventSelector;
var init_toEventSelector = __esm({
  "node_modules/viem/_esm/utils/hash/toEventSelector.js"() {
    init_toSignatureHash();
    toEventSelector = toSignatureHash;
  }
});

// node_modules/viem/_esm/errors/address.js
var InvalidAddressError;
var init_address = __esm({
  "node_modules/viem/_esm/errors/address.js"() {
    init_base();
    InvalidAddressError = class extends BaseError2 {
      constructor({ address }) {
        super(`Address "${address}" is invalid.`, {
          metaMessages: [
            "- Address must be a hex value of 20 bytes (40 hex characters).",
            "- Address must match its checksum counterpart."
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidAddressError"
        });
      }
    };
  }
});

// node_modules/viem/_esm/utils/lru.js
var LruMap;
var init_lru = __esm({
  "node_modules/viem/_esm/utils/lru.js"() {
    LruMap = class extends Map {
      constructor(size3) {
        super();
        Object.defineProperty(this, "maxSize", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.maxSize = size3;
      }
      set(key, value) {
        super.set(key, value);
        if (this.maxSize && this.size > this.maxSize)
          this.delete(this.keys().next().value);
        return this;
      }
    };
  }
});

// node_modules/viem/_esm/utils/address/getAddress.js
function checksumAddress(address_, chainId) {
  if (checksumAddressCache.has(`${address_}.${chainId}`))
    return checksumAddressCache.get(`${address_}.${chainId}`);
  const hexAddress = chainId ? `${chainId}${address_.toLowerCase()}` : address_.substring(2).toLowerCase();
  const hash3 = keccak256(stringToBytes(hexAddress), "bytes");
  const address = (chainId ? hexAddress.substring(`${chainId}0x`.length) : hexAddress).split("");
  for (let i3 = 0; i3 < 40; i3 += 2) {
    if (hash3[i3 >> 1] >> 4 >= 8 && address[i3]) {
      address[i3] = address[i3].toUpperCase();
    }
    if ((hash3[i3 >> 1] & 15) >= 8 && address[i3 + 1]) {
      address[i3 + 1] = address[i3 + 1].toUpperCase();
    }
  }
  const result = `0x${address.join("")}`;
  checksumAddressCache.set(`${address_}.${chainId}`, result);
  return result;
}
function getAddress(address, chainId) {
  if (!isAddress(address, { strict: false }))
    throw new InvalidAddressError({ address });
  return checksumAddress(address, chainId);
}
var checksumAddressCache;
var init_getAddress = __esm({
  "node_modules/viem/_esm/utils/address/getAddress.js"() {
    init_address();
    init_toBytes();
    init_keccak256();
    init_lru();
    init_isAddress();
    checksumAddressCache = /* @__PURE__ */ new LruMap(8192);
  }
});

// node_modules/viem/_esm/utils/address/isAddress.js
function isAddress(address, options) {
  const { strict = true } = options ?? {};
  const cacheKey2 = `${address}.${strict}`;
  if (isAddressCache.has(cacheKey2))
    return isAddressCache.get(cacheKey2);
  const result = (() => {
    if (!addressRegex.test(address))
      return false;
    if (address.toLowerCase() === address)
      return true;
    if (strict)
      return checksumAddress(address) === address;
    return true;
  })();
  isAddressCache.set(cacheKey2, result);
  return result;
}
var addressRegex, isAddressCache;
var init_isAddress = __esm({
  "node_modules/viem/_esm/utils/address/isAddress.js"() {
    init_lru();
    init_getAddress();
    addressRegex = /^0x[a-fA-F0-9]{40}$/;
    isAddressCache = /* @__PURE__ */ new LruMap(8192);
  }
});

// node_modules/viem/_esm/utils/data/concat.js
function concat(values) {
  if (typeof values[0] === "string")
    return concatHex(values);
  return concatBytes2(values);
}
function concatBytes2(values) {
  let length = 0;
  for (const arr of values) {
    length += arr.length;
  }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const arr of values) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}
function concatHex(values) {
  return `0x${values.reduce((acc, x4) => acc + x4.replace("0x", ""), "")}`;
}
var init_concat = __esm({
  "node_modules/viem/_esm/utils/data/concat.js"() {
  }
});

// node_modules/viem/_esm/utils/data/slice.js
function slice(value, start, end, { strict } = {}) {
  if (isHex(value, { strict: false }))
    return sliceHex(value, start, end, {
      strict
    });
  return sliceBytes(value, start, end, {
    strict
  });
}
function assertStartOffset(value, start) {
  if (typeof start === "number" && start > 0 && start > size(value) - 1)
    throw new SliceOffsetOutOfBoundsError({
      offset: start,
      position: "start",
      size: size(value)
    });
}
function assertEndOffset(value, start, end) {
  if (typeof start === "number" && typeof end === "number" && size(value) !== end - start) {
    throw new SliceOffsetOutOfBoundsError({
      offset: end,
      position: "end",
      size: size(value)
    });
  }
}
function sliceBytes(value_, start, end, { strict } = {}) {
  assertStartOffset(value_, start);
  const value = value_.slice(start, end);
  if (strict)
    assertEndOffset(value, start, end);
  return value;
}
function sliceHex(value_, start, end, { strict } = {}) {
  assertStartOffset(value_, start);
  const value = `0x${value_.replace("0x", "").slice((start ?? 0) * 2, (end ?? value_.length) * 2)}`;
  if (strict)
    assertEndOffset(value, start, end);
  return value;
}
var init_slice = __esm({
  "node_modules/viem/_esm/utils/data/slice.js"() {
    init_data();
    init_isHex();
    init_size();
  }
});

// node_modules/viem/_esm/utils/abi/encodeAbiParameters.js
function encodeAbiParameters(params, values) {
  if (params.length !== values.length)
    throw new AbiEncodingLengthMismatchError({
      expectedLength: params.length,
      givenLength: values.length
    });
  const preparedParams = prepareParams({
    params,
    values
  });
  const data = encodeParams(preparedParams);
  if (data.length === 0)
    return "0x";
  return data;
}
function prepareParams({ params, values }) {
  const preparedParams = [];
  for (let i3 = 0; i3 < params.length; i3++) {
    preparedParams.push(prepareParam({ param: params[i3], value: values[i3] }));
  }
  return preparedParams;
}
function prepareParam({ param, value }) {
  const arrayComponents = getArrayComponents(param.type);
  if (arrayComponents) {
    const [length, type] = arrayComponents;
    return encodeArray(value, { length, param: { ...param, type } });
  }
  if (param.type === "tuple") {
    return encodeTuple(value, {
      param
    });
  }
  if (param.type === "address") {
    return encodeAddress(value);
  }
  if (param.type === "bool") {
    return encodeBool(value);
  }
  if (param.type.startsWith("uint") || param.type.startsWith("int")) {
    const signed = param.type.startsWith("int");
    return encodeNumber(value, { signed });
  }
  if (param.type.startsWith("bytes")) {
    return encodeBytes(value, { param });
  }
  if (param.type === "string") {
    return encodeString(value);
  }
  throw new InvalidAbiEncodingTypeError(param.type, {
    docsPath: "/docs/contract/encodeAbiParameters"
  });
}
function encodeParams(preparedParams) {
  let staticSize = 0;
  for (let i3 = 0; i3 < preparedParams.length; i3++) {
    const { dynamic, encoded } = preparedParams[i3];
    if (dynamic)
      staticSize += 32;
    else
      staticSize += size(encoded);
  }
  const staticParams = [];
  const dynamicParams = [];
  let dynamicSize = 0;
  for (let i3 = 0; i3 < preparedParams.length; i3++) {
    const { dynamic, encoded } = preparedParams[i3];
    if (dynamic) {
      staticParams.push(numberToHex(staticSize + dynamicSize, { size: 32 }));
      dynamicParams.push(encoded);
      dynamicSize += size(encoded);
    } else {
      staticParams.push(encoded);
    }
  }
  return concat([...staticParams, ...dynamicParams]);
}
function encodeAddress(value) {
  if (!isAddress(value))
    throw new InvalidAddressError({ address: value });
  return { dynamic: false, encoded: padHex(value.toLowerCase()) };
}
function encodeArray(value, { length, param }) {
  const dynamic = length === null;
  if (!Array.isArray(value))
    throw new InvalidArrayError(value);
  if (!dynamic && value.length !== length)
    throw new AbiEncodingArrayLengthMismatchError({
      expectedLength: length,
      givenLength: value.length,
      type: `${param.type}[${length}]`
    });
  let dynamicChild = false;
  const preparedParams = [];
  for (let i3 = 0; i3 < value.length; i3++) {
    const preparedParam = prepareParam({ param, value: value[i3] });
    if (preparedParam.dynamic)
      dynamicChild = true;
    preparedParams.push(preparedParam);
  }
  if (dynamic || dynamicChild) {
    const data = encodeParams(preparedParams);
    if (dynamic) {
      const length2 = numberToHex(preparedParams.length, { size: 32 });
      return {
        dynamic: true,
        encoded: preparedParams.length > 0 ? concat([length2, data]) : length2
      };
    }
    if (dynamicChild)
      return { dynamic: true, encoded: data };
  }
  return {
    dynamic: false,
    encoded: concat(preparedParams.map(({ encoded }) => encoded))
  };
}
function encodeBytes(value, { param }) {
  const [, paramSize] = param.type.split("bytes");
  const bytesSize = size(value);
  if (!paramSize) {
    let value_ = value;
    if (bytesSize % 32 !== 0)
      value_ = padHex(value_, {
        dir: "right",
        size: Math.ceil((value.length - 2) / 2 / 32) * 32
      });
    return {
      dynamic: true,
      encoded: concat([padHex(numberToHex(bytesSize, { size: 32 })), value_])
    };
  }
  if (bytesSize !== Number.parseInt(paramSize))
    throw new AbiEncodingBytesSizeMismatchError({
      expectedSize: Number.parseInt(paramSize),
      value
    });
  return { dynamic: false, encoded: padHex(value, { dir: "right" }) };
}
function encodeBool(value) {
  if (typeof value !== "boolean")
    throw new BaseError2(`Invalid boolean value: "${value}" (type: ${typeof value}). Expected: \`true\` or \`false\`.`);
  return { dynamic: false, encoded: padHex(boolToHex(value)) };
}
function encodeNumber(value, { signed }) {
  return {
    dynamic: false,
    encoded: numberToHex(value, {
      size: 32,
      signed
    })
  };
}
function encodeString(value) {
  const hexValue2 = stringToHex(value);
  const partsLength = Math.ceil(size(hexValue2) / 32);
  const parts = [];
  for (let i3 = 0; i3 < partsLength; i3++) {
    parts.push(padHex(slice(hexValue2, i3 * 32, (i3 + 1) * 32), {
      dir: "right"
    }));
  }
  return {
    dynamic: true,
    encoded: concat([
      padHex(numberToHex(size(hexValue2), { size: 32 })),
      ...parts
    ])
  };
}
function encodeTuple(value, { param }) {
  let dynamic = false;
  const preparedParams = [];
  for (let i3 = 0; i3 < param.components.length; i3++) {
    const param_ = param.components[i3];
    const index2 = Array.isArray(value) ? i3 : param_.name;
    const preparedParam = prepareParam({
      param: param_,
      value: value[index2]
    });
    preparedParams.push(preparedParam);
    if (preparedParam.dynamic)
      dynamic = true;
  }
  return {
    dynamic,
    encoded: dynamic ? encodeParams(preparedParams) : concat(preparedParams.map(({ encoded }) => encoded))
  };
}
function getArrayComponents(type) {
  const matches = type.match(/^(.*)\[(\d+)?\]$/);
  return matches ? (
    // Return `null` if the array is dynamic.
    [matches[2] ? Number(matches[2]) : null, matches[1]]
  ) : void 0;
}
var init_encodeAbiParameters = __esm({
  "node_modules/viem/_esm/utils/abi/encodeAbiParameters.js"() {
    init_abi();
    init_address();
    init_base();
    init_isAddress();
    init_concat();
    init_pad();
    init_size();
    init_slice();
    init_toHex();
  }
});

// node_modules/viem/_esm/utils/hash/toFunctionSelector.js
var toFunctionSelector;
var init_toFunctionSelector = __esm({
  "node_modules/viem/_esm/utils/hash/toFunctionSelector.js"() {
    init_slice();
    init_toSignatureHash();
    toFunctionSelector = (fn2) => slice(toSignatureHash(fn2), 0, 4);
  }
});

// node_modules/viem/_esm/utils/abi/getAbiItem.js
function getAbiItem(parameters) {
  const { abi: abi2, args = [], name } = parameters;
  const isSelector = isHex(name, { strict: false });
  const abiItems = abi2.filter((abiItem) => {
    if (isSelector) {
      if (abiItem.type === "function")
        return toFunctionSelector(abiItem) === name;
      if (abiItem.type === "event")
        return toEventSelector(abiItem) === name;
      return false;
    }
    return "name" in abiItem && abiItem.name === name;
  });
  if (abiItems.length === 0)
    return void 0;
  if (abiItems.length === 1)
    return abiItems[0];
  let matchedAbiItem = void 0;
  for (const abiItem of abiItems) {
    if (!("inputs" in abiItem))
      continue;
    if (!args || args.length === 0) {
      if (!abiItem.inputs || abiItem.inputs.length === 0)
        return abiItem;
      continue;
    }
    if (!abiItem.inputs)
      continue;
    if (abiItem.inputs.length === 0)
      continue;
    if (abiItem.inputs.length !== args.length)
      continue;
    const matched = args.every((arg, index2) => {
      const abiParameter = "inputs" in abiItem && abiItem.inputs[index2];
      if (!abiParameter)
        return false;
      return isArgOfType(arg, abiParameter);
    });
    if (matched) {
      if (matchedAbiItem && "inputs" in matchedAbiItem && matchedAbiItem.inputs) {
        const ambiguousTypes = getAmbiguousTypes(abiItem.inputs, matchedAbiItem.inputs, args);
        if (ambiguousTypes)
          throw new AbiItemAmbiguityError({
            abiItem,
            type: ambiguousTypes[0]
          }, {
            abiItem: matchedAbiItem,
            type: ambiguousTypes[1]
          });
      }
      matchedAbiItem = abiItem;
    }
  }
  if (matchedAbiItem)
    return matchedAbiItem;
  return abiItems[0];
}
function isArgOfType(arg, abiParameter) {
  const argType = typeof arg;
  const abiParameterType = abiParameter.type;
  switch (abiParameterType) {
    case "address":
      return isAddress(arg, { strict: false });
    case "bool":
      return argType === "boolean";
    case "function":
      return argType === "string";
    case "string":
      return argType === "string";
    default: {
      if (abiParameterType === "tuple" && "components" in abiParameter)
        return Object.values(abiParameter.components).every((component, index2) => {
          return isArgOfType(Object.values(arg)[index2], component);
        });
      if (/^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/.test(abiParameterType))
        return argType === "number" || argType === "bigint";
      if (/^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/.test(abiParameterType))
        return argType === "string" || arg instanceof Uint8Array;
      if (/[a-z]+[1-9]{0,3}(\[[0-9]{0,}\])+$/.test(abiParameterType)) {
        return Array.isArray(arg) && arg.every((x4) => isArgOfType(x4, {
          ...abiParameter,
          // Pop off `[]` or `[M]` from end of type
          type: abiParameterType.replace(/(\[[0-9]{0,}\])$/, "")
        }));
      }
      return false;
    }
  }
}
function getAmbiguousTypes(sourceParameters, targetParameters, args) {
  for (const parameterIndex in sourceParameters) {
    const sourceParameter = sourceParameters[parameterIndex];
    const targetParameter = targetParameters[parameterIndex];
    if (sourceParameter.type === "tuple" && targetParameter.type === "tuple" && "components" in sourceParameter && "components" in targetParameter)
      return getAmbiguousTypes(sourceParameter.components, targetParameter.components, args[parameterIndex]);
    const types = [sourceParameter.type, targetParameter.type];
    const ambiguous = (() => {
      if (types.includes("address") && types.includes("bytes20"))
        return true;
      if (types.includes("address") && types.includes("string"))
        return isAddress(args[parameterIndex], { strict: false });
      if (types.includes("address") && types.includes("bytes"))
        return isAddress(args[parameterIndex], { strict: false });
      return false;
    })();
    if (ambiguous)
      return types;
  }
  return;
}
var init_getAbiItem = __esm({
  "node_modules/viem/_esm/utils/abi/getAbiItem.js"() {
    init_abi();
    init_isHex();
    init_isAddress();
    init_toEventSelector();
    init_toFunctionSelector();
  }
});

// node_modules/viem/_esm/accounts/utils/parseAccount.js
function parseAccount(account) {
  if (typeof account === "string")
    return { address: account, type: "json-rpc" };
  return account;
}
var init_parseAccount = __esm({
  "node_modules/viem/_esm/accounts/utils/parseAccount.js"() {
  }
});

// node_modules/viem/_esm/utils/abi/prepareEncodeFunctionData.js
function prepareEncodeFunctionData(parameters) {
  const { abi: abi2, args, functionName } = parameters;
  let abiItem = abi2[0];
  if (functionName) {
    const item = getAbiItem({
      abi: abi2,
      args,
      name: functionName
    });
    if (!item)
      throw new AbiFunctionNotFoundError(functionName, { docsPath: docsPath2 });
    abiItem = item;
  }
  if (abiItem.type !== "function")
    throw new AbiFunctionNotFoundError(void 0, { docsPath: docsPath2 });
  return {
    abi: [abiItem],
    functionName: toFunctionSelector(formatAbiItem2(abiItem))
  };
}
var docsPath2;
var init_prepareEncodeFunctionData = __esm({
  "node_modules/viem/_esm/utils/abi/prepareEncodeFunctionData.js"() {
    init_abi();
    init_toFunctionSelector();
    init_formatAbiItem2();
    init_getAbiItem();
    docsPath2 = "/docs/contract/encodeFunctionData";
  }
});

// node_modules/viem/_esm/utils/abi/encodeFunctionData.js
function encodeFunctionData(parameters) {
  const { args } = parameters;
  const { abi: abi2, functionName } = (() => {
    if (parameters.abi.length === 1 && parameters.functionName?.startsWith("0x"))
      return parameters;
    return prepareEncodeFunctionData(parameters);
  })();
  const abiItem = abi2[0];
  const signature = functionName;
  const data = "inputs" in abiItem && abiItem.inputs ? encodeAbiParameters(abiItem.inputs, args ?? []) : void 0;
  return concatHex([signature, data ?? "0x"]);
}
var init_encodeFunctionData = __esm({
  "node_modules/viem/_esm/utils/abi/encodeFunctionData.js"() {
    init_concat();
    init_encodeAbiParameters();
    init_prepareEncodeFunctionData();
  }
});

// node_modules/viem/_esm/constants/solidity.js
var panicReasons, solidityError, solidityPanic;
var init_solidity = __esm({
  "node_modules/viem/_esm/constants/solidity.js"() {
    panicReasons = {
      1: "An `assert` condition failed.",
      17: "Arithmetic operation resulted in underflow or overflow.",
      18: "Division or modulo by zero (e.g. `5 / 0` or `23 % 0`).",
      33: "Attempted to convert to an invalid type.",
      34: "Attempted to access a storage byte array that is incorrectly encoded.",
      49: "Performed `.pop()` on an empty array",
      50: "Array index is out of bounds.",
      65: "Allocated too much memory or created an array which is too large.",
      81: "Attempted to call a zero-initialized variable of internal function type."
    };
    solidityError = {
      inputs: [
        {
          name: "message",
          type: "string"
        }
      ],
      name: "Error",
      type: "error"
    };
    solidityPanic = {
      inputs: [
        {
          name: "reason",
          type: "uint256"
        }
      ],
      name: "Panic",
      type: "error"
    };
  }
});

// node_modules/viem/_esm/errors/cursor.js
var NegativeOffsetError, PositionOutOfBoundsError, RecursiveReadLimitExceededError;
var init_cursor = __esm({
  "node_modules/viem/_esm/errors/cursor.js"() {
    init_base();
    NegativeOffsetError = class extends BaseError2 {
      constructor({ offset }) {
        super(`Offset \`${offset}\` cannot be negative.`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "NegativeOffsetError"
        });
      }
    };
    PositionOutOfBoundsError = class extends BaseError2 {
      constructor({ length, position }) {
        super(`Position \`${position}\` is out of bounds (\`0 < position < ${length}\`).`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "PositionOutOfBoundsError"
        });
      }
    };
    RecursiveReadLimitExceededError = class extends BaseError2 {
      constructor({ count, limit }) {
        super(`Recursive read limit of \`${limit}\` exceeded (recursive read count: \`${count}\`).`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "RecursiveReadLimitExceededError"
        });
      }
    };
  }
});

// node_modules/viem/_esm/utils/cursor.js
function createCursor(bytes2, { recursiveReadLimit = 8192 } = {}) {
  const cursor = Object.create(staticCursor);
  cursor.bytes = bytes2;
  cursor.dataView = new DataView(bytes2.buffer, bytes2.byteOffset, bytes2.byteLength);
  cursor.positionReadCount = /* @__PURE__ */ new Map();
  cursor.recursiveReadLimit = recursiveReadLimit;
  return cursor;
}
var staticCursor;
var init_cursor2 = __esm({
  "node_modules/viem/_esm/utils/cursor.js"() {
    init_cursor();
    staticCursor = {
      bytes: new Uint8Array(),
      dataView: new DataView(new ArrayBuffer(0)),
      position: 0,
      positionReadCount: /* @__PURE__ */ new Map(),
      recursiveReadCount: 0,
      recursiveReadLimit: Number.POSITIVE_INFINITY,
      assertReadLimit() {
        if (this.recursiveReadCount >= this.recursiveReadLimit)
          throw new RecursiveReadLimitExceededError({
            count: this.recursiveReadCount + 1,
            limit: this.recursiveReadLimit
          });
      },
      assertPosition(position) {
        if (position < 0 || position > this.bytes.length - 1)
          throw new PositionOutOfBoundsError({
            length: this.bytes.length,
            position
          });
      },
      decrementPosition(offset) {
        if (offset < 0)
          throw new NegativeOffsetError({ offset });
        const position = this.position - offset;
        this.assertPosition(position);
        this.position = position;
      },
      getReadCount(position) {
        return this.positionReadCount.get(position || this.position) || 0;
      },
      incrementPosition(offset) {
        if (offset < 0)
          throw new NegativeOffsetError({ offset });
        const position = this.position + offset;
        this.assertPosition(position);
        this.position = position;
      },
      inspectByte(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position);
        return this.bytes[position];
      },
      inspectBytes(length, position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position + length - 1);
        return this.bytes.subarray(position, position + length);
      },
      inspectUint8(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position);
        return this.bytes[position];
      },
      inspectUint16(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position + 1);
        return this.dataView.getUint16(position);
      },
      inspectUint24(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position + 2);
        return (this.dataView.getUint16(position) << 8) + this.dataView.getUint8(position + 2);
      },
      inspectUint32(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position + 3);
        return this.dataView.getUint32(position);
      },
      pushByte(byte) {
        this.assertPosition(this.position);
        this.bytes[this.position] = byte;
        this.position++;
      },
      pushBytes(bytes2) {
        this.assertPosition(this.position + bytes2.length - 1);
        this.bytes.set(bytes2, this.position);
        this.position += bytes2.length;
      },
      pushUint8(value) {
        this.assertPosition(this.position);
        this.bytes[this.position] = value;
        this.position++;
      },
      pushUint16(value) {
        this.assertPosition(this.position + 1);
        this.dataView.setUint16(this.position, value);
        this.position += 2;
      },
      pushUint24(value) {
        this.assertPosition(this.position + 2);
        this.dataView.setUint16(this.position, value >> 8);
        this.dataView.setUint8(this.position + 2, value & ~4294967040);
        this.position += 3;
      },
      pushUint32(value) {
        this.assertPosition(this.position + 3);
        this.dataView.setUint32(this.position, value);
        this.position += 4;
      },
      readByte() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectByte();
        this.position++;
        return value;
      },
      readBytes(length, size3) {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectBytes(length);
        this.position += size3 ?? length;
        return value;
      },
      readUint8() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectUint8();
        this.position += 1;
        return value;
      },
      readUint16() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectUint16();
        this.position += 2;
        return value;
      },
      readUint24() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectUint24();
        this.position += 3;
        return value;
      },
      readUint32() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectUint32();
        this.position += 4;
        return value;
      },
      get remaining() {
        return this.bytes.length - this.position;
      },
      setPosition(position) {
        const oldPosition = this.position;
        this.assertPosition(position);
        this.position = position;
        return () => this.position = oldPosition;
      },
      _touch() {
        if (this.recursiveReadLimit === Number.POSITIVE_INFINITY)
          return;
        const count = this.getReadCount();
        this.positionReadCount.set(this.position, count + 1);
        if (count > 0)
          this.recursiveReadCount++;
      }
    };
  }
});

// node_modules/viem/_esm/utils/encoding/fromBytes.js
function bytesToBigInt(bytes2, opts = {}) {
  if (typeof opts.size !== "undefined")
    assertSize(bytes2, { size: opts.size });
  const hex = bytesToHex(bytes2, opts);
  return hexToBigInt(hex, opts);
}
function bytesToBool(bytes_, opts = {}) {
  let bytes2 = bytes_;
  if (typeof opts.size !== "undefined") {
    assertSize(bytes2, { size: opts.size });
    bytes2 = trim2(bytes2);
  }
  if (bytes2.length > 1 || bytes2[0] > 1)
    throw new InvalidBytesBooleanError(bytes2);
  return Boolean(bytes2[0]);
}
function bytesToNumber(bytes2, opts = {}) {
  if (typeof opts.size !== "undefined")
    assertSize(bytes2, { size: opts.size });
  const hex = bytesToHex(bytes2, opts);
  return hexToNumber(hex, opts);
}
function bytesToString(bytes_, opts = {}) {
  let bytes2 = bytes_;
  if (typeof opts.size !== "undefined") {
    assertSize(bytes2, { size: opts.size });
    bytes2 = trim2(bytes2, { dir: "right" });
  }
  return new TextDecoder().decode(bytes2);
}
var init_fromBytes = __esm({
  "node_modules/viem/_esm/utils/encoding/fromBytes.js"() {
    init_encoding();
    init_trim();
    init_fromHex();
    init_toHex();
  }
});

// node_modules/viem/_esm/utils/abi/decodeAbiParameters.js
function decodeAbiParameters(params, data) {
  const bytes2 = typeof data === "string" ? hexToBytes(data) : data;
  const cursor = createCursor(bytes2);
  if (size(bytes2) === 0 && params.length > 0)
    throw new AbiDecodingZeroDataError();
  if (size(data) && size(data) < 32)
    throw new AbiDecodingDataSizeTooSmallError({
      data: typeof data === "string" ? data : bytesToHex(data),
      params,
      size: size(data)
    });
  let consumed = 0;
  const values = [];
  for (let i3 = 0; i3 < params.length; ++i3) {
    const param = params[i3];
    cursor.setPosition(consumed);
    const [data2, consumed_] = decodeParameter(cursor, param, {
      staticPosition: 0
    });
    consumed += consumed_;
    values.push(data2);
  }
  return values;
}
function decodeParameter(cursor, param, { staticPosition }) {
  const arrayComponents = getArrayComponents(param.type);
  if (arrayComponents) {
    const [length, type] = arrayComponents;
    return decodeArray(cursor, { ...param, type }, { length, staticPosition });
  }
  if (param.type === "tuple")
    return decodeTuple(cursor, param, { staticPosition });
  if (param.type === "address")
    return decodeAddress(cursor);
  if (param.type === "bool")
    return decodeBool(cursor);
  if (param.type.startsWith("bytes"))
    return decodeBytes(cursor, param, { staticPosition });
  if (param.type.startsWith("uint") || param.type.startsWith("int"))
    return decodeNumber(cursor, param);
  if (param.type === "string")
    return decodeString(cursor, { staticPosition });
  throw new InvalidAbiDecodingTypeError(param.type, {
    docsPath: "/docs/contract/decodeAbiParameters"
  });
}
function decodeAddress(cursor) {
  const value = cursor.readBytes(32);
  return [checksumAddress(bytesToHex(sliceBytes(value, -20))), 32];
}
function decodeArray(cursor, param, { length, staticPosition }) {
  if (!length) {
    const offset = bytesToNumber(cursor.readBytes(sizeOfOffset));
    const start = staticPosition + offset;
    const startOfData = start + sizeOfLength;
    cursor.setPosition(start);
    const length2 = bytesToNumber(cursor.readBytes(sizeOfLength));
    const dynamicChild = hasDynamicChild(param);
    let consumed2 = 0;
    const value2 = [];
    for (let i3 = 0; i3 < length2; ++i3) {
      cursor.setPosition(startOfData + (dynamicChild ? i3 * 32 : consumed2));
      const [data, consumed_] = decodeParameter(cursor, param, {
        staticPosition: startOfData
      });
      consumed2 += consumed_;
      value2.push(data);
    }
    cursor.setPosition(staticPosition + 32);
    return [value2, 32];
  }
  if (hasDynamicChild(param)) {
    const offset = bytesToNumber(cursor.readBytes(sizeOfOffset));
    const start = staticPosition + offset;
    const value2 = [];
    for (let i3 = 0; i3 < length; ++i3) {
      cursor.setPosition(start + i3 * 32);
      const [data] = decodeParameter(cursor, param, {
        staticPosition: start
      });
      value2.push(data);
    }
    cursor.setPosition(staticPosition + 32);
    return [value2, 32];
  }
  let consumed = 0;
  const value = [];
  for (let i3 = 0; i3 < length; ++i3) {
    const [data, consumed_] = decodeParameter(cursor, param, {
      staticPosition: staticPosition + consumed
    });
    consumed += consumed_;
    value.push(data);
  }
  return [value, consumed];
}
function decodeBool(cursor) {
  return [bytesToBool(cursor.readBytes(32), { size: 32 }), 32];
}
function decodeBytes(cursor, param, { staticPosition }) {
  const [_4, size3] = param.type.split("bytes");
  if (!size3) {
    const offset = bytesToNumber(cursor.readBytes(32));
    cursor.setPosition(staticPosition + offset);
    const length = bytesToNumber(cursor.readBytes(32));
    if (length === 0) {
      cursor.setPosition(staticPosition + 32);
      return ["0x", 32];
    }
    const data = cursor.readBytes(length);
    cursor.setPosition(staticPosition + 32);
    return [bytesToHex(data), 32];
  }
  const value = bytesToHex(cursor.readBytes(Number.parseInt(size3), 32));
  return [value, 32];
}
function decodeNumber(cursor, param) {
  const signed = param.type.startsWith("int");
  const size3 = Number.parseInt(param.type.split("int")[1] || "256");
  const value = cursor.readBytes(32);
  return [
    size3 > 48 ? bytesToBigInt(value, { signed }) : bytesToNumber(value, { signed }),
    32
  ];
}
function decodeTuple(cursor, param, { staticPosition }) {
  const hasUnnamedChild = param.components.length === 0 || param.components.some(({ name }) => !name);
  const value = hasUnnamedChild ? [] : {};
  let consumed = 0;
  if (hasDynamicChild(param)) {
    const offset = bytesToNumber(cursor.readBytes(sizeOfOffset));
    const start = staticPosition + offset;
    for (let i3 = 0; i3 < param.components.length; ++i3) {
      const component = param.components[i3];
      cursor.setPosition(start + consumed);
      const [data, consumed_] = decodeParameter(cursor, component, {
        staticPosition: start
      });
      consumed += consumed_;
      value[hasUnnamedChild ? i3 : component?.name] = data;
    }
    cursor.setPosition(staticPosition + 32);
    return [value, 32];
  }
  for (let i3 = 0; i3 < param.components.length; ++i3) {
    const component = param.components[i3];
    const [data, consumed_] = decodeParameter(cursor, component, {
      staticPosition
    });
    value[hasUnnamedChild ? i3 : component?.name] = data;
    consumed += consumed_;
  }
  return [value, consumed];
}
function decodeString(cursor, { staticPosition }) {
  const offset = bytesToNumber(cursor.readBytes(32));
  const start = staticPosition + offset;
  cursor.setPosition(start);
  const length = bytesToNumber(cursor.readBytes(32));
  if (length === 0) {
    cursor.setPosition(staticPosition + 32);
    return ["", 32];
  }
  const data = cursor.readBytes(length, 32);
  const value = bytesToString(trim2(data));
  cursor.setPosition(staticPosition + 32);
  return [value, 32];
}
function hasDynamicChild(param) {
  const { type } = param;
  if (type === "string")
    return true;
  if (type === "bytes")
    return true;
  if (type.endsWith("[]"))
    return true;
  if (type === "tuple")
    return param.components?.some(hasDynamicChild);
  const arrayComponents = getArrayComponents(param.type);
  if (arrayComponents && hasDynamicChild({ ...param, type: arrayComponents[1] }))
    return true;
  return false;
}
var sizeOfLength, sizeOfOffset;
var init_decodeAbiParameters = __esm({
  "node_modules/viem/_esm/utils/abi/decodeAbiParameters.js"() {
    init_abi();
    init_getAddress();
    init_cursor2();
    init_size();
    init_slice();
    init_trim();
    init_fromBytes();
    init_toBytes();
    init_toHex();
    init_encodeAbiParameters();
    sizeOfLength = 32;
    sizeOfOffset = 32;
  }
});

// node_modules/viem/_esm/utils/abi/decodeErrorResult.js
function decodeErrorResult(parameters) {
  const { abi: abi2, data } = parameters;
  const signature = slice(data, 0, 4);
  if (signature === "0x")
    throw new AbiDecodingZeroDataError();
  const abi_ = [...abi2 || [], solidityError, solidityPanic];
  const abiItem = abi_.find((x4) => x4.type === "error" && signature === toFunctionSelector(formatAbiItem2(x4)));
  if (!abiItem)
    throw new AbiErrorSignatureNotFoundError(signature, {
      docsPath: "/docs/contract/decodeErrorResult"
    });
  return {
    abiItem,
    args: "inputs" in abiItem && abiItem.inputs && abiItem.inputs.length > 0 ? decodeAbiParameters(abiItem.inputs, slice(data, 4)) : void 0,
    errorName: abiItem.name
  };
}
var init_decodeErrorResult = __esm({
  "node_modules/viem/_esm/utils/abi/decodeErrorResult.js"() {
    init_solidity();
    init_abi();
    init_slice();
    init_toFunctionSelector();
    init_decodeAbiParameters();
    init_formatAbiItem2();
  }
});

// node_modules/viem/_esm/utils/stringify.js
var stringify;
var init_stringify = __esm({
  "node_modules/viem/_esm/utils/stringify.js"() {
    stringify = (value, replacer, space) => JSON.stringify(value, (key, value_) => {
      const value2 = typeof value_ === "bigint" ? value_.toString() : value_;
      return typeof replacer === "function" ? replacer(key, value2) : value2;
    }, space);
  }
});

// node_modules/viem/_esm/utils/abi/formatAbiItemWithArgs.js
function formatAbiItemWithArgs({ abiItem, args, includeFunctionName = true, includeName = false }) {
  if (!("name" in abiItem))
    return;
  if (!("inputs" in abiItem))
    return;
  if (!abiItem.inputs)
    return;
  return `${includeFunctionName ? abiItem.name : ""}(${abiItem.inputs.map((input, i3) => `${includeName && input.name ? `${input.name}: ` : ""}${typeof args[i3] === "object" ? stringify(args[i3]) : args[i3]}`).join(", ")})`;
}
var init_formatAbiItemWithArgs = __esm({
  "node_modules/viem/_esm/utils/abi/formatAbiItemWithArgs.js"() {
    init_stringify();
  }
});

// node_modules/viem/_esm/constants/unit.js
var etherUnits, gweiUnits;
var init_unit = __esm({
  "node_modules/viem/_esm/constants/unit.js"() {
    etherUnits = {
      gwei: 9,
      wei: 18
    };
    gweiUnits = {
      ether: -9,
      wei: 9
    };
  }
});

// node_modules/viem/_esm/utils/unit/formatUnits.js
function formatUnits(value, decimals) {
  let display = value.toString();
  const negative = display.startsWith("-");
  if (negative)
    display = display.slice(1);
  display = display.padStart(decimals, "0");
  let [integer, fraction] = [
    display.slice(0, display.length - decimals),
    display.slice(display.length - decimals)
  ];
  fraction = fraction.replace(/(0+)$/, "");
  return `${negative ? "-" : ""}${integer || "0"}${fraction ? `.${fraction}` : ""}`;
}
var init_formatUnits = __esm({
  "node_modules/viem/_esm/utils/unit/formatUnits.js"() {
  }
});

// node_modules/viem/_esm/utils/unit/formatEther.js
function formatEther(wei, unit = "wei") {
  return formatUnits(wei, etherUnits[unit]);
}
var init_formatEther = __esm({
  "node_modules/viem/_esm/utils/unit/formatEther.js"() {
    init_unit();
    init_formatUnits();
  }
});

// node_modules/viem/_esm/utils/unit/formatGwei.js
function formatGwei(wei, unit = "wei") {
  return formatUnits(wei, gweiUnits[unit]);
}
var init_formatGwei = __esm({
  "node_modules/viem/_esm/utils/unit/formatGwei.js"() {
    init_unit();
    init_formatUnits();
  }
});

// node_modules/viem/_esm/errors/stateOverride.js
function prettyStateMapping(stateMapping) {
  return stateMapping.reduce((pretty, { slot, value }) => {
    return `${pretty}        ${slot}: ${value}
`;
  }, "");
}
function prettyStateOverride(stateOverride) {
  return stateOverride.reduce((pretty, { address, ...state }) => {
    let val = `${pretty}    ${address}:
`;
    if (state.nonce)
      val += `      nonce: ${state.nonce}
`;
    if (state.balance)
      val += `      balance: ${state.balance}
`;
    if (state.code)
      val += `      code: ${state.code}
`;
    if (state.state) {
      val += "      state:\n";
      val += prettyStateMapping(state.state);
    }
    if (state.stateDiff) {
      val += "      stateDiff:\n";
      val += prettyStateMapping(state.stateDiff);
    }
    return val;
  }, "  State Override:\n").slice(0, -1);
}
var AccountStateConflictError, StateAssignmentConflictError;
var init_stateOverride = __esm({
  "node_modules/viem/_esm/errors/stateOverride.js"() {
    init_base();
    AccountStateConflictError = class extends BaseError2 {
      constructor({ address }) {
        super(`State for account "${address}" is set multiple times.`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "AccountStateConflictError"
        });
      }
    };
    StateAssignmentConflictError = class extends BaseError2 {
      constructor() {
        super("state and stateDiff are set on the same account.");
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "StateAssignmentConflictError"
        });
      }
    };
  }
});

// node_modules/viem/_esm/errors/transaction.js
function prettyPrint(args) {
  const entries = Object.entries(args).map(([key, value]) => {
    if (value === void 0 || value === false)
      return null;
    return [key, value];
  }).filter(Boolean);
  const maxLength = entries.reduce((acc, [key]) => Math.max(acc, key.length), 0);
  return entries.map(([key, value]) => `  ${`${key}:`.padEnd(maxLength + 1)}  ${value}`).join("\n");
}
var FeeConflictError, InvalidSerializableTransactionError, TransactionExecutionError, TransactionNotFoundError, TransactionReceiptNotFoundError, WaitForTransactionReceiptTimeoutError;
var init_transaction = __esm({
  "node_modules/viem/_esm/errors/transaction.js"() {
    init_formatEther();
    init_formatGwei();
    init_base();
    FeeConflictError = class extends BaseError2 {
      constructor() {
        super([
          "Cannot specify both a `gasPrice` and a `maxFeePerGas`/`maxPriorityFeePerGas`.",
          "Use `maxFeePerGas`/`maxPriorityFeePerGas` for EIP-1559 compatible networks, and `gasPrice` for others."
        ].join("\n"));
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "FeeConflictError"
        });
      }
    };
    InvalidSerializableTransactionError = class extends BaseError2 {
      constructor({ transaction }) {
        super("Cannot infer a transaction type from provided transaction.", {
          metaMessages: [
            "Provided Transaction:",
            "{",
            prettyPrint(transaction),
            "}",
            "",
            "To infer the type, either provide:",
            "- a `type` to the Transaction, or",
            "- an EIP-1559 Transaction with `maxFeePerGas`, or",
            "- an EIP-2930 Transaction with `gasPrice` & `accessList`, or",
            "- an EIP-4844 Transaction with `blobs`, `blobVersionedHashes`, `sidecars`, or",
            "- a Legacy Transaction with `gasPrice`"
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidSerializableTransactionError"
        });
      }
    };
    TransactionExecutionError = class extends BaseError2 {
      constructor(cause, { account, docsPath: docsPath6, chain, data, gas, gasPrice, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value }) {
        const prettyArgs = prettyPrint({
          chain: chain && `${chain?.name} (id: ${chain?.id})`,
          from: account?.address,
          to,
          value: typeof value !== "undefined" && `${formatEther(value)} ${chain?.nativeCurrency?.symbol || "ETH"}`,
          data,
          gas,
          gasPrice: typeof gasPrice !== "undefined" && `${formatGwei(gasPrice)} gwei`,
          maxFeePerGas: typeof maxFeePerGas !== "undefined" && `${formatGwei(maxFeePerGas)} gwei`,
          maxPriorityFeePerGas: typeof maxPriorityFeePerGas !== "undefined" && `${formatGwei(maxPriorityFeePerGas)} gwei`,
          nonce
        });
        super(cause.shortMessage, {
          cause,
          docsPath: docsPath6,
          metaMessages: [
            ...cause.metaMessages ? [...cause.metaMessages, " "] : [],
            "Request Arguments:",
            prettyArgs
          ].filter(Boolean)
        });
        Object.defineProperty(this, "cause", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "TransactionExecutionError"
        });
        this.cause = cause;
      }
    };
    TransactionNotFoundError = class extends BaseError2 {
      constructor({ blockHash, blockNumber, blockTag, hash: hash3, index: index2 }) {
        let identifier = "Transaction";
        if (blockTag && index2 !== void 0)
          identifier = `Transaction at block time "${blockTag}" at index "${index2}"`;
        if (blockHash && index2 !== void 0)
          identifier = `Transaction at block hash "${blockHash}" at index "${index2}"`;
        if (blockNumber && index2 !== void 0)
          identifier = `Transaction at block number "${blockNumber}" at index "${index2}"`;
        if (hash3)
          identifier = `Transaction with hash "${hash3}"`;
        super(`${identifier} could not be found.`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "TransactionNotFoundError"
        });
      }
    };
    TransactionReceiptNotFoundError = class extends BaseError2 {
      constructor({ hash: hash3 }) {
        super(`Transaction receipt with hash "${hash3}" could not be found. The Transaction may not be processed on a block yet.`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "TransactionReceiptNotFoundError"
        });
      }
    };
    WaitForTransactionReceiptTimeoutError = class extends BaseError2 {
      constructor({ hash: hash3 }) {
        super(`Timed out while waiting for transaction with hash "${hash3}" to be confirmed.`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "WaitForTransactionReceiptTimeoutError"
        });
      }
    };
  }
});

// node_modules/viem/_esm/errors/contract.js
var CallExecutionError, ContractFunctionExecutionError, ContractFunctionRevertedError, ContractFunctionZeroDataError, CounterfactualDeploymentFailedError, RawContractError;
var init_contract = __esm({
  "node_modules/viem/_esm/errors/contract.js"() {
    init_parseAccount();
    init_solidity();
    init_decodeErrorResult();
    init_formatAbiItem2();
    init_formatAbiItemWithArgs();
    init_getAbiItem();
    init_formatEther();
    init_formatGwei();
    init_abi();
    init_base();
    init_stateOverride();
    init_transaction();
    init_utils2();
    CallExecutionError = class extends BaseError2 {
      constructor(cause, { account: account_, docsPath: docsPath6, chain, data, gas, gasPrice, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value, stateOverride }) {
        const account = account_ ? parseAccount(account_) : void 0;
        let prettyArgs = prettyPrint({
          from: account?.address,
          to,
          value: typeof value !== "undefined" && `${formatEther(value)} ${chain?.nativeCurrency?.symbol || "ETH"}`,
          data,
          gas,
          gasPrice: typeof gasPrice !== "undefined" && `${formatGwei(gasPrice)} gwei`,
          maxFeePerGas: typeof maxFeePerGas !== "undefined" && `${formatGwei(maxFeePerGas)} gwei`,
          maxPriorityFeePerGas: typeof maxPriorityFeePerGas !== "undefined" && `${formatGwei(maxPriorityFeePerGas)} gwei`,
          nonce
        });
        if (stateOverride) {
          prettyArgs += `
${prettyStateOverride(stateOverride)}`;
        }
        super(cause.shortMessage, {
          cause,
          docsPath: docsPath6,
          metaMessages: [
            ...cause.metaMessages ? [...cause.metaMessages, " "] : [],
            "Raw Call Arguments:",
            prettyArgs
          ].filter(Boolean)
        });
        Object.defineProperty(this, "cause", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "CallExecutionError"
        });
        this.cause = cause;
      }
    };
    ContractFunctionExecutionError = class extends BaseError2 {
      constructor(cause, { abi: abi2, args, contractAddress, docsPath: docsPath6, functionName, sender }) {
        const abiItem = getAbiItem({ abi: abi2, args, name: functionName });
        const formattedArgs = abiItem ? formatAbiItemWithArgs({
          abiItem,
          args,
          includeFunctionName: false,
          includeName: false
        }) : void 0;
        const functionWithParams = abiItem ? formatAbiItem2(abiItem, { includeName: true }) : void 0;
        const prettyArgs = prettyPrint({
          address: contractAddress && getContractAddress(contractAddress),
          function: functionWithParams,
          args: formattedArgs && formattedArgs !== "()" && `${[...Array(functionName?.length ?? 0).keys()].map(() => " ").join("")}${formattedArgs}`,
          sender
        });
        super(cause.shortMessage || `An unknown error occurred while executing the contract function "${functionName}".`, {
          cause,
          docsPath: docsPath6,
          metaMessages: [
            ...cause.metaMessages ? [...cause.metaMessages, " "] : [],
            prettyArgs && "Contract Call:",
            prettyArgs
          ].filter(Boolean)
        });
        Object.defineProperty(this, "abi", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "args", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "cause", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "contractAddress", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "formattedArgs", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "functionName", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "sender", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "ContractFunctionExecutionError"
        });
        this.abi = abi2;
        this.args = args;
        this.cause = cause;
        this.contractAddress = contractAddress;
        this.functionName = functionName;
        this.sender = sender;
      }
    };
    ContractFunctionRevertedError = class extends BaseError2 {
      constructor({ abi: abi2, data, functionName, message }) {
        let cause;
        let decodedData = void 0;
        let metaMessages;
        let reason;
        if (data && data !== "0x") {
          try {
            decodedData = decodeErrorResult({ abi: abi2, data });
            const { abiItem, errorName, args: errorArgs } = decodedData;
            if (errorName === "Error") {
              reason = errorArgs[0];
            } else if (errorName === "Panic") {
              const [firstArg] = errorArgs;
              reason = panicReasons[firstArg];
            } else {
              const errorWithParams = abiItem ? formatAbiItem2(abiItem, { includeName: true }) : void 0;
              const formattedArgs = abiItem && errorArgs ? formatAbiItemWithArgs({
                abiItem,
                args: errorArgs,
                includeFunctionName: false,
                includeName: false
              }) : void 0;
              metaMessages = [
                errorWithParams ? `Error: ${errorWithParams}` : "",
                formattedArgs && formattedArgs !== "()" ? `       ${[...Array(errorName?.length ?? 0).keys()].map(() => " ").join("")}${formattedArgs}` : ""
              ];
            }
          } catch (err) {
            cause = err;
          }
        } else if (message)
          reason = message;
        let signature;
        if (cause instanceof AbiErrorSignatureNotFoundError) {
          signature = cause.signature;
          metaMessages = [
            `Unable to decode signature "${signature}" as it was not found on the provided ABI.`,
            "Make sure you are using the correct ABI and that the error exists on it.",
            `You can look up the decoded signature here: https://openchain.xyz/signatures?query=${signature}.`
          ];
        }
        super(reason && reason !== "execution reverted" || signature ? [
          `The contract function "${functionName}" reverted with the following ${signature ? "signature" : "reason"}:`,
          reason || signature
        ].join("\n") : `The contract function "${functionName}" reverted.`, {
          cause,
          metaMessages
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "ContractFunctionRevertedError"
        });
        Object.defineProperty(this, "data", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "reason", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "signature", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.data = decodedData;
        this.reason = reason;
        this.signature = signature;
      }
    };
    ContractFunctionZeroDataError = class extends BaseError2 {
      constructor({ functionName }) {
        super(`The contract function "${functionName}" returned no data ("0x").`, {
          metaMessages: [
            "This could be due to any of the following:",
            `  - The contract does not have the function "${functionName}",`,
            "  - The parameters passed to the contract function may be invalid, or",
            "  - The address is not a contract."
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "ContractFunctionZeroDataError"
        });
      }
    };
    CounterfactualDeploymentFailedError = class extends BaseError2 {
      constructor({ factory: factory2 }) {
        super(`Deployment for counterfactual contract call failed${factory2 ? ` for factory "${factory2}".` : ""}`, {
          metaMessages: [
            "Please ensure:",
            "- The `factory` is a valid contract deployment factory (ie. Create2 Factory, ERC-4337 Factory, etc).",
            "- The `factoryData` is a valid encoded function call for contract deployment function on the factory."
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "CounterfactualDeploymentFailedError"
        });
      }
    };
    RawContractError = class extends BaseError2 {
      constructor({ data, message }) {
        super(message || "");
        Object.defineProperty(this, "code", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: 3
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "RawContractError"
        });
        Object.defineProperty(this, "data", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.data = data;
      }
    };
  }
});

// node_modules/viem/_esm/errors/request.js
var HttpRequestError, RpcRequestError, TimeoutError;
var init_request = __esm({
  "node_modules/viem/_esm/errors/request.js"() {
    init_stringify();
    init_base();
    init_utils2();
    HttpRequestError = class extends BaseError2 {
      constructor({ body, cause, details, headers, status, url }) {
        super("HTTP request failed.", {
          cause,
          details,
          metaMessages: [
            status && `Status: ${status}`,
            `URL: ${getUrl(url)}`,
            body && `Request body: ${stringify(body)}`
          ].filter(Boolean)
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "HttpRequestError"
        });
        Object.defineProperty(this, "body", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "headers", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "status", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "url", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.body = body;
        this.headers = headers;
        this.status = status;
        this.url = url;
      }
    };
    RpcRequestError = class extends BaseError2 {
      constructor({ body, error, url }) {
        super("RPC Request failed.", {
          cause: error,
          details: error.message,
          metaMessages: [`URL: ${getUrl(url)}`, `Request body: ${stringify(body)}`]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "RpcRequestError"
        });
        Object.defineProperty(this, "code", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.code = error.code;
      }
    };
    TimeoutError = class extends BaseError2 {
      constructor({ body, url }) {
        super("The request took too long to respond.", {
          details: "The request timed out.",
          metaMessages: [`URL: ${getUrl(url)}`, `Request body: ${stringify(body)}`]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "TimeoutError"
        });
      }
    };
  }
});

// node_modules/viem/_esm/errors/rpc.js
var unknownErrorCode, RpcError, ProviderRpcError, ParseRpcError, InvalidRequestRpcError, MethodNotFoundRpcError, InvalidParamsRpcError, InternalRpcError, InvalidInputRpcError, ResourceNotFoundRpcError, ResourceUnavailableRpcError, TransactionRejectedRpcError, MethodNotSupportedRpcError, LimitExceededRpcError, JsonRpcVersionUnsupportedError, UserRejectedRequestError, UnauthorizedProviderError, UnsupportedProviderMethodError, ProviderDisconnectedError, ChainDisconnectedError, SwitchChainError, UnknownRpcError;
var init_rpc = __esm({
  "node_modules/viem/_esm/errors/rpc.js"() {
    init_base();
    init_request();
    unknownErrorCode = -1;
    RpcError = class extends BaseError2 {
      constructor(cause, { code, docsPath: docsPath6, metaMessages, shortMessage }) {
        super(shortMessage, {
          cause,
          docsPath: docsPath6,
          metaMessages: metaMessages || cause?.metaMessages
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "RpcError"
        });
        Object.defineProperty(this, "code", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.name = cause.name;
        this.code = cause instanceof RpcRequestError ? cause.code : code ?? unknownErrorCode;
      }
    };
    ProviderRpcError = class extends RpcError {
      constructor(cause, options) {
        super(cause, options);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "ProviderRpcError"
        });
        Object.defineProperty(this, "data", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.data = options.data;
      }
    };
    ParseRpcError = class _ParseRpcError extends RpcError {
      constructor(cause) {
        super(cause, {
          code: _ParseRpcError.code,
          shortMessage: "Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text."
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "ParseRpcError"
        });
      }
    };
    Object.defineProperty(ParseRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32700
    });
    InvalidRequestRpcError = class _InvalidRequestRpcError extends RpcError {
      constructor(cause) {
        super(cause, {
          code: _InvalidRequestRpcError.code,
          shortMessage: "JSON is not a valid request object."
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidRequestRpcError"
        });
      }
    };
    Object.defineProperty(InvalidRequestRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32600
    });
    MethodNotFoundRpcError = class _MethodNotFoundRpcError extends RpcError {
      constructor(cause, { method } = {}) {
        super(cause, {
          code: _MethodNotFoundRpcError.code,
          shortMessage: `The method${method ? ` "${method}"` : ""} does not exist / is not available.`
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "MethodNotFoundRpcError"
        });
      }
    };
    Object.defineProperty(MethodNotFoundRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32601
    });
    InvalidParamsRpcError = class _InvalidParamsRpcError extends RpcError {
      constructor(cause) {
        super(cause, {
          code: _InvalidParamsRpcError.code,
          shortMessage: [
            "Invalid parameters were provided to the RPC method.",
            "Double check you have provided the correct parameters."
          ].join("\n")
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidParamsRpcError"
        });
      }
    };
    Object.defineProperty(InvalidParamsRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32602
    });
    InternalRpcError = class _InternalRpcError extends RpcError {
      constructor(cause) {
        super(cause, {
          code: _InternalRpcError.code,
          shortMessage: "An internal error was received."
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InternalRpcError"
        });
      }
    };
    Object.defineProperty(InternalRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32603
    });
    InvalidInputRpcError = class _InvalidInputRpcError extends RpcError {
      constructor(cause) {
        super(cause, {
          code: _InvalidInputRpcError.code,
          shortMessage: [
            "Missing or invalid parameters.",
            "Double check you have provided the correct parameters."
          ].join("\n")
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidInputRpcError"
        });
      }
    };
    Object.defineProperty(InvalidInputRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32e3
    });
    ResourceNotFoundRpcError = class _ResourceNotFoundRpcError extends RpcError {
      constructor(cause) {
        super(cause, {
          code: _ResourceNotFoundRpcError.code,
          shortMessage: "Requested resource not found."
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "ResourceNotFoundRpcError"
        });
      }
    };
    Object.defineProperty(ResourceNotFoundRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32001
    });
    ResourceUnavailableRpcError = class _ResourceUnavailableRpcError extends RpcError {
      constructor(cause) {
        super(cause, {
          code: _ResourceUnavailableRpcError.code,
          shortMessage: "Requested resource not available."
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "ResourceUnavailableRpcError"
        });
      }
    };
    Object.defineProperty(ResourceUnavailableRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32002
    });
    TransactionRejectedRpcError = class _TransactionRejectedRpcError extends RpcError {
      constructor(cause) {
        super(cause, {
          code: _TransactionRejectedRpcError.code,
          shortMessage: "Transaction creation failed."
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "TransactionRejectedRpcError"
        });
      }
    };
    Object.defineProperty(TransactionRejectedRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32003
    });
    MethodNotSupportedRpcError = class _MethodNotSupportedRpcError extends RpcError {
      constructor(cause, { method } = {}) {
        super(cause, {
          code: _MethodNotSupportedRpcError.code,
          shortMessage: `Method${method ? ` "${method}"` : ""} is not implemented.`
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "MethodNotSupportedRpcError"
        });
      }
    };
    Object.defineProperty(MethodNotSupportedRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32004
    });
    LimitExceededRpcError = class _LimitExceededRpcError extends RpcError {
      constructor(cause) {
        super(cause, {
          code: _LimitExceededRpcError.code,
          shortMessage: "Request exceeds defined limit."
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "LimitExceededRpcError"
        });
      }
    };
    Object.defineProperty(LimitExceededRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32005
    });
    JsonRpcVersionUnsupportedError = class _JsonRpcVersionUnsupportedError extends RpcError {
      constructor(cause) {
        super(cause, {
          code: _JsonRpcVersionUnsupportedError.code,
          shortMessage: "Version of JSON-RPC protocol is not supported."
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "JsonRpcVersionUnsupportedError"
        });
      }
    };
    Object.defineProperty(JsonRpcVersionUnsupportedError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32006
    });
    UserRejectedRequestError = class _UserRejectedRequestError extends ProviderRpcError {
      constructor(cause) {
        super(cause, {
          code: _UserRejectedRequestError.code,
          shortMessage: "User rejected the request."
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "UserRejectedRequestError"
        });
      }
    };
    Object.defineProperty(UserRejectedRequestError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 4001
    });
    UnauthorizedProviderError = class _UnauthorizedProviderError extends ProviderRpcError {
      constructor(cause) {
        super(cause, {
          code: _UnauthorizedProviderError.code,
          shortMessage: "The requested method and/or account has not been authorized by the user."
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "UnauthorizedProviderError"
        });
      }
    };
    Object.defineProperty(UnauthorizedProviderError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 4100
    });
    UnsupportedProviderMethodError = class _UnsupportedProviderMethodError extends ProviderRpcError {
      constructor(cause, { method } = {}) {
        super(cause, {
          code: _UnsupportedProviderMethodError.code,
          shortMessage: `The Provider does not support the requested method${method ? ` " ${method}"` : ""}.`
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "UnsupportedProviderMethodError"
        });
      }
    };
    Object.defineProperty(UnsupportedProviderMethodError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 4200
    });
    ProviderDisconnectedError = class _ProviderDisconnectedError extends ProviderRpcError {
      constructor(cause) {
        super(cause, {
          code: _ProviderDisconnectedError.code,
          shortMessage: "The Provider is disconnected from all chains."
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "ProviderDisconnectedError"
        });
      }
    };
    Object.defineProperty(ProviderDisconnectedError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 4900
    });
    ChainDisconnectedError = class _ChainDisconnectedError extends ProviderRpcError {
      constructor(cause) {
        super(cause, {
          code: _ChainDisconnectedError.code,
          shortMessage: "The Provider is not connected to the requested chain."
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "ChainDisconnectedError"
        });
      }
    };
    Object.defineProperty(ChainDisconnectedError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 4901
    });
    SwitchChainError = class _SwitchChainError extends ProviderRpcError {
      constructor(cause) {
        super(cause, {
          code: _SwitchChainError.code,
          shortMessage: "An error occurred when attempting to switch chain."
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "SwitchChainError"
        });
      }
    };
    Object.defineProperty(SwitchChainError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 4902
    });
    UnknownRpcError = class extends RpcError {
      constructor(cause) {
        super(cause, {
          shortMessage: "An unknown RPC error occurred."
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "UnknownRpcError"
        });
      }
    };
  }
});

// node_modules/viem/_esm/errors/node.js
var ExecutionRevertedError, FeeCapTooHighError, FeeCapTooLowError, NonceTooHighError, NonceTooLowError, NonceMaxValueError, InsufficientFundsError, IntrinsicGasTooHighError, IntrinsicGasTooLowError, TransactionTypeNotSupportedError, TipAboveFeeCapError, UnknownNodeError;
var init_node = __esm({
  "node_modules/viem/_esm/errors/node.js"() {
    init_formatGwei();
    init_base();
    ExecutionRevertedError = class extends BaseError2 {
      constructor({ cause, message } = {}) {
        const reason = message?.replace("execution reverted: ", "")?.replace("execution reverted", "");
        super(`Execution reverted ${reason ? `with reason: ${reason}` : "for an unknown reason"}.`, {
          cause
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "ExecutionRevertedError"
        });
      }
    };
    Object.defineProperty(ExecutionRevertedError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 3
    });
    Object.defineProperty(ExecutionRevertedError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /execution reverted/
    });
    FeeCapTooHighError = class extends BaseError2 {
      constructor({ cause, maxFeePerGas } = {}) {
        super(`The fee cap (\`maxFeePerGas\`${maxFeePerGas ? ` = ${formatGwei(maxFeePerGas)} gwei` : ""}) cannot be higher than the maximum allowed value (2^256-1).`, {
          cause
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "FeeCapTooHigh"
        });
      }
    };
    Object.defineProperty(FeeCapTooHighError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /max fee per gas higher than 2\^256-1|fee cap higher than 2\^256-1/
    });
    FeeCapTooLowError = class extends BaseError2 {
      constructor({ cause, maxFeePerGas } = {}) {
        super(`The fee cap (\`maxFeePerGas\`${maxFeePerGas ? ` = ${formatGwei(maxFeePerGas)}` : ""} gwei) cannot be lower than the block base fee.`, {
          cause
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "FeeCapTooLow"
        });
      }
    };
    Object.defineProperty(FeeCapTooLowError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /max fee per gas less than block base fee|fee cap less than block base fee|transaction is outdated/
    });
    NonceTooHighError = class extends BaseError2 {
      constructor({ cause, nonce } = {}) {
        super(`Nonce provided for the transaction ${nonce ? `(${nonce}) ` : ""}is higher than the next one expected.`, { cause });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "NonceTooHighError"
        });
      }
    };
    Object.defineProperty(NonceTooHighError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /nonce too high/
    });
    NonceTooLowError = class extends BaseError2 {
      constructor({ cause, nonce } = {}) {
        super([
          `Nonce provided for the transaction ${nonce ? `(${nonce}) ` : ""}is lower than the current nonce of the account.`,
          "Try increasing the nonce or find the latest nonce with `getTransactionCount`."
        ].join("\n"), { cause });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "NonceTooLowError"
        });
      }
    };
    Object.defineProperty(NonceTooLowError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /nonce too low|transaction already imported|already known/
    });
    NonceMaxValueError = class extends BaseError2 {
      constructor({ cause, nonce } = {}) {
        super(`Nonce provided for the transaction ${nonce ? `(${nonce}) ` : ""}exceeds the maximum allowed nonce.`, { cause });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "NonceMaxValueError"
        });
      }
    };
    Object.defineProperty(NonceMaxValueError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /nonce has max value/
    });
    InsufficientFundsError = class extends BaseError2 {
      constructor({ cause } = {}) {
        super([
          "The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account."
        ].join("\n"), {
          cause,
          metaMessages: [
            "This error could arise when the account does not have enough funds to:",
            " - pay for the total gas fee,",
            " - pay for the value to send.",
            " ",
            "The cost of the transaction is calculated as `gas * gas fee + value`, where:",
            " - `gas` is the amount of gas needed for transaction to execute,",
            " - `gas fee` is the gas fee,",
            " - `value` is the amount of ether to send to the recipient."
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InsufficientFundsError"
        });
      }
    };
    Object.defineProperty(InsufficientFundsError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /insufficient funds/
    });
    IntrinsicGasTooHighError = class extends BaseError2 {
      constructor({ cause, gas } = {}) {
        super(`The amount of gas ${gas ? `(${gas}) ` : ""}provided for the transaction exceeds the limit allowed for the block.`, {
          cause
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "IntrinsicGasTooHighError"
        });
      }
    };
    Object.defineProperty(IntrinsicGasTooHighError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /intrinsic gas too high|gas limit reached/
    });
    IntrinsicGasTooLowError = class extends BaseError2 {
      constructor({ cause, gas } = {}) {
        super(`The amount of gas ${gas ? `(${gas}) ` : ""}provided for the transaction is too low.`, {
          cause
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "IntrinsicGasTooLowError"
        });
      }
    };
    Object.defineProperty(IntrinsicGasTooLowError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /intrinsic gas too low/
    });
    TransactionTypeNotSupportedError = class extends BaseError2 {
      constructor({ cause }) {
        super("The transaction type is not supported for this chain.", {
          cause
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "TransactionTypeNotSupportedError"
        });
      }
    };
    Object.defineProperty(TransactionTypeNotSupportedError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /transaction type not valid/
    });
    TipAboveFeeCapError = class extends BaseError2 {
      constructor({ cause, maxPriorityFeePerGas, maxFeePerGas } = {}) {
        super([
          `The provided tip (\`maxPriorityFeePerGas\`${maxPriorityFeePerGas ? ` = ${formatGwei(maxPriorityFeePerGas)} gwei` : ""}) cannot be higher than the fee cap (\`maxFeePerGas\`${maxFeePerGas ? ` = ${formatGwei(maxFeePerGas)} gwei` : ""}).`
        ].join("\n"), {
          cause
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "TipAboveFeeCapError"
        });
      }
    };
    Object.defineProperty(TipAboveFeeCapError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /max priority fee per gas higher than max fee per gas|tip higher than fee cap/
    });
    UnknownNodeError = class extends BaseError2 {
      constructor({ cause }) {
        super(`An error occurred while executing: ${cause?.shortMessage}`, {
          cause
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "UnknownNodeError"
        });
      }
    };
  }
});

// node_modules/viem/_esm/utils/errors/getNodeError.js
function getNodeError(err, args) {
  const message = (err.details || "").toLowerCase();
  const executionRevertedError = err instanceof BaseError2 ? err.walk((e3) => e3.code === ExecutionRevertedError.code) : err;
  if (executionRevertedError instanceof BaseError2)
    return new ExecutionRevertedError({
      cause: err,
      message: executionRevertedError.details
    });
  if (ExecutionRevertedError.nodeMessage.test(message))
    return new ExecutionRevertedError({
      cause: err,
      message: err.details
    });
  if (FeeCapTooHighError.nodeMessage.test(message))
    return new FeeCapTooHighError({
      cause: err,
      maxFeePerGas: args?.maxFeePerGas
    });
  if (FeeCapTooLowError.nodeMessage.test(message))
    return new FeeCapTooLowError({
      cause: err,
      maxFeePerGas: args?.maxFeePerGas
    });
  if (NonceTooHighError.nodeMessage.test(message))
    return new NonceTooHighError({ cause: err, nonce: args?.nonce });
  if (NonceTooLowError.nodeMessage.test(message))
    return new NonceTooLowError({ cause: err, nonce: args?.nonce });
  if (NonceMaxValueError.nodeMessage.test(message))
    return new NonceMaxValueError({ cause: err, nonce: args?.nonce });
  if (InsufficientFundsError.nodeMessage.test(message))
    return new InsufficientFundsError({ cause: err });
  if (IntrinsicGasTooHighError.nodeMessage.test(message))
    return new IntrinsicGasTooHighError({ cause: err, gas: args?.gas });
  if (IntrinsicGasTooLowError.nodeMessage.test(message))
    return new IntrinsicGasTooLowError({ cause: err, gas: args?.gas });
  if (TransactionTypeNotSupportedError.nodeMessage.test(message))
    return new TransactionTypeNotSupportedError({ cause: err });
  if (TipAboveFeeCapError.nodeMessage.test(message))
    return new TipAboveFeeCapError({
      cause: err,
      maxFeePerGas: args?.maxFeePerGas,
      maxPriorityFeePerGas: args?.maxPriorityFeePerGas
    });
  return new UnknownNodeError({
    cause: err
  });
}
var init_getNodeError = __esm({
  "node_modules/viem/_esm/utils/errors/getNodeError.js"() {
    init_base();
    init_node();
  }
});

// node_modules/viem/_esm/utils/formatters/extract.js
function extract(value_, { format }) {
  if (!format)
    return {};
  const value = {};
  function extract_(formatted2) {
    const keys = Object.keys(formatted2);
    for (const key of keys) {
      if (key in value_)
        value[key] = value_[key];
      if (formatted2[key] && typeof formatted2[key] === "object" && !Array.isArray(formatted2[key]))
        extract_(formatted2[key]);
    }
  }
  const formatted = format(value_ || {});
  extract_(formatted);
  return value;
}
var init_extract = __esm({
  "node_modules/viem/_esm/utils/formatters/extract.js"() {
  }
});

// node_modules/viem/_esm/utils/formatters/transactionRequest.js
function formatTransactionRequest(request) {
  const rpcRequest = {};
  if (typeof request.accessList !== "undefined")
    rpcRequest.accessList = request.accessList;
  if (typeof request.blobVersionedHashes !== "undefined")
    rpcRequest.blobVersionedHashes = request.blobVersionedHashes;
  if (typeof request.blobs !== "undefined") {
    if (typeof request.blobs[0] !== "string")
      rpcRequest.blobs = request.blobs.map((x4) => bytesToHex(x4));
    else
      rpcRequest.blobs = request.blobs;
  }
  if (typeof request.data !== "undefined")
    rpcRequest.data = request.data;
  if (typeof request.from !== "undefined")
    rpcRequest.from = request.from;
  if (typeof request.gas !== "undefined")
    rpcRequest.gas = numberToHex(request.gas);
  if (typeof request.gasPrice !== "undefined")
    rpcRequest.gasPrice = numberToHex(request.gasPrice);
  if (typeof request.maxFeePerBlobGas !== "undefined")
    rpcRequest.maxFeePerBlobGas = numberToHex(request.maxFeePerBlobGas);
  if (typeof request.maxFeePerGas !== "undefined")
    rpcRequest.maxFeePerGas = numberToHex(request.maxFeePerGas);
  if (typeof request.maxPriorityFeePerGas !== "undefined")
    rpcRequest.maxPriorityFeePerGas = numberToHex(request.maxPriorityFeePerGas);
  if (typeof request.nonce !== "undefined")
    rpcRequest.nonce = numberToHex(request.nonce);
  if (typeof request.to !== "undefined")
    rpcRequest.to = request.to;
  if (typeof request.type !== "undefined")
    rpcRequest.type = rpcTransactionType[request.type];
  if (typeof request.value !== "undefined")
    rpcRequest.value = numberToHex(request.value);
  return rpcRequest;
}
var rpcTransactionType;
var init_transactionRequest = __esm({
  "node_modules/viem/_esm/utils/formatters/transactionRequest.js"() {
    init_toHex();
    rpcTransactionType = {
      legacy: "0x0",
      eip2930: "0x1",
      eip1559: "0x2",
      eip4844: "0x3"
    };
  }
});

// node_modules/viem/_esm/utils/stateOverride.js
function serializeStateMapping(stateMapping) {
  if (!stateMapping || stateMapping.length === 0)
    return void 0;
  return stateMapping.reduce((acc, { slot, value }) => {
    if (slot.length !== 66)
      throw new InvalidBytesLengthError({
        size: slot.length,
        targetSize: 66,
        type: "hex"
      });
    if (value.length !== 66)
      throw new InvalidBytesLengthError({
        size: value.length,
        targetSize: 66,
        type: "hex"
      });
    acc[slot] = value;
    return acc;
  }, {});
}
function serializeAccountStateOverride(parameters) {
  const { balance, nonce, state, stateDiff, code } = parameters;
  const rpcAccountStateOverride = {};
  if (code !== void 0)
    rpcAccountStateOverride.code = code;
  if (balance !== void 0)
    rpcAccountStateOverride.balance = numberToHex(balance);
  if (nonce !== void 0)
    rpcAccountStateOverride.nonce = numberToHex(nonce);
  if (state !== void 0)
    rpcAccountStateOverride.state = serializeStateMapping(state);
  if (stateDiff !== void 0) {
    if (rpcAccountStateOverride.state)
      throw new StateAssignmentConflictError();
    rpcAccountStateOverride.stateDiff = serializeStateMapping(stateDiff);
  }
  return rpcAccountStateOverride;
}
function serializeStateOverride(parameters) {
  if (!parameters)
    return void 0;
  const rpcStateOverride = {};
  for (const { address, ...accountState } of parameters) {
    if (!isAddress(address, { strict: false }))
      throw new InvalidAddressError({ address });
    if (rpcStateOverride[address])
      throw new AccountStateConflictError({ address });
    rpcStateOverride[address] = serializeAccountStateOverride(accountState);
  }
  return rpcStateOverride;
}
var init_stateOverride2 = __esm({
  "node_modules/viem/_esm/utils/stateOverride.js"() {
    init_address();
    init_data();
    init_stateOverride();
    init_isAddress();
    init_toHex();
  }
});

// node_modules/viem/_esm/utils/transaction/assertRequest.js
function assertRequest(args) {
  const { account: account_, gasPrice, maxFeePerGas, maxPriorityFeePerGas, to } = args;
  const account = account_ ? parseAccount(account_) : void 0;
  if (account && !isAddress(account.address))
    throw new InvalidAddressError({ address: account.address });
  if (to && !isAddress(to))
    throw new InvalidAddressError({ address: to });
  if (typeof gasPrice !== "undefined" && (typeof maxFeePerGas !== "undefined" || typeof maxPriorityFeePerGas !== "undefined"))
    throw new FeeConflictError();
  if (maxFeePerGas && maxFeePerGas > 2n ** 256n - 1n)
    throw new FeeCapTooHighError({ maxFeePerGas });
  if (maxPriorityFeePerGas && maxFeePerGas && maxPriorityFeePerGas > maxFeePerGas)
    throw new TipAboveFeeCapError({ maxFeePerGas, maxPriorityFeePerGas });
}
var init_assertRequest = __esm({
  "node_modules/viem/_esm/utils/transaction/assertRequest.js"() {
    init_parseAccount();
    init_address();
    init_node();
    init_transaction();
    init_isAddress();
  }
});

// node_modules/@noble/hashes/esm/_md.js
function setBigUint64(view, byteOffset, value, isLE2) {
  if (typeof view.setBigUint64 === "function")
    return view.setBigUint64(byteOffset, value, isLE2);
  const _32n2 = BigInt(32);
  const _u32_max = BigInt(4294967295);
  const wh = Number(value >> _32n2 & _u32_max);
  const wl = Number(value & _u32_max);
  const h4 = isLE2 ? 4 : 0;
  const l3 = isLE2 ? 0 : 4;
  view.setUint32(byteOffset + h4, wh, isLE2);
  view.setUint32(byteOffset + l3, wl, isLE2);
}
var Chi, Maj, HashMD;
var init_md = __esm({
  "node_modules/@noble/hashes/esm/_md.js"() {
    init_assert();
    init_utils3();
    Chi = (a3, b4, c3) => a3 & b4 ^ ~a3 & c3;
    Maj = (a3, b4, c3) => a3 & b4 ^ a3 & c3 ^ b4 & c3;
    HashMD = class extends Hash {
      constructor(blockLen, outputLen, padOffset, isLE2) {
        super();
        this.blockLen = blockLen;
        this.outputLen = outputLen;
        this.padOffset = padOffset;
        this.isLE = isLE2;
        this.finished = false;
        this.length = 0;
        this.pos = 0;
        this.destroyed = false;
        this.buffer = new Uint8Array(blockLen);
        this.view = createView(this.buffer);
      }
      update(data) {
        exists(this);
        const { view, buffer: buffer2, blockLen } = this;
        data = toBytes2(data);
        const len = data.length;
        for (let pos = 0; pos < len; ) {
          const take = Math.min(blockLen - this.pos, len - pos);
          if (take === blockLen) {
            const dataView = createView(data);
            for (; blockLen <= len - pos; pos += blockLen)
              this.process(dataView, pos);
            continue;
          }
          buffer2.set(data.subarray(pos, pos + take), this.pos);
          this.pos += take;
          pos += take;
          if (this.pos === blockLen) {
            this.process(view, 0);
            this.pos = 0;
          }
        }
        this.length += data.length;
        this.roundClean();
        return this;
      }
      digestInto(out) {
        exists(this);
        output(out, this);
        this.finished = true;
        const { buffer: buffer2, view, blockLen, isLE: isLE2 } = this;
        let { pos } = this;
        buffer2[pos++] = 128;
        this.buffer.subarray(pos).fill(0);
        if (this.padOffset > blockLen - pos) {
          this.process(view, 0);
          pos = 0;
        }
        for (let i3 = pos; i3 < blockLen; i3++)
          buffer2[i3] = 0;
        setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE2);
        this.process(view, 0);
        const oview = createView(out);
        const len = this.outputLen;
        if (len % 4)
          throw new Error("_sha2: outputLen should be aligned to 32bit");
        const outLen = len / 4;
        const state = this.get();
        if (outLen > state.length)
          throw new Error("_sha2: outputLen bigger than state");
        for (let i3 = 0; i3 < outLen; i3++)
          oview.setUint32(4 * i3, state[i3], isLE2);
      }
      digest() {
        const { buffer: buffer2, outputLen } = this;
        this.digestInto(buffer2);
        const res = buffer2.slice(0, outputLen);
        this.destroy();
        return res;
      }
      _cloneInto(to) {
        to || (to = new this.constructor());
        to.set(...this.get());
        const { blockLen, buffer: buffer2, length, finished, destroyed, pos } = this;
        to.length = length;
        to.pos = pos;
        to.finished = finished;
        to.destroyed = destroyed;
        if (length % blockLen)
          to.buffer.set(buffer2);
        return to;
      }
    };
  }
});

// node_modules/@noble/hashes/esm/sha256.js
var SHA256_K, SHA256_IV, SHA256_W, SHA256, sha256;
var init_sha256 = __esm({
  "node_modules/@noble/hashes/esm/sha256.js"() {
    init_md();
    init_utils3();
    SHA256_K = /* @__PURE__ */ new Uint32Array([
      1116352408,
      1899447441,
      3049323471,
      3921009573,
      961987163,
      1508970993,
      2453635748,
      2870763221,
      3624381080,
      310598401,
      607225278,
      1426881987,
      1925078388,
      2162078206,
      2614888103,
      3248222580,
      3835390401,
      4022224774,
      264347078,
      604807628,
      770255983,
      1249150122,
      1555081692,
      1996064986,
      2554220882,
      2821834349,
      2952996808,
      3210313671,
      3336571891,
      3584528711,
      113926993,
      338241895,
      666307205,
      773529912,
      1294757372,
      1396182291,
      1695183700,
      1986661051,
      2177026350,
      2456956037,
      2730485921,
      2820302411,
      3259730800,
      3345764771,
      3516065817,
      3600352804,
      4094571909,
      275423344,
      430227734,
      506948616,
      659060556,
      883997877,
      958139571,
      1322822218,
      1537002063,
      1747873779,
      1955562222,
      2024104815,
      2227730452,
      2361852424,
      2428436474,
      2756734187,
      3204031479,
      3329325298
    ]);
    SHA256_IV = /* @__PURE__ */ new Uint32Array([
      1779033703,
      3144134277,
      1013904242,
      2773480762,
      1359893119,
      2600822924,
      528734635,
      1541459225
    ]);
    SHA256_W = /* @__PURE__ */ new Uint32Array(64);
    SHA256 = class extends HashMD {
      constructor() {
        super(64, 32, 8, false);
        this.A = SHA256_IV[0] | 0;
        this.B = SHA256_IV[1] | 0;
        this.C = SHA256_IV[2] | 0;
        this.D = SHA256_IV[3] | 0;
        this.E = SHA256_IV[4] | 0;
        this.F = SHA256_IV[5] | 0;
        this.G = SHA256_IV[6] | 0;
        this.H = SHA256_IV[7] | 0;
      }
      get() {
        const { A: A5, B: B5, C: C4, D: D5, E: E5, F: F5, G: G5, H: H4 } = this;
        return [A5, B5, C4, D5, E5, F5, G5, H4];
      }
      // prettier-ignore
      set(A5, B5, C4, D5, E5, F5, G5, H4) {
        this.A = A5 | 0;
        this.B = B5 | 0;
        this.C = C4 | 0;
        this.D = D5 | 0;
        this.E = E5 | 0;
        this.F = F5 | 0;
        this.G = G5 | 0;
        this.H = H4 | 0;
      }
      process(view, offset) {
        for (let i3 = 0; i3 < 16; i3++, offset += 4)
          SHA256_W[i3] = view.getUint32(offset, false);
        for (let i3 = 16; i3 < 64; i3++) {
          const W15 = SHA256_W[i3 - 15];
          const W22 = SHA256_W[i3 - 2];
          const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
          const s1 = rotr(W22, 17) ^ rotr(W22, 19) ^ W22 >>> 10;
          SHA256_W[i3] = s1 + SHA256_W[i3 - 7] + s0 + SHA256_W[i3 - 16] | 0;
        }
        let { A: A5, B: B5, C: C4, D: D5, E: E5, F: F5, G: G5, H: H4 } = this;
        for (let i3 = 0; i3 < 64; i3++) {
          const sigma1 = rotr(E5, 6) ^ rotr(E5, 11) ^ rotr(E5, 25);
          const T1 = H4 + sigma1 + Chi(E5, F5, G5) + SHA256_K[i3] + SHA256_W[i3] | 0;
          const sigma0 = rotr(A5, 2) ^ rotr(A5, 13) ^ rotr(A5, 22);
          const T22 = sigma0 + Maj(A5, B5, C4) | 0;
          H4 = G5;
          G5 = F5;
          F5 = E5;
          E5 = D5 + T1 | 0;
          D5 = C4;
          C4 = B5;
          B5 = A5;
          A5 = T1 + T22 | 0;
        }
        A5 = A5 + this.A | 0;
        B5 = B5 + this.B | 0;
        C4 = C4 + this.C | 0;
        D5 = D5 + this.D | 0;
        E5 = E5 + this.E | 0;
        F5 = F5 + this.F | 0;
        G5 = G5 + this.G | 0;
        H4 = H4 + this.H | 0;
        this.set(A5, B5, C4, D5, E5, F5, G5, H4);
      }
      roundClean() {
        SHA256_W.fill(0);
      }
      destroy() {
        this.set(0, 0, 0, 0, 0, 0, 0, 0);
        this.buffer.fill(0);
      }
    };
    sha256 = /* @__PURE__ */ wrapConstructor(() => new SHA256());
  }
});

// node_modules/viem/_esm/utils/address/isAddressEqual.js
function isAddressEqual(a3, b4) {
  if (!isAddress(a3, { strict: false }))
    throw new InvalidAddressError({ address: a3 });
  if (!isAddress(b4, { strict: false }))
    throw new InvalidAddressError({ address: b4 });
  return a3.toLowerCase() === b4.toLowerCase();
}
var init_isAddressEqual = __esm({
  "node_modules/viem/_esm/utils/address/isAddressEqual.js"() {
    init_address();
    init_isAddress();
  }
});

// node_modules/viem/_esm/utils/abi/decodeFunctionResult.js
function decodeFunctionResult(parameters) {
  const { abi: abi2, args, functionName, data } = parameters;
  let abiItem = abi2[0];
  if (functionName) {
    const item = getAbiItem({ abi: abi2, args, name: functionName });
    if (!item)
      throw new AbiFunctionNotFoundError(functionName, { docsPath: docsPath4 });
    abiItem = item;
  }
  if (abiItem.type !== "function")
    throw new AbiFunctionNotFoundError(void 0, { docsPath: docsPath4 });
  if (!abiItem.outputs)
    throw new AbiFunctionOutputsNotFoundError(abiItem.name, { docsPath: docsPath4 });
  const values = decodeAbiParameters(abiItem.outputs, data);
  if (values && values.length > 1)
    return values;
  if (values && values.length === 1)
    return values[0];
  return void 0;
}
var docsPath4;
var init_decodeFunctionResult = __esm({
  "node_modules/viem/_esm/utils/abi/decodeFunctionResult.js"() {
    init_abi();
    init_decodeAbiParameters();
    init_getAbiItem();
    docsPath4 = "/docs/contract/decodeFunctionResult";
  }
});

// node_modules/viem/_esm/constants/abis.js
var multicall3Abi, universalResolverErrors, universalResolverResolveAbi, universalResolverReverseAbi, textResolverAbi, addressResolverAbi, universalSignatureValidatorAbi;
var init_abis = __esm({
  "node_modules/viem/_esm/constants/abis.js"() {
    multicall3Abi = [
      {
        inputs: [
          {
            components: [
              {
                name: "target",
                type: "address"
              },
              {
                name: "allowFailure",
                type: "bool"
              },
              {
                name: "callData",
                type: "bytes"
              }
            ],
            name: "calls",
            type: "tuple[]"
          }
        ],
        name: "aggregate3",
        outputs: [
          {
            components: [
              {
                name: "success",
                type: "bool"
              },
              {
                name: "returnData",
                type: "bytes"
              }
            ],
            name: "returnData",
            type: "tuple[]"
          }
        ],
        stateMutability: "view",
        type: "function"
      }
    ];
    universalResolverErrors = [
      {
        inputs: [],
        name: "ResolverNotFound",
        type: "error"
      },
      {
        inputs: [],
        name: "ResolverWildcardNotSupported",
        type: "error"
      },
      {
        inputs: [],
        name: "ResolverNotContract",
        type: "error"
      },
      {
        inputs: [
          {
            name: "returnData",
            type: "bytes"
          }
        ],
        name: "ResolverError",
        type: "error"
      },
      {
        inputs: [
          {
            components: [
              {
                name: "status",
                type: "uint16"
              },
              {
                name: "message",
                type: "string"
              }
            ],
            name: "errors",
            type: "tuple[]"
          }
        ],
        name: "HttpError",
        type: "error"
      }
    ];
    universalResolverResolveAbi = [
      ...universalResolverErrors,
      {
        name: "resolve",
        type: "function",
        stateMutability: "view",
        inputs: [
          { name: "name", type: "bytes" },
          { name: "data", type: "bytes" }
        ],
        outputs: [
          { name: "", type: "bytes" },
          { name: "address", type: "address" }
        ]
      },
      {
        name: "resolve",
        type: "function",
        stateMutability: "view",
        inputs: [
          { name: "name", type: "bytes" },
          { name: "data", type: "bytes" },
          { name: "gateways", type: "string[]" }
        ],
        outputs: [
          { name: "", type: "bytes" },
          { name: "address", type: "address" }
        ]
      }
    ];
    universalResolverReverseAbi = [
      ...universalResolverErrors,
      {
        name: "reverse",
        type: "function",
        stateMutability: "view",
        inputs: [{ type: "bytes", name: "reverseName" }],
        outputs: [
          { type: "string", name: "resolvedName" },
          { type: "address", name: "resolvedAddress" },
          { type: "address", name: "reverseResolver" },
          { type: "address", name: "resolver" }
        ]
      },
      {
        name: "reverse",
        type: "function",
        stateMutability: "view",
        inputs: [
          { type: "bytes", name: "reverseName" },
          { type: "string[]", name: "gateways" }
        ],
        outputs: [
          { type: "string", name: "resolvedName" },
          { type: "address", name: "resolvedAddress" },
          { type: "address", name: "reverseResolver" },
          { type: "address", name: "resolver" }
        ]
      }
    ];
    textResolverAbi = [
      {
        name: "text",
        type: "function",
        stateMutability: "view",
        inputs: [
          { name: "name", type: "bytes32" },
          { name: "key", type: "string" }
        ],
        outputs: [{ name: "", type: "string" }]
      }
    ];
    addressResolverAbi = [
      {
        name: "addr",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "name", type: "bytes32" }],
        outputs: [{ name: "", type: "address" }]
      },
      {
        name: "addr",
        type: "function",
        stateMutability: "view",
        inputs: [
          { name: "name", type: "bytes32" },
          { name: "coinType", type: "uint256" }
        ],
        outputs: [{ name: "", type: "bytes" }]
      }
    ];
    universalSignatureValidatorAbi = [
      {
        inputs: [
          {
            name: "_signer",
            type: "address"
          },
          {
            name: "_hash",
            type: "bytes32"
          },
          {
            name: "_signature",
            type: "bytes"
          }
        ],
        stateMutability: "nonpayable",
        type: "constructor"
      }
    ];
  }
});

// node_modules/viem/_esm/constants/contract.js
var aggregate3Signature;
var init_contract2 = __esm({
  "node_modules/viem/_esm/constants/contract.js"() {
    aggregate3Signature = "0x82ad56cb";
  }
});

// node_modules/viem/_esm/constants/contracts.js
var deploylessCallViaBytecodeBytecode, deploylessCallViaFactoryBytecode, universalSignatureValidatorByteCode;
var init_contracts = __esm({
  "node_modules/viem/_esm/constants/contracts.js"() {
    deploylessCallViaBytecodeBytecode = "0x608060405234801561001057600080fd5b5060405161018e38038061018e83398101604081905261002f91610124565b6000808351602085016000f59050803b61004857600080fd5b6000808351602085016000855af16040513d6000823e81610067573d81fd5b3d81f35b634e487b7160e01b600052604160045260246000fd5b600082601f83011261009257600080fd5b81516001600160401b038111156100ab576100ab61006b565b604051601f8201601f19908116603f011681016001600160401b03811182821017156100d9576100d961006b565b6040528181528382016020018510156100f157600080fd5b60005b82811015610110576020818601810151838301820152016100f4565b506000918101602001919091529392505050565b6000806040838503121561013757600080fd5b82516001600160401b0381111561014d57600080fd5b61015985828601610081565b602085015190935090506001600160401b0381111561017757600080fd5b61018385828601610081565b915050925092905056fe";
    deploylessCallViaFactoryBytecode = "0x608060405234801561001057600080fd5b506040516102c03803806102c083398101604081905261002f916101e6565b836001600160a01b03163b6000036100e457600080836001600160a01b03168360405161005c9190610270565b6000604051808303816000865af19150503d8060008114610099576040519150601f19603f3d011682016040523d82523d6000602084013e61009e565b606091505b50915091508115806100b857506001600160a01b0386163b155b156100e1578060405163101bb98d60e01b81526004016100d8919061028c565b60405180910390fd5b50505b6000808451602086016000885af16040513d6000823e81610103573d81fd5b3d81f35b80516001600160a01b038116811461011e57600080fd5b919050565b634e487b7160e01b600052604160045260246000fd5b60005b8381101561015457818101518382015260200161013c565b50506000910152565b600082601f83011261016e57600080fd5b81516001600160401b0381111561018757610187610123565b604051601f8201601f19908116603f011681016001600160401b03811182821017156101b5576101b5610123565b6040528181528382016020018510156101cd57600080fd5b6101de826020830160208701610139565b949350505050565b600080600080608085870312156101fc57600080fd5b61020585610107565b60208601519094506001600160401b0381111561022157600080fd5b61022d8782880161015d565b93505061023c60408601610107565b60608601519092506001600160401b0381111561025857600080fd5b6102648782880161015d565b91505092959194509250565b60008251610282818460208701610139565b9190910192915050565b60208152600082518060208401526102ab816040850160208701610139565b601f01601f1916919091016040019291505056fe";
    universalSignatureValidatorByteCode = "0x608060405234801561001057600080fd5b5060405161069438038061069483398101604081905261002f9161051e565b600061003c848484610048565b9050806000526001601ff35b60007f64926492649264926492649264926492649264926492649264926492649264926100748361040c565b036101e7576000606080848060200190518101906100929190610577565b60405192955090935091506000906001600160a01b038516906100b69085906105dd565b6000604051808303816000865af19150503d80600081146100f3576040519150601f19603f3d011682016040523d82523d6000602084013e6100f8565b606091505b50509050876001600160a01b03163b60000361016057806101605760405162461bcd60e51b815260206004820152601e60248201527f5369676e617475726556616c696461746f723a206465706c6f796d656e74000060448201526064015b60405180910390fd5b604051630b135d3f60e11b808252906001600160a01b038a1690631626ba7e90610190908b9087906004016105f9565b602060405180830381865afa1580156101ad573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101d19190610633565b6001600160e01b03191614945050505050610405565b6001600160a01b0384163b1561027a57604051630b135d3f60e11b808252906001600160a01b03861690631626ba7e9061022790879087906004016105f9565b602060405180830381865afa158015610244573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102689190610633565b6001600160e01b031916149050610405565b81516041146102df5760405162461bcd60e51b815260206004820152603a602482015260008051602061067483398151915260448201527f3a20696e76616c6964207369676e6174757265206c656e6774680000000000006064820152608401610157565b6102e7610425565b5060208201516040808401518451859392600091859190811061030c5761030c61065d565b016020015160f81c9050601b811480159061032b57508060ff16601c14155b1561038c5760405162461bcd60e51b815260206004820152603b602482015260008051602061067483398151915260448201527f3a20696e76616c6964207369676e617475726520762076616c756500000000006064820152608401610157565b60408051600081526020810180835289905260ff83169181019190915260608101849052608081018390526001600160a01b0389169060019060a0016020604051602081039080840390855afa1580156103ea573d6000803e3d6000fd5b505050602060405103516001600160a01b0316149450505050505b9392505050565b600060208251101561041d57600080fd5b508051015190565b60405180606001604052806003906020820280368337509192915050565b6001600160a01b038116811461045857600080fd5b50565b634e487b7160e01b600052604160045260246000fd5b60005b8381101561048c578181015183820152602001610474565b50506000910152565b600082601f8301126104a657600080fd5b81516001600160401b038111156104bf576104bf61045b565b604051601f8201601f19908116603f011681016001600160401b03811182821017156104ed576104ed61045b565b60405281815283820160200185101561050557600080fd5b610516826020830160208701610471565b949350505050565b60008060006060848603121561053357600080fd5b835161053e81610443565b6020850151604086015191945092506001600160401b0381111561056157600080fd5b61056d86828701610495565b9150509250925092565b60008060006060848603121561058c57600080fd5b835161059781610443565b60208501519093506001600160401b038111156105b357600080fd5b6105bf86828701610495565b604086015190935090506001600160401b0381111561056157600080fd5b600082516105ef818460208701610471565b9190910192915050565b828152604060208201526000825180604084015261061e816060850160208701610471565b601f01601f1916919091016060019392505050565b60006020828403121561064557600080fd5b81516001600160e01b03198116811461040557600080fd5b634e487b7160e01b600052603260045260246000fdfe5369676e617475726556616c696461746f72237265636f7665725369676e6572";
  }
});

// node_modules/viem/_esm/errors/chain.js
var ChainDoesNotSupportContract, ChainMismatchError, ChainNotFoundError, ClientChainNotConfiguredError;
var init_chain = __esm({
  "node_modules/viem/_esm/errors/chain.js"() {
    init_base();
    ChainDoesNotSupportContract = class extends BaseError2 {
      constructor({ blockNumber, chain, contract }) {
        super(`Chain "${chain.name}" does not support contract "${contract.name}".`, {
          metaMessages: [
            "This could be due to any of the following:",
            ...blockNumber && contract.blockCreated && contract.blockCreated > blockNumber ? [
              `- The contract "${contract.name}" was not deployed until block ${contract.blockCreated} (current block ${blockNumber}).`
            ] : [
              `- The chain does not have the contract "${contract.name}" configured.`
            ]
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "ChainDoesNotSupportContract"
        });
      }
    };
    ChainMismatchError = class extends BaseError2 {
      constructor({ chain, currentChainId }) {
        super(`The current chain of the wallet (id: ${currentChainId}) does not match the target chain for the transaction (id: ${chain.id} \u2013 ${chain.name}).`, {
          metaMessages: [
            `Current Chain ID:  ${currentChainId}`,
            `Expected Chain ID: ${chain.id} \u2013 ${chain.name}`
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "ChainMismatchError"
        });
      }
    };
    ChainNotFoundError = class extends BaseError2 {
      constructor() {
        super([
          "No chain was provided to the request.",
          "Please provide a chain with the `chain` argument on the Action, or by supplying a `chain` to WalletClient."
        ].join("\n"));
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "ChainNotFoundError"
        });
      }
    };
    ClientChainNotConfiguredError = class extends BaseError2 {
      constructor() {
        super("No chain was provided to the Client.");
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "ClientChainNotConfiguredError"
        });
      }
    };
  }
});

// node_modules/viem/_esm/utils/abi/encodeDeployData.js
function encodeDeployData(parameters) {
  const { abi: abi2, args, bytecode } = parameters;
  if (!args || args.length === 0)
    return bytecode;
  const description = abi2.find((x4) => "type" in x4 && x4.type === "constructor");
  if (!description)
    throw new AbiConstructorNotFoundError({ docsPath: docsPath5 });
  if (!("inputs" in description))
    throw new AbiConstructorParamsNotFoundError({ docsPath: docsPath5 });
  if (!description.inputs || description.inputs.length === 0)
    throw new AbiConstructorParamsNotFoundError({ docsPath: docsPath5 });
  const data = encodeAbiParameters(description.inputs, args);
  return concatHex([bytecode, data]);
}
var docsPath5;
var init_encodeDeployData = __esm({
  "node_modules/viem/_esm/utils/abi/encodeDeployData.js"() {
    init_abi();
    init_concat();
    init_encodeAbiParameters();
    docsPath5 = "/docs/contract/encodeDeployData";
  }
});

// node_modules/viem/_esm/utils/chain/getChainContractAddress.js
function getChainContractAddress({ blockNumber, chain, contract: name }) {
  const contract = chain?.contracts?.[name];
  if (!contract)
    throw new ChainDoesNotSupportContract({
      chain,
      contract: { name }
    });
  if (blockNumber && contract.blockCreated && contract.blockCreated > blockNumber)
    throw new ChainDoesNotSupportContract({
      blockNumber,
      chain,
      contract: {
        name,
        blockCreated: contract.blockCreated
      }
    });
  return contract.address;
}
var init_getChainContractAddress = __esm({
  "node_modules/viem/_esm/utils/chain/getChainContractAddress.js"() {
    init_chain();
  }
});

// node_modules/viem/_esm/utils/errors/getCallError.js
function getCallError(err, { docsPath: docsPath6, ...args }) {
  const cause = (() => {
    const cause2 = getNodeError(err, args);
    if (cause2 instanceof UnknownNodeError)
      return err;
    return cause2;
  })();
  return new CallExecutionError(cause, {
    docsPath: docsPath6,
    ...args
  });
}
var init_getCallError = __esm({
  "node_modules/viem/_esm/utils/errors/getCallError.js"() {
    init_contract();
    init_node();
    init_getNodeError();
  }
});

// node_modules/viem/_esm/utils/promise/createBatchScheduler.js
function createBatchScheduler({ fn: fn2, id, shouldSplitBatch, wait: wait2 = 0, sort }) {
  const exec = async () => {
    const scheduler = getScheduler();
    flush();
    const args = scheduler.map(({ args: args2 }) => args2);
    if (args.length === 0)
      return;
    fn2(args).then((data) => {
      if (sort && Array.isArray(data))
        data.sort(sort);
      for (let i3 = 0; i3 < scheduler.length; i3++) {
        const { pendingPromise } = scheduler[i3];
        pendingPromise.resolve?.([data[i3], data]);
      }
    }).catch((err) => {
      for (let i3 = 0; i3 < scheduler.length; i3++) {
        const { pendingPromise } = scheduler[i3];
        pendingPromise.reject?.(err);
      }
    });
  };
  const flush = () => schedulerCache.delete(id);
  const getBatchedArgs = () => getScheduler().map(({ args }) => args);
  const getScheduler = () => schedulerCache.get(id) || [];
  const setScheduler = (item) => schedulerCache.set(id, [...getScheduler(), item]);
  return {
    flush,
    async schedule(args) {
      const pendingPromise = {};
      const promise = new Promise((resolve, reject) => {
        pendingPromise.resolve = resolve;
        pendingPromise.reject = reject;
      });
      const split2 = shouldSplitBatch?.([...getBatchedArgs(), args]);
      if (split2)
        exec();
      const hasActiveScheduler = getScheduler().length > 0;
      if (hasActiveScheduler) {
        setScheduler({ args, pendingPromise });
        return promise;
      }
      setScheduler({ args, pendingPromise });
      setTimeout(exec, wait2);
      return promise;
    }
  };
}
var schedulerCache;
var init_createBatchScheduler = __esm({
  "node_modules/viem/_esm/utils/promise/createBatchScheduler.js"() {
    schedulerCache = /* @__PURE__ */ new Map();
  }
});

// node_modules/viem/_esm/errors/ccip.js
var OffchainLookupError, OffchainLookupResponseMalformedError, OffchainLookupSenderMismatchError;
var init_ccip = __esm({
  "node_modules/viem/_esm/errors/ccip.js"() {
    init_stringify();
    init_base();
    init_utils2();
    OffchainLookupError = class extends BaseError2 {
      constructor({ callbackSelector, cause, data, extraData, sender, urls }) {
        super(cause.shortMessage || "An error occurred while fetching for an offchain result.", {
          cause,
          metaMessages: [
            ...cause.metaMessages || [],
            cause.metaMessages?.length ? "" : [],
            "Offchain Gateway Call:",
            urls && [
              "  Gateway URL(s):",
              ...urls.map((url) => `    ${getUrl(url)}`)
            ],
            `  Sender: ${sender}`,
            `  Data: ${data}`,
            `  Callback selector: ${callbackSelector}`,
            `  Extra data: ${extraData}`
          ].flat()
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "OffchainLookupError"
        });
      }
    };
    OffchainLookupResponseMalformedError = class extends BaseError2 {
      constructor({ result, url }) {
        super("Offchain gateway response is malformed. Response data must be a hex value.", {
          metaMessages: [
            `Gateway URL: ${getUrl(url)}`,
            `Response: ${stringify(result)}`
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "OffchainLookupResponseMalformedError"
        });
      }
    };
    OffchainLookupSenderMismatchError = class extends BaseError2 {
      constructor({ sender, to }) {
        super("Reverted sender address does not match target contract address (`to`).", {
          metaMessages: [
            `Contract address: ${to}`,
            `OffchainLookup sender address: ${sender}`
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "OffchainLookupSenderMismatchError"
        });
      }
    };
  }
});

// node_modules/viem/_esm/utils/ccip.js
var ccip_exports = {};
__export(ccip_exports, {
  ccipRequest: () => ccipRequest,
  offchainLookup: () => offchainLookup,
  offchainLookupAbiItem: () => offchainLookupAbiItem,
  offchainLookupSignature: () => offchainLookupSignature
});
async function offchainLookup(client, { blockNumber, blockTag, data, to }) {
  const { args } = decodeErrorResult({
    data,
    abi: [offchainLookupAbiItem]
  });
  const [sender, urls, callData, callbackSelector, extraData] = args;
  const { ccipRead } = client;
  const ccipRequest_ = ccipRead && typeof ccipRead?.request === "function" ? ccipRead.request : ccipRequest;
  try {
    if (!isAddressEqual(to, sender))
      throw new OffchainLookupSenderMismatchError({ sender, to });
    const result = await ccipRequest_({ data: callData, sender, urls });
    const { data: data_ } = await call(client, {
      blockNumber,
      blockTag,
      data: concat([
        callbackSelector,
        encodeAbiParameters([{ type: "bytes" }, { type: "bytes" }], [result, extraData])
      ]),
      to
    });
    return data_;
  } catch (err) {
    throw new OffchainLookupError({
      callbackSelector,
      cause: err,
      data,
      extraData,
      sender,
      urls
    });
  }
}
async function ccipRequest({ data, sender, urls }) {
  let error = new Error("An unknown error occurred.");
  for (let i3 = 0; i3 < urls.length; i3++) {
    const url = urls[i3];
    const method = url.includes("{data}") ? "GET" : "POST";
    const body = method === "POST" ? { data, sender } : void 0;
    try {
      const response = await fetch(url.replace("{sender}", sender).replace("{data}", data), {
        body: JSON.stringify(body),
        method
      });
      let result;
      if (response.headers.get("Content-Type")?.startsWith("application/json")) {
        result = (await response.json()).data;
      } else {
        result = await response.text();
      }
      if (!response.ok) {
        error = new HttpRequestError({
          body,
          details: result?.error ? stringify(result.error) : response.statusText,
          headers: response.headers,
          status: response.status,
          url
        });
        continue;
      }
      if (!isHex(result)) {
        error = new OffchainLookupResponseMalformedError({
          result,
          url
        });
        continue;
      }
      return result;
    } catch (err) {
      error = new HttpRequestError({
        body,
        details: err.message,
        url
      });
    }
  }
  throw error;
}
var offchainLookupSignature, offchainLookupAbiItem;
var init_ccip2 = __esm({
  "node_modules/viem/_esm/utils/ccip.js"() {
    init_call();
    init_ccip();
    init_request();
    init_decodeErrorResult();
    init_encodeAbiParameters();
    init_isAddressEqual();
    init_concat();
    init_isHex();
    init_stringify();
    offchainLookupSignature = "0x556f1830";
    offchainLookupAbiItem = {
      name: "OffchainLookup",
      type: "error",
      inputs: [
        {
          name: "sender",
          type: "address"
        },
        {
          name: "urls",
          type: "string[]"
        },
        {
          name: "callData",
          type: "bytes"
        },
        {
          name: "callbackFunction",
          type: "bytes4"
        },
        {
          name: "extraData",
          type: "bytes"
        }
      ]
    };
  }
});

// node_modules/viem/_esm/actions/public/call.js
async function call(client, args) {
  const { account: account_ = client.account, batch = Boolean(client.batch?.multicall), blockNumber, blockTag = "latest", accessList, blobs, code, data: data_, factory: factory2, factoryData, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value, stateOverride, ...rest } = args;
  const account = account_ ? parseAccount(account_) : void 0;
  if (code && (factory2 || factoryData))
    throw new BaseError2("Cannot provide both `code` & `factory`/`factoryData` as parameters.");
  if (code && to)
    throw new BaseError2("Cannot provide both `code` & `to` as parameters.");
  const deploylessCallViaBytecode = code && data_;
  const deploylessCallViaFactory = factory2 && factoryData && to && data_;
  const deploylessCall = deploylessCallViaBytecode || deploylessCallViaFactory;
  const data = (() => {
    if (deploylessCallViaBytecode)
      return toDeploylessCallViaBytecodeData({
        code,
        data: data_
      });
    if (deploylessCallViaFactory)
      return toDeploylessCallViaFactoryData({
        data: data_,
        factory: factory2,
        factoryData,
        to
      });
    return data_;
  })();
  try {
    assertRequest(args);
    const blockNumberHex = blockNumber ? numberToHex(blockNumber) : void 0;
    const block = blockNumberHex || blockTag;
    const rpcStateOverride = serializeStateOverride(stateOverride);
    const chainFormat = client.chain?.formatters?.transactionRequest?.format;
    const format = chainFormat || formatTransactionRequest;
    const request = format({
      // Pick out extra data that might exist on the chain's transaction request type.
      ...extract(rest, { format: chainFormat }),
      from: account?.address,
      accessList,
      blobs,
      data,
      gas,
      gasPrice,
      maxFeePerBlobGas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to: deploylessCall ? void 0 : to,
      value
    });
    if (batch && shouldPerformMulticall({ request }) && !rpcStateOverride) {
      try {
        return await scheduleMulticall(client, {
          ...request,
          blockNumber,
          blockTag
        });
      } catch (err) {
        if (!(err instanceof ClientChainNotConfiguredError) && !(err instanceof ChainDoesNotSupportContract))
          throw err;
      }
    }
    const response = await client.request({
      method: "eth_call",
      params: rpcStateOverride ? [
        request,
        block,
        rpcStateOverride
      ] : [request, block]
    });
    if (response === "0x")
      return { data: void 0 };
    return { data: response };
  } catch (err) {
    const data2 = getRevertErrorData(err);
    const { offchainLookup: offchainLookup2, offchainLookupSignature: offchainLookupSignature2 } = await Promise.resolve().then(() => (init_ccip2(), ccip_exports));
    if (client.ccipRead !== false && data2?.slice(0, 10) === offchainLookupSignature2 && to)
      return { data: await offchainLookup2(client, { data: data2, to }) };
    if (deploylessCall && data2?.slice(0, 10) === "0x101bb98d")
      throw new CounterfactualDeploymentFailedError({ factory: factory2 });
    throw getCallError(err, {
      ...args,
      account,
      chain: client.chain
    });
  }
}
function shouldPerformMulticall({ request }) {
  const { data, to, ...request_ } = request;
  if (!data)
    return false;
  if (data.startsWith(aggregate3Signature))
    return false;
  if (!to)
    return false;
  if (Object.values(request_).filter((x4) => typeof x4 !== "undefined").length > 0)
    return false;
  return true;
}
async function scheduleMulticall(client, args) {
  const { batchSize = 1024, wait: wait2 = 0 } = typeof client.batch?.multicall === "object" ? client.batch.multicall : {};
  const { blockNumber, blockTag = "latest", data, multicallAddress: multicallAddress_, to } = args;
  let multicallAddress = multicallAddress_;
  if (!multicallAddress) {
    if (!client.chain)
      throw new ClientChainNotConfiguredError();
    multicallAddress = getChainContractAddress({
      blockNumber,
      chain: client.chain,
      contract: "multicall3"
    });
  }
  const blockNumberHex = blockNumber ? numberToHex(blockNumber) : void 0;
  const block = blockNumberHex || blockTag;
  const { schedule } = createBatchScheduler({
    id: `${client.uid}.${block}`,
    wait: wait2,
    shouldSplitBatch(args2) {
      const size3 = args2.reduce((size4, { data: data2 }) => size4 + (data2.length - 2), 0);
      return size3 > batchSize * 2;
    },
    fn: async (requests) => {
      const calls = requests.map((request) => ({
        allowFailure: true,
        callData: request.data,
        target: request.to
      }));
      const calldata = encodeFunctionData({
        abi: multicall3Abi,
        args: [calls],
        functionName: "aggregate3"
      });
      const data2 = await client.request({
        method: "eth_call",
        params: [
          {
            data: calldata,
            to: multicallAddress
          },
          block
        ]
      });
      return decodeFunctionResult({
        abi: multicall3Abi,
        args: [calls],
        functionName: "aggregate3",
        data: data2 || "0x"
      });
    }
  });
  const [{ returnData, success }] = await schedule({ data, to });
  if (!success)
    throw new RawContractError({ data: returnData });
  if (returnData === "0x")
    return { data: void 0 };
  return { data: returnData };
}
function toDeploylessCallViaBytecodeData(parameters) {
  const { code, data } = parameters;
  return encodeDeployData({
    abi: parseAbi(["constructor(bytes, bytes)"]),
    bytecode: deploylessCallViaBytecodeBytecode,
    args: [code, data]
  });
}
function toDeploylessCallViaFactoryData(parameters) {
  const { data, factory: factory2, factoryData, to } = parameters;
  return encodeDeployData({
    abi: parseAbi(["constructor(address, bytes, address, bytes)"]),
    bytecode: deploylessCallViaFactoryBytecode,
    args: [to, data, factory2, factoryData]
  });
}
function getRevertErrorData(err) {
  if (!(err instanceof BaseError2))
    return void 0;
  const error = err.walk();
  return typeof error?.data === "object" ? error.data?.data : error.data;
}
var init_call = __esm({
  "node_modules/viem/_esm/actions/public/call.js"() {
    init_exports();
    init_parseAccount();
    init_abis();
    init_contract2();
    init_contracts();
    init_base();
    init_chain();
    init_contract();
    init_decodeFunctionResult();
    init_encodeDeployData();
    init_encodeFunctionData();
    init_getChainContractAddress();
    init_toHex();
    init_getCallError();
    init_extract();
    init_transactionRequest();
    init_createBatchScheduler();
    init_stateOverride2();
    init_assertRequest();
  }
});

// node_modules/@noble/curves/esm/abstract/utils.js
var utils_exports2 = {};
__export(utils_exports2, {
  abytes: () => abytes,
  bitGet: () => bitGet,
  bitLen: () => bitLen,
  bitMask: () => bitMask,
  bitSet: () => bitSet,
  bytesToHex: () => bytesToHex2,
  bytesToNumberBE: () => bytesToNumberBE,
  bytesToNumberLE: () => bytesToNumberLE,
  concatBytes: () => concatBytes3,
  createHmacDrbg: () => createHmacDrbg,
  ensureBytes: () => ensureBytes,
  equalBytes: () => equalBytes,
  hexToBytes: () => hexToBytes2,
  hexToNumber: () => hexToNumber2,
  isBytes: () => isBytes2,
  numberToBytesBE: () => numberToBytesBE,
  numberToBytesLE: () => numberToBytesLE,
  numberToHexUnpadded: () => numberToHexUnpadded,
  numberToVarBytesBE: () => numberToVarBytesBE,
  utf8ToBytes: () => utf8ToBytes2,
  validateObject: () => validateObject
});
function isBytes2(a3) {
  return a3 instanceof Uint8Array || a3 != null && typeof a3 === "object" && a3.constructor.name === "Uint8Array";
}
function abytes(item) {
  if (!isBytes2(item))
    throw new Error("Uint8Array expected");
}
function bytesToHex2(bytes2) {
  abytes(bytes2);
  let hex = "";
  for (let i3 = 0; i3 < bytes2.length; i3++) {
    hex += hexes2[bytes2[i3]];
  }
  return hex;
}
function numberToHexUnpadded(num) {
  const hex = num.toString(16);
  return hex.length & 1 ? `0${hex}` : hex;
}
function hexToNumber2(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  return BigInt(hex === "" ? "0" : `0x${hex}`);
}
function asciiToBase16(char) {
  if (char >= asciis._0 && char <= asciis._9)
    return char - asciis._0;
  if (char >= asciis._A && char <= asciis._F)
    return char - (asciis._A - 10);
  if (char >= asciis._a && char <= asciis._f)
    return char - (asciis._a - 10);
  return;
}
function hexToBytes2(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  const hl = hex.length;
  const al = hl / 2;
  if (hl % 2)
    throw new Error("padded hex string expected, got unpadded hex of length " + hl);
  const array = new Uint8Array(al);
  for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
    const n1 = asciiToBase16(hex.charCodeAt(hi));
    const n22 = asciiToBase16(hex.charCodeAt(hi + 1));
    if (n1 === void 0 || n22 === void 0) {
      const char = hex[hi] + hex[hi + 1];
      throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
    }
    array[ai] = n1 * 16 + n22;
  }
  return array;
}
function bytesToNumberBE(bytes2) {
  return hexToNumber2(bytesToHex2(bytes2));
}
function bytesToNumberLE(bytes2) {
  abytes(bytes2);
  return hexToNumber2(bytesToHex2(Uint8Array.from(bytes2).reverse()));
}
function numberToBytesBE(n3, len) {
  return hexToBytes2(n3.toString(16).padStart(len * 2, "0"));
}
function numberToBytesLE(n3, len) {
  return numberToBytesBE(n3, len).reverse();
}
function numberToVarBytesBE(n3) {
  return hexToBytes2(numberToHexUnpadded(n3));
}
function ensureBytes(title, hex, expectedLength) {
  let res;
  if (typeof hex === "string") {
    try {
      res = hexToBytes2(hex);
    } catch (e3) {
      throw new Error(`${title} must be valid hex string, got "${hex}". Cause: ${e3}`);
    }
  } else if (isBytes2(hex)) {
    res = Uint8Array.from(hex);
  } else {
    throw new Error(`${title} must be hex string or Uint8Array`);
  }
  const len = res.length;
  if (typeof expectedLength === "number" && len !== expectedLength)
    throw new Error(`${title} expected ${expectedLength} bytes, got ${len}`);
  return res;
}
function concatBytes3(...arrays) {
  let sum = 0;
  for (let i3 = 0; i3 < arrays.length; i3++) {
    const a3 = arrays[i3];
    abytes(a3);
    sum += a3.length;
  }
  const res = new Uint8Array(sum);
  for (let i3 = 0, pad2 = 0; i3 < arrays.length; i3++) {
    const a3 = arrays[i3];
    res.set(a3, pad2);
    pad2 += a3.length;
  }
  return res;
}
function equalBytes(a3, b4) {
  if (a3.length !== b4.length)
    return false;
  let diff = 0;
  for (let i3 = 0; i3 < a3.length; i3++)
    diff |= a3[i3] ^ b4[i3];
  return diff === 0;
}
function utf8ToBytes2(str) {
  if (typeof str !== "string")
    throw new Error(`utf8ToBytes expected string, got ${typeof str}`);
  return new Uint8Array(new TextEncoder().encode(str));
}
function bitLen(n3) {
  let len;
  for (len = 0; n3 > _0n2; n3 >>= _1n2, len += 1)
    ;
  return len;
}
function bitGet(n3, pos) {
  return n3 >> BigInt(pos) & _1n2;
}
function bitSet(n3, pos, value) {
  return n3 | (value ? _1n2 : _0n2) << BigInt(pos);
}
function createHmacDrbg(hashLen, qByteLen, hmacFn) {
  if (typeof hashLen !== "number" || hashLen < 2)
    throw new Error("hashLen must be a number");
  if (typeof qByteLen !== "number" || qByteLen < 2)
    throw new Error("qByteLen must be a number");
  if (typeof hmacFn !== "function")
    throw new Error("hmacFn must be a function");
  let v4 = u8n(hashLen);
  let k5 = u8n(hashLen);
  let i3 = 0;
  const reset = () => {
    v4.fill(1);
    k5.fill(0);
    i3 = 0;
  };
  const h4 = (...b4) => hmacFn(k5, v4, ...b4);
  const reseed = (seed = u8n()) => {
    k5 = h4(u8fr([0]), seed);
    v4 = h4();
    if (seed.length === 0)
      return;
    k5 = h4(u8fr([1]), seed);
    v4 = h4();
  };
  const gen2 = () => {
    if (i3++ >= 1e3)
      throw new Error("drbg: tried 1000 values");
    let len = 0;
    const out = [];
    while (len < qByteLen) {
      v4 = h4();
      const sl = v4.slice();
      out.push(sl);
      len += v4.length;
    }
    return concatBytes3(...out);
  };
  const genUntil = (seed, pred) => {
    reset();
    reseed(seed);
    let res = void 0;
    while (!(res = pred(gen2())))
      reseed();
    reset();
    return res;
  };
  return genUntil;
}
function validateObject(object, validators3, optValidators = {}) {
  const checkField = (fieldName, type, isOptional) => {
    const checkVal = validatorFns[type];
    if (typeof checkVal !== "function")
      throw new Error(`Invalid validator "${type}", expected function`);
    const val = object[fieldName];
    if (isOptional && val === void 0)
      return;
    if (!checkVal(val, object)) {
      throw new Error(`Invalid param ${String(fieldName)}=${val} (${typeof val}), expected ${type}`);
    }
  };
  for (const [fieldName, type] of Object.entries(validators3))
    checkField(fieldName, type, false);
  for (const [fieldName, type] of Object.entries(optValidators))
    checkField(fieldName, type, true);
  return object;
}
var _0n2, _1n2, _2n2, hexes2, asciis, bitMask, u8n, u8fr, validatorFns;
var init_utils4 = __esm({
  "node_modules/@noble/curves/esm/abstract/utils.js"() {
    _0n2 = BigInt(0);
    _1n2 = BigInt(1);
    _2n2 = BigInt(2);
    hexes2 = /* @__PURE__ */ Array.from({ length: 256 }, (_4, i3) => i3.toString(16).padStart(2, "0"));
    asciis = { _0: 48, _9: 57, _A: 65, _F: 70, _a: 97, _f: 102 };
    bitMask = (n3) => (_2n2 << BigInt(n3 - 1)) - _1n2;
    u8n = (data) => new Uint8Array(data);
    u8fr = (arr) => Uint8Array.from(arr);
    validatorFns = {
      bigint: (val) => typeof val === "bigint",
      function: (val) => typeof val === "function",
      boolean: (val) => typeof val === "boolean",
      string: (val) => typeof val === "string",
      stringOrUint8Array: (val) => typeof val === "string" || isBytes2(val),
      isSafeInteger: (val) => Number.isSafeInteger(val),
      array: (val) => Array.isArray(val),
      field: (val, object) => object.Fp.isValid(val),
      hash: (val) => typeof val === "function" && Number.isSafeInteger(val.outputLen)
    };
  }
});

// node_modules/@noble/curves/esm/abstract/modular.js
function mod(a3, b4) {
  const result = a3 % b4;
  return result >= _0n3 ? result : b4 + result;
}
function pow(num, power, modulo) {
  if (modulo <= _0n3 || power < _0n3)
    throw new Error("Expected power/modulo > 0");
  if (modulo === _1n3)
    return _0n3;
  let res = _1n3;
  while (power > _0n3) {
    if (power & _1n3)
      res = res * num % modulo;
    num = num * num % modulo;
    power >>= _1n3;
  }
  return res;
}
function pow2(x4, power, modulo) {
  let res = x4;
  while (power-- > _0n3) {
    res *= res;
    res %= modulo;
  }
  return res;
}
function invert(number2, modulo) {
  if (number2 === _0n3 || modulo <= _0n3) {
    throw new Error(`invert: expected positive integers, got n=${number2} mod=${modulo}`);
  }
  let a3 = mod(number2, modulo);
  let b4 = modulo;
  let x4 = _0n3, y4 = _1n3, u3 = _1n3, v4 = _0n3;
  while (a3 !== _0n3) {
    const q4 = b4 / a3;
    const r3 = b4 % a3;
    const m4 = x4 - u3 * q4;
    const n3 = y4 - v4 * q4;
    b4 = a3, a3 = r3, x4 = u3, y4 = v4, u3 = m4, v4 = n3;
  }
  const gcd = b4;
  if (gcd !== _1n3)
    throw new Error("invert: does not exist");
  return mod(x4, modulo);
}
function tonelliShanks(P5) {
  const legendreC = (P5 - _1n3) / _2n3;
  let Q4, S4, Z4;
  for (Q4 = P5 - _1n3, S4 = 0; Q4 % _2n3 === _0n3; Q4 /= _2n3, S4++)
    ;
  for (Z4 = _2n3; Z4 < P5 && pow(Z4, legendreC, P5) !== P5 - _1n3; Z4++)
    ;
  if (S4 === 1) {
    const p1div4 = (P5 + _1n3) / _4n;
    return function tonelliFast(Fp2, n3) {
      const root = Fp2.pow(n3, p1div4);
      if (!Fp2.eql(Fp2.sqr(root), n3))
        throw new Error("Cannot find square root");
      return root;
    };
  }
  const Q1div2 = (Q4 + _1n3) / _2n3;
  return function tonelliSlow(Fp2, n3) {
    if (Fp2.pow(n3, legendreC) === Fp2.neg(Fp2.ONE))
      throw new Error("Cannot find square root");
    let r3 = S4;
    let g4 = Fp2.pow(Fp2.mul(Fp2.ONE, Z4), Q4);
    let x4 = Fp2.pow(n3, Q1div2);
    let b4 = Fp2.pow(n3, Q4);
    while (!Fp2.eql(b4, Fp2.ONE)) {
      if (Fp2.eql(b4, Fp2.ZERO))
        return Fp2.ZERO;
      let m4 = 1;
      for (let t22 = Fp2.sqr(b4); m4 < r3; m4++) {
        if (Fp2.eql(t22, Fp2.ONE))
          break;
        t22 = Fp2.sqr(t22);
      }
      const ge5 = Fp2.pow(g4, _1n3 << BigInt(r3 - m4 - 1));
      g4 = Fp2.sqr(ge5);
      x4 = Fp2.mul(x4, ge5);
      b4 = Fp2.mul(b4, g4);
      r3 = m4;
    }
    return x4;
  };
}
function FpSqrt(P5) {
  if (P5 % _4n === _3n) {
    const p1div4 = (P5 + _1n3) / _4n;
    return function sqrt3mod4(Fp2, n3) {
      const root = Fp2.pow(n3, p1div4);
      if (!Fp2.eql(Fp2.sqr(root), n3))
        throw new Error("Cannot find square root");
      return root;
    };
  }
  if (P5 % _8n === _5n) {
    const c1 = (P5 - _5n) / _8n;
    return function sqrt5mod8(Fp2, n3) {
      const n22 = Fp2.mul(n3, _2n3);
      const v4 = Fp2.pow(n22, c1);
      const nv = Fp2.mul(n3, v4);
      const i3 = Fp2.mul(Fp2.mul(nv, _2n3), v4);
      const root = Fp2.mul(nv, Fp2.sub(i3, Fp2.ONE));
      if (!Fp2.eql(Fp2.sqr(root), n3))
        throw new Error("Cannot find square root");
      return root;
    };
  }
  if (P5 % _16n === _9n) {
  }
  return tonelliShanks(P5);
}
function validateField(field) {
  const initial = {
    ORDER: "bigint",
    MASK: "bigint",
    BYTES: "isSafeInteger",
    BITS: "isSafeInteger"
  };
  const opts = FIELD_FIELDS.reduce((map, val) => {
    map[val] = "function";
    return map;
  }, initial);
  return validateObject(field, opts);
}
function FpPow(f3, num, power) {
  if (power < _0n3)
    throw new Error("Expected power > 0");
  if (power === _0n3)
    return f3.ONE;
  if (power === _1n3)
    return num;
  let p4 = f3.ONE;
  let d3 = num;
  while (power > _0n3) {
    if (power & _1n3)
      p4 = f3.mul(p4, d3);
    d3 = f3.sqr(d3);
    power >>= _1n3;
  }
  return p4;
}
function FpInvertBatch(f3, nums) {
  const tmp = new Array(nums.length);
  const lastMultiplied = nums.reduce((acc, num, i3) => {
    if (f3.is0(num))
      return acc;
    tmp[i3] = acc;
    return f3.mul(acc, num);
  }, f3.ONE);
  const inverted = f3.inv(lastMultiplied);
  nums.reduceRight((acc, num, i3) => {
    if (f3.is0(num))
      return acc;
    tmp[i3] = f3.mul(acc, tmp[i3]);
    return f3.mul(acc, num);
  }, inverted);
  return tmp;
}
function nLength(n3, nBitLength) {
  const _nBitLength = nBitLength !== void 0 ? nBitLength : n3.toString(2).length;
  const nByteLength = Math.ceil(_nBitLength / 8);
  return { nBitLength: _nBitLength, nByteLength };
}
function Field(ORDER, bitLen2, isLE2 = false, redef = {}) {
  if (ORDER <= _0n3)
    throw new Error(`Expected Field ORDER > 0, got ${ORDER}`);
  const { nBitLength: BITS, nByteLength: BYTES } = nLength(ORDER, bitLen2);
  if (BYTES > 2048)
    throw new Error("Field lengths over 2048 bytes are not supported");
  const sqrtP = FpSqrt(ORDER);
  const f3 = Object.freeze({
    ORDER,
    BITS,
    BYTES,
    MASK: bitMask(BITS),
    ZERO: _0n3,
    ONE: _1n3,
    create: (num) => mod(num, ORDER),
    isValid: (num) => {
      if (typeof num !== "bigint")
        throw new Error(`Invalid field element: expected bigint, got ${typeof num}`);
      return _0n3 <= num && num < ORDER;
    },
    is0: (num) => num === _0n3,
    isOdd: (num) => (num & _1n3) === _1n3,
    neg: (num) => mod(-num, ORDER),
    eql: (lhs, rhs) => lhs === rhs,
    sqr: (num) => mod(num * num, ORDER),
    add: (lhs, rhs) => mod(lhs + rhs, ORDER),
    sub: (lhs, rhs) => mod(lhs - rhs, ORDER),
    mul: (lhs, rhs) => mod(lhs * rhs, ORDER),
    pow: (num, power) => FpPow(f3, num, power),
    div: (lhs, rhs) => mod(lhs * invert(rhs, ORDER), ORDER),
    // Same as above, but doesn't normalize
    sqrN: (num) => num * num,
    addN: (lhs, rhs) => lhs + rhs,
    subN: (lhs, rhs) => lhs - rhs,
    mulN: (lhs, rhs) => lhs * rhs,
    inv: (num) => invert(num, ORDER),
    sqrt: redef.sqrt || ((n3) => sqrtP(f3, n3)),
    invertBatch: (lst) => FpInvertBatch(f3, lst),
    // TODO: do we really need constant cmov?
    // We don't have const-time bigints anyway, so probably will be not very useful
    cmov: (a3, b4, c3) => c3 ? b4 : a3,
    toBytes: (num) => isLE2 ? numberToBytesLE(num, BYTES) : numberToBytesBE(num, BYTES),
    fromBytes: (bytes2) => {
      if (bytes2.length !== BYTES)
        throw new Error(`Fp.fromBytes: expected ${BYTES}, got ${bytes2.length}`);
      return isLE2 ? bytesToNumberLE(bytes2) : bytesToNumberBE(bytes2);
    }
  });
  return Object.freeze(f3);
}
function getFieldBytesLength(fieldOrder) {
  if (typeof fieldOrder !== "bigint")
    throw new Error("field order must be bigint");
  const bitLength = fieldOrder.toString(2).length;
  return Math.ceil(bitLength / 8);
}
function getMinHashLength(fieldOrder) {
  const length = getFieldBytesLength(fieldOrder);
  return length + Math.ceil(length / 2);
}
function mapHashToField(key, fieldOrder, isLE2 = false) {
  const len = key.length;
  const fieldLen = getFieldBytesLength(fieldOrder);
  const minLen = getMinHashLength(fieldOrder);
  if (len < 16 || len < minLen || len > 1024)
    throw new Error(`expected ${minLen}-1024 bytes of input, got ${len}`);
  const num = isLE2 ? bytesToNumberBE(key) : bytesToNumberLE(key);
  const reduced = mod(num, fieldOrder - _1n3) + _1n3;
  return isLE2 ? numberToBytesLE(reduced, fieldLen) : numberToBytesBE(reduced, fieldLen);
}
var _0n3, _1n3, _2n3, _3n, _4n, _5n, _8n, _9n, _16n, FIELD_FIELDS;
var init_modular = __esm({
  "node_modules/@noble/curves/esm/abstract/modular.js"() {
    init_utils4();
    _0n3 = BigInt(0);
    _1n3 = BigInt(1);
    _2n3 = BigInt(2);
    _3n = BigInt(3);
    _4n = BigInt(4);
    _5n = BigInt(5);
    _8n = BigInt(8);
    _9n = BigInt(9);
    _16n = BigInt(16);
    FIELD_FIELDS = [
      "create",
      "isValid",
      "is0",
      "neg",
      "inv",
      "sqrt",
      "sqr",
      "eql",
      "add",
      "sub",
      "mul",
      "pow",
      "div",
      "addN",
      "subN",
      "mulN",
      "sqrN"
    ];
  }
});

// node_modules/@noble/curves/esm/abstract/curve.js
function wNAF(c3, bits) {
  const constTimeNegate = (condition, item) => {
    const neg = item.negate();
    return condition ? neg : item;
  };
  const opts = (W4) => {
    const windows = Math.ceil(bits / W4) + 1;
    const windowSize = 2 ** (W4 - 1);
    return { windows, windowSize };
  };
  return {
    constTimeNegate,
    // non-const time multiplication ladder
    unsafeLadder(elm, n3) {
      let p4 = c3.ZERO;
      let d3 = elm;
      while (n3 > _0n4) {
        if (n3 & _1n4)
          p4 = p4.add(d3);
        d3 = d3.double();
        n3 >>= _1n4;
      }
      return p4;
    },
    /**
     * Creates a wNAF precomputation window. Used for caching.
     * Default window size is set by `utils.precompute()` and is equal to 8.
     * Number of precomputed points depends on the curve size:
     * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
     * - 𝑊 is the window size
     * - 𝑛 is the bitlength of the curve order.
     * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
     * @returns precomputed point tables flattened to a single array
     */
    precomputeWindow(elm, W4) {
      const { windows, windowSize } = opts(W4);
      const points = [];
      let p4 = elm;
      let base = p4;
      for (let window2 = 0; window2 < windows; window2++) {
        base = p4;
        points.push(base);
        for (let i3 = 1; i3 < windowSize; i3++) {
          base = base.add(p4);
          points.push(base);
        }
        p4 = base.double();
      }
      return points;
    },
    /**
     * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
     * @param W window size
     * @param precomputes precomputed tables
     * @param n scalar (we don't check here, but should be less than curve order)
     * @returns real and fake (for const-time) points
     */
    wNAF(W4, precomputes, n3) {
      const { windows, windowSize } = opts(W4);
      let p4 = c3.ZERO;
      let f3 = c3.BASE;
      const mask = BigInt(2 ** W4 - 1);
      const maxNumber = 2 ** W4;
      const shiftBy = BigInt(W4);
      for (let window2 = 0; window2 < windows; window2++) {
        const offset = window2 * windowSize;
        let wbits = Number(n3 & mask);
        n3 >>= shiftBy;
        if (wbits > windowSize) {
          wbits -= maxNumber;
          n3 += _1n4;
        }
        const offset1 = offset;
        const offset2 = offset + Math.abs(wbits) - 1;
        const cond1 = window2 % 2 !== 0;
        const cond2 = wbits < 0;
        if (wbits === 0) {
          f3 = f3.add(constTimeNegate(cond1, precomputes[offset1]));
        } else {
          p4 = p4.add(constTimeNegate(cond2, precomputes[offset2]));
        }
      }
      return { p: p4, f: f3 };
    },
    wNAFCached(P5, precomputesMap, n3, transform) {
      const W4 = P5._WINDOW_SIZE || 1;
      let comp = precomputesMap.get(P5);
      if (!comp) {
        comp = this.precomputeWindow(P5, W4);
        if (W4 !== 1) {
          precomputesMap.set(P5, transform(comp));
        }
      }
      return this.wNAF(W4, comp, n3);
    }
  };
}
function validateBasic(curve) {
  validateField(curve.Fp);
  validateObject(curve, {
    n: "bigint",
    h: "bigint",
    Gx: "field",
    Gy: "field"
  }, {
    nBitLength: "isSafeInteger",
    nByteLength: "isSafeInteger"
  });
  return Object.freeze({
    ...nLength(curve.n, curve.nBitLength),
    ...curve,
    ...{ p: curve.Fp.ORDER }
  });
}
var _0n4, _1n4;
var init_curve = __esm({
  "node_modules/@noble/curves/esm/abstract/curve.js"() {
    init_modular();
    init_utils4();
    _0n4 = BigInt(0);
    _1n4 = BigInt(1);
  }
});

// node_modules/@noble/curves/esm/abstract/weierstrass.js
function validatePointOpts(curve) {
  const opts = validateBasic(curve);
  validateObject(opts, {
    a: "field",
    b: "field"
  }, {
    allowedPrivateKeyLengths: "array",
    wrapPrivateKey: "boolean",
    isTorsionFree: "function",
    clearCofactor: "function",
    allowInfinityPoint: "boolean",
    fromBytes: "function",
    toBytes: "function"
  });
  const { endo, Fp: Fp2, a: a3 } = opts;
  if (endo) {
    if (!Fp2.eql(a3, Fp2.ZERO)) {
      throw new Error("Endomorphism can only be defined for Koblitz curves that have a=0");
    }
    if (typeof endo !== "object" || typeof endo.beta !== "bigint" || typeof endo.splitScalar !== "function") {
      throw new Error("Expected endomorphism with beta: bigint and splitScalar: function");
    }
  }
  return Object.freeze({ ...opts });
}
function weierstrassPoints(opts) {
  const CURVE = validatePointOpts(opts);
  const { Fp: Fp2 } = CURVE;
  const toBytes3 = CURVE.toBytes || ((_c2, point, _isCompressed) => {
    const a3 = point.toAffine();
    return concatBytes3(Uint8Array.from([4]), Fp2.toBytes(a3.x), Fp2.toBytes(a3.y));
  });
  const fromBytes = CURVE.fromBytes || ((bytes2) => {
    const tail = bytes2.subarray(1);
    const x4 = Fp2.fromBytes(tail.subarray(0, Fp2.BYTES));
    const y4 = Fp2.fromBytes(tail.subarray(Fp2.BYTES, 2 * Fp2.BYTES));
    return { x: x4, y: y4 };
  });
  function weierstrassEquation(x4) {
    const { a: a3, b: b4 } = CURVE;
    const x22 = Fp2.sqr(x4);
    const x32 = Fp2.mul(x22, x4);
    return Fp2.add(Fp2.add(x32, Fp2.mul(x4, a3)), b4);
  }
  if (!Fp2.eql(Fp2.sqr(CURVE.Gy), weierstrassEquation(CURVE.Gx)))
    throw new Error("bad generator point: equation left != right");
  function isWithinCurveOrder(num) {
    return typeof num === "bigint" && _0n5 < num && num < CURVE.n;
  }
  function assertGE(num) {
    if (!isWithinCurveOrder(num))
      throw new Error("Expected valid bigint: 0 < bigint < curve.n");
  }
  function normPrivateKeyToScalar(key) {
    const { allowedPrivateKeyLengths: lengths, nByteLength, wrapPrivateKey, n: n3 } = CURVE;
    if (lengths && typeof key !== "bigint") {
      if (isBytes2(key))
        key = bytesToHex2(key);
      if (typeof key !== "string" || !lengths.includes(key.length))
        throw new Error("Invalid key");
      key = key.padStart(nByteLength * 2, "0");
    }
    let num;
    try {
      num = typeof key === "bigint" ? key : bytesToNumberBE(ensureBytes("private key", key, nByteLength));
    } catch (error) {
      throw new Error(`private key must be ${nByteLength} bytes, hex or bigint, not ${typeof key}`);
    }
    if (wrapPrivateKey)
      num = mod(num, n3);
    assertGE(num);
    return num;
  }
  const pointPrecomputes = /* @__PURE__ */ new Map();
  function assertPrjPoint(other) {
    if (!(other instanceof Point2))
      throw new Error("ProjectivePoint expected");
  }
  class Point2 {
    constructor(px, py, pz) {
      this.px = px;
      this.py = py;
      this.pz = pz;
      if (px == null || !Fp2.isValid(px))
        throw new Error("x required");
      if (py == null || !Fp2.isValid(py))
        throw new Error("y required");
      if (pz == null || !Fp2.isValid(pz))
        throw new Error("z required");
    }
    // Does not validate if the point is on-curve.
    // Use fromHex instead, or call assertValidity() later.
    static fromAffine(p4) {
      const { x: x4, y: y4 } = p4 || {};
      if (!p4 || !Fp2.isValid(x4) || !Fp2.isValid(y4))
        throw new Error("invalid affine point");
      if (p4 instanceof Point2)
        throw new Error("projective point not allowed");
      const is0 = (i3) => Fp2.eql(i3, Fp2.ZERO);
      if (is0(x4) && is0(y4))
        return Point2.ZERO;
      return new Point2(x4, y4, Fp2.ONE);
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    /**
     * Takes a bunch of Projective Points but executes only one
     * inversion on all of them. Inversion is very slow operation,
     * so this improves performance massively.
     * Optimization: converts a list of projective points to a list of identical points with Z=1.
     */
    static normalizeZ(points) {
      const toInv = Fp2.invertBatch(points.map((p4) => p4.pz));
      return points.map((p4, i3) => p4.toAffine(toInv[i3])).map(Point2.fromAffine);
    }
    /**
     * Converts hash string or Uint8Array to Point.
     * @param hex short/long ECDSA hex
     */
    static fromHex(hex) {
      const P5 = Point2.fromAffine(fromBytes(ensureBytes("pointHex", hex)));
      P5.assertValidity();
      return P5;
    }
    // Multiplies generator point by privateKey.
    static fromPrivateKey(privateKey) {
      return Point2.BASE.multiply(normPrivateKeyToScalar(privateKey));
    }
    // "Private method", don't use it directly
    _setWindowSize(windowSize) {
      this._WINDOW_SIZE = windowSize;
      pointPrecomputes.delete(this);
    }
    // A point on curve is valid if it conforms to equation.
    assertValidity() {
      if (this.is0()) {
        if (CURVE.allowInfinityPoint && !Fp2.is0(this.py))
          return;
        throw new Error("bad point: ZERO");
      }
      const { x: x4, y: y4 } = this.toAffine();
      if (!Fp2.isValid(x4) || !Fp2.isValid(y4))
        throw new Error("bad point: x or y not FE");
      const left = Fp2.sqr(y4);
      const right = weierstrassEquation(x4);
      if (!Fp2.eql(left, right))
        throw new Error("bad point: equation left != right");
      if (!this.isTorsionFree())
        throw new Error("bad point: not in prime-order subgroup");
    }
    hasEvenY() {
      const { y: y4 } = this.toAffine();
      if (Fp2.isOdd)
        return !Fp2.isOdd(y4);
      throw new Error("Field doesn't support isOdd");
    }
    /**
     * Compare one point to another.
     */
    equals(other) {
      assertPrjPoint(other);
      const { px: X1, py: Y1, pz: Z1 } = this;
      const { px: X22, py: Y22, pz: Z22 } = other;
      const U1 = Fp2.eql(Fp2.mul(X1, Z22), Fp2.mul(X22, Z1));
      const U22 = Fp2.eql(Fp2.mul(Y1, Z22), Fp2.mul(Y22, Z1));
      return U1 && U22;
    }
    /**
     * Flips point to one corresponding to (x, -y) in Affine coordinates.
     */
    negate() {
      return new Point2(this.px, Fp2.neg(this.py), this.pz);
    }
    // Renes-Costello-Batina exception-free doubling formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 3
    // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
    double() {
      const { a: a3, b: b4 } = CURVE;
      const b32 = Fp2.mul(b4, _3n2);
      const { px: X1, py: Y1, pz: Z1 } = this;
      let X32 = Fp2.ZERO, Y32 = Fp2.ZERO, Z32 = Fp2.ZERO;
      let t0 = Fp2.mul(X1, X1);
      let t1 = Fp2.mul(Y1, Y1);
      let t22 = Fp2.mul(Z1, Z1);
      let t3 = Fp2.mul(X1, Y1);
      t3 = Fp2.add(t3, t3);
      Z32 = Fp2.mul(X1, Z1);
      Z32 = Fp2.add(Z32, Z32);
      X32 = Fp2.mul(a3, Z32);
      Y32 = Fp2.mul(b32, t22);
      Y32 = Fp2.add(X32, Y32);
      X32 = Fp2.sub(t1, Y32);
      Y32 = Fp2.add(t1, Y32);
      Y32 = Fp2.mul(X32, Y32);
      X32 = Fp2.mul(t3, X32);
      Z32 = Fp2.mul(b32, Z32);
      t22 = Fp2.mul(a3, t22);
      t3 = Fp2.sub(t0, t22);
      t3 = Fp2.mul(a3, t3);
      t3 = Fp2.add(t3, Z32);
      Z32 = Fp2.add(t0, t0);
      t0 = Fp2.add(Z32, t0);
      t0 = Fp2.add(t0, t22);
      t0 = Fp2.mul(t0, t3);
      Y32 = Fp2.add(Y32, t0);
      t22 = Fp2.mul(Y1, Z1);
      t22 = Fp2.add(t22, t22);
      t0 = Fp2.mul(t22, t3);
      X32 = Fp2.sub(X32, t0);
      Z32 = Fp2.mul(t22, t1);
      Z32 = Fp2.add(Z32, Z32);
      Z32 = Fp2.add(Z32, Z32);
      return new Point2(X32, Y32, Z32);
    }
    // Renes-Costello-Batina exception-free addition formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 1
    // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
    add(other) {
      assertPrjPoint(other);
      const { px: X1, py: Y1, pz: Z1 } = this;
      const { px: X22, py: Y22, pz: Z22 } = other;
      let X32 = Fp2.ZERO, Y32 = Fp2.ZERO, Z32 = Fp2.ZERO;
      const a3 = CURVE.a;
      const b32 = Fp2.mul(CURVE.b, _3n2);
      let t0 = Fp2.mul(X1, X22);
      let t1 = Fp2.mul(Y1, Y22);
      let t22 = Fp2.mul(Z1, Z22);
      let t3 = Fp2.add(X1, Y1);
      let t4 = Fp2.add(X22, Y22);
      t3 = Fp2.mul(t3, t4);
      t4 = Fp2.add(t0, t1);
      t3 = Fp2.sub(t3, t4);
      t4 = Fp2.add(X1, Z1);
      let t5 = Fp2.add(X22, Z22);
      t4 = Fp2.mul(t4, t5);
      t5 = Fp2.add(t0, t22);
      t4 = Fp2.sub(t4, t5);
      t5 = Fp2.add(Y1, Z1);
      X32 = Fp2.add(Y22, Z22);
      t5 = Fp2.mul(t5, X32);
      X32 = Fp2.add(t1, t22);
      t5 = Fp2.sub(t5, X32);
      Z32 = Fp2.mul(a3, t4);
      X32 = Fp2.mul(b32, t22);
      Z32 = Fp2.add(X32, Z32);
      X32 = Fp2.sub(t1, Z32);
      Z32 = Fp2.add(t1, Z32);
      Y32 = Fp2.mul(X32, Z32);
      t1 = Fp2.add(t0, t0);
      t1 = Fp2.add(t1, t0);
      t22 = Fp2.mul(a3, t22);
      t4 = Fp2.mul(b32, t4);
      t1 = Fp2.add(t1, t22);
      t22 = Fp2.sub(t0, t22);
      t22 = Fp2.mul(a3, t22);
      t4 = Fp2.add(t4, t22);
      t0 = Fp2.mul(t1, t4);
      Y32 = Fp2.add(Y32, t0);
      t0 = Fp2.mul(t5, t4);
      X32 = Fp2.mul(t3, X32);
      X32 = Fp2.sub(X32, t0);
      t0 = Fp2.mul(t3, t1);
      Z32 = Fp2.mul(t5, Z32);
      Z32 = Fp2.add(Z32, t0);
      return new Point2(X32, Y32, Z32);
    }
    subtract(other) {
      return this.add(other.negate());
    }
    is0() {
      return this.equals(Point2.ZERO);
    }
    wNAF(n3) {
      return wnaf.wNAFCached(this, pointPrecomputes, n3, (comp) => {
        const toInv = Fp2.invertBatch(comp.map((p4) => p4.pz));
        return comp.map((p4, i3) => p4.toAffine(toInv[i3])).map(Point2.fromAffine);
      });
    }
    /**
     * Non-constant-time multiplication. Uses double-and-add algorithm.
     * It's faster, but should only be used when you don't care about
     * an exposed private key e.g. sig verification, which works over *public* keys.
     */
    multiplyUnsafe(n3) {
      const I5 = Point2.ZERO;
      if (n3 === _0n5)
        return I5;
      assertGE(n3);
      if (n3 === _1n5)
        return this;
      const { endo } = CURVE;
      if (!endo)
        return wnaf.unsafeLadder(this, n3);
      let { k1neg, k1, k2neg, k2: k22 } = endo.splitScalar(n3);
      let k1p = I5;
      let k2p = I5;
      let d3 = this;
      while (k1 > _0n5 || k22 > _0n5) {
        if (k1 & _1n5)
          k1p = k1p.add(d3);
        if (k22 & _1n5)
          k2p = k2p.add(d3);
        d3 = d3.double();
        k1 >>= _1n5;
        k22 >>= _1n5;
      }
      if (k1neg)
        k1p = k1p.negate();
      if (k2neg)
        k2p = k2p.negate();
      k2p = new Point2(Fp2.mul(k2p.px, endo.beta), k2p.py, k2p.pz);
      return k1p.add(k2p);
    }
    /**
     * Constant time multiplication.
     * Uses wNAF method. Windowed method may be 10% faster,
     * but takes 2x longer to generate and consumes 2x memory.
     * Uses precomputes when available.
     * Uses endomorphism for Koblitz curves.
     * @param scalar by which the point would be multiplied
     * @returns New point
     */
    multiply(scalar) {
      assertGE(scalar);
      let n3 = scalar;
      let point, fake;
      const { endo } = CURVE;
      if (endo) {
        const { k1neg, k1, k2neg, k2: k22 } = endo.splitScalar(n3);
        let { p: k1p, f: f1p } = this.wNAF(k1);
        let { p: k2p, f: f2p } = this.wNAF(k22);
        k1p = wnaf.constTimeNegate(k1neg, k1p);
        k2p = wnaf.constTimeNegate(k2neg, k2p);
        k2p = new Point2(Fp2.mul(k2p.px, endo.beta), k2p.py, k2p.pz);
        point = k1p.add(k2p);
        fake = f1p.add(f2p);
      } else {
        const { p: p4, f: f3 } = this.wNAF(n3);
        point = p4;
        fake = f3;
      }
      return Point2.normalizeZ([point, fake])[0];
    }
    /**
     * Efficiently calculate `aP + bQ`. Unsafe, can expose private key, if used incorrectly.
     * Not using Strauss-Shamir trick: precomputation tables are faster.
     * The trick could be useful if both P and Q are not G (not in our case).
     * @returns non-zero affine point
     */
    multiplyAndAddUnsafe(Q4, a3, b4) {
      const G5 = Point2.BASE;
      const mul = (P5, a4) => a4 === _0n5 || a4 === _1n5 || !P5.equals(G5) ? P5.multiplyUnsafe(a4) : P5.multiply(a4);
      const sum = mul(this, a3).add(mul(Q4, b4));
      return sum.is0() ? void 0 : sum;
    }
    // Converts Projective point to affine (x, y) coordinates.
    // Can accept precomputed Z^-1 - for example, from invertBatch.
    // (x, y, z) ∋ (x=x/z, y=y/z)
    toAffine(iz) {
      const { px: x4, py: y4, pz: z5 } = this;
      const is0 = this.is0();
      if (iz == null)
        iz = is0 ? Fp2.ONE : Fp2.inv(z5);
      const ax = Fp2.mul(x4, iz);
      const ay = Fp2.mul(y4, iz);
      const zz = Fp2.mul(z5, iz);
      if (is0)
        return { x: Fp2.ZERO, y: Fp2.ZERO };
      if (!Fp2.eql(zz, Fp2.ONE))
        throw new Error("invZ was invalid");
      return { x: ax, y: ay };
    }
    isTorsionFree() {
      const { h: cofactor, isTorsionFree } = CURVE;
      if (cofactor === _1n5)
        return true;
      if (isTorsionFree)
        return isTorsionFree(Point2, this);
      throw new Error("isTorsionFree() has not been declared for the elliptic curve");
    }
    clearCofactor() {
      const { h: cofactor, clearCofactor } = CURVE;
      if (cofactor === _1n5)
        return this;
      if (clearCofactor)
        return clearCofactor(Point2, this);
      return this.multiplyUnsafe(CURVE.h);
    }
    toRawBytes(isCompressed = true) {
      this.assertValidity();
      return toBytes3(Point2, this, isCompressed);
    }
    toHex(isCompressed = true) {
      return bytesToHex2(this.toRawBytes(isCompressed));
    }
  }
  Point2.BASE = new Point2(CURVE.Gx, CURVE.Gy, Fp2.ONE);
  Point2.ZERO = new Point2(Fp2.ZERO, Fp2.ONE, Fp2.ZERO);
  const _bits = CURVE.nBitLength;
  const wnaf = wNAF(Point2, CURVE.endo ? Math.ceil(_bits / 2) : _bits);
  return {
    CURVE,
    ProjectivePoint: Point2,
    normPrivateKeyToScalar,
    weierstrassEquation,
    isWithinCurveOrder
  };
}
function validateOpts(curve) {
  const opts = validateBasic(curve);
  validateObject(opts, {
    hash: "hash",
    hmac: "function",
    randomBytes: "function"
  }, {
    bits2int: "function",
    bits2int_modN: "function",
    lowS: "boolean"
  });
  return Object.freeze({ lowS: true, ...opts });
}
function weierstrass(curveDef) {
  const CURVE = validateOpts(curveDef);
  const { Fp: Fp2, n: CURVE_ORDER } = CURVE;
  const compressedLen = Fp2.BYTES + 1;
  const uncompressedLen = 2 * Fp2.BYTES + 1;
  function isValidFieldElement(num) {
    return _0n5 < num && num < Fp2.ORDER;
  }
  function modN2(a3) {
    return mod(a3, CURVE_ORDER);
  }
  function invN(a3) {
    return invert(a3, CURVE_ORDER);
  }
  const { ProjectivePoint: Point2, normPrivateKeyToScalar, weierstrassEquation, isWithinCurveOrder } = weierstrassPoints({
    ...CURVE,
    toBytes(_c2, point, isCompressed) {
      const a3 = point.toAffine();
      const x4 = Fp2.toBytes(a3.x);
      const cat = concatBytes3;
      if (isCompressed) {
        return cat(Uint8Array.from([point.hasEvenY() ? 2 : 3]), x4);
      } else {
        return cat(Uint8Array.from([4]), x4, Fp2.toBytes(a3.y));
      }
    },
    fromBytes(bytes2) {
      const len = bytes2.length;
      const head = bytes2[0];
      const tail = bytes2.subarray(1);
      if (len === compressedLen && (head === 2 || head === 3)) {
        const x4 = bytesToNumberBE(tail);
        if (!isValidFieldElement(x4))
          throw new Error("Point is not on curve");
        const y22 = weierstrassEquation(x4);
        let y4;
        try {
          y4 = Fp2.sqrt(y22);
        } catch (sqrtError) {
          const suffix = sqrtError instanceof Error ? ": " + sqrtError.message : "";
          throw new Error("Point is not on curve" + suffix);
        }
        const isYOdd = (y4 & _1n5) === _1n5;
        const isHeadOdd = (head & 1) === 1;
        if (isHeadOdd !== isYOdd)
          y4 = Fp2.neg(y4);
        return { x: x4, y: y4 };
      } else if (len === uncompressedLen && head === 4) {
        const x4 = Fp2.fromBytes(tail.subarray(0, Fp2.BYTES));
        const y4 = Fp2.fromBytes(tail.subarray(Fp2.BYTES, 2 * Fp2.BYTES));
        return { x: x4, y: y4 };
      } else {
        throw new Error(`Point of length ${len} was invalid. Expected ${compressedLen} compressed bytes or ${uncompressedLen} uncompressed bytes`);
      }
    }
  });
  const numToNByteStr = (num) => bytesToHex2(numberToBytesBE(num, CURVE.nByteLength));
  function isBiggerThanHalfOrder(number2) {
    const HALF = CURVE_ORDER >> _1n5;
    return number2 > HALF;
  }
  function normalizeS(s3) {
    return isBiggerThanHalfOrder(s3) ? modN2(-s3) : s3;
  }
  const slcNum = (b4, from, to) => bytesToNumberBE(b4.slice(from, to));
  class Signature {
    constructor(r3, s3, recovery) {
      this.r = r3;
      this.s = s3;
      this.recovery = recovery;
      this.assertValidity();
    }
    // pair (bytes of r, bytes of s)
    static fromCompact(hex) {
      const l3 = CURVE.nByteLength;
      hex = ensureBytes("compactSignature", hex, l3 * 2);
      return new Signature(slcNum(hex, 0, l3), slcNum(hex, l3, 2 * l3));
    }
    // DER encoded ECDSA signature
    // https://bitcoin.stackexchange.com/questions/57644/what-are-the-parts-of-a-bitcoin-transaction-input-script
    static fromDER(hex) {
      const { r: r3, s: s3 } = DER.toSig(ensureBytes("DER", hex));
      return new Signature(r3, s3);
    }
    assertValidity() {
      if (!isWithinCurveOrder(this.r))
        throw new Error("r must be 0 < r < CURVE.n");
      if (!isWithinCurveOrder(this.s))
        throw new Error("s must be 0 < s < CURVE.n");
    }
    addRecoveryBit(recovery) {
      return new Signature(this.r, this.s, recovery);
    }
    recoverPublicKey(msgHash) {
      const { r: r3, s: s3, recovery: rec } = this;
      const h4 = bits2int_modN(ensureBytes("msgHash", msgHash));
      if (rec == null || ![0, 1, 2, 3].includes(rec))
        throw new Error("recovery id invalid");
      const radj = rec === 2 || rec === 3 ? r3 + CURVE.n : r3;
      if (radj >= Fp2.ORDER)
        throw new Error("recovery id 2 or 3 invalid");
      const prefix = (rec & 1) === 0 ? "02" : "03";
      const R5 = Point2.fromHex(prefix + numToNByteStr(radj));
      const ir = invN(radj);
      const u1 = modN2(-h4 * ir);
      const u22 = modN2(s3 * ir);
      const Q4 = Point2.BASE.multiplyAndAddUnsafe(R5, u1, u22);
      if (!Q4)
        throw new Error("point at infinify");
      Q4.assertValidity();
      return Q4;
    }
    // Signatures should be low-s, to prevent malleability.
    hasHighS() {
      return isBiggerThanHalfOrder(this.s);
    }
    normalizeS() {
      return this.hasHighS() ? new Signature(this.r, modN2(-this.s), this.recovery) : this;
    }
    // DER-encoded
    toDERRawBytes() {
      return hexToBytes2(this.toDERHex());
    }
    toDERHex() {
      return DER.hexFromSig({ r: this.r, s: this.s });
    }
    // padded bytes of r, then padded bytes of s
    toCompactRawBytes() {
      return hexToBytes2(this.toCompactHex());
    }
    toCompactHex() {
      return numToNByteStr(this.r) + numToNByteStr(this.s);
    }
  }
  const utils = {
    isValidPrivateKey(privateKey) {
      try {
        normPrivateKeyToScalar(privateKey);
        return true;
      } catch (error) {
        return false;
      }
    },
    normPrivateKeyToScalar,
    /**
     * Produces cryptographically secure private key from random of size
     * (groupLen + ceil(groupLen / 2)) with modulo bias being negligible.
     */
    randomPrivateKey: () => {
      const length = getMinHashLength(CURVE.n);
      return mapHashToField(CURVE.randomBytes(length), CURVE.n);
    },
    /**
     * Creates precompute table for an arbitrary EC point. Makes point "cached".
     * Allows to massively speed-up `point.multiply(scalar)`.
     * @returns cached point
     * @example
     * const fast = utils.precompute(8, ProjectivePoint.fromHex(someonesPubKey));
     * fast.multiply(privKey); // much faster ECDH now
     */
    precompute(windowSize = 8, point = Point2.BASE) {
      point._setWindowSize(windowSize);
      point.multiply(BigInt(3));
      return point;
    }
  };
  function getPublicKey(privateKey, isCompressed = true) {
    return Point2.fromPrivateKey(privateKey).toRawBytes(isCompressed);
  }
  function isProbPub(item) {
    const arr = isBytes2(item);
    const str = typeof item === "string";
    const len = (arr || str) && item.length;
    if (arr)
      return len === compressedLen || len === uncompressedLen;
    if (str)
      return len === 2 * compressedLen || len === 2 * uncompressedLen;
    if (item instanceof Point2)
      return true;
    return false;
  }
  function getSharedSecret(privateA, publicB, isCompressed = true) {
    if (isProbPub(privateA))
      throw new Error("first arg must be private key");
    if (!isProbPub(publicB))
      throw new Error("second arg must be public key");
    const b4 = Point2.fromHex(publicB);
    return b4.multiply(normPrivateKeyToScalar(privateA)).toRawBytes(isCompressed);
  }
  const bits2int = CURVE.bits2int || function(bytes2) {
    const num = bytesToNumberBE(bytes2);
    const delta = bytes2.length * 8 - CURVE.nBitLength;
    return delta > 0 ? num >> BigInt(delta) : num;
  };
  const bits2int_modN = CURVE.bits2int_modN || function(bytes2) {
    return modN2(bits2int(bytes2));
  };
  const ORDER_MASK = bitMask(CURVE.nBitLength);
  function int2octets(num) {
    if (typeof num !== "bigint")
      throw new Error("bigint expected");
    if (!(_0n5 <= num && num < ORDER_MASK))
      throw new Error(`bigint expected < 2^${CURVE.nBitLength}`);
    return numberToBytesBE(num, CURVE.nByteLength);
  }
  function prepSig(msgHash, privateKey, opts = defaultSigOpts) {
    if (["recovered", "canonical"].some((k5) => k5 in opts))
      throw new Error("sign() legacy options not supported");
    const { hash: hash3, randomBytes: randomBytes2 } = CURVE;
    let { lowS, prehash, extraEntropy: ent } = opts;
    if (lowS == null)
      lowS = true;
    msgHash = ensureBytes("msgHash", msgHash);
    if (prehash)
      msgHash = ensureBytes("prehashed msgHash", hash3(msgHash));
    const h1int = bits2int_modN(msgHash);
    const d3 = normPrivateKeyToScalar(privateKey);
    const seedArgs = [int2octets(d3), int2octets(h1int)];
    if (ent != null && ent !== false) {
      const e3 = ent === true ? randomBytes2(Fp2.BYTES) : ent;
      seedArgs.push(ensureBytes("extraEntropy", e3));
    }
    const seed = concatBytes3(...seedArgs);
    const m4 = h1int;
    function k2sig(kBytes) {
      const k5 = bits2int(kBytes);
      if (!isWithinCurveOrder(k5))
        return;
      const ik = invN(k5);
      const q4 = Point2.BASE.multiply(k5).toAffine();
      const r3 = modN2(q4.x);
      if (r3 === _0n5)
        return;
      const s3 = modN2(ik * modN2(m4 + r3 * d3));
      if (s3 === _0n5)
        return;
      let recovery = (q4.x === r3 ? 0 : 2) | Number(q4.y & _1n5);
      let normS = s3;
      if (lowS && isBiggerThanHalfOrder(s3)) {
        normS = normalizeS(s3);
        recovery ^= 1;
      }
      return new Signature(r3, normS, recovery);
    }
    return { seed, k2sig };
  }
  const defaultSigOpts = { lowS: CURVE.lowS, prehash: false };
  const defaultVerOpts = { lowS: CURVE.lowS, prehash: false };
  function sign(msgHash, privKey, opts = defaultSigOpts) {
    const { seed, k2sig } = prepSig(msgHash, privKey, opts);
    const C4 = CURVE;
    const drbg = createHmacDrbg(C4.hash.outputLen, C4.nByteLength, C4.hmac);
    return drbg(seed, k2sig);
  }
  Point2.BASE._setWindowSize(8);
  function verify(signature, msgHash, publicKey, opts = defaultVerOpts) {
    const sg = signature;
    msgHash = ensureBytes("msgHash", msgHash);
    publicKey = ensureBytes("publicKey", publicKey);
    if ("strict" in opts)
      throw new Error("options.strict was renamed to lowS");
    const { lowS, prehash } = opts;
    let _sig = void 0;
    let P5;
    try {
      if (typeof sg === "string" || isBytes2(sg)) {
        try {
          _sig = Signature.fromDER(sg);
        } catch (derError) {
          if (!(derError instanceof DER.Err))
            throw derError;
          _sig = Signature.fromCompact(sg);
        }
      } else if (typeof sg === "object" && typeof sg.r === "bigint" && typeof sg.s === "bigint") {
        const { r: r4, s: s4 } = sg;
        _sig = new Signature(r4, s4);
      } else {
        throw new Error("PARSE");
      }
      P5 = Point2.fromHex(publicKey);
    } catch (error) {
      if (error.message === "PARSE")
        throw new Error(`signature must be Signature instance, Uint8Array or hex string`);
      return false;
    }
    if (lowS && _sig.hasHighS())
      return false;
    if (prehash)
      msgHash = CURVE.hash(msgHash);
    const { r: r3, s: s3 } = _sig;
    const h4 = bits2int_modN(msgHash);
    const is = invN(s3);
    const u1 = modN2(h4 * is);
    const u22 = modN2(r3 * is);
    const R5 = Point2.BASE.multiplyAndAddUnsafe(P5, u1, u22)?.toAffine();
    if (!R5)
      return false;
    const v4 = modN2(R5.x);
    return v4 === r3;
  }
  return {
    CURVE,
    getPublicKey,
    getSharedSecret,
    sign,
    verify,
    ProjectivePoint: Point2,
    Signature,
    utils
  };
}
function SWUFpSqrtRatio(Fp2, Z4) {
  const q4 = Fp2.ORDER;
  let l3 = _0n5;
  for (let o4 = q4 - _1n5; o4 % _2n4 === _0n5; o4 /= _2n4)
    l3 += _1n5;
  const c1 = l3;
  const _2n_pow_c1_1 = _2n4 << c1 - _1n5 - _1n5;
  const _2n_pow_c1 = _2n_pow_c1_1 * _2n4;
  const c22 = (q4 - _1n5) / _2n_pow_c1;
  const c3 = (c22 - _1n5) / _2n4;
  const c4 = _2n_pow_c1 - _1n5;
  const c5 = _2n_pow_c1_1;
  const c6 = Fp2.pow(Z4, c22);
  const c7 = Fp2.pow(Z4, (c22 + _1n5) / _2n4);
  let sqrtRatio = (u3, v4) => {
    let tv1 = c6;
    let tv2 = Fp2.pow(v4, c4);
    let tv3 = Fp2.sqr(tv2);
    tv3 = Fp2.mul(tv3, v4);
    let tv5 = Fp2.mul(u3, tv3);
    tv5 = Fp2.pow(tv5, c3);
    tv5 = Fp2.mul(tv5, tv2);
    tv2 = Fp2.mul(tv5, v4);
    tv3 = Fp2.mul(tv5, u3);
    let tv4 = Fp2.mul(tv3, tv2);
    tv5 = Fp2.pow(tv4, c5);
    let isQR = Fp2.eql(tv5, Fp2.ONE);
    tv2 = Fp2.mul(tv3, c7);
    tv5 = Fp2.mul(tv4, tv1);
    tv3 = Fp2.cmov(tv2, tv3, isQR);
    tv4 = Fp2.cmov(tv5, tv4, isQR);
    for (let i3 = c1; i3 > _1n5; i3--) {
      let tv52 = i3 - _2n4;
      tv52 = _2n4 << tv52 - _1n5;
      let tvv5 = Fp2.pow(tv4, tv52);
      const e1 = Fp2.eql(tvv5, Fp2.ONE);
      tv2 = Fp2.mul(tv3, tv1);
      tv1 = Fp2.mul(tv1, tv1);
      tvv5 = Fp2.mul(tv4, tv1);
      tv3 = Fp2.cmov(tv2, tv3, e1);
      tv4 = Fp2.cmov(tvv5, tv4, e1);
    }
    return { isValid: isQR, value: tv3 };
  };
  if (Fp2.ORDER % _4n2 === _3n2) {
    const c12 = (Fp2.ORDER - _3n2) / _4n2;
    const c23 = Fp2.sqrt(Fp2.neg(Z4));
    sqrtRatio = (u3, v4) => {
      let tv1 = Fp2.sqr(v4);
      const tv2 = Fp2.mul(u3, v4);
      tv1 = Fp2.mul(tv1, tv2);
      let y1 = Fp2.pow(tv1, c12);
      y1 = Fp2.mul(y1, tv2);
      const y22 = Fp2.mul(y1, c23);
      const tv3 = Fp2.mul(Fp2.sqr(y1), v4);
      const isQR = Fp2.eql(tv3, u3);
      let y4 = Fp2.cmov(y22, y1, isQR);
      return { isValid: isQR, value: y4 };
    };
  }
  return sqrtRatio;
}
function mapToCurveSimpleSWU(Fp2, opts) {
  validateField(Fp2);
  if (!Fp2.isValid(opts.A) || !Fp2.isValid(opts.B) || !Fp2.isValid(opts.Z))
    throw new Error("mapToCurveSimpleSWU: invalid opts");
  const sqrtRatio = SWUFpSqrtRatio(Fp2, opts.Z);
  if (!Fp2.isOdd)
    throw new Error("Fp.isOdd is not implemented!");
  return (u3) => {
    let tv1, tv2, tv3, tv4, tv5, tv6, x4, y4;
    tv1 = Fp2.sqr(u3);
    tv1 = Fp2.mul(tv1, opts.Z);
    tv2 = Fp2.sqr(tv1);
    tv2 = Fp2.add(tv2, tv1);
    tv3 = Fp2.add(tv2, Fp2.ONE);
    tv3 = Fp2.mul(tv3, opts.B);
    tv4 = Fp2.cmov(opts.Z, Fp2.neg(tv2), !Fp2.eql(tv2, Fp2.ZERO));
    tv4 = Fp2.mul(tv4, opts.A);
    tv2 = Fp2.sqr(tv3);
    tv6 = Fp2.sqr(tv4);
    tv5 = Fp2.mul(tv6, opts.A);
    tv2 = Fp2.add(tv2, tv5);
    tv2 = Fp2.mul(tv2, tv3);
    tv6 = Fp2.mul(tv6, tv4);
    tv5 = Fp2.mul(tv6, opts.B);
    tv2 = Fp2.add(tv2, tv5);
    x4 = Fp2.mul(tv1, tv3);
    const { isValid, value } = sqrtRatio(tv2, tv6);
    y4 = Fp2.mul(tv1, u3);
    y4 = Fp2.mul(y4, value);
    x4 = Fp2.cmov(x4, tv3, isValid);
    y4 = Fp2.cmov(y4, value, isValid);
    const e1 = Fp2.isOdd(u3) === Fp2.isOdd(y4);
    y4 = Fp2.cmov(Fp2.neg(y4), y4, e1);
    x4 = Fp2.div(x4, tv4);
    return { x: x4, y: y4 };
  };
}
var b2n, h2b, DER, _0n5, _1n5, _2n4, _3n2, _4n2;
var init_weierstrass = __esm({
  "node_modules/@noble/curves/esm/abstract/weierstrass.js"() {
    init_modular();
    init_utils4();
    init_utils4();
    init_curve();
    ({ bytesToNumberBE: b2n, hexToBytes: h2b } = utils_exports2);
    DER = {
      // asn.1 DER encoding utils
      Err: class DERErr extends Error {
        constructor(m4 = "") {
          super(m4);
        }
      },
      _parseInt(data) {
        const { Err: E5 } = DER;
        if (data.length < 2 || data[0] !== 2)
          throw new E5("Invalid signature integer tag");
        const len = data[1];
        const res = data.subarray(2, len + 2);
        if (!len || res.length !== len)
          throw new E5("Invalid signature integer: wrong length");
        if (res[0] & 128)
          throw new E5("Invalid signature integer: negative");
        if (res[0] === 0 && !(res[1] & 128))
          throw new E5("Invalid signature integer: unnecessary leading zero");
        return { d: b2n(res), l: data.subarray(len + 2) };
      },
      toSig(hex) {
        const { Err: E5 } = DER;
        const data = typeof hex === "string" ? h2b(hex) : hex;
        abytes(data);
        let l3 = data.length;
        if (l3 < 2 || data[0] != 48)
          throw new E5("Invalid signature tag");
        if (data[1] !== l3 - 2)
          throw new E5("Invalid signature: incorrect length");
        const { d: r3, l: sBytes } = DER._parseInt(data.subarray(2));
        const { d: s3, l: rBytesLeft } = DER._parseInt(sBytes);
        if (rBytesLeft.length)
          throw new E5("Invalid signature: left bytes after parsing");
        return { r: r3, s: s3 };
      },
      hexFromSig(sig) {
        const slice2 = (s4) => Number.parseInt(s4[0], 16) & 8 ? "00" + s4 : s4;
        const h4 = (num) => {
          const hex = num.toString(16);
          return hex.length & 1 ? `0${hex}` : hex;
        };
        const s3 = slice2(h4(sig.s));
        const r3 = slice2(h4(sig.r));
        const shl = s3.length / 2;
        const rhl = r3.length / 2;
        const sl = h4(shl);
        const rl = h4(rhl);
        return `30${h4(rhl + shl + 4)}02${rl}${r3}02${sl}${s3}`;
      }
    };
    _0n5 = BigInt(0);
    _1n5 = BigInt(1);
    _2n4 = BigInt(2);
    _3n2 = BigInt(3);
    _4n2 = BigInt(4);
  }
});

// node_modules/@noble/curves/esm/abstract/hash-to-curve.js
function i2osp(value, length) {
  if (value < 0 || value >= 1 << 8 * length) {
    throw new Error(`bad I2OSP call: value=${value} length=${length}`);
  }
  const res = Array.from({ length }).fill(0);
  for (let i3 = length - 1; i3 >= 0; i3--) {
    res[i3] = value & 255;
    value >>>= 8;
  }
  return new Uint8Array(res);
}
function strxor(a3, b4) {
  const arr = new Uint8Array(a3.length);
  for (let i3 = 0; i3 < a3.length; i3++) {
    arr[i3] = a3[i3] ^ b4[i3];
  }
  return arr;
}
function anum(item) {
  if (!Number.isSafeInteger(item))
    throw new Error("number expected");
}
function expand_message_xmd(msg, DST, lenInBytes, H4) {
  abytes(msg);
  abytes(DST);
  anum(lenInBytes);
  if (DST.length > 255)
    DST = H4(concatBytes3(utf8ToBytes2("H2C-OVERSIZE-DST-"), DST));
  const { outputLen: b_in_bytes, blockLen: r_in_bytes } = H4;
  const ell = Math.ceil(lenInBytes / b_in_bytes);
  if (ell > 255)
    throw new Error("Invalid xmd length");
  const DST_prime = concatBytes3(DST, i2osp(DST.length, 1));
  const Z_pad = i2osp(0, r_in_bytes);
  const l_i_b_str = i2osp(lenInBytes, 2);
  const b4 = new Array(ell);
  const b_0 = H4(concatBytes3(Z_pad, msg, l_i_b_str, i2osp(0, 1), DST_prime));
  b4[0] = H4(concatBytes3(b_0, i2osp(1, 1), DST_prime));
  for (let i3 = 1; i3 <= ell; i3++) {
    const args = [strxor(b_0, b4[i3 - 1]), i2osp(i3 + 1, 1), DST_prime];
    b4[i3] = H4(concatBytes3(...args));
  }
  const pseudo_random_bytes = concatBytes3(...b4);
  return pseudo_random_bytes.slice(0, lenInBytes);
}
function expand_message_xof(msg, DST, lenInBytes, k5, H4) {
  abytes(msg);
  abytes(DST);
  anum(lenInBytes);
  if (DST.length > 255) {
    const dkLen = Math.ceil(2 * k5 / 8);
    DST = H4.create({ dkLen }).update(utf8ToBytes2("H2C-OVERSIZE-DST-")).update(DST).digest();
  }
  if (lenInBytes > 65535 || DST.length > 255)
    throw new Error("expand_message_xof: invalid lenInBytes");
  return H4.create({ dkLen: lenInBytes }).update(msg).update(i2osp(lenInBytes, 2)).update(DST).update(i2osp(DST.length, 1)).digest();
}
function hash_to_field(msg, count, options) {
  validateObject(options, {
    DST: "stringOrUint8Array",
    p: "bigint",
    m: "isSafeInteger",
    k: "isSafeInteger",
    hash: "hash"
  });
  const { p: p4, k: k5, m: m4, hash: hash3, expand, DST: _DST } = options;
  abytes(msg);
  anum(count);
  const DST = typeof _DST === "string" ? utf8ToBytes2(_DST) : _DST;
  const log2p = p4.toString(2).length;
  const L5 = Math.ceil((log2p + k5) / 8);
  const len_in_bytes = count * m4 * L5;
  let prb;
  if (expand === "xmd") {
    prb = expand_message_xmd(msg, DST, len_in_bytes, hash3);
  } else if (expand === "xof") {
    prb = expand_message_xof(msg, DST, len_in_bytes, k5, hash3);
  } else if (expand === "_internal_pass") {
    prb = msg;
  } else {
    throw new Error('expand must be "xmd" or "xof"');
  }
  const u3 = new Array(count);
  for (let i3 = 0; i3 < count; i3++) {
    const e3 = new Array(m4);
    for (let j5 = 0; j5 < m4; j5++) {
      const elm_offset = L5 * (j5 + i3 * m4);
      const tv = prb.subarray(elm_offset, elm_offset + L5);
      e3[j5] = mod(os2ip(tv), p4);
    }
    u3[i3] = e3;
  }
  return u3;
}
function isogenyMap(field, map) {
  const COEFF = map.map((i3) => Array.from(i3).reverse());
  return (x4, y4) => {
    const [xNum, xDen, yNum, yDen] = COEFF.map((val) => val.reduce((acc, i3) => field.add(field.mul(acc, x4), i3)));
    x4 = field.div(xNum, xDen);
    y4 = field.mul(y4, field.div(yNum, yDen));
    return { x: x4, y: y4 };
  };
}
function createHasher(Point2, mapToCurve, def) {
  if (typeof mapToCurve !== "function")
    throw new Error("mapToCurve() must be defined");
  return {
    // Encodes byte string to elliptic curve.
    // hash_to_curve from https://www.rfc-editor.org/rfc/rfc9380#section-3
    hashToCurve(msg, options) {
      const u3 = hash_to_field(msg, 2, { ...def, DST: def.DST, ...options });
      const u0 = Point2.fromAffine(mapToCurve(u3[0]));
      const u1 = Point2.fromAffine(mapToCurve(u3[1]));
      const P5 = u0.add(u1).clearCofactor();
      P5.assertValidity();
      return P5;
    },
    // Encodes byte string to elliptic curve.
    // encode_to_curve from https://www.rfc-editor.org/rfc/rfc9380#section-3
    encodeToCurve(msg, options) {
      const u3 = hash_to_field(msg, 1, { ...def, DST: def.encodeDST, ...options });
      const P5 = Point2.fromAffine(mapToCurve(u3[0])).clearCofactor();
      P5.assertValidity();
      return P5;
    }
  };
}
var os2ip;
var init_hash_to_curve = __esm({
  "node_modules/@noble/curves/esm/abstract/hash-to-curve.js"() {
    init_modular();
    init_utils4();
    os2ip = bytesToNumberBE;
  }
});

// node_modules/@noble/hashes/esm/hmac.js
var HMAC, hmac;
var init_hmac = __esm({
  "node_modules/@noble/hashes/esm/hmac.js"() {
    init_assert();
    init_utils3();
    HMAC = class extends Hash {
      constructor(hash3, _key) {
        super();
        this.finished = false;
        this.destroyed = false;
        hash(hash3);
        const key = toBytes2(_key);
        this.iHash = hash3.create();
        if (typeof this.iHash.update !== "function")
          throw new Error("Expected instance of class which extends utils.Hash");
        this.blockLen = this.iHash.blockLen;
        this.outputLen = this.iHash.outputLen;
        const blockLen = this.blockLen;
        const pad2 = new Uint8Array(blockLen);
        pad2.set(key.length > blockLen ? hash3.create().update(key).digest() : key);
        for (let i3 = 0; i3 < pad2.length; i3++)
          pad2[i3] ^= 54;
        this.iHash.update(pad2);
        this.oHash = hash3.create();
        for (let i3 = 0; i3 < pad2.length; i3++)
          pad2[i3] ^= 54 ^ 92;
        this.oHash.update(pad2);
        pad2.fill(0);
      }
      update(buf) {
        exists(this);
        this.iHash.update(buf);
        return this;
      }
      digestInto(out) {
        exists(this);
        bytes(out, this.outputLen);
        this.finished = true;
        this.iHash.digestInto(out);
        this.oHash.update(out);
        this.oHash.digestInto(out);
        this.destroy();
      }
      digest() {
        const out = new Uint8Array(this.oHash.outputLen);
        this.digestInto(out);
        return out;
      }
      _cloneInto(to) {
        to || (to = Object.create(Object.getPrototypeOf(this), {}));
        const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
        to = to;
        to.finished = finished;
        to.destroyed = destroyed;
        to.blockLen = blockLen;
        to.outputLen = outputLen;
        to.oHash = oHash._cloneInto(to.oHash);
        to.iHash = iHash._cloneInto(to.iHash);
        return to;
      }
      destroy() {
        this.destroyed = true;
        this.oHash.destroy();
        this.iHash.destroy();
      }
    };
    hmac = (hash3, key, message) => new HMAC(hash3, key).update(message).digest();
    hmac.create = (hash3, key) => new HMAC(hash3, key);
  }
});

// node_modules/@noble/curves/esm/_shortw_utils.js
function getHash(hash3) {
  return {
    hash: hash3,
    hmac: (key, ...msgs) => hmac(hash3, key, concatBytes(...msgs)),
    randomBytes
  };
}
function createCurve(curveDef, defHash) {
  const create2 = (hash3) => weierstrass({ ...curveDef, ...getHash(hash3) });
  return Object.freeze({ ...create2(defHash), create: create2 });
}
var init_shortw_utils = __esm({
  "node_modules/@noble/curves/esm/_shortw_utils.js"() {
    init_hmac();
    init_utils3();
    init_weierstrass();
  }
});

// node_modules/@noble/curves/esm/secp256k1.js
var secp256k1_exports = {};
__export(secp256k1_exports, {
  encodeToCurve: () => encodeToCurve,
  hashToCurve: () => hashToCurve,
  schnorr: () => schnorr,
  secp256k1: () => secp256k1
});
function sqrtMod(y4) {
  const P5 = secp256k1P;
  const _3n3 = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
  const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
  const b22 = y4 * y4 * y4 % P5;
  const b32 = b22 * b22 * y4 % P5;
  const b6 = pow2(b32, _3n3, P5) * b32 % P5;
  const b9 = pow2(b6, _3n3, P5) * b32 % P5;
  const b11 = pow2(b9, _2n5, P5) * b22 % P5;
  const b222 = pow2(b11, _11n, P5) * b11 % P5;
  const b44 = pow2(b222, _22n, P5) * b222 % P5;
  const b88 = pow2(b44, _44n, P5) * b44 % P5;
  const b176 = pow2(b88, _88n, P5) * b88 % P5;
  const b220 = pow2(b176, _44n, P5) * b44 % P5;
  const b223 = pow2(b220, _3n3, P5) * b32 % P5;
  const t1 = pow2(b223, _23n, P5) * b222 % P5;
  const t22 = pow2(t1, _6n, P5) * b22 % P5;
  const root = pow2(t22, _2n5, P5);
  if (!Fp.eql(Fp.sqr(root), y4))
    throw new Error("Cannot find square root");
  return root;
}
function taggedHash(tag, ...messages) {
  let tagP = TAGGED_HASH_PREFIXES[tag];
  if (tagP === void 0) {
    const tagH = sha256(Uint8Array.from(tag, (c3) => c3.charCodeAt(0)));
    tagP = concatBytes3(tagH, tagH);
    TAGGED_HASH_PREFIXES[tag] = tagP;
  }
  return sha256(concatBytes3(tagP, ...messages));
}
function schnorrGetExtPubKey(priv) {
  let d_ = secp256k1.utils.normPrivateKeyToScalar(priv);
  let p4 = Point.fromPrivateKey(d_);
  const scalar = p4.hasEvenY() ? d_ : modN(-d_);
  return { scalar, bytes: pointToBytes(p4) };
}
function lift_x(x4) {
  if (!fe3(x4))
    throw new Error("bad x: need 0 < x < p");
  const xx = modP(x4 * x4);
  const c3 = modP(xx * x4 + BigInt(7));
  let y4 = sqrtMod(c3);
  if (y4 % _2n5 !== _0n6)
    y4 = modP(-y4);
  const p4 = new Point(x4, y4, _1n6);
  p4.assertValidity();
  return p4;
}
function challenge(...args) {
  return modN(bytesToNumberBE(taggedHash("BIP0340/challenge", ...args)));
}
function schnorrGetPublicKey(privateKey) {
  return schnorrGetExtPubKey(privateKey).bytes;
}
function schnorrSign(message, privateKey, auxRand = randomBytes(32)) {
  const m4 = ensureBytes("message", message);
  const { bytes: px, scalar: d3 } = schnorrGetExtPubKey(privateKey);
  const a3 = ensureBytes("auxRand", auxRand, 32);
  const t3 = numTo32b(d3 ^ bytesToNumberBE(taggedHash("BIP0340/aux", a3)));
  const rand = taggedHash("BIP0340/nonce", t3, px, m4);
  const k_ = modN(bytesToNumberBE(rand));
  if (k_ === _0n6)
    throw new Error("sign failed: k is zero");
  const { bytes: rx, scalar: k5 } = schnorrGetExtPubKey(k_);
  const e3 = challenge(rx, px, m4);
  const sig = new Uint8Array(64);
  sig.set(rx, 0);
  sig.set(numTo32b(modN(k5 + e3 * d3)), 32);
  if (!schnorrVerify(sig, m4, px))
    throw new Error("sign: Invalid signature produced");
  return sig;
}
function schnorrVerify(signature, message, publicKey) {
  const sig = ensureBytes("signature", signature, 64);
  const m4 = ensureBytes("message", message);
  const pub = ensureBytes("publicKey", publicKey, 32);
  try {
    const P5 = lift_x(bytesToNumberBE(pub));
    const r3 = bytesToNumberBE(sig.subarray(0, 32));
    if (!fe3(r3))
      return false;
    const s3 = bytesToNumberBE(sig.subarray(32, 64));
    if (!ge3(s3))
      return false;
    const e3 = challenge(numTo32b(r3), pointToBytes(P5), m4);
    const R5 = GmulAdd(P5, s3, modN(-e3));
    if (!R5 || !R5.hasEvenY() || R5.toAffine().x !== r3)
      return false;
    return true;
  } catch (error) {
    return false;
  }
}
var secp256k1P, secp256k1N, _1n6, _2n5, divNearest, Fp, secp256k1, _0n6, fe3, ge3, TAGGED_HASH_PREFIXES, pointToBytes, numTo32b, modP, modN, Point, GmulAdd, schnorr, isoMap, mapSWU, htf, hashToCurve, encodeToCurve;
var init_secp256k1 = __esm({
  "node_modules/@noble/curves/esm/secp256k1.js"() {
    init_sha256();
    init_utils3();
    init_modular();
    init_weierstrass();
    init_utils4();
    init_hash_to_curve();
    init_shortw_utils();
    secp256k1P = BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f");
    secp256k1N = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");
    _1n6 = BigInt(1);
    _2n5 = BigInt(2);
    divNearest = (a3, b4) => (a3 + b4 / _2n5) / b4;
    Fp = Field(secp256k1P, void 0, void 0, { sqrt: sqrtMod });
    secp256k1 = createCurve({
      a: BigInt(0),
      // equation params: a, b
      b: BigInt(7),
      // Seem to be rigid: bitcointalk.org/index.php?topic=289795.msg3183975#msg3183975
      Fp,
      // Field's prime: 2n**256n - 2n**32n - 2n**9n - 2n**8n - 2n**7n - 2n**6n - 2n**4n - 1n
      n: secp256k1N,
      // Curve order, total count of valid points in the field
      // Base point (x, y) aka generator point
      Gx: BigInt("55066263022277343669578718895168534326250603453777594175500187360389116729240"),
      Gy: BigInt("32670510020758816978083085130507043184471273380659243275938904335757337482424"),
      h: BigInt(1),
      // Cofactor
      lowS: true,
      // Allow only low-S signatures by default in sign() and verify()
      /**
       * secp256k1 belongs to Koblitz curves: it has efficiently computable endomorphism.
       * Endomorphism uses 2x less RAM, speeds up precomputation by 2x and ECDH / key recovery by 20%.
       * For precomputed wNAF it trades off 1/2 init time & 1/3 ram for 20% perf hit.
       * Explanation: https://gist.github.com/paulmillr/eb670806793e84df628a7c434a873066
       */
      endo: {
        beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
        splitScalar: (k5) => {
          const n3 = secp256k1N;
          const a1 = BigInt("0x3086d221a7d46bcde86c90e49284eb15");
          const b1 = -_1n6 * BigInt("0xe4437ed6010e88286f547fa90abfe4c3");
          const a22 = BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8");
          const b22 = a1;
          const POW_2_128 = BigInt("0x100000000000000000000000000000000");
          const c1 = divNearest(b22 * k5, n3);
          const c22 = divNearest(-b1 * k5, n3);
          let k1 = mod(k5 - c1 * a1 - c22 * a22, n3);
          let k22 = mod(-c1 * b1 - c22 * b22, n3);
          const k1neg = k1 > POW_2_128;
          const k2neg = k22 > POW_2_128;
          if (k1neg)
            k1 = n3 - k1;
          if (k2neg)
            k22 = n3 - k22;
          if (k1 > POW_2_128 || k22 > POW_2_128) {
            throw new Error("splitScalar: Endomorphism failed, k=" + k5);
          }
          return { k1neg, k1, k2neg, k2: k22 };
        }
      }
    }, sha256);
    _0n6 = BigInt(0);
    fe3 = (x4) => typeof x4 === "bigint" && _0n6 < x4 && x4 < secp256k1P;
    ge3 = (x4) => typeof x4 === "bigint" && _0n6 < x4 && x4 < secp256k1N;
    TAGGED_HASH_PREFIXES = {};
    pointToBytes = (point) => point.toRawBytes(true).slice(1);
    numTo32b = (n3) => numberToBytesBE(n3, 32);
    modP = (x4) => mod(x4, secp256k1P);
    modN = (x4) => mod(x4, secp256k1N);
    Point = secp256k1.ProjectivePoint;
    GmulAdd = (Q4, a3, b4) => Point.BASE.multiplyAndAddUnsafe(Q4, a3, b4);
    schnorr = /* @__PURE__ */ (() => ({
      getPublicKey: schnorrGetPublicKey,
      sign: schnorrSign,
      verify: schnorrVerify,
      utils: {
        randomPrivateKey: secp256k1.utils.randomPrivateKey,
        lift_x,
        pointToBytes,
        numberToBytesBE,
        bytesToNumberBE,
        taggedHash,
        mod
      }
    }))();
    isoMap = /* @__PURE__ */ (() => isogenyMap(Fp, [
      // xNum
      [
        "0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa8c7",
        "0x7d3d4c80bc321d5b9f315cea7fd44c5d595d2fc0bf63b92dfff1044f17c6581",
        "0x534c328d23f234e6e2a413deca25caece4506144037c40314ecbd0b53d9dd262",
        "0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa88c"
      ],
      // xDen
      [
        "0xd35771193d94918a9ca34ccbb7b640dd86cd409542f8487d9fe6b745781eb49b",
        "0xedadc6f64383dc1df7c4b2d51b54225406d36b641f5e41bbc52a56612a8c6d14",
        "0x0000000000000000000000000000000000000000000000000000000000000001"
        // LAST 1
      ],
      // yNum
      [
        "0x4bda12f684bda12f684bda12f684bda12f684bda12f684bda12f684b8e38e23c",
        "0xc75e0c32d5cb7c0fa9d0a54b12a0a6d5647ab046d686da6fdffc90fc201d71a3",
        "0x29a6194691f91a73715209ef6512e576722830a201be2018a765e85a9ecee931",
        "0x2f684bda12f684bda12f684bda12f684bda12f684bda12f684bda12f38e38d84"
      ],
      // yDen
      [
        "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffff93b",
        "0x7a06534bb8bdb49fd5e9e6632722c2989467c1bfc8e8d978dfb425d2685c2573",
        "0x6484aa716545ca2cf3a70c3fa8fe337e0a3d21162f0d6299a7bf8192bfd2a76f",
        "0x0000000000000000000000000000000000000000000000000000000000000001"
        // LAST 1
      ]
    ].map((i3) => i3.map((j5) => BigInt(j5)))))();
    mapSWU = /* @__PURE__ */ (() => mapToCurveSimpleSWU(Fp, {
      A: BigInt("0x3f8731abdd661adca08a5558f0f5d272e953d363cb6f0e5d405447c01a444533"),
      B: BigInt("1771"),
      Z: Fp.create(BigInt("-11"))
    }))();
    htf = /* @__PURE__ */ (() => createHasher(secp256k1.ProjectivePoint, (scalars) => {
      const { x: x4, y: y4 } = mapSWU(Fp.create(scalars[0]));
      return isoMap(x4, y4);
    }, {
      DST: "secp256k1_XMD:SHA-256_SSWU_RO_",
      encodeDST: "secp256k1_XMD:SHA-256_SSWU_NU_",
      p: Fp.ORDER,
      m: 1,
      k: 128,
      expand: "xmd",
      hash: sha256
    }))();
    hashToCurve = /* @__PURE__ */ (() => htf.hashToCurve)();
    encodeToCurve = /* @__PURE__ */ (() => htf.encodeToCurve)();
  }
});

// node_modules/jwt-decode/build/esm/index.js
var InvalidTokenError = class extends Error {
};
InvalidTokenError.prototype.name = "InvalidTokenError";
function b64DecodeUnicode(str) {
  return decodeURIComponent(atob(str).replace(/(.)/g, (m4, p4) => {
    let code = p4.charCodeAt(0).toString(16).toUpperCase();
    if (code.length < 2) {
      code = "0" + code;
    }
    return "%" + code;
  }));
}
function base64UrlDecode(str) {
  let output2 = str.replace(/-/g, "+").replace(/_/g, "/");
  switch (output2.length % 4) {
    case 0:
      break;
    case 2:
      output2 += "==";
      break;
    case 3:
      output2 += "=";
      break;
    default:
      throw new Error("base64 string is not of the correct length");
  }
  try {
    return b64DecodeUnicode(output2);
  } catch (err) {
    return atob(output2);
  }
}
function jwtDecode(token, options) {
  if (typeof token !== "string") {
    throw new InvalidTokenError("Invalid token specified: must be a string");
  }
  options || (options = {});
  const pos = options.header === true ? 0 : 1;
  const part = token.split(".")[pos];
  if (typeof part !== "string") {
    throw new InvalidTokenError(`Invalid token specified: missing part #${pos + 1}`);
  }
  let decoded;
  try {
    decoded = base64UrlDecode(part);
  } catch (e3) {
    throw new InvalidTokenError(`Invalid token specified: invalid base64 for part #${pos + 1} (${e3.message})`);
  }
  try {
    return JSON.parse(decoded);
  } catch (e3) {
    throw new InvalidTokenError(`Invalid token specified: invalid json for part #${pos + 1} (${e3.message})`);
  }
}

// node_modules/oidc-client-ts/dist/esm/oidc-client-ts.js
var nopLogger = {
  debug: () => void 0,
  info: () => void 0,
  warn: () => void 0,
  error: () => void 0
};
var level;
var logger;
var Log = /* @__PURE__ */ ((Log2) => {
  Log2[Log2["NONE"] = 0] = "NONE";
  Log2[Log2["ERROR"] = 1] = "ERROR";
  Log2[Log2["WARN"] = 2] = "WARN";
  Log2[Log2["INFO"] = 3] = "INFO";
  Log2[Log2["DEBUG"] = 4] = "DEBUG";
  return Log2;
})(Log || {});
((Log2) => {
  function reset() {
    level = 3;
    logger = nopLogger;
  }
  Log2.reset = reset;
  function setLevel(value) {
    if (!(0 <= value && value <= 4)) {
      throw new Error("Invalid log level");
    }
    level = value;
  }
  Log2.setLevel = setLevel;
  function setLogger(value) {
    logger = value;
  }
  Log2.setLogger = setLogger;
})(Log || (Log = {}));
var Logger = class _Logger {
  constructor(_name) {
    this._name = _name;
  }
  /* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
  debug(...args) {
    if (level >= 4) {
      logger.debug(_Logger._format(this._name, this._method), ...args);
    }
  }
  info(...args) {
    if (level >= 3) {
      logger.info(_Logger._format(this._name, this._method), ...args);
    }
  }
  warn(...args) {
    if (level >= 2) {
      logger.warn(_Logger._format(this._name, this._method), ...args);
    }
  }
  error(...args) {
    if (level >= 1) {
      logger.error(_Logger._format(this._name, this._method), ...args);
    }
  }
  /* eslint-enable @typescript-eslint/no-unsafe-enum-comparison */
  throw(err) {
    this.error(err);
    throw err;
  }
  create(method) {
    const methodLogger = Object.create(this);
    methodLogger._method = method;
    methodLogger.debug("begin");
    return methodLogger;
  }
  static createStatic(name, staticMethod) {
    const staticLogger = new _Logger(`${name}.${staticMethod}`);
    staticLogger.debug("begin");
    return staticLogger;
  }
  static _format(name, method) {
    const prefix = `[${name}]`;
    return method ? `${prefix} ${method}:` : prefix;
  }
  /* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
  // helpers for static class methods
  static debug(name, ...args) {
    if (level >= 4) {
      logger.debug(_Logger._format(name), ...args);
    }
  }
  static info(name, ...args) {
    if (level >= 3) {
      logger.info(_Logger._format(name), ...args);
    }
  }
  static warn(name, ...args) {
    if (level >= 2) {
      logger.warn(_Logger._format(name), ...args);
    }
  }
  static error(name, ...args) {
    if (level >= 1) {
      logger.error(_Logger._format(name), ...args);
    }
  }
  /* eslint-enable @typescript-eslint/no-unsafe-enum-comparison */
};
Log.reset();
var JwtUtils = class {
  // IMPORTANT: doesn't validate the token
  static decode(token) {
    try {
      return jwtDecode(token);
    } catch (err) {
      Logger.error("JwtUtils.decode", err);
      throw err;
    }
  }
  static async generateSignedJwt(header, payload, privateKey) {
    const encodedHeader = CryptoUtils.encodeBase64Url(new TextEncoder().encode(JSON.stringify(header)));
    const encodedPayload = CryptoUtils.encodeBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
    const encodedToken = `${encodedHeader}.${encodedPayload}`;
    const signature = await window.crypto.subtle.sign(
      {
        name: "ECDSA",
        hash: { name: "SHA-256" }
      },
      privateKey,
      new TextEncoder().encode(encodedToken)
    );
    const encodedSignature = CryptoUtils.encodeBase64Url(new Uint8Array(signature));
    return `${encodedToken}.${encodedSignature}`;
  }
  static async generateSignedJwtWithHmac(header, payload, secretKey) {
    const encodedHeader = CryptoUtils.encodeBase64Url(new TextEncoder().encode(JSON.stringify(header)));
    const encodedPayload = CryptoUtils.encodeBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
    const encodedToken = `${encodedHeader}.${encodedPayload}`;
    const signature = await window.crypto.subtle.sign(
      "HMAC",
      secretKey,
      new TextEncoder().encode(encodedToken)
    );
    const encodedSignature = CryptoUtils.encodeBase64Url(new Uint8Array(signature));
    return `${encodedToken}.${encodedSignature}`;
  }
};
var UUID_V4_TEMPLATE = "10000000-1000-4000-8000-100000000000";
var toBase64 = (val) => btoa([...new Uint8Array(val)].map((chr) => String.fromCharCode(chr)).join(""));
var _CryptoUtils = class _CryptoUtils2 {
  static _randomWord() {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0];
  }
  /**
   * Generates RFC4122 version 4 guid
   */
  static generateUUIDv4() {
    const uuid = UUID_V4_TEMPLATE.replace(
      /[018]/g,
      (c3) => (+c3 ^ _CryptoUtils2._randomWord() & 15 >> +c3 / 4).toString(16)
    );
    return uuid.replace(/-/g, "");
  }
  /**
   * PKCE: Generate a code verifier
   */
  static generateCodeVerifier() {
    return _CryptoUtils2.generateUUIDv4() + _CryptoUtils2.generateUUIDv4() + _CryptoUtils2.generateUUIDv4();
  }
  /**
   * PKCE: Generate a code challenge
   */
  static async generateCodeChallenge(code_verifier) {
    if (!crypto.subtle) {
      throw new Error("Crypto.subtle is available only in secure contexts (HTTPS).");
    }
    try {
      const encoder3 = new TextEncoder();
      const data = encoder3.encode(code_verifier);
      const hashed = await crypto.subtle.digest("SHA-256", data);
      return toBase64(hashed).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    } catch (err) {
      Logger.error("CryptoUtils.generateCodeChallenge", err);
      throw err;
    }
  }
  /**
   * Generates a base64-encoded string for a basic auth header
   */
  static generateBasicAuth(client_id, client_secret) {
    const encoder3 = new TextEncoder();
    const data = encoder3.encode([client_id, client_secret].join(":"));
    return toBase64(data);
  }
  /**
   * Generates a hash of a string using a given algorithm
   * @param alg
   * @param message
   */
  static async hash(alg, message) {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest(alg, msgUint8);
    return new Uint8Array(hashBuffer);
  }
  /**
   * Generates a rfc7638 compliant jwk thumbprint
   * @param jwk
   */
  static async customCalculateJwkThumbprint(jwk) {
    let jsonObject;
    switch (jwk.kty) {
      case "RSA":
        jsonObject = {
          "e": jwk.e,
          "kty": jwk.kty,
          "n": jwk.n
        };
        break;
      case "EC":
        jsonObject = {
          "crv": jwk.crv,
          "kty": jwk.kty,
          "x": jwk.x,
          "y": jwk.y
        };
        break;
      case "OKP":
        jsonObject = {
          "crv": jwk.crv,
          "kty": jwk.kty,
          "x": jwk.x
        };
        break;
      case "oct":
        jsonObject = {
          "crv": jwk.k,
          "kty": jwk.kty
        };
        break;
      default:
        throw new Error("Unknown jwk type");
    }
    const utf8encodedAndHashed = await _CryptoUtils2.hash("SHA-256", JSON.stringify(jsonObject));
    return _CryptoUtils2.encodeBase64Url(utf8encodedAndHashed);
  }
  static async generateDPoPProof({
    url,
    accessToken,
    httpMethod,
    keyPair,
    nonce
  }) {
    let hashedToken;
    let encodedHash;
    const payload = {
      "jti": window.crypto.randomUUID(),
      "htm": httpMethod != null ? httpMethod : "GET",
      "htu": url,
      "iat": Math.floor(Date.now() / 1e3)
    };
    if (accessToken) {
      hashedToken = await _CryptoUtils2.hash("SHA-256", accessToken);
      encodedHash = _CryptoUtils2.encodeBase64Url(hashedToken);
      payload.ath = encodedHash;
    }
    if (nonce) {
      payload.nonce = nonce;
    }
    try {
      const publicJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
      const header = {
        "alg": "ES256",
        "typ": "dpop+jwt",
        "jwk": {
          "crv": publicJwk.crv,
          "kty": publicJwk.kty,
          "x": publicJwk.x,
          "y": publicJwk.y
        }
      };
      return await JwtUtils.generateSignedJwt(header, payload, keyPair.privateKey);
    } catch (err) {
      if (err instanceof TypeError) {
        throw new Error(`Error exporting dpop public key: ${err.message}`);
      } else {
        throw err;
      }
    }
  }
  static async generateDPoPJkt(keyPair) {
    try {
      const publicJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
      return await _CryptoUtils2.customCalculateJwkThumbprint(publicJwk);
    } catch (err) {
      if (err instanceof TypeError) {
        throw new Error(`Could not retrieve dpop keys from storage: ${err.message}`);
      } else {
        throw err;
      }
    }
  }
  static async generateDPoPKeys() {
    return await window.crypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-256"
      },
      false,
      ["sign", "verify"]
    );
  }
  /**
   * Generates a client assertion JWT for client_secret_jwt authentication
   * @param client_id The client identifier
   * @param client_secret The client secret
   * @param audience The token endpoint URL (audience)
   * @param algorithm The HMAC algorithm to use (HS256, HS384, HS512). Defaults to HS256
   */
  static async generateClientAssertionJwt(client_id, client_secret, audience, algorithm = "HS256") {
    const now = Math.floor(Date.now() / 1e3);
    const header = {
      "alg": algorithm,
      "typ": "JWT"
    };
    const payload = {
      "iss": client_id,
      "sub": client_id,
      "aud": audience,
      "jti": _CryptoUtils2.generateUUIDv4(),
      "exp": now + 300,
      // 5 minutes
      "iat": now
    };
    const hashMap = {
      "HS256": "SHA-256",
      "HS384": "SHA-384",
      "HS512": "SHA-512"
    };
    const hashFunction = hashMap[algorithm];
    if (!hashFunction) {
      throw new Error(`Unsupported algorithm: ${algorithm}. Supported algorithms are: HS256, HS384, HS512`);
    }
    const encoder3 = new TextEncoder();
    const secretKey = await crypto.subtle.importKey(
      "raw",
      encoder3.encode(client_secret),
      { name: "HMAC", hash: hashFunction },
      false,
      ["sign"]
    );
    return await JwtUtils.generateSignedJwtWithHmac(header, payload, secretKey);
  }
};
_CryptoUtils.encodeBase64Url = (input) => {
  return toBase64(input).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
};
var CryptoUtils = _CryptoUtils;
var Event = class {
  constructor(_name) {
    this._name = _name;
    this._callbacks = [];
    this._logger = new Logger(`Event('${this._name}')`);
  }
  addHandler(cb) {
    this._callbacks.push(cb);
    return () => this.removeHandler(cb);
  }
  removeHandler(cb) {
    const idx = this._callbacks.lastIndexOf(cb);
    if (idx >= 0) {
      this._callbacks.splice(idx, 1);
    }
  }
  async raise(...ev) {
    this._logger.debug("raise:", ...ev);
    for (const cb of this._callbacks) {
      await cb(...ev);
    }
  }
};
var PopupUtils = class {
  /**
   * Populates a map of window features with a placement centered in front of
   * the current window. If no explicit width is given, a default value is
   * binned into [800, 720, 600, 480, 360] based on the current window's width.
   */
  static center({ ...features }) {
    var _a6, _b, _c2;
    if (features.width == null)
      features.width = (_a6 = [800, 720, 600, 480].find((width) => width <= window.outerWidth / 1.618)) != null ? _a6 : 360;
    (_b = features.left) != null ? _b : features.left = Math.max(0, Math.round(window.screenX + (window.outerWidth - features.width) / 2));
    if (features.height != null)
      (_c2 = features.top) != null ? _c2 : features.top = Math.max(0, Math.round(window.screenY + (window.outerHeight - features.height) / 2));
    return features;
  }
  static serialize(features) {
    return Object.entries(features).filter(([, value]) => value != null).map(([key, value]) => `${key}=${typeof value !== "boolean" ? value : value ? "yes" : "no"}`).join(",");
  }
};
var Timer = class _Timer extends Event {
  constructor() {
    super(...arguments);
    this._logger = new Logger(`Timer('${this._name}')`);
    this._timerHandle = null;
    this._expiration = 0;
    this._callback = () => {
      const diff = this._expiration - _Timer.getEpochTime();
      this._logger.debug("timer completes in", diff);
      if (this._expiration <= _Timer.getEpochTime()) {
        this.cancel();
        void super.raise();
      }
    };
  }
  // get the time
  static getEpochTime() {
    return Math.floor(Date.now() / 1e3);
  }
  init(durationInSeconds) {
    const logger2 = this._logger.create("init");
    durationInSeconds = Math.max(Math.floor(durationInSeconds), 1);
    const expiration = _Timer.getEpochTime() + durationInSeconds;
    if (this.expiration === expiration && this._timerHandle) {
      logger2.debug("skipping since already initialized for expiration at", this.expiration);
      return;
    }
    this.cancel();
    logger2.debug("using duration", durationInSeconds);
    this._expiration = expiration;
    const timerDurationInSeconds = Math.min(durationInSeconds, 5);
    this._timerHandle = setInterval(this._callback, timerDurationInSeconds * 1e3);
  }
  get expiration() {
    return this._expiration;
  }
  cancel() {
    this._logger.create("cancel");
    if (this._timerHandle) {
      clearInterval(this._timerHandle);
      this._timerHandle = null;
    }
  }
};
var UrlUtils = class {
  static readParams(url, responseMode = "query") {
    if (!url) throw new TypeError("Invalid URL");
    const parsedUrl = new URL(url, "http://127.0.0.1");
    const params = parsedUrl[responseMode === "fragment" ? "hash" : "search"];
    return new URLSearchParams(params.slice(1));
  }
};
var URL_STATE_DELIMITER = ";";
var ErrorResponse = class extends Error {
  constructor(args, form) {
    var _a6, _b, _c2;
    super(args.error_description || args.error || "");
    this.form = form;
    this.name = "ErrorResponse";
    if (!args.error) {
      Logger.error("ErrorResponse", "No error passed");
      throw new Error("No error passed");
    }
    this.error = args.error;
    this.error_description = (_a6 = args.error_description) != null ? _a6 : null;
    this.error_uri = (_b = args.error_uri) != null ? _b : null;
    this.state = args.userState;
    this.session_state = (_c2 = args.session_state) != null ? _c2 : null;
    this.url_state = args.url_state;
  }
};
var ErrorTimeout = class extends Error {
  constructor(message) {
    super(message);
    this.name = "ErrorTimeout";
  }
};
var AccessTokenEvents = class {
  constructor(args) {
    this._logger = new Logger("AccessTokenEvents");
    this._expiringTimer = new Timer("Access token expiring");
    this._expiredTimer = new Timer("Access token expired");
    this._expiringNotificationTimeInSeconds = args.expiringNotificationTimeInSeconds;
  }
  async load(container) {
    const logger2 = this._logger.create("load");
    if (container.access_token && container.expires_in !== void 0) {
      const duration = container.expires_in;
      logger2.debug("access token present, remaining duration:", duration);
      if (duration > 0) {
        let expiring = duration - this._expiringNotificationTimeInSeconds;
        if (expiring <= 0) {
          expiring = 1;
        }
        logger2.debug("registering expiring timer, raising in", expiring, "seconds");
        this._expiringTimer.init(expiring);
      } else {
        logger2.debug("canceling existing expiring timer because we're past expiration.");
        this._expiringTimer.cancel();
      }
      const expired = duration + 1;
      logger2.debug("registering expired timer, raising in", expired, "seconds");
      this._expiredTimer.init(expired);
    } else {
      this._expiringTimer.cancel();
      this._expiredTimer.cancel();
    }
  }
  async unload() {
    this._logger.debug("unload: canceling existing access token timers");
    this._expiringTimer.cancel();
    this._expiredTimer.cancel();
  }
  /**
   * Add callback: Raised prior to the access token expiring.
   */
  addAccessTokenExpiring(cb) {
    return this._expiringTimer.addHandler(cb);
  }
  /**
   * Remove callback: Raised prior to the access token expiring.
   */
  removeAccessTokenExpiring(cb) {
    this._expiringTimer.removeHandler(cb);
  }
  /**
   * Add callback: Raised after the access token has expired.
   */
  addAccessTokenExpired(cb) {
    return this._expiredTimer.addHandler(cb);
  }
  /**
   * Remove callback: Raised after the access token has expired.
   */
  removeAccessTokenExpired(cb) {
    this._expiredTimer.removeHandler(cb);
  }
};
var CheckSessionIFrame = class {
  constructor(_callback, _client_id, url, _intervalInSeconds, _stopOnError) {
    this._callback = _callback;
    this._client_id = _client_id;
    this._intervalInSeconds = _intervalInSeconds;
    this._stopOnError = _stopOnError;
    this._logger = new Logger("CheckSessionIFrame");
    this._timer = null;
    this._session_state = null;
    this._message = (e3) => {
      if (e3.origin === this._frame_origin && e3.source === this._frame.contentWindow) {
        if (e3.data === "error") {
          this._logger.error("error message from check session op iframe");
          if (this._stopOnError) {
            this.stop();
          }
        } else if (e3.data === "changed") {
          this._logger.debug("changed message from check session op iframe");
          this.stop();
          void this._callback();
        } else {
          this._logger.debug(e3.data + " message from check session op iframe");
        }
      }
    };
    const parsedUrl = new URL(url);
    this._frame_origin = parsedUrl.origin;
    this._frame = window.document.createElement("iframe");
    this._frame.style.visibility = "hidden";
    this._frame.style.position = "fixed";
    this._frame.style.left = "-1000px";
    this._frame.style.top = "0";
    this._frame.width = "0";
    this._frame.height = "0";
    this._frame.src = parsedUrl.href;
  }
  load() {
    return new Promise((resolve) => {
      this._frame.onload = () => {
        resolve();
      };
      window.document.body.appendChild(this._frame);
      window.addEventListener("message", this._message, false);
    });
  }
  start(session_state) {
    if (this._session_state === session_state) {
      return;
    }
    this._logger.create("start");
    this.stop();
    this._session_state = session_state;
    const send = () => {
      if (!this._frame.contentWindow || !this._session_state) {
        return;
      }
      this._frame.contentWindow.postMessage(this._client_id + " " + this._session_state, this._frame_origin);
    };
    send();
    this._timer = setInterval(send, this._intervalInSeconds * 1e3);
  }
  stop() {
    this._logger.create("stop");
    this._session_state = null;
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }
};
var InMemoryWebStorage = class {
  constructor() {
    this._logger = new Logger("InMemoryWebStorage");
    this._data = {};
  }
  clear() {
    this._logger.create("clear");
    this._data = {};
  }
  getItem(key) {
    this._logger.create(`getItem('${key}')`);
    return this._data[key];
  }
  setItem(key, value) {
    this._logger.create(`setItem('${key}')`);
    this._data[key] = value;
  }
  removeItem(key) {
    this._logger.create(`removeItem('${key}')`);
    delete this._data[key];
  }
  get length() {
    return Object.getOwnPropertyNames(this._data).length;
  }
  key(index2) {
    return Object.getOwnPropertyNames(this._data)[index2];
  }
};
var ErrorDPoPNonce = class extends Error {
  constructor(nonce, message) {
    super(message);
    this.name = "ErrorDPoPNonce";
    this.nonce = nonce;
  }
};
var JsonService = class {
  constructor(additionalContentTypes = [], _jwtHandler = null, _extraHeaders = {}) {
    this._jwtHandler = _jwtHandler;
    this._extraHeaders = _extraHeaders;
    this._logger = new Logger("JsonService");
    this._contentTypes = [];
    this._contentTypes.push(...additionalContentTypes, "application/json");
    if (_jwtHandler) {
      this._contentTypes.push("application/jwt");
    }
  }
  async fetchWithTimeout(input, init = {}) {
    const { timeoutInSeconds, ...initFetch } = init;
    if (!timeoutInSeconds) {
      return await fetch(input, initFetch);
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutInSeconds * 1e3);
    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal
      });
      return response;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new ErrorTimeout("Network timed out");
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
  async getJson(url, {
    token,
    credentials,
    timeoutInSeconds
  } = {}) {
    const logger2 = this._logger.create("getJson");
    const headers = {
      "Accept": this._contentTypes.join(", ")
    };
    if (token) {
      logger2.debug("token passed, setting Authorization header");
      headers["Authorization"] = "Bearer " + token;
    }
    this._appendExtraHeaders(headers);
    let response;
    try {
      logger2.debug("url:", url);
      response = await this.fetchWithTimeout(url, { method: "GET", headers, timeoutInSeconds, credentials });
    } catch (err) {
      logger2.error("Network Error");
      throw err;
    }
    logger2.debug("HTTP response received, status", response.status);
    const contentType = response.headers.get("Content-Type");
    if (contentType && !this._contentTypes.find((item) => contentType.startsWith(item))) {
      logger2.throw(new Error(`Invalid response Content-Type: ${contentType != null ? contentType : "undefined"}, from URL: ${url}`));
    }
    if (response.ok && this._jwtHandler && (contentType == null ? void 0 : contentType.startsWith("application/jwt"))) {
      return await this._jwtHandler(await response.text());
    }
    let json;
    try {
      json = await response.json();
    } catch (err) {
      logger2.error("Error parsing JSON response", err);
      if (response.ok) throw err;
      throw new Error(`${response.statusText} (${response.status})`);
    }
    if (!response.ok) {
      logger2.error("Error from server:", json);
      if (json.error) {
        throw new ErrorResponse(json);
      }
      throw new Error(`${response.statusText} (${response.status}): ${JSON.stringify(json)}`);
    }
    return json;
  }
  async postForm(url, {
    body,
    basicAuth,
    timeoutInSeconds,
    initCredentials,
    extraHeaders
  }) {
    const logger2 = this._logger.create("postForm");
    const headers = {
      "Accept": this._contentTypes.join(", "),
      "Content-Type": "application/x-www-form-urlencoded",
      ...extraHeaders
    };
    if (basicAuth !== void 0) {
      headers["Authorization"] = "Basic " + basicAuth;
    }
    this._appendExtraHeaders(headers);
    let response;
    try {
      logger2.debug("url:", url);
      response = await this.fetchWithTimeout(url, { method: "POST", headers, body, timeoutInSeconds, credentials: initCredentials });
    } catch (err) {
      logger2.error("Network error");
      throw err;
    }
    logger2.debug("HTTP response received, status", response.status);
    const contentType = response.headers.get("Content-Type");
    if (contentType && !this._contentTypes.find((item) => contentType.startsWith(item))) {
      throw new Error(`Invalid response Content-Type: ${contentType != null ? contentType : "undefined"}, from URL: ${url}`);
    }
    const responseText = await response.text();
    let json = {};
    if (responseText) {
      try {
        json = JSON.parse(responseText);
      } catch (err) {
        logger2.error("Error parsing JSON response", err);
        if (response.ok) throw err;
        throw new Error(`${response.statusText} (${response.status})`);
      }
    }
    if (!response.ok) {
      logger2.error("Error from server:", json);
      if (response.headers.has("dpop-nonce")) {
        const nonce = response.headers.get("dpop-nonce");
        throw new ErrorDPoPNonce(nonce, `${JSON.stringify(json)}`);
      }
      if (json.error) {
        throw new ErrorResponse(json, body);
      }
      throw new Error(`${response.statusText} (${response.status}): ${JSON.stringify(json)}`);
    }
    return json;
  }
  _appendExtraHeaders(headers) {
    const logger2 = this._logger.create("appendExtraHeaders");
    const customKeys = Object.keys(this._extraHeaders);
    const protectedHeaders = [
      "accept",
      "content-type"
    ];
    const preventOverride = [
      "authorization"
    ];
    if (customKeys.length === 0) {
      return;
    }
    customKeys.forEach((headerName) => {
      if (protectedHeaders.includes(headerName.toLocaleLowerCase())) {
        logger2.warn("Protected header could not be set", headerName, protectedHeaders);
        return;
      }
      if (preventOverride.includes(headerName.toLocaleLowerCase()) && Object.keys(headers).includes(headerName)) {
        logger2.warn("Header could not be overridden", headerName, preventOverride);
        return;
      }
      const content = typeof this._extraHeaders[headerName] === "function" ? this._extraHeaders[headerName]() : this._extraHeaders[headerName];
      if (content && content !== "") {
        headers[headerName] = content;
      }
    });
  }
};
var MetadataService = class {
  constructor(_settings) {
    this._settings = _settings;
    this._logger = new Logger("MetadataService");
    this._signingKeys = null;
    this._metadata = null;
    this._metadataUrl = this._settings.metadataUrl;
    this._jsonService = new JsonService(
      ["application/jwk-set+json"],
      null,
      this._settings.extraHeaders
    );
    if (this._settings.signingKeys) {
      this._logger.debug("using signingKeys from settings");
      this._signingKeys = this._settings.signingKeys;
    }
    if (this._settings.metadata) {
      this._logger.debug("using metadata from settings");
      this._metadata = this._settings.metadata;
    }
    if (this._settings.fetchRequestCredentials) {
      this._logger.debug("using fetchRequestCredentials from settings");
      this._fetchRequestCredentials = this._settings.fetchRequestCredentials;
    }
  }
  resetSigningKeys() {
    this._signingKeys = null;
  }
  async getMetadata() {
    const logger2 = this._logger.create("getMetadata");
    if (this._metadata) {
      logger2.debug("using cached values");
      return this._metadata;
    }
    if (!this._metadataUrl) {
      logger2.throw(new Error("No authority or metadataUrl configured on settings"));
      throw null;
    }
    logger2.debug("getting metadata from", this._metadataUrl);
    const metadata = await this._jsonService.getJson(this._metadataUrl, { credentials: this._fetchRequestCredentials, timeoutInSeconds: this._settings.requestTimeoutInSeconds });
    logger2.debug("merging remote JSON with seed metadata");
    this._metadata = Object.assign({}, metadata, this._settings.metadataSeed);
    return this._metadata;
  }
  getIssuer() {
    return this._getMetadataProperty("issuer");
  }
  getAuthorizationEndpoint() {
    return this._getMetadataProperty("authorization_endpoint");
  }
  getUserInfoEndpoint() {
    return this._getMetadataProperty("userinfo_endpoint");
  }
  getTokenEndpoint(optional = true) {
    return this._getMetadataProperty("token_endpoint", optional);
  }
  getCheckSessionIframe() {
    return this._getMetadataProperty("check_session_iframe", true);
  }
  getEndSessionEndpoint() {
    return this._getMetadataProperty("end_session_endpoint", true);
  }
  getRevocationEndpoint(optional = true) {
    return this._getMetadataProperty("revocation_endpoint", optional);
  }
  getKeysEndpoint(optional = true) {
    return this._getMetadataProperty("jwks_uri", optional);
  }
  async _getMetadataProperty(name, optional = false) {
    const logger2 = this._logger.create(`_getMetadataProperty('${name}')`);
    const metadata = await this.getMetadata();
    logger2.debug("resolved");
    if (metadata[name] === void 0) {
      if (optional === true) {
        logger2.warn("Metadata does not contain optional property");
        return void 0;
      }
      logger2.throw(new Error("Metadata does not contain property " + name));
    }
    return metadata[name];
  }
  async getSigningKeys() {
    const logger2 = this._logger.create("getSigningKeys");
    if (this._signingKeys) {
      logger2.debug("returning signingKeys from cache");
      return this._signingKeys;
    }
    const jwks_uri = await this.getKeysEndpoint(false);
    logger2.debug("got jwks_uri", jwks_uri);
    const keySet = await this._jsonService.getJson(jwks_uri, { timeoutInSeconds: this._settings.requestTimeoutInSeconds });
    logger2.debug("got key set", keySet);
    if (!Array.isArray(keySet.keys)) {
      logger2.throw(new Error("Missing keys on keyset"));
      throw null;
    }
    this._signingKeys = keySet.keys;
    return this._signingKeys;
  }
};
var WebStorageStateStore = class {
  constructor({
    prefix = "oidc.",
    store = localStorage
  } = {}) {
    this._logger = new Logger("WebStorageStateStore");
    this._store = store;
    this._prefix = prefix;
  }
  async set(key, value) {
    this._logger.create(`set('${key}')`);
    key = this._prefix + key;
    await this._store.setItem(key, value);
  }
  async get(key) {
    this._logger.create(`get('${key}')`);
    key = this._prefix + key;
    const item = await this._store.getItem(key);
    return item;
  }
  async remove(key) {
    this._logger.create(`remove('${key}')`);
    key = this._prefix + key;
    const item = await this._store.getItem(key);
    await this._store.removeItem(key);
    return item;
  }
  async getAllKeys() {
    this._logger.create("getAllKeys");
    const len = await this._store.length;
    const keys = [];
    for (let index2 = 0; index2 < len; index2++) {
      const key = await this._store.key(index2);
      if (key && key.indexOf(this._prefix) === 0) {
        keys.push(key.substr(this._prefix.length));
      }
    }
    return keys;
  }
};
var DefaultResponseType = "code";
var DefaultScope = "openid";
var DefaultClientAuthentication = "client_secret_post";
var DefaultStaleStateAgeInSeconds = 60 * 15;
var OidcClientSettingsStore = class {
  constructor({
    // metadata related
    authority,
    metadataUrl,
    metadata,
    signingKeys,
    metadataSeed,
    // client related
    client_id,
    client_secret,
    response_type = DefaultResponseType,
    scope = DefaultScope,
    redirect_uri,
    post_logout_redirect_uri,
    client_authentication = DefaultClientAuthentication,
    token_endpoint_auth_signing_alg = "HS256",
    // optional protocol
    prompt,
    display,
    max_age,
    ui_locales,
    acr_values,
    resource,
    response_mode,
    // behavior flags
    filterProtocolClaims = true,
    loadUserInfo = false,
    requestTimeoutInSeconds,
    staleStateAgeInSeconds = DefaultStaleStateAgeInSeconds,
    mergeClaimsStrategy = { array: "replace" },
    disablePKCE = false,
    // other behavior
    stateStore,
    revokeTokenAdditionalContentTypes,
    fetchRequestCredentials,
    refreshTokenAllowedScope,
    // extra
    extraQueryParams = {},
    extraTokenParams = {},
    extraHeaders = {},
    dpop,
    omitScopeWhenRequesting = false
  }) {
    var _a6;
    this.authority = authority;
    if (metadataUrl) {
      this.metadataUrl = metadataUrl;
    } else {
      this.metadataUrl = authority;
      if (authority) {
        if (!this.metadataUrl.endsWith("/")) {
          this.metadataUrl += "/";
        }
        this.metadataUrl += ".well-known/openid-configuration";
      }
    }
    this.metadata = metadata;
    this.metadataSeed = metadataSeed;
    this.signingKeys = signingKeys;
    this.client_id = client_id;
    this.client_secret = client_secret;
    this.response_type = response_type;
    this.scope = scope;
    this.redirect_uri = redirect_uri;
    this.post_logout_redirect_uri = post_logout_redirect_uri;
    this.client_authentication = client_authentication;
    this.token_endpoint_auth_signing_alg = token_endpoint_auth_signing_alg;
    this.prompt = prompt;
    this.display = display;
    this.max_age = max_age;
    this.ui_locales = ui_locales;
    this.acr_values = acr_values;
    this.resource = resource;
    this.response_mode = response_mode;
    this.filterProtocolClaims = filterProtocolClaims != null ? filterProtocolClaims : true;
    this.loadUserInfo = !!loadUserInfo;
    this.staleStateAgeInSeconds = staleStateAgeInSeconds;
    this.mergeClaimsStrategy = mergeClaimsStrategy;
    this.omitScopeWhenRequesting = omitScopeWhenRequesting;
    this.disablePKCE = !!disablePKCE;
    this.revokeTokenAdditionalContentTypes = revokeTokenAdditionalContentTypes;
    this.fetchRequestCredentials = fetchRequestCredentials ? fetchRequestCredentials : "same-origin";
    this.requestTimeoutInSeconds = requestTimeoutInSeconds;
    if (stateStore) {
      this.stateStore = stateStore;
    } else {
      const store = typeof window !== "undefined" ? window.localStorage : new InMemoryWebStorage();
      this.stateStore = new WebStorageStateStore({ store });
    }
    this.refreshTokenAllowedScope = refreshTokenAllowedScope;
    this.extraQueryParams = extraQueryParams;
    this.extraTokenParams = extraTokenParams;
    this.extraHeaders = extraHeaders;
    this.dpop = dpop;
    if (this.dpop && !((_a6 = this.dpop) == null ? void 0 : _a6.store)) {
      throw new Error("A DPoPStore is required when dpop is enabled");
    }
  }
};
var UserInfoService = class {
  constructor(_settings, _metadataService) {
    this._settings = _settings;
    this._metadataService = _metadataService;
    this._logger = new Logger("UserInfoService");
    this._getClaimsFromJwt = async (responseText) => {
      const logger2 = this._logger.create("_getClaimsFromJwt");
      try {
        const payload = JwtUtils.decode(responseText);
        logger2.debug("JWT decoding successful");
        return payload;
      } catch (err) {
        logger2.error("Error parsing JWT response");
        throw err;
      }
    };
    this._jsonService = new JsonService(
      void 0,
      this._getClaimsFromJwt,
      this._settings.extraHeaders
    );
  }
  async getClaims(token) {
    const logger2 = this._logger.create("getClaims");
    if (!token) {
      this._logger.throw(new Error("No token passed"));
    }
    const url = await this._metadataService.getUserInfoEndpoint();
    logger2.debug("got userinfo url", url);
    const claims = await this._jsonService.getJson(url, {
      token,
      credentials: this._settings.fetchRequestCredentials,
      timeoutInSeconds: this._settings.requestTimeoutInSeconds
    });
    logger2.debug("got claims", claims);
    return claims;
  }
};
var TokenClient = class {
  constructor(_settings, _metadataService) {
    this._settings = _settings;
    this._metadataService = _metadataService;
    this._logger = new Logger("TokenClient");
    this._jsonService = new JsonService(
      this._settings.revokeTokenAdditionalContentTypes,
      null,
      this._settings.extraHeaders
    );
  }
  /**
   * Exchange code.
   *
   * @see https://www.rfc-editor.org/rfc/rfc6749#section-4.1.3
   */
  async exchangeCode({
    grant_type = "authorization_code",
    redirect_uri = this._settings.redirect_uri,
    client_id = this._settings.client_id,
    client_secret = this._settings.client_secret,
    extraHeaders,
    ...args
  }) {
    const logger2 = this._logger.create("exchangeCode");
    if (!client_id) {
      logger2.throw(new Error("A client_id is required"));
    }
    if (!redirect_uri) {
      logger2.throw(new Error("A redirect_uri is required"));
    }
    if (!args.code) {
      logger2.throw(new Error("A code is required"));
    }
    const params = new URLSearchParams({ grant_type, redirect_uri });
    for (const [key, value] of Object.entries(args)) {
      if (value != null) {
        params.set(key, value);
      }
    }
    if ((this._settings.client_authentication === "client_secret_basic" || this._settings.client_authentication === "client_secret_jwt") && (client_secret === void 0 || client_secret === null)) {
      logger2.throw(new Error("A client_secret is required"));
      throw null;
    }
    let basicAuth;
    const url = await this._metadataService.getTokenEndpoint(false);
    switch (this._settings.client_authentication) {
      case "client_secret_basic":
        basicAuth = CryptoUtils.generateBasicAuth(client_id, client_secret);
        break;
      case "client_secret_post":
        params.append("client_id", client_id);
        if (client_secret) {
          params.append("client_secret", client_secret);
        }
        break;
      case "client_secret_jwt": {
        const clientAssertion = await CryptoUtils.generateClientAssertionJwt(client_id, client_secret, url, this._settings.token_endpoint_auth_signing_alg);
        params.append("client_id", client_id);
        params.append("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer");
        params.append("client_assertion", clientAssertion);
        break;
      }
    }
    logger2.debug("got token endpoint");
    const response = await this._jsonService.postForm(url, {
      body: params,
      basicAuth,
      timeoutInSeconds: this._settings.requestTimeoutInSeconds,
      initCredentials: this._settings.fetchRequestCredentials,
      extraHeaders
    });
    logger2.debug("got response");
    return response;
  }
  /**
   * Exchange credentials.
   *
   * @see https://www.rfc-editor.org/rfc/rfc6749#section-4.3.2
   */
  async exchangeCredentials({
    grant_type = "password",
    client_id = this._settings.client_id,
    client_secret = this._settings.client_secret,
    scope = this._settings.scope,
    ...args
  }) {
    const logger2 = this._logger.create("exchangeCredentials");
    if (!client_id) {
      logger2.throw(new Error("A client_id is required"));
    }
    const params = new URLSearchParams({ grant_type });
    if (!this._settings.omitScopeWhenRequesting) {
      params.set("scope", scope);
    }
    for (const [key, value] of Object.entries(args)) {
      if (value != null) {
        params.set(key, value);
      }
    }
    if ((this._settings.client_authentication === "client_secret_basic" || this._settings.client_authentication === "client_secret_jwt") && (client_secret === void 0 || client_secret === null)) {
      logger2.throw(new Error("A client_secret is required"));
      throw null;
    }
    let basicAuth;
    const url = await this._metadataService.getTokenEndpoint(false);
    switch (this._settings.client_authentication) {
      case "client_secret_basic":
        basicAuth = CryptoUtils.generateBasicAuth(client_id, client_secret);
        break;
      case "client_secret_post":
        params.append("client_id", client_id);
        if (client_secret) {
          params.append("client_secret", client_secret);
        }
        break;
      case "client_secret_jwt": {
        const clientAssertion = await CryptoUtils.generateClientAssertionJwt(client_id, client_secret, url, this._settings.token_endpoint_auth_signing_alg);
        params.append("client_id", client_id);
        params.append("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer");
        params.append("client_assertion", clientAssertion);
        break;
      }
    }
    logger2.debug("got token endpoint");
    const response = await this._jsonService.postForm(url, { body: params, basicAuth, timeoutInSeconds: this._settings.requestTimeoutInSeconds, initCredentials: this._settings.fetchRequestCredentials });
    logger2.debug("got response");
    return response;
  }
  /**
   * Exchange a refresh token.
   *
   * @see https://www.rfc-editor.org/rfc/rfc6749#section-6
   */
  async exchangeRefreshToken({
    grant_type = "refresh_token",
    client_id = this._settings.client_id,
    client_secret = this._settings.client_secret,
    timeoutInSeconds,
    extraHeaders,
    ...args
  }) {
    const logger2 = this._logger.create("exchangeRefreshToken");
    if (!client_id) {
      logger2.throw(new Error("A client_id is required"));
    }
    if (!args.refresh_token) {
      logger2.throw(new Error("A refresh_token is required"));
    }
    const params = new URLSearchParams({ grant_type });
    for (const [key, value] of Object.entries(args)) {
      if (Array.isArray(value)) {
        value.forEach((param) => params.append(key, param));
      } else if (value != null) {
        params.set(key, value);
      }
    }
    if ((this._settings.client_authentication === "client_secret_basic" || this._settings.client_authentication === "client_secret_jwt") && (client_secret === void 0 || client_secret === null)) {
      logger2.throw(new Error("A client_secret is required"));
      throw null;
    }
    let basicAuth;
    const url = await this._metadataService.getTokenEndpoint(false);
    switch (this._settings.client_authentication) {
      case "client_secret_basic":
        basicAuth = CryptoUtils.generateBasicAuth(client_id, client_secret);
        break;
      case "client_secret_post":
        params.append("client_id", client_id);
        if (client_secret) {
          params.append("client_secret", client_secret);
        }
        break;
      case "client_secret_jwt": {
        const clientAssertion = await CryptoUtils.generateClientAssertionJwt(client_id, client_secret, url, this._settings.token_endpoint_auth_signing_alg);
        params.append("client_id", client_id);
        params.append("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer");
        params.append("client_assertion", clientAssertion);
        break;
      }
    }
    logger2.debug("got token endpoint");
    const response = await this._jsonService.postForm(url, { body: params, basicAuth, timeoutInSeconds, initCredentials: this._settings.fetchRequestCredentials, extraHeaders });
    logger2.debug("got response");
    return response;
  }
  /**
   * Revoke an access or refresh token.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc7009#section-2.1
   */
  async revoke(args) {
    var _a6;
    const logger2 = this._logger.create("revoke");
    if (!args.token) {
      logger2.throw(new Error("A token is required"));
    }
    const url = await this._metadataService.getRevocationEndpoint(false);
    logger2.debug(`got revocation endpoint, revoking ${(_a6 = args.token_type_hint) != null ? _a6 : "default token type"}`);
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(args)) {
      if (value != null) {
        params.set(key, value);
      }
    }
    params.set("client_id", this._settings.client_id);
    if (this._settings.client_secret) {
      params.set("client_secret", this._settings.client_secret);
    }
    await this._jsonService.postForm(url, { body: params, timeoutInSeconds: this._settings.requestTimeoutInSeconds });
    logger2.debug("got response");
  }
};
var ResponseValidator = class {
  constructor(_settings, _metadataService, _claimsService) {
    this._settings = _settings;
    this._metadataService = _metadataService;
    this._claimsService = _claimsService;
    this._logger = new Logger("ResponseValidator");
    this._userInfoService = new UserInfoService(this._settings, this._metadataService);
    this._tokenClient = new TokenClient(this._settings, this._metadataService);
  }
  async validateSigninResponse(response, state, extraHeaders) {
    const logger2 = this._logger.create("validateSigninResponse");
    this._processSigninState(response, state);
    logger2.debug("state processed");
    await this._processCode(response, state, extraHeaders);
    logger2.debug("code processed");
    if (response.isOpenId) {
      this._validateIdTokenAttributes(response);
    }
    logger2.debug("tokens validated");
    await this._processClaims(response, state == null ? void 0 : state.skipUserInfo, response.isOpenId);
    logger2.debug("claims processed");
  }
  async validateCredentialsResponse(response, skipUserInfo) {
    const logger2 = this._logger.create("validateCredentialsResponse");
    const shouldValidateSubClaim = response.isOpenId && !!response.id_token;
    if (shouldValidateSubClaim) {
      this._validateIdTokenAttributes(response);
    }
    logger2.debug("tokens validated");
    await this._processClaims(response, skipUserInfo, shouldValidateSubClaim);
    logger2.debug("claims processed");
  }
  async validateRefreshResponse(response, state) {
    var _a6, _b;
    const logger2 = this._logger.create("validateRefreshResponse");
    response.userState = state.data;
    (_a6 = response.session_state) != null ? _a6 : response.session_state = state.session_state;
    (_b = response.scope) != null ? _b : response.scope = state.scope;
    if (response.isOpenId && !!response.id_token) {
      this._validateIdTokenAttributes(response, state.id_token);
      logger2.debug("ID Token validated");
    }
    if (!response.id_token) {
      response.id_token = state.id_token;
      response.profile = state.profile;
    }
    const hasIdToken = response.isOpenId && !!response.id_token;
    await this._processClaims(response, false, hasIdToken);
    logger2.debug("claims processed");
  }
  validateSignoutResponse(response, state) {
    const logger2 = this._logger.create("validateSignoutResponse");
    if (state.id !== response.state) {
      logger2.throw(new Error("State does not match"));
    }
    logger2.debug("state validated");
    response.userState = state.data;
    if (response.error) {
      logger2.warn("Response was error", response.error);
      throw new ErrorResponse(response);
    }
  }
  _processSigninState(response, state) {
    var _a6;
    const logger2 = this._logger.create("_processSigninState");
    if (state.id !== response.state) {
      logger2.throw(new Error("State does not match"));
    }
    if (!state.client_id) {
      logger2.throw(new Error("No client_id on state"));
    }
    if (!state.authority) {
      logger2.throw(new Error("No authority on state"));
    }
    if (this._settings.authority !== state.authority) {
      logger2.throw(new Error("authority mismatch on settings vs. signin state"));
    }
    if (this._settings.client_id && this._settings.client_id !== state.client_id) {
      logger2.throw(new Error("client_id mismatch on settings vs. signin state"));
    }
    logger2.debug("state validated");
    response.userState = state.data;
    response.url_state = state.url_state;
    (_a6 = response.scope) != null ? _a6 : response.scope = state.scope;
    if (response.error) {
      logger2.warn("Response was error", response.error);
      throw new ErrorResponse(response);
    }
    if (state.code_verifier && !response.code) {
      logger2.throw(new Error("Expected code in response"));
    }
  }
  async _processClaims(response, skipUserInfo = false, validateSub = true) {
    const logger2 = this._logger.create("_processClaims");
    response.profile = this._claimsService.filterProtocolClaims(response.profile);
    if (skipUserInfo || !this._settings.loadUserInfo || !response.access_token) {
      logger2.debug("not loading user info");
      return;
    }
    logger2.debug("loading user info");
    const claims = await this._userInfoService.getClaims(response.access_token);
    logger2.debug("user info claims received from user info endpoint");
    if (validateSub && claims.sub !== response.profile.sub) {
      logger2.throw(new Error("subject from UserInfo response does not match subject in ID Token"));
    }
    response.profile = this._claimsService.mergeClaims(response.profile, this._claimsService.filterProtocolClaims(claims));
    logger2.debug("user info claims received, updated profile:", response.profile);
  }
  async _processCode(response, state, extraHeaders) {
    const logger2 = this._logger.create("_processCode");
    if (response.code) {
      logger2.debug("Validating code");
      const tokenResponse = await this._tokenClient.exchangeCode({
        client_id: state.client_id,
        client_secret: state.client_secret,
        code: response.code,
        redirect_uri: state.redirect_uri,
        code_verifier: state.code_verifier,
        extraHeaders,
        ...state.extraTokenParams
      });
      Object.assign(response, tokenResponse);
    } else {
      logger2.debug("No code to process");
    }
  }
  _validateIdTokenAttributes(response, existingToken) {
    var _a6;
    const logger2 = this._logger.create("_validateIdTokenAttributes");
    logger2.debug("decoding ID Token JWT");
    const incoming = JwtUtils.decode((_a6 = response.id_token) != null ? _a6 : "");
    if (!incoming.sub) {
      logger2.throw(new Error("ID Token is missing a subject claim"));
    }
    if (existingToken) {
      const existing = JwtUtils.decode(existingToken);
      if (incoming.sub !== existing.sub) {
        logger2.throw(new Error("sub in id_token does not match current sub"));
      }
      if (incoming.auth_time && incoming.auth_time !== existing.auth_time) {
        logger2.throw(new Error("auth_time in id_token does not match original auth_time"));
      }
      if (incoming.azp && incoming.azp !== existing.azp) {
        logger2.throw(new Error("azp in id_token does not match original azp"));
      }
      if (!incoming.azp && existing.azp) {
        logger2.throw(new Error("azp not in id_token, but present in original id_token"));
      }
    }
    response.profile = incoming;
  }
};
var State = class _State {
  constructor(args) {
    this.id = args.id || CryptoUtils.generateUUIDv4();
    this.data = args.data;
    if (args.created && args.created > 0) {
      this.created = args.created;
    } else {
      this.created = Timer.getEpochTime();
    }
    this.request_type = args.request_type;
    this.url_state = args.url_state;
  }
  toStorageString() {
    new Logger("State").create("toStorageString");
    return JSON.stringify({
      id: this.id,
      data: this.data,
      created: this.created,
      request_type: this.request_type,
      url_state: this.url_state
    });
  }
  static fromStorageString(storageString) {
    Logger.createStatic("State", "fromStorageString");
    return Promise.resolve(new _State(JSON.parse(storageString)));
  }
  static async clearStaleState(storage, age) {
    const logger2 = Logger.createStatic("State", "clearStaleState");
    const cutoff = Timer.getEpochTime() - age;
    const keys = await storage.getAllKeys();
    logger2.debug("got keys", keys);
    for (let i3 = 0; i3 < keys.length; i3++) {
      const key = keys[i3];
      const item = await storage.get(key);
      let remove = false;
      if (item) {
        try {
          const state = await _State.fromStorageString(item);
          logger2.debug("got item from key:", key, state.created);
          if (state.created <= cutoff) {
            remove = true;
          }
        } catch (err) {
          logger2.error("Error parsing state for key:", key, err);
          remove = true;
        }
      } else {
        logger2.debug("no item in storage for key:", key);
        remove = true;
      }
      if (remove) {
        logger2.debug("removed item for key:", key);
        void storage.remove(key);
      }
    }
  }
};
var SigninState = class _SigninState extends State {
  constructor(args) {
    super(args);
    this.code_verifier = args.code_verifier;
    this.code_challenge = args.code_challenge;
    this.authority = args.authority;
    this.client_id = args.client_id;
    this.redirect_uri = args.redirect_uri;
    this.scope = args.scope;
    this.client_secret = args.client_secret;
    this.extraTokenParams = args.extraTokenParams;
    this.response_mode = args.response_mode;
    this.skipUserInfo = args.skipUserInfo;
  }
  static async create(args) {
    const code_verifier = args.code_verifier === true ? CryptoUtils.generateCodeVerifier() : args.code_verifier || void 0;
    const code_challenge = code_verifier ? await CryptoUtils.generateCodeChallenge(code_verifier) : void 0;
    return new _SigninState({
      ...args,
      code_verifier,
      code_challenge
    });
  }
  toStorageString() {
    new Logger("SigninState").create("toStorageString");
    return JSON.stringify({
      id: this.id,
      data: this.data,
      created: this.created,
      request_type: this.request_type,
      url_state: this.url_state,
      code_verifier: this.code_verifier,
      authority: this.authority,
      client_id: this.client_id,
      redirect_uri: this.redirect_uri,
      scope: this.scope,
      client_secret: this.client_secret,
      extraTokenParams: this.extraTokenParams,
      response_mode: this.response_mode,
      skipUserInfo: this.skipUserInfo
    });
  }
  static fromStorageString(storageString) {
    Logger.createStatic("SigninState", "fromStorageString");
    const data = JSON.parse(storageString);
    return _SigninState.create(data);
  }
};
var _SigninRequest = class _SigninRequest2 {
  constructor(args) {
    this.url = args.url;
    this.state = args.state;
  }
  static async create({
    // mandatory
    url,
    authority,
    client_id,
    redirect_uri,
    response_type,
    scope,
    // optional
    state_data,
    response_mode,
    request_type,
    client_secret,
    nonce,
    url_state,
    resource,
    skipUserInfo,
    extraQueryParams,
    extraTokenParams,
    disablePKCE,
    dpopJkt,
    omitScopeWhenRequesting,
    ...optionalParams
  }) {
    if (!url) {
      this._logger.error("create: No url passed");
      throw new Error("url");
    }
    if (!client_id) {
      this._logger.error("create: No client_id passed");
      throw new Error("client_id");
    }
    if (!redirect_uri) {
      this._logger.error("create: No redirect_uri passed");
      throw new Error("redirect_uri");
    }
    if (!response_type) {
      this._logger.error("create: No response_type passed");
      throw new Error("response_type");
    }
    if (!scope) {
      this._logger.error("create: No scope passed");
      throw new Error("scope");
    }
    if (!authority) {
      this._logger.error("create: No authority passed");
      throw new Error("authority");
    }
    const state = await SigninState.create({
      data: state_data,
      request_type,
      url_state,
      code_verifier: !disablePKCE,
      client_id,
      authority,
      redirect_uri,
      response_mode,
      client_secret,
      scope,
      extraTokenParams,
      skipUserInfo
    });
    const parsedUrl = new URL(url);
    parsedUrl.searchParams.append("client_id", client_id);
    parsedUrl.searchParams.append("redirect_uri", redirect_uri);
    parsedUrl.searchParams.append("response_type", response_type);
    if (!omitScopeWhenRequesting) {
      parsedUrl.searchParams.append("scope", scope);
    }
    if (nonce) {
      parsedUrl.searchParams.append("nonce", nonce);
    }
    if (dpopJkt) {
      parsedUrl.searchParams.append("dpop_jkt", dpopJkt);
    }
    let stateParam = state.id;
    if (url_state) {
      stateParam = `${stateParam}${URL_STATE_DELIMITER}${url_state}`;
    }
    parsedUrl.searchParams.append("state", stateParam);
    if (state.code_challenge) {
      parsedUrl.searchParams.append("code_challenge", state.code_challenge);
      parsedUrl.searchParams.append("code_challenge_method", "S256");
    }
    if (resource) {
      const resources = Array.isArray(resource) ? resource : [resource];
      resources.forEach((r3) => parsedUrl.searchParams.append("resource", r3));
    }
    for (const [key, value] of Object.entries({ response_mode, ...optionalParams, ...extraQueryParams })) {
      if (value != null) {
        parsedUrl.searchParams.append(key, value.toString());
      }
    }
    return new _SigninRequest2({
      url: parsedUrl.href,
      state
    });
  }
};
_SigninRequest._logger = new Logger("SigninRequest");
var SigninRequest = _SigninRequest;
var OidcScope = "openid";
var SigninResponse = class {
  constructor(params) {
    this.access_token = "";
    this.token_type = "";
    this.profile = {};
    this.state = params.get("state");
    this.session_state = params.get("session_state");
    if (this.state) {
      const splitState = decodeURIComponent(this.state).split(URL_STATE_DELIMITER);
      this.state = splitState[0];
      if (splitState.length > 1) {
        this.url_state = splitState.slice(1).join(URL_STATE_DELIMITER);
      }
    }
    this.error = params.get("error");
    this.error_description = params.get("error_description");
    this.error_uri = params.get("error_uri");
    this.code = params.get("code");
  }
  get expires_in() {
    if (this.expires_at === void 0) {
      return void 0;
    }
    return this.expires_at - Timer.getEpochTime();
  }
  set expires_in(value) {
    if (typeof value === "string") value = Number(value);
    if (value !== void 0 && value >= 0) {
      this.expires_at = Math.floor(value) + Timer.getEpochTime();
    }
  }
  get isOpenId() {
    var _a6;
    return ((_a6 = this.scope) == null ? void 0 : _a6.split(" ").includes(OidcScope)) || !!this.id_token;
  }
};
var SignoutRequest = class {
  constructor({
    url,
    state_data,
    id_token_hint,
    post_logout_redirect_uri,
    extraQueryParams,
    request_type,
    client_id,
    url_state
  }) {
    this._logger = new Logger("SignoutRequest");
    if (!url) {
      this._logger.error("ctor: No url passed");
      throw new Error("url");
    }
    const parsedUrl = new URL(url);
    if (id_token_hint) {
      parsedUrl.searchParams.append("id_token_hint", id_token_hint);
    }
    if (client_id) {
      parsedUrl.searchParams.append("client_id", client_id);
    }
    if (post_logout_redirect_uri) {
      parsedUrl.searchParams.append("post_logout_redirect_uri", post_logout_redirect_uri);
      if (state_data || url_state) {
        this.state = new State({ data: state_data, request_type, url_state });
        let stateParam = this.state.id;
        if (url_state) {
          stateParam = `${stateParam}${URL_STATE_DELIMITER}${url_state}`;
        }
        parsedUrl.searchParams.append("state", stateParam);
      }
    }
    for (const [key, value] of Object.entries({ ...extraQueryParams })) {
      if (value != null) {
        parsedUrl.searchParams.append(key, value.toString());
      }
    }
    this.url = parsedUrl.href;
  }
};
var SignoutResponse = class {
  constructor(params) {
    this.state = params.get("state");
    if (this.state) {
      const splitState = decodeURIComponent(this.state).split(URL_STATE_DELIMITER);
      this.state = splitState[0];
      if (splitState.length > 1) {
        this.url_state = splitState.slice(1).join(URL_STATE_DELIMITER);
      }
    }
    this.error = params.get("error");
    this.error_description = params.get("error_description");
    this.error_uri = params.get("error_uri");
  }
};
var DefaultProtocolClaims = [
  "nbf",
  "jti",
  "auth_time",
  "nonce",
  "acr",
  "amr",
  "azp",
  "at_hash"
  // https://openid.net/specs/openid-connect-core-1_0.html#CodeIDToken
];
var InternalRequiredProtocolClaims = ["sub", "iss", "aud", "exp", "iat"];
var ClaimsService = class {
  constructor(_settings) {
    this._settings = _settings;
    this._logger = new Logger("ClaimsService");
  }
  filterProtocolClaims(claims) {
    const result = { ...claims };
    if (this._settings.filterProtocolClaims) {
      let protocolClaims;
      if (Array.isArray(this._settings.filterProtocolClaims)) {
        protocolClaims = this._settings.filterProtocolClaims;
      } else {
        protocolClaims = DefaultProtocolClaims;
      }
      for (const claim of protocolClaims) {
        if (!InternalRequiredProtocolClaims.includes(claim)) {
          delete result[claim];
        }
      }
    }
    return result;
  }
  mergeClaims(claims1, claims2) {
    const result = { ...claims1 };
    for (const [claim, values] of Object.entries(claims2)) {
      if (result[claim] !== values) {
        if (Array.isArray(result[claim]) || Array.isArray(values)) {
          if (this._settings.mergeClaimsStrategy.array == "replace") {
            result[claim] = values;
          } else {
            const mergedValues = Array.isArray(result[claim]) ? result[claim] : [result[claim]];
            for (const value of Array.isArray(values) ? values : [values]) {
              if (!mergedValues.includes(value)) {
                mergedValues.push(value);
              }
            }
            result[claim] = mergedValues;
          }
        } else if (typeof result[claim] === "object" && typeof values === "object") {
          result[claim] = this.mergeClaims(result[claim], values);
        } else {
          result[claim] = values;
        }
      }
    }
    return result;
  }
};
var DPoPState = class {
  constructor(keys, nonce) {
    this.keys = keys;
    this.nonce = nonce;
  }
};
var OidcClient = class {
  constructor(settings, metadataService) {
    this._logger = new Logger("OidcClient");
    this.settings = settings instanceof OidcClientSettingsStore ? settings : new OidcClientSettingsStore(settings);
    this.metadataService = metadataService != null ? metadataService : new MetadataService(this.settings);
    this._claimsService = new ClaimsService(this.settings);
    this._validator = new ResponseValidator(this.settings, this.metadataService, this._claimsService);
    this._tokenClient = new TokenClient(this.settings, this.metadataService);
  }
  async createSigninRequest({
    state,
    request,
    request_uri,
    request_type,
    id_token_hint,
    login_hint,
    skipUserInfo,
    nonce,
    url_state,
    response_type = this.settings.response_type,
    scope = this.settings.scope,
    redirect_uri = this.settings.redirect_uri,
    prompt = this.settings.prompt,
    display = this.settings.display,
    max_age = this.settings.max_age,
    ui_locales = this.settings.ui_locales,
    acr_values = this.settings.acr_values,
    resource = this.settings.resource,
    response_mode = this.settings.response_mode,
    extraQueryParams = this.settings.extraQueryParams,
    extraTokenParams = this.settings.extraTokenParams,
    dpopJkt,
    omitScopeWhenRequesting = this.settings.omitScopeWhenRequesting
  }) {
    const logger2 = this._logger.create("createSigninRequest");
    if (response_type !== "code") {
      throw new Error("Only the Authorization Code flow (with PKCE) is supported");
    }
    const url = await this.metadataService.getAuthorizationEndpoint();
    logger2.debug("Received authorization endpoint", url);
    const signinRequest = await SigninRequest.create({
      url,
      authority: this.settings.authority,
      client_id: this.settings.client_id,
      redirect_uri,
      response_type,
      scope,
      state_data: state,
      url_state,
      prompt,
      display,
      max_age,
      ui_locales,
      id_token_hint,
      login_hint,
      acr_values,
      dpopJkt,
      resource,
      request,
      request_uri,
      extraQueryParams,
      extraTokenParams,
      request_type,
      response_mode,
      client_secret: this.settings.client_secret,
      skipUserInfo,
      nonce,
      disablePKCE: this.settings.disablePKCE,
      omitScopeWhenRequesting
    });
    await this.clearStaleState();
    const signinState = signinRequest.state;
    await this.settings.stateStore.set(signinState.id, signinState.toStorageString());
    return signinRequest;
  }
  async readSigninResponseState(url, removeState = false) {
    const logger2 = this._logger.create("readSigninResponseState");
    const response = new SigninResponse(UrlUtils.readParams(url, this.settings.response_mode));
    if (!response.state) {
      logger2.throw(new Error("No state in response"));
      throw null;
    }
    const storedStateString = await this.settings.stateStore[removeState ? "remove" : "get"](response.state);
    if (!storedStateString) {
      logger2.throw(new Error("No matching state found in storage"));
      throw null;
    }
    const state = await SigninState.fromStorageString(storedStateString);
    return { state, response };
  }
  async processSigninResponse(url, extraHeaders, removeState = true) {
    const logger2 = this._logger.create("processSigninResponse");
    const { state, response } = await this.readSigninResponseState(url, removeState);
    logger2.debug("received state from storage; validating response");
    if (this.settings.dpop && this.settings.dpop.store) {
      const dpopProof = await this.getDpopProof(this.settings.dpop.store);
      extraHeaders = { ...extraHeaders, "DPoP": dpopProof };
    }
    try {
      await this._validator.validateSigninResponse(response, state, extraHeaders);
    } catch (err) {
      if (err instanceof ErrorDPoPNonce && this.settings.dpop) {
        const dpopProof = await this.getDpopProof(this.settings.dpop.store, err.nonce);
        extraHeaders["DPoP"] = dpopProof;
        await this._validator.validateSigninResponse(response, state, extraHeaders);
      } else {
        throw err;
      }
    }
    return response;
  }
  async getDpopProof(dpopStore, nonce) {
    let keyPair;
    let dpopState;
    if (!(await dpopStore.getAllKeys()).includes(this.settings.client_id)) {
      keyPair = await CryptoUtils.generateDPoPKeys();
      dpopState = new DPoPState(keyPair, nonce);
      await dpopStore.set(this.settings.client_id, dpopState);
    } else {
      dpopState = await dpopStore.get(this.settings.client_id);
      if (dpopState.nonce !== nonce && nonce) {
        dpopState.nonce = nonce;
        await dpopStore.set(this.settings.client_id, dpopState);
      }
    }
    return await CryptoUtils.generateDPoPProof({
      url: await this.metadataService.getTokenEndpoint(false),
      httpMethod: "POST",
      keyPair: dpopState.keys,
      nonce: dpopState.nonce
    });
  }
  async processResourceOwnerPasswordCredentials({
    username,
    password,
    skipUserInfo = false,
    extraTokenParams = {}
  }) {
    const tokenResponse = await this._tokenClient.exchangeCredentials({ username, password, ...extraTokenParams });
    const signinResponse = new SigninResponse(new URLSearchParams());
    Object.assign(signinResponse, tokenResponse);
    await this._validator.validateCredentialsResponse(signinResponse, skipUserInfo);
    return signinResponse;
  }
  async useRefreshToken({
    state,
    redirect_uri,
    resource,
    timeoutInSeconds,
    extraHeaders,
    extraTokenParams
  }) {
    var _a6;
    const logger2 = this._logger.create("useRefreshToken");
    let scope;
    if (this.settings.refreshTokenAllowedScope === void 0) {
      scope = state.scope;
    } else {
      const allowableScopes = this.settings.refreshTokenAllowedScope.split(" ");
      const providedScopes = ((_a6 = state.scope) == null ? void 0 : _a6.split(" ")) || [];
      scope = providedScopes.filter((s3) => allowableScopes.includes(s3)).join(" ");
    }
    if (this.settings.dpop && this.settings.dpop.store) {
      const dpopProof = await this.getDpopProof(this.settings.dpop.store);
      extraHeaders = { ...extraHeaders, "DPoP": dpopProof };
    }
    let result;
    try {
      result = await this._tokenClient.exchangeRefreshToken({
        refresh_token: state.refresh_token,
        // provide the (possible filtered) scope list
        scope,
        redirect_uri,
        resource,
        timeoutInSeconds,
        extraHeaders,
        ...extraTokenParams
      });
    } catch (err) {
      if (err instanceof ErrorDPoPNonce && this.settings.dpop) {
        extraHeaders["DPoP"] = await this.getDpopProof(this.settings.dpop.store, err.nonce);
        result = await this._tokenClient.exchangeRefreshToken({
          refresh_token: state.refresh_token,
          // provide the (possible filtered) scope list
          scope,
          redirect_uri,
          resource,
          timeoutInSeconds,
          extraHeaders,
          ...extraTokenParams
        });
      } else {
        throw err;
      }
    }
    const response = new SigninResponse(new URLSearchParams());
    Object.assign(response, result);
    logger2.debug("validating response", response);
    await this._validator.validateRefreshResponse(response, {
      ...state,
      // override the scope in the state handed over to the validator
      // so it can set the granted scope to the requested scope in case none is included in the response
      scope
    });
    return response;
  }
  async createSignoutRequest({
    state,
    id_token_hint,
    client_id,
    request_type,
    url_state,
    post_logout_redirect_uri = this.settings.post_logout_redirect_uri,
    extraQueryParams = this.settings.extraQueryParams
  } = {}) {
    const logger2 = this._logger.create("createSignoutRequest");
    const url = await this.metadataService.getEndSessionEndpoint();
    if (!url) {
      logger2.throw(new Error("No end session endpoint"));
      throw null;
    }
    logger2.debug("Received end session endpoint", url);
    if (!client_id && post_logout_redirect_uri && !id_token_hint) {
      client_id = this.settings.client_id;
    }
    const request = new SignoutRequest({
      url,
      id_token_hint,
      client_id,
      post_logout_redirect_uri,
      state_data: state,
      extraQueryParams,
      request_type,
      url_state
    });
    await this.clearStaleState();
    const signoutState = request.state;
    if (signoutState) {
      logger2.debug("Signout request has state to persist");
      await this.settings.stateStore.set(signoutState.id, signoutState.toStorageString());
    }
    return request;
  }
  async readSignoutResponseState(url, removeState = false) {
    const logger2 = this._logger.create("readSignoutResponseState");
    const response = new SignoutResponse(UrlUtils.readParams(url, this.settings.response_mode));
    if (!response.state) {
      logger2.debug("No state in response");
      if (response.error) {
        logger2.warn("Response was error:", response.error);
        throw new ErrorResponse(response);
      }
      return { state: void 0, response };
    }
    const storedStateString = await this.settings.stateStore[removeState ? "remove" : "get"](response.state);
    if (!storedStateString) {
      logger2.throw(new Error("No matching state found in storage"));
      throw null;
    }
    const state = await State.fromStorageString(storedStateString);
    return { state, response };
  }
  async processSignoutResponse(url) {
    const logger2 = this._logger.create("processSignoutResponse");
    const { state, response } = await this.readSignoutResponseState(url, true);
    if (state) {
      logger2.debug("Received state from storage; validating response");
      this._validator.validateSignoutResponse(response, state);
    } else {
      logger2.debug("No state from storage; skipping response validation");
    }
    return response;
  }
  clearStaleState() {
    this._logger.create("clearStaleState");
    return State.clearStaleState(this.settings.stateStore, this.settings.staleStateAgeInSeconds);
  }
  async revokeToken(token, type) {
    this._logger.create("revokeToken");
    return await this._tokenClient.revoke({
      token,
      token_type_hint: type
    });
  }
};
var SessionMonitor = class {
  constructor(_userManager) {
    this._userManager = _userManager;
    this._logger = new Logger("SessionMonitor");
    this._start = async (user) => {
      const session_state = user.session_state;
      if (!session_state) {
        return;
      }
      const logger2 = this._logger.create("_start");
      if (user.profile) {
        this._sub = user.profile.sub;
        logger2.debug("session_state", session_state, ", sub", this._sub);
      } else {
        this._sub = void 0;
        logger2.debug("session_state", session_state, ", anonymous user");
      }
      if (this._checkSessionIFrame) {
        this._checkSessionIFrame.start(session_state);
        return;
      }
      try {
        const url = await this._userManager.metadataService.getCheckSessionIframe();
        if (url) {
          logger2.debug("initializing check session iframe");
          const client_id = this._userManager.settings.client_id;
          const intervalInSeconds = this._userManager.settings.checkSessionIntervalInSeconds;
          const stopOnError = this._userManager.settings.stopCheckSessionOnError;
          const checkSessionIFrame = new CheckSessionIFrame(this._callback, client_id, url, intervalInSeconds, stopOnError);
          await checkSessionIFrame.load();
          this._checkSessionIFrame = checkSessionIFrame;
          checkSessionIFrame.start(session_state);
        } else {
          logger2.warn("no check session iframe found in the metadata");
        }
      } catch (err) {
        logger2.error("Error from getCheckSessionIframe:", err instanceof Error ? err.message : err);
      }
    };
    this._stop = () => {
      const logger2 = this._logger.create("_stop");
      this._sub = void 0;
      if (this._checkSessionIFrame) {
        this._checkSessionIFrame.stop();
      }
      if (this._userManager.settings.monitorAnonymousSession) {
        const timerHandle = setInterval(async () => {
          clearInterval(timerHandle);
          try {
            const session = await this._userManager.querySessionStatus();
            if (session) {
              const tmpUser = {
                session_state: session.session_state,
                profile: session.sub ? {
                  sub: session.sub
                } : null
              };
              void this._start(tmpUser);
            }
          } catch (err) {
            logger2.error("error from querySessionStatus", err instanceof Error ? err.message : err);
          }
        }, 1e3);
      }
    };
    this._callback = async () => {
      const logger2 = this._logger.create("_callback");
      try {
        const session = await this._userManager.querySessionStatus();
        let raiseEvent = true;
        if (session && this._checkSessionIFrame) {
          if (session.sub === this._sub) {
            raiseEvent = false;
            this._checkSessionIFrame.start(session.session_state);
            logger2.debug("same sub still logged in at OP, session state has changed, restarting check session iframe; session_state", session.session_state);
            await this._userManager.events._raiseUserSessionChanged();
          } else {
            logger2.debug("different subject signed into OP", session.sub);
          }
        } else {
          logger2.debug("subject no longer signed into OP");
        }
        if (raiseEvent) {
          if (this._sub) {
            await this._userManager.events._raiseUserSignedOut();
          } else {
            await this._userManager.events._raiseUserSignedIn();
          }
        } else {
          logger2.debug("no change in session detected, no event to raise");
        }
      } catch (err) {
        if (this._sub) {
          logger2.debug("Error calling queryCurrentSigninSession; raising signed out event", err);
          await this._userManager.events._raiseUserSignedOut();
        }
      }
    };
    if (!_userManager) {
      this._logger.throw(new Error("No user manager passed"));
    }
    this._userManager.events.addUserLoaded(this._start);
    this._userManager.events.addUserUnloaded(this._stop);
    this._init().catch((err) => {
      this._logger.error(err);
    });
  }
  async _init() {
    this._logger.create("_init");
    const user = await this._userManager.getUser();
    if (user) {
      void this._start(user);
    } else if (this._userManager.settings.monitorAnonymousSession) {
      const session = await this._userManager.querySessionStatus();
      if (session) {
        const tmpUser = {
          session_state: session.session_state,
          profile: session.sub ? {
            sub: session.sub
          } : null
        };
        void this._start(tmpUser);
      }
    }
  }
};
var User = class _User {
  constructor(args) {
    var _a6;
    this.id_token = args.id_token;
    this.session_state = (_a6 = args.session_state) != null ? _a6 : null;
    this.access_token = args.access_token;
    this.refresh_token = args.refresh_token;
    this.token_type = args.token_type;
    this.scope = args.scope;
    this.profile = args.profile;
    this.expires_at = args.expires_at;
    this.state = args.userState;
    this.url_state = args.url_state;
  }
  /** Computed number of seconds the access token has remaining. */
  get expires_in() {
    if (this.expires_at === void 0) {
      return void 0;
    }
    return this.expires_at - Timer.getEpochTime();
  }
  set expires_in(value) {
    if (value !== void 0) {
      this.expires_at = Math.floor(value) + Timer.getEpochTime();
    }
  }
  /** Computed value indicating if the access token is expired. */
  get expired() {
    const expires_in = this.expires_in;
    if (expires_in === void 0) {
      return void 0;
    }
    return expires_in <= 0;
  }
  /** Array representing the parsed values from the `scope`. */
  get scopes() {
    var _a6, _b;
    return (_b = (_a6 = this.scope) == null ? void 0 : _a6.split(" ")) != null ? _b : [];
  }
  toStorageString() {
    new Logger("User").create("toStorageString");
    return JSON.stringify({
      id_token: this.id_token,
      session_state: this.session_state,
      access_token: this.access_token,
      refresh_token: this.refresh_token,
      token_type: this.token_type,
      scope: this.scope,
      profile: this.profile,
      expires_at: this.expires_at
    });
  }
  static fromStorageString(storageString) {
    Logger.createStatic("User", "fromStorageString");
    return new _User(JSON.parse(storageString));
  }
};
var messageSource = "oidc-client";
var AbstractChildWindow = class {
  constructor() {
    this._abort = new Event("Window navigation aborted");
    this._disposeHandlers = /* @__PURE__ */ new Set();
    this._window = null;
  }
  async navigate(params) {
    const logger2 = this._logger.create("navigate");
    if (!this._window) {
      throw new Error("Attempted to navigate on a disposed window");
    }
    logger2.debug("setting URL in window");
    this._window.location.replace(params.url);
    const { url, keepOpen } = await new Promise((resolve, reject) => {
      const listener = (e3) => {
        var _a6;
        const data = e3.data;
        const origin2 = (_a6 = params.scriptOrigin) != null ? _a6 : window.location.origin;
        if (e3.origin !== origin2 || (data == null ? void 0 : data.source) !== messageSource) {
          return;
        }
        try {
          const state = UrlUtils.readParams(data.url, params.response_mode).get("state");
          if (!state) {
            logger2.warn("no state found in response url");
          }
          if (e3.source !== this._window && state !== params.state) {
            return;
          }
        } catch {
          this._dispose();
          reject(new Error("Invalid response from window"));
        }
        resolve(data);
      };
      window.addEventListener("message", listener, false);
      this._disposeHandlers.add(() => window.removeEventListener("message", listener, false));
      const channel = new BroadcastChannel(`oidc-client-popup-${params.state}`);
      channel.addEventListener("message", listener, false);
      this._disposeHandlers.add(() => channel.close());
      this._disposeHandlers.add(this._abort.addHandler((reason) => {
        this._dispose();
        reject(reason);
      }));
    });
    logger2.debug("got response from window");
    this._dispose();
    if (!keepOpen) {
      this.close();
    }
    return { url };
  }
  _dispose() {
    this._logger.create("_dispose");
    for (const dispose of this._disposeHandlers) {
      dispose();
    }
    this._disposeHandlers.clear();
  }
  static _notifyParent(parent, url, keepOpen = false, targetOrigin = window.location.origin) {
    const msgData = {
      source: messageSource,
      url,
      keepOpen
    };
    const logger2 = new Logger("_notifyParent");
    if (parent) {
      logger2.debug("With parent. Using parent.postMessage.");
      parent.postMessage(msgData, targetOrigin);
    } else {
      logger2.debug("No parent. Using BroadcastChannel.");
      const state = new URL(url).searchParams.get("state");
      if (!state) {
        throw new Error("No parent and no state in URL. Can't complete notification.");
      }
      const channel = new BroadcastChannel(`oidc-client-popup-${state}`);
      channel.postMessage(msgData);
      channel.close();
    }
  }
};
var DefaultPopupWindowFeatures = {
  location: false,
  toolbar: false,
  height: 640,
  closePopupWindowAfterInSeconds: -1
};
var DefaultPopupTarget = "_blank";
var DefaultAccessTokenExpiringNotificationTimeInSeconds = 60;
var DefaultCheckSessionIntervalInSeconds = 2;
var DefaultSilentRequestTimeoutInSeconds = 10;
var UserManagerSettingsStore = class extends OidcClientSettingsStore {
  constructor(args) {
    const {
      popup_redirect_uri = args.redirect_uri,
      popup_post_logout_redirect_uri = args.post_logout_redirect_uri,
      popupWindowFeatures = DefaultPopupWindowFeatures,
      popupWindowTarget = DefaultPopupTarget,
      redirectMethod = "assign",
      redirectTarget = "self",
      iframeNotifyParentOrigin = args.iframeNotifyParentOrigin,
      iframeScriptOrigin = args.iframeScriptOrigin,
      requestTimeoutInSeconds,
      silent_redirect_uri = args.redirect_uri,
      silentRequestTimeoutInSeconds,
      automaticSilentRenew = true,
      validateSubOnSilentRenew = true,
      includeIdTokenInSilentRenew = false,
      monitorSession = false,
      monitorAnonymousSession = false,
      checkSessionIntervalInSeconds = DefaultCheckSessionIntervalInSeconds,
      query_status_response_type = "code",
      stopCheckSessionOnError = true,
      revokeTokenTypes = ["access_token", "refresh_token"],
      revokeTokensOnSignout = false,
      includeIdTokenInSilentSignout = false,
      accessTokenExpiringNotificationTimeInSeconds = DefaultAccessTokenExpiringNotificationTimeInSeconds,
      userStore
    } = args;
    super(args);
    this.popup_redirect_uri = popup_redirect_uri;
    this.popup_post_logout_redirect_uri = popup_post_logout_redirect_uri;
    this.popupWindowFeatures = popupWindowFeatures;
    this.popupWindowTarget = popupWindowTarget;
    this.redirectMethod = redirectMethod;
    this.redirectTarget = redirectTarget;
    this.iframeNotifyParentOrigin = iframeNotifyParentOrigin;
    this.iframeScriptOrigin = iframeScriptOrigin;
    this.silent_redirect_uri = silent_redirect_uri;
    this.silentRequestTimeoutInSeconds = silentRequestTimeoutInSeconds || requestTimeoutInSeconds || DefaultSilentRequestTimeoutInSeconds;
    this.automaticSilentRenew = automaticSilentRenew;
    this.validateSubOnSilentRenew = validateSubOnSilentRenew;
    this.includeIdTokenInSilentRenew = includeIdTokenInSilentRenew;
    this.monitorSession = monitorSession;
    this.monitorAnonymousSession = monitorAnonymousSession;
    this.checkSessionIntervalInSeconds = checkSessionIntervalInSeconds;
    this.stopCheckSessionOnError = stopCheckSessionOnError;
    this.query_status_response_type = query_status_response_type;
    this.revokeTokenTypes = revokeTokenTypes;
    this.revokeTokensOnSignout = revokeTokensOnSignout;
    this.includeIdTokenInSilentSignout = includeIdTokenInSilentSignout;
    this.accessTokenExpiringNotificationTimeInSeconds = accessTokenExpiringNotificationTimeInSeconds;
    if (userStore) {
      this.userStore = userStore;
    } else {
      const store = typeof window !== "undefined" ? window.sessionStorage : new InMemoryWebStorage();
      this.userStore = new WebStorageStateStore({ store });
    }
  }
};
var IFrameWindow = class _IFrameWindow extends AbstractChildWindow {
  constructor({
    silentRequestTimeoutInSeconds = DefaultSilentRequestTimeoutInSeconds
  }) {
    super();
    this._logger = new Logger("IFrameWindow");
    this._timeoutInSeconds = silentRequestTimeoutInSeconds;
    this._frame = _IFrameWindow.createHiddenIframe();
    this._window = this._frame.contentWindow;
  }
  static createHiddenIframe() {
    const iframe = window.document.createElement("iframe");
    iframe.style.visibility = "hidden";
    iframe.style.position = "fixed";
    iframe.style.left = "-1000px";
    iframe.style.top = "0";
    iframe.width = "0";
    iframe.height = "0";
    window.document.body.appendChild(iframe);
    return iframe;
  }
  async navigate(params) {
    this._logger.debug("navigate: Using timeout of:", this._timeoutInSeconds);
    const timer = setTimeout(() => void this._abort.raise(new ErrorTimeout("IFrame timed out without a response")), this._timeoutInSeconds * 1e3);
    this._disposeHandlers.add(() => clearTimeout(timer));
    return await super.navigate(params);
  }
  close() {
    var _a6;
    if (this._frame) {
      if (this._frame.parentNode) {
        this._frame.addEventListener("load", (ev) => {
          var _a22;
          const frame = ev.target;
          (_a22 = frame.parentNode) == null ? void 0 : _a22.removeChild(frame);
          void this._abort.raise(new Error("IFrame removed from DOM"));
        }, true);
        (_a6 = this._frame.contentWindow) == null ? void 0 : _a6.location.replace("about:blank");
      }
      this._frame = null;
    }
    this._window = null;
  }
  static notifyParent(url, targetOrigin) {
    return super._notifyParent(window.parent, url, false, targetOrigin);
  }
};
var IFrameNavigator = class {
  constructor(_settings) {
    this._settings = _settings;
    this._logger = new Logger("IFrameNavigator");
  }
  async prepare({
    silentRequestTimeoutInSeconds = this._settings.silentRequestTimeoutInSeconds
  }) {
    return new IFrameWindow({ silentRequestTimeoutInSeconds });
  }
  async callback(url) {
    this._logger.create("callback");
    IFrameWindow.notifyParent(url, this._settings.iframeNotifyParentOrigin);
  }
};
var checkForPopupClosedInterval = 500;
var second = 1e3;
var PopupWindow = class extends AbstractChildWindow {
  constructor({
    popupWindowTarget = DefaultPopupTarget,
    popupWindowFeatures = {},
    popupSignal,
    popupAbortOnClose
  }) {
    super();
    this._logger = new Logger("PopupWindow");
    const centeredPopup = PopupUtils.center({ ...DefaultPopupWindowFeatures, ...popupWindowFeatures });
    this._window = window.open(void 0, popupWindowTarget, PopupUtils.serialize(centeredPopup));
    this.abortOnClose = Boolean(popupAbortOnClose);
    if (popupSignal) {
      popupSignal.addEventListener("abort", () => {
        var _a6;
        void this._abort.raise(new Error((_a6 = popupSignal.reason) != null ? _a6 : "Popup aborted"));
      });
    }
    if (popupWindowFeatures.closePopupWindowAfterInSeconds && popupWindowFeatures.closePopupWindowAfterInSeconds > 0) {
      setTimeout(() => {
        if (!this._window || typeof this._window.closed !== "boolean" || this._window.closed) {
          void this._abort.raise(new Error("Popup blocked by user"));
          return;
        }
        this.close();
      }, popupWindowFeatures.closePopupWindowAfterInSeconds * second);
    }
  }
  async navigate(params) {
    var _a6;
    (_a6 = this._window) == null ? void 0 : _a6.focus();
    const popupClosedInterval = setInterval(() => {
      if (!this._window || this._window.closed) {
        this._logger.debug("Popup closed by user or isolated by redirect");
        clearPopupClosedInterval();
        this._disposeHandlers.delete(clearPopupClosedInterval);
        if (this.abortOnClose) {
          void this._abort.raise(new Error("Popup closed by user"));
        }
      }
    }, checkForPopupClosedInterval);
    const clearPopupClosedInterval = () => clearInterval(popupClosedInterval);
    this._disposeHandlers.add(clearPopupClosedInterval);
    return await super.navigate(params);
  }
  close() {
    if (this._window) {
      if (!this._window.closed) {
        this._window.close();
        void this._abort.raise(new Error("Popup closed"));
      }
    }
    this._window = null;
  }
  static notifyOpener(url, keepOpen) {
    super._notifyParent(window.opener, url, keepOpen);
    if (!keepOpen && !window.opener) {
      window.close();
    }
  }
};
var PopupNavigator = class {
  constructor(_settings) {
    this._settings = _settings;
    this._logger = new Logger("PopupNavigator");
  }
  async prepare({
    popupWindowFeatures = this._settings.popupWindowFeatures,
    popupWindowTarget = this._settings.popupWindowTarget,
    popupSignal,
    popupAbortOnClose
  }) {
    return new PopupWindow({
      popupWindowFeatures,
      popupWindowTarget,
      popupSignal,
      popupAbortOnClose
    });
  }
  async callback(url, { keepOpen = false }) {
    this._logger.create("callback");
    PopupWindow.notifyOpener(url, keepOpen);
  }
};
var RedirectNavigator = class {
  constructor(_settings) {
    this._settings = _settings;
    this._logger = new Logger("RedirectNavigator");
  }
  async prepare({
    redirectMethod = this._settings.redirectMethod,
    redirectTarget = this._settings.redirectTarget
  }) {
    var _a6;
    this._logger.create("prepare");
    let targetWindow = window.self;
    if (redirectTarget === "top") {
      targetWindow = (_a6 = window.top) != null ? _a6 : window.self;
    }
    const redirect = targetWindow.location[redirectMethod].bind(targetWindow.location);
    let abort;
    return {
      navigate: async (params) => {
        this._logger.create("navigate");
        const promise = new Promise((resolve, reject) => {
          abort = reject;
          window.addEventListener("pageshow", () => resolve(window.location.href));
          redirect(params.url);
        });
        return await promise;
      },
      close: () => {
        this._logger.create("close");
        abort == null ? void 0 : abort(new Error("Redirect aborted"));
        targetWindow.stop();
      }
    };
  }
  async callback() {
    return;
  }
};
var UserManagerEvents = class extends AccessTokenEvents {
  constructor(settings) {
    super({ expiringNotificationTimeInSeconds: settings.accessTokenExpiringNotificationTimeInSeconds });
    this._logger = new Logger("UserManagerEvents");
    this._userLoaded = new Event("User loaded");
    this._userUnloaded = new Event("User unloaded");
    this._silentRenewError = new Event("Silent renew error");
    this._userSignedIn = new Event("User signed in");
    this._userSignedOut = new Event("User signed out");
    this._userSessionChanged = new Event("User session changed");
  }
  async load(user, raiseEvent = true) {
    await super.load(user);
    if (raiseEvent) {
      await this._userLoaded.raise(user);
    }
  }
  async unload() {
    await super.unload();
    await this._userUnloaded.raise();
  }
  /**
   * Add callback: Raised when a user session has been established (or re-established).
   */
  addUserLoaded(cb) {
    return this._userLoaded.addHandler(cb);
  }
  /**
   * Remove callback: Raised when a user session has been established (or re-established).
   */
  removeUserLoaded(cb) {
    return this._userLoaded.removeHandler(cb);
  }
  /**
   * Add callback: Raised when a user session has been terminated.
   */
  addUserUnloaded(cb) {
    return this._userUnloaded.addHandler(cb);
  }
  /**
   * Remove callback: Raised when a user session has been terminated.
   */
  removeUserUnloaded(cb) {
    return this._userUnloaded.removeHandler(cb);
  }
  /**
   * Add callback: Raised when the automatic silent renew has failed.
   */
  addSilentRenewError(cb) {
    return this._silentRenewError.addHandler(cb);
  }
  /**
   * Remove callback: Raised when the automatic silent renew has failed.
   */
  removeSilentRenewError(cb) {
    return this._silentRenewError.removeHandler(cb);
  }
  /**
   * @internal
   */
  async _raiseSilentRenewError(e3) {
    await this._silentRenewError.raise(e3);
  }
  /**
   * Add callback: Raised when the user is signed in (when `monitorSession` is set).
   * @see {@link UserManagerSettings.monitorSession}
   */
  addUserSignedIn(cb) {
    return this._userSignedIn.addHandler(cb);
  }
  /**
   * Remove callback: Raised when the user is signed in (when `monitorSession` is set).
   */
  removeUserSignedIn(cb) {
    this._userSignedIn.removeHandler(cb);
  }
  /**
   * @internal
   */
  async _raiseUserSignedIn() {
    await this._userSignedIn.raise();
  }
  /**
   * Add callback: Raised when the user's sign-in status at the OP has changed (when `monitorSession` is set).
   * @see {@link UserManagerSettings.monitorSession}
   */
  addUserSignedOut(cb) {
    return this._userSignedOut.addHandler(cb);
  }
  /**
   * Remove callback: Raised when the user's sign-in status at the OP has changed (when `monitorSession` is set).
   */
  removeUserSignedOut(cb) {
    this._userSignedOut.removeHandler(cb);
  }
  /**
   * @internal
   */
  async _raiseUserSignedOut() {
    await this._userSignedOut.raise();
  }
  /**
   * Add callback: Raised when the user session changed (when `monitorSession` is set).
   * @see {@link UserManagerSettings.monitorSession}
   */
  addUserSessionChanged(cb) {
    return this._userSessionChanged.addHandler(cb);
  }
  /**
   * Remove callback: Raised when the user session changed (when `monitorSession` is set).
   */
  removeUserSessionChanged(cb) {
    this._userSessionChanged.removeHandler(cb);
  }
  /**
   * @internal
   */
  async _raiseUserSessionChanged() {
    await this._userSessionChanged.raise();
  }
};
var SilentRenewService = class {
  constructor(_userManager) {
    this._userManager = _userManager;
    this._logger = new Logger("SilentRenewService");
    this._isStarted = false;
    this._retryTimer = new Timer("Retry Silent Renew");
    this._tokenExpiring = async () => {
      const logger2 = this._logger.create("_tokenExpiring");
      try {
        await this._userManager.signinSilent();
        logger2.debug("silent token renewal successful");
      } catch (err) {
        if (err instanceof ErrorTimeout) {
          logger2.warn("ErrorTimeout from signinSilent:", err, "retry in 5s");
          this._retryTimer.init(5);
          return;
        }
        logger2.error("Error from signinSilent:", err);
        await this._userManager.events._raiseSilentRenewError(err);
      }
    };
  }
  async start() {
    const logger2 = this._logger.create("start");
    if (!this._isStarted) {
      this._isStarted = true;
      this._userManager.events.addAccessTokenExpiring(this._tokenExpiring);
      this._retryTimer.addHandler(this._tokenExpiring);
      try {
        await this._userManager.getUser();
      } catch (err) {
        logger2.error("getUser error", err);
      }
    }
  }
  stop() {
    if (this._isStarted) {
      this._retryTimer.cancel();
      this._retryTimer.removeHandler(this._tokenExpiring);
      this._userManager.events.removeAccessTokenExpiring(this._tokenExpiring);
      this._isStarted = false;
    }
  }
};
var RefreshState = class {
  constructor(args) {
    this.refresh_token = args.refresh_token;
    this.id_token = args.id_token;
    this.session_state = args.session_state;
    this.scope = args.scope;
    this.profile = args.profile;
    this.data = args.state;
  }
};
var UserManager = class {
  constructor(settings, redirectNavigator, popupNavigator, iframeNavigator) {
    this._logger = new Logger("UserManager");
    this.settings = new UserManagerSettingsStore(settings);
    this._client = new OidcClient(settings);
    this._redirectNavigator = redirectNavigator != null ? redirectNavigator : new RedirectNavigator(this.settings);
    this._popupNavigator = popupNavigator != null ? popupNavigator : new PopupNavigator(this.settings);
    this._iframeNavigator = iframeNavigator != null ? iframeNavigator : new IFrameNavigator(this.settings);
    this._events = new UserManagerEvents(this.settings);
    this._silentRenewService = new SilentRenewService(this);
    if (this.settings.automaticSilentRenew) {
      this.startSilentRenew();
    }
    this._sessionMonitor = null;
    if (this.settings.monitorSession) {
      this._sessionMonitor = new SessionMonitor(this);
    }
  }
  /**
   * Get object used to register for events raised by the `UserManager`.
   */
  get events() {
    return this._events;
  }
  /**
   * Get object used to access the metadata configuration of the identity provider.
   */
  get metadataService() {
    return this._client.metadataService;
  }
  /**
   * Load the `User` object for the currently authenticated user.
   *
   * @param raiseEvent - If `true`, the `UserLoaded` event will be raised. Defaults to false.
   * @returns A promise
   */
  async getUser(raiseEvent = false) {
    const logger2 = this._logger.create("getUser");
    const user = await this._loadUser();
    if (user) {
      logger2.info("user loaded");
      await this._events.load(user, raiseEvent);
      return user;
    }
    logger2.info("user not found in storage");
    return null;
  }
  /**
   * Remove from any storage the currently authenticated user.
   *
   * @returns A promise
   */
  async removeUser() {
    const logger2 = this._logger.create("removeUser");
    await this.storeUser(null);
    logger2.info("user removed from storage");
    await this._events.unload();
  }
  /**
   * Trigger a redirect of the current window to the authorization endpoint.
   *
   * @returns A promise
   *
   * @throws `Error` In cases of wrong authentication.
   */
  async signinRedirect(args = {}) {
    var _a6;
    this._logger.create("signinRedirect");
    const {
      redirectMethod,
      ...requestArgs
    } = args;
    let dpopJkt;
    if ((_a6 = this.settings.dpop) == null ? void 0 : _a6.bind_authorization_code) {
      dpopJkt = await this.generateDPoPJkt(this.settings.dpop);
    }
    const handle = await this._redirectNavigator.prepare({ redirectMethod });
    await this._signinStart({
      request_type: "si:r",
      dpopJkt,
      ...requestArgs
    }, handle);
  }
  /**
   * Process the response (callback) from the authorization endpoint.
   * It is recommended to use {@link UserManager.signinCallback} instead.
   *
   * @returns A promise containing the authenticated `User`.
   *
   * @see {@link UserManager.signinCallback}
   */
  async signinRedirectCallback(url = window.location.href) {
    const logger2 = this._logger.create("signinRedirectCallback");
    const user = await this._signinEnd(url);
    if (user.profile && user.profile.sub) {
      logger2.info("success, signed in subject", user.profile.sub);
    } else {
      logger2.info("no subject");
    }
    return user;
  }
  /**
   * Trigger the signin with user/password.
   *
   * @returns A promise containing the authenticated `User`.
   * @throws {@link ErrorResponse} In cases of wrong authentication.
   */
  async signinResourceOwnerCredentials({
    username,
    password,
    skipUserInfo = false
  }) {
    const logger2 = this._logger.create("signinResourceOwnerCredential");
    const signinResponse = await this._client.processResourceOwnerPasswordCredentials({
      username,
      password,
      skipUserInfo,
      extraTokenParams: this.settings.extraTokenParams
    });
    logger2.debug("got signin response");
    const user = await this._buildUser(signinResponse);
    if (user.profile && user.profile.sub) {
      logger2.info("success, signed in subject", user.profile.sub);
    } else {
      logger2.info("no subject");
    }
    return user;
  }
  /**
   * Trigger a request (via a popup window) to the authorization endpoint.
   *
   * @returns A promise containing the authenticated `User`.
   * @throws `Error` In cases of wrong authentication.
   */
  async signinPopup(args = {}) {
    var _a6;
    const logger2 = this._logger.create("signinPopup");
    let dpopJkt;
    if ((_a6 = this.settings.dpop) == null ? void 0 : _a6.bind_authorization_code) {
      dpopJkt = await this.generateDPoPJkt(this.settings.dpop);
    }
    const {
      popupWindowFeatures,
      popupWindowTarget,
      popupSignal,
      popupAbortOnClose,
      ...requestArgs
    } = args;
    const url = this.settings.popup_redirect_uri;
    if (!url) {
      logger2.throw(new Error("No popup_redirect_uri configured"));
    }
    const handle = await this._popupNavigator.prepare({ popupWindowFeatures, popupWindowTarget, popupSignal, popupAbortOnClose });
    const user = await this._signin({
      request_type: "si:p",
      redirect_uri: url,
      display: "popup",
      dpopJkt,
      ...requestArgs
    }, handle);
    if (user) {
      if (user.profile && user.profile.sub) {
        logger2.info("success, signed in subject", user.profile.sub);
      } else {
        logger2.info("no subject");
      }
    }
    return user;
  }
  /**
   * Notify the opening window of response (callback) from the authorization endpoint.
   * It is recommended to use {@link UserManager.signinCallback} instead.
   *
   * @returns A promise
   *
   * @see {@link UserManager.signinCallback}
   */
  async signinPopupCallback(url = window.location.href, keepOpen = false) {
    const logger2 = this._logger.create("signinPopupCallback");
    await this._popupNavigator.callback(url, { keepOpen });
    logger2.info("success");
  }
  /**
   * Trigger a silent request (via refresh token or an iframe) to the authorization endpoint.
   *
   * @returns A promise that contains the authenticated `User`.
   */
  async signinSilent(args = {}) {
    var _a6, _b;
    const logger2 = this._logger.create("signinSilent");
    const {
      silentRequestTimeoutInSeconds,
      ...requestArgs
    } = args;
    let user = await this._loadUser();
    if (!args.forceIframeAuth && (user == null ? void 0 : user.refresh_token)) {
      logger2.debug("using refresh token");
      const state = new RefreshState(user);
      return await this._useRefreshToken({
        state,
        redirect_uri: requestArgs.redirect_uri,
        resource: requestArgs.resource,
        extraTokenParams: requestArgs.extraTokenParams,
        timeoutInSeconds: silentRequestTimeoutInSeconds
      });
    }
    let dpopJkt;
    if ((_a6 = this.settings.dpop) == null ? void 0 : _a6.bind_authorization_code) {
      dpopJkt = await this.generateDPoPJkt(this.settings.dpop);
    }
    const url = this.settings.silent_redirect_uri;
    if (!url) {
      logger2.throw(new Error("No silent_redirect_uri configured"));
    }
    let verifySub;
    if (user && this.settings.validateSubOnSilentRenew) {
      logger2.debug("subject prior to silent renew:", user.profile.sub);
      verifySub = user.profile.sub;
    }
    const handle = await this._iframeNavigator.prepare({ silentRequestTimeoutInSeconds });
    user = await this._signin({
      request_type: "si:s",
      redirect_uri: url,
      prompt: "none",
      id_token_hint: this.settings.includeIdTokenInSilentRenew ? user == null ? void 0 : user.id_token : void 0,
      dpopJkt,
      ...requestArgs
    }, handle, verifySub);
    if (user) {
      if ((_b = user.profile) == null ? void 0 : _b.sub) {
        logger2.info("success, signed in subject", user.profile.sub);
      } else {
        logger2.info("no subject");
      }
    }
    return user;
  }
  async _useRefreshToken(args) {
    const response = await this._client.useRefreshToken({
      timeoutInSeconds: this.settings.silentRequestTimeoutInSeconds,
      ...args
    });
    const user = new User({ ...args.state, ...response });
    await this.storeUser(user);
    await this._events.load(user);
    return user;
  }
  /**
   *
   * Notify the parent window of response (callback) from the authorization endpoint.
   * It is recommended to use {@link UserManager.signinCallback} instead.
   *
   * @returns A promise
   *
   * @see {@link UserManager.signinCallback}
   */
  async signinSilentCallback(url = window.location.href) {
    const logger2 = this._logger.create("signinSilentCallback");
    await this._iframeNavigator.callback(url);
    logger2.info("success");
  }
  /**
   * Process any response (callback) from the authorization endpoint, by dispatching the request_type
   * and executing one of the following functions:
   * - {@link UserManager.signinRedirectCallback}
   * - {@link UserManager.signinPopupCallback}
   * - {@link UserManager.signinSilentCallback}
   *
   * @throws `Error` If request_type is unknown or signin cannot be processed.
   */
  async signinCallback(url = window.location.href) {
    const { state } = await this._client.readSigninResponseState(url);
    switch (state.request_type) {
      case "si:r":
        return await this.signinRedirectCallback(url);
      case "si:p":
        await this.signinPopupCallback(url);
        break;
      case "si:s":
        await this.signinSilentCallback(url);
        break;
      default:
        throw new Error("invalid response_type in state");
    }
    return void 0;
  }
  /**
   * Process any response (callback) from the end session endpoint, by dispatching the request_type
   * and executing one of the following functions:
   * - {@link UserManager.signoutRedirectCallback}
   * - {@link UserManager.signoutPopupCallback}
   * - {@link UserManager.signoutSilentCallback}
   *
   * @throws `Error` If request_type is unknown or signout cannot be processed.
   */
  async signoutCallback(url = window.location.href, keepOpen = false) {
    const { state } = await this._client.readSignoutResponseState(url);
    if (!state) {
      return void 0;
    }
    switch (state.request_type) {
      case "so:r":
        return await this.signoutRedirectCallback(url);
      case "so:p":
        await this.signoutPopupCallback(url, keepOpen);
        break;
      case "so:s":
        await this.signoutSilentCallback(url);
        break;
      default:
        throw new Error("invalid response_type in state");
    }
    return void 0;
  }
  /**
   * Query OP for user's current signin status.
   *
   * @returns A promise object with session_state and subject identifier.
   */
  async querySessionStatus(args = {}) {
    const logger2 = this._logger.create("querySessionStatus");
    const {
      silentRequestTimeoutInSeconds,
      ...requestArgs
    } = args;
    const url = this.settings.silent_redirect_uri;
    if (!url) {
      logger2.throw(new Error("No silent_redirect_uri configured"));
    }
    const user = await this._loadUser();
    const handle = await this._iframeNavigator.prepare({ silentRequestTimeoutInSeconds });
    const navResponse = await this._signinStart({
      request_type: "si:s",
      // this acts like a signin silent
      redirect_uri: url,
      prompt: "none",
      id_token_hint: this.settings.includeIdTokenInSilentRenew ? user == null ? void 0 : user.id_token : void 0,
      response_type: this.settings.query_status_response_type,
      scope: "openid",
      skipUserInfo: true,
      ...requestArgs
    }, handle);
    try {
      const extraHeaders = {};
      const signinResponse = await this._client.processSigninResponse(navResponse.url, extraHeaders);
      logger2.debug("got signin response");
      if (signinResponse.session_state && signinResponse.profile.sub) {
        logger2.info("success for subject", signinResponse.profile.sub);
        return {
          session_state: signinResponse.session_state,
          sub: signinResponse.profile.sub
        };
      }
      logger2.info("success, user not authenticated");
      return null;
    } catch (err) {
      if (this.settings.monitorAnonymousSession && err instanceof ErrorResponse) {
        switch (err.error) {
          case "login_required":
          case "consent_required":
          case "interaction_required":
          case "account_selection_required":
            logger2.info("success for anonymous user");
            return {
              session_state: err.session_state
            };
        }
      }
      throw err;
    }
  }
  async _signin(args, handle, verifySub) {
    const navResponse = await this._signinStart(args, handle);
    return await this._signinEnd(navResponse.url, verifySub);
  }
  async _signinStart(args, handle) {
    const logger2 = this._logger.create("_signinStart");
    try {
      const signinRequest = await this._client.createSigninRequest(args);
      logger2.debug("got signin request");
      return await handle.navigate({
        url: signinRequest.url,
        state: signinRequest.state.id,
        response_mode: signinRequest.state.response_mode,
        scriptOrigin: this.settings.iframeScriptOrigin
      });
    } catch (err) {
      logger2.debug("error after preparing navigator, closing navigator window");
      handle.close();
      throw err;
    }
  }
  async _signinEnd(url, verifySub) {
    const logger2 = this._logger.create("_signinEnd");
    const extraHeaders = {};
    const signinResponse = await this._client.processSigninResponse(url, extraHeaders);
    logger2.debug("got signin response");
    const user = await this._buildUser(signinResponse, verifySub);
    return user;
  }
  async _buildUser(signinResponse, verifySub) {
    const logger2 = this._logger.create("_buildUser");
    const user = new User(signinResponse);
    if (verifySub) {
      if (verifySub !== user.profile.sub) {
        logger2.debug("current user does not match user returned from signin. sub from signin:", user.profile.sub);
        throw new ErrorResponse({ ...signinResponse, error: "login_required" });
      }
      logger2.debug("current user matches user returned from signin");
    }
    await this.storeUser(user);
    logger2.debug("user stored");
    await this._events.load(user);
    return user;
  }
  /**
   * Trigger a redirect of the current window to the end session endpoint.
   *
   * @returns A promise
   */
  async signoutRedirect(args = {}) {
    const logger2 = this._logger.create("signoutRedirect");
    const {
      redirectMethod,
      ...requestArgs
    } = args;
    const handle = await this._redirectNavigator.prepare({ redirectMethod });
    await this._signoutStart({
      request_type: "so:r",
      post_logout_redirect_uri: this.settings.post_logout_redirect_uri,
      ...requestArgs
    }, handle);
    logger2.info("success");
  }
  /**
   * Process response (callback) from the end session endpoint.
   * It is recommended to use {@link UserManager.signoutCallback} instead.
   *
   * @returns A promise containing signout response
   *
   * @see {@link UserManager.signoutCallback}
   */
  async signoutRedirectCallback(url = window.location.href) {
    const logger2 = this._logger.create("signoutRedirectCallback");
    const response = await this._signoutEnd(url);
    logger2.info("success");
    return response;
  }
  /**
   * Trigger a redirect of a popup window to the end session endpoint.
   *
   * @returns A promise
   */
  async signoutPopup(args = {}) {
    const logger2 = this._logger.create("signoutPopup");
    const {
      popupWindowFeatures,
      popupWindowTarget,
      popupSignal,
      ...requestArgs
    } = args;
    const url = this.settings.popup_post_logout_redirect_uri;
    const handle = await this._popupNavigator.prepare({ popupWindowFeatures, popupWindowTarget, popupSignal });
    await this._signout({
      request_type: "so:p",
      post_logout_redirect_uri: url,
      // we're putting a dummy entry in here because we
      // need a unique id from the state for notification
      // to the parent window, which is necessary if we
      // plan to return back to the client after signout
      // and so we can close the popup after signout
      state: url == null ? void 0 : {},
      ...requestArgs
    }, handle);
    logger2.info("success");
  }
  /**
   * Process response (callback) from the end session endpoint from a popup window.
   * It is recommended to use {@link UserManager.signoutCallback} instead.
   *
   * @returns A promise
   *
   * @see {@link UserManager.signoutCallback}
   */
  async signoutPopupCallback(url = window.location.href, keepOpen = false) {
    const logger2 = this._logger.create("signoutPopupCallback");
    await this._popupNavigator.callback(url, { keepOpen });
    logger2.info("success");
  }
  async _signout(args, handle) {
    const navResponse = await this._signoutStart(args, handle);
    return await this._signoutEnd(navResponse.url);
  }
  async _signoutStart(args = {}, handle) {
    var _a6;
    const logger2 = this._logger.create("_signoutStart");
    try {
      const user = await this._loadUser();
      logger2.debug("loaded current user from storage");
      if (this.settings.revokeTokensOnSignout) {
        await this._revokeInternal(user);
      }
      const id_token = args.id_token_hint || user && user.id_token;
      if (id_token) {
        logger2.debug("setting id_token_hint in signout request");
        args.id_token_hint = id_token;
      }
      await this.removeUser();
      logger2.debug("user removed, creating signout request");
      const signoutRequest = await this._client.createSignoutRequest(args);
      logger2.debug("got signout request");
      return await handle.navigate({
        url: signoutRequest.url,
        state: (_a6 = signoutRequest.state) == null ? void 0 : _a6.id,
        scriptOrigin: this.settings.iframeScriptOrigin
      });
    } catch (err) {
      logger2.debug("error after preparing navigator, closing navigator window");
      handle.close();
      throw err;
    }
  }
  async _signoutEnd(url) {
    const logger2 = this._logger.create("_signoutEnd");
    const signoutResponse = await this._client.processSignoutResponse(url);
    logger2.debug("got signout response");
    return signoutResponse;
  }
  /**
   * Trigger a silent request (via an iframe) to the end session endpoint.
   *
   * @returns A promise
   */
  async signoutSilent(args = {}) {
    var _a6;
    const logger2 = this._logger.create("signoutSilent");
    const {
      silentRequestTimeoutInSeconds,
      ...requestArgs
    } = args;
    const id_token_hint = this.settings.includeIdTokenInSilentSignout ? (_a6 = await this._loadUser()) == null ? void 0 : _a6.id_token : void 0;
    const url = this.settings.popup_post_logout_redirect_uri;
    const handle = await this._iframeNavigator.prepare({ silentRequestTimeoutInSeconds });
    await this._signout({
      request_type: "so:s",
      post_logout_redirect_uri: url,
      id_token_hint,
      ...requestArgs
    }, handle);
    logger2.info("success");
  }
  /**
   * Notify the parent window of response (callback) from the end session endpoint.
   * It is recommended to use {@link UserManager.signoutCallback} instead.
   *
   * @returns A promise
   *
   * @see {@link UserManager.signoutCallback}
   */
  async signoutSilentCallback(url = window.location.href) {
    const logger2 = this._logger.create("signoutSilentCallback");
    await this._iframeNavigator.callback(url);
    logger2.info("success");
  }
  async revokeTokens(types) {
    const user = await this._loadUser();
    await this._revokeInternal(user, types);
  }
  async _revokeInternal(user, types = this.settings.revokeTokenTypes) {
    const logger2 = this._logger.create("_revokeInternal");
    if (!user) return;
    const typesPresent = types.filter((type) => typeof user[type] === "string");
    if (!typesPresent.length) {
      logger2.debug("no need to revoke due to no token(s)");
      return;
    }
    for (const type of typesPresent) {
      await this._client.revokeToken(
        user[type],
        type
      );
      logger2.info(`${type} revoked successfully`);
      if (type !== "access_token") {
        user[type] = null;
      }
    }
    await this.storeUser(user);
    logger2.debug("user stored");
    await this._events.load(user);
  }
  /**
   * Enables silent renew for the `UserManager`.
   */
  startSilentRenew() {
    this._logger.create("startSilentRenew");
    void this._silentRenewService.start();
  }
  /**
   * Disables silent renew for the `UserManager`.
   */
  stopSilentRenew() {
    this._silentRenewService.stop();
  }
  get _userStoreKey() {
    return `user:${this.settings.authority}:${this.settings.client_id}`;
  }
  async _loadUser() {
    const logger2 = this._logger.create("_loadUser");
    const storageString = await this.settings.userStore.get(this._userStoreKey);
    if (storageString) {
      logger2.debug("user storageString loaded");
      return User.fromStorageString(storageString);
    }
    logger2.debug("no user storageString");
    return null;
  }
  async storeUser(user) {
    const logger2 = this._logger.create("storeUser");
    if (user) {
      logger2.debug("storing user");
      const storageString = user.toStorageString();
      await this.settings.userStore.set(this._userStoreKey, storageString);
    } else {
      this._logger.debug("removing user");
      await this.settings.userStore.remove(this._userStoreKey);
      if (this.settings.dpop) {
        await this.settings.dpop.store.remove(this.settings.client_id);
      }
    }
  }
  /**
   * Removes stale state entries in storage for incomplete authorize requests.
   */
  async clearStaleState() {
    await this._client.clearStaleState();
  }
  /**
   * Dynamically generates a DPoP proof for a given user, URL and optional Http method.
   * This method is useful when you need to make a request to a resource server
   * with fetch or similar, and you need to include a DPoP proof in a DPoP header.
   * @param url - The URL to generate the DPoP proof for
   * @param user - The user to generate the DPoP proof for
   * @param httpMethod - Optional, defaults to "GET"
   * @param nonce - Optional nonce provided by the resource server
   *
   * @returns A promise containing the DPoP proof or undefined if DPoP is not enabled/no user is found.
   */
  async dpopProof(url, user, httpMethod, nonce) {
    var _a6, _b;
    const dpopState = await ((_b = (_a6 = this.settings.dpop) == null ? void 0 : _a6.store) == null ? void 0 : _b.get(this.settings.client_id));
    if (dpopState) {
      return await CryptoUtils.generateDPoPProof({
        url,
        accessToken: user == null ? void 0 : user.access_token,
        httpMethod,
        keyPair: dpopState.keys,
        nonce
      });
    }
    return void 0;
  }
  async generateDPoPJkt(dpopSettings) {
    let dpopState = await dpopSettings.store.get(this.settings.client_id);
    if (!dpopState) {
      const dpopKeys = await CryptoUtils.generateDPoPKeys();
      dpopState = new DPoPState(dpopKeys);
      await dpopSettings.store.set(this.settings.client_id, dpopState);
    }
    return await CryptoUtils.generateDPoPJkt(dpopState.keys);
  }
};

// node_modules/@imtbl/auth/dist/browser/index.js
var import_localforage = __toESM(require_localforage(), 1);

// node_modules/tiny-lru/dist/tiny-lru.js
var LRU = class {
  /**
   * Creates a new LRU cache instance.
   * Note: Constructor does not validate parameters. Use lru() factory function for parameter validation.
   *
   * @constructor
   * @param {number} [max=0] - Maximum number of items to store. 0 means unlimited.
   * @param {number} [ttl=0] - Time to live in milliseconds. 0 means no expiration.
   * @param {boolean} [resetTtl=false] - Whether to reset TTL when accessing existing items via get().
   * @example
   * const cache = new LRU(1000, 60000, true); // 1000 items, 1 minute TTL, reset on access
   * @see {@link lru} For parameter validation
   * @since 1.0.0
   */
  constructor(max = 0, ttl = 0, resetTtl = false) {
    this.first = null;
    this.items = /* @__PURE__ */ Object.create(null);
    this.last = null;
    this.max = max;
    this.resetTtl = resetTtl;
    this.size = 0;
    this.ttl = ttl;
  }
  /**
   * Removes all items from the cache.
   *
   * @method clear
   * @memberof LRU
   * @returns {LRU} The LRU instance for method chaining.
   * @example
   * cache.clear();
   * console.log(cache.size); // 0
   * @since 1.0.0
   */
  clear() {
    this.first = null;
    this.items = /* @__PURE__ */ Object.create(null);
    this.last = null;
    this.size = 0;
    return this;
  }
  /**
   * Removes an item from the cache by key.
   *
   * @method delete
   * @memberof LRU
   * @param {string} key - The key of the item to delete.
   * @returns {LRU} The LRU instance for method chaining.
   * @example
   * cache.set('key1', 'value1');
   * cache.delete('key1');
   * console.log(cache.has('key1')); // false
   * @see {@link LRU#has}
   * @see {@link LRU#clear}
   * @since 1.0.0
   */
  delete(key) {
    if (this.has(key)) {
      const item = this.items[key];
      delete this.items[key];
      this.size--;
      if (item.prev !== null) {
        item.prev.next = item.next;
      }
      if (item.next !== null) {
        item.next.prev = item.prev;
      }
      if (this.first === item) {
        this.first = item.next;
      }
      if (this.last === item) {
        this.last = item.prev;
      }
    }
    return this;
  }
  /**
   * Returns an array of [key, value] pairs for the specified keys.
   * Order follows LRU order (least to most recently used).
   *
   * @method entries
   * @memberof LRU
   * @param {string[]} [keys=this.keys()] - Array of keys to get entries for. Defaults to all keys.
   * @returns {Array<Array<*>>} Array of [key, value] pairs in LRU order.
   * @example
   * cache.set('a', 1).set('b', 2);
   * console.log(cache.entries()); // [['a', 1], ['b', 2]]
   * console.log(cache.entries(['a'])); // [['a', 1]]
   * @see {@link LRU#keys}
   * @see {@link LRU#values}
   * @since 11.1.0
   */
  entries(keys = this.keys()) {
    const result = new Array(keys.length);
    for (let i3 = 0; i3 < keys.length; i3++) {
      const key = keys[i3];
      result[i3] = [key, this.get(key)];
    }
    return result;
  }
  /**
   * Removes the least recently used item from the cache.
   *
   * @method evict
   * @memberof LRU
   * @param {boolean} [bypass=false] - Whether to force eviction even when cache is empty.
   * @returns {LRU} The LRU instance for method chaining.
   * @example
   * cache.set('old', 'value').set('new', 'value');
   * cache.evict(); // Removes 'old' item
   * @see {@link LRU#setWithEvicted}
   * @since 1.0.0
   */
  evict(bypass = false) {
    if (bypass || this.size > 0) {
      const item = this.first;
      delete this.items[item.key];
      if (--this.size === 0) {
        this.first = null;
        this.last = null;
      } else {
        this.first = item.next;
        this.first.prev = null;
      }
    }
    return this;
  }
  /**
   * Returns the expiration timestamp for a given key.
   *
   * @method expiresAt
   * @memberof LRU
   * @param {string} key - The key to check expiration for.
   * @returns {number|undefined} The expiration timestamp in milliseconds, or undefined if key doesn't exist.
   * @example
   * const cache = new LRU(100, 5000); // 5 second TTL
   * cache.set('key1', 'value1');
   * console.log(cache.expiresAt('key1')); // timestamp 5 seconds from now
   * @see {@link LRU#get}
   * @see {@link LRU#has}
   * @since 1.0.0
   */
  expiresAt(key) {
    let result;
    if (this.has(key)) {
      result = this.items[key].expiry;
    }
    return result;
  }
  /**
   * Retrieves a value from the cache by key. Updates the item's position to most recently used.
   *
   * @method get
   * @memberof LRU
   * @param {string} key - The key to retrieve.
   * @returns {*} The value associated with the key, or undefined if not found or expired.
   * @example
   * cache.set('key1', 'value1');
   * console.log(cache.get('key1')); // 'value1'
   * console.log(cache.get('nonexistent')); // undefined
   * @see {@link LRU#set}
   * @see {@link LRU#has}
   * @since 1.0.0
   */
  get(key) {
    const item = this.items[key];
    if (item !== void 0) {
      if (this.ttl > 0) {
        if (item.expiry <= Date.now()) {
          this.delete(key);
          return void 0;
        }
      }
      this.moveToEnd(item);
      return item.value;
    }
    return void 0;
  }
  /**
   * Checks if a key exists in the cache.
   *
   * @method has
   * @memberof LRU
   * @param {string} key - The key to check for.
   * @returns {boolean} True if the key exists, false otherwise.
   * @example
   * cache.set('key1', 'value1');
   * console.log(cache.has('key1')); // true
   * console.log(cache.has('nonexistent')); // false
   * @see {@link LRU#get}
   * @see {@link LRU#delete}
   * @since 9.0.0
   */
  has(key) {
    return key in this.items;
  }
  /**
   * Efficiently moves an item to the end of the LRU list (most recently used position).
   * This is an internal optimization method that avoids the overhead of the full set() operation
   * when only LRU position needs to be updated.
   *
   * @method moveToEnd
   * @memberof LRU
   * @param {Object} item - The cache item with prev/next pointers to reposition.
   * @private
   * @since 11.3.5
   */
  moveToEnd(item) {
    if (this.last === item) {
      return;
    }
    if (item.prev !== null) {
      item.prev.next = item.next;
    }
    if (item.next !== null) {
      item.next.prev = item.prev;
    }
    if (this.first === item) {
      this.first = item.next;
    }
    item.prev = this.last;
    item.next = null;
    if (this.last !== null) {
      this.last.next = item;
    }
    this.last = item;
    if (this.first === null) {
      this.first = item;
    }
  }
  /**
   * Returns an array of all keys in the cache, ordered from least to most recently used.
   *
   * @method keys
   * @memberof LRU
   * @returns {string[]} Array of keys in LRU order.
   * @example
   * cache.set('a', 1).set('b', 2);
   * cache.get('a'); // Move 'a' to most recent
   * console.log(cache.keys()); // ['b', 'a']
   * @see {@link LRU#values}
   * @see {@link LRU#entries}
   * @since 9.0.0
   */
  keys() {
    const result = new Array(this.size);
    let x4 = this.first;
    let i3 = 0;
    while (x4 !== null) {
      result[i3++] = x4.key;
      x4 = x4.next;
    }
    return result;
  }
  /**
   * Sets a value in the cache and returns any evicted item.
   *
   * @method setWithEvicted
   * @memberof LRU
   * @param {string} key - The key to set.
   * @param {*} value - The value to store.
   * @param {boolean} [resetTtl=this.resetTtl] - Whether to reset the TTL for this operation.
   * @returns {Object|null} The evicted item (if any) with shape {key, value, expiry, prev, next}, or null.
   * @example
   * const cache = new LRU(2);
   * cache.set('a', 1).set('b', 2);
   * const evicted = cache.setWithEvicted('c', 3); // evicted = {key: 'a', value: 1, ...}
   * @see {@link LRU#set}
   * @see {@link LRU#evict}
   * @since 11.3.0
   */
  setWithEvicted(key, value, resetTtl = this.resetTtl) {
    let evicted = null;
    if (this.has(key)) {
      this.set(key, value, true, resetTtl);
    } else {
      if (this.max > 0 && this.size === this.max) {
        evicted = { ...this.first };
        this.evict(true);
      }
      let item = this.items[key] = {
        expiry: this.ttl > 0 ? Date.now() + this.ttl : this.ttl,
        key,
        prev: this.last,
        next: null,
        value
      };
      if (++this.size === 1) {
        this.first = item;
      } else {
        this.last.next = item;
      }
      this.last = item;
    }
    return evicted;
  }
  /**
   * Sets a value in the cache. Updates the item's position to most recently used.
   *
   * @method set
   * @memberof LRU
   * @param {string} key - The key to set.
   * @param {*} value - The value to store.
   * @param {boolean} [bypass=false] - Internal parameter for setWithEvicted method.
   * @param {boolean} [resetTtl=this.resetTtl] - Whether to reset the TTL for this operation.
   * @returns {LRU} The LRU instance for method chaining.
   * @example
   * cache.set('key1', 'value1')
   *      .set('key2', 'value2')
   *      .set('key3', 'value3');
   * @see {@link LRU#get}
   * @see {@link LRU#setWithEvicted}
   * @since 1.0.0
   */
  set(key, value, bypass = false, resetTtl = this.resetTtl) {
    let item = this.items[key];
    if (bypass || item !== void 0) {
      item.value = value;
      if (bypass === false && resetTtl) {
        item.expiry = this.ttl > 0 ? Date.now() + this.ttl : this.ttl;
      }
      this.moveToEnd(item);
    } else {
      if (this.max > 0 && this.size === this.max) {
        this.evict(true);
      }
      item = this.items[key] = {
        expiry: this.ttl > 0 ? Date.now() + this.ttl : this.ttl,
        key,
        prev: this.last,
        next: null,
        value
      };
      if (++this.size === 1) {
        this.first = item;
      } else {
        this.last.next = item;
      }
      this.last = item;
    }
    return this;
  }
  /**
   * Returns an array of all values in the cache for the specified keys.
   * Order follows LRU order (least to most recently used).
   *
   * @method values
   * @memberof LRU
   * @param {string[]} [keys=this.keys()] - Array of keys to get values for. Defaults to all keys.
   * @returns {Array<*>} Array of values corresponding to the keys in LRU order.
   * @example
   * cache.set('a', 1).set('b', 2);
   * console.log(cache.values()); // [1, 2]
   * console.log(cache.values(['a'])); // [1]
   * @see {@link LRU#keys}
   * @see {@link LRU#entries}
   * @since 11.1.0
   */
  values(keys = this.keys()) {
    const result = new Array(keys.length);
    for (let i3 = 0; i3 < keys.length; i3++) {
      result[i3] = this.get(keys[i3]);
    }
    return result;
  }
};
function lru(max = 1e3, ttl = 0, resetTtl = false) {
  if (isNaN(max) || max < 0) {
    throw new TypeError("Invalid max value");
  }
  if (isNaN(ttl) || ttl < 0) {
    throw new TypeError("Invalid ttl value");
  }
  if (typeof resetTtl !== "boolean") {
    throw new TypeError("Invalid resetTtl value");
  }
  return new LRU(max, ttl, resetTtl);
}

// node_modules/lru-memorise/dist/lib.js
var defaultLRUOptions = {
  max: 1e3
};
var memorise = (cachedFn, options = {}) => {
  const { cache, cacheKeyResolver = defaultGenCacheKey, onHit, lruOptions = {} } = options;
  const cacheOptions = { ...defaultLRUOptions, ...lruOptions };
  const _cache = cache || lru(cacheOptions.max, cacheOptions.ttl);
  function returnFn(...args) {
    const cacheKey2 = cacheKeyResolver(...args);
    const cachedValue = _cache.get(cacheKey2);
    const keyCached = _cache.has(cacheKey2);
    if (keyCached) {
      if (onHit) {
        onHit(cacheKey2, cachedValue, _cache);
      }
      return cachedValue;
    }
    const result = cachedFn.apply(this, args);
    _cache.set(cacheKey2, result);
    return result;
  }
  returnFn._cache = _cache;
  return returnFn;
};
var defaultGenCacheKey = (...args) => {
  if (args.length === 0) {
    return "no-args";
  }
  return args.map((val) => {
    if (val === void 0) {
      return "undefined";
    }
    if (val === null) {
      return "null";
    }
    if (Array.isArray(val)) {
      return `[${defaultGenCacheKey(...val)}]`;
    }
    if (typeof val === "object") {
      return `{${defaultGenCacheKey(...sortedObjectEntries(val))}}`;
    }
    return JSON.stringify(val);
  }).join(",");
};
var sortedObjectEntries = (obj) => {
  return Object.entries(obj).sort((a3, b4) => {
    if (a3[0] < b4[0]) {
      return -1;
    }
    return 1;
  });
};

// node_modules/@imtbl/metrics/dist/browser/index.js
var import_global_const = __toESM(require_lib(), 1);
var n = Object.defineProperty;
var r = (e3, t3) => {
  let r3 = {};
  for (var i3 in e3) n(r3, i3, { get: e3[i3], enumerable: true });
  return t3 || n(r3, Symbol.toStringTag, { value: `Module` }), r3;
};
var i = () => typeof window > `u`;
var a = () => !i();
var o = r({ deleteItem: () => p, getItem: () => d, setItem: () => f });
var s = () => a() && window.localStorage;
var c = (e3) => {
  if (e3 !== null) try {
    return JSON.parse(e3);
  } catch {
    return e3;
  }
};
var l = (e3) => typeof e3 == `string` ? e3 : JSON.stringify(e3);
var u = (e3) => `__IMX-${e3}`;
function d(e3) {
  if (s()) return c(window.localStorage.getItem(u(e3)));
}
var f = (e3, t3) => s() ? (window.localStorage.setItem(u(e3), l(t3)), true) : false;
var p = (e3) => s() ? (window.localStorage.removeItem(u(e3)), true) : false;
var m = 0;
var h = (e3) => {
  let t3 = parseInt(e3, 10) * 1e3, n3 = new Date(t3), r3 = /* @__PURE__ */ new Date();
  return m = n3.getTime() - r3.getTime(), m;
};
var g = () => {
  let e3 = (/* @__PURE__ */ new Date()).getTime() + m;
  return new Date(e3).toISOString();
};
var _ = function(e3) {
  return e3.RUNTIME_ID = `rid`, e3.PASSPORT_CLIENT_ID = `passportClientId`, e3.ENVIRONMENT = `env`, e3.PUBLISHABLE_API_KEY = `pak`, e3.IDENTITY = `uid`, e3.DOMAIN = `domain`, e3.SDK_VERSION = `sdkVersion`, e3;
}({});
var v = (e3) => {
  if (typeof Buffer < `u`) return Buffer.from(e3, `utf-8`).toString(`base64`);
  if (typeof btoa == `function`) return btoa(unescape(encodeURIComponent(e3)));
  throw Error(`Base64 encoding not supported in this environment`);
};
async function y(e3, t3) {
  let n3 = JSON.stringify(t3), r3 = { payload: v(n3) }, i3 = await fetch(`https://api.immutable.com${e3}`, { method: `POST`, headers: { "Content-Type": `application/json` }, body: JSON.stringify(r3) });
  if (!i3.ok) {
    let e4 = await i3.text().catch(() => ``);
    throw Error(`Request failed (${i3.status}): ${e4 || i3.statusText}`);
  }
  return i3.json();
}
var b;
var x;
b = d(`metrics-events`) || [], x = d(`metrics-runtime`) || {};
var S = (e3, t3) => {
  x = { ...x, [e3]: t3 }, f(`metrics-runtime`, x);
};
var C = (e3) => {
  if (x[e3] !== void 0) return x[e3];
};
var w = () => x;
var T = () => b;
var E = (e3) => {
  b.push(e3), f(`metrics-events`, b);
};
var D = (e3) => {
  b = b.slice(e3), f(`metrics-events`, b);
};
var O = (e3) => {
  let t3 = [];
  return Object.entries(e3).forEach(([e4, n3]) => {
    (typeof e4 == `string` || typeof n3 == `string` || typeof n3 == `number` || typeof n3 == `boolean`) && t3.push([e4, n3.toString()]);
  }), t3;
};
var k = `2.24.6`;
var A = () => i() ? `` : window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0 ? new URL(window.location.ancestorOrigins[0]).hostname : document.referrer ? new URL(window.document.referrer).hostname : ``;
var j = () => {
  if (i()) return ``;
  let e3;
  try {
    window.self !== window.top && (e3 = A());
  } catch {
  }
  return e3 || (e3 = window.location.hostname), e3;
};
var M = () => {
  if (S(`sdkVersion`, k), i()) return { browser: `nodejs`, sdkVersion: k };
  let e3 = j();
  return e3 && S(`domain`, e3), { sdkVersion: k, browser: window.navigator.userAgent, domain: e3, tz: Intl.DateTimeFormat().resolvedOptions().timeZone, screen: `${window.screen.width}x${window.screen.height}` };
};
var N = false;
var P = () => N;
var F = async () => {
  N = true;
  try {
    let { runtimeId: e3, sTime: t3 } = await y(`/v1/sdk/initialise`, { version: 1, data: { runtimeDetails: O(M()), runtimeId: C(`rid`), uId: C(`uid`) } });
    S(`rid`, e3), h(t3);
  } catch {
    N = false;
  }
};
function I(e3, t3) {
  return (...n3) => {
    try {
      let r3 = e3(...n3);
      return r3 instanceof Promise ? r3.catch(() => t3) : r3;
    } catch {
      return t3;
    }
  };
}
function L() {
  return a() || typeof process > `u` ? false : process.env.JEST_WORKER_ID !== void 0;
}
var R = I(L, false);
var z = `imtbl__metrics`;
var B = (e3, n3) => (0, import_global_const.getGlobalisedValue)(z, e3, n3);
var V = I(((n3, r3) => {
  let i3 = memorise(r3, { lruOptions: { ttl: 5e3, max: 1e3 } });
  return (0, import_global_const.getGlobalisedValue)(z, n3, i3);
})(`track`, (e3, t3, n3) => {
  E({ event: `${e3}.${t3}`, time: g(), ...n3 && { properties: O(n3) } });
}));
var H = I(async () => {
  if (P() === false) {
    await F();
    return;
  }
  let e3 = T();
  if (e3.length === 0) return;
  let t3 = e3.length;
  await y(`/v1/sdk/metrics`, { version: 1, data: { events: e3, details: w() } }) instanceof Error || D(t3);
});
var U = async () => {
  await H(), setTimeout(U, 5e3);
};
var W = false;
R() || I(B(`startFlushing`, () => {
  W || (W = true, U());
}))();
var G = (e3, t3, n3, r3) => V(e3, t3, { ...r3 || {}, duration: Math.round(n3) });
var K = () => {
  let e3 = () => Math.floor((1 + Math.random()) * 65536).toString(16).substring(1);
  return `${e3()}${e3()}-${e3()}-${e3()}-${e3()}-${e3()}${e3()}${e3()}`;
};
var q = (...e3) => {
  if (!e3.some((e4) => !!e4)) return {};
  let t3 = {};
  return e3.forEach((e4) => {
    e4 && (t3 = { ...t3, ...e4 });
  }), t3;
};
var J = (e3) => e3.replace(/[^a-zA-Z0-9\s\-_]/g, ``);
var Y = (e3, t3) => `${e3}_${J(t3)}`;
var X = I((e3, t3, n3 = true, r3) => {
  let i3 = K(), a3 = Date.now(), o4 = 0, s3 = 0, c3 = {}, l3 = (...e4) => q(c3, ...e4, { flowId: i3, flowName: t3 });
  c3 = l3(r3);
  let u3 = (e4) => {
    e4 && (c3 = l3(e4));
  }, d3 = (n4, r4) => {
    let i4 = Y(t3, n4), a4 = 0, c4 = performance.now();
    o4 > 0 && (a4 = c4 - s3);
    let u4 = l3(r4, { flowEventName: n4, flowStep: o4 });
    G(e3, i4, a4, u4), o4++, s3 = c4;
  };
  return n3 && d3(`Start`), { details: { moduleName: e3, flowName: t3, flowId: i3, flowStartTime: a3 }, addEvent: I(d3), addFlowProperties: I(u3) };
});
var Z = I((e3, t3, n3, r3) => {
  let { message: i3 } = n3, a3 = n3.stack || ``, { cause: o4 } = n3;
  o4 instanceof Error && (a3 = `${a3} 
Cause: ${o4.message}
 ${o4.stack}`), V(e3, `trackError_${t3}`, { ...r3 || {}, errorMessage: i3, errorStack: a3, isTrackError: true });
});
var Q = (e3) => {
  if (e3.passportId) return `passport:${e3.passportId.toLowerCase()}`;
  if (e3.ethAddress) return `ethAddress:${e3.ethAddress.toLowerCase()}`;
  throw Error(`invalid_identity`);
};
var $ = I((e3) => {
  let t3 = Q(e3);
  t3 && (S(`uid`, t3), V(`metrics`, `identify`, e3.traits));
});
var ee = I(B(`setEnvironment`, (e3) => {
  S(`env`, e3);
}));
var te = I(B(`setPassportClientId`, (e3) => {
  S(`passportClientId`, e3);
}));
var ne = I(B(`setPublishableApiKey`, (e3) => {
  S(`pak`, e3);
}));
var re = I(B(`getDetail`, C));
var ie = { localStorage: o };

// node_modules/@imtbl/auth/dist/browser/index.js
var p2 = function(e3) {
  return e3.AUTHENTICATION_ERROR = `AUTHENTICATION_ERROR`, e3.INVALID_CONFIGURATION = `INVALID_CONFIGURATION`, e3.WALLET_CONNECTION_ERROR = `WALLET_CONNECTION_ERROR`, e3.NOT_LOGGED_IN_ERROR = `NOT_LOGGED_IN_ERROR`, e3.SILENT_LOGIN_ERROR = `SILENT_LOGIN_ERROR`, e3.REFRESH_TOKEN_ERROR = `REFRESH_TOKEN_ERROR`, e3.USER_REGISTRATION_ERROR = `USER_REGISTRATION_ERROR`, e3.USER_NOT_REGISTERED_ERROR = `USER_NOT_REGISTERED_ERROR`, e3.LOGOUT_ERROR = `LOGOUT_ERROR`, e3.TRANSFER_ERROR = `TRANSFER_ERROR`, e3.CREATE_ORDER_ERROR = `CREATE_ORDER_ERROR`, e3.CANCEL_ORDER_ERROR = `CANCEL_ORDER_ERROR`, e3.EXCHANGE_TRANSFER_ERROR = `EXCHANGE_TRANSFER_ERROR`, e3.CREATE_TRADE_ERROR = `CREATE_TRADE_ERROR`, e3.OPERATION_NOT_SUPPORTED_ERROR = `OPERATION_NOT_SUPPORTED_ERROR`, e3.LINK_WALLET_ALREADY_LINKED_ERROR = `LINK_WALLET_ALREADY_LINKED_ERROR`, e3.LINK_WALLET_MAX_WALLETS_LINKED_ERROR = `LINK_WALLET_MAX_WALLETS_LINKED_ERROR`, e3.LINK_WALLET_VALIDATION_ERROR = `LINK_WALLET_VALIDATION_ERROR`, e3.LINK_WALLET_DUPLICATE_NONCE_ERROR = `LINK_WALLET_DUPLICATE_NONCE_ERROR`, e3.LINK_WALLET_GENERIC_ERROR = `LINK_WALLET_GENERIC_ERROR`, e3.SERVICE_UNAVAILABLE_ERROR = `SERVICE_UNAVAILABLE_ERROR`, e3.TRANSACTION_REJECTED = `TRANSACTION_REJECTED`, e3;
}({});
function m2(e3) {
  return typeof e3 == `object` && !!e3 && `code` in e3 && `message` in e3;
}
var h2 = (e3) => {
  if (m2(e3)) return e3;
  if (typeof e3 == `object` && e3 && `response` in e3) {
    let { response: t3 } = e3;
    if (t3?.data && m2(t3.data)) return t3.data;
  }
};
var ee2 = (e3, t3) => {
  let n3 = t3, r3 = n3?.response?.status, i3 = n3?.config?.url, a3 = n3?.config?.baseURL, o4 = typeof i3 == `string` && typeof a3 == `string` && !/^https?:\/\//i.test(i3) ? `${a3}${i3}` : i3;
  return r3 == null && o4 == null || e3.includes(`[httpStatus=`) ? e3 : `${e3} [httpStatus=${r3 ?? `unknown`} url=${o4 ?? `unknown`}]`;
};
var g2 = class extends Error {
  constructor(e3, t3) {
    super(e3);
    __publicField(this, "type");
    this.type = t3;
  }
};
var _2 = async (e3, t3) => {
  try {
    return await e3();
  } catch (e4) {
    let n3;
    if (e4 instanceof g2 && e4.type === `SERVICE_UNAVAILABLE_ERROR`) throw new g2(e4.message, e4.type);
    let r3 = h2(e4);
    throw n3 = r3 ? r3.message : e4.message, t3 === `USER_REGISTRATION_ERROR` && (n3 = ee2(n3, e4)), new g2(n3, t3);
  }
};
var te2 = (e3, t3, n3) => {
  let r3 = t3.map((t4) => !e3[t4] && t4).filter((e4) => e4).join(`, `);
  if (r3 !== ``) throw new g2(n3 ? `${n3} - ${r3} cannot be null` : `${r3} cannot be null`, `INVALID_CONFIGURATION`);
};
var v2 = class {
  constructor({ authenticationDomain: e3, passportDomain: t3, crossSdkBridgeEnabled: n3, popupOverlayOptions: r3, ...i3 }) {
    __publicField(this, "authenticationDomain");
    __publicField(this, "passportDomain");
    __publicField(this, "oidcConfiguration");
    __publicField(this, "crossSdkBridgeEnabled");
    __publicField(this, "popupOverlayOptions");
    te2(i3, [`clientId`, `redirectUri`]), this.oidcConfiguration = i3, this.crossSdkBridgeEnabled = n3 || false, this.popupOverlayOptions = r3, this.authenticationDomain = e3 || `https://auth.immutable.com`, this.passportDomain = t3 || `https://passport.immutable.com`;
  }
};
var ne2 = function(e3) {
  return e3.ZKEVM = `zkEvm`, e3;
}({});
var y2 = (e3) => !!e3.zkEvm;
var re2 = function(e3) {
  return e3.OptedIn = `opted_in`, e3.Unsubscribed = `unsubscribed`, e3.Subscribed = `subscribed`, e3;
}({});
var ie2 = function(e3) {
  return e3.LOGGED_OUT = `loggedOut`, e3.LOGGED_IN = `loggedIn`, e3.TOKEN_REFRESHED = `tokenRefreshed`, e3.USER_REMOVED = `userRemoved`, e3;
}({});
var b2 = `passport-overlay`;
var x2 = `passport-overlay-contents`;
var S2 = `${b2}-close`;
var C2 = `${b2}-try-again`;
var w2 = `
  <svg
    style="
      max-width: 123px !important;
      margin-bottom: 24px !important;
    "
    viewBox="0 0 124 112"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_332_47939)">
      <g clip-path="url(#clip1_332_47939)">
        <path
          d="M4.10008 74.9453H0.5V93.6041H4.10008V74.9453Z"
          fill="#F3F3F3"
        />
        <path
          d="M22.9585 80.0212C21.1727 80.0212 19.5283 80.7622 18.5505 82.3115C17.8209 80.8013 16.3595 80.0212 14.4691 80.0212C12.864 80.0212 11.3786 80.7231 10.4792 82.1681V80.282H7.00976V93.6063H10.4792V86.2032C10.4792 84.3432 11.7445 82.9503 13.3475 82.9503H13.5565C14.9787 82.9503 15.643 83.8477 15.643 85.6187V93.6085H19.1124V86.2054C19.1124 84.3453 20.3647 82.9525 21.9676 82.9525H22.1767C23.5989 82.9525 24.237 83.8499 24.237 85.6208V93.6106H27.7064V85.2188C27.7064 83.6435 27.3274 82.3832 26.5717 81.4315C25.8029 80.4949 24.6029 80.0256 22.9585 80.0256V80.0212Z"
          fill="#F3F3F3"
        />
        <path
          d="M46.0291 80.0212C44.2432 80.0212 42.5989 80.7622 41.621 82.3115C40.8914 80.8013 39.43 80.0212 37.5396 80.0212C35.9345 80.0212 34.4492 80.7231 33.5497 82.1681V80.282H30.0803V93.6063H33.5497V86.2032C33.5497 84.3432 34.8151 82.9503 36.418 82.9503H36.6271C38.0493 82.9503 38.7135 83.8477 38.7135 85.6187V93.6085H42.1829V86.2054C42.1829 84.3453 43.4352 82.9525 45.0381 82.9525H45.2472C46.6694 82.9525 47.3075 83.8499 47.3075 85.6208V93.6106H50.7769V85.2188C50.7769 83.6435 50.398 82.3832 49.6422 81.4315C48.8734 80.4949 47.6734 80.0256 46.0291 80.0256V80.0212Z"
          fill="#F3F3F3"
        />
        <path
          d="M72.3077 89.2061V83.0785H75.2936V80.282H72.3077V75.9622H68.8383V80.282H61.4312V87.6851C61.4312 89.5451 60.192 91.0683 58.6805 91.0683H58.4715C57.2061 91.0683 56.4896 90.1318 56.4896 88.413V80.282H53.0202V88.8041C53.0202 90.3534 53.3991 91.5746 54.1549 92.4872C54.8975 93.4107 56.0322 93.867 57.5328 93.867C59.188 93.867 60.6102 93.0218 61.4312 91.655V93.6063H64.9006V83.0807H68.8405V90.1448C68.8405 92.396 70.0536 93.6063 72.3099 93.6063H75.7009V90.6794H73.7843C72.5582 90.6794 72.3099 90.4317 72.3099 89.2083L72.3077 89.2061Z"
          fill="#F3F3F3"
        />
        <path
          d="M88.0757 84.8082C88.0757 81.7378 85.8325 80.0191 82.4676 80.0191C79.1027 80.0191 77.0033 81.8791 76.7158 84.404H80.1982C80.2766 83.5979 81.0977 82.8156 82.35 82.8156H82.5722C83.8506 82.8156 84.7109 83.7391 84.7109 84.9364V85.2623L81.346 85.5622C79.9108 85.6795 78.7369 86.0945 77.8243 86.8246C76.9118 87.5525 76.4544 88.5934 76.4544 89.9471C76.4152 92.2895 78.4363 93.8888 80.8364 93.8627C82.5438 93.8627 83.9529 93.1348 84.7871 91.9766C84.8132 92.6785 84.8655 93.226 84.9439 93.6019H88.2042C88.1127 92.9783 88.0735 92.0005 88.0735 90.675V84.806L88.0757 84.8082ZM84.7109 88.1653C84.7109 89.8428 83.3148 91.0661 81.738 91.0661H81.5289C80.5772 91.0661 79.8737 90.5316 79.8737 89.7124C79.8737 89.204 80.0697 88.8281 80.4596 88.5543C80.8516 88.2805 81.3068 88.124 81.8164 88.0849L84.7109 87.785V88.1653Z"
          fill="#F3F3F3"
        />
        <path
          d="M97.7935 80.0212C96.0076 80.0212 94.5201 81.036 93.9452 82.0116V74.9475H90.4758V93.6063H93.9452V91.8766C94.5201 92.8523 96.0055 93.867 97.7935 93.867C101.537 93.9322 103.765 90.5881 103.726 86.9441C103.765 83.3002 101.535 79.956 97.7935 80.0212ZM97.2055 91.0683H96.9964C95.4044 91.1074 93.919 89.3908 93.9452 86.9441C93.919 84.4974 95.4065 82.7808 96.9964 82.8199H97.2055C98.9522 82.8199 100.257 84.4192 100.257 86.9181C100.257 89.4169 98.9391 91.0683 97.2055 91.0683Z"
          fill="#F3F3F3"
        />
        <path
          d="M108.931 74.9453H105.462V93.6041H108.931V74.9453Z"
          fill="#F3F3F3"
        />
        <path
          d="M117.057 80.0212C113.146 79.9691 110.667 82.9612 110.706 86.9441C110.641 91.1987 113.705 93.9192 117.057 93.867C120.33 93.867 122.443 92.0461 123.094 89.3908H119.651C119.403 90.3665 118.555 91.0683 117.303 91.0683H117.081C115.633 91.0683 114.2 89.8189 114.069 88.0371H123.094C123.133 87.4656 123.147 87.0484 123.147 86.7877C123.186 82.8982 120.956 79.9821 117.057 80.0212ZM114.071 85.3688C114.15 83.7934 115.363 82.8178 116.824 82.8178H117.033C118.495 82.8178 119.708 83.7934 119.784 85.3688H114.071Z"
          fill="#F3F3F3"
        />
      </g>
      <path
        d="M30.4851 101.025V109H32.0581V106.195H33.2571C35.0941 106.195 36.7221 105.7 36.7221 103.665C36.7221 101.256 34.8521 101.025 33.2131 101.025H30.4851ZM33.2461 102.257C34.1041 102.257 35.1051 102.367 35.1051 103.676C35.1051 104.732 34.3351 104.974 33.3561 104.974H32.0581V102.257H33.2461Z"
        fill="#F3F3F3"
      />
      <path
        d="M36.9683 109H38.5743L39.1353 107.383H42.2373L42.7983 109H44.5034L41.5224 101.025H39.9383L36.9683 109ZM40.6863 102.95L41.7863 106.096H39.5863L40.6863 102.95Z"
        fill="#F3F3F3"
      />
      <path
        d="M49.1875 105.689C50.0345 105.843 50.6615 106.096 50.6615 106.778C50.6615 107.636 49.7705 107.889 49.0665 107.889C48.1205 107.889 47.3065 107.537 47.1305 106.371H45.6125C45.7555 108.087 47.0535 109.143 49.0115 109.143C50.6175 109.143 52.2455 108.34 52.2455 106.701C52.2455 105.051 50.8155 104.534 49.5175 104.303L48.4725 104.116C47.8345 103.995 47.3615 103.687 47.3615 103.126C47.3615 102.411 48.1755 102.136 48.9015 102.136C49.6495 102.136 50.4635 102.444 50.5845 103.379H52.1025C52.0255 101.85 50.6175 100.882 48.9675 100.882C47.4935 100.882 45.7885 101.586 45.7885 103.192C45.7885 104.578 46.8775 105.249 48.1755 105.502L49.1875 105.689Z"
        fill="#F3F3F3"
      />
      <path
        d="M57.5244 105.689C58.3714 105.843 58.9984 106.096 58.9984 106.778C58.9984 107.636 58.1074 107.889 57.4034 107.889C56.4574 107.889 55.6434 107.537 55.4674 106.371H53.9494C54.0924 108.087 55.3904 109.143 57.3484 109.143C58.9544 109.143 60.5824 108.34 60.5824 106.701C60.5824 105.051 59.1524 104.534 57.8544 104.303L56.8094 104.116C56.1714 103.995 55.6984 103.687 55.6984 103.126C55.6984 102.411 56.5124 102.136 57.2384 102.136C57.9864 102.136 58.8004 102.444 58.9214 103.379H60.4394C60.3624 101.85 58.9544 100.882 57.3044 100.882C55.8304 100.882 54.1254 101.586 54.1254 103.192C54.1254 104.578 55.2144 105.249 56.5124 105.502L57.5244 105.689Z"
        fill="#F3F3F3"
      />
      <path
        d="M62.5544 101.025V109H64.1274V106.195H65.3264C67.1634 106.195 68.7914 105.7 68.7914 103.665C68.7914 101.256 66.9214 101.025 65.2824 101.025H62.5544ZM65.3154 102.257C66.1734 102.257 67.1744 102.367 67.1744 103.676C67.1744 104.732 66.4044 104.974 65.4254 104.974H64.1274V102.257H65.3154Z"
        fill="#F3F3F3"
      />
      <path
        d="M71.8888 105.007C71.8888 103.137 72.9228 102.136 74.1658 102.136C75.4088 102.136 76.4428 103.137 76.4428 105.007C76.4428 106.877 75.4088 107.889 74.1658 107.889C72.9228 107.889 71.8888 106.877 71.8888 105.007ZM78.0708 105.007C78.0708 102.532 76.5418 100.882 74.1658 100.882C71.7898 100.882 70.2608 102.532 70.2608 105.007C70.2608 107.482 71.7898 109.143 74.1658 109.143C76.5418 109.143 78.0708 107.482 78.0708 105.007Z"
        fill="#F3F3F3"
      />
      <path
        d="M85.0133 109H86.7623L84.9913 105.546C85.9813 105.128 86.4323 104.358 86.4323 103.445C86.4323 101.773 85.4313 101.025 82.8023 101.025H80.1843V109H81.7573V105.876H83.0553H83.4293L85.0133 109ZM82.9783 102.257C84.0453 102.257 84.8153 102.532 84.8153 103.456C84.8153 104.237 84.2763 104.655 83.0553 104.655H81.7573V102.257H82.9783Z"
        fill="#F3F3F3"
      />
      <path
        d="M90.1424 109H91.7154V102.301H94.1794V101.025H87.6894V102.301H90.1424V109Z"
        fill="#F3F3F3"
      />
      <g clip-path="url(#clip2_332_47939)">
        <circle
          cx="61.5"
          cy="30"
          r="28.125"
          fill="url(#paint0_radial_332_47939)"
        />
        <circle
          cx="61.5"
          cy="30"
          r="28.125"
          fill="url(#paint1_radial_332_47939)"
        />
        <path
          d="M61.5 0C44.9315 0 31.5 13.4315 31.5 30C31.5 46.5685 44.9315 60 61.5 60C78.0685 60 91.5 46.5685 91.5 30C91.5 13.4315 78.0685 0 61.5 0ZM60.3397 11.4576C61.1729 11.0494 62.0508 11.0774 62.8588 11.5359C65.6603 13.1323 68.4534 14.7428 71.2325 16.37C72.1272 16.8956 72.5857 17.7372 72.5885 18.7717C72.6053 22.3979 72.5997 26.0214 72.5885 29.6477C72.5885 29.7819 72.5019 29.9776 72.3928 30.0419C71.3164 30.685 70.226 31.3029 69.0433 31.9851V31.4147C69.0433 27.685 69.0322 23.9581 69.0517 20.2283C69.0545 19.5126 68.8085 19.0513 68.1738 18.6906C64.9222 16.8425 61.6873 14.9609 58.4469 13.0904C58.3071 13.0093 58.1701 12.9226 57.9576 12.794C58.7908 12.3215 59.5401 11.8462 60.3341 11.4576H60.3397ZM59.7442 48.5564C59.5624 48.4641 59.4282 48.3998 59.2968 48.3243C55.0051 45.8499 50.719 43.3588 46.4133 40.904C45.2055 40.2162 44.6547 39.2349 44.6687 37.8565C44.6938 34.9264 44.6855 31.9963 44.6715 29.0634C44.6659 27.7409 45.2027 26.7819 46.3658 26.1221C49.3882 24.4026 52.3938 22.658 55.3993 20.9105C55.6594 20.7596 55.8495 20.7344 56.1207 20.8966C57.158 21.52 58.2148 22.1156 59.3192 22.753C59.1095 22.8788 58.9501 22.9739 58.788 23.069C55.5335 24.9478 52.2847 26.8322 49.0219 28.6999C48.4879 29.0047 48.239 29.4017 48.2446 30.0224C48.2614 32.3318 48.2642 34.6412 48.2446 36.9506C48.239 37.5881 48.4935 37.9935 49.0415 38.3066C52.4832 40.2749 55.911 42.2656 59.35 44.2395C59.6407 44.4073 59.7637 44.5806 59.7582 44.9273C59.733 46.11 59.7498 47.2954 59.7498 48.5592L59.7442 48.5564ZM59.7442 41.9413C59.445 41.7707 59.2297 41.6505 59.0144 41.5247C56.2856 39.9506 53.5596 38.3709 50.8253 36.808C50.5289 36.6403 50.4199 36.4585 50.4226 36.1146C50.4422 34.3392 50.4338 32.5638 50.4282 30.7884C50.4282 30.548 50.4646 30.383 50.7022 30.2488C51.7088 29.6869 52.7041 29.0997 53.7022 28.5266C53.7749 28.4846 53.8532 28.4539 53.9846 28.3896V30.383C53.9846 31.4623 54.0014 32.5443 53.979 33.6235C53.9651 34.2386 54.2027 34.6552 54.7395 34.9571C56.2856 35.8294 57.8122 36.7353 59.3583 37.6048C59.6631 37.7754 59.7554 37.9655 59.7498 38.301C59.7302 39.4809 59.7414 40.6636 59.7414 41.9385L59.7442 41.9413ZM56.5932 18.6375C56.0144 18.2964 55.5196 18.2992 54.9408 18.6375C51.6976 20.5331 48.4404 22.4035 45.1859 24.2824C45.0489 24.3635 44.9063 24.4362 44.6631 24.5676C44.7498 23.3318 44.4842 22.1659 44.9063 21.0363C45.1356 20.4185 45.5662 19.9543 46.1365 19.6244C48.8514 18.0559 51.5634 16.4846 54.2838 14.9245C55.2763 14.3541 56.2884 14.3681 57.281 14.9413C60.3705 16.7195 63.4571 18.5033 66.5382 20.2926C66.6696 20.3681 66.8346 20.5387 66.8346 20.6673C66.8569 21.9366 66.8486 23.2088 66.8486 24.5704C65.7274 23.9245 64.6929 23.3262 63.6584 22.7279C61.3015 21.3663 58.939 20.0186 56.5932 18.6375ZM78.3033 38.5974C78.2223 39.5955 77.6379 40.3029 76.774 40.8006C73.4664 42.7018 70.1617 44.6142 66.8569 46.521C65.8197 47.1193 64.7824 47.7176 63.7423 48.3159C63.6165 48.3886 63.4879 48.4501 63.3173 48.5396C63.3061 48.3663 63.2922 48.2404 63.2922 48.1146C63.2922 47.0186 63.2978 45.9254 63.2866 44.8294C63.2866 44.5806 63.3453 44.4296 63.5746 44.2982C68.3947 41.5247 73.212 38.7428 78.0266 35.9637C78.0993 35.9217 78.1803 35.8882 78.3173 35.8239C78.3173 36.7968 78.3732 37.7027 78.3033 38.5974ZM78.3285 31.6971C78.3201 32.8322 77.7078 33.6291 76.7377 34.1883C72.9688 36.3551 69.2027 38.5331 65.4366 40.7083C64.7488 41.1053 64.0582 41.4995 63.3201 41.9245C63.3089 41.7372 63.295 41.6142 63.295 41.4883C63.295 40.4091 63.3062 39.3271 63.2866 38.2479C63.281 37.9404 63.3844 37.7782 63.65 37.6244C67.075 35.6589 70.4888 33.671 73.9194 31.7167C74.5289 31.37 74.7973 30.9422 74.7917 30.2265C74.7665 26.4967 74.7805 22.767 74.7805 19.0373V18.3858C75.6752 18.9254 76.514 19.37 77.2801 19.9124C77.979 20.4073 78.3313 21.1566 78.3341 22.0205C78.3453 25.247 78.3537 28.4734 78.3313 31.6999L78.3285 31.6971Z"
          fill="#131313"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M61.5 0C44.9315 0 31.5 13.4315 31.5 30C31.5 46.5685 44.9315 60 61.5 60C78.0685 60 91.5 46.5685 91.5 30C91.5 13.4315 78.0685 0 61.5 0ZM61.5 2.5C46.3122 2.5 34 14.8122 34 30C34 45.1878 46.3122 57.5 61.5 57.5C76.6878 57.5 89 45.1878 89 30C89 14.8122 76.6878 2.5 61.5 2.5Z"
          fill="url(#paint2_radial_332_47939)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M61.5 0C44.9315 0 31.5 13.4315 31.5 30C31.5 46.5685 44.9315 60 61.5 60C78.0685 60 91.5 46.5685 91.5 30C91.5 13.4315 78.0685 0 61.5 0ZM61.5 2.5C46.3122 2.5 34 14.8122 34 30C34 45.1878 46.3122 57.5 61.5 57.5C76.6878 57.5 89 45.1878 89 30C89 14.8122 76.6878 2.5 61.5 2.5Z"
          fill="url(#paint3_radial_332_47939)"
        />
      </g>
    </g>
    <defs>
      <radialGradient
        id="paint0_radial_332_47939"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(48.3053 16.7373) rotate(44.9817) scale(58.4359 123.929)"
      >
        <stop stop-color="#A3EEF8" />
        <stop offset="0.177083" stop-color="#A4DCF5" />
        <stop offset="0.380208" stop-color="#A6AEEC" />
        <stop offset="1" stop-color="#ECBEE1" />
      </radialGradient>
      <radialGradient
        id="paint1_radial_332_47939"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(63.9394 54.6335) rotate(84.265) scale(30.2672 57.9018)"
      >
        <stop stop-color="#FCF5EE" />
        <stop offset="0.715135" stop-color="#ECBEE1" stop-opacity="0" />
      </radialGradient>
      <radialGradient
        id="paint2_radial_332_47939"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(47.4257 15.8532) rotate(44.9817) scale(62.3316 132.191)"
      >
        <stop stop-color="#A3EEF8" />
        <stop offset="0.177083" stop-color="#A4DCF5" />
        <stop offset="0.380208" stop-color="#A6AEEC" />
        <stop offset="1" stop-color="#ECBEE1" />
      </radialGradient>
      <radialGradient
        id="paint3_radial_332_47939"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(64.102 56.2758) rotate(84.265) scale(32.2851 61.7619)"
      >
        <stop stop-color="#FCF5EE" />
        <stop offset="0.715135" stop-color="#ECBEE1" stop-opacity="0" />
      </radialGradient>
      <clipPath id="clip0_332_47939">
        <rect
          width="123"
          height="112"
          fill="white"
          transform="translate(0.5)"
        />
      </clipPath>
      <clipPath id="clip1_332_47939">
        <rect
          width="123"
          height="19"
          fill="white"
          transform="translate(0.5 75)"
        />
      </clipPath>
      <clipPath id="clip2_332_47939">
        <rect
          width="60"
          height="60"
          fill="white"
          transform="translate(31.5)"
        />
      </clipPath>
    </defs>
  </svg>
`;
var ae = () => `
    <button
      id="${S2}"
      style="
        background: #f3f3f326 !important;
        border: none !important;
        border-radius: 50% !important;
        width: 48px !important;
        height: 48px !important;
        position: absolute !important;
        top: 40px !important;
        right: 40px !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      "
    >
      
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style="width: 20px !important;"
    >
      <path
        d="M16.25 5.75833L14.2417 3.75L10 7.99167L5.75833 3.75L3.75 5.75833L7.99167 10L3.75 14.2417L5.75833 16.25L10 12.0083L14.2417 16.25L16.25 14.2417L12.0083 10L16.25 5.75833Z"
        fill="#F3F3F3"
      />
  </svg>

    </button>
  `;
var T2 = () => `
  <button
    id="${C2}"
    style="
      margin-top: 27px !important;
      color: #f3f3f3 !important;
      background: transparent !important;
      padding: 12px 24px !important;
      border-radius: 30px !important;
      border: 2px solid #f3f3f3 !important;
      font-size: 1em !important;
      font-weight: 500 !important;
      cursor: pointer !important;
    "
  >
    Try again
  </button>
`;
var oe = () => `
    ${w2}
    <div
      style="
        color: #e01a3d !important;
        display: flex !important;
        align-items: center !important;
        gap: 4px !important;
        margin-bottom: 10px !important;
      "
    >
      
  <svg
  viewBox="0 0 17 16"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  style="width: 16px !important;"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M0.5 14.3333L8.5 0.333336L16.5 14.3333H0.5ZM9.16667 10.6667V12H7.83333V10.6667H9.16667ZM9.16667 5.33334L9.16667 9.33334H7.83333L7.83333 5.33334H9.16667Z"
      fill="#E01A3D"
    />
  </svg>

      Pop-up blocked
    </div>
    <p style="
        color: #b6b6b6 !important;
        text-align: center !important;
        margin: 0 !important;
      "
    >
      Please try again below.<br />
      If the problem continues, adjust your<br />
      browser settings.
    </p>
    ${T2()}
  `;
var se = () => `
    ${w2}
    <p style="
        color: #b6b6b6 !important;
        text-align: center !important;
        margin: 0 !important;
      "
    >
      Secure pop-up not showing?<br />We'll help you re-launch
    </p>
    ${T2()}
  `;
var E2 = (e3) => `
    <div
      id="${b2}"
      style="
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: rgba(13, 13, 13, 0.48) !important;
        backdrop-filter: blur(28px) !important;
        -webkit-backdrop-filter: blur(28px) !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        align-items: center !important;
        font-size: 16px !important;
        line-height: 1.5 !important;
        font-family: Roboto !important;
        font-style: normal !important;
        font-weight: 400 !important;
        font-feature-settings: 'clig' off, 'liga' off !important;
        z-index: 2147483647 !important;
      "
    >
      ${ae()}
      <div
        id="${x2}"
        style="
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          max-width: 400px !important;
        "
      >
        ${e3 ?? ``}
      </div>
    </div>
  `;
var D2 = () => `
    <div
      id="${b2}"
      style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 2147483647;
        background: rgba(247, 247, 247, 0.24);
        animation-name: passportEmbeddedLoginPromptOverlayFadeIn;
        animation-duration: 0.8s;
        pointer-events: auto;
      "
    >
      <div
        id="${x2}"
        style="
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        "
      />
    </div>
  `;
function O2({ id: e3, href: t3, rel: n3, crossOrigin: r3 }) {
  let i3 = `${b2}-${e3}`;
  if (!document.getElementById(i3)) {
    let e4 = document.createElement(`link`);
    e4.id = i3, e4.href = t3, n3 && (e4.rel = n3), r3 && (e4.crossOrigin = r3), document.head.appendChild(e4);
  }
}
var ce = () => E2(oe());
var le = () => E2(se());
var _a;
var k2 = (_a = class {
  static remove() {
    this.onCloseListener && this.closeButton?.removeEventListener?.(`click`, this.onCloseListener), this.overlay?.remove(), this.closeButton = void 0, this.onCloseListener = void 0, this.overlay = void 0;
  }
  static appendOverlay(e3, t3) {
    if (!this.overlay) {
      let n3 = document.createElement(`div`);
      n3.innerHTML = D2(), document.body.insertAdjacentElement(`beforeend`, n3);
      let r3 = document.querySelector(`#${x2}`);
      r3 && r3.appendChild(e3), n3.addEventListener(`click`, t3), this.overlay = n3;
    }
  }
}, __publicField(_a, "overlay"), __publicField(_a, "onCloseListener"), __publicField(_a, "closeButton"), _a);
var A2 = `passport-embedded-login-keyframes`;
var j2 = `passport-embedded-login-iframe`;
var _a2;
var ue = (_a2 = class {
  constructor(e3) {
    __publicField(this, "config");
    __publicField(this, "getHref", () => `${this.config.authenticationDomain}/im-embedded-login-prompt?client_id=${this.config.oidcConfiguration.clientId}&rid=${re(_.RUNTIME_ID)}`);
    __publicField(this, "getEmbeddedLoginIFrame", () => {
      let t3 = document.createElement(`iframe`);
      return t3.id = j2, t3.src = this.getHref(), t3.style.height = `100vh`, t3.style.width = `100vw`, t3.style.maxHeight = `660px`, t3.style.maxWidth = `440px`, t3.style.borderRadius = `16px`, t3.style.opacity = `0`, t3.style.transform = `scale(0.6)`, t3.style.animation = `passportEmbeddedLoginPromptPopBounceIn 1s ease forwards`, _a2.appendIFrameStylesIfNeeded(), t3;
    });
    this.config = e3;
  }
  displayEmbeddedLoginPrompt() {
    return new Promise((e3, t3) => {
      let n3 = this.getEmbeddedLoginIFrame(), r3 = ({ data: n4, origin: i3 }) => {
        if (i3 === this.config.authenticationDomain && n4.eventType === `im_passport_embedded_login_prompt`) switch (n4.messageType) {
          case `login_method_selected`: {
            let t4 = n4.payload;
            window.removeEventListener(`message`, r3), k2.remove(), e3(t4);
            break;
          }
          case `login_prompt_error`:
            window.removeEventListener(`message`, r3), k2.remove(), t3(Error(`Error during embedded login prompt`, { cause: n4.payload }));
            break;
          case `login_prompt_closed`:
            window.removeEventListener(`message`, r3), k2.remove(), t3(Error(`Popup closed by user`));
            break;
          default:
            window.removeEventListener(`message`, r3), k2.remove(), t3(Error(`Unsupported message type: ${n4.messageType}`));
            break;
        }
      };
      window.addEventListener(`message`, r3), k2.appendOverlay(n3, () => {
        window.removeEventListener(`message`, r3), k2.remove(), t3(Error(`Popup closed by user`));
      });
    });
  }
}, __publicField(_a2, "appendIFrameStylesIfNeeded", () => {
  if (document.getElementById(A2)) return;
  let e3 = document.createElement(`style`);
  e3.id = A2, e3.textContent = `
      @keyframes passportEmbeddedLoginPromptPopBounceIn {
        0% {
          opacity: 0.5;
        }
        50% {
          opacity: 1;
          transform: scale(1.05);
        }
        75% {
          transform: scale(0.98);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }

      @media (max-height: 400px) {
        #${j2} {
          width: 100% !important;
          max-width: none !important;
        }
      }

      @keyframes passportEmbeddedLoginPromptOverlayFadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `, document.head.appendChild(e3);
}), _a2);
var M2 = class {
  constructor() {
    __publicField(this, "listeners", /* @__PURE__ */ new Map());
  }
  emit(e3, ...t3) {
    let n3 = this.listeners.get(e3);
    !n3 || n3.size === 0 || [...n3].forEach((e4) => {
      e4(...t3);
    });
  }
  on(e3, t3) {
    let n3 = this.listeners.get(e3) ?? /* @__PURE__ */ new Set();
    n3.add(t3), this.listeners.set(e3, n3);
  }
  removeListener(e3, t3) {
    let n3 = this.listeners.get(e3);
    n3 && (n3.delete(t3), n3.size === 0 && this.listeners.delete(e3));
  }
};
var N2 = async (e3, t3, n3 = true, r3 = true) => {
  let i3 = X(`passport`, t3, n3);
  try {
    return await e3(i3);
  } catch (e4) {
    throw e4 instanceof Error ? Z(`passport`, t3, e4, { flowId: i3.details.flowId }) : i3.addEvent(`errored`), e4;
  } finally {
    r3 && i3.addEvent(`End`);
  }
};
var de = () => typeof globalThis < `u` ? globalThis : typeof self < `u` ? self : typeof window < `u` ? window : typeof global < `u` ? global : {};
var fe = (e3) => {
  let t3 = e3.replace(/-/g, `+`).replace(/_/g, `/`);
  return t3 + (t3.length % 4 == 0 ? `` : `=`.repeat(4 - t3.length % 4));
};
var pe = (e3) => {
  let t3 = de();
  if (typeof t3.atob != `function`) return null;
  let n3 = t3.atob(e3), r3 = new Uint8Array(n3.length);
  for (let e4 = 0; e4 < n3.length; e4 += 1) r3[e4] = n3.charCodeAt(e4);
  if (typeof t3.TextDecoder == `function`) return new t3.TextDecoder(`utf-8`).decode(r3);
  let i3 = ``;
  for (let e4 = 0; e4 < r3.length; e4 += 1) i3 += String.fromCharCode(r3[e4]);
  return i3;
};
var me = (e3) => {
  if (typeof Buffer < `u`) return Buffer.from(e3, `base64`).toString(`utf-8`);
  let t3 = pe(e3);
  if (t3 === null) throw Error(`Base64 decoding is not supported in this environment`);
  return t3;
};
var P2 = (e3) => {
  if (typeof e3 != `string`) throw Error(`JWT must be a string`);
  let t3 = e3.split(`.`);
  if (t3.length < 2) throw Error(`Invalid JWT: payload segment is missing`);
  let n3 = t3[1], r3 = me(fe(n3));
  try {
    return JSON.parse(r3);
  } catch {
    throw Error(`Invalid JWT payload: unable to parse JSON`);
  }
};
var F2 = `pkce_state`;
var I2 = `pkce_verifier`;
var he = class {
  isTokenValid(e3) {
    try {
      return (P2(e3).exp ?? 0) > Date.now() / 1e3 + 3600;
    } catch {
      return false;
    }
  }
  savePKCEData(e3) {
    localStorage.setItem(F2, e3.state), localStorage.setItem(I2, e3.verifier);
  }
  getPKCEData() {
    let e3 = localStorage.getItem(F2), t3 = localStorage.getItem(I2);
    return e3 && t3 ? { state: e3, verifier: t3 } : null;
  }
};
var L2 = { warn: (...e3) => {
  typeof process > `u` || process?.env?.JEST_WORKER_ID === void 0 && console.warn(...e3);
} };
function R2(e3) {
  try {
    let t3 = P2(e3), n3 = Math.floor(Date.now() / 1e3);
    return !t3.exp || t3.exp <= n3 + 30;
  } catch {
    return true;
  }
}
function ge(e3) {
  let { id_token: t3, access_token: n3 } = e3;
  return !n3 || !t3 || R2(n3) || R2(t3);
}
var _e = class {
  constructor(e3, t3 = false) {
    __publicField(this, "disableGenericPopupOverlay");
    __publicField(this, "disableBlockedPopupOverlay");
    __publicField(this, "overlay");
    __publicField(this, "isBlockedOverlay");
    __publicField(this, "tryAgainListener");
    __publicField(this, "onCloseListener");
    this.disableBlockedPopupOverlay = e3.disableBlockedPopupOverlay || false, this.disableGenericPopupOverlay = e3.disableGenericPopupOverlay || false, this.isBlockedOverlay = t3;
  }
  append(e3, t3) {
    this.shouldAppendOverlay() && (this.appendOverlay(), this.updateTryAgainButton(e3), this.updateCloseButton(t3));
  }
  update(e3) {
    this.updateTryAgainButton(e3);
  }
  remove() {
    this.overlay && this.overlay.remove();
  }
  shouldAppendOverlay() {
    return !(this.disableGenericPopupOverlay && this.disableBlockedPopupOverlay || this.disableGenericPopupOverlay && !this.isBlockedOverlay || this.disableBlockedPopupOverlay && this.isBlockedOverlay);
  }
  appendOverlay() {
    if (!this.overlay) {
      O2({ id: `link-googleapis`, href: `https://fonts.googleapis.com` }), O2({ id: `link-gstatic`, href: `https://fonts.gstatic.com`, crossOrigin: `anonymous` }), O2({ id: `link-roboto`, href: `https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&display=swap`, rel: `stylesheet` });
      let e3 = document.createElement(`div`);
      e3.innerHTML = this.isBlockedOverlay ? ce() : le(), document.body.insertAdjacentElement(`beforeend`, e3), this.overlay = e3;
    }
  }
  updateTryAgainButton(e3) {
    let t3 = document.getElementById(C2);
    t3 && (this.tryAgainListener && t3.removeEventListener(`click`, this.tryAgainListener), this.tryAgainListener = e3, t3.addEventListener(`click`, e3));
  }
  updateCloseButton(e3) {
    let t3 = document.getElementById(S2);
    t3 && (this.onCloseListener && t3.removeEventListener(`click`, this.onCloseListener), this.onCloseListener = e3, t3.addEventListener(`click`, e3));
  }
};
var ve = class {
  constructor(e3, t3) {
    __publicField(this, "storage");
    this.storage = import_localforage.default.createInstance({ name: e3, driver: t3 });
  }
  get length() {
    return this.storage.length();
  }
  clear() {
    return this.storage.clear();
  }
  getItem(e3) {
    return this.storage.getItem(e3);
  }
  key(e3) {
    return this.storage.key(e3);
  }
  async removeItem(e3) {
    await this.storage.removeItem(e3);
  }
  async setItem(e3, t3) {
    await this.storage.setItem(e3, t3);
  }
};
function ye(e3) {
  return e3.replace(/^(?:https?:\/\/)?(.*)/, `https://$1`);
}
function z2(e3) {
  let t3 = ye(e3.authenticationDomain || `https://auth.immutable.com`), n3 = e3.crossSdkBridgeEnabled ? `/im-logged-out` : `/v2/logout`, r3 = new URL(n3, t3);
  return r3.searchParams.set(`client_id`, e3.clientId), e3.logoutRedirectUri && r3.searchParams.set(`returnTo`, e3.logoutRedirectUri), r3.toString();
}
var be = { "Content-Type": `application/x-www-form-urlencoded` };
var xe = (e3) => {
  if (e3) try {
    return JSON.parse(e3);
  } catch {
    return;
  }
};
var Se = (e3, t3, n3) => {
  if (e3 && typeof e3 == `object`) {
    let t4 = e3, n4 = t4.error_description ?? t4.message ?? t4.error;
    if (typeof n4 == `string` && n4.trim().length > 0) return n4;
  }
  return t3.trim().length > 0 ? t3 : `Token request failed with status ${n3}`;
};
var Ce = (e3, t3) => ({ ethAddress: e3, userAdminAddress: t3 });
var we = (e3) => {
  let { authenticationDomain: t3, oidcConfiguration: r3 } = e3, i3;
  i3 = e3.crossSdkBridgeEnabled ? new ve(`ImmutableSDKPassport`, import_localforage.default.INDEXEDDB) : typeof window < `u` ? window.localStorage : new InMemoryWebStorage();
  let s3 = new WebStorageStateStore({ store: i3 }), c3 = z2({ clientId: r3.clientId, authenticationDomain: t3, logoutRedirectUri: r3.logoutRedirectUri, crossSdkBridgeEnabled: e3.crossSdkBridgeEnabled });
  return { authority: t3, redirect_uri: r3.redirectUri, popup_redirect_uri: r3.popupRedirectUri || r3.redirectUri, client_id: r3.clientId, metadata: { authorization_endpoint: `${t3}/authorize`, token_endpoint: `${t3}/oauth/token`, userinfo_endpoint: `${t3}/userinfo`, end_session_endpoint: c3, revocation_endpoint: `${t3}/oauth/revoke` }, automaticSilentRenew: false, scope: r3.scope, userStore: s3, revokeTokenTypes: [`refresh_token`], extraQueryParams: { ...r3.audience ? { audience: r3.audience } : {} } };
};
function B2(e3) {
  return btoa(String.fromCharCode(...new Uint8Array(e3))).replace(/\+/g, `-`).replace(/\//g, `_`).replace(/=/g, ``);
}
async function Te(e3) {
  let t3 = new TextEncoder().encode(e3);
  return window.crypto.subtle.digest(`SHA-256`, t3);
}
var _a3;
var Ee = (_a3 = class {
  constructor(e3) {
    __publicField(this, "config");
    __publicField(this, "userManager");
    __publicField(this, "deviceCredentialsManager");
    __publicField(this, "embeddedLoginPrompt");
    __publicField(this, "logoutMode");
    __publicField(this, "refreshingPromise", null);
    __publicField(this, "eventEmitter");
    this.config = new v2(e3), this.embeddedLoginPrompt = new ue(this.config), this.userManager = new UserManager(we(this.config)), this.deviceCredentialsManager = new he(), this.logoutMode = this.config.oidcConfiguration.logoutMode || `redirect`, this.eventEmitter = new M2(), V(`passport`, `initialise`);
  }
  async login(e3) {
    return N2(async () => {
      let { useCachedSession: t3 = false, useSilentLogin: n3 } = e3 || {}, r3 = null;
      try {
        r3 = await this.getUserInternal();
      } catch (e4) {
        if (e4 instanceof Error && !e4.message.includes(`Unknown or invalid refresh token`) && Z(`passport`, `login`, e4), t3) throw e4;
        L2.warn(`Failed to retrieve a cached user session`, e4);
      }
      if (!r3 && n3) r3 = await this.forceUserRefreshInternal();
      else if (!r3 && !t3) {
        if (e3?.useRedirectFlow) return await this.loginWithRedirectInternal(e3?.directLoginOptions), null;
        r3 = await this.loginWithPopup(e3?.directLoginOptions);
      }
      return r3 && this.handleSuccessfulLogin(r3), r3;
    }, `login`);
  }
  async loginWithRedirect(e3) {
    await this.loginWithRedirectInternal(e3);
  }
  async loginCallback() {
    return N2(async () => {
      let e3 = await this.loginCallbackInternal();
      return e3 && this.handleSuccessfulLogin(e3), e3;
    }, `loginCallback`);
  }
  async logout() {
    await N2(async () => {
      await this.logoutInternal(), this.eventEmitter.emit(`loggedOut`);
    }, `logout`);
  }
  async getUser() {
    return this.getUserInternal();
  }
  async getUserOrLogin() {
    let e3 = null;
    try {
      e3 = await this.getUserInternal();
    } catch (e4) {
      L2.warn(`Failed to retrieve a cached user session`, e4);
    }
    if (e3) return e3;
    let t3 = await this.loginWithPopup();
    return this.handleSuccessfulLogin(t3), t3;
  }
  async getUserZkEvm() {
    return this.getUserZkEvmInternal();
  }
  async getIdToken() {
    return N2(async () => (await this.getUserInternal())?.idToken, `getIdToken`, false);
  }
  async getAccessToken() {
    return N2(async () => (await this.getUserInternal())?.accessToken, `getAccessToken`, false, false);
  }
  async isLoggedIn() {
    return await this.getUser() !== null;
  }
  async forceUserRefresh() {
    return this.forceUserRefreshInternal();
  }
  forceUserRefreshInBackground() {
    this.forceUserRefreshInBackgroundInternal();
  }
  async loginWithPKCEFlow(e3, t3) {
    return N2(async () => this.getPKCEAuthorizationUrl(e3, t3), `loginWithPKCEFlow`);
  }
  async loginWithPKCEFlowCallback(e3, t3) {
    return N2(async () => {
      let n3 = await this.loginWithPKCEFlowCallbackInternal(e3, t3);
      return this.handleSuccessfulLogin(n3), n3;
    }, `loginWithPKCEFlowCallback`);
  }
  async storeTokens(e3) {
    return N2(async () => {
      let t3 = await this.storeTokensInternal(e3);
      return this.handleSuccessfulLogin(t3), t3;
    }, `storeTokens`);
  }
  async getLogoutUrl() {
    return N2(async () => (await this.userManager.removeUser(), this.eventEmitter.emit(`loggedOut`), await this.getLogoutUrlInternal() || void 0), `getLogoutUrl`);
  }
  async logoutSilentCallback(e3) {
    return N2(() => this.userManager.signoutSilentCallback(e3), `logoutSilentCallback`);
  }
  getConfig() {
    return this.config;
  }
  async getClientId() {
    return this.config.oidcConfiguration.clientId;
  }
  handleSuccessfulLogin(e3) {
    this.eventEmitter.emit(`loggedIn`, e3), $({ passportId: e3.profile.sub });
  }
  buildExtraQueryParams(e3, t3) {
    let n3 = { ...this.userManager.settings?.extraQueryParams ?? {}, rid: re(_.RUNTIME_ID) || `` };
    if (e3) {
      if (e3.directLoginMethod === `email`) {
        let t4 = e3.email;
        t4 && (n3.direct = e3.directLoginMethod, n3.email = t4);
      } else n3.direct = e3.directLoginMethod;
      e3.marketingConsentStatus && (n3.marketingConsent = e3.marketingConsentStatus);
    }
    return t3 && (n3.im_passport_trace_id = t3), n3;
  }
  async loginWithRedirectInternal(e3) {
    await this.userManager.clearStaleState(), await _2(async () => {
      let t3 = this.buildExtraQueryParams(e3);
      await this.userManager.signinRedirect({ extraQueryParams: t3 });
    }, `AUTHENTICATION_ERROR`);
  }
  async loginWithPopup(e3) {
    return _2(async () => {
      let t3, r3;
      if (e3) t3 = e3;
      else if (!this.config.popupOverlayOptions?.disableHeadlessLoginPromptOverlay) {
        let { imPassportTraceId: e4, ...n3 } = await this.embeddedLoginPrompt.displayEmbeddedLoginPrompt();
        t3 = n3, r3 = e4;
      }
      let i3 = window.crypto.randomUUID(), a3 = async () => {
        let e4 = this.buildExtraQueryParams(t3, r3);
        return this.userManager.signinPopup({ extraQueryParams: e4, popupWindowFeatures: { width: 410, height: 450 }, popupWindowTarget: i3, popupAbortOnClose: true });
      };
      return new Promise((e4, t4) => {
        a3().then((t5) => e4(_a3.mapOidcUserToDomainModel(t5))).catch((r4) => {
          if (!(r4 instanceof Error) || r4.message !== `Attempted to navigate on a disposed window`) {
            t4(r4);
            return;
          }
          let o4 = false, s3 = new _e(this.config.popupOverlayOptions || {}, true);
          s3.append(async () => {
            try {
              if (o4) window.open(``, i3);
              else {
                o4 = true;
                let t5 = await a3();
                s3.remove(), e4(_a3.mapOidcUserToDomainModel(t5));
              }
            } catch (e5) {
              s3.remove(), t4(e5);
            }
          }, () => {
            s3.remove(), t4(Error(`Popup closed by user`));
          });
        });
      });
    }, `AUTHENTICATION_ERROR`);
  }
  async loginCallbackInternal() {
    return _2(async () => {
      let e3 = await this.userManager.signinCallback();
      if (e3) return _a3.mapOidcUserToDomainModel(e3);
    }, `AUTHENTICATION_ERROR`);
  }
  async getPKCEAuthorizationUrl(e3, t3) {
    let n3 = B2(window.crypto.getRandomValues(new Uint8Array(32))), r3 = B2(await Te(n3)), i3 = B2(window.crypto.getRandomValues(new Uint8Array(32))), { redirectUri: a3, scope: o4, audience: s3, clientId: c3 } = this.config.oidcConfiguration;
    this.deviceCredentialsManager.savePKCEData({ state: i3, verifier: n3 });
    let l3 = new URL(`/authorize`, this.config.authenticationDomain);
    if (l3.searchParams.set(`response_type`, `code`), l3.searchParams.set(`code_challenge`, r3), l3.searchParams.set(`code_challenge_method`, `S256`), l3.searchParams.set(`client_id`, c3), l3.searchParams.set(`redirect_uri`, a3), l3.searchParams.set(`state`, i3), o4 && l3.searchParams.set(`scope`, o4), s3 && l3.searchParams.set(`audience`, s3), e3) {
      if (e3.directLoginMethod === `email`) {
        let t4 = e3.email;
        t4 && (l3.searchParams.set(`direct`, e3.directLoginMethod), l3.searchParams.set(`email`, t4));
      } else l3.searchParams.set(`direct`, e3.directLoginMethod);
      e3.marketingConsentStatus && l3.searchParams.set(`marketingConsent`, e3.marketingConsentStatus);
    }
    return t3 && l3.searchParams.set(`im_passport_trace_id`, t3), l3.toString();
  }
  async loginWithPKCEFlowCallbackInternal(e3, t3) {
    return _2(async () => {
      let r3 = this.deviceCredentialsManager.getPKCEData();
      if (!r3) throw Error(`No code verifier or state for PKCE`);
      if (t3 !== r3.state) throw Error(`Provided state does not match stored state`);
      let i3 = await this.getPKCEToken(e3, r3.verifier), a3 = _a3.mapDeviceTokenResponseToOidcUser(i3), o4 = _a3.mapOidcUserToDomainModel(a3);
      return await this.userManager.storeUser(a3), o4;
    }, `AUTHENTICATION_ERROR`);
  }
  async getPKCEToken(e3, t3) {
    let n3 = await fetch(`${this.config.authenticationDomain}/oauth/token`, { method: `POST`, headers: be, body: new URLSearchParams({ client_id: this.config.oidcConfiguration.clientId, grant_type: `authorization_code`, code_verifier: t3, code: e3, redirect_uri: this.config.oidcConfiguration.redirectUri }) }), r3 = await n3.text(), i3 = xe(r3);
    if (!n3.ok) throw Error(Se(i3, r3, n3.status));
    if (!i3 || typeof i3 != `object`) throw Error(`Token endpoint returned an invalid response`);
    return i3;
  }
  async storeTokensInternal(e3) {
    return _2(async () => {
      let t3 = _a3.mapDeviceTokenResponseToOidcUser(e3), r3 = _a3.mapOidcUserToDomainModel(t3);
      return await this.userManager.storeUser(t3), r3;
    }, `AUTHENTICATION_ERROR`);
  }
  async logoutInternal() {
    await _2(async () => {
      await this.userManager.revokeTokens([`refresh_token`]), this.logoutMode === `silent` ? await this.userManager.signoutSilent() : await this.userManager.signoutRedirect();
    }, `LOGOUT_ERROR`);
  }
  async getLogoutUrlInternal() {
    return this.userManager.settings?.metadata?.end_session_endpoint || (L2.warn(`Failed to get logout URL`), null);
  }
  forceUserRefreshInBackgroundInternal() {
    this.refreshTokenAndUpdatePromise().catch((e3) => {
      L2.warn(`Failed to refresh user token`, e3);
    });
  }
  async forceUserRefreshInternal() {
    return this.refreshTokenAndUpdatePromise().catch((e3) => (L2.warn(`Failed to refresh user token`, e3), null));
  }
  async refreshTokenAndUpdatePromise() {
    return this.refreshingPromise || (this.refreshingPromise = new Promise((r3, i3) => {
      (async () => {
        try {
          let e3 = await this.userManager.signinSilent();
          if (e3) {
            let t3 = _a3.mapOidcUserToDomainModel(e3);
            this.eventEmitter.emit(`tokenRefreshed`, t3), r3(t3);
            return;
          }
          r3(null);
        } catch (n3) {
          let r4 = `AUTHENTICATION_ERROR`, a3 = `Failed to refresh token`, o4 = true;
          if (n3 instanceof ErrorTimeout ? (r4 = `SILENT_LOGIN_ERROR`, a3 = `${a3}: ${n3.message}`, o4 = false) : n3 instanceof ErrorResponse ? (r4 = `NOT_LOGGED_IN_ERROR`, a3 = `${a3}: ${n3.message || n3.error_description}`) : n3 instanceof Error ? a3 = `${a3}: ${n3.message}` : typeof n3 == `string` && (a3 = `${a3}: ${n3}`), o4) {
            this.eventEmitter.emit(`userRemoved`, { reason: `refresh_failed`, error: a3 });
            try {
              await this.userManager.removeUser();
            } catch (e3) {
              e3 instanceof Error && (a3 = `${a3}: Failed to remove user: ${e3.message}`);
            }
          }
          i3(new g2(a3, r4));
        } finally {
          this.refreshingPromise = null;
        }
      })();
    })), this.refreshingPromise;
  }
  async getUserInternal(e3 = (e4) => true) {
    if (this.refreshingPromise) {
      let t4 = await this.refreshingPromise;
      return t4 && e3(t4) ? t4 : null;
    }
    let t3 = await this.userManager.getUser();
    if (!t3) return null;
    if (!ge(t3)) {
      let r3 = _a3.mapOidcUserToDomainModel(t3);
      if (r3 && e3(r3)) return r3;
    }
    if (t3.refresh_token) {
      let t4 = await this.refreshTokenAndUpdatePromise();
      if (t4 && e3(t4)) return t4;
    }
    return null;
  }
  async getUserZkEvmInternal() {
    let e3 = await this.getUserInternal(y2);
    if (!e3) throw Error(`Failed to obtain a User with the required ZkEvm attributes`);
    return e3;
  }
}, __publicField(_a3, "mapOidcUserToDomainModel", (e3) => {
  let t3, n3;
  if (e3.id_token) {
    let r4 = P2(e3.id_token);
    t3 = r4?.passport, r4?.username && (n3 = r4?.username);
  }
  let r3 = { expired: e3.expired, idToken: e3.id_token, accessToken: e3.access_token, refreshToken: e3.refresh_token, profile: { sub: e3.profile.sub, email: e3.profile.email, nickname: e3.profile.nickname, username: n3 } };
  return t3?.zkevm_eth_address && t3?.zkevm_user_admin_address && (r3.zkEvm = Ce(t3.zkevm_eth_address, t3.zkevm_user_admin_address)), r3;
}), __publicField(_a3, "mapDeviceTokenResponseToOidcUser", (e3) => {
  let t3 = P2(e3.id_token);
  return new User({ id_token: e3.id_token, access_token: e3.access_token, refresh_token: e3.refresh_token, token_type: e3.token_type, profile: { sub: t3.sub, iss: t3.iss, aud: t3.aud, exp: t3.exp, iat: t3.iat, email: t3.email, nickname: t3.nickname, passport: t3.passport, ...t3.username ? { username: t3.username } : {} } });
}), _a3);

// node_modules/axios/lib/helpers/bind.js
function bind(fn2, thisArg) {
  return function wrap() {
    return fn2.apply(thisArg, arguments);
  };
}

// node_modules/axios/lib/utils.js
var { toString } = Object.prototype;
var { getPrototypeOf } = Object;
var { iterator, toStringTag } = Symbol;
var hasOwnProperty = (({ hasOwnProperty: hasOwnProperty2 }) => (obj, prop) => hasOwnProperty2.call(obj, prop))(Object.prototype);
var hasOwnInPrototypeChain = (thing, prop) => {
  let obj = thing;
  const seen = [];
  while (obj != null && obj !== Object.prototype) {
    if (seen.indexOf(obj) !== -1) {
      return false;
    }
    seen.push(obj);
    if (hasOwnProperty(obj, prop)) {
      return true;
    }
    obj = getPrototypeOf(obj);
  }
  return false;
};
var getSafeProp = (obj, prop) => obj != null && hasOwnInPrototypeChain(obj, prop) ? obj[prop] : void 0;
var kindOf = /* @__PURE__ */ ((cache) => (thing) => {
  const str = toString.call(thing);
  return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null));
var kindOfTest = (type) => {
  type = type.toLowerCase();
  return (thing) => kindOf(thing) === type;
};
var typeOfTest = (type) => (thing) => typeof thing === type;
var { isArray } = Array;
var isUndefined = typeOfTest("undefined");
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
}
var isArrayBuffer = kindOfTest("ArrayBuffer");
function isArrayBufferView(val) {
  let result;
  if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
    result = ArrayBuffer.isView(val);
  } else {
    result = val && val.buffer && isArrayBuffer(val.buffer);
  }
  return result;
}
var isString = typeOfTest("string");
var isFunction = typeOfTest("function");
var isNumber = typeOfTest("number");
var isObject = (thing) => thing !== null && typeof thing === "object";
var isBoolean = (thing) => thing === true || thing === false;
var isPlainObject = (val) => {
  if (!isObject(val)) {
    return false;
  }
  const prototype2 = getPrototypeOf(val);
  return (prototype2 === null || prototype2 === Object.prototype || getPrototypeOf(prototype2) === null) && // Treat any genuine (non-Object.prototype-polluted) Symbol.toStringTag or
  // Symbol.iterator as evidence the value is a tagged/iterable type rather
  // than a plain object, while ignoring keys injected onto Object.prototype.
  !hasOwnInPrototypeChain(val, toStringTag) && !hasOwnInPrototypeChain(val, iterator);
};
var isEmptyObject = (val) => {
  if (!isObject(val) || isBuffer(val)) {
    return false;
  }
  try {
    return Object.keys(val).length === 0 && Object.getPrototypeOf(val) === Object.prototype;
  } catch (e3) {
    return false;
  }
};
var isDate = kindOfTest("Date");
var isFile = kindOfTest("File");
var isReactNativeBlob = (value) => {
  return !!(value && typeof value.uri !== "undefined");
};
var isReactNative = (formData) => formData && typeof formData.getParts !== "undefined";
var isBlob = kindOfTest("Blob");
var isFileList = kindOfTest("FileList");
var isSet = kindOfTest("Set");
var isStream = (val) => isObject(val) && isFunction(val.pipe);
function getGlobal() {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof self !== "undefined") return self;
  if (typeof window !== "undefined") return window;
  if (typeof global !== "undefined") return global;
  return {};
}
var G2 = getGlobal();
var FormDataCtor = typeof G2.FormData !== "undefined" ? G2.FormData : void 0;
var isFormData = (thing) => {
  if (!thing) return false;
  if (FormDataCtor && thing instanceof FormDataCtor) return true;
  const proto = getPrototypeOf(thing);
  if (!proto || proto === Object.prototype) return false;
  if (!isFunction(thing.append)) return false;
  const kind = kindOf(thing);
  return kind === "formdata" || // detect form-data instance
  kind === "object" && isFunction(thing.toString) && thing.toString() === "[object FormData]";
};
var isURLSearchParams = kindOfTest("URLSearchParams");
var [isReadableStream, isRequest, isResponse, isHeaders] = [
  "ReadableStream",
  "Request",
  "Response",
  "Headers"
].map(kindOfTest);
var trim = (str) => {
  return str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
};
function forEach(obj, fn2, { allOwnKeys = false } = {}) {
  if (obj === null || typeof obj === "undefined") {
    return;
  }
  let i3;
  let l3;
  if (typeof obj !== "object") {
    obj = [obj];
  }
  if (isArray(obj)) {
    for (i3 = 0, l3 = obj.length; i3 < l3; i3++) {
      fn2.call(null, obj[i3], i3, obj);
    }
  } else {
    if (isBuffer(obj)) {
      return;
    }
    const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
    const len = keys.length;
    let key;
    for (i3 = 0; i3 < len; i3++) {
      key = keys[i3];
      fn2.call(null, obj[key], key, obj);
    }
  }
}
function findKey(obj, key) {
  if (isBuffer(obj)) {
    return null;
  }
  key = key.toLowerCase();
  const keys = Object.keys(obj);
  let i3 = keys.length;
  let _key;
  while (i3-- > 0) {
    _key = keys[i3];
    if (key === _key.toLowerCase()) {
      return _key;
    }
  }
  return null;
}
var _global = (() => {
  if (typeof globalThis !== "undefined") return globalThis;
  return typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
})();
var isContextDefined = (context) => !isUndefined(context) && context !== _global;
function merge(...objs) {
  const { caseless, skipUndefined } = isContextDefined(this) && this || {};
  const result = {};
  const assignValue = (val, key) => {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      return;
    }
    const targetKey = caseless && typeof key === "string" && findKey(result, key) || key;
    const existing = hasOwnProperty(result, targetKey) ? result[targetKey] : void 0;
    if (isPlainObject(existing) && isPlainObject(val)) {
      result[targetKey] = merge(existing, val);
    } else if (isPlainObject(val)) {
      result[targetKey] = merge({}, val);
    } else if (isArray(val)) {
      result[targetKey] = val.slice();
    } else if (!skipUndefined || !isUndefined(val)) {
      result[targetKey] = val;
    }
  };
  for (let i3 = 0, l3 = objs.length; i3 < l3; i3++) {
    const source = objs[i3];
    if (!source || isBuffer(source)) {
      continue;
    }
    forEach(source, assignValue);
    if (typeof source !== "object" || isArray(source)) {
      continue;
    }
    const symbols = Object.getOwnPropertySymbols(source);
    for (let j5 = 0; j5 < symbols.length; j5++) {
      const symbol = symbols[j5];
      if (propertyIsEnumerable.call(source, symbol)) {
        assignValue(source[symbol], symbol);
      }
    }
  }
  return result;
}
var extend = (a3, b4, thisArg, { allOwnKeys } = {}) => {
  forEach(
    b4,
    (val, key) => {
      if (thisArg && isFunction(val)) {
        Object.defineProperty(a3, key, {
          // Null-proto descriptor so a polluted Object.prototype.get cannot
          // hijack defineProperty's accessor-vs-data resolution.
          __proto__: null,
          value: bind(val, thisArg),
          writable: true,
          enumerable: true,
          configurable: true
        });
      } else {
        Object.defineProperty(a3, key, {
          __proto__: null,
          value: val,
          writable: true,
          enumerable: true,
          configurable: true
        });
      }
    },
    { allOwnKeys }
  );
  return a3;
};
var stripBOM = (content) => {
  if (content.charCodeAt(0) === 65279) {
    content = content.slice(1);
  }
  return content;
};
var inherits = (constructor, superConstructor, props, descriptors) => {
  constructor.prototype = Object.create(superConstructor.prototype, descriptors);
  Object.defineProperty(constructor.prototype, "constructor", {
    __proto__: null,
    value: constructor,
    writable: true,
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(constructor, "super", {
    __proto__: null,
    value: superConstructor.prototype
  });
  props && Object.assign(constructor.prototype, props);
};
var toFlatObject = (sourceObj, destObj, filter2, propFilter) => {
  let props;
  let i3;
  let prop;
  const merged = {};
  destObj = destObj || {};
  if (sourceObj == null) return destObj;
  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i3 = props.length;
    while (i3-- > 0) {
      prop = props[i3];
      if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
        destObj[prop] = sourceObj[prop];
        merged[prop] = true;
      }
    }
    sourceObj = filter2 !== false && getPrototypeOf(sourceObj);
  } while (sourceObj && (!filter2 || filter2(sourceObj, destObj)) && sourceObj !== Object.prototype);
  return destObj;
};
var endsWith = (str, searchString, position) => {
  str = String(str);
  if (position === void 0 || position > str.length) {
    position = str.length;
  }
  position -= searchString.length;
  const lastIndex = str.indexOf(searchString, position);
  return lastIndex !== -1 && lastIndex === position;
};
var toArray = (thing) => {
  if (!thing) return null;
  if (isArray(thing)) return thing;
  let i3 = thing.length;
  if (!isNumber(i3)) return null;
  const arr = new Array(i3);
  while (i3-- > 0) {
    arr[i3] = thing[i3];
  }
  return arr;
};
var isTypedArray = /* @__PURE__ */ ((TypedArray) => {
  return (thing) => {
    return TypedArray && thing instanceof TypedArray;
  };
})(typeof Uint8Array !== "undefined" && getPrototypeOf(Uint8Array));
var forEachEntry = (obj, fn2) => {
  const generator = obj && obj[iterator];
  const _iterator = generator.call(obj);
  let result;
  while ((result = _iterator.next()) && !result.done) {
    const pair = result.value;
    fn2.call(obj, pair[0], pair[1]);
  }
};
var matchAll = (regExp, str) => {
  let matches;
  const arr = [];
  while ((matches = regExp.exec(str)) !== null) {
    arr.push(matches);
  }
  return arr;
};
var isHTMLForm = kindOfTest("HTMLFormElement");
var toCamelCase = (str) => {
  return str.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function replacer(m4, p1, p22) {
    return p1.toUpperCase() + p22;
  });
};
var { propertyIsEnumerable } = Object.prototype;
var isRegExp = kindOfTest("RegExp");
var reduceDescriptors = (obj, reducer) => {
  const descriptors = Object.getOwnPropertyDescriptors(obj);
  const reducedDescriptors = {};
  forEach(descriptors, (descriptor, name) => {
    let ret;
    if ((ret = reducer(descriptor, name, obj)) !== false) {
      reducedDescriptors[name] = ret || descriptor;
    }
  });
  Object.defineProperties(obj, reducedDescriptors);
};
var freezeMethods = (obj) => {
  reduceDescriptors(obj, (descriptor, name) => {
    if (isFunction(obj) && ["arguments", "caller", "callee"].includes(name)) {
      return false;
    }
    const value = obj[name];
    if (!isFunction(value)) return;
    descriptor.enumerable = false;
    if ("writable" in descriptor) {
      descriptor.writable = false;
      return;
    }
    if (!descriptor.set) {
      descriptor.set = () => {
        throw Error("Can not rewrite read-only method '" + name + "'");
      };
    }
  });
};
var toObjectSet = (arrayOrString, delimiter) => {
  const obj = {};
  const define2 = (arr) => {
    arr.forEach((value) => {
      obj[value] = true;
    });
  };
  isArray(arrayOrString) ? define2(arrayOrString) : define2(String(arrayOrString).split(delimiter));
  return obj;
};
var noop = () => {
};
var toFiniteNumber = (value, defaultValue) => {
  return value != null && Number.isFinite(value = +value) ? value : defaultValue;
};
function isSpecCompliantForm(thing) {
  return !!(thing && isFunction(thing.append) && thing[toStringTag] === "FormData" && thing[iterator]);
}
var toJSONObject = (obj) => {
  const visited = /* @__PURE__ */ new WeakSet();
  const visit = (source) => {
    if (isObject(source)) {
      if (visited.has(source)) {
        return;
      }
      if (isBuffer(source)) {
        return source;
      }
      if (!("toJSON" in source)) {
        visited.add(source);
        let target;
        if (isSet(source)) {
          target = [];
          for (const value of source) {
            const reducedValue = visit(value);
            !isUndefined(reducedValue) && target.push(reducedValue);
          }
        } else {
          target = isArray(source) ? [] : {};
          forEach(source, (value, key) => {
            const reducedValue = visit(value);
            !isUndefined(reducedValue) && (target[key] = reducedValue);
          });
        }
        visited.delete(source);
        return target;
      }
    }
    return source;
  };
  return visit(obj);
};
var isAsyncFn = kindOfTest("AsyncFunction");
var isThenable = (thing) => thing && (isObject(thing) || isFunction(thing)) && isFunction(thing.then) && isFunction(thing.catch);
var _setImmediate = ((setImmediateSupported, postMessageSupported) => {
  if (setImmediateSupported) {
    return setImmediate;
  }
  return postMessageSupported ? ((token, callbacks) => {
    _global.addEventListener(
      "message",
      ({ source, data }) => {
        if (source === _global && data === token) {
          callbacks.length && callbacks.shift()();
        }
      },
      false
    );
    return (cb) => {
      callbacks.push(cb);
      _global.postMessage(token, "*");
    };
  })(`axios@${Math.random()}`, []) : (cb) => setTimeout(cb);
})(typeof setImmediate === "function", isFunction(_global.postMessage));
var asap = typeof queueMicrotask !== "undefined" ? queueMicrotask.bind(_global) : typeof process !== "undefined" && process.nextTick || _setImmediate;
var isIterable = (thing) => thing != null && isFunction(thing[iterator]);
var isSafeIterable = (thing) => thing != null && hasOwnInPrototypeChain(thing, iterator) && isIterable(thing);
var utils_default = {
  isArray,
  isArrayBuffer,
  isBuffer,
  isFormData,
  isArrayBufferView,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isPlainObject,
  isEmptyObject,
  isReadableStream,
  isRequest,
  isResponse,
  isHeaders,
  isUndefined,
  isDate,
  isFile,
  isReactNativeBlob,
  isReactNative,
  isBlob,
  isRegExp,
  isFunction,
  isStream,
  isURLSearchParams,
  isTypedArray,
  isFileList,
  forEach,
  merge,
  extend,
  trim,
  stripBOM,
  inherits,
  toFlatObject,
  kindOf,
  kindOfTest,
  endsWith,
  toArray,
  forEachEntry,
  matchAll,
  isHTMLForm,
  hasOwnProperty,
  hasOwnProp: hasOwnProperty,
  // an alias to avoid ESLint no-prototype-builtins detection
  hasOwnInPrototypeChain,
  getSafeProp,
  reduceDescriptors,
  freezeMethods,
  toObjectSet,
  toCamelCase,
  noop,
  toFiniteNumber,
  findKey,
  global: _global,
  isContextDefined,
  isSpecCompliantForm,
  toJSONObject,
  isAsyncFn,
  isThenable,
  setImmediate: _setImmediate,
  asap,
  isIterable,
  isSafeIterable
};

// node_modules/axios/lib/helpers/parseHeaders.js
var ignoreDuplicateOf = utils_default.toObjectSet([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent"
]);
var parseHeaders_default = (rawHeaders) => {
  const parsed = {};
  let key;
  let val;
  let i3;
  rawHeaders && rawHeaders.split("\n").forEach(function parser(line) {
    i3 = line.indexOf(":");
    key = line.substring(0, i3).trim().toLowerCase();
    val = line.substring(i3 + 1).trim();
    const hasKey = utils_default.hasOwnProp(parsed, key);
    if (!key || hasKey && utils_default.hasOwnProp(ignoreDuplicateOf, key)) {
      return;
    }
    if (key === "set-cookie") {
      if (hasKey) {
        parsed[key].push(val);
      } else {
        parsed[key] = [val];
      }
    } else {
      parsed[key] = hasKey ? parsed[key] + ", " + val : val;
    }
  });
  return parsed;
};

// node_modules/axios/lib/helpers/sanitizeHeaderValue.js
function trimSPorHTAB(str) {
  let start = 0;
  let end = str.length;
  while (start < end) {
    const code = str.charCodeAt(start);
    if (code !== 9 && code !== 32) {
      break;
    }
    start += 1;
  }
  while (end > start) {
    const code = str.charCodeAt(end - 1);
    if (code !== 9 && code !== 32) {
      break;
    }
    end -= 1;
  }
  return start === 0 && end === str.length ? str : str.slice(start, end);
}
var INVALID_UNICODE_HEADER_VALUE_CHARS = new RegExp("[\\u0000-\\u0008\\u000a-\\u001f\\u007f]+", "g");
var INVALID_BYTE_STRING_HEADER_VALUE_CHARS = new RegExp("[^\\u0009\\u0020-\\u007e\\u0080-\\u00ff]+", "g");
function sanitizeValue(value, invalidChars) {
  if (utils_default.isArray(value)) {
    return value.map((item) => sanitizeValue(item, invalidChars));
  }
  return trimSPorHTAB(String(value).replace(invalidChars, ""));
}
var sanitizeHeaderValue = (value) => sanitizeValue(value, INVALID_UNICODE_HEADER_VALUE_CHARS);
var sanitizeByteStringHeaderValue = (value) => sanitizeValue(value, INVALID_BYTE_STRING_HEADER_VALUE_CHARS);
function toByteStringHeaderObject(headers) {
  const byteStringHeaders = /* @__PURE__ */ Object.create(null);
  utils_default.forEach(headers.toJSON(), (value, header) => {
    byteStringHeaders[header] = sanitizeByteStringHeaderValue(value);
  });
  return byteStringHeaders;
}

// node_modules/axios/lib/core/AxiosHeaders.js
var $internals = Symbol("internals");
function normalizeHeader(header) {
  return header && String(header).trim().toLowerCase();
}
function normalizeValue(value) {
  if (value === false || value == null) {
    return value;
  }
  return utils_default.isArray(value) ? value.map(normalizeValue) : sanitizeHeaderValue(String(value));
}
function parseTokens(str) {
  const tokens = /* @__PURE__ */ Object.create(null);
  const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let match;
  while (match = tokensRE.exec(str)) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}
var parameterNameRE = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
function trimOWS(value) {
  let start = 0;
  let end = value.length;
  while (start < end) {
    const code = value.charCodeAt(start);
    if (code !== 9 && code !== 32) {
      break;
    }
    start += 1;
  }
  while (end > start) {
    const code = value.charCodeAt(end - 1);
    if (code !== 9 && code !== 32) {
      break;
    }
    end -= 1;
  }
  return start === 0 && end === value.length ? value : value.slice(start, end);
}
function decodeQuotedString(value) {
  const last = value.length - 1;
  if (last < 1 || value.charCodeAt(0) !== 34 || value.charCodeAt(last) !== 34) {
    return value;
  }
  let decoded = "";
  for (let i3 = 1; i3 < last; i3++) {
    const code = value.charCodeAt(i3);
    if (code === 34) {
      return value;
    }
    if (code === 92) {
      i3 += 1;
      if (i3 >= last) {
        return value;
      }
    }
    decoded += value[i3];
  }
  return decoded;
}
function parseParameters(value) {
  const parameters = /* @__PURE__ */ Object.create(null);
  const str = String(value);
  let start = 0;
  let quoted = false;
  let escaped = false;
  function parseParameter(end) {
    const part = trimOWS(str.slice(start, end));
    const equals = part.indexOf("=");
    if (equals < 1) {
      return;
    }
    const name = trimOWS(part.slice(0, equals));
    if (!parameterNameRE.test(name)) {
      return;
    }
    const normalizedName = name.toLowerCase();
    if (normalizedName === "__proto__" || normalizedName === "constructor" || normalizedName === "prototype") {
      return;
    }
    const parameterValue = trimOWS(part.slice(equals + 1));
    parameters[normalizedName] = decodeQuotedString(parameterValue);
  }
  for (let i3 = 0; i3 < str.length; i3++) {
    const code = str.charCodeAt(i3);
    if (quoted) {
      if (escaped) {
        escaped = false;
      } else if (code === 92) {
        escaped = true;
      } else if (code === 34) {
        quoted = false;
      }
    } else if (code === 34) {
      quoted = true;
    } else if (code === 44 || code === 59) {
      parseParameter(i3);
      start = i3 + 1;
    }
  }
  parseParameter(str.length);
  return parameters;
}
var isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());
function matchHeaderValue(context, value, header, filter2, isHeaderNameFilter) {
  if (utils_default.isFunction(filter2)) {
    return filter2.call(this, value, header);
  }
  if (isHeaderNameFilter) {
    value = header;
  }
  if (!utils_default.isString(value)) return;
  if (utils_default.isString(filter2)) {
    return value.indexOf(filter2) !== -1;
  }
  if (utils_default.isRegExp(filter2)) {
    return filter2.test(value);
  }
}
function formatHeader(header) {
  return header.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (w4, char, str) => {
    return char.toUpperCase() + str;
  });
}
function buildAccessors(obj, header) {
  const accessorName = utils_default.toCamelCase(" " + header);
  ["get", "set", "has"].forEach((methodName) => {
    Object.defineProperty(obj, methodName + accessorName, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot turn
      // this data descriptor into an accessor descriptor on the way in.
      __proto__: null,
      value: function(arg1, arg2, arg3) {
        return this[methodName].call(this, header, arg1, arg2, arg3);
      },
      configurable: true
    });
  });
}
var AxiosHeaders = class {
  constructor(headers) {
    headers && this.set(headers);
  }
  set(header, valueOrRewrite, rewrite) {
    const self2 = this;
    function setHeader(_value, _header, _rewrite) {
      const lHeader = normalizeHeader(_header);
      if (!lHeader) {
        return;
      }
      const key = utils_default.findKey(self2, lHeader);
      if (!key || self2[key] === void 0 || _rewrite === true || _rewrite === void 0 && self2[key] !== false) {
        self2[key || _header] = normalizeValue(_value);
      }
    }
    const setHeaders = (headers, _rewrite) => utils_default.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));
    if (utils_default.isPlainObject(header) || header instanceof this.constructor) {
      setHeaders(header, valueOrRewrite);
    } else if (utils_default.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
      setHeaders(parseHeaders_default(header), valueOrRewrite);
    } else if (utils_default.isObject(header) && utils_default.isSafeIterable(header)) {
      let obj = /* @__PURE__ */ Object.create(null), dest, key;
      for (const entry of header) {
        if (!utils_default.isArray(entry)) {
          throw new TypeError("Object iterator must return a key-value pair");
        }
        key = entry[0];
        if (utils_default.hasOwnProp(obj, key)) {
          dest = obj[key];
          obj[key] = utils_default.isArray(dest) ? [...dest, entry[1]] : [dest, entry[1]];
        } else {
          obj[key] = entry[1];
        }
      }
      setHeaders(obj, valueOrRewrite);
    } else {
      header != null && setHeader(valueOrRewrite, header, rewrite);
    }
    return this;
  }
  get(header, parser) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils_default.findKey(this, header);
      if (key) {
        const value = this[key];
        if (!parser) {
          return value;
        }
        if (parser === true) {
          return parseTokens(value);
        }
        if (utils_default.isFunction(parser)) {
          return parser.call(this, value, key);
        }
        if (utils_default.isRegExp(parser)) {
          return parser.exec(value);
        }
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(header, matcher) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils_default.findKey(this, header);
      return !!(key && this[key] !== void 0 && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
    }
    return false;
  }
  delete(header, matcher) {
    const self2 = this;
    let deleted = false;
    function deleteHeader(_header) {
      _header = normalizeHeader(_header);
      if (_header) {
        const key = utils_default.findKey(self2, _header);
        if (key && (!matcher || matchHeaderValue(self2, self2[key], key, matcher))) {
          delete self2[key];
          deleted = true;
        }
      }
    }
    if (utils_default.isArray(header)) {
      header.forEach(deleteHeader);
    } else {
      deleteHeader(header);
    }
    return deleted;
  }
  clear(matcher) {
    const keys = Object.keys(this);
    let i3 = keys.length;
    let deleted = false;
    while (i3--) {
      const key = keys[i3];
      if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
        delete this[key];
        deleted = true;
      }
    }
    return deleted;
  }
  normalize(format) {
    const self2 = this;
    const headers = {};
    utils_default.forEach(this, (value, header) => {
      const key = utils_default.findKey(headers, header);
      if (key) {
        self2[key] = normalizeValue(value);
        delete self2[header];
        return;
      }
      const normalized = format ? formatHeader(header) : String(header).trim();
      if (normalized !== header) {
        delete self2[header];
      }
      self2[normalized] = normalizeValue(value);
      headers[normalized] = true;
    });
    return this;
  }
  concat(...targets) {
    return this.constructor.concat(this, ...targets);
  }
  toJSON(asStrings) {
    const obj = /* @__PURE__ */ Object.create(null);
    utils_default.forEach(this, (value, header) => {
      value != null && value !== false && (obj[header] = asStrings && utils_default.isArray(value) ? value.join(", ") : value);
    });
    return obj;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([header, value]) => header + ": " + value).join("\n");
  }
  getSetCookie() {
    const value = this.get("set-cookie");
    return utils_default.isArray(value) ? value : value == null || value === false ? [] : [value];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(thing) {
    return thing instanceof this ? thing : new this(thing);
  }
  static parseParameters(value) {
    return parseParameters(value);
  }
  static concat(first, ...targets) {
    const computed = new this(first);
    targets.forEach((target) => computed.set(target));
    return computed;
  }
  static accessor(header) {
    const internals = this[$internals] = this[$internals] = {
      accessors: {}
    };
    const accessors = internals.accessors;
    const prototype2 = this.prototype;
    function defineAccessor(_header) {
      const lHeader = normalizeHeader(_header);
      if (!accessors[lHeader]) {
        buildAccessors(prototype2, _header);
        accessors[lHeader] = true;
      }
    }
    utils_default.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);
    return this;
  }
};
AxiosHeaders.accessor([
  "Content-Type",
  "Content-Length",
  "Accept",
  "Accept-Encoding",
  "User-Agent",
  "Authorization"
]);
utils_default.reduceDescriptors(AxiosHeaders.prototype, ({ value }, key) => {
  let mapped = key[0].toUpperCase() + key.slice(1);
  return {
    get: () => value,
    set(headerValue) {
      this[mapped] = headerValue;
    }
  };
});
utils_default.freezeMethods(AxiosHeaders);
var AxiosHeaders_default = AxiosHeaders;

// node_modules/axios/lib/core/AxiosError.js
var REDACTED = "[REDACTED ****]";
function hasOwnOrPrototypeToJSON(source) {
  if (utils_default.hasOwnProp(source, "toJSON")) {
    return true;
  }
  let prototype2 = Object.getPrototypeOf(source);
  while (prototype2 && prototype2 !== Object.prototype) {
    if (utils_default.hasOwnProp(prototype2, "toJSON")) {
      return true;
    }
    prototype2 = Object.getPrototypeOf(prototype2);
  }
  return false;
}
function redactConfig(config, redactKeys) {
  const lowerKeys = new Set(redactKeys.map((k5) => String(k5).toLowerCase()));
  const seen = [];
  const visit = (source) => {
    if (source === null || typeof source !== "object") return source;
    if (utils_default.isBuffer(source)) return source;
    if (seen.indexOf(source) !== -1) return void 0;
    if (source instanceof AxiosHeaders_default) {
      source = source.toJSON();
    }
    seen.push(source);
    let result;
    if (utils_default.isArray(source)) {
      result = [];
      source.forEach((v4, i3) => {
        const reducedValue = visit(v4);
        if (!utils_default.isUndefined(reducedValue)) {
          result[i3] = reducedValue;
        }
      });
    } else {
      if (!utils_default.isPlainObject(source) && hasOwnOrPrototypeToJSON(source)) {
        seen.pop();
        return source;
      }
      result = /* @__PURE__ */ Object.create(null);
      for (const [key, value] of Object.entries(source)) {
        const reducedValue = lowerKeys.has(key.toLowerCase()) ? REDACTED : visit(value);
        if (!utils_default.isUndefined(reducedValue)) {
          result[key] = reducedValue;
        }
      }
    }
    seen.pop();
    return result;
  };
  return visit(config);
}
function stringifySafely(value) {
  try {
    return String(value);
  } catch (err) {
    return "";
  }
}
function aggregateErrorMessage(error) {
  const message = error.errors.map((entry) => {
    try {
      return entry && entry.message ? stringifySafely(entry.message) : stringifySafely(entry);
    } catch (err) {
      return "";
    }
  }).filter(Boolean).join("; ");
  return message || error.name || "AggregateError";
}
var AxiosError = class _AxiosError extends Error {
  static from(error, code, config, request, response, customProps) {
    let message = error.message;
    if (!message && utils_default.isArray(error.errors) && error.errors.length) {
      message = aggregateErrorMessage(error);
    }
    const axiosError = new _AxiosError(message, code || error.code, config, request, response);
    Object.defineProperty(axiosError, "cause", {
      __proto__: null,
      value: error,
      writable: true,
      enumerable: false,
      configurable: true
    });
    axiosError.name = error.name;
    if (error.status != null && axiosError.status == null) {
      axiosError.status = error.status;
    }
    customProps && Object.assign(axiosError, customProps);
    return axiosError;
  }
  /**
   * Create an Error with the specified message, config, error code, request and response.
   *
   * @param {string} message The error message.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [config] The config.
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   *
   * @returns {Error} The created error.
   */
  constructor(message, code, config, request, response) {
    super(message);
    Object.defineProperty(this, "message", {
      // Null-proto descriptor so a polluted Object.prototype.get cannot turn
      // this data descriptor into an accessor descriptor on the way in.
      __proto__: null,
      value: message,
      enumerable: true,
      writable: true,
      configurable: true
    });
    this.name = "AxiosError";
    this.isAxiosError = true;
    code && (this.code = code);
    config && (this.config = config);
    request && (this.request = request);
    if (response) {
      this.response = response;
      this.status = response.status;
    }
  }
  toJSON() {
    const config = this.config;
    const redactKeys = config && utils_default.hasOwnProp(config, "redact") ? config.redact : void 0;
    const serializedConfig = utils_default.isArray(redactKeys) && redactKeys.length > 0 ? redactConfig(config, redactKeys) : utils_default.toJSONObject(config);
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: serializedConfig,
      code: this.code,
      status: this.status
    };
  }
};
AxiosError.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE";
AxiosError.ERR_BAD_OPTION = "ERR_BAD_OPTION";
AxiosError.ECONNABORTED = "ECONNABORTED";
AxiosError.ETIMEDOUT = "ETIMEDOUT";
AxiosError.ECONNREFUSED = "ECONNREFUSED";
AxiosError.ERR_NETWORK = "ERR_NETWORK";
AxiosError.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS";
AxiosError.ERR_DEPRECATED = "ERR_DEPRECATED";
AxiosError.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE";
AxiosError.ERR_BAD_REQUEST = "ERR_BAD_REQUEST";
AxiosError.ERR_CANCELED = "ERR_CANCELED";
AxiosError.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT";
AxiosError.ERR_INVALID_URL = "ERR_INVALID_URL";
AxiosError.ERR_FORM_DATA_DEPTH_EXCEEDED = "ERR_FORM_DATA_DEPTH_EXCEEDED";
var AxiosError_default = AxiosError;

// node_modules/axios/lib/helpers/null.js
var null_default = null;

// node_modules/axios/lib/helpers/toFormData.js
var DEFAULT_FORM_DATA_MAX_DEPTH = 100;
function isVisitable(thing) {
  return utils_default.isPlainObject(thing) || utils_default.isArray(thing);
}
function removeBrackets(key) {
  return utils_default.endsWith(key, "[]") ? key.slice(0, -2) : key;
}
function renderKey(path, key, dots) {
  if (!path) return key;
  return path.concat(key).map(function each(token, i3) {
    token = removeBrackets(token);
    return !dots && i3 ? "[" + token + "]" : token;
  }).join(dots ? "." : "");
}
function isFlatArray(arr) {
  return utils_default.isArray(arr) && !arr.some(isVisitable);
}
var predicates = utils_default.toFlatObject(utils_default, {}, null, function filter(prop) {
  return /^is[A-Z]/.test(prop);
});
function toFormData(obj, formData, options) {
  if (!utils_default.isObject(obj)) {
    throw new TypeError("target must be an object");
  }
  formData = formData || new (null_default || FormData)();
  options = utils_default.toFlatObject(
    options,
    {
      metaTokens: true,
      dots: false,
      indexes: false
    },
    false,
    function defined(option, source) {
      return !utils_default.isUndefined(source[option]);
    }
  );
  const metaTokens = options.metaTokens;
  const visitor = options.visitor || defaultVisitor;
  const dots = options.dots;
  const indexes = options.indexes;
  const _Blob = options.Blob || typeof Blob !== "undefined" && Blob;
  const maxDepth = options.maxDepth === void 0 ? DEFAULT_FORM_DATA_MAX_DEPTH : options.maxDepth;
  const useBlob = _Blob && utils_default.isSpecCompliantForm(formData);
  const stack = [];
  if (!utils_default.isFunction(visitor)) {
    throw new TypeError("visitor must be a function");
  }
  function convertValue(value) {
    if (value === null) return "";
    if (utils_default.isDate(value)) {
      return value.toISOString();
    }
    if (utils_default.isBoolean(value)) {
      return value.toString();
    }
    if (!useBlob && utils_default.isBlob(value)) {
      throw new AxiosError_default("Blob is not supported. Use a Buffer instead.");
    }
    if (utils_default.isArrayBuffer(value) || utils_default.isTypedArray(value)) {
      if (useBlob && typeof _Blob === "function") {
        return new _Blob([value]);
      }
      if (null_default && null_default.isBufferAvailable()) {
        return null_default.from(value);
      }
      throw new AxiosError_default("Blob is not supported. Use a Buffer instead.", AxiosError_default.ERR_NOT_SUPPORT);
    }
    return value;
  }
  function throwIfMaxDepthExceeded(depth) {
    if (depth > maxDepth) {
      throw new AxiosError_default(
        "Object is too deeply nested (" + depth + " levels). Max depth: " + maxDepth,
        AxiosError_default.ERR_FORM_DATA_DEPTH_EXCEEDED
      );
    }
  }
  function stringifyWithDepthLimit(value, depth) {
    if (maxDepth === Infinity) {
      return JSON.stringify(value);
    }
    const ancestors = [];
    return JSON.stringify(value, function limitDepth(_key, currentValue) {
      if (!utils_default.isObject(currentValue)) {
        return currentValue;
      }
      while (ancestors.length && ancestors[ancestors.length - 1] !== this) {
        ancestors.pop();
      }
      ancestors.push(currentValue);
      throwIfMaxDepthExceeded(depth + ancestors.length - 1);
      return currentValue;
    });
  }
  function defaultVisitor(value, key, path) {
    let arr = value;
    if (utils_default.isReactNative(formData) && utils_default.isReactNativeBlob(value)) {
      formData.append(renderKey(path, key, dots), convertValue(value));
      return false;
    }
    if (value && !path && typeof value === "object") {
      if (utils_default.endsWith(key, "{}")) {
        key = metaTokens ? key : key.slice(0, -2);
        value = stringifyWithDepthLimit(value, 1);
      } else if (utils_default.isArray(value) && isFlatArray(value) || (utils_default.isFileList(value) || utils_default.endsWith(key, "[]")) && (arr = utils_default.toArray(value))) {
        key = removeBrackets(key);
        arr.forEach(function each(el, index2) {
          !(utils_default.isUndefined(el) || el === null) && formData.append(
            // eslint-disable-next-line no-nested-ternary
            indexes === true ? renderKey([key], index2, dots) : indexes === null ? key : key + "[]",
            convertValue(el)
          );
        });
        return false;
      }
    }
    if (isVisitable(value)) {
      return true;
    }
    formData.append(renderKey(path, key, dots), convertValue(value));
    return false;
  }
  const exposedHelpers = Object.assign(predicates, {
    defaultVisitor,
    convertValue,
    isVisitable
  });
  function build(value, path, depth = 0) {
    if (utils_default.isUndefined(value)) return;
    throwIfMaxDepthExceeded(depth);
    if (stack.indexOf(value) !== -1) {
      throw new Error("Circular reference detected in " + path.join("."));
    }
    stack.push(value);
    utils_default.forEach(value, function each(el, key) {
      const result = !(utils_default.isUndefined(el) || el === null) && visitor.call(formData, el, utils_default.isString(key) ? key.trim() : key, path, exposedHelpers);
      if (result === true) {
        build(el, path ? path.concat(key) : [key], depth + 1);
      }
    });
    stack.pop();
  }
  if (!utils_default.isObject(obj)) {
    throw new TypeError("data must be an object");
  }
  build(obj);
  return formData;
}
var toFormData_default = toFormData;

// node_modules/axios/lib/helpers/AxiosURLSearchParams.js
function encode(str) {
  const charMap = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+"
  };
  return encodeURIComponent(str).replace(/[!'()~]|%20/g, function replacer(match) {
    return charMap[match];
  });
}
function AxiosURLSearchParams(params, options) {
  this._pairs = [];
  params && toFormData_default(params, this, options);
}
var prototype = AxiosURLSearchParams.prototype;
prototype.append = function append(name, value) {
  this._pairs.push([name, value]);
};
prototype.toString = function toString2(encoder3) {
  const _encode = encoder3 ? (value) => encoder3.call(this, value, encode) : encode;
  return this._pairs.map(function each(pair) {
    return _encode(pair[0]) + "=" + _encode(pair[1]);
  }, "").join("&");
};
var AxiosURLSearchParams_default = AxiosURLSearchParams;

// node_modules/axios/lib/helpers/buildURL.js
function encode2(val) {
  return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function buildURL(url, params, options) {
  if (!params) {
    return url;
  }
  url = url || "";
  const _options = utils_default.isFunction(options) ? {
    serialize: options
  } : options;
  const _encode = utils_default.getSafeProp(_options, "encode") || encode2;
  const serializeFn = utils_default.getSafeProp(_options, "serialize");
  let serializedParams;
  if (serializeFn) {
    serializedParams = serializeFn(params, _options);
  } else {
    serializedParams = utils_default.isURLSearchParams(params) ? params.toString() : new AxiosURLSearchParams_default(params, _options).toString(_encode);
  }
  if (serializedParams) {
    const hashmarkIndex = url.indexOf("#");
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }
    url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
  }
  return url;
}

// node_modules/axios/lib/core/InterceptorManager.js
var InterceptorManager = class {
  constructor() {
    this.handlers = [];
  }
  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   * @param {Object} options The options for the interceptor, synchronous and runWhen
   *
   * @return {Number} An ID used to remove interceptor later
   */
  use(fulfilled, rejected, options) {
    this.handlers.push({
      fulfilled,
      rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : null
    });
    return this.handlers.length - 1;
  }
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {void}
   */
  eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    if (this.handlers) {
      this.handlers = [];
    }
  }
  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */
  forEach(fn2) {
    utils_default.forEach(this.handlers, function forEachHandler(h4) {
      if (h4 !== null) {
        fn2(h4);
      }
    });
  }
};
var InterceptorManager_default = InterceptorManager;

// node_modules/axios/lib/defaults/transitional.js
var transitional_default = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false,
  legacyInterceptorReqResOrdering: true,
  advertiseZstdAcceptEncoding: false,
  validateStatusUndefinedResolves: true
};

// node_modules/axios/lib/platform/browser/classes/URLSearchParams.js
var URLSearchParams_default = typeof URLSearchParams !== "undefined" ? URLSearchParams : AxiosURLSearchParams_default;

// node_modules/axios/lib/platform/browser/classes/FormData.js
var FormData_default = typeof FormData !== "undefined" ? FormData : null;

// node_modules/axios/lib/platform/browser/classes/Blob.js
var Blob_default = typeof Blob !== "undefined" ? Blob : null;

// node_modules/axios/lib/platform/browser/index.js
var browser_default = {
  isBrowser: true,
  classes: {
    URLSearchParams: URLSearchParams_default,
    FormData: FormData_default,
    Blob: Blob_default
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
};

// node_modules/axios/lib/platform/common/utils.js
var utils_exports = {};
__export(utils_exports, {
  hasBrowserEnv: () => hasBrowserEnv,
  hasStandardBrowserEnv: () => hasStandardBrowserEnv,
  hasStandardBrowserWebWorkerEnv: () => hasStandardBrowserWebWorkerEnv,
  navigator: () => _navigator,
  origin: () => origin
});
var hasBrowserEnv = typeof window !== "undefined" && typeof document !== "undefined";
var _navigator = typeof navigator === "object" && navigator || void 0;
var hasStandardBrowserEnv = hasBrowserEnv && (!_navigator || ["ReactNative", "NativeScript", "NS"].indexOf(_navigator.product) < 0);
var hasStandardBrowserWebWorkerEnv = (() => {
  return typeof WorkerGlobalScope !== "undefined" && // eslint-disable-next-line no-undef
  self instanceof WorkerGlobalScope && typeof self.importScripts === "function";
})();
var origin = hasBrowserEnv && window.location.href || "http://localhost";

// node_modules/axios/lib/platform/index.js
var platform_default = {
  ...utils_exports,
  ...browser_default
};

// node_modules/axios/lib/helpers/toURLEncodedForm.js
function toURLEncodedForm(data, options) {
  return toFormData_default(data, new platform_default.classes.URLSearchParams(), {
    visitor: function(value, key, path, helpers) {
      if (platform_default.isNode && utils_default.isBuffer(value)) {
        this.append(key, value.toString("base64"));
        return false;
      }
      return helpers.defaultVisitor.apply(this, arguments);
    },
    ...options
  });
}

// node_modules/axios/lib/helpers/formDataToJSON.js
var MAX_DEPTH = DEFAULT_FORM_DATA_MAX_DEPTH;
function throwIfDepthExceeded(index2) {
  if (index2 > MAX_DEPTH) {
    throw new AxiosError_default(
      "FormData field is too deeply nested (" + index2 + " levels). Max depth: " + MAX_DEPTH,
      AxiosError_default.ERR_FORM_DATA_DEPTH_EXCEEDED
    );
  }
}
function parsePropPath(name) {
  const path = [];
  const pattern = /[^.[\]]+|\[([^.[\]]*)]/g;
  let match;
  while ((match = pattern.exec(name)) !== null) {
    throwIfDepthExceeded(path.length);
    path.push(match[0] === "[]" ? "" : match[1] || match[0]);
  }
  return path;
}
function arrayToObject(arr) {
  const obj = {};
  const keys = Object.keys(arr);
  let i3;
  const len = keys.length;
  let key;
  for (i3 = 0; i3 < len; i3++) {
    key = keys[i3];
    obj[key] = arr[key];
  }
  return obj;
}
function formDataToJSON(formData) {
  function buildPath(path, value, target, index2) {
    throwIfDepthExceeded(index2);
    let name = path[index2++];
    if (name === "__proto__") return true;
    const isNumericKey = Number.isFinite(+name);
    const isLast = index2 >= path.length;
    name = !name && utils_default.isArray(target) ? target.length : name;
    if (isLast) {
      if (utils_default.hasOwnProp(target, name)) {
        target[name] = utils_default.isArray(target[name]) ? target[name].concat(value) : [target[name], value];
      } else {
        target[name] = value;
      }
      return !isNumericKey;
    }
    if (!utils_default.hasOwnProp(target, name) || !utils_default.isObject(target[name])) {
      target[name] = [];
    }
    const result = buildPath(path, value, target[name], index2);
    if (result && utils_default.isArray(target[name])) {
      target[name] = arrayToObject(target[name]);
    }
    return !isNumericKey;
  }
  if (utils_default.isFormData(formData) && utils_default.isFunction(formData.entries)) {
    const obj = {};
    utils_default.forEachEntry(formData, (name, value) => {
      buildPath(parsePropPath(name), value, obj, 0);
    });
    return obj;
  }
  return null;
}
var formDataToJSON_default = formDataToJSON;

// node_modules/axios/lib/defaults/index.js
var own = (obj, key) => obj != null && utils_default.hasOwnProp(obj, key) ? obj[key] : void 0;
function stringifySafely2(rawValue, parser, encoder3) {
  if (utils_default.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils_default.trim(rawValue);
    } catch (e3) {
      if (e3.name !== "SyntaxError") {
        throw e3;
      }
    }
  }
  return (encoder3 || JSON.stringify)(rawValue);
}
var defaults = {
  transitional: transitional_default,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [
    function transformRequest(data, headers) {
      const contentType = headers.getContentType() || "";
      const hasJSONContentType = contentType.indexOf("application/json") > -1;
      const isObjectPayload = utils_default.isObject(data);
      if (isObjectPayload && utils_default.isHTMLForm(data)) {
        data = new FormData(data);
      }
      const isFormData2 = utils_default.isFormData(data);
      if (isFormData2) {
        return hasJSONContentType ? JSON.stringify(formDataToJSON_default(data)) : data;
      }
      if (utils_default.isArrayBuffer(data) || utils_default.isBuffer(data) || utils_default.isStream(data) || utils_default.isFile(data) || utils_default.isBlob(data) || utils_default.isReadableStream(data)) {
        return data;
      }
      if (utils_default.isArrayBufferView(data)) {
        return data.buffer;
      }
      if (utils_default.isURLSearchParams(data)) {
        headers.setContentType("application/x-www-form-urlencoded;charset=utf-8", false);
        return data.toString();
      }
      let isFileList2;
      if (isObjectPayload) {
        const formSerializer = own(this, "formSerializer");
        if (contentType.indexOf("application/x-www-form-urlencoded") > -1) {
          return toURLEncodedForm(data, formSerializer).toString();
        }
        if ((isFileList2 = utils_default.isFileList(data)) || contentType.indexOf("multipart/form-data") > -1) {
          const env = own(this, "env");
          const _FormData = env && env.FormData;
          return toFormData_default(
            isFileList2 ? { "files[]": data } : data,
            _FormData && new _FormData(),
            formSerializer
          );
        }
      }
      if (isObjectPayload || hasJSONContentType) {
        headers.setContentType("application/json", false);
        return stringifySafely2(data);
      }
      return data;
    }
  ],
  transformResponse: [
    function transformResponse(data) {
      const transitional2 = own(this, "transitional") || defaults.transitional;
      const forcedJSONParsing = transitional2 && transitional2.forcedJSONParsing;
      const responseType = own(this, "responseType");
      const JSONRequested = responseType === "json";
      if (utils_default.isResponse(data) || utils_default.isReadableStream(data)) {
        return data;
      }
      if (data && utils_default.isString(data) && (forcedJSONParsing && !responseType || JSONRequested)) {
        const silentJSONParsing = transitional2 && transitional2.silentJSONParsing;
        const strictJSONParsing = !silentJSONParsing && JSONRequested;
        try {
          return JSON.parse(data, own(this, "parseReviver"));
        } catch (e3) {
          if (strictJSONParsing) {
            if (e3.name === "SyntaxError") {
              throw AxiosError_default.from(e3, AxiosError_default.ERR_BAD_RESPONSE, this, null, own(this, "response"));
            }
            throw e3;
          }
        }
      }
      return data;
    }
  ],
  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: platform_default.classes.FormData,
    Blob: platform_default.classes.Blob
  },
  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },
  headers: {
    common: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": void 0
    }
  }
};
utils_default.forEach(["delete", "get", "head", "post", "put", "patch", "query"], (method) => {
  defaults.headers[method] = {};
});
var defaults_default = defaults;

// node_modules/axios/lib/core/transformData.js
function transformData(fns, response) {
  const config = this || defaults_default;
  const context = response || config;
  const headers = AxiosHeaders_default.from(context.headers);
  let data = context.data;
  utils_default.forEach(fns, function transform(fn2) {
    data = fn2.call(config, data, headers.normalize(), response ? response.status : void 0);
  });
  headers.normalize();
  return data;
}

// node_modules/axios/lib/cancel/isCancel.js
function isCancel(value) {
  return !!(value && value.__CANCEL__);
}

// node_modules/axios/lib/cancel/CanceledError.js
var CanceledError = class extends AxiosError_default {
  /**
   * A `CanceledError` is an object that is thrown when an operation is canceled.
   *
   * @param {string=} message The message.
   * @param {Object=} config The config.
   * @param {Object=} request The request.
   *
   * @returns {CanceledError} The created error.
   */
  constructor(message, config, request) {
    super(message == null ? "canceled" : message, AxiosError_default.ERR_CANCELED, config, request);
    this.name = "CanceledError";
    this.__CANCEL__ = true;
  }
};
var CanceledError_default = CanceledError;

// node_modules/axios/lib/core/settle.js
function settle(resolve, reject, response) {
  const validateStatus2 = response.config.validateStatus;
  if (!response.status || !validateStatus2 || validateStatus2(response.status)) {
    resolve(response);
  } else {
    reject(new AxiosError_default(
      "Request failed with status code " + response.status,
      response.status >= 400 && response.status < 500 ? AxiosError_default.ERR_BAD_REQUEST : AxiosError_default.ERR_BAD_RESPONSE,
      response.config,
      response.request,
      response
    ));
  }
}

// node_modules/axios/lib/helpers/parseProtocol.js
function parseProtocol(url) {
  const match = /^([-+\w]{1,25}):(?:\/\/)?/.exec(url);
  return match && match[1] || "";
}

// node_modules/axios/lib/helpers/speedometer.js
function speedometer(samplesCount, min) {
  samplesCount = samplesCount || 10;
  const bytes2 = new Array(samplesCount);
  const timestamps = new Array(samplesCount);
  let head = 0;
  let tail = 0;
  let firstSampleTS;
  min = min !== void 0 ? min : 1e3;
  return function push(chunkLength) {
    const now = Date.now();
    const startedAt = timestamps[tail];
    if (!firstSampleTS) {
      firstSampleTS = now;
    }
    bytes2[head] = chunkLength;
    timestamps[head] = now;
    let i3 = tail;
    let bytesCount = 0;
    while (i3 !== head) {
      bytesCount += bytes2[i3++];
      i3 = i3 % samplesCount;
    }
    head = (head + 1) % samplesCount;
    if (head === tail) {
      tail = (tail + 1) % samplesCount;
    }
    if (now - firstSampleTS < min) {
      return;
    }
    const passed = startedAt && now - startedAt;
    return passed ? Math.round(bytesCount * 1e3 / passed) : void 0;
  };
}
var speedometer_default = speedometer;

// node_modules/axios/lib/helpers/throttle.js
function throttle(fn2, freq) {
  let timestamp = 0;
  let threshold = 1e3 / freq;
  let lastArgs;
  let timer;
  const invoke = (args, now = Date.now()) => {
    timestamp = now;
    lastArgs = null;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    fn2(...args);
  };
  const throttled = (...args) => {
    const now = Date.now();
    const passed = now - timestamp;
    if (passed >= threshold) {
      invoke(args, now);
    } else {
      lastArgs = args;
      if (!timer) {
        timer = setTimeout(() => {
          timer = null;
          invoke(lastArgs);
        }, threshold - passed);
      }
    }
  };
  const flush = () => lastArgs && invoke(lastArgs);
  return [throttled, flush];
}
var throttle_default = throttle;

// node_modules/axios/lib/helpers/progressEventReducer.js
var progressEventReducer = (listener, isDownloadStream, freq = 3) => {
  let bytesNotified = 0;
  const _speedometer = speedometer_default(50, 250);
  return throttle_default((e3) => {
    if (!e3 || typeof e3.loaded !== "number") {
      return;
    }
    const rawLoaded = e3.loaded;
    const total = e3.lengthComputable ? e3.total : void 0;
    const loaded = Math.max(0, total != null ? Math.min(rawLoaded, total) : rawLoaded);
    const progressBytes = Math.max(0, loaded - bytesNotified);
    const rate = _speedometer(progressBytes);
    bytesNotified = Math.max(bytesNotified, loaded);
    const data = {
      loaded,
      total,
      progress: total ? loaded / total : void 0,
      bytes: progressBytes,
      rate: rate ? rate : void 0,
      estimated: rate && total ? (total - loaded) / rate : void 0,
      event: e3,
      lengthComputable: total != null,
      [isDownloadStream ? "download" : "upload"]: true
    };
    listener(data);
  }, freq);
};
var progressEventDecorator = (total, throttled) => {
  const lengthComputable = total != null;
  return [
    (loaded) => throttled[0]({
      lengthComputable,
      total,
      loaded
    }),
    throttled[1]
  ];
};
var asyncDecorator = (fn2, scheduler = utils_default.asap) => (...args) => scheduler(() => fn2(...args));

// node_modules/axios/lib/helpers/isURLSameOrigin.js
var isURLSameOrigin_default = platform_default.hasStandardBrowserEnv ? /* @__PURE__ */ ((origin2, isMSIE) => (url) => {
  url = new URL(url, platform_default.origin);
  return origin2.protocol === url.protocol && origin2.host === url.host && (isMSIE || origin2.port === url.port);
})(
  new URL(platform_default.origin),
  platform_default.navigator && /(msie|trident)/i.test(platform_default.navigator.userAgent)
) : () => true;

// node_modules/axios/lib/helpers/cookies.js
var cookies_default = platform_default.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(name, value, expires, path, domain, secure, sameSite) {
      if (typeof document === "undefined") return;
      const cookie = [`${name}=${encodeURIComponent(value)}`];
      if (utils_default.isNumber(expires)) {
        cookie.push(`expires=${new Date(expires).toUTCString()}`);
      }
      if (utils_default.isString(path)) {
        cookie.push(`path=${path}`);
      }
      if (utils_default.isString(domain)) {
        cookie.push(`domain=${domain}`);
      }
      if (secure === true) {
        cookie.push("secure");
      }
      if (utils_default.isString(sameSite)) {
        cookie.push(`SameSite=${sameSite}`);
      }
      document.cookie = cookie.join("; ");
    },
    read(name) {
      if (typeof document === "undefined") return null;
      const cookies = document.cookie.split(";");
      for (let i3 = 0; i3 < cookies.length; i3++) {
        const cookie = cookies[i3].replace(/^\s+/, "");
        const eq = cookie.indexOf("=");
        if (eq !== -1 && cookie.slice(0, eq) === name) {
          try {
            return decodeURIComponent(cookie.slice(eq + 1));
          } catch (e3) {
            return cookie.slice(eq + 1);
          }
        }
      }
      return null;
    },
    remove(name) {
      this.write(name, "", Date.now() - 864e5, "/");
    }
  }
) : (
  // Non-standard browser env (web workers, react-native) lack needed support.
  {
    write() {
    },
    read() {
      return null;
    },
    remove() {
    }
  }
);

// node_modules/axios/lib/helpers/isAbsoluteURL.js
function isAbsoluteURL(url) {
  if (typeof url !== "string") {
    return false;
  }
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}

// node_modules/axios/lib/helpers/combineURLs.js
function combineURLs(baseURL, relativeURL) {
  if (!relativeURL) {
    return baseURL;
  }
  let end = baseURL.length;
  while (end > 0 && baseURL.charCodeAt(end - 1) === 47) {
    end--;
  }
  return baseURL.slice(0, end) + "/" + relativeURL.replace(/^\/+/, "");
}

// node_modules/axios/lib/core/buildFullPath.js
var malformedHttpProtocol = /^https?:(?!\/\/)/i;
var httpProtocolControlCharacters = /[\t\n\r]/g;
function stripLeadingC0ControlOrSpace(url) {
  let i3 = 0;
  while (i3 < url.length && url.charCodeAt(i3) <= 32) {
    i3++;
  }
  return url.slice(i3);
}
function normalizeURLForProtocolCheck(url) {
  return stripLeadingC0ControlOrSpace(url).replace(httpProtocolControlCharacters, "");
}
function redactFragment(fragment) {
  if (!fragment) {
    return fragment;
  }
  return fragment.replace(/(^|&)([^=&]*=)?[^&]+/g, (match, separator, parameterName = "") => {
    return `${separator}${parameterName}${REDACTED}`;
  });
}
function redactSensitiveURLParts(url) {
  const redactedURL = url.replace(/^(https?:\/{0,2})[^/?#]*@/i, `$1${REDACTED}@`);
  const fragmentIndex = redactedURL.indexOf("#");
  const urlWithoutFragment = fragmentIndex === -1 ? redactedURL : redactedURL.slice(0, fragmentIndex);
  const redactedURLWithoutFragment = urlWithoutFragment.replace(
    /([?&][^=&#]*=)[^&#]*/g,
    `$1${REDACTED}`
  );
  if (fragmentIndex === -1) {
    return redactedURLWithoutFragment;
  }
  return `${redactedURLWithoutFragment}#${redactFragment(redactedURL.slice(fragmentIndex + 1))}`;
}
function assertValidHttpProtocolURL(url, config) {
  if (typeof url === "string") {
    const normalizedURL = normalizeURLForProtocolCheck(url);
    if (malformedHttpProtocol.test(normalizedURL)) {
      throw new AxiosError_default(
        `Invalid URL ${JSON.stringify(redactSensitiveURLParts(normalizedURL))}: missing "//" after protocol`,
        AxiosError_default.ERR_INVALID_URL,
        config
      );
    }
  }
}
function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls, config) {
  assertValidHttpProtocolURL(requestedURL, config);
  let isRelativeUrl = !isAbsoluteURL(requestedURL);
  if (baseURL && (isRelativeUrl || allowAbsoluteUrls === false)) {
    assertValidHttpProtocolURL(baseURL, config);
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
}

// node_modules/axios/lib/core/mergeConfig.js
var headersToObject = (thing) => thing instanceof AxiosHeaders_default ? { ...thing } : thing;
var ownEnumerableKeys = (thing) => {
  if (Object.getOwnPropertySymbols && Object.getOwnPropertyDescriptor) {
    return Object.keys(thing).concat(
      Object.getOwnPropertySymbols(thing).filter(
        (symbol) => Object.getOwnPropertyDescriptor(thing, symbol).enumerable
      )
    );
  }
  return Object.keys(thing);
};
function mergeConfig(config1, config2) {
  config1 = config1 || {};
  config2 = config2 || {};
  const config = /* @__PURE__ */ Object.create(null);
  Object.defineProperty(config, "hasOwnProperty", {
    // Null-proto descriptor so a polluted Object.prototype.get cannot turn
    // this data descriptor into an accessor descriptor on the way in.
    __proto__: null,
    value: Object.prototype.hasOwnProperty,
    enumerable: false,
    writable: true,
    configurable: true
  });
  function getMergedValue(target, source, prop, caseless) {
    if (utils_default.isPlainObject(target) && utils_default.isPlainObject(source)) {
      return utils_default.merge.call({ caseless }, target, source);
    } else if (utils_default.isPlainObject(source)) {
      return utils_default.merge({}, source);
    } else if (utils_default.isArray(source)) {
      return source.slice();
    }
    return source;
  }
  function mergeDeepProperties(a3, b4, prop, caseless) {
    if (!utils_default.isUndefined(b4)) {
      return getMergedValue(a3, b4, prop, caseless);
    } else if (!utils_default.isUndefined(a3)) {
      return getMergedValue(void 0, a3, prop, caseless);
    }
  }
  function valueFromConfig2(a3, b4) {
    if (!utils_default.isUndefined(b4)) {
      return getMergedValue(void 0, b4);
    }
  }
  function defaultToConfig2(a3, b4) {
    if (!utils_default.isUndefined(b4)) {
      return getMergedValue(void 0, b4);
    } else if (!utils_default.isUndefined(a3)) {
      return getMergedValue(void 0, a3);
    }
  }
  function getMergedTransitionalOption(prop) {
    const transitional2 = utils_default.hasOwnProp(config2, "transitional") ? config2.transitional : void 0;
    if (!utils_default.isUndefined(transitional2)) {
      if (utils_default.isPlainObject(transitional2)) {
        if (utils_default.hasOwnProp(transitional2, prop)) {
          return transitional2[prop];
        }
      } else {
        return void 0;
      }
    }
    const transitional1 = utils_default.hasOwnProp(config1, "transitional") ? config1.transitional : void 0;
    if (utils_default.isPlainObject(transitional1) && utils_default.hasOwnProp(transitional1, prop)) {
      return transitional1[prop];
    }
    return void 0;
  }
  function mergeDirectKeys(a3, b4, prop) {
    if (utils_default.hasOwnProp(config2, prop)) {
      return getMergedValue(a3, b4);
    } else if (utils_default.hasOwnProp(config1, prop)) {
      return getMergedValue(void 0, a3);
    }
  }
  const mergeMap = {
    url: valueFromConfig2,
    method: valueFromConfig2,
    data: valueFromConfig2,
    baseURL: defaultToConfig2,
    transformRequest: defaultToConfig2,
    transformResponse: defaultToConfig2,
    paramsSerializer: defaultToConfig2,
    timeout: defaultToConfig2,
    timeoutMessage: defaultToConfig2,
    withCredentials: defaultToConfig2,
    withXSRFToken: defaultToConfig2,
    adapter: defaultToConfig2,
    responseType: defaultToConfig2,
    xsrfCookieName: defaultToConfig2,
    xsrfHeaderName: defaultToConfig2,
    onUploadProgress: defaultToConfig2,
    onDownloadProgress: defaultToConfig2,
    decompress: defaultToConfig2,
    maxContentLength: defaultToConfig2,
    maxBodyLength: defaultToConfig2,
    beforeRedirect: defaultToConfig2,
    transport: defaultToConfig2,
    httpAgent: defaultToConfig2,
    httpsAgent: defaultToConfig2,
    cancelToken: defaultToConfig2,
    socketPath: defaultToConfig2,
    allowedSocketPaths: defaultToConfig2,
    responseEncoding: defaultToConfig2,
    validateStatus: mergeDirectKeys,
    headers: (a3, b4, prop) => mergeDeepProperties(headersToObject(a3), headersToObject(b4), prop, true)
  };
  utils_default.forEach(ownEnumerableKeys({ ...config1, ...config2 }), function computeConfigValue(prop) {
    if (prop === "__proto__" || prop === "constructor" || prop === "prototype") return;
    const merge2 = utils_default.hasOwnProp(mergeMap, prop) ? mergeMap[prop] : mergeDeepProperties;
    const a3 = utils_default.hasOwnProp(config1, prop) ? config1[prop] : void 0;
    const b4 = utils_default.hasOwnProp(config2, prop) ? config2[prop] : void 0;
    const configValue = merge2(a3, b4, prop);
    utils_default.isUndefined(configValue) && merge2 !== mergeDirectKeys || (config[prop] = configValue);
  });
  if (utils_default.hasOwnProp(config2, "validateStatus") && utils_default.isUndefined(config2.validateStatus) && getMergedTransitionalOption("validateStatusUndefinedResolves") === false) {
    if (utils_default.hasOwnProp(config1, "validateStatus")) {
      config.validateStatus = getMergedValue(void 0, config1.validateStatus);
    } else {
      delete config.validateStatus;
    }
  }
  return config;
}

// node_modules/axios/lib/core/setFormDataHeaders.js
var FORM_DATA_CONTENT_HEADERS = ["content-type", "content-length"];
function setFormDataHeaders(headers, formHeaders, policy) {
  if (policy !== "content-only") {
    headers.set(formHeaders);
    return;
  }
  Object.entries(formHeaders || {}).forEach(([key, val]) => {
    if (FORM_DATA_CONTENT_HEADERS.includes(key.toLowerCase())) {
      headers.set(key, val);
    }
  });
}

// node_modules/axios/lib/helpers/resolveConfig.js
var encodeUTF8 = (str) => encodeURIComponent(str).replace(
  /%([0-9A-F]{2})/gi,
  (_4, hex) => String.fromCharCode(parseInt(hex, 16))
);
function resolveConfig(config) {
  const newConfig = mergeConfig({}, config);
  const own2 = (key) => utils_default.hasOwnProp(newConfig, key) ? newConfig[key] : void 0;
  const data = own2("data");
  let withXSRFToken = own2("withXSRFToken");
  const xsrfHeaderName = own2("xsrfHeaderName");
  const xsrfCookieName = own2("xsrfCookieName");
  let headers = own2("headers");
  const auth = own2("auth");
  const baseURL = own2("baseURL");
  const allowAbsoluteUrls = own2("allowAbsoluteUrls");
  const url = own2("url");
  newConfig.headers = headers = AxiosHeaders_default.from(headers);
  newConfig.url = buildURL(
    buildFullPath(baseURL, url, allowAbsoluteUrls, newConfig),
    own2("params"),
    own2("paramsSerializer")
  );
  if (auth) {
    const username = utils_default.getSafeProp(auth, "username") || "";
    const password = utils_default.getSafeProp(auth, "password") || "";
    try {
      headers.set(
        "Authorization",
        "Basic " + btoa(username + ":" + (password ? encodeUTF8(password) : ""))
      );
    } catch (e3) {
      throw AxiosError_default.from(e3, AxiosError_default.ERR_BAD_OPTION_VALUE, config);
    }
  }
  if (utils_default.isFormData(data)) {
    if (platform_default.hasStandardBrowserEnv || platform_default.hasStandardBrowserWebWorkerEnv || utils_default.isReactNative(data)) {
      headers.setContentType(void 0);
    } else if (utils_default.isFunction(data.getHeaders)) {
      setFormDataHeaders(headers, data.getHeaders(), own2("formDataHeaderPolicy"));
    }
  }
  if (platform_default.hasStandardBrowserEnv) {
    if (utils_default.isFunction(withXSRFToken)) {
      withXSRFToken = withXSRFToken(newConfig);
    }
    const shouldSendXSRF = withXSRFToken === true || withXSRFToken == null && isURLSameOrigin_default(newConfig.url);
    if (shouldSendXSRF) {
      const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies_default.read(xsrfCookieName);
      if (xsrfValue) {
        headers.set(xsrfHeaderName, xsrfValue);
      }
    }
  }
  return newConfig;
}
var resolveConfig_default = resolveConfig;

// node_modules/axios/lib/adapters/xhr.js
var isXHRAdapterSupported = typeof XMLHttpRequest !== "undefined";
var xhr_default = isXHRAdapterSupported && function(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    const _config = resolveConfig_default(config);
    let requestData = _config.data;
    const requestHeaders = AxiosHeaders_default.from(_config.headers).normalize();
    let { responseType, onUploadProgress, onDownloadProgress } = _config;
    let onCanceled;
    let uploadThrottled, downloadThrottled;
    let flushUpload, flushDownload;
    function done() {
      flushUpload && flushUpload();
      flushDownload && flushDownload();
      _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);
      _config.signal && _config.signal.removeEventListener("abort", onCanceled);
    }
    let request = new XMLHttpRequest();
    request.open(_config.method.toUpperCase(), _config.url, true);
    request.timeout = _config.timeout;
    function onloadend() {
      if (!request) {
        return;
      }
      const responseHeaders = AxiosHeaders_default.from(
        "getAllResponseHeaders" in request && request.getAllResponseHeaders()
      );
      const responseData = !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response;
      const response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      };
      settle(
        function _resolve(value) {
          resolve(value);
          done();
        },
        function _reject(err) {
          reject(err);
          done();
        },
        response
      );
      request = null;
    }
    if ("onloadend" in request) {
      request.onloadend = onloadend;
    } else {
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }
        if (request.status === 0 && !(request.responseURL && request.responseURL.startsWith("file:"))) {
          return;
        }
        setTimeout(onloadend);
      };
    }
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }
      reject(new AxiosError_default("Request aborted", AxiosError_default.ECONNABORTED, config, request));
      done();
      request = null;
    };
    request.onerror = function handleError(event) {
      const msg = event && event.message ? event.message : "Network Error";
      const err = new AxiosError_default(msg, AxiosError_default.ERR_NETWORK, config, request);
      err.event = event || null;
      reject(err);
      done();
      request = null;
    };
    request.ontimeout = function handleTimeout() {
      let timeoutErrorMessage = _config.timeout ? "timeout of " + _config.timeout + "ms exceeded" : "timeout exceeded";
      const transitional2 = _config.transitional || transitional_default;
      if (_config.timeoutErrorMessage) {
        timeoutErrorMessage = _config.timeoutErrorMessage;
      }
      reject(
        new AxiosError_default(
          timeoutErrorMessage,
          transitional2.clarifyTimeoutError ? AxiosError_default.ETIMEDOUT : AxiosError_default.ECONNABORTED,
          config,
          request
        )
      );
      done();
      request = null;
    };
    requestData === void 0 && requestHeaders.setContentType(null);
    if ("setRequestHeader" in request) {
      utils_default.forEach(toByteStringHeaderObject(requestHeaders), function setRequestHeader(val, key) {
        request.setRequestHeader(key, val);
      });
    }
    if (!utils_default.isUndefined(_config.withCredentials)) {
      request.withCredentials = !!_config.withCredentials;
    }
    if (responseType && responseType !== "json") {
      request.responseType = _config.responseType;
    }
    if (onDownloadProgress) {
      [downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true);
      request.addEventListener("progress", downloadThrottled);
    }
    if (onUploadProgress && request.upload) {
      [uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress);
      request.upload.addEventListener("progress", uploadThrottled);
      request.upload.addEventListener("loadend", flushUpload);
    }
    if (_config.cancelToken || _config.signal) {
      onCanceled = (cancel) => {
        if (!request) {
          return;
        }
        reject(!cancel || cancel.type ? new CanceledError_default(null, config, request) : cancel);
        request.abort();
        done();
        request = null;
      };
      _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
      if (_config.signal) {
        _config.signal.aborted ? onCanceled() : _config.signal.addEventListener("abort", onCanceled);
      }
    }
    const protocol = parseProtocol(_config.url);
    if (protocol && !platform_default.protocols.includes(protocol)) {
      reject(
        new AxiosError_default(
          "Unsupported protocol " + protocol + ":",
          AxiosError_default.ERR_BAD_REQUEST,
          config
        )
      );
      done();
      return;
    }
    request.send(requestData || null);
  });
};

// node_modules/axios/lib/helpers/composeSignals.js
var composeSignals = (signals, timeout) => {
  signals = signals ? signals.filter(Boolean) : [];
  if (!timeout && !signals.length) {
    return;
  }
  const controller = new AbortController();
  let aborted = false;
  const onabort = function(reason) {
    if (!aborted) {
      aborted = true;
      unsubscribe();
      const err = reason instanceof Error ? reason : this.reason;
      controller.abort(
        err instanceof AxiosError_default ? err : new CanceledError_default(err instanceof Error ? err.message : err)
      );
    }
  };
  let timer = timeout && setTimeout(() => {
    timer = null;
    onabort(new AxiosError_default(`timeout of ${timeout}ms exceeded`, AxiosError_default.ETIMEDOUT));
  }, timeout);
  const unsubscribe = () => {
    if (!signals) {
      return;
    }
    timer && clearTimeout(timer);
    timer = null;
    signals.forEach((signal2) => {
      signal2.unsubscribe ? signal2.unsubscribe(onabort) : signal2.removeEventListener("abort", onabort);
    });
    signals = null;
  };
  signals.forEach((signal2) => {
    if (aborted) {
      return;
    }
    if (signal2.aborted) {
      onabort.call(signal2);
      return;
    }
    signal2.addEventListener("abort", onabort, { once: true });
  });
  const { signal } = controller;
  signal.unsubscribe = () => utils_default.asap(unsubscribe);
  return signal;
};
var composeSignals_default = composeSignals;

// node_modules/axios/lib/helpers/trackStream.js
var streamChunk = function* (chunk, chunkSize) {
  let len = chunk.byteLength;
  if (!chunkSize || len < chunkSize) {
    yield chunk;
    return;
  }
  let pos = 0;
  let end;
  while (pos < len) {
    end = pos + chunkSize;
    yield chunk.slice(pos, end);
    pos = end;
  }
};
var readBytes = async function* (iterable, chunkSize) {
  for await (const chunk of readStream(iterable)) {
    yield* streamChunk(chunk, chunkSize);
  }
};
var readStream = async function* (stream) {
  if (stream[Symbol.asyncIterator]) {
    yield* stream;
    return;
  }
  const reader = stream.getReader();
  try {
    for (; ; ) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      yield value;
    }
  } finally {
    await reader.cancel();
  }
};
var trackStream = (stream, chunkSize, onProgress, onFinish) => {
  const iterator2 = readBytes(stream, chunkSize);
  let bytes2 = 0;
  let done;
  let _onFinish = (e3) => {
    if (!done) {
      done = true;
      onFinish && onFinish(e3);
    }
  };
  return new ReadableStream(
    {
      async pull(controller) {
        try {
          const { done: done2, value } = await iterator2.next();
          if (done2) {
            _onFinish();
            controller.close();
            return;
          }
          let len = value.byteLength;
          if (onProgress) {
            let loadedBytes = bytes2 += len;
            onProgress(loadedBytes);
          }
          controller.enqueue(new Uint8Array(value));
        } catch (err) {
          _onFinish(err);
          throw err;
        }
      },
      cancel(reason) {
        _onFinish(reason);
        return iterator2.return();
      }
    },
    {
      highWaterMark: 2
    }
  );
};

// node_modules/axios/lib/helpers/estimateDataURLDecodedBytes.js
var isHexDigit = (charCode) => charCode >= 48 && charCode <= 57 || charCode >= 65 && charCode <= 70 || charCode >= 97 && charCode <= 102;
var isPercentEncodedByte = (str, i3, len) => i3 + 2 < len && isHexDigit(str.charCodeAt(i3 + 1)) && isHexDigit(str.charCodeAt(i3 + 2));
var hexValue = (charCode) => charCode <= 57 ? charCode - 48 : (charCode & 223) - 55;
var isBase64Char = (charCode) => charCode >= 65 && charCode <= 90 || // A-Z
charCode >= 97 && charCode <= 122 || // a-z
charCode >= 48 && charCode <= 57 || // 0-9
charCode === 43 || // +
charCode === 47 || // /
charCode === 45 || // - (base64url)
charCode === 95;
var isBase64Whitespace = (charCode) => charCode === 9 || charCode === 10 || charCode === 12 || charCode === 13 || charCode === 32;
var base64Bytes = (significant) => {
  const groups = Math.floor(significant / 4);
  const remainder = significant % 4;
  return groups * 3 + (remainder === 2 ? 1 : remainder === 3 ? 2 : 0);
};
var estimateBase64BufferAllocation = (body) => {
  const len = body.length;
  let padding = 0;
  if (len > 0 && body.charCodeAt(len - 1) === 61) {
    padding++;
    if (len > 1 && body.charCodeAt(len - 2) === 61) {
      padding++;
    }
  }
  return Math.floor((len - padding) * 3 / 4);
};
var estimatePercentDecodedBase64Bytes = (body) => {
  const len = body.length;
  let significant = 0;
  let padding = 0;
  let invalid = false;
  for (let i3 = 0; i3 < len; i3++) {
    let code = body.charCodeAt(i3);
    if (code === 37 && isPercentEncodedByte(body, i3, len)) {
      code = hexValue(body.charCodeAt(i3 + 1)) * 16 + hexValue(body.charCodeAt(i3 + 2));
      i3 += 2;
    }
    if (isBase64Whitespace(code)) {
      continue;
    }
    if (code === 61) {
      padding++;
      continue;
    }
    if (!isBase64Char(code) || padding > 0) {
      invalid = true;
      continue;
    }
    significant++;
  }
  if (invalid || padding > 2 || padding > 0 && (significant + padding) % 4 !== 0 || significant % 4 === 1) {
    return estimateBase64BufferAllocation(body);
  }
  return base64Bytes(significant);
};
var estimateDataURLBytes = (url, estimateBase64) => {
  if (!url || typeof url !== "string") return 0;
  if (!url.startsWith("data:")) return 0;
  const comma = url.indexOf(",");
  if (comma < 0) return 0;
  const meta = url.slice(5, comma);
  const body = url.slice(comma + 1);
  const isBase64 = /;base64/i.test(meta);
  if (isBase64) {
    return estimateBase64(body);
  }
  let bytes2 = 0;
  for (let i3 = 0, len = body.length; i3 < len; i3++) {
    const c3 = body.charCodeAt(i3);
    if (c3 === 37 && isPercentEncodedByte(body, i3, len)) {
      bytes2 += 1;
      i3 += 2;
    } else if (c3 < 128) {
      bytes2 += 1;
    } else if (c3 < 2048) {
      bytes2 += 2;
    } else if (c3 >= 55296 && c3 <= 56319 && i3 + 1 < len) {
      const next = body.charCodeAt(i3 + 1);
      if (next >= 56320 && next <= 57343) {
        bytes2 += 4;
        i3++;
      } else {
        bytes2 += 3;
      }
    } else {
      bytes2 += 3;
    }
  }
  return bytes2;
};
function estimateDataURLDecodedBytes(url) {
  const fragmentIndex = typeof url === "string" ? url.indexOf("#") : -1;
  return estimateDataURLBytes(
    fragmentIndex === -1 ? url : url.slice(0, fragmentIndex),
    estimatePercentDecodedBase64Bytes
  );
}

// node_modules/axios/lib/env/data.js
var VERSION = "1.19.0";

// node_modules/axios/lib/adapters/fetch.js
var DEFAULT_CHUNK_SIZE = 64 * 1024;
var { isFunction: isFunction2 } = utils_default;
var encodeUTF82 = (str) => encodeURIComponent(str).replace(
  /%([0-9A-F]{2})/gi,
  (_4, hex) => String.fromCharCode(parseInt(hex, 16))
);
var decodeURIComponentSafe = (value) => {
  if (!utils_default.isString(value)) {
    return value;
  }
  try {
    return decodeURIComponent(value);
  } catch (error) {
    return value;
  }
};
var test = (fn2, ...args) => {
  try {
    return !!fn2(...args);
  } catch (e3) {
    return false;
  }
};
var maybeWithAuthCredentials = (url) => {
  const protocolIndex = url.indexOf("://");
  let urlToCheck = url;
  if (protocolIndex !== -1) {
    urlToCheck = urlToCheck.slice(protocolIndex + 3);
  }
  return urlToCheck.includes("@") || urlToCheck.includes(":");
};
var factory = (env) => {
  const globalObject = utils_default.global !== void 0 && utils_default.global !== null ? utils_default.global : globalThis;
  const { ReadableStream: ReadableStream2, TextEncoder: TextEncoder2 } = globalObject;
  env = utils_default.merge.call(
    {
      skipUndefined: true
    },
    {
      Request: globalObject.Request,
      Response: globalObject.Response
    },
    env
  );
  const { fetch: envFetch, Request: Request2, Response } = env;
  const isFetchSupported = envFetch ? isFunction2(envFetch) : typeof fetch === "function";
  const isRequestSupported = isFunction2(Request2);
  const isResponseSupported = isFunction2(Response);
  if (!isFetchSupported) {
    return false;
  }
  const isReadableStreamSupported = isFetchSupported && isFunction2(ReadableStream2);
  const encodeText = isFetchSupported && (typeof TextEncoder2 === "function" ? /* @__PURE__ */ ((encoder3) => (str) => encoder3.encode(str))(new TextEncoder2()) : async (str) => new Uint8Array(await new Request2(str).arrayBuffer()));
  const supportsRequestStream = isRequestSupported && isReadableStreamSupported && test(() => {
    let duplexAccessed = false;
    const request = new Request2(platform_default.origin, {
      body: new ReadableStream2(),
      method: "POST",
      get duplex() {
        duplexAccessed = true;
        return "half";
      }
    });
    const hasContentType = request.headers.has("Content-Type");
    if (request.body != null) {
      request.body.cancel();
    }
    return duplexAccessed && !hasContentType;
  });
  const supportsResponseStream = isResponseSupported && isReadableStreamSupported && test(() => utils_default.isReadableStream(new Response("").body));
  const resolvers = {
    stream: supportsResponseStream && ((res) => res.body)
  };
  isFetchSupported && (() => {
    ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((type) => {
      !resolvers[type] && (resolvers[type] = (res, config) => {
        let method = res && res[type];
        if (method) {
          return method.call(res);
        }
        throw new AxiosError_default(
          `Response type '${type}' is not supported`,
          AxiosError_default.ERR_NOT_SUPPORT,
          config
        );
      });
    });
  })();
  const getBodyLength = async (body) => {
    if (body == null) {
      return 0;
    }
    if (utils_default.isBlob(body)) {
      return body.size;
    }
    if (utils_default.isSpecCompliantForm(body)) {
      const _request = new Request2(platform_default.origin, {
        method: "POST",
        body
      });
      return (await _request.arrayBuffer()).byteLength;
    }
    if (utils_default.isArrayBufferView(body) || utils_default.isArrayBuffer(body)) {
      return body.byteLength;
    }
    if (utils_default.isURLSearchParams(body)) {
      body = body + "";
    }
    if (utils_default.isString(body)) {
      return (await encodeText(body)).byteLength;
    }
  };
  const resolveBodyLength = async (headers, body) => {
    const length = utils_default.toFiniteNumber(headers.getContentLength());
    return length == null ? getBodyLength(body) : length;
  };
  return async (config) => {
    let {
      url,
      method,
      data,
      signal,
      cancelToken,
      timeout,
      onDownloadProgress,
      onUploadProgress,
      responseType,
      headers,
      withCredentials = "same-origin",
      fetchOptions,
      maxContentLength,
      maxBodyLength
    } = resolveConfig_default(config);
    const hasMaxContentLength = utils_default.isNumber(maxContentLength) && maxContentLength > -1;
    const hasMaxBodyLength = utils_default.isNumber(maxBodyLength) && maxBodyLength > -1;
    const own2 = (key) => utils_default.hasOwnProp(config, key) ? config[key] : void 0;
    let _fetch = envFetch || fetch;
    responseType = responseType ? (responseType + "").toLowerCase() : "text";
    let composedSignal = composeSignals_default(
      [signal, cancelToken && cancelToken.toAbortSignal()],
      timeout
    );
    let request = null;
    const unsubscribe = composedSignal && composedSignal.unsubscribe && (() => {
      composedSignal.unsubscribe();
    });
    let requestContentLength;
    let pendingBodyError = null;
    const maxBodyLengthError = () => new AxiosError_default(
      "Request body larger than maxBodyLength limit",
      AxiosError_default.ERR_BAD_REQUEST,
      config,
      request
    );
    try {
      let auth = void 0;
      const configAuth = own2("auth");
      if (configAuth) {
        const username = utils_default.getSafeProp(configAuth, "username") || "";
        const password = utils_default.getSafeProp(configAuth, "password") || "";
        auth = {
          username,
          password
        };
      }
      if (maybeWithAuthCredentials(url)) {
        const parsedURL = new URL(url, platform_default.origin);
        if (!auth && (parsedURL.username || parsedURL.password)) {
          const urlUsername = decodeURIComponentSafe(parsedURL.username);
          const urlPassword = decodeURIComponentSafe(parsedURL.password);
          auth = {
            username: urlUsername,
            password: urlPassword
          };
        }
        if (parsedURL.username || parsedURL.password) {
          parsedURL.username = "";
          parsedURL.password = "";
          url = parsedURL.href;
        }
      }
      if (auth) {
        headers.delete("authorization");
        headers.set(
          "Authorization",
          "Basic " + btoa(encodeUTF82((auth.username || "") + ":" + (auth.password || "")))
        );
      }
      if (hasMaxContentLength && typeof url === "string" && url.startsWith("data:")) {
        const estimated = estimateDataURLDecodedBytes(url);
        if (estimated > maxContentLength) {
          throw new AxiosError_default(
            "maxContentLength size of " + maxContentLength + " exceeded",
            AxiosError_default.ERR_BAD_RESPONSE,
            config,
            request
          );
        }
      }
      if (hasMaxBodyLength && method !== "get" && method !== "head") {
        const outboundLength = await getBodyLength(data);
        if (typeof outboundLength === "number" && isFinite(outboundLength)) {
          requestContentLength = outboundLength;
          if (outboundLength > maxBodyLength) {
            throw maxBodyLengthError();
          }
        }
      }
      const mustEnforceStreamBody = hasMaxBodyLength && (utils_default.isReadableStream(data) || utils_default.isStream(data));
      const trackRequestStream = (stream, onProgress, flush) => trackStream(
        stream,
        DEFAULT_CHUNK_SIZE,
        (loadedBytes) => {
          if (hasMaxBodyLength && loadedBytes > maxBodyLength) {
            throw pendingBodyError = maxBodyLengthError();
          }
          onProgress && onProgress(loadedBytes);
        },
        flush
      );
      if (supportsRequestStream && method !== "get" && method !== "head" && (onUploadProgress || mustEnforceStreamBody)) {
        requestContentLength = requestContentLength == null ? await resolveBodyLength(headers, data) : requestContentLength;
        if (requestContentLength !== 0 || mustEnforceStreamBody) {
          let _request = new Request2(url, {
            method: "POST",
            body: data,
            duplex: "half"
          });
          let contentTypeHeader;
          if (utils_default.isFormData(data) && (contentTypeHeader = _request.headers.get("content-type"))) {
            headers.setContentType(contentTypeHeader);
          }
          if (_request.body) {
            const [onProgress, flush] = onUploadProgress && progressEventDecorator(
              requestContentLength,
              progressEventReducer(asyncDecorator(onUploadProgress))
            ) || [];
            data = trackRequestStream(_request.body, onProgress, flush);
          }
        }
      } else if (mustEnforceStreamBody && !isRequestSupported && isReadableStreamSupported && method !== "get" && method !== "head") {
        data = trackRequestStream(data);
      } else if (mustEnforceStreamBody && isRequestSupported && !supportsRequestStream && method !== "get" && method !== "head") {
        throw new AxiosError_default(
          "Stream request bodies are not supported by the current fetch implementation",
          AxiosError_default.ERR_NOT_SUPPORT,
          config,
          request
        );
      }
      if (!utils_default.isString(withCredentials)) {
        withCredentials = withCredentials ? "include" : "omit";
      }
      const isCredentialsSupported = isRequestSupported && "credentials" in Request2.prototype;
      if (utils_default.isFormData(data)) {
        const contentType = headers.getContentType();
        if (contentType && /^multipart\/form-data/i.test(contentType) && !/boundary=/i.test(contentType)) {
          headers.delete("content-type");
        }
      }
      headers.set("User-Agent", "axios/" + VERSION, false);
      const resolvedOptions = {
        ...fetchOptions,
        signal: composedSignal,
        method: method.toUpperCase(),
        headers: toByteStringHeaderObject(headers.normalize()),
        body: data,
        duplex: "half",
        credentials: isCredentialsSupported ? withCredentials : void 0
      };
      request = isRequestSupported && new Request2(url, resolvedOptions);
      let response = await (isRequestSupported ? _fetch(request, fetchOptions) : _fetch(url, resolvedOptions));
      const responseHeaders = AxiosHeaders_default.from(response.headers);
      if (hasMaxContentLength) {
        const declaredLength = utils_default.toFiniteNumber(responseHeaders.getContentLength());
        if (declaredLength != null && declaredLength > maxContentLength) {
          throw new AxiosError_default(
            "maxContentLength size of " + maxContentLength + " exceeded",
            AxiosError_default.ERR_BAD_RESPONSE,
            config,
            request
          );
        }
      }
      const isStreamResponse = supportsResponseStream && (responseType === "stream" || responseType === "response");
      if (supportsResponseStream && response.body && (onDownloadProgress || hasMaxContentLength || isStreamResponse && unsubscribe)) {
        const options = {};
        ["status", "statusText", "headers"].forEach((prop) => {
          options[prop] = response[prop];
        });
        const responseContentLength = utils_default.toFiniteNumber(responseHeaders.getContentLength());
        const [onProgress, flush] = onDownloadProgress && progressEventDecorator(
          responseContentLength,
          progressEventReducer(asyncDecorator(onDownloadProgress), true)
        ) || [];
        let bytesRead = 0;
        const onChunkProgress = (loadedBytes) => {
          if (hasMaxContentLength) {
            bytesRead = loadedBytes;
            if (bytesRead > maxContentLength) {
              throw new AxiosError_default(
                "maxContentLength size of " + maxContentLength + " exceeded",
                AxiosError_default.ERR_BAD_RESPONSE,
                config,
                request
              );
            }
          }
          onProgress && onProgress(loadedBytes);
        };
        response = new Response(
          trackStream(response.body, DEFAULT_CHUNK_SIZE, onChunkProgress, () => {
            flush && flush();
            unsubscribe && unsubscribe();
          }),
          options
        );
      }
      responseType = responseType || "text";
      let responseData = await resolvers[utils_default.findKey(resolvers, responseType) || "text"](
        response,
        config
      );
      if (hasMaxContentLength && !supportsResponseStream && !isStreamResponse) {
        let materializedSize;
        if (responseData != null) {
          if (typeof responseData.byteLength === "number") {
            materializedSize = responseData.byteLength;
          } else if (typeof responseData.size === "number") {
            materializedSize = responseData.size;
          } else if (typeof responseData === "string") {
            materializedSize = typeof TextEncoder2 === "function" ? new TextEncoder2().encode(responseData).byteLength : responseData.length;
          }
        }
        if (typeof materializedSize === "number" && materializedSize > maxContentLength) {
          throw new AxiosError_default(
            "maxContentLength size of " + maxContentLength + " exceeded",
            AxiosError_default.ERR_BAD_RESPONSE,
            config,
            request
          );
        }
      }
      !isStreamResponse && unsubscribe && unsubscribe();
      return await new Promise((resolve, reject) => {
        settle(resolve, reject, {
          data: responseData,
          headers: AxiosHeaders_default.from(response.headers),
          status: response.status,
          statusText: response.statusText,
          config,
          request
        });
      });
    } catch (err) {
      unsubscribe && unsubscribe();
      if (composedSignal && composedSignal.aborted && composedSignal.reason instanceof AxiosError_default) {
        const canceledError = composedSignal.reason;
        canceledError.config = config;
        request && (canceledError.request = request);
        if (err !== canceledError) {
          Object.defineProperty(canceledError, "cause", {
            __proto__: null,
            value: err,
            writable: true,
            enumerable: false,
            configurable: true
          });
        }
        throw canceledError;
      }
      if (pendingBodyError) {
        request && !pendingBodyError.request && (pendingBodyError.request = request);
        throw pendingBodyError;
      }
      if (err instanceof AxiosError_default) {
        request && !err.request && (err.request = request);
        throw err;
      }
      if (err && err.name === "TypeError" && /Load failed|fetch/i.test(err.message)) {
        const networkError = new AxiosError_default(
          "Network Error",
          AxiosError_default.ERR_NETWORK,
          config,
          request,
          err && err.response
        );
        Object.defineProperty(networkError, "cause", {
          __proto__: null,
          value: err.cause || err,
          writable: true,
          enumerable: false,
          configurable: true
        });
        throw networkError;
      }
      throw AxiosError_default.from(err, err && err.code, config, request, err && err.response);
    }
  };
};
var seedCache = /* @__PURE__ */ new Map();
var getFetch = (config) => {
  let env = config && config.env || {};
  const { fetch: fetch2, Request: Request2, Response } = env;
  const seeds = [Request2, Response, fetch2];
  let len = seeds.length, i3 = len, seed, target, map = seedCache;
  while (i3--) {
    seed = seeds[i3];
    target = map.get(seed);
    target === void 0 && map.set(seed, target = i3 ? /* @__PURE__ */ new Map() : factory(env));
    map = target;
  }
  return target;
};
var adapter = getFetch();

// node_modules/axios/lib/adapters/adapters.js
var knownAdapters = {
  http: null_default,
  xhr: xhr_default,
  fetch: {
    get: getFetch
  }
};
utils_default.forEach(knownAdapters, (fn2, value) => {
  if (fn2) {
    try {
      Object.defineProperty(fn2, "name", { __proto__: null, value });
    } catch (e3) {
    }
    Object.defineProperty(fn2, "adapterName", { __proto__: null, value });
  }
});
var renderReason = (reason) => `- ${reason}`;
var isResolvedHandle = (adapter2) => utils_default.isFunction(adapter2) || adapter2 === null || adapter2 === false;
function getAdapter(adapters, config) {
  adapters = utils_default.isArray(adapters) ? adapters : [adapters];
  const { length } = adapters;
  let nameOrAdapter;
  let adapter2;
  const rejectedReasons = {};
  for (let i3 = 0; i3 < length; i3++) {
    nameOrAdapter = adapters[i3];
    let id;
    adapter2 = nameOrAdapter;
    if (!isResolvedHandle(nameOrAdapter)) {
      adapter2 = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];
      if (adapter2 === void 0) {
        throw new AxiosError_default(`Unknown adapter '${id}'`);
      }
    }
    if (adapter2 && (utils_default.isFunction(adapter2) || (adapter2 = adapter2.get(config)))) {
      break;
    }
    rejectedReasons[id || "#" + i3] = adapter2;
  }
  if (!adapter2) {
    const reasons = Object.entries(rejectedReasons).map(
      ([id, state]) => `adapter ${id} ` + (state === false ? "is not supported by the environment" : "is not available in the build")
    );
    let s3 = length ? reasons.length > 1 ? "since :\n" + reasons.map(renderReason).join("\n") : " " + renderReason(reasons[0]) : "as no adapter specified";
    throw new AxiosError_default(
      `There is no suitable adapter to dispatch the request ` + s3,
      AxiosError_default.ERR_NOT_SUPPORT
    );
  }
  return adapter2;
}
var adapters_default = {
  /**
   * Resolve an adapter from a list of adapter names or functions.
   * @type {Function}
   */
  getAdapter,
  /**
   * Exposes all known adapters
   * @type {Object<string, Function|Object>}
   */
  adapters: knownAdapters
};

// node_modules/axios/lib/core/dispatchRequest.js
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
  if (config.signal && config.signal.aborted) {
    throw new CanceledError_default(null, config);
  }
}
function dispatchRequest(config) {
  throwIfCancellationRequested(config);
  config.headers = AxiosHeaders_default.from(config.headers);
  config.data = transformData.call(config, config.transformRequest);
  if (["post", "put", "patch"].indexOf(config.method) !== -1) {
    config.headers.setContentType("application/x-www-form-urlencoded", false);
  }
  const adapter2 = adapters_default.getAdapter(config.adapter || defaults_default.adapter, config);
  return adapter2(config).then(
    function onAdapterResolution(response) {
      throwIfCancellationRequested(config);
      config.response = response;
      try {
        response.data = transformData.call(config, config.transformResponse, response);
      } finally {
        delete config.response;
      }
      response.headers = AxiosHeaders_default.from(response.headers);
      return response;
    },
    function onAdapterRejection(reason) {
      if (!isCancel(reason)) {
        throwIfCancellationRequested(config);
        if (reason && reason.response) {
          config.response = reason.response;
          try {
            reason.response.data = transformData.call(
              config,
              config.transformResponse,
              reason.response
            );
          } finally {
            delete config.response;
          }
          reason.response.headers = AxiosHeaders_default.from(reason.response.headers);
        }
      }
      return Promise.reject(reason);
    }
  );
}

// node_modules/axios/lib/helpers/validator.js
var validators = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((type, i3) => {
  validators[type] = function validator(thing) {
    return typeof thing === type || "a" + (i3 < 1 ? "n " : " ") + type;
  };
});
var deprecatedWarnings = {};
validators.transitional = function transitional(validator, version3, message) {
  function formatMessage(opt, desc) {
    return "[Axios v" + VERSION + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
  }
  return (value, opt, opts) => {
    if (validator === false) {
      throw new AxiosError_default(
        formatMessage(opt, " has been removed" + (version3 ? " in " + version3 : "")),
        AxiosError_default.ERR_DEPRECATED
      );
    }
    if (version3 && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      console.warn(
        formatMessage(
          opt,
          " has been deprecated since v" + version3 + " and will be removed in the near future"
        )
      );
    }
    return validator ? validator(value, opt, opts) : true;
  };
};
validators.spelling = function spelling(correctSpelling) {
  return (value, opt) => {
    console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
    return true;
  };
};
function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== "object" || options === null) {
    throw new AxiosError_default("options must be an object", AxiosError_default.ERR_BAD_OPTION_VALUE);
  }
  const keys = Object.keys(options);
  let i3 = keys.length;
  while (i3-- > 0) {
    const opt = keys[i3];
    const validator = Object.prototype.hasOwnProperty.call(schema, opt) ? schema[opt] : void 0;
    if (validator) {
      const value = options[opt];
      const result = value === void 0 || validator(value, opt, options);
      if (result !== true) {
        throw new AxiosError_default(
          "option " + opt + " must be " + result,
          AxiosError_default.ERR_BAD_OPTION_VALUE
        );
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw new AxiosError_default("Unknown option " + opt, AxiosError_default.ERR_BAD_OPTION);
    }
  }
}
var validator_default = {
  assertOptions,
  validators
};

// node_modules/axios/lib/core/Axios.js
var validators2 = validator_default.validators;
var Axios = class {
  constructor(instanceConfig) {
    this.defaults = instanceConfig || {};
    this.interceptors = {
      request: new InterceptorManager_default(),
      response: new InterceptorManager_default()
    };
  }
  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  async request(configOrUrl, config) {
    try {
      return await this._request(configOrUrl, config);
    } catch (err) {
      if (err instanceof Error) {
        let dummy = {};
        Error.captureStackTrace ? Error.captureStackTrace(dummy) : dummy = new Error();
        const stack = (() => {
          if (!dummy.stack) {
            return "";
          }
          const firstNewlineIndex = dummy.stack.indexOf("\n");
          return firstNewlineIndex === -1 ? "" : dummy.stack.slice(firstNewlineIndex + 1);
        })();
        try {
          if (!err.stack) {
            err.stack = stack;
          } else if (stack) {
            const firstNewlineIndex = stack.indexOf("\n");
            const secondNewlineIndex = firstNewlineIndex === -1 ? -1 : stack.indexOf("\n", firstNewlineIndex + 1);
            const stackWithoutTwoTopLines = secondNewlineIndex === -1 ? "" : stack.slice(secondNewlineIndex + 1);
            if (!String(err.stack).endsWith(stackWithoutTwoTopLines)) {
              err.stack += "\n" + stack;
            }
          }
        } catch (e3) {
        }
      }
      throw err;
    }
  }
  _request(configOrUrl, config) {
    if (typeof configOrUrl === "string") {
      config = config || {};
      config.url = configOrUrl;
    } else {
      config = configOrUrl || {};
    }
    config = mergeConfig(this.defaults, config);
    const { transitional: transitional2, paramsSerializer, headers } = config;
    if (transitional2 !== void 0) {
      validator_default.assertOptions(
        transitional2,
        {
          silentJSONParsing: validators2.transitional(validators2.boolean),
          forcedJSONParsing: validators2.transitional(validators2.boolean),
          clarifyTimeoutError: validators2.transitional(validators2.boolean),
          legacyInterceptorReqResOrdering: validators2.transitional(validators2.boolean),
          advertiseZstdAcceptEncoding: validators2.transitional(validators2.boolean),
          validateStatusUndefinedResolves: validators2.transitional(validators2.boolean)
        },
        false
      );
    }
    if (paramsSerializer != null) {
      if (utils_default.isFunction(paramsSerializer)) {
        config.paramsSerializer = {
          serialize: paramsSerializer
        };
      } else {
        validator_default.assertOptions(
          paramsSerializer,
          {
            encode: validators2.function,
            serialize: validators2.function
          },
          true
        );
      }
    }
    if (config.allowAbsoluteUrls !== void 0) {
    } else if (this.defaults.allowAbsoluteUrls !== void 0) {
      config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
    } else {
      config.allowAbsoluteUrls = true;
    }
    validator_default.assertOptions(
      config,
      {
        baseUrl: validators2.spelling("baseURL"),
        withXsrfToken: validators2.spelling("withXSRFToken")
      },
      true
    );
    config.method = (config.method || this.defaults.method || "get").toLowerCase();
    let contextHeaders = headers && utils_default.merge(headers.common, headers[config.method]);
    headers && utils_default.forEach(["delete", "get", "head", "post", "put", "patch", "query", "common"], (method) => {
      delete headers[method];
    });
    config.headers = AxiosHeaders_default.concat(contextHeaders, headers);
    const requestInterceptorChain = [];
    let synchronousRequestInterceptors = true;
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) {
        return;
      }
      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
      const transitional3 = config.transitional || transitional_default;
      const legacyInterceptorReqResOrdering = transitional3 && transitional3.legacyInterceptorReqResOrdering;
      if (legacyInterceptorReqResOrdering) {
        requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
      } else {
        requestInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
      }
    });
    const responseInterceptorChain = [];
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });
    let promise;
    let i3 = 0;
    let len;
    if (!synchronousRequestInterceptors) {
      const chain = [dispatchRequest.bind(this), void 0];
      chain.unshift(...requestInterceptorChain);
      chain.push(...responseInterceptorChain);
      len = chain.length;
      promise = Promise.resolve(config);
      while (i3 < len) {
        promise = promise.then(chain[i3++], chain[i3++]);
      }
      return promise;
    }
    len = requestInterceptorChain.length;
    let newConfig = config;
    while (i3 < len) {
      const onFulfilled = requestInterceptorChain[i3++];
      const onRejected = requestInterceptorChain[i3++];
      try {
        newConfig = onFulfilled ? onFulfilled(newConfig) : newConfig;
      } catch (error) {
        if (!onRejected) {
          promise = Promise.reject(error);
          break;
        }
        try {
          const rejectedResult = onRejected.call(this, error);
          if (utils_default.isThenable(rejectedResult)) {
            promise = Promise.resolve(rejectedResult).then(
              () => dispatchRequest.call(this, newConfig)
            );
          }
        } catch (rejectedError) {
          promise = Promise.reject(rejectedError);
        }
        break;
      }
    }
    if (!promise) {
      try {
        promise = dispatchRequest.call(this, newConfig);
      } catch (error) {
        promise = Promise.reject(error);
      }
    }
    i3 = 0;
    len = responseInterceptorChain.length;
    while (i3 < len) {
      promise = promise.then(responseInterceptorChain[i3++], responseInterceptorChain[i3++]);
    }
    return promise;
  }
  getUri(config) {
    config = mergeConfig(this.defaults, config);
    const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls, config);
    return buildURL(fullPath, config.params, config.paramsSerializer);
  }
};
utils_default.forEach(["delete", "get", "head", "options"], function forEachMethodNoData(method) {
  Axios.prototype[method] = function(url, config) {
    return this.request(
      mergeConfig(config || {}, {
        method,
        url,
        data: config && utils_default.hasOwnProp(config, "data") ? config.data : void 0
      })
    );
  };
});
utils_default.forEach(["post", "put", "patch", "query"], function forEachMethodWithData(method) {
  function generateHTTPMethod(isForm) {
    return function httpMethod(url, data, config) {
      return this.request(
        mergeConfig(config || {}, {
          method,
          headers: isForm ? {
            "Content-Type": "multipart/form-data"
          } : {},
          url,
          data
        })
      );
    };
  }
  Axios.prototype[method] = generateHTTPMethod();
  if (method !== "query") {
    Axios.prototype[method + "Form"] = generateHTTPMethod(true);
  }
});
var Axios_default = Axios;

// node_modules/axios/lib/cancel/CancelToken.js
var CancelToken = class _CancelToken {
  constructor(executor) {
    if (typeof executor !== "function") {
      throw new TypeError("executor must be a function.");
    }
    let resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });
    const token = this;
    this.promise.then((cancel) => {
      if (!token._listeners) return;
      let i3 = token._listeners.length;
      while (i3-- > 0) {
        token._listeners[i3](cancel);
      }
      token._listeners = null;
    });
    this.promise.then = (onfulfilled) => {
      let _resolve;
      const promise = new Promise((resolve) => {
        token.subscribe(resolve);
        _resolve = resolve;
      }).then(onfulfilled);
      promise.cancel = function reject() {
        token.unsubscribe(_resolve);
      };
      return promise;
    };
    executor(function cancel(message, config, request) {
      if (token.reason) {
        return;
      }
      token.reason = new CanceledError_default(message, config, request);
      resolvePromise(token.reason);
    });
  }
  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  }
  /**
   * Subscribe to the cancel signal
   */
  subscribe(listener) {
    if (this.reason) {
      listener(this.reason);
      return;
    }
    if (this._listeners) {
      this._listeners.push(listener);
    } else {
      this._listeners = [listener];
    }
  }
  /**
   * Unsubscribe from the cancel signal
   */
  unsubscribe(listener) {
    if (!this._listeners) {
      return;
    }
    const index2 = this._listeners.indexOf(listener);
    if (index2 !== -1) {
      this._listeners.splice(index2, 1);
    }
  }
  toAbortSignal() {
    const controller = new AbortController();
    const abort = (err) => {
      controller.abort(err);
    };
    this.subscribe(abort);
    controller.signal.unsubscribe = () => this.unsubscribe(abort);
    return controller.signal;
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let cancel;
    const token = new _CancelToken(function executor(c3) {
      cancel = c3;
    });
    return {
      token,
      cancel
    };
  }
};
var CancelToken_default = CancelToken;

// node_modules/axios/lib/helpers/spread.js
function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
}

// node_modules/axios/lib/helpers/isAxiosError.js
function isAxiosError(payload) {
  return utils_default.isObject(payload) && payload.isAxiosError === true;
}

// node_modules/axios/lib/helpers/HttpStatusCode.js
var HttpStatusCode = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511,
  WebServerReturnsAnUnknownError: 520,
  WebServerIsDown: 521,
  ConnectionTimedOut: 522,
  OriginIsUnreachable: 523,
  TimeoutOccurred: 524,
  SslHandshakeFailed: 525,
  InvalidSslCertificate: 526
};
Object.entries(HttpStatusCode).forEach(([key, value]) => {
  HttpStatusCode[value] = key;
});
var HttpStatusCode_default = HttpStatusCode;

// node_modules/axios/lib/axios.js
function createInstance(defaultConfig) {
  const context = new Axios_default(defaultConfig);
  const instance = bind(Axios_default.prototype.request, context);
  utils_default.extend(instance, Axios_default.prototype, context, { allOwnKeys: true });
  utils_default.extend(instance, context, null, { allOwnKeys: true });
  instance.create = function create2(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };
  return instance;
}
var axios = createInstance(defaults_default);
axios.Axios = Axios_default;
axios.CanceledError = CanceledError_default;
axios.CancelToken = CancelToken_default;
axios.isCancel = isCancel;
axios.VERSION = VERSION;
axios.toFormData = toFormData_default;
axios.AxiosError = AxiosError_default;
axios.Cancel = axios.CanceledError;
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = spread;
axios.isAxiosError = isAxiosError;
axios.mergeConfig = mergeConfig;
axios.AxiosHeaders = AxiosHeaders_default;
axios.formToJSON = (thing) => formDataToJSON_default(utils_default.isHTMLForm(thing) ? new FormData(thing) : thing);
axios.getAdapter = adapters_default.getAdapter;
axios.HttpStatusCode = HttpStatusCode_default;
axios.default = axios;
var axios_default = axios;

// node_modules/axios/index.js
var {
  Axios: Axios2,
  AxiosError: AxiosError2,
  CanceledError: CanceledError2,
  isCancel: isCancel2,
  CancelToken: CancelToken2,
  VERSION: VERSION2,
  all: all2,
  Cancel,
  isAxiosError: isAxiosError2,
  spread: spread2,
  toFormData: toFormData2,
  AxiosHeaders: AxiosHeaders2,
  HttpStatusCode: HttpStatusCode2,
  formToJSON,
  getAdapter: getAdapter2,
  mergeConfig: mergeConfig2,
  create
} = axios_default;

// node_modules/@imtbl/generated-clients/dist/browser/index.js
var t2 = Object.defineProperty;
var n2 = (e3, n3) => {
  let r3 = {};
  for (var i3 in e3) t2(r3, i3, { get: e3[i3], enumerable: true });
  return n3 || t2(r3, Symbol.toStringTag, { value: `Module` }), r3;
};
var r2 = `https://api.sandbox.immutable.com`.replace(/\/+$/, ``);
var i2 = class {
  constructor(t3, n3 = r2, i3 = axios_default) {
    __publicField(this, "basePath");
    __publicField(this, "axios");
    __publicField(this, "configuration");
    this.basePath = n3, this.axios = i3, t3 && (this.configuration = t3, this.basePath = t3.basePath || this.basePath);
  }
};
var a2 = class extends Error {
  constructor(e3, t3) {
    super(t3);
    __publicField(this, "field");
    this.field = e3, this.name = `RequiredError`;
  }
};
var o3 = `https://example.com`;
var s2 = function(e3, t3, n3) {
  if (n3 == null) throw new a2(t3, `Required parameter ${t3} was null or undefined when calling ${e3}.`);
};
var c2 = async function(e3, t3, n3) {
  n3 && n3.apiKey && (e3[t3] = typeof n3.apiKey == `function` ? await n3.apiKey(t3) : await n3.apiKey);
};
var l2 = async function(e3, t3) {
  t3 && t3.accessToken && (e3.Authorization = `Bearer ` + (typeof t3.accessToken == `function` ? await t3.accessToken() : await t3.accessToken));
};
function u2(e3, t3, n3 = ``) {
  t3 != null && (typeof t3 == `object` ? Array.isArray(t3) ? t3.forEach((t4) => u2(e3, t4, n3)) : Object.keys(t3).forEach((r3) => u2(e3, t3[r3], `${n3}${n3 === `` ? `` : `.`}${r3}`)) : e3.has(n3) ? e3.append(n3, t3) : e3.set(n3, t3));
}
var d2 = function(e3, ...t3) {
  let n3 = new URLSearchParams(e3.search);
  u2(n3, t3), e3.search = n3.toString();
};
var f2 = function(e3, t3, n3) {
  let r3 = typeof e3 != `string`;
  return (r3 && n3 && n3.isJsonMime ? n3.isJsonMime(t3.headers[`Content-Type`]) : r3) ? JSON.stringify(e3 === void 0 ? {} : e3) : e3 || ``;
};
var p3 = function(e3) {
  return e3.pathname + e3.search + e3.hash;
};
var m3 = function(e3, t3, n3, r3) {
  return (i3 = t3, a3 = n3) => {
    let o4 = { ...e3.options, url: (r3?.basePath || i3.defaults.baseURL || a3) + e3.url };
    return i3.request(o4);
  };
};
var h3 = function(e3) {
  return { getActivity: async (t3, n3, r3 = {}) => {
    s2(`getActivity`, `chainName`, t3), s2(`getActivity`, `activityId`, n3);
    let i3 = `/v1/chains/{chain_name}/activities/{activity_id}`.replace(`{chain_name}`, encodeURIComponent(String(t3))).replace(`{activity_id}`, encodeURIComponent(String(n3))), a3 = new URL(i3, o3), c3;
    e3 && (c3 = e3.baseOptions);
    let l3 = { method: `GET`, ...c3, ...r3 }, u3 = {};
    d2(a3, {});
    let f3 = c3 && c3.headers ? c3.headers : {};
    return l3.headers = { ...u3, ...f3, ...r3.headers }, { url: p3(a3), options: l3 };
  }, listActivities: async (t3, n3, r3, i3, a3, c3, l3, u3, f3 = {}) => {
    s2(`listActivities`, `chainName`, t3);
    let m4 = `/v1/chains/{chain_name}/activities`.replace(`{chain_name}`, encodeURIComponent(String(t3))), h4 = new URL(m4, o3), g4;
    e3 && (g4 = e3.baseOptions);
    let _4 = { method: `GET`, ...g4, ...f3 }, v4 = {}, y4 = {};
    n3 !== void 0 && (y4.contract_address = n3), r3 !== void 0 && (y4.token_id = r3), i3 !== void 0 && (y4.account_address = i3), a3 !== void 0 && (y4.activity_type = a3), c3 !== void 0 && (y4.transaction_hash = c3), l3 !== void 0 && (y4.page_cursor = l3), u3 !== void 0 && (y4.page_size = u3), d2(h4, y4);
    let b4 = g4 && g4.headers ? g4.headers : {};
    return _4.headers = { ...v4, ...b4, ...f3.headers }, { url: p3(h4), options: _4 };
  }, listActivityHistory: async (t3, n3, r3, i3, a3, c3, l3, u3 = {}) => {
    s2(`listActivityHistory`, `chainName`, t3), s2(`listActivityHistory`, `fromUpdatedAt`, n3);
    let f3 = `/v1/chains/{chain_name}/activity-history`.replace(`{chain_name}`, encodeURIComponent(String(t3))), m4 = new URL(f3, o3), h4;
    e3 && (h4 = e3.baseOptions);
    let g4 = { method: `GET`, ...h4, ...u3 }, _4 = {}, v4 = {};
    n3 !== void 0 && (v4.from_updated_at = n3 instanceof Date ? n3.toISOString() : n3), r3 !== void 0 && (v4.to_updated_at = r3 instanceof Date ? r3.toISOString() : r3), i3 !== void 0 && (v4.contract_address = i3), a3 !== void 0 && (v4.activity_type = a3), c3 !== void 0 && (v4.page_cursor = c3), l3 !== void 0 && (v4.page_size = l3), d2(m4, v4);
    let y4 = h4 && h4.headers ? h4.headers : {};
    return g4.headers = { ..._4, ...y4, ...u3.headers }, { url: p3(m4), options: g4 };
  } };
};
var g3 = function(t3) {
  let n3 = h3(t3);
  return { async getActivity(i3, a3, o4) {
    return m3(await n3.getActivity(i3, a3, o4), axios_default, r2, t3);
  }, async listActivities(i3, a3, o4, s3, c3, l3, u3, d3, f3) {
    return m3(await n3.listActivities(i3, a3, o4, s3, c3, l3, u3, d3, f3), axios_default, r2, t3);
  }, async listActivityHistory(i3, a3, o4, s3, c3, l3, u3, d3) {
    return m3(await n3.listActivityHistory(i3, a3, o4, s3, c3, l3, u3, d3), axios_default, r2, t3);
  } };
};
var _3 = function(e3, t3, n3) {
  let r3 = g3(e3);
  return { getActivity(e4, i3) {
    return r3.getActivity(e4.chainName, e4.activityId, i3).then((e5) => e5(n3, t3));
  }, listActivities(e4, i3) {
    return r3.listActivities(e4.chainName, e4.contractAddress, e4.tokenId, e4.accountAddress, e4.activityType, e4.transactionHash, e4.pageCursor, e4.pageSize, i3).then((e5) => e5(n3, t3));
  }, listActivityHistory(e4, i3) {
    return r3.listActivityHistory(e4.chainName, e4.fromUpdatedAt, e4.toUpdatedAt, e4.contractAddress, e4.activityType, e4.pageCursor, e4.pageSize, i3).then((e5) => e5(n3, t3));
  } };
};
var v3 = class extends i2 {
  getActivity(e3, t3) {
    return g3(this.configuration).getActivity(e3.chainName, e3.activityId, t3).then((e4) => e4(this.axios, this.basePath));
  }
  listActivities(e3, t3) {
    return g3(this.configuration).listActivities(e3.chainName, e3.contractAddress, e3.tokenId, e3.accountAddress, e3.activityType, e3.transactionHash, e3.pageCursor, e3.pageSize, t3).then((e4) => e4(this.axios, this.basePath));
  }
  listActivityHistory(e3, t3) {
    return g3(this.configuration).listActivityHistory(e3.chainName, e3.fromUpdatedAt, e3.toUpdatedAt, e3.contractAddress, e3.activityType, e3.pageCursor, e3.pageSize, t3).then((e4) => e4(this.axios, this.basePath));
  }
};
var y3 = function(e3) {
  return { listChains: async (t3, n3, r3 = {}) => {
    let i3 = new URL(`/v1/chains`, o3), a3;
    e3 && (a3 = e3.baseOptions);
    let s3 = { method: `GET`, ...a3, ...r3 }, c3 = {}, l3 = {};
    t3 !== void 0 && (l3.page_cursor = t3), n3 !== void 0 && (l3.page_size = n3), d2(i3, l3);
    let u3 = a3 && a3.headers ? a3.headers : {};
    return s3.headers = { ...c3, ...u3, ...r3.headers }, { url: p3(i3), options: s3 };
  } };
};
var b3 = function(t3) {
  let n3 = y3(t3);
  return { async listChains(i3, a3, o4) {
    return m3(await n3.listChains(i3, a3, o4), axios_default, r2, t3);
  } };
};
var x3 = function(e3, t3, n3) {
  let r3 = b3(e3);
  return { listChains(e4 = {}, i3) {
    return r3.listChains(e4.pageCursor, e4.pageSize, i3).then((e5) => e5(n3, t3));
  } };
};
var S3 = class extends i2 {
  listChains(e3 = {}, t3) {
    return b3(this.configuration).listChains(e3.pageCursor, e3.pageSize, t3).then((e4) => e4(this.axios, this.basePath));
  }
};
var C3 = function(e3) {
  return { getCollection: async (t3, n3, r3 = {}) => {
    s2(`getCollection`, `contractAddress`, t3), s2(`getCollection`, `chainName`, n3);
    let i3 = `/v1/chains/{chain_name}/collections/{contract_address}`.replace(`{contract_address}`, encodeURIComponent(String(t3))).replace(`{chain_name}`, encodeURIComponent(String(n3))), a3 = new URL(i3, o3), c3;
    e3 && (c3 = e3.baseOptions);
    let l3 = { method: `GET`, ...c3, ...r3 }, u3 = {};
    d2(a3, {});
    let f3 = c3 && c3.headers ? c3.headers : {};
    return l3.headers = { ...u3, ...f3, ...r3.headers }, { url: p3(a3), options: l3 };
  }, listCollections: async (t3, n3, r3, i3, a3, c3, l3 = {}) => {
    s2(`listCollections`, `chainName`, t3);
    let u3 = `/v1/chains/{chain_name}/collections`.replace(`{chain_name}`, encodeURIComponent(String(t3))), f3 = new URL(u3, o3), m4;
    e3 && (m4 = e3.baseOptions);
    let h4 = { method: `GET`, ...m4, ...l3 }, g4 = {}, _4 = {};
    n3 && (_4.contract_address = n3), r3 && (_4.verification_status = r3), i3 !== void 0 && (_4.from_updated_at = i3 instanceof Date ? i3.toISOString() : i3), a3 !== void 0 && (_4.page_cursor = a3), c3 !== void 0 && (_4.page_size = c3), d2(f3, _4);
    let v4 = m4 && m4.headers ? m4.headers : {};
    return h4.headers = { ...g4, ...v4, ...l3.headers }, { url: p3(f3), options: h4 };
  }, listCollectionsByNFTOwner: async (t3, n3, r3, i3, a3 = {}) => {
    s2(`listCollectionsByNFTOwner`, `accountAddress`, t3), s2(`listCollectionsByNFTOwner`, `chainName`, n3);
    let c3 = `/v1/chains/{chain_name}/accounts/{account_address}/collections`.replace(`{account_address}`, encodeURIComponent(String(t3))).replace(`{chain_name}`, encodeURIComponent(String(n3))), l3 = new URL(c3, o3), u3;
    e3 && (u3 = e3.baseOptions);
    let f3 = { method: `GET`, ...u3, ...a3 }, m4 = {}, h4 = {};
    r3 !== void 0 && (h4.page_cursor = r3), i3 !== void 0 && (h4.page_size = i3), d2(l3, h4);
    let g4 = u3 && u3.headers ? u3.headers : {};
    return f3.headers = { ...m4, ...g4, ...a3.headers }, { url: p3(l3), options: f3 };
  }, refreshCollectionMetadata: async (t3, n3, r3, i3 = {}) => {
    s2(`refreshCollectionMetadata`, `contractAddress`, t3), s2(`refreshCollectionMetadata`, `chainName`, n3), s2(`refreshCollectionMetadata`, `refreshCollectionMetadataRequest`, r3);
    let a3 = `/v1/chains/{chain_name}/collections/{contract_address}/refresh-metadata`.replace(`{contract_address}`, encodeURIComponent(String(t3))).replace(`{chain_name}`, encodeURIComponent(String(n3))), u3 = new URL(a3, o3), m4;
    e3 && (m4 = e3.baseOptions);
    let h4 = { method: `POST`, ...m4, ...i3 }, g4 = {};
    await l2(g4, e3), await c2(g4, `x-immutable-api-key`, e3), await l2(g4, e3), g4[`Content-Type`] = `application/json`, d2(u3, {});
    let _4 = m4 && m4.headers ? m4.headers : {};
    return h4.headers = { ...g4, ..._4, ...i3.headers }, h4.data = f2(r3, h4, e3), { url: p3(u3), options: h4 };
  } };
};
var w3 = function(t3) {
  let n3 = C3(t3);
  return { async getCollection(i3, a3, o4) {
    return m3(await n3.getCollection(i3, a3, o4), axios_default, r2, t3);
  }, async listCollections(i3, a3, o4, s3, c3, l3, u3) {
    return m3(await n3.listCollections(i3, a3, o4, s3, c3, l3, u3), axios_default, r2, t3);
  }, async listCollectionsByNFTOwner(i3, a3, o4, s3, c3) {
    return m3(await n3.listCollectionsByNFTOwner(i3, a3, o4, s3, c3), axios_default, r2, t3);
  }, async refreshCollectionMetadata(i3, a3, o4, s3) {
    return m3(await n3.refreshCollectionMetadata(i3, a3, o4, s3), axios_default, r2, t3);
  } };
};
var ee3 = function(e3, t3, n3) {
  let r3 = w3(e3);
  return { getCollection(e4, i3) {
    return r3.getCollection(e4.contractAddress, e4.chainName, i3).then((e5) => e5(n3, t3));
  }, listCollections(e4, i3) {
    return r3.listCollections(e4.chainName, e4.contractAddress, e4.verificationStatus, e4.fromUpdatedAt, e4.pageCursor, e4.pageSize, i3).then((e5) => e5(n3, t3));
  }, listCollectionsByNFTOwner(e4, i3) {
    return r3.listCollectionsByNFTOwner(e4.accountAddress, e4.chainName, e4.pageCursor, e4.pageSize, i3).then((e5) => e5(n3, t3));
  }, refreshCollectionMetadata(e4, i3) {
    return r3.refreshCollectionMetadata(e4.contractAddress, e4.chainName, e4.refreshCollectionMetadataRequest, i3).then((e5) => e5(n3, t3));
  } };
};
var te3 = class extends i2 {
  getCollection(e3, t3) {
    return w3(this.configuration).getCollection(e3.contractAddress, e3.chainName, t3).then((e4) => e4(this.axios, this.basePath));
  }
  listCollections(e3, t3) {
    return w3(this.configuration).listCollections(e3.chainName, e3.contractAddress, e3.verificationStatus, e3.fromUpdatedAt, e3.pageCursor, e3.pageSize, t3).then((e4) => e4(this.axios, this.basePath));
  }
  listCollectionsByNFTOwner(e3, t3) {
    return w3(this.configuration).listCollectionsByNFTOwner(e3.accountAddress, e3.chainName, e3.pageCursor, e3.pageSize, t3).then((e4) => e4(this.axios, this.basePath));
  }
  refreshCollectionMetadata(e3, t3) {
    return w3(this.configuration).refreshCollectionMetadata(e3.contractAddress, e3.chainName, e3.refreshCollectionMetadataRequest, t3).then((e4) => e4(this.axios, this.basePath));
  }
};
var ne3 = function(e3) {
  return { signCraftingPayload: async (t3, n3, r3 = {}) => {
    s2(`signCraftingPayload`, `chainName`, t3), s2(`signCraftingPayload`, `signCraftingRequest`, n3);
    let i3 = `/v1/chains/{chain_name}/crafting/sign`.replace(`{chain_name}`, encodeURIComponent(String(t3))), a3 = new URL(i3, o3), l3;
    e3 && (l3 = e3.baseOptions);
    let u3 = { method: `POST`, ...l3, ...r3 }, m4 = {};
    await c2(m4, `x-immutable-api-key`, e3), m4[`Content-Type`] = `application/json`, d2(a3, {});
    let h4 = l3 && l3.headers ? l3.headers : {};
    return u3.headers = { ...m4, ...h4, ...r3.headers }, u3.data = f2(n3, u3, e3), { url: p3(a3), options: u3 };
  } };
};
var T3 = function(t3) {
  let n3 = ne3(t3);
  return { async signCraftingPayload(i3, a3, o4) {
    return m3(await n3.signCraftingPayload(i3, a3, o4), axios_default, r2, t3);
  } };
};
var re3 = function(e3, t3, n3) {
  let r3 = T3(e3);
  return { signCraftingPayload(e4, i3) {
    return r3.signCraftingPayload(e4.chainName, e4.signCraftingRequest, i3).then((e5) => e5(n3, t3));
  } };
};
var ie3 = class extends i2 {
  signCraftingPayload(e3, t3) {
    return T3(this.configuration).signCraftingPayload(e3.chainName, e3.signCraftingRequest, t3).then((e4) => e4(this.axios, this.basePath));
  }
};
var ae2 = function(e3) {
  return { approvePendingERC191Message: async (t3, n3 = {}) => {
    s2(`approvePendingERC191Message`, `messageID`, t3);
    let r3 = `/guardian/v1/erc191-messages/{messageID}/approve`.replace(`{messageID}`, encodeURIComponent(String(t3))), i3 = new URL(r3, o3), a3;
    e3 && (a3 = e3.baseOptions);
    let c3 = { method: `POST`, ...a3, ...n3 }, u3 = {};
    await l2(u3, e3), d2(i3, {});
    let f3 = a3 && a3.headers ? a3.headers : {};
    return c3.headers = { ...u3, ...f3, ...n3.headers }, { url: p3(i3), options: c3 };
  }, approvePendingMessage: async (t3, n3 = {}) => {
    s2(`approvePendingMessage`, `messageID`, t3);
    let r3 = `/guardian/v1/messages/{messageID}/approve`.replace(`{messageID}`, encodeURIComponent(String(t3))), i3 = new URL(r3, o3), a3;
    e3 && (a3 = e3.baseOptions);
    let c3 = { method: `POST`, ...a3, ...n3 }, u3 = {};
    await l2(u3, e3), d2(i3, {});
    let f3 = a3 && a3.headers ? a3.headers : {};
    return c3.headers = { ...u3, ...f3, ...n3.headers }, { url: p3(i3), options: c3 };
  }, approvePendingTransaction: async (t3, n3, r3 = {}) => {
    s2(`approvePendingTransaction`, `payloadHash`, t3), s2(`approvePendingTransaction`, `transactionApprovalRequest`, n3);
    let i3 = `/guardian/v1/transactions/{payloadHash}/approve`.replace(`{payloadHash}`, encodeURIComponent(String(t3))), a3 = new URL(i3, o3), c3;
    e3 && (c3 = e3.baseOptions);
    let u3 = { method: `POST`, ...c3, ...r3 }, m4 = {};
    await l2(m4, e3), m4[`Content-Type`] = `application/json`, d2(a3, {});
    let h4 = c3 && c3.headers ? c3.headers : {};
    return u3.headers = { ...m4, ...h4, ...r3.headers }, u3.data = f2(n3, u3, e3), { url: p3(a3), options: u3 };
  }, evaluateErc191Message: async (t3, n3 = {}) => {
    s2(`evaluateErc191Message`, `eRC191MessageEvaluationRequest`, t3);
    let r3 = new URL(`/guardian/v1/erc191-messages/evaluate`, o3), i3;
    e3 && (i3 = e3.baseOptions);
    let a3 = { method: `POST`, ...i3, ...n3 }, c3 = {};
    await l2(c3, e3), c3[`Content-Type`] = `application/json`, d2(r3, {});
    let u3 = i3 && i3.headers ? i3.headers : {};
    return a3.headers = { ...c3, ...u3, ...n3.headers }, a3.data = f2(t3, a3, e3), { url: p3(r3), options: a3 };
  }, evaluateMessage: async (t3, n3 = {}) => {
    s2(`evaluateMessage`, `messageEvaluationRequest`, t3);
    let r3 = new URL(`/guardian/v1/messages/evaluate`, o3), i3;
    e3 && (i3 = e3.baseOptions);
    let a3 = { method: `POST`, ...i3, ...n3 }, c3 = {};
    await l2(c3, e3), c3[`Content-Type`] = `application/json`, d2(r3, {});
    let u3 = i3 && i3.headers ? i3.headers : {};
    return a3.headers = { ...c3, ...u3, ...n3.headers }, a3.data = f2(t3, a3, e3), { url: p3(r3), options: a3 };
  }, evaluateTransaction: async (t3, n3, r3 = {}) => {
    s2(`evaluateTransaction`, `id`, t3), s2(`evaluateTransaction`, `transactionEvaluationRequest`, n3);
    let i3 = `/guardian/v1/transactions/{id}/evaluate`.replace(`{id}`, encodeURIComponent(String(t3))), a3 = new URL(i3, o3), c3;
    e3 && (c3 = e3.baseOptions);
    let u3 = { method: `POST`, ...c3, ...r3 }, m4 = {};
    await l2(m4, e3), m4[`Content-Type`] = `application/json`, d2(a3, {});
    let h4 = c3 && c3.headers ? c3.headers : {};
    return u3.headers = { ...m4, ...h4, ...r3.headers }, u3.data = f2(n3, u3, e3), { url: p3(a3), options: u3 };
  }, getErc191MessageByID: async (t3, n3 = {}) => {
    s2(`getErc191MessageByID`, `messageID`, t3);
    let r3 = `/guardian/v1/erc191-messages/{messageID}`.replace(`{messageID}`, encodeURIComponent(String(t3))), i3 = new URL(r3, o3), a3;
    e3 && (a3 = e3.baseOptions);
    let c3 = { method: `GET`, ...a3, ...n3 }, u3 = {};
    await l2(u3, e3), d2(i3, {});
    let f3 = a3 && a3.headers ? a3.headers : {};
    return c3.headers = { ...u3, ...f3, ...n3.headers }, { url: p3(i3), options: c3 };
  }, getMessageByID: async (t3, n3 = {}) => {
    s2(`getMessageByID`, `messageID`, t3);
    let r3 = `/guardian/v1/messages/{messageID}`.replace(`{messageID}`, encodeURIComponent(String(t3))), i3 = new URL(r3, o3), a3;
    e3 && (a3 = e3.baseOptions);
    let c3 = { method: `GET`, ...a3, ...n3 }, u3 = {};
    await l2(u3, e3), d2(i3, {});
    let f3 = a3 && a3.headers ? a3.headers : {};
    return c3.headers = { ...u3, ...f3, ...n3.headers }, { url: p3(i3), options: c3 };
  }, getTransactionByID: async (t3, n3, r3, i3 = {}) => {
    s2(`getTransactionByID`, `transactionID`, t3), s2(`getTransactionByID`, `chainType`, n3);
    let a3 = `/guardian/v1/transactions/{transactionID}`.replace(`{transactionID}`, encodeURIComponent(String(t3))), c3 = new URL(a3, o3), u3;
    e3 && (u3 = e3.baseOptions);
    let f3 = { method: `GET`, ...u3, ...i3 }, m4 = {}, h4 = {};
    await l2(m4, e3), n3 !== void 0 && (h4.chainType = n3), r3 !== void 0 && (h4.chainID = r3), d2(c3, h4);
    let g4 = u3 && u3.headers ? u3.headers : {};
    return f3.headers = { ...m4, ...g4, ...i3.headers }, { url: p3(c3), options: f3 };
  } };
};
var E3 = function(t3) {
  let n3 = ae2(t3);
  return { async approvePendingERC191Message(i3, a3) {
    return m3(await n3.approvePendingERC191Message(i3, a3), axios_default, r2, t3);
  }, async approvePendingMessage(i3, a3) {
    return m3(await n3.approvePendingMessage(i3, a3), axios_default, r2, t3);
  }, async approvePendingTransaction(i3, a3, o4) {
    return m3(await n3.approvePendingTransaction(i3, a3, o4), axios_default, r2, t3);
  }, async evaluateErc191Message(i3, a3) {
    return m3(await n3.evaluateErc191Message(i3, a3), axios_default, r2, t3);
  }, async evaluateMessage(i3, a3) {
    return m3(await n3.evaluateMessage(i3, a3), axios_default, r2, t3);
  }, async evaluateTransaction(i3, a3, o4) {
    return m3(await n3.evaluateTransaction(i3, a3, o4), axios_default, r2, t3);
  }, async getErc191MessageByID(i3, a3) {
    return m3(await n3.getErc191MessageByID(i3, a3), axios_default, r2, t3);
  }, async getMessageByID(i3, a3) {
    return m3(await n3.getMessageByID(i3, a3), axios_default, r2, t3);
  }, async getTransactionByID(i3, a3, o4, s3) {
    return m3(await n3.getTransactionByID(i3, a3, o4, s3), axios_default, r2, t3);
  } };
};
var oe2 = function(e3, t3, n3) {
  let r3 = E3(e3);
  return { approvePendingERC191Message(e4, i3) {
    return r3.approvePendingERC191Message(e4.messageID, i3).then((e5) => e5(n3, t3));
  }, approvePendingMessage(e4, i3) {
    return r3.approvePendingMessage(e4.messageID, i3).then((e5) => e5(n3, t3));
  }, approvePendingTransaction(e4, i3) {
    return r3.approvePendingTransaction(e4.payloadHash, e4.transactionApprovalRequest, i3).then((e5) => e5(n3, t3));
  }, evaluateErc191Message(e4, i3) {
    return r3.evaluateErc191Message(e4.eRC191MessageEvaluationRequest, i3).then((e5) => e5(n3, t3));
  }, evaluateMessage(e4, i3) {
    return r3.evaluateMessage(e4.messageEvaluationRequest, i3).then((e5) => e5(n3, t3));
  }, evaluateTransaction(e4, i3) {
    return r3.evaluateTransaction(e4.id, e4.transactionEvaluationRequest, i3).then((e5) => e5(n3, t3));
  }, getErc191MessageByID(e4, i3) {
    return r3.getErc191MessageByID(e4.messageID, i3).then((e5) => e5(n3, t3));
  }, getMessageByID(e4, i3) {
    return r3.getMessageByID(e4.messageID, i3).then((e5) => e5(n3, t3));
  }, getTransactionByID(e4, i3) {
    return r3.getTransactionByID(e4.transactionID, e4.chainType, e4.chainID, i3).then((e5) => e5(n3, t3));
  } };
};
var D3 = class extends i2 {
  approvePendingERC191Message(e3, t3) {
    return E3(this.configuration).approvePendingERC191Message(e3.messageID, t3).then((e4) => e4(this.axios, this.basePath));
  }
  approvePendingMessage(e3, t3) {
    return E3(this.configuration).approvePendingMessage(e3.messageID, t3).then((e4) => e4(this.axios, this.basePath));
  }
  approvePendingTransaction(e3, t3) {
    return E3(this.configuration).approvePendingTransaction(e3.payloadHash, e3.transactionApprovalRequest, t3).then((e4) => e4(this.axios, this.basePath));
  }
  evaluateErc191Message(e3, t3) {
    return E3(this.configuration).evaluateErc191Message(e3.eRC191MessageEvaluationRequest, t3).then((e4) => e4(this.axios, this.basePath));
  }
  evaluateMessage(e3, t3) {
    return E3(this.configuration).evaluateMessage(e3.messageEvaluationRequest, t3).then((e4) => e4(this.axios, this.basePath));
  }
  evaluateTransaction(e3, t3) {
    return E3(this.configuration).evaluateTransaction(e3.id, e3.transactionEvaluationRequest, t3).then((e4) => e4(this.axios, this.basePath));
  }
  getErc191MessageByID(e3, t3) {
    return E3(this.configuration).getErc191MessageByID(e3.messageID, t3).then((e4) => e4(this.axios, this.basePath));
  }
  getMessageByID(e3, t3) {
    return E3(this.configuration).getMessageByID(e3.messageID, t3).then((e4) => e4(this.axios, this.basePath));
  }
  getTransactionByID(e3, t3) {
    return E3(this.configuration).getTransactionByID(e3.transactionID, e3.chainType, e3.chainID, t3).then((e4) => e4(this.axios, this.basePath));
  }
};
var se2 = { Evm: `evm` };
var O3 = function(e3) {
  return { getMetadata: async (t3, n3, r3, i3 = {}) => {
    s2(`getMetadata`, `chainName`, t3), s2(`getMetadata`, `contractAddress`, n3), s2(`getMetadata`, `metadataId`, r3);
    let a3 = `/v1/chains/{chain_name}/collections/{contract_address}/metadata/{metadata_id}`.replace(`{chain_name}`, encodeURIComponent(String(t3))).replace(`{contract_address}`, encodeURIComponent(String(n3))).replace(`{metadata_id}`, encodeURIComponent(String(r3))), c3 = new URL(a3, o3), l3;
    e3 && (l3 = e3.baseOptions);
    let u3 = { method: `GET`, ...l3, ...i3 }, f3 = {};
    d2(c3, {});
    let m4 = l3 && l3.headers ? l3.headers : {};
    return u3.headers = { ...f3, ...m4, ...i3.headers }, { url: p3(c3), options: u3 };
  }, listMetadata: async (t3, n3, r3, i3, a3, c3 = {}) => {
    s2(`listMetadata`, `chainName`, t3), s2(`listMetadata`, `contractAddress`, n3);
    let l3 = `/v1/chains/{chain_name}/collections/{contract_address}/metadata`.replace(`{chain_name}`, encodeURIComponent(String(t3))).replace(`{contract_address}`, encodeURIComponent(String(n3))), u3 = new URL(l3, o3), f3;
    e3 && (f3 = e3.baseOptions);
    let m4 = { method: `GET`, ...f3, ...c3 }, h4 = {}, g4 = {};
    r3 !== void 0 && (g4.from_updated_at = r3 instanceof Date ? r3.toISOString() : r3), i3 !== void 0 && (g4.page_cursor = i3), a3 !== void 0 && (g4.page_size = a3), d2(u3, g4);
    let _4 = f3 && f3.headers ? f3.headers : {};
    return m4.headers = { ...h4, ..._4, ...c3.headers }, { url: p3(u3), options: m4 };
  }, listMetadataForChain: async (t3, n3, r3, i3, a3 = {}) => {
    s2(`listMetadataForChain`, `chainName`, t3);
    let c3 = `/v1/chains/{chain_name}/metadata`.replace(`{chain_name}`, encodeURIComponent(String(t3))), l3 = new URL(c3, o3), u3;
    e3 && (u3 = e3.baseOptions);
    let f3 = { method: `GET`, ...u3, ...a3 }, m4 = {}, h4 = {};
    n3 !== void 0 && (h4.from_updated_at = n3 instanceof Date ? n3.toISOString() : n3), r3 !== void 0 && (h4.page_cursor = r3), i3 !== void 0 && (h4.page_size = i3), d2(l3, h4);
    let g4 = u3 && u3.headers ? u3.headers : {};
    return f3.headers = { ...m4, ...g4, ...a3.headers }, { url: p3(l3), options: f3 };
  }, listStacks: async (t3, n3, r3 = {}) => {
    s2(`listStacks`, `chainName`, t3), s2(`listStacks`, `stackId`, n3);
    let i3 = `/v1/chains/{chain_name}/stacks`.replace(`{chain_name}`, encodeURIComponent(String(t3))), a3 = new URL(i3, o3), c3;
    e3 && (c3 = e3.baseOptions);
    let l3 = { method: `GET`, ...c3, ...r3 }, u3 = {}, f3 = {};
    n3 && (f3.stack_id = n3), d2(a3, f3);
    let m4 = c3 && c3.headers ? c3.headers : {};
    return l3.headers = { ...u3, ...m4, ...r3.headers }, { url: p3(a3), options: l3 };
  }, refreshMetadataByID: async (t3, n3, r3, i3 = {}) => {
    s2(`refreshMetadataByID`, `chainName`, t3), s2(`refreshMetadataByID`, `contractAddress`, n3), s2(`refreshMetadataByID`, `refreshMetadataByIDRequest`, r3);
    let a3 = `/v1/chains/{chain_name}/collections/{contract_address}/metadata/refresh-metadata`.replace(`{chain_name}`, encodeURIComponent(String(t3))).replace(`{contract_address}`, encodeURIComponent(String(n3))), l3 = new URL(a3, o3), u3;
    e3 && (u3 = e3.baseOptions);
    let m4 = { method: `POST`, ...u3, ...i3 }, h4 = {};
    await c2(h4, `x-immutable-api-key`, e3), h4[`Content-Type`] = `application/json`, d2(l3, {});
    let g4 = u3 && u3.headers ? u3.headers : {};
    return m4.headers = { ...h4, ...g4, ...i3.headers }, m4.data = f2(r3, m4, e3), { url: p3(l3), options: m4 };
  }, refreshNFTMetadataByTokenID: async (t3, n3, r3, i3 = {}) => {
    s2(`refreshNFTMetadataByTokenID`, `contractAddress`, t3), s2(`refreshNFTMetadataByTokenID`, `chainName`, n3), s2(`refreshNFTMetadataByTokenID`, `refreshNFTMetadataByTokenIDRequest`, r3);
    let a3 = `/v1/chains/{chain_name}/collections/{contract_address}/nfts/refresh-metadata`.replace(`{contract_address}`, encodeURIComponent(String(t3))).replace(`{chain_name}`, encodeURIComponent(String(n3))), l3 = new URL(a3, o3), u3;
    e3 && (u3 = e3.baseOptions);
    let m4 = { method: `POST`, ...u3, ...i3 }, h4 = {};
    await c2(h4, `x-immutable-api-key`, e3), h4[`Content-Type`] = `application/json`, d2(l3, {});
    let g4 = u3 && u3.headers ? u3.headers : {};
    return m4.headers = { ...h4, ...g4, ...i3.headers }, m4.data = f2(r3, m4, e3), { url: p3(l3), options: m4 };
  } };
};
var k3 = function(t3) {
  let n3 = O3(t3);
  return { async getMetadata(i3, a3, o4, s3) {
    return m3(await n3.getMetadata(i3, a3, o4, s3), axios_default, r2, t3);
  }, async listMetadata(i3, a3, o4, s3, c3, l3) {
    return m3(await n3.listMetadata(i3, a3, o4, s3, c3, l3), axios_default, r2, t3);
  }, async listMetadataForChain(i3, a3, o4, s3, c3) {
    return m3(await n3.listMetadataForChain(i3, a3, o4, s3, c3), axios_default, r2, t3);
  }, async listStacks(i3, a3, o4) {
    return m3(await n3.listStacks(i3, a3, o4), axios_default, r2, t3);
  }, async refreshMetadataByID(i3, a3, o4, s3) {
    return m3(await n3.refreshMetadataByID(i3, a3, o4, s3), axios_default, r2, t3);
  }, async refreshNFTMetadataByTokenID(i3, a3, o4, s3) {
    return m3(await n3.refreshNFTMetadataByTokenID(i3, a3, o4, s3), axios_default, r2, t3);
  } };
};
var ce2 = function(e3, t3, n3) {
  let r3 = k3(e3);
  return { getMetadata(e4, i3) {
    return r3.getMetadata(e4.chainName, e4.contractAddress, e4.metadataId, i3).then((e5) => e5(n3, t3));
  }, listMetadata(e4, i3) {
    return r3.listMetadata(e4.chainName, e4.contractAddress, e4.fromUpdatedAt, e4.pageCursor, e4.pageSize, i3).then((e5) => e5(n3, t3));
  }, listMetadataForChain(e4, i3) {
    return r3.listMetadataForChain(e4.chainName, e4.fromUpdatedAt, e4.pageCursor, e4.pageSize, i3).then((e5) => e5(n3, t3));
  }, listStacks(e4, i3) {
    return r3.listStacks(e4.chainName, e4.stackId, i3).then((e5) => e5(n3, t3));
  }, refreshMetadataByID(e4, i3) {
    return r3.refreshMetadataByID(e4.chainName, e4.contractAddress, e4.refreshMetadataByIDRequest, i3).then((e5) => e5(n3, t3));
  }, refreshNFTMetadataByTokenID(e4, i3) {
    return r3.refreshNFTMetadataByTokenID(e4.contractAddress, e4.chainName, e4.refreshNFTMetadataByTokenIDRequest, i3).then((e5) => e5(n3, t3));
  } };
};
var le2 = class extends i2 {
  getMetadata(e3, t3) {
    return k3(this.configuration).getMetadata(e3.chainName, e3.contractAddress, e3.metadataId, t3).then((e4) => e4(this.axios, this.basePath));
  }
  listMetadata(e3, t3) {
    return k3(this.configuration).listMetadata(e3.chainName, e3.contractAddress, e3.fromUpdatedAt, e3.pageCursor, e3.pageSize, t3).then((e4) => e4(this.axios, this.basePath));
  }
  listMetadataForChain(e3, t3) {
    return k3(this.configuration).listMetadataForChain(e3.chainName, e3.fromUpdatedAt, e3.pageCursor, e3.pageSize, t3).then((e4) => e4(this.axios, this.basePath));
  }
  listStacks(e3, t3) {
    return k3(this.configuration).listStacks(e3.chainName, e3.stackId, t3).then((e4) => e4(this.axios, this.basePath));
  }
  refreshMetadataByID(e3, t3) {
    return k3(this.configuration).refreshMetadataByID(e3.chainName, e3.contractAddress, e3.refreshMetadataByIDRequest, t3).then((e4) => e4(this.axios, this.basePath));
  }
  refreshNFTMetadataByTokenID(e3, t3) {
    return k3(this.configuration).refreshNFTMetadataByTokenID(e3.contractAddress, e3.chainName, e3.refreshNFTMetadataByTokenIDRequest, t3).then((e4) => e4(this.axios, this.basePath));
  }
};
var A3 = function(e3) {
  return { listFilters: async (t3, n3, r3 = {}) => {
    s2(`listFilters`, `chainName`, t3), s2(`listFilters`, `contractAddress`, n3);
    let i3 = `/v1/chains/{chain_name}/search/filters/{contract_address}`.replace(`{chain_name}`, encodeURIComponent(String(t3))).replace(`{contract_address}`, encodeURIComponent(String(n3))), a3 = new URL(i3, o3), c3;
    e3 && (c3 = e3.baseOptions);
    let l3 = { method: `GET`, ...c3, ...r3 }, u3 = {};
    d2(a3, {});
    let f3 = c3 && c3.headers ? c3.headers : {};
    return l3.headers = { ...u3, ...f3, ...r3.headers }, { url: p3(a3), options: l3 };
  }, searchNFTs: async (t3, n3, r3, i3, a3, c3, l3, u3 = {}) => {
    s2(`searchNFTs`, `chainName`, t3), s2(`searchNFTs`, `contractAddress`, n3);
    let f3 = `/v1/chains/{chain_name}/search/nfts`.replace(`{chain_name}`, encodeURIComponent(String(t3))), m4 = new URL(f3, o3), h4;
    e3 && (h4 = e3.baseOptions);
    let g4 = { method: `GET`, ...h4, ...u3 }, _4 = {}, v4 = {};
    n3 && (v4.contract_address = n3), r3 !== void 0 && (v4.account_address = r3), i3 && (v4.stack_id = i3), a3 !== void 0 && (v4.only_include_owner_listings = a3), c3 !== void 0 && (v4.page_size = c3), l3 !== void 0 && (v4.page_cursor = l3), d2(m4, v4);
    let y4 = h4 && h4.headers ? h4.headers : {};
    return g4.headers = { ..._4, ...y4, ...u3.headers }, { url: p3(m4), options: g4 };
  }, searchStacks: async (t3, n3, r3, i3, a3, c3, l3, u3, f3, m4, h4, g4 = {}) => {
    s2(`searchStacks`, `chainName`, t3), s2(`searchStacks`, `contractAddress`, n3);
    let _4 = `/v1/chains/{chain_name}/search/stacks`.replace(`{chain_name}`, encodeURIComponent(String(t3))), v4 = new URL(_4, o3), y4;
    e3 && (y4 = e3.baseOptions);
    let b4 = { method: `GET`, ...y4, ...g4 }, x4 = {}, S4 = {};
    n3 && (S4.contract_address = n3), r3 !== void 0 && (S4.account_address = r3), i3 !== void 0 && (S4.only_include_owner_listings = i3), a3 !== void 0 && (S4.only_if_has_active_listings = a3), c3 !== void 0 && (S4.traits = c3), l3 !== void 0 && (S4.keyword = l3), u3 !== void 0 && (S4.payment_token = u3), f3 !== void 0 && (S4.sort_by = f3), m4 !== void 0 && (S4.page_size = m4), h4 !== void 0 && (S4.page_cursor = h4), d2(v4, S4);
    let C4 = y4 && y4.headers ? y4.headers : {};
    return b4.headers = { ...x4, ...C4, ...g4.headers }, { url: p3(v4), options: b4 };
  } };
};
var j3 = function(t3) {
  let n3 = A3(t3);
  return { async listFilters(i3, a3, o4) {
    return m3(await n3.listFilters(i3, a3, o4), axios_default, r2, t3);
  }, async searchNFTs(i3, a3, o4, s3, c3, l3, u3, d3) {
    return m3(await n3.searchNFTs(i3, a3, o4, s3, c3, l3, u3, d3), axios_default, r2, t3);
  }, async searchStacks(i3, a3, o4, s3, c3, l3, u3, d3, f3, p4, h4, g4) {
    return m3(await n3.searchStacks(i3, a3, o4, s3, c3, l3, u3, d3, f3, p4, h4, g4), axios_default, r2, t3);
  } };
};
var ue2 = function(e3, t3, n3) {
  let r3 = j3(e3);
  return { listFilters(e4, i3) {
    return r3.listFilters(e4.chainName, e4.contractAddress, i3).then((e5) => e5(n3, t3));
  }, searchNFTs(e4, i3) {
    return r3.searchNFTs(e4.chainName, e4.contractAddress, e4.accountAddress, e4.stackId, e4.onlyIncludeOwnerListings, e4.pageSize, e4.pageCursor, i3).then((e5) => e5(n3, t3));
  }, searchStacks(e4, i3) {
    return r3.searchStacks(e4.chainName, e4.contractAddress, e4.accountAddress, e4.onlyIncludeOwnerListings, e4.onlyIfHasActiveListings, e4.traits, e4.keyword, e4.paymentToken, e4.sortBy, e4.pageSize, e4.pageCursor, i3).then((e5) => e5(n3, t3));
  } };
};
var de2 = class extends i2 {
  listFilters(e3, t3) {
    return j3(this.configuration).listFilters(e3.chainName, e3.contractAddress, t3).then((e4) => e4(this.axios, this.basePath));
  }
  searchNFTs(e3, t3) {
    return j3(this.configuration).searchNFTs(e3.chainName, e3.contractAddress, e3.accountAddress, e3.stackId, e3.onlyIncludeOwnerListings, e3.pageSize, e3.pageCursor, t3).then((e4) => e4(this.axios, this.basePath));
  }
  searchStacks(e3, t3) {
    return j3(this.configuration).searchStacks(e3.chainName, e3.contractAddress, e3.accountAddress, e3.onlyIncludeOwnerListings, e3.onlyIfHasActiveListings, e3.traits, e3.keyword, e3.paymentToken, e3.sortBy, e3.pageSize, e3.pageCursor, t3).then((e4) => e4(this.axios, this.basePath));
  }
};
var fe2 = { CheapestFirst: `cheapest_first` };
var pe2 = function(e3) {
  return { listAllNFTOwners: async (t3, n3, r3, i3, a3 = {}) => {
    s2(`listAllNFTOwners`, `chainName`, t3);
    let c3 = `/v1/chains/{chain_name}/nft-owners`.replace(`{chain_name}`, encodeURIComponent(String(t3))), l3 = new URL(c3, o3), u3;
    e3 && (u3 = e3.baseOptions);
    let f3 = { method: `GET`, ...u3, ...a3 }, m4 = {}, h4 = {};
    n3 !== void 0 && (h4.from_updated_at = n3 instanceof Date ? n3.toISOString() : n3), r3 !== void 0 && (h4.page_cursor = r3), i3 !== void 0 && (h4.page_size = i3), d2(l3, h4);
    let g4 = u3 && u3.headers ? u3.headers : {};
    return f3.headers = { ...m4, ...g4, ...a3.headers }, { url: p3(l3), options: f3 };
  }, listNFTOwners: async (t3, n3, r3, i3, a3, c3 = {}) => {
    s2(`listNFTOwners`, `contractAddress`, t3), s2(`listNFTOwners`, `tokenId`, n3), s2(`listNFTOwners`, `chainName`, r3);
    let l3 = `/v1/chains/{chain_name}/collections/{contract_address}/nfts/{token_id}/owners`.replace(`{contract_address}`, encodeURIComponent(String(t3))).replace(`{token_id}`, encodeURIComponent(String(n3))).replace(`{chain_name}`, encodeURIComponent(String(r3))), u3 = new URL(l3, o3), f3;
    e3 && (f3 = e3.baseOptions);
    let m4 = { method: `GET`, ...f3, ...c3 }, h4 = {}, g4 = {};
    i3 !== void 0 && (g4.page_cursor = i3), a3 !== void 0 && (g4.page_size = a3), d2(u3, g4);
    let _4 = f3 && f3.headers ? f3.headers : {};
    return m4.headers = { ...h4, ..._4, ...c3.headers }, { url: p3(u3), options: m4 };
  }, listOwnersByContractAddress: async (t3, n3, r3, i3, a3, c3, l3 = {}) => {
    s2(`listOwnersByContractAddress`, `contractAddress`, t3), s2(`listOwnersByContractAddress`, `chainName`, n3);
    let u3 = `/v1/chains/{chain_name}/collections/{contract_address}/owners`.replace(`{contract_address}`, encodeURIComponent(String(t3))).replace(`{chain_name}`, encodeURIComponent(String(n3))), f3 = new URL(u3, o3), m4;
    e3 && (m4 = e3.baseOptions);
    let h4 = { method: `GET`, ...m4, ...l3 }, g4 = {}, _4 = {};
    r3 && (_4.account_address = r3), i3 !== void 0 && (_4.from_updated_at = i3 instanceof Date ? i3.toISOString() : i3), a3 !== void 0 && (_4.page_cursor = a3), c3 !== void 0 && (_4.page_size = c3), d2(f3, _4);
    let v4 = m4 && m4.headers ? m4.headers : {};
    return h4.headers = { ...g4, ...v4, ...l3.headers }, { url: p3(f3), options: h4 };
  } };
};
var M3 = function(t3) {
  let n3 = pe2(t3);
  return { async listAllNFTOwners(i3, a3, o4, s3, c3) {
    return m3(await n3.listAllNFTOwners(i3, a3, o4, s3, c3), axios_default, r2, t3);
  }, async listNFTOwners(i3, a3, o4, s3, c3, l3) {
    return m3(await n3.listNFTOwners(i3, a3, o4, s3, c3, l3), axios_default, r2, t3);
  }, async listOwnersByContractAddress(i3, a3, o4, s3, c3, l3, u3) {
    return m3(await n3.listOwnersByContractAddress(i3, a3, o4, s3, c3, l3, u3), axios_default, r2, t3);
  } };
};
var me2 = function(e3, t3, n3) {
  let r3 = M3(e3);
  return { listAllNFTOwners(e4, i3) {
    return r3.listAllNFTOwners(e4.chainName, e4.fromUpdatedAt, e4.pageCursor, e4.pageSize, i3).then((e5) => e5(n3, t3));
  }, listNFTOwners(e4, i3) {
    return r3.listNFTOwners(e4.contractAddress, e4.tokenId, e4.chainName, e4.pageCursor, e4.pageSize, i3).then((e5) => e5(n3, t3));
  }, listOwnersByContractAddress(e4, i3) {
    return r3.listOwnersByContractAddress(e4.contractAddress, e4.chainName, e4.accountAddress, e4.fromUpdatedAt, e4.pageCursor, e4.pageSize, i3).then((e5) => e5(n3, t3));
  } };
};
var he2 = class extends i2 {
  listAllNFTOwners(e3, t3) {
    return M3(this.configuration).listAllNFTOwners(e3.chainName, e3.fromUpdatedAt, e3.pageCursor, e3.pageSize, t3).then((e4) => e4(this.axios, this.basePath));
  }
  listNFTOwners(e3, t3) {
    return M3(this.configuration).listNFTOwners(e3.contractAddress, e3.tokenId, e3.chainName, e3.pageCursor, e3.pageSize, t3).then((e4) => e4(this.axios, this.basePath));
  }
  listOwnersByContractAddress(e3, t3) {
    return M3(this.configuration).listOwnersByContractAddress(e3.contractAddress, e3.chainName, e3.accountAddress, e3.fromUpdatedAt, e3.pageCursor, e3.pageSize, t3).then((e4) => e4(this.axios, this.basePath));
  }
};
var ge2 = function(e3) {
  return { createMintRequest: async (t3, n3, r3, i3 = {}) => {
    s2(`createMintRequest`, `contractAddress`, t3), s2(`createMintRequest`, `chainName`, n3), s2(`createMintRequest`, `createMintRequestRequest`, r3);
    let a3 = `/v1/chains/{chain_name}/collections/{contract_address}/nfts/mint-requests`.replace(`{contract_address}`, encodeURIComponent(String(t3))).replace(`{chain_name}`, encodeURIComponent(String(n3))), l3 = new URL(a3, o3), u3;
    e3 && (u3 = e3.baseOptions);
    let m4 = { method: `POST`, ...u3, ...i3 }, h4 = {};
    await c2(h4, `x-immutable-api-key`, e3), h4[`Content-Type`] = `application/json`, d2(l3, {});
    let g4 = u3 && u3.headers ? u3.headers : {};
    return m4.headers = { ...h4, ...g4, ...i3.headers }, m4.data = f2(r3, m4, e3), { url: p3(l3), options: m4 };
  }, getMintRequest: async (t3, n3, r3, i3 = {}) => {
    s2(`getMintRequest`, `contractAddress`, t3), s2(`getMintRequest`, `chainName`, n3), s2(`getMintRequest`, `referenceId`, r3);
    let a3 = `/v1/chains/{chain_name}/collections/{contract_address}/nfts/mint-requests/{reference_id}`.replace(`{contract_address}`, encodeURIComponent(String(t3))).replace(`{chain_name}`, encodeURIComponent(String(n3))).replace(`{reference_id}`, encodeURIComponent(String(r3))), l3 = new URL(a3, o3), u3;
    e3 && (u3 = e3.baseOptions);
    let f3 = { method: `GET`, ...u3, ...i3 }, m4 = {};
    await c2(m4, `x-immutable-api-key`, e3), d2(l3, {});
    let h4 = u3 && u3.headers ? u3.headers : {};
    return f3.headers = { ...m4, ...h4, ...i3.headers }, { url: p3(l3), options: f3 };
  }, getNFT: async (t3, n3, r3, i3 = {}) => {
    s2(`getNFT`, `contractAddress`, t3), s2(`getNFT`, `tokenId`, n3), s2(`getNFT`, `chainName`, r3);
    let a3 = `/v1/chains/{chain_name}/collections/{contract_address}/nfts/{token_id}`.replace(`{contract_address}`, encodeURIComponent(String(t3))).replace(`{token_id}`, encodeURIComponent(String(n3))).replace(`{chain_name}`, encodeURIComponent(String(r3))), c3 = new URL(a3, o3), l3;
    e3 && (l3 = e3.baseOptions);
    let u3 = { method: `GET`, ...l3, ...i3 }, f3 = {};
    d2(c3, {});
    let m4 = l3 && l3.headers ? l3.headers : {};
    return u3.headers = { ...f3, ...m4, ...i3.headers }, { url: p3(c3), options: u3 };
  }, listAllNFTs: async (t3, n3, r3, i3, a3 = {}) => {
    s2(`listAllNFTs`, `chainName`, t3);
    let c3 = `/v1/chains/{chain_name}/nfts`.replace(`{chain_name}`, encodeURIComponent(String(t3))), l3 = new URL(c3, o3), u3;
    e3 && (u3 = e3.baseOptions);
    let f3 = { method: `GET`, ...u3, ...a3 }, m4 = {}, h4 = {};
    n3 !== void 0 && (h4.from_updated_at = n3 instanceof Date ? n3.toISOString() : n3), r3 !== void 0 && (h4.page_cursor = r3), i3 !== void 0 && (h4.page_size = i3), d2(l3, h4);
    let g4 = u3 && u3.headers ? u3.headers : {};
    return f3.headers = { ...m4, ...g4, ...a3.headers }, { url: p3(l3), options: f3 };
  }, listMintRequests: async (t3, n3, r3, i3, a3, l3 = {}) => {
    s2(`listMintRequests`, `contractAddress`, t3), s2(`listMintRequests`, `chainName`, n3);
    let u3 = `/v1/chains/{chain_name}/collections/{contract_address}/nfts/mint-requests`.replace(`{contract_address}`, encodeURIComponent(String(t3))).replace(`{chain_name}`, encodeURIComponent(String(n3))), f3 = new URL(u3, o3), m4;
    e3 && (m4 = e3.baseOptions);
    let h4 = { method: `GET`, ...m4, ...l3 }, g4 = {}, _4 = {};
    await c2(g4, `x-immutable-api-key`, e3), r3 !== void 0 && (_4.page_cursor = r3), i3 !== void 0 && (_4.page_size = i3), a3 !== void 0 && (_4.status = a3), d2(f3, _4);
    let v4 = m4 && m4.headers ? m4.headers : {};
    return h4.headers = { ...g4, ...v4, ...l3.headers }, { url: p3(f3), options: h4 };
  }, listNFTs: async (t3, n3, r3, i3, a3, c3, l3 = {}) => {
    s2(`listNFTs`, `contractAddress`, t3), s2(`listNFTs`, `chainName`, n3);
    let u3 = `/v1/chains/{chain_name}/collections/{contract_address}/nfts`.replace(`{contract_address}`, encodeURIComponent(String(t3))).replace(`{chain_name}`, encodeURIComponent(String(n3))), f3 = new URL(u3, o3), m4;
    e3 && (m4 = e3.baseOptions);
    let h4 = { method: `GET`, ...m4, ...l3 }, g4 = {}, _4 = {};
    r3 && (_4.token_id = r3), i3 !== void 0 && (_4.from_updated_at = i3 instanceof Date ? i3.toISOString() : i3), a3 !== void 0 && (_4.page_cursor = a3), c3 !== void 0 && (_4.page_size = c3), d2(f3, _4);
    let v4 = m4 && m4.headers ? m4.headers : {};
    return h4.headers = { ...g4, ...v4, ...l3.headers }, { url: p3(f3), options: h4 };
  }, listNFTsByAccountAddress: async (t3, n3, r3, i3, a3, c3, l3, u3 = {}) => {
    s2(`listNFTsByAccountAddress`, `accountAddress`, t3), s2(`listNFTsByAccountAddress`, `chainName`, n3);
    let f3 = `/v1/chains/{chain_name}/accounts/{account_address}/nfts`.replace(`{account_address}`, encodeURIComponent(String(t3))).replace(`{chain_name}`, encodeURIComponent(String(n3))), m4 = new URL(f3, o3), h4;
    e3 && (h4 = e3.baseOptions);
    let g4 = { method: `GET`, ...h4, ...u3 }, _4 = {}, v4 = {};
    r3 !== void 0 && (v4.contract_address = r3), i3 && (v4.token_id = i3), a3 !== void 0 && (v4.from_updated_at = a3 instanceof Date ? a3.toISOString() : a3), c3 !== void 0 && (v4.page_cursor = c3), l3 !== void 0 && (v4.page_size = l3), d2(m4, v4);
    let y4 = h4 && h4.headers ? h4.headers : {};
    return g4.headers = { ..._4, ...y4, ...u3.headers }, { url: p3(m4), options: g4 };
  } };
};
var N3 = function(t3) {
  let n3 = ge2(t3);
  return { async createMintRequest(i3, a3, o4, s3) {
    return m3(await n3.createMintRequest(i3, a3, o4, s3), axios_default, r2, t3);
  }, async getMintRequest(i3, a3, o4, s3) {
    return m3(await n3.getMintRequest(i3, a3, o4, s3), axios_default, r2, t3);
  }, async getNFT(i3, a3, o4, s3) {
    return m3(await n3.getNFT(i3, a3, o4, s3), axios_default, r2, t3);
  }, async listAllNFTs(i3, a3, o4, s3, c3) {
    return m3(await n3.listAllNFTs(i3, a3, o4, s3, c3), axios_default, r2, t3);
  }, async listMintRequests(i3, a3, o4, s3, c3, l3) {
    return m3(await n3.listMintRequests(i3, a3, o4, s3, c3, l3), axios_default, r2, t3);
  }, async listNFTs(i3, a3, o4, s3, c3, l3, u3) {
    return m3(await n3.listNFTs(i3, a3, o4, s3, c3, l3, u3), axios_default, r2, t3);
  }, async listNFTsByAccountAddress(i3, a3, o4, s3, c3, l3, u3, d3) {
    return m3(await n3.listNFTsByAccountAddress(i3, a3, o4, s3, c3, l3, u3, d3), axios_default, r2, t3);
  } };
};
var _e2 = function(e3, t3, n3) {
  let r3 = N3(e3);
  return { createMintRequest(e4, i3) {
    return r3.createMintRequest(e4.contractAddress, e4.chainName, e4.createMintRequestRequest, i3).then((e5) => e5(n3, t3));
  }, getMintRequest(e4, i3) {
    return r3.getMintRequest(e4.contractAddress, e4.chainName, e4.referenceId, i3).then((e5) => e5(n3, t3));
  }, getNFT(e4, i3) {
    return r3.getNFT(e4.contractAddress, e4.tokenId, e4.chainName, i3).then((e5) => e5(n3, t3));
  }, listAllNFTs(e4, i3) {
    return r3.listAllNFTs(e4.chainName, e4.fromUpdatedAt, e4.pageCursor, e4.pageSize, i3).then((e5) => e5(n3, t3));
  }, listMintRequests(e4, i3) {
    return r3.listMintRequests(e4.contractAddress, e4.chainName, e4.pageCursor, e4.pageSize, e4.status, i3).then((e5) => e5(n3, t3));
  }, listNFTs(e4, i3) {
    return r3.listNFTs(e4.contractAddress, e4.chainName, e4.tokenId, e4.fromUpdatedAt, e4.pageCursor, e4.pageSize, i3).then((e5) => e5(n3, t3));
  }, listNFTsByAccountAddress(e4, i3) {
    return r3.listNFTsByAccountAddress(e4.accountAddress, e4.chainName, e4.contractAddress, e4.tokenId, e4.fromUpdatedAt, e4.pageCursor, e4.pageSize, i3).then((e5) => e5(n3, t3));
  } };
};
var P3 = class extends i2 {
  createMintRequest(e3, t3) {
    return N3(this.configuration).createMintRequest(e3.contractAddress, e3.chainName, e3.createMintRequestRequest, t3).then((e4) => e4(this.axios, this.basePath));
  }
  getMintRequest(e3, t3) {
    return N3(this.configuration).getMintRequest(e3.contractAddress, e3.chainName, e3.referenceId, t3).then((e4) => e4(this.axios, this.basePath));
  }
  getNFT(e3, t3) {
    return N3(this.configuration).getNFT(e3.contractAddress, e3.tokenId, e3.chainName, t3).then((e4) => e4(this.axios, this.basePath));
  }
  listAllNFTs(e3, t3) {
    return N3(this.configuration).listAllNFTs(e3.chainName, e3.fromUpdatedAt, e3.pageCursor, e3.pageSize, t3).then((e4) => e4(this.axios, this.basePath));
  }
  listMintRequests(e3, t3) {
    return N3(this.configuration).listMintRequests(e3.contractAddress, e3.chainName, e3.pageCursor, e3.pageSize, e3.status, t3).then((e4) => e4(this.axios, this.basePath));
  }
  listNFTs(e3, t3) {
    return N3(this.configuration).listNFTs(e3.contractAddress, e3.chainName, e3.tokenId, e3.fromUpdatedAt, e3.pageCursor, e3.pageSize, t3).then((e4) => e4(this.axios, this.basePath));
  }
  listNFTsByAccountAddress(e3, t3) {
    return N3(this.configuration).listNFTsByAccountAddress(e3.accountAddress, e3.chainName, e3.contractAddress, e3.tokenId, e3.fromUpdatedAt, e3.pageCursor, e3.pageSize, t3).then((e4) => e4(this.axios, this.basePath));
  }
};
var F3 = function(e3) {
  return { cancelOrders: async (t3, n3, r3 = {}) => {
    s2(`cancelOrders`, `chainName`, t3), s2(`cancelOrders`, `cancelOrdersRequestBody`, n3);
    let i3 = `/v1/chains/{chain_name}/orders/cancel`.replace(`{chain_name}`, encodeURIComponent(String(t3))), a3 = new URL(i3, o3), c3;
    e3 && (c3 = e3.baseOptions);
    let l3 = { method: `POST`, ...c3, ...r3 }, u3 = {};
    u3[`Content-Type`] = `application/json`, d2(a3, {});
    let m4 = c3 && c3.headers ? c3.headers : {};
    return l3.headers = { ...u3, ...m4, ...r3.headers }, l3.data = f2(n3, l3, e3), { url: p3(a3), options: l3 };
  }, createBid: async (t3, n3, r3 = {}) => {
    s2(`createBid`, `chainName`, t3), s2(`createBid`, `createBidRequestBody`, n3);
    let i3 = `/v1/chains/{chain_name}/orders/bids`.replace(`{chain_name}`, encodeURIComponent(String(t3))), a3 = new URL(i3, o3), c3;
    e3 && (c3 = e3.baseOptions);
    let l3 = { method: `POST`, ...c3, ...r3 }, u3 = {};
    u3[`Content-Type`] = `application/json`, d2(a3, {});
    let m4 = c3 && c3.headers ? c3.headers : {};
    return l3.headers = { ...u3, ...m4, ...r3.headers }, l3.data = f2(n3, l3, e3), { url: p3(a3), options: l3 };
  }, createCollectionBid: async (t3, n3, r3 = {}) => {
    s2(`createCollectionBid`, `chainName`, t3), s2(`createCollectionBid`, `createCollectionBidRequestBody`, n3);
    let i3 = `/v1/chains/{chain_name}/orders/collection-bids`.replace(`{chain_name}`, encodeURIComponent(String(t3))), a3 = new URL(i3, o3), c3;
    e3 && (c3 = e3.baseOptions);
    let l3 = { method: `POST`, ...c3, ...r3 }, u3 = {};
    u3[`Content-Type`] = `application/json`, d2(a3, {});
    let m4 = c3 && c3.headers ? c3.headers : {};
    return l3.headers = { ...u3, ...m4, ...r3.headers }, l3.data = f2(n3, l3, e3), { url: p3(a3), options: l3 };
  }, createListing: async (t3, n3, r3 = {}) => {
    s2(`createListing`, `chainName`, t3), s2(`createListing`, `createListingRequestBody`, n3);
    let i3 = `/v1/chains/{chain_name}/orders/listings`.replace(`{chain_name}`, encodeURIComponent(String(t3))), a3 = new URL(i3, o3), c3;
    e3 && (c3 = e3.baseOptions);
    let l3 = { method: `POST`, ...c3, ...r3 }, u3 = {};
    u3[`Content-Type`] = `application/json`, d2(a3, {});
    let m4 = c3 && c3.headers ? c3.headers : {};
    return l3.headers = { ...u3, ...m4, ...r3.headers }, l3.data = f2(n3, l3, e3), { url: p3(a3), options: l3 };
  }, fulfillmentData: async (t3, n3, r3 = {}) => {
    s2(`fulfillmentData`, `chainName`, t3), s2(`fulfillmentData`, `fulfillmentDataRequest`, n3);
    let i3 = `/v1/chains/{chain_name}/orders/fulfillment-data`.replace(`{chain_name}`, encodeURIComponent(String(t3))), a3 = new URL(i3, o3), c3;
    e3 && (c3 = e3.baseOptions);
    let l3 = { method: `POST`, ...c3, ...r3 }, u3 = {};
    u3[`Content-Type`] = `application/json`, d2(a3, {});
    let m4 = c3 && c3.headers ? c3.headers : {};
    return l3.headers = { ...u3, ...m4, ...r3.headers }, l3.data = f2(n3, l3, e3), { url: p3(a3), options: l3 };
  }, getBid: async (t3, n3, r3 = {}) => {
    s2(`getBid`, `chainName`, t3), s2(`getBid`, `bidId`, n3);
    let i3 = `/v1/chains/{chain_name}/orders/bids/{bid_id}`.replace(`{chain_name}`, encodeURIComponent(String(t3))).replace(`{bid_id}`, encodeURIComponent(String(n3))), a3 = new URL(i3, o3), c3;
    e3 && (c3 = e3.baseOptions);
    let l3 = { method: `GET`, ...c3, ...r3 }, u3 = {};
    d2(a3, {});
    let f3 = c3 && c3.headers ? c3.headers : {};
    return l3.headers = { ...u3, ...f3, ...r3.headers }, { url: p3(a3), options: l3 };
  }, getCollectionBid: async (t3, n3, r3 = {}) => {
    s2(`getCollectionBid`, `chainName`, t3), s2(`getCollectionBid`, `collectionBidId`, n3);
    let i3 = `/v1/chains/{chain_name}/orders/collection-bids/{collection_bid_id}`.replace(`{chain_name}`, encodeURIComponent(String(t3))).replace(`{collection_bid_id}`, encodeURIComponent(String(n3))), a3 = new URL(i3, o3), c3;
    e3 && (c3 = e3.baseOptions);
    let l3 = { method: `GET`, ...c3, ...r3 }, u3 = {};
    d2(a3, {});
    let f3 = c3 && c3.headers ? c3.headers : {};
    return l3.headers = { ...u3, ...f3, ...r3.headers }, { url: p3(a3), options: l3 };
  }, getListing: async (t3, n3, r3 = {}) => {
    s2(`getListing`, `chainName`, t3), s2(`getListing`, `listingId`, n3);
    let i3 = `/v1/chains/{chain_name}/orders/listings/{listing_id}`.replace(`{chain_name}`, encodeURIComponent(String(t3))).replace(`{listing_id}`, encodeURIComponent(String(n3))), a3 = new URL(i3, o3), c3;
    e3 && (c3 = e3.baseOptions);
    let l3 = { method: `GET`, ...c3, ...r3 }, u3 = {};
    d2(a3, {});
    let f3 = c3 && c3.headers ? c3.headers : {};
    return l3.headers = { ...u3, ...f3, ...r3.headers }, { url: p3(a3), options: l3 };
  }, getTrade: async (t3, n3, r3 = {}) => {
    s2(`getTrade`, `chainName`, t3), s2(`getTrade`, `tradeId`, n3);
    let i3 = `/v1/chains/{chain_name}/trades/{trade_id}`.replace(`{chain_name}`, encodeURIComponent(String(t3))).replace(`{trade_id}`, encodeURIComponent(String(n3))), a3 = new URL(i3, o3), c3;
    e3 && (c3 = e3.baseOptions);
    let l3 = { method: `GET`, ...c3, ...r3 }, u3 = {};
    d2(a3, {});
    let f3 = c3 && c3.headers ? c3.headers : {};
    return l3.headers = { ...u3, ...f3, ...r3.headers }, { url: p3(a3), options: l3 };
  }, listBids: async (t3, n3, r3, i3, a3, c3, l3, u3, f3, m4, h4, g4, _4 = {}) => {
    s2(`listBids`, `chainName`, t3);
    let v4 = `/v1/chains/{chain_name}/orders/bids`.replace(`{chain_name}`, encodeURIComponent(String(t3))), y4 = new URL(v4, o3), b4;
    e3 && (b4 = e3.baseOptions);
    let x4 = { method: `GET`, ...b4, ..._4 }, S4 = {}, C4 = {};
    n3 !== void 0 && (C4.status = n3), r3 !== void 0 && (C4.buy_item_contract_address = r3), i3 !== void 0 && (C4.sell_item_contract_address = i3), a3 !== void 0 && (C4.account_address = a3), c3 !== void 0 && (C4.buy_item_metadata_id = c3), l3 !== void 0 && (C4.buy_item_token_id = l3), u3 !== void 0 && (C4.from_updated_at = u3 instanceof Date ? u3.toISOString() : u3), f3 !== void 0 && (C4.page_size = f3), m4 !== void 0 && (C4.sort_by = m4), h4 !== void 0 && (C4.sort_direction = h4), g4 !== void 0 && (C4.page_cursor = g4), d2(y4, C4);
    let w4 = b4 && b4.headers ? b4.headers : {};
    return x4.headers = { ...S4, ...w4, ..._4.headers }, { url: p3(y4), options: x4 };
  }, listCollectionBids: async (t3, n3, r3, i3, a3, c3, l3, u3, f3, m4, h4 = {}) => {
    s2(`listCollectionBids`, `chainName`, t3);
    let g4 = `/v1/chains/{chain_name}/orders/collection-bids`.replace(`{chain_name}`, encodeURIComponent(String(t3))), _4 = new URL(g4, o3), v4;
    e3 && (v4 = e3.baseOptions);
    let y4 = { method: `GET`, ...v4, ...h4 }, b4 = {}, x4 = {};
    n3 !== void 0 && (x4.status = n3), r3 !== void 0 && (x4.buy_item_contract_address = r3), i3 !== void 0 && (x4.sell_item_contract_address = i3), a3 !== void 0 && (x4.account_address = a3), c3 !== void 0 && (x4.from_updated_at = c3 instanceof Date ? c3.toISOString() : c3), l3 !== void 0 && (x4.page_size = l3), u3 !== void 0 && (x4.sort_by = u3), f3 !== void 0 && (x4.sort_direction = f3), m4 !== void 0 && (x4.page_cursor = m4), d2(_4, x4);
    let S4 = v4 && v4.headers ? v4.headers : {};
    return y4.headers = { ...b4, ...S4, ...h4.headers }, { url: p3(_4), options: y4 };
  }, listListings: async (t3, n3, r3, i3, a3, c3, l3, u3, f3, m4, h4, g4, _4, v4 = {}) => {
    s2(`listListings`, `chainName`, t3);
    let y4 = `/v1/chains/{chain_name}/orders/listings`.replace(`{chain_name}`, encodeURIComponent(String(t3))), b4 = new URL(y4, o3), x4;
    e3 && (x4 = e3.baseOptions);
    let S4 = { method: `GET`, ...x4, ...v4 }, C4 = {}, w4 = {};
    n3 !== void 0 && (w4.status = n3), r3 !== void 0 && (w4.sell_item_contract_address = r3), i3 !== void 0 && (w4.buy_item_type = i3), a3 !== void 0 && (w4.buy_item_contract_address = a3), c3 !== void 0 && (w4.account_address = c3), l3 !== void 0 && (w4.sell_item_metadata_id = l3), u3 !== void 0 && (w4.sell_item_token_id = u3), f3 !== void 0 && (w4.from_updated_at = f3 instanceof Date ? f3.toISOString() : f3), m4 !== void 0 && (w4.page_size = m4), h4 !== void 0 && (w4.sort_by = h4), g4 !== void 0 && (w4.sort_direction = g4), _4 !== void 0 && (w4.page_cursor = _4), d2(b4, w4);
    let ee4 = x4 && x4.headers ? x4.headers : {};
    return S4.headers = { ...C4, ...ee4, ...v4.headers }, { url: p3(b4), options: S4 };
  }, listTrades: async (t3, n3, r3, i3, a3, c3, l3, u3, f3 = {}) => {
    s2(`listTrades`, `chainName`, t3);
    let m4 = `/v1/chains/{chain_name}/trades`.replace(`{chain_name}`, encodeURIComponent(String(t3))), h4 = new URL(m4, o3), g4;
    e3 && (g4 = e3.baseOptions);
    let _4 = { method: `GET`, ...g4, ...f3 }, v4 = {}, y4 = {};
    n3 !== void 0 && (y4.account_address = n3), r3 !== void 0 && (y4.sell_item_contract_address = r3), i3 !== void 0 && (y4.from_indexed_at = i3 instanceof Date ? i3.toISOString() : i3), a3 !== void 0 && (y4.page_size = a3), c3 !== void 0 && (y4.sort_by = c3), l3 !== void 0 && (y4.sort_direction = l3), u3 !== void 0 && (y4.page_cursor = u3), d2(h4, y4);
    let b4 = g4 && g4.headers ? g4.headers : {};
    return _4.headers = { ...v4, ...b4, ...f3.headers }, { url: p3(h4), options: _4 };
  } };
};
var I3 = function(t3) {
  let n3 = F3(t3);
  return { async cancelOrders(i3, a3, o4) {
    return m3(await n3.cancelOrders(i3, a3, o4), axios_default, r2, t3);
  }, async createBid(i3, a3, o4) {
    return m3(await n3.createBid(i3, a3, o4), axios_default, r2, t3);
  }, async createCollectionBid(i3, a3, o4) {
    return m3(await n3.createCollectionBid(i3, a3, o4), axios_default, r2, t3);
  }, async createListing(i3, a3, o4) {
    return m3(await n3.createListing(i3, a3, o4), axios_default, r2, t3);
  }, async fulfillmentData(i3, a3, o4) {
    return m3(await n3.fulfillmentData(i3, a3, o4), axios_default, r2, t3);
  }, async getBid(i3, a3, o4) {
    return m3(await n3.getBid(i3, a3, o4), axios_default, r2, t3);
  }, async getCollectionBid(i3, a3, o4) {
    return m3(await n3.getCollectionBid(i3, a3, o4), axios_default, r2, t3);
  }, async getListing(i3, a3, o4) {
    return m3(await n3.getListing(i3, a3, o4), axios_default, r2, t3);
  }, async getTrade(i3, a3, o4) {
    return m3(await n3.getTrade(i3, a3, o4), axios_default, r2, t3);
  }, async listBids(i3, a3, o4, s3, c3, l3, u3, d3, f3, p4, h4, g4, _4) {
    return m3(await n3.listBids(i3, a3, o4, s3, c3, l3, u3, d3, f3, p4, h4, g4, _4), axios_default, r2, t3);
  }, async listCollectionBids(i3, a3, o4, s3, c3, l3, u3, d3, f3, p4, h4) {
    return m3(await n3.listCollectionBids(i3, a3, o4, s3, c3, l3, u3, d3, f3, p4, h4), axios_default, r2, t3);
  }, async listListings(i3, a3, o4, s3, c3, l3, u3, d3, f3, p4, h4, g4, _4, v4) {
    return m3(await n3.listListings(i3, a3, o4, s3, c3, l3, u3, d3, f3, p4, h4, g4, _4, v4), axios_default, r2, t3);
  }, async listTrades(i3, a3, o4, s3, c3, l3, u3, d3, f3) {
    return m3(await n3.listTrades(i3, a3, o4, s3, c3, l3, u3, d3, f3), axios_default, r2, t3);
  } };
};
var ve2 = function(e3, t3, n3) {
  let r3 = I3(e3);
  return { cancelOrders(e4, i3) {
    return r3.cancelOrders(e4.chainName, e4.cancelOrdersRequestBody, i3).then((e5) => e5(n3, t3));
  }, createBid(e4, i3) {
    return r3.createBid(e4.chainName, e4.createBidRequestBody, i3).then((e5) => e5(n3, t3));
  }, createCollectionBid(e4, i3) {
    return r3.createCollectionBid(e4.chainName, e4.createCollectionBidRequestBody, i3).then((e5) => e5(n3, t3));
  }, createListing(e4, i3) {
    return r3.createListing(e4.chainName, e4.createListingRequestBody, i3).then((e5) => e5(n3, t3));
  }, fulfillmentData(e4, i3) {
    return r3.fulfillmentData(e4.chainName, e4.fulfillmentDataRequest, i3).then((e5) => e5(n3, t3));
  }, getBid(e4, i3) {
    return r3.getBid(e4.chainName, e4.bidId, i3).then((e5) => e5(n3, t3));
  }, getCollectionBid(e4, i3) {
    return r3.getCollectionBid(e4.chainName, e4.collectionBidId, i3).then((e5) => e5(n3, t3));
  }, getListing(e4, i3) {
    return r3.getListing(e4.chainName, e4.listingId, i3).then((e5) => e5(n3, t3));
  }, getTrade(e4, i3) {
    return r3.getTrade(e4.chainName, e4.tradeId, i3).then((e5) => e5(n3, t3));
  }, listBids(e4, i3) {
    return r3.listBids(e4.chainName, e4.status, e4.buyItemContractAddress, e4.sellItemContractAddress, e4.accountAddress, e4.buyItemMetadataId, e4.buyItemTokenId, e4.fromUpdatedAt, e4.pageSize, e4.sortBy, e4.sortDirection, e4.pageCursor, i3).then((e5) => e5(n3, t3));
  }, listCollectionBids(e4, i3) {
    return r3.listCollectionBids(e4.chainName, e4.status, e4.buyItemContractAddress, e4.sellItemContractAddress, e4.accountAddress, e4.fromUpdatedAt, e4.pageSize, e4.sortBy, e4.sortDirection, e4.pageCursor, i3).then((e5) => e5(n3, t3));
  }, listListings(e4, i3) {
    return r3.listListings(e4.chainName, e4.status, e4.sellItemContractAddress, e4.buyItemType, e4.buyItemContractAddress, e4.accountAddress, e4.sellItemMetadataId, e4.sellItemTokenId, e4.fromUpdatedAt, e4.pageSize, e4.sortBy, e4.sortDirection, e4.pageCursor, i3).then((e5) => e5(n3, t3));
  }, listTrades(e4, i3) {
    return r3.listTrades(e4.chainName, e4.accountAddress, e4.sellItemContractAddress, e4.fromIndexedAt, e4.pageSize, e4.sortBy, e4.sortDirection, e4.pageCursor, i3).then((e5) => e5(n3, t3));
  } };
};
var L3 = class extends i2 {
  cancelOrders(e3, t3) {
    return I3(this.configuration).cancelOrders(e3.chainName, e3.cancelOrdersRequestBody, t3).then((e4) => e4(this.axios, this.basePath));
  }
  createBid(e3, t3) {
    return I3(this.configuration).createBid(e3.chainName, e3.createBidRequestBody, t3).then((e4) => e4(this.axios, this.basePath));
  }
  createCollectionBid(e3, t3) {
    return I3(this.configuration).createCollectionBid(e3.chainName, e3.createCollectionBidRequestBody, t3).then((e4) => e4(this.axios, this.basePath));
  }
  createListing(e3, t3) {
    return I3(this.configuration).createListing(e3.chainName, e3.createListingRequestBody, t3).then((e4) => e4(this.axios, this.basePath));
  }
  fulfillmentData(e3, t3) {
    return I3(this.configuration).fulfillmentData(e3.chainName, e3.fulfillmentDataRequest, t3).then((e4) => e4(this.axios, this.basePath));
  }
  getBid(e3, t3) {
    return I3(this.configuration).getBid(e3.chainName, e3.bidId, t3).then((e4) => e4(this.axios, this.basePath));
  }
  getCollectionBid(e3, t3) {
    return I3(this.configuration).getCollectionBid(e3.chainName, e3.collectionBidId, t3).then((e4) => e4(this.axios, this.basePath));
  }
  getListing(e3, t3) {
    return I3(this.configuration).getListing(e3.chainName, e3.listingId, t3).then((e4) => e4(this.axios, this.basePath));
  }
  getTrade(e3, t3) {
    return I3(this.configuration).getTrade(e3.chainName, e3.tradeId, t3).then((e4) => e4(this.axios, this.basePath));
  }
  listBids(e3, t3) {
    return I3(this.configuration).listBids(e3.chainName, e3.status, e3.buyItemContractAddress, e3.sellItemContractAddress, e3.accountAddress, e3.buyItemMetadataId, e3.buyItemTokenId, e3.fromUpdatedAt, e3.pageSize, e3.sortBy, e3.sortDirection, e3.pageCursor, t3).then((e4) => e4(this.axios, this.basePath));
  }
  listCollectionBids(e3, t3) {
    return I3(this.configuration).listCollectionBids(e3.chainName, e3.status, e3.buyItemContractAddress, e3.sellItemContractAddress, e3.accountAddress, e3.fromUpdatedAt, e3.pageSize, e3.sortBy, e3.sortDirection, e3.pageCursor, t3).then((e4) => e4(this.axios, this.basePath));
  }
  listListings(e3, t3) {
    return I3(this.configuration).listListings(e3.chainName, e3.status, e3.sellItemContractAddress, e3.buyItemType, e3.buyItemContractAddress, e3.accountAddress, e3.sellItemMetadataId, e3.sellItemTokenId, e3.fromUpdatedAt, e3.pageSize, e3.sortBy, e3.sortDirection, e3.pageCursor, t3).then((e4) => e4(this.axios, this.basePath));
  }
  listTrades(e3, t3) {
    return I3(this.configuration).listTrades(e3.chainName, e3.accountAddress, e3.sellItemContractAddress, e3.fromIndexedAt, e3.pageSize, e3.sortBy, e3.sortDirection, e3.pageCursor, t3).then((e4) => e4(this.axios, this.basePath));
  }
};
var ye2 = { CreatedAt: `created_at`, UpdatedAt: `updated_at`, SellItemAmount: `sell_item_amount` };
var be2 = { Asc: `asc`, Desc: `desc` };
var xe2 = { CreatedAt: `created_at`, UpdatedAt: `updated_at`, SellItemAmount: `sell_item_amount` };
var Se2 = { Asc: `asc`, Desc: `desc` };
var Ce2 = { Native: `NATIVE`, Erc20: `ERC20` };
var we2 = { CreatedAt: `created_at`, UpdatedAt: `updated_at`, BuyItemAmount: `buy_item_amount` };
var Te2 = { Asc: `asc`, Desc: `desc` };
var Ee2 = { IndexedAt: `indexed_at` };
var De = { Asc: `asc`, Desc: `desc` };
var R3 = function(e3) {
  return { createCounterfactualAddressV2: async (t3, n3, r3 = {}) => {
    s2(`createCounterfactualAddressV2`, `chainName`, t3), s2(`createCounterfactualAddressV2`, `createCounterfactualAddressRequest`, n3);
    let i3 = `/v2/chains/{chain_name}/passport/counterfactual-address`.replace(`{chain_name}`, encodeURIComponent(String(t3))), a3 = new URL(i3, o3), c3;
    e3 && (c3 = e3.baseOptions);
    let u3 = { method: `POST`, ...c3, ...r3 }, m4 = {};
    await l2(m4, e3), m4[`Content-Type`] = `application/json`, d2(a3, {});
    let h4 = c3 && c3.headers ? c3.headers : {};
    return u3.headers = { ...m4, ...h4, ...r3.headers }, u3.data = f2(n3, u3, e3), { url: p3(a3), options: u3 };
  }, getLinkedAddresses: async (t3, n3, r3 = {}) => {
    s2(`getLinkedAddresses`, `userId`, t3), s2(`getLinkedAddresses`, `chainName`, n3);
    let i3 = `/v1/chains/{chain_name}/passport/users/{user_id}/linked-addresses`.replace(`{user_id}`, encodeURIComponent(String(t3))).replace(`{chain_name}`, encodeURIComponent(String(n3))), a3 = new URL(i3, o3), c3;
    e3 && (c3 = e3.baseOptions);
    let u3 = { method: `GET`, ...c3, ...r3 }, f3 = {};
    await l2(f3, e3), d2(a3, {});
    let m4 = c3 && c3.headers ? c3.headers : {};
    return u3.headers = { ...f3, ...m4, ...r3.headers }, { url: p3(a3), options: u3 };
  }, getLinkedAddressesDeprecated: async (t3, n3 = {}) => {
    s2(`getLinkedAddressesDeprecated`, `userId`, t3);
    let r3 = `/passport-mr/v1/users/{userId}/linked-addresses`.replace(`{userId}`, encodeURIComponent(String(t3))), i3 = new URL(r3, o3), a3;
    e3 && (a3 = e3.baseOptions);
    let c3 = { method: `GET`, ...a3, ...n3 }, u3 = {};
    await l2(u3, e3), d2(i3, {});
    let f3 = a3 && a3.headers ? a3.headers : {};
    return c3.headers = { ...u3, ...f3, ...n3.headers }, { url: p3(i3), options: c3 };
  }, getTransactionMetadata: async (t3, n3, r3 = {}) => {
    s2(`getTransactionMetadata`, `chainName`, t3), s2(`getTransactionMetadata`, `getTransactionMetadataRequest`, n3);
    let i3 = `/v1/chains/{chain_name}/passport/transaction-metadata`.replace(`{chain_name}`, encodeURIComponent(String(t3))), a3 = new URL(i3, o3), c3;
    e3 && (c3 = e3.baseOptions);
    let u3 = { method: `POST`, ...c3, ...r3 }, m4 = {};
    await l2(m4, e3), m4[`Content-Type`] = `application/json`, d2(a3, {});
    let h4 = c3 && c3.headers ? c3.headers : {};
    return u3.headers = { ...m4, ...h4, ...r3.headers }, u3.data = f2(n3, u3, e3), { url: p3(a3), options: u3 };
  }, getTypedDataMetadata: async (t3, n3, r3 = {}) => {
    s2(`getTypedDataMetadata`, `chainName`, t3), s2(`getTypedDataMetadata`, `getTypedDataMetadataRequest`, n3);
    let i3 = `/v1/chains/{chain_name}/passport/typeddata-metadata`.replace(`{chain_name}`, encodeURIComponent(String(t3))), a3 = new URL(i3, o3), c3;
    e3 && (c3 = e3.baseOptions);
    let u3 = { method: `POST`, ...c3, ...r3 }, m4 = {};
    await l2(m4, e3), m4[`Content-Type`] = `application/json`, d2(a3, {});
    let h4 = c3 && c3.headers ? c3.headers : {};
    return u3.headers = { ...m4, ...h4, ...r3.headers }, u3.data = f2(n3, u3, e3), { url: p3(a3), options: u3 };
  }, getUserMetadata: async (t3, n3 = {}) => {
    s2(`getUserMetadata`, `userId`, t3);
    let r3 = `/passport-mr/v1/users/{user_id}/metadata`.replace(`{user_id}`, encodeURIComponent(String(t3))), i3 = new URL(r3, o3), a3;
    e3 && (a3 = e3.baseOptions);
    let l3 = { method: `GET`, ...a3, ...n3 }, u3 = {};
    await c2(u3, `x-immutable-api-key`, e3), d2(i3, {});
    let f3 = a3 && a3.headers ? a3.headers : {};
    return l3.headers = { ...u3, ...f3, ...n3.headers }, { url: p3(i3), options: l3 };
  } };
};
var z3 = function(t3) {
  let n3 = R3(t3);
  return { async createCounterfactualAddressV2(i3, a3, o4) {
    return m3(await n3.createCounterfactualAddressV2(i3, a3, o4), axios_default, r2, t3);
  }, async getLinkedAddresses(i3, a3, o4) {
    return m3(await n3.getLinkedAddresses(i3, a3, o4), axios_default, r2, t3);
  }, async getLinkedAddressesDeprecated(i3, a3) {
    return m3(await n3.getLinkedAddressesDeprecated(i3, a3), axios_default, r2, t3);
  }, async getTransactionMetadata(i3, a3, o4) {
    return m3(await n3.getTransactionMetadata(i3, a3, o4), axios_default, r2, t3);
  }, async getTypedDataMetadata(i3, a3, o4) {
    return m3(await n3.getTypedDataMetadata(i3, a3, o4), axios_default, r2, t3);
  }, async getUserMetadata(i3, a3) {
    return m3(await n3.getUserMetadata(i3, a3), axios_default, r2, t3);
  } };
};
var Oe = function(e3, t3, n3) {
  let r3 = z3(e3);
  return { createCounterfactualAddressV2(e4, i3) {
    return r3.createCounterfactualAddressV2(e4.chainName, e4.createCounterfactualAddressRequest, i3).then((e5) => e5(n3, t3));
  }, getLinkedAddresses(e4, i3) {
    return r3.getLinkedAddresses(e4.userId, e4.chainName, i3).then((e5) => e5(n3, t3));
  }, getLinkedAddressesDeprecated(e4, i3) {
    return r3.getLinkedAddressesDeprecated(e4.userId, i3).then((e5) => e5(n3, t3));
  }, getTransactionMetadata(e4, i3) {
    return r3.getTransactionMetadata(e4.chainName, e4.getTransactionMetadataRequest, i3).then((e5) => e5(n3, t3));
  }, getTypedDataMetadata(e4, i3) {
    return r3.getTypedDataMetadata(e4.chainName, e4.getTypedDataMetadataRequest, i3).then((e5) => e5(n3, t3));
  }, getUserMetadata(e4, i3) {
    return r3.getUserMetadata(e4.userId, i3).then((e5) => e5(n3, t3));
  } };
};
var B3 = class extends i2 {
  createCounterfactualAddressV2(e3, t3) {
    return z3(this.configuration).createCounterfactualAddressV2(e3.chainName, e3.createCounterfactualAddressRequest, t3).then((e4) => e4(this.axios, this.basePath));
  }
  getLinkedAddresses(e3, t3) {
    return z3(this.configuration).getLinkedAddresses(e3.userId, e3.chainName, t3).then((e4) => e4(this.axios, this.basePath));
  }
  getLinkedAddressesDeprecated(e3, t3) {
    return z3(this.configuration).getLinkedAddressesDeprecated(e3.userId, t3).then((e4) => e4(this.axios, this.basePath));
  }
  getTransactionMetadata(e3, t3) {
    return z3(this.configuration).getTransactionMetadata(e3.chainName, e3.getTransactionMetadataRequest, t3).then((e4) => e4(this.axios, this.basePath));
  }
  getTypedDataMetadata(e3, t3) {
    return z3(this.configuration).getTypedDataMetadata(e3.chainName, e3.getTypedDataMetadataRequest, t3).then((e4) => e4(this.axios, this.basePath));
  }
  getUserMetadata(e3, t3) {
    return z3(this.configuration).getUserMetadata(e3.userId, t3).then((e4) => e4(this.axios, this.basePath));
  }
};
var V2 = function(e3) {
  return { getUserInfo: async (t3 = {}) => {
    let n3 = new URL(`/passport-profile/v1/user/info`, o3), r3;
    e3 && (r3 = e3.baseOptions);
    let i3 = { method: `GET`, ...r3, ...t3 }, a3 = {};
    await l2(a3, e3), d2(n3, {});
    let s3 = r3 && r3.headers ? r3.headers : {};
    return i3.headers = { ...a3, ...s3, ...t3.headers }, { url: p3(n3), options: i3 };
  }, linkWalletV2: async (t3, n3 = {}) => {
    let r3 = new URL(`/passport-profile/v2/linked-wallets`, o3), i3;
    e3 && (i3 = e3.baseOptions);
    let a3 = { method: `POST`, ...i3, ...n3 }, s3 = {};
    await l2(s3, e3), s3[`Content-Type`] = `application/json`, d2(r3, {});
    let c3 = i3 && i3.headers ? i3.headers : {};
    return a3.headers = { ...s3, ...c3, ...n3.headers }, a3.data = f2(t3, a3, e3), { url: p3(r3), options: a3 };
  } };
};
var H2 = function(t3) {
  let n3 = V2(t3);
  return { async getUserInfo(i3) {
    return m3(await n3.getUserInfo(i3), axios_default, r2, t3);
  }, async linkWalletV2(i3, a3) {
    return m3(await n3.linkWalletV2(i3, a3), axios_default, r2, t3);
  } };
};
var ke = function(e3, t3, n3) {
  let r3 = H2(e3);
  return { getUserInfo(e4) {
    return r3.getUserInfo(e4).then((e5) => e5(n3, t3));
  }, linkWalletV2(e4 = {}, i3) {
    return r3.linkWalletV2(e4.linkWalletV2Request, i3).then((e5) => e5(n3, t3));
  } };
};
var Ae = class extends i2 {
  getUserInfo(e3) {
    return H2(this.configuration).getUserInfo(e3).then((e4) => e4(this.axios, this.basePath));
  }
  linkWalletV2(e3 = {}, t3) {
    return H2(this.configuration).linkWalletV2(e3.linkWalletV2Request, t3).then((e4) => e4(this.axios, this.basePath));
  }
};
var je = function(e3) {
  return { quotesForNFTs: async (t3, n3, r3, i3, a3, c3 = {}) => {
    s2(`quotesForNFTs`, `chainName`, t3), s2(`quotesForNFTs`, `contractAddress`, n3), s2(`quotesForNFTs`, `tokenId`, r3);
    let l3 = `/v1/chains/{chain_name}/quotes/{contract_address}/nfts`.replace(`{chain_name}`, encodeURIComponent(String(t3))).replace(`{contract_address}`, encodeURIComponent(String(n3))), u3 = new URL(l3, o3), f3;
    e3 && (f3 = e3.baseOptions);
    let m4 = { method: `GET`, ...f3, ...c3 }, h4 = {}, g4 = {};
    r3 && (g4.token_id = r3), i3 !== void 0 && (g4.payment_token = i3), a3 !== void 0 && (g4.page_cursor = a3), d2(u3, g4);
    let _4 = f3 && f3.headers ? f3.headers : {};
    return m4.headers = { ...h4, ..._4, ...c3.headers }, { url: p3(u3), options: m4 };
  }, quotesForStacks: async (t3, n3, r3, i3, a3, c3 = {}) => {
    s2(`quotesForStacks`, `chainName`, t3), s2(`quotesForStacks`, `contractAddress`, n3), s2(`quotesForStacks`, `stackId`, r3);
    let l3 = `/v1/chains/{chain_name}/quotes/{contract_address}/stacks`.replace(`{chain_name}`, encodeURIComponent(String(t3))).replace(`{contract_address}`, encodeURIComponent(String(n3))), u3 = new URL(l3, o3), f3;
    e3 && (f3 = e3.baseOptions);
    let m4 = { method: `GET`, ...f3, ...c3 }, h4 = {}, g4 = {};
    r3 && (g4.stack_id = r3), i3 !== void 0 && (g4.payment_token = i3), a3 !== void 0 && (g4.page_cursor = a3), d2(u3, g4);
    let _4 = f3 && f3.headers ? f3.headers : {};
    return m4.headers = { ...h4, ..._4, ...c3.headers }, { url: p3(u3), options: m4 };
  } };
};
var U2 = function(t3) {
  let n3 = je(t3);
  return { async quotesForNFTs(i3, a3, o4, s3, c3, l3) {
    return m3(await n3.quotesForNFTs(i3, a3, o4, s3, c3, l3), axios_default, r2, t3);
  }, async quotesForStacks(i3, a3, o4, s3, c3, l3) {
    return m3(await n3.quotesForStacks(i3, a3, o4, s3, c3, l3), axios_default, r2, t3);
  } };
};
var Me = function(e3, t3, n3) {
  let r3 = U2(e3);
  return { quotesForNFTs(e4, i3) {
    return r3.quotesForNFTs(e4.chainName, e4.contractAddress, e4.tokenId, e4.paymentToken, e4.pageCursor, i3).then((e5) => e5(n3, t3));
  }, quotesForStacks(e4, i3) {
    return r3.quotesForStacks(e4.chainName, e4.contractAddress, e4.stackId, e4.paymentToken, e4.pageCursor, i3).then((e5) => e5(n3, t3));
  } };
};
var Ne = class extends i2 {
  quotesForNFTs(e3, t3) {
    return U2(this.configuration).quotesForNFTs(e3.chainName, e3.contractAddress, e3.tokenId, e3.paymentToken, e3.pageCursor, t3).then((e4) => e4(this.axios, this.basePath));
  }
  quotesForStacks(e3, t3) {
    return U2(this.configuration).quotesForStacks(e3.chainName, e3.contractAddress, e3.stackId, e3.paymentToken, e3.pageCursor, t3).then((e4) => e4(this.axios, this.basePath));
  }
};
var Pe = function(e3) {
  return { getERC20Token: async (t3, n3, r3 = {}) => {
    s2(`getERC20Token`, `contractAddress`, t3), s2(`getERC20Token`, `chainName`, n3);
    let i3 = `/v1/chains/{chain_name}/tokens/{contract_address}`.replace(`{contract_address}`, encodeURIComponent(String(t3))).replace(`{chain_name}`, encodeURIComponent(String(n3))), a3 = new URL(i3, o3), c3;
    e3 && (c3 = e3.baseOptions);
    let l3 = { method: `GET`, ...c3, ...r3 }, u3 = {};
    d2(a3, {});
    let f3 = c3 && c3.headers ? c3.headers : {};
    return l3.headers = { ...u3, ...f3, ...r3.headers }, { url: p3(a3), options: l3 };
  }, listERC20Tokens: async (t3, n3, r3, i3, a3, c3, l3 = {}) => {
    s2(`listERC20Tokens`, `chainName`, t3);
    let u3 = `/v1/chains/{chain_name}/tokens`.replace(`{chain_name}`, encodeURIComponent(String(t3))), f3 = new URL(u3, o3), m4;
    e3 && (m4 = e3.baseOptions);
    let h4 = { method: `GET`, ...m4, ...l3 }, g4 = {}, _4 = {};
    n3 !== void 0 && (_4.from_updated_at = n3 instanceof Date ? n3.toISOString() : n3), r3 && (_4.verification_status = r3), i3 !== void 0 && (_4.is_canonical = i3), a3 !== void 0 && (_4.page_cursor = a3), c3 !== void 0 && (_4.page_size = c3), d2(f3, _4);
    let v4 = m4 && m4.headers ? m4.headers : {};
    return h4.headers = { ...g4, ...v4, ...l3.headers }, { url: p3(f3), options: h4 };
  } };
};
var W2 = function(t3) {
  let n3 = Pe(t3);
  return { async getERC20Token(i3, a3, o4) {
    return m3(await n3.getERC20Token(i3, a3, o4), axios_default, r2, t3);
  }, async listERC20Tokens(i3, a3, o4, s3, c3, l3, u3) {
    return m3(await n3.listERC20Tokens(i3, a3, o4, s3, c3, l3, u3), axios_default, r2, t3);
  } };
};
var Fe = function(e3, t3, n3) {
  let r3 = W2(e3);
  return { getERC20Token(e4, i3) {
    return r3.getERC20Token(e4.contractAddress, e4.chainName, i3).then((e5) => e5(n3, t3));
  }, listERC20Tokens(e4, i3) {
    return r3.listERC20Tokens(e4.chainName, e4.fromUpdatedAt, e4.verificationStatus, e4.isCanonical, e4.pageCursor, e4.pageSize, i3).then((e5) => e5(n3, t3));
  } };
};
var Ie = class extends i2 {
  getERC20Token(e3, t3) {
    return W2(this.configuration).getERC20Token(e3.contractAddress, e3.chainName, t3).then((e4) => e4(this.axios, this.basePath));
  }
  listERC20Tokens(e3, t3) {
    return W2(this.configuration).listERC20Tokens(e3.chainName, e3.fromUpdatedAt, e3.verificationStatus, e3.isCanonical, e3.pageCursor, e3.pageSize, t3).then((e4) => e4(this.axios, this.basePath));
  }
};
var Le = class {
  constructor(e3 = {}) {
    __publicField(this, "apiKey");
    __publicField(this, "username");
    __publicField(this, "password");
    __publicField(this, "accessToken");
    __publicField(this, "basePath");
    __publicField(this, "baseOptions");
    __publicField(this, "formDataCtor");
    this.apiKey = e3.apiKey, this.username = e3.username, this.password = e3.password, this.accessToken = e3.accessToken, this.basePath = e3.basePath, this.baseOptions = e3.baseOptions, this.formDataCtor = e3.formDataCtor;
  }
  isJsonMime(e3) {
    return e3 !== null && (RegExp(`^(application/json|[^;/ 	]+/[^;/ 	]+[+]json)[ 	]*(;.*)?$`, `i`).test(e3) || e3.toLowerCase() === `application/json-patch+json`);
  }
};
var Re = { ValidationError: `VALIDATION_ERROR` };
var ze = { UnauthorisedRequest: `UNAUTHORISED_REQUEST` };
var Be = { AuthenticationError: `AUTHENTICATION_ERROR` };
var Ve = { ResourceNotFound: `RESOURCE_NOT_FOUND` };
var He = { ConflictError: `CONFLICT_ERROR` };
var Ue = { TooManyRequestsError: `TOO_MANY_REQUESTS_ERROR` };
var We = { InternalServerError: `INTERNAL_SERVER_ERROR` };
var Ge = { NotImplementedError: `NOT_IMPLEMENTED_ERROR` };
var Ke = { Active: `ACTIVE` };
var qe = { Mint: `mint`, Burn: `burn`, Transfer: `transfer`, Sale: `sale`, Deposit: `deposit`, Withdrawal: `withdrawal` };
var Je = { Verified: `verified`, Unverified: `unverified`, Spam: `spam`, Inactive: `inactive` };
var Ye = { Cancelled: `CANCELLED` };
var Xe = { OnChain: `ON_CHAIN`, OffChain: `OFF_CHAIN`, Underfunded: `UNDERFUNDED` };
var Ze = { Erc721: `ERC721`, Erc1155: `ERC1155` };
var Qe = { Erc1155Collection: `ERC1155_COLLECTION` };
var $e = { Erc1155: `ERC1155` };
var et = { Erc20Approve: `ERC20_APPROVE` };
var tt = { Erc20: `ERC20` };
var nt = { Erc20TransferFrom: `ERC20_TRANSFER_FROM` };
var rt = { Erc20Transfer: `ERC20_TRANSFER` };
var it = { Erc721Approve: `ERC721_APPROVE` };
var at = { Erc721Collection: `ERC721_COLLECTION`, Erc1155Collection: `ERC1155_COLLECTION` };
var ot = { Erc721: `ERC721` };
var st = { Erc721SafeTransferFromBatch: `ERC721_SAFE_TRANSFER_FROM_BATCH` };
var ct = { Erc721TransferFrom: `ERC721_TRANSFER_FROM` };
var lt = { Expired: `EXPIRED` };
var ut = { Filled: `FILLED` };
var dt = { Royalty: `ROYALTY`, MakerEcosystem: `MAKER_ECOSYSTEM`, TakerEcosystem: `TAKER_ECOSYSTEM`, Protocol: `PROTOCOL` };
var ft = { Filled: `FILLED` };
var pt = { Verified: `verified`, Unverified: `unverified`, Spam: `spam`, Inactive: `inactive` };
var mt = { Inactive: `INACTIVE` };
var ht = { Erc20: `ERC20` };
var gt = { Royalty: `ROYALTY`, MakerEcosystem: `MAKER_ECOSYSTEM`, TakerEcosystem: `TAKER_ECOSYSTEM`, Protocol: `PROTOCOL` };
var _t = { Native: `NATIVE` };
var vt = { Erc721: `ERC721`, Erc1155: `ERC1155` };
var yt = { Otp: `otp`, Web: `web` };
var bt = { Pending: `pending`, Succeeded: `succeeded`, Failed: `failed` };
var xt = { Erc721: `ERC721`, Erc1155: `ERC1155` };
var St = { Number: `number`, BoostPercentage: `boost_percentage`, BoostNumber: `boost_number`, Date: `date` };
var Ct = { Erc721SetApprovalForAll: `ERC721_SET_APPROVAL_FOR_ALL`, Erc1155SetApprovalForAll: `ERC1155_SET_APPROVAL_FOR_ALL` };
var wt = { Native: `NATIVE`, Erc20: `ERC20`, Erc721: `ERC721`, Erc1155: `ERC1155`, Erc721Collection: `ERC721_COLLECTION`, Erc1155Collection: `ERC1155_COLLECTION` };
var Tt = { Requested: `requested`, Approved: `approved`, Rejected: `rejected`, Removed: `removed`, Added: `added` };
var Et = { Listing: `LISTING`, Bid: `BID`, CollectionBid: `COLLECTION_BID` };
var Dt = { Pending: `PENDING`, Active: `ACTIVE`, Inactive: `INACTIVE`, Filled: `FILLED`, Expired: `EXPIRED`, Cancelled: `CANCELLED` };
var Ot = { Common: `common`, Uncommon: `uncommon`, Rare: `rare`, Epic: `epic`, Legendary: `legendary` };
var kt = { Pending: `PENDING` };
var At = { FullRestricted: `FULL_RESTRICTED`, PartialRestricted: `PARTIAL_RESTRICTED` };
var jt = { Royalty: `ROYALTY` };
var Mt = { SeaportCreateListingMetadata: `SEAPORT_CREATE_LISTING_METADATA` };
var Nt = { Erc1155Collection: `ERC1155Collection` };
var Pt = { Erc1155: `ERC1155` };
var Ft = { Erc20: `ERC20` };
var It = { Erc721Collection: `ERC721Collection` };
var Lt = { Erc721: `ERC721` };
var Rt = { Erc20: `ERC20`, Native: `NATIVE` };
var zt = { SeaportFulfillAvailableAdvancedOrders: `SEAPORT_FULFILL_AVAILABLE_ADVANCED_ORDERS` };
var Bt = { Native: `NATIVE` };
var Vt = { Malicious: `malicious`, Benign: `benign`, Warning: `warning`, Unknown: `unknown`, Info: `info` };
var Ht = { Erc20: `ERC20` };
var Ut = { Evm: `evm` };
var Wt = { Otp: `otp`, Web: `web` };
var Gt = { Unknown: `UNKNOWN` };
var Kt = { Unknown: `UNKNOWN` };
var qt = { Success: `success`, Error: `error`, SimulationFailed: `simulation_failed` };
var Jt = { Erc20: `ERC20`, Erc721: `ERC721`, Erc1155: `ERC1155` };
var Yt = { Completed: `completed`, Pending: `pending` };
var Xt = { Evm: `evm` };
var Zt = n2({ APIError400AllOfCodeEnum: () => Re, APIError401AllOfCodeEnum: () => ze, APIError403AllOfCodeEnum: () => Be, APIError404AllOfCodeEnum: () => Ve, APIError409AllOfCodeEnum: () => He, APIError429AllOfCodeEnum: () => Ue, APIError500AllOfCodeEnum: () => We, APIError501AllOfCodeEnum: () => Ge, ActiveOrderStatusNameEnum: () => Ke, ActivitiesApi: () => v3, ActivitiesApiAxiosParamCreator: () => h3, ActivitiesApiFactory: () => _3, ActivitiesApiFp: () => g3, ActivityType: () => qe, AssetVerificationStatus: () => Je, CancelledOrderStatusCancellationTypeEnum: () => Xe, CancelledOrderStatusNameEnum: () => Ye, ChainsApi: () => S3, ChainsApiAxiosParamCreator: () => y3, ChainsApiFactory: () => x3, ChainsApiFp: () => b3, CollectionContractType: () => Ze, CollectionsApi: () => te3, CollectionsApiAxiosParamCreator: () => C3, CollectionsApiFactory: () => ee3, CollectionsApiFp: () => w3, Configuration: () => Le, CraftingApi: () => ie3, CraftingApiAxiosParamCreator: () => ne3, CraftingApiFactory: () => re3, CraftingApiFp: () => T3, ERC1155CollectionItemTypeEnum: () => Qe, ERC1155ItemTypeEnum: () => $e, ERC20ApproveMetadataTransactionTypeEnum: () => et, ERC20ItemTypeEnum: () => tt, ERC20TransferFromMetadataTransactionTypeEnum: () => nt, ERC20TransferMetadataTransactionTypeEnum: () => rt, ERC721ApproveMetadataTransactionTypeEnum: () => it, ERC721CollectionItemTypeEnum: () => at, ERC721ItemTypeEnum: () => ot, ERC721SafeTransferFromBatchMetadataTransactionTypeEnum: () => st, ERC721TransferFromMetadataTransactionTypeEnum: () => ct, ExpiredOrderStatusNameEnum: () => lt, FailedOrderCancellationReasonCodeEnum: () => ut, FeeTypeEnum: () => dt, FilledOrderStatusNameEnum: () => ft, GetTransactionByIDChainTypeEnum: () => se2, GuardianApi: () => D3, GuardianApiAxiosParamCreator: () => ae2, GuardianApiFactory: () => oe2, GuardianApiFp: () => E3, ImmutableVerificationStatusEnum: () => pt, InactiveOrderStatusNameEnum: () => mt, ListBidsSortByEnum: () => ye2, ListBidsSortDirectionEnum: () => be2, ListCollectionBidsSortByEnum: () => xe2, ListCollectionBidsSortDirectionEnum: () => Se2, ListListingsBuyItemTypeEnum: () => Ce2, ListListingsSortByEnum: () => we2, ListListingsSortDirectionEnum: () => Te2, ListTradesSortByEnum: () => Ee2, ListTradesSortDirectionEnum: () => De, MarketPriceERC20TokenTypeEnum: () => ht, MarketPriceFeesTypeEnum: () => gt, MarketPriceNativeTokenTypeEnum: () => _t, MarketplaceContractType: () => vt, MessageEvaluationResponseConfirmationMethodEnum: () => yt, MetadataApi: () => le2, MetadataApiAxiosParamCreator: () => O3, MetadataApiFactory: () => ce2, MetadataApiFp: () => k3, MetadataSearchApi: () => de2, MetadataSearchApiAxiosParamCreator: () => A3, MetadataSearchApiFactory: () => ue2, MetadataSearchApiFp: () => j3, MintRequestStatus: () => bt, NFTContractType: () => xt, NFTMetadataAttributeDisplayTypeEnum: () => St, NFTSetApprovalForAllMetadataTransactionTypeEnum: () => Ct, NativeItemTypeEnum: () => wt, NftOwnersApi: () => he2, NftOwnersApiAxiosParamCreator: () => pe2, NftOwnersApiFactory: () => me2, NftOwnersApiFp: () => M3, NftsApi: () => P3, NftsApiAxiosParamCreator: () => ge2, NftsApiFactory: () => _e2, NftsApiFp: () => N3, OperatorAllowlistStatus: () => Tt, OrderStatusName: () => Dt, OrderTypeEnum: () => Et, OrdersApi: () => L3, OrdersApiAxiosParamCreator: () => F3, OrdersApiFactory: () => ve2, OrdersApiFp: () => I3, OrganisationTier: () => Ot, PassportApi: () => B3, PassportApiAxiosParamCreator: () => R3, PassportApiFactory: () => Oe, PassportApiFp: () => z3, PassportProfileApi: () => Ae, PassportProfileApiAxiosParamCreator: () => V2, PassportProfileApiFactory: () => ke, PassportProfileApiFp: () => H2, PendingOrderStatusNameEnum: () => kt, PricingApi: () => Ne, PricingApiAxiosParamCreator: () => je, PricingApiFactory: () => Me, PricingApiFp: () => U2, ProtocolDataOrderTypeEnum: () => At, SaleFeeTypeEnum: () => jt, SeaportCreateListingMetadataTypedDataTypeEnum: () => Mt, SeaportERC1155CollectionItemTypeEnum: () => Nt, SeaportERC1155ItemTypeEnum: () => Pt, SeaportERC20ItemTypeEnum: () => Ft, SeaportERC721CollectionItemTypeEnum: () => It, SeaportERC721ItemTypeEnum: () => Lt, SeaportFeeTypeEnum: () => Rt, SeaportFulfillAvailableAdvancedOrdersMetadataTransactionTypeEnum: () => zt, SeaportNativeItemTypeEnum: () => Bt, SearchStacksSortByEnum: () => fe2, Severity: () => Vt, TokenContractType: () => Ht, TokensApi: () => Ie, TokensApiAxiosParamCreator: () => Pe, TokensApiFactory: () => Fe, TokensApiFp: () => W2, TransactionApprovalRequestChainTypeEnum: () => Ut, TransactionEvaluationResponseConfirmationMethodEnum: () => Wt, UnknownMetadataTransactionTypeEnum: () => Gt, UnknownTypedDataMetadataTypedDataTypeEnum: () => Kt, ValidationStatus: () => qt, VerificationRequestContractType: () => Jt, VerificationRequestStatus: () => Yt, ZkEvmTransactionEvaluationRequestChainTypeEnum: () => Xt });
var Qt = function(e3) {
  return e3.CheapestFirst = `cheapest_first`, e3;
}({});
var $t = function(e3) {
  return e3.ValidationError = `VALIDATION_ERROR`, e3;
}({});
var en = function(e3) {
  return e3.UnauthorisedRequest = `UNAUTHORISED_REQUEST`, e3;
}({});
var tn = function(e3) {
  return e3.AuthenticationError = `AUTHENTICATION_ERROR`, e3;
}({});
var nn = function(e3) {
  return e3.ResourceNotFound = `RESOURCE_NOT_FOUND`, e3;
}({});
var rn = function(e3) {
  return e3.ConflictError = `CONFLICT_ERROR`, e3;
}({});
var an = function(e3) {
  return e3.TooManyRequestsError = `TOO_MANY_REQUESTS_ERROR`, e3;
}({});
var on = function(e3) {
  return e3.InternalServerError = `INTERNAL_SERVER_ERROR`, e3;
}({});
var sn = function(e3) {
  return e3.Mint = `mint`, e3.Burn = `burn`, e3.Transfer = `transfer`, e3.Sale = `sale`, e3.Deposit = `deposit`, e3.Withdrawal = `withdrawal`, e3;
}({});
var cn = function(e3) {
  return e3.Verified = `verified`, e3.Unverified = `unverified`, e3.Spam = `spam`, e3.Inactive = `inactive`, e3;
}({});
var ln = function(e3) {
  return e3.Erc721 = `ERC721`, e3.Erc1155 = `ERC1155`, e3;
}({});
var un = function(e3) {
  return e3.Erc20 = `ERC20`, e3;
}({});
var dn = function(e3) {
  return e3.Royalty = `ROYALTY`, e3.MakerEcosystem = `MAKER_ECOSYSTEM`, e3.TakerEcosystem = `TAKER_ECOSYSTEM`, e3.Protocol = `PROTOCOL`, e3;
}({});
var fn = function(e3) {
  return e3.Native = `NATIVE`, e3;
}({});
var pn = function(e3) {
  return e3.Erc721 = `ERC721`, e3.Erc1155 = `ERC1155`, e3;
}({});
var mn = function(e3) {
  return e3.Pending = `pending`, e3.Succeeded = `succeeded`, e3.Failed = `failed`, e3;
}({});
var hn = function(e3) {
  return e3.Erc721 = `ERC721`, e3.Erc1155 = `ERC1155`, e3;
}({});
var gn = function(e3) {
  return e3.Number = `number`, e3.BoostPercentage = `boost_percentage`, e3.BoostNumber = `boost_number`, e3.Date = `date`, e3;
}({});
var _n = function(e3) {
  return e3.Royalty = `ROYALTY`, e3;
}({});
var vn = function(e3) {
  return e3.Erc20 = `ERC20`, e3;
}({});
var yn = n2({ APIError400AllOfCodeEnum: () => $t, APIError401AllOfCodeEnum: () => en, APIError403AllOfCodeEnum: () => tn, APIError404AllOfCodeEnum: () => nn, APIError409AllOfCodeEnum: () => rn, APIError429AllOfCodeEnum: () => an, APIError500AllOfCodeEnum: () => on, ActivityType: () => sn, AssetVerificationStatus: () => cn, CollectionContractType: () => ln, MarketPriceERC20TokenTypeEnum: () => un, MarketPriceFeesTypeEnum: () => dn, MarketPriceNativeTokenTypeEnum: () => fn, MarketplaceContractType: () => pn, MintRequestStatus: () => mn, NFTContractType: () => hn, NFTMetadataAttributeDisplayTypeEnum: () => gn, SaleFeeTypeEnum: () => _n, SearchStacksSortByEnum: () => Qt, TokenContractType: () => vn });
var bn = class {
  constructor(e3) {
    __publicField(this, "config");
    __publicField(this, "activitiesApi");
    __publicField(this, "chainsApi");
    __publicField(this, "collectionApi");
    __publicField(this, "nftOwnersApi");
    __publicField(this, "nftsApi");
    __publicField(this, "ordersApi");
    __publicField(this, "passportApi");
    __publicField(this, "passportProfileApi");
    __publicField(this, "guardianApi");
    this.config = e3, this.activitiesApi = new v3(e3.indexer), this.chainsApi = new S3(e3.indexer), this.collectionApi = new te3(e3.indexer), this.nftOwnersApi = new he2(e3.indexer), this.nftsApi = new P3(e3.indexer), this.ordersApi = new L3(e3.orderBook), this.passportApi = new B3(e3.passport), this.passportProfileApi = new Ae(e3.passport), this.guardianApi = new D3(e3.passport);
  }
};
var G3 = `http://localhost`.replace(/\/+$/, ``);
var xn = class {
  constructor(t3, n3 = G3, r3 = axios_default) {
    __publicField(this, "basePath");
    __publicField(this, "axios");
    __publicField(this, "configuration");
    this.basePath = n3, this.axios = r3, t3 && (this.configuration = t3, this.basePath = t3.basePath || this.basePath);
  }
};
var Sn = class extends Error {
  constructor(e3, t3) {
    super(t3);
    __publicField(this, "field");
    this.field = e3, this.name = `RequiredError`;
  }
};
var K2 = `https://example.com`;
var q2 = function(e3, t3, n3) {
  if (n3 == null) throw new Sn(t3, `Required parameter ${t3} was null or undefined when calling ${e3}.`);
};
var J2 = async function(e3, t3) {
  t3 && t3.accessToken && (e3.Authorization = `Bearer ` + (typeof t3.accessToken == `function` ? await t3.accessToken() : await t3.accessToken));
};
function Y2(e3, t3, n3 = ``) {
  t3 != null && (typeof t3 == `object` ? Array.isArray(t3) ? t3.forEach((t4) => Y2(e3, t4, n3)) : Object.keys(t3).forEach((r3) => Y2(e3, t3[r3], `${n3}${n3 === `` ? `` : `.`}${r3}`)) : e3.has(n3) ? e3.append(n3, t3) : e3.set(n3, t3));
}
var X2 = function(e3, ...t3) {
  let n3 = new URLSearchParams(e3.search);
  Y2(n3, t3), e3.search = n3.toString();
};
var Cn = function(e3, t3, n3) {
  let r3 = typeof e3 != `string`;
  return (r3 && n3 && n3.isJsonMime ? n3.isJsonMime(t3.headers[`Content-Type`]) : r3) ? JSON.stringify(e3 === void 0 ? {} : e3) : e3 || ``;
};
var Z2 = function(e3) {
  return e3.pathname + e3.search + e3.hash;
};
var Q2 = function(e3, t3, n3, r3) {
  return (i3 = t3, a3 = n3) => {
    let o4 = { ...e3.options, url: (r3?.basePath || i3.defaults.baseURL || a3) + e3.url };
    return i3.request(o4);
  };
};
var wn = function(e3) {
  return { signDataV1WalletSignDataPost: async (t3, n3, r3, i3, a3, o4 = {}) => {
    q2(`signDataV1WalletSignDataPost`, `xMagicChain`, t3), q2(`signDataV1WalletSignDataPost`, `signDataRequest`, n3);
    let s3 = new URL(`/v1/wallet/sign/data`, K2), c3;
    e3 && (c3 = e3.baseOptions);
    let l3 = { method: `POST`, ...c3, ...o4 }, u3 = {};
    await J2(u3, e3), t3 != null && (u3[`X-Magic-Chain`] = String(t3)), r3 != null && (u3[`X-Magic-API-Key`] = String(r3)), i3 != null && (u3[`X-Magic-Secret-Key`] = String(i3)), a3 != null && (u3[`X-OIDC-Provider-ID`] = String(a3)), u3[`Content-Type`] = `application/json`, X2(s3, {});
    let d3 = c3 && c3.headers ? c3.headers : {};
    return l3.headers = { ...u3, ...d3, ...o4.headers }, l3.data = Cn(n3, l3, e3), { url: Z2(s3), options: l3 };
  }, signMessageV1WalletSignMessagePost: async (t3, n3, r3, i3, a3, o4 = {}) => {
    q2(`signMessageV1WalletSignMessagePost`, `xMagicChain`, t3), q2(`signMessageV1WalletSignMessagePost`, `signMessageRequest`, n3);
    let s3 = new URL(`/v1/wallet/sign/message`, K2), c3;
    e3 && (c3 = e3.baseOptions);
    let l3 = { method: `POST`, ...c3, ...o4 }, u3 = {};
    await J2(u3, e3), t3 != null && (u3[`X-Magic-Chain`] = String(t3)), r3 != null && (u3[`X-Magic-API-Key`] = String(r3)), i3 != null && (u3[`X-Magic-Secret-Key`] = String(i3)), a3 != null && (u3[`X-OIDC-Provider-ID`] = String(a3)), u3[`Content-Type`] = `application/json`, X2(s3, {});
    let d3 = c3 && c3.headers ? c3.headers : {};
    return l3.headers = { ...u3, ...d3, ...o4.headers }, l3.data = Cn(n3, l3, e3), { url: Z2(s3), options: l3 };
  } };
};
var Tn = function(t3) {
  let n3 = wn(t3);
  return { async signDataV1WalletSignDataPost(r3, i3, a3, o4, s3, c3) {
    return Q2(await n3.signDataV1WalletSignDataPost(r3, i3, a3, o4, s3, c3), axios_default, G3, t3);
  }, async signMessageV1WalletSignMessagePost(r3, i3, a3, o4, s3, c3) {
    return Q2(await n3.signMessageV1WalletSignMessagePost(r3, i3, a3, o4, s3, c3), axios_default, G3, t3);
  } };
};
var En = class extends xn {
  signDataV1WalletSignDataPost(e3, t3) {
    return Tn(this.configuration).signDataV1WalletSignDataPost(e3.xMagicChain, e3.signDataRequest, e3.xMagicAPIKey, e3.xMagicSecretKey, e3.xOIDCProviderID, t3).then((e4) => e4(this.axios, this.basePath));
  }
  signMessageV1WalletSignMessagePost(e3, t3) {
    return Tn(this.configuration).signMessageV1WalletSignMessagePost(e3.xMagicChain, e3.signMessageRequest, e3.xMagicAPIKey, e3.xMagicSecretKey, e3.xOIDCProviderID, t3).then((e4) => e4(this.axios, this.basePath));
  }
};
var Dn = function(e3) {
  return { createWalletV1WalletPost: async (t3, n3, r3, i3, a3 = {}) => {
    q2(`createWalletV1WalletPost`, `xMagicChain`, t3);
    let o4 = new URL(`/v1/wallet`, K2), s3;
    e3 && (s3 = e3.baseOptions);
    let c3 = { method: `POST`, ...s3, ...a3 }, l3 = {};
    await J2(l3, e3), t3 != null && (l3[`X-Magic-Chain`] = String(t3)), n3 != null && (l3[`X-Magic-API-Key`] = String(n3)), r3 != null && (l3[`X-Magic-Secret-Key`] = String(r3)), i3 != null && (l3[`X-OIDC-Provider-ID`] = String(i3)), X2(o4, {});
    let u3 = s3 && s3.headers ? s3.headers : {};
    return c3.headers = { ...l3, ...u3, ...a3.headers }, { url: Z2(o4), options: c3 };
  } };
};
var On = function(t3) {
  let n3 = Dn(t3);
  return { async createWalletV1WalletPost(r3, i3, a3, o4, s3) {
    return Q2(await n3.createWalletV1WalletPost(r3, i3, a3, o4, s3), axios_default, G3, t3);
  } };
};
var kn = class extends xn {
  createWalletV1WalletPost(e3, t3) {
    return On(this.configuration).createWalletV1WalletPost(e3.xMagicChain, e3.xMagicAPIKey, e3.xMagicSecretKey, e3.xOIDCProviderID, t3).then((e4) => e4(this.axios, this.basePath));
  }
};
var An = class {
  constructor(t3) {
    __publicField(this, "signOperationsApi");
    __publicField(this, "walletApi");
    let n3 = axios_default.create({ timeout: t3.timeout, headers: { "Content-Type": `application/json`, "X-Magic-API-Key": t3.magicPublishableApiKey, "X-OIDC-Provider-ID": t3.magicProviderId } });
    this.signOperationsApi = new En(void 0, t3.basePath, n3), this.walletApi = new kn(void 0, t3.basePath, n3);
  }
};
var jn = { "x-sdk-version": `ts-immutable-sdk-2.24.6` };
var $2 = ({ basePath: e3, headers: t3 }) => {
  if (!e3.trim()) throw Error(`basePath can not be empty`);
  return new Le({ basePath: e3, baseOptions: { headers: { ...jn, ...t3 || {} } } });
};

// node_modules/viem/_esm/index.js
init_exports();

// node_modules/viem/_esm/utils/getAction.js
function getAction(client, actionFn, name) {
  const action_implicit = client[actionFn.name];
  if (typeof action_implicit === "function")
    return action_implicit;
  const action_explicit = client[name];
  if (typeof action_explicit === "function")
    return action_explicit;
  return (params) => actionFn(client, params);
}

// node_modules/viem/_esm/utils/abi/encodeEventTopics.js
init_abi();

// node_modules/viem/_esm/errors/log.js
init_base();
var FilterTypeNotSupportedError = class extends BaseError2 {
  constructor(type) {
    super(`Filter type "${type}" is not supported.`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "FilterTypeNotSupportedError"
    });
  }
};

// node_modules/viem/_esm/utils/abi/encodeEventTopics.js
init_toBytes();
init_keccak256();
init_toEventSelector();
init_encodeAbiParameters();
init_formatAbiItem2();
init_getAbiItem();
var docsPath = "/docs/contract/encodeEventTopics";
function encodeEventTopics(parameters) {
  const { abi: abi2, eventName, args } = parameters;
  let abiItem = abi2[0];
  if (eventName) {
    const item = getAbiItem({ abi: abi2, name: eventName });
    if (!item)
      throw new AbiEventNotFoundError(eventName, { docsPath });
    abiItem = item;
  }
  if (abiItem.type !== "event")
    throw new AbiEventNotFoundError(void 0, { docsPath });
  const definition = formatAbiItem2(abiItem);
  const signature = toEventSelector(definition);
  let topics = [];
  if (args && "inputs" in abiItem) {
    const indexedInputs = abiItem.inputs?.filter((param) => "indexed" in param && param.indexed);
    const args_ = Array.isArray(args) ? args : Object.values(args).length > 0 ? indexedInputs?.map((x4) => args[x4.name]) ?? [] : [];
    if (args_.length > 0) {
      topics = indexedInputs?.map((param, i3) => {
        if (Array.isArray(args_[i3]))
          return args_[i3].map((_4, j5) => encodeArg({ param, value: args_[i3][j5] }));
        return args_[i3] ? encodeArg({ param, value: args_[i3] }) : null;
      }) ?? [];
    }
  }
  return [signature, ...topics];
}
function encodeArg({ param, value }) {
  if (param.type === "string" || param.type === "bytes")
    return keccak256(toBytes(value));
  if (param.type === "tuple" || param.type.match(/^(.*)\[(\d+)?\]$/))
    throw new FilterTypeNotSupportedError(param.type);
  return encodeAbiParameters([param], [value]);
}

// node_modules/viem/_esm/actions/public/createContractEventFilter.js
init_toHex();

// node_modules/viem/_esm/utils/filters/createFilterRequestScope.js
function createFilterRequestScope(client, { method }) {
  const requestMap = {};
  if (client.transport.type === "fallback")
    client.transport.onResponse?.(({ method: method_, response: id, status, transport }) => {
      if (status === "success" && method === method_)
        requestMap[id] = transport.request;
    });
  return (id) => requestMap[id] || client.request;
}

// node_modules/viem/_esm/actions/public/createContractEventFilter.js
async function createContractEventFilter(client, parameters) {
  const { address, abi: abi2, args, eventName, fromBlock, strict, toBlock } = parameters;
  const getRequest = createFilterRequestScope(client, {
    method: "eth_newFilter"
  });
  const topics = eventName ? encodeEventTopics({
    abi: abi2,
    args,
    eventName
  }) : void 0;
  const id = await client.request({
    method: "eth_newFilter",
    params: [
      {
        address,
        fromBlock: typeof fromBlock === "bigint" ? numberToHex(fromBlock) : fromBlock,
        toBlock: typeof toBlock === "bigint" ? numberToHex(toBlock) : toBlock,
        topics
      }
    ]
  });
  return {
    abi: abi2,
    args,
    eventName,
    id,
    request: getRequest(id),
    strict: Boolean(strict),
    type: "event"
  };
}

// node_modules/viem/_esm/actions/public/estimateContractGas.js
init_parseAccount();
init_encodeFunctionData();

// node_modules/viem/_esm/utils/errors/getContractError.js
init_abi();
init_base();
init_contract();
init_rpc();
var EXECUTION_REVERTED_ERROR_CODE = 3;
function getContractError(err, { abi: abi2, address, args, docsPath: docsPath6, functionName, sender }) {
  const { code, data, message, shortMessage } = err instanceof RawContractError ? err : err instanceof BaseError2 ? err.walk((err2) => "data" in err2) || err.walk() : {};
  const cause = (() => {
    if (err instanceof AbiDecodingZeroDataError)
      return new ContractFunctionZeroDataError({ functionName });
    if ([EXECUTION_REVERTED_ERROR_CODE, InternalRpcError.code].includes(code) && (data || message || shortMessage)) {
      return new ContractFunctionRevertedError({
        abi: abi2,
        data: typeof data === "object" ? data.data : data,
        functionName,
        message: shortMessage ?? message
      });
    }
    return err;
  })();
  return new ContractFunctionExecutionError(cause, {
    abi: abi2,
    args,
    contractAddress: address,
    docsPath: docsPath6,
    functionName,
    sender
  });
}

// node_modules/viem/_esm/actions/public/estimateGas.js
init_parseAccount();
init_toHex();

// node_modules/viem/_esm/errors/estimateGas.js
init_formatEther();
init_formatGwei();
init_base();
init_transaction();
var EstimateGasExecutionError = class extends BaseError2 {
  constructor(cause, { account, docsPath: docsPath6, chain, data, gas, gasPrice, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value }) {
    const prettyArgs = prettyPrint({
      from: account?.address,
      to,
      value: typeof value !== "undefined" && `${formatEther(value)} ${chain?.nativeCurrency?.symbol || "ETH"}`,
      data,
      gas,
      gasPrice: typeof gasPrice !== "undefined" && `${formatGwei(gasPrice)} gwei`,
      maxFeePerGas: typeof maxFeePerGas !== "undefined" && `${formatGwei(maxFeePerGas)} gwei`,
      maxPriorityFeePerGas: typeof maxPriorityFeePerGas !== "undefined" && `${formatGwei(maxPriorityFeePerGas)} gwei`,
      nonce
    });
    super(cause.shortMessage, {
      cause,
      docsPath: docsPath6,
      metaMessages: [
        ...cause.metaMessages ? [...cause.metaMessages, " "] : [],
        "Estimate Gas Arguments:",
        prettyArgs
      ].filter(Boolean)
    });
    Object.defineProperty(this, "cause", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "EstimateGasExecutionError"
    });
    this.cause = cause;
  }
};

// node_modules/viem/_esm/utils/errors/getEstimateGasError.js
init_node();
init_getNodeError();
function getEstimateGasError(err, { docsPath: docsPath6, ...args }) {
  const cause = (() => {
    const cause2 = getNodeError(err, args);
    if (cause2 instanceof UnknownNodeError)
      return err;
    return cause2;
  })();
  return new EstimateGasExecutionError(cause, {
    docsPath: docsPath6,
    ...args
  });
}

// node_modules/viem/_esm/actions/public/estimateGas.js
init_extract();
init_transactionRequest();
init_stateOverride2();
init_assertRequest();

// node_modules/viem/_esm/actions/wallet/prepareTransactionRequest.js
init_parseAccount();

// node_modules/viem/_esm/errors/fee.js
init_formatGwei();
init_base();
var BaseFeeScalarError = class extends BaseError2 {
  constructor() {
    super("`baseFeeMultiplier` must be greater than 1.");
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "BaseFeeScalarError"
    });
  }
};
var Eip1559FeesNotSupportedError = class extends BaseError2 {
  constructor() {
    super("Chain does not support EIP-1559 fees.");
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "Eip1559FeesNotSupportedError"
    });
  }
};
var MaxFeePerGasTooLowError = class extends BaseError2 {
  constructor({ maxPriorityFeePerGas }) {
    super(`\`maxFeePerGas\` cannot be less than the \`maxPriorityFeePerGas\` (${formatGwei(maxPriorityFeePerGas)} gwei).`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "MaxFeePerGasTooLowError"
    });
  }
};

// node_modules/viem/_esm/actions/public/estimateMaxPriorityFeePerGas.js
init_fromHex();

// node_modules/viem/_esm/errors/block.js
init_base();
var BlockNotFoundError = class extends BaseError2 {
  constructor({ blockHash, blockNumber }) {
    let identifier = "Block";
    if (blockHash)
      identifier = `Block at hash "${blockHash}"`;
    if (blockNumber)
      identifier = `Block at number "${blockNumber}"`;
    super(`${identifier} could not be found.`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "BlockNotFoundError"
    });
  }
};

// node_modules/viem/_esm/actions/public/getBlock.js
init_toHex();

// node_modules/viem/_esm/utils/formatters/transaction.js
init_fromHex();
var transactionType = {
  "0x0": "legacy",
  "0x1": "eip2930",
  "0x2": "eip1559",
  "0x3": "eip4844"
};
function formatTransaction(transaction) {
  const transaction_ = {
    ...transaction,
    blockHash: transaction.blockHash ? transaction.blockHash : null,
    blockNumber: transaction.blockNumber ? BigInt(transaction.blockNumber) : null,
    chainId: transaction.chainId ? hexToNumber(transaction.chainId) : void 0,
    gas: transaction.gas ? BigInt(transaction.gas) : void 0,
    gasPrice: transaction.gasPrice ? BigInt(transaction.gasPrice) : void 0,
    maxFeePerBlobGas: transaction.maxFeePerBlobGas ? BigInt(transaction.maxFeePerBlobGas) : void 0,
    maxFeePerGas: transaction.maxFeePerGas ? BigInt(transaction.maxFeePerGas) : void 0,
    maxPriorityFeePerGas: transaction.maxPriorityFeePerGas ? BigInt(transaction.maxPriorityFeePerGas) : void 0,
    nonce: transaction.nonce ? hexToNumber(transaction.nonce) : void 0,
    to: transaction.to ? transaction.to : null,
    transactionIndex: transaction.transactionIndex ? Number(transaction.transactionIndex) : null,
    type: transaction.type ? transactionType[transaction.type] : void 0,
    typeHex: transaction.type ? transaction.type : void 0,
    value: transaction.value ? BigInt(transaction.value) : void 0,
    v: transaction.v ? BigInt(transaction.v) : void 0
  };
  transaction_.yParity = (() => {
    if (transaction.yParity)
      return Number(transaction.yParity);
    if (typeof transaction_.v === "bigint") {
      if (transaction_.v === 0n || transaction_.v === 27n)
        return 0;
      if (transaction_.v === 1n || transaction_.v === 28n)
        return 1;
      if (transaction_.v >= 35n)
        return transaction_.v % 2n === 0n ? 1 : 0;
    }
    return void 0;
  })();
  if (transaction_.type === "legacy") {
    delete transaction_.accessList;
    delete transaction_.maxFeePerBlobGas;
    delete transaction_.maxFeePerGas;
    delete transaction_.maxPriorityFeePerGas;
    delete transaction_.yParity;
  }
  if (transaction_.type === "eip2930") {
    delete transaction_.maxFeePerBlobGas;
    delete transaction_.maxFeePerGas;
    delete transaction_.maxPriorityFeePerGas;
  }
  if (transaction_.type === "eip1559") {
    delete transaction_.maxFeePerBlobGas;
  }
  return transaction_;
}

// node_modules/viem/_esm/utils/formatters/block.js
function formatBlock(block) {
  const transactions = block.transactions?.map((transaction) => {
    if (typeof transaction === "string")
      return transaction;
    return formatTransaction(transaction);
  });
  return {
    ...block,
    baseFeePerGas: block.baseFeePerGas ? BigInt(block.baseFeePerGas) : null,
    blobGasUsed: block.blobGasUsed ? BigInt(block.blobGasUsed) : void 0,
    difficulty: block.difficulty ? BigInt(block.difficulty) : void 0,
    excessBlobGas: block.excessBlobGas ? BigInt(block.excessBlobGas) : void 0,
    gasLimit: block.gasLimit ? BigInt(block.gasLimit) : void 0,
    gasUsed: block.gasUsed ? BigInt(block.gasUsed) : void 0,
    hash: block.hash ? block.hash : null,
    logsBloom: block.logsBloom ? block.logsBloom : null,
    nonce: block.nonce ? block.nonce : null,
    number: block.number ? BigInt(block.number) : null,
    size: block.size ? BigInt(block.size) : void 0,
    timestamp: block.timestamp ? BigInt(block.timestamp) : void 0,
    transactions,
    totalDifficulty: block.totalDifficulty ? BigInt(block.totalDifficulty) : null
  };
}

// node_modules/viem/_esm/actions/public/getBlock.js
async function getBlock(client, { blockHash, blockNumber, blockTag: blockTag_, includeTransactions: includeTransactions_ } = {}) {
  const blockTag = blockTag_ ?? "latest";
  const includeTransactions = includeTransactions_ ?? false;
  const blockNumberHex = blockNumber !== void 0 ? numberToHex(blockNumber) : void 0;
  let block = null;
  if (blockHash) {
    block = await client.request({
      method: "eth_getBlockByHash",
      params: [blockHash, includeTransactions]
    }, { dedupe: true });
  } else {
    block = await client.request({
      method: "eth_getBlockByNumber",
      params: [blockNumberHex || blockTag, includeTransactions]
    }, { dedupe: Boolean(blockNumberHex) });
  }
  if (!block)
    throw new BlockNotFoundError({ blockHash, blockNumber });
  const format = client.chain?.formatters?.block?.format || formatBlock;
  return format(block);
}

// node_modules/viem/_esm/actions/public/getGasPrice.js
async function getGasPrice(client) {
  const gasPrice = await client.request({
    method: "eth_gasPrice"
  });
  return BigInt(gasPrice);
}

// node_modules/viem/_esm/actions/public/estimateMaxPriorityFeePerGas.js
async function estimateMaxPriorityFeePerGas(client, args) {
  return internal_estimateMaxPriorityFeePerGas(client, args);
}
async function internal_estimateMaxPriorityFeePerGas(client, args) {
  const { block: block_, chain = client.chain, request } = args || {};
  if (typeof chain?.fees?.defaultPriorityFee === "function") {
    const block = block_ || await getAction(client, getBlock, "getBlock")({});
    return chain.fees.defaultPriorityFee({
      block,
      client,
      request
    });
  }
  if (typeof chain?.fees?.defaultPriorityFee !== "undefined")
    return chain?.fees?.defaultPriorityFee;
  try {
    const maxPriorityFeePerGasHex = await client.request({
      method: "eth_maxPriorityFeePerGas"
    });
    return hexToBigInt(maxPriorityFeePerGasHex);
  } catch {
    const [block, gasPrice] = await Promise.all([
      block_ ? Promise.resolve(block_) : getAction(client, getBlock, "getBlock")({}),
      getAction(client, getGasPrice, "getGasPrice")({})
    ]);
    if (typeof block.baseFeePerGas !== "bigint")
      throw new Eip1559FeesNotSupportedError();
    const maxPriorityFeePerGas = gasPrice - block.baseFeePerGas;
    if (maxPriorityFeePerGas < 0n)
      return 0n;
    return maxPriorityFeePerGas;
  }
}

// node_modules/viem/_esm/actions/public/estimateFeesPerGas.js
async function estimateFeesPerGas(client, args) {
  return internal_estimateFeesPerGas(client, args);
}
async function internal_estimateFeesPerGas(client, args) {
  const { block: block_, chain = client.chain, request, type = "eip1559" } = args || {};
  const baseFeeMultiplier = await (async () => {
    if (typeof chain?.fees?.baseFeeMultiplier === "function")
      return chain.fees.baseFeeMultiplier({
        block: block_,
        client,
        request
      });
    return chain?.fees?.baseFeeMultiplier ?? 1.2;
  })();
  if (baseFeeMultiplier < 1)
    throw new BaseFeeScalarError();
  const decimals = baseFeeMultiplier.toString().split(".")[1]?.length ?? 0;
  const denominator = 10 ** decimals;
  const multiply = (base) => base * BigInt(Math.ceil(baseFeeMultiplier * denominator)) / BigInt(denominator);
  const block = block_ ? block_ : await getAction(client, getBlock, "getBlock")({});
  if (typeof chain?.fees?.estimateFeesPerGas === "function") {
    const fees = await chain.fees.estimateFeesPerGas({
      block: block_,
      client,
      multiply,
      request,
      type
    });
    if (fees !== null)
      return fees;
  }
  if (type === "eip1559") {
    if (typeof block.baseFeePerGas !== "bigint")
      throw new Eip1559FeesNotSupportedError();
    const maxPriorityFeePerGas = typeof request?.maxPriorityFeePerGas === "bigint" ? request.maxPriorityFeePerGas : await internal_estimateMaxPriorityFeePerGas(client, {
      block,
      chain,
      request
    });
    const baseFeePerGas = multiply(block.baseFeePerGas);
    const maxFeePerGas = request?.maxFeePerGas ?? baseFeePerGas + maxPriorityFeePerGas;
    return {
      maxFeePerGas,
      maxPriorityFeePerGas
    };
  }
  const gasPrice = request?.gasPrice ?? multiply(await getAction(client, getGasPrice, "getGasPrice")({}));
  return {
    gasPrice
  };
}

// node_modules/viem/_esm/actions/public/getTransactionCount.js
init_fromHex();
init_toHex();
async function getTransactionCount(client, { address, blockTag = "latest", blockNumber }) {
  const count = await client.request({
    method: "eth_getTransactionCount",
    params: [address, blockNumber ? numberToHex(blockNumber) : blockTag]
  }, { dedupe: Boolean(blockNumber) });
  return hexToNumber(count);
}

// node_modules/viem/_esm/utils/blob/blobsToCommitments.js
init_toBytes();
init_toHex();
function blobsToCommitments(parameters) {
  const { kzg } = parameters;
  const to = parameters.to ?? (typeof parameters.blobs[0] === "string" ? "hex" : "bytes");
  const blobs = typeof parameters.blobs[0] === "string" ? parameters.blobs.map((x4) => hexToBytes(x4)) : parameters.blobs;
  const commitments = [];
  for (const blob of blobs)
    commitments.push(Uint8Array.from(kzg.blobToKzgCommitment(blob)));
  return to === "bytes" ? commitments : commitments.map((x4) => bytesToHex(x4));
}

// node_modules/viem/_esm/utils/blob/blobsToProofs.js
init_toBytes();
init_toHex();
function blobsToProofs(parameters) {
  const { kzg } = parameters;
  const to = parameters.to ?? (typeof parameters.blobs[0] === "string" ? "hex" : "bytes");
  const blobs = typeof parameters.blobs[0] === "string" ? parameters.blobs.map((x4) => hexToBytes(x4)) : parameters.blobs;
  const commitments = typeof parameters.commitments[0] === "string" ? parameters.commitments.map((x4) => hexToBytes(x4)) : parameters.commitments;
  const proofs = [];
  for (let i3 = 0; i3 < blobs.length; i3++) {
    const blob = blobs[i3];
    const commitment = commitments[i3];
    proofs.push(Uint8Array.from(kzg.computeBlobKzgProof(blob, commitment)));
  }
  return to === "bytes" ? proofs : proofs.map((x4) => bytesToHex(x4));
}

// node_modules/viem/_esm/utils/blob/commitmentToVersionedHash.js
init_toHex();

// node_modules/viem/_esm/utils/hash/sha256.js
init_sha256();
init_isHex();
init_toBytes();
init_toHex();
function sha2562(value, to_) {
  const to = to_ || "hex";
  const bytes2 = sha256(isHex(value, { strict: false }) ? toBytes(value) : value);
  if (to === "bytes")
    return bytes2;
  return toHex(bytes2);
}

// node_modules/viem/_esm/utils/blob/commitmentToVersionedHash.js
function commitmentToVersionedHash(parameters) {
  const { commitment, version: version3 = 1 } = parameters;
  const to = parameters.to ?? (typeof commitment === "string" ? "hex" : "bytes");
  const versionedHash = sha2562(commitment, "bytes");
  versionedHash.set([version3], 0);
  return to === "bytes" ? versionedHash : bytesToHex(versionedHash);
}

// node_modules/viem/_esm/utils/blob/commitmentsToVersionedHashes.js
function commitmentsToVersionedHashes(parameters) {
  const { commitments, version: version3 } = parameters;
  const to = parameters.to ?? (typeof commitments[0] === "string" ? "hex" : "bytes");
  const hashes = [];
  for (const commitment of commitments) {
    hashes.push(commitmentToVersionedHash({
      commitment,
      to,
      version: version3
    }));
  }
  return hashes;
}

// node_modules/viem/_esm/constants/blob.js
var blobsPerTransaction = 6;
var bytesPerFieldElement = 32;
var fieldElementsPerBlob = 4096;
var bytesPerBlob = bytesPerFieldElement * fieldElementsPerBlob;
var maxBytesPerTransaction = bytesPerBlob * blobsPerTransaction - // terminator byte (0x80).
1 - // zero byte (0x00) appended to each field element.
1 * fieldElementsPerBlob * blobsPerTransaction;

// node_modules/viem/_esm/errors/blob.js
init_base();
var BlobSizeTooLargeError = class extends BaseError2 {
  constructor({ maxSize, size: size3 }) {
    super("Blob size is too large.", {
      metaMessages: [`Max: ${maxSize} bytes`, `Given: ${size3} bytes`]
    });
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "BlobSizeTooLargeError"
    });
  }
};
var EmptyBlobError = class extends BaseError2 {
  constructor() {
    super("Blob data must not be empty.");
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "EmptyBlobError"
    });
  }
};

// node_modules/viem/_esm/utils/blob/toBlobs.js
init_cursor2();
init_size();
init_toBytes();
init_toHex();
function toBlobs(parameters) {
  const to = parameters.to ?? (typeof parameters.data === "string" ? "hex" : "bytes");
  const data = typeof parameters.data === "string" ? hexToBytes(parameters.data) : parameters.data;
  const size_ = size(data);
  if (!size_)
    throw new EmptyBlobError();
  if (size_ > maxBytesPerTransaction)
    throw new BlobSizeTooLargeError({
      maxSize: maxBytesPerTransaction,
      size: size_
    });
  const blobs = [];
  let active = true;
  let position = 0;
  while (active) {
    const blob = createCursor(new Uint8Array(bytesPerBlob));
    let size3 = 0;
    while (size3 < fieldElementsPerBlob) {
      const bytes2 = data.slice(position, position + (bytesPerFieldElement - 1));
      blob.pushByte(0);
      blob.pushBytes(bytes2);
      if (bytes2.length < 31) {
        blob.pushByte(128);
        active = false;
        break;
      }
      size3++;
      position += 31;
    }
    blobs.push(blob);
  }
  return to === "bytes" ? blobs.map((x4) => x4.bytes) : blobs.map((x4) => bytesToHex(x4.bytes));
}

// node_modules/viem/_esm/utils/blob/toBlobSidecars.js
function toBlobSidecars(parameters) {
  const { data, kzg, to } = parameters;
  const blobs = parameters.blobs ?? toBlobs({ data, to });
  const commitments = parameters.commitments ?? blobsToCommitments({ blobs, kzg, to });
  const proofs = parameters.proofs ?? blobsToProofs({ blobs, commitments, kzg, to });
  const sidecars = [];
  for (let i3 = 0; i3 < blobs.length; i3++)
    sidecars.push({
      blob: blobs[i3],
      commitment: commitments[i3],
      proof: proofs[i3]
    });
  return sidecars;
}

// node_modules/viem/_esm/actions/wallet/prepareTransactionRequest.js
init_assertRequest();

// node_modules/viem/_esm/utils/transaction/getTransactionType.js
init_transaction();
function getTransactionType(transaction) {
  if (transaction.type)
    return transaction.type;
  if (typeof transaction.blobs !== "undefined" || typeof transaction.blobVersionedHashes !== "undefined" || typeof transaction.maxFeePerBlobGas !== "undefined" || typeof transaction.sidecars !== "undefined")
    return "eip4844";
  if (typeof transaction.maxFeePerGas !== "undefined" || typeof transaction.maxPriorityFeePerGas !== "undefined") {
    return "eip1559";
  }
  if (typeof transaction.gasPrice !== "undefined") {
    if (typeof transaction.accessList !== "undefined")
      return "eip2930";
    return "legacy";
  }
  throw new InvalidSerializableTransactionError({ transaction });
}

// node_modules/viem/_esm/actions/public/getChainId.js
init_fromHex();
async function getChainId(client) {
  const chainIdHex = await client.request({
    method: "eth_chainId"
  }, { dedupe: true });
  return hexToNumber(chainIdHex);
}

// node_modules/viem/_esm/actions/wallet/prepareTransactionRequest.js
var defaultParameters = [
  "blobVersionedHashes",
  "chainId",
  "fees",
  "gas",
  "nonce",
  "type"
];
async function prepareTransactionRequest(client, args) {
  const { account: account_ = client.account, blobs, chain, gas, kzg, nonce, parameters = defaultParameters, type } = args;
  const account = account_ ? parseAccount(account_) : void 0;
  const request = { ...args, ...account ? { from: account?.address } : {} };
  let block;
  async function getBlock2() {
    if (block)
      return block;
    block = await getAction(client, getBlock, "getBlock")({ blockTag: "latest" });
    return block;
  }
  let chainId;
  async function getChainId2() {
    if (chainId)
      return chainId;
    if (chain)
      return chain.id;
    if (typeof args.chainId !== "undefined")
      return args.chainId;
    const chainId_ = await getAction(client, getChainId, "getChainId")({});
    chainId = chainId_;
    return chainId;
  }
  if ((parameters.includes("blobVersionedHashes") || parameters.includes("sidecars")) && blobs && kzg) {
    const commitments = blobsToCommitments({ blobs, kzg });
    if (parameters.includes("blobVersionedHashes")) {
      const versionedHashes = commitmentsToVersionedHashes({
        commitments,
        to: "hex"
      });
      request.blobVersionedHashes = versionedHashes;
    }
    if (parameters.includes("sidecars")) {
      const proofs = blobsToProofs({ blobs, commitments, kzg });
      const sidecars = toBlobSidecars({
        blobs,
        commitments,
        proofs,
        to: "hex"
      });
      request.sidecars = sidecars;
    }
  }
  if (parameters.includes("chainId"))
    request.chainId = await getChainId2();
  if (parameters.includes("nonce") && typeof nonce === "undefined" && account) {
    if (account.nonceManager) {
      const chainId2 = await getChainId2();
      request.nonce = await account.nonceManager.consume({
        address: account.address,
        chainId: chainId2,
        client
      });
    } else {
      request.nonce = await getAction(client, getTransactionCount, "getTransactionCount")({
        address: account.address,
        blockTag: "pending"
      });
    }
  }
  if ((parameters.includes("fees") || parameters.includes("type")) && typeof type === "undefined") {
    try {
      request.type = getTransactionType(request);
    } catch {
      const block2 = await getBlock2();
      request.type = typeof block2?.baseFeePerGas === "bigint" ? "eip1559" : "legacy";
    }
  }
  if (parameters.includes("fees")) {
    if (request.type !== "legacy" && request.type !== "eip2930") {
      if (typeof request.maxFeePerGas === "undefined" || typeof request.maxPriorityFeePerGas === "undefined") {
        const block2 = await getBlock2();
        const { maxFeePerGas, maxPriorityFeePerGas } = await internal_estimateFeesPerGas(client, {
          block: block2,
          chain,
          request
        });
        if (typeof args.maxPriorityFeePerGas === "undefined" && args.maxFeePerGas && args.maxFeePerGas < maxPriorityFeePerGas)
          throw new MaxFeePerGasTooLowError({
            maxPriorityFeePerGas
          });
        request.maxPriorityFeePerGas = maxPriorityFeePerGas;
        request.maxFeePerGas = maxFeePerGas;
      }
    } else {
      if (typeof args.maxFeePerGas !== "undefined" || typeof args.maxPriorityFeePerGas !== "undefined")
        throw new Eip1559FeesNotSupportedError();
      const block2 = await getBlock2();
      const { gasPrice: gasPrice_ } = await internal_estimateFeesPerGas(client, {
        block: block2,
        chain,
        request,
        type: "legacy"
      });
      request.gasPrice = gasPrice_;
    }
  }
  if (parameters.includes("gas") && typeof gas === "undefined")
    request.gas = await getAction(client, estimateGas, "estimateGas")({
      ...request,
      account: account ? { address: account.address, type: "json-rpc" } : void 0
    });
  assertRequest(request);
  delete request.parameters;
  return request;
}

// node_modules/viem/_esm/actions/public/estimateGas.js
async function estimateGas(client, args) {
  const account_ = args.account ?? client.account;
  const account = account_ ? parseAccount(account_) : void 0;
  try {
    const { accessList, blobs, blobVersionedHashes, blockNumber, blockTag, data, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value, stateOverride, ...rest } = await prepareTransactionRequest(client, {
      ...args,
      parameters: (
        // Some RPC Providers do not compute versioned hashes from blobs. We will need
        // to compute them.
        account?.type === "local" ? void 0 : ["blobVersionedHashes"]
      )
    });
    const blockNumberHex = blockNumber ? numberToHex(blockNumber) : void 0;
    const block = blockNumberHex || blockTag;
    const rpcStateOverride = serializeStateOverride(stateOverride);
    assertRequest(args);
    const chainFormat = client.chain?.formatters?.transactionRequest?.format;
    const format = chainFormat || formatTransactionRequest;
    const request = format({
      // Pick out extra data that might exist on the chain's transaction request type.
      ...extract(rest, { format: chainFormat }),
      from: account?.address,
      accessList,
      blobs,
      blobVersionedHashes,
      data,
      gas,
      gasPrice,
      maxFeePerBlobGas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to,
      value
    });
    const balance = await client.request({
      method: "eth_estimateGas",
      params: rpcStateOverride ? [request, block ?? "latest", rpcStateOverride] : block ? [request, block] : [request]
    });
    return BigInt(balance);
  } catch (err) {
    throw getEstimateGasError(err, {
      ...args,
      account,
      chain: client.chain
    });
  }
}

// node_modules/viem/_esm/actions/public/estimateContractGas.js
async function estimateContractGas(client, parameters) {
  const { abi: abi2, address, args, functionName, ...request } = parameters;
  const data = encodeFunctionData({
    abi: abi2,
    args,
    functionName
  });
  try {
    const gas = await getAction(client, estimateGas, "estimateGas")({
      data,
      to: address,
      ...request
    });
    return gas;
  } catch (error) {
    const account = request.account ? parseAccount(request.account) : void 0;
    throw getContractError(error, {
      abi: abi2,
      address,
      args,
      docsPath: "/docs/contract/estimateContractGas",
      functionName,
      sender: account?.address
    });
  }
}

// node_modules/viem/_esm/actions/public/getContractEvents.js
init_getAbiItem();

// node_modules/viem/_esm/utils/abi/parseEventLogs.js
init_abi();
init_isAddressEqual();
init_toBytes();
init_keccak256();

// node_modules/viem/_esm/utils/abi/decodeEventLog.js
init_abi();
init_size();
init_toEventSelector();
init_cursor();
init_decodeAbiParameters();
init_formatAbiItem2();
var docsPath3 = "/docs/contract/decodeEventLog";
function decodeEventLog(parameters) {
  const { abi: abi2, data, strict: strict_, topics } = parameters;
  const strict = strict_ ?? true;
  const [signature, ...argTopics] = topics;
  if (!signature)
    throw new AbiEventSignatureEmptyTopicsError({ docsPath: docsPath3 });
  const abiItem = abi2.find((x4) => x4.type === "event" && signature === toEventSelector(formatAbiItem2(x4)));
  if (!(abiItem && "name" in abiItem) || abiItem.type !== "event")
    throw new AbiEventSignatureNotFoundError(signature, { docsPath: docsPath3 });
  const { name, inputs } = abiItem;
  const isUnnamed = inputs?.some((x4) => !("name" in x4 && x4.name));
  let args = isUnnamed ? [] : {};
  const indexedInputs = inputs.filter((x4) => "indexed" in x4 && x4.indexed);
  for (let i3 = 0; i3 < indexedInputs.length; i3++) {
    const param = indexedInputs[i3];
    const topic = argTopics[i3];
    if (!topic)
      throw new DecodeLogTopicsMismatch({
        abiItem,
        param
      });
    args[isUnnamed ? i3 : param.name || i3] = decodeTopic({ param, value: topic });
  }
  const nonIndexedInputs = inputs.filter((x4) => !("indexed" in x4 && x4.indexed));
  if (nonIndexedInputs.length > 0) {
    if (data && data !== "0x") {
      try {
        const decodedData = decodeAbiParameters(nonIndexedInputs, data);
        if (decodedData) {
          if (isUnnamed)
            args = [...args, ...decodedData];
          else {
            for (let i3 = 0; i3 < nonIndexedInputs.length; i3++) {
              args[nonIndexedInputs[i3].name] = decodedData[i3];
            }
          }
        }
      } catch (err) {
        if (strict) {
          if (err instanceof AbiDecodingDataSizeTooSmallError || err instanceof PositionOutOfBoundsError)
            throw new DecodeLogDataMismatch({
              abiItem,
              data,
              params: nonIndexedInputs,
              size: size(data)
            });
          throw err;
        }
      }
    } else if (strict) {
      throw new DecodeLogDataMismatch({
        abiItem,
        data: "0x",
        params: nonIndexedInputs,
        size: 0
      });
    }
  }
  return {
    eventName: name,
    args: Object.values(args).length > 0 ? args : void 0
  };
}
function decodeTopic({ param, value }) {
  if (param.type === "string" || param.type === "bytes" || param.type === "tuple" || param.type.match(/^(.*)\[(\d+)?\]$/))
    return value;
  const decodedArg = decodeAbiParameters([param], value) || [];
  return decodedArg[0];
}

// node_modules/viem/_esm/utils/abi/parseEventLogs.js
init_getAbiItem();
function parseEventLogs(parameters) {
  const { abi: abi2, args, logs, strict = true } = parameters;
  const eventName = (() => {
    if (!parameters.eventName)
      return void 0;
    if (Array.isArray(parameters.eventName))
      return parameters.eventName;
    return [parameters.eventName];
  })();
  return logs.map((log) => {
    try {
      const abiItem = getAbiItem({
        abi: abi2,
        name: log.topics[0]
      });
      if (!abiItem)
        return null;
      const event = decodeEventLog({
        ...log,
        abi: [abiItem],
        strict
      });
      if (eventName && !eventName.includes(event.eventName))
        return null;
      if (!includesArgs({
        args: event.args,
        inputs: abiItem.inputs,
        matchArgs: args
      }))
        return null;
      return { ...event, ...log };
    } catch (err) {
      let eventName2;
      let isUnnamed;
      if (err instanceof AbiEventSignatureNotFoundError)
        return null;
      if (err instanceof DecodeLogDataMismatch || err instanceof DecodeLogTopicsMismatch) {
        if (strict)
          return null;
        eventName2 = err.abiItem.name;
        isUnnamed = err.abiItem.inputs?.some((x4) => !("name" in x4 && x4.name));
      }
      return { ...log, args: isUnnamed ? [] : {}, eventName: eventName2 };
    }
  }).filter(Boolean);
}
function includesArgs(parameters) {
  const { args, inputs, matchArgs } = parameters;
  if (!matchArgs)
    return true;
  if (!args)
    return false;
  function isEqual(input, value, arg) {
    try {
      if (input.type === "address")
        return isAddressEqual(value, arg);
      if (input.type === "string" || input.type === "bytes")
        return keccak256(toBytes(value)) === arg;
      return value === arg;
    } catch {
      return false;
    }
  }
  if (Array.isArray(args) && Array.isArray(matchArgs)) {
    return matchArgs.every((value, index2) => {
      if (!value)
        return true;
      const input = inputs[index2];
      if (!input)
        return false;
      const value_ = Array.isArray(value) ? value : [value];
      return value_.some((value2) => isEqual(input, value2, args[index2]));
    });
  }
  if (typeof args === "object" && !Array.isArray(args) && typeof matchArgs === "object" && !Array.isArray(matchArgs))
    return Object.entries(matchArgs).every(([key, value]) => {
      if (!value)
        return true;
      const input = inputs.find((input2) => input2.name === key);
      if (!input)
        return false;
      const value_ = Array.isArray(value) ? value : [value];
      return value_.some((value2) => isEqual(input, value2, args[key]));
    });
  return false;
}

// node_modules/viem/_esm/actions/public/getLogs.js
init_toHex();

// node_modules/viem/_esm/utils/formatters/log.js
function formatLog(log, { args, eventName } = {}) {
  return {
    ...log,
    blockHash: log.blockHash ? log.blockHash : null,
    blockNumber: log.blockNumber ? BigInt(log.blockNumber) : null,
    logIndex: log.logIndex ? Number(log.logIndex) : null,
    transactionHash: log.transactionHash ? log.transactionHash : null,
    transactionIndex: log.transactionIndex ? Number(log.transactionIndex) : null,
    ...eventName ? { args, eventName } : {}
  };
}

// node_modules/viem/_esm/actions/public/getLogs.js
async function getLogs(client, { address, blockHash, fromBlock, toBlock, event, events: events_, args, strict: strict_ } = {}) {
  const strict = strict_ ?? false;
  const events = events_ ?? (event ? [event] : void 0);
  let topics = [];
  if (events) {
    const encoded = events.flatMap((event2) => encodeEventTopics({
      abi: [event2],
      eventName: event2.name,
      args: events_ ? void 0 : args
    }));
    topics = [encoded];
    if (event)
      topics = topics[0];
  }
  let logs;
  if (blockHash) {
    logs = await client.request({
      method: "eth_getLogs",
      params: [{ address, topics, blockHash }]
    });
  } else {
    logs = await client.request({
      method: "eth_getLogs",
      params: [
        {
          address,
          topics,
          fromBlock: typeof fromBlock === "bigint" ? numberToHex(fromBlock) : fromBlock,
          toBlock: typeof toBlock === "bigint" ? numberToHex(toBlock) : toBlock
        }
      ]
    });
  }
  const formattedLogs = logs.map((log) => formatLog(log));
  if (!events)
    return formattedLogs;
  return parseEventLogs({
    abi: events,
    args,
    logs: formattedLogs,
    strict
  });
}

// node_modules/viem/_esm/actions/public/getContractEvents.js
async function getContractEvents(client, parameters) {
  const { abi: abi2, address, args, blockHash, eventName, fromBlock, toBlock, strict } = parameters;
  const event = eventName ? getAbiItem({ abi: abi2, name: eventName }) : void 0;
  const events = !event ? abi2.filter((x4) => x4.type === "event") : void 0;
  return getAction(client, getLogs, "getLogs")({
    address,
    args,
    blockHash,
    event,
    events,
    fromBlock,
    toBlock,
    strict
  });
}

// node_modules/viem/_esm/actions/public/readContract.js
init_decodeFunctionResult();
init_encodeFunctionData();
init_call();
async function readContract(client, parameters) {
  const { abi: abi2, address, args, functionName, ...rest } = parameters;
  const calldata = encodeFunctionData({
    abi: abi2,
    args,
    functionName
  });
  try {
    const { data } = await getAction(client, call, "call")({
      ...rest,
      data: calldata,
      to: address
    });
    return decodeFunctionResult({
      abi: abi2,
      args,
      functionName,
      data: data || "0x"
    });
  } catch (error) {
    throw getContractError(error, {
      abi: abi2,
      address,
      args,
      docsPath: "/docs/contract/readContract",
      functionName
    });
  }
}

// node_modules/viem/_esm/actions/public/simulateContract.js
init_parseAccount();
init_decodeFunctionResult();
init_encodeFunctionData();
init_call();
async function simulateContract(client, parameters) {
  const { abi: abi2, address, args, dataSuffix, functionName, ...callRequest } = parameters;
  const account = callRequest.account ? parseAccount(callRequest.account) : client.account;
  const calldata = encodeFunctionData({ abi: abi2, args, functionName });
  try {
    const { data } = await getAction(client, call, "call")({
      batch: false,
      data: `${calldata}${dataSuffix ? dataSuffix.replace("0x", "") : ""}`,
      to: address,
      ...callRequest,
      account
    });
    const result = decodeFunctionResult({
      abi: abi2,
      args,
      functionName,
      data: data || "0x"
    });
    const minimizedAbi = abi2.filter((abiItem) => "name" in abiItem && abiItem.name === parameters.functionName);
    return {
      result,
      request: {
        abi: minimizedAbi,
        address,
        args,
        dataSuffix,
        functionName,
        ...callRequest,
        account
      }
    };
  } catch (error) {
    throw getContractError(error, {
      abi: abi2,
      address,
      args,
      docsPath: "/docs/contract/simulateContract",
      functionName,
      sender: account?.address
    });
  }
}

// node_modules/viem/_esm/actions/public/watchContractEvent.js
init_abi();
init_rpc();

// node_modules/viem/_esm/utils/observe.js
var listenersCache = /* @__PURE__ */ new Map();
var cleanupCache = /* @__PURE__ */ new Map();
var callbackCount = 0;
function observe(observerId, callbacks, fn2) {
  const callbackId = ++callbackCount;
  const getListeners = () => listenersCache.get(observerId) || [];
  const unsubscribe = () => {
    const listeners2 = getListeners();
    listenersCache.set(observerId, listeners2.filter((cb) => cb.id !== callbackId));
  };
  const unwatch = () => {
    const cleanup2 = cleanupCache.get(observerId);
    if (getListeners().length === 1 && cleanup2)
      cleanup2();
    unsubscribe();
  };
  const listeners = getListeners();
  listenersCache.set(observerId, [
    ...listeners,
    { id: callbackId, fns: callbacks }
  ]);
  if (listeners && listeners.length > 0)
    return unwatch;
  const emit = {};
  for (const key in callbacks) {
    emit[key] = (...args) => {
      const listeners2 = getListeners();
      if (listeners2.length === 0)
        return;
      for (const listener of listeners2)
        listener.fns[key]?.(...args);
    };
  }
  const cleanup = fn2(emit);
  if (typeof cleanup === "function")
    cleanupCache.set(observerId, cleanup);
  return unwatch;
}

// node_modules/viem/_esm/utils/wait.js
async function wait(time) {
  return new Promise((res) => setTimeout(res, time));
}

// node_modules/viem/_esm/utils/poll.js
function poll(fn2, { emitOnBegin, initialWaitTime, interval }) {
  let active = true;
  const unwatch = () => active = false;
  const watch = async () => {
    let data = void 0;
    if (emitOnBegin)
      data = await fn2({ unpoll: unwatch });
    const initialWait = await initialWaitTime?.(data) ?? interval;
    await wait(initialWait);
    const poll2 = async () => {
      if (!active)
        return;
      await fn2({ unpoll: unwatch });
      await wait(interval);
      poll2();
    };
    poll2();
  };
  watch();
  return unwatch;
}

// node_modules/viem/_esm/actions/public/watchContractEvent.js
init_stringify();

// node_modules/viem/_esm/utils/promise/withCache.js
var promiseCache = /* @__PURE__ */ new Map();
var responseCache = /* @__PURE__ */ new Map();
function getCache(cacheKey2) {
  const buildCache = (cacheKey3, cache) => ({
    clear: () => cache.delete(cacheKey3),
    get: () => cache.get(cacheKey3),
    set: (data) => cache.set(cacheKey3, data)
  });
  const promise = buildCache(cacheKey2, promiseCache);
  const response = buildCache(cacheKey2, responseCache);
  return {
    clear: () => {
      promise.clear();
      response.clear();
    },
    promise,
    response
  };
}
async function withCache(fn2, { cacheKey: cacheKey2, cacheTime = Number.POSITIVE_INFINITY }) {
  const cache = getCache(cacheKey2);
  const response = cache.response.get();
  if (response && cacheTime > 0) {
    const age = (/* @__PURE__ */ new Date()).getTime() - response.created.getTime();
    if (age < cacheTime)
      return response.data;
  }
  let promise = cache.promise.get();
  if (!promise) {
    promise = fn2();
    cache.promise.set(promise);
  }
  try {
    const data = await promise;
    cache.response.set({ created: /* @__PURE__ */ new Date(), data });
    return data;
  } finally {
    cache.promise.clear();
  }
}

// node_modules/viem/_esm/actions/public/getBlockNumber.js
var cacheKey = (id) => `blockNumber.${id}`;
async function getBlockNumber(client, { cacheTime = client.cacheTime } = {}) {
  const blockNumberHex = await withCache(() => client.request({
    method: "eth_blockNumber"
  }), { cacheKey: cacheKey(client.uid), cacheTime });
  return BigInt(blockNumberHex);
}

// node_modules/viem/_esm/actions/public/getFilterChanges.js
async function getFilterChanges(_client, { filter: filter2 }) {
  const strict = "strict" in filter2 && filter2.strict;
  const logs = await filter2.request({
    method: "eth_getFilterChanges",
    params: [filter2.id]
  });
  if (typeof logs[0] === "string")
    return logs;
  const formattedLogs = logs.map((log) => formatLog(log));
  if (!("abi" in filter2) || !filter2.abi)
    return formattedLogs;
  return parseEventLogs({
    abi: filter2.abi,
    logs: formattedLogs,
    strict
  });
}

// node_modules/viem/_esm/actions/public/uninstallFilter.js
async function uninstallFilter(_client, { filter: filter2 }) {
  return filter2.request({
    method: "eth_uninstallFilter",
    params: [filter2.id]
  });
}

// node_modules/viem/_esm/actions/public/watchContractEvent.js
function watchContractEvent(client, parameters) {
  const { abi: abi2, address, args, batch = true, eventName, fromBlock, onError, onLogs, poll: poll_, pollingInterval = client.pollingInterval, strict: strict_ } = parameters;
  const enablePolling = (() => {
    if (typeof poll_ !== "undefined")
      return poll_;
    if (typeof fromBlock === "bigint")
      return true;
    if (client.transport.type === "webSocket")
      return false;
    if (client.transport.type === "fallback" && client.transport.transports[0].config.type === "webSocket")
      return false;
    return true;
  })();
  const pollContractEvent = () => {
    const strict = strict_ ?? false;
    const observerId = stringify([
      "watchContractEvent",
      address,
      args,
      batch,
      client.uid,
      eventName,
      pollingInterval,
      strict,
      fromBlock
    ]);
    return observe(observerId, { onLogs, onError }, (emit) => {
      let previousBlockNumber;
      if (fromBlock !== void 0)
        previousBlockNumber = fromBlock - 1n;
      let filter2;
      let initialized = false;
      const unwatch = poll(async () => {
        if (!initialized) {
          try {
            filter2 = await getAction(client, createContractEventFilter, "createContractEventFilter")({
              abi: abi2,
              address,
              args,
              eventName,
              strict,
              fromBlock
            });
          } catch {
          }
          initialized = true;
          return;
        }
        try {
          let logs;
          if (filter2) {
            logs = await getAction(client, getFilterChanges, "getFilterChanges")({ filter: filter2 });
          } else {
            const blockNumber = await getAction(client, getBlockNumber, "getBlockNumber")({});
            if (previousBlockNumber && previousBlockNumber < blockNumber) {
              logs = await getAction(client, getContractEvents, "getContractEvents")({
                abi: abi2,
                address,
                args,
                eventName,
                fromBlock: previousBlockNumber + 1n,
                toBlock: blockNumber,
                strict
              });
            } else {
              logs = [];
            }
            previousBlockNumber = blockNumber;
          }
          if (logs.length === 0)
            return;
          if (batch)
            emit.onLogs(logs);
          else
            for (const log of logs)
              emit.onLogs([log]);
        } catch (err) {
          if (filter2 && err instanceof InvalidInputRpcError)
            initialized = false;
          emit.onError?.(err);
        }
      }, {
        emitOnBegin: true,
        interval: pollingInterval
      });
      return async () => {
        if (filter2)
          await getAction(client, uninstallFilter, "uninstallFilter")({ filter: filter2 });
        unwatch();
      };
    });
  };
  const subscribeContractEvent = () => {
    const strict = strict_ ?? false;
    const observerId = stringify([
      "watchContractEvent",
      address,
      args,
      batch,
      client.uid,
      eventName,
      pollingInterval,
      strict
    ]);
    let active = true;
    let unsubscribe = () => active = false;
    return observe(observerId, { onLogs, onError }, (emit) => {
      ;
      (async () => {
        try {
          const transport = (() => {
            if (client.transport.type === "fallback") {
              const transport2 = client.transport.transports.find((transport3) => transport3.config.type === "webSocket");
              if (!transport2)
                return client.transport;
              return transport2.value;
            }
            return client.transport;
          })();
          const topics = eventName ? encodeEventTopics({
            abi: abi2,
            eventName,
            args
          }) : [];
          const { unsubscribe: unsubscribe_ } = await transport.subscribe({
            params: ["logs", { address, topics }],
            onData(data) {
              if (!active)
                return;
              const log = data.result;
              try {
                const { eventName: eventName2, args: args2 } = decodeEventLog({
                  abi: abi2,
                  data: log.data,
                  topics: log.topics,
                  strict: strict_
                });
                const formatted = formatLog(log, {
                  args: args2,
                  eventName: eventName2
                });
                emit.onLogs([formatted]);
              } catch (err) {
                let eventName2;
                let isUnnamed;
                if (err instanceof DecodeLogDataMismatch || err instanceof DecodeLogTopicsMismatch) {
                  if (strict_)
                    return;
                  eventName2 = err.abiItem.name;
                  isUnnamed = err.abiItem.inputs?.some((x4) => !("name" in x4 && x4.name));
                }
                const formatted = formatLog(log, {
                  args: isUnnamed ? [] : {},
                  eventName: eventName2
                });
                emit.onLogs([formatted]);
              }
            },
            onError(error) {
              emit.onError?.(error);
            }
          });
          unsubscribe = unsubscribe_;
          if (!active)
            unsubscribe();
        } catch (err) {
          onError?.(err);
        }
      })();
      return () => unsubscribe();
    });
  };
  return enablePolling ? pollContractEvent() : subscribeContractEvent();
}

// node_modules/viem/_esm/actions/wallet/writeContract.js
init_encodeFunctionData();

// node_modules/viem/_esm/actions/wallet/sendTransaction.js
init_parseAccount();

// node_modules/viem/_esm/errors/account.js
init_base();
var AccountNotFoundError = class extends BaseError2 {
  constructor({ docsPath: docsPath6 } = {}) {
    super([
      "Could not find an Account to execute with this Action.",
      "Please provide an Account with the `account` argument on the Action, or by supplying an `account` to the Client."
    ].join("\n"), {
      docsPath: docsPath6,
      docsSlug: "account"
    });
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "AccountNotFoundError"
    });
  }
};
var AccountTypeNotSupportedError = class extends BaseError2 {
  constructor({ docsPath: docsPath6, metaMessages, type }) {
    super(`Account type "${type}" is not supported.`, {
      docsPath: docsPath6,
      metaMessages
    });
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "AccountTypeNotSupportedError"
    });
  }
};

// node_modules/viem/_esm/utils/chain/assertCurrentChain.js
init_chain();
function assertCurrentChain({ chain, currentChainId }) {
  if (!chain)
    throw new ChainNotFoundError();
  if (currentChainId !== chain.id)
    throw new ChainMismatchError({ chain, currentChainId });
}

// node_modules/viem/_esm/utils/errors/getTransactionError.js
init_node();
init_transaction();
init_getNodeError();
function getTransactionError(err, { docsPath: docsPath6, ...args }) {
  const cause = (() => {
    const cause2 = getNodeError(err, args);
    if (cause2 instanceof UnknownNodeError)
      return err;
    return cause2;
  })();
  return new TransactionExecutionError(cause, {
    docsPath: docsPath6,
    ...args
  });
}

// node_modules/viem/_esm/actions/wallet/sendTransaction.js
init_extract();
init_transactionRequest();
init_assertRequest();

// node_modules/viem/_esm/actions/wallet/sendRawTransaction.js
async function sendRawTransaction(client, { serializedTransaction }) {
  return client.request({
    method: "eth_sendRawTransaction",
    params: [serializedTransaction]
  }, { retryCount: 0 });
}

// node_modules/viem/_esm/actions/wallet/sendTransaction.js
async function sendTransaction(client, parameters) {
  const { account: account_ = client.account, chain = client.chain, accessList, blobs, data, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value, ...rest } = parameters;
  if (!account_)
    throw new AccountNotFoundError({
      docsPath: "/docs/actions/wallet/sendTransaction"
    });
  const account = parseAccount(account_);
  try {
    assertRequest(parameters);
    let chainId;
    if (chain !== null) {
      chainId = await getAction(client, getChainId, "getChainId")({});
      assertCurrentChain({
        currentChainId: chainId,
        chain
      });
    }
    if (account.type === "json-rpc") {
      const chainFormat = client.chain?.formatters?.transactionRequest?.format;
      const format = chainFormat || formatTransactionRequest;
      const request = format({
        // Pick out extra data that might exist on the chain's transaction request type.
        ...extract(rest, { format: chainFormat }),
        accessList,
        blobs,
        chainId,
        data,
        from: account.address,
        gas,
        gasPrice,
        maxFeePerBlobGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        to,
        value
      });
      return await client.request({
        method: "eth_sendTransaction",
        params: [request]
      }, { retryCount: 0 });
    }
    if (account.type === "local") {
      const request = await getAction(client, prepareTransactionRequest, "prepareTransactionRequest")({
        account,
        accessList,
        blobs,
        chain,
        chainId,
        data,
        gas,
        gasPrice,
        maxFeePerBlobGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        parameters: [...defaultParameters, "sidecars"],
        to,
        value,
        ...rest
      });
      const serializer = chain?.serializers?.transaction;
      const serializedTransaction = await account.signTransaction(request, {
        serializer
      });
      return await getAction(client, sendRawTransaction, "sendRawTransaction")({
        serializedTransaction
      });
    }
    if (account.type === "smart")
      throw new AccountTypeNotSupportedError({
        metaMessages: [
          "Consider using the `sendUserOperation` Action instead."
        ],
        docsPath: "/docs/actions/bundler/sendUserOperation",
        type: "smart"
      });
    throw new Error("incompatible account type.");
  } catch (err) {
    if (err instanceof AccountTypeNotSupportedError)
      throw err;
    throw getTransactionError(err, {
      ...parameters,
      account,
      chain: parameters.chain || void 0
    });
  }
}

// node_modules/viem/_esm/actions/wallet/writeContract.js
async function writeContract(client, parameters) {
  const { abi: abi2, address, args, dataSuffix, functionName, ...request } = parameters;
  const data = encodeFunctionData({
    abi: abi2,
    args,
    functionName
  });
  return getAction(client, sendTransaction, "sendTransaction")({
    data: `${data}${dataSuffix ? dataSuffix.replace("0x", "") : ""}`,
    to: address,
    ...request
  });
}

// node_modules/viem/_esm/actions/getContract.js
function getContract({ abi: abi2, address, client: client_ }) {
  const client = client_;
  const [publicClient, walletClient] = (() => {
    if (!client)
      return [void 0, void 0];
    if ("public" in client && "wallet" in client)
      return [client.public, client.wallet];
    if ("public" in client)
      return [client.public, void 0];
    if ("wallet" in client)
      return [void 0, client.wallet];
    return [client, client];
  })();
  const hasPublicClient = publicClient !== void 0 && publicClient !== null;
  const hasWalletClient = walletClient !== void 0 && walletClient !== null;
  const contract = {};
  let hasReadFunction = false;
  let hasWriteFunction = false;
  let hasEvent = false;
  for (const item of abi2) {
    if (item.type === "function")
      if (item.stateMutability === "view" || item.stateMutability === "pure")
        hasReadFunction = true;
      else
        hasWriteFunction = true;
    else if (item.type === "event")
      hasEvent = true;
    if (hasReadFunction && hasWriteFunction && hasEvent)
      break;
  }
  if (hasPublicClient) {
    if (hasReadFunction)
      contract.read = new Proxy({}, {
        get(_4, functionName) {
          return (...parameters) => {
            const { args, options } = getFunctionParameters(parameters);
            return getAction(publicClient, readContract, "readContract")({
              abi: abi2,
              address,
              functionName,
              args,
              ...options
            });
          };
        }
      });
    if (hasWriteFunction)
      contract.simulate = new Proxy({}, {
        get(_4, functionName) {
          return (...parameters) => {
            const { args, options } = getFunctionParameters(parameters);
            return getAction(publicClient, simulateContract, "simulateContract")({
              abi: abi2,
              address,
              functionName,
              args,
              ...options
            });
          };
        }
      });
    if (hasEvent) {
      contract.createEventFilter = new Proxy({}, {
        get(_4, eventName) {
          return (...parameters) => {
            const abiEvent = abi2.find((x4) => x4.type === "event" && x4.name === eventName);
            const { args, options } = getEventParameters(parameters, abiEvent);
            return getAction(publicClient, createContractEventFilter, "createContractEventFilter")({
              abi: abi2,
              address,
              eventName,
              args,
              ...options
            });
          };
        }
      });
      contract.getEvents = new Proxy({}, {
        get(_4, eventName) {
          return (...parameters) => {
            const abiEvent = abi2.find((x4) => x4.type === "event" && x4.name === eventName);
            const { args, options } = getEventParameters(parameters, abiEvent);
            return getAction(publicClient, getContractEvents, "getContractEvents")({
              abi: abi2,
              address,
              eventName,
              args,
              ...options
            });
          };
        }
      });
      contract.watchEvent = new Proxy({}, {
        get(_4, eventName) {
          return (...parameters) => {
            const abiEvent = abi2.find((x4) => x4.type === "event" && x4.name === eventName);
            const { args, options } = getEventParameters(parameters, abiEvent);
            return getAction(publicClient, watchContractEvent, "watchContractEvent")({
              abi: abi2,
              address,
              eventName,
              args,
              ...options
            });
          };
        }
      });
    }
  }
  if (hasWalletClient) {
    if (hasWriteFunction)
      contract.write = new Proxy({}, {
        get(_4, functionName) {
          return (...parameters) => {
            const { args, options } = getFunctionParameters(parameters);
            return getAction(walletClient, writeContract, "writeContract")({
              abi: abi2,
              address,
              functionName,
              args,
              ...options
            });
          };
        }
      });
  }
  if (hasPublicClient || hasWalletClient) {
    if (hasWriteFunction)
      contract.estimateGas = new Proxy({}, {
        get(_4, functionName) {
          return (...parameters) => {
            const { args, options } = getFunctionParameters(parameters);
            const client2 = publicClient ?? walletClient;
            return getAction(client2, estimateContractGas, "estimateContractGas")({
              abi: abi2,
              address,
              functionName,
              args,
              ...options,
              account: options.account ?? walletClient.account
            });
          };
        }
      });
  }
  contract.address = address;
  contract.abi = abi2;
  return contract;
}
function getFunctionParameters(values) {
  const hasArgs = values.length && Array.isArray(values[0]);
  const args = hasArgs ? values[0] : [];
  const options = (hasArgs ? values[1] : values[0]) ?? {};
  return { args, options };
}
function getEventParameters(values, abiEvent) {
  let hasArgs = false;
  if (Array.isArray(values[0]))
    hasArgs = true;
  else if (values.length === 1) {
    hasArgs = abiEvent.inputs.some((x4) => x4.indexed);
  } else if (values.length === 2) {
    hasArgs = true;
  }
  const args = hasArgs ? values[0] : void 0;
  const options = (hasArgs ? values[1] : values[0]) ?? {};
  return { args, options };
}

// node_modules/viem/_esm/errors/eip712.js
init_base();
var Eip712DomainNotFoundError = class extends BaseError2 {
  constructor({ address }) {
    super(`No EIP-712 domain found on contract "${address}".`, {
      metaMessages: [
        "Ensure that:",
        `- The contract is deployed at the address "${address}".`,
        "- `eip712Domain()` function exists on the contract.",
        "- `eip712Domain()` function matches signature to ERC-5267 specification."
      ]
    });
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "Eip712DomainNotFoundError"
    });
  }
};

// node_modules/viem/_esm/actions/public/getEip712Domain.js
async function getEip712Domain(client, parameters) {
  const { address, factory: factory2, factoryData } = parameters;
  try {
    const [fields, name, version3, chainId, verifyingContract, salt, extensions] = await getAction(client, readContract, "readContract")({
      abi,
      address,
      functionName: "eip712Domain",
      factory: factory2,
      factoryData
    });
    return {
      domain: {
        name,
        version: version3,
        chainId: Number(chainId),
        verifyingContract,
        salt
      },
      extensions,
      fields
    };
  } catch (e3) {
    const error = e3;
    if (error.name === "ContractFunctionExecutionError" && error.cause.name === "ContractFunctionZeroDataError") {
      throw new Eip712DomainNotFoundError({ address });
    }
    throw error;
  }
}
var abi = [
  {
    inputs: [],
    name: "eip712Domain",
    outputs: [
      { name: "fields", type: "bytes1" },
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
      { name: "salt", type: "bytes32" },
      { name: "extensions", type: "uint256[]" }
    ],
    stateMutability: "view",
    type: "function"
  }
];

// node_modules/viem/_esm/clients/createClient.js
init_parseAccount();

// node_modules/viem/_esm/utils/uid.js
var size2 = 256;
var index = size2;
var buffer;
function uid(length = 11) {
  if (!buffer || index + length > size2 * 2) {
    buffer = "";
    index = 0;
    for (let i3 = 0; i3 < size2; i3++) {
      buffer += (256 + Math.random() * 256 | 0).toString(16).substring(1);
    }
  }
  return buffer.substring(index, index++ + length);
}

// node_modules/viem/_esm/clients/createClient.js
function createClient(parameters) {
  const { batch, cacheTime = parameters.pollingInterval ?? 4e3, ccipRead, key = "base", name = "Base Client", pollingInterval = 4e3, type = "base" } = parameters;
  const chain = parameters.chain;
  const account = parameters.account ? parseAccount(parameters.account) : void 0;
  const { config, request, value } = parameters.transport({
    chain,
    pollingInterval
  });
  const transport = { ...config, ...value };
  const client = {
    account,
    batch,
    cacheTime,
    ccipRead,
    chain,
    key,
    name,
    pollingInterval,
    request,
    transport,
    type,
    uid: uid()
  };
  function extend2(base) {
    return (extendFn) => {
      const extended = extendFn(base);
      for (const key2 in client)
        delete extended[key2];
      const combined = { ...base, ...extended };
      return Object.assign(combined, { extend: extend2(combined) });
    };
  }
  return Object.assign(client, { extend: extend2(client) });
}

// node_modules/viem/_esm/utils/buildRequest.js
init_base();
init_request();
init_rpc();
init_toHex();
init_keccak256();

// node_modules/viem/_esm/utils/promise/withDedupe.js
init_lru();
var promiseCache2 = /* @__PURE__ */ new LruMap(8192);
function withDedupe(fn2, { enabled = true, id }) {
  if (!enabled || !id)
    return fn2();
  if (promiseCache2.get(id))
    return promiseCache2.get(id);
  const promise = fn2().finally(() => promiseCache2.delete(id));
  promiseCache2.set(id, promise);
  return promise;
}

// node_modules/viem/_esm/utils/promise/withRetry.js
function withRetry(fn2, { delay: delay_ = 100, retryCount = 2, shouldRetry: shouldRetry2 = () => true } = {}) {
  return new Promise((resolve, reject) => {
    const attemptRetry = async ({ count = 0 } = {}) => {
      const retry = async ({ error }) => {
        const delay = typeof delay_ === "function" ? delay_({ count, error }) : delay_;
        if (delay)
          await wait(delay);
        attemptRetry({ count: count + 1 });
      };
      try {
        const data = await fn2();
        resolve(data);
      } catch (err) {
        if (count < retryCount && await shouldRetry2({ count, error: err }))
          return retry({ error: err });
        reject(err);
      }
    };
    attemptRetry();
  });
}

// node_modules/viem/_esm/utils/buildRequest.js
init_stringify();
function buildRequest(request, options = {}) {
  return async (args, overrideOptions = {}) => {
    const { dedupe = false, retryDelay = 150, retryCount = 3, uid: uid2 } = {
      ...options,
      ...overrideOptions
    };
    const requestId = dedupe ? keccak256(stringToHex(`${uid2}.${stringify(args)}`)) : void 0;
    return withDedupe(() => withRetry(async () => {
      try {
        return await request(args);
      } catch (err_) {
        const err = err_;
        switch (err.code) {
          // -32700
          case ParseRpcError.code:
            throw new ParseRpcError(err);
          // -32600
          case InvalidRequestRpcError.code:
            throw new InvalidRequestRpcError(err);
          // -32601
          case MethodNotFoundRpcError.code:
            throw new MethodNotFoundRpcError(err, { method: args.method });
          // -32602
          case InvalidParamsRpcError.code:
            throw new InvalidParamsRpcError(err);
          // -32603
          case InternalRpcError.code:
            throw new InternalRpcError(err);
          // -32000
          case InvalidInputRpcError.code:
            throw new InvalidInputRpcError(err);
          // -32001
          case ResourceNotFoundRpcError.code:
            throw new ResourceNotFoundRpcError(err);
          // -32002
          case ResourceUnavailableRpcError.code:
            throw new ResourceUnavailableRpcError(err);
          // -32003
          case TransactionRejectedRpcError.code:
            throw new TransactionRejectedRpcError(err);
          // -32004
          case MethodNotSupportedRpcError.code:
            throw new MethodNotSupportedRpcError(err, {
              method: args.method
            });
          // -32005
          case LimitExceededRpcError.code:
            throw new LimitExceededRpcError(err);
          // -32006
          case JsonRpcVersionUnsupportedError.code:
            throw new JsonRpcVersionUnsupportedError(err);
          // 4001
          case UserRejectedRequestError.code:
            throw new UserRejectedRequestError(err);
          // 4100
          case UnauthorizedProviderError.code:
            throw new UnauthorizedProviderError(err);
          // 4200
          case UnsupportedProviderMethodError.code:
            throw new UnsupportedProviderMethodError(err);
          // 4900
          case ProviderDisconnectedError.code:
            throw new ProviderDisconnectedError(err);
          // 4901
          case ChainDisconnectedError.code:
            throw new ChainDisconnectedError(err);
          // 4902
          case SwitchChainError.code:
            throw new SwitchChainError(err);
          // CAIP-25: User Rejected Error
          // https://docs.walletconnect.com/2.0/specs/clients/sign/error-codes#rejected-caip-25
          case 5e3:
            throw new UserRejectedRequestError(err);
          default:
            if (err_ instanceof BaseError2)
              throw err_;
            throw new UnknownRpcError(err);
        }
      }
    }, {
      delay: ({ count, error }) => {
        if (error && error instanceof HttpRequestError) {
          const retryAfter = error?.headers?.get("Retry-After");
          if (retryAfter?.match(/\d/))
            return Number.parseInt(retryAfter) * 1e3;
        }
        return ~~(1 << count) * retryDelay;
      },
      retryCount,
      shouldRetry: ({ error }) => shouldRetry(error)
    }), { enabled: dedupe, id: requestId });
  };
}
function shouldRetry(error) {
  if ("code" in error && typeof error.code === "number") {
    if (error.code === -1)
      return true;
    if (error.code === LimitExceededRpcError.code)
      return true;
    if (error.code === InternalRpcError.code)
      return true;
    return false;
  }
  if (error instanceof HttpRequestError && error.status) {
    if (error.status === 403)
      return true;
    if (error.status === 408)
      return true;
    if (error.status === 413)
      return true;
    if (error.status === 429)
      return true;
    if (error.status === 500)
      return true;
    if (error.status === 502)
      return true;
    if (error.status === 503)
      return true;
    if (error.status === 504)
      return true;
    return false;
  }
  return true;
}

// node_modules/viem/_esm/clients/transports/createTransport.js
function createTransport({ key, name, request, retryCount = 3, retryDelay = 150, timeout, type }, value) {
  const uid2 = uid();
  return {
    config: {
      key,
      name,
      request,
      retryCount,
      retryDelay,
      timeout,
      type
    },
    request: buildRequest(request, { retryCount, retryDelay, uid: uid2 }),
    value
  };
}

// node_modules/viem/_esm/clients/transports/http.js
init_request();

// node_modules/viem/_esm/errors/transport.js
init_base();
var UrlRequiredError = class extends BaseError2 {
  constructor() {
    super("No URL was provided to the Transport. Please provide a valid RPC URL to the Transport.", {
      docsPath: "/docs/clients/intro"
    });
  }
};

// node_modules/viem/_esm/clients/transports/http.js
init_createBatchScheduler();

// node_modules/viem/_esm/utils/rpc/http.js
init_request();

// node_modules/viem/_esm/utils/promise/withTimeout.js
function withTimeout(fn2, { errorInstance = new Error("timed out"), timeout, signal }) {
  return new Promise((resolve, reject) => {
    ;
    (async () => {
      let timeoutId;
      try {
        const controller = new AbortController();
        if (timeout > 0) {
          timeoutId = setTimeout(() => {
            if (signal) {
              controller.abort();
            } else {
              reject(errorInstance);
            }
          }, timeout);
        }
        resolve(await fn2({ signal: controller?.signal || null }));
      } catch (err) {
        if (err?.name === "AbortError")
          reject(errorInstance);
        reject(err);
      } finally {
        clearTimeout(timeoutId);
      }
    })();
  });
}

// node_modules/viem/_esm/utils/rpc/http.js
init_stringify();

// node_modules/viem/_esm/utils/rpc/id.js
function createIdStore() {
  return {
    current: 0,
    take() {
      return this.current++;
    },
    reset() {
      this.current = 0;
    }
  };
}
var idCache = /* @__PURE__ */ createIdStore();

// node_modules/viem/_esm/utils/rpc/http.js
function getHttpRpcClient(url, options = {}) {
  return {
    async request(params) {
      const { body, onRequest = options.onRequest, onResponse = options.onResponse, timeout = options.timeout ?? 1e4 } = params;
      const fetchOptions = {
        ...options.fetchOptions ?? {},
        ...params.fetchOptions ?? {}
      };
      const { headers, method, signal: signal_ } = fetchOptions;
      try {
        const response = await withTimeout(async ({ signal }) => {
          const init = {
            ...fetchOptions,
            body: Array.isArray(body) ? stringify(body.map((body2) => ({
              jsonrpc: "2.0",
              id: body2.id ?? idCache.take(),
              ...body2
            }))) : stringify({
              jsonrpc: "2.0",
              id: body.id ?? idCache.take(),
              ...body
            }),
            headers: {
              "Content-Type": "application/json",
              ...headers
            },
            method: method || "POST",
            signal: signal_ || (timeout > 0 ? signal : null)
          };
          const request = new Request(url, init);
          if (onRequest)
            await onRequest(request);
          const response2 = await fetch(url, init);
          return response2;
        }, {
          errorInstance: new TimeoutError({ body, url }),
          timeout,
          signal: true
        });
        if (onResponse)
          await onResponse(response);
        let data;
        if (response.headers.get("Content-Type")?.startsWith("application/json"))
          data = await response.json();
        else {
          data = await response.text();
          data = JSON.parse(data || "{}");
        }
        if (!response.ok) {
          throw new HttpRequestError({
            body,
            details: stringify(data.error) || response.statusText,
            headers: response.headers,
            status: response.status,
            url
          });
        }
        return data;
      } catch (err) {
        if (err instanceof HttpRequestError)
          throw err;
        if (err instanceof TimeoutError)
          throw err;
        throw new HttpRequestError({
          body,
          cause: err,
          url
        });
      }
    }
  };
}

// node_modules/viem/_esm/clients/transports/http.js
function http(url, config = {}) {
  const { batch, fetchOptions, key = "http", name = "HTTP JSON-RPC", onFetchRequest, onFetchResponse, retryDelay } = config;
  return ({ chain, retryCount: retryCount_, timeout: timeout_ }) => {
    const { batchSize = 1e3, wait: wait2 = 0 } = typeof batch === "object" ? batch : {};
    const retryCount = config.retryCount ?? retryCount_;
    const timeout = timeout_ ?? config.timeout ?? 1e4;
    const url_ = url || chain?.rpcUrls.default.http[0];
    if (!url_)
      throw new UrlRequiredError();
    const rpcClient = getHttpRpcClient(url_, {
      fetchOptions,
      onRequest: onFetchRequest,
      onResponse: onFetchResponse,
      timeout
    });
    return createTransport({
      key,
      name,
      async request({ method, params }) {
        const body = { method, params };
        const { schedule } = createBatchScheduler({
          id: url_,
          wait: wait2,
          shouldSplitBatch(requests) {
            return requests.length > batchSize;
          },
          fn: (body2) => rpcClient.request({
            body: body2
          }),
          sort: (a3, b4) => a3.id - b4.id
        });
        const fn2 = async (body2) => batch ? schedule(body2) : [
          await rpcClient.request({
            body: body2
          })
        ];
        const [{ error, result }] = await fn2(body);
        if (error)
          throw new RpcRequestError({
            body,
            error,
            url: url_
          });
        return result;
      },
      retryCount,
      retryDelay,
      timeout,
      type: "http"
    }, {
      fetchOptions,
      url: url_
    });
  };
}

// node_modules/viem/_esm/actions/ens/getEnsAddress.js
init_abis();
init_decodeFunctionResult();
init_encodeFunctionData();
init_getChainContractAddress();
init_trim();
init_toHex();

// node_modules/viem/_esm/utils/ens/errors.js
init_solidity();
init_base();
init_contract();
function isNullUniversalResolverError(err, callType) {
  if (!(err instanceof BaseError2))
    return false;
  const cause = err.walk((e3) => e3 instanceof ContractFunctionRevertedError);
  if (!(cause instanceof ContractFunctionRevertedError))
    return false;
  if (cause.data?.errorName === "ResolverNotFound")
    return true;
  if (cause.data?.errorName === "ResolverWildcardNotSupported")
    return true;
  if (cause.data?.errorName === "ResolverNotContract")
    return true;
  if (cause.data?.errorName === "ResolverError")
    return true;
  if (cause.data?.errorName === "HttpError")
    return true;
  if (cause.reason?.includes("Wildcard on non-extended resolvers is not supported"))
    return true;
  if (callType === "reverse" && cause.reason === panicReasons[50])
    return true;
  return false;
}

// node_modules/viem/_esm/utils/ens/namehash.js
init_concat();
init_toBytes();
init_toHex();
init_keccak256();

// node_modules/viem/_esm/utils/ens/encodedLabelToLabelhash.js
init_isHex();
function encodedLabelToLabelhash(label) {
  if (label.length !== 66)
    return null;
  if (label.indexOf("[") !== 0)
    return null;
  if (label.indexOf("]") !== 65)
    return null;
  const hash3 = `0x${label.slice(1, 65)}`;
  if (!isHex(hash3))
    return null;
  return hash3;
}

// node_modules/viem/_esm/utils/ens/namehash.js
function namehash(name) {
  let result = new Uint8Array(32).fill(0);
  if (!name)
    return bytesToHex(result);
  const labels = name.split(".");
  for (let i3 = labels.length - 1; i3 >= 0; i3 -= 1) {
    const hashFromEncodedLabel = encodedLabelToLabelhash(labels[i3]);
    const hashed = hashFromEncodedLabel ? toBytes(hashFromEncodedLabel) : keccak256(stringToBytes(labels[i3]), "bytes");
    result = keccak256(concat([result, hashed]), "bytes");
  }
  return bytesToHex(result);
}

// node_modules/viem/_esm/utils/ens/packetToBytes.js
init_toBytes();

// node_modules/viem/_esm/utils/ens/encodeLabelhash.js
function encodeLabelhash(hash3) {
  return `[${hash3.slice(2)}]`;
}

// node_modules/viem/_esm/utils/ens/labelhash.js
init_toBytes();
init_toHex();
init_keccak256();
function labelhash(label) {
  const result = new Uint8Array(32).fill(0);
  if (!label)
    return bytesToHex(result);
  return encodedLabelToLabelhash(label) || keccak256(stringToBytes(label));
}

// node_modules/viem/_esm/utils/ens/packetToBytes.js
function packetToBytes(packet) {
  const value = packet.replace(/^\.|\.$/gm, "");
  if (value.length === 0)
    return new Uint8Array(1);
  const bytes2 = new Uint8Array(stringToBytes(value).byteLength + 2);
  let offset = 0;
  const list = value.split(".");
  for (let i3 = 0; i3 < list.length; i3++) {
    let encoded = stringToBytes(list[i3]);
    if (encoded.byteLength > 255)
      encoded = stringToBytes(encodeLabelhash(labelhash(list[i3])));
    bytes2[offset] = encoded.length;
    bytes2.set(encoded, offset + 1);
    offset += encoded.length + 1;
  }
  if (bytes2.byteLength !== offset + 1)
    return bytes2.slice(0, offset + 1);
  return bytes2;
}

// node_modules/viem/_esm/actions/ens/getEnsAddress.js
async function getEnsAddress(client, { blockNumber, blockTag, coinType, name, gatewayUrls, strict, universalResolverAddress: universalResolverAddress_ }) {
  let universalResolverAddress = universalResolverAddress_;
  if (!universalResolverAddress) {
    if (!client.chain)
      throw new Error("client chain not configured. universalResolverAddress is required.");
    universalResolverAddress = getChainContractAddress({
      blockNumber,
      chain: client.chain,
      contract: "ensUniversalResolver"
    });
  }
  try {
    const functionData = encodeFunctionData({
      abi: addressResolverAbi,
      functionName: "addr",
      ...coinType != null ? { args: [namehash(name), BigInt(coinType)] } : { args: [namehash(name)] }
    });
    const readContractParameters = {
      address: universalResolverAddress,
      abi: universalResolverResolveAbi,
      functionName: "resolve",
      args: [toHex(packetToBytes(name)), functionData],
      blockNumber,
      blockTag
    };
    const readContractAction = getAction(client, readContract, "readContract");
    const res = gatewayUrls ? await readContractAction({
      ...readContractParameters,
      args: [...readContractParameters.args, gatewayUrls]
    }) : await readContractAction(readContractParameters);
    if (res[0] === "0x")
      return null;
    const address = decodeFunctionResult({
      abi: addressResolverAbi,
      args: coinType != null ? [namehash(name), BigInt(coinType)] : void 0,
      functionName: "addr",
      data: res[0]
    });
    if (address === "0x")
      return null;
    if (trim2(address) === "0x00")
      return null;
    return address;
  } catch (err) {
    if (strict)
      throw err;
    if (isNullUniversalResolverError(err, "resolve"))
      return null;
    throw err;
  }
}

// node_modules/viem/_esm/errors/ens.js
init_base();
var EnsAvatarInvalidMetadataError = class extends BaseError2 {
  constructor({ data }) {
    super("Unable to extract image from metadata. The metadata may be malformed or invalid.", {
      metaMessages: [
        "- Metadata must be a JSON object with at least an `image`, `image_url` or `image_data` property.",
        "",
        `Provided data: ${JSON.stringify(data)}`
      ]
    });
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "EnsAvatarInvalidMetadataError"
    });
  }
};
var EnsAvatarInvalidNftUriError = class extends BaseError2 {
  constructor({ reason }) {
    super(`ENS NFT avatar URI is invalid. ${reason}`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "EnsAvatarInvalidNftUriError"
    });
  }
};
var EnsAvatarUriResolutionError = class extends BaseError2 {
  constructor({ uri }) {
    super(`Unable to resolve ENS avatar URI "${uri}". The URI may be malformed, invalid, or does not respond with a valid image.`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "EnsAvatarUriResolutionError"
    });
  }
};
var EnsAvatarUnsupportedNamespaceError = class extends BaseError2 {
  constructor({ namespace }) {
    super(`ENS NFT avatar namespace "${namespace}" is not supported. Must be "erc721" or "erc1155".`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "EnsAvatarUnsupportedNamespaceError"
    });
  }
};

// node_modules/viem/_esm/utils/ens/avatar/utils.js
var networkRegex = /(?<protocol>https?:\/\/[^\/]*|ipfs:\/|ipns:\/|ar:\/)?(?<root>\/)?(?<subpath>ipfs\/|ipns\/)?(?<target>[\w\-.]+)(?<subtarget>\/.*)?/;
var ipfsHashRegex = /^(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})(\/(?<target>[\w\-.]+))?(?<subtarget>\/.*)?$/;
var base64Regex = /^data:([a-zA-Z\-/+]*);base64,([^"].*)/;
var dataURIRegex = /^data:([a-zA-Z\-/+]*)?(;[a-zA-Z0-9].*?)?(,)/;
async function isImageUri(uri) {
  try {
    const res = await fetch(uri, { method: "HEAD" });
    if (res.status === 200) {
      const contentType = res.headers.get("content-type");
      return contentType?.startsWith("image/");
    }
    return false;
  } catch (error) {
    if (typeof error === "object" && typeof error.response !== "undefined") {
      return false;
    }
    if (!globalThis.hasOwnProperty("Image"))
      return false;
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve(true);
      };
      img.onerror = () => {
        resolve(false);
      };
      img.src = uri;
    });
  }
}
function getGateway(custom, defaultGateway) {
  if (!custom)
    return defaultGateway;
  if (custom.endsWith("/"))
    return custom.slice(0, -1);
  return custom;
}
function resolveAvatarUri({ uri, gatewayUrls }) {
  const isEncoded = base64Regex.test(uri);
  if (isEncoded)
    return { uri, isOnChain: true, isEncoded };
  const ipfsGateway = getGateway(gatewayUrls?.ipfs, "https://ipfs.io");
  const arweaveGateway = getGateway(gatewayUrls?.arweave, "https://arweave.net");
  const networkRegexMatch = uri.match(networkRegex);
  const { protocol, subpath, target, subtarget = "" } = networkRegexMatch?.groups || {};
  const isIPNS = protocol === "ipns:/" || subpath === "ipns/";
  const isIPFS = protocol === "ipfs:/" || subpath === "ipfs/" || ipfsHashRegex.test(uri);
  if (uri.startsWith("http") && !isIPNS && !isIPFS) {
    let replacedUri = uri;
    if (gatewayUrls?.arweave)
      replacedUri = uri.replace(/https:\/\/arweave.net/g, gatewayUrls?.arweave);
    return { uri: replacedUri, isOnChain: false, isEncoded: false };
  }
  if ((isIPNS || isIPFS) && target) {
    return {
      uri: `${ipfsGateway}/${isIPNS ? "ipns" : "ipfs"}/${target}${subtarget}`,
      isOnChain: false,
      isEncoded: false
    };
  }
  if (protocol === "ar:/" && target) {
    return {
      uri: `${arweaveGateway}/${target}${subtarget || ""}`,
      isOnChain: false,
      isEncoded: false
    };
  }
  let parsedUri = uri.replace(dataURIRegex, "");
  if (parsedUri.startsWith("<svg")) {
    parsedUri = `data:image/svg+xml;base64,${btoa(parsedUri)}`;
  }
  if (parsedUri.startsWith("data:") || parsedUri.startsWith("{")) {
    return {
      uri: parsedUri,
      isOnChain: true,
      isEncoded: false
    };
  }
  throw new EnsAvatarUriResolutionError({ uri });
}
function getJsonImage(data) {
  if (typeof data !== "object" || !("image" in data) && !("image_url" in data) && !("image_data" in data)) {
    throw new EnsAvatarInvalidMetadataError({ data });
  }
  return data.image || data.image_url || data.image_data;
}
async function getMetadataAvatarUri({ gatewayUrls, uri }) {
  try {
    const res = await fetch(uri).then((res2) => res2.json());
    const image = await parseAvatarUri({
      gatewayUrls,
      uri: getJsonImage(res)
    });
    return image;
  } catch {
    throw new EnsAvatarUriResolutionError({ uri });
  }
}
async function parseAvatarUri({ gatewayUrls, uri }) {
  const { uri: resolvedURI, isOnChain } = resolveAvatarUri({ uri, gatewayUrls });
  if (isOnChain)
    return resolvedURI;
  const isImage = await isImageUri(resolvedURI);
  if (isImage)
    return resolvedURI;
  throw new EnsAvatarUriResolutionError({ uri });
}
function parseNftUri(uri_) {
  let uri = uri_;
  if (uri.startsWith("did:nft:")) {
    uri = uri.replace("did:nft:", "").replace(/_/g, "/");
  }
  const [reference, asset_namespace, tokenID] = uri.split("/");
  const [eip_namespace, chainID] = reference.split(":");
  const [erc_namespace, contractAddress] = asset_namespace.split(":");
  if (!eip_namespace || eip_namespace.toLowerCase() !== "eip155")
    throw new EnsAvatarInvalidNftUriError({ reason: "Only EIP-155 supported" });
  if (!chainID)
    throw new EnsAvatarInvalidNftUriError({ reason: "Chain ID not found" });
  if (!contractAddress)
    throw new EnsAvatarInvalidNftUriError({
      reason: "Contract address not found"
    });
  if (!tokenID)
    throw new EnsAvatarInvalidNftUriError({ reason: "Token ID not found" });
  if (!erc_namespace)
    throw new EnsAvatarInvalidNftUriError({ reason: "ERC namespace not found" });
  return {
    chainID: Number.parseInt(chainID),
    namespace: erc_namespace.toLowerCase(),
    contractAddress,
    tokenID
  };
}
async function getNftTokenUri(client, { nft }) {
  if (nft.namespace === "erc721") {
    return readContract(client, {
      address: nft.contractAddress,
      abi: [
        {
          name: "tokenURI",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "tokenId", type: "uint256" }],
          outputs: [{ name: "", type: "string" }]
        }
      ],
      functionName: "tokenURI",
      args: [BigInt(nft.tokenID)]
    });
  }
  if (nft.namespace === "erc1155") {
    return readContract(client, {
      address: nft.contractAddress,
      abi: [
        {
          name: "uri",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "_id", type: "uint256" }],
          outputs: [{ name: "", type: "string" }]
        }
      ],
      functionName: "uri",
      args: [BigInt(nft.tokenID)]
    });
  }
  throw new EnsAvatarUnsupportedNamespaceError({ namespace: nft.namespace });
}

// node_modules/viem/_esm/utils/ens/avatar/parseAvatarRecord.js
async function parseAvatarRecord(client, { gatewayUrls, record }) {
  if (/eip155:/i.test(record))
    return parseNftAvatarUri(client, { gatewayUrls, record });
  return parseAvatarUri({ uri: record, gatewayUrls });
}
async function parseNftAvatarUri(client, { gatewayUrls, record }) {
  const nft = parseNftUri(record);
  const nftUri = await getNftTokenUri(client, { nft });
  const { uri: resolvedNftUri, isOnChain, isEncoded } = resolveAvatarUri({ uri: nftUri, gatewayUrls });
  if (isOnChain && (resolvedNftUri.includes("data:application/json;base64,") || resolvedNftUri.startsWith("{"))) {
    const encodedJson = isEncoded ? (
      // if it is encoded, decode it
      atob(resolvedNftUri.replace("data:application/json;base64,", ""))
    ) : (
      // if it isn't encoded assume it is a JSON string, but it could be anything (it will error if it is)
      resolvedNftUri
    );
    const decoded = JSON.parse(encodedJson);
    return parseAvatarUri({ uri: getJsonImage(decoded), gatewayUrls });
  }
  let uriTokenId = nft.tokenID;
  if (nft.namespace === "erc1155")
    uriTokenId = uriTokenId.replace("0x", "").padStart(64, "0");
  return getMetadataAvatarUri({
    gatewayUrls,
    uri: resolvedNftUri.replace(/(?:0x)?{id}/, uriTokenId)
  });
}

// node_modules/viem/_esm/actions/ens/getEnsText.js
init_abis();
init_decodeFunctionResult();
init_encodeFunctionData();
init_getChainContractAddress();
init_toHex();
async function getEnsText(client, { blockNumber, blockTag, name, key, gatewayUrls, strict, universalResolverAddress: universalResolverAddress_ }) {
  let universalResolverAddress = universalResolverAddress_;
  if (!universalResolverAddress) {
    if (!client.chain)
      throw new Error("client chain not configured. universalResolverAddress is required.");
    universalResolverAddress = getChainContractAddress({
      blockNumber,
      chain: client.chain,
      contract: "ensUniversalResolver"
    });
  }
  try {
    const readContractParameters = {
      address: universalResolverAddress,
      abi: universalResolverResolveAbi,
      functionName: "resolve",
      args: [
        toHex(packetToBytes(name)),
        encodeFunctionData({
          abi: textResolverAbi,
          functionName: "text",
          args: [namehash(name), key]
        })
      ],
      blockNumber,
      blockTag
    };
    const readContractAction = getAction(client, readContract, "readContract");
    const res = gatewayUrls ? await readContractAction({
      ...readContractParameters,
      args: [...readContractParameters.args, gatewayUrls]
    }) : await readContractAction(readContractParameters);
    if (res[0] === "0x")
      return null;
    const record = decodeFunctionResult({
      abi: textResolverAbi,
      functionName: "text",
      data: res[0]
    });
    return record === "" ? null : record;
  } catch (err) {
    if (strict)
      throw err;
    if (isNullUniversalResolverError(err, "resolve"))
      return null;
    throw err;
  }
}

// node_modules/viem/_esm/actions/ens/getEnsAvatar.js
async function getEnsAvatar(client, { blockNumber, blockTag, assetGatewayUrls, name, gatewayUrls, strict, universalResolverAddress }) {
  const record = await getAction(client, getEnsText, "getEnsText")({
    blockNumber,
    blockTag,
    key: "avatar",
    name,
    universalResolverAddress,
    gatewayUrls,
    strict
  });
  if (!record)
    return null;
  try {
    return await parseAvatarRecord(client, {
      record,
      gatewayUrls: assetGatewayUrls
    });
  } catch {
    return null;
  }
}

// node_modules/viem/_esm/actions/ens/getEnsName.js
init_abis();
init_getChainContractAddress();
init_toHex();
async function getEnsName(client, { address, blockNumber, blockTag, gatewayUrls, strict, universalResolverAddress: universalResolverAddress_ }) {
  let universalResolverAddress = universalResolverAddress_;
  if (!universalResolverAddress) {
    if (!client.chain)
      throw new Error("client chain not configured. universalResolverAddress is required.");
    universalResolverAddress = getChainContractAddress({
      blockNumber,
      chain: client.chain,
      contract: "ensUniversalResolver"
    });
  }
  const reverseNode = `${address.toLowerCase().substring(2)}.addr.reverse`;
  try {
    const readContractParameters = {
      address: universalResolverAddress,
      abi: universalResolverReverseAbi,
      functionName: "reverse",
      args: [toHex(packetToBytes(reverseNode))],
      blockNumber,
      blockTag
    };
    const readContractAction = getAction(client, readContract, "readContract");
    const [name, resolvedAddress] = gatewayUrls ? await readContractAction({
      ...readContractParameters,
      args: [...readContractParameters.args, gatewayUrls]
    }) : await readContractAction(readContractParameters);
    if (address.toLowerCase() !== resolvedAddress.toLowerCase())
      return null;
    return name;
  } catch (err) {
    if (strict)
      throw err;
    if (isNullUniversalResolverError(err, "reverse"))
      return null;
    throw err;
  }
}

// node_modules/viem/_esm/actions/ens/getEnsResolver.js
init_getChainContractAddress();
init_toHex();
async function getEnsResolver(client, { blockNumber, blockTag, name, universalResolverAddress: universalResolverAddress_ }) {
  let universalResolverAddress = universalResolverAddress_;
  if (!universalResolverAddress) {
    if (!client.chain)
      throw new Error("client chain not configured. universalResolverAddress is required.");
    universalResolverAddress = getChainContractAddress({
      blockNumber,
      chain: client.chain,
      contract: "ensUniversalResolver"
    });
  }
  const [resolverAddress] = await getAction(client, readContract, "readContract")({
    address: universalResolverAddress,
    abi: [
      {
        inputs: [{ type: "bytes" }],
        name: "findResolver",
        outputs: [{ type: "address" }, { type: "bytes32" }],
        stateMutability: "view",
        type: "function"
      }
    ],
    functionName: "findResolver",
    args: [toHex(packetToBytes(name))],
    blockNumber,
    blockTag
  });
  return resolverAddress;
}

// node_modules/viem/_esm/clients/decorators/public.js
init_call();

// node_modules/viem/_esm/actions/public/createBlockFilter.js
async function createBlockFilter(client) {
  const getRequest = createFilterRequestScope(client, {
    method: "eth_newBlockFilter"
  });
  const id = await client.request({
    method: "eth_newBlockFilter"
  });
  return { id, request: getRequest(id), type: "block" };
}

// node_modules/viem/_esm/actions/public/createEventFilter.js
init_toHex();
async function createEventFilter(client, { address, args, event, events: events_, fromBlock, strict, toBlock } = {}) {
  const events = events_ ?? (event ? [event] : void 0);
  const getRequest = createFilterRequestScope(client, {
    method: "eth_newFilter"
  });
  let topics = [];
  if (events) {
    const encoded = events.flatMap((event2) => encodeEventTopics({
      abi: [event2],
      eventName: event2.name,
      args
    }));
    topics = [encoded];
    if (event)
      topics = topics[0];
  }
  const id = await client.request({
    method: "eth_newFilter",
    params: [
      {
        address,
        fromBlock: typeof fromBlock === "bigint" ? numberToHex(fromBlock) : fromBlock,
        toBlock: typeof toBlock === "bigint" ? numberToHex(toBlock) : toBlock,
        ...topics.length ? { topics } : {}
      }
    ]
  });
  return {
    abi: events,
    args,
    eventName: event ? event.name : void 0,
    fromBlock,
    id,
    request: getRequest(id),
    strict: Boolean(strict),
    toBlock,
    type: "event"
  };
}

// node_modules/viem/_esm/actions/public/createPendingTransactionFilter.js
async function createPendingTransactionFilter(client) {
  const getRequest = createFilterRequestScope(client, {
    method: "eth_newPendingTransactionFilter"
  });
  const id = await client.request({
    method: "eth_newPendingTransactionFilter"
  });
  return { id, request: getRequest(id), type: "transaction" };
}

// node_modules/viem/_esm/actions/public/getBalance.js
init_toHex();
async function getBalance(client, { address, blockNumber, blockTag = "latest" }) {
  const blockNumberHex = blockNumber ? numberToHex(blockNumber) : void 0;
  const balance = await client.request({
    method: "eth_getBalance",
    params: [address, blockNumberHex || blockTag]
  });
  return BigInt(balance);
}

// node_modules/viem/_esm/actions/public/getBlobBaseFee.js
async function getBlobBaseFee(client) {
  const baseFee = await client.request({
    method: "eth_blobBaseFee"
  });
  return BigInt(baseFee);
}

// node_modules/viem/_esm/actions/public/getBlockTransactionCount.js
init_fromHex();
init_toHex();
async function getBlockTransactionCount(client, { blockHash, blockNumber, blockTag = "latest" } = {}) {
  const blockNumberHex = blockNumber !== void 0 ? numberToHex(blockNumber) : void 0;
  let count;
  if (blockHash) {
    count = await client.request({
      method: "eth_getBlockTransactionCountByHash",
      params: [blockHash]
    }, { dedupe: true });
  } else {
    count = await client.request({
      method: "eth_getBlockTransactionCountByNumber",
      params: [blockNumberHex || blockTag]
    }, { dedupe: Boolean(blockNumberHex) });
  }
  return hexToNumber(count);
}

// node_modules/viem/_esm/actions/public/getCode.js
init_toHex();
async function getCode(client, { address, blockNumber, blockTag = "latest" }) {
  const blockNumberHex = blockNumber !== void 0 ? numberToHex(blockNumber) : void 0;
  const hex = await client.request({
    method: "eth_getCode",
    params: [address, blockNumberHex || blockTag]
  }, { dedupe: Boolean(blockNumberHex) });
  if (hex === "0x")
    return void 0;
  return hex;
}

// node_modules/viem/_esm/actions/public/getFeeHistory.js
init_toHex();

// node_modules/viem/_esm/utils/formatters/feeHistory.js
function formatFeeHistory(feeHistory) {
  return {
    baseFeePerGas: feeHistory.baseFeePerGas.map((value) => BigInt(value)),
    gasUsedRatio: feeHistory.gasUsedRatio,
    oldestBlock: BigInt(feeHistory.oldestBlock),
    reward: feeHistory.reward?.map((reward) => reward.map((value) => BigInt(value)))
  };
}

// node_modules/viem/_esm/actions/public/getFeeHistory.js
async function getFeeHistory(client, { blockCount, blockNumber, blockTag = "latest", rewardPercentiles }) {
  const blockNumberHex = blockNumber ? numberToHex(blockNumber) : void 0;
  const feeHistory = await client.request({
    method: "eth_feeHistory",
    params: [
      numberToHex(blockCount),
      blockNumberHex || blockTag,
      rewardPercentiles
    ]
  }, { dedupe: Boolean(blockNumberHex) });
  return formatFeeHistory(feeHistory);
}

// node_modules/viem/_esm/actions/public/getFilterLogs.js
async function getFilterLogs(_client, { filter: filter2 }) {
  const strict = filter2.strict ?? false;
  const logs = await filter2.request({
    method: "eth_getFilterLogs",
    params: [filter2.id]
  });
  const formattedLogs = logs.map((log) => formatLog(log));
  if (!filter2.abi)
    return formattedLogs;
  return parseEventLogs({
    abi: filter2.abi,
    logs: formattedLogs,
    strict
  });
}

// node_modules/viem/_esm/actions/public/getProof.js
init_toHex();

// node_modules/viem/_esm/utils/regex.js
var arrayRegex = /^(.*)\[([0-9]*)\]$/;
var bytesRegex2 = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/;
var integerRegex2 = /^(u?int)(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/;

// node_modules/viem/_esm/utils/typedData.js
init_abi();
init_address();
init_isAddress();
init_size();
init_toHex();

// node_modules/viem/_esm/utils/signature/hashTypedData.js
init_encodeAbiParameters();
init_concat();
init_toHex();
init_keccak256();
function hashTypedData(parameters) {
  const { domain = {}, message, primaryType } = parameters;
  const types = {
    EIP712Domain: getTypesForEIP712Domain({ domain }),
    ...parameters.types
  };
  validateTypedData({
    domain,
    message,
    primaryType,
    types
  });
  const parts = ["0x1901"];
  if (domain)
    parts.push(hashDomain({
      domain,
      types
    }));
  if (primaryType !== "EIP712Domain")
    parts.push(hashStruct({
      data: message,
      primaryType,
      types
    }));
  return keccak256(concat(parts));
}
function hashDomain({ domain, types }) {
  return hashStruct({
    data: domain,
    primaryType: "EIP712Domain",
    types
  });
}
function hashStruct({ data, primaryType, types }) {
  const encoded = encodeData({
    data,
    primaryType,
    types
  });
  return keccak256(encoded);
}
function encodeData({ data, primaryType, types }) {
  const encodedTypes = [{ type: "bytes32" }];
  const encodedValues = [hashType({ primaryType, types })];
  for (const field of types[primaryType]) {
    const [type, value] = encodeField({
      types,
      name: field.name,
      type: field.type,
      value: data[field.name]
    });
    encodedTypes.push(type);
    encodedValues.push(value);
  }
  return encodeAbiParameters(encodedTypes, encodedValues);
}
function hashType({ primaryType, types }) {
  const encodedHashType = toHex(encodeType({ primaryType, types }));
  return keccak256(encodedHashType);
}
function encodeType({ primaryType, types }) {
  let result = "";
  const unsortedDeps = findTypeDependencies({ primaryType, types });
  unsortedDeps.delete(primaryType);
  const deps = [primaryType, ...Array.from(unsortedDeps).sort()];
  for (const type of deps) {
    result += `${type}(${types[type].map(({ name, type: t3 }) => `${t3} ${name}`).join(",")})`;
  }
  return result;
}
function findTypeDependencies({ primaryType: primaryType_, types }, results = /* @__PURE__ */ new Set()) {
  const match = primaryType_.match(/^\w*/u);
  const primaryType = match?.[0];
  if (results.has(primaryType) || types[primaryType] === void 0) {
    return results;
  }
  results.add(primaryType);
  for (const field of types[primaryType]) {
    findTypeDependencies({ primaryType: field.type, types }, results);
  }
  return results;
}
function encodeField({ types, name, type, value }) {
  if (types[type] !== void 0) {
    return [
      { type: "bytes32" },
      keccak256(encodeData({ data: value, primaryType: type, types }))
    ];
  }
  if (type === "bytes") {
    const prepend = value.length % 2 ? "0" : "";
    value = `0x${prepend + value.slice(2)}`;
    return [{ type: "bytes32" }, keccak256(value)];
  }
  if (type === "string")
    return [{ type: "bytes32" }, keccak256(toHex(value))];
  if (type.lastIndexOf("]") === type.length - 1) {
    const parsedType = type.slice(0, type.lastIndexOf("["));
    const typeValuePairs = value.map((item) => encodeField({
      name,
      type: parsedType,
      types,
      value: item
    }));
    return [
      { type: "bytes32" },
      keccak256(encodeAbiParameters(typeValuePairs.map(([t3]) => t3), typeValuePairs.map(([, v4]) => v4)))
    ];
  }
  return [{ type }, value];
}

// node_modules/viem/_esm/utils/typedData.js
function validateTypedData(parameters) {
  const { domain, message, primaryType, types } = parameters;
  const validateData = (struct, data) => {
    for (const param of struct) {
      const { name, type } = param;
      const value = data[name];
      const integerMatch = type.match(integerRegex2);
      if (integerMatch && (typeof value === "number" || typeof value === "bigint")) {
        const [_type, base, size_] = integerMatch;
        numberToHex(value, {
          signed: base === "int",
          size: Number.parseInt(size_) / 8
        });
      }
      if (type === "address" && typeof value === "string" && !isAddress(value))
        throw new InvalidAddressError({ address: value });
      const bytesMatch = type.match(bytesRegex2);
      if (bytesMatch) {
        const [_type, size_] = bytesMatch;
        if (size_ && size(value) !== Number.parseInt(size_))
          throw new BytesSizeMismatchError({
            expectedSize: Number.parseInt(size_),
            givenSize: size(value)
          });
      }
      const struct2 = types[type];
      if (struct2)
        validateData(struct2, value);
    }
  };
  if (types.EIP712Domain && domain)
    validateData(types.EIP712Domain, domain);
  if (primaryType !== "EIP712Domain")
    validateData(types[primaryType], message);
}
function getTypesForEIP712Domain({ domain }) {
  return [
    typeof domain?.name === "string" && { name: "name", type: "string" },
    domain?.version && { name: "version", type: "string" },
    typeof domain?.chainId === "number" && {
      name: "chainId",
      type: "uint256"
    },
    domain?.verifyingContract && {
      name: "verifyingContract",
      type: "address"
    },
    domain?.salt && { name: "salt", type: "bytes32" }
  ].filter(Boolean);
}

// node_modules/viem/_esm/utils/abi/encodePacked.js
init_abi();
init_address();
init_isAddress();
init_concat();
init_pad();
init_toHex();
function encodePacked(types, values) {
  if (types.length !== values.length)
    throw new AbiEncodingLengthMismatchError({
      expectedLength: types.length,
      givenLength: values.length
    });
  const data = [];
  for (let i3 = 0; i3 < types.length; i3++) {
    const type = types[i3];
    const value = values[i3];
    data.push(encode3(type, value));
  }
  return concatHex(data);
}
function encode3(type, value, isArray2 = false) {
  if (type === "address") {
    const address = value;
    if (!isAddress(address))
      throw new InvalidAddressError({ address });
    return pad(address.toLowerCase(), {
      size: isArray2 ? 32 : null
    });
  }
  if (type === "string")
    return stringToHex(value);
  if (type === "bytes")
    return value;
  if (type === "bool")
    return pad(boolToHex(value), { size: isArray2 ? 32 : 1 });
  const intMatch = type.match(integerRegex2);
  if (intMatch) {
    const [_type, baseType, bits = "256"] = intMatch;
    const size3 = Number.parseInt(bits) / 8;
    return numberToHex(value, {
      size: isArray2 ? 32 : size3,
      signed: baseType === "int"
    });
  }
  const bytesMatch = type.match(bytesRegex2);
  if (bytesMatch) {
    const [_type, size3] = bytesMatch;
    if (Number.parseInt(size3) !== (value.length - 2) / 2)
      throw new BytesSizeMismatchError({
        expectedSize: Number.parseInt(size3),
        givenSize: (value.length - 2) / 2
      });
    return pad(value, { dir: "right", size: isArray2 ? 32 : null });
  }
  const arrayMatch = type.match(arrayRegex);
  if (arrayMatch && Array.isArray(value)) {
    const [_type, childType] = arrayMatch;
    const data = [];
    for (let i3 = 0; i3 < value.length; i3++) {
      data.push(encode3(childType, value[i3], true));
    }
    if (data.length === 0)
      return "0x";
    return concatHex(data);
  }
  throw new UnsupportedPackedAbiType(type);
}

// node_modules/viem/_esm/accounts/utils/publicKeyToAddress.js
init_getAddress();
init_keccak256();
function publicKeyToAddress(publicKey) {
  const address = keccak256(`0x${publicKey.substring(4)}`).substring(26);
  return checksumAddress(`0x${address}`);
}

// node_modules/viem/_esm/utils/formatters/transactionReceipt.js
init_fromHex();
var receiptStatuses = {
  "0x0": "reverted",
  "0x1": "success"
};
function formatTransactionReceipt(transactionReceipt) {
  const receipt = {
    ...transactionReceipt,
    blockNumber: transactionReceipt.blockNumber ? BigInt(transactionReceipt.blockNumber) : null,
    contractAddress: transactionReceipt.contractAddress ? transactionReceipt.contractAddress : null,
    cumulativeGasUsed: transactionReceipt.cumulativeGasUsed ? BigInt(transactionReceipt.cumulativeGasUsed) : null,
    effectiveGasPrice: transactionReceipt.effectiveGasPrice ? BigInt(transactionReceipt.effectiveGasPrice) : null,
    gasUsed: transactionReceipt.gasUsed ? BigInt(transactionReceipt.gasUsed) : null,
    logs: transactionReceipt.logs ? transactionReceipt.logs.map((log) => formatLog(log)) : null,
    to: transactionReceipt.to ? transactionReceipt.to : null,
    transactionIndex: transactionReceipt.transactionIndex ? hexToNumber(transactionReceipt.transactionIndex) : null,
    status: transactionReceipt.status ? receiptStatuses[transactionReceipt.status] : null,
    type: transactionReceipt.type ? transactionType[transactionReceipt.type] || transactionReceipt.type : null
  };
  if (transactionReceipt.blobGasPrice)
    receipt.blobGasPrice = BigInt(transactionReceipt.blobGasPrice);
  if (transactionReceipt.blobGasUsed)
    receipt.blobGasUsed = BigInt(transactionReceipt.blobGasUsed);
  return receipt;
}

// node_modules/viem/_esm/utils/index.js
init_fromHex();

// node_modules/viem/_esm/utils/signature/recoverPublicKey.js
init_isHex();
init_fromHex();
init_toHex();
async function recoverPublicKey({ hash: hash3, signature }) {
  const hashHex = isHex(hash3) ? hash3 : toHex(hash3);
  const { secp256k1: secp256k12 } = await Promise.resolve().then(() => (init_secp256k1(), secp256k1_exports));
  const signature_ = (() => {
    if (typeof signature === "object" && "r" in signature && "s" in signature) {
      const { r: r3, s: s3, v: v4, yParity } = signature;
      const yParityOrV2 = Number(yParity ?? v4);
      const recoveryBit2 = toRecoveryBit(yParityOrV2);
      return new secp256k12.Signature(hexToBigInt(r3), hexToBigInt(s3)).addRecoveryBit(recoveryBit2);
    }
    const signatureHex = isHex(signature) ? signature : toHex(signature);
    const yParityOrV = hexToNumber(`0x${signatureHex.slice(130)}`);
    const recoveryBit = toRecoveryBit(yParityOrV);
    return secp256k12.Signature.fromCompact(signatureHex.substring(2, 130)).addRecoveryBit(recoveryBit);
  })();
  const publicKey = signature_.recoverPublicKey(hashHex.substring(2)).toHex(false);
  return `0x${publicKey}`;
}
function toRecoveryBit(yParityOrV) {
  if (yParityOrV === 0 || yParityOrV === 1)
    return yParityOrV;
  if (yParityOrV === 27)
    return 0;
  if (yParityOrV === 28)
    return 1;
  throw new Error("Invalid yParityOrV value");
}

// node_modules/viem/_esm/utils/signature/recoverAddress.js
async function recoverAddress({ hash: hash3, signature }) {
  return publicKeyToAddress(await recoverPublicKey({ hash: hash3, signature }));
}

// node_modules/viem/_esm/utils/signature/hashMessage.js
init_keccak256();

// node_modules/viem/_esm/constants/strings.js
var presignMessagePrefix = "Ethereum Signed Message:\n";

// node_modules/viem/_esm/utils/signature/toPrefixedMessage.js
init_concat();
init_size();
init_toHex();
function toPrefixedMessage(message_) {
  const message = (() => {
    if (typeof message_ === "string")
      return stringToHex(message_);
    if (typeof message_.raw === "string")
      return message_.raw;
    return bytesToHex(message_.raw);
  })();
  const prefix = stringToHex(`${presignMessagePrefix}${size(message)}`);
  return concat([prefix, message]);
}

// node_modules/viem/_esm/utils/signature/hashMessage.js
function hashMessage(message, to_) {
  return keccak256(toPrefixedMessage(message), to_);
}

// node_modules/viem/_esm/constants/bytes.js
var erc6492MagicBytes = "0x6492649264926492649264926492649264926492649264926492649264926492";

// node_modules/viem/_esm/utils/signature/isErc6492Signature.js
init_slice();
function isErc6492Signature(signature) {
  return sliceHex(signature, -32) === erc6492MagicBytes;
}

// node_modules/viem/_esm/utils/signature/serializeErc6492Signature.js
init_encodeAbiParameters();
init_concat();
init_toBytes();
function serializeErc6492Signature(parameters) {
  const { address, data, signature, to = "hex" } = parameters;
  const signature_ = concatHex([
    encodeAbiParameters([{ type: "address" }, { type: "bytes" }, { type: "bytes" }], [address, data, signature]),
    erc6492MagicBytes
  ]);
  if (to === "hex")
    return signature_;
  return hexToBytes(signature_);
}

// node_modules/viem/_esm/utils/formatters/proof.js
function formatStorageProof(storageProof) {
  return storageProof.map((proof) => ({
    ...proof,
    value: BigInt(proof.value)
  }));
}
function formatProof(proof) {
  return {
    ...proof,
    balance: proof.balance ? BigInt(proof.balance) : void 0,
    nonce: proof.nonce ? hexToNumber(proof.nonce) : void 0,
    storageProof: proof.storageProof ? formatStorageProof(proof.storageProof) : void 0
  };
}

// node_modules/viem/_esm/actions/public/getProof.js
async function getProof(client, { address, blockNumber, blockTag: blockTag_, storageKeys }) {
  const blockTag = blockTag_ ?? "latest";
  const blockNumberHex = blockNumber !== void 0 ? numberToHex(blockNumber) : void 0;
  const proof = await client.request({
    method: "eth_getProof",
    params: [address, storageKeys, blockNumberHex || blockTag]
  });
  return formatProof(proof);
}

// node_modules/viem/_esm/actions/public/getStorageAt.js
init_toHex();
async function getStorageAt(client, { address, blockNumber, blockTag = "latest", slot }) {
  const blockNumberHex = blockNumber !== void 0 ? numberToHex(blockNumber) : void 0;
  const data = await client.request({
    method: "eth_getStorageAt",
    params: [address, slot, blockNumberHex || blockTag]
  });
  return data;
}

// node_modules/viem/_esm/actions/public/getTransaction.js
init_transaction();
init_toHex();
async function getTransaction(client, { blockHash, blockNumber, blockTag: blockTag_, hash: hash3, index: index2 }) {
  const blockTag = blockTag_ || "latest";
  const blockNumberHex = blockNumber !== void 0 ? numberToHex(blockNumber) : void 0;
  let transaction = null;
  if (hash3) {
    transaction = await client.request({
      method: "eth_getTransactionByHash",
      params: [hash3]
    }, { dedupe: true });
  } else if (blockHash) {
    transaction = await client.request({
      method: "eth_getTransactionByBlockHashAndIndex",
      params: [blockHash, numberToHex(index2)]
    }, { dedupe: true });
  } else if (blockNumberHex || blockTag) {
    transaction = await client.request({
      method: "eth_getTransactionByBlockNumberAndIndex",
      params: [blockNumberHex || blockTag, numberToHex(index2)]
    }, { dedupe: Boolean(blockNumberHex) });
  }
  if (!transaction)
    throw new TransactionNotFoundError({
      blockHash,
      blockNumber,
      blockTag,
      hash: hash3,
      index: index2
    });
  const format = client.chain?.formatters?.transaction?.format || formatTransaction;
  return format(transaction);
}

// node_modules/viem/_esm/actions/public/getTransactionConfirmations.js
async function getTransactionConfirmations(client, { hash: hash3, transactionReceipt }) {
  const [blockNumber, transaction] = await Promise.all([
    getAction(client, getBlockNumber, "getBlockNumber")({}),
    hash3 ? getAction(client, getTransaction, "getTransaction")({ hash: hash3 }) : void 0
  ]);
  const transactionBlockNumber = transactionReceipt?.blockNumber || transaction?.blockNumber;
  if (!transactionBlockNumber)
    return 0n;
  return blockNumber - transactionBlockNumber + 1n;
}

// node_modules/viem/_esm/actions/public/getTransactionReceipt.js
init_transaction();
async function getTransactionReceipt(client, { hash: hash3 }) {
  const receipt = await client.request({
    method: "eth_getTransactionReceipt",
    params: [hash3]
  }, { dedupe: true });
  if (!receipt)
    throw new TransactionReceiptNotFoundError({ hash: hash3 });
  const format = client.chain?.formatters?.transactionReceipt?.format || formatTransactionReceipt;
  return format(receipt);
}

// node_modules/viem/_esm/actions/public/multicall.js
init_abis();
init_abi();
init_base();
init_contract();
init_decodeFunctionResult();
init_encodeFunctionData();
init_getChainContractAddress();
async function multicall(client, parameters) {
  const { allowFailure = true, batchSize: batchSize_, blockNumber, blockTag, multicallAddress: multicallAddress_, stateOverride } = parameters;
  const contracts = parameters.contracts;
  const batchSize = batchSize_ ?? (typeof client.batch?.multicall === "object" && client.batch.multicall.batchSize || 1024);
  let multicallAddress = multicallAddress_;
  if (!multicallAddress) {
    if (!client.chain)
      throw new Error("client chain not configured. multicallAddress is required.");
    multicallAddress = getChainContractAddress({
      blockNumber,
      chain: client.chain,
      contract: "multicall3"
    });
  }
  const chunkedCalls = [[]];
  let currentChunk = 0;
  let currentChunkSize = 0;
  for (let i3 = 0; i3 < contracts.length; i3++) {
    const { abi: abi2, address, args, functionName } = contracts[i3];
    try {
      const callData = encodeFunctionData({ abi: abi2, args, functionName });
      currentChunkSize += (callData.length - 2) / 2;
      if (
        // Check if batching is enabled.
        batchSize > 0 && // Check if the current size of the batch exceeds the size limit.
        currentChunkSize > batchSize && // Check if the current chunk is not already empty.
        chunkedCalls[currentChunk].length > 0
      ) {
        currentChunk++;
        currentChunkSize = (callData.length - 2) / 2;
        chunkedCalls[currentChunk] = [];
      }
      chunkedCalls[currentChunk] = [
        ...chunkedCalls[currentChunk],
        {
          allowFailure: true,
          callData,
          target: address
        }
      ];
    } catch (err) {
      const error = getContractError(err, {
        abi: abi2,
        address,
        args,
        docsPath: "/docs/contract/multicall",
        functionName
      });
      if (!allowFailure)
        throw error;
      chunkedCalls[currentChunk] = [
        ...chunkedCalls[currentChunk],
        {
          allowFailure: true,
          callData: "0x",
          target: address
        }
      ];
    }
  }
  const aggregate3Results = await Promise.allSettled(chunkedCalls.map((calls) => getAction(client, readContract, "readContract")({
    abi: multicall3Abi,
    address: multicallAddress,
    args: [calls],
    blockNumber,
    blockTag,
    functionName: "aggregate3",
    stateOverride
  })));
  const results = [];
  for (let i3 = 0; i3 < aggregate3Results.length; i3++) {
    const result = aggregate3Results[i3];
    if (result.status === "rejected") {
      if (!allowFailure)
        throw result.reason;
      for (let j5 = 0; j5 < chunkedCalls[i3].length; j5++) {
        results.push({
          status: "failure",
          error: result.reason,
          result: void 0
        });
      }
      continue;
    }
    const aggregate3Result = result.value;
    for (let j5 = 0; j5 < aggregate3Result.length; j5++) {
      const { returnData, success } = aggregate3Result[j5];
      const { callData } = chunkedCalls[i3][j5];
      const { abi: abi2, address, functionName, args } = contracts[results.length];
      try {
        if (callData === "0x")
          throw new AbiDecodingZeroDataError();
        if (!success)
          throw new RawContractError({ data: returnData });
        const result2 = decodeFunctionResult({
          abi: abi2,
          args,
          data: returnData,
          functionName
        });
        results.push(allowFailure ? { result: result2, status: "success" } : result2);
      } catch (err) {
        const error = getContractError(err, {
          abi: abi2,
          address,
          args,
          docsPath: "/docs/contract/multicall",
          functionName
        });
        if (!allowFailure)
          throw error;
        results.push({ error, result: void 0, status: "failure" });
      }
    }
  }
  if (results.length !== contracts.length)
    throw new BaseError2("multicall results mismatch");
  return results;
}

// node_modules/viem/_esm/actions/public/verifyHash.js
init_abis();
init_contracts();
init_contract();
init_encodeDeployData();
init_getAddress();
init_isAddressEqual();

// node_modules/viem/_esm/utils/data/isBytesEqual.js
init_utils4();
init_toBytes();
init_isHex();
function isBytesEqual(a_, b_) {
  const a3 = isHex(a_) ? toBytes(a_) : a_;
  const b4 = isHex(b_) ? toBytes(b_) : b_;
  return equalBytes(a3, b4);
}

// node_modules/viem/_esm/actions/public/verifyHash.js
init_isHex();
init_toHex();

// node_modules/viem/_esm/utils/signature/serializeSignature.js
init_secp256k1();
init_fromHex();
init_toBytes();
function serializeSignature({ r: r3, s: s3, to = "hex", v: v4, yParity }) {
  const yParity_ = (() => {
    if (yParity === 0 || yParity === 1)
      return yParity;
    if (v4 && (v4 === 27n || v4 === 28n || v4 >= 35n))
      return v4 % 2n === 0n ? 1 : 0;
    throw new Error("Invalid `v` or `yParity` value");
  })();
  const signature = `0x${new secp256k1.Signature(hexToBigInt(r3), hexToBigInt(s3)).toCompactHex()}${yParity_ === 0 ? "1b" : "1c"}`;
  if (to === "hex")
    return signature;
  return hexToBytes(signature);
}

// node_modules/viem/_esm/actions/public/verifyHash.js
init_call();
async function verifyHash(client, parameters) {
  const { address, factory: factory2, factoryData, hash: hash3, signature, ...rest } = parameters;
  const signatureHex = (() => {
    if (isHex(signature))
      return signature;
    if (typeof signature === "object" && "r" in signature && "s" in signature)
      return serializeSignature(signature);
    return bytesToHex(signature);
  })();
  const wrappedSignature = await (async () => {
    if (!factory2 && !factoryData)
      return signatureHex;
    if (isErc6492Signature(signatureHex))
      return signatureHex;
    return serializeErc6492Signature({
      address: factory2,
      data: factoryData,
      signature: signatureHex
    });
  })();
  try {
    const { data } = await getAction(client, call, "call")({
      data: encodeDeployData({
        abi: universalSignatureValidatorAbi,
        args: [address, hash3, wrappedSignature],
        bytecode: universalSignatureValidatorByteCode
      }),
      ...rest
    });
    return isBytesEqual(data ?? "0x0", "0x1");
  } catch (error) {
    try {
      const verified = isAddressEqual(getAddress(address), await recoverAddress({ hash: hash3, signature }));
      if (verified)
        return true;
    } catch {
    }
    if (error instanceof CallExecutionError) {
      return false;
    }
    throw error;
  }
}

// node_modules/viem/_esm/actions/public/verifyMessage.js
async function verifyMessage(client, { address, message, factory: factory2, factoryData, signature, ...callRequest }) {
  const hash3 = hashMessage(message);
  return verifyHash(client, {
    address,
    factory: factory2,
    factoryData,
    hash: hash3,
    signature,
    ...callRequest
  });
}

// node_modules/viem/_esm/actions/public/verifyTypedData.js
async function verifyTypedData(client, parameters) {
  const { address, factory: factory2, factoryData, signature, message, primaryType, types, domain, ...callRequest } = parameters;
  const hash3 = hashTypedData({ message, primaryType, types, domain });
  return verifyHash(client, {
    address,
    factory: factory2,
    factoryData,
    hash: hash3,
    signature,
    ...callRequest
  });
}

// node_modules/viem/_esm/actions/public/waitForTransactionReceipt.js
init_transaction();
init_stringify();

// node_modules/viem/_esm/actions/public/watchBlockNumber.js
init_fromHex();
init_stringify();
function watchBlockNumber(client, { emitOnBegin = false, emitMissed = false, onBlockNumber, onError, poll: poll_, pollingInterval = client.pollingInterval }) {
  const enablePolling = (() => {
    if (typeof poll_ !== "undefined")
      return poll_;
    if (client.transport.type === "webSocket")
      return false;
    if (client.transport.type === "fallback" && client.transport.transports[0].config.type === "webSocket")
      return false;
    return true;
  })();
  let prevBlockNumber;
  const pollBlockNumber = () => {
    const observerId = stringify([
      "watchBlockNumber",
      client.uid,
      emitOnBegin,
      emitMissed,
      pollingInterval
    ]);
    return observe(observerId, { onBlockNumber, onError }, (emit) => poll(async () => {
      try {
        const blockNumber = await getAction(client, getBlockNumber, "getBlockNumber")({ cacheTime: 0 });
        if (prevBlockNumber) {
          if (blockNumber === prevBlockNumber)
            return;
          if (blockNumber - prevBlockNumber > 1 && emitMissed) {
            for (let i3 = prevBlockNumber + 1n; i3 < blockNumber; i3++) {
              emit.onBlockNumber(i3, prevBlockNumber);
              prevBlockNumber = i3;
            }
          }
        }
        if (!prevBlockNumber || blockNumber > prevBlockNumber) {
          emit.onBlockNumber(blockNumber, prevBlockNumber);
          prevBlockNumber = blockNumber;
        }
      } catch (err) {
        emit.onError?.(err);
      }
    }, {
      emitOnBegin,
      interval: pollingInterval
    }));
  };
  const subscribeBlockNumber = () => {
    const observerId = stringify([
      "watchBlockNumber",
      client.uid,
      emitOnBegin,
      emitMissed
    ]);
    return observe(observerId, { onBlockNumber, onError }, (emit) => {
      let active = true;
      let unsubscribe = () => active = false;
      (async () => {
        try {
          const transport = (() => {
            if (client.transport.type === "fallback") {
              const transport2 = client.transport.transports.find((transport3) => transport3.config.type === "webSocket");
              if (!transport2)
                return client.transport;
              return transport2.value;
            }
            return client.transport;
          })();
          const { unsubscribe: unsubscribe_ } = await transport.subscribe({
            params: ["newHeads"],
            onData(data) {
              if (!active)
                return;
              const blockNumber = hexToBigInt(data.result?.number);
              emit.onBlockNumber(blockNumber, prevBlockNumber);
              prevBlockNumber = blockNumber;
            },
            onError(error) {
              emit.onError?.(error);
            }
          });
          unsubscribe = unsubscribe_;
          if (!active)
            unsubscribe();
        } catch (err) {
          onError?.(err);
        }
      })();
      return () => unsubscribe();
    });
  };
  return enablePolling ? pollBlockNumber() : subscribeBlockNumber();
}

// node_modules/viem/_esm/actions/public/waitForTransactionReceipt.js
async function waitForTransactionReceipt(client, {
  confirmations = 1,
  hash: hash3,
  onReplaced,
  pollingInterval = client.pollingInterval,
  retryCount = 6,
  retryDelay = ({ count }) => ~~(1 << count) * 200,
  // exponential backoff
  timeout
}) {
  const observerId = stringify(["waitForTransactionReceipt", client.uid, hash3]);
  let count = 0;
  let transaction;
  let replacedTransaction;
  let receipt;
  let retrying = false;
  return new Promise((resolve, reject) => {
    if (timeout)
      setTimeout(() => reject(new WaitForTransactionReceiptTimeoutError({ hash: hash3 })), timeout);
    const _unobserve = observe(observerId, { onReplaced, resolve, reject }, (emit) => {
      const _unwatch = getAction(client, watchBlockNumber, "watchBlockNumber")({
        emitMissed: true,
        emitOnBegin: true,
        poll: true,
        pollingInterval,
        async onBlockNumber(blockNumber_) {
          const done = (fn2) => {
            _unwatch();
            fn2();
            _unobserve();
          };
          let blockNumber = blockNumber_;
          if (retrying)
            return;
          if (count > retryCount)
            done(() => emit.reject(new WaitForTransactionReceiptTimeoutError({ hash: hash3 })));
          try {
            if (receipt) {
              if (confirmations > 1 && (!receipt.blockNumber || blockNumber - receipt.blockNumber + 1n < confirmations))
                return;
              done(() => emit.resolve(receipt));
              return;
            }
            if (!transaction) {
              retrying = true;
              await withRetry(async () => {
                transaction = await getAction(client, getTransaction, "getTransaction")({ hash: hash3 });
                if (transaction.blockNumber)
                  blockNumber = transaction.blockNumber;
              }, {
                delay: retryDelay,
                retryCount
              });
              retrying = false;
            }
            receipt = await getAction(client, getTransactionReceipt, "getTransactionReceipt")({ hash: hash3 });
            if (confirmations > 1 && (!receipt.blockNumber || blockNumber - receipt.blockNumber + 1n < confirmations))
              return;
            done(() => emit.resolve(receipt));
          } catch (err) {
            if (err instanceof TransactionNotFoundError || err instanceof TransactionReceiptNotFoundError) {
              if (!transaction) {
                retrying = false;
                return;
              }
              try {
                replacedTransaction = transaction;
                retrying = true;
                const block = await withRetry(() => getAction(client, getBlock, "getBlock")({
                  blockNumber,
                  includeTransactions: true
                }), {
                  delay: retryDelay,
                  retryCount,
                  shouldRetry: ({ error }) => error instanceof BlockNotFoundError
                });
                retrying = false;
                const replacementTransaction = block.transactions.find(({ from, nonce }) => from === replacedTransaction.from && nonce === replacedTransaction.nonce);
                if (!replacementTransaction)
                  return;
                receipt = await getAction(client, getTransactionReceipt, "getTransactionReceipt")({
                  hash: replacementTransaction.hash
                });
                if (confirmations > 1 && (!receipt.blockNumber || blockNumber - receipt.blockNumber + 1n < confirmations))
                  return;
                let reason = "replaced";
                if (replacementTransaction.to === replacedTransaction.to && replacementTransaction.value === replacedTransaction.value) {
                  reason = "repriced";
                } else if (replacementTransaction.from === replacementTransaction.to && replacementTransaction.value === 0n) {
                  reason = "cancelled";
                }
                done(() => {
                  emit.onReplaced?.({
                    reason,
                    replacedTransaction,
                    transaction: replacementTransaction,
                    transactionReceipt: receipt
                  });
                  emit.resolve(receipt);
                });
              } catch (err_) {
                done(() => emit.reject(err_));
              }
            } else {
              done(() => emit.reject(err));
            }
          } finally {
            count++;
          }
        }
      });
    });
  });
}

// node_modules/viem/_esm/actions/public/watchBlocks.js
init_stringify();
function watchBlocks(client, { blockTag = "latest", emitMissed = false, emitOnBegin = false, onBlock, onError, includeTransactions: includeTransactions_, poll: poll_, pollingInterval = client.pollingInterval }) {
  const enablePolling = (() => {
    if (typeof poll_ !== "undefined")
      return poll_;
    if (client.transport.type === "webSocket")
      return false;
    if (client.transport.type === "fallback" && client.transport.transports[0].config.type === "webSocket")
      return false;
    return true;
  })();
  const includeTransactions = includeTransactions_ ?? false;
  let prevBlock;
  const pollBlocks = () => {
    const observerId = stringify([
      "watchBlocks",
      client.uid,
      blockTag,
      emitMissed,
      emitOnBegin,
      includeTransactions,
      pollingInterval
    ]);
    return observe(observerId, { onBlock, onError }, (emit) => poll(async () => {
      try {
        const block = await getAction(client, getBlock, "getBlock")({
          blockTag,
          includeTransactions
        });
        if (block.number && prevBlock?.number) {
          if (block.number === prevBlock.number)
            return;
          if (block.number - prevBlock.number > 1 && emitMissed) {
            for (let i3 = prevBlock?.number + 1n; i3 < block.number; i3++) {
              const block2 = await getAction(client, getBlock, "getBlock")({
                blockNumber: i3,
                includeTransactions
              });
              emit.onBlock(block2, prevBlock);
              prevBlock = block2;
            }
          }
        }
        if (
          // If no previous block exists, emit.
          !prevBlock?.number || // If the block tag is "pending" with no block number, emit.
          blockTag === "pending" && !block?.number || // If the next block number is greater than the previous block number, emit.
          // We don't want to emit blocks in the past.
          block.number && block.number > prevBlock.number
        ) {
          emit.onBlock(block, prevBlock);
          prevBlock = block;
        }
      } catch (err) {
        emit.onError?.(err);
      }
    }, {
      emitOnBegin,
      interval: pollingInterval
    }));
  };
  const subscribeBlocks = () => {
    let active = true;
    let unsubscribe = () => active = false;
    (async () => {
      try {
        const transport = (() => {
          if (client.transport.type === "fallback") {
            const transport2 = client.transport.transports.find((transport3) => transport3.config.type === "webSocket");
            if (!transport2)
              return client.transport;
            return transport2.value;
          }
          return client.transport;
        })();
        const { unsubscribe: unsubscribe_ } = await transport.subscribe({
          params: ["newHeads"],
          onData(data) {
            if (!active)
              return;
            const format = client.chain?.formatters?.block?.format || formatBlock;
            const block = format(data.result);
            onBlock(block, prevBlock);
            prevBlock = block;
          },
          onError(error) {
            onError?.(error);
          }
        });
        unsubscribe = unsubscribe_;
        if (!active)
          unsubscribe();
      } catch (err) {
        onError?.(err);
      }
    })();
    return () => unsubscribe();
  };
  return enablePolling ? pollBlocks() : subscribeBlocks();
}

// node_modules/viem/_esm/actions/public/watchEvent.js
init_stringify();
init_abi();
init_rpc();
function watchEvent(client, { address, args, batch = true, event, events, fromBlock, onError, onLogs, poll: poll_, pollingInterval = client.pollingInterval, strict: strict_ }) {
  const enablePolling = (() => {
    if (typeof poll_ !== "undefined")
      return poll_;
    if (typeof fromBlock === "bigint")
      return true;
    if (client.transport.type === "webSocket")
      return false;
    if (client.transport.type === "fallback" && client.transport.transports[0].config.type === "webSocket")
      return false;
    return true;
  })();
  const strict = strict_ ?? false;
  const pollEvent = () => {
    const observerId = stringify([
      "watchEvent",
      address,
      args,
      batch,
      client.uid,
      event,
      pollingInterval,
      fromBlock
    ]);
    return observe(observerId, { onLogs, onError }, (emit) => {
      let previousBlockNumber;
      if (fromBlock !== void 0)
        previousBlockNumber = fromBlock - 1n;
      let filter2;
      let initialized = false;
      const unwatch = poll(async () => {
        if (!initialized) {
          try {
            filter2 = await getAction(client, createEventFilter, "createEventFilter")({
              address,
              args,
              event,
              events,
              strict,
              fromBlock
            });
          } catch {
          }
          initialized = true;
          return;
        }
        try {
          let logs;
          if (filter2) {
            logs = await getAction(client, getFilterChanges, "getFilterChanges")({ filter: filter2 });
          } else {
            const blockNumber = await getAction(client, getBlockNumber, "getBlockNumber")({});
            if (previousBlockNumber && previousBlockNumber !== blockNumber) {
              logs = await getAction(client, getLogs, "getLogs")({
                address,
                args,
                event,
                events,
                fromBlock: previousBlockNumber + 1n,
                toBlock: blockNumber
              });
            } else {
              logs = [];
            }
            previousBlockNumber = blockNumber;
          }
          if (logs.length === 0)
            return;
          if (batch)
            emit.onLogs(logs);
          else
            for (const log of logs)
              emit.onLogs([log]);
        } catch (err) {
          if (filter2 && err instanceof InvalidInputRpcError)
            initialized = false;
          emit.onError?.(err);
        }
      }, {
        emitOnBegin: true,
        interval: pollingInterval
      });
      return async () => {
        if (filter2)
          await getAction(client, uninstallFilter, "uninstallFilter")({ filter: filter2 });
        unwatch();
      };
    });
  };
  const subscribeEvent = () => {
    let active = true;
    let unsubscribe = () => active = false;
    (async () => {
      try {
        const transport = (() => {
          if (client.transport.type === "fallback") {
            const transport2 = client.transport.transports.find((transport3) => transport3.config.type === "webSocket");
            if (!transport2)
              return client.transport;
            return transport2.value;
          }
          return client.transport;
        })();
        const events_ = events ?? (event ? [event] : void 0);
        let topics = [];
        if (events_) {
          const encoded = events_.flatMap((event2) => encodeEventTopics({
            abi: [event2],
            eventName: event2.name,
            args
          }));
          topics = [encoded];
          if (event)
            topics = topics[0];
        }
        const { unsubscribe: unsubscribe_ } = await transport.subscribe({
          params: ["logs", { address, topics }],
          onData(data) {
            if (!active)
              return;
            const log = data.result;
            try {
              const { eventName, args: args2 } = decodeEventLog({
                abi: events_ ?? [],
                data: log.data,
                topics: log.topics,
                strict
              });
              const formatted = formatLog(log, { args: args2, eventName });
              onLogs([formatted]);
            } catch (err) {
              let eventName;
              let isUnnamed;
              if (err instanceof DecodeLogDataMismatch || err instanceof DecodeLogTopicsMismatch) {
                if (strict_)
                  return;
                eventName = err.abiItem.name;
                isUnnamed = err.abiItem.inputs?.some((x4) => !("name" in x4 && x4.name));
              }
              const formatted = formatLog(log, {
                args: isUnnamed ? [] : {},
                eventName
              });
              onLogs([formatted]);
            }
          },
          onError(error) {
            onError?.(error);
          }
        });
        unsubscribe = unsubscribe_;
        if (!active)
          unsubscribe();
      } catch (err) {
        onError?.(err);
      }
    })();
    return () => unsubscribe();
  };
  return enablePolling ? pollEvent() : subscribeEvent();
}

// node_modules/viem/_esm/actions/public/watchPendingTransactions.js
init_stringify();
function watchPendingTransactions(client, { batch = true, onError, onTransactions, poll: poll_, pollingInterval = client.pollingInterval }) {
  const enablePolling = typeof poll_ !== "undefined" ? poll_ : client.transport.type !== "webSocket";
  const pollPendingTransactions = () => {
    const observerId = stringify([
      "watchPendingTransactions",
      client.uid,
      batch,
      pollingInterval
    ]);
    return observe(observerId, { onTransactions, onError }, (emit) => {
      let filter2;
      const unwatch = poll(async () => {
        try {
          if (!filter2) {
            try {
              filter2 = await getAction(client, createPendingTransactionFilter, "createPendingTransactionFilter")({});
              return;
            } catch (err) {
              unwatch();
              throw err;
            }
          }
          const hashes = await getAction(client, getFilterChanges, "getFilterChanges")({ filter: filter2 });
          if (hashes.length === 0)
            return;
          if (batch)
            emit.onTransactions(hashes);
          else
            for (const hash3 of hashes)
              emit.onTransactions([hash3]);
        } catch (err) {
          emit.onError?.(err);
        }
      }, {
        emitOnBegin: true,
        interval: pollingInterval
      });
      return async () => {
        if (filter2)
          await getAction(client, uninstallFilter, "uninstallFilter")({ filter: filter2 });
        unwatch();
      };
    });
  };
  const subscribePendingTransactions = () => {
    let active = true;
    let unsubscribe = () => active = false;
    (async () => {
      try {
        const { unsubscribe: unsubscribe_ } = await client.transport.subscribe({
          params: ["newPendingTransactions"],
          onData(data) {
            if (!active)
              return;
            const transaction = data.result;
            onTransactions([transaction]);
          },
          onError(error) {
            onError?.(error);
          }
        });
        unsubscribe = unsubscribe_;
        if (!active)
          unsubscribe();
      } catch (err) {
        onError?.(err);
      }
    })();
    return () => unsubscribe();
  };
  return enablePolling ? pollPendingTransactions() : subscribePendingTransactions();
}

// node_modules/viem/_esm/utils/siwe/parseSiweMessage.js
function parseSiweMessage(message) {
  const { scheme, statement, ...prefix } = message.match(prefixRegex)?.groups ?? {};
  const { chainId, expirationTime, issuedAt, notBefore, requestId, ...suffix } = message.match(suffixRegex)?.groups ?? {};
  const resources = message.split("Resources:")[1]?.split("\n- ").slice(1);
  return {
    ...prefix,
    ...suffix,
    ...chainId ? { chainId: Number(chainId) } : {},
    ...expirationTime ? { expirationTime: new Date(expirationTime) } : {},
    ...issuedAt ? { issuedAt: new Date(issuedAt) } : {},
    ...notBefore ? { notBefore: new Date(notBefore) } : {},
    ...requestId ? { requestId } : {},
    ...resources ? { resources } : {},
    ...scheme ? { scheme } : {},
    ...statement ? { statement } : {}
  };
}
var prefixRegex = /^(?:(?<scheme>[a-zA-Z][a-zA-Z0-9+-.]*):\/\/)?(?<domain>[a-zA-Z0-9+-.]*(?::[0-9]{1,5})?) (?:wants you to sign in with your Ethereum account:\n)(?<address>0x[a-fA-F0-9]{40})\n\n(?:(?<statement>.*)\n\n)?/;
var suffixRegex = /(?:URI: (?<uri>.+))\n(?:Version: (?<version>.+))\n(?:Chain ID: (?<chainId>\d+))\n(?:Nonce: (?<nonce>[a-zA-Z0-9]+))\n(?:Issued At: (?<issuedAt>.+))(?:\nExpiration Time: (?<expirationTime>.+))?(?:\nNot Before: (?<notBefore>.+))?(?:\nRequest ID: (?<requestId>.+))?/;

// node_modules/viem/_esm/utils/siwe/validateSiweMessage.js
init_isAddressEqual();
function validateSiweMessage(parameters) {
  const { address, domain, message, nonce, scheme, time = /* @__PURE__ */ new Date() } = parameters;
  if (domain && message.domain !== domain)
    return false;
  if (nonce && message.nonce !== nonce)
    return false;
  if (scheme && message.scheme !== scheme)
    return false;
  if (message.expirationTime && time >= message.expirationTime)
    return false;
  if (message.notBefore && time < message.notBefore)
    return false;
  try {
    if (!message.address)
      return false;
    if (address && !isAddressEqual(message.address, address))
      return false;
  } catch {
    return false;
  }
  return true;
}

// node_modules/viem/_esm/actions/siwe/verifySiweMessage.js
async function verifySiweMessage(client, parameters) {
  const { address, domain, message, nonce, scheme, signature, time = /* @__PURE__ */ new Date(), ...callRequest } = parameters;
  const parsed = parseSiweMessage(message);
  if (!parsed.address)
    return false;
  const isValid = validateSiweMessage({
    address,
    domain,
    message: parsed,
    nonce,
    scheme,
    time
  });
  if (!isValid)
    return false;
  const hash3 = hashMessage(message);
  return verifyHash(client, {
    address: parsed.address,
    hash: hash3,
    signature,
    ...callRequest
  });
}

// node_modules/viem/_esm/clients/decorators/public.js
function publicActions(client) {
  return {
    call: (args) => call(client, args),
    createBlockFilter: () => createBlockFilter(client),
    createContractEventFilter: (args) => createContractEventFilter(client, args),
    createEventFilter: (args) => createEventFilter(client, args),
    createPendingTransactionFilter: () => createPendingTransactionFilter(client),
    estimateContractGas: (args) => estimateContractGas(client, args),
    estimateGas: (args) => estimateGas(client, args),
    getBalance: (args) => getBalance(client, args),
    getBlobBaseFee: () => getBlobBaseFee(client),
    getBlock: (args) => getBlock(client, args),
    getBlockNumber: (args) => getBlockNumber(client, args),
    getBlockTransactionCount: (args) => getBlockTransactionCount(client, args),
    getBytecode: (args) => getCode(client, args),
    getChainId: () => getChainId(client),
    getCode: (args) => getCode(client, args),
    getContractEvents: (args) => getContractEvents(client, args),
    getEip712Domain: (args) => getEip712Domain(client, args),
    getEnsAddress: (args) => getEnsAddress(client, args),
    getEnsAvatar: (args) => getEnsAvatar(client, args),
    getEnsName: (args) => getEnsName(client, args),
    getEnsResolver: (args) => getEnsResolver(client, args),
    getEnsText: (args) => getEnsText(client, args),
    getFeeHistory: (args) => getFeeHistory(client, args),
    estimateFeesPerGas: (args) => estimateFeesPerGas(client, args),
    getFilterChanges: (args) => getFilterChanges(client, args),
    getFilterLogs: (args) => getFilterLogs(client, args),
    getGasPrice: () => getGasPrice(client),
    getLogs: (args) => getLogs(client, args),
    getProof: (args) => getProof(client, args),
    estimateMaxPriorityFeePerGas: (args) => estimateMaxPriorityFeePerGas(client, args),
    getStorageAt: (args) => getStorageAt(client, args),
    getTransaction: (args) => getTransaction(client, args),
    getTransactionConfirmations: (args) => getTransactionConfirmations(client, args),
    getTransactionCount: (args) => getTransactionCount(client, args),
    getTransactionReceipt: (args) => getTransactionReceipt(client, args),
    multicall: (args) => multicall(client, args),
    prepareTransactionRequest: (args) => prepareTransactionRequest(client, args),
    readContract: (args) => readContract(client, args),
    sendRawTransaction: (args) => sendRawTransaction(client, args),
    simulateContract: (args) => simulateContract(client, args),
    verifyMessage: (args) => verifyMessage(client, args),
    verifySiweMessage: (args) => verifySiweMessage(client, args),
    verifyTypedData: (args) => verifyTypedData(client, args),
    uninstallFilter: (args) => uninstallFilter(client, args),
    waitForTransactionReceipt: (args) => waitForTransactionReceipt(client, args),
    watchBlocks: (args) => watchBlocks(client, args),
    watchBlockNumber: (args) => watchBlockNumber(client, args),
    watchContractEvent: (args) => watchContractEvent(client, args),
    watchEvent: (args) => watchEvent(client, args),
    watchPendingTransactions: (args) => watchPendingTransactions(client, args)
  };
}

// node_modules/viem/_esm/clients/createPublicClient.js
function createPublicClient(parameters) {
  const { key = "public", name = "Public Client" } = parameters;
  const client = createClient({
    ...parameters,
    key,
    name,
    type: "publicClient"
  });
  return client.extend(publicActions);
}

// node_modules/viem/_esm/constants/address.js
var zeroAddress = "0x0000000000000000000000000000000000000000";

// node_modules/viem/_esm/index.js
init_encodeAbiParameters();
init_encodeFunctionData();
init_toBytes();
init_toHex();
init_getAddress();
init_keccak256();

// node_modules/@imtbl/wallet/dist/browser/index.js
var ae3 = Object.defineProperty;
var oe3 = (e3, t3) => {
  let n3 = {};
  for (var r3 in e3) ae3(n3, r3, { get: e3[r3], enumerable: true });
  return t3 || ae3(n3, Symbol.toStringTag, { value: `Module` }), n3;
};
var se3 = function(e3) {
  return e3.ACCOUNTS_REQUESTED = `accountsRequested`, e3.LOGGED_IN = `loggedIn`, e3.LOGGED_OUT = `loggedOut`, e3;
}({});
var ce3 = function(e3) {
  return e3.ACCOUNTS_CHANGED = `accountsChanged`, e3;
}({});
var le3 = function(e3) {
  return e3.PENDING = `PENDING`, e3.SUBMITTED = `SUBMITTED`, e3.SUCCESSFUL = `SUCCESSFUL`, e3.REVERTED = `REVERTED`, e3.FAILED = `FAILED`, e3.CANCELLED = `CANCELLED`, e3;
}({});
var ue3 = { mainModule: { abi: [{ type: `function`, name: `nonce`, constant: true, inputs: [], outputs: [{ type: `uint256` }], payable: false, stateMutability: `view` }, { type: `function`, name: `readNonce`, constant: true, inputs: [{ type: `uint256`, name: `_space` }], outputs: [{ type: `uint256` }], payable: false, stateMutability: `view` }, { type: `function`, name: `execute`, constant: false, inputs: [{ components: [{ type: `bool`, name: `delegateCall` }, { type: `bool`, name: `revertOnError` }, { type: `uint256`, name: `gasLimit` }, { type: `address`, name: `target` }, { type: `uint256`, name: `value` }, { type: `bytes`, name: `data` }], name: `_txs`, type: `tuple[]` }, { type: `uint256`, name: `_nonce` }, { type: `bytes`, name: `_signature` }], outputs: [], payable: false, stateMutability: `nonpayable` }] } };
var de3 = (e3) => {
  let t3 = toBytes(e3), n3 = t3[0] << 8 | t3[1], r3 = [];
  for (let e4 = 2; e4 < t3.length; ) {
    let n4 = t3[e4++], i3 = t3[e4++];
    if (n4 === 0) r3.push({ unrecovered: true, weight: i3, signature: toHex(t3.slice(e4, e4 + 66)), isDynamic: false }), e4 += 66;
    else if (n4 === 1) r3.push({ weight: i3, address: getAddress(toHex(t3.slice(e4, e4 + 20))) }), e4 += 20;
    else if (n4 === 2) {
      let n5 = getAddress(toHex(t3.slice(e4, e4 + 20)));
      e4 += 20;
      let a3 = t3[e4] << 8 | t3[e4 + 1];
      e4 += 2, r3.push({ unrecovered: true, weight: i3, signature: toHex(t3.slice(e4, e4 + a3)), address: n5, isDynamic: true }), e4 += a3;
    } else throw Error(`Unknown signature part type: ${n4}`);
  }
  return { version: 1, threshold: n3, signers: r3 };
};
var fe4 = (e3) => {
  let { signers: t3, threshold: n3 } = e3, r3 = t3.map((e4) => {
    let t4 = Number(e4.weight);
    if (e4.address && e4.signature === void 0) return encodePacked([`uint8`, `uint8`, `address`], [1, t4, e4.address]);
    if (e4.signature === void 0) throw Error(`Signature value missing for signer`);
    if (e4.isDynamic) {
      let n4 = toBytes(e4.signature), r4 = e4.address ? getAddress(e4.address) : void 0;
      if (!r4) throw Error(`Dynamic signature part must include an address`);
      return encodePacked([`uint8`, `uint8`, `address`, `uint16`, `bytes`], [2, t4, r4, n4.length, toHex(n4)]);
    }
    return encodePacked([`uint8`, `uint8`, `bytes`], [0, t4, e4.signature]);
  });
  return encodePacked([`uint16`, ...Array(r3.length).fill(`bytes`)], [n3, ...r3]);
};
var pe3 = oe3({ coerceNonceSpace: () => _e3, digestOfTransactionsAndNonce: () => he3, encodeMessageSubDigest: () => D4, encodeNonce: () => ve3, encodedTransactions: () => ge4, getEip155ChainId: () => A4, getNonce: () => E4, getNormalisedTransactions: () => T4, packSignatures: () => k4, signAndPackTypedData: () => be3, signERC191Message: () => xe3, signMetaTransactions: () => O4 });
var me3 = parseAbiParameters(`(bool delegateCall, bool revertOnError, uint256 gasLimit, address target, uint256 value, bytes data)[]`);
var T4 = (e3) => e3.map((e4) => ({ delegateCall: e4.delegateCall === true, revertOnError: e4.revertOnError === true, gasLimit: e4.gasLimit ?? BigInt(0), target: e4.to ?? zeroAddress, value: e4.value ?? BigInt(0), data: e4.data ?? `0x` }));
var he3 = (e3, t3) => {
  let n3 = t3.map((e4) => ({ delegateCall: e4.delegateCall, revertOnError: e4.revertOnError, gasLimit: e4.gasLimit, target: e4.target, value: e4.value, data: e4.data }));
  return keccak256(encodeAbiParameters([{ type: `uint256` }, ...me3], [e3, n3]));
};
var ge4 = (e3) => {
  let t3 = e3.map((e4) => ({ delegateCall: e4.delegateCall, revertOnError: e4.revertOnError, gasLimit: e4.gasLimit, target: e4.target, value: e4.value, data: e4.data }));
  return encodeAbiParameters(me3, [t3]);
};
var _e3 = (e3) => e3 || 0n;
var ve3 = (e3, t3) => {
  let n3 = BigInt(e3) * 2n ** 96n;
  return BigInt(t3) + n3;
};
var E4 = async (e3, t3, n3) => {
  try {
    let r3 = getContract({ address: t3, abi: ue3.mainModule.abi, client: e3 }), i3 = _e3(n3), a3 = await r3.read.readNonce([i3]);
    if (typeof a3 == `bigint`) return ve3(i3, a3);
    throw Error(`Unexpected result from contract.readNonce() call.`);
  } catch (e4) {
    if (e4 instanceof Error && (e4.message.includes(`returned no data`) || e4.message.includes(`execution reverted`) || e4.message.includes(`ContractFunctionExecutionError`))) return BigInt(0);
    throw e4;
  }
};
var D4 = (e3, t3, n3) => encodePacked([`string`, `uint256`, `address`, `bytes32`], [``, e3, t3, n3]);
var O4 = async (e3, t3, n3, r3, i3) => {
  let a3 = T4(e3), o4 = he3(t3, a3), s3 = toBytes(keccak256(D4(n3, r3, o4))), c3 = `${await i3.signMessage(s3)}02`, l3 = fe4({ version: 1, threshold: 1, signers: [{ isDynamic: false, unrecovered: true, weight: 1, signature: c3 }] }), u3 = a3.map((e4) => ({ delegateCall: e4.delegateCall, revertOnError: e4.revertOnError, gasLimit: e4.gasLimit, target: e4.target, value: e4.value, data: e4.data }));
  return encodeFunctionData({ abi: ue3.mainModule.abi, functionName: `execute`, args: [u3, t3, l3] });
};
var ye3 = (e3) => de3(`0x0000${e3}`);
var k4 = (e3, t3, n3) => {
  let r3 = `${e3}02`, { signers: i3 } = ye3(n3), a3 = [...i3, { isDynamic: false, unrecovered: true, weight: 1, signature: r3, address: t3 }].sort((e4, t4) => {
    let n4 = BigInt(e4.address ?? 0), r4 = BigInt(t4.address ?? 0);
    return n4 <= r4 ? -1 : n4 === r4 ? 0 : 1;
  });
  return fe4({ version: 1, threshold: 2, signers: a3 });
};
var be3 = async (e3, t3, n3, r3, i3) => {
  let { EIP712Domain: a3, ...o4 } = { ...e3.types }, s3 = hashTypedData({ domain: e3.domain, types: o4, primaryType: e3.primaryType, message: e3.message }), c3 = toBytes(keccak256(D4(n3, r3, s3))), l3 = await i3.signMessage(c3), u3 = await i3.getAddress();
  return k4(l3, u3, t3);
};
var xe3 = async (e3, t3, n3, r3) => {
  let i3 = hashMessage(t3), a3 = toBytes(keccak256(D4(e3, r3, i3)));
  return n3.signMessage(a3);
};
var A4 = (e3) => `eip155:${e3}`;
var Se3 = class e {
  constructor({ config: e3, rpcProvider: t3, getUser: n3 }) {
    __publicField(this, "config");
    __publicField(this, "rpcProvider");
    __publicField(this, "getUser");
    this.config = e3, this.rpcProvider = t3, this.getUser = n3;
  }
  static getResponsePreview(e3) {
    return e3.length > 100 ? `${e3.substring(0, 50)}...${e3.substring(e3.length - 50)}` : e3;
  }
  async getUserZkEvm() {
    let e3 = await this.getUser();
    if (!e3 || !y2(e3)) throw Error(`User not authenticated or missing zkEvm data`);
    return e3;
  }
  async postToRelayer(t3) {
    let n3 = { id: 1, jsonrpc: `2.0`, ...t3 }, r3 = await this.getUserZkEvm(), i3 = await fetch(`${this.config.relayerUrl}/v1/transactions`, { method: `POST`, headers: { Authorization: `Bearer ${r3.accessToken}`, "Content-Type": `application/json` }, body: JSON.stringify(n3) }), a3 = await i3.text();
    if (!i3.ok) {
      let t4 = e.getResponsePreview(a3);
      throw Error(`Relayer HTTP error: ${i3.status}. Content: "${t4}"`);
    }
    let o4;
    try {
      o4 = JSON.parse(a3);
    } catch (t4) {
      let n4 = e.getResponsePreview(a3);
      throw Error(`Relayer JSON parse error: ${t4 instanceof Error ? t4.message : `Unknown error`}. Content: "${n4}"`);
    }
    if (o4.error) throw Error(o4.error);
    return o4;
  }
  getPreferredFeeTokenSymbol() {
    return this.config.feeTokenSymbol;
  }
  async ethSendTransaction(e3, t3) {
    let n3 = await this.rpcProvider.getChainId(), r3 = { method: `eth_sendTransaction`, params: [{ to: e3, data: t3, chainId: A4(Number(n3)) }] }, { result: i3 } = await this.postToRelayer(r3);
    return i3;
  }
  async imGetTransactionByHash(e3) {
    let t3 = { method: `im_getTransactionByHash`, params: [e3] }, { result: n3 } = await this.postToRelayer(t3);
    return n3;
  }
  async imGetFeeOptions(e3, t3) {
    let n3 = await this.rpcProvider.getChainId(), r3 = { method: `im_getFeeOptions`, params: [{ userAddress: e3, data: t3, chainId: A4(Number(n3)) }] }, { result: i3 } = await this.postToRelayer(r3);
    return i3;
  }
  async imSignTypedData(e3, t3) {
    let n3 = await this.rpcProvider.getChainId(), r3 = { method: `im_signTypedData`, params: [{ address: e3, eip712Payload: t3, chainId: A4(Number(n3)) }] }, { result: i3 } = await this.postToRelayer(r3);
    return i3;
  }
  async imSign(e3, t3) {
    let n3 = await this.rpcProvider.getChainId(), r3 = { method: `im_sign`, params: [{ address: e3, message: t3, chainId: A4(Number(n3)) }] }, { result: i3 } = await this.postToRelayer(r3);
    return i3;
  }
};
var Ce3 = function(e3) {
  return e3[e3.USER_REJECTED_REQUEST = 4001] = `USER_REJECTED_REQUEST`, e3[e3.UNAUTHORIZED = 4100] = `UNAUTHORIZED`, e3[e3.UNSUPPORTED_METHOD = 4200] = `UNSUPPORTED_METHOD`, e3[e3.DISCONNECTED = 4900] = `DISCONNECTED`, e3;
}({});
var we3 = function(e3) {
  return e3[e3.RPC_SERVER_ERROR = -32e3] = `RPC_SERVER_ERROR`, e3[e3.TRANSACTION_REVERTED = -32015] = `TRANSACTION_REVERTED`, e3[e3.INVALID_REQUEST = -32600] = `INVALID_REQUEST`, e3[e3.METHOD_NOT_FOUND = -32601] = `METHOD_NOT_FOUND`, e3[e3.INVALID_PARAMS = -32602] = `INVALID_PARAMS`, e3[e3.INTERNAL_ERROR = -32603] = `INTERNAL_ERROR`, e3[e3.PARSE_ERROR = -32700] = `PARSE_ERROR`, e3[e3.TRANSACTION_REJECTED = -32003] = `TRANSACTION_REJECTED`, e3;
}({});
var j4 = class extends Error {
  constructor(e3, t3) {
    super(t3);
    __publicField(this, "message");
    __publicField(this, "code");
    this.message = t3, this.code = e3;
  }
};
function Te3(e3) {
  return e3.startsWith(`0x`) ? e3 : `0x${e3}`;
}
function Ee3(e3) {
  return e3.startsWith(`0x`) ? e3.slice(2) : e3;
}
function M4(e3, t3) {
  return e3.padStart(t3, `0`);
}
function De2(e3) {
  let t3 = M4(e3.r.toString(16), 64), n3 = M4(e3.s.toString(16), 64), r3 = M4(e3.recoveryParam?.toString(16) || ``, 2);
  return Te3(t3 + n3 + r3);
}
function Oe2(e3) {
  if (!e3.trim()) return;
  let t3 = parseInt(e3, 16);
  return t3 >= 27 ? t3 - 27 : t3;
}
function ke2(e3, t3 = 64) {
  let n3 = Ee3(e3);
  return { r: BigInt(`0x${n3.substring(0, t3)}`), s: BigInt(`0x${n3.substring(t3, t3 * 2)}`), recoveryParam: Oe2(n3.substring(t3 * 2, t3 * 2 + 2)) };
}
async function Ae2(e3, t3) {
  return De2(ke2(await t3.signMessage(e3)));
}
async function je2({ getUser: e3, ethSigner: t3, multiRollupApiClients: n3, accessToken: r3, rpcProvider: i3, flow: a3 }) {
  let o4 = t3.getAddress();
  o4.then(() => a3.addEvent(`endGetAddress`));
  let s3 = Ae2(`Only sign this message from Immutable Passport`, t3);
  s3.then(() => a3.addEvent(`endSignRaw`));
  let c3 = i3.getChainId();
  c3.then(() => a3.addEvent(`endDetectNetwork`));
  let l3 = n3.chainsApi.listChains();
  l3.then(() => a3.addEvent(`endListChains`));
  let [u3, d3, f3, p4] = await Promise.all([o4, s3, c3, l3]), m4 = A4(Number(f3)), h4 = p4.data?.result?.find((e4) => e4.id === m4)?.name;
  if (!h4) throw new j4(-32603, `Chain name does not exist on for chain id ${f3}`);
  try {
    let t4 = await n3.passportApi.createCounterfactualAddressV2({ chainName: h4, createCounterfactualAddressRequest: { ethereum_address: u3, ethereum_signature: d3 } }, { headers: { Authorization: `Bearer ${r3}` } });
    return a3.addEvent(`endCreateCounterfactualAddress`), e3 && e3().catch(() => {
    }), t4.data.counterfactual_address;
  } catch (e4) {
    throw new j4(-32603, `Failed to create counterfactual address: ${e4}`);
  }
}
var Me2 = `imx_passport_confirmation`;
var N4 = ({ url: e3, title: t3, width: n3, height: r3 }) => {
  let i3 = Math.max(0, Math.round(window.screenX + (window.outerWidth - n3) / 2)), a3 = Math.max(0, Math.round(window.screenY + (window.outerHeight - r3) / 2)), o4 = window.open(e3, t3, `
      scrollbars=yes,
      width=${n3}, 
      height=${r3}, 
      top=${a3}, 
      left=${i3}
     `);
  if (!o4) throw Error(`Failed to open confirmation screen`);
  return o4.focus(), o4;
};
var P4 = `passport-overlay`;
var Ne2 = `${P4}-close`;
var Pe2 = `${P4}-try-again`;
var Fe2 = `
  <svg
    style="
      max-width: 123px !important;
      margin-bottom: 24px !important;
    "
    viewBox="0 0 124 112"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_332_47939)">
      <g clip-path="url(#clip1_332_47939)">
        <path
          d="M4.10008 74.9453H0.5V93.6041H4.10008V74.9453Z"
          fill="#F3F3F3"
        />
        <path
          d="M22.9585 80.0212C21.1727 80.0212 19.5283 80.7622 18.5505 82.3115C17.8209 80.8013 16.3595 80.0212 14.4691 80.0212C12.864 80.0212 11.3786 80.7231 10.4792 82.1681V80.282H7.00976V93.6063H10.4792V86.2032C10.4792 84.3432 11.7445 82.9503 13.3475 82.9503H13.5565C14.9787 82.9503 15.643 83.8477 15.643 85.6187V93.6085H19.1124V86.2054C19.1124 84.3453 20.3647 82.9525 21.9676 82.9525H22.1767C23.5989 82.9525 24.237 83.8499 24.237 85.6208V93.6106H27.7064V85.2188C27.7064 83.6435 27.3274 82.3832 26.5717 81.4315C25.8029 80.4949 24.6029 80.0256 22.9585 80.0256V80.0212Z"
          fill="#F3F3F3"
        />
        <path
          d="M46.0291 80.0212C44.2432 80.0212 42.5989 80.7622 41.621 82.3115C40.8914 80.8013 39.43 80.0212 37.5396 80.0212C35.9345 80.0212 34.4492 80.7231 33.5497 82.1681V80.282H30.0803V93.6063H33.5497V86.2032C33.5497 84.3432 34.8151 82.9503 36.418 82.9503H36.6271C38.0493 82.9503 38.7135 83.8477 38.7135 85.6187V93.6085H42.1829V86.2054C42.1829 84.3453 43.4352 82.9525 45.0381 82.9525H45.2472C46.6694 82.9525 47.3075 83.8499 47.3075 85.6208V93.6106H50.7769V85.2188C50.7769 83.6435 50.398 82.3832 49.6422 81.4315C48.8734 80.4949 47.6734 80.0256 46.0291 80.0256V80.0212Z"
          fill="#F3F3F3"
        />
        <path
          d="M72.3077 89.2061V83.0785H75.2936V80.282H72.3077V75.9622H68.8383V80.282H61.4312V87.6851C61.4312 89.5451 60.192 91.0683 58.6805 91.0683H58.4715C57.2061 91.0683 56.4896 90.1318 56.4896 88.413V80.282H53.0202V88.8041C53.0202 90.3534 53.3991 91.5746 54.1549 92.4872C54.8975 93.4107 56.0322 93.867 57.5328 93.867C59.188 93.867 60.6102 93.0218 61.4312 91.655V93.6063H64.9006V83.0807H68.8405V90.1448C68.8405 92.396 70.0536 93.6063 72.3099 93.6063H75.7009V90.6794H73.7843C72.5582 90.6794 72.3099 90.4317 72.3099 89.2083L72.3077 89.2061Z"
          fill="#F3F3F3"
        />
        <path
          d="M88.0757 84.8082C88.0757 81.7378 85.8325 80.0191 82.4676 80.0191C79.1027 80.0191 77.0033 81.8791 76.7158 84.404H80.1982C80.2766 83.5979 81.0977 82.8156 82.35 82.8156H82.5722C83.8506 82.8156 84.7109 83.7391 84.7109 84.9364V85.2623L81.346 85.5622C79.9108 85.6795 78.7369 86.0945 77.8243 86.8246C76.9118 87.5525 76.4544 88.5934 76.4544 89.9471C76.4152 92.2895 78.4363 93.8888 80.8364 93.8627C82.5438 93.8627 83.9529 93.1348 84.7871 91.9766C84.8132 92.6785 84.8655 93.226 84.9439 93.6019H88.2042C88.1127 92.9783 88.0735 92.0005 88.0735 90.675V84.806L88.0757 84.8082ZM84.7109 88.1653C84.7109 89.8428 83.3148 91.0661 81.738 91.0661H81.5289C80.5772 91.0661 79.8737 90.5316 79.8737 89.7124C79.8737 89.204 80.0697 88.8281 80.4596 88.5543C80.8516 88.2805 81.3068 88.124 81.8164 88.0849L84.7109 87.785V88.1653Z"
          fill="#F3F3F3"
        />
        <path
          d="M97.7935 80.0212C96.0076 80.0212 94.5201 81.036 93.9452 82.0116V74.9475H90.4758V93.6063H93.9452V91.8766C94.5201 92.8523 96.0055 93.867 97.7935 93.867C101.537 93.9322 103.765 90.5881 103.726 86.9441C103.765 83.3002 101.535 79.956 97.7935 80.0212ZM97.2055 91.0683H96.9964C95.4044 91.1074 93.919 89.3908 93.9452 86.9441C93.919 84.4974 95.4065 82.7808 96.9964 82.8199H97.2055C98.9522 82.8199 100.257 84.4192 100.257 86.9181C100.257 89.4169 98.9391 91.0683 97.2055 91.0683Z"
          fill="#F3F3F3"
        />
        <path
          d="M108.931 74.9453H105.462V93.6041H108.931V74.9453Z"
          fill="#F3F3F3"
        />
        <path
          d="M117.057 80.0212C113.146 79.9691 110.667 82.9612 110.706 86.9441C110.641 91.1987 113.705 93.9192 117.057 93.867C120.33 93.867 122.443 92.0461 123.094 89.3908H119.651C119.403 90.3665 118.555 91.0683 117.303 91.0683H117.081C115.633 91.0683 114.2 89.8189 114.069 88.0371H123.094C123.133 87.4656 123.147 87.0484 123.147 86.7877C123.186 82.8982 120.956 79.9821 117.057 80.0212ZM114.071 85.3688C114.15 83.7934 115.363 82.8178 116.824 82.8178H117.033C118.495 82.8178 119.708 83.7934 119.784 85.3688H114.071Z"
          fill="#F3F3F3"
        />
      </g>
      <path
        d="M30.4851 101.025V109H32.0581V106.195H33.2571C35.0941 106.195 36.7221 105.7 36.7221 103.665C36.7221 101.256 34.8521 101.025 33.2131 101.025H30.4851ZM33.2461 102.257C34.1041 102.257 35.1051 102.367 35.1051 103.676C35.1051 104.732 34.3351 104.974 33.3561 104.974H32.0581V102.257H33.2461Z"
        fill="#F3F3F3"
      />
      <path
        d="M36.9683 109H38.5743L39.1353 107.383H42.2373L42.7983 109H44.5034L41.5224 101.025H39.9383L36.9683 109ZM40.6863 102.95L41.7863 106.096H39.5863L40.6863 102.95Z"
        fill="#F3F3F3"
      />
      <path
        d="M49.1875 105.689C50.0345 105.843 50.6615 106.096 50.6615 106.778C50.6615 107.636 49.7705 107.889 49.0665 107.889C48.1205 107.889 47.3065 107.537 47.1305 106.371H45.6125C45.7555 108.087 47.0535 109.143 49.0115 109.143C50.6175 109.143 52.2455 108.34 52.2455 106.701C52.2455 105.051 50.8155 104.534 49.5175 104.303L48.4725 104.116C47.8345 103.995 47.3615 103.687 47.3615 103.126C47.3615 102.411 48.1755 102.136 48.9015 102.136C49.6495 102.136 50.4635 102.444 50.5845 103.379H52.1025C52.0255 101.85 50.6175 100.882 48.9675 100.882C47.4935 100.882 45.7885 101.586 45.7885 103.192C45.7885 104.578 46.8775 105.249 48.1755 105.502L49.1875 105.689Z"
        fill="#F3F3F3"
      />
      <path
        d="M57.5244 105.689C58.3714 105.843 58.9984 106.096 58.9984 106.778C58.9984 107.636 58.1074 107.889 57.4034 107.889C56.4574 107.889 55.6434 107.537 55.4674 106.371H53.9494C54.0924 108.087 55.3904 109.143 57.3484 109.143C58.9544 109.143 60.5824 108.34 60.5824 106.701C60.5824 105.051 59.1524 104.534 57.8544 104.303L56.8094 104.116C56.1714 103.995 55.6984 103.687 55.6984 103.126C55.6984 102.411 56.5124 102.136 57.2384 102.136C57.9864 102.136 58.8004 102.444 58.9214 103.379H60.4394C60.3624 101.85 58.9544 100.882 57.3044 100.882C55.8304 100.882 54.1254 101.586 54.1254 103.192C54.1254 104.578 55.2144 105.249 56.5124 105.502L57.5244 105.689Z"
        fill="#F3F3F3"
      />
      <path
        d="M62.5544 101.025V109H64.1274V106.195H65.3264C67.1634 106.195 68.7914 105.7 68.7914 103.665C68.7914 101.256 66.9214 101.025 65.2824 101.025H62.5544ZM65.3154 102.257C66.1734 102.257 67.1744 102.367 67.1744 103.676C67.1744 104.732 66.4044 104.974 65.4254 104.974H64.1274V102.257H65.3154Z"
        fill="#F3F3F3"
      />
      <path
        d="M71.8888 105.007C71.8888 103.137 72.9228 102.136 74.1658 102.136C75.4088 102.136 76.4428 103.137 76.4428 105.007C76.4428 106.877 75.4088 107.889 74.1658 107.889C72.9228 107.889 71.8888 106.877 71.8888 105.007ZM78.0708 105.007C78.0708 102.532 76.5418 100.882 74.1658 100.882C71.7898 100.882 70.2608 102.532 70.2608 105.007C70.2608 107.482 71.7898 109.143 74.1658 109.143C76.5418 109.143 78.0708 107.482 78.0708 105.007Z"
        fill="#F3F3F3"
      />
      <path
        d="M85.0133 109H86.7623L84.9913 105.546C85.9813 105.128 86.4323 104.358 86.4323 103.445C86.4323 101.773 85.4313 101.025 82.8023 101.025H80.1843V109H81.7573V105.876H83.0553H83.4293L85.0133 109ZM82.9783 102.257C84.0453 102.257 84.8153 102.532 84.8153 103.456C84.8153 104.237 84.2763 104.655 83.0553 104.655H81.7573V102.257H82.9783Z"
        fill="#F3F3F3"
      />
      <path
        d="M90.1424 109H91.7154V102.301H94.1794V101.025H87.6894V102.301H90.1424V109Z"
        fill="#F3F3F3"
      />
      <g clip-path="url(#clip2_332_47939)">
        <circle
          cx="61.5"
          cy="30"
          r="28.125"
          fill="url(#paint0_radial_332_47939)"
        />
        <circle
          cx="61.5"
          cy="30"
          r="28.125"
          fill="url(#paint1_radial_332_47939)"
        />
        <path
          d="M61.5 0C44.9315 0 31.5 13.4315 31.5 30C31.5 46.5685 44.9315 60 61.5 60C78.0685 60 91.5 46.5685 91.5 30C91.5 13.4315 78.0685 0 61.5 0ZM60.3397 11.4576C61.1729 11.0494 62.0508 11.0774 62.8588 11.5359C65.6603 13.1323 68.4534 14.7428 71.2325 16.37C72.1272 16.8956 72.5857 17.7372 72.5885 18.7717C72.6053 22.3979 72.5997 26.0214 72.5885 29.6477C72.5885 29.7819 72.5019 29.9776 72.3928 30.0419C71.3164 30.685 70.226 31.3029 69.0433 31.9851V31.4147C69.0433 27.685 69.0322 23.9581 69.0517 20.2283C69.0545 19.5126 68.8085 19.0513 68.1738 18.6906C64.9222 16.8425 61.6873 14.9609 58.4469 13.0904C58.3071 13.0093 58.1701 12.9226 57.9576 12.794C58.7908 12.3215 59.5401 11.8462 60.3341 11.4576H60.3397ZM59.7442 48.5564C59.5624 48.4641 59.4282 48.3998 59.2968 48.3243C55.0051 45.8499 50.719 43.3588 46.4133 40.904C45.2055 40.2162 44.6547 39.2349 44.6687 37.8565C44.6938 34.9264 44.6855 31.9963 44.6715 29.0634C44.6659 27.7409 45.2027 26.7819 46.3658 26.1221C49.3882 24.4026 52.3938 22.658 55.3993 20.9105C55.6594 20.7596 55.8495 20.7344 56.1207 20.8966C57.158 21.52 58.2148 22.1156 59.3192 22.753C59.1095 22.8788 58.9501 22.9739 58.788 23.069C55.5335 24.9478 52.2847 26.8322 49.0219 28.6999C48.4879 29.0047 48.239 29.4017 48.2446 30.0224C48.2614 32.3318 48.2642 34.6412 48.2446 36.9506C48.239 37.5881 48.4935 37.9935 49.0415 38.3066C52.4832 40.2749 55.911 42.2656 59.35 44.2395C59.6407 44.4073 59.7637 44.5806 59.7582 44.9273C59.733 46.11 59.7498 47.2954 59.7498 48.5592L59.7442 48.5564ZM59.7442 41.9413C59.445 41.7707 59.2297 41.6505 59.0144 41.5247C56.2856 39.9506 53.5596 38.3709 50.8253 36.808C50.5289 36.6403 50.4199 36.4585 50.4226 36.1146C50.4422 34.3392 50.4338 32.5638 50.4282 30.7884C50.4282 30.548 50.4646 30.383 50.7022 30.2488C51.7088 29.6869 52.7041 29.0997 53.7022 28.5266C53.7749 28.4846 53.8532 28.4539 53.9846 28.3896V30.383C53.9846 31.4623 54.0014 32.5443 53.979 33.6235C53.9651 34.2386 54.2027 34.6552 54.7395 34.9571C56.2856 35.8294 57.8122 36.7353 59.3583 37.6048C59.6631 37.7754 59.7554 37.9655 59.7498 38.301C59.7302 39.4809 59.7414 40.6636 59.7414 41.9385L59.7442 41.9413ZM56.5932 18.6375C56.0144 18.2964 55.5196 18.2992 54.9408 18.6375C51.6976 20.5331 48.4404 22.4035 45.1859 24.2824C45.0489 24.3635 44.9063 24.4362 44.6631 24.5676C44.7498 23.3318 44.4842 22.1659 44.9063 21.0363C45.1356 20.4185 45.5662 19.9543 46.1365 19.6244C48.8514 18.0559 51.5634 16.4846 54.2838 14.9245C55.2763 14.3541 56.2884 14.3681 57.281 14.9413C60.3705 16.7195 63.4571 18.5033 66.5382 20.2926C66.6696 20.3681 66.8346 20.5387 66.8346 20.6673C66.8569 21.9366 66.8486 23.2088 66.8486 24.5704C65.7274 23.9245 64.6929 23.3262 63.6584 22.7279C61.3015 21.3663 58.939 20.0186 56.5932 18.6375ZM78.3033 38.5974C78.2223 39.5955 77.6379 40.3029 76.774 40.8006C73.4664 42.7018 70.1617 44.6142 66.8569 46.521C65.8197 47.1193 64.7824 47.7176 63.7423 48.3159C63.6165 48.3886 63.4879 48.4501 63.3173 48.5396C63.3061 48.3663 63.2922 48.2404 63.2922 48.1146C63.2922 47.0186 63.2978 45.9254 63.2866 44.8294C63.2866 44.5806 63.3453 44.4296 63.5746 44.2982C68.3947 41.5247 73.212 38.7428 78.0266 35.9637C78.0993 35.9217 78.1803 35.8882 78.3173 35.8239C78.3173 36.7968 78.3732 37.7027 78.3033 38.5974ZM78.3285 31.6971C78.3201 32.8322 77.7078 33.6291 76.7377 34.1883C72.9688 36.3551 69.2027 38.5331 65.4366 40.7083C64.7488 41.1053 64.0582 41.4995 63.3201 41.9245C63.3089 41.7372 63.295 41.6142 63.295 41.4883C63.295 40.4091 63.3062 39.3271 63.2866 38.2479C63.281 37.9404 63.3844 37.7782 63.65 37.6244C67.075 35.6589 70.4888 33.671 73.9194 31.7167C74.5289 31.37 74.7973 30.9422 74.7917 30.2265C74.7665 26.4967 74.7805 22.767 74.7805 19.0373V18.3858C75.6752 18.9254 76.514 19.37 77.2801 19.9124C77.979 20.4073 78.3313 21.1566 78.3341 22.0205C78.3453 25.247 78.3537 28.4734 78.3313 31.6999L78.3285 31.6971Z"
          fill="#131313"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M61.5 0C44.9315 0 31.5 13.4315 31.5 30C31.5 46.5685 44.9315 60 61.5 60C78.0685 60 91.5 46.5685 91.5 30C91.5 13.4315 78.0685 0 61.5 0ZM61.5 2.5C46.3122 2.5 34 14.8122 34 30C34 45.1878 46.3122 57.5 61.5 57.5C76.6878 57.5 89 45.1878 89 30C89 14.8122 76.6878 2.5 61.5 2.5Z"
          fill="url(#paint2_radial_332_47939)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M61.5 0C44.9315 0 31.5 13.4315 31.5 30C31.5 46.5685 44.9315 60 61.5 60C78.0685 60 91.5 46.5685 91.5 30C91.5 13.4315 78.0685 0 61.5 0ZM61.5 2.5C46.3122 2.5 34 14.8122 34 30C34 45.1878 46.3122 57.5 61.5 57.5C76.6878 57.5 89 45.1878 89 30C89 14.8122 76.6878 2.5 61.5 2.5Z"
          fill="url(#paint3_radial_332_47939)"
        />
      </g>
    </g>
    <defs>
      <radialGradient
        id="paint0_radial_332_47939"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(48.3053 16.7373) rotate(44.9817) scale(58.4359 123.929)"
      >
        <stop stop-color="#A3EEF8" />
        <stop offset="0.177083" stop-color="#A4DCF5" />
        <stop offset="0.380208" stop-color="#A6AEEC" />
        <stop offset="1" stop-color="#ECBEE1" />
      </radialGradient>
      <radialGradient
        id="paint1_radial_332_47939"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(63.9394 54.6335) rotate(84.265) scale(30.2672 57.9018)"
      >
        <stop stop-color="#FCF5EE" />
        <stop offset="0.715135" stop-color="#ECBEE1" stop-opacity="0" />
      </radialGradient>
      <radialGradient
        id="paint2_radial_332_47939"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(47.4257 15.8532) rotate(44.9817) scale(62.3316 132.191)"
      >
        <stop stop-color="#A3EEF8" />
        <stop offset="0.177083" stop-color="#A4DCF5" />
        <stop offset="0.380208" stop-color="#A6AEEC" />
        <stop offset="1" stop-color="#ECBEE1" />
      </radialGradient>
      <radialGradient
        id="paint3_radial_332_47939"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(64.102 56.2758) rotate(84.265) scale(32.2851 61.7619)"
      >
        <stop stop-color="#FCF5EE" />
        <stop offset="0.715135" stop-color="#ECBEE1" stop-opacity="0" />
      </radialGradient>
      <clipPath id="clip0_332_47939">
        <rect
          width="123"
          height="112"
          fill="white"
          transform="translate(0.5)"
        />
      </clipPath>
      <clipPath id="clip1_332_47939">
        <rect
          width="123"
          height="19"
          fill="white"
          transform="translate(0.5 75)"
        />
      </clipPath>
      <clipPath id="clip2_332_47939">
        <rect
          width="60"
          height="60"
          fill="white"
          transform="translate(31.5)"
        />
      </clipPath>
    </defs>
  </svg>
`;
var Ie2 = () => `
    <button
      id="${Ne2}"
      style="
        background: #f3f3f326 !important;
        border: none !important;
        border-radius: 50% !important;
        width: 48px !important;
        height: 48px !important;
        position: absolute !important;
        top: 40px !important;
        right: 40px !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      "
    >
      
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style="width: 20px !important;"
    >
      <path
        d="M16.25 5.75833L14.2417 3.75L10 7.99167L5.75833 3.75L3.75 5.75833L7.99167 10L3.75 14.2417L5.75833 16.25L10 12.0083L14.2417 16.25L16.25 14.2417L12.0083 10L16.25 5.75833Z"
        fill="#F3F3F3"
      />
  </svg>

    </button>
  `;
var Le2 = () => `
  <button
    id="${Pe2}"
    style="
      margin-top: 27px !important;
      color: #f3f3f3 !important;
      background: transparent !important;
      padding: 12px 24px !important;
      border-radius: 30px !important;
      border: 2px solid #f3f3f3 !important;
      font-size: 1em !important;
      font-weight: 500 !important;
      cursor: pointer !important;
    "
  >
    Try again
  </button>
`;
var Re2 = () => `
    ${Fe2}
    <div
      style="
        color: #e01a3d !important;
        display: flex !important;
        align-items: center !important;
        gap: 4px !important;
        margin-bottom: 10px !important;
      "
    >
      
  <svg
  viewBox="0 0 17 16"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  style="width: 16px !important;"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M0.5 14.3333L8.5 0.333336L16.5 14.3333H0.5ZM9.16667 10.6667V12H7.83333V10.6667H9.16667ZM9.16667 5.33334L9.16667 9.33334H7.83333L7.83333 5.33334H9.16667Z"
      fill="#E01A3D"
    />
  </svg>

      Pop-up blocked
    </div>
    <p style="
        color: #b6b6b6 !important;
        text-align: center !important;
        margin: 0 !important;
      "
    >
      Please try again below.<br />
      If the problem continues, adjust your<br />
      browser settings.
    </p>
    ${Le2()}
  `;
var ze2 = () => `
    ${Fe2}
    <p style="
        color: #b6b6b6 !important;
        text-align: center !important;
        margin: 0 !important;
      "
    >
      Secure pop-up not showing?<br />We'll help you re-launch
    </p>
    ${Le2()}
  `;
var Be2 = (e3) => `
    <div
      id="${P4}"
      style="
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: rgba(13, 13, 13, 0.48) !important;
        backdrop-filter: blur(28px) !important;
        -webkit-backdrop-filter: blur(28px) !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        align-items: center !important;
        font-size: 16px !important;
        line-height: 1.5 !important;
        font-family: Roboto !important;
        font-style: normal !important;
        font-weight: 400 !important;
        font-feature-settings: 'clig' off, 'liga' off !important;
        z-index: 2147483647 !important;
      "
    >
      ${Ie2()}
      <div
        id="passport-overlay-contents"
        style="
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          max-width: 400px !important;
        "
      >
        ${e3 ?? ``}
      </div>
    </div>
  `;
function F4({ id: e3, href: t3, rel: n3, crossOrigin: r3 }) {
  let i3 = `${P4}-${e3}`;
  if (!document.getElementById(i3)) {
    let e4 = document.createElement(`link`);
    e4.id = i3, e4.href = t3, n3 && (e4.rel = n3), r3 && (e4.crossOrigin = r3), document.head.appendChild(e4);
  }
}
var Ve2 = () => Be2(Re2());
var He2 = () => Be2(ze2());
var Ue2 = class {
  constructor(e3, t3 = false) {
    __publicField(this, "disableGenericPopupOverlay");
    __publicField(this, "disableBlockedPopupOverlay");
    __publicField(this, "overlay");
    __publicField(this, "isBlockedOverlay");
    __publicField(this, "tryAgainListener");
    __publicField(this, "onCloseListener");
    this.disableBlockedPopupOverlay = e3.disableBlockedPopupOverlay || false, this.disableGenericPopupOverlay = e3.disableGenericPopupOverlay || false, this.isBlockedOverlay = t3;
  }
  append(e3, t3) {
    this.shouldAppendOverlay() && (this.appendOverlay(), this.updateTryAgainButton(e3), this.updateCloseButton(t3));
  }
  update(e3) {
    this.updateTryAgainButton(e3);
  }
  remove() {
    this.overlay && this.overlay.remove();
  }
  shouldAppendOverlay() {
    return !(this.disableGenericPopupOverlay && this.disableBlockedPopupOverlay || this.disableGenericPopupOverlay && !this.isBlockedOverlay || this.disableBlockedPopupOverlay && this.isBlockedOverlay);
  }
  appendOverlay() {
    if (!this.overlay) {
      F4({ id: `link-googleapis`, href: `https://fonts.googleapis.com` }), F4({ id: `link-gstatic`, href: `https://fonts.gstatic.com`, crossOrigin: `anonymous` }), F4({ id: `link-roboto`, href: `https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&display=swap`, rel: `stylesheet` });
      let e3 = document.createElement(`div`);
      e3.innerHTML = this.isBlockedOverlay ? Ve2() : He2(), document.body.insertAdjacentElement(`beforeend`, e3), this.overlay = e3;
    }
  }
  updateTryAgainButton(e3) {
    let t3 = document.getElementById(Pe2);
    t3 && (this.tryAgainListener && t3.removeEventListener(`click`, this.tryAgainListener), this.tryAgainListener = e3, t3.addEventListener(`click`, e3));
  }
  updateCloseButton(e3) {
    let t3 = document.getElementById(Ne2);
    t3 && (this.onCloseListener && t3.removeEventListener(`click`, this.onCloseListener), this.onCloseListener = e3, t3.addEventListener(`click`, e3));
  }
};
var I4 = `Confirm this transaction`;
var We2 = 1e3;
var Ge2 = class {
  constructor(e3) {
    __publicField(this, "config");
    __publicField(this, "confirmationWindow");
    __publicField(this, "popupOptions");
    __publicField(this, "overlay");
    __publicField(this, "overlayClosed");
    __publicField(this, "timer");
    this.config = e3, this.overlayClosed = false;
  }
  getHref(e3, t3) {
    let n3 = `${this.config.passportDomain}/transaction-confirmation/${e3}`;
    if (t3) {
      let e4 = t3 ? Object.keys(t3).map((e5) => `${e5}=${t3[e5]}`).join(`&`) : ``;
      n3 = `${n3}?${e4}`;
    }
    return n3;
  }
  requestConfirmation(e3, t3, n3, r3) {
    return new Promise((i3, a3) => {
      let o4 = ({ data: e4, origin: t4 }) => {
        if (t4 === this.config.passportDomain && e4.eventType === `imx_passport_confirmation`) switch (e4.messageType) {
          case `confirmation_window_ready`:
            this.confirmationWindow?.postMessage({ eventType: Me2, messageType: `confirmation_start` }, this.config.passportDomain);
            break;
          case `transaction_confirmed`:
            this.closeWindow(), i3({ confirmed: true });
            break;
          case `transaction_rejected`:
            this.closeWindow(), i3({ confirmed: false });
            break;
          case `transaction_error`:
            this.closeWindow(), a3(Error(`Error during transaction confirmation`));
            break;
          default:
            this.closeWindow(), a3(Error(`Unsupported message type`));
        }
      }, s3 = this.getHref(`zkevm/transaction`, { transactionID: e3, etherAddress: t3, chainType: n3, chainID: r3 });
      window.addEventListener(`message`, o4), this.showConfirmationScreen(s3, o4, i3);
    });
  }
  requestMessageConfirmation(e3, t3, n3) {
    return new Promise((r3, i3) => {
      let a3 = ({ data: e4, origin: t4 }) => {
        if (t4 === this.config.passportDomain && e4.eventType === `imx_passport_confirmation`) switch (e4.messageType) {
          case `confirmation_window_ready`:
            this.confirmationWindow?.postMessage({ eventType: Me2, messageType: `confirmation_start` }, this.config.passportDomain);
            break;
          case `message_confirmed`:
            this.closeWindow(), r3({ confirmed: true });
            break;
          case `message_rejected`:
            this.closeWindow(), r3({ confirmed: false });
            break;
          case `message_error`:
            this.closeWindow(), i3(Error(`Error during message confirmation`));
            break;
          default:
            this.closeWindow(), i3(Error(`Unsupported message type`));
        }
      };
      window.addEventListener(`message`, a3);
      let o4 = this.getHref(`zkevm/message`, { messageID: e3, etherAddress: t3, ...n3 ? { messageType: n3 } : {} });
      this.showConfirmationScreen(o4, a3, r3);
    });
  }
  showServiceUnavailable() {
    return new Promise((e3, t3) => {
      this.showConfirmationScreen(this.getHref(`unavailable`), () => {
      }, () => {
        this.closeWindow(), t3(Error(`Service unavailable`));
      });
    });
  }
  loading(e3) {
    if (!this.config.crossSdkBridgeEnabled) {
      this.popupOptions = e3;
      try {
        this.confirmationWindow = N4({ url: this.getHref(`loading`), title: I4, width: e3?.width || 480, height: e3?.height || 720 }), this.overlay = new Ue2(this.config.popupOverlayOptions || {});
      } catch (e4) {
        let t3 = e4 instanceof Error ? e4.message : String(e4);
        Z(`passport`, `confirmationPopupDenied`, Error(t3)), this.overlay = new Ue2(this.config.popupOverlayOptions || {}, true);
      }
      this.overlay.append(() => {
        try {
          this.confirmationWindow?.close(), this.confirmationWindow = N4({ url: this.getHref(`loading`), title: I4, width: this.popupOptions?.width || 480, height: this.popupOptions?.height || 720 });
        } catch {
        }
      }, () => {
        this.overlayClosed = true, this.closeWindow();
      });
    }
  }
  closeWindow() {
    this.confirmationWindow?.close(), this.overlay?.remove(), this.overlay = void 0;
  }
  showConfirmationScreen(e3, t3, n3) {
    if (this.confirmationWindow && (this.confirmationWindow.location.href = e3), !this.overlay) {
      this.overlayClosed = false, n3({ confirmed: false });
      return;
    }
    let r3 = () => {
      (this.confirmationWindow?.closed || this.overlayClosed) && (clearInterval(this.timer), window.removeEventListener(`message`, t3), n3({ confirmed: false }), this.overlayClosed = false, this.confirmationWindow = void 0);
    };
    this.timer = setInterval(r3, We2), this.overlay.update(() => this.recreateConfirmationWindow(e3, r3));
  }
  recreateConfirmationWindow(e3, t3) {
    try {
      clearInterval(this.timer), this.confirmationWindow?.close(), this.confirmationWindow = N4({ url: e3, title: I4, width: this.popupOptions?.width || 480, height: this.popupOptions?.height || 720 }), this.timer = setInterval(t3, We2);
    } catch {
    }
  }
};
var Ke2 = function(e3) {
  return e3.WALLET_CONNECTION_ERROR = `WALLET_CONNECTION_ERROR`, e3.TRANSACTION_REJECTED = `TRANSACTION_REJECTED`, e3.INVALID_CONFIGURATION = `INVALID_CONFIGURATION`, e3.UNAUTHORIZED = `UNAUTHORIZED`, e3.GUARDIAN_ERROR = `GUARDIAN_ERROR`, e3.SERVICE_UNAVAILABLE_ERROR = `SERVICE_UNAVAILABLE_ERROR`, e3.NOT_LOGGED_IN_ERROR = `NOT_LOGGED_IN_ERROR`, e3;
}({});
var L4 = class extends Error {
  constructor(e3, t3) {
    super(e3);
    __publicField(this, "type");
    this.name = `WalletError`, this.type = t3;
  }
};
var R4 = (e3) => typeof e3 == `object` && !!e3 && `isAxiosError` in e3;
var z4 = `Transaction requires confirmation but this functionality is not supported in this environment. Please contact Immutable support if you need to enable this feature.`;
var B4 = (e3) => BigInt(e3).toString();
var qe2 = (e3) => {
  try {
    return e3.map((e4) => ({ delegateCall: e4.delegateCall === true, revertOnError: e4.revertOnError === true, gasLimit: e4.gasLimit ? B4(e4.gasLimit) : `0`, target: e4.to ?? zeroAddress, value: e4.value ? B4(e4.value) : `0`, data: e4.data ? e4.data.toString() : `0x` }));
  } catch (e4) {
    throw new j4(-32602, `Transaction failed to parsing: ${e4 instanceof Error ? e4.message : String(e4)}`);
  }
};
var Je2 = class {
  constructor({ config: e3, getUser: t3, guardianApi: n3, passportDomain: r3, clientId: i3 }) {
    __publicField(this, "guardianApi");
    __publicField(this, "confirmationScreen");
    __publicField(this, "crossSdkBridgeEnabled");
    __publicField(this, "getUser");
    this.confirmationScreen = new Ge2({ authenticationDomain: `https://auth.immutable.com`, passportDomain: r3, oidcConfiguration: { clientId: i3, redirectUri: `https://auth.immutable.com/im-logged-in` }, crossSdkBridgeEnabled: e3.crossSdkBridgeEnabled }), this.crossSdkBridgeEnabled = e3.crossSdkBridgeEnabled, this.guardianApi = n3, this.getUser = t3;
  }
  async getUserZkEvm() {
    let e3 = await this.getUser();
    if (!e3 || !y2(e3)) throw new j4(4100, `User not authenticated or missing zkEvm data`);
    return e3;
  }
  withConfirmationScreen(e3) {
    return (t3) => this.withConfirmationScreenTask(e3)(t3)();
  }
  withConfirmationScreenTask(e3) {
    return (t3) => async () => {
      this.confirmationScreen.loading(e3);
      try {
        return await t3();
      } catch (e4) {
        throw e4 instanceof L4 && e4.type === `SERVICE_UNAVAILABLE_ERROR` ? (await this.confirmationScreen.showServiceUnavailable(), e4) : (this.confirmationScreen.closeWindow(), e4);
      }
    };
  }
  withDefaultConfirmationScreenTask(e3) {
    return this.withConfirmationScreenTask()(e3);
  }
  async evaluateEVMTransaction({ chainId: e3, nonce: t3, metaTransactions: n3 }) {
    let r3 = await this.getUserZkEvm(), i3 = { Authorization: `Bearer ${r3.accessToken}` }, a3 = qe2(n3);
    try {
      return (await this.guardianApi.evaluateTransaction({ id: `evm`, transactionEvaluationRequest: { chainType: `evm`, chainId: e3, transactionData: { nonce: t3, userAddress: r3.zkEvm.ethAddress, metaTransactions: a3 } } }, { headers: i3 })).data;
    } catch (e4) {
      throw R4(e4) && e4.response?.status === 403 ? new L4(`Service unavailable`, `SERVICE_UNAVAILABLE_ERROR`) : R4(e4) && e4.response?.status === 422 && this.crossSdkBridgeEnabled ? new j4(-32015, `Transaction will revert: ${e4.response?.data?.message ?? `A transaction simulation reverted`}`) : new j4(-32603, `Transaction failed to validate with error: ${e4 instanceof Error ? e4.message : String(e4)}`);
    }
  }
  async validateEVMTransaction({ chainId: e3, nonce: t3, metaTransactions: n3, isBackgroundTransaction: r3 }) {
    let { confirmationRequired: i3, transactionId: o4 } = await this.evaluateEVMTransaction({ chainId: e3, nonce: t3, metaTransactions: n3 });
    if (i3 && this.crossSdkBridgeEnabled) throw new j4(-32003, z4);
    if (i3 && o4) {
      let t4 = await this.getUserZkEvm();
      if (!(await this.confirmationScreen.requestConfirmation(o4, t4.zkEvm.ethAddress, Zt.TransactionApprovalRequestChainTypeEnum.Evm, e3)).confirmed) throw new j4(-32003, `Transaction rejected by user`);
    } else r3 || this.confirmationScreen.closeWindow();
  }
  async handleEIP712MessageEvaluation({ chainID: e3, payload: t3 }) {
    try {
      let n3 = await this.getUserZkEvm();
      return (await this.guardianApi.evaluateMessage({ messageEvaluationRequest: { chainID: e3, payload: t3 } }, { headers: { Authorization: `Bearer ${n3.accessToken}` } })).data;
    } catch (e4) {
      throw new j4(-32603, `Message failed to validate with error: ${e4 instanceof Error ? e4.message : String(e4)}`);
    }
  }
  async evaluateEIP712Message({ chainID: e3, payload: t3 }) {
    let { messageId: n3, confirmationRequired: r3 } = await this.handleEIP712MessageEvaluation({ chainID: e3, payload: t3 });
    if (r3 && this.crossSdkBridgeEnabled) throw new j4(-32003, z4);
    if (r3 && n3) {
      let e4 = await this.getUserZkEvm();
      if (!(await this.confirmationScreen.requestMessageConfirmation(n3, e4.zkEvm.ethAddress, `eip712`)).confirmed) throw new j4(-32003, `Signature rejected by user`);
    } else this.confirmationScreen.closeWindow();
  }
  async handleERC191MessageEvaluation({ chainID: e3, payload: t3 }) {
    try {
      let n3 = await this.getUserZkEvm();
      return (await this.guardianApi.evaluateErc191Message({ eRC191MessageEvaluationRequest: { chainID: A4(Number(e3)), payload: t3 } }, { headers: { Authorization: `Bearer ${n3.accessToken}` } })).data;
    } catch (e4) {
      throw new j4(-32603, `Message failed to validate with error: ${e4 instanceof Error ? e4.message : String(e4)}`);
    }
  }
  async evaluateERC191Message({ chainID: e3, payload: t3 }) {
    let { messageId: n3, confirmationRequired: r3 } = await this.handleERC191MessageEvaluation({ chainID: e3, payload: t3 });
    if (r3 && this.crossSdkBridgeEnabled) throw new j4(-32003, z4);
    if (r3 && n3) {
      let e4 = await this.getUserZkEvm();
      if (!(await this.confirmationScreen.requestMessageConfirmation(n3, e4.zkEvm.ethAddress, `erc191`)).confirmed) throw new j4(-32003, `Signature rejected by user`);
    } else this.confirmationScreen.closeWindow();
  }
};
var Ye2 = (e3) => new Promise((t3) => {
  setTimeout(() => t3(), e3);
});
var V3 = async (e3, t3) => {
  let { retries: n3 = 3, interval: r3 = 1e3, finalErr: i3 = Error(`Retry failed`), finallyFn: a3 = () => {
  } } = t3 || {};
  try {
    return await e3();
  } catch {
    return n3 <= 0 ? Promise.reject(i3) : (await Ye2(r3), V3(e3, { retries: n3 - 1, finalErr: i3, finallyFn: a3 }));
  } finally {
    n3 <= 0 && a3();
  }
};
var Xe2 = async (e3, t3, n3) => {
  let r3 = ge4(T4([e3])), i3 = await n3.imGetFeeOptions(t3, r3);
  if (!i3 || !Array.isArray(i3)) throw Error(`Invalid fee options received from relayer`);
  let a3 = n3.getPreferredFeeTokenSymbol(), o4 = i3.find((e4) => e4.tokenSymbol === a3);
  if (!o4) throw Error(`Failed to retrieve fees for ${a3} token`);
  return o4;
};
var Ze2 = async (e3, t3, n3, r3, i3) => {
  if (!e3.to) throw new j4(-32602, `eth_sendTransaction requires a "to" field`);
  let a3 = { to: e3.to.toString(), data: e3.data, nonce: BigInt(0), value: e3.value, revertOnError: true }, [o4, s3] = await Promise.all([E4(t3, r3, i3), Xe2(a3, r3, n3)]), c3 = [{ ...a3, nonce: o4 }], l3 = BigInt(s3.tokenPrice);
  return l3 !== BigInt(0) && c3.push({ nonce: o4, to: s3.recipientAddress, value: l3, revertOnError: true }), c3;
};
var Qe2 = async (e3, t3, n3) => {
  let r3 = await V3(async () => {
    let n4 = await e3.imGetTransactionByHash(t3);
    if (n4.status === `PENDING`) throw Error();
    return n4;
  }, { retries: 30, interval: 1e3, finalErr: new j4(-32e3, `transaction hash not generated in time`) });
  if (n3.addEvent(`endRetrieveRelayerTransaction`), ![`SUBMITTED`, `SUCCESSFUL`].includes(r3.status)) {
    let e4 = `Transaction failed to submit with status ${r3.status}.`;
    throw r3.statusMessage && (e4 += ` Error message: ${r3.statusMessage}`), new j4(-32e3, e4);
  }
  return r3;
};
var $e2 = async ({ transactionRequest: e3, ethSigner: t3, rpcProvider: n3, guardianClient: r3, relayerClient: i3, zkEvmAddress: a3, flow: o4, nonceSpace: s3, isBackgroundTransaction: c3 }) => {
  let l3 = await n3.getChainId(), u3 = BigInt(l3);
  o4.addEvent(`endDetectNetwork`);
  let d3 = await Ze2(e3, n3, i3, a3, s3);
  o4.addEvent(`endBuildMetaTransactions`);
  let { nonce: f3 } = d3[0];
  if (f3 === void 0) throw Error(`Failed to retrieve nonce from the smart wallet`);
  let [, p4] = await Promise.all([(async () => {
    await r3.validateEVMTransaction({ chainId: A4(Number(l3)), nonce: B4(f3), metaTransactions: d3, isBackgroundTransaction: c3 }), o4.addEvent(`endValidateEVMTransaction`);
  })(), (async () => {
    let e4 = await O4(d3, f3, u3, a3, t3);
    return o4.addEvent(`endGetSignedMetaTransactions`), e4;
  })()]), m4 = await i3.ethSendTransaction(a3, p4);
  return o4.addEvent(`endRelayerSendTransaction`), { signedTransactions: p4, relayerId: m4, nonce: f3 };
};
var et2 = async (e3) => {
  if (!e3.to) throw new j4(-32602, `im_signEjectionTransaction requires a "to" field`);
  if (e3.nonce === void 0) throw new j4(-32602, `im_signEjectionTransaction requires a "nonce" field`);
  if (!e3.chainId) throw new j4(-32602, `im_signEjectionTransaction requires a "chainId" field`);
  return [{ to: e3.to.toString(), data: e3.data, nonce: e3.nonce ?? void 0, value: e3.value, revertOnError: true }];
};
var tt2 = async ({ transactionRequest: e3, ethSigner: t3, zkEvmAddress: n3, flow: r3 }) => {
  let i3 = await et2(e3);
  r3.addEvent(`endBuildMetaTransactions`);
  let a3 = await O4(i3, e3.nonce, BigInt(e3.chainId ?? 0), n3, t3);
  return r3.addEvent(`endGetSignedMetaTransactions`), { to: n3, data: a3, chainId: A4(Number(e3.chainId ?? 0)) };
};
var nt2 = async ({ params: e3, ethSigner: t3, rpcProvider: n3, relayerClient: r3, guardianClient: i3, zkEvmAddress: a3, flow: o4, nonceSpace: s3, isBackgroundTransaction: c3 = false }) => {
  let l3 = e3[0], { relayerId: u3 } = await $e2({ transactionRequest: l3, ethSigner: t3, rpcProvider: n3, guardianClient: i3, relayerClient: r3, zkEvmAddress: a3, flow: o4, nonceSpace: s3, isBackgroundTransaction: c3 }), { hash: d3 } = await Qe2(r3, u3, o4);
  return d3;
};
var rt2 = [`types`, `domain`, `primaryType`, `message`];
var it2 = (e3) => rt2.every((t3) => t3 in e3);
var at2 = (e3, t3) => {
  let n3;
  if (typeof e3 == `string`) try {
    n3 = JSON.parse(e3);
  } catch (e4) {
    throw new j4(-32602, `Failed to parse typed data JSON: ${e4}`);
  }
  else if (typeof e3 == `object`) n3 = e3;
  else throw new j4(-32602, `Invalid typed data argument: ${e3}`);
  if (!it2(n3)) throw new j4(-32602, `Invalid typed data argument. The following properties are required: ${rt2.join(`, `)}`);
  let r3 = n3.domain?.chainId;
  if (r3) {
    let e4;
    if (e4 = typeof r3 == `string` ? r3.startsWith(`0x`) ? parseInt(r3, 16) : parseInt(r3, 10) : Number(r3), n3.domain.chainId = e4, BigInt(e4) !== t3) throw new j4(-32602, `Invalid chainId, expected ${t3}`);
  }
  return n3;
};
var ot2 = async ({ params: e3, method: t3, ethSigner: n3, rpcProvider: r3, relayerClient: i3, guardianClient: a3, flow: o4 }) => {
  let s3 = e3[0], c3 = e3[1];
  if (!s3 || !c3) throw new j4(-32602, `${t3} requires an address and a typed data JSON`);
  let l3 = await r3.getChainId(), u3 = at2(c3, BigInt(l3));
  o4.addEvent(`endDetectNetwork`), await a3.evaluateEIP712Message({ chainID: String(l3), payload: u3 }), o4.addEvent(`endValidateMessage`);
  let d3 = await i3.imSignTypedData(s3, u3);
  o4.addEvent(`endRelayerSignTypedData`);
  let f3 = await be3(u3, d3, BigInt(l3), s3, n3);
  return o4.addEvent(`getSignedTypedData`), f3;
};
var st2 = (e3) => {
  let t3 = 0;
  for (; t3 < e3.length && e3[t3] === 0; ) t3++;
  return e3.slice(t3);
};
var ct2 = (e3) => {
  if (typeof TextDecoder < `u`) return new TextDecoder(`utf-8`).decode(e3);
  let t3 = ``;
  for (let n3 = 0; n3 < e3.length; n3++) t3 += String.fromCharCode(e3[n3]);
  return decodeURIComponent(escape(t3));
};
var lt2 = (e3) => {
  if (!e3) return e3;
  try {
    let t3 = toBytes(e3), n3 = st2(t3);
    return ct2(n3);
  } catch {
    return e3;
  }
};
var ut2 = async ({ params: e3, ethSigner: t3, zkEvmAddress: n3, rpcProvider: r3, guardianClient: i3, relayerClient: a3, flow: o4 }) => {
  let s3 = e3[0], c3 = e3[1];
  if (!c3 || !s3) throw new j4(-32602, `personal_sign requires an address and a message`);
  if (c3.toLowerCase() !== n3.toLowerCase()) throw new j4(-32602, `personal_sign requires the signer to be the from address`);
  let l3 = lt2(s3), u3 = await r3.getChainId();
  o4.addEvent(`endDetectNetwork`);
  let d3 = BigInt(u3), f3 = xe3(d3, l3, t3, c3);
  f3.then(() => o4.addEvent(`endEOASignature`)), await i3.evaluateERC191Message({ chainID: d3, payload: l3 }), o4.addEvent(`endEvaluateERC191Message`);
  let [p4, m4] = await Promise.all([f3, a3.imSign(c3, l3)]);
  o4.addEvent(`endRelayerSign`);
  let h4 = await t3.getAddress();
  return o4.addEvent(`endGetEOAAddress`), k4(p4, h4, m4);
};
var H3;
var dt2 = (e3) => {
  H3 || (H3 = e3);
};
var ft2 = (e3) => {
  let t3 = new URL(`/v1/sdk/session-activity/check`, H3);
  return Object.entries(e3).forEach(([e4, n3]) => {
    n3 != null && t3.searchParams.append(e4, String(n3));
  }), t3.toString();
};
async function pt2(e3) {
  if (!H3) throw Error(`Client not initialised`);
  let t3 = await fetch(ft2(e3));
  if (t3.status !== 404) {
    if (!t3.ok) throw Error(`Session activity request failed with status ${t3.status}`);
    return t3.json();
  }
}
function mt2(e3, t3) {
  return (...n3) => {
    try {
      let r3 = e3(...n3);
      return r3 instanceof Promise ? r3.catch((e4) => (e4 instanceof Error && Z(`passport`, `sessionActivityError`, e4), t3)) : r3;
    } catch (e4) {
      return e4 instanceof Error && Z(`passport`, `sessionActivityError`, e4), t3;
    }
  };
}
var { getItem: ht2, setItem: U3 } = ie.localStorage;
var W3 = `sessionActivitySendCount`;
var gt2 = `sessionActivityDate`;
var G4 = {};
var K3 = {};
var q3 = {};
var _t2 = () => {
  K3 = ht2(W3) || {};
  let e3 = ht2(gt2), t3 = /* @__PURE__ */ new Date(), n3 = `${t3.getFullYear()}-${`${t3.getMonth() + 1}`.padStart(2, `0`)}-${`${t3.getDate()}`.padStart(2, `0`)}`;
  (!e3 || e3 !== n3) && (K3 = {}), U3(gt2, n3), U3(W3, K3);
};
_t2();
var vt2 = (e3) => {
  _t2(), K3[e3] || (K3[e3] = 0), K3[e3]++, U3(W3, K3), G4[e3] = 0;
};
var yt2 = async (e3) => new Promise((t3) => {
  setTimeout(t3, e3 * 1e3);
});
var bt2 = async (e3) => {
  let t3 = e3.flow || X(`passport`, `sendSessionActivity`), n3 = e3.passportClient;
  if (!n3) throw t3.addEvent(`No Passport Client ID`), Error(`No Passport Client ID provided`);
  if (q3[n3]) return;
  q3[n3] = true;
  let { sendTransaction: r3, sessionActivityApiUrl: i3 } = e3;
  if (!r3) throw Error(`No sendTransaction function provided`);
  if (!i3) throw Error(`No session activity API URL provided`);
  dt2(i3);
  let a3 = e3.walletAddress;
  if (!a3) throw t3.addEvent(`No Passport Wallet Address`), Error(`No wallet address`);
  let o4;
  try {
    if (o4 = await pt2({ clientId: n3, wallet: a3, checkCount: G4[n3] || 0, sendCount: K3[n3] || 0 }), G4[n3]++, !o4) return;
  } catch (e4) {
    throw t3.addEvent(`Failed to fetch details`), Error(`Failed to get details`, { cause: e4 });
  }
  if (o4 && o4.contractAddress && o4.functionName) {
    let r4 = encodeFunctionData({ abi: parseAbi([`function ${o4.functionName}()`]), functionName: o4.functionName }), i4 = o4.contractAddress;
    try {
      t3.addEvent(`Start Sending Transaction`);
      let o5 = await e3.sendTransaction([{ to: i4, from: a3, data: r4 }], t3);
      vt2(n3), t3.addEvent(`Transaction Sent`, { tx: o5 });
    } catch (e4) {
      t3.addEvent(`Failed to send Transaction`), Z(`passport`, `sessionActivityError`, Error(`Failed to send transaction`, { cause: e4 }), { flowId: t3.details.flowId });
    }
  }
  o4 && o4.delay && o4.delay > 0 && (t3.addEvent(`Delaying Transaction`, { delay: o4.delay }), await yt2(o4.delay), setTimeout(() => {
    t3.addEvent(`Retrying after Delay`), q3[n3] = false, xt2({ ...e3, flow: t3 });
  }, 0));
};
var xt2 = (e3) => mt2(bt2)(e3).then(() => {
  q3[e3.passportClient] = false;
});
var St2 = xt2;
var Ct2 = async ({ params: e3, ethSigner: t3, rpcProvider: n3, relayerClient: r3, guardianClient: i3, zkEvmAddress: a3, flow: o4 }) => {
  let { relayerId: s3 } = await $e2({ transactionRequest: { to: a3, value: 0n }, ethSigner: t3, rpcProvider: n3, guardianClient: i3, relayerClient: r3, zkEvmAddress: a3, flow: o4 });
  return i3.withConfirmationScreen()(async () => {
    let c3 = await ut2({ params: e3, ethSigner: t3, zkEvmAddress: a3, rpcProvider: n3, guardianClient: i3, relayerClient: r3, flow: o4 });
    return await Qe2(r3, s3, o4), c3;
  });
};
var wt2 = async ({ params: e3, ethSigner: t3, zkEvmAddress: n3, flow: r3 }) => {
  if (!e3 || e3.length !== 1) throw new j4(-32602, `im_signEjectionTransaction requires a singular param (hash)`);
  let i3 = e3[0];
  return await tt2({ transactionRequest: i3, ethSigner: t3, zkEvmAddress: n3, flow: r3 });
};
var J3 = (e3) => !!e3.zkEvm;
var _e4, _t3, _n2, _r, _i, _a4, _o, _s, _c, _l, _u, _d, _f, _Tt_instances, p_fn, m_fn, h_fn, g_fn, _a5;
var Tt2 = (_a5 = class {
  constructor({ getUser: e3, clientId: t3, config: r3, multiRollupApiClients: i3, walletEventEmitter: a3, guardianClient: o4, ethSigner: s3, user: c3, sessionActivityApiUrl: l3 }) {
    __privateAdd(this, _Tt_instances);
    __privateAdd(this, _e4);
    __privateAdd(this, _t3);
    __privateAdd(this, _n2);
    __privateAdd(this, _r);
    __privateAdd(this, _i);
    __privateAdd(this, _a4);
    __privateAdd(this, _o);
    __privateAdd(this, _s);
    __privateAdd(this, _c);
    __privateAdd(this, _l);
    __privateAdd(this, _u);
    __publicField(this, "isPassport", true);
    __privateAdd(this, _d, () => {
      __privateGet(this, _r).emit(`accountsChanged`, []);
    });
    __privateAdd(this, _f, (e3) => {
      e3 && J3(e3) && __privateGet(this, _r).emit(`accountsChanged`, [e3.zkEvm.ethAddress]);
    });
    __privateSet(this, _e4, e3), __privateSet(this, _u, t3), __privateSet(this, _t3, r3), __privateSet(this, _a4, o4), __privateSet(this, _i, a3), __privateSet(this, _n2, l3), __privateSet(this, _l, s3), __privateSet(this, _o, createPublicClient({ transport: http(__privateGet(this, _t3).zkEvmRpcUrl) })), __privateSet(this, _c, new Se3({ config: __privateGet(this, _t3), rpcProvider: __privateGet(this, _o), getUser: __privateGet(this, _e4) })), __privateSet(this, _s, i3), __privateSet(this, _r, new M2()), c3 && J3(c3) && __privateMethod(this, _Tt_instances, m_fn).call(this, c3.zkEvm.ethAddress), a3.on(`loggedOut`, __privateGet(this, _d)), a3.on(`loggedIn`, __privateGet(this, _f)), a3.on(`accountsRequested`, St2);
  }
  async request(e3) {
    try {
      return __privateMethod(this, _Tt_instances, g_fn).call(this, e3);
    } catch (e4) {
      throw e4 instanceof j4 ? e4 : e4 instanceof Error ? new j4(-32603, e4.message) : new j4(-32603, `Internal error`);
    }
  }
  on(e3, t3) {
    __privateGet(this, _r).on(e3, t3);
  }
  removeListener(e3, t3) {
    __privateGet(this, _r).removeListener(e3, t3);
  }
}, _e4 = new WeakMap(), _t3 = new WeakMap(), _n2 = new WeakMap(), _r = new WeakMap(), _i = new WeakMap(), _a4 = new WeakMap(), _o = new WeakMap(), _s = new WeakMap(), _c = new WeakMap(), _l = new WeakMap(), _u = new WeakMap(), _d = new WeakMap(), _f = new WeakMap(), _Tt_instances = new WeakSet(), p_fn = async function(e3 = false) {
  return e3 ? __privateGet(this, _e4).call(this, void 0, { silent: true }) : __privateGet(this, _e4).call(this);
}, m_fn = async function(e3) {
  if (!__privateGet(this, _n2)) return;
  let t3 = BigInt(1);
  __privateGet(this, _i).emit(`accountsRequested`, { sessionActivityApiUrl: __privateGet(this, _n2), sendTransaction: async (n3, r3) => await nt2({ params: n3, ethSigner: __privateGet(this, _l), guardianClient: __privateGet(this, _a4), rpcProvider: __privateGet(this, _o), relayerClient: __privateGet(this, _c), zkEvmAddress: e3, flow: r3, nonceSpace: t3, isBackgroundTransaction: true }), walletAddress: e3, passportClient: __privateGet(this, _u) });
}, h_fn = async function() {
  try {
    let e3 = await __privateMethod(this, _Tt_instances, p_fn).call(this, true);
    return e3 && J3(e3) ? e3.zkEvm.ethAddress : void 0;
  } catch {
    return;
  }
}, g_fn = async function(e3) {
  switch (e3.method) {
    case `eth_requestAccounts`: {
      let e4 = await __privateMethod(this, _Tt_instances, h_fn).call(this);
      if (e4) return [e4];
      let t3 = X(`passport`, `ethRequestAccounts`);
      try {
        let e5 = await __privateGet(this, _e4).call(this);
        if (!e5) throw new j4(4100, `User not authenticated. Please log in first.`);
        t3.addEvent(`endGetUser`);
        let n3;
        return J3(e5) ? n3 = e5.zkEvm.ethAddress : (t3.addEvent(`startUserRegistration`), n3 = await je2({ ethSigner: __privateGet(this, _l), getUser: __privateGet(this, _e4), multiRollupApiClients: __privateGet(this, _s), accessToken: e5.accessToken, rpcProvider: __privateGet(this, _o), flow: t3 }), t3.addEvent(`endUserRegistration`), await __privateGet(this, _e4).call(this, true), t3.addEvent(`endForceRefresh`)), __privateGet(this, _r).emit(`accountsChanged`, [n3]), $({ passportId: e5.profile.sub }), __privateMethod(this, _Tt_instances, m_fn).call(this, n3), [n3];
      } catch (e5) {
        throw e5 instanceof Error ? Z(`passport`, `ethRequestAccounts`, e5, { flowId: t3.details.flowId }) : t3.addEvent(`errored`), e5;
      } finally {
        t3.addEvent(`End`);
      }
    }
    case `eth_sendTransaction`: {
      let t3 = await __privateMethod(this, _Tt_instances, h_fn).call(this);
      if (!t3) throw new j4(4100, `Unauthorised - call eth_requestAccounts first`);
      let n3 = X(`passport`, `ethSendTransaction`);
      try {
        return await __privateGet(this, _a4).withConfirmationScreen({ width: 480, height: 720 })(async () => await nt2({ params: e3.params || [], ethSigner: __privateGet(this, _l), guardianClient: __privateGet(this, _a4), rpcProvider: __privateGet(this, _o), relayerClient: __privateGet(this, _c), zkEvmAddress: t3, flow: n3 }));
      } catch (e4) {
        throw e4 instanceof Error ? Z(`passport`, `eth_sendTransaction`, e4, { flowId: n3.details.flowId }) : n3.addEvent(`errored`), e4;
      } finally {
        n3.addEvent(`End`);
      }
    }
    case `eth_accounts`: {
      let e4 = await __privateMethod(this, _Tt_instances, h_fn).call(this);
      return e4 ? [e4] : [];
    }
    case `personal_sign`: {
      let t3 = await __privateMethod(this, _Tt_instances, h_fn).call(this);
      if (!t3) throw new j4(4100, `Unauthorised - call eth_requestAccounts first`);
      let n3 = X(`passport`, `personalSign`);
      try {
        return await __privateGet(this, _a4).withConfirmationScreen({ width: 480, height: 720 })(async () => __privateGet(this, _t3).forceScwDeployBeforeMessageSignature && !(await E4(__privateGet(this, _o), t3) > BigInt(0)) ? await Ct2({ params: e3.params || [], zkEvmAddress: t3, ethSigner: __privateGet(this, _l), rpcProvider: __privateGet(this, _o), guardianClient: __privateGet(this, _a4), relayerClient: __privateGet(this, _c), flow: n3 }) : await ut2({ params: e3.params || [], zkEvmAddress: t3, ethSigner: __privateGet(this, _l), rpcProvider: __privateGet(this, _o), guardianClient: __privateGet(this, _a4), relayerClient: __privateGet(this, _c), flow: n3 }));
      } catch (e4) {
        throw e4 instanceof Error ? Z(`passport`, `personal_sign`, e4, { flowId: n3.details.flowId }) : n3.addEvent(`errored`), e4;
      } finally {
        n3.addEvent(`End`);
      }
    }
    case `eth_signTypedData`:
    case `eth_signTypedData_v4`: {
      if (!await __privateMethod(this, _Tt_instances, h_fn).call(this)) throw new j4(4100, `Unauthorised - call eth_requestAccounts first`);
      let t3 = X(`passport`, `ethSignTypedDataV4`);
      try {
        return await __privateGet(this, _a4).withConfirmationScreen({ width: 480, height: 720 })(async () => await ot2({ method: e3.method, params: e3.params || [], ethSigner: __privateGet(this, _l), rpcProvider: __privateGet(this, _o), relayerClient: __privateGet(this, _c), guardianClient: __privateGet(this, _a4), flow: t3 }));
      } catch (e4) {
        throw e4 instanceof Error ? Z(`passport`, `eth_signTypedData`, e4, { flowId: t3.details.flowId }) : t3.addEvent(`errored`), e4;
      } finally {
        t3.addEvent(`End`);
      }
    }
    case `eth_chainId`:
      return toHex(await __privateGet(this, _o).getChainId());
    case `eth_getBalance`:
    case `eth_getCode`:
    case `eth_getTransactionCount`: {
      let [t3, n3] = e3.params || [];
      return __privateGet(this, _o).request({ method: e3.method, params: [t3, n3 || `latest`] });
    }
    case `eth_getStorageAt`: {
      let [t3, n3, r3] = e3.params || [];
      return __privateGet(this, _o).request({ method: `eth_getStorageAt`, params: [t3, n3, r3 || `latest`] });
    }
    case `eth_call`:
    case `eth_estimateGas`: {
      let [t3, n3] = e3.params || [];
      return __privateGet(this, _o).request({ method: e3.method, params: [t3, n3 || `latest`] });
    }
    case `eth_gasPrice`:
    case `eth_blockNumber`:
    case `eth_getBlockByHash`:
    case `eth_getBlockByNumber`:
    case `eth_getTransactionByHash`:
    case `eth_getTransactionReceipt`:
      return __privateGet(this, _o).request({ method: e3.method, params: e3.params || [] });
    case `im_signEjectionTransaction`: {
      let t3 = await __privateMethod(this, _Tt_instances, h_fn).call(this);
      if (!t3) throw new j4(4100, `Unauthorised - call eth_requestAccounts first`);
      let n3 = X(`passport`, `imSignEjectionTransaction`);
      try {
        return await wt2({ params: e3.params || [], ethSigner: __privateGet(this, _l), zkEvmAddress: t3, flow: n3 });
      } catch (e4) {
        throw e4 instanceof Error ? Z(`passport`, `imSignEjectionTransaction`, e4, { flowId: n3.details.flowId }) : n3.addEvent(`errored`), e4;
      } finally {
        n3.addEvent(`End`);
      }
    }
    case `im_addSessionActivity`: {
      let e4 = await __privateMethod(this, _Tt_instances, h_fn).call(this);
      return e4 && __privateMethod(this, _Tt_instances, m_fn).call(this, e4), null;
    }
    default:
      throw new j4(4200, `Method not supported`);
  }
}, _a5);
var Et2 = class {
  constructor(e3) {
    __publicField(this, "passportDomain");
    __publicField(this, "zkEvmRpcUrl");
    __publicField(this, "relayerUrl");
    __publicField(this, "indexerMrBasePath");
    __publicField(this, "jsonRpcReferrer");
    __publicField(this, "forceScwDeployBeforeMessageSignature");
    __publicField(this, "crossSdkBridgeEnabled");
    __publicField(this, "feeTokenSymbol");
    this.passportDomain = e3.passportDomain, this.zkEvmRpcUrl = e3.zkEvmRpcUrl, this.relayerUrl = e3.relayerUrl, this.indexerMrBasePath = e3.indexerMrBasePath, this.jsonRpcReferrer = e3.jsonRpcReferrer, this.forceScwDeployBeforeMessageSignature = e3.forceScwDeployBeforeMessageSignature || false, this.crossSdkBridgeEnabled = e3.crossSdkBridgeEnabled || false, this.feeTokenSymbol = e3.feeTokenSymbol || `IMX`;
  }
};
var Dt2 = async (e3, t3, n3 = true, r3 = true) => {
  let i3 = X(`passport`, t3, n3);
  try {
    return await e3(i3);
  } catch (e4) {
    throw e4 instanceof Error ? Z(`passport`, t3, e4, { flowId: i3.details.flowId }) : i3.addEvent(`errored`), e4;
  } finally {
    r3 && i3.addEvent(`End`);
  }
};
var Ot2 = (e3) => e3.reduce((e4, t3) => `${e4}${t3.toString(16).padStart(2, `0`)}`, ``);
var kt2 = (e3) => {
  if (typeof TextEncoder < `u`) return new TextEncoder().encode(e3);
  let t3 = unescape(encodeURIComponent(e3)), n3 = new Uint8Array(t3.length);
  for (let e4 = 0; e4 < t3.length; e4 += 1) n3[e4] = t3.charCodeAt(e4);
  return n3;
};
var At2 = (e3) => {
  let t3 = kt2(e3), n3 = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`, r3 = ``;
  for (let e4 = 0; e4 < t3.length; e4 += 3) {
    let i3 = t3[e4], a3 = t3[e4 + 1], o4 = t3[e4 + 2], s3 = i3 << 16 | (a3 ?? 0) << 8 | (o4 ?? 0), c3 = s3 >> 18 & 63, l3 = s3 >> 12 & 63, u3 = s3 >> 6 & 63, d3 = s3 & 63;
    r3 += n3[c3] + n3[l3], r3 += Number.isFinite(a3) ? n3[u3] : `=`, r3 += Number.isFinite(o4) ? n3[d3] : `=`;
  }
  return r3;
};
var jt2 = class e2 {
  constructor(e3, t3) {
    __publicField(this, "getUser");
    __publicField(this, "magicTeeApiClient");
    __publicField(this, "userWallet", null);
    __publicField(this, "createWalletPromise", null);
    this.getUser = e3, this.magicTeeApiClient = t3;
  }
  async getUserWallet() {
    let { userWallet: e3 } = this;
    e3 || (e3 = await this.createWallet());
    let t3 = await this.getUserOrThrow();
    if (t3.profile.sub !== e3.userIdentifier && (e3 = await this.createWallet(t3)), y2(t3) && t3.zkEvm.userAdminAddress.toLowerCase() !== e3.walletAddress.toLowerCase()) throw new L4(`Wallet address mismatch.Rollup: zkEVM, TEE address: ${e3.walletAddress}, profile address: ${t3.zkEvm.userAdminAddress}`, `WALLET_CONNECTION_ERROR`);
    return e3;
  }
  async createWallet(t3) {
    return this.createWalletPromise || (this.createWalletPromise = new Promise(async (n3, r3) => {
      try {
        this.userWallet = null;
        let i3 = t3 || await this.getUserOrThrow(), a3 = e2.getHeaders(i3);
        await Dt2(async (e3) => {
          try {
            let t4 = performance.now(), r4 = await this.magicTeeApiClient.walletApi.createWalletV1WalletPost({ xMagicChain: `ETH` }, { headers: a3 });
            return G(`passport`, e3.details.flowName, Math.round(performance.now() - t4)), this.userWallet = { userIdentifier: i3.profile.sub, walletAddress: r4.data.public_address }, n3(this.userWallet);
          } catch (e4) {
            let t4 = `MagicTEE: Failed to initialise EOA`;
            return R4(e4) && e4.response ? t4 += ` with status ${e4.response.status}: ${JSON.stringify(e4.response.data)}` : t4 += `: ${e4.message}`, r3(Error(t4));
          }
        }, `magicCreateWallet`);
      } catch (e3) {
        r3(e3);
      } finally {
        this.createWalletPromise = null;
      }
    })), this.createWalletPromise;
  }
  async getUserOrThrow() {
    let e3 = await this.getUser();
    if (!e3) throw new L4(`User has been logged out`, `NOT_LOGGED_IN_ERROR`);
    return e3;
  }
  static getHeaders(e3) {
    if (!e3) throw new L4(`User has been logged out`, `NOT_LOGGED_IN_ERROR`);
    return { Authorization: `Bearer ${e3.idToken}` };
  }
  async getAddress() {
    return (await this.getUserWallet()).walletAddress;
  }
  async signMessage(t3) {
    await this.getUserWallet();
    let n3 = t3 instanceof Uint8Array ? `0x${Ot2(t3)}` : t3, r3 = await this.getUserOrThrow(), i3 = e2.getHeaders(r3);
    return Dt2(async (e3) => {
      try {
        let t4 = performance.now(), r4 = await this.magicTeeApiClient.signOperationsApi.signMessageV1WalletSignMessagePost({ signMessageRequest: { message_base64: At2(n3) }, xMagicChain: `ETH` }, { headers: i3 });
        return G(`passport`, e3.details.flowName, Math.round(performance.now() - t4)), r4.data.signature;
      } catch (e4) {
        let t4 = `MagicTEE: Failed to sign message using EOA`;
        throw R4(e4) && e4.response ? t4 += ` with status ${e4.response.status}: ${JSON.stringify(e4.response.data)}` : t4 += `: ${e4.message}`, Error(t4);
      }
    }, `magicSignMessage`);
  }
};
var Mt2 = { icon: `data:image/svg+xml,<svg viewBox="0 0 48 48" class="SvgIcon undefined Logo Logo--PassportSymbolOutlined css-1dn9atd" xmlns="http://www.w3.org/2000/svg"><g data-testid="undefined__g"><circle cx="24" cy="24" r="22.5" fill="url(%23paint0_radial_6324_83922)"></circle><circle cx="24" cy="24" r="22.5" fill="url(%23paint1_radial_6324_83922)"></circle><path d="M24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0ZM23.0718 9.16608C23.7383 8.83951 24.4406 8.86188 25.087 9.2287C27.3282 10.5059 29.5627 11.7942 31.786 13.096C32.5018 13.5165 32.8686 14.1897 32.8708 15.0173C32.8843 17.9184 32.8798 20.8171 32.8708 23.7182C32.8708 23.8255 32.8015 23.9821 32.7143 24.0335C31.8531 24.548 30.9808 25.0423 30.0347 25.5881V25.1318C30.0347 22.148 30.0257 19.1664 30.0414 16.1827C30.0436 15.6101 29.8468 15.241 29.339 14.9525C26.7377 13.474 24.1499 11.9687 21.5575 10.4723C21.4457 10.4075 21.3361 10.3381 21.1661 10.2352C21.8326 9.85722 22.4321 9.47698 23.0673 9.16608H23.0718ZM22.5953 38.8451C22.45 38.7713 22.3426 38.7198 22.2375 38.6595C18.8041 36.68 15.3752 34.687 11.9307 32.7232C10.9644 32.173 10.5238 31.3879 10.5349 30.2852C10.5551 27.9411 10.5484 25.597 10.5372 23.2507C10.5327 22.1927 10.9622 21.4255 11.8926 20.8977C14.3105 19.5221 16.715 18.1264 19.1195 16.7284C19.3275 16.6076 19.4796 16.5875 19.6965 16.7172C20.5264 17.216 21.3719 17.6924 22.2554 18.2024C22.0876 18.3031 21.9601 18.3791 21.8304 18.4552C19.2268 19.9582 16.6278 21.4658 14.0175 22.9599C13.5903 23.2037 13.3912 23.5213 13.3957 24.0179C13.4091 25.8654 13.4114 27.713 13.3957 29.5605C13.3912 30.0705 13.5948 30.3948 14.0332 30.6453C16.7866 32.2199 19.5288 33.8125 22.28 35.3916C22.5126 35.5258 22.611 35.6645 22.6065 35.9418C22.5864 36.888 22.5998 37.8363 22.5998 38.8473L22.5953 38.8451ZM22.5953 33.553C22.356 33.4166 22.1838 33.3204 22.0116 33.2198C19.8285 31.9605 17.6477 30.6967 15.4602 29.4464C15.2231 29.3122 15.1359 29.1668 15.1381 28.8917C15.1538 27.4714 15.1471 26.0511 15.1426 24.6308C15.1426 24.4384 15.1717 24.3064 15.3618 24.1991C16.167 23.7495 16.9633 23.2798 17.7618 22.8212C17.8199 22.7877 17.8826 22.7631 17.9877 22.7116V24.3064C17.9877 25.1698 18.0011 26.0354 17.9832 26.8988C17.972 27.3909 18.1622 27.7241 18.5916 27.9657C19.8285 28.6636 21.0498 29.3883 22.2867 30.0839C22.5305 30.2203 22.6043 30.3724 22.5998 30.6408C22.5842 31.5847 22.5931 32.5308 22.5931 33.5508L22.5953 33.553ZM20.0746 14.91C19.6116 14.6371 19.2157 14.6393 18.7527 14.91C16.1581 16.4265 13.5523 17.9228 10.9487 19.4259C10.8391 19.4908 10.7251 19.5489 10.5305 19.6541C10.5998 18.6654 10.3873 17.7327 10.7251 16.8291C10.9085 16.3348 11.2529 15.9635 11.7092 15.6995C13.8811 14.4447 16.0507 13.1877 18.227 11.9396C19.0211 11.4833 19.8308 11.4945 20.6248 11.953C23.0964 13.3756 25.5657 14.8026 28.0306 16.2341C28.1357 16.2945 28.2677 16.4309 28.2677 16.5338C28.2856 17.5493 28.2788 18.567 28.2788 19.6563C27.3819 19.1396 26.5543 18.6609 25.7267 18.1823C23.8412 17.093 21.9512 16.0149 20.0746 14.91ZM37.4427 30.8779C37.3778 31.6764 36.9103 32.2423 36.2192 32.6404C33.5732 34.1614 30.9294 35.6913 28.2856 37.2168C27.4557 37.6954 26.6259 38.1741 25.7938 38.6527C25.6932 38.7109 25.5903 38.7601 25.4539 38.8317C25.4449 38.693 25.4337 38.5924 25.4337 38.4917C25.4337 37.6149 25.4382 36.7404 25.4293 35.8636C25.4293 35.6645 25.4762 35.5437 25.6596 35.4386C29.5157 33.2198 33.3696 30.9942 37.2212 28.7709C37.2794 28.7374 37.3443 28.7105 37.4539 28.6591C37.4539 29.4375 37.4986 30.1622 37.4427 30.8779ZM37.4628 25.3577C37.4561 26.2658 36.9663 26.9033 36.1901 27.3506C33.175 29.0841 30.1622 30.8265 27.1493 32.5666C26.5991 32.8842 26.0466 33.1996 25.4561 33.5396C25.4472 33.3897 25.436 33.2913 25.436 33.1907C25.436 32.3273 25.4449 31.4617 25.4293 30.5983C25.4248 30.3523 25.5075 30.2226 25.72 30.0995C28.46 28.5271 31.1911 26.9368 33.9355 25.3733C34.4231 25.096 34.6378 24.7538 34.6334 24.1812C34.6132 21.1974 34.6244 18.2136 34.6244 15.2298V14.7087C35.3402 15.1404 36.0112 15.496 36.624 15.9299C37.1832 16.3258 37.465 16.9253 37.4673 17.6164C37.4762 20.1976 37.4829 22.7788 37.465 25.3599L37.4628 25.3577Z" fill="%230D0D0D"></path><path fill-rule="evenodd" d="M24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0ZM24 2C11.8497 2 2 11.8497 2 24C2 36.1503 11.8497 46 24 46C36.1503 46 46 36.1503 46 24C46 11.8497 36.1503 2 24 2Z" fill="url(%23paint2_radial_6324_83922)"></path><path fill-rule="evenodd" d="M24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0ZM24 2C11.8497 2 2 11.8497 2 24C2 36.1503 11.8497 46 24 46C36.1503 46 46 36.1503 46 24C46 11.8497 36.1503 2 24 2Z" fill="url(%23paint3_radial_6324_83922)"></path><defs><radialGradient id="paint0_radial_6324_83922" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(13.4442 13.3899) rotate(44.9817) scale(46.7487 99.1435)"><stop stop-color="%23A3EEF8"></stop><stop offset="0.177083" stop-color="%23A4DCF5"></stop><stop offset="0.380208" stop-color="%23A6AEEC"></stop><stop offset="1" stop-color="%23ECBEE1"></stop></radialGradient><radialGradient id="paint1_radial_6324_83922" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(25.9515 43.7068) rotate(84.265) scale(24.2138 46.3215)"><stop stop-color="%23FCF5EE"></stop><stop offset="0.715135" stop-color="%23ECBEE1" stop-opacity="0"></stop></radialGradient><radialGradient id="paint2_radial_6324_83922" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(12.7405 12.6825) rotate(44.9817) scale(49.8653 105.753)"><stop stop-color="%23A3EEF8"></stop><stop offset="0.177083" stop-color="%23A4DCF5"></stop><stop offset="0.380208" stop-color="%23A6AEEC"></stop><stop offset="1" stop-color="%23ECBEE1"></stop></radialGradient><radialGradient id="paint3_radial_6324_83922" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(26.0816 45.0206) rotate(84.265) scale(25.828 49.4096)"><stop stop-color="%23FCF5EE"></stop><stop offset="0.715135" stop-color="%23ECBEE1" stop-opacity="0"></stop></radialGradient></defs></g></svg>`, name: `Immutable Passport`, rdns: `com.immutable.passport`, uuid: `3f0259bb-54c0-4ff0-85f2-6bb7c2d8b6c8` };
function Nt2(e3) {
  if (typeof window > `u`) return;
  let t3 = new CustomEvent(`eip6963:announceProvider`, { detail: Object.freeze(e3) });
  window.dispatchEvent(t3), window.addEventListener(`eip6963:requestProvider`, () => window.dispatchEvent(t3));
}
var Y3 = 13371;
var X3 = 13473;
var Z3 = { [Y3]: { magicPublishableApiKey: `pk_live_10F423798A540ED7`, magicProviderId: `aa80b860-8869-4f13-9000-6a6ad3d20017` }, [X3]: { magicPublishableApiKey: `pk_live_10F423798A540ED7`, magicProviderId: `aa80b860-8869-4f13-9000-6a6ad3d20017` } };
var Q3 = { chainId: Y3, name: `Immutable zkEVM`, rpcUrl: `https://rpc.immutable.com`, relayerUrl: `https://api.immutable.com/relayer-mr`, apiUrl: `https://api.immutable.com`, passportDomain: `https://passport.immutable.com`, magicPublishableApiKey: Z3[Y3].magicPublishableApiKey, magicProviderId: Z3[Y3].magicProviderId, magicTeeBasePath: `https://tee.express.magiclabs.com` };
var Pt2 = { chainId: X3, name: `Immutable zkEVM Testnet`, rpcUrl: `https://rpc.testnet.immutable.com`, relayerUrl: `https://api.sandbox.immutable.com/relayer-mr`, apiUrl: `https://api.sandbox.immutable.com`, passportDomain: `https://passport.sandbox.immutable.com`, magicPublishableApiKey: Z3[X3].magicPublishableApiKey, magicProviderId: Z3[X3].magicProviderId, magicTeeBasePath: `https://tee.express.magiclabs.com` };
var $3 = [Pt2, Q3];
var Ft2 = { chains: [Q3] };
function Rt2(e3) {
  return e3 in Z3;
}
function zt2(e3) {
  if (e3.magicPublishableApiKey && e3.magicProviderId) return { magicPublishableApiKey: e3.magicPublishableApiKey, magicProviderId: e3.magicProviderId };
  let { chainId: t3 } = e3;
  if (Rt2(t3)) return Z3[t3];
  throw Error(`No Magic configuration available for chain ${e3.chainId}. Please provide magicPublishableApiKey and magicProviderId in ChainConfig.`);
}
var Bt2 = /(sandbox|testnet)/i;
function Vt2(e3) {
  if (e3.chainId === 13473) return true;
  let t3 = e3.apiUrl || e3.passportDomain || ``;
  return Bt2.test(t3);
}
function Ht2(e3) {
  if (e3.passportDomain) return e3.passportDomain;
  if (e3.apiUrl) try {
    let t3 = new URL(e3.apiUrl), n3 = t3.hostname.replace(`api.`, `passport.`);
    return `${t3.protocol}//${n3}`;
  } catch {
    return e3.apiUrl.replace(`api.`, `passport.`);
  }
  return `https://passport.immutable.com`;
}
function Ut2() {
  return `https://auth.immutable.com`;
}
function Wt2() {
  return `https://auth.immutable.com/im-logged-in`;
}
function Gt2(e3) {
  return Vt2(e3) ? `mjtCL8mt06BtbxSkp2vbrYStKWnXVZfo` : `PtQRK4iRJ8GkXjiz6xfImMAYhPhW0cYk`;
}
function Kt2(t3, n3) {
  let r3 = Ht2(t3), i3 = Ut2(), a3 = Wt2(), o4 = n3.clientId || Gt2(t3), s3 = new Ee({ clientId: o4, redirectUri: a3, popupRedirectUri: a3, logoutRedirectUri: a3, scope: `openid profile email offline_access transact`, audience: `platform_api`, authenticationDomain: i3, passportDomain: r3, popupOverlayOptions: n3.popupOverlayOptions, crossSdkBridgeEnabled: n3.crossSdkBridgeEnabled });
  return typeof window < `u` && window.addEventListener(`message`, async (e3) => {
    if (e3.data.code && e3.data.state) {
      let t4 = window.location.search, n4 = new URLSearchParams(t4);
      n4.set(`code`, e3.data.code), n4.set(`state`, e3.data.state), window.history.replaceState(null, ``, `?${n4.toString()}`), await s3.loginCallback(), n4.delete(`code`), n4.delete(`state`), window.history.replaceState(null, ``, `?${n4.toString()}`);
    }
  }), { getUser: async (e3, t4) => e3 ? s3.forceUserRefresh() : t4?.silent ? s3.getUser() : s3.getUserOrLogin(), clientId: o4 };
}
async function qt2(e3 = {}) {
  let t3 = e3.chains && e3.chains.length > 0 ? e3.chains : $3, r3 = e3.initialChainId || t3[0].chainId, i3 = t3.find((e4) => e4.chainId === r3);
  if (!i3) throw Error(`Initial chain ${r3} not found in chains configuration`);
  let a3 = $2({ basePath: i3.apiUrl }), u3 = new bn({ indexer: a3, orderBook: a3, passport: a3 }), d3, f3;
  if (e3.getUser) d3 = e3.getUser, f3 = e3.clientId || Gt2(i3);
  else {
    let t4 = Kt2(i3, e3);
    d3 = t4.getUser, f3 = t4.clientId;
  }
  let p4 = await d3(void 0, { silent: true }).catch(() => null), m4 = i3.passportDomain || i3.apiUrl.replace(`api.`, `passport.`), h4 = new Et2({ passportDomain: m4, zkEvmRpcUrl: i3.rpcUrl, relayerUrl: i3.relayerUrl, indexerMrBasePath: i3.apiUrl, jsonRpcReferrer: e3.jsonRpcReferrer, forceScwDeployBeforeMessageSignature: e3.forceScwDeployBeforeMessageSignature, crossSdkBridgeEnabled: e3.crossSdkBridgeEnabled, feeTokenSymbol: e3.feeTokenSymbol }), g4 = e3.passportEventEmitter || new M2(), _4 = new Zt.GuardianApi(a3), v4 = new Je2({ config: h4, getUser: d3, guardianApi: _4, passportDomain: m4, clientId: f3 }), y4 = zt2(i3), ee4 = new An({ basePath: i3.magicTeeBasePath || `https://tee.express.magiclabs.com`, timeout: 1e4, magicPublishableApiKey: y4.magicPublishableApiKey, magicProviderId: y4.magicProviderId }), te4 = new jt2(d3, ee4), b4 = null;
  i3.chainId === 13371 ? b4 = `https://api.immutable.com` : i3.chainId === 13473 ? b4 = `https://api.sandbox.immutable.com` : i3.apiUrl && (b4 = i3.apiUrl);
  let x4 = new Tt2({ getUser: d3, clientId: f3, config: h4, multiRollupApiClients: u3, walletEventEmitter: g4, guardianClient: v4, ethSigner: te4, user: p4, sessionActivityApiUrl: b4 });
  return e3.announceProvider !== false && Nt2({ info: Mt2, provider: x4 }), x4;
}

// js/elumia-immutable-wallet.mjs
function getPassportRedirectUri(passportConfig) {
  if (passportConfig && passportConfig.redirectUri) {
    return passportConfig.redirectUri;
  }
  return window.location.origin + "/elumia-passport-callback";
}
function getPassportLogoutUri(passportConfig) {
  if (passportConfig && passportConfig.logoutRedirectUri) {
    return passportConfig.logoutRedirectUri;
  }
  return window.location.origin + "/elumia-inventory";
}
function createPassportAuth(passportConfig) {
  if (!passportConfig || !passportConfig.clientId) {
    throw new Error(
      "Immutable Passport client ID is not configured. Add passport.clientId to assets/elumia/imx-config.json after registering redirect URLs in Immutable Hub."
    );
  }
  var redirectUri = getPassportRedirectUri(passportConfig);
  return new Ee({
    clientId: passportConfig.clientId,
    redirectUri,
    popupRedirectUri: redirectUri,
    logoutRedirectUri: getPassportLogoutUri(passportConfig),
    audience: "platform_api",
    scope: "openid offline_access email transact"
  });
}
async function connectImmutablePassport(passportConfig) {
  var auth = createPassportAuth(passportConfig);
  var chainId = passportConfig && passportConfig.chainId != null ? passportConfig.chainId : 13371;
  var connectOptions = Object.assign({}, Ft2, {
    initialChainId: chainId,
    clientId: passportConfig.clientId,
    getUser: async function(forceRefresh) {
      if (forceRefresh) return auth.forceUserRefresh();
      return auth.getUserOrLogin();
    }
  });
  var provider = await qt2(connectOptions);
  var accounts = await provider.request({ method: "eth_requestAccounts" });
  if (!accounts || !accounts.length) {
    throw new Error("Immutable Passport did not return a wallet address.");
  }
  return { provider, address: accounts[0], auth };
}
async function completePassportCallback(passportConfig) {
  var auth = createPassportAuth(passportConfig);
  return auth.loginCallback();
}
export {
  completePassportCallback,
  connectImmutablePassport,
  createPassportAuth,
  getPassportLogoutUri,
  getPassportRedirectUri
};
/*! Bundled license information:

localforage/dist/localforage.js:
  (*!
      localForage -- Offline Storage, Improved
      Version 1.10.0
      https://localforage.github.io/localForage
      (c) 2013-2017 Mozilla, Apache License 2.0
  *)

@noble/hashes/esm/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/abstract/utils.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/abstract/modular.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/abstract/curve.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/abstract/weierstrass.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/_shortw_utils.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/secp256k1.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

tiny-lru/dist/tiny-lru.js:
  (**
   * tiny-lru
   *
   * @copyright 2026 Jason Mulligan <jason.mulligan@avoidwork.com>
   * @license BSD-3-Clause
   * @version 11.4.7
   *)
*/
