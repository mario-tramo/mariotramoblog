import { defineType, defineField } from "sanity";

export const socialEmbed = defineType({
  name: "socialEmbed",
  title: "Social Embed",
  type: "object",
  fields: [
    defineField({
      name: "url",
      title: "URL del post",
      type: "url",
      description:
        "Link al post: TikTok, Instagram, X (Twitter), Facebook o Threads",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "platform",
      title: "Piattaforma",
      type: "string",
      options: {
        list: [
          { title: "TikTok", value: "tiktok" },
          { title: "Instagram", value: "instagram" },
          { title: "X (Twitter)", value: "twitter" },
          { title: "Facebook", value: "facebook" },
          { title: "Threads", value: "threads" },
        ],
      },
      description:
        "Seleziona la piattaforma. Se non specificata, viene rilevata automaticamente dall'URL.",
    }),
    defineField({
      name: "caption",
      title: "Didascalia",
      type: "string",
      description: "Descrizione opzionale sotto il post",
    }),
  ],
  preview: {
    select: { caption: "caption", url: "url", platform: "platform" },
    prepare({ caption, url, platform }) {
      const platformLabels: Record<string, string> = {
        tiktok: "TikTok",
        instagram: "Instagram",
        twitter: "X (Twitter)",
        facebook: "Facebook",
        threads: "Threads",
      };
      const label = platform
        ? platformLabels[platform] || platform
        : "Social";
      return {
        title: caption || url || "Social Embed",
        subtitle: `📱 ${label}`,
      };
    },
  },
});
