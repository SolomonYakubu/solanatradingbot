import { Context, Scenes } from "telegraf";
import { IUser } from "../db/models/user.js"; // Import the IUser interface

export interface MyContext extends Context {
  user: IUser;
  scene: Scenes.SceneContextScene<MyContext, Scenes.WizardSessionData>;
  wizard: Scenes.WizardContextWizard<MyContext>;
}
