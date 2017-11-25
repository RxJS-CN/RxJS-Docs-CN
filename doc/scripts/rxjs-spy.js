(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.RxSpy = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = (window.Rx);
var tag_1 = require("../../operator/tag");
Observable_1.Observable.prototype.tag = tag_1.tag;

},{"../../operator/tag":8}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var noop_ = function () { };
var hook_ = noop_;
function detect(id) {
    hook_(id);
}
exports.detect = detect;
function hook(hook) {
    hook_ = hook || noop_;
}
exports.hook = hook;

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Detector = (function () {
    function Detector(snapshotPlugin) {
        this.detectorRecords_ = new Map();
        this.snapshotPlugin_ = snapshotPlugin;
    }
    Detector.prototype.detect = function (id) {
        var _a = this, detectorRecords_ = _a.detectorRecords_, snapshotPlugin_ = _a.snapshotPlugin_;
        if (!snapshotPlugin_) {
            console.warn("Snapshotting is not enabled.");
            return null;
        }
        var detectorRecord = detectorRecords_.get(id);
        var snapshotRecord = this.record_(snapshotPlugin_.snapshotAll());
        if (detectorRecord) {
            detectorRecord.snapshotRecords.push(snapshotRecord);
        }
        else {
            detectorRecord = {
                snapshotRecords: [snapshotRecord]
            };
            detectorRecords_.set(id, detectorRecord);
        }
        if (detectorRecord.snapshotRecords.length > 2) {
            detectorRecord.snapshotRecords.shift();
        }
        if (detectorRecord.snapshotRecords.length < 2) {
            return null;
        }
        var _b = detectorRecord.snapshotRecords, previous = _b[0], current = _b[1];
        return this.compare_(id, previous, current);
    };
    Detector.prototype.compare_ = function (id, previous, current) {
        var subscriptions = [];
        var unsubscriptions = [];
        var mergeSubscriptions = [];
        var mergeUnsubscriptions = [];
        var previousSubscriptions = previous.rootSubscriptions;
        var currentSubscriptions = current.rootSubscriptions;
        previousSubscriptions.forEach(function (previous, key) {
            if (!currentSubscriptions.has(key)) {
                unsubscriptions.push(previous);
            }
        });
        currentSubscriptions.forEach(function (current, key) {
            var previous = previousSubscriptions.get(key);
            if (previous) {
                var previousMerges_1 = previous.merges;
                var currentMerges_1 = current.merges;
                previousMerges_1.forEach(function (merge, key) {
                    if (!currentMerges_1.has(key)) {
                        mergeUnsubscriptions.push(merge);
                    }
                });
                currentMerges_1.forEach(function (merge, key) {
                    if (!previousMerges_1.has(key)) {
                        mergeSubscriptions.push(merge);
                    }
                });
            }
            else {
                subscriptions.push(current);
            }
        });
        if (mergeSubscriptions.length === 0 &&
            mergeUnsubscriptions.length === 0 &&
            subscriptions.length === 0 &&
            unsubscriptions.length === 0) {
            return null;
        }
        return {
            mergeSubscriptions: mergeSubscriptions,
            mergeUnsubscriptions: mergeUnsubscriptions,
            subscriptions: subscriptions.map(function (s) { return s.subscriptionSnapshot; }),
            unsubscriptions: unsubscriptions.map(function (s) { return s.subscriptionSnapshot; })
        };
    };
    Detector.prototype.findMergedSubscriptions_ = function (snapshot, subscriptionRecord) {
        var merges = subscriptionRecord.merges, subscriptionSnapshot = subscriptionRecord.subscriptionSnapshot;
        snapshot.subscriptions.forEach(function (s) {
            if (s.rootSink === subscriptionSnapshot) {
                s.merges.forEach(function (m) {
                    var subscription = m.subscription;
                    if (!subscription.closed) {
                        merges.set(subscription, m);
                    }
                });
            }
        });
    };
    Detector.prototype.findRootSubscriptions_ = function (snapshot, rootSubscriptions) {
        var _this = this;
        snapshot.observables.forEach(function (observableSnapshot) {
            observableSnapshot.subscribers.forEach(function (subscriberSnapshot) {
                subscriberSnapshot.subscriptions.forEach(function (subscriptionSnapshot) {
                    var complete = subscriptionSnapshot.complete, error = subscriptionSnapshot.error, sink = subscriptionSnapshot.sink, subscription = subscriptionSnapshot.subscription;
                    if (!complete && !error && !sink && !subscription.closed) {
                        var subscriptionRecord = {
                            merges: new Map(),
                            subscriptionSnapshot: subscriptionSnapshot
                        };
                        _this.findMergedSubscriptions_(snapshot, subscriptionRecord);
                        rootSubscriptions.set(subscription, subscriptionRecord);
                    }
                });
            });
        });
    };
    Detector.prototype.record_ = function (snapshot) {
        var rootSubscriptions = new Map();
        this.findRootSubscriptions_(snapshot, rootSubscriptions);
        return { rootSubscriptions: rootSubscriptions, snapshot: snapshot };
    };
    return Detector;
}());
exports.Detector = Detector;

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var idSymbol = Symbol("id");
var lastId = 0;
function identify(instance) {
    var id = instance[idSymbol] = instance[idSymbol] || ++lastId;
    return id;
}
exports.identify = identify;

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./add/operator/tag");
var detect_1 = require("./detect");
exports.detect = detect_1.detect;
var logger_1 = require("./logger");
exports.defaultLogger = logger_1.defaultLogger;
exports.toLogger = logger_1.toLogger;
var match_1 = require("./match");
exports.matches = match_1.matches;
var plugin_1 = require("./plugin");
exports.BasePlugin = plugin_1.BasePlugin;
var spy_1 = require("./spy");
exports.debug = spy_1.debug;
exports.find = spy_1.find;
exports.findAll = spy_1.findAll;
exports.flush = spy_1.flush;
exports._let = spy_1._let;
exports.log = spy_1.log;
exports.pause = spy_1.pause;
exports.plugin = spy_1.plugin;
exports.plugins = spy_1.plugins;
exports.show = spy_1.show;
exports.spy = spy_1.spy;

},{"./add/operator/tag":1,"./detect":2,"./logger":6,"./match":7,"./plugin":12,"./spy":20}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultLogger = console;
function toLogger(partialLogger) {
    if (partialLogger.error &&
        partialLogger.group &&
        partialLogger.groupCollapsed &&
        partialLogger.groupEnd &&
        partialLogger.warn) {
        return partialLogger;
    }
    var spaces = 2;
    var indent = 0;
    return {
        error: function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            call.apply(void 0, ["error", message].concat(args));
        },
        group: function (title) {
            call("log", title);
            indent += spaces;
        },
        groupCollapsed: function (title) {
            call("log", title);
            indent += spaces;
        },
        groupEnd: function () {
            indent = Math.max(0, indent - spaces);
        },
        log: function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            call.apply(void 0, ["log", message].concat(args));
        },
        warn: function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            call.apply(void 0, ["warn", message].concat(args));
        }
    };
    function call(method, message) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var padding = " ".repeat(indent);
        if (message) {
            message = padding + message;
        }
        else {
            message = padding;
        }
        (_a = (partialLogger[method] || partialLogger.log)).call.apply(_a, [partialLogger, message].concat(args));
        var _a;
    }
}
exports.toLogger = toLogger;

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
function matches(observable, match) {
    if (util_1.isObservable(match)) {
        return observable === match;
    }
    var tag = read(observable);
    if (typeof match === "function") {
        return match(tag, observable);
    }
    if (tag === null) {
        return false;
    }
    else if (typeof match === "string") {
        return match === tag;
    }
    return match.test(tag);
}
exports.matches = matches;
function read(observable) {
    var operator = observable["operator"];
    if (!operator) {
        return null;
    }
    var tag = operator["tag"];
    if (!tag) {
        return null;
    }
    return tag;
}
exports.read = read;
function toString(match) {
    if (util_1.isObservable(match)) {
        return "[Observable]";
    }
    else if (typeof match === "function") {
        return "[Function]";
    }
    return match.toString();
}
exports.toString = toString;

},{"./util":22}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tag_1 = require("../operators/tag");
function tag(tag) {
    return tag_1.tag(tag)(this);
}
exports.tag = tag;

},{"../operators/tag":9}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function tag(tag) {
    return function tagOperation(source) {
        return source.lift(new TagOperator(tag));
    };
}
exports.tag = tag;
var TagOperator = (function () {
    function TagOperator(tag) {
        this.tag = tag;
    }
    TagOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(subscriber);
    };
    return TagOperator;
}());

},{}],10:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var match_1 = require("../match");
var plugin_1 = require("./plugin");
var DebugPlugin = (function (_super) {
    __extends(DebugPlugin, _super);
    function DebugPlugin(match, notifications) {
        var _this = _super.call(this) || this;
        _this.notifications_ = notifications;
        _this.matcher_ = function (observable, notification) { return match_1.matches(observable, match) && (_this.notifications_.indexOf(notification) !== -1); };
        return _this;
    }
    DebugPlugin.prototype.beforeComplete = function (ref) {
        var matcher_ = this.matcher_;
        var observable = ref.observable;
        if (matcher_(observable, "complete")) {
            debugger;
        }
    };
    DebugPlugin.prototype.beforeError = function (ref, error) {
        var matcher_ = this.matcher_;
        var observable = ref.observable;
        if (matcher_(observable, "error")) {
            debugger;
        }
    };
    DebugPlugin.prototype.beforeNext = function (ref, value) {
        var matcher_ = this.matcher_;
        var observable = ref.observable;
        if (matcher_(observable, "next")) {
            debugger;
        }
    };
    DebugPlugin.prototype.beforeSubscribe = function (ref) {
        var matcher_ = this.matcher_;
        var observable = ref.observable;
        if (matcher_(observable, "subscribe")) {
            debugger;
        }
    };
    DebugPlugin.prototype.beforeUnsubscribe = function (ref) {
        var matcher_ = this.matcher_;
        var observable = ref.observable;
        if (matcher_(observable, "unsubscribe")) {
            debugger;
        }
    };
    return DebugPlugin;
}(plugin_1.BasePlugin));
exports.DebugPlugin = DebugPlugin;

},{"../match":7,"./plugin":16}],11:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var plugin_1 = require("./plugin");
var graphRefSymbol = Symbol("graphRef");
function getGraphRef(ref) {
    return ref[graphRefSymbol];
}
exports.getGraphRef = getGraphRef;
function setGraphRef(ref, value) {
    ref[graphRefSymbol] = value;
    return value;
}
var GraphPlugin = (function (_super) {
    __extends(GraphPlugin, _super);
    function GraphPlugin(_a) {
        var _b = (_a === void 0 ? {} : _a).keptDuration, keptDuration = _b === void 0 ? 30000 : _b;
        var _this = _super.call(this) || this;
        _this.keptDuration_ = keptDuration;
        _this.notifications_ = [];
        _this.sentinel_ = {
            depth: 0,
            link: null,
            merged: false,
            merges: [],
            mergesFlushed: 0,
            rootSink: null,
            sentinel: null,
            sink: null,
            sources: [],
            sourcesFlushed: 0
        };
        _this.sentinel_.link = _this.sentinel_;
        _this.sentinel_.sentinel = _this.sentinel_;
        return _this;
    }
    GraphPlugin.prototype.afterNext = function (ref, value) {
        var notifications_ = this.notifications_;
        notifications_.pop();
    };
    GraphPlugin.prototype.afterSubscribe = function (ref) {
        var notifications_ = this.notifications_;
        notifications_.pop();
    };
    GraphPlugin.prototype.afterUnsubscribe = function (ref) {
        var _a = this, notifications_ = _a.notifications_, sentinel_ = _a.sentinel_;
        notifications_.pop();
        var length = notifications_.length;
        if ((length === 0) || (notifications_[length - 1].notification !== "unsubscribe")) {
            this.flush_(ref);
        }
    };
    GraphPlugin.prototype.beforeNext = function (ref, value) {
        var notifications_ = this.notifications_;
        notifications_.push({ notification: "next", ref: ref });
    };
    GraphPlugin.prototype.beforeSubscribe = function (ref) {
        var _a = this, notifications_ = _a.notifications_, sentinel_ = _a.sentinel_;
        var graphRef = setGraphRef(ref, {
            depth: 1,
            link: sentinel_,
            merged: false,
            merges: [],
            mergesFlushed: 0,
            rootSink: null,
            sentinel: sentinel_,
            sink: null,
            sources: [],
            sourcesFlushed: 0
        });
        var length = notifications_.length;
        if ((length > 0) && (notifications_[length - 1].notification === "next")) {
            var sinkRef = notifications_[length - 1].ref;
            var sinkGraphRef = getGraphRef(sinkRef);
            sinkGraphRef.merges.push(ref);
            graphRef.link = sinkGraphRef;
            graphRef.merged = true;
            graphRef.rootSink = sinkGraphRef.rootSink || sinkRef;
            graphRef.sink = sinkRef;
        }
        else {
            for (var n = length - 1; n > -1; --n) {
                if (notifications_[n].notification === "subscribe") {
                    var sinkRef = notifications_[length - 1].ref;
                    var sinkGraphRef = getGraphRef(sinkRef);
                    sinkGraphRef.sources.push(ref);
                    graphRef.depth = sinkGraphRef.depth + 1;
                    graphRef.link = sinkGraphRef;
                    graphRef.rootSink = sinkGraphRef.rootSink || sinkRef;
                    graphRef.sink = sinkRef;
                    break;
                }
            }
        }
        if (graphRef.link === graphRef.sentinel) {
            graphRef.sentinel.sources.push(ref);
        }
        notifications_.push({ notification: "subscribe", ref: ref });
    };
    GraphPlugin.prototype.beforeUnsubscribe = function (ref) {
        var notifications_ = this.notifications_;
        notifications_.push({ notification: "unsubscribe", ref: ref });
    };
    GraphPlugin.prototype.flush_ = function (ref) {
        var _this = this;
        var graphRef = getGraphRef(ref);
        var merges = graphRef.merges, sources = graphRef.sources;
        if (!ref.unsubscribed || !merges.every(function (ref) { return ref.unsubscribed; }) || !sources.every(function (ref) { return ref.unsubscribed; })) {
            return;
        }
        var _a = this, keptDuration_ = _a.keptDuration_, sentinel_ = _a.sentinel_;
        var link = graphRef.link, sink = graphRef.sink;
        var flush = function () {
            var merges = link.merges, sources = link.sources;
            var mergeIndex = merges.indexOf(ref);
            if (mergeIndex !== -1) {
                merges.splice(mergeIndex, 1);
                ++link.mergesFlushed;
            }
            var sourceIndex = sources.indexOf(ref);
            if (sourceIndex !== -1) {
                sources.splice(sourceIndex, 1);
                ++link.sourcesFlushed;
            }
            if (sink && sink.unsubscribed) {
                _this.flush_(sink);
            }
        };
        if (keptDuration_ === 0) {
            flush();
        }
        else if ((keptDuration_ > 0) && (keptDuration_ < Infinity)) {
            setTimeout(flush, keptDuration_);
        }
    };
    return GraphPlugin;
}(plugin_1.BasePlugin));
exports.GraphPlugin = GraphPlugin;

},{"./plugin":16}],12:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./debug-plugin"));
__export(require("./graph-plugin"));
__export(require("./let-plugin"));
__export(require("./log-plugin"));
__export(require("./pause-plugin"));
__export(require("./plugin"));
__export(require("./snapshot-plugin"));
__export(require("./stack-trace-plugin"));
__export(require("./stats-plugin"));

},{"./debug-plugin":10,"./graph-plugin":11,"./let-plugin":13,"./log-plugin":14,"./pause-plugin":15,"./plugin":16,"./snapshot-plugin":17,"./stack-trace-plugin":18,"./stats-plugin":19}],13:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var match_1 = require("../match");
var plugin_1 = require("./plugin");
var LetPlugin = (function (_super) {
    __extends(LetPlugin, _super);
    function LetPlugin(match, select) {
        var _this = _super.call(this) || this;
        _this.match_ = match;
        _this.select_ = select;
        return _this;
    }
    LetPlugin.prototype.select = function (ref) {
        var _a = this, match_ = _a.match_, select_ = _a.select_;
        var observable = ref.observable;
        if (match_1.matches(observable, match_)) {
            return select_;
        }
        return null;
    };
    return LetPlugin;
}(plugin_1.BasePlugin));
exports.LetPlugin = LetPlugin;

},{"../match":7,"./plugin":16}],14:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var graph_plugin_1 = require("./graph-plugin");
var logger_1 = require("../logger");
var match_1 = require("../match");
var plugin_1 = require("./plugin");
var snapshot_plugin_1 = require("./snapshot-plugin");
var stack_trace_plugin_1 = require("./stack-trace-plugin");
var LogPlugin = (function (_super) {
    __extends(LogPlugin, _super);
    function LogPlugin(match, partialLogger) {
        if (partialLogger === void 0) { partialLogger = logger_1.defaultLogger; }
        var _this = _super.call(this) || this;
        _this.logger_ = logger_1.toLogger(partialLogger);
        _this.match_ = match;
        return _this;
    }
    LogPlugin.prototype.beforeComplete = function (ref) {
        this.log_(ref, "complete");
    };
    LogPlugin.prototype.beforeError = function (ref, error) {
        this.log_(ref, "error", error);
    };
    LogPlugin.prototype.beforeNext = function (ref, value) {
        this.log_(ref, "next", value);
    };
    LogPlugin.prototype.beforeSubscribe = function (ref) {
        this.log_(ref, "subscribe");
    };
    LogPlugin.prototype.beforeUnsubscribe = function (ref) {
        this.log_(ref, "unsubscribe");
    };
    LogPlugin.prototype.log_ = function (ref, notification, param) {
        var _a = this, logger_ = _a.logger_, match_ = _a.match_;
        var observable = ref.observable, subscriber = ref.subscriber;
        if (match_1.matches(observable, match_)) {
            var tag = match_1.read(observable);
            var matching = (typeof match_ === "string") ? "" : "; matching " + match_1.toString(match_);
            switch (notification) {
                case "error":
                    logger_.group("Tag = " + tag + "; notification = " + notification + matching);
                    logger_.error("Error =", param);
                    break;
                case "next":
                    logger_.group("Tag = " + tag + "; notification = " + notification + matching);
                    logger_.log("Value =", param);
                    break;
                default:
                    logger_.groupCollapsed("Tag = " + tag + "; notification = " + notification + matching);
                    break;
            }
            var graphRef = graph_plugin_1.getGraphRef(ref);
            var snapshotRef = snapshot_plugin_1.getSnapshotRef(ref);
            if (graphRef || snapshotRef) {
                logger_.groupCollapsed("Subscriber");
                if (snapshotRef) {
                    var values = snapshotRef.values, valuesFlushed = snapshotRef.valuesFlushed;
                    logger_.log("Value count =", values.length + valuesFlushed);
                    if (values.length > 0) {
                        logger_.log("Last value =", values[values.length - 1].value);
                    }
                }
                if (graphRef) {
                    logger_.groupCollapsed("Subscription");
                    var rootSink = graphRef.rootSink;
                    logger_.log("Root subscribe", rootSink ? stack_trace_plugin_1.getStackTrace(rootSink) : stack_trace_plugin_1.getStackTrace(ref));
                    logger_.groupEnd();
                }
                logger_.groupEnd();
            }
            logger_.groupEnd();
        }
    };
    return LogPlugin;
}(plugin_1.BasePlugin));
exports.LogPlugin = LogPlugin;

},{"../logger":6,"../match":7,"./graph-plugin":11,"./plugin":16,"./snapshot-plugin":17,"./stack-trace-plugin":18}],15:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Subject_1 = (window.Rx);
var logger_1 = require("../logger");
var match_1 = require("../match");
var plugin_1 = require("./plugin");
var spy_1 = require("../spy");
(window.Rx.unused);
(window.Rx.unused);
var Deck = (function () {
    function Deck(match) {
        this.paused_ = true;
        this.states_ = new Map();
        this.match_ = match;
    }
    Object.defineProperty(Deck.prototype, "paused", {
        get: function () {
            return this.paused_;
        },
        enumerable: true,
        configurable: true
    });
    Deck.prototype.clear = function (predicate) {
        if (predicate === void 0) { predicate = function () { return true; }; }
        this.states_.forEach(function (state) {
            state.notifications_ = state.notifications_.filter(function (notification) { return !predicate(notification); });
        });
    };
    Deck.prototype.log = function (partialLogger) {
        if (partialLogger === void 0) { partialLogger = logger_1.defaultLogger; }
        var logger = logger_1.toLogger(partialLogger);
        logger.group("Deck matching " + match_1.toString(this.match_));
        logger.log("Paused =", this.paused_);
        this.states_.forEach(function (state) {
            logger.group("Observable; tag = " + state.tag_);
            logger.log("Notifications =", state.notifications_);
            logger.groupEnd();
        });
        logger.groupEnd();
    };
    Deck.prototype.pause = function () {
        this.paused_ = true;
    };
    Deck.prototype.resume = function () {
        this.states_.forEach(function (state) {
            while (state.notifications_.length > 0) {
                state.subject_.next(state.notifications_.shift());
            }
        });
        this.paused_ = false;
    };
    Deck.prototype.select = function (ref) {
        var _this = this;
        var observable = ref.observable;
        return function (source) {
            var state = _this.states_.get(observable);
            if (state) {
                state.subscription_.unsubscribe();
            }
            else {
                state = {
                    notifications_: [],
                    subject_: new Subject_1.Subject(),
                    subscription_: null,
                    tag_: match_1.read(observable)
                };
                _this.states_.set(observable, state);
            }
            state.subscription_ = spy_1.subscribeWithoutSpy.call(source.materialize(), {
                next: function (notification) {
                    if (_this.paused_) {
                        state.notifications_.push(notification);
                    }
                    else {
                        state.subject_.next(notification);
                    }
                }
            });
            return state.subject_.asObservable().dematerialize();
        };
    };
    Deck.prototype.skip = function () {
        this.states_.forEach(function (state) {
            if (state.notifications_.length > 0) {
                state.notifications_.shift();
            }
        });
    };
    Deck.prototype.step = function () {
        this.states_.forEach(function (state) {
            if (state.notifications_.length > 0) {
                state.subject_.next(state.notifications_.shift());
            }
        });
    };
    Deck.prototype.unsubscribe = function () {
        this.states_.forEach(function (state) {
            if (state.subscription_) {
                state.subscription_.unsubscribe();
                state.subscription_ = null;
            }
        });
    };
    return Deck;
}());
exports.Deck = Deck;
var PausePlugin = (function (_super) {
    __extends(PausePlugin, _super);
    function PausePlugin(match) {
        var _this = _super.call(this) || this;
        _this.deck_ = new Deck(match);
        _this.match_ = match;
        return _this;
    }
    Object.defineProperty(PausePlugin.prototype, "deck", {
        get: function () {
            var deck_ = this.deck_;
            return deck_;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PausePlugin.prototype, "match", {
        get: function () {
            var match_ = this.match_;
            return match_;
        },
        enumerable: true,
        configurable: true
    });
    PausePlugin.prototype.select = function (ref) {
        var _a = this, deck_ = _a.deck_, match_ = _a.match_;
        var observable = ref.observable;
        if (match_1.matches(observable, match_)) {
            return deck_.select(ref);
        }
        return null;
    };
    PausePlugin.prototype.teardown = function () {
        var deck_ = this.deck_;
        if (deck_) {
            deck_.resume();
            deck_.unsubscribe();
        }
    };
    return PausePlugin;
}(plugin_1.BasePlugin));
exports.PausePlugin = PausePlugin;

},{"../logger":6,"../match":7,"../spy":20,"./plugin":16}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BasePlugin = (function () {
    function BasePlugin() {
    }
    BasePlugin.prototype.afterComplete = function (ref) { };
    BasePlugin.prototype.afterError = function (ref, error) { };
    BasePlugin.prototype.afterNext = function (ref, value) { };
    BasePlugin.prototype.afterSubscribe = function (ref) { };
    BasePlugin.prototype.afterUnsubscribe = function (ref) { };
    BasePlugin.prototype.beforeComplete = function (ref) { };
    BasePlugin.prototype.beforeError = function (ref, error) { };
    BasePlugin.prototype.beforeNext = function (ref, value) { };
    BasePlugin.prototype.beforeSubscribe = function (ref) { };
    BasePlugin.prototype.beforeUnsubscribe = function (ref) { };
    BasePlugin.prototype.flush = function () { };
    BasePlugin.prototype.select = function (ref) { return null; };
    BasePlugin.prototype.teardown = function () { };
    return BasePlugin;
}());
exports.BasePlugin = BasePlugin;

},{}],17:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var match_1 = require("../match");
var graph_plugin_1 = require("./graph-plugin");
var plugin_1 = require("./plugin");
var stack_trace_plugin_1 = require("./stack-trace-plugin");
var tick_1 = require("../tick");
var snapshotRefSymbol = Symbol("snapshotRef");
function getSnapshotRef(ref) {
    return ref[snapshotRefSymbol];
}
exports.getSnapshotRef = getSnapshotRef;
function setSnapshotRef(ref, value) {
    ref[snapshotRefSymbol] = value;
    return value;
}
var SnapshotPlugin = (function (_super) {
    __extends(SnapshotPlugin, _super);
    function SnapshotPlugin(_a) {
        var _b = (_a === void 0 ? {} : _a).keptValues, keptValues = _b === void 0 ? 4 : _b;
        var _this = _super.call(this) || this;
        _this.keptValues_ = keptValues;
        _this.sentinel_ = null;
        return _this;
    }
    SnapshotPlugin.prototype.afterUnsubscribe = function (ref) {
        var snapshotRef = getSnapshotRef(ref);
        snapshotRef.tick = tick_1.tick();
        snapshotRef.unsubscribed = true;
    };
    SnapshotPlugin.prototype.beforeComplete = function (ref) {
        var snapshotRef = getSnapshotRef(ref);
        snapshotRef.tick = tick_1.tick();
        snapshotRef.complete = true;
    };
    SnapshotPlugin.prototype.beforeError = function (ref, error) {
        var snapshotRef = getSnapshotRef(ref);
        snapshotRef.tick = tick_1.tick();
        snapshotRef.error = error;
    };
    SnapshotPlugin.prototype.beforeNext = function (ref, value) {
        var t = tick_1.tick();
        var snapshotRef = getSnapshotRef(ref);
        snapshotRef.tick = t;
        snapshotRef.values.push({ tick: t, timestamp: Date.now(), value: value });
        var keptValues_ = this.keptValues_;
        var count = snapshotRef.values.length - keptValues_;
        if (count > 0) {
            snapshotRef.values.splice(0, count);
            snapshotRef.valuesFlushed += count;
        }
    };
    SnapshotPlugin.prototype.beforeSubscribe = function (ref) {
        var snapshotRef = setSnapshotRef(ref, {
            complete: false,
            error: null,
            tick: tick_1.tick(),
            timestamp: Date.now(),
            unsubscribed: false,
            values: [],
            valuesFlushed: 0
        });
        var graphRef = graph_plugin_1.getGraphRef(ref);
        if (graphRef) {
            this.sentinel_ = graphRef.sentinel;
        }
        else {
            console.warn("Graphing is not enabled.");
        }
    };
    SnapshotPlugin.prototype.snapshotAll = function (_a) {
        var since = (_a === void 0 ? {} : _a).since;
        var observables = new Map();
        var subscribers = new Map();
        var subscriptions = new Map();
        var subscriptionRefs = this.getSubscriptionRefs_();
        subscriptionRefs.forEach(function (unused, ref) {
            var id = ref.id, observable = ref.observable, subscriber = ref.subscriber, subscription = ref.subscription;
            var graphRef = graph_plugin_1.getGraphRef(ref);
            var mergesFlushed = graphRef.mergesFlushed, sourcesFlushed = graphRef.sourcesFlushed;
            var snapshotRef = getSnapshotRef(ref);
            var complete = snapshotRef.complete, error = snapshotRef.error, tick = snapshotRef.tick, timestamp = snapshotRef.timestamp, unsubscribed = snapshotRef.unsubscribed, values = snapshotRef.values, valuesFlushed = snapshotRef.valuesFlushed;
            var subscriptionSnapshot = {
                complete: complete,
                error: error,
                id: id,
                merges: new Map(),
                mergesFlushed: mergesFlushed,
                observable: observable,
                rootSink: null,
                sink: null,
                sources: new Map(),
                sourcesFlushed: sourcesFlushed,
                stackTrace: stack_trace_plugin_1.getStackTrace(ref),
                subscriber: subscriber,
                subscription: subscription,
                tick: tick,
                timestamp: timestamp,
                unsubscribed: unsubscribed
            };
            subscriptions.set(subscription, subscriptionSnapshot);
            var subscriberSnapshot = subscribers.get(subscriber);
            if (!subscriberSnapshot) {
                subscriberSnapshot = {
                    subscriber: subscriber,
                    subscriptions: new Map(),
                    tick: tick,
                    values: [],
                    valuesFlushed: 0
                };
                subscribers.set(subscriber, subscriberSnapshot);
            }
            subscriberSnapshot.subscriptions.set(subscription, subscriptionSnapshot);
            subscriberSnapshot.tick = Math.max(subscriberSnapshot.tick, tick);
            (_a = subscriberSnapshot.values).push.apply(_a, values);
            subscriberSnapshot.valuesFlushed += valuesFlushed;
            var observableSnapshot = observables.get(observable);
            if (!observableSnapshot) {
                observableSnapshot = {
                    observable: observable,
                    subscribers: new Map(),
                    tag: match_1.read(observable),
                    tick: tick
                };
                observables.set(observable, observableSnapshot);
            }
            observableSnapshot.subscribers.set(subscriber, subscriberSnapshot);
            observableSnapshot.tick = Math.max(observableSnapshot.tick, tick);
            var _a;
        });
        subscriptionRefs.forEach(function (unused, ref) {
            var graphRef = graph_plugin_1.getGraphRef(ref);
            var subscriptionSnapshot = subscriptions.get(ref.subscription);
            if (graphRef.sink) {
                subscriptionSnapshot.sink = subscriptions.get(graphRef.sink.subscription);
            }
            if (graphRef.rootSink) {
                subscriptionSnapshot.rootSink = subscriptions.get(graphRef.rootSink.subscription);
            }
            graphRef.merges.forEach(function (m) { return subscriptionSnapshot.merges.set(m.subscription, subscriptions.get(m.subscription)); });
            graphRef.sources.forEach(function (s) { return subscriptionSnapshot.sources.set(s.subscription, subscriptions.get(s.subscription)); });
        });
        subscribers.forEach(function (subscriberSnapshot) {
            subscriberSnapshot.values.sort(function (a, b) { return a.tick - b.tick; });
        });
        if (since !== undefined) {
            observables.forEach(function (value, key) {
                if (value.tick <= since.tick) {
                    observables.delete(key);
                }
            });
            subscribers.forEach(function (value, key) {
                if (value.tick <= since.tick) {
                    subscribers.delete(key);
                }
            });
            subscriptions.forEach(function (value, key) {
                if (value.tick <= since.tick) {
                    subscriptions.delete(key);
                }
            });
        }
        return {
            observables: observables,
            subscribers: subscribers,
            subscriptions: subscriptions,
            tick: tick_1.tick()
        };
    };
    SnapshotPlugin.prototype.snapshotObservable = function (ref) {
        var snapshot = this.snapshotAll();
        return snapshot.observables.get(ref.observable) || null;
    };
    SnapshotPlugin.prototype.snapshotSubscriber = function (ref) {
        var snapshot = this.snapshotAll();
        return snapshot.subscribers.get(ref.subscriber) || null;
    };
    SnapshotPlugin.prototype.addSubscriptionRefs_ = function (ref, map) {
        var _this = this;
        map.set(ref, true);
        var graphRef = graph_plugin_1.getGraphRef(ref);
        graphRef.merges.forEach(function (m) { return _this.addSubscriptionRefs_(m, map); });
        graphRef.sources.forEach(function (s) { return _this.addSubscriptionRefs_(s, map); });
    };
    SnapshotPlugin.prototype.getSubscriptionRefs_ = function () {
        var _this = this;
        var sentinel_ = this.sentinel_;
        var map = new Map();
        if (sentinel_) {
            sentinel_.sources.forEach(function (ref) { return _this.addSubscriptionRefs_(ref, map); });
        }
        return map;
    };
    return SnapshotPlugin;
}(plugin_1.BasePlugin));
exports.SnapshotPlugin = SnapshotPlugin;

},{"../match":7,"../tick":21,"./graph-plugin":11,"./plugin":16,"./stack-trace-plugin":18}],18:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var stacktrace_js_1 = require("stacktrace-js");
var plugin_1 = require("./plugin");
var stackTraceRefSymbol = Symbol("stackTraceRef");
function getStackTrace(ref) {
    var stackTraceRef = getStackTraceRef(ref);
    return stackTraceRef ? stackTraceRef.stackTrace : [];
}
exports.getStackTrace = getStackTrace;
function getStackTraceRef(ref) {
    return ref[stackTraceRefSymbol];
}
exports.getStackTraceRef = getStackTraceRef;
function setStackTraceRef(ref, value) {
    ref[stackTraceRefSymbol] = value;
    return value;
}
var StackTracePlugin = (function (_super) {
    __extends(StackTracePlugin, _super);
    function StackTracePlugin(_a) {
        var _b = (_a === void 0 ? {} : _a).sourceMaps, sourceMaps = _b === void 0 ? false : _b;
        var _this = _super.call(this) || this;
        _this.sourceMaps_ = sourceMaps;
        return _this;
    }
    StackTracePlugin.prototype.beforeSubscribe = function (ref) {
        var stackTraceRef = {
            sourceMapsResolved: Promise.resolve(),
            stackTrace: stacktrace_js_1.getSync(options())
        };
        setStackTraceRef(ref, stackTraceRef);
        if (this.sourceMaps_ && (typeof window !== "undefined") && (window.location.protocol !== "file:")) {
            stackTraceRef.sourceMapsResolved = stacktrace_js_1.get(options()).then(function (stackFrames) {
                var stackTrace = stackTraceRef.stackTrace;
                stackTrace.splice.apply(stackTrace, [0, stackTrace.length].concat(stackFrames));
            });
        }
    };
    return StackTracePlugin;
}(plugin_1.BasePlugin));
exports.StackTracePlugin = StackTracePlugin;
function options() {
    var preSubscribeWithSpy = false;
    return {
        filter: function (stackFrame) {
            var result = preSubscribeWithSpy;
            if (/subscribeWithSpy/.test(stackFrame.functionName)) {
                preSubscribeWithSpy = true;
            }
            return result;
        }
    };
}

},{"./plugin":16,"stacktrace-js":34}],19:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var graph_plugin_1 = require("./graph-plugin");
var plugin_1 = require("./plugin");
var tick_1 = require("../tick");
var StatsPlugin = (function (_super) {
    __extends(StatsPlugin, _super);
    function StatsPlugin() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.stats_ = {
            completes: 0,
            errors: 0,
            leafSubscribes: 0,
            maxDepth: 0,
            mergedSubscribes: 0,
            nexts: 0,
            rootSubscribes: 0,
            subscribes: 0,
            tick: 0,
            timespan: 0,
            totalDepth: 0,
            unsubscribes: 0
        };
        _this.time_ = 0;
        return _this;
    }
    StatsPlugin.prototype.afterSubscribe = function (ref) {
        var stats_ = this.stats_;
        var graphRef = graph_plugin_1.getGraphRef(ref);
        if (graphRef) {
            var depth = graphRef.depth, merged = graphRef.merged, merges = graphRef.merges, mergesFlushed = graphRef.mergesFlushed, rootSink = graphRef.rootSink, sources = graphRef.sources, sourcesFlushed = graphRef.sourcesFlushed;
            if (rootSink === null) {
                stats_.rootSubscribes += 1;
            }
            if (merged) {
                stats_.mergedSubscribes += 1;
            }
            if ((merges.length + mergesFlushed + sources.length + sourcesFlushed) === 0) {
                if (stats_.maxDepth < depth) {
                    stats_.maxDepth = depth;
                }
                stats_.leafSubscribes += 1;
                stats_.totalDepth += depth;
            }
        }
    };
    StatsPlugin.prototype.beforeComplete = function (ref) {
        var stats_ = this.stats_;
        ++stats_.completes;
        this.all_();
    };
    StatsPlugin.prototype.beforeError = function (ref, error) {
        var stats_ = this.stats_;
        ++stats_.errors;
        this.all_();
    };
    StatsPlugin.prototype.beforeNext = function (ref, value) {
        var stats_ = this.stats_;
        ++stats_.nexts;
        this.all_();
    };
    StatsPlugin.prototype.beforeSubscribe = function (ref) {
        var stats_ = this.stats_;
        ++stats_.subscribes;
        this.all_();
    };
    StatsPlugin.prototype.beforeUnsubscribe = function (ref) {
        var stats_ = this.stats_;
        ++stats_.unsubscribes;
        this.all_();
    };
    Object.defineProperty(StatsPlugin.prototype, "stats", {
        get: function () {
            var stats_ = this.stats_;
            return __assign({}, stats_);
        },
        enumerable: true,
        configurable: true
    });
    StatsPlugin.prototype.all_ = function () {
        var _a = this, stats_ = _a.stats_, time_ = _a.time_;
        if (time_ === 0) {
            this.time_ = Date.now();
        }
        else {
            stats_.timespan = Date.now() - time_;
        }
        stats_.tick = tick_1.tick();
    };
    return StatsPlugin;
}(plugin_1.BasePlugin));
exports.StatsPlugin = StatsPlugin;

},{"../tick":21,"./graph-plugin":11,"./plugin":16}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BehaviorSubject_1 = (window.Rx);
var Observable_1 = (window.Rx);
var Subject_1 = (window.Rx);
var detect_1 = require("./detect");
var detector_1 = require("./detector");
var identify_1 = require("./identify");
var logger_1 = require("./logger");
var match_1 = require("./match");
var plugin_1 = require("./plugin");
var tick_1 = require("./tick");
var util_1 = require("./util");
(window.Rx.unused);
var subscribeBase = Observable_1.Observable.prototype.subscribe;
var lastSubscriptionRefId = 0;
var plugins_ = [];
var pluginsSubject_ = new BehaviorSubject_1.BehaviorSubject(plugins_);
var undos_ = [];
if (typeof window !== "undefined") {
    var consoleApi = {
        deck: function (call) {
            var pausePlugins = findAll(plugin_1.PausePlugin);
            if (call === undefined) {
                var logger_2 = logger_1.toLogger(logger_1.defaultLogger);
                logger_2.group(pausePlugins.length + " Deck(s)");
                pausePlugins.forEach(function (pausePlugin, index) {
                    logger_2.log(index + 1 + " pause(" + match_1.toString(pausePlugin.match) + ")");
                });
                logger_2.groupEnd();
            }
            else {
                var pausePlugin = pausePlugins[call - 1];
                return pausePlugin ? pausePlugin.deck : null;
            }
        },
        debug: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            debug.apply(null, args);
        },
        detect: function (id) {
            if (id === void 0) { id = ""; }
            detect_1.detect(id);
        },
        flush: function () {
            flush();
        },
        let: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            _let.apply(null, args);
        },
        log: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            log.apply(null, args);
        },
        pause: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return pause.apply(null, args);
        },
        show: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            show.apply(null, args);
        },
        spy: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            spy.apply(null, args);
        },
        stats: function () {
            stats();
        },
        undo: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (args.length === 0) {
                var logger_3 = logger_1.toLogger(logger_1.defaultLogger);
                logger_3.group(undos_.length + " undo(s)");
                undos_.forEach(function (undo, index) {
                    logger_3.log(index + 1 + " " + undo.name);
                });
                logger_3.groupEnd();
            }
            else {
                args
                    .map(function (at) { return undos_[at - 1]; })
                    .forEach(function (undo) { if (undo) {
                    undo.teardown();
                } });
            }
        }
    };
    window["rxSpy"] = consoleApi;
}
function debug(match) {
    var notifications = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        notifications[_i - 1] = arguments[_i];
    }
    if (notifications.length === 0) {
        notifications = ["complete", "error", "next", "subscribe", "unsubscribe"];
    }
    return plugin(new plugin_1.DebugPlugin(match, notifications), "debug(" + match_1.toString(match) + ")");
}
exports.debug = debug;
function find(constructor) {
    var found = plugins_.find(function (plugin) { return plugin instanceof constructor; });
    return found ? found : null;
}
exports.find = find;
function findAll(constructor) {
    return plugins_.filter(function (plugin) { return plugin instanceof constructor; });
}
exports.findAll = findAll;
function flush() {
    plugins_.forEach(function (plugin) { return plugin.flush(); });
}
exports.flush = flush;
function _let(match, select) {
    return plugin(new plugin_1.LetPlugin(match, select), "let(" + match_1.toString(match) + ")");
}
exports._let = _let;
function log(match, partialLogger) {
    var anyTagged = /.+/;
    if (!match) {
        match = anyTagged;
    }
    else if (typeof match.log === "function") {
        partialLogger = match;
        match = anyTagged;
    }
    return plugin(new plugin_1.LogPlugin(match, partialLogger), "log(" + match_1.toString(match) + ")");
}
exports.log = log;
function pause(match) {
    var pausePlugin = new plugin_1.PausePlugin(match);
    var teardown = plugin(pausePlugin, "pause(" + match_1.toString(match) + ")");
    var deck = pausePlugin.deck;
    deck.teardown = teardown;
    return deck;
}
exports.pause = pause;
function plugin(plugin, name) {
    plugins_.push(plugin);
    pluginsSubject_.next(plugins_);
    var teardown = function () {
        plugin.teardown();
        plugins_ = plugins_.filter(function (p) { return p !== plugin; });
        pluginsSubject_.next(plugins_);
        undos_ = undos_.filter(function (u) { return u.teardown !== teardown; });
    };
    undos_.push({ name: name, teardown: teardown });
    return teardown;
}
exports.plugin = plugin;
function plugins() {
    return plugins_.slice();
}
exports.plugins = plugins;
function show(match, partialLogger) {
    if (partialLogger === void 0) { partialLogger = logger_1.defaultLogger; }
    var anyTagged = /.+/;
    if (!match) {
        match = anyTagged;
    }
    else if (typeof match.log === "function") {
        partialLogger = match;
        match = anyTagged;
    }
    var snapshotPlugin = find(plugin_1.SnapshotPlugin);
    if (!snapshotPlugin) {
        console.warn("Snapshotting is not enabled.");
        return;
    }
    var snapshot = snapshotPlugin.snapshotAll();
    var filtered = Array
        .from(snapshot.observables.values())
        .filter(function (observableSnapshot) { return match_1.matches(observableSnapshot.observable, match); });
    var logger = logger_1.toLogger(partialLogger);
    var snapshotGroupMethod = (filtered.length > 3) ? "groupCollapsed" : "group";
    logger.group(filtered.length + " snapshot(s) matching " + match_1.toString(match));
    filtered.forEach(function (observableSnapshot) {
        var subscribers = observableSnapshot.subscribers;
        logger[snapshotGroupMethod].call(logger, "Tag = " + observableSnapshot.tag);
        var subscriberGroupMethod = (subscribers.size > 3) ? "groupCollapsed" : "group";
        logger.group(subscribers.size + " subscriber(s)");
        subscribers.forEach(function (subscriberSnapshot) {
            var values = subscriberSnapshot.values, valuesFlushed = subscriberSnapshot.valuesFlushed;
            logger[subscriberGroupMethod].call(logger, "Subscriber");
            logger.log("Value count =", values.length + valuesFlushed);
            if (values.length > 0) {
                logger.log("Last value =", values[values.length - 1].value);
            }
            var subscriptions = subscriberSnapshot.subscriptions;
            logger.groupCollapsed(subscriptions.size + " subscription(s)");
            subscriptions.forEach(function (subscriptionSnapshot) {
                var complete = subscriptionSnapshot.complete, error = subscriptionSnapshot.error, rootSink = subscriptionSnapshot.rootSink, stackTrace = subscriptionSnapshot.stackTrace, unsubscribed = subscriptionSnapshot.unsubscribed;
                logger.log("State =", complete ? "complete" : error ? "error" : "incomplete");
                if (error) {
                    logger.error("Error =", error);
                }
                if (unsubscribed) {
                    logger.error("Unsubscribed =", true);
                }
                logger.log("Root subscribe", rootSink ? rootSink.stackTrace : stackTrace);
            });
            logger.groupEnd();
            logger.groupEnd();
        });
        logger.groupEnd();
        logger.groupEnd();
    });
    logger.groupEnd();
}
exports.show = show;
function spy(options) {
    if (options === void 0) { options = {}; }
    var plugins = options.plugins, warning = options.warning;
    if (Observable_1.Observable.prototype.subscribe !== subscribeBase) {
        throw new Error("Already spying on Observable.prototype.subscribe.");
    }
    if (warning) {
        console.warn("Spying on Observable.prototype.subscribe.");
    }
    Observable_1.Observable.prototype.subscribe = subscribeWithSpy;
    if (plugins) {
        plugins_ = plugins;
    }
    else {
        plugins_ = [
            new plugin_1.StackTracePlugin(options),
            new plugin_1.GraphPlugin(options),
            new plugin_1.SnapshotPlugin(options),
            new plugin_1.StatsPlugin()
        ];
    }
    pluginsSubject_.next(plugins_);
    var detector = new detector_1.Detector(find(plugin_1.SnapshotPlugin));
    detect_1.hook(function (id) { return detectWithLog(id, detector); });
    var teardown = function () {
        detect_1.hook(null);
        plugins_.forEach(function (plugin) { return plugin.teardown(); });
        plugins_ = [];
        pluginsSubject_.next(plugins_);
        pluginsSubject_ = new BehaviorSubject_1.BehaviorSubject(plugins_);
        undos_ = [];
        Observable_1.Observable.prototype.subscribe = subscribeBase;
    };
    undos_.push({ name: "spy", teardown: teardown });
    return teardown;
}
exports.spy = spy;
function stats(partialLogger) {
    var statsPlugin = find(plugin_1.StatsPlugin);
    if (!statsPlugin) {
        console.warn("Stats are not enabled.");
        return;
    }
    var stats = statsPlugin.stats;
    var leafSubscribes = stats.leafSubscribes, maxDepth = stats.maxDepth, mergedSubscribes = stats.mergedSubscribes, rootSubscribes = stats.rootSubscribes, totalDepth = stats.totalDepth;
    var logger = logger_1.toLogger(partialLogger || logger_1.defaultLogger);
    logger.group("Stats");
    logger.log("subscribes =", stats.subscribes);
    if (rootSubscribes > 0) {
        logger.log("root subscribes =", rootSubscribes);
    }
    if (leafSubscribes > 0) {
        logger.log("leaf subscribes =", leafSubscribes);
    }
    if (mergedSubscribes > 0) {
        logger.log("merged subscribes =", mergedSubscribes);
    }
    logger.log("unsubscribes =", stats.unsubscribes);
    logger.log("nexts =", stats.nexts);
    logger.log("errors =", stats.errors);
    logger.log("completes =", stats.completes);
    if (maxDepth > 0) {
        logger.log("max. depth =", maxDepth);
        logger.log("avg. depth =", (totalDepth / leafSubscribes).toFixed(1));
    }
    logger.log("tick =", stats.tick);
    logger.log("timespan =", stats.timespan);
    logger.groupEnd();
}
exports.stats = stats;
function subscribeWithoutSpy() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var subscribePrevious = Observable_1.Observable.prototype.subscribe;
    Observable_1.Observable.prototype.subscribe = subscribeBase;
    try {
        return Observable_1.Observable.prototype.subscribe.apply(this, args);
    }
    finally {
        Observable_1.Observable.prototype.subscribe = subscribePrevious;
    }
}
exports.subscribeWithoutSpy = subscribeWithoutSpy;
function detectWithLog(id, detector) {
    var detected = detector.detect(id);
    var logger = logger_1.toLogger(logger_1.defaultLogger);
    if (detected) {
        logger.group("Subscription changes detected; id = '" + id + "'");
        detected.subscriptions.forEach(function (s) {
            logSubscription(logger, "Subscription", s);
        });
        detected.unsubscriptions.forEach(function (s) {
            logSubscription(logger, "Unsubscription", s);
        });
        detected.mergeSubscriptions.forEach(function (s) {
            logSubscription(logger, "Merge subscription", s);
        });
        detected.mergeUnsubscriptions.forEach(function (s) {
            logSubscription(logger, "Merge unsubscription", s);
        });
        logger.groupEnd();
    }
    function logSubscription(logger, name, subscription) {
        logger.group(name);
        logger.log("Root subscribe", subscription.rootSink ?
            subscription.rootSink.stackTrace :
            subscription.stackTrace);
        logger.log("Subscribe", subscription.stackTrace);
        logger.groupEnd();
    }
}
function subscribeWithSpy() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var observable = this;
    var subscriber = util_1.toSubscriber.apply(null, args);
    identify_1.identify(observable);
    identify_1.identify(subscriber);
    var ref = {
        id: ++lastSubscriptionRefId,
        observable: observable,
        subscriber: subscriber,
        subscription: null,
        timestamp: Date.now(),
        unsubscribed: false
    };
    var postLetObserver = {
        complete: function () {
            tick_1.increment();
            plugins_.forEach(function (plugin) { return plugin.beforeComplete(ref); });
            subscriber.complete();
            plugins_.forEach(function (plugin) { return plugin.afterComplete(ref); });
        },
        error: function (error) {
            if (!(error instanceof Error)) {
                console.warn("Value passed as error notification is not an Error instance =", error);
            }
            tick_1.increment();
            plugins_.forEach(function (plugin) { return plugin.beforeError(ref, error); });
            subscriber.error(error);
            plugins_.forEach(function (plugin) { return plugin.afterError(ref, error); });
        },
        next: function (value) {
            tick_1.increment();
            plugins_.forEach(function (plugin) { return plugin.beforeNext(ref, value); });
            subscriber.next(value);
            plugins_.forEach(function (plugin) { return plugin.afterNext(ref, value); });
        },
        unsubscribed: false
    };
    var postLetSubscriber = util_1.toSubscriber(postLetObserver.next.bind(postLetObserver), postLetObserver.error.bind(postLetObserver), postLetObserver.complete.bind(postLetObserver));
    var preLetObserver = {
        complete: function () {
            this.completed = true;
            if (this.preLetSubject) {
                this.preLetSubject.complete();
            }
            else {
                this.postLetSubscriber.complete();
            }
        },
        completed: false,
        error: function (error) {
            this.errored = true;
            if (this.preLetSubject) {
                this.preLetSubject.error(error);
            }
            else {
                this.postLetSubscriber.error(error);
            }
        },
        errored: false,
        let: function (plugins) {
            var _this = this;
            var selectors = plugins.map(function (plugin) { return plugin.select(ref); }).filter(Boolean);
            if (selectors.length > 0) {
                if (!this.preLetSubject) {
                    this.preLetSubject = new Subject_1.Subject();
                }
                if (this.postLetSubscription) {
                    this.postLetSubscription.unsubscribe();
                }
                var source_1 = this.preLetSubject.asObservable();
                selectors.forEach(function (selector) { return source_1 = source_1.let(selector); });
                this.postLetSubscription = subscribeWithoutSpy.call(source_1, {
                    complete: function () { return _this.postLetSubscriber.complete(); },
                    error: function (error) { return _this.postLetSubscriber.error(error); },
                    next: function (value) { return _this.postLetSubscriber.next(value); }
                });
            }
            else if (this.postLetSubscription) {
                this.postLetSubscription.unsubscribe();
                this.postLetSubscription = null;
                this.preLetSubject = null;
            }
        },
        next: function (value) {
            if (this.preLetSubject) {
                this.preLetSubject.next(value);
            }
            else {
                this.postLetSubscriber.next(value);
            }
        },
        postLetSubscriber: postLetSubscriber,
        postLetSubscription: null,
        preLetSubject: null,
        unsubscribed: false
    };
    var preLetSubscriber = util_1.toSubscriber(preLetObserver.next.bind(preLetObserver), preLetObserver.error.bind(preLetObserver), preLetObserver.complete.bind(preLetObserver));
    var pluginsSubscription = subscribeWithoutSpy.call(pluginsSubject_, {
        next: function (plugins) { return preLetObserver.let(plugins); }
    });
    var preLetUnsubscribe = preLetSubscriber.unsubscribe;
    preLetSubscriber.unsubscribe = function () {
        if (!preLetObserver.unsubscribed) {
            preLetObserver.unsubscribed = true;
            if (!preLetObserver.completed && !preLetObserver.errored) {
                if (preLetObserver.postLetSubscription) {
                    preLetObserver.postLetSubscription.unsubscribe();
                    preLetObserver.postLetSubscription = null;
                }
                preLetObserver.postLetSubscriber.unsubscribe();
            }
        }
        preLetUnsubscribe.call(preLetSubscriber);
    };
    subscriber.add(preLetSubscriber);
    var postLetUnsubscribe = postLetSubscriber.unsubscribe;
    postLetSubscriber.unsubscribe = function () {
        if (!postLetObserver.unsubscribed) {
            postLetObserver.unsubscribed = true;
            tick_1.increment();
            plugins_.forEach(function (plugin) { return plugin.beforeUnsubscribe(ref); });
            postLetUnsubscribe.call(postLetSubscriber);
            pluginsSubscription.unsubscribe();
            ref.unsubscribed = true;
            plugins_.forEach(function (plugin) { return plugin.afterUnsubscribe(ref); });
        }
        else {
            postLetUnsubscribe.call(postLetSubscriber);
        }
    };
    tick_1.increment();
    plugins_.forEach(function (plugin) { return plugin.beforeSubscribe(ref); });
    var subscription = subscribeBase.call(observable, preLetSubscriber);
    ref.subscription = subscription;
    plugins_.forEach(function (plugin) { return plugin.afterSubscribe(ref); });
    return subscription;
}

},{"./detect":2,"./detector":3,"./identify":4,"./logger":6,"./match":7,"./plugin":12,"./tick":21,"./util":22}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tick_ = 0;
function increment() {
    ++tick_;
}
exports.increment = increment;
function tick() {
    return tick_;
}
exports.tick = tick;

},{}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Subscriber_1 = (window.Rx);
var rxSubscriber_1 = (window.Rx.Symbol);
function isObservable(arg) {
    return arg && arg.subscribe;
}
exports.isObservable = isObservable;
var empty = {
    closed: true,
    error: function (error) { throw error; },
    next: function (value) { },
    complete: function () { }
};
function toSubscriber(nextOrObserver, error, complete) {
    if (nextOrObserver) {
        if (nextOrObserver instanceof Subscriber_1.Subscriber) {
            return nextOrObserver;
        }
        if (nextOrObserver[rxSubscriber_1.rxSubscriber]) {
            return nextOrObserver[rxSubscriber_1.rxSubscriber]();
        }
    }
    if (!nextOrObserver && !error && !complete) {
        return new Subscriber_1.Subscriber(empty);
    }
    return new Subscriber_1.Subscriber(nextOrObserver, error, complete);
}
exports.toSubscriber = toSubscriber;

},{}],23:[function(require,module,exports){
(function(root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define('error-stack-parser', ['stackframe'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('stackframe'));
    } else {
        root.ErrorStackParser = factory(root.StackFrame);
    }
}(this, function ErrorStackParser(StackFrame) {
    'use strict';

    var FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+\:\d+/;
    var CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+\:\d+|\(native\))/m;
    var SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code\])?$/;

    return {
        /**
         * Given an Error object, extract the most information from it.
         *
         * @param {Error} error object
         * @return {Array} of StackFrames
         */
        parse: function ErrorStackParser$$parse(error) {
            if (typeof error.stacktrace !== 'undefined' || typeof error['opera#sourceloc'] !== 'undefined') {
                return this.parseOpera(error);
            } else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
                return this.parseV8OrIE(error);
            } else if (error.stack) {
                return this.parseFFOrSafari(error);
            } else {
                throw new Error('Cannot parse given Error object');
            }
        },

        // Separate line and column numbers from a string of the form: (URI:Line:Column)
        extractLocation: function ErrorStackParser$$extractLocation(urlLike) {
            // Fail-fast but return locations like "(native)"
            if (urlLike.indexOf(':') === -1) {
                return [urlLike];
            }

            var regExp = /(.+?)(?:\:(\d+))?(?:\:(\d+))?$/;
            var parts = regExp.exec(urlLike.replace(/[\(\)]/g, ''));
            return [parts[1], parts[2] || undefined, parts[3] || undefined];
        },

        parseV8OrIE: function ErrorStackParser$$parseV8OrIE(error) {
            var filtered = error.stack.split('\n').filter(function(line) {
                return !!line.match(CHROME_IE_STACK_REGEXP);
            }, this);

            return filtered.map(function(line) {
                if (line.indexOf('(eval ') > -1) {
                    // Throw away eval information until we implement stacktrace.js/stackframe#8
                    line = line.replace(/eval code/g, 'eval').replace(/(\(eval at [^\()]*)|(\)\,.*$)/g, '');
                }
                var tokens = line.replace(/^\s+/, '').replace(/\(eval code/g, '(').split(/\s+/).slice(1);
                var locationParts = this.extractLocation(tokens.pop());
                var functionName = tokens.join(' ') || undefined;
                var fileName = ['eval', '<anonymous>'].indexOf(locationParts[0]) > -1 ? undefined : locationParts[0];

                return new StackFrame({
                    functionName: functionName,
                    fileName: fileName,
                    lineNumber: locationParts[1],
                    columnNumber: locationParts[2],
                    source: line
                });
            }, this);
        },

        parseFFOrSafari: function ErrorStackParser$$parseFFOrSafari(error) {
            var filtered = error.stack.split('\n').filter(function(line) {
                return !line.match(SAFARI_NATIVE_CODE_REGEXP);
            }, this);

            return filtered.map(function(line) {
                // Throw away eval information until we implement stacktrace.js/stackframe#8
                if (line.indexOf(' > eval') > -1) {
                    line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval\:\d+\:\d+/g, ':$1');
                }

                if (line.indexOf('@') === -1 && line.indexOf(':') === -1) {
                    // Safari eval frames only have function names and nothing else
                    return new StackFrame({
                        functionName: line
                    });
                } else {
                    var tokens = line.split('@');
                    var locationParts = this.extractLocation(tokens.pop());
                    var functionName = tokens.join('@') || undefined;

                    return new StackFrame({
                        functionName: functionName,
                        fileName: locationParts[0],
                        lineNumber: locationParts[1],
                        columnNumber: locationParts[2],
                        source: line
                    });
                }
            }, this);
        },

        parseOpera: function ErrorStackParser$$parseOpera(e) {
            if (!e.stacktrace || (e.message.indexOf('\n') > -1 &&
                e.message.split('\n').length > e.stacktrace.split('\n').length)) {
                return this.parseOpera9(e);
            } else if (!e.stack) {
                return this.parseOpera10(e);
            } else {
                return this.parseOpera11(e);
            }
        },

        parseOpera9: function ErrorStackParser$$parseOpera9(e) {
            var lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
            var lines = e.message.split('\n');
            var result = [];

            for (var i = 2, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(new StackFrame({
                        fileName: match[2],
                        lineNumber: match[1],
                        source: lines[i]
                    }));
                }
            }

            return result;
        },

        parseOpera10: function ErrorStackParser$$parseOpera10(e) {
            var lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
            var lines = e.stacktrace.split('\n');
            var result = [];

            for (var i = 0, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(
                        new StackFrame({
                            functionName: match[3] || undefined,
                            fileName: match[2],
                            lineNumber: match[1],
                            source: lines[i]
                        })
                    );
                }
            }

            return result;
        },

        // Opera 10.65+ Error.stack very similar to FF/Safari
        parseOpera11: function ErrorStackParser$$parseOpera11(error) {
            var filtered = error.stack.split('\n').filter(function(line) {
                return !!line.match(FIREFOX_SAFARI_STACK_REGEXP) && !line.match(/^Error created at/);
            }, this);

            return filtered.map(function(line) {
                var tokens = line.split('@');
                var locationParts = this.extractLocation(tokens.pop());
                var functionCall = (tokens.shift() || '');
                var functionName = functionCall
                        .replace(/<anonymous function(: (\w+))?>/, '$2')
                        .replace(/\([^\)]*\)/g, '') || undefined;
                var argsRaw;
                if (functionCall.match(/\(([^\)]*)\)/)) {
                    argsRaw = functionCall.replace(/^[^\(]+\(([^\)]*)\)$/, '$1');
                }
                var args = (argsRaw === undefined || argsRaw === '[arguments not available]') ?
                    undefined : argsRaw.split(',');

                return new StackFrame({
                    functionName: functionName,
                    args: args,
                    fileName: locationParts[0],
                    lineNumber: locationParts[1],
                    columnNumber: locationParts[2],
                    source: line
                });
            }, this);
        }
    };
}));

},{"stackframe":25}],24:[function(require,module,exports){
(function(root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define('stack-generator', ['stackframe'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('stackframe'));
    } else {
        root.StackGenerator = factory(root.StackFrame);
    }
}(this, function(StackFrame) {
    return {
        backtrace: function StackGenerator$$backtrace(opts) {
            var stack = [];
            var maxStackSize = 10;

            if (typeof opts === 'object' && typeof opts.maxStackSize === 'number') {
                maxStackSize = opts.maxStackSize;
            }

            var curr = arguments.callee;
            while (curr && stack.length < maxStackSize) {
                // Allow V8 optimizations
                var args = new Array(curr['arguments'].length);
                for (var i = 0; i < args.length; ++i) {
                    args[i] = curr['arguments'][i];
                }
                if (/function(?:\s+([\w$]+))+\s*\(/.test(curr.toString())) {
                    stack.push(new StackFrame({functionName: RegExp.$1 || undefined, args: args}));
                } else {
                    stack.push(new StackFrame({args: args}));
                }

                try {
                    curr = curr.caller;
                } catch (e) {
                    break;
                }
            }
            return stack;
        }
    };
}));

},{"stackframe":25}],25:[function(require,module,exports){
(function(root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define('stackframe', [], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.StackFrame = factory();
    }
}(this, function() {
    'use strict';
    function _isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function _capitalize(str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
    }

    function _getter(p) {
        return function() {
            return this[p];
        };
    }

    var booleanProps = ['isConstructor', 'isEval', 'isNative', 'isToplevel'];
    var numericProps = ['columnNumber', 'lineNumber'];
    var stringProps = ['fileName', 'functionName', 'source'];
    var arrayProps = ['args'];

    var props = booleanProps.concat(numericProps, stringProps, arrayProps);

    function StackFrame(obj) {
        if (obj instanceof Object) {
            for (var i = 0; i < props.length; i++) {
                if (obj.hasOwnProperty(props[i]) && obj[props[i]] !== undefined) {
                    this['set' + _capitalize(props[i])](obj[props[i]]);
                }
            }
        }
    }

    StackFrame.prototype = {
        getArgs: function() {
            return this.args;
        },
        setArgs: function(v) {
            if (Object.prototype.toString.call(v) !== '[object Array]') {
                throw new TypeError('Args must be an Array');
            }
            this.args = v;
        },

        getEvalOrigin: function() {
            return this.evalOrigin;
        },
        setEvalOrigin: function(v) {
            if (v instanceof StackFrame) {
                this.evalOrigin = v;
            } else if (v instanceof Object) {
                this.evalOrigin = new StackFrame(v);
            } else {
                throw new TypeError('Eval Origin must be an Object or StackFrame');
            }
        },

        toString: function() {
            var functionName = this.getFunctionName() || '{anonymous}';
            var args = '(' + (this.getArgs() || []).join(',') + ')';
            var fileName = this.getFileName() ? ('@' + this.getFileName()) : '';
            var lineNumber = _isNumber(this.getLineNumber()) ? (':' + this.getLineNumber()) : '';
            var columnNumber = _isNumber(this.getColumnNumber()) ? (':' + this.getColumnNumber()) : '';
            return functionName + args + fileName + lineNumber + columnNumber;
        }
    };

    for (var i = 0; i < booleanProps.length; i++) {
        StackFrame.prototype['get' + _capitalize(booleanProps[i])] = _getter(booleanProps[i]);
        StackFrame.prototype['set' + _capitalize(booleanProps[i])] = (function(p) {
            return function(v) {
                this[p] = Boolean(v);
            };
        })(booleanProps[i]);
    }

    for (var j = 0; j < numericProps.length; j++) {
        StackFrame.prototype['get' + _capitalize(numericProps[j])] = _getter(numericProps[j]);
        StackFrame.prototype['set' + _capitalize(numericProps[j])] = (function(p) {
            return function(v) {
                if (!_isNumber(v)) {
                    throw new TypeError(p + ' must be a Number');
                }
                this[p] = Number(v);
            };
        })(numericProps[j]);
    }

    for (var k = 0; k < stringProps.length; k++) {
        StackFrame.prototype['get' + _capitalize(stringProps[k])] = _getter(stringProps[k]);
        StackFrame.prototype['set' + _capitalize(stringProps[k])] = (function(p) {
            return function(v) {
                this[p] = String(v);
            };
        })(stringProps[k]);
    }

    return StackFrame;
}));

},{}],26:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util = require('./util');
var has = Object.prototype.hasOwnProperty;

/**
 * A data structure which is a combination of an array and a set. Adding a new
 * member is O(1), testing for membership is O(1), and finding the index of an
 * element is O(1). Removing elements from the set is not supported. Only
 * strings are supported for membership.
 */
function ArraySet() {
  this._array = [];
  this._set = Object.create(null);
}

/**
 * Static method for creating ArraySet instances from an existing array.
 */
ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
  var set = new ArraySet();
  for (var i = 0, len = aArray.length; i < len; i++) {
    set.add(aArray[i], aAllowDuplicates);
  }
  return set;
};

/**
 * Return how many unique items are in this ArraySet. If duplicates have been
 * added, than those do not count towards the size.
 *
 * @returns Number
 */
ArraySet.prototype.size = function ArraySet_size() {
  return Object.getOwnPropertyNames(this._set).length;
};

/**
 * Add the given string to this set.
 *
 * @param String aStr
 */
ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
  var sStr = util.toSetString(aStr);
  var isDuplicate = has.call(this._set, sStr);
  var idx = this._array.length;
  if (!isDuplicate || aAllowDuplicates) {
    this._array.push(aStr);
  }
  if (!isDuplicate) {
    this._set[sStr] = idx;
  }
};

/**
 * Is the given string a member of this set?
 *
 * @param String aStr
 */
ArraySet.prototype.has = function ArraySet_has(aStr) {
  var sStr = util.toSetString(aStr);
  return has.call(this._set, sStr);
};

/**
 * What is the index of the given string in the array?
 *
 * @param String aStr
 */
ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
  var sStr = util.toSetString(aStr);
  if (has.call(this._set, sStr)) {
    return this._set[sStr];
  }
  throw new Error('"' + aStr + '" is not in the set.');
};

/**
 * What is the element at the given index?
 *
 * @param Number aIdx
 */
ArraySet.prototype.at = function ArraySet_at(aIdx) {
  if (aIdx >= 0 && aIdx < this._array.length) {
    return this._array[aIdx];
  }
  throw new Error('No element indexed by ' + aIdx);
};

/**
 * Returns the array representation of this set (which has the proper indices
 * indicated by indexOf). Note that this is a copy of the internal array used
 * for storing the members so that no one can mess with internal state.
 */
ArraySet.prototype.toArray = function ArraySet_toArray() {
  return this._array.slice();
};

exports.ArraySet = ArraySet;

},{"./util":32}],27:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var base64 = require('./base64');

// A single base 64 digit can contain 6 bits of data. For the base 64 variable
// length quantities we use in the source map spec, the first bit is the sign,
// the next four bits are the actual value, and the 6th bit is the
// continuation bit. The continuation bit tells us whether there are more
// digits in this value following this digit.
//
//   Continuation
//   |    Sign
//   |    |
//   V    V
//   101011

var VLQ_BASE_SHIFT = 5;

// binary: 100000
var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

// binary: 011111
var VLQ_BASE_MASK = VLQ_BASE - 1;

// binary: 100000
var VLQ_CONTINUATION_BIT = VLQ_BASE;

/**
 * Converts from a two-complement value to a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
 *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
 */
function toVLQSigned(aValue) {
  return aValue < 0
    ? ((-aValue) << 1) + 1
    : (aValue << 1) + 0;
}

/**
 * Converts to a two-complement value from a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
 *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
 */
function fromVLQSigned(aValue) {
  var isNegative = (aValue & 1) === 1;
  var shifted = aValue >> 1;
  return isNegative
    ? -shifted
    : shifted;
}

/**
 * Returns the base 64 VLQ encoded value.
 */
exports.encode = function base64VLQ_encode(aValue) {
  var encoded = "";
  var digit;

  var vlq = toVLQSigned(aValue);

  do {
    digit = vlq & VLQ_BASE_MASK;
    vlq >>>= VLQ_BASE_SHIFT;
    if (vlq > 0) {
      // There are still more digits in this value, so we must make sure the
      // continuation bit is marked.
      digit |= VLQ_CONTINUATION_BIT;
    }
    encoded += base64.encode(digit);
  } while (vlq > 0);

  return encoded;
};

/**
 * Decodes the next base 64 VLQ value from the given string and returns the
 * value and the rest of the string via the out parameter.
 */
exports.decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
  var strLen = aStr.length;
  var result = 0;
  var shift = 0;
  var continuation, digit;

  do {
    if (aIndex >= strLen) {
      throw new Error("Expected more digits in base 64 VLQ value.");
    }

    digit = base64.decode(aStr.charCodeAt(aIndex++));
    if (digit === -1) {
      throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
    }

    continuation = !!(digit & VLQ_CONTINUATION_BIT);
    digit &= VLQ_BASE_MASK;
    result = result + (digit << shift);
    shift += VLQ_BASE_SHIFT;
  } while (continuation);

  aOutParam.value = fromVLQSigned(result);
  aOutParam.rest = aIndex;
};

},{"./base64":28}],28:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var intToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

/**
 * Encode an integer in the range of 0 to 63 to a single base 64 digit.
 */
exports.encode = function (number) {
  if (0 <= number && number < intToCharMap.length) {
    return intToCharMap[number];
  }
  throw new TypeError("Must be between 0 and 63: " + number);
};

/**
 * Decode a single base 64 character code digit to an integer. Returns -1 on
 * failure.
 */
exports.decode = function (charCode) {
  var bigA = 65;     // 'A'
  var bigZ = 90;     // 'Z'

  var littleA = 97;  // 'a'
  var littleZ = 122; // 'z'

  var zero = 48;     // '0'
  var nine = 57;     // '9'

  var plus = 43;     // '+'
  var slash = 47;    // '/'

  var littleOffset = 26;
  var numberOffset = 52;

  // 0 - 25: ABCDEFGHIJKLMNOPQRSTUVWXYZ
  if (bigA <= charCode && charCode <= bigZ) {
    return (charCode - bigA);
  }

  // 26 - 51: abcdefghijklmnopqrstuvwxyz
  if (littleA <= charCode && charCode <= littleZ) {
    return (charCode - littleA + littleOffset);
  }

  // 52 - 61: 0123456789
  if (zero <= charCode && charCode <= nine) {
    return (charCode - zero + numberOffset);
  }

  // 62: +
  if (charCode == plus) {
    return 62;
  }

  // 63: /
  if (charCode == slash) {
    return 63;
  }

  // Invalid base64 digit.
  return -1;
};

},{}],29:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

exports.GREATEST_LOWER_BOUND = 1;
exports.LEAST_UPPER_BOUND = 2;

/**
 * Recursive implementation of binary search.
 *
 * @param aLow Indices here and lower do not contain the needle.
 * @param aHigh Indices here and higher do not contain the needle.
 * @param aNeedle The element being searched for.
 * @param aHaystack The non-empty array being searched.
 * @param aCompare Function which takes two elements and returns -1, 0, or 1.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 */
function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
  // This function terminates when one of the following is true:
  //
  //   1. We find the exact element we are looking for.
  //
  //   2. We did not find the exact element, but we can return the index of
  //      the next-closest element.
  //
  //   3. We did not find the exact element, and there is no next-closest
  //      element than the one we are searching for, so we return -1.
  var mid = Math.floor((aHigh - aLow) / 2) + aLow;
  var cmp = aCompare(aNeedle, aHaystack[mid], true);
  if (cmp === 0) {
    // Found the element we are looking for.
    return mid;
  }
  else if (cmp > 0) {
    // Our needle is greater than aHaystack[mid].
    if (aHigh - mid > 1) {
      // The element is in the upper half.
      return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
    }

    // The exact needle element was not found in this haystack. Determine if
    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return aHigh < aHaystack.length ? aHigh : -1;
    } else {
      return mid;
    }
  }
  else {
    // Our needle is less than aHaystack[mid].
    if (mid - aLow > 1) {
      // The element is in the lower half.
      return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
    }

    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return mid;
    } else {
      return aLow < 0 ? -1 : aLow;
    }
  }
}

/**
 * This is an implementation of binary search which will always try and return
 * the index of the closest element if there is no exact hit. This is because
 * mappings between original and generated line/col pairs are single points,
 * and there is an implicit region between each of them, so a miss just means
 * that you aren't on the very start of a region.
 *
 * @param aNeedle The element you are looking for.
 * @param aHaystack The array that is being searched.
 * @param aCompare A function which takes the needle and an element in the
 *     array and returns -1, 0, or 1 depending on whether the needle is less
 *     than, equal to, or greater than the element, respectively.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
 */
exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
  if (aHaystack.length === 0) {
    return -1;
  }

  var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack,
                              aCompare, aBias || exports.GREATEST_LOWER_BOUND);
  if (index < 0) {
    return -1;
  }

  // We have found either the exact element, or the next-closest element than
  // the one we are searching for. However, there may be more than one such
  // element. Make sure we always return the smallest of these.
  while (index - 1 >= 0) {
    if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
      break;
    }
    --index;
  }

  return index;
};

},{}],30:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

// It turns out that some (most?) JavaScript engines don't self-host
// `Array.prototype.sort`. This makes sense because C++ will likely remain
// faster than JS when doing raw CPU-intensive sorting. However, when using a
// custom comparator function, calling back and forth between the VM's C++ and
// JIT'd JS is rather slow *and* loses JIT type information, resulting in
// worse generated code for the comparator function than would be optimal. In
// fact, when sorting with a comparator, these costs outweigh the benefits of
// sorting in C++. By using our own JS-implemented Quick Sort (below), we get
// a ~3500ms mean speed-up in `bench/bench.html`.

/**
 * Swap the elements indexed by `x` and `y` in the array `ary`.
 *
 * @param {Array} ary
 *        The array.
 * @param {Number} x
 *        The index of the first item.
 * @param {Number} y
 *        The index of the second item.
 */
function swap(ary, x, y) {
  var temp = ary[x];
  ary[x] = ary[y];
  ary[y] = temp;
}

/**
 * Returns a random integer within the range `low .. high` inclusive.
 *
 * @param {Number} low
 *        The lower bound on the range.
 * @param {Number} high
 *        The upper bound on the range.
 */
function randomIntInRange(low, high) {
  return Math.round(low + (Math.random() * (high - low)));
}

/**
 * The Quick Sort algorithm.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 * @param {Number} p
 *        Start index of the array
 * @param {Number} r
 *        End index of the array
 */
function doQuickSort(ary, comparator, p, r) {
  // If our lower bound is less than our upper bound, we (1) partition the
  // array into two pieces and (2) recurse on each half. If it is not, this is
  // the empty array and our base case.

  if (p < r) {
    // (1) Partitioning.
    //
    // The partitioning chooses a pivot between `p` and `r` and moves all
    // elements that are less than or equal to the pivot to the before it, and
    // all the elements that are greater than it after it. The effect is that
    // once partition is done, the pivot is in the exact place it will be when
    // the array is put in sorted order, and it will not need to be moved
    // again. This runs in O(n) time.

    // Always choose a random pivot so that an input array which is reverse
    // sorted does not cause O(n^2) running time.
    var pivotIndex = randomIntInRange(p, r);
    var i = p - 1;

    swap(ary, pivotIndex, r);
    var pivot = ary[r];

    // Immediately after `j` is incremented in this loop, the following hold
    // true:
    //
    //   * Every element in `ary[p .. i]` is less than or equal to the pivot.
    //
    //   * Every element in `ary[i+1 .. j-1]` is greater than the pivot.
    for (var j = p; j < r; j++) {
      if (comparator(ary[j], pivot) <= 0) {
        i += 1;
        swap(ary, i, j);
      }
    }

    swap(ary, i + 1, j);
    var q = i + 1;

    // (2) Recurse on each half.

    doQuickSort(ary, comparator, p, q - 1);
    doQuickSort(ary, comparator, q + 1, r);
  }
}

/**
 * Sort the given array in-place with the given comparator function.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 */
exports.quickSort = function (ary, comparator) {
  doQuickSort(ary, comparator, 0, ary.length - 1);
};

},{}],31:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util = require('./util');
var binarySearch = require('./binary-search');
var ArraySet = require('./array-set').ArraySet;
var base64VLQ = require('./base64-vlq');
var quickSort = require('./quick-sort').quickSort;

function SourceMapConsumer(aSourceMap) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
  }

  return sourceMap.sections != null
    ? new IndexedSourceMapConsumer(sourceMap)
    : new BasicSourceMapConsumer(sourceMap);
}

SourceMapConsumer.fromSourceMap = function(aSourceMap) {
  return BasicSourceMapConsumer.fromSourceMap(aSourceMap);
}

/**
 * The version of the source mapping spec that we are consuming.
 */
SourceMapConsumer.prototype._version = 3;

// `__generatedMappings` and `__originalMappings` are arrays that hold the
// parsed mapping coordinates from the source map's "mappings" attribute. They
// are lazily instantiated, accessed via the `_generatedMappings` and
// `_originalMappings` getters respectively, and we only parse the mappings
// and create these arrays once queried for a source location. We jump through
// these hoops because there can be many thousands of mappings, and parsing
// them is expensive, so we only want to do it if we must.
//
// Each object in the arrays is of the form:
//
//     {
//       generatedLine: The line number in the generated code,
//       generatedColumn: The column number in the generated code,
//       source: The path to the original source file that generated this
//               chunk of code,
//       originalLine: The line number in the original source that
//                     corresponds to this chunk of generated code,
//       originalColumn: The column number in the original source that
//                       corresponds to this chunk of generated code,
//       name: The name of the original symbol which generated this chunk of
//             code.
//     }
//
// All properties except for `generatedLine` and `generatedColumn` can be
// `null`.
//
// `_generatedMappings` is ordered by the generated positions.
//
// `_originalMappings` is ordered by the original positions.

SourceMapConsumer.prototype.__generatedMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
  get: function () {
    if (!this.__generatedMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__generatedMappings;
  }
});

SourceMapConsumer.prototype.__originalMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
  get: function () {
    if (!this.__originalMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__originalMappings;
  }
});

SourceMapConsumer.prototype._charIsMappingSeparator =
  function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
    var c = aStr.charAt(index);
    return c === ";" || c === ",";
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
SourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    throw new Error("Subclasses must implement _parseMappings");
  };

SourceMapConsumer.GENERATED_ORDER = 1;
SourceMapConsumer.ORIGINAL_ORDER = 2;

SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
SourceMapConsumer.LEAST_UPPER_BOUND = 2;

/**
 * Iterate over each mapping between an original source/line/column and a
 * generated line/column in this source map.
 *
 * @param Function aCallback
 *        The function that is called with each mapping.
 * @param Object aContext
 *        Optional. If specified, this object will be the value of `this` every
 *        time that `aCallback` is called.
 * @param aOrder
 *        Either `SourceMapConsumer.GENERATED_ORDER` or
 *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
 *        iterate over the mappings sorted by the generated file's line/column
 *        order or the original's source/line/column order, respectively. Defaults to
 *        `SourceMapConsumer.GENERATED_ORDER`.
 */
SourceMapConsumer.prototype.eachMapping =
  function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
    var context = aContext || null;
    var order = aOrder || SourceMapConsumer.GENERATED_ORDER;

    var mappings;
    switch (order) {
    case SourceMapConsumer.GENERATED_ORDER:
      mappings = this._generatedMappings;
      break;
    case SourceMapConsumer.ORIGINAL_ORDER:
      mappings = this._originalMappings;
      break;
    default:
      throw new Error("Unknown order of iteration.");
    }

    var sourceRoot = this.sourceRoot;
    mappings.map(function (mapping) {
      var source = mapping.source === null ? null : this._sources.at(mapping.source);
      if (source != null && sourceRoot != null) {
        source = util.join(sourceRoot, source);
      }
      return {
        source: source,
        generatedLine: mapping.generatedLine,
        generatedColumn: mapping.generatedColumn,
        originalLine: mapping.originalLine,
        originalColumn: mapping.originalColumn,
        name: mapping.name === null ? null : this._names.at(mapping.name)
      };
    }, this).forEach(aCallback, context);
  };

/**
 * Returns all generated line and column information for the original source,
 * line, and column provided. If no column is provided, returns all mappings
 * corresponding to a either the line we are searching for or the next
 * closest line that has any mappings. Otherwise, returns all mappings
 * corresponding to the given line and either the column we are searching for
 * or the next closest column that has any offsets.
 *
 * The only argument is an object with the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.
 *   - column: Optional. the column number in the original source.
 *
 * and an array of objects is returned, each with the following properties:
 *
 *   - line: The line number in the generated source, or null.
 *   - column: The column number in the generated source, or null.
 */
SourceMapConsumer.prototype.allGeneratedPositionsFor =
  function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
    var line = util.getArg(aArgs, 'line');

    // When there is no exact match, BasicSourceMapConsumer.prototype._findMapping
    // returns the index of the closest mapping less than the needle. By
    // setting needle.originalColumn to 0, we thus find the last mapping for
    // the given line, provided such a mapping exists.
    var needle = {
      source: util.getArg(aArgs, 'source'),
      originalLine: line,
      originalColumn: util.getArg(aArgs, 'column', 0)
    };

    if (this.sourceRoot != null) {
      needle.source = util.relative(this.sourceRoot, needle.source);
    }
    if (!this._sources.has(needle.source)) {
      return [];
    }
    needle.source = this._sources.indexOf(needle.source);

    var mappings = [];

    var index = this._findMapping(needle,
                                  this._originalMappings,
                                  "originalLine",
                                  "originalColumn",
                                  util.compareByOriginalPositions,
                                  binarySearch.LEAST_UPPER_BOUND);
    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (aArgs.column === undefined) {
        var originalLine = mapping.originalLine;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we found. Since
        // mappings are sorted, this is guaranteed to find all mappings for
        // the line we found.
        while (mapping && mapping.originalLine === originalLine) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      } else {
        var originalColumn = mapping.originalColumn;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we were searching for.
        // Since mappings are sorted, this is guaranteed to find all mappings for
        // the line we are searching for.
        while (mapping &&
               mapping.originalLine === line &&
               mapping.originalColumn == originalColumn) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      }
    }

    return mappings;
  };

exports.SourceMapConsumer = SourceMapConsumer;

/**
 * A BasicSourceMapConsumer instance represents a parsed source map which we can
 * query for information about the original file positions by giving it a file
 * position in the generated source.
 *
 * The only parameter is the raw source map (either as a JSON string, or
 * already parsed to an object). According to the spec, source maps have the
 * following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - sources: An array of URLs to the original source files.
 *   - names: An array of identifiers which can be referrenced by individual mappings.
 *   - sourceRoot: Optional. The URL root from which all sources are relative.
 *   - sourcesContent: Optional. An array of contents of the original source files.
 *   - mappings: A string of base64 VLQs which contain the actual mappings.
 *   - file: Optional. The generated file this source map is associated with.
 *
 * Here is an example source map, taken from the source map spec[0]:
 *
 *     {
 *       version : 3,
 *       file: "out.js",
 *       sourceRoot : "",
 *       sources: ["foo.js", "bar.js"],
 *       names: ["src", "maps", "are", "fun"],
 *       mappings: "AA,AB;;ABCDE;"
 *     }
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
 */
function BasicSourceMapConsumer(aSourceMap) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
  }

  var version = util.getArg(sourceMap, 'version');
  var sources = util.getArg(sourceMap, 'sources');
  // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
  // requires the array) to play nice here.
  var names = util.getArg(sourceMap, 'names', []);
  var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
  var sourcesContent = util.getArg(sourceMap, 'sourcesContent', null);
  var mappings = util.getArg(sourceMap, 'mappings');
  var file = util.getArg(sourceMap, 'file', null);

  // Once again, Sass deviates from the spec and supplies the version as a
  // string rather than a number, so we use loose equality checking here.
  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  sources = sources
    .map(String)
    // Some source maps produce relative source paths like "./foo.js" instead of
    // "foo.js".  Normalize these first so that future comparisons will succeed.
    // See bugzil.la/1090768.
    .map(util.normalize)
    // Always ensure that absolute sources are internally stored relative to
    // the source root, if the source root is absolute. Not doing this would
    // be particularly problematic when the source root is a prefix of the
    // source (valid, but why??). See github issue #199 and bugzil.la/1188982.
    .map(function (source) {
      return sourceRoot && util.isAbsolute(sourceRoot) && util.isAbsolute(source)
        ? util.relative(sourceRoot, source)
        : source;
    });

  // Pass `true` below to allow duplicate names and sources. While source maps
  // are intended to be compressed and deduplicated, the TypeScript compiler
  // sometimes generates source maps with duplicates in them. See Github issue
  // #72 and bugzil.la/889492.
  this._names = ArraySet.fromArray(names.map(String), true);
  this._sources = ArraySet.fromArray(sources, true);

  this.sourceRoot = sourceRoot;
  this.sourcesContent = sourcesContent;
  this._mappings = mappings;
  this.file = file;
}

BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;

/**
 * Create a BasicSourceMapConsumer from a SourceMapGenerator.
 *
 * @param SourceMapGenerator aSourceMap
 *        The source map that will be consumed.
 * @returns BasicSourceMapConsumer
 */
BasicSourceMapConsumer.fromSourceMap =
  function SourceMapConsumer_fromSourceMap(aSourceMap) {
    var smc = Object.create(BasicSourceMapConsumer.prototype);

    var names = smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
    var sources = smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
    smc.sourceRoot = aSourceMap._sourceRoot;
    smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                            smc.sourceRoot);
    smc.file = aSourceMap._file;

    // Because we are modifying the entries (by converting string sources and
    // names to indices into the sources and names ArraySets), we have to make
    // a copy of the entry or else bad things happen. Shared mutable state
    // strikes again! See github issue #191.

    var generatedMappings = aSourceMap._mappings.toArray().slice();
    var destGeneratedMappings = smc.__generatedMappings = [];
    var destOriginalMappings = smc.__originalMappings = [];

    for (var i = 0, length = generatedMappings.length; i < length; i++) {
      var srcMapping = generatedMappings[i];
      var destMapping = new Mapping;
      destMapping.generatedLine = srcMapping.generatedLine;
      destMapping.generatedColumn = srcMapping.generatedColumn;

      if (srcMapping.source) {
        destMapping.source = sources.indexOf(srcMapping.source);
        destMapping.originalLine = srcMapping.originalLine;
        destMapping.originalColumn = srcMapping.originalColumn;

        if (srcMapping.name) {
          destMapping.name = names.indexOf(srcMapping.name);
        }

        destOriginalMappings.push(destMapping);
      }

      destGeneratedMappings.push(destMapping);
    }

    quickSort(smc.__originalMappings, util.compareByOriginalPositions);

    return smc;
  };

/**
 * The version of the source mapping spec that we are consuming.
 */
BasicSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(BasicSourceMapConsumer.prototype, 'sources', {
  get: function () {
    return this._sources.toArray().map(function (s) {
      return this.sourceRoot != null ? util.join(this.sourceRoot, s) : s;
    }, this);
  }
});

/**
 * Provide the JIT with a nice shape / hidden class.
 */
function Mapping() {
  this.generatedLine = 0;
  this.generatedColumn = 0;
  this.source = null;
  this.originalLine = null;
  this.originalColumn = null;
  this.name = null;
}

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
BasicSourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    var generatedLine = 1;
    var previousGeneratedColumn = 0;
    var previousOriginalLine = 0;
    var previousOriginalColumn = 0;
    var previousSource = 0;
    var previousName = 0;
    var length = aStr.length;
    var index = 0;
    var cachedSegments = {};
    var temp = {};
    var originalMappings = [];
    var generatedMappings = [];
    var mapping, str, segment, end, value;

    while (index < length) {
      if (aStr.charAt(index) === ';') {
        generatedLine++;
        index++;
        previousGeneratedColumn = 0;
      }
      else if (aStr.charAt(index) === ',') {
        index++;
      }
      else {
        mapping = new Mapping();
        mapping.generatedLine = generatedLine;

        // Because each offset is encoded relative to the previous one,
        // many segments often have the same encoding. We can exploit this
        // fact by caching the parsed variable length fields of each segment,
        // allowing us to avoid a second parse if we encounter the same
        // segment again.
        for (end = index; end < length; end++) {
          if (this._charIsMappingSeparator(aStr, end)) {
            break;
          }
        }
        str = aStr.slice(index, end);

        segment = cachedSegments[str];
        if (segment) {
          index += str.length;
        } else {
          segment = [];
          while (index < end) {
            base64VLQ.decode(aStr, index, temp);
            value = temp.value;
            index = temp.rest;
            segment.push(value);
          }

          if (segment.length === 2) {
            throw new Error('Found a source, but no line and column');
          }

          if (segment.length === 3) {
            throw new Error('Found a source and line, but no column');
          }

          cachedSegments[str] = segment;
        }

        // Generated column.
        mapping.generatedColumn = previousGeneratedColumn + segment[0];
        previousGeneratedColumn = mapping.generatedColumn;

        if (segment.length > 1) {
          // Original source.
          mapping.source = previousSource + segment[1];
          previousSource += segment[1];

          // Original line.
          mapping.originalLine = previousOriginalLine + segment[2];
          previousOriginalLine = mapping.originalLine;
          // Lines are stored 0-based
          mapping.originalLine += 1;

          // Original column.
          mapping.originalColumn = previousOriginalColumn + segment[3];
          previousOriginalColumn = mapping.originalColumn;

          if (segment.length > 4) {
            // Original name.
            mapping.name = previousName + segment[4];
            previousName += segment[4];
          }
        }

        generatedMappings.push(mapping);
        if (typeof mapping.originalLine === 'number') {
          originalMappings.push(mapping);
        }
      }
    }

    quickSort(generatedMappings, util.compareByGeneratedPositionsDeflated);
    this.__generatedMappings = generatedMappings;

    quickSort(originalMappings, util.compareByOriginalPositions);
    this.__originalMappings = originalMappings;
  };

/**
 * Find the mapping that best matches the hypothetical "needle" mapping that
 * we are searching for in the given "haystack" of mappings.
 */
BasicSourceMapConsumer.prototype._findMapping =
  function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                         aColumnName, aComparator, aBias) {
    // To return the position we are searching for, we must first find the
    // mapping for the given position and then return the opposite position it
    // points to. Because the mappings are sorted, we can use binary search to
    // find the best mapping.

    if (aNeedle[aLineName] <= 0) {
      throw new TypeError('Line must be greater than or equal to 1, got '
                          + aNeedle[aLineName]);
    }
    if (aNeedle[aColumnName] < 0) {
      throw new TypeError('Column must be greater than or equal to 0, got '
                          + aNeedle[aColumnName]);
    }

    return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
  };

/**
 * Compute the last column for each generated mapping. The last column is
 * inclusive.
 */
BasicSourceMapConsumer.prototype.computeColumnSpans =
  function SourceMapConsumer_computeColumnSpans() {
    for (var index = 0; index < this._generatedMappings.length; ++index) {
      var mapping = this._generatedMappings[index];

      // Mappings do not contain a field for the last generated columnt. We
      // can come up with an optimistic estimate, however, by assuming that
      // mappings are contiguous (i.e. given two consecutive mappings, the
      // first mapping ends where the second one starts).
      if (index + 1 < this._generatedMappings.length) {
        var nextMapping = this._generatedMappings[index + 1];

        if (mapping.generatedLine === nextMapping.generatedLine) {
          mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
          continue;
        }
      }

      // The last mapping for each line spans the entire line.
      mapping.lastGeneratedColumn = Infinity;
    }
  };

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.
 *   - column: The column number in the generated source.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.
 *   - column: The column number in the original source, or null.
 *   - name: The original identifier, or null.
 */
BasicSourceMapConsumer.prototype.originalPositionFor =
  function SourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, 'line'),
      generatedColumn: util.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._generatedMappings,
      "generatedLine",
      "generatedColumn",
      util.compareByGeneratedPositionsDeflated,
      util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._generatedMappings[index];

      if (mapping.generatedLine === needle.generatedLine) {
        var source = util.getArg(mapping, 'source', null);
        if (source !== null) {
          source = this._sources.at(source);
          if (this.sourceRoot != null) {
            source = util.join(this.sourceRoot, source);
          }
        }
        var name = util.getArg(mapping, 'name', null);
        if (name !== null) {
          name = this._names.at(name);
        }
        return {
          source: source,
          line: util.getArg(mapping, 'originalLine', null),
          column: util.getArg(mapping, 'originalColumn', null),
          name: name
        };
      }
    }

    return {
      source: null,
      line: null,
      column: null,
      name: null
    };
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
BasicSourceMapConsumer.prototype.hasContentsOfAllSources =
  function BasicSourceMapConsumer_hasContentsOfAllSources() {
    if (!this.sourcesContent) {
      return false;
    }
    return this.sourcesContent.length >= this._sources.size() &&
      !this.sourcesContent.some(function (sc) { return sc == null; });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
BasicSourceMapConsumer.prototype.sourceContentFor =
  function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    if (!this.sourcesContent) {
      return null;
    }

    if (this.sourceRoot != null) {
      aSource = util.relative(this.sourceRoot, aSource);
    }

    if (this._sources.has(aSource)) {
      return this.sourcesContent[this._sources.indexOf(aSource)];
    }

    var url;
    if (this.sourceRoot != null
        && (url = util.urlParse(this.sourceRoot))) {
      // XXX: file:// URIs and absolute paths lead to unexpected behavior for
      // many users. We can help them out when they expect file:// URIs to
      // behave like it would if they were running a local HTTP server. See
      // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
      var fileUriAbsPath = aSource.replace(/^file:\/\//, "");
      if (url.scheme == "file"
          && this._sources.has(fileUriAbsPath)) {
        return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
      }

      if ((!url.path || url.path == "/")
          && this._sources.has("/" + aSource)) {
        return this.sourcesContent[this._sources.indexOf("/" + aSource)];
      }
    }

    // This function is used recursively from
    // IndexedSourceMapConsumer.prototype.sourceContentFor. In that case, we
    // don't want to throw if we can't find the source - we just want to
    // return null, so we provide a flag to exit gracefully.
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + aSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.
 *   - column: The column number in the original source.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.
 *   - column: The column number in the generated source, or null.
 */
BasicSourceMapConsumer.prototype.generatedPositionFor =
  function SourceMapConsumer_generatedPositionFor(aArgs) {
    var source = util.getArg(aArgs, 'source');
    if (this.sourceRoot != null) {
      source = util.relative(this.sourceRoot, source);
    }
    if (!this._sources.has(source)) {
      return {
        line: null,
        column: null,
        lastColumn: null
      };
    }
    source = this._sources.indexOf(source);

    var needle = {
      source: source,
      originalLine: util.getArg(aArgs, 'line'),
      originalColumn: util.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._originalMappings,
      "originalLine",
      "originalColumn",
      util.compareByOriginalPositions,
      util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (mapping.source === needle.source) {
        return {
          line: util.getArg(mapping, 'generatedLine', null),
          column: util.getArg(mapping, 'generatedColumn', null),
          lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
        };
      }
    }

    return {
      line: null,
      column: null,
      lastColumn: null
    };
  };

exports.BasicSourceMapConsumer = BasicSourceMapConsumer;

/**
 * An IndexedSourceMapConsumer instance represents a parsed source map which
 * we can query for information. It differs from BasicSourceMapConsumer in
 * that it takes "indexed" source maps (i.e. ones with a "sections" field) as
 * input.
 *
 * The only parameter is a raw source map (either as a JSON string, or already
 * parsed to an object). According to the spec for indexed source maps, they
 * have the following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - file: Optional. The generated file this source map is associated with.
 *   - sections: A list of section definitions.
 *
 * Each value under the "sections" field has two fields:
 *   - offset: The offset into the original specified at which this section
 *       begins to apply, defined as an object with a "line" and "column"
 *       field.
 *   - map: A source map definition. This source map could also be indexed,
 *       but doesn't have to be.
 *
 * Instead of the "map" field, it's also possible to have a "url" field
 * specifying a URL to retrieve a source map from, but that's currently
 * unsupported.
 *
 * Here's an example source map, taken from the source map spec[0], but
 * modified to omit a section which uses the "url" field.
 *
 *  {
 *    version : 3,
 *    file: "app.js",
 *    sections: [{
 *      offset: {line:100, column:10},
 *      map: {
 *        version : 3,
 *        file: "section.js",
 *        sources: ["foo.js", "bar.js"],
 *        names: ["src", "maps", "are", "fun"],
 *        mappings: "AAAA,E;;ABCDE;"
 *      }
 *    }],
 *  }
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
 */
function IndexedSourceMapConsumer(aSourceMap) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
  }

  var version = util.getArg(sourceMap, 'version');
  var sections = util.getArg(sourceMap, 'sections');

  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  this._sources = new ArraySet();
  this._names = new ArraySet();

  var lastOffset = {
    line: -1,
    column: 0
  };
  this._sections = sections.map(function (s) {
    if (s.url) {
      // The url field will require support for asynchronicity.
      // See https://github.com/mozilla/source-map/issues/16
      throw new Error('Support for url field in sections not implemented.');
    }
    var offset = util.getArg(s, 'offset');
    var offsetLine = util.getArg(offset, 'line');
    var offsetColumn = util.getArg(offset, 'column');

    if (offsetLine < lastOffset.line ||
        (offsetLine === lastOffset.line && offsetColumn < lastOffset.column)) {
      throw new Error('Section offsets must be ordered and non-overlapping.');
    }
    lastOffset = offset;

    return {
      generatedOffset: {
        // The offset fields are 0-based, but we use 1-based indices when
        // encoding/decoding from VLQ.
        generatedLine: offsetLine + 1,
        generatedColumn: offsetColumn + 1
      },
      consumer: new SourceMapConsumer(util.getArg(s, 'map'))
    }
  });
}

IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer;

/**
 * The version of the source mapping spec that we are consuming.
 */
IndexedSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(IndexedSourceMapConsumer.prototype, 'sources', {
  get: function () {
    var sources = [];
    for (var i = 0; i < this._sections.length; i++) {
      for (var j = 0; j < this._sections[i].consumer.sources.length; j++) {
        sources.push(this._sections[i].consumer.sources[j]);
      }
    }
    return sources;
  }
});

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.
 *   - column: The column number in the generated source.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.
 *   - column: The column number in the original source, or null.
 *   - name: The original identifier, or null.
 */
IndexedSourceMapConsumer.prototype.originalPositionFor =
  function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, 'line'),
      generatedColumn: util.getArg(aArgs, 'column')
    };

    // Find the section containing the generated position we're trying to map
    // to an original position.
    var sectionIndex = binarySearch.search(needle, this._sections,
      function(needle, section) {
        var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
        if (cmp) {
          return cmp;
        }

        return (needle.generatedColumn -
                section.generatedOffset.generatedColumn);
      });
    var section = this._sections[sectionIndex];

    if (!section) {
      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    }

    return section.consumer.originalPositionFor({
      line: needle.generatedLine -
        (section.generatedOffset.generatedLine - 1),
      column: needle.generatedColumn -
        (section.generatedOffset.generatedLine === needle.generatedLine
         ? section.generatedOffset.generatedColumn - 1
         : 0),
      bias: aArgs.bias
    });
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
IndexedSourceMapConsumer.prototype.hasContentsOfAllSources =
  function IndexedSourceMapConsumer_hasContentsOfAllSources() {
    return this._sections.every(function (s) {
      return s.consumer.hasContentsOfAllSources();
    });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
IndexedSourceMapConsumer.prototype.sourceContentFor =
  function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      var content = section.consumer.sourceContentFor(aSource, true);
      if (content) {
        return content;
      }
    }
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + aSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.
 *   - column: The column number in the original source.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.
 *   - column: The column number in the generated source, or null.
 */
IndexedSourceMapConsumer.prototype.generatedPositionFor =
  function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      // Only consider this section if the requested source is in the list of
      // sources of the consumer.
      if (section.consumer.sources.indexOf(util.getArg(aArgs, 'source')) === -1) {
        continue;
      }
      var generatedPosition = section.consumer.generatedPositionFor(aArgs);
      if (generatedPosition) {
        var ret = {
          line: generatedPosition.line +
            (section.generatedOffset.generatedLine - 1),
          column: generatedPosition.column +
            (section.generatedOffset.generatedLine === generatedPosition.line
             ? section.generatedOffset.generatedColumn - 1
             : 0)
        };
        return ret;
      }
    }

    return {
      line: null,
      column: null
    };
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
IndexedSourceMapConsumer.prototype._parseMappings =
  function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    this.__generatedMappings = [];
    this.__originalMappings = [];
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];
      var sectionMappings = section.consumer._generatedMappings;
      for (var j = 0; j < sectionMappings.length; j++) {
        var mapping = sectionMappings[j];

        var source = section.consumer._sources.at(mapping.source);
        if (section.consumer.sourceRoot !== null) {
          source = util.join(section.consumer.sourceRoot, source);
        }
        this._sources.add(source);
        source = this._sources.indexOf(source);

        var name = section.consumer._names.at(mapping.name);
        this._names.add(name);
        name = this._names.indexOf(name);

        // The mappings coming from the consumer for the section have
        // generated positions relative to the start of the section, so we
        // need to offset them to be relative to the start of the concatenated
        // generated file.
        var adjustedMapping = {
          source: source,
          generatedLine: mapping.generatedLine +
            (section.generatedOffset.generatedLine - 1),
          generatedColumn: mapping.generatedColumn +
            (section.generatedOffset.generatedLine === mapping.generatedLine
            ? section.generatedOffset.generatedColumn - 1
            : 0),
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: name
        };

        this.__generatedMappings.push(adjustedMapping);
        if (typeof adjustedMapping.originalLine === 'number') {
          this.__originalMappings.push(adjustedMapping);
        }
      }
    }

    quickSort(this.__generatedMappings, util.compareByGeneratedPositionsDeflated);
    quickSort(this.__originalMappings, util.compareByOriginalPositions);
  };

exports.IndexedSourceMapConsumer = IndexedSourceMapConsumer;

},{"./array-set":26,"./base64-vlq":27,"./binary-search":29,"./quick-sort":30,"./util":32}],32:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

/**
 * This is a helper function for getting values from parameter/options
 * objects.
 *
 * @param args The object we are extracting values from
 * @param name The name of the property we are getting.
 * @param defaultValue An optional value to return if the property is missing
 * from the object. If this is not specified and the property is missing, an
 * error will be thrown.
 */
function getArg(aArgs, aName, aDefaultValue) {
  if (aName in aArgs) {
    return aArgs[aName];
  } else if (arguments.length === 3) {
    return aDefaultValue;
  } else {
    throw new Error('"' + aName + '" is a required argument.');
  }
}
exports.getArg = getArg;

var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.]*)(?::(\d+))?(\S*)$/;
var dataUrlRegexp = /^data:.+\,.+$/;

function urlParse(aUrl) {
  var match = aUrl.match(urlRegexp);
  if (!match) {
    return null;
  }
  return {
    scheme: match[1],
    auth: match[2],
    host: match[3],
    port: match[4],
    path: match[5]
  };
}
exports.urlParse = urlParse;

function urlGenerate(aParsedUrl) {
  var url = '';
  if (aParsedUrl.scheme) {
    url += aParsedUrl.scheme + ':';
  }
  url += '//';
  if (aParsedUrl.auth) {
    url += aParsedUrl.auth + '@';
  }
  if (aParsedUrl.host) {
    url += aParsedUrl.host;
  }
  if (aParsedUrl.port) {
    url += ":" + aParsedUrl.port
  }
  if (aParsedUrl.path) {
    url += aParsedUrl.path;
  }
  return url;
}
exports.urlGenerate = urlGenerate;

/**
 * Normalizes a path, or the path portion of a URL:
 *
 * - Replaces consecutive slashes with one slash.
 * - Removes unnecessary '.' parts.
 * - Removes unnecessary '<dir>/..' parts.
 *
 * Based on code in the Node.js 'path' core module.
 *
 * @param aPath The path or url to normalize.
 */
function normalize(aPath) {
  var path = aPath;
  var url = urlParse(aPath);
  if (url) {
    if (!url.path) {
      return aPath;
    }
    path = url.path;
  }
  var isAbsolute = exports.isAbsolute(path);

  var parts = path.split(/\/+/);
  for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
    part = parts[i];
    if (part === '.') {
      parts.splice(i, 1);
    } else if (part === '..') {
      up++;
    } else if (up > 0) {
      if (part === '') {
        // The first part is blank if the path is absolute. Trying to go
        // above the root is a no-op. Therefore we can remove all '..' parts
        // directly after the root.
        parts.splice(i + 1, up);
        up = 0;
      } else {
        parts.splice(i, 2);
        up--;
      }
    }
  }
  path = parts.join('/');

  if (path === '') {
    path = isAbsolute ? '/' : '.';
  }

  if (url) {
    url.path = path;
    return urlGenerate(url);
  }
  return path;
}
exports.normalize = normalize;

/**
 * Joins two paths/URLs.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be joined with the root.
 *
 * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
 *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
 *   first.
 * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
 *   is updated with the result and aRoot is returned. Otherwise the result
 *   is returned.
 *   - If aPath is absolute, the result is aPath.
 *   - Otherwise the two paths are joined with a slash.
 * - Joining for example 'http://' and 'www.example.com' is also supported.
 */
function join(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }
  if (aPath === "") {
    aPath = ".";
  }
  var aPathUrl = urlParse(aPath);
  var aRootUrl = urlParse(aRoot);
  if (aRootUrl) {
    aRoot = aRootUrl.path || '/';
  }

  // `join(foo, '//www.example.org')`
  if (aPathUrl && !aPathUrl.scheme) {
    if (aRootUrl) {
      aPathUrl.scheme = aRootUrl.scheme;
    }
    return urlGenerate(aPathUrl);
  }

  if (aPathUrl || aPath.match(dataUrlRegexp)) {
    return aPath;
  }

  // `join('http://', 'www.example.com')`
  if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
    aRootUrl.host = aPath;
    return urlGenerate(aRootUrl);
  }

  var joined = aPath.charAt(0) === '/'
    ? aPath
    : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

  if (aRootUrl) {
    aRootUrl.path = joined;
    return urlGenerate(aRootUrl);
  }
  return joined;
}
exports.join = join;

exports.isAbsolute = function (aPath) {
  return aPath.charAt(0) === '/' || !!aPath.match(urlRegexp);
};

/**
 * Make a path relative to a URL or another path.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be made relative to aRoot.
 */
function relative(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }

  aRoot = aRoot.replace(/\/$/, '');

  // It is possible for the path to be above the root. In this case, simply
  // checking whether the root is a prefix of the path won't work. Instead, we
  // need to remove components from the root one by one, until either we find
  // a prefix that fits, or we run out of components to remove.
  var level = 0;
  while (aPath.indexOf(aRoot + '/') !== 0) {
    var index = aRoot.lastIndexOf("/");
    if (index < 0) {
      return aPath;
    }

    // If the only part of the root that is left is the scheme (i.e. http://,
    // file:///, etc.), one or more slashes (/), or simply nothing at all, we
    // have exhausted all components, so the path is not relative to the root.
    aRoot = aRoot.slice(0, index);
    if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
      return aPath;
    }

    ++level;
  }

  // Make sure we add a "../" for each component we removed from the root.
  return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
}
exports.relative = relative;

var supportsNullProto = (function () {
  var obj = Object.create(null);
  return !('__proto__' in obj);
}());

function identity (s) {
  return s;
}

/**
 * Because behavior goes wacky when you set `__proto__` on objects, we
 * have to prefix all the strings in our set with an arbitrary character.
 *
 * See https://github.com/mozilla/source-map/pull/31 and
 * https://github.com/mozilla/source-map/issues/30
 *
 * @param String aStr
 */
function toSetString(aStr) {
  if (isProtoString(aStr)) {
    return '$' + aStr;
  }

  return aStr;
}
exports.toSetString = supportsNullProto ? identity : toSetString;

function fromSetString(aStr) {
  if (isProtoString(aStr)) {
    return aStr.slice(1);
  }

  return aStr;
}
exports.fromSetString = supportsNullProto ? identity : fromSetString;

function isProtoString(s) {
  if (!s) {
    return false;
  }

  var length = s.length;

  if (length < 9 /* "__proto__".length */) {
    return false;
  }

  if (s.charCodeAt(length - 1) !== 95  /* '_' */ ||
      s.charCodeAt(length - 2) !== 95  /* '_' */ ||
      s.charCodeAt(length - 3) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 4) !== 116 /* 't' */ ||
      s.charCodeAt(length - 5) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 6) !== 114 /* 'r' */ ||
      s.charCodeAt(length - 7) !== 112 /* 'p' */ ||
      s.charCodeAt(length - 8) !== 95  /* '_' */ ||
      s.charCodeAt(length - 9) !== 95  /* '_' */) {
    return false;
  }

  for (var i = length - 10; i >= 0; i--) {
    if (s.charCodeAt(i) !== 36 /* '$' */) {
      return false;
    }
  }

  return true;
}

/**
 * Comparator between two mappings where the original positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same original source/line/column, but different generated
 * line and column the same. Useful when searching for a mapping with a
 * stubbed out mapping.
 */
function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
  var cmp = mappingA.source - mappingB.source;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0 || onlyCompareOriginal) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  return mappingA.name - mappingB.name;
}
exports.compareByOriginalPositions = compareByOriginalPositions;

/**
 * Comparator between two mappings with deflated source and name indices where
 * the generated positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same generated line and column, but different
 * source/name/original line and column the same. Useful when searching for a
 * mapping with a stubbed out mapping.
 */
function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0 || onlyCompareGenerated) {
    return cmp;
  }

  cmp = mappingA.source - mappingB.source;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return mappingA.name - mappingB.name;
}
exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;

function strcmp(aStr1, aStr2) {
  if (aStr1 === aStr2) {
    return 0;
  }

  if (aStr1 > aStr2) {
    return 1;
  }

  return -1;
}

/**
 * Comparator between two mappings with inflated source and name strings where
 * the generated positions are compared.
 */
function compareByGeneratedPositionsInflated(mappingA, mappingB) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;

},{}],33:[function(require,module,exports){
(function(root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define('stacktrace-gps', ['source-map', 'stackframe'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('source-map/lib/source-map-consumer'), require('stackframe'));
    } else {
        root.StackTraceGPS = factory(root.SourceMap || root.sourceMap, root.StackFrame);
    }
}(this, function(SourceMap, StackFrame) {
    'use strict';

    /**
     * Make a X-Domain request to url and callback.
     *
     * @param {String} url
     * @returns {Promise} with response text if fulfilled
     */
    function _xdr(url) {
        return new Promise(function(resolve, reject) {
            var req = new XMLHttpRequest();
            req.open('get', url);
            req.onerror = reject;
            req.onreadystatechange = function onreadystatechange() {
                if (req.readyState === 4) {
                    if ((req.status >= 200 && req.status < 300) ||
                        (url.substr(0, 7) === 'file://' && req.responseText)) {
                        resolve(req.responseText);
                    } else {
                        reject(new Error('HTTP status: ' + req.status + ' retrieving ' + url));
                    }
                }
            };
            req.send();
        });

    }

    /**
     * Convert a Base64-encoded string into its original representation.
     * Used for inline sourcemaps.
     *
     * @param {String} b64str Base-64 encoded string
     * @returns {String} original representation of the base64-encoded string.
     */
    function _atob(b64str) {
        if (typeof window !== 'undefined' && window.atob) {
            return window.atob(b64str);
        } else {
            throw new Error('You must supply a polyfill for window.atob in this environment');
        }
    }

    function _parseJson(string) {
        if (typeof JSON !== 'undefined' && JSON.parse) {
            return JSON.parse(string);
        } else {
            throw new Error('You must supply a polyfill for JSON.parse in this environment');
        }
    }

    function _findFunctionName(source, lineNumber/*, columnNumber*/) {
        var syntaxes = [
            // {name} = function ({args}) TODO args capture
            /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*function\b/,
            // function {name}({args}) m[1]=name m[2]=args
            /function\s+([^('"`]*?)\s*\(([^)]*)\)/,
            // {name} = eval()
            /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*(?:eval|new Function)\b/,
            // fn_name() {
            /\b(?!(?:if|for|switch|while|with|catch)\b)(?:(?:static)\s+)?(\S+)\s*\(.*?\)\s*\{/,
            // {name} = () => {
            /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*\(.*?\)\s*=>/
        ];
        var lines = source.split('\n');

        // Walk backwards in the source lines until we find the line which matches one of the patterns above
        var code = '';
        var maxLines = Math.min(lineNumber, 20);
        for (var i = 0; i < maxLines; ++i) {
            // lineNo is 1-based, source[] is 0-based
            var line = lines[lineNumber - i - 1];
            var commentPos = line.indexOf('//');
            if (commentPos >= 0) {
                line = line.substr(0, commentPos);
            }

            if (line) {
                code = line + code;
                var len = syntaxes.length;
                for (var index = 0; index < len; index++) {
                    var m = syntaxes[index].exec(code);
                    if (m && m[1]) {
                        return m[1];
                    }
                }
            }
        }
        return undefined;
    }

    function _ensureSupportedEnvironment() {
        if (typeof Object.defineProperty !== 'function' || typeof Object.create !== 'function') {
            throw new Error('Unable to consume source maps in older browsers');
        }
    }

    function _ensureStackFrameIsLegit(stackframe) {
        if (typeof stackframe !== 'object') {
            throw new TypeError('Given StackFrame is not an object');
        } else if (typeof stackframe.fileName !== 'string') {
            throw new TypeError('Given file name is not a String');
        } else if (typeof stackframe.lineNumber !== 'number' ||
            stackframe.lineNumber % 1 !== 0 ||
            stackframe.lineNumber < 1) {
            throw new TypeError('Given line number must be a positive integer');
        } else if (typeof stackframe.columnNumber !== 'number' ||
            stackframe.columnNumber % 1 !== 0 ||
            stackframe.columnNumber < 0) {
            throw new TypeError('Given column number must be a non-negative integer');
        }
        return true;
    }

    function _findSourceMappingURL(source) {
        var sourceMappingUrlRegExp = /\/\/[#@] ?sourceMappingURL=([^\s'"]+)\s*$/mg;
        var lastSourceMappingUrl;
        var matchSourceMappingUrl;
        while (matchSourceMappingUrl = sourceMappingUrlRegExp.exec(source)) { // jshint ignore:line
            lastSourceMappingUrl = matchSourceMappingUrl[1];
        }
        if (lastSourceMappingUrl) {
            return lastSourceMappingUrl;
        } else {
            throw new Error('sourceMappingURL not found');
        }
    }

    function _extractLocationInfoFromSourceMapSource(stackframe, sourceMapConsumer, sourceCache) {
        return new Promise(function(resolve, reject) {
            var loc = sourceMapConsumer.originalPositionFor({
                line: stackframe.lineNumber,
                column: stackframe.columnNumber
            });

            if (loc.source) {
                // cache mapped sources
                var mappedSource = sourceMapConsumer.sourceContentFor(loc.source);
                if (mappedSource) {
                    sourceCache[loc.source] = mappedSource;
                }

                resolve(
                    // given stackframe and source location, update stackframe
                    new StackFrame({
                        functionName: loc.name || stackframe.functionName,
                        args: stackframe.args,
                        fileName: loc.source,
                        lineNumber: loc.line,
                        columnNumber: loc.column
                    }));
            } else {
                reject(new Error('Could not get original source for given stackframe and source map'));
            }
        });
    }

    /**
     * @constructor
     * @param {Object} opts
     *      opts.sourceCache = {url: "Source String"} => preload source cache
     *      opts.sourceMapConsumerCache = {/path/file.js.map: SourceMapConsumer}
     *      opts.offline = True to prevent network requests.
     *              Best effort without sources or source maps.
     *      opts.ajax = Promise returning function to make X-Domain requests
     */
    return function StackTraceGPS(opts) {
        if (!(this instanceof StackTraceGPS)) {
            return new StackTraceGPS(opts);
        }
        opts = opts || {};

        this.sourceCache = opts.sourceCache || {};
        this.sourceMapConsumerCache = opts.sourceMapConsumerCache || {};

        this.ajax = opts.ajax || _xdr;

        this._atob = opts.atob || _atob;

        this._get = function _get(location) {
            return new Promise(function(resolve, reject) {
                var isDataUrl = location.substr(0, 5) === 'data:';
                if (this.sourceCache[location]) {
                    resolve(this.sourceCache[location]);
                } else if (opts.offline && !isDataUrl) {
                    reject(new Error('Cannot make network requests in offline mode'));
                } else {
                    if (isDataUrl) {
                        // data URLs can have parameters.
                        // see http://tools.ietf.org/html/rfc2397
                        var supportedEncodingRegexp =
                            /^data:application\/json;([\w=:"-]+;)*base64,/;
                        var match = location.match(supportedEncodingRegexp);
                        if (match) {
                            var sourceMapStart = match[0].length;
                            var encodedSource = location.substr(sourceMapStart);
                            var source = this._atob(encodedSource);
                            this.sourceCache[location] = source;
                            resolve(source);
                        } else {
                            reject(new Error('The encoding of the inline sourcemap is not supported'));
                        }
                    } else {
                        var xhrPromise = this.ajax(location, {method: 'get'});
                        // Cache the Promise to prevent duplicate in-flight requests
                        this.sourceCache[location] = xhrPromise;
                        xhrPromise.then(resolve, reject);
                    }
                }
            }.bind(this));
        };

        /**
         * Creating SourceMapConsumers is expensive, so this wraps the creation of a
         * SourceMapConsumer in a per-instance cache.
         *
         * @param {String} sourceMappingURL = URL to fetch source map from
         * @param {String} defaultSourceRoot = Default source root for source map if undefined
         * @returns {Promise} that resolves a SourceMapConsumer
         */
        this._getSourceMapConsumer = function _getSourceMapConsumer(sourceMappingURL, defaultSourceRoot) {
            return new Promise(function(resolve, reject) {
                if (this.sourceMapConsumerCache[sourceMappingURL]) {
                    resolve(this.sourceMapConsumerCache[sourceMappingURL]);
                } else {
                    var sourceMapConsumerPromise = new Promise(function(resolve, reject) {
                        return this._get(sourceMappingURL).then(function(sourceMapSource) {
                            if (typeof sourceMapSource === 'string') {
                                sourceMapSource = _parseJson(sourceMapSource.replace(/^\)\]\}'/, ''));
                            }
                            if (typeof sourceMapSource.sourceRoot === 'undefined') {
                                sourceMapSource.sourceRoot = defaultSourceRoot;
                            }

                            resolve(new SourceMap.SourceMapConsumer(sourceMapSource));
                        }, reject);
                    }.bind(this));
                    this.sourceMapConsumerCache[sourceMappingURL] = sourceMapConsumerPromise;
                    resolve(sourceMapConsumerPromise);
                }
            }.bind(this));
        };

        /**
         * Given a StackFrame, enhance function name and use source maps for a
         * better StackFrame.
         *
         * @param {StackFrame} stackframe object
         * @returns {Promise} that resolves with with source-mapped StackFrame
         */
        this.pinpoint = function StackTraceGPS$$pinpoint(stackframe) {
            return new Promise(function(resolve, reject) {
                this.getMappedLocation(stackframe).then(function(mappedStackFrame) {
                    function resolveMappedStackFrame() {
                        resolve(mappedStackFrame);
                    }

                    this.findFunctionName(mappedStackFrame)
                        .then(resolve, resolveMappedStackFrame)
                        ['catch'](resolveMappedStackFrame);
                }.bind(this), reject);
            }.bind(this));
        };

        /**
         * Given a StackFrame, guess function name from location information.
         *
         * @param {StackFrame} stackframe
         * @returns {Promise} that resolves with enhanced StackFrame.
         */
        this.findFunctionName = function StackTraceGPS$$findFunctionName(stackframe) {
            return new Promise(function(resolve, reject) {
                _ensureStackFrameIsLegit(stackframe);
                this._get(stackframe.fileName).then(function getSourceCallback(source) {
                    var lineNumber = stackframe.lineNumber;
                    var columnNumber = stackframe.columnNumber;
                    var guessedFunctionName = _findFunctionName(source, lineNumber, columnNumber);
                    // Only replace functionName if we found something
                    if (guessedFunctionName) {
                        resolve(new StackFrame({
                            functionName: guessedFunctionName,
                            args: stackframe.args,
                            fileName: stackframe.fileName,
                            lineNumber: lineNumber,
                            columnNumber: columnNumber
                        }));
                    } else {
                        resolve(stackframe);
                    }
                }, reject)['catch'](reject);
            }.bind(this));
        };

        /**
         * Given a StackFrame, seek source-mapped location and return new enhanced StackFrame.
         *
         * @param {StackFrame} stackframe
         * @returns {Promise} that resolves with enhanced StackFrame.
         */
        this.getMappedLocation = function StackTraceGPS$$getMappedLocation(stackframe) {
            return new Promise(function(resolve, reject) {
                _ensureSupportedEnvironment();
                _ensureStackFrameIsLegit(stackframe);

                var sourceCache = this.sourceCache;
                var fileName = stackframe.fileName;
                this._get(fileName).then(function(source) {
                    var sourceMappingURL = _findSourceMappingURL(source);
                    var isDataUrl = sourceMappingURL.substr(0, 5) === 'data:';
                    var defaultSourceRoot = fileName.substring(0, fileName.lastIndexOf('/') + 1);

                    if (sourceMappingURL[0] !== '/' && !isDataUrl && !(/^https?:\/\/|^\/\//i).test(sourceMappingURL)) {
                        sourceMappingURL = defaultSourceRoot + sourceMappingURL;
                    }

                    return this._getSourceMapConsumer(sourceMappingURL, defaultSourceRoot)
                        .then(function(sourceMapConsumer) {
                            return _extractLocationInfoFromSourceMapSource(stackframe, sourceMapConsumer, sourceCache)
                                .then(resolve)['catch'](function() {
                                resolve(stackframe);
                            });
                        });
                }.bind(this), reject)['catch'](reject);
            }.bind(this));
        };
    };
}));

},{"source-map/lib/source-map-consumer":31,"stackframe":25}],34:[function(require,module,exports){
(function(root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define('stacktrace', ['error-stack-parser', 'stack-generator', 'stacktrace-gps'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('error-stack-parser'), require('stack-generator'), require('stacktrace-gps'));
    } else {
        root.StackTrace = factory(root.ErrorStackParser, root.StackGenerator, root.StackTraceGPS);
    }
}(this, function StackTrace(ErrorStackParser, StackGenerator, StackTraceGPS) {
    var _options = {
        filter: function(stackframe) {
            // Filter out stackframes for this library by default
            return (stackframe.functionName || '').indexOf('StackTrace$$') === -1 &&
                (stackframe.functionName || '').indexOf('ErrorStackParser$$') === -1 &&
                (stackframe.functionName || '').indexOf('StackTraceGPS$$') === -1 &&
                (stackframe.functionName || '').indexOf('StackGenerator$$') === -1;
        },
        sourceCache: {}
    };

    var _generateError = function StackTrace$$GenerateError() {
        try {
            // Error must be thrown to get stack in IE
            throw new Error();
        } catch (err) {
            return err;
        }
    };

    /**
     * Merge 2 given Objects. If a conflict occurs the second object wins.
     * Does not do deep merges.
     *
     * @param {Object} first base object
     * @param {Object} second overrides
     * @returns {Object} merged first and second
     * @private
     */
    function _merge(first, second) {
        var target = {};

        [first, second].forEach(function(obj) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    target[prop] = obj[prop];
                }
            }
            return target;
        });

        return target;
    }

    function _isShapedLikeParsableError(err) {
        return err.stack || err['opera#sourceloc'];
    }

    function _filtered(stackframes, filter) {
        if (typeof filter === 'function') {
            return stackframes.filter(filter);
        }
        return stackframes;
    }

    return {
        /**
         * Get a backtrace from invocation point.
         *
         * @param {Object} opts
         * @returns {Array} of StackFrame
         */
        get: function StackTrace$$get(opts) {
            var err = _generateError();
            return _isShapedLikeParsableError(err) ? this.fromError(err, opts) : this.generateArtificially(opts);
        },

        /**
         * Get a backtrace from invocation point.
         * IMPORTANT: Does not handle source maps or guess function names!
         *
         * @param {Object} opts
         * @returns {Array} of StackFrame
         */
        getSync: function StackTrace$$getSync(opts) {
            opts = _merge(_options, opts);
            var err = _generateError();
            var stack = _isShapedLikeParsableError(err) ? ErrorStackParser.parse(err) : StackGenerator.backtrace(opts);
            return _filtered(stack, opts.filter);
        },

        /**
         * Given an error object, parse it.
         *
         * @param {Error} error object
         * @param {Object} opts
         * @returns {Promise} for Array[StackFrame}
         */
        fromError: function StackTrace$$fromError(error, opts) {
            opts = _merge(_options, opts);
            var gps = new StackTraceGPS(opts);
            return new Promise(function(resolve) {
                var stackframes = _filtered(ErrorStackParser.parse(error), opts.filter);
                resolve(Promise.all(stackframes.map(function(sf) {
                    return new Promise(function(resolve) {
                        function resolveOriginal() {
                            resolve(sf);
                        }

                        gps.pinpoint(sf).then(resolve, resolveOriginal)['catch'](resolveOriginal);
                    });
                })));
            }.bind(this));
        },

        /**
         * Use StackGenerator to generate a backtrace.
         *
         * @param {Object} opts
         * @returns {Promise} of Array[StackFrame]
         */
        generateArtificially: function StackTrace$$generateArtificially(opts) {
            opts = _merge(_options, opts);
            var stackFrames = StackGenerator.backtrace(opts);
            if (typeof opts.filter === 'function') {
                stackFrames = stackFrames.filter(opts.filter);
            }
            return Promise.resolve(stackFrames);
        },

        /**
         * Given a function, wrap it such that invocations trigger a callback that
         * is called with a stack trace.
         *
         * @param {Function} fn to be instrumented
         * @param {Function} callback function to call with a stack trace on invocation
         * @param {Function} errback optional function to call with error if unable to get stack trace.
         * @param {Object} thisArg optional context object (e.g. window)
         */
        instrument: function StackTrace$$instrument(fn, callback, errback, thisArg) {
            if (typeof fn !== 'function') {
                throw new Error('Cannot instrument non-function object');
            } else if (typeof fn.__stacktraceOriginalFn === 'function') {
                // Already instrumented, return given Function
                return fn;
            }

            var instrumented = function StackTrace$$instrumented() {
                try {
                    this.get().then(callback, errback)['catch'](errback);
                    return fn.apply(thisArg || this, arguments);
                } catch (e) {
                    if (_isShapedLikeParsableError(e)) {
                        this.fromError(e).then(callback, errback)['catch'](errback);
                    }
                    throw e;
                }
            }.bind(this);
            instrumented.__stacktraceOriginalFn = fn;

            return instrumented;
        },

        /**
         * Given a function that has been instrumented,
         * revert the function to it's original (non-instrumented) state.
         *
         * @param {Function} fn to de-instrument
         */
        deinstrument: function StackTrace$$deinstrument(fn) {
            if (typeof fn !== 'function') {
                throw new Error('Cannot de-instrument non-function object');
            } else if (typeof fn.__stacktraceOriginalFn === 'function') {
                return fn.__stacktraceOriginalFn;
            } else {
                // Function not instrumented, return original
                return fn;
            }
        },

        /**
         * Given an error message and Array of StackFrames, serialize and POST to given URL.
         *
         * @param {Array} stackframes
         * @param {String} url
         * @param {String} errorMsg
         * @param {Object} requestOptions
         */
        report: function StackTrace$$report(stackframes, url, errorMsg, requestOptions) {
            return new Promise(function(resolve, reject) {
                var req = new XMLHttpRequest();
                req.onerror = reject;
                req.onreadystatechange = function onreadystatechange() {
                    if (req.readyState === 4) {
                        if (req.status >= 200 && req.status < 400) {
                            resolve(req.responseText);
                        } else {
                            reject(new Error('POST to ' + url + ' failed with status: ' + req.status));
                        }
                    }
                };
                req.open('post', url);

                // Set request headers
                req.setRequestHeader('Content-Type', 'application/json');
                if (requestOptions && typeof requestOptions.headers === 'object') {
                    var headers = requestOptions.headers;
                    for (var header in headers) {
                        if (headers.hasOwnProperty(header)) {
                            req.setRequestHeader(header, headers[header]);
                        }
                    }
                }

                var reportPayload = {stack: stackframes};
                if (errorMsg !== undefined && errorMsg !== null) {
                    reportPayload.message = errorMsg;
                }

                req.send(JSON.stringify(reportPayload));
            });
        }
    };
}));

},{"error-stack-parser":23,"stack-generator":24,"stacktrace-gps":33}]},{},[5])(5)
});