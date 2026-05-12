import { defineType, defineField, defineArrayMember } from "sanity";

export const infoBox = defineType({
  name: "infoBox",
  title: "Scheda Informativa",
  type: "object",
  fields: [
    defineField({
      name: "type",
      title: "Tipo Scheda",
      type: "string",
      options: {
        list: [
          { title: "Giocatore", value: "player" },
          { title: "Squadra", value: "team" },
          { title: "Allenatore", value: "coach" },
          { title: "Stadio", value: "stadium" },
          { title: "Competizione", value: "competition" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Nome",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Immagine",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "facts",
      title: "Dati",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Etichetta",
              type: "string",
              description:
                "Es: Nazionalità, Età, Valore di mercato, Contratto fino a",
            }),
            defineField({
              name: "value",
              title: "Valore",
              type: "string",
            }),
          ],
          preview: {
            select: { label: "label", value: "value" },
            prepare({ label, value }) {
              return { title: `${label}: ${value}` };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "description",
      title: "Descrizione breve",
      type: "text",
      rows: 3,
    }),
  ],
  preview: {
    select: { title: "title", type: "type" },
    prepare({ title, type }) {
      const icons: Record<string, string> = {
        player: "👤",
        team: "🏟️",
        coach: "🧑‍💼",
        stadium: "🏟️",
        competition: "🏆",
      };
      return { title: `${icons[type] || ""} ${title}` };
    },
  },
});
