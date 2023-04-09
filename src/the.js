export function assign(assigning, key, val, middle = {}) {
	const _key = key.slice(1)
	if (middle.hasOwnProperty(key)) {
		middle[key].apply(assigning, [val])
	} else if (key[0] == ":") {
		let innerProperty = assigning[_key]
		for (const [innerKey, innerVal] of Object.entries(val))
			assign(innerProperty, innerKey, innerVal)
	} else if (key[0] == ".") {
		if (val) assigning.classList.add(_key)
		else assigning.classList.remove(_key)
	} else if (key[0] == "$") {
		assign(assigning, _key, val, middle)
	} else {
		assigning[key] = val
	}
}

// "self" is whatever we're updating (syncing) to. also it's bound to "this".
export class The {
	firstInit = true
	// middle = domHelper
	middle = {}
	propsFun(the = this, self = this.self){
		// this==self; this.the == the
		return {}
	}
	constructor(self, propsFun = ()=>({}), middle = this.middle) {
		Object.assign(this, { self, propsFun, middle })
		/*const the = this
		Object.defineProperty(self, 'the', { get: ()=> the})*/
		// self.update = (...args) => this.update(...args)
	}
	core(props) {
		this.props = props
		for (const [key, val] of Object.entries(props)) {
			const _key = key.slice(1)

			if (this.firstInit) {
				if (key[0] == "@") this.self.addEventListener(_key, val)
				else assign(this.self, key, val, this.middle)
			}
			/* the initial run for $key will be in first init's assign.
			as it chops the dollar sign and assigns it. without else, it'd run
			twice in first init*/
			else if (key[0] == "$") {
				assign(this.self, _key, val, this.middle)
			}
		}
	}
	updateWith(props){
		this.core(props)
		this.firstInit = false
	}
	update() {
		const props = this.propsFun.apply?.(this.self, [this, this.self]) || this.propsFun()
		this.core(props)
	}
	set before(props) {
		this.core(props)
	}
}

