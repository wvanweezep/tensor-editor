import { SidebarCtrl } from "./controller/sidebar-ctrl.js";
import { EntryListCtrl } from "./controller/entrylist-ctrl.js";
import { WorkspaceCtrl } from "./controller/workspace-ctrl.js";
const canvas = document.querySelector("#mainCanvas");
export const gl = canvas.getContext("webgl2");
const sidebarCtrl = new SidebarCtrl();
const workspaceCtrl = new WorkspaceCtrl();
const entryListCtrl = new EntryListCtrl(workspaceCtrl);
// const workspaceCtrl = new Workspace3DCtrl();
