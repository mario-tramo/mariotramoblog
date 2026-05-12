import { defineType, defineField } from "sanity";

export const callout = defineType({
  name: "callout",
  title: "Callout",
  type: "object",
  fields: [
    defineField({
      name: "type",
      title: "Tipo",
      type: "string",
      options: {
        list: [
          { title: "🔴 Breaking News", value: "breaking" },
          { title: "🔄 Calciomercato", value: "transfer" },
          { title: "🏥 Infortunio", value: "injury" },
          { title: "📺 VAR / Decisione arbitrale", value: "var" },
          { title: "ℹ️ Info", value: "info" },
          { title: "⚠️ Attenzione", value: "warning" },
          { title: "📊 Statistica", value: "stat" },
          { title: "💬 Rumor", value: "rumor" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Titolo",
      type: "string",
    }),
    defineField({
      name: "text",
      title: "Testo",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "source",
      title: "Fonte",
      type: "string",
      description: "Es: Sky Sport, Gianluca Di Marzio, Fabrizio Romano",
    }),
  ],
  preview: {
    select: { type: "type", title: "title", text: "text" },
    prepare({ type, title, text }) {
      const icons: Record<string, string> = {
        breaking: "🔴",
        transfer: "🔄",
        injury: "🏥",
        var: "📺",
        info: "ℹ️",
        warning: "⚠️",
        stat: "📊",
        rumor: "💬",
      };
      return {
        title: `${icons[type] || ""} ${title || text?.substring(0, 50) || "Callout"}`,
      };
    },
  },
});
