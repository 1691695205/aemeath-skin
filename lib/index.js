import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { installSettingsSection, settingsNamespace } from "@deepseek-ai/dsh-settings";
import z from "schemastery";

const name = "@dsh-external/dsh-client-ui-skin-aemeath";
const inject = ["webServer"];
const SETTINGS_ROUTE = "/api/dsh-aemeath/settings";
const SETTINGS_DIR = "dsh-client-ui-skin-aemeath";
const SETTINGS_FILE = "settings.json";
const MAX_BODY_BYTES = 16 * 1024;

/** Settings namespace shown in the DSH settings UI ("settings → 插件 → ui-skin-aemeath"). */
const SETTINGS_NAMESPACE = settingsNamespace("ui-skin-aemeath");

/** Defaults mirrored in lib/client.js so a never-touched section still works. */
const DEFAULTS = {
	enabled: true,
	left: true,
	right: true,
	charHeight: 55,
	offsetX: 0,
	bubbles: true,
	chain: true,
	corners: true,
	emblem: true,
	bubbleCount: 20,
	bubbleSpeed: 100,
	msgColor: true,
	msgFrame: false,
	msgOpacity: 68,
	contentWidth: 600,
	bgOpacity: 100
};

const BOOLEAN_KEYS = [
	"enabled", "left", "right", "bubbles", "chain", "corners", "emblem",
	"msgColor", "msgFrame"
];
const NUMBER_RANGES = {
	charHeight: [30, 80],
	offsetX: [-200, 200],
	bubbleCount: [5, 40],
	bubbleSpeed: [30, 200],
	msgOpacity: [20, 100],
	contentWidth: [400, 1200],
	bgOpacity: [20, 100]
};

const AemeathSettingsSchema = z.object({
	enabled: z.boolean().default(DEFAULTS.enabled),
	left: z.boolean().default(DEFAULTS.left),
	right: z.boolean().default(DEFAULTS.right),
	charHeight: z.number().min(30).max(80).step(1).default(DEFAULTS.charHeight),
	offsetX: z.number().min(-200).max(200).step(1).default(DEFAULTS.offsetX),
	bubbles: z.boolean().default(DEFAULTS.bubbles),
	chain: z.boolean().default(DEFAULTS.chain),
	corners: z.boolean().default(DEFAULTS.corners),
	emblem: z.boolean().default(DEFAULTS.emblem),
	bubbleCount: z.number().min(5).max(40).step(1).default(DEFAULTS.bubbleCount),
	bubbleSpeed: z.number().min(30).max(200).step(1).default(DEFAULTS.bubbleSpeed),
	msgColor: z.boolean().default(DEFAULTS.msgColor),
	msgFrame: z.boolean().default(DEFAULTS.msgFrame),
	msgOpacity: z.number().min(20).max(100).step(1).default(DEFAULTS.msgOpacity),
	contentWidth: z.number().min(400).max(1200).step(1).default(DEFAULTS.contentWidth),
	bgOpacity: z.number().min(20).max(100).step(1).default(DEFAULTS.bgOpacity)
});

function profileName() {
	const profile = process.env.DSH_DESKTOP_PROFILE;
	return profile && /^[A-Za-z0-9_-]+$/.test(profile) ? profile : "web";
}

function profileDir() {
	return join(process.env.DSH_HOME || join(homedir(), ".dsh"), "profiles", profileName());
}

function settingsPath() {
	return join(profileDir(), "data", SETTINGS_DIR, SETTINGS_FILE);
}

function isLoopback(req) {
	const address = req.socket && req.socket.remoteAddress;
	return address === "127.0.0.1" || address === "::1" || address === "::ffff:127.0.0.1";
}

function sendJson(res, status, value) {
	const data = Buffer.from(JSON.stringify(value), "utf8");
	res.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"cache-control": "no-store",
		"content-length": String(data.length)
	});
	res.end(data);
}

function sanitizeSettings(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return null;
	const clean = {};
	for (const key of BOOLEAN_KEYS) {
		if (typeof value[key] === "boolean") clean[key] = value[key];
	}
	for (const [key, range] of Object.entries(NUMBER_RANGES)) {
		if (typeof value[key] !== "number" || !Number.isFinite(value[key]) || value[key] < range[0] || value[key] > range[1]) continue;
		clean[key] = value[key];
	}
	return clean;
}

function readSettings() {
	const path = settingsPath();
	if (!existsSync(path)) return {};
	try {
		return sanitizeSettings(JSON.parse(readFileSync(path, "utf8"))) || {};
	} catch {
		return {};
	}
}

function writeSettings(settings) {
	const clean = sanitizeSettings(settings);
	if (clean === null) throw new Error("invalid settings");
	const path = settingsPath();
	const dir = join(profileDir(), "data", SETTINGS_DIR);
	mkdirSync(dir, { recursive: true });
	const temporary = path + ".tmp";
	writeFileSync(temporary, JSON.stringify(clean), "utf8");
	try {
		renameSync(temporary, path);
	} catch {
		rmSync(path, { force: true });
		renameSync(temporary, path);
	}
	return clean;
}

function readBody(req) {
	return new Promise((resolve, reject) => {
		let size = 0;
		const chunks = [];
		req.on("data", (chunk) => {
			size += chunk.length;
			if (size > MAX_BODY_BYTES) {
				req.destroy();
				reject(new Error("payload too large"));
				return;
			}
			chunks.push(chunk);
		});
		req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
		req.on("error", reject);
	});
}

async function handleSettingsRoute(req, res) {
	if (!isLoopback(req)) {
		res.writeHead(403);
		res.end("forbidden");
		return;
	}
	if (req.method === "GET") {
		sendJson(res, 200, { ok: true, settings: { ...DEFAULTS, ...readSettings() } });
		return;
	}
	if (req.method !== "PUT") {
		res.writeHead(405, { allow: "GET, PUT" });
		res.end();
		return;
	}
	try {
		const parsed = JSON.parse(await readBody(req));
		const settings = writeSettings(parsed && parsed.settings);
		sendJson(res, 200, { ok: true, settings });
	} catch (error) {
		sendJson(res, 400, { ok: false, message: String((error && error.message) || error) });
	}
}

function apply(ctx) {
	// Persisted profile API: the client fetches this for switch + palette state.
	ctx.webServer.register({
		kind: "exact",
		path: SETTINGS_ROUTE,
		handler: handleSettingsRoute
	});

	// Settings section in the DSH settings UI: on/off switch + palette controls.
	installSettingsSection(ctx, SETTINGS_NAMESPACE, AemeathSettingsSchema, DEFAULTS, {
		setSource: () => {},
		onChange: () => {}
	});
}

export { apply, inject, name };
