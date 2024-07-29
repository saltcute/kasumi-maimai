import { CustomStorage } from "config/type";
import Kasumi, { BaseCommand, BaseSession, CommandFunction } from "kasumi.js";
import { DivingFish } from "./lib";

export default class Best50Command extends BaseCommand<Kasumi<CustomStorage>> {
    name = "b50";
    description = "查询 b50 图片";
    func: CommandFunction<BaseSession, any> = async (session) => {
        const username = session.args[0];
        if (!username) return session.reply("请输入用户名");
        const data = await DivingFish.getPlayerBest50(username);
        await session.reply(`Player rating: ${data.rating}`);
    };
}
