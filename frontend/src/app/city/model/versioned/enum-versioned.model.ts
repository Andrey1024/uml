import { NodeVersioned } from './node-versioned.model';

export interface EnumVersioned extends NodeVersioned<void> {
    type: 'ENUM';
}
