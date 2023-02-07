/**
 * Transform Errors to plain JSON objects so they can be logged via
 * `JSON.stringify`.
 *
 * @param json Some JSON that might be an error.
 * @returns The untransformed JSON if it was not an error, otherwise a
 * new object with the same keys and values as the Error, but as a plain JSON
 * object.
 */
const unErrorJson = (json) => {
  if (json instanceof Error) {
    const error = json;
    const unError = {};

    for (const key of Object.getOwnPropertyNames(error)) {
      unError[key] = error[key];
    }

    return unError;
  }

  return json;
};

const JsonUtils = {
  unErrorJson
};

export default JsonUtils;
