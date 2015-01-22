
/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */

/** Simple extension that adds a "File > Hello World" menu item. Inserts "Hello, world!" at cursor pos. */
define(function (require, exports, module) {
  "use strict";

  var AppInit         = brackets.getModule("utils/AppInit"),
      CommandManager  = brackets.getModule("command/CommandManager"),
      DocumentManager = brackets.getModule("document/DocumentManager"),
      EditorManager   = brackets.getModule("editor/EditorManager"),
      FileSystem      = brackets.getModule("filesystem/FileSystem"),
      FileUtils       = brackets.getModule("file/FileUtils"),
      KeyEvent        = brackets.getModule("utils/KeyEvent"),
      Menus           = brackets.getModule("command/Menus"),
      QuickOpen       = brackets.getModule("search/QuickOpen");  

  var InlineDocsViewer = require("InlineDocsViewer");
  var io = require("./lib/socket.io");
  var socket = io.connect('http://localhost:8080');    
  var inlineWidget = null;
  var node = null;
  
  function _keyEventHandler($event, editor, event) {
    // var editor = EditorManager.getFocusedEditor();

    var editor = EditorManager.getCurrentFullEditor();
    var cursor = editor.getCursorPos();
    var text = editor.document.getText();
    editor._codeMirror.addLineWidget(cursor.line, node, { coverGutter: true, noHScroll: true });
    socket.emit('pos', cursor );

  }
  
  AppInit.appReady(function() {
    console.log('MYAPP IS READY');
    $(EditorManager).on('activeEditorChange', _activeEditorChangeHandler);

    socket.on('msg', function (data) {
      $('#list').prepend('<li>' + data.text + '</li>');
      editor._codeMirror.addLineWidget(data.cursor.line, node, { coverGutter: true, noHScroll: true });
      console.log(data.selection);
    });

    socket.on('pos', function(data) {
      var editor = EditorManager.getCurrentFullEditor();
      var cursor = data;
      editor._codeMirror.addLineWidget(cursor.line, node);      
    });
    
    /*
    socket.on('msg', function (data) {
      console.log(data);
      var editor = EditorManager.getActiveEditor();
      // editor.setSelection(data.selection);
      editor.setSelection( data.selection.start, data.selection.end );
    });
    */
  });

  function _activeEditorChangeHandler($event, focusedEditor, lostEditor) {
    if (lostEditor) {
      $(lostEditor).off('keyup', _keyEventHandler);
    }
    if (focusedEditor) {


      
      var editor = focusedEditor;
      //var document = DocumentManager.getCurrentDocument();
      window.editor = editor;
      /**
       * change = [
       *   Object {from: e.Pos, to: e.Pos, text: Array[1], removed: Array[1], origin: "+delete"}
       * ]
       */

      editor._codeMirror.addSelection({line: 0, ch: 0}, {line: 3, ch: 3});
      editor._codeMirror.extendSelection({line: 0, ch: 0}, {line: 3, ch: 3});
      
      $(editor.document).on('change', function($event, document, change) {
	console.log($event);
	console.log(document);
	window.change = change;
	console.log(change[0]);
	console.log(change.from);
	console.log(change.to);
	console.log(change.text);
      });
      

      /*
      node = window.document.createElement('div')
      var html = $(node).addClass("inline-widget").attr("tabindex", "-1");
      html.append("<div class='shadow top' />")
        .append("<div class='shadow bottom' />")
        .append("<a href='#' class='close no-focus'>&times;</a>");

      var embed = require("text!InlineDocsViewer.html");
      html.append(embed);
      html.one('click', function() {
	console.log('Ready for chatting');

	$('#chat-form').submit( function(event) {
	  event.preventDefault();
	  var $input = $('input', this);
	  var text = $input.val();
	  var selection = editor.getSelection();
	  var cursor = editor.getCursorPos();
	  socket.emit('msg', { text : text, pos: cursor, selection: selection });
	  $input.val('').focus();
	});

    

      });
      */
      $(focusedEditor).on('keyup', _keyEventHandler);
    }
  }

  EditorManager.registerInlineDocsProvider(inlineProvider);
  exports._inlineProvider = inlineProvider;

  function inlineProvider(hostEditor, pos) {
    var result = new $.Deferred();
    
    var currentDoc = DocumentManager.getCurrentDocument().getText();
    var docDir = FileUtils.getDirectoryPath(hostEditor.document.file.fullPath);
    var langId = hostEditor.getLanguageForSelection().getId();

    var inlineWidget = new InlineDocsViewer('hoge', 'hoge descript');
    inlineWidget.load(hostEditor);
    result.resolve(inlineWidget);
    
    return result.promise();

  }
  


});
