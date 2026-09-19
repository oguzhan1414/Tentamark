import type { JsonSchema } from "./contracts/types";
import { McpErrors } from "./contracts/errors";

/*
  Deliberately not a full JSON Schema implementation — no $ref, no
  oneOf/anyOf/allOf, no format validation (uuid/date-time are accepted as
  any string). Every tool contract in contracts/tools/*.ts only uses the
  subset this covers: type, properties, required, enum, minLength,
  maxLength, minimum, maximum, items (for flat arrays). Reaching for a real
  validator (ajv, zod) is worth doing before this tool surface grows much
  past its current 13 tools — flagged here rather than silently pretended
  to be complete.
*/
export function validateToolInput(schema: JsonSchema, value: unknown, path = "input"): void {
  if (schema.type === "object") {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw McpErrors.validationError(`${path} must be an object.`);
    }
    const obj = value as Record<string, unknown>;
    for (const requiredKey of schema.required ?? []) {
      if (!(requiredKey in obj) || obj[requiredKey] === undefined || obj[requiredKey] === null) {
        throw McpErrors.validationError(`${path}.${requiredKey} is required.`);
      }
    }
    if (schema.additionalProperties === false && schema.properties) {
      const unknownKeys = Object.keys(obj).filter((k) => !(k in schema.properties!));
      if (unknownKeys.length > 0) {
        throw McpErrors.validationError(`${path} has unknown field(s): ${unknownKeys.join(", ")}`);
      }
    }
    for (const [key, propSchema] of Object.entries(schema.properties ?? {})) {
      if (obj[key] !== undefined && obj[key] !== null) validateToolInput(propSchema, obj[key], `${path}.${key}`);
    }
    return;
  }

  if (schema.type === "array") {
    if (!Array.isArray(value)) throw McpErrors.validationError(`${path} must be an array.`);
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      throw McpErrors.validationError(`${path} must contain at least ${schema.minItems} item(s).`);
    }
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      throw McpErrors.validationError(`${path} must contain at most ${schema.maxItems} item(s).`);
    }
    if (schema.items) value.forEach((item, i) => validateToolInput(schema.items!, item, `${path}[${i}]`));
    return;
  }

  if (schema.type === "string") {
    if (typeof value !== "string") throw McpErrors.validationError(`${path} must be a string.`);
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      throw McpErrors.validationError(`${path} must be at least ${schema.minLength} characters.`);
    }
    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      throw McpErrors.validationError(`${path} must be at most ${schema.maxLength} characters.`);
    }
    if (schema.enum && !schema.enum.includes(value)) {
      throw McpErrors.validationError(`${path} must be one of: ${schema.enum.join(", ")}`);
    }
    if (schema.format === "uuid" && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
      throw McpErrors.validationError(`${path} must be a valid UUID.`);
    }
    if (schema.format === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw McpErrors.validationError(`${path} must be an ISO date (YYYY-MM-DD).`);
    }
    if (schema.format === "date-time" && Number.isNaN(Date.parse(value))) {
      throw McpErrors.validationError(`${path} must be a valid ISO date-time.`);
    }
    if (schema.format === "uri") {
      try { new URL(value); } catch { throw McpErrors.validationError(`${path} must be a valid URI.`); }
    }
    return;
  }

  if (schema.type === "integer" || schema.type === "number") {
    if (typeof value !== "number" || Number.isNaN(value)) throw McpErrors.validationError(`${path} must be a number.`);
    if (schema.type === "integer" && !Number.isInteger(value)) throw McpErrors.validationError(`${path} must be an integer.`);
    if (schema.minimum !== undefined && value < schema.minimum) throw McpErrors.validationError(`${path} must be >= ${schema.minimum}.`);
    if (schema.maximum !== undefined && value > schema.maximum) throw McpErrors.validationError(`${path} must be <= ${schema.maximum}.`);
    return;
  }

  if (schema.type === "boolean" && typeof value !== "boolean") {
    throw McpErrors.validationError(`${path} must be a boolean.`);
  }
}
