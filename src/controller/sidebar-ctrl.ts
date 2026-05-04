import {Controller, HTML, OnEvent} from "./controller.js"

export class SidebarCtrl extends Controller {

    @HTML("sidebar")
    private sidebar!: HTMLElement;

    @HTML("sidebar-collapse-button")
    private collapseButton!: HTMLElement;

    private isResizing: boolean = false;

    @OnEvent("click", "#sidebar-collapse-button")
    private toggleCollapseSidebar(): void {
        this.sidebar.classList.toggle("collapsed");
        this.sidebar.style.position = this.sidebar.classList.contains("collapsed") ? "absolute" : "relative";
        this.collapseButton.textContent = this.sidebar.classList.contains("collapsed") ? "▶" : "◀";
    }

    @OnEvent("mousedown", "#sidebar-resizer")
    private startResizeSidebar() {
        this.isResizing = true;
        document.body.style.cursor = "ew-resize";
    }

    @OnEvent("mouseup", "#container")
    private stopResizeSidebar() {
        this.isResizing = false;
        document.body.style.cursor = "default";
    }

    @OnEvent("mousemove", "#container")
    private resizeSidebar(e: MouseEvent) {

        if (!this.isResizing) return;
        let newWidth = Math.max(250, Math.min(600, e.clientX))
        this.sidebar.style.width = newWidth + "px";
    }
}