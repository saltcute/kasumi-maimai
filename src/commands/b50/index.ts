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
import { EDifficulty, IChart } from "@/lib/maiDraw/type";

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
        console.log(session.args);
        const username = session.args[0];
        const source = session.args[session.args.indexOf("\\-\\-source") + 1];
        const theme = session.args[session.args.indexOf("\\-\\-theme") + 1];

        const { data: msg } = await session.send("正在生成图片...");
        let result: Buffer | null = null;
        switch (source.toLowerCase()) {
            case "divingfish":
            case "df":
            case "水鱼": {
                if (!username) return session.reply("请输入用户名");
                const data = await DivingFish.getPlayerBest50(username);
                if (!data) return session.reply("获取用户资料失败");
                let chartList: IChart[];
                if (
                    this.client.config.getSync(
                        "maimai::config.useLocalDatabase"
                    ) &&
                    this.client.config.getSync(
                        "maimai::config.localDatabasePath"
                    )
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
                result = await this.maiDraw.draw(
                    data.nickname,
                    data.rating,
                    await DivingFish.toSalt(data.charts.dx, chartList),
                    await DivingFish.toSalt(data.charts.sd, chartList),
                    {
                        scale: 1.5,
                        theme,
                    }
                );
                break;
            }
            case "lxns":
            case "lx":
            case "落雪":
            default: {
                if (!username) return session.reply("请输入好友代码");
                const data = (await this.lxns.getPlayerBest50(username))?.data;
                if (!data) return session.reply("获取用户资料失败");
                let chartList: IChart[];
                if (
                    this.client.config.getSync(
                        "maimai::config.useLocalDatabase"
                    ) &&
                    this.client.config.getSync(
                        "maimai::config.localDatabasePath"
                    )
                ) {
                    chartList = [...data.dx, ...data.standard]
                        .map((chart) => {
                            return this.maiDraw.getLocalChart(
                                chart.id +
                                    (chart.type == LXNS.ESongTypes.DX
                                        ? 10000
                                        : 0),
                                chart.level_index as unknown as EDifficulty
                            );
                        })
                        .filter((v) => v !== null);
                } else {
                    chartList = await this.lxns.getSaltChartList();
                }
                const profile = (await this.lxns.getPlayerProfile(username))
                    ?.data;
                result = await this.maiDraw.draw(
                    profile?.name ?? session.author.nickname,
                    data.dx_total + data.standard_total,
                    this.lxns.toSaltScore(data.dx, chartList),
                    this.lxns.toSaltScore(data.standard, chartList),
                    {
                        scale: 1.5,
                        theme,
                    }
                );
                break;
            }
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
