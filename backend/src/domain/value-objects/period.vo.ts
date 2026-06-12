export interface PeriodProps {
    label: string;
    startDate: Date;
    endDate: Date;
}

const QUARTER_LABELS = ['Janvier–Mars', 'Avril–Juin', 'Juillet–Septembre', 'Octobre–Décembre'];

export class Period {
    private constructor(private readonly props: PeriodProps) { }

    static fromDate(date: Date): Period {
        const year = date.getFullYear();
        const quarter = Math.floor(date.getMonth() / 3);
        const startMonth = quarter * 3;
        const startDate = new Date(year, startMonth, 1);
        const endDate = new Date(year, startMonth + 3, 0);
        const label = `${QUARTER_LABELS[quarter]} ${year}`;
        return new Period({ label, startDate, endDate });
    }

    static reconstitute(props: PeriodProps): Period {
        return new Period(props);
    }

    get label(): string { return this.props.label; }
    get startDate(): Date { return this.props.startDate; }
    get endDate(): Date { return this.props.endDate; }

    computeDueDate(): Date {
        return new Date(this.props.startDate.getTime() + 15 * 24 * 60 * 60 * 1000);
    }
}
