import { CustomStorage } from "config/type";
import Kasumi, {
    BaseCommand,
    BaseSession,
    CommandFunction,
    MessageType,
} from "kasumi.js";
import { DivingFish } from "../../lib/divingFish";
import { MaiDraw } from "@/lib/maiDraw";
import { LXNS } from "@/lib/lxns";
import { IChart } from "@/lib/maiDraw/type";

export default class Best50Command extends BaseCommand<Kasumi<CustomStorage>> {
    name = "b50";
    description = "查询 b50 图片";
    lxns!: LXNS;
    maiDraw!: MaiDraw;

    constructor() {
        super();
        this.on("ready", () => {
            this.lxns = new LXNS(
                this.client.config.getSync("maimai::lxns.token")
            );
            this.maiDraw = new MaiDraw(
                this.client.config.getSync("maimai::config.useLocalDatabase")
                    ? this.client.config.getSync(
                          "maimai::config.localDatabasePath"
                      )
                    : ""
            );
        });
    }
    func: CommandFunction<BaseSession, any> = async (session) => {
        const username = session.args[0];
        if (!username) return session.reply("请输入用户名");
        const data = await DivingFish.getPlayerBest50(username);
        if (!data) return session.reply("获取用户资料失败");
        session.send("正在生成图片...");
        let chartList: IChart[];
        if (
            this.client.config.getSync("maimai::config.useLocalDatabase") &&
            this.client.config.getSync("maimai::config.localDatabasePath")
        ) {
            chartList = [...data.charts.sd, ...data.charts.dx]
                .map((chart) => {
                    return this.maiDraw.getLocalChart(
                        chart.song_id,
                        chart.level_index
                    );
                })
                .filter((v) => v !== null);
        } else {
            chartList = await this.lxns.getSaltChartList();
        }
        const result = await this.maiDraw.draw(
            data.nickname,
            data.rating,
            await DivingFish.toSalt(
                data.charts.dx,
                await this.lxns.getSaltChartList()
            ),
            await DivingFish.toSalt(
                data.charts.sd,
                await this.lxns.getSaltChartList()
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
