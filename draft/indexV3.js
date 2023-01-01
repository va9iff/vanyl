export const v = (strings, ...args) => ({ strings, args })

let handlers = {
	text:{
		init (mark){},
		sync (mark){},
		update (mark){}
	}
}

let newMark = (arg, data) => ({arg,data})

export class Syncer{
	marks = []
	result = ""
	constructor(vFun, el){
		let { strings, args } = vFun()
		let stringLast = strings.at(-1)
		for (let [i, arg] of args.entries()) {
			let string = strings[i]
			let mark 
			this.marks[i] = newMark(arg)

		}
	}
	update(){
		// for
	}
}

export function sync(vFun, el) {
}

// it's an arg
export let text = textArg => ({
	handler: "text",
})


// v`that's an ${212} test for ${[213,1312]} so yeah`
