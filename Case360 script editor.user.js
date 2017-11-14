	// ==UserScript==
	// @name         Case360 script editor
	// @namespace    http://tampermonkey.net/
	// @version      0.2
	// @author       P. Wasilewski
	// @description  Try to take over the world and make it a better place!
	// @match        */sonora/Admin?op=i
	// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
	// @require      https://openuserjs.org/src/libs/sizzle/GM_config.js
	// @grant        GM_getValue
	// @grant        GM_setValue
	// @grant        GM_log
	// @grant        GM_registerMenuCommand
	// ==/UserScript==

	GM_config.init({
		'id'     : 'GM_config',
		'title'  : 'Case360 script editor config',
		'fields' : {
			'theme' : {
				'label'   : 'Theme',
				'type'    : 'select',
				'default' : 'piwi',
				'options' : ['ambiance',
							 'chaos',
							 'chrome',
							 'clouds',
							 'clouds_midnight',
							 'cobalt',
							 'crimson_editor',
							 'dawn',
							 'dracula',
							 'dreamweaver',
							 'eclipse',
							 'github',
							 'gob',
							 'gruvbox',
							 'idle_fingers',
							 'iplastic',
							 'katzenmilch',
							 'kr_theme',
							 'kuroir',
							 'merbivore',
							 'merbivore_soft',
							 'monokai',
							 'mono_industrial',
							 'notepad',
							 'pastel_on_dark',
							 'piwi',
							 'solarized_dark',
							 'solarized_light',
							 'sqlserver',
							 'terminal',
							 'textmate',
							 'tomorrow',
							 'tomorrow_night',
							 'tomorrow_night_blue',
							 'tomorrow_night_bright',
							 'tomorrow_night_eighties',
							 'twilight',
							 'vibrant_ink',
							 'xcode']
			},
			'hline': {
				'label': 'Show horizontal line',
				'type': 'checkbox',
				'default': true
			}
		}
	});

	GM_registerMenuCommand("Configure Case360 script editor", function(){
	  GM_config.open();
	});

	const CASE_EDITOR_ID          = "Script";
	const CASE_EDITOR_SELECTOR    = "#" + CASE_EDITOR_ID;
	const URL_AJAX_COMPILE_SCRIPT = "CaseAjax?method=ScriptsHelper.compileScript";

	const ACE_CDN_URL             = "ace/ace.js";
	const ACE_EDITOR_ID           = "editor";
	const ACE_EDITOR_SELECTOR     = "#" + ACE_EDITOR_ID;
	const ACE_MODE                = "ace/mode/case";
	const ACE_THEME               = "ace/theme/" + GM_config.get("theme");

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
	}

	$('#rightpane').bind('DOMSubtreeModified', function() {
		script = $('#scriptlocation').val();
		if($(CASE_EDITOR_SELECTOR).length !== 0 && scriptName != script) {

			scriptName = script;

			GM_appendAceScript();

			GM_wait();
		}
	});
