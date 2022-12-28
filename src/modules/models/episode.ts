import { Model, Schema, model } from "mongoose";

interface IEpisode {
  _id: number;
  season: number;
  episode: number;
  title: {
    en: string;
    cs: string;
  };
  directedBy: string;
  writtenBy: string;
  premiere: {
    en: Date;
    cs: Date;
  };
  plot: {
    en: string;
    cs: string;
  };
}

export type EpisodeModel = Model<IEpisode>;

const EpisodeSchema = new Schema<IEpisode, EpisodeModel>({
  _id: {
    type: Number,
  },
  season: {
    type: Number,
    required: true,
  },
  episode: {
    type: Number,
    required: true,
  },
  title: {
    en: {
      type: String,
      required: true,
    },
    cs: {
      type: String,
      required: true,
    },
  },
  directedBy: {
    type: String,
    required: true,
  },
  writtenBy: {
    type: String,
    required: true,
  },
  premiere: {
    en: {
      type: Date,
      required: true,
    },
    cs: {
      type: Date,
      required: true,
    },
  },
  plot: {
    en: {
      type: String,
      required: true,
    },
    cs: {
      type: String,
      required: true,
    },
  },
});
export default model<IEpisode, EpisodeModel>(
  "Episode",
  EpisodeSchema,
  "episodes"
);
