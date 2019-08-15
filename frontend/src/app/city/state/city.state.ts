import { State } from '@ngxs/store';
import { Container } from '../model/container.model';

export interface CityVersion {
    model: Container;

}

export interface CityStateModel {
    byId: { [id: string]: CityVersion };
    versions: string[];
    selected: string | null;
}

@State<CityStateModel>({
    name: 'city'
})
export class CityState {

}
