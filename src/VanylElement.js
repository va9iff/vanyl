import {Vanyl, v, create, unique, markHtml} from './index.js'

class VanylElement extends HTMLElement {
	constructor(){
		super()
	}
	render(){
		return v`<p>~VanylElement</p>`
	}
	hasInit = false
	init(){
		this.hasInit = true

		let vr = this.render()
		this.innerHTML = markHtml(vr)[0]
		this.vanyl = new Vanyl(vr, { root: this })

	}
	update() {
		this.vanyl.updateWith(this.render())
	}
	connectedCallback() {
		console.log('connected to dom')
		if (!this.hasInit) return this.init()
	}
	static define(tagName, opts){
		customElements.define(tagName, this, opts);
	}
}

VanylElement.define('vanyl-element')

export {Vanyl, v, create, unique, VanylElement}
