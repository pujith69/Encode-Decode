import { NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { JAR_CONFIG } from "../../../lib/jarConfig";

export async function POST(req) {
    const formData = await req.formData();
    const file = formData.get("file");
    const operation = formData.get("operation");
    const outputFormat = formData.get("outputFormat") || "txt";

    if (!file) {
        return NextResponse.json({ error: "No file uploaded" });
    }

    const config = JAR_CONFIG[operation];

    if (!config) {
        return NextResponse.json({ error: "Invalid operation" });
    }

    const jarDir = path.join(process.cwd(), "jar");
    const originalName = file.name;
    const inputPath = path.join(jarDir, originalName);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(inputPath, buffer);

    const args = ["-jar", config.jar, ...config.buildArgs(originalName, outputFormat)];

    return new Promise((resolve, reject) => {

        const jarProcess = spawn("java", args, { cwd: jarDir });

        jarProcess.stderr.on("data", (data) => {
            console.error("JAR ERROR:", data.toString());
        });

        jarProcess.on("close", () => {

            const filesAfter = fs.readdirSync(jarDir);

            // Ignore jar files
            const generatedFiles = filesAfter.filter(f => !f.endsWith(".jar"));

            if (generatedFiles.length === 0) {
                return reject(new Error("No output file found"));
            }

            // Find newest file
            const newest = generatedFiles
                .map(f => ({
                    name: f,
                    time: fs.statSync(path.join(jarDir, f)).mtime.getTime()
                }))
                .sort((a, b) => b.time - a.time)[0];

            const outputPath = path.join(jarDir, newest.name);
            const outputBuffer = fs.readFileSync(outputPath);

            // Cleanup
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

            resolve(
                new NextResponse(outputBuffer, {
                    headers: {
                        "Content-Type": "application/octet-stream",
                        "Content-Disposition": `attachment; filename=${newest.name}`,
                    },
                })
            );
        });
    });
}
