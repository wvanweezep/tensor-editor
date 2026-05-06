var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Controller, HTML, OnEvent } from "./controller.js";
export class EntryListCtrl extends Controller {
    constructor(workspaceCtrl) {
        super();
        this.nextId = 0;
        this.workspaceCtrl = workspaceCtrl;
    }
    toggleCollapseSidebarEntry(e, header) {
        const parent = header.parentElement;
        parent === null || parent === void 0 ? void 0 : parent.classList.toggle('open');
    }
    clickAddEntry() {
        this.addEntry(String.fromCharCode(65 + this.nextId++));
    }
    addEntry(name) {
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
        entryContent.id = name + "-content";
        entryContent.appendChild(this.createTensorDropdown(name));
        entryContent.appendChild(this.createTensorInput(name, 3, 1));
        entry.appendChild(entryHeader);
        entry.appendChild(entryContent);
        entryHeader.addEventListener("click", (e) => {
            const parent = entryHeader.parentElement;
            parent === null || parent === void 0 ? void 0 : parent.classList.toggle('open');
        });
        this.tensorList.appendChild(entry);
    }
    createTensorDropdown(id) {
        const label = document.createElement("label");
        label.style = "display: flex; justify-content: space-between";
        label.textContent = "Type: ";
        const select = document.createElement("select");
        select.id = id + "-tensor-type";
        select.addEventListener("change", () => {
            var _a, _b;
            (_a = document.getElementById(id + "-tensor")) === null || _a === void 0 ? void 0 : _a.remove();
            (_b = document.getElementById(id + "-content")) === null || _b === void 0 ? void 0 : _b.appendChild(this.createTensorInput(id, 3, select.value == "conic" ? 3 : 1));
            this.workspaceCtrl.tensorMap.delete(id);
        });
        const optPoint = document.createElement("option");
        optPoint.value = "point";
        optPoint.textContent = "Point";
        select.appendChild(optPoint);
        const optLine = document.createElement("option");
        optLine.value = "line";
        optLine.textContent = "Line";
        select.appendChild(optLine);
        const optConic = document.createElement("option");
        optConic.value = "conic";
        optConic.textContent = "Conic";
        select.appendChild(optConic);
        label.appendChild(select);
        return label;
    }
    createTensorInput(id, width, height) {
        const tensor = document.createElement("div");
        tensor.id = id + "-tensor";
        for (let i = 0; i < height; i++) {
            const row = document.createElement("div");
            row.style = "display: flex; justify-content: center";
            for (let j = 0; j < width; j++) {
                const entry = document.createElement("input");
                entry.type = "number";
                entry.className = "tensor-entry";
                entry.value = "0";
                entry.addEventListener(("change"), () => this.workspaceCtrl.tensorMap.set(id, this.readTensorData(id)));
                row.appendChild(entry);
            }
            tensor.appendChild(row);
        }
        return tensor;
    }
    readTensorData(id) {
        const tensor = document.getElementById(id + "-tensor");
        const inputs = tensor.querySelectorAll("input.tensor-entry");
        const values = new Float32Array(12);
        const type = document.getElementById(id + "-tensor-type").value;
        values[0] = (type == "point" ? 1 : (type == "line" ? 2 : 3));
        inputs.forEach((input, index) => {
            const val = parseFloat(input.value);
            values[index + 1] = isNaN(val) ? 0 : val;
        });
        return values;
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
            this.workspaceCtrl.tensorMap.delete(id);
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
