import { defineType, defineField, defineArrayMember } from "sanity";

export const lineup = defineType({
  name: "lineup",
  title: "Formazione",
  type: "object",
  fields: [
    defineField({
      name: "teamName",
      title: "Squadra",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "teamLogo",
      title: "Logo Squadra",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "formation",
      title: "Modulo",
      type: "string",
      description: "Es: 4-3-3, 3-5-2, 4-2-3-1",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "coach",
      title: "Allenatore",
      type: "string",
    }),
    defineField({
      name: "starters",
      title: "Titolari",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "number", title: "Numero", type: "number" }),
            defineField({
              name: "name",
              title: "Nome",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "position",
              title: "Posizione",
              type: "string",
              options: {
                list: [
                  { title: "Portiere", value: "GK" },
                  { title: "Difensore", value: "DEF" },
                  { title: "Centrocampista", value: "MID" },
                  { title: "Attaccante", value: "FWD" },
                ],
              },
            }),
            defineField({
              name: "captain",
              title: "Capitano",
              type: "boolean",
              initialValue: false,
            }),
          ],
          preview: {
            select: {
              number: "number",
              name: "name",
              position: "position",
              captain: "captain",
            },
            prepare({ number, name, position, captain }) {
              return {
                title: `${number ? number + ". " : ""}${name}${captain ? " ©" : ""}`,
                subtitle: position,
              };
            },
          },
        }),
      ],
      validation: (rule) => rule.max(11),
    }),
    defineField({
      name: "substitutes",
      title: "Panchina",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "number", title: "Numero", type: "number" }),
            defineField({
              name: "name",
              title: "Nome",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "position",
              title: "Posizione",
              type: "string",
              options: {
                list: [
                  { title: "Portiere", value: "GK" },
                  { title: "Difensore", value: "DEF" },
                  { title: "Centrocampista", value: "MID" },
                  { title: "Attaccante", value: "FWD" },
                ],
              },
            }),
          ],
          preview: {
            select: { number: "number", name: "name" },
            prepare({ number, name }) {
              return { title: `${number ? number + ". " : ""}${name}` };
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { teamName: "teamName", formation: "formation" },
    prepare({ teamName, formation }) {
      return { title: `${teamName} (${formation})` };
    },
  },
});
