// ==UserScript==
// @name         Case360 script editor
// @namespace    http://tampermonkey.net/
// @version      0.3
// @author       P. Wasilewski
// @collaborator B. Bergs
// @collaborator J. Elsen
// @description  Try to take over the world and make it a better place!
// @match        */sonora/Admin?op=i
// @supportURL   https://github.com/pwasilewski/Case360-editor
// @updateURL    https://raw.githubusercontent.com/pwasilewski/Case360-editor/master/Case360%20script%20editor.user.js
// @downloadURL  https://raw.githubusercontent.com/pwasilewski/Case360-editor/master/Case360%20script%20editor.user.js
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @require      https://openuserjs.org/src/libs/sizzle/GM_config.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_log
// @grant        GM_registerMenuCommand
// ==/UserScript==

const ACE_CONFIG = '{"id":"GM_config","title":"Case360 script editor config","fields":{"repository":{"label":"Ace repository","type":"text","default":"ace/"},"theme":{"label":"Theme","type":"select","default":"piwi","options":["ambiance","chaos","chrome","clouds","clouds_midnight","cobalt","crimson_editor","dawn","dracula","dreamweaver","eclipse","github","gob","gruvbox","idle_fingers","iplastic","katzenmilch","kr_theme","kuroir","merbivore","merbivore_soft","monokai","mono_industrial","notepad","pastel_on_dark","piwi","solarized_dark","solarized_light","sqlserver","terminal","textmate","tomorrow","tomorrow_night","tomorrow_night_blue","tomorrow_night_bright","tomorrow_night_eighties","twilight","vibrant_ink","xcode"]},"hline":{"label":"Show horizontal line","type":"checkbox","default":true}}}';

GM_config.init($.parseJSON (ACE_CONFIG));

GM_registerMenuCommand("Configure Case360 script editor", function(){
  GM_config.open();
});

const CASE_EDITOR_ID          = "Script";
const CASE_EDITOR_SELECTOR    = "#" + CASE_EDITOR_ID;
const URL_AJAX_COMPILE_SCRIPT = "CaseAjax?method=ScriptsHelper.compileScript";

const ACE_REPOSITORY          = GM_config.get("repository");
const ACE_CDN_URL             = ACE_REPOSITORY + "ace.js";
const ACE_LANG_CDN_URL        = ACE_REPOSITORY + "ext-language_tools.js";
const ACE_EDITOR_ID           = "editor";
const ACE_EDITOR_SELECTOR     = "#" + ACE_EDITOR_ID;
const ACE_MODE                = "ace/mode/case";
const ACE_THEME               = "ace/theme/" + GM_config.get("theme");

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
            ace_lang.src  = ACE_LANG_CDN_URL;
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
        enableSnippets : true,
        showPrintMargin : GM_config.get("hline")
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
        if(prefix.split(".") < 2) {
            return;
        }

        prefix = prefix.substring(0, prefix.lastIndexOf("."));

        $.ajax({
            type: "GET",
            url: "CaseAjax?getmethods=" + prefix,
            dataType: "xml",
            success: function(xml){
                var completers = [];
                if($(xml).find("responseXML").length == 1) {
                    $(xml).find("class").each(function(){
                        $(this).children().each(function(){
                            var method		= prefix + "." + $(this).text();
                            var methodName 	= method.split('(')[0];
                            var args		= method.match(/\((.*?)\)/)[1];

                            simplifiedMethod = getSimplifiedMethodFormat(methodName, args);
                            snippetMethod = getSnippetMethodFormat(methodName, args);
                            completers.push({definition : simplifiedMethod, value : simplifiedMethod, snippet: snippetMethod, score : 1000, meta : 'method', type: 'method'});
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
    var script = $('#scriptlocation').val();
    if($(CASE_EDITOR_SELECTOR).length !== 0 && scriptName != script) {

        scriptName = script;

        GM_appendAceScript();

        GM_wait();
    }
});

/**
 * Function to format the list of params and remove useless extension.
 *
 * E.g.: TST.updateActor(Object.PropertyManager.RepositoryObject.FormData actorFormdata, Object.PropertyManager.FmsRow updatedRow)
 *
 * @param {String} methodName The method name (e.g.: TST.updateActor)
 * @param {String} argumentsString The list of arguments (e.g.: Object.PropertyManager.RepositoryObject.FormData actorFormdata, Object.PropertyManager.FmsRow updatedRow)
 *
 * @return {String} The format string. (e.g.: TST.updateActor(FormData actorFormdata, FmsRow updatedRow))
 */
function getSimplifiedMethodFormat(methodName, argumentsString) {
    var result = [];
    var simplified = [];
    var args = argumentsString.split(",");

    $.each( args, function( index, value ) {
        var splitedArg = value.match(/(.+)\s+(.+)/);
        if(splitedArg !== null) {
            simplified.push(splitedArg[1].split('.').pop() + ' ' + splitedArg[2]);
        }
    });

    result.push(methodName, "(", simplified.join(", ") ,")");
    return result.join("");
}

/**
 * Function to format the list of params allowing snippets and remove useless extension.
 *
 * E.g.: TST.updateActor(Object.PropertyManager.RepositoryObject.FormData actorFormdata, Object.PropertyManager.FmsRow updatedRow)
 *
 * @param {String} methodName The method name (e.g.: TST.updateActor)
 * @param {String} argumentsString The list of arguments (e.g.: Object.PropertyManager.RepositoryObject.FormData actorFormdata, Object.PropertyManager.FmsRow updatedRow)
 *
 * @return {String} The format string. (e.g.: TST.updateActor(${1:actorFormdata}, ${2:updatedRow}))
 */
function getSnippetMethodFormat(methodName, argumentsString) {
    var result = [];
    var snippet = [];
    var args = argumentsString.split(",");

    $.each( args, function( index, value ) {
        var splitedArg = value.match(/(.+)\s+(.+)/);
        if(splitedArg !== null) {
            snippet.push('${' + (index+1) + ':' + splitedArg[2] + '}');
        }
    });

    result.push(methodName, "(", snippet.join(", ") ,")");
    return result.join("");
}
