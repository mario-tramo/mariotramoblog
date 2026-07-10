import { defineType, defineField, defineArrayMember } from "sanity";

export const imageGallery = defineType({
  name: "imageGallery",
  title: "Galleria Immagini",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Titolo Galleria",
      type: "string",
      description: "Es: Le foto di Inter-Milan",
    }),
    defineField({
      name: "images",
      title: "Immagini",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "caption",
              title: "Didascalia",
              type: "string",
            }),
            defineField({
              name: "credit",
              title: "Credit",
              type: "string",
              description: "Es: Getty Images, ANSA",
            }),
            defineField({
              name: "aiGenerated",
              title: "Generata con IA",
              description: 'Antepone "Foto generata usando IA." alla didascalia',
              type: "boolean",
              initialValue: true,
            }),
          ],
        }),
      ],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      options: {
        list: [
          { title: "Griglia", value: "grid" },
          { title: "Carosello", value: "carousel" },
          { title: "Masonry", value: "masonry" },
        ],
      },
      initialValue: "carousel",
    }),
  ],
  preview: {
    select: { title: "title", images: "images" },
    prepare({ title, images }) {
      return {
        title: title || "Galleria",
        subtitle: `📸 ${images?.length || 0} foto`,
      };
    },
  },
});
