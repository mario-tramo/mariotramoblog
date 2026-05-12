import { defineType, defineField, defineArrayMember } from "sanity";

export const matchTimeline = defineType({
  name: "matchTimeline",
  title: "Cronologia Partita",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Titolo",
      type: "string",
      description: "Es: Cronologia Inter vs Milan",
    }),
    defineField({
      name: "events",
      title: "Eventi",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "minute",
              title: "Minuto",
              type: "string",
              description: "Es: 23', 45+2', 90+3'",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "type",
              title: "Tipo Evento",
              type: "string",
              options: {
                list: [
                  { title: "⚽ Gol", value: "goal" },
                  { title: "🅰️ Assist", value: "assist" },
                  { title: "🟡 Cartellino Giallo", value: "yellow_card" },
                  { title: "🟡🟡 Doppio Giallo", value: "second_yellow" },
                  { title: "🔴 Cartellino Rosso", value: "red_card" },
                  { title: "🔄 Sostituzione", value: "substitution" },
                  { title: "⚽❌ Gol annullato", value: "disallowed_goal" },
                  { title: "📺 VAR", value: "var" },
                  { title: "🥅 Rigore", value: "penalty" },
                  { title: "❌ Rigore sbagliato", value: "penalty_missed" },
                  { title: "🏥 Infortunio", value: "injury" },
                  { title: "🏁 Inizio/Fine tempo", value: "period" },
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "team",
              title: "Squadra",
              type: "string",
              options: {
                list: [
                  { title: "Casa", value: "home" },
                  { title: "Trasferta", value: "away" },
                ],
              },
            }),
            defineField({
              name: "player",
              title: "Giocatore",
              type: "string",
            }),
            defineField({
              name: "playerOut",
              title: "Giocatore Uscente",
              type: "string",
              description: "Solo per sostituzioni",
              hidden: ({ parent }) => parent?.type !== "substitution",
            }),
            defineField({
              name: "description",
              title: "Descrizione",
              type: "text",
              rows: 2,
            }),
          ],
          preview: {
            select: {
              minute: "minute",
              type: "type",
              player: "player",
            },
            prepare({ minute, type, player }) {
              const icons: Record<string, string> = {
                goal: "⚽",
                yellow_card: "🟡",
                second_yellow: "🟡🟡",
                red_card: "🔴",
                substitution: "🔄",
                var: "📺",
                penalty: "🥅",
                penalty_missed: "❌",
                injury: "🏥",
                period: "🏁",
                disallowed_goal: "⚽❌",
                assist: "🅰️",
              };
              return {
                title: `${minute} ${icons[type] || ""} ${player || ""}`,
              };
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: title || "Cronologia Partita" };
    },
  },
});
