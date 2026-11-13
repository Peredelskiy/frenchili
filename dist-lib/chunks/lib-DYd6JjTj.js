// node_modules/@videojs/html/dist/default/registration/safe-define.js
function e(e, t = e.tagName) {
	let n = globalThis.customElements;
	n && !n.get(t) && n.define(t, e);
}
// node_modules/@lit/context/lib/context-request-event.js
var t = class extends Event {
	constructor(e, t, n, r) {
		super("context-request", {
			bubbles: !0,
			composed: !0
		}), this.context = e, this.contextTarget = t, this.callback = n, this.subscribe = r ?? !1;
	}
};
// node_modules/@lit/context/lib/create-context.js
function n(e) {
	return e;
}
// node_modules/@lit/context/lib/controllers/context-consumer.js
var r = class {
	constructor(e, t, n, r) {
		if (this.subscribe = !1, this.provided = !1, this.value = void 0, this.t = (e, t) => {
			this.unsubscribe && (this.unsubscribe !== t && (this.provided = !1, this.unsubscribe()), this.subscribe || this.unsubscribe()), this.value = e, this.host.requestUpdate(), this.provided && !this.subscribe || (this.provided = !0, this.callback && this.callback(e, t)), this.unsubscribe = t;
		}, this.host = e, t.context !== void 0) {
			let e = t;
			this.context = e.context, this.callback = e.callback, this.subscribe = e.subscribe ?? !1;
		} else this.context = t, this.callback = n, this.subscribe = r ?? !1;
		this.host.addController(this);
	}
	hostConnected() {
		this.dispatchRequest();
	}
	hostDisconnected() {
		this.unsubscribe &&= (this.unsubscribe(), void 0);
	}
	dispatchRequest() {
		this.host.dispatchEvent(new t(this.context, this.host, this.t, this.subscribe));
	}
}, i = class {
	get value() {
		return this.o;
	}
	set value(e) {
		this.setValue(e);
	}
	setValue(e, t = !1) {
		let n = t || !Object.is(e, this.o);
		this.o = e, n && this.updateObservers();
	}
	constructor(e) {
		this.subscriptions = /* @__PURE__ */ new Map(), this.updateObservers = () => {
			for (let [e, { disposer: t }] of this.subscriptions) e(this.o, t);
		}, e !== void 0 && (this.value = e);
	}
	addCallback(e, t, n) {
		if (!n) return void e(this.value);
		this.subscriptions.has(e) || this.subscriptions.set(e, {
			disposer: () => {
				this.subscriptions.delete(e);
			},
			consumerHost: t
		});
		let { disposer: r } = this.subscriptions.get(e);
		e(this.value, r);
	}
	clearCallbacks() {
		this.subscriptions.clear();
	}
}, a = class extends Event {
	constructor(e, t) {
		super("context-provider", {
			bubbles: !0,
			composed: !0
		}), this.context = e, this.contextTarget = t;
	}
}, o = class extends i {
	constructor(e, n, r) {
		super(n.context === void 0 ? r : n.initialValue), this.onContextRequest = (e) => {
			if (e.context !== this.context) return;
			let t = e.contextTarget ?? e.composedPath()[0];
			t !== this.host && (e.stopPropagation(), this.addCallback(e.callback, t, e.subscribe));
		}, this.onProviderRequest = (e) => {
			if (e.context !== this.context || (e.contextTarget ?? e.composedPath()[0]) === this.host) return;
			let n = /* @__PURE__ */ new Set();
			for (let [e, { consumerHost: r }] of this.subscriptions) n.has(e) || (n.add(e), r.dispatchEvent(new t(this.context, r, e, !0)));
			e.stopPropagation();
		}, this.host = e, this.context = n.context === void 0 ? n : n.context, this.attachListeners(), this.host.addController?.(this);
	}
	attachListeners() {
		this.host.addEventListener("context-request", this.onContextRequest), this.host.addEventListener("context-provider", this.onProviderRequest);
	}
	hostConnected() {
		this.host.dispatchEvent(new a(this.context, this.host));
	}
}, s = /* @__PURE__ */ new WeakSet(), c = class extends r {
	hostConnected() {
		l(this.host.ownerDocument), super.hostConnected();
	}
};
function l(e) {
	if (s.has(e)) return;
	s.add(e);
	let n = /* @__PURE__ */ new Map();
	e.addEventListener("context-request", (e) => {
		let t = e;
		if (t.subscribe !== !0) return;
		let r = t.contextTarget ?? t.composedPath()[0], i = n.get(t.context) ?? [];
		i.some((e) => e.element.deref() === r && e.callback.deref() === t.callback) || (i.push({
			element: new WeakRef(r),
			callback: new WeakRef(t.callback)
		}), n.set(t.context, i));
	}), e.addEventListener("context-provider", (e) => {
		let { context: r } = e, i = n.get(r);
		if (i) {
			n.delete(r);
			for (let e of i) {
				let n = e.element.deref(), i = e.callback.deref();
				n?.isConnected && i && n.dispatchEvent(new t(r, n, i, !0));
			}
		}
	});
}
var u = n(Symbol.for("@videojs/player")), d = n(Symbol.for("@videojs/media")), f = n(Symbol.for("@videojs/container")), p = n(Symbol.for("@videojs/extension"));
// node_modules/@videojs/utils/dist/predicate/predicate.js
function m(e) {
	return typeof e == "string";
}
function h(e) {
	return typeof e == "number";
}
function g(e) {
	return typeof e == "boolean";
}
function _(e) {
	return typeof e == "function";
}
function v(e) {
	return e === null;
}
function y(e) {
	return e === void 0;
}
function b(e) {
	return e == null;
}
function x(e) {
	return e instanceof Promise;
}
function S(e) {
	return typeof e == "object" && !!e;
}
function C(e, t) {
	return S(e) ? t.every((t) => _(e[t])) : !1;
}
function w(e) {
	if (!S(e)) return !1;
	let t = Object.getPrototypeOf(e);
	return t === null || t === Object.prototype;
}
function ee(e) {
	return e instanceof Error && e.name === "AbortError";
}
// node_modules/@videojs/utils/dist/object/defaults.js
function T(e, t) {
	let n = { ...t };
	for (let r of Object.keys(t)) {
		let t = e[r];
		y(t) || (n[r] = t);
	}
	return n;
}
// node_modules/@videojs/utils/dist/object/pick.js
function te(e, t) {
	let n = {};
	for (let r of t) Object.hasOwn(e, r) && (n[r] = e[r]);
	return n;
}
// node_modules/@videojs/utils/dist/object/shallow-equal.js
var ne = Object.prototype.hasOwnProperty;
function re(e, t) {
	if (Object.is(e, t)) return !0;
	if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
	let n = Reflect.ownKeys(e), r = Reflect.ownKeys(t);
	if (n.length !== r.length) return !1;
	for (let r of n) if (!ne.call(t, r) || !Object.is(e[r], t[r])) return !1;
	return !0;
}
// node_modules/@videojs/utils/dist/function/noop.js
function E(...e) {}
// node_modules/@videojs/store/dist/default/html/controllers/snapshot-controller.js
var ie = class {
	#e;
	#t;
	#n;
	#r;
	#i = E;
	constructor(e, t, n) {
		this.#e = e, this.#n = t, this.#t = n, e.addController(this);
	}
	get value() {
		return this.#t ? (this.#r ??= this.#t(this.#n.current), this.#r) : this.#n.current;
	}
	track(e) {
		this.#n = e, this.#a();
	}
	hostConnected() {
		this.#a();
	}
	hostDisconnected() {
		this.#i(), this.#i = E, this.#r = void 0;
	}
	#a() {
		if (this.#i(), !this.#t) {
			this.#i = this.#n.subscribe(() => this.#e.requestUpdate());
			return;
		}
		let e = this.#t;
		this.#r = e(this.#n.current), this.#i = this.#n.subscribe(() => {
			let t = e(this.#n.current);
			re(this.#r, t) || (this.#r = t, this.#e.requestUpdate());
		});
	}
};
// node_modules/@videojs/utils/dist/events/abort.js
function ae(e) {
	if ("any" in AbortSignal) return AbortSignal.any(e);
	let t = new AbortController();
	for (let n of e) {
		if (n.aborted) return t.abort(n.reason), t.signal;
		n.addEventListener("abort", () => t.abort(n.reason), { signal: t.signal });
	}
	return t.signal;
}
// node_modules/@videojs/store/dist/default/core/abort-controller-registry.js
var oe = class {
	#e;
	#t = /* @__PURE__ */ new Map();
	get base() {
		return (this.#e ??= new AbortController()).signal;
	}
	clear() {
		for (let e of this.#t.values()) e.abort();
		this.#t.clear();
	}
	reset() {
		this.clear(), this.#e?.abort(), this.#e = void 0;
	}
	supersede(e) {
		this.#t.get(e)?.abort();
		let t = new AbortController();
		return this.#t.set(e, t), ae([this.base, t.signal]);
	}
}, se = class extends Error {
	code;
	cause;
	constructor(e, t) {
		super(t?.message ?? e), this.name = "StoreError", this.code = e, this.cause = t?.cause;
	}
};
function ce() {
	throw new se("NO_TARGET");
}
function le() {
	throw new se("DESTROYED");
}
// node_modules/@videojs/store/dist/default/core/state.js
var ue = !1;
function de() {
	ue || (ue = !0, queueMicrotask(pe));
}
var fe = /* @__PURE__ */ new Set();
function pe() {
	ue = !1;
	for (let e of fe) e.flush();
	fe.clear();
}
var me = Object.prototype.hasOwnProperty, he = class {
	#e;
	#t = /* @__PURE__ */ new Set();
	#n = !1;
	constructor(e) {
		this.#e = Object.freeze({ ...e });
	}
	get current() {
		return this.#e;
	}
	patch(e) {
		let t = { ...this.#e }, n = !1;
		for (let r of Reflect.ownKeys(e)) {
			if (!me.call(e, r)) continue;
			let i = e[r];
			Object.is(this.#e[r], i) || (t[r] = i, n = !0);
		}
		n && (this.#e = Object.freeze(t), this.#r());
	}
	replace(e) {
		re(this.#e, e) || (this.#e = Object.freeze({ ...e }), this.#r());
	}
	subscribe(e, t) {
		let n = t?.signal;
		if (n?.aborted) return E;
		if (this.#t.add(e), !n) return () => this.#t.delete(e);
		let r = () => this.#t.delete(e);
		return n.addEventListener("abort", r, { once: !0 }), () => {
			n.removeEventListener("abort", r), this.#t.delete(e);
		};
	}
	flush() {
		if (this.#n) {
			this.#n = !1;
			for (let e of this.#t) e();
		}
	}
	#r() {
		this.#n = !0, fe.add(this), de();
	}
};
function D(e) {
	return new he(e);
}
// node_modules/@videojs/store/dist/default/core/store.js
var ge = Symbol.for("@videojs/store"), _e = Object.prototype.hasOwnProperty;
function ve() {
	return ((e, t = {}) => {
		let n = null, r = !1, i = new AbortController(), a = new oe(), o = /* @__PURE__ */ new WeakMap(), s = /* @__PURE__ */ new WeakSet(), c, l;
		function u() {
			r && le(), n || ce();
		}
		let d = ye(e.state({
			target: () => (u(), n),
			signals: a,
			get: () => c,
			set: (e) => y(e)
		}));
		c = d;
		let f = m(c);
		l = D(h(c, f));
		let p = {
			[ge]: !0,
			get $state() {
				return l;
			},
			get target() {
				return n;
			},
			get destroyed() {
				return r;
			},
			get state() {
				return l.current;
			},
			attach: b,
			destroy: w,
			subscribe: ee
		};
		for (let e of Object.keys(l.current)) Object.defineProperty(p, e, {
			get: () => l.current[e],
			enumerable: !0
		});
		for (let e of Object.getOwnPropertySymbols(c)) typeof c[e] == "function" && Object.defineProperty(p, e, { get: () => c[e] });
		try {
			t.onSetup?.({
				store: p,
				signal: i.signal
			});
		} catch (e) {
			T(e);
		}
		return p;
		function m(t) {
			let n = {}, r = e.derived;
			if (!r) return n;
			let i = { get: () => t };
			for (let e of Object.keys(r)) n[e] = r[e](i);
			return n;
		}
		function h(e, t) {
			let n = {};
			for (let t of Object.keys(e)) n[t] = e[t];
			Object.assign(n, t);
			for (let e of Object.keys(n)) {
				let t = n[e];
				_(t) && (n[e] = g(t));
			}
			return n;
		}
		function g(e) {
			let n = o.get(e);
			if (n) return n;
			let r = function(...n) {
				try {
					let r = e.apply(this, n);
					return t.onError && x(r) && r.catch(T), r;
				} catch (e) {
					throw t.onError && T(e), e;
				}
			};
			return o.set(e, r), r;
		}
		function y(e) {
			let t = be(c, e);
			if (!t) return;
			let n = m(t.next);
			c = t.next, l.replace(h(c, n));
		}
		function b(i) {
			r && le(), a.reset(), n = i;
			let o = {
				target: i,
				signal: a.base,
				get: () => c,
				set: (e) => {
					try {
						y(e);
					} catch (e) {
						T(e);
					}
				},
				reportError: T,
				store: {
					get state() {
						return l.current;
					},
					subscribe: ee
				}
			};
			try {
				e.attach?.(o);
			} catch (e) {
				T(e);
			}
			try {
				t.onAttach?.({
					store: p,
					target: i,
					signal: a.base
				});
			} catch (e) {
				T(e);
			}
			return C;
		}
		function C() {
			if (v(n)) return;
			a.reset(), n = null;
			let t = { ...d };
			for (let n of e.preserve ?? []) t[n] = c[n];
			y(t);
		}
		function w() {
			r || (r = !0, C(), i.abort());
		}
		function ee(e, t) {
			return l.subscribe(e, t);
		}
		function T(e) {
			if (S(e)) {
				if (s.has(e)) return;
				s.add(e);
			}
			t.onError ? t.onError({
				store: p,
				error: e
			}) : console.error("[vjs-store]", e);
		}
	});
}
function ye(e) {
	return Object.freeze({ ...e });
}
function be(e, t) {
	let n = { ...e }, r = !1;
	for (let i of Reflect.ownKeys(t)) {
		if (!_e.call(t, i)) continue;
		let a = t[i];
		Object.is(e[i], a) || (n[i] = a, r = !0);
	}
	return r ? { next: Object.freeze(n) } : null;
}
function xe(e) {
	return S(e) && ge in e;
}
// node_modules/@videojs/store/dist/default/html/store-accessor.js
var Se = class {
	#e;
	#t;
	#n;
	constructor(e, t, n) {
		this.#e = n ?? E, xe(t) ? (this.#n = t, this.#t = null) : (this.#n = null, this.#t = new c(e, {
			context: t,
			callback: (e) => this.#e(e),
			subscribe: !1
		})), e.addController(this);
	}
	get value() {
		return this.#t ? this.#t.value ?? null : this.#n;
	}
	hostConnected() {
		this.#n && this.#e(this.#n);
	}
}, Ce = class {
	#e;
	#t;
	#n;
	#r = null;
	constructor(e, t, n) {
		this.#e = e, this.#t = n, this.#n = new Se(e, t, (e) => this.#i(e)), e.addController(this);
	}
	get value() {
		let e = this.#n.value;
		if (v(e)) throw Error("Store not available");
		return y(this.#t) ? e : this.#r.value;
	}
	hostConnected() {}
	#i(e) {
		y(this.#t) || (this.#r ? this.#r.track(e.$state) : this.#r = new ie(this.#e, e.$state, this.#t));
	}
}, O = class {
	#e;
	#t;
	#n;
	#r = null;
	constructor(e, t, n) {
		this.#e = e, this.#t = n, this.#n = new c(e, {
			context: t,
			callback: (e) => this.#i(e),
			subscribe: !0
		}), e.addController(this);
	}
	get value() {
		let e = this.#n.value;
		if (e) return this.#t ? this.#r?.value : e;
	}
	get displayName() {
		return this.#t?.displayName;
	}
	hostConnected() {
		let e = this.#n.value;
		e && this.#i(e);
	}
	hostDisconnected() {
		this.#r = null;
	}
	#i(e) {
		!this.#r && this.#t && (this.#r = new Ce(this.#e, e, this.#t));
	}
};
function we(e) {
	class t extends O {
		constructor(t, n) {
			n ? super(t, e, n) : super(t, e);
		}
	}
	return t;
}
// node_modules/@videojs/utils/dist/dom/animation-frame.js
function Te(e) {
	let t = requestAnimationFrame(e);
	return () => cancelAnimationFrame(t);
}
// node_modules/@videojs/utils/dist/dom/children.js
function Ee(e) {
	if (e instanceof HTMLSlotElement) {
		let t = e.assignedElements();
		if (t.length > 0) return t;
	}
	return [...e.children];
}
function De(e, t) {
	let n = Ee(e);
	for (let [e, r] of n.entries()) {
		if (t(r, e)) return r;
		let n = De(r, t);
		if (n) return n;
	}
	return null;
}
// node_modules/@videojs/utils/dist/dom/listen.js
function k(e, t, n, r) {
	return e.addEventListener(t, n, r), () => e.removeEventListener(t, n, r);
}
// node_modules/@videojs/utils/dist/dom/direction.js
function Oe(e) {
	let t = e.closest("[dir]")?.getAttribute("dir")?.toLowerCase();
	return t === "rtl" || t === "ltr" ? t === "rtl" : getComputedStyle(e).direction === "rtl";
}
// node_modules/@videojs/utils/dist/dom/event.js
function ke(e) {
	let t = e.composedPath();
	return t.length > 0 ? t[0] : e.target;
}
function Ae(e, t, n) {
	return new Promise((r, i) => {
		let a = () => {
			i(n?.signal?.reason ?? "Aborted");
		};
		n?.signal?.aborted ? a() : (n?.signal?.addEventListener("abort", a, { once: !0 }), e.addEventListener(t, (e) => {
			n?.signal?.removeEventListener("abort", a), r(e);
		}, {
			...n,
			once: !0
		}));
	});
}
// node_modules/@videojs/utils/dist/dom/predicates.js
function je(e) {
	return e instanceof Node && e.nodeType === 9;
}
function Me(e) {
	return e instanceof Node && e.nodeType === 11 && "host" in e;
}
function Ne(e) {
	return e instanceof HTMLImageElement;
}
// node_modules/@videojs/utils/dist/dom/walk-ancestors.js
function Pe(e, t, n = {}) {
	if (!e || typeof document > "u") return;
	let r = e;
	for (; r;) {
		let e = t(r);
		if (!y(e)) return e;
		r = n.composed ? Fe(r) : r.parentElement;
	}
}
function Fe(e) {
	if (e.assignedSlot) return e.assignedSlot;
	if (e.parentElement) return e.parentElement;
	let t = e.getRootNode();
	return Me(t) ? t.host : null;
}
// node_modules/@videojs/utils/dist/dom/focus.js
var Ie = "a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),audio[controls],video[controls],iframe,[contenteditable]:not([contenteditable=\"false\"]),[tabindex]:not([tabindex=\"-1\"])";
function A(e = document) {
	let t = e.activeElement;
	for (; t?.shadowRoot?.activeElement;) t = t.shadowRoot.activeElement;
	return t;
}
function Le(e) {
	let t = [], n = /* @__PURE__ */ new Set();
	return r(e), t;
	function r(e) {
		for (let t of e.children) i(t);
	}
	function i(e) {
		if (!n.has(e)) {
			if (n.add(e), e instanceof HTMLElement && Re(e) && t.push(e), e instanceof HTMLSlotElement) {
				let t = e.assignedElements({ flatten: !0 });
				if (t.length > 0) for (let e of t) i(e);
				else r(e);
			} else e.shadowRoot ? r(e.shadowRoot) : r(e);
		}
	}
}
function Re(e) {
	return !e.matches(Ie) || e.tabIndex < 0 || e.matches(":disabled") ? !1 : !Pe(e, (e) => {
		if (e instanceof HTMLElement && (e.hidden || e.hasAttribute("inert") || e.getAttribute("aria-hidden") === "true")) return !0;
	}, { composed: !0 });
}
// node_modules/@videojs/utils/dist/dom/supports.js
function ze() {
	return typeof CSS < "u" && CSS.supports("anchor-name: --a");
}
function Be() {
	return typeof HTMLElement < "u" && "popover" in HTMLElement.prototype;
}
var Ve = [
	"textarea",
	"select",
	"input:not([type])",
	...[
		"text",
		"search",
		"url",
		"tel",
		"email",
		"password",
		"number"
	].map((e) => `input[type="${e}"]`),
	"[contenteditable]:not([contenteditable=\"false\"])"
].join(",");
function He(e) {
	return e.matches(Ve);
}
function Ue(e) {
	let t = ke(e);
	return t instanceof Element && He(t);
}
var We = /* @__PURE__ */ new Set([" ", "Enter"]), Ge = "button,a[href],[role=\"slider\"],[role=\"button\"]";
function Ke(e) {
	if (!We.has(e.key)) return !1;
	let t = ke(e);
	return t instanceof Element && t.matches(Ge);
}
// node_modules/@videojs/utils/dist/dom/keep-alive.js
function qe(e) {
	return Pe(e, (e) => e.hasAttribute("keep-alive") ? !0 : void 0, { composed: !0 }) ?? !1;
}
// node_modules/@videojs/utils/dist/string/casing.js
function Je(e) {
	return e.replace(/[-_](.)/g, (e, t) => t.toUpperCase()).replace(/^(.)/, (e, t) => t.toUpperCase());
}
function Ye(e) {
	return Je(e).replace(/^(.)/, (e, t) => t.toLowerCase());
}
function Xe(e) {
	return e.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
}
function Ze(e) {
	return e.replace(/[A-Z]/g, (e) => `_${e.toLowerCase()}`);
}
// node_modules/@videojs/utils/dist/dom/style.js
function Qe(e) {
	return e.startsWith("--") ? e : Xe(e);
}
function $e(e) {
	let t = e.style.getPropertyValue("anchor-name").trim();
	return !t || t === "none" ? [] : t.split(",").map((e) => e.trim()).filter(Boolean);
}
function et(e, t) {
	for (let [n, r] of Object.entries(t)) typeof r == "string" && e.style.setProperty(Qe(n), r);
}
function tt(e, t) {
	return [...t].map((t) => {
		let n = Qe(t);
		return {
			property: n,
			value: e.style.getPropertyValue(n),
			priority: e.style.getPropertyPriority(n)
		};
	});
}
function nt(e, t) {
	for (let { property: n, value: r, priority: i } of t) r ? e.style.setProperty(n, r, i) : e.style.removeProperty(n);
}
function rt(e, t) {
	let n = t.trim();
	if (!n) return 0;
	let r = Number.parseFloat(n);
	if (!Number.isNaN(r) && (/^-?\d*\.?\d+$/.test(n) || n.endsWith("px"))) return r;
	let i = e.ownerDocument, a = i?.documentElement;
	if (!Number.isNaN(r) && n.endsWith("rem")) return r * (a && Number.parseFloat(getComputedStyle(a).fontSize) || 16);
	if (!Number.isNaN(r) && n.endsWith("em")) return r * (e instanceof HTMLElement && Number.parseFloat(getComputedStyle(e).fontSize) || 16);
	if (!i) return Number.isNaN(r) ? 0 : r;
	let o = i.createElement("div");
	if (o.style.position = "absolute", o.style.visibility = "hidden", o.style.pointerEvents = "none", o.style.inlineSize = n, !o.style.inlineSize) return 0;
	o.style.blockSize = "0", o.style.padding = "0", o.style.border = "0", o.style.inset = "0";
	let s = getComputedStyle(e);
	o.style.fontSize = s.fontSize;
	for (let e = 0; e < s.length; e++) {
		let t = s.item(e);
		t.startsWith("--") && o.style.setProperty(t, s.getPropertyValue(t));
	}
	let c = i.body ?? i.documentElement;
	if (!c) return Number.isNaN(r) ? 0 : r;
	if (c.appendChild(o), getComputedStyle(o).inlineSize === "auto") return o.remove(), 0;
	let l = o.getBoundingClientRect().width;
	return o.remove(), Number.isFinite(l) ? l : Number.isNaN(r) ? 0 : r;
}
// node_modules/@videojs/utils/dist/dom/layout.js
function it(e, { box: t = "bounding", overflow: n = "none" } = {}) {
	let r = e.getBoundingClientRect(), i = t === "layout" && e.offsetWidth || r.width, a = t === "layout" && e.offsetHeight || r.height;
	return (n === "width" || n === "both") && (i = Math.max(i, e.scrollWidth)), (n === "height" || n === "both") && (a = Math.max(a, e.scrollHeight)), {
		width: i,
		height: a
	};
}
function at(e, t) {
	let n = e.getBoundingClientRect();
	return n.width > 0 && n.height > 0 && t.clientX >= n.left && t.clientX < n.right && t.clientY >= n.top && t.clientY < n.bottom;
}
// node_modules/@videojs/utils/dist/i18n.js
function ot(e) {
	let t = Array.isArray(e) ? e[0] : e;
	return !t || t === "en" || t.startsWith("en-");
}
// node_modules/@videojs/utils/dist/dom/observe-elements.js
function st(e, t) {
	if (typeof ResizeObserver > "u") return E;
	let n = new ResizeObserver(t), r = Symbol.iterator in Object(e) ? e : [e];
	for (let e of r) n.observe(e);
	return () => n.disconnect();
}
// node_modules/@videojs/utils/dist/dom/platform.js
function ct() {
	return typeof navigator < "u" && /mac/i.test(navigator.userAgent);
}
// node_modules/@videojs/utils/dist/dom/popover.js
var lt = {
	sideOffset: 0,
	boundaryOffset: 0
}, ut = {
	top: "bottom",
	bottom: "top",
	left: "right",
	right: "left"
};
function dt(e, t, n, r) {
	let i = r.boundaryOffset ?? 0;
	switch (n) {
		case "top": return e.top - t.top - i - r.sideOffset;
		case "bottom": return t.bottom - e.bottom - i - r.sideOffset;
		case "left": return e.left - t.left - i - r.sideOffset;
		case "right": return t.right - e.right - i - r.sideOffset;
	}
}
function ft(e, t, n, r, i = lt) {
	let a = r.side, o = ut[a], s = a === "top" || a === "bottom" ? t.height : t.width, c = dt(e, n, a, i);
	return c >= s ? a : dt(e, n, o, i) > c ? o : a;
}
function pt(e) {
	try {
		e?.showPopover?.();
	} catch {}
}
function mt(e) {
	try {
		e?.hidePopover?.();
	} catch {}
}
function ht(e) {
	e instanceof Element && e.shadowRoot && ht(e.shadowRoot);
	for (let t of e.querySelectorAll("*")) gt(t) && mt(t), t.shadowRoot && ht(t.shadowRoot);
}
function gt(e) {
	try {
		return e.matches(":popover-open");
	} catch {
		return !1;
	}
}
// node_modules/@videojs/utils/dist/dom/raf-throttle.js
function _t(e) {
	let t = null, n, r = (...r) => {
		n = r, t === null && (t = requestAnimationFrame(() => {
			t = null, e(...n);
		}));
	};
	return r.cancel = () => {
		t !== null && (cancelAnimationFrame(t), t = null);
	}, r;
}
// node_modules/@videojs/utils/dist/dom/text-track.js
function vt(e) {
	return e.kind === "captions" || e.kind === "subtitles";
}
function yt(e) {
	return Array.from(e).filter(vt).sort(xt);
}
function bt(e, t) {
	if (!(e instanceof HTMLElement)) return null;
	for (let n of e.querySelectorAll("track")) if (n.track === t) return n;
	return null;
}
function xt(e, t) {
	return e.kind > t.kind ? 1 : e.kind < t.kind ? -1 : 0;
}
// node_modules/@videojs/utils/dist/dom/time-ranges.js
function St(e) {
	let t = [];
	for (let n = 0; n < e.length; n++) t.push([e.start(n), e.end(n)]);
	return t;
}
// node_modules/@videojs/utils/dist/dom/tree.js
function j(e, t) {
	let n = t;
	for (; n;) {
		if (n === e || e.contains(n)) return !0;
		let t = n.getRootNode();
		n = n.assignedSlot ?? n.parentElement ?? (Me(t) ? t.host : null);
	}
	return !1;
}
// node_modules/@videojs/utils/dist/dom/webkit.js
function Ct() {
	return "WebKitPlaybackTargetAvailabilityEvent" in globalThis;
}
function wt(e) {
	return Ct() && "webkitCurrentPlaybackTargetIsWireless" in e;
}
// node_modules/@videojs/element/dist/default/destroy-mixin.js
var Tt = /* @__PURE__ */ new WeakSet();
function Et(e) {
	e.shadowRoot && Dt(e.shadowRoot), Dt(e);
}
function Dt(e) {
	for (let t of Array.from(e.children)) Tt.has(t) ? t.destroy() : Et(t);
}
function Ot(e) {
	class t extends e {
		#e = !1;
		#t = /* @__PURE__ */ new Set();
		constructor(...e) {
			super(...e), Tt.add(this);
		}
		get destroyed() {
			return this.#e;
		}
		destroy() {
			this.#e || (this.#e = !0, Et(this), this.destroyCallback());
		}
		destroyCallback() {
			for (let e of this.#t) e.hostDestroyed?.();
		}
		addController(e) {
			super.addController(e), this.#t.add(e);
		}
		removeController(e) {
			super.removeController(e), this.#t.delete(e);
		}
		connectedCallback() {
			this.#e || super.connectedCallback();
		}
		disconnectedCallback() {
			super.disconnectedCallback(), !this.#e && !qe(this) && requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					this.isConnected || this.destroy();
				});
			});
		}
		performUpdate() {
			this.#e || super.performUpdate();
		}
	}
	return t;
}
// node_modules/@videojs/element/dist/default/reactive-element.js
var kt = /* @__PURE__ */ new WeakMap(), At = /* @__PURE__ */ new Map(), jt = globalThis.HTMLElement ?? class {}, Mt = class extends jt {
	static {
		this.properties = {};
	}
	static get observedAttributes() {
		return [...Nt(this).attrToProp.keys()];
	}
	#e;
	#t;
	#n;
	#r;
	#i;
	constructor() {
		super(), this.#e = /* @__PURE__ */ new Set(), this.#t = /* @__PURE__ */ new Map(), this.#r = !1, this.isUpdatePending = !1, this.hasUpdated = !1, this.#i = new Promise((e) => this.enableUpdating = e);
		let { props: e } = Nt(this.constructor);
		for (let t of e.keys()) Object.hasOwn(this, t) && ((this.#n ??= /* @__PURE__ */ new Map()).set(t, this[t]), delete this[t]);
		this.requestUpdate();
	}
	enableUpdating(e) {}
	addController(e) {
		this.#e.add(e), this.isConnected && e.hostConnected?.();
	}
	removeController(e) {
		this.#e.delete(e);
	}
	connectedCallback() {
		this.#o(), this.enableUpdating(!0);
		for (let e of this.#e) e.hostConnected?.();
	}
	disconnectedCallback() {
		for (let e of this.#e) e.hostDisconnected?.();
	}
	attributeChangedCallback(e, t, n) {
		if (t === n) return;
		let { props: r, attrToProp: i } = Nt(this.constructor), a = i.get(e);
		if (!a) return;
		let o = r.get(a);
		if (!o) return;
		let s = n;
		o.type === Boolean ? s = n !== null : o.type === Number && (s = n === null ? null : Number(n)), this[a] = s;
	}
	requestUpdate(e, t) {
		e !== void 0 && !this.#t.has(e) && this.#t.set(e, t), this.isUpdatePending || (this.#i = this.#a());
	}
	async #a() {
		this.isUpdatePending = !0;
		try {
			await this.#i;
		} catch (e) {
			Promise.reject(e);
		}
		let e = this.scheduleUpdate();
		return e != null && await e, !this.isUpdatePending;
	}
	scheduleUpdate() {
		this.performUpdate();
	}
	performUpdate() {
		if (!this.isUpdatePending) return;
		let e = this.#t;
		this.willUpdate(e);
		for (let e of this.#e) e.hostUpdate?.();
		this.update(e), this.#t = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
		for (let e of this.#e) e.hostUpdated?.();
		this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
	}
	willUpdate(e) {}
	update(e) {}
	firstUpdated(e) {}
	updated(e) {}
	get updateComplete() {
		return this.#i;
	}
	#o() {
		if (this.#r) return;
		this.#r = !0;
		let { props: e } = Nt(this.constructor);
		for (let t of e.keys()) {
			let e = this.#n?.has(t) ?? !1, n = Object.hasOwn(this, t);
			if (!e && !n) continue;
			let r = e ? this.#n?.get(t) : Reflect.get(this, t);
			n && Reflect.deleteProperty(this, t), Reflect.set(this, t, r);
		}
		this.#n = void 0;
	}
};
function Nt(e) {
	let t = kt.get(e);
	if (t) return t;
	let n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
	for (let [t, i] of Object.entries(e.properties)) if (n.set(t, i), r.set(i.attribute ?? t, t), !Object.getOwnPropertyDescriptor(e.prototype, t)?.get) {
		let n = At.get(t);
		n || (n = Symbol(t), At.set(t, n)), Object.defineProperty(e.prototype, t, {
			get() {
				return this[n];
			},
			set(e) {
				let r = this[n];
				this[n] = e, Object.is(r, e) || this.requestUpdate(t, r);
			},
			configurable: !0,
			enumerable: !0
		});
	}
	let i = {
		props: n,
		attrToProp: r
	};
	return kt.set(e, i), i;
}
// node_modules/@videojs/html/dist/default/ui/ui-element.js
var M = class extends Ot(Mt) {}, Pt = Object.freeze({
	length: 0,
	start: () => 0,
	end: () => 0
});
Object.freeze({
	length: 0,
	start: () => 0,
	end: () => 0
});
var Ft = Object.assign(new EventTarget(), {
	length: 0,
	*[Symbol.iterator]() {},
	getTrackById: () => null
}), It = new EventTarget(), N = class e extends Error {
	static MEDIA_ERR_ABORTED = 1;
	static MEDIA_ERR_NETWORK = 2;
	static MEDIA_ERR_DECODE = 3;
	static MEDIA_ERR_SRC_NOT_SUPPORTED = 4;
	static MEDIA_ERR_ENCRYPTED = 5;
	static MEDIA_ERR_CUSTOM = 100;
	static defaultMessages = {
		1: "You stopped media playback before it finished.",
		2: "This media could not be loaded due to a network or server issue.",
		3: "This media could not be played. It may be corrupted, or your browser may not support its format.",
		4: "This media could not be loaded. It may be unavailable, or your browser may not support its format.",
		5: "This media could not be played because it could not be decrypted."
	};
	name;
	code;
	context;
	fatal;
	data;
	constructor(t, n = e.MEDIA_ERR_CUSTOM, r, i) {
		super(t), this.name = "MediaError", this.code = n, this.context = i, this.fatal = r ?? (n >= e.MEDIA_ERR_NETWORK && n <= e.MEDIA_ERR_ENCRYPTED), this.message ||= e.defaultMessages[this.code] ?? "";
	}
}, Lt = Symbol.for("@videojs/media/registered");
function Rt(e) {
	return e?.[Lt] ?? e;
}
// node_modules/@videojs/media/dist/default/core/types.js
function zt(e) {
	return b(e) ? null : e.toLowerCase() === "use-credentials" ? "use-credentials" : "anonymous";
}
var Bt = {
	HAVE_NOTHING: 0,
	HAVE_METADATA: 1,
	HAVE_CURRENT_DATA: 2,
	HAVE_FUTURE_DATA: 3,
	HAVE_ENOUGH_DATA: 4
}, Vt = {
	ON_DEMAND: "on-demand",
	LIVE: "live",
	UNKNOWN: "unknown"
};
// node_modules/@videojs/media/dist/default/core/predicate.js
function Ht(e) {
	return e.readyState >= Bt.HAVE_METADATA;
}
function Ut(e) {
	if (Number.isFinite(e.duration) && e.duration > 0) return e.duration;
	let t = e.seekable.at(-1)?.[1];
	return t === void 0 || !Number.isFinite(t) || t <= 0 ? 0 : t;
}
function Wt(e) {
	return S(e) && g(e.autoplay);
}
function Gt(e) {
	if (!S(e)) return !1;
	let t = e;
	return !y(t.paused) && !y(t.ended) && _(t.pause);
}
function Kt(e) {
	if (!S(e)) return !1;
	let t = e;
	return !y(t.currentTime) && !y(t.duration) && !y(t.seeking);
}
function qt(e) {
	if (!S(e)) return !1;
	let t = e;
	return !y(t.src) && !y(t.currentSrc) && !y(t.readyState) && _(t.load);
}
function Jt(e) {
	if (!S(e)) return !1;
	let t = e;
	return !y(t.volume) && !y(t.muted);
}
function Yt(e) {
	return S(e) ? !y(e.muted) : !1;
}
function Xt(e) {
	return S(e) ? !y(e.playbackRate) : !1;
}
function Zt(e) {
	return S(e) ? _(e.requestPictureInPicture) : !1;
}
function Qt(e) {
	if (!S(e)) return !1;
	let t = e;
	return !y(t.buffered) && t.buffered !== Pt && !y(t.seekable) && t.seekable !== Pt;
}
function $t(e) {
	return S(e) ? !y(e.error) : !1;
}
function en(e) {
	if (!S(e)) return !1;
	let t = e;
	return !y(t.textTracks) && t.textTracks !== Ft;
}
function tn(e) {
	return S(e) ? !y(e.videoRenditions) : !1;
}
function nn(e) {
	return S(e) ? !y(e.audioTracks) : !1;
}
function rn(e) {
	if (!S(e)) return !1;
	let t = e;
	return !y(t.videoWidth) && !y(t.videoHeight);
}
function an(e) {
	if (!S(e)) return !1;
	let t = e;
	return S(t.remote) && t.remote !== It;
}
function on(e) {
	return S(e) ? !y(e.streamType) : !1;
}
function sn(e) {
	return S(e) ? !y(e.contentData) : !1;
}
function cn(e) {
	if (!S(e)) return !1;
	let t = e;
	return !y(t.liveEdgeStart) && !y(t.targetLiveWindow);
}
function ln(e) {
	return S(e) && "querySelectorAll" in e && _(e.querySelectorAll);
}
// node_modules/@videojs/core/dist/default/dom/extensions/media.js
function un(e, t) {
	return new Proxy(e, {
		get(e, n) {
			if (n === Lt) return e;
			let r = dn(t, n) ?? e, i = r[n];
			return _(i) && n !== "constructor" ? i.bind(r) : i;
		},
		set(e, n, r) {
			let i = dn(t, n) ?? e;
			return Reflect.set(i, n, r);
		},
		has(e, n) {
			return !b(dn(t, n)) || n in e;
		}
	});
}
function dn(e, t) {
	if (Object.hasOwn(Object.prototype, t)) return null;
	for (let { mediaOverride: n } of e()) if (!b(n) && !y(n[t])) return n;
	return null;
}
// node_modules/@videojs/core/dist/default/dom/extensions/coordinator.js
function fn(e) {
	return !!e && "mediaOverride" in e;
}
var pn = class {
	#e = /* @__PURE__ */ new Map();
	#t = /* @__PURE__ */ new WeakMap();
	#n = { initTime: Date.now() };
	#r;
	#i = null;
	constructor(e) {
		this.#r = e;
	}
	get size() {
		return this.#e.size;
	}
	get(e) {
		return this.#e.get(e);
	}
	register(e) {
		let t = e.constructor, n = this.#e.get(t);
		return n !== e && (n && this.#s(n), this.#e.set(t, e), e.connect?.(this.#n), this.#i && e.attach?.(this.#i), (fn(n) || fn(e)) && this.#r()), () => this.#o(e);
	}
	attach(e) {
		if (this.#i?.media === e.media) this.#i = e;
		else {
			this.detach(), this.#i = e;
			for (let t of this.#e.values()) t.attach?.(e);
		}
	}
	detach() {
		if (this.#i) {
			for (let e of this.#e.values()) e.detach?.();
			this.#i = null;
		}
	}
	destroy() {
		this.detach();
		for (let e of this.#e.values()) e.disconnect?.();
		this.#e.clear();
	}
	getStoreMedia(e) {
		if (!this.#a()) return e;
		let t = this.#t.get(e);
		return t || (t = un(e, () => this.#e.values()), this.#t.set(e, t)), t;
	}
	#a() {
		for (let e of this.#e.values()) if (fn(e)) return !0;
		return !1;
	}
	#o(e) {
		let t = e.constructor;
		this.#e.get(t) === e && (this.#e.delete(t), this.#s(e), fn(e) && this.#r());
	}
	#s(e) {
		this.#i && e.detach?.(), e.disconnect?.();
	}
};
// node_modules/@videojs/core/dist/default/dom/feature.js
function P(e) {
	let t = Object.values(e.config ?? {}).map((e) => e.state);
	return {
		...e,
		...t.length > 0 ? { preserve: t } : {}
	};
}
function mn(e) {
	let t = e.map((e) => e.config ?? {});
	return Object.assign({}, ...t);
}
function hn(e, t, n) {
	let r = e[t.action];
	if (typeof r != "function") throw TypeError(`Missing config action "${String(t.action)}"`);
	r(n);
}
// node_modules/@videojs/core/dist/default/dom/media-action-value.js
function gn(e, t, n) {
	if (!y(n)) return n;
	let r = t?.toLowerCase();
	if (e === "seekStep") return r === "arrowleft" || r === "j" ? -10 : 10;
	if (e === "volumeStep") return r === "arrowdown" ? -.05 : 5 / 100;
}
// node_modules/@videojs/core/dist/default/dom/store/features/audio-track.js
function _n(e, t) {
	return e.id || String(t);
}
function vn(e, t) {
	return {
		id: _n(e, t),
		...e.kind !== void 0 && { kind: e.kind },
		label: e.label,
		language: e.language,
		enabled: e.enabled
	};
}
var yn = P({
	name: "audioTrack",
	state: ({ target: e }) => ({
		audioTrackList: [],
		selectAudioTrack(t) {
			let { media: n } = e();
			if (!nn(n)) return;
			let r = [...n.audioTracks], i = r.find((e, n) => _n(e, n) === t);
			if (i) for (let e of r) e.enabled = e === i;
		}
	}),
	attach({ target: e, signal: t, set: n }) {
		let { media: r } = e, i = null, a = null, o = () => nn(r) ? r.audioTracks : null, s = (e = o()) => {
			n({ audioTrackList: e ? [...e].map(vn) : [] });
		}, c = () => {
			let e = o();
			e === i ? s(e) : (a?.abort(), a = new AbortController(), i = e, i && (k(i, "addtrack", () => s(i), { signal: a.signal }), k(i, "removetrack", () => s(i), { signal: a.signal }), k(i, "change", () => s(i), { signal: a.signal })), s(i));
		};
		c(), k(r, "loadstart", c, { signal: t }), t.addEventListener("abort", () => a?.abort(), { once: !0 });
	}
}), bn = P({
	name: "buffer",
	state: () => ({
		buffered: [],
		seekable: []
	}),
	attach({ target: e, signal: t, set: n }) {
		let { media: r } = e;
		if (!Qt(r)) return;
		let i = () => n({
			buffered: St(r.buffered),
			seekable: St(r.seekable)
		});
		i(), k(r, "loadedmetadata", i, { signal: t }), k(r, "durationchange", i, { signal: t }), k(r, "progress", i, { signal: t }), k(r, "emptied", i, { signal: t });
	}
}), xn = /* @__PURE__ */ new WeakMap();
function Sn(e) {
	xn.set(e, (xn.get(e) ?? 0) + 1);
	let t = !1;
	return () => {
		if (t) return;
		t = !0;
		let n = xn.get(e) ?? 0;
		n <= 1 ? xn.delete(e) : xn.set(e, n - 1);
	};
}
function Cn(e) {
	return (xn.get(e) ?? 0) > 0;
}
// node_modules/@videojs/core/dist/default/dom/gesture/coordinator.js
var wn = /* @__PURE__ */ new WeakMap();
function Tn(e) {
	return wn.get(e);
}
// node_modules/@videojs/core/dist/default/dom/presentation/remote-playback.js
function En(e) {
	let t = e;
	if (S(t.remote) && "state" in t.remote && "prompt" in t.remote) return t.remote;
}
function Dn(e) {
	return En(e)?.state === "connected";
}
function On(e) {
	return En(e)?.state === "connecting";
}
async function kn(e) {
	let t = En(e);
	if (!t) throw new DOMException("Remote playback not supported", "NotSupportedError");
	return t.prompt();
}
// node_modules/@videojs/core/dist/default/dom/store/features/controls.js
var An = 2e3, jn = 250, Mn = 500, Nn = 100, Pn = /* @__PURE__ */ new WeakMap(), Fn = P({
	name: "controls",
	state: ({ get: e, set: t }) => {
		let n = In(() => (t({ controlsVisible: !0 }), () => {}), (n) => {
			let r = n ?? !e().userActive;
			return t({
				userActive: r,
				controlsVisible: r
			}), r;
		});
		return Pn.set(n.requestControlsLock, n), {
			userActive: !0,
			controlsVisible: !0,
			requestControlsLock: n.requestControlsLock,
			toggleControls: n.toggleControls
		};
	},
	attach({ target: e, signal: t, get: n, set: r }) {
		let { media: i, container: a } = e;
		if (!Gt(i) || v(a)) return;
		let o, s = 0, c = (e) => s > 0 || e || i.paused || Dn(i) || On(i);
		function l() {
			clearTimeout(o), o = void 0;
		}
		function u() {
			l(), s > 0 || (o = setTimeout(f, An));
		}
		function d() {
			n().userActive || r({
				userActive: !0,
				controlsVisible: !0
			}), u();
		}
		function f() {
			l(), r({
				userActive: !1,
				controlsVisible: c(!1)
			});
		}
		function p() {
			s++, l(), n().controlsVisible || r({ controlsVisible: !0 });
			let e = !1;
			return () => {
				e || t.aborted || (e = !0, s--, s === 0 && d());
			};
		}
		function m(e) {
			return e ?? !n().controlsVisible ? d() : f(), n().controlsVisible;
		}
		let h = Pn.get(n().requestControlsLock);
		h.setDelegates(p, m);
		let g = 0, _ = 0, y = () => _ > 0 && Date.now() - _ < Mn, b = 0, x = () => b > 0 && Date.now() - b < Nn;
		function S(e) {
			g = Date.now(), e.pointerType === "touch" && (_ = g);
		}
		function C(e) {
			if (e.pointerType === "touch" && (_ = Date.now()), e.pointerType === "touch" && Date.now() - g < jn) {
				if (Tn(a)?.claimsTap(e, "toggleControls")) return;
				let t = [Rt(i), a].includes(e.target);
				n().controlsVisible && t ? f() : d();
			} else d();
		}
		let w = () => {
			let { userActive: e } = n();
			r({ controlsVisible: c(e) }), !i.paused && e && u();
		};
		function ee(e) {
			e.pointerType === "touch" ? n().userActive && u() : d();
		}
		if (k(a, "pointermove", ee, { signal: t }), k(a, "pointerdown", S, { signal: t }), k(a, "pointerup", C, { signal: t }), k(a, "lostpointercapture", () => {
			b = Date.now();
		}, { signal: t }), k(a, "keydown", d, { signal: t }), k(a, "keyup", d, { signal: t }), k(a, "focusin", () => {
			y() || d();
		}, { signal: t }), k(a, "mouseleave", (e) => {
			y() || x() && e instanceof MouseEvent && at(a, e) || f();
		}, { signal: t }), k(i, "play", w, { signal: t }), k(i, "pause", w, { signal: t }), k(i, "ended", w, { signal: t }), an(i)) {
			let e = () => {
				let { userActive: e } = n();
				r({ controlsVisible: c(e) });
			};
			k(i.remote, "connect", e, { signal: t }), k(i.remote, "connecting", e, { signal: t }), k(i.remote, "disconnect", e, { signal: t });
		}
		t.addEventListener("abort", () => {
			h.reset(), s = 0, l();
		}, { once: !0 }), u();
	}
});
function In(e, t) {
	let n = e, r = t, i = /* @__PURE__ */ new Set(), a = {
		requestControlsLock: () => {
			let e = { release: n() }, t = !1;
			return i.add(e), () => {
				t || (t = !0, i.delete(e), e.release());
			};
		},
		toggleControls: (e) => r(e),
		setDelegates(e, t) {
			if (e !== n) {
				n = e;
				for (let t of i) t.release(), t.release = e();
			}
			r = t;
		},
		reset() {
			a.setDelegates(e, t);
		}
	};
	return a;
}
// node_modules/@videojs/core/dist/default/dom/store/features/error.js
var Ln = P({
	name: "error",
	state: ({ set: e }) => ({
		error: null,
		dismissError() {
			e({ error: null });
		}
	}),
	attach({ target: e, signal: t, set: n }) {
		let { media: r } = e;
		$t(r) && (k(r, "error", () => n({ error: r.error }), { signal: t }), k(r, "emptied", () => n({ error: null }), { signal: t }));
	}
});
// node_modules/@videojs/core/dist/default/dom/presentation/fullscreen.js
function Rn() {
	let e = document;
	return e.fullscreenEnabled || e.webkitFullscreenEnabled ? !0 : _(document.createElement("video").webkitSetPresentationMode);
}
function zn() {
	let e = document;
	return e.fullscreenElement ?? e.webkitFullscreenElement ?? null;
}
function Bn(e) {
	if (!(e instanceof Element)) return !1;
	try {
		return e.matches(":fullscreen");
	} catch {
		return !1;
	}
}
function Vn(e, t) {
	if (t.webkitPresentationMode === "fullscreen") return !0;
	let n = zn();
	return n && (n === e || n === Rt(t)) || Bn(e) || Bn(t) ? !0 : t.isFullscreen ?? !1;
}
async function Hn(e, t) {
	let n = document;
	if (e && (n.fullscreenEnabled || n.webkitFullscreenEnabled)) {
		let t = e;
		if (ht(e), _(t.requestFullscreen)) return t.requestFullscreen();
		if (_(t.webkitRequestFullscreen)) return t.webkitRequestFullscreen();
	}
	let r = t;
	if (_(r.webkitSetPresentationMode)) {
		r.webkitSetPresentationMode("fullscreen");
		return;
	}
	let i = t;
	if (_(i.requestFullscreen)) return i.requestFullscreen();
}
async function Un(e) {
	let t = document, n = e;
	if (n.webkitPresentationMode === "fullscreen" && _(n.webkitSetPresentationMode)) {
		n.webkitSetPresentationMode("inline");
		return;
	}
	if (_(t.exitFullscreen)) return t.exitFullscreen();
	if (_(t.webkitExitFullscreen)) return t.webkitExitFullscreen();
	let r = e;
	if (_(r.exitFullscreen)) return r.exitFullscreen();
}
// node_modules/@videojs/core/dist/default/dom/presentation/pip.js
function Wn() {
	if (document.pictureInPictureEnabled) {
		let e = /.*Version\/.*Safari\/.*/.test(navigator.userAgent), t = typeof matchMedia == "function" && matchMedia("(display-mode: standalone)").matches;
		return !e || !t;
	}
	return _(document.createElement("video").webkitSetPresentationMode);
}
function Gn(e) {
	return _(e.webkitSetPresentationMode) ? !0 : Zt(e);
}
function Kn(e) {
	return e.webkitPresentationMode === "picture-in-picture" || document.pictureInPictureElement === Rt(e) ? !0 : e.isPictureInPicture ?? !1;
}
async function qn(e) {
	let t = e;
	if (_(t.webkitSetPresentationMode)) {
		t.webkitSetPresentationMode("picture-in-picture");
		return;
	}
	let n = e;
	if (_(n.requestPictureInPicture)) return n.requestPictureInPicture();
}
async function Jn(e) {
	let t = e;
	if (t.webkitPresentationMode === "picture-in-picture" && _(t.webkitSetPresentationMode)) {
		t.webkitSetPresentationMode("inline");
		return;
	}
	if (_(document.exitPictureInPicture)) return document.exitPictureInPicture();
	let n = e;
	if (_(n.exitPictureInPicture)) return n.exitPictureInPicture();
}
// node_modules/@videojs/core/dist/default/dom/store/features/fullscreen.js
var Yn = P({
	name: "fullscreen",
	state: ({ target: e }) => ({
		isFullscreen: !1,
		fullscreenAvailability: "unavailable",
		async requestFullscreen() {
			let { media: t, container: n } = e();
			return Kn(t) && await Jn(t), Hn(n, t);
		},
		async exitFullscreen() {
			let { media: t } = e();
			return Un(t);
		}
	}),
	attach({ target: e, signal: t, set: n }) {
		let { media: r, container: i } = e;
		n({ fullscreenAvailability: Rn() ? "available" : "unsupported" });
		let a = () => n({ isFullscreen: Vn(i, r) });
		a(), k(document, "fullscreenchange", a, { signal: t }), k(document, "webkitfullscreenchange", a, { signal: t }), "webkitPresentationMode" in r && k(r, "webkitpresentationmodechanged", a, { signal: t });
	}
}), Xn = P({
	name: "live",
	state: () => ({
		liveEdgeStart: NaN,
		targetLiveWindow: NaN
	}),
	attach({ target: e, signal: t, set: n }) {
		let { media: r } = e;
		if (!cn(r)) return;
		let i = () => n({
			liveEdgeStart: r.liveEdgeStart,
			targetLiveWindow: r.targetLiveWindow
		});
		i(), k(r, "targetlivewindowchange", i, { signal: t }), k(r, "streamtypechange", i, { signal: t }), k(r, "loadedmetadata", i, { signal: t }), k(r, "canplay", i, { signal: t }), k(r, "progress", i, { signal: t }), k(r, "durationchange", i, { signal: t }), k(r, "timeupdate", i, { signal: t }), k(r, "emptied", i, { signal: t });
	}
}), Zn = Symbol("@videojs/media-title"), Qn = Symbol("@videojs/user-title"), $n = Symbol("@videojs/set-user-title"), er = "", tr = Symbol("@videojs/media-poster"), nr = Symbol("@videojs/user-poster"), rr = Symbol("@videojs/set-user-poster"), ir = "", ar = P({
	name: "metadata",
	config: {
		title: {
			action: $n,
			state: Qn,
			html: { attribute: "content-title" }
		},
		poster: {
			action: rr,
			state: nr
		}
	},
	state: ({ set: e }) => ({
		[Zn]: void 0,
		[Qn]: void 0,
		[$n]: (t) => e({ [Qn]: t }),
		[tr]: void 0,
		[nr]: void 0,
		[rr]: (t) => e({ [nr]: t })
	}),
	derived: {
		title: ({ get: e }) => e()[Qn] ?? e()[Zn] ?? er,
		poster: ({ get: e }) => e()[nr] ?? e()[tr] ?? ir
	},
	attach({ target: e, signal: t, set: n }) {
		let { media: r } = e, i = () => {
			let e = sn(r) ? r.contentData : void 0;
			n({
				[Zn]: e?.title,
				[tr]: e?.poster
			});
		}, a = () => {
			i(), sn(r) && k(r, "contentdatachange", i, { signal: t });
		};
		a(), k(r, "loadstart", a, { signal: t });
	}
}), or = P({
	name: "pip",
	state: ({ target: e }) => ({
		isPictureInPicture: !1,
		pictureInPictureAvailability: "unavailable",
		async requestPictureInPicture() {
			let { media: t, container: n } = e();
			if (Gn(t)) {
				if (!qt(t) || !Ht(t)) throw new DOMException("The media has no video data yet.", "InvalidStateError");
				return Vn(n, t) && await Un(t), qn(t);
			}
		},
		async exitPictureInPicture() {
			let { media: t } = e();
			return Jn(t);
		}
	}),
	attach({ target: e, signal: t, set: n }) {
		let { media: r } = e, i = Wn() && Gn(r), a = () => n({
			isPictureInPicture: Kn(r),
			pictureInPictureAvailability: i ? qt(r) && Ht(r) ? "available" : "unavailable" : "unsupported"
		});
		a(), k(r, "enterpictureinpicture", a, { signal: t }), k(r, "leavepictureinpicture", a, { signal: t }), k(r, "loadstart", a, { signal: t }), k(r, "loadedmetadata", a, { signal: t }), k(r, "emptied", a, { signal: t }), "webkitPresentationMode" in r && k(r, "webkitpresentationmodechanged", a, { signal: t });
	}
}), sr = P({
	name: "playback",
	state: ({ target: e, set: t }) => ({
		paused: !0,
		ended: !1,
		started: !1,
		waiting: !1,
		autoplay: !1,
		autoplaying: !1,
		play() {
			let { media: n } = e(), r = n.play();
			return Gt(n) && !n.paused && t({
				paused: !1,
				ended: !1,
				started: !0
			}), r;
		},
		pause() {
			let { media: n } = e();
			Gt(n) && (n.pause(), t({
				paused: n.paused,
				autoplaying: !1
			}));
		}
	}),
	attach({ target: e, signal: t, get: n, set: r }) {
		let { media: i } = e;
		if (!Gt(i) || !Kt(i) || !qt(i)) return;
		let a = () => Wt(i) && i.autoplay, o, s = () => {
			o !== void 0 && cancelAnimationFrame(o), o = void 0;
		}, c = () => {
			s();
			let e = a() && !!(i.currentSrc || i.src) && i.paused && !i.ended && i.currentTime === 0 && i.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA;
			r({
				autoplay: a(),
				autoplaying: e
			});
		}, l = () => {
			n().autoplaying && r({ autoplaying: !1 });
		}, u = () => {
			n().autoplaying && (s(), o = requestAnimationFrame(() => {
				o = requestAnimationFrame(() => {
					o = void 0, i.paused && l();
				});
			}));
		};
		t.addEventListener("abort", s);
		let d = null, f = () => {
			let e = i.readyState < HTMLMediaElement.HAVE_FUTURE_DATA && !i.paused;
			e ? d ??= i.currentTime : d = null;
			let t = !i.paused || i.currentTime > 0;
			r({
				paused: i.paused,
				ended: i.ended,
				started: t,
				waiting: e && d === i.currentTime,
				autoplay: a(),
				autoplaying: n().autoplaying && !t && !i.ended
			});
		}, p = () => {
			d = i.currentTime, f();
		};
		c(), f(), k(i, "emptied", c, { signal: t }), k(i, "loadstart", c, { signal: t }), k(i, "canplaythrough", u, { signal: t }), k(i, "pause", l, { signal: t }), k(i, "error", l, { signal: t }), k(i, "emptied", p, { signal: t }), k(i, "play", p, { signal: t }), k(i, "pause", f, { signal: t }), k(i, "ended", f, { signal: t }), k(i, "playing", f, { signal: t }), k(i, "waiting", p, { signal: t }), k(i, "seeking", p, { signal: t }), k(i, "seeked", f, { signal: t }), k(i, "canplay", f, { signal: t }), k(i, "timeupdate", f, { signal: t });
	}
}), cr = {
	min: .0625,
	max: 16
};
function lr(e) {
	return e?.playbackRateRange ?? cr;
}
function ur(e) {
	let t = m(e) ? e.trim().split(/\s+/).map(Number) : e ?? [], n = [...new Set(t.filter((e) => Number.isFinite(e) && e > 0))];
	return n.length > 0 ? n : void 0;
}
function dr(e, { min: t, max: n }) {
	return e.filter((e) => e >= t && e <= n);
}
function fr(e) {
	return Math.round(e * 1e5) / 1e5;
}
// node_modules/@videojs/utils/dist/number/number.js
function pr(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
// node_modules/@videojs/core/dist/default/dom/store/features/playback-rate.js
var mr = [
	.5,
	.75,
	1,
	1.25,
	1.5,
	1.75,
	2
], hr = Symbol("@videojs/default-playback-rates"), gr = Symbol("@videojs/set-default-playback-rates"), _r = Symbol("@videojs/playback-rate-range");
function vr(e, t) {
	let n = dr(e, t);
	if (n.length > 0) return n;
	let r = dr(mr, t);
	return r.length > 0 ? r : [pr(1, t.min, t.max)];
}
var yr = P({
	name: "playbackRate",
	config: { defaultPlaybackRates: {
		action: gr,
		state: hr
	} },
	state: ({ target: e, get: t, set: n }) => ({
		[hr]: mr,
		[gr]: (e) => {
			let t = ur(e) ?? mr;
			n({ [hr]: t });
		},
		[_r]: cr,
		playbackRate: 1,
		playbackRateAvailability: "unavailable",
		setPlaybackRate(t) {
			let { media: n } = e();
			if (!Xt(n)) return;
			let { min: r, max: i } = lr(n);
			n.playbackRate = pr(t, r, i);
		}
	}),
	derived: { playbackRates: ({ get: e }) => vr(e()[hr], e()[_r]) },
	attach({ target: e, signal: t, get: n, set: r }) {
		let { media: i } = e, a = () => {
			let e = lr(i), t = n()[_r];
			(e.min !== t.min || e.max !== t.max) && r({ [_r]: e });
		};
		if (a(), k(i, "loadstart", a, { signal: t }), !Xt(i)) {
			r({
				playbackRate: 1,
				playbackRateAvailability: "unsupported"
			});
			return;
		}
		let o = () => r({ playbackRate: fr(i.playbackRate) });
		r({ playbackRateAvailability: "available" }), o(), k(i, "ratechange", o, { signal: t });
	}
}), br = "auto";
function xr(e, t) {
	return e.id || String(t);
}
function Sr(e, t) {
	return {
		id: xr(e, t),
		...e.width !== void 0 && { width: e.width },
		...e.height !== void 0 && { height: e.height },
		...e.bitrate !== void 0 && { bitrate: e.bitrate },
		...e.frameRate !== void 0 && { frameRate: e.frameRate },
		...e.codec !== void 0 && { codec: e.codec },
		selected: e.selected
	};
}
function Cr(e) {
	return e.width && e.height ? Math.min(e.width, e.height) : e.height ?? e.width;
}
var wr = P({
	name: "quality",
	state: ({ target: e }) => ({
		videoRenditionList: [],
		activeVideoRendition: null,
		selectVideoRendition(t) {
			let { media: n } = e();
			if (!tn(n)) return;
			if (t === br) {
				n.videoRenditions.selectedIndex = -1;
				return;
			}
			let r = [...n.videoRenditions].findIndex((e, n) => xr(e, n) === t);
			r !== -1 && (n.videoRenditions.selectedIndex = r);
		}
	}),
	attach({ target: e, signal: t, set: n }) {
		let { media: r } = e, i = null, a = null, o = () => tn(r) ? r.videoRenditions : null, s = (e) => {
			if (!e) return null;
			let t = [...e], n = t.find((e) => e.active);
			if (n) return n;
			if (!rn(r) || !r.videoWidth && !r.videoHeight) return null;
			let i = Cr({
				width: r.videoWidth || void 0,
				height: r.videoHeight || void 0
			}), a = t.filter((e) => Cr(e) === i);
			return a.length === 1 ? a[0] : null;
		}, c = (e = o()) => {
			let t = e ? [...e] : [], r = s(e);
			n({
				videoRenditionList: t.map(Sr),
				activeVideoRendition: r ? Sr(r, t.indexOf(r)) : null
			});
		}, l = () => {
			let e = o();
			e === i ? c(e) : (a?.abort(), a = new AbortController(), i = e, i && (k(i, "addrendition", () => c(i), { signal: a.signal }), k(i, "removerendition", () => c(i), { signal: a.signal }), k(i, "change", () => c(i), { signal: a.signal }), k(i, "activechange", () => c(i), { signal: a.signal })), c(i));
		};
		l(), k(r, "loadstart", l, { signal: t }), k(r, "resize", () => c(i), { signal: t }), t.addEventListener("abort", () => a?.abort(), { once: !0 });
	}
}), Tr = P({
	name: "remotePlayback",
	state: ({ target: e }) => ({
		remotePlaybackState: "disconnected",
		remotePlaybackAvailability: "unsupported",
		async promptRemotePlayback() {
			let { media: t, container: n } = e();
			return Dn(t) ? kn(t) : (Vn(n, t) && await Un(t), await kn(t));
		}
	}),
	attach({ target: e, signal: t, set: n }) {
		let { media: r } = e;
		if (!an(r)) return;
		if (wt(r)) {
			let e = () => {
				n({ remotePlaybackState: r.webkitCurrentPlaybackTargetIsWireless ? "connected" : "disconnected" });
			};
			k(r, "webkitplaybacktargetavailabilitychanged", (e) => {
				let { availability: t } = e;
				n({ remotePlaybackAvailability: t === "available" ? "available" : "unavailable" });
			}, { signal: t }), k(r, "webkitcurrentplaybacktargetiswirelesschanged", e, { signal: t }), e();
			return;
		}
		let i = () => n({ remotePlaybackState: r.remote.state });
		i(), k(r.remote, "connect", i, { signal: t }), k(r.remote, "connecting", i, { signal: t }), k(r.remote, "disconnect", i, { signal: t }), r.remote.watchAvailability((e) => {
			n({ remotePlaybackAvailability: e ? "available" : "unavailable" });
		}).catch(() => {
			n({ remotePlaybackAvailability: "unsupported" });
		}), t.addEventListener("abort", () => {
			r.remote?.cancelWatchAvailability?.()?.catch(E);
		});
	}
}), Er = P({
	name: "source",
	state: () => ({
		currentSrc: "",
		canPlay: !1
	}),
	attach({ target: e, signal: t, set: n }) {
		let { media: r } = e;
		if (!qt(r)) return;
		let i = () => n({
			currentSrc: r.currentSrc,
			canPlay: r.readyState >= Bt.HAVE_FUTURE_DATA
		});
		i(), k(r, "canplay", i, { signal: t }), k(r, "canplaythrough", i, { signal: t }), k(r, "loadstart", i, { signal: t }), k(r, "emptied", i, { signal: t });
	}
}), Dr = P({
	name: "streamType",
	state: () => ({ streamType: Vt.UNKNOWN }),
	attach({ target: e, signal: t, set: n }) {
		let { media: r } = e;
		if (on(r)) {
			let e = () => n({ streamType: r.streamType });
			e(), k(r, "streamtypechange", e, { signal: t });
			return;
		}
		if (!Kt(r)) return;
		let i = () => {
			let { duration: e } = r;
			return e === Infinity ? Vt.LIVE : Number.isFinite(e) && e > 0 ? Vt.ON_DEMAND : Vt.UNKNOWN;
		}, a = () => n({ streamType: i() });
		a(), k(r, "durationchange", a, { signal: t }), k(r, "loadedmetadata", a, { signal: t }), k(r, "emptied", a, { signal: t }), Qt(r) && k(r, "progress", a, { signal: t });
	}
}), Or = Symbol.for("@videojs/i18n-registry");
function kr() {
	let e = globalThis, t = e[Or];
	if (t) return t;
	let n = {
		layers: /* @__PURE__ */ new Map(),
		subscribers: /* @__PURE__ */ new Set()
	};
	return e[Or] = n, n;
}
function Ar(e) {
	return e.trim().replaceAll("_", "-").toLowerCase();
}
function jr(e) {
	let t = e.indexOf("-x-"), n = (t === -1 ? e : e.slice(0, t)).indexOf("-u-");
	return n === -1 ? e : e.slice(0, n) + (t === -1 ? "" : e.slice(t));
}
function Mr(e) {
	if (e[0] !== "zh") return;
	let t = e.find((e) => e === "hant" || e === "hans");
	return t === "hant" ? "zh-tw" : t === "hans" ? "zh-cn" : void 0;
}
function Nr(e) {
	return jr(Ar(e));
}
function Pr(e) {
	let t = Nr(e);
	if (!t) return ["en"];
	let n = t.split("-").filter(Boolean), r = [];
	for (let e = n.length; e >= 1; e--) r.push(n.slice(0, e).join("-"));
	let i = Mr(n), a = r.indexOf("zh");
	i && a !== -1 && r.splice(a, 0, i);
	let o = [], s = /* @__PURE__ */ new Set();
	for (let e of r) s.has(e) || (s.add(e), o.push(e));
	return s.has("en") || o.push("en"), o;
}
function Fr(e) {
	let { layers: t } = kr(), n = {};
	for (let r = e.length - 1; r >= 0; r--) {
		let i = e[r], a = t.get(i);
		a && Object.assign(n, a);
	}
	return n;
}
function Ir(e) {
	return Fr(Pr(e));
}
function Lr(e) {
	let { subscribers: t } = kr();
	return t.add(e), () => {
		t.delete(e);
	};
}
// node_modules/@videojs/core/dist/default/core/i18n/resolve-text.js
function Rr(e) {
	return typeof e == "string" ? e : e.text;
}
// node_modules/@videojs/core/dist/default/core/i18n/text.js
function zr(e) {
	return S(e) && "key" in e && "text" in e;
}
// node_modules/@videojs/core/dist/default/core/i18n/utils/interpolate.js
var Br = /\{([^{}]+)\}/g;
function Vr(e, t) {
	return t ? e.replace(Br, (e, n) => Object.hasOwn(t, n) ? String(t[n]) : e) : e;
}
// node_modules/@videojs/core/dist/default/core/i18n/translate-text.js
function F(e, t, n) {
	return typeof e == "string" ? e : typeof t == "function" ? t(e, n) : Vr(Rr(e), t ?? n);
}
// node_modules/@videojs/core/dist/default/core/i18n/translator.js
function Hr(e, t) {
	return (t, n) => {
		let r = n, i = typeof t != "string", a = i ? t.key : t, o = e[a], s = r?.default, c = r ? { ...r } : void 0;
		return c && delete c.default, Vr(o ?? (i ? t.text : s) ?? String(a), c);
	};
}
// node_modules/@videojs/core/dist/default/dom/store/text-cues.js
function Ur(e, t) {
	if (!e) return [];
	let n = Number.isFinite(t) && t > 0 ? t : Infinity;
	return Array.from(e, (e) => ({
		startTime: e.startTime,
		endTime: Math.min(e.endTime, n),
		text: e.text ?? ""
	}));
}
// node_modules/@videojs/core/dist/default/dom/store/features/text-track.js
function Wr(e, t) {
	return e.id || `track:${t}:${e.kind}:${e.language}:${e.label}`;
}
function Gr(e) {
	return yt(Array.from(e.textTracks, (e, t) => ({
		id: Wr(e, t),
		kind: e.kind,
		track: e
	})));
}
function Kr(e, t) {
	for (let { track: n } of e) {
		let e = n === t ? "showing" : "disabled";
		n.mode !== e && (n.mode = e);
	}
}
function qr(e, t) {
	let n = Nr(t), r = Pr(t);
	n !== "en" && !n.startsWith("en-") && r.pop();
	for (let t of r) {
		let n = e.find(({ track: e }) => Nr(e.language) === t);
		if (n) return n;
		let r = e.find(({ track: e }) => Nr(e.language).startsWith(`${t}-`));
		if (r) return r;
	}
}
var Jr = P({
	name: "textTrack",
	state: ({ target: e }) => {
		let t = null;
		return {
			textTrackList: [],
			subtitlesShowing: !1,
			toggleSubtitles(n) {
				let { media: r } = e();
				if (!en(r)) return !1;
				let i = Gr(r);
				if (!i.length) return !1;
				let a = i.find(({ track: e }) => e.mode === "showing"), o = n ?? !a;
				if (a && (t = a.id), !o) return Kr(i, null), !1;
				let s = a ?? i.find(({ id: e }) => e === t) ?? qr(i, globalThis.navigator?.language ?? "") ?? i[0];
				return t = s.id, Kr(i, s.track), !0;
			},
			selectSubtitlesTrack(n) {
				let { media: r } = e();
				if (!en(r)) return;
				let i = Gr(r);
				if (!i.length) return;
				if (v(n)) {
					let e = i.find(({ track: e }) => e.mode === "showing");
					e && (t = e.id), Kr(i, null);
					return;
				}
				let a = i.find((e) => e.id === n);
				a && (t = a.id, Kr(i, a.track));
			},
			chaptersCues: [],
			thumbnailsTrack: null
		};
	},
	attach({ target: e, signal: t, set: n }) {
		let { media: r } = e;
		if (!en(r)) return;
		let i = null, a = () => {
			i?.abort(), i = new AbortController();
			let e = null, t = null, o = [], s = !1;
			for (let n = 0; n < r.textTracks.length; n++) {
				let i = r.textTracks[n];
				!e && i.kind === "chapters" && (e = i), !t && i.kind === "metadata" && i.label === "thumbnails" && (t = i), o.push({
					id: Wr(i, n),
					kind: i.kind,
					label: i.label,
					language: i.language,
					mode: i.mode
				}), vt(i) && i.mode === "showing" && (s = !0);
			}
			let c = Ur(e?.cues, Kt(r) ? r.duration : NaN), l = null;
			t && (l = {
				cues: t.cues ? Array.from(t.cues) : [],
				src: bt(r, t)?.src ?? null,
				crossOrigin: qt(r) ? zt(r.crossOrigin) : null
			});
			let u = ln(r) && r.querySelectorAll("track") || [], d = r instanceof HTMLElement && r.shadowRoot?.querySelectorAll("track") || [];
			for (let e of [...u, ...d]) e.track?.cues?.length || k(e, "load", a, { signal: i.signal });
			n({
				textTrackList: o,
				subtitlesShowing: s,
				chaptersCues: c,
				thumbnailsTrack: l
			});
		};
		a();
		let o = r.textTracks;
		o instanceof EventTarget && (k(o, "addtrack", a, { signal: t }), k(o, "removetrack", a, { signal: t }), k(o, "change", a, { signal: t })), k(r, "loadstart", a, { signal: t }), k(r, "durationchange", a, { signal: t }), t.addEventListener("abort", () => i?.abort(), { once: !0 });
	}
}), Yr = { seek: Symbol.for("@videojs/seek") }, Xr = P({
	name: "time",
	state: ({ target: e, signals: t, set: n }) => ({
		currentTime: 0,
		duration: 0,
		seeking: !1,
		async seek(r) {
			let { media: i } = e(), a = t.supersede(Yr.seek);
			if (!Kt(i) || !qt(i)) return 0;
			if (k(i, "emptied", () => t.supersede(Yr.seek), {
				signal: a,
				once: !0
			}), !Ht(i) && !await Ae(i, "loadedmetadata", { signal: a }).catch(() => !1)) return i.currentTime;
			let o = Math.max(0, Math.min(r, i.duration || Infinity));
			return n({
				currentTime: o,
				seeking: !0
			}), i.currentTime = o, await Ae(i, "seeked", { signal: a }).catch(E), i.currentTime;
		}
	}),
	attach({ target: e, signal: t, set: n, get: r }) {
		let { media: i } = e;
		if (!Kt(i)) return;
		let a = () => {
			let { duration: e } = i;
			if (e === Infinity && Qt(i)) {
				let { seekable: e } = i;
				return e.length > 0 ? e.end(e.length - 1) : 0;
			}
			return Number.isFinite(e) ? e : 0;
		}, o = () => n({
			currentTime: i.currentTime,
			duration: a(),
			seeking: i.seeking
		}), s = () => {
			r().seeking || o();
		}, c, l = () => {
			c?.(), c = void 0;
		}, u = () => {
			if (!Gt(i) || i.paused || i.ended) {
				l();
				return;
			}
			let e = r(), t = i.currentTime;
			!e.seeking && t !== e.currentTime && n({ currentTime: t }), c = Te(u);
		}, d = () => {
			!c && Gt(i) && !i.paused && !i.ended && (c = Te(u));
		}, f = () => {
			l(), s();
		};
		o(), d(), t.addEventListener("abort", l, { once: !0 }), k(i, "play", d, { signal: t }), k(i, "playing", d, { signal: t }), k(i, "pause", f, { signal: t }), k(i, "ended", f, { signal: t }), k(i, "timeupdate", () => {
			(!c || document.hidden) && s();
		}, { signal: t }), k(i, "durationchange", o, { signal: t }), k(i, "seeking", o, { signal: t }), k(i, "seeked", o, { signal: t }), k(i, "loadedmetadata", o, { signal: t }), k(i, "emptied", () => {
			l(), o();
		}, { signal: t }), k(i, "progress", s, { signal: t });
	}
}), Zr = .25, Qr = P({
	name: "volume",
	state: ({ target: e, get: t, set: n }) => {
		let r = () => t().volumeAvailability === "unsupported";
		return {
			volume: 1,
			muted: !1,
			volumeAvailability: "unavailable",
			mutedAvailability: "unavailable",
			setVolume(t) {
				let { media: i } = e();
				if (!Jt(i)) return 0;
				let a = Math.max(0, Math.min(1, t));
				return a > 0 && i.muted && (i.muted = !1), r() || (i.volume = a), n({
					volume: i.volume,
					muted: i.muted
				}), i.volume;
			},
			setMuted(t) {
				let { media: i } = e();
				if (!Yt(i)) return !1;
				i.muted = t;
				let a = Jt(i);
				return !t && a && !r() && i.volume === 0 && (i.volume = Zr), n({
					volume: a ? i.volume : 1,
					muted: i.muted
				}), i.muted;
			}
		};
	},
	attach({ target: e, signal: t, set: n }) {
		let { media: r } = e, i = Jt(r), a = Yt(r);
		if (!i && !a) return;
		n({
			volumeAvailability: i ? $r() : "unavailable",
			mutedAvailability: a ? "available" : "unavailable"
		});
		let o = () => n({
			volume: i ? r.volume : 1,
			muted: a ? r.muted : !1
		});
		o(), k(r, "volumechange", o, { signal: t });
	}
});
function $r() {
	let e = document.createElement("video");
	try {
		return e.volume = .5, e.volume === .5 ? "available" : "unsupported";
	} catch {
		return "unsupported";
	}
}
// node_modules/@videojs/store/dist/default/core/combine.js
function ei(...e) {
	let t = e.map((e) => e.derived ?? {});
	return {
		state: (t) => {
			let n = e.map((e) => e.state(t));
			return Object.assign({}, ...n);
		},
		preserve: Array.from(new Set(e.flatMap((e) => e.preserve ?? []))),
		derived: Object.assign({}, ...t),
		attach: (t) => {
			for (let n of e) try {
				n.attach?.(t);
			} catch (e) {
				t.reportError(e);
			}
		}
	};
}
// node_modules/@videojs/store/dist/default/core/selector.js
var ti = {
	target: ce,
	signals: new oe(),
	get: ce,
	set: ce
};
function I(e) {
	let t = e.state(ti), n = [...Object.keys(t), ...Object.keys(e.derived ?? {})], r = n[0];
	return Object.assign(r ? (e) => {
		if (r in e) return te(e, n);
	} : () => void 0, { displayName: e.name });
}
I(yn);
var ni = I(bn), ri = I(Fn), ii = I(Ln), ai = I(Yn);
I(Xn);
var oi = I(ar), si = I(or), ci = I(sr), li = I(yr);
I(wr), I(Tr), I(Er), I(Dr);
var ui = I(Jr), di = I(Xr), L = I(Qr);
// node_modules/@videojs/core/dist/default/dom/media-actions.js
function fi(e) {
	x(e) && e.catch(E);
}
var R = {
	togglePaused({ store: e, state: t = e.state }) {
		let n = ci(t);
		n && fi(n.paused && !n.autoplaying ? n.play() : n.pause());
	},
	toggleMuted({ store: e }) {
		let t = L(e.state);
		t && t.setMuted(!(t.muted || t.volume === 0));
	},
	toggleFullscreen({ store: e }) {
		let t = ai(e.state);
		t && fi(t.isFullscreen ? t.exitFullscreen() : t.requestFullscreen());
	},
	togglePictureInPicture({ store: e }) {
		let t = si(e.state);
		t && fi(t.isPictureInPicture ? t.exitPictureInPicture() : t.requestPictureInPicture());
	},
	seekStep({ store: e, value: t, key: n }) {
		let r = gn("seekStep", n, t), i = di(e.state);
		i && i.seek(i.currentTime + r);
	},
	volumeStep({ store: e, value: t, key: n }) {
		let r = gn("volumeStep", n, t), i = L(e.state);
		i && i.setVolume(i.volume + r);
	},
	speedUp({ store: e, value: t }) {
		let n = li(e.state);
		if (!n) return;
		if (!y(t)) {
			n.setPlaybackRate(fr(n.playbackRate + t));
			return;
		}
		let { playbackRates: r, playbackRate: i } = n, a = r.filter((e) => e > i);
		a.length !== 0 && n.setPlaybackRate(Math.min(...a));
	},
	speedDown({ store: e, value: t }) {
		let n = li(e.state);
		if (!n) return;
		if (!y(t)) {
			n.setPlaybackRate(fr(n.playbackRate - t));
			return;
		}
		let { playbackRates: r, playbackRate: i } = n, a = r.filter((e) => e < i);
		a.length !== 0 && n.setPlaybackRate(Math.max(...a));
	}
};
// node_modules/@videojs/core/dist/default/dom/hotkey/actions.js
function pi(e) {
	return e.startsWith("toggle");
}
var mi = {
	togglePaused: R.togglePaused,
	toggleMuted: R.toggleMuted,
	toggleFullscreen: R.toggleFullscreen,
	toggleSubtitles({ store: e }) {
		ui(e.state)?.toggleSubtitles();
	},
	togglePictureInPicture: R.togglePictureInPicture,
	seekStep: R.seekStep,
	volumeStep: R.volumeStep,
	speedUp: R.speedUp,
	speedDown: R.speedDown,
	seekToPercent({ store: e, value: t, key: n }) {
		let r = di(e.state);
		if (!r) return;
		let i = ni(e.state), a = Ut({
			duration: r.duration,
			seekable: i?.seekable ?? []
		});
		if (a <= 0) return;
		let o;
		if (!y(t)) o = t;
		else if (n >= "0" && n <= "9") o = Number(n) * 10;
		else return;
		r.seek(o / 100 * a);
	}
};
function hi(e) {
	return mi[e];
}
// node_modules/@videojs/core/dist/default/dom/hotkey/aria.js
var gi = {
	shift: "Shift",
	ctrl: "Control",
	alt: "Alt",
	meta: "Meta"
}, _i = {
	shift: "Shift",
	ctrl: "Ctrl",
	alt: "Alt",
	meta: "Meta"
}, vi = [
	"ctrl",
	"shift",
	"alt",
	"meta"
];
function yi(e) {
	return e.map((e) => {
		let t = [];
		for (let n of vi) e.modifiers.has(n) && t.push(gi[n]);
		return t.push(e.originalKey), t.join("+");
	}).join(" ");
}
function bi(e) {
	let t = [];
	for (let n of vi) e.modifiers.has(n) && t.push(_i[n]);
	return t.push(xi(e.originalKey)), t.join("+");
}
function xi(e) {
	return e.length === 1 ? e.toUpperCase() : e;
}
// node_modules/@videojs/core/dist/default/dom/hotkey/coordinator.js
var Si = class {
	#e;
	#t = [];
	#n = 0;
	#r = null;
	#i = null;
	#a = /* @__PURE__ */ new Set();
	#o = /* @__PURE__ */ new Set();
	#s = !1;
	constructor(e) {
		this.#e = e;
	}
	subscribe(e) {
		return this.#a.add(e), () => this.#a.delete(e);
	}
	subscribeShortcutChanges(e) {
		return this.#o.add(e), () => this.#o.delete(e);
	}
	add(e) {
		let t = {
			parsed: wi(e.keys),
			options: e,
			id: this.#n++
		};
		this.#t.push(t), this.#c(), e.target === "document" ? this.#u() : this.#l(), this.#h();
		let n = !1;
		return () => {
			if (n) return;
			n = !0;
			let e = this.#t.indexOf(t);
			e !== -1 && this.#t.splice(e, 1), this.#d(), this.#h();
		};
	}
	getAriaKeys(e) {
		return this.getShortcut(e).aria;
	}
	getShortcut(e, t) {
		let n = this.#p(e, t);
		if (!n.length) return {};
		let r = n.flatMap((e) => e.parsed), i = n[n.length - 1];
		return {
			aria: yi(r),
			shortcut: this.#m(i)
		};
	}
	destroy() {
		this.#s || (this.#s = !0, this.#r?.abort(), this.#r = null, this.#i?.abort(), this.#i = null, this.#t = [], this.#h(), this.#a.clear(), this.#o.clear());
	}
	#c() {
		this.#t.sort((e, t) => {
			let n = t.parsed[0].modifiers.size - e.parsed[0].modifiers.size;
			return n === 0 ? e.id - t.id : n;
		});
	}
	#l() {
		this.#r || (this.#r = new AbortController(), k(this.#e, "keydown", this.#f, { signal: this.#r.signal }));
	}
	#u() {
		this.#i || (this.#i = new AbortController(), k(document, "keydown", this.#f, { signal: this.#i.signal }));
	}
	#d() {
		let e = this.#t.some((e) => e.options.target !== "document"), t = this.#t.some((e) => e.options.target === "document");
		e || (this.#r?.abort(), this.#r = null), t || (this.#i?.abort(), this.#i = null);
	}
	#f = (e) => {
		if (Cn(this.#e) || e.key === "Unidentified" || Ke(e) || e.defaultPrevented) return;
		let t = Ue(e);
		for (let n of this.#t) {
			let { options: r, parsed: i } = n;
			if (!r.disabled && !(e.repeat && r.repeatable === !1) && r.target === "document" == (e.currentTarget === document)) {
				for (let n of i) if (Ei(n, e) && !(t && n.modifiers.size === 0)) {
					if (this.#a.size > 0) {
						let t = {
							source: "hotkey",
							action: r.action,
							value: r.value,
							event: e
						};
						for (let e of this.#a) try {
							e(t);
						} catch {}
					}
					e.preventDefault(), r.onActivate(e, n.originalKey);
					return;
				}
			}
		}
	};
	#p(e, t) {
		return this.#t.filter((n) => n.options.disabled || n.options.action !== e ? !1 : y(t) ? !0 : n.options.value === t).sort((e, t) => e.id - t.id);
	}
	#m(e) {
		return e.options.keys === "0-9" ? e.options.keys : bi(e.parsed[0]);
	}
	#h() {
		for (let e of this.#o) e();
	}
}, Ci = /* @__PURE__ */ new Set([
	"shift",
	"ctrl",
	"alt",
	"meta"
]);
function wi(e) {
	if (e === "0-9") return Array.from({ length: 10 }, (e, t) => ({
		modifiers: /* @__PURE__ */ new Set(),
		key: String(t),
		originalKey: String(t)
	}));
	let t = e.split("+"), n = t.pop(), r = /* @__PURE__ */ new Set();
	for (let e of t) {
		let t = e.toLowerCase();
		t === "mod" ? r.add(ct() ? "meta" : "ctrl") : Ci.has(t) && r.add(t);
	}
	return [{
		modifiers: r,
		key: n === "Space" ? " " : n.toLowerCase(),
		originalKey: n
	}];
}
function Ti(e) {
	return e.length === 1 && !/[a-z]/i.test(e);
}
function Ei(e, t) {
	if (t.key === "Unidentified" || t.key.toLowerCase() !== e.key) return !1;
	let n = Ti(t.key), r = n ? t.shiftKey && e.modifiers.has("shift") : t.shiftKey, i = n ? t.altKey && e.modifiers.has("alt") : t.altKey;
	return r === e.modifiers.has("shift") && t.ctrlKey === e.modifiers.has("ctrl") && i === e.modifiers.has("alt") && t.metaKey === e.modifiers.has("meta");
}
var Di = /* @__PURE__ */ new WeakMap();
function Oi(e) {
	let t = Di.get(e);
	return t || (t = new Si(e), Di.set(e, t)), t;
}
function ki(e, t) {
	let n = Oi(e), r = wi(t.keys)[0]?.originalKey;
	return n.add({
		...t,
		value: gn(t.action ?? "", r, t.value)
	});
}
// node_modules/@videojs/core/dist/default/dom/hotkey/hotkey-events.js
var Ai = "hotkey-shortcut-change", ji = [
	sr,
	yr,
	wr,
	yn,
	Qr,
	Xr,
	Er,
	bn,
	Yn,
	or,
	Tr,
	Fn,
	Jr,
	Ln,
	ar
];
// node_modules/@videojs/core/dist/default/dom/ui/button.js
function Mi(e) {
	let { onActivate: t, isDisabled: n } = e;
	return {
		role: "button",
		tabIndex: 0,
		onClick(e) {
			n() ? e.preventDefault() : t(e, (e.detail ?? 0) > 0 ? "pointer" : "virtual");
		},
		onPointerDown(e) {
			n() && e.preventDefault();
		},
		onMouseDown(e) {
			n() && e.preventDefault();
		},
		onKeyDown(e) {
			e.target === e.currentTarget && (n() ? e.key !== "Tab" && e.preventDefault() : e.key === "Enter" ? (e.preventDefault(), t(e, "keyboard")) : e.key === " " && e.preventDefault());
		},
		onKeyUp(e) {
			e.target === e.currentTarget && (n() || e.key === " " && t(e, "keyboard"));
		}
	};
}
// node_modules/@videojs/core/dist/default/dom/ui/container.js
var Ni = "group";
function Pi(e) {
	e.hasAttribute("role") || e.setAttribute("role", Ni), e.hasAttribute("tabindex") || e.setAttribute("tabindex", "0");
}
function Fi(e) {
	let t = A(e.ownerDocument);
	t && t !== e.ownerDocument.body && j(e, t) || e.focus({ preventScroll: !0 });
}
// node_modules/@videojs/core/dist/default/dom/ui/dismiss-layer.js
function Ii(e) {
	let { transition: t } = e, n = t.state, r = new AbortController(), i = null;
	function a(e) {
		if (r.signal.aborted) return null;
		let { active: i, status: a } = n.current;
		return i && a !== "ending" ? null : (a === "ending" && t.cancel(), t.open(e));
	}
	function o(e) {
		let { active: i, status: a } = n.current;
		return r.signal.aborted || !i || a === "ending" ? null : t.close(e);
	}
	function s() {
		if (c(), typeof document > "u") return;
		i = new AbortController();
		let { signal: t } = i;
		k(document, "keydown", l, { signal: t }), e.onDocumentActive?.(t);
	}
	function c() {
		i?.abort(), i = null;
	}
	function l(t) {
		t.key === "Escape" && (t.defaultPrevented || n.current.active && (e.closeOnEscape?.() ?? !0) && e.onEscapeDismiss(t));
	}
	let u = n.subscribe(() => {
		n.current.active && n.current.status !== "ending" ? s() : c();
	});
	r.signal.addEventListener("abort", () => {
		u(), t.destroy(), c();
	});
	function d() {
		r.signal.aborted || r.abort();
	}
	return {
		input: n,
		open: a,
		close: o,
		signal: r.signal,
		destroy: d
	};
}
// node_modules/@videojs/core/dist/default/dom/ui/dialog.js
function Li(e) {
	let t = null, n = null, r = null, i = null, a = null, o = null, s = 0, c = /* @__PURE__ */ new Map(), l = D({ documentModal: !0 }), u = Ii({
		transition: e.transition,
		closeOnEscape: e.closeOnEscape,
		onEscapeDismiss(e) {
			w(e) && (e.preventDefault(), e.stopPropagation(), p());
		},
		onDocumentActive(e) {
			k(document, "keydown", h, {
				capture: !0,
				signal: e
			}), k(document, "focusin", g, { signal: e });
		}
	}), d = u.input;
	function f() {
		r = A();
		let n = u.open(() => t);
		n && (C(), b(), e.onOpenChange(!0), m(), n.then(() => {
			!u.signal.aborted && d.current.active && d.current.status === "idle" && e.onOpenChangeComplete?.(!0);
		}));
	}
	function p() {
		let i = u.close(t);
		i && (cancelAnimationFrame(s), s = 0, e.onOpenChange(!1), i.then(() => {
			if (u.signal.aborted || d.current.active) return;
			let t = A(), i = a && t instanceof Element && !j(a, t);
			S();
			let o = n?.isConnected ? n : r;
			!i && o?.isConnected && o.focus(), r = null, e.onOpenChangeComplete?.(!1);
		}));
	}
	function m() {
		cancelAnimationFrame(s), s = requestAnimationFrame(() => {
			s = 0, !u.signal.aborted && d.current.active && t && (t.querySelector("[autofocus]") ?? Le(t)[0] ?? t).focus();
		});
	}
	function h(e) {
		if (e.key !== "Tab" || !d.current.active || !t || !l.current.documentModal) return;
		let n = Le(t);
		if (n.length === 0) {
			e.preventDefault(), t.focus();
			return;
		}
		let r = A(), i = n[0], a = n[n.length - 1];
		e.shiftKey && (r === i || !r || !j(t, r)) ? (e.preventDefault(), a.focus()) : e.shiftKey || r !== a && r && j(t, r) || (e.preventDefault(), i.focus());
	}
	function g(e) {
		d.current.active && t && (e.target instanceof Element && j(t, e.target) || a && e.target instanceof Element && !j(a, e.target) || (Le(t)[0] ?? t).focus());
	}
	function _(e) {
		n = e;
	}
	function v(e) {
		t !== e && S(), t = e, C(), e && d.current.active && b();
		let n = A();
		e && d.current.active && (!n || !j(e, n)) && m();
	}
	function y(e) {
		i !== e && (S(), i = e, C(), t && d.current.active && b());
	}
	return u.signal.addEventListener("abort", () => {
		cancelAnimationFrame(s), s = 0, S(), t = null, n = null, r = null, i = null, a = null;
	}), {
		input: d,
		modality: l,
		triggerProps: { onClick() {
			f();
		} },
		open: f,
		close: p,
		setTriggerElement: _,
		setPopupElement: v,
		setInteractionRoot: y,
		destroy: u.destroy
	};
	function b() {
		!t?.isConnected || c.size > 0 || o || (C(), Pe(t, (e) => {
			if (e === a || e === t?.ownerDocument.body) return !0;
			if (e.assignedSlot) {
				for (let t of e.assignedSlot.assignedElements({ flatten: !0 })) t !== e && t instanceof HTMLElement && x(t);
				return;
			}
			let n = e.parentElement;
			if (n) {
				for (let t of n.children) t !== e && t instanceof HTMLElement && x(t);
				return;
			}
			let r = e.getRootNode();
			if (r instanceof ShadowRoot) for (let t of r.children) t !== e && t instanceof HTMLElement && x(t);
		}, { composed: !0 }), a && (o = Sn(a)));
	}
	function x(e) {
		c.set(e, e.hasAttribute("inert")), e.setAttribute("inert", "");
	}
	function S() {
		for (let [e, t] of c) t || e.removeAttribute("inert");
		c.clear(), o?.(), o = null;
	}
	function C() {
		a = i && t && j(i, t) ? i : null, l.patch({ documentModal: !a });
	}
	function w(e) {
		if (!a) return !0;
		let t = e.target instanceof Element ? e.target : A();
		return t instanceof Element && j(a, t);
	}
}
// node_modules/@videojs/core/dist/default/core/ui/transition.js
var Ri = {
	transitionStarting: "data-starting-style",
	transitionEnding: "data-ending-style"
};
function zi(e) {
	return {
		transitionStarting: e === "starting",
		transitionEnding: e === "ending"
	};
}
// node_modules/@videojs/core/dist/default/core/ui/indicator/lifecycle.js
var Bi = class {
	#e = null;
	#t;
	#n;
	constructor(e, t) {
		this.#t = e, this.#n = t;
	}
	arm() {
		this.clear(), this.#e = setTimeout(() => {
			this.#e = null, this.#t();
		}, this.#n());
	}
	clear() {
		this.#e !== null && (clearTimeout(this.#e), this.#e = null);
	}
	close() {
		this.clear(), this.#t();
	}
	destroy() {
		this.clear();
	}
};
function Vi(e) {
	return e.closeDelay ?? 800;
}
// node_modules/@videojs/core/dist/default/dom/ui/input-action.js
function Hi(e) {
	if (!e) return {};
	let t = e.state, n = di(t), r = ci(t), i = ui(t);
	return {
		paused: r && r.paused && !r.autoplaying,
		volume: L(t)?.volume,
		muted: L(t)?.muted,
		playbackRate: li(t)?.playbackRate,
		isFullscreen: ai(t)?.isFullscreen,
		subtitlesShowing: i?.subtitlesShowing,
		subtitlesAvailable: i ? (i.textTrackList ?? []).some(vt) : void 0,
		isPictureInPicture: si(t)?.isPictureInPicture,
		currentTime: n?.currentTime,
		duration: n?.duration,
		seeking: n?.seeking
	};
}
// node_modules/@videojs/core/dist/default/dom/utils/layout.js
function Ui(e, t, n, r) {
	let i = e + n, a = t + r;
	return {
		x: e,
		y: t,
		width: n,
		height: r,
		top: t,
		right: i,
		bottom: a,
		left: e,
		toJSON() {
			return {
				x: e,
				y: t,
				width: n,
				height: r,
				top: t,
				right: i,
				bottom: a,
				left: e
			};
		}
	};
}
function Wi(e, t) {
	let n = Math.max(e.left, t.left), r = Math.max(e.top, t.top), i = Math.min(e.right, t.right), a = Math.min(e.bottom, t.bottom);
	return Ui(n, r, Math.max(0, i - n), Math.max(0, a - r));
}
function Gi(e) {
	let t = document.documentElement.getBoundingClientRect();
	return e ? Wi(t, e.getBoundingClientRect()) : t;
}
function Ki(e, t = {}) {
	if (!e) return null;
	if (!m(e)) return e;
	if (e === "viewport") return null;
	if (e === "container") return t.container ?? null;
	try {
		return (t.root ?? document).querySelector(e);
	} catch {
		return null;
	}
}
// node_modules/@videojs/core/dist/default/dom/ui/popover/popover.js
function qi(e) {
	let { onOpenChange: t, closeOnOutsideClick: n } = e, r = null, i = null, a = null, o = null, s = /* @__PURE__ */ new Set(), c = !1, l = null, u = Ii({
		transition: e.transition,
		closeOnEscape: e.closeOnEscape,
		onEscapeDismiss(e) {
			e.preventDefault(), w("escape", e);
		},
		onDocumentActive(e) {
			k(document, "pointerdown", ne, {
				capture: !0,
				signal: e
			});
		}
	}), d = u.input, f = {
		close(e) {
			w(e);
		},
		get triggerElement() {
			return r;
		}
	};
	function p() {
		o !== null && (clearTimeout(o), o = null);
	}
	function m() {
		return globalThis.matchMedia?.("(hover: hover)")?.matches ?? !1;
	}
	function h() {
		return m() ? globalThis.matchMedia?.("(pointer: fine)")?.matches ?? !1 : !1;
	}
	function g() {
		return !e.openOnHover?.() || m();
	}
	function _() {
		c = !1, l !== null && (clearTimeout(l), l = null);
	}
	function v() {
		c = !0, l !== null && clearTimeout(l), l = setTimeout(_, 500);
	}
	function y() {
		return c ? (_(), !0) : !1;
	}
	function b() {
		return r ? r.hasAttribute("disabled") ? !0 : r.getAttribute("aria-disabled") === "true" : !1;
	}
	function x() {
		let t = u.open(() => i);
		t && (queueMicrotask(() => {
			!u.signal.aborted && d.current.active && d.current.status !== "ending" && pt(i);
		}), e.group?.()?.open(f), t.then(() => {
			!u.signal.aborted && d.current.active && d.current.status === "idle" && e.onOpenChangeComplete?.(!0);
		}));
	}
	function S() {
		let t = u.close(i);
		t && (e.group?.()?.close(f), t.then(() => {
			u.signal.aborted || d.current.active || (mt(i), e.onOpenChangeComplete?.(!1));
		}));
	}
	function C(n, r) {
		if (u.signal.aborted) return;
		let { active: i, status: a } = d.current;
		i && a !== "ending" || (t(!0, r ? {
			reason: n,
			event: r
		} : { reason: n }), e.deferOpenChanges || x());
	}
	function w(n, r) {
		if (u.signal.aborted) return;
		let { active: i, status: a } = d.current;
		i && a !== "ending" && (t(!1, r ? {
			reason: n,
			event: r
		} : { reason: n }), e.deferOpenChanges || S());
	}
	function ee(e = "click") {
		C(e);
	}
	function T(e = "click") {
		p(), w(e);
	}
	function te(t) {
		e.deferOpenChanges && (t ? x() : S());
	}
	function ne(e) {
		if (!n() || !d.current.active) return;
		let t = e.composedPath();
		r && t.includes(r) || i && t.includes(i) ? v() : (_(), w("outside-click", e));
	}
	function re(e) {
		e.newState === "closed" && w("imperative-action", e);
	}
	u.signal.addEventListener("abort", () => {
		a?.abort(), a = null, e.group?.()?.close(f), p(), _(), s.clear(), r = null, i = null;
	});
	let E = {
		onClick(e) {
			g() && (b() || (d.current.active && d.current.status !== "ending" ? w("click", e) : C("click", e)));
		},
		onPointerEnter(t) {
			if (!e.openOnHover?.() || !m() || (p(), d.current.active)) return;
			let n = e.delay?.() ?? 300;
			o = setTimeout(() => C("hover"), n);
		},
		onPointerLeave(t) {
			if (!e.openOnHover?.() || !m() || (p(), !d.current.active)) return;
			let n = e.closeDelay?.() ?? 0;
			o = setTimeout(() => w("hover"), n);
		},
		onFocusIn(t) {
			if (e.openOnHover?.()) {
				if (!h()) return;
				C("focus");
			}
		},
		onFocusOut(t) {
			let n = t.relatedTarget;
			n && (r?.contains(n) || i?.contains(n)) || e.openOnHover?.() && w("blur");
		}
	}, ie = {
		onPointerEnter(t) {
			e.openOnHover?.() && p();
		},
		onPointerLeave(t) {
			if (!e.openOnHover?.() || s.size > 0 || (p(), !d.current.active)) return;
			let n = e.closeDelay?.() ?? 0;
			o = setTimeout(() => w("hover"), n);
		},
		onGotPointerCapture(e) {
			s.add(e.pointerId);
		},
		onLostPointerCapture(e) {
			s.delete(e.pointerId);
		},
		onFocusOut(e) {
			let t = e.relatedTarget;
			t && (r?.contains(t) || i?.contains(t)) || y() || (t === null ? requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					if (!d.current.active || d.current.status === "ending" || d.current.status === "starting") return;
					let e = A(i?.ownerDocument);
					e && (r?.contains(e) || i?.contains(e)) || w("blur");
				});
			}) : w("blur"));
		}
	};
	function ae(e) {
		r = e;
	}
	function oe(e) {
		!e && i && d.current.active && mt(i), a?.abort(), a = null, i = e, e && (a = new AbortController(), k(e, "toggle", re, { signal: a.signal }), d.current.active && pt(e));
	}
	return {
		input: d,
		triggerProps: E,
		popupProps: ie,
		get triggerElement() {
			return r;
		},
		setTriggerElement: ae,
		setPopupElement: oe,
		open: ee,
		close: T,
		syncOpen: te,
		destroy: u.destroy
	};
}
// node_modules/@videojs/core/dist/default/core/ui/popover/vars.js
var z = {
	sideOffset: "--media-popover-side-offset",
	alignOffset: "--media-popover-align-offset",
	boundaryOffset: "--media-popover-boundary-offset",
	anchorWidth: "--media-popover-anchor-width",
	anchorHeight: "--media-popover-anchor-height",
	availableWidth: "--media-popover-available-width",
	availableHeight: "--media-popover-available-height"
};
// node_modules/@videojs/core/dist/default/dom/ui/popover/group.js
function Ji() {
	let e = null, t = /* @__PURE__ */ new Set();
	function n() {
		for (let e of t) e();
	}
	return {
		open(t) {
			if (e === t) return;
			let r = e;
			e = t, r?.close("group-open"), n();
		},
		close(t) {
			e === t && (e = null, n());
		},
		isOpenFor(t) {
			return t !== null && e?.triggerElement === t;
		},
		subscribe(e) {
			return t.add(e), () => t.delete(e);
		}
	};
}
// node_modules/@videojs/core/dist/default/dom/utils/event.js
function Yi(e, t) {
	if (!t) return !1;
	if (_(e.composedPath)) return e.composedPath().includes(t);
	let n = e.target;
	return n instanceof Node && t.contains(n);
}
// node_modules/@videojs/core/dist/default/dom/ui/popover/positioning.js
var Xi = {
	sideOffset: 0,
	alignOffset: 0,
	boundaryOffset: 0
}, Zi = {
	top: "bottom",
	bottom: "top",
	left: "right",
	right: "left"
};
function Qi(e) {
	return `${pr(e, 0, Infinity)}px`;
}
function $i(e, t, n, r) {
	let i = n - r;
	return i < t ? t : pr(e, t, i);
}
function ea({ align: e, direction: t = "ltr" }) {
	return t === "rtl" ? e === "start" ? "end" : e === "end" ? "start" : e : e;
}
function ta(e, t, n, r, i, a, o, s, c, l) {
	let u = a === "start" ? e + o : a === "end" ? t + o : e + n / 2 + o, d = c === "horizontal" ? "left" : "top", f = Zi[d], p = a === "start" ? d : a === "end" ? f : "center", m = a === "start" ? "0px" : a === "end" ? "-100%" : "-50%";
	return {
		base: `calc(anchor(${p}) + ${l})`,
		translate: `clamp(${r + s - u}px, ${m}, calc(${i - s - u}px - 100%))`
	};
}
function na(e, t, n, r, i, a, o = z) {
	if (ze()) return {
		...ra(e, t, o, n, i, a),
		...n && i ? ia(n, i, t, a, o) : {}
	};
	if (n && r) {
		let e = a ?? Xi;
		return {
			position: "fixed",
			margin: "0",
			...aa(n, r, t, e, i),
			...i ? ia(n, i, t, e, o) : {}
		};
	}
	return {};
}
function ra(e, t, n = z, r, i, a = Xi) {
	let o = `var(${n.sideOffset}, 0px)`, s = `var(${n.alignOffset}, 0px)`, { side: c, align: l } = t, u = a.boundaryOffset ?? 0, d = {
		positionAnchor: `--${e}`,
		position: "fixed",
		inset: "auto",
		margin: "0",
		justifySelf: "normal",
		alignSelf: "normal",
		marginInlineStart: "0",
		marginBlockStart: "0",
		translate: "none"
	}, f = Zi[c];
	if (c === "top" || c === "bottom") {
		let e = ea(t);
		if (d[f] = `calc(anchor(${c}) + ${o})`, r && i) {
			let { base: t, translate: n } = ta(r.left, r.right, r.width, i.left, i.right, e, a.alignOffset, u, "horizontal", s);
			return d.left = t, d.translate = `${n} 0`, d;
		}
		e === "start" ? d.left = `calc(anchor(left) + ${s})` : e === "end" ? d.right = `calc(anchor(right) + ${s})` : (d.justifySelf = "anchor-center", d.marginInlineStart = s);
	} else {
		if (d[f] = `calc(anchor(${c}) + ${o})`, r && i) {
			let { base: e, translate: t } = ta(r.top, r.bottom, r.height, i.top, i.bottom, l, a.alignOffset, u, "vertical", s);
			return d.top = e, d.translate = `0 ${t}`, d;
		}
		l === "start" ? d.top = `calc(anchor(top) + ${s})` : l === "end" ? d.bottom = `calc(anchor(bottom) + ${s})` : (d.alignSelf = "anchor-center", d.marginBlockStart = s);
	}
	return d;
}
function ia(e, t, n, r = Xi, i = z) {
	let a = {}, { side: o } = n, s = r.boundaryOffset ?? 0, c = t.left + s, l = t.right - s, u = t.top + s, d = t.bottom - s;
	if (a[i.anchorWidth] = `${e.width}px`, a[i.anchorHeight] = `${e.height}px`, o === "top" || o === "bottom") {
		let t = o === "top" ? e.top - u : d - e.bottom;
		a[i.availableHeight] = Qi(t - r.sideOffset), a[i.availableWidth] = Qi(l - c);
	} else {
		let t = o === "left" ? e.left - c : l - e.right;
		a[i.availableWidth] = Qi(t - r.sideOffset), a[i.availableHeight] = Qi(d - u);
	}
	return a;
}
function aa(e, t, n, r = {
	sideOffset: 0,
	alignOffset: 0
}, i) {
	let { side: a, align: o } = n, { sideOffset: s, alignOffset: c } = r, l = 0, u, d = 0, f;
	if (a === "top" ? u = `calc(100% - ${e.top}px + ${s}px)` : a === "bottom" ? l = e.bottom + s : a === "left" ? f = `calc(100% - ${e.left}px + ${s}px)` : d = e.right + s, a === "top" || a === "bottom") {
		let r = ea(n);
		d = r === "start" ? e.left + c : r === "end" ? e.right - t.width + c : e.left + (e.width - t.width) / 2 + c;
	} else l = o === "start" ? e.top + c : o === "end" ? e.bottom - t.height + c : e.top + (e.height - t.height) / 2 + c;
	if (i) {
		let e = r.boundaryOffset ?? 0;
		a === "top" || a === "bottom" ? d = $i(d, i.left + e, i.right - e, t.width) : l = $i(l, i.top + e, i.bottom - e, t.height);
	}
	return {
		top: a === "top" ? "auto" : `${l}px`,
		bottom: u ?? "auto",
		left: a === "left" ? "auto" : `${d}px`,
		right: f ?? "auto"
	};
}
function oa(e, t = z) {
	let n = getComputedStyle(e);
	return {
		sideOffset: rt(e, n.getPropertyValue(t.sideOffset)),
		alignOffset: rt(e, n.getPropertyValue(t.alignOffset)),
		boundaryOffset: rt(e, n.getPropertyValue(t.boundaryOffset))
	};
}
function sa(e, t) {
	let n = e.getBoundingClientRect(), r = it(e, {
		box: "layout",
		overflow: t === "left" || t === "right" ? "width" : "height"
	});
	return Ui(n.left, n.top, r.width, r.height);
}
function ca(e) {
	let t = e.parentNode;
	if (ua(e) || !t) return {
		x: 0,
		y: 0
	};
	let n = e.ownerDocument.createElement("div");
	n.style.cssText = "position:fixed;left:0;top:0;width:0;height:0;margin:0;padding:0;border:0;visibility:hidden;pointer-events:none", t.insertBefore(n, e);
	let r = n.getBoundingClientRect();
	return n.remove(), {
		x: r.left,
		y: r.top
	};
}
function la(e, t) {
	return Ui(e.left - t.x, e.top - t.y, e.width, e.height);
}
function ua(e) {
	return e.hasAttribute("popover") && Be();
}
// node_modules/@videojs/core/dist/default/dom/ui/popover/positioner.js
var da = [
	"position",
	"inset",
	"margin",
	"margin-top",
	"margin-right",
	"margin-bottom",
	"margin-left",
	"justify-self",
	"align-self",
	"margin-inline-start",
	"margin-block-start",
	"translate",
	"top",
	"right",
	"bottom",
	"left"
], fa = class {
	#e = null;
	#t = null;
	#n = null;
	#r = null;
	#i = null;
	#a = !1;
	#o = null;
	#s = null;
	#c = _t(() => this.#f());
	sync(e) {
		let { anchorName: t, position: n, trigger: r, popup: i, boundary: a, container: o, cssVars: s = z } = e;
		if (!n || !r || !i) {
			this.cleanup();
			return;
		}
		let c = Ki(a, {
			container: o ?? null,
			root: i.getRootNode()
		}), l = this.#e;
		!l || l.anchorName !== t || l.trigger !== r || l.popup !== i || (l.cssVars ?? z) !== s || l.trackResize !== e.trackResize || this.#t !== c ? (l?.popup && this.#m(l.popup), this.#u(), this.#e = {
			...e,
			cssVars: s
		}, this.#t = c, this.#l()) : this.#e = {
			...e,
			cssVars: s
		}, this.#f();
	}
	cleanup() {
		this.#e && (this.#e.popup && this.#m(this.#e.popup), this.#u(), this.#e = null, this.#t = null);
	}
	#l() {
		let e = this.#e;
		if (!e?.trigger || !e.popup) return;
		this.#h(e.trigger, e.popup, e.anchorName), this.#n = new AbortController();
		let { signal: t } = this.#n;
		window.addEventListener("scroll", this.#d, {
			capture: !0,
			passive: !0,
			signal: t
		}), window.addEventListener("resize", this.#d, { signal: t });
		let n = [e.trigger];
		e.trackResize !== !1 && n.push(e.popup), this.#t && n.push(this.#t), this.#r = st(n, () => this.#d());
	}
	#u() {
		this.#n?.abort(), this.#n = null, this.#r?.(), this.#r = null, this.#c.cancel(), this.#g();
	}
	#d = (e) => {
		let t = this.#e?.popup;
		!t || e && Yi(e, t) || this.#c();
	};
	#f() {
		let e = this.#e;
		if (!e?.position || !e.trigger || !e.popup) return;
		let t = e.trigger, n = ze(), r = n ? {
			x: 0,
			y: 0
		} : ca(e.popup), i = la(t.getBoundingClientRect(), r), a = la(Gi(this.#t), r), o = oa(e.popup, e.cssVars), s = e.position, c = () => la(sa(e.popup, s.side), r), l = (r) => {
			let c = ft(i, r, a, s, o), { positionAnchor: l, ...u } = na(e.anchorName, {
				...s,
				side: c,
				direction: Oe(t) ? "rtl" : "ltr"
			}, i, n ? void 0 : r, a, o, e.cssVars);
			return {
				popupRect: r,
				side: c,
				style: u
			};
		}, u = l(c());
		if (this.#p(e.popup, e.cssVars ?? z), et(e.popup, u.style), e.onSideChange?.(u.side), n || !e.onSideChange) return;
		let d = c();
		if (d.width === u.popupRect.width && d.height === u.popupRect.height) return;
		let f = l(d);
		et(e.popup, f.style), f.side !== u.side && e.onSideChange(f.side);
	}
	#p(e, t) {
		if (this.#s) return;
		let n = [
			...da,
			t.anchorWidth,
			t.anchorHeight,
			t.availableWidth,
			t.availableHeight
		];
		this.#s = tt(e, n);
	}
	#m(e) {
		this.#s &&= (nt(e, this.#s), null);
	}
	#h(e, t, n) {
		if (!ze()) return;
		let r = `--${n}`, i = this.#_(e, "anchor-name");
		this.#o = this.#_(t, "position-anchor");
		let a = $e(e);
		this.#i = r, this.#a = !a.includes(r), this.#a && a.push(r), e.style.setProperty("anchor-name", a.join(", "), i.priority), t.style.setProperty("position-anchor", r);
	}
	#g() {
		let e = this.#e;
		if (e?.trigger && e.popup) {
			if (this.#i && this.#a) {
				let t = this.#_(e.trigger, "anchor-name"), n = $e(e.trigger).filter((e) => e !== this.#i);
				this.#v(e.trigger, "anchor-name", {
					value: n.join(", "),
					priority: t.priority
				});
			}
			this.#o && this.#v(e.popup, "position-anchor", this.#o), this.#i = null, this.#a = !1, this.#o = null;
		}
	}
	#_(e, t) {
		let n = t.startsWith("--") ? t : Xe(t);
		return {
			value: e.style.getPropertyValue(n),
			priority: e.style.getPropertyPriority(n)
		};
	}
	#v(e, t, n) {
		let r = t.startsWith("--") ? t : Xe(t);
		n.value ? e.style.setProperty(r, n.value, n.priority) : e.style.removeProperty(r);
	}
};
// node_modules/@videojs/core/dist/default/dom/ui/slider/focus.js
function pa(e = document) {
	let t = A(je(e) ? e : e.ownerDocument);
	return t?.getAttribute("role") === "slider" ? je(e) || j(e, t) : !1;
}
// node_modules/@videojs/core/dist/default/dom/ui/status-announcer.js
function ma(e, t) {
	let n = !0, r = !1, i = e.target, a = 0, o = () => {
		i = e.target, r = !0;
		let o = ++a;
		t.resetSnapshot(), queueMicrotask(() => {
			n && o === a && (r = !1, i = e.target, i && t.processSnapshot(Hi(e)));
		});
	}, s = e.subscribe(() => {
		let n = e.target;
		n === i ? n && !r && t.processSnapshot(Hi(e)) : o();
	});
	return o(), () => {
		n = !1, s();
	};
}
function ha(e) {
	return !e || !pa(e);
}
// node_modules/@videojs/core/dist/default/dom/ui/tooltip/tooltip.js
var ga = {
	hover: "hover",
	focus: "focus",
	escape: "escape",
	blur: "blur",
	"imperative-action": "imperative-action"
};
function _a(e) {
	let t = {
		transition: e.transition,
		onOpenChange(t, n) {
			let r = ga[n.reason];
			if (!r) return;
			let i = e.group?.();
			t ? i?.notifyOpen() : i?.notifyClose();
			let a = n.event ? {
				reason: r,
				event: n.event
			} : { reason: r };
			e.onOpenChange(t, a);
		},
		closeOnEscape: () => !0,
		closeOnOutsideClick: () => !1,
		openOnHover: () => !0,
		delay: () => {
			let t = e.group?.();
			return t?.shouldSkipDelay() ? 0 : e.delay?.() ?? t?.delay ?? 600;
		},
		closeDelay: () => {
			let t = e.group?.();
			return e.closeDelay?.() ?? t?.closeDelay ?? 0;
		}
	};
	e.onOpenChangeComplete && (t.onOpenChangeComplete = e.onOpenChangeComplete);
	let n = qi(t), r = !1, i, a;
	function o() {
		return i?.isOpenFor(n.triggerElement) ?? !1;
	}
	function s() {
		return e.sticky?.() ?? !1;
	}
	function c() {
		let t = e.popupGroup?.();
		t !== i && (a?.(), i = t, a = i?.subscribe(() => {
			o() && !s() && n.close("imperative-action");
		}));
	}
	function l(e) {
		n.setTriggerElement(e), c(), o() && !s() && n.close("imperative-action");
	}
	let { onClick: u, ...d } = n.triggerProps, f = {
		...d,
		onPointerDown() {
			c(), r = !0, s() || n.close("imperative-action");
		},
		onPointerEnter(t) {
			c(), e.disabled?.() || (!o() || s()) && t.pointerType !== "touch" && d.onPointerEnter(t);
		},
		onFocusIn(t) {
			c(), e.disabled?.() || (!o() || s()) && (r ? r = !1 : d.onFocusIn(t));
		}
	}, p = {
		...n.popupProps,
		onPointerEnter(t) {
			e.disableHoverablePopup?.() || n.popupProps.onPointerEnter(t);
		}
	};
	return {
		...n,
		triggerProps: f,
		popupProps: p,
		get triggerElement() {
			return n.triggerElement;
		},
		setTriggerElement: l,
		open: () => {
			c(), (!o() || s()) && n.open("hover");
		},
		close: (e = "hover") => n.close(e),
		destroy() {
			a?.(), n.destroy();
		}
	};
}
// node_modules/@videojs/core/dist/default/dom/ui/transition.js
function va() {
	let e = D({
		active: !1,
		status: "idle"
	}), t = !1, n = 0, r = 0, i = 0, a = null;
	function o() {
		cancelAnimationFrame(n), cancelAnimationFrame(r), n = 0, r = 0;
	}
	function s() {
		return i++, o(), a?.(), a = null, i;
	}
	function c(e) {
		if (e !== i) return;
		let t = a;
		a = null, t?.();
	}
	function l(o = null) {
		if (t) return Promise.resolve();
		let l = s(), u = e.current.active;
		return u && e.patch({ status: "idle" }), e.patch({
			active: !0,
			status: "starting"
		}), new Promise((s) => {
			a = s, n = requestAnimationFrame(() => {
				if (n = 0, u) {
					let e = ya(o);
					xa(e), ba(e);
				}
				r = requestAnimationFrame(() => {
					if (r = 0, t || l !== i || !e.current.active) return c(l);
					e.patch({ status: "idle" }), n = requestAnimationFrame(() => {
						if (n = 0, t || l !== i || !e.current.active) return c(l);
						Sa(ya(o)).finally(() => c(l));
					});
				});
			});
		});
	}
	function u(o) {
		if (t) return Promise.resolve();
		let l = s();
		return e.patch({ status: "ending" }), new Promise((s) => {
			a = s, n = requestAnimationFrame(() => {
				n = 0, r = requestAnimationFrame(() => {
					if (r = 0, t || l !== i) return c(l);
					Sa(o).finally(() => {
						if (t || l !== i || e.current.status !== "ending") return c(l);
						e.patch({
							active: !1,
							status: "idle"
						}), c(l);
					});
				});
			});
		});
	}
	function d() {
		i++, o(), a?.(), a = null, e.current.status !== "idle" && e.patch({ status: "idle" });
	}
	return {
		state: e,
		open: l,
		close: u,
		cancel: d,
		destroy() {
			t || (t = !0, d());
		}
	};
}
function ya(e) {
	return typeof e == "function" ? e() : e;
}
function ba(e) {
	e && e.offsetHeight;
}
function xa(e) {
	let t = e?.getAnimations?.({ subtree: !0 }) ?? [];
	for (let e of t) e.cancel();
}
function Sa(e) {
	if (!e) return Promise.resolve();
	let t = e.getAnimations?.() ?? [];
	return t.length === 0 ? Promise.resolve() : Promise.all(t.map((e) => e.finished)).then(E, E);
}
// node_modules/@videojs/core/dist/default/dom/utils/element-props.js
function B(e, t, n) {
	let r = n?.signal;
	for (let [n, i] of Object.entries(t)) if (_(i) && n.startsWith("on")) {
		let t = n.endsWith("Capture") && !n.endsWith("PointerCapture");
		k(e, n.slice(2, t ? -7 : void 0).toLowerCase(), i, r ? {
			capture: t,
			signal: r
		} : { capture: t });
	} else y(i) || i === !1 ? e.removeAttribute(n) : i === !0 ? e.setAttribute(n, "") : e.setAttribute(n, String(i));
}
// node_modules/@videojs/core/dist/default/dom/utils/state-data-attrs.js
function V(e, t, n) {
	for (let r in t) {
		if (n && !(r in n)) continue;
		let i = n?.[r] ?? Ca(r), a = t[r];
		a === !0 ? e.setAttribute(i, "") : a ? e.setAttribute(i, String(a)) : e.removeAttribute(i);
	}
}
function Ca(e) {
	return `data-${e.toLowerCase()}`;
}
// node_modules/@videojs/html/dist/default/player/element.js
function wa(e) {
	return Object.entries(e).map(([e, t]) => {
		let n = t.html?.attribute ?? Xe(e);
		return {
			property: Ye(n),
			attribute: n,
			entry: t
		};
	});
}
function Ta(e) {
	let t = wa(e.config);
	class n extends M {
		static {
			this.properties = {
				...M.properties,
				...Object.fromEntries(t.map(({ property: e, attribute: t }) => [e, {
					type: String,
					attribute: t
				}]))
			};
		}
		#e = e.factory();
		#t = null;
		#n = null;
		#r = !1;
		#i = null;
		#a = null;
		#o = null;
		#s = null;
		#c = [];
		#l = [];
		#u = new MutationObserver(() => this.#b());
		#d = new pn(() => this.#T());
		#f = (e) => this.#d.register(e);
		#p = (e) => {
			let t = { value: e };
			return this.#c.push(t), this.#v(), () => {
				let e = this.#c.indexOf(t);
				e < 0 || (this.#c.splice(e, 1), this.#b(), this.#v());
			};
		};
		#m = (e) => {
			let t = { value: e };
			return this.#l.push(t), this.#y(), () => {
				let e = this.#l.indexOf(t);
				e < 0 || (this.#l.splice(e, 1), this.#y());
			};
		};
		#h = new o(this, {
			context: e.playerContext,
			initialValue: this.store
		});
		#g = new o(this, {
			context: e.mediaContext,
			initialValue: {
				media: this.#i,
				registerMedia: this.#p
			}
		});
		#_ = new o(this, {
			context: e.containerContext,
			initialValue: {
				container: this.#o,
				registerContainer: this.#m
			}
		});
		constructor() {
			super(), new o(this, {
				context: e.extensionContext,
				initialValue: { registerExtension: this.#f }
			});
		}
		get store() {
			return v(this.#e) && (this.#e = e.factory()), this.#e;
		}
		connectedCallback() {
			this.#r = !0, super.connectedCallback(), this.#D(), this.#h.setValue(this.store), this.#x(), this.#S(), this.#u.observe(this, {
				childList: !0,
				subtree: !0
			}), queueMicrotask(() => {
				this.#r && this.#b();
			}), this.#C();
		}
		disconnectedCallback() {
			this.#r = !1, this.#u.disconnect(), this.#E(), super.disconnectedCallback();
		}
		destroyCallback() {
			this.#u.disconnect(), this.#E(), this.#d.destroy(), this.#e?.destroy(), this.#e = null, super.destroyCallback();
		}
		willUpdate(e) {
			super.willUpdate(e);
			for (let { property: n, entry: r } of t) {
				if (!e.has(n)) continue;
				let t = n;
				hn(this.store, r, this[t]);
			}
		}
		#v() {
			let e = this.#c.at(-1)?.value ?? null ?? this.#a;
			this.#i !== e && (this.#i = e, this.#x(), this.#C());
		}
		#y() {
			let e = this.#l.at(-1)?.value ?? null;
			this.#o !== e && (this.#o = e, this.#S(), this.#C());
		}
		#b() {
			let e = this.querySelector("video, audio");
			this.#a !== e && (this.#a = e, this.#v());
		}
		#x() {
			this.#g.setValue({
				media: this.#i,
				registerMedia: this.#p
			});
		}
		#S() {
			this.#_.setValue({
				container: this.#o,
				registerContainer: this.#m
			});
		}
		#C() {
			if (!this.#r || !this.#e) return;
			if (!this.#i) {
				this.#E();
				return;
			}
			let e = {
				media: this.#i,
				container: this.#o
			}, t = this.#s?.media !== e.media, n = this.#s?.container !== e.container;
			(t || n) && this.#w(e);
		}
		#w(e) {
			let t = this.#e;
			t && (this.#n?.(), this.#s = e, this.#d.attach(e), this.#n = t.attach({
				media: this.#d.getStoreMedia(e.media),
				container: e.container
			}));
		}
		#T() {
			this.#s && this.#w(this.#s);
		}
		#E() {
			this.#n?.(), this.#n = null, this.#d.detach(), this.#s = null;
		}
		#D() {
			let e = this.store;
			if (this.#t !== e) {
				for (let { property: n, entry: r } of t) {
					let t = n;
					hn(e, r, this[t]);
				}
				this.#t = e;
			}
		}
	}
	return n;
}
// node_modules/@videojs/html/dist/default/player/create-player.js
function Ea(e) {
	let t = ei(...e.features);
	return {
		PlayerElement: Ta({
			playerContext: u,
			mediaContext: d,
			containerContext: f,
			extensionContext: p,
			factory: () => ve()(t),
			config: mn(e.features)
		}),
		PlayerController: we(u),
		playerContext: u
	};
}
// node_modules/@videojs/html/dist/default/presets/video/player.js
var { PlayerElement: Da, PlayerController: Oa } = Ea({ features: ji });
// node_modules/@videojs/html/dist/default/define/video/player.js
e(class extends Da {
	static {
		this.tagName = "video-player";
	}
});
var ka = n(Symbol.for("@videojs/i18n")), Aa;
function ja() {
	return Aa ??= Hr(Ir("en"), "en"), Aa;
}
var Ma = class {
	#e;
	#t;
	#n;
	constructor(e, t) {
		this.#e = e, this.#t = new c(e, {
			context: t,
			callback: () => this.#e.requestUpdate(),
			subscribe: !0
		}), e.addController(this);
	}
	get value() {
		return this.#t.value?.translator ?? ja();
	}
	get locale() {
		return this.#t.value?.locale ?? "en";
	}
	hostConnected() {
		Aa = void 0, this.#n = Lr(() => {
			Aa = void 0, this.#t.value || this.#e.requestUpdate();
		});
	}
	hostDisconnected() {
		this.#n?.(), this.#n = void 0;
	}
}, Na = n(Symbol.for("@videojs/popup-group"));
// node_modules/@videojs/core/dist/default/core/ui/utils/resolve-label.js
function Pa(e, t) {
	return _(e) ? e(t) || void 0 : e || void 0;
}
// node_modules/@videojs/core/dist/default/core/ui/dialog/core.js
var Fa = class {
	static defaultProps = {
		open: !1,
		defaultOpen: !1,
		closeOnEscape: !0
	};
	#e;
	#t = null;
	#n = void 0;
	#r = void 0;
	#i = !0;
	constructor(e = "dialog") {
		this.#e = e;
	}
	setProps(e) {}
	setInput(e) {
		this.#t = e;
	}
	setTitleId(e) {
		this.#n = e;
	}
	setDescriptionId(e) {
		this.#r = e;
	}
	setDocumentModal(e) {
		this.#i = e;
	}
	getState() {
		let e = this.#t;
		return {
			open: e.active,
			status: e.status,
			titleId: this.#n,
			descriptionId: this.#r,
			scope: this.#i ? "document" : "player",
			...zi(e.status)
		};
	}
	getTriggerAttrs(e, t) {
		return {
			"aria-expanded": e.open && e.status !== "ending" ? "true" : "false",
			"aria-haspopup": "dialog",
			"aria-controls": t
		};
	}
	getPopupAttrs(e) {
		return {
			role: this.#e,
			"aria-modal": this.#i ? "true" : void 0,
			"aria-labelledby": e.titleId,
			"aria-describedby": e.descriptionId
		};
	}
}, Ia = class extends Fa {
	constructor() {
		super("alertdialog");
	}
}, La = {
	open: "data-open",
	transitionStarting: "data-starting-style",
	transitionEnding: "data-ending-style",
	scope: "data-scope"
}, Ra = class e {
	static defaultProps = { delay: 500 };
	state = D({ visible: !1 });
	#e = { ...e.defaultProps };
	#t = null;
	setProps(t) {
		this.#e = T(t, e.defaultProps);
	}
	destroy() {
		this.#n();
	}
	update(e) {
		let t = e.waiting && !e.paused || e.autoplaying;
		t && !this.state.current.visible && !this.#t ? this.#t = setTimeout(() => {
			this.#t = null, this.state.patch({ visible: !0 });
		}, this.#e.delay) : t || (this.#n(), this.state.patch({ visible: !1 }));
	}
	#n() {
		this.#t !== null && (clearTimeout(this.#t), this.#t = null);
	}
}, za = { visible: "data-visible" }, Ba = "captions.", Va = {
	key: `${Ba}enable`,
	text: "Enable captions"
}, Ha = {
	key: `${Ba}disable`,
	text: "Disable captions"
}, Ua = class e {
	static defaultProps = {
		label: "",
		disabled: !1,
		menuTrigger: !1
	};
	state = D({
		subtitlesShowing: !1,
		availability: "unavailable",
		disabled: !0,
		hidden: !0,
		label: ""
	});
	#e = { ...e.defaultProps };
	#t = null;
	constructor(e) {
		e && this.setProps(e);
	}
	setProps(t) {
		this.#e = T(t, e.defaultProps);
	}
	getLabel(e) {
		return Pa(this.#e.label, e) || (e.subtitlesShowing ? Ha : Va);
	}
	getAttrs(e) {
		return {
			"aria-label": this.getLabel(e),
			"aria-disabled": e.disabled ? "true" : void 0,
			hidden: e.hidden ? "" : void 0
		};
	}
	setMedia(e) {
		this.#t = e;
	}
	getState() {
		let e = this.#t, t = e.textTrackList.some(vt) ? "available" : "unavailable";
		return this.state.patch({
			subtitlesShowing: e.subtitlesShowing,
			availability: t,
			disabled: this.#e.disabled || t !== "available",
			hidden: t === "unavailable"
		}), this.state.patch({ label: Rr(this.getLabel(this.state.current)) }), this.state.current;
	}
	toggle(e) {
		this.setMedia(e), this.getState().disabled || this.#e.menuTrigger && Wa(e) > 1 || e.toggleSubtitles();
	}
};
function Wa(e) {
	return e.textTrackList.filter(vt).length;
}
// node_modules/@videojs/core/dist/default/core/ui/captions-button/data.js
var Ga = {
	subtitlesShowing: "data-active",
	availability: "data-availability",
	disabled: "data-disabled",
	hidden: "data-hidden"
}, Ka = class {
	#e = null;
	setMedia(e) {
		this.#e = e;
	}
	getState() {
		return { controlsVisible: this.#e.controlsVisible };
	}
}, qa = { controlsVisible: "data-controls-visible" }, Ja = class e {
	static defaultProps = { visibility: "auto" };
	#e = { ...e.defaultProps };
	#t = null;
	constructor(e) {
		e && this.setProps(e);
	}
	setProps(t) {
		this.#e = T(t, e.defaultProps);
	}
	setMedia(e) {
		this.#t = e;
	}
	getState() {
		let e = this.#t;
		return e ? {
			visible: this.#e.visibility === "always" || e.controlsVisible,
			userActive: e.userActive
		} : this.#e.visibility === "always" ? {
			visible: !0,
			userActive: !0
		} : null;
	}
}, Ya = {
	visible: "data-visible",
	userActive: "data-user-active"
}, Xa = class extends Ia {
	setProps() {}
}, Za = { ...La }, Qa = "common.", $a = {
	key: `${Qa}empty`,
	text: ""
}, eo = {
	key: `${Qa}ok`,
	text: "OK"
}, H = "errors.", to = {
	key: `${H}aborted`,
	text: "You stopped media playback before it finished."
}, no = {
	key: `${H}network`,
	text: "This media could not be loaded due to a network or server issue."
}, ro = {
	key: `${H}decode`,
	text: "This media could not be played. It may be corrupted, or your browser may not support its format."
}, io = {
	key: `${H}source`,
	text: "This media could not be loaded. It may be unavailable, or your browser may not support its format."
}, ao = {
	key: `${H}encrypted`,
	text: "This media could not be played because it could not be decrypted."
}, oo = {
	key: `${H}unplayable`,
	text: "This media is unsupported by the player."
}, so = {
	key: `${H}title`,
	text: "Something went wrong."
}, co = {
	key: `${H}unexpected`,
	text: "An unexpected error occurred."
}, lo = 99001, uo = {
	[N.MEDIA_ERR_ABORTED]: to,
	[N.MEDIA_ERR_NETWORK]: no,
	[N.MEDIA_ERR_DECODE]: ro,
	[N.MEDIA_ERR_SRC_NOT_SUPPORTED]: io,
	[N.MEDIA_ERR_ENCRYPTED]: ao,
	[N.MEDIA_ERR_CUSTOM]: $a,
	[lo]: oo
}, fo = { [N.MEDIA_ERR_SRC_NOT_SUPPORTED]: ["Failed to open media"] };
function po(e) {
	return e >= N.MEDIA_ERR_ABORTED && e <= N.MEDIA_ERR_ENCRYPTED;
}
function mo() {
	return so;
}
function ho() {
	return eo;
}
function go() {
	return co;
}
function _o(e, t) {
	if (e) {
		let t = uo[e.code], n = e.message?.trim();
		if (n) {
			let r = N.defaultMessages[e.code];
			if (t && r && n === r) return t;
			let i = fo[e.code];
			return t && po(e.code) && !e.context && i?.includes(n) ? t : n;
		}
		if (t) return t;
	}
	return t?.trim() || co;
}
// node_modules/@videojs/core/dist/default/i18n/text/fullscreen.js
var vo = "fullscreen.", yo = {
	key: `${vo}enter`,
	text: "Enter fullscreen"
}, bo = {
	key: `${vo}exit`,
	text: "Exit fullscreen"
}, xo = class e {
	static defaultProps = {
		label: "",
		disabled: !1
	};
	state = D({
		fullscreen: !1,
		availability: "unavailable",
		disabled: !0,
		hidden: !0,
		label: ""
	});
	#e = { ...e.defaultProps };
	#t = null;
	constructor(e) {
		e && this.setProps(e);
	}
	setProps(t) {
		this.#e = T(t, e.defaultProps);
	}
	getLabel(e) {
		return Pa(this.#e.label, e) || (e.fullscreen ? bo : yo);
	}
	getAttrs(e) {
		return {
			"aria-label": this.getLabel(e),
			"aria-disabled": e.disabled ? "true" : void 0,
			hidden: e.hidden ? "" : void 0
		};
	}
	setMedia(e) {
		this.#t = e;
	}
	getState() {
		let e = this.#t, t = e.fullscreenAvailability;
		return this.state.patch({
			fullscreen: e.isFullscreen,
			availability: t,
			disabled: this.#e.disabled || t !== "available",
			hidden: t !== "available"
		}), this.state.patch({ label: Rr(this.getLabel(this.state.current)) }), this.state.current;
	}
	async toggle(e) {
		if (this.setMedia(e), !this.getState().disabled) return e.isFullscreen ? e.exitFullscreen() : e.requestFullscreen();
	}
}, So = {
	fullscreen: "data-fullscreen",
	availability: "data-availability",
	disabled: "data-disabled",
	hidden: "data-hidden"
}, U = "status.", Co = {
	key: `${U}captionsOn`,
	text: "Captions on"
}, wo = {
	key: `${U}captionsOff`,
	text: "Captions off"
}, To = {
	key: `${U}paused`,
	text: "Paused"
}, Eo = {
	key: `${U}playing`,
	text: "Playing"
}, Do = {
	key: `${U}fullscreen`,
	text: "Fullscreen"
}, Oo = {
	key: `${U}pip`,
	text: "Picture in picture"
}, ko = {
	key: `${U}exitPip`,
	text: "Exit picture in picture"
}, Ao = {
	key: `${U}seekedTo`,
	text: "Seeked to {time}"
}, jo = "volume.", Mo = {
	key: `${jo}muted`,
	text: "Muted"
}, No = {
	key: `${jo}label`,
	text: "Volume"
}, Po = {
	key: `${jo}value`,
	text: "Volume {value}"
}, Fo = {
	muted: F(Mo),
	volume: F(No),
	captionsOn: F(Co),
	captionsOff: F(wo),
	paused: F(To),
	playing: F(Eo),
	fullscreen: F(Do),
	exitFullscreen: F(bo),
	pictureInPicture: F(Oo),
	exitPictureInPicture: F(ko)
};
function Io(e) {
	return {
		muted: e(Mo),
		volume: e(No),
		captionsOn: e(Co),
		captionsOff: e(wo),
		paused: e(To),
		playing: e(Eo),
		fullscreen: e(Do),
		exitFullscreen: e(bo),
		pictureInPicture: e(Oo),
		exitPictureInPicture: e(ko)
	};
}
// node_modules/@videojs/core/dist/default/i18n/text/buttons.js
var Lo = "buttons.", Ro = {
	key: `${Lo}play`,
	text: "Play"
}, zo = {
	key: `${Lo}pause`,
	text: "Pause"
}, Bo = {
	key: `${Lo}replay`,
	text: "Replay"
}, Vo = {
	key: `${Lo}mute`,
	text: "Mute"
}, Ho = {
	key: `${Lo}unmute`,
	text: "Unmute"
}, Uo = class e {
	static defaultProps = {
		label: "",
		disabled: !1
	};
	state = D({
		muted: !1,
		volumeLevel: "off",
		availability: "unavailable",
		hidden: !0,
		label: ""
	});
	#e = { ...e.defaultProps };
	#t = null;
	constructor(e) {
		e && this.setProps(e);
	}
	setProps(t) {
		this.#e = T(t, e.defaultProps);
	}
	getLabel(e) {
		return Pa(this.#e.label, e) || (e.muted ? Ho : Vo);
	}
	getAttrs(e) {
		return {
			"aria-label": this.getLabel(e),
			"aria-disabled": this.#e.disabled ? "true" : void 0
		};
	}
	setMedia(e) {
		this.#t = e;
	}
	getState() {
		let e = this.#t, t = e.mutedAvailability;
		return this.state.patch({
			muted: e.muted || e.volume === 0,
			volumeLevel: Wo(e),
			availability: t,
			hidden: t !== "available"
		}), this.state.patch({ label: Rr(this.getLabel(this.state.current)) }), this.state.current;
	}
	toggle(e) {
		this.#e.disabled || e.mutedAvailability !== "available" || e.setMuted(!(e.muted || e.volume === 0));
	}
};
function Wo(e) {
	return e.muted || e.volume === 0 ? "off" : e.volume < .5 ? "low" : e.volume < .75 ? "medium" : "high";
}
// node_modules/@videojs/core/dist/default/core/ui/mute-button/data.js
var Go = {
	muted: "data-muted",
	volumeLevel: "data-volume-level",
	availability: "data-availability",
	hidden: "data-hidden"
}, Ko = class e {
	static defaultProps = {
		label: "",
		disabled: !1
	};
	state = D({
		paused: !0,
		ended: !1,
		started: !1,
		label: ""
	});
	#e = { ...e.defaultProps };
	#t = null;
	constructor(e) {
		e && this.setProps(e);
	}
	setProps(t) {
		this.#e = T(t, e.defaultProps);
	}
	getLabel(e) {
		return Pa(this.#e.label, e) || (e.ended ? Bo : e.paused ? Ro : zo);
	}
	getAttrs(e) {
		return {
			"aria-label": this.getLabel(e),
			"aria-disabled": this.#e.disabled ? "true" : void 0
		};
	}
	setMedia(e) {
		this.#t = e;
	}
	getState() {
		let e = this.#t;
		return this.state.patch({
			paused: e.paused && !e.autoplaying,
			ended: e.ended,
			started: e.started || e.autoplaying
		}), this.state.patch({ label: Rr(this.getLabel(this.state.current)) }), this.state.current;
	}
	async toggle(e) {
		if (!this.#e.disabled) {
			if (e.paused && !e.autoplaying || e.ended) return e.play();
			e.pause();
		}
	}
}, qo = {
	paused: "data-paused",
	ended: "data-ended",
	started: "data-started"
}, Jo = {
	key: "playback.rate",
	text: "Playback rate, {rate}"
}, W = class e {
	static defaultProps = {
		side: "top",
		align: "center",
		modal: !1,
		closeOnEscape: !0,
		closeOnOutsideClick: !0,
		open: !1,
		defaultOpen: !1,
		openOnHover: !1,
		delay: 300,
		closeDelay: 0
	};
	#e = { ...e.defaultProps };
	constructor(e) {
		e && this.setProps(e);
	}
	setProps(t) {
		this.#e = T(t, e.defaultProps);
	}
	#t = null;
	setInput(e) {
		this.#t = e;
	}
	getState() {
		let e = this.#t;
		return {
			open: e.active,
			status: e.status,
			side: this.#e.side,
			align: this.#e.align,
			modal: this.#e.modal,
			...zi(e.status)
		};
	}
	getTriggerAttrs(e, t) {
		return {
			"aria-expanded": e.open && e.status !== "ending" ? "true" : "false",
			"aria-haspopup": "dialog",
			"aria-controls": t
		};
	}
	getPopupAttrs(e) {
		return {
			popover: "manual",
			role: "dialog",
			"aria-modal": e.modal === !0 ? "true" : void 0
		};
	}
}, Yo = {
	open: "data-open",
	side: "data-side",
	align: "data-align",
	...Ri
}, Xo = "data-popup", Zo = `[${Xo}]`, Qo = class {
	#e = null;
	#t = "none";
	setMedia(e) {
		this.#e = e;
	}
	setImageLoadState(e) {
		this.#t = e;
	}
	getState() {
		let e = this.#e;
		return {
			visible: !e.started,
			src: e.poster,
			loading: this.#t === "loading",
			loaded: this.#t === "loaded",
			error: this.#t === "error"
		};
	}
}, $o = {
	visible: "data-visible",
	loading: "data-loading",
	loaded: "data-loaded",
	error: "data-error"
}, es = /* @__PURE__ */ new Map();
function ts(e, t, n) {
	if (e === "digital") {
		let e = new Intl.NumberFormat(n, { useGrouping: !1 }), r = new Intl.NumberFormat(n, {
			minimumIntegerDigits: 2,
			useGrouping: !1
		});
		return { format: (n) => {
			let i = `${r.format(n.minutes ?? 0)}:${r.format(n.seconds ?? 0)}`;
			return t === "always" || n.hours !== void 0 ? `${e.format(n.hours ?? 0)}:${i}` : i;
		} };
	}
	let r = [
		["hours", new Intl.NumberFormat(n, {
			style: "unit",
			unit: "hour",
			unitDisplay: e
		})],
		["minutes", new Intl.NumberFormat(n, {
			style: "unit",
			unit: "minute",
			unitDisplay: e
		})],
		["seconds", new Intl.NumberFormat(n, {
			style: "unit",
			unit: "second",
			unitDisplay: e
		})]
	], i = typeof Intl.ListFormat == "function" ? new Intl.ListFormat(n, {
		type: "unit",
		style: e
	}) : { format: (t) => [...t].join(e === "narrow" ? " " : ", ") };
	return { format: (e) => i.format(r.filter(([t]) => e[t] !== void 0).map(([t, n]) => n.format(e[t] ?? 0))) };
}
function ns(e) {
	return e === void 0 ? "" : Array.isArray(e) ? e.join(":") : e;
}
function rs(e, t = "long", n) {
	let r = `${ns(e)}:${t}:${n ?? ""}`, i = es.get(r);
	return i || (i = ts(t, n, e), es.set(r, i)), i;
}
function is(e) {
	return h(e) && Number.isFinite(e);
}
function as(e, t) {
	if (!is(e)) return "";
	let { locale: n = "en", style: r = "long", formatRemaining: i } = t ?? {}, a = e < 0, o = Math.floor(Math.abs(e)), s = Math.floor(o / 3600), c = Math.floor(o % 3600 / 60), l = o % 60, u = {};
	s > 0 && (u.hours = s), c > 0 && (u.minutes = c), (l > 0 || s === 0 && c === 0) && (u.seconds = l);
	let d = rs(n, r).format(u);
	return a ? i ? i(d) : ot(n) ? `${d} remaining` : d : d;
}
// node_modules/@videojs/core/dist/default/core/ui/status-announcer/labels.js
var os = {
	...Fo,
	volumeWithValue: (e) => F(Po, { value: e }),
	seekedTo: (e) => F(Ao, { time: as(e) }),
	playbackRate: (e) => F(Jo, { rate: e })
};
function ss(e, t = "en") {
	return {
		...Io(e),
		volumeWithValue: (t) => e(Po, { value: t }),
		seekedTo: (n) => e(Ao, { time: as(n, { locale: t }) }),
		playbackRate: (t) => e(Jo, { rate: t })
	};
}
// node_modules/@videojs/core/dist/default/core/ui/volume-indicator/status.js
function cs(e) {
	return `${Math.round(pr(e, 0, 1) * 100)}%`;
}
// node_modules/@videojs/core/dist/default/core/ui/status-announcer/status.js
function ls(e, t, n = os) {
	let r = [];
	return ds(e.paused, t.paused) && r.push(t.paused ? n.paused : n.playing), ds(e.subtitlesShowing, t.subtitlesShowing) && t.subtitlesAvailable !== !1 && r.push(t.subtitlesShowing ? n.captionsOn : n.captionsOff), ds(e.isFullscreen, t.isFullscreen) && r.push(t.isFullscreen ? n.fullscreen : n.exitFullscreen), ds(e.isPictureInPicture, t.isPictureInPicture) && r.push(t.isPictureInPicture ? n.pictureInPicture : n.exitPictureInPicture), ds(e.playbackRate, t.playbackRate) && r.push(n.playbackRate(`${t.playbackRate}×`)), r.length > 0 ? r.join(". ") : null;
}
function us(e, t, n = os) {
	if (!ds(e.volume, t.volume) && !ds(e.muted, t.muted)) return null;
	let r = t.volume ?? e.volume, i = t.muted ?? e.muted;
	return r === void 0 && i === void 0 ? null : i || (r ?? 0) <= 0 ? n.muted : n.volumeWithValue(cs(r ?? 0));
}
function ds(e, t) {
	return e !== void 0 && t !== void 0 && !Object.is(e, t);
}
// node_modules/@videojs/core/dist/default/core/ui/status-announcer/core.js
var fs = 200, ps = class {
	state = D({
		generation: 0,
		label: null
	});
	#e = {};
	#t = null;
	#n = null;
	#r = null;
	#i = null;
	#a = new Bi(() => this.state.patch({ label: null }), () => Vi(this.#e));
	setProps(e) {
		this.#e = e;
	}
	resetSnapshot() {
		this.#t = null, this.#n = null, this.#r = null, this.#f(), this.#a.close();
	}
	destroy() {
		this.#f(), this.#a.destroy();
	}
	processSnapshot(e) {
		let t = this.#t;
		if (this.#t = e, !t) return !1;
		let n = this.#o(), r = ls(t, e, n), i = r !== null && this.#s(r), a = this.#l(t, e, n, i), o = this.#c(t, e, n, i || a);
		return i || a || o;
	}
	#o() {
		return {
			...os,
			...this.#e.labels
		};
	}
	#s(e) {
		return this.#f(), this.state.patch({
			generation: this.state.current.generation + 1,
			label: e
		}), this.#a.arm(), !0;
	}
	#c(e, t, n, r) {
		let i = us(e, t, n);
		return i === null || r || !this.#d() ? !1 : (this.#u(i), !0);
	}
	#l(e, t, n, r) {
		if (e.seeking !== !0 && t.seeking === !0) return this.#n = e.currentTime ?? null, this.#r = t.currentTime ?? null, this.#f(), !1;
		if (t.seeking === !0) return this.#r = t.currentTime ?? this.#r, !1;
		if (e.seeking !== !0 || t.seeking !== !1) return !1;
		let i = t.currentTime ?? this.#r, a = this.#n;
		return this.#n = null, this.#r = null, i == null || Object.is(i, a) || r || !this.#d() ? !1 : (this.#u(n.seekedTo(i)), !0);
	}
	#u(e) {
		this.#f(), this.#i = setTimeout(() => {
			this.#i = null, this.#d() && this.#s(e);
		}, fs);
	}
	#d() {
		return this.#e.shouldAnnounce?.() !== !1;
	}
	#f() {
		this.#i !== null && (clearTimeout(this.#i), this.#i = null);
	}
}, G = class e {
	static defaultProps = {
		side: "top",
		align: "center",
		open: !1,
		defaultOpen: !1,
		delay: 600,
		closeDelay: 0,
		disableHoverablePopup: !0,
		disabled: !1,
		sticky: !1
	};
	#e = { ...e.defaultProps };
	constructor(e) {
		e && this.setProps(e);
	}
	setProps(t) {
		this.#e = T(t, e.defaultProps);
	}
	#t = null;
	setInput(e) {
		this.#t = e;
	}
	getState() {
		let e = this.#t;
		return {
			open: e.active,
			status: e.status,
			side: this.#e.side,
			align: this.#e.align,
			...zi(e.status)
		};
	}
	getPopupAttrs(e) {
		return {
			popover: "manual",
			role: "presentation"
		};
	}
}, ms = {
	open: "data-open",
	side: "data-side",
	align: "data-align",
	...Ri
}, hs = class e {
	static defaultProps = {
		delay: 600,
		closeDelay: 0,
		timeout: 400
	};
	#e = { ...e.defaultProps };
	#t = 0;
	#n = !1;
	constructor(e) {
		e && this.setProps(e);
	}
	setProps(t) {
		this.#e = T(t, e.defaultProps);
	}
	get delay() {
		return this.#e.delay;
	}
	get closeDelay() {
		return this.#e.closeDelay;
	}
	shouldSkipDelay() {
		return this.#n ? !0 : Date.now() - this.#t < this.#e.timeout;
	}
	notifyOpen() {
		this.#n = !0;
	}
	notifyClose() {
		this.#n = !1, this.#t = Date.now();
	}
}, gs = {
	sideOffset: "--media-tooltip-side-offset",
	alignOffset: "--media-tooltip-align-offset",
	boundaryOffset: "--media-tooltip-boundary-offset",
	anchorWidth: "--media-tooltip-anchor-width",
	anchorHeight: "--media-tooltip-anchor-height",
	availableWidth: "--media-tooltip-available-width",
	availableHeight: "--media-tooltip-available-height"
}, _s = class extends W {
	static defaultProps = W.defaultProps;
	#e = null;
	setMedia(e) {
		this.#e = e;
	}
	getState() {
		let e = this.#e.volumeAvailability;
		return {
			...super.getState(),
			availability: e,
			hidden: e !== "available"
		};
	}
}, vs = {
	open: "data-open",
	side: "data-side",
	align: "data-align",
	transitionStarting: "data-starting-style",
	transitionEnding: "data-ending-style",
	availability: "data-availability",
	hidden: "data-hidden"
}, ys = {
	key: "container.label",
	text: "Media player"
};
// node_modules/@videojs/html/dist/default/define/ui/container.js
e(class extends M {
	static {
		this.tagName = "media-container";
	}
	#e = null;
	#t = null;
	#n = null;
	#r = new Ka();
	#i = new O(this, u, ri);
	#a = new Ma(this, ka);
	#o = Ji();
	#s = new o(this, {
		context: Na,
		initialValue: this.#o
	});
	#c = new c(this, {
		context: f,
		callback: (e) => this.#l(e)
	});
	connectedCallback() {
		super.connectedCallback(), this.#s.setValue(this.#o), this.#l(this.#c.value), Pi(this), this.#u(), this.#t = new AbortController(), k(this, "pointerup", this.#d, { signal: this.#t.signal });
	}
	disconnectedCallback() {
		this.#e?.(), this.#e = null, this.#t?.abort(), this.#t = null, super.disconnectedCallback();
	}
	update(e) {
		super.update(e), this.#u();
		let t = this.#i.value;
		t ? (this.#r.setMedia(t), V(this, this.#r.getState(), qa)) : this.removeAttribute(qa.controlsVisible);
	}
	#l(e) {
		this.#e?.(), this.#e = null, this.isConnected && e && (this.#e = e.registerContainer(this));
	}
	#u() {
		let e = this.getAttribute("aria-label");
		if (e && e !== this.#n) return;
		if (this.hasAttribute("aria-labelledby")) {
			e === this.#n && (this.removeAttribute("aria-label"), this.#n = null);
			return;
		}
		let t = this.#a.value(ys);
		this.setAttribute("aria-label", t), this.#n = t;
	}
	#d = () => {
		Fi(this);
	};
});
// node_modules/@videojs/html/dist/default/ui/poster/element.js
var bs = ":host {\n  display: block;\n}\nimg {\n  display: block;\n  width: 100%;\n  height: 100%;\n  object-fit: var(--media-object-fit, contain);\n  object-position: var(--media-object-position, center);\n}\nimg:not([src]) {\n  visibility: hidden;\n}";
function xs(e) {
	if (e.hasAttribute("src") || e.hasAttribute("srcset")) return !0;
	let t = e.parentElement;
	return t?.localName === "picture" && t.querySelector("source") !== null;
}
function Ss(e) {
	return !!e.getAttribute("src") || e.hasAttribute("srcset");
}
function Cs() {
	let e = document.createElement("img");
	return e.alt = "", e.setAttribute("part", "image"), e.setAttribute("decoding", "async"), e;
}
// node_modules/@videojs/html/dist/default/define/ui/poster.js
e(class extends M {
	static {
		this.tagName = "media-poster";
	}
	#e = new Qo();
	#t = this.attachShadow({ mode: "open" });
	#n = Cs();
	#r = new MutationObserver(() => this.requestUpdate());
	#i = new O(this, u, ci);
	#a = new O(this, u, oi);
	#o = null;
	#s = !1;
	#c = "pending";
	#l = null;
	#u = null;
	constructor() {
		super();
		let e = document.createElement("style");
		e.textContent = bs, this.#t.append(e, document.createElement("slot"), this.#n);
	}
	connectedCallback() {
		if (super.connectedCallback(), this.destroyed) return;
		this.#u = new AbortController();
		let { signal: e } = this.#u;
		this.addEventListener("slotchange", () => this.requestUpdate(), { signal: e }), this.#r.observe(this, {
			childList: !0,
			subtree: !0
		});
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.#f(null), this.#r.disconnect(), this.#u?.abort(), this.#u = null;
	}
	get #d() {
		return !this.#o || !xs(this.#o) ? "none" : this.#c === "pending" ? "loading" : this.#c;
	}
	update(e) {
		super.update(e);
		let t = this.#i.value;
		if (!t) return;
		this.#e.setMedia({
			started: t.started,
			poster: this.#a.value?.poster ?? ""
		});
		let { src: n } = this.#e.getState();
		this.#f(De(this, Ne) ?? this.#n), this.#p(n), this.#e.setImageLoadState(this.#d), V(this, this.#e.getState(), $o);
	}
	#f(e) {
		if (e === this.#o || (this.#s && this.#o?.removeAttribute("src"), this.#l?.abort(), this.#l = null, this.#o = e, this.#s = e !== null && !xs(e), this.#c = "pending", e === this.#n ? this.#t.append(this.#n) : e && this.#n.remove(), !e)) return;
		e.naturalWidth > 0 ? this.#c = "loaded" : e.complete && Ss(e) && (this.#c = "error"), this.#l = new AbortController();
		let { signal: t } = this.#l, n = (e) => () => {
			this.#c = e, this.requestUpdate();
		};
		e.addEventListener("load", n("loaded"), { signal: t }), e.addEventListener("error", n("error"), { signal: t });
	}
	#p(e) {
		let t = this.#o;
		t && this.#s && (e ? t.getAttribute("src") !== e && (this.#c = "pending", t.setAttribute("src", e)) : (this.#c = "pending", t.removeAttribute("src")));
	}
});
// node_modules/@videojs/html/dist/default/ui/controls/context.js
var ws = n(Symbol("@videojs/controls"));
// node_modules/@videojs/html/dist/default/define/ui/controls.js
e(class extends M {
	constructor(...e) {
		super(...e), this.visibility = Ja.defaultProps.visibility, this.#e = new Ja(), this.#t = new O(this, u, ri), this.#n = new o(this, { context: ws }), this.#r = !0;
	}
	static {
		this.tagName = "media-controls";
	}
	static {
		this.properties = { visibility: { type: String } };
	}
	#e;
	#t;
	#n;
	#r;
	connectedCallback() {
		super.connectedCallback();
	}
	update(e) {
		super.update(e), this.#e.setProps({ visibility: this.visibility }), this.#e.setMedia(this.#t.value ?? null);
		let t = this.#e.getState();
		if (!t) return;
		V(this, t, Ya), this.#n.setValue({
			state: t,
			stateAttrMap: Ya
		});
		let n = this.#r;
		this.#r = t.visible, n && !t.visible && this.#i();
	}
	#i() {
		for (let e of this.querySelectorAll(Zo)) {
			let t = e;
			_(t.close) && t.close("imperative-action");
		}
	}
});
// node_modules/@videojs/html/dist/default/ui/context-part-element.js
var Ts = class extends M {
	connectedCallback() {
		super.connectedCallback(), this.#e();
	}
	update(e) {
		super.update(e), this.#e();
	}
	#e() {
		let e = this.consumer.value;
		e && V(this, e.state, e.stateAttrMap);
	}
};
// node_modules/@videojs/html/dist/default/define/ui/controls-group.js
e(class extends Ts {
	constructor(...e) {
		super(...e), this.consumer = new c(this, {
			context: ws,
			subscribe: !0
		});
	}
	static {
		this.tagName = "media-controls-backdrop";
	}
	connectedCallback() {
		super.connectedCallback(), this.setAttribute("role", "presentation"), this.setAttribute("aria-hidden", "true");
	}
}), e(class extends Ts {
	constructor(...e) {
		super(...e), this.consumer = new c(this, {
			context: ws,
			subscribe: !0
		});
	}
	static {
		this.tagName = "media-controls-content";
	}
	connectedCallback() {
		super.connectedCallback(), this.setAttribute("data-interactive", "");
	}
}), e(class extends Ts {
	constructor(...e) {
		super(...e), this.consumer = new c(this, {
			context: ws,
			subscribe: !0
		});
	}
	static {
		this.tagName = "media-controls-group";
	}
	connectedCallback() {
		super.connectedCallback(), (this.hasAttribute("aria-label") || this.hasAttribute("aria-labelledby")) && this.setAttribute("role", "group");
	}
});
// node_modules/@videojs/html/dist/default/ui/hotkey/aria-key-shortcuts-controller.js
var Es = class {
	#e;
	#t;
	#n;
	#r;
	#i = null;
	constructor(e, t, n = {}) {
		this.#e = e, this.#t = t, this.#n = n.value, this.#r = new c(e, {
			context: f,
			callback: (e) => this.#a(e?.container),
			subscribe: !0
		}), e.addController(this);
	}
	get value() {
		return this.aria;
	}
	get aria() {
		return this.details.aria;
	}
	get shortcut() {
		return this.details.shortcut;
	}
	get details() {
		let e = this.#r.value?.container;
		return e ? Oi(e).getShortcut(this.#t, this.#n?.()) : {};
	}
	hostConnected() {
		this.#a(this.#r.value?.container);
	}
	hostDisconnected() {
		this.#o();
	}
	#a(e) {
		if (this.#o(), !e) return;
		let t = Oi(e), n = () => {
			this.#e.requestUpdate();
		};
		this.#i = t.subscribeShortcutChanges(n), n();
	}
	#o() {
		this.#i?.(), this.#i = null;
	}
}, Ds = class extends M {
	constructor(...e) {
		super(...e), this.disabled = !1, this.label = "", this.hotkeyAction = void 0, this.#e = null, this.#t = null, this.#r = new Ma(this, ka);
	}
	static {
		this.properties = {
			label: { type: String },
			disabled: { type: Boolean }
		};
	}
	getIsButtonDisabled() {
		return this.disabled || !this.mediaState.value;
	}
	handleActivate(e, t) {
		Promise.resolve(this.activate(this.mediaState.value, e, t)).catch((e) => {});
	}
	get hotkeyValue() {}
	get $state() {
		return this.core.state;
	}
	#e;
	#t;
	#n;
	#r;
	connectedCallback() {
		if (super.connectedCallback(), this.destroyed) return;
		this.hotkeyAction && !this.#t && (this.#t = new Es(this, this.hotkeyAction, { value: () => this.hotkeyValue })), this.#e = new AbortController();
		let e = Mi({
			onActivate: (e, t) => this.handleActivate(e, t),
			isDisabled: () => this.getIsButtonDisabled()
		});
		B(this, e, { signal: this.#e.signal });
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.#e?.abort(), this.#e = null;
	}
	getLabel() {
		return this.core.state.current.label ? Rr(this.core.state.current.label) : void 0;
	}
	getShortcut() {
		return this.#t?.shortcut;
	}
	getResolvedLabel() {
		let e = this.mediaState.value;
		if (!e) return;
		this.core.setMedia(e);
		let t = this.core.getState();
		return this.core.getTooltipLabel ? F(this.core.getTooltipLabel(t), this.#r.value) : F(this.core.getLabel(t), this.#r.value, this.core.getLabelParams?.(t));
	}
	willUpdate(e) {
		super.willUpdate(e), this.core.setProps?.(this);
	}
	update(e) {
		super.update(e);
		let t = this.mediaState.value;
		if (this.#i(), !t) return;
		this.core.setMedia(t);
		let n = this.core.getState(), r = this.core.getAttrs?.(n) ?? {};
		zr(r["aria-label"]) && (r["aria-label"] = F(r["aria-label"], this.#r.value, this.core.getLabelParams?.(n))), B(this, {
			...r,
			"aria-keyshortcuts": this.#t?.aria,
			...Os(n) && this.reflectsHidden() && { hidden: n.hidden ? "" : void 0 }
		}), V(this, n, this.stateAttrMap);
		for (let [e, t] of Object.entries(this.core.getCSSVars?.(n) ?? {})) this.style.setProperty(e, t);
	}
	reflectsHidden() {
		return !0;
	}
	#i() {
		let e = this.getShortcut();
		e !== this.#n && (this.#n = e, this.dispatchEvent(new CustomEvent(Ai)));
	}
};
function Os(e) {
	return S(e) && g(e.hidden);
}
// node_modules/@videojs/html/dist/default/define/ui/mute-button.js
e(class extends Ds {
	constructor(...e) {
		super(...e), this.core = new Ko(), this.stateAttrMap = qo, this.mediaState = new O(this, u, ci), this.hotkeyAction = "togglePaused";
	}
	static {
		this.tagName = "media-play-button";
	}
	activate(e) {
		return this.core.toggle(e);
	}
}), e(class extends Ds {
	constructor(...e) {
		super(...e), this.core = new Uo(), this.stateAttrMap = Go, this.mediaState = new O(this, u, L), this.hotkeyAction = "toggleMuted";
	}
	static {
		this.tagName = "media-mute-button";
	}
	activate(e) {
		this.core.toggle(e);
	}
});
// node_modules/@videojs/html/dist/default/ui/position-controller.js
var ks = 0, As = class {
	#e;
	#t = new fa();
	#n = null;
	constructor(e) {
		this.#e = e, e.addController(this);
	}
	findTrigger(e) {
		let t = this.#e.getRootNode();
		if (t.nodeType !== Node.DOCUMENT_NODE && t.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return this.#r(), null;
		let n = t;
		if (e) return this.#r(), n.getElementById(e);
		if (this.#n) {
			let { id: e, trigger: t } = this.#n;
			if (this.#e.id === e && t.getAttribute("commandfor") === e && this.#e.previousElementSibling === t) return t;
			this.#r();
		}
		if (this.#e.id) return n.querySelector(`[commandfor="${this.#e.id}"]`);
		let r = this.#e.previousElementSibling;
		if (!(r instanceof HTMLElement) || r.getAttribute("commandfor")) return null;
		let i = js(n);
		return this.#e.id = i, r.setAttribute("commandfor", i), this.#n = {
			id: i,
			trigger: r
		}, r;
	}
	sync(e) {
		this.#t.sync({
			...e,
			popup: this.#e
		});
	}
	cleanup() {
		this.#t.cleanup();
	}
	hostDisconnected() {
		this.cleanup(), this.#r();
	}
	hostDestroyed() {
		this.cleanup(), this.#r();
	}
	#r() {
		let e = this.#n;
		e && (e.trigger.getAttribute("commandfor") === e.id && e.trigger.removeAttribute("commandfor"), this.#e.id === e.id && this.#e.removeAttribute("id"), this.#n = null);
	}
};
function js(e) {
	let t;
	do
		t = `vjs-popup-${++ks}`;
	while (e.getElementById(t));
	return t;
}
// node_modules/@videojs/html/dist/default/ui/popover/element.js
var Ms = class extends M {
	constructor(...e) {
		super(...e), this.open = W.defaultProps.open, this.defaultOpen = W.defaultProps.defaultOpen, this.side = W.defaultProps.side, this.align = W.defaultProps.align, this.modal = W.defaultProps.modal, this.closeOnEscape = W.defaultProps.closeOnEscape, this.closeOnOutsideClick = W.defaultProps.closeOnOutsideClick, this.openOnHover = W.defaultProps.openOnHover, this.delay = W.defaultProps.delay, this.closeDelay = W.defaultProps.closeDelay, this.boundary = "container", this.#e = new W(), this.#t = new c(this, {
			context: f,
			subscribe: !0
		}), this.#n = new c(this, { context: Na }), this.#r = new As(this), this.#i = null, this.#a = null, this.#o = null, this.#s = null, this.#c = null;
	}
	static {
		this.tagName = "media-popover";
	}
	static {
		this.properties = {
			open: { type: Boolean },
			defaultOpen: {
				type: Boolean,
				attribute: "default-open"
			},
			side: { type: String },
			align: { type: String },
			modal: { type: Boolean },
			closeOnEscape: {
				type: Boolean,
				attribute: "close-on-escape"
			},
			closeOnOutsideClick: {
				type: Boolean,
				attribute: "close-on-outside-click"
			},
			openOnHover: {
				type: Boolean,
				attribute: "open-on-hover"
			},
			delay: { type: Number },
			closeDelay: {
				type: Number,
				attribute: "close-delay"
			},
			boundary: { type: String }
		};
	}
	#e;
	#t;
	#n;
	#r;
	#i;
	#a;
	#o;
	#s;
	#c;
	connectedCallback() {
		super.connectedCallback(), this.destroyed || (this.setAttribute(Xo, ""), this.#o = new AbortController(), this.#i = qi({
			transition: va(),
			onOpenChange: (e, t) => {
				this.open = e, this.dispatchEvent(new CustomEvent("open-change", { detail: {
					open: e,
					...t
				} }));
			},
			closeOnEscape: () => this.closeOnEscape,
			closeOnOutsideClick: () => this.closeOnOutsideClick,
			openOnHover: () => this.openOnHover,
			delay: () => this.delay,
			closeDelay: () => this.closeDelay,
			group: () => this.#n.value
		}), this.#i.setPopupElement(this), B(this, this.#i.popupProps, { signal: this.#o.signal }), this.#a ? this.#a.track(this.#i.input) : this.#a = new ie(this, this.#i.input));
	}
	firstUpdated(e) {
		super.firstUpdated(e), this.defaultOpen && !this.open && this.#i?.open();
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.#o?.abort(), this.#o = null;
	}
	destroyCallback() {
		this.#u(), this.#i?.destroy(), super.destroyCallback();
	}
	close(e = "imperative-action") {
		this.#i?.close(e);
	}
	get triggerElement() {
		return this.#c;
	}
	willUpdate(e) {
		if (super.willUpdate(e), this.#e.setProps(this), this.#i && e.has("open")) {
			let { active: e } = this.#i.input.current;
			this.open !== e && (this.open ? this.#i.open() : this.#i.close());
		}
	}
	update(e) {
		if (super.update(e), !this.#i) return;
		let t = this.#r.findTrigger();
		this.#l(t);
		let n = this.#i.input.current;
		this.#e.setInput(n);
		let r = this.#e.getState();
		B(this, this.#e.getPopupAttrs(r)), V(this, r, Yo), r.open ? pt(this) : mt(this), this.#c && B(this.#c, this.#e.getTriggerAttrs(r, this.id)), r.open ? this.#r.sync({
			anchorName: this.id,
			position: {
				side: r.side,
				align: r.align
			},
			trigger: this.#c,
			boundary: this.boundary,
			container: this.#t.value?.container ?? null,
			onSideChange: (e) => this.setAttribute(Yo.side, e)
		}) : this.#r.cleanup();
	}
	#l(e) {
		e !== this.#c && (this.#r.cleanup(), this.#u(), this.#c = e, this.#i?.setTriggerElement(e), e && this.#i && (this.#s = new AbortController(), B(e, this.#i.triggerProps, { signal: this.#s.signal })));
	}
	#u() {
		this.#c && B(this.#c, {
			"aria-expanded": void 0,
			"aria-haspopup": void 0,
			"aria-controls": void 0
		}), this.#s?.abort(), this.#s = null, this.#c = null;
	}
}, Ns = {
	volume: 0,
	muted: !1,
	volumeAvailability: "unsupported",
	mutedAvailability: "unsupported",
	setVolume: () => 0,
	setMuted: () => !1
};
// node_modules/@videojs/html/dist/default/define/ui/fullscreen-button.js
e(class extends Ms {
	static {
		this.tagName = "media-volume-popover";
	}
	#e = new _s();
	#t = new O(this, u, L);
	update(e) {
		super.update(e), this.#e.setProps(this), this.#e.setInput({
			active: this.hasAttribute("data-open"),
			status: this.hasAttribute("data-starting-style") ? "starting" : this.hasAttribute("data-ending-style") ? "ending" : "idle"
		}), this.#e.setMedia(this.#t.value ?? Ns);
		let t = this.#e.getState();
		V(this, t, vs), this.hidden = t.hidden, t.hidden && (this.close(), this.triggerElement && B(this.triggerElement, {
			"aria-expanded": void 0,
			"aria-haspopup": void 0,
			"aria-controls": void 0
		}));
	}
}), e(class extends Ds {
	constructor(...e) {
		super(...e), this.core = new xo(), this.stateAttrMap = So, this.mediaState = new O(this, u, ai), this.hotkeyAction = "toggleFullscreen", this.#e = new c(this, {
			context: f,
			subscribe: !0
		});
	}
	static {
		this.tagName = "media-fullscreen-button";
	}
	#e;
	activate(e, t, n) {
		return n === "pointer" && this.#e.value?.container?.focus({ preventScroll: !0 }), this.core.toggle(e);
	}
});
// node_modules/@videojs/html/dist/default/ui/command-for.js
function Ps(e, t) {
	let n = e.getRootNode(), r = ("getElementById" in n ? n.getElementById(t) : null) ?? n.querySelector(`#${CSS.escape(t)}`);
	if (!r || !("open" in r)) return;
	let i = r;
	i.open = !i.open;
}
// node_modules/@videojs/html/dist/default/ui/captions-button/element.js
function Fs(e) {
	return e.textTrackList.filter(vt).length;
}
// node_modules/@videojs/html/dist/default/define/ui/buffering-indicator.js
e(class extends Ds {
	constructor(...e) {
		super(...e), this.commandfor = void 0, this.menuFor = void 0, this.#e = void 0, this.core = new Ua(), this.stateAttrMap = Ga, this.mediaState = new O(this, u, ui), this.hotkeyAction = "toggleSubtitles";
	}
	static {
		this.tagName = "media-captions-button";
	}
	static {
		this.properties = {
			label: { type: String },
			disabled: { type: Boolean },
			commandfor: { type: String },
			menuFor: {
				type: String,
				attribute: "menu-for"
			}
		};
	}
	#e;
	connectedCallback() {
		super.connectedCallback(), this.commandfor && this.commandfor !== this.menuFor && (this.#e = this.commandfor);
	}
	activate(e, t) {
		this.menuFor && Fs(e) > 1 ? t instanceof KeyboardEvent && Ps(this, this.menuFor) : this.core.toggle(e);
	}
	getIsButtonDisabled() {
		let e = this.mediaState.value;
		return !!(super.getIsButtonDisabled() || e && Fs(e) === 0);
	}
	willUpdate(e) {
		super.willUpdate(e), e.has("commandfor") && this.commandfor !== this.menuFor && (this.#e = this.commandfor), (e.has("commandfor") || e.has("menuFor")) && this.#t();
	}
	update(e) {
		super.update(e);
		let t = this.mediaState.value;
		t && (this.#t(t), this.menuFor && Fs(t) > 1 && B(this, { "aria-disabled": this.getIsButtonDisabled() ? "true" : void 0 }));
	}
	#t(e) {
		let t = e ?? this.mediaState.value, n = t && this.menuFor && Fs(t) > 1 ? this.menuFor : this.#e;
		n ? this.setAttribute("commandfor", n) : this.removeAttribute("commandfor");
	}
}), e(class extends M {
	constructor(...e) {
		super(...e), this.delay = Ra.defaultProps.delay, this.#e = new Ra(), this.#t = new O(this, u, ci), this.#n = null;
	}
	static {
		this.tagName = "media-buffering-indicator";
	}
	static {
		this.properties = { delay: { type: Number } };
	}
	#e;
	#t;
	#n;
	connectedCallback() {
		super.connectedCallback(), this.destroyed || (this.#n = new AbortController(), this.#e.state.subscribe(() => this.requestUpdate(), { signal: this.#n.signal }));
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.#n?.abort(), this.#n = null;
	}
	destroyCallback() {
		this.#e.destroy(), super.destroyCallback();
	}
	willUpdate(e) {
		super.willUpdate(e), this.#e.setProps(this);
	}
	update(e) {
		super.update(e);
		let t = this.#t.value;
		t && (this.#e.update(t), V(this, this.#e.state.current, za));
	}
});
// node_modules/@videojs/html/dist/default/ui/tooltip/context.js
var Is = n(Symbol("@videojs/tooltip-group"));
// node_modules/@videojs/html/dist/default/define/ui/tooltip-group.js
e(class extends M {
	constructor(...e) {
		super(...e), this.delay = hs.defaultProps.delay, this.closeDelay = hs.defaultProps.closeDelay, this.timeout = hs.defaultProps.timeout, this.#e = new hs(), this.#t = new o(this, {
			context: Is,
			initialValue: this.#e
		});
	}
	static {
		this.tagName = "media-tooltip-group";
	}
	static {
		this.properties = {
			delay: { type: Number },
			closeDelay: {
				type: Number,
				attribute: "close-delay"
			},
			timeout: { type: Number }
		};
	}
	#e;
	#t;
	update(e) {
		super.update(e), this.#e.setProps(this), this.#t.setValue(this.#e);
	}
});
// node_modules/@videojs/html/dist/default/ui/tooltip/label.js
function Ls(e) {
	return Array.from(e.childNodes).some((e) => !!e.textContent?.trim());
}
var Rs = class e extends M {
	static {
		this.tagName = "media-tooltip-label";
	}
	#e = !1;
	static findIn(t) {
		return t.querySelector(e.tagName);
	}
	static create() {
		return document.createElement(e.tagName);
	}
	connectedCallback() {
		this.#e ||= Ls(this), super.connectedCallback();
	}
	setSyncedText(e) {
		this.#e || (this.textContent = e);
	}
}, zs = class e extends M {
	static {
		this.tagName = "media-tooltip-shortcut";
	}
	static findIn(t) {
		return t.querySelector(e.tagName);
	}
	static create() {
		return document.createElement(e.tagName);
	}
	setSyncedShortcut(e) {
		e ? (this.textContent = e, this.hidden = !1) : (this.textContent = "", this.hidden = !0);
	}
};
// node_modules/@videojs/html/dist/default/ui/tooltip/element.js
function Bs(e) {
	return "$state" in e;
}
// node_modules/@videojs/html/dist/default/define/ui/status-announcer.js
e(class extends M {
	constructor(...e) {
		super(...e), this.open = G.defaultProps.open, this.defaultOpen = G.defaultProps.defaultOpen, this.side = G.defaultProps.side, this.align = G.defaultProps.align, this.delay = G.defaultProps.delay, this.closeDelay = G.defaultProps.closeDelay, this.disableHoverablePopup = G.defaultProps.disableHoverablePopup, this.disabled = G.defaultProps.disabled, this.sticky = G.defaultProps.sticky, this.boundary = "container", this.trigger = "", this.#e = new G(), this.#t = new Ma(this, ka), this.#n = new c(this, { context: Is }), this.#r = new c(this, {
			context: f,
			subscribe: !0
		}), this.#i = new c(this, { context: Na }), this.#a = new As(this), this.#o = null, this.#s = null, this.#c = null, this.#l = null, this.#u = null;
	}
	static {
		this.tagName = "media-tooltip";
	}
	static {
		this.properties = {
			open: { type: Boolean },
			defaultOpen: {
				type: Boolean,
				attribute: "default-open"
			},
			side: { type: String },
			align: { type: String },
			delay: { type: Number },
			closeDelay: {
				type: Number,
				attribute: "close-delay"
			},
			disableHoverablePopup: {
				type: Boolean,
				attribute: "disable-hoverable-popup"
			},
			disabled: { type: Boolean },
			sticky: { type: Boolean },
			boundary: { type: String },
			trigger: { type: String }
		};
	}
	#e;
	#t;
	#n;
	#r;
	#i;
	#a;
	#o;
	#s;
	#c;
	#l;
	#u;
	connectedCallback() {
		super.connectedCallback(), this.destroyed || (this.setAttribute(Xo, ""), this.#c = new AbortController(), this.#o = _a({
			transition: va(),
			onOpenChange: (e, t) => {
				this.open = e, this.dispatchEvent(new CustomEvent("open-change", { detail: {
					open: e,
					...t
				} }));
			},
			delay: () => this.delay,
			closeDelay: () => this.closeDelay,
			disableHoverablePopup: () => this.disableHoverablePopup,
			disabled: () => this.disabled,
			sticky: () => this.sticky,
			group: () => this.#n.value,
			popupGroup: () => this.#i.value
		}), this.#o.setPopupElement(this), B(this, this.#o.popupProps, { signal: this.#c.signal }), this.#s ? this.#s.track(this.#o.input) : this.#s = new ie(this, this.#o.input));
	}
	firstUpdated(e) {
		super.firstUpdated(e), this.defaultOpen && !this.open && this.#o?.open();
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.#m(), this.#o?.destroy(), this.#o = null, this.#c?.abort(), this.#c = null;
	}
	close(e = "imperative-action") {
		this.#o?.close(e);
	}
	willUpdate(e) {
		if (super.willUpdate(e), this.#e.setProps(this), this.#o && e.has("open")) {
			let { active: e } = this.#o.input.current;
			this.open !== e && (this.open ? this.#o.open() : this.#o.close());
		}
	}
	update(e) {
		if (super.update(e), !this.#o) return;
		let t = this.#a.findTrigger(this.trigger);
		this.#d(t), this.#u && Bs(this.#u) && this.#f(this.#u);
		let n = this.#o.input.current;
		this.#e.setInput(n);
		let r = this.#e.getState();
		B(this, this.#e.getPopupAttrs(r)), V(this, r, ms), r.open ? pt(this) : mt(this), r.open ? this.#a.sync({
			anchorName: this.id,
			position: {
				side: r.side,
				align: r.align
			},
			trigger: this.#u,
			boundary: this.boundary,
			container: this.#r.value?.container ?? null,
			cssVars: gs,
			onSideChange: (e) => this.setAttribute(ms.side, e)
		}) : this.#a.cleanup();
	}
	#d(e) {
		e !== this.#u && (this.#a.cleanup(), this.#m(), this.#u = e, this.#o?.setTriggerElement(e), e && this.#o && (this.#l = new AbortController(), B(e, this.#o.triggerProps, { signal: this.#l.signal }), Bs(e) && (this.#f(e), e.$state.subscribe(() => this.#f(e), { signal: this.#l.signal }), k(e, Ai, () => this.#f(e), { signal: this.#l.signal }))));
	}
	#f(e) {
		let t = e.getLabel(), n = _(e.getResolvedLabel) ? e.getResolvedLabel() : void 0;
		n === void 0 && t && (n = F(t, this.#t.value));
		let r = e.getShortcut?.(), i = Rs.findIn(this), a = zs.findIn(this);
		if (!i && !a) {
			if (this.#p()) return;
			i = Rs.create(), a = zs.create(), this.replaceChildren(i, a);
		}
		i?.setSyncedText(n ?? ""), a?.setSyncedShortcut(r);
	}
	#p() {
		return Array.from(this.childNodes).some((e) => !!e.textContent?.trim());
	}
	#m() {
		this.#l?.abort(), this.#l = null, this.#u = null;
	}
}), e(Rs), e(zs), e(class extends M {
	constructor(...e) {
		super(...e), this.keys = "", this.action = "", this.value = void 0, this.disabled = !1, this.target = "player", this.#e = new O(this, u), this.#t = new c(this, {
			context: f,
			callback: () => this.requestUpdate(),
			subscribe: !0
		}), this.#n = null;
	}
	static {
		this.tagName = "media-hotkey";
	}
	static {
		this.properties = {
			keys: { type: String },
			action: { type: String },
			value: { type: Number },
			disabled: { type: Boolean },
			target: { type: String }
		};
	}
	#e;
	#t;
	#n;
	connectedCallback() {
		super.connectedCallback(), this.style.display = "none", this.#r();
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.#i();
	}
	update(e) {
		super.update(e), this.isConnected && (this.#i(), this.#r());
	}
	#r() {
		let e = this.#e.value, t = this.#t.value?.container;
		if (!this.keys || !this.action || !e || !t) return;
		let n = hi(this.action);
		if (!n) return;
		let { value: r, action: i } = this;
		this.#n = ki(t, {
			keys: this.keys,
			action: i,
			value: r,
			target: this.target,
			disabled: this.disabled,
			repeatable: !pi(i),
			onActivate: (t, i) => {
				n({
					store: e,
					key: i,
					value: r
				});
			}
		});
	}
	#i() {
		this.#n?.(), this.#n = null;
	}
}), e(class extends M {
	static {
		this.tagName = "media-status-announcer";
	}
	static {
		this.properties = { closeDelay: {
			type: Number,
			attribute: "close-delay"
		} };
	}
	#e = new Ma(this, ka);
	#t = new ps();
	#n = null;
	#r = new c(this, {
		context: u,
		callback: (e) => this.#s(e),
		subscribe: !0
	});
	#i = new c(this, {
		context: f,
		subscribe: !0
	});
	#a = null;
	#o = null;
	connectedCallback() {
		super.connectedCallback(), this.destroyed || (this.setAttribute("role", "status"), this.#c(), this.#a = new AbortController(), this.#t.state.subscribe(() => this.requestUpdate(), { signal: this.#a.signal }), this.#s());
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.#n?.(), this.#n = null, this.#a?.abort(), this.#a = null;
	}
	destroyCallback() {
		this.#n?.(), this.#t.destroy(), super.destroyCallback();
	}
	willUpdate(e) {
		super.willUpdate(e), this.#t.setProps({
			closeDelay: this.closeDelay,
			labels: ss(this.#e.value, this.#e.locale),
			shouldAnnounce: () => ha(this.#i.value?.container)
		});
	}
	update(e) {
		super.update(e);
		let t = this.#t.state.current.label, n = this.#c();
		t === null ? n.replaceChildren() : n.replaceChildren(document.createTextNode(t));
	}
	#s(e = this.#r.value) {
		this.#n?.(), this.#n = null, e ? this.#n = ma(e, this.#t) : this.#t.resetSnapshot();
	}
	#c() {
		if (this.#o?.isConnected) return this.#o;
		let e = this.querySelector("[data-status-announcer-content]");
		return this.#o = e ?? document.createElement("span"), this.#o.setAttribute("data-status-announcer-content", ""), e || this.append(this.#o), this.#o;
	}
});
// node_modules/@videojs/html/dist/default/ui/dialog/context.js
var Vs = n(Symbol("@videojs/dialog")), Hs = 0;
function Us(e) {
	return Array.from(e.childNodes).some((e) => !!e.textContent?.trim());
}
// node_modules/@videojs/html/dist/default/define/ui/dialog-close.js
e(class extends M {
	static {
		this.tagName = "media-error-dialog";
	}
	#e = new Xa();
	#t = new o(this, { context: Vs });
	#n = `vjs-error-dialog-popup-${Hs++}`;
	#r = `vjs-error-dialog-title-${Hs++}`;
	#i = `vjs-error-dialog-desc-${Hs++}`;
	#a = new O(this, u, ii);
	#o = new Ma(this, ka);
	#s = new c(this, {
		context: f,
		subscribe: !0
	});
	#c = null;
	#l = null;
	#u = null;
	#d = null;
	#f = null;
	#p = /* @__PURE__ */ new WeakSet();
	#m = /* @__PURE__ */ new WeakSet();
	constructor() {
		super(), this.#e.setTitleId(this.#r), this.#e.setDescriptionId(this.#i);
	}
	connectedCallback() {
		super.connectedCallback(), this.destroyed || (this.#c = Li({
			transition: va(),
			onOpenChange: (e) => {
				e || this.#a.value?.dismissError();
			}
		}), this.#l ? this.#l.track(this.#c.input) : this.#l = new ie(this, this.#c.input), this.#u ? this.#u.track(this.#c.modality) : this.#u = new ie(this, this.#c.modality));
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.#c?.destroy(), this.#c = null;
	}
	willUpdate(e) {
		if (super.willUpdate(e), !this.#c) return;
		this.#c.setInteractionRoot(this.#s.value?.container ?? null);
		let t = this.#a.value, n = !!t?.error, { active: r } = this.#c.input.current;
		t?.error && (this.#d = t.error);
		let i = t?.error ?? (r ? this.#d : null);
		this.#h(i), !n && !r && (this.#d = null, this.#f = null), n && !r ? this.#c.open() : !n && r && this.#c.close();
	}
	update(e) {
		if (super.update(e), !this.#c) return;
		let t = this.#c.input.current;
		this.#e.setInput(t), this.#e.setDocumentModal(this.#c.modality.current.documentModal);
		let n = this.#e.getState();
		V(this, n, Za), this.#t.setValue({
			state: n,
			stateAttrMap: Za,
			dialog: this.#c,
			popupId: this.#n,
			popupAttrs: this.#e.getPopupAttrs(n),
			close: () => this.#c?.close()
		});
	}
	#h(e) {
		let t = this.#o.value, n = this.querySelector("media-dialog-title");
		n && !this.#g(n) && (n.textContent = F(mo(), t));
		let r = this.querySelector("media-dialog-description");
		if (r && !this.#g(r)) {
			let n = e ? _o(e) : null;
			n && (this.#f = n), r.textContent = F((n ?? this.#f) || go(), t);
		}
		let i = this.querySelector("media-dialog-close");
		i && !this.#g(i) && (i.textContent = F(ho(), t));
	}
	#g(e) {
		return this.#p.has(e) || (this.#p.add(e), Us(e) && this.#m.add(e)), this.#m.has(e);
	}
}), e(class extends Ts {
	constructor(...e) {
		super(...e), this.consumer = new c(this, {
			context: Vs,
			subscribe: !0
		});
	}
	static {
		this.tagName = "media-dialog-backdrop";
	}
	connectedCallback() {
		super.connectedCallback(), this.setAttribute("role", "presentation"), this.setAttribute("aria-hidden", "true");
	}
}), e(class extends Ts {
	constructor(...e) {
		super(...e), this.consumer = new c(this, {
			context: Vs,
			subscribe: !0
		}), this.#e = null;
	}
	static {
		this.tagName = "media-dialog-popup";
	}
	#e;
	disconnectedCallback() {
		this.#e?.setPopupElement(null), this.#e = null, super.disconnectedCallback();
	}
	update(e) {
		super.update(e);
		let t = this.consumer.value;
		t && (this.#e !== t.dialog && (this.#e?.setPopupElement(null), this.#e = t.dialog, this.#e.setPopupElement(this)), B(this, {
			id: t.popupId,
			tabIndex: -1,
			...t.popupAttrs
		}));
	}
}), e(class extends Ts {
	constructor(...e) {
		super(...e), this.consumer = new c(this, {
			context: Vs,
			subscribe: !0
		});
	}
	static {
		this.tagName = "media-dialog-title";
	}
	update(e) {
		super.update(e);
		let t = this.consumer.value?.state.titleId;
		t && (this.id = t);
	}
}), e(class extends Ts {
	constructor(...e) {
		super(...e), this.consumer = new c(this, {
			context: Vs,
			subscribe: !0
		});
	}
	static {
		this.tagName = "media-dialog-description";
	}
	update(e) {
		super.update(e);
		let t = this.consumer.value?.state.descriptionId;
		t && (this.id = t);
	}
}), e(class extends M {
	constructor(...e) {
		super(...e), this.disabled = !1, this.#e = new c(this, {
			context: Vs,
			subscribe: !0
		}), this.#t = null;
	}
	static {
		this.tagName = "media-dialog-close";
	}
	static {
		this.properties = { disabled: { type: Boolean } };
	}
	#e;
	#t;
	connectedCallback() {
		super.connectedCallback(), this.#t = new AbortController();
		let e = Mi({
			onActivate: () => this.#e.value?.close(),
			isDisabled: () => this.disabled
		});
		B(this, e, { signal: this.#t.signal });
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.#t?.abort(), this.#t = null;
	}
	update(e) {
		super.update(e);
		let t = this.#e.value;
		t && V(this, t.state, t.stateAttrMap);
	}
});
// src/fork/scenario.ts
var Ws = {
	start: "Start",
	lengthOne: "≈ {minutes} min · 1 checkpoint",
	lengthMany: "≈ {minutes} min · {checkpoints} checkpoints",
	checkpoint: "Checkpoint {index} of {total}",
	confirm: "Confirm",
	continue: "Continue",
	right: "Right",
	wrong: "Not quite",
	next: "Next",
	closerLook: "Let’s take a closer look",
	finishing: "Finishing up",
	continueLabel: "Continue",
	loading: "Loading",
	errorTitle: "No video",
	errorText: "Check your connection and try again.",
	retry: "Try again",
	lockedCheckpoint: "Answer the checkpoint to go on",
	lockedCheckpointShort: "Answer to go on",
	parts: "Lesson parts",
	watched: "Watched",
	nowPlaying: "Now playing",
	lockedPart: "Locked",
	more: "More actions",
	soundOff: "Sound off",
	soundOn: "Sound on",
	captions: "Captions",
	fullscreen: "Full screen",
	exitFullscreen: "Exit full screen",
	volume: "Volume",
	closerLookBadge: "A closer look",
	closerLookRemaining: "back to the lesson in {time}",
	skipCloserLook: "Got it, continue",
	resumed: "Back to the lesson",
	step: "Step {index} of {total}",
	closerLookStep: "A closer look",
	locked: "locked",
	answered: "answered",
	mapLabel: "Course route",
	complete: "Course complete",
	correct: "Correct",
	nextLesson: "Next lesson",
	score: "{correct} of {total} correct",
	elapsed: "{time} on the course",
	closerLooksNone: "No extra explanations needed",
	closerLooksOne: "1 closer look",
	closerLooksMany: "{count} closer looks",
	reviewTitle: "Watch again",
	replay: "Replay"
};
function K(e, t = {}) {
	return e.replace(/\{(\w+)\}/g, (e, n) => n in t ? String(t[n]) : e);
}
var Gs = "complete";
function q(e) {
	return e?.type === "segment";
}
function J(e) {
	return e?.type === "question";
}
function Ks(e) {
	if (!e || typeof e != "object") throw Error("Scenario must be an object");
	let t = e;
	if (t.version !== 1) throw Error("Scenario version must be 1");
	if (typeof t.title != "string") throw Error("Scenario needs a title");
	if (typeof t.start != "string") throw Error("Scenario needs a start node id");
	if (!t.nodes || typeof t.nodes != "object") throw Error("Scenario needs nodes");
	let n = {};
	for (let [e, r] of Object.entries(t.nodes)) {
		let t = {
			...r,
			id: e
		};
		if (t.type === "segment") {
			if (typeof t.in != "number" || typeof t.out != "number" || t.out <= t.in) throw Error(`Segment "${e}" needs numeric in < out`);
			if (![
				"main",
				"confirm",
				"detour"
			].includes(t.kind)) throw Error(`Segment "${e}" has unknown kind`);
			if (typeof t.next != "string") throw Error(`Segment "${e}" needs next`);
			typeof t.title != "string" && (t.title = e);
		} else if (t.type === "question") {
			if (typeof t.prompt != "string") throw Error(`Question "${e}" needs a prompt`);
			if (!Array.isArray(t.options) || t.options.length < 2) throw Error(`Question "${e}" needs at least two options`);
			for (let n of t.options) if (typeof n.id != "string" || typeof n.label != "string" || typeof n.next != "string") throw Error(`Question "${e}" has a malformed option`);
		} else throw Error(`Node "${e}" has unknown type`);
		n[e] = t;
	}
	for (let e of Object.values(n)) {
		let t = e.type === "segment" ? [e.next] : e.options.map((e) => e.next);
		for (let r of t) if (r !== "complete" && !n[r]) throw Error(`Node "${e.id}" points to missing node "${r}"`);
	}
	if (!n[t.start]) throw Error(`Start node "${t.start}" does not exist`);
	let r = { ...Ws };
	if (t.labels && typeof t.labels == "object") for (let [e, n] of Object.entries(t.labels)) e in r && typeof n == "string" && (r[e] = n);
	let i = t.nextLesson, a = i && typeof i == "object" && typeof i.title == "string" && typeof i.href == "string" ? {
		title: i.title,
		href: i.href
	} : void 0;
	return {
		version: 1,
		title: t.title,
		kicker: typeof t.kicker == "string" ? t.kicker : void 0,
		name: typeof t.name == "string" ? t.name : t.title,
		start: t.start,
		nodes: n,
		labels: r,
		nextLesson: a
	};
}
function qs(e) {
	let t = [], n = /* @__PURE__ */ new Set(), r = e.start;
	for (; r && r !== "complete" && !n.has(r);) {
		n.add(r);
		let i = e.nodes[r];
		if (!i) break;
		if (t.push(i), i.type === "segment") r = i.next;
		else {
			let t = (i.options.find((e) => e.correct) ?? i.options[0]).next, n = e.nodes[t];
			for (; n && n.type === "segment" && n.kind === "confirm";) t = n.next, n = e.nodes[t];
			r = t;
		}
	}
	return t;
}
function Js(e) {
	let t = qs(e), n = t.filter(q);
	return {
		mainLine: n,
		questions: t.filter(J),
		mainDuration: n.reduce((e, t) => e + (t.out - t.in), 0),
		longestDuration: Object.values(e.nodes).filter(q).reduce((e, t) => e + (t.out - t.in), 0)
	};
}
function Ys(e, t) {
	for (let n of Object.values(e.nodes)) if (n.type === "segment" && t >= n.in && t < n.out) return n;
}
function Xs(e, t) {
	return e.options.find((e) => e.next === t);
}
function Zs(e, t) {
	for (let n of Object.values(e.nodes)) if (n.type === "question" && n.options.some((e) => e.next === t)) return n;
}
function Qs(e, t, n) {
	let r = /* @__PURE__ */ new Set(), i = t;
	for (; i && i !== "complete" && !r.has(i);) {
		r.add(i);
		let t = e.nodes[i];
		if (!t) break;
		if (n.has(i)) return i;
		if (t.type === "segment") i = t.returnsTo ?? t.next;
		else return i;
	}
	return i;
}
function Y(e) {
	let t = Math.max(0, Math.floor(e));
	return `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, "0")}`;
}
// src/fork/route-geometry.ts
function $s(e, t) {
	let n = qs(e), r = new Set(n.filter(q).map((e) => e.id)), i = [];
	for (let a of n) {
		if (i.push(a), !J(a)) continue;
		let n = a.options.find((e) => t.has(e.next) && !r.has(e.next));
		if (!n) continue;
		let o = /* @__PURE__ */ new Set(), s = n.next;
		for (; s && !r.has(s) && !o.has(s);) {
			o.add(s);
			let n = e.nodes[s];
			if (!q(n) || !t.has(n.id)) break;
			i.push(n), s = n.kind === "detour" && n.returnsTo ? n.returnsTo : n.next;
		}
	}
	return i;
}
// src/fork/fork-scenario.ts
var ec = .12, tc = .04, nc = 1500, rc = typeof matchMedia == "function" ? matchMedia("(prefers-reduced-motion: reduce)") : null, ic = class extends M {
	constructor(...e) {
		super(...e), this.src = null, this.reducedMotion = !1, this.autostart = !1, this.autoContinue = 0, this.#e = new O(this, u, di), this.#t = new O(this, u, ci), this.#n = new O(this, u, ri), this.#r = {
			scenario: null,
			stats: null,
			phase: "loading",
			segmentId: null,
			questionId: null,
			route: [],
			visited: /* @__PURE__ */ new Set(),
			answers: {},
			transition: null,
			reducedMotion: !1,
			error: null
		}, this.#i = null, this.#a = null, this.#o = null, this.#s = null, this.#c = null, this.#l = null, this.#u = -1, this.#d = !0;
	}
	static {
		this.tagName = "fork-scenario";
	}
	static {
		this.properties = {
			src: { type: String },
			reducedMotion: {
				type: Boolean,
				attribute: "reduced-motion"
			},
			autostart: { type: Boolean },
			autoContinue: {
				type: Number,
				attribute: "auto-continue"
			}
		};
	}
	#e;
	#t;
	#n;
	#r;
	#i;
	#a;
	#o;
	#s;
	#c;
	#l;
	#u;
	get state() {
		return this.#r;
	}
	get scenario() {
		return this.#r.scenario;
	}
	get labels() {
		return this.#r.scenario?.labels ?? Ws;
	}
	get currentSegment() {
		let { scenario: e, segmentId: t } = this.#r;
		if (!e || !t) return null;
		let n = e.nodes[t];
		return q(n) ? n : null;
	}
	get currentQuestion() {
		let { scenario: e, questionId: t } = this.#r;
		if (!e || !t) return null;
		let n = e.nodes[t];
		return J(n) ? n : null;
	}
	get currentTime() {
		return this.#e.value?.currentTime ?? 0;
	}
	get prefersReducedMotion() {
		return this.reducedMotion || !!rc?.matches;
	}
	connectedCallback() {
		super.connectedCallback(), this.#l?.abort(), this.#l = new AbortController();
		let { signal: e } = this.#l;
		if (this.setAttribute("aria-hidden", "true"), !this.#c) {
			let e = document.createElement("div");
			e.className = "fork-announcer", e.setAttribute("aria-live", "polite"), e.setAttribute("aria-atomic", "true"), e.removeAttribute("aria-hidden"), this.#c = e;
		}
		this.parentElement && !this.#c.isConnected && this.parentElement.insertBefore(this.#c, this.nextSibling), rc?.addEventListener("change", () => this.#S(), { signal: e }), this.#f();
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.#l?.abort(), this.#l = null, this.#D(), this.#s?.(), this.#s = null, this.#c?.remove();
	}
	update(e) {
		super.update(e), e.has("src") && this.#f(), e.has("reducedMotion") && this.#S();
		let t = this.#e.value, n = this.#t.value;
		if (!t || !n || !this.#r.scenario) return;
		let r = t.currentTime;
		(r !== this.#u || n.paused !== this.#d) && (this.#u = r, this.#d = n.paused, this.#p(r, n.paused, t.seeking), this.dispatchEvent(new CustomEvent("fork-tick", { detail: r })));
	}
	#d;
	async #f() {
		let e = this.querySelector("script[type=\"application/json\"]"), t;
		try {
			if (e?.textContent?.trim()) t = JSON.parse(e.textContent);
			else if (this.src) {
				if (this.#i === this.src && this.#r.scenario) return;
				this.#i = this.src;
				let e = await fetch(this.src);
				if (!e.ok) throw Error(`Scenario request failed: ${e.status}`);
				t = await e.json();
			} else return;
			let n = Ks(t);
			this.#r = {
				...this.#r,
				scenario: n,
				stats: Js(n),
				phase: this.autostart ? "playing" : "idle",
				segmentId: n.start,
				questionId: null,
				route: [n.start],
				visited: /* @__PURE__ */ new Set([n.start]),
				answers: {},
				transition: null,
				error: null
			}, this.#S(), this.requestUpdate();
		} catch (e) {
			let t = e instanceof Error ? e.message : String(e);
			this.#r = {
				...this.#r,
				error: t,
				phase: "loading"
			}, console.error(`[fork] ${this.src || "inline scenario"}: ${t}`), this.dispatchEvent(new CustomEvent("fork-error", {
				bubbles: !0,
				composed: !0,
				detail: { message: t }
			})), this.#S();
		}
	}
	#p(e, t, n) {
		let { scenario: r, phase: i } = this.#r;
		if (r) switch (i) {
			case "idle":
				t || this.#b({ phase: "playing" });
				break;
			case "playing":
			case "detour":
			case "merge": {
				let t = this.currentSegment;
				if (!t) return;
				if (e >= t.out - ec) {
					n || this.#m(t);
					return;
				}
				if (e < t.in - .25) {
					let n = Ys(r, e);
					n && this.#r.visited.has(n.id) ? this.#b({
						segmentId: n.id,
						phase: n.kind === "detour" ? "detour" : "playing"
					}) : this.#e.value?.seek(t.in);
				}
				break;
			}
			case "question": {
				let r = this.currentSegment;
				if (!r) return;
				t || this.#t.value?.pause(), Math.abs(e - r.out) > .5 && !n && this.#e.value?.seek(r.out - ec);
				break;
			}
			case "complete":
				t || this.replay();
				break;
			case "transition": t || this.#g();
		}
	}
	#m(e) {
		let t = this.#r.scenario, n = e.returnsTo && e.kind === "detour" ? e.returnsTo : e.next;
		if (n === "complete") {
			this.#t.value?.pause(), this.#b({
				phase: "complete",
				transition: null
			}), this.#w(this.#v()), this.#C("fork-complete", {
				route: this.#r.route,
				answers: this.#r.answers
			});
			return;
		}
		let r = t.nodes[n];
		if (J(r)) {
			let e = r.options.find((e) => e.id === this.#r.answers[r.id]);
			if (e) {
				let n = t.nodes[e.next];
				e.next === "complete" ? (this.#t.value?.pause(), this.#b({
					phase: "complete",
					transition: null
				})) : q(n) && this.#h(n);
				return;
			}
			this.#t.value?.pause(), this.#b({
				phase: "question",
				questionId: r.id
			}), this.#y(r.id);
			let n = this.#r.stats?.questions.findIndex((e) => e.id === r.id) ?? -1, i = this.#r.stats?.questions.length ?? 0;
			this.#w(`${r.title ?? K(this.labels.checkpoint, {
				index: n + 1,
				total: i
			})}: ${r.prompt}`);
		} else q(r) && this.#h(r, { merge: e.kind === "detour" });
	}
	#h(e, t = {}) {
		let n = this.#e.value;
		n && Math.abs(n.currentTime - e.in) > .3 && n.seek(e.in + tc), this.#y(e.id);
		let r = t.merge ? "merge" : e.kind === "detour" ? "detour" : "playing";
		this.#b({
			segmentId: e.id,
			questionId: null,
			transition: null,
			phase: r
		}), t.merge && (this.#w(this.labels.resumed), this.#E(), this.#o = setTimeout(() => {
			this.#o = null, this.#r.phase === "merge" && this.#b({ phase: "playing" });
		}, nc));
	}
	start() {
		this.#r.phase === "idle" && (this.#t.value?.play(), this.#b({ phase: "playing" }));
	}
	answer(e) {
		let t = this.currentQuestion, n = this.#r.scenario;
		if (!t || !n || this.#r.phase !== "question") return;
		let r = t.options.find((t) => t.id === e);
		if (!r) return;
		let i = n.nodes[r.next], a = r.next === "complete" ? "complete" : q(i) ? i.kind : "question", o = i, s = /* @__PURE__ */ new Set();
		for (; o && q(o) && o.kind === "confirm" && !s.has(o.id);) s.add(o.id), o = n.nodes[o.next];
		let c = {
			questionId: t.id,
			optionId: e,
			correct: !!r.correct,
			feedback: r.feedback ?? "",
			targetId: r.next,
			targetKind: a === "confirm" ? "main" : a,
			targetTitle: q(o) ? o.title : J(o) ? o.title ?? "Next checkpoint" : "Finish",
			targetDuration: q(o) ? o.out - o.in : 0
		};
		this.#b({
			phase: "transition",
			transition: c,
			answers: {
				...this.#r.answers,
				[t.id]: e
			}
		}), this.#C("fork-answer", {
			questionId: t.id,
			optionId: e,
			correct: c.correct
		});
		let l = this.labels, u = `${c.correct ? l.right : l.wrong}.`, d = a === "detour" ? K(l.closerLook, {
			title: c.targetTitle,
			duration: Y(c.targetDuration)
		}) : a === "complete" ? l.finishing : K(l.next, { title: c.targetTitle });
		this.#w(`${u} ${c.feedback} ${d}`.replace(/\s+/g, " ").trim()), q(i) && this.#e.value?.seek(i.in + tc), this.#t.value?.pause(), this.#T(), this.autoContinue > 0 && (this.#a = setTimeout(() => this.#g(), this.autoContinue));
	}
	continueAnswered() {
		let e = this.currentQuestion, t = this.#r.scenario;
		if (!e || !t || this.#r.phase !== "question") return;
		let n = this.#r.answers[e.id], r = e.options.find((e) => e.id === n);
		if (!r) return;
		if (r.next === "complete") {
			this.#b({
				phase: "complete",
				questionId: null
			});
			return;
		}
		let i = t.nodes[r.next];
		J(i) ? (this.#y(i.id), this.#b({
			phase: "question",
			questionId: i.id
		})) : q(i) && (this.#h(i), this.#t.value?.play());
	}
	skipTransition() {
		this.#r.phase === "transition" && this.#g();
	}
	#g() {
		this.#T();
		let { transition: e, scenario: t } = this.#r;
		if (!e || !t || this.#r.phase !== "transition") return;
		if (e.targetKind === "complete") {
			this.#b({
				phase: "complete",
				transition: null,
				questionId: null
			}), this.#w(this.#v()), this.#C("fork-complete", {
				route: this.#r.route,
				answers: this.#r.answers
			});
			return;
		}
		let n = t.nodes[e.targetId];
		J(n) ? (this.#y(n.id), this.#b({
			phase: "question",
			questionId: n.id,
			transition: null
		})) : q(n) && (this.#h(n), this.#t.value?.play());
	}
	backToRoute() {
		let e = this.currentSegment, t = this.#r.scenario;
		if (!e || !t || e.kind !== "detour") return;
		let n = t.nodes[e.returnsTo ?? e.next];
		q(n) && this.#h(n, { merge: !0 });
	}
	seekTo(e) {
		let t = this.#r.scenario;
		if (!t) return !1;
		let n = Ys(t, e);
		if (!n) return !1;
		let r = this.currentSegment;
		return this.#r.visited.has(n.id) || n.id === r?.id ? ((this.#r.phase === "question" || this.#r.phase === "transition") && (this.#b({
			phase: n.kind === "detour" ? "detour" : "playing",
			questionId: null,
			transition: null
		}), this.#T()), this.#b({
			segmentId: n.id,
			phase: n.kind === "detour" ? "detour" : this.#r.phase === "merge" ? "merge" : "playing"
		}), this.#e.value?.seek(Math.min(e, n.out - ec)), !0) : !1;
	}
	isUnlocked(e) {
		let t = this.#r.scenario;
		if (!t) return !1;
		let n = Ys(t, e);
		return !(!n || !this.#r.visited.has(n.id) && n.id !== this.#r.segmentId);
	}
	replay() {
		let e = this.#r.scenario;
		if (!e) return;
		this.#D();
		let t = e.nodes[e.start];
		this.#r = {
			...this.#r,
			phase: "playing",
			segmentId: e.start,
			questionId: null,
			route: [e.start],
			visited: /* @__PURE__ */ new Set([e.start]),
			answers: {},
			transition: null
		}, q(t) && this.#e.value?.seek(t.in + tc), this.#t.value?.play(), this.#S();
	}
	get step() {
		let e = this.#r.stats, t = this.currentSegment;
		if (!e || !t) return {
			index: 0,
			total: 0
		};
		let n = e.mainLine.length, r = e.mainLine.findIndex((e) => e.id === t.id) + 1;
		if (r === 0) {
			let n = new Set(e.mainLine.map((e) => e.id)), i = this.#_(t.id, n);
			r = Math.max(1, e.mainLine.findIndex((e) => e.id === i));
		}
		return {
			index: r,
			total: n
		};
	}
	#_(e, t) {
		let n = this.#r.scenario, r = /* @__PURE__ */ new Set(), i = e;
		for (; i && i !== "complete" && !r.has(i);) {
			if (r.add(i), t.has(i)) return i;
			let e = n.nodes[i];
			if (!e) break;
			i = q(e) ? e.returnsTo ?? e.next : (e.options.find((e) => e.correct) ?? e.options[0]).next;
		}
		return i;
	}
	get score() {
		let e = this.#r.stats, t = this.#r.scenario;
		if (!e || !t) return {
			correct: 0,
			total: 0
		};
		let n = 0;
		for (let t of e.questions) {
			let e = this.#r.answers[t.id];
			e && t.options.find((t) => t.id === e)?.correct && n++;
		}
		return {
			correct: n,
			total: e.questions.length
		};
	}
	get routeSegments() {
		let e = this.#r.scenario;
		return e ? $s(e, this.#r.visited).filter(q) : [];
	}
	get routeTime() {
		let e = this.routeSegments, t = this.currentSegment, n = 0, r = 0, i = !1;
		for (let a of e) {
			let e = a.out - a.in;
			if (r += e, !i) {
				if (t && a.id === t.id) {
					let t = this.#r.phase === "question" || this.#r.phase === "transition";
					n += t ? e : Math.min(e, Math.max(0, this.currentTime - a.in)), i = !0;
				} else n += e;
			}
		}
		return this.#r.phase === "complete" && (n = r), this.#r.phase === "idle" && (n = 0), {
			elapsed: n,
			total: r
		};
	}
	get detoursTaken() {
		let e = this.#r.scenario;
		return e ? this.#r.route.map((t) => e.nodes[t]).filter((e) => q(e) && e.kind === "detour") : [];
	}
	#v() {
		let { correct: e, total: t } = this.score;
		return `${this.labels.complete}: ${K(this.labels.score, {
			correct: e,
			total: t
		})}`;
	}
	#y(e) {
		if (this.#r.route[this.#r.route.length - 1] === e) return;
		let t = new Set(this.#r.visited);
		t.add(e), this.#r = {
			...this.#r,
			route: [...this.#r.route, e],
			visited: t
		};
	}
	#b(e) {
		let t = this.#r;
		this.#r = {
			...t,
			...e
		}, t.phase !== this.#r.phase && this.#x(t.phase, this.#r.phase), this.#S();
	}
	#x(e, t) {
		let n = t === "question" || t === "transition" || t === "complete" || t === "idle";
		n && !this.#s ? this.#s = this.#n.value?.requestControlsLock() ?? null : !n && this.#s && (this.#s(), this.#s = null);
	}
	#S() {
		this.#r = {
			...this.#r,
			reducedMotion: this.prefersReducedMotion
		};
		let e = this.closest("media-container") ?? this.parentElement;
		if (e) {
			e.setAttribute("data-fork-phase", this.#r.phase);
			let t = this.currentSegment;
			t && e.setAttribute("data-fork-kind", t.kind), e.toggleAttribute("data-fork-reduced-motion", this.#r.reducedMotion);
			let n = this.labels;
			for (let t of e.querySelectorAll("[data-fork-label]")) {
				let e = t.dataset.forkLabel;
				e === "name" ? t.textContent = this.#r.scenario?.name ?? "" : e in n && (t.textContent = n[e]);
			}
		}
		this.#C("fork-change", this.#r);
	}
	#C(e, t) {
		this.dispatchEvent(new CustomEvent(e, {
			detail: t,
			bubbles: !0,
			composed: !0
		}));
	}
	announce(e) {
		this.#w(e);
	}
	#w(e) {
		this.#c && (this.#c.textContent = "", requestAnimationFrame(() => {
			this.#c && (this.#c.textContent = e);
		}));
	}
	#T() {
		this.#a && clearTimeout(this.#a), this.#a = null;
	}
	#E() {
		this.#o && clearTimeout(this.#o), this.#o = null;
	}
	#D() {
		this.#T(), this.#E();
	}
};
function ac(e) {
	return (e.closest("video-player") ?? e.closest("media-container") ?? document).querySelector("fork-scenario");
}
customElements.get(ic.tagName) || customElements.define(ic.tagName, ic);
// src/fork/fork-element.ts
var X = class extends M {
	constructor(...e) {
		super(...e), this.engine = null, this.#e = null, this.#t = null;
	}
	#e;
	#t;
	connectedCallback() {
		super.connectedCallback(), this.#n();
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.#e?.abort(), this.#e = null, this.engine = null, this.#t && cancelAnimationFrame(this.#t), this.#t = null;
	}
	#n() {
		let e = ac(this);
		if (!e) {
			this.#t = requestAnimationFrame(() => this.#n());
			return;
		}
		this.engine = e, this.#e = new AbortController();
		let { signal: t } = this.#e;
		e.addEventListener("fork-change", () => this.requestUpdate(), { signal: t }), e.addEventListener("fork-tick", () => this.requestUpdate(), { signal: t }), this.requestUpdate();
	}
	get forkState() {
		return this.engine?.state ?? null;
	}
};
function Z(e, t = {}, ...n) {
	let r = document.createElement(e);
	for (let [e, n] of Object.entries(t)) n != null && n !== !1 && r.setAttribute(e, n === !0 ? "" : String(n));
	for (let e of n) e != null && r.append(e);
	return r;
}
// src/fork/icons.ts
var oc = {
	play: {
		mode: "fill",
		body: "<path d=\"M7 4l13 8-13 8z\"/>"
	},
	pause: {
		mode: "fill",
		body: "<path d=\"M6 4h4.5v16H6zM13.5 4H18v16h-4.5z\"/>"
	},
	replay: {
		mode: "stroke",
		body: "<path d=\"M4 12a8 8 0 1 0 2.6-5.9\"/><path d=\"M4 4v4.5h4.5\"/>"
	},
	check: {
		mode: "stroke",
		body: "<path d=\"M4 12.5l5 5L20 6.5\"/>"
	},
	plus: {
		mode: "stroke",
		body: "<path d=\"M12 3v18M3 12h18\"/>"
	},
	cross: {
		mode: "stroke",
		body: "<path d=\"M5.5 5.5l13 13M18.5 5.5l-13 13\"/>"
	},
	lock: {
		mode: "stroke",
		body: "<path d=\"M6 11h12v9H6z\"/><path d=\"M8.5 11V7.5a3.5 3.5 0 0 1 7 0V11\"/>"
	},
	volume: {
		mode: "stroke",
		body: "<path d=\"M4 9.5h3l5-4v13l-5-4H4z\"/><path d=\"M16 8.5a5 5 0 0 1 0 7\"/>"
	},
	"volume-off": {
		mode: "stroke",
		body: "<path d=\"M4 9.5h3l5-4v13l-5-4H4z\"/><path d=\"M16 9.5l5 5M21 9.5l-5 5\"/>"
	},
	captions: {
		mode: "stroke",
		body: "<path d=\"M3 6h18v12H3z\"/><path stroke-width=\"2\" d=\"M10.5 10.3a2 2 0 1 0 0 3.4M17 10.3a2 2 0 1 0 0 3.4\"/>"
	},
	parts: {
		mode: "stroke",
		body: "<path d=\"M4 6h16M4 12h16M4 18h16\"/>"
	},
	"fullscreen-enter": {
		mode: "stroke",
		body: "<path d=\"M4 9V5h4M16 5h4v4M20 15v4h-4M8 19H4v-4\"/>"
	},
	"fullscreen-exit": {
		mode: "stroke",
		body: "<path d=\"M8 5v4H4M20 9h-4V5M16 19v-4h4M4 15h4v4\"/>"
	},
	more: {
		mode: "fill",
		body: "<path d=\"M3 10h4v4H3zM10 10h4v4h-4zM17 10h4v4h-4z\"/>"
	},
	triangle: {
		mode: "fill",
		body: "<path d=\"M0 0l45 27.5L0 55z\"/>",
		viewBox: "0 0 45 55"
	}
};
function Q(e, t = "", n = 2.5) {
	let r = oc[e], i = r.mode === "fill" ? "fill=\"currentColor\"" : `fill="none" stroke="currentColor" stroke-width="${n}" stroke-linecap="butt" stroke-linejoin="miter"`;
	return `<svg class="fork-icon ${t}" data-icon="${e}" viewBox="${r.viewBox ?? "0 0 24 24"}" ${i} aria-hidden="true" focusable="false">${r.body}</svg>`;
}
function $(e, t = "", n = 2.5) {
	let r = document.createElement("template");
	return r.innerHTML = Q(e, t, n), r.content.firstElementChild;
}
// src/fork/fork-route-map.ts
var sc = 5, cc = 1600, lc = class extends X {
	constructor(...e) {
		super(...e), this.size = "bar", this.#e = new O(this, u, ni), this.#t = null, this.#n = null, this.#r = null, this.#i = null, this.#a = /* @__PURE__ */ new Map(), this.#o = /* @__PURE__ */ new Map(), this.#s = "", this.#c = null, this.#l = !1, this.#u = null, this.#d = null, this.#b = (e) => {
			if (e.button !== 0) return;
			let t = this.engine;
			if (!t || !t.currentSegment) return;
			let n = t.state.phase;
			n !== "idle" && n !== "complete" && (e.preventDefault(), this.#l = !0, this.setPointerCapture(e.pointerId), this.#C(e));
		}, this.#x = (e) => {
			this.#l && this.#C(e);
		}, this.#S = (e) => {
			if (!this.#l) return;
			this.#l = !1, this.hasPointerCapture(e.pointerId) && this.releasePointerCapture(e.pointerId);
			let t = this.#u;
			this.#u = null, this.#T(), t !== null && this.#v(t), this.requestUpdate();
		}, this.#E = (e) => {
			let t = this.engine, n = t?.currentSegment;
			if (!t || !n) return;
			let r = t.currentTime, i = !0;
			switch (e.key) {
				case "ArrowLeft":
				case "ArrowDown":
					this.#v(Math.max(n.in, r - sc));
					break;
				case "ArrowRight":
				case "ArrowUp":
					this.#v(Math.min(n.out, r + sc));
					break;
				case "Home":
					this.#v(n.in);
					break;
				case "End":
					this.#v(n.out);
					break;
				case "PageUp":
					this.#D(-1);
					break;
				case "PageDown":
					this.#D(1);
					break;
				default: i = !1;
			}
			i && (e.preventDefault(), e.stopPropagation(), this.#w());
		};
	}
	static {
		this.tagName = "fork-route-map";
	}
	static {
		this.properties = { size: { type: String } };
	}
	#e;
	#t;
	#n;
	#r;
	#i;
	#a;
	#o;
	#s;
	#c;
	#l;
	#u;
	#d;
	connectedCallback() {
		super.connectedCallback(), this.#c = new AbortController();
		let { signal: e } = this.#c;
		this.#t || (this.#t = Z("div", { class: "fork-line" }), this.#i = Z("span", {
			class: "fork-line-terminus",
			"aria-hidden": "true"
		}), this.#n = Z("span", {
			class: "fork-line-marker",
			"aria-hidden": "true"
		}), this.#r = Z("span", {
			class: "fork-line-plaque",
			role: "presentation",
			hidden: !0
		}), this.#n.append(this.#r), this.replaceChildren(this.#t)), this.size === "expanded" ? this.setAttribute("role", "img") : (this.setAttribute("role", "slider"), this.setAttribute("tabindex", "0"), this.setAttribute("aria-orientation", "horizontal"), this.addEventListener("keydown", this.#E, { signal: e }), this.addEventListener("pointerdown", this.#b, { signal: e }), this.addEventListener("pointermove", this.#x, { signal: e }), this.addEventListener("pointerup", this.#S, { signal: e }), this.addEventListener("pointercancel", this.#S, { signal: e }), this.addEventListener("focus", () => this.#w(), { signal: e }), this.addEventListener("blur", () => this.#T(), { signal: e }));
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.#c?.abort(), this.#c = null, this.#d && clearTimeout(this.#d);
	}
	update(e) {
		super.update(e);
		let t = this.engine, n = t?.state;
		if (!t || !n?.scenario || !n.stats || !this.#t) return;
		this.setAttribute("data-size", this.size), this.setAttribute("aria-label", t.labels.mapLabel);
		let r = $s(n.scenario, n.visited), i = [
			r.map((e) => e.id).join(","),
			[...n.visited].join(","),
			Object.entries(n.answers).map(([e, t]) => `${e}:${t}`).join(","),
			n.segmentId,
			n.questionId,
			n.phase
		].join("|");
		i !== this.#s && (this.#s = i, this.#f(r)), this.#m(), this.#g();
	}
	#f(e) {
		let t = this.engine, n = t.state, r = t.labels, i = this.#t, a = new Set(n.stats.mainLine.map((e) => e.id)), o = t.currentSegment, s = new Set(e.map((e) => e.id));
		for (let [e, t] of this.#a) s.has(e) || (t.element.remove(), this.#a.delete(e));
		for (let [e, t] of this.#o) s.has(e) || (t.element.remove(), this.#o.delete(e));
		let c = [], l = 0, u = 0, d = [];
		for (let t of e) if (q(t)) {
			let e = t.out - t.in, r = !a.has(t.id), i = n.visited.has(t.id), s = o?.id === t.id;
			a.has(t.id) && l++;
			let u = this.#a.get(t.id);
			if (!u) {
				let e = Z("span", { class: "fork-line-fill" }), n = Z("span", {
					class: "fork-line-preview",
					hidden: !0
				}), i = Z("span", {
					class: "fork-line-segment",
					"data-id": t.id
				}, e, n);
				u = {
					element: i,
					fill: e,
					preview: n
				}, this.#a.set(t.id, u), r && (i.style.flexGrow = "0", d.push(i));
			}
			let { element: f } = u;
			f.setAttribute("data-kind", t.kind), f.toggleAttribute("data-inserted", r), f.toggleAttribute("data-watched", i && !s), f.toggleAttribute("data-current", s), f.toggleAttribute("data-locked", !i && !s);
			let p = this.size === "expanded" && t.kind === "confirm" ? 0 : e;
			this.size === "expanded" ? f.removeAttribute("title") : f.title = `${t.title} · ${Y(e)}`, d.includes(f) || (f.style.flexGrow = String(p)), f.dataset.grow = String(p), this.size === "expanded" && t.kind !== "confirm" && (u.label || (u.label = Z("span", { class: "fork-line-label" }), f.append(u.label)), u.label.replaceChildren(Z("span", { class: "fork-line-label-title" }, t.title), Z("span", { class: "fork-line-label-duration fork-kicker" }, Y(e)))), c.push(f);
		} else if (J(t)) {
			u++;
			let e = n.answers[t.id], i = e ? t.options.find((t) => t.id === e) : void 0, a = this.#o.get(t.id);
			if (!a) {
				let e = Z("span", {
					class: "fork-line-plaque fork-line-plaque-lock",
					role: "presentation",
					hidden: !0
				});
				a = {
					element: Z("span", {
						class: "fork-line-station",
						"data-id": t.id
					}, e),
					plaque: e
				}, this.#o.set(t.id, a);
			}
			let { element: o, plaque: s } = a, l = t.title ?? K(r.checkpoint, {
				index: u,
				total: n.stats.questions.length
			});
			o.toggleAttribute("data-answered", !!i), o.toggleAttribute("data-right", !!i?.correct), o.toggleAttribute("data-wrong", !(!i || i.correct)), o.toggleAttribute("data-current", n.questionId === t.id), o.title = i ? `${l} · ${r.answered}` : l, o.querySelector(".fork-icon")?.remove();
			let d = this.size === "expanded" ? "cross" : "plus";
			i && o.prepend($(i.correct ? "check" : d, "fork-line-station-icon", i.correct ? 4 : 5)), s.replaceChildren($("lock", "fork-line-plaque-icon", 2.5), Z("span", { class: "fork-line-plaque-long" }, r.lockedCheckpoint), Z("span", { class: "fork-line-plaque-short" }, r.lockedCheckpointShort)), this.size === "expanded" && (o.setAttribute("role", "img"), o.setAttribute("aria-label", i ? `${l.replace(/ of \d+$/, "")}: ${i.correct ? r.right : r.wrong}` : l), o.removeAttribute("title")), c.push(o);
		}
		if (this.size === "expanded") {
			let e = !1;
			for (let t of c) t.classList.contains("fork-line-station") ? e = !0 : t.getAttribute("data-kind") !== "confirm" && (t.toggleAttribute("data-after-station", e), e = !1);
		}
		if (c.push(this.#i), i.replaceChildren(...c), this.size === "expanded") {
			let e = c.filter((e) => e.classList.contains("fork-line-segment") && e.getAttribute("data-kind") !== "confirm");
			this.toggleAttribute("data-many", e.length >= 5);
		}
		this.#p(), d.length && requestAnimationFrame(() => {
			for (let e of d) e.style.flexGrow = e.dataset.grow ?? "1";
		});
	}
	#p() {
		let e = this.engine, t = e?.currentSegment;
		if (!e || !t || !this.#n) return;
		let n = this.#a.get(t.id);
		n && this.#n.parentElement !== n.element && n.element.append(this.#n);
	}
	#m() {
		let e = this.engine, t = e?.currentSegment;
		if (!e || !t || !this.#n) return;
		this.#p();
		let n = t.out - t.in, r = this.#u ?? e.currentTime, i = Math.min(1, Math.max(0, (e.currentTime - t.in) / n)), a = this.#a.get(t.id);
		if (a) {
			if (a.fill.style.width = `${i * 100}%`, this.#u !== null) {
				let e = Math.min(1, Math.max(0, (this.#u - t.in) / n)), r = Math.min(i, e), o = Math.max(i, e);
				a.preview.style.left = `${r * 100}%`, a.preview.style.width = `${(o - r) * 100}%`, a.preview.hidden = !1, this.#n.style.left = `${e * 100}%`;
			} else a.preview.hidden = !0, this.#n.style.left = `${i * 100}%`;
		}
		this.#n.toggleAttribute("data-dragging", this.#u !== null), this.#r && !this.#r.hidden && (this.#r.textContent = this.#h(r)), this.#n.toggleAttribute("hidden", e.state.phase === "complete");
	}
	#h(e) {
		let t = this.engine, n = t.currentSegment, r = Math.max(0, e - n.in), { elapsed: i } = t.routeTime;
		return `${Y(i - Math.max(0, t.currentTime - n.in) + r)} · ${n.title}`;
	}
	#g() {
		let e = this.engine, t = e.currentSegment;
		if (!t || this.size === "expanded") return;
		let { elapsed: n, total: r } = e.routeTime;
		this.setAttribute("aria-valuemin", "0"), this.setAttribute("aria-valuemax", String(Math.round(r))), this.setAttribute("aria-valuenow", String(Math.round(n)));
		let i = t.kind === "detour" ? `${e.labels.closerLookBadge}: ${t.title}` : t.title;
		this.setAttribute("aria-valuetext", `${Y(n)}, ${i}`);
	}
	#_(e) {
		let t = Array.from(this.#t.querySelectorAll(".fork-line-segment"));
		if (!t.length) return null;
		let n = this.engine, r = null;
		for (let i of t) {
			let t = n.state.scenario.nodes[i.dataset.id];
			if (!q(t)) continue;
			let a = i.getBoundingClientRect();
			if (e >= a.left && e <= a.right) return t.in + (e - a.left) / Math.max(1, a.width) * (t.out - t.in);
			if (e < a.left) return r ? r.node.out : t.in;
			r = {
				node: t,
				rect: a
			};
		}
		return r ? r.node.out : null;
	}
	#v(e) {
		let t = this.engine;
		if (t.seekTo(e)) return;
		let n = this.#y();
		n && (n.element.setAttribute("data-locked-hint", ""), n.plaque.hidden = !1, this.#d && clearTimeout(this.#d), this.#d = setTimeout(() => {
			n.element.removeAttribute("data-locked-hint"), n.plaque.hidden = !0;
		}, cc), t.announce(t.labels.lockedCheckpoint));
	}
	#y() {
		let e = this.engine;
		for (let [t, n] of this.#o) if (!e.state.answers[t]) return n;
	}
	#b;
	#x;
	#S;
	#C(e) {
		let t = this.engine, n = t.currentSegment, r = this.#_(e.clientX);
		if (r !== null) {
			if (t.isUnlocked(r)) {
				let e = r >= n.in && r <= n.out;
				if (this.#u = e ? r : null, !e) {
					this.#v(r);
					return;
				}
				this.#w(r);
			} else this.#u = null, this.#v(r);
			this.requestUpdate();
		}
	}
	#w(e) {
		this.#r && this.engine?.currentSegment && (this.#r.textContent = this.#h(e ?? this.engine.currentTime), this.#r.hidden = !1);
	}
	#T() {
		this.#r && (this.#r.hidden = !0);
	}
	#E;
	#D(e) {
		let t = this.engine, n = t.routeSegments.filter((e) => t.state.visited.has(e.id)), r = n[n.findIndex((e) => e.id === t.state.segmentId) + e];
		r ? this.#v(r.in) : e === 1 && this.#v(t.currentSegment.out + 1);
	}
};
customElements.get(lc.tagName) || customElements.define(lc.tagName, lc);
// src/fork/fork-time.ts
var uc = class extends X {
	static {
		this.tagName = "fork-time";
	}
	#e = null;
	#t = null;
	#n = -1;
	connectedCallback() {
		super.connectedCallback(), this.#e || (this.#e = Z("span", { class: "fork-time-elapsed" }), this.#t = Z("span", { class: "fork-time-total" }), this.replaceChildren(this.#e, Z("span", {
			class: "fork-time-separator",
			"aria-hidden": "true"
		}, " / "), this.#t));
	}
	update(e) {
		super.update(e);
		let t = this.engine;
		if (!t?.state.scenario || !this.#e || !this.#t) return;
		let { elapsed: n, total: r } = t.routeTime;
		this.#e.textContent = Y(n), this.#t.textContent = Y(r), this.#n !== -1 && Math.round(r) !== Math.round(this.#n) && (this.#t.removeAttribute("data-changed"), this.#t.offsetWidth, this.#t.setAttribute("data-changed", "")), this.#n = r, this.setAttribute("aria-label", `${Y(n)} of ${Y(r)}`);
	}
};
customElements.get(uc.tagName) || customElements.define(uc.tagName, uc);
// src/fork/modality.ts
var dc = !1;
typeof window < "u" && (window.addEventListener("keydown", () => dc = !0, {
	capture: !0,
	passive: !0
}), window.addEventListener("pointerdown", () => dc = !1, {
	capture: !0,
	passive: !0
}));
function fc() {
	return dc;
}
function pc(e) {
	let t = e.closest("media-container");
	t && (fc() ? (t.querySelector(".fork-bar-play") ?? t.querySelector("media-play-button") ?? t).focus({ preventScroll: !0 }) : t.focus({ preventScroll: !0 }));
}
var mc = 0, hc = class extends X {
	static {
		this.tagName = "fork-question";
	}
	#e = null;
	#t = null;
	#n = null;
	#r = null;
	#i = null;
	#a = !1;
	#o = !1;
	#s = null;
	#c = null;
	connectedCallback() {
		super.connectedCallback(), this.#s = new AbortController();
		let { signal: e } = this.#s;
		if (!this.#e) {
			let e = `fork-question-${++mc}`;
			this.#t = Z("span", {
				class: "fork-question-kicker fork-kicker",
				id: `${e}-kicker`
			}), this.#n = Z("p", {
				class: "fork-question-prompt",
				id: `${e}-prompt`
			}), this.#r = Z("div", {
				class: "fork-question-options",
				role: "radiogroup",
				"aria-labelledby": `${e}-prompt`
			}), this.#e = Z("div", {
				class: "fork-question-card",
				role: "dialog",
				"aria-modal": "true",
				tabindex: "-1",
				"aria-labelledby": `${e}-kicker`,
				"aria-describedby": `${e}-prompt`
			}, Z("div", { class: "fork-question-head" }, this.#t, this.#n), this.#r), this.replaceChildren(this.#e);
		}
		this.hidden = !0, this.addEventListener("keydown", this.#m, { signal: e }), this.#r.addEventListener("click", this.#p, { signal: e });
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.#s?.abort(), this.#s = null, this.#c && clearTimeout(this.#c);
	}
	update(e) {
		super.update(e);
		let t = this.engine, n = t?.state;
		if (!t || !n) return;
		let r = t.currentQuestion, i = n.phase === "question" && !!r;
		i && r && this.#i !== r.id && this.#l(r), i !== this.#a && (this.#a = i, this.hidden = !i, this.toggleAttribute("data-open", i), i ? this.#g() : this.#_(), i || (this.#o = !1, this.#i = null));
	}
	#l(e) {
		let t = this.engine, n = t.state.stats, r = n?.questions.findIndex((t) => t.id === e.id) ?? -1, i = n?.questions.length ?? 0;
		this.#i = e.id, this.#o = !1, this.#t.textContent = e.title ?? K(t.labels.checkpoint, {
			index: r + 1,
			total: i
		}), this.#n.textContent = e.prompt, this.#r.replaceChildren(...e.options.map((e, t) => Z("div", { class: "fork-question-row" }, Z("span", {
			class: "fork-question-number",
			"aria-hidden": "true"
		}, String(t + 1)), Z("button", {
			class: "fork-question-option",
			type: "button",
			role: "radio",
			"aria-checked": "false",
			tabindex: t === 0 ? "0" : "-1",
			"data-option": e.id
		}, Z("span", { class: "fork-question-option-label" }, e.label))))), this.setAttribute("data-answered", "false");
	}
	#u() {
		return Array.from(this.#r?.querySelectorAll("[role=\"radio\"]") ?? []);
	}
	#d(e) {
		let t = this.#u(), n = t[(e + t.length) % t.length];
		if (n) {
			for (let e of t) e.tabIndex = e === n ? 0 : -1;
			n.focus();
		}
	}
	#f(e) {
		let t = this.engine, n = t?.currentQuestion;
		if (!t || !n || this.#o) return;
		let r = n.options.find((t) => t.id === e);
		if (!r) return;
		this.#o = !0;
		let i = t.labels;
		for (let t of this.#u()) {
			let n = t.dataset.option === e;
			if (t.setAttribute("aria-checked", String(n)), t.setAttribute("aria-disabled", "true"), n) {
				t.setAttribute("data-verdict", r.correct ? "right" : "wrong");
				let e = $(r.correct ? "check" : "plus", "fork-question-mark", 5);
				e.setAttribute("role", "img"), e.setAttribute("aria-label", r.correct ? i.right : i.wrong), e.removeAttribute("aria-hidden"), t.append(e);
			}
		}
		this.setAttribute("data-answered", "true"), this.#c && clearTimeout(this.#c), t.state.reducedMotion, this.#c = setTimeout(() => {
			this.#c = null, t.answer(e);
		}, 700);
	}
	#p = (e) => {
		let t = e.target.closest("[role=\"radio\"]");
		!t || this.#o || this.#f(t.dataset.option);
	};
	#m = (e) => {
		if (e.stopPropagation(), this.#o) {
			e.preventDefault();
			return;
		}
		let t = this.#u(), n = t.findIndex((e) => e === document.activeElement);
		switch (e.key) {
			case "ArrowDown":
			case "ArrowRight":
				e.preventDefault(), this.#d(n + 1);
				break;
			case "ArrowUp":
			case "ArrowLeft":
				e.preventDefault(), this.#d(n - 1);
				break;
			case "Home":
				e.preventDefault(), this.#d(0);
				break;
			case "End":
				e.preventDefault(), this.#d(t.length - 1);
				break;
			case "Enter":
			case " ": {
				let t = e.target.closest("[role=\"radio\"]");
				e.preventDefault(), t && this.#f(t.dataset.option);
				break;
			}
			case "Tab":
				this.#h(e);
				break;
			default: {
				let n = Number.parseInt(e.key, 10);
				n >= 1 && n <= t.length && (e.preventDefault(), this.#d(n - 1), this.#f(t[n - 1].dataset.option));
			}
		}
	};
	#h(e) {
		let t = this.#u();
		if (t.length === 0) return;
		e.preventDefault();
		let n = t.findIndex((e) => e === document.activeElement);
		this.#d(n === -1 ? 0 : n);
	}
	#g() {
		requestAnimationFrame(() => {
			fc() ? this.#d(0) : this.querySelector(".fork-question-card")?.focus({ preventScroll: !0 });
		});
	}
	#_() {
		pc(this);
	}
};
customElements.get(hc.tagName) || customElements.define(hc.tagName, hc);
// src/fork/fork-route-card.ts
var gc = class extends X {
	static {
		this.tagName = "fork-route-card";
	}
	#e = null;
	#t = null;
	#n = null;
	#r = null;
	#i = null;
	#a = null;
	#o = null;
	#s = null;
	#c = null;
	#l = null;
	#u = null;
	#d = "hidden";
	#f = null;
	#p = null;
	connectedCallback() {
		super.connectedCallback(), this.#f = new AbortController(), this.#e || (this.#t = Z("div", { class: "fork-card-title fork-route-card-verdict" }), this.#n = Z("p", { class: "fork-card-text fork-route-card-feedback" }), this.#i = Z("span", { class: "fork-kicker" }), this.#a = Z("span", { class: "fork-card-block-title" }), this.#o = Z("span", { class: "fork-card-block-time" }), this.#r = Z("button", {
			class: "fork-card-block fork-route-card-block",
			type: "button"
		}, $("triangle", "fork-card-triangle"), Z("span", { class: "fork-card-block-text" }, this.#i, this.#a), this.#o), this.#e = Z("div", {
			class: "fork-card fork-route-card-card",
			role: "status"
		}, Z("div", { class: "fork-card-body" }, this.#t, this.#n), this.#r), this.#c = Z("span", { class: "fork-toast-number" }), this.#l = Z("span", { class: "fork-kicker" }), this.#u = Z("span", { class: "fork-toast-title" }), this.#s = Z("div", {
			class: "fork-toast",
			role: "status"
		}, this.#c, Z("span", { class: "fork-toast-text" }, this.#l, this.#u)), this.replaceChildren(this.#e, this.#s)), this.#r.addEventListener("click", () => this.engine?.skipTransition(), { signal: this.#f.signal }), this.hidden = !0;
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.#f?.abort(), this.#f = null, this.#p?.abort(), this.#p = null;
	}
	update(e) {
		super.update(e);
		let t = this.engine, n = t?.state;
		if (!t || !n) return;
		let r = n.phase === "transition" ? "card" : n.phase === "merge" ? "toast" : "hidden", i = t.labels;
		if (r === "card" && n.transition) {
			let e = n.transition;
			this.#t.textContent = e.correct ? i.right : i.wrong, this.#n.textContent = e.feedback, this.#n.hidden = !e.feedback;
			let t = e.targetKind === "detour";
			this.#i.textContent = t ? i.closerLook : e.targetKind === "complete" ? i.finishing : i.next, this.#a.textContent = e.targetTitle, this.#o.textContent = e.targetDuration ? Y(e.targetDuration) : "", this.#r.setAttribute("data-tone", t ? "red" : "mustard"), this.setAttribute("data-verdict", e.correct ? "right" : "wrong");
		} else if (r === "toast") {
			let e = t.currentSegment, n = t.state.stats?.mainLine.findIndex((t) => t.id === e?.id) ?? -1;
			this.#c.textContent = n >= 0 ? String(n + 1) : "", this.#l.textContent = i.resumed, this.#u.textContent = e?.title ?? "";
		}
		r !== this.#d && (this.#d = r, this.hidden = r === "hidden", this.setAttribute("data-mode", r), this.#e.hidden = r !== "card", this.#s.hidden = r !== "toast", r === "card" ? (this.#m(), requestAnimationFrame(() => {
			fc() ? this.#r?.focus({ preventScroll: !0 }) : (this.closest("media-container") ?? this.#r)?.focus({ preventScroll: !0 });
		})) : this.#h());
	}
	#m() {
		this.#h();
		let e = this.closest("media-container") ?? this.parentElement;
		e && (this.#p = new AbortController(), e.addEventListener("keydown", (e) => {
			(e.key === "Escape" || e.key === "Enter" || e.key === " ") && (e.preventDefault(), e.stopPropagation(), this.engine?.skipTransition());
		}, {
			signal: this.#p.signal,
			capture: !0
		}));
	}
	#h() {
		this.#p?.abort(), this.#p = null;
	}
};
customElements.get(gc.tagName) || customElements.define(gc.tagName, gc);
// src/fork/fork-detour-badge.ts
var _c = class extends X {
	constructor(...e) {
		super(...e), this.backAfter = .5, this.#e = null, this.#t = null, this.#n = null, this.#r = null, this.#i = null, this.#a = null;
	}
	static {
		this.tagName = "fork-detour-badge";
	}
	static {
		this.properties = { backAfter: {
			type: Number,
			attribute: "back-after"
		} };
	}
	#e;
	#t;
	#n;
	#r;
	#i;
	#a;
	connectedCallback() {
		super.connectedCallback(), this.#a = new AbortController(), this.#e || (this.#e = Z("span", { class: "fork-badge-label" }), this.#t = Z("span", { class: "fork-badge-remaining fork-badge-remaining-long" }), this.#n = Z("span", { class: "fork-badge-remaining fork-badge-remaining-short" }), this.#i = Z("span", {}), this.#r = Z("button", {
			class: "fork-badge-button",
			type: "button",
			hidden: !0
		}, this.#i, Z("kbd", {
			class: "fork-badge-key",
			"aria-hidden": "true"
		}, "B")), this.replaceChildren(Z("span", {
			class: "fork-badge-pill fork-kicker",
			role: "status"
		}, this.#e, this.#t, this.#n), this.#r)), this.#r.addEventListener("click", () => this.engine?.backToRoute(), { signal: this.#a.signal }), (this.closest("media-container") ?? this.parentElement)?.addEventListener("keydown", (e) => {
			e.key !== "b" && e.key !== "B" || this.hidden || this.#r.hidden || (e.preventDefault(), this.engine?.backToRoute());
		}, { signal: this.#a.signal }), this.hidden = !0;
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.#a?.abort(), this.#a = null;
	}
	update(e) {
		super.update(e);
		let t = this.engine, n = t?.currentSegment, r = t?.state;
		if (!t || !n || !r) return;
		let i = n.kind === "detour" && (r.phase === "detour" || r.phase === "merge" || r.phase === "playing");
		if (this.hidden = !i, this.toggleAttribute("data-open", i), !i) return;
		let a = t.labels, o = Math.max(0, n.out - t.currentTime), s = 1 - o / (n.out - n.in);
		this.#e.textContent = a.closerLookBadge, this.#t.textContent = ` · ${K(a.closerLookRemaining, { time: Y(o) })}`, this.#n.textContent = ` · ${Y(o)}`, this.#i.textContent = a.skipCloserLook;
		let c = s >= this.backAfter;
		this.#r.hidden = !c, this.toggleAttribute("data-can-return", c);
	}
};
customElements.get(_c.tagName) || customElements.define(_c.tagName, _c);
// src/fork/fork-screens.ts
var vc = class extends X {
	static {
		this.tagName = "fork-start";
	}
	#e = null;
	#t = null;
	#n = null;
	#r = null;
	#i = null;
	#a = null;
	connectedCallback() {
		super.connectedCallback(), this.#a = new AbortController(), this.#t || (this.#e = Z("span", { class: "fork-kicker fork-start-kicker" }), this.#t = Z("h2", { class: "fork-display fork-start-title" }), this.#n = Z("span", { class: "fork-kicker fork-start-meta" }), this.#i = Z("span", {}), this.#r = Z("button", {
			class: "fork-start-button",
			type: "button"
		}, $("play", "fork-start-play"), this.#i), this.replaceChildren(Z("div", { class: "fork-start-head" }, this.#e, this.#t), Z("div", { class: "fork-start-actions" }, this.#r, this.#n))), this.#r.addEventListener("click", () => {
			this.engine?.start(), pc(this);
		}, { signal: this.#a.signal }), this.hidden = !0;
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.#a?.abort(), this.#a = null;
	}
	update(e) {
		super.update(e);
		let t = this.engine, n = t?.state;
		if (!t || !n?.scenario || !n.stats) return;
		let r = n.phase === "idle";
		if (this.hidden = !r, this.toggleAttribute("data-open", r), !r) return;
		let i = t.labels, a = Math.max(1, Math.round(n.stats.mainDuration / 60)), o = n.stats.questions.length;
		this.#e.textContent = n.scenario.kicker ?? "", this.#e.hidden = !n.scenario.kicker, this.#t.textContent = n.scenario.title, this.#n.textContent = K(o === 1 ? i.lengthOne : i.lengthMany, {
			minutes: a,
			checkpoints: o
		}), this.#i.textContent = i.start;
	}
}, yc = class extends X {
	static {
		this.tagName = "fork-complete";
	}
	#e = null;
	#t = null;
	#n = null;
	#r = null;
	#i = null;
	#a = null;
	#o = null;
	#s = null;
	#c = null;
	#l = !1;
	connectedCallback() {
		super.connectedCallback(), this.#c = new AbortController(), this.#t || (this.#e = Z("span", { class: "fork-kicker fork-complete-kicker" }), this.#t = Z("h2", {
			class: "fork-display fork-complete-title",
			id: "fork-complete-title"
		}), this.#n = Z("span", { class: "fork-complete-score-label" }), this.#r = Z("span", { class: "fork-complete-score" }), this.#a = Z("span", {}), this.#i = Z("button", {
			class: "fork-complete-replay fork-action",
			type: "button",
			"data-tone": "ink"
		}, $("replay", "", 2.5), this.#a), this.#s = Z("span", {}), this.#o = Z("a", {
			class: "fork-complete-next fork-action",
			"data-tone": "mustard",
			href: "#"
		}, $("play"), this.#s), this.replaceChildren(Z("div", {
			class: "fork-complete-surface",
			role: "region",
			"aria-labelledby": "fork-complete-title"
		}, Z("div", { class: "fork-complete-head" }, this.#e, this.#t), Z("div", { class: "fork-complete-block" }, this.#n, this.#r), Z("div", { class: "fork-complete-actions" }, this.#i, this.#o), Z("fork-route-map", {
			size: "expanded",
			class: "fork-complete-line"
		})))), this.#i.addEventListener("click", () => this.engine?.replay(), { signal: this.#c.signal }), this.hidden = !0;
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.#c?.abort(), this.#c = null;
	}
	update(e) {
		super.update(e);
		let t = this.engine, n = t?.state;
		if (!t || !n?.scenario) return;
		let r = n.phase === "complete";
		if (r && !this.#l) {
			let { correct: e, total: r } = t.score, i = t.labels;
			this.#e.textContent = n.scenario.name, this.#t.textContent = i.complete, this.#n.textContent = i.correct, this.#r.textContent = `${e}/${r}`, this.#r.setAttribute("aria-label", K(i.score, {
				correct: e,
				total: r
			})), this.#a.textContent = i.replay;
			let a = n.scenario.nextLesson;
			this.#o.hidden = !a, a && (this.#o.href = a.href, this.#s.textContent = i.nextLesson, this.#o.setAttribute("aria-label", `${i.nextLesson}: ${a.title}`)), fc() && requestAnimationFrame(() => this.#i?.focus({ preventScroll: !0 }));
		}
		r !== this.#l && (this.#l = r, this.hidden = !r, this.toggleAttribute("data-open", r));
	}
};
customElements.get(vc.tagName) || customElements.define(vc.tagName, vc), customElements.get(yc.tagName) || customElements.define(yc.tagName, yc);
// src/fork/pseudo-fullscreen.ts
var bc = "data-fork-pseudo-fullscreen";
function xc() {
	let e = document;
	return !!(e.fullscreenEnabled || e.webkitFullscreenEnabled);
}
function Sc(e) {
	return !!e?.hasAttribute(bc);
}
var Cc = /* @__PURE__ */ new WeakMap(), wc = /* @__PURE__ */ new WeakMap();
function Tc(e) {
	let t = getComputedStyle(e), n = (e) => parseFloat(e) || 0, r = e.querySelector(".fork-bar"), i = e.clientWidth - n(t.paddingLeft) - n(t.paddingRight), a = r && getComputedStyle(r).position !== "absolute" ? r.offsetHeight : 0, o = e.clientHeight - n(t.paddingTop) - n(t.paddingBottom) - a, s = Math.max(0, Math.floor(Math.min(i, o * 16 / 9)));
	e.style.setProperty("--fork-fs-stage-width", `${s}px`), e.style.setProperty("--fork-fs-stage-height", `${Math.round(s * 9 / 16)}px`);
}
function Ec(e) {
	if (wc.has(e)) return;
	let t = () => Tc(e);
	wc.set(e, t), t(), requestAnimationFrame(t), setTimeout(t, 300), window.addEventListener("resize", t), window.visualViewport?.addEventListener("resize", t), window.addEventListener("orientationchange", t);
}
function Dc(e) {
	let t = wc.get(e);
	t && (window.removeEventListener("resize", t), window.visualViewport?.removeEventListener("resize", t), window.removeEventListener("orientationchange", t), wc.delete(e)), e.style.removeProperty("--fork-fs-stage-width"), e.style.removeProperty("--fork-fs-stage-height");
}
function Oc(e, t) {
	if (Sc(e) !== t) {
		if (e.toggleAttribute(bc, t), document.documentElement.toggleAttribute(bc, t), t) {
			Ec(e);
			let t = (t) => {
				t.key === "Escape" && !t.defaultPrevented && Oc(e, !1);
			};
			Cc.set(e, t), document.addEventListener("keydown", t);
		} else {
			Dc(e);
			let t = Cc.get(e);
			t && document.removeEventListener("keydown", t), Cc.delete(e);
		}
		e.dispatchEvent(new CustomEvent("fork-fullscreen-change", {
			bubbles: !0,
			composed: !0,
			detail: { fullscreen: t }
		}));
	}
}
function kc(e) {
	Oc(e, !Sc(e));
}
// src/fork/fork-controls.ts
var Ac = 5, jc = class extends X {
	static {
		this.tagName = "fork-volume-steps";
	}
	#e = new O(this, u, L);
	#t = [];
	#n = null;
	connectedCallback() {
		if (super.connectedCallback(), this.#n = new AbortController(), !this.#t.length) {
			this.setAttribute("role", "group");
			for (let e = Ac; e >= 1; e--) {
				let t = Z("button", {
					class: "fork-volume-step",
					type: "button",
					"data-level": String(e),
					"aria-label": `${Math.round(e / Ac * 100)}%`
				});
				this.#t.push(t), this.append(t);
			}
		}
		this.addEventListener("click", (e) => {
			let t = e.target.closest(".fork-volume-step");
			if (!t) return;
			let n = Number(t.dataset.level) / Ac;
			this.#e.value?.setVolume(n), this.#e.value?.muted && this.#e.value.setMuted(!1);
		}, { signal: this.#n.signal });
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.#n?.abort(), this.#n = null;
	}
	update(e) {
		super.update(e);
		let t = this.#e.value;
		if (!t) return;
		let n = t.muted ? 0 : Math.round(t.volume * Ac);
		for (let e of this.#t) {
			let t = Number(e.dataset.level) <= n;
			e.toggleAttribute("data-on", t), e.setAttribute("aria-pressed", String(t));
		}
		let r = this.engine?.labels;
		this.setAttribute("aria-label", `${r?.volume ?? "Volume"}, ${n} of ${Ac}`);
	}
}, Mc = class extends X {
	static {
		this.tagName = "fork-parts-button";
	}
	#e = null;
	connectedCallback() {
		super.connectedCallback(), this.#e = new AbortController(), this.setAttribute("role", "button"), this.setAttribute("tabindex", "0"), this.setAttribute("aria-pressed", "false"), this.addEventListener("click", () => this.toggle(), { signal: this.#e.signal }), this.addEventListener("keydown", (e) => {
			(e.key === "Enter" || e.key === " ") && (e.preventDefault(), this.toggle());
		}, { signal: this.#e.signal });
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.#e?.abort(), this.#e = null;
	}
	get panel() {
		return this.closest("media-container")?.querySelector("fork-parts") ?? null;
	}
	toggle() {
		this.panel?.toggle();
	}
	update(e) {
		super.update(e);
		let t = this.engine?.labels;
		t && this.setAttribute("aria-label", t.parts), this.setAttribute("aria-pressed", String(this.panel?.open ?? !1));
	}
}, Nc = [
	{
		id: "sound",
		icon: "volume"
	},
	{
		id: "captions",
		icon: "captions"
	},
	{
		id: "parts",
		icon: "parts"
	},
	{
		id: "fullscreen",
		icon: "fullscreen-enter"
	}
], Pc = class extends X {
	static {
		this.tagName = "fork-more";
	}
	#e = new O(this, u, L);
	#t = new O(this, u, ai);
	#n = new O(this, u, ui);
	#r = null;
	#i = null;
	#a = /* @__PURE__ */ new Map();
	#o = null;
	#s = !1;
	connectedCallback() {
		super.connectedCallback(), this.#o = new AbortController();
		let { signal: e } = this.#o;
		if (this.closest("media-container")?.addEventListener("fork-fullscreen-change", () => this.requestUpdate(), { signal: e }), !this.#r) {
			this.#r = Z("button", {
				class: "fork-control fork-more-button",
				type: "button",
				"aria-haspopup": "menu",
				"aria-expanded": "false"
			}, $("more")), this.#i = Z("div", {
				class: "fork-menu",
				role: "menu",
				hidden: !0
			});
			for (let e of Nc) {
				let t = Z("button", {
					class: "fork-menu-item",
					type: "button",
					role: "menuitem",
					"data-item": e.id,
					tabindex: "-1"
				}, $(e.icon, "fork-menu-icon", 2), Z("span", {}));
				this.#a.set(e.id, t), this.#i.append(t);
			}
			this.replaceChildren(this.#r, this.#i);
		}
		this.#r.addEventListener("click", () => this.#s ? this.close() : this.openMenu(), { signal: e }), this.#i.addEventListener("click", this.#c, { signal: e }), this.addEventListener("keydown", this.#l, { signal: e }), document.addEventListener("pointerdown", (e) => {
			this.#s && !this.contains(e.target) && this.close(!1);
		}, {
			signal: e,
			capture: !0
		});
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.#o?.abort(), this.#o = null;
	}
	get menuOpen() {
		return this.#s;
	}
	openMenu() {
		this.#s = !0, this.#i.hidden = !1, this.#r.setAttribute("aria-expanded", "true"), this.toggleAttribute("data-open", !0), this.requestUpdate(), requestAnimationFrame(() => this.#a.get("sound")?.focus());
	}
	close(e = !0) {
		this.#s && (this.#s = !1, this.#i.hidden = !0, this.#r.setAttribute("aria-expanded", "false"), this.toggleAttribute("data-open", !1), e && this.#r.focus());
	}
	#c = (e) => {
		let t = e.target.closest("[data-item]");
		if (!t) return;
		let n = this.closest("media-container");
		switch (t.dataset.item) {
			case "sound": {
				let e = this.#e.value;
				e && e.setMuted(!e.muted);
				break;
			}
			case "captions":
				this.#n.value?.toggleSubtitles();
				break;
			case "parts":
				this.close(!1), n?.querySelector("fork-parts")?.toggle();
				return;
			case "fullscreen": {
				if (n instanceof HTMLElement && !xc()) {
					kc(n);
					break;
				}
				let e = this.#t.value;
				e && (e.isFullscreen ? e.exitFullscreen() : e.requestFullscreen());
				break;
			}
		}
		this.close();
	};
	#l = (e) => {
		if (!this.#s) return;
		let t = Array.from(this.#a.values()), n = t.findIndex((e) => e === document.activeElement);
		switch (e.key) {
			case "Escape":
				e.preventDefault(), e.stopPropagation(), this.close();
				break;
			case "ArrowDown":
				e.preventDefault(), t[(n + 1) % t.length]?.focus();
				break;
			case "ArrowUp":
				e.preventDefault(), t[(n - 1 + t.length) % t.length]?.focus();
				break;
			case "Tab": this.close(!1);
		}
		e.stopPropagation();
	};
	update(e) {
		super.update(e);
		let t = this.engine?.labels;
		if (!t) return;
		this.#r.setAttribute("aria-label", t.more);
		let n = this.#e.value?.muted ?? !1, r = this.#n.value?.subtitlesShowing ?? !1, i = (this.#t.value?.isFullscreen ?? !1) || Sc(this.closest("media-container")), a = (e, t, n, r) => {
			let i = this.#a.get(e);
			i.querySelector("span").textContent = t;
			let a = i.querySelector(".fork-icon");
			a?.getAttribute("data-icon") !== n && a?.replaceWith($(n, "fork-menu-icon", 2)), r === void 0 ? i.removeAttribute("aria-checked") : (i.setAttribute("role", "menuitemcheckbox"), i.setAttribute("aria-checked", String(r)));
		};
		a("sound", n ? t.soundOn : t.soundOff, n ? "volume-off" : "volume"), a("captions", t.captions, "captions", r);
		let o = (this.#n.value?.textTrackList.length ?? 0) > 0;
		this.#a.get("captions").hidden = !o, a("parts", t.parts, "parts"), a("fullscreen", i ? t.exitFullscreen : t.fullscreen, i ? "fullscreen-exit" : "fullscreen-enter");
	}
};
for (let e of [
	jc,
	Mc,
	Pc
]) customElements.get(e.tagName) || customElements.define(e.tagName, e);
// src/fork/fork-parts.ts
var Fc = class extends X {
	static {
		this.tagName = "fork-parts";
	}
	#e = null;
	#t = !1;
	#n = null;
	#r = null;
	#i = "";
	connectedCallback() {
		super.connectedCallback(), this.#n = new AbortController();
		let { signal: e } = this.#n;
		this.#e || (this.#e = Z("nav", { class: "fork-parts-list" }), this.replaceChildren(this.#e)), this.hidden = !0, this.#e.addEventListener("click", (e) => {
			let t = e.target.closest("[data-seek]");
			t && !t.disabled && (this.engine?.seekTo(Number(t.dataset.seek)), this.#a() && this.close());
		}, { signal: e }), this.addEventListener("keydown", (e) => {
			e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), this.close());
		}, { signal: e });
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.#n?.abort(), this.#n = null;
	}
	get open() {
		return this.#t;
	}
	#a() {
		return getComputedStyle(this).getPropertyValue("--fork-parts-mode").trim() === "sheet";
	}
	toggle() {
		this.#t ? this.close() : this.openPanel();
	}
	openPanel() {
		this.#r = document.activeElement instanceof HTMLElement ? document.activeElement : null, this.#t = !0, this.hidden = !1, this.toggleAttribute("data-open", !0), this.#o(), this.requestUpdate(), requestAnimationFrame(() => this.#e?.querySelector("[aria-current=\"true\"], button:not(:disabled)")?.focus());
	}
	close() {
		if (!this.#t) return;
		this.#t = !1, this.hidden = !0, this.toggleAttribute("data-open", !1), this.#o();
		let e = this.closest("media-container")?.querySelector("fork-parts-button, .fork-more-button");
		(this.#r?.isConnected ? this.#r : e)?.focus(), this.#r = null;
	}
	#o() {
		this.closest("media-container")?.querySelector("fork-parts-button")?.requestUpdate();
	}
	update(e) {
		super.update(e);
		let t = this.engine, n = t?.state;
		if (!t || !n?.scenario || !n.stats || !this.#e) return;
		let r = t.labels;
		if (this.#e.setAttribute("aria-label", r.parts), this.#t && (n.phase === "question" || n.phase === "transition" || n.phase === "complete" || n.phase === "idle")) {
			this.close();
			return;
		}
		let i = new Set(n.stats.mainLine.map((e) => e.id)), a = t.currentSegment, o = t.routeSegments.map((e) => `${e.id}:${n.visited.has(e.id) ? "v" : ""}${a?.id === e.id ? "c" : ""}`).join(",");
		if (o === this.#i) return;
		this.#i = o;
		let s = 0, c = t.routeSegments.filter((e) => e.kind !== "confirm").map((e) => {
			let t = i.has(e.id);
			t && s++;
			let o = n.visited.has(e.id), c = a?.id === e.id, l = !o && !c, u = c ? "current" : o ? "watched" : "locked", d = u === "current" ? $("play", "fork-parts-icon") : u === "watched" ? $("check", "fork-parts-icon", 3) : $("lock", "fork-parts-icon", 2.5);
			return d.setAttribute("role", "img"), d.removeAttribute("aria-hidden"), d.setAttribute("aria-label", u === "current" ? r.nowPlaying : u === "watched" ? r.watched : r.lockedPart), Z("button", {
				class: "fork-parts-row",
				type: "button",
				"data-seek": String(e.in),
				"data-status": u,
				"data-kind": e.kind,
				"aria-current": c ? "true" : null,
				disabled: l,
				title: `${e.title} · ${Y(e.out - e.in)}`
			}, Z("span", {
				class: "fork-parts-number",
				"aria-hidden": "true"
			}, t ? String(s) : "+"), Z("span", { class: "fork-parts-title" }, e.title), d);
		});
		this.#e.replaceChildren(...c);
	}
};
customElements.get(Fc.tagName) || customElements.define(Fc.tagName, Fc);
// src/fork/fork-skin.ts
var Ic = 0;
function Lc(e, t, n, r = "") {
	let i = `fork-tip-${++Ic}`;
	return `<${e} class="fork-control ${t}" commandfor="${i}" ${r}>${n}</${e}>
<media-tooltip id="${i}" side="top" class="fork-tooltip"><media-tooltip-label></media-tooltip-label><media-tooltip-shortcut class="fork-tooltip-shortcut"></media-tooltip-shortcut></media-tooltip>`;
}
function Rc() {
	return `
<media-container class="fork-container">
 <div class="fork-frame">
  <div class="fork-stage">
    <div class="fork-media" data-fork-media></div>
    <media-poster class="fork-poster"><img alt="" decoding="async" class="fork-poster-image"></media-poster>

    <fork-scenario></fork-scenario>

    <div class="fork-paused">
      <media-play-button class="fork-paused-button">${Q("play")}</media-play-button>
    </div>

    <media-buffering-indicator class="fork-loading">
      <span class="fork-loading-squares" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="fork-loading-label fork-kicker" data-fork-label="loading"></span>
    </media-buffering-indicator>

    <fork-detour-badge class="fork-badge"></fork-detour-badge>
    <fork-route-card></fork-route-card>
    <fork-parts></fork-parts>
    <fork-start></fork-start>

    <media-error-dialog class="fork-error">
      <media-dialog-backdrop class="fork-error-backdrop"></media-dialog-backdrop>
      <media-dialog-popup class="fork-error-card fork-card">
        <div class="fork-card-body">
          <div class="fork-card-title fork-error-title" data-fork-label="errorTitle"></div>
          <p class="fork-card-text fork-error-text" data-fork-label="errorText"></p>
        </div>
        <media-dialog-close class="fork-card-block fork-error-retry" data-tone="red">
          ${Q("triangle", "fork-card-triangle")}
          <span class="fork-card-block-text"><span class="fork-kicker" data-fork-label="name"></span><span class="fork-card-block-title" data-fork-label="retry"></span></span>
        </media-dialog-close>
      </media-dialog-popup>
    </media-error-dialog>
  </div>

  <fork-question></fork-question>

  <media-controls>
    <media-controls-content class="fork-bar">
      <media-tooltip-group delay="600" close-delay="100">
        ${Lc("media-play-button", "fork-bar-play", Q("play", "fork-icon-play") + Q("pause", "fork-icon-pause"))}
        <fork-time class="fork-bar-time"></fork-time>
        <fork-route-map class="fork-bar-line"></fork-route-map>
        <div class="fork-bar-actions">
          <div class="fork-volume">
            <media-mute-button class="fork-control fork-bar-mute" commandfor="fork-volume-popup">${Q("volume", "fork-icon-volume") + Q("volume-off", "fork-icon-volume-off")}</media-mute-button>
            <media-volume-popover id="fork-volume-popup" class="fork-volume-popover" open-on-hover delay="150" close-delay="250" side="top">
              <fork-volume-steps class="fork-volume-steps"></fork-volume-steps>
            </media-volume-popover>
          </div>
          ${Lc("media-captions-button", "fork-bar-captions", Q("captions"))}
          <fork-parts-button class="fork-control fork-bar-parts">${Q("parts")}</fork-parts-button>
          ${Lc("media-fullscreen-button", "fork-bar-fullscreen", Q("fullscreen-enter", "fork-icon-fullscreen-enter") + Q("fullscreen-exit", "fork-icon-fullscreen-exit"))}
        </div>
        <fork-more class="fork-bar-more"></fork-more>
      </media-tooltip-group>
    </media-controls-content>
  </media-controls>

  <fork-complete></fork-complete>
 </div>

  <media-hotkey keys="Space" action="togglePaused"></media-hotkey>
  <media-hotkey keys="k" action="togglePaused"></media-hotkey>
  <media-hotkey keys="m" action="toggleMuted"></media-hotkey>
  <media-hotkey keys="f" action="toggleFullscreen"></media-hotkey>
  <media-hotkey keys="c" action="toggleSubtitles"></media-hotkey>
  <media-hotkey keys="ArrowLeft" action="seekStep" value="-5"></media-hotkey>
  <media-hotkey keys="ArrowRight" action="seekStep" value="5"></media-hotkey>
  <media-hotkey keys="j" action="seekStep" value="-10"></media-hotkey>
  <media-hotkey keys="l" action="seekStep" value="10"></media-hotkey>
  <media-hotkey keys="ArrowUp" action="volumeStep" value="0.2"></media-hotkey>
  <media-hotkey keys="ArrowDown" action="volumeStep" value="-0.2"></media-hotkey>

  <media-status-announcer></media-status-announcer>
</media-container>`;
}
var zc = class extends HTMLElement {
	static {
		this.tagName = "fork-skin";
	}
	static {
		this.observedAttributes = [
			"scenario-src",
			"reduced-motion",
			"autostart",
			"poster",
			"auto-continue",
			"theme"
		];
	}
	#e = !1;
	connectedCallback() {
		if (this.#e) return;
		this.#e = !0;
		let e = Array.from(this.children).filter((e) => e.tagName !== "SCRIPT"), t = this.querySelector("script[type=\"application/json\"]"), n = document.createElement("template");
		n.innerHTML = Rc();
		let r = n.content, i = r.querySelector("[data-fork-media]");
		for (let t of e) i.before(t);
		i.remove();
		let a = r.querySelector("fork-scenario");
		t && a.append(t), this.#r(a), this.#n(r), this.replaceChildren(r), this.#t();
		let o = this.querySelector(".fork-error-card");
		if (o) {
			let e = ++Ic, t = o.querySelector(".fork-error-title"), n = o.querySelector(".fork-error-text");
			t.id = `fork-error-title-${e}`, n.id = `fork-error-text-${e}`;
			let r = () => {
				o.getAttribute("aria-labelledby") !== t.id && o.setAttribute("aria-labelledby", t.id), o.getAttribute("aria-describedby") !== n.id && o.setAttribute("aria-describedby", n.id);
			};
			r(), new MutationObserver(r).observe(o, {
				attributes: !0,
				attributeFilter: [
					"aria-labelledby",
					"aria-describedby",
					"data-open"
				]
			});
		}
		let s = this.querySelector(".fork-container");
		if (s) {
			let e = () => {
				let e = document, t = document.fullscreenElement ?? e.webkitFullscreenElement ?? null;
				t && (t === s || t.contains(s)) ? Ec(s) : Sc(s) || Dc(s);
			};
			document.addEventListener("fullscreenchange", e), document.addEventListener("webkitfullscreenchange", e);
		}
		if (s && !xc()) {
			s.setAttribute("data-fork-fs-fallback", "");
			let e = s.querySelector("media-fullscreen-button.fork-bar-fullscreen");
			if (e) {
				let t = document.createElement("button");
				t.type = "button", t.className = "fork-control fork-bar-fullscreen", t.innerHTML = e.innerHTML, e.replaceWith(t);
				let n = () => {
					let e = Sc(s);
					t.toggleAttribute("data-fullscreen", e);
					let n = s.querySelector("fork-scenario");
					t.setAttribute("aria-label", e ? n?.labels?.exitFullscreen ?? "Exit fullscreen" : n?.labels?.fullscreen ?? "Fullscreen"), t.setAttribute("aria-pressed", String(e));
				};
				t.addEventListener("click", () => kc(s)), s.addEventListener("fork-fullscreen-change", n), s.addEventListener("fork-change", n, { once: !0 }), n();
			}
			this.addEventListener("keydown", (e) => {
				e.key !== "f" && e.key !== "F" || e.target.closest("input, textarea, [contenteditable], fork-question") || (e.stopImmediatePropagation(), e.preventDefault(), kc(s));
			}, { capture: !0 });
		}
		this.querySelector(".fork-stage")?.addEventListener("click", (e) => {
			if (e.target.closest("button, a, [role=\"button\"], [role=\"dialog\"], [role=\"menu\"], fork-parts, fork-route-card, fork-start, media-dialog-popup")) return;
			let t = this.querySelector("media-container")?.getAttribute("data-fork-phase");
			(t === "playing" || t === "detour" || t === "merge") && this.querySelector(".fork-bar-play")?.click();
		});
	}
	attributeChangedCallback() {
		let e = this.querySelector("fork-scenario");
		e && this.#r(e), this.#e && (this.#n(this), this.#t());
	}
	#t() {
		let e = this.querySelector(".fork-container");
		if (!e) return;
		let t = this.getAttribute("theme");
		t ? e.setAttribute("data-fork-theme", t) : e.removeAttribute("data-fork-theme");
	}
	#n(e) {
		let t = e.querySelector(".fork-poster-image");
		if (!t) return;
		let n = this.getAttribute("poster");
		n ? t.src = n : t.removeAttribute("src");
	}
	#r(e) {
		let t = this.getAttribute("scenario-src");
		t ? e.setAttribute("src", t) : e.removeAttribute("src"), e.toggleAttribute("reduced-motion", this.hasAttribute("reduced-motion")), e.toggleAttribute("autostart", this.hasAttribute("autostart"));
		let n = this.getAttribute("auto-continue");
		n ? e.setAttribute("auto-continue", n) : e.removeAttribute("auto-continue");
	}
	get engine() {
		return this.querySelector("fork-scenario");
	}
};
customElements.get(zc.tagName) || customElements.define(zc.tagName, zc);
export { y as $, K as A, Ye as B, q as C, Zs as D, Ks as E, It as F, te as G, Ze as H, Ft as I, _ as J, C as K, Pt as L, Vt as M, Rt as N, Js as O, N as P, m as Q, wt as R, J as S, Xs as T, k as U, Xe as V, re as W, S as X, b as Y, w as Z, ac as _, Mc as a, Ws as b, vc as c, hc as d, d as et, uc as f, ic as g, $ as h, Pc as i, qs as j, Ys as k, _c as l, Q as m, Rc as n, e as nt, jc as o, lc as p, ee as q, Fc as r, yc as s, zc as t, t as tt, gc as u, $s as v, Qs as w, Y as x, Gs as y, vt as z };
