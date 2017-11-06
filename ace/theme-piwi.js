ace.define("ace/theme/piwi",["require","exports","module","ace/lib/dom"], function(require, exports, module) {

exports.isDark = true;
exports.cssClass = "ace-piwi";
exports.cssText = ".ace-piwi .ace_gutter {\
background: #000000;\
color: #8F938F\
}\
.ace-piwi .ace_print-margin {\
width: 1px;\
background: #353030\
}\
.ace-piwi {\
background-color: #000000;\
color: #d4d4d4\
}\
.ace-piwi .ace_cursor {\
color: #A7A7A7\
}\
.ace-piwi .ace_marker-layer .ace_selection {\
background: rgba(221, 240, 255, 0.20)\
}\
.ace-piwi.ace_multiselect .ace_selection.ace_start {\
box-shadow: 0 0 3px 0px #2C2828;\
}\
.ace-piwi .ace_marker-layer .ace_step {\
background: rgb(102, 82, 0)\
}\
.ace-piwi .ace_marker-layer .ace_bracket {\
margin: -1px 0 0 -1px;\
border: 1px solid rgba(255, 255, 255, 0.25)\
}\
.ace-piwi .ace_marker-layer .ace_active-line {\
background: rgba(255, 255, 255, 0.031)\
}\
.ace-piwi .ace_gutter-active-line {\
background-color: rgba(255, 255, 255, 0.031)\
}\
.ace-piwi .ace_marker-layer .ace_selected-word {\
border: 1px solid rgba(221, 240, 255, 0.20)\
}\
.ace-piwi .ace_invisible {\
color: rgba(255, 255, 255, 0.25)\
}\
.ace-piwi .ace_identifier {\
color: #9cdcfe\
}\
.ace-piwi .ace_keyword,\
.ace-piwi .ace_meta {\
color: #C586C0\
}\
.ace-piwi .ace_constant,\
.ace-piwi .ace_constant.ace_character,\
.ace-piwi .ace_constant.ace_character.ace_escape,\
.ace-piwi .ace_constant.ace_other {\
color: #4FB7C5\
}\
.ace-piwi .ace_keyword.ace_operator {\
color: #d4d4d4\
}\
.ace-piwi .ace_constant.ace_character {\
color: #AFA472\
}\
.ace-piwi .ace_constant.ace_language {\
color: #569cd6\
}\
.ace-piwi .ace_constant.ace_numeric {\
color: #CCCCCC\
}\
.ace-piwi .ace_invalid,\
.ace-piwi .ace_invalid.ace_illegal {\
color: #F8F8F8;\
background-color: rgba(86, 45, 86, 0.75)\
}\
.ace-piwi .ace_invalid.ace_deprecated {\
text-decoration: underline;\
font-style: italic;\
color: #D2A8A1\
}\
.ace-piwi .ace_fold {\
background-color: #757aD8;\
border-color: #8F938F\
}\
.ace-piwi .ace_support.ace_function {\
color: #4EC9B0\
}\
.ace-piwi .ace_string {\
color: #ce9178\
}\
.ace-piwi .ace_string.ace_regexp {\
color: #E9C062\
}\
.ace-piwi .ace_comment {\
color: #608b4e\
}\
.ace-piwi .ace_variable {\
color: #BEBF55\
}\
.ace-piwi .ace_variable.ace_language {\
color: #DCDCAA\
}\
.ace-piwi .ace_xml-pe {\
color: #494949\
}\
.ace-piwi .ace_indent-guide {\
background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWNgYGBgYIiPj/8PAARgAh2NTMh8AAAAAElFTkSuQmCC) right repeat-y\
}";

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});
