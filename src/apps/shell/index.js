import Desktop from "../../components/desktop/index.js";
import Window from "../../components/window/index.js";
import WindowArea from "../../components/windowarea/index.js";
import Taskbar from "../../components/taskbar/index.js";
import Button from "../../components/button/index.js";
import StartMenu from "../../components/startmenu/index.js";
import FileIcons from "../../components/desktop/fileicons/index.js";
import Toolbar from "../../components/toolbar/index.js";
import ErrorHandler from "../../apps/error/index.js";
import Webview from "../webview/index.js";
import Wizard from "../wizard/index.js";
import Explorer from "../explorer/index.js";
import Editor from "../editor/index.js";
import Webamp from "../webamp/index.js";
import { h, render, Component } from "preact";

const apps = {
  ErrorHandler,
  Webview,
  Webamp,
  Editor,
  Wizard,
  Explorer
};

class Shell extends Component {
  constructor(props) {
    super();
    this.state = {
      fs: props.fs,
      windows: [],
      startMenu: props.startMenu || {},
      desktopIcons: props.desktopIcons || {}
    };
    this.windowId = 100;
  }
  componentDidMount() {
    this.globalClick = e => {
      // Ignore mouse events in the start menu
      if (e.target && e.target.matches(".ui95-startmenu *")) return;
      if (this.state.startOpen) this.setState({ startOpen: false });
    };
    document.body.addEventListener("mousedown", this.globalClick);

    // Error handling: pop up an error window
    this.onerror = event => {
      if (event.error) {
        this.openWindow("ErrorHandler", {
          title: event.error.message,
          error: event.error
        });
      } else if (event.promise) {
        event.promise.catch(error => {
          this.openWindow("ErrorHandler", { title: error.message, error });
        });
      }
    };
    window.addEventListener("error", this.onerror);
    window.addEventListener("unhandledrejection", this.onerror);
  }
  componentWillUnmount() {
    document.body.removeEventListener("mousedown", this.globalClick);
    window.removeEventListener("error", this.onerror);
    window.removeEventListener("unhandledrejection", this.onerror);
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      startMenu: nextProps.startMenu,
      desktopIcons: nextProps.desktopIcons
    });
  }
  openStart(e) {
    this.setState({ startOpen: !this.state.startOpen });
    e.preventDefault();
    e.stopPropagation();
  }
  getWindowByTitle(title) {
    return this.state.windows.find(
      ([windowId, props]) => props.title === title
    );
  }
  raiseWindow(windowId) {
    const windows = this.state.windows;

    // Make a copy of the windows and sort them so we can set the zIndex
    const sortedWindows = [...windows];
    sortedWindows.sort((a, b) => a[1].zIndex > b[1].zIndex);
    sortedWindows.forEach(([appName, appProps, appChildren], i) => {
      // FIXME: setting state directly
      appProps.zIndex = i;
      if (appProps.key === windowId) {
        appProps.zIndex = windows.length;
        appProps.isMinimized = false;
      }
    });

    // Apply the old order with the new zIndex
    this.setState({ windows, raisedWindow: windowId });
  }
  closeWindow(windowId) {
    const windows = this.state.windows;
    const newState = windows.filter(
      ([appName, appProps]) => appProps.key !== windowId
    );
    this.setState({ windows: newState });
  }
  openWindow(appName, props = {}, children) {
    props.title = props.title || appName;

    const existingWindow = this.getWindowByTitle(props.title);
    if (existingWindow) {
      existingWindow[1].isMinimized = false;
      return this.setState({});
    }

    if (!apps[appName]) throw new Error(`${appName} could not be executed.`);

    const windowId = this.windowId++;
    props.key = windowId;
    this.state.windows = [...this.state.windows, [appName, props, children]];

    // Let raiseWindow call setState.
    this.raiseWindow(windowId);

    if (props.asyncProps)
      props
        .asyncProps(props)
        .then(newProps => {
          // FIXME: setting state directly
          Object.assign(props, newProps);
          this.setState({});
        })
        .catch(e => {
          this.openWindow("ErrorHandler", {
            title: e.message,
            error: event.error
          });
        });
  }
  windowProps(key) {
    return {
      fs: this.state.fs,
      onClose: () => this.closeWindow(key),
      onFocus: () => this.raiseWindow(key),
      onLaunchApp: (...args) => this.openWindow(...args)
    };
  }
  render(props) {
    return (
      <Desktop>
        <WindowArea>
          <FileIcons
            items={this.state.desktopIcons}
            onClick={item => this.openWindow(item.app, item.appProps)}
          />
          {this.state.windows.map(([appName, appProps, appChildren]) => {
            return h(
              apps[appName],
              { ...appProps, ...this.windowProps(appProps.key) },
              appChildren
            );
          })}
        </WindowArea>
        <StartMenu
          items={this.state.startMenu}
          isOpen={this.state.startOpen}
          onLaunchApp={(...args) => this.openWindow(...args)}
          onClose={() => this.setState({ startOpen: false })}
        />
        <Taskbar>
          <Button
            classNames={`bold left ${
              this.state.startOpen ? "active" : "inactive"
            }`}
            onMouseDown={e => this.openStart(e)}
          >
            Stort
          </Button>
          {this.state.windows.map(([appName, appProps]) => (
            <Button
              key={appProps.key}
              classNames={
                appProps.key === this.state.raisedWindow ? "active" : "inactive"
              }
              onClick={() => this.raiseWindow(appProps.key)}
            >
              {appProps.title}
            </Button>
          ))}
        </Taskbar>
      </Desktop>
    );
  }
}

export default Shell;