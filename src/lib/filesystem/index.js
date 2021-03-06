const types = {
  com: "MS-DOS Application",
  sys: "System File",
  bat: "MS-DOS Batch File",
  txt: "Text Document",
  folder: "File Folder",
  drive: "Local Disk"
};

class File {
  constructor(path, extras) {
    const split = path.split("/");
    this.filename = split.pop();
    this.path = "/" + split.join("/");
    this.extension = this.filename.includes(".")
      ? this.filename.split(".").pop()
      : null;
    this.description = types[this.extension];
    this.setIcon();
    Object.assign(this, extras);
  }
  setIcon() {
    if (this.filename === "My Documents") return (this.icon = "mydocuments");
    if (this.filename === "My Computer") return (this.icon = "mycomputer");
    if (this.filename.match(/a:$/)) return (this.icon = "floppy");
    if (this.filename.match(/:$/)) return (this.icon = "drive");
    if (this.extension === null) return (this.icon = "folder");
    if (["txt", "doc", "ini", "cfg"].includes(this.extension))
      return (this.icon = "text");
    if (["exe", "bat"].includes(this.extension)) return (this.icon = "default");
    if (["avi"].includes(this.extension)) return (this.icon = "video");
    return (this.icon = "document");
  }
  fullPath() {
    return [this.path, this.filename].join("/");
  }
}

class Filesystem {
  constructor({ files } = {}) {
    this.files = files || [];
  }
  setupMocks() {
    import("./mocks.js").then(mocks => {});
  }
  loadMocks() {}
  getObjectType(filename) {
    if (filename.includes(":")) return "drive";
    if (!filename.includes(".")) return "folder";
    return filename.substr(-3);
  }
  conformPath(path = "") {
    return ("/" + path.replace(/^\/*/, "").replace(/\/$/, "")).toLowerCase();
  }
  getFolder(requestedPath) {
    const path = this.conformPath(requestedPath);
    if (path === "")
      return new File("", {
        filename: "My Computer",
        description: "Select an item to view its description.",
        path
      });
    const folder = this.files.find(
      file =>
        file.path.toLowerCase() + "/" + file.filename.toLowerCase() === path
    );

    if (folder) return folder;

    return new File(path);
  }
  getFiles(requestedPath) {
    const path = this.conformPath(requestedPath);

    const files = this.files.filter(file => file.path.toLowerCase() === path);
    return files;
  }
}

export { Filesystem, File };
