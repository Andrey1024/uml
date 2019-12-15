import { Node } from './node.model';

export interface Container {
    sourcePath: string;
    classes: Node[];
}
