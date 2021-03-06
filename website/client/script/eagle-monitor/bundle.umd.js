(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  var perf = {
    init: function init(cb) {
      cb();
      var isDOMReady = false;
      var isOnload = false;
      var cycleTime = 100;
      var Util = {
        getPerfData: function getPerfData(p) {
          var data = {
            // 网络建联
            prevPage: p.fetchStart - p.navigationStart,
            // 上一个页面的卸载时间
            redirect: p.redirectEnd - p.redirectStart,
            // 重定向时间， 两个网页非同域则为0
            dns: p.domainLookupEnd - p.domainLookupStart,
            // DNS查找时间
            connect: p.connectEnd - p.connectStart,
            // TCP建联时间
            network: p.connectEnd - p.navigationStart,
            // 网络总耗时， 前面的加起来
            // 网络接收
            send: p.responseStart - p.requestStart,
            // 前端从发送到接收的时间
            receive: p.responseEnd - p.responseStart,
            // 请求数据用时
            request: p.responseEnd - p.requestStart,
            // 请求页面的总耗时
            // 前端渲染
            dom: p.domComplete - p.domLoading,
            // dom解析时间
            loadEvent: p.loadEventEnd - p.loadEventStart,
            // loadEvent时间
            frontend: p.loadEventEnd - p.domLoading,
            // 前端总时间
            // 关键阶段
            load: p.loadEventEnd - p.navigationStart,
            // 页面完全加载时间
            domReady: p.domContentLoadedEventStart - p.navigationStart,
            // dom准备时间， 白屏时间
            interactive: p.domInteractive - p.navigationStart,
            // 可操作时间，用户的点击可以被响应了
            ttfb: p.responseStart - p.navigationStart // 首字节时间

          };
          return data;
        },
        // dom解析完成, DOMContentLoaded事件触发， 如果没有这个则要在load事件中加上settimeout
        // 在正常环境下  loadEvent  frontend  load一般来说是负值， 但是在小网页中，load事件发生的太快了，导致loadEvent有值，所以是正值的情况， 在onload之前运行
        // 有可能没有触发onload时间，比如打开tabao.com，上面会一直转圈圈，如果还在转圈圈的过程中用户关闭了，那么此时还没有触发onload事件，此时性能监控中的值就没有数据了，所以写了这么一个domReady方法。
        domReady: function domReady(callback) {
          if (isDOMReady) return;
          var timer = null; // 每100ms递归一次runCheck， 检查dom是否加载完成

          var runCheck = function runCheck() {
            if (performance.timing.domComplete) {
              // 这个可以判断dom加载完成了
              // 如果监测到dom解析完成，则停止循环监测，运行callback
              clearTimeout(timer);
              callback();
              isDOMReady = true;
            } else {
              // 再去循环检测
              timer = setTimeout(runCheck, cycleTime);
            }
          }; // 文档解析完成


          if (document.readyState === 'interactive') {
            // 这个也可以判断dom加载完成了
            callback();
            return void 0;
          }

          document.addEventListener('DOMContentLoaded', function () {
            // 案例来说这个也可以判断dom加载完成了，但是说并没有，这就不懂了
            runCheck();
          });
        },
        // 页面加载完成， onload事件触发
        onload: function onload(callback) {
          if (isOnload) return;
          var timer = null; // 每100ms递归一次runCheck， 检查dom是否加载完成

          var runCheck = function runCheck() {
            if (performance.timing.loadEventEnd) {
              // 这个可以判断dom加载完成了
              // 如果监测到dom解析完成，则停止循环监测，运行callback
              clearTimeout(timer);
              callback();
              isOnload = true;
            } else {
              // 再去循环检测
              timer = setTimeout(runCheck, cycleTime);
            }
          }; // 文档解析完成


          if (document.readyState === 'interactive') {
            // 这个也可以判断dom加载完成了
            callback();
            return void 0;
          }

          window.addEventListener('load', function () {
            // 案例来说这个也可以判断dom加载完成了，但是说并没有，这就不懂了
            runCheck();
          });
        }
      };
      var performance = window.performance;
      Util.domReady(function () {
        var perfData = Util.getPerfData(performance.timing);
        perfData.type = 'domready'; // 获取到此数据，应该给sdk上层， 去上传这个数据
      });
      Util.onload(function () {
        var perfData = Util.getPerfData(performance.timing);
        perfData.type = 'onload'; // 获取到此数据，应该给sdk上层， 去上传这个数据
      }); // document.addEventListener('DOMContentLoaded', () => {})
      // window.addEventListener('load', () => {
      //   // 为什么加settimeout 因为要保证load事件结束， 因为这些值都是固定值，所以settimeout不会对结果产生影响
      //   // setTimeout(() => {
      //   // console.log(performance.timing)
      //   let perfData = Util.getPerfData(performance.timing)
      //   debugger
      //   // }, 3000)
      // })
    }
  };

  var onload = function onload(cb) {
    if (document.readyState === 'complete') {
      cb();
      return;
    }

    window.addEventListener('load', function () {
      return cb();
    });
  };

  function filterTime(a, b) {
    return a > 0 && b > 0 && a - b >= 0 ? a - b : undefined;
  }

  var resolvePerformanceResource = function resolvePerformanceResource(resourceData) {
    var timing = resourceData;
    var o = {
      initiatorType: timing.initiatorType,
      // 资源类型
      name: timing.name,
      // 资源名称
      duration: timing.duration,
      // responseend-starttime， starttime是资源开始提取的时间
      // 连接过程
      redirect: filterTime(timing.redirectEnd, timing.redirectStart),
      // 重定向
      dns: filterTime(timing.domainLookupEnd, timing.domainLookupStart),
      // DNS解析
      connect: filterTime(timing.connectEnd, timing.connectStart),
      // TCP建连
      network: filterTime(timing.connectEnd, timing.startTime),
      // 网络总耗时
      send: filterTime(timing.responseStart, timing.requestStart),
      // 发送开始到接受第一个返回
      receive: filterTime(timing.responseEnd, timing.responseStart),
      // 接收总时间
      request: filterTime(timing.responseEnd, timing.requestStart),
      // 总时间 f12network显示的时间
      ttfb: filterTime(timing.responseStart, timing.requestStart) // 首字节时间

    };
    return o;
  }; // 循环获取每一个资源的性能数据


  var resolveEntries = function resolveEntries(entries) {
    return entries.map(function (_) {
      return resolvePerformanceResource(_);
    });
  };

  var resource = {
    init: function init(cb) {
      // 当有动态的文件加载进来以后，会给触发此条件, 所以要把此sdk放到最上面, 如果在onload之后有动态的资源继续加载进来，那么要开启此条件，并将打包后的sdk放到index.html的最上面
      // if (window.PerformanceObserver) {
      //   let observer = new window.PerformanceObserver(list => {
      //     try {
      //       let entries = list.getEntries()
      //       let entriesData = resolveEntries(entries)
      //       cb(entriesData)
      //     } catch (error) {
      //       console.error(error)
      //     }
      //   })
      //   observer.observe({ entryTypes: ['resource'] })
      // } else {
      onload(function () {
        var entries = performance.getEntriesByType('resource'); // resolvePerformanceResource(entries[0])

        var entriesData = resolveEntries(entries);
        cb(entriesData);
      }); // }
    }
  };

  var xhrHook = {
    init: function init(cb) {
      // xhr hook
      var xhr = window.XMLHttpRequest;

      if (xhr._eagle_flag === true) {
        return void 0;
      }

      xhr._eagle_flag = true;
      var _originOpen = xhr.prototype.open;

      xhr.prototype.open = function (method, url, async, user, password) {
        // TODO eagle url check
        this._eagle_xhr_info = {
          url: url,
          method: method,
          status: null
        };
        return _originOpen.apply(this, arguments);
      };

      var _originSend = xhr.prototype.send;

      xhr.prototype.send = function (value) {
        var _this2 = this;

        var _self = this;

        this._eagle_start_time = Date.now();

        var ajaxEnd = function ajaxEnd(event) {
          return function () {
            if (_self.response) {
              var responseSize = null;

              switch (_self.responseType) {
                case 'json':
                  responseSize = JSON && JSON.stringify(_this.response).length;
                  break;

                case 'blob':
                case 'moz-blob':
                  responseSize = _self.response.size;
                  break;

                case 'arraybuffer':
                  responseSize = _self.response.byteLength;

                case 'document':
                  responseSize = _self.response.documentElement && _self.response.documentElement.innerHTML && _self.response.documentElement.innerHTML.length + 28;
                  break;

                default:
                  responseSize = _self.response.length;
              }

              _self._eagle_xhr_info.event = event;
              _self._eagle_xhr_info.status = _self.status;
              _self._eagle_xhr_info.success = _self.status >= 200 && _self.status <= 206 || _self.status === 304;
              _self._eagle_xhr_info.duration = Date.now() - _self._eagle_start_time;
              _self._eagle_xhr_info.responseSize = responseSize;
              _self._eagle_xhr_info.requestSize = value ? value.length : 0;
              _self._eagle_xhr_info.type = 'xhr';
              cb(_this2._eagle_xhr_info);
            }
          };
        }; // TODO eagle url check


        this.addEventListener('load', ajaxEnd('load'), false);
        this.addEventListener('error', ajaxEnd('error'), false);
        this.addEventListener('abort', ajaxEnd('abort'), false);
        return _originSend.apply(this, arguments);
      }; // fetch hook


      if (window.fetch) {
        var _origin_fetch = window.fetch;

        window.fetch = function () {
          var startTime = Date.now();
          var args = [].slice.call(arguments);
          var fetchInput = args[0];
          var method = 'GET';
          var url;

          if (typeof fetchInput === 'string') {
            url = fetchInput;
          } else if ('Request' in window && fetchInput instanceof window.Request) {
            url = fetchInput.url;

            if (fetchInput.method) {
              method = fetchInput.method;
            }
          } else {
            url = '' + fetchInput;
          }

          if (args[1] && args[1].method) {
            method = args[1].method;
          } // TODO eagle check


          var fetchData = {
            method: method,
            url: url,
            status: null
          };
          return _origin_fetch.apply(this, args).then(function (response) {
            fetchData.status = response.status;
            fetchData.type = 'fetch';
            fetchData.duration = Date.now() - startTime;
            cb(fetchData);
            return response;
          });
        };
      }
    }
  };

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var runtime_1 = createCommonjsModule(function (module) {
  /**
   * Copyright (c) 2014-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  var runtime = (function (exports) {

    var Op = Object.prototype;
    var hasOwn = Op.hasOwnProperty;
    var undefined$1; // More compressible than void 0.
    var $Symbol = typeof Symbol === "function" ? Symbol : {};
    var iteratorSymbol = $Symbol.iterator || "@@iterator";
    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

    function define(obj, key, value) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
      return obj[key];
    }
    try {
      // IE 8 has a broken Object.defineProperty that only works on DOM objects.
      define({}, "");
    } catch (err) {
      define = function(obj, key, value) {
        return obj[key] = value;
      };
    }

    function wrap(innerFn, outerFn, self, tryLocsList) {
      // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
      var generator = Object.create(protoGenerator.prototype);
      var context = new Context(tryLocsList || []);

      // The ._invoke method unifies the implementations of the .next,
      // .throw, and .return methods.
      generator._invoke = makeInvokeMethod(innerFn, self, context);

      return generator;
    }
    exports.wrap = wrap;

    // Try/catch helper to minimize deoptimizations. Returns a completion
    // record like context.tryEntries[i].completion. This interface could
    // have been (and was previously) designed to take a closure to be
    // invoked without arguments, but in all the cases we care about we
    // already have an existing method we want to call, so there's no need
    // to create a new function object. We can even get away with assuming
    // the method takes exactly one argument, since that happens to be true
    // in every case, so we don't have to touch the arguments object. The
    // only additional allocation required is the completion record, which
    // has a stable shape and so hopefully should be cheap to allocate.
    function tryCatch(fn, obj, arg) {
      try {
        return { type: "normal", arg: fn.call(obj, arg) };
      } catch (err) {
        return { type: "throw", arg: err };
      }
    }

    var GenStateSuspendedStart = "suspendedStart";
    var GenStateSuspendedYield = "suspendedYield";
    var GenStateExecuting = "executing";
    var GenStateCompleted = "completed";

    // Returning this object from the innerFn has the same effect as
    // breaking out of the dispatch switch statement.
    var ContinueSentinel = {};

    // Dummy constructor functions that we use as the .constructor and
    // .constructor.prototype properties for functions that return Generator
    // objects. For full spec compliance, you may wish to configure your
    // minifier not to mangle the names of these two functions.
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}

    // This is a polyfill for %IteratorPrototype% for environments that
    // don't natively support it.
    var IteratorPrototype = {};
    IteratorPrototype[iteratorSymbol] = function () {
      return this;
    };

    var getProto = Object.getPrototypeOf;
    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
    if (NativeIteratorPrototype &&
        NativeIteratorPrototype !== Op &&
        hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
      // This environment has a native %IteratorPrototype%; use it instead
      // of the polyfill.
      IteratorPrototype = NativeIteratorPrototype;
    }

    var Gp = GeneratorFunctionPrototype.prototype =
      Generator.prototype = Object.create(IteratorPrototype);
    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
    GeneratorFunctionPrototype.constructor = GeneratorFunction;
    GeneratorFunction.displayName = define(
      GeneratorFunctionPrototype,
      toStringTagSymbol,
      "GeneratorFunction"
    );

    // Helper for defining the .next, .throw, and .return methods of the
    // Iterator interface in terms of a single ._invoke method.
    function defineIteratorMethods(prototype) {
      ["next", "throw", "return"].forEach(function(method) {
        define(prototype, method, function(arg) {
          return this._invoke(method, arg);
        });
      });
    }

    exports.isGeneratorFunction = function(genFun) {
      var ctor = typeof genFun === "function" && genFun.constructor;
      return ctor
        ? ctor === GeneratorFunction ||
          // For the native GeneratorFunction constructor, the best we can
          // do is to check its .name property.
          (ctor.displayName || ctor.name) === "GeneratorFunction"
        : false;
    };

    exports.mark = function(genFun) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
      } else {
        genFun.__proto__ = GeneratorFunctionPrototype;
        define(genFun, toStringTagSymbol, "GeneratorFunction");
      }
      genFun.prototype = Object.create(Gp);
      return genFun;
    };

    // Within the body of any async function, `await x` is transformed to
    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
    // `hasOwn.call(value, "__await")` to determine if the yielded value is
    // meant to be awaited.
    exports.awrap = function(arg) {
      return { __await: arg };
    };

    function AsyncIterator(generator, PromiseImpl) {
      function invoke(method, arg, resolve, reject) {
        var record = tryCatch(generator[method], generator, arg);
        if (record.type === "throw") {
          reject(record.arg);
        } else {
          var result = record.arg;
          var value = result.value;
          if (value &&
              typeof value === "object" &&
              hasOwn.call(value, "__await")) {
            return PromiseImpl.resolve(value.__await).then(function(value) {
              invoke("next", value, resolve, reject);
            }, function(err) {
              invoke("throw", err, resolve, reject);
            });
          }

          return PromiseImpl.resolve(value).then(function(unwrapped) {
            // When a yielded Promise is resolved, its final value becomes
            // the .value of the Promise<{value,done}> result for the
            // current iteration.
            result.value = unwrapped;
            resolve(result);
          }, function(error) {
            // If a rejected Promise was yielded, throw the rejection back
            // into the async generator function so it can be handled there.
            return invoke("throw", error, resolve, reject);
          });
        }
      }

      var previousPromise;

      function enqueue(method, arg) {
        function callInvokeWithMethodAndArg() {
          return new PromiseImpl(function(resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }

        return previousPromise =
          // If enqueue has been called before, then we want to wait until
          // all previous Promises have been resolved before calling invoke,
          // so that results are always delivered in the correct order. If
          // enqueue has not been called before, then it is important to
          // call invoke immediately, without waiting on a callback to fire,
          // so that the async generator function has the opportunity to do
          // any necessary setup in a predictable way. This predictability
          // is why the Promise constructor synchronously invokes its
          // executor callback, and why async functions synchronously
          // execute code before the first await. Since we implement simple
          // async functions in terms of async generators, it is especially
          // important to get this right, even though it requires care.
          previousPromise ? previousPromise.then(
            callInvokeWithMethodAndArg,
            // Avoid propagating failures to Promises returned by later
            // invocations of the iterator.
            callInvokeWithMethodAndArg
          ) : callInvokeWithMethodAndArg();
      }

      // Define the unified helper method that is used to implement .next,
      // .throw, and .return (see defineIteratorMethods).
      this._invoke = enqueue;
    }

    defineIteratorMethods(AsyncIterator.prototype);
    AsyncIterator.prototype[asyncIteratorSymbol] = function () {
      return this;
    };
    exports.AsyncIterator = AsyncIterator;

    // Note that simple async functions are implemented on top of
    // AsyncIterator objects; they just return a Promise for the value of
    // the final result produced by the iterator.
    exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
      if (PromiseImpl === void 0) PromiseImpl = Promise;

      var iter = new AsyncIterator(
        wrap(innerFn, outerFn, self, tryLocsList),
        PromiseImpl
      );

      return exports.isGeneratorFunction(outerFn)
        ? iter // If outerFn is a generator, return the full iterator.
        : iter.next().then(function(result) {
            return result.done ? result.value : iter.next();
          });
    };

    function makeInvokeMethod(innerFn, self, context) {
      var state = GenStateSuspendedStart;

      return function invoke(method, arg) {
        if (state === GenStateExecuting) {
          throw new Error("Generator is already running");
        }

        if (state === GenStateCompleted) {
          if (method === "throw") {
            throw arg;
          }

          // Be forgiving, per 25.3.3.3.3 of the spec:
          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
          return doneResult();
        }

        context.method = method;
        context.arg = arg;

        while (true) {
          var delegate = context.delegate;
          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context);
            if (delegateResult) {
              if (delegateResult === ContinueSentinel) continue;
              return delegateResult;
            }
          }

          if (context.method === "next") {
            // Setting context._sent for legacy support of Babel's
            // function.sent implementation.
            context.sent = context._sent = context.arg;

          } else if (context.method === "throw") {
            if (state === GenStateSuspendedStart) {
              state = GenStateCompleted;
              throw context.arg;
            }

            context.dispatchException(context.arg);

          } else if (context.method === "return") {
            context.abrupt("return", context.arg);
          }

          state = GenStateExecuting;

          var record = tryCatch(innerFn, self, context);
          if (record.type === "normal") {
            // If an exception is thrown from innerFn, we leave state ===
            // GenStateExecuting and loop back for another invocation.
            state = context.done
              ? GenStateCompleted
              : GenStateSuspendedYield;

            if (record.arg === ContinueSentinel) {
              continue;
            }

            return {
              value: record.arg,
              done: context.done
            };

          } else if (record.type === "throw") {
            state = GenStateCompleted;
            // Dispatch the exception by looping back around to the
            // context.dispatchException(context.arg) call above.
            context.method = "throw";
            context.arg = record.arg;
          }
        }
      };
    }

    // Call delegate.iterator[context.method](context.arg) and handle the
    // result, either by returning a { value, done } result from the
    // delegate iterator, or by modifying context.method and context.arg,
    // setting context.delegate to null, and returning the ContinueSentinel.
    function maybeInvokeDelegate(delegate, context) {
      var method = delegate.iterator[context.method];
      if (method === undefined$1) {
        // A .throw or .return when the delegate iterator has no .throw
        // method always terminates the yield* loop.
        context.delegate = null;

        if (context.method === "throw") {
          // Note: ["return"] must be used for ES3 parsing compatibility.
          if (delegate.iterator["return"]) {
            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            context.method = "return";
            context.arg = undefined$1;
            maybeInvokeDelegate(delegate, context);

            if (context.method === "throw") {
              // If maybeInvokeDelegate(context) changed context.method from
              // "return" to "throw", let that override the TypeError below.
              return ContinueSentinel;
            }
          }

          context.method = "throw";
          context.arg = new TypeError(
            "The iterator does not provide a 'throw' method");
        }

        return ContinueSentinel;
      }

      var record = tryCatch(method, delegate.iterator, context.arg);

      if (record.type === "throw") {
        context.method = "throw";
        context.arg = record.arg;
        context.delegate = null;
        return ContinueSentinel;
      }

      var info = record.arg;

      if (! info) {
        context.method = "throw";
        context.arg = new TypeError("iterator result is not an object");
        context.delegate = null;
        return ContinueSentinel;
      }

      if (info.done) {
        // Assign the result of the finished delegate to the temporary
        // variable specified by delegate.resultName (see delegateYield).
        context[delegate.resultName] = info.value;

        // Resume execution at the desired location (see delegateYield).
        context.next = delegate.nextLoc;

        // If context.method was "throw" but the delegate handled the
        // exception, let the outer generator proceed normally. If
        // context.method was "next", forget context.arg since it has been
        // "consumed" by the delegate iterator. If context.method was
        // "return", allow the original .return call to continue in the
        // outer generator.
        if (context.method !== "return") {
          context.method = "next";
          context.arg = undefined$1;
        }

      } else {
        // Re-yield the result returned by the delegate method.
        return info;
      }

      // The delegate iterator is finished, so forget it and continue with
      // the outer generator.
      context.delegate = null;
      return ContinueSentinel;
    }

    // Define Generator.prototype.{next,throw,return} in terms of the
    // unified ._invoke helper method.
    defineIteratorMethods(Gp);

    define(Gp, toStringTagSymbol, "Generator");

    // A Generator should always return itself as the iterator object when the
    // @@iterator function is called on it. Some browsers' implementations of the
    // iterator prototype chain incorrectly implement this, causing the Generator
    // object to not be returned from this call. This ensures that doesn't happen.
    // See https://github.com/facebook/regenerator/issues/274 for more details.
    Gp[iteratorSymbol] = function() {
      return this;
    };

    Gp.toString = function() {
      return "[object Generator]";
    };

    function pushTryEntry(locs) {
      var entry = { tryLoc: locs[0] };

      if (1 in locs) {
        entry.catchLoc = locs[1];
      }

      if (2 in locs) {
        entry.finallyLoc = locs[2];
        entry.afterLoc = locs[3];
      }

      this.tryEntries.push(entry);
    }

    function resetTryEntry(entry) {
      var record = entry.completion || {};
      record.type = "normal";
      delete record.arg;
      entry.completion = record;
    }

    function Context(tryLocsList) {
      // The root entry object (effectively a try statement without a catch
      // or a finally block) gives us a place to store values thrown from
      // locations where there is no enclosing try statement.
      this.tryEntries = [{ tryLoc: "root" }];
      tryLocsList.forEach(pushTryEntry, this);
      this.reset(true);
    }

    exports.keys = function(object) {
      var keys = [];
      for (var key in object) {
        keys.push(key);
      }
      keys.reverse();

      // Rather than returning an object with a next method, we keep
      // things simple and return the next function itself.
      return function next() {
        while (keys.length) {
          var key = keys.pop();
          if (key in object) {
            next.value = key;
            next.done = false;
            return next;
          }
        }

        // To avoid creating an additional object, we just hang the .value
        // and .done properties off the next function object itself. This
        // also ensures that the minifier will not anonymize the function.
        next.done = true;
        return next;
      };
    };

    function values(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];
        if (iteratorMethod) {
          return iteratorMethod.call(iterable);
        }

        if (typeof iterable.next === "function") {
          return iterable;
        }

        if (!isNaN(iterable.length)) {
          var i = -1, next = function next() {
            while (++i < iterable.length) {
              if (hasOwn.call(iterable, i)) {
                next.value = iterable[i];
                next.done = false;
                return next;
              }
            }

            next.value = undefined$1;
            next.done = true;

            return next;
          };

          return next.next = next;
        }
      }

      // Return an iterator with no values.
      return { next: doneResult };
    }
    exports.values = values;

    function doneResult() {
      return { value: undefined$1, done: true };
    }

    Context.prototype = {
      constructor: Context,

      reset: function(skipTempReset) {
        this.prev = 0;
        this.next = 0;
        // Resetting context._sent for legacy support of Babel's
        // function.sent implementation.
        this.sent = this._sent = undefined$1;
        this.done = false;
        this.delegate = null;

        this.method = "next";
        this.arg = undefined$1;

        this.tryEntries.forEach(resetTryEntry);

        if (!skipTempReset) {
          for (var name in this) {
            // Not sure about the optimal order of these conditions:
            if (name.charAt(0) === "t" &&
                hasOwn.call(this, name) &&
                !isNaN(+name.slice(1))) {
              this[name] = undefined$1;
            }
          }
        }
      },

      stop: function() {
        this.done = true;

        var rootEntry = this.tryEntries[0];
        var rootRecord = rootEntry.completion;
        if (rootRecord.type === "throw") {
          throw rootRecord.arg;
        }

        return this.rval;
      },

      dispatchException: function(exception) {
        if (this.done) {
          throw exception;
        }

        var context = this;
        function handle(loc, caught) {
          record.type = "throw";
          record.arg = exception;
          context.next = loc;

          if (caught) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            context.method = "next";
            context.arg = undefined$1;
          }

          return !! caught;
        }

        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          var record = entry.completion;

          if (entry.tryLoc === "root") {
            // Exception thrown outside of any try block that could handle
            // it, so set the completion value of the entire function to
            // throw the exception.
            return handle("end");
          }

          if (entry.tryLoc <= this.prev) {
            var hasCatch = hasOwn.call(entry, "catchLoc");
            var hasFinally = hasOwn.call(entry, "finallyLoc");

            if (hasCatch && hasFinally) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              } else if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else if (hasCatch) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              }

            } else if (hasFinally) {
              if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else {
              throw new Error("try statement without catch or finally");
            }
          }
        }
      },

      abrupt: function(type, arg) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc <= this.prev &&
              hasOwn.call(entry, "finallyLoc") &&
              this.prev < entry.finallyLoc) {
            var finallyEntry = entry;
            break;
          }
        }

        if (finallyEntry &&
            (type === "break" ||
             type === "continue") &&
            finallyEntry.tryLoc <= arg &&
            arg <= finallyEntry.finallyLoc) {
          // Ignore the finally entry if control is not jumping to a
          // location outside the try/catch block.
          finallyEntry = null;
        }

        var record = finallyEntry ? finallyEntry.completion : {};
        record.type = type;
        record.arg = arg;

        if (finallyEntry) {
          this.method = "next";
          this.next = finallyEntry.finallyLoc;
          return ContinueSentinel;
        }

        return this.complete(record);
      },

      complete: function(record, afterLoc) {
        if (record.type === "throw") {
          throw record.arg;
        }

        if (record.type === "break" ||
            record.type === "continue") {
          this.next = record.arg;
        } else if (record.type === "return") {
          this.rval = this.arg = record.arg;
          this.method = "return";
          this.next = "end";
        } else if (record.type === "normal" && afterLoc) {
          this.next = afterLoc;
        }

        return ContinueSentinel;
      },

      finish: function(finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.finallyLoc === finallyLoc) {
            this.complete(entry.completion, entry.afterLoc);
            resetTryEntry(entry);
            return ContinueSentinel;
          }
        }
      },

      "catch": function(tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc === tryLoc) {
            var record = entry.completion;
            if (record.type === "throw") {
              var thrown = record.arg;
              resetTryEntry(entry);
            }
            return thrown;
          }
        }

        // The context.catch method must only be called with a location
        // argument that corresponds to a known catch block.
        throw new Error("illegal catch attempt");
      },

      delegateYield: function(iterable, resultName, nextLoc) {
        this.delegate = {
          iterator: values(iterable),
          resultName: resultName,
          nextLoc: nextLoc
        };

        if (this.method === "next") {
          // Deliberately forget the last sent value so that we don't
          // accidentally pass it on to the delegate.
          this.arg = undefined$1;
        }

        return ContinueSentinel;
      }
    };

    // Regardless of whether this script is executing as a CommonJS module
    // or not, return the runtime object so that we can declare the variable
    // regeneratorRuntime in the outer scope, which allows this module to be
    // injected easily by `bin/regenerator --include-runtime script.js`.
    return exports;

  }(
    // If this script is executing as a CommonJS module, use module.exports
    // as the regeneratorRuntime namespace. Otherwise create a new empty
    // object. Either way, the resulting object will be used to initialize
    // the regeneratorRuntime variable at the top of this file.
     module.exports 
  ));

  try {
    regeneratorRuntime = runtime;
  } catch (accidentalStrictMode) {
    // This module should not be running in strict mode, so the above
    // assignment should always work unless something is misconfigured. Just
    // in case runtime.js accidentally runs in strict mode, we can escape
    // strict mode using a global Function call. This could conceivably fail
    // if a Content Security Policy forbids using Function, but in that case
    // the proper solution is to fix the accidental strict mode problem. If
    // you've misconfigured your bundler to force strict mode and applied a
    // CSP to forbid Function, and you're not willing to fix either of those
    // problems, please detail your unique predicament in a GitHub issue.
    Function("r", "regeneratorRuntime = r")(runtime);
  }
  });

  var regenerator = runtime_1;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  var asyncToGenerator = _asyncToGenerator;

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  var arrayWithHoles = _arrayWithHoles;

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  var iterableToArrayLimit = _iterableToArrayLimit;

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  }

  var arrayLikeToArray = _arrayLikeToArray;

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
  }

  var unsupportedIterableToArray = _unsupportedIterableToArray;

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var nonIterableRest = _nonIterableRest;

  function _slicedToArray(arr, i) {
    return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || unsupportedIterableToArray(arr, i) || nonIterableRest();
  }

  var slicedToArray = _slicedToArray;

  var formatError = function formatError(errObj) {
    var col = errObj.column || errObj.columnNumber; // Safari Firefox 浏览器中才有的信息

    var row = errObj.line || errObj.lineNumber; // Safari Firefox   浏览器中才有的信息

    var message = errObj.message;
    var name = errObj.name;
    var stack = errObj.stack;

    if (stack) {
      var matchUrl = stack.match(/https?:\/\/[^\n]+/); // 匹配从http?s 开始到出现换行符的信息, 这个不仅包括报错的文件信息而且还包括了报错的行列信息

      var urlFirstStack = matchUrl ? matchUrl[0] : ''; // 获取到报错的文件

      var regUrlCheck = /https?:\/\/(\S)*\.js/;
      var resourceUrl = '';

      if (regUrlCheck.test(urlFirstStack)) {
        resourceUrl = urlFirstStack.match(regUrlCheck)[0];
      }

      var stackCol = null; // 获取statck中的列信息

      var stackRow = null; // 获取statck中的行信息

      var posStack = urlFirstStack.match(/:(\d+):(\d+)/); // // :行:列

      if (posStack && posStack.length >= 3) {

        var _posStack = slicedToArray(posStack, 3);

        stackCol = _posStack[1];
        stackRow = _posStack[2];
      } // TODO formatStack


      return {
        content: stack,
        col: Number(col || stackCol),
        row: Number(row || stackRow),
        message: message,
        name: name,
        resourceUrl: resourceUrl
      };
    }

    return {
      row: row,
      col: col,
      message: message,
      name: name
    };
  };

  var frameError = /*#__PURE__*/function () {
    var _ref = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(errObj) {
      var result;
      return regenerator.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return $.get("http://localhost:3000/sourcemap?col=".concat(errObj.col, "&row=").concat(errObj.row));

            case 2:
              result = _context.sent;
              return _context.abrupt("return", result);

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function frameError(_x) {
      return _ref.apply(this, arguments);
    };
  }();

  var errorCatch = {
    init: function init(cb) {
      var _originOnerror = window.onerror;
      window.onerror = /*#__PURE__*/asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2() {
        var _len,
            arg,
            _key,
            errorMessage,
            scriptURI,
            lineNumber,
            columnNumber,
            errorObj,
            errorInfo,
            frameResult,
            _args2 = arguments;

        return regenerator.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                for (_len = _args2.length, arg = new Array(_len), _key = 0; _key < _len; _key++) {
                  arg[_key] = _args2[_key];
                }

                errorMessage = arg[0], scriptURI = arg[1], lineNumber = arg[2], columnNumber = arg[3], errorObj = arg[4];
                errorInfo = formatError(errorObj); // 如果是使用webpack打包的框架代码报错，在处理一次，这里暂时使用resourceUrl字段进行区分是否是框架代码报错

                if (!(errorInfo.resourceUrl === 'http://localhost:3000/react-app/dist/main.bundle.js')) {
                  _context2.next = 12;
                  break;
                }

                _context2.next = 6;
                return frameError(errorInfo);

              case 6:
                frameResult = _context2.sent;
                errorInfo.col = frameResult.column;
                errorInfo.row = frameResult.line;
                errorInfo.name = frameResult.name;
                errorInfo.source = frameResult.source;
                errorInfo.sourcesContentMap = frameResult.sourcesContentMap;

              case 12:
                errorInfo._errorMessage = errorMessage;
                errorInfo._scriptURI = scriptURI;
                errorInfo._lineNumber = lineNumber;
                errorInfo._columnNumber = columnNumber;
                errorInfo.type = 'onerror';
                cb(errorInfo);
                _originOnerror && _originOnerror.apply(window, arg);

              case 19:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));
      var _originOnunhandledrejection = window.onunhandledrejection;

      window.onunhandledrejection = function () {
        for (var _len2 = arguments.length, arg = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          arg[_key2] = arguments[_key2];
        }

        var e = arg[0];
        var reason = e.reason;
        cb({
          type: e.type || 'unhandledrejection',
          reason: reason
        });
        _originOnunhandledrejection && _originOnunhandledrejection.apply(window, arg);
      }; // 资源加载错误， 但不是js抛出的错误，


      window.addEventListener('error', function (event) {
        // 过滤js error
        var target = event.target || event.srcElement;
        var isElementTarget = target instanceof HTMLScriptElement || target instanceof HTMLLinkElement || target instanceof HTMLImageElement;
        if (!isElementTarget) return false; // 上报资源地址

        var url = target.src || target.href;
        cb({
          url: url
        });
      }, true);
    }
  };

  // 通过分模块的方式， 可以使用需要的模块。 让sdk具有更好的可维护性。
  perf.init(function (data) {
    console.log('perf监测启动');
    console.log(data);
  });
  resource.init(function (resourceData) {
    console.log('resource监测启动');
    console.log(resourceData);
  });
  xhrHook.init(function (data) {
    console.log('接口性能监控');
    console.log(data);
  });
  errorCatch.init(function (data) {
    console.log('错误监控');
    console.log(data);
  });
  console.log('hello world 123');

})));
//# sourceMappingURL=bundle.umd.js.map
