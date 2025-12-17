/**
 * Ajans Analytics Universal Tracker
 * Version: 3.0.0 (Remote Config Enabled)
 */
(function (window, document) {
    'use strict';

    // --- Configuration & State ---
    const CONFIG = {
        apiEndpoint: 'https://spectredash.com/api', // Absolute path for cross-origin tracking
        sessionTimeout: 30 * 60 * 1000,
        heatmapSampleRate: 1.0, // Capture 100% of sessions for accurate testing
        batchSize: 5, // Send data sooner (every 5 clicks)
        batchInterval: 5000,
        rageClickThreshold: 3,
        rageClickTime: 1000,
        deadClickTime: 500 // Time to wait for reaction
    };

    let state = {
        siteId: null,
        sessionId: null, // Now generated via fingerprint
        dailySalt: null, // From backend
        goals: [], // Loaded from remote config
        heatmapEnabled: false,
        heatmapBuffer: { clicks: [], scrolls: [], movements: [] },
        // Behaviors
        lastClick: { target: null, time: 0, count: 0 },
        lastFocusedInput: null,
        lastInteractionTime: 0,
        domMutationTime: 0
    };

    // --- Core Functions ---

    function getScriptData() {
        const scripts = document.getElementsByTagName('script');
        // Find the script that loaded this file (ajans-tracker.js)
        for (let i = 0; i < scripts.length; i++) {
            if (scripts[i].src && scripts[i].src.indexOf('ajans-tracker.js') !== -1) {
                return {
                    siteId: scripts[i].getAttribute('data-site-id'),
                    endpoint: scripts[i].getAttribute('data-endpoint') // Optional override
                };
            }
        }
        return null;
    }

    /**
     * Privacy-First Session ID Generation (Cookieless)
     * Uses Lightweight Fingerprinting + Daily Salt
     */
    async function generateSessionId(salt) {
        // 1. Check LocalStorage First
        const stored = localStorage.getItem('spectre_session_id');
        if (stored) return stored;

        // 2. Generate New ID
        if (!salt) salt = 'sess_anon_' + Date.now(); // Fallback

        // Privacy Components
        const components = [
            salt, // Rotates daily
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            Intl.DateTimeFormat().resolvedOptions().timeZone
        ].join('|');

        // Simple Hash (SHA-256 substitute for speed/size if Web Crypto API is available, else simple hash)
        let hashHex;
        try {
            const msgBuffer = new TextEncoder().encode(components);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (e) {
            // Fallback for older browsers (djb2 variant)
            let hash = 5381;
            for (let i = 0; i < components.length; i++) {
                hash = ((hash << 5) + hash) + components.charCodeAt(i);
            }
            hashHex = (hash >>> 0).toString(16);
        }

        const newId = 'sess_' + hashHex.substring(0, 16);

        // 3. Save to LocalStorage
        localStorage.setItem('spectre_session_id', newId);

        return newId;
    }

    function sendToAPI(path, data) {
        // Respect Do Not Track
        if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return Promise.resolve();

        // Determine endpoint: use absolute URL if configured, otherwise relative
        const endpoint = (CONFIG.apiEndpoint.startsWith('http') ? CONFIG.apiEndpoint : window.location.origin + CONFIG.apiEndpoint);
        const fullUrl = endpoint + (path.endsWith('.php') ? path : path + '.php');

        return fetch(fullUrl, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
            keepalive: true
        }).catch(err => console.warn('Ajans Tracker:', err));
    }

    // --- Remote Configuration ---

    function fetchRemoteConfig(siteId) {
        // GET /api/config?site_id=XYZ
        const endpoint = (CONFIG.apiEndpoint.startsWith('http') ? CONFIG.apiEndpoint : window.location.origin + CONFIG.apiEndpoint);
        const url = `${endpoint}/config?site_id=${siteId}`;

        return fetch(url)
            .then(res => res.json())
            .then(config => {
                if (config.goals && Array.isArray(config.goals)) {
                    state.goals = config.goals;
                }
                if (config.daily_salt) state.dailySalt = config.daily_salt;
                console.log('Ajans Tracker: Config loaded', state.goals.length + ' rules');
                return config;
            })
            .catch(err => {
                console.log('Ajans Tracker: Using default/offline mode (Config fetch failed)', err);
                return null;
            });
    }

    // --- Smart Event Delegation ---

    function setupSmartEventListener() {
        // Global Click Listener
        document.body.addEventListener('click', function (e) {
            if (!state.goals.length) return;

            let target = e.target;
            // Bubble up to find matches (e.g. clicking icon inside button)
            while (target && target !== document.body) {
                checkGoals(target);
                target = target.parentElement;
            }
        }, true); // Use capture to ensure we catch it
    }

    function checkGoals(element) {
        state.goals.forEach(rule => {
            let match = false;

            // 1. CSS Class Match
            if (rule.type === 'css_class' && element.className && typeof element.className === 'string') {
                const classes = element.className.split(' ');
                if (classes.includes(rule.value)) match = true;
            }

            // 2. CSS ID Match
            else if (rule.type === 'css_id' && element.id === rule.value) {
                match = true;
            }

            // 3. Text Content Match
            else if (rule.type === 'text_contains' && element.innerText) {
                if (element.innerText.includes(rule.value)) match = true;
            }

            // 4. Href Contains (Links)
            else if (rule.type === 'href_contains' && element.href) {
                if (element.href.includes(rule.value)) match = true;
            }

            if (match) {
                // Prevent duplicate firing for same event? 
                // Simple debounce could be added here, but for now we track each match.
                trackGoal(rule.name, rule.default_value || 0);
            }
        });
    }

    // --- Tracking Functions ---

    function trackPageView() {
        // Simple Device Detection
        const width = window.innerWidth;
        let deviceType = 'Desktop';
        if (width < 768) deviceType = 'Mobile';
        else if (width < 1024) deviceType = 'Tablet';

        const data = {
            site_id: state.siteId,
            session_id: state.sessionId,
            url: window.location.href,
            page_title: document.title,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            screen_width: window.screen.width,
            viewport_width: window.innerWidth,
            device: deviceType, // Send detected device
            is_bot: /bot|crawl|spider|googlebot/i.test(navigator.userAgent)
        };
        sendToAPI('/track', data);
    }

    function trackGoal(goalName, goalValue = 0) {
        console.log('✨ Goal Triggered:', goalName);
        const data = {
            site_id: state.siteId,
            session_id: state.sessionId,
            goal_name: goalName,
            goal_value: goalValue,
            url: window.location.href,
            page_title: document.title,
            timestamp: new Date().toISOString()
        };
        sendToAPI('/goals', data);
    }

    function trackEvent(name, category = 'general', label = null, value = 0, metadata = {}) {
        const data = {
            site_id: state.siteId,
            session_id: state.sessionId,
            event_name: name,
            event_category: category,
            event_label: label,
            event_value: value,
            metadata: metadata,
            url: window.location.href,
            page_title: document.title,
            timestamp: new Date().toISOString()
        };
        sendToAPI('/events', data);
    }

    // --- Heatmap Logic (Simplified) ---
    function setupHeatmap() {
        if (navigator.doNotTrack === "1") return; // Respect DNT
        // Sampling check (1.0 = 100%)
        if (Math.random() > CONFIG.heatmapSampleRate) return;

        state.heatmapEnabled = true;

        // Clicks
        document.addEventListener('click', e => {
            state.heatmapBuffer.clicks.push({ x: e.pageX, y: e.pageY, timestamp: new Date().toISOString(), element: e.target.tagName });
            if (state.heatmapBuffer.clicks.length >= CONFIG.batchSize) flushHeatmap();
        });

        // Movements (Throttled)
        let lastMove = 0;
        document.addEventListener('mousemove', e => {
            const now = Date.now();
            if (now - lastMove > 200) { // Max 5 updates per second to save bandwidth
                state.heatmapBuffer.movements.push({ x: e.pageX, y: e.pageY, timestamp: new Date().toISOString() });
                lastMove = now;
            }
        });

        setInterval(flushHeatmap, CONFIG.batchInterval);
        window.addEventListener('beforeunload', flushHeatmap);
    }

    function flushHeatmap() {
        if (!state.heatmapEnabled) return;

        // Check if we have any data
        const hasData = state.heatmapBuffer.clicks.length > 0 || state.heatmapBuffer.movements.length > 0;
        if (!hasData) return;

        const data = {
            site_id: state.siteId,
            session_id: state.sessionId,
            url: window.location.href,
            page_title: document.title,
            viewport_width: window.innerWidth,
            clicks: state.heatmapBuffer.clicks,
            scrolls: [], // Scroll tracking can be added later if needed
            movements: state.heatmapBuffer.movements,
            timestamp: new Date().toISOString()
        };

        sendToAPI('/heatmap', data);

        // Clear Buffer
        state.heatmapBuffer = { clicks: [], scrolls: [], movements: [] };
    }

    // --- Behavioral Modules ---

    function setupBehavioralAnalytics() {
        // 1. Rage Click Detector
        document.addEventListener('click', (e) => {
            const now = Date.now();
            if (state.lastClick.target === e.target && (now - state.lastClick.time) < CONFIG.rageClickTime) {
                state.lastClick.count++;
                if (state.lastClick.count === CONFIG.rageClickThreshold) {
                    trackEvent('rage_click', 'frustration', getSelector(e.target));
                }
            } else {
                state.lastClick = { target: e.target, time: now, count: 1 };
            }

            // 2. Dead Click Detector (Simplified)
            // Wait to see if DOM mutates or URL changes
            state.lastInteractionTime = now;
            setTimeout(() => {
                const timeSinceMutation = state.domMutationTime - now;
                const isInteractive = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName) || e.target.closest('a, button');

                // If it looks clickable but caused no mutation/nav within 500ms
                // And wasn't a Rage Click
                if (!isInteractive && timeSinceMutation < 0 && state.lastClick.count < CONFIG.rageClickThreshold) {
                    // Check cursor style to be sure user *thought* it was clickable
                    const style = window.getComputedStyle(e.target);
                    if (style.cursor === 'pointer') {
                        trackEvent('dead_click', 'ui_error', getSelector(e.target));
                    }
                }
            }, CONFIG.deadClickTime);
        }, true);

        // 3. Form Abandonment
        document.addEventListener('focusin', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                state.lastFocusedInput = e.target;
            }
        }, true);

        document.addEventListener('submit', () => {
            state.lastFocusedInput = null; // Form submitted safely
        }, true);

        window.addEventListener('beforeunload', () => {
            if (state.lastFocusedInput) {
                trackEvent('form_abandonment', 'behavior', getSelector(state.lastFocusedInput));
            }
        });

        // 4. Performance Monitor (Web Vitals)
        if ('PerformanceObserver' in window) {
            const reportPerf = (metric, name) => {
                trackEvent('performance_metric', 'performance', name, Math.round(metric));
            };

            // LCP
            try {
                new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    reportPerf(lastEntry.startTime, 'LCP');
                }).observe({ type: 'largest-contentful-paint', buffered: true });
            } catch (e) { }

            // FID
            try {
                new PerformanceObserver((entryList) => {
                    for (const entry of entryList.getEntries()) {
                        reportPerf(entry.processingStart - entry.startTime, 'FID');
                    }
                }).observe({ type: 'first-input', buffered: true });
            } catch (e) { }

            // CLS (Optional addition)
            try {
                let clsScore = 0;
                new PerformanceObserver((entryList) => {
                    for (const entry of entryList.getEntries()) {
                        if (!entry.hadRecentInput) clsScore += entry.value;
                    }
                    // Report CLS when page unloads (approx) or periodical? 
                    // Keeping simple: LCP/FID as requested.
                }).observe({ type: 'layout-shift', buffered: true });
            } catch (e) { }
        }

        // Helper to track mutations for Dead Click
        new MutationObserver(() => {
            state.domMutationTime = Date.now();
        }).observe(document, { subtree: true, childList: true, attributes: true });
    }

    function getSelector(el) {
        if (!el) return 'unknown';
        if (el.id) return '#' + el.id;
        if (el.className && typeof el.className === 'string') return '.' + el.className.split(' ').join('.');
        return el.tagName.toLowerCase();
    }

    // --- Initialization ---

    function init() {
        // Check for Visual Picker Mode IMMEDIATELY
        const params = new URLSearchParams(window.location.search);
        const hash = window.location.hash;
        if (params.get('spectre_mode') === 'picker' || hash.includes('spectre_mode=picker')) {
            enableVisualPicker();
        }

        const scriptData = getScriptData();

        if (scriptData && scriptData.siteId) {
            if (scriptData.endpoint) CONFIG.apiEndpoint = scriptData.endpoint;
            startTracker(scriptData.siteId);
        }
    }

    async function startTracker(siteId) {
        if (state.siteId) return; // Already initialized

        state.siteId = siteId;

        // 1. Fetch Config
        await fetchRemoteConfig(siteId);

        // 2. Generate Session ID
        state.sessionId = await generateSessionId(state.dailySalt);
        console.log('Ajans Tracker: Active.', state.sessionId);

        // 3. Start Tracking
        trackPageView();

        // 4. Setup Listeners
        setupSmartEventListener();
        setupHeatmap();
        setupBehavioralAnalytics();

        // 5. Visual Picker (Late check)
        const params = new URLSearchParams(window.location.search);
        const hash = window.location.hash;
        if (params.get('spectre_mode') === 'picker' || hash.includes('spectre_mode=picker')) {
            enableVisualPicker();
        }

        // 6. SPA Support
        let lastUrl = location.href;
        new MutationObserver(() => {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                trackPageView();
            }
        }).observe(document, { subtree: true, childList: true });

        // 7. Heartbeat & Iframe Communication
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                trackEvent('heartbeat', 'system', null, 0, { type: 'ping' });
            }
            if (window.self !== window.top) {
                const height = document.body.scrollHeight;
                window.parent.postMessage({ type: 'SPECTRE_RESIZE', height: height }, '*');
            }
        }, 30000);

        // Initial resize
        if (window.self !== window.top) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const height = document.body.scrollHeight;
                    window.parent.postMessage({ type: 'SPECTRE_RESIZE', height: height }, '*');
                }, 1000);
            });
        }
    }

    function enableVisualPicker() {
        console.log('%c 🎯 SPECTRE VISUAL PICKER ACTIVE ', 'background: #7c3aed; color: #fff; font-size: 14px; padding: 4px; border-radius: 4px;');

        // 1. Manage Return URL Persistence
        const params = new URLSearchParams(window.location.search);
        let returnUrlBase = params.get('return_url');

        if (returnUrlBase) {
            // New session started, save to storage
            sessionStorage.setItem('spectre_return_url', returnUrlBase);
        } else {
            // Try to recover from storage (in case of redirect)
            returnUrlBase = sessionStorage.getItem('spectre_return_url');
        }

        if (!returnUrlBase) {
            returnUrlBase = 'https://spectredash.com/';
        }

        const style = document.createElement('style');
        style.innerHTML = `
            .spectre-picker-highlight { outline: 2px solid #ec4899 !important; cursor: crosshair !important; position: relative; }
            .spectre-picker-overlay { position: fixed; bottom: 20px; right: 20px; background: #111; color: #fff; padding: 15px; border-radius: 10px; z-index: 99999; font-family: sans-serif; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 1px solid #333; }
        `;
        document.head.appendChild(style);

        const overlay = document.createElement('div');
        overlay.className = 'spectre-picker-overlay';
        overlay.innerHTML = `<strong>🎯 Hedef Seçici</strong><br><span style="font-size:12px;color:#aaa">Seçmek istediğiniz öğeye tıklayın</span>`;
        document.body.appendChild(overlay);

        document.addEventListener('mouseover', e => {
            e.target.classList.add('spectre-picker-highlight');
        });
        document.addEventListener('mouseout', e => {
            e.target.classList.remove('spectre-picker-highlight');
        });

        document.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();

            const el = e.target;
            const text = (el.innerText || el.value || '').trim();
            let selector = '', type = '';

            // --- SMARTER SELECTOR LOGIC ---

            // 1. ID (Best)
            if (el.id) {
                selector = el.id;
                type = 'css_id';
            }
            // 2. Unique Attributes (Name, Alt, Type, Role)
            else if (el.name) {
                selector = `[name="${el.name}"]`;
                type = 'css_class'; // Using class type for generic selector
            }
            else if (el.getAttribute('alt')) {
                selector = `[alt="${el.getAttribute('alt')}"]`;
                type = 'css_class';
            }
            // 3. Text Content (User Preferred)
            else if (text && text.length > 0 && text.length < 50) {
                selector = text;
                type = 'text_contains';
            }
            // 4. Combined Class (Tag + Class)
            else if (el.classList.length > 0) {
                // Try to find a specific class, not just the first one
                selector = el.tagName.toLowerCase() + '.' + Array.from(el.classList).join('.');
                type = 'css_class';
            }
            // 5. Parent > Child (if simple)
            else if (el.parentElement && el.parentElement.id) {
                selector = `#${el.parentElement.id} > ${el.tagName.toLowerCase()}`;
                type = 'css_class';
            }
            // 6. Fallback
            else {
                selector = el.tagName.toLowerCase();
                type = 'css_class';
            }

            const confirmMsg = `Bu öğeyi seç? \n\nTip: ${type}\nSeçici: ${selector}\nMetin: ${text.substring(0, 20)}`;
            if (confirm(confirmMsg)) {
                try {
                    const dest = new URL(returnUrlBase);
                    dest.searchParams.set('new_selector', selector);
                    dest.searchParams.set('new_type', type);
                    dest.searchParams.set('new_text', text.substring(0, 30));

                    // Clear storage after use? No, keeps it safe.
                    window.location.href = dest.toString();
                } catch (e) {
                    console.error('Invalid Return URL', e);
                    const fb = `https://spectredash.com/?new_selector=${encodeURIComponent(selector)}&new_type=${type}`;
                    window.location.href = fb;
                }
            }
        }, true);
    }

    // Expose API Globally
    window.AjansTracker = {
        init: (id) => startTracker(id),
        track: trackPageView,
        goal: trackGoal,
        event: trackEvent
    };

    // Auto Start
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }

})(window, document);
