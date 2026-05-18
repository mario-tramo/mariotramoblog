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
    defineField({
      name: "description",
      title: "Descrizione",
      type: "text",
      rows: 3,
      description:
        "Contesto aggiuntivo sul post embeddato (es. perché è rilevante per l'articolo)",
    }),
    defineField({
      name: "width",
      title: "Larghezza massima (px)",
      type: "number",
      description:
        "Larghezza massima dell'embed in pixel. Se non specificata, usa il valore predefinito della piattaforma.",
      validation: (rule) => rule.min(200).max(1200),
    }),
    defineField({
      name: "height",
      title: "Altezza (px)",
      type: "number",
      description:
        "Altezza dell'embed in pixel. Se non specificata, usa il valore predefinito della piattaforma.",
      validation: (rule) => rule.min(200).max(1500),
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
