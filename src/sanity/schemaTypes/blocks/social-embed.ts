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
        "Incolla il link del post. Esempi:\n" +
        "• TikTok: https://www.tiktok.com/@utente/video/1234567890\n" +
        "• Instagram: https://www.instagram.com/p/ABC123/ oppure /reel/ABC123/\n" +
        "• X (Twitter): https://x.com/utente/status/1234567890\n" +
        "• Facebook: https://www.facebook.com/utente/posts/1234567890\n" +
        "• Threads: https://www.threads.net/@utente/post/ABC123",
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
