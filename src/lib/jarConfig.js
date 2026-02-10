export const JAR_CONFIG = {
    encode: {
        jar: "encoder.jar",
        buildArgs: (input) => [input],
        output: () => "processed_file.b64",
    },
    decode: {
        jar: "decoder.jar",
        buildArgs: (input, outputFormat) => [input, `decoded_output.${outputFormat}`],
        output: (input, outputFormat) => `decoded_output.${outputFormat}`,
    },
};
