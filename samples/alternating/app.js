import {Vanyl, v, create} from '/src/index.js'

const r = ()=>Math.random()
let arg = null
let arr = [
	v`<p ${{key: 9}}>and <input type="text"> this list</p>`,
	v`<p ${{key: 8}}>asd <input type="text">lfkj</p>`,
	v`<p ${{key: 0}}>KEYLESS <input type="text">ji</p>`,
	]
let arr2 = [
	v`<p ${{key: 99}}>a2nd <input type="text"> this list</p>`,
	v`<p ${{key: 88}}>asasdfd <input type="text">lfkj</p>`,
	v`<p ${{key: 2}}>üeafsdasd <input type="text">lfkj</p>`,
	v`<p ${{key: 84}}>asadsvd <input type="text">lfkj</p>`,
	v`<p>keyless plain element <input type="text">ji</p>`,
	]
let mainView = ()=> v`
	<div>
		<button ${{"@click":e=>{
			arg = v`<p>that's a vResult with random${r()} value. <br> 
			check this input out. does it keep value after it's gone - <input type="text"> <br>
			apperantly... it doesn't go :D <br>
			because we haven't implemented alternating updates yet. <br>
			it's just updading independedly. we have to check for removes if it doesn't event match. read the comment (1)
			here <button ${{"@click":e=>alert("you clicked")}}>click me</button></p>`
			main.update()
		}
	}}>vResult</button>
	<button ${{"@click":e=>{
			arg = "Simple String. Wonderful"
			main.update()
		}
	}}>String</button>
	<button ${{"@click":e=>{
			arg = arr
			main.update()
		}
	}}>List</button>
	<button ${{"@click":e=>{
			arg = arr2
			main.update()
		}
	}}>List2</button>
		here's the result:
		${arg}
	</div>
`


/*
	(1) the first performant way that comes to my mind to use a "remembers" property.
	if it remembers that this data was vResult last time, it should update it again.

	but there's better ways. see, it's only `._vResult_.vanyl` that's shown.
	so we can put a vResult.vanyl.?remove.?()
*/


let main = create(mainView)
document.body.appendChild(main.root)