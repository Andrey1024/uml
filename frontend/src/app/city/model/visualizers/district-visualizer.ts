import { AbstractVisualizer } from "./abstract-visualizer";
import { DistrictIllustrator } from "../illustrators/district.illustrator";
import { Grid } from "../shapes/containers/grid";
import { Visualizer } from "../../services/visualizer";

export class DistrictVisualizer extends AbstractVisualizer implements Visualizer {
    public get name() {
        return 'Code City'
    }

    protected illustratorClass = DistrictIllustrator;
    protected layoutContainer = Grid;

}