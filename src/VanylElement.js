import {Vanyl, v, create, unique, markHtml} from './index.js'

class VanylEmbedded extends Vanyl {
	// goes before constructors. for assign options.
	opts(opts){
		this.root = opts.root
	}
	getRoot(htmlString){
		this.root.innerHTML = this.html // assign marked things to query
		return this.root
	}
}

class VanylElement extends HTMLElement {
	constructor(){
		super()
		console.log('custom element has been constructed')
	}
	render(){
		return v`<i>dado${Math.random()}</i><b>fasd</b>`
	}
	hasInit = false
	init(){
		this.hasInit = true
		this.vanyl = new VanylEmbedded(this.render(), { root: this })

	}
	update() {
		this.vanyl.updateWith(this.render())
	}
	connectedCallback() {
		console.log('connected to dom')
		if (!this.hasInit) return this.init()
	}


	// --
	static define(tagName, opts){
		customElements.define(tagName, this, opts);
	}
}


// customElements.define("vanyl-element", VanylElement/*, { extends: "p" }*/);

export const tag = new Proxy({}, {
	set(_, prop, val){
		customElements.define(prop, val, {});
		return true
	}
})

tag["vanyl-element"] = VanylElement

export {Vanyl, v, create, unique, VanylElement}
