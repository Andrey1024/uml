import { NodeVersioned } from './node-versioned.model';

export interface ContainerVersioned extends NodeVersioned<{ type: 'CONTAINER', children: string[] }> {
}
