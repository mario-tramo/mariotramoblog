import { defineType, defineField, defineArrayMember } from "sanity";

export const standings = defineType({
  name: "standings",
  title: "Classifica",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Titolo",
      type: "string",
      description: "Es: Classifica Serie A 2025/26",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "highlightTeams",
      title: "Squadre da evidenziare",
      type: "array",
      of: [{ type: "string" }],
      description: "Squadre evidenziate in grassetto nella tabella",
    }),
    defineField({
      name: "rows",
      title: "Righe classifica",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "position",
              title: "Pos",
              type: "number",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "team",
              title: "Squadra",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({ name: "played", title: "G", type: "number" }),
            defineField({ name: "won", title: "V", type: "number" }),
            defineField({ name: "drawn", title: "P", type: "number" }),
            defineField({ name: "lost", title: "S", type: "number" }),
            defineField({ name: "goalsFor", title: "GF", type: "number" }),
            defineField({
              name: "goalsAgainst",
              title: "GS",
              type: "number",
            }),
            defineField({ name: "points", title: "Punti", type: "number" }),
          ],
          preview: {
            select: { position: "position", team: "team", points: "points" },
            prepare({ position, team, points }) {
              return { title: `${position}. ${team} — ${points} pts` };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "zones",
      title: "Zone classifica",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Etichetta",
              type: "string",
              description: "Es: Champions League, Retrocessione",
            }),
            defineField({
              name: "color",
              title: "Colore",
              type: "string",
              options: {
                list: [
                  { title: "Blu (Champions)", value: "blue" },
                  { title: "Arancione (Europa League)", value: "orange" },
                  { title: "Verde (Conference)", value: "green" },
                  { title: "Rosso (Retrocessione)", value: "red" },
                ],
              },
            }),
            defineField({
              name: "fromPosition",
              title: "Da posizione",
              type: "number",
            }),
            defineField({
              name: "toPosition",
              title: "A posizione",
              type: "number",
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "title" },
  },
});
