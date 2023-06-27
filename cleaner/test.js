import { VanylElement, v } from "./vanyl.js"

class MyEl extends VanylElement{
	render(){
		return v`<b>hi ${"sup"} ${"sup"}</b>`
	}
}

customElements.define("hi-tag", MyEl);

document.body.appendChild(document.createElement("hi-tag"))
