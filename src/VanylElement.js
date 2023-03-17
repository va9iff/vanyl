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
	connectedCallback() {
		this.vanyl = new VanylEmbedded(v`<i>dado${Math.random()}</i>`, {root: this})
		// this.vanyl.datas = marked[1]
		// this.appendChild(this.vanyl.root)
		this.onclick = e=> this.vanyl.updateWith(v`<i>dado${Math.random()}</i>`)
		console.log('connected to dom')
	}

}

customElements.define("vanyl-element", VanylElement/*, { extends: "p" }*/);



export {Vanyl, v, create, unique, VanylElement}
