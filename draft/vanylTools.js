



import {sync} from '/src/index.js'



let text = (text) => {
	handler: text,
	text: text
}

class Mark{
	writes = ''
}

class Text extends Mark{
	constructor(text){
		this.uid = unique()
		this.writes = text
	}
	sync(text){
		this.element = //what to query
	}
	static getDirective(){
		return (...args) => {arguments: args, cls:this}
	}
}

/*// the first time, args will be the init functions, after they're update
let myView = ({v, sync ,text, attr, on}) => v`
	lkjds osjfoa ${mark("text",vvaba+'px')}
	<button ${mark("on",'click', e=>alert())} ${mark("attr",'disabled', isDisabled)}></button>
`*/


// the first time, args will be the init functions, after they're update
let myView = ({v, sync ,text, attr, on}) => v`
	lkjds osjfoa ${text(vvaba+'px')}
	<button ${on('click', e=>alert())} ${attr('disabled', isDisabled)}></button>
`


// the first time, args will be the init functions, after they're update
let myView = ({v, sync ,text, attr, on}) => v`
	lkjds osjfoa ${text(vvaba+'px')}
	<button ${on.click(e=>alert())} ${attr.disabled(isDisabled)}></button>
`

// when we call sync, a new object is being created. it keeps track of
// everything as v can only give html results. so it decides to
// create new marks, or calling update methods of them.
let update = sync(myView, document.querySelector('#main'))




// this will take the first element. so you can manually append this element to
// whereever you want. but grabs (queries) only the first element.
render(myView)