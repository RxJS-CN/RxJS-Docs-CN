(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var header = document.querySelector('header');
    var githubNode = header.querySelector('.repo-url-github');
    var aboutNode = document.createElement('a');
    var textNode = document.createTextNode('关于中文版');

    aboutNode.setAttribute('href', 'about.html');
    aboutNode.appendChild(textNode);
    header.insertBefore(aboutNode, githubNode);
  });
})();