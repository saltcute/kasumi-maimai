import axios from "axios";
import {
    EAchievementTypes,
    EComboTypes,
    EDifficulty,
    ESyncTypes,
    IChart,
    IScore,
} from "../maiDraw/type";
import { LXNS } from "../lxns";

export namespace DivingFish {
    export interface IPlayResult {
        achievements: number;
        ds: number;
        dxScore: number;
        fc: "" | "fc" | "fcp" | "ap" | "app";
        fs: "" | "sync" | "fs" | "fsp" | "fsd" | "fsdp";
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
    static async toSalt(
        scores: DivingFish.IPlayResult[],
        charts: IChart[]
    ): Promise<IScore[]> {
        return scores.map((score) => {
            return {
                chart: (() => {
                    const chart = charts.find(
                        (chart) => chart.id === score.song_id
                    );
                    return {
                        id: score.song_id,
                        name: score.title,
                        difficulty: (() => {
                            switch (score.level_index) {
                                case 1:
                                    return EDifficulty.ADVANCED;
                                case 2:
                                    return EDifficulty.EXPERT;
                                case 3:
                                    return EDifficulty.MASTER;
                                case 4:
                                    return EDifficulty.REMASTER;
                                case 5:
                                    return EDifficulty.UTAGE;
                                default:
                                    return EDifficulty.BASIC;
                            }
                        })(),
                        level: score.ds,
                        maxDxScore: chart?.maxDxScore || 0,
                    };
                })(),
                combo: (() => {
                    switch (score.fc) {
                        case "fc":
                            return EComboTypes.FULL_COMBO;
                        case "fcp":
                            return EComboTypes.FULL_COMBO_PLUS;
                        case "ap":
                            return EComboTypes.ALL_PERFECT;
                        case "app":
                            return EComboTypes.ALL_PERFECT_PLUS;
                        default:
                            return EComboTypes.NONE;
                    }
                })(),
                sync: (() => {
                    switch (score.fs) {
                        case "sync":
                            return ESyncTypes.SYNC_PLAY;
                        case "fs":
                            return ESyncTypes.FULL_SYNC;
                        case "fsp":
                            return ESyncTypes.FULL_SYNC_PLUS;
                        case "fsd":
                            return ESyncTypes.FULL_SYNC_DX;
                        case "fsdp":
                            return ESyncTypes.FULL_SYNC_DX_PLUS;
                        default:
                            return ESyncTypes.NONE;
                    }
                })(),
                achievement: score.achievements,
                achievementRank: (() => {
                    switch (score.rate) {
                        case "c":
                            return EAchievementTypes.C;
                        case "b":
                            return EAchievementTypes.B;
                        case "bb":
                            return EAchievementTypes.BB;
                        case "bbb":
                            return EAchievementTypes.BBB;
                        case "a":
                            return EAchievementTypes.A;
                        case "aa":
                            return EAchievementTypes.AA;
                        case "aaa":
                            return EAchievementTypes.AAA;
                        case "s":
                            return EAchievementTypes.S;
                        case "sp":
                            return EAchievementTypes.SP;
                        case "ss":
                            return EAchievementTypes.SS;
                        case "ssp":
                            return EAchievementTypes.SSP;
                        case "sss":
                            return EAchievementTypes.SSS;
                        case "sssp":
                            return EAchievementTypes.SSSP;
                        default:
                            return EAchievementTypes.D;
                    }
                })(),
                dxRating: score.ra,
                dxScore: score.dxScore,
            };
        });
    }
}
