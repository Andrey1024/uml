import { AbstractVisualizer } from "./abstract-visualizer";
import { StreetsIllustrator } from "../illustrators/streets.illustrator";
import { Street } from "../shapes/containers/street";
import { Visualizer } from "../../services/visualizer";
import { Platform } from "../shapes/containers/platform";

export class StreetsVisualizer extends AbstractVisualizer<Platform | Street> implements Visualizer {
    public get name() {
        return 'EvoStreets';
    }

    protected illustratorClass = StreetsIllustrator;
}