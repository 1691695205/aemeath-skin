import { existsSync, readFileSync, renameSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const name = "@dsh-external/dsh-client-ui-skin-aemeath";
const inject = ["webServer"];
const SETTINGS_ROUTE = "/api/dsh-aemeath/settings";
const SETTINGS_DIR = "dsh-client-ui-skin-aemeath";
const SETTINGS_FILE = "settings.json";
const MAX_BODY_BYTES = 16 * 1024;

/** Palette drags arrive once per `input` event; coalesce them into one write. */
const FLUSH_DELAY_MS = 250;

/** Defaults mirrored in lib/client.js so a never-touched row still renders. */
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

/**
 * This plugin's Loader-row Config schema, as DSH 0.x expects it.
 *
 * 0.2.x has no section-registration call. `settings.describe()` walks every
 * loaded profile entry, keeps those whose runtime `Config` carries at least one
 * volatile field, and offers exactly those fields as live controls; ordinary
 * (non-volatile) config stays deployment-owned. So this export *is* the
 * settings surface, and every field a user may touch must be volatile.
 *
 * The import is dynamic, and top-level await makes the module wait for it,
 * because a linked plugin only receives the `@deepseek-ai/*` packages it
 * declares as peers. A static import would make an unreachable schemastery take
 * the whole plugin down at scan time; this way it degrades to "no settings
 * page" and the palette keeps working off the persisted values alone.
 */
let Config;
try {
	const mod = await import("@deepseek-ai/schemastery");
	const z = mod && mod.default ? mod.default : mod;
	const shape = {};
	for (const [key, fallback] of Object.entries(DEFAULTS)) {
		shape[key] = BOOLEAN_KEYS.includes(key)
			? z.boolean().default(fallback).volatile()
			: z.number().min(NUMBER_RANGES[key][0]).max(NUMBER_RANGES[key][1]).step(1).default(fallback).volatile();
	}
	Config = z.object(shape);
} catch {
	Config = void 0;
}

function profileName() {
	const profile = process.env.DSH_PROFILE;
	return profile && /^[A-Za-z0-9_-]+$/.test(profile) ? profile : "web";
}

function dshHome() {
	return process.env.DSH_HOME || join(homedir(), ".dsh");
}

/**
 * Where the retired 0.1.x store lives, newest name first.
 *
 * The profile directory is authoritative from `ctx.profileContext.dir`: the
 * host owns which profile is running, and its name is not exported to plugin
 * processes. The environment fallback only covers a context without that
 * service. `.imported` is read too so an import interrupted between the rename
 * and the write still recovers its values on the next mount.
 */
function legacySettingsPaths(ctx) {
	const directory = ctx.profileContext?.dir || join(dshHome(), "profiles", profileName());
	const path = join(directory, "data", SETTINGS_DIR, SETTINGS_FILE);
	return [`${path}.imported`, path];
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
		const field = value[key];
		if (typeof field !== "number" || !Number.isFinite(field) || field < range[0] || field > range[1]) continue;
		clean[key] = field;
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

/**
 * The profile row serving this package, which is also the settings namespace.
 * The id is composition-owned — an aggregate bundle may rename it — so it is
 * resolved from the loader rather than assumed.
 */
function ownEntryId(ctx) {
	let fallback;
	try {
		for (const entry of ctx.loader.entries()) {
			const id = entry.options.id;
			if (entry.options.name !== name || typeof id !== "string" || id === "") continue;
			if (entry.fiber === ctx.fiber) return id;
			if (entry.disabled !== true && fallback === void 0) fallback = id;
		}
	} catch {
		// No loader (direct invocation): report "no row" to the caller.
	}
	return fallback;
}

function apply(ctx) {
	const defaults = { ...DEFAULTS };
	/** Reads the row's live value, revision, and user override; null when absent. */
	let bridge = null;
	/** Coalesced-but-unwritten patch. */
	let pending = null;
	let timer = null;

	const valueOf = () => {
		const live = bridge === null ? null : bridge();
		return live === null ? null : live.value;
	};

	const current = () => ({ ...defaults, ...(valueOf() || {}), ...(pending || {}) });

	const flush = async () => {
		timer = null;
		const patch = pending;
		pending = null;
		if (patch === null || bridge === null) return;
		if (Object.keys(patch).length === 0) return;
		const live = bridge();
		if (live === null) return;
		try {
			await live.update(patch);
		} catch (error) {
			ctx.logger?.warn?.(`aemeath-skin: settings write failed: ${String((error && error.message) || error)}`);
		}
	};

	const queue = (patch) => {
		pending = { ...(pending || {}), ...patch };
		if (timer === null) timer = setTimeout(() => void flush(), FLUSH_DELAY_MS);
	};

	// Persisted profile API: what lib/client.js polls for switch and palette state.
	const handler = async (req, res) => {
		if (!isLoopback(req)) {
			res.writeHead(403);
			res.end("forbidden");
			return;
		}
		if (req.method === "GET") {
			sendJson(res, 200, { ok: true, settings: current() });
			return;
		}
		if (req.method !== "PUT") {
			res.writeHead(405, { allow: "GET, PUT" });
			res.end();
			return;
		}
		try {
			const parsed = JSON.parse(await readBody(req));
			if (parsed === null || typeof parsed !== "object") throw new Error("invalid payload");
			const clean = sanitizeSettings(parsed.settings);
			if (clean === null) throw new Error("invalid settings");
			// A value the schema would reject is a client bug: say so instead of
			// silently persisting the rest and reporting success.
			for (const [key, range] of Object.entries(NUMBER_RANGES)) {
				const field = parsed.settings[key];
				if (field === void 0) continue;
				if (typeof field !== "number" || !Number.isFinite(field) || field < range[0] || field > range[1]) {
					throw new Error(`${key} must be a number within [${range[0]}, ${range[1]}]`);
				}
			}
			for (const key of BOOLEAN_KEYS) {
				if (parsed.settings[key] !== void 0 && typeof parsed.settings[key] !== "boolean") throw new Error(`${key} must be a boolean`);
			}
			queue(clean);
			// Report the coalesced state so the client sees its own edit at once.
			sendJson(res, 200, { ok: true, settings: current() });
		} catch (error) {
			sendJson(res, 400, { ok: false, message: String((error && error.message) || error) });
		}
	};

	ctx.effect(() => () => {
		if (timer !== null) {
			clearTimeout(timer);
			void flush();
		}
	}, "aemeath-skin: flush pending settings");

	ctx.webServer.register({ kind: "exact", path: SETTINGS_ROUTE, handler });

	// The settings service owns the form; this plugin only resolves which row
	// serves it and keeps that row in step with the client's palette panel.
	ctx.inject(["settings"], (settingsCtx) => {
		const settings = settingsCtx.settings;
		const ns = ownEntryId(ctx);
		if (ns === void 0) {
			ctx.logger?.warn?.("aemeath-skin: no loader row for this package; settings stay at defaults");
			return;
		}

		ctx.effect(() => settings.configure({ auto: false }, ctx.fiber), "aemeath-skin: settings page policy");

		const rowOf = () => settings.describe({ redactSecrets: true }).find((candidate) => candidate.ns === ns);

		bridge = () => {
			try {
				const row = rowOf();
				if (row === void 0) return null;
				return {
					value: sanitizeSettings(row.value) || {},
					revision: row.revision,
					update: (patch) => settings.update(ns, patch, row.revision)
				};
			} catch {
				return null;
			}
		};

		/**
		 * Move the 0.1.x `settings.json` into the row, once, and only while the
		 * row still carries no user override, so a configured plugin is never
		 * clobbered. The rename is what makes it once: a file still in place
		 * means the import has not finished, so a later mount may retry it.
		 */
		Promise.resolve(ctx.loader?.await?.()).then(() => {
			const paths = legacySettingsPaths(ctx);
			const live = paths.find((candidate) => existsSync(candidate));
			if (live === void 0) return;
			const retire = () => {
				if (live.endsWith(".imported")) return;
				try {
					renameSync(live, `${live}.imported`);
				} catch {
					// Unwritable directory: the next mount retries the import.
				}
			};
			let migrated = null;
			try {
				migrated = sanitizeSettings(JSON.parse(readFileSync(live, "utf8")));
			} catch {
				migrated = null;
			}
			if (migrated === null || Object.keys(migrated).length === 0) {
				// Nothing usable in there; retire it so it is not read again.
				retire();
				return;
			}
			const row = rowOf();
			if (row !== void 0 && row.user !== null && typeof row.user === "object" && Object.keys(row.user).length > 0) {
				retire();
				return;
			}
			pending = { ...(pending || {}), ...migrated };
			void flush();
			retire();
		}).catch((error) => {
			ctx.logger?.warn?.(`aemeath-skin: legacy settings import skipped: ${String((error && error.message) || error)}`);
		});
	});
}

export { apply, inject, name, Config };
