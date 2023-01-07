import {Vanyl, v, create, unique} from '/src/index.js'

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
		{val:124, key:124},
		{val:1, key:12}
		]

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
}, 300)

let state = {
	value: "goes like ",
	disabled: false,
	data1: 212
}

// props isn't useful at the time. but we will implement a way to render from 
// vResult. so it will be usable like v`<a>${myView(props)}</a>`


let myView = props => {
	let vicka = Math.random()>0.5 ? v`<span><b>prr</b><i>prr</i><u>${Math.random()}</u></span>` : v`<span>bip bop</span>`
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
	<button ${{onclick: ()=>alert()}}>alerts</button>endendend
	lets put a list
	nested vresult ${vicka}
	<ol>
		WEIRD BUG - WE CAN'T USE DYNAMIC PROPERTIES ON FIRST ELEMENT BECAUSE OF .grabFirstChild()
		it will query the element and won't know that it has in it. so we need to add it too.
		${arr.map((prop,i)=>v`<li ${{key: prop.key}}><u>${i}-</u>${prop.val} <input type="text"></li>`)}
	</ol>
	this will be displayed, but,
</div>
<i>this won't</i>
and yes it works
`
}

let div = create(myView)
document.body.appendChild(div.topElement)
// div.update()

setInterval(()=>{
	state.value += (Math.random()+'')[3]
	state.disabled = !state.disabled
	state.data1++
	// console.log(arr)
	div.update()
}, 1000)

