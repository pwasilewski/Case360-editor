// ==UserScript==
// @name         Case360 script editor
// @namespace    http://tampermonkey.net/
// @version      0.1
// @author       P. Wasilewski
// @description  Try to take over the world and make it a better place!
// @match        */sonora/Admin?op=i
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @grant        none
// ==/UserScript==

const CASE_EDITOR_ID          = "Script";
const CASE_EDITOR_SELECTOR    = "#" + CASE_EDITOR_ID;
const URL_AJAX_COMPILE_SCRIPT = "CaseAjax?method=ScriptsHelper.compileScript";

const ACE_CDN_URL             = "ace/ace.js";
const ACE_EDITOR_ID           = "editor";
const ACE_EDITOR_SELECTOR     = "#" + ACE_EDITOR_ID;
const ACE_MODE                = "ace/mode/case";
const ACE_THEME               = "ace/theme/piwi";

var done = false;
var scriptName = "";
var editor;
var ace_loaded = false;
var autocomplete_loaded = false;

function GM_compileScript() {
    var ScriptSource = encodeURIComponent(removeCR(editor.getSession().getValue()));
    var nodeId = document.getElementById("scriptNodeId");
    if (nodeId !== null) {
        var requestUrl = URL_AJAX_COMPILE_SCRIPT;
        var params = "nodeID=" + encodeURIComponent(nodeId.value) + "&scriptSource=" + ScriptSource;
        getASyncAjaxResponse(requestUrl, params, GM_getCompileResults);
    }
}

function GM_getCompileResults(objRequestHttp) {
    if (objRequestHttp.readyState == 4 || objRequestHttp.readyState == "complete") {
        if (objRequestHttp.status == 200) {
            var responseXML = objRequestHttp.responseXML;
            GM_showCompileResults(responseXML);
        }
    }
}

function GM_showCompileResults(responseXML) {
    if (responseXML !== null) {
        var errorMsg = responseXML.getElementsByTagName("errormsg");
        o_compileResults = document.getElementById("compileResults");
        var errorNode = errorMsg.item(0).firstChild;
        if (errorNode !== null) {
            var offsetPos = errorNode.nodeValue.lastIndexOf("near offset ");
            var offset = 0;
            var line = 0;
            var linePos = errorNode.nodeValue.lastIndexOf(" in line ");
            if (linePos == -1) {
                if (offsetPos != -1) {
                    offset = parseInt(errorNode.nodeValue.substring(offsetPos + 12));
                }
                line = 1;
            } else {
                if (offsetPos != -1) {
                    offset = parseInt(errorNode.nodeValue.substring(offsetPos + 12, linePos));
                }
                line = parseInt(errorNode.nodeValue.substring(linePos + 9));
            }

            editor.getSession().setAnnotations([{
                row: line-1,
                column: offset,
                text: errorNode.nodeValue,
                type: "error"
            }]);
        } else {
            editor.getSession().clearAnnotations();
        }
    }
}

function GM_wait() {
    if(!ace_loaded)
    { window.setTimeout(GM_wait,100); }
    else {
        if(!autocomplete_loaded) {
            GM_appendAutoCompleteScript();

            if(!autocomplete_loaded)
            { window.setTimeout(GM_wait,100); }

        } else {
            GM_initializeEditor();
        }
    }
}

function GM_appendAceScript() {
    if($("script[src$='ace.js']").length === 0) {
        var ace      = document.createElement('script');
            ace.src  = ACE_CDN_URL;
            ace.type = 'text/javascript';
            ace.onload = function() {
                ace_loaded = true;
            };

        document.getElementsByTagName('head')[0].appendChild(ace);
    }
}

function GM_appendAutoCompleteScript() {
    if($("script[src$='ext-language_tools.js']").length === 0) {
        var ace_lang      = document.createElement('script');
            ace_lang.src  = "ace/ext-language_tools.js";
            ace_lang.type = 'text/javascript';
            ace_lang.onload = function() {
                autocomplete_loaded = true;
            };

        document.getElementsByTagName('head')[0].appendChild(ace_lang);
    }
}

function GM_initializeEditor() {
    var GM_EDITOR       = document.createElement('div');
        GM_EDITOR.id    = ACE_EDITOR_ID;
    $(GM_EDITOR).insertBefore(CASE_EDITOR_SELECTOR);

    var langTools = ace.require("ace/ext/language_tools");
    editor = ace.edit(ACE_EDITOR_ID);
    editor.getSession().setMode(ACE_MODE);
    editor.setTheme(ACE_THEME);

    editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets : true
    });

    editor.commands.addCommand({
        name: "replace",
        bindKey: {win: "Ctrl-S", mac: "Command-S"},
        exec: function(editor) {
            updateSource(false);
        }
    });

    var textarea = $('textarea[id="' + CASE_EDITOR_ID + '"]');
    $(GM_EDITOR).width("100%");
    $(GM_EDITOR).height($("#rightpane").height()-58);
    textarea.hide();

    editor.getSession().setValue(textarea.val());
    editor.getSession().on('change', function(e){
        textarea.val(editor.getSession().getValue());
        scriptChanges();
    });

    editor.getSession().selection.on('changeCursor', function(e, o) {
        compileScript();
        GM_compileScript();
    });

    langTools.addCompleter(scriptsCompleter);
}

var scriptsCompleter = {
    getCompletions: function(editor, session, pos, prefix, callback) {
        if (prefix.length === 0) { callback(null, []); return ;}
        if(!prefix.match(/\.$/)) {
            return;
        }

        $.ajax({
            type: "GET",
            url: "CaseAjax?getmethods="+prefix.slice(0,-1),
            dataType: "xml",
            success: function(xml){
                var completers = [];
                if($(xml).find("responseXML").length == 1) {
                    $(xml).find("class").each(function(){
                        $(this).children().each(function(){
                            var method		= prefix + $(this).text();
                            var methodName 	= method.split('(')[0];
                            var ar 			= method.match(/\((.*?)\)/);

                            if (ar[1].length > 0) {
                                var args = ar[1].split(",");
                                var simplifiedArgs = "";
                                var snippetArgs = "";
                                $.each( args, function( index, value ) {
                                    var arg = value.match(/(.+)\s+(.+)/);

                                    var newArg  = arg[1].split('.').pop() + ' ' + arg[2];
                                    var snippet = '${' + index + ':' + arg[2] + '}';

                                    if(index > 0) {
                                        simplifiedArgs += ',';
                                        snippetArgs += ',';
                                    }

                                    simplifiedArgs += newArg;
                                    snippetArgs += snippet;

                                });

                                simplifiedMethod = methodName + '(' + simplifiedArgs + ')';
                                snippetMethod = methodName + '(' + snippetArgs + ')';

                                completers.push({definition : simplifiedMethod, value : simplifiedMethod, snippet: snippetMethod, score : 1000, meta : 'method', type: 'method'});
                            } else {
                                completers.push({definition : method, value : method, snippet: method, score : 1000, meta : 'method', type: 'method'});
                            }
                        });
                    });
                }

                callback(null, completers); return ;
            }
        });
    },
    getDocTooltip: function(item) {
        if (item.type == 'method' && !item.docHTML) {
            item.docHTML = "<b>" + item.definition + "</b>";
        }
    }
};


$('#rightpane').bind('DOMSubtreeModified', function() {
    script = $('#scriptlocation').val();
    if($(CASE_EDITOR_SELECTOR).length !== 0 && scriptName != script) {

        scriptName = script;

        GM_appendAceScript();

        GM_wait();
    }
});
