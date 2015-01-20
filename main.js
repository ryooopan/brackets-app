
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
  var node = null;
  
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
  
  function _keyEventHandler($event, editor, event) {
    // var editor = EditorManager.getFocusedEditor();

    var editor = EditorManager.getCurrentFullEditor();
    
    var cursor = editor.getCursorPos();
    console.log('line: '+cursor.line);
    editor._codeMirror.addLineWidget(cursor.line, node);
    
    socket.emit('line', cursor.line );

    var text = editor.document.getText();
  }
  
  function _activeEditorChangeHandler($event, focusedEditor, lostEditor) {
    if (lostEditor) {
      $(lostEditor).off('keyup', _keyEventHandler);
    }
    if (focusedEditor) {
      $(focusedEditor).on('keyup', _keyEventHandler);
    }
  }

  EditorManager.registerInlineDocsProvider(inlineProvider);
  exports._inlineProvider = inlineProvider;

  AppInit.appReady(function() {
    console.log('MYAPP IS READY');
    // node = document.createElement("div");
    // node.textContent = 'HOGEHOGEHGOE';
    node = new InlineDocsViewer('hoge', 'hoge descript');
    node.load(hostEditor);

    $(EditorManager).on('activeEditorChange', _activeEditorChangeHandler);

    socket.on('line', function(data) {
      var editor = EditorManager.getCurrentFullEditor();
      var line = data;
      editor._codeMirror.addLineWidget(line, node);      
    });
    
    socket.on('msg', function (data) {
      console.log(data);
      var editor = EditorManager.getActiveEditor();
      // editor.setSelection(data.selection);
      editor.setSelection( data.selection.start, data.selection.end );
    });
  });
  
  function handleHelloWorld() {
    var editor = EditorManager.getFocusedEditor();
    if (editor) {
      var insertionPos = editor.getCursorPos();
      var mode = editor.getModeForDocument();
      var lang = editor.document.getLanguage();
      var text = editor.document.getText();
      console.log(mode);
      console.log(lang);
      console.log(text);
      //editor.document.replaceRange("Hello, world!", insertionPos);
    }
  }

  var MY_COMMAND_ID = "helloworld.writehello";   // package-style naming to avoid collisions
  CommandManager.register("Hello World 2", MY_COMMAND_ID, handleHelloWorld);

  var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
  menu.addMenuItem(MY_COMMAND_ID);
});
