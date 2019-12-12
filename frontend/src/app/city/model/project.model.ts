import { Container } from './container.model';

export interface Project {
    name: string;
    version: string;
    data: Container[];
}
