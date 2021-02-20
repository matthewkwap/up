
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* src\loading.svelte generated by Svelte v3.29.0 */

    const file = "src\\loading.svelte";

    function create_fragment(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			attr_dev(div0, "id", "p1");
    			attr_dev(div0, "class", "svelte-1xzij6o");
    			add_location(div0, file, 2, 4, 46);
    			attr_dev(div1, "id", "p2");
    			attr_dev(div1, "class", "svelte-1xzij6o");
    			add_location(div1, file, 3, 4, 71);
    			attr_dev(div2, "id", "p3");
    			attr_dev(div2, "class", "svelte-1xzij6o");
    			add_location(div2, file, 4, 4, 96);
    			attr_dev(div3, "class", "loading svelte-1xzij6o");
    			add_location(div3, file, 1, 0, 19);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Loading", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Loading> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Loading extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Loading",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var emotion_umd_min = createCommonjsModule(function (module, exports) {
    !function(e,r){r(exports);}(commonjsGlobal,function(e){var r=function(){function e(e){this.isSpeedy=void 0===e.speedy||e.speedy,this.tags=[],this.ctr=0,this.nonce=e.nonce,this.key=e.key,this.container=e.container,this.before=null;}var r=e.prototype;return r.insert=function(e){if(this.ctr%(this.isSpeedy?65e3:1)==0){var r,t=function(e){var r=document.createElement("style");return r.setAttribute("data-emotion",e.key),void 0!==e.nonce&&r.setAttribute("nonce",e.nonce),r.appendChild(document.createTextNode("")),r}(this);r=0===this.tags.length?this.before:this.tags[this.tags.length-1].nextSibling,this.container.insertBefore(t,r),this.tags.push(t);}var a=this.tags[this.tags.length-1];if(this.isSpeedy){var n=function(e){if(e.sheet)return e.sheet;for(var r=0;r<document.styleSheets.length;r++)if(document.styleSheets[r].ownerNode===e)return document.styleSheets[r]}(a);try{var i=105===e.charCodeAt(1)&&64===e.charCodeAt(0);n.insertRule(e,i?0:n.cssRules.length);}catch(e){}}else a.appendChild(document.createTextNode(e));this.ctr++;},r.flush=function(){this.tags.forEach(function(e){return e.parentNode.removeChild(e)}),this.tags=[],this.ctr=0;},e}();function t(e){function r(e,r,a){var n=r.trim().split(b);r=n;var i=n.length,s=e.length;switch(s){case 0:case 1:var c=0;for(e=0===s?"":e[0]+" ";c<i;++c)r[c]=t(e,r[c],a).trim();break;default:var o=c=0;for(r=[];c<i;++c)for(var l=0;l<s;++l)r[o++]=t(e[l]+" ",n[c],a).trim();}return r}function t(e,r,t){var a=r.charCodeAt(0);switch(33>a&&(a=(r=r.trim()).charCodeAt(0)),a){case 38:return r.replace(g,"$1"+e.trim());case 58:return e.trim()+r.replace(g,"$1"+e.trim());default:if(0<1*t&&0<r.indexOf("\f"))return r.replace(g,(58===e.charCodeAt(0)?"":"$1")+e.trim())}return e+r}function a(e,r,t,i){var s=e+";",c=2*r+3*t+4*i;if(944===c){e=s.indexOf(":",9)+1;var o=s.substring(e,s.length-1).trim();return o=s.substring(0,e).trim()+o+";",1===z||2===z&&n(o,1)?"-webkit-"+o+o:o}if(0===z||2===z&&!n(s,1))return s;switch(c){case 1015:return 97===s.charCodeAt(10)?"-webkit-"+s+s:s;case 951:return 116===s.charCodeAt(3)?"-webkit-"+s+s:s;case 963:return 110===s.charCodeAt(5)?"-webkit-"+s+s:s;case 1009:if(100!==s.charCodeAt(4))break;case 969:case 942:return "-webkit-"+s+s;case 978:return "-webkit-"+s+"-moz-"+s+s;case 1019:case 983:return "-webkit-"+s+"-moz-"+s+"-ms-"+s+s;case 883:if(45===s.charCodeAt(8))return "-webkit-"+s+s;if(0<s.indexOf("image-set(",11))return s.replace(S,"$1-webkit-$2")+s;break;case 932:if(45===s.charCodeAt(4))switch(s.charCodeAt(5)){case 103:return "-webkit-box-"+s.replace("-grow","")+"-webkit-"+s+"-ms-"+s.replace("grow","positive")+s;case 115:return "-webkit-"+s+"-ms-"+s.replace("shrink","negative")+s;case 98:return "-webkit-"+s+"-ms-"+s.replace("basis","preferred-size")+s}return "-webkit-"+s+"-ms-"+s+s;case 964:return "-webkit-"+s+"-ms-flex-"+s+s;case 1023:if(99!==s.charCodeAt(8))break;return "-webkit-box-pack"+(o=s.substring(s.indexOf(":",15)).replace("flex-","").replace("space-between","justify"))+"-webkit-"+s+"-ms-flex-pack"+o+s;case 1005:return d.test(s)?s.replace(u,":-webkit-")+s.replace(u,":-moz-")+s:s;case 1e3:switch(r=(o=s.substring(13).trim()).indexOf("-")+1,o.charCodeAt(0)+o.charCodeAt(r)){case 226:o=s.replace(v,"tb");break;case 232:o=s.replace(v,"tb-rl");break;case 220:o=s.replace(v,"lr");break;default:return s}return "-webkit-"+s+"-ms-"+o+s;case 1017:if(-1===s.indexOf("sticky",9))break;case 975:switch(r=(s=e).length-10,c=(o=(33===s.charCodeAt(r)?s.substring(0,r):s).substring(e.indexOf(":",7)+1).trim()).charCodeAt(0)+(0|o.charCodeAt(7))){case 203:if(111>o.charCodeAt(8))break;case 115:s=s.replace(o,"-webkit-"+o)+";"+s;break;case 207:case 102:s=s.replace(o,"-webkit-"+(102<c?"inline-":"")+"box")+";"+s.replace(o,"-webkit-"+o)+";"+s.replace(o,"-ms-"+o+"box")+";"+s;}return s+";";case 938:if(45===s.charCodeAt(5))switch(s.charCodeAt(6)){case 105:return o=s.replace("-items",""),"-webkit-"+s+"-webkit-box-"+o+"-ms-flex-"+o+s;case 115:return "-webkit-"+s+"-ms-flex-item-"+s.replace(A,"")+s;default:return "-webkit-"+s+"-ms-flex-line-pack"+s.replace("align-content","").replace(A,"")+s}break;case 973:case 989:if(45!==s.charCodeAt(3)||122===s.charCodeAt(4))break;case 931:case 953:if(!0===x.test(e))return 115===(o=e.substring(e.indexOf(":")+1)).charCodeAt(0)?a(e.replace("stretch","fill-available"),r,t,i).replace(":fill-available",":stretch"):s.replace(o,"-webkit-"+o)+s.replace(o,"-moz-"+o.replace("fill-",""))+s;break;case 962:if(s="-webkit-"+s+(102===s.charCodeAt(5)?"-ms-"+s:"")+s,211===t+i&&105===s.charCodeAt(13)&&0<s.indexOf("transform",10))return s.substring(0,s.indexOf(";",27)+1).replace(h,"$1-webkit-$2")+s}return s}function n(e,r){var t=e.indexOf(1===r?":":"{"),a=e.substring(0,3!==r?t:10);return t=e.substring(t+1,e.length-1),G(2!==r?a:a.replace(C,"$1"),t,r)}function i(e,r){var t=a(r,r.charCodeAt(0),r.charCodeAt(1),r.charCodeAt(2));return t!==r+";"?t.replace(y," or ($1)").substring(4):"("+r+")"}function s(e,r,t,a,n,i,s,c,l,f){for(var u,d=0,h=r;d<_;++d)switch(u=R[d].call(o,e,h,t,a,n,i,s,c,l,f)){case void 0:case!1:case!0:case null:break;default:h=u;}if(h!==r)return h}function c(e){return void 0!==(e=e.prefix)&&(G=null,e?"function"!=typeof e?z=1:(z=2,G=e):z=0),c}function o(e,t){var c=e;if(33>c.charCodeAt(0)&&(c=c.trim()),c=[c],0<_){var o=s(-1,t,c,c,$,O,0,0,0,0);void 0!==o&&"string"==typeof o&&(t=o);}var u=function e(t,c,o,u,d){for(var h,b,g,v,y,A=0,C=0,x=0,S=0,R=0,G=0,I=g=h=0,M=0,W=0,P=0,D=0,F=o.length,L=F-1,T="",q="",B="",H="";M<F;){if(b=o.charCodeAt(M),M===L&&0!==C+S+x+A&&(0!==C&&(b=47===C?10:47),S=x=A=0,F++,L++),0===C+S+x+A){if(M===L&&(0<W&&(T=T.replace(f,"")),0<T.trim().length)){switch(b){case 32:case 9:case 59:case 13:case 10:break;default:T+=o.charAt(M);}b=59;}switch(b){case 123:for(h=(T=T.trim()).charCodeAt(0),g=1,D=++M;M<F;){switch(b=o.charCodeAt(M)){case 123:g++;break;case 125:g--;break;case 47:switch(b=o.charCodeAt(M+1)){case 42:case 47:e:{for(I=M+1;I<L;++I)switch(o.charCodeAt(I)){case 47:if(42===b&&42===o.charCodeAt(I-1)&&M+2!==I){M=I+1;break e}break;case 10:if(47===b){M=I+1;break e}}M=I;}}break;case 91:b++;case 40:b++;case 34:case 39:for(;M++<L&&o.charCodeAt(M)!==b;);}if(0===g)break;M++;}switch(g=o.substring(D,M),0===h&&(h=(T=T.replace(l,"").trim()).charCodeAt(0)),h){case 64:switch(0<W&&(T=T.replace(f,"")),b=T.charCodeAt(1)){case 100:case 109:case 115:case 45:W=c;break;default:W=E;}if(D=(g=e(c,W,g,b,d+1)).length,0<_&&(y=s(3,g,W=r(E,T,P),c,$,O,D,b,d,u),T=W.join(""),void 0!==y&&0===(D=(g=y.trim()).length)&&(b=0,g="")),0<D)switch(b){case 115:T=T.replace(w,i);case 100:case 109:case 45:g=T+"{"+g+"}";break;case 107:g=(T=T.replace(p,"$1 $2"))+"{"+g+"}",g=1===z||2===z&&n("@"+g,3)?"@-webkit-"+g+"@"+g:"@"+g;break;default:g=T+g,112===u&&(q+=g,g="");}else g="";break;default:g=e(c,r(c,T,P),g,u,d+1);}B+=g,g=P=W=I=h=0,T="",b=o.charCodeAt(++M);break;case 125:case 59:if(1<(D=(T=(0<W?T.replace(f,""):T).trim()).length))switch(0===I&&(h=T.charCodeAt(0),45===h||96<h&&123>h)&&(D=(T=T.replace(" ",":")).length),0<_&&void 0!==(y=s(1,T,c,t,$,O,q.length,u,d,u))&&0===(D=(T=y.trim()).length)&&(T="\0\0"),h=T.charCodeAt(0),b=T.charCodeAt(1),h){case 0:break;case 64:if(105===b||99===b){H+=T+o.charAt(M);break}default:58!==T.charCodeAt(D-1)&&(q+=a(T,h,b,T.charCodeAt(2)));}P=W=I=h=0,T="",b=o.charCodeAt(++M);}}switch(b){case 13:case 10:47===C?C=0:0===1+h&&107!==u&&0<T.length&&(W=1,T+="\0"),0<_*N&&s(0,T,c,t,$,O,q.length,u,d,u),O=1,$++;break;case 59:case 125:if(0===C+S+x+A){O++;break}default:switch(O++,v=o.charAt(M),b){case 9:case 32:if(0===S+A+C)switch(R){case 44:case 58:case 9:case 32:v="";break;default:32!==b&&(v=" ");}break;case 0:v="\\0";break;case 12:v="\\f";break;case 11:v="\\v";break;case 38:0===S+C+A&&(W=P=1,v="\f"+v);break;case 108:if(0===S+C+A+j&&0<I)switch(M-I){case 2:112===R&&58===o.charCodeAt(M-3)&&(j=R);case 8:111===G&&(j=G);}break;case 58:0===S+C+A&&(I=M);break;case 44:0===C+x+S+A&&(W=1,v+="\r");break;case 34:case 39:0===C&&(S=S===b?0:0===S?b:S);break;case 91:0===S+C+x&&A++;break;case 93:0===S+C+x&&A--;break;case 41:0===S+C+A&&x--;break;case 40:if(0===S+C+A){if(0===h)switch(2*R+3*G){case 533:break;default:h=1;}x++;}break;case 64:0===C+x+S+A+I+g&&(g=1);break;case 42:case 47:if(!(0<S+A+x))switch(C){case 0:switch(2*b+3*o.charCodeAt(M+1)){case 235:C=47;break;case 220:D=M,C=42;}break;case 42:47===b&&42===R&&D+2!==M&&(33===o.charCodeAt(D+2)&&(q+=o.substring(D,M+1)),v="",C=0);}}0===C&&(T+=v);}G=R,R=b,M++;}if(0<(D=q.length)){if(W=c,0<_&&void 0!==(y=s(2,q,W,t,$,O,D,u,d,u))&&0===(q=y).length)return H+q+B;if(q=W.join(",")+"{"+q+"}",0!=z*j){switch(2!==z||n(q,2)||(j=0),j){case 111:q=q.replace(k,":-moz-$1")+q;break;case 112:q=q.replace(m,"::-webkit-input-$1")+q.replace(m,"::-moz-$1")+q.replace(m,":-ms-input-$1")+q;}j=0;}}return H+q+B}(E,c,t,0,0);return 0<_&&(void 0!==(o=s(-2,u,c,c,$,O,u.length,0,0,0))&&(u=o)),j=0,O=$=1,u}var l=/^\0+/g,f=/[\0\r\f]/g,u=/: */g,d=/zoo|gra/,h=/([,: ])(transform)/g,b=/,\r+?/g,g=/([\t\r\n ])*\f?&/g,p=/@(k\w+)\s*(\S*)\s*/,m=/::(place)/g,k=/:(read-only)/g,v=/[svh]\w+-[tblr]{2}/,w=/\(\s*(.*)\s*\)/g,y=/([\s\S]*?);/g,A=/-self|flex-/g,C=/[^]*?(:[rp][el]a[\w-]+)[^]*/,x=/stretch|:\s*\w+\-(?:conte|avail)/,S=/([^-])(image-set\()/,O=1,$=1,j=0,z=1,E=[],R=[],_=0,G=null,N=0;return o.use=function e(r){switch(r){case void 0:case null:_=R.length=0;break;default:if("function"==typeof r)R[_++]=r;else if("object"==typeof r)for(var t=0,a=r.length;t<a;++t)e(r[t]);else N=0|!!r;}return e},o.set=c,void 0!==e&&c(e),o}function a(e){e&&n.current.insert(e+"}");}var n={current:null},i=function(e,r,t,i,s,c,o,l,f,u){switch(e){case 1:switch(r.charCodeAt(0)){case 64:return n.current.insert(r+";"),"";case 108:if(98===r.charCodeAt(2))return ""}break;case 2:if(0===l)return r+"/*|*/";break;case 3:switch(l){case 102:case 112:return n.current.insert(t[0]+r),"";default:return r+(0===u?"/*|*/":"")}case-2:r.split("/*|*/}").forEach(a);}};var s={animationIterationCount:1,borderImageOutset:1,borderImageSlice:1,borderImageWidth:1,boxFlex:1,boxFlexGroup:1,boxOrdinalGroup:1,columnCount:1,columns:1,flex:1,flexGrow:1,flexPositive:1,flexShrink:1,flexNegative:1,flexOrder:1,gridRow:1,gridRowEnd:1,gridRowSpan:1,gridRowStart:1,gridColumn:1,gridColumnEnd:1,gridColumnSpan:1,gridColumnStart:1,msGridRow:1,msGridRowSpan:1,msGridColumn:1,msGridColumnSpan:1,fontWeight:1,lineHeight:1,opacity:1,order:1,orphans:1,tabSize:1,widows:1,zIndex:1,zoom:1,WebkitLineClamp:1,fillOpacity:1,floodOpacity:1,stopOpacity:1,strokeDasharray:1,strokeDashoffset:1,strokeMiterlimit:1,strokeOpacity:1,strokeWidth:1};var c=/[A-Z]|^ms/g,o=/_EMO_([^_]+?)_([^]*?)_EMO_/g,l=function(e){return 45===e.charCodeAt(1)},f=function(e){return null!=e&&"boolean"!=typeof e},u=function(e){var r={};return function(t){return void 0===r[t]&&(r[t]=e(t)),r[t]}}(function(e){return l(e)?e:e.replace(c,"-$&").toLowerCase()}),d=function(e,r){switch(e){case"animation":case"animationName":if("string"==typeof r)return r.replace(o,function(e,r,t){return b={name:r,styles:t,next:b},r})}return 1===s[e]||l(e)||"number"!=typeof r||0===r?r:r+"px"};function h(e,r,t,a){if(null==t)return "";if(void 0!==t.__emotion_styles)return t;switch(typeof t){case"boolean":return "";case"object":if(1===t.anim)return b={name:t.name,styles:t.styles,next:b},t.name;if(void 0!==t.styles){var n=t.next;if(void 0!==n)for(;void 0!==n;)b={name:n.name,styles:n.styles,next:b},n=n.next;return t.styles+";"}return function(e,r,t){var a="";if(Array.isArray(t))for(var n=0;n<t.length;n++)a+=h(e,r,t[n],!1);else for(var i in t){var s=t[i];if("object"!=typeof s)null!=r&&void 0!==r[s]?a+=i+"{"+r[s]+"}":f(s)&&(a+=u(i)+":"+d(i,s)+";");else if(!Array.isArray(s)||"string"!=typeof s[0]||null!=r&&void 0!==r[s[0]]){var c=h(e,r,s,!1);switch(i){case"animation":case"animationName":a+=u(i)+":"+c+";";break;default:a+=i+"{"+c+"}";}}else for(var o=0;o<s.length;o++)f(s[o])&&(a+=u(i)+":"+d(i,s[o])+";");}return a}(e,r,t);case"function":if(void 0!==e){var i=b,s=t(e);return b=i,h(e,r,s,a)}}if(null==r)return t;var c=r[t];return void 0===c||a?t:c}var b,g=/label:\s*([^\s;\n{]+)\s*;/g,p=function(e,r,t){if(1===e.length&&"object"==typeof e[0]&&null!==e[0]&&void 0!==e[0].styles)return e[0];var a=!0,n="";b=void 0;var i=e[0];null==i||void 0===i.raw?(a=!1,n+=h(t,r,i,!1)):n+=i[0];for(var s=1;s<e.length;s++)n+=h(t,r,e[s],46===n.charCodeAt(n.length-1)),a&&(n+=i[s]);g.lastIndex=0;for(var c,o="";null!==(c=g.exec(n));)o+="-"+c[1];return {name:function(e){for(var r,t=e.length,a=t^t,n=0;t>=4;)r=1540483477*(65535&(r=255&e.charCodeAt(n)|(255&e.charCodeAt(++n))<<8|(255&e.charCodeAt(++n))<<16|(255&e.charCodeAt(++n))<<24))+((1540483477*(r>>>16)&65535)<<16),a=1540483477*(65535&a)+((1540483477*(a>>>16)&65535)<<16)^(r=1540483477*(65535&(r^=r>>>24))+((1540483477*(r>>>16)&65535)<<16)),t-=4,++n;switch(t){case 3:a^=(255&e.charCodeAt(n+2))<<16;case 2:a^=(255&e.charCodeAt(n+1))<<8;case 1:a=1540483477*(65535&(a^=255&e.charCodeAt(n)))+((1540483477*(a>>>16)&65535)<<16);}return a=1540483477*(65535&(a^=a>>>13))+((1540483477*(a>>>16)&65535)<<16),((a^=a>>>15)>>>0).toString(36)}(n)+o,styles:n,next:b}};function m(e,r,t){var a="";return t.split(" ").forEach(function(t){void 0!==e[t]?r.push(e[t]):a+=t+" ";}),a}function k(e,r){if(void 0===e.inserted[r.name])return e.insert("",r,e.sheet,!0)}function v(e,r,t){var a=[],n=m(e,a,t);return a.length<2?t:n+r(a)}var w=function e(r){for(var t="",a=0;a<r.length;a++){var n=r[a];if(null!=n){var i=void 0;switch(typeof n){case"boolean":break;case"object":if(Array.isArray(n))i=e(n);else for(var s in i="",n)n[s]&&s&&(i&&(i+=" "),i+=s);break;default:i=n;}i&&(t&&(t+=" "),t+=i);}}return t},y=function(e){var a=function(e){void 0===e&&(e={});var a,s=e.key||"css";void 0!==e.prefix&&(a={prefix:e.prefix});var c,o=new t(a),l={};c=e.container||document.head;var f,u=document.querySelectorAll("style[data-emotion-"+s+"]");Array.prototype.forEach.call(u,function(e){e.getAttribute("data-emotion-"+s).split(" ").forEach(function(e){l[e]=!0;}),e.parentNode!==c&&c.appendChild(e);}),o.use(e.stylisPlugins)(i),f=function(e,r,t,a){var i=r.name;n.current=t,o(e,r.styles),a&&(d.inserted[i]=!0);};var d={key:s,sheet:new r({key:s,container:c,nonce:e.nonce,speedy:e.speedy}),nonce:e.nonce,inserted:l,registered:{},insert:f};return d}(e);a.sheet.speedy=function(e){this.isSpeedy=e;},a.compat=!0;var s=function(){for(var e=arguments.length,r=new Array(e),t=0;t<e;t++)r[t]=arguments[t];var n=p(r,a.registered,void 0);return function(e,r,t){var a=e.key+"-"+r.name;if(!1===t&&void 0===e.registered[a]&&(e.registered[a]=r.styles),void 0===e.inserted[r.name]){var n=r;do{e.insert("."+a,n,e.sheet,!0),n=n.next;}while(void 0!==n)}}(a,n,!1),a.key+"-"+n.name};return {css:s,cx:function(){for(var e=arguments.length,r=new Array(e),t=0;t<e;t++)r[t]=arguments[t];return v(a.registered,s,w(r))},injectGlobal:function(){for(var e=arguments.length,r=new Array(e),t=0;t<e;t++)r[t]=arguments[t];var n=p(r,a.registered);k(a,n);},keyframes:function(){for(var e=arguments.length,r=new Array(e),t=0;t<e;t++)r[t]=arguments[t];var n=p(r,a.registered),i="animation-"+n.name;return k(a,{name:n.name,styles:"@keyframes "+i+"{"+n.styles+"}"}),i},hydrate:function(e){e.forEach(function(e){a.inserted[e]=!0;});},flush:function(){a.registered={},a.inserted={},a.sheet.flush();},sheet:a.sheet,cache:a,getRegisteredStyles:m.bind(null,a.registered),merge:v.bind(null,a.registered,s)}}(),A=y.flush,C=y.hydrate,x=y.cx,S=y.merge,O=y.getRegisteredStyles,$=y.injectGlobal,j=y.keyframes,z=y.css,E=y.sheet,R=y.cache;e.cache=R,e.css=z,e.cx=x,e.flush=A,e.getRegisteredStyles=O,e.hydrate=C,e.injectGlobal=$,e.keyframes=j,e.merge=S,e.sheet=E,Object.defineProperty(e,"__esModule",{value:!0});});

    });

    /* src\Info.svelte generated by Svelte v3.29.0 */

    const { console: console_1 } = globals;
    const file$1 = "src\\Info.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    // (227:8) {:else }
    function create_else_block(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*dat*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*g*/ ctx[22].todo_id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "cards svelte-13gn7o4");
    			add_location(div, file$1, 227, 6, 5282);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*sett, dat, deleteTodo*/ 2177) {
    				const each_value = /*dat*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block, null, get_each_context);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(227:8) {:else }",
    		ctx
    	});

    	return block;
    }

    // (222:25) 
    function create_if_block_1(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "faild 👽👽";
    			t1 = space();
    			button = element("button");
    			button.textContent = "Try Again";
    			add_location(h1, file$1, 223, 14, 5132);
    			attr_dev(button, "id", "faild");
    			attr_dev(button, "class", "svelte-13gn7o4");
    			add_location(button, file$1, 224, 14, 5167);
    			attr_dev(div, "class", "fail svelte-13gn7o4");
    			add_location(div, file$1, 222, 10, 5098);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*getTodos*/ ctx[10], false, false, false),
    					listen_dev(button, "click", /*f*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(222:25) ",
    		ctx
    	});

    	return block;
    }

    // (220:10) {#if loading && !faid}
    function create_if_block(ctx) {
    	let loading_1;
    	let current;
    	loading_1 = new Loading({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(loading_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loading_1, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loading_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loading_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loading_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(220:10) {#if loading && !faid}",
    		ctx
    	});

    	return block;
    }

    // (240:12) {#if g.description.includes("http")}
    function create_if_block_2(ctx) {
    	let embed;
    	let embed_src_value;

    	const block = {
    		c: function create() {
    			embed = element("embed");
    			attr_dev(embed, "id", "em");
    			attr_dev(embed, "type", "text/html");
    			if (embed.src !== (embed_src_value = /*g*/ ctx[22].description)) attr_dev(embed, "src", embed_src_value);
    			attr_dev(embed, "width", "auto");
    			attr_dev(embed, "height", "200");
    			attr_dev(embed, "class", "svelte-13gn7o4");
    			add_location(embed, file$1, 240, 14, 5730);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, embed, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dat*/ 1 && embed.src !== (embed_src_value = /*g*/ ctx[22].description)) {
    				attr_dev(embed, "src", embed_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(embed);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(240:12) {#if g.description.includes(\\\"http\\\")}",
    		ctx
    	});

    	return block;
    }

    // (229:6) {#each dat as g(g.todo_id)}
    function create_each_block(key_1, ctx) {
    	let div1;
    	let button0;
    	let t0;
    	let button0_id_value;
    	let t1;
    	let div0;
    	let h1;
    	let t2_value = /*g*/ ctx[22].description + "";
    	let t2;
    	let t3;
    	let show_if = /*g*/ ctx[22].description.includes("http");
    	let t4;
    	let button1;
    	let t6;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[15](/*g*/ ctx[22], ...args);
    	}

    	let if_block = show_if && create_if_block_2(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div1 = element("div");
    			button0 = element("button");
    			t0 = text("x");
    			t1 = space();
    			div0 = element("div");
    			h1 = element("h1");
    			t2 = text(t2_value);
    			t3 = space();
    			if (if_block) if_block.c();
    			t4 = space();
    			button1 = element("button");
    			button1.textContent = "Edit";
    			t6 = space();
    			attr_dev(button0, "classname", "btn btn-danger");
    			attr_dev(button0, "id", button0_id_value = (/*g*/ ctx[22].todo_id, "dbt"));
    			attr_dev(button0, "class", "svelte-13gn7o4");
    			add_location(button0, file$1, 230, 8, 5381);
    			attr_dev(h1, "id", "pd");
    			attr_dev(h1, "class", "svelte-13gn7o4");
    			add_location(h1, file$1, 237, 14, 5611);
    			attr_dev(div0, "id", "mo");
    			add_location(div0, file$1, 236, 12, 5581);
    			attr_dev(button1, "id", "edt2");
    			attr_dev(button1, "class", "svelte-13gn7o4");
    			add_location(button1, file$1, 245, 11, 5887);
    			attr_dev(div1, "class", "card svelte-13gn7o4");
    			add_location(div1, file$1, 229, 6, 5344);
    			this.first = div1;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, button0);
    			append_dev(button0, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t2);
    			append_dev(div0, t3);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div1, t4);
    			append_dev(div1, button1);
    			append_dev(div1, t6);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", click_handler, false, false, false),
    					listen_dev(
    						button1,
    						"click",
    						function () {
    							if (is_function(/*sett*/ ctx[7](/*g*/ ctx[22].todo_id, /*g*/ ctx[22].description))) /*sett*/ ctx[7](/*g*/ ctx[22].todo_id, /*g*/ ctx[22].description).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*dat*/ 1 && button0_id_value !== (button0_id_value = (/*g*/ ctx[22].todo_id, "dbt"))) {
    				attr_dev(button0, "id", button0_id_value);
    			}

    			if (dirty & /*dat*/ 1 && t2_value !== (t2_value = /*g*/ ctx[22].description + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*dat*/ 1) show_if = /*g*/ ctx[22].description.includes("http");

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(229:6) {#each dat as g(g.todo_id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div4;
    	let article;
    	let div0;
    	let button0;
    	let t1;
    	let div2;
    	let div1;
    	let button1;
    	let t3;
    	let button2;
    	let t5;
    	let textarea0;
    	let div2_class_value;
    	let t6;
    	let h10;
    	let t7;
    	let div3;
    	let h11;
    	let t9;
    	let textarea1;
    	let t10;
    	let button3;
    	let t12;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block, create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*loading*/ ctx[1] && !/*faid*/ ctx[4]) return 0;
    		if (/*faid*/ ctx[4]) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			article = element("article");
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "out";
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			button1 = element("button");
    			button1.textContent = "x";
    			t3 = space();
    			button2 = element("button");
    			button2.textContent = "Edit!";
    			t5 = space();
    			textarea0 = element("textarea");
    			t6 = space();
    			h10 = element("h1");
    			t7 = space();
    			div3 = element("div");
    			h11 = element("h1");
    			h11.textContent = "Todo List";
    			t9 = space();
    			textarea1 = element("textarea");
    			t10 = space();
    			button3 = element("button");
    			button3.textContent = "Add";
    			t12 = space();
    			if_block.c();
    			attr_dev(button0, "id", "so");
    			attr_dev(button0, "class", "svelte-13gn7o4");
    			add_location(button0, file$1, 197, 4, 4375);
    			add_location(div0, file$1, 196, 2, 4364);
    			attr_dev(button1, "id", "cbt");
    			attr_dev(button1, "class", "svelte-13gn7o4");
    			add_location(button1, file$1, 203, 15, 4526);
    			attr_dev(button2, "id", "ebt");
    			attr_dev(button2, "class", "svelte-13gn7o4");
    			add_location(button2, file$1, 204, 10, 4582);
    			attr_dev(textarea0, "id", "ei");
    			attr_dev(textarea0, "class", "svelte-13gn7o4");
    			add_location(textarea0, file$1, 205, 10, 4654);
    			attr_dev(div1, "class", "int svelte-13gn7o4");
    			attr_dev(div1, "id", "animate");
    			add_location(div1, file$1, 202, 10, 4479);
    			attr_dev(div2, "class", div2_class_value = "" + (null_to_empty(/*o*/ ctx[5]) + " svelte-13gn7o4"));
    			add_location(div2, file$1, 200, 6, 4441);
    			attr_dev(h10, "id", "status");
    			add_location(h10, file$1, 211, 4, 4768);
    			attr_dev(h11, "id", "p");
    			attr_dev(h11, "class", "svelte-13gn7o4");
    			add_location(h11, file$1, 214, 6, 4823);
    			attr_dev(textarea1, "id", "text");
    			attr_dev(textarea1, "type", "text");
    			attr_dev(textarea1, "class", "svelte-13gn7o4");
    			add_location(textarea1, file$1, 215, 6, 4856);
    			attr_dev(button3, "id", "bt");
    			attr_dev(button3, "class", "svelte-13gn7o4");
    			add_location(button3, file$1, 216, 6, 4933);
    			attr_dev(div3, "id", "inp");
    			attr_dev(div3, "class", "svelte-13gn7o4");
    			add_location(div3, file$1, 213, 4, 4801);
    			add_location(article, file$1, 195, 4, 4351);
    			add_location(div4, file$1, 194, 2, 4340);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, article);
    			append_dev(article, div0);
    			append_dev(div0, button0);
    			append_dev(article, t1);
    			append_dev(article, div2);
    			append_dev(div2, div1);
    			append_dev(div1, button1);
    			append_dev(div1, t3);
    			append_dev(div1, button2);
    			append_dev(div1, t5);
    			append_dev(div1, textarea0);
    			set_input_value(textarea0, /*newinfo*/ ctx[3]);
    			append_dev(article, t6);
    			append_dev(article, h10);
    			append_dev(article, t7);
    			append_dev(article, div3);
    			append_dev(div3, h11);
    			append_dev(div3, t9);
    			append_dev(div3, textarea1);
    			set_input_value(textarea1, /*inputinfo*/ ctx[2]);
    			append_dev(div3, t10);
    			append_dev(div3, button3);
    			append_dev(article, t12);
    			if_blocks[current_block_type_index].m(article, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", go, false, false, false),
    					listen_dev(button1, "click", /*close*/ ctx[6], false, false, false),
    					listen_dev(button2, "click", /*updateDescription*/ ctx[12], false, false, false),
    					listen_dev(textarea0, "input", /*textarea0_input_handler*/ ctx[13]),
    					listen_dev(textarea1, "input", /*textarea1_input_handler*/ ctx[14]),
    					listen_dev(button3, "click", /*onSubmitForm*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*newinfo*/ 8) {
    				set_input_value(textarea0, /*newinfo*/ ctx[3]);
    			}

    			if (!current || dirty & /*o*/ 32 && div2_class_value !== (div2_class_value = "" + (null_to_empty(/*o*/ ctx[5]) + " svelte-13gn7o4"))) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (dirty & /*inputinfo*/ 4) {
    				set_input_value(textarea1, /*inputinfo*/ ctx[2]);
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(article, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function go() {
    	localStorage.clear();
    	window.location = "/";
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Info", slots, []);
    	const { css } = emotion_umd_min;
    	let url = "";
    	let dat = [];
    	let loading = true;
    	let inputinfo;
    	let set;
    	let de;
    	let newinfo;
    	let faid = false;

    	let bo = css`
      display: none;`;

    	let o = css`
      display:none;
     
      
      `;

    	let fai = css`display:none;`;

    	function close() {
    		$$invalidate(5, o = css`
          display:none;
          `);
    	}

    	function sett(id, des) {
    		set = id;
    		de = des;
    		$$invalidate(3, newinfo = de);
    		console.log(id);

    		$$invalidate(5, o = css`
          
          position:fixed;
          display:block;
          z-index:1;
          width:100%;
          height:100%;
          top: -50px;
          left: 0;
          padding-top: 60px;
          
          background-color:rgba(0, 0, 0, 0.308);
      
          
          
          `);
    	}

    	const onSubmitForm = async () => {
    		if (inputinfo.length == 0) {
    			console.log("hello");
    		} else {
    			let a = localStorage.getItem("dv");
    			var d = new Date();

    			let me = {
    				year: d.getFullYear(),
    				month: d.getMonth() + 1,
    				day: d.getDate()
    			};

    			try {
    				let info = { descript: inputinfo, db: a, time: me };
    				const body = { info };
    				console.log(a);

    				const response = await fetch(`http://localhost:3000/todos/`, {
    					method: "POST",
    					headers: { "Content-Type": "application/json" },
    					body: JSON.stringify(body)
    				});

    				$$invalidate(1, loading = true);
    				$$invalidate(2, inputinfo = "");
    			} catch(error) {
    				console.log(error.message);
    			}

    			try {
    				setTimeout(
    					async () => {
    						const response = await fetch(`http://localhost:3000/todos/${a}`);
    						const jsonData = await response.json();
    						console.log(jsonData);
    						$$invalidate(0, dat = jsonData);
    						$$invalidate(1, loading = false);
    					},
    					1000
    				);
    			} catch(err) {
    				console.error(err.message);
    			}
    		}
    	};

    	function f() {
    		$$invalidate(4, faid = false);
    	}

    	const getTodos = async () => {
    		let a = localStorage.getItem("dv");

    		try {
    			const response = await fetch(`http://localhost:3000/todos/${a}`);
    			const jsonData = await response.json();
    			console.log(jsonData);
    			$$invalidate(0, dat = jsonData);
    			$$invalidate(1, loading = false);
    		} catch(err) {
    			fai = `display:block;`;
    			$$invalidate(4, faid = true);
    			console.error(err.message);
    		}
    	};

    	const deleteTodo = async id => {
    		let a = localStorage.getItem("dv");

    		try {
    			const deleteTodo = await fetch(`http://localhost:3000/todos/${a}/${id}`, {
    				headers: { "Content-Type": "application/json" },
    				url: "https://localhost:44346/Order/Order/GiveOrder",
    				method: "DELETE"
    			});

    			$$invalidate(1, loading = true);
    		} catch(err) {
    			console.error(err.message);
    		}

    		try {
    			const response = await fetch(`http://localhost:3000/todos/${a}`);
    			const jsonData = await response.json();
    			console.log(jsonData);
    			$$invalidate(0, dat = jsonData);
    			$$invalidate(1, loading = false);
    		} catch(err) {
    			console.error(err.message);
    		}
    	};

    	const updateDescription = async () => {
    		let a = localStorage.getItem("dv");
    		let oh = { des: newinfo, idous: set, db: a };
    		console.log(JSON.stringify(`${oh}`));

    		try {
    			const response = await fetch(`http://localhost:3000/todos/`, {
    				method: "PUT",
    				headers: { "Content-Type": "application/json" },
    				body: JSON.stringify(oh)
    			});

    			window.location = "/";
    		} catch(err) {
    			console.error(err.message);
    		}
    	};

    	getTodos();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Info> was created with unknown prop '${key}'`);
    	});

    	function textarea0_input_handler() {
    		newinfo = this.value;
    		$$invalidate(3, newinfo);
    	}

    	function textarea1_input_handler() {
    		inputinfo = this.value;
    		$$invalidate(2, inputinfo);
    	}

    	const click_handler = g => deleteTodo(g.todo_id);

    	$$self.$capture_state = () => ({
    		Loading,
    		emotion: emotion_umd_min,
    		emo: emotion_umd_min,
    		css,
    		url,
    		dat,
    		loading,
    		inputinfo,
    		set,
    		de,
    		newinfo,
    		faid,
    		bo,
    		o,
    		fai,
    		close,
    		sett,
    		onSubmitForm,
    		f,
    		getTodos,
    		deleteTodo,
    		updateDescription,
    		go
    	});

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) url = $$props.url;
    		if ("dat" in $$props) $$invalidate(0, dat = $$props.dat);
    		if ("loading" in $$props) $$invalidate(1, loading = $$props.loading);
    		if ("inputinfo" in $$props) $$invalidate(2, inputinfo = $$props.inputinfo);
    		if ("set" in $$props) set = $$props.set;
    		if ("de" in $$props) de = $$props.de;
    		if ("newinfo" in $$props) $$invalidate(3, newinfo = $$props.newinfo);
    		if ("faid" in $$props) $$invalidate(4, faid = $$props.faid);
    		if ("bo" in $$props) bo = $$props.bo;
    		if ("o" in $$props) $$invalidate(5, o = $$props.o);
    		if ("fai" in $$props) fai = $$props.fai;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		dat,
    		loading,
    		inputinfo,
    		newinfo,
    		faid,
    		o,
    		close,
    		sett,
    		onSubmitForm,
    		f,
    		getTodos,
    		deleteTodo,
    		updateDescription,
    		textarea0_input_handler,
    		textarea1_input_handler,
    		click_handler
    	];
    }

    class Info extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Info",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\log.svelte generated by Svelte v3.29.0 */

    const { console: console_1$1 } = globals;
    const file$2 = "src\\log.svelte";

    function create_fragment$2(ctx) {
    	let div1;
    	let form;
    	let div0;
    	let input0;
    	let t;
    	let input1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			form = element("form");
    			div0 = element("div");
    			input0 = element("input");
    			t = space();
    			input1 = element("input");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Identification info");
    			attr_dev(input0, "id", "demo");
    			attr_dev(input0, "name", "user");
    			attr_dev(input0, "class", "svelte-10ovmgl");
    			add_location(input0, file$2, 80, 12, 2444);
    			attr_dev(input1, "type", "button");
    			attr_dev(input1, "class", "submit svelte-10ovmgl");
    			input1.value = "log in";
    			add_location(input1, file$2, 82, 12, 2561);
    			attr_dev(div0, "id", "fored");
    			add_location(div0, file$2, 79, 6, 2414);
    			add_location(form, file$2, 78, 7, 2400);
    			add_location(div1, file$2, 75, 3, 2372);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, form);
    			append_dev(form, div0);
    			append_dev(div0, input0);
    			set_input_value(input0, /*id*/ ctx[0]);
    			append_dev(div0, t);
    			append_dev(div0, input1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[2]),
    					listen_dev(input1, "click", /*user*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*id*/ 1 && input0.value !== /*id*/ ctx[0]) {
    				set_input_value(input0, /*id*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Log", slots, []);
    	let authenticated = true;
    	let id;
    	let lo = true;
    	let pass;

    	/*
     let l = localStorage.getItem("log");
     let l1 = localStorage.getItem("log1");
     let l2 = localStorage.getItem("log2");
     let l3 = localStorage.getItem("log3");
     let l4 = localStorage.getItem("log4");
     function boo(){
     if(l == "adj1oj4nrofri59onvfdvd"&& l1=="adj1oj4nrovd" && l2 == "adj159onvfdvd" && l3 =="adj1oj4nr9onvfdvd" && l4 == "adj1orofri59onvfdvd"){
           authenticated = true;
           lo = true;
         } 
     }
     function auth(){
       let user = {
           id: id,
           password:pass
         };
        
       if(user.id == "matthew" && user.password == "matthew"){
         authenticated = true
         lo = true
         console.log("succes");
         localStorage.setItem("log","adj1oj4nrofri59onvfdvd");
         localStorage.setItem("log1","adj1oj4nrovd");
         localStorage.setItem("log2","adj159onvfdvd");
         localStorage.setItem("log3","adj1oj4nr9onvfdvd");
         localStorage.setItem("log4","adj1orofri59onvfdvd");
         
        
       }else{
         console.log("failed");
         alert("your inputs are wrong")
       }
     }
     boo();*/
    	async function user() {
    		let user = { id };

    		let response = await fetch("http://localhost:3000/auth", {
    			method: "POST",
    			headers: {
    				"Content-Type": "application/json;charset=utf-8"
    			},
    			body: JSON.stringify(user)
    		});

    		const dat = await response.json();
    		console.log(dat);
    		authenticated = dat.authenticated;
    		localStorage.setItem("auth", dat.authenticated);
    		localStorage.setItem("id", dat.userid);
    		localStorage.setItem("dv", dat.db);

    		if (!authenticated) {
    			alert("Your Account Was Not Recognised");
    		}

    		console.log(authenticated);
    		window.location = "/";
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Log> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		id = this.value;
    		$$invalidate(0, id);
    	}

    	$$self.$capture_state = () => ({
    		writable,
    		Info,
    		authenticated,
    		id,
    		lo,
    		pass,
    		Loading,
    		user
    	});

    	$$self.$inject_state = $$props => {
    		if ("authenticated" in $$props) authenticated = $$props.authenticated;
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("lo" in $$props) lo = $$props.lo;
    		if ("pass" in $$props) pass = $$props.pass;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [id, user, input0_input_handler];
    }

    class Log extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Log",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.29.0 */

    const { console: console_1$2 } = globals;
    const file$3 = "src\\App.svelte";

    // (117:5) {:else}
    function create_else_block$1(ctx) {
    	let info;
    	let current;
    	info = new Info({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(info.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(info, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(info.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(info, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(117:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (113:19) 
    function create_if_block_2$1(ctx) {
    	let loading;
    	let current;
    	loading = new Loading({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(loading.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loading, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loading.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loading.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loading, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(113:19) ",
    		ctx
    	});

    	return block;
    }

    // (110:21) 
    function create_if_block_1$1(ctx) {
    	let log;
    	let t0;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	log = new Log({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(log.$$.fragment);
    			t0 = space();
    			button = element("button");
    			button.textContent = "Sign up";
    			attr_dev(button, "id", "dem");
    			attr_dev(button, "class", "svelte-a713c");
    			add_location(button, file$3, 111, 6, 2202);
    		},
    		m: function mount(target, anchor) {
    			mount_component(log, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, button, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*stig*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(log.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(log.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(log, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(110:21) ",
    		ctx
    	});

    	return block;
    }

    // (92:3) {#if !authenticated && !sign }
    function create_if_block$1(ctx) {
    	let form;
    	let div;
    	let input0;
    	let t0;
    	let input1;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			div = element("div");
    			input0 = element("input");
    			t0 = space();
    			input1 = element("input");
    			t1 = space();
    			button = element("button");
    			button.textContent = "have an existing id";
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Create ID");
    			attr_dev(input0, "id", "demo");
    			attr_dev(input0, "name", "user");
    			attr_dev(input0, "class", "svelte-a713c");
    			add_location(input0, file$3, 102, 10, 1897);
    			attr_dev(input1, "type", "button");
    			attr_dev(input1, "class", "submit svelte-a713c");
    			input1.value = "create";
    			add_location(input1, file$3, 104, 10, 2000);
    			attr_dev(div, "id", "for");
    			add_location(div, file$3, 100, 4, 1859);
    			add_location(form, file$3, 98, 5, 1847);
    			attr_dev(button, "id", "de");
    			attr_dev(button, "class", "svelte-a713c");
    			add_location(button, file$3, 108, 6, 2101);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div);
    			append_dev(div, input0);
    			set_input_value(input0, /*id*/ ctx[1]);
    			append_dev(div, t0);
    			append_dev(div, input1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[7]),
    					listen_dev(input1, "click", /*user*/ ctx[4], false, false, false),
    					listen_dev(button, "click", /*sig*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*id*/ 2 && input0.value !== /*id*/ ctx[1]) {
    				set_input_value(input0, /*id*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(92:3) {#if !authenticated && !sign }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$1, create_if_block_1$1, create_if_block_2$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*authenticated*/ ctx[0] && !/*sign*/ ctx[2]) return 0;
    		if (/*sign*/ ctx[2]) return 1;
    		if (!/*lo*/ ctx[3]) return 2;
    		return 3;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			add_location(div, file$3, 87, 1, 1784);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let authenticated = false;
    	let id;
    	let sign = false;
    	let lo = false;
    	let pass;
    	let files;
    	let dataFile = null;
    	let a = localStorage.getItem("auth");
    	console.log(authenticated);

    	function boo() {
    		if (a === "true") {
    			$$invalidate(0, authenticated = true);
    			$$invalidate(3, lo = true);
    		}
    	}

    	boo();

    	async function user() {
    		try {
    			let user = { id };

    			let response = await fetch("http://localhost:4000/newuser", {
    				method: "POST",
    				headers: {
    					"Content-Type": "application/json;charset=utf-8"
    				},
    				body: JSON.stringify(user)
    			});

    			const dat = await response.json();
    			console.log(dat);
    			console.log();

    			if (dat.created === true) {
    				$$invalidate(0, authenticated = true);
    				$$invalidate(3, lo = true);
    			} else {
    				$$invalidate(0, authenticated = false);
    			}

    			localStorage.setItem("id", dat.userid.userid);
    			localStorage.setItem("dv", dat.db.userid);
    			localStorage.setItem("auth", dat.created);
    			window.location = "/";

    			if (!authenticated) {
    				alert("an error occured while trying to create a new a");
    			}

    			console.log(authenticated);
    		} catch(error) {
    			alert("An Error Occured While Trying To Create =Your Account");
    		}
    	}

    	function sig() {
    		$$invalidate(2, sign = true);
    	}

    	function stig() {
    		$$invalidate(2, sign = false);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		id = this.value;
    		$$invalidate(1, id);
    	}

    	$$self.$capture_state = () => ({
    		writable,
    		Info,
    		Log,
    		authenticated,
    		id,
    		sign,
    		lo,
    		pass,
    		Loading,
    		files,
    		dataFile,
    		a,
    		boo,
    		user,
    		sig,
    		stig
    	});

    	$$self.$inject_state = $$props => {
    		if ("authenticated" in $$props) $$invalidate(0, authenticated = $$props.authenticated);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("sign" in $$props) $$invalidate(2, sign = $$props.sign);
    		if ("lo" in $$props) $$invalidate(3, lo = $$props.lo);
    		if ("pass" in $$props) pass = $$props.pass;
    		if ("files" in $$props) files = $$props.files;
    		if ("dataFile" in $$props) dataFile = $$props.dataFile;
    		if ("a" in $$props) a = $$props.a;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [authenticated, id, sign, lo, user, sig, stig, input0_input_handler];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
