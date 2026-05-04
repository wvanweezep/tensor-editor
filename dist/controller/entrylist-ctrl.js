var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Controller, HTML, OnEvent } from "./controller.js";
export class EntryListCtrl extends Controller {
    constructor() {
        super(...arguments);
        this.nextId = 0;
    }
    // TODO: Remove later
    toggleCollapseSidebarEntry(e, header) {
        const parent = header.parentElement;
        parent === null || parent === void 0 ? void 0 : parent.classList.toggle('open');
    }
    clickAddEntry() {
        this.addEntry(String.fromCharCode(65 + this.nextId++), "...");
    }
    addEntry(name, content) {
        const entry = document.createElement("div");
        entry.className = "sidebar-tensor-entry open";
        entry.id = name;
        const entryHeader = document.createElement("div");
        entryHeader.className = "sidebar-tensor-entry-header";
        // Arrow and Name
        const arrowPiece = document.createElement("div");
        arrowPiece.className = "arrow";
        arrowPiece.textContent = "▶";
        const namePiece = document.createElement("div");
        namePiece.textContent = name;
        const nameSection = document.createElement("div");
        nameSection.style = "display: flex; align-items: center;";
        nameSection.appendChild(arrowPiece);
        nameSection.appendChild(namePiece);
        entryHeader.appendChild(nameSection);
        entryHeader.appendChild(this.createHeaderButtons(name));
        // Content
        const entryContent = document.createElement("div");
        entryContent.className = "sidebar-tensor-entry-content";
        entryContent.textContent = content;
        entry.appendChild(entryHeader);
        entry.appendChild(entryContent);
        entryHeader.addEventListener("click", (e) => this.toggleCollapseSidebarEntry(e, entryHeader));
        this.tensorList.appendChild(entry);
    }
    createHeaderButtons(id) {
        const buttons = document.createElement("div");
        buttons.style = "display: flex; align-items: center;";
        buttons.appendChild(this.visibilityButton());
        buttons.appendChild(this.editButton(id));
        buttons.appendChild(this.removeButton(id));
        return buttons;
    }
    visibilityButton() {
        const button = document.createElement("button");
        button.className = "icon-button";
        button.textContent = "👁";
        button.onclick = (e) => {
            button.classList.toggle("inactive");
            e.stopPropagation();
        };
        return button;
    }
    editButton(id) {
        const button = document.createElement("button");
        button.className = "icon-button";
        button.textContent = "✐";
        button.onclick = (e) => {
            console.log(`I wanted to edit ${id}`);
            e.stopPropagation();
        };
        return button;
    }
    removeButton(id) {
        const button = document.createElement("button");
        button.className = "icon-button";
        button.textContent = "✕";
        button.onclick = (e) => {
            var _a;
            (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.remove();
            e.stopPropagation();
        };
        return button;
    }
}
__decorate([
    HTML("sidebar-tensor-list")
], EntryListCtrl.prototype, "tensorList", void 0);
__decorate([
    OnEvent("click", ".sidebar-tensor-entry-header")
], EntryListCtrl.prototype, "toggleCollapseSidebarEntry", null);
__decorate([
    OnEvent("click", "#sidebar-add-button")
], EntryListCtrl.prototype, "clickAddEntry", null);
