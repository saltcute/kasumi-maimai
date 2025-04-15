import { CustomStorage } from "config/type";
import Kasumi, {
    BaseCommand,
    BaseSession,
    CommandFunction,
    MessageType,
} from "kasumi.js";
import { MaiDraw } from "maidraw";
import { DivingFish } from "maidraw/dist/mai/best50/lib/divingFish";
import { KamaiTachi } from "maidraw/dist/mai/best50/lib/kamaiTachi";
import { LXNS } from "maidraw/dist/mai/best50/lib/lxns";

export default class Best50Command extends BaseCommand<Kasumi<CustomStorage>> {
    name = "b50";
    description = "查询 b50 图片";
    lxns!: LXNS;
    kamaiTachi!: KamaiTachi;
    divingFish!: DivingFish;

    constructor() {
        super();
        this.on("ready", () => {
            this.lxns = new MaiDraw.Maimai.Best50.LXNS({
                auth: this.client.config.getSync("maimai::lxns.token"),
            });
            this.divingFish = new MaiDraw.Maimai.Best50.DivingFish({
                auth: this.client.config.getSync("maimai::divingFish.token"),
            });
            this.kamaiTachi = new MaiDraw.Maimai.Best50.KamaiTachi();
        });
    }
    func: CommandFunction<BaseSession, any> = async (session) => {
        const username = session.args[0];
        const source = session.args[session.args.indexOf("\\-\\-source") + 1];
        const theme = session.args[session.args.indexOf("\\-\\-theme") + 1];

        const { data: msg } = await session.send("正在生成图片...");
        let result: Buffer | null = null;
        switch (source.toLowerCase()) {
            case "kamai":
            case "kamaitachi":
            case "tachi":
                result = await MaiDraw.Maimai.Best50.drawWithScoreSource(
                    this.kamaiTachi,
                    username,
                    { theme }
                );
                break;
            case "divingfish":
            case "df":
            case "水鱼":
                result = await MaiDraw.Maimai.Best50.drawWithScoreSource(
                    this.divingFish,
                    username,
                    { theme }
                );
                break;
            case "lxns":
            case "lx":
            case "落雪":
            default:
                result = await MaiDraw.Maimai.Best50.drawWithScoreSource(
                    this.lxns,
                    username,
                    { theme }
                );
                break;
        }

        if (result) {
            const { data, err } = await this.client.API.asset.create(result);
            if (err) return session.reply("上传图片失败");
            if (msg) await this.client.API.message.delete(msg.msg_id);
            return this.client.API.message.create(
                MessageType.ImageMessage,
                session.channelId,
                data.url
            );
        } else return session.reply("无法生成图片");
    };
}
