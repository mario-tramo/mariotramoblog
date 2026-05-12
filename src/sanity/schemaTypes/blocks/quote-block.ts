import { defineType, defineField } from "sanity";

export const quoteBlock = defineType({
  name: "quoteBlock",
  title: "Citazione",
  type: "object",
  fields: [
    defineField({
      name: "quote",
      title: "Citazione",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "author",
      title: "Autore",
      type: "string",
      description: "Es: Simone Inzaghi, Luciano Spalletti",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "role",
      title: "Ruolo",
      type: "string",
      description: "Es: Allenatore Inter, CT Italia, Centrocampista Juventus",
    }),
    defineField({
      name: "image",
      title: "Foto",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "context",
      title: "Contesto",
      type: "string",
      description: "Es: Conferenza stampa post-partita, Intervista Sky Sport",
    }),
  ],
  preview: {
    select: { quote: "quote", author: "author" },
    prepare({ quote, author }) {
      return {
        title: `"${quote?.substring(0, 60)}..."`,
        subtitle: `— ${author}`,
      };
    },
  },
});
