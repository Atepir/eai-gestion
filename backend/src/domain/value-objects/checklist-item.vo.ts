export interface ChecklistItemProps {
    label: string;
    completed: boolean;
    orderIndex: number;
}

export class TerminationChecklist {
    private constructor(public readonly items: ChecklistItemProps[]) { }

    static createDefault(): TerminationChecklist {
        return new TerminationChecklist([
            { label: "État des lieux d'entrée", completed: false, orderIndex: 1 },
            { label: 'État des lieux de sortie', completed: false, orderIndex: 2 },
            { label: 'Réparations éventuelles', completed: false, orderIndex: 3 },
            { label: 'Relevé des compteurs', completed: false, orderIndex: 4 },
            { label: 'Régularisation des charges', completed: false, orderIndex: 5 },
        ]);
    }

    static reconstitute(items: ChecklistItemProps[]): TerminationChecklist {
        return new TerminationChecklist(items);
    }

    isComplete(): boolean { return this.items.every((i) => i.completed); }

    progress(): number {
        const done = this.items.filter((i) => i.completed).length;
        return Math.round((done / this.items.length) * 100);
    }
}
