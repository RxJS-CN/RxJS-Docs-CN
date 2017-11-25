var welcomeText = (
  ' ____           _ ____      \n'+
  '|  _ \\ __  __  | / ___|    \n'+
  '| |_) |\\ \\/ /  | \\___ \\  \n'+
  '|  _ <  >  < |_| |___) |    \n'+
  '|_| \\_\\/_/\\_\\___/|____/ \n'+
  '\n试试下面这段代码来开启 RxJS 之旅:\n'+
  '\n    var subscription = Rx.Observable.interval(500)'+
  '.take(4).subscribe(function (x) { console.log(x) });\n'+
  '\n还引入了 rxjs-spy 来帮助你调试 RxJS 代码，试试下面这段代码:\n'+
  '\n    rxSpy.spy();'+
  '\n    var subscription = Rx.Observable.interval(500)'+
  '.tag("interval").subscribe();'+
  '\n    rxSpy.show();'+
  '\n    rxSpy.log("interval");\n'+
  '\n 想了解更多 rxjs-spy 的用法，请查阅 https://zhuanlan.zhihu.com/p/30870431'
);
if (console.info) {
  console.info(welcomeText);
} else {
  console.log(welcomeText);
}
