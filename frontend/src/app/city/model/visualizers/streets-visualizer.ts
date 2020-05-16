import { AbstractVisualizer } from "./abstract-visualizer";
import { StreetsIllustrator } from "../illustrators/streets.illustrator";
import { Street } from "../shapes/containers/street";
import { Visualizer } from "../../services/visualizer";

export class StreetsVisualizer extends AbstractVisualizer implements Visualizer {
    public get name() {
        return 'streets';
    }

    protected illustratorClass = StreetsIllustrator;
    protected layoutContainer = Street;

}