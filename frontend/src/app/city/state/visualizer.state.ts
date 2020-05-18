import { Action, NgxsOnInit, Selector, State, StateContext } from "@ngxs/store";
import { Inject, Injectable } from "@angular/core";
import { Visualizer, VisualizerOptions } from "../services/visualizer";
import { VersionsState } from "./versions.state";
import { ById } from "../model/by-id";
import { RepositoryState } from "./repository.state";

export class SelectMethod {
    static readonly type = '[Visualizer] select method';

    constructor(public method: string) {
    }
}

export class SelectDetailLevel {
    static readonly type = '[Visualizer] select detail level';

    constructor(public detailLevel: 'method' | 'class') {
    }
}

export class ShowAuthors {
    static readonly type = '[Visualizer] showAuthors';

    constructor(public showAuthors: boolean) {
    }
}

export class IgnoreAuthors {
    static readonly type = '[Visualizer] ignore authors';

    constructor(public authors: string[]) {
    }
}

export interface VisualizerStateModel {
    methods: string[];
    selectedMethod: string;
    detailLevel: "method" | "class";
    showAuthors: boolean;
    ignoredAuthors: string[];
}

@State<VisualizerStateModel>({
    name: 'visualizer',
    defaults: {
        methods: [],
        selectedMethod: '',
        detailLevel: 'method',
        showAuthors: false,
        ignoredAuthors: []
    }
})
@Injectable()
export class VisualizerState implements NgxsOnInit {
    @Selector([VisualizerState])
    static getSelectedMethod(state: VisualizerStateModel) {
        return state.selectedMethod;
    }

    @Selector([VisualizerState])
    static getMethods(state: VisualizerStateModel) {
        return state.methods;
    }

    @Selector([RepositoryState.getVersionCompareTo])
    static areChangesShow(version: string) {
        return version !== null;
    }

    @Selector([VisualizerState])
    static getDetailLevel(state: VisualizerStateModel) {
        return state.detailLevel;
    }

    @Selector([VisualizerState])
    static areAuthorsShown(state: VisualizerStateModel) {
        return state.showAuthors;
    }

    @Selector([VisualizerState])
    static getIgnoredAuthors(state: VisualizerStateModel) {
        return state.ignoredAuthors;
    }

    @Selector([VersionsState.getAuthors])
    static getAuthorColors(emails: string[]): ById<number> {
        const result = {};
        let i = 0;
        const delta = Math.trunc(360 / emails.length);
        for (const author of emails) {
            result[author] = i;
            i += delta;
        }
        return result;
    }

    @Selector([
        VisualizerState.areChangesShow, VisualizerState.areAuthorsShown,
        VisualizerState.getDetailLevel, VisualizerState.getAuthorColors,
        VisualizerState.getIgnoredAuthors
    ])
    static getVisualizerOptions(showChanges: boolean,
                                showAuthors: boolean,
                                detailLevel: 'method' | 'class',
                                authorColors: ById<string>,
                                ignoredAuthors: string[]
    ): VisualizerOptions {
        return { showChanges, showAuthors: showAuthors && showChanges, detailLevel, authorColors, ignoredAuthors }
    }

    constructor(@Inject(Visualizer) private visualizers: Visualizer[]) {
    }

    ngxsOnInit(ctx?: StateContext<VisualizerStateModel>): any {
        const visualizers = this.visualizers.map(v => v.name);
        ctx.patchState({ methods: this.visualizers.map(v => v.name), selectedMethod: visualizers[0] });
    }

    @Action(SelectMethod)
    selectMethod(ctx: StateContext<VisualizerStateModel>, { method }: SelectMethod) {
        ctx.patchState({ selectedMethod: method });
    }

    @Action(SelectDetailLevel)
    selectDetailLevel(ctx: StateContext<VisualizerStateModel>, { detailLevel }: SelectDetailLevel) {
        ctx.patchState({ detailLevel });
    }

    @Action(ShowAuthors)
    showAuthors(ctx: StateContext<VisualizerStateModel>, { showAuthors }: ShowAuthors) {
        ctx.patchState({ showAuthors });
    }

    @Action(IgnoreAuthors)
    ignoreAuthors(ctx: StateContext<VisualizerStateModel>, { authors }: IgnoreAuthors) {
        ctx.patchState({ ignoredAuthors: authors });
    }
}