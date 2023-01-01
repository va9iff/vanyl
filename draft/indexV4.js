export const v = (strings, ...args) => ({ strings, args })

class Text{
	intit(string, payload){

		return {
			writes: string
		}
	}
	sync(){}
	update(){}
}

export class Syncer{
	marks = []
	initMarks(){
		let result = ''
		let { strings, args } = vFun()
		let stringLast = strings.at(-1)
		for (let [i, arg] of args.entries()) {
			let string = strings[i]
			let mark = new arg.cls()
			result += mark.init(arg.payload)
		}
		return result
	}
	constructor(vFun, el){
		el.innerHTML = this.initMarks()
	}
	update(){
		// for
	}
}

export function sync(vFun, el) {
}

// it's an arg
export let text = (...payload) => ({cls:Text, payload: payload})


// v`that's an ${212} test for ${[213,1312]} so yeah`
