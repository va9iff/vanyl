import {VanylElement, v} from '/src/index.js'

export function defineFunctional(tagName, renderFunction) {
	let ElementClass = class extends VanylElement{}
	ElementClass.prototype.render = renderFunction
	ElementClass.define(tagName)
}

// define functional element setter wrapper
export const tag = new Proxy({}, {
	set(_, prop, val){
		defineFunctional(prop, val, {})
		return true
	}
})
