import {Vanyl, v, create, unique} from './index.js'

class VanylElement extends HTMLElement {
	constructor(){
		super()
		console.log('custom element has been constructed')
	}
	connectedCallback() {
		console.log('connected to dom')
	}

}

customElements.define("vanyl-element", VanylElement/*, { extends: "p" }*/);



export {Vanyl, v, create, unique, VanylElement}
