import { defineType, defineField } from "sanity";

export const videoEmbed = defineType({
  name: "videoEmbed",
  title: "Video",
  type: "object",
  fields: [
    defineField({
      name: "url",
      title: "URL Video",
      type: "url",
      description: "YouTube, Vimeo, o altro link video",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "caption",
      title: "Didascalia",
      type: "string",
      description: "Es: Highlights Inter-Milan 2-1",
    }),
    defineField({
      name: "type",
      title: "Tipo",
      type: "string",
      options: {
        list: [
          { title: "Highlights", value: "highlights" },
          { title: "Intervista", value: "interview" },
          { title: "Conferenza stampa", value: "press_conference" },
          { title: "Analisi tattica", value: "tactical_analysis" },
          { title: "Altro", value: "other" },
        ],
      },
      initialValue: "highlights",
    }),
  ],
  preview: {
    select: { caption: "caption", url: "url" },
    prepare({ caption, url }) {
      return {
        title: caption || url || "Video",
        subtitle: "🎬 Video",
      };
    },
  },
});
