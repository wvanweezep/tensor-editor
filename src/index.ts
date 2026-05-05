import { SidebarCtrl } from "./controller/sidebar-ctrl.js";
import { EntryListCtrl } from "./controller/entrylist-ctrl.js";
import { WorkspaceCtrl } from "./controller/workspace-ctrl.js";
import {Workspace3DCtrl} from "./controller/workspace3d-ctrl.js";

const canvas = document.querySelector<HTMLCanvasElement>("#mainCanvas")!;
export const gl = canvas.getContext("webgl2")!;

const sidebarCtrl = new SidebarCtrl();
const entryListCtrl = new EntryListCtrl();
const workspaceCtrl = new Workspace3DCtrl();



