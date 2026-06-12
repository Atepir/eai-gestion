export interface MeterReading {
    entryReading: number | null;
    exitReading: number | null;
}

export class MeterReadingVO {
    private constructor(private readonly props: MeterReading) { }

    static create(props: MeterReading): MeterReadingVO { return new MeterReadingVO(props); }

    get entry(): number | null { return this.props.entryReading; }
    get exit(): number | null { return this.props.exitReading; }

    get consumption(): number | null {
        if (this.props.entryReading != null && this.props.exitReading != null) {
            return this.props.exitReading - this.props.entryReading;
        }
        return null;
    }
}
