import {Controller, HTML, OnEvent} from "./controller.js";

export class EntryListCtrl extends Controller {

    @HTML("sidebar-tensor-list")
    private tensorList!: HTMLElement;

    private nextId: number = 0;

    // TODO: Remove later
    @OnEvent("click", ".sidebar-tensor-entry-header")
    private toggleCollapseSidebarEntry(e: Event, header: HTMLElement): void {
        const parent = header.parentElement;
        parent?.classList.toggle('open');
    }

    @OnEvent("click", "#sidebar-add-button")
    private clickAddEntry() {
        this.addEntry(String.fromCharCode(65 + this.nextId++), "...");
    }

    private addEntry(name: string, content: string): void {
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
        nameSection.appendChild(arrowPiece)
        nameSection.appendChild(namePiece);

        entryHeader.appendChild(nameSection);
        entryHeader.appendChild(this.createHeaderButtons(name));

        // Content
        const entryContent = document.createElement("div");
        entryContent.className = "sidebar-tensor-entry-content";
        entryContent.textContent = content;

        entry.appendChild(entryHeader);
        entry.appendChild(entryContent);
        entryHeader.addEventListener("click", (e) =>
            this.toggleCollapseSidebarEntry(e, entryHeader));
        this.tensorList.appendChild(entry);
    }


    private createHeaderButtons(id: string): HTMLDivElement {
        const buttons = document.createElement("div");
        buttons.style = "display: flex; align-items: center;";
        buttons.appendChild(this.visibilityButton());
        buttons.appendChild(this.editButton(id));
        buttons.appendChild(this.removeButton(id));
        return buttons;
    }

    private visibilityButton(): HTMLButtonElement {
        const button = document.createElement("button");
        button.className = "icon-button";
        button.textContent = "👁";
        button.onclick = (e: PointerEvent) => {
            button.classList.toggle("inactive");
            e.stopPropagation();
        };
        return button;
    }

    private editButton(id: string): HTMLButtonElement {
        const button = document.createElement("button");
        button.className = "icon-button";
        button.textContent = "✐";
        button.onclick = (e: PointerEvent) => {
            console.log(`I wanted to edit ${id}`);
            e.stopPropagation();
        };
        return button;
    }

    private removeButton(id: string): HTMLButtonElement {
        const button = document.createElement("button");
        button.className = "icon-button";
        button.textContent = "✕";
        button.onclick = (e: PointerEvent) => {
            document.getElementById(id)?.remove();
            e.stopPropagation();
        };
        return button;
    }
}