(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var img = document.createElement('img');

    img.setAttribute('src', './manual/asset/Rx_Logo_M.png');
    img.setAttribute('class', 'wechat-share-log');
    img.setAttribute('style', 'position:absolute;left:-1000px;opacity:0;filter:alpha(opacity=0);');
    document.body.insertBefore(img, document.body.firstElementChild);
  });
})();