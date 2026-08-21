/**
 * Aemeath (爱弥斯 · 星炬回响) skin hooks — v2 skin contract
 * (x-org.linxin666.skin-center/v1alpha1).
 *
 * Port of the v1 bundle's DOM decoration logic:
 *  - character stage (light/dark standing art, theme-switched)
 *  - data particle fields (foreground + background motes)
 *  - data-stream chain border (light/dark svg, theme-switched)
 *  - sidebar corner sparks (star-corner svg)
 *  - academy emblem seal, favicon, title
 *  - sidebar width tracking, details/devtools fade states, hero overlay
 *
 * Loading this module executes nothing; apply() owns every DOM write and
 * registers its retraction through ctx.onCleanup.
 */
export default function defineSkinHooks() {
  return {
    apply(ctx) {
      const body = document.body;
      const asset = (f) => ctx.assetBase + '/assets/' + f
      const cleanups = []
      const onCleanup = (fn) => { cleanups.push(fn); ctx.onCleanup(fn) }
      const currentTheme = () => ctx.theme.get()
      const isDark = () => currentTheme() === 'dark'

      // ---- character stage: left/right standing art, theme-switched ----
      const stage = document.createElement('div')
      stage.dataset.skinChrome = 'character-stage'
      const mkChar = (side) => {
        const img = document.createElement('img')
        img.dataset.aemeathCharacter = side
        img.alt = ''
        img.setAttribute('aria-hidden', 'true')
        stage.append(img)
        return img
      }
      const left = mkChar('left')
      const right = mkChar('right')
      const applyTheme = (theme) => {
        const dark = theme === 'dark'
        left.src = asset(dark ? 'char-left-dark.png' : 'char-left.png')
        right.src = asset(dark ? 'char-right-dark.png' : 'char-right.png')
      }
      applyTheme(currentTheme())
      const unsubTheme = ctx.theme.subscribe(applyTheme)
      onCleanup(unsubTheme)
      body.append(stage)
      onCleanup(() => stage.remove())

      // ---- data stream chain border (theme-switched svg) ----
      const chain = document.createElement('div')
      chain.dataset.skinChrome = 'chain-border'
      chain.setAttribute('aria-hidden', 'true')
      const applyChain = (theme) => {
        chain.style.backgroundImage = 'url(' + asset(theme === 'dark' ? 'data-dark.svg' : 'data-light.svg') + ')'
      }
      applyChain(currentTheme())
      ctx.theme.subscribe(applyChain)
      body.append(chain)
      onCleanup(() => chain.remove())

      // ---- sidebar corner sparks ----
      const corners = document.createElement('div')
      corners.dataset.skinChrome = 'sidebar-corners'
      corners.setAttribute('aria-hidden', 'true')
      for (const pos of ['top-left', 'top-right', 'bottom-right', 'bottom-left']) {
        const span = document.createElement('span')
        span.dataset.skinCorner = pos
        span.style.backgroundImage = 'url(' + asset('star-corner.svg') + ')'
        corners.append(span)
      }
      body.append(corners)
      onCleanup(() => corners.remove())

      // ---- academy emblem seal (fixed bottom-left) ----
      const emblem = document.createElement('img')
      emblem.src = asset('emblem.png')
      emblem.dataset.skinOwner = 'aemeath'
      emblem.setAttribute('aria-hidden', 'true')
      emblem.style.cssText =
        'position:fixed;left:16px;bottom:112px;width:132px;height:auto;opacity:0.55;' +
        'mix-blend-mode:screen;pointer-events:none;z-index:45;user-select:none;-webkit-user-drag:none;' +
        'transition:opacity .4s'
      body.append(emblem)
      onCleanup(() => emblem.remove())

      // ---- data particle fields ----
      const mkField = (chrome, attr, count) => {
        const field = document.createElement('div')
        field.dataset.skinChrome = chrome
        field.setAttribute('aria-hidden', 'true')
        for (let i = 0; i < count; i++) {
          const b = document.createElement('span')
          b.dataset.aemeathBubble = ''
          b.setAttribute(attr, '')
          const size = 6 + Math.random() * 18
          b.style.width = size + 'px'
          b.style.height = size + 'px'
          b.style.left = (Math.random() * 100) + '%'
          b.style.animationDuration = (12 + Math.random() * 20) + 's'
          b.style.animationDelay = '-' + (Math.random() * 20) + 's'
          field.append(b)
        }
        return field
      }
      const bubbleFg = mkField('bubble-field', 'data-aemeath-bubble', 20)
      body.append(bubbleFg)
      onCleanup(() => bubbleFg.remove())
      const bubbleBg = mkField('bubble-field-bg', 'data-aemeath-bubble-bg', 18)
      body.append(bubbleBg)
      onCleanup(() => bubbleBg.remove())

      // ---- defensive: decoration layers must never intercept input ----
      for (const el of [stage, chain, corners, emblem, bubbleFg, bubbleBg]) {
        el.style.pointerEvents = 'none'
      }

      // ---- background opacity (palette-controlled scrim strength) ----
      let bgOpacityVal = 100
      // ---- background art (theme-switched; overrides the declarative media) ----
      const BODY_BG_PROPS = ['background-image', 'background-position', 'background-size', 'background-attachment', 'background-repeat']
      const prevBg = {}
      for (const p of BODY_BG_PROPS) prevBg[p] = body.style.getPropertyValue(p)
      const applyBg = (theme) => {
        const dark = theme === 'dark'
        const op = bgOpacityVal / 100
        const base = dark ? [0.42, 0.5, 0.56] : [0.08, 0.12, 0.16]
        const f = (i) => (base[i] * (1.5 - op)).toFixed(3)
        const scrim = dark
          ? 'linear-gradient(rgba(8,14,30,' + f(0) + ') 0%,rgba(10,18,38,' + f(1) + ') 55%,rgba(12,22,46,' + f(2) + ') 100%)'
          : 'linear-gradient(rgba(250,240,246,' + f(0) + ') 0%,rgba(244,228,240,' + f(1) + ') 55%,rgba(238,216,236,' + f(2) + ') 100%)'
        body.style.backgroundImage = scrim + ', url(' + asset(dark ? 'palace-dark.jpg' : 'palace-light.jpg') + ')'
        body.style.backgroundPosition = 'center'
        body.style.backgroundSize = 'cover'
        body.style.backgroundAttachment = 'fixed'
        body.style.backgroundRepeat = 'no-repeat'
      }
      applyBg(currentTheme())
      ctx.theme.subscribe(applyBg)
      onCleanup(() => {
        for (const p of BODY_BG_PROPS) {
          if (prevBg[p]) body.style.setProperty(p, prevBg[p])
          else body.style.removeProperty(p)
        }
      })

      // ---- favicon ----
      const favicon = document.createElement('link')
      favicon.rel = 'icon'
      favicon.type = 'image/svg+xml'
      favicon.href = asset('favicon.svg')
      document.head.append(favicon)
      onCleanup(() => favicon.remove())

      // ---- title ----
      const prevTitle = document.title
      document.title = '爱弥斯 · 星炬回响'
      onCleanup(() => { document.title = prevTitle })

      // ---- sidebar width + rail state ----
      const setProp = (k, v) => body.style.setProperty(k, v)
      const SIDEBAR_SEL = "[data-pane='sidebar'], [class*='sidebarCol']"
      const syncSidebar = () => {
        const sb = document.querySelector(SIDEBAR_SEL)
        if (!sb) return
        const w = sb.getBoundingClientRect().width
        if (w > 0) {
          setProp('--aemeath-sidebar-width', w + 'px')
          setProp('--aemeath-sidebar-swag-height', Math.min(94, Math.max(40, w * 0.2575)) + 'px')
          body.dataset.aemeathSidebarSize = w <= 120 ? 'rail' : w <= 220 ? 'narrow' : 'wide'
        }
      }
      const sidebarEl = document.querySelector(SIDEBAR_SEL)
      let ro = null
      if (sidebarEl && typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(syncSidebar)
        ro.observe(sidebarEl)
      }
      syncSidebar()
      onCleanup(() => ro && ro.disconnect())

      // ---- details / devtools fade states (polled like v1) ----
      const baseWGap = window.outerWidth - window.innerWidth
      const baseHGap = window.outerHeight - window.innerHeight
      const pollStates = () => {
        // details panel open?
        const wb = document.querySelector("[class*='_workbench']")
        let w = 0
        if (wb) {
          const r = wb.getBoundingClientRect()
          if (r.x < window.innerWidth) w = r.width
        } else {
          const d = document.querySelector("[class*='detailsCol']")
          if (d) w = d.getBoundingClientRect().width
        }
        const detailsOpen = w > 50
        const devOpen =
          (window.outerWidth - window.innerWidth - baseWGap) > 100 ||
          (window.outerHeight - window.innerHeight - baseHGap) > 100
        body.toggleAttribute('data-aemeath-details', detailsOpen)
        body.toggleAttribute('data-aemeath-devtools', devOpen)
      }
      const iv = setInterval(pollStates, 500)
      pollStates()
      onCleanup(() => clearInterval(iv))

      // ---- session phase: hero welcome overlay ----
      let heroOverlay = null
      const syncPhase = () => {
        const phaseEl = document.querySelector("[data-phase='hero'], [data-phase='active']")
        const phase = phaseEl ? phaseEl.dataset.phase : undefined
        if (phase === 'hero') {
          body.dataset.aemeathSessionPhase = 'hero'
          if (!heroOverlay || !heroOverlay.isConnected) {
            heroOverlay = document.createElement('div')
            heroOverlay.dataset.skinChrome = 'hero-welcome'
            heroOverlay.setAttribute('aria-hidden', 'true')
            heroOverlay.style.cssText =
              'position:absolute;top:15%;left:50%;transform:translateX(-50%);' +
              'display:flex;flex-direction:column;align-items:center;text-align:center;' +
              'pointer-events:none;z-index:5;transition:top 0.3s ease,left 0.3s ease'
            const title = document.createElement('div')
            title.textContent = '爱弥斯'
            title.style.cssText =
              'font-size:32px;font-weight:700;background:linear-gradient(135deg,var(--aemeath-pink),var(--aemeath-cyan));' +
              '-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent'
            const sub = document.createElement('div')
            sub.textContent = '星炬学院 · 拉海洛学部'
            sub.style.cssText = 'font-size:14px;opacity:0.5;margin-top:4px'
            const hint = document.createElement('div')
            hint.textContent = '「……你要走了吗？我会在这里等你回来。」'
            hint.style.cssText = 'font-size:15px;opacity:0.7;margin-top:12px;font-style:italic'
            heroOverlay.append(title, sub, hint)
            if (phaseEl) phaseEl.append(heroOverlay)
          }
        } else {
          delete body.dataset.aemeathSessionPhase
          if (heroOverlay && heroOverlay.isConnected) heroOverlay.remove()
          heroOverlay = null
        }
      }
      const iv2 = setInterval(syncPhase, 500)
      syncPhase()
      onCleanup(() => clearInterval(iv2))

      // ---- sidebar footer markers (settings / footer action slots) ----
      const markFooter = () => {
        const sidebar = document.querySelector(SIDEBAR_SEL)
        if (!sidebar) return
        sidebar.querySelectorAll('[data-aemeath-sidebar-footer]').forEach((el) => {
          delete el.dataset.aemeathSidebarFooter
        })
        const slot = sidebar.querySelector("[data-slot='sidebar.settings']")
        if (slot) {
          let footer = slot.parentElement
          while (footer && footer !== sidebar) {
            if (footer.querySelector("[data-slot='sidebar.footer.action']")) {
              footer.dataset.aemeathSidebarFooter = ''
              break
            }
            footer = footer.parentElement
          }
        }
      }
      markFooter()
      const iv3 = setInterval(markFooter, 1500)
      onCleanup(() => clearInterval(iv3))

      // ---- titlebar brand wordmark ----
      const tb = document.querySelector("[class*='titlebar']")
      if (tb && !tb.querySelector("[data-skin-chrome='titlebar-brand']")) {
        const brand = document.createElement('span')
        brand.dataset.skinChrome = 'titlebar-brand'
        brand.setAttribute('aria-hidden', 'true')
        brand.style.pointerEvents = 'none'
        fetch(asset('titlebar-brand.svg'))
          .then((r) => (r.ok ? r.text() : Promise.reject()))
          .then((svg) => { brand.innerHTML = svg })
          .catch(() => {})
        tb.prepend(brand)
        onCleanup(() => brand.remove())
      }

      // ---- palette panel (v1 port; localStorage persisted) ----
      const PALETTE_KEY = 'aemeath-palette-v2'
      let palette = null
      try { palette = JSON.parse(localStorage.getItem(PALETTE_KEY) || '{}') } catch (e) {}
      const paletteDefaults = {
        left: true, right: true, charHeight: 55, offsetX: 0,
        bubbles: true, chain: true, msgColor: true,
        corners: true, emblem: true, contentWidth: 600, bgOpacity: 100,
        bubbleCount: 20, bubbleSpeed: 100,
        msgFrame: false, msgOpacity: 68,
      }
      if (!palette || typeof palette !== 'object') palette = {}
      for (const k in paletteDefaults) if (!(k in palette)) palette[k] = paletteDefaults[k]
      const savePalette = () => { try { localStorage.setItem(PALETTE_KEY, JSON.stringify(palette)) } catch (e) {} }
      const applyBubbles = () => {
        const target = palette.bubbleCount != null ? palette.bubbleCount : 20
        if (bubbleFg.children.length !== target) {
          while (bubbleFg.firstChild) bubbleFg.removeChild(bubbleFg.firstChild)
          for (let i = 0; i < target; i++) {
            const b = document.createElement('span')
            b.dataset.aemeathBubble = ''
            const size = 6 + Math.random() * 18
            b.style.width = size + 'px'
            b.style.height = size + 'px'
            b.style.left = (Math.random() * 100) + '%'
            const dur = 12 + Math.random() * 20
            b.dataset.baseDur = String(dur)
            b.style.animationDuration = dur + 's'
            b.style.animationDelay = '-' + (Math.random() * 20) + 's'
            bubbleFg.append(b)
          }
        }
        const speedMult = 100 / (palette.bubbleSpeed || 100)
        for (const f of [bubbleFg, bubbleBg]) {
          for (const el of f.children) {
            const base = parseFloat(el.dataset.baseDur || el.style.animationDuration || '20')
            if (!el.dataset.baseDur) el.dataset.baseDur = String(base)
            el.style.animationDuration = base * speedMult + 's'
          }
        }
      }
      const applyPalette = () => {
        left.style.display = palette.left ? '' : 'none'
        right.style.display = palette.right ? '' : 'none'
        body.style.setProperty('--aemeath-char-height', palette.charHeight + 'vh')
        const off = palette.offsetX || 0
        left.style.left = 'calc(var(--aemeath-sidebar-width,280px) + 2px + ' + off + 'px)'
        right.style.right = off + 'px'
        bubbleFg.style.display = palette.bubbles ? '' : 'none'
        bubbleBg.style.display = palette.bubbles ? '' : 'none'
        chain.style.display = palette.chain ? '' : 'none'
        corners.style.display = palette.corners ? '' : 'none'
        emblem.style.display = palette.emblem ? '' : 'none'
        body.style.setProperty('--aemeath-content-width', palette.contentWidth + 'px')
        if (palette.msgColor) body.setAttribute('data-aemeath-msg-color', 'on')
        else body.removeAttribute('data-aemeath-msg-color')
        if (palette.msgFrame) body.setAttribute('data-aemeath-msg-frame', 'on')
        else body.removeAttribute('data-aemeath-msg-frame')
        body.style.setProperty('--aemeath-msg-opacity', (palette.msgOpacity != null ? palette.msgOpacity : 68) / 100)
        bgOpacityVal = palette.bgOpacity != null ? palette.bgOpacity : 100
        applyBubbles()
        applyBg(currentTheme())
      }
      applyPalette()

      const paletteToggle = document.createElement('button')
      paletteToggle.dataset.skinChrome = 'palette-toggle'
      paletteToggle.type = 'button'
      paletteToggle.setAttribute('aria-label', '爱弥斯调色板')
      paletteToggle.textContent = '🎨'
      const palettePanel = document.createElement('div')
      palettePanel.dataset.skinChrome = 'palette-panel'
      palettePanel.dataset.paletteCollapsed = 'true'

      const mkRow = (label, control) => {
        const row = document.createElement('div')
        row.className = 'pp-row'
        const l = document.createElement('label')
        l.textContent = label
        row.append(l, control)
        return row
      }
      const mkToggle = (key, label) => {
        const btn = document.createElement('button')
        btn.className = 'pp-toggle'
        btn.type = 'button'
        btn.dataset.on = String(palette[key])
        btn.addEventListener('click', () => {
          palette[key] = !palette[key]
          btn.dataset.on = String(palette[key])
          applyPalette()
          savePalette()
        })
        return mkRow(label, btn)
      }
      const mkSlider = (key, label, min, max, suffix) => {
        const wrap = document.createElement('div')
        wrap.style.cssText = 'display:flex;align-items:center;gap:6px;flex:1'
        const slider = document.createElement('input')
        slider.type = 'range'
        slider.className = 'pp-slider'
        slider.min = String(min)
        slider.max = String(max)
        slider.step = '1'
        slider.value = String(palette[key])
        const val = document.createElement('span')
        val.className = 'pp-value'
        const render = () => { val.textContent = palette[key] + (suffix || '') }
        slider.addEventListener('input', () => {
          palette[key] = Number(slider.value)
          render()
          applyPalette()
          savePalette()
        })
        wrap.append(slider, val)
        render()
        return mkRow(label, wrap)
      }

      const header = document.createElement('div')
      header.className = 'pp-header'
      header.textContent = '🎨 爱弥斯调色板'
      const panelBody = document.createElement('div')
      panelBody.className = 'pp-body'
      const g1 = document.createElement('div')
      g1.className = 'pp-group'
      const t1 = document.createElement('div')
      t1.className = 'pp-group-title'
      t1.textContent = '立绘'
      g1.append(t1, mkToggle('left', '左立绘'), mkToggle('right', '右立绘'),
        mkSlider('charHeight', '立绘高度', 30, 80, 'vh'),
        mkSlider('offsetX', '水平偏移', -50, 50, 'px'))
      const g2 = document.createElement('div')
      g2.className = 'pp-group'
      const t2 = document.createElement('div')
      t2.className = 'pp-group-title'
      t2.textContent = '氛围'
      g2.append(t2, mkToggle('bubbles', '粒子场'), mkToggle('chain', '数据流边框'),
        mkToggle('corners', '星芒'), mkToggle('emblem', '学院徽章'),
        mkSlider('bubbleCount', '泡泡数量', 5, 40, ''),
        mkSlider('bubbleSpeed', '泡泡速度', 30, 200, '%'))
      const g3 = document.createElement('div')
      g3.className = 'pp-group'
      const t3 = document.createElement('div')
      t3.className = 'pp-group-title'
      t3.textContent = '文字'
      g3.append(t3, mkToggle('msgColor', '回复文字配色'),
        mkToggle('msgFrame', '消息文本框'),
        mkSlider('msgOpacity', '文本框透明度', 20, 100, '%'))
      const g4 = document.createElement('div')
      g4.className = 'pp-group'
      const t4 = document.createElement('div')
      t4.className = 'pp-group-title'
      t4.textContent = '版式'
      g4.append(t4, mkSlider('contentWidth', '对话宽度', 500, 1000, 'px'),
        mkSlider('bgOpacity', '背景透明度', 20, 100, '%'))
      panelBody.append(g1, g2, g3, g4)
      palettePanel.append(header, panelBody)
      const togglePanel = () => {
        palettePanel.dataset.paletteCollapsed = palettePanel.dataset.paletteCollapsed === 'true' ? 'false' : 'true'
      }
      header.addEventListener('click', togglePanel)
      paletteToggle.addEventListener('click', togglePanel)
      body.append(paletteToggle, palettePanel)
      onCleanup(() => { paletteToggle.remove(); palettePanel.remove() })

      // ---- message marker: tag assistant markdown containers (aemeath) ----
      const setMsgMarks = (on) => {
        document.querySelectorAll('[data-aemeath-msg]').forEach((el) => {
          if (!on) el.removeAttribute('data-aemeath-msg')
        })
      }
      const markMessages = () => {
        const msgActive = body.getAttribute('data-aemeath-msg-color') === 'on' || body.getAttribute('data-aemeath-msg-frame') === 'on'
        if (!msgActive) {
          setMsgMarks(false)
          return 0
        }
        let tagged = 0
        document.querySelectorAll('[data-chat-flow-kind]').forEach((el) => {
          if (el.getAttribute('data-chat-flow-kind') === 'assistant' || el.getAttribute('data-chat-flow-kind') === 'assistant-step') {
            el.setAttribute('data-aemeath-msg', '')
            tagged++
          }
        })
        // Fallback: any container whose subtree holds markdown-shaped assistant output.
        if (tagged === 0) {
          document.querySelectorAll('[data-streaming], [class*="Sxvs8a_root"]').forEach((el) => {
            el.setAttribute('data-aemeath-msg', '')
            tagged++
          })
        }
        return tagged
      }
      const markLoop = setInterval(() => { markMessages() }, 1200)
      markMessages()
      onCleanup(() => { clearInterval(markLoop); setMsgMarks(false) })
    },
  }
}
