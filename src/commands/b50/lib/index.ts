import axios from "axios";

export namespace DivingFish {
    export interface IPlayResult {
        achievements: number;
        ds: number;
        dxScore: number;
        fc: "" | "fc" | "fcp" | "ap" | "app";
        fs: "" | "sync" | "fs" | "fsp" | "fdx" | "fdxp";
        level: string;
        level_index: number;
        level_label: string;
        ra: number;
        rate:
            | "d"
            | "c"
            | "b"
            | "bb"
            | "bbb"
            | "a"
            | "aa"
            | "aaa"
            | "s"
            | "sp"
            | "ss"
            | "ssp"
            | "sss"
            | "sssp";
        song_id: number;
        title: string;
        type: "SD" | "DX";
    }
    export interface IBest50Response {
        additional_rating: 0;
        charts: {
            dx: IPlayResult[];
            sd: IPlayResult[];
        };
        nickname: string;
        plate: string;
        rating: number;
        user_general_data: null;
        username: string;
    }
}

export class DivingFish {
    static async getPlayerBest50(
        username: string
    ): Promise<DivingFish.IBest50Response> {
        return (
            await axios.post(
                "https://www.diving-fish.com/api/maimaidxprober/query/player",
                {
                    username,
                    b50: true,
                }
            )
        ).data;
    }
}
