import { Schema, model } from "mongoose";

const siteSettingsSchema = new Schema(
    {
        contact: {
            phone: {
                type: String,

                default: ""
            },
            email: {
                type: String,
                default: ""
            },
            instagram: {
                type: String,
                default: ""
            },
        },

        about: {
            title: {
                type: String,
                default: ""
            },
            title_ar: {
                type: String,
                default: ""
            },
            description: {
                type: String,
                default: ""
            },
            description_ar: {
                type: String,
                default: ""
            },
        },

        orderGuide: {
            images: [{
                url: {
                    type: String,
                    required: true
                },
                publicId: {
                    type: String,
                    required: true
                },
                displayOrder: {
                    type: Number,
                    default: 0
                }
            }]
        },

        terms: [{
            title: {
                type: String,
                default: ""
            },
            title_ar: {
                type: String,
                default: ""
            },
            content: {
                type: String,
                default: ""
            },
            content_ar: {
                type: String,
                default: ""
            },
        }],

        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        banner: {
            url: {
                type: String,
                default:''
            },
            publicId: {
                type: String,
                default:''
            }
        },
        productTypes: {
            type: [{
                name: { type: String, required: true },
                name_ar: { type: String, default: null }
            }],
            default: []
        },
        collectionTypes: {
            type: [{
                name: { type: String, required: true },
                name_ar: { type: String, default: null }
            }],
            default: []
        },
        colors: {
            type: [{
                name: { type: String, required: true },
                name_ar: { type: String, default: null },
                code: { type: String, default: null }
            }],
            default: []
        },
        sizes: {
            type: [String],
            default: []
        },
    },
    { timestamps: true },
);

siteSettingsSchema.statics.getSingleton = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = new this();
        await settings.save();
    }
    return settings;
};

export default model("SiteSettings", siteSettingsSchema);
