(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

var _this$1 = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var formatError = function formatError(errObj) {
  var col = errObj.column || errObj.columnNumber; // Safari Firefox 浏览器中才有的信息
  var row = errObj.line || errObj.lineNumber; // Safari Firefox   浏览器中才有的信息
  var message = errObj.message;
  var name = errObj.name;

  var stack = errObj.stack;

  if (stack) {
    var matchUrl = stack.match(/https?:\/\/[^\n]+/); // 匹配从http?s 开始到出现换行符的信息, 这个不仅包括报错的文件信息而且还包括了报错的行列信息
    var urlFirstStack = matchUrl ? matchUrl[0] : '';
    // 获取到报错的文件
    var regUrlCheck = /https?:\/\/(\S)*\.js/;

    var resourceUrl = '';
    if (regUrlCheck.test(urlFirstStack)) {
      resourceUrl = urlFirstStack.match(regUrlCheck)[0];
    }

    var stackCol = null; // 获取statck中的列信息
    var stackRow = null; // 获取statck中的行信息
    var posStack = urlFirstStack.match(/:(\d+):(\d+)/); // // :行:列
    if (posStack && posStack.length >= 3) {
      
      var _posStack = _slicedToArray(posStack, 3);

      stackCol = _posStack[1];
      stackRow = _posStack[2];
    }

    // TODO formatStack
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

var frameError = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(errObj) {
    var result;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return $.get('http://localhost:3000/sourcemap?col=' + errObj.col + '&row=' + errObj.row);

          case 2:
            result = _context.sent;

            console.log(result);
            return _context.abrupt('return', errObj);

          case 5:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, _this$1);
  }));

  return function frameError(_x) {
    return _ref.apply(this, arguments);
  };
}();

var errorCatch = {
  init: function init(cb) {
    var _originOnerror = window.onerror;
    window.onerror = function () {
      for (var _len = arguments.length, arg = Array(_len), _key = 0; _key < _len; _key++) {
        arg[_key] = arguments[_key];
      }

      var errorMessage = arg[0],
          scriptURI = arg[1],
          lineNumber = arg[2],
          columnNumber = arg[3],
          errorObj = arg[4];

      var errorInfo = formatError(errorObj);
      // 如果是使用webpack打包的框架代码报错，在处理一次，这里暂时使用resourceUrl字段进行区分是否是框架代码报错
      if (errorInfo.resourceUrl === 'http://localhost:3000/react-app/dist/main.bundle.js') {
        errorInfo = frameError(errorInfo);
      }

      errorInfo._errorMessage = errorMessage;
      errorInfo._scriptURI = scriptURI;
      errorInfo._lineNumber = lineNumber;
      errorInfo._columnNumber = columnNumber;
      errorInfo.type = 'onerror';
      cb(errorInfo);
      _originOnerror && _originOnerror.apply(window, arg);
    };

    var _originOnunhandledrejection = window.onunhandledrejection;
    window.onunhandledrejection = function () {
      for (var _len2 = arguments.length, arg = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        arg[_key2] = arguments[_key2];
      }

      var e = arg[0];
      var reason = e.reason;
      cb({
        type: e.type || 'unhandledrejection',
        reason: reason
      });
      _originOnunhandledrejection && _originOnunhandledrejection.apply(window, arg);
    };
  }
};

// 通过分模块的方式， 可以使用需要的模块。 让sdk具有更好的可维护性。
errorCatch.init(function (data) {
  console.log(data);
  console.log('catchError is start');
});

console.log('hello world 123');

})));
//# sourceMappingURL=bundle.umd.js.map
