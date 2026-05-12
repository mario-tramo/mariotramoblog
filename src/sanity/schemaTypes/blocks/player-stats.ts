import { defineType, defineField, defineArrayMember } from "sanity";

export const playerStats = defineType({
  name: "playerStats",
  title: "Statistiche Giocatore",
  type: "object",
  fields: [
    defineField({
      name: "playerName",
      title: "Nome Giocatore",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "playerImage",
      title: "Foto Giocatore",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "team",
      title: "Squadra",
      type: "string",
    }),
    defineField({
      name: "role",
      title: "Ruolo",
      type: "string",
      options: {
        list: [
          { title: "Portiere", value: "goalkeeper" },
          { title: "Difensore", value: "defender" },
          { title: "Centrocampista", value: "midfielder" },
          { title: "Attaccante", value: "forward" },
        ],
      },
    }),
    defineField({
      name: "stats",
      title: "Statistiche",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Statistica",
              type: "string",
              description: "Es: Gol, Assist, Presenze, Minuti, Voto",
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
      name: "rating",
      title: "Voto",
      type: "number",
      description: "Voto da 1 a 10",
      validation: (rule) => rule.min(1).max(10),
    }),
  ],
  preview: {
    select: { playerName: "playerName", team: "team", rating: "rating" },
    prepare({ playerName, team, rating }) {
      return {
        title: playerName,
        subtitle: `${team || ""}${rating ? ` — Voto: ${rating}` : ""}`,
      };
    },
  },
});
