import { defineType, defineField } from "sanity";

export const sport = defineType({
  name: "sport",
  title: "Sport",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Nome Sport",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "icon",
      title: "Icona",
      type: "string",
      description: "Emoji o nome icona: ⚽ 🏀 🎾 🏈 🏎️ 🚴 🏊 🥊",
    }),
  ],
  preview: {
    select: { title: "title", icon: "icon" },
    prepare({ title, icon }) {
      return { title: `${icon || ""} ${title}` };
    },
  },
});
