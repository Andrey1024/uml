import { NodeVersioned } from './node-versioned.model';


export interface InterfaceVersioned extends NodeVersioned<void> {
    type: 'INTERFACE';
}
