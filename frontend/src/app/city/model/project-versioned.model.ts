import { ContainerVersioned } from './container-versioned.model';

export interface ProjectVersioned {
    name: string;
    versions: string[];
    data: ContainerVersioned;
}
