
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
  var jsdiff = require('./lib/diff');
  var io = require("./lib/socket.io");
  var socket = io.connect('/');  // http://localhost:8080
  var inlineWidget = null;
  var node = null;
  var text = null;
  var document = null;

  console.log('MYAPP IS READY');
  $('<style>.hoge { background: red; } .fuga { background: red; }</style>').appendTo('head')
  $(EditorManager).on('activeEditorChange', _activeEditorChangeHandler);

  function _activeEditorChangeHandler($event, focusedEditor, lostEditor) {
    if (lostEditor) {
      $(lostEditor).off('keyup', _keyEventHandler);
    }

    if (focusedEditor) {
      var editor = focusedEditor;
      var cursor = editor.getCursorPos();
      var cm = editor._codeMirror;
      window.editor = editor;
      window.cm = cm;
      
      socket.on('refresh', function(data) {
	cm.setValue(data.body);
      });
      socket.on('change', function(data) {
	console.log(data);
	cm.replaceRange(data.text, data.from, data.to);
	cm.addLineClass(data.from.line, 'background', 'hoge');
      });
      socket.on('cursor', function(data) {
	console.log(data);
      });
      
      cm.on('change', function(i, op) {
	//console.log(op);
	cm.addLineClass(op.from.line, 'background', 'fuga');
	socket.emit('change', op);
	socket.emit('refresh', cm.getValue());
      });      
      cm.on('cursorActivity', function(i) {
	socket.emit('cursor', cm.getCursor());
      });
    }
  }
  
  function _keyEventHandler($event, editor, event) {
    var editor = EditorManager.getCurrentFullEditor();
    var cursor = editor.getCursorPos();
    var text = editor.document.getText();    
    // socket.emit('change', { cursor: cursor, change: [] });    
  }
  


});
