import { MeterReadingVO } from '../value-objects/meter-reading.vo';

export type MeterType = 'WATER' | 'ELECTRICITY';
export type MeterStatus = 'PENDING' | 'READ' | 'TERMINATED';

export interface MeterProps {
    id: string;
    propertyId: string;
    type: MeterType;
    reading: MeterReadingVO;
    status: MeterStatus;
    createdAt: Date;
}

export class Meter {
    private constructor(private readonly props: MeterProps) { }

    static create(props: { id: string; propertyId: string; type: MeterType }): Meter {
        return new Meter({
            id: props.id,
            propertyId: props.propertyId,
            type: props.type,
            reading: MeterReadingVO.create({ entryReading: null, exitReading: null }),
            status: 'PENDING',
            createdAt: new Date(),
        });
    }

    static reconstitute(props: MeterProps): Meter { return new Meter(props); }

    get id(): string { return this.props.id; }
    get propertyId(): string { return this.props.propertyId; }
    get type(): MeterType { return this.props.type; }
    get reading(): MeterReadingVO { return this.props.reading; }
    get status(): MeterStatus { return this.props.status; }

    recordReading(entry: number, exit: number): Meter {
        return Meter.reconstitute({
            ...this.props,
            reading: MeterReadingVO.create({ entryReading: entry, exitReading: exit }),
            status: 'READ',
        });
    }
}
