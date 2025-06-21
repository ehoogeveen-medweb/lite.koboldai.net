// Utility helper functions for data processing
function buf_to_b64(buffer) { //converts a buffer to base64 string
	var binary = "";
	var bytes = new Uint8Array(buffer);
	var len = bytes.byteLength;
	for (var i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	var b64 = window.btoa(binary);
	return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64_to_buf(base64) { //converts a base64 string to a byte buffer
	while (base64.length % 4 !== 0) {
		base64 += "=";
	}
	base64 = base64.replace(/-/g, "+").replace(/_/g, "/");
	var binary_string = window.atob(base64);
	var len = binary_string.length;
	var bytes = new Uint8Array(len);
	for (var i = 0; i < len; i++) {
		bytes[i] = binary_string.charCodeAt(i);
	}
	return bytes;
}
function b64_decode_unicode(str) { //helper function for wav file convert
	return decodeURIComponent(
		Array.prototype.map.call(atob(str), function(c) {
			return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
		}).join(""),
	);
}
function cyrb_hash(str, seed = 0, hashBytes = 3) { //generate a unique hash from a model name
	let h1 = 0xdeadbeef ^ seed;
	let h2 = 0x41c6ce57 ^ seed;
	for (let i = 0, ch; i < str.length; i++) {
		ch = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
	let hsh = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
	//truncate to first 3 bytes
	return hsh.substring(0, hashBytes * 2);
}
function basic_lcg(seed) { // simple RNG for reproducible dice rolls
	var m = Math.pow(2, 35) - 31;
	var a = 185852;
	var s = seed % m;
	return function() {
		s = (s * a) % m;
		return s / m;
	};
}
function import_props_into_object(existingObj, objToImport) { //import new fields from one object into another while preserving exsting
	for (var k in objToImport) {
		existingObj[k] = objToImport[k];
	}
}
function is_numeric(n) //determines if value is a number
{
	return !isNaN(parseFloat(n)) && isFinite(n);
}
function replaceAll(str, find, replace, caseInsensitive = false) //replace all occurances in string with string
{
	function escapeRegExp(string) {
		return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
	}

	return str.replace(new RegExp(escapeRegExp(find), caseInsensitive ? "gi" : "g"), replace);
}
function rgb_to_hex(rgbColor) { //convert rgb color to hex
	rgbColor = rgbColor.split("(")[1];
	rgbColor = rgbColor.split(")")[0];
	const components = rgbColor.split(",");
	const red = parseInt(components[0]);
	const green = parseInt(components[1]);
	const blue = parseInt(components[2]);
	const redHex = red.toString(16).padStart(2, "0");
	const greenHex = green.toString(16).padStart(2, "0");
	const blueHex = blue.toString(16).padStart(2, "0");
	return `#${redHex}${greenHex}${blueHex}`;
}
function get_unique_color(idx) //get a unique color code for a chat name
{
	const colors = ["color_chat1", "color_chat2", "color_chat3", "color_chat4"];
	return colors[idx % colors.length];
}
function format_json_error(data) //formats an error reply as json truncated to 500 chars
{
	let formatted = "Unknown";
	if (data) {
		formatted = JSON.stringify(data);
		if (formatted && formatted != "") {
			formatted = formatted.substring(0, 500);
		} else {
			formatted = "Unknown";
		}
	}
	return formatted;
}
function compare_version_str(a, b) { // compare two kcpp versions, if a>b return positive value, a=b return 0
	var i, diff;
	var regExStrip0 = /(\.0+)+$/;
	var segmentsA = a.replace(regExStrip0, "").split(".");
	var segmentsB = b.replace(regExStrip0, "").split(".");
	var l = Math.min(segmentsA.length, segmentsB.length);

	for (i = 0; i < l; i++) {
		diff = parseInt(segmentsA[i], 10) - parseInt(segmentsB[i], 10);
		if (diff) {
			return diff;
		}
	}
	return segmentsA.length - segmentsB.length;
}
function count_words(str) { //simple word counter
	if (str == "") return 0;
	const wordPattern = /[a-zA-Z0-9_]+/g;
	const words = str.match(wordPattern);
	if (!words) {
		return 0;
	}
	return words.length;
}
function escape_html(unsafe) //sanitizes html content for rendering
{
	if (no_escape_html) {
		return unsafe;
	}
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}
function unescape_html(input) //reverses escape html
{
	if (no_escape_html) {
		return input;
	}
	return input
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#039;/g, "'");
}
function escape_html_alternate(unsafe) //this provides alternative escapes in cases where the input is a mix of partially escaped and non-escaped sequences which must be preserved
{
	return unsafe
		.replace(/</g, "%EscHtml2%")
		.replace(/>/g, "%EscHtml3%")
		.replace(/"/g, "%EscHtml4%")
		.replace(/'/g, "%EscHtml5%");
}
function unescape_html_alternate(input) //reverses escape html alternate
{
	return input
		.replace(/%EscHtml2%/g, "<")
		.replace(/%EscHtml3%/g, ">")
		.replace(/%EscHtml4%/g, '"')
		.replace(/%EscHtml5%/g, "'");
}
function unescape_regex_newlines(input) //unescapes newlines and tab sequences in a regex string input
{
	return input.replace(/\\\\/g, "[temp_rr_seq]")
		.replace(/\\n/g, "\n")
		.replace(/\\t/g, "\t")
		.replace(/\\r/g, "\r")
		.replace(/\[temp_rr_seq\]/g, "\\\\");
}
function get_cursor_position() { //get the caret position in a text
	let editor = document.getElementById("gametext");

	let position = 0;
	const isSupported = typeof window.getSelection !== "undefined";
	if (isSupported) {
		const selection = window.getSelection();
		if (selection.rangeCount !== 0) {
			const range = window.getSelection().getRangeAt(0);
			const preCaretRange = range.cloneRange();
			preCaretRange.selectNodeContents(editor);
			//preCaretRange.setStart(range.startContainer, 0);
			preCaretRange.setEnd(range.endContainer, range.endOffset);
			position = preCaretRange.toString().length;
		}
	}
	return position;
}
function select_element_contents(el) { //select all elements in a node for copy text
	var range = document.createRange();
	range.selectNodeContents(el);
	var sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);
}
function start_time_taken() { //start a timer
	timetaken_timestamp = performance.now();
}
function get_time_taken() { //stop a timer, get seconds passed
	var end_timestamp = performance.now();
	return ((end_timestamp - timetaken_timestamp) / 1000).toFixed(1);
}
function format_uptime(seconds) //convert seconds to days hours mins
{
	const days = Math.floor(seconds / (3600 * 24));
	const hours = Math.floor((seconds % (3600 * 24)) / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	return days + "d " + hours + "h " + minutes + "m";
}
function validate_regex(pattern) //returns whether regex is valid
{
	var isValid = true;
	try {
		new RegExp(pattern);
	} catch (e) {
		isValid = false;
	}
	return isValid;
}
function format_streaming_text(input) {
	let inEditMode = document.getElementById("allowediting").checked ? true : false;
	if (localsettings.opmode == 4 && localsettings.render_streaming_markdown && localsettings.instruct_has_markdown && !inEditMode) {
		input = simpleMarkdown(input, localsettings.instruct_has_latex);
	}
	return input;
}

function asyncRunner(generatorFn) { //allows async/await like syntax before it exists
	return function(...args) {
		const generator = generatorFn.apply(this, args);
		function handle(result) {
			if (result.done) return Promise.resolve(result.value);
			return Promise.resolve(result.value).then(
				res => handle(generator.next(res)),
				err => handle(generator.throw(err)),
			);
		}
		try {
			return handle(generator.next());
		} catch (ex) {
			return Promise.reject(ex);
		}
	};
}

//tasks run on start
function init() { // Setup and initialization on startup
	let polyfills = function() //polyfill missing functionality for older browsers
	{
		//polyfill for forEach
		if (window.NodeList && !NodeList.prototype.forEach) {
			NodeList.prototype.forEach = function(callback, thisArg) {
				thisArg = thisArg || window;
				for (var i = 0; i < this.length; i++) {
					callback.call(thisArg, this[i], i, this);
				}
			};
		}

		//polyfill for object.entries
		if (!Object.entries) {
			Object.entries = function(obj) {
				var ownProps = Object.keys(obj), i = ownProps.length, resArray = new Array(i); // preallocate the Array
				while (i--) resArray[i] = [ownProps[i], obj[ownProps[i]]];
				return resArray;
			};
		}

		//inplace polyfill for replaceall
		if (!String.prototype.replaceAll) {
			String.prototype.replaceAll = function(str, newStr) {
				// If a regex pattern
				if (Object.prototype.toString.call(str).toLowerCase() === "[object regexp]") {
					return this.replace(str, newStr);
				}
				// If a string
				return this.replace(new RegExp(str, "g"), newStr);
			};
		}

		//polyfill for padstart
		if (!String.prototype.padStart) {
			String.prototype.padStart = function padStart(targetLength, padString) {
				targetLength = targetLength >> 0; //truncate if number or convert non-number to 0;
				padString = String(typeof padString !== "undefined" ? padString : " ");
				if (this.length > targetLength) {
					return String(this);
				} else {
					targetLength = targetLength - this.length;
					if (targetLength > padString.length) {
						padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
					}
					return padString.slice(0, targetLength) + String(this);
				}
			};
		}

		try {
			// Test if lookahead is supported, enhance italics regex if so
			let improved_italics = new RegExp("\\*(?!\\s)(.+?)(?<!\\s)\\*", "g");
			italics_regex = improved_italics;
			let improved_bold = new RegExp("\\*\\*(?!\\s)(.+?)(?<!\\s)\\*\\*", "g");
			bold_regex = improved_bold;
		} catch (e) {
			console.log("Lookaheads are not supported in this environment.");
		}
	};
	let setupDragDrop = function() // Setup the drag and drop zones for importing images and character cards
	{
		//all main screens for drag and drop character cards
		let dropZones = [
			document.getElementById("gamescreen"),
			document.getElementById("chat_msg_body"),
			document.getElementById("outerbodybg"),
			document.getElementById("corpostylemain"),
		];

		//drop zones for uploading images in the chat box
		let chatDropZones = [document.getElementById("input_text"), document.getElementById("cht_inp"), document.getElementById("corpo_cht_inp")];

		const onDropLoadCard = function(e) {
			e.preventDefault();
			e.stopPropagation();
			let draggedData = e.dataTransfer;
			let files = draggedData.files;
			console.log(files);
			if (files.length > 0 && files[0] != null && files[0].name && files[0].name != "") {
				load_selected_file(files[0]);
			}
		};

		const onDropUploadImg = function(e) {
			let draggedData = e.dataTransfer;
			let files = draggedData.files;
			console.log(files);
			if (
				files && files.length > 0 && files[0] != null && files[0].name && files[0].name != "" && files[0].type.toLowerCase().includes("image")
			) {
				e.preventDefault();
				e.stopPropagation();
				const file = files[0];
				const reader = new FileReader();
				reader.onload = function(img) {
					let origImg = img.target.result;
					self_upload_img(origImg);
				};
				reader.readAsDataURL(file);
			}
		};

		for (let i = 0; i < dropZones.length; ++i) {
			let dropZone = dropZones[i];
			dropZone.addEventListener(
				"dragover",
				(e) => {
					e.preventDefault();
					e.stopPropagation();
				},
				false,
			);
			dropZone.addEventListener(
				"drop",
				(e) => {
					onDropLoadCard(e);
				},
				false,
			);
		}

		for (let i = 0; i < chatDropZones.length; ++i) {
			let dropZone = chatDropZones[i];
			dropZone.addEventListener(
				"drop",
				(e) => {
					onDropUploadImg(e);
				},
				false,
			);
		}
	};

	polyfills();

	document.getElementById("lastreq1").innerHTML =
		document.getElementById("lastreq2").innerHTML =
		document.getElementById("lastreq3").innerHTML =
			`<a href="#" class="color_grayurl mainnav" title="KoboldAI Lite Information" onclick="msgbox('Source code is available at https://github.com/LostRuins/lite.koboldai.net \\nPlease report any bugs you find there.','Information')">KoboldAI Lite</a> v${LITEVER} Web - Frontend for <a href="#" class="color_grayurl mainnav" title="KoboldAI Lite Disclaimer" onclick="msgbox('KoboldAI Lite allows you to connect to various third-party AI services. We do not control or assume responsibility for the models or content generated by these services. The user is responsible for ensuring that their usage of this software is legal in their country, and complies with the terms of service of the service they are connected to. Use at your own discretion.','Disclaimer')">External API Services</a>. For local use, check out <a class="color_grayurl mainnav" title="KoboldCpp Github" href="https://github.com/LostRuins/koboldcpp">KoboldCpp</a>. For help, visit our <a class="color_grayurl mainnav" title="KoboldAI Discord" href="https://koboldai.org/discord">Discord</a>.`;

	trigger_abort_controller(); //first trigger sets it up

	//uncompress compacted scenarios
	for (let i = 0; i < compressed_scenario_db.length; ++i) {
		let decom = lz_d.decompress(b64_to_buf(compressed_scenario_db[i]));
		scenario_db.push(JSON.parse(decom));
	}

	//disable debug log if not local
	let dbgmode = urlParams.get("dbg");

	//duplicate endpoint dropdown array for backup
	var cep = document.getElementById("customapidropdown");
	var cephide = document.getElementById("unusedcustomapidropdown");
	var cepoptions = cep.options;
	for (var i = 0; i < cepoptions.length; ++i) {
		var newOption = document.createElement("option");
		newOption.value = cepoptions[i].value;
		newOption.text = cepoptions[i].text;
		cephide.add(newOption);
	}

	if (localflag) {
		let inputport = urlParams.get("port");
		if (window.location.port && window.location.port != 80 && window.location.port != 443) {
			localmodeport = window.location.port;
		}
		if (!window.location.port && window.location.protocol.includes("https") && !is_using_web_lite()) {
			localmodeport = 443;
		}
		if (
			!window.location.port && window.location.protocol.includes("http") && !window.location.protocol.includes("https") && !is_using_web_lite()
		) {
			reattempt_local_port80 = true; //make an attempt to connect via port 80 on failure too.
		}
		if (inputport) {
			localmodeport = parseInt(inputport);
		}
		backup_localmodeport = localmodeport;

		let inputhost = urlParams.get("host");
		sublocalpathname = "";
		if (inputhost) {
			localmodehost = inputhost;
		} else if (window.location.hostname && window.location.hostname != "" && !is_using_web_lite()) {
			localmodehost = window.location.hostname;

			//this is a little hack to tolerate the rare case of a reverse proxy being used in url path with a subfolder.
			//it assumes that the server is also within the same path
			let pn = window.location.pathname;
			const twoslashes = /\/[^/]+\/[^/]*$/;
			if (window.location.protocol != "file:" && pn != "" && pn != "/" && twoslashes.test(pn)) {
				const segments = pn.split("/").filter(segment => segment.length > 0);
				for (let i = 0; i < segments.length; ++i) {
					if (!pn.endsWith("/") && (i == segments.length - 1)) {
						break;
					}
					sublocalpathname += "/" + segments[i];
				}
			}
		}

		let inputkey = urlParams.get("key");
		if (inputkey) {
			localmodekey = inputkey;
		}

		//remove all unwanted options from the endpoint dropdown in case it is used
		for (var i = cepoptions.length - 1; i >= 0; i--) {
			if (cepoptions[i].value !== "1" && cepoptions[i].value !== "2") {
				cep.remove(i);
			}
		}
	}

	const fromfile = window.location.protocol == "file:";
	if (!dbgmode && !fromfile) {
		if (!window.console) window.console = {};
		var methods = ["log", "debug", "warn", "info"];
		for (var i = 0; i < methods.length; i++) {
			console[methods[i]] = function() {};
		}
	}

	//poke speech synth to preload voices
	if ("speechSynthesis" in window) {
		let voices = window.speechSynthesis.getVoices();
		console.log("Voices loading...");
	}

	//setup drag and drop zone for files
	setupDragDrop();

	//fix for iphone zooming
	if (navigator.userAgent.indexOf("iPhone") > -1) {
		document.querySelector('meta[name="viewport"]')
			.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1");
	}

	//fix for copy paste text in firefox, and also to prevent pasting rich text
	document.getElementById("gametext").addEventListener("paste", function(e) {
		e.preventDefault();

		let text = e.clipboardData
			? (e.originalEvent || e).clipboardData.getData("text/plain")
			// For IE
			: window.clipboardData
			? window.clipboardData.getData("Text")
			: "";

		let elem = document.getElementById("gametext");
		let selection = window.getSelection();
		let fullySelected = elem.innerText != "" && selection.toString() === elem.innerText;
		if (fullySelected || elem.innerText.trim() == "") {
			document.execCommand("selectAll", false, null);
			document.execCommand("insertText", false, "");
			elem.innerHTML = "";
		}

		text = escape_html(text);
		text = text.replace(/\r?\n/g, "<br>");
		document.execCommand("insertHTML", false, text);
	});

	console.log("Load autosaves started");
	let loadok = false;

	//load all autosave data from indexeddb
	Promise.all([
		indexeddb_load("settings", ""),
		indexeddb_load("story", ""),
		indexeddb_load("bgimg", ""),
		indexeddb_load("savedcustomcss", ""),
		indexeddb_load("savedusermod", ""),
		indexeddb_load("usermodprops", ""),
	]).then(([loadedsettingsjson, loadedstorycompressed, loadedbackgroundimg, currcss, currmod, modpropsstr]) => {
		try {
			if (loadedsettingsjson != null && loadedsettingsjson != "" && loadedstorycompressed != null && loadedstorycompressed != "") {
				let loadedsettings = JSON.parse(loadedsettingsjson);
				//see if persist is enabled
				if (loadedsettings && loadedsettings.persist_session) {
					import_compressed_story(loadedstorycompressed, true); //use the same compressed format as shared stories and import it
					import_props_into_object(localsettings, loadedsettings);
					console.log("Loaded local settings and story");

					//offer to reconnect
					let pending_eptype = localsettings.prev_custom_endpoint_type;
					let pending_custmodel = localsettings.prev_custom_endpoint_model;
					if (!localflag && pending_eptype > 0) {
						msgboxYesNo("Reconnect to previous custom endpoint?", "Custom Endpoint Reconnect", () => {
							document.getElementById("customapidropdown").value = pending_eptype.toString();
							if (pending_custmodel) {
								let dropdown = get_custom_ep_model_dropdown();
								if (dropdown) {
									const hasValue = Array.from(dropdown.options).some(option => option.value === pending_custmodel);
									if (hasValue) {
										dropdown.value = pending_custmodel;
									}
								}
							}
							display_endpoint_container();
						}, null);
					}
				}
				if (loadedsettings && !loadedsettings.persist_session) {
					//toggle persistence off to prevent it from turning on again
					localsettings.persist_session = false;
				}
				if (loadedbackgroundimg && loadedbackgroundimg != "") {
					let selectedImg = `url('${loadedbackgroundimg}')`;
					document.body.style.backgroundImage = selectedImg;
					document.getElementById("gamescreen").classList.add("translucentbg");
					document.getElementById("enhancedchatinterface").classList.add("transparentbg");
					document.getElementById("enhancedchatinterface_inner").classList.add("transparentbg");
				}
				loadok = true;
			} else {
				console.log("Skipped missing local save");
				loadok = false;
				if (!avoidwelcome) {
					//show welcome
					show_welcome_panel();
				}
			}
			populate_corpo_leftpanel();
			update_toggle_lightmode(false); //load theme but dont save or toggle it

			//load custom css
			let resetcss = urlParams.get("resetcss");
			if (currcss && currcss != "" && !resetcss) {
				currcss = sanitize_css(currcss);
				console.log("Custom CSS applied.");
				let styleElement = document.getElementById("custom_css");
				styleElement.innerHTML = currcss;
			} else if (resetcss) {
				console.log("Custom CSS reset.");
				indexeddb_save("savedcustomcss", "");
				window.history.replaceState(null, null, window.location.pathname);
			}

			//load custom mods
			let resetmod = urlParams.get("resetmod");
			if (currmod && currmod != "" && !resetmod && modpropsstr) {
				try {
					let parsedprops = JSON.parse(modpropsstr);
					if (parsedprops.persist) {
						console.log("Applying user mod on startup.");
						var userModScript = new Function(currmod);
						userModScript();
						console.log("User mod applied.");
					}
				} catch (e) {
					console.log("Failed to apply mod.");
				}
			} else if (resetmod) {
				console.log("Custom Mod reset.");
				indexeddb_save("savedusermod", "");
				indexeddb_save("usermodprops", "");
				window.history.replaceState(null, null, window.location.pathname);
			}
		} catch (e) {
			console.log("Discarded invalid local save: " + e);
			loadok = false;
		}

		if (!loadok && !localflag && selected_models.length == 0 && !is_using_custom_ep()) { //nothing was loaded. this is a brand new state, in web lite
			console.log("Autopick some good default models...");
			//attempt to autopick some good default models
			fetch_models((mdls) => {
				//can we find the model that's used? if yes load it, otherwise load the first one
				if (mdls.length > 0) {
					selected_models = []; //force clear is needed, as it can get overwritten
					for (var i = 0; i < mdls.length; ++i) {
						let skipignored = false;
						for (let k = 0; k < ignoredmodels.length; ++k) {
							if (mdls[i].name.trim().toLowerCase().includes(ignoredmodels[k].trim().toLowerCase())) {
								skipignored = true;
								break;
							}
						}
						if (!skipignored) {
							for (var j = 0; j < defaultmodels.length; ++j) {
								if (
									mdls[i].name.trim().toLowerCase().includes(defaultmodels[j].trim().toLowerCase())
									|| defaultmodels[j].trim().toLowerCase().includes(mdls[i].name.trim().toLowerCase())
								) {
									selected_models.push(mdls[i]);
								}
							}
						}
					}
					if (selected_models.length == 0) { //no matching models, just assign one
						selected_models.push(mdls[0]);
					}
					render_gametext();
				}
			});
		}

		//toggle genimg btn
		update_genimg_button_visiblility();
		update_websearch_button_visibility();

		//invert colors
		toggle_invert_colors();
		toggle_sidepanel_mode();

		//start the polling script for async generation status checking every Xs
		setInterval(poll_pending_response, poll_interval_base_text);
		setInterval(poll_image_db, poll_interval_base_img); //check images every Xs
		setInterval(poll_idle_responses, poll_interval_idle); //a basic update loop for idle responses
		setInterval(poll_multiplayer, poll_interval_multiplayer); //a basic update loop for idle responses

		attempt_connect(false);

		//fetch for news updates, for local mode, we don't fetch any news info. They can find updates themselves.
		if (!localflag) {
			fetch(horde_news_endpoint)
				.then(x => x.json())
				.then(data => {
					if (data && data != "" && data.newstitle && data.newstext && data.newstitle != "" && data.newstext != "") {
						msgbox(data.newstext, data.newstitle, true, data.nobtns);
					}
				}).catch((error) => {
					console.log("Error: " + error);
				});
		}

		//setup customization aesthetic UI functionality
		initializeInstructUIFunctionality();
	});
} //end init

// Helper functions for prompt formatting
function get_my_multiplayer_chatname() {
	if (multiplayer_active && multiplayer_override_name != "") {
		return multiplayer_override_name;
	}
	return localsettings.chatname;
}
function get_instruct_starttag(doTrim = true) {
	let instag = localsettings.instruct_starttag;
	if (instag == "{{[INPUT]}}" && !(custom_kobold_endpoint != "" && is_using_kcpp_with_autotags())) {
		instag = "\n### Instruction:\n"; //backend not compatible with auto
	}
	if (doTrim) {
		return replaceAll(instag, "\\n", "\n").trim();
	} else {
		return replaceAll(instag, "\\n", "\n");
	}
}
function get_instruct_endtag(doTrim = true) {
	let instag = localsettings.instruct_endtag;
	if (instag == "{{[OUTPUT]}}" && !(custom_kobold_endpoint != "" && is_using_kcpp_with_autotags())) {
		instag = "\n### Response:\n"; //backend not compatible with auto
	}
	if (doTrim) {
		return replaceAll(instag, "\\n", "\n").trim();
	} else {
		return replaceAll(instag, "\\n", "\n");
	}
}
function get_instruct_systag(doTrim = true) {
	let instag = localsettings.instruct_systag;
	if (instag == "{{[SYSTEM]}}" && !(custom_kobold_endpoint != "" && is_using_kcpp_with_autotags())) {
		instag = ""; //backend not compatible with auto
	}
	if (doTrim) {
		return replaceAll(instag, "\\n", "\n").trim();
	} else {
		return replaceAll(instag, "\\n", "\n");
	}
}
function get_instruct_starttag_end(doTrim = true) {
	let instag = localsettings.instruct_starttag_end;
	if (instag == "{{[INPUT_END]}}" && !(custom_kobold_endpoint != "" && is_using_kcpp_with_autotags())) {
		instag = ""; //backend not compatible with auto
	}
	if (doTrim) {
		return replaceAll(instag, "\\n", "\n").trim();
	} else {
		return replaceAll(instag, "\\n", "\n");
	}
}
function get_instruct_endtag_end(doTrim = true) {
	let instag = localsettings.instruct_endtag_end;
	if (instag == "{{[OUTPUT_END]}}" && !(custom_kobold_endpoint != "" && is_using_kcpp_with_autotags())) {
		instag = ""; //backend not compatible with auto
	}
	if (doTrim) {
		return replaceAll(instag, "\\n", "\n").trim();
	} else {
		return replaceAll(instag, "\\n", "\n");
	}
}
function get_instruct_systag_end(doTrim = true) {
	let instag = localsettings.instruct_systag_end;
	if (instag == "{{[SYSTEM_END]}}" && !(custom_kobold_endpoint != "" && is_using_kcpp_with_autotags())) {
		instag = ""; //backend not compatible with auto
	}
	if (doTrim) {
		return replaceAll(instag, "\\n", "\n").trim();
	} else {
		return replaceAll(instag, "\\n", "\n");
	}
}
function get_instruct_latest_end(doTrim = true) {
	//scan history for the newest end tag. if none, return empty
	let truncated_context = concat_gametext(true, "");
	let strA = get_instructstartplaceholder();
	let strB = get_instructendplaceholder();
	let strC = get_instructsysplaceholder();
	let lastA = strA ? truncated_context.lastIndexOf(strA) : -1;
	let lastB = strB ? truncated_context.lastIndexOf(strB) : -1;
	let lastC = strC ? truncated_context.lastIndexOf(strC) : -1;

	const maxIndex = Math.max(lastA, lastB, lastC);

	if (maxIndex === -1) return "";
	if (maxIndex === lastA) return get_instructstartplaceholder_end();
	if (maxIndex === lastB) return get_instructendplaceholder_end();
	return instructsysplaceholder_end;
}
function get_current_timestamp() {
	return "[" + (new Date().toLocaleTimeString([], { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })) + "]";
}

function remove_all_instruct_tags(text) {
	text = replaceAll(text, get_instruct_starttag(false), "");
	text = replaceAll(text, get_instruct_endtag(false), "");
	text = replaceAll(text, get_instruct_systag(false), "");
	text = replaceAll(text, get_instruct_starttag(false).trim(), "");
	text = replaceAll(text, get_instruct_endtag(false).trim(), "");
	text = replaceAll(text, get_instruct_systag(false).trim(), "");
	text = text.replace(/\{\{\[INPUT\]\}\}/g, "").replace(/\{\{\[OUTPUT\]\}\}/g, "");
	text = text.replace(/\{\{\[INPUT_END\]\}\}/g, "").replace(/\{\{\[OUTPUT_END\]\}\}/g, "");
	text = text.replace(/\{\{\[SYSTEM\]\}\}/g, "").replace(/\{\{\[SYSTEM_END\]\}\}/g, "");
	return text;
}
function replace_search_placeholders(text) {
	// Remove any instruct tags as needed to ensure a more accurate search
	text = remove_all_instruct_tags(text);

	// Replace {{user}} and other placeholders
	text = replace_placeholders(text, false, false, false);

	return text;
}
//we separate these 2 functions, as sometimes we only need to replace instruct
function replace_instruct_placeholders(inputtxt) //only for instruct placeholders first
{
	inputtxt = replaceAll(inputtxt, instructstartplaceholder, get_instruct_starttag(false));
	inputtxt = replaceAll(inputtxt, instructendplaceholder, get_instruct_endtag(false));
	inputtxt = replaceAll(inputtxt, instructsysplaceholder, get_instruct_systag(false));
	inputtxt = replaceAll(inputtxt, instructstartplaceholder_end, get_instruct_starttag_end(false));
	inputtxt = replaceAll(inputtxt, instructendplaceholder_end, get_instruct_endtag_end(false));
	inputtxt = replaceAll(inputtxt, instructsysplaceholder_end, get_instruct_systag_end(false));
	//failsafe to handle removing newline tags
	inputtxt = replaceAll(inputtxt, instructstartplaceholder.trim(), get_instruct_starttag(false));
	inputtxt = replaceAll(inputtxt, instructendplaceholder.trim(), get_instruct_endtag(false));
	inputtxt = replaceAll(inputtxt, instructsysplaceholder.trim(), get_instruct_systag(false));
	inputtxt = replaceAll(inputtxt, instructstartplaceholder_end.trim(), get_instruct_starttag_end(false));
	inputtxt = replaceAll(inputtxt, instructendplaceholder_end.trim(), get_instruct_endtag_end(false));
	inputtxt = replaceAll(inputtxt, instructsysplaceholder_end.trim(), get_instruct_systag_end(false));
	return inputtxt;
}
function replace_noninstruct_placeholders(inputtxt, escape = false, isgametext = true, persistent_countmap = null) {
	let firstopponent = localsettings.chatopponent;
	if (firstopponent && firstopponent.includes("||$||")) {
		let coarr = firstopponent.split("||$||");
		coarr = coarr.filter(x => (x && x != ""));
		firstopponent = coarr.length > 0 ? coarr[0] : defaultchatopponent;
	}
	if (escape) {
		inputtxt = replaceAll(inputtxt, "{{user}}", escape_html(localsettings.chatname ? localsettings.chatname : "User"), true);
		inputtxt = replaceAll(inputtxt, "{{char}}", escape_html(localsettings.chatopponent ? firstopponent : defaultchatopponent), true);
	} else {
		inputtxt = replaceAll(inputtxt, "{{user}}", localsettings.chatname ? localsettings.chatname : "User", true);
		inputtxt = replaceAll(inputtxt, "{{char}}", localsettings.chatopponent ? firstopponent : defaultchatopponent, true);
	}

	for (let i = 0; i < localsettings.placeholder_tags_data.length; ++i) {
		if (localsettings.placeholder_tags_data[i].p && localsettings.placeholder_tags_data[i].r) {
			inputtxt = replaceAll(inputtxt, localsettings.placeholder_tags_data[i].p, localsettings.placeholder_tags_data[i].r);
		}
	}

	if (localsettings.inject_randomness_seed > 0) {
		// define helper functions
		let dicenotation = function(formula, seed = 0) {
			formula = formula.trim();
			if (/^\d+$/.test(formula)) formula = `1d${formula}`;
			const pieces = formula.match(/^(\d+)?d(\d+)([x*\u00D7]\d*\.?\d+)?([+-]\d*\.?\d+)?$/i);
			if (!pieces) {
				return ""; //if the dice test fails we still need to return the original unswapped content!
			}
			let RNG = seed ? basic_lcg(seed) : Math.random;
			let numDice = parseInt(pieces[1]) || 1;
			let dieSides = parseInt(pieces[2]);
			if (isNaN(numDice) || isNaN(dieSides) || dieSides < 0 || dieSides > 99999) { //dice above 99999 cause extreme slowdown
				console.warn("Avoid potential dice issues");
				return "";
			}
			let total = 0;
			for (let i = 0; i < numDice; ++i) {
				total += Math.floor(RNG() * dieSides) + 1; // Standard dice rolls are 1-based
			}
			total *= pieces[3] ? parseFloat(pieces[3].substring(1)) : 1;
			total += pieces[4] ? parseFloat(pieces[4]) : 0;
			return String(total);
		};
		let pickfromlist = function(listString, seed = 0) {
			let RNG = seed ? basic_lcg(seed) : Math.random;
			const list = listString.includes("::")
				? listString.split("::")
				: listString.replace(/\\,/g, "%%COMMA%%").split(",").map(item => item.trim().replace(/%%COMMA%%/g, ","));
			return (list.length === 0 ? "" : list[Math.floor(RNG() * list.length)]);
		};

		//don't waste time if we dont have any such tags
		let lowerinputtxt = inputtxt.toLowerCase();
		if (lowerinputtxt.includes("\{\{pick") || lowerinputtxt.includes("\{\{random") || lowerinputtxt.includes("\{\{roll")) {
			let stablereg = "";
			if (!isgametext) {
				inputtxt = inputtxt.replace(/\{\{roll\s?:?:?([^\}\n]{1,500})\}\}/gi, function(m, matchValue) {
					return dicenotation(matchValue, 0);
				});
				inputtxt = inputtxt.replace(/\{\{random\s?:?:?([^\}\n]{1,500})\}\}/gi, function(m, listString) {
					return pickfromlist(listString, 0);
				});
				stablereg = /\{\{(pick)\s?:?:?([^\}\n]{1,500})\}\}/gi;
			} else {
				stablereg = /\{\{(pick|random|roll)\s?:?:?([^\}\n]{1,500})\}\}/gi;
			}

			let countmap = persistent_countmap ? persistent_countmap : new Map();
			let parts = [];
			let lastIndex = 0;
			let match;

			while ((match = stablereg.exec(inputtxt)) !== null) {
				const tagType = match[1].toLowerCase();
				const matchtxt = match[2];
				parts.push(inputtxt.substring(lastIndex, match.index));
				let count = countmap.get(matchtxt) || 0;
				countmap.set(matchtxt, count + 1);
				let hashstr = matchtxt + localsettings.inject_randomness_seed;
				if (isgametext || tagType !== "pick") {
					hashstr += count;
				}
				let seed = parseInt(cyrb_hash(hashstr), 16);
				let replacement = (tagType === "roll" ? dicenotation : pickfromlist)(matchtxt, seed);
				parts.push(replacement);
				lastIndex = stablereg.lastIndex;
			}
			parts.push(inputtxt.substring(lastIndex)); // Add remaining text after the last match
			inputtxt = parts.join("");
		}
	}
	return inputtxt;
}
//if alwaysreplace, then settings are not considered, otherwise checks settings
//if isgametext is true, then keeping the random values stable will be prioritized
function replace_placeholders(inputtxt, escape = false, alwaysreplace = false, isgametext = true) {
	inputtxt = replace_instruct_placeholders(inputtxt);
	if (alwaysreplace || localsettings.placeholder_tags) {
		inputtxt = replace_noninstruct_placeholders(inputtxt, escape, isgametext, null);
	}
	return inputtxt;
}

//saving and loading functionality
function indexeddb_save(objkey, objdatastr) //save to indexeddb, but fallback to localstorage
{
	return new Promise((resolve, reject) => {
		objdatastr = objdatastr ? String(objdatastr) : "";
		let fallbackSave = function() {
			try {
				localStorage.setItem(STORAGE_PREFIX + objkey, objdatastr);
			} catch (error) {
				console.log(`Localstorage failed to save!`);
			}
			resolve();
		};
		const isIndexedDBSupported = !!window.indexedDB;
		if (!isIndexedDBSupported) {
			console.log(`IndexedDB not supported! Fallback to localstorage.`);
			fallbackSave();
			return;
		}

		const request = indexedDB.open(STORAGE_PREFIX, 1);
		request.onerror = function(event) {
			console.error(`Unable to initialize IndexedDB Database! Fallback to localstorage.`);
			fallbackSave();
			return;
		};
		request.onupgradeneeded = function(event) {
			try {
				const db = event.target.result;
				if (!db.objectStoreNames.contains(STORAGE_PREFIX)) {
					db.createObjectStore(STORAGE_PREFIX, { keyPath: "key" });
				}
			} catch (error) {
				console.error("IndexedDB upgrade error, falling back to localstorage:", error);
				fallbackSave();
				return;
			}
		};
		request.onsuccess = function(event) {
			try {
				const db = event.target.result;
				const transaction = db.transaction(STORAGE_PREFIX, "readwrite");
				const store = transaction.objectStore(STORAGE_PREFIX);
				const storeRequest = store.put({ key: objkey, value: objdatastr });

				storeRequest.onsuccess = function() {
					try {
						localStorage.setItem(STORAGE_PREFIX + objkey, "offload_to_indexeddb"); //indicate its been offloaded
					} catch (error) {
						console.log(`Localstorage failed to save!`);
					}
					resolve();
				};
				storeRequest.onerror = function(event) {
					console.error("StoreRequest failed!");
					fallbackSave();
				};
				transaction.onerror = function(event) {
					console.error("Transaction failed!");
					fallbackSave();
				};
				transaction.onabort = function(event) {
					console.error("Transaction aborted!");
					fallbackSave();
				};
			} catch (error) {
				console.error("IndexedDB error, falling back to localstorage:", error);
				fallbackSave();
			}
		};
	});
}
function indexeddb_load(objkey, defaultvalue) //returns a promise that does not reject, and retrieves key value on resolve
{
	return new Promise((resolve, reject) => {
		let fallbackResolveLoad = function() //if indexeddb fails
		{
			let fallbackval = null;
			try {
				fallbackval = localStorage.getItem(STORAGE_PREFIX + objkey, defaultvalue);
			} catch (error) {
				console.log(`Localstorage failed to load!`);
				fallbackval = defaultvalue;
			}
			if (fallbackval == "offload_to_indexeddb") { //value was offloaded but we cant read it. return default
				fallbackval = defaultvalue;
			}
			resolve(fallbackval);
			return;
		};

		const isIndexedDBSupported = !!window.indexedDB;
		if (!isIndexedDBSupported) {
			console.log(`IndexedDB not supported! Fallback to localstorage.`);
			fallbackResolveLoad();
			return;
		}

		//if value is not offloaded, return it immediately
		let testval = null;
		try {
			testval = localStorage.getItem(STORAGE_PREFIX + objkey, defaultvalue);
		} catch (error) {
			console.log(`Localstorage failed to load!`);
			resolve(defaultvalue);
			return;
		}
		if (testval != "offload_to_indexeddb") {
			console.log(`Value not offloaded to indexeddb! Fallback to localstorage.`);
			testval = testval ? testval : defaultvalue;
			resolve(testval);
			return;
		}

		const request = indexedDB.open(STORAGE_PREFIX, 1);
		request.onsuccess = (event) => {
			const db = event.target.result;
			const transaction = db.transaction(STORAGE_PREFIX, "readonly");
			const store = transaction.objectStore(STORAGE_PREFIX);
			const getRequest = store.get(objkey);
			getRequest.onsuccess = () => {
				let res = getRequest.result;
				if (res) {
					resolve(res.value); //since it was json previously, return it
				} else {
					resolve(defaultvalue);
				}
			};
			getRequest.onerror = () => {
				console.log(getRequest.error);
				fallbackResolveLoad();
			};
		};

		request.onupgradeneeded = function(event) {
			try {
				const db = event.target.result;
				if (!db.objectStoreNames.contains(STORAGE_PREFIX)) {
					db.createObjectStore(STORAGE_PREFIX, { keyPath: "key" });
				}
			} catch (error) {
				console.error("IndexedDB upgrade error, falling back to localstorage:", error);
				fallbackResolveLoad();
			}
		};

		request.onerror = function(event) {
			console.error(`Unable to initialize IndexedDB Database! Fallback to localstorage.`);
			fallbackResolveLoad();
		};
	});
}
function readTavernPngFromBlob(blob, onDone) // File loading and import functionality
{
	var fileReader = new FileReader();
	fileReader.onload = function(event) {
		var data = event.target.result;
		var arr = new Uint8Array(data);
		var result = convertTavernPng(arr);
		if (!result) {
			//attempt to read as WEBP
			result = getTavernExifJSON(arr);
		}
		if (onDone) {
			onDone(result);
		}
	};
	fileReader.readAsArrayBuffer(blob);
}
function convertTavernPng(data) //import tavern png data. adapted from png-chunks-extract under MIT license
{
	//accepts png input data, and returns the extracted JSON
	console.log("Attempting PNG import...");
	var uint8 = new Uint8Array(4);
	var int32 = new Int32Array(uint8.buffer);
	var uint32 = new Uint32Array(uint8.buffer);

	//check if png header is valid
	if (
		!data || data[0] !== 0x89 || data[1] !== 0x50 || data[2] !== 0x4E || data[3] !== 0x47 || data[4] !== 0x0D || data[5] !== 0x0A
		|| data[6] !== 0x1A || data[7] !== 0x0A
	) {
		console.log("PNG header invalid");
		return null;
	}

	var ended = false;
	var chunks = [];
	var idx = 8;

	while (idx < data.length) {
		// Read the length of the current chunk,
		// which is stored as a Uint32.
		uint8[3] = data[idx++];
		uint8[2] = data[idx++];
		uint8[1] = data[idx++];
		uint8[0] = data[idx++];

		// Chunk includes name/type for CRC check (see below).
		var length = uint32[0] + 4;
		var chunk = new Uint8Array(length);
		chunk[0] = data[idx++];
		chunk[1] = data[idx++];
		chunk[2] = data[idx++];
		chunk[3] = data[idx++];

		// Get the name in ASCII for identification.
		var name = String.fromCharCode(chunk[0])
			+ String.fromCharCode(chunk[1])
			+ String.fromCharCode(chunk[2])
			+ String.fromCharCode(chunk[3]);

		// The IHDR header MUST come first.
		if (!chunks.length && name !== "IHDR") {
			console.log("Warning: IHDR header missing");
		}

		// The IEND header marks the end of the file,
		// so on discovering it break out of the loop.
		if (name === "IEND") {
			ended = true;
			chunks.push({
				name: name,
				data: new Uint8Array(0),
			});
			break;
		}

		// Read the contents of the chunk out of the main buffer.
		for (var i = 4; i < length; i++) {
			chunk[i] = data[idx++];
		}

		// Read out the CRC value for comparison.
		// It's stored as an Int32.
		uint8[3] = data[idx++];
		uint8[2] = data[idx++];
		uint8[1] = data[idx++];
		uint8[0] = data[idx++];

		// The chunk data is now copied to remove the 4 preceding
		// bytes used for the chunk name/type.
		var chunkData = new Uint8Array(chunk.buffer.slice(4));

		chunks.push({
			name: name,
			data: chunkData,
		});
	}

	if (!ended) {
		console.log(".png file ended prematurely: no IEND header was found");
	}

	//find the chunk with the 'chara' name, just check first and last letter
	let found = chunks.filter(x =>
		(
			x.name == "tEXt"
			&& x.data.length > 6
			&& String.fromCharCode(x.data[0]) == "c"
		)
		&& String.fromCharCode(x.data[4]) == "a"
	);

	//remove ext asset
	found = found.filter(x => (
		x.data.length > 12
		&& !(String.fromCharCode(x.data[6]) == "e"
			&& String.fromCharCode(x.data[7]) == "x"
			&& String.fromCharCode(x.data[8]) == "t"
			&& String.fromCharCode(x.data[9]) == "-")
	));

	if (found.length == 0) {
		console.log("PNG Image contains no story data");
		return null;
	} else {
		try {
			let b64buf = "";
			let bytes = found[0].data; //skip the chara
			for (var i = 6; i < bytes.length; i++) {
				b64buf += String.fromCharCode(bytes[i]);
			}
			var decoded = JSON.parse(b64_decode_unicode(b64buf));
			console.log(decoded);
			return decoded;
		} catch (e) {
			console.log("Error decoding b64 in image: " + e);
			return null;
		}
	}
}
function getTavernExifJSON(data) //a hacky exif reader for new tavernai format
{
	console.log("Attempting WEBP import...");
	var uint8 = new Uint8Array(4);
	var int32 = new Int32Array(uint8.buffer);
	var uint32 = new Uint32Array(uint8.buffer);

	//check if webp header is valid
	if (
		!data || data[0] !== 0x52 || data[1] !== 0x49 || data[2] !== 0x46 || data[3] !== 0x46 || data[8] !== 0x57 || data[9] !== 0x45
		|| data[10] !== 0x42 || data[11] !== 0x50
	) {
		console.log("WEBP header invalid");
		return null;
	}
	//scan for the EXIF....Exif tag
	let offset = 0;
	let datlen = data.length;
	while (offset < datlen - 12) {
		++offset;
		if (
			data[offset] == 0x45 && data[offset + 1] == 0x58 && data[offset + 2] == 0x49 && data[offset + 3] == 0x46
			&& data[offset + 8] == 0x45 && data[offset + 9] == 0x78 && data[offset + 10] == 0x69 && data[offset + 11] == 0x66
		) {
			offset += 12;

			//look for UserSummary tag. Also helps determine endianness
			//look for ASCII...{
			let bigendian = false;
			let foundsize = false;
			let datasize = 0;
			while (offset < datlen - 12) {
				++offset;
				if (!foundsize) {
					if (data[offset] == 0x86 && data[offset + 1] == 0x92) {
						foundsize = true;
						bigendian = false;
						datasize = data[offset + 4] + 256 * data[offset + 5] + 65536 * data[offset + 6] + 16777216 * data[offset + 7];
						datasize -= 8;
					} else if (data[offset] == 0x92 && data[offset + 1] == 0x86) {
						foundsize = true;
						bigendian = true;
						datasize = data[offset + 7] + 256 * data[offset + 6] + 65536 * data[offset + 5] + 16777216 * data[offset + 4];
						datasize -= 8;
					}
				}

				if (
					foundsize && data[offset] == 0x41 && data[offset + 1] == 0x53 && data[offset + 2] == 0x43 && data[offset + 3] == 0x49
					&& data[offset + 4] == 0x49 && data[offset + 5] == 0x00 && data[offset + 6] == 0x00 && data[offset + 7] == 0x00
				) {
					//found. start reading json
					let idx = offset + 8;
					let endidx = idx + datasize;
					let readtxt = "";
					while (idx < endidx && idx < datlen) {
						readtxt += String.fromCharCode(data[idx]);
						++idx;
					}
					try {
						var decoded = JSON.parse(readtxt);
						console.log(decoded);
						return decoded;
					} catch (e) {
						console.log("Error decoding webp txt: " + e);
						return null;
					}
					break;
				}
			}
			break;
		}
	}
	return null;
}
function UnzipKAISTORYFile(compressed) { //opens zip files and extracts a JSON found inside (KAI United)
	var unzip = new Zlib.Unzip(compressed);
	var filenames = unzip.getFilenames();
	let foundfile = filenames.filter(x => x.includes(".json"));
	let foundfile2 = filenames.filter(x => x.includes("story.json"));
	if (foundfile.length > 0) {
		try {
			let correctfile = foundfile[0];
			if (foundfile2.length > 0) {
				correctfile = foundfile2[0];
			}
			var plainfile = unzip.decompress(correctfile);
			const decoder = new TextDecoder("utf-8");
			const readtxt = decoder.decode(plainfile);
			var decoded = JSON.parse(readtxt);
			console.log(decoded);
			return decoded;
		} catch (e) {
			console.log("Error decoding kaistory txt: " + e);
			return null;
		}
	}
	return null;
}

function extractRisuData(arr) {
	function strToBytes(str) {
		return new TextEncoder().encode(str);
	}

	function indexOfSequence(haystack, needle, from = 0) {
		for (let i = from; i <= haystack.length - needle.length; i++) {
			let match = true;
			for (let j = 0; j < needle.length; j++) {
				if (haystack[i + j] !== needle[j]) {
					match = false;
					break;
				}
			}
			if (match) return i;
		}
		return -1;
	}
	function lastIndexOfSequence(haystack, needle) {
		for (let i = haystack.length - needle.length; i >= 0; i--) {
			let match = true;
			for (let j = 0; j < needle.length; j++) {
				if (haystack[i + j] !== needle[j]) {
					match = false;
					break;
				}
			}
			if (match) return i;
		}
		return -1;
	}
	console.log("Attempting RISU import...");
	const charCardFinderSig = strToBytes("chara_card_v");
	const charcardpos = indexOfSequence(arr, charCardFinderSig);
	if (charcardpos != -1) {
		const zipStartSig = strToBytes("PK\x03\x04");
		const zipEndSig = strToBytes("PK\x05\x06");
		const start = indexOfSequence(arr, zipStartSig);
		const end = lastIndexOfSequence(arr, zipEndSig);

		if (start !== -1 && end !== -1 && end > start && charcardpos > start && charcardpos < end) {
			try {
				const zipData = arr.slice(start, end + 22); // Add 22 bytes for EOCD record
				var unzip = new Zlib.Unzip(zipData);
				var filenames = unzip.getFilenames();
				let foundfile = filenames.filter(x => x == "card.json");
				if (foundfile.length > 0) {
					var plainfile = unzip.decompress(foundfile[0]);
					const decoder = new TextDecoder("utf-8");
					const readtxt = decoder.decode(plainfile);
					var decoded = JSON.parse(readtxt);
					console.log(decoded);
					return decoded;
				}
				console.log("RISU card missing card.json.");
				return null;
			} catch (e) {
				console.log("Error decoding RISU card: " + e);
				return null;
			}
		} else {
			console.log("Not a valid RISU card.");
			return null;
		}
	}
	console.log("Not a RISU card.");
	return null;
}

function generate_compressed_story(save_images, export_settings, export_aesthetic_settings) {
	//encode the current story into a sharable url
	//a tiny json format which gets compressed by LZMA then b64url

	let story = generate_savefile(save_images, export_settings, export_aesthetic_settings);
	let storyjson = JSON.stringify(story);
	console.log("Exporting story: ", story);

	var cstoryjson = buf_to_b64(lz_c.compress(storyjson, 1));
	return cstoryjson;
}
function autosave_compressed_story(save_images, export_settings, export_aesthetic_settings) {
	//runs async, complete autosave only if latest to be called
	let story = generate_savefile(save_images, export_settings, export_aesthetic_settings);
	let storyjson = JSON.stringify(story);

	let ongoing = pending_storyjson_autosave;
	pending_storyjson_autosave = storyjson;
	if (ongoing) {
		console.log("Delay Autosave: ", story);
		return;
	}
	console.log("Autosave Start: ", story);
	(function retry_autosave(json) {
		lz_c.compress(json, 1, function(res) {
			let compressedstory = buf_to_b64(res);
			indexeddb_save("story", compressedstory).then(() => {
				console.log("Autosave Done");
				let newer = pending_storyjson_autosave;
				if (newer && newer !== json) {
					console.log("Updating Autosave");
					retry_autosave(newer);
				} else {
					pending_storyjson_autosave = null;
				}
			});
		});
	})(storyjson);
}
function decompress_story(cstoryjson) //decompress story from LZMA to json object
{
	var story = null;
	try {
		var storyjson = lz_d.decompress(b64_to_buf(cstoryjson));
		if (storyjson == null || storyjson == "") {
			return null;
		} else {
			console.log("Decompressed story: " + storyjson);
			story = JSON.parse(storyjson);
		}
	} catch (e) {
		return null;
	}
	return story;
}
function import_compressed_story(cstoryjson, force_load_settngs) { //attempts to load story from compressed json, in KAI format
	console.log("Importing shared story...");

	var story = decompress_story(cstoryjson);
	if (story != null) {
		//fetch the model list
		if (selected_models.length == 0) {
			fetch_models((mdls) => {
				//can we find the model that's used? if yes load it, otherwise load the first one
				if (mdls.length == 0 && !localflag) {
					msgbox("No models available. Unable to load.");
				} else {
					if (!localflag) {
						selected_models = [];

						//if ALL of the previously selected models still exist, use them
						if (story.savedsettings && story.savedsettings.modelhashes && story.savedsettings.modelhashes.length > 0) {
							for (var i = 0; i < mdls.length; ++i) {
								if (story.savedsettings.modelhashes.includes(cyrb_hash(mdls[i].name))) {
									selected_models.push(mdls[i]);
								}
							}
							if (selected_models.length == 0 || selected_models.length != story.savedsettings.modelhashes.length) {
								selected_models = []; //need to reset
							}
						}

						//otherwise, switch to the default list
						if (selected_models.length == 0) {
							for (var i = 0; i < mdls.length; ++i) {
								let skipignored = false;
								for (let k = 0; k < ignoredmodels.length; ++k) {
									if (mdls[i].name.trim().toLowerCase().includes(ignoredmodels[k].trim().toLowerCase())) {
										skipignored = true;
										break;
									}
								}
								if (!skipignored) {
									for (var j = 0; j < defaultmodels.length; ++j) {
										if (
											mdls[i].name.trim().toLowerCase().includes(defaultmodels[j].trim().toLowerCase())
											|| defaultmodels[j].trim().toLowerCase().includes(mdls[i].name.trim().toLowerCase())
										) {
											selected_models.push(mdls[i]);
										}
									}
								}
							}
						}

						if (selected_models.length == 0) { //no matching models, just assign one
							selected_models.push(mdls[0]);
						}

						render_gametext();
					}
				}
			});
		}

		kai_json_load(story, force_load_settngs);
	} else {
		msgbox("Could not import from URL or TextData. Is it valid?");
	}
}

//Connectivity and endpoint connection functions
function apply_proxy_url(url, proxy_by_default = false) {
	let proxy_part = "";

	//we never attempt to proxy localhost addresses
	let is_local = false;

	if (url) {
		is_local = is_local_url(url);
	}

	if ((uses_cors_proxy || proxy_by_default) && !is_local) {
		proxy_part = cors_proxy + "?";
	}
	return proxy_part + url;
}
function get_kobold_header() {
	let header = { "Content-Type": "application/json" };
	if (custom_kobold_key != "") {
		header["Authorization"] = "Bearer " + custom_kobold_key;
	} else if (document.getElementById("customkoboldkey").value != "") {
		header["Authorization"] = "Bearer " + document.getElementById("customkoboldkey").value;
	}
	return header;
}

//synchronous and SSE kai and openAI requests
function trigger_abort_controller() //triggers an abort of an in-progress gen http request
{
	try { //setup global abort controller
		if (globalabortcontroller) {
			globalabortcontroller.abort();
			console.log("Abort Signal");
		}
		globalabortcontroller = null;
		const controller = new AbortController();
		const signal = controller.signal;
		globalabortcontroller = controller;
	} catch (e) {
		console.log("AbortController Not Supported: " + e);
	}
}
function show_last_incomplete_kai_syncpoll_request() {
	if (kai_poll_recoverykey == "") {
		return;
	}
	hide_msgbox();
	fetch(custom_kobold_endpoint + koboldcpp_check_endpoint, {
		method: "POST",
		headers: get_kobold_header(),
		body: JSON.stringify({
			genkey: kai_poll_recoverykey,
		}),
	})
		.then((response) => response.json())
		.then((data) => {
			//makes sure a delayed response doesnt arrive late and mess up
			if (data && data.results != null && data.results.length > 0 && data.results[0].text) {
				let recovered = data.results[0].text;
				msgbox(recovered, "Recovered Last Response");
			}
		})
		.catch((error) => {
			console.error("Error:", error);
		});
	kai_poll_recoverykey = "";
}
function kobold_api_sync_req(sub_endpt, submit_payload, trackedgenid) {
	let reqOpt = {
		method: "POST", // or 'PUT'
		headers: get_kobold_header(),
		body: JSON.stringify(submit_payload),
	};
	if (globalabortcontroller) {
		reqOpt.signal = globalabortcontroller.signal;
	}
	fetch(sub_endpt, reqOpt)
		.then((response) => response.json())
		.then((data) => {
			console.log("sync kobold_api_stream response: " + JSON.stringify(data));
			if (custom_kobold_endpoint != "" && data && data.results != null && data.results.length > 0) {
				let sync_response = data.results[0].text;
				if (data.results[0].finish_reason == "stop") {
					last_stop_reason = "stop";
				}
				last_response_obj = JSON.parse(JSON.stringify(data));
				if (pending_response_id == "" || pending_response_id == trackedgenid) { //drop unrelated requests
					synchro_polled_response = sync_response;
				}
				synchro_pending_stream = "";
			} else {
				//error occurred, maybe captcha failed
				console.error("error occurred in v1 generation");
				clear_poll_flags();
				render_gametext();

				msgbox("Error occurred during text generation: " + format_json_error(data), "Error Encountered", false, false, () => {
					if (is_using_kcpp_with_streaming() && data.detail && data.detail.type == "service_unavailable") {
						//offer to abort
						msgboxYesNo("Attempt to abort existing request?", "Send Abort Command?", () => {
							lastcheckgenkey = "";
							kai_poll_recoverykey = "";
							abort_generation();
						}, null);
					}
				});
			}
		})
		.catch((error) => {
			console.error("Error:", error);
			if (error.name != "AbortError") { //aborts are silent
				if (synchro_pending_stream != "" && lastcheckgenkey != "") {
					kai_poll_recoverykey = lastcheckgenkey;
				}
				flush_streaming_text();
				if (kai_poll_recoverykey != "") {
					msgbox(
						`Error while submitting prompt: ${error}<br><br><a href="#" onclick="show_last_incomplete_kai_syncpoll_request()" class="color_blueurl">Click Here</a> to attempt to recover the last response. This is not guaranteed to work.`,
						"Error Encountered",
						true,
					);
				} else {
					msgbox("Error while submitting prompt: " + error);
				}
			}
			clear_poll_flags();
			render_gametext();
		});
}
function kobold_api_stream_sse(sub_endpt, submit_payload) {
	synchro_pending_stream = "";
	let reqOpt = { method: "POST", headers: get_kobold_header(), body: JSON.stringify(submit_payload) };
	if (globalabortcontroller) {
		reqOpt.signal = globalabortcontroller.signal;
	}
	fetch(sub_endpt, reqOpt)
		.then(x => {
			if (x.ok) {
				return x;
			} else {
				throw new Error("Error occurred while SSE streaming: " + (x.statusText));
				return null;
			}
		})
		.then(resp => {
			resp.body
				.pipeThrough(new TextDecoderStream())
				.pipeThrough(
					new TransformStream({
						start(ctrl) {
							ctrl.buf = "";
						},
						transform(chunk, ctrl) {
							ctrl.buf += chunk;
							let evs = [];
							let m;
							while ((m = /^event: (.*)\ndata: (.*)(\r?\n){2}/m.exec(ctrl.buf)) !== null) {
								evs.push({ event: m[1], data: JSON.parse(m[2]) });
								ctrl.buf = ctrl.buf.substring(m.index + m[0].length);
							}
							if (evs.length) {
								ctrl.enqueue(evs);
							}
						},
					}),
				)
				.pipeTo(
					new WritableStream({
						write(chunk) {
							let was_empty = synchro_pending_stream == "";
							//cut stream if aborted
							if (pending_response_id && pending_response_id != "-1" && pending_response_id != "") {
								for (let event of chunk) {
									if (event.event === "message") {
										synchro_pending_stream += event.data.token;
										if (event.data.finish_reason == "stop") {
											last_stop_reason = "stop";
										}
									}
								}
							} else {
								trigger_abort_controller();
							}
							if (was_empty && synchro_pending_stream != "") {
								render_gametext(false);
							} else {
								update_pending_stream_displays();
							}
						},
						close() { //end of stream
							let finish_actions = function() {
								synchro_polled_response = synchro_pending_stream;
								synchro_pending_stream = "";
								poll_pending_response();
							};

							//handle gen failures
							if (resp.status == 503) {
								finish_actions();
								msgbox("Error while submitting prompt: Server appears to be busy.");
							} else {
								//if we wanted logprobs, try fetching them manually
								if (localsettings.request_logprobs && last_response_obj == null) {
									fetch(custom_kobold_endpoint + koboldcpp_logprobs_endpoint, {
										method: "POST",
										headers: get_kobold_header(),
										body: JSON.stringify({
											genkey: lastcheckgenkey,
										}),
									})
										.then((response) => response.json())
										.then((data) => {
											//makes sure a delayed response doesnt arrive late and mess up
											if (data && data.logprobs != null && last_response_obj == null) {
												//fake a last response obj
												let fakedresponse = {
													artificial_response: true,
													results: [{ logprobs: data.logprobs }],
												};
												last_response_obj = fakedresponse;
											}
											finish_actions();
										})
										.catch((error) => {
											console.error("Error:", error);
											finish_actions();
										});
								} else {
									finish_actions();
								}
							}
						},
						abort(error) {
							console.error("Error:", error);
							if (error.name != "AbortError") { //aborts are silent. slightly diff logic
								flush_streaming_text();
								msgbox("Error while submitting prompt: " + error);
							}
							clear_poll_flags();
							render_gametext();
						},
					}),
				);
		})
		.catch((error) => {
			console.error("Error:", error);
			if (error.name != "AbortError") { //aborts are silent. slightly diff logic
				flush_streaming_text();
				msgbox("Error while submitting prompt: " + error);
			}
			clear_poll_flags();
			render_gametext();
		});
}
function gemini_api_sync_req(targetep, payload, geminiheaders) {
	fetch(targetep, {
		method: "POST",
		headers: geminiheaders,
		body: JSON.stringify(payload),
		referrerPolicy: "no-referrer",
	})
		.then((response) => response.json())
		.then((data) => {
			console.log("sync finished response: " + JSON.stringify(data));
			last_response_obj = JSON.parse(JSON.stringify(data));
			if (
				custom_gemini_key != "" && data.candidates != null && data.candidates.length > 0 && data.candidates[0].output
				&& data.candidates[0].output != ""
			) {
				synchro_polled_response = data.candidates[0].output;
			} else if (
				custom_gemini_key != "" && data.candidates != null && data.candidates.length > 0 && data.candidates[0].content
				&& data.candidates[0].content.parts != null && data.candidates[0].content.parts.length > 0
			) {
				synchro_polled_response = "";
				for (let x = 0; x < data.candidates[0].content.parts.length; ++x) {
					if (!data.candidates[0].content.parts[x].text) {
						continue;
					}
					let tmp = data.candidates[0].content.parts[x].text;
					if (data.candidates[0].content.parts[x].thought) {
						tmp = `<think>${tmp}</think>`;
					}
					synchro_polled_response += tmp;
				}
				//try to handle the stripping of spaces
				if (localsettings.opmode == 1 && gametext_arr.length > 0 && synchro_polled_response != "") {
					synchro_polled_response = cleanup_story_completion(synchro_polled_response);
				}
			} else {
				//error occurred, maybe captcha failed
				console.error("error occurred in Gemini generation");
				clear_poll_flags();
				render_gametext();
				msgbox("Error occurred during text generation: " + format_json_error(data));
			}
		})
		.catch((error) => {
			console.error("Error:", error);
			clear_poll_flags();
			render_gametext();
			msgbox("Error while submitting prompt: " + error);
		});
}
function oai_api_sync_req(targetep, oai_payload, oaiheaders) {
	fetch(targetep, {
		method: "POST",
		headers: oaiheaders,
		body: JSON.stringify(oai_payload),
		referrerPolicy: "no-referrer",
	})
		.then((response) => response.json())
		.then((data) => {
			console.log("sync finished response: " + JSON.stringify(data));
			last_response_obj = JSON.parse(JSON.stringify(data));
			if (custom_oai_key != "" && data.choices != null && data.choices.length > 0) {
				let dch = data.choices[0];
				if (dch.text) {
					synchro_polled_response = dch.text;
				} else if (dch.message) {
					synchro_polled_response = dch.message.content;
					if (dch.message.reasoning_content != null && dch.message.reasoning_content != "") { //vllm compat
						if (dch.message.content == null) {
							synchro_polled_response = dch.message.reasoning_content;
						} else {
							synchro_polled_response = `<think>${dch.message.reasoning_content}</think>${dch.message.content}`;
						}
					}

					if (
						oaiemulatecompletionscontent != "" && synchro_polled_response != ""
						&& synchro_polled_response.startsWith(oaiemulatecompletionscontent)
					) {
						synchro_polled_response = synchro_polled_response.substring(oaiemulatecompletionscontent.length);
						oaiemulatecompletionscontent = "";
					}

					if (localsettings.opmode == 1 && gametext_arr.length > 0 && synchro_polled_response != "") {
						synchro_polled_response = cleanup_story_completion(synchro_polled_response);
					}
				} else {
					console.error("Error, unknown OAI response");
					clear_poll_flags();
					render_gametext();
					msgbox("Error, unknown OAI response");
				}
			} else {
				//error occurred, maybe captcha failed
				console.error("error occurred in OAI generation");
				clear_poll_flags();
				render_gametext();
				msgbox("Error occurred during text generation: " + format_json_error(data));
			}
		})
		.catch((error) => {
			console.error("Error:", error);
			clear_poll_flags();
			render_gametext();
			msgbox("Error while submitting prompt: " + error);
		});
}
function oai_api_stream_sse(sub_endpt, submit_payload, submit_headers) {
	synchro_pending_stream = "";
	gemini_was_thinking = false;
	let reqOpt = { method: "POST", headers: submit_headers, body: JSON.stringify(submit_payload) };
	if (globalabortcontroller) {
		reqOpt.signal = globalabortcontroller.signal;
	}
	let cached_stop_seq = get_stop_sequences();
	fetch(sub_endpt, reqOpt)
		.then(x => {
			if (x.ok) {
				return x;
			} else {
				return x.text().then(errdat => {
					throw new Error("Error while SSE streaming: " + errdat);
					return null;
				}).catch(err => {
					throw new Error("Error while SSE streaming: " + (x.statusText) + "\n" + err);
					return null;
				});
			}
		})
		.then(resp => {
			resp.body
				.pipeThrough(new TextDecoderStream())
				.pipeThrough(
					new TransformStream({
						start(ctrl) {
							ctrl.buf = "";
						},
						transform(chunk, ctrl) {
							ctrl.buf += chunk;
							let evs = [];
							let m;
							while ((m = /^data: ?(.*)(\r?\n){2}/m.exec(ctrl.buf)) !== null) {
								try {
									evs.push({ data: JSON.parse(m[1]) });
								} catch (e) {}
								ctrl.buf = ctrl.buf.substring(m.index + m[0].length);
							}
							if (evs.length) {
								ctrl.enqueue(evs);
							}
						},
					}),
				)
				.pipeTo(
					new WritableStream({
						write(chunk) {
							let was_empty = synchro_pending_stream == "";
							//cut stream if aborted
							if (pending_response_id && pending_response_id != "-1" && pending_response_id != "") {
								for (let event of chunk) {
									//for gemini
									if (event.data && event.data.candidates && event.data.candidates.length > 0) {
										if (
											event.data.candidates[0].content && event.data.candidates[0].content.parts
											&& event.data.candidates[0].content.parts.length > 0
										) {
											for (let x = 0; x < event.data.candidates[0].content.parts.length; ++x) {
												if (event.data.candidates[0].content.parts[x].thought) {
													gemini_was_thinking = true;
												}
												if (!event.data.candidates[0].content.parts[x].text) {
													continue;
												}
												if (!event.data.candidates[0].content.parts[x].thought && gemini_was_thinking) {
													synchro_pending_stream = `<think>${synchro_pending_stream}</think>`;
													gemini_was_thinking = false;
												}
												synchro_pending_stream += event.data.candidates[0].content.parts[x].text;
											}
										}
										continue;
									}

									//for oai
									if (event.data && event.data.choices && event.data.choices.length > 0) {
										if (event.data.choices[0].text) {
											synchro_pending_stream += event.data.choices[0].text;
										} else if (event.data.choices[0].delta && event.data.choices[0].delta.content) {
											synchro_pending_stream += event.data.choices[0].delta.content;
										} else if (
											event.data.choices[0].delta && !event.data.choices[0].delta.content
											&& event.data.choices[0].delta.reasoning_content != null
											&& event.data.choices[0].delta.reasoning_content != ""
										) {
											synchro_pending_stream += event.data.choices[0].delta.reasoning_content;
										}

										//mistral prefill interception
										if (
											oaiemulatecompletionscontent != "" && synchro_pending_stream != ""
											&& synchro_pending_stream.startsWith(oaiemulatecompletionscontent)
										) {
											synchro_pending_stream = synchro_pending_stream.substring(oaiemulatecompletionscontent.length);
											oaiemulatecompletionscontent = "";
										}

										if (event.data.choices[0].finish_reason == "stop") {
											last_stop_reason = "stop";
										}
									}

									//potentially trigger an early stopping
									for (let i = 0; i < cached_stop_seq.length; ++i) {
										let cur = cached_stop_seq[i];
										if (!cur || cur.trim() == "") {
											continue;
										}
										if (synchro_pending_stream.includes(cur) && synchro_pending_stream.trim().indexOf(cur) > 1) { //don't trigger early stopping if the match is very early
											cached_stop_seq = [];
											let need_clean_output = synchro_pending_stream != "" && localsettings.opmode == 1
												&& gametext_arr.length > 0 && document.getElementById("useoaichatcompl").checked;
											if (need_clean_output) {
												synchro_pending_stream = cleanup_story_completion(synchro_pending_stream);
											}
											flush_streaming_text();
											clear_poll_flags();
											trigger_abort_controller();
											console.log("Somehow a stop seq was generated. Aborting...");
											break;
										}
									}
								}
							} else {
								trigger_abort_controller();
							}
							if (was_empty && synchro_pending_stream != "") {
								render_gametext(false);
							} else {
								update_pending_stream_displays();
							}
						},
						close() { //end of stream
							synchro_polled_response = synchro_pending_stream;
							let need_clean_output = synchro_polled_response != "" && localsettings.opmode == 1 && gametext_arr.length > 0
								&& document.getElementById("useoaichatcompl").checked;
							if (need_clean_output) {
								synchro_polled_response = cleanup_story_completion(synchro_polled_response);
							}
							synchro_pending_stream = "";
							gemini_was_thinking = false;
							poll_pending_response();
							//handle gen failures
							if (resp.status == 503) {
								msgbox("Error while submitting prompt: Server appears to be busy.");
							}
						},
						abort(error) {
							console.error("Error:", error);
							if (error.name != "AbortError") { //aborts are silent. slightly diff logic
								flush_streaming_text();
								msgbox("Error while submitting prompt: " + error);
							}
							clear_poll_flags();
							render_gametext();
						},
					}),
				);
		})
		.catch((error) => {
			console.error("Error:", error);
			if (error.name != "AbortError") { //aborts are silent. slightly diff logic
				flush_streaming_text();
				msgbox("Error while submitting prompt: " + error);
			}
			clear_poll_flags();
			render_gametext();
		});
}

function playbeep() {
	var sound = new Audio(
		"data:audio/wav;base64,UklGRkwBAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YScBAAB8gIN8fICAgIB8gHmAjXVkhptyXYqbcmiKjXKAim5ymIpWcqmKU3Klhl18kXl5jXlkjZ5oVpelZFaUm2trioN1ioZkeaKDU3msgFN8nnxog4Nyg5FrZJubXWGem2FnlIpufIZyfJR8XYOleVaDonlhg5F1eYZ5dZGNYXWbimhrm4Nrg3KDjWt/hm6UkUmDvV1TrINdkXxol4Boinx1nmtWr5RChqVheZdkeZtucop1io1WgLNhWql/XZd/YZSNZH+GeY1yZKKNUIaeZHmYZ3WbeWuGg4B/a4Oba2uXgGuNf2iKjWt5ioB/eXWNg2t/jXJ8inJ5kXxug4N8fHl/hnl1hnx5hn91g4Z1fIN8fHx8f4B5gIB8gH98fIN8fH+AfHx8fH98fIB/AA==",
	);
	sound.play();
	console.log("beep sound");
}
function background_audio_loop(play = false) {
	if (play) {
		if (!bg_silence) {
			bg_silence = new Audio(
				"data:audio/wav;base64,UklGRmQBAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YUABAAAAAAEABQAKABEAHAAoADYARQBaAGoAhQCYALYAzQDuAAgBLAFKAW0BkgGyAdwB/gEnAkwCdAKbAsIC6wIPAzkDXQOEA6gDywPxAw4EMgRPBGwEigSgBLkEzwThBPMEAQUMBRYFHAUfBSEFHAUYBQ8FAwX0BOAEtgSKBFkELgT0A8oDjQNcAyID6QKwAnUCOAL8Ab0BgAFAAQEBwgB+AEQA/f/B/3//Pv8B/77+gf5C/gb+xv2N/U/9F/3e/Kb8bvw9/AX81/ul+3X7Tfsy+yX7EvsK+wD7+/r7+vj6APsD+xD7Gvsp+zn7T/th+337k/uv+8/76fsN/C78Tvx1/Jf8vvzj/An9Mf1V/YD9ov3O/e/9GP46/mL+gv6p/sP+7P4C/yj/Pf9b/3L/if+g/7D/xf/P/+H/6f/y//v//P8CAA==",
			);
			bg_silence.loop = true;
			bg_silence.play();
		}
	} else {
		if (bg_silence) {
			bg_silence.loop = false;
			bg_silence.pause();
			bg_silence = null;
		}
	}
}
function shownotify() {
	if ("Notification" in window) {
		// Request permission to show notifications
		if (Notification.permission === "granted" || notify_allowed) {
			var notification = new Notification("KoboldAI Lite", {
				body: "Text Generation Completed!",
			});
		} else {
			Notification.requestPermission().then(function(permission) {
				if (permission === "granted") {
					notify_allowed = true;
					console.log("Notification permission granted");
				} else {
					console.log("Notification permission denied");
				}
			});
		}
	} else {
		console.log("Notification API not supported in this browser");
	}
}

function copyToClipboard(text) {
	const fallbackCopy = function(text) {
		const textArea = document.createElement("textarea");
		textArea.value = text;
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		try {
			document.execCommand("copy");
		} catch (err) {
			console.error("Fallback: Copy command failed", err);
		}
		document.body.removeChild(textArea);
	};

	if (navigator.clipboard && navigator.clipboard.writeText) {
		navigator.clipboard.writeText(text).catch(err => {
			// fallback if clipboard API fails
			fallbackCopy(text);
		});
	} else {
		fallbackCopy(text);
	}
}
function copyMarkdownCode(btn) {
	const codeContainer = btn.parentElement.querySelector("pre code");
	let innercode = codeContainer.innerText;
	//remove common language descriptiors from the start
	let langsmatched = [
		"matlab",
		"jsonc",
		"powershell",
		"ps1",
		"haskell",
		"hs",
		"vbnet",
		"vb",
		"apache",
		"apacheconf",
		"makefile",
		"mk",
		"ini",
		"protobuf",
		"proto",
		"typescript",
		"tsx",
		"markdown",
		"md",
		"mkdown",
		"mkd",
		"python",
		"py",
		"javascript",
		"js",
		"jsx",
		"html",
		"xhtml",
		"xml",
		"css",
		"json",
		"typescript",
		"ts",
		"tsx",
		"bash",
		"sh",
		"zsh",
		"java",
		"csharp",
		"cs",
		"c",
		"h",
		"cpp",
		"hpp",
		"php",
		"sql",
		"ruby",
		"rb",
		"go",
		"golang",
		"kotlin",
		"kt",
		"swift",
		"rust",
		"rs",
		"r",
		"dart",
		"scala",
		"dockerfile",
		"docker",
		"yaml",
		"yml",
		"ini",
		"toml",
		"perl",
		"pl",
		"shell",
		"console",
		"powershell",
		"ps1",
		"lua",
		"typescript",
		"ts",
	];
	for (let i = 0; i < langsmatched.length; ++i) {
		let matcher = langsmatched[i] + "\n";
		if (innercode.startsWith(matcher)) {
			innercode = innercode.substring(matcher.length);
			break;
		}
	}
	copyToClipboard(innercode);
}

function simpleMarkdown(text, renderLatex) {
	const escapeHTML = (str) => str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
	const highlightCode = (code) => {
		let cpybtn = `<button class="unselectable" onclick="return copyMarkdownCode(this)" style="float:right;">Copy</button>`;
		code = escapeHTML(code);
		code = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
		code = code.replace(/\t/g, "   ");
		code = code.replace(/\^\^\^(.+?)\^\^\^/g, "<mark>$1</mark>");
		code = code.replace(/^\/\/(.*)/gm, "<rem>//$1</rem>");
		code = code.replace(/\s\/\/(.*)/gm, " <rem>//$1</rem>");
		code = code.replace(/(\s?)(function|procedure|return|exit|if|then|else|end|loop|while|or|and|case|when)(\s)/gim, "$1<b>$2</b>$3");
		code = code.replace(/(\s?)(var|let|const|=>|for|next|do|while|loop|continue|break|switch|try|catch|finally)(\s)/gim, "$1<b>$2</b>$3");
		return `<pre>${cpybtn}<code>${code}</code></pre>`;
	};
	const convertMarkdownTableToHtml = (t) => {
		let hsep = /^[\s]*\|(?:[\s]*[-:]+[-:|\s]*)+\|[\s]*$/gm;
		let l = /^[\s]*\|(.*)\|[\s]*$/gm;
		let r = t.split(/\r?\n|\r/);
		let outp = "<table class='tablelines'>";
		for (let o of r) {
			let hs = o.match(hsep);
			if (hs) continue;
			let d = o.match(l);
			if (d) {
				let i = d[0].split("|").map(t => t.trim());
				outp += `<tr class='tablelines'><td class='tablelines'>${i.join("</td><td class='tablelines'>")}</td></tr>`;
			}
		}
		return outp + "</table>";
	};
	const replaceLatex = (input) => {
		//all latex patterns except inline tex
		input = input.replace(
			/(^```math\n([\s\S]*?)\n```$|^ {0,6}\\\[\n([\s\S]*?)\n {0,6}\\\]$|^\$\$\n([\s\S]*?)\n\$\$$|\$\$([^\n]+?)\$\$|\\\(([^\n]+?)\\\)|\\\[([^\n]+?)\\\])/gm,
			(match, p1, p2, p3, p4, p5, p6, p7) => {
				let content = p2 || p3 || p4 || p5 || p6 || p7;
				const matchedlw = match.match(/^[ \t]*/);
				const leadingWhitespace = matchedlw ? matchedlw[0] : "";
				content = unescape_html(content);
				return leadingWhitespace + temml.renderToString(content); // render LaTeX content
			},
		);
		input = input.replace(/(?:^|[^\\])\$(\S[^$\n]*?\S)\$(?!\d)/g, (match, p1) => {
			let content = p1;
			content = unescape_html(content);
			return " " + temml.renderToString(content); // render LaTeX content
		});
		input = input.replace(
			/(^\\begin\{math\}\n([\s\S]*?)\n\\end\{math\}$|^\\begin\{equation\}\n([\s\S]*?)\n\\end\{equation\}$)/gm,
			(match, p1, p2, p3) => { //match math eqns
				let content = p2 || p3;
				content = unescape_html(content);
				return temml.renderToString(content); // render LaTeX content
			},
		);
		return input;
	};
	const replaceTabbedCodeblocks = (input) => {
		let previousIndentation = 0;
		let inCodeBlock = false;
		input = input.replace(/\t/g, "    "); //replace tabs with 4 spaces
		const lines = input.split("\n");
		const regex = /^( {4,10})(.*)/;
		let prevIsNewline = false;
		let withinCodeBlock = false;
		input = lines.map((line) => {
			let isNewline = line.trim() == "";
			const match = line.match(regex);
			if (match && (withinCodeBlock || prevIsNewline)) {
				const [, spaces, content] = match;
				let lessspaces = spaces.substring(4);
				withinCodeBlock = true;
				line = `<pre><code>${lessspaces}${escapeHTML(content)}</code></pre>`;
			} else {
				withinCodeBlock = false;
			}
			prevIsNewline = isNewline;
			return line; // Return unmodified if no match or condition not met
		}).join("\n");
		return input;
	};
	const formatMarkdown = (md) => {
		let append_spcetg = false;
		if (md.trim().startsWith("%SpcEtg%")) { //this can cause issues matching start of response, so we note it down and remove it first
			let idxof = md.indexOf("%SpcEtg%");
			md = md.substring(idxof + 8);
			append_spcetg = true;
		}

		md = md.replace(/^###### (.*?)\s*#*$/gm, "<h6>$1</h6>")
			.replace(/^##### (.*?)\s*#*$/gm, "<h5>$1</h5>")
			.replace(/^#### (.*?)\s*#*$/gm, "<h4>$1</h4>")
			.replace(/^### (.*?)\s*#*$/gm, "<h3>$1</h3>")
			.replace(/^## (.*?)\s*#*$/gm, "<h2>$1</h2>")
			.replace(/^# (.*?)\s*#*$/gm, "<h1>$1</h1>")
			.replace(/^<h(\d)\>(.*?)\s*{(.*)}\s*<\/h\d\>$/gm, '<h$1 id="$3">$2</h$1>')
			.replace(/^-{3,}|^\_{3,}|^\*{3,}$/gm, "<hr/>")
			.replace(/``(.*?)``/gm, (match, code) => {
				return `<code>${escapeHTML(code).replace(/`/g, "`")}</code>`;
			})
			.replace(/`(.*?)`/gm, "<code>$1</code>")
			.replace(/^\>\> (.*$)/gm, "<blockquote><blockquote>$1</blockquote></blockquote>")
			.replace(/^\> (.*$)/gm, "<blockquote>$1</blockquote>")
			.replace(/<\/blockquote\>\n<blockquote\>/g, "\n")
			.replace(/<\/blockquote\>\n<blockquote\>/g, "\n<br>")
			.replace(/!\[(.*?)\]\((.*?) "(.*?)"\)/gm, '<img alt="$1" src="$2" $3 />')
			.replace(/!\[(.*?)\]\((.*?)\)/gm, '<img alt="$1" src="$2" />')
			.replace(/\[(.*?)\]\((.*?) "new"\)/gm, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
			.replace(/\[(.*?)\]\((.*?) "(.*?)"\)/gm, '<a href="$2" title="$3" target="_blank" rel="noopener noreferrer">$1</a>')
			.replace(/<http(.*?)\>/gm, '<a href="http$1" target="_blank" rel="noopener noreferrer">http$1</a>')
			.replace(/\[(.*?)\]\(\)/gm, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
			.replace(/\[(.*?)\]\((.*?)\)/gm, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
			.replace(/^[\*+-][ .](.*)/gm, "<ul><li>$1</li></ul>")
			.replace(/\%SpcEtg\%(\d\d?)[.](.*)([\n]?)/gm, "\%SpcEtg\%\n$1.$2\n")
			.replace(/(^\d\d?[ .] .*)\%SpcStg\%/gm, "$1\n\%SpcTemp\%") //fix misalign
			.replace(/^(\d\d?)[ .] (.*)([\n]??)/gm, function(match, p1, p2) {
				return `<ol start="${p1}"><li>${p2}</li></ol>`;
			})
			.replace(/\n\%SpcTemp\%/gm, "\%SpcStg\%") //fix misalign
			.replace(/<\/li><\/ol>\n\s*?\n<ol start="\d+"><li>/gm, "</li>\n<li>")
			.replace(/<\/li><\/ol>\s*?<ol start="\d+"><li>/gm, "</li><li>")
			.replace(/<\/ul><li>(.*\%SpcStg\%.*\%SpcEtg\%.*)<\/li><\/ul>/gm, "$1")
			.replace(/<\/ol><li>(.*\%SpcStg\%.*\%SpcEtg\%.*)<\/li><\/ol>/gm, "$1")
			.replace(/^\s{2,6}[\*+-][ .](.*)/gm, "<ul><ul><li>$1</li></ul></ul>")
			.replace(/^\s{2,6}(\d)[ .](.*)/gm, function(match, p1, p2) {
				return `<ul><ol start="${p1}"><li>${p2}</li></ol></ul>`;
			})
			.replace(/<\/ul>\n\n<ul>/gm, "\n")
			.replace(/<\/ol>\n\n<ol start="\d+">/gm, "\n")
			.replace(/<\/ol>\n<ol start="\d+">/g, "")
			.replace(/<\/ul>\n<ul>/g, "")
			.replace(/<\/li><\/ul>\n\s*?\n<ul><li>/gm, "</li>\n<li>")
			.replace(/<\/li><\/ul>\s*?<ul><li>/gm, "</li><li>")
			.replace(/\*\*\*([^\s*].*?[^\\])\*\*\*/gm, "<b><em>$1</em></b>")
			.replace(/\*\*([^\s*].*?[^\\])\*\*/gm, "<b>$1</b>")
			.replace(/\*([^\s*].*?[^\\])\*/gm, "<em>$1</em>")
			.replace(/___(\w.*?[^\\])___/gm, "<b><em>$1</em></b>")
			.replace(/__(\w.*?[^\\])__/gm, "<u>$1</u>")
			.replace(/~~(\w.*?)~~/gm, "<del>$1</del>")
			.replace(/\^\^(\w.*?)\^\^/gm, "<ins>$1</ins>")
			.replace(/\{\{(\w.*?)\}\}/gm, "<mark>$1</mark>")
			.replace(/^((?:\|[^|\r\n]*[^|\r\n\s]\s*)+\| {0,2}(?:\r?\n|\r|))+/gm, (matchedTable) => convertMarkdownTableToHtml(matchedTable))
			.replace(/  \n/g, "\n<br/>");
		if (append_spcetg) {
			append_spcetg = false;
			md = `%SpcEtg%${md}`;
		}
		md = replaceTabbedCodeblocks(md);
		md = md.replace(/<\/code\><\/pre\>\n<pre\><code\>/g, "\n");
		if (renderLatex) {
			md = replaceLatex(md);
		}
		md = md.replace(/<\/ul>\n/gm, "</ul>").replace(/<\/ol>\n/gm, "</ol>");
		md = md.replace(/\\([`_~\*\+\-\.\^\\\<\>\(\)\[\]])/gm, "$1");
		return md;
	};
	text = text.replace(/\r\n/g, "\n").replace(/\n~~~/g, "\n```").replace(/```(([^`]|`[^`])+)```/g, "<code>$1</code>");
	let result = "";
	let codeStartIndex = 0;
	let codeEndIndex = 0;
	while ((codeStartIndex = text.indexOf("<code>")) >= 0) {
		codeEndIndex = text.indexOf("</code>", codeStartIndex);
		result += formatMarkdown(text.substr(0, codeStartIndex));
		result += highlightCode(text.substr(codeStartIndex + 6, codeEndIndex > 0 ? codeEndIndex - codeStartIndex - 6 : text.length));
		text = text.substr(codeEndIndex + 7);
	}
	result += formatMarkdown(text);
	return result;
}

function restore_endpoint_dropdowns() {
	var cep = document.getElementById("customapidropdown");
	var cephide = document.getElementById("unusedcustomapidropdown");

	//remove all unwanted options from the endpoint dropdown in case it is used
	for (var i = cep.options.length - 1; i >= 0; i--) {
		cep.remove(i);
	}
	for (var i = 0; i < cephide.options.length; ++i) {
		var newOption = document.createElement("option");
		newOption.value = cephide.options[i].value;
		newOption.text = cephide.options[i].text;
		cep.add(newOption);
	}
}

function clear_cors_proxy_flag() {
	uses_cors_proxy = false;
}

// attempt to connect to the selected backend
function attempt_connect(popup_aiselect = true) {
	if (localflag) {
		document.getElementById("customapidropdown").value = 1;
		localprotocol = "http://";
		if (window.location.protocol.includes("https") && !is_using_web_lite()) {
			localprotocol = "https://";
		}
		if (localmodekey) {
			document.getElementById("customkoboldkey").value = localmodekey;
		}
		document.getElementById("customkoboldendpoint").value = localprotocol + localmodehost + ":" + localmodeport + sublocalpathname;
		connect_custom_endpoint();
		document.getElementById("lastreq3").innerHTML =
			document.getElementById("lastreq2").innerHTML =
			document.getElementById("lastreq1").innerHTML =
				`<a href="#" class="color_grayurl" onclick="msgbox('Source code is available at https://github.com/LostRuins/lite.koboldai.net \\nPlease report any bugs you find there.','Information')">KoboldAI Lite</a> v${LITEVER} Embedded`;

		read_url_params_data();
	} else {
		//fetch horde performance status as initial login
		fetch(horde_perf_endpoint)
			.then(x => x.json())
			.then(data => {
				perfdata = {
					queued_requests: 0,
					queued_tokens: 0,
					past_minute_tokens: 0,
					worker_count: 0,
				};
				//new horde api
				perfdata.queued_requests += data.queued_text_requests;
				perfdata.worker_count += data.text_worker_count;
				perfdata.queued_tokens += data.queued_tokens;
				perfdata.past_minute_tokens += data.past_minute_tokens;
				document.body.classList.add("connected");
				document.getElementById("connectstatus").innerHTML = "AI Horde";
				document.getElementById("connectstatus").classList.add("color_offwhite");
				render_gametext(false);

				read_url_params_data();

				if (popup_aiselect) {
					display_endpoint_container();
				}
			}).catch((error) => {
				console.error(error);
				msgbox(
					"Failed to connect to AI Horde Service!\nPlease check your network connection.<br><br>You may still be able to connect to an alternative service, <a href='#' class='color_blueurl' onclick='hide_popups();display_endpoint_container()'>click here to view options</a>.",
					"Error Encountered",
					true,
				);
				document.body.classList.remove("connected");
				document.getElementById("connectstatus").innerHTML = "Offline Mode";
				document.getElementById("connectstatus").classList.remove("color_offwhite");
				render_gametext(false);
			});
	}

	//for local mode, we only fetch the SD model list after the field is selected
	if (!localflag) {
		fetch_image_models();
	}
	if (localsettings.speech_synth == XTTS_ID || localsettings.speech_synth == ALLTALK_ID) {
		fetch_xtts_voices(true, localsettings.speech_synth == XTTS_ID);
	}
	if (localsettings.generate_images_mode == 2) {
		connect_to_a1111(true);
	} else if (localsettings.generate_images_mode == 4) {
		connect_to_comfyui(true);
	}
	if (!initial_fetched_kudos && localsettings.my_api_key != defaultsettings.my_api_key) {
		document.getElementById("apikey").value = localsettings.my_api_key;
		initial_fetched_kudos = true;
		fetch_kudo_balance();
	}
}

//read any parameters passed in from the URL, and load content if found
function read_url_params_data() {
	//read the url params, and autoload a shared story if found
	const foundStory = urlParams.get("s");
	const foundDpaste = urlParams.get("dp");
	const foundScenario = urlParams.get("scenario");
	const foundScenarioSource = scenario_sources.find(scenario => urlParams.get(scenario.urlParam));

	let foundQuery = urlParams.get("query");
	if (!foundQuery || foundQuery == "") {
		foundQuery = urlParams.get("q");
	}

	if (foundStory && foundStory != "") {
		avoidwelcome = true;
		if (localsettings.persist_session && !safe_to_overwrite()) {
			import_compressed_story_prompt_overwrite(foundStory);
		} else {
			import_compressed_story(foundStory, false);
		}
		//purge url params
		window.history.replaceState(null, null, window.location.pathname);
	} else if (foundDpaste && foundDpaste != "") {
		avoidwelcome = true;
		let dpurl = `${dpaste_fetch_endpoint}${foundDpaste}`;
		if (foundDpaste.includes(".") || foundDpaste.includes("/")) {
			dpurl = `${foundDpaste}`;
			if (!foundDpaste.includes("http")) {
				dpurl = `https://${foundDpaste}`;
			}
		}

		if (foundDpaste.toLowerCase().includes("dpaste.com")) {
			dpurl = `${dpurl}.txt`;
		} else {
			dpurl = `${dpurl}/raw`;
		}
		fetch(dpurl)
			.then(x => {
				if (x.ok) {
					return x.text();
				} else {
					throw new Error("Error loading dpaste: " + (x.statusText));
					return null;
				}
			})
			.then(data => {
				if (data && data != "") {
					if (localsettings.persist_session && !safe_to_overwrite()) {
						import_compressed_story_prompt_overwrite(data);
					} else {
						import_compressed_story(data, false);
					}
				}
			}).catch((error) => {
				console.log("Error: " + error);
				msgbox("The shared URL provided is invalid or expired.");
			});
		//purge url params
		window.history.replaceState(null, null, window.location.pathname);
	} else if (foundScenario && foundScenario != "") {
		avoidwelcome = true;
		display_scenarios();
		document.getElementById("scenariosearch").value = escape_html(foundScenario);
		scenario_search();
		const found = scenario_db.find(m => m.title.toLowerCase() == foundScenario.trim().toLowerCase());
		if (found !== undefined) {
			temp_scenario = found;
			preview_temp_scenario();
		}
		//purge url params
		window.history.replaceState(null, null, window.location.pathname);
	} else if (foundScenarioSource) {
		avoidwelcome = true;
		console.log(foundScenarioSource, urlParams.get(foundScenarioSource.urlParam));
		display_scenarios();
		import_scenario(foundScenarioSource, urlParams.get(foundScenarioSource.urlParam));
		//purge url params
		window.history.replaceState(null, null, window.location.pathname);
	} else if (foundQuery && foundQuery != "") {
		avoidwelcome = true;
		window.history.replaceState(null, null, window.location.pathname);
		if (localsettings.persist_session && !safe_to_overwrite()) {
			msgboxYesNo(
				"You already have an existing persistent story. Do you want to overwrite it?",
				"Overwrite Story Warning",
				() => {
					localsettings.opmode = 4;
					restart_new_game(false);
					document.getElementById("input_text").value = foundQuery;
					prepare_submit_generation();
				},
				null,
				false,
			);
		} else {
			localsettings.opmode = 4;
			restart_new_game(false);
			document.getElementById("input_text").value = foundQuery;
			prepare_submit_generation();
		}
	}
	if (avoidwelcome) {
		close_welcome_panel(false);
	}
}

//fetch image model list from AI Horde
function fetch_image_models(onDoneCallback) {
	//fetch the stable horde model list once and store it forever, it likely wont change
	if (!image_models_fetched) {
		fetch(stablehorde_model_endpoint)
			.then(x => x.json())
			.then(shdata => {
				image_models_fetched = true;
				stablemodels = [];
				shdata = shdata.sort(function(a, b) {
					return b.count - a.count;
				});
				for (var i = 0; i < shdata.length; ++i) {
					stablemodels.push({ name: shdata[i].name, count: shdata[i].count });
				}
				console.log("Loaded SD models list: " + stablemodels.length);
				if (onDoneCallback != null) {
					onDoneCallback();
				}
			}).catch((error) => {
				console.log("Error: " + error);
			});
	}
}

function pick_default_horde_models() {
	fetch_models((mdls) => {
		//can we find the model that's used? if yes load it, otherwise load the first one
		if (mdls.length == 0 && !localflag) {
			msgbox("No models available. Unable to load.");
		} else {
			if (!localflag) {
				selected_models = [];

				for (var i = 0; i < mdls.length; ++i) {
					let skipignored = false;
					for (let k = 0; k < ignoredmodels.length; ++k) {
						if (mdls[i].name.trim().toLowerCase().includes(ignoredmodels[k].trim().toLowerCase())) {
							skipignored = true;
							break;
						}
					}
					if (!skipignored) {
						for (var j = 0; j < defaultmodels.length; ++j) {
							if (
								mdls[i].name.trim().toLowerCase().includes(defaultmodels[j].trim().toLowerCase())
								|| defaultmodels[j].trim().toLowerCase().includes(mdls[i].name.trim().toLowerCase())
							) {
								selected_models.push(mdls[i]);
							}
						}
					}
				}

				if (selected_models.length == 0) { //no matching models, just assign one
					selected_models.push(mdls[0]);
				}

				render_gametext();
			}
		}
	});
}

function connect_to_a1111(silent = false) {
	console.log("Attempt A1111 Connection...");
	//establish initial connection to a1111 api
	fetch(localsettings.saved_a1111_url + a1111_models_endpoint)
		.then(x => x.json())
		.then(modelsdata => {
			console.log("Reading Settings...");
			fetch(localsettings.saved_a1111_url + a1111_options_endpoint)
				.then(y => y.json())
				.then(optionsdata => {
					console.log(optionsdata);
					if (optionsdata.samples_format == null || modelsdata.length == 0) {
						msgbox(
							"Invalid data received or no models found. Is KoboldCpp / Forge / A1111 running at the url "
								+ localsettings.saved_a1111_url + " ?",
						);
					} else {
						let a1111_current_loaded_model = optionsdata.sd_model_checkpoint;
						console.log("Current model loaded: " + a1111_current_loaded_model);

						//repopulate our model list
						let dropdown = document.getElementById("generate_images_local_model");
						let selectionhtml = ``;
						for (var i = 0; i < modelsdata.length; ++i) {
							selectionhtml += `<option value="` + modelsdata[i].title + `" `
								+ (a1111_current_loaded_model == modelsdata[i].title ? "selected" : "") + `>` + modelsdata[i].title + `</option>`;
						}
						dropdown.innerHTML = selectionhtml;
						a1111_is_connected = true;
					}
				}).catch((error) => {
					if (!silent) {
						msgbox(
							"A1111 Connect Error: " + error
								+ "\nPlease make sure KoboldCpp / Forge / A1111 is running and properly configured!\nIn your local install of Automatic1111 WebUi, modify webui-user.bat and add these flags to enable API access:\n\nset COMMANDLINE_ARGS= --api --listen --cors-allow-origins=*\n",
						);
					}
					a1111_is_connected = false;
				});
		}).catch((error) => {
			if (
				silent && koboldcpp_has_txt2img && custom_kobold_endpoint != "" && custom_kobold_endpoint != default_a1111_base
				&& localsettings.saved_a1111_url == default_a1111_base
			) {
				//they are probably using the wrong base. let's try changing it.
				console.log("Trying to fix bad image endpoint, switch to kcpp...");
				fetch(custom_kobold_endpoint + a1111_models_endpoint)
					.then(x => x.json())
					.then(testmodels => {
						if (testmodels && testmodels.length > 0) {
							console.log("Switch to kcpp img endpoint.");
							localsettings.saved_a1111_url = custom_kobold_endpoint;
							connect_to_a1111(true);
						}
					}).catch((err) => {});
			}
			if (!silent) {
				msgbox(
					"A1111 Connect Error: " + error
						+ "\nPlease make sure KoboldCpp / Forge / A1111 is running and properly configured!\nIn your local install of Automatic1111 WebUi, modify webui-user.bat and add these flags to enable API access:\n\nset COMMANDLINE_ARGS= --api --listen --cors-allow-origins=*\n",
				);
			}
			a1111_is_connected = false;
		});
}

function connect_to_comfyui(silent = false) {
	console.log("Attempt ComfyUI Connection...");
	//establish initial connection to a1111 api
	fetch(localsettings.saved_comfy_url + comfy_models_endpoint)
		.then(x => x.json())
		.then(modelsdata => {
			if (modelsdata == null || modelsdata.length == 0) {
				msgbox(
					"Invalid data received or no models found. Is ComfyUI running at the url " + localsettings.saved_comfy_url
						+ " ?\n\nIt must be launched with the flags --listen --enable-cors-header '*' to enable API access",
				);
			} else {
				let current_loaded_model = modelsdata[0];
				//repopulate our model list
				let dropdown = document.getElementById("generate_images_comfy_model");
				let selectionhtml = ``;
				for (var i = 0; i < modelsdata.length; ++i) {
					selectionhtml += `<option value="` + modelsdata[i] + `" ` + (current_loaded_model == modelsdata[i] ? "selected" : "") + `>`
						+ modelsdata[i] + `</option>`;
				}
				dropdown.innerHTML = selectionhtml;
				comfyui_is_connected = true;
			}
		}).catch((error) => {
			if (!silent) {
				msgbox(
					"ComfyUI Connect Error: " + error + "\nPlease make sure ComfyUI is running at " + localsettings.saved_comfy_url
						+ " and properly configured!\n\nIt must be launched with the flags --listen --enable-cors-header '*' to enable API access\n",
				);
			}
			comfyui_is_connected = false;
		});
}

function uploadBase64ImgToComfy(base64Data, filename) {
	if (base64Data == null || base64Data == "") {
		return Promise.resolve(); //return instantly
	}
	let upload_endpoint = localsettings.saved_comfy_url + comfy_upload_endpoint;
	const binary = atob(base64Data);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	const blob = new Blob([bytes], { type: "image/jpeg" });
	const formData = new FormData();
	formData.append("image", blob, filename);
	formData.append("overwrite", 1);
	return fetch(`${upload_endpoint}`, {
		method: "POST",
		body: formData,
	}).then(response => {
		if (!response.ok) {
			throw new Error(`Upload failed with status ${response.status}`);
		}
		return response;
	});
}

function generate_comfy_image(req_payload, autoappend) {
	let splits = req_payload.prompt.split("###");
	let prompt = splits[0].trim();
	let negprompt = splits.length > 1 ? splits[1] : "";
	let comfyimg2imgname = "kcpp_img2img.jpg";

	let genimg_payload = {
		prompt: {
			"3": {
				class_type: "KSampler",
				inputs: {
					cfg: req_payload.params.cfg_scale,
					denoise: 1,
					latent_image: ["5", 0],
					model: ["4", 0],
					negative: ["7", 0],
					positive: ["6", 0],
					sampler_name: "euler",
					scheduler: "normal",
					seed: Math.floor(Math.random() * 99999999),
					steps: req_payload.params.steps,
				},
			},
			"4": {
				class_type: "CheckpointLoaderSimple",
				inputs: {
					ckpt_name: req_payload.models[0],
				},
			},
			"5": {
				class_type: "EmptyLatentImage",
				inputs: {
					batch_size: 1,
					height: req_payload.params.height,
					width: req_payload.params.width,
				},
			},
			"6": {
				class_type: "CLIPTextEncode",
				inputs: {
					clip: ["4", 1],
					text: prompt,
				},
			},
			"7": {
				class_type: "CLIPTextEncode",
				inputs: {
					clip: ["4", 1],
					text: negprompt,
				},
			},
			"8": {
				class_type: "VAEDecode",
				inputs: {
					samples: ["3", 0],
					vae: ["4", 2],
				},
			},
			"9": {
				class_type: "SaveImage",
				inputs: {
					filename_prefix: "kliteimg",
					images: ["8", 0],
				},
			},
		},
	};

	if (req_payload["source_image"]) { //override with img2img nodes
		genimg_payload["prompt"]["5"] = {
			class_type: "LoadImage",
			inputs: {
				image: comfyimg2imgname,
			},
		};
		genimg_payload["prompt"]["10"] = {
			class_type: "VAEEncode",
			inputs: {
				pixels: ["5", 0],
				vae: ["4", 2],
			},
		};
		genimg_payload["prompt"]["3"]["inputs"]["latent_image"] = ["10", 0];
		genimg_payload["prompt"]["3"]["inputs"]["denoise"] = req_payload["params"]["denoising_strength"];
	}

	let gen_endpoint = localsettings.saved_comfy_url + comfy_generate_endpoint;
	console.log(genimg_payload);
	let imgid = "Comfyimg" + (Math.floor(10000 + Math.random() * 90000)).toString();
	let nimgtag = "[<|p|" + imgid + "|p|>]";
	if (localsettings.img_newturn) {
		if (localsettings.opmode == 4) {
			nimgtag = wrap_newgen_instruct_format(nimgtag, false);
		} else if (localsettings.opmode == 3) {
			nimgtag = wrap_newgen_chat_format(nimgtag);
		}
	}
	if (autoappend) {
		gametext_arr.push(nimgtag);
	}
	image_db[imgid] = { done: false, queue: "Generating", result: "", prompt: prompt, poll_category: 2 };
	image_db[imgid].aspect = req_payload.params.width >= req_payload.params.height * 2
		? 5
		: (req_payload.params.height >= req_payload.params.width * 2
			? 4
			: (req_payload.params.width > req_payload.params.height ? 2 : (req_payload.params.width < req_payload.params.height ? 1 : 0)));
	image_db[imgid].imsource = 0; //0=generated,1=uploaded
	image_db[imgid].imrefid = "";

	uploadBase64ImgToComfy(req_payload["source_image"], comfyimg2imgname).then(() => {
		fetch(gen_endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(genimg_payload),
		})
			.then(x => x.json())
			.then(resp => {
				console.log(resp);
				if (resp.prompt_id) {
					image_db[imgid].imrefid = resp.prompt_id.toString();
				} else {
					console.log("Generation Error!");
					msgbox(
						"Image Generation Failed!\n\nPlease make sure ComfyUI is running at " + localsettings.saved_comfy_url
							+ " and properly configured!\n\nIt must be launched with the flag --listen --enable-cors-header '*' to enable API access\n",
					);
				}
			}).catch((error) => {
				console.log("Generation Error: " + error);
				msgbox(
					"Image Generation Failed!\n\nPlease make sure ComfyUI is running at " + localsettings.saved_comfy_url
						+ " and properly configured!\n\nIt must be launched with the flag --listen --enable-cors-header '*' to enable API access\n",
				);
			});
	}).catch((error) => {
		console.log("Upload Img2Img Error: " + error);
		msgbox(
			"Image Upload Failed!\n\nPlease make sure ComfyUI is running at " + localsettings.saved_comfy_url
				+ " and properly configured!\n\nIt must be launched with the flag --listen --enable-cors-header '*' to enable API access\n",
		);
	});
	return imgid;
}

function generate_a1111_image(req_payload, onImagesDone) {
	//split the prompt
	let splits = req_payload.prompt.split("###");
	let prompt = splits[0].trim();
	let negprompt = splits.length > 1 ? splits[1] : "";
	let parsedseed = Math.floor(Math.random() * 99999999);
	let tiling = false;

	//first, if we're using the wrong model, switch the model
	//now we added override settings, but still want switch model to prevent weights from constantly reloading
	let desired_model = req_payload.models[0];
	let a1111_t2i_payload = {
		prompt: prompt,
		seed: parsedseed,
		sampler_name: req_payload.params.sampler_name,
		batch_size: 1,
		n_iter: 1,
		steps: req_payload.params.steps,
		cfg_scale: req_payload.params.cfg_scale,
		width: req_payload.params.width,
		height: req_payload.params.height,
		negative_prompt: negprompt.trim(),
		do_not_save_samples: (localsettings.save_remote_images ? false : true), //no idea if these work, but just try
		do_not_save_grid: true,
		enable_hr: false,
		eta: 0,
		s_churn: 0,
		s_tmax: 0,
		s_tmin: 0,
		s_noise: 1,
		override_settings: {
			sd_model_checkpoint: desired_model,
			eta_noise_seed_delta: 0.0,
			CLIP_stop_at_last_layers: 1.0,
			ddim_discretize: "uniform",
			img2img_fix_steps: false,
			sd_hypernetwork: "None",
			inpainting_mask_weight: 1.0,
			initial_noise_multiplier: 1.0,
			comma_padding_backtrack: 20.0,
		},
	};

	let ep = a1111_txt2img_endpoint;
	if (req_payload.source_image && req_payload.source_image != "") {
		ep = a1111_img2img_endpoint;
		a1111_t2i_payload.init_images = [req_payload.source_image];
		a1111_t2i_payload.denoising_strength = req_payload.params.denoising_strength;
	}
	if (req_payload.params.clip_skip && req_payload.params.clip_skip > 0) {
		a1111_t2i_payload.clip_skip = req_payload.params.clip_skip;
	}

	if (localsettings.save_remote_images) {
		a1111_t2i_payload["save_images"] = true;
	}

	//remove all null fields
	a1111_t2i_payload = Object.fromEntries(Object.entries(a1111_t2i_payload).filter(([_, v]) => v != null));

	let gen_endpoint = localsettings.saved_a1111_url + ep;
	console.log(a1111_t2i_payload);
	fetch(gen_endpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(a1111_t2i_payload),
	})
		.then(x => x.json())
		.then(resp => {
			console.log(resp);
			if (resp.images && resp.images.length > 0) {
				onImagesDone(resp.images[0]);
			} else {
				console.log("Generation Error!");
				onImagesDone(null);
			}
		}).catch((error) => {
			console.log("Generation Error: " + error);
			onImagesDone(null);
		});
}

function set_a1111_endpoint() {
	inputBox(
		"Enter Local KoboldCpp / Forge / Automatic1111 API endpoint",
		"KoboldCpp / Forge / A1111 Endpoint Selection",
		localsettings.saved_a1111_url,
		"Input A1111 API URL",
		() => {
			let userinput = getInputBoxValue();
			userinput = userinput.trim();
			if (userinput != "" && userinput.slice(-1) == "/") {
				userinput = userinput.slice(0, -1);
			}
			if (userinput == "") {
				userinput = default_a1111_base;
			}
			if (userinput != null && userinput != "") {
				localsettings.saved_a1111_url = userinput.trim();
				connect_to_a1111(false);
			}
		},
		false,
	);
}

function set_comfy_endpoint() {
	inputBox("Enter ComfyUI API endpoint", "ComfyUI Endpoint Selection", localsettings.saved_comfy_url, "Input ComfyUI API URL", () => {
		let userinput = getInputBoxValue();
		userinput = userinput.trim();
		if (userinput != "" && userinput.slice(-1) == "/") {
			userinput = userinput.slice(0, -1);
		}
		if (userinput == "") {
			userinput = default_comfy_base;
		}
		if (userinput != null && userinput != "") {
			localsettings.saved_comfy_url = userinput.trim();
			connect_to_comfyui(false);
		}
	}, false);
}

function generate_pollinations_image(req_payload, autoappend) {
	let splits = req_payload.prompt.split("###");
	let prompt = splits[0].trim();
	let negprompt = splits.length > 1 ? splits[1] : "";

	const pollinations_params = new URLSearchParams({
		model: req_payload.models[0],
		seed: Math.floor(Math.random() * 99999999),
		width: req_payload.params.width,
		height: req_payload.params.height,
		nologo: true,
		private: true,
		referrer: "koboldai",
	});

	let gen_endpoint = `${pollinations_img_endpoint}/${encodeURIComponent(prompt)}?${pollinations_params.toString()}`;

	console.log(gen_endpoint);
	let imgid = "PollAIimg" + (Math.floor(10000 + Math.random() * 90000)).toString();
	let nimgtag = "[<|p|" + imgid + "|p|>]";
	if (localsettings.img_newturn) {
		if (localsettings.opmode == 4) {
			nimgtag = wrap_newgen_instruct_format(nimgtag, false);
		} else if (localsettings.opmode == 3) {
			nimgtag = wrap_newgen_chat_format(nimgtag);
		}
	}
	if (autoappend) {
		gametext_arr.push(nimgtag);
	}
	image_db[imgid] = { done: false, queue: "Generating", result: "", prompt: prompt, poll_category: 0 };
	image_db[imgid].aspect = req_payload.params.width >= req_payload.params.height * 2
		? 5
		: (req_payload.params.height >= req_payload.params.width * 2
			? 4
			: (req_payload.params.width > req_payload.params.height ? 2 : (req_payload.params.width < req_payload.params.height ? 1 : 0)));
	image_db[imgid].imsource = 0; //0=generated,1=uploaded
	image_db[imgid].imrefid = "";

	fetch(gen_endpoint, {
		method: "GET",
	})
		.then((response) => {
			return response.blob(); // Convert the response into a Blob
		})
		.then((finalimg) => {
			const reader = new FileReader();
			reader.onloadend = () => {
				let origImg = reader.result;
				let imgres = localsettings.img_allowhd ? (localsettings.img_aspect == 0 ? NO_HD_RES_PX : HD_RES_PX) : NO_HD_RES_PX;
				compressImage(
					origImg,
					(newDataUri) => {
						image_db[imgid].done = true;
						image_db[imgid].result = newDataUri;
					},
					false,
					imgres,
				);
			};
			reader.readAsDataURL(finalimg);
		}).catch((error) => {
			console.log("Generation Error: " + error);
			msgbox("Image Generation Failed!\n\nCould not generate image with Pollinations.ai, maybe you are rate limited. Try again later.\n");
		});
	return imgid;
}

function set_horde_key() {
	inputBox(
		"Enter AI Horde API Key.\n\nThe same key is used for image and text generation in AI Horde.",
		"AI Horde API Key",
		localsettings.my_api_key,
		"Input AI Horde API Key",
		() => {
			let userinput = getInputBoxValue();
			userinput = userinput.trim();
			if (userinput != null && userinput != "") {
				localsettings.my_api_key = userinput.trim();
			}
		},
		false,
		false,
		true,
	);
}

function set_dalle_key() {
	inputBox(
		"Enter DALL-E API Key.\n\nNote: DALL-E is known to rephrase and rewrite submitted image prompts before generating, for censorship purposes. There is nothing KoboldAI Lite can do about that. ",
		"DALL-E API Key",
		localsettings.saved_dalle_key,
		"Input DALL-E API Key",
		() => {
			let userinput = getInputBoxValue();
			userinput = userinput.trim();
			if (userinput != null && userinput != "") {
				localsettings.saved_dalle_key = userinput.trim();
			}
		},
		false,
		false,
		true,
	);
}
function set_dalle_url() {
	inputBox(
		"Enter DALL-E API URL.\n\nNote: DALL-E is known to rephrase and rewrite submitted image prompts before generating, for censorship purposes. There is nothing KoboldAI Lite can do about that. ",
		"DALL-E API URL",
		localsettings.saved_dalle_url,
		"Input DALL-E API URL",
		() => {
			let userinput = getInputBoxValue();
			userinput = userinput.trim();
			if (userinput != null && userinput != "") {
				localsettings.saved_dalle_url = userinput.trim();
			} else {
				localsettings.saved_dalle_url = default_oai_base + "/v1" + default_oai_image_endpoint;
			}
		},
		false,
	);
}
function set_dalle_model() {
	inputBox(
		"Enter DALL-E API Model Identifier.",
		"DALL-E API Model Identifier",
		localsettings.saved_dalle_model,
		"Input DALL-E Model Identifier",
		() => {
			let userinput = getInputBoxValue();
			userinput = userinput.trim();
			if (userinput != null && userinput != "") {
				localsettings.saved_dalle_model = userinput.trim();
			} else {
				localsettings.saved_dalle_model = default_dalle_model_name;
			}
		},
		false,
	);
}

function set_oai_tts_key() {
	inputBox(
		"Enter OpenAI Compatible TTS API Key",
		"OpenAI Compatible TTS API Key",
		localsettings.saved_oai_tts_key,
		"Input OpenAI Compatible TTS API Key",
		() => {
			let userinput = getInputBoxValue();
			userinput = userinput.trim();
			if (userinput != null && userinput != "") {
				localsettings.saved_oai_tts_key = userinput.trim();
			}
		},
		false,
		false,
		true,
	);
}
function set_oai_tts_url() {
	inputBox(
		"Enter OpenAI Compatible TTS API URL",
		"OpenAI Compatible TTS API URL",
		localsettings.saved_oai_tts_url,
		"Input OpenAI Compatible TTS API URL",
		() => {
			let userinput = getInputBoxValue();
			userinput = userinput.trim();
			if (userinput != null && userinput != "") {
				localsettings.saved_oai_tts_url = userinput.trim();
			} else {
				localsettings.saved_oai_tts_url = default_oai_base + "/v1" + default_oai_tts_endpoint;
			}
		},
		false,
	);
}

function set_oai_embd_key() {
	inputBox(
		"Enter OpenAI Compatible Embeddings API Key",
		"OpenAI Compatible Embeddings API Key",
		localsettings.saved_oai_embd_key,
		"Input OpenAI Compatible Embeddings API Key",
		() => {
			let userinput = getInputBoxValue();
			userinput = userinput.trim();
			if (userinput != null && userinput != "") {
				localsettings.saved_oai_embd_key = userinput.trim();
			}
		},
		false,
		false,
		true,
	);
}
function set_oai_embd_url() {
	inputBox(
		"Enter OpenAI Compatible TTS API URL",
		"OpenAI Compatible Embeddings API URL",
		localsettings.saved_oai_embd_url,
		"Input OpenAI Compatible Embeddings API URL",
		() => {
			let userinput = getInputBoxValue();
			userinput = userinput.trim();
			if (userinput != null && userinput != "") {
				localsettings.saved_oai_embd_url = userinput.trim();
			} else {
				localsettings.saved_oai_embd_url = default_oai_base + "/v1" + default_oai_embeddings_endpoint;
			}
		},
		false,
	);
}

function generate_dalle_image(req_payload, onImagesDone) {
	//split the prompt
	let splits = req_payload.prompt.split("###");
	let prompt = splits[0].trim();

	let dalle_payload = {
		model: localsettings.saved_dalle_model,
		prompt: prompt,
		n: 1,
		size: "1024x1024",
	};
	if (localsettings.saved_dalle_model != "gpt-image-1") {
		dalle_payload["response_format"] = "b64_json";
	} else {
		dalle_payload["quality"] = "medium";
	}

	//remove all null fields
	dalle_payload = Object.fromEntries(Object.entries(dalle_payload).filter(([_, v]) => v != null));

	let gen_endpoint = localsettings.saved_dalle_url;
	console.log(dalle_payload);

	fetch(gen_endpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: "Bearer " + localsettings.saved_dalle_key,
		},
		body: JSON.stringify(dalle_payload),
	})
		.then(x => x.json())
		.then(resp => {
			console.log(resp);
			if (resp.data && resp.data.length > 0) {
				onImagesDone(resp.data[0].b64_json, null);
			} else {
				console.log("Generation Error!");
				onImagesDone(null, JSON.stringify(resp));
			}
		}).catch((error) => {
			console.log("Generation Error: " + error);
			onImagesDone(null, null);
		});
}

function is_local_url(target_url) {
	let is_local = target_url.toLowerCase().includes("localhost")
		|| target_url.toLowerCase().includes("127.0.0.1")
		|| target_url.toLowerCase().includes("192.168.")
		|| target_url.toLowerCase().includes("10.0.0.")
		|| target_url.toLowerCase().includes("://10.0.")
		|| (target_url.toLowerCase().includes(".lan:") || target_url.toLowerCase().includes(".lan?") || target_url.toLowerCase().includes(".lan/")
			|| target_url.toLowerCase().endsWith(".lan"))
		|| (target_url.toLowerCase().includes(".local:") || target_url.toLowerCase().includes(".local?")
			|| target_url.toLowerCase().includes(".local/") || target_url.toLowerCase().endsWith(".local"))
		|| (target_url.toLowerCase().includes(".internal:") || target_url.toLowerCase().includes(".internal?")
			|| target_url.toLowerCase().includes(".internal/") || target_url.toLowerCase().endsWith(".internal"))
		|| !target_url.toLowerCase().includes("."); //hostname without dots cannot be wan accessible
	return is_local;
}
function is_browser_supports_sse() {
	return (self.TransformStream != null && self.TextDecoderStream != null && self.WritableStream != null);
}
function is_using_custom_ep() {
	return (custom_oai_key != "" || custom_kobold_endpoint != "" || custom_claude_key != "" || custom_gemini_key != "" || custom_cohere_key != "");
}
function is_using_kcpp_with_streaming() {
	return (custom_kobold_endpoint != "" && koboldcpp_version && koboldcpp_version != "" && compare_version_str(koboldcpp_version, "1.30") >= 0);
}
function is_using_kcpp_with_sse() //need 1.39 for multibyte fix
{
	return (is_browser_supports_sse() && custom_kobold_endpoint != "" && koboldcpp_version && koboldcpp_version != ""
		&& compare_version_str(koboldcpp_version, "1.40") >= 0);
}
function is_using_kcpp_with_mirostat() {
	return (custom_kobold_endpoint != "" && koboldcpp_version && koboldcpp_version != "" && compare_version_str(koboldcpp_version, "1.37") >= 0);
}
function is_using_kcpp_with_grammar() {
	return (custom_kobold_endpoint != "" && koboldcpp_version && koboldcpp_version != "" && compare_version_str(koboldcpp_version, "1.44") >= 0);
}
function is_using_kcpp_with_added_memory() {
	return (custom_kobold_endpoint != "" && koboldcpp_version && koboldcpp_version != "" && compare_version_str(koboldcpp_version, "1.49") >= 0);
}
function is_using_kcpp_with_llava() {
	return (custom_kobold_endpoint != "" && koboldcpp_version && koboldcpp_version != "" && compare_version_str(koboldcpp_version, "1.61") >= 0
		&& koboldcpp_has_vision);
}
function is_using_kcpp_with_whisper() {
	return (custom_kobold_endpoint != "" && koboldcpp_version && koboldcpp_version != "" && compare_version_str(koboldcpp_version, "1.66") >= 0
		&& koboldcpp_has_whisper);
}
function is_using_kcpp_with_dry() {
	return (custom_kobold_endpoint != "" && koboldcpp_version && koboldcpp_version != "" && compare_version_str(koboldcpp_version, "1.70") >= 0);
}
function is_using_kcpp_with_xtc() {
	return (custom_kobold_endpoint != "" && koboldcpp_version && koboldcpp_version != "" && compare_version_str(koboldcpp_version, "1.74") >= 0);
}
function is_using_kcpp_with_multiplayer() {
	return (custom_kobold_endpoint != "" && koboldcpp_version && koboldcpp_version != "" && compare_version_str(koboldcpp_version, "1.78") >= 0
		&& koboldcpp_has_multiplayer);
}
function is_using_kcpp_with_savedatafile() {
	return (custom_kobold_endpoint != "" && koboldcpp_version && koboldcpp_version != "" && compare_version_str(koboldcpp_version, "1.84") >= 0
		&& koboldcpp_has_savedatafile);
}
function is_using_kcpp_with_websearch() {
	return (custom_kobold_endpoint != "" && koboldcpp_version && koboldcpp_version != "" && compare_version_str(koboldcpp_version, "1.80") >= 0
		&& koboldcpp_has_websearch);
}
function is_using_kcpp_with_tts() {
	return (custom_kobold_endpoint != "" && koboldcpp_version && koboldcpp_version != "" && compare_version_str(koboldcpp_version, "1.81") >= 0
		&& koboldcpp_has_tts);
}
function is_using_kcpp_with_admin() {
	return (custom_kobold_endpoint != "" && koboldcpp_version && koboldcpp_version != "" && compare_version_str(koboldcpp_version, "1.83") >= 0
		&& koboldcpp_admin_type > 0);
}
function is_using_kcpp_with_autotags() {
	return (custom_kobold_endpoint != "" && koboldcpp_version && koboldcpp_version != "" && compare_version_str(koboldcpp_version, "1.88") >= 0);
}
function is_using_kcpp_with_guidance() {
	return (custom_kobold_endpoint != "" && koboldcpp_version && koboldcpp_version != "" && compare_version_str(koboldcpp_version, "1.90") >= 0
		&& koboldcpp_has_guidance);
}
function is_using_web_lite() {
	return (window.location.hostname.includes("koboldai.net") || window.location.hostname.includes("lostruins.github.io"));
}

function is_using_kcpp_with_embeddings() {
	return (custom_kobold_endpoint != "" && koboldcpp_version && koboldcpp_version != "" && compare_version_str(koboldcpp_version, "1.84") >= 0
		&& koboldcpp_has_embeddings);
}

function determine_if_ban_eos(input_was_empty) {
	if (localsettings.eos_ban_mode == 3) {
		return false;
	}

	if (localsettings.eos_ban_mode == 0) {
		if (localsettings.opmode == 1) {
			return true; //story mode always ban
		} else if (localsettings.opmode == 3 && !localsettings.allow_continue_chat) {
			return false; //chat mode always unban unless cont allowed
		} else if (!input_was_empty) { //if user input is not empty, ALWAYS unban EOS.
			return false;
		} else {
			return last_reply_was_empty;
		}
	} else {
		return (localsettings.eos_ban_mode == 2 ? true : false);
	}
}

//shared stories
function share_story_button() {
	document.getElementById("choosesharecontainer").classList.remove("hidden");
}
function import_share_story() {
	document.getElementById("choosesharecontainer").classList.add("hidden");
	inputBox(
		"Paste shared TextData to Import it.\n",
		"Import Story from TextData",
		"",
		"[Paste TextData Here]",
		() => {
			let userinput = getInputBoxValue().trim();
			if (userinput != "") {
				import_compressed_story(userinput, false);
			}
		},
		false,
		true,
	);
}
function export_share_story(sharetype) { //type 0=data, 1=url, 2=plaintext
	let cstoryjson = "";

	document.getElementById("sharecontainer").classList.remove("hidden");
	document.getElementById("shareastext").classList.add("hidden");
	document.getElementById("shareasurl").classList.add("hidden");

	if (sharetype == 0) { //base64 data
		document.getElementById("shareastext").classList.remove("hidden");
		cstoryjson = generate_compressed_story(localsettings.save_images, localsettings.export_settings, localsettings.export_settings);
		console.log("Export Len: " + cstoryjson.length);
		document.getElementById("sharecontainertitle").innerText = "Share Story as TextData";
		document.getElementById("sharestorytext").innerHTML = "<p>" + cstoryjson + "</p>";
	} else if (sharetype == 1) { //url share
		document.getElementById("shareasurl").classList.remove("hidden");
		document.getElementById("sharecontainertitle").innerText = "Share Story as URL";
	} else {
		document.getElementById("shareastext").classList.remove("hidden");
		cstoryjson = share_plaintext();
		cstoryjson = replaceAll(cstoryjson, "\n", "<br>", false);
		console.log("Export Len: " + cstoryjson.length);
		document.getElementById("sharecontainertitle").innerText = "Share Story as Plaintext";
		document.getElementById("sharestorytext").innerHTML = "<p>" + cstoryjson + "</p>";
	}
	document.getElementById("choosesharecontainer").classList.add("hidden");
}
function copy_shared_text() {
	var copyText = document.getElementById("sharestorytext");

	// Copy the text inside the text field
	copyToClipboard(copyText.innerText);

	// Select the text field
	select_element_contents(copyText);
}
function upload_to_dpaste() {
	let serverurl = document.getElementById("dpaste_server_url").value;
	if (serverurl == "") {
		let cstoryjsonsmall = generate_compressed_story(false, localsettings.export_settings, false);
		document.getElementById("shareasurl").classList.add("hidden");
		document.getElementById("shareastext").classList.remove("hidden");
		let fullurl = "https://lite.koboldai.net/?s=" + cstoryjsonsmall;
		document.getElementById("sharestorytext").innerHTML = '<a href="' + fullurl + '">' + fullurl + "</a>";
		return;
	}
	let cstoryjson = generate_compressed_story(localsettings.save_images, localsettings.export_settings, localsettings.export_settings);

	msgboxYesNo("Really upload current story? This action cannot be undone.", "Confirm Upload Story", () => {
		let expiry = document.getElementById("dpaste_duration").value;
		console.log("Export Len: " + cstoryjson.length);
		const params = new URLSearchParams();
		params.append("content", cstoryjson);
		params.append("expires", expiry);
		fetch(serverurl, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: params.toString(),
		})
			.then(x => {
				if (x.ok) {
					return x.text();
				} else {
					throw new Error("Error uploading dpaste: " + (x.statusText));
					return null;
				}
			})
			.then((text) => {
				let pasteurl = replaceAll(text, '"', "");
				if (dpaste_submit_endpoint == serverurl) {
					pasteurl = pasteurl.split("/");
					pasteurl = pasteurl[pasteurl.length - 1];
				}
				let fullurl = "https://lite.koboldai.net/?dp=" + pasteurl;
				document.getElementById("shareasurl").classList.add("hidden");
				document.getElementById("shareastext").classList.remove("hidden");
				document.getElementById("sharestorytext").innerHTML = '<a href="' + fullurl + '">' + fullurl + "</a>";
			})
			.catch((error) => {
				msgbox(`Unable to upload story: ${error}`);
				console.error("Error:", error);
			});
	}, () => {});
}

function generate_base_storyobj() {
	//if we have no savefile, this generates a very simple one (old format)
	var gs = {
		gamestarted: true,
		prompt: "",
		memory: "",
		authorsnote: "",
		anotetemplate: "",
		actions: [],
		actions_metadata: {},
		worldinfo: [],
		wifolders_d: {},
		wifolders_l: [],
	};
	return gs;
}

function load_bgimg_button() {
	document.getElementById("loadbgimg").click();
}
function load_bg_img(event) {
	let input = event.target;
	if (input.files.length > 0) {
		let selectedImg = null;
		selectedImg = input.files[0];
		const objectURL = URL.createObjectURL(selectedImg);
		compressImage(
			objectURL,
			(compressedImageURI, aspectratio) => {
				selectedImg = `url('${compressedImageURI}')`;
				document.body.style.backgroundImage = selectedImg;
				document.getElementById("gamescreen").classList.add("translucentbg");
				document.getElementById("enhancedchatinterface").classList.add("transparentbg");
				document.getElementById("enhancedchatinterface_inner").classList.add("transparentbg");
				indexeddb_save("bgimg", compressedImageURI);
			},
			false,
			1024,
			0.5,
		);
	}
}
function clear_bg_img() {
	document.body.style.backgroundImage = "none";
	document.getElementById("gamescreen").classList.remove("translucentbg");
	document.getElementById("enhancedchatinterface").classList.remove("transparentbg");
	document.getElementById("enhancedchatinterface_inner").classList.remove("transparentbg");
	indexeddb_save("bgimg", "");
}

function load_file_button() {
	document.getElementById("loadfileinput").click();
}

var tempfileurl = null;
var tempfileobj = null;
var newfilename = "";
function savenowfn() {
	var a = document.getElementById("tempfile");
	var file = new Blob([tempfileobj], { type: "application/json" });
	console.log("Normal save handling");
	if (tempfileurl) {
		window.URL.revokeObjectURL(tempfileurl);
	}
	tempfileurl = window.URL.createObjectURL(file);
	a.href = tempfileurl;
	a.target = "_blank";
	a.download = newfilename;
	setTimeout(function() {
		a.click();
	}, 20);
}
function promptUserForLocalFile(fileCallback, allowedTypes = "") {
	//allowedTypes should be a string, because then you can accept MIME types like audio/*
	let picker = document.getElementById("tempfilepicker");
	picker.accept = allowedTypes;
	picker.onchange = function(event) {
		let input = event.target;
		if (input.files.length > 0) {
			let file = input.files[0];
			let fileNameWithExt = file.name;
			let extPos = fileNameWithExt.lastIndexOf(".");
			let fileName = fileNameWithExt.substring(0, extPos);
			let ext = fileNameWithExt.substring(extPos);

			let readerText = new FileReader();
			let readerDataURL = new FileReader();
			readerText.onload = function() {
				let plaintext = readerText.result; //basic plaintext
				readerDataURL.onload = function() {
					let content = readerDataURL.result; //raw data
					fileCallback({ file, fileName, ext, content, plaintext });
				};
				readerDataURL.readAsDataURL(file);
			};
			readerText.readAsText(file); //first, attempt read as text, then read as data
		}
		picker.value = "";
	};
	picker.click();
}
function saveFileGeneric(fileName, fileContent, mimeType) {
	window.URL = window.URL || window.webkitURL;
	var userAgent = window.navigator.userAgent;
	tempfileobj = fileContent;
	newfilename = fileName;

	if (userAgent.match(/AppleWebKit/) && (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i))) {
		let ststr = fileContent;
		var file = new Blob([ststr], { type: "application/octet-stream" });
		var file2 = new Blob([ststr], { type: mimeType });
		console.log("Special save handling for iphones");
		// iPad or iPhone needs an extra download
		var reader = new FileReader();
		var reader2 = new FileReader();
		let datblob = window.URL.createObjectURL(file2);
		reader.onload = function(e) {
			reader2.readAsDataURL(file2);
			reader2.onload = function(e) {
				msgbox(
					`<button type="button" class="btn btn-primary" id="ios_save" onclick="savenowfn()">Click to Save</button>
				<br><h5>Apple devices are known to have issues saving. If the above button does not work, try opening or right-click / long press one of the below links, and select (Save As)</h5>
				<h4><li><a href="${reader.result}" class="color_blueurl" target="_blank" download="${fileName}">Raw File Data</a></li>
				<li><a href="${reader2.result}" class="color_blueurl" target="_blank" download="${fileName}">JSON File Data</a></li>
				<li><a href="${datblob}" class="color_blueurl" download="${fileName}">JSON URL Blob</a></li></h4>`,
					"Save File",
					true,
				);
			};
		};
		reader.readAsDataURL(file);
	} else {
		savenowfn();
	}
}
function save_file_button(save_file_obj = null) //if null, generate new savefile, otherwise use provided
{
	warn_unsaved = false;
	const save_file = function() {
		if (!save_file_obj) {
			save_file_obj = generate_savefile(localsettings.save_images, localsettings.export_settings, localsettings.export_settings);
		}
		saveFileGeneric(last_known_filename, JSON.stringify(save_file_obj), "application/json");
	};

	if (localsettings.prompt_for_savename) {
		inputBox("Enter a Filename", "Save File", last_known_filename, "Input Filename", () => {
			let userinput = getInputBoxValue();
			if (userinput != null && userinput.trim() != "") {
				last_known_filename = userinput.trim();
				if (!last_known_filename.toLowerCase().includes(".json")) {
					last_known_filename += ".json";
				}
				save_file();
			}
		}, false);
	} else {
		save_file();
	}
}

function share_plaintext() //takes the current loaded story and generates a new plaintext file
{
	let story = concat_gametext(true, "", "", "", false);
	if (current_memory != "") {
		story = current_memory + "\n" + story;
	}
	return story;
}

function generate_savefile(save_images, export_settings, export_aesthetic_settings) //takes the current loaded story and generates a new savefile json object
{
	let new_save_storyobj = generate_base_storyobj();

	let export_arr = gametext_arr;
	let export_hashes = {};
	if (!save_images) {
		export_arr = [];
		for (let i = 0; i < gametext_arr.length; ++i) {
			export_arr.push(gametext_arr[i].replace(/\[<\|p\|.+?\|p\|>\]/g, "").replace(/\[<\|d\|.+?\|d\|>\]/g, ""));
		}
	} else {
		//bake used image metas into savefile
		for (let i = 0; i < gametext_arr.length; ++i) {
			let matches = gametext_arr[i].match(/\[<\|d\|.+?\|d\|>\]/g);
			for (let m in matches) {
				let inner = matches[m].substring(5, matches[m].length - 5);
				let imghash = cyrb_hash(inner);
				if (completed_imgs_meta[imghash] != null) {
					export_hashes[imghash] = completed_imgs_meta[imghash];
				}
			}
		}
		new_save_storyobj.completed_imgs_meta = export_hashes;
	}

	if (export_arr.length > 0) {
		new_save_storyobj.prompt = export_arr[0];
	}
	for (var i = 1; i < export_arr.length; ++i) {
		new_save_storyobj.actions.push(export_arr[i]);
		let key = (i - 1).toString();
		new_save_storyobj.actions_metadata[key] = {
			"Selected Text": export_arr[i],
			"Alternative Text": [],
		};
	}
	new_save_storyobj.anotetemplate = current_anotetemplate;
	new_save_storyobj.authorsnote = current_anote;
	new_save_storyobj.memory = current_memory;
	new_save_storyobj.worldinfo = current_wi;

	//extra unofficial fields for the story
	new_save_storyobj.anotestr = anote_strength;
	new_save_storyobj.wisearchdepth = wi_searchdepth;
	new_save_storyobj.wiinsertlocation = wi_insertlocation;
	new_save_storyobj.personal_notes = personal_notes;
	new_save_storyobj.documentdb_provider = documentdb_provider;
	new_save_storyobj.documentdb_searchhistory = documentdb_searchhistory;
	new_save_storyobj.documentdb_numresults = documentdb_numresults;
	new_save_storyobj.documentdb_searchrange = documentdb_searchrange;
	new_save_storyobj.documentdb_chunksize = documentdb_chunksize;
	new_save_storyobj.documentdb_data = documentdb_data;

	if (export_settings) {
		new_save_storyobj.savedsettings = JSON.parse(JSON.stringify(localsettings));
		//redact some values
		new_save_storyobj.savedsettings.my_api_key = "0000000000";
		new_save_storyobj.savedsettings.saved_oai_key = "";
		new_save_storyobj.savedsettings.saved_dalle_key = "";
		new_save_storyobj.savedsettings.saved_dalle_url = "";
		new_save_storyobj.savedsettings.saved_oai_addr = "";
		new_save_storyobj.savedsettings.saved_claude_key = "";
		new_save_storyobj.savedsettings.saved_claude_addr = "";
		new_save_storyobj.savedsettings.saved_kai_addr = "";
		new_save_storyobj.savedsettings.saved_kai_key = "";
		new_save_storyobj.savedsettings.saved_openrouter_key = "";
		new_save_storyobj.savedsettings.saved_mistralai_key = "";
		new_save_storyobj.savedsettings.saved_featherless_key = "";
		new_save_storyobj.savedsettings.saved_grok_key = "";
		new_save_storyobj.savedsettings.saved_palm_key = "";
		new_save_storyobj.savedsettings.saved_cohere_key = "";
		new_save_storyobj.savedsettings.saved_pollinations_key = "";

		new_save_storyobj.savedsettings.modelhashes = [];

		if (export_aesthetic_settings) {
			new_save_storyobj.savedaestheticsettings = JSON.parse(JSON.stringify(aestheticInstructUISettings, null, 2));
			for (var i = 0; i < selected_models.length; ++i) {
				new_save_storyobj.savedsettings.modelhashes.push(cyrb_hash(selected_models[i].name));
			}
		}
	} else {
		new_save_storyobj.savedsettings = null;
		new_save_storyobj.savedaestheticsettings = null;
	}

	return new_save_storyobj;
}

function load_file(event) {
	let input = event.target;

	if (input.files.length > 0) {
		var selectedFile = input.files[0];

		load_selected_file(selectedFile);

		document.getElementById("loadfileinput").value = "";
	} else {
		console.log("No file to load");
	}
}

//attempt to load a file from disk. could be any format, even images
function load_selected_file(selectedFile) {
	var selectedFilename = "";
	if (selectedFile) {
		selectedFilename = selectedFile.name;
	}

	let reader = new FileReader();
	reader.onload = function() {
		let text = reader.result;
		console.log("Load file: " + text);
		try {
			let new_loaded_storyobj = JSON.parse(text);
			//we don't want to fiddle with the file as its very complex. only handle the parts we are interested in, and just leave the rest untouched.
			if (is_kai_json(new_loaded_storyobj) && !new_loaded_storyobj.scenarioVersion) {
				//quick sanity check. if prompt does not exist, this is not a KAI save.
				kai_json_load(new_loaded_storyobj, false);
				if (selectedFilename && selectedFilename != "") {
					last_known_filename = selectedFilename;
				}
			} else {
				//check for tavernai fields
				let has_tav_wi_check = has_tavern_wi_check(new_loaded_storyobj);
				if (
					!new_loaded_storyobj.scenarioVersion && (new_loaded_storyobj.name != null || new_loaded_storyobj.description != null
						|| new_loaded_storyobj.personality != null
						|| (new_loaded_storyobj.spec == "chara_card_v2" || new_loaded_storyobj.spec == "chara_card_v3") || has_tav_wi_check)
				) {
					load_tavern_obj(new_loaded_storyobj);
				} else if (new_loaded_storyobj.char_name != null || new_loaded_storyobj.char_persona != null) {
					//check for ooba text generation fields (character)
					load_ooba_obj(new_loaded_storyobj);
				} else if (new_loaded_storyobj.md && new_loaded_storyobj.savedsettings) { //add some compat loading for sharefiles
					kai_json_load(new_loaded_storyobj, false);
				} else if (new_loaded_storyobj.scenarioVersion > 1 && new_loaded_storyobj.scenarioVersion < 10) {
					nai_json_load(new_loaded_storyobj);
				} else if (new_loaded_storyobj.lorebookVersion > 1 && new_loaded_storyobj.lorebookVersion < 10) {
					current_wi = load_nai_wi(new_loaded_storyobj);
				} else if (
					new_loaded_storyobj.length >= 1 && new_loaded_storyobj[0].keys != "" && new_loaded_storyobj[0].value != ""
					&& (new_loaded_storyobj[0].useForCharacterCreation === true || new_loaded_storyobj[0].useForCharacterCreation === false)
				) {
					current_wi = load_aid_wi(new_loaded_storyobj);
				} else {
					msgbox("Could not load selected json file. Does not appear to be a KoboldAI story or compatible format.");
				}
			}
		} catch (e) {
			console.log(e);

			//attempt to parse it as a png file
			function handlePngLoadDone(img) {
				const data = pngfr.result;
				const arr = new Uint8Array(data);

				function setImgAsAvatar(data) {
					compressImage(
						data,
						(compressedImageURI, aspectratio) => {
							aestheticInstructUISettings.AI_portrait = compressedImageURI;
							document.getElementById("portrait_ratio_AI").value = aspectratio.toFixed(2);
							refreshAestheticPreview(true);
							render_gametext();
						},
						true,
						AVATAR_PX,
					);
				}

				// 1. Try Tavern PNG
				let result = convertTavernPng(arr);
				if (result) {
					load_tavern_obj(result);
					setImgAsAvatar(data);
					return;
				}

				// 2. Try Tavern EXIF
				result = getTavernExifJSON(arr);
				if (result) {
					load_tavern_obj(result);
					setImgAsAvatar(data);
					return;
				}

				// 3. Try Risu V3
				result = extractRisuData(arr);
				if (result) {
					load_tavern_obj(result);
					setImgAsAvatar(data);
					return;
				}

				// 4. Try KAISTORY
				try {
					result = UnzipKAISTORYFile(arr);
					if (result) {
						kai_json_load(result, false);
						return;
					}
				} catch (error) {
					console.log("Unzip failed: " + error);
				}

				// 5. Fallback to plaintext if .txt
				if (selectedFilename.endsWith(".txt")) {
					msgboxYesNo(
						'Could not load selected file!<br><span class="color_red">It appears to be invalid or corrupted!</span><br><br>Do you still want to import it as plaintext?',
						"Loading Failed",
						() => {
							restart_new_game(false);
							gametext_arr.push(text);
							render_gametext(true);
							sync_multiplayer(true);
							update_for_sidepanel();
						},
						null,
						true,
					);
				} else {
					msgbox("Could not load selected file. Is it valid?");
				}
			}

			const pngfr = new FileReader();
			pngfr.onload = handlePngLoadDone;
			pngfr.readAsArrayBuffer(selectedFile);
		}
	};
	reader.readAsText(selectedFile);
}

function safe_to_overwrite() {
	return (gametext_arr.length == 0 && current_memory == "" && current_anote == "" && current_wi.length == 0 && redo_arr.length == 0);
}

function is_kai_json(obj) {
	let is_kai = !(obj.prompt == null) || obj.savedsettings != null;
	return is_kai;
}

function kai_json_load(storyobj, force_load_settings, ignore_multiplayer_sync) {
	//either show popup or just proceed to load
	handle_advload_popup(localsettings.show_advanced_load && !force_load_settings, () => {
		let old_gametext_arr = gametext_arr;
		let old_current_anote = current_anote;
		let old_current_anotetemplate = current_anotetemplate;
		let old_current_memory = current_memory;
		let old_current_wi = current_wi;
		let old_notes = personal_notes;

		let old_extrastopseq = localsettings.extrastopseq;
		let old_regexreplace_data = localsettings.regexreplace_data;
		let old_tokenbans = localsettings.tokenbans;
		let old_placeholder_tags_data = localsettings.placeholder_tags_data;
		let old_logitbiasdict = localsettings.logitbiasdict;
		let old_thinking_pattern = localsettings.thinking_pattern;
		let old_thinking_action = localsettings.thinking_action;
		let old_start_thinking_tag = localsettings.start_thinking_tag;
		let old_stop_thinking_tag = localsettings.stop_thinking_tag;
		let old_think_injected = localsettings.think_injected;
		let old_strip_thinking_mode = localsettings.strip_thinking_mode;

		//determine if oldui file or newui file format
		restart_new_game(false);

		let is_oldui = storyobj.file_version == null;
		let is_sharefile = !storyobj.actions
			&& (storyobj.ga != "" || storyobj.cm != "" || (storyobj.cwi && storyobj.cwi.length > 0) || storyobj.ess != "");
		console.log("Is oldui: " + is_oldui + ", is sharefile: " + is_sharefile);

		if (is_sharefile) {
			//handle old shareformat
			gametext_arr = storyobj.ga;
			if (gametext_arr == null) {
				gametext_arr = [];
			}
			if (storyobj.ca && storyobj.ca != "") {
				current_anote = storyobj.ca;
				current_anotetemplate = storyobj.ct;
			}
			if (storyobj.cm && storyobj.cm != "") {
				current_memory = storyobj.cm;
			}
			if (storyobj.cwi && storyobj.cwi.length > 0) {
				current_wi = storyobj.cwi;
			}
			if (storyobj.ess && storyobj.ess != "") {
				localsettings.extrastopseq = storyobj.ess;
			}
		} else if (is_oldui) {
			//v1 load
			if (storyobj.prompt != "") {
				gametext_arr.push(storyobj.prompt);
			}
			for (var i = 0; i < storyobj.actions.length; ++i) {
				gametext_arr.push(storyobj.actions[i]);
			}
			if (storyobj.anotetemplate) {
				current_anotetemplate = storyobj.anotetemplate;
			}
			if (storyobj.authorsnote) {
				current_anote = storyobj.authorsnote;
			}
			if (storyobj.memory) {
				current_memory = storyobj.memory;
			}
			if (storyobj.worldinfo) {
				current_wi = storyobj.worldinfo;
			}
			if (storyobj.anotestr) {
				anote_strength = storyobj.anotestr;
			}
			if (storyobj.wisearchdepth) {
				wi_searchdepth = storyobj.wisearchdepth;
			}
			if (storyobj.wiinsertlocation) {
				wi_insertlocation = storyobj.wiinsertlocation;
			}
			if (storyobj.welcome) {
				welcome = storyobj.welcome;
			}
			if (storyobj.personal_notes) {
				personal_notes = storyobj.personal_notes;
			}
			if (storyobj.documentdb_provider) {
				documentdb_provider = storyobj.documentdb_provider;
			}
			if (storyobj.documentdb_searchhistory) {
				documentdb_searchhistory = storyobj.documentdb_searchhistory;
			}
			if (storyobj.documentdb_numresults) {
				documentdb_numresults = storyobj.documentdb_numresults;
			}
			if (storyobj.documentdb_searchrange) {
				documentdb_searchrange = storyobj.documentdb_searchrange;
			}
			if (storyobj.documentdb_chunksize) {
				documentdb_chunksize = storyobj.documentdb_chunksize;
			}
			if (storyobj.documentdb_data) {
				documentdb_data = storyobj.documentdb_data;
			}

			// adapting legacy fields - these are all now moved to SETTINGS
			if (storyobj.extrastopseq) {
				localsettings.extrastopseq = storyobj.extrastopseq;
			}
			if (storyobj.tokenbans) {
				localsettings.tokenbans = storyobj.tokenbans;
			}
			if (storyobj.logitbiasdict) {
				localsettings.logitbiasdict = storyobj.logitbiasdict;
			}
			if (storyobj.regexreplace_data) {
				localsettings.regexreplace_data = storyobj.regexreplace_data;
			}
			if (storyobj.placeholder_tags_data) {
				localsettings.placeholder_tags_data = storyobj.placeholder_tags_data;
			}
			if (storyobj.websearch_enabled) {
				localsettings.websearch_enabled = storyobj.websearch_enabled;
			}
			if (storyobj.websearch_multipass) {
				localsettings.websearch_multipass = storyobj.websearch_multipass;
			}
			if (storyobj.websearch_template) {
				localsettings.websearch_template = storyobj.websearch_template;
			}
			if (storyobj.thinking_pattern) {
				localsettings.thinking_pattern = storyobj.thinking_pattern;
			}
			if (storyobj.thinking_action) {
				localsettings.thinking_action = storyobj.thinking_action;
			}
			if (storyobj.force_thinking_tag) {
				localsettings.think_injected = storyobj.force_thinking_tag ? 1 : 0;
			}
			if (storyobj.start_thinking_tag) {
				localsettings.start_thinking_tag = storyobj.start_thinking_tag;
			}
		} else {
			//v2 load
			if (storyobj.prompt != "") {
				gametext_arr.push(storyobj.prompt);
			}
			for (var key in storyobj.actions.actions) {
				var itm = storyobj.actions.actions[key];
				gametext_arr.push(itm["Selected Text"]);
			}
			if (storyobj.authornotetemplate) {
				current_anotetemplate = storyobj.authornotetemplate;
			}
			if (storyobj.authornote) {
				current_anote = storyobj.authornote;
			}
			if (storyobj.memory) {
				current_memory = storyobj.memory;
			}
			if (storyobj.worldinfo_v2 != null && storyobj.worldinfo_v2.entries != null) {
				for (var key in storyobj.worldinfo_v2.entries) {
					var itm = storyobj.worldinfo_v2.entries[key];
					if (itm.key.length > 0 && itm.content != null) {
						let nwi = {
							key: itm.key[0],
							keysecondary: (itm.keysecondary.length > 0 ? itm.keysecondary[0] : ""),
							keyanti: (itm.keyanti && itm.keyanti.length > 0 ? itm.keyanti[0] : ""),
							content: itm.content,
							comment: itm.comment,
							folder: null,
							selective: itm.selective,
							constant: itm.constant,
							probability: 100,
							wigroup: "",
							widisabled: false,
						};
						current_wi.push(nwi);
					}
				}
			}
		}

		const import_settings = function(loadmainstory, loadmemanote, loadworldinfo, loadstopseq, loadgensettings, loadaessettings) {
			if (!loadmainstory) {
				gametext_arr = old_gametext_arr;
			}
			if (!loadmemanote) {
				current_anote = old_current_anote;
				current_anotetemplate = old_current_anotetemplate;
				current_memory = old_current_memory;
				personal_notes = old_notes;
			}
			if (!loadworldinfo) {
				current_wi = old_current_wi;
			}

			if (storyobj.savedsettings && storyobj.savedsettings != "") {
				let tmpapikey1 = localsettings.my_api_key;
				let tmp_oai1 = localsettings.saved_oai_key;
				let tmp_oai2 = localsettings.saved_oai_addr;
				let tmp_oai3 = localsettings.saved_dalle_key;
				let tmp_oai4 = localsettings.saved_dalle_url;
				let tmp_oai5 = localsettings.saved_oai_tts_key;
				let tmp_oai6 = localsettings.saved_oai_tts_url;
				let tmp_oai7 = localsettings.saved_oai_embd_key;
				let tmp_oai8 = localsettings.saved_oai_embd_url;
				let tmp_or1 = localsettings.saved_openrouter_key;
				let tmp_mai = localsettings.saved_mistralai_key;
				let tmp_fai = localsettings.saved_featherless_key;
				let tmp_pol = localsettings.saved_pollinations_key;
				let tmp_grok = localsettings.saved_grok_key;
				let tmp_claude1 = localsettings.saved_claude_key;
				let tmp_claude2 = localsettings.saved_claude_addr;
				let tmp_palm1 = localsettings.saved_palm_key;
				let tmp_cohere1 = localsettings.saved_cohere_key;
				let tmp_kai = localsettings.saved_kai_addr;
				let tmp_kai2 = localsettings.saved_kai_key;
				let tmp_a1111 = localsettings.saved_a1111_url;
				let tmp_comfy = localsettings.saved_comfy_url;
				let tmp_xtts = localsettings.saved_xtts_url;
				let tmp_imggen = localsettings.generate_images_mode;

				if (loadgensettings) {
					import_props_into_object(localsettings, storyobj.savedsettings);
					//backwards compat support for newlines
					if (
						localsettings.instruct_has_newlines == true
						|| (storyobj.savedsettings != null && storyobj.savedsettings.instruct_has_newlines == null
							&& storyobj.savedsettings.instruct_has_markdown == null)
					) {
						localsettings.instruct_has_newlines = false;
						if (!localsettings.instruct_starttag.includes("\\n")) {
							localsettings.instruct_starttag = "\\n" + localsettings.instruct_starttag + "\\n";
						}
						if (!localsettings.instruct_endtag.includes("\\n")) {
							localsettings.instruct_endtag = "\\n" + localsettings.instruct_endtag + "\\n";
						}
					}
					//old versions dont have this flag
					if (localsettings.entersubmit === true || localsettings.entersubmit === false) {
						document.getElementById("entersubmit").checked = localsettings.entersubmit;
					}
				}
				if (!loadstopseq) {
					localsettings.extrastopseq = old_extrastopseq;
					localsettings.regexreplace_data = old_regexreplace_data;
					localsettings.tokenbans = old_tokenbans;
					localsettings.placeholder_tags_data = old_placeholder_tags_data;
					localsettings.logitbiasdict = old_logitbiasdict;
					localsettings.thinking_pattern = old_thinking_pattern;
					localsettings.thinking_action = old_thinking_action;
					localsettings.start_thinking_tag = old_start_thinking_tag;
					localsettings.stop_thinking_tag = old_stop_thinking_tag;
					localsettings.think_injected = old_think_injected;
					localsettings.strip_thinking_mode = old_strip_thinking_mode;
				}

				localsettings.my_api_key = tmpapikey1;
				localsettings.saved_oai_key = tmp_oai1;
				localsettings.saved_oai_addr = tmp_oai2;
				localsettings.saved_dalle_key = tmp_oai3;
				localsettings.saved_dalle_url = tmp_oai4;
				localsettings.saved_oai_tts_key = tmp_oai5;
				localsettings.saved_oai_tts_url = tmp_oai6;
				localsettings.saved_oai_embd_key = tmp_oai7;
				localsettings.saved_oai_embd_url = tmp_oai8;
				localsettings.saved_openrouter_key = tmp_or1;
				localsettings.saved_mistralai_key = tmp_mai;
				localsettings.saved_featherless_key = tmp_fai;
				localsettings.saved_pollinations_key = tmp_pol;
				localsettings.saved_grok_key = tmp_grok;
				localsettings.saved_claude_key = tmp_claude1;
				localsettings.saved_claude_addr = tmp_claude2;
				localsettings.saved_palm_key = tmp_palm1;
				localsettings.saved_cohere_key = tmp_cohere1;
				localsettings.saved_kai_addr = tmp_kai;
				localsettings.saved_kai_key = tmp_kai2;
				localsettings.saved_a1111_url = tmp_a1111;
				localsettings.saved_comfy_url = tmp_comfy;
				localsettings.saved_xtts_url = tmp_xtts;
				localsettings.generate_images_mode = tmp_imggen;

				if (loadaessettings) {
					if (storyobj.savedaestheticsettings && storyobj.savedaestheticsettings != "") {
						import_props_into_object(aestheticInstructUISettings, storyobj.savedaestheticsettings);
					}
				}
			}

			if (storyobj.completed_imgs_meta) {
				for (var key in storyobj.completed_imgs_meta) {
					completed_imgs_meta[key] = storyobj.completed_imgs_meta[key];
					if (completed_imgs_meta[key] && completed_imgs_meta[key].visionmode == 4) {
						completed_imgs_meta[key].visionmode = 3; //todo: temporary backwards compat, to be removed.
					}
				}
			}
		};

		//port over old images to the new format
		migrate_old_images_in_gametext();

		//prompt to import settings
		if (localsettings.show_advanced_load && !force_load_settings) {
			import_settings(
				document.getElementById("advset_mainstory").checked,
				document.getElementById("advset_memanote").checked,
				document.getElementById("advset_worldinfo").checked,
				document.getElementById("advset_tokens").checked,
				document.getElementById("advset_gensettings").checked,
				document.getElementById("advset_aessettings").checked,
			);
		} else {
			//force load everything
			import_settings(true, true, true, true, true, true);
		}
		toggle_invert_colors();
		toggle_sidepanel_mode();
		update_for_sidepanel();
		render_gametext(true);
		if (!ignore_multiplayer_sync) { //we don't want an infinite loop
			sync_multiplayer(true);
		}
	});
}
function has_tavern_wi_check(obj) {
	let checkresult = false;
	if (obj && obj.entries) {
		const keys = Object.keys(obj.entries);
		if (keys.length > 0) {
			const firstEntry = obj.entries[keys[0]];
			checkresult = firstEntry && firstEntry.hasOwnProperty("uid");
		}
	}
	return checkresult;
}

function load_agnai_wi(obj) {
	console.log("Append Agnai WI");
	let loadedwi = [];
	for (let key in obj.entries) {
		var itm = obj.entries[key];
		var karr = itm.keywords;
		let nwi = {
			key: karr.join(","),
			keysecondary: "",
			keyanti: "",
			content: itm.entry,
			comment: "",
			folder: null,
			selective: false,
			constant: false,
			probability: 100,
			wigroup: "",
			widisabled: false,
		};
		loadedwi.push(nwi);
	}
	return loadedwi;
}
function load_tavern_wi(obj) {
	console.log("Append Tavern WI");
	let loadedwi = [];
	for (let key in obj.entries) {
		var itm = obj.entries[key];
		var karr = itm.key;
		if (!karr) {
			karr = itm.keys;
		}
		var ksarr = itm.keysecondary;
		if (!ksarr) {
			ksarr = itm.secondary_keys;
		}
		let nwi = {
			key: karr.join(","),
			keysecondary: ((ksarr && ksarr.length) > 0 ? ksarr.join(",") : ""),
			keyanti: "",
			content: itm.content,
			comment: itm.comment,
			folder: null,
			selective: itm.selective,
			constant: itm.constant,
			probability: 100,
			wigroup: "",
			widisabled: false,
		};
		loadedwi.push(nwi);
	}
	return loadedwi;
}

var tempAltGreetings = [];
function click_more_alt_greeting(idx) {
	if (tempAltGreetings.length > idx) {
		msgboxYesNo(tempAltGreetings[idx].substr(0, 512) + "...\n\nUse This Greeting?", "Use Greeting " + idx + "?", () => {
			//this is an ugly hack
			if (onInputboxOk) {
				document.getElementById("inputboxcontainerinput").value = idx;
				onInputboxOk();
			}
		}, () => {});
	} else {
		console.log("ERROR ALT GREETING NOT FOUND");
	}
}

function getInfoSnippet(snippet) {
	return `\n[Info Snippet${snippet.document ? ` from document "${snippet.document}"` : ""}: ${snippet.snippet}]\n`;
}

function replaceDocumentFromTextDB(documentName, documentContent) {
	//we want to edit the LIVE copy, not the cached var in memory.
	let curr_doc_db = document.getElementById("documentdb_data").value;
	if (curr_doc_db.indexOf(`[DOCUMENT BREAK][${documentName}]`) !== -1) {
		const regex = new RegExp(`(\\[DOCUMENT BREAK\\]\\[${documentName}\\])(.*?)(\\[DOCUMENT BREAK\\]|$)`, "s");
		curr_doc_db = curr_doc_db.replace(regex, `$1${documentContent.trim()}$3`);
	} else {
		curr_doc_db += `[DOCUMENT BREAK][${documentName}]${documentContent.trim()}`;
	}
	document.getElementById("documentdb_data").value = curr_doc_db;
}

function importLorebookAsTextDB(lorebook) {
	let has_tav_wi_check = has_tavern_wi_check(lorebook);
	if (lorebook && has_tav_wi_check) {
		let lbname = lorebook.name ? lorebook.name : "UntitledLorebook";
		var outputText = [];
		var entries = (typeof lorebook.entries === "object")
			? Object.keys(lorebook.entries).map(function(key) {
				return lorebook.entries[key];
			})
			: [];

		for (var i = 0; i < entries.length; i++) {
			var loreEntry = entries[i];
			var name = lbname.trim();
			var comment = loreEntry.comment || "";
			var content = loreEntry.content || "";

			if (comment == "" && content == "") {
				continue; //skip blank entries
			}

			var keyList = []
				.concat(loreEntry.key || [])
				.concat(loreEntry.keys || [])
				.concat(loreEntry.keysecondary || []);

			// Remove duplicates
			var seen = {};
			var keys = [];
			for (var j = 0; j < keyList.length; j++) {
				var key = keyList[j];
				if (!seen[key]) {
					keys.push(key);
					seen[key] = true;
				}
			}

			var description = "### Name: " + name;
			if (comment && comment !== name) {
				description += "\n(Description: " + comment + ")";
			}
			if (keys.length > 0) {
				description += "\n(Alternative names: " + keys.join(",") + ")";
			}
			description += "\nDetails: " + content.trim();
			outputText.push(description);
		}

		if (outputText.length > 0) {
			replaceDocumentFromTextDB(lbname, outputText.join("\n\n"));
			return true;
		}
	}
	return false;
}

function load_tavern_obj(obj) {
	let selectedgreeting = "";
	let load_tav_obj_confirm_p1 = function(usechatmode) // need second input for alt greeting
	{
		if ((obj.spec == "chara_card_v2" || obj.spec == "chara_card_v3") && obj.data != null) {
			obj = obj.data;
		}
		selectedgreeting = obj.first_mes ? obj.first_mes : "";

		if (selectedgreeting == "" && obj.alternate_greetings && obj.alternate_greetings.length == 1) {
			selectedgreeting = obj.alternate_greetings[0] ? obj.alternate_greetings[0] : "";
		} else if (localsettings.import_tavern_prompt && obj.alternate_greetings && obj.alternate_greetings.length > 0) {
			tempAltGreetings = [];
			if (obj.first_mes) {
				tempAltGreetings.push(obj.first_mes);
			}
			tempAltGreetings = tempAltGreetings.concat(obj.alternate_greetings);
			tempAltGreetings = tempAltGreetings.slice(0, 16);
			let bufMsg = "<p><b><u>Select Greeting Message</u></b></p>";
			for (it in tempAltGreetings) {
				bufMsg += it + ") " + tempAltGreetings[it].substr(0, 64) + `...<a href="#" onclick="click_more_alt_greeting(${it})">(more)</a><br>`;
			}

			inputBox(bufMsg, "Choose Greeting Message", "", "Number 0 to " + (tempAltGreetings.length - 1), () => {
				let userinput = getInputBoxValue();
				userinput = parseInt(userinput);
				userinput = cleannum(userinput, 0, tempAltGreetings.length - 1);
				selectedgreeting = tempAltGreetings[userinput];
				load_tav_obj_confirm_p2(usechatmode);
			}, true);
		} else {
			load_tav_obj_confirm_p2(usechatmode);
		}
	};

	let load_tav_obj_confirm_p2 = function(usechatmode) {
		console.log("Loading tavern obj");
		let chatopponent = obj.name ? obj.name : defaultchatopponent;
		let myname = (localsettings.chatname && localsettings.chatname != "") ? localsettings.chatname : "User";
		let memory = obj.description ? ("Persona: " + obj.description) : "";
		memory += obj.personality ? ("\nPersonality: " + obj.personality) : "";
		let scenario = obj.scenario ? obj.scenario : "";
		let examplemsg = obj.mes_example ? obj.mes_example : "";
		let sysprompt = obj.system_prompt ? obj.system_prompt : "";
		let greeting = selectedgreeting;

		//post process
		if (scenario != "") {
			scenario = "\n[Scenario: " + scenario + "]";
		}
		if (examplemsg != "") {
			examplemsg = "\n" + examplemsg;
		}
		if (sysprompt != "") {
			sysprompt = sysprompt + "\n";
		}
		let combinedmem = sysprompt + memory + scenario + examplemsg;
		let agnaidatafieldsempty = scenario + examplemsg + (obj.personality ? obj.personality : "") + greeting;
		let has_tav_wi_check = has_tavern_wi_check(obj);
		//check if it's a world info only card, if so, do not restart game
		if (combinedmem.trim() == "" && greeting == "" && has_tav_wi_check) {
			msgboxYesNo(
				"Import World Info / Lorebook into TextDB?\n\nYes = TextDB Used\nNo = World Info Used\n\nIf unsure, select 'No'.",
				"Import World Info / Lorebook Mode",
				() => {
					importLorebookAsTextDB(obj); //can't fail since same wi check is done beforehand
					documentdb_data = document.getElementById("documentdb_data").value; //save to db
				},
				() => {
					current_wi = load_tavern_wi(obj);
				},
			);
		} else if (agnaidatafieldsempty.trim() == "" && obj.entries && obj.kind == "memory") {
			current_wi = load_agnai_wi(obj);
		} else {
			restart_new_game(false);
			localsettings.chatname = myname;
			localsettings.chatopponent = chatopponent;
			current_memory = combinedmem + "\n***";
			localsettings.multiline_replies = true;
			if (usechatmode) {
				localsettings.opmode = 3;
				if (localsettings.gui_type_chat != 3) {
					localsettings.gui_type_chat = 2;
				}
				gametext_arr.push("\n" + chatopponent + ": " + greeting);
			} else {
				localsettings.opmode = 4;
				localsettings.gui_type_instruct = 2;
				localsettings.inject_chatnames_instruct = true;
				gametext_arr.push(get_instructendplaceholder() + chatopponent + ": " + greeting);
			}
			//handle character book
			if (obj.character_book && obj.character_book.entries && obj.character_book.entries.length > 0) {
				current_wi = load_tavern_wi(obj.character_book);
			} else if (obj.data && obj.data.character_book && obj.data.character_book.entries && obj.data.character_book.entries.length > 0) {
				current_wi = load_tavern_wi(obj.data.character_book);
			} else if (obj.entries && obj.entries.length > 0) {
				current_wi = load_agnai_wi(obj);
			} else if (has_tav_wi_check) {
				current_wi = load_tavern_wi(obj);
			}
		}
		update_for_sidepanel();
		render_gametext(true);
		sync_multiplayer(true);
	};

	if (localsettings.import_tavern_prompt) {
		msgboxYesNo(
			"Import Character Card in Instruct Mode?\n\nYes = Instruct Mode Used\nNo = Chat Mode Used\n\nIf unsure, select 'No'.",
			"Import Tavern Card Mode",
			() => {
				load_tav_obj_confirm_p1(false);
			},
			() => {
				load_tav_obj_confirm_p1(true);
			},
		);
	} else {
		load_tav_obj_confirm_p1(true);
	}
}
function load_ooba_obj(obj) {
	console.log("Loading ooba obj");
	let chatopponent = obj.char_name ? obj.char_name : defaultchatopponent;
	let myname = (localsettings.chatname && localsettings.chatname != "") ? localsettings.chatname : "User";
	let memory = obj.char_persona ? ("Persona: " + obj.char_persona) : "";
	let scenario = obj.world_scenario ? obj.world_scenario : "";
	let examplemsg = obj.example_dialogue ? obj.example_dialogue : "";
	let greeting = obj.char_greeting ? obj.char_greeting : "";
	//post process
	if (scenario != "") {
		scenario = "\n[Scenario: " + scenario + "]";
	}
	if (examplemsg != "") {
		examplemsg = "\n" + examplemsg;
	}
	restart_new_game(false);
	localsettings.chatname = myname;
	localsettings.chatopponent = chatopponent;
	gametext_arr.push("\n" + chatopponent + ": " + greeting);
	current_memory = memory + scenario + examplemsg + "\n***";
	localsettings.opmode = 3;
	if (localsettings.gui_type_chat != 3) {
		localsettings.gui_type_chat = 2;
	}
	update_for_sidepanel();
	render_gametext(true);
	sync_multiplayer(true);
}
function nai_json_load(obj) {
	console.log("Loading nai obj");
	restart_new_game(false);
	if (obj.prompt != "") {
		gametext_arr.push(obj.prompt);
	}
	current_memory = "";
	if (obj.context && obj.context.length > 0) {
		for (let i = 0; i < obj.context.length; ++i) {
			current_memory += obj.context[i].text + "\n";
		}
	}
	if (obj.lorebook) {
		current_wi = load_nai_wi(obj.lorebook);
	}
	update_for_sidepanel();
	render_gametext(true);
	sync_multiplayer(true);
}
function load_nai_wi(obj) {
	console.log("Loading nai wi");
	let loadedwi = [];
	for (let i = 0; i < obj.entries.length; ++i) {
		var itm = obj.entries[i];
		var key = "";
		if (itm.keys && itm.keys.length > 0) {
			key = itm.keys[0];
		}

		let nwi = {
			key: key,
			keysecondary: "",
			keyanti: "",
			content: itm.text,
			comment: "",
			folder: null,
			selective: false,
			constant: false,
			probability: 100,
			wigroup: "",
			widisabled: false,
		};
		loadedwi.push(nwi);
	}
	return loadedwi;
}

function load_aid_wi(obj) {
	console.log("Loading aid wi");
	let loadedwi = [];
	for (let i = 0; i < obj.length; ++i) {
		var itm = obj[i];
		var key = "";
		if (itm.keys && itm.keys != "") {
			key = itm.keys;
		}

		let nwi = {
			key: key,
			keysecondary: "",
			keyanti: "",
			content: itm.value,
			comment: "",
			folder: null,
			selective: false,
			constant: false,
			probability: 100,
			wigroup: "",
			widisabled: false,
		};
		loadedwi.push(nwi);
	}
	return loadedwi;
}

function load_temp_scenario_from_tavernobj(obj) {
	if (obj != null) {
		//a lightweight tavern card loader, not fully compliant
		if ((obj.spec == "chara_card_v2" || obj.spec == "chara_card_v3") && obj.data != null) {
			obj = obj.data;
		}

		let chatopponent = obj.name ? obj.name : "Bot";
		let memory = obj.description ? ("Persona: " + obj.description) : "";
		memory += obj.personality ? ("\nPersonality: " + obj.personality) : "";
		let scenario = obj.scenario ? obj.scenario : "";
		let examplemsg = obj.mes_example ? obj.mes_example : "";
		let greeting = obj.first_mes ? obj.first_mes : "";
		let sysprompt = obj.system_prompt ? obj.system_prompt : "";

		//aliases
		if (examplemsg == "" && obj.mesExample != "") {
			examplemsg = obj.mesExample;
		}
		if (greeting == "" && obj.firstMes != "") {
			greeting = obj.firstMes;
		}

		if (scenario != "") {
			scenario = "\n[Scenario: " + scenario + "]";
		}
		if (examplemsg != "") {
			examplemsg = "\n" + examplemsg;
		}
		if (sysprompt != "") {
			sysprompt = sysprompt + "\n";
		}
		let combinedmem = sysprompt + memory + scenario + examplemsg;
		temp_scenario.title = chatopponent;
		let prev2 = replaceAll(obj.description, "{{char}}", chatopponent, true);
		prev2 = replaceAll(prev2, "{{user}}", "User", true);
		temp_scenario.desc = prev2;
		temp_scenario.chatopponent = chatopponent;
		temp_scenario.prompt = "\n{{char}}: " + greeting;
		temp_scenario.memory = combinedmem;

		//since cai format has no wi, try to grab it from tavern format
		let myname = (localsettings.chatname && localsettings.chatname != "") ? localsettings.chatname : "User";
		if (obj.character_book && obj.character_book.entries && obj.character_book.entries.length > 0) {
			temp_scenario.worldinfo = load_tavern_wi(obj.character_book);
		} else if (obj.data && obj.data.character_book && obj.data.character_book.entries && obj.data.character_book.entries.length > 0) {
			temp_scenario.worldinfo = load_tavern_wi(obj.data.character_book);
		}
		preview_temp_scenario();
	}
}

function leave_multiplayer() {
	multiplayer_pinged = false;
	multiplayer_active = false;
	multiplayer_last_turn_major = 0;
	multiplayer_last_turn_minor = 0;
	max_poll_limit_counter = 0;
	schedule_multiplayer_minor_change = false;
	schedule_multiplayer_major_change = false;
	multiplayer_override_name = "";
	render_gametext(false);
}

function join_multiplayer() {
	if (is_using_kcpp_with_multiplayer()) {
		inputBoxOkCancel(
			`You're about to enter a Multiplayer Session. This may overwrite your current session.<br><br><span class="color_red">Note that stories or messages sent by other users are <b>unfiltered</b>, and may contain <b>offensive or disturbing content</b>. You assume full responsibility and participate at your own discretion.</span><br><br>Enter a unique nickname to use for chat mode (only yourself), or leave it blank to share the same common chatname with other users.`,
			"Join Multiplayer - Override Chat Nickname?",
			"",
			"[No Override]",
			() => {
				let userinput = getInputBoxValue().trim();
				multiplayer_active = true;
				multiplayer_pinged = false;
				multiplayer_override_name = userinput;
				multiplayer_last_turn_major = 0;
				multiplayer_last_turn_minor = 0;
				schedule_multiplayer_minor_change = false;
				schedule_multiplayer_major_change = false;
				render_gametext(false);
			},
			() => {},
			true,
		);
	} else {
		leave_multiplayer();
		msgbox("Multiplayer is not available or not enabled on this backend", "No Multiplayer Detected");
	}
}

function sync_multiplayer(fullupdate) {
	if (!is_using_kcpp_with_multiplayer() || !multiplayer_active) {
		schedule_multiplayer_minor_change = false;
		schedule_multiplayer_major_change = false;
		return;
	}
	schedule_multiplayer_minor_change = true;
	if (fullupdate) {
		schedule_multiplayer_major_change = true;
	}
}

function submit_multiplayer(fullupdate) {
	if (!is_using_kcpp_with_multiplayer() || !multiplayer_active) {
		schedule_multiplayer_minor_change = false;
		schedule_multiplayer_major_change = false;
		return;
	}
	let subdata = generate_compressed_story(true, true, true);

	fetch(apply_proxy_url(custom_kobold_endpoint + koboldcpp_multiplayer_submit_endpoint), {
		method: "POST",
		headers: get_kobold_header(),
		body: JSON.stringify({
			full_update: fullupdate,
			data: subdata,
			sender: unique_uid,
			data_format: "kcpp_lzma_b64",
		}),
	})
		.then(response => response.json())
		.then(vals => {
			if (vals && vals.success) {
				let expected_major = fullupdate ? (1 + multiplayer_last_turn_major) : multiplayer_last_turn_major;
				let expected_minor = fullupdate ? 1 : (multiplayer_last_turn_minor + 1);
				if (vals.turn_major == expected_major && vals.turn_minor == expected_minor) {
					//if nobody else updated, disregard our own updates
					multiplayer_last_turn_major = expected_major;
					multiplayer_last_turn_minor = expected_minor;
				}
			} else {
				leave_multiplayer();
				msgbox(
					"Multiplayer Error: " + JSON.stringify(vals) + "\n\nYou can reconnect by clicking 'Join Multiplayer'.",
					"Disconnected from Multiplayer",
				);
			}
		}).catch(error => {
			leave_multiplayer();
			msgbox("Multiplayer Error: " + error + "\n\nYou can reconnect by clicking 'Join Multiplayer'.", "Disconnected from Multiplayer");
			console.log("Failed to access multiplayer status: " + error);
		});
}

function character_creator() {
	hide_popups();
	document.getElementById("charcreator_name").value =
		document.getElementById("charcreator_persona").value =
		document.getElementById("charcreator_scenario").value =
		document.getElementById("charcreator_greeting").value =
			"";
	document.getElementById("usecharactertemplate").checked = false;
	document.getElementById("charactercreator").classList.remove("hidden");
	tempAestheticInstructUISettings = deepCopyAestheticSettings(aestheticInstructUISettings);
	character_creator_updateimg();
	character_creator_template_toggle();
}
function character_creator_updateimg() {
	document.getElementById("charcreator_avatar").style.backgroundImage = `url(`
		+ (aestheticInstructUISettings.AI_portrait != "default" ? aestheticInstructUISettings.AI_portrait : niko_square) + `)`;
}
function character_creator_template_toggle() {
	if (document.getElementById("usecharactertemplate").checked) {
		document.getElementById("nocharactertemplate").classList.add("hidden");
	} else {
		document.getElementById("nocharactertemplate").classList.remove("hidden");
	}
}
function character_creator_done(confirm) {
	let usingtemplate = document.getElementById("usecharactertemplate").checked; //are we using Peter's template?
	if (!confirm) {
		aestheticInstructUISettings = deepCopyAestheticSettings(tempAestheticInstructUISettings);
		updateUIFromData();
	} else {
		let chatopponent = document.getElementById("charcreator_name").value;
		chatopponent = chatopponent ? chatopponent : "Bot";

		let persona = document.getElementById("charcreator_persona").value;
		let scenario = document.getElementById("charcreator_scenario").value;
		scenario = scenario ? scenario : "";
		let memory = persona ? ("{{char}} Persona: " + persona) : "";
		let greeting = document.getElementById("charcreator_greeting").value;
		greeting = greeting ? greeting : "Hello there!";
		if (scenario != "") {
			scenario = "\n[Scenario: " + scenario + "]";
		}
		let combinedmem = memory + scenario;

		if (usingtemplate) {
			let introduction = "[Overview: <give the AI a one sentence overview of what your intention is here>]";
			let character = "\n\n[" + chatopponent
				+ "'s Character definition:\nGender: <female, male, unknown>\nSpecies: <human, elf, alien>\nAge:\nHeight:\nWeight:\nBuild:\nHair:\nEyes:\nEyebrows:\nClothing Preferences:\nPersonality:\nMind:\nSpeech:\nAccent:\nMannerisms:\nLikes:\nDislikes:\nHobbies:\nShort-term Goals:\nLong-term Goals:\n"
				+ chatopponent + "’s primary goal is:\nChildhood memories of " + chatopponent + ":\nLong-term memories of " + chatopponent
				+ ": <also add descriptions of friends and similar persons from the life of " + chatopponent
				+ " here>\nShort-term Memories relevant for the scenario:  ]";
			let genre = "\n\n[Genre: <add one or more genre definitions for your scenario here>]";
			let tags = "\n\n[Tags: <add one or more tags describing your role-play for the AI here>]";
			let scenario = "\n\n[Scenario: <add your scenario here>]";
			let examples = "\n\n" + chatopponent + ": <add some example messages (hidden) for " + chatopponent + " here>";
			combinedmem = introduction + character + genre + tags + scenario + examples;
		}

		greeting = "\n{{char}}: " + greeting;
		restart_new_game(false);

		gametext_arr = [];
		if (!localsettings.placeholder_tags) { //do a one-time replace instead
			greeting = replace_placeholders(greeting, false, true, false); //this is all onetime replacements, no need for stability
			combinedmem = replace_placeholders(combinedmem, false, true, false);
		}
		if (greeting) {
			gametext_arr.push(greeting);
		}
		if (combinedmem != "") {
			current_memory = combinedmem;
		}
		localsettings.opmode = 3;
		if (localsettings.gui_type_chat != 3) {
			localsettings.gui_type_chat = 2;
		}
		localsettings.chatopponent = chatopponent;
		update_for_sidepanel();
		render_gametext();
		sync_multiplayer(true);
	}
	tempAestheticInstructUISettings = null;
	hide_popups();
	if (confirm && usingtemplate) {
		btn_memory();
	}
}

function click_scenario(idx) {
	temp_scenario = scenario_db[idx];
	preview_temp_scenario();
}
function preview_temp_scenario() {
	let author = "";
	let image = "";
	if (temp_scenario.author && temp_scenario.author != "") {
		author = "<br><b>Author:</b> " + temp_scenario.author;
	}
	if (temp_scenario.image) {
		temp_scenario.gui_type = 2; //upgrade to aesthetic if we have image
		image = `<img id="tempscenarioimg" style="float:right; width:100px; height:${
			100 / (temp_scenario.image_aspect ? temp_scenario.image_aspect : 1)
		}px; padding: 8px;" src="${encodeURI(temp_scenario.image)}"></img>`;
	}
	document.getElementById("scenariodesc").innerHTML = image + `<p><b><u>` + escape_html(temp_scenario.title) + `</u></b></p>`
		+ `<p><b>Mode:</b> `
		+ (temp_scenario.opmode == 1 ? "Story" : (temp_scenario.opmode == 2 ? "Adventure" : (temp_scenario.opmode == 3 ? "Chat" : "Instruct")))
		+ author + `</p>`
		+ `<p>` + (temp_scenario.desc != "" ? escape_html(temp_scenario.desc).replace(/\n/g, "<br>") : "[No Description Given]") + `</p>`;
}
function complete_load_scenario() {
	console.log("Loading scenario...");
	restart_new_game(false);

	//load contexts
	gametext_arr = [];
	if (temp_scenario.prompt != "") {
		let prompttxt = temp_scenario.prompt;
		if (!localsettings.placeholder_tags) { //do a one-time replace instead
			prompttxt = replace_placeholders(prompttxt, false, true, false);
		}
		gametext_arr.push(prompttxt);
	}
	if (temp_scenario.authorsnote != "") {
		current_anote = temp_scenario.authorsnote;
		if (!localsettings.placeholder_tags) {
			current_anote = replace_placeholders(current_anote, false, true, false);
		}
	}
	if (temp_scenario.memory != "") {
		current_memory = temp_scenario.memory;
		if (!localsettings.placeholder_tags) {
			current_memory = replace_placeholders(current_memory, false, true, false);
		}
	}
	if (temp_scenario.image && temp_scenario.image != "") {
		aestheticInstructUISettings.AI_portrait = temp_scenario.image;
		document.getElementById("portrait_ratio_AI").value = (temp_scenario.image_aspect ? temp_scenario.image_aspect : 1).toFixed(2);
		refreshAestheticPreview(true);
	}
	if (temp_scenario.worldinfo && temp_scenario.worldinfo.length > 0) {
		current_wi = temp_scenario.worldinfo;
	}

	localsettings.opmode = temp_scenario.opmode;

	if (temp_scenario.opmode == 2) {
		if (temp_scenario.adventure_context_mod === true) {
			localsettings.adventure_context_mod = true;
		} else if (temp_scenario.adventure_context_mod === false) {
			localsettings.adventure_context_mod = false;
		}

		if (temp_scenario.adventure_switch_mode === 0 || temp_scenario.adventure_switch_mode === 1 || temp_scenario.adventure_switch_mode === 2) {
			localsettings.adventure_switch_mode = temp_scenario.adventure_switch_mode;
		}
	}
	if (temp_scenario.opmode == 3) {
		if (localsettings.gui_type_chat != 3) {
			if (temp_scenario.gui_type === 1) localsettings.gui_type_chat = 1;
			else if (temp_scenario.gui_type === 2) localsettings.gui_type_chat = 2;
			else if (temp_scenario.gui_type === 0) localsettings.gui_type_chat = 0;
		}

		if (temp_scenario.multiline_replies === true) localsettings.multiline_replies = true;
		else if (temp_scenario.multiline_replies === false) localsettings.multiline_replies = false;

		if (temp_scenario.chatopponent) localsettings.chatopponent = temp_scenario.chatopponent;
		if (temp_scenario.chatname) localsettings.chatname = temp_scenario.chatname;
	}
	if (temp_scenario.opmode == 4) {
		if (temp_scenario.gui_type === 1) localsettings.gui_type_instruct = 1;
		else if (temp_scenario.gui_type === 2) localsettings.gui_type_instruct = 2;
		else if (temp_scenario.gui_type === 0) localsettings.gui_type_instruct = 0;
		else if (temp_scenario.gui_type === 3) localsettings.gui_type_instruct = 3;

		if (temp_scenario.instruct_has_markdown === true) {
			localsettings.instruct_has_markdown = true;
		} else if (temp_scenario.instruct_has_markdown === false) {
			localsettings.instruct_has_markdown = false;
		}

		if (temp_scenario.instruct_starttag) localsettings.instruct_starttag = temp_scenario.instruct_starttag;
		if (temp_scenario.instruct_endtag) localsettings.instruct_endtag = temp_scenario.instruct_endtag;
	}

	update_for_sidepanel();
	render_gametext(true);
	sync_multiplayer(true);
}
function togglescenarioautopick() {
	if (localflag || is_using_custom_ep()) {
		document.getElementById("scenarioautopickbox").classList.add("hidden");
	} else {
		if (selected_models.length == 0) {
			document.getElementById("scenarioautopickai").checked = true;
		}
	}
}
function confirm_scenario_verify() {
	if (temp_scenario.show_warning == true && localsettings.passed_ai_warning == false && passed_ai_warning_local == false) {
		let warntxt = `<p><b><u>Disclaimer: The AI is not suitable to be used as an actual therapist, counselor or advisor of any kind.</u></b></p>
		<p>While some find it comforting to talk about their issues with an AI, the responses are unpredictable.</p>
		<p>When using the AI for real world use-cases such as advice or counseling this means <b>you must be able to understand when an answer is wrong</b>.
		If you would not trust a random person to pretend to be your advisor; you should definitely not use the AI for this. The models are simply too small and not trained for this purpose.</p>
		<p>If you still wish to proceed, please type the phrase &quot;I understand&quot; in the box below, exactly as written.</p>
		<p><b>If you are experiencing feelings of distress, anxiety, suicidal thoughts, or other forms of mental discomfort, it's best to avoid using AI for non fiction or personal matters as it may exacerbate or encourage these feelings.</b></p>
		`;
		inputBox(warntxt, "AI Safety Warning", "", "Acknowledgement Required", () => {
			let userinput = getInputBoxValue().toLowerCase().trim();
			if (userinput.includes("understand")) {
				confirm_scenario();
				localsettings.passed_ai_warning = true; //remember flag for session
				passed_ai_warning_local = true;
			}
		}, true);
	} else {
		if (localsettings.passed_ai_warning == true || passed_ai_warning_local == true) {
			localsettings.passed_ai_warning = true; //remember flag for session
			passed_ai_warning_local = true;
		}
		confirm_scenario();
	}
}
function confirm_scenario() {
	mainmenu_untab(false);
	if (temp_scenario != null) {
		hide_popups();
		//assign model if necessary
		let scenarioautopickai = document.getElementById("scenarioautopickai").checked ? true : false;

		if (selected_models.length == 0 && !is_using_custom_ep()) {
			scenarioautopickai = true; //no selected model, pick a good one
		}
		if (scenarioautopickai && !localflag && !is_using_custom_ep()) {
			fetch_models((mdls) => {
				//can we find the model that's used? if yes load it, otherwise load the first one
				if (mdls.length == 0) {
					msgbox("No models available. Unable to load.");
				} else {
					selected_models = [];
					for (var i = 0; i < mdls.length; ++i) {
						let skipignored = false;
						for (let k = 0; k < ignoredmodels.length; ++k) {
							if (mdls[i].name.trim().toLowerCase().includes(ignoredmodels[k].trim().toLowerCase())) {
								skipignored = true;
								break;
							}
						}
						if (!skipignored) {
							for (var j = 0; j < defaultmodels.length; ++j) {
								if (
									mdls[i].name.trim().toLowerCase().includes(defaultmodels[j].trim().toLowerCase())
									|| defaultmodels[j].trim().toLowerCase().includes(mdls[i].name.trim().toLowerCase())
								) {
									selected_models.push(mdls[i]);
								}
							}
						}
					}

					if (selected_models.length == 0) { //still no selected model, pick first one
						selected_models.push(mdls[0]);
					}

					complete_load_scenario();
					temp_scenario = null;
				}
			});
		} else {
			complete_load_scenario();
			temp_scenario = null;
		}
	}
}

/**
 * @type {{
 * 		name: string;
 * 		urlParam: string;
 * 		inputBox: {
 * 			text: string;
 * 			placeholder: string;
 * 		};
 * 		extraction: (userInput: string) => string;
 * 		fetch: (value: string) => Promise<void>;
 * 	}[]}
 */
const scenario_sources = [
	// prompts.forthisfeel.club replaces Aetherroom.club
	{
		name: "prompts.forthisfeel.club",
		urlParam: "aether",
		inputBox: {
			text: "Enter prompts.forthisfeel.club prompt URL, or 4-digit prompt number",
			placeholder: "https://prompts.forthisfeel.club/1234",
		},
		extraction: (userInput) => {
			userInput = userInput.toLowerCase();
			if (userInput.includes("forthisfeel.club/")) {
				//is a url, extract the ID
				userInput = userInput.replace("/api/", "/");
				userInput = userInput.split("forthisfeel.club/")[1];
				userInput = userInput.split("/")[0];
				userInput = userInput.split("#")[0];
				userInput = userInput.split("?")[0];
			}
			if (!(userInput != "" && is_numeric(userInput) && userInput > 0 && userInput < 50000)) {
				throw new Error(
					"User input is invalid\n\n Please ensure you have input a valid prompts.forthisfeel.club URL or ID (e.g. https://prompts.forthisfeel.club/1234 or just 1234)",
				);
			}
			return userInput;
		},
		fetch: (userInput) => {
			return fetch(apply_proxy_url("https://prompts.forthisfeel.club/api/" + userInput, true))
				.then(x => x.json())
				.then(data => {
					console.log(data);
					temp_scenario = {
						title: data.title ? data.title : "",
						desc: data.description ? data.description : "",
						opmode: 2,
						adventure_context_mod: false,
						adventure_switch_mode: 1,
						prompt: data.promptContent ? data.promptContent : "",
						memory: data.memory ? data.memory : "",
						authorsnote: data.authorsNote ? data.authorsNote : "",
						worldinfo: [],
					};
					if (data.worldInfos) {
						for (let w = 0; w < data.worldInfos.length; ++w) {
							let keys = data.worldInfos[w].keys;
							let entry = data.worldInfos[w].entry;

							let nwi = {
								key: (keys ? keys : ""),
								keysecondary: "",
								keyanti: "",
								content: (entry ? entry : ""),
								comment: "",
								folder: null,
								selective: false,
								constant: false,
								probability: 100,
								wigroup: "",
								widisabled: false,
							};
							temp_scenario.worldinfo.push(nwi);
						}
					}
					preview_temp_scenario();
				}).catch((error) => {
					console.error(error);
					throw new Error("Error: Selected scenario is invalid.");
				});
		},
	},
	// Chub.ai
	{
		name: "chub.ai / characterhub.org",
		urlParam: "chub",
		inputBox: {
			text: "Enter chub.ai or characterhub.org card URL",
			placeholder: "https://chub.ai/characters/Anonymous/example-character",
		},
		extraction: (userInput) => {
			if (userInput.match(/chub\.ai\//i)) {
				// is a URL, extract the character name
				userInput = userInput.replace(/\/characters\//i, "/");
				userInput = userInput.split(/chub\.ai\//i)[1].split("#")[0].split("?")[0];
			} else if (userInput.match(/characterhub\.org\//i)) {
				// is a URL, extract the character name
				userInput = userInput.replace(/\/characters\//i, "/");
				userInput = userInput.split(/characterhub\.org\//i)[1].split("#")[0].split("?")[0];
			}
			userInput = userInput.endsWith("/") ? userInput.slice(0, -1) : userInput;
			userInput = userInput.startsWith("/") ? userInput.slice(1) : userInput;
			return userInput;
		},
		fetch: (userInput) => {
			temp_scenario = {
				title: "",
				desc: "",
				opmode: 3,
				chatopponent: "",
				gui_type: 1,
				prompt: "",
				memory: "",
				authorsnote: "",
				worldinfo: [],
			};

			//try to obtain the full portrait image
			return fetch(`https://avatars.charhub.io/avatars/${userInput}/chara_card_v2.png`, {
				method: "GET",
				referrerPolicy: "no-referrer",
			})
				.then(rb => {
					if (rb.ok) {
						return rb.blob();
					}
					if (rb.status == 404) { //sometimes cards get renamed. try to get real URL and fetch once more
						return fetch(`https://api.chub.ai/api/characters/${userInput}`)
							.then(rx => rx.json())
							.then(rb2 => {
								let realimgurl = rb2.node.max_res_url;
								return fetch(realimgurl).then(rb3 => {
									if (rb3.ok) {
										return rb3.blob();
									}
									throw new Error("Cannot fetch tavern image");
								}).catch(error3 => {
									throw new Error("Cannot fetch tavern image");
								});
							}).catch(error2 => {
								throw new Error("Cannot fetch tavern image");
							});
					}
					throw new Error("Cannot fetch tavern image");
				})
				.then(blob => {
					preview_temp_scenario();

					readTavernPngFromBlob(blob, (obj) => {
						load_temp_scenario_from_tavernobj(obj);
					});

					const objectURL = URL.createObjectURL(blob);
					const compressedImg = compressImage(
						objectURL,
						(compressedImageURI, aspectratio) => {
							temp_scenario.image = compressedImageURI;
							temp_scenario.image_aspect = aspectratio;
							preview_temp_scenario();
						},
						true,
						AVATAR_PX,
					);
				})
				.catch(error => {
					console.error(error);
					throw new Error("Error fetching tavern scenario.");
				});
		},
	},
	// Pygmalion.chat
	{
		name: "pygmalion.chat",
		urlParam: "pyg",
		inputBox: {
			text: "Enter pygmalion.chat character UUID",
			placeholder: "d7950ca8-c241-4725-8de1-42866e389ebf",
		},
		extraction: (userInput) => {
			if (userInput.match(/pygmalion\.chat\//i)) {
				const urlParams = new URLSearchParams(userInput);
				const cid = urlParams.get("id");
				if (cid && cid != "") {
					userInput = cid;
				}
			}
			userInput = userInput.endsWith("/") ? userInput.slice(0, -1) : userInput;
			userInput = userInput.trim().toLowerCase().replace("https://pygmalion.chat/character/", "");
			userInput = userInput.trim().toLowerCase().replace("https://pygmalion.chat//character/", "");
			return userInput;
		},
		fetch: (userInput) => {
			temp_scenario = {
				title: "",
				desc: "",
				opmode: 3,
				chatopponent: "",
				gui_type: 1,
				prompt: "",
				memory: "",
				authorsnote: "",
				worldinfo: [],
			};

			let charurl = "https://server.pygmalion.chat/api/export/character/" + userInput + "/v2";
			return fetch(apply_proxy_url(charurl, true), {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				referrerPolicy: "no-referrer",
			})
				.then(x => {
					if (x.ok) {
						return x.json();
					} else {
						throw new Error("Invalid HTTP status on response: " + x.status);
					}
				})
				.then(data => {
					console.log(data);
					if (data && data.character) { //if fetch was successful
						load_temp_scenario_from_tavernobj(data.character);
						if (data.character.data && data.character.data.avatar) {
							const compressedImg = compressImage(
								data.character.data.avatar,
								(compressedImageURI, aspectratio) => {
									temp_scenario.image = compressedImageURI;
									temp_scenario.image_aspect = aspectratio;
									preview_temp_scenario();
								},
								true,
								AVATAR_PX,
							);
						}
					} else {
						throw new Error("Selected scenario is invalid.");
					}
				}).catch((error) => {
					console.error(error);
					throw new Error("Selected scenario is invalid.");
				});
		},
	},
	// aicharactercards.com
	{
		name: "aicharactercards.com / character-tavern.com",
		urlParam: "aicc",
		inputBox: {
			text: "Enter aicharactercards.com or character-tavern.com card URL",
			placeholder: "https://aicharactercards.com/character-cards/work-jobs/deffcolony/lara-lightland",
		},
		extraction: (userInput) => {
			if (userInput.match(/aicharactercards\.com\//i) && userInput.match(/sdm_process_download/i)) {
				return userInput;
			} else if (userInput.match(/character-tavern\.com\//i)) {
				userInput = userInput.replaceAll("%20", "%2520");
				if (userInput.match(/com\/character\//i)) {
					userInput = userInput.split(".png")[0];
					userInput = userInput.split("?")[0];
					userInput = userInput.split(".com/character/")[1];
					userInput = userInput.endsWith("/") ? userInput.slice(0, -1) : userInput;
					return `https://cards.character-tavern.com/${userInput}.png?action=download`;
				}
				return userInput;
			} else {
				userInput = userInput.split("#")[0].split("?")[0];
				userInput = userInput.endsWith("/") ? userInput.slice(0, -1) : userInput;
				if (userInput.match(/aicharactercards\.com\//i) || userInput.match(/AICC\//i)) {
					// is a URL, extract the character name
					let tmp = userInput.split("/");
					if (tmp.length >= 2) {
						userInput = tmp[tmp.length - 2] + "/" + tmp[tmp.length - 1];
					}
				}
				return "https://aicharactercards.com/wp-json/pngapi/v1/image/" + userInput;
			}
		},
		fetch: (userInput) => {
			temp_scenario = {
				title: "",
				desc: "",
				opmode: 3,
				chatopponent: "",
				gui_type: 1,
				prompt: "",
				memory: "",
				authorsnote: "",
				worldinfo: [],
			};

			finalurl = apply_proxy_url(userInput, true);
			//try to obtain the full portrait image
			return fetch(finalurl, {
				method: "GET",
				redirect: "follow",
				referrerPolicy: "no-referrer",
			})
				.then(rb => {
					if (rb.ok) {
						return rb.blob();
					} else {
						throw new Error("Cannot fetch tavern image");
					}
				})
				.then(blob => {
					preview_temp_scenario();

					readTavernPngFromBlob(blob, (obj) => {
						load_temp_scenario_from_tavernobj(obj);
					});

					const objectURL = URL.createObjectURL(blob);
					const compressedImg = compressImage(
						objectURL,
						(compressedImageURI, aspectratio) => {
							temp_scenario.image = compressedImageURI;
							temp_scenario.image_aspect = aspectratio;
							preview_temp_scenario();
						},
						true,
						AVATAR_PX,
					);
				})
				.catch(error => {
					throw new Error("Selected scenario is invalid.");
					console.error(error);
				});
		},
	},
	{
		name: "char-archive.evulid.cc",
		urlParam: "carc",
		inputBox: {
			text: "Enter char-archive.evulid.cc card URL",
			placeholder: "https://char-archive.evulid.cc/#/chub/Cyber_Elite/character/Cat",
		},
		extraction: (userInput) => {
			if (userInput.match(/char-archive\.evulid\.cc\/\#\//i)) {
				let parsedInput = userInput.split("?")[0];
				parsedInput = parsedInput.split("char-archive.evulid.cc/#/")[1];
				let parts = parsedInput.split("/");

				if (parts.length == 3) {
					let final = parts[2];
					final = final.includes("+") ? ("+" + final.split("+")[1]) : final;
					return `https://char-archive.evulid.cc/api/archive/v1/${parts[0]}/image/character/${final}?definition=true`;
				}
				if (parts.length == 2 || parts[0] == "generic") {
					let final = parts[1];
					final = final.includes("+") ? (final.split("+")[1]) : final;
					return `https://char-archive.evulid.cc/api/archive/v1/${parts[0]}/image/character/${final}?definition=true`;
				}
				if (parts.length !== 4 || parts[2] !== "character") {
					//bad format, return original
					return userInput;
				}
				let final = parts[3];
				final = final.includes("+") ? ("+" + final.split("+")[1]) : final;
				return `https://char-archive.evulid.cc/api/archive/v1/${parts[0]}/image/character/${parts[1]}/${final}?definition=true`;
			} else {
				return userInput;
			}
		},
		fetch: (userInput) => {
			temp_scenario = {
				title: "",
				desc: "",
				opmode: 3,
				chatopponent: "",
				gui_type: 1,
				prompt: "",
				memory: "",
				authorsnote: "",
				worldinfo: [],
			};

			finalurl = apply_proxy_url(userInput, true);
			//try to obtain the full portrait image
			return fetch(finalurl, {
				method: "GET",
				redirect: "follow",
				referrerPolicy: "no-referrer",
			})
				.then(rb => {
					if (rb.ok) {
						return rb.blob();
					} else {
						throw new Error("Cannot fetch tavern image");
					}
				})
				.then(blob => {
					preview_temp_scenario();

					readTavernPngFromBlob(blob, (obj) => {
						load_temp_scenario_from_tavernobj(obj);
					});

					const objectURL = URL.createObjectURL(blob);
					const compressedImg = compressImage(
						objectURL,
						(compressedImageURI, aspectratio) => {
							temp_scenario.image = compressedImageURI;
							temp_scenario.image_aspect = aspectratio;
							preview_temp_scenario();
						},
						true,
						AVATAR_PX,
					);
				})
				.catch(error => {
					throw new Error("Selected scenario is invalid.");
					console.error(error);
				});
		},
	},
];

/**
 * @param {typeof scenario_sources[number]} scenario_source
 * @param {string} [scenario_id]
 */
function import_scenario(scenario_source, scenario_id) {
	if (!scenario_source) return;

	function extractionWrapper(userInput) {
		try {
			return scenario_source.extraction(userInput);
		} catch (error) {
			console.error(error);
			document.getElementById("scenariodesc").innerText = "Error: Error while extracting value from input: "
				+ (error.message ? "Unknown error" : error.message);
			temp_scenario = null;
		}
		return "";
	}

	function fetchWrapper(userInput) {
		// Fetch should return a promise, so we catch it like that instead of try catch block.
		scenario_source.fetch(userInput)
			.catch(error => {
				console.error(error);
				document.getElementById("scenariodesc").innerText = "Error: Error while fetching and parsing remote values: "
					+ (error.message ? "Unknown error" : error.message);
				temp_scenario = null;
			});
	}

	function loadScenario(input) {
		if (!input) return;
		document.getElementById("scenariodesc").innerText = `Loading scenario from ${scenario_source.name}...`;
		const extracted = extractionWrapper(input);
		if (extracted) return fetchWrapper(extracted);
	}

	if (scenario_id) loadScenario(scenario_id);
	else {inputBox(
			scenario_source.inputBox.text,
			"Import from " + scenario_source.name,
			"",
			scenario_source.inputBox.placeholder,
			(value) => {
				const input = getInputBoxValue().trim();
				loadScenario(input);
			},
		);}
}

function display_scenarios() {
	mainmenu_untab(true);
	temp_scenario = null;
	document.getElementById("quickstartcontainer").classList.remove("hidden");

	let scenarios = ``;
	for (let i = 0; i < scenario_sources.length; ++i) {
		scenarios += `<button type="button" name="" class="scenarioitem purple btn btn-primary" onclick="import_scenario(scenario_sources[${i}])">${
			scenario_sources[i].name
		}</button>`;
	}

	scenarios +=
		`<button type="button" name="" class="scenarioitem purple btn btn-primary" onclick="character_creator()">New Character Creator</button>`;
	for (let i = 0; i < scenario_db.length; ++i) {
		let curr = scenario_db[i];
		let bcolor = curr.opmode == 1 ? "blue" : (curr.opmode == 2 ? "green" : (curr.opmode == 3 ? "red" : "yellow"));
		let entry = `<button type="button" name="` + i + `" class="scenarioitem ` + bcolor + ` btn btn-primary" onclick="return click_scenario(` + i
			+ `)">` + curr.title + `</button>`;
		scenarios += entry;
	}

	document.getElementById("scenariogrid").innerHTML = scenarios;
	document.getElementById("scenariodesc").innerHTML =
		`No Scenario Selected. Scroll down for more options.<br><br><a href="#" class="color_blueurl mainnav" onclick="hide_popups();document.getElementById('loadfileinput').click()">Alternatively, click [HERE] to load card from PNG file.</a>`;
	togglescenarioautopick();
}

function scenario_search() {
	let sgrid = document.getElementById("scenariogrid");
	let searchstr = document.getElementById("scenariosearch").value.trim().toLowerCase();
	let sdrop = document.getElementById("scenariosearchdropdown").value;
	let sgrid_nodes = sgrid.children;
	for (let i = 0; i < sgrid_nodes.length; i++) {
		let schild = sgrid_nodes[i];
		let elem = null;
		if (schild.name != "") {
			elem = scenario_db[schild.name];
		}
		if (searchstr == "" || schild.innerText.trim().toLowerCase().includes(searchstr)) {
			if (sdrop == 0 || (elem && sdrop == elem.opmode)) {
				schild.style.display = "block";
			} else {
				schild.style.display = "none";
			}
		} else {
			schild.style.display = "none";
		}
	}
}

function show_last_req() {
	let lr = "Request:\n" + last_request_str;
	if (last_response_obj != null) {
		lr += "\n\nResponse:\n" + JSON.stringify(last_response_obj);
	}
	msgbox(lr, "Last Request Info", false);
}
function show_last_logprobs() {
	let lastlogprobsstr = "";
	let kcpp_has_logprobs = last_response_obj != null && last_response_obj.results && last_response_obj.results.length > 0
		&& last_response_obj.results[0].logprobs != null;
	let oai_has_logprobs = last_response_obj != null && last_response_obj.choices && last_response_obj.choices.length > 0
		&& last_response_obj.choices[0].logprobs != null;
	if (kcpp_has_logprobs || oai_has_logprobs) {
		let lpc = kcpp_has_logprobs ? last_response_obj.results[0].logprobs.content : last_response_obj.choices[0].logprobs.content;
		if (!lpc) {
			if (oai_has_logprobs) {
				//try legacy logprobs api
				let seltokarr = last_response_obj.choices[0].logprobs.tokens;
				let sellogarr = last_response_obj.choices[0].logprobs.token_logprobs;
				let topdict = last_response_obj.choices[0].logprobs.top_logprobs;
				if (seltokarr && sellogarr && topdict) {
					lastlogprobsstr += `<table class="logprobstable">`;
					for (let i = 0; i < seltokarr.length; ++i) {
						lastlogprobsstr += "<tr>";
						lastlogprobsstr += `<td style="color:lime">${escape_html(seltokarr[i])}<br>(${
							(Math.exp(sellogarr[i]) * 100).toFixed(2)
						}%)</td>`;
						let addspace = false;
						let dictkeys = Object.keys(topdict[i]);
						for (let j = 0; j < 5; ++j) {
							if (j >= dictkeys.length) {
								lastlogprobsstr += `<td></td>`;
								continue;
							}
							if (dictkeys[j] == seltokarr[i]) {
								addspace = true;
								continue;
							}
							lastlogprobsstr += `<td>${escape_html(dictkeys[j])}<br>(${(Math.exp(topdict[i][dictkeys[j]]) * 100).toFixed(2)}%)</td>`;
						}
						if (addspace) {
							lastlogprobsstr += `<td></td>`;
						}
						lastlogprobsstr += "</tr>";
					}
					lastlogprobsstr += "</table>";
				}
			}
		} else {
			lastlogprobsstr += `<table class="logprobstable">`;
			for (let i = 0; i < lpc.length; ++i) {
				lastlogprobsstr += "<tr>";
				let cn = lpc[i];
				lastlogprobsstr += `<td style="color:lime">${escape_html(cn.token)}<br>(${(Math.exp(cn.logprob) * 100).toFixed(2)}%)</td>`;
				let addspace = false;
				for (let j = 0; j < 5; ++j) {
					if (j >= cn.top_logprobs.length) {
						lastlogprobsstr += `<td></td>`;
						continue;
					}
					if (cn.top_logprobs[j].token == cn.token) {
						addspace = true;
						continue;
					}
					lastlogprobsstr += `<td>${escape_html(cn.top_logprobs[j].token)}<br>(${
						(Math.exp(cn.top_logprobs[j].logprob) * 100).toFixed(2)
					}%)</td>`;
				}
				if (addspace) {
					lastlogprobsstr += `<td></td>`;
				}
				lastlogprobsstr += "</tr>";
			}
			lastlogprobsstr += "</table>";
		}
	} else {
		lastlogprobsstr = "Not Available";
	}
	msgbox(lastlogprobsstr, "Token Probability Viewer", true);
}

var worker_data_showonly = []; //only for table display, dont mix
//track worker earn rates
var first_seen_workers = {};
function track_kudos_earnings(wdata) {
	if (wdata && wdata.length > 0) {
		for (let i = 0; i < wdata.length; ++i) {
			let elem = wdata[i];
			if (elem && elem.id && !first_seen_workers.hasOwnProperty(elem.id)) {
				first_seen_workers[elem.id] = {
					startkudos: elem.kudos_rewards,
					timestamp: performance.now(),
				};
			}
		}
	}
}
function get_and_show_workers() {
	if (localflag) {
		return;
	}
	get_workers((wdata) => {
		worker_data_showonly = wdata;

		//preprocess the showonly data for extra fields
		for (var i = 0; i < worker_data_showonly.length; ++i) {
			let elem = worker_data_showonly[i];
			let tokenspersec = elem.performance.replace(" tokens per second", "");
			if (tokenspersec.toLowerCase() == "no requests fulfilled yet") {
				tokenspersec = 0;
			}
			worker_data_showonly[i].tokenspersec = parseFloat(tokenspersec);
			if (elem.models.length > 0) {
				worker_data_showonly[i].defaultmodel = elem.models[0];
			}
		}
		track_kudos_earnings(worker_data_showonly);

		show_workers();
	});
}
function get_workers(onDoneCallback) {
	if (localflag) {
		onDoneCallback([]);
		return;
	}
	if (cached_worker_list != null && cached_worker_list.length > 1 && performance.now() < stale_cached_worker_time) {
		console.log("Reuse cached worker list");
		onDoneCallback(cached_worker_list);
		return;
	}
	fetch(horde_worker_endpoint)
		.then(x => x.json())
		.then(data => {
			cached_worker_list = data;
			stale_cached_worker_time = performance.now() + 30000; //cache worker list for 30s
			if (onDoneCallback != null) {
				onDoneCallback(data);
			}
		}).catch((error) => {
			console.log("Error: " + error);
			msgbox("Failed to retrieve AI Horde Worker list!\nPlease check your network connection.");
		});
}

function worker_list_quick_search() {
	if (document.getElementById("workertable").innerHTML != "") {
		let searchstr = document.getElementById("workerlistquicksearch").value.toLowerCase();
		for (var i = 0; i < worker_data_showonly.length; ++i) {
			let elem = worker_data_showonly[i];
			let tablerow = document.getElementById("workertablerow_" + i);
			if (tablerow) {
				if (
					searchstr == "" || elem.name.toLowerCase().includes(searchstr)
					|| elem.models[0].toLowerCase().includes(searchstr)
				) {
					tablerow.style.display = "";
				} else {
					tablerow.style.display = "none";
				}
			}
		}
	}
}

var sortworkersdisplayasc = true;
var lastsortworkerkey = "";
function sort_display_workers(sortkey) {
	sortworkersdisplayasc = !sortworkersdisplayasc;
	if (lastsortworkerkey != sortkey) {
		sortworkersdisplayasc = true;
	}
	lastsortworkerkey = sortkey;
	worker_data_showonly.sort(function(a, b) {
		if (sortworkersdisplayasc) {
			if (a[sortkey] < b[sortkey]) return -1;
			if (a[sortkey] > b[sortkey]) return 1;
			return 0;
		} else {
			if (a[sortkey] < b[sortkey]) return 1;
			if (a[sortkey] > b[sortkey]) return -1;
			return 0;
		}
	});
	show_workers();
}

function show_workers() {
	document.getElementById("workercontainer").classList.remove("hidden");

	let str = "";
	let timenow = performance.now();
	for (var i = 0; i < worker_data_showonly.length; ++i) {
		let elem = worker_data_showonly[i];
		let tokenspersec = elem.performance.replace(" tokens per second", "");
		if (tokenspersec.toLowerCase() == "no requests fulfilled yet") {
			tokenspersec = 0;
		}
		let style = elem.trusted ? 'style="color:#dd77ff;"' : "";
		let brokenstyle = elem.maintenance_mode ? 'style="color:#ee4444;"' : "";
		let workerNameHtml = escape_html(elem.name.substring(0, 40));
		let clickinfo = "";
		if (elem.info && elem.info != "") {
			clickinfo += escape_html(replaceAll(elem.info, "'", "\\'"));
		}
		if (elem.threads > 1) {
			clickinfo += (clickinfo == "" ? "" : "<br><br>") + "Threads: " + elem.threads;
		}
		if (clickinfo != "") {
			workerNameHtml = '<a class="color_blueurl" href="#" onclick="msgbox(\'' + clickinfo + "','Worker Info',false,false,hide_msgbox)\">"
				+ workerNameHtml + "</a>";
		}
		let allmdls = "";
		for (let n = 0; n < elem.models.length; ++n) {
			if (n > 0) allmdls += "<br>";
			allmdls += escape_html(elem.models[n].substring(0, 40));
		}
		let kudos_per_hr = "";
		if (first_seen_workers.hasOwnProperty(elem.id)) {
			let firstseen = first_seen_workers[elem.id];
			let kudosdiff = elem.kudos_rewards - firstseen.startkudos;
			if (kudosdiff > 0) {
				var hrspassed = ((timenow - firstseen.timestamp) / 1000) / 3600.0; //time passed in sec
				kudos_per_hr = "(" + (kudosdiff / hrspassed).toFixed(0) + "/hr)";
			}
		}
		str += "<tr id='workertablerow_" + i + "'><td>" + workerNameHtml + "</td><td>" + allmdls + "</td><td>" + elem.max_length + " / "
			+ elem.max_context_length + "<br>(" + tokenspersec + " T/s)</td><td " + brokenstyle + ">" + format_uptime(elem.uptime) + "<br>("
			+ elem.requests_fulfilled + " jobs)</td><td " + style + ">" + elem.kudos_rewards.toFixed(0) + "<br><span style='color:gray'>"
			+ kudos_per_hr + "</span></td></tr>";
	}
	document.getElementById("workertable").innerHTML = str;
	document.getElementById("worktitlecount").innerText = "Worker List - Total " + worker_data_showonly.length;
}

function show_my_own_workers() {
	let userData = lastValidFoundUserData;
	lastValidFoundUserWorkers = [];
	if (userData && userData.worker_ids && userData.worker_ids.length > 0) {
		let urls = userData.worker_ids.map(x => horde_maintenance_endpoint + "/" + x);
		Promise.all(urls.map(url => fetch(url).then(response => response.json()).catch(error => error)))
			.then(values => {
				values = values.filter(n => (n.id && n.id != ""));
				lastValidFoundUserWorkers = values;
				console.log(lastValidFoundUserWorkers);

				document.getElementById("myownworkercontainer").classList.remove("hidden");

				let str = "";
				for (var i = 0; i < values.length; ++i) {
					let elem = values[i];
					let style = elem.trusted ? 'style="color:#dd77ff;"' : "";
					let brokenstyle = elem.maintenance_mode ? 'style="color:#ee4444;"' : "";
					let workerNameHtml = escape_html(elem.name.substring(0, 32));
					let eleminfo = (elem.info && elem.info != "") ? elem.info : "";
					str += "<tr><td>" + workerNameHtml + "</td><td><input class='' style='color:#000000;' id='mwc_desc_" + i
						+ "' placeholder='Worker Description' value='" + eleminfo + "''></td><td " + brokenstyle + ">" + format_uptime(elem.uptime)
						+ "<br>(" + elem.requests_fulfilled + " jobs)</td><td><span " + style + ">" + elem.kudos_rewards.toFixed(0) + "</span><br>"
						+ (elem.online ? "<span class='color_green'>Online</span>" : "Offline") + "</td><td><input type='checkbox' id='mwc_maint_" + i
						+ "' " + (elem.maintenance_mode ? "checked" : "")
						+ '></td><td><button type="button" class="btn redbtn widelbtn" onclick="delete_my_worker(' + i + ');">X</button></td></tr>';
				}
				document.getElementById("myownworkertable").innerHTML = str;

				//save my api key in case
				localsettings.my_api_key = document.getElementById("apikey").value;
				if (localsettings.my_api_key == null || localsettings.my_api_key == "") {
					localsettings.my_api_key = defaultsettings.my_api_key;
				}
				autosave();
			})
			.catch(error => {
				console.log("Error: " + error);
				msgbox(error, "Error fetching some workers", false, false);
			});
	} else {
		msgbox("Unable to find any horde workers.", "No valid workers found");
	}
}

function hide_workertable() {
	document.getElementById("workercontainer").classList.add("hidden");
	document.getElementById("myownworkercontainer").classList.add("hidden");
}

function is_aesthetic_ui() {
	return ((localsettings.gui_type_story == 1 || localsettings.gui_type_story == 2) && localsettings.opmode == 1)
		|| ((localsettings.gui_type_adventure == 1 || localsettings.gui_type_adventure == 2) && localsettings.opmode == 2)
		|| ((localsettings.gui_type_chat == 1 || localsettings.gui_type_chat == 2) && localsettings.opmode == 3)
		|| ((localsettings.gui_type_instruct == 1 || localsettings.gui_type_instruct == 2) && localsettings.opmode == 4);
}
function is_corpo_ui() {
	return (localsettings.gui_type_story == 3 && localsettings.opmode == 1)
		|| (localsettings.gui_type_adventure == 3 && localsettings.opmode == 2)
		|| (localsettings.gui_type_chat == 3 && localsettings.opmode == 3)
		|| (localsettings.gui_type_instruct == 3 && localsettings.opmode == 4);
}
function is_popup_open() {
	let context_and_settings_hidden = (
		document.getElementById("memorycontainer").classList.contains("hidden")
		&& document.getElementById("settingscontainer").classList.contains("hidden")
	) || localsettings.sidepanel_mode;

	return !(
		context_and_settings_hidden
		&& document.getElementById("inputboxcontainer").classList.contains("hidden")
		&& document.getElementById("saveloadcontainer").classList.contains("hidden")
		&& document.getElementById("newgamecontainer").classList.contains("hidden")
		&& document.getElementById("yesnocontainer").classList.contains("hidden")
		&& document.getElementById("msgboxcontainer").classList.contains("hidden")
		&& document.getElementById("workercontainer").classList.contains("hidden")
		&& document.getElementById("myownworkercontainer").classList.contains("hidden")
		&& document.getElementById("sharecontainer").classList.contains("hidden")
		&& document.getElementById("customendpointcontainer").classList.contains("hidden")
		&& document.getElementById("quickstartcontainer").classList.contains("hidden")
		&& document.getElementById("charactercreator").classList.contains("hidden")
		&& document.getElementById("zoomedimgcontainer").classList.contains("hidden")
		&& document.getElementById("groupselectcontainer").classList.contains("hidden")
		&& document.getElementById("addimgcontainer").classList.contains("hidden")
		&& document.getElementById("pasteimgcontainer").classList.contains("hidden")
		&& document.getElementById("webcamcontainer").classList.contains("hidden")
		&& document.getElementById("choosesharecontainer").classList.contains("hidden")
		&& document.getElementById("advancedloadfile").classList.contains("hidden")
		&& document.getElementById("welcomecontainer").classList.contains("hidden")
		&& document.getElementById("admincontainer").classList.contains("hidden")
	);
}

function mainmenu_untab(untab) {
	mainmenu_is_untab = untab;
	document.querySelectorAll(".mainnav").forEach(
		(el) => {
			el.setAttribute("tabindex", mainmenu_is_untab ? "-1" : "0");
		},
	);
}
function hide_popups() {
	if (!localsettings.sidepanel_mode) {
		document.getElementById("settingscontainer").classList.add("hidden");
		document.getElementById("memorycontainer").classList.add("hidden");
	}
	document.getElementById("saveloadcontainer").classList.add("hidden");
	document.getElementById("newgamecontainer").classList.add("hidden");
	document.getElementById("yesnocontainer").classList.add("hidden");
	document.getElementById("inputboxcontainer").classList.add("hidden");
	document.getElementById("msgboxcontainer").classList.add("hidden");
	document.getElementById("workercontainer").classList.add("hidden");
	document.getElementById("myownworkercontainer").classList.add("hidden");
	document.getElementById("sharecontainer").classList.add("hidden");
	document.getElementById("customendpointcontainer").classList.add("hidden");
	document.getElementById("quickstartcontainer").classList.add("hidden");
	document.getElementById("charactercreator").classList.add("hidden");
	document.getElementById("zoomedimgcontainer").classList.add("hidden");
	document.getElementById("groupselectcontainer").classList.add("hidden");
	document.getElementById("addimgcontainer").classList.add("hidden");
	document.getElementById("pasteimgcontainer").classList.add("hidden");
	document.getElementById("webcamcontainer").classList.add("hidden");
	document.getElementById("choosesharecontainer").classList.add("hidden");
	document.getElementById("advancedloadfile").classList.add("hidden");
	document.getElementById("welcomecontainer").classList.add("hidden");
	document.getElementById("admincontainer").classList.add("hidden");
	stop_webcam();
	mainmenu_untab(false);
}

function preview_dynatemp(isModifiedRange) {
	if (isModifiedRange) {
		let currtmp = parseFloat(document.getElementById("dynatemp_outtemp").value);
		let currrng = parseFloat(document.getElementById("dynatemp_range").value);
		let a1 = currtmp - currrng;
		let a2 = currtmp + currrng;
		a1 = a1 < 0 ? 0 : a1;
		a2 = a2 < 0 ? 0 : a2;
		document.getElementById("dynatemp_min").value = a1.toFixed(2);
		document.getElementById("dynatemp_max").value = a2.toFixed(2);
		document.getElementById("temperature").value = currtmp.toFixed(3);
		document.getElementById("temperature_slide").value = document.getElementById("temperature").value;
	} else {
		let a1 = parseFloat(document.getElementById("dynatemp_min").value);
		let a2 = parseFloat(document.getElementById("dynatemp_max").value);
		let avg = (a1 + a2) * 0.5;
		let diff = (a2 - a1) * 0.5;
		document.getElementById("dynatemp_range").value = diff.toFixed(3);
		document.getElementById("dynatemp_outtemp").value = avg.toFixed(3);
		document.getElementById("temperature").value = avg.toFixed(3);
		document.getElementById("temperature_slide").value = document.getElementById("temperature").value;
	}
}
function confirm_dynatemp() {
	document.getElementById("dynatempcontainer").classList.add("hidden");
	document.getElementById("dynatemp_overview").innerText = document.getElementById("dynatemp_range").value != 0 ? "ON" : "OFF";
}
function show_dynatemp() {
	let currtmp = parseFloat(document.getElementById("temperature").value);
	document.getElementById("dynatemp_outtemp").value = currtmp.toFixed(3);
	preview_dynatemp(true);
	document.getElementById("dynatempcontainer").classList.remove("hidden");
}

function explain_horde() {
	msgbox(
		"The AI Horde generates text using crowdsourced GPUs by volunteer workers. By default your inputs are not logged, but as Horde workers are open source, they can be modified to do so. <br><br>In all cases, the sender will *always be anonymous*, however you are still advised to avoid sending privacy sensitive information.<br>",
		"Disclaimer",
		true,
	);
}

function go_to_stableui() {
	window.open("./sdui", "_blank");
}

var pendinggrammar = "";
function selectGrammar() {
	inputBox(
		"Enter GBNF Grammar Format to use.\nLeave blank to disable.\n",
		"Set GBNF Grammar Format",
		pendinggrammar,
		"",
		() => {
			let userinput = getInputBoxValue().trim();
			pendinggrammar = userinput;
			console.log("Saved grammar: " + pendinggrammar);
		},
		false,
		true,
	);
}

var pendingsequencebreakers = [];
function setDryBreakers() {
	let breakersString = pendingsequencebreakers.map((x) => x.replace("\n", "\\n")).join("\n");
	inputBox(
		"Enter each sequence breaker on a separate line.\nUse \\n for a newline token.\n",
		"Set DRY Sequence Breakers",
		breakersString,
		"",
		() => {
			let userinput = getInputBoxValue();
			pendingsequencebreakers = userinput.split("\n").filter(Boolean).map((x) => x.replace("\\n", "\n"));
			console.log("Sequence breakers: " + pendingsequencebreakers.map((x) => x.replace("\n", "\\n")));
		},
		false,
		true,
	);
}

var pendingassistantjailbreak = "";
function set_assistant_jailbreak() {
	inputBox(
		"Set Assistant Jailbreak",
		"Enter Assistant Jailbreak Prefix",
		pendingassistantjailbreak,
		"(Enter Jailbreak Prefix)",
		() => {
			let userinput = getInputBoxValue();
			if (userinput.trim() == "") {
				userinput = "Sure, I will help with that:\\n\\n";
			}
			pendingassistantjailbreak = userinput;
		},
		false,
		false,
	);
}

function expand_tokens_section(targetid) {
	let tablist = ["expandregexreplace", "expandthinking", "expandtokenbans", "expandlogitbias", "expandplaceholdertags", "expandguidance"];

	for (let i = 0; i < tablist.length; ++i) {
		if (tablist[i] != targetid) {
			document.getElementById(tablist[i]).classList.add("hidden");
		}
	}

	if (targetid != "") {
		if (document.getElementById(targetid).classList.contains("hidden")) {
			document.getElementById(targetid).classList.remove("hidden");
		} else {
			document.getElementById(targetid).classList.add("hidden");
		}
	}
}

function add_logit_bias() {
	let key = document.getElementById("newlogitbiasid").value;
	let val = document.getElementById("newlogitbiasval").value;
	if (document.getElementById("newlogitbiasstringtoggle").checked) {
		key = document.getElementById("newlogitbiasstring").value;
	}
	if (key && val && key.trim() != "" && val.trim() != "") {
		let old = document.getElementById("logitbiastxtarea").value;
		if (old.trim() == "") {
			old = "{}";
		}
		if (document.getElementById("newlogitbiasstringtoggle").checked) {
			kcpp_tokenize(key, (tokarr) => {
				try {
					if (tokarr && tokarr.length > 0 && !isNaN(val)) {
						let dict = JSON.parse(old);
						for (let x = 0; x < tokarr.length; ++x) {
							key = parseInt(tokarr[x]);
							val = parseInt(val);
							if (!isNaN(key)) {
								dict[key] = parseInt(val);
							}
						}
						document.getElementById("logitbiastxtarea").value = JSON.stringify(dict, null, 2);
					}
				} catch (e) {
					msgbox("Your inputs or logit bias JSON dictionary was not correctly formatted!");
				}
			});
		} else {
			try {
				let dict = JSON.parse(old);
				key = parseInt(key);
				val = parseInt(val);
				if (!isNaN(key) && !isNaN(val)) {
					dict[key] = parseInt(val);
					document.getElementById("logitbiastxtarea").value = JSON.stringify(dict, null, 2);
				}
			} catch (e) {
				msgbox("Your inputs or logit bias JSON dictionary was not correctly formatted!");
			}
		}

		document.getElementById("newlogitbiasid").value = "";
		document.getElementById("newlogitbiasstring").value = "";
		document.getElementById("newlogitbiasval").value = "";
	}
}

function add_stop_seq() {
	inputBox("Enter a new stopping sequence to be added.", "Add Stop Sequence", "", "Enter a Stop Sequence", () => {
		let userinput = getInputBoxValue();
		if (userinput.trim() != "") {
			let ov = document.getElementById("extrastopseq").value;
			if (ov != "") {
				ov += "||$||";
			}
			ov += userinput.trim();
			document.getElementById("extrastopseq").value = ov;
		}
	}, false);
}

function add_token_ban() {
	inputBox(
		"Enter a string to be banned (e.g. Slop text to remove). If it's generated, the AI will try something else. Work for both individual words or long phrases, not case-sensitive. All substring matches will be prevented.\nFor example adding 'ice bag' will also ban 'nice bag' and 'rice bag'.",
		"Add Banned String",
		"",
		"Enter String To Ban",
		() => {
			let userinput = getInputBoxValue();
			if (userinput.trim() != "") {
				let ov = document.getElementById("tokenbans").value;
				if (ov != "") {
					ov += "||$||";
				}
				ov += userinput.trim();
				document.getElementById("tokenbans").value = ov;
			}
		},
		false,
	);
}

var toastTimeout = null;
function showToast(text, duration = 2000) //simple disappearing message. set to empty string to hide
{
	if (text == "") {
		clearTimeout(toastTimeout);
		document.getElementById("toptoast").classList.add("hidden");
		return;
	}
	document.getElementById("toptoast").classList.remove("hidden");
	document.getElementById("toptoast").innerText = text;
	clearTimeout(toastTimeout);
	toastTimeout = setTimeout(() => {
		document.getElementById("toptoast").classList.add("hidden");
	}, duration);
}

var msgboxOnDone = hide_msgbox;
function hide_msgbox() {
	//hide msgbox ONLY
	document.getElementById("msgboxcontainer").classList.add("hidden");
}
function msgbox(text, title = "Error Encountered", isHtml = false, noBtn = false, onDoneFn = null) {
	if (!text) text = "";
	if (isHtml) {
		document.getElementById("msgboxtxt").innerHTML = text;
	} else {
		document.getElementById("msgboxtxt").innerText = text;
	}

	document.getElementById("msgboxtitle").innerText = title;
	document.getElementById("msgboxcontainer").classList.remove("hidden");
	if (noBtn == true) {
		document.getElementById("msgboxbtnok").classList.add("hidden");
	} else {
		document.getElementById("msgboxbtnok").classList.remove("hidden");
	}
	msgboxOnDone = () => {
		hide_msgbox();
		if (onDoneFn) onDoneFn();
	};
	console.log("Msgbox: " + text);
}

var onYesFn = null;
var onNoFn = null;
var msgboxYesNoChecked = false;
function msgboxYesNo(text, title, onYes, onNo, isHtml = false, checkboxText = "") {
	if (!text) text = "";
	document.getElementById("yesnocontainer").classList.remove("hidden");
	document.getElementById("yesnocontainertitle").innerText = title;
	if (isHtml) {
		document.getElementById("yesnocontainertext").innerHTML = text;
	} else {
		document.getElementById("yesnocontainertext").innerText = text;
	}
	if (checkboxText == "") {
		document.getElementById("yesnocontainercheckboxdiv").classList.add("hidden");
	} else {
		document.getElementById("yesnocontainercheckboxdiv").classList.remove("hidden");
		document.getElementById("yesnocontainercheckboxtext").innerText = checkboxText;
		document.getElementById("yesnocontainercheckbox").checked = true;
	}
	onYesFn = () => {
		document.getElementById("yesnocontainer").classList.add("hidden");
		msgboxYesNoChecked = document.getElementById("yesnocontainercheckbox").checked;
		if (onYes != null) onYes();
	};
	onNoFn = () => {
		document.getElementById("yesnocontainer").classList.add("hidden");
		msgboxYesNoChecked = document.getElementById("yesnocontainercheckbox").checked;
		if (onNo != null) onNo();
	};
}

var onInputboxOk = null;
var onInputboxCancel = null;
var inputboxIsPassword = false;
// Note: `isPassword` is ignored when `isTextArea` is true
function inputBox(text, title, inputVal, inputPlaceholder, onDone, isHtml = false, isTextArea = false, isPassword = false) {
	inputboxIsPassword = false;
	if (!text) text = "";
	if (!title) title = "User Input";
	document.getElementById("inputboxcontainer").classList.remove("hidden");
	document.getElementById("inputboxcontainertitle").innerText = title;
	if (isHtml) {
		document.getElementById("inputboxcontainertext").innerHTML = text;
	} else {
		document.getElementById("inputboxcontainertext").innerText = text;
	}
	if (isTextArea) {
		document.getElementById("inputboxcontainerinput").classList.add("hidden");
		document.getElementById("inputboxcontainerinputarea").classList.remove("hidden");
		document.getElementById("inputboxcontainerinputarea").value = inputVal;
		document.getElementById("inputboxcontainerinputarea").placeholder = escape_html(inputPlaceholder);
	} else {
		document.getElementById("inputboxcontainerinput").classList.remove("hidden");
		document.getElementById("inputboxcontainerinputarea").classList.add("hidden");
		document.getElementById("inputboxcontainerinput").value = inputVal;
		document.getElementById("inputboxcontainerinput").placeholder = escape_html(inputPlaceholder);
		if (isPassword) {
			inputboxIsPassword = true;
		}
	}
	inputboxblur();
	onInputboxOk = function() {
		document.getElementById("inputboxcontainer").classList.add("hidden");
		onDone();
	};
	onInputboxCancel = null;
	document.getElementById("inputboxcancel").classList.add("hidden");
}
function inputBoxOkCancel(text, title, inputVal, inputPlaceholder, onDone, onCancel, isHtml = false, isTextArea = false) {
	inputBox(text, title, inputVal, inputPlaceholder, onDone, isHtml, isTextArea);
	document.getElementById("inputboxcancel").classList.remove("hidden");
	onInputboxCancel = function() {
		document.getElementById("inputboxcontainer").classList.add("hidden");
		onCancel();
	};
}
function getInputBoxValue() {
	if (document.getElementById("inputboxcontainerinputarea").classList.contains("hidden")) {
		return document.getElementById("inputboxcontainerinput").value;
	} else {
		return document.getElementById("inputboxcontainerinputarea").value;
	}
}

function toggle_manual_horde_worker() {
	let tmpkey = document.getElementById("apikey").value;
	display_horde_models();
	document.getElementById("apikey").value = tmpkey;
}

function togglejailbreak() {
	if (localsettings.saved_oai_jailbreak == "") {
		document.getElementById("jailbreakprompttext").value = defaultoaijailbreak;
	} else {
		document.getElementById("jailbreakprompttext").value = localsettings.saved_oai_jailbreak;
	}
	if (document.getElementById("jailbreakprompt").checked) {
		document.getElementById("oaijailbreakpromptblock1").classList.remove("hidden");
	} else {
		document.getElementById("oaijailbreakpromptblock1").classList.add("hidden");
	}
}
function togglejailbreak2() {
	if (localsettings.saved_oai_jailbreak2 == "") {
		document.getElementById("jailbreakprompttext2").value = defaultoaipostfix;
	} else {
		document.getElementById("jailbreakprompttext2").value = localsettings.saved_oai_jailbreak2;
	}
	if (document.getElementById("jailbreakprompt2").checked) {
		document.getElementById("oaijailbreakpromptblock2").classList.remove("hidden");
	} else {
		document.getElementById("oaijailbreakpromptblock2").classList.add("hidden");
	}
}
function toggleoaichatcompl() {
	document.getElementById("oaiemulatecompletionsbox").classList.add("hidden");
	if (document.getElementById("useoaichatcompl").checked) {
		document.getElementById("useoaichatcomplbox").classList.remove("hidden");
		if (localsettings.saved_oai_role != null) {
			document.getElementById("oairoledropdown").value = localsettings.saved_oai_role;
		}
		if (document.getElementById("customapidropdown").value == 7) { //mistral api supports prefill
			document.getElementById("oaiemulatecompletionsbox").classList.remove("hidden");
		}
	} else {
		document.getElementById("useoaichatcomplbox").classList.add("hidden");
	}

	togglejailbreak();
	togglejailbreak2();
}

function togglecoherepreamble() {
	if (localsettings.saved_cohere_preamble == "") {
		document.getElementById("cohere_preamble").value = "";
	} else {
		document.getElementById("cohere_preamble").value = localsettings.saved_cohere_preamble;
	}

	if (document.getElementById("useocoherepreamble").checked) {
		document.getElementById("useocoherepreamblebox").classList.remove("hidden");
	} else {
		document.getElementById("useocoherepreamblebox").classList.add("hidden");
	}
}

function togglegeminimodel() {
	let mdlname = document.getElementById("custom_gemini_model").value;
	if (mdlname.includes("gemini-2") || mdlname.includes("gemini-1.5-") || mdlname.includes("gemini-exp-")) {
		document.getElementById("gemini_system_instruction").classList.remove("hidden");
		document.getElementById("gemini_role_options").classList.remove("hidden");
		if (localsettings.saved_palm_jailbreak == "") {
			document.getElementById("gemini_system_instruction").value = "";
		} else {
			document.getElementById("gemini_system_instruction").value = localsettings.saved_palm_jailbreak;
		}
		if (localsettings.saved_palm_jailbreak2 == "") {
			document.getElementById("gemini_postfix_text").value = "";
		} else {
			document.getElementById("gemini_postfix_text").value = localsettings.saved_palm_jailbreak2;
		}
		togglegeminirole();
	} else {
		document.getElementById("gemini_system_instruction").classList.add("hidden");
		document.getElementById("gemini_role_options").classList.add("hidden");
	}
}
function togglegeminirole() {
	let sentrole = document.getElementById("geminiroledropdown").value;
	if (sentrole == "") {
		document.getElementById("gemini_role_options2").classList.add("hidden");
	} else {
		document.getElementById("gemini_role_options2").classList.remove("hidden");
	}
}

function get_custom_ep_model_dropdown(ep_id = null) //if desired id not provided, use dynamic val
{
	let ddval = ep_id ? ep_id.toString() : document.getElementById("customapidropdown").value;
	switch (ddval) {
		case "0": //horde
			return document.getElementById("custom_oai_model"); //just return oai
		case "1": //kai
			return document.getElementById("custom_oai_model"); //just return oai
		case "2":
			return document.getElementById("custom_oai_model");
		case "3":
			return document.getElementById("custom_openrouter_model");
		case "4":
			return document.getElementById("custom_claude_model");
		case "5":
			return document.getElementById("custom_gemini_model");
		case "6":
			return document.getElementById("custom_cohere_model");
		case "7":
			return document.getElementById("custom_mistralai_model");
		case "8":
			return document.getElementById("custom_featherless_model");
		case "9":
			return document.getElementById("custom_grok_model");
		case "10":
			return document.getElementById("custom_pollinations_model");
		default:
			return document.getElementById("custom_oai_model"); //just return oai
	}
}
function ep_should_always_use_chat_completions() {
	let epchoice = document.getElementById("customapidropdown").value;
	return (epchoice == 7 || epchoice == 10);
}

function select_custom_oai_model() {
	inputBox("Enter custom model name", "Custom Model Name", localsettings.saved_oai_custommodel, "", () => {
		let coai = getInputBoxValue().trim();
		let dropdown = get_custom_ep_model_dropdown();
		var mdlopt = dropdown.querySelector("option.custom_model_option");
		if (coai != "") {
			mdlopt.value = coai;
			mdlopt.innerText = coai;
			mdlopt.style.display = "";
			dropdown.selectedIndex = dropdown.options.length - 1;
		}
		oai_model_change(ep_should_always_use_chat_completions());
	}, false);
}
function oai_model_change(autotoggle_check = false) {
	let dropdown = get_custom_ep_model_dropdown();
	let non_completions = dropdown.value.includes("davinci-002") || dropdown.value.includes("text-davinci-003")
		|| dropdown.value.includes("text-davinci-002")
		|| dropdown.value.includes("text-davinci-001") || dropdown.value.includes("gpt-3.5-turbo-instruct") || dropdown.value == "davinci";
	if (autotoggle_check) {
		if (ep_should_always_use_chat_completions() || dropdown.selectedIndex == dropdown.options.length - 1) {
			document.getElementById("useoaichatcompl").checked = true;
		} else if (document.getElementById("custom_oai_endpoint").value.toLowerCase().includes("featherless.ai")) {
			document.getElementById("useoaichatcompl").checked = false; //use completions for a better experience
		} else {
			document.getElementById("useoaichatcompl").checked = !non_completions;
		}
	}
	toggleoaichatcompl();
}
function claude_fetch_models() {
	let desired_claude_key = document.getElementById("custom_claude_key").value.trim();
	let claude_ep = document.getElementById("custom_claude_endpoint").value.trim();
	if (claude_ep.toLowerCase().includes("api.anthropic.com")) {
		//official API has broken cors settings
		claude_ep = apply_proxy_url(claude_ep, true);
	}
	if (desired_claude_key == "") {
		msgbox("Claude requires an API key to fetch model list!");
		return;
	}

	let dropdown = document.getElementById("custom_claude_model");
	fetch(claude_ep + claude_models_endpoint, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"anthropic-version": "2023-06-01",
			"x-api-key": desired_claude_key,
		},
		referrerPolicy: "no-referrer",
	})
		.then((response) => response.json())
		.then((data) => {
			console.log(data);
			if (data && data.data && data.data.length > 0) {
				for (var i = dropdown.options.length - 1; i >= 0; i--) {
					var option = dropdown.options[i];
					dropdown.remove(option);
				}
				let selidx = 0;
				for (var i = 0; i < data.data.length; i++) {
					var opt = data.data[i];
					var el = document.createElement("option");
					let optname = opt.id;
					el.textContent = optname;
					el.value = optname;
					dropdown.appendChild(el);
				}
				dropdown.selectedIndex = selidx;
				togglegeminimodel();
			} else {
				let errmsg = "";
				if (data && data.error) {
					errmsg = data.error;
				} else {
					errmsg = data;
				}
				msgbox(JSON.stringify(errmsg), "Error Encountered", false, false);
			}
		})
		.catch(error => {
			console.log("Error: " + error);
			msgbox("Error: " + error, "Error Encountered", false, false, () => {
				hide_msgbox();
			});
		});
}
function gemini_fetch_models() {
	let desired_gemini_key = document.getElementById("custom_gemini_key").value.trim();
	if (desired_gemini_key == "") {
		msgbox("Gemini requires an API key to fetch model list!");
		return;
	}

	let dropdown = document.getElementById("custom_gemini_model");
	fetch(default_gemini_base + "?key=" + desired_gemini_key, {
		method: "GET",
		referrerPolicy: "no-referrer",
	})
		.then((response) => response.json())
		.then((data) => {
			console.log(data);
			if (data && data.models && data.models.length > 0) {
				for (var i = dropdown.options.length - 1; i >= 0; i--) {
					var option = dropdown.options[i];
					dropdown.remove(option);
				}
				let selidx = 0;
				for (var i = 0; i < data.models.length; i++) {
					var opt = data.models[i];
					var el = document.createElement("option");
					let optname = opt.name;
					if (optname.toLowerCase().startsWith("models/")) {
						optname = optname.substring(7);
					}
					el.textContent = optname;
					el.value = optname;
					dropdown.appendChild(el);
				}
				dropdown.selectedIndex = selidx;
				togglegeminimodel();
			} else {
				let errmsg = "";
				if (data && data.error) {
					errmsg = data.error;
				} else {
					errmsg = data;
				}
				msgbox(JSON.stringify(errmsg), "Error Encountered", false, false);
			}
		})
		.catch(error => {
			console.log("Error: " + error);
			msgbox("Error: " + error, "Error Encountered", false, false, () => {
				hide_msgbox();
			});
		});
}
function oai_fetch_models() {
	let desired_oai_key = document.getElementById("custom_oai_key").value.trim();
	let desired_oai_ep = document.getElementById("custom_oai_endpoint").value.trim();
	desired_oai_ep = transform_oai_ep(desired_oai_ep);

	let oaiheaders = {};
	if (desired_oai_key != "") {
		oaiheaders["Authorization"] = "Bearer " + desired_oai_key;
	}
	if (desired_oai_ep.toLowerCase().includes("api.mistral.ai")) {
		if (desired_oai_key == "") {
			msgbox("MistralAI API requires an API key to fetch model list!");
			return;
		}
	}

	let isOpenrouter = document.getElementById("customapidropdown").value == 3;
	let dropdown = get_custom_ep_model_dropdown();
	fetch(desired_oai_ep + oai_models_endpoint, {
		method: "GET",
		headers: oaiheaders,
		referrerPolicy: "no-referrer",
	})
		.then((response) => response.json())
		.then((data) => {
			console.log(data);

			//hack for together.xyz
			if (data != null && data.data == null && data.length > 0 && data[0] && data[0].id && data[0].id != "") {
				console.log("together.xyz workaround hack");
				data = { data: data }; //fix for their bad format
			}

			if (!data.error && data.data && data.data.length > 0) {
				var lastOption = dropdown.lastElementChild;
				for (var i = dropdown.options.length - 1; i >= 0; i--) {
					var option = dropdown.options[i];
					dropdown.remove(option);
				}
				let selidx = 0;
				let sortedarr = [];
				for (var i = 0; i < data.data.length; i++) {
					var opt = data.data[i];
					sortedarr.push(opt.id);
				}
				sortedarr.sort();
				for (var i = 0; i < sortedarr.length; ++i) {
					var el = document.createElement("option");
					el.textContent = sortedarr[i];
					el.value = sortedarr[i];
					if (isOpenrouter && sortedarr[i] == "mistralai/mistral-7b-instruct") {
						selidx = i;
					}
					dropdown.appendChild(el);
				}
				dropdown.appendChild(lastOption);
				dropdown.selectedIndex = selidx;
				oai_model_change(true);
			} else {
				let errmsg = "";
				if (data && data.error && data.error.message) {
					errmsg = data.error.message;
				} else if (data && data.error) {
					errmsg = data.error;
				} else {
					errmsg = data;
				}
				msgbox(JSON.stringify(errmsg), "Error Encountered", false, false);
			}
		})
		.catch(error => {
			console.log("Error: " + error);
			msgbox("Error: " + error, "Error Encountered", false, false, () => {
				hide_msgbox();
			});
		});
}

function toggleclaudemodel() {
	if (
		document.getElementById("custom_claude_model").value.toLowerCase().includes("claude-3")
		|| document.getElementById("custom_claude_model").value.toLowerCase().includes("claude-sonnet-4")
		|| document.getElementById("custom_claude_model").value.toLowerCase().includes("claude-opus-4")
	) {
		document.getElementById("claudesystemprompt").classList.remove("hidden");
		document.getElementById("claudejailbreakprompt").classList.remove("hidden");
		document.getElementById("clauderenamecompatdiv").classList.add("hidden");
	} else {
		document.getElementById("claudesystemprompt").classList.add("hidden");
		document.getElementById("claudejailbreakprompt").classList.add("hidden");
		document.getElementById("clauderenamecompatdiv").classList.remove("hidden");
	}
	if (
		document.getElementById("custom_claude_model").value.toLowerCase().includes("claude-3-7")
		|| document.getElementById("custom_claude_model").value.toLowerCase().includes("claude-sonnet-4")
		|| document.getElementById("custom_claude_model").value.toLowerCase().includes("claude-opus-4")
	) {
		document.getElementById("claudethinkingbox").classList.remove("hidden");
	} else {
		document.getElementById("claudethinkingbox").classList.add("hidden");
	}
}

let openrouter_fetch_attempted = false;
let oai_custom_fetch_attempted = false;
function try_fetch_oai_models_auto() {
	//only for apis that don't gate the model list
	if (
		document.getElementById("custom_oai_endpoint").value != ""
		&& document.getElementById("custom_oai_endpoint").value.toLowerCase().includes("featherless.ai")
	) {
		if (!oai_custom_fetch_attempted) {
			oai_custom_fetch_attempted = true;
			let dropdown = document.getElementById("custom_oai_model");
			if (dropdown.options.length < 40) {
				oai_fetch_models(); //autofetch models
			}
		}
	}
}
function customapi_dropdown(force_autotoggle_chatcompl = false) {
	let epchoice = document.getElementById("customapidropdown").value;
	document.getElementById("oaicustom").classList.add("hidden");
	document.getElementById("koboldcustom").classList.add("hidden");
	document.getElementById("claudecustom").classList.add("hidden");
	document.getElementById("geminicustom").classList.add("hidden");
	document.getElementById("custom_oai_model").classList.add("hidden");
	document.getElementById("custom_openrouter_model").classList.add("hidden");
	document.getElementById("custom_mistralai_model").classList.add("hidden");
	document.getElementById("custom_featherless_model").classList.add("hidden");
	document.getElementById("custom_grok_model").classList.add("hidden");
	document.getElementById("custom_pollinations_model").classList.add("hidden");
	document.getElementById("hordeloadmodelcontainer").classList.add("hidden");
	document.getElementById("coherecustom").classList.add("hidden");

	if (epchoice == 0) {
		document.getElementById("hordeloadmodelcontainer").classList.remove("hidden");
		display_horde_models();
	} else if (epchoice == 1) {
		document.getElementById("koboldcustom").classList.remove("hidden");
		if (!localflag) {
			document.getElementById("customkoboldendpoint").value = localsettings.saved_kai_addr;
			document.getElementById("customkoboldkey").value = localsettings.saved_kai_key;
		}
	} else if (epchoice == 2 || epchoice == 3 || epchoice == 7 || epchoice == 8 || epchoice == 9 || epchoice == 10) {
		document.getElementById("oaicustom").classList.remove("hidden");
		document.getElementById("custom_oai_endpoint").classList.add("hidden");
		document.getElementById("custom_oai_key").classList.remove("hidden");
		document.getElementById("openrouterdesc").classList.add("hidden");
		document.getElementById("mistralaidesc").classList.add("hidden");
		document.getElementById("featherlessdesc").classList.add("hidden");
		document.getElementById("grokdesc").classList.add("hidden");
		document.getElementById("oaidesc").classList.add("hidden");
		document.getElementById("pollinationsdesc").classList.add("hidden");
		document.getElementById("openrouterproviderbox").classList.add("hidden");
		if (epchoice == 2) {
			document.getElementById("oaidesc").classList.remove("hidden");
			document.getElementById("custom_oai_model").classList.remove("hidden");
			document.getElementById("custom_oai_endpoint").classList.remove("hidden");
			document.getElementById("custom_oai_key").value = localsettings.saved_oai_key;
			if (localflag) {
				document.getElementById("custom_oai_endpoint").value = localprotocol + localmodehost + ":" + localmodeport + "/v1";
			} else {
				document.getElementById("custom_oai_endpoint").value = localsettings.saved_oai_addr ? localsettings.saved_oai_addr : default_oai_base;
			}
			try_fetch_oai_models_auto();
		} else if (epchoice == 7) {
			document.getElementById("custom_mistralai_model").classList.remove("hidden");
			document.getElementById("mistralaidesc").classList.remove("hidden");
			document.getElementById("custom_oai_key").value = localsettings.saved_mistralai_key;
			document.getElementById("custom_oai_endpoint").value = default_mistralai_base;
		} else if (epchoice == 8) {
			document.getElementById("custom_featherless_model").classList.remove("hidden");
			document.getElementById("featherlessdesc").classList.remove("hidden");
			document.getElementById("custom_oai_key").value = localsettings.saved_featherless_key;
			document.getElementById("custom_oai_endpoint").value = default_featherless_base;
			try_fetch_oai_models_auto();
		} else if (epchoice == 9) {
			document.getElementById("custom_grok_model").classList.remove("hidden");
			document.getElementById("grokdesc").classList.remove("hidden");
			document.getElementById("custom_oai_key").value = localsettings.saved_grok_key;
			document.getElementById("custom_oai_endpoint").value = default_grok_base;
		} else if (epchoice == 10) {
			document.getElementById("custom_pollinations_model").classList.remove("hidden");
			document.getElementById("pollinationsdesc").classList.remove("hidden");
			document.getElementById("custom_oai_key").value = dummy_pollinations_key;
			document.getElementById("custom_oai_endpoint").value = pollinations_text_endpoint;
			document.getElementById("custom_oai_key").classList.add("hidden");
		} //openrouter supports autofetch
		else {
			document.getElementById("openrouterdesc").classList.remove("hidden");
			document.getElementById("custom_openrouter_model").classList.remove("hidden");
			document.getElementById("openrouterproviderbox").classList.remove("hidden");
			document.getElementById("custom_oai_endpoint").value = default_openrouter_base;
			document.getElementById("custom_oai_key").value = localsettings.saved_openrouter_key;
			if (!openrouter_fetch_attempted) {
				openrouter_fetch_attempted = true;
				let dropdown = document.getElementById("custom_openrouter_model");
				if (dropdown.options.length < 10) {
					oai_fetch_models(); //autofetch openrouter models
				}
			}
		}
		oai_model_change(ep_should_always_use_chat_completions() || force_autotoggle_chatcompl);
		toggleoaichatcompl();
	} else if (epchoice == 4) {
		toggleclaudemodel();
		document.getElementById("claudecustom").classList.remove("hidden");
		document.getElementById("custom_claude_key").value = localsettings.saved_claude_key;
		document.getElementById("custom_claude_endpoint").value = localsettings.saved_claude_addr
			? localsettings.saved_claude_addr
			: default_claude_base;
		document.getElementById("claudesystemprompt").value = localsettings.saved_claude_jailbreak;
		document.getElementById("claudejailbreakprompt").value = localsettings.saved_claude_jailbreak2;
	} else if (epchoice == 5) {
		document.getElementById("geminicustom").classList.remove("hidden");
		document.getElementById("custom_gemini_key").value = localsettings.saved_palm_key;
		document.getElementById("gemini_system_instruction").value = localsettings.saved_palm_jailbreak;
		document.getElementById("gemini_postfix_text").value = localsettings.saved_palm_jailbreak2;
		togglegeminimodel();
	} else if (epchoice == 6) {
		document.getElementById("coherecustom").classList.remove("hidden");
		document.getElementById("custom_cohere_key").value = localsettings.saved_cohere_key;
		document.getElementById("cohere_preamble").value = localsettings.saved_cohere_preamble;
		togglecoherepreamble();
	}
}

var allow_update_kobold_model_display_timestamp = performance.now() + 60000;
function update_custom_kobold_endpoint_model_display(forceupdate = false) {
	if (custom_kobold_endpoint != "" && selected_workers.length == 0 && selected_models.length == 1) {
		if (forceupdate || performance.now() >= allow_update_kobold_model_display_timestamp) {
			allow_update_kobold_model_display_timestamp = performance.now() + 60000;
			console.log("Updating selected model name...");
			let murl = apply_proxy_url(custom_kobold_endpoint + kobold_custom_mdl_endpoint);
			fetch(murl, {
				method: "GET",
				headers: get_kobold_header(),
			})
				.then(x => x.json())
				.then(values => {
					if (custom_kobold_endpoint != "" && values && values.result != "") {
						let mdlname = values.result;
						selected_models = [{ performance: 100.0, queued: 0.0, eta: 0, name: mdlname, count: 1 }];
						selected_workers = [];
						console.log("Updating selected model name done.");
						if (forceupdate) {
							render_gametext(false);
						}
					}
				})
				.catch(error => {
					console.log("Update Kobold Model Error: " + error);
				});
		}
	}
}

function transform_oai_ep(desired_oai_ep) {
	if (desired_oai_ep != "") {
		desired_oai_ep = desired_oai_ep.trim();
	}
	if (desired_oai_ep != "" && desired_oai_ep.slice(-1) == "/") {
		desired_oai_ep = desired_oai_ep.slice(0, -1);
	}
	if (!desired_oai_ep.includes("://")) { //user did not add http/https
		let is_local = is_local_url(desired_oai_ep);
		desired_oai_ep = (is_local ? "http://" : "https://") + desired_oai_ep;
	}
	if (document.getElementById("oaiaddversion").checked && !desired_oai_ep.toLowerCase().includes("text.pollinations.ai")) {
		//fix incorrect paths
		if (desired_oai_ep != "" && desired_oai_ep.toLowerCase().endsWith("/chat/completions")) {
			desired_oai_ep = desired_oai_ep.slice(0, -17);
		}
		if (
			desired_oai_ep != "" && desired_oai_ep.length > 4 && !desired_oai_ep.slice(-4).toLowerCase().includes("/v")
			&& !desired_oai_ep.toLowerCase().includes("/v1/")
		) {
			desired_oai_ep = desired_oai_ep + "/v1";
		}
	}
	//fix common url typos if detected
	if (desired_oai_ep != "" && desired_oai_ep.toLowerCase().startsWith("https://featherless.ai")) {
		desired_oai_ep = desired_oai_ep.replace("https://featherless.ai", "https://api.featherless.ai");
	}
	return desired_oai_ep;
}

function connect_custom_endpoint() {
	mainmenu_untab(false);
	custom_kobold_endpoint = "";
	custom_kobold_key = "";
	custom_oai_key = "";
	custom_claude_key = "";
	custom_gemini_key = "";
	custom_cohere_key = "";

	let epchoice = document.getElementById("customapidropdown").value;
	document.getElementById("connectstatusproxied").classList.add("hidden");
	document.getElementById("connectstatus").innerHTML = "Connecting";

	if (epchoice == 0) { //ai horde
		confirm_horde_models();
	} else if (epchoice == 1) { //connect to kobold endpoint
		let desiredkoboldendpoint = document.getElementById("customkoboldendpoint").value;
		let desiredkoboldkey = document.getElementById("customkoboldkey").value;

		if (desiredkoboldendpoint != null && desiredkoboldendpoint.trim() != "") {
			dismiss_endpoint_container();
			desiredkoboldendpoint = desiredkoboldendpoint.trim();

			//remove trailing slash and pound
			desiredkoboldendpoint = desiredkoboldendpoint.endsWith("#") ? desiredkoboldendpoint.slice(0, -1) : desiredkoboldendpoint;
			desiredkoboldendpoint = desiredkoboldendpoint.endsWith("/") ? desiredkoboldendpoint.slice(0, -1) : desiredkoboldendpoint;

			if (desiredkoboldendpoint != "" && (desiredkoboldendpoint.trim().endsWith("/api") || desiredkoboldendpoint.trim().endsWith("/api/v1"))) {
				desiredkoboldendpoint = desiredkoboldendpoint.split("/api")[0];
			}
			if (!desiredkoboldendpoint.includes("://")) { //user did not add http/https
				let is_local = is_local_url(desiredkoboldendpoint);
				desiredkoboldendpoint = (is_local ? "http://" : "https://") + desiredkoboldendpoint;
			}

			//we shall predictively set the url first, which can be overwritten
			custom_kobold_endpoint = desiredkoboldendpoint;
			custom_kobold_key = desiredkoboldkey;

			let fetchedurl = apply_proxy_url(desiredkoboldendpoint + kobold_custom_mdl_endpoint);

			fetch(fetchedurl, {
				method: "GET",
				headers: get_kobold_header(),
			})
				.then(response => response.json())
				.then(values => {
					console.log(values);
					let mdlname = values.result;
					if (!mdlname) {
						msgbox(
							"Error at Custom KoboldAI Endpoint!<br><br>The custom endpoint failed to respond correctly.<br><br>You may wish to <a href='#' class='color_blueurl' onclick='hide_popups();display_endpoint_container();'>try a different URL or API type</a>.",
							"Error Encountered",
							true,
						);

						selected_models = [];
						selected_workers = [];
						custom_kobold_endpoint = "";
						render_gametext();
					} else if (mdlname == "ReadOnly") {
						msgbox("The custom endpoint is working, but no model was loaded.\n\nPlease select and load a model and try again.");
						selected_models = [];
						selected_workers = [];
						custom_kobold_endpoint = "";
						render_gametext();
					} else {
						if (uses_cors_proxy && !is_local_url(fetchedurl)) {
							document.getElementById("connectstatusproxied").classList.remove("hidden");
						} else {
							document.getElementById("connectstatusproxied").classList.add("hidden");
						}

						//good to go
						custom_kobold_endpoint = desiredkoboldendpoint;
						custom_kobold_key = desiredkoboldkey;
						localsettings.saved_kai_addr = custom_kobold_endpoint;
						localsettings.saved_kai_key = custom_kobold_key;
						selected_models = [{ performance: 100.0, queued: 0.0, eta: 0, name: mdlname, count: 1 }];
						selected_workers = [];
						if (perfdata == null) {
							//generate some fake perf data if horde is offline and using custom endpoint
							perfdata = {
								queued_requests: 0,
								queued_tokens: 0,
								past_minute_tokens: 0,
								worker_count: 0,
							};
							document.body.classList.add("connected");
							document.getElementById("connectstatus").classList.add("color_offwhite");
						}
						document.getElementById("connectstatus").innerHTML = "KoboldAI Endpoint";
						render_gametext();

						{
							//now we get the version number, however this is optional
							//if it fails we can still proceed
							fetch(apply_proxy_url(desiredkoboldendpoint + kobold_custom_version_endpoint), {
								method: "GET",
								headers: get_kobold_header(),
							})
								.then(response => response.json())
								.then(values2 => {
									console.log(values2);
									let ep_version = values2.result;
									kobold_endpoint_version = ep_version ? ep_version : "";
								}).catch(error => {
									console.log("Failed to get KAI version number: " + error);
								});

							//also get max ctx supported
							fetch(apply_proxy_url(desiredkoboldendpoint + kobold_custom_maxctxlen_endpoint), {
								method: "GET",
								headers: get_kobold_header(),
							})
								.then(response => response.json())
								.then(values3 => {
									console.log(values3);
									let ep_maxctx = values3.value;
									if (ep_maxctx && ep_maxctx > document.getElementById("max_context_length_slide").max) {
										document.getElementById("max_context_length_slide").max = ep_maxctx;
										document.getElementById("max_context_length_slide_label").innerText = ep_maxctx;
									}
									if (ep_maxctx && ep_maxctx > 4096 && document.getElementById("max_length_slide").max < 1024) {
										document.getElementById("max_length_slide").max = 1024;
										document.getElementById("max_length_slide_label").innerText = 1024;
									}
								}).catch(error => {
									console.log("Failed to get KAI max ctx: " + error);
								});
						}

						//allow kcpp version check for remote endpoints too
						{
							//for local mode, check if we are using koboldcpp, if so we can use streaming if permitted by version
							fetch(apply_proxy_url(desiredkoboldendpoint + koboldcpp_version_endpoint), {
								method: "GET",
								headers: get_kobold_header(),
							})
								.then(x => x.json())
								.then(data => {
									if (data && data != "" && data.version && data.version != "") {
										koboldcpp_version_obj = data;
										koboldcpp_version = data.version;
										console.log("KoboldCpp Detected: " + koboldcpp_version);
										document.getElementById("connectstatus").innerHTML =
											`<span style='cursor: pointer;' onclick='fetch_koboldcpp_perf()'>KoboldCpp ${koboldcpp_version}</a>`;
										koboldcpp_has_vision = data.vision ? true : false;
										koboldcpp_has_whisper = data.transcribe ? true : false;
										koboldcpp_has_multiplayer = data.multiplayer ? true : false;
										koboldcpp_has_websearch = data.websearch ? true : false;
										koboldcpp_has_tts = data.tts ? true : false;
										koboldcpp_admin_type = data.admin ? data.admin : 0;
										koboldcpp_has_savedatafile = data.savedata ? true : false;
										koboldcpp_has_guidance = data.guidance ? true : false;
										koboldcpp_has_embeddings = data.embeddings ? true : false;
										let has_password = data.protected ? true : false;
										koboldcpp_has_txt2img = data.txt2img ? true : false;
										let no_txt_model = mdlname == "inactive";
										update_websearch_button_visibility();

										//also check against kcpp's max true context length
										fetch(apply_proxy_url(desiredkoboldendpoint + koboldcpp_truemaxctxlen_endpoint), {
											method: "GET",
											headers: get_kobold_header(),
										})
											.then(response => response.json())
											.then(values4 => {
												console.log(values4);
												let ep_maxctx = values4.value;
												if (ep_maxctx && ep_maxctx > document.getElementById("max_context_length_slide").max) {
													document.getElementById("max_context_length_slide").max = ep_maxctx;
													document.getElementById("max_context_length_slide_label").innerText = ep_maxctx;
												}
												if (ep_maxctx && ep_maxctx >= 4096 && document.getElementById("max_length_slide").max < 1024) {
													document.getElementById("max_length_slide").max = 1024;
													document.getElementById("max_length_slide_label").innerText = 1024;
												}
												if (ep_maxctx && ep_maxctx >= 16384 && document.getElementById("max_length_slide").max < 2048) {
													document.getElementById("max_length_slide").max = 2048;
													document.getElementById("max_length_slide_label").innerText = 2048;
												}
												if (localflag && localsettings.max_context_length == 4096 && ep_maxctx > 4096) {
													localsettings.max_context_length = ep_maxctx;
												}
											}).catch(error => {
												console.log("Failed to get true max ctx: " + error);
											});

										//and check if there's a kcpp savefile preloaded
										fetch(apply_proxy_url(desiredkoboldendpoint + koboldcpp_preloadstory_endpoint), {
											method: "GET",
											headers: get_kobold_header(),
										})
											.then(response => response.json())
											.then(values5 => {
												let tmpstory = values5;
												if (is_kai_json(tmpstory)) {
													if (localsettings.persist_session && !safe_to_overwrite()) {
														console.log("Preload story: Unsafe to overwrite");
													} else {
														close_welcome_panel(false);
														kai_json_load(tmpstory, false);
													}
												}
												update_for_sidepanel();
												if (koboldcpp_has_multiplayer || koboldcpp_admin_type > 0) {
													//force refresh
													render_gametext(false);
												}
											}).catch(error => {
												console.log("Failed to get preloaded story: " + error);
											});

										//check if image gen is supported
										fetch(apply_proxy_url(desiredkoboldendpoint + a1111_models_endpoint))
											.then(response => response.json())
											.then(values6 => {
												console.log(values6);
												if (
													values6 && values6.length > 0 && values6[0].model_name != "inactive"
													&& values6[0].filename != null
												) {
													let firstitem = values6[0];
													//local image gen is available
													if (localsettings.generate_images_mode == 0) {
														console.log("Connect to KoboldCpp Image Gen");
														localsettings.generate_images_mode = 2;
														localsettings.saved_a1111_url = desiredkoboldendpoint;
														connect_to_a1111(true);
														render_gametext(true);
													}
												} else {
													//hide the add img if the image server is down
													if (
														localsettings.generate_images_mode == 2
														&& localsettings.saved_a1111_url == desiredkoboldendpoint
													) {
														localsettings.generate_images_mode = 0;
														localsettings.saved_a1111_url = default_a1111_base;
														render_gametext(true);
													}
												}
											}).catch(error => {
												console.log("Failed to get local image models: " + error);
											});

										//prompt to request password for kcpp
										if (localflag && has_password && !localmodekey) {
											console.log("Password protection detected. Prompting for password...");
											inputBox(
												"This KoboldCpp instance may be password protected.\nPlease input password:",
												"API Key Required",
												localsettings.saved_kai_key,
												"(Input API Key)",
												() => {
													let userinput = getInputBoxValue();
													userinput = userinput.trim();
													if (userinput != null && userinput != "") {
														custom_kobold_key =
															document.getElementById("customkoboldkey").value =
															localmodekey =
															localsettings.saved_kai_key =
																userinput.trim();
														update_custom_kobold_endpoint_model_display(true);
													}
												},
												false,
												false,
												true,
											);
										} else if (localflag && koboldcpp_has_txt2img && no_txt_model && safe_to_overwrite()) {
											msgboxYesNo(
												"This KoboldCpp instance seems to be running an Image Generation model without any Text Generation model loaded.\n\nWould you like to launch StableUI (Dedicated Image Generation WebUI bundled with KoboldCpp)?\n\nIf unsure, select 'No'.",
												"Launch StableUI?",
												() => {
													go_to_stableui();
												},
												() => {
												},
											);
										} else if (
											localflag && no_txt_model && !koboldcpp_has_txt2img && !koboldcpp_has_vision && !koboldcpp_has_whisper
											&& !koboldcpp_has_tts && !is_using_kcpp_with_admin()
										) {
											msgboxYesNo(
												"This KoboldCpp instance has no models loaded. You can still use the WebUI to edit or view existing stories.<br><br>Would you like to connect to an external API service?",
												"No Models Loaded",
												() => {
													localflag = false;
													hide_popups();
													restore_endpoint_dropdowns();
													document.getElementById("customapidropdown").value = "1";
													render_gametext(false);
													display_endpoint_container();
												},
												() => {},
												true,
											);
										}
									} else {
										console.log("Unknown KoboldCpp Check Response: " + data);
									}
								}).catch((error) => {
									console.log("Not using KoboldCpp");
								});
						}
					}
				})
				.catch(error => {
					//on first error, do not give up, switch to cors proxy and try again.
					//if it still fails, then show error
					console.log("Error: " + error);

					let is_local = is_local_url(custom_kobold_endpoint);

					//we will go down the fallbacks one by one until we run out of options
					localmodeport = backup_localmodeport;
					if (is_local && sublocalpathname != "") {
						sublocalpathname = ""; // first fallback, check subdir paths
						attempt_connect(false);
					} else if (reattempt_local_port80) { // second fallback, try port 80
						reattempt_local_port80 = false;
						localmodeport = 80;
						attempt_connect(false);
					} else if (!is_local && !uses_cors_proxy) { //third fallback, use cors proxy if not a local IP
						uses_cors_proxy = true; // fallback to cors proxy, this will remain for rest of session
						connect_custom_endpoint(); //one more try
					} //finally, we give up
					else {
						msgbox(
							"Failed to connect to Custom KoboldAI Endpoint!<br><br>Please check if KoboldAI is running at the url: "
								+ desiredkoboldendpoint
								+ "<br><br>You can also <a href='#' class='color_blueurl' onclick='hide_popups();display_endpoint_container();'>try a different URL or API type</a>.",
							"Error Encountered",
							true,
						);
						selected_models = [];
						selected_workers = [];
						custom_kobold_endpoint = "";
						if (localflag) {
							document.getElementById("connectstatus").innerHTML = "Offline Mode";
						} else {
							document.getElementById("connectstatus").innerHTML = "Error";
						}

						render_gametext();
					}
				});
		}
	} else if (epchoice == 2 || epchoice == 3 || epchoice == 7 || epchoice == 8 || epchoice == 9 || epchoice == 10) { //connect to OAI / OpenRouter / MistralAI / Featherless / Grok Endpoint
		let desired_oai_key = document.getElementById("custom_oai_key").value.trim();
		let desired_oai_ep = document.getElementById("custom_oai_endpoint").value.trim();

		if (desired_oai_ep == "") {
			desired_oai_ep = document.getElementById("custom_oai_endpoint").value = default_oai_base;
		}

		desired_oai_ep = transform_oai_ep(desired_oai_ep);

		if (desired_oai_key != "" && desired_oai_ep != "") {
			dismiss_endpoint_container();

			//good to go
			custom_oai_endpoint = desired_oai_ep;
			custom_oai_key = desired_oai_key;
			if (epchoice == 2) {
				localsettings.saved_oai_key = custom_oai_key;
				localsettings.saved_oai_addr = custom_oai_endpoint;
				localsettings.saved_dalle_key = custom_oai_key;
				localsettings.saved_dalle_url = custom_oai_endpoint + default_oai_image_endpoint;
				localsettings.saved_oai_tts_key = custom_oai_key;
				localsettings.saved_oai_tts_url = custom_oai_endpoint + default_oai_tts_endpoint;
				localsettings.saved_oai_embd_key = custom_oai_key;
				localsettings.saved_oai_embd_url = custom_oai_endpoint + default_oai_embeddings_endpoint;
			} else if (epchoice == 7) {
				localsettings.saved_mistralai_key = custom_oai_key;
			} else if (epchoice == 8) {
				localsettings.saved_featherless_key = custom_oai_key;
			} else if (epchoice == 9) {
				localsettings.saved_grok_key = custom_oai_key;
			} else if (epchoice == 10) {
				localsettings.saved_pollinations_key = dummy_pollinations_key; //placeholder key, not actually used
			} else {
				localsettings.saved_openrouter_key = custom_oai_key;
			}
			localsettings.saved_oai_jailbreak = document.getElementById("jailbreakprompttext").value;
			if (localsettings.saved_oai_jailbreak == "") {
				document.getElementById("jailbreakprompttext").value = defaultoaijailbreak;
			}
			localsettings.saved_oai_role = document.getElementById("oairoledropdown").value;
			localsettings.saved_oai_jailbreak2 = document.getElementById("jailbreakprompttext2").value;
			if (localsettings.saved_oai_jailbreak2 == "") {
				document.getElementById("jailbreakprompttext2").value = defaultoaipostfix;
			}
			let dropdown = get_custom_ep_model_dropdown();
			custom_oai_model = dropdown.value.trim();
			localsettings.saved_oai_custommodel = custom_oai_model;
			selected_models = [{ performance: 100.0, queued: 0.0, eta: 0, name: custom_oai_model, count: 1 }];
			selected_workers = [];
			if (perfdata == null) {
				//generate some fake perf data if horde is offline and using custom endpoint
				perfdata = {
					queued_requests: 0,
					queued_tokens: 0,
					past_minute_tokens: 0,
					worker_count: 0,
				};
				document.body.classList.add("connected");
				document.getElementById("connectstatus").classList.add("color_offwhite");
			}
			document.getElementById("connectstatus").innerHTML = "OpenAI Endpoint";
			render_gametext(true);
		}
	} else if (epchoice == 4) { //claude endpoint
		let desired_claude_key = document.getElementById("custom_claude_key").value.trim();
		let desired_claude_ep = document.getElementById("custom_claude_endpoint").value.trim();

		if (desired_claude_ep == "") {
			desired_claude_ep = document.getElementById("custom_claude_endpoint").value = default_claude_base;
		}

		if (desired_claude_ep != "" && desired_claude_ep.slice(-1) == "/") {
			desired_claude_ep = desired_claude_ep.slice(0, -1);
		}
		if (document.getElementById("claudeaddversion").checked) {
			if (desired_claude_ep != "" && desired_claude_ep.length > 4 && !desired_claude_ep.slice(-4).toLowerCase().includes("/v")) {
				desired_claude_ep = desired_claude_ep + "/v1";
			}
		}
		if (desired_claude_key != "" && desired_claude_ep != "") {
			dismiss_endpoint_container();

			if (desired_claude_ep.toLowerCase().includes("api.anthropic.com")) {
				document.getElementById("connectstatusproxied").classList.remove("hidden");
			}

			//good to go
			custom_claude_endpoint = desired_claude_ep;
			custom_claude_key = desired_claude_key;
			localsettings.saved_claude_key = custom_claude_key;
			localsettings.saved_claude_addr = custom_claude_endpoint;
			localsettings.saved_claude_jailbreak = document.getElementById("claudesystemprompt").value;
			localsettings.saved_claude_jailbreak2 = document.getElementById("claudejailbreakprompt").value;
			custom_claude_model = document.getElementById("custom_claude_model").value.trim();

			selected_models = [{ performance: 100.0, queued: 0.0, eta: 0, name: custom_claude_model, count: 1 }];
			selected_workers = [];
			if (perfdata == null) {
				//generate some fake perf data if horde is offline and using custom endpoint
				perfdata = {
					queued_requests: 0,
					queued_tokens: 0,
					past_minute_tokens: 0,
					worker_count: 0,
				};
				document.body.classList.add("connected");
				document.getElementById("connectstatus").classList.add("color_offwhite");
			}
			document.getElementById("connectstatus").innerHTML = "Claude Endpoint";
			render_gametext();
		}
	} else if (epchoice == 5) { //gemini endpoint
		let desired_gemini_key = document.getElementById("custom_gemini_key").value.trim();
		let mdlname = document.getElementById("custom_gemini_model").value;

		if (desired_gemini_key != "") {
			dismiss_endpoint_container();

			//good to go
			custom_gemini_key = desired_gemini_key;
			localsettings.saved_palm_key = custom_gemini_key;
			localsettings.saved_palm_jailbreak = document.getElementById("gemini_system_instruction").value;
			localsettings.saved_palm_jailbreak2 = document.getElementById("gemini_postfix_text").value;

			selected_models = [{ performance: 100.0, queued: 0.0, eta: 0, name: mdlname, count: 1 }];
			selected_workers = [];
			if (perfdata == null) {
				//generate some fake perf data if horde is offline and using custom endpoint
				perfdata = {
					queued_requests: 0,
					queued_tokens: 0,
					past_minute_tokens: 0,
					worker_count: 0,
				};
				document.body.classList.add("connected");
				document.getElementById("connectstatus").classList.add("color_offwhite");
			}
			document.getElementById("connectstatus").innerHTML = "Gemini Endpoint";
			render_gametext();
		}
	} else if (epchoice == 6) { //cohere endpoint
		let desired_cohere_key = document.getElementById("custom_cohere_key").value.trim();
		custom_cohere_model = document.getElementById("custom_cohere_model").value.trim();

		if (desired_cohere_key != "") {
			dismiss_endpoint_container();

			//good to go
			custom_cohere_key = desired_cohere_key;
			localsettings.saved_cohere_key = custom_cohere_key;
			localsettings.saved_cohere_preamble = document.getElementById("cohere_preamble").value;

			selected_models = [{ performance: 100.0, queued: 0.0, eta: 0, name: custom_cohere_model, count: 1 }];
			selected_workers = [];
			if (perfdata == null) {
				//generate some fake perf data if horde is offline and using custom endpoint
				perfdata = {
					queued_requests: 0,
					queued_tokens: 0,
					past_minute_tokens: 0,
					worker_count: 0,
				};
				document.body.classList.add("connected");
				document.getElementById("connectstatus").classList.add("color_offwhite");
			}
			document.getElementById("connectstatus").innerHTML = "Cohere Endpoint";
			render_gametext();
		}
	}
}

function display_endpoint_container() {
	mainmenu_untab(true);
	document.getElementById("customendpointcontainer").classList.remove("hidden");
	customapi_dropdown(false);
}
function dismiss_endpoint_container() {
	mainmenu_untab(false);
	document.getElementById("customendpointcontainer").classList.add("hidden");
}

var last_admin_key = "";
function display_admin_container() {
	mainmenu_untab(false);
	document.getElementById("loadstatetxt").innerText = "";
	let fetch_kcpps_configs = function(adminkey) {
		let header = { "Content-Type": "application/json" };
		last_admin_key = adminkey;
		if (adminkey != "") {
			header["Authorization"] = "Bearer " + adminkey;
		}
		fetch(custom_kobold_endpoint + koboldcpp_admin_list_endpoint, {
			method: "GET",
			headers: header,
		})
			.then(x => x.json())
			.then(values => {
				if (values && values.length > 0) {
					//on values received
					var dropdown = document.getElementById("adminconfigdropdown");
					for (var i = dropdown.options.length; i >= 0; i--) {
						var option = dropdown.options[i];
						dropdown.remove(option);
					}
					for (var i = 0; i < values.length; ++i) {
						var el = document.createElement("option");
						el.textContent = values[i];
						el.value = values[i];
						dropdown.appendChild(el);
					}
					change_admin_config_selection();
					document.getElementById("admincontainer").classList.remove("hidden");
				} else {
					msgbox(
						"Error: No configurations were returned by the server.\n\nCheck that the .kcpps directory has been set with --admindir, and ensure that your password is correct, if used.",
						"Error",
					);
				}
			}).catch((error) => {
				console.log("Error: " + error);
				msgbox(error, "Error");
			});
	};

	if (koboldcpp_admin_type == 2) {
		inputBox(
			"Please input admin password:",
			"Admin Password Required",
			"",
			"(Input Admin Password)",
			() => {
				let userinput = getInputBoxValue();
				userinput = userinput.trim();
				if (userinput != null && userinput != "") {
					fetch_kcpps_configs(userinput);
				}
			},
			false,
			false,
			true,
		);
	} else {
		fetch_kcpps_configs("");
	}
}

function change_admin_config_selection() {
	let targetfile = document.getElementById("adminconfigdropdown").value;
	if (targetfile && targetfile.endsWith(".gguf")) {
		let overridedropdown = document.getElementById("adminconfigoverridedropdown");
		overridedropdown.classList.remove("hidden");
		var dropdown = document.getElementById("adminconfigdropdown");
		for (var i = overridedropdown.options.length; i >= 0; i--) {
			var option = overridedropdown.options[i];
			overridedropdown.remove(option);
		}
		var el = document.createElement("option");
		el.textContent = "Default Config";
		el.value = "";
		overridedropdown.appendChild(el);
		for (var i = 0; i < dropdown.options.length; ++i) {
			let str = dropdown.options[i].value;
			if (str.endsWith(".gguf") || str == "unload_model") {
				continue;
			}
			var el = document.createElement("option");
			el.textContent = str;
			el.value = str;
			overridedropdown.appendChild(el);
		}
	} else {
		document.getElementById("adminconfigoverridedropdown").classList.add("hidden");
	}
}
var adminrebootflag = 0;
function trigger_admin_reload() {
	document.getElementById("admincontainer").classList.add("hidden");
	let targetfile = document.getElementById("adminconfigdropdown").value;
	if (!targetfile) {
		msgbox("No config file was selected.");
		return;
	}

	let header = { "Content-Type": "application/json" };
	let payload = { filename: targetfile };
	if (!document.getElementById("adminconfigoverridedropdown").classList.contains("hidden")) {
		payload["overrideconfig"] = document.getElementById("adminconfigoverridedropdown").value;
	}

	if (last_admin_key != "") {
		header["Authorization"] = "Bearer " + last_admin_key;
	}
	fetch(custom_kobold_endpoint + koboldcpp_admin_reload_endpoint, {
		method: "POST",
		headers: header,
		body: JSON.stringify(payload),
	})
		.then(x => x.json())
		.then(values => {
			let success = values && values.success;
			if (success) {
				msgbox(
					"KoboldCpp is now restarting!\n\nIt may take some time before the new instance is ready to use.\n\nYour browser should automatically refresh after a few moments...",
					"KoboldCpp Reload Started",
					false,
					true,
				);

				setInterval(function() {
					++adminrebootflag;
					if (adminrebootflag > 1 && adminrebootflag < 20) {
						fetch(apply_proxy_url(custom_kobold_endpoint + kobold_custom_version_endpoint), {
							method: "GET",
							headers: get_kobold_header(),
						})
							.then(response => response.json())
							.then((data) => {
								adminrebootflag = 999;
								location.reload(true);
							})
							.catch((error) => {
								if (adminrebootflag > 2) {
									adminrebootflag -= 1;
								}
								console.error("Not Ready to Restart:", error);
							});
					}
				}, 3000);
			} else {
				msgbox(
					"The request to reload KoboldCpp with a new configuration failed!\n\nPlease check if the feature is enabled, the admin directory is set, and selected config and password are correct.",
					"KoboldCpp Reload Failed",
				);
			}
		}).catch((error) => {
			console.log("Error: " + error);
			msgbox(error, "Error");
		});
}

function trigger_admin_savestate() {
	let slot = parseInt(document.getElementById("savestate_selection").value);
	document.getElementById("loadstatetxt").innerText = `Saving State ${slot}...`;
	let header = { "Content-Type": "application/json" };
	if (last_admin_key != "") {
		header["Authorization"] = "Bearer " + last_admin_key;
	}
	fetch(custom_kobold_endpoint + koboldcpp_admin_savestate_endpoint, {
		method: "POST",
		headers: header,
		body: JSON.stringify({
			slot: slot,
		}),
	})
		.then(x => x.json())
		.then(values => {
			console.log(values);
			if (values.success) {
				document.getElementById("loadstatetxt").innerText = `State ${slot} Saved (${values.new_tokens} tokens in ${
					parseInt(values.new_state_size / (1024 * 1024))
				} MB)`;
			} else {
				document.getElementById("loadstatetxt").innerText = `Save State ${slot} Failed!`;
			}
		}).catch((error) => {
			console.log("Error: " + error);
			document.getElementById("loadstatetxt").innerText = `Save State ${slot} Failed!`;
			msgbox(error, "Error");
		});
}

function trigger_admin_loadstate() {
	let slot = parseInt(document.getElementById("savestate_selection").value);
	document.getElementById("loadstatetxt").innerText = `Loading State ${slot}...`;
	let header = { "Content-Type": "application/json" };
	if (last_admin_key != "") {
		header["Authorization"] = "Bearer " + last_admin_key;
	}
	fetch(custom_kobold_endpoint + koboldcpp_admin_loadstate_endpoint, {
		method: "POST",
		headers: header,
		body: JSON.stringify({
			slot: slot,
		}),
	})
		.then(x => x.json())
		.then(values => {
			console.log(values);
			if (values.success) {
				document.getElementById("loadstatetxt").innerText = `State ${slot} Loaded (${values.new_tokens} tokens)`;
			} else {
				document.getElementById("loadstatetxt").innerText = `Load State ${slot} Failed!`;
			}
		}).catch((error) => {
			console.log("Error: " + error);
			document.getElementById("loadstatetxt").innerText = `Load State ${slot} Failed!`;
			msgbox(error, "Error");
		});
}

var cachedsaveslotlabels = [];
var netsaveslotlabels = [];
function saveloadchangeslot(updatelist = false) {
	let selectedslot = document.getElementById("saveslotselecteddropdown").value;
	let selectedlocation = document.getElementById("saveslotlocationdropdown").value;
	let selectedslotlabel = null;
	let choices = "";
	let foundoption = false;
	if (selectedlocation == "1") { //local
		for (let i = 0; i < cachedsaveslotlabels.length; ++i) {
			let testslot = cachedsaveslotlabels[i];
			if (selectedslot == i) {
				selectedslotlabel = testslot;
				foundoption = true;
			}
			let lbl = i + 1;
			let tsdesc = (testslot.length > 50) ? testslot.substring(0, 50) + "..." : testslot;
			let slotname = testslot ? `Local Slot ` + lbl + ` - ` + tsdesc + `` : `Local Slot ` + lbl + ` - [ Empty ]`;
			choices += `<option value=${i}${(selectedslot == i) ? " selected" : ""}>${slotname}</option>`;
		}
	} else if (selectedlocation == "2") { //remote saves
		for (let i = 0; i < netsaveslotlabels.length; ++i) {
			let testslot = netsaveslotlabels[i];
			if (selectedslot == i) {
				selectedslotlabel = testslot;
				foundoption = true;
			}
			let lbl = i + 1;
			let tsdesc = (testslot.length > 50) ? testslot.substring(0, 50) + "..." : testslot;
			let slotname = testslot ? `Server Slot ` + lbl + ` - ` + tsdesc + `` : `Server Slot ` + lbl + ` - [ Empty ]`;
			choices += `<option value=${i}${(selectedslot == i) ? " selected" : ""}>${slotname}</option>`;
		}
	}
	document.getElementById("loadfromslot").disabled = selectedslotlabel ? false : true;
	document.getElementById("downloadslot").disabled = selectedslotlabel ? false : true;
	document.getElementById("deleteslot").disabled = selectedslotlabel ? false : true;
	if (!foundoption) {
		document.getElementById("saveslotselecteddropdown").selectedIndex = 0;
	}
	if (updatelist) {
		document.getElementById("saveslotselecteddropdown").innerHTML = choices;
	}
}
function find_unused_saveslot(onDoneCallback) {
	let slotpromises = [];
	for (let i = 0; i < SAVE_SLOTS; ++i) {
		slotpromises.push(indexeddb_load("slot_" + i + "_meta", ""));
	}
	Promise.all(slotpromises).then(slotlabels => {
		let esid = -1;
		for (let i = 0; i < slotlabels.length; ++i) {
			if (slotlabels[i] == "") {
				esid = i;
				break;
			}
		}
		onDoneCallback(esid);
	});
}
function display_saveloadcontainer() {
	mainmenu_untab(true);
	document.getElementById("saveloadcontainer").classList.remove("hidden");

	if (is_using_kcpp_with_savedatafile()) {
		document.getElementById("kcppsaveavailable").classList.remove("hidden");
	} else {
		document.getElementById("kcppsaveavailable").classList.add("hidden");
	}

	let slotpromises = [];
	for (let i = 0; i < SAVE_SLOTS; ++i) {
		slotpromises.push(indexeddb_load("slot_" + i + "_meta", ""));
	}
	Promise.all(slotpromises).then(slotlabels => {
		cachedsaveslotlabels = slotlabels;
		saveloadchangeslot(true);
		populate_corpo_leftpanel();
	});
	if (is_using_kcpp_with_savedatafile()) {
		//grab saves
		fetch(custom_kobold_endpoint + koboldcpp_savedata_list_endpoint, {
			method: "POST", // or 'PUT'
			headers: get_kobold_header(),
		})
			.then((response) => response.json())
			.then((data) => {
				netsaveslotlabels = data;
				saveloadchangeslot(true);
				populate_corpo_leftpanel();
			})
			.catch((error) => {
				console.error("Error:", error);
			});
	}
}
function quicksave() {
	if (last_used_saveslot == -1) {
		if (!safe_to_overwrite()) {
			find_unused_saveslot((slot) => {
				if (slot != -1) {
					save_to_slot(slot, true, false);
				} else {
					msgbox("Unable to Save - No Available New Slots.", "Storage Slots Full");
				}
			});
		} else {
			msgbox("Nothing to save - Current session is empty.", "Not Saved");
		}
	} else {
		save_to_slot(last_used_saveslot, true, false);
	}
}
function quickdelete() {
	if (last_used_saveslot != -1) {
		delete_from_slot(last_used_saveslot, true, false);
	} else {
		msgbox("Nothing to delete - Select a slot first.", "No Action Taken");
	}
}
function save_to_slot(slot, islocal, showcontainer) {
	let defaultsavename = localsettings.opmode == 1
		? "Untitled Story"
		: (localsettings.opmode == 2 ? "Untitled Adventure" : (localsettings.opmode == 3 ? "Untitled Chat" : "Untitled Instruct"));
	let savename = defaultsavename + " " + new Date().toLocaleString();
	let slotnumshown = parseInt(slot) + 1;
	let newcompressedstory = generate_compressed_story(true, true, true);
	if (islocal) {
		indexeddb_load("slot_" + slot + "_meta", "").then(testslot => {
			if (testslot) {
				savename = testslot;
			}
			const slotwrite = function() {
				warn_unsaved = false;
				inputBox("Enter a label for this Browser Storage Slot data", "Enter a label", savename, defaultsavename, () => {
					let userinput = getInputBoxValue();
					if (userinput.trim() == "") {
						userinput = defaultsavename;
					}
					indexeddb_save("slot_" + slot + "_data", newcompressedstory);
					indexeddb_save("slot_" + slot + "_meta", userinput).then(() => {
						if (showcontainer) {
							display_saveloadcontainer();
						} else {
							saveloadchangeslot(true);
							populate_corpo_leftpanel();
						}
					});
				});
				last_used_saveslot = slot;
			};

			if (testslot) {
				msgboxYesNo(
					"Overwrite existing story in Browser Storage Slot " + slotnumshown + "?",
					"Overwrite Browser Storage Slot " + slotnumshown,
					() => {
						slotwrite();
					},
					null,
				);
			} else {
				slotwrite();
			}
		});
	} else { //remote save
		let testslot = slot < netsaveslotlabels.length ? netsaveslotlabels[slot] : "";
		if (testslot) {
			savename = testslot;
		}
		const slotwrite = function() {
			warn_unsaved = false;
			last_used_saveslot = -1;
			inputBox("Enter a label for this Server Storage Slot data", "Enter a label", savename, defaultsavename, () => {
				let userinput = getInputBoxValue();
				if (userinput.trim() == "") {
					userinput = defaultsavename;
				}
				//complete remote save
				fetch(custom_kobold_endpoint + koboldcpp_savedata_save_endpoint, {
					method: "POST", // or 'PUT'
					headers: get_kobold_header(),
					body: JSON.stringify({
						slot: slot,
						format: "kcpp_lzma_b64",
						title: userinput,
						data: newcompressedstory,
					}),
				})
					.then((response) => response.json())
					.then((data) => {
						if (!data.success) {
							msgbox(`Save Error: ${data.error}`, "Save Failed", false, false, () => {
								display_saveloadcontainer();
							});
						} else {
							display_saveloadcontainer();
						}
					})
					.catch((error) => {
						console.error("Error:", error);
						msgbox(`Save Error: ${error}`, "Save Failed", false, false, () => {
							display_saveloadcontainer();
						});
					});
			});
		};
		if (testslot) {
			msgboxYesNo(
				"Overwrite existing story in Server Storage Slot " + slotnumshown + "?",
				"Overwrite Server Storage Slot " + slotnumshown,
				() => {
					slotwrite();
				},
				null,
			);
		} else {
			slotwrite();
		}
	}
}
function load_from_slot(slot, islocal, switch_to_corpo) {
	const proceed_load_from_slot = function() {
		if (islocal) {
			indexeddb_load("slot_" + slot + "_data", "").then(loadedstorycompressed => {
				if (loadedstorycompressed) {
					hide_popups();
					import_compressed_story(loadedstorycompressed, false);
					last_used_saveslot = slot;
					if (switch_to_corpo) {
						localsettings.gui_type_chat = 3;
						localsettings.gui_type_story = 3;
						localsettings.gui_type_adventure = 3;
						localsettings.gui_type_instruct = 3;
						render_gametext(false, false);
					}
				} else {
					msgbox("Unable to load story from browser storage", "Browser Storage Load Failed");
				}
			});
		} else {
			last_used_saveslot = -1;
			fetch(custom_kobold_endpoint + koboldcpp_savedata_load_endpoint, {
				method: "POST", // or 'PUT'
				headers: get_kobold_header(),
				body: JSON.stringify({
					slot: slot,
				}),
			})
				.then((response) => response.json())
				.then((resp) => {
					if (!resp.success || !resp.data) {
						msgbox("Error: Unable to load story from server storage", "Server Storage Load Failed");
					} else {
						hide_popups();
						import_compressed_story(resp.data.data, false);
					}
				})
				.catch((error) => {
					console.error("Error:", error);
					msgbox("Error: Unable to load story from server storage", "Server Storage Load Failed");
				});
		}
	};
	if (!safe_to_overwrite() && warn_unsaved) {
		msgboxYesNo("Unsaved changes will be lost, proceed?", "Confirm Load Slot", () => {
			proceed_load_from_slot();
		}, null);
	} else {
		proceed_load_from_slot();
	}
}
function download_from_slot(slot, islocal) {
	let ondl = function(loadedstorycompressed) {
		if (loadedstorycompressed) {
			let storyobj = decompress_story(loadedstorycompressed);
			if (storyobj) {
				save_file_button(storyobj);
			} else {
				msgbox("Story could not be downloaded. Try loading it first.", "Download Failed");
			}
		} else {
			msgbox("Unable to download story.", "Download Load Failed");
		}
	};

	if (islocal) {
		indexeddb_load("slot_" + slot + "_data", "").then(loadedstorycompressed => {
			ondl(loadedstorycompressed);
		});
	} else {
		fetch(custom_kobold_endpoint + koboldcpp_savedata_load_endpoint, {
			method: "POST", // or 'PUT'
			headers: get_kobold_header(),
			body: JSON.stringify({
				slot: slot,
			}),
		})
			.then((response) => response.json())
			.then((resp) => {
				if (!resp.success || !resp.data) {
					msgbox("Error: Unable to load story from server storage", "Server Storage Load Failed");
				} else {
					ondl(resp.data.data);
				}
			})
			.catch((error) => {
				console.error("Error:", error);
				msgbox("Error: Unable to load story from server storage", "Server Storage Load Failed");
			});
	}
}
function delete_from_slot(slot, islocal, showcontainer) {
	let slotnumshown = parseInt(slot) + 1;
	if (islocal) {
		let postdel = function() {
			if (showcontainer) {
				display_saveloadcontainer();
			} else {
				saveloadchangeslot(true);
				populate_corpo_leftpanel();
			}
		};
		msgboxYesNo("Delete story in Browser Storage Slot " + slotnumshown + "?", "Delete Browser Storage Slot " + slotnumshown, () => {
			indexeddb_save("slot_" + slot + "_data", "");
			indexeddb_save("slot_" + slot + "_meta", "").then(() => {
				postdel();
				if (slot == last_used_saveslot) {
					last_used_saveslot = -1;
				}
			});
		}, () => {
			postdel();
		});
	} else {
		msgboxYesNo("Delete story in Server Storage Slot " + slotnumshown + "?", "Delete Server Storage Slot " + slotnumshown, () => {
			fetch(custom_kobold_endpoint + koboldcpp_savedata_save_endpoint, {
				method: "POST", // or 'PUT'
				headers: get_kobold_header(),
				body: JSON.stringify({
					slot: slot,
					format: "",
					title: "",
					data: "",
				}),
			})
				.then((response) => response.json())
				.then((data) => {
					if (!data.success) {
						msgbox(`Delete Error: ${data.error}`, "Delete Failed", false, false, () => {
							display_saveloadcontainer();
						});
					} else {
						display_saveloadcontainer();
					}
				})
				.catch((error) => {
					console.error("Error:", error);
					msgbox(`Delete Error: ${error}`, "Delete Failed", false, false, () => {
						display_saveloadcontainer();
					});
				});
		}, () => {
			display_saveloadcontainer();
		});
	}
}

function save_to_curr_slot() {
	let selectedslot = document.getElementById("saveslotselecteddropdown").value;
	let selectedlocation = document.getElementById("saveslotlocationdropdown").value;
	let islocal = selectedlocation == "1";
	save_to_slot(selectedslot, islocal, true);
}
function load_from_curr_slot() {
	let selectedslot = document.getElementById("saveslotselecteddropdown").value;
	let selectedlocation = document.getElementById("saveslotlocationdropdown").value;
	let islocal = selectedlocation == "1";
	load_from_slot(selectedslot, islocal, false);
}
function download_from_curr_slot() {
	let selectedslot = document.getElementById("saveslotselecteddropdown").value;
	let selectedlocation = document.getElementById("saveslotlocationdropdown").value;
	let islocal = selectedlocation == "1";
	download_from_slot(selectedslot, islocal);
}
function delete_from_curr_slot() {
	let selectedslot = document.getElementById("saveslotselecteddropdown").value;
	let selectedlocation = document.getElementById("saveslotlocationdropdown").value;
	let islocal = selectedlocation == "1";
	delete_from_slot(selectedslot, islocal, true);
}

var cached_model_list = null;
var cached_worker_list = null;
var stale_cached_model_time = performance.now();
var stale_cached_worker_time = performance.now();
function fetch_models(onDoneCallback) {
	if (localflag) {
		onDoneCallback(selected_models);
		return;
	}

	if (cached_model_list != null && cached_model_list.length > 1 && performance.now() < stale_cached_model_time) {
		console.log("Reuse cached model list");
		onDoneCallback(cached_model_list);
		return;
	}

	//fetch the model list
	fetch(horde_models_endpoint)
		.then(x => x.json())
		.then(data => {
			cached_model_list = data;
			stale_cached_model_time = performance.now() + 30000; //cache model list for 30s
			onDoneCallback(cached_model_list);
		}).catch((error) => {
			console.log("Error: " + error);
			if (!is_popup_open()) {
				msgbox("Failed to fetch models!\nPlease check your network connection.");
			}
		});
}

function fetch_koboldcpp_perf() {
	fetch(apply_proxy_url(custom_kobold_endpoint + koboldcpp_perf_endpoint))
		.then(x => x.json())
		.then(resp => {
			console.log(resp);
			if (resp) {
				let perfs = "";
				if (koboldcpp_version_obj) {
					for (let key in koboldcpp_version_obj) {
						if (koboldcpp_version_obj.hasOwnProperty(key)) {
							let val = koboldcpp_version_obj[key];
							if (typeof val === "number" && !Number.isInteger(val)) {
								val = val.toFixed(2);
							}
							perfs += perfs == "" ? `` : `\n`;
							perfs += `${key}: ${val}`;
						}
					}
				}
				for (let key in resp) {
					if (resp.hasOwnProperty(key)) {
						let val = resp[key];
						if (typeof val === "number" && !Number.isInteger(val)) {
							val = val.toFixed(2);
						}
						perfs += `\n${key}: ${val}`;
					}
				}

				msgbox(perfs, "KoboldCpp Server Status");
			} else {
				msgbox("KoboldCpp Server Error", "KoboldCpp Server Status");
			}
		}).catch((error) => {
			console.log("Perf Error: " + error);
			msgbox("KoboldCpp Server Inaccessible", "KoboldCpp Server Status");
		});
}

//function to allow selection of models
function display_horde_models() {
	document.getElementById("pickedmodel").innerHTML = "";
	document.getElementById("apikey").value = localsettings.my_api_key;
	document.getElementById("modelquicksearch").value = "";
	let manualworker = document.getElementById("manualworker").checked ? true : false;

	let modelsdone = false;
	let workersdone = false;
	let postfetchdone = false;
	function onBothFetchesDone() {
		if (!postfetchdone) {
			postfetchdone = true;

			if (manualworker) {
				let model_choices = "";
				for (let i = 0; i < worker_data.length; ++i) {
					let curr = worker_data[i];
					let cm = (curr.models && curr.models.length > 0) ? curr.models[0] : "None";
					let cn = curr.name;
					let style = curr.trusted ? 'style="color:#b700ff;"' : "";
					style = curr.maintenance_mode ? 'style="color:#ee4444;"' : style;
					let extratag = curr.trusted ? " 💜" : "";
					extratag = curr.maintenance_mode ? " ⛔" : extratag;
					let warndebugtag = cm.toLowerCase().includes("debug-") ? " ⚠️" : "";
					let alrselected = (selected_workers.filter(x => (x.name == curr.name)).length > 0) ? " selected" : "";
					model_choices += "<option " + style + ' value="' + i + '" ' + alrselected + ">" + escape_html(cn) + " (" + escape_html(cm) + ")"
						+ extratag + warndebugtag + "</option>";
				}
				document.getElementById("pickedmodel").innerHTML = model_choices;
			} else {
				let model_choices = "";
				for (let i = 0; i < models_data.length; ++i) {
					let curr = models_data[i];
					let alrselected = (selected_models.filter(x => (x.name == curr.name)).length > 0) ? " selected" : "";
					let mperf = parseFloat(curr.performance);
					if (!mperf || isNaN(mperf) || mperf >= 99999) { //a patch before the performance is properly fixed, we calculate it ourselves
						let assocworkers = worker_data.filter(x => (x.models.includes(curr.name)));
						if (assocworkers.length > 0) {
							mperf = 0;
							for (let j = 0; j < assocworkers.length; ++j) {
								let elem = assocworkers[j];
								let tokenspersec = elem.performance.replace(" tokens per second", "");
								if (tokenspersec.toLowerCase() == "no requests fulfilled yet") {
									tokenspersec = 0;
								}
								mperf += parseFloat(tokenspersec);
							}
							mperf /= assocworkers.length * 1.0;
							mperf = mperf.toFixed(1);
						}
					}
					let warndebugtag = curr.name.toLowerCase().includes("debug-") ? " ⚠️" : "";
					model_choices += '<option value="' + i + '" ' + alrselected + ">" + escape_html(curr.name) + warndebugtag + " (ETA: " + curr.eta
						+ "s, Queue: " + curr.queued + ", Speed: " + mperf + ", Qty: " + curr.count + ")</option>";
				}
				document.getElementById("pickedmodel").innerHTML = model_choices;
			}
		}
	}

	//fetch the model list
	fetch_models((mdls) => {
		models_data = mdls;
		modelsdone = true;
		if (modelsdone && workersdone) {
			onBothFetchesDone();
		}
	});

	get_workers((wdata) => {
		worker_data = wdata;
		workersdone = true;
		if (modelsdone && workersdone) {
			onBothFetchesDone();

			//track earnings if possible
			track_kudos_earnings(wdata);
		}
	});
}

function model_quick_search() {
	let pickedparent = document.getElementById("pickedmodel");
	let pickedentries = pickedparent.children;
	let searchstr = document.getElementById("modelquicksearch").value.trim().toLowerCase();
	for (let i = 0; i < pickedentries.length; i++) {
		let schild = pickedentries[i];
		if (searchstr == "" || schild.text.trim().toLowerCase().includes(searchstr)) {
			schild.style.display = "block";
		} else {
			schild.style.display = "none";
		}
	}
}

function confirm_horde_models() {
	let selected_idx_arr = Array.from(document.getElementById("pickedmodel").selectedOptions).map(({ value }) => value);

	custom_kobold_endpoint = "";
	custom_oai_key = "";
	custom_claude_key = "";
	custom_gemini_key = "";
	custom_cohere_key = "";

	let prep_sel_models = [];
	let prep_sel_workers = []; //if selected, pick a specific worker ids to use

	let manualworker = document.getElementById("manualworker").checked ? true : false;

	if (selected_idx_arr.length == 0) { //select everything
		manualworker = false;
		for (let i = 0; i < models_data.length; ++i) {
			prep_sel_models.push(models_data[i]);
		}
	} else {
		for (var i = 0; i < selected_idx_arr.length; ++i) {
			if (manualworker) { //we are looping through selected workers
				let addedworker = worker_data[selected_idx_arr[i]];
				prep_sel_workers.push(addedworker);
				let modnames = addedworker.models;
				for (var j = 0; j < modnames.length; ++j) {
					let addedmodel = models_data.find(element => (element.name == modnames[j]));
					if (!prep_sel_models.includes(addedmodel)) {
						prep_sel_models.push(addedmodel);
					}
				}
			} //we are looping through selected models
			else {
				let addedmodel = models_data[selected_idx_arr[i]];
				prep_sel_models.push(addedmodel);
			}
		}
	}

	//remove undefined and nulls
	prep_sel_models = prep_sel_models.filter(x => x);
	prep_sel_workers = prep_sel_workers.filter(x => x);

	selected_models = prep_sel_models;
	selected_workers = prep_sel_workers;
	localsettings.my_api_key = document.getElementById("apikey").value;
	if (localsettings.my_api_key == null || localsettings.my_api_key == "") {
		localsettings.my_api_key = defaultsettings.my_api_key;
	}

	render_gametext();
	hide_popups();

	document.getElementById("connectstatus").innerHTML = "AI Horde";
}

function delete_my_worker(index) {
	if (lastValidFoundUserWorkers && lastValidFoundUserWorkers.length > index) {
		let elem = lastValidFoundUserWorkers[index];
		msgboxYesNo(
			`Are you sure you want to delete the worker <span class='color_orange'>` + elem.name + `</span> with the ID <span class='color_orange'>`
				+ elem.id + `</span>?<br><br><b>This action is irreversible!</b>`,
			"Confirm Delete Worker",
			() => {
				let newapikey = document.getElementById("apikey").value;
				fetch(horde_maintenance_endpoint + "/" + elem.id, {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
						apikey: newapikey,
					},
				})
					.then((response) => response.json())
					.then((data) => {
						msgbox(JSON.stringify(data), "Delete My Worker");
					})
					.catch((error) => {
						console.error("Error:", error);
					});
				hide_popups();
			},
			() => {
			},
			true,
		);
	}
}

function update_my_workers() {
	let newapikey = document.getElementById("apikey").value;
	for (var i = 0; i < lastValidFoundUserWorkers.length; ++i) {
		let desc = document.getElementById("mwc_desc_" + i);
		let maint = document.getElementById("mwc_maint_" + i);
		if (desc && maint) {
			if (
				(desc.value.trim() != "" && (lastValidFoundUserWorkers[i].info == null || lastValidFoundUserWorkers[i].info != desc.value))
				|| (desc.value.trim() == "" && lastValidFoundUserWorkers[i].info != null && lastValidFoundUserWorkers[i].info != "")
				|| (maint.checked != lastValidFoundUserWorkers[i].maintenance_mode)
			) {
				console.log("updating worker " + lastValidFoundUserWorkers[i].id);
				let wo = { maintenance: maint.checked };
				if (
					desc.value.trim() != ""
					|| (desc.value.trim() == "" && lastValidFoundUserWorkers[i].info != null && lastValidFoundUserWorkers[i].info != "")
				) {
					wo.info = desc.value.trim();
				}
				fetch(horde_maintenance_endpoint + "/" + lastValidFoundUserWorkers[i].id, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						apikey: newapikey,
					},
					body: JSON.stringify(wo),
				})
					.then((response) => response.json())
					.then((data) => {
						msgbox(JSON.stringify(data), "Update My Worker");
					})
					.catch((error) => {
						console.error("Error:", error);
					});
			}
		}
	}
}

var lastValidFoundUserData = null;
var lastValidFoundUserWorkers = [];
function fetch_kudo_balance() {
	if (localflag) {
		return;
	}
	let newapikey = document.getElementById("apikey").value;

	if (newapikey != null && newapikey.trim() != "") {
		document.getElementById("showownworkerslink").classList.add("hidden");
		document.getElementById("kudos_bal").innerHTML = "Checking...<br>&nbsp;";

		fetch(horde_finduser_endpoint, {
			method: "GET",
			headers: {
				apikey: newapikey,
			},
		})
			.then((response) => response.json())
			.then((data) => {
				console.log(data);
				lastValidFoundUserData = null;
				if (data && data.username != null && data.username != "") {
					lastValidFoundUserData = data;
					let uname = data.username;
					let kuds = data.kudos;
					let unameurl = "<a class='color_blueurl' href='#' onclick='show_my_own_workers()'>" + uname + "</a>";
					if (kuds < 0) {
						document.getElementById("kudos_bal").innerHTML = unameurl + "<br>Kudos Balance: 0";
						if (uname.toLowerCase() == "anonymous#0") {
							document.getElementById("kudos_bal").innerHTML = uname + "<br>"
								+ "<a class='color_blueurl' href='https://aihorde.net/register'>(Register New User)</a>";
						} else {
							document.getElementById("showownworkerslink").classList.remove("hidden");
						}
					} else {
						document.getElementById("kudos_bal").innerHTML = unameurl + "<br>Kudos Balance: " + kuds;
						document.getElementById("showownworkerslink").classList.remove("hidden");
					}
				} else {
					document.getElementById("kudos_bal").innerHTML =
						"API Key Error<br><a class='color_blueurl' href='https://aihorde.net/register'>(Register New User)</a>";
				}
			})
			.catch((error) => {
				console.log("Error: " + error);
				document.getElementById("kudos_bal").innerHTML =
					"API Key Error<br><a class='color_blueurl' href='https://aihorde.net/register'>(Register New User)</a>";
			});
	}
}

function reset_horde_selection() {
	document.getElementById("pickedmodel").selectedIndex = -1;
}

function inputboxfocus() {
	document.getElementById("inputboxcontainerinput").type = "text";
}
function inputboxblur() {
	document.getElementById("inputboxcontainerinput").type = inputboxIsPassword ? "password" : "text";
}

function focus_api_keys() {
	var x = document.getElementById("apikey");
	if (x && x.type === "password") {
		x.type = "text";
	}
	x = document.getElementById("custom_oai_key");
	if (x && x.type === "password") {
		x.type = "text";
	}
	x = document.getElementById("custom_claude_key");
	if (x && x.type === "password") {
		x.type = "text";
	}
	x = document.getElementById("customkoboldkey");
	if (x && x.type === "password") {
		x.type = "text";
	}
	x = document.getElementById("custom_cohere_key");
	if (x && x.type === "password") {
		x.type = "text";
	}
	x = document.getElementById("custom_gemini_key");
	if (x && x.type === "password") {
		x.type = "text";
	}
}
function blur_api_keys() {
	var x = document.getElementById("apikey");
	if (x && x.type === "text") {
		x.type = "password";
	}
	x = document.getElementById("custom_oai_key");
	if (x && x.type === "text") {
		x.type = "password";
	}
	x = document.getElementById("custom_claude_key");
	if (x && x.type === "text") {
		x.type = "password";
	}
	x = document.getElementById("customkoboldkey");
	if (x && x.type === "text") {
		x.type = "password";
	}
	x = document.getElementById("custom_cohere_key");
	if (x && x.type === "text") {
		x.type = "password";
	}
	x = document.getElementById("custom_gemini_key");
	if (x && x.type === "text") {
		x.type = "password";
	}
}

var current_settings_tab_idx = 0;
function display_settings_tab(tabidx) {
	current_settings_tab_idx = tabidx;
	document.getElementById("settingsmenusamplers_tab").classList.remove("active");
	document.getElementById("settingsmenuformat_tab").classList.remove("active");
	document.getElementById("settingsmenumedia_tab").classList.remove("active");
	document.getElementById("settingsmenutokens_tab").classList.remove("active");
	document.getElementById("settingsmenuadvanced_tab").classList.remove("active");

	document.getElementById("settingsmenusamplers").classList.add("hidden");
	document.getElementById("settingsmenuformat").classList.add("hidden");
	document.getElementById("settingsmenumedia").classList.add("hidden");
	document.getElementById("settingsmenutokens").classList.add("hidden");
	document.getElementById("settingsmenuadvanced").classList.add("hidden");

	switch (tabidx) {
		case 0: //format
			document.getElementById("settingsmenuformat").classList.remove("hidden");
			document.getElementById("settingsmenuformat_tab").classList.add("active");
			break;
		case 1: //samplers
			document.getElementById("settingsmenusamplers").classList.remove("hidden");
			document.getElementById("settingsmenusamplers_tab").classList.add("active");
			break;
		case 2: //media
			document.getElementById("settingsmenumedia").classList.remove("hidden");
			document.getElementById("settingsmenumedia_tab").classList.add("active");
			break;
		case 3: //tokens
			document.getElementById("settingsmenutokens").classList.remove("hidden");
			document.getElementById("settingsmenutokens_tab").classList.add("active");
			break;
		case 4: //advanced
			document.getElementById("settingsmenuadvanced").classList.remove("hidden");
			document.getElementById("settingsmenuadvanced_tab").classList.add("active");
			break;
		default:
			break;
	}
}

function display_settings() {
	mainmenu_untab(true);
	document.getElementById("settingscontainer").classList.remove("hidden");
	display_settings_tab(current_settings_tab_idx);
	document.getElementById("max_context_length").value = document.getElementById("max_context_length_slide").value = localsettings
		.max_context_length;
	document.getElementById("max_length").value = document.getElementById("max_length_slide").value = localsettings.max_length;
	document.getElementById("temperature").value = document.getElementById("temperature_slide").value = localsettings.temperature;
	document.getElementById("rep_pen").value = document.getElementById("rep_pen_slide").value = localsettings.rep_pen;
	document.getElementById("rep_pen_slope").value = localsettings.rep_pen_slope;
	document.getElementById("rep_pen_range").value = localsettings.rep_pen_range;
	document.getElementById("top_p").value = document.getElementById("top_p_slide").value = localsettings.top_p;
	document.getElementById("autoscroll").checked = localsettings.autoscroll;
	document.getElementById("printer_view").checked = localsettings.printer_view;
	document.getElementById("viewport_width_mode").value = localsettings.viewport_width_mode;
	document.getElementById("export_settings").checked = localsettings.export_settings;
	document.getElementById("show_advanced_load").checked = localsettings.show_advanced_load;
	document.getElementById("import_tavern_prompt").checked = localsettings.import_tavern_prompt;
	document.getElementById("invert_colors").checked = localsettings.invert_colors;
	document.getElementById("sidepanel_mode").checked = localsettings.sidepanel_mode;
	document.getElementById("trimsentences").checked = localsettings.trimsentences;
	document.getElementById("trimwhitespace").checked = localsettings.trimwhitespace;
	document.getElementById("compressnewlines").checked = localsettings.compressnewlines;
	document.getElementById("render_special_tags").checked = localsettings.render_special_tags;
	document.getElementById("request_logprobs").checked = localsettings.request_logprobs;
	document.getElementById("eos_ban_mode").value = localsettings.eos_ban_mode;
	document.getElementById("persist_session").checked = localsettings.persist_session;
	document.getElementById("opmode").value = localsettings.opmode;
	document.getElementById("chatname").value = localsettings.chatname;
	document.getElementById("chatopponent").value = replaceAll(localsettings.chatopponent, "||$||", "\n");
	handle_bot_name_onchange();
	document.getElementById("instruct_starttag").value = localsettings.instruct_starttag;
	document.getElementById("instruct_systag").value = localsettings.instruct_systag;
	let sp = replaceAll(localsettings.instruct_sysprompt, "\n", "\\n");
	document.getElementById("instruct_sysprompt").value = sp;
	document.getElementById("instruct_endtag").value = localsettings.instruct_endtag;
	document.getElementById("instruct_starttag_end").value = localsettings.instruct_starttag_end;
	document.getElementById("instruct_systag_end").value = localsettings.instruct_systag_end;
	document.getElementById("instruct_endtag_end").value = localsettings.instruct_endtag_end;
	document.getElementById("raw_instruct_tags").checked = localsettings.raw_instruct_tags;
	document.getElementById("show_endpoint_selector").checked = localsettings.show_endpoint_selector;
	document.getElementById("render_streaming_markdown").checked = localsettings.render_streaming_markdown;
	document.getElementById("min_p").value = localsettings.min_p;
	document.getElementById("dynatemp_range").value = localsettings.dynatemp_range;
	document.getElementById("dynatemp_exponent").value = localsettings.dynatemp_exponent;
	document.getElementById("smoothing_factor").value = localsettings.smoothing_factor;
	document.getElementById("nsigma").value = localsettings.nsigma;
	document.getElementById("dynatemp_overview").innerText = localsettings.dynatemp_range != 0 ? "ON" : "OFF";
	document.getElementById("presence_penalty").value = localsettings.presence_penalty;
	document.getElementById("sampler_seed").value = localsettings.sampler_seed;
	document.getElementById("top_k").value = document.getElementById("top_k_slide").value = localsettings.top_k;
	document.getElementById("top_a").value = localsettings.top_a;
	document.getElementById("typ_s").value = localsettings.typ_s;
	document.getElementById("tfs_s").value = localsettings.tfs_s;
	document.getElementById("miro_type").value = localsettings.miro_type;
	document.getElementById("miro_tau").value = localsettings.miro_tau;
	document.getElementById("miro_eta").value = localsettings.miro_eta;
	document.getElementById("dry_multiplier").value = localsettings.dry_multiplier;
	document.getElementById("xtc_threshold").value = localsettings.xtc_threshold;
	document.getElementById("xtc_probability").value = localsettings.xtc_probability;
	document.getElementById("dry_base").value = localsettings.dry_base;
	document.getElementById("dry_allowed_length").value = localsettings.dry_allowed_length;
	document.getElementById("token_count_multiplier").value = localsettings.token_count_multiplier;

	if (is_using_kcpp_with_mirostat()) {
		document.getElementById("mirosupporteddiv").classList.remove("hidden");
		document.getElementById("mirounsupporteddiv").classList.add("hidden");
	} else {
		document.getElementById("mirosupporteddiv").classList.add("hidden");
		document.getElementById("mirounsupporteddiv").classList.remove("hidden");
	}

	if (is_using_kcpp_with_dry()) {
		document.getElementById("drysupporteddiv").classList.remove("hidden");
		document.getElementById("dryunsupporteddiv").classList.add("hidden");
	} else {
		document.getElementById("drysupporteddiv").classList.add("hidden");
		document.getElementById("dryunsupporteddiv").classList.remove("hidden");
	}

	if (is_using_kcpp_with_xtc()) {
		document.getElementById("xtcsupporteddiv").classList.remove("hidden");
		document.getElementById("xtcunsupporteddiv").classList.add("hidden");
	} else {
		document.getElementById("xtcsupporteddiv").classList.add("hidden");
		document.getElementById("xtcunsupporteddiv").classList.remove("hidden");
	}
	pendingsequencebreakers = localsettings.dry_sequence_breakers;
	pendingassistantjailbreak = localsettings.custom_jailbreak_text;

	document.getElementById("setgrammar").disabled = !is_using_kcpp_with_grammar();
	document.getElementById("voice_typing_mode").disabled = !is_using_kcpp_with_whisper();
	document.getElementById("transcribe_file_btn").disabled = !is_using_kcpp_with_whisper();
	document.getElementById("grammar_retain_state").disabled = document.getElementById("setgrammar").disabled;

	if (custom_kobold_endpoint == "" && custom_oai_key == "" && custom_gemini_key == "") {
		document.getElementById("tokenstreaminglabel").classList.add("color_red");
	} else {
		document.getElementById("tokenstreaminglabel").classList.remove("color_red");
	}
	document.getElementById("generate_images_model").value = localsettings.generate_images_model;
	if (
		document.getElementById("generate_images_mode").value == 0
		|| document.getElementById("generate_images_mode").value != localsettings.generate_images_mode
	) {
		document.getElementById("generate_images_mode").value = localsettings.generate_images_mode;
		toggle_generate_images_mode(true);
	}
	document.getElementById("multiline_replies").checked = localsettings.multiline_replies;
	document.getElementById("allow_continue_chat").checked = localsettings.allow_continue_chat;
	document.getElementById("chat_match_any_name").checked = localsettings.chat_match_any_name;
	document.getElementById("inject_timestamps").checked = localsettings.inject_timestamps;
	document.getElementById("inject_chatnames_instruct").checked = localsettings.inject_chatnames_instruct;
	document.getElementById("inject_jailbreak_instruct").checked = localsettings.inject_jailbreak_instruct;
	document.getElementById("separate_end_tags").checked = localsettings.separate_end_tags;
	document.getElementById("idle_responses").value = localsettings.idle_responses;
	document.getElementById("idle_duration").value = localsettings.idle_duration;
	document.getElementById("fix_alpaca_leak").checked = localsettings.fix_alpaca_leak;
	document.getElementById("adventure_context_mod").checked = localsettings.adventure_context_mod;
	document.getElementById("chat_context_mod").checked = localsettings.chat_context_mod;
	document.getElementById("instruct_has_markdown").checked = localsettings.instruct_has_markdown;
	document.getElementById("instruct_has_latex").checked = localsettings.instruct_has_latex;
	document.getElementById("placeholder_tags").checked = localsettings.placeholder_tags;
	document.getElementById("inject_randomness_seed").value = localsettings.inject_randomness_seed;
	document.getElementById("run_in_background").checked = run_in_background;
	document.getElementById("auto_ctxlen").checked = localsettings.auto_ctxlen;
	document.getElementById("auto_genamt").checked = localsettings.auto_genamt;
	document.getElementById("wordsearch_toggle").checked = localsettings.wordsearch_enabled;
	if (localflag) {
		document.getElementById("auto_ctxlen_panel").classList.add("hidden");
		document.getElementById("auto_genamt_panel").classList.add("hidden");
	} else {
		document.getElementById("auto_ctxlen_panel").classList.remove("hidden");
		document.getElementById("auto_genamt_panel").classList.remove("hidden");
	}

	document.getElementById("imagestyleinput").value = localsettings.image_styles;
	document.getElementById("negpromptinput").value = localsettings.image_negprompt;
	pendinggrammar = localsettings.grammar;

	//prepare the input for sampler order
	let samplerstr = localsettings.sampler_order.toString();
	document.getElementById("sampler_order").value = samplerstr;

	//populate the sampler presets list
	let npresets = "";
	for (var i = 0; i < samplerpresets.length; ++i) {
		npresets += `<option value="` + i + `" title="` + samplerpresets[i].description + `">` + samplerpresets[i].preset + `</option>`;
	}
	npresets += `<option value="9999" title="User Defined Settings">[Custom]</option>`;
	document.getElementById("samplerpresets").innerHTML = npresets;
	document.getElementById("samplerpresets").value = localsettings.last_selected_preset;

	//populate instruct presets
	let inspresets = `<option value="0">[Custom]</option>`;
	for (let i = 0; i < instructpresets.length; ++i) {
		inspresets += `<option value="${i + 1}">${instructpresets[i].name}</option>`;
	}
	document.getElementById("instruct_tag_format").innerHTML = inspresets;
	edit_instruct_tag_format();

	var ttshtml = '<option value="0">Disabled</option>';
	ttshtml += '<option value="1000">XTTS API Server</option>';
	ttshtml += '<option value="1001">AllTalk API Server</option>';
	ttshtml += '<option value="1002">OpenAI-Compat. API Server</option>';
	ttshtml += '<option value="1003">KoboldCpp TTS API</option>';
	ttshtml += '<option value="1004">PollinationsAI TTS API</option>';

	if ("speechSynthesis" in window) {
		let voices = window.speechSynthesis.getVoices();
		console.log("speech synth available: " + voices.length);
		for (var i = 0; i < voices.length; ++i) {
			ttshtml += '<option value="' + (i + 1) + '">' + voices[i].name + "</option>";
		}
	} else {
		console.log("No speech synth available");
	}
	document.getElementById("ttsselect").innerHTML = ttshtml;
	document.getElementById("ttsselect").value = localsettings.speech_synth;
	document.getElementById("kcpp_tts_voice").value = localsettings.kcpp_tts_voice;
	kcpp_tts_json = localsettings.kcpp_tts_json;
	toggle_tts_mode();
	document.getElementById("beep_on").checked = localsettings.beep_on;
	document.getElementById("notify_on").checked = localsettings.notify_on;
	document.getElementById("no_escape_html").checked = no_escape_html;
	document.getElementById("narrate_both_sides").checked = localsettings.narrate_both_sides;
	document.getElementById("narrate_only_dialog").checked = localsettings.narrate_only_dialog;
	document.getElementById("tts_speed").value = localsettings.tts_speed;
	document.getElementById("voice_end_delay").value = localsettings.voice_end_delay;
	document.getElementById("voice_suppress_nonspeech").checked = localsettings.voice_suppress_nonspeech;
	document.getElementById("voice_langcode").value = localsettings.voice_langcode;
	toggle_opmode();

	//stop seq and tokens
	document.getElementById("extrastopseq").value = localsettings.extrastopseq;
	document.getElementById("tokenbans").value = localsettings.tokenbans;
	document.getElementById("logitbiastxtarea").value = JSON.stringify(localsettings.logitbiasdict, null, 2);
	if (custom_kobold_endpoint != "" || !is_using_custom_ep()) {
		document.getElementById("noextrastopseq").classList.add("hidden");
	} else {
		document.getElementById("noextrastopseq").classList.remove("hidden");
	}
	document.getElementById("websearch_enabled").checked = localsettings.websearch_enabled;
	document.getElementById("websearch_multipass").checked = localsettings.websearch_multipass;
	document.getElementById("websearch_retain").checked = localsettings.websearch_retain;
	document.getElementById("websearch_template").value = localsettings.websearch_template == ""
		? default_websearch_template
		: localsettings.websearch_template;
	if (is_using_kcpp_with_websearch()) {
		document.getElementById("websearchunsupporteddiv").classList.add("hidden");
	} else {
		document.getElementById("websearchunsupporteddiv").classList.remove("hidden");
	}
	if (is_using_custom_ep()) {
		document.getElementById("nologitbias").classList.add("hidden");
		document.getElementById("notokenbans").classList.add("hidden");
		if (is_using_kcpp_with_added_memory()) {
			document.getElementById("newlogitbiasstringtogglesection").classList.remove("hidden");
		} else {
			document.getElementById("newlogitbiasstringtogglesection").classList.add("hidden");
			document.getElementById("newlogitbiasstringtoggle").checked = false;
		}
		if (is_using_kcpp_with_guidance()) {
			document.getElementById("noguidance").classList.add("hidden");
		} else {
			document.getElementById("noguidance").classList.remove("hidden");
		}
	} else {
		document.getElementById("nologitbias").classList.remove("hidden");
		document.getElementById("notokenbans").classList.remove("hidden");
		document.getElementById("noguidance").classList.remove("hidden");
		document.getElementById("newlogitbiasstringtogglesection").classList.add("hidden");
		document.getElementById("newlogitbiasstringtoggle").checked = false;
	}
	document.getElementById("guidance_scale").value = localsettings.guidance_scale;
	document.getElementById("guidance_prompt").value = localsettings.guidance_prompt;
	toggle_logit_bias_string();
	populate_placeholder_tags();
	populate_regex_replacers();

	//sd models display
	update_horde_sdmodels();

	document.getElementById("tokenstreammode").value = localsettings.tokenstreammode;
	document.getElementById("img_allowhd").checked = localsettings.img_allowhd;
	document.getElementById("img_crop").checked = localsettings.img_crop;
	document.getElementById("img_newturn").checked = localsettings.img_newturn;
	document.getElementById("img_stacking").checked = localsettings.img_stacking;
	document.getElementById("img_autogen_type").value = localsettings.img_autogen_type;
	document.getElementById("img_gen_from_instruct").checked = localsettings.img_gen_from_instruct;
	document.getElementById("save_images").checked = localsettings.save_images;
	document.getElementById("save_remote_images").checked = localsettings.save_remote_images;
	document.getElementById("img_cfgscale").value = localsettings.img_cfgscale;
	document.getElementById("img_img2imgstr").value = localsettings.img_img2imgstr;
	document.getElementById("img_clipskip").value = localsettings.img_clipskip;
	document.getElementById("img_aspect").value = localsettings.img_aspect;
	document.getElementById("img_sampler").value = localsettings.img_sampler;
	document.getElementById("img_steps").value = localsettings.img_steps;
	document.getElementById("prompt_for_savename").checked = localsettings.prompt_for_savename;
	document.getElementById("img_allownsfw").checked = localsettings.img_allownsfw;
	setting_tweaked();
}

function update_horde_sdmodels() {
	let sdmodelshtml = "";
	for (var i = 0; i < stablemodels.length; ++i) {
		sdmodelshtml += '<option value="' + stablemodels[i].name + '" '
			+ (stablemodels[i].name == localsettings.generate_images_model ? "selected" : "") + ">" + stablemodels[i].name + " ("
			+ stablemodels[i].count + ")</option>";
	}
	document.getElementById("generate_images_model").innerHTML = sdmodelshtml;
}

function toggle_preset() {
	let selp = document.getElementById("samplerpresets").value;
	let found = samplerpresets[selp];
	if (found) {
		document.getElementById("temperature").value = document.getElementById("temperature_slide").value = found.temp;
		document.getElementById("presence_penalty").value = found.presence_penalty;
		document.getElementById("min_p").value = found.min_p;
		document.getElementById("dynatemp_range").value = found.dynatemp_range;
		document.getElementById("dynatemp_exponent").value = found.dynatemp_exponent;
		document.getElementById("smoothing_factor").value = found.smoothing_factor;
		document.getElementById("nsigma").value = found.nsigma;
		document.getElementById("top_k").value = document.getElementById("top_k_slide").value = found.top_k;
		document.getElementById("top_p").value = document.getElementById("top_p_slide").value = found.top_p;
		document.getElementById("top_a").value = found.top_a;
		document.getElementById("typ_s").value = found.typical;
		document.getElementById("tfs_s").value = found.tfs;
		document.getElementById("miro_type").value = 0;
		document.getElementById("dry_multiplier").value = 0;
		document.getElementById("xtc_probability").value = 0;
		document.getElementById("sampler_seed").value = -1;
		document.getElementById("rep_pen").value = document.getElementById("rep_pen_slide").value = found.rep_pen;
		document.getElementById("rep_pen_range").value = found.rep_pen_range;
		document.getElementById("rep_pen_slope").value = found.rep_pen_slope;
		document.getElementById("sampler_order").value = found.sampler_order.toString();
		document.getElementById("presetsdesc").innerText = found.description;
		document.getElementById("dynatemp_overview").innerText = document.getElementById("dynatemp_range").value != 0 ? "ON" : "OFF";
	} else {
		document.getElementById("presetsdesc").innerText = "";
	}
}

function validate_sd_model() {
	var inputmodel = document.getElementById("generate_images_model").value;
	let matched = false;
	for (var i = 0; i < stablemodels.length; ++i) {
		var matcher = stablemodels[i].name + " (" + stablemodels[i].count + ")";
		if (inputmodel == matcher || inputmodel == stablemodels[i].name) {
			document.getElementById("generate_images_model").value = stablemodels[i].name;
			matched = true;
			break;
		}
	}
	if (!matched) {
		document.getElementById("generate_images_model").value = defaultsettings.generate_images_model;
	}
}

function validate_samplers(savesetting = false) {
	let samplerstr = document.getElementById("sampler_order").value;
	let sarr = samplerstr.split(",");
	let validatorarr = [0, 1, 2, 3, 4, 5, 6];
	let passval = true;
	for (a in sarr) {
		let p = parseInt(sarr[a], 10);
		if (!isNaN(p) && validatorarr.includes(p)) {
			sarr[a] = p;
			validatorarr[p] = undefined;
		} else {
			passval = false;
		}
	}
	if (sarr.length == 7 && passval) {
		if (savesetting) {
			localsettings.sampler_order = sarr;
		}
		document.getElementById("sampler_order").value = sarr.toString();
	} else {
		if (savesetting) {
			localsettings.sampler_order = defaultsettings.sampler_order;
		}
		document.getElementById("sampler_order").value = defaultsettings.sampler_order.toString();
	}
}

//check if any setting is modified from current preset, and set to custom if so
function setting_tweaked() {
	let selp = document.getElementById("samplerpresets").value;
	let found = samplerpresets[selp];
	if (found && selp != 9999) {
		document.getElementById("presetsdesc").innerText = found.description;
		let changed = document.getElementById("temperature").value != found.temp
			|| document.getElementById("presence_penalty").value != found.presence_penalty
			|| document.getElementById("min_p").value != found.min_p
			|| document.getElementById("dynatemp_range").value != found.dynatemp_range
			|| document.getElementById("dynatemp_exponent").value != found.dynatemp_exponent
			|| document.getElementById("smoothing_factor").value != found.smoothing_factor
			|| document.getElementById("nsigma").value != found.nsigma
			|| document.getElementById("top_k").value != found.top_k
			|| document.getElementById("top_p").value != found.top_p
			|| document.getElementById("top_a").value != found.top_a
			|| document.getElementById("typ_s").value != found.typical
			|| document.getElementById("tfs_s").value != found.tfs
			|| document.getElementById("miro_type").value != 0
			|| document.getElementById("dry_multiplier").value != 0
			|| document.getElementById("xtc_probability").value != 0
			|| document.getElementById("sampler_seed").value != -1
			|| document.getElementById("rep_pen").value != found.rep_pen
			|| document.getElementById("rep_pen_range").value != found.rep_pen_range
			|| document.getElementById("rep_pen_slope").value != found.rep_pen_slope
			|| document.getElementById("sampler_order").value != found.sampler_order.toString();
		if (changed) {
			document.getElementById("samplerpresets").value = 9999;
			document.getElementById("presetsdesc").innerText = "Custom settings with modified settings.";
		}
	} else {
		document.getElementById("presetsdesc").innerText = "Custom settings with modified settings.";
	}
}

function update_for_sidepanel() {
	if (localsettings.sidepanel_mode) {
		display_settings();
		btn_memory();
	}
}

function toggle_sidepanel_mode() {
	if (window.innerWidth <= 600) { //sidepanel mode cannot be used on mobile
		document.getElementById("sidepanel_mode").checked = localsettings.sidepanel_mode = false;
	}
	if (localsettings.sidepanel_mode) {
		document.getElementById("settingscontainerbg").classList.add("hidden");
		document.getElementById("settingscontainerfg").classList.add("sidepanelsize");
		document.getElementById("memorycontainerbg").classList.add("hidden");
		document.getElementById("memorycontainerfg").classList.add("sidepanelsize");
		document.getElementById("settingscontainer").classList.add("side");
		document.getElementById("memorycontainer").classList.add("sideright");
		document.getElementById("maincontainer").classList.add("centeredcontainer");
		document.getElementById("settingscontainerfooter").classList.add("hidden");
		document.getElementById("memorycontainerfooter").classList.add("hidden");
		document.getElementById("settingscontainerfooter2").classList.remove("hidden");
		document.getElementById("memorycontainerfooter2").classList.remove("hidden");
		if (document.getElementById("settingscontainer").classList.contains("hidden")) {
			display_settings();
		}
		if (document.getElementById("memorycontainer").classList.contains("hidden")) {
			btn_memory();
		}
	} else {
		document.getElementById("settingscontainerbg").classList.remove("hidden");
		document.getElementById("settingscontainerfg").classList.remove("sidepanelsize");
		document.getElementById("memorycontainerbg").classList.remove("hidden");
		document.getElementById("memorycontainerfg").classList.remove("sidepanelsize");
		document.getElementById("settingscontainer").classList.remove("side");
		document.getElementById("memorycontainer").classList.remove("sideright");
		document.getElementById("maincontainer").classList.remove("centeredcontainer");
		document.getElementById("settingscontainerfooter").classList.remove("hidden");
		document.getElementById("memorycontainerfooter").classList.remove("hidden");
		document.getElementById("settingscontainerfooter2").classList.add("hidden");
		document.getElementById("memorycontainerfooter2").classList.add("hidden");
		document.getElementById("settingscontainer").classList.add("hidden");
		document.getElementById("memorycontainer").classList.add("hidden");
	}
}

function toggle_invert_colors() {
	if (localsettings.invert_colors) {
		document.body.classList.add("invert_colors");
	} else {
		document.body.classList.remove("invert_colors");
	}
}

function update_genimg_button_visiblility() {
	if (localsettings.generate_images_mode == 0) {
		document.getElementById("btn_inner_genimg_auto").disabled = true;
		document.getElementById("btn_inner_genimg_custom").disabled = true;
	} else {
		document.getElementById("btn_inner_genimg_auto").disabled = false;
		document.getElementById("btn_inner_genimg_custom").disabled = false;
	}

	if (a1111_is_connected && is_using_kcpp_with_added_memory()) {
		document.getElementById("btn_open_stableui").classList.remove("hidden");
	} else {
		document.getElementById("btn_open_stableui").classList.add("hidden");
	}
}

function update_websearch_button_visibility() {
	if (localsettings.websearch_enabled) {
		document.getElementById("btn_togglesearch").classList.remove("inactive");
		document.getElementById("btn_togglesearch2").classList.remove("inactive");
	} else {
		document.getElementById("btn_togglesearch").classList.add("inactive");
		document.getElementById("btn_togglesearch2").classList.add("inactive");
	}
	if (is_using_kcpp_with_websearch()) {
		document.getElementById("btn_togglesearch").classList.remove("hidden");
		document.getElementById("btn_togglesearch2").classList.remove("hidden");
	} else {
		document.getElementById("btn_togglesearch").classList.add("hidden");
		document.getElementById("btn_togglesearch2").classList.add("hidden");
	}
}

function confirm_chat_and_instruct_tags() {
	localsettings.chatname = document.getElementById("chatname").value;
	if (localsettings.chatname == null || localsettings.chatname == "") {
		localsettings.chatname = "User";
	}
	let newopps = replaceAll(document.getElementById("chatopponent").value, "\n", "||$||");
	if (localsettings.chatopponent != newopps) {
		groupchat_removals = [];
	}
	localsettings.chatopponent = newopps;
	localsettings.instruct_starttag = document.getElementById("instruct_starttag").value;
	localsettings.instruct_systag = document.getElementById("instruct_systag").value;
	localsettings.instruct_sysprompt = document.getElementById("instruct_sysprompt").value;
	localsettings.instruct_sysprompt = replaceAll(localsettings.instruct_sysprompt, "\\n", "\n");
	if (localsettings.instruct_starttag == null || localsettings.instruct_starttag == "") {
		localsettings.instruct_starttag = "{{[INPUT]}}";
	}
	localsettings.instruct_endtag = document.getElementById("instruct_endtag").value;
	if (localsettings.instruct_endtag == null || localsettings.instruct_endtag == "") {
		localsettings.instruct_endtag = "{{[OUTPUT]}}";
	}
	localsettings.instruct_starttag_end = document.getElementById("instruct_starttag_end").value;
	localsettings.instruct_endtag_end = document.getElementById("instruct_endtag_end").value;
	localsettings.instruct_systag_end = document.getElementById("instruct_systag_end").value;
}

function confirm_settings() {
	hide_popups();
	localsettings.max_context_length = parseInt(document.getElementById("max_context_length").value);
	localsettings.max_length = parseInt(document.getElementById("max_length").value);
	localsettings.temperature = parseFloat(document.getElementById("temperature").value);
	localsettings.rep_pen = parseFloat(document.getElementById("rep_pen").value);
	localsettings.rep_pen_slope = parseFloat(document.getElementById("rep_pen_slope").value);
	localsettings.rep_pen_range = parseInt(document.getElementById("rep_pen_range").value);
	localsettings.top_p = parseFloat(document.getElementById("top_p").value);
	localsettings.autoscroll = document.getElementById("autoscroll").checked ? true : false;
	localsettings.printer_view = document.getElementById("printer_view").checked ? true : false;
	localsettings.viewport_width_mode = document.getElementById("viewport_width_mode").value;
	localsettings.export_settings = document.getElementById("export_settings").checked ? true : false;
	localsettings.show_advanced_load = document.getElementById("show_advanced_load").checked ? true : false;
	localsettings.import_tavern_prompt = document.getElementById("import_tavern_prompt").checked ? true : false;
	localsettings.invert_colors = document.getElementById("invert_colors").checked ? true : false;
	localsettings.sidepanel_mode = document.getElementById("sidepanel_mode").checked ? true : false;
	localsettings.trimsentences = document.getElementById("trimsentences").checked ? true : false;
	localsettings.trimwhitespace = document.getElementById("trimwhitespace").checked ? true : false;
	localsettings.compressnewlines = document.getElementById("compressnewlines").checked ? true : false;
	localsettings.render_special_tags = document.getElementById("render_special_tags").checked ? true : false;
	localsettings.request_logprobs = document.getElementById("request_logprobs").checked ? true : false;
	localsettings.eos_ban_mode = document.getElementById("eos_ban_mode").value;
	localsettings.persist_session = document.getElementById("persist_session").checked ? true : false;
	localsettings.raw_instruct_tags = document.getElementById("raw_instruct_tags").checked ? true : false;
	localsettings.show_endpoint_selector = document.getElementById("show_endpoint_selector").checked ? true : false;
	localsettings.render_streaming_markdown = document.getElementById("render_streaming_markdown").checked ? true : false;
	if (document.getElementById("opmode").value == 1) {
		localsettings.gui_type_story = document.getElementById("gui_type").value;
	} else if (document.getElementById("opmode").value == 2) {
		localsettings.gui_type_adventure = document.getElementById("gui_type").value;
	} else if (document.getElementById("opmode").value == 3) {
		localsettings.gui_type_chat = document.getElementById("gui_type").value;
	} else if (document.getElementById("opmode").value == 4) {
		localsettings.gui_type_instruct = document.getElementById("gui_type").value;
	}
	localsettings.multiline_replies = document.getElementById("multiline_replies").checked ? true : false;
	localsettings.allow_continue_chat = document.getElementById("allow_continue_chat").checked ? true : false;
	localsettings.chat_match_any_name = document.getElementById("chat_match_any_name").checked ? true : false;
	localsettings.inject_timestamps = document.getElementById("inject_timestamps").checked ? true : false;
	localsettings.inject_chatnames_instruct = document.getElementById("inject_chatnames_instruct").checked ? true : false;
	localsettings.inject_jailbreak_instruct = document.getElementById("inject_jailbreak_instruct").checked ? true : false;
	localsettings.separate_end_tags = document.getElementById("separate_end_tags").checked ? true : false;
	localsettings.idle_responses = document.getElementById("idle_responses").value;
	localsettings.idle_duration = document.getElementById("idle_duration").value;
	localsettings.fix_alpaca_leak = document.getElementById("fix_alpaca_leak").checked ? true : false;
	localsettings.adventure_context_mod = document.getElementById("adventure_context_mod").checked ? true : false;
	localsettings.chat_context_mod = document.getElementById("chat_context_mod").checked ? true : false;
	localsettings.instruct_has_markdown = document.getElementById("instruct_has_markdown").checked ? true : false;
	localsettings.instruct_has_latex = document.getElementById("instruct_has_latex").checked ? true : false;
	localsettings.placeholder_tags = document.getElementById("placeholder_tags").checked ? true : false;
	localsettings.inject_randomness_seed = document.getElementById("inject_randomness_seed").value;
	run_in_background = document.getElementById("run_in_background").checked ? true : false;
	background_audio_loop(run_in_background);
	localsettings.generate_images_model = document.getElementById("generate_images_model").value;
	localsettings.generate_images_mode = document.getElementById("generate_images_mode").value;
	localsettings.opmode = document.getElementById("opmode").value;
	confirm_chat_and_instruct_tags();
	localsettings.sampler_seed = document.getElementById("sampler_seed").value;
	localsettings.min_p = parseFloat(document.getElementById("min_p").value);
	localsettings.dynatemp_range = parseFloat(document.getElementById("dynatemp_range").value);
	localsettings.dynatemp_exponent = parseFloat(document.getElementById("dynatemp_exponent").value);
	localsettings.smoothing_factor = parseFloat(document.getElementById("smoothing_factor").value);
	localsettings.nsigma = parseFloat(document.getElementById("nsigma").value);
	localsettings.presence_penalty = parseFloat(document.getElementById("presence_penalty").value);
	localsettings.top_k = parseInt(document.getElementById("top_k").value);
	localsettings.top_a = parseFloat(document.getElementById("top_a").value);
	localsettings.typ_s = parseFloat(document.getElementById("typ_s").value);
	localsettings.tfs_s = parseFloat(document.getElementById("tfs_s").value);
	localsettings.miro_type = parseInt(document.getElementById("miro_type").value);
	localsettings.miro_tau = parseFloat(document.getElementById("miro_tau").value);
	localsettings.miro_eta = parseFloat(document.getElementById("miro_eta").value);
	localsettings.dry_multiplier = parseFloat(document.getElementById("dry_multiplier").value);
	localsettings.dry_base = parseFloat(document.getElementById("dry_base").value);
	localsettings.dry_allowed_length = parseInt(document.getElementById("dry_allowed_length").value);
	localsettings.dry_sequence_breakers = pendingsequencebreakers;
	localsettings.custom_jailbreak_text = pendingassistantjailbreak;
	localsettings.xtc_threshold = parseFloat(document.getElementById("xtc_threshold").value);
	localsettings.xtc_probability = parseFloat(document.getElementById("xtc_probability").value);
	localsettings.token_count_multiplier = parseInt(document.getElementById("token_count_multiplier").value);
	localsettings.guidance_scale = parseFloat(document.getElementById("guidance_scale").value);
	localsettings.guidance_prompt = document.getElementById("guidance_prompt").value;

	localsettings.extrastopseq = document.getElementById("extrastopseq").value;
	localsettings.tokenbans = document.getElementById("tokenbans").value;
	try {
		let lb = document.getElementById("logitbiastxtarea").value;
		let dict = {};
		if (lb != "") {
			dict = JSON.parse(lb);
		}
		localsettings.logitbiasdict = dict;
	} catch (e) {
		console.log("Your logit bias JSON dictionary was not correctly formatted!");
	}
	localsettings.regexreplace_data = [];
	for (let i = 0; i < num_regex_rows; ++i) {
		let v1 = "";
		let v2 = "";
		let bothways = false;
		let box1 = document.getElementById("regexreplace_pattern" + i);
		let box2 = document.getElementById("regexreplace_replacement" + i);
		let bw = document.getElementById("regexreplace_bothways" + i).checked;
		let disponly = document.getElementById("regexreplace_displayonly" + i).checked;
		if (!box1 || !box2) {
			break;
		}
		if (validate_regex(box1.value)) {
			v1 = box1.value;
		}
		if (validate_regex(box2.value)) {
			v2 = box2.value;
		}

		if (v1) {
			localsettings.regexreplace_data.push({ p: v1, r: v2, b: bw, d: disponly });
		}
	}

	localsettings.placeholder_tags_data = [];
	for (let i = 0; i < num_regex_rows; ++i) {
		let v1 = "";
		let v2 = "";
		let box1 = document.getElementById("placeholder_pattern" + i);
		let box2 = document.getElementById("placeholder_replace" + i);
		if (!box1 || !box2) {
			break;
		}
		v1 = box1.value;
		v2 = box2.value;
		if (v1 && v2) {
			localsettings.placeholder_tags_data.push({ p: v1, r: v2 });
		}
	}
	localsettings.websearch_enabled = document.getElementById("websearch_enabled").checked ? true : false;
	localsettings.websearch_multipass = document.getElementById("websearch_multipass").checked ? true : false;
	localsettings.websearch_retain = document.getElementById("websearch_retain").checked ? true : false;
	localsettings.websearch_template = document.getElementById("websearch_template").value == default_websearch_template
		? ""
		: document.getElementById("websearch_template").value;
	if (validate_regex(localsettings.thinking_pattern)) {
		localsettings.thinking_pattern = document.getElementById("thinking_pattern").value;
	} else {
		localsettings.thinking_pattern = "<think>([\\s\\S]+?)<\/think>";
	}
	localsettings.thinking_action = parseInt(document.getElementById("thinking_action").value);
	localsettings.think_injected = parseInt(document.getElementById("think_injected").value);
	localsettings.strip_thinking_mode = parseInt(document.getElementById("strip_thinking_mode").value);
	localsettings.start_thinking_tag = document.getElementById("start_thinking_tag").value;
	localsettings.stop_thinking_tag = document.getElementById("stop_thinking_tag").value;

	localsettings.speech_synth = document.getElementById("ttsselect").value;
	localsettings.xtts_voice = document.getElementById("xtts_voices").value;
	localsettings.kcpp_tts_voice = document.getElementById("kcpp_tts_voice").value;
	localsettings.kcpp_tts_json = kcpp_tts_json;
	localsettings.beep_on = document.getElementById("beep_on").checked ? true : false;
	localsettings.notify_on = document.getElementById("notify_on").checked ? true : false;
	no_escape_html = document.getElementById("no_escape_html").checked ? true : false;
	localsettings.narrate_both_sides = document.getElementById("narrate_both_sides").checked ? true : false;
	localsettings.narrate_only_dialog = document.getElementById("narrate_only_dialog").checked ? true : false;
	localsettings.tts_speed = document.getElementById("tts_speed").value;
	localsettings.voice_end_delay = document.getElementById("voice_end_delay").value;
	localsettings.voice_suppress_nonspeech = document.getElementById("voice_suppress_nonspeech").checked ? true : false;
	localsettings.voice_langcode = document.getElementById("voice_langcode").value;
	localsettings.auto_ctxlen = document.getElementById("auto_ctxlen").checked ? true : false;
	localsettings.auto_genamt = document.getElementById("auto_genamt").checked ? true : false;
	localsettings.wordsearch_enabled = document.getElementById("wordsearch_toggle").checked ? true : false;

	localsettings.image_styles = document.getElementById("imagestyleinput").value;
	localsettings.image_negprompt = document.getElementById("negpromptinput").value;
	localsettings.grammar = pendinggrammar;
	localsettings.tokenstreammode = document.getElementById("tokenstreammode").value;
	localsettings.img_autogen_type = document.getElementById("img_autogen_type").value;
	localsettings.img_crop = document.getElementById("img_crop").checked ? true : false;
	localsettings.img_newturn = document.getElementById("img_newturn").checked ? true : false;
	localsettings.img_stacking = document.getElementById("img_stacking").checked ? true : false;
	localsettings.img_allowhd = document.getElementById("img_allowhd").checked ? true : false;
	localsettings.img_gen_from_instruct = document.getElementById("img_gen_from_instruct").checked ? true : false;
	localsettings.save_images = document.getElementById("save_images").checked ? true : false;
	localsettings.save_remote_images = document.getElementById("save_remote_images").checked ? true : false;
	localsettings.prompt_for_savename = document.getElementById("prompt_for_savename").checked ? true : false;
	localsettings.img_allownsfw = document.getElementById("img_allownsfw").checked ? true : false;
	update_genimg_button_visiblility();
	update_websearch_button_visibility();

	localsettings.img_cfgscale = parseFloat(document.getElementById("img_cfgscale").value);
	localsettings.img_img2imgstr = parseFloat(document.getElementById("img_img2imgstr").value);
	localsettings.img_clipskip = parseInt(document.getElementById("img_clipskip").value);
	localsettings.img_aspect = parseInt(document.getElementById("img_aspect").value);
	localsettings.img_sampler = document.getElementById("img_sampler").value;
	localsettings.img_steps = parseInt(document.getElementById("img_steps").value);
	if (isNaN(localsettings.img_steps)) {
		localsettings.img_steps = defaultsettings.img_steps;
	}
	if (isNaN(localsettings.img_cfgscale)) {
		localsettings.img_cfgscale = defaultsettings.img_cfgscale;
	}
	if (isNaN(localsettings.img_img2imgstr)) {
		localsettings.img_img2imgstr = defaultsettings.img_img2imgstr;
	}
	if (isNaN(localsettings.img_clipskip)) {
		localsettings.img_clipskip = defaultsettings.img_clipskip;
	}
	localsettings.img_img2imgstr = cleannum(localsettings.img_img2imgstr, 0.0, 1.0);
	localsettings.img_clipskip = cleannum(localsettings.img_clipskip, -1, 20);
	if (isNaN(localsettings.img_aspect)) {
		localsettings.img_aspect = defaultsettings.img_aspect;
	}

	if (is_aesthetic_ui() || is_corpo_ui()) {
		//kick out of edit mode
		if (document.getElementById("allowediting")) {
			document.getElementById("allowediting").checked = false;
			toggle_editable();
		}
	}

	if (isNaN(localsettings.tts_speed)) {
		localsettings.tts_speed = defaultsettings.tts_speed;
	} else {
		localsettings.tts_speed = cleannum(localsettings.tts_speed, 0.1, 4);
	}

	if (isNaN(localsettings.voice_end_delay)) {
		localsettings.voice_end_delay = defaultsettings.voice_end_delay;
	} else {
		localsettings.voice_end_delay = cleannum(localsettings.voice_end_delay, 50, 5000);
	}

	//validate samplers, if fail, reset to default
	validate_samplers(true);
	localsettings.last_selected_preset = document.getElementById("samplerpresets").value;

	//clean and clamp invalid values
	localsettings.max_context_length = cleannum(localsettings.max_context_length, 8, 999999);
	localsettings.max_length = cleannum(localsettings.max_length, 1, Math.floor(localsettings.max_context_length * 0.85)); //clamp to max 85% of max ctx
	localsettings.temperature = cleannum(localsettings.temperature, 0.01, 5);
	localsettings.rep_pen = cleannum(localsettings.rep_pen, 0.1, 5);
	localsettings.rep_pen_range = cleannum(localsettings.rep_pen_range, 0, localsettings.max_context_length);
	localsettings.rep_pen_slope = cleannum(localsettings.rep_pen_slope, 0, 20);
	localsettings.top_p = cleannum(localsettings.top_p, 0.002, 1);
	localsettings.min_p = cleannum(localsettings.min_p, 0.0, 1);
	localsettings.dynatemp_range = cleannum(localsettings.dynatemp_range, -5, 5);
	localsettings.dynatemp_range = (localsettings.dynatemp_range > localsettings.temperature)
		? localsettings.temperature
		: ((localsettings.dynatemp_range < -localsettings.temperature) ? -localsettings.temperature : localsettings.dynatemp_range);
	localsettings.dynatemp_exponent = cleannum(localsettings.dynatemp_exponent, 0.0, 10.0);
	localsettings.smoothing_factor = cleannum(localsettings.smoothing_factor, 0.0, 10.0);
	localsettings.nsigma = cleannum(localsettings.nsigma, 0.0, 5.0);
	localsettings.presence_penalty = cleannum(localsettings.presence_penalty, -2, 2);
	localsettings.top_k = cleannum(Math.floor(localsettings.top_k), 0, 300);
	localsettings.top_a = cleannum(localsettings.top_a, 0, 1);
	localsettings.typ_s = cleannum(localsettings.typ_s, 0, 1);
	localsettings.tfs_s = cleannum(localsettings.tfs_s, 0, 1);
	localsettings.miro_type = cleannum(localsettings.miro_type, 0, 2);
	localsettings.miro_tau = cleannum(localsettings.miro_tau, 0, 30);
	localsettings.miro_eta = cleannum(localsettings.miro_eta, 0, 10);
	localsettings.dry_multiplier = cleannum(localsettings.dry_multiplier, 0.0, 100.0);
	localsettings.dry_base = cleannum(localsettings.dry_base, 0.0, 8.0);
	localsettings.dry_allowed_length = cleannum(Math.floor(localsettings.dry_allowed_length), 0, 100);
	localsettings.xtc_probability = cleannum(localsettings.xtc_probability, 0.0, 1.0);
	localsettings.xtc_threshold = cleannum(localsettings.xtc_threshold, 0.0, 1.0);
	localsettings.sampler_seed = cleannum(localsettings.sampler_seed, -1, 999999);
	localsettings.token_count_multiplier = cleannum(localsettings.token_count_multiplier, 70, 130);
	toggle_invert_colors();
	toggle_sidepanel_mode();

	voice_typing_mode = document.getElementById("voice_typing_mode").value;
	if (voice_typing_mode > 0 && is_using_kcpp_with_whisper()) {
		init_voice_typing();
	}

	autosave(); //need to always autosave, so that we can switch back to non persistent sessions
	render_gametext(false);
	sync_multiplayer(true);
}

function get_preset_instruct_tag_format(sel) {
	let st = "";
	let et = "";
	let systag = "";
	let ste = "";
	let ete = "";
	let systage = "";
	let nonsplit_excludes_endtags = false;

	for (let i = 0; i < instructpresets.length; ++i) {
		if ((i + 1) == sel) {
			st = instructpresets[i].user;
			et = instructpresets[i].assistant;
			systag = instructpresets[i].system;
			ste = instructpresets[i].user_end;
			ete = instructpresets[i].assistant_end;
			systage = instructpresets[i].system_end;
			nonsplit_excludes_endtags = instructpresets[i].nonsplit_excludes_endtags;
			break;
		}
	}

	return {
		system: systag,
		system_end: systage,
		user: st,
		user_end: ste,
		assistant: et,
		assistant_end: ete,
		nonsplit_excludes_endtags: nonsplit_excludes_endtags,
	};
}
function toggle_instruct_tag_format() {
	let sel = document.getElementById("instruct_tag_format").value;
	let itags = get_preset_instruct_tag_format(sel);
	let use_et = document.getElementById("separate_end_tags").checked;
	if (itags.user != "" && itags.assistant != "" && itags.system !== null) {
		if (!use_et) {
			if (itags.nonsplit_excludes_endtags) {
				document.getElementById("instruct_starttag").value = itags.user;
				document.getElementById("instruct_endtag").value = itags.assistant;
				document.getElementById("instruct_systag").value = itags.system;
			} else {
				document.getElementById("instruct_starttag").value = itags.assistant_end + itags.user;
				document.getElementById("instruct_endtag").value = itags.user_end + itags.assistant;
				document.getElementById("instruct_systag").value = itags.system;
			}
			document.getElementById("instruct_starttag_end").value = "";
			document.getElementById("instruct_endtag_end").value = "";
			document.getElementById("instruct_systag_end").value = "";
		} else {
			document.getElementById("instruct_starttag").value = itags.user;
			document.getElementById("instruct_endtag").value = itags.assistant;
			document.getElementById("instruct_systag").value = itags.system;
			document.getElementById("instruct_starttag_end").value = itags.user_end;
			document.getElementById("instruct_endtag_end").value = itags.assistant_end;
			document.getElementById("instruct_systag_end").value = itags.system_end;
		}
	}
}
function edit_instruct_tag_format() {
	let use_et = document.getElementById("separate_end_tags").checked;
	if (use_et) {
		document.getElementById("instruct_starttag_end").classList.remove("hidden");
		document.getElementById("instruct_endtag_end").classList.remove("hidden");
		document.getElementById("instruct_systag_end").classList.remove("hidden");
	} else {
		document.getElementById("instruct_starttag_end").classList.add("hidden");
		document.getElementById("instruct_endtag_end").classList.add("hidden");
		document.getElementById("instruct_systag_end").classList.add("hidden");
	}
	let dropdown = document.getElementById("instruct_tag_format");
	let options = dropdown.options;
	let found = false;
	for (let i = 0; i < options.length; i++) {
		let option = options[i];
		let itags = get_preset_instruct_tag_format(option.value);
		let st = document.getElementById("instruct_starttag").value;
		let et = document.getElementById("instruct_endtag").value;
		let systag = document.getElementById("instruct_systag").value;
		let st_end = document.getElementById("instruct_starttag_end").value;
		let et_end = document.getElementById("instruct_endtag_end").value;
		let sys_end = document.getElementById("instruct_systag_end").value;
		if (!use_et) {
			let matched_st = itags.nonsplit_excludes_endtags ? itags.user : (itags.assistant_end + itags.user);
			let matched_et = itags.nonsplit_excludes_endtags ? itags.assistant : (itags.user_end + itags.assistant);
			if (
				itags.user != "" && itags.assistant != "" && matched_st == st && matched_et == et && itags.system == systag
				&& (st_end == "" && et_end == "" && sys_end == "")
			) {
				document.getElementById("instruct_tag_format").value = option.value;
				found = true;
				break;
			}
		} else {
			if (
				itags.user != "" && itags.assistant != "" && itags.user == st && itags.assistant == et && itags.system == systag
				&& (st_end == itags.user_end && et_end == itags.assistant_end && sys_end == itags.system_end)
			) {
				document.getElementById("instruct_tag_format").value = option.value;
				found = true;
				break;
			}
		}
	}
	if (!found) {
		document.getElementById("instruct_tag_format").value = "0";
	}
}
function toggle_separate_end_tags() {
	let prevdropdown = document.getElementById("instruct_tag_format").value;
	edit_instruct_tag_format();
	document.getElementById("instruct_tag_format").value = prevdropdown;
	toggle_instruct_tag_format();
}

function handle_bot_name_input() {
	let textarea = document.getElementById("chatopponent");
	textarea.value = replaceAll(textarea.value, "||$||", "\n");
	let numberOfLineBreaks = (textarea.value.match(/\n/g) || []).length;
	numberOfLineBreaks = numberOfLineBreaks > 8 ? 8 : numberOfLineBreaks;
	textarea.rows = numberOfLineBreaks + 1;
}
function handle_bot_name_onchange() {
	let textarea = document.getElementById("chatopponent");
	textarea.value = replaceAll(textarea.value, "||$||", "\n");
	textarea.value = textarea.value.replace(/[\r\n]+/g, "\n");
	textarea.value = textarea.value.trim();
	let numberOfLineBreaks = (textarea.value.match(/\n/g) || []).length;
	numberOfLineBreaks = numberOfLineBreaks > 8 ? 8 : numberOfLineBreaks;
	textarea.rows = numberOfLineBreaks + 1;
}

function toggle_generate_images_mode(silent = false) {
	document.getElementById("generate_images_model_container").classList.add("hidden");
	document.getElementById("generate_images_dalle_container").classList.add("hidden");
	document.getElementById("generate_images_local_model_container").classList.add("hidden");
	document.getElementById("generate_images_comfy_container").classList.add("hidden");
	document.getElementById("generate_images_pollinations_container").classList.add("hidden");
	if (document.getElementById("generate_images_mode").value == 1) {
		document.getElementById("generate_images_model_container").classList.remove("hidden");
		if (!image_models_fetched) {
			//doing it this way will be more buggy,
			//but since some anons are paranoid about privacy then whatever, only fetch it manually
			fetch_image_models(() => {
				update_horde_sdmodels();
			});
		}
	} else if (document.getElementById("generate_images_mode").value == 2) {
		document.getElementById("generate_images_local_model_container").classList.remove("hidden");
		connect_to_a1111(silent);
	} else if (document.getElementById("generate_images_mode").value == 3) {
		document.getElementById("generate_images_dalle_container").classList.remove("hidden");
	} else if (document.getElementById("generate_images_mode").value == 4) {
		document.getElementById("generate_images_comfy_container").classList.remove("hidden");
		connect_to_comfyui(silent);
	} else if (document.getElementById("generate_images_mode").value == 5) {
		document.getElementById("generate_images_pollinations_container").classList.remove("hidden");
	}
}

function get_theme_desc(themeid) {
	switch (themeid) {
		case "0":
			return "The classic Kobold Blue theme everyone loves.";
			break;
		case "1":
			return "A compact instant messenger styled chat theme.";
			break;
		case "2":
			return "Customizable aesthetic theme with character portraits.";
			break;
		case "3":
			return "Clean, minimalistic, corporate AI assistant theme.";
			break;
		default:
			return "";
			break;
	}
}

function toggle_uistyle() {
	//show or hide the 'Customize UI' button based on whether the Aesthetic Instruct UI Mode is active or not.
	if (document.getElementById("gui_type").value == 2) {
		document.getElementById("btn_aesthetics").classList.remove("hidden");
	} else {
		document.getElementById("btn_aesthetics").classList.add("hidden");
	}
	document.getElementById("guitypedesc").innerText = get_theme_desc(document.getElementById("gui_type").value);

	if (document.getElementById("gui_type").value == 0) {
		document.getElementById("classicmodeoptions").classList.remove("hidden");
	} else {
		document.getElementById("classicmodeoptions").classList.add("hidden");
	}
}

function select_welcome_ui() {
	const selected = document.querySelector('input[name="welcometheme"]:checked');
	document.getElementById("welcomeuidesc").innerText = get_theme_desc(selected.value);
}

function show_welcome_panel() {
	document.getElementById("welcomecontainer").classList.remove("hidden");
	mainmenu_untab(true);
	select_welcome_ui();
}

function close_welcome_panel(isok) {
	mainmenu_untab(false);
	if (isok) {
		const selected = document.querySelector('input[name="welcometheme"]:checked');
		if (selected) {
			let selval = selected.value;
			if (selval == "0" || selval == "2" || selval == "3") { //do not save any other value
				localsettings.gui_type_instruct = selval;
				if (selval == "3") {
					localsettings.gui_type_chat = selval;
					localsettings.gui_type_story = selval;
					localsettings.gui_type_adventure = selval;
				}
				render_gametext(true);
			}
		}
	}
	document.getElementById("welcomecontainer").classList.add("hidden");
}

function toggle_include_chatnames() {
	if (document.getElementById("opmode").value == 3) {
		document.getElementById("chatnamessection").classList.remove("hidden");
	} else if (document.getElementById("opmode").value == 4 && document.getElementById("inject_chatnames_instruct").checked) {
		document.getElementById("chatnamessection").classList.remove("hidden");
	} else {
		document.getElementById("chatnamessection").classList.add("hidden");
	}
}

function toggle_opmode() {
	switch (document.getElementById("opmode").value) {
		case "1":
			document.getElementById("opmodedesc").innerText = "Let the AI co-write a story.";
			break;
		case "2":
			document.getElementById("opmodedesc").innerText = "Participate in turn-based interactive adventures.";
			break;
		case "3":
			document.getElementById("opmodedesc").innerText = "Roleplay with a virtual chatbot AI.";
			break;
		case "4":
			document.getElementById("opmodedesc").innerText = "Give the AI instructions, questions, or do tasks.";
			break;
		default:
			document.getElementById("opmodedesc").innerText = "";
			break;
	}

	document.getElementById("uipicker_classic").classList.remove("hidden");
	document.getElementById("uipicker_messenger").classList.add("hidden");
	document.getElementById("uipicker_aesthetic").classList.add("hidden");
	document.getElementById("uipicker_corpo").classList.add("hidden");
	document.getElementById("chatnamessection").classList.add("hidden");
	document.getElementById("instructtagsection").classList.add("hidden");

	if (document.getElementById("opmode").value == 1) {
		document.getElementById("gui_type").value = localsettings.gui_type_story;
		document.getElementById("uipicker_aesthetic").classList.remove("hidden");
		document.getElementById("uipicker_corpo").classList.remove("hidden");
	}
	if (document.getElementById("opmode").value == 2) {
		document.getElementById("gui_type").value = localsettings.gui_type_adventure;
		document.getElementById("uipicker_aesthetic").classList.remove("hidden");
		document.getElementById("uipicker_corpo").classList.remove("hidden");
	}
	if (document.getElementById("opmode").value == 3) {
		document.getElementById("gui_type").value = localsettings.gui_type_chat;
		document.getElementById("uipicker_messenger").classList.remove("hidden");
		document.getElementById("uipicker_aesthetic").classList.remove("hidden");
		document.getElementById("uipicker_corpo").classList.remove("hidden");
	}
	if (document.getElementById("opmode").value == 4) {
		document.getElementById("gui_type").value = localsettings.gui_type_instruct;
		document.getElementById("uipicker_aesthetic").classList.remove("hidden");
		document.getElementById("uipicker_corpo").classList.remove("hidden");
		document.getElementById("instructtagsection").classList.remove("hidden");
	}
	toggle_include_chatnames();

	//deselect invalid

	let curropt = document.getElementById("gui_type").options[document.getElementById("gui_type").selectedIndex];

	if (curropt.classList.contains("hidden")) {
		// The selected option is hidden, deselect it
		document.getElementById("gui_type").value = 0;
	}

	if (document.getElementById("gui_type").value == 2) {
		document.getElementById("btn_aesthetics").classList.remove("hidden");
	} else {
		document.getElementById("btn_aesthetics").classList.add("hidden");
	}

	toggle_uistyle();
}

//triggers if advanced load is enabled
var advload_callback = null;
function handle_advload_popup(need_display, callbackfn) {
	if (!need_display) {
		callbackfn();
	} else {
		advload_callback = callbackfn;
		document.getElementById("advancedloadfile").classList.remove("hidden");
	}
}
function advload_btnok() {
	document.getElementById("advancedloadfile").classList.add("hidden");
	if (advload_callback) {
		advload_callback();
	}
	advload_callback = null;
}

//triggers when loading from slot, or when loading from url share
function import_compressed_story_prompt_overwrite(compressed_story) {
	msgboxYesNo(
		"You already have an existing persistent story. Do you want to overwrite it?",
		"Overwrite Story Warning",
		() => {
			if (compressed_story && compressed_story != "") {
				import_compressed_story(compressed_story, false);
			}
		},
		null,
		false,
	);
}

function display_newgame() {
	mainmenu_untab(true);
	document.getElementById("keep_ai_selected").checked = true;
	document.getElementById("keep_memory").checked = false;
	document.getElementById("newgamecontainer").classList.remove("hidden");
}

function confirm_newgame() {
	if (!localflag && !document.getElementById("keep_ai_selected").checked) {
		selected_models = [];
		selected_workers = [];
		localsettings.opmode = 1;
	}
	hide_popups();
	restart_new_game(true, document.getElementById("keep_memory").checked);
	sync_multiplayer(true);
	update_for_sidepanel();
	hide_popups();
}

function estimate_and_show_textDB_usage() {
	let currentChunkSize = Number(document.getElementById("documentdb_chunksize").value);
	let snippetEstimate = currentChunkSize * 1.5 * Number(document.getElementById("documentdb_numresults").value);
	let numberOfChunks = Math.ceil(
		document.getElementById("documentdb_data").value.length / (currentChunkSize - (Math.min(currentChunkSize * 0.5, 500))),
	);
	document.getElementById("documentdb_snippetestimate").innerText = `Estimate of context usage: ${
		snippetEstimate / 3
	} tokens (${snippetEstimate} characters). Total chunks: ${numberOfChunks}. Cached chunks: ${Object.keys(embeddings_cache).length}`;
}

function confirm_memory() {
	current_memory = document.getElementById("memorytext").value;
	current_anote = document.getElementById("anotetext").value;
	current_anotetemplate = document.getElementById("anotetemplate").value;
	anote_strength = document.getElementById("anote_strength").value;
	newlineaftermemory = document.getElementById("newlineaftermemory").checked ? true : false;
	documentdb_provider = document.getElementById("documentdb_provider").value;
	documentdb_searchhistory = document.getElementById("documentdb_searchhistory").checked ? true : false;
	documentdb_numresults = document.getElementById("documentdb_numresults").value;
	documentdb_searchrange = document.getElementById("documentdb_searchrange").value;
	documentdb_chunksize = document.getElementById("documentdb_chunksize").value;
	documentdb_data = document.getElementById("documentdb_data").value;
	documentdb_numresults = parseInt(documentdb_numresults);
	documentdb_numresults = cleannum(documentdb_numresults, 1, 10);
	documentdb_searchrange = parseInt(documentdb_searchrange);
	documentdb_searchrange = cleannum(documentdb_searchrange, 0, 1024);
	documentdb_chunksize = parseInt(documentdb_chunksize);
	documentdb_chunksize = cleannum(documentdb_chunksize, 32, 2048);
}

function set_personal_notes() {
	inputBox(
		"Here you can add some personal notes or comments to be saved.\nYou can write anything you want.\nNotes are saved to file, but not added to the context.\n",
		"Set Personal Notes",
		personal_notes,
		"Enter Personal Notes",
		() => {
			let userinput = getInputBoxValue().trim();
			personal_notes = userinput;
		},
		false,
		true,
	);
}

var on_searchsummary_done = null;
function generate_websearch_prompt(recentCtx, search_query, onDoneFn) {
	if (recentCtx.trim() == "") {
		console.log("Cannot websearch nothing.");
		onDoneFn("");
	} else {
		pending_response_id = "-1";
		waiting_for_tool_call = 2;
		let max_allowed_characters = Math.floor(localsettings.max_context_length * 3.0) - 100;
		let truncated_context = recentCtx.substring(recentCtx.length - max_allowed_characters);

		truncated_context = replace_placeholders(truncated_context);
		let wst = localsettings.websearch_template == "" ? default_websearch_template : localsettings.websearch_template;
		truncated_context += "\n\n" + wst.replaceAll("{{QUERY}}", search_query);

		let submit_payload = {
			prompt: truncated_context,
			params: {
				n: 1,
				max_context_length: localsettings.max_context_length,
				max_length: 200,
				rep_pen: localsettings.rep_pen,
				temperature: localsettings.temperature,
				top_p: localsettings.top_p,
				top_k: localsettings.top_k,
				top_a: localsettings.top_a,
				typical: localsettings.typ_s,
				tfs: localsettings.tfs_s,
				rep_pen_range: localsettings.rep_pen_range,
				rep_pen_slope: localsettings.rep_pen_slope,
				sampler_order: localsettings.sampler_order,
			},
			models: selected_models.map((m) => {
				return m.name;
			}),
		};

		if (localsettings.sampler_seed >= 1) {
			submit_payload.params.sampler_seed = localsettings.sampler_seed;
		}

		//v2 api specific fields
		submit_payload.workers = selected_workers.map((m) => {
			return m.id;
		});

		on_searchsummary_done = onDoneFn;

		dispatch_submit_generation(submit_payload, false);
		render_gametext();
	}
}

let temp_automem_store = "";
function autogenerate_summary_memory() {
	temp_automem_store = document.getElementById("memorytext").value;
	let onOk = () => {
		pending_response_id = "-1";
		waiting_for_tool_call = 1;
		let max_allowed_characters = Math.floor(localsettings.max_context_length * 3.0) - 100;
		let truncated_context = concat_gametext(true, "");

		let max_mem_len = Math.floor(max_allowed_characters * 0.8);
		let truncated_memory = current_memory.substring(current_memory.length - max_mem_len);
		if (truncated_memory != null && truncated_memory != "") {
			truncated_memory += "\n";
		}

		truncated_context = end_trim_to_sentence(truncated_context, true);
		truncated_context = truncated_context.substring(truncated_context.length - max_allowed_characters);
		let augmented_len = truncated_memory.length + truncated_context.length;
		let excess_len = augmented_len - max_allowed_characters; //if > 0, then we exceeded context window
		truncated_context = truncated_memory + truncated_context.substring(excess_len);

		let long_story = truncated_context.length > 1800 ? true : false;
		truncated_context += "\n### Instruction:Summarize the above text in a single paragraph of up to " + (long_story ? "ten" : "five")
			+ " detailed sentences.\n### Response:";
		truncated_context = replace_placeholders(truncated_context);
		let submit_payload = {
			prompt: truncated_context,
			params: {
				n: 1,
				max_context_length: localsettings.max_context_length,
				max_length: (long_story ? 250 : 200),
				rep_pen: localsettings.rep_pen,
				temperature: localsettings.temperature,
				top_p: localsettings.top_p,
				top_k: localsettings.top_k,
				top_a: localsettings.top_a,
				typical: localsettings.typ_s,
				tfs: localsettings.tfs_s,
				rep_pen_range: localsettings.rep_pen_range,
				rep_pen_slope: localsettings.rep_pen_slope,
				sampler_order: localsettings.sampler_order,
			},
			models: selected_models.map((m) => {
				return m.name;
			}),
		};

		if (localsettings.sampler_seed >= 1) {
			submit_payload.params.sampler_seed = localsettings.sampler_seed;
		}

		//v2 api specific fields
		submit_payload.workers = selected_workers.map((m) => {
			return m.id;
		});

		dispatch_submit_generation(submit_payload, false);
		render_gametext();
		document.getElementById("memorytext").value = "[<|Generating summary, do not close window...|>]";
	};

	if (gametext_arr.length == 0 || (gametext_arr.length == 1 && gametext_arr[0].trim() == "")) {
		console.log("Cannot summarize nothing.");
	} else {
		if (temp_automem_store.trim() != "") {
			msgboxYesNo("This will modify existing memory. Proceed?", "Confirm Modify", () => {
				onOk();
			}, null);
		} else {
			onOk();
		}
	}
}

function handle_incoming_autosummary(gentxt) {
	retry_in_progress = false;
	waiting_for_tool_call = 0;
	gentxt = gentxt.trim();
	gentxt = gentxt.split("###")[0];
	gentxt = replaceAll(gentxt, "\n\n", "\n");
	let gtar = gentxt.split("\n");

	gentxt = gtar[0];
	let deslen = 200; //deal with point form response
	if (gentxt.length < 100 && gtar.length > 1) {
		for (var k = 1; k < gtar.length; ++k) {
			deslen -= gtar[k].length;
			if (gtar[k].trim().length > 5) {
				gentxt += "\n" + gtar[k];
			}
			if (deslen <= 0) {
				break;
			}
		}
	}

	//clean up text
	gentxt = end_trim_to_sentence(gentxt, true);
	if (temp_automem_store.trim() == "") {
		document.getElementById("memorytext").value = "[Summary: " + gentxt + "]";
	} else {
		document.getElementById("memorytext").value = temp_automem_store + "\n\n[Summary Continued: " + gentxt + "]";
	}
}

function handle_incoming_searchsummary(gentxt) {
	retry_in_progress = false;
	waiting_for_tool_call = 0;
	gentxt = gentxt.trim();
	gentxt = gentxt.split("###")[0];
	gentxt = replaceAll(gentxt, "\n\n", "\n");
	let gtar = gentxt.split("\n");

	gentxt = gtar[0];
	let deslen = 200; //deal with point form response
	if (gentxt.length < 100 && gtar.length > 1) {
		for (var k = 1; k < gtar.length; ++k) {
			deslen -= gtar[k].length;
			if (gtar[k].trim().length > 5) {
				gentxt += "\n" + gtar[k];
			}
			if (deslen <= 0) {
				break;
			}
		}
	}

	//clean up text
	gentxt = end_trim_to_sentence(gentxt, true);
	if (on_searchsummary_done != null) {
		let cb = on_searchsummary_done;
		on_searchsummary_done = null;
		cb(gentxt);
	}
}

function simplecssexample() {
	let simplemodscript = `/* This custom CSS changes all buttons to yellow */
	.btn-primary {
		color: black!important;
		background-color: yellow!important;
		border-color: black!important;
	}
	`;
	document.getElementById("inputboxcontainerinputarea").value = simplemodscript;
}
function simplemodexample() {
	let simplemodscript = `// This mod changes your top menu to a yellow gradient, then displays the current temperature setting as a popup\n`
		+ `\ndocument.getElementById("topmenu").style.backgroundImage = 'linear-gradient(90deg, #daa121, #daa121, #ac7a2e, #ac7a2e)';`
		+ `\ndocument.getElementById("topmenu").style.outline = '3px solid #daa121';`
		+ "\n"
		+ `alert("Congrats, your top menu turned yellow. Also, your temperature was " + localsettings.temperature);`;
	document.getElementById("inputboxcontainerinputarea").value = simplemodscript;
}
function apply_user_mod() {
	indexeddb_load("savedusermod", "").then(currmod => {
		indexeddb_load("usermodprops", "").then(modpropsstr => {
			let applyonstart = false;
			try {
				if (modpropsstr) {
					let parsedprops = JSON.parse(modpropsstr);
					if (parsedprops.persist) {
						applyonstart = true;
					}
				}
			} catch (e) {}
			let txt =
				`Here, you can apply third-party mod scripts shared by other users.<br><br><span class='color_red'>Caution: This mod will have full access to your story and API keys, so only run third-party mods that you trust!<br><br>Mods must always be manually applied every time unless 'Apply Mod On Startup' is selected. If a startup mod breaks KoboldAI Lite, add ?resetmod=1 to the url to uninstall it.</span><br><br>Want to start modding? <a href='#' class='color_blueurl' onclick='simplemodexample()'>Click here</a> to load a simple example mod.<br><br><div><span>Apply Mod On Startup? (Extreme Caution!) </span><input type='checkbox' id='apply_mod_on_start' style='vertical-align: top;' ${
					applyonstart ? "checked" : ""
				}></div><div><button type="button" class="btn btn-primary" onclick="load_inputbox_from_file()">Import UserMod From File</button></div>`;
			inputBoxOkCancel(
				txt,
				"Apply Third-Party Mod",
				currmod,
				"Paste Mod Script Here",
				() => {
					let userinput = getInputBoxValue().trim();
					applyonstart = document.getElementById("apply_mod_on_start").checked ? true : false;
					indexeddb_save("savedusermod", userinput);
					indexeddb_save("usermodprops", JSON.stringify({ persist: applyonstart }));
					if (userinput != "" && userinput.trim() != "") {
						var userModScript = new Function(userinput);
						userModScript();
					}
				},
				() => {
					//do nothing on cancel
				},
				true,
				true,
			);
		});
	});
}
function load_inputbox_from_file() {
	promptUserForLocalFile((fileDetails) => {
		try {
			let { file, fileName, ext, content, plaintext } = fileDetails;
			if (plaintext && plaintext != "") {
				if (document.getElementById("inputboxcontainerinputarea").classList.contains("hidden")) {
					document.getElementById("inputboxcontainerinput").value = plaintext;
				} else {
					document.getElementById("inputboxcontainerinputarea").value = plaintext;
				}
			}
		} catch (e) {
			console.log("Load Inputbox File Failed: " + e);
		}
	});
}

function sanitize_css(input) {
	let safeImages = [];
	let counter = 0;
	input = input.replace(/<\s*\/?\s*\w+\s*[^>]*>/gi, ""); //replace html tags
	input = input.replace(/</g, ""); // Remove any remaining `<` characters
	input = input.replace(/data:image\/(jpeg|jpg|png|gif|webp);base64,[A-Za-z0-9+\/=]+/gi, function(match) {
		safeImages.push(match);
		return "__SAFE_IMG_" + (counter++) + "__";
	});
	input = input.replace(/(?:javascript|data|vbscript|file):/gi, "");
	for (let i = 0; i < safeImages.length; i++) {
		input = input.replace("__SAFE_IMG_" + i + "__", safeImages[i]);
	}
	return input;
}
function apply_custom_css() {
	indexeddb_load("savedcustomcss", "").then(currcss => {
		inputBoxOkCancel(
			`Here, you can apply third-party custom CSS styles shared by other users.<br><br><span class='color_red'>Caution: This will modify the existing document, so only use third-party CSS styles that you trust! Custom CSS is persistent, but can be reset in this menu.</span><br><br>Need help? <a href='#' class='color_blueurl' onclick='simplecssexample()'>Click here</a> to load a simple example CSS theme. You can return to default styles by clearing the box below. If you get stuck, add ?resetcss=1 to the URL to clear custom styles. <div><button type="button" class="btn btn-primary" onclick="load_inputbox_from_file()">Import CSS From File</button></div>`,
			"Apply Custom CSS Styles",
			currcss,
			"Paste CSS Styles Here",
			() => {
				let userinput = sanitize_css(getInputBoxValue().trim());
				indexeddb_save("savedcustomcss", userinput);
				let styleElement = document.getElementById("custom_css");
				styleElement.innerHTML = userinput;
			},
			() => {
				//do nothing on cancel
			},
			true,
			true,
		);
	});
}

function set_voice_clone() {
	inputBoxOkCancel(
		"Set the Voice Clone JSON to clone an existing voice.<br><br><a href=''>You can download existing voice clone JSONs, or make your own.</span><br>",
		"Apply Voice Clone JSON",
		kcpp_tts_json,
		"Paste JSON Here",
		() => {
			let userinput = getInputBoxValue().trim();
			try {
				kcpp_tts_json = "";
				if (userinput != "") {
					kcpp_tts_json = JSON.stringify(JSON.parse(userinput));
				}
			} catch (e) {
				console.log("Voice clone not correctly formatted!");
			}
		},
		() => {
			//do nothing on cancel
		},
		true,
		true,
	);
}

function restore_retried_text() {
	if (retry_in_progress) {
		retry_in_progress = false;
		if (retry_preserve_last) {
			//restore text before retry
			if (retry_prev_text.length > 0) {
				retry_preserve_last = false;
				gametext_arr.push(retry_prev_text.pop());
			}
		}
	}
}
function clear_poll_flags() {
	restore_retried_text();
	pending_response_id = "";
	poll_in_progress = false;
	synchro_polled_response = null;
	last_stop_reason = "";
	synchro_pending_stream = "";
	gemini_was_thinking = false;
	waiting_for_tool_call = 0;
	horde_poll_nearly_completed = false;
	oaiemulatecompletionscontent = "";
}

function restart_new_game(save = true, keep_memory = false) {
	xtts_is_playing = false;
	idle_timer = 0;
	idle_triggered_counter = 0;
	gametext_arr = [];
	redo_arr = [];
	last_request_str = "No Requests Available";
	last_response_obj = null;
	retry_prev_text = [];
	retry_preserve_last = false;
	retry_in_progress = false;
	redo_prev_text = [];
	nextgeneratedimagemilestone = generateimagesinterval;
	pending_response_id = "";
	synchro_polled_response = null;
	last_stop_reason = "";
	synchro_pending_stream = "";
	gemini_was_thinking = false;
	waiting_for_tool_call = 0;
	oaiemulatecompletionscontent = "";
	last_reply_was_empty = false;
	pending_context_preinjection = "";
	pending_context_postinjection = "";
	document.getElementById("input_text").value = "";
	document.getElementById("corpo_cht_inp").value = "";
	document.getElementById("cht_inp").value = "";
	let wsresultsContainer = document.getElementById("wordsearch_results");
	if (wsresultsContainer) wsresultsContainer.innerHTML = "";
	chat_resize_input();
	image_db = {};
	interrogation_db = {};
	completed_imgs_meta = {};
	localsettings.adventure_switch_mode = 0;
	prev_hl_chunk = null;
	gametext_focused = false;
	last_token_budget = "";
	groupchat_removals = [];
	welcome = "";
	last_known_filename = "saved_story.json";
	is_impersonate_user = false;
	voice_is_processing = false;
	recentSearchQueries = [];
	lastSearchResults = [];
	if (!keep_memory) {
		personal_notes = "";
		current_memory = "";
		current_anote = "";
		current_wi = [];
		anote_strength = 320;
		wi_searchdepth = 0;
		wi_insertlocation = 0;
		current_anotetemplate = "[Author's note: <|>]";
		documentdb_provider = 0; //disabled
		documentdb_searchhistory = false;
		documentdb_numresults = 3;
		documentdb_searchrange = 300;
		documentdb_chunksize = 800;
		documentdb_data = "";
	}
	if (localsettings.inject_randomness_seed > 0) {
		new_randomness_seed();
		localsettings.inject_randomness_seed = document.getElementById("inject_randomness_seed").value;
	}
	warn_unsaved = false;
	last_used_saveslot = -1;
	show_corpo_leftpanel(false);
	update_toggle_lightmode(false); //load theme but dont save or toggle it
	render_gametext(save); //necessary to trigger an autosave to wipe out current story in case they exit browser after newgame.
}

function reset_all_settings() {
	msgboxYesNo(
		"Reset ALL settings to their defaults? This will also reset your aesthetic UI and your current story!",
		"Confirm Reset All Settings",
		() => {
			localsettings = JSON.parse(JSON.stringify(defaultsettings));
			let ns = new AestheticInstructUISettings();
			aestheticInstructUISettings = deepCopyAestheticSettings(ns);
			refreshAestheticPreview(false);
			leave_multiplayer();
			restart_new_game();
			display_settings();
			confirm_settings();
			document.getElementById("keep_memory").checked = false;
			clear_bg_img();
			pick_default_horde_models();
			indexeddb_save("savedusermod", "");
			indexeddb_save("usermodprops", "");
			indexeddb_save("savedcustomcss", "");
			let styleElement = document.getElementById("custom_css");
			styleElement.innerHTML = "";
		},
		null,
	);
}

function new_randomness_seed() {
	document.getElementById("inject_randomness_seed").value = Math.floor(Math.random() * 99999); //keep within a simple range
}

function btn_editmode() {
	document.getElementById("allowediting").checked = true;
	toggle_editable();
}

function toggle_entersends() {
	localsettings.entersubmit = document.getElementById("entersubmit").checked ? true : false;
	render_gametext();
}
function toggle_editable() {
	if (gametext_arr.length == 0) {
		if (selected_models.length > 0 || selected_workers.length > 0) {
			if (document.getElementById("allowediting").checked) {
				//allow forced edit mode
				gametext_arr.push("");
			}
		} else {
			document.getElementById("allowediting").checked = false;
		}
	} else {
		if (gametext_arr.length == 1 && gametext_arr[0] == "") {
			gametext_arr.pop();
		}
	}
	render_gametext(false);
}
function exit_editmode() {
	document.getElementById("allowediting").checked = false;
	toggle_editable();
}

function toggle_hide_thinking(button) {
	// Get the parent div of the button
	const targetDiv = button.nextElementSibling;
	if (targetDiv.classList.contains("hidden")) {
		targetDiv.classList.remove("hidden");
		button.classList.add("bg_green");
	} else {
		targetDiv.classList.add("hidden");
		button.classList.remove("bg_green");
	}
}
function apply_display_only_regex(inputtxt) {
	//apply regex transforms
	if (localsettings.regexreplace_data && localsettings.regexreplace_data.length > 0) {
		inputtxt = escape_html_alternate(inputtxt);
		inputtxt = unescape_html(inputtxt);
		for (let i = 0; i < localsettings.regexreplace_data.length; ++i) {
			if (localsettings.regexreplace_data[i].d && localsettings.regexreplace_data[i].p != "") {
				let escapedpat = localsettings.regexreplace_data[i].p;
				let pat = new RegExp(escapedpat, "gm");
				let rep = localsettings.regexreplace_data[i].r;
				rep = unescape_regex_newlines(rep);
				inputtxt = inputtxt.replace(pat, rep);
			}
		}
		inputtxt = escape_html(inputtxt);
		inputtxt = unescape_html_alternate(inputtxt);
	}
	//removal of t2i segments
	if (localsettings.img_autogen_type == 2) {
		inputtxt = escape_html_alternate(inputtxt);
		inputtxt = unescape_html(inputtxt);
		const pat = /<t2i>(.*?)<\/t2i>/g;
		inputtxt = inputtxt.replace(pat, function(m, p1) {
			return "";
		});
		inputtxt = escape_html(inputtxt);
		inputtxt = unescape_html_alternate(inputtxt);
	}

	if ((localsettings.thinking_action == 1 || localsettings.thinking_action == 2) && localsettings.thinking_pattern != "") { //removal of cot
		inputtxt = escape_html_alternate(inputtxt);
		inputtxt = unescape_html(inputtxt);
		let pat = new RegExp(localsettings.thinking_pattern, "gmi");
		let matches = [];
		if (localsettings.thinking_action == 1) {
			let temp = inputtxt.match(pat) || []; // Captures matches in an array
			if (temp.length > 0) {
				temp.forEach(match => {
					let pat2 = new RegExp(localsettings.thinking_pattern, "gmi");
					let execResult = pat2.exec(match);
					if (execResult && execResult[1]) {
						matches.push(execResult[1]); // Store only the capture group
					} else {
						matches.push(match);
					}
				});
				inputtxt = inputtxt.replace(pat, "%ExpandBtn%");
			}
		} //just hide
		else {
			inputtxt = inputtxt.replace(pat, "");
		}
		inputtxt = escape_html(inputtxt);
		inputtxt = unescape_html_alternate(inputtxt);
		if (matches.length > 0) {
			let matchiter = 0;
			inputtxt = inputtxt.replace(/%ExpandBtn%(?:\n{0,2})?/g, function(m) {
				let curr = matches[matchiter];
				let expandedhtml =
					`<span><button type="button" title="Show Thoughts" class="btn btn-primary" style="font-size:12px;padding:2px 2px;" onclick="toggle_hide_thinking(this)">Show Thoughts (${curr.length} characters)</button><span class="color_lightgreen hidden"><br>${
						escape_html(curr)
					}</span><br></span>`;
				if (!curr || curr.trim() == "") {
					expandedhtml =
						`<span><button type="button" title="No Thoughts" class="btn btn-primary" style="font-size:12px;padding:2px 2px;" onclick="">No Thoughts</button><br></span>`;
				}
				++matchiter;
				return expandedhtml;
			});
		}
	}
	return inputtxt;
}

function end_trim_to_sentence(input, include_newline = false) {
	let last = -1;
	let enders = [".", "!", "?", "*", '"', ")", "}", "`", "]", ";", "…"];
	for (let i = 0; i < enders.length; ++i) {
		last = Math.max(last, input.lastIndexOf(enders[i]));
	}

	if (include_newline) {
		let nl = input.lastIndexOf("\n");
		last = Math.max(last, nl);
	}
	if (last > 0) {
		return input.substring(0, last + 1).replace(/[\t\r\n ]+$/, "");
	}
	return input.replace(/[\t\r\n ]+$/, "");
}

function start_trim_to_sentence(input) {
	let p1 = input.indexOf(".");
	let p2 = input.indexOf("!");
	let p3 = input.indexOf("?");
	let p4 = input.indexOf("\n");
	let first = p1;
	let skip1 = false;
	if (p2 > 0 && p2 < first) first = p2;
	if (p3 > 0 && p3 < first) first = p3;
	if (p4 > 0 && p4 < first) {
		first = p4;
		skip1 = true;
	}
	let ret = input;
	if (first > 0) {
		if (skip1) {
			ret = input.substring(first + 1);
		} else {
			ret = input.substring(first + 2);
		}
	}
	if (ret != "") {
		return ret;
	}
	return input;
}

//if the string is longer than len, trim it to the last part, but always trim to a word or sentence boundary.
function substring_to_boundary(input_string, maxlen) {
	if (input_string.length <= maxlen) {
		return input_string;
	} else {
		let cutoff = input_string.length - maxlen;
		let trim = input_string.substring(cutoff);
		let idx = -1;
		let enders = [".", "!", "?", "*", '"', ")", "}", "`", "]", ";", " ", "\n"];
		for (let i = 0; i < enders.length; ++i) {
			let f = trim.indexOf(enders[i]);
			if (idx == -1) {
				idx = f;
			} else if (f >= 0) {
				idx = Math.min(idx, f);
			}
		}
		if (idx >= 0 && idx <= 20) { //if unable to trim safely (20 char max), do not trim
			trim = trim.substring(idx); //no +1, include leading token!
		}
		return trim;
	}
}

var warn_unsaved = false;
function handle_quit() {
	if (warn_unsaved) {
		warn_unsaved = false;
		return "Unsaved changes will be lost!"; //the actual message will not be shown in new browsers
	}
	return undefined;
}

function handle_escape_button(event) {
	if (is_popup_open()) {
		var isEscape = false;
		if ("key" in event) {
			isEscape = event.key === "Escape" || event.key === "Esc";
		} else {
			isEscape = event.keyCode === 27;
		}
		if (isEscape) {
			hide_popups();
		}
	}
}

function handle_typing(event) {
	var event = event || window.event;
	var charCode = event.keyCode || event.which;
	warn_unsaved = true;

	if (!event.shiftKey && (charCode == 13 || (charCode == 10 && event.ctrlKey))) {
		let willsubmit = document.getElementById("entersubmit").checked ? true : false;
		let newgennotempty = document.getElementById("input_text").value != "";
		if (willsubmit) {
			event.preventDefault();
			//enter pressed, trigger auto submit
			if (!document.getElementById("btnsend").disabled) {
				if (newgennotempty || event.ctrlKey) {
					prepare_submit_generation();
				}
			}
		}
	}
}

function show_abort_button(show) {
	if (!show) {
		document.getElementById("abortgen").classList.add("hidden");
		document.getElementById("chat_msg_send_btn_abort").classList.add("hidden");
		document.getElementById("corpo_chat_send_btn_abort").classList.add("hidden");
	} else {
		document.getElementById("abortgen").classList.remove("hidden");
		document.getElementById("chat_msg_send_btn_abort").classList.remove("hidden");
		document.getElementById("corpo_chat_send_btn_abort").classList.remove("hidden");
		websearch_in_progress = false;
	}
}

function flush_streaming_text() {
	if (is_using_custom_ep() && pending_response_id != "" && (synchro_pending_stream != "" || synchro_polled_response != "")) {
		//apply a short delay of 1s before button reenables
		allow_reenable_submitbtn_timestamp = performance.now() + 500;
		setTimeout(() => {
			update_submit_button(true);
		}, 1000);

		if (synchro_pending_stream != "") {
			synchro_polled_response = synchro_pending_stream;
		}
		poll_in_progress = false;
		horde_poll_nearly_completed = false;
		poll_pending_response();
	}
}

function abort_generation() {
	let id_to_cancel = pending_response_id;

	//flush any streaming text first
	flush_streaming_text();

	console.log("Generation " + pending_response_id + " aborted");
	clear_poll_flags();
	render_gametext();

	//we do this last so its ok even if it fails
	if (id_to_cancel && id_to_cancel != "" && !is_using_custom_ep()) {
		let cancelurl = horde_output_endpoint + "/" + id_to_cancel;
		fetch(cancelurl, {
			method: "DELETE",
		})
			.then((response) => response.json())
			.then((data) => {
				console.log(data);
			})
			.catch((error) => {
				console.error("Error:", error);
			});
	} else if (is_using_kcpp_with_streaming()) {
		//we can use abort functions
		fetch(custom_kobold_endpoint + koboldcpp_abort_endpoint, {
			method: "POST", // or 'PUT'
			headers: get_kobold_header(),
			body: JSON.stringify({
				genkey: lastcheckgenkey,
			}),
		})
			.then((response) => response.json())
			.then((data) => {
				trigger_abort_controller();
			})
			.catch((error) => {
				console.error("Error:", error);
			});
	}
	show_abort_button(false);
}

function do_manual_gen_image(sentence, base64img = "") //b64 for img2img
{
	if (localsettings.placeholder_tags) {
		sentence = replace_placeholders(sentence);
	}
	generate_new_image(sentence, base64img, true);
	document.getElementById("btn_genimg").disabled = true;
	document.getElementById("btn_genimg2").disabled = true;
	document.getElementById("corpo_chat_img_btn").disabled = true;
	//disable it for 5 sec to prevent spam
	setTimeout(() => {
		document.getElementById("btn_genimg").disabled = false;
		document.getElementById("btn_genimg2").disabled = false;
		document.getElementById("corpo_chat_img_btn").disabled = false;
	}, 5000);
}

function do_auto_gen_image(truncated_context) {
	var tclen = truncated_context.length;
	var sentence = truncated_context.substring(tclen - 400, tclen);
	sentence = start_trim_to_sentence(sentence);
	sentence = end_trim_to_sentence(sentence, true);
	if (sentence.length > 0) {
		nextgeneratedimagemilestone = tclen + generateimagesinterval;
		do_manual_gen_image(sentence);
	}
}

function add_img_btn_auto() {
	let truncated_context = concat_gametext(true, "");
	truncated_context = replace_placeholders(truncated_context);
	var tclen = truncated_context.length;
	if (tclen > 0) {
		do_auto_gen_image(truncated_context);
	} else {
		msgbox("Error: Your current story is blank.\nAdd some text, or try generating from custom prompt instead.", "Story is Blank");
	}
	document.getElementById("addimgcontainer").classList.add("hidden");
}

function add_img_btn_custom() {
	inputBox("Enter a custom prompt to generate an image with.", "Generate Image Manually", "", "Enter a Prompt", () => {
		let userinput = getInputBoxValue();
		if (userinput.trim() != "") {
			var sentence = userinput.trim().substring(0, 380);
			do_manual_gen_image(sentence);
		}
	}, false);
	document.getElementById("addimgcontainer").classList.add("hidden");
}

function self_upload_img(origImg) {
	let imgid = "selfuploadimg" + (Math.floor(10000 + Math.random() * 90000)).toString();
	let nimgtag = "[<|p|" + imgid + "|p|>]";
	if (localsettings.img_newturn) {
		if (localsettings.opmode == 4) {
			nimgtag = wrap_newgen_instruct_format(nimgtag, false);
		} else if (localsettings.opmode == 3) {
			nimgtag = wrap_newgen_chat_format(nimgtag);
		}
	}
	gametext_arr.push(nimgtag);
	image_db[imgid] = { done: false, queue: "Generating", result: "", prompt: "", poll_category: 0 };
	image_db[imgid].aspect = 0;
	image_db[imgid].imsource = 1; //0=generated,1=uploaded
	image_db[imgid].imrefid = "";
	let imgres = localsettings.img_allowhd ? VHD_RES_PX : NO_HD_RES_PX;
	compressImage(
		origImg,
		(newDataUri, outAspect) => {
			image_db[imgid].done = true;
			image_db[imgid].result = newDataUri;
			if (outAspect <= 0.5) {
				image_db[imgid].aspect = 4; //portrait_long
			} else if (outAspect < 0.7) {
				image_db[imgid].aspect = 1; //portrait
			} else if (outAspect >= 2) {
				image_db[imgid].aspect = 5; //landscape_long
			} else if (outAspect > 1.4) {
				image_db[imgid].aspect = 2; //landscape
			}
		},
		false,
		imgres,
		0.35,
		true,
	);
}

function clear_paste_window() {
	document.getElementById("pasteimgwin").value = "";
}
function img_paste_event(event) {
	var items = (event.clipboardData || event.originalEvent.clipboardData).items;
	let founditem = false;
	for (index in items) {
		var item = items[index];
		if (!founditem && item.kind === "file" && item.type.includes("image")) {
			var blob = item.getAsFile();
			var reader = new FileReader();
			reader.onload = function(event) {
				let origImg = event.target.result;
				self_upload_img(origImg);
			};
			reader.readAsDataURL(blob);
			founditem = true;
			document.getElementById("pasteimgcontainer").classList.add("hidden");
		}
	}
}

var dragdropimgsetup = false;
function add_img_btn_paste() {
	document.getElementById("addimgcontainer").classList.add("hidden");
	document.getElementById("pasteimgcontainer").classList.remove("hidden");

	if (!dragdropimgsetup) {
		const dropZone = document.getElementById("pasteimgwin");
		const onDropFn = function(e) {
			e.preventDefault();
			e.stopPropagation();

			let draggedData = e.dataTransfer;
			let files = draggedData.files;

			console.log(files);
			if (files.length > 0 && files[0] != null && files[0].name && files[0].name != "") {
				const file = files[0];
				const reader = new FileReader();
				reader.onload = function(img) {
					let origImg = img.target.result;
					self_upload_img(origImg);
				};
				reader.readAsDataURL(file);
				document.getElementById("pasteimgcontainer").classList.add("hidden");
			}
		};

		dropZone.addEventListener(
			"dragover",
			(e) => {
				e.preventDefault();
				e.stopPropagation();
			},
			false,
		);
		dropZone.addEventListener(
			"drop",
			(e) => {
				onDropFn(e);
			},
			false,
		);
		dragdropimgsetup = true;
	}
}

var webcamStream = null;
function add_img_btn_webcam() {
	document.getElementById("addimgcontainer").classList.add("hidden");
	document.getElementById("webcamcontainer").classList.remove("hidden");
	const video = document.getElementById("webcamvideo");

	if (webcamStream) {
		stop_webcam();
	}

	navigator.mediaDevices.getUserMedia({
		video: {
			facingMode: { exact: "environment" }, // Request back camera
		},
	})
		.then(stream => {
			webcamStream = stream;
			video.srcObject = stream;
		})
		.catch(err => {
			console.error("Error accessing webcam:", err);

			// Fallback: try default camera if back camera not available
			navigator.mediaDevices.getUserMedia({ video: true })
				.then(fallbackStream => {
					webcamStream = fallbackStream;
					video.srcObject = fallbackStream;
				})
				.catch(fallbackErr => {
					console.error("Fallback error accessing webcam:", fallbackErr);
				});
		});
}
function stop_webcam() {
	if (webcamStream) {
		const video = document.getElementById("webcamvideo");
		webcamStream.getTracks().forEach(track => track.stop());
		video.srcObject = null; // Clear video source
		console.log("Webcam stopped.");
	}
	webcamStream = null;
}
function capture_webcam_btn() {
	const video = document.getElementById("webcamvideo");
	const canvas = document.getElementById("webcamcanvas");
	const context = canvas.getContext("2d");
	const videoWidth = video.videoWidth;
	const videoHeight = video.videoHeight;
	// Draw the cropped square to 512x512 canvas
	const sideLength = Math.min(videoWidth, videoHeight);
	const sx = (videoWidth - sideLength) / 2;
	const sy = (videoHeight - sideLength) / 2;
	context.drawImage(video, sx, sy, sideLength, sideLength, 0, 0, 512, 512);
	const dataURL = canvas.toDataURL("image/png");
	self_upload_img(dataURL); // Call your upload function
	hide_popups();
}

function add_img_btn_upload() {
	let finput = document.getElementById("addimgfileinput");
	finput.click();
	finput.onchange = (event) => {
		if (event.target.files.length > 0 && event.target.files[0]) {
			const file = event.target.files[0];
			const reader = new FileReader();
			reader.onload = function(img) {
				let origImg = img.target.result;
				self_upload_img(origImg);
			};
			reader.readAsDataURL(file);
		}
		finput.value = "";
	};
	document.getElementById("addimgcontainer").classList.add("hidden");
}

function add_img_btn_menu() {
	update_genimg_button_visiblility();
	document.getElementById("addimgcontainer").classList.remove("hidden");
}

function toggle_websearch() {
	if (is_using_kcpp_with_websearch()) {
		localsettings.websearch_enabled = !localsettings.websearch_enabled;
	} else {
		localsettings.websearch_enabled = false;
	}
	update_websearch_button_visibility();
	render_gametext();
}

var xtts_is_connected = false;
var xtts_is_playing = false;
function fetch_xtts_voices(silent, is_xtts) {
	if (!xtts_is_connected) {
		let endpt = is_xtts ? (localsettings.saved_xtts_url + xtts_voices_endpoint) : (localsettings.saved_alltalk_url + alltalk_voices_endpoint);
		fetch(endpt)
			.then(x => x.json())
			.then(data => {
				console.log(data);
				//repopulate our voices list
				if (data && !data.length && data.voices) {
					//alltalk mode
					data = data.voices;
				} else if (data && !data.length && data.constructor == Object) {
					//hybrid new xtts mantella
					let newdata = [];
					for (key in data) {
						let lang = data[key];
						if (lang && lang.speakers && lang.speakers.length > 0) {
							for (let i = 0; i < lang.speakers.length; ++i) {
								newdata.push(lang.speakers[i]);
							}
						}
					}
					if (newdata.length > 0) {
						data = newdata;
					}
				}

				let dropdown = document.getElementById("xtts_voices");
				let selectionhtml = ``;
				for (var i = 0; i < data.length; ++i) {
					// Check for XTTS voices if set
					let sel = localsettings.xtts_voice != "" && localsettings.xtts_voice == data[i];
					selectionhtml += `<option value="` + data[i] + `"` + (sel ? " selected" : "") + `>` + data[i] + `</option>`;
				}
				dropdown.innerHTML = selectionhtml;
				xtts_is_connected = true;
			}).catch((error) => {
				xtts_is_connected = false;
				if (!silent) {
					let epname = is_xtts ? "XTTS" : "AllTalk";
					msgbox(epname + " Connect Error: " + error + "\nCheck " + epname + " API Server endpoint URL.\n");
				}
			});
	}
}

function test_tts() {
	let ssval = document.getElementById("ttsselect").value;
	let speakprompt = "Enter phrase to speak.";

	if (ssval == XTTS_ID || ssval == ALLTALK_ID || ssval == OAI_TTS_ID || ssval == KCPP_TTS_ID || ssval == POLLINATIONS_TTS_ID) {
		speakprompt =
			`Enter phrase to speak.<br><div><input type="checkbox" id="downloadtts" title="Add Endpoint Version Number"><div class="box-label">Download as .wav file</div></div>`;
	}
	inputBox(speakprompt, "Test TTS", "", "Input text to speak", () => {
		let userinput = getInputBoxValue();
		let downloadtts = false;
		if (document.getElementById("downloadtts") != null) {
			downloadtts = document.getElementById("downloadtts").checked ? true : false;
		}
		userinput = userinput.trim();
		if (userinput != null && userinput != "" && ssval > 0) {
			tts_speak(userinput, ssval, downloadtts);
		}
	}, true);
}

function toggle_tts_mode() {
	document.getElementById("xtts_container").classList.add("hidden");
	document.getElementById("oai_tts_container").classList.add("hidden");
	document.getElementById("pollinations_tts_container").classList.add("hidden");
	document.getElementById("alltalk_specific_controls").classList.add("hidden");
	document.getElementById("kcpp_tts_container").classList.add("hidden");

	const selectedTTS = document.getElementById("ttsselect").value;

	if (selectedTTS == XTTS_ID || selectedTTS == ALLTALK_ID) {
		document.getElementById("xtts_container").classList.remove("hidden");

		if (selectedTTS == ALLTALK_ID) {
			document.getElementById("alltalk_specific_controls").classList.remove("hidden");
			fetch_rvc_voices();
			adjust_alltalk_controls();
		}
		fetch_xtts_voices(true, selectedTTS == XTTS_ID);
	} else if (selectedTTS == OAI_TTS_ID) {
		document.getElementById("oai_tts_container").classList.remove("hidden");
	} else if (selectedTTS == POLLINATIONS_TTS_ID) {
		document.getElementById("pollinations_tts_container").classList.remove("hidden");
	} else if (selectedTTS == KCPP_TTS_ID) {
		document.getElementById("kcpp_tts_container").classList.remove("hidden");
		if (is_using_kcpp_with_tts()) {
			document.getElementById("nokcpptts").classList.add("hidden");
		} else {
			document.getElementById("nokcpptts").classList.remove("hidden");
		}
		adjust_kcpptts_controls();
	}
}

// Fetch RVC voices for AllTalk
function fetch_rvc_voices() {
	if (!xtts_is_connected) { //prevent it from constantly fetching, will only fetch once before connecting
		fetch(localsettings.saved_alltalk_url + alltalk_rvc_voices_endpoint)
			.then(response => response.json())
			.then(data => {
				console.log("RVC voices response:", data); // Debug log
				const rvcSelect = document.getElementById("alltalk_rvc_voice");
				rvcSelect.innerHTML = '<option value="Disabled">Disabled</option>';
				if (data.status === "success" && Array.isArray(data.rvcvoices)) { // Changed from data.voices to data.rvcvoices
					data.rvcvoices.forEach(voice => { // Changed from data.voices to data.rvcvoices
						if (voice !== "Disabled") {
							const option = document.createElement("option");
							option.value = voice;
							option.textContent = voice.split("\\").pop().replace(".pth", "");
							rvcSelect.appendChild(option);
						}
					});
				}
			})
			.catch(error => {
				console.log("Error fetching RVC voices:", error);
			});
	}
}

//single callback to update alltalk controls on any alltalk UI event.
function adjust_alltalk_controls() {
	const pitchSlider = document.getElementById("alltalk_rvc_pitch");
	const pitchValue = document.getElementById("alltalk_rvc_pitch_value");
	pitchValue.textContent = pitchSlider.value;
	const streamingMode = document.getElementById("alltalk_streaming").checked ? true : false;
	const rvcSelect = document.getElementById("alltalk_rvc_voice");
	const rvcPitch = document.getElementById("alltalk_rvc_pitch");
	rvcSelect.disabled = streamingMode;
	rvcPitch.disabled = streamingMode;
}

function adjust_kcpptts_controls() {
	if (document.getElementById("kcpp_tts_voice").value == "custom") {
		document.getElementById("kcpp_tts_voice_custom").classList.remove("hidden");
	} else {
		document.getElementById("kcpp_tts_voice_custom").classList.add("hidden");
	}
	if (document.getElementById("kcpp_tts_voice").value == "voiceclone") {
		document.getElementById("kcpp_tts_voice_clone").classList.remove("hidden");
	} else {
		document.getElementById("kcpp_tts_voice_clone").classList.add("hidden");
	}
}

// Update set_xtts_url to use the new fetch_rvc_voices function
function set_xtts_url() {
	let is_xtts = document.getElementById("ttsselect").value == XTTS_ID;
	let epname = is_xtts ? "XTTS" : "AllTalk";
	inputBox(
		"Enter " + epname + " API Server URL.",
		epname + " API Server URL",
		is_xtts ? localsettings.saved_xtts_url : localsettings.saved_alltalk_url,
		"Input " + epname + " API Server URL",
		() => {
			let userinput = getInputBoxValue();
			userinput = userinput.trim();
			if (userinput != "" && userinput.slice(-1) == "/") {
				userinput = userinput.slice(0, -1);
			}
			if (userinput == "") {
				userinput = is_xtts ? default_xtts_base : default_alltalk_base;
			}
			if (userinput != null && userinput != "") {
				xtts_is_connected = false;
				if (is_xtts) {
					localsettings.saved_xtts_url = userinput.trim();
				} else {
					localsettings.saved_alltalk_url = userinput.trim();
					// Fetch RVC voices with new URL
					fetch_rvc_voices();
				}
				fetch_xtts_voices(false, is_xtts);
			}
		},
		false,
	);
}

function tts_download(arrayBufferData) {
	var a = document.getElementById("tempfile");
	var file = new Blob([arrayBufferData], { type: "audio/wav" });
	if (tempfileurl) {
		window.URL.revokeObjectURL(tempfileurl);
	}
	tempfileurl = window.URL.createObjectURL(file);
	a.href = tempfileurl;
	a.target = "_blank";
	a.download = "audio.wav";
	setTimeout(function() {
		a.click();
	}, 20);
}

function tts_speak(text, speech_synth_override = null, do_download = false) {
	if (!text || text == "" || text.trim() == "") {
		return;
	}
	let ssval = localsettings.speech_synth;
	let ssrate = localsettings.tts_speed;
	let vcjson = localsettings.kcpp_tts_json;
	if (speech_synth_override != null) {
		ssval = speech_synth_override;
		ssrate = document.getElementById("tts_speed").value;
		vcjson = kcpp_tts_json;
	}
	if (localsettings.narrate_only_dialog) {
		// Remove text within asterisks and the asterisks, then trim
		text = text.replace(italics_regex, "").trim();
		let strippedtxt = "";
		// Simply remove escaped quotes
		text = replaceAll(text, '\\"', "");
		//match and extract remaining quotes
		let matches = text.match(/"(.*?)"/g);
		for (let m in matches) {
			if (matches[m] != "" && matches[m].trim() != "") {
				strippedtxt += matches[m].trim() + " \n"; //newline for a break.
			}
		}
		if (strippedtxt.trim() != "") {
			text = strippedtxt;
		}
	}

	if (ssval == XTTS_ID || ssval == ALLTALK_ID || ssval == OAI_TTS_ID || ssval == KCPP_TTS_ID || ssval == POLLINATIONS_TTS_ID) { //xtts api server
		let is_xtts = ssval == XTTS_ID;
		let is_oai_tts = ssval == OAI_TTS_ID;
		let is_kcpp_tts = ssval == KCPP_TTS_ID;
		let is_pollinations_tts = ssval == POLLINATIONS_TTS_ID;
		const audioContext = new (window.AudioContext || window.webkitAudioContext)();
		let audiofile_ref = null;

		if (is_oai_tts || is_kcpp_tts) {
			let payload = {};
			let ttsheaders = {};
			let sub_endpt = "";
			if (is_oai_tts) {
				sub_endpt = localsettings.saved_oai_tts_url;
				payload = {
					model: document.getElementById("oai_tts_model").value,
					input: text,
					voice: document.getElementById("oai_tts_voice").value,
				};
				ttsheaders = {
					"Content-Type": "application/json",
					Authorization: "Bearer " + localsettings.saved_oai_tts_key,
				};
			} else {
				sub_endpt = apply_proxy_url(custom_kobold_endpoint + koboldcpp_tts_endpoint);
				let is_voiceclone = document.getElementById("kcpp_tts_voice").value == "voiceclone";
				let is_custom = document.getElementById("kcpp_tts_voice").value == "custom";
				payload = {
					input: text,
					voice: is_custom ? document.getElementById("kcpp_tts_voice_custom").value : document.getElementById("kcpp_tts_voice").value,
				};
				if (is_voiceclone && vcjson) {
					payload.speaker_json = vcjson;
				}
				ttsheaders = get_kobold_header();
			}

			fetch(sub_endpt, {
				method: "POST",
				headers: ttsheaders,
				body: JSON.stringify(payload),
			})
				.then(response => response.arrayBuffer())
				.then(data => {
					audiofile_ref = data.slice(0);
					return audioContext.decodeAudioData(data);
				})
				.then(decodedData => {
					if (do_download) {
						tts_download(audiofile_ref);
					}
					const playSound = audioContext.createBufferSource();
					playSound.buffer = decodedData;
					playSound.connect(audioContext.destination);
					xtts_is_playing = true;
					update_submit_button(false);
					playSound.start(audioContext.currentTime);
					playSound.onended = function() {
						setTimeout(() => {
							xtts_is_playing = false;
							update_submit_button(false);
							console.log("Audio finished playing");
						}, 300);
					};
				}).catch((error) => {
					console.log("XTTS Speak Error: " + error);
				});
		} else if (is_pollinations_tts) {
			const pollinations_params = new URLSearchParams({
				model: "openai-audio",
				voice: document.getElementById("pollinations_voices").value,
				private: true,
				referrer: "koboldai",
			});
			const speechprompt = `Please narrate the following text:\n\n${text}`;

			let gen_endpoint = `${pollinations_text_endpoint}/${encodeURIComponent(speechprompt)}?${pollinations_params.toString()}`;

			fetch(gen_endpoint, {
				method: "GET",
			})
				.then(response => response.arrayBuffer())
				.then(data => {
					audiofile_ref = data.slice(0);
					return audioContext.decodeAudioData(data);
				})
				.then(decodedData => {
					if (do_download) {
						tts_download(audiofile_ref);
					}
					const playSound = audioContext.createBufferSource();
					playSound.buffer = decodedData;
					playSound.connect(audioContext.destination);
					xtts_is_playing = true;
					update_submit_button(false);
					playSound.start(audioContext.currentTime);
					playSound.onended = function() {
						setTimeout(() => {
							xtts_is_playing = false;
							update_submit_button(false);
							console.log("Audio finished playing");
						}, 300);
					};
				}).catch((error) => {
					console.log("Pollinations Speak Error: " + error);
				});
		} else if (xtts_is_connected) {
			if (is_xtts) {
				let xtts_payload = {
					text: text,
					speaker_wav: document.getElementById("xtts_voices").value,
					language: document.getElementById("xtts_lang").value.trim(),
				};
				fetch(localsettings.saved_xtts_url + xtts_gen_endpoint, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(xtts_payload),
				})
					.then(response => response.arrayBuffer())
					.then(data => {
						audiofile_ref = data.slice(0);
						return audioContext.decodeAudioData(data);
					})
					.then(decodedData => {
						if (do_download) {
							tts_download(audiofile_ref);
						}
						const playSound = audioContext.createBufferSource();
						playSound.buffer = decodedData;
						playSound.connect(audioContext.destination);
						xtts_is_playing = true;
						update_submit_button(false);
						playSound.start(audioContext.currentTime);
						playSound.onended = function() {
							setTimeout(() => {
								xtts_is_playing = false;
								update_submit_button(false);
								console.log("Audio finished playing");
							}, 300);
						};
					}).catch((error) => {
						xtts_is_playing = false;
						update_submit_button(false);
						console.log("XTTS Speak Error: " + error);
					});
			} else {
				//alltalk
				const isStreaming = document.getElementById("alltalk_streaming").checked ? true : false;

				let playDecodedAllTalkData = function(decodedData) {
					const playSound = audioContext.createBufferSource();
					playSound.buffer = decodedData;
					playSound.connect(audioContext.destination);
					xtts_is_playing = true;
					update_submit_button(false);
					playSound.start(audioContext.currentTime);
					playSound.onended = function() {
						setTimeout(() => {
							xtts_is_playing = false;
							update_submit_button(false);
							console.log("Audio finished playing");
						}, 300);
					};
				};

				if (isStreaming) {
					// Create a URLSearchParams object for streaming
					const params = new URLSearchParams({
						text: text,
						voice: document.getElementById("xtts_voices").value,
						language: document.getElementById("xtts_lang").value.trim().toLowerCase(),
						output_file: "klite_stream_output.wav",
					});

					// Create streaming URL, but right now it's as good as sync
					const streamingUrl = `${localsettings.saved_alltalk_url}${alltalk_stream_endpoint}?${params.toString()}`;
					fetch(streamingUrl)
						.then(response => response.arrayBuffer())
						.then(data => {
							audiofile_ref = data.slice(0);
							return audioContext.decodeAudioData(data);
						})
						.then(decodedData => {
							if (do_download) {
								tts_download(audiofile_ref);
							}
							playDecodedAllTalkData(decodedData);
						})
						.catch((error) => {
							console.log("AllTalk v2 Speak Error:", data);
							xtts_is_playing = false;
							update_submit_button(false);
						});
				} else {
					// Standard mode using FormData
					const formData = new FormData();
					formData.append("text_input", text);
					formData.append("text_filtering", "none");
					formData.append("character_voice_gen", document.getElementById("xtts_voices").value);
					formData.append("narrator_enabled", false);
					formData.append("narrator_voice_gen", document.getElementById("xtts_voices").value);
					formData.append("text_not_inside", "character");
					formData.append("language", document.getElementById("xtts_lang").value.trim().toLowerCase());
					formData.append("output_file_name", "audiofile");
					formData.append("output_file_timestamp", true);
					formData.append("autoplay", false);
					formData.append("autoplay_volume", 1.0);
					formData.append("rvccharacter_voice_gen", document.getElementById("alltalk_rvc_voice").value);
					formData.append("rvccharacter_pitch", document.getElementById("alltalk_rvc_pitch").value);
					formData.append("rvcnarrator_voice_gen", document.getElementById("alltalk_rvc_voice").value);
					formData.append("rvcnarrator_pitch", document.getElementById("alltalk_rvc_pitch").value);

					fetch(localsettings.saved_alltalk_url + alltalk_gen_endpoint, {
						method: "POST",
						body: formData, // send payload as FormData
					}).then(response => {
						//content type can be JSON (alltalk v2) or raw audio (v1)
						const contentType = response.headers.get("Content-Type");
						//alltalk v2 json
						if (contentType && contentType.toLowerCase().includes("application/json")) {
							return response.json().then(data => {
								if (data && data.output_file_url && data.status === "generate-success") {
									const audioUrl = `${localsettings.saved_alltalk_url}${data.output_file_url}`;
									fetch(audioUrl)
										.then(response => response.arrayBuffer())
										.then(data => {
											audiofile_ref = data.slice(0);
											return audioContext.decodeAudioData(data);
										})
										.then(decodedData => {
											if (do_download) {
												tts_download(audiofile_ref);
											}
											playDecodedAllTalkData(decodedData);
										})
										.catch((error) => {
											console.log("AllTalk v2 Speak Error:", data);
											xtts_is_playing = false;
											update_submit_button(false);
										});
								} else {
									console.log("AllTalk Generation Error:", data);
									xtts_is_playing = false;
									update_submit_button(false);
								}
							})
								.catch((error) => {
									console.log("AllTalk Request Error:", error);
									xtts_is_playing = false;
									update_submit_button(false);
								});
						} //alltalk v1 audio
						else {
							return response.arrayBuffer().then(data => {
								audiofile_ref = data.slice(0);
								return audioContext.decodeAudioData(data);
							})
								.then(decodedData => {
									if (do_download) {
										tts_download(audiofile_ref);
									}
									playDecodedAllTalkData(decodedData);
								}).catch((error) => {
									console.log("AllTalk v1 Speak Error: " + error);
									xtts_is_playing = false;
									update_submit_button(false);
								});
						}
					}).catch((error) => {
						console.log("AllTalk Non-Stream Req Error: " + error);
						xtts_is_playing = false;
						update_submit_button(false);
					});
				}
			}
		}
	} else {
		if ("speechSynthesis" in window) {
			let utterance = new window.SpeechSynthesisUtterance(text);
			utterance.voice = window.speechSynthesis.getVoices()[ssval - 1];
			utterance.rate = ssrate;
			window.speechSynthesis.speak(utterance);
			utterance.onend = function(event) {
				update_submit_button(false);
			};
		}
	}
}

var ptt_start_timestamp = performance.now();
var recent_voice_duration = 0;
function ptt_start() {
	if (voice_typing_mode > 0) {
		voice_is_speaking = true;
		++voice_speaking_counter;
		if (ready_to_record()) {
			if (voicerecorder.state === "inactive") {
				if (voiceprerecorder.state !== "inactive") {
					voiceprerecorder.stop();
				}
				voicerecorder.start();
			}
			voice_is_recording = true;
			update_submit_button(false);
			ptt_start_timestamp = performance.now();
		}
	}
}
function ptt_end() {
	var voice_end_delay = localsettings.voice_end_delay;
	if (voice_typing_mode > 0) {
		voice_is_speaking = false;
		let check_speak_counter = voice_speaking_counter;
		setTimeout(() => {
			if (voice_is_recording && !voice_is_speaking && voice_speaking_counter == check_speak_counter) {
				//generate prerecorder blobs (prebuffer 1sec)
				preaudioblobs = [];
				if (voice_typing_mode == 1) {
					for (let i = 0; i < preaudiobuffers.length; ++i) {
						preaudioblobs.push(new Blob([preaudiobuffers[i]], { type: "audio/webm" }));
					}
				}
				recent_voice_duration = performance.now() - ptt_start_timestamp;
				if (voicerecorder.state !== "inactive") {
					voicerecorder.stop();
				}
				voice_is_recording = false;
				update_submit_button(false);
				if (recent_voice_duration < 500) { //if too short, fall back to click behavior
					if (is_corpo_ui() || is_aesthetic_ui()) {
						chat_submit_generation();
					} else {
						prepare_submit_generation();
					}
				}
			}
		}, voice_end_delay); //prevent premature stopping
	}
}
function submit_generation_button(aesthetic_ui) {
	if (voice_typing_mode == 0) { //only when voice is off
		if (aesthetic_ui) {
			chat_submit_generation();
		} else {
			prepare_submit_generation();
		}
	}
}

function getMaxAllowedCharacters(content, maxctxlen, maxgenamt) {
	//this is a hack since we dont have a proper tokenizer, but we can estimate 1 token per 3 characters
	let chars_per_token = 3.0;
	//we try to detect attempts at coding which tokenize poorly. This usually happens when the average word length is high.
	let avgwordlen = (1.0 + content.length) / (1.0 + count_words(content));
	if (avgwordlen >= 7.8) {
		chars_per_token = 2.7;
	}
	if (current_memory == null || current_memory.trim() == "") {
		//if there is no memory, then we can be a lot of lenient with the character counts since the backend will truncate excess anyway
		chars_per_token = 4.8;
	}
	if (is_using_kcpp_with_added_memory()) { //easily handle overflow
		chars_per_token = 6;
	}
	chars_per_token = chars_per_token * (localsettings.token_count_multiplier * 0.01);
	return Math.max(1, Math.floor((maxctxlen - maxgenamt) * chars_per_token) - 12);
}

function wrap_newgen_instruct_format(newgen, addendtag) {
	let ist = get_instructstartplaceholder();
	let iet = get_instructendplaceholder();
	let iste = get_instructstartplaceholder_end();
	let prev_et = get_instruct_latest_end(false);

	if (newgen != "") {
		if (localsettings.inject_chatnames_instruct) {
			newgen = get_my_multiplayer_chatname() + ": " + newgen;
		}
		if (localsettings.inject_timestamps) {
			newgen = get_current_timestamp() + " " + newgen;
		}

		//append instruction for instruct mode
		if (localsettings.separate_end_tags) {
			newgen = prev_et + ist + newgen + iste + (addendtag ? iet : "");
		} else {
			newgen = ist + newgen + (addendtag ? iet : "");
		}
	} //may be continuting existing instruction OR starting a brand new session. check if first action
	else {
		if (is_impersonate_user) {
			is_impersonate_user = false;
			if (localsettings.separate_end_tags) {
				pending_context_preinjection = prev_et + ist; //bot response as first msg
				pending_context_postinjection = iste + iet;
			} else {
				pending_context_preinjection = ist; //bot response as first msg
				pending_context_postinjection = iet;
			}
		} else {
			if (gametext_arr.length == 0) {
				newgen = iet;
			}
		}
	}
	return newgen;
}

function wrap_newgen_chat_format(newgen) {
	//append chatname for chatmode
	let injecttime = "";
	if (localsettings.inject_timestamps) {
		injecttime = " " + get_current_timestamp();
	}
	newgen = "\n" + get_my_multiplayer_chatname() + ":" + injecttime + " " + newgen + "";
	return newgen;
}

function prepare_submit_generation() //wrap websearch into this
{
	let senttext = document.getElementById("input_text").value;
	document.getElementById("input_text").value = "";
	PerformWebsearch(senttext, (res) => {
		submit_generation(senttext);
	});
}

const submit_generation = asyncRunner(function*(senttext) {
	warn_unsaved = true;
	let newgen = senttext;
	let img_gen_trigger_prompt = "";
	let doNotGenerate = false;
	retry_in_progress = false;

	//match the request for creating images in instruct modes
	if (
		newgen != "" && localsettings.img_gen_from_instruct && localsettings.opmode == 4 && localsettings.generate_images_mode != 0
		&& localsettings.img_autogen_type != 2 && !newgen.includes("\n")
	) {
		let newgenlc = newgen.toLowerCase().trim();
		if (
			newgenlc.startsWith("draw ")
			|| newgenlc.match(
				/\b(?:draw (?:a|an)\b)|(?:draw me (?:a|an)\b)|(?:(?:draw|show me|generate|create|make|illustrate|visualize|produce|give me)(?:\s\w+){0,4}\s(?:image\b|picture\b|drawing\b|photo))/,
			)
		) {
			img_gen_trigger_prompt = newgen;
			doNotGenerate = true;
		}
	}

	//apply regex transforms
	if (localsettings.regexreplace_data && localsettings.regexreplace_data.length > 0) {
		for (let i = 0; i < localsettings.regexreplace_data.length; ++i) {
			if (localsettings.regexreplace_data[i].b && !(localsettings.regexreplace_data[i].d) && localsettings.regexreplace_data[i].p != "") {
				let pat = new RegExp(localsettings.regexreplace_data[i].p, "gm");
				let rep = localsettings.regexreplace_data[i].r;
				rep = unescape_regex_newlines(rep);
				newgen = newgen.replace(pat, rep);
			}
		}
	}

	const user_input_empty = newgen.trim() == "";
	pending_context_postinjection = "";

	if (!user_input_empty || gametext_arr.length > 0 || current_memory != "" || current_anote != "") {
		waiting_for_tool_call = 0;
		idle_timer = 0;
		idle_triggered_counter = 0;
		if (localsettings.speech_synth > 0) {
			if (localsettings.narrate_both_sides) {
				tts_speak(newgen);
			}
		}

		if (localsettings.opmode == 4) {
			newgen = wrap_newgen_instruct_format(newgen, true);
		}
		if (localsettings.opmode == 3 && newgen != "") {
			newgen = wrap_newgen_chat_format(newgen);
		} else if (localsettings.opmode == 3 && newgen.trim() == "") {
			//if chat submitted was empty, add a newline? (or not)
			newgen = "";
		}
		if (localsettings.opmode == 2 && newgen != "" && localsettings.adventure_switch_mode != 0) {
			//append action for adventure mode, except for the first turn.
			let diceaddon = "";
			if (localsettings.adventure_switch_mode == 2) {
				let roll = Math.floor(Math.random() * 20) + 1;
				let outcome = roll == 20
					? "Perfect"
					: (roll > 16 ? "Excellent" : (roll > 12 ? "Good" : (roll > 8 ? "Fair" : (roll > 4 ? "Poor" : "Terrible"))));
				diceaddon = ` (Rolled 1d20=${roll}/20, Outcome: ${outcome})`;
			}
			newgen = "\n\n\> " + newgen + diceaddon + "\n\n";
		}
		//if very first submission is a story in adventure mode, swap to action
		if (localsettings.opmode == 2 && newgen != "" && gametext_arr.length == 0) {
			if (localsettings.adventure_switch_mode == 0) {
				localsettings.adventure_switch_mode = 1;
				if (current_memory.trim() == "") {
					doNotGenerate = true;
				}
			}
		}

		if (newgen != "") {
			gametext_arr.push(newgen);
		}
		redo_arr = [];
		retry_prev_text = [];
		retry_preserve_last = true; //initially set to true
		redo_prev_text = [];
		pending_response_id = "-1";

		let mtl = document.getElementById("maintxtloader");
		if (mtl) {
			mtl.classList.remove("greenloader");
			mtl.classList.remove("redloader");
			let oln = document.getElementById("outerloadernum");
			if (oln) {
				oln.innerText = "";
			}
		}

		//auto adjust settings if requested
		let maxctxlen = localsettings.max_context_length;
		let maxgenamt = localsettings.max_length;
		if (!is_using_custom_ep() && (localsettings.auto_genamt || localsettings.auto_ctxlen)) {
			//get all workers running all selected models
			let wrk_list = selected_workers;
			if ((wrk_list == null || wrk_list.length == 0) && (selected_models && selected_models.length > 0)) {
				wrk_list = [];
				for (let ww = 0; ww < worker_data.length; ++ww) {
					let curr = worker_data[ww];
					for (let mm = 0; mm < selected_models.length; ++mm) {
						let x = selected_models[mm];
						if (curr.models.includes(x.name)) {
							wrk_list.push(curr);
							break;
						}
					}
				}
			}

			//get the minimum requires parameters, lowest common value for all selected
			for (let ww = 0; ww < wrk_list.length; ++ww) {
				let curr = wrk_list[ww];
				if (localsettings.auto_ctxlen) {
					maxctxlen = Math.min(curr.max_context_length, maxctxlen);
				}
				if (localsettings.auto_genamt) {
					maxgenamt = Math.min(curr.max_length, maxgenamt);
				}
			}
		}

		let truncated_context = concat_gametext(true, "", "", "", false, true); //no need to truncate if memory is empty
		truncated_context = truncated_context.replace(/\xA0/g, " "); //replace non breaking space nbsp

		//remove past thoughts
		if (localsettings.thinking_pattern != "") { //removal of cot
			if (localsettings.strip_thinking_mode == 2) { //strip all thinking
				let pat = new RegExp(localsettings.thinking_pattern, "gm");
				truncated_context = truncated_context.replace(pat, "");
			} else if (localsettings.strip_thinking_mode == 1) { //strip except recent
				let endmatcher = get_instructendplaceholder();
				let lastInstructIdx = truncated_context.lastIndexOf(endmatcher);
				if (lastInstructIdx !== -1) {
					let beforePart = truncated_context.slice(0, lastInstructIdx); // Split into two parts
					let afterPart = truncated_context.slice(lastInstructIdx);
					let pat = new RegExp(localsettings.thinking_pattern, "gm"); // Remove all thinking before splitpoint
					beforePart = beforePart.replace(pat, "");
					truncated_context = beforePart + afterPart; // Combine and done
				}
			}
		}

		let max_allowed_characters = getMaxAllowedCharacters(truncated_context, maxctxlen, maxgenamt);

		//allow autogen images
		if (localsettings.img_autogen_type == 2 && localsettings.generate_images_mode != 0) {
			let injected =
				"[Important Note: This GUI is capable of generating images as outputs. Whenever you want to generate any image, simply output the image description within t2i prompt tags like this <t2i>any image description here</t2i> and an image will be generated and inserted inline there. This can be done anytime, anywhere, it will happen automatically on display.]\n\n";
			truncated_context = injected + truncated_context;
		}

		//for adventure mode, inject hidden context, even more if there's nothing in memory
		if (localsettings.opmode == 2 && localsettings.adventure_context_mod) {
			let injected = "[Interactive Fiction: Game Mode Enabled]\n[You are playing a choose-your-own-adventure game. Please input action.]\n";
			injected += "\n\n\> Look\n\nYou look around, observing yourself and your surroundings.\n\n";

			truncated_context = injected + truncated_context;
		}

		//for chatmode, inject hidden context if AN and memory are empty, and if there's no story in context before the chat
		if (localsettings.opmode == 3) {
			let co = localsettings.chatopponent;

			//randomize opponent if there is more than one
			let hasMulti = false;
			if (!is_impersonate_user && co.includes("||$||")) {
				let coarr = co.split("||$||");
				coarr = coarr.filter(x => (x && x != ""));
				coarr = coarr.filter(x => (!groupchat_removals.includes(x)));
				coarr = coarr.map(x => x.trim());
				co = coarr[Math.floor(Math.random() * coarr.length)];

				//we check if a name was recently mentioned in the previous response.
				//if so, switch to that user
				if (gametext_arr.length > 0) {
					let recenttext = gametext_arr[gametext_arr.length - 1].toLowerCase();
					let spokennames = coarr.filter(x => (recenttext.includes(x.toLowerCase())));
					let selfname = get_my_multiplayer_chatname() + "\: ";
					let wasself = recenttext.includes(selfname.toLowerCase());
					if (wasself && spokennames.length > 0) {
						co = spokennames[Math.floor(Math.random() * spokennames.length)];
					}
				}

				hasMulti = coarr.length > 1;
			}

			if (co == null || co == "" || co.trim() == "") {
				co = "";
			}

			//examine context to try to determine if there's an existing botname
			var othernamesregex = new RegExp("\n(?!" + get_my_multiplayer_chatname() + ").+?\: ", "gi");
			if (!localsettings.chat_match_any_name && localsettings.chatopponent != "") {
				let namelist = localsettings.chatopponent.split("||$||");
				var namePattern = namelist.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
				othernamesregex = new RegExp("(" + namePattern + "): ", "gi");
			}
			var tempfullsearchable = current_memory + current_anote + truncated_context;
			var foundopponent = tempfullsearchable.match(othernamesregex);

			//if co is default, and we found an opponent, use their name instead
			if (co == "" && foundopponent != null && foundopponent.length > 0) {
				let trimmed = foundopponent[0].replace(": ", "");
				trimmed = trimmed.trim();
				if (trimmed != "") co = trimmed;
			}

			let original_co = co;
			if (is_impersonate_user) { //replace opponent with ourselves if needed
				is_impersonate_user = false;
				co = get_my_multiplayer_chatname();
			}

			if (localsettings.chat_context_mod && current_anote.length == 0 && current_memory.length == 0 && current_wi.length == 0) {
				if (gametext_arr.length > 0 && gametext_arr[0].startsWith("\n" + localsettings.chatname + ": ")) {
					let injected = "[The following is an interesting chat message log between " + localsettings.chatname + " and " + original_co
						+ ".]\n\n" + localsettings.chatname + ": Hi.\n" + original_co + ": Hello.";
					if (co == "") {
						injected = "[The following is an interesting chat message log between " + localsettings.chatname + " and someone else.]\n\n"
							+ localsettings.chatname + ": Hi.";
					}
					if (hasMulti) {
						injected = "[The following is an interesting chat message log between " + localsettings.chatname
							+ " and multiple others.]\n\n" + localsettings.chatname + ": Hi.";
					}
					truncated_context = injected + truncated_context;
				}
			}

			//if we can infer the name of our chat opponent, inject it to force bot response after ours
			if (co != "" && co.trim() != "") {
				co = replaceAll(co, "\n", "");
				pending_context_preinjection = "\n" + co + ":";
				if (localsettings.inject_timestamps) {
					pending_context_preinjection += " " + get_current_timestamp();
				}
			} else {
				pending_context_preinjection = "\n";
			}

			if (localsettings.allow_continue_chat && newgen.trim() == "" && co != "") {
				let me = get_my_multiplayer_chatname();
				//determine if the most recent speaker is ourself
				let last_self = Math.max(truncated_context.lastIndexOf(me + ":"), truncated_context.lastIndexOf("\n" + me));
				let last_oppo = truncated_context.lastIndexOf(co + ":");

				if (last_oppo > -1 && last_oppo > last_self) {
					//allow continuing a previous bot reply instead of starting a new row.
					pending_context_preinjection = "";
				} else {
					//start a new bot response
					truncated_context += pending_context_preinjection;
				}
			} else {
				//start a new bot response
				truncated_context += pending_context_preinjection;
			}
		}

		const rawNewText = newgen;

		if (localsettings.opmode == 4) {
			if (pending_context_preinjection == "" && truncated_context != "") {
				let endmatcher = get_instructendplaceholder();
				if (truncated_context.toLowerCase().trim().endsWith(endmatcher.toLowerCase().trim())) {
					if (localsettings.inject_timestamps) {
						pending_context_preinjection += get_current_timestamp();
					}
					if (localsettings.inject_chatnames_instruct && localsettings.chatopponent != "") {
						if (localsettings.inject_timestamps) {
							pending_context_preinjection += " ";
						}
						let coarr = localsettings.chatopponent.split("||$||");
						coarr = coarr.filter(x => (x && x != ""));
						coarr = coarr.filter(x => (!groupchat_removals.includes(x)));
						coarr = coarr.map(x => x.trim());
						let co = coarr[Math.floor(Math.random() * coarr.length)];
						pending_context_preinjection += co + ":";
						if (
							localsettings.inject_jailbreak_instruct || (localsettings.think_injected != 0 && localsettings.start_thinking_tag != "")
						) {
							pending_context_preinjection += " ";
						}
					}
					if (localsettings.think_injected == 1 && localsettings.start_thinking_tag != "") {
						pending_context_preinjection = pending_context_preinjection + localsettings.start_thinking_tag.replaceAll("\\n", "\n");
					} else if (localsettings.think_injected == 2 && localsettings.start_thinking_tag != "" && localsettings.stop_thinking_tag != "") {
						pending_context_preinjection = pending_context_preinjection + localsettings.start_thinking_tag.replaceAll("\\n", "\n")
							+ "\n\n" + localsettings.stop_thinking_tag.replaceAll("\\n", "\n");
					}
					if (localsettings.inject_jailbreak_instruct) {
						pending_context_preinjection = pending_context_preinjection + localsettings.custom_jailbreak_text.replaceAll("\\n", "\n");
					}
				}
			}
			truncated_context += pending_context_preinjection;
		}

		//determine if a new generated image is needed, chatmode is excluded, instruct is excluded
		if (localsettings.generate_images_mode != 0 && localsettings.img_autogen_type == 1) {
			//if adventure mode, generate every action
			if (
				((localsettings.opmode == 3 || localsettings.opmode == 4) && newgen != "")
				|| (localsettings.opmode == 2 && newgen.startsWith("\n\n\> "))
				|| localsettings.opmode == 1
			) {
				//generate every few hundred chars
				var tclen = truncated_context.length;
				if (tclen > nextgeneratedimagemilestone) {
					do_auto_gen_image(truncated_context);
				}
			}
		}

		//we clip the memory if its too long, taking the last x chars (not the first)
		//memory is allowed to be up to 0.8 times of ctx allowance, anote up to 0.6 times
		let max_mem_len = Math.floor(max_allowed_characters * 0.8);
		let max_anote_len = Math.floor(max_allowed_characters * 0.6);
		let max_wi_len = Math.floor(max_allowed_characters * 0.5);
		let appendedsysprompt = "";
		if (localsettings.opmode == 4 && localsettings.instruct_sysprompt != "") {
			max_mem_len = Math.floor(max_allowed_characters * 0.7);
			appendedsysprompt = get_instruct_systag(false) + localsettings.instruct_sysprompt;
			if (localsettings.separate_end_tags && get_instruct_systag_end(true)) {
				appendedsysprompt += get_instruct_systag_end(false);
			}
			appendedsysprompt += "\n";
		}
		let truncated_memory = substring_to_boundary(current_memory, max_mem_len);
		if (truncated_memory != null && truncated_memory != "") {
			if (newlineaftermemory) {
				truncated_memory += "\n";
			}
		}

		//if world info exists, we inject it right after the memory
		//for each matching key
		let wimatch_context = truncated_context;
		if (wi_searchdepth > 0) {
			let cutoff = wimatch_context.length - wi_searchdepth;
			cutoff = cutoff < 0 ? 0 : cutoff;
			wimatch_context = wimatch_context.substring(cutoff);
		}
		if (!localsettings.case_sensitive_wi) {
			wimatch_context = wimatch_context.toLowerCase();
		}

		let wistr = "";
		if (current_wi.length > 0) {
			for (var x = 0; x < current_wi.length; ++x) {
				let wi = current_wi[x];

				let shoulduse = false;

				//see if this is a valid wi entry
				if (wi.content == null || wi.content == "") {
					continue;
				}

				if (wi.widisabled) {
					continue;
				}

				if (wi.constant) {
					shoulduse = true;
				} else {
					//see if this is a valid wi entry
					if (wi.key == null || wi.key == "") {
						continue;
					}

					//selective, but bad secondary key. treat as only 1 key
					let invalidseckey = wi.selective && (wi.keysecondary == "" || wi.keysecondary == null);
					let invalidantikey = wi.selective && (wi.keyanti == "" || wi.keyanti == null);

					let wiks = wi.key.split(",");

					if (!wi.selective || (invalidseckey && invalidantikey)) {
						if (localsettings.case_sensitive_wi) {
							shoulduse = wiks.some(k => wimatch_context.includes(k.trim()));
						} else {
							shoulduse = wiks.some(k => wimatch_context.includes(k.trim().toLowerCase()));
						}
					} else {
						let wikanti = [];
						let wiks2 = [];
						if (!invalidantikey) {
							wikanti = wi.keyanti.split(",");
						}
						if (!invalidseckey) {
							wiks2 = wi.keysecondary.split(",");
						}
						let t1 = false, t2 = false, t3 = false;
						if (localsettings.case_sensitive_wi) {
							t1 = wiks.some(k => wimatch_context.includes(k.trim()));
							t2 = wiks2.some(k => wimatch_context.includes(k.trim()));
							t3 = wikanti.some(k => wimatch_context.includes(k.trim()));
						} else {
							t1 = wiks.some(k => wimatch_context.includes(k.trim().toLowerCase()));
							t2 = wiks2.some(k => wimatch_context.includes(k.trim().toLowerCase()));
							t3 = wikanti.some(k => wimatch_context.includes(k.trim().toLowerCase()));
						}
						if (!invalidantikey && !invalidseckey) { //all keys valid
							shoulduse = t1 && t2 && !t3;
						} else if (invalidantikey) {
							shoulduse = t1 && t2;
						} else {
							shoulduse = t1 && !t3;
						}
					}
				}

				if (shoulduse) {
					//check if randomness less than 100%
					if (wi.probability && wi.probability < 100) {
						let roll = Math.floor(Math.random() * 100) + 1;
						if (roll < wi.probability) {
							wistr += wi.content + "\n";
						}
					} else {
						//always insert
						wistr += wi.content + "\n";
					}
				}
			}
		}

		//use newest websearch results
		if (localsettings.websearch_enabled && is_using_kcpp_with_websearch() && lastSearchResults && lastSearchResults.length > 0) {
			for (let i = 0; i < lastSearchResults.length; ++i) {
				let sresult = lastSearchResults[i];
				let snippet = `\n[Search Snippet: ${sresult.title}\nSource: ${sresult.url}\nExcerpt: ${((sresult.content && sresult.content != "")
					? sresult.content
					: sresult.desc)}]`;
				wistr = snippet + wistr;
			}
			if (recentSearchQueries && recentSearchQueries.length > 0 && localsettings.websearch_retain) {
				for (let i = 0; i < recentSearchQueries.length; ++i) {
					let sresult = recentSearchQueries[i];
					let snippet =
						`\n[Old Search Snippet: ${sresult.title}\nSource: ${sresult.url}\nExcerpt: ${((sresult.content && sresult.content != "")
							? sresult.content
							: sresult.desc)}]`;
					wistr = snippet + wistr;
				}
			}
		}

		// TextDB Long term memory minisearch
		if (documentdb_provider > 0) {
			// Finds the relevant memory fragments, formats them in a similar way to an authors note and inserts them before WI
			const ltmSearchQuery = !!rawNewText ? rawNewText : gametext_arr.length > 0 ? gametext_arr.slice(-1)[0] : undefined;
			if (ltmSearchQuery) {
				let gameText = concat_gametext(true).replace(/\xA0/g, " ").trim();
				let maxAllowedCharacters = getMaxAllowedCharacters(gameText, maxctxlen, maxgenamt);
				if (documentdb_data != "" || gameText.length > maxAllowedCharacters) {
					const recentTextLimit = documentdb_searchrange;
					let skippedActiveContext = gameText;
					let historicalContext = "";
					if (gameText.length > maxAllowedCharacters) {
						skippedActiveContext = gameText.substring(gameText.length - maxAllowedCharacters);
						historicalContext = gameText.substring(0, gameText.length - maxAllowedCharacters); //context that is no longer active
					}
					let recentTextStr = skippedActiveContext;
					if (skippedActiveContext.length > recentTextLimit) {
						recentTextStr = skippedActiveContext.substring(skippedActiveContext.length - recentTextLimit);
					}
					let fullDocument = documentdb_data;
					if (documentdb_searchhistory && historicalContext) {
						fullDocument += "\n" + historicalContext;
					}

					let ltmSnippets = yield DatabaseMinisearch(fullDocument, ltmSearchQuery, recentTextStr);
					if (ltmSnippets.length === 0) {
						console.log("No memory fragments found either as history is too short or no relevant content found");
					} else {
						console.log("Memory fragments", ltmSnippets);
						let ltmContent = "";
						for (let i = 0; i < ltmSnippets.length; ++i) {
							ltmContent += getInfoSnippet(ltmSnippets[i]);
						}
						wistr = ltmContent + wistr;
					}
				}
			}
		}

		//limit wi size
		if (wistr != "") {
			wistr = substring_to_boundary(wistr, max_wi_len);
		}

		//we clip the authors note if its too long
		let truncated_anote = current_anotetemplate.replace("<|>", current_anote);
		truncated_anote = substring_to_boundary(truncated_anote, max_anote_len);

		if (current_anote.length == 0) {
			//if there's no authors note at all, don't include the template
			truncated_anote = "";
		}

		if (wi_insertlocation > 0) {
			truncated_anote = wistr + truncated_anote;
			truncated_anote = substring_to_boundary(truncated_anote, max_anote_len);
		} else {
			truncated_memory += wistr;
		}

		truncated_memory = appendedsysprompt + substring_to_boundary(truncated_memory, max_mem_len);

		//now we resize the context such that the memory and authors note can fit inside
		truncated_context = substring_to_boundary(truncated_context, max_allowed_characters);

		//append memory to the start of the context, clipping excess space if needed
		//only do this processing if memory or anote is not blank
		if (truncated_memory.length > 0 || current_anote.length > 0) {
			truncated_memory = replace_placeholders(truncated_memory, false, false, true);
			truncated_anote = replace_placeholders(truncated_anote, false, false, false);
			if (!is_using_kcpp_with_added_memory()) {
				let augmented_len = truncated_memory.length + truncated_context.length + truncated_anote.length;
				let excess_len = augmented_len - max_allowed_characters; //if > 0, then we exceeded context window
				excess_len = excess_len < 0 ? 0 : excess_len;
				let newlimit = (max_allowed_characters - excess_len) < 32 ? 32 : (max_allowed_characters - excess_len);
				truncated_context = substring_to_boundary(truncated_context, newlimit); //must always have at least 32 chars from main context
			}

			//insert authors note 80 tokens before the ending (320 characters).
			let anote_dist = anote_strength;
			let anote_insert_idx = truncated_context.length - anote_dist;
			anote_insert_idx = clamp(anote_insert_idx, 0, truncated_context.length);
			//try to align anote with a word boundary
			const maxLookahead = 30;
			let best_insert_idx = anote_insert_idx;
			let insert_preference = 0;
			for (let i = 0; i < maxLookahead && anote_insert_idx + i < truncated_context.length; ++i) {
				const char = truncated_context[anote_insert_idx + i];
				if (char == "\n") {
					best_insert_idx = anote_insert_idx + i + 1;
					insert_preference = 3;
					break;
				}
				if (insert_preference <= 1 && (char == "," || char == "!" || char == "." || char == "?")) {
					best_insert_idx = anote_insert_idx + i + 1;
					insert_preference = 2;
				}
				if (insert_preference == 0 && (char == " ")) {
					best_insert_idx = anote_insert_idx + i + 1;
					insert_preference = 1;
				}
			}
			if (insert_preference > 0) {
				anote_insert_idx = best_insert_idx;
			}
			anote_insert_idx = clamp(anote_insert_idx, 0, truncated_context.length);
			truncated_context = truncated_context.slice(0, anote_insert_idx) + truncated_anote + truncated_context.slice(anote_insert_idx);
			if (!is_using_kcpp_with_added_memory()) {
				truncated_context = truncated_memory + truncated_context;
			}
		}

		truncated_context = replace_placeholders(truncated_context, false, false, true);

		if (is_using_kcpp_with_added_memory()) {
			last_token_budget = (truncated_memory.length + truncated_context.length) + "/" + max_allowed_characters;
		} else {
			last_token_budget = truncated_context.length + "/" + max_allowed_characters;
		}

		let submit_payload = {
			prompt: truncated_context,
			params: {
				n: 1,
				max_context_length: maxctxlen,
				max_length: maxgenamt,
				rep_pen: localsettings.rep_pen,
				temperature: localsettings.temperature,
				top_p: localsettings.top_p,
				top_k: localsettings.top_k,
				top_a: localsettings.top_a,
				typical: localsettings.typ_s,
				tfs: localsettings.tfs_s,
				rep_pen_range: localsettings.rep_pen_range,
				rep_pen_slope: localsettings.rep_pen_slope,
				sampler_order: localsettings.sampler_order,
			},
			models: selected_models.map((m) => {
				return m.name;
			}),
		};

		if (is_using_kcpp_with_added_memory()) {
			submit_payload.params.memory = truncated_memory;
			submit_payload.params.trim_stop = true;
		}
		if (is_using_kcpp_with_llava() && insertAIVisionImages.length > 0) {
			submit_payload.params.images = insertAIVisionImages;
		}

		if (localsettings.sampler_seed >= 1) {
			submit_payload.params.sampler_seed = localsettings.sampler_seed;
		}

		if ((custom_kobold_endpoint != "" && is_using_kcpp_with_grammar())) {
			if (localsettings.grammar && localsettings.grammar != "") {
				submit_payload.params.grammar = localsettings.grammar;
				submit_payload.params.grammar_retain_state = document.getElementById("grammar_retain_state").checked;
			}
		}

		if ((custom_kobold_endpoint != "" && is_using_kcpp_with_streaming())) {
			lastcheckgenkey = "KCPP" + (Math.floor(1000 + Math.random() * 9000)).toString();
			kai_poll_recoverykey = "";
			submit_payload.params.genkey = lastcheckgenkey;
		} else {
			lastcheckgenkey = "";
			kai_poll_recoverykey = "";
		}

		//v2 api specific fields
		submit_payload.workers = selected_workers.map((m) => {
			return m.id;
		});

		if (!doNotGenerate) {
			dispatch_submit_generation(submit_payload, user_input_empty);
		} else {
			pending_response_id = "";
		}

		if (img_gen_trigger_prompt != "") {
			let txt = "I'll try and create that image.";
			gametext_arr.push(txt);
			var sentence = img_gen_trigger_prompt.trim().substring(0, 380);
			do_manual_gen_image(sentence);
		}

		render_gametext();
		sync_multiplayer(false);
	}
	is_impersonate_user = false;
});

function get_stop_sequences() //the input object may not always be the same!
{
	let seqs = [];
	if (localsettings.opmode == 2) { //stop on new action found
		seqs = ["\n\> "];
		if (!localsettings.multiline_replies) {
			seqs.push("\n");
		}
	}
	if (localsettings.opmode == 3) { //stop on selfname found
		seqs = [get_my_multiplayer_chatname() + "\:", "\n" + get_my_multiplayer_chatname() + " "];
		if (get_my_multiplayer_chatname() != localsettings.chatname) {
			seqs.push(localsettings.chatname + "\:");
			seqs.push("\n" + localsettings.chatname + " ");
		}

		//for multichat, everyone else becomes a stopper token
		if (localsettings.chatopponent != "" && localsettings.chatopponent.includes("||$||")) {
			let coarr = localsettings.chatopponent.split("||$||");
			coarr = coarr.filter(x => (x && x != ""));
			coarr = coarr.map(x => x.trim());
			for (let n = 0; n < coarr.length; ++n) {
				seqs.push(coarr[n] + "\:");
			}
		} else {
			if (localsettings.chatopponent != "") {
				seqs.push("\n" + localsettings.chatopponent + "\: ");
			}
		}
	}
	if (localsettings.opmode == 4) { //stop on selfname found
		let st = get_instruct_starttag(true);
		let et = get_instruct_endtag(true);
		let me = get_my_multiplayer_chatname();
		seqs = [st, et];
		if (localsettings.separate_end_tags) {
			if (get_instruct_endtag_end(true)) {
				seqs.push(get_instruct_endtag_end(true));
			}
			if (get_instruct_starttag_end(true) && get_instruct_starttag_end(true) != get_instruct_endtag_end(true)) {
				seqs.push(get_instruct_starttag_end(true));
			}
		}
		if (localsettings.inject_chatnames_instruct) {
			if (me != "") {
				seqs.push(me + "\:");
			}
			if (localsettings.chatopponent != "") {
				let m_opps = localsettings.chatopponent.split("||$||");
				for (let i = 0; i < m_opps.length; ++i) {
					if (m_opps[i] && m_opps[i].trim() != "") {
						seqs.push(m_opps[i] + "\:");
					}
				}
			}
		}
	}
	if (localsettings.extrastopseq != "") {
		let rep = replaceAll(localsettings.extrastopseq, "\\n", "\n");
		let srep = rep.split("||$||");
		if (srep.length > 0 && !seqs) {
			seqs = [];
		}
		for (let i = 0; i < srep.length; ++i) {
			if (srep[i] && srep[i] != "") {
				seqs.push(srep[i]);
			}
		}
	}

	return seqs;
}

function get_token_bans() {
	let seqs = [];
	if (localsettings.tokenbans != "") {
		let rep = replaceAll(localsettings.tokenbans, "\\n", "\n");
		let srep = rep.split("||$||");
		if (srep.length > 0 && !seqs) {
			seqs = [];
		}
		for (let i = 0; i < srep.length; ++i) {
			if (srep[i] && srep[i] != "") {
				seqs.push(srep[i]);
			}
		}
	}
	return seqs;
}

function cleanup_story_completion(resp) {
	if (gametext_arr.length > 0) {
		//fix duplicate sentences
		const sentenceEndings = /[.!?]/g;
		let lastsentences = gametext_arr[gametext_arr.length - 1].split(sentenceEndings);
		lastsentences = lastsentences.map(lastsentences => lastsentences.trim()); //remove whitespace
		lastsentences = lastsentences.filter(lastsentences => lastsentences.length > 0);
		if (lastsentences.length > 0) {
			let lastsentence = lastsentences[lastsentences.length - 1];
			if (lastsentence.length > 10 && resp.trim().startsWith(lastsentence)) { //only match if its long enough and matches verbatim
				let foundindex = resp.indexOf(lastsentence);
				if (foundindex !== -1 && foundindex < 5) {
					resp = resp.substring(foundindex + lastsentence.length); //remove duplicated part
				}
			}
		}

		//fix response lacking space
		if (!gametext_arr[gametext_arr.length - 1].endsWith(" ") && !gametext_arr[gametext_arr.length - 1].endsWith("\n")) {
			if (/^\.\.\.[a-zA-Z0-9]/.test(resp)) {
				resp = resp.slice(3);
			}
			if (/^[^!\"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~ \t\r\n\f\v]/.test(resp)) { // List of common punctuation and whitespace
				resp = " " + resp;
			}
		}
	}
	return resp;
}

function dispatch_submit_generation(submit_payload, input_was_empty) //if input is not empty, always unban eos
{
	console.log(submit_payload);

	//preprocess to add extra fields
	if (custom_kobold_endpoint != "" && is_using_kcpp_with_mirostat()) {
		if (localsettings.miro_type > 0) {
			submit_payload.params.mirostat = localsettings.miro_type;
			submit_payload.params.mirostat_tau = localsettings.miro_tau;
			submit_payload.params.mirostat_eta = localsettings.miro_eta;
		}

		//also supports min_p, in that it wont crash, so add it on. it will be ignored if not found
		submit_payload.params.min_p = localsettings.min_p;
		submit_payload.params.dynatemp_range = localsettings.dynatemp_range;
		submit_payload.params.dynatemp_exponent = localsettings.dynatemp_exponent;
		submit_payload.params.smoothing_factor = localsettings.smoothing_factor;
		submit_payload.params.nsigma = localsettings.nsigma;
		submit_payload.params.banned_tokens = get_token_bans();
		submit_payload.params.render_special = localsettings.render_special_tags;
		submit_payload.params.logprobs = localsettings.request_logprobs;
		let st = get_instruct_starttag(true);
		let et = get_instruct_endtag(true);
		if (st == "{{[INPUT]}}" || et == "{{[OUTPUT]}}") {
			submit_payload.params.replace_instruct_placeholders = true;
		}
	}
	if (custom_kobold_endpoint != "" && is_using_kcpp_with_dry() && localsettings.dry_multiplier > 0) {
		submit_payload.params.dry_multiplier = localsettings.dry_multiplier;
		submit_payload.params.dry_base = localsettings.dry_base;
		submit_payload.params.dry_allowed_length = localsettings.dry_allowed_length;
		submit_payload.params.dry_penalty_last_n = localsettings.rep_pen_range;
		submit_payload.params.dry_sequence_breakers = JSON.parse(JSON.stringify(localsettings.dry_sequence_breakers));
	}

	if (custom_kobold_endpoint != "" && is_using_kcpp_with_xtc() && localsettings.xtc_probability > 0) {
		submit_payload.params.xtc_threshold = localsettings.xtc_threshold;
		submit_payload.params.xtc_probability = localsettings.xtc_probability;
	}

	//presence pen and logit bias for OAI and newer kcpp
	if ((custom_kobold_endpoint != "" && is_using_kcpp_with_mirostat()) || custom_oai_endpoint != "") {
		submit_payload.params.presence_penalty = localsettings.presence_penalty;
		submit_payload.params.logit_bias = JSON.parse(JSON.stringify(localsettings.logitbiasdict));
	}

	if (custom_kobold_endpoint != "" && is_using_kcpp_with_guidance() && localsettings.guidance_scale != 1 && localsettings.guidance_prompt != "") {
		submit_payload.params.guidance_scale = localsettings.guidance_scale;
		submit_payload.params.negative_prompt = localsettings.guidance_prompt;
	}

	start_time_taken(); //timestamp start request

	if (is_using_custom_ep()) {
		console.log("submit custom api");

		pending_response_id = "submit-v1-dummy-id-" + (Math.floor(1000 + Math.random() * 9000)).toString(); //dummy id, autogenerated
		poll_ticks_passed = 0;
		poll_in_progress = false;
		synchro_polled_response = null;
		last_stop_reason = "";
		synchro_pending_stream = "";
		gemini_was_thinking = false;

		//if this is set, we don't use horde, use the custom endpoint instead
		if (custom_kobold_endpoint != "") { //handle for kai
			//payload is just the params with prompt inside
			let prompt = submit_payload.prompt;
			submit_payload = submit_payload.params;
			submit_payload.prompt = prompt;
			let showlog = false;
			submit_payload.quiet = !showlog;

			//for vesion 1.2.2 and later, send stopper tokens for chat and instruct
			if (kobold_endpoint_version && kobold_endpoint_version != "" && compare_version_str(kobold_endpoint_version, "1.2.2") >= 0) {
				submit_payload.stop_sequence = get_stop_sequences();
			}

			//version 1.2.4 and later supports unban tokens
			if (kobold_endpoint_version && kobold_endpoint_version != "" && compare_version_str(kobold_endpoint_version, "1.2.4") >= 0) {
				submit_payload.use_default_badwordsids = determine_if_ban_eos(input_was_empty);
				if (is_using_kcpp_with_added_memory()) {
					submit_payload.bypass_eos = localsettings.eos_ban_mode == 3 ? true : false;
				}
			}

			last_request_str = JSON.stringify(submit_payload);
			last_response_obj = null;
			if (localsettings.tokenstreammode == 2 && is_using_kcpp_with_sse()) {
				let sub_endpt = apply_proxy_url(custom_kobold_endpoint + kobold_custom_gen_stream_endpoint);
				kobold_api_stream_sse(sub_endpt, submit_payload);
			} else {
				let sub_endpt = apply_proxy_url(custom_kobold_endpoint + kobold_custom_gen_endpoint);
				let trackedgenid = pending_response_id; //if it changes, stop streaming
				kobold_api_sync_req(sub_endpt, submit_payload, trackedgenid);
			}
			update_custom_kobold_endpoint_model_display();
		} else if (custom_oai_key != "") { //handle for OAI
			let targetep = custom_oai_endpoint + oai_submit_endpoint;

			let scaled_rep_pen = 0;
			if (submit_payload.params.presence_penalty > 0) {
				scaled_rep_pen = submit_payload.params.presence_penalty;
			} else {
				//original range between 1 and 3, scale to 0 and 2
				scaled_rep_pen = submit_payload.params.rep_pen - 1.0;
			}
			//logit bias prevents <|endoftext|>
			let oai_payload = {
				max_tokens: submit_payload.params.max_length,
				model: custom_oai_model,
				temperature: submit_payload.params.temperature,
				top_p: submit_payload.params.top_p,
				stop: get_stop_sequences().slice(0, 4), //lets try adding stop sequences, limit to first 4
			};
			if (
				localsettings.request_logprobs && !targetep.toLowerCase().includes("api.x.ai") && !targetep.toLowerCase().includes("api.mistral.ai")
			) {
				if (document.getElementById("useoaichatcompl").checked || targetep.toLowerCase().includes("api.x.ai")) {
					oai_payload.logprobs = true;
					oai_payload.top_logprobs = 5;
				} else {
					oai_payload.logprobs = 5;
				}
			}
			if (!targetep.toLowerCase().includes("api.mistral.ai")) {
				//mistral api does not support presence pen
				oai_payload.presence_penalty = scaled_rep_pen;
			}
			if (document.getElementById("useoainonstandard").checked || targetep.toLowerCase().includes("featherless.ai")) {
				//featherless api supports additional fields, include them
				oai_payload.top_k = submit_payload.params.top_k < 1 ? 300 : submit_payload.params.top_k;
				oai_payload.min_p = localsettings.min_p;
				if (submit_payload.params.sampler_seed >= 1) {
					oai_payload.seed = submit_payload.params.sampler_seed;
				}
				oai_payload.top_a = localsettings.top_a;
			}
			if (submit_payload.params.logit_bias && JSON.stringify(submit_payload.params.logit_bias) != "{}") {
				oai_payload.logit_bias = submit_payload.params.logit_bias;
			}

			let is_using_o1 = custom_oai_model.toLowerCase().startsWith("o1-") || custom_oai_model.toLowerCase() == "o1"
				|| custom_oai_model.toLowerCase().startsWith("o3-") || custom_oai_model.toLowerCase() == "o3"
				|| custom_oai_model.toLowerCase().startsWith("o4-") || custom_oai_model.toLowerCase() == "o4";
			let is_using_4o_search = custom_oai_model.toLowerCase().includes("-search-preview");
			if (is_using_o1 || is_using_4o_search) {
				//o1 does not support ANY customization
				oai_payload = {
					//remove max tokens due to huge amount needed
					//"max_completion_tokens": submit_payload.params.max_length,
					model: custom_oai_model,
				};
			}

			if (document.getElementById("useoaichatcompl").checked) {
				let mainoaibody = submit_payload.prompt; //can be string or array
				if (insertAIVisionImages.length > 0) {
					mainoaibody = [
						{
							type: "text",
							text: mainoaibody,
						},
					];
					for (let i = 0; i < insertAIVisionImages.length; ++i) {
						let oaiimg = {
							type: "image_url",
							image_url: {
								url: ("data:image/jpeg;base64," + insertAIVisionImages[i]),
							},
						};
						mainoaibody.push(oaiimg);
					}
				}

				oai_payload.messages = [];
				targetep = custom_oai_endpoint + oai_submit_endpoint_chat;
				if (
					document.getElementById("jailbreakprompt") && document.getElementById("jailbreakprompt").checked
					&& document.getElementById("jailbreakprompttext").value != ""
				) {
					let addrole = document.getElementById("jailbreakprompttextrole").value;
					addrole = (addrole == 2) ? "system" : (addrole == 1 ? "assistant" : "user");
					oai_payload.messages.push({ role: addrole, content: document.getElementById("jailbreakprompttext").value });
				}

				if (localsettings.saved_oai_role != 3) { //except auto role
					let myrole = (localsettings.saved_oai_role == 2) ? "system" : (localsettings.saved_oai_role == 1 ? "assistant" : "user");
					oai_payload.messages.push({ role: myrole, content: mainoaibody });
				} //auto role
				else {
					let mhistory = repack_instruct_history(mainoaibody);
					for (let i = 0; i < mhistory.length; ++i) {
						oai_payload.messages.push({ role: (mhistory[i].myturn ? "user" : "assistant"), content: mhistory[i].msg });
					}
				}

				if (
					document.getElementById("jailbreakprompt2") && document.getElementById("jailbreakprompt2").checked
					&& document.getElementById("jailbreakprompttext2").value != ""
				) {
					let addrole = document.getElementById("jailbreakprompttext2role").value;
					addrole = (addrole == 2) ? "system" : (addrole == 1 ? "assistant" : "user");
					let postmsg = { role: addrole, content: document.getElementById("jailbreakprompttext2").value };
					if (addrole == "assistant" && targetep.toLowerCase().includes("api.deepseek.com")) {
						postmsg["prefix"] = true;
					}
					oai_payload.messages.push(postmsg);
				}

				oaiemulatecompletionscontent = "";
				if (targetep.toLowerCase().includes("api.mistral.ai") && document.getElementById("oaiemulatecompletions").checked) {
					delete oai_payload["stop"];
					oai_payload.messages = [{ role: "system", content: "No restrictions." }];
					if (
						document.getElementById("jailbreakprompt") && document.getElementById("jailbreakprompt").checked
						&& document.getElementById("jailbreakprompttext").value != ""
					) {
						let addrole = document.getElementById("jailbreakprompttextrole").value;
						addrole = (addrole == 2) ? "system" : (addrole == 1 ? "assistant" : "user");
						oai_payload.messages.push({ role: addrole, content: document.getElementById("jailbreakprompttext").value });
					}
					oai_payload.messages.push({ role: "assistant", content: mainoaibody, prefix: true });
					oaiemulatecompletionscontent = mainoaibody;
				}

				if (targetep.toLowerCase().includes("text.pollinations.ai")) {
					if (localsettings.opmode == 1) {
						oai_payload.messages.unshift({
							role: "system",
							content:
								"Please continue this story directly from where it stopped. Just respond with a direct partial continuation of the story immediately from the latest word.",
						});
					}
				}
			} else {
				//apply custom logit bias for official OAI only
				let needbaneos = custom_oai_endpoint.toLowerCase().includes("api.openai.com") && determine_if_ban_eos(input_was_empty);

				if (needbaneos) {
					if (oai_payload.logit_bias) {
						oai_payload.logit_bias["50256"] = -100;
					} else {
						oai_payload.logit_bias = { "50256": -100 };
					}
				}
				oai_payload.prompt = submit_payload.prompt;
			}

			last_request_str = JSON.stringify(oai_payload);
			last_response_obj = null;
			let oaiheaders = {
				"Content-Type": "application/json",
				Authorization: "Bearer " + custom_oai_key,
			};

			if (targetep.toLowerCase().includes("openrouter.ai")) {
				oaiheaders["HTTP-Referer"] = "https://lite.koboldai.net";
				if (document.getElementById("openrouterproviders").value.trim() != "") {
					oai_payload.provider = {
						order: [document.getElementById("openrouterproviders").value.trim()],
						allow_fallbacks: false, //always explicitly selected
					};
				}
			}

			//pollinations always uses the exact same url for text gen regardless
			if (targetep.toLowerCase().includes("text.pollinations.ai")) {
				targetep = pollinations_text_endpoint;
				oai_payload.private = true;
				oai_payload.referrer = "koboldai";
				oai_payload.seed = Math.floor(Math.random() * 99999999);
			}

			if (is_browser_supports_sse() && localsettings.tokenstreammode != 0) {
				oai_payload.stream = true;
				oai_api_stream_sse(targetep, oai_payload, oaiheaders);
			} else {
				oai_api_sync_req(targetep, oai_payload, oaiheaders);
			}
		} else if (custom_claude_key != "") { //handle for Claude
			let claudev3mode = custom_claude_model.toLowerCase().includes("claude-3")
				|| custom_claude_model.toLowerCase().includes("claude-sonnet-4")
				|| custom_claude_model.toLowerCase().includes("claude-opus-4");
			let actualep = custom_claude_endpoint + (claudev3mode ? claude_submit_endpoint_v3 : claude_submit_endpoint);
			let targetep = actualep;
			if (custom_claude_endpoint.toLowerCase().includes("api.anthropic.com")) {
				//official API has broken cors settings
				targetep = apply_proxy_url(actualep, true);
			}
			let claude_payload = null;
			if (claudev3mode) {
				let sysprompt = document.getElementById("claudesystemprompt").value;
				let assistantprompt = document.getElementById("claudejailbreakprompt").value;
				let claudethinking = document.getElementById("claudethinking").checked ? true : false;

				claude_payload = {
					model: custom_claude_model,
					messages: [],
					max_tokens: submit_payload.params.max_length,
					temperature: submit_payload.params.temperature,
				};
				claude_payload.messages.push({ role: "user", content: submit_payload.prompt });
				if (sysprompt) {
					claude_payload.system = sysprompt;
				}

				if (
					claudethinking
					&& (custom_claude_model.toLowerCase().includes("claude-3-7") || custom_claude_model.toLowerCase().includes("claude-sonnet-4")
						|| custom_claude_model.toLowerCase().includes("claude-opus-4"))
				) {
					claude_payload.thinking = {
						type: "enabled",
						budget_tokens: 1024,
					};
					claude_payload.max_tokens += 1024;
					claude_payload.temperature = 1;
				} else {
					//unsupported with thinking
					claude_payload.top_k = submit_payload.params.top_k < 1 ? 300 : submit_payload.params.top_k;
					claude_payload.top_p = submit_payload.params.top_p;
				}

				if (localsettings.opmode == 1) {
					claude_payload.system = "Always respond with a direct partial continuation of the story immediately from the latest word.";
					if (sysprompt) {
						claude_payload.system = sysprompt + "\n" + claude_payload.system;
					}
				}
				if (assistantprompt) {
					claude_payload.messages.push({ role: "assistant", content: assistantprompt });
				}
			} else {
				claude_payload = {
					prompt: submit_payload.prompt,
					max_tokens_to_sample: submit_payload.params.max_length,
					model: custom_claude_model,
					top_k: (submit_payload.params.top_k < 1 ? 300 : submit_payload.params.top_k),
					temperature: submit_payload.params.temperature,
					top_p: submit_payload.params.top_p,
				};

				if (document.getElementById("clauderenamecompat").checked) {
					let assistant_correct_case = "Assistant:";
					if (!claude_payload.prompt.toLowerCase().trim().startsWith("human:")) {
						claude_payload.prompt = "Human: " + claude_payload.prompt;
					}
					if (!claude_payload.prompt.toLowerCase().trim().endsWith(assistant_correct_case.toLowerCase())) {
						if (localsettings.opmode == 1) {
							claude_payload.prompt = claude_payload.prompt + " \n" + assistant_correct_case
								+ " Here is a continuation of the story: \n" + assistant_correct_case;
						} else {
							claude_payload.prompt = claude_payload.prompt + " " + assistant_correct_case;
						}
					}
					//trim end
					claude_payload.prompt = claude_payload.prompt.replace(/[\t\r\n ]+$/, "");
					//replace final assistant with fixed case
					claude_payload.prompt = claude_payload.prompt.slice(0, -(assistant_correct_case.length)) + assistant_correct_case;
				}
			}

			last_request_str = JSON.stringify(claude_payload);
			last_response_obj = null;

			let claudeheaders = {
				"Content-Type": "application/json",
				"x-api-key": custom_claude_key,
				Authorization: "Bearer " + custom_claude_key,
			};
			if (claudev3mode) {
				claudeheaders["anthropic-version"] = "2023-06-01";
			} else {
				claudeheaders["anthropic-version"] = "2023-01-01";
			}

			fetch(targetep, {
				method: "POST",
				headers: claudeheaders,
				body: JSON.stringify(claude_payload),
				referrerPolicy: "no-referrer",
			})
				.then((response) => response.json())
				.then((data) => {
					console.log("sync finished response: " + JSON.stringify(data));
					last_response_obj = JSON.parse(JSON.stringify(data));
					if (custom_claude_key != "" && data.content && data.content.length > 0) {
						let comp = "";
						for (let i = 0; i < data.content.length; ++i) {
							if (data.content[i].text) {
								comp += data.content[i].text; //for claudev3
							}
							if (data.content[i].thinking) {
								comp += `<think>${data.content[i].thinking}</think>`; //for claudev3
							}
						}
						if (comp != "") {
							data.completion = comp;
						}
						if (localsettings.opmode == 1 && gametext_arr.length > 0 && data.completion != "") {
							data.completion = cleanup_story_completion(data.completion);
						}
					}
					if (custom_claude_key != "" && data.completion != null && data.completion != "") {
						synchro_polled_response = data.completion;
					} else {
						//error occurred, maybe captcha failed
						console.error("error occurred in Claude generation");
						clear_poll_flags();
						render_gametext();
						msgbox("Error occurred during text generation: " + format_json_error(data));
					}
				})
				.catch((error) => {
					console.error("Error:", error);
					clear_poll_flags();
					render_gametext();
					msgbox("Error while submitting prompt: " + error);
				});
		} else if (custom_gemini_key != "") { //handle for Gemini
			let mdlname = document.getElementById("custom_gemini_model").value;
			let geminitopk = submit_payload.params.top_k < 1 ? 100 : submit_payload.params.top_k;
			geminitopk = geminitopk > 100 ? 100 : geminitopk;
			if (mdlname.includes("flash-8b")) {
				geminitopk = geminitopk > 40 ? 40 : geminitopk; //gemini 8b limits topk to 40
			}

			if (localsettings.opmode == 1) {
				submit_payload.prompt = submit_payload.prompt
					+ " \nASSISTANT: Here is a direct partial continuation of the story without repeating it: \nASSISTANT:";
				submit_payload.params.max_length += 100; //add length
			}

			let geminiparts = [];

			if (insertAIVisionImages.length > 0) {
				for (let i = 0; i < insertAIVisionImages.length; ++i) {
					let oaiimg = {
						inline_data: {
							mime_type: "image/jpeg",
							data: insertAIVisionImages[i],
						},
					};
					geminiparts.push(oaiimg);
				}
			}

			geminiparts.push({ text: submit_payload.prompt });

			let payload = {
				contents: [
					{
						parts: geminiparts,
					},
				],
				safetySettings: [
					{
						category: "HARM_CATEGORY_HARASSMENT",
						threshold: "BLOCK_NONE",
					},
					{
						category: "HARM_CATEGORY_HATE_SPEECH",
						threshold: "BLOCK_NONE",
					},
					{
						category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
						threshold: "BLOCK_NONE",
					},
					{
						category: "HARM_CATEGORY_DANGEROUS_CONTENT",
						threshold: "BLOCK_NONE",
					},
					{
						category: "HARM_CATEGORY_CIVIC_INTEGRITY",
						threshold: "BLOCK_NONE",
					},
				],
				generationConfig: {
					temperature: submit_payload.params.temperature,
					maxOutputTokens: submit_payload.params.max_length,
					topP: submit_payload.params.top_p,
					topK: geminitopk,
					candidateCount: 1,
					stopSequences: get_stop_sequences().slice(0, 4),
				},
			};

			if (document.getElementById("usegeminiweb").checked) {
				payload["tools"] = [{ google_search: {} }];
			}

			if (mdlname.includes("gemini-2.5")) {
				if (!document.getElementById("usegeminithink").checked) {
					//gemini pro cannot fully disable thinking
					payload["generationConfig"]["thinkingConfig"] = {
						includeThoughts: false,
						thinkingBudget: (mdlname.includes("gemini-2.5-pro") ? 128 : 0),
					};
				} else {
					payload["generationConfig"]["thinkingConfig"] = { includeThoughts: true };
				}
			}

			let sentrole = document.getElementById("geminiroledropdown").value;
			if (sentrole != "") {
				payload.contents = [{
					role: sentrole,
					parts: geminiparts,
				}];
			}
			let postfixrole = document.getElementById("gemini_postfix_role").value;
			let postfixtext = document.getElementById("gemini_postfix_text").value;
			if (postfixtext != "" && sentrole != "") {
				payload.contents.push({
					role: postfixrole,
					parts: [
						{
							text: postfixtext,
						},
					],
				});
			}

			let sysinst = document.getElementById("gemini_system_instruction").value;
			if (sysinst != "" && (mdlname.includes("gemini-1.5-") || mdlname.includes("gemini-2") || mdlname.includes("gemini-exp-"))) {
				payload["systemInstruction"] = {
					role: "system",
					parts: [
						{
							text: sysinst,
						},
					],
				};
			}

			last_request_str = JSON.stringify(payload);
			last_response_obj = null;

			let geminiheaders = { "Content-Type": "application/json" };
			if (is_browser_supports_sse() && localsettings.tokenstreammode != 0) {
				let targetep = default_gemini_base + mdlname + default_gemini_stream_suffix + custom_gemini_key;
				oai_api_stream_sse(targetep, payload, geminiheaders);
			} else {
				let targetep = default_gemini_base + mdlname + default_gemini_suffix + custom_gemini_key;
				gemini_api_sync_req(targetep, payload, geminiheaders);
			}
		} else if (custom_cohere_key != "") { //handle for Cohere
			let targetep = default_cohere_base;

			let scaled_rep_pen = 0;
			if (submit_payload.params.presence_penalty > 0) {
				scaled_rep_pen = submit_payload.params.presence_penalty;
			} else {
				//original range between 1 and 3, scale to 0 and 2
				scaled_rep_pen = submit_payload.params.rep_pen - 1.0;
			}

			let cohere_payload = {
				max_tokens: submit_payload.params.max_length,
				model: custom_cohere_model,
				presence_penalty: scaled_rep_pen,
				temperature: submit_payload.params.temperature,
				p: submit_payload.params.top_p,
				message: submit_payload.prompt,
			};

			if (document.getElementById("useocoherepreamble").checked) {
				cohere_payload.preamble = document.getElementById("cohere_preamble").value;
			}

			if (document.getElementById("usecohereweb").checked) {
				cohere_payload.connectors = [{ id: "web-search" }];
				cohere_payload.max_tokens += 256;
			}

			last_request_str = JSON.stringify(cohere_payload);
			last_response_obj = null;
			let cohere_headers = {
				"Content-Type": "application/json",
				Authorization: "Bearer " + custom_cohere_key,
			};

			fetch(targetep, {
				method: "POST",
				headers: cohere_headers,
				body: JSON.stringify(cohere_payload),
				referrerPolicy: "no-referrer",
			})
				.then((response) => response.json())
				.then((data) => {
					console.log("sync finished response: " + JSON.stringify(data));
					last_response_obj = JSON.parse(JSON.stringify(data));
					if (custom_cohere_key != "" && data && data.text) {
						if (data.text) {
							synchro_polled_response = data.text;
						} else {
							console.error("Error, unknown Cohere response");
							clear_poll_flags();
							render_gametext();
							msgbox("Error, unknown Cohere response");
						}
					} else {
						//error occurred, maybe captcha failed
						console.error("error occurred in Cohere generation");
						clear_poll_flags();
						render_gametext();
						msgbox("Error occurred during text generation: " + format_json_error(data));
					}
				})
				.catch((error) => {
					console.error("Error:", error);
					clear_poll_flags();
					render_gametext();
					msgbox("Error while submitting prompt: " + error);
				});
		} else {
			console.log("Unknown sync endpoint!");
		}
	} else {
		console.log("submit v2 api");
		let apikeytouse = localsettings.my_api_key;
		let clientagenttouse = default_client_agent;
		let subpostheaders = {
			"Content-Type": "application/json",
			apikey: apikeytouse,
		};
		if (clientagenttouse != null) {
			subpostheaders["Client-Agent"] = clientagenttouse;
		}

		if (submit_payload.params) {
			//horde supports unban tokens
			submit_payload.params.use_default_badwordsids = determine_if_ban_eos(input_was_empty);

			//horde now supports stopping sequences
			submit_payload.params.stop_sequence = get_stop_sequences();

			//horde should support min_p in future too
			submit_payload.params.min_p = localsettings.min_p;
			submit_payload.params.dynatemp_range = localsettings.dynatemp_range;
			submit_payload.params.dynatemp_exponent = localsettings.dynatemp_exponent;
			submit_payload.params.smoothing_factor = localsettings.smoothing_factor;
			submit_payload.params.nsigma = localsettings.nsigma;
		}

		last_request_str = JSON.stringify(submit_payload);
		last_response_obj = null;

		fetch(horde_submit_endpoint, {
			method: "POST", // or 'PUT'
			headers: subpostheaders,
			body: JSON.stringify(submit_payload),
		})
			.then((response) => response.json())
			.then((data) => {
				console.log("Success:", data);
				if (data.id && data.id != "") {
					pending_response_id = data.id;
					poll_ticks_passed = 0;
					console.log("awaiting response for " + pending_response_id);
				} else {
					//something went wrong.
					clear_poll_flags();
					render_gametext();
					if (data.message != "") {
						msgbox(data.message);
					} else {
						msgbox("Unspecified error while submitting prompt");
					}
				}
			})
			.catch((error) => {
				console.error("Error:", error);
				clear_poll_flags();
				render_gametext();
				msgbox("Error while submitting prompt: " + error);
			});
	}
}

//to reduce the prompt being flagged for CP on horde and failing, we sanitize it while trying to have as little impact on normal usage.
//this does not affect the story context, only images sent
//we only match whole words, to avoid the scunthorpe problem
function sanitize_horde_image_prompt(inputtext) {
	if (inputtext == null || inputtext == "") return "";

	//to avoid flagging from some image models, always swap these words
	inputtext = inputtext.replace(/\b(girl)\b/gmi, "woman");
	inputtext = inputtext.replace(/\b(boy)\b/gmi, "man");
	inputtext = inputtext.replace(/\b(girls)\b/gmi, "women");
	inputtext = inputtext.replace(/\b(boys)\b/gmi, "men");

	//always remove these high risk words from prompt, as they add little value to image gen while increasing the risk the prompt gets flagged
	inputtext = inputtext.replace(
		/\b(under.age|under.aged|underage|underaged|loli|pedo|pedophile|(\w+).year.old|(\w+).years.old|minor|prepubescent|minors|shota)\b/gmi,
		"",
	);

	//if nsfw is detected, do not remove it but apply additional precautions
	let foundnsfw = inputtext.match(
		/\b(cock|ahegao|hentai|uncensored|lewd|cocks|deepthroat|deepthroating|dick|dicks|cumshot|lesbian|fuck|fucked|fucking|sperm|naked|nipples|tits|boobs|breasts|boob|breast|topless|ass|butt|fingering|masturbate|masturbating|bitch|blowjob|pussy|piss|asshole|dildo|dildos|vibrator|erection|foreskin|handjob|nude|penis|porn|vibrator|virgin|vagina|vulva|threesome|orgy|bdsm|hickey|condom|testicles|anal|bareback|bukkake|creampie|stripper|strap-on|missionary|clitoris|clit|clitty|cowgirl|fleshlight|sex|buttplug|milf|oral|sucking|bondage|orgasm|scissoring|railed|slut|sluts|slutty|cumming|cunt|faggot|sissy|anal|anus|cum|semen|scat|nsfw|xxx|explicit|erotic|horny|aroused|jizz|moan|rape|raped|raping|throbbing|humping)\b/gmi,
	);

	if (foundnsfw) {
		//replace risky subject nouns with person
		inputtext = inputtext.replace(
			/\b(youngster|infant|baby|toddler|child|teen|kid|kiddie|kiddo|teenager|student|preteen|pre.teen)\b/gmi,
			"person",
		);

		//remove risky adjectives and related words
		inputtext = inputtext.replace(
			/\b(young|younger|youthful|youth|small|smaller|smallest|girly|boyish|lil|tiny|teenaged|lit[tl]le|school.aged|school|highschool|kindergarten|teens|children|kids)\b/gmi,
			"",
		);
	}

	return inputtext;
}

function generate_new_image(sentence, base64img = "", autoappend = true) //base64img is for img2img, autoappend automatically adds it to gametext arr
{
	if (base64img != "") {
		let parts = base64img.split(",");
		if (parts.length === 2 && parts[0].startsWith("data:image")) {
			base64img = parts[1];
		}
	}

	if (localsettings.image_styles && localsettings.image_styles != "") {
		sentence = localsettings.image_styles + " " + sentence;
	}

	//remove ###
	sentence = sentence.replace(/###/gm, "");

	let usedsampler = localsettings.img_sampler;

	if (localsettings.generate_images_mode == 1) {
		sentence = sanitize_horde_image_prompt(sentence);
		switch (usedsampler) {
			case "Euler a":
				usedsampler = "k_euler_a";
				break;
			case "Euler":
				usedsampler = "k_euler";
				break;
			case "Heun":
				usedsampler = "k_heun";
				break;
			case "DPM2":
				usedsampler = "k_dpm_2";
				break;
			case "DPM++ 2M":
				usedsampler = "k_dpmpp_2m";
				break;
			case "DDIM":
				usedsampler = "DDIM";
				break;
			default:
				usedsampler = "k_euler";
				break;
		}
	}

	console.log("Generating image for: " + sentence);
	let modelused = [];
	if (localsettings.generate_images_model == "*") {
		modelused = [];
	} else {
		modelused = [localsettings.generate_images_model];
	}

	let negprompt = localsettings.image_negprompt
		? (" ### " + localsettings.image_negprompt)
		: " ### ugly, deformed, poorly, censor, blurry, lowres, malformed, watermark, duplicated, grainy, distorted, signature";
	if (localsettings.image_negprompt == "none") {
		negprompt = "";
	}

	let iwidth = 512;
	let iheight = 512;
	if (localsettings.img_aspect == 1) {
		iheight = 768;
	} else if (localsettings.img_aspect == 2) {
		iwidth = 768;
	} else if (localsettings.img_aspect == 3) {
		iwidth = 768;
		iheight = 768;
	} else if (localsettings.img_aspect == 4) {
		iheight = 1024;
	} else if (localsettings.img_aspect == 5) {
		iwidth = 1024;
	} else if (localsettings.img_aspect == 6) {
		iwidth = 1024;
		iheight = 1024;
	}

	let genimg_payload = {
		prompt: (sentence + negprompt),
		params: {
			cfg_scale: localsettings.img_cfgscale,
			sampler_name: usedsampler,
			height: iheight,
			width: iwidth,
			steps: localsettings.img_steps,
			karras: false,
			n: 1,
			seed: "",
			post_processing: [],
		},
		models: modelused,
		nsfw: (localsettings.img_allownsfw ? true : false),
		censor_nsfw: (localsettings.img_allownsfw ? false : true),
		trusted_workers: false,
		replacement_filter: true,
		r2: false,
	};
	if (base64img != null && base64img != "") {
		genimg_payload["source_image"] = base64img;
		genimg_payload["params"]["denoising_strength"] = localsettings.img_img2imgstr;
	}
	if (localsettings.img_clipskip > 0) {
		genimg_payload["params"]["clip_skip"] = localsettings.img_clipskip;
	}

	let imgid = ""; //this will be autorandomized and returned

	if (localsettings.generate_images_mode == 1) { //horde
		imgid = "Hordeimg" + (Math.floor(10000 + Math.random() * 90000)).toString();
		let nimgtag = "[<|p|" + imgid + "|p|>]";
		if (localsettings.img_newturn) {
			if (localsettings.opmode == 4) {
				nimgtag = wrap_newgen_instruct_format(nimgtag, false);
			} else if (localsettings.opmode == 3) {
				nimgtag = wrap_newgen_chat_format(nimgtag);
			}
		}
		if (autoappend) {
			gametext_arr.push(nimgtag);
		}
		image_db[imgid] = { done: false, queue: "Starting", result: "", prompt: sentence, poll_category: 1 };
		image_db[imgid].aspect = iwidth >= iheight * 2 ? 5 : (iheight >= iwidth * 2 ? 4 : (iwidth > iheight ? 2 : (iwidth < iheight ? 1 : 0)));
		image_db[imgid].imsource = 0; //0=generated,1=uploaded
		image_db[imgid].imrefid = ""; //this will store the real horde ID to poll
		fetch(stablehorde_submit_endpoint, {
			method: "POST", // or 'PUT'
			headers: {
				"Content-Type": "application/json",
				"Client-Agent": default_client_agent,
				apikey: localsettings.my_api_key,
			},
			body: JSON.stringify(genimg_payload),
		})
			.then((response) => response.json())
			.then((data) => {
				console.log("genimg result:", data);
				if (data.id && data.id != "") {
					//for now, append the new image directly into the gtarr
					image_db[imgid].imrefid = data.id;
					console.log("New image queued " + data.id + " for " + nimgtag);
				} else {
					//something went wrong.	do nothing.
					msgbox("Image generation failed: " + data.message);
				}
			})
			.catch((error) => {
				console.error("Error:", error);
				msgbox("Image generation error: " + error);
			});
	} else if (localsettings.generate_images_mode == 2) { //a1111
		let desired_model = document.getElementById("generate_images_local_model").value;
		genimg_payload.models = [desired_model];
		imgid = "A1111img" + (Math.floor(10000 + Math.random() * 90000)).toString();
		let nimgtag = "[<|p|" + imgid + "|p|>]";
		if (localsettings.img_newturn) {
			if (localsettings.opmode == 4) {
				nimgtag = wrap_newgen_instruct_format(nimgtag, false);
			} else if (localsettings.opmode == 3) {
				nimgtag = wrap_newgen_chat_format(nimgtag);
			}
		}
		if (autoappend) {
			gametext_arr.push(nimgtag);
		}
		image_db[imgid] = { done: false, queue: "Generating", result: "", prompt: sentence, poll_category: 0 };
		image_db[imgid].aspect = iwidth >= iheight * 2 ? 5 : (iheight >= iwidth * 2 ? 4 : (iwidth > iheight ? 2 : (iwidth < iheight ? 1 : 0)));
		image_db[imgid].imsource = 0; //0=generated,1=uploaded
		image_db[imgid].imrefid = "";
		generate_a1111_image(genimg_payload, (outputimg) => {
			if (outputimg) {
				//console.log(outputimg);
				let origImg = "data:image/jpeg;base64," + outputimg;
				let imgres = localsettings.img_allowhd ? (localsettings.img_aspect == 0 ? NO_HD_RES_PX : HD_RES_PX) : NO_HD_RES_PX;
				compressImage(
					origImg,
					(newDataUri) => {
						image_db[imgid].done = true;
						image_db[imgid].result = newDataUri;
					},
					false,
					imgres,
				);
			} else {
				image_db[imgid].queue = "Failed";
				msgbox(
					"Image Generation Failed!\n\nPlease make sure KoboldCpp / Forge / A1111 is running and properly configured!\nIn your local install of Automatic1111 WebUi, modify webui-user.bat and add these flags to enable API access:\n\nset COMMANDLINE_ARGS= --api --listen --cors-allow-origins=*\n",
				);
			}
		});
	} else if (localsettings.generate_images_mode == 3) { //dalle
		if (localsettings.saved_dalle_key == "" || localsettings.saved_dalle_url == "") {
			msgbox(
				"Error: A valid DALL-E URL and Key is required to generate images with DALL-E.\nThis is usually the same as your OpenAI API key, but can be customized in settings.",
				"Invalid DALL-E Key",
			);
		} else {
			imgid = "DALLEimg" + (Math.floor(10000 + Math.random() * 90000)).toString();
			let nimgtag = "[<|p|" + imgid + "|p|>]";
			if (localsettings.img_newturn) {
				if (localsettings.opmode == 4) {
					nimgtag = wrap_newgen_instruct_format(nimgtag, false);
				} else if (localsettings.opmode == 3) {
					nimgtag = wrap_newgen_chat_format(nimgtag);
				}
			}
			if (autoappend) {
				gametext_arr.push(nimgtag);
			}
			image_db[imgid] = { done: false, queue: "Generating", result: "", prompt: sentence, poll_category: 0 };
			image_db[imgid].aspect = 0;
			image_db[imgid].imsource = 0; //0=generated,1=uploaded
			image_db[imgid].imrefid = "";
			generate_dalle_image(genimg_payload, (outputimg, outputerr) => {
				if (outputimg) {
					//console.log(outputimg);
					let origImg = "data:image/jpeg;base64," + outputimg;
					let imgres = localsettings.img_allowhd ? HD_RES_PX : NO_HD_RES_PX;
					compressImage(
						origImg,
						(newDataUri) => {
							image_db[imgid].done = true;
							image_db[imgid].result = newDataUri;
						},
						true,
						imgres,
					);
				} else {
					image_db[imgid].queue = "Failed";
					msgbox(
						`Image Generation Failed!\n\n${
							outputerr ? (outputerr + "\n\n") : ""
						}Please make sure your OpenAI key is set correctly and you are allowed to use DALL-E.\n`,
					);
				}
			});
		}
	} else if (localsettings.generate_images_mode == 4) { //comfyui
		let desired_model = document.getElementById("generate_images_comfy_model").value;
		genimg_payload.models = [desired_model];
		imgid = generate_comfy_image(genimg_payload, autoappend);
	} else if (localsettings.generate_images_mode == 5) { //pollinations
		let desired_model = document.getElementById("generate_images_pollinations_model").value;
		genimg_payload.models = [desired_model];
		imgid = generate_pollinations_image(genimg_payload, autoappend);
	}

	return imgid;
}

function interrogate_new_image(base64img, imghash, use_horde = true) {
	let parts = base64img.split(",");
	if (parts.length === 2 && parts[0].startsWith("data:image")) {
		base64img = parts[1];
	}

	if (!use_horde) { //a1111
		let payload = {
			image: base64img,
			model: "clip",
		};
		let imgid = "A1111interrogate" + (Math.floor(10000 + Math.random() * 90000)).toString();
		fetch(localsettings.saved_a1111_url + a1111_interrogate_endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(x => x.json())
			.then(resp => {
				console.log(resp);
				if (resp && resp.caption) {
					let caption = resp.caption;
					let savedmeta = completed_imgs_meta[imghash];
					if (caption && savedmeta) {
						savedmeta.desc = caption;
						update_clicked_image(imghash);
					}
				}
			}).catch((error) => {
				console.log("Interrogate Error: " + error);
			});
	} else {
		//horde
		let payload = {
			forms: [
				{
					name: "caption",
				},
			],
			source_image: base64img,
		};
		fetch(stablehorde_submit_interrogate_endpoint, {
			method: "POST", // or 'PUT'
			headers: {
				"Content-Type": "application/json",
				"Client-Agent": default_client_agent,
				apikey: localsettings.my_api_key,
			},
			body: JSON.stringify(payload),
		})
			.then((response) => response.json())
			.then((data) => {
				console.log("interrogate img result:", data);
				if (data.id && data.id != "") {
					interrogation_db[data.id] = { done: false, result: "", imghash: imghash, poll_category: 1 };
					console.log("New interrogate queued: " + data.id);
				} else {
					//something went wrong.	do nothing.
					msgbox("Image interrogation failed: " + data.message);
				}
			})
			.catch((error) => {
				console.error("Error:", error);
				msgbox("Image interrogation error: " + error);
			});
	}
}

function toggle_ai_vision(imghash) {
	let savedmeta = completed_imgs_meta[imghash];
	if (savedmeta) {
		savedmeta.visionmode = document.getElementById("aivisionmode").value;
		if (!savedmeta.desc && (savedmeta.visionmode == 1 || savedmeta.visionmode == 2)) {
			//request a new interrogation
			var alreadysent = Object.values(interrogation_db).some(item => item.imghash === imghash);
			if (!alreadysent) {
				let b64 = document.getElementById("zoomedimg").src;
				interrogate_new_image(b64, imghash, savedmeta.visionmode == 1);
			}
		}
		update_clicked_image(imghash);
	} else {
		console.log("IMG META NOT FOUND!");
	}
}
function update_clicked_image(imghash) {
	let savedmeta = completed_imgs_meta[imghash];
	if (!savedmeta && imghash != "") {
		savedmeta = completed_imgs_meta[imghash] = { prompt: "", desc: "", visionmode: 0, aspect: 0 };
	}

	if (savedmeta) {
		document.getElementById("zoomedimg").classList.remove("portrait");
		document.getElementById("zoomedimg").classList.remove("landscape");
		document.getElementById("zoomedimg").classList.remove("portrait_long");
		document.getElementById("zoomedimg").classList.remove("landscape_long");
		if (savedmeta.aspect == 1) {
			document.getElementById("zoomedimg").classList.add("portrait");
		} else if (savedmeta.aspect == 2) {
			document.getElementById("zoomedimg").classList.add("landscape");
		} else if (savedmeta.aspect == 4) {
			document.getElementById("zoomedimg").classList.add("portrait_long");
		} else if (savedmeta.aspect == 5) {
			document.getElementById("zoomedimg").classList.add("landscape_long");
		}

		if (!savedmeta.visionmode) {
			savedmeta.visionmode = 0;
		}

		let origprompt = savedmeta.prompt ? replaceAll(savedmeta.prompt, "\n", " ") : "No Saved Description";
		latest_orig_prompt = origprompt;
		let hasllava = is_using_kcpp_with_llava();
		let visionstatus = "";
		if (savedmeta.visionmode == 3) {
			if (custom_kobold_endpoint != "") { //on a kobo endpoint
				visionstatus = (!savedmeta.visionmode || savedmeta.visionmode == 0)
					? `<span class="color_red">Inactive</span>`
					: (hasllava ? `<span class="color_green">Active</span>` : `<span class="color_yellow">Unsupported</span>`);
			} else {
				let isoai = custom_oai_key != "" && document.getElementById("useoaichatcompl").checked;
				let isgemini = custom_gemini_key != "";
				visionstatus = isoai
					? `<span class="color_green">OpenAI API (Conditional)</span>`
					: (isgemini ? `<span class="color_green">Gemini API (Conditional)</span>` : `<span class="color_yellow">Unsupported</span>`);
			}
		} else {
			visionstatus = (!savedmeta.visionmode || savedmeta.visionmode == 0)
				? `<span class="color_red">Inactive</span>`
				: (savedmeta.desc ? `<span class="color_green">Active</span>` : `<span class="color_yellow">Analyzing</span>`);
		}

		let togglebtn =
			`<select class="form-control" id="aivisionmode" style="display:inline;height:24px;width: 140px; padding: 2px; margin: 3px; font-size:12px;" onchange="toggle_ai_vision(\'`
			+ imghash + `\')">
							<option value="0">Disabled</option>
							<option value="1">Interrogate (Horde)</option>
							<option value="2">Interrogate (Local)</option>
							<option value="3">Multimodal Vision</option>
						</select>`;
		document.getElementById("zoomedimgdesc").innerHTML = `
		AI Vision: ` + visionstatus
			+ ` <span class="helpicon">?<span class="helptext">Allows the AI to see and react to this image. Interrogate gets a simple description of the image (Horde or Local A1111 API), while Multimodal Vision provides true image understanding (KCPP/OpenAI/Gemini).</span></span>
		` + togglebtn + `
		<br><button type="button" class="btn btn-primary" style="width: 140px; padding: 2px; margin: 3px; font-size:12px;" onclick="show_orig_prompt()">View Original Prompt</button>
		<button type="button" class="btn btn-primary" style="width: 110px; padding: 2px; margin: 3px; font-size:12px;" onclick="add_img2img()">Create Img2Img</button>
		`;
		document.getElementById("aivisionmode").value = savedmeta.visionmode;
	} else {
		document.getElementById("zoomedimgdesc").innerText = "No Saved Data";
	}
}
var latest_orig_prompt = "";
function show_orig_prompt() {
	msgbox(latest_orig_prompt, "Original Prompt");
}
function add_img2img() {
	inputBox("Enter prompt to create a new image, based on this source image.", "Create Img2Img", "", "Enter Img2Img Prompt", () => {
		let userinput = getInputBoxValue();
		if (userinput.trim() != "") {
			var sentence = userinput.trim().substring(0, 380);
			let b64 = document.getElementById("zoomedimg").src;
			do_manual_gen_image(sentence, b64);
			document.getElementById("zoomedimgcontainer").classList.add("hidden");
		}
	}, false);
}
function click_image(target, imghash) {
	if (target) {
		if (localsettings.invert_colors) {
			document.getElementById("zoomedimg").classList.add("invert_colors");
		} else {
			document.getElementById("zoomedimg").classList.remove("invert_colors");
		}
		document.getElementById("zoomedimgcontainer").classList.remove("hidden");
		document.getElementById("zoomedimg").src = target.src;

		update_clicked_image(imghash);
	}
}
function delete_curr_image() {
	let removesrc = document.getElementById("zoomedimg").src;
	if (removesrc && removesrc != "") {
		var matchingStr = "[<|d|" + removesrc + "|d|>]";
		for (let i = 0; i < gametext_arr.length; ++i) {
			if (gametext_arr[i].includes(matchingStr)) {
				gametext_arr[i] = gametext_arr[i].replace(matchingStr, "");
				if (gametext_arr[i] == "") {
					gametext_arr.splice(i, 1);
				}
				break;
			}
		}
		render_gametext();
	}
}

function render_all_image_html(text, float = true, center = false) {
	let siclass = float ? "storyimgfloat" : (center ? "storyimgcenter" : "storyimgsidevertical");
	if (localsettings.img_stacking && !float) { //allow horizontal stacking
		siclass = "storyimgsidehorizontal"; //horizontal stack
	}
	text = text.replace(/\[<\|p\|.+?\|p\|>\]/g, function(m) {
		// m here means the whole matched string
		let inner = m.substring(5, m.length - 5);
		inner = render_image_html("", inner, siclass);
		return inner;
	});
	text = text.replace(/\[<\|d\|.+?\|d\|>\]/g, function(m) {
		// m here means the whole matched string
		let inner = m.substring(5, m.length - 5);
		inner = render_image_html(inner, "", siclass);
		return inner;
	});
	text = text.replace(/\[<\|[\s\S]+?\|>\]/g, ""); //remove normal comments too
	return text;
}

function render_image_html(data, pend_txt = "", siclass = "storyimgfloat") {
	var dim = PREVIEW_RES_PX; //image preview. adventure mode has smaller pictures
	dimW = dim;
	dimH = dim;
	let reinvertcolor = localsettings.invert_colors ? " invert_colors" : "";
	let alttxt = "";
	let suffix = "";
	if (!data || data == "") {
		let waittime = "Unavailable";
		if (image_db[pend_txt] != null) {
			let qq = image_db[pend_txt].queue;
			alttxt = image_db[pend_txt].prompt ? escape_html(image_db[pend_txt].prompt) : "";
			waittime = qq == 0 ? "Generating" : (qq == "Starting" ? qq : "Queue: " + qq);
		} else {
			console.log("Cannot render " + pend_txt);
		}

		return `<div class="` + siclass + reinvertcolor
			+ `" contenteditable="false"><img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDABsSFBcUERsXFhceHBsgKEIrKCUlKFE6PTBCYFVlZF9VXVtqeJmBanGQc1tdhbWGkJ6jq62rZ4C8ybqmx5moq6T/2wBDARweHigjKE4rK06kbl1upKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKT/wAARCAEAAQADASIAAhEBAxEB/8QAGQABAQEBAQEAAAAAAAAAAAAAAAEDAgQF/8QAIBABAAIBBQEBAQEAAAAAAAAAAAECEgMRMVKRIWFBof/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwD7AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABETPENNPT3je3jUHm22HpmInljqUx+xwDgAAAAAAAAAAAAAAAAAAAAAAAAABaxvaIRaztaJB6AAEmN4mFSZ2iZB5wAAAAAAAAAAAAAAAAAAAAAAAAAAAaaeptG1vWrzETMcSD0zMRyx1L5fI4cb7gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA7rpzNd/HAAAAAAAAAAAAAAAAAAAAAAAAAAAAADTT09/s8Gnp7/Z4agONSmX2OXYDzDbUpl9jliAAAAAAAAAAAAAAAAAAAsVmd9o4KVm0/jeIiI2gHnGupp/2vjIAABpp6e/2TT09/s8NQAAAAHGpTL7HLsB5htqUy+xyxAAAAAAAAAAAAAAAWlZtP4UrNp/G8RFY2gCIiI2hQAZ6mn/a+NAHmaaenv8AZ4dzp1m2/wDjoAAAAAAAABxqUy+xy7AeYbalMvscsQAAAAAAAAAAFpWbT+FKzafxvEREbQBEREbQoAAAAAAAAAAAAAAAAAONSmX2OXYDzDbUpl9jliAAAAAAAtKzafxaVm0/jaIiI2gCIiI2hQAAAAAAAAAAAAAAAAAAAAAcalMvscuwHmG2pTL7HLEAAAAFi0xxMwZW7T6gC5W7T6ZW7T6gC5W7T6ZW7T6gC5W7T6ZW7T6gC5W7T6ZW7T6gC5W7T6ZW7T6gC5W7T6ZW7T6gC5W7T6ZW7T6gC5W7T6ZW7T6gC5W7T6ZW7T6gC5W7T6ZW7T6gC5W7T6ZW7T6gC5W7T6ZW7T6gC5W7T6kzvyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/Z" width=`
			+ dim + ` height=` + dim + ` style="border-radius: 6%;" title="` + alttxt + `" alt="` + pend_txt
			+ `"><div class=\"imgloader\"></div><div class=\"imagelabel\">` + waittime + `</div></div>` + suffix;
	} else {
		let imghash = cyrb_hash(data).trim();
		if (completed_imgs_meta[imghash] != null) {
			alttxt = completed_imgs_meta[imghash].prompt ? escape_html(completed_imgs_meta[imghash].prompt) : "";
			if (completed_imgs_meta[imghash].aspect == 1) { //portrait
				dimH *= 1.35;
				dimW *= 0.9;
			} else if (completed_imgs_meta[imghash].aspect == 2) { //landscape
				dimW *= 1.35;
				dimH *= 0.9;
			} else if (completed_imgs_meta[imghash].aspect == 4) { //portrait_long
				dimH *= 1.5;
				dimW *= 0.75;
			} else if (completed_imgs_meta[imghash].aspect == 5) { //landscape_long
				dimW *= 1.5;
				dimH *= 0.75;
			}
		}
		return `<div class="` + siclass + reinvertcolor + `"><img src="` + data + `" width=` + dimW + ` height=` + dimH + ` title="` + alttxt
			+ `" style="border-radius: 6%; cursor: pointer;" onclick="return click_image(this,\'` + imghash + `\');"></div>` + suffix;
	}
}

function trim_extra_stop_seqs(gentxt, includeStopToken) {
	if (localsettings.extrastopseq != "") {
		let rep = replaceAll(localsettings.extrastopseq, "\\n", "\n");
		let srep = rep.split("||$||");
		if (srep.length > 0) {
			for (let i = 0; i < srep.length; ++i) {
				if (srep[i] && srep[i] != "") {
					let foundStop = gentxt.indexOf(srep[i]);
					if (foundStop != -1) {
						//trim the gentxt
						gentxt = gentxt.substr(0, foundStop) + (includeStopToken ? srep[i] : "");
					}
				}
			}
		}
	}
	return gentxt;
}

function handle_incoming_text(gentxt, genworker, genmdl, genkudos) {
	retry_in_progress = false;
	//handle stopping tokens if they got missed (eg. horde)
	gentxt = trim_extra_stop_seqs(gentxt, true);
	let mychatname = get_my_multiplayer_chatname();

	//allow trim incomplete sentences
	//do not trim if instruct mode AND stop token reached
	let donottrim = (localsettings.opmode == 4 || localsettings.opmode == 3) && last_stop_reason == "stop";
	if (!donottrim && localsettings.trimsentences == true) {
		//also, to prevent a trim from bisecting a chat name, if a response contains a chatname, do not trim
		donottrim = false;
		if (localsettings.opmode == 3) {
			let foundOppoName = gentxt.indexOf(localsettings.chatopponent + "\: ");
			let foundMyName = gentxt.indexOf(mychatname + "\: ");
			if (foundOppoName > 0 || foundMyName > 0) {
				donottrim = true;
			}
		}
		if (!donottrim) {
			gentxt = end_trim_to_sentence(gentxt, true);
		}
	}

	//do a second pass, this time removing the actual stop token
	gentxt = trim_extra_stop_seqs(gentxt, false);

	//fix alpaca leakage
	if (
		localsettings.fix_alpaca_leak && (localsettings.opmode == 2 || localsettings.opmode == 3 || localsettings.opmode == 4)
		&& (get_instruct_starttag(true).toLowerCase().includes("### instruction"))
	) {
		let matches = gentxt.match(/\n### (instruction|response)\n|\n### (instruction|response):\n/gi);
		for (let m in matches) {
			let foundStop = gentxt.indexOf(matches[m]);
			if (foundStop != -1) {
				//trim the gentxt
				gentxt = gentxt.substr(0, foundStop);
			}
		}
	}

	//apply regex transform
	if (localsettings.regexreplace_data && localsettings.regexreplace_data.length > 0) {
		for (let i = 0; i < localsettings.regexreplace_data.length; ++i) {
			if (localsettings.regexreplace_data[i].p != "" && !(localsettings.regexreplace_data[i].d)) {
				let pat = new RegExp(localsettings.regexreplace_data[i].p, "gm");
				let rep = localsettings.regexreplace_data[i].r;
				rep = unescape_regex_newlines(rep);
				gentxt = gentxt.replace(pat, rep);
			}
		}
	}

	//apply t2i image replacements
	if (localsettings.img_autogen_type == 2 && localsettings.generate_images_mode != 0) {
		const pat = /<t2i>(.*?)<\/t2i>/g;
		gentxt = gentxt.replace(pat, function(m, p1) {
			let newimgid = generate_new_image(p1, "", false);
			let nimgtag = m + "[<|p|" + newimgid + "|p|>]";
			return nimgtag;
		});
	}

	//trim trailing whitespace, and multiple newlines
	if (localsettings.trimwhitespace) {
		gentxt = gentxt.replace(/[\t\r\n ]+$/, "");
	}
	if (localsettings.compressnewlines) {
		gentxt = gentxt.replace(/[\r\n]+/g, "\n");
	}

	//if we are in adventure mode, truncate to action if it appears
	if (localsettings.opmode == 2) {
		let foundNextAction = gentxt.indexOf("\n\> ");
		let splitresponse = [];
		if (foundNextAction != -1) { //if found, truncate to it
			splitresponse = gentxt.split("\n\> ");
			gentxt = splitresponse[0];
		}
		if (!localsettings.multiline_replies) {
			let foundnl = gentxt.indexOf("\n");
			if (foundnl != -1) { //if found, truncate to it
				splitresponse = gentxt.split("\n");
				gentxt = splitresponse[0];
			}
		}
	}

	//if we are in chatmode, truncate to my first response
	if (localsettings.opmode == 3) {
		//sometimes the bot repeats its own name at the very start. if that happens, trim it away.
		let oppomatch = localsettings.chatopponent + "\: ";
		let oppomatchwithNL = "\n" + localsettings.chatopponent + "\: ";
		let foundOppoName = gentxt.indexOf(oppomatch);
		let foundOppoNameWithNL = gentxt.indexOf(oppomatchwithNL);
		if (localsettings.chatopponent != "" && foundOppoName == 0) {
			gentxt = gentxt.substring(oppomatch.length);
		}
		let foundMyName = gentxt.indexOf(mychatname + "\:");
		let foundMyName2 = gentxt.indexOf("\n" + mychatname + " ");
		var foundAltYouName = new RegExp("\nYou [A-Z\"'*] ", "gi");
		var foundAltYouNameRes = gentxt.match(foundAltYouName);
		let splitresponse = [];

		let prune_multiliners = function(input_arr) {
			//patch for cases where a random extra line from a second chatter is injected between
			if (!localsettings.multiline_replies) {
				let ml_check = input_arr[0];
				//test for other chatopponents
				var moreopponents = new RegExp("\n(?!" + mychatname + ").+?\: ", "gi");
				var foundmoreopponent = ml_check.match(moreopponents);
				if (foundmoreopponent != null && foundmoreopponent.length > 0) {
					//too many chat users. split to first newline and stop.
					return ml_check.split("\n");
				}
			}
			return input_arr;
		};

		if (foundMyName != -1) {
			splitresponse = gentxt.split(mychatname + "\:");
			splitresponse = prune_multiliners(splitresponse);
		} else if (
			foundMyName2 != -1
			&& (mychatname != "User"
				|| (foundAltYouNameRes != null && foundAltYouNameRes.length > 0))
		) { //added by henky request, trigger even without colon
			splitresponse = gentxt.split("\n" + mychatname + " ");
			splitresponse = prune_multiliners(splitresponse);
		} else if (foundOppoNameWithNL > 0) { //split by oppo name
			splitresponse = gentxt.split("\n" + localsettings.chatopponent + "\: ");
			splitresponse = prune_multiliners(splitresponse);
		} //if no name found
		else {
			if (localsettings.multiline_replies) {
				//already force trimmed to sentence, so just include whole thing
				splitresponse.push(gentxt);
			} else {
				//if quotes found, split by quotes
				if (gentxt.indexOf('"') == 0 && gentxt.indexOf('"', 1) > 0) {
					let endquote = gentxt.indexOf('"', 1);
					splitresponse.push(gentxt.substring(0, endquote + 1));
				} else {
					//split to first newline
					splitresponse = gentxt.split("\n");
				}
			}
		}

		let startpart = splitresponse[0];
		if (startpart.length > 0 && startpart[startpart.length - 1] == "\n") {
			startpart = startpart.substring(0, startpart.length - 1);
		}
		gentxt = startpart;
	}

	//if we are in instruct mode, truncate to instruction
	if (localsettings.opmode == 4) {
		let st = get_instruct_starttag(true);
		let et = get_instruct_endtag(true);
		let stripping_arr = [];
		if (st != "") {
			stripping_arr.push(st);
		}
		if (et != "") {
			stripping_arr.push(et);
		}
		if (st == "{{[INPUT]}}" || et == "{{[OUTPUT]}}") {
			stripping_arr.push("### Instruction:");
			stripping_arr.push("### Response:");
		}
		if (localsettings.separate_end_tags && get_instruct_endtag_end(true)) {
			let stet_et = get_instruct_endtag_end(true);
			if (stet_et != "") {
				stripping_arr.push(stet_et);
			}
		}

		//sometimes the OAI type endpoints get confused and repeat the instruct tag, so trim it
		for (let i = 0; i < stripping_arr.length; ++i) {
			let curtag = stripping_arr[i];
			let earlymatch = gentxt.indexOf(curtag);
			if (earlymatch == 0) {
				gentxt = gentxt.substring(curtag.length);
			}

			let found = gentxt.indexOf(curtag);
			let splitresponse = [];
			if (found != -1) { //if found, truncate to it
				splitresponse = gentxt.split(curtag);
				gentxt = splitresponse[0];
			}
		}

		if (localsettings.inject_chatnames_instruct) {
			let st2 = mychatname + "\:";
			let et2 = localsettings.chatopponent + "\:";
			if (mychatname != "") {
				found = gentxt.indexOf(st2);
				splitresponse = [];
				if (found == 0) {
					gentxt = gentxt.slice(st2.length);
					found = gentxt.indexOf(st2);
				}
				if (found != -1) { //if found, truncate to it
					splitresponse = gentxt.split(st2);
					gentxt = splitresponse[0];
				}
			}
			if (localsettings.chatopponent != "" && !localsettings.chatopponent.includes("||$||")) {
				found = gentxt.indexOf(et2);
				splitresponse = [];
				if (found == 0) {
					gentxt = gentxt.slice(et2.length);
					found = gentxt.indexOf(et2);
				}
				if (found != -1) { //if found, truncate to it
					splitresponse = gentxt.split(et2);
					gentxt = splitresponse[0];
				}
			}
		}
	}

	//second pass for trimming whitespace
	if (localsettings.trimwhitespace) {
		gentxt = gentxt.replace(/[\t\r\n ]+$/, "");
	}

	let gentxtspeak = gentxt;
	if (pending_context_preinjection != "") {
		if (
			gentxt != "" && gentxt[0] != " "
			&& (localsettings.opmode == 3
				|| (localsettings.opmode == 4 && localsettings.inject_chatnames_instruct && !localsettings.inject_jailbreak_instruct
					&& localsettings.think_injected == 0))
		) {
			//if the response doesnt come with a space, add one in chat
			gentxt = " " + gentxt;
		}
		gentxt = pending_context_preinjection + gentxt;
		pending_context_preinjection = "";
	}
	if (pending_context_postinjection != "") {
		gentxt = gentxt + pending_context_postinjection;
		pending_context_postinjection = "";
	}

	if (localsettings.speech_synth > 0) {
		if (localsettings.narrate_both_sides && !localsettings.narrate_only_dialog) {
			gentxtspeak = gentxt;
		}

		//remove thinking from tts if hidden
		if ((localsettings.thinking_action == 1 || localsettings.thinking_action == 2) && localsettings.thinking_pattern != "") { //removal of cot
			let pat = new RegExp(localsettings.thinking_pattern, "gmi");
			gentxtspeak = gentxtspeak.replace(pat, "");
		}
		//remove t2i
		if (localsettings.img_autogen_type == 2) {
			const pat = /<t2i>(.*?)<\/t2i>/g;
			gentxtspeak = gentxtspeak.replace(pat, "");
			const pat2 = /{{\[IMG_.{1,8}_REF\]}}/g;
			gentxtspeak = gentxtspeak.replace(pat2, "");
		}

		tts_speak(gentxtspeak);
	}

	if (gentxt != "") {
		gametext_arr.push(gentxt); //delete last message if retry is hit, since response was added
		retry_preserve_last = false;
	}
	if (localsettings.beep_on) {
		playbeep();
	}
	if (localsettings.notify_on) {
		shownotify();
	}
	let kcpp_has_logprobs = last_response_obj != null && last_response_obj.results && last_response_obj.results.length > 0
		&& last_response_obj.results[0].logprobs != null;
	let oai_has_logprobs = last_response_obj != null && last_response_obj.choices && last_response_obj.choices.length > 0
		&& last_response_obj.choices[0].logprobs != null;
	let lastresp = ` <a href="#" class="color_blueurl" onclick="show_last_logprobs()">(View Logprobs)</a>`;
	let lastreq =
		`<a href="#" onclick="show_last_req()">Last request</a> served by <a href="#" onclick="get_and_show_workers()">${genworker}</a> using <span class="color_darkgreen">${genmdl}</span>${(genkudos
				> 0
			? ` for ${genkudos} kudos`
			: ``)} in ${get_time_taken()} seconds.${(last_response_obj != null && (kcpp_has_logprobs || oai_has_logprobs) ? lastresp : "")}`;
	document.getElementById("lastreq1").innerHTML = lastreq;
	document.getElementById("lastreq2").innerHTML = lastreq;
	document.getElementById("lastreq3").innerHTML = lastreq;
}

function poll_interrogation_db() {
	let imagecount = Object.keys(interrogation_db).length;
	if (!imagecount) return;

	console.log("polling for pending interrogations " + imagecount);
	for (let key in interrogation_db) {
		let img = interrogation_db[key];
		if (img.done == false && img.poll_category == 1) {
			//call check
			fetch(stablehorde_output_interrogate_endpoint + "/" + key)
				.then(x => x.json())
				.then((data) => {
					console.log("pollimg result:", data);
					if (!data.state || (data.state != "processing" && data.state != "done")) {
						msgbox("Pending image interrogation could not complete.");
						console.log("removing from interrogation: " + key);
						delete interrogation_db[key];
					} else if (data.state == "done") {
						//fetch final image
						img.done = true;
						//save results
						if (data.forms && data.forms.length > 0 && data.forms[0].result && data.forms[0].result.caption) {
							let caption = data.forms[0].result.caption;
							let savedmeta = completed_imgs_meta[img.imghash];
							if (caption && savedmeta) {
								savedmeta.desc = caption;
								update_clicked_image(img.imghash);
							}
						}

						delete interrogation_db[key];
					} else {
						//do nothing
					}
				})
				.catch((error) => {
					console.error("Error:", error);
					msgbox("Interrogate poll error: " + error);
					delete interrogation_db[key];
				});
		}
	}
}

function poll_image_db() {
	poll_interrogation_db();

	//every time this runs, we loop through our image cache for unfinished images and poll for a response
	//console.log("polling for pending images: " + JSON.stringify(image_db));
	let imagecount = Object.keys(image_db).length;
	if (!imagecount) return;

	console.log("polling for pending images " + imagecount);
	for (let key in image_db) {
		let img = image_db[key];
		if (img.done == false && img.poll_category == 1) { //horde image polling
			let hordeid = img.imrefid;
			if (hordeid && hordeid != "") {
				//call check
				fetch(stablehorde_poll_endpoint + "/" + hordeid)
					.then(x => x.json())
					.then((data) => {
						console.log("pollimg result:", data);
						if (data.faulted == true || data.is_possible == false) {
							msgbox("Pending image generation could not complete.");
							console.log("removing from images: " + key);
							delete image_db[key];
						} else if (data.done == true) {
							//fetch final image
							img.done = true;
							fetch(stablehorde_output_endpoint + "/" + hordeid)
								.then(y => y.json())
								.then((finalimg) => {
									console.log("finalimg recv for " + key);
									if (finalimg.faulted == true || finalimg.is_possible == false) {
										msgbox("Pending image generation could not complete.");
										console.log("removing from images: " + key);
										delete image_db[key];
									} else {
										img.queue = 0;
										let origImg = "data:image/jpeg;base64," + finalimg.generations[0].img;
										//console.log("Original image: " + origImg);
										let imgres = localsettings.img_allowhd
											? (localsettings.img_aspect == 0 ? NO_HD_RES_PX : HD_RES_PX)
											: NO_HD_RES_PX;
										compressImage(
											origImg,
											(newDataUri) => {
												img.result = newDataUri;
											},
											false,
											imgres,
										);
									}
								})
								.catch((error) => {
									console.error("Error:", error);
									msgbox("Image poll error: " + error);
									delete image_db[key];
								});
						} else {
							//update timer
							img.queue = data.queue_position == null ? "Error" : data.queue_position;
						}
					})
					.catch((error) => {
						console.error("Error:", error);
						msgbox("Image poll error: " + error);
						delete image_db[key];
					});
			}
		} else if (img.done == false && img.poll_category == 2) { //comfyui image polling
			let comfyid = img.imrefid;
			if (comfyid && comfyid != "") {
				//comfyui polling
				fetch(localsettings.saved_comfy_url + comfy_history_endpoint + "/" + comfyid, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				})
					.then(x => x.json())
					.then(resp2 => {
						console.log(resp2);
						if (resp2 && resp2[comfyid] && resp2[comfyid].status && resp2[comfyid].status.completed) {
							img.done = true;
							let finalfilename = resp2[comfyid].outputs["9"].images[0].filename;
							//fetch final image
							fetch(localsettings.saved_comfy_url + comfy_results_endpoint + finalfilename)
								.then((response) => {
									return response.blob(); // Convert the response into a Blob
								})
								.then((finalimg) => {
									console.log("finalimg recv for " + comfyid);
									const reader = new FileReader();
									reader.onloadend = () => {
										img.queue = 0;
										let origImg = reader.result;
										let imgres = localsettings.img_allowhd
											? (localsettings.img_aspect == 0 ? NO_HD_RES_PX : HD_RES_PX)
											: NO_HD_RES_PX;
										compressImage(
											origImg,
											(newDataUri) => {
												img.result = newDataUri;
											},
											false,
											imgres,
										);
									};
									reader.readAsDataURL(finalimg);
								})
								.catch((error) => {
									console.error("Error:", error);
									msgbox("Image poll error: " + error);
									delete image_db[key];
								});
						}
					}).catch((error) => {
						console.log("Generation Error: " + error);
						delete image_db[key];
						msgbox(
							"Image Generation Failed!\n\nPlease make sure ComfyUI is running at " + localsettings.saved_comfy_url
								+ " and properly configured!\n\nIt must be launched with the flag --listen --enable-cors-header '*' to enable API access\n",
						);
					});
			}
		}
	}

	//now we loop through the image cache and swap completed images into the gametext
	let hasChangedImage = false;
	let needToSave = false;
	for (var i = 0; i < gametext_arr.length; ++i) {
		//if there's no image in this segment, continue
		if (/\[<\|p\|.+?\|p\|>\]/.test(gametext_arr[i])) {
			for (let key in image_db) {
				let img = image_db[key];
				let matchstr = "[<|p|" + key + "|p|>]";
				if (gametext_arr[i].includes(matchstr)) {
					hasChangedImage = true; //set here to update timers
					if (img.done == true && img.result != "") {
						needToSave = true;
						let newstr = "[<|d|" + img.result + "|d|>]";
						console.log("Replacing with Image: " + matchstr);
						gametext_arr[i] = gametext_arr[i].replace(matchstr, newstr);
						let metaid = cyrb_hash(img.result);
						//default to llava if supported, and image is self uploaded
						completed_imgs_meta[metaid] = {
							prompt: image_db[key].prompt,
							desc: "",
							visionmode: ((image_db[key].imsource == 1 && is_using_kcpp_with_llava()) ? 3 : 0),
							aspect: image_db[key].aspect,
						};
						delete image_db[key];
					}
				}
			}
		}
	}
	if (hasChangedImage && document.activeElement != document.getElementById("gametext")) {
		//console.log(gametext_arr);
		render_gametext(needToSave);
		if (needToSave) {
			sync_multiplayer(false);
		}
	}
}

function compressImage(inputDataUri, onDone, fixedSize = true, maxSize = NO_HD_RES_PX, quality = 0.35, letterboxAspect = false) {
	let img = document.createElement("img");
	let wantedWidth = maxSize;
	let wantedHeight = maxSize;
	const isJpeg = true;

	// When the event "onload" is triggered we can resize the image.
	img.onload = function() {
		// We create a canvas and get its context.
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");

		var origW = img.width;
		var origH = img.height;
		var aspectratio = origW / origH;

		// We set the dimensions at the wanted size for fixedsize.
		if (!fixedSize) {
			//otherwise, we preserve the original ratio but scale them down to fit
			let maxImgDim = Math.max(origW, origH);
			wantedWidth = origW;
			wantedHeight = origH;
			if (maxImgDim > maxSize) {
				let scalef = maxImgDim / maxSize;
				wantedWidth = origW / scalef;
				wantedHeight = origH / scalef;
			}
		}

		canvas.width = wantedWidth;
		canvas.height = wantedHeight;

		// We resize the image with the canvas method
		if (letterboxAspect) {
			let minsizeW = Math.min(origW, origH);
			let minsizeH = Math.min(origW, origH);
			let targetMaxSize = maxSize;
			//a bit of a hack, but if the input image is much smaller than the target canvas, we can use a smaller canvas
			if (targetMaxSize >= VHD_RES_PX && origW <= HD_RES_PX && origH <= HD_RES_PX) {
				targetMaxSize = HD_RES_PX;
			}
			if (targetMaxSize >= HD_RES_PX && origW <= NO_HD_RES_PX && origH <= NO_HD_RES_PX) {
				targetMaxSize = NO_HD_RES_PX;
			}

			if (aspectratio <= 0.5) {
				//portrait
				minsizeH *= 2;
				canvas.width = wantedWidth = targetMaxSize / 2;
				canvas.height = wantedHeight = targetMaxSize;
			} else if (aspectratio < 0.7) {
				//portrait
				minsizeH *= 1.5;
				canvas.width = wantedWidth = targetMaxSize / 1.5;
				canvas.height = wantedHeight = targetMaxSize;
			} else if (aspectratio >= 2) {
				//landscape
				minsizeW *= 2;
				canvas.width = wantedWidth = targetMaxSize;
				canvas.height = wantedHeight = targetMaxSize / 2;
			} else if (aspectratio > 1.4) {
				//landscape
				minsizeW *= 1.5;
				canvas.width = wantedWidth = targetMaxSize;
				canvas.height = wantedHeight = targetMaxSize / 1.5;
			} else {
				//square
				canvas.width = wantedWidth = targetMaxSize;
				canvas.height = wantedHeight = targetMaxSize;
			}

			let newWidth, newHeight, mx, my;
			if (wantedWidth / wantedHeight > aspectratio) {
				newHeight = wantedHeight;
				newWidth = wantedHeight * aspectratio;
			} else {
				newWidth = wantedWidth;
				newHeight = wantedWidth / aspectratio;
			}

			if (localsettings.img_crop) {
				mx = (origW - minsizeW) / 2;
				my = (origH - minsizeH) / 2;
				ctx.drawImage(this, mx, my, minsizeW, minsizeH, 0, 0, wantedWidth, wantedHeight);
			} else {
				mx = (wantedWidth - newWidth) / 2;
				my = (wantedHeight - newHeight) / 2;
				ctx.fillStyle = "black";
				ctx.fillRect(0, 0, wantedWidth, wantedHeight);
				ctx.drawImage(this, mx, my, newWidth, newHeight);
			}
		} else {
			ctx.drawImage(this, 0, 0, wantedWidth, wantedHeight);
		}

		var dataURI = "";
		if (isJpeg) {
			dataURI = canvas.toDataURL(`image/jpeg`, quality);
		} else {
			//png does not support compression by default, not recommended!
			dataURI = canvas.toDataURL(`image/png`);
		}
		onDone(dataURI, aspectratio);
	};
	img.setAttribute("crossorigin", "anonymous");

	// We put the Data URI in the image's src attribute
	if (typeof inputDataUri === "string" || inputDataUri instanceof String) {
		img.src = inputDataUri;
	} else {
		var blob = new Blob([inputDataUri], { type: "image/png" });
		var url = URL.createObjectURL(blob);
		img.src = url;
	}
}

//runs every second
var idle_timer = 0; //used in chat mode to send multi replies
var idle_triggered_counter = 0;
var idle_backoff_array = [15000, 60000, 300000, 1200000, 14400000];
function poll_idle_responses() {
	let idle_timer_max = 0;
	if (localsettings.idle_duration > 0) {
		idle_timer_max = localsettings.idle_duration * 1000;
	} else {
		//smart idle timer
		idle_timer_max =
			idle_backoff_array[idle_triggered_counter >= idle_backoff_array.length ? idle_backoff_array.length - 1 : idle_triggered_counter];
	}

	let newgenempty = document.getElementById("input_text").value == "";
	let chatinputempty = document.getElementById("cht_inp").value == "" && document.getElementById("corpo_cht_inp").value == "";
	if (
		(localsettings.opmode == 1 || localsettings.opmode == 2 || localsettings.opmode == 3 || localsettings.opmode == 4)
		&& localsettings.idle_responses > 0 && newgenempty && chatinputempty && !gametext_focused && !document.getElementById("btnsend").disabled
		&& idle_triggered_counter < localsettings.idle_responses && !is_popup_open()
	) {
		idle_timer += 1000;
		if (idle_timer > idle_timer_max) {
			idle_timer = 0;
			let nextcounter = ++idle_triggered_counter;
			if (localsettings.opmode == 4) { //handle idle messages
				if (!localsettings.allow_continue_chat) {
					pending_context_preinjection = get_instructendplaceholder();

					if (localsettings.inject_timestamps) {
						pending_context_preinjection += get_current_timestamp();
					}
				}
			}
			prepare_submit_generation();
			idle_triggered_counter = nextcounter;
		}
		console.log("Idling: " + idle_timer + ", " + idle_triggered_counter);
	} else {
		idle_timer = 0;
	}
}

function ready_to_record() {
	let currentlySpeaking = false;
	if ("speechSynthesis" in window) {
		currentlySpeaking = window.speechSynthesis.speaking;
	}
	return (voice_typing_mode > 0 && is_using_kcpp_with_whisper()
		&& !document.getElementById("btnsend").disabled
		&& !voice_is_processing && !voice_is_recording && isVoiceInputConfigured
		&& !currentlySpeaking && !xtts_is_playing && !is_popup_open());
}

// AUDIO MANIPULATION FUNCTIONS
//resample audio freq (to 16khz)
function resampleAudioBuffer(buffer, resampledRate, callback) {
	const originalSampleRate = buffer.sampleRate;
	const channels = buffer.numberOfChannels;
	const length = buffer.length;
	const ratio = originalSampleRate / resampledRate;
	const newLength = Math.round(length / ratio);
	const audioContext = new (window.AudioContext || window.webkitAudioContext)();
	const resampledBuffer = audioContext.createBuffer(channels, newLength, resampledRate);
	const offlineContext = new OfflineAudioContext(channels, newLength, resampledRate);
	const source = offlineContext.createBufferSource();
	source.buffer = buffer;
	source.connect(offlineContext.destination);
	const startRendering = offlineContext.startRendering();
	startRendering.then((renderedBuffer) => {
		callback(renderedBuffer);
	}).catch((error) => {
		console.error("Resample Err:", error);
	});
	source.start();
	return resampledBuffer;
}

function audioBufferToWavBlob(audioBuffer) {
	let writeWavString = function(view, offset, string) {
		for (let i = 0; i < string.length; i++) {
			view.setUint8(offset + i, string.charCodeAt(i));
		}
	};
	const numOfChan = audioBuffer.numberOfChannels,
		length = audioBuffer.length * numOfChan * 2 + 44,
		buffer = new ArrayBuffer(length),
		view = new DataView(buffer),
		channels = [],
		sampleRate = 16000,
		bitDepth = 16;
	writeWavString(view, 0, "RIFF");
	view.setUint32(4, 44 + audioBuffer.length * 2 - 8, true);
	writeWavString(view, 8, "WAVE");
	writeWavString(view, 12, "fmt ");
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, numOfChan, true);
	view.setUint32(24, sampleRate, true);
	view.setUint32(28, sampleRate * numOfChan * 2, true);
	view.setUint16(32, numOfChan * 2, true);
	view.setUint16(34, bitDepth, true);
	writeWavString(view, 36, "data");
	view.setUint32(40, audioBuffer.length * numOfChan * 2, true);
	for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
		channels.push(audioBuffer.getChannelData(i));
	}
	let offset = 44;
	for (let i = 0; i < audioBuffer.length; i++) {
		for (let channel = 0; channel < numOfChan; channel++) {
			const sample = Math.max(-1, Math.min(1, channels[channel][i]));
			view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
			offset += 2;
		}
	}
	return new Blob([buffer], { type: "audio/wav" });
}

function audioBlobToDecodedAudioBuffer(inBlob, onDone) {
	let reader = new window.FileReader();
	reader.readAsArrayBuffer(inBlob);
	reader.onloadend = function() {
		let arrayBuffer = reader.result;
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		let audioContext = new AudioContext();
		audioContext.decodeAudioData(arrayBuffer, (buffer) => {
			onDone(buffer);
		}, (err) => {
			let fakebuf = audioContext.createBuffer(1, 8, audioContext.sampleRate);
			onDone(fakebuf);
		});
	};
}

function concatenateAudioBuffers(buffer1, buffer2) {
	const audioContext = new (window.AudioContext || window.webkitAudioContext)();
	const numberOfChannels = Math.min(buffer1.numberOfChannels, buffer2.numberOfChannels);
	const tmp = audioContext.createBuffer(
		numberOfChannels,
		buffer1.length + buffer2.length,
		buffer1.sampleRate,
	);
	for (let i = 0; i < numberOfChannels; i++) {
		const channel = tmp.getChannelData(i);
		channel.set(buffer1.getChannelData(i), 0);
		channel.set(buffer2.getChannelData(i), buffer1.length);
	}
	return tmp;
}

var isVoiceInputConfigured = false;
function init_voice_typing() {
	if (navigator.mediaDevices == null) {
		msgbox("Cannot initialize microphone. If you're using a non-localhost URL, it needs to be served over HTTPS!", "Error Starting Microphone");
		voice_typing_mode = document.getElementById("voice_typing_mode").checked = 0;
		return;
	}
	if (isVoiceInputConfigured) {
		return;
	}
	isVoiceInputConfigured = true;

	//under BSD-3-Clause license
	//original source https://github.com/kdavis-mozilla/vad.js Copyright (c) 2015, Kelly Daviss
	let VAD = function(t) {
		for (
			var e in this.options = {
				fftSize: 512,
				bufferLen: 512,
				voice_stop: function() {},
				voice_start: function() {},
				smoothingTimeConstant: .99,
				energy_offset: 1e-8,
				energy_threshold_ratio_pos: 2,
				energy_threshold_ratio_neg: .5,
				energy_integration: 1,
				filter: [{ f: 200, v: 0 }, { f: 2e3, v: 1 }],
				source: null,
				context: null,
			},
				t
		) t.hasOwnProperty(e) && (this.options[e] = t[e]);
		if (!this.options.source) throw Error("The options must specify a MediaStreamAudioSourceNode.");
		this.options.context = this.options.source.context,
			this.hertzPerBin = this.options.context.sampleRate / this.options.fftSize,
			this.iterationFrequency = this.options.context.sampleRate / this.options.bufferLen,
			this.iterationPeriod = 1 / this.iterationFrequency,
			this.setFilter = function(t) {
				this.filter = [];
				for (var e = 0, i = this.options.fftSize / 2; e < i; e++) {
					this.filter[e] = 0;
					for (var s = 0, o = t.length; s < o; s++) {
						if (e * this.hertzPerBin < t[s].f) {
							this.filter[e] = t[s].v;
							break;
						}
					}
				}
			},
			this.setFilter(this.options.filter),
			this.ready = {},
			this.vadState = !1,
			this.energy_offset = this.options.energy_offset,
			this.energy_threshold_pos = this.energy_offset * this.options.energy_threshold_ratio_pos,
			this.energy_threshold_neg = this.energy_offset * this.options.energy_threshold_ratio_neg,
			this.voiceTrend = 0,
			this.voiceTrendMax = 10,
			this.voiceTrendMin = -10,
			this.voiceTrendStart = 5,
			this.voiceTrendEnd = -5,
			this.analyser = this.options.context.createAnalyser(),
			this.analyser.smoothingTimeConstant = this.options.smoothingTimeConstant,
			this.analyser.fftSize = this.options.fftSize,
			this.floatFrequencyData = new Float32Array(this.analyser.frequencyBinCount),
			this.floatFrequencyDataLinear = new Float32Array(this.floatFrequencyData.length),
			this.options.source.connect(this.analyser),
			this.scriptProcessorNode = this.options.context.createScriptProcessor(this.options.bufferLen, 1, 1),
			this.scriptProcessorNode.connect(this.options.context.destination);
		var i = this;
		this.scriptProcessorNode.onaudioprocess = function(t) {
			i.analyser.getFloatFrequencyData(i.floatFrequencyData), i.update(), i.monitor();
		},
			this.options.source.connect(this.scriptProcessorNode),
			this.update = function() {
				for (var t = this.floatFrequencyData, e = 0, i = t.length; e < i; e++) this.floatFrequencyDataLinear[e] = Math.pow(10, t[e] / 10);
				this.ready = {};
			},
			this.getEnergy = function() {
				if (this.ready.energy) return this.energy;
				for (var t = 0, e = this.floatFrequencyDataLinear, i = 0, s = e.length; i < s; i++) t += this.filter[i] * e[i] * e[i];
				return this.energy = t, this.ready.energy = !0, t;
			},
			this.monitor = function() {
				var t = this.getEnergy() - this.energy_offset;
				t > this.energy_threshold_pos
					? this.voiceTrend = this.voiceTrend + 1 > this.voiceTrendMax ? this.voiceTrendMax : this.voiceTrend + 1
					: t < -this.energy_threshold_neg
					? this.voiceTrend = this.voiceTrend - 1 < this.voiceTrendMin ? this.voiceTrendMin : this.voiceTrend - 1
					: this.voiceTrend > 0
					? this.voiceTrend--
					: this.voiceTrend < 0 && this.voiceTrend++;
				var e = !1, i = !1;
				this.voiceTrend > this.voiceTrendStart ? e = !0 : this.voiceTrend < this.voiceTrendEnd && (i = !0);
				var s = t * this.iterationPeriod * this.options.energy_integration;
				return s > 0 || !i ? this.energy_offset += s : this.energy_offset += 10 * s,
					this.energy_offset = this.energy_offset < 0 ? 0 : this.energy_offset,
					this.energy_threshold_pos = this.energy_offset * this.options.energy_threshold_ratio_pos,
					this.energy_threshold_neg = this.energy_offset * this.options.energy_threshold_ratio_neg,
					e && !this.vadState && (this.vadState = !0, this.options.voice_start()),
					i && this.vadState && (this.vadState = !1, this.options.voice_stop()),
					t;
			};
	};

	let onRecordingReady = function(e) {
		let completeRecording = new Blob([e.data], { type: "audio/webm" });
		let audiodatareader = new window.FileReader();

		if (recent_voice_duration < 550) {
			console.log("Skip too short speech: " + recent_voice_duration);
			return; //too short, don't process this
		}

		if (preaudioblobs.length < 2) {
			audioBlobToDecodedAudioBuffer(completeRecording, (buffer) => {
				resampleAudioBuffer(buffer, 16000, (rsBuffer) => {
					let wavblob = audioBufferToWavBlob(rsBuffer);
					audiodatareader.readAsDataURL(wavblob);
				});
			});
		} else {
			audioBlobToDecodedAudioBuffer(completeRecording, (buffer) => {
				audioBlobToDecodedAudioBuffer(preaudioblobs[0], (buffer2) => {
					audioBlobToDecodedAudioBuffer(preaudioblobs[1], (buffer3) => {
						let prefix = concatenateAudioBuffers(buffer2, buffer3);
						let finalbuf = concatenateAudioBuffers(prefix, buffer);
						resampleAudioBuffer(finalbuf, 16000, (rsBuffer) => {
							let wavblob = audioBufferToWavBlob(rsBuffer);
							audiodatareader.readAsDataURL(wavblob);
						});
					});
				});
			});
		}

		audiodatareader.onloadend = function() {
			let dataurl = audiodatareader.result;
			dispatch_transcribe_audio(dataurl);
		};
	};

	// get audio stream from user's mic
	navigator.mediaDevices.getUserMedia({
		audio: true,
	}).then(function(stream) {
		voiceprerecorder = new MediaRecorder(stream);
		voiceprerecorder.addEventListener("dataavailable", (ev) => {
			preaudiobuffers.push(ev.data);
			if (preaudiobuffers.length > 2) {
				preaudiobuffers.shift();
			}
		});
		setInterval(() => {
			if (voiceprerecorder.state !== "inactive") {
				voiceprerecorder.stop();
			}
			if (ready_to_record() && voice_typing_mode == 1) { //only voice detect needs it
				voiceprerecorder.start();
			}
		}, 500);

		voicerecorder = new MediaRecorder(stream);
		voicerecorder.addEventListener("dataavailable", onRecordingReady);
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		let audioContext = new AudioContext();
		let source = audioContext.createMediaStreamSource(stream);
		let options = {
			source: source,
			voice_stop: function() {
				if (voice_typing_mode == 1) {
					console.log("speech stopped");
					ptt_end();
				}
			},
			voice_start: function() {
				if (voice_typing_mode == 1) {
					console.log("speech started");
					ptt_start();
				}
			},
		};
		// Create VAD
		let myvad = new VAD(options);
	});
}
function dispatch_transcribe_audio(dataurl) {
	voice_is_processing = true;
	update_submit_button(false);

	let payload = {
		audio_data: dataurl,
		prompt: "",
		suppress_non_speech: localsettings.voice_suppress_nonspeech,
		langcode: localsettings.voice_langcode,
	};
	fetch(apply_proxy_url(custom_kobold_endpoint + koboldcpp_transcribe_endpoint), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	})
		.then(x => x.json())
		.then(resp => {
			console.log(resp);
			voice_is_processing = false;
			update_submit_button(false);
			if (resp && resp.text && resp.text != "") {
				let trimmed = resp.text.trim();
				let noise = trimmed.startsWith("(") && trimmed.endsWith(")");
				let blank = trimmed.startsWith("[") && trimmed.endsWith("]");
				let willsubmit = document.getElementById("btnsend").disabled ? false : true;
				if (willsubmit && trimmed && !noise && !blank) {
					document.getElementById("input_text").value = trimmed;
					prepare_submit_generation();
				}
			}
		}).catch((error) => {
			console.log("Transcribe Error: " + error);
			voice_is_processing = false;
			update_submit_button(false);
		});
}
function transcribe_file_btn() {
	let finput = document.getElementById("transcribe_file_input");
	finput.click();
	finput.onchange = (event) => {
		if (event.target.files.length > 0 && event.target.files[0]) {
			const file = event.target.files[0];
			const completeRecording = file; // Directly use file as the Blob

			audioBlobToDecodedAudioBuffer(completeRecording, (buffer) => {
				resampleAudioBuffer(buffer, 16000, (rsBuffer) => {
					let wavblob = audioBufferToWavBlob(rsBuffer);
					const reader = new FileReader();
					reader.onload = function(audiodata) {
						let dataurl = audiodata.target.result;
						let payload = {
							audio_data: dataurl,
							prompt: "",
							suppress_non_speech: (document.getElementById("voice_suppress_nonspeech").checked ? true : false),
							langcode: document.getElementById("voice_langcode").value,
						};
						fetch(apply_proxy_url(custom_kobold_endpoint + koboldcpp_transcribe_endpoint), {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify(payload),
						})
							.then(x => x.json())
							.then(resp => {
								console.log(resp);
								if (resp && resp.text && resp.text != "") {
									msgbox(resp.text, "Transcribed Audio");
								}
							}).catch((error) => {
								console.log("Transcribe Error: " + error);
							});
					};
					reader.readAsDataURL(wavblob);
				});
			});
		}
		finput.value = "";
	};
}

function kcpp_tokenize(prompt, onDone) {
	let payload = {
		prompt: prompt,
		special: false,
	};
	fetch(apply_proxy_url(custom_kobold_endpoint + koboldcpp_tokenize_endpoint), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	})
		.then(x => x.json())
		.then(resp => {
			console.log(resp);
			if (resp && resp.ids && resp.ids.length > 0) {
				onDone(resp.ids);
			} else {
				onDone([]);
			}
		}).catch((error) => {
			console.log("Tokenize Error: " + error);
			onDone([]);
		});
}

var max_poll_limit_counter = 0;
function poll_multiplayer() {
	if (!is_using_kcpp_with_multiplayer() || !multiplayer_active) {
		schedule_multiplayer_minor_change = false;
		schedule_multiplayer_major_change = false;
		return;
	}

	//send our changes if they exist
	if (schedule_multiplayer_minor_change || schedule_multiplayer_major_change) {
		submit_multiplayer(schedule_multiplayer_major_change);
		schedule_multiplayer_minor_change = false;
		schedule_multiplayer_major_change = false;
	} else if (max_poll_limit_counter < 4) {
		//listen for others changes
		max_poll_limit_counter += 1;
		let newgenempty = document.getElementById("input_text").value == "";
		let chatinputempty = document.getElementById("cht_inp").value == "" && document.getElementById("corpo_cht_inp").value == "";
		fetch(apply_proxy_url(custom_kobold_endpoint + koboldcpp_multiplayer_check_endpoint), {
			method: "POST",
			headers: get_kobold_header(),
			body: JSON.stringify({
				sender: unique_uid,
				senderbusy: (!newgenempty || !chatinputempty || gametext_focused),
			}),
		})
			.then(response => response.json())
			.then(vals => {
				max_poll_limit_counter -= 1;
				if (!multiplayer_pinged) {
					multiplayer_pinged = true;
					render_gametext(false);
				}
				if (vals && vals.idle != 1) {
					document.getElementById("connectstatusmultiplayer").innerHTML =
						"<span title='Multiplayer Active' class='color_red'>M.P. (Active)</span>";
				} else {
					document.getElementById("connectstatusmultiplayer").innerHTML = "<span title='Multiplayer Idle'>M.P. (Idle)</span>";
				}
				if (
					vals && vals.turn_major && multiplayer_active && vals.data_format == "kcpp_lzma_b64"
					&& (vals.turn_major != multiplayer_last_turn_major || vals.turn_minor != multiplayer_last_turn_minor)
				) {
					let minor_change = multiplayer_last_turn_major == vals.turn_major;
					multiplayer_last_turn_major = vals.turn_major;
					multiplayer_last_turn_minor = vals.turn_minor;
					fetch(apply_proxy_url(custom_kobold_endpoint + koboldcpp_multiplayer_fetch_endpoint), {
						method: "POST",
						headers: get_kobold_header(),
					})
						.then(response => response.text())
						.then(story => {
							let tmpstory = decompress_story(story);
							if (tmpstory && is_kai_json(tmpstory)) {
								if (minor_change) {
									//abort any ongoing generations
									if (synchro_pending_stream != "" || pending_response_id != "") {
										retry_preserve_last = false;
										synchro_pending_stream = "";
										if (synchro_pending_stream != "" && pending_response_id != "") {
											abort_generation();
										} else {
											clear_poll_flags();
										}
									}
									//minor change, load only gametext_arr. assume its v1
									gametext_arr = [];
									if (tmpstory.prompt != "") {
										gametext_arr.push(tmpstory.prompt);
									}
									for (var i = 0; i < tmpstory.actions.length; ++i) {
										gametext_arr.push(tmpstory.actions[i]);
									}
									render_gametext(false);
								} else {
									kai_json_load(tmpstory, true, true); //major change, load everything
								}
							}
						}).catch(error => {
							console.log("Failed to get multiplayer story: " + error);
						});
				} else if (!vals || vals.error) {
					leave_multiplayer();
					msgbox(
						"Disconnected from multiplayer due to bad response.\n\nYou can reconnect by clicking 'Join Multiplayer'.",
						"Disconnected from Multiplayer",
					);
				}
			}).catch(error => {
				leave_multiplayer();
				msgbox(
					"Disconnected from multiplayer: " + error + "\n\nYou can reconnect by clicking 'Join Multiplayer'.",
					"Disconnected from Multiplayer",
				);
				console.log("Failed to access multiplayer status: " + error);
			});
	}
}

//clock speed is 500ms per tick
function poll_pending_response() {
	++poll_ticks_passed;

	//for horde requests, slow down by 3 times unless almost done
	if (!is_using_custom_ep() && (horde_poll_nearly_completed ? (poll_ticks_passed % 2 != 0) : (poll_ticks_passed % 3 != 0))) {
		return;
	}
	show_abort_button(false);
	if (pending_response_id && pending_response_id != "-1" && pending_response_id != "") {
		if (poll_ticks_passed > (1 / (poll_interval_base_text * 0.001))) { //show abort btn after 1 sec passed
			show_abort_button(true);
		}
		if (poll_in_progress) {
			console.log("Polling still in progress for id: " + pending_response_id);
		} else {
			if (is_using_custom_ep()) {
				poll_in_progress = true;
				if (synchro_polled_response == null) {
					//still waiting, do nothing until next poll
					console.log("sync request: still awaiting reply");
					let polledstreaming = waiting_for_tool_call == 0 && localsettings.tokenstreammode == 1 && is_using_kcpp_with_streaming();
					//only check once every 2 ticks if remote
					if (polledstreaming && (localflag ? true : (poll_ticks_passed % 2 == 0))) {
						//get in-progress results
						fetch(custom_kobold_endpoint + koboldcpp_check_endpoint, {
							method: "POST",
							headers: get_kobold_header(),
							body: JSON.stringify({
								genkey: lastcheckgenkey,
							}),
						})
							.then((response) => response.json())
							.then((data) => {
								//makes sure a delayed response doesnt arrive late and mess up
								if (data && data.results != null && data.results.length > 0 && data.results[0].text) {
									if (pending_response_id && pending_response_id != "") {
										let was_empty = synchro_pending_stream == "";
										synchro_pending_stream = data.results[0].text;
										if (was_empty && synchro_pending_stream != "") {
											render_gametext(false); // don't autosave while streaming
										} else {
											update_pending_stream_displays();
										}
									}
								}
								poll_in_progress = false;
							})
							.catch((error) => {
								console.error("Error:", error);
								poll_in_progress = false;
							});
					} else {
						poll_in_progress = false;
					}
				}
				if (synchro_polled_response != null) {
					console.log("sync request: handle recv reply");
					pending_response_id = "";
					poll_in_progress = false;
					let resp = synchro_polled_response;
					if (waiting_for_tool_call == 0) {
						last_reply_was_empty = resp == "" || resp.trim() == "";
					}
					if (resp != null && resp != "") {
						let gentxt = resp;
						let genworker = "Custom Endpoint";
						let genkudos = "0";
						let genmdl = selected_models.length > 0 ? selected_models[0].name : "Unknown Model";
						if (waiting_for_tool_call == 2) {
							handle_incoming_searchsummary(gentxt);
						} else if (waiting_for_tool_call == 1) {
							handle_incoming_autosummary(gentxt);
						} else {
							handle_incoming_text(gentxt, genworker, genmdl, genkudos);
						}
					} else {
						restore_retried_text();
						retry_preserve_last = false;
					}
					synchro_polled_response = null;
					last_stop_reason = "";
					synchro_pending_stream = "";
					show_abort_button(false);
					render_gametext();
					sync_multiplayer(false);
				}
			} else {
				//horde api needs to constantly poll to see if response is done
				console.log("async request: started for pending id " + pending_response_id);
				poll_in_progress = true;
				fetch(horde_polling_endpoint + "/" + pending_response_id)
					.then(x => x.json())
					.then(data => {
						if (data.message != null || data.faulted == true || data.is_possible == false) {
							//id not found, or other fault. give up.
							console.log("async request: gave up on failed attempt");
							clear_poll_flags();
							render_gametext();
							show_abort_button(false);
							let errmsg = "Error encountered during Horde text generation!\n";
							if (data.message != null) {
								errmsg += data.message;
							}
							if (data.faulted == true) {
								errmsg += "Fault encountered during text generation.";
							}
							if (data.is_possible == false) {
								errmsg += "No workers were able to generate text with your request.";
							}
							msgbox(errmsg);
						} else {
							if (data.done == true) {
								//complete, fetch final results. we wait 0.5s more as kudos may take time to calculate
								setTimeout(() => {
									console.log("fetching completed generation for " + pending_response_id);
									fetch(horde_output_endpoint + "/" + pending_response_id)
										.then(x => x.json())
										.then(data => {
											console.log("Finished " + pending_response_id + ": " + JSON.stringify(data));
											pending_response_id = "";
											poll_in_progress = false;
											horde_poll_nearly_completed = false;
											if (data.generations != null && data.generations.length > 0) {
												let gentxt = data.generations[0].text;
												let genworker = data.generations[0].worker_name;
												let genmdl = data.generations[0].model;
												let genkudos = data.kudos;
												if (waiting_for_tool_call == 2) {
													handle_incoming_searchsummary(gentxt);
												} else if (waiting_for_tool_call == 1) {
													handle_incoming_autosummary(gentxt);
												} else {
													last_reply_was_empty = gentxt == "" || gentxt.trim() == "";
													let was_retry_in_progress = retry_in_progress;
													handle_incoming_text(gentxt, genworker, genmdl, genkudos);
													if (gentxt == "" && was_retry_in_progress) {
														retry_in_progress = was_retry_in_progress;
														restore_retried_text(); //horde only: this handles the case when the retry returned empty text, we restore the old text
													}
												}
											}
											render_gametext();
											show_abort_button(false);
										}).catch((error) => {
											console.error("Error:", error);
											clear_poll_flags();
											render_gametext();
											show_abort_button(false);
											msgbox("Error encountered during text generation!\n" + error);
										});
								}, 500);
							} else {
								//still waiting, do nothing until next poll
								poll_in_progress = false;
								horde_poll_nearly_completed = false;
								//depending on the queue_position, set loader color
								let mtl = document.getElementById("maintxtloader");
								if (mtl) {
									mtl.classList.remove("greenloader");
									mtl.classList.remove("redloader");
									if (data.queue_position > 0) {
										mtl.classList.add("redloader");
									} else if (data.processing == 1 && data.queue_position == 0) {
										mtl.classList.add("greenloader");
										if (data.wait_time < 5) {
											horde_poll_nearly_completed = true;
										}
									}
									let oln = document.getElementById("outerloadernum");
									if (oln) {
										oln.innerText = data.queue_position == 0 ? "" : data.queue_position;
									}
								}
								console.log("Still awaiting " + pending_response_id + ": " + JSON.stringify(data));
							}
						}
					}).catch((error) => {
						console.error("Error:", error);
						clear_poll_flags();
						render_gametext();
						show_abort_button(false);
						msgbox("Error encountered during text generation!\n" + error);
					});
			}
		}
	}
}

var gametext_focused = false;
function click_gametext() {
	if (document.getElementById("allowediting").checked) {
		const isSupported = typeof window.getSelection !== "undefined";
		if (isSupported) {
			gametext_focused = true;
			warn_unsaved = true;
			const selection = window.getSelection();
			let foundparent = null;
			if (
				selection.focusNode != null && selection.focusNode.parentElement != null
				&& selection.focusNode.parentElement.classList.contains("txtchunk")
			) {
				foundparent = selection.focusNode.parentElement;
			} else if (
				selection.focusNode != null && selection.focusNode.parentElement != null
				&& selection.focusNode.parentElement.parentElement != null
				&& selection.focusNode.parentElement.parentElement.classList.contains("txtchunk")
			) {
				//double nested
				foundparent = selection.focusNode.parentElement.parentElement;
			}
			if (foundparent) {
				if (prev_hl_chunk != null) {
					prev_hl_chunk.classList.remove("hlchunk");
				}
				prev_hl_chunk = foundparent;
				prev_hl_chunk.classList.add("hlchunk");
			}

			idle_timer = 0;
		}
	}
}

function stash_image_placeholders(text, addspan) {
	text = text.replace(/\[<\|p\|.+?\|p\|>\]/g, function(m) {
		if (!addspan) {
			return m;
		}
		return `<span class=\"color_pink\">` + m + `</span>`;
	});
	text = text.replace(/\[<\|d\|.+?\|d\|>\]/g, function(m) {
		let inner = m.substring(5, m.length - 5);
		let imghash = cyrb_hash(inner);
		img_hash_to_b64_lookup[imghash] = m;
		let hashtag = `{{[IMG_${imghash}_REF]}}`;
		if (!addspan) {
			return hashtag;
		}
		return `<span class=\"color_pink\">${hashtag}</span>`;
	});
	return text;
}

function unstash_image_placeholders(text) {
	return text.replace(/{{\[IMG_.{1,8}_REF\]}}/g, function(m) {
		let imghash = m.substring(7, m.length - 7);
		if (!imghash) {
			return m;
		}
		let unstash = img_hash_to_b64_lookup[imghash];
		if (!unstash) {
			return m;
		}
		return unstash;
	});
}

function merge_edit_field() {
	gametext_focused = false;
	if (gametext_arr.length > 0 && document.getElementById("allowediting").checked) {
		let oldInnerText = concat_gametext(false, "", "", "");
		let gametext_elem = document.getElementById("gametext");
		let editedmatcher = unstash_image_placeholders(gametext_elem.innerText);

		if (oldInnerText != editedmatcher) {
			gametext_arr = [];
			redo_arr = [];
			last_reply_was_empty = false;
			retry_prev_text = [];
			retry_preserve_last = false;
			redo_prev_text = [];

			//stash images
			gametext_elem.querySelectorAll("div.storyimgcenter,div.storyimgsidevertical,div.storyimgsidehorizontal,div.storyimgfloat").forEach(
				(el) => {
					let chimg = el.getElementsByTagName("img")[0];
					if (el && chimg) {
						el.replaceWith((chimg.alt == null || chimg.alt == "") ? ("[<|d|" + chimg.src + "|d|>]") : ("[<|p|" + chimg.alt + "|p|>]"));
					}
				},
			);

			//replace b64 image placeholders
			gametext_elem.innerHTML = unstash_image_placeholders(gametext_elem.innerHTML);

			let editedChunks = []; //use to count chunk lengths before merging
			gametext_elem.querySelectorAll("span.txtchunk").forEach(
				(el) => {
					editedChunks.push(el.innerText);
				},
			);

			//strip chunks (optimize for firefox by not constantly modifying dom)
			let htmlstr = gametext_elem.innerHTML;
			htmlstr = htmlstr.replace(/<span class="(.+?)">(.+?)<\/span>/g, "$2");
			htmlstr = htmlstr.replace(/<span class="(.+?)">(.+?)<\/span>/g, "$2");
			htmlstr = replaceAll(htmlstr, "<div><br><br><br></div>", "<br><br><br>");
			htmlstr = replaceAll(htmlstr, "<div><br><br></div>", "<br><br>");
			htmlstr = replaceAll(htmlstr, "<div><br></div>", "<br>");
			gametext_elem.innerHTML = htmlstr;

			//rather than dump it all into one history, let's split it into paragraphs
			let fullmergedstory = gametext_elem.innerText;

			//if it ends with a single newline, remove it to avoid ghost newlines
			if (fullmergedstory.endsWith("\n") && !fullmergedstory.endsWith("\n\n")) {
				fullmergedstory = fullmergedstory.slice(0, -1);
			}

			let newestChunk = "";
			if (editedChunks.length > 1) { //split by chunk lengths in reverse order, we only want the newest
				let cl = editedChunks[editedChunks.length - 1].length;
				if (cl > 0) {
					newestChunk = fullmergedstory.slice(-cl);
					fullmergedstory = fullmergedstory.slice(0, -cl);
				}
			}

			//split by newlines for the rest
			if (fullmergedstory.length > 0) {
				let splittertoken = "\n";
				if (fullmergedstory.includes("\n\n")) {
					splittertoken = "\n\n";
				}
				let splitmergedstory = fullmergedstory.split(splittertoken);
				for (var i = 0; i < splitmergedstory.length; ++i) {
					if (i != 0) {
						gametext_arr.push(splittertoken + splitmergedstory[i]);
					} else {
						gametext_arr.push(splitmergedstory[i]);
					}
				}
			}
			if (newestChunk != "") {
				//little hack to merge a row with only a newline into the last chunk
				if (gametext_arr.length > 0 && gametext_arr[gametext_arr.length - 1] == "\n") {
					gametext_arr[gametext_arr.length - 1] += newestChunk;
				} else {
					gametext_arr.push(newestChunk);
				}
			}

			render_gametext();
			sync_multiplayer(false);
			console.log("Merged edit field. Parts:" + gametext_arr.length);
		}

		if (prev_hl_chunk != null) {
			prev_hl_chunk.classList.remove("hlchunk");
			prev_hl_chunk = null;
		}
	}
}

var insertAIVisionImages = []; //concat gametext will populate this
function concat_gametext(
	stripimg = false,
	stripimg_replace_str = "",
	append_before_segment = "",
	append_after_segment = "",
	escapeTxt = false,
	insertAIVision = false,
) {
	let fulltxt = "";
	for (let i = 0; i < gametext_arr.length; ++i) {
		let extracted = gametext_arr[i];
		if (escapeTxt) {
			extracted = escape_html(extracted);
		}
		if (extracted.trim() == "" || extracted.trim() == "\n") {
			fulltxt += extracted;
		} else {
			fulltxt += append_before_segment + extracted + append_after_segment;
		}
	}
	//unscape special sequences
	if (escapeTxt) {
		fulltxt = fulltxt.replace(/\[&lt;\|p\|.+?\|p\|&gt;\]/g, function(m) {
			return unescape_html(m);
		});
		fulltxt = fulltxt.replace(/\[&lt;\|d\|.+?\|d\|&gt;\]/g, function(m) {
			return unescape_html(m);
		});
		fulltxt = fulltxt.replace(/\[&lt;\|.+?\|&gt;\]/g, function(m) {
			return unescape_html(m);
		});
		fulltxt = fulltxt.replace(/\n\n&gt; /g, function(m) {
			return unescape_html(m);
		});
		if (localsettings.opmode == 3 && localsettings.chatname != "" && localsettings.chatopponent != "") {
			let a = escape_html(localsettings.chatname);
			fulltxt = replaceAll(fulltxt, a, localsettings.chatname);

			//unescape other chat opponents too (match anything that is NOT us)
			var regex = new RegExp("\n(?!" + localsettings.chatname + ").+?\: ", "gi");
			fulltxt = fulltxt.replace(regex, function(m) {
				return unescape_html(m);
			});
		}
		if (localsettings.opmode == 4 && localsettings.instruct_starttag != "" && localsettings.instruct_endtag != "") {
			let a = escape_html(get_instruct_starttag(false));
			let b = escape_html(get_instruct_endtag(false));
			fulltxt = replaceAll(fulltxt, a, get_instruct_starttag(false));
			fulltxt = replaceAll(fulltxt, b, get_instruct_endtag(false));
			if (localsettings.separate_end_tags) {
				if (get_instruct_endtag_end(true)) {
					let a = escape_html(get_instruct_endtag_end(false));
					fulltxt = replaceAll(fulltxt, a, get_instruct_endtag_end(false));
				}
				if (get_instruct_starttag_end(true)) {
					let a = escape_html(get_instruct_starttag_end(false));
					fulltxt = replaceAll(fulltxt, a, get_instruct_starttag_end(false));
				}
			}
		}
	}
	if (stripimg) {
		if (insertAIVision) {
			insertAIVisionImages = []; //a bit hacky
			fulltxt = fulltxt.replace(/\[<\|d\|.+?\|d\|>\]/g, function(m) {
				// m here means the whole matched string
				let inner = m.substring(5, m.length - 5);
				let imghash = cyrb_hash(inner);
				let foundmeta = completed_imgs_meta[imghash];
				if (foundmeta != null) {
					if (foundmeta.desc && (foundmeta.visionmode == 1 || foundmeta.visionmode == 2)) {
						return "\n(Attached Image: " + foundmeta.desc + ")\n";
					} else if (foundmeta.visionmode == 3) {
						let parts = inner.split(",");
						if (parts.length === 2 && parts[0].startsWith("data:image")) {
							insertAIVisionImages.push(parts[1]);
						}
						return "\n(Attached Image)\n";
					}
				}
				return "";
			});
		}
		fulltxt = fulltxt.replace(/\[<\|p\|.+?\|p\|>\]/g, stripimg_replace_str);
		fulltxt = fulltxt.replace(/\[<\|d\|.+?\|d\|>\]/g, stripimg_replace_str);

		//always filter comments - new format
		fulltxt = fulltxt.replace(/\[<\|[\s\S]+?\|>\]/g, ""); //remove normal comments too
	}
	return fulltxt;
}

function migrate_old_images_in_gametext() {
	let oldctx = concat_gametext(false, "", "", "", false);
	//if we have no new images
	if (!(/\[<\|p\|.+?\|p\|>\]/.test(oldctx)) && !(/\[<\|d\|.+?\|d\|>\]/.test(oldctx))) {
		//but we also have old images
		if ((/<\|p\|.+?\|p\|>/.test(oldctx)) || (/<\|d\|.+?\|d\|>/.test(oldctx))) {
			console.log("Migrating old images from saved story");
			for (let i = 0; i < gametext_arr.length; ++i) {
				gametext_arr[i] = gametext_arr[i].replace(/<\|p\|.+?\|p\|>/g, function(m) {
					return "[" + m + "]";
				});
				gametext_arr[i] = gametext_arr[i].replace(/<\|d\|.+?\|d\|>/g, function(m) {
					return "[" + m + "]";
				});
			}
		}
	}
}

function update_pending_stream_displays() {
	//lightweight function to only update pending streamed text
	var elements = document.querySelectorAll(".pending_text");

	if (elements && elements.length > 0) {
		elements.forEach(function(element) {
			element.innerHTML = escape_html(pending_context_preinjection) + format_streaming_text(escape_html(synchro_pending_stream));
		});
	} else {
		render_gametext(false);
	}

	handle_autoscroll(false);
}

var allow_reenable_submitbtn_timestamp = performance.now();
function update_submit_button(full_update) {
	if (perfdata == null) {
		if (full_update) {
			document.getElementById("btnsend").disabled = true;
			document.getElementById("btnsend").classList.add("wait");
			document.getElementById("btnsend").classList.remove("btn-primary");
			document.getElementById("btnsend").innerHTML = "Offline";
		}
	} else if (selected_models.length == 0 && selected_workers.length == 0) {
		if (full_update) {
			document.getElementById("btnsend").disabled = true;
			document.getElementById("btnsend").classList.add("wait");
			document.getElementById("btnsend").classList.remove("btn-primary");
			document.getElementById("btnsend").innerHTML = "No AI<br>Loaded";
		}
	} else if (pending_response_id == "" && performance.now() >= allow_reenable_submitbtn_timestamp) {
		if (full_update) {
			document.getElementById("btnsend").disabled = false;
			document.getElementById("btnsend").classList.remove("wait");
			document.getElementById("btnsend").classList.add("btn-primary");
		}
		if (
			gametext_arr.length > 0 && document.getElementById("input_text").value == "" && document.getElementById("cht_inp").value == ""
			&& document.getElementById("corpo_cht_inp").value == ""
		) {
			document.getElementById("btnsend").innerHTML = "Generate<br>More";
		} else {
			document.getElementById("btnsend").innerHTML = "Submit";
		}
		document.getElementById("chat_msg_send_btn").classList.remove("showmic");
		document.getElementById("chat_msg_send_btn").classList.remove("showmiclive");
		document.getElementById("chat_msg_send_btn").classList.remove("showmicoff");
		if (voice_typing_mode > 0 && is_using_kcpp_with_whisper()) {
			if (voice_is_processing) {
				document.getElementById("chat_msg_send_btn").classList.add("showmicoff");
				document.getElementById("btnsend").innerHTML = "<div class='showmicoffbig'></div><span style='font-size:12px'>Busy</span>";
			} else if (voice_is_recording) {
				document.getElementById("chat_msg_send_btn").classList.add("showmiclive");
				document.getElementById("btnsend").innerHTML = "<div class='showmiclivebig'></div><span style='font-size:12px'>Record</span>";
			} else if (ready_to_record()) {
				document.getElementById("chat_msg_send_btn").classList.add("showmic");
				document.getElementById("btnsend").innerHTML = "<div class='showmicbig'></div><span style='font-size:12px'>"
					+ (voice_typing_mode == 1 ? "Standby" : "PTT") + "</span>";
			} else {
				document.getElementById("chat_msg_send_btn").classList.add("showmicoff");
				document.getElementById("btnsend").innerHTML = "<div class='showmicoffbig'></div><span style='font-size:12px'>Busy</span>";
			}
		}
	} else {
		if (full_update) {
			document.getElementById("btnsend").disabled = true;
			document.getElementById("btnsend").classList.add("wait");
			document.getElementById("btnsend").classList.remove("btn-primary");
			let oldspinnerhtml = document.getElementById("btnsend").innerHTML;
			let newspinnerhtml =
				'<div class="outerloader"><div id="outerloadernum" class="outerloadernum"></div><div id="maintxtloader" class="innerloader"></div></div>';
			if (oldspinnerhtml != newspinnerhtml) {
				//prevent resetting animation
				document.getElementById("btnsend").innerHTML = newspinnerhtml;
			}
		}
	}
	document.getElementById("corpo_chat_send_btn").disabled = document.getElementById("chat_msg_send_btn").disabled = document.getElementById(
		"btnsend",
	).disabled;
}

function handle_autoscroll(alwaysscroll = true) {
	if (localsettings.autoscroll) {
		let box1 = document.getElementById("gametext");
		let box2 = document.getElementById("chat_msg_body");
		let box3 = document.getElementById("corpostylemain");
		function isScrolledToBottom(element) {
			return element.scrollHeight - element.scrollTop <= element.clientHeight + 250;
		}
		if (alwaysscroll || isScrolledToBottom(box1)) {
			box1.scrollTop = box1.scrollHeight - box1.clientHeight + 10;
		}
		if (alwaysscroll || isScrolledToBottom(box2)) {
			box2.scrollTop = box2.scrollHeight - box2.clientHeight + 10;
		}
		if (alwaysscroll || isScrolledToBottom(box3)) {
			box3.scrollTop = box3.scrollHeight - box3.clientHeight + 10;
		}
	}
}

function render_gametext(save = true, force_scroll = true) {
	document.getElementById("gametext").contentEditable = document.getElementById("allowediting").checked && pending_response_id == "";
	let inEditMode = document.getElementById("allowediting").checked ? true : false;

	//adventure mode has a toggle to choose action mode
	document.getElementById("adventure_mode_img").classList.remove("input_story");
	document.getElementById("adventure_mode_img").classList.remove("input_action");
	document.getElementById("adventure_mode_img").classList.remove("input_dice");
	document.getElementById("btnmode_chat").classList.add("hidden");
	document.getElementById("btnmode_adventure").classList.add("hidden");
	if (localsettings.opmode == 2) {
		document.getElementById("inputrow").classList.add("show_mode");
		if (localsettings.adventure_switch_mode == 0) {
			document.getElementById("adventure_mode_txt").innerText = "Story";
			document.getElementById("adventure_mode_img").classList.add("input_story");
		} else if (localsettings.adventure_switch_mode == 1) {
			document.getElementById("adventure_mode_txt").innerText = "Action";
			document.getElementById("adventure_mode_img").classList.add("input_action");
		} else {
			document.getElementById("adventure_mode_txt").innerText = "Action\n(Roll)";
			document.getElementById("adventure_mode_img").classList.add("input_dice");
		}
		document.getElementById("btnmode_adventure").classList.remove("hidden");
	} else if ((localsettings.opmode == 3 && localsettings.chatopponent != "") || localsettings.opmode == 4) {
		document.getElementById("inputrow").classList.add("show_mode");
		document.getElementById("btnmode_chat").classList.remove("hidden");
	} else {
		document.getElementById("inputrow").classList.remove("show_mode");
	}
	populate_corpo_leftpanel_topper();

	if (gametext_arr.length == 0 && synchro_pending_stream == "" && pending_response_id == "") {
		if (perfdata == null) {
			if (document.getElementById("connectstatus").innerHTML == "Offline Mode") {
				document.getElementById("gametext").innerHTML =
					'Welcome to <span class="color_cyan">KoboldAI Lite</span>!<br>You are in <span class="color_red">Offline Mode</span>.<br>You will still be able to load and edit stories, but not generate new text.';
			} else {
				document.getElementById("gametext").innerHTML =
					'Welcome to <span class="color_cyan">KoboldAI Lite</span>!<br><span class="color_orange">Attempting to Connect...</span>';
			}
		} else {
			let whorun = "";

			if (custom_kobold_endpoint != "") {
				whorun = '<br>You\'re using the custom KoboldAI endpoint at <span class="color_orange">' + custom_kobold_endpoint + "</span>";
			} else if (custom_oai_key != "") {
				whorun = "<br>You're using the OpenAI API";
			} else if (custom_claude_key != "") {
				whorun = "<br>You're using the Claude API";
			} else if (custom_gemini_key != "") {
				whorun = "<br>You're using the Gemini API";
			} else if (custom_cohere_key != "") {
				whorun = "<br>You're using the Cohere API";
			} else {
				whorun = `<br>Horde <a class="color_green mainnav" href="#" tabindex="${
					mainmenu_is_untab ? `-1` : `0`
				}" onclick="get_and_show_workers()">Volunteer(s)</a> are running <span class="color_orange">${
					selected_models.reduce((s, a) => s + a.count, 0)
				} threads</span> for selected models with a total queue length of <span class="color_orange">${
					selected_models.reduce((s, a) => s + a.queued, 0)
				}</span> tokens`;
			}
			let nowmode = localsettings.opmode == 1
				? "Story Mode"
				: (localsettings.opmode == 2 ? "Adventure Mode" : (localsettings.opmode == 3 ? "Chat Mode" : "Instruct Mode"));
			let selmodelstr = "";
			const maxmodelnames = 7;
			if (selected_models.length > maxmodelnames) {
				let shortenedarr = selected_models.slice(0, maxmodelnames - 1);
				selmodelstr = shortenedarr.reduce((s, a) => s + (s == "" ? "" : ", ") + a.name, "") + " and "
					+ (selected_models.length - (maxmodelnames - 1)) + " others";
			} else {
				selmodelstr = selected_models.reduce((s, a) => s + (s == "" ? "" : ", ") + a.name, "");
			}

			document.getElementById("gametext").innerHTML = `Welcome to <span class="color_cyan">KoboldAI Lite</span>!`
				+ `<br>You are using the models <span class="color_green">${selmodelstr}</span>${(selected_workers.length == 0
					? ``
					: ` (Pinned to ${selected_workers.length} worker IDs)`)}.`
				+ `${whorun}.`
				+ (multiplayer_active
					? (!multiplayer_pinged
						? `<br><br><span class="color_orange">[ Trying to join Multiplayer... ]</span>`
						: `<br><br><span class="color_green">[ Multiplayer is <b>Active</b>! This session is shared with other server participants.]<br>[ You can leave via exit button in top right corner. ]</span>`)
					: (is_using_kcpp_with_multiplayer()
						? `<br><br>[ <a href="#" tabindex="${
							mainmenu_is_untab ? `-1` : `0`
						}" class="color_blueurl mainnav" onclick="join_multiplayer()"><span class="color_green">Multiplayer Available</span> - Click Here To Join</a> ]`
						: ``))
				+ `<br><br><b><span class="color_orange">${nowmode} Selected</span></b> - Enter a prompt below to begin!`
				+ `<br>Or, <a href="#" tabindex="${
					mainmenu_is_untab ? `-1` : `0`
				}" class="color_blueurl mainnav" onclick="document.getElementById('loadfileinput').click()">load a <b>JSON File</b> or a <b>Character Card</b> here.</a>`
				+ `<br>Or, <a href="#" tabindex="${
					mainmenu_is_untab ? `-1` : `0`
				}" class="color_blueurl mainnav" onclick="display_scenarios()">select a <b>Quick Start Scenario</b> here.</a>`
				+ `<br>${(welcome != "" ? `<br><em>${escape_html(welcome)}</em>` : ``)}`;
		}

		//kick out of edit mode
		if (document.getElementById("allowediting").checked) {
			document.getElementById("allowediting").checked = inEditMode = false;
			toggle_editable();
		}
	} else {
		let fulltxt = "";
		if (inEditMode) {
			fulltxt = concat_gametext(false, "", "%SpnStg%", "%SpnEtg%", true);
		} else {
			fulltxt = concat_gametext(false, "", "", "", true);
			fulltxt = apply_display_only_regex(fulltxt);
			fulltxt = replace_placeholders(fulltxt, true);
		}

		if (localsettings.opmode == 4 && !inEditMode) {
			//accept all newline formats for backwards compatibility
			fulltxt = replaceAll(fulltxt, "\n\n" + get_instruct_starttag(true) + "\n\n", `%SpcStg%`);
			fulltxt = replaceAll(fulltxt, "\n\n" + get_instruct_endtag(true) + "\n\n", `%SpcEtg%`);
			fulltxt = replaceAll(fulltxt, "\n" + get_instruct_starttag(true) + "\n", `%SpcStg%`);
			fulltxt = replaceAll(fulltxt, "\n" + get_instruct_endtag(true) + "\n", `%SpcEtg%`);
			fulltxt = replaceAll(fulltxt, get_instruct_starttag(false), `%SpcStg%`);
			fulltxt = replaceAll(fulltxt, get_instruct_endtag(false), `%SpcEtg%`);
			fulltxt = replaceAll(fulltxt, get_instruct_starttag(true), `%SpcStg%`);
			fulltxt = replaceAll(fulltxt, get_instruct_endtag(true), `%SpcEtg%`);
			if (localsettings.separate_end_tags) {
				if (get_instruct_endtag_end(true)) {
					fulltxt = replaceAll(fulltxt, get_instruct_endtag_end(false), ``);
					fulltxt = replaceAll(fulltxt, get_instruct_endtag_end(true), ``);
				}
				if (get_instruct_starttag_end(true)) {
					fulltxt = replaceAll(fulltxt, get_instruct_starttag_end(false), ``);
					fulltxt = replaceAll(fulltxt, get_instruct_starttag_end(true), ``);
				}
			}

			let instruct_turns = repack_instruct_turns(fulltxt, `%SpcStg%`, `%SpcEtg%`, true);
			fulltxt = "";
			for (let i = 0; i < instruct_turns.length; ++i) {
				let curr = instruct_turns[i];
				let currmsg = curr.msg;
				if (
					localsettings.instruct_has_markdown
					&& (localsettings.render_streaming_markdown || synchro_pending_stream == "" || (i + 1) < instruct_turns.length)
				) {
					//if a list has a starttag on the same line, add a newline before it
					currmsg = currmsg.replace(/(\n[-*] .+?)(%SpcStg%)/g, "$1\n$2");
					let codeblockcount = (currmsg.match(/```/g) || []).length;
					if (codeblockcount > 0 && codeblockcount % 2 != 0) {
						currmsg += "```"; //force end code block
					}
					currmsg = simpleMarkdown(currmsg, localsettings.instruct_has_latex);
				}

				if (curr.myturn) {
					fulltxt +=
						`<hr style="margin-top: 12px; margin-bottom: 12px;"><span class="color_cyan"><img src="${human_square}" style="height:38px;width:auto;padding:3px 6px 3px 3px;border-radius: 8%;"/>${currmsg}</span>`;
				} else {
					if (i == 0) {
						fulltxt += `${currmsg}`;
					} else {
						fulltxt +=
							`<hr style="margin-top: 12px; margin-bottom: 12px;"><img src="${niko_square}" style="height:38px;width:auto;padding:3px 6px 3px 3px;border-radius: 8%;"/>${currmsg}</span>`;
					}
				}
			}

			//apply stylization to time tags
			if (localsettings.inject_timestamps && localsettings.instruct_has_markdown) {
				fulltxt = fulltxt.replace(/(\[\d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2} [AP]M\])/g, "$1\n");
			}
			if (localsettings.inject_chatnames_instruct && localsettings.instruct_has_markdown) {
				let m_name = localsettings.chatname + ": ";
				fulltxt = replaceAll(fulltxt, m_name, `<b>` + escape_html(m_name) + `</b>`);
				let m_opps = localsettings.chatopponent.split("||$||");
				for (let i = 0; i < m_opps.length; ++i) {
					if (m_opps[i] && m_opps[i].trim() != "") {
						let m_opp = m_opps[i] + ": ";
						fulltxt = replaceAll(fulltxt, m_opp, `<b>` + escape_html(m_opp) + `</b>`);
					}
				}
			}
		} else {
			fulltxt = replaceAll(fulltxt, get_instruct_starttag(true), `%SclStg%` + escape_html(get_instruct_starttag(true)) + `%SpnEtg%`);
			fulltxt = replaceAll(fulltxt, get_instruct_endtag(true), `%SclStg%` + escape_html(get_instruct_endtag(true)) + `%SpnEtg%`);
			if (localsettings.separate_end_tags) {
				if (get_instruct_starttag_end(true) != "") {
					fulltxt = replaceAll(
						fulltxt,
						get_instruct_starttag_end(true),
						`%SclStg%` + escape_html(get_instruct_starttag_end(true)) + `%SpnEtg%`,
					);
				}
				if (get_instruct_endtag_end(true) != "") {
					fulltxt = replaceAll(
						fulltxt,
						get_instruct_endtag_end(true),
						`%SclStg%` + escape_html(get_instruct_endtag_end(true)) + `%SpnEtg%`,
					);
				}
			}
			//failsafe to handle removing newline tags
			fulltxt = replaceAll(fulltxt, instructstartplaceholder.trim(), `%SclStg%` + instructstartplaceholder.trim() + `%SpnEtg%`);
			fulltxt = replaceAll(fulltxt, instructendplaceholder.trim(), `%SclStg%` + instructendplaceholder.trim() + `%SpnEtg%`);
			fulltxt = replaceAll(fulltxt, instructstartplaceholder_end.trim(), `%SclStg%` + instructstartplaceholder_end.trim() + `%SpnEtg%`);
			fulltxt = replaceAll(fulltxt, instructendplaceholder_end.trim(), `%SclStg%` + instructendplaceholder_end.trim() + `%SpnEtg%`);

			if (get_instruct_systag(true) != "") {
				fulltxt = replaceAll(fulltxt, get_instruct_systag(true), `%SclStg%` + escape_html(get_instruct_systag(true)) + `%SpnEtg%`);
				if (get_instruct_systag_end(true) != "") {
					fulltxt = replaceAll(
						fulltxt,
						get_instruct_systag_end(true),
						`%SclStg%` + escape_html(get_instruct_systag_end(true)) + `%SpnEtg%`,
					);
				}
			}
			fulltxt = replaceAll(fulltxt, instructsysplaceholder.trim(), `%SclStg%` + instructsysplaceholder.trim() + `%SpnEtg%`);
			fulltxt = replaceAll(fulltxt, instructsysplaceholder_end.trim(), `%SclStg%` + instructsysplaceholder_end.trim() + `%SpnEtg%`);
		}

		//this is a hacky fix to handle instruct tags that use arrow brackets only
		fulltxt = replaceAll(fulltxt, `%SpnStg%`, `<span class=\"txtchunk\">`);
		fulltxt = replaceAll(fulltxt, `%SclStg%`, `<span class=\"color_gray\">`);
		fulltxt = replaceAll(fulltxt, `%SpnEtg%`, `</span>`);

		if (localsettings.opmode == 3) {
			if (!document.getElementById("allowediting").checked && !fulltxt.startsWith("\n")) {
				fulltxt = "\n" + fulltxt;
			}

			//for chat mode, highlight our name in blue and opponent in red
			let m_name = "\n" + localsettings.chatname + ": ";

			//match anything that is NOT us, ie. opponents
			var regex = new RegExp("\n(?!" + localsettings.chatname + ").+?\: ", "gi");
			let colormap = {}, colidx = 0;
			fulltxt = fulltxt.replace(regex, function(m) {
				let oname = escape_html(m);
				let onametrim = oname.trim();
				if (colormap[onametrim] == null) {
					colormap[onametrim] = get_unique_color(colidx);
					++colidx;
				}
				return `<span class="` + colormap[onametrim] + `">` + oname + `</span>`;
			});
			fulltxt = replaceAll(fulltxt, m_name, `<span class="color_blue">` + escape_html(m_name) + `</span>`);
		}

		//for adventure mode, highlight our actions in green
		if (localsettings.opmode == 2) {
			fulltxt = fulltxt.replace(/\n\n\> .+?\n/g, function(m) {
				return `<span class="color_green">` + m + `</span>`;
			});
		}

		//streaming display
		if (synchro_pending_stream != "" && waiting_for_tool_call == 0) {
			fulltxt += `<span class="color_yellow pending_text">${
				escape_html(pending_context_preinjection) + format_streaming_text(escape_html(synchro_pending_stream))
			}</span>`;
		}

		if (!inEditMode) {
			let floatimg = localsettings.opmode != 4;

			//handle images
			fulltxt = render_all_image_html(fulltxt, floatimg, false);
		} else {
			fulltxt = stash_image_placeholders(fulltxt, true);
		}

		fulltxt = fulltxt.replace(/(\r\n|\r|\n)/g, "<br>");

		//if ends with a single <br> and nothing else, trim it
		if (fulltxt.endsWith("<br>") && !fulltxt.endsWith("<br><br>")) {
			fulltxt = fulltxt.slice(0, -4);
		}

		//console.log("FT:" + fulltxt);
		if (fulltxt == "" && gametext_arr.length == 0 && synchro_pending_stream == "" && pending_response_id != "") {
			fulltxt = "Generating...";
		}
		document.getElementById("gametext").innerHTML = fulltxt;
	}

	if (localflag && is_using_kcpp_with_admin()) {
		document.getElementById("topbtn_admin").classList.remove("hidden");
	} else {
		document.getElementById("topbtn_admin").classList.add("hidden");
	}

	if (!localsettings.sidepanel_mode && (perfdata == null || selected_models.length != 0)) {
		document.getElementById("topbtn_settings").classList.remove("hidden");
		document.getElementById("btn_actmem").classList.remove("hidden");
	} else {
		document.getElementById("topbtn_settings").classList.add("hidden");
		document.getElementById("btn_actmem").classList.add("hidden");
	}

	if (perfdata == null) {
		document.getElementById("topbtn_reconnect").classList.remove("hidden");
		if (localflag) {
			document.getElementById("topbtn_customendpt").classList.add("hidden");
		} else {
			document.getElementById("topbtn_customendpt").classList.remove("hidden");
		}
		if (localsettings.show_endpoint_selector) {
			document.getElementById("topbtn_ai").classList.remove("hidden");
		} else {
			document.getElementById("topbtn_ai").classList.add("hidden");
		}

		document.getElementById("topbtn_newgame").classList.remove("hidden");
		document.getElementById("topbtn_save_load").classList.remove("hidden");
		document.getElementById("topbtn_scenarios").classList.add("hidden");
		document.getElementById("topbtn_quickplay").classList.add("hidden");
	} else {
		document.getElementById("topbtn_reconnect").classList.add("hidden");
		document.getElementById("topbtn_customendpt").classList.add("hidden");

		if (localflag && !localsettings.show_endpoint_selector) {
			document.getElementById("topbtn_ai").classList.add("hidden");
		} else {
			document.getElementById("topbtn_ai").classList.remove("hidden");
		}

		if (selected_models.length == 0) {
			document.getElementById("topbtn_newgame").classList.add("hidden");
			document.getElementById("topbtn_save_load").classList.add("hidden");
			document.getElementById("topbtn_scenarios").classList.add("hidden");
			document.getElementById("topbtn_quickplay").classList.remove("hidden");
		} else {
			document.getElementById("topbtn_newgame").classList.remove("hidden");
			document.getElementById("topbtn_save_load").classList.remove("hidden");
			document.getElementById("topbtn_scenarios").classList.remove("hidden");
			document.getElementById("topbtn_quickplay").classList.add("hidden");
		}
	}

	if (is_using_kcpp_with_multiplayer()) {
		if (multiplayer_active) {
			document.getElementById("connectstatusmultiplayer").classList.remove("hidden");
			document.getElementById("topbtn_multiplayer_join").classList.add("hidden");
			document.getElementById("topbtn_multiplayer_leave").classList.remove("hidden");
		} else {
			document.getElementById("connectstatusmultiplayer").classList.add("hidden");
			document.getElementById("topbtn_multiplayer_join").classList.remove("hidden");
			document.getElementById("topbtn_multiplayer_leave").classList.add("hidden");
		}
	} else {
		document.getElementById("connectstatusmultiplayer").classList.add("hidden");
		document.getElementById("topbtn_multiplayer_join").classList.add("hidden");
		document.getElementById("topbtn_multiplayer_leave").classList.add("hidden");
	}

	if (selected_models.length == 0) { //if no model, disable all first
		document.getElementById("btn_actmem").disabled = true;
		document.getElementById("btn_actundo").disabled = true;
		document.getElementById("btn_actredo").disabled = true;
		document.getElementById("btn_actretry").disabled = true;
		if (perfdata == null) { //allow these 2 in offline mode
			document.getElementById("btn_actmem").disabled = false;
		}
	} else {
		document.getElementById("btn_actmem").disabled = false;
		document.getElementById("btn_actundo").disabled = false;
		document.getElementById("btn_actredo").disabled = false;
		document.getElementById("btn_actretry").disabled = false;
	}

	if (perfdata == null) {
		document.getElementById("fvico").href = favivon_normal;
	} else if (selected_models.length == 0 && selected_workers.length == 0) {
		let perfinfo = `There are <span class="color_orange">${perfdata.worker_count}</span> total <a class="color_green mainnav" tabindex="${
			mainmenu_is_untab ? `-1` : `0`
		}" href="#" onclick="get_and_show_workers()">volunteer(s)</a> in the AI Horde, and <span class="color_orange">${perfdata.queued_requests}</span> request(s) in queues.<br>A total of <span class="color_orange">${perfdata.past_minute_tokens}</span> tokens were generated in the last minute.<br><br>`;
		document.getElementById("gametext").innerHTML =
			`Welcome to <span class="color_cyan">KoboldAI Lite</span>!<br><br>${perfinfo}<a href="#" class="color_blueurl" onclick="display_endpoint_container()">Please select an AI service to use!</a><br>`;
		document.getElementById("fvico").href = favivon_normal;
	} else if (pending_response_id == "") {
		document.getElementById("fvico").href = favivon_normal;
	} else {
		document.getElementById("fvico").href = favicon_busy;
	}

	// Render onto enhanced chat interface if selected.
	let isAestheticUiStyle = is_aesthetic_ui();
	let isCorpoUiStyle = is_corpo_ui();

	if (!inEditMode && isCorpoUiStyle) {
		if (gametext_arr.length == 0) {
			document.getElementById("corpo_body").innerHTML = render_corpo_welcome();
		} else {
			let textToRender = concat_gametext(false, "", "", "", true);
			document.getElementById("corpo_body").innerHTML = render_corpo_ui(textToRender);
			corpoedit_resize_input();
		}

		document.getElementById("corpointerface").classList.remove("hidden");
		document.getElementById("enhancedchatinterface").classList.add("hidden");
		document.getElementById("normalinterface").classList.add("hidden");
	} else if (!inEditMode && isAestheticUiStyle) {
		let textToRender = "";
		let prepToGen = gametext_arr.length == 0 && synchro_pending_stream == "" && pending_response_id != "";
		if (gametext_arr.length == 0 && (prepToGen || pending_response_id == "")) {
			textToRender = document.getElementById("gametext").innerHTML;
		} else {
			textToRender = concat_gametext(false, "", "", "", true);
		}
		textToRender = apply_display_only_regex(textToRender);
		textToRender = replace_placeholders(textToRender, true);

		if (localsettings.opmode == 3 && localsettings.gui_type_chat == 1) {
			render_messenger_ui(textToRender);
		} else {
			document.getElementById("chat_msg_body").innerHTML = render_aesthetic_ui(textToRender, false);
		}
		if ((localsettings.opmode == 3 && localsettings.chatopponent != "") || localsettings.opmode == 4 || localsettings.opmode == 2) {
			document.getElementById("cht_inp_bg").classList.add("shorter");
			if (localsettings.opmode == 2) {
				document.getElementById("chat_btnmode_chat").classList.add("hidden");
				document.getElementById("chat_btnmode_adventure").classList.remove("hidden");
				if (localsettings.adventure_switch_mode == 0) {
					document.getElementById("chat_btnmode_adventure").classList.remove("actionmode");
					document.getElementById("chat_btnmode_adventure").classList.remove("dicemode");
					document.getElementById("chat_btnmode_adventure").classList.add("storymode");
				} else if (localsettings.adventure_switch_mode == 1) {
					document.getElementById("chat_btnmode_adventure").classList.add("actionmode");
					document.getElementById("chat_btnmode_adventure").classList.remove("dicemode");
					document.getElementById("chat_btnmode_adventure").classList.remove("storymode");
				} else {
					document.getElementById("chat_btnmode_adventure").classList.remove("actionmode");
					document.getElementById("chat_btnmode_adventure").classList.remove("storymode");
					document.getElementById("chat_btnmode_adventure").classList.add("dicemode");
				}
			} else {
				document.getElementById("chat_btnmode_chat").classList.remove("hidden");
				document.getElementById("chat_btnmode_adventure").classList.add("hidden");
			}
		} else {
			document.getElementById("chat_btnmode_chat").classList.add("hidden");
			document.getElementById("chat_btnmode_adventure").classList.add("hidden");
			document.getElementById("cht_inp_bg").classList.remove("shorter");
		}

		// Show the 'AI is typing' message if an answer is pending, and prevent the 'send button' from being clicked again.
		if (pending_response_id == "") {
			document.getElementById("chatistyping").classList.add("hidden");
			document.getElementById("chat_msg_body").classList.remove("withtyping");
		} else {
			let aiName = (localsettings.opmode == 3 && pending_context_preinjection && pending_context_preinjection.includes(":"))
				? pending_context_preinjection.split(":")[0]
				: "The AI";
			document.getElementById("chataityping").innerText = aiName + " is typing...";
			document.getElementById("chatistyping").classList.remove("hidden");
			document.getElementById("chat_msg_body").classList.add("withtyping");
		}
		document.getElementById("corpo_chat_send_btn").disabled = document.getElementById("chat_msg_send_btn").disabled = document.getElementById(
			"btnsend",
		).disabled;

		document.getElementById("enhancedchatinterface").classList.remove("hidden");
		document.getElementById("normalinterface").classList.add("hidden");
		document.getElementById("corpointerface").classList.add("hidden");
	} else {
		document.getElementById("enhancedchatinterface").classList.add("hidden");
		document.getElementById("corpointerface").classList.add("hidden");
		document.getElementById("normalinterface").classList.remove("hidden");
	}

	if (inEditMode && isCorpoUiStyle) {
		document.getElementById("corpoendedit").classList.remove("hidden");
	} else {
		document.getElementById("corpoendedit").classList.add("hidden");
	}

	update_submit_button(true); //full update for submit button, otherwise just text when not generating

	document.getElementById("btnautogenmem").disabled = document.getElementById("btnsend").disabled;

	if (localsettings.persist_session && save) {
		autosave();
	}

	handle_autoscroll(force_scroll);

	if (localsettings.printer_view) {
		document.getElementById("gamescreen").classList.remove("normal_viewport_height");
		document.getElementById("chat_msg_body").classList.remove("aesthetic_viewport_height");
	} else {
		document.getElementById("gamescreen").classList.add("normal_viewport_height");
		document.getElementById("chat_msg_body").classList.add("aesthetic_viewport_height");
	}

	let maincon = document.getElementById("maincontainer");
	if (is_corpo_ui() || localsettings.viewport_width_mode == 3) { //unlock
		maincon.classList.remove("adaptivecontainer");
		maincon.classList.remove("clampedcontainer");
		maincon.classList.remove("bigclampedcontainer");
	} else if (localsettings.viewport_width_mode == 1) { //clamped
		maincon.classList.remove("adaptivecontainer");
		maincon.classList.add("clampedcontainer");
		maincon.classList.remove("bigclampedcontainer");
	} else if (localsettings.viewport_width_mode == 2) { //bigclamp
		maincon.classList.remove("adaptivecontainer");
		maincon.classList.remove("clampedcontainer");
		maincon.classList.add("bigclampedcontainer");
	} //adaptive
	else {
		maincon.classList.add("adaptivecontainer");
		maincon.classList.remove("clampedcontainer");
		maincon.classList.remove("bigclampedcontainer");
	}

	update_genimg_button_visiblility();
	update_websearch_button_visibility();

	idle_timer = 0;
	document.getElementById("token-budget").innerText = last_token_budget;
	if (websearch_in_progress && localsettings.websearch_enabled && is_using_kcpp_with_websearch()) {
		document.getElementById("searchingtxt").classList.remove("hidden");
	} else {
		document.getElementById("searchingtxt").classList.add("hidden");
	}

	if (localsettings.wordsearch_enabled) {
		document.getElementById("wordsearch_panel").classList.remove("hidden");
	} else {
		document.getElementById("wordsearch_panel").classList.add("hidden");
	}
}

function render_corpo_welcome() {
	return `<div class='corpowelcome'>
		<img src="` + niko_square + `" style="height:80px;width:auto;padding:10px;border-radius: 20%;"/>
		<p>How can I help you today?</p>
		${(welcome != "" ? `<br><div class='corpowelcomesmall'><em>${escape_html(welcome)}</em></div>` : ``)}
		</div>`;
}

function repack_instruct_turns(input, usertag, aitag, allow_blank) {
	let myturnchat = false; //who is currently speaking?
	let chatunits = []; //parse chat body into nice chat chunks

	let combined_chunks = [];
	let turnchunks = input.split(usertag);
	let startoppo = true;
	for (let i = 0; i < turnchunks.length; ++i) {
		let chnk = turnchunks[i];
		if (chnk.trim().length == 0) {
			if (i == 0) {
				startoppo = false;
			}
			continue;
		}
		let turnchunks2 = chnk.split(aitag);
		for (let j = 0; j < turnchunks2.length; ++j) {
			if (j == 0) {
				if (startoppo) {
					startoppo = false;
					combined_chunks.push("%AIPlaceholder%");
				} else {
					combined_chunks.push("%HumanPlaceholder%");
				}

				combined_chunks.push(turnchunks2[j]);
			} else {
				combined_chunks.push("%AIPlaceholder%");
				combined_chunks.push(turnchunks2[j]);
			}
		}
	}

	for (let i = 0; i < combined_chunks.length; ++i) {
		let curr = combined_chunks[i];
		if (curr == "%HumanPlaceholder%") {
			myturnchat = true;
		} else if (curr == "%AIPlaceholder%") {
			myturnchat = false;
		} else {
			if (allow_blank || curr.trim() != "") {
				chatunits.push({
					msg: curr,
					myturn: myturnchat,
				});
			}
		}
	}
	return chatunits;
}

function repack_instruct_history(input) //repack all history into individual turns
{
	if (localsettings.separate_end_tags) {
		if (get_instruct_starttag_end(true)) {
			input = replaceAll(input, get_instruct_starttag_end(false), "");
			input = replaceAll(input, get_instruct_starttag_end(true), "");
		}
		if (get_instruct_endtag_end(true)) {
			input = replaceAll(input, get_instruct_endtag_end(false), "");
			input = replaceAll(input, get_instruct_endtag_end(true), "");
		}
		if (get_instruct_systag_end(true)) {
			input = replaceAll(input, get_instruct_systag_end(false), "");
			input = replaceAll(input, get_instruct_systag_end(true), "");
		}
	}

	let st = get_instruct_starttag(false);
	let et = get_instruct_endtag(false);

	let turns = repack_instruct_turns(input, st, et, false);
	return turns;
}

function repack_adventure_history(input) {
	const regex = /\n\n> .+?\n/g;
	const result = [];
	let lastIndex = 0;
	let match;
	while ((match = regex.exec(input)) !== null) {
		const start = match.index;
		const end = regex.lastIndex;

		if (start > lastIndex) {
			// Opponent's turn (text before this match)
			result.push({
				msg: input.slice(lastIndex, start).trim(),
				myturn: false,
			});
		}

		// My turn
		let mymsg = match[0].trim();
		if (mymsg.startsWith("> ")) {
			mymsg = mymsg.substring(2);
		}
		result.push({
			msg: mymsg,
			myturn: true,
		});

		lastIndex = end;
	}

	// Any remaining text after last match is opponent's turn
	if (lastIndex < input.length) {
		result.push({
			msg: input.slice(lastIndex).trim(),
			myturn: false,
		});
	}

	// Filter out empty messages
	return result.filter(t => t.msg.length > 0);
}

function repack_story_history(input) {
	let arr = input.split("\n\n");
	let result = [];
	for (let i = 0; i < arr.length; ++i) {
		if (arr[i].trim() == "") {
			continue;
		}
		result.push({
			msg: arr[i],
			myturn: false,
		});
	}
	return result;
}

function corpo_chunk_prev() {
	let incomplete_resp = synchro_pending_stream != "" || pending_response_id != "";
	if (incomplete_resp) return;

	if (retry_prev_text.length > 0) {
		btn_back();
	}
}
function corpo_chunk_next() {
	let incomplete_resp = synchro_pending_stream != "" || pending_response_id != "";
	if (incomplete_resp) return;

	if (redo_prev_text.length > 0) {
		btn_redo();
	}
}
function corpo_retry_chunk(idx) {
	let incomplete_resp = synchro_pending_stream != "" || pending_response_id != "";
	if (incomplete_resp) return;

	let currctx = concat_gametext(false, "", "", "", false);
	currctx = replace_instruct_placeholders(currctx);

	let chatunits = [];
	if (localsettings.opmode == 3) {
		chatunits = repack_chat_history(currctx);
	} else if (localsettings.opmode == 2) {
		chatunits = repack_adventure_history(currctx);
	} else if (localsettings.opmode == 1) {
		chatunits = repack_story_history(currctx);
	} else {
		chatunits = repack_instruct_history(currctx);
	}

	if (idx < chatunits.length) {
		gametext_arr = [];

		if (localsettings.opmode == 3) {
			for (let i = 0; i <= idx; ++i) {
				let cont = chatunits[i].msg;
				let chunk = "\n" + chatunits[i].name + ": " + cont;
				gametext_arr.push(chunk);
			}
		} else if (localsettings.opmode == 2) { //adventure mode
			for (let i = 0; i <= idx; ++i) {
				let cont = chatunits[i].msg;
				if (chatunits[i].myturn) {
					cont = `\n\n> ${cont}\n\n`;
				}
				gametext_arr.push(cont);
			}
		} else if (localsettings.opmode == 1) { //story mode
			for (let i = 0; i <= idx; ++i) {
				let cont = chatunits[i].msg;
				if (i != idx) {
					cont = `${cont}\n\n`;
				}
				gametext_arr.push(cont);
			}
		} else {
			let ste = "";
			let ete = "";
			let st = get_instructstartplaceholder();
			let et = get_instructendplaceholder();
			if (localsettings.separate_end_tags) {
				ste = get_instructstartplaceholder_end();
				ete = get_instructendplaceholder_end();
			}

			for (let i = 0; i <= idx; ++i) {
				let cont = chatunits[i].msg;
				let chunk = cont;
				if (i != idx) {
					chunk = (chatunits[i].myturn ? st : et) + chunk + (chatunits[i].myturn ? ste : ete);
				}
				if (i == idx - 1) {
					chunk += et;
				}

				gametext_arr.push(chunk);
			}
		}

		corpo_editing_turn = -1;
		render_gametext(true);
		btn_retry();
	}
}
function corpo_edit_chunk_start(idx) {
	let incomplete_resp = synchro_pending_stream != "" || pending_response_id != "";
	if (incomplete_resp) return;

	corpo_editing_turn = idx;
	render_gametext(false, false);
}
function corpo_edit_chunk_delete() {
	let incomplete_resp = synchro_pending_stream != "" || pending_response_id != "";
	if (incomplete_resp) return;

	let textarea = document.getElementById("corpo_edit_inp");
	textarea.value = "";
	corpo_edit_chunk_save();
}
function corpo_edit_chunk_save() {
	let incomplete_resp = synchro_pending_stream != "" || pending_response_id != "";
	if (incomplete_resp) return;

	let idx = corpo_editing_turn;
	let currctx = concat_gametext(false, "", "", "", false);
	currctx = replace_instruct_placeholders(currctx);
	let chatunits = [];
	if (localsettings.opmode == 3) {
		chatunits = repack_chat_history(currctx);
	} else if (localsettings.opmode == 2) {
		chatunits = repack_adventure_history(currctx);
	} else if (localsettings.opmode == 1) {
		chatunits = repack_story_history(currctx);
	} else {
		chatunits = repack_instruct_history(currctx);
	}

	let textarea = document.getElementById("corpo_edit_inp");
	let needsave = false;

	let existing_msg_compare = stash_image_placeholders(chatunits[idx].msg, false);
	if (idx < chatunits.length && textarea.value != existing_msg_compare) {
		needsave = true;
		gametext_arr = [];
		redo_arr = [];
		last_reply_was_empty = false;
		retry_prev_text = [];
		retry_preserve_last = false;
		redo_prev_text = [];

		let newtxt = textarea.value;
		newtxt = unstash_image_placeholders(newtxt);

		if (localsettings.opmode == 3) { //chat mode
			for (let i = 0; i < chatunits.length; ++i) {
				let cont = i == idx ? newtxt : chatunits[i].msg;
				if (cont != "") {
					let chunk = "\n" + chatunits[i].name + ": " + cont;
					gametext_arr.push(chunk);
				}
			}
		} else if (localsettings.opmode == 2) { //adventure mode
			for (let i = 0; i < chatunits.length; ++i) {
				let cont = i == idx ? newtxt : chatunits[i].msg;
				if (cont != "") {
					let chunk = cont;
					if (chatunits[i].myturn) {
						chunk = `\n\n> ${chunk}\n\n`;
					}
					gametext_arr.push(chunk);
				}
			}
		} else if (localsettings.opmode == 1) { //story mode
			for (let i = 0; i < chatunits.length; ++i) {
				let cont = i == idx ? newtxt : chatunits[i].msg;
				if (cont != "") {
					if (i < chatunits.length - 1) {
						cont = `${cont}\n\n`;
					}
					gametext_arr.push(cont);
				}
			}
		} //instruct and the rest
		else {
			let ste = "";
			let ete = "";
			let st = get_instructstartplaceholder();
			let et = get_instructendplaceholder();
			if (localsettings.separate_end_tags) {
				ste = get_instructstartplaceholder_end();
				ete = get_instructendplaceholder_end();
			}

			let finalturnai = false;
			for (let i = 0; i < chatunits.length; ++i) {
				let cont = i == idx ? newtxt : chatunits[i].msg;
				if (cont != "") {
					let chunk = (chatunits[i].myturn ? st : et) + cont + (chatunits[i].myturn ? ste : ete);
					gametext_arr.push(chunk);
					finalturnai = chatunits[i].myturn ? false : true;
				}
			}
			if (gametext_arr.length > 0 && !finalturnai) {
				gametext_arr[gametext_arr.length - 1] += et;
			}
		}

		console.log("Merged corpo edit field. Parts:" + gametext_arr.length);
	}

	corpo_editing_turn = -1;
	render_gametext(needsave, false);
}
function corpo_edit_chunk_resend(idx) {
	corpo_edit_chunk_save();
	corpo_retry_chunk(idx + 1);
}

var cosmetic_corpo_ai_nick = "KoboldAI";
function corpo_click_avatar() {
	inputBox(
		"Set Cosmetic AI Nickname\n(This is purely cosmetic and does not affect responses, and is not saved).",
		"Set Cosmetic AI Nickname",
		cosmetic_corpo_ai_nick,
		"Set Cosmetic AI Nickname",
		() => {
			let userinput = getInputBoxValue();
			userinput = userinput.trim();
			if (userinput != null && userinput != "") {
				cosmetic_corpo_ai_nick = userinput;
			} else {
				cosmetic_corpo_ai_nick = "KoboldAI";
			}
			render_gametext(false);
		},
		false,
		false,
		false,
	);
}

var corpo_editing_turn = -1;
function render_corpo_ui(input) {
	var corpobody = document.getElementById("corpo_body");
	if (!corpobody) {
		return "";
	}

	let newbodystr = "";
	input = replace_instruct_placeholders(input);
	let chatunits = [];
	if (localsettings.opmode == 3) { //chat mode
		chatunits = repack_chat_history(input);
	} else if (localsettings.opmode == 2) {
		chatunits = repack_adventure_history(input);
	} else if (localsettings.opmode == 1) {
		chatunits = repack_story_history(input);
	} else {
		chatunits = repack_instruct_history(input);
	}

	let incomplete_resp = synchro_pending_stream != "" || pending_response_id != "";

	let countmap = new Map();
	for (var i = 0; i < chatunits.length; ++i) {
		let curr = chatunits[i];
		let foundimg = "";
		let processed_msg = curr.msg;
		processed_msg = apply_display_only_regex(processed_msg);
		if (processed_msg && processed_msg != "") {
			processed_msg = replace_noninstruct_placeholders(processed_msg, true, true, countmap);
			let codeblockcount = (processed_msg.match(/```/g) || []).length;
			if (codeblockcount > 0 && codeblockcount % 2 != 0) {
				processed_msg += "```"; //force end code block
			}
			if (localsettings.instruct_has_markdown) {
				processed_msg = simpleMarkdown(processed_msg, localsettings.instruct_has_latex);
			}

			//convert the msg into images
			processed_msg = render_all_image_html(processed_msg, false, true);
		}

		let namepart = curr.myturn ? "User" : cosmetic_corpo_ai_nick;
		//advanced name replacement
		if (localsettings.opmode == 3 && curr.name) { //chat mode
			namepart = curr.name;
		} else if (localsettings.opmode == 4 && localsettings.inject_chatnames_instruct && localsettings.instruct_has_markdown) {
			let validprefixes = [];
			if (curr.myturn) {
				validprefixes.push(localsettings.chatname);
			} else {
				let m_opps = localsettings.chatopponent.split("||$||");
				for (let i = 0; i < m_opps.length; ++i) {
					if (m_opps[i] && m_opps[i].trim() != "") {
						validprefixes.push(m_opps[i]);
					}
				}
			}

			let foundTimestamp = "";
			if (localsettings.inject_timestamps) {
				let found = processed_msg.match(/(\[\d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2} [AP]M\]) /g);
				if (found && found.length > 0) {
					foundTimestamp = found[0];
					processed_msg = processed_msg.replace(/(\[\d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2} [AP]M\]) /g, "");
				}
			}
			for (let i = 0; i < validprefixes.length; ++i) {
				let person = validprefixes[i];
				let prefix = person + ": ";
				if (processed_msg.startsWith(prefix)) {
					namepart = person;
					processed_msg = processed_msg.slice(prefix.length);
					break;
				}
			}
			if (foundTimestamp) {
				processed_msg = foundTimestamp + "\n" + processed_msg;
			}
		}

		let resendbtn = (curr.myturn && i < chatunits.length - 1)
			? `<button type="button" class="btn btn-primary" style="margin:2px;float:right;" onclick="corpo_edit_chunk_resend(${i})">Resend</button>`
			: ``;
		let bodypart = corpo_editing_turn == i
			? `<div class="corpo_edit_outer">
			<div class="corpo_edit_inner" id="corpo_edit_inp_lengthtester" style="white-space: nowrap; visibility: hidden; height: 0px; position:absolute; width: auto;"></div>
			<textarea class="corpo_edit_inner" id="corpo_edit_inp" type="text" name="crpeditinp"  role="presentation" autocomplete="noppynop" spellcheck="true" rows="1" wrap="on" placeholder="Edit Message" value="" oninput="corpoedit_resize_input();"/>${
				stash_image_placeholders(curr.msg, false)
			}</textarea>
			</div>
			<button type="button" class="btn btn-primary" style="margin:2px;float:right;" onclick="corpo_edit_chunk_start(-1)">Cancel</button>
			${resendbtn}
			<button type="button" class="btn btn-primary" style="margin:2px;float:right;" onclick="corpo_edit_chunk_save()">Save</button>
			<button type="button" class="btn btn-primary bg_red" style="margin:2px;float:left;" onclick="corpo_edit_chunk_delete()">Delete</button>`
			: `<div class="corpostyleitemcontent">${processed_msg}</div>`;
		let historical_btns = "";
		if (!curr.myturn && i == chatunits.length - 1 && !incomplete_resp) {
			if (retry_prev_text.length + redo_prev_text.length > 0) {
				historical_btns =
					`<button title="Previous Arrow" onclick="corpo_chunk_prev()" class="corpo_hover_btn" type="button" style="background-image: var(--img_corpo_left);"></button>`
					+ `<span class="corpo_btn_text">${retry_prev_text.length + 1} / ${retry_prev_text.length + redo_prev_text.length + 1}</span>`
					+ `<button title="Next Arrow" onclick="corpo_chunk_next()" class="corpo_hover_btn" type="button" style="background-image: var(--img_corpo_right);"></button>`;
			}
		}
		let chunkbtns = corpo_editing_turn == i ? `` : `<div style="line-height: 1">`
			+ historical_btns
			+ `<button title="Edit Chunk" onclick="corpo_edit_chunk_start(${i})" class="corpo_hover_btn" type="button" style="background-image: var(--img_corpo_edit);"></button>`
			+ (curr.myturn
				? ``
				: `<button title="Retry Chunk" onclick="corpo_retry_chunk(${i})" class="corpo_hover_btn" type="button" style="background-image: var(--img_corpo_retry);"></button>`)
			+ `</div>`;

		newbodystr += `<div class="corpostyleitem">`;

		if (localsettings.opmode == 1) {
			newbodystr += `<div style="width:100%">`;
		} else {
			newbodystr += `<div><img ${(curr.myturn ? "" : `onclick="corpo_click_avatar()"`)} src="${(curr.myturn
				? human_square
				: niko_square)}" class="corpoavatar"/></div>
			<div style="width:100%">
			<div class="corpostyleitemheading">` + namepart + `</div>`;
		}

		newbodystr += bodypart + chunkbtns + `</div></div>`;
	}
	if (incomplete_resp) {
		let namepart = cosmetic_corpo_ai_nick;
		let futuretext = synchro_pending_stream != ""
			? (escape_html(pending_context_preinjection) + format_streaming_text(escape_html(synchro_pending_stream)))
			: "...";
		if (localsettings.opmode == 3) {
			namepart = "";
		}
		newbodystr += `<div class="corpostyleitem">`;

		if (localsettings.opmode == 1) {
			newbodystr += `
			<div>
			<div class="corpostyleitemcontent"><p><span class="pending_text">` + futuretext + `</span></p></div>
			</div>`;
		} else {
			newbodystr += `<div><img src="` + niko_square + `" class="corpoavatar"/></div>
			<div>
			<div class="corpostyleitemheading">` + namepart + `</div>
			<div class="corpostyleitemcontent"><p><span class="pending_text">` + futuretext + `</span></p></div>
			</div>`;
		}
		newbodystr += `</div>`;
	}

	return newbodystr;
}

function update_toggle_lightmode(toggle = false) {
	if (toggle) {
		localsettings.darkmode = !localsettings.darkmode;
		autosave();
	}

	if (localsettings.darkmode) {
		document.body.classList.add("darkmode");
	} else {
		document.body.classList.remove("darkmode");
	}
}

function populate_corpo_leftpanel_topper() {
	let panel = document.getElementById("corpoleftpanelitemstopper");
	let panelitems =
		`<div onclick="btn_memory()" class="corpo_leftpanel_btn" type="button" style="background-image: var(--img_gear); padding-left: 44px;">Context</div>
	<div onclick="btn_editmode()" class="corpo_leftpanel_btn" type="button" style="background-image: var(--img_corpo_edit); padding-left: 44px;">Raw Editor</div>
	<div onclick="update_toggle_lightmode(true)" class="corpo_leftpanel_btn" type="button" style="background-image: var(--img_corpo_theme); padding-left: 44px;">Light / Dark Theme</div>`;

	if (localsettings.opmode == 3 || localsettings.opmode == 4) {
		panelitems +=
			`<div onclick="show_groupchat_select()" class="corpo_leftpanel_btn" type="button" style="background-image: var(--img_chat_mono); padding-left: 44px;">Chat Select</div>`;
	} else if (localsettings.opmode == 2) {
		let amode = localsettings.adventure_switch_mode == 0
			? "Story Mode"
			: (localsettings.adventure_switch_mode == 1 ? "Action Mode" : "Dice Mode");
		panelitems += `<div onclick="btn_adventure_mode()" class="corpo_leftpanel_btn" type="button" >Adventure: ${amode}</div>`;
	}
	if (is_using_kcpp_with_websearch()) {
		panelitems +=
			`<div onclick="toggle_websearch()" class="corpo_leftpanel_btn" type="button" style="background-image: var(--img_websearch_mono); padding-left: 44px;">WebSearch: ${
				localsettings.websearch_enabled ? "<span class='color_green'>On</span>" : "<span class='color_gray'>Off</span>"
			}</div>`;
	}
	panel.innerHTML = panelitems;
}
function populate_corpo_leftpanel() {
	let slotpromises = [];
	for (let i = 0; i < SAVE_SLOTS; ++i) {
		slotpromises.push(indexeddb_load("slot_" + i + "_meta", ""));
	}
	Promise.all(slotpromises).then(slotlabels => {
		let panel = document.getElementById("corpoleftpanelitemsinner");
		let panelitems = ``;
		populate_corpo_leftpanel_topper();
		for (let i = 0; i < slotlabels.length; ++i) {
			let testslot = slotlabels[i];
			let entry = "";
			if (testslot) {
				entry = `<div onclick="load_from_slot(` + i + `, true, true)" class="corpo_leftpanel_btn" type="button">` + testslot + `</div>`;
			}
			panelitems += entry;
		}
		panel.innerHTML = panelitems;
	});
}

function show_corpo_leftpanel(open) {
	let panel = document.getElementById("corpo_leftpanel");
	if (open) {
		panel.classList.add("open");
	} else {
		panel.classList.remove("open");
	}
}

function repack_chat_history(input) //repack history for chatmode
{
	let chatunits = []; //parse chat body into nice chat chunks
	let myturnchat = false; //who is currently speaking?

	var othernamesregex = new RegExp("(?!" + localsettings.chatname + ").+?\: ", "gi");

	if (!localsettings.chat_match_any_name && localsettings.chatopponent != "") {
		let namelist = localsettings.chatopponent.split("||$||");
		var namePattern = namelist.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
		othernamesregex = new RegExp("(" + namePattern + "): ", "gi");
	}

	//a quick fix that adds a newline if there's none before opponent chat and a picture
	var othernamesregexreplace = new RegExp("\\|[d|p]\\|>(?!" + localsettings.chatname + ").+?\\: ", "gi");

	input = input.replace(othernamesregexreplace, function(m) {
		let rep = m.substring(0, 4) + "\n" + m.substring(4);
		return rep;
	});

	input = input.split("\n"); //split by newline, then parse each chunk
	let m_name = "\n" + localsettings.chatname + ": ";
	var mynameregex = new RegExp("(" + localsettings.chatname + ")\: ", "gi");

	for (var i = 0; i < input.length; ++i) {
		let tempfullsearchable = input[i]; //strip out images
		let txtwithnoimages = tempfullsearchable.replace(/\[<\|[\s\S]+?\|>\]/g, "");
		var foundopponent = txtwithnoimages.match(othernamesregex);
		var foundself = txtwithnoimages.match(mynameregex);

		if (tempfullsearchable == null) {
			continue;
		}

		if (foundself != null && foundself.length > 0) {
			//exception: check to see if it's actually opponent naming us and not our turn
			if (localsettings.chatopponent != "" && tempfullsearchable.startsWith(localsettings.chatopponent + ": ")) {
				myturnchat = false;
				chatunits.push({
					name: localsettings.chatopponent,
					msg: tempfullsearchable.split(localsettings.chatopponent + ": ")[1],
					myturn: myturnchat,
				});
			} else {
				myturnchat = true;
				chatunits.push({
					name: foundself[0].substring(0, foundself[0].length - 2),
					msg: tempfullsearchable.split(foundself[0])[1],
					myturn: myturnchat,
				});
			}
		} else if (foundopponent != null && foundopponent.length > 0) {
			myturnchat = false;
			chatunits.push({
				name: foundopponent[0].substring(0, foundopponent[0].length - 2),
				msg: tempfullsearchable.split(foundopponent[0])[1],
				myturn: myturnchat,
			});
		} else { //unknown sender, just use existing turn
			if (chatunits.length == 0) {
				if (tempfullsearchable.trim() != "") {
					chatunits.push({
						name: "",
						msg: tempfullsearchable,
						myturn: myturnchat,
					});
				}
			} else {
				chatunits[chatunits.length - 1].msg += "<br>" + tempfullsearchable;
			}
		}
	}
	return chatunits;
}

function render_messenger_ui(input) {
	var chatbody = document.getElementById("chat_msg_body");
	if (!chatbody) {
		return;
	}

	let newbodystr = "";
	let chatunits = repack_chat_history(input);

	let colormap = {}, colidx = 0;
	for (var i = 0; i < chatunits.length; ++i) {
		let curr = chatunits[i];
		let foundimg = "";
		if (curr.msg && curr.msg != "") {
			curr.msg = curr.msg.replace(bold_regex, "<b style='opacity:0.7'>$1</b>");
			curr.msg = curr.msg.replace(italics_regex, "<em style='opacity:0.7'>$1</em>");
			//convert the msg into images
			curr.msg = render_all_image_html(curr.msg, false, true);
		}

		if (curr.myturn) {
			let namepart = curr.name != "" ? `<span style="font-weight: bolder;color:#15e4c8b9;">` + escape_html(curr.name) + `</span><br>` : "";
			newbodystr += `<div class="chat_outgoing_msg"><div class="chat_sent_msg"><p>` + namepart + curr.msg + `</p></div></div>`;
		} else {
			let oname = escape_html(curr.name);
			let onametrim = oname.trim();
			if (colormap[onametrim] == null) {
				colormap[onametrim] = get_unique_color(colidx);
				++colidx;
			}
			let namepart = curr.name != "" ? `<span class='` + colormap[onametrim] + `' style="font-weight: bolder;">` + oname + `</span><br>` : "";
			newbodystr += `<div class="incoming_msg"><div class="chat_received_msg"><div class="chat_received_withd_msg"><p>` + namepart + curr.msg
				+ `</p></div></div></div>`;
		}
	}
	if (synchro_pending_stream != "") {
		newbodystr +=
			`<div class="incoming_msg"><div class="chat_received_msg"><div class="chat_received_withd_msg"><p><span class="color_yellow pending_text">`
			+ escape_html(pending_context_preinjection) + format_streaming_text(escape_html(synchro_pending_stream))
			+ `</span></p></div></div></div>`;
	}

	chatbody.innerHTML = newbodystr;
}

function chat_handle_typing(event) {
	var event = event || window.event;
	var charCode = event.keyCode || event.which;
	warn_unsaved = true;

	if (!event.shiftKey && charCode == 13) {
		let willsubmit = document.getElementById("entersubmit").checked ? true : false;
		let newgennotempty = document.getElementById("cht_inp").value != "" || document.getElementById("corpo_cht_inp").value != "";
		if (willsubmit) {
			event.preventDefault();
			//enter pressed, trigger auto submit
			//edit: permit sending even if newgen is empty for chat
			if (!document.getElementById("btnsend").disabled) {
				chat_submit_generation();
			}
		}
	}
}
function corpoedit_resize_input() {
	//resize chat inp
	let textarea = document.getElementById("corpo_edit_inp");
	let lengthtester = document.getElementById("corpo_edit_inp_lengthtester");

	if (textarea && lengthtester) { //may not exist, depending on selection
		let textlines = textarea.value.split("\n");
		let numberOfLineBreaks = textlines.length;
		for (let l = 0; l < textlines.length; ++l) {
			lengthtester.innerText = textlines[l];
			if (textarea.offsetWidth > 0) {
				numberOfLineBreaks += Math.floor(lengthtester.offsetWidth / textarea.offsetWidth);
			}
		}
		lengthtester.innerText = "";
		numberOfLineBreaks = numberOfLineBreaks > 12 ? 12 : numberOfLineBreaks;
		textarea.rows = numberOfLineBreaks;
	}
}
function chat_resize_input() {
	//resize chat inp
	let textarea = is_corpo_ui() ? document.getElementById("corpo_cht_inp") : document.getElementById("cht_inp");
	let lengthtester = is_corpo_ui() ? document.getElementById("corpo_cht_inp_lengthtester") : document.getElementById("cht_inp_lengthtester");

	let textlines = textarea.value.split("\n");
	let numberOfLineBreaks = textlines.length;
	for (let l = 0; l < textlines.length; ++l) {
		lengthtester.innerText = textlines[l];
		if (textarea.offsetWidth > 0) {
			numberOfLineBreaks += Math.floor(lengthtester.offsetWidth / textarea.offsetWidth);
		}
	}
	lengthtester.innerText = "";
	numberOfLineBreaks = numberOfLineBreaks > 5 ? 5 : numberOfLineBreaks;
	textarea.rows = numberOfLineBreaks;
}
function chat_submit_generation() {
	//easy solution is to just pump the text into the main box and submit it
	if (is_corpo_ui()) {
		document.getElementById("input_text").value = document.getElementById("corpo_cht_inp").value;
	} else {
		document.getElementById("input_text").value = document.getElementById("cht_inp").value;
	}

	prepare_submit_generation();
	document.getElementById("cht_inp").value = "";
	document.getElementById("corpo_cht_inp").value = "";
	chat_resize_input();
}
function chat_toggle_actionmenu() {
	let am2 = document.getElementById("actionmenu2");
	let mainbox = document.getElementById("chat_msg_body");
	if (am2.classList.contains("hidden")) {
		am2.classList.remove("hidden");
		mainbox.classList.add("withmenu");
	} else {
		am2.classList.add("hidden");
		mainbox.classList.remove("withmenu");
	}
}

function update_prev_custom_endpoint_type() {
	localsettings.prev_custom_endpoint_type = 0;
	localsettings.prev_custom_endpoint_model = "";
	if (custom_kobold_endpoint != "") {
		localsettings.prev_custom_endpoint_type = 1;
	} else if (custom_oai_key != "") {
		localsettings.prev_custom_endpoint_type = 2;
		if (custom_oai_endpoint.toLowerCase().includes("openrouter.ai")) {
			localsettings.prev_custom_endpoint_type = 3;
		} else if (custom_oai_endpoint.toLowerCase().includes("api.mistral.ai")) {
			localsettings.prev_custom_endpoint_type = 7;
		} else if (custom_oai_endpoint.toLowerCase().includes("featherless.ai")) {
			localsettings.prev_custom_endpoint_type = 8;
		} else if (custom_oai_endpoint.toLowerCase().includes("api.x.ai")) {
			localsettings.prev_custom_endpoint_type = 9;
		} else if (custom_oai_endpoint.toLowerCase().includes("text.pollinations.ai")) {
			localsettings.prev_custom_endpoint_type = 10;
		}
	} else if (custom_claude_key != "") {
		localsettings.prev_custom_endpoint_type = 4;
	} else if (custom_gemini_key != "") {
		localsettings.prev_custom_endpoint_type = 5;
	} else if (custom_cohere_key != "") {
		localsettings.prev_custom_endpoint_type = 6;
	}

	if (localsettings.prev_custom_endpoint_type != 0 && localsettings.prev_custom_endpoint_type != 1) {
		let dropdown = get_custom_ep_model_dropdown(localsettings.prev_custom_endpoint_type);
		if (dropdown && dropdown.value) {
			localsettings.prev_custom_endpoint_model = dropdown.value;
		}
	}
}

function autosave() {
	//autosave
	try {
		update_prev_custom_endpoint_type();
		indexeddb_save("settings", JSON.stringify(localsettings));
		if (localsettings.persist_session) {
			autosave_compressed_story(true, true, true);
		}
	} catch (e) {
		console.error("Autosave Failed: " + e);
	}
}

function btn_adventure_mode() {
	localsettings.adventure_switch_mode = (localsettings.adventure_switch_mode + 1) % 3;
	render_gametext();
}

var memory_tab = 0;
function display_memory_tab(newtab) {
	memory_tab = newtab;
	document.getElementById("memory_tab").classList.remove("active");
	document.getElementById("wi_tab").classList.remove("active");
	document.getElementById("documentdb_tab").classList.remove("active");
	document.getElementById("memory_tab_container").classList.add("hidden");
	document.getElementById("wi_tab_container").classList.add("hidden");
	document.getElementById("documentdb_tab_container").classList.add("hidden");

	switch (newtab) {
		case 0:
			document.getElementById("memory_tab").classList.add("active");
			document.getElementById("memory_tab_container").classList.remove("hidden");
			break;
		case 1:
			document.getElementById("wi_tab").classList.add("active");
			document.getElementById("wi_tab_container").classList.remove("hidden");
			break;
		case 2:
			document.getElementById("documentdb_tab").classList.add("active");
			document.getElementById("documentdb_tab_container").classList.remove("hidden");
			estimate_and_show_textDB_usage();
			break;
		default:
			break;
	}
}

function btn_memory() {
	mainmenu_untab(true);
	document.getElementById("memorycontainer").classList.remove("hidden");
	display_memory_tab(memory_tab);

	//setup memory tab
	document.getElementById("memorytext").value = current_memory;
	document.getElementById("anotetext").value = current_anote;
	document.getElementById("anotetemplate").value = current_anotetemplate;
	document.getElementById("anote_strength").value = anote_strength;
	document.getElementById("newlineaftermemory").checked = newlineaftermemory ? true : false;

	//setup wi tab
	start_editing_wi();
	update_wi();

	document.getElementById("documentdb_provider").value = documentdb_provider;
	document.getElementById("documentdb_searchhistory").checked = documentdb_searchhistory;
	document.getElementById("documentdb_numresults").value = documentdb_numresults;
	document.getElementById("documentdb_searchrange").value = documentdb_searchrange;
	document.getElementById("documentdb_chunksize").value = documentdb_chunksize;
	document.getElementById("documentdb_numresults_slide").value = documentdb_numresults;
	document.getElementById("documentdb_searchrange_slide").value = documentdb_searchrange;
	document.getElementById("documentdb_chunksize_slide").value = documentdb_chunksize;
	document.getElementById("documentdb_data").value = documentdb_data;
	let providerdropdown = document.getElementById("documentdb_provider");
	const kcppEmbeddingDropdownOption = Array.from(providerdropdown.options).find(opt => opt.value === "2");
	if (is_using_kcpp_with_embeddings()) {
		kcppEmbeddingDropdownOption.classList.remove("hidden");
	} else {
		if (document.getElementById("documentdb_provider").value == "2") {
			document.getElementById("documentdb_provider").value = 1;
		}
		kcppEmbeddingDropdownOption.classList.add("hidden");
	}
	toggle_documentdb_provider();
}

function toggle_documentdb_provider() {
	if (document.getElementById("documentdb_provider").value == "3") {
		document.getElementById("documentdb_oai_buttons").classList.remove("hidden");
	} else {
		document.getElementById("documentdb_oai_buttons").classList.add("hidden");
	}
}

function toggle_logit_bias_string() {
	if (document.getElementById("newlogitbiasstringtoggle").checked) {
		document.getElementById("newlogitbiasstring").classList.remove("hidden");
		document.getElementById("newlogitbiasid").classList.add("hidden");
	} else {
		document.getElementById("newlogitbiasstring").classList.add("hidden");
		document.getElementById("newlogitbiasid").classList.remove("hidden");
	}
}

function populate_regex_replacers() {
	let regextablehtml = `
	<tr>
	<th>Pattern <span class="helpicon">?<span class="helptext">The regex pattern to match against any incoming text. Leave blank to disable.</span></span></th>
	<th>Replacement <span class="helpicon">?<span class="helptext">The string to replace matches with. Capture groups are allowed (e.g. $1). To remove all matches, leave this blank.</span></span></th>
	<th>Both Ways <span class="helpicon">?<span class="helptext">If enabled, regex applies for both inputs and outputs, otherwise output only.</span></span></th>
	<th>Display Only <span class="helpicon">?<span class="helptext">If enabled, regex replacements only affect displayed text without modifying context.</span></span></th>
	</tr>`;
	let regextable = document.getElementById("regex_replace_table");

	for (let i = 0; i < num_regex_rows; ++i) {
		regextablehtml += `
		<tr>
		<td><input class="settinglabel miniinput" type="text" placeholder="(Inactive)" value="" id="regexreplace_pattern${i}"></td>
		<td><input class="settinglabel miniinput" type="text" placeholder="(Remove)" value="" id="regexreplace_replacement${i}"></td>
		<td><input type="checkbox" id="regexreplace_bothways${i}" style="margin:0px 0 0;"></td>
		<td><input type="checkbox" id="regexreplace_displayonly${i}" style="margin:0px 0 0;"></td>
		</tr>
		`;
	}

	regextable.innerHTML = regextablehtml;

	for (let i = 0; i < num_regex_rows; ++i) {
		let a1 = document.getElementById("regexreplace_pattern" + i);
		let a2 = document.getElementById("regexreplace_replacement" + i);
		let a3 = document.getElementById("regexreplace_bothways" + i);
		let a4 = document.getElementById("regexreplace_displayonly" + i);
		if (a1 && a2 && a3 && a4) {
			if (i < localsettings.regexreplace_data.length) {
				a1.value = localsettings.regexreplace_data[i].p;
				a2.value = localsettings.regexreplace_data[i].r;
				a3.checked = localsettings.regexreplace_data[i].b ? true : false;
				a4.checked = localsettings.regexreplace_data[i].d ? true : false;
			} else {
				a1.value = a2.value = "";
				a3.checked = false;
				a4.checked = false;
			}
		}
	}
	document.getElementById("thinking_pattern").value = localsettings.thinking_pattern;
	document.getElementById("thinking_action").value = localsettings.thinking_action;
	document.getElementById("think_injected").value = localsettings.think_injected;
	document.getElementById("strip_thinking_mode").value = localsettings.strip_thinking_mode;
	document.getElementById("start_thinking_tag").value = localsettings.start_thinking_tag;
	document.getElementById("stop_thinking_tag").value = localsettings.stop_thinking_tag;
}

function populate_placeholder_tags() {
	let regextablehtml = `
	<tr>
	<th>Placeholder <span class="helpicon">?<span class="helptext">The placeholder to match against</span></span></th>
	<th>Replacement <span class="helpicon">?<span class="helptext">The text to substitude on display. Actual context is unchanged.</span></span></th>
	</tr>`;
	let regextable = document.getElementById("placeholder_replace_table");

	for (let i = 0; i < num_regex_rows; ++i) {
		regextablehtml += `
		<tr>
		<td><input class="settinglabel miniinput" type="text" placeholder="(Inactive)" value="" id="placeholder_pattern${i}"></td>
		<td><input class="settinglabel miniinput" type="text" placeholder="(Remove)" value="" id="placeholder_replace${i}"></td>
		</tr>
		`;
	}

	regextable.innerHTML = regextablehtml;

	for (let i = 0; i < num_regex_rows; ++i) {
		let a1 = document.getElementById("placeholder_pattern" + i);
		let a2 = document.getElementById("placeholder_replace" + i);
		if (a1 && a2) {
			if (i < localsettings.placeholder_tags_data.length) {
				a1.value = localsettings.placeholder_tags_data[i].p;
				a2.value = localsettings.placeholder_tags_data[i].r;
			} else {
				a1.value = a2.value = "";
			}
		}
	}
}

function toggle_wi_sk(idx) {
	var ce = pending_wi_obj[idx];
	ce.selective = !ce.selective;
	var tgt = document.getElementById("wiskt" + idx);
	var tgt2 = document.getElementById("wikeysec" + idx);
	var tgt3 = document.getElementById("wikeyanti" + idx);
	if (ce.selective) {
		tgt.classList.add("witoggleron");
		tgt.classList.remove("witoggleroff");
		tgt2.classList.remove("hidden");
		tgt3.classList.remove("hidden");
	} else {
		tgt.classList.remove("witoggleron");
		tgt.classList.add("witoggleroff");
		tgt2.classList.add("hidden");
		tgt3.classList.add("hidden");
	}
}

function toggle_wi_ck(idx) {
	var ce = pending_wi_obj[idx];
	ce.constant = !ce.constant;
	var tgt = document.getElementById("wickt" + idx);
	if (ce.constant) {
		tgt.classList.add("witoggleron");
		tgt.classList.remove("witoggleroff");
	} else {
		tgt.classList.remove("witoggleron");
		tgt.classList.add("witoggleroff");
	}
}

function toggle_wi_enabled(idx) {
	var ce = pending_wi_obj[idx];
	ce.widisabled = !ce.widisabled;
	var tgt = document.getElementById("wienabled" + idx);
	if (!ce.widisabled) {
		tgt.classList.add("witoggleron");
		tgt.classList.remove("witoggleroff");
	} else {
		tgt.classList.remove("witoggleron");
		tgt.classList.add("witoggleroff");
	}
}

function toggle_wi_group_enabled() {
	let enablegroup = document.getElementById("toggle_wi_group").checked;
	for (let idx = 0; idx < pending_wi_obj.length; ++idx) {
		let ce = pending_wi_obj[idx];
		let cg = ce.wigroup ? ce.wigroup : "";
		if (curr_wi_tab != cg) {
			continue;
		}
		ce.widisabled = !enablegroup;
		var tgt = document.getElementById("wienabled" + idx);
		if (!ce.widisabled) {
			tgt.classList.add("witoggleron");
			tgt.classList.remove("witoggleroff");
		} else {
			tgt.classList.remove("witoggleron");
			tgt.classList.add("witoggleroff");
		}
	}
}

function del_wi(idx) {
	save_wi();
	var ce = pending_wi_obj[idx];
	pending_wi_obj.splice(idx, 1);
	update_wi();
}

function up_wi(idx) {
	save_wi();
	var ce = pending_wi_obj[idx];
	if (idx > 0 && idx < pending_wi_obj.length) {
		const temp = pending_wi_obj[idx - 1];
		let g1 = temp.wigroup ? temp.wigroup : "";
		let g2 = ce.wigroup ? ce.wigroup : "";
		if (g1 == g2) { //only allow swap if same group
			pending_wi_obj[idx - 1] = pending_wi_obj[idx];
			pending_wi_obj[idx] = temp;
		}
	}
	update_wi();
}

function down_wi(idx) {
	save_wi();
	var ce = pending_wi_obj[idx];
	if (idx >= 0 && idx + 1 < pending_wi_obj.length) {
		const temp = pending_wi_obj[idx + 1];
		let g1 = temp.wigroup ? temp.wigroup : "";
		let g2 = ce.wigroup ? ce.wigroup : "";
		if (g1 == g2) { //only allow swap if same group
			pending_wi_obj[idx + 1] = pending_wi_obj[idx];
			pending_wi_obj[idx] = temp;
		}
	}
	update_wi();
}

function add_wi() {
	save_wi();
	var ne = {
		key: "",
		keysecondary: "",
		keyanti: "",
		content: "",
		comment: "",
		folder: null,
		selective: false,
		constant: false,
		probability: 100,
		wigroup: curr_wi_tab,
		widisabled: false,
	};
	pending_wi_obj.push(ne);
	update_wi();
}

function add_wi_group() {
	inputBox(
		"WorldInfo Groups can be used to segment data, e.g. entries for a specific place, person or event. Each entire group can be toggled on/off on demand. You cannot rename a group after creation.\n\nEnter name of New WorldInfo Group",
		"Add New WorldInfo Group",
		"",
		"(Enter Group Name)",
		() => {
			let userinput = getInputBoxValue();
			userinput = sanitizeAlphanumeric(userinput).trim();
			if (userinput != "") {
				save_wi();
				var ne = {
					key: "",
					keysecondary: "",
					keyanti: "",
					content: "",
					comment: "",
					folder: null,
					selective: false,
					constant: false,
					probability: 100,
					wigroup: userinput,
					widisabled: false,
				};
				pending_wi_obj.push(ne);
				curr_wi_tab = userinput;
				update_wi();
			}
		},
		false,
	);
}

function select_wi_group(groupname) {
	save_wi();
	curr_wi_tab = groupname;
	//make sure sorted into groups, while preserving order within the group
	update_wi();
}

function save_wi() {
	for (var i = 0; i < pending_wi_obj.length; ++i) {
		let ce = pending_wi_obj[i];
		let cg = ce.wigroup ? ce.wigroup : "";
		if (curr_wi_tab != cg) {
			continue;
		}
		pending_wi_obj[i].key = document.getElementById("wikey" + i).value;
		pending_wi_obj[i].keysecondary = document.getElementById("wikeysec" + i).value;
		pending_wi_obj[i].keyanti = document.getElementById("wikeyanti" + i).value;
		pending_wi_obj[i].content = document.getElementById("wival" + i).value;
		let prb = document.getElementById("wirng" + i).value;
		pending_wi_obj[i].probability = prb ? prb : 100;
	}
	localsettings.case_sensitive_wi = document.getElementById("case_sensitive_wi").checked ? true : false;
	wi_searchdepth = document.getElementById("wi_searchdepth").value;
	wi_insertlocation = document.getElementById("wi_insertlocation").value;
}

var pending_wi_obj = []; //only the pending copy is edited until committed
var curr_wi_tab = ""; //for switching between tabs
function commit_wi_changes() {
	current_wi = JSON.parse(JSON.stringify(pending_wi_obj));
}
function start_editing_wi() {
	pending_wi_obj = JSON.parse(JSON.stringify(current_wi));

	//make sure sorted into groups, while preserving order within the group
	pending_wi_obj = stableSort(pending_wi_obj, (a, b) => {
		const nameA = a.wigroup ? "" : a.wigroup;
		const nameB = b.wigroup ? "" : b.wigroup;
		if (nameA < nameB) {
			return -1;
		}
		if (nameA > nameB) {
			return 1;
		}
		return 0;
	});
}

function wi_quick_search() {
	save_wi();
	update_wi();
}

function update_wi() {
	//ensure sorted so reordering wi works
	pending_wi_obj = stableSort(pending_wi_obj, (a, b) => {
		const nameA = a.wigroup ? a.wigroup : "";
		const nameB = b.wigroup ? b.wigroup : "";
		if (nameA < nameB) {
			return -1;
		}
		if (nameA > nameB) {
			return 1;
		}
		return 0;
	});

	document.getElementById("case_sensitive_wi").checked = localsettings.case_sensitive_wi ? true : false;

	let wigroupbtns = `<span class="justifyleft"><button type="button" style="padding:4px;margin:2px;margin-top:4px;margin-bottom:4px;" class="btn ${
		curr_wi_tab == "" ? "lightpurplebtn" : "purplebtn"
	} widelbtn" onclick="select_wi_group('')">General</button></span>`;
	let grpnamesdict = {};
	for (let i = 0; i < pending_wi_obj.length; ++i) {
		let cg = pending_wi_obj[i].wigroup;
		if (cg && cg != "") {
			grpnamesdict[cg] = true;
		}
	}
	for (g in grpnamesdict) {
		wigroupbtns += `<span class="justifyleft"><button type="button" style="padding:4px;margin:2px;margin-top:4px;margin-bottom:4px;" class="btn ${
			curr_wi_tab == g ? "lightpurplebtn" : "purplebtn"
		} widelbtn" onclick="select_wi_group('${g}')">${g}</button></span>`;
	}
	wigroupbtns +=
		`<span class="justifyleft"><button type="button" style="padding:4px;margin:2px;margin-top:4px;margin-bottom:4px;" class="btn purplebtn widelbtn" id="wiadd" onclick="add_wi_group()">📁+</button></span>`;

	document.getElementById("wigroupsbuttons").innerHTML = wigroupbtns;

	let wilist = document.getElementById("wilist");
	let qsval = document.getElementById("wiquicksearch").value;
	let selectionhtml = `<table style="border-collapse: separate; border-spacing: 1.5pt;">`;
	let entrycount = 0;
	for (var i = 0; i < pending_wi_obj.length; ++i) {
		var curr = pending_wi_obj[i];
		var cg = curr.wigroup ? curr.wigroup : "";
		if (curr_wi_tab != cg) {
			continue;
		}
		entrycount += 1;

		var winame = escape_html(curr.key);
		var witxt = escape_html(curr.content);
		var wisec = curr.keysecondary ? curr.keysecondary : "";
		var wianti = curr.keyanti ? curr.keyanti : "";
		var wirngval = curr.probability ? curr.probability : 100;

		var ishidden = false;
		if (qsval != "" && !winame.toLowerCase().includes(qsval.toLowerCase()) && !witxt.toLowerCase().includes(qsval.toLowerCase())) {
			ishidden = true;
		}

		let probarr = [100, 90, 75, 50, 25, 10, 5, 1];

		selectionhtml += `<tr class='` + (ishidden ? "hidden" : "") + `' id="wirow${i}"><td style="font-size: 10px;">`
			+ `<a id="wienabled${i}" href="#" class=` + (curr.widisabled ? "witoggleroff" : "witoggleron")
			+ ` title="Toggle this entry enabled or disabled. Disabled entries are always ignored." onclick="return toggle_wi_enabled(${i})">⚡</a>`
			+ `<button type="button" class="btn redbtn widelbtn" id="widel${i}" onclick="return del_wi(${i})">X</button></td>`
			+ `<td><button type="button" class="btn btn-primary wiarrowbtn" id="wiup${i}" onclick="return up_wi(${i})">▲</button>`
			+ `<button type="button" class="btn btn-primary wiarrowbtn" id="widown${i}" onclick="return down_wi(${i})">▼</button></td>`
			+ `<td class="wiinputkeycol">
		<input class="form-control wiinputkey" id="wikey${i}" placeholder="Key(s)" value="${winame}">
		<input class="form-control wiinputkey ` + (curr.selective ? `` : `hidden`) + `" id="wikeysec${i}" placeholder="Sec. Key(s)" value="${wisec}">`
			+ `
		<input class="form-control wiinputkey ` + (curr.selective ? `` : `hidden`)
			+ `" id="wikeyanti${i}" placeholder="Anti Key(s)" value="${wianti}">` + `</td>
		<td class="wiinputvalcol">
		<textarea class="form-control wiinputval" style="line-height:1.1" id="wival${i}" placeholder="What To Remember" rows="4">${witxt}</textarea>
		</td>
		<td>
		<a id="wiskt${i}" href="#" class=` + (curr.selective ? "witoggleron" : "witoggleroff")
			+ ` title="Toggle Selective Key mode (if enabled, this world info entry will be included in memory only if at least one PRIMARY KEY and at least one SECONDARY KEY are both present in the story)" onclick="return toggle_wi_sk(${i})">📑</a>
		<a id="wickt${i}" href="#" class=` + (curr.constant ? "witoggleron" : "witoggleroff")
			+ ` title="Toggle Constant Key mode (if enabled, this world info entry will always be included in memory)" onclick="return toggle_wi_ck(${i})">📌</a>
		<select id="wirng${i}" style="padding:1px; height:auto; width: 30px; appearance: none; font-size: 7pt;" class="form-control" title="Chance to trigger if allowed">`;

		let opts = "";
		for (let n = 0; n < probarr.length; ++n) {
			opts += `<option value="` + probarr[n] + `" ` + (probarr[n] == wirngval ? "selected" : "") + `>` + probarr[n] + `%</option>`;
		}
		selectionhtml += opts + `
		</select>
		</td>
	</tr>
	`;
	}
	if (entrycount == 0) {
		selectionhtml = '<div class="menutext">No world info.<br>Click [+Entry] to add a new entry to current WorldInfo group.</div>';
	}

	selectionhtml += "</table>";
	wilist.innerHTML = selectionhtml;
	document.getElementById("wi_searchdepth").value = wi_searchdepth;
	document.getElementById("wi_insertlocation").value = wi_insertlocation;
}

function wi_group_export() {
	save_wi();
	let currwis_cloned = [];
	let currwis = [];
	//collate matching entries
	for (var i = 0; i < pending_wi_obj.length; ++i) {
		var curr = pending_wi_obj[i];
		var cg = curr.wigroup ? curr.wigroup : "";
		if (curr_wi_tab != cg) {
			continue;
		}
		const copiedObj = JSON.parse(JSON.stringify(curr));
		delete copiedObj.wigroup;
		currwis_cloned.push(copiedObj);
		currwis.push(curr);
	}
	let wijson = JSON.stringify(currwis_cloned, null, 2);
	inputBoxOkCancel(
		"Copy or paste World Info JSON to modify the entries in this group",
		"World Info Import / Export",
		wijson,
		"Paste JSON Here",
		() => {
			let userinput = getInputBoxValue().trim();
			try {
				if (userinput == "") {
					userinput = "[]";
				}
				let newjson = JSON.parse(userinput);
				pending_wi_obj = pending_wi_obj.filter(item => !currwis.includes(item));
				for (var i = 0; i < newjson.length; ++i) {
					newjson[i].wigroup = curr_wi_tab;
					pending_wi_obj.push(newjson[i]);
				}
				update_wi();
			} catch (e) {
				console.log("WI JSON not correctly formatted!");
			}
		},
		() => {
			//do nothing on cancel
		},
		true,
		true,
	);
}

function export_wi_to_file() {
	save_wi();
	update_wi();
	let fdata = JSON.stringify(pending_wi_obj);
	saveFileGeneric("world_info", fdata, "application/json");
}
function import_wi_from_file() {
	promptUserForLocalFile((fileDetails) => {
		try {
			let { file, fileName, ext, content, plaintext } = fileDetails;
			let wiToAdd = JSON.parse(plaintext);
			let has_tav_wi_check = has_tavern_wi_check(wiToAdd);
			if (has_tav_wi_check) {
				wiToAdd = load_tavern_wi(wiToAdd);
				if (wiToAdd && wiToAdd.length > 0) {
					for (let i = 0; i < wiToAdd.length; ++i) {
						wiToAdd[i].wigroup = curr_wi_tab;
					}
				}
			}
			if (wiToAdd && wiToAdd.length > 0) {
				for (let i = 0; i < wiToAdd.length; ++i) {
					let wi = wiToAdd[i];
					var cg = wi.wigroup ? wi.wigroup : "";
					wi.wigroup = cg;
					pending_wi_obj.push(wi);
				}
			}
			update_wi();
		} catch (e) {
			console.log("WI File Import Failed: " + e);
		}
	});
}

var backLongPressTimer = null;
function btn_back_longpress_start() {
	backLongPressTimer = setTimeout(() => {
		console.log("Clear story");
		if (!document.getElementById("btnsend").disabled && pending_response_id == "" && gametext_arr.length > 0) {
			warn_unsaved = true;
			last_reply_was_empty = false;
			while (gametext_arr.length > 0) {
				if (retry_prev_text.length > 0) {
					redo_prev_text.push(gametext_arr.pop());
					gametext_arr.push(retry_prev_text.pop());
				} else {
					let popped = gametext_arr.pop();
					redo_arr.push(popped);
				}
			}
			retry_preserve_last = false;
			render_gametext();
			sync_multiplayer(false);
		}
	}, 2000);
}
function btn_back_longpress_end() {
	clearTimeout(backLongPressTimer);
}
function btn_back() {
	if (!document.getElementById("btnsend").disabled && pending_response_id == "" && gametext_arr.length > 0) {
		warn_unsaved = true;
		last_reply_was_empty = false;
		retry_preserve_last = false;
		if (retry_prev_text.length > 0) {
			redo_prev_text.push(gametext_arr.pop());
			gametext_arr.push(retry_prev_text.pop());
		} else {
			let popped = gametext_arr.pop();
			redo_arr.push(popped);
		}
		render_gametext();
		sync_multiplayer(false);
	}
}

var redoLongPressTimer = null;
function btn_redo_longpress_start() {
	redoLongPressTimer = setTimeout(() => {
		console.log("Redo All story");
		if (!document.getElementById("btnsend").disabled && pending_response_id == "" && redo_arr.length > 0) {
			warn_unsaved = true;
			last_reply_was_empty = false;
			retry_preserve_last = false;
			while (redo_arr.length > 0) {
				let popped = redo_arr.pop();
				gametext_arr.push(popped);
			}
			while (redo_prev_text.length > 0) {
				retry_prev_text.push(gametext_arr.pop());
				gametext_arr.push(redo_prev_text.pop());
			}
			render_gametext();
			sync_multiplayer(false);
		}
	}, 2000);
}
function btn_redo_longpress_end() {
	clearTimeout(redoLongPressTimer);
}
function btn_redo() {
	if (!document.getElementById("btnsend").disabled && pending_response_id == "") {
		warn_unsaved = true;
		if (redo_arr.length > 0) {
			last_reply_was_empty = false;
			retry_preserve_last = false;
			let popped = redo_arr.pop();
			gametext_arr.push(popped);
			render_gametext();
			sync_multiplayer(false);
		} else if (redo_prev_text.length > 0) {
			last_reply_was_empty = false;
			retry_prev_text.push(gametext_arr.pop());
			retry_preserve_last = false;
			gametext_arr.push(redo_prev_text.pop());
			render_gametext();
			sync_multiplayer(false);
		}
	}
}

function btn_retry() {
	if (
		!document.getElementById("btnsend").disabled && pending_response_id == "" && (gametext_arr.length > 1
			|| (gametext_arr.length > 0 && (current_memory != "" || current_anote != "")))
	) {
		warn_unsaved = true;
		last_reply_was_empty = false;
		let boxtextstash = document.getElementById("input_text").value;
		document.getElementById("input_text").value = "";
		let temp = gametext_arr[gametext_arr.length - 1];
		redo_prev_text = [];
		let erased_last = false;
		if (!retry_preserve_last) {
			gametext_arr.pop();
			erased_last = true;
		}
		retry_preserve_last = false;
		let last_retry_stack_temp = retry_prev_text;
		prepare_submit_generation();
		retry_in_progress = erased_last;
		retry_prev_text = last_retry_stack_temp;
		retry_prev_text.push(temp);
		if (retry_prev_text.length > 2) {
			retry_prev_text.shift();
		}
		redo_arr = [];
		document.getElementById("input_text").value = boxtextstash;
	}
}

var groupchat_removals = []; //list of names removed from groupchat
function show_groupchat_select() {
	document.getElementById("groupselectcontainer").classList.remove("hidden");
	let gs = ``;
	if (localsettings.opmode == 3) {
		if (localsettings.chatopponent != "" && localsettings.chatopponent.includes("||$||")) {
			gs = `Selected participants will reply randomly, unless you address them directly by name.`
				+ `<br><br>Unselected participants will not reply in group chats.<br>`
				+ `<table style="width:90%; margin:8px auto;">`;
			let grouplist = localsettings.chatopponent.split("||$||");
			for (let i = 0; i < grouplist.length; ++i) {
				let show = !groupchat_removals.includes(grouplist[i]);
				gs += `<tr><td width='184px'><span style="vertical-align: middle;">` + grouplist[i] + `</span></td>`
					+ `<td width='24px'><button type="button" class="btn btn-primary widelbtn" id="widel0" onclick="impersonate_message(` + i
					+ `)">+</button></td>`
					+ `<td width='24px'><input type="checkbox" id="groupselectitem_` + i + `" style=" vertical-align: top;" `
					+ (show ? "checked" : "") + `></td></tr>`;
			}
			gs += `</table>`;
		} else if (localsettings.chatopponent != "") {
			gs = `You're having a one-on-one chat with <b>` + localsettings.chatopponent + `</b>.<br><br>`
				+ `<a href='#' class='color_blueurl' onclick='hide_popups();display_settings()'>Turn it into a <b>group chat</b> by <b>adding more AI characters</b> (one per line)</a>.<br><br>`
				+ `<a href='#' class='color_blueurl' onclick='impersonate_message(0)'>Impersonate ` + localsettings.chatopponent
				+ ` speaking as them</a>`;
		}
	} else {
		gs = `You're in Instruct Mode.<br><br>`
			+ `<a href='#' class='color_blueurl' onclick='impersonate_message(0)'>Impersonate the AI Assistant</a>`;
	}

	gs += `<br><a href='#' class='color_blueurl' onclick='impersonate_user()'>Make the AI write a response as me (for 1 turn)</a>`;

	document.getElementById("groupselectitems").innerHTML = gs;
}
var is_impersonate_user = false;
function impersonate_user() {
	hide_popups();
	let willsubmit = document.getElementById("btnsend").disabled ? false : true;
	if (willsubmit) {
		document.getElementById("input_text").value = "";
		document.getElementById("cht_inp").value = "";
		document.getElementById("corpo_cht_inp").value = "";
		is_impersonate_user = true;
		prepare_submit_generation();
	} else {
		msgbox("Backend is generating or busy - try again later");
	}
}
function impersonate_message(index) {
	hide_popups();

	if (localsettings.opmode == 3) {
		let grouplist = localsettings.chatopponent.split("||$||");
		let target = grouplist[index];
		inputBox("Add a messsage speaking as " + target + ":", "Impersonate " + target, "", target + " says...", () => {
			let userinput = getInputBoxValue();
			userinput = userinput.trim();
			if (userinput != "") {
				gametext_arr.push("\n" + target + ": " + userinput);
				render_gametext();
			}
			hide_popups();
		}, false);
	} else {
		inputBox("Add a messsage speaking as the AI Assistant:", "Impersonate the AI", "", "The AI says...", () => {
			let userinput = getInputBoxValue();
			userinput = userinput.trim();
			if (userinput != "") {
				let txt = "";

				if (localsettings.inject_timestamps) {
					userinput = get_current_timestamp() + " " + userinput;
				}

				//append instruction for instruct mode
				txt = get_instructendplaceholder() + userinput;

				gametext_arr.push(txt);
				render_gametext();
			}
			hide_popups();
		}, false);
	}
}
function add_another_participant() {
	inputBox(
		"Turn it into a group chat by adding more AI characters.\n\nInput name of additional character:",
		"Add Another Participant",
		"",
		"[Enter Character Name]",
		() => {
			let userinput = getInputBoxValue();
			userinput = userinput.trim();
			if (userinput != "") {
				if (document.getElementById("chatopponent").value == "") {
					document.getElementById("chatopponent").value = userinput;
				} else {
					document.getElementById("chatopponent").value += "||$||" + userinput;
					handle_bot_name_onchange();
				}
			}
		},
		false,
	);
}
function confirm_groupchat_select() {
	groupchat_removals = [];
	if (localsettings.chatopponent != "") {
		let grouplist = localsettings.chatopponent.split("||$||");
		for (let i = 0; i < grouplist.length; ++i) {
			let sel = document.getElementById("groupselectitem_" + i);
			if (sel && !sel.checked) {
				groupchat_removals.push(grouplist[i]);
			}
		}
		hide_popups();
		if (groupchat_removals.length == grouplist.length) {
			msgbox("You need to select at least one group chat participant!");
			groupchat_removals = [];
		}
	} else {
		hide_popups();
	}
}

function toggleTopNav() {
	var x = document.getElementById("navbarNavDropdown");
	if (x.classList.contains("collapse")) {
		x.classList.remove("collapse");
	} else {
		x.classList.add("collapse");
	}
}
function closeTopNav() {
	var x = document.getElementById("navbarNavDropdown");
	x.classList.add("collapse");
}

// Clamp number between two values
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const cleannum = function(val, min, max) {
	let v = isNaN(val) ? 0 : val;
	return clamp(v, min, max);
};
function sanitizeAlphanumeric(str) {
	return str.replace(/[^a-zA-Z0-9]/g, "");
}
const stableSort = (arr, compare) => {
	return arr.map((item, index) => ({ item, index }))
		.sort((a, b) => compare(a.item, b.item) || a.index - b.index)
		.map(({ item }) => item);
};
