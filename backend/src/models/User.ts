import { Schema, model, Document } from "mongoose";

export interface INotificationPreference {
  emailDigest: boolean;
  deadlineReminders: boolean;
  whatsappEnabled: boolean;
  whatsappNumber?: string;
  telegramEnabled: boolean;
  telegramChatId?: string;
  assignmentAlerts: boolean;
  streakMilestones: boolean;
}

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  displayName?: string;
  onboardingCompleted: boolean;
  notificationPreferences: INotificationPreference;
  googleCalendarTokens?: {
    accessToken: string;
    refreshToken: string;
    expiryDate: number;
  };
  stripeCustomerId?: string;
  subscriptionPlan: "free" | "pro" | "team";
  subscriptionStatus: "active" | "canceled" | "past_due" | "trialing" | "none";
  stripeSubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    emailDigest: { type: Boolean, default: true },
    deadlineReminders: { type: Boolean, default: true },
    whatsappEnabled: { type: Boolean, default: false },
    whatsappNumber: { type: String },
    telegramEnabled: { type: Boolean, default: false },
    telegramChatId: { type: String },
    assignmentAlerts: { type: Boolean, default: true },
    streakMilestones: { type: Boolean, default: true },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, index: true },
    displayName: { type: String },
    onboardingCompleted: { type: Boolean, default: false },
    notificationPreferences: {
      type: notificationPreferenceSchema,
      default: () => ({}),
    },
    googleCalendarTokens: {
      accessToken: { type: String },
      refreshToken: { type: String },
      expiryDate: { type: Number },
    },
    stripeCustomerId: { type: String },
    subscriptionPlan: {
      type: String,
      enum: ["free", "pro", "team"],
      default: "free",
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "canceled", "past_due", "trialing", "none"],
      default: "none",
    },
    stripeSubscriptionId: { type: String },
  },
  { timestamps: true }
);

export default model<IUser>("User", userSchema);
