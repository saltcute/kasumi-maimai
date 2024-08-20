import { CustomStorage } from "config/type";
import Kasumi, {
    BaseCommand,
    BaseSession,
    CommandFunction,
    MessageType,
} from "kasumi.js";
import { DivingFish } from "../../lib/divingFish";
import maiDraw from "@/lib/maiDraw";
import { LXNS } from "@/lib/lxns";

export default class Best50Command extends BaseCommand<Kasumi<CustomStorage>> {
    name = "b50";
    description = "查询 b50 图片";
    lxns!: LXNS;

    constructor() {
        super();
        this.on("ready", () => {
            this.lxns = new LXNS(
                this.client.config.getSync("maimai::lxns.token")
            );
        });
    }
    func: CommandFunction<BaseSession, any> = async (session) => {
        const username = session.args[0];
        if (!username) return session.reply("请输入用户名");
        const data = await DivingFish.getPlayerBest50(username);
        if (!data) return session.reply("获取用户资料失败");
        session.send("正在生成图片...");
        const result = await maiDraw.draw(
            data.nickname,
            data.rating,
            await DivingFish.toSalt(
                data.charts.dx,
                await this.lxns.getSongList()
            ),
            await DivingFish.toSalt(
                data.charts.sd,
                await this.lxns.getSongList()
            )
        );
        if (result) {
            const { data, err } = await this.client.API.asset.create(result);
            if (err) return session.reply("上传图片失败");
            return this.client.API.message.create(
                MessageType.ImageMessage,
                session.channelId,
                data.url
            );
        } else return session.reply("无法生成图片");
    };
}
