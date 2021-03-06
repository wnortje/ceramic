/* JavaScript code for the main process */

var app = require('app');
var ipc = require('ipc');
var readline = require('readline');
var BrowserWindow = require('browser-window');

require('crash-reporter').start();

/* Events */

function writeEvent(object) {
  process.stdout.write('JSON ' + JSON.stringify(object) + '\n');
};

function eventAllClosed() {
  writeEvent({ "event": "all-closed" });
};

function eventIPC(message) {
  writeEvent({ "event": "async", "msg": message });
};

/* IPC */

const CHANNEL = 'ceramic-channel';

ipc.on(CHANNEL, function(event, object) {
  /* When receiving an asynchronous message, we write it to stdout as an async
     event. */
  eventIPC(object);
});

/* Commands */

// Windows

var window_db = {};

//// Management

function windowCreate(name, options) {
  window_db[name] = new BrowserWindow(options);
  window_db[name].on('closed', function() {
    window_db[name] = null;
  });
};

function windowClose(name) {
  window_db[name].close();
};

function windowDestroy(name) {
  window_db[name].destroy();
};

//// IPC

function windowSendMessage(name, message) {
  window_db[name].webContents.send(CHANNEL, message);
};

//// Display

function windowShow(name) {
  window_db[name].show();
};

function windowHide(name) {
  window_db[name].show();
};

function windowResize(name, width, height) {
  window_db[name].setSize(width, height)
};

function windowFocus(name) {
  window_db[name].focus();
};

function windowMaximize(name) {
  window_db[name].maximize();
};

function windowUnmaximize(name) {
  window_db[name].unmaximize();
};

function windowMinimize(name) {
  window_db[name].minimize();
};

function windowUnminimize(name) {
  window_db[name].restore();
};

function windowSetFullScreen(name) {
  window_db[name].setFullScreen(true);
};

function windowSetNoFullScreen(name) {
  window_db[name].setFullScreen(false);
};

function windowSetResizable(name) {
  window_db[name].setResizable(true);
};

function windowSetUnresizable(name) {
  window_db[name].setResizable(false);
};

function windowCenter(name) {
  window_db[name].center();
};

function windowSetPosition(name, x, y) {
  window_db[name].setPosition(x,y);
};

function windowSetTitle(name, tite) {
  window_db[name].setTitle(title);
};

//// Contents

function windowLoadUrl(name, url) {
  window_db[name].loadUrl(url);
};

function windowReload(name) {
  window_db[name].webContents.reload();
};

function windowOpenDevTools(name) {
  window_db[name].openDevTools();
};

function windowCloseDevTools(name) {
  window_db[name].closeDevTools();
}

////// Text

function windowUndo(name) {
  window_db[name].webContents.undo();
};

function windowRedo(name) {
  window_db[name].webContents.redo();
};

function windowCut(name) {
  window_db[name].webContents.cut();
};

function windowCopy(name) {
  window_db[name].webContents.copy();
};

function windowPaste(name) {
  window_db[name].webContents.paste();
};

function windowDelete(name) {
  window_db[name].webContents.delete();
};

function windowSelectAll(name) {
  window_db[name].webContents.selectAll();
};

/* Lifecycle management */

function quit() {
  app.quit();
};

app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    eventAllClosed();
  }
});

/* Command dispatcher */

var iointerface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

const dispatcher = {
  // Windows
  //// Management
  'create-window': function(data) {
    windowCreate(data['name'], data);
  },
  'close-window': function(data) {
    windowClose(data['name']);
  },
  'destroy-window': function(data) {
    windowDestroy(data['name']);
  },
  'send-message-to-window': function(data) {
    windowSendMessage(data['name'], data['message']);
  },
  //// Display
  'show-window': function(data) {
    windowShow(data['name']);
  },
  'hide-window': function(data) {
    windowHide(data['name']);
  },
  'resize-window': function(data) {
    windowResize(data['name'], data['width'], data['height']);
  },
  'focus-window': function(data) {
   windowFocus(data['name']);
  },
  'maximize-window': function(data) {
   windowMaximize(data['name']);
  },
  'unmaximize-window': function(data) {
   windowUnmaximize(data['name']);
  },
  'minimize-window': function(data) {
   windowMinimize(data['name']);
  },
  'unminimize-window': function(data) {
   windowUnminimize(data['name']);
  },
  'fullscreen-window': function(data) {
   windowSetFullscreen(data['name']);
  },
  'unfullscreen-window': function(data) {
   windowSetNoFullscreen(data['name']);
  },
  'resizable-window': function(data) {
   windowSetResizable(data['name']);
  },
  'unresizable-window': function(data) {
   windowSetUnresizable(data['name']);
  },
  'center-window': function(data) {
   windowCenter(data['name']);
  },
  'set-window-position': function(data) {
   windowSetPosition(data['name'], data['x'], data['y']);
  },
  'set-window-title': function(data) {
   windowSetTitle(data['name'], data['title']);
  },
  //// Contents
  'window-load-url': function(data) {
    windowLoadUrl(data['name'], data['url']);
  },
  'window-reload': function(data) {
    windowReload(data['name']);
  },
  'window-open-dev-tools': function(data) {
    windowOpenDevTools(data['name']);
  },
  'window-close-dev-tools': function(data) {
    windowCloseDevTools(data['name']);
  },
  ////// Text
  'window-undo': function(data) {
    windowUndo(data['name']);
  },
  'window-redo': function(data) {
    windowRedo(data['name']);
  },
  'window-cut': function(data) {
    windowCut(data['name']);
  },
  'window-copy': function(data) {
    windowCopy(data['name']);
  },
  'window-paste': function(data) {
    windowPaste(data['name']);
  },
  'window-delete': function(data) {
    windowDelete(data['name']);
  },
  'window-select-all': function(data) {
    windowSelectAll(data['name']);
  },
  // Other
  'quit': function(data) {
    quit();
  }
};

function dispatchCommand(data) {
  const command = data['cmd'];
  dispatcher[command](data);
};

/* Start up */

app.on('ready', function() {
  /* Start listening for commands on the server */
  process.stdout.write('READY\n');
  iointerface.on('line', function (line) {
    dispatchCommand(JSON.parse(line));
  });
});
