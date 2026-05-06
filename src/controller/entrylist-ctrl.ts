import {Controller, HTML, OnEvent} from "./controller.js";
import {WorkspaceCtrl} from "./workspace-ctrl";

export class EntryListCtrl extends Controller {

    @HTML("sidebar-tensor-list")
    private tensorList!: HTMLElement;

    private workspaceCtrl: WorkspaceCtrl;

    private nextId: number = 0;


    public constructor(workspaceCtrl: WorkspaceCtrl) {
        super();
        this.workspaceCtrl = workspaceCtrl;
    }


    @OnEvent("click", ".sidebar-tensor-entry-header")
    private toggleCollapseSidebarEntry(e: Event, header: HTMLElement): void {
        const parent = header.parentElement;
        parent?.classList.toggle('open');
    }

    @OnEvent("click", "#sidebar-add-button")
    private clickAddEntry() {
        this.addEntry(String.fromCharCode(65 + this.nextId++));
    }

    private addEntry(name: string): void {
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
        entryContent.id = name + "-content";
        entryContent.appendChild(this.createTensorDropdown(name));
        entryContent.appendChild(this.createTensorInput(name, 3, 1));

        entry.appendChild(entryHeader);
        entry.appendChild(entryContent);
        entryHeader.addEventListener("click", (e) => {
            const parent = entryHeader.parentElement;
            parent?.classList.toggle('open');
        });
        this.tensorList.appendChild(entry);
    }

    private createTensorDropdown(id: string) {
        const label = document.createElement("label");
        label.style = "display: flex; justify-content: space-between";
        label.textContent = "Type: ";
        const select = document.createElement("select");
        select.id = id + "-tensor-type";
        select.addEventListener("change", () => {
            document.getElementById(id + "-tensor")?.remove();
            document.getElementById(id + "-content")?.appendChild(this.createTensorInput(id, 3,
                select.value == "conic" ? 3 : 1));
            this.workspaceCtrl.tensorMap.delete(id);
        })

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

    private createTensorInput(id: string, width: number, height: number): HTMLDivElement {
        const tensor = document.createElement("div");
        tensor.id = id + "-tensor";
        for (let i = 0; i < height; i++) {
            const row = document.createElement("div");
            row.style = "display: flex; justify-content: center"
            for (let j = 0; j < width; j++) {
                const entry = document.createElement("input");
                entry.type = "number";
                entry.className = "tensor-entry";
                entry.value = "0";
                entry.addEventListener(("change"), () =>
                    this.workspaceCtrl.tensorMap.set(id, this.readTensorData(id)));
                row.appendChild(entry);
            }
            tensor.appendChild(row);
        }
        return tensor;
    }

    private readTensorData(id: string) {
        const tensor = document.getElementById(id + "-tensor")!;
        const inputs = tensor.querySelectorAll("input.tensor-entry");
        const values = new Float32Array(12);

        const type = (document.getElementById(id + "-tensor-type")! as HTMLSelectElement).value;
        values[0] = (type == "point" ? 1 : (type == "line" ? 2 : 3));
        inputs.forEach((input, index) => {
            const val = parseFloat((input as HTMLInputElement).value);
            values[index + 1] = isNaN(val) ? 0 : val;
        });

        return values;

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
            this.workspaceCtrl.tensorMap.delete(id);
            document.getElementById(id)?.remove();
            e.stopPropagation();
        };
        return button;
    }
}