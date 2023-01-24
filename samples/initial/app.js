import {Vanyl, vanyl, v, create, Lazy, unique} from '/src/index.js'

let a1 = v`<div>hi it's ${unique()} <button>${'dodoo'} ${'the' + unique()}</button></div>`
let a2 = v`<div>hi it's ${unique()} <button>${'dodoo'} ${'the' + unique()}</button></div>`
let b1 = v`<div>hi it's not ${unique()} <button>${'dodoo'} ${'the' + unique()}</button></div>`

// console.log(a1.isSame(a2))
// console.log(a1.isSame(b1))


let query = (..._)=>document.querySelector(..._)

let
	ctn = query('[ctn]'),
	idx = query('[idx]'),
	add = query('[add]'),
	del = query('[del]'),
	arr= [
		{val:1, key:1},
		{val:213, key:213},
		{val:Math.random(), key:Math.random()},
		{val:124, key:"joooooooooo", keep: true},
		{val:1, key:12}
		]

let state = {
	value: "goes like ",
	disabled: false,
	data1: 212
}

// props isn't useful at the time. but we will implement a way to render from 
// vResult. so it will be usable like v`<a>${myView(props)}</a>`


let users = [
	{key:'1', username: 'asf', password: '42323'},
	{key:'2', username: 'jhon', password: 'jj'},
	{key:'3', username: 'aslfdjk', password: 'ljadklfajlfdsk'},
	{key:'4', username: '', password: '5'},

]

let userComponent = props => v`
	<div ${{key: props.key}}>
		<input type="text" ${{value:props.username}}>
		password: <u>${props.password}</u>
	</div>
`

let inputText = new Lazy("isn't set")

/*
	or maybe 
	let inputText = new Lazy("isn't set yet")
	v`<input ${{"~value":inputText}} type="text">
	<div>${inputText.now}</div>
	<button ${{"@click": e=> inputText.now = ""}}>reset</button>`

*/

let r = ()=>Math.random()

let myView = props => {
	let vicka = Math.random()>0.5 ? v`<span><input ${{"~value":inputText}} type="text"><b>prr</b><i>prr</i><u>-${inputText.now}-${Math.random()}</u></span>` : v`<span>bip bop ${Math.random()}<input type="text"></span>`
	// console.log(vicka.strings[0])

	return v`
<div ${{j:9}}>
	<p>
	  that's an ${state.data1} test for ${5487} so yeah
	</p>
	and here's an input 
	<input type="text" 
	${{'disabled': state.disabled}}
	${{value: state.value}}>
	<button ${{
		"@click"(){
			alert("alerteddd")
		}
	}}>alerts</button>
	nested ${vicka}
	lets put a list
	keyless <br>${[r(),r(),r(),r(),r(),r()].map(i=>v`<i>${parseInt(i*100)+';'}</i>`)}
	<ol>
		${arr.map((prop,i)=>v`<li ${{
			key: prop.key, 
			keep:prop.keep || Math.random()>0.5, 
			".highlight": Math.random()>0.7
		}}><u>${i}-</u>${prop.key}~${prop.val} <input type="text"></li>`)}
	</ol>
	${users.map(props=>userComponent(props))}
	this will be displayed, but,
</div>
<i>this won't</i>
and yes it works
`
}

let div = create(myView)
document.body.appendChild(div.topElement)

setInterval(()=>{
	state.value += (Math.random()+'')[3]
	state.disabled = !state.disabled
	state.data1++
	// console.log(arr)
	div.update()
}, 1000)



add.onclick = e => {
	ctn.value += '1'
	arr.splice(idx.value, 0, {val:ctn.value, key:ctn.value}).value
	div.update()
	// console.log(arr)
}
del.onclick = e => {
	arr.splice(idx.value, 1).value; 
	div.update()
	// console.log(arr)
}


setTimeout(()=>{
	add.click()	
	add.click()	
	add.click()	
	del.click()
	del.click()
	del.click()
}, 30)

