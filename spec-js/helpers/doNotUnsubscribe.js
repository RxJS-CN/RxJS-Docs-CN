"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
///<reference path='../../typings/index.d.ts'/>
var Rx = require('../../dist/cjs/Rx');
function doNotUnsubscribe(ob) {
    return ob.lift(new DoNotUnsubscribeOperator());
}
exports.doNotUnsubscribe = doNotUnsubscribe;
var DoNotUnsubscribeOperator = (function () {
    function DoNotUnsubscribeOperator() {
    }
    DoNotUnsubscribeOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new DoNotUnsubscribeSubscriber(subscriber));
    };
    return DoNotUnsubscribeOperator;
}());
var DoNotUnsubscribeSubscriber = (function (_super) {
    __extends(DoNotUnsubscribeSubscriber, _super);
    function DoNotUnsubscribeSubscriber() {
        _super.apply(this, arguments);
    }
    DoNotUnsubscribeSubscriber.prototype.unsubscribe = function () { }; // tslint:disable-line no-empty
    return DoNotUnsubscribeSubscriber;
}(Rx.Subscriber));
//# sourceMappingURL=doNotUnsubscribe.js.map