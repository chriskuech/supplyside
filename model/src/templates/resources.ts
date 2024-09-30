import { deepStrictEqual } from "assert";
import {
  entries,
  filter,
  flatMap,
  groupBy,
  map,
  mapValues,
  pipe,
} from "remeda";
import { ResourceTemplate } from "./types";
import { fields } from "./fields";
import { config } from "../config";

const _resources = (
  environment: "development" | "integration" | "production"
) =>
  ({
    mcMasterCarrVendor: {
      templateId: "5a71b50c-0a97-4c6a-aec0-2467c1655ce7",
      type: "Vendor",
      fields: [
        {
          field: fields.name,
          value: { string: "McMaster-Carr" },
        },
        {
          field: fields.poRecipient,
          value: {
            contact: {
              email: environment === "production" ? "sales@mcmaster.com" : null,
              name: null,
              phone: "(562) 692-5911",
              title: null,
            },
          },
        },
      ],
    },
  } as const satisfies Record<string, ResourceTemplate>);

export const resources = () => {
  const data = _resources(config.NODE_ENV);

  // Ensure that the templateIds are unique
  deepStrictEqual(
    pipe(
      [data],
      flatMap((e) => Object.values(e)),
      map((e) => e.templateId),
      groupBy((e) => e),
      mapValues((group) => group.length),
      entries(),
      filter(([, count]) => count > 1),
      map(([templateId]) => templateId)
    ),
    []
  );

  return data;
};

// TODO: Ensure that fields respect system schemas and values respect fieldType
