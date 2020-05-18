export interface VersionedElement<T> {
    isFirstEncounter: boolean;
    lifeRatio: number;
    lifeSpan: number;
    changes?: Partial<T>;
    authors?: string[];
    data: T;
}