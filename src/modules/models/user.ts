import bcrypt from "bcryptjs";
import { Document, Model, Schema, Types, model } from "mongoose";
import idValidator from "mongoose-id-validator2";
import uniqueValidator from "mongoose-unique-validator";
import { ValidatorError } from "../errors";

export interface IUser {
  username: string;
  password: string;
  watched: number[];
  createdAt: Date;
  updatedAt: Date;
}

interface IUserMethods {
  isValidPassword(password: string): boolean;
}

export type UserModel = Model<IUser, unknown, IUserMethods>;

const UserSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: /^\w+$/,
    },
    password: {
      type: String,
      required: true,
    },
    watched: [
      {
        type: Number,
        ref: "Episode",
        required: true,
        default: [],
      },
    ],
  },
  { timestamps: true }
);

UserSchema.plugin(uniqueValidator);
UserSchema.plugin(idValidator);

UserSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  if (this.password.length < 6) {
    throw new ValidatorError("password", "minlength");
  }
  if (this.password.length > 100) {
    throw new ValidatorError("password", "maxlength");
  }
  const hash = bcrypt.hashSync(this.password, 12);
  this.password = hash;
  next();
});

UserSchema.method<IUser>("isValidPassword", function (password: string) {
  return bcrypt.compareSync(password, this.password);
});

export type UserType = Document<unknown, unknown, IUser> &
  IUser & { _id: Types.ObjectId } & IUserMethods;

export default model<IUser, UserModel>("User", UserSchema, "users");
