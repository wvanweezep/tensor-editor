var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Controller, HTML, OnEvent } from "./controller.js";
export class SidebarCtrl extends Controller {
    constructor() {
        super(...arguments);
        this.isResizing = false;
    }
    toggleCollapseSidebar() {
        this.sidebar.classList.toggle("collapsed");
        //this.sidebar.style.position = this.sidebar.classList.contains("collapsed") ? "absolute" : "relative";
        this.collapseButton.textContent = this.sidebar.classList.contains("collapsed") ? "▶" : "◀";
    }
    startResizeSidebar() {
        this.isResizing = true;
        document.body.style.cursor = "ew-resize";
    }
    stopResizeSidebar() {
        this.isResizing = false;
        document.body.style.cursor = "default";
    }
    resizeSidebar(e) {
        if (!this.isResizing)
            return;
        let newWidth = Math.max(250, Math.min(600, e.clientX));
        this.sidebar.style.width = newWidth + "px";
    }
}
__decorate([
    HTML("sidebar")
], SidebarCtrl.prototype, "sidebar", void 0);
__decorate([
    HTML("sidebar-collapse-button")
], SidebarCtrl.prototype, "collapseButton", void 0);
__decorate([
    OnEvent("click", "#sidebar-collapse-button")
], SidebarCtrl.prototype, "toggleCollapseSidebar", null);
__decorate([
    OnEvent("mousedown", "#sidebar-resizer")
], SidebarCtrl.prototype, "startResizeSidebar", null);
__decorate([
    OnEvent("mouseup", "#container")
], SidebarCtrl.prototype, "stopResizeSidebar", null);
__decorate([
    OnEvent("mousemove", "#container")
], SidebarCtrl.prototype, "resizeSidebar", null);
