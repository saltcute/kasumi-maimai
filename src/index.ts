import Kasumi, { BaseMenu } from "kasumi.js";
import Best50Command from "@/commands/b50";

export default class MaiMenu extends BaseMenu {
    constructor(name: string = "mai") {
        super();
        this.name = name;
    }

    init(client: Kasumi<any>, loggerSequence: string[]): void {
        super.init(client, loggerSequence);

        this.load(new Best50Command());
    }
}
