/*
  Add these fields to your existing User model schema.
  Paste inside the existing userSchema definition.
*/

// ── Additional fields to add to user schema ──────────
const additionalUserFields = {
  phone: {
    type:  String,
    trim:  true,
    default: "",
  },
  avatar: {
    type:  String,
    default: "",
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other", ""],
    default: "",
  },
  addresses: [
    {
      label:    { type: String, default: "Home" },  // "Home" | "Office" | "Other"
      fullName: { type: String, required: true, trim: true },
      phone:    { type: String, required: true, trim: true },
      address:  { type: String, required: true, trim: true },
      area:     { type: String, required: true, trim: true },
      city:     { type: String, required: true, trim: true },
      district: { type: String, required: true, trim: true },
      zip:      { type: String, trim: true },
      isDefault:{ type: Boolean, default: false },
    },
  ],
  preferences: {
    newsletter:     { type: Boolean, default: true  },
    smsAlerts:      { type: Boolean, default: true  },
    emailAlerts:    { type: Boolean, default: true  },
  },
};

/*
  Also extend your IUser interface with:

  phone?:       string;
  avatar?:      string;
  dateOfBirth?: Date;
  gender?:      "male" | "female" | "other" | "";
  addresses:    IAddress[];
  preferences?: {
    newsletter:  boolean;
    smsAlerts:   boolean;
    emailAlerts: boolean;
  };
*/

export interface IAddress {
  _id?:      string;
  label:     string;
  fullName:  string;
  phone:     string;
  address:   string;
  area:      string;
  city:      string;
  district:  string;
  zip?:      string;
  isDefault: boolean;
}

export default additionalUserFields;