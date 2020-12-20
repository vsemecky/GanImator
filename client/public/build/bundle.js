
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

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
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
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
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
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/App.svelte generated by Svelte v3.31.0 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (157:2) {#each images as image}
    function create_each_block(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let img_title_value;
    	let t0;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			button = element("button");
    			button.textContent = "X";
    			attr_dev(img, "class", "img-fluid");
    			if (img.src !== (img_src_value = /*image*/ ctx[11].url)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "title", img_title_value = /*image*/ ctx[11].seed);
    			add_location(img, file, 158, 3, 4059);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-sm btn-outline-light");
    			add_location(button, file, 159, 3, 4153);
    			attr_dev(div, "class", "thumb");
    			add_location(div, file, 157, 2, 4035);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						img,
    						"click",
    						function () {
    							if (is_function(/*seedOnClick*/ ctx[1](/*image*/ ctx[11]))) /*seedOnClick*/ ctx[1](/*image*/ ctx[11]).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						button,
    						"click",
    						function () {
    							if (is_function(/*removeImageClick*/ ctx[3](/*image*/ ctx[11].seed))) /*removeImageClick*/ ctx[3](/*image*/ ctx[11].seed).apply(this, arguments);
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

    			if (dirty & /*images*/ 1 && img.src !== (img_src_value = /*image*/ ctx[11].url)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*images*/ 1 && img_title_value !== (img_title_value = /*image*/ ctx[11].seed)) {
    				attr_dev(img, "title", img_title_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(157:2) {#each images as image}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let section;
    	let video;
    	let t0;
    	let canvas_1;
    	let t1;
    	let aside;
    	let t2;
    	let br;
    	let t3;
    	let button0;
    	let t5;
    	let button1;
    	let mounted;
    	let dispose;
    	let each_value = /*images*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			section = element("section");
    			video = element("video");
    			t0 = space();
    			canvas_1 = element("canvas");
    			t1 = space();
    			aside = element("aside");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			br = element("br");
    			t3 = space();
    			button0 = element("button");
    			button0.textContent = "+ Add random seed";
    			t5 = space();
    			button1 = element("button");
    			button1.textContent = "Preload";
    			attr_dev(video, "id", "player");
    			attr_dev(video, "width", "384");
    			attr_dev(video, "height", "640");
    			attr_dev(video, "class", "svelte-aekcly");
    			add_location(video, file, 149, 2, 3708);
    			attr_dev(canvas_1, "id", "canvas");
    			attr_dev(canvas_1, "width", "384");
    			attr_dev(canvas_1, "height", "640");
    			add_location(canvas_1, file, 150, 2, 3763);
    			attr_dev(section, "class", "col-9");
    			add_location(section, file, 147, 1, 3620);
    			add_location(br, file, 162, 2, 4284);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "btn btn-outline-light");
    			add_location(button0, file, 163, 2, 4293);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "btn btn-outline-light");
    			add_location(button1, file, 164, 2, 4399);
    			attr_dev(aside, "id", "sidebar");
    			attr_dev(aside, "class", "col-3");
    			add_location(aside, file, 155, 1, 3972);
    			attr_dev(div, "class", "row");
    			add_location(div, file, 146, 0, 3601);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, section);
    			append_dev(section, video);
    			append_dev(section, t0);
    			append_dev(section, canvas_1);
    			append_dev(div, t1);
    			append_dev(div, aside);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(aside, null);
    			}

    			append_dev(aside, t2);
    			append_dev(aside, br);
    			append_dev(aside, t3);
    			append_dev(aside, button0);
    			append_dev(aside, t5);
    			append_dev(aside, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*addImageClick*/ ctx[2], false, false, false),
    					listen_dev(button1, "click", /*preloadVideos*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*removeImageClick, images, seedOnClick*/ 11) {
    				each_value = /*images*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(aside, t2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
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

    function getVideoUrl(seed1, seed2) {
    	return "/project/video/" + seed1 + "-" + seed2 + ".mp4";
    }

    function sleep(ms) {
    	return new Promise(resolve => setTimeout(resolve, ms));
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { name } = $$props;
    	let images = [];
    	let current_image = { seed: 0, url: "" };

    	// let current_video = "";
    	// Elements
    	let player;

    	let canvas;
    	let context;

    	/**
     * Fetch Project data
     */
    	onMount(async () => {
    		const res = await fetch("/api/project");
    		let project = await res.json();
    		console.log("Project", project);
    		$$invalidate(0, images = project.images);
    		console.log("Images", project.images);
    		current_image = images[0];

    		// current_video = '/project/video/' + images[0].seed + "-" + images[1].seed + ".mp4";
    		player = document.getElementById("player");

    		canvas = document.getElementById("canvas");
    		context = canvas.getContext("2d");
    		context.scale(0.5, 0.5);

    		player.addEventListener(
    			"play",
    			function () {
    				(function loop() {
    					context.drawImage(player, 0, 0);

    					if (!player.ended && !player.paused) {
    						setTimeout(loop, 1000 / 30); // drawing at 30fps
    					}
    				})();
    			},
    			0
    		);

    		// Show first video
    		player.src = getVideoUrl(images[1].seed, current_image.seed);

    		player.autoplay = true;
    		player.muted = true;
    		player.load();
    	});

    	/**
     * User clicked on the image => Set the new current image.
     * @param image
     */
    	function seedOnClick(image) {
    		// Skip if seed is the same
    		if (image.seed == current_image.seed) {
    			return false;
    		}

    		document.body.style.cursor = "progress";
    		console.log("seedOnClick:", image);
    		player.src = getVideoUrl(current_image.seed, image.seed);
    		player.load();

    		player.onloadeddata = function () {
    			player.play();
    			document.body.style.cursor = "default";
    		};

    		current_image = image;
    		preloadSeedVideos(current_image.seed);
    	}

    	async function addImageClick() {
    		console.log("addImageClick()");
    		let seed = prompt("Enter seed (number 1..1000):", (Math.floor(Math.random() * 1000) + 1).toString());

    		if (seed != null) {
    			const res = await fetch("/api/add-image/" + seed);
    			let project = await res.json();
    			$$invalidate(0, images = project.images);
    			console.log("addImage() RESULT", images);
    		}
    	}

    	async function removeImageClick(seed) {
    		console.log("removeImageClick()");

    		if (confirm("Delete image seed #" + seed + " ?")) {
    			const res = await fetch("/api/remove-image/" + seed);
    			let project = await res.json();
    			$$invalidate(0, images = project.images);
    		}
    	}

    	async function preloadVideos() {
    		console.log("preloadVideos()", images);
    		var image1;
    		var image2;

    		for (image1 of images) {
    			for (image2 of images) {
    				await sleep(1000);

    				// Skip interpolation to the same seed
    				if (image1.seed == image2.seed) {
    					continue;
    				}

    				console.log("preloadVideos():", image1.seed, image2.seed);
    				await fetch(getVideoUrl(image1.seed, image2.seed));
    			}
    		}
    	}

    	async function preloadSeedVideos(seed) {
    		await sleep(1000);
    		console.log("preloadSeedVideos(", seed, "): START");
    		let image;

    		for (image of images) {
    			await sleep(500);

    			// Skip interpolation to the same seed
    			if (seed == image.seed) {
    				continue;
    			}

    			// Stop preloading if current_image has been changed
    			if (seed != current_image.seed) {
    				console.log("preloadSeedVideos(", seed, "): STOPPED");
    				return;
    			}

    			// Preload video to the browser cache
    			await fetch(getVideoUrl(seed, image.seed));
    		}

    		console.log("preloadSeedVideos(", seed, "): FINISHED");
    	}

    	const writable_props = ["name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(5, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		name,
    		images,
    		current_image,
    		player,
    		canvas,
    		context,
    		getVideoUrl,
    		sleep,
    		seedOnClick,
    		addImageClick,
    		removeImageClick,
    		preloadVideos,
    		preloadSeedVideos
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(5, name = $$props.name);
    		if ("images" in $$props) $$invalidate(0, images = $$props.images);
    		if ("current_image" in $$props) current_image = $$props.current_image;
    		if ("player" in $$props) player = $$props.player;
    		if ("canvas" in $$props) canvas = $$props.canvas;
    		if ("context" in $$props) context = $$props.context;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [images, seedOnClick, addImageClick, removeImageClick, preloadVideos, name];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { name: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[5] === undefined && !("name" in props)) {
    			console_1.warn("<App> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.querySelector('#app'),
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
