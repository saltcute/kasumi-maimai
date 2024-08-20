import axios, { AxiosInstance } from "axios";
import { Cache } from "memory-cache";

export class LXNS {
    private cache = new Cache<string, object>();
    private axios: AxiosInstance;
    constructor(
        private token: string,
        private baseURL: string = "https://maimai.lxns.net/api/v0/maimai"
    ) {
        this.axios = axios.create({
            baseURL: this.baseURL,
            headers: {
                Authorization: this.token,
            },
        });
    }
    private async get<T>(
        endpoint: string,
        data?: any
    ): Promise<LXNS.IAPIResponse<T>> {
        return (await this.axios.get(endpoint, { params: data })).data;
    }
    private async post<T>(
        endpoint: string,
        data?: any
    ): Promise<LXNS.IAPIResponse<T>> {
        return (await this.axios.post(endpoint, data)).data;
    }
    async getPlayerBest50(friendCode: string) {
        return await this.get<LXNS.IBest50Response>(
            `/player/${friendCode}/bests`
        );
    }
    async getSong(songId: number): Promise<LXNS.ISong> {
        const songList = await this.getSongList();
        return songList.songs.filter((song) => song.id === songId)[0];
    }
    async getSongList(): Promise<LXNS.ISongListResponse> {
        const cached = this.cache.get(
            "lxns-songList"
        ) as LXNS.ISongListResponse | null;
        if (cached) return cached;
        const res = (await this.get(`/song/list`, { notes: true }).catch(
            (e) => {
                return {
                    songs: [],
                    genres: [],
                    versions: [],
                };
            }
        )) as unknown as LXNS.ISongListResponse;
        this.cache.put("lxns-songList", res, 1000 * 60 * 60);
        return res;
    }
}

export namespace LXNS {
    /**
     * Utage charts uses `ILevelIndex.BASIC`,
     */
    export enum ELevelIndex {
        BASIC,
        ADVANCED,
        EXPERT,
        MASTER,
        REMASTER,
    }
    export enum EFCTypes {
        FULL_COMBO = "fc",
        FULL_COMBO_PLUS = "fcp",
        ALL_PERFECT = "ap",
        ALL_PERFECT_PLUS = "app",
    }
    export enum EFSTypes {
        SYNC = "sync",
        FULL_SYNC = "fs",
        FULL_SYNC_PLUS = "fsp",
        FULL_SYNC_DX = "fdx",
        FULL_SYNC_DX_PLUS = "fdxp",
    }
    export enum ERateTypes {
        D = "d",
        C = "c",
        B = "b",
        BB = "bb",
        BBB = "bbb",
        A = "a",
        AA = "aa",
        AAA = "aaa",
        S = "s",
        SP = "sp",
        SS = "ss",
        SSP = "ssp",
        SSS = "sss",
        SSSP = "sssp",
    }
    export enum ESongTypes {
        UTAGE = "utage",
        STANDARD = "standard",
        DX = "dx",
    }
    export interface ISimpleScore {
        id: number;
        song_name: string;
        /**
         * Chart difficulty string.
         * `"7", "11+", "13", "14+", "15"`
         */
        level: string;
        level_index: ELevelIndex;
        fc: EFCTypes | null;
        fs: EFSTypes | null;
        rate: ERateTypes;
        type: ESongTypes;
    }
    export interface IScore extends ISimpleScore {
        achievements: number;
        dx_score: number;
        dx_rating: number;
        play_time: string;
        upload_time: string;
    }
    export interface ISong {
        id: number;
        title: string;
        artist: string;
        genre: string;
        bpm: number;
        version: number;
        rights: string;
        disabled: boolean;
        difficulties: {
            standard: ISongDifficultyNormal[];
            dx: ISongDifficultyNormal[];
            utage?: (ISongDifficultyUtageNormal | ISongDifficultyUtageBuddy)[];
        };
    }
    export interface ISongDifficulty {
        type: ESongTypes;
        difficulty: ELevelIndex;
        level: string;
        level_value: number;
        note_designer: string;
        version: number;
        notes?: INotes | IBuddyNotes;
    }
    export interface ISongDifficultyNormal extends ISongDifficulty {
        type: ESongTypes.STANDARD | ESongTypes.DX;
        notes?: INotes;
    }

    export interface ISongDifficultyUtage extends ISongDifficulty {
        type: ESongTypes.UTAGE;
        kanji: string;
        description: string;
    }
    export interface ISongDifficultyUtageNormal extends ISongDifficultyUtage {
        is_buddy: false;
        notes?: INotes;
    }
    export interface ISongDifficultyUtageBuddy extends ISongDifficultyUtage {
        is_buddy: true;
        notes?: IBuddyNotes;
    }
    export interface INotes {
        total: number;
        tap: number;
        hold: number;
        slide: number;
        touch: number;
        break: number;
    }
    export interface IBuddyNotes {
        left: INotes;
        right: INotes;
    }

    export interface IBest50Response {
        /**
         * Old versions total rating.
         */
        standard_total: number;
        /**
         * New version total rating.
         */
        dx_total: number;
        /**
         * Old versions top 35 scores.
         */
        standard: IScore[];
        /**
         * New version top 15 scores.
         */
        dx: IScore[];
    }
    export interface IGenre {
        id: number;
        /**
         * Chinese name of the genre.
         */
        title: string;
        /**
         * Japanese name of the genre.
         */
        genre: string;
    }
    /**
     * All versions are Chinese.
     * Versions before Finale is the same as the Japanese version.
     */
    export interface IVersion {
        id: 0;
        title: string;
        version: number;
    }
    export interface ISongListResponse {
        songs: ISong[];
        genres: IGenre[];
        versions: IVersion[];
    }

    export interface IAPIResponse<T extends any> {
        success: boolean;
        code: number;
        message: string;
        data: T;
    }
}
