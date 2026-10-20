import { BrowserWindow as e, app as t } from "electron";
import * as n from "node:path";
//#region main.ts
var r = null;
function i() {
	r = new e({}), r.setMenu(null), process.env.VITE_DEV_SERVER_URL ? r.loadURL(new URL("index.electron.html", process.env.VITE_DEV_SERVER_URL).toString()) : r.loadFile(n.join(import.meta.dirname, "../dist/index.electron.html")), r.on("closed", () => {
		r = null;
	});
}
t.whenReady().then(i), t.on("window-all-closed", () => {
	process.platform !== "darwin" && t.quit();
}), t.on("activate", () => {
	r === null && i();
});
//#endregion
export {};
