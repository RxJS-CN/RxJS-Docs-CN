if (typeof NodeList.prototype.forEach !== 'function') {
  NodeList.prototype.forEach = Array.prototype.forEach;
}

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var allHeaders = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    var content = document.querySelector('.content .github-markdown div[data-ice=content]');
    var navs = document.querySelectorAll('nav.navigation .manual-toc-root div[data-ice=manual]');
    var contentCount, navCount;

    content && allHeaders.forEach(loopHeaders);

    function loopHeaders(headerName) {
      var headers = content.querySelectorAll(headerName);

      contentCount = 1;
      headers && headers.forEach(updateHeaderHash);

      navs.forEach(function (nav) {
        var links = nav.querySelectorAll('ul.manual-toc > li[class=indent-' + headerName + ']');

        navCount = 1;
        links && links.forEach(function (link) {
          var a = link.querySelector('a');
          var href = a.getAttribute('href');

          href = href.split('#')[0] + '#' + headerName + navCount++;
          a.setAttribute('href', href);
        });
      });
    }

    function updateHeaderHash(header) {
      header.setAttribute('id', header.nodeName.toLowerCase() + contentCount++);
    }

  });
})();