import Kasumi, { BaseMenu } from "kasumi.js";
import "./event";
import RepeatKmdCommand from "commands/kmd";

export default class AppMenu extends BaseMenu {
    constructor(name: string = "app") {
        super();
        this.name = name;
    }

    init(client: Kasumi<any>, loggerSequence: string[]): void {
        super.init(client, loggerSequence);

        this.load(new RepeatKmdCommand());
    }
}
