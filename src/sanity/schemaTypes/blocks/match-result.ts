import { defineType, defineField } from "sanity";

export const matchResult = defineType({
  name: "matchResult",
  title: "Risultato Partita",
  type: "object",
  fields: [
    defineField({
      name: "competition",
      title: "Competizione",
      type: "string",
      description: "Es: Serie A, Champions League, Coppa Italia",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "matchday",
      title: "Giornata / Turno",
      type: "string",
      description: "Es: Giornata 34, Quarti di finale",
    }),
    defineField({
      name: "date",
      title: "Data e ora",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "stadium",
      title: "Stadio",
      type: "string",
    }),
    defineField({
      name: "homeTeam",
      title: "Squadra Casa",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "homeLogo",
      title: "Logo Casa",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "homeScore",
      title: "Gol Casa",
      type: "number",
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: "awayTeam",
      title: "Squadra Trasferta",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "awayLogo",
      title: "Logo Trasferta",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "awayScore",
      title: "Gol Trasferta",
      type: "number",
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: "status",
      title: "Stato",
      type: "string",
      options: {
        list: [
          { title: "Programmata", value: "scheduled" },
          { title: "In corso", value: "live" },
          { title: "Primo tempo", value: "first_half" },
          { title: "Intervallo", value: "half_time" },
          { title: "Secondo tempo", value: "second_half" },
          { title: "Terminata", value: "finished" },
          { title: "Supplementari", value: "extra_time" },
          { title: "Rigori", value: "penalties" },
          { title: "Rinviata", value: "postponed" },
        ],
      },
      initialValue: "finished",
    }),
    defineField({
      name: "homeScorers",
      title: "Marcatori Casa",
      type: "array",
      of: [{ type: "string" }],
      description: "Es: Lautaro 23', Barella 67'",
    }),
    defineField({
      name: "awayScorers",
      title: "Marcatori Trasferta",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
  preview: {
    select: {
      homeTeam: "homeTeam",
      awayTeam: "awayTeam",
      homeScore: "homeScore",
      awayScore: "awayScore",
    },
    prepare({ homeTeam, awayTeam, homeScore, awayScore }) {
      return {
        title: `${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`,
      };
    },
  },
});
