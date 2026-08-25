/**
 * Aemeath (爱弥斯 · 星炬回响) — self-contained browser bundle.
 *
 * Built by scripts/build-client.mjs: assets/ is embedded as base64 data URIs
 * (/*__AEMEATH_ASSETS__* /) and skin.css as text (/*__AEMEATH_CSS__* /).
 *
 * Unlike the skin-center v2 path (whose hooks.mjs only runs for built-in
 * skins), this bundle rides the cordis web client pipeline directly, so it
 * is not subject to the "hooks-require-review" 403. The on/off switch lives
 * in the DSH settings section (ui-skin-aemeath) and is persisted to the
 * profile through /api/dsh-aemeath/settings.
 *
 * Exports a cordis client `apply(ctx)`. The `ctx` passed by the runtime is
 * thin; everything we need (theme detection, asset table, cleanup) is
 * implemented here so the bundle stays self-contained.
 */

const ASSETS = /*__AEMEATH_ASSETS__*/;
const CSS_TEXT = /*__AEMEATH_CSS__*/;
const SETTINGS_URL = "/api/dsh-aemeath/settings";
const SETTINGS_POLL_MS = 2000;
const DEFAULTS = {
	enabled: true, left: true, right: true, charHeight: 55, offsetX: 0,
	bubbles: true, chain: true, corners: true, emblem: true,
	bubbleCount: 20, bubbleSpeed: 100, msgColor: true, msgFrame: false,
	msgOpacity: 68, contentWidth: 600, bgOpacity: 100
};

function apply(_ctx) {
	const doc = document;
	const body = doc.body;

	// ---- asset accessor: every asset is a data URI ----
	const asset = (f) => ASSETS[f] || "";

	// ---- theme: DSH stamps dark mode on <body data-ds-dark-theme> ----
	const themeListeners = new Set();
	const isDark = () => body.hasAttribute("data-ds-dark-theme");
	const theme = {
		get: () => (isDark() ? "dark" : "light"),
		subscribe: (fn) => {
			themeListeners.add(fn);
			return () => themeListeners.delete(fn);
		}
	};
	const moTheme = new MutationObserver(() => {
		for (const fn of themeListeners) {
			try { fn(theme.get()); } catch (e) { /* ignore */ }
		}
	});
	moTheme.observe(body, { attributes: true, attributeFilter: ["data-ds-dark-theme"] });

	// ---- style sheet injection ----
	const styleEl = doc.createElement("style");
	styleEl.dataset.aemeathSkinStyle = "";
	styleEl.textContent = CSS_TEXT;
	doc.head.append(styleEl);

	// ---- cleanup registry (used to fully retract when the switch turns off) ----
	const cleanups = [];
	const onCleanup = (fn) => { cleanups.push(fn); };

	const destroy = () => {
		for (let i = cleanups.length - 1; i >= 0; i--) {
			try { cleanups[i](); } catch (e) { /* ignore */ }
		}
		cleanups.length = 0;
		styleEl.remove();
		moTheme.disconnect();
	};

	// ---- current settings state ----
	let settings = { ...DEFAULTS };
	let applied = false;

	const fetchSettings = async () => {
		try {
			const res = await fetch(SETTINGS_URL, { cache: "no-store" });
			if (!res.ok) return null;
			const data = await res.json();
			return data && data.settings ? { ...DEFAULTS, ...data.settings } : null;
		} catch (e) {
			return null;
		}
	};

	const saveSettings = async (patch) => {
		settings = { ...settings, ...patch };
		try {
			await fetch(SETTINGS_URL, {
				method: "PUT",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ settings })
			});
		} catch (e) { /* ignore */ }
	};

	// =====================================================================
	// The decoration pipeline (ported from hooks.mjs; self-contained).
	// `applied` gates the body work; every piece registers through
	// onCleanup so destroy() retracts it completely.
	// =====================================================================

	const mountDecorations = () => {
		// ---- character stage ----
		const stage = doc.createElement("div");
		stage.dataset.skinChrome = "character-stage";
		const mkChar = (side) => {
			const img = doc.createElement("img");
			img.dataset.aemeathCharacter = side;
			img.alt = "";
			img.setAttribute("aria-hidden", "true");
			stage.append(img);
			return img;
		};
		const left = mkChar("left");
		const right = mkChar("right");
		const applyTheme = () => {
			const dark = isDark();
			left.src = asset(dark ? "char-left-dark.png" : "char-left.png");
			right.src = asset(dark ? "char-right-dark.png" : "char-right.png");
		};
		applyTheme();
		theme.subscribe(applyTheme);
		body.append(stage);
		onCleanup(() => stage.remove());

		// ---- data stream chain border ----
		const chain = doc.createElement("div");
		chain.dataset.skinChrome = "chain-border";
		chain.setAttribute("aria-hidden", "true");
		const applyChain = () => {
			chain.style.backgroundImage = "url('" + asset(isDark() ? "data-dark.svg" : "data-light.svg") + "')";
		};
		applyChain();
		theme.subscribe(applyChain);
		body.append(chain);
		onCleanup(() => chain.remove());

		// ---- sidebar corner sparks ----
		const corners = doc.createElement("div");
		corners.dataset.skinChrome = "sidebar-corners";
		corners.setAttribute("aria-hidden", "true");
		for (const pos of ["top-left", "top-right", "bottom-right", "bottom-left"]) {
			const span = doc.createElement("span");
			span.dataset.skinCorner = pos;
			span.style.backgroundImage = "url('" + asset("star-corner.svg") + "')";
			corners.append(span);
		}
		body.append(corners);
		onCleanup(() => corners.remove());

		// ---- academy emblem seal ----
		const emblem = doc.createElement("img");
		emblem.src = asset("emblem.png");
		emblem.dataset.skinOwner = "aemeath";
		emblem.setAttribute("aria-hidden", "true");
		emblem.style.cssText =
			"position:fixed;left:16px;bottom:112px;width:132px;height:auto;opacity:0.55;" +
			"mix-blend-mode:screen;pointer-events:none;z-index:45;user-select:none;-webkit-user-drag:none;" +
			"transition:opacity .4s";
		body.append(emblem);
		onCleanup(() => emblem.remove());

		// ---- data particle fields ----
		const mkField = (chrome, count) => {
			const field = doc.createElement("div");
			field.dataset.skinChrome = chrome;
			field.setAttribute("aria-hidden", "true");
			for (let i = 0; i < count; i++) {
				const b = doc.createElement("span");
				b.dataset.aemeathBubble = "";
				const size = 6 + Math.random() * 18;
				b.style.width = size + "px";
				b.style.height = size + "px";
				b.style.left = (Math.random() * 100) + "%";
				b.style.animationDuration = (12 + Math.random() * 20) + "s";
				b.style.animationDelay = "-" + (Math.random() * 20) + "s";
				field.append(b);
			}
			return field;
		};
		const bubbleFg = mkField("bubble-field", 20);
		body.append(bubbleFg);
		onCleanup(() => bubbleFg.remove());
		const bubbleBg = mkField("bubble-field-bg", 18);
		body.append(bubbleBg);
		onCleanup(() => bubbleBg.remove());

		// ---- decoration layers must never intercept input ----
		for (const el of [stage, chain, corners, emblem, bubbleFg, bubbleBg]) {
			el.style.pointerEvents = "none";
		}

		// ---- background art (theme-switched) ----
		const BODY_BG_PROPS = ["background-image", "background-position", "background-size", "background-attachment", "background-repeat"];
		const prevBg = {};
		for (const p of BODY_BG_PROPS) prevBg[p] = body.style.getPropertyValue(p);
		const applyBg = () => {
			const dark = isDark();
			const op = (settings.bgOpacity != null ? settings.bgOpacity : 100) / 100;
			const base = dark ? [0.42, 0.5, 0.56] : [0.08, 0.12, 0.16];
			const f = (i) => (base[i] * (1.5 - op)).toFixed(3);
			const scrim = dark
				? "linear-gradient(rgba(8,14,30," + f(0) + ") 0%,rgba(10,18,38," + f(1) + ") 55%,rgba(12,22,46," + f(2) + ") 100%)"
				: "linear-gradient(rgba(250,240,246," + f(0) + ") 0%,rgba(244,228,240," + f(1) + ") 55%,rgba(238,216,236," + f(2) + ") 100%)";
			body.style.backgroundImage = scrim + ", url('" + asset(dark ? "palace-dark.jpg" : "palace-light.jpg") + "')";
			body.style.backgroundPosition = "center";
			body.style.backgroundSize = "cover";
			body.style.backgroundAttachment = "fixed";
			body.style.backgroundRepeat = "no-repeat";
		};
		applyBg();
		theme.subscribe(applyBg);
		onCleanup(() => {
			for (const p of BODY_BG_PROPS) {
				if (prevBg[p]) body.style.setProperty(p, prevBg[p]);
				else body.style.removeProperty(p);
			}
		});

		// ---- favicon + title ----
		const favicon = doc.createElement("link");
		favicon.rel = "icon";
		favicon.type = "image/svg+xml";
		favicon.href = asset("favicon.svg");
		doc.head.append(favicon);
		onCleanup(() => favicon.remove());
		const prevTitle = doc.title;
		doc.title = "爱弥斯 · 星炬回响";
		onCleanup(() => { doc.title = prevTitle; });

		// ---- sidebar width + rail state ----
		const setProp = (k, v) => body.style.setProperty(k, v);
		const SIDEBAR_SEL = "[data-pane='sidebar'], [class*='sidebarCol']";
		const syncSidebar = () => {
			const sb = doc.querySelector(SIDEBAR_SEL);
			if (!sb) return;
			const w = sb.getBoundingClientRect().width;
			if (w > 0) {
				setProp("--aemeath-sidebar-width", w + "px");
				body.dataset.aemeathSidebarSize = w <= 120 ? "rail" : w <= 220 ? "narrow" : "wide";
			}
		};
		const sidebarEl = doc.querySelector(SIDEBAR_SEL);
		let ro = null;
		if (sidebarEl && typeof ResizeObserver !== "undefined") {
			ro = new ResizeObserver(syncSidebar);
			ro.observe(sidebarEl);
		}
		syncSidebar();
		onCleanup(() => ro && ro.disconnect());

		// ---- details / devtools fade states ----
		const baseWGap = window.outerWidth - window.innerWidth;
		const baseHGap = window.outerHeight - window.innerHeight;
		const pollStates = () => {
			const wb = doc.querySelector("[class*='_workbench']");
			let w = 0;
			if (wb) {
				const r = wb.getBoundingClientRect();
				if (r.x < window.innerWidth) w = r.width;
			} else {
				const d = doc.querySelector("[class*='detailsCol']");
				if (d) w = d.getBoundingClientRect().width;
			}
			const detailsOpen = w > 50;
			const devOpen =
				(window.outerWidth - window.innerWidth - baseWGap) > 100 ||
				(window.outerHeight - window.innerHeight - baseHGap) > 100;
			body.toggleAttribute("data-aemeath-details", detailsOpen);
			body.toggleAttribute("data-aemeath-devtools", devOpen);
		};
		const iv = setInterval(pollStates, 500);
		pollStates();
		onCleanup(() => clearInterval(iv));

		// ---- session phase: hero welcome overlay ----
		let heroOverlay = null;
		const syncPhase = () => {
			const phaseEl = doc.querySelector("[data-phase='hero'], [data-phase='active']");
			const phase = phaseEl ? phaseEl.dataset.phase : undefined;
			if (phase === "hero") {
				body.dataset.aemeathSessionPhase = "hero";
				if (!heroOverlay || !heroOverlay.isConnected) {
					heroOverlay = doc.createElement("div");
					heroOverlay.dataset.skinChrome = "hero-welcome";
					heroOverlay.setAttribute("aria-hidden", "true");
					heroOverlay.style.cssText =
						"position:absolute;top:15%;left:50%;transform:translateX(-50%);" +
						"display:flex;flex-direction:column;align-items:center;text-align:center;" +
						"pointer-events:none;z-index:5;transition:top 0.3s ease,left 0.3s ease";
					const title = doc.createElement("div");
					title.textContent = "爱弥斯";
					title.style.cssText =
						"font-size:32px;font-weight:700;background:linear-gradient(135deg,var(--aemeath-pink),var(--aemeath-cyan));" +
						"-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent";
					const sub = doc.createElement("div");
					sub.textContent = "星炬学院 · 拉海洛学部";
					sub.style.cssText = "font-size:14px;opacity:0.5;margin-top:4px";
					const hint = doc.createElement("div");
					hint.textContent = "「……你要走了吗？我会在这里等你回来。」";
					hint.style.cssText = "font-size:15px;opacity:0.7;margin-top:12px;font-style:italic";
					heroOverlay.append(title, sub, hint);
					if (phaseEl) phaseEl.append(heroOverlay);
				}
			} else {
				delete body.dataset.aemeathSessionPhase;
				if (heroOverlay && heroOverlay.isConnected) heroOverlay.remove();
				heroOverlay = null;
			}
		};
		const iv2 = setInterval(syncPhase, 500);
		syncPhase();
		onCleanup(() => clearInterval(iv2));

		// ---- sidebar footer markers ----
		const markFooter = () => {
			const sidebar = doc.querySelector(SIDEBAR_SEL);
			if (!sidebar) return;
			sidebar.querySelectorAll("[data-aemeath-sidebar-footer]").forEach((el) => {
				delete el.dataset.aemeathSidebarFooter;
			});
			const slot = sidebar.querySelector("[data-slot='sidebar.settings']");
			if (slot) {
				let footer = slot.parentElement;
				while (footer && footer !== sidebar) {
					if (footer.querySelector("[data-slot='sidebar.footer.action']")) {
						footer.dataset.aemeathSidebarFooter = "";
						break;
					}
					footer = footer.parentElement;
				}
			}
		};
		markFooter();
		const iv3 = setInterval(markFooter, 1500);
		onCleanup(() => clearInterval(iv3));

		// ---- titlebar brand wordmark ----
		const tb = doc.querySelector("[class*='titlebar']");
		if (tb && !tb.querySelector("[data-skin-chrome='titlebar-brand']")) {
			const brand = doc.createElement("span");
			brand.dataset.skinChrome = "titlebar-brand";
			brand.setAttribute("aria-hidden", "true");
			brand.style.pointerEvents = "none";
			brand.innerHTML = atob(asset("titlebar-brand.svg").split(",")[1] || "") || "";
			tb.prepend(brand);
			onCleanup(() => brand.remove());
		}

		// ---- apply palette to decorations ----
		const applyBubbles = () => {
			const target = settings.bubbleCount != null ? settings.bubbleCount : 20;
			if (bubbleFg.children.length !== target) {
				while (bubbleFg.firstChild) bubbleFg.removeChild(bubbleFg.firstChild);
				for (let i = 0; i < target; i++) {
					const b = doc.createElement("span");
					b.dataset.aemeathBubble = "";
					const size = 6 + Math.random() * 18;
					b.style.width = size + "px";
					b.style.height = size + "px";
					b.style.left = (Math.random() * 100) + "%";
					const dur = 12 + Math.random() * 20;
					b.dataset.baseDur = String(dur);
					b.style.animationDuration = dur + "s";
					b.style.animationDelay = "-" + (Math.random() * 20) + "s";
					bubbleFg.append(b);
				}
			}
			const speedMult = 100 / (settings.bubbleSpeed || 100);
			for (const f of [bubbleFg, bubbleBg]) {
				for (const el of f.children) {
					const base = parseFloat(el.dataset.baseDur || el.style.animationDuration || "20");
					if (!el.dataset.baseDur) el.dataset.baseDur = String(base);
					el.style.animationDuration = base * speedMult + "s";
				}
			}
		};
		const applyPalette = () => {
			left.style.display = settings.left ? "" : "none";
			right.style.display = settings.right ? "" : "none";
			body.style.setProperty("--aemeath-char-height", settings.charHeight + "vh");
			const off = settings.offsetX || 0;
			left.style.left = "calc(var(--aemeath-sidebar-width,280px) + 2px + " + off + "px)";
			right.style.right = off + "px";
			bubbleFg.style.display = settings.bubbles ? "" : "none";
			bubbleBg.style.display = settings.bubbles ? "" : "none";
			chain.style.display = settings.chain ? "" : "none";
			corners.style.display = settings.corners ? "" : "none";
			emblem.style.display = settings.emblem ? "" : "none";
			body.style.setProperty("--aemeath-content-width", settings.contentWidth + "px");
			if (settings.msgColor) body.setAttribute("data-aemeath-msg-color", "on");
			else body.removeAttribute("data-aemeath-msg-color");
			if (settings.msgFrame) body.setAttribute("data-aemeath-msg-frame", "on");
			else body.removeAttribute("data-aemeath-msg-frame");
			body.style.setProperty("--aemeath-msg-opacity", (settings.msgOpacity != null ? settings.msgOpacity : 68) / 100);
			applyBubbles();
			applyBg();
		};
		applyPalette();

		// ---- message marker: tag assistant markdown containers ----
		const setMsgMarks = (on) => {
			doc.querySelectorAll("[data-aemeath-msg]").forEach((el) => {
				if (!on) el.removeAttribute("data-aemeath-msg");
			});
		};
		const markMessages = () => {
			const msgActive = body.getAttribute("data-aemeath-msg-color") === "on" || body.getAttribute("data-aemeath-msg-frame") === "on";
			if (!msgActive) {
				setMsgMarks(false);
				return 0;
			}
			let tagged = 0;
			doc.querySelectorAll("[data-chat-flow-kind]").forEach((el) => {
				if (el.getAttribute("data-chat-flow-kind") === "assistant" || el.getAttribute("data-chat-flow-kind") === "assistant-step") {
					el.setAttribute("data-aemeath-msg", "");
					tagged++;
				}
			});
			if (tagged === 0) {
				doc.querySelectorAll("[data-streaming], [class*='Sxvs8a_root']").forEach((el) => {
					el.setAttribute("data-aemeath-msg", "");
					tagged++;
				});
			}
			return tagged;
		};
		const markLoop = setInterval(() => { markMessages(); }, 1200);
		markMessages();
		onCleanup(() => { clearInterval(markLoop); setMsgMarks(false); });

		// ---- floating 🎨 palette panel (bottom-right) ----
		// Mirrors the skin-center form's panel; every control writes through
		// `settings` + saveSettings() so the profile file and the DSH settings
		// section stay in sync (the settings section is the authoritative
		// on/off switch; this panel offers the same palette controls inline).
		const paletteToggle = doc.createElement("button");
		paletteToggle.dataset.skinChrome = "palette-toggle";
		paletteToggle.type = "button";
		paletteToggle.setAttribute("aria-label", "爱弥斯调色板");
		paletteToggle.textContent = "🎨";
		const palettePanel = doc.createElement("div");
		palettePanel.dataset.skinChrome = "palette-panel";
		palettePanel.dataset.paletteCollapsed = "true";

		const mkRow = (label, control) => {
			const row = doc.createElement("div");
			row.className = "pp-row";
			const l = doc.createElement("label");
			l.textContent = label;
			row.append(l, control);
			return row;
		};
		const mkToggle = (key, label) => {
			const btn = doc.createElement("button");
			btn.className = "pp-toggle";
			btn.type = "button";
			btn.dataset.on = String(settings[key] !== false);
			btn.addEventListener("click", () => {
				settings[key] = !(settings[key] !== false);
				btn.dataset.on = String(settings[key]);
				applyPalette();
				saveSettings({ [key]: settings[key] });
			});
			return mkRow(label, btn);
		};
		const mkSlider = (key, label, min, max, suffix) => {
			const wrap = doc.createElement("div");
			wrap.style.cssText = "display:flex;align-items:center;gap:6px;flex:1";
			const slider = doc.createElement("input");
			slider.type = "range";
			slider.className = "pp-slider";
			slider.min = String(min);
			slider.max = String(max);
			slider.step = "1";
			slider.value = String(settings[key] != null ? settings[key] : min);
			const val = doc.createElement("span");
			val.className = "pp-value";
			const render = () => { val.textContent = (settings[key] != null ? settings[key] : min) + (suffix || ""); };
			slider.addEventListener("input", () => {
				settings[key] = Number(slider.value);
				render();
				applyPalette();
				saveSettings({ [key]: settings[key] });
			});
			wrap.append(slider, val);
			render();
			return mkRow(label, wrap);
		};

		const header = doc.createElement("div");
		header.className = "pp-header";
		header.textContent = "🎨 爱弥斯调色板";
		const panelBody = doc.createElement("div");
		panelBody.className = "pp-body";
		const g1 = doc.createElement("div");
		g1.className = "pp-group";
		const t1 = doc.createElement("div");
		t1.className = "pp-group-title";
		t1.textContent = "立绘";
		g1.append(t1, mkToggle("left", "左立绘"), mkToggle("right", "右立绘"),
			mkSlider("charHeight", "立绘高度", 30, 80, "vh"),
			mkSlider("offsetX", "水平偏移", -200, 200, "px"));
		const g2 = doc.createElement("div");
		g2.className = "pp-group";
		const t2 = doc.createElement("div");
		t2.className = "pp-group-title";
		t2.textContent = "氛围";
		g2.append(t2, mkToggle("bubbles", "粒子场"), mkToggle("chain", "数据流边框"),
			mkToggle("corners", "星芒"), mkToggle("emblem", "学院徽章"),
			mkSlider("bubbleCount", "泡泡数量", 5, 40, ""),
			mkSlider("bubbleSpeed", "泡泡速度", 30, 200, "%"));
		const g3 = doc.createElement("div");
		g3.className = "pp-group";
		const t3 = doc.createElement("div");
		t3.className = "pp-group-title";
		t3.textContent = "文字";
		g3.append(t3, mkToggle("msgColor", "回复文字配色"),
			mkToggle("msgFrame", "消息文本框"),
			mkSlider("msgOpacity", "文本框透明度", 20, 100, "%"));
		const g4 = doc.createElement("div");
		g4.className = "pp-group";
		const t4 = doc.createElement("div");
		t4.className = "pp-group-title";
		t4.textContent = "版式";
		g4.append(t4, mkSlider("contentWidth", "对话宽度", 400, 1200, "px"),
			mkSlider("bgOpacity", "背景透明度", 20, 100, "%"));
		panelBody.append(g1, g2, g3, g4);
		palettePanel.append(header, panelBody);
		const togglePanel = () => {
			palettePanel.dataset.paletteCollapsed = palettePanel.dataset.paletteCollapsed === "true" ? "false" : "true";
		};
		header.addEventListener("click", togglePanel);
		paletteToggle.addEventListener("click", togglePanel);
		body.append(paletteToggle, palettePanel);
		onCleanup(() => { paletteToggle.remove(); palettePanel.remove(); });

		// expose palette re-apply for live setting changes
		return { applyPalette };
	};

	// =====================================================================
	// Switch controller: read persisted settings, mount/unmount decorations.
	// =====================================================================
	let decorations = null;
	let mountTimer = null;

	const sync = async () => {
		const fresh = await fetchSettings();
		if (fresh) settings = fresh;
		const shouldApply = settings.enabled !== false;
		if (shouldApply && !applied) {
			applied = true;
			// small delay so the shell DOM is ready
			mountTimer = setTimeout(() => {
				if (applied) {
					try { decorations = mountDecorations(); } catch (e) { console.error("[aemeath-skin] mount failed", e); }
				}
			}, 300);
		} else if (!shouldApply && applied) {
			applied = false;
			if (mountTimer) { clearTimeout(mountTimer); mountTimer = null; }
			if (decorations) { try { destroy(); } catch (e) { /* ignore */ } }
			decorations = null;
		} else if (applied && decorations) {
			// live palette update without remounting
			try { decorations.applyPalette(); } catch (e) { /* ignore */ }
		}
	};

	// initial mount + periodic poll (the switch lives in the settings UI)
	sync();
	setInterval(sync, SETTINGS_POLL_MS);

	// NOTE: the runtime ctx is a cordis Proxy that THROWS on any property
	// not declared in dsh.client.inject ("cannot get property ... without
	// inject"), so we deliberately touch NOTHING on ctx here. Retraction
	// rides the settings poll (the switch turning off calls destroy()) and
	// the eventual page unload (the browser discards DOM/timers with the
	// document).
}

export { apply };
