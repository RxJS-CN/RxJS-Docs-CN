(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var languageNode = document.createElement('div');
    var tpl = String()
    + '<img src="./manual/asset/chinese.png" class="language-flag" />'
    + '<i class="dropdown-arrow"></i>'
    + '<div class="dropdown-list">'
      + '<ul>'
        + '<li>'
          + '<a href="http://cn.rx.js.org">'
            + '<img src="./manual/asset/chinese.png" class="language-flag" />'
            + '<span>中文</span>'
          + '</a>'
        + '</li>'
        + '<li>'
          + '<a href="http://reactivex.io/rxjs">'
            + '<img src="./manual/asset/english.png" class="language-flag" />'
            + '<span>英文</span>'
          + '</a>'
        + '</li>'
      + '</ul>'
    + '</div>';

    languageNode.className = 'dropdown language-selection';
    languageNode.innerHTML = tpl;
    document.querySelector('header').appendChild(languageNode);
    document.querySelector('.search-box').setAttribute('style', 'right: 70px');
  });
})();