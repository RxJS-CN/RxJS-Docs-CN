if (typeof NodeList.prototype.forEach !== 'function') {
  NodeList.prototype.forEach = Array.prototype.forEach;
}

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    // 菜单
    var menuMap = {'Home': '首页', 'Manual': '手册', 'Reference': '参考', 'Source': '源码', 'Test': '测试', 'Overview': '概览', 'Installation': '安装', 'Tutorial': '教程', 'Usage': '高级', 'Variable': '变量'};
    var menus = document.querySelectorAll('header > a, .manual-toc-title > a, .manual-breadcrumb-list > a, .manual-breadcrumb-list > span[data-ice=title]');
    
    menus.forEach(translateMenu);
    

    // API 相关
    var tagMap = {'Params:': '参数:', 'Return:': '返回:', 'Example:': '示例:', 'Test:': '测试:', 'See:': '参见:', 'Properties:': '属性:', 'Throw:': '抛出:'};
    var paramTitleMap = {'Name': '名称', 'Type': '类型', 'Attribute': '属性', 'Description': '描述'};
    var selfDetailTitleMap = {'Direct Subclass:': '直接子类:', 'Indirect Subclass:': '间接子类:', 'Test:': '测试:', 'Extends:': '继承:', 'See:': '参见:', 'Example:': '示例:'};
    var summaryTitileMap = {'Static Method Summary': '静态方法汇总', 'Constructor Summary': '构造函数汇总', 'Method Summary': '方法汇总', 'Inherited Summary': '继承汇总', 'Static Public Summary': '静态公有汇总'};
    var summaryTableTitleMap = {'Static Public Methods': '静态公有方法', 'Public Constructor': '公有构造函数', 'Public Constructors': '公有构造函数', 'Public Methods': '公有方法', 'Static Public ': '静态公有'};
    var content = document.querySelector('.content');

    if (content) {
      var methodDetails = content.querySelectorAll('div[data-ice=staticMethodDetails], div[data-ice=methodDetails], div[data-ice=constructorDetails], div[data-ice=details]');
      var headerNotice = content.querySelector('.header-notice');
      var selfDetail = content.querySelector('.self-detail');
      var summary = content.querySelectorAll('div[data-ice=staticMethodSummary], div[data-ice=constructorSummary], div[data-ice=methodSummary]');
      var inheritedSummary = content.querySelector('div[data-ice=inheritedSummary]');

      if (headerNotice) { headerNotice.querySelector('span[data-ice=source] a').innerHTML = '源码'; }
      methodDetails && methodDetails.forEach(function (methods) { 
        var title = methods.querySelector('h2');

        title.innerHTML = summaryTableTitleMap[title.innerHTML];
        methods.querySelectorAll('.detail').forEach(translateMethodDetail); 
      });
      selfDetail && selfDetail.querySelectorAll('h4').forEach(translateSelfDetailTitle);
      summary && summary.forEach(translateSummary);
      inheritedSummary && translateInheritedSummary(inheritedSummary);
      traslateVariableTitle(content);
    }

    function translateInheritedSummary(summary) {
      var title = summary.querySelector('h2');
      var tableTitle = summary.querySelector('table.summary thead td[data-ice=title]');
      var text = tableTitle.querySelector('.toggle').nextSibling;
      var className = tableTitle.querySelector('span a');

      title.innerHTML = summaryTitileMap[title.innerHTML];
      text.nodeValue = '继承自 ';
      className.innerHTML = className.innerHTML + ' 类';
    }

    function translateMenu(menuLink) {
      menuLink.innerHTML = menuMap[menuLink.innerHTML] || menuLink.innerHTML;
    }

    function translateMethodDetail(methodDetail) {
      var tags = methodDetail.querySelectorAll('h4');
      var table = methodDetail.querySelector('table.params');
      var source = methodDetail.querySelector('h3 .right-info a');
     
      tags.forEach(translateTag);
      table && translateParamTable(table);
      source.innerHTML = '源码';
    }

    function translateParamTable(table) {
       var tableTitles = table.querySelectorAll('thead tr td');
       var tableContents = table.querySelectorAll('tbody tr');

       tableTitles.forEach(translateParamsTableTitle);
       tableContents.forEach(translateParamsTableContent);
    }

    function translateSelfDetailTitle(title) {
      title.innerHTML = selfDetailTitleMap[title.innerHTML];
    }

    function translateParamsTableAttribute(attr) {
      if (attr.innerHTML === 'optional') {
        attr.innerHTML = '可选的';
      } else {
        attr.innerHTML = attr.innerHTML.replace(/default:/g, '默认值:');
      }
    }

    function translateParamsTableContent(tr) {
      var appendixs = tr.querySelectorAll('td[data-ice=appendix] > ul > li');
      appendixs.forEach(translateParamsTableAttribute);
    }

    function translateParamsTableTitle(title) {
      title.innerHTML = paramTitleMap[title.innerHTML];
    }

    function translateSummary(summary) {
      var title = summary.querySelector('h2');
      var tableTitle = summary.querySelector('table.summary thead td[data-ice=title]');

      title.innerHTML = summaryTitileMap[title.innerHTML];
      tableTitle.innerHTML = summaryTableTitleMap[tableTitle.innerHTML];
    }

    function translateTag(tag) {
      tag.innerHTML = tagMap[tag.innerHTML];
    }

    function traslateVariableTitle(content) {
      var title = content.querySelector('h1');

      if (title.innerText === 'Variable') {
        var summary = content.querySelector('[data-ice=summaries');
        var summaryTableTitle = summary.querySelector('table.summary thead td');

        summaryTableTitle.innerHTML = summaryTitileMap[summaryTableTitle.innerHTML];
        title.innerHTML = '变量';
      }
    }

  });
})();