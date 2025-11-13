import logger from "../../logger";
import type { Command } from "../../types.js";

const shell: Command = {
	name: "shell",
	description:
		"Executes shell commands based on the host OS.\n\n**⚠️ WARNING:** This command can execute arbitrary system commands and should only be used by bot owners. Use with extreme caution.",

	async execute(message, args) {
		const MAX_OUTPUT_LENGTH = 1900; // Maximum length for message content
		const TIMEOUT = 30000; // 30 second timeout

		const sanitizeOutput = (
			output: string,
			max_output_length?: number,
		): string => {
			if (!output) return "";

			return output
				.replace(/\\/g, "\\\\") // Escape backslashes
				.replace(/`/g, "\\`") // Escape backticks
				.replace(/@/g, "@\u200b") // Break mentions
				.substring(0, max_output_length);
		};

		const formatOutput = (
			stdout: string,
			stderr: string,
			error?: Error,
		): string => {
			const parts: string[] = [];

			if (stdout?.trim()) {
				parts.push(`**Output:**\n\`\`\`bash\n${sanitizeOutput(stdout, MAX_OUTPUT_LENGTH)}\n\`\`\``);
			}

			if (stderr?.trim()) {
				parts.push(`**Error:**\n\`\`\`bash\n${sanitizeOutput(stderr, MAX_OUTPUT_LENGTH)}\n\`\`\``);
			}

			if (error) {
				parts.push(`**System Error:**\n\`\`\`bash\n${sanitizeOutput(error.message, MAX_OUTPUT_LENGTH)}\n\`\`\``);
			}

			return parts.join("\n\n") || "No output";
		};

		if (!args?.length) {
			message.reply({
				embeds: [
					{
						title: "Error",
						description: "Please provide a command to run",
						colour: "#ff0000",
					},
				],
			});

			return;
		}

		const command = args.join(" ");
		logger.info(`Executing shell command: ${command}`);

		try {
			// Execute command using Bun.spawnSync
			const result = Bun.spawnSync({
				cmd: ["sh", "-c", command],
				timeout: TIMEOUT,
				maxBuffer: 1024 * 1024 * 2, // 2MB buffer
			});

			const stdout = result.stdout?.toString() || "";
			const stderr = result.stderr?.toString() || "";
			const exitCode = result.exitCode ?? 1;

			// Format the output
			const formattedOutput = formatOutput(stdout, stderr);
			const statusColor = exitCode === 0 ? "#00ff00" : "#ff0000";
			const statusText = exitCode === 0 ? "Success" : "Failed";

			message.reply({
				embeds: [
					{
						title: `Shell Command ${statusText}`,
						description: [
							`**Command:** \`${sanitizeOutput(command, MAX_OUTPUT_LENGTH)}\``,
							`**Exit Code:** ${exitCode}`,
							"",
							formattedOutput,
						].join("\n"),
						colour: statusColor,
					},
				],
			});

			return;
		} catch (error) {
			logger.error("Shell command error:", error);

			message.reply({
				embeds: [
					{
						title: "Shell Command Error",
						description: [
							`**Command:** \`${sanitizeOutput(command, MAX_OUTPUT_LENGTH)}\``,
							"",
							"**Error:**",
							"```",
							sanitizeOutput(
								error instanceof Error
									? error.message
									: "Unknown error occurred",
								MAX_OUTPUT_LENGTH,
							),
							"```",
						].join("\n"),
						colour: "#ff0000",
					},
				],
			});
			return;
		}
	},
};

export default shell;
