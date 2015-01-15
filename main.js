
/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */

/** Simple extension that adds a "File > Hello World" menu item. Inserts "Hello, world!" at cursor pos. */
define(function (require, exports, module) {
  "use strict";

  var AppInit        = brackets.getModule("utils/AppInit"),
      CommandManager = brackets.getModule("command/CommandManager"),
      EditorManager  = brackets.getModule("editor/EditorManager"),
      KeyEvent       = brackets.getModule("utils/KeyEvent"),
      Menus          = brackets.getModule("command/Menus");

  function _keyEventHandler($event, editor, event) {
    var editor = EditorManager.getFocusedEditor();
    if (editor) {
      var text = editor.document.getText();
      console.log(text);
    }
  }

  function _activeEditorChangeHandler($event, focusedEditor, lostEditor) {
    if (lostEditor) {
      $(lostEditor).off('keydown', _keyEventHandler);
    }
    if (focusedEditor) {
      $(focusedEditor).on('keydown', _keyEventHandler);
    }
  }
  
  AppInit.appReady(function() {
    console.log('MYAPP IS READY');
    var currentEditor = EditorManager.getActiveEditor();
    $(currentEditor).on('keydown', _keyEventHandler);
    $(EditorManager).on('activeEditorChange', _activeEditorChangeHandler);
  });
  
  // $(EditorManager.getCurrentFullEditor()).on('keyEvent', _handleKeyEvent);

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

  // Then create a menu item bound to the command
  // The label of the menu item is the name we gave the command (see above)
  var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
  menu.addMenuItem(MY_COMMAND_ID);
});
